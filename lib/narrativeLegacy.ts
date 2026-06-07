import type {
  ArchitectureFlow,
  ArchitectureFlowEdge,
  ArchitectureFlowNode,
  NarrativeFlashcard,
  ProjectNarrative,
  StarSections,
} from "@/types/project";

const EMPTY_STAR: StarSections = {
  situation: "",
  task: "",
  action: "",
  result: "",
};

const EMPTY_FLOW: ArchitectureFlow = { nodes: [], edges: [] };

function stripMongoFields<T extends Record<string, unknown>>(obj: T): T {
  const { _id, __v, ...rest } = obj;
  return rest as T;
}

function sanitizeFlashcard(raw: Record<string, unknown>): NarrativeFlashcard {
  const card = stripMongoFields(raw);
  return {
    category: card.category as NarrativeFlashcard["category"],
    front: String(card.front ?? ""),
    back: String(card.back ?? ""),
  };
}

function sanitizeNode(raw: Record<string, unknown>): ArchitectureFlowNode {
  const node = stripMongoFields(raw);
  return {
    id: String(node.id ?? ""),
    label: String(node.label ?? ""),
    description: String(node.description ?? ""),
  };
}

function sanitizeEdge(raw: Record<string, unknown>): ArchitectureFlowEdge {
  const edge = stripMongoFields(raw);
  return {
    from: String(edge.from ?? ""),
    to: String(edge.to ?? ""),
    label: edge.label ? String(edge.label) : undefined,
  };
}

function sanitizeArchitectureFlow(raw: unknown): ArchitectureFlow {
  if (!raw || typeof raw !== "object") {
    return EMPTY_FLOW;
  }

  const flow = raw as Record<string, unknown>;
  const nodes = Array.isArray(flow.nodes)
    ? flow.nodes.map((n) =>
        sanitizeNode(n as Record<string, unknown>),
      )
    : [];
  const edges = Array.isArray(flow.edges)
    ? flow.edges.map((e) =>
        sanitizeEdge(e as Record<string, unknown>),
      )
    : [];

  return { nodes, edges };
}

/** Normalize narrative from DB — plain objects safe for Client Components. */
export function normalizeNarrative(
  raw: Partial<ProjectNarrative> & Record<string, unknown>,
): ProjectNarrative {
  const star = normalizeStar(raw);
  const pitchSummary =
    (raw.pitchSummary as string) ||
    (raw.elevatorPitch as string)?.slice(0, 500) ||
    "";

  const flashcards = Array.isArray(raw.flashcards)
    ? raw.flashcards.map((card) =>
        sanitizeFlashcard(card as unknown as Record<string, unknown>),
      )
    : [];

  const architectureFlow = sanitizeArchitectureFlow(raw.architectureFlow);

  const gaps = Array.isArray(raw.gaps)
    ? (raw.gaps as string[]).map(String)
    : Array.isArray(raw.recommendations)
      ? (raw.recommendations as string[]).map(String)
      : [];

  return {
    pitchSummary,
    star,
    flashcards,
    architectureFlow,
    gaps,
    elevatorPitch: raw.elevatorPitch as string | undefined,
    architectureDecisions: raw.architectureDecisions as string | undefined,
    tradeoffs: raw.tradeoffs as string | undefined,
    alternativeArchitectures: raw.alternativeArchitectures as
      | string
      | undefined,
    technicalDebt: raw.technicalDebt as string | undefined,
    bottlenecks: raw.bottlenecks as string | undefined,
    recommendations: raw.recommendations as string[] | undefined,
  };
}

function normalizeStar(
  raw: Partial<ProjectNarrative> & Record<string, unknown>,
): StarSections {
  if (raw.star && typeof raw.star === "object" && "situation" in raw.star) {
    const s = stripMongoFields(
      raw.star as unknown as Record<string, unknown>,
    );
    return {
      situation: String(s.situation ?? ""),
      task: String(s.task ?? ""),
      action: String(s.action ?? ""),
      result: String(s.result ?? ""),
    };
  }

  const legacy = typeof raw.star === "string" ? raw.star : "";
  if (!legacy) {
    return EMPTY_STAR;
  }

  return {
    situation: extractSection(legacy, "Situation"),
    task: extractSection(legacy, "Task"),
    action: extractSection(legacy, "Action"),
    result: extractSection(legacy, "Result"),
  };
}

function extractSection(text: string, heading: string): string {
  const pattern = new RegExp(
    `${heading}:\\s*([\\s\\S]*?)(?=\\n(?:Situation|Task|Action|Result):|$)`,
    "i",
  );
  const match = text.match(pattern);
  return match?.[1]?.trim().slice(0, 400) ?? "";
}

export function hasStructuredNarrative(narrative: ProjectNarrative): boolean {
  return (
    narrative.flashcards.length > 0 ||
    narrative.architectureFlow.nodes.length > 0
  );
}
