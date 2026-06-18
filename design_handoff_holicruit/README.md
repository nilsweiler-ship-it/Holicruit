# Handoff: holicruit — holistic recruiting platform

## Overview
holicruit is a recruiting platform built around three principles:

1. **Radical transparency** — every candidate, win or lose, sees *exactly* where they stood: hard-skill vs. soft-skill sub-scores against the role's bar, the specific gap that cost them the role, and a concrete path to close it. No black box, no silent rejections.
2. **Expert → expert** — the hiring manager and the candidate connect directly. The admin layer (screening, scheduling, feedback drafting) is automated so the human time goes into the actual conversation, not the relay.
3. **Zero admin drag** — the burdensome parts of recruiting (CV triage, scheduling chains, "we'll be in touch" boilerplate) are automated away.

A freelance **recruiter** can optionally facilitate matches and is paid on outcomes (a success fee on hire) rather than retainers or exclusivity — they compete on judgment and coaching, not on hoarding CVs.

A future revenue line is an **upskilling marketplace**: the feedback loop routes rejected candidates to courses / university micro-credentials that close their measured gap, then auto-re-runs matching when they finish.

The product is one account with three interchangeable "hats" — the same person is often a candidate *and* an expert reviewer.

## About the Design Files
The file in this bundle (`Holicruit Wireframes.dc.html`) is a **design reference created in HTML** — a wireframe prototype showing intended structure, flow, and behavior. **It is not production code to copy directly.** The `.dc.html` format is a streaming-component format used by the design tool; treat it as a visual spec, not a component you import.

The task is to **recreate these designs in your target codebase** using its established framework, component library, and patterns (React, Vue, SwiftUI, etc.). If no codebase exists yet, choose the most appropriate stack for a data-dense, dashboard-style web app that is also responsive to mobile.

## Fidelity
**Low-fidelity (lo-fi) wireframes.** These communicate *layout, information hierarchy, flow, and the novel interaction model* — not final visual design. **Do not copy the hand-drawn aesthetic, the Kalam/Caveat fonts, the dashed placeholder boxes, or the "pen annotation" notes** — those are wireframe conventions. Apply your own/your codebase's design system for color, typography, spacing, and component styling. Use the wireframes as the authority for *what goes where and what it does*.

The "Design Tokens" section below lists the wireframe's values only as a structural reference (e.g. relative sizing, the hard/soft/verified score triplet). Replace them with your real design system.

---

## Global concepts (apply across all screens)

### The fit model — the core data primitive
Every match between a candidate and a role produces a **fit object**:
- `hardFit` (0–100): match on hard/technical skills vs. the role's required bar.
- `softFit` (0–100): match on soft skills, derived from a **scenario-based assessment** (see Profile Builder) — *not* candidate self-rating.
- `mutualFit` (0–100): the headline number shown to both sides. (Treat as a weighted blend of hard + soft; exact formula is a product/data decision — expose the sub-scores regardless.)
- `verified` (bool): whether the candidate's claimed skills carry verification (peer endorsements, scenario score, work samples).
- `gaps[]`: list of specific skill gaps, each `{ skill, type: 'hard'|'soft', severity }`. The single biggest gap drives the Growth Report and the marketplace routing.
- `candidateRank`: the candidate's own ranking within the role's matched pool (e.g. "top 3") — **shown to the candidate**, a deliberate transparency feature.

This object is rendered differently per audience but is the same underlying record. Both sides opt in before a match becomes a conversation — **there are no cold applications.**

### Roles / "hats"
One account, three roles: `candidate`, `hiring_manager`, `recruiter`. A user can hold more than one and switch at any time. Auth/identity is shared; the app shell swaps navigation and home dashboard per active hat.

### Responsive
Desktop-first dashboard app, but must be usable on mobile. The wireframes include one explicit mobile screen (candidate "daily matches" as a swipeable card stack); the rest should reflow responsively.

---

## Screens / Views

### 1.0 — Entry / role selector
- **Purpose:** On first run (or via the hat-switcher) the user picks which role they're acting as.
- **Layout:** Centered card. Logo + prompt "Who are you here as today?" Three stacked, full-width choice rows.
- **Components:**
  - Three selectable rows, each = icon + title + one-line description:
    - "I'm looking — Candidate" / "Find roles & grow my profile"
    - "I'm hiring — Hiring Manager" / "Meet candidates for my team"
    - "I connect people — Recruiter" / "Facilitate matches, earn on outcomes"
  - Footer note: "↻ You can switch hats anytime — one account, many roles"
