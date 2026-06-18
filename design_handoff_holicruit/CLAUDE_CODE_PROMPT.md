# Claude Code Prompt: holicruit

You're implementing "holicruit," a holistic recruiting web app. A complete design
handoff lives in design_handoff_holicruit/. Do NOT write code yet — start by reading:

  1. design_handoff_holicruit/README.md  — the full spec (read top to bottom)
  2. design_handoff_holicruit/Holicruit Wireframes.dc.html  — open for LAYOUT & BEHAVIOR
     reference only
  3. design_handoff_holicruit/Holicruit Logo.dc.html  — brand mark + palette
  4. design_handoff_holicruit/app-icons/  — exported app icons

## Stack (confirmed)

- **Framework:** Next.js 16 (App Router, Turbopack) + React 19 + TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui (New York style)
- **Database:** Prisma 7.4 ORM + LibSQL/SQLite
- **Auth:** NextAuth v5 (beta.30), JWT + Credentials provider
- **Icons:** lucide-react
- **Font:** Outfit (via next/font/google)

## Critical rules from the README, repeated so you don't miss them

- The .dc.html files are LO-FI WIREFRAMES. Recreate them in our stack — do NOT port the
  HTML, and do NOT reuse the hand-drawn fonts (Kalam/Caveat), dashed placeholder boxes,
  or the "pen annotation" notes. Those are scaffolding.
- COLOR/TYPE SOURCE OF TRUTH is the brand palette, NOT the wireframe colors.
  Coral #E0533D is the BRAND PRIMARY color. Ink #161514 is foreground. Cream #F4EFE7
  is background. Outfit for type.
- Keep the "fit model" data primitive (hard / soft / verified|rank triplet) visible
  wherever a match is shown. Preserve the Growth Report's two-bar "you vs role bar"
  comparison.

## Brand palette

| Token       | Hex       | oklch (approx)        | Usage               |
|-------------|-----------|----------------------|----------------------|
| Coral       | #E0533D   | oklch(0.58 0.19 25)  | Primary / brand      |
| Ink         | #161514   | oklch(0.15 0.005 60) | Foreground / text     |
| Cream       | #F4EFE7   | oklch(0.95 0.012 85) | Background            |
| Card        |           | oklch(0.98 0.006 85) | Card / elevated       |

## Build order

Suggested: start with the fit-model types + candidate match dashboard
+ growth report (everything hangs off those), then the rest of the candidate flow,
then hiring manager, then recruiter.

Mock the matching engine and the soft-skill scenario assessment behind a clean interface —
they're separate services this UI only consumes. Build one flow at a time and pause for
review between flows.
