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
  - `NEXT_PUBLIC_APP_URL` — the deployed URL, e.g. `https://app.holicruit.com`.
  - `AUTH_URL` — **must** be the public URL, `https://app.holicruit.com` in
    production (otherwise NextAuth advertises `https://localhost:8080`).
  - `NEXT_PUBLIC_DEMO_LOGINS` — leave **unset** in production. Set to `1` only
    for a deliberate public demo: it shows the one-click demo buttons on `/login`
    and the "demo with fictional people" banner. Build-time: redeploy after changing.
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
   - `NEXT_PUBLIC_APP_URL=https://app.holicruit.com`
   - `AUTH_URL=https://app.holicruit.com`
   - (no `NEXT_PUBLIC_DEMO_LOGINS` unless this deployment is a public demo)
5. Build command: `npm install && npm run build` (postinstall runs `prisma generate`).
   Start command: `npm run start`.
6. Deploy. The start script runs `prisma db push --skip-generate` → seeds demo
   data (only if the db has no users) → `next start`. See **Boot safety** below.
7. Open the URL → log in with a demo account (all use `password123`). The
   one-click demo buttons on `/login` appear only with `NEXT_PUBLIC_DEMO_LOGINS=1`.

## Boot safety (production data)

`npm run start` is what Railway runs on every deploy. It is built to **fail
closed** — a deploy that would damage data stops instead, and Railway keeps the
previous deployment serving:

- **Schema sync never accepts data loss.** `prisma db push --skip-generate`
  (deliberately without `--accept-data-loss`) refuses any change that would drop
  or truncate data — a removed/renamed column or table, a narrowed type, a new
  unique constraint on existing rows — and exits non-zero, so `next start`
  never runs. Additive changes (new tables, optional or defaulted columns) apply
  automatically. For a destructive change: back up the Railway Postgres first,
  then apply it deliberately (e.g. `npx prisma db push --accept-data-loss`
  against the prod `DATABASE_URL`, or a reviewed migration), then redeploy.
- **The seed only fills an empty database.** If the users table has rows, the
  boot seed does nothing. If it can't even count users (DB unreachable,
  permissions), it exits non-zero rather than assuming "empty".
- **Wiping requires two keys.** The seed deletes data only on a local/CI
  database (`localhost`, docker-compose) or when **both** `SEED_FORCE=1` and
  `SEED_FORCE_CONFIRM=wipe-production` are set. `SEED_FORCE=1` alone is ignored
  with a warning. If you ever use both (e.g. to refresh a dedicated demo
  deployment), remove them right after that deploy — while set, **every** deploy
  wipes the database.
- Demo accounts (`@holicruit.test`, see `src/lib/demo.ts`) are isolated in
  matching: demo candidates are never matched into real users' roles and real
  candidates never into demo roles. The production smoke suite logs in with
  them, so first-boot seeding of an empty database stays on.

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
  Keep `NEXT_PUBLIC_DEMO_LOGINS` unset on the real production app; a public demo
  belongs on its own deployment and database (e.g. `demo.holicruit.com`).
- Login is throttled in-process (5 failed attempts per account / 20 per IP per
  15 min; 20 registrations per IP per hour — `src/lib/ratelimit.ts`). It is
  per-instance memory: if you scale beyond one Railway instance, move it to a
  shared store.

## My recommendation

Use **Railway with managed Postgres** (RAILWAY-SETUP.md). It's a real database
with backups and concurrency — the right foundation now that trial users create
real accounts — and the migration workflow (POSTGRES.md) keeps future schema
changes safe.
