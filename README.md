# Holicruit

A modern recruitment platform connecting hiring managers, candidates, and headhunters through intelligent skill-based matching.

## Features

- **Three-role system**: Hiring Managers, Candidates, and Headhunters
- **Skill-based matching**: Multi-dimensional scoring across hard skills, soft skills, experience, and education
- **Auto-shortlisting**: Candidates above a configurable threshold are automatically shortlisted
- **Gap analysis**: Detailed skill gap reports with actionable recommendations
- **Pipeline management**: Track candidates through application stages
- **Billing tiers**: Tiered plans for hiring managers and headhunters
- **PWA support**: Installable as a mobile app

## Tech Stack

- **Framework**: Next.js 16 with App Router (React 19, TypeScript)
- **Database**: SQLite via Prisma ORM with LibSQL adapter
- **Auth**: NextAuth v5 (email/password)
- **UI**: Tailwind CSS 4 + shadcn/ui components
- **Validation**: Zod + React Hook Form

## Quick Start

```bash
# One-command setup
./scripts/setup.sh

# Start development server
npm run dev
```

Or manually:

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Set up database
npx prisma generate
npx prisma migrate deploy
npx tsx prisma/seed.ts

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Accounts

All demo accounts use password: `password123`

| Role | Email | Company |
|------|-------|---------|
| Hiring Manager | sarah@acme.com | Acme Corp |
| Hiring Manager | mike@globex.com | Globex Industries |
| Headhunter | alex@headhunt.com | — |
| Headhunter | jordan@recruit.co | — |
| Candidates | See `prisma/seed.ts` | — |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── (auth)/             # Login & registration pages
│   ├── api/                # REST API endpoints
│   ├── dashboard/          # Role-specific dashboards
│   │   ├── candidate/      # Candidate views
│   │   ├── hiring-manager/ # HM views
│   │   └── headhunter/     # Headhunter views
│   └── pricing/            # Public pricing page
├── components/             # React components
│   ├── ui/                 # shadcn/ui primitives
│   ├── matching/           # Match score & gap report views
│   ├── pipeline/           # Pipeline board components
│   ├── billing/            # Plan badges, usage, upgrade prompts
│   └── layout/             # Navbar, sidebar, providers
├── lib/                    # Business logic
│   ├── matching/           # Scoring engine & gap analysis
│   ├── validations/        # Zod schemas
│   ├── auth.ts             # NextAuth configuration
│   ├── db.ts               # Prisma client
│   └── plans.ts            # Billing tiers & quota logic
└── middleware.ts           # Auth & role-based route protection
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run seed` | Seed database with demo data |
| `npm run lint` | Run ESLint |
