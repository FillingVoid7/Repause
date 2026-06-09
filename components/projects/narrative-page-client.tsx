"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { NarrativeDisplay } from "@/components/projects/narrative-display";
import { formatReviewSummary } from "@/lib/reviewContext";
import { cn } from "@/lib/utils";
import type { NarrativeHistoryEntry, SerializedProject } from "@/types/project";

interface NarrativePageClientProps {
  project: SerializedProject;
  notice?: string;
}

export function NarrativePageClient({
  project,
  notice,
}: NarrativePageClientProps) {
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(
    null,
  );

  const history = [...(project.narrativeHistory ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  useEffect(() => {
    if (notice === "already-generated") {
      toast.info(
        "You already generated a study deck for this context. Showing your existing narrative.",
      );
    } else if (notice === "generated") {
      toast.success("Study deck generated. Happy reviewing!");
    }
  }, [notice]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10">
      <header className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--accent-subtle)] via-[var(--card)] to-[var(--card)] p-8 shadow-sm">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--accent)]/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href={`/projects/${project.id}/review`}
              className="text-sm text-muted transition-colors hover:text-accent"
            >
              ← Back to review
            </Link>
            <p className="mt-3 text-sm font-semibold tracking-[0.2em] text-accent">
              STUDY DECK
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              {project.repoOwner}/{project.repoName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Flashcards, architecture flow, and STAR — built for focused
              interview prep.
            </p>
            {project.narrativeReviewSnapshot ? (
              <p className="mt-3 inline-flex rounded-full border border-[var(--border)] bg-[var(--card)]/80 px-3 py-1 text-xs text-muted">
                {formatReviewSummary(project.narrativeReviewSnapshot)}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href={`/projects/${project.id}/review`}
              className="btn btn-secondary"
            >
              Edit context
            </Link>
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              View repo
            </a>
          </div>
        </div>
      </header>

      <section className="card space-y-6 border-[var(--accent)]/20 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
              <h2 className="text-lg font-semibold">Latest generation</h2>
            </div>
            <p className="mt-1 text-sm text-muted">
              Your most recent study deck for this project.
            </p>
          </div>
          <StatusPill label="Current" variant="accent" />
        </div>
        <NarrativeDisplay narrative={project.narrative} />
      </section>

      {history.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Previous generations</h2>
            <p className="mt-1 text-sm text-muted">
              Earlier study decks from different review contexts. Expand to
              revisit.
            </p>
          </div>
          <div className="space-y-3">
            {history.map((entry, index) => (
              <HistoryCard
                key={entry.id}
                entry={entry}
                index={history.length - index}
                isExpanded={expandedHistoryId === entry.id}
                onToggle={() =>
                  setExpandedHistoryId((current) =>
                    current === entry.id ? null : entry.id,
                  )
                }
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function HistoryCard({
  entry,
  index,
  isExpanded,
  onToggle,
}: {
  entry: NarrativeHistoryEntry;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const flashcardCount = entry.narrative.flashcards.length;
  const formattedDate = new Date(entry.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <article className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition-shadow hover:shadow-md">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 p-5 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Generation #{index}</span>
            <StatusPill label="Archived" variant="muted" />
          </div>
          <p className="mt-1 truncate text-sm text-muted">
            {formatReviewSummary(entry.review)}
          </p>
          <p className="mt-2 text-xs text-muted">
            {formattedDate} · {flashcardCount} flashcards
          </p>
        </div>
        <span
          className={cn(
            "mt-1 text-muted transition-transform duration-200",
            isExpanded && "rotate-180",
          )}
          aria-hidden
        >
          ▾
        </span>
      </button>
      {isExpanded ? (
        <div className="border-t border-[var(--border)] bg-[var(--accent-subtle)]/20 p-5">
          <NarrativeDisplay narrative={entry.narrative} />
        </div>
      ) : null}
    </article>
  );
}

function StatusPill({
  label,
  variant,
}: {
  label: string;
  variant: "accent" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        variant === "accent"
          ? "bg-[var(--accent-subtle)] text-accent"
          : "border border-[var(--border)] text-muted",
      )}
    >
      {label}
    </span>
  );
}
