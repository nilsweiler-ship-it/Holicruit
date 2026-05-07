# Holicruit MVP Test Cases

**Total: 120 test cases across 10 categories**

---

## 1. Authentication & Registration (12 TCs)

### Registration

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1.1 | Register as Candidate | Fill name, email, password; select Candidate role; submit | Account created, redirected to `/dashboard/candidate`, CandidateProfile auto-created |
| 1.2 | Register as Hiring Manager | Fill name, email, password; select Hiring Manager role; submit | Account created, Company auto-created, STARTER subscription activated, redirected to `/dashboard/hiring-manager` |
| 1.3 | Register as Headhunter | Fill name, email, password; select Headhunter role; submit | Account created, HeadhunterProfile + FREE subscription auto-created, redirected to `/dashboard/headhunter` |
| 1.4 | Duplicate email rejected | Register with an already-used email | Error: "Email already registered" |
| 1.5 | Weak password rejected | Register with password < 8 characters | Validation error shown |
| 1.6 | Missing fields rejected | Submit registration with empty name or email | Validation error for each missing field |

### Login

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1.7 | Login with valid credentials | Enter registered email + password | Redirected to role-appropriate dashboard |
| 1.8 | Login with wrong password | Enter valid email + wrong password | Error: "Invalid credentials" |
| 1.9 | Login with unregistered email | Enter non-existent email | Error: "Invalid credentials" |
| 1.10 | Role-based redirect after login | Login as each role | Candidate → `/dashboard/candidate`, HM → `/dashboard/hiring-manager`, HH → `/dashboard/headhunter` |
| 1.11 | Session persists on refresh | Login, refresh browser | Still logged in, dashboard accessible |
| 1.12 | Logout | Click avatar → "Log out" | Session destroyed, redirected to `/` |

---

## 2. Candidate Profile Management (10 TCs)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 2.1 | View empty profile | Navigate to `/dashboard/candidate/profile` after registration | Profile form shown with empty fields, completeness low |
| 2.2 | Update bio | Enter bio text, save | Bio saved, shown on profile |
| 2.3 | Add skills with levels | Add skills (e.g., "Python" level 4, "React" level 3), save | Skills saved as structured JSON, visible on profile |
| 2.4 | Add experience | Add work experience entries (title, company, years), save | Experience saved, years aggregated for scoring |
| 2.5 | Add education | Add education (degree, institution, year), save | Education saved, used in match scoring |
| 2.6 | Set preferences | Set location preferences, remote preference, salary range | Preferences saved |
| 2.7 | Set visibility | Toggle between ACTIVE / PASSIVE / HIDDEN | Visibility updated |
| 2.8 | Upload CV (PDF) | Upload a valid PDF file under 5MB | File saved to `/storage/uploads/`, resumeUrl set, AI parsing attempted |
| 2.9 | Upload CV too large | Upload a file > 5MB | Error: file size limit exceeded |
| 2.10 | Profile completeness updates | Fill bio + skills + experience + education | Dashboard completeness % increases with each section filled |

---

## 3. Hiring Manager — Role Management (14 TCs)

### Creating Roles

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 3.1 | Create role (DRAFT) | Fill title, description, hard skills, soft skills, weights, threshold; save | Role created with status DRAFT, visible in roles list |
| 3.2 | Add hard skills with levels | Add hard skills (e.g., "Python" required level 4, "AWS" required level 3) | Skills saved as JSON array with name + level |
| 3.3 | Add soft skills with levels | Add soft skills (e.g., "Leadership" level 3) | Soft skills saved |
| 3.4 | Set scoring weights | Set weights: hardSkills 40, softSkills 25, experience 25, education 10 | Weights saved, normalized for scoring |
| 3.5 | Set match threshold | Set threshold to 70 | Threshold saved, used for auto-shortlisting |
| 3.6 | Publish role | Change role status from DRAFT → PUBLISHED | Status updated, role now visible to HHs and candidates |
| 3.7 | Close role | Change role status to CLOSED | Role no longer accepts new applications |
| 3.8 | Edit existing role | Update title/description/skills on existing role | Changes saved |
| 3.9 | Delete role | Delete a role | Role removed from list |
| 3.10 | Quota: exceed active roles (STARTER) | Create 3rd role on STARTER plan (limit: 2) | Error 403: QUOTA_EXCEEDED with message about limit |

