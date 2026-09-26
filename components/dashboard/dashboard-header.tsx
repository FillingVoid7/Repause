import Link from "next/link";

import { signOut } from "@/auth";
import { Logo } from "@/components/logo";

interface DashboardHeaderProps {
  name?: string | null;
  email?: string | null;
}

export function DashboardHeader({ name, email }: DashboardHeaderProps) {
  const displayName = name?.trim() || email?.split("@")[0] || "there";
  const identity = email?.trim() || name?.trim() || "Signed in";
  const initial = (displayName[0] ?? "R").toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)]/80 bg-[var(--background)]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6">
        <Link href="/dashboard" className="focus-ring rounded-xl">
          <Logo size="sm" />
        </Link>

        <div className="flex items-center gap-2">
          <details className="group/account relative">
            <summary
              aria-label="Account menu"
              className="focus-ring flex cursor-pointer list-none items-center gap-2 rounded-xl p-1 pr-1.5 transition-colors hover:bg-[var(--accent-subtle)]/60 [&::-webkit-details-marker]:hidden"
            >
              <span className="avatar-tile h-8 w-8 rounded-lg text-[13px]">
                {initial}
              </span>
              <span className="hidden max-w-[9rem] truncate text-[13px] font-medium sm:inline">
                {displayName}
              </span>
            </summary>

            <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-xl shadow-black/5">
              <div className="border-b border-[var(--border)] px-4 py-3">
                <p className="truncate text-sm font-semibold">{displayName}</p>
                <p className="mt-0.5 truncate text-xs text-muted">{identity}</p>
              </div>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <button
                  type="submit"
                  className="w-full px-4 py-2.5 text-left text-sm text-muted transition-colors hover:bg-[var(--accent-subtle)]/60 hover:text-foreground"
                >
                  Sign out
                </button>
              </form>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
