"use client";

import { useMemo, useState } from "react";

import { ProjectCard } from "@/components/dashboard/project-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectSummary } from "@/types/project";

type SortId = "recent" | "name" | "readiness";

const SORTS: { id: SortId; label: string }[] = [
  { id: "recent", label: "Recently updated" },
  { id: "name", label: "Name" },
  { id: "readiness", label: "Readiness" },
];

const READINESS: Record<ProjectSummary["status"], number> = {
  ready: 2,
  ingesting: 1,
  failed: 0,
};

interface ProjectsBrowserProps {
  projects: ProjectSummary[];
}

export function ProjectsBrowser({ projects }: ProjectsBrowserProps) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortId>("recent");

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();

    const filtered = projects.filter((project) => {
      if (term.length === 0) return true;

      return (
        `${project.repoOwner}/${project.repoName}`.toLowerCase().includes(term) ||
        project.topLanguages.some((language) =>
          language.name.toLowerCase().includes(term),
        )
      );
    });

    return [...filtered].sort((a, b) => {
      if (sort === "name") {
        return `${a.repoOwner}/${a.repoName}`.localeCompare(
          `${b.repoOwner}/${b.repoName}`,
        );
      }
      if (sort === "readiness") {
        const delta = READINESS[b.status] - READINESS[a.status];
        if (delta !== 0) return delta;
      }
      return projects.indexOf(a) - projects.indexOf(b);
    });
  }, [projects, query, sort]);

  const isSearching = query.trim().length > 0;
  const activeSort = SORTS.find((option) => option.id === sort) ?? SORTS[0];

  return (
    <section aria-labelledby="projects-heading" className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="projects-heading"
            className="text-lg font-semibold tracking-tight"
          >
            Your projects
          </h2>
          <p className="mt-1 text-sm text-muted">
            {projects.length === 0
              ? "Repositories you import will appear here."
              : `${projects.length} ${projects.length === 1 ? "repository" : "repositories"} tracked`}
          </p>
        </div>

        {projects.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-56 sm:flex-none">
              <label htmlFor="project-search" className="sr-only">
                Search projects
              </label>
              <input
                id="project-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search repositories…"
                className="input py-2 pl-3 pr-3 text-[13px]"
              />
            </div>

            <Select
              value={sort}
              onValueChange={(value) => setSort(value as SortId)}
            >
              <SelectTrigger
                size="sm"
                aria-label="Sort projects"
                className="w-auto text-[13px]"
              >
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent align="end">
                {SORTS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="sr-only" aria-live="polite">
              Sorted by {activeSort.label}
            </span>
          </div>
        ) : null}
      </div>

      {visible.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="panel flex flex-col items-center gap-3 px-6 py-14 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            No matches
          </p>
          <p className="max-w-sm text-sm text-muted">
            {isSearching
              ? "No repositories match your search."
              : "Import a repository to generate its first narrative."}
          </p>
          {isSearching ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="btn btn-secondary mt-1"
            >
              Clear search
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}
