"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { NarrativeDisplay } from "@/components/projects/narrative-display";
import type { SerializedProject } from "@/types/project";

interface ProjectReviewStudioProps {
  project: SerializedProject;
}

export function ProjectReviewStudio({ project: initial }: ProjectReviewStudioProps) {
  const router = useRouter();
  const [project, setProject] = useState(initial);
  const [review, setReview] = useState(initial.review);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const showNarrativeError =
    project.narrativeStatus === "failed" && project.narrativeError;

  async function handleSaveReview() {
    setError(null);
    setSaveMessage(null);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review }),
      });

      const data = (await response.json()) as {
        error?: string;
        project?: SerializedProject;
      };

      if (!response.ok || !data.project) {
        setError(data.error ?? "Failed to save review context.");
        return;
      }

      setProject(data.project);
      setSaveMessage("Context saved.");
    } catch {
      setError("Network error while saving.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleGenerateNarrative() {
    setError(null);
    setSaveMessage(null);
    setIsGenerating(true);
    setProject((current) => ({
      ...current,
      narrativeStatus: "generating",
      narrativeError: undefined,
    }));

    try {
      const response = await fetch(`/api/projects/${project.id}/narrative`, {
        method: "POST",
      });

      const data = (await response.json()) as {
        error?: string;
        project?: SerializedProject;
      };

      if (!response.ok || !data.project) {
        setError(data.error ?? "Failed to generate narrative.");
        setProject((current) => ({
          ...current,
          narrativeStatus: "failed",
          narrativeError: data.error,
        }));
        return;
      }

      setProject(data.project);
      setError(null);
      router.refresh();
    } catch {
      setError("Network error during generation.");
      setProject((current) => ({
        ...current,
        narrativeStatus: "failed",
      }));
    } finally {
      setIsGenerating(false);
    }
  }

  const hasNarrative = project.narrativeStatus === "ready";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-muted hover:text-foreground"
          >
            ← Dashboard
          </Link>
          <p className="mt-2 text-sm font-semibold tracking-wide text-accent">
            PROJECT REVIEW
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {project.repoOwner}/{project.repoName}
          </h1>
          <p className="text-sm text-muted">
            Confirm stack details, fill context gaps, then generate your
            interview narrative.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSaveReview}
            disabled={isSaving || isGenerating}
            className="btn btn-secondary"
          >
            {isSaving ? "Saving…" : "Save context"}
          </button>
          <button
            type="button"
            onClick={handleGenerateNarrative}
            disabled={isGenerating || isSaving}
            className="btn btn-primary"
          >
            {isGenerating ? "Generating…" : "Generate narrative"}
          </button>
        </div>
      </header>

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {saveMessage ? (
        <p className="text-sm text-accent">{saveMessage}</p>
      ) : null}
      {showNarrativeError ? (
        <p className="text-sm text-danger" role="alert">
          {project.narrativeError}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <section className="card space-y-5 lg:sticky lg:top-6">
          <div>
            <h2 className="text-lg font-medium">Your context</h2>
            <p className="mt-1 text-sm text-muted">
              Adjust what Gemini should assume about your stack and interview
              target.
            </p>
          </div>

          <Field
            label="Stack & technologies"
            hint="Override or clarify languages/frameworks the scraper may have missed."
          >
            <textarea
              className="textarea"
              rows={4}
              value={review.stackDescription}
              onChange={(event) =>
                setReview({ ...review, stackDescription: event.target.value })
              }
              placeholder="e.g. Next.js 14 App Router, PostgreSQL via Prisma, deployed on Vercel…"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Target role">
              <input
                className="input"
                value={review.targetRole}
                onChange={(event) =>
                  setReview({ ...review, targetRole: event.target.value })
                }
                placeholder="e.g. Backend Engineer"
              />
            </Field>
            <Field label="Company tier">
              <select
                className="input"
                value={review.companyTier}
                onChange={(event) =>
                  setReview({ ...review, companyTier: event.target.value })
                }
              >
                <option value="">Select tier</option>
                <option value="startup">Startup</option>
                <option value="mid-size">Mid-size</option>
                <option value="faang">FAANG / Big Tech</option>
              </select>
            </Field>
          </div>

          <Field
            label="Job description (optional)"
            hint="Paste a JD to tailor tradeoffs and pitch emphasis."
          >
            <textarea
              className="textarea"
              rows={5}
              value={review.jobDescription}
              onChange={(event) =>
                setReview({ ...review, jobDescription: event.target.value })
              }
              placeholder="Paste relevant job requirements…"
            />
          </Field>

          <Field
            label="Additional context"
            hint="Decisions, constraints, or team context not visible in the repo."
          >
            <textarea
              className="textarea"
              rows={4}
              value={review.additionalContext}
              onChange={(event) =>
                setReview({ ...review, additionalContext: event.target.value })
              }
              placeholder="e.g. Solo project, 3-week hackathon, chose X over Y because…"
            />
          </Field>

          <RepoSignals project={project} />
        </section>

        {!hasNarrative ? (
          <section className="card space-y-5">
            <div>
              <h2 className="text-lg font-medium">Study deck</h2>
              <p className="mt-1 text-sm text-muted">
                Flashcards, architecture flow, and STAR — built for quick review.
              </p>
              <NarrativeStatus status={project.narrativeStatus} />
            </div>

            {project.narrativeStatus === "generating" ? (
              <p className="text-sm text-muted">
                Generating your study deck… this may take a moment if Gemini is
                under high demand.
              </p>
            ) : (
              <p className="text-sm text-muted">
                Save your context, then click &ldquo;Generate narrative&rdquo; to
                build flashcards and an architecture diagram.
              </p>
            )}
          </section>
        ) : null}
      </div>

      {hasNarrative ? (
        <section className="card space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium">Study deck</h2>
              <p className="mt-1 text-sm text-muted">
                Flashcards, architecture flow, and STAR — built for quick review.
              </p>
            </div>
            <NarrativeStatus status={project.narrativeStatus} />
          </div>
          <NarrativeDisplay narrative={project.narrative} />
        </section>
      ) : null}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
      {children}
    </div>
  );
}

function RepoSignals({ project }: { project: SerializedProject }) {
  const languageList = Object.entries(project.languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([lang, bytes]) => `${lang} (${bytes.toLocaleString()} bytes)`)
    .join(", ");

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--accent-subtle)]/40 p-4">
      <h3 className="text-sm font-medium">Scraped repo signals</h3>
      <dl className="mt-3 space-y-2 text-xs text-muted">
        <div>
          <dt className="font-medium text-foreground">Languages</dt>
          <dd>{languageList || "None detected"}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Files indexed</dt>
          <dd>{project.fileCount}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Recent commits</dt>
          <dd>{project.commitCount}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">README preview</dt>
          <dd className="mt-1 line-clamp-4 whitespace-pre-wrap font-mono text-[11px]">
            {project.readme || "(empty)"}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function NarrativeStatus({ status }: { status: string }) {
  const label =
    status === "ready"
      ? "Ready"
      : status === "generating"
        ? "Generating…"
        : status === "failed"
          ? "Failed"
          : "Not generated";

  return (
    <span className="mt-2 inline-flex rounded-full border border-[var(--border)] px-2 py-0.5 text-xs">
      {label}
    </span>
  );
}
