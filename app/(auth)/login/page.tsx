import { Suspense } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Logo } from "@/components/logo";

export const metadata = {
  title: "Sign in",
  description:
    "Sign in to Repause to turn your repositories into interview-ready narratives.",
};

const PILLARS = [
  {
    step: "01",
    title: "Read your repository",
    body: "We map the architecture, decisions, and trade-offs already written in your code.",
  },
  {
    step: "02",
    title: "Frame the interview",
    body: "Tell us the role and the company tier, and the narrative sharpens to match.",
  },
  {
    step: "03",
    title: "Rehearse the answers",
    body: "STAR stories, flashcards, failure scenarios, and deep-dive questions in one deck.",
  },
];

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="grid flex-1 lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <section className="relative hidden overflow-hidden bg-[#0c0a09] px-12 py-12 text-[#f5f3f0] lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="dot-field pointer-events-none absolute inset-0 opacity-40"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-1/3 h-[420px] w-[420px] rounded-full bg-[var(--accent)]/25 blur-[130px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 right-0 h-[380px] w-[380px] rounded-full bg-[#f97316]/10 blur-[120px]"
        />

        <div className="relative">
          <Logo size="md" tone="invert" />
        </div>

        <div className="relative max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/45">
            Interview intelligence
          </p>
          <h1 className="mt-5 text-[2.75rem] font-semibold leading-[1.08] tracking-[-0.03em] text-white">
            Own the story
            <br />
            behind your code.
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/60">
            Repause reads every public repository you have built and turns it into
            the narrative, trade-offs, and questions you need to defend your work
            in a technical interview.
          </p>

          <ol className="mt-10 space-y-5">
            {PILLARS.map((pillar) => (
              <li key={pillar.step} className="flex gap-4">
                <span className="mt-0.5 font-mono text-xs font-semibold tabular-nums text-[var(--accent)]">
                  {pillar.step}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-white/90">
                    {pillar.title}
                  </span>
                  <span className="mt-1 block text-[13px] leading-relaxed text-white/50">
                    {pillar.body}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <p className="relative text-xs text-white/35">
          Public repositories only. Your imported context stays in your workspace.
        </p>
      </section>

      {/* Form panel */}
      <section className="flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-[25rem]">
          <div className="panel hairline-top p-7 sm:p-8">
            <div className="mb-8 flex justify-center lg:hidden">
              <Logo size="md" />
            </div>

            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                Welcome back
              </p>
              <h2 className="mt-3 text-[1.6rem] font-semibold tracking-tight">
                Sign in to Repause
              </h2>
              <p className="mx-auto mt-2 max-w-[17rem] text-[13px] leading-relaxed text-muted">
                One click with Google. We never see or store your password.
              </p>
            </div>

            <div className="mt-7">
              <Suspense fallback={<div className="skeleton h-[3.25rem] w-full" />}>
                <SignInForm />
              </Suspense>
            </div>

            <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 border-t border-[var(--border)] pt-4 text-[11px] text-muted">
              {["Google single sign-on", "No password stored"].map(
                (item, index) => (
                  <li key={item} className="flex items-center gap-2">
                    {index > 0 ? (
                      <span aria-hidden="true" className="text-muted/50">
                        ·
                      </span>
                    ) : null}
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>

          <p className="mt-7 text-center text-[11px] leading-relaxed text-muted">
            By continuing you agree to use Repause for interview preparation.
          </p>
        </div>
      </section>
    </div>
  );
}
