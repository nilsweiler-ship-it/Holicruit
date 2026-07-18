# Deploy Holicruit on Railway — click-by-click

A beginner-friendly walkthrough to get a live URL on your own domain. Budget
~30–45 minutes the first time. (Railway's UI wording may differ slightly from
below; the flow is the same.)

You'll do five things: get the code on GitHub → create the Railway app → add a
disk for the database → set a few settings → connect your domain.

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
> those values in Railway in Part 3.

---

## Part 1 — Create the Railway project

1. Go to **railway.com** → **Login** → sign in **with GitHub** (easiest).
2. Click **New Project** → **Deploy from GitHub repo**.
3. The first time, Railway asks to access your GitHub — approve it, and pick the
   `holicruit` repo.
4. Railway starts building automatically. **Let the first build fail or finish —
   we still need to add the database disk and settings**, so don't worry about
   the result yet.

---

## Part 2 — Add a disk for the database (important)

Holicruit's database is a single file (SQLite). Without a persistent disk it
would reset on every deploy. So:

1. Open your service (the box named `holicruit`) → **Settings** tab (or the
   **Volumes** section, depending on the UI).
2. Click **Add Volume** (a.k.a. "Attach Volume" / "New Volume").
3. Set the **Mount path** to:
   ```
   /data
   ```
4. Save. (A small size like 1 GB is plenty.)

---

## Part 3 — Set the settings & environment variables

Still in your service:

1. Go to the **Variables** tab → add these (click **New Variable** for each):

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | `file:/data/prod.db` |
   | `AUTH_SECRET` | *(generate — see below)* |
   | `NEXT_PUBLIC_APP_URL` | `https://<your-domain>` (your reserved domain) |

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

3. Click **Deploy** (or it redeploys automatically after saving variables). Wait
   for it to finish (green).

---

## Part 4 — Create the database tables & demo data (one time)

The disk is empty on first deploy, so create the schema and seed once:

1. In your service, open the **Command / Shell** (Railway has a "Run a command"
   or terminal option in the service menu). If you can't find an in-dashboard
   shell, install the Railway CLI on your Mac (`npm i -g @railway/cli`, then
   `railway login` and `railway link`), and run the command with `railway run …`.
2. Run:
   ```
   npx prisma db push && npm run db:seed
   ```
3. You should see "Seeded: …" in the output. This creates every table (including
   the new `avatarUrl`, `traitProfile`, `whenAt` columns) and loads the demo
   accounts.

---

## Part 5 — Connect your domain

1. In your service → **Settings → Networking → Custom Domain** → **Add Domain**.
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

- Reseed if you've changed data: rerun `npm run db:seed` (Part 4).
- Consider replacing the initials-only avatars with a few real photos so it looks alive.
- The demo accounts use `password123` — fine for a guided trial; change or remove
  them before anything public.
- Every push to your GitHub `main` branch now auto-deploys — so I can ship
  updates and they'll go live on your domain automatically.

---

### If you get stuck

Tell me where (which part/step) and paste any error text. Common ones:
- **Build fails on `prisma generate`** → make sure `npm install` is in the build command (it runs `prisma generate` automatically via postinstall).
- **App loads but login fails / "config" error** → `AUTH_SECRET` is missing or `NEXT_PUBLIC_APP_URL` doesn't match the domain.
- **Data resets on deploy** → the volume isn't mounted at `/data`, or `DATABASE_URL` isn't `file:/data/prod.db`.
