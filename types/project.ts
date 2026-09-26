export type FlashcardCategory =
  | "decision"
  | "tradeoff"
  | "debt"
  | "bottleneck"
  | "alternative"
  | "concept";

export interface NarrativeFlashcard {
  category: FlashcardCategory;
  front: string;
  back: string;
}

export interface ArchitectureFlowNode {
  id: string;
  label: string;
  description: string;
}

export interface ArchitectureFlowEdge {
  from: string;
  to: string;
  label?: string;
}

export interface ArchitectureFlow {
  nodes: ArchitectureFlowNode[];
  edges: ArchitectureFlowEdge[];
}

export interface StarSections {
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface EngineeringDecision {
  decision: string;
  whyChosen: string;
  alternativeConsidered: string;
  tradeoff: string;
}

export interface FailureScenario {
  scenario: string;
  handling: string;
}

export type DeepDiveCategory =
  | "architecture"
  | "scalability"
  | "database"
  | "ai"
  | "security";

export interface DeepDiveQuestion {
  category: DeepDiveCategory;
  question: string;
  talkingPoints: string;
}

export interface ProjectNarrative {
  pitchSummary: string;
  star: StarSections;
  flashcards: NarrativeFlashcard[];
  architectureFlow: ArchitectureFlow;
  engineeringDecisions: EngineeringDecision[];
  failureScenarios: FailureScenario[];
  deepDiveQuestions: DeepDiveQuestion[];
  gaps: string[];
  /** @deprecated Legacy long-form fields — kept for older records */
  elevatorPitch?: string;
  architectureDecisions?: string;
  tradeoffs?: string;
  alternativeArchitectures?: string;
  technicalDebt?: string;
  bottlenecks?: string;
  recommendations?: string[];
}

export interface ProjectReview {
  /**
   * What the candidate personally built and the outcome it produced. This is
   * the one signal the scraper cannot infer from the repository, so it carries
   * the most weight in the generated narrative.
   */
  contribution: string;
  targetRole: string;
  companyTier: string;
  jobDescription: string;
  /**
   * @deprecated No longer collected or sent to the model. Retained so existing
   * documents and narrative snapshots keep round-tripping without a migration.
   */
  stackDescription: string;
  /** @deprecated No longer collected or sent to the model. See stackDescription. */
  additionalContext: string;
}

export type NarrativeStatus = "pending" | "generating" | "ready" | "failed";

/** Dashboard-facing projection of a project document. */
export interface ProjectSummary {
  id: string;
  repoOwner: string;
  repoName: string;
  repoUrl: string;
  status: string;
  narrativeStatus: NarrativeStatus;
  languageCount: number;
  fileCount: number;
  commitCount: number;
  scrapeError?: string;
  topLanguages: { name: string; share: number }[];
  updatedLabel: string;
  /** Primary destination: the study deck once generated, the review page before. */
  href: string;
  /** Always the review/context page, even when a deck already exists. */
  reviewHref: string;
}

export interface NarrativeHistoryEntry {
  id: string;
  contextHash: string;
  review: ProjectReview;
  narrative: ProjectNarrative;
  createdAt: string;
}

export interface SerializedProject {
  id: string;
  repoUrl: string;
  repoOwner: string;
  repoName: string;
  defaultBranch: string;
  readme: string;
  languages: Record<string, number>;
  fileCount: number;
  commitCount: number;
  review: ProjectReview;
  narrative: ProjectNarrative;
  narrativeContextHash?: string;
  narrativeReviewSnapshot?: ProjectReview;
  narrativeHistory?: NarrativeHistoryEntry[];
  narrativeStatus: NarrativeStatus;
  narrativeError?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}
