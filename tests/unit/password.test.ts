import { test } from "node:test";
import assert from "node:assert/strict";
import { checkPassword, passwordsMatch, PASSWORD_MAX } from "../../src/lib/password";

test("accepts a password meeting every rule", () => {
  assert.equal(checkPassword("Test-Pass-2026!").ok, true);
  assert.equal(checkPassword("Grüezi-Zürich-9").ok, true); // non-ASCII letters count
});

test("rejects each missing rule and names it", () => {
  const cases: [string, string][] = [
    ["Sh0rt!a", "length"],
    ["NOLOWERCASE-123", "lower"],
    ["nouppercase-123", "upper"],
    ["No-Numbers-Here", "digit"],
    ["NoSymbols12345", "symbol"],
  ];
  for (const [pw, rule] of cases) {
    const r = checkPassword(pw);
    assert.equal(r.ok, false, pw);
    assert.ok(r.failed.some((f) => f.id === rule), `${pw} should fail ${rule}`);
    assert.ok(r.message && r.message.length > 0);
  }
});

test("old 8-character style passwords no longer pass", () => {
  assert.equal(checkPassword("password123").ok, false);
  assert.equal(checkPassword("testpass123").ok, false);
});

test("rejects common passwords, the email name and over-long input", () => {
  assert.equal(checkPassword("Password123!").ok, false);
  assert.equal(checkPassword("Nils.Weiler-2026", { email: "nils.weiler@example.com" }).ok, false);
  assert.equal(checkPassword("Aa1!" + "x".repeat(PASSWORD_MAX)).ok, false);
  assert.equal(checkPassword(undefined as unknown as string).ok, false);
});

test("confirmation must match exactly", () => {
  assert.equal(passwordsMatch("Test-Pass-2026!", "Test-Pass-2026!"), true);
  assert.equal(passwordsMatch("Test-Pass-2026!", "Test-Pass-2026"), false);
  assert.equal(passwordsMatch("", ""), false);
  assert.equal(passwordsMatch("x", null), false);
});
