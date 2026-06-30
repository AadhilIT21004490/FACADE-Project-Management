"use client";

import { useState } from "react";
import {
  Link2,
  Unlink,
  Loader2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { CommitFeed } from "./CommitFeed";

// GitHub doesn't ship in this lucide-react version, so we use the official SVG
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

interface GithubTabProps {
  project: any;
  onProjectUpdate: (updated: any) => void;
}

export function GithubTab({ project, onProjectUpdate }: GithubTabProps) {
  const [repoInput, setRepoInput] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [linking, setLinking] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);

  const isLinked = !!project.githubRepo;

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoInput.trim()) {
      toast.error("Please enter a repository (e.g. owner/repo)");
      return;
    }

    setLinking(true);
    try {
      const res = await fetch(`/api/projects/${project._id}/github`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo: repoInput.trim(),
          token: tokenInput.trim() || undefined,
        }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success("Repository linked successfully!");
        // Normalize repo the same way the server does, then merge into
        // project state — this ensures the UI switches even if Mongoose's
        // cached schema strips the new fields from the response.
        const cleanedRepo = repoInput
          .trim()
          .replace(/^https?:\/\/github\.com\//i, "")
          .replace(/\.git$/i, "")
          .trim();
        onProjectUpdate({
          ...project,
          ...(json.data || {}),
          githubRepo: cleanedRepo,
        });
        setRepoInput("");
        setTokenInput("");
      } else {
        toast.error(json.error || "Failed to link repository");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = async () => {
    setUnlinking(true);
    try {
      const res = await fetch(`/api/projects/${project._id}/github`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (json.success) {
        toast.success("Repository disconnected.");
        // Explicitly clear githubRepo so the UI switches back to the link form
        onProjectUpdate({
          ...project,
          ...(json.data || {}),
          githubRepo: undefined,
          githubToken: undefined,
        });
        setShowUnlinkConfirm(false);
      } else {
        toast.error(json.error || "Failed to disconnect");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setUnlinking(false);
    }
  };

  // ─── Not linked: show link form ───────────────────────────────────────
  if (!isLinked) {
    return (
      <div className="animate-slide-up max-w-2xl mx-auto">
        <div className="glass p-8 rounded-2xl border border-border/50 shadow-sm">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-4 border border-primary/20">
              <GithubIcon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">Connect GitHub Repository</h3>
            <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
              Link a GitHub repository to this project to track commits,
              monitor development progress, and keep stakeholders informed —
              all from this dashboard.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLink} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Repository <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  placeholder="owner/repo  or  https://github.com/owner/repo"
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-primary outline-none transition-colors placeholder:text-muted-foreground/50"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground/60 mt-1.5">
                Paste the full URL or just the owner/repo format.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                <span className="flex items-center gap-1.5">
                  Personal Access Token
                  <span className="text-xs font-normal text-muted-foreground">
                    (optional)
                  </span>
                </span>
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-primary outline-none transition-colors placeholder:text-muted-foreground/50"
                />
              </div>
              <p className="text-xs text-muted-foreground/60 mt-1.5">
                Required for private repositories. Needs <code className="text-primary/80">repo</code> scope.
              </p>
            </div>

            <button
              type="submit"
              disabled={linking || !repoInput.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {linking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Validating & Linking…
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  Connect Repository
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── Linked: show commit feed ─────────────────────────────────────────
  return (
    <div className="animate-slide-up space-y-4">
      {/* Linked repo header */}
      <div className="glass p-4 rounded-2xl border border-border/50 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center border border-primary/20">
            <GithubIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <a
              href={`https://github.com/${project.githubRepo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-sm hover:text-primary transition-colors inline-flex items-center gap-1.5"
            >
              {project.githubRepo}
              <ExternalLink className="w-3 h-3" />
            </a>
            <p className="text-xs text-muted-foreground">
              Linked repository — commits are synced every 2 minutes
            </p>
          </div>
        </div>

        {/* Disconnect */}
        {!showUnlinkConfirm ? (
          <button
            onClick={() => setShowUnlinkConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-red-400 hover:border-red-400/30 transition-colors"
          >
            <Unlink className="w-3.5 h-3.5" />
            Disconnect
          </button>
        ) : (
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="flex items-center gap-1.5 text-xs text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              Are you sure?
            </div>
            <button
              onClick={handleUnlink}
              disabled={unlinking}
              className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              {unlinking ? "Removing…" : "Yes, Disconnect"}
            </button>
            <button
              onClick={() => setShowUnlinkConfirm(false)}
              className="px-3 py-1.5 rounded-xl border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Commit Feed */}
      <div className="glass p-5 rounded-2xl border border-border/50 shadow-sm">
        <CommitFeed projectId={project._id} repo={project.githubRepo} />
      </div>
    </div>
  );
}