### Viewing Roles

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 3.11 | List own roles | Navigate to roles page | Only own company's roles shown |
| 3.12 | View role with applications | Click on role with existing applications | Role details + application list shown, sorted by match score |
| 3.13 | View shortlist | Navigate to shortlist for a role | Only candidates with score >= threshold shown |
| 3.14 | Cannot see other company's roles | Attempt API call for another company's roleId | 403 Forbidden |

---

## 4. Hiring Manager — Application Review (12 TCs)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 4.1 | View application list for role | Navigate to role detail page | All applications listed with match scores |
| 4.2 | View application detail | Click on application | Full details shown: score, breakdown (hard/soft/exp/edu), stage |
| 4.3 | Score breakdown visible | View application with computed score | See dimension scores: hardSkills, softSkills, experience, education |
| 4.4 | Move to SCREENING | Update stage from APPLIED → SCREENING | Stage updated, audit log entry added |
| 4.5 | Move to INTERVIEW | Update stage from SCREENING/SHORTLISTED → INTERVIEW | Stage updated, audit logged |
| 4.6 | Move to OFFER | Update stage → OFFER | Stage updated |
| 4.7 | Move to HIRED | Update stage → HIRED | Stage updated |
| 4.8 | Reject application | Update stage → REJECTED | Stage updated, audit logged |
| 4.9 | Reveal candidate identity | Click reveal on shortlisted candidate (score >= threshold) | Candidate name + email shown, identityRevealed = true, DataAccessLog created |
| 4.10 | Reveal blocked if below threshold | Attempt reveal on candidate with score < threshold | Error: reveal not allowed |
| 4.11 | View gap analysis (Professional+) | View gap report for application on Professional plan | Skill gaps shown: MET/PARTIAL/MISSING with recommendations |
| 4.12 | Gap analysis blocked on Starter | Attempt gap report on Starter plan | Error 403: feature requires Professional+ plan |

---

## 5. Headhunter Flows (12 TCs)

### Role Discovery & Claiming

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 5.1 | Browse published roles | Navigate to HH roles page | All PUBLISHED roles from all companies shown |
| 5.2 | Claim a role | Click claim on a published role | Role claimed, claimedById set to HH's profile |
| 5.3 | Quota: exceed role claims (FREE) | Claim 4th role on FREE plan (limit: 3) | Error 403: QUOTA_EXCEEDED |
| 5.4 | Cannot claim already-claimed role | Attempt to claim a role already claimed by another HH | Error or role not available |

### Candidate Submission

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 5.5 | Submit candidate to claimed role | Fill candidate details, submit to claimed role | Application created, match score auto-computed, headhunterId set |
| 5.6 | Auto-shortlist on submission | Submit candidate whose score >= role threshold | Application auto-shortlisted (stage = SHORTLISTED) |
| 5.7 | Submission below threshold | Submit candidate whose score < threshold | Application stage = APPLIED (not auto-shortlisted) |
| 5.8 | Quota: exceed monthly submissions (FREE) | Make 11th submission in a month on FREE plan (limit: 10) | Error 403: QUOTA_EXCEEDED |
| 5.9 | View own submissions | Navigate to submissions page | Only own submissions shown with scores and stages |

### Data Access Controls

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 5.10 | Email sanitized in shortlist | View shortlist for claimed role | Candidate names visible but email addresses hidden/sanitized |
| 5.11 | Cannot see unclaimed role applications | Attempt to access applications for a role not claimed by this HH | 403 Forbidden |
| 5.12 | Cannot reveal candidate identity | Attempt to call reveal endpoint as HH | 403 Forbidden (HM-only feature) |

---

## 6. Candidate — Job Discovery & Applications (10 TCs)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 6.1 | Browse available roles | Navigate to matches page | Published roles listed |
| 6.2 | Apply to a role | Select a published role, submit application | Application created, match score auto-computed |
| 6.3 | Auto-shortlist on high score | Apply with profile that yields score >= role threshold | Stage auto-set to SHORTLISTED |
| 6.4 | Below threshold stays APPLIED | Apply with profile yielding score < threshold | Stage = APPLIED |
| 6.5 | Cannot apply twice to same role | Apply to same role again | Error: duplicate application (unique constraint) |
| 6.6 | View own applications | Navigate to dashboard | Application list with scores and stages shown |
| 6.7 | Track application stage | HM moves application to INTERVIEW | Candidate sees updated stage on their dashboard |
| 6.8 | View skill gap report | Navigate to gap page for an application | See MET/PARTIAL/MISSING skills with recommendations |
| 6.9 | Cannot see other candidates' applications | Attempt API call for another candidate's applicationId | 403 Forbidden |
| 6.10 | Dashboard metrics update | Apply to 3 roles | Application count, top match score update on dashboard |

