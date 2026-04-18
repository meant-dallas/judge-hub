# Deployment Guide

This app deploys to **Vercel** with **Neon PostgreSQL** as the production database.
Local development uses SQLite — no database setup needed locally.

---

## Prerequisites

- GitHub repository (push your code if not already done)
- [Vercel account](https://vercel.com)
- [Neon account](https://neon.tech)
- Google Cloud Console access (for OAuth credentials)

---

## Step 1 — Set up Neon PostgreSQL

1. Go to [console.neon.tech](https://console.neon.tech) and create a new project
2. Choose a region close to your Vercel deployment region (default: `us-east-1`)
3. Once created, open the project dashboard and click **Connection Details**
4. Copy the **connection string** — it looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
5. Keep this handy — it becomes your `DATABASE_URL` in Vercel

---

## Step 2 — Apply the database schema to Neon

Run this once from your local machine with the Neon connection string:

```bash
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require" \
  npx drizzle-kit push
```

Confirm the tables were created:

```bash
DATABASE_URL="..." npx drizzle-kit studio
```

This creates the six tables: `users`, `events`, `participants`, `criteria`, `scores`, `assignments`.

---

## Step 3 — Create a production Google OAuth app

Your existing local OAuth credentials work for `localhost:3000` only.
You need a separate OAuth client (or updated redirect URIs) for production.

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Open your project → **APIs & Services** → **Credentials**
3. Click **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Name: e.g. `JudgeHub Production`
4. Under **Authorized JavaScript origins**, add:
   ```
   https://your-app.vercel.app
   ```
5. Under **Authorized redirect URIs**, add:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```
6. Click **Create** and copy the **Client ID** and **Client Secret**

> If you don't know your Vercel URL yet, deploy first (Step 4), then come back and add it.

---

## Step 4 — Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repository
2. Framework preset will auto-detect as **Next.js** — leave defaults
3. Before clicking Deploy, open **Environment Variables** and add all of the following:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string from Step 1 |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` (your Vercel domain) |
| `NEXTAUTH_SECRET` | A random secret — generate with `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | From Step 3 |
| `GOOGLE_CLIENT_SECRET` | From Step 3 |

4. Click **Deploy**

> **Note:** `NEXTAUTH_URL` must match the exact domain Vercel assigns (no trailing slash).
> If you later add a custom domain, update this value.

---

## Step 5 — Add your first admin user

The database starts empty — no users exist, so nobody can sign in yet.
Insert yourself as the first admin directly via Neon's SQL editor:

1. Go to your Neon project → **SQL Editor**
2. Run:
   ```sql
   INSERT INTO users (email, role, name, status, created_at, notes)
   VALUES (
     'your-email@gmail.com',
     'admin',
     'Your Name',
     'active',
     now()::text,
     ''
   );
   ```
3. Sign in to the deployed app with that Google account
4. From the Admin → Users page, add other users and assign their roles

---

## Step 6 — Verify the deployment

- [ ] Sign in with Google — redirects to `/admin`
- [ ] Create an event, add participants, add criteria
- [ ] Assign a judge and submit scores from the judge account
- [ ] Mark event as Complete and verify Results tab shows the leaderboard

---

## Redeployments

Vercel redeploys automatically on every push to `main`.
No manual steps needed unless environment variables change.

If you make schema changes (new columns/tables):

```bash
DATABASE_URL="<neon-url>" npx drizzle-kit push
```

Run this before or immediately after deploying the new code.

---

## Custom domain (optional)

1. Vercel dashboard → your project → **Settings** → **Domains** → add your domain
2. Update `NEXTAUTH_URL` in Vercel environment variables to the new domain
3. Update the **Authorized JavaScript origins** and **Authorized redirect URIs** in Google Cloud Console
4. Redeploy (or Vercel will redeploy automatically on env var change)

---

## Environment variables reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes (prod) | Neon PostgreSQL connection string. Omit locally to use SQLite. |
| `NEXTAUTH_URL` | Yes | Full URL of the deployment, e.g. `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Yes | Random 32-byte secret for signing session tokens |
| `GOOGLE_CLIENT_ID` | Yes | OAuth 2.0 client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Yes | OAuth 2.0 client secret from Google Cloud Console |
