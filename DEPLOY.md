# Deploying a hosted demo

Goal: a shareable URL trial users can click into. Below is the least-friction
path plus the Vercel alternative. (I can't provision hosting or a database from
here — these are the exact steps for you, and I'm happy to make any config
change they require.)

## What the app needs

- **Node 20+** runtime, `npm run build` then `npm run start`.
- **A PostgreSQL database.** The app uses **Postgres** with **Prisma Migrate**
  (`provider = "postgresql"`; migrations committed in `prisma/migrations/`).
  Any managed Postgres works — Railway Postgres, Neon, Supabase, RDS.
- **Environment variables:**
  - `DATABASE_URL` — the Postgres connection string.
  - `AUTH_SECRET` — generate with `npx auth secret` (or `openssl rand -base64 32`).
  - `NEXT_PUBLIC_APP_URL` — the deployed URL, e.g. `https://holicruit.up.railway.app`.
  - `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — optional; leave blank to run billing in stub mode.

> **One-time first:** generate and commit the initial migration on your Mac —
> see **POSTGRES.md**. Production applies committed migrations automatically; it
> can't create tables without them.

## Recommended: Railway (managed Postgres, least work)

Step-by-step click walkthrough: **RAILWAY-SETUP.md**. In short:

1. Push the repo to GitHub (with `prisma/migrations/` committed).
2. Create a project from the repo on **Railway**.
3. **New → Database → Add PostgreSQL** (managed, backed up, no disk to manage).
4. Set env vars on the app service:
   - `DATABASE_URL=${{Postgres.DATABASE_URL}}` (references the database service)
   - `AUTH_SECRET=…` (from `npx auth secret`)
   - `NEXT_PUBLIC_APP_URL=…` (the app's URL)
5. Build command: `npm install && npm run build` (postinstall runs `prisma generate`).
   Start command: `npm run start`.
6. Deploy. The start script runs `prisma migrate deploy` → seeds demo data (if the
   db is empty) → `next start`. **No manual database command needed.**
7. Open the URL → log in with a demo account (all use `password123`), or the
   one-click demo buttons on `/login`.

## Alternative: Vercel + hosted Postgres

Vercel is serverless (no persistent process), so run the migrations as a deploy
step rather than at start:

1. Create a Postgres database (Neon/Supabase/Vercel Postgres) and copy its URL.
2. Set `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL` in Vercel.
3. Run migrations against it once (`npx prisma migrate deploy` with that
   `DATABASE_URL`) and seed (`npm run db:seed`), or wire them into the build.
4. Deploy.

## Before you share it

- Reseed so the demo looks alive: `npm run db:seed`.
- Consider seeding a few real photos/logos so profiles aren't all initials.
- The seeded demo accounts (Sam, Aisha, Diego, Priya, Jordan, FM) all use
  `password123` — fine for a guided trial; rotate or disable before anything public.

## My recommendation

Use **Railway with managed Postgres** (RAILWAY-SETUP.md). It's a real database
with backups and concurrency — the right foundation now that trial users create
real accounts — and the migration workflow (POSTGRES.md) keeps future schema
changes safe.
