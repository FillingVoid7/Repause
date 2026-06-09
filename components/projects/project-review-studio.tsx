"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import type { ProjectReview, SerializedProject } from "@/types/project";

const EMPTY_REVIEW: ProjectReview = {
  stackDescription: "",
  targetRole: "",
  companyTier: "",
  jobDescription: "",
  additionalContext: "",
};

interface ProjectReviewStudioProps {
  project: SerializedProject;
}

export function ProjectReviewStudio({ project: initial }: ProjectReviewStudioProps) {
  const router = useRouter();
  const [project, setProject] = useState(initial);
  const [review, setReview] = useState(initial.review);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const hasNarrative = project.narrativeStatus === "ready";
  const isBusy = isSaving || isGenerating || isClearing;

  async function persistReview(nextReview: ProjectReview) {
    const response = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ review: nextReview }),
    });

    const data = (await response.json()) as {
      error?: string;
      project?: SerializedProject;
    };

    if (!response.ok || !data.project) {
      throw new Error(data.error ?? "Failed to save review context.");
    }

    setProject(data.project);
    return data.project;
  }

  async function handleSaveReview() {
    setIsSaving(true);

    try {
      await persistReview(review);
      toast.success("Context saved.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Network error while saving.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleClearContext() {
    setIsClearing(true);

    try {
      setReview(EMPTY_REVIEW);
      await persistReview(EMPTY_REVIEW);
      toast.success("Context cleared. Rewrite your review, then generate again.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to clear context.",
      );
    } finally {
      setIsClearing(false);
    }
  }

  async function handleGenerateNarrative() {
    setIsGenerating(true);

    try {
      await persistReview(review);

      setProject((current) => ({
        ...current,
        narrativeStatus: "generating",
        narrativeError: undefined,
      }));

      const response = await fetch(`/api/projects/${project.id}/narrative`, {
        method: "POST",
      });

      const data = (await response.json()) as {
        error?: string;
        project?: SerializedProject;
        alreadyGenerated?: boolean;
      };

      if (!response.ok || !data.project) {
        toast.error(data.error ?? "Failed to generate narrative.");
        setProject((current) => ({
          ...current,
          narrativeStatus: "failed",
          narrativeError: data.error,
        }));
        return;
      }

      setProject(data.project);

      if (data.alreadyGenerated) {
        router.push(
          `/projects/${project.id}/narrative?notice=already-generated`,
        );
        return;
      }

      router.push(`/projects/${project.id}/narrative?notice=generated`);
    } catch {
      toast.error("Network error during generation.");
      setProject((current) => ({
        ...current,
        narrativeStatus: "failed",
      }));
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <header className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] via-[var(--accent-subtle)]/40 to-[var(--card)] p-8 shadow-sm">
        <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-[var(--accent)]/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="text-sm text-muted transition-colors hover:text-accent"
            >
              ← Dashboard
            </Link>
            <p className="mt-3 text-sm font-semibold tracking-[0.2em] text-accent">
              PROJECT REVIEW
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              {project.repoOwner}/{project.repoName}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Confirm stack details, fill context gaps, then generate your
              interview narrative.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleClearContext}
              disabled={isBusy}
              className="btn btn-secondary"
            >
              {isClearing ? "Clearing…" : "Clear context"}
            </button>
            <button
              type="button"
              onClick={handleSaveReview}
              disabled={isBusy}
              className="btn btn-secondary"
            >
              {isSaving ? "Saving…" : "Save context"}
            </button>
            <button
              type="button"
              onClick={handleGenerateNarrative}
              disabled={isBusy}
              className="btn btn-primary"
            >
              {isGenerating ? "Generating…" : "Generate narrative"}
            </button>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)] lg:items-start">
        <section className="card space-y-5 shadow-sm lg:sticky lg:top-6">
          <div>
            <h2 className="text-lg font-semibold">Your context</h2>
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

        <aside className="space-y-4">
          <StudyDeckPanel project={project} hasNarrative={hasNarrative} />
          {project.narrativeStatus === "failed" && project.narrativeError ? (
            <div className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/5 p-4">
              <p className="text-sm font-medium text-danger">Last attempt failed</p>
              <p className="mt-1 text-xs text-muted">{project.narrativeError}</p>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function StudyDeckPanel({
  project,
  hasNarrative,
}: {
  project: SerializedProject;
  hasNarrative: boolean;
}) {
  if (hasNarrative) {
    const flashcardCount = project.narrative.flashcards.length;

    return (
      <section className="card space-y-4 border-[var(--accent)]/20 bg-gradient-to-br from-[var(--accent-subtle)]/50 to-[var(--card)] shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Study deck ready</h2>
            <p className="mt-1 text-sm text-muted">
              Your narrative is on a dedicated page for easier reading.
            </p>
          </div>
          <NarrativeStatus status={project.narrativeStatus} />
        </div>
        <dl className="grid grid-cols-2 gap-3 text-center text-xs">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-3">
            <dt className="text-muted">Flashcards</dt>
            <dd className="mt-1 text-lg font-semibold">{flashcardCount}</dd>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-3">
            <dt className="text-muted">Deep-dive Qs</dt>
            <dd className="mt-1 text-lg font-semibold">
              {project.narrative.deepDiveQuestions.length}
            </dd>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-3">
            <dt className="text-muted">Decisions</dt>
            <dd className="mt-1 text-lg font-semibold">
              {project.narrative.engineeringDecisions.length}
            </dd>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-3">
            <dt className="text-muted">Failure cases</dt>
            <dd className="mt-1 text-lg font-semibold">
              {project.narrative.failureScenarios.length}
            </dd>
          </div>
        </dl>
        <Link
          href={`/projects/${project.id}/narrative`}
          className="btn btn-primary w-full"
        >
          Open study deck
        </Link>
        <p className="text-center text-xs text-muted">
          Regenerating with the same context opens your existing deck.
        </p>
      </section>
    );
  }

  return (
    <section className="card space-y-4 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Study deck</h2>
        <p className="mt-1 text-sm text-muted">
          Flashcards, architecture flow, and STAR — built for quick review.
        </p>
        <NarrativeStatus status={project.narrativeStatus} />
      </div>

      {project.narrativeStatus === "generating" ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--accent-subtle)]/40 p-4">
          <p className="text-sm font-medium">Generating your study deck…</p>
          <p className="mt-1 text-xs text-muted">
            This may take a moment if Gemini is under high demand.
          </p>
        </div>
      ) : (
        <div className="space-y-3 rounded-xl border border-dashed border-[var(--border)] p-4">
          <p className="text-sm text-muted">
            Save your context, then click &ldquo;Generate narrative&rdquo; to
            build flashcards and an architecture diagram.
          </p>
          <ul className="space-y-2 text-xs text-muted">
            <li className="flex gap-2">
              <span className="text-accent">1.</span>
              Fill in your stack and target role
            </li>
            <li className="flex gap-2">
              <span className="text-accent">2.</span>
              Save context
            </li>
            <li className="flex gap-2">
              <span className="text-accent">3.</span>
              Generate — opens on a dedicated study page
            </li>
          </ul>
        </div>
      )}
    </section>
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
    <div className="rounded-xl border border-[var(--border)] bg-[var(--accent-subtle)]/30 p-4">
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

  const tone =
    status === "ready"
      ? "border-[var(--accent)]/30 bg-[var(--accent-subtle)] text-accent"
      : status === "failed"
        ? "border-[var(--danger)]/30 bg-[var(--danger)]/5 text-danger"
        : "border-[var(--border)] text-muted";

  return (
    <span
      className={`mt-2 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${tone}`}
    >
      {label}
    </span>
  );
}
