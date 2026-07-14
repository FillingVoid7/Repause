# Repause

AI Project Defense & Articulation Platform — train candidates to defend their own project architectures, tradeoffs, and decisions using GitHub repositories as the source of truth.

## Tech Stack

- **Framework**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **Auth**: Auth.js (NextAuth v5) — Google OAuth
- **Database**: MongoDB Atlas (native driver + Mongoose)
- **Storage**: GitHub repository data only


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
