"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import type { DeepDiveCategory, DeepDiveQuestion } from "@/types/project";

interface DeepDiveQuestionsSectionProps {
  questions: DeepDiveQuestion[];
}

const CATEGORY_META: Record<
  DeepDiveCategory,
  { label: string; icon: string }
> = {
  architecture: { label: "Architecture", icon: "◈" },
  scalability: { label: "Scalability", icon: "↗" },
  database: { label: "Database", icon: "▣" },
  ai: { label: "AI", icon: "✦" },
  security: { label: "Security", icon: "⛨" },
};

const CATEGORY_ORDER: DeepDiveCategory[] = [
  "architecture",
  "scalability",
  "database",
  "ai",
  "security",
];

export function DeepDiveQuestionsSection({
  questions,
}: DeepDiveQuestionsSectionProps) {
  const grouped = useMemo(() => {
    const map = new Map<DeepDiveCategory, DeepDiveQuestion[]>();

    for (const category of CATEGORY_ORDER) {
      map.set(category, []);
    }

    for (const question of questions) {
      const list = map.get(question.category) ?? [];
      list.push(question);
      map.set(question.category, list);
    }

    return CATEGORY_ORDER.map((category) => ({
      category,
      ...CATEGORY_META[category],
      questions: map.get(category) ?? [],
    })).filter((group) => group.questions.length > 0);
  }, [questions]);

  const [activeCategory, setActiveCategory] = useState<DeepDiveCategory>(
    grouped[0]?.category ?? "architecture",
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (grouped.length === 0) {
    return null;
  }

  const activeGroup =
    grouped.find((group) => group.category === activeCategory) ?? grouped[0];

  return (
    <section>
      <div className="narrative-section-header">
        <span className="narrative-section-icon" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 3a9 9 0 1 0 9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M12 11.2c1.3 0 2.3-1 2.3-2.2A2.3 2.3 0 0 0 12 6.7c-1.2 0-2.1.7-2.6 1.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M12 16.7h.01" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
        </span>
        <div className="narrative-section-copy">
          <h3 className="narrative-section-title">Deep-dive questions</h3>
          <p className="narrative-section-sub">
            The follow-ups interviewers ask after you explain the project.
          </p>
        </div>
      </div>

      <div className="deep-dive-filters mt-4">
        {grouped.map((group) => (
          <button
            key={group.category}
            type="button"
            onClick={() => {
              setActiveCategory(group.category);
              setExpandedId(null);
            }}
            className={cn(
              "deep-dive-filter",
              activeCategory === group.category && "deep-dive-filter-active",
            )}
          >
            <span aria-hidden>{group.icon}</span>
            {group.label}
            <span className="deep-dive-filter-count">{group.questions.length}</span>
          </button>
        ))}
      </div>

      <div className="deep-dive-list mt-4">
        {activeGroup.questions.map((entry, index) => {
          const id = `${activeGroup.category}-${index}`;
          const isExpanded = expandedId === id;
          const points = entry.talkingPoints
            .split(";")
            .map((point) => point.trim())
            .filter(Boolean);

          return (
            <article key={id} className="deep-dive-card">
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : id)}
                className="deep-dive-card-trigger"
              >
                <span className="deep-dive-card-index">{index + 1}</span>
                <span className="deep-dive-card-question">{entry.question}</span>
                <span
                  className={cn(
                    "deep-dive-card-chevron",
                    isExpanded && "deep-dive-card-chevron-open",
                  )}
                  aria-hidden
                >
                  ▾
                </span>
              </button>
              {isExpanded ? (
                <div className="deep-dive-card-answer">
                  <p className="deep-dive-card-answer-label">Talking points</p>
                  <ul>
                    {points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
