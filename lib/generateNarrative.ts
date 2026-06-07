import { generateObject } from "ai";
import { z } from "zod";

import { getGeminiFlash } from "@/lib/geminiClient";
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
  gaps: z
    .array(z.string())
    .max(6)
    .describe("Short gaps the candidate must clarify — each max one sentence."),
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

Rules:
- Every field must be brief. No numbered lists inside string fields.
- Flashcards: front = question/prompt, back = crisp defense answer.
- Cover at least 2 cards each for: decision, tradeoff, debt, bottleneck, alternative.
- architectureFlow: model the real pipeline/layers of THIS repo (left-to-right data flow).
- Node ids must be unique snake_case. Edges must reference valid node ids.
- gaps: actionable prep items, not paragraphs.
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

      if (attempt < maxAttempts && isRetryableError(error)) {
        await delay(1000 * attempt);
        continue;
      }

      throw lastError;
    }
  }

  throw lastError ?? new Error("Narrative generation failed.");
}