---

## 7. Matching & Scoring Engine (14 TCs)

### Score Computation

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 7.1 | Perfect match scores 100 | Candidate meets all required skills at required levels | Overall score = 100 (or near 100) |
| 7.2 | Zero skills match scores low | Candidate has no matching skills | Hard/soft skill dimensions = 0, overall score reflects weights |
| 7.3 | Partial skill match | Candidate has skill at level 2, required level 4 | Skill score = 50% (2/4), status = PARTIAL |
| 7.4 | Missing skill | Required skill not in candidate profile | Skill score = 0, status = MISSING |
| 7.5 | Exceeded skill level | Candidate level 5, required level 3 | Skill score capped at 100% (not > 100) |
| 7.6 | Weight distribution | Set weights: hardSkills 80, softSkills 0, experience 10, education 10 | Overall score dominated by hard skills |
| 7.7 | Experience scoring tiers | Candidate with 1yr, 4yr, 10yr experience | Scores: ~20, ~60, ~100 respectively |
| 7.8 | Education scoring tiers | PhD, Masters, Bachelors, no degree | Scores: 100, 85, 70, 30 respectively |

### Gap Analysis

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 7.9 | All skills met | Candidate meets or exceeds all requirements | All gaps status = MET, no recommendations needed |
| 7.10 | Partial gaps identified | Candidate has some skills at lower levels | PARTIAL gaps listed with "Improve X by Y levels" recommendations |
| 7.11 | Missing skills identified | Candidate lacks some required skills entirely | MISSING gaps listed with skill name and required level |
| 7.12 | Gap priority ordering | Multiple gaps of different severity | Top 5 gaps shown, ordered by severity (MISSING > PARTIAL) |

### Auto-Shortlist Logic

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 7.13 | Score exactly at threshold | Score = threshold (e.g., both 70) | Application auto-shortlisted (stage = SHORTLISTED) |
| 7.14 | Score 1 below threshold | Score = 69, threshold = 70 | Application stays APPLIED |

---

## 8. Billing & Subscription Management (14 TCs)

### Hiring Manager Plans

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 8.1 | Default plan on registration | Register as HM | STARTER plan active with correct limits |
| 8.2 | View current plan | Navigate to billing page | Shows plan name, features, usage, period end |
| 8.3 | Upgrade to Professional | Subscribe to Professional plan | Plan updated, limits increased (10 roles, 50 apps/role, gap analysis unlocked) |
| 8.4 | Upgrade to Enterprise | Subscribe to Enterprise plan | Plan updated, unlimited everything, custom scoring |
| 8.5 | Usage tracking | Create roles, receive applications | Usage dashboard shows "X of Y active roles used" |
| 8.6 | Feature gate: gap analysis on Starter | Attempt to view gap report | 403: requires Professional+ |
| 8.7 | Feature gate: narrative on Starter | Attempt to generate AI fit narrative | 403: requires Professional+ |
| 8.8 | Feature unlocked after upgrade | Upgrade to Professional, then access gap analysis | Feature now accessible |

### Headhunter Plans

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 8.9 | Default HH plan on registration | Register as HH | FREE plan active (3 claims, 10 submissions/month) |
| 8.10 | Upgrade to PRO | Subscribe to PRO plan | Unlimited claims and submissions |
| 8.11 | Quota resets monthly | Wait for period boundary (or adjust dates) | Submission counter resets |
| 8.12 | Usage display | Claim roles, submit candidates | Usage shown: "X of Y role claims", "X of Y submissions this month" |

### Subscription Lifecycle

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 8.13 | Subscription period dates | Subscribe to any plan | currentPeriodStart = now, currentPeriodEnd = +30 days |
| 8.14 | Re-subscribe / plan change | Change from Professional to Enterprise | Subscription updated, not duplicated |

