"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ImportRepoForm() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Failed to import repository.");
        return;
      }

      setRepoUrl("");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="repoUrl" className="text-sm font-medium">
          GitHub repository URL
        </label>
        <input
          id="repoUrl"
          name="repoUrl"
          type="url"
          required
          placeholder="https://github.com/owner/repo"
          value={repoUrl}
          onChange={(event) => setRepoUrl(event.target.value)}
          className="input"
        />
        <p className="text-xs text-muted">
          Accepts HTTPS, SSH, or owner/repo shorthand.
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary w-fit"
      >
        {isSubmitting ? "Importing…" : "Import repository"}
      </button>

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
