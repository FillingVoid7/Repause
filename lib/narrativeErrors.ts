export function formatGenerationError(
  error: unknown,
  maxAttempts = 3,
): string {
  const lastError =
    error instanceof Error ? error.message : "Narrative generation failed.";

  return `Failed after ${maxAttempts} attempts. Last error: ${lastError}`;
}
