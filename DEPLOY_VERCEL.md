# Vercel deploy dry run — Holicruit

Goal: get the current `mvp/day1-3-deploy-and-email` branch live on a Vercel preview URL, talking to Turso, with verification + reset emails sending through Resend. End-to-end smoke test.

You should be able to do this in under 30 minutes. If a step takes longer, stop and we'll diagnose.

---

## 0 — What you'll need in front of you

- Turso DB URL: `libsql://holicruit-prod-neezus12.aws-eu-west-1.turso.io` ✅ (already provisioned)
- Turso auth token (you'll grab this in step 1)
- Resend API key ✅ (you have this)
- A verified sender for Resend (use `onboarding@resend.dev` if you haven't verified a domain yet)
- A `NEXTAUTH_SECRET` (32+ char random string) — generate in step 2
- An Anthropic API key (for CV parsing + AI fit narrative — already in use)

---

## 1 — Grab the Turso auth token

**Easiest: dashboard.** turso.tech → your `holicruit-prod` database → "Generate Token" → Full Access → copy. **Save it somewhere secure**; the dashboard won't show it again.

**Or via CLI:**

```bash
turso auth login           # if not already
turso db tokens create holicruit-prod
```

Output is a long JWT-looking string. That's your `DATABASE_AUTH_TOKEN`.

---

## 2 — Generate a NEXTAUTH_SECRET

In any terminal:

```bash
openssl rand -base64 32
```

Save the output. This goes into Vercel as `NEXTAUTH_SECRET`. **Use a different one for prod than your local dev** — the dev placeholder in `.env.example` is intentionally weak.

---

## 3 — Push the branch (from WSL)

If you've already followed the rsync + git instructions from earlier, skip to step 3b.

### 3a. Sync the OneDrive code into WSL and prep the branch

```bash
cd ~/holicruit

rsync -a --delete \
  --exclude node_modules --exclude .next --exclude .git \
  /mnt/c/Users/nilsw/OneDrive/Dokumente/Claude/Projects/Holicruit/ \
  ~/holicruit/

npm install
npm run db:migrate:dev -- --name add_email_verification_and_auth_tokens
```

The migrate command writes a new migration directory under `prisma/migrations/` — commit that too.

### 3b. Commit and push

```bash
git checkout -b mvp/day1-3-deploy-and-email
git add .
git commit -m "feat(mvp): env hygiene, libSQL prod wiring, email verification, password reset"
git push -u origin mvp/day1-3-deploy-and-email
```

---

## 4 — Run the migrations against Turso

Your Vercel build will run `prisma migrate deploy` automatically (we wired it into `vercel-build`), but it's good to do a one-shot dry run from your laptop first — that way if anything's wrong with the migration, you find out before Vercel does.

In WSL, with the Turso URL + token to hand:

```bash
DATABASE_URL="libsql://holicruit-prod-neezus12.aws-eu-west-1.turso.io" \
DATABASE_AUTH_TOKEN="<paste-token>" \
npx prisma migrate deploy
```

Expected output: "X migrations applied". If it fails:

- **`P3009` "migrate found failed migrations"**: the DB was touched manually. Easiest fix on a new prod DB is `turso db destroy holicruit-prod` and recreate, then re-run.
- **TLS / connection errors**: double-check the URL has `libsql://` prefix (not `https://`).

After this, your Turso DB has the schema. You can verify by browsing it in the Turso dashboard's SQL console (`SELECT name FROM sqlite_master WHERE type='table';`).

---

## 5 — Vercel project setup

If you already have a Vercel project linked to the `Holicruit` GitHub repo, **skip to step 5b**.

### 5a. Create the project

1. https://vercel.com/new
2. Import `nilsweiler-ship-it/Holicruit`
3. Framework preset: **Next.js** (auto-detected)
4. **Build Command**: leave as `next build` — Vercel automatically uses our `vercel-build` script if defined in `package.json` (it is).
5. **Install Command**: leave default (`npm install` — runs our `postinstall` to generate the Prisma client).
6. **Root Directory**: leave at `./`.
7. **DON'T deploy yet.** Click "Environment Variables" first.

### 5b. Set environment variables

In Vercel project → Settings → Environment Variables, add the following. Apply to **Production, Preview, and Development** unless noted.

| Name | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `libsql://holicruit-prod-neezus12.aws-eu-west-1.turso.io` | |
| `DATABASE_AUTH_TOKEN` | _your Turso token_ | Mark as Sensitive. |
| `NEXTAUTH_SECRET` | _output of `openssl rand -base64 32`_ | Mark as Sensitive. |
| `NEXTAUTH_URL` | _will fill in after first deploy_ | Vercel gives you a URL like `holicruit-xxxxx.vercel.app`. Set this then redeploy. |
| `ANTHROPIC_API_KEY` | _your key_ | Mark as Sensitive. |
| `RESEND_API_KEY` | _your key_ | Mark as Sensitive. |
| `EMAIL_FROM` | `Holicruit <onboarding@resend.dev>` | Until you verify a custom domain in Resend. |
| `NEXT_PUBLIC_APP_URL` | _same as `NEXTAUTH_URL`_ | Used in email links. |

`NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` are a chicken-and-egg with the deploy URL — set placeholders (`https://example.com`) for the first deploy, then come back and update once Vercel assigns a real URL.

### 5c. Trigger the first deploy

Push to the branch (or click Deploy in the Vercel UI). Watch the build logs. You're looking for:

```
Running "vercel-build"
> prisma migrate deploy && next build
✔ X migrations have been applied
✓ Compiled successfully
```

If migrate deploy fails here, see step 4 troubleshooting.

After deploy succeeds:

1. Vercel gives you a URL like `holicruit-git-mvp-day1-3-deploy-and-email-nilsw.vercel.app`.
2. Go back to env vars, set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to that URL.
3. **Redeploy** — env-var changes don't apply to existing deploys.

---

## 6 — Smoke test (the actual dry run)

Open the preview URL in an **incognito window** so you don't carry a stale session.

### 6a. Register flow

1. `/register` → fill in: name, **a real email address you can read**, password, role = Candidate.
2. Submit → expect redirect to dashboard (or login — depends on existing flow).
3. **Check the email inbox.** You should receive "Verify your Holicruit email" from `onboarding@resend.dev`.
4. **Check the Vercel function logs** in parallel — under your deployment → Functions → look at `/api/auth/register` invocation. No "Failed to send verification email" lines.

If no email arrives:
- Check spam folder.
- Resend dashboard → Emails → see if it's listed. If yes but bounced, the recipient address is the issue. If not listed at all, `RESEND_API_KEY` is misconfigured.
- Check Vercel logs for the "[email]" warn line (means `isEmailEnabled()` returned false → key not visible to that runtime).

### 6b. Verify flow

1. Click the link in the email. It should land on `/verify-email?token=...`
2. Expect to see "Email verified" page.
3. Click the link a second time → expect "already used" message.

### 6c. Login

1. Go to `/login`, sign in with the account.
2. Land on `/dashboard`.
3. Hit the role-appropriate sub-pages (e.g. for candidate: `/dashboard/candidate/profile`, `/matches`).

### 6d. Forgot/reset

1. Sign out. Go to `/login` → click "Forgot?".
2. Enter your email → submit → "check your inbox" generic message.
3. Email arrives → click reset link → land on `/reset?token=...`
4. Pick a new password → submit → toast "Password updated. Please sign in."
5. Sign in with new password.

### 6e. Other roles

Repeat 6a–6c quickly for **Headhunter** and **Hiring Manager** registrations. Confirm:
- HM signup auto-creates a Company + Subscription(STARTER) (visible at `/dashboard/hiring-manager/billing`).
- HH signup auto-creates HeadhunterProfile + Subscription(FREE).
- HM can navigate to `/dashboard/hiring-manager/roles/new` and create a draft role.
- HH can navigate to `/dashboard/headhunter/roles` and see the role.

---

## 7 — What to report back

After the smoke test, tell me:

1. **Did the deploy succeed?** If not, the build log error.
2. **Did emails actually arrive?** Yes / spam-folder / no.
3. **Anything 500'd?** (Check Vercel function logs.) If yes, the route + error message.
4. **Did role/headhunter signup auto-create the related records?**

That's our Day 5 sign-off. Once green, we move to Day 4: soft email-verified gating on sensitive actions (publish role, claim candidate, paid checkout) plus the in-app banner that prompts re-verification.

---

## Common failure modes (cheat sheet)

| Symptom | Likely cause | Fix |
|---|---|---|
| Build fails with `Invalid environment configuration` | Missing env var in Vercel | Add it, redeploy. |
| Build fails with `prisma migrate deploy` error | Turso URL/token wrong, or migration history corrupted | Verify env vars; if test DB, destroy + recreate. |
| Sign-in returns "Invalid email or password" for known-good creds | `NEXTAUTH_URL` mismatched with the actual deploy URL | Set `NEXTAUTH_URL` to the live URL, redeploy. |
| Verification email doesn't send | `RESEND_API_KEY` not set on the runtime that ran register | Re-check in Vercel envs that it's enabled for "Preview". |
| Verify link 404s | `NEXT_PUBLIC_APP_URL` is the dev one (`localhost:3000`) | Update to the live URL, redeploy. |
| Prisma client errors at runtime ("Cannot find module @/generated/prisma/client") | `postinstall` didn't run, or output dir mismatch | Check `prisma generate` log line during build; verify `prisma.config.ts` output path. |
| `EADDRINUSE` or HTTP 502 on /api/auth/* | Edge runtime / Node runtime mismatch | Add `export const runtime = "nodejs"` to the affected route. |
