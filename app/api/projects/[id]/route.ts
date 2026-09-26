import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getProjectModel } from "@/lib/models";
import { serializeProject } from "@/lib/projectUtils";
import { getProjectForUser, isValidProjectId } from "@/lib/projects";
import type { ProjectReview } from "@/types/project";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  if (!isValidProjectId(id)) {
    return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
  }

  const project = await getProjectForUser(id, session.user.id);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ project });
}

interface PatchBody {
  review?: Partial<ProjectReview>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  if (!isValidProjectId(id)) {
    return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
  }

  let body: PatchBody;

  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.review) {
    return NextResponse.json({ error: "No review fields provided" }, { status: 400 });
  }

  const Project = await getProjectModel();
  const project = await Project.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    {
      $set: {
        "review.contribution": body.review.contribution ?? "",
        "review.targetRole": body.review.targetRole ?? "",
        "review.companyTier": body.review.companyTier ?? "",
        "review.jobDescription": body.review.jobDescription ?? "",
      },
    },
    { returnDocument: "after" },
  ).lean();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ project: serializeProject(project) });
}
