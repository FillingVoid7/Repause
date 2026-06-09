import type { FailureScenario } from "@/types/project";

interface FailureScenariosSectionProps {
  scenarios: FailureScenario[];
}

export function FailureScenariosSection({
  scenarios,
}: FailureScenariosSectionProps) {
  if (scenarios.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="narrative-section-header">
        <span className="narrative-section-icon bg-[var(--danger)] shadow-[var(--danger)]/20" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 4.5 4.8 19h14.4L12 4.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M12 9v4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M12 16.2h.01" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
        </span>
        <div className="narrative-section-copy">
          <h3 className="narrative-section-title">Failure & edge cases</h3>
          <p className="narrative-section-sub">
            Beyond the happy path — show production thinking when things break.
          </p>
        </div>
      </div>

      <div className="failure-table-wrap mt-4">
        <table className="failure-table">
          <thead>
            <tr>
              <th>Scenario</th>
              <th>Handling</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((entry) => (
              <tr key={entry.scenario}>
                <td className="failure-scenario">{entry.scenario}</td>
                <td className="failure-handling">{entry.handling}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
