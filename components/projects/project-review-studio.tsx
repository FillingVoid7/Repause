"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import type { ProjectReview, SerializedProject } from "@/types/project";

const EMPTY_REVIEW: ProjectReview = {
  contribution: "",
  targetRole: "",
  companyTier: "",
  jobDescription: "",
  stackDescription: "",
  additionalContext: "",
};

const TIERS = [
  { value: "", label: "Select tier" },
  { value: "startup", label: "Startup" },
  { value: "mid-size", label: "Mid-size" },
  { value: "faang", label: "FAANG / Big Tech" },
];

interface ProjectReviewStudioProps {
  project: SerializedProject;
}

export function ProjectReviewStudio({
  project: initial,
}: ProjectReviewStudioProps) {
  const router = useRouter();
  const [project, setProject] = useState(initial);
  const [review, setReview] = useState(initial.review);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const hasNarrative = project.narrativeStatus === "ready";
  const isBusy = isSaving || isGenerating || isClearing;

  function update<K extends keyof ProjectReview>(key: K, value: ProjectReview[K]) {
    setReview((current) => ({ ...current, [key]: value }));
  }

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
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-8">
      {/* Page head */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard"
          className="text-sm text-muted transition-colors hover:text-accent"
        >
          ← Back to dashboard
        </Link>
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted transition-colors hover:text-accent"
        >
          View on GitHub ↗
        </a>
      </div>

      <div className="mt-4 border-b border-[var(--border)] pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
          Project review
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {project.repoOwner}/{project.repoName}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted">
          We read the repository. Tell us what you built and who you are
          interviewing with, and the deck is written around your answers.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        {/* Form */}
        <form
          className="space-y-7"
          onSubmit={(event) => {
            event.preventDefault();
            void handleGenerateNarrative();
          }}
        >
          <Field
            label="Your contribution and impact"
            hint="The one thing the repository cannot tell us. What you personally built, your scope, and the outcome it produced."
          >
            <textarea
              className="textarea"
              rows={5}
              value={review.contribution}
              onChange={(event) => update("contribution", event.target.value)}
              placeholder="e.g. I designed and shipped the ingestion pipeline end to end — the scraper, the queue, and the retry layer. Cut median import time from 40s to 6s and it has processed 40k repos without a manual retry."
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Target role">
              <input
                className="input"
                value={review.targetRole}
                onChange={(event) => update("targetRole", event.target.value)}
                placeholder="e.g. Backend Engineer"
              />
            </Field>

            <Field label="Company tier">
              <select
                className="input"
                value={review.companyTier}
                onChange={(event) => update("companyTier", event.target.value)}
              >
                {TIERS.map((tier) => (
                  <option key={tier.value} value={tier.value}>
                    {tier.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field
            label="Job description"
            hint="Optional. Paste the requirements so the deck emphasises what this role will actually ask."
          >
            <textarea
              className="textarea"
              rows={5}
              value={review.jobDescription}
              onChange={(event) => update("jobDescription", event.target.value)}
              placeholder="Paste the relevant requirements…"
            />
          </Field>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-6">
            <button
              type="submit"
              disabled={isBusy}
              className="btn btn-primary"
            >
              {isGenerating ? "Generating…" : "Generate study deck"}
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
              onClick={handleClearContext}
              disabled={isBusy}
              className="ml-auto text-xs text-muted transition-colors hover:text-danger disabled:opacity-50"
            >
              {isClearing ? "Clearing…" : "Clear context"}
            </button>
          </div>
        </form>

        {/* Aside */}
        <aside className="space-y-4 lg:sticky lg:top-6">
          <StudyDeckPanel project={project} hasNarrative={hasNarrative} />
          {project.narrativeStatus === "failed" && project.narrativeError ? (
            <div className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/5 p-4">
              <p className="text-sm font-medium text-danger">
                Last attempt failed
              </p>
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
    const stats = [
      { label: "Flashcards", value: project.narrative.flashcards.length },
      {
        label: "Deep-dive Qs",
        value: project.narrative.deepDiveQuestions.length,
      },
      {
        label: "Decisions",
        value: project.narrative.engineeringDecisions.length,
      },
      {
        label: "Failure cases",
        value: project.narrative.failureScenarios.length,
      },
    ];

    return (
      <section className="panel space-y-4 p-5">
        <div>
          <h2 className="text-sm font-semibold">Study deck ready</h2>
          <p className="mt-1 text-[13px] text-muted">
            Generated from this context. Edit and regenerate any time.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--border)] text-center">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-[var(--card)] px-2 py-2.5">
              <dd className="text-sm font-semibold tabular-nums">
                {stat.value}
              </dd>
              <dt className="mt-0.5 text-[10px] uppercase tracking-wider text-muted">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>

        <Link
          href={`/projects/${project.id}/narrative`}
          className="btn btn-primary w-full"
        >
          Open study deck
        </Link>
        <p className="text-center text-[11px] text-muted">
          Regenerating with an unchanged context reopens this deck.
        </p>
      </section>
    );
  }

  return (
    <section className="panel space-y-4 p-5">
      <div>
        <h2 className="text-sm font-semibold">Study deck</h2>
        <p className="mt-1 text-[13px] text-muted">
          Flashcards, architecture flow, and STAR — built for quick review.
        </p>
        <NarrativeStatus status={project.narrativeStatus} />
      </div>

      {project.narrativeStatus === "generating" ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--accent-subtle)]/40 p-4">
          <p className="text-sm font-medium">Generating your study deck…</p>
          <p className="mt-1 text-xs text-muted">
            This may take a moment if Gemini is under high demand.
          </p>
        </div>
      ) : (
        <ol className="space-y-2.5 text-[13px] text-muted">
          {[
            "Describe what you built and the impact it had",
            "Set your target role and company tier",
            "Generate the deck",
          ].map((step, index) => (
            <li key={step} className="flex gap-2.5">
              <span className="font-mono text-xs font-semibold text-accent">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
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
      <label className="block text-sm font-medium">{label}</label>
      {hint ? <p className="text-xs leading-relaxed text-muted">{hint}</p> : null}
      {children}
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
      className={`mt-2.5 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${tone}`}
    >
      {label}
    </span>
  );
}
