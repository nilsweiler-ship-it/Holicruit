/**
 * Peer-endorsement integrity — pure helpers (no DB, no Next.js).
 *
 * An endorsement link has to say *whose* skill is being vouched for, and that
 * claim must be unforgeable: otherwise anyone could verify any skill on any
 * profile. The candidate asks the server for a link; the server signs
 * `{candidateId, skill, exp}` with HMAC-SHA256 under AUTH_SECRET. The /endorse
 * page and `giveEndorsement` only trust a token whose signature verifies and
 * which hasn't expired.
 *
 * Token format: `<base64url(JSON payload)>.<base64url(HMAC)>` — compact, URL-safe,
 * and versioned through the HMAC domain-separation prefix.
 */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/** Links stay valid for 30 days. */
export const ENDORSEMENT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export {
  ENDORSEMENTS_TO_VERIFY,
  ENDORSEMENT_RELATIONSHIPS,
  isEndorsementRelationship,
  type EndorsementRelationship,
} from "./endorsement-shared";

export interface EndorsementClaim {
  candidateId: string;
  skill: string;
  /** Expiry, epoch milliseconds. */
  exp: number;
}

const DOMAIN = "holicruit.endorse.v1.";
const MAX_TOKEN_LEN = 2048;
const MAX_SKILL_LEN = 120;

function mac(payloadB64: string, secret: string): Buffer {
  return createHmac("sha256", secret).update(DOMAIN + payloadB64).digest();
}

function assertSecret(secret: string): void {
  if (typeof secret !== "string" || secret.length < 16) {
    throw new Error("Endorsement signing secret missing or too short (set AUTH_SECRET).");
  }
}

/** Sign a claim. Throws on an unusable secret or malformed claim. */
export function signEndorsementToken(claim: EndorsementClaim, secret: string): string {
  assertSecret(secret);
  const skill = claim.skill.trim();
  if (!claim.candidateId || !skill || skill.length > MAX_SKILL_LEN || !Number.isFinite(claim.exp)) {
    throw new Error("Invalid endorsement claim");
  }
  const payload = Buffer.from(JSON.stringify({ c: claim.candidateId, s: skill, e: claim.exp })).toString(
    "base64url",
  );
  return `${payload}.${mac(payload, secret).toString("base64url")}`;
}

/** Mint a fresh token for `candidateId` + `skill`, valid for ENDORSEMENT_TTL_MS. */
export function issueEndorsementToken(
  candidateId: string,
  skill: string,
  secret: string,
  now: number = Date.now(),
): { token: string; exp: number } {
  const exp = now + ENDORSEMENT_TTL_MS;
  return { token: signEndorsementToken({ candidateId, skill, exp }, secret), exp };
}

/**
 * Verify a token. Returns the claim, or null when the token is malformed,
 * tampered with, signed with another secret, or expired. Never throws on
 * attacker-controlled input.
 */
export function verifyEndorsementToken(
  token: unknown,
  secret: string,
  now: number = Date.now(),
): EndorsementClaim | null {
  try {
    assertSecret(secret);
  } catch {
    return null;
  }
  if (typeof token !== "string" || token.length === 0 || token.length > MAX_TOKEN_LEN) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts as [string, string];
  if (!/^[A-Za-z0-9_-]+$/.test(payload) || !/^[A-Za-z0-9_-]+$/.test(sig)) return null;

  const expected = mac(payload, secret);
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

  let data: unknown;
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (!data || typeof data !== "object") return null;
  const { c, s, e } = data as Record<string, unknown>;
  if (typeof c !== "string" || !c || typeof s !== "string" || !s.trim() || typeof e !== "number") return null;
  if (!Number.isFinite(e) || e <= now) return null;
  return { candidateId: c, skill: s, exp: e };
}

/** Case/whitespace-insensitive skill identity. */
export function normalizeSkill(skill: string): string {
  return skill.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Deterministic primary key for an endorsement: one row per (endorser, candidate,
 * skill). Re-endorsing collides on the primary key, so "one endorsement per
 * endorser per skill" is enforced by the database without a schema change. The
 * id is a hash, so it doesn't reveal the endorser's user id.
 */
export function endorsementId(endorserUserId: string, candidateProfileId: string, skill: string): string {
  const h = createHash("sha256")
    .update(`${endorserUserId}\u0000${candidateProfileId}\u0000${normalizeSkill(skill)}`)
    .digest("hex");
  return `end_${h.slice(0, 32)}`;
}

/** App-relative path of an endorsement link. */
export function endorsementPath(skill: string, token: string): string {
  return `/endorse/${encodeURIComponent(skill)}?t=${encodeURIComponent(token)}`;
}

/** The public origin from NEXT_PUBLIC_APP_URL (http/https only), or null. */
export function appBaseUrl(raw: string | undefined = process.env.NEXT_PUBLIC_APP_URL): string | null {
  const v = raw?.trim().replace(/\/+$/, "");
  if (!v) return null;
  try {
    const u = new URL(v);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

/** The secret used to sign endorsement links. Throws when unset. */
export function endorsementSecret(): string {
  const s = process.env.AUTH_SECRET ?? "";
  assertSecret(s);
  return s;
}
