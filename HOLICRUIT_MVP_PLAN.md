# Holicruit — MVP Audit & Punch List

**Generated:** 2026-05-07
**Source:** Mirror of `~/holicruit` (WSL) at `C:\Users\nilsw\OneDrive\Dokumente\Claude\Projects\Holicruit`
**Scope:** Web MVP for three roles end-to-end (Hiring Manager, Headhunter, Candidate). Must-haves: AI matching, in-app messaging, billing (subs + credits). Mobile extension considered, not built.

---

## TL;DR

You are further along than a typical pre-MVP. The schema, three role dashboards, role/application/match/gap-report flows, plan-tier quotas, AI CV parsing, and AI fit narrative all exist and are largely wired. Three things stand between you and a real launch:

1. **Stripe is faked.** `/api/billing/subscribe` upserts a Subscription row with `status: "ACTIVE"` directly. No `stripe` package, no checkout, no webhook. (`src/app/api/billing/subscribe/route.ts:81-97, 118-133`)
2. **Messaging does not exist.** No `Message`/`Thread` model, no routes, no UI. Confirmed by grep across the repo and schema.
3. **No transactional email.** No Resend/SendGrid/Postmark/SMTP. Registration works but nothing ever leaves the server.

Plus several smaller gaps (no `.env.example`, no tests, dev-grade `NEXTAUTH_SECRET`, SQLite dev DB, no password reset, server components that will need a thin BFF layer for a future native client).

Rough effort to web MVP launch with one experienced full-stack dev: **~25–35 dev-days**, depending on how lean you stay on messaging and how many auth providers you ship.

---

## Drift from the documented stack

A couple of items don't match the spec captured in the project instructions — worth confirming before planning around them:

| Spec said | Code actually | Implication |
|---|---|---|
| Neon (Postgres) | SQLite via `@libsql/client` + `@prisma/adapter-libsql` (`prisma/schema.prisma:7`, `package.json:18-19`) | You're set up for **Turso**, not Neon. Either is fine for MVP — but pick now. Migrations and column types differ. |
| "Subscription + credits billing model" | Subscription tiers exist; **no credits/wallet model** | Decide whether MVP needs credits at all. Plan-based quotas (`src/lib/plans.ts:94-246`) already gate every relevant action. |
| "Comprehensive admin panel" | Not present (also out of scope per your role selection) | Fine — explicitly deferred. |

I'd recommend **dropping credits from MVP** unless they're a contractual ask. Plan-tier quotas already cover the same value lever and are working. Add credits post-launch if real users push for them.

---

## What's built (confirmed)

- **Auth.** NextAuth v5-beta credentials provider, JWT sessions, role injected into token+session, route-level role enforcement in `src/middleware.ts:7-45`. Registration auto-creates the matching profile (`src/app/api/auth/register/route.ts:51-72`).
- **Three role dashboards.** All present under `src/app/dashboard/{candidate,headhunter,hiring-manager}/`. Role create/list/detail, candidate profile, headhunter browse-and-claim, candidate matches and gap report views are implemented.
- **Matching engine.** Deterministic, weighted (hard 40 / soft 25 / exp 25 / edu 10) at `src/lib/matching/engine.ts:131-148`. Computes a 0–100 score with a per-dimension breakdown and a gap list — no LLM call, fast and cheap, runs on every application creation.
- **AI surfaces (real).** `src/lib/ai/index.ts` ships `parseCV()` (Anthropic SDK on uploaded PDF/DOCX) and `generateFitNarrative()` (called from `/api/match/narrative`, plan-gated).
- **Quota enforcement.** `checkQuota()` in `src/lib/plans.ts` covers `CREATE_ROLE`, `APPLY_TO_ROLE`, `CLAIM_ROLE`, `HH_SUBMIT`, `VIEW_GAP_REPORT`, `GENERATE_NARRATIVE`. Used at API boundaries.
- **Privacy / audit.** `identityRevealed` flag on Application; `DataAccessLog` model with `VIEW_CANDIDATE`, `REVEAL_IDENTITY`, `DOWNLOAD_CV`, `EXPORT_DATA` actions.
- **PWA scaffolding.** `src/app/manifest.ts` and `public/sw.js` (cache-first static, network-first dynamic, offline fallback). Useful for a fast mobile launch later.

---

## Critical path to launch (must do)

In rough sequence. Effort is for a single experienced dev familiar with the stack.

