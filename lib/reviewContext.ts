import { createHash } from "crypto";

import type { ProjectReview } from "@/types/project";

/**
 * Trims every field defensively. Projects stored before `contribution` existed
 * have no such key, so this must tolerate a partial review rather than throw.
 */
export function normalizeReview(review: ProjectReview): ProjectReview {
  const text = (value: string | undefined) => value?.trim() ?? "";

  return {
    contribution: text(review.contribution),
    targetRole: text(review.targetRole),
    companyTier: text(review.companyTier),
    jobDescription: text(review.jobDescription),
    stackDescription: text(review.stackDescription),
    additionalContext: text(review.additionalContext),
  };
}

export function hashReviewContext(review: ProjectReview): string {
  const normalized = normalizeReview(review);
  // Only fields the candidate can actually edit take part in the hash, so
  // regenerating is driven by real edits rather than by retired fields.
  const payload = JSON.stringify([
    normalized.contribution,
    normalized.targetRole,
    normalized.companyTier,
    normalized.jobDescription,
  ]);

  return createHash("sha256").update(payload).digest("hex").slice(0, 16);
}

export function formatReviewSummary(review: ProjectReview): string {
  const parts = [
    review.targetRole && `Role: ${review.targetRole}`,
    review.companyTier && `Tier: ${review.companyTier}`,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : "Empty context";
}

export function formatReviewParts(review: ProjectReview) {
  const normalized = normalizeReview(review);

  return {
    role: normalized.targetRole || "",
    tier: normalized.companyTier || "",
    stack: normalized.stackDescription || "",
  };
}