- **Behavior:** Selecting a row sets the active role and routes to that role's home dashboard. Returning users may skip this and land on their default/last role; the hat-switcher (persistent, e.g. in the top nav) re-opens this choice.

---

### 2.1 — Candidate: Holistic profile builder
- **Purpose:** Candidate builds a profile that captures hard skills, **verified** skills, and soft skills measured objectively.
- **Layout:** Single column. Header row = avatar + name/headline + a **profile-completeness ring** (e.g. 72%). Below: "Hard skills" section, then "Soft skills" section, then a primary CTA.
- **Components:**
  - **Completeness ring:** circular progress showing % profile complete.
  - **Hard skills:** chip/tag list. Chips can be plain (self-added) or **verified** (visually distinguished — in the wireframe, peer-verified chips are highlighted). An "+ add" affordance.
  - **Soft skills:** labeled horizontal bars (Communication, Collaboration, Ownership, …) with fill levels. **Critical copy:** these come "from a short scenario test, not self-rated."
  - **Primary CTA:** "Take the 8-min skill scenario →" — launches the soft-skill assessment that populates the bars.
- **Behavior:** Adding a skill is editable inline. Verification is earned (peer endorsement flow, scenario completion, uploaded work samples) — not user-toggled. Completing the scenario updates the soft-skill bars and the completeness ring.
- **Note for eng:** The scenario assessment itself (questions, scoring) is a separate system; this screen only launches it and displays results.

### 2.2 — Candidate: Match dashboard
- **Purpose:** The candidate's home. A ranked list of mutual matches. *This is "the dashboard, with a twist": fit is broken into hard/soft sub-scores and the candidate sees their own ranking.*
- **Layout:** Header ("Your matches" + "ranked by mutual fit" + subline "Both sides opted in. No cold applications."). Vertical list of match cards. Footer "↓ N more matches".
- **Components — match card (repeating):**
  - Left: small company/role logo placeholder + role title + company · location.
  - Right: large `mutualFit` % (the headline number).
  - Bottom strip: three small pills — `hard NN`, `soft NN`, and a contextual third pill that is **either** a positive transparency signal (`you're top 3`, highlighted) **or** a gap callout (`1 gap →`).
- **Behavior:** Cards are ranked by `mutualFit` descending. Clicking a card → Match detail (2.3). The "1 gap →" pill can deep-link toward the Growth Report / marketplace context for that role. Infinite scroll or "load more" for the remaining matches.

### 2.3 — Candidate: Match detail & direct line
- **Purpose:** Full view of one match; the candidate requests a direct intro to the hiring manager.
- **Layout:** Header (role · company, location · salary range, and `mutualFit` with "mutual fit" label). A fit-breakdown panel. A highlighted "Direct line" panel with actions.
- **Components:**
  - **Fit breakdown panel:** a fit radar/graphic placeholder + a bulleted evidence list mixing strengths (`✓ Strong: React, system design`; `✓ Strong: communication (88)`) and stretches (`⚠ Stretch: team-lead experience`).
  - **Direct-line panel (emphasized):** "Direct line to the hiring manager" — names the actual person ("You'll talk to Priya, Eng Lead — the person you'd actually work with. No recruiter relay."). Actions: primary "Request intro →", secondary "Save".
- **Behavior:** "Request intro" opens a request that the hiring manager can accept → on accept, a direct chat thread (3.3) opens between the two. "Save" bookmarks the match. Salary range and the named manager come from the role record.

### 2.4 — Candidate: Growth report ★ (the heart of the product)
- **Purpose:** Shown after a rejection (and viewable any time for closed matches). Explains *exactly why* the candidate wasn't selected and routes them to fix it. **This screen is the transparency USP made concrete and must be built faithfully.**
- **Layout:** Header "Not this time — here's exactly why" + role · company · "closed". Two side-by-side panels (Hard skills / Soft skills). A highlighted "close the gap" CTA panel at the bottom.
- **Components:**
  - **Hard skills panel:** two bars — "You" (your level) and "Role bar" (the required level, rendered as a distinct hatched/secondary fill so the comparison is unmistakable). Below: the specific gap, e.g. "⚠ Gap: **TypeScript at scale**".
  - **Soft skills panel:** same two-bar structure. Here the candidate is above the bar → positive note "✓ Above bar — a strength" (in a success color).
  - **CTA panel (emphasized):** "🎯 Close the one gap → re-match next time" + "2 short programs match 'TypeScript at scale'. Finish one and you'd clear the bar for 7 open roles." + button "See growth paths →" (routes to the upskilling marketplace, 5.1).
