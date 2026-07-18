# Deploying a hosted demo

Goal: a shareable URL trial users can click into. Below is the least-friction
path plus the Vercel alternative. (I can't provision hosting or a database from
here — these are the exact steps for you, and I'm happy to make any config
change they require.)

## What the app needs

- **Node 20+** runtime, `npm run build` then `npm run start`.
- **A database.** The app currently uses **SQLite** (`provider = "sqlite"`,
  `DATABASE_URL=file:./dev.db`). SQLite is a file, so it needs a host that keeps
  a **persistent disk** between deploys.
- **Environment variables:**
  - `DATABASE_URL` — e.g. `file:/data/prod.db` (persistent-disk path) or a Postgres URL.
  - `AUTH_SECRET` — generate with `npx auth secret` (or `openssl rand -base64 32`).
  - `NEXT_PUBLIC_APP_URL` — the deployed URL, e.g. `https://holicruit.up.railway.app`.
  - `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — optional; leave blank to run billing in stub mode.

## Recommended: Railway or Render (keep SQLite, least work)

These run a real Node process with a mountable disk, so the current SQLite setup
works unchanged — ideal for a trial demo.

1. Push the repo to GitHub.
2. Create a new project from the repo on **Railway** (or a Render "Web Service").
3. Add a **persistent volume/disk** mounted at `/data`.
4. Set env vars:
   - `DATABASE_URL=file:/data/prod.db`
   - `AUTH_SECRET=…` (from `npx auth secret`)
   - `NEXT_PUBLIC_APP_URL=…` (the app's URL)
5. Build command: `npm install && npm run build` (postinstall already runs `prisma generate`).
   Start command: `npm run start`.
6. **First deploy only**, run once in the host's shell (or as a one-off job):
   ```
   npx prisma db push && npm run db:seed
   ```
7. Open the URL → log in with a demo account (all use `password123`), or the
   one-click demo buttons on `/login`.

## Alternative: Vercel (needs Postgres)

Vercel is serverless, so a SQLite file won't persist — you'd switch to a hosted
Postgres (Vercel Postgres, Neon, or Supabase). Steps:

1. Create a Postgres database and copy its connection string.
2. **Tell me and I'll switch the datasource** in `prisma/schema.prisma` from
   `sqlite` to `postgresql` (a one-line change plus a couple of column-type
   checks) and regenerate.
3. Set `DATABASE_URL` (Postgres), `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL` in Vercel.
4. Run `npx prisma db push && npm run db:seed` against the Postgres DB once.
5. Deploy.

## Before you share it

- Reseed so the demo looks alive: `npm run db:seed`.
- Consider seeding a few real photos/logos so profiles aren't all initials.
- The seeded demo accounts (Sam, Aisha, Diego, Priya, Jordan, FM) all use
  `password123` — fine for a guided trial; rotate or disable before anything public.

## My recommendation

For reaching trial users fast, use **Railway/Render with SQLite** — it's the
current setup, needs no code change, and a persistent disk is enough for a demo.
Move to Postgres only when you outgrow a single instance.
