import { test } from "node:test";
import assert from "node:assert/strict";
import {
  appBaseUrl,
  endorsementId,
  endorsementPath,
  ENDORSEMENT_TTL_MS,
  issueEndorsementToken,
  signEndorsementToken,
  verifyEndorsementToken,
} from "../../src/lib/integrity/endorsement";

const SECRET = "test-secret-0123456789abcdef";
const NOW = Date.parse("2026-10-30T12:00:00Z");

test("round-trip: a fresh token verifies to the same candidate + skill", () => {
  const { token, exp } = issueEndorsementToken("cand_1", "React", SECRET, NOW);
  assert.equal(exp, NOW + ENDORSEMENT_TTL_MS);
  assert.deepEqual(verifyEndorsementToken(token, SECRET, NOW + 1000), { candidateId: "cand_1", skill: "React", exp });
});

test("expiry: valid for 30 days, then rejected", () => {
  const { token } = issueEndorsementToken("cand_1", "React", SECRET, NOW);
  assert.ok(verifyEndorsementToken(token, SECRET, NOW + ENDORSEMENT_TTL_MS - 1));
  assert.equal(verifyEndorsementToken(token, SECRET, NOW + ENDORSEMENT_TTL_MS), null);
});

test("tampering: payload, signature, or secret changes are rejected", () => {
  const { token } = issueEndorsementToken("cand_1", "React", SECRET, NOW);
  const [payload, sig] = token.split(".") as [string, string];
  const forged = Buffer.from(JSON.stringify({ c: "cand_2", s: "React", e: NOW + 1e9 })).toString("base64url");
  assert.equal(verifyEndorsementToken(`${forged}.${sig}`, SECRET, NOW), null, "other candidate");
  const flipped = sig.slice(0, -2) + (sig.endsWith("AA") ? "BB" : "AA");
  assert.equal(verifyEndorsementToken(`${payload}.${flipped}`, SECRET, NOW), null, "bad signature");
  assert.equal(verifyEndorsementToken(token, "another-secret-0123456789", NOW), null, "other secret");
});

test("junk input never throws and never verifies", () => {
  for (const t of [undefined, null, 42, {}, "", ".", "a.b.c", "abc", "x".repeat(5000), "€.€", "eyJ9.AAAA"]) {
    assert.equal(verifyEndorsementToken(t, SECRET, NOW), null, String(t));
  }
  assert.equal(verifyEndorsementToken("a.b", "", NOW), null, "missing secret");
});

test("signing refuses an unusable secret or claim", () => {
  assert.throws(() => signEndorsementToken({ candidateId: "c", skill: "React", exp: NOW }, "short"));
  assert.throws(() => signEndorsementToken({ candidateId: "", skill: "React", exp: NOW }, SECRET));
  assert.throws(() => signEndorsementToken({ candidateId: "c", skill: "  ", exp: NOW }, SECRET));
});

test("endorsementId: one per endorser × candidate × skill (case-insensitive), opaque", () => {
  const a = endorsementId("user_1", "cand_1", "React");
  assert.equal(a, endorsementId("user_1", "cand_1", " react "));
  assert.notEqual(a, endorsementId("user_2", "cand_1", "React"));
  assert.notEqual(a, endorsementId("user_1", "cand_2", "React"));
  assert.notEqual(a, endorsementId("user_1", "cand_1", "SQL"));
  assert.match(a, /^end_[0-9a-f]{32}$/);
  assert.ok(!a.includes("user_1"));
});

test("links: domain from NEXT_PUBLIC_APP_URL only, path is URL-safe", () => {
  assert.equal(appBaseUrl("https://app.holicruit.com/"), "https://app.holicruit.com");
  assert.equal(appBaseUrl("http://localhost:3000"), "http://localhost:3000");
  assert.equal(appBaseUrl(""), null); // (undefined would fall back to the env default)
  assert.equal(appBaseUrl("javascript:alert(1)"), null);
  assert.equal(appBaseUrl("not a url"), null);
  assert.equal(endorsementPath("C++ / C#", "a.b"), "/endorse/C%2B%2B%20%2F%20C%23?t=a.b");
});