- **Behavior:** This report is **auto-generated for every rejection** — see Interactions. The "You vs. Role bar" comparison must be legible at a glance (the whole point is the candidate instantly sees hard-vs-soft and where the deficit is). The CTA carries the identified gap into the marketplace as a filter.

### 2.5 — Candidate: Mobile — daily matches
- **Purpose:** Mobile-native way to triage a small, curated daily set.
- **Layout:** Phone frame. Header "Today's 3 — hand-picked". A single prominent match card (with the next card peeking/stacked behind). Footer "swipe for next ··· ".
- **Components — card:** team photo placeholder, role title, company · location, "mutual fit" + large %, two buttons: "Pass" (secondary) and "Interested" (primary).
- **Behavior:** Card-stack / swipe interaction — swipe or tap "Pass"/"Interested" to advance. Deliberately limited to ~3 curated matches per day (anti-firehose). "Interested" behaves like requesting an intro.

---

### 3.1 — Hiring manager: Pipeline
- **Purpose:** The hiring manager's home for one open role — a kanban-style pipeline with **no recruiter middle-layer**.
- **Layout:** Header (role title + "N matched"). Three columns: **New (5)**, **Talking (3)**, **Offer (1)**. Footer banner about auto-feedback.
- **Components:**
  - **Column cards (compact):** avatar + name + a fit score number (e.g. 94). "Talking" cards may show a 💬 indicator; "Offer" cards a ★. One "Talking" card is highlighted (active conversation).
  - **Footer banner:** "⚡ Auto-feedback drafted for everyone you pass — review & send in one click."
- **Behavior:** Drag candidates between columns to advance stage. The candidate count and column membership are live. Passing a candidate (here or in 3.2) triggers the auto-drafted feedback flow (see Interactions). Clicking a card → Candidate deep-dive (3.2).

### 3.2 — Hiring manager: Candidate deep-dive
- **Purpose:** Full evaluation of one candidate — **evidence, not claims.**
- **Layout:** Header (avatar + name/headline + large fit %). A row of three score tiles. An "Evidence" list. Two action buttons.
- **Components:**
  - **Score tiles:** Hard (e.g. 95), Soft (88), Verified (✓, emphasized).
  - **Evidence list ("Evidence, not claims"):** "🛠 Skill scenario score + recording", "🤝 2 peer endorsements (verified)", "📄 Portfolio & work samples". Each should be openable.
  - **Actions:** primary "Open direct chat", secondary "Pass + feedback".
- **Behavior:** "Open direct chat" → 3.3 thread. "Pass + feedback" → opens the auto-drafted feedback for review/edit/send, then moves the candidate out of the pipeline and **generates the candidate's Growth Report (2.4)**.

### 3.3 — Hiring manager: Direct connect & interview
- **Purpose:** The direct expert-to-expert conversation + frictionless scheduling.
- **Layout:** Chat header (You ↔ named candidate/manager). Message thread. A highlighted "Interview scheduled" panel.
- **Components:**
  - **Chat thread:** standard bubbles (incoming left, outgoing right/filled).
  - **Scheduled panel (emphasized):** "📅 Interview scheduled" + "Thu · 2:00pm · video — no back-and-forth, no scheduler email chain." + button "Add structured score sheet →".
- **Behavior:** Scheduling is inline (propose/accept a slot inside the thread; no external scheduler email chain). "Add structured score sheet" attaches an evaluation form to the interview — feeds back into the candidate's record and, on a pass, into their feedback.

---

### 4.1 — Recruiter: Recruiter desk
- **Purpose:** Freelance recruiter's home. They facilitate matches and are **paid on outcomes.**
- **Layout:** Header. Row of three stat tiles. "Where you add value" list of their active candidates. Footer banner about the fee model.
- **Components:**
  - **Stat tiles:** "7 active intros", "3 in interview", "€8.4k earned on hires" (the earnings tile emphasized).
  - **Candidate rows:** avatar + "Candidate → Role @ Company" + a one-line note on the value the recruiter added (e.g. "you spotted the soft-skill fit the filter missed", "coached profile, closed the TS gap") + a stage pill ("interview", "offer ★").
  - **Footer banner:** "💰 No retainers, no exclusivity. A success fee only when your intro gets hired."
- **Behavior:** Recruiter actions = introduce a candidate to a role, and coach a candidate's profile. Earnings accrue only on confirmed hires. The recruiter is **optional** in any given match — candidates and managers can also connect directly without one.

---

