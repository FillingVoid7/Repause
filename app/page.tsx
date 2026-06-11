import Link from "next/link";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[var(--background)] via-[var(--background)] to-[rgba(196,92,38,0.03)]">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-orange-600">
              <span className="text-xs font-bold text-white">SF</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Stackfold
            </span>
          </div>
          <nav className="flex items-center gap-4">
            {session?.user ? (
              <Link href="/dashboard" className="btn btn-primary">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn btn-primary">
                  Sign in
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 py-24 sm:py-32">
          {/* Background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-accent/10 blur-[140px]" />
            <div className="absolute right-0 top-40 h-[350px] w-[350px] rounded-full bg-orange-500/10 blur-[120px]" />
            <div className="absolute left-0 bottom-0 h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[120px]" />
          </div>

          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-2 text-sm font-medium text-accent">
                ✨ AI-powered architecture storytelling
              </div>

              <h1 className="mx-auto max-w-5xl text-5xl font-bold tracking-tight sm:text-7xl">
                Turn your
                <span className="bg-gradient-to-r from-accent via-orange-500 to-accent bg-clip-text text-transparent">
                  {" "}GitHub repositories{" "}
                </span>
                into interview superpowers
              </h1>

              <p className="mx-auto mt-8 max-w-2xl text-lg text-muted sm:text-xl">
                Stackfold analyzes your codebase, understands architectural decisions,
                generates technical narratives, and prepares you for interviews.
              </p>

              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href={session?.user ? "/dashboard" : "/login"}
                  className="rounded-xl bg-gradient-to-r from-accent to-orange-600 px-8 py-4 font-semibold text-white shadow-xl transition-all hover:scale-105"
                >
                  {session?.user ? "Open Dashboard" : "Start Free"}
                </Link>

                <a
                  href="#how-it-works"
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-8 py-4 font-semibold backdrop-blur-sm hover:border-accent"
                >
                  See How It Works
                </a>
              </div>
            </div>

            {/* Visual Pipeline */}
            <div className="mt-24 hidden lg:block">
              <div className="relative mx-auto flex max-w-5xl items-center justify-between">
                <div className="glass-card w-72 rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-6 backdrop-blur-xl">
                  <div className="mb-3 text-3xl">📦</div>
                  <h3 className="font-semibold">GitHub Repository</h3>
                  <p className="mt-2 text-sm text-muted">
                    README, source code, commits, technologies
                  </p>
                </div>

                <div className="text-5xl text-accent">→</div>

                <div className="glass-card w-72 rounded-2xl border border-accent/20 bg-accent/5 p-6 backdrop-blur-xl">
                  <div className="mb-3 text-3xl">🧠</div>
                  <h3 className="font-semibold">AI Analysis</h3>
                  <p className="mt-2 text-sm text-muted">
                    Architecture extraction, narratives, STAR stories
                  </p>
                </div>

                <div className="text-5xl text-accent">→</div>

                <div className="glass-card w-72 rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-6 backdrop-blur-xl">
                  <div className="mb-3 text-3xl">🎯</div>
                  <h3 className="font-semibold">Interview Ready</h3>
                  <p className="mt-2 text-sm text-muted">
                    Flashcards, mock interviews, deep drills
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-6 py-16 border-t border-[var(--border)]">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {[
                ["100+", "Architectures Analyzed"],
                ["500+", "Interview Questions"],
                ["20+", "Technology Stacks"],
                ["10x", "Faster Preparation"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/40 p-6 text-center backdrop-blur"
                >
                  <div className="text-3xl font-bold text-accent">
                    {value}
                  </div>
                  <div className="mt-2 text-sm text-muted">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="relative px-6 py-20 sm:py-28 border-t border-[var(--border)]">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-3 text-3xl font-bold sm:text-4xl">
                Three simple steps
              </h2>
              <p className="text-muted">
                From repository to interview-ready
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Import",
                  body: "Paste your GitHub URL. We analyze your code, README, and architecture.",
                  icon: "📦",
                  gradient: "from-blue-500/20 to-blue-500/5",
                },
                {
                  step: "02",
                  title: "Generate",
                  body: "AI crafts narratives, STAR stories, and talking points for your stack.",
                  icon: "✨",
                  gradient: "from-accent/20 to-accent/5",
                },
                {
                  step: "03",
                  title: "Practice",
                  body: "Master with flashcards and Socratic questions. Interview-ready in no time.",
                  icon: "🎯",
                  gradient: "from-green-500/20 to-green-500/5",
                },
              ].map((item) => (
                <div key={item.step} className="group relative">
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${item.gradient} transition-all duration-300 group-hover:shadow-lg`}></div>
                  <article className="relative rounded-xl border border-[var(--border)] bg-[var(--card)]/50 p-6 backdrop-blur-sm transition-all duration-300 group-hover:border-accent group-hover:bg-[var(--card)]/80">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-mono text-xs font-bold text-accent">{item.step}</p>
                      <span className="text-2xl">{item.icon}</span>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{item.body}</p>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Architecture Preview Section */}
        <section className="border-t border-[var(--border)] px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="text-4xl font-bold">
                Understand your project architecture instantly
              </h2>
              <p className="mt-4 text-muted">
                Stackfold automatically builds architectural context from your code.
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)]/50 p-8 backdrop-blur-xl">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-[var(--border)] p-5">
                  <h4 className="font-semibold">Frontend</h4>
                  <p className="mt-2 text-sm text-muted">
                    Next.js, React, TailwindCSS
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--border)] p-5">
                  <h4 className="font-semibold">Backend</h4>
                  <p className="mt-2 text-sm text-muted">
                    Node.js, Express, PostgreSQL
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--border)] p-5">
                  <h4 className="font-semibold">Infrastructure</h4>
                  <p className="mt-2 text-sm text-muted">
                    Docker, Redis, CI/CD
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>


      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--card)]/20 px-6 py-8">
        <div className="mx-auto max-w-6xl text-center text-xs text-muted">
          © 2024 Stackfold. Built for developers.
        </div>
      </footer>
    </div>
  );
}
