# Deploy Holicruit on Railway — click-by-click

A beginner-friendly walkthrough to get a live URL on your own domain. Budget
~30–45 minutes the first time. (Railway's UI wording may differ slightly from
below; the flow is the same.)

You'll do five things: get the code on GitHub → create the Railway app → add a
Postgres database → set a few settings → connect your domain.

> **Prerequisite:** the initial database migration must be committed first. If
> you haven't done it, follow **POSTGRES.md → One-time setup** (a few commands on
> your Mac) before Part 4 here.

---

## Part 0 — Put the code on GitHub (Railway deploys from GitHub)

Skip if the project is already on GitHub.

1. Create a free account at **github.com** if you don't have one.
2. On GitHub, click **New repository** → name it `holicruit` → keep it **Private** → **Create repository**. Don't add a README (you already have one).
3. On your Mac, in Terminal, from the project folder (`~/Holicruit`):
   ```
   cd ~/Holicruit
   git init            # only if it's not already a git repo
   git add .
   git commit -m "Holicruit MVP"
   git branch -M main
   git remote add origin https://github.com/<your-username>/holicruit.git
   git push -u origin main
   ```
   (Replace `<your-username>`. GitHub will ask you to sign in.)

> Note: your `.env` file is gitignored (good — it holds secrets). You'll re-enter
> those values in Railway in Part 3. Your `prisma/migrations/` folder **is**
> committed — that's what production applies.

---

## Part 1 — Create the Railway project

1. Go to **railway.com** → **Login** → sign in **with GitHub** (easiest).
2. Click **New Project** → **Deploy from GitHub repo**.
3. The first time, Railway asks to access your GitHub — approve it, and pick the
   `holicruit` repo.
4. Railway starts building automatically. **Let the first build fail or finish —
   we still need to add the database and settings**, so don't worry about the
   result yet.

---

## Part 2 — Add a Postgres database

1. In your project canvas, click **New → Database → Add PostgreSQL**.
2. Railway provisions a managed Postgres service (it appears as a second box next
   to your `holicruit` app). That's it — it's automatically backed up and holds
   your data across deploys. No volume/disk needed.

---

## Part 3 — Set the settings & environment variables

Open your **app** service (the `holicruit` box, not the database):

1. Go to the **Variables** tab → add these (click **New Variable** for each):

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
   | `AUTH_SECRET` | *(generate — see below)* |
   | `NEXT_PUBLIC_APP_URL` | `https://<your-domain>` (your reserved domain) |

   `${{Postgres.DATABASE_URL}}` references the database service — Railway offers
   it as a suggestion when you start typing `${{`. (If your Postgres service has a
   different name, use that name.)

   To generate `AUTH_SECRET`, run this on your Mac and paste the output as the value:
   ```
   npx auth secret
   ```
   (or `openssl rand -base64 32`)

   You can leave `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` unset — billing
   runs in stub mode without them.

2. Go to **Settings → Build & Deploy** and confirm the commands (Railway usually
   auto-detects these for Next.js; set them explicitly if it didn't):
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm run start`

---

## Part 4 — Deploy (tables are created automatically)

Unlike the old SQLite setup, you **don't** run any manual database command. The
start script does it:

```
prisma migrate deploy   →   seed demo data (if empty)   →   next start
```

1. Make sure your initial migration is committed (POSTGRES.md → One-time setup).
2. Click **Deploy** (or it redeploys automatically after saving variables).
3. Watch the deploy logs — you should see the migration apply and then
   "Seeded: …". When it goes green, the schema and demo accounts are live.

---

## Part 5 — Connect your domain

1. In your app service → **Settings → Networking → Custom Domain** → **Add Domain**.
2. Enter your domain. Two cases:
   - **A subdomain** like `app.yourdomain.com` (recommended, simplest): Railway
     shows a **CNAME target** (e.g. `xxxx.up.railway.app`).
   - **The root/apex** like `yourdomain.com`: Railway will guide you; apex domains
     need an **ALIAS/ANAME** record (or use `www` + a redirect). Subdomains are
     easier — I'd start with `app.` for the trial.
3. Log in to wherever you reserved the domain (your registrar) → **DNS settings**
   → add the record Railway told you to:
   - Type: **CNAME**
   - Name/Host: `app` (for `app.yourdomain.com`)
   - Value/Target: the `…up.railway.app` address Railway showed
4. Save. DNS can take a few minutes to a couple of hours. Railway shows a green
   check when it's verified and issues HTTPS automatically.
5. Make sure `NEXT_PUBLIC_APP_URL` (Part 3) matches the final domain, e.g.
   `https://app.yourdomain.com`. If you change it, redeploy.

---

## Part 6 — Test it

1. Open `https://<your-domain>`.
2. Click **Explore the demo** or go to `/login` → use a one-click demo account,
   or sign in manually (all demo accounts use `password123`).
3. Walk the demo path: as **Priya** (hiring manager) and **Sam** (candidate).

---

## Before you share the link with trial users

- The demo accounts use `password123` — fine for a guided trial; change or remove
  them before anything public.
- Consider replacing the initials-only avatars with a few real photos so it looks alive.
- Every push to your GitHub `main` branch now auto-deploys — so I can ship
  updates and they'll go live on your domain automatically. Schema changes ship
  the same way: their migrations are committed and apply on deploy.

---

### If you get stuck

Tell me where (which part/step) and paste any error text. Common ones:
- **Build fails on `prisma generate`** → make sure `npm install` is in the build command (it runs `prisma generate` automatically via postinstall).
- **App loads but login fails / "config" error** → `AUTH_SECRET` is missing or `NEXT_PUBLIC_APP_URL` doesn't match the domain.
- **"relation … does not exist" / no tables** → the initial migration wasn't committed before deploy. Do POSTGRES.md → One-time setup, commit `prisma/migrations`, push, redeploy.
- **App can't reach the database** → `DATABASE_URL` isn't referencing the Postgres service; re-check `${{Postgres.DATABASE_URL}}` in Variables.
