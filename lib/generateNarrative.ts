import { generateObject } from "ai";
import { z } from "zod";

import { getGeminiFlash } from "@/lib/geminiClient";
import { formatGenerationError, repairJsonResponse } from "@/lib/narrativeErrors";
import type { ProjectReview } from "@/types/project";

const flashcardSchema = z.object({
  category: z.enum([
    "decision",
    "tradeoff",
    "debt",
    "bottleneck",
    "alternative",
    "concept",
  ]),
  front: z
    .string()
    .describe("Short question or concept — max ~12 words, interview-flashcard style."),
  back: z
    .string()
    .describe("Concise answer the candidate can memorize — max ~2 sentences."),
});

const engineeringDecisionSchema = z.object({
  decision: z
    .string()
    .describe("Technology or design choice, e.g. Next.js App Router or MongoDB."),
  whyChosen: z
    .string()
    .describe("Why this was chosen for THIS repo — max 2 sentences."),
  alternativeConsidered: z
    .string()
    .describe("Credible alternative, e.g. Express + React or PostgreSQL."),
  tradeoff: z
    .string()
    .describe("What you gave up — max 2 sentences."),
});

const failureScenarioSchema = z.object({
  scenario: z
    .string()
    .describe("What could go wrong — max 12 words, e.g. Gemini timeout."),
  handling: z
    .string()
    .describe("Production-grade handling — max 2 sentences."),
});

const deepDiveQuestionSchema = z.object({
  category: z.enum([
    "architecture",
    "scalability",
    "database",
    "ai",
    "security",
  ]),
  question: z
    .string()
    .describe("Exact interview question an interviewer would ask."),
  talkingPoints: z
    .string()
    .describe(
      "Key points to answer — concise phrases separated by semicolons, max 3 points.",
    ),
});

const narrativeSchema = z.object({
  pitchSummary: z
    .string()
    .describe("3-4 sentence elevator pitch. No bullet lists."),
  star: z.object({
    situation: z.string().describe("1-2 sentences."),
    task: z.string().describe("1-2 sentences."),
    action: z.string().describe("2-3 sentences max."),
    result: z.string().describe("1-2 sentences with measurable outcome if possible."),
  }),
  flashcards: z
    .array(flashcardSchema)
    .min(8)
    .max(14)
    .describe(
      "Study flashcards covering decisions, tradeoffs, debt, bottlenecks, alternatives, and key concepts.",
    ),
  architectureFlow: z.object({
    nodes: z
      .array(
        z.object({
          id: z.string().describe("snake_case id, e.g. intent_api"),
          label: z.string().describe("Short node label, max 4 words"),
          description: z.string().describe("One-line description, max 15 words"),
        }),
      )
      .min(4)
      .max(8),
    edges: z.array(
      z.object({
        from: z.string(),
        to: z.string(),
        label: z.string().optional().describe("Optional edge label, max 3 words"),
      }),
    ),
  }),
  engineeringDecisions: z
    .array(engineeringDecisionSchema)
    .min(4)
    .max(8)
    .describe(
      "Key engineering decisions with why chosen, alternative, and tradeoff. Cover stack, data, AI, and architecture patterns visible in this repo.",
    ),
  failureScenarios: z
    .array(failureScenarioSchema)
    .min(4)
    .max(8)
    .describe(
      "Production failure and edge cases — what breaks and how the system handles it.",
    ),
  deepDiveQuestions: z
    .array(deepDiveQuestionSchema)
    .min(12)
    .max(20)
    .describe(
      "Hard interview follow-ups grouped by category. At least 2 per category: architecture, scalability, database, ai, security.",
    ),
  gaps: z
    .array(z.string())
    .max(4)
    .describe(
      "Optional short personal prep gaps — things only the candidate can clarify. Max 4.",
    ),
});

export type GeneratedNarrative = z.infer<typeof narrativeSchema>;

