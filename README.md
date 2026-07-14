# Repause

AI Project Defense & Articulation Platform — train candidates to defend their own project architectures, tradeoffs, and decisions using GitHub repositories as the source of truth.

## Features

- **GitHub Integration**: Import your repositories directly into the platform.
- **Narrative Generation**: Automatically generate technical narratives based on your stack and target role.
- **Project Defense**: Practice articulating your engineering decisions and architectural tradeoffs.

## Tech Stack

- **Framework**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **Auth**: Auth.js (NextAuth v5) — Google OAuth
- **Database**: MongoDB Atlas (native driver + Mongoose)
- **Storage**: GitHub repository data only

## Getting Started

### Using Docker (Recommended)
1. **Login to Docker Hub** (if required):
   ```bash
   docker login
   ```

2. **Pull the latest image**:
   ```bash
   docker pull bhwn7/stacktold:latest
   ```

### Local Development

If you prefer to run the project locally from the source code:

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` file with `MONGODB_URI` and `AUTH_SECRET`.
4. Start the development server:
   ```bash
   npm run dev
   ```

## How to use

1. Import a repository on `/dashboard`.
2. Open **Review & generate narrative**.
3. Fill in the specific stack context and your target role.
4. Click **Generate narrative** to see your customized defense script.
