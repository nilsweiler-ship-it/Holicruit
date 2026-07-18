# Holicruit — disintermediation defense & premium value

Working strategy note. Two questions: (1) how do we stop hiring managers and
candidates from taking the relationship off-platform once we've introduced them,
and (2) what else can we absorb that makes the paid tiers a no-brainer for a
company. Plus an MVP-for-trial checklist.

---

## 1. Avoiding bypass (disintermediation)

The risk is real and classic for any marketplace that introduces two sides: once
HM and candidate can talk, they can finish the process in email and never pay.
Your instinct is right — **the durable defense is to make staying on-platform the
path of least resistance, not to build walls.** Walls annoy good actors and
rarely stop determined ones. Do a little of both, weighted heavily to "value."

### A. Be the system of record (the strongest lever)
Bypassing should mean *losing* things that live only on Holicruit:
- The candidate's **verified profile, scenario/Big Five results, endorsements** — evidence you can't recreate in an inbox.
- The **structured pipeline, scorecards, consensus, and audit trail** — the defensible-decision layer (matters for fairness/compliance).
- **Auto-drafted Growth Reports** and the **silver-medalist talent pool** — the honest-rejection engine that protects employer brand and creates a warm re-engagement pipeline.
- **Interview guides** generated per candidate (now built) — real time saved, in-app.
- **Analytics** (quality-of-hire, fairness) — only as good as the data captured on-platform.

If the whole workflow — schedule, interview, score, decide, feedback, offer — happens here, leaving mid-process is a downgrade, not a shortcut.

### B. Sequence what's exposed (light gating, not walls)
- Keep **direct contact details (email/phone) masked** until *both* sides opt in AND the match reaches a "proceed" stage. In-app messaging + scheduling before that. (We already have opt-in + in-app chat; add contact-masking as a small step.)
- Route **scheduling, offers, and feedback through the platform** so the natural next click is in-app.
- This is enough friction to keep honest users in the flow without punishing anyone.

### C. Align the economics
- **Recruiter success fees** and any placement fee should be *cheaper and lower-risk* than a recruiter's usual cut — so using Holicruit is the rational choice, not a tax to avoid.
- HM subscription value (below) must exceed the "just email them" alternative every single week, not just at hire time.
- Consider a **completion incentive**: e.g., analytics, talent-pool re-engagement, and warranty/replacement guarantees only apply to hires closed on-platform.

### D. Gentle enforcement (last, not first)
- A soft nudge if messages start trading raw contact info early ("keep it here so your scorecards, guide, and feedback stay linked").
- Terms that ask design-partner employers not to circumvent for a period — normal for marketplaces, but rely on it lightly.

**MVP stance:** ship A + the messaging/scheduling parts of B now; keep C/D simple. Revisit hard gating only if data shows leakage.

---

## 2. Premium value — HR work the platform can absorb

The paid tiers should replace things a company currently pays *people* to do.
Ranked by build-effort vs. willingness-to-pay:

**Already built:** talent pool · calibration · decision intelligence (consensus) · quality-of-hire & fairness analytics · **AI-generated interview guides**.

**High-value, build next:**
1. **Auto-scheduling & coordination** — propose slots, collect availability, send invites. Absorbs the single most time-consuming coordinator task; strong on-platform lock-in.
2. **Auto-shortlisting / screening triage** — rank and cluster the pipeline, flag who to talk to first and why. Absorbs first-pass screening.
3. **Offer & rejection comms** — draft the offer and the (already-honest) rejection/Growth Report; one-click send. Absorbs recruiter-coordinator writing.
4. **Reference & endorsement collection** — automated requests + structured capture, feeding the verified profile. Absorbs reference-checking.
5. **Job-ad / role generation from calibration** — turn the calibrated bar into a polished posting. Absorbs JD writing (pairs with the existing importer).

**Later / enterprise:**
6. **Structured debrief facilitator** — guided panel debrief that resolves scorecard disagreement.
7. **Compliance & audit pack** — exportable, defensible decision record per hire (fairness, consistency). Enterprise buyers pay for this.
8. **Onboarding handoff** — package the hire's profile, gaps, and growth plan for their new manager.
9. **ATS/HRIS + calendar/Slack integrations, SSO, API** — table-stakes for larger buyers (Scale).

**Framing for pricing:** each of these is "one fewer coordinator hour per hire" or "one fewer bad hire." At €500/mo, Team pays for itself if it saves a few hours of recruiter time a month; Scale's analytics/compliance justify custom enterprise pricing.

---

## 3. MVP-for-trial checklist (before reaching trial users)

- [x] Company-level, round pricing (€500 Team, €300 Partner)
- [x] Candidate profile photo upload
- [x] Personality profile grounded in the Big Five (credible, not MBTI)
- [x] Non-gameable scenario item bank + shuffled options
- [x] AI-generated interview guides (flagship premium justifier)
- [ ] **Contact-masking** until "proceed" stage (anti-bypass, section 1B)
- [ ] **On-platform scheduling** (anti-bypass + premium #1)
- [ ] First-run **onboarding** for each role (empty states → guided setup)
- [ ] A hosted demo URL so trial users can click in
- [ ] Real photos/logos seeded so the demo doesn't look empty
- [ ] Lightweight analytics/event tracking to see where trial users drop

*Recommended order for trials: onboarding + hosted demo + seeded imagery first
(so it looks and feels real), then scheduling + contact-masking (so the loop is
complete and defensible).*
