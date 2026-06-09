"use client";

import { ArchitectureFlowDiagram } from "@/components/projects/architecture-flow-diagram";
import { DeepDiveQuestionsSection } from "@/components/projects/deep-dive-questions-section";
import { EngineeringDecisionsSection } from "@/components/projects/engineering-decisions-section";
import { FailureScenariosSection } from "@/components/projects/failure-scenarios-section";
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
    <div className="narrative-display space-y-10">
      {narrative.pitchSummary ? (
        <section className="narrative-pitch">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-[11px] font-bold text-white">
              ✦
            </span>
            <h3 className="narrative-section-title">Elevator pitch</h3>
          </div>
          <p className="narrative-pitch-text">{narrative.pitchSummary}</p>
        </section>
      ) : null}

      {narrative.architectureFlow.nodes.length > 0 ? (
        <section>
          <div className="narrative-section-header">
            <span className="narrative-section-icon" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M6 7h4v4H6V7Zm8 0h4v4h-4V7Zm-4 8h4v4h-4v-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M10 9h2m2 0h2M12 11v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <div className="narrative-section-copy">
              <h3 className="narrative-section-title">Architecture flow</h3>
              <p className="narrative-section-sub">
                Follow the data path — be ready to explain each hop.
              </p>
            </div>
          </div>
          <ArchitectureFlowDiagram flow={narrative.architectureFlow} />
        </section>
      ) : null}

      <EngineeringDecisionsSection decisions={narrative.engineeringDecisions} />

      <FailureScenariosSection scenarios={narrative.failureScenarios} />

      {starComplete ? (
        <section>
          <div className="narrative-section-header">
            <span className="narrative-section-icon" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 3.5l2.7 5.46 6.03.88-4.36 4.25 1.03 6.01L12 17.95 6.6 20.1l1.03-6.01L3.27 9.84l6.03-.88L12 3.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="narrative-section-copy">
              <h3 className="narrative-section-title">STAR story</h3>
              <p className="narrative-section-sub">
                A clean, memorable narrative for behavioral and technical follow-ups.
              </p>
            </div>
          </div>
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
          <div className="narrative-section-header">
            <span className="narrative-section-icon" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M6 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8" />
                <path d="M8 8h6M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <div className="narrative-section-copy">
              <h3 className="narrative-section-title">Study flashcards</h3>
              <p className="narrative-section-sub mb-4">Tap a card to flip.</p>
            </div>
          </div>
          <NarrativeFlashcards cards={narrative.flashcards} />
        </section>
      ) : null}

      <DeepDiveQuestionsSection questions={narrative.deepDiveQuestions} />

      {narrative.gaps.length > 0 ? (
        <section>
          <div className="narrative-section-header">
            <span className="narrative-section-icon" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M7 4h8l4 4v12H7V4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M11 12h4M11 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M15 4v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="narrative-section-copy">
              <h3 className="narrative-section-title">Personal gaps to clarify</h3>
              <p className="narrative-section-sub">
                Things only you can answer — fill these before the interview.
              </p>
            </div>
          </div>
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
