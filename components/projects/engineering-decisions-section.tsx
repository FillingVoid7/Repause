import type { EngineeringDecision } from "@/types/project";

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
      <div className="decision-section-header">
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
            <h3 className="narrative-section-title">Key engineering decisions</h3>
            <span className="decision-section-pill">Decision matrix</span>
          </div>
          <p className="narrative-section-sub mt-1 max-w-2xl">
            &ldquo;Why did you choose X instead of Y?&rdquo; — prep for 30–40% of
            technical questions.
          </p>
        </div>
      </div>

      <div className="decision-grid mt-5">
        {decisions.map((entry, index) => (
          <article key={entry.decision} className="decision-card">
            <div className="decision-card-top">
              <span className="decision-card-number">{String(index + 1).padStart(2, "0")}</span>
              <h4 className="decision-card-title">{entry.decision}</h4>
            </div>

            <dl className="decision-card-fields">
              <div className="decision-field decision-field-highlight">
                <dt>Why chosen</dt>
                <dd>{entry.whyChosen}</dd>
              </div>
              <div className="decision-field decision-field-alt">
                <dt>Alternative considered</dt>
                <dd>{entry.alternativeConsidered}</dd>
              </div>
              <div className="decision-field decision-field-tradeoff">
                <dt>Tradeoff</dt>
                <dd>{entry.tradeoff}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
