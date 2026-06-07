import Link from "next/link";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";

export const metadata = {
  title: "Dashboard — Stackfold",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

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
        <h2 className="text-lg font-medium">Your projects</h2>
        <p className="mt-2 text-sm text-muted">
          Import a GitHub repository to start building your defense narrative.
          Project ingestion arrives in Phase 2.
        </p>
        <button type="button" className="btn btn-primary mt-6" disabled>
          Import repository (coming soon)
        </button>
      </section>

      <Link href="/" className="text-sm text-muted hover:text-foreground">
        ← Back to home
      </Link>
    </div>
  );
}
