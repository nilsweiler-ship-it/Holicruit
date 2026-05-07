/**
 * Single-use, hashed auth tokens for email verification and password reset.
 *
 * Design:
 * - We generate a 32-byte cryptographically random token and send the URL-safe
 *   base64 encoding to the user (in the email link).
 * - We store SHA-256(token) in the DB. A leaked DB does not let an attacker
 *   take over accounts.
 * - Tokens are single-use: when consumed, we set `consumedAt` and reject
 *   future uses.
 * - Each (userId, purpose) tuple invalidates older active tokens when a new
 *   one is created — so requesting a fresh reset link kills the old one.
 */

import crypto from "crypto";
import { prisma } from "@/lib/db";

export type TokenPurpose = "VERIFY_EMAIL" | "RESET_PASSWORD";

const TTL_BY_PURPOSE: Record<TokenPurpose, number> = {
  VERIFY_EMAIL: 24 * 60 * 60 * 1000, // 24h
  RESET_PASSWORD: 60 * 60 * 1000, // 1h
};

function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

function generateRawToken(): string {
  // 32 bytes → 43-char base64url. Plenty of entropy.
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Mint a fresh token for `userId` + `purpose`. Invalidates older active
 * tokens of the same purpose to prevent multiple live links coexisting.
 *
 * Returns the *raw* token — the caller is responsible for putting it into a
 * URL and sending it. The DB only ever sees the hash.
 */
export async function mintToken(
  userId: string,
  purpose: TokenPurpose,
): Promise<string> {
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + TTL_BY_PURPOSE[purpose]);

  // Invalidate older active tokens of the same purpose.
  await prisma.authToken.updateMany({
    where: { userId, purpose, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  await prisma.authToken.create({
    data: { userId, tokenHash, purpose, expiresAt },
  });

  return rawToken;
}

/**
 * Validate and consume a raw token. Returns the userId on success, null on
 * any failure (expired, already consumed, wrong purpose, not found).
 */
export async function consumeToken(
  rawToken: string,
  purpose: TokenPurpose,
): Promise<{ ok: true; userId: string } | { ok: false; reason: string }> {
  if (!rawToken || typeof rawToken !== "string") {
    return { ok: false, reason: "missing-token" };
  }

  const tokenHash = hashToken(rawToken);
  const record = await prisma.authToken.findUnique({
    where: { tokenHash },
  });

  if (!record) return { ok: false, reason: "not-found" };
  if (record.purpose !== purpose) return { ok: false, reason: "wrong-purpose" };
  if (record.consumedAt) return { ok: false, reason: "already-used" };
  if (record.expiresAt < new Date()) return { ok: false, reason: "expired" };

  // Atomic consume: use updateMany with a conditional to avoid double-spend
  // races. (consumedAt: null condition won't match if another request beat us.)
  const updated = await prisma.authToken.updateMany({
    where: { id: record.id, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  if (updated.count === 0) {
    return { ok: false, reason: "race-already-used" };
  }

  return { ok: true, userId: record.userId };
}
