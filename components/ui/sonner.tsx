"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[var(--card)] group-[.toaster]:text-[var(--foreground)] group-[.toaster]:border-[var(--border)] group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-[var(--muted)]",
          actionButton:
            "group-[.toast]:bg-[var(--accent)] group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-[var(--accent-subtle)] group-[.toast]:text-[var(--foreground)]",
          error:
            "group-[.toast]:border-[var(--danger)]/30 group-[.toast]:text-[var(--danger)]",
          success:
            "group-[.toast]:border-[var(--accent)]/30 group-[.toast]:text-[var(--accent)]",
        },
      }}
      {...props}
    />
  );
}
