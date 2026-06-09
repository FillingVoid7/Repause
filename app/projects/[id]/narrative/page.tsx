import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { NarrativePageClient } from "@/components/projects/narrative-page-client";
import { getProjectForSession } from "@/lib/projects";
import { resolveSessionUserId } from "@/lib/sessionUser";

export const metadata = {
  title: "Study Deck — Stackfold",
};

interface NarrativePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}

export default async function ProjectNarrativePage({
  params,
  searchParams,
}: NarrativePageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = await resolveSessionUserId(session);

  if (!userId) {
    redirect("/login");
  }

  const { id } = await params;
  const { notice } = await searchParams;

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

  if (project.narrativeStatus !== "ready") {
    redirect(`/projects/${id}/review`);
  }

  return <NarrativePageClient project={project} notice={notice} />;
}
