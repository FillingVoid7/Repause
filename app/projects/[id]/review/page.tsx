import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ProjectReviewStudio } from "@/components/projects/project-review-studio";
import { getProjectForSession } from "@/lib/projects";
import { resolveSessionUserId } from "@/lib/sessionUser";

export const metadata = {
  title: "Project Review — Repause",
};

interface ReviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectReviewPage({ params }: ReviewPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = await resolveSessionUserId(session);

  if (!userId) {
    redirect("/login");
  }

  const { id } = await params;
  const project = await getProjectForSession(id, [
    userId,
    session.user.id ?? "",
  ]);

  if (!project) {
    redirect("/dashboard");
  }

  if (project.status !== "ready") {
    redirect("/dashboard");
  }

  return <ProjectReviewStudio project={project} />;
}
