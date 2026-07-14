"use client";

import { ArchitectureFlowDiagram } from "@/components/projects/architecture-flow-diagram";
import { DeepDiveQuestionsSection } from "@/components/projects/deep-dive-questions-section";
import { EngineeringDecisionsSection } from "@/components/projects/engineering-decisions-section";
import { FailureScenariosSection } from "@/components/projects/failure-scenarios-section";
import { NarrativeFlashcards } from "@/components/projects/narrative-flashcards";
import { CollapsibleSection } from "@/components/projects/collapsible-section";
import { TableOfContents, type TocItem } from "@/components/projects/table-of-contents";
import { hasStructuredNarrative } from "@/lib/narrativeLegacy";
import type { ProjectNarrative } from "@/types/project";

interface NarrativeDisplayProps {
  narrative: ProjectNarrative;
  hideToc?: boolean;
}

export function NarrativeDisplay({ narrative, hideToc = false }: NarrativeDisplayProps) {
  const structured = hasStructuredNarrative(narrative);

  if (!structured) {
    return <LegacyNarrative narrative={narrative} />;
  }

  const starComplete = Object.values(narrative.star).some(Boolean);

  const tocItems: TocItem[] = [];
  if (narrative.pitchSummary) tocItems.push({ id: "pitch", title: "Elevator Pitch" });
  if (narrative.architectureFlow.nodes.length > 0) tocItems.push({ id: "architecture", title: "Architecture Flow" });
  if (narrative.engineeringDecisions.length > 0) tocItems.push({ id: "decisions", title: "Engineering Decisions" });
  if (narrative.failureScenarios.length > 0) tocItems.push({ id: "failures", title: "Failure Scenarios" });
  if (starComplete) tocItems.push({ id: "star", title: "STAR Story" });
  if (narrative.flashcards.length > 0) tocItems.push({ id: "flashcards", title: "Study Flashcards" });
  if (narrative.deepDiveQuestions.length > 0) tocItems.push({ id: "deep-dives", title: "Deep Dive Questions" });
  if (narrative.gaps.length > 0) tocItems.push({ id: "gaps", title: "Personal Gaps" });

  const content = (
    <div className="narrative-display flex flex-col gap-12 w-full">
      {narrative.pitchSummary ? (
        <CollapsibleSection
          id="pitch"
          title="Elevator Pitch"
          defaultExpanded={true}
          summary={narrative.pitchSummary}
          icon={<svg viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>} children={undefined}        >
          {/* No extra details for pitch */}
        </CollapsibleSection>
      ) : null}

      {narrative.architectureFlow.nodes.length > 0 ? (
        <CollapsibleSection
          id="architecture"
          title="Architecture Flow"
          summary="The application reads your repository, extracts the architecture using AI, stores metadata, and generates interview-ready explanations."
          icon={
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M6 7h4v4H6V7Zm8 0h4v4h-4V7Zm-4 8h4v4h-4v-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M10 9h2m2 0h2M12 11v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          }
        >
          <ArchitectureFlowDiagram flow={narrative.architectureFlow} />
        </CollapsibleSection>
      ) : null}

      {narrative.engineeringDecisions.length > 0 ? (
        <CollapsibleSection
          id="decisions"
          title="Engineering Decisions"
          summary="Key trade-offs and architectural choices made during development, formatted to help you defend them in system design interviews."
          icon={
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        >
          <EngineeringDecisionsSection decisions={narrative.engineeringDecisions} />
        </CollapsibleSection>
      ) : null}

      {narrative.failureScenarios.length > 0 ? (
        <CollapsibleSection
          id="failures"
          title="Failure Scenarios"
          summary="Anticipated points of failure, bottlenecks, and the handling mechanisms implemented to gracefully recover."
          icon={
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 9v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        >
          <FailureScenariosSection scenarios={narrative.failureScenarios} />
        </CollapsibleSection>
      ) : null}

      {starComplete ? (
        <CollapsibleSection
          id="star"
          title="STAR Story"
          summary="A cohesive behavioral narrative structured as Situation, Task, Action, and Result."
          icon={
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 3.5l2.7 5.46 6.03.88-4.36 4.25 1.03 6.01L12 17.95 6.6 20.1l1.03-6.01L3.27 9.84l6.03-.88L12 3.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            </svg>
          }
        >
          <div className="star-grid mt-4">
            <StarCard letter="S" title="Situation" text={narrative.star.situation} />
            <StarCard letter="T" title="Task" text={narrative.star.task} />
            <StarCard letter="A" title="Action" text={narrative.star.action} />
            <StarCard letter="R" title="Result" text={narrative.star.result} />
          </div>
        </CollapsibleSection>
      ) : null}

      {narrative.flashcards.length > 0 ? (
        <CollapsibleSection
          id="flashcards"
          title="Study Flashcards"
          summary="Interactive flashcards to quickly test your recall on the most critical components of the project."
          icon={
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M6 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8" />
              <path d="M8 8h6M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          }
        >
          <NarrativeFlashcards cards={narrative.flashcards} />
        </CollapsibleSection>
      ) : null}

      {narrative.deepDiveQuestions.length > 0 ? (
        <CollapsibleSection
          id="deep-dives"
          title="Deep Dive Questions"
          summary="Tough technical questions an interviewer might ask, complete with detailed talking points."
          icon={
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        >
          <DeepDiveQuestionsSection questions={narrative.deepDiveQuestions} />
        </CollapsibleSection>
      ) : null}

      {narrative.gaps.length > 0 ? (
        <CollapsibleSection
          id="gaps"
          title="Personal Gaps"
          summary="Things only you can answer — fill these context gaps before the interview."
          icon={
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M7 4h8l4 4v12H7V4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M11 12h4M11 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M15 4v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          }
        >
          <ul className="gap-list mt-4">
            {narrative.gaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        </CollapsibleSection>
      ) : null}
    </div>
  );

  if (hideToc) {
    return content;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-12 items-start w-full">
      <TableOfContents items={tocItems} />
      <div className="min-w-0">
        {content}
      </div>
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
