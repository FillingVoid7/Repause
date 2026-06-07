"use client";

import { signIn } from "next-auth/react";

export function SignInForm() {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className="btn btn-primary w-full"
    >
      Continue with Google
    </button>
  );
}
