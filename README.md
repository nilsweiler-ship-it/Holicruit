# Holicruit

A holistic recruiting platform built on **radical transparency**: every candidate —
win or lose — sees exactly where they stood against the role's bar, the specific gap
that cost them the role, and a concrete path to close it. No black box, no silent
rejections.

This repo is the implementation of the `design_handoff_holicruit/` wireframes.

## Core ideas

- **The fit model** — every match produces a fit object: `hardFit` / `softFit` /
  `mutualFit`, `verified`, `gaps[]`, and the candidate's own `candidateRank`. The
  hard / soft / verified|rank triplet is shown wherever a match appears.
- **Opt-in matching** — a match becomes a conversation only when both sides opt in.
  No cold applications.
- **Four hats, one account** — `candidate`, `hiring_manager`, `recruiter` (paid on
  outcomes), and `provider` (fourth-party training providers who offer/promote
  programs that close candidates' gaps). Switch via the hat switcher.
- **Domain-agnostic** — works across industries. The candidate flow ships three demo
  personas (Software / Healthcare / Sales) you can switch between; the soft-skill
  scenario assessment is universal (situational judgment, not field knowledge).

## Screens

- **Candidate** — match dashboard, match detail + direct line, **Growth Report** (the
  "you vs. role bar" transparency view), profile builder, mobile daily swipe, the
  scenario assessment, peer endorsements, and the upskilling marketplace.
- **Hiring manager** — pipeline (drag to advance), candidate deep-dive, direct chat
  with inline scheduling, and auto-drafted pass feedback → Growth Report.
- **Recruiter** — outcome-based desk.
- **Training provider** — gap-demand targeting, program catalog, promotion.

## Tech stack

- **Next.js 16** (App Router, RSC) · **React 19** · **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui** (new-york) · **Outfit** type
- Brand palette: Coral `#E0533D` (primary) · Ink `#161514` · Cream `#F4EFE7`

The **matching engine** and **scenario assessment** live behind clean interfaces
(`src/lib/services/*`, `src/lib/matching/*`) over the same skill vocabulary. Data
persists to **PostgreSQL** via **Prisma** (`prisma/schema.prisma`); migrations are
committed in `prisma/migrations/`. See **POSTGRES.md** for the DB workflow.

## Quick start

Needs a local Postgres. The included Docker one is easiest:

```bash
npm install
docker compose up -d                 # local Postgres on :5432
cp .env.example .env                 # DATABASE_URL is preset for the Docker db
echo "AUTH_SECRET=$(npx -y auth secret | tail -1)" >> .env   # or: openssl rand -base64 32
npx prisma migrate dev               # create/apply tables (first run: --name init)
npm run db:seed                      # demo data (all accounts use password123)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
├── app/
│   ├── (app)/              # the app shell + role-scoped routes
│   │   ├── candidate/      # matches, growth report, profile, scenario, chat, today, marketplace
│   │   ├── hiring-manager/ # pipeline, deep-dive, chat
│   │   ├── recruiter/
│   │   └── provider/
│   ├── select-role/        # 1.0 role selector
│   └── endorse/[skill]/    # peer "give endorsement" page
├── components/
│   ├── fit/                # FitPills, ScoreTiles, MutualFit, ComparisonBars, FitRadar
│   ├── candidate/ match/ chat/ provider/ market/ people/ brand/ layout/
│   └── ui/                 # shadcn primitives
└── lib/
    ├── fit/types.ts        # the fit-model primitive
    ├── types.ts            # domain types
    ├── services/           # mocked matching / scenario / marketplace
    ├── fixtures/           # cross-industry demo data + scenario bank
    ├── scenario/           # scenario assessment types
    └── persona.ts          # active demo-persona resolution
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
