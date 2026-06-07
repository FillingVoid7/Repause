import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { generateProjectNarrative } from "@/lib/generateNarrative";
import { getProjectModel } from "@/lib/models";
import {
  serializeProject,
  summarizeCommits,
  summarizeFileTree,
  toLanguageRecord,
} from "@/lib/projectUtils";
import { isValidProjectId } from "@/lib/projects";
import type { ProjectReview } from "@/types/project";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  if (!isValidProjectId(id)) {
    return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
  }

  const Project = await getProjectModel();

  const project = await Project.findOne({
    _id: id,
    userId: session.user.id,
    status: "ready",
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  await Project.updateOne(
    { _id: project._id },
    {
      $set: { narrativeStatus: "generating" },
      $unset: { narrativeError: "" },
    },
  );

  try {
    const review: ProjectReview = {
      stackDescription: project.review?.stackDescription ?? "",
      targetRole: project.review?.targetRole ?? "",
      companyTier: project.review?.companyTier ?? "",
      jobDescription: project.review?.jobDescription ?? "",
      additionalContext: project.review?.additionalContext ?? "",
    };

    const narrative = await generateProjectNarrative({
      repoOwner: project.repoOwner,
      repoName: project.repoName,
      readme: project.readme ?? "",
      languages: toLanguageRecord(project.languages),
      fileTreeSummary: summarizeFileTree(project.fileTree ?? []),
      recentCommits: summarizeCommits(project.commitsMetadata ?? []),
      review,
    });

    const updated = await Project.findByIdAndUpdate(
      project._id,
      {
        $set: {
          narrative: {
            pitchSummary: narrative.pitchSummary,
            star: narrative.star,
            flashcards: narrative.flashcards,
            architectureFlow: narrative.architectureFlow,
            gaps: narrative.gaps,
          },
          narrativeStatus: "ready",
        },
        $unset: { narrativeError: "" },
      },
      { new: true },
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to save narrative" },
        { status: 500 },
      );
    }

    return NextResponse.json({ project: serializeProject(updated) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Narrative generation failed.";

    await Project.updateOne(
      { _id: project._id },
      {
        $set: { narrativeStatus: "failed", narrativeError: message },
      },
    );

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
