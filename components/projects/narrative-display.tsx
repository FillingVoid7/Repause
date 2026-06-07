"use client";

import { ArchitectureFlowDiagram } from "@/components/projects/architecture-flow-diagram";
import { NarrativeFlashcards } from "@/components/projects/narrative-flashcards";
import { hasStructuredNarrative } from "@/lib/narrativeLegacy";
import type { ProjectNarrative } from "@/types/project";

interface NarrativeDisplayProps {
  narrative: ProjectNarrative;
}

export function NarrativeDisplay({ narrative }: NarrativeDisplayProps) {
  const structured = hasStructuredNarrative(narrative);

  if (!structured) {
    return <LegacyNarrative narrative={narrative} />;
  }

  const starComplete = Object.values(narrative.star).some(Boolean);

  return (
    <div className="narrative-display space-y-8">
      {narrative.pitchSummary ? (
        <section className="narrative-pitch">
          <h3 className="narrative-section-title">Elevator pitch</h3>
          <p className="narrative-pitch-text">{narrative.pitchSummary}</p>
        </section>
      ) : null}

      {narrative.architectureFlow.nodes.length > 0 ? (
        <section>
          <h3 className="narrative-section-title">Architecture flow</h3>
          <p className="narrative-section-sub">
            Follow the data path — be ready to explain each hop.
          </p>
          <ArchitectureFlowDiagram flow={narrative.architectureFlow} />
        </section>
      ) : null}

      {starComplete ? (
        <section>
          <h3 className="narrative-section-title">STAR story</h3>
          <div className="star-grid">
            <StarCard letter="S" title="Situation" text={narrative.star.situation} />
            <StarCard letter="T" title="Task" text={narrative.star.task} />
            <StarCard letter="A" title="Action" text={narrative.star.action} />
            <StarCard letter="R" title="Result" text={narrative.star.result} />
          </div>
        </section>
      ) : null}

      {narrative.flashcards.length > 0 ? (
        <section>
          <h3 className="narrative-section-title">Study flashcards</h3>
          <p className="narrative-section-sub">
            Tap a card to flip. Filter by category to drill weak spots.
          </p>
          <NarrativeFlashcards cards={narrative.flashcards} />
        </section>
      ) : null}

      {narrative.gaps.length > 0 ? (
        <section>
          <h3 className="narrative-section-title">Gaps to fill</h3>
          <ul className="gap-list">
            {narrative.gaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function StarCard({
  letter,
  title,
  text,
}: {
  letter: string;
  title: string;
  text: string;
}) {
  if (!text) {
    return null;
  }

  return (
    <div className="star-card">
      <span className="star-card-letter">{letter}</span>
      <div>
        <p className="star-card-title">{title}</p>
        <p className="star-card-text">{text}</p>
      </div>
    </div>
  );
}

function LegacyNarrative({ narrative }: { narrative: ProjectNarrative }) {
  const sections = [
    { title: "Elevator pitch", content: narrative.elevatorPitch },
    { title: "Architecture decisions", content: narrative.architectureDecisions },
    { title: "Tradeoffs", content: narrative.tradeoffs },
    { title: "Technical debt", content: narrative.technicalDebt },
  ].filter((s) => s.content);

  return (
    <div className="space-y-4">
      <p className="rounded-lg border border-[var(--border)] bg-[var(--accent-subtle)]/50 px-3 py-2 text-xs text-muted">
        This is a legacy narrative. Regenerate to get flashcards and architecture
        diagrams.
      </p>
      {narrative.pitchSummary ? (
        <p className="text-sm">{narrative.pitchSummary}</p>
      ) : null}
      {sections.map((section) => (
        <div key={section.title}>
          <h3 className="text-sm font-medium">{section.title}</h3>
          <p className="mt-1 line-clamp-6 text-sm text-muted">{section.content}</p>
        </div>
      ))}
    </div>
  );
}
