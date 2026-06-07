import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { scrapeGitHubRepository } from "@/lib/githubScraper";
import { getProjectModel } from "@/lib/models";
import { validateGitHubUrl } from "@/lib/validateGitHubUrl";

export const runtime = "nodejs";

interface IngestRequestBody {
  repoUrl?: string;
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: IngestRequestBody;

  try {
    body = (await request.json()) as IngestRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateGitHubUrl(body.repoUrl ?? "");

  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { owner, repo, normalizedUrl } = validation.data;
  const Project = await getProjectModel();

  const existing = await Project.findOne({
    userId: session.user.id,
    repoOwner: owner,
    repoName: repo,
  });

  if (existing) {
    return NextResponse.json(
      { error: "This repository is already imported." },
      { status: 409 },
    );
  }

  const pendingProject = await Project.create({
    userId: session.user.id,
    repoUrl: normalizedUrl,
    repoOwner: owner,
    repoName: repo,
    status: "ingesting",
  });

  try {
    const scraped = await scrapeGitHubRepository(validation.data);

    const project = await Project.findByIdAndUpdate(
      pendingProject._id,
      {
        repoUrl: scraped.repoUrl,
        repoOwner: scraped.owner,
        repoName: scraped.repo,
        defaultBranch: scraped.defaultBranch,
        readme: scraped.readme,
        languages: scraped.languages,
        fileTree: scraped.fileTree,
        commitsMetadata: scraped.commitsMetadata,
        status: "ready",
        scrapeError: undefined,
      },
      { new: true },
    );

    if (!project) {
      return NextResponse.json(
        { error: "Failed to save imported repository." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      project: serializeProject(project),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Repository ingestion failed.";

    await Project.findByIdAndUpdate(pendingProject._id, {
      status: "failed",
      scrapeError: message,
    });

    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const Project = await getProjectModel();
  const projects = await Project.find({ userId: session.user.id })
    .sort({ updatedAt: -1 })
    .lean();

  return NextResponse.json({
    projects: projects.map(serializeProject),
  });
}

function serializeProject(project: {
  _id: { toString(): string };
  repoUrl: string;
  repoOwner: string;
  repoName: string;
  defaultBranch?: string;
  readme?: string;
  languages?: Map<string, number> | Record<string, number>;
  fileTree?: unknown[];
  commitsMetadata?: unknown[];
  status?: string;
  scrapeError?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  const languages =
    project.languages instanceof Map
      ? Object.fromEntries(project.languages)
      : (project.languages ?? {});

  return {
    id: project._id.toString(),
    repoUrl: project.repoUrl,
    repoOwner: project.repoOwner,
    repoName: project.repoName,
    defaultBranch: project.defaultBranch ?? "main",
    readmeLength: project.readme?.length ?? 0,
    languageCount: Object.keys(languages).length,
    fileCount: project.fileTree?.length ?? 0,
    commitCount: project.commitsMetadata?.length ?? 0,
    languages,
    status: project.status ?? "ready",
    scrapeError: project.scrapeError ?? undefined,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}
