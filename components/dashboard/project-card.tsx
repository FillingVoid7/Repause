interface ProjectCardProps {
  repoOwner: string;
  repoName: string;
  repoUrl: string;
  status: string;
  languageCount: number;
  fileCount: number;
  commitCount: number;
  scrapeError?: string | null;
}

export function ProjectCard({
  repoOwner,
  repoName,
  repoUrl,
  status,
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
        <StatusBadge status={status} />
      </div>

      {status === "ready" ? (
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