export interface NarrativeInput {
  repoOwner: string;
  repoName: string;
  readme: string;
  languages: Record<string, number>;
  fileTreeSummary: string;
  recentCommits: string;
  review: ProjectReview;
}

const RETRYABLE_PATTERN =
  /high demand|rate limit|429|503|overloaded|try again/i;

function buildSystemPrompt(): string {
  return `You are a senior engineering interviewer coach. Output CONCISE, scannable study material — not essays.

CRITICAL FORMAT RULES:
- Return ONLY valid JSON that exactly matches the schema.
- Every array field must have the EXACT minimum items specified:
  * flashcards: EXACTLY 8-14 items (not fewer)
  * engineeringDecisions: EXACTLY 4-8 items
  * failureScenarios: EXACTLY 4-8 items
  * deepDiveQuestions: EXACTLY 12-20 items (at least 2 per category)
- architectureFlow.nodes: EXACTLY 4-8 items
- gaps: 0-4 items (can be empty)
- deepDiveQuestions must have exactly these categories: architecture, scalability, database, ai, security (at least 2 of each).
- Flashcard categories MUST be one of: decision, tradeoff, debt, bottleneck, alternative, concept.

CONTENT RULES:
- Every field must be brief. No numbered lists inside string fields.
- Flashcards: front = question/prompt, back = crisp defense answer.
- Cover at least 2 cards each for: decision, tradeoff, debt, bottleneck, alternative.
- architectureFlow: model the real pipeline/layers of THIS repo (left-to-right data flow).
- Node ids must be unique snake_case. Edges must reference valid node ids.
- engineeringDecisions: real choices from THIS repo's stack. Format answers for "Why X instead of Y?" interviews.
- failureScenarios: go beyond the happy path — AI failures, validation errors, DB failures, partial state.
- gaps: only personal unknowns the candidate must clarify — keep minimal.
- Be specific to this repository. Mark assumptions when repo evidence is thin.`;
}

function buildUserPrompt(input: NarrativeInput): string {
  return `Repository: ${input.repoOwner}/${input.repoName}

## README
${input.readme || "(No README — infer from structure.)"}

## Languages
${JSON.stringify(input.languages)}

## File tree
${input.fileTreeSummary}

## Recent commits
${input.recentCommits}

## Candidate context
- Stack: ${input.review.stackDescription || "(not provided)"}
- Role: ${input.review.targetRole || "(not provided)"}
- Tier: ${input.review.companyTier || "(not provided)"}
- JD: ${input.review.jobDescription || "(not provided)"}
- Notes: ${input.review.additionalContext || "(not provided)"}

Generate concise interview study material.`;
}

function isRetryableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return RETRYABLE_PATTERN.test(message);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateProjectNarrative(
  input: NarrativeInput,
): Promise<GeneratedNarrative> {
  const maxAttempts = 3;
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { object } = await generateObject({
        model: getGeminiFlash(),
        schema: narrativeSchema,
        system: buildSystemPrompt(),
        prompt: buildUserPrompt(input),
        temperature: 0.35,
      });

      return object;
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error("Narrative generation failed.");

      const errorMsg = lastError.message.toLowerCase();
      
      // Check if this is a schema validation error
      if (
        errorMsg.includes("did not match") ||
        errorMsg.includes("schema") ||
        errorMsg.includes("validation")
      ) {
        // For schema errors on final attempt, add repair suggestion
        if (attempt === maxAttempts) {
          throw new Error(
            `Schema validation failed after ${maxAttempts} attempts. Ensure all required fields are present and arrays meet min/max requirements. Last error: ${lastError.message}`,
          );
        }
        // On earlier attempts, retry with adjusted prompt
        await delay(1000 * attempt);
        continue;
      }

      if (attempt < maxAttempts && isRetryableError(error)) {
        await delay(1000 * attempt);
        continue;
      }

      if (attempt >= maxAttempts) {
        throw new Error(formatGenerationError(lastError, maxAttempts));
      }

      throw lastError;
    }
  }

  throw new Error(formatGenerationError(lastError, maxAttempts));
}
