"use client";

import React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "muted" | "accent";

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  const base = "inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-[12px] font-medium";

  const variantClass =
    variant === "accent"
      ? "bg-[var(--accent-subtle)] text-accent"
      : variant === "muted"
      ? "border border-[var(--border)] text-muted"
      : "bg-[var(--card)] text-foreground";

  return (
    <span className={cn(base, variantClass, className)}>{children}</span>
  );
}
