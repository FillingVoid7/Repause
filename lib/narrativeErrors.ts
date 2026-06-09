export function formatGenerationError(
  error: unknown,
  maxAttempts = 3,
): string {
  const lastError =
    error instanceof Error ? error.message : "Narrative generation failed.";

  return `Failed after ${maxAttempts} attempts. Last error: ${lastError}`;
}

export function repairJsonResponse(jsonStr: string): string {
  try {
    JSON.parse(jsonStr);
    return jsonStr;
  } catch {
  }

  let repaired = jsonStr
    .replace(/,(\s*[}\]])/g, "$1")
    .replace(/"\s*:\s*"([^"]*?)"\s+"/g, '": "$1", "')
    .replace(/}\s*{/g, "}, {")
    .replace(/]\s*\[/g, "], [");

  try {
    JSON.parse(repaired);
    return repaired;
  } catch {
    return jsonStr; 
  }
}
