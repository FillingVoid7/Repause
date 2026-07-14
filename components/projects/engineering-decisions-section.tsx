"use client";

import { useState } from "react";
import type { EngineeringDecision } from "@/types/project";
import { cn } from "@/lib/utils";

interface EngineeringDecisionsSectionProps {
  decisions: EngineeringDecision[];
}

export function EngineeringDecisionsSection({
  decisions,
}: EngineeringDecisionsSectionProps) {
  if (decisions.length === 0) {
    return null;
  }

  return (
    <section className="decision-section">
      <div className="decision-section-header mb-8">
        <span className="decision-section-icon" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3l7 4v10l-7 4-7-4V7l7-4Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="M9.5 12h5M12 9.5v5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Key engineering decisions</h3>
          </div>
          <p className="mt-2 text-base text-muted max-w-2xl leading-relaxed">
            Understand the "Why" behind the architecture — key tradeoffs and decisions made during development.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {decisions.map((entry, index) => (
          <DecisionCard key={entry.decision} entry={entry} index={index} />
        ))}
      </div>
    </section>
  );
}

function DecisionCard({ entry, index }: { entry: EngineeringDecision; index: number }) {
  const [activeTab, setActiveTab] = useState<"why" | "alt" | "tradeoff">("why");

  return (
    <article className="flex flex-col rounded-2xl border border-[var(--border)] bg-card shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[var(--accent)]/50">
      <div className="p-5 border-b border-[var(--border)] bg-[var(--accent-subtle)]/20">
        <div className="flex items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-xs font-bold text-white shadow-md shadow-[var(--accent)]/20 mt-0.5">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h4 className="font-semibold text-foreground text-lg leading-tight">
            {entry.decision}
          </h4>
        </div>
      </div>

      <div className="flex flex-col flex-1 bg-background">
        <div className="flex border-b border-[var(--border)] bg-muted/10">
          <button
            onClick={() => setActiveTab("why")}
            className={cn(
              "flex-1 px-3 py-3 text-sm font-semibold border-b-2 transition-all duration-200",
              activeTab === "why" ? "border-[var(--accent)] text-foreground bg-background shadow-[0_1px_0_0_var(--accent)]" : "border-transparent text-muted hover:text-foreground hover:bg-muted/30"
            )}
          >
            Why Chosen
          </button>
          <button
            onClick={() => setActiveTab("alt")}
            className={cn(
              "flex-1 px-3 py-3 text-sm font-semibold border-b-2 transition-all duration-200",
              activeTab === "alt" ? "border-[var(--accent)] text-foreground bg-background shadow-[0_1px_0_0_var(--accent)]" : "border-transparent text-muted hover:text-foreground hover:bg-muted/30"
            )}
          >
            Alternatives
          </button>
          <button
            onClick={() => setActiveTab("tradeoff")}
            className={cn(
              "flex-1 px-3 py-3 text-sm font-semibold border-b-2 transition-all duration-200",
              activeTab === "tradeoff" ? "border-[var(--accent)] text-foreground bg-background shadow-[0_1px_0_0_var(--accent)]" : "border-transparent text-muted hover:text-foreground hover:bg-muted/30"
            )}
          >
            Tradeoffs
          </button>
        </div>

        <div className="p-6 flex-1 text-[15px] leading-relaxed text-muted-foreground bg-background min-h-[120px]">
          {activeTab === "why" && (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <p>{entry.whyChosen}</p>
            </div>
          )}
          {activeTab === "alt" && (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <p>{entry.alternativeConsidered}</p>
            </div>
          )}
          {activeTab === "tradeoff" && (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <p>{entry.tradeoff}</p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
