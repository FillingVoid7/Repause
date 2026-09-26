const GITHUB_HOST_PATTERN =
  /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/?#]+)\/([^/?#]+)/i;

// Repo segment may contain dots (e.g. "next.js"); a trailing ".git" is
// stripped by cleanRepoName rather than excluded from the match.
const GITHUB_SSH_PATTERN = /^git@github\.com:([^/]+)\/([^/]+)$/i;

const SHORTHAND_PATTERN = /^([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?)\/([a-zA-Z0-9._-]+)$/;

const INVALID_REPO_SEGMENTS = new Set([
  "settings",
  "orgs",
  "organizations",
  "marketplace",
  "explore",
  "topics",
  "collections",
  "events",
  "sponsors",
  "login",
  "signup",
  "new",
  "search",
]);

export interface ParsedGitHubRepo {
  owner: string;
  repo: string;
  normalizedUrl: string;
}

export type GitHubUrlValidationResult =
  | { ok: true; data: ParsedGitHubRepo }
  | { ok: false; error: string };

function cleanRepoName(repo: string): string {
  return repo.replace(/\.git$/i, "");
}

function isValidOwner(owner: string): boolean {
  return /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(owner);
}

function isValidRepo(repo: string): boolean {
  return (
    /^[a-zA-Z0-9._-]+$/.test(repo) &&
    repo.length > 0 &&
    repo.length <= 100 &&
    !INVALID_REPO_SEGMENTS.has(repo.toLowerCase())
  );
}

function buildResult(owner: string, repo: string): GitHubUrlValidationResult {
  const cleanedOwner = owner.trim();
  const cleanedRepo = cleanRepoName(repo.trim());

  if (!isValidOwner(cleanedOwner)) {
    return { ok: false, error: "Invalid GitHub owner name." };
  }

  if (!isValidRepo(cleanedRepo)) {
    return { ok: false, error: "Invalid GitHub repository name." };
  }

  return {
    ok: true,
    data: {
      owner: cleanedOwner,
      repo: cleanedRepo,
      normalizedUrl: `https://github.com/${cleanedOwner}/${cleanedRepo}`,
    },
  };
}

/**
 * Validates and normalizes GitHub repository URLs.
 * Accepts HTTPS, SSH, and owner/repo shorthand forms.
 */
export function validateGitHubUrl(input: string): GitHubUrlValidationResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return { ok: false, error: "Repository URL is required." };
  }

  const sshMatch = trimmed.match(GITHUB_SSH_PATTERN);
  if (sshMatch) {
    return buildResult(sshMatch[1], sshMatch[2]);
  }

  const httpsMatch = trimmed.match(GITHUB_HOST_PATTERN);
  if (httpsMatch) {
    return buildResult(httpsMatch[1], httpsMatch[2]);
  }

  const shorthandMatch = trimmed.match(SHORTHAND_PATTERN);
  if (shorthandMatch && !trimmed.includes("://") && !trimmed.includes("@")) {
    return buildResult(shorthandMatch[1], shorthandMatch[2]);
  }

  return {
    ok: false,
    error:
      "Invalid GitHub repository URL. Use https://github.com/owner/repo or owner/repo.",
  };
}