### 5.1 — Future: Upskilling marketplace (roadmap)
- **Purpose:** Closes the transparency loop — turns a measured gap into targeted learning. **This is a roadmap item / future revenue line; flag it as not-yet-built but design-complete.**
- **Layout:** Header context banner stating the user's gap and its impact. A list of recommended programs. A primary enroll CTA.
- **Components:**
  - **Gap banner:** "Your gap: TypeScript at scale — closing it clears the bar for **7 open roles** you've matched with."
  - **Program cards:** provider logo + title + format/length/credential (e.g. "Online course · 4 weeks · cert"; "University micro-credential · Part-time · 1 semester · accredited") + tags ("closes your gap", "+7 matches", "deeper", "partner").
  - **CTA:** "Enroll & auto-update my profile →".
- **Behavior:** Programs are filtered/ranked by the candidate's identified gap (passed in from the Growth Report). Completing a program updates the candidate's profile (skill becomes present/verified) and **automatically re-runs matching** — the flywheel: rejection → honest feedback → targeted learning → re-match. Education providers (course platforms, universities) are partners and the future revenue line.

---

## Interactions & Behavior (cross-cutting)

- **Opt-in matching:** A match only becomes a conversation when both sides opt in. No cold applications anywhere in the product.
- **Auto-generated feedback:** Whenever a hiring manager passes a candidate, the system **drafts** structured feedback (hard vs. soft, measured against the role bar, with the specific gap). The manager reviews/edits and sends in one click. On send, the candidate's **Growth Report (2.4)** is generated. This is a non-negotiable core behavior — rejection is never silent.
- **Direct line:** Intro requests flow candidate→manager (2.3) or manager→candidate (3.2); acceptance opens a shared chat thread (3.3) with inline scheduling.
- **Hat switching:** Persistent control to change active role; re-routes to that role's dashboard.
- **Transparency signals to candidates:** candidates see their own `candidateRank` ("top 3") and full sub-scores — surface these, don't hide them.
- **Marketplace routing:** the Growth Report's identified gap is carried as a filter into the marketplace (5.1); completing a program re-runs matching.

## State Management
Suggested top-level state (adapt to your framework):
- `activeRole`: 'candidate' | 'hiring_manager' | 'recruiter'
- `currentUser`: identity + roles[] + profile (skills hard/soft, verifications, completeness)
- `matches[]`: fit objects (see "fit model" above), per role context
- `roles[]` / `openings[]`: job records (title, company, location, salary range, required-skill bars, hiring manager)
- `pipelines{}`: per-opening, candidates grouped by stage `new | talking | offer | closed`
- `threads[]`: direct conversations + scheduled interviews + score sheets
- `feedbackDrafts[]`: auto-generated, pending manager review
- `growthReports[]`: generated on pass, per candidate per closed match
- `programs[]` (future): marketplace catalog, filterable by gap

**Key transitions:** opt-in → match becomes contactable · request intro → accept → thread opens · pass → draft feedback → send → growth report generated · enroll in program → complete → profile updates → matching re-runs.

**Data fetching:** matches, pipeline, and threads are the live/polled surfaces. The scenario assessment and matching engine are separate services this UI consumes.

## Design Tokens
**Wireframe values only — replace with your real design system.** Listed so you understand the structural intent, not to copy.
- The repeating score primitive is a **triplet**: `hard` / `soft` / `verified|rank`. Keep this triplet visible wherever a match is shown.
- The Growth Report relies on a **two-bar comparison** (candidate level vs. role-required bar) with the required bar visually distinct (the wireframe uses a hatched fill). Preserve that legibility.
- Emphasis tiers in the wireframe: neutral (most UI), one "highlight" treatment for novel/positive signals (top-3, verified, gap-closing programs), and one "success" treatment for above-bar strengths. Map these to your system's accent/success colors.
- Wireframe used a hand-drawn style (Kalam/Caveat fonts, dashed `#ececec` placeholders, `#FFE27A` highlight, `#E0533D` annotation pen, `#2b2b2b` ink). **Do not reuse these** — they are wireframe scaffolding.

## Assets
No production assets in the wireframe — all imagery (avatars, company logos, team photos, fit radar) is placeholder. You will need: avatar/photo handling, company logo handling, and a real **fit-radar/skill chart** component (2.3) and **comparison-bar** component (2.4). Emoji in the wireframe stand in for icons — use your icon set.

## Files
- `Holicruit Wireframes.dc.html` — the wireframe prototype (all 11 screens, grouped by flow). Open in a browser to view. Reference only.
- `support.js` — runtime for the `.dc.html` format (needed only to view the prototype locally; not part of your implementation).