---

## 9. Security & Access Control (12 TCs)

### Route Protection

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 9.1 | Unauthenticated → dashboard | Visit `/dashboard` without login | Redirected to `/login` |
| 9.2 | Unauthenticated → API | Call any `/api/` endpoint without session | 401 Unauthorized |
| 9.3 | Candidate → HM dashboard | Candidate visits `/dashboard/hiring-manager` | Redirected to `/dashboard` (role mismatch) |
| 9.4 | HM → HH dashboard | HM visits `/dashboard/headhunter` | Redirected to `/dashboard` |
| 9.5 | HH → candidate dashboard | HH visits `/dashboard/candidate` | Redirected to `/dashboard` |

### Ownership Validation

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 9.6 | HM access other company's role | HM calls GET `/api/roles/{otherCompanyRoleId}` | 403 Forbidden |
| 9.7 | HM update other company's role | HM calls PATCH on role not owned | 403 Forbidden |
| 9.8 | Candidate view other's application | Candidate calls GET `/api/applications/{otherId}` | 403 Forbidden |
| 9.9 | HH access unclaimed role data | HH calls GET for role not claimed by them | 403 or filtered response |

### Data Privacy

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 9.10 | Candidate email hidden from HH | HH views shortlist for claimed role | Email field sanitized/hidden |
| 9.11 | Identity reveal creates audit log | HM reveals candidate identity | DataAccessLog entry created with REVEAL_IDENTITY action |
| 9.12 | Audit trail on stage change | HM changes application stage | auditLog JSON array gains new entry with timestamp, actor, action |

---

## 10. Public Pages & Navigation (10 TCs)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 10.1 | Landing page loads | Visit `/` | Hero, "Why Choose", animated explainer, pricing preview, CTA all render |
| 10.2 | Landing page responsive | View on mobile viewport (375px) | All sections stack, no overflow, buttons full-width |
| 10.3 | Dark mode toggle | Toggle dark mode | Colors switch, hero remains legible, cards use dark card bg |
| 10.4 | Pricing page — HM tab | Visit `/pricing`, click "Hiring Managers" | 3-tier plan cards with feature comparison table |
| 10.5 | Pricing page — HH tab | Click "Headhunters" tab | 2-tier plan cards (Free + Pro) with comparison |
| 10.6 | Billing toggle (annual) | Toggle to Annual on pricing page | Prices reduce by 20%, "Save 20%" badge appears |
| 10.7 | Navigation links work | Click each nav link (For HMs, For Recruiters, How It Works, Pricing) | Correct page loads |
| 10.8 | Login page branded | Visit `/login` | Logo header "Holicruit" with tagline visible above form |
| 10.9 | Register page branded | Visit `/register` | Logo header "Holicruit" with tagline visible above form |
| 10.10 | Footer links work | Click each footer link (Product, For, Legal columns) | Correct page/route loads |

---

## Quick Reference: Test Priority

### P0 — Must pass for MVP launch
- 1.1-1.3, 1.7, 1.10 (Auth basics)
- 2.2-2.5, 2.8 (Candidate profile + CV)
- 3.1-3.2, 3.5-3.6 (Role creation + publish)
- 4.1-4.3, 4.4, 4.9 (Application review + reveal)
- 5.1-5.2, 5.5-5.6 (HH claim + submit)
- 6.1-6.4, 6.6 (Candidate apply + track)
- 7.1-7.4, 7.13 (Core scoring + auto-shortlist)
- 9.1-9.5 (Route protection)

### P1 — Important for quality
- 1.4-1.6 (Registration validation)
- 3.10 (Quota enforcement)
- 4.10-4.12 (Reveal gate + plan gate)
- 5.3, 5.8, 5.10-5.12 (HH quotas + data access)
- 7.5-7.8 (Edge scoring)
- 8.1-8.8 (Billing flows)
- 9.6-9.12 (Ownership + privacy)

### P2 — Nice to have
- 2.9-2.10 (Upload limits + completeness)
- 6.5, 6.8-6.10 (Duplicate guard + gaps + metrics)
- 7.9-7.12, 7.14 (Gap analysis detail)
- 8.9-8.14 (HH billing + lifecycle)
- 10.1-10.10 (Public page polish)
