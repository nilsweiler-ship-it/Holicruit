# Quality gate & automation

The goal: nothing reaches app.holicruit.com that hasn't passed the same checks every time, and nobody has to click through the app by hand to know it works.

## What runs, and when

| Stage | Where | What |
|---|---|---|
| Every push / PR | GitHub Actions `CI` | lint → type-check → **unit tests** (matching terms, identity masking, skill banks, CV parsing) → production build → fresh Postgres + seed → **browser journeys** (register with consent, post confidential role with must-haves, import pipeline + claim link, candidate must-haves + CV import, must-have gate, alias + export + erasure, contact lead + feedback → admin inbox) → **smoke** (desktop + mobile) |
| Deploy to main | Railway, *Wait for CI* on | Only deploys a commit whose CI job is green |
| After deploy | `Verify production deploy` (runs after CI) | Polls `/api/health` until the live commit matches, then runs the **read-only smoke suite against production** |
| Daily 05:00 UTC | `Production smoke` | Same smoke suite against production, independent of deploys |

The smoke suite is strictly read-only (demo logins, no writes) so it is safe on production. The journey suite refuses to run against a `holicruit.*` host.

Failures email the repo owner (GitHub default) and attach a Playwright report with screenshots and traces.

## Running locally

```
npm run test:unit        # < 1 s, no database needed
npm run test:e2e         # builds nothing — expects `npm run build` first; starts the app itself
npm run test:e2e:prod    # read-only smoke against app.holicruit.com
```

## Adding a check

- Pure logic → `tests/unit/*.test.ts` (node:test, no deps).
- Anything a user sees → `tests/e2e/smoke.spec.ts` if read-only, `journeys.spec.ts` if it writes.
- Red-flag phrases that must never render (`Application error`, `undefined`, `Test mode`, …) live in `tests/e2e/helpers.ts › RED_FLAGS`.

## One-time setup (done once, then automatic)

1. Railway → service → **Settings → Source → Wait for CI** → on.
2. GitHub → repo → **Settings → Actions → General** → allow workflows (default).

## Shipping a change

```
~/Holicruit/ship.command        # or: cd ~/Holicruit && git add -A && git commit -m "…" && git push
```

`ship.command` is double-clickable in Finder: it commits whatever is in the working tree with the message in `.commitmsg` (or a timestamp) and pushes. CI takes it from there.
