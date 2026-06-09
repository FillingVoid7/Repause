import Link from "next/link";

import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-sm font-semibold tracking-wide text-accent">
          STACKFOLD
        </span>
        <nav className="flex items-center gap-3">
          {session?.user ? (
            <Link href="/dashboard" className="btn btn-primary">
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className="btn btn-primary">
              Sign in
            </Link>
          )}
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-12 px-6 py-16">
        <section className="max-w-2xl space-y-6">
          <p className="inline-flex rounded-full bg-[var(--accent-subtle)] px-3 py-1 text-xs font-medium text-accent">
            AI Project Defense &amp; Articulation
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Defend your architecture before the interview does.
          </h1>
          <p className="text-lg text-muted">
            Stackfold ingests your GitHub repository, generates narratives and
            Socratic drills, and helps you articulate tradeoffs, technical debt,
            and design decisions with confidence.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={session?.user ? "/dashboard" : "/login"}
              className="btn btn-primary"
            >
              {session?.user ? "Go to dashboard" : "Get started"}
            </Link>
            <a
              href="#how-it-works"
              className="btn btn-secondary"
            >
              How it works
            </a>
          </div>
        </section>

        <section
          id="how-it-works"
          className="grid gap-4 sm:grid-cols-3"
        >
          {[
            {
              step: "01",
              title: "Import repo",
              body: "Paste a GitHub URL. We scrape README, languages, file tree, and commits.",
            },
            {
              step: "02",
              title: "Build narrative",
              body: "Gemini generates your elevator pitch, STAR stories, and tradeoff talking points.",
            },
            {
              step: "03",
              title: "Interview drill",
              body: "Practice with flashcards and deep-dive questions tailored to your stack.",
            },
          ].map((item) => (
            <article key={item.step} className="card">
              <p className="font-mono text-xs text-accent">{item.step}</p>
              <h2 className="mt-2 font-medium">{item.title}</h2>
              <p className="mt-2 text-sm text-muted">{item.body}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
