import Link from "next/link";
import { Logo } from "@/components/logo";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata = {
  title: "Sign in — Repause",
};

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-6 py-16">
      <div className="card w-full max-w-md">
        <div className="mb-8 space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Sign in to your account
          </h1>
          <p className="text-sm text-muted">
            Sign in with your Google account to get started.
          </p>
        </div>

        <SignInForm />

        <p className="mt-8 text-center text-xs text-muted">
          By continuing, you agree to use Repause for interview preparation
          purposes.
        </p>
      </div>
    </div>
  );
}
