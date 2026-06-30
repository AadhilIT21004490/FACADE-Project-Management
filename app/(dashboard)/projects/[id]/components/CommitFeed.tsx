"use client";

import { useEffect, useState, useCallback } from "react";
import {
  GitCommitHorizontal,
  ExternalLink,
  Loader2,
  AlertTriangle,
  ChevronDown,
  RefreshCw,
  GitBranch,
  User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Commit {
  sha: string;
  shortSha: string;
  message: string;
  author: {
    name: string;
    login: string | null;
    avatar: string | null;
  };
  date: string;
  url: string;
}

interface CommitFeedProps {
  projectId: string;
  repo: string;
}

export function CommitFeed({ projectId, repo }: CommitFeedProps) {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [branch, setBranch] = useState("");
  const [branchInput, setBranchInput] = useState("");
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);

  const fetchCommits = useCallback(
    async (pageNum: number, branchName: string, append = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      try {
        const branchParam = branchName
          ? `&branch=${encodeURIComponent(branchName)}`
          : "";
        const res = await fetch(
          `/api/projects/${projectId}/github/commits?page=${pageNum}&per_page=20${branchParam}`
        );
        const json = await res.json();

        if (!json.success) {
          setError(json.error || "Failed to fetch commits.");
          if (!append) setCommits([]);
          return;
        }

        // Sync the detected branch from the server on first load
        if (json.branch && !branchName) {
          setBranch(json.branch);
          setBranchInput(json.branch);
        }

        if (append) {
          setCommits((prev) => [...prev, ...json.data]);
        } else {
          setCommits(json.data);
        }

        setHasMore(json.pagination?.hasMore ?? false);
      } catch {
        setError(
          "Unable to sync with GitHub right now. Please check your connection or credentials."
        );
        if (!append) setCommits([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [projectId]
  );

  useEffect(() => {
    setPage(1);
    fetchCommits(1, branch, false);
  }, [branch, fetchCommits]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCommits(nextPage, branch, true);
  };

  const handleBranchSwitch = () => {
    const trimmed = branchInput.trim();
    if (trimmed && trimmed !== branch) {
      setBranch(trimmed);
      setShowBranchDropdown(false);
    } else {
      setShowBranchDropdown(false);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    fetchCommits(1, branch, false);
  };

  // Split first line from rest of commit message
  const parseMessage = (msg: string) => {
    const lines = msg.split("\n");
    return { title: lines[0], body: lines.slice(1).join("\n").trim() };
  };

  return (
    <div className="space-y-4">
      {/* Toolbar — Branch selector + Refresh */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Branch selector */}
        <div className="relative">
          <button
            onClick={() => setShowBranchDropdown(!showBranchDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-background text-sm font-medium hover:border-primary/40 transition-colors"
          >
            <GitBranch className="w-3.5 h-3.5 text-primary" />
            <span className="max-w-[140px] truncate">{branch || "detecting…"}</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>

          {showBranchDropdown && (
            <>
              {/* Backdrop to close dropdown */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowBranchDropdown(false)}
              />
              <div className="absolute top-full left-0 mt-2 z-20 w-64 p-3 rounded-xl border border-border bg-card shadow-xl animate-fade-in">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Switch branch
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={branchInput}
                    onChange={(e) => setBranchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleBranchSwitch()}
                    placeholder="e.g. develop"
                    className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:border-primary outline-none transition-colors"
                  />
                  <button
                    onClick={handleBranchSwitch}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Go
                  </button>
                </div>
                {/* Quick-switch presets */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {["main", "master", "develop", "staging"].map((b) => (
                    <button
                      key={b}
                      onClick={() => {
                        setBranchInput(b);
                        setBranch(b);
                        setShowBranchDropdown(false);
                      }}
                      className={`px-2 py-0.5 rounded-md text-xs font-medium border transition-colors ${
                        branch === b
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>

        {/* Repo badge */}
        <a
          href={`https://github.com/${repo}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          {repo}
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-400">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={handleRefresh}
              className="text-xs mt-1 underline hover:text-amber-300 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Fetching commits…</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && commits.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <GitCommitHorizontal className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-medium">No commits found</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            The branch &quot;{branch}&quot; may be empty or doesn't exist.
          </p>
        </div>
      )}

      {/* Commit list */}
      {!loading && commits.length > 0 && (
        <div className="space-y-1">
          {commits.map((commit, index) => {
            const { title, body } = parseMessage(commit.message);
            const timeAgo = (() => {
              try {
                return formatDistanceToNow(new Date(commit.date), {
                  addSuffix: true,
                });
              } catch {
                return commit.date;
              }
            })();

            return (
              <div
                key={`${commit.sha}-${index}`}
                className="group relative flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all duration-200"
              >
                {/* Timeline dot */}
                <div className="relative mt-1.5 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary/60 group-hover:bg-primary group-hover:scale-125 transition-all ring-4 ring-background" />
                  {index < commits.length - 1 && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-px h-[calc(100%+0.75rem)] bg-border/60" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <a
                      href={commit.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug"
                    >
                      {title}
                    </a>
                    <a
                      href={commit.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-mono font-medium hover:bg-primary/20 transition-colors"
                    >
                      {commit.shortSha}
                    </a>
                  </div>

                  {body && (
                    <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2 leading-relaxed">
                      {body}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    {/* Author */}
                    <span className="flex items-center gap-1.5">
                      {commit.author.avatar ? (
                        <img
                          src={commit.author.avatar}
                          alt={commit.author.name}
                          className="w-4 h-4 rounded-full ring-1 ring-border"
                        />
                      ) : (
                        <User className="w-3.5 h-3.5" />
                      )}
                      <span className="font-medium">
                        {commit.author.login || commit.author.name}
                      </span>
                    </span>

                    <span className="text-muted-foreground/40">•</span>

                    {/* Time */}
                    <span>{timeAgo}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More */}
      {!loading && hasMore && (
        <div className="flex justify-center pt-2 pb-4">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-muted/30 transition-all disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading…
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Load More Commits
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
