"use client";

import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  id: string;
  title: string;
  summary?: string;
  icon?: React.ReactNode;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({
  id,
  title,
  summary,
  icon,
  children,
}: CollapsibleSectionProps) {
  return (
    <section 
      id={id} 
      className="scroll-mt-32 rounded-2xl border border-transparent p-6 transition-all duration-300 hover:border-[var(--border)] hover:bg-[var(--accent-subtle)]/10 hover:shadow-lg"
    >
      <div className="mb-6">
        <div className="flex items-center gap-3">
          {icon && (
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/20">
              {icon}
            </span>
          )}
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h2>
        </div>
        {summary && (
          <div className="mt-4 pl-[3px] border-l-2 border-[var(--border)]">
            <p className="pl-4 text-base text-muted max-w-[750px] leading-relaxed">
              {summary}
            </p>
          </div>
        )}
      </div>

      <div className="max-w-[750px]">
        {children}
      </div>
    </section>
  );
}
