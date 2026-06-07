import mongoose from "mongoose";

import { getProjectModel } from "@/lib/models";
import { serializeProject } from "@/lib/projectUtils";

export function isValidProjectId(id: string): boolean {
  return (
    mongoose.Types.ObjectId.isValid(id) &&
    new mongoose.Types.ObjectId(id).toString() === id
  );
}

export async function getProjectForUser(projectId: string, userId: string) {
  if (!isValidProjectId(projectId)) {
    return null;
  }

  const Project = await getProjectModel();
  const objectId = new mongoose.Types.ObjectId(projectId);

  const project = await Project.findOne({
    _id: objectId,
    userId,
  }).lean();

  if (!project) {
    return null;
  }

  return serializeProject(project);
}

/** Find project by id and verify ownership with primary or fallback user id. */
export async function getProjectForSession(
  projectId: string,
  userIds: string[],
) {
  if (!isValidProjectId(projectId)) {
    return null;
  }

  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return null;
  }

  const Project = await getProjectModel();
  const objectId = new mongoose.Types.ObjectId(projectId);

  const project = await Project.findOne({
    _id: objectId,
    userId: { $in: uniqueIds },
  }).lean();

  if (!project) {
    return null;
  }

  return serializeProject(project);
}
