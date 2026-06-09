import { normalizeNarrative } from "@/lib/narrativeLegacy";
import type {
  NarrativeHistoryEntry,
  NarrativeStatus,
  ProjectReview,
  SerializedProject,
} from "@/types/project";

interface FileTreeEntry {
  path: string;
  type: string;
}

interface RawProject {
  _id: { toString(): string };
  repoUrl: string;
  repoOwner: string;
  repoName: string;
  defaultBranch?: string;
  readme?: string;
  languages?: Map<string, number> | Record<string, number>;
  fileTree?: FileTreeEntry[];
  commitsMetadata?: unknown[];
  review?: Partial<ProjectReview> | null;
  narrative?: Record<string, unknown> | null;
  narrativeContextHash?: string | null;
  narrativeReviewSnapshot?: Partial<ProjectReview> | null;
  narrativeHistory?: {
    id: string;
    contextHash?: string;
    review?: Partial<ProjectReview> | null;
    narrative?: Record<string, unknown> | null;
    createdAt?: Date;
  }[];
  narrativeStatus?: NarrativeStatus;
  narrativeError?: string | null;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const EMPTY_REVIEW: ProjectReview = {
  stackDescription: "",
  targetRole: "",
  companyTier: "",
  jobDescription: "",
  additionalContext: "",
};

export function toLanguageRecord(
  languages?: Map<string, number> | Record<string, number>,
): Record<string, number> {
  if (!languages) {
    return {};
  }

  return languages instanceof Map
    ? Object.fromEntries(languages)
    : languages;
}

export function summarizeFileTree(fileTree: FileTreeEntry[]): string {
  const topLevel = new Set<string>();
  const extensions = new Map<string, number>();
  const directories = new Set<string>();

  for (const entry of fileTree) {
    const parts = entry.path.split("/");
    topLevel.add(parts[0]);

    if (entry.type === "tree" && parts.length <= 2) {
      directories.add(entry.path);
    }

    if (entry.type === "blob") {
      const ext = entry.path.includes(".")
        ? (entry.path.split(".").pop()?.toLowerCase() ?? "none")
        : "none";
      extensions.set(ext, (extensions.get(ext) ?? 0) + 1);
    }
  }

  const samplePaths = fileTree
    .filter((entry) => entry.type === "blob")
    .slice(0, 40)
    .map((entry) => entry.path);

  return JSON.stringify(
    {
      topLevelFolders: [...topLevel].sort(),
      keyDirectories: [...directories].sort().slice(0, 20),
      fileExtensions: Object.fromEntries(
        [...extensions.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15),
      ),
      samplePaths,
      totalEntries: fileTree.length,
    },
    null,
    2,
  );
}

export function summarizeCommits(
  commits: { message: string; author: string; date: string }[],
): string {
  if (commits.length === 0) {
    return "(No recent commits available)";
  }

  return commits
    .slice(0, 20)
    .map((commit) => `- [${commit.date}] ${commit.author}: ${commit.message}`)
    .join("\n");
}

export function serializeProject(project: RawProject): SerializedProject {
  const status = project.narrativeStatus ?? "pending";

  return {
    id: project._id.toString(),
    repoUrl: project.repoUrl,
    repoOwner: project.repoOwner,
    repoName: project.repoName,
    defaultBranch: project.defaultBranch ?? "main",
    readme: project.readme ?? "",
    languages: toLanguageRecord(project.languages),
    fileCount: project.fileTree?.length ?? 0,
    commitCount: project.commitsMetadata?.length ?? 0,
    review: {
      ...EMPTY_REVIEW,
      stackDescription: project.review?.stackDescription ?? "",
      targetRole: project.review?.targetRole ?? "",
      companyTier: project.review?.companyTier ?? "",
      jobDescription: project.review?.jobDescription ?? "",
      additionalContext: project.review?.additionalContext ?? "",
    },
    narrative: normalizeNarrative(project.narrative ?? {}),
    narrativeContextHash: project.narrativeContextHash ?? undefined,
    narrativeReviewSnapshot: project.narrativeReviewSnapshot
      ? {
          ...EMPTY_REVIEW,
          stackDescription: project.narrativeReviewSnapshot.stackDescription ?? "",
          targetRole: project.narrativeReviewSnapshot.targetRole ?? "",
          companyTier: project.narrativeReviewSnapshot.companyTier ?? "",
          jobDescription: project.narrativeReviewSnapshot.jobDescription ?? "",
          additionalContext:
            project.narrativeReviewSnapshot.additionalContext ?? "",
        }
      : undefined,
    narrativeHistory: serializeNarrativeHistory(project.narrativeHistory),
    narrativeStatus: status,
    narrativeError:
      status === "failed" ? (project.narrativeError ?? undefined) : undefined,
    status: project.status ?? "ready",
    createdAt: project.createdAt?.toISOString(),
    updatedAt: project.updatedAt?.toISOString(),
  };
}

function serializeNarrativeHistory(
  history?: RawProject["narrativeHistory"],
): NarrativeHistoryEntry[] {
  if (!history?.length) {
    return [];
  }

  return history.map((entry) => ({
    id: entry.id,
    contextHash: entry.contextHash ?? "",
    review: {
      ...EMPTY_REVIEW,
      stackDescription: entry.review?.stackDescription ?? "",
      targetRole: entry.review?.targetRole ?? "",
      companyTier: entry.review?.companyTier ?? "",
      jobDescription: entry.review?.jobDescription ?? "",
      additionalContext: entry.review?.additionalContext ?? "",
    },
    narrative: normalizeNarrative(entry.narrative ?? {}),
    createdAt: entry.createdAt?.toISOString() ?? new Date().toISOString(),
  }));
}
