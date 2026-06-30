import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Project } from "@/models";
import { auth } from "@/lib/auth";

/**
 * GET — Fetch commits for the linked GitHub repository.
 * Query params:
 *   page     — page number (default 1)
 *   per_page — commits per page (default 20, max 100)
 *   branch   — branch name (omit to use the repo's default branch)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectDB();

    const project = await Project.findOne({ _id: id, userId: session.user.id });
    if (!project)
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );

    if (!project.githubRepo) {
      return NextResponse.json(
        { success: false, error: "No GitHub repository linked to this project." },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const perPage = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("per_page") || "20", 10))
    );
    let branch = searchParams.get("branch") || "";

    // Build headers for GitHub API
    const ghHeaders: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (project.githubToken) {
      ghHeaders["Authorization"] = `Bearer ${project.githubToken}`;
    }

    // If no branch specified, fetch the repo's default branch from GitHub
    if (!branch) {
      try {
        const repoRes = await fetch(
          `https://api.github.com/repos/${project.githubRepo}`,
          { headers: ghHeaders, cache: "no-store" }
        );
        if (repoRes.ok) {
          const repoData = await repoRes.json();
          branch = repoData.default_branch || "main";
        } else {
          branch = "main"; // fallback
        }
      } catch {
        branch = "main"; // fallback on network error
      }
    }

    const ghUrl = `https://api.github.com/repos/${project.githubRepo}/commits?sha=${encodeURIComponent(branch)}&page=${page}&per_page=${perPage}`;

    const ghRes = await fetch(ghUrl, {
      headers: ghHeaders,
      cache: "no-store",
    });

    if (!ghRes.ok) {
      const status = ghRes.status;

      // Try to parse GitHub's error body for better diagnostics
      let ghErrorMsg = "";
      try {
        const errBody = await ghRes.json();
        ghErrorMsg = errBody.message || "";
      } catch {
        // ignore parse errors
      }

      console.error(
        `[github/commits] GitHub API returned ${status}: ${ghErrorMsg}`
      );

      if (status === 401 || status === 403) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Unable to sync with GitHub right now. Your token may have expired or been revoked. Please check your credentials.",
          },
          { status: 401 }
        );
      }
      if (status === 404 || status === 422) {
        return NextResponse.json(
          {
            success: false,
            error: `Branch "${branch}" not found on this repository. ${ghErrorMsg}`,
          },
          { status: 404 }
        );
      }
      if (status === 409) {
        // Empty repo
        return NextResponse.json({
          success: true,
          data: [],
          pagination: { page, perPage, hasMore: false },
          branch,
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: `GitHub API error (${status}): ${ghErrorMsg || "Unable to sync with GitHub right now. Please try again later."}`,
        },
        { status: 502 }
      );
    }

    // Extract rate-limit info for diagnostics
    const rateLimitRemaining = ghRes.headers.get("x-ratelimit-remaining");
    const rateLimitReset = ghRes.headers.get("x-ratelimit-reset");

    const commits = await ghRes.json();

    // Shape the response to only include what we need
    const shaped = commits.map((c: any) => ({
      sha: c.sha,
      shortSha: c.sha.substring(0, 7),
      message: c.commit.message,
      author: {
        name: c.commit.author?.name || "Unknown",
        login: c.author?.login || null,
        avatar: c.author?.avatar_url || null,
      },
      date: c.commit.author?.date || c.commit.committer?.date,
      url: c.html_url,
    }));

    // The Link header tells us if there are more pages
    const linkHeader = ghRes.headers.get("link") || "";
    const hasMore = linkHeader.includes('rel="next"');

    return NextResponse.json({
      success: true,
      data: shaped,
      pagination: { page, perPage, hasMore },
      branch,
      rateLimit: {
        remaining: rateLimitRemaining ? parseInt(rateLimitRemaining, 10) : null,
        resetAt: rateLimitReset
          ? new Date(parseInt(rateLimitReset, 10) * 1000).toISOString()
          : null,
      },
    });
  } catch (error) {
    console.error("[github/commits]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