### 1. Wire real Stripe billing — **3–5 days**
- Add `stripe` SDK; create products/prices in Stripe Dashboard for HM `STARTER`/`PROFESSIONAL`/`ENTERPRISE` and HH `FREE`/`PRO` (matches `src/lib/plans.ts`).
- Replace the upsert at `subscribe/route.ts:82-97` with a `stripe.checkout.sessions.create(...)` call returning a redirect URL.
- New route: `POST /api/billing/webhook` handling `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed` → sync to the `Subscription` table.
- Add `stripeCustomerId` to `Company` and `HeadhunterProfile`; `stripeSubscriptionId` and `stripePriceId` to `Subscription`. New migration.
- Wire customer portal link from `subscription-manager.tsx`.
- **Skip credits for MVP** unless you've already promised them — the work doubles otherwise.

### 2. Build a minimal messaging system — **5–8 days**
The leanest version that earns the "in-app messaging" claim:
- Schema: `Thread { id, applicationId? roleId? participantIds[] lastMessageAt }`, `Message { id, threadId, senderId, body, readAt? createdAt }`. Anchor threads to an Application so context is automatic.
- API: `GET /api/threads`, `GET /api/threads/:id`, `POST /api/threads/:id/messages`, `POST /api/threads/:id/read`. Plain REST, no websockets for MVP — poll every 15s on open thread.
- UI: an `/dashboard/inbox` page with a thread list + thread view. One page, role-agnostic. Reuse existing shadcn primitives.
- Permission rules: only participants of an application can message in that thread. Headhunter ↔ HM until candidate identity revealed; then candidate can join.
- Defer: file attachments, typing indicators, push, real-time. Mark as v1.1.

### 3. Transactional email — **1–2 days**
- Pick **Resend** (cleanest DX, generous free tier).
- Wrap in `src/lib/email/index.ts` with `sendTransactionalEmail({ to, template, data })`.
- Templates needed for MVP: account verification, password reset, "you have a new message", "your application was reviewed", invoice receipt forwarding (Stripe handles this if you let it).
- Wire the verification email into `register/route.ts`; add `emailVerified` column to `User` and gate login or feature access.

### 4. Password reset flow — **0.5–1 day** (depends on #3)
- Routes `POST /api/auth/forgot` (issue token, email link), `POST /api/auth/reset` (validate token, set new password). Tokens table or signed JWT with short TTL.

### 5. Production database — **0.5–1 day**
- Decision: stick with **Turso** (already set up in code) or move to **Neon Postgres** (matches original spec).
  - Recommendation: stick with Turso for MVP. Schema is small, queries are simple, and you'd lose a few days porting Prisma SQLite-isms (no JSON column type, etc.) to Postgres. Revisit at scale.
- Provision a Turso DB, set `DATABASE_URL` and `DATABASE_AUTH_TOKEN`, configure the libSQL adapter for production.
- Add `prisma migrate deploy` to a deploy step (currently no migration trigger in `package.json:6-7`).

### 6. Environment + secrets hygiene — **0.5 day**
- Create `.env.example` with every required key (`DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`).
- Add a startup validator (`src/lib/env.ts` with `zod`) that fails the build if a prod env is missing keys.
- Generate a real `NEXTAUTH_SECRET`; current one is `holicruit-dev-…` (`.env`).

### 7. Vercel deploy dry run — **1 day**
- Connect repo, set env vars, run `next build` in CI, smoke-test all three role flows on a preview deploy.
- Verify `prisma migrate deploy` runs and Turso connection works from Vercel's runtime.

**Critical-path subtotal: ~12–18 dev-days.**

---

## Pre-launch (highly recommended, not strictly blocking)

### 8. End-to-end happy-path tests — **2–3 days**
- Add **Playwright**. Three flows: HM creates and publishes a role → HH claims and submits → Candidate applies and sees match score and gap report.
- One assertion per critical money path: quota gate triggers when expected, Stripe webhook updates Subscription, email sends fire.

### 9. CV file storage — **1–2 days**
- Today the schema has `resumeUrl` (string). Confirm where CVs actually live. If they're inline in DB or local disk, move to **Vercel Blob** or **R2/S3** with signed URLs. The Anthropic CV parser already works; just need a real bucket.

### 10. Application lifecycle UI on the HM side — **1–2 days**
- Stage transitions (`APPLIED → SCREENING → … → HIRED`) need explicit buttons + a notes field. Spot-check the HM application detail page (`src/app/dashboard/hiring-manager/applications/[appId]/page.tsx`) and fill any gaps.

### 11. Notifications in-app — **1–2 days**
- A simple bell icon with a `Notification` table (`userId, type, payload, readAt`). Triggered on: new application for HM, identity reveal for candidate, new message (covered by messaging anyway).

