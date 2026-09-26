import { redirect } from "next/navigation";

import { auth } from "@/auth";

/**
 * No marketing page: the root path resolves straight to the workspace for
 * signed-in users, or to sign-in for everyone else.
 */
export default async function Home() {
  const session = await auth();

  redirect(session?.user?.id ? "/dashboard" : "/login");
}
