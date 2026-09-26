"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const AUTH_ERRORS: Record<string, string> = {
  AccessDenied:
    "That Google account is not authorised for Repause.",
  OAuthAccountNotLinked:
    "That Google account belongs to a different Repause user. Sign in with the original account.",
  OAuthCallback: "Google could not finish the sign-in. Please try again.",
  Configuration:
    "Sign-in is misconfigured on this deployment. Please contact the administrator.",
};

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);
  // Auth.js sends failures back as ?error=… on a fresh page load.
  const [error, setError] = useState<string | null>(() => {
    const code = searchParams.get("error");
    return code ? describeError(code) : null;
  });

  const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"));

  async function handleSignIn() {
    if (isPending) return;

    setIsPending(true);
    setError(null);

    try {
      const result = await signIn("google", {
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError(describeError(result.error));
        setIsPending(false);
        return;
      }

      if (result?.url) {
        window.location.assign(result.url);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("We could not reach Google. Check your connection and retry.");
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleSignIn}
        disabled={isPending}
        aria-busy={isPending}
        className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-3.5 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-[var(--accent)]/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-wait disabled:opacity-80"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[var(--accent)]/10 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        />
        {isPending ? (
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent)]/30 border-t-[var(--accent)]"
          />
        ) : (
          <GoogleMark />
        )}
        <span className="relative">
          {isPending ? "Opening Google…" : "Continue with Google"}
        </span>
      </button>

      <p
        role="alert"
        aria-live="polite"
        className="min-h-[1.125rem] text-center text-xs text-danger"
      >
        {error}
      </p>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="relative h-[18px] w-[18px]"
    >
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.92l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.28a7.2 7.2 0 0 1 0-4.56V6.63H1.28a12 12 0 0 0 0 10.74l4.01-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.63l4.01 3.09C6.23 6.88 8.88 4.77 12 4.77Z"
      />
    </svg>
  );
}

function safeCallbackUrl(value: string | null): string {
  if (!value) return "/dashboard";

  try {
    const url = new URL(value, window.location.origin);

    // Same-origin only, so the param can never become an open redirect.
    if (url.origin !== window.location.origin) return "/dashboard";

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/dashboard";
  }
}

function describeError(code: string): string {
  return (
    AUTH_ERRORS[code] ?? "Google sign-in was interrupted. Please try again."
  );
}
