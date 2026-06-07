import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

const DEFAULT_MODEL = "gemini-1.5-flash";

let geminiFlashModel: LanguageModel | undefined;

function getGoogleProvider() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Missing environment variable: "GOOGLE_GENERATIVE_AI_API_KEY"',
    );
  }

  return createGoogleGenerativeAI({ apiKey });
}

/** Gemini Flash model for narrative generation and analysis. */
export function getGeminiFlash(): LanguageModel {
  if (!geminiFlashModel) {
    const google = getGoogleProvider();
    geminiFlashModel = google(process.env.GEMINI_MODEL ?? DEFAULT_MODEL);
  }

  return geminiFlashModel;
}
