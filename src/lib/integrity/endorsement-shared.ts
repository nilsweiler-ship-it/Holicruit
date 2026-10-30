/**
 * Endorsement constants that are safe to import from client components (no
 * node:crypto). Signing/verification lives in ./endorsement.ts (server only).
 */

/**
 * How many independent peer endorsements turn a skill "verified". Kept at the
 * existing semantics (one), but each one must now come from a distinct,
 * logged-in account that isn't the candidate — see `giveEndorsement`.
 */
export const ENDORSEMENTS_TO_VERIFY = 1;

/** How the endorser knows the candidate (validated server-side). */
export const ENDORSEMENT_RELATIONSHIPS = [
  "Manager",
  "Teammate",
  "Mentor",
  "Client / stakeholder",
  "Other",
] as const;
export type EndorsementRelationship = (typeof ENDORSEMENT_RELATIONSHIPS)[number];

export function isEndorsementRelationship(v: unknown): v is EndorsementRelationship {
  return typeof v === "string" && (ENDORSEMENT_RELATIONSHIPS as readonly string[]).includes(v);
}
