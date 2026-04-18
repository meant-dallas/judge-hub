# JudgeHub

A Next.js judging application with Google OAuth authentication, role-based access control, and a PostgreSQL backend (SQLite for local development).

## Overview

JudgeHub streamlines the judging process for competitions and events. It supports three user roles — Admin, Coordinator, and Judge — and organises work around **Events**, each with Participants, Criteria, and assigned Judges.

Key capabilities:
- **Live judging sessions** — coordinators control which participant is currently presenting; judges score only the active participant
- **Score normalization** — optional per-judge z-score normalization removes leniency/strictness bias from the final leaderboard
- **Overtime deduction** — configurable time limit per event with an automatic point deduction for participants who run over
- **Results leaderboard** — ranked view per event, available once an event is marked complete

## User Roles

| Role | Can do |
|------|--------|
| **Admin** | Everything: manage users, create events, manage participants/criteria/judges, view results |
| **Coordinator** | Manage participants, criteria, and judges within events; run live sessions; view results |
| **Judge** | Score assigned participants; see only the currently presenting participant during live sessions |

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4
- **Authentication**: NextAuth.js v5 with Google OAuth
- **Database**: Drizzle ORM — SQLite (`better-sqlite3`) locally, Neon PostgreSQL in production
- **Deployment**: Vercel

## Local Development

### Prerequisites

- Node.js 20+
- A Google Cloud project with OAuth 2.0 credentials ([setup guide](docs/deployment.md#step-3--create-a-production-google-oauth-app))

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and fill in values
cp .env.example .env.local

# 3. Apply the schema to the local SQLite database
npm run db:push

# 4. Insert your first admin user
sqlite3 local.db "INSERT INTO users (email, role, name, status, created_at, notes)
  VALUES ('you@gmail.com', 'admin', 'Your Name', 'active', datetime('now'), '');"

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with the Google account you inserted above.

### Environment variables

Copy `.env.example` to `.env.local` and set:

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_URL` | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Any random string locally (`openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 client secret |
| `DATABASE_URL` | Omit (defaults to `file:./local.db`) or set explicitly |

### Database scripts

```bash
npm run db:push    # Apply schema changes to the database
npm run db:studio  # Open Drizzle Studio (visual DB browser)
```

## Project Structure

```
judgehub/
├── app/
│   ├── admin/              # Admin dashboard (events, users)
│   ├── coordinator/        # Coordinator dashboard
│   ├── judge/              # Judge scoring interface
│   └── api/                # API routes + server actions
├── components/
│   ├── admin/              # Admin-specific components
│   ├── coordinator/        # Coordinator-specific components
│   ├── shared/             # Shared components (EventTabNav, EventLeaderboard, …)
│   └── judge/              # Judge scoring form
├── lib/
│   ├── db/                 # Drizzle ORM — schema, queries, db client
│   └── auth.ts             # NextAuth configuration
├── types/                  # TypeScript interfaces
├── docs/                   # Guides
│   ├── deployment.md       # Vercel + Neon deployment walkthrough
│   └── zscore-normalization.md  # Manual test cases for score normalization
└── TASKS.md                # Development roadmap
```

## Deployment

See **[docs/deployment.md](docs/deployment.md)** for the full step-by-step guide covering:
- Neon PostgreSQL setup
- Production Google OAuth credentials
- Vercel environment variables
- Adding the first admin user
- Schema migrations

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Drizzle Studio |
