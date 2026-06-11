# Stackfold

AI Project Defense & Articulation Platform — train candidates to defend their own project architectures, tradeoffs, and decisions using GitHub repositories as the source of truth.

## Tech Stack

- **Framework**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **Auth**: Auth.js (NextAuth v5) — Google OAuth
- **Database**: MongoDB Atlas (native driver + Mongoose)
- **Storage**: GitHub repository data only

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `AUTH_SECRET` | Random secret (`openssl rand -base64 32`) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
| `GITHUB_TOKEN` | Optional PAT for higher GitHub API rate limits during scraping |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini API key for narrative generation |


### 3. Google OAuth setup

1. Create an OAuth 2.0 Client ID at [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Set **Authorized redirect URI** to `http://localhost:3000/api/auth/callback/google`
3. Copy Client ID and Client Secret into `.env.local`

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Phase 1 (Complete)

- [x] Next.js App Router with Tailwind styling utilities
- [x] NextAuth.js with MongoDB Atlas adapter (Google OAuth)
- [x] `lib/db.ts` — MongoDB connection pooling (native client + Mongoose)


## Phase 2 (Complete)

- [x] `lib/validateGitHubUrl.ts` — GitHub URL validation and normalization
- [x] `lib/githubScraper.ts` — README, file tree, languages, commits via Octokit
- [x] `lib/models.ts` — `projects` collection schema and persistence
- [x] `POST /api/ingest` — authenticated ingest endpoint
- [x] Dashboard import form and project cards

### Ingest a repository

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{"repoUrl": "https://github.com/vercel/next.js"}'
```

Or use the import form on `/dashboard` after signing in.

## Phase 3 (Complete)

- [x] `lib/geminiClient.ts` — Gemini Flash via Vercel AI SDK
- [x] `lib/generateNarrative.ts` — STAR pitch, tradeoffs, alternatives, debt, bottlenecks
- [x] `POST /api/projects/[id]/narrative` — generate and persist narrative
- [x] `PATCH /api/projects/[id]` — save review context (stack, role, JD, gaps)
- [x] `/projects/[id]/review` — two-column Project Review interface

### Generate a narrative

1. Import a repo on `/dashboard`
2. Open **Review & generate narrative**
3. Fill in stack context and target role
4. Click **Generate narrative**

## Project Structure

```
app/
  (auth)/login/          # Sign-in page
  api/auth/[...nextauth] # Auth.js route handlers
  api/ingest/            # Repository ingestion API
  api/projects/[id]/     # Project fetch, review update, narrative generation
  dashboard/             # Import repos and view project cards
  projects/[id]/review/  # Project Review & narrative studio
lib/
  db.ts                  # MongoDB Atlas connections

  geminiClient.ts        # Gemini Flash client
  generateNarrative.ts   # AI narrative prompts & generation
  validateGitHubUrl.ts   # GitHub URL parser/validator
  githubScraper.ts       # Octokit scraper
  models.ts              # Mongoose models (projects)
auth.ts                  # Auth.js configuration
auth.config.ts           # Edge-compatible auth config (middleware)
middleware.ts            # Route protection
```
