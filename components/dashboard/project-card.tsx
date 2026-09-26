import Link from "next/link";

import { formatCompactNumber } from "@/lib/utils";
import type { ProjectSummary } from "@/types/project";

const LANGUAGE_COLORS = [
  "var(--accent)",
  "#0ea5e9",
  "#f97316",
  "#10b981",
  "#ec4899",
  "#eab308",
  "#6366f1",
];

interface ProjectCardProps {
  project: ProjectSummary;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const isReady = project.status === "ready";
  const hasDeck = project.narrativeStatus === "ready";
  const failed = project.status === "failed";

  return (
    <article className="panel hairline-top group flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5">
      <div className="flex items-start justify-between gap-3 p-5 pb-4">
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 min-h-[2.6rem] text-[15px] font-semibold leading-snug tracking-tight">
            <span className="whitespace-nowrap text-muted">{project.repoOwner}/</span>
            <wbr />
            {project.repoName}
          </h3>
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 inline-flex items-center gap-1 truncate text-[11px] text-muted transition-colors hover:text-accent"
          >
            <span aria-hidden="true">↗</span>
            View source on GitHub
          </a>
        </div>

        <StatusPill
          status={project.status}
          narrativeStatus={project.narrativeStatus}
        />
      </div>

      {isReady ? (
        <div className="px-5">
          <LanguageBar languages={project.topLanguages} />
        </div>
      ) : null}

      <dl className="mt-4 grid grid-cols-3 gap-px overflow-hidden border-y border-[var(--border)] bg-[var(--border)] text-center">
        <Metric label="Files" value={project.fileCount} />
        <Metric label="Commits" value={project.commitCount} />
        <Metric label="Languages" value={project.languageCount} />
      </dl>

      <div className="flex flex-1 flex-col gap-3 p-5 pt-4">
        {failed && project.scrapeError ? (
          <p className="rounded-lg border border-[var(--danger)]/25 bg-[var(--danger)]/5 px-3 py-2 text-[11px] leading-relaxed text-danger">
            {project.scrapeError}
          </p>
        ) : null}

        {isReady ? (
          hasDeck ? (
            <div className="flex items-center gap-2">
              <Link href={project.href} className="btn btn-primary min-w-0 flex-1">
                Open study deck
              </Link>
              <Link
                href={project.reviewHref}
                className="btn btn-secondary shrink-0"
              >
                Review context
              </Link>
            </div>
          ) : (
            <Link href={project.reviewHref} className="btn btn-primary w-full">
              {project.narrativeStatus === "generating"
                ? "Track generation"
                : "Review & generate narrative"}
            </Link>
          )
        ) : null}

        <p className="mt-auto text-[11px] text-muted">
          {project.narrativeStatus === "generating"
            ? "Narrative generating…"
            : `Updated ${project.updatedLabel}`}
        </p>
      </div>
    </article>
  );
}

function StatusPill({
  status,
  narrativeStatus,
}: Pick<ProjectSummary, "status" | "narrativeStatus">) {
  const config = (() => {
    if (status === "ingesting") {
      return { label: "Importing", tone: "amber" };
    }
    if (status === "failed") {
      return { label: "Failed", tone: "red" };
    }
    if (narrativeStatus === "ready") {
      return { label: "Ready", tone: "green" };
    }
    if (narrativeStatus === "generating") {
      return { label: "Generating", tone: "amber" };
    }
    return { label: "Review", tone: "violet" };
  })();

  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--border)] bg-[var(--background)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider">
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: `var(--pill-${config.tone})` }}
      />
      {config.label}
    </span>
  );
}

function LanguageBar({
  languages,
}: {
  languages: ProjectSummary["topLanguages"];
}) {
  if (languages.length === 0) {
    return (
      <p className="rounded-lg bg-[var(--accent-subtle)]/40 px-3 py-2 text-[11px] text-muted">
        No language data for this repository.
      </p>
    );
  }

  return (
    <div>
      <div
        aria-hidden="true"
        className="flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full bg-[var(--border)]/60"
      >
        {languages.map((language, index) => (
          <span
            key={language.name}
            style={{
              width: `${Math.max(language.share, 4)}%`,
              background: LANGUAGE_COLORS[index % LANGUAGE_COLORS.length],
            }}
          />
        ))}
      </div>
      <p className="mt-2 truncate text-[11px] text-muted">
        {languages
          .slice(0, 3)
          .map((language) => `${language.name} ${Math.round(language.share)}%`)
          .join("  ·  ")}
      </p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[var(--card)] px-2 py-2.5">
      <dd className="text-sm font-semibold tabular-nums">
        {formatCompactNumber(value)}
      </dd>
      <dt className="mt-0.5 text-[10px] uppercase tracking-wider text-muted">
        {label}
      </dt>
    </div>
  );
}
