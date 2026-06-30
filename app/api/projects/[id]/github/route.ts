import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Project } from "@/models";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/logActivity";

/**
 * POST — Link a GitHub repository to a project.
 * Body: { repo: "owner/repo", token?: "ghp_..." }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { repo, token } = await request.json();

    if (!repo || typeof repo !== "string") {
      return NextResponse.json(
        { success: false, error: "Repository is required (format: owner/repo)" },
        { status: 400 }
      );
    }

    // Normalise — strip leading https://github.com/ if pasted as URL
    const cleaned = repo
      .replace(/^https?:\/\/github\.com\//i, "")
      .replace(/\.git$/i, "")
      .trim();

    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(cleaned)) {
      return NextResponse.json(
        { success: false, error: "Invalid repository format. Use owner/repo." },
        { status: 400 }
      );
    }

    // Validate the repo (and token) by doing a test fetch to GitHub
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const ghRes = await fetch(`https://api.github.com/repos/${cleaned}`, {
      headers,
      cache: "no-store",
    });

    if (!ghRes.ok) {
      const status = ghRes.status;
      if (status === 404) {
        return NextResponse.json(
          {
            success: false,
            error: "Repository not found. Check the name or provide a valid token for private repos.",
          },
          { status: 404 }
        );
      }
      if (status === 401 || status === 403) {
        return NextResponse.json(
          { success: false, error: "Invalid or expired GitHub token." },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { success: false, error: "GitHub API error. Please try again later." },
        { status: 502 }
      );
    }

    await connectDB();

    const project = await Project.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: { githubRepo: cleaned, githubToken: token || "" } },
      { new: true }
    );

    if (!project)
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );

    logActivity({
      projectId: project._id,
      action: "GitHub Linked",
      description: `Repository "${cleaned}" was linked to the project.`,
    });

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error("[github/link]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE — Disconnect the linked GitHub repository.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectDB();

    const project = await Project.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $unset: { githubRepo: "", githubToken: "" } },
      { new: true }
    );

    if (!project)
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );

    logActivity({
      projectId: project._id,
      action: "GitHub Disconnected",
      description: "GitHub repository was unlinked from the project.",
    });

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error("[github/unlink]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
