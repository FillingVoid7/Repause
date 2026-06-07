import Link from "next/link";

interface ProjectCardProps {
  id: string;
  repoOwner: string;
  repoName: string;
  repoUrl: string;
  status: string;
  narrativeStatus?: string;
  languageCount: number;
  fileCount: number;
  commitCount: number;
  scrapeError?: string | null;
}

export function ProjectCard({
  id,
  repoOwner,
  repoName,
  repoUrl,
  status,
  narrativeStatus,
  languageCount,
  fileCount,
  commitCount,
  scrapeError,
}: ProjectCardProps) {
  return (
    <article className="card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium">
            {repoOwner}/{repoName}
          </h3>
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted hover:text-accent"
          >
            View on GitHub
          </a>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={status} />
          {status === "ready" && narrativeStatus ? (
            <NarrativeBadge status={narrativeStatus} />
          ) : null}
        </div>
      </div>

      {status === "ready" ? (
        <>
          <dl className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-md bg-[var(--accent-subtle)] px-2 py-2">
              <dt className="text-muted">Languages</dt>
              <dd className="mt-1 font-medium">{languageCount}</dd>
            </div>
            <div className="rounded-md bg-[var(--accent-subtle)] px-2 py-2">
              <dt className="text-muted">Files</dt>
              <dd className="mt-1 font-medium">{fileCount}</dd>
            </div>
            <div className="rounded-md bg-[var(--accent-subtle)] px-2 py-2">
              <dt className="text-muted">Commits</dt>
              <dd className="mt-1 font-medium">{commitCount}</dd>
            </div>
          </dl>
          <Link
            href={`/projects/${id}/review`}
            className="btn btn-primary w-full"
          >
            Review &amp; generate narrative
          </Link>
        </>
      ) : null}

      {status === "failed" && scrapeError ? (
        <p className="text-xs text-danger">{scrapeError}</p>
      ) : null}
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label =
    status === "ready"
      ? "Ready"
      : status === "ingesting"
        ? "Importing"
        : "Failed";

  return (
    <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-xs capitalize">
      {label}
    </span>
  );
}

function NarrativeBadge({ status }: { status: string }) {
  const label =
    status === "ready"
      ? "Narrative ready"
      : status === "generating"
        ? "Generating"
        : status === "failed"
          ? "Narrative failed"
          : "No narrative";

  return (
    <span className="text-[10px] text-muted">{label}</span>
  );
}
