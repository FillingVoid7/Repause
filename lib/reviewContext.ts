import { createHash } from "crypto";

import type { ProjectReview } from "@/types/project";

export function normalizeReview(review: ProjectReview): ProjectReview {
  return {
    stackDescription: review.stackDescription.trim(),
    targetRole: review.targetRole.trim(),
    companyTier: review.companyTier.trim(),
    jobDescription: review.jobDescription.trim(),
    additionalContext: review.additionalContext.trim(),
  };
}

export function hashReviewContext(review: ProjectReview): string {
  const normalized = normalizeReview(review);
  const payload = JSON.stringify([
    normalized.stackDescription,
    normalized.targetRole,
    normalized.companyTier,
    normalized.jobDescription,
    normalized.additionalContext,
  ]);

  return createHash("sha256").update(payload).digest("hex").slice(0, 16);
}

export function formatReviewSummary(review: ProjectReview): string {
  const parts = [
    review.targetRole && `Role: ${review.targetRole}`,
    review.companyTier && `Tier: ${review.companyTier}`,
    review.stackDescription &&
      `Stack: ${review.stackDescription.slice(0, 60)}${review.stackDescription.length > 60 ? "…" : ""}`,
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
