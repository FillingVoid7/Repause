import Link from "next/link";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { ImportRepoForm } from "@/components/dashboard/import-repo-form";
import { ProjectCard } from "@/components/dashboard/project-card";
import { getProjectModel } from "@/lib/models";

export const metadata = {
  title: "Dashboard — Stackfold",
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

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wide text-accent">
            STACKFOLD
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            Signed in as {session.user.email ?? session.user.name}
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button type="submit" className="btn btn-secondary">
            Sign out
          </button>
        </form>
      </header>

      <section className="card">
        <h2 className="text-lg font-medium">Import repository</h2>
        <p className="mt-2 text-sm text-muted">
          Paste a public GitHub URL. We scrape the README, file tree, language
          stats, and recent commits into your projects collection.
        </p>
        <div className="mt-6">
          <ImportRepoForm />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Your projects</h2>
        {projects.length === 0 ? (
          <p className="text-sm text-muted">
            No repositories imported yet. Add your first project above.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((project) => {
              const languages =
                project.languages instanceof Map
                  ? Object.fromEntries(project.languages)
                  : (project.languages ?? {});

              return (
                <ProjectCard
                  key={project._id.toString()}
                  repoOwner={project.repoOwner}
                  repoName={project.repoName}
                  repoUrl={project.repoUrl}
                  status={project.status ?? "ready"}
                  languageCount={Object.keys(languages).length}
                  fileCount={project.fileTree?.length ?? 0}
                  commitCount={project.commitsMetadata?.length ?? 0}
                  scrapeError={project.scrapeError}
                />
              );
            })}
          </div>
        )}
      </section>

      <Link href="/" className="text-sm text-muted hover:text-foreground">
        ← Back to home
      </Link>
    </div>
  );
}
