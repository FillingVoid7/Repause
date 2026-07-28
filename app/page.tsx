import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Logo } from "@/components/logo";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <Logo />
          </div>
          <nav className="flex items-center gap-4">
            {session?.user ? (
              <>
                <Link href="/dashboard" className="btn bg-foreground text-background hover:bg-foreground/90">
                  Dashboard
                </Link>
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
              </>
            ) : (
              <Link href="/login" className="btn bg-foreground text-background hover:bg-foreground/90">
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 py-24 sm:py-32">
          {/* Background */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <div className="absolute left-1/2 top-0 h-[500px] w-[1000px] -translate-x-1/2 rounded-full bg-foreground/5 blur-[120px]" />
          </div>

          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-2 text-sm font-medium text-accent">
                ✨ AI-powered architecture storytelling
              </div>

              <h1 className="mx-auto max-w-5xl text-5xl font-bold tracking-tight sm:text-7xl">
                Turn your
                <span className="text-foreground">
                  {" "}GitHub repositories{" "}
                </span>
                into interview superpowers
              </h1>

              <p className="mx-auto mt-8 max-w-2xl text-lg text-muted sm:text-xl">
                Repause analyzes your codebase, understands architectural decisions,
                generates technical narratives, and prepares you for interviews.
              </p>

              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href={session?.user ? "/dashboard" : "/login"}
                  className="rounded-xl bg-foreground px-8 py-4 font-semibold text-background shadow-sm transition-all hover:bg-foreground/90"
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
              <div className="mx-auto flex max-w-4xl items-start justify-between relative px-8 py-12">
                
                {/* Continuous Line */}
                <div className="absolute left-[15%] right-[15%] top-[76px] h-px bg-[var(--border)] z-0"></div>

                {/* Step 1 */}
                <div className="relative z-10 flex flex-col items-center gap-4 bg-[var(--background)] px-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] text-foreground shadow-sm transition-transform hover:scale-105">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-foreground">GitHub Repo</h3>
                    <p className="mt-1 text-xs text-muted">Source & Commits</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative z-10 flex flex-col items-center gap-4 bg-[var(--background)] px-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] text-foreground shadow-sm transition-transform hover:scale-105">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-foreground">AI Analysis</h3>
                    <p className="mt-1 text-xs text-muted">Context Extraction</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative z-10 flex flex-col items-center gap-4 bg-[var(--background)] px-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] text-foreground shadow-sm transition-transform hover:scale-105">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-foreground">Interview Ready</h3>
                    <p className="mt-1 text-xs text-muted">Flashcards & Drills</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-6 py-16 border-t border-[var(--border)]">
          <div className="mx-auto max-w-5xl flex flex-col md:flex-row gap-12 items-center">
            {/* Vertical Sidebar Stats */}
            <div className="w-full md:w-1/3 flex flex-col gap-8 border-l-2 border-[var(--border)] pl-8">
              {[
                ["25+", "Architectures Analyzed"],
                ["50+", "Interview Questions"],
                ["15+", "Technology Stacks"],
                ["5x", "Faster Preparation"],
              ].map(([value, label]) => (
                <div key={label}>
                  <div className="text-3xl font-bold text-foreground">
                    {value}
                  </div>
                  <div className="mt-1 text-sm text-muted">
                    {label}
                  </div>
                </div>
              ))}
            </div>
            {/* Content area */}
            <div className="w-full md:w-2/3 md:pl-10">
              <h2 className="text-3xl font-bold mb-4 text-foreground">Trusted by developers worldwide</h2>
              <p className="text-muted text-lg leading-relaxed">
                Our platform turns your complex architectural decisions into compelling narratives,
                ensuring you are fully prepared to answer even the most challenging interview questions.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="relative px-6 py-20 sm:py-28 border-t border-[var(--border)]">
          <div className="mx-auto max-w-3xl">
            <div className="mb-16 text-center">
              <h2 className="mb-3 text-3xl font-bold sm:text-4xl">
                Three simple steps
              </h2>
              <p className="text-muted">
                From repository to interview-ready
              </p>
            </div>

            <div className="space-y-12 relative before:absolute before:inset-0 before:ml-[19px] before:-translate-x-px before:h-full before:w-0.5 before:bg-[var(--border)]">
              {[
                {
                  step: "01",
                  title: "Import",
                  body: "Paste your GitHub URL. We analyze your code, README, and architecture.",
                },
                {
                  step: "02",
                  title: "Generate",
                  body: "AI crafts narratives, STAR stories, and talking points for your stack.",
                },
                {
                  step: "03",
                  title: "Practice",
                  body: "Master with flashcards and Socratic questions. Interview-ready in no time.",
                },
              ].map((item) => (
                <div key={item.step} className="relative flex items-start gap-8">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--background)] text-foreground font-mono text-sm font-bold shadow-sm shrink-0 relative z-10">
                    {item.step}
                  </div>
                  <div className="pt-1.5">
                    <h3 className="mb-2 text-xl font-semibold text-foreground">{item.title}</h3>
                    <p className="text-muted leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--card)]/20 px-6 py-8">
        <div className="mx-auto max-w-6xl text-center text-xs text-muted">
          © 2026 Repause. Built for developers.
        </div>
      </footer>
    </div>
  );
}