**Pre-launch subtotal: ~5–9 dev-days.**

---

## Polish (post-launch acceptable)

- OAuth providers (Google, LinkedIn) — **1 day each**
- OpenGraph cards / SEO basics — **0.5 day**
- Empty-state and error-state polish across pages — **1 day**
- Lightweight analytics (PostHog or Vercel Analytics) — **0.5 day**
- Rate limiting on `/api/auth/register`, `/api/auth/forgot`, `/api/match/narrative` (Upstash) — **0.5 day**
- Admin panel (explicitly deferred per your selection) — **out of MVP**

---

## Mobile extension readiness (do now, ship later)

You said "online application first with option to be extended to mobile." A few cheap moves now keep that door open without overbuilding:

1. **Move data fetching out of server components into REST endpoints.** Today, pages like the HM dashboard read Prisma directly. A native client can't reuse that. As you touch each dashboard page during MVP work, replace direct `prisma.*` reads with calls to typed API endpoints. Keep server components as the *renderer* of fetched data, not the *fetcher*. Marginal cost during normal feature work; saves weeks later. **+1 day of overhead distributed across the punch list above.**
2. **Stable JSON contracts.** Add a `version` field to API response envelopes (`{ version: 1, data: ... }`) so a future native client can negotiate. **0.25 day.**
3. **Auth strategy.** NextAuth JWT works for web; for a native client you'll likely want a refresh-token endpoint and a long-lived device session. Don't build it now — but **don't put any web-session-only assumptions** (cookie-only auth checks, etc.) into new code.
4. **Design tokens.** Tailwind classes mostly ride to React Native via NativeWind. Where you've got bespoke CSS, prefer Tailwind utility classes so the design language ports cleanly.
5. **PWA path.** You already have `manifest.ts` and `sw.js`. A polished PWA can serve as the "mobile" answer for 6–12 months while you decide whether a native app is worth the build/test/distribution overhead. **0–1 day to polish manifest icons, install prompt, offline messaging.**

**Net add for mobile-friendliness: ~2–3 dev-days, mostly absorbed into other work.**

---

## Suggested sequencing (a 5–7 week solo plan)

- **Week 1:** Stripe checkout + webhook + portal. Migration for `stripe*` columns. Customer portal wired.
- **Week 2:** Messaging (schema → API → inbox UI). Land it as a single feature branch.
- **Week 3:** Resend integration + verification email + password reset. `.env.example` + env validator. Production Turso provisioned.
- **Week 4:** Vercel deploy dry run; fix everything that breaks. CV file storage. HM application lifecycle polish.
- **Week 5:** Playwright happy-path tests. Notifications. Rate limiting on auth endpoints.
- **Week 6 (buffer):** Beta tester onboarding, fix-it-up, Stripe in test mode → live mode.
- **Week 7 (optional):** OAuth providers, polish, observability.

---

## Open questions I'd want answered before sprint planning

1. **Credits — in or out?** Recommend out for MVP. Confirm.
2. **Turso vs. Neon — final pick?** Recommend Turso (matches code today). Confirm.
3. **Beta size + acquisition channel?** Determines whether email volume + Stripe live-mode setup are tier-1 or can wait.
4. **Is there a hosted CV storage already (S3/R2/Blob)?** If `resumeUrl` is currently a placeholder, that's a hidden item on the punch list.
5. **Does the WSL repo have a remote (GitHub/GitLab)?** A real CI/preview-deploy loop is worth a half-day if it doesn't exist yet.
6. **Real-time messaging — needed for v1?** Polling at 15s is the cheap MVP. SSE/Pusher is a v1.1 upgrade. Confirm v1 is fine with poll.

---

## File-and-line evidence behind the major claims

- Stripe stub: `src/app/api/billing/subscribe/route.ts:81-97` (HM) and `:118-133` (HH); zero hits for `stripe` in `*.{ts,tsx,json}`.
- DB is SQLite/libSQL: `prisma/schema.prisma:6-8`; `package.json:18-19`.
- No messaging models: zero hits for `model Message|model Thread|model Conversation|model Inbox` in `prisma/`.
- Matching is deterministic: weights at `src/lib/matching/engine.ts:131-148`, dimension scorers at `:19-101`.
- AI CV parser + narrative are real: `src/lib/ai/index.ts`, called from `src/app/api/match/narrative/route.ts`.
- Role-based middleware: `src/middleware.ts:7-45`.
- PWA assets: `src/app/manifest.ts`, `public/sw.js`.
