import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ImportRepoForm } from "@/components/dashboard/import-repo-form";
import { ProjectsBrowser } from "@/components/dashboard/projects-browser";
import { getProjectModel } from "@/lib/models";
import type { NarrativeStatus, ProjectSummary } from "@/types/project";

export const metadata = {
  title: "Workspace",
  description:
    "Your Repause workspace: imported repositories, narratives, and study decks.",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const Project = await getProjectModel();
  const projects = await Project.find({ userId: session.user.id })
    .sort({ updatedAt: -1 })
    .lean();

  const summaries = projects.map(toSummary);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <DashboardHeader
        name={session.user.name}
        email={session.user.email}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-20 pt-10">
        {/* Intro */}
        <section className="rise-in">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
            Interview prep
          </p>
          <h1 className="mt-3 max-w-3xl text-[1.75rem] font-semibold tracking-tight sm:text-[2rem]">
            Know your code. Defend your decisions.
          </h1>
        </section>

        {/* Import */}
        <section
          id="import-repository"
          className="panel hairline-top mt-8 scroll-mt-24 p-5 sm:p-6"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-md">
              <h2 className="text-base font-semibold tracking-tight">
                Import a repository
              </h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                We read the README, file tree, language stats, and recent commits.
                Nothing is written to your GitHub account.
              </p>
            </div>
            <div className="w-full lg:max-w-xl lg:flex-1">
              <ImportRepoForm />
            </div>
          </div>
        </section>

        {/* First-run guidance */}
        {summaries.length === 0 ? (
          <section className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
              How Repause works
            </h2>
            <ol className="mt-4 grid gap-4 sm:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Import",
                  body: "Paste a public GitHub URL. We index the architecture already in your code.",
                },
                {
                  step: "02",
                  title: "Frame",
                  body: "Add the target role and company tier so the narrative matches the interview.",
                },
                {
                  step: "03",
                  title: "Rehearse",
                  body: "Study the deck: STAR stories, flashcards, failure modes, deep-dive questions.",
                },
              ].map((item) => (
                <li key={item.step} className="panel p-5">
                  <span className="font-mono text-xs font-semibold text-accent">
                    {item.step}
                  </span>
                  <h3 className="mt-3 text-sm font-semibold">{item.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                    {item.body}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {summaries.length > 0 ? (
          <div className="mt-10">
            <ProjectsBrowser projects={summaries} />
          </div>
        ) : null}
      </main>

      <footer className="border-t border-[var(--border)] px-6 py-6">
        <p className="text-center text-[11px] text-muted">
          Repause — your repositories, turned into stories you can defend.
        </p>
      </footer>
    </div>
  );
}

interface LeanProject {
  _id: { toString(): string };
  repoOwner: string;
  repoName: string;
  repoUrl: string;
  status?: string;
  narrativeStatus?: NarrativeStatus;
  scrapeError?: string | null;
  languages?: Map<string, number> | Record<string, number>;
  fileTree?: unknown[];
  commitsMetadata?: unknown[];
  updatedAt?: Date | string;
}

function toSummary(project: LeanProject): ProjectSummary {
  const id = project._id.toString();
  const status = project.status ?? "ready";
  const narrativeStatus = project.narrativeStatus ?? "pending";
  const languages =
    project.languages instanceof Map
      ? Object.fromEntries(project.languages)
      : (project.languages ?? {});

  const totalBytes = Object.values(languages).reduce(
    (sum, bytes) => sum + (Number(bytes) || 0),
    0,
  );

  const topLanguages = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .map(([name, bytes]) => ({
      name,
      share: totalBytes > 0 ? (bytes / totalBytes) * 100 : 0,
    }))
    .filter((language) => language.share >= 1)
    .slice(0, 5);

  return {
    id,
    repoOwner: project.repoOwner,
    repoName: project.repoName,
    repoUrl: project.repoUrl,
    status,
    narrativeStatus,
    languageCount: Object.keys(languages).length,
    fileCount: project.fileTree?.length ?? 0,
    commitCount: project.commitsMetadata?.length ?? 0,
    scrapeError: project.scrapeError ?? undefined,
    topLanguages,
    updatedLabel: formatUpdatedLabel(project.updatedAt),
    href:
      status === "ready"
        ? narrativeStatus === "ready"
          ? `/projects/${id}/narrative`
          : `/projects/${id}/review`
        : "/dashboard",
    reviewHref: `/projects/${id}/review`,
  };
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function formatUpdatedLabel(value?: Date | string | null): string {
  if (!value) return "recently";

  const then = new Date(value).getTime();

  if (Number.isNaN(then)) return "recently";

  const elapsed = Date.now() - then;

  if (elapsed < MINUTE) return "moments ago";
  if (elapsed < HOUR) return `${Math.round(elapsed / MINUTE)}m ago`;
  if (elapsed < DAY) {
    const hours = Math.round(elapsed / HOUR);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }
  if (elapsed < 30 * DAY) {
    const days = Math.round(elapsed / DAY);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }

  const months = Math.round(elapsed / (30 * DAY));
  return `${months} ${months === 1 ? "month" : "months"} ago`;
}
