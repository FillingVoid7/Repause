import { Octokit } from "@octokit/rest";

import type { ParsedGitHubRepo } from "@/lib/validateGitHubUrl";

export interface FileTreeEntry {
  path: string;
  type: "blob" | "tree";
  size?: number;
}

export interface CommitMetadata {
  sha: string;
  message: string;
  author: string;
  date: string;
}

export interface ScrapedRepository {
  owner: string;
  repo: string;
  repoUrl: string;
  readme: string;
  languages: Record<string, number>;
  fileTree: FileTreeEntry[];
  commitsMetadata: CommitMetadata[];
  defaultBranch: string;
}

const README_CANDIDATES = [
  "README.md",
  "Readme.md",
  "readme.md",
  "README.MD",
  "README",
];

const MAX_COMMITS = 30;
const MAX_FILE_TREE_ENTRIES = 500;

function createOctokit(token?: string): Octokit {
  const resolvedToken = token ?? getGitHubToken();

  return new Octokit({
    ...(resolvedToken ? { auth: resolvedToken } : {}),
    userAgent: "repause-ingest",
  });
}

function getGitHubToken(): string | undefined {
  const candidates = [
    process.env.GITHUB_TOKEN,
    process.env.GH_TOKEN,
    process.env.GITHUB_PAT,
  ];

  return candidates
    .map((value) => value?.trim())
    .find((value): value is string => Boolean(value));
}

function decodeContent(content: string, encoding: string): string {
  if (encoding === "base64") {
    return Buffer.from(content, "base64").toString("utf-8");
  }
  return content;
}

async function fetchReadme(
  octokit: Octokit,
  owner: string,
  repo: string,
): Promise<string> {
  for (const filename of README_CANDIDATES) {
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: filename,
      });

      if (!Array.isArray(data) && data.type === "file" && "content" in data) {
        return decodeContent(data.content, data.encoding);
      }
    } catch (error) {
      if (isNotFoundError(error)) {
        continue;
      }
      throw error;
    }
  }

  return "";
}

async function fetchLanguages(
  octokit: Octokit,
  owner: string,
  repo: string,
): Promise<Record<string, number>> {
  const { data } = await octokit.repos.listLanguages({ owner, repo });
  return data;
}

async function fetchFileTree(
  octokit: Octokit,
  owner: string,
  repo: string,
  defaultBranch: string,
): Promise<FileTreeEntry[]> {
  const { data: ref } = await octokit.git.getRef({
    owner,
    repo,
    ref: `heads/${defaultBranch}`,
  });

  const { data: tree } = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: ref.object.sha,
    recursive: "1",
  });

  return (tree.tree ?? [])
    .filter((entry) => entry.path && entry.type)
    .slice(0, MAX_FILE_TREE_ENTRIES)
    .map((entry) => ({
      path: entry.path!,
      type: entry.type as "blob" | "tree",
      size: entry.size,
    }));
}

async function fetchCommits(
  octokit: Octokit,
  owner: string,
  repo: string,
): Promise<CommitMetadata[]> {
  const { data } = await octokit.repos.listCommits({
    owner,
    repo,
    per_page: MAX_COMMITS,
  });

  return data.map((commit) => ({
    sha: commit.sha,
    message: commit.commit.message,
    author: commit.commit.author?.name ?? "Unknown",
    date: commit.commit.author?.date ?? new Date(0).toISOString(),
  }));
}

function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === 404
  );
}

function isUnauthorizedError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  if ("status" in error && typeof error.status === "number") {
    return error.status === 401;
  }

  if ("message" in error && typeof error.message === "string") {
    const message = error.message.toLowerCase();
    return (
      message.includes("bad credentials") ||
      message.includes("requires authentication")
    );
  }

  return false;
}

function toScraperError(error: unknown): Error {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === 404
  ) {
    return new Error(
      "Repository not found. Check the URL or ensure the repository is public.",
    );
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === 401
  ) {
    return new Error(
      "GitHub rejected the provided credentials. If the repository is public, the scraper will retry without authentication; otherwise provide a valid token.",
    );
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === 403
  ) {
    return new Error(
      "GitHub API rate limit exceeded. Add GITHUB_TOKEN to your environment or try again later.",
    );
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error("Failed to scrape GitHub repository.");
}

/**
 * Fetches README, languages, file tree, and recent commits for a repository.
 */
export async function scrapeGitHubRepository(
  parsed: ParsedGitHubRepo,
): Promise<ScrapedRepository> {
  const octokit = createOctokit();
  const { owner, repo, normalizedUrl } = parsed;

  try {
    const { data: repository } = await octokit.repos.get({ owner, repo });
    const defaultBranch = repository.default_branch;

    const [readme, languages, fileTree, commitsMetadata] = await Promise.all([
      fetchReadme(octokit, owner, repo),
      fetchLanguages(octokit, owner, repo),
      fetchFileTree(octokit, owner, repo, defaultBranch),
      fetchCommits(octokit, owner, repo),
    ]);

    return {
      owner,
      repo,
      repoUrl: normalizedUrl,
      readme,
      languages,
      fileTree,
      commitsMetadata,
      defaultBranch,
    };
  } catch (error) {
    if (isUnauthorizedError(error)) {
      const octokitUnauth = createOctokit("");
      try {
        const { data: repository } = await octokitUnauth.repos.get({ owner, repo });
        const defaultBranch = repository.default_branch;

        const [readme, languages, fileTree, commitsMetadata] = await Promise.all([
          fetchReadme(octokitUnauth, owner, repo),
          fetchLanguages(octokitUnauth, owner, repo),
          fetchFileTree(octokitUnauth, owner, repo, defaultBranch),
          fetchCommits(octokitUnauth, owner, repo),
        ]);

        return {
          owner,
          repo,
          repoUrl: normalizedUrl,
          readme,
          languages,
          fileTree,
          commitsMetadata,
          defaultBranch,
        };
      } catch (error) {
        throw toScraperError(error);
      }
    }
    throw toScraperError(error);
  }
}
