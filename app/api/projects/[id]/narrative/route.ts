import { randomUUID } from "crypto";

import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { generateProjectNarrative } from "@/lib/generateNarrative";
import { getProjectModel } from "@/lib/models";
import { formatGenerationError } from "@/lib/narrativeErrors";
import {
  serializeProject,
  summarizeCommits,
  summarizeFileTree,
  toLanguageRecord,
} from "@/lib/projectUtils";
import { isValidProjectId } from "@/lib/projects";
import { hashReviewContext } from "@/lib/reviewContext";
import type { ProjectReview } from "@/types/project";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function buildReview(project: {
  review?: Partial<ProjectReview> | null;
}): ProjectReview {
  return {
    contribution: project.review?.contribution ?? "",
    targetRole: project.review?.targetRole ?? "",
    companyTier: project.review?.companyTier ?? "",
    jobDescription: project.review?.jobDescription ?? "",
    stackDescription: project.review?.stackDescription ?? "",
    additionalContext: project.review?.additionalContext ?? "",
  };
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

  const review = buildReview(project);
  const contextHash = hashReviewContext(review);

  if (
    project.narrativeStatus === "ready" &&
    project.narrativeContextHash === contextHash
  ) {
    return NextResponse.json({
      project: serializeProject(project),
      alreadyGenerated: true,
    });
  }

  if (project.narrativeStatus === "generating") {
    return NextResponse.json(
      { error: "Narrative generation is already in progress." },
      { status: 409 },
    );
  }

  const historyUpdate =
    project.narrativeStatus === "ready" && project.narrative
      ? {
          $push: {
            narrativeHistory: {
              id: randomUUID(),
              contextHash: project.narrativeContextHash ?? "",
              review: buildReview({
                review:
                  project.narrativeReviewSnapshot ?? project.review ?? undefined,
              }),
              narrative: project.narrative,
              createdAt: new Date(),
            },
          },
        }
      : {};

  await Project.updateOne(
    { _id: project._id },
    {
      $set: { narrativeStatus: "generating" },
      $unset: { narrativeError: "" },
      ...historyUpdate,
    },
  );

  try {
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
            engineeringDecisions: narrative.engineeringDecisions,
            failureScenarios: narrative.failureScenarios,
            deepDiveQuestions: narrative.deepDiveQuestions,
            gaps: narrative.gaps,
          },
          narrativeContextHash: contextHash,
          narrativeReviewSnapshot: review,
          narrativeStatus: "ready",
        },
        $unset: { narrativeError: "" },
      },
      { returnDocument: "after" },
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
      error instanceof Error
        ? error.message
        : formatGenerationError(error);

    await Project.updateOne(
      { _id: project._id },
      {
        $set: { narrativeStatus: "failed", narrativeError: message },
      },
    );

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
