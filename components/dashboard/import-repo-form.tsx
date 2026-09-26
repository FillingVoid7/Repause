"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { validateGitHubUrl } from "@/lib/validateGitHubUrl";

export function ImportRepoForm() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateGitHubUrl(repoUrl);

    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    const shorthand = `${validation.data.owner}/${validation.data.repo}`;

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: shorthand }),
      });

      const message = await getErrorMessage(response);

      if (!response.ok) {
        setError(message);
        if (response.status === 409) {
          router.refresh();
        }
        return;
      }

      toast.success(
        `${shorthand} imported. Review the context, then generate your narrative.`,
      );
      setRepoUrl("");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="group relative flex flex-1 items-center rounded-xl border border-[var(--border)] bg-[var(--card)] transition-colors focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/20">
          <input
            id="repoUrl"
            name="repoUrl"
            type="text"
            inputMode="url"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            required
            placeholder="https://github.com/owner/repository"
            aria-label="GitHub repository URL"
            aria-describedby="repoUrl-hint"
            value={repoUrl}
            onChange={(event) => {
              setRepoUrl(event.target.value);
              if (error) setError(null);
            }}
            className="w-full bg-transparent px-3.5 py-2.5 font-mono text-sm outline-none placeholder:font-sans placeholder:text-muted/70"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary shrink-0 px-5"
        >
          {isSubmitting ? (
            <>
              <span
                aria-hidden="true"
                className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />
              Importing
            </>
          ) : (
            "Import"
          )}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p id="repoUrl-hint" className="text-xs text-muted">
          Public repositories. Paste the whole link, an SSH remote, or{" "}
          <code>owner/repo</code>.
        </p>
        {error ? (
          <p role="alert" className="text-xs font-medium text-danger">
            {error}
          </p>
        ) : null}
      </div>
    </form>
  );
}

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const text = await response.text();
    const data = text ? (JSON.parse(text) as { error?: string }) : null;
    return (data?.error ?? text) || "Failed to import repository.";
  } catch {
    return "Failed to import repository.";
  }
}
