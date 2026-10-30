/**
 * Demo-world isolation.
 *
 * The seed (prisma/seed.ts) creates every demo account on the reserved
 * `holicruit.test` domain (`.test` is an IANA reserved TLD, so no real person
 * can own such an address). Anything owned by a demo account — candidate
 * profiles, companies, openings — belongs to the demo world and must never be
 * matched with the real world: demo candidates stay out of real hiring
 * managers' pipelines, and real candidates are never matched into demo roles.
 */

export const DEMO_EMAIL_DOMAIN = "holicruit.test";

/** True when the address belongs to a seeded demo account. Case-insensitive. */
export function isDemoEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  const at = e.lastIndexOf("@");
  return at >= 0 && e.slice(at + 1) === DEMO_EMAIL_DOMAIN;
}

/**
 * Matching is allowed only within one world: demo↔demo or real↔real.
 * `candidateEmail` is the candidate's account email; `ownerEmail` is the email
 * of the user who owns the opening's company.
 */
export function sameWorld(candidateEmail: string | null | undefined, ownerEmail: string | null | undefined): boolean {
  return isDemoEmail(candidateEmail) === isDemoEmail(ownerEmail);
}

/**
 * One-click demo logins (and the "live demo" marketing banner) are an explicit
 * opt-in: they render only when NEXT_PUBLIC_DEMO_LOGINS is exactly "1".
 * Production should leave it unset unless a public demo is intended.
 * (NEXT_PUBLIC_* is inlined at build time, so changing it needs a rebuild.)
 */
export function demoLoginsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_LOGINS === "1";
}
