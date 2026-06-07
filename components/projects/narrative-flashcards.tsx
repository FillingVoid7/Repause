"use client";

import { useState } from "react";

import type { FlashcardCategory, NarrativeFlashcard } from "@/types/project";

interface NarrativeFlashcardsProps {
  cards: NarrativeFlashcard[];
}

const CATEGORY_META: Record<
  FlashcardCategory,
  { label: string; color: string }
> = {
  decision: { label: "Decision", color: "var(--accent)" },
  tradeoff: { label: "Tradeoff", color: "#2563eb" },
  debt: { label: "Tech debt", color: "#9333ea" },
  bottleneck: { label: "Bottleneck", color: "#dc2626" },
  alternative: { label: "Alternative", color: "#0891b2" },
  concept: { label: "Concept", color: "#16a34a" },
};

export function NarrativeFlashcards({ cards }: NarrativeFlashcardsProps) {
  const [activeCategory, setActiveCategory] = useState<FlashcardCategory | "all">(
    "all",
  );
  const [flipped, setFlipped] = useState<Set<number>>(new Set());

  const categories = [...new Set(cards.map((c) => c.category))];
  const filtered =
    activeCategory === "all"
      ? cards
      : cards.filter((c) => c.category === activeCategory);

  function toggleFlip(index: number) {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <FilterChip
          active={activeCategory === "all"}
          onClick={() => setActiveCategory("all")}
          label={`All (${cards.length})`}
        />
        {categories.map((cat) => (
          <FilterChip
            key={cat}
            active={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
            label={CATEGORY_META[cat].label}
            color={CATEGORY_META[cat].color}
          />
        ))}
      </div>

      <div className="flashcard-grid">
        {filtered.map((card, index) => {
          const isFlipped = flipped.has(index);
          const meta = CATEGORY_META[card.category];

          return (
            <button
              key={`${card.front}-${index}`}
              type="button"
              onClick={() => toggleFlip(index)}
              className={`flashcard ${isFlipped ? "flashcard-flipped" : ""}`}
            >
              <div className="flashcard-inner">
                <div className="flashcard-face flashcard-front">
                  <span
                    className="flashcard-tag"
                    style={{ backgroundColor: `${meta.color}22`, color: meta.color }}
                  >
                    {meta.label}
                  </span>
                  <p className="flashcard-text">{card.front}</p>
                  <span className="flashcard-hint">Tap to reveal</span>
                </div>
                <div className="flashcard-face flashcard-back">
                  <p className="flashcard-text">{card.back}</p>
                  <span className="flashcard-hint">Tap to flip back</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flashcard-filter ${active ? "flashcard-filter-active" : ""}`}
      style={active && color ? { borderColor: color, color } : undefined}
    >
      {label}
    </button>
  );
}
