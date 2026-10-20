import { test } from "node:test";
import assert from "node:assert/strict";
import { employerIdentity, initialsFrom, personIdentity } from "../../src/lib/identity";

test("initialsFrom", () => {
  assert.equal(initialsFrom("Aisha Khan"), "AK");
  assert.equal(initialsFrom("Nightingale"), "N");
  assert.equal(initialsFrom("  "), "?");
});

test("personIdentity: real name unless anonymous and not revealed", () => {
  const u = { name: "Aisha Khan", initials: "AK", alias: "Nightingale", anonymous: true };
  const hidden = personIdentity(u, false);
  assert.deepEqual(hidden, { name: "Nightingale", initials: "N", masked: true });
  const revealed = personIdentity(u, true);
  assert.deepEqual(revealed, { name: "Aisha Khan", initials: "AK", masked: false });
  const plain = personIdentity({ name: "Sam Lee", initials: "SL" }, false);
  assert.equal(plain.masked, false);
  const noAlias = personIdentity({ name: "Sam Lee", initials: "SL", anonymous: true }, false);
  assert.equal(noAlias.name, "Anonymous");
});

test("personIdentity: the real name never appears in a masked identity", () => {
  const r = personIdentity({ name: "Aisha Khan", initials: "AK", alias: "Nightingale", anonymous: true }, false);
  assert.ok(!JSON.stringify(r).includes("Aisha"));
});

const employer = {
  companyName: "Acme AG",
  hmName: "Priya Nair",
  hmInitials: "PN",
  hmHeadline: "VP Engineering · Acme AG",
};

test("employerIdentity: confidential role hides company and HM", () => {
  const r = employerIdentity({ ...employer, companyConfidential: true, companyAlias: "A Series-B fintech" }, false);
  assert.equal(r.companyName, "A Series-B fintech");
  assert.equal(r.companyMasked, true);
  assert.equal(r.hmName, "Hiring team");
  assert.equal(r.hmMasked, true);
  assert.equal(r.hmHeadline, "Hiring manager");
  assert.ok(!JSON.stringify(r).includes("Acme") && !JSON.stringify(r).includes("Priya"));
});

test("employerIdentity: hmAnonymous alone keeps the company visible", () => {
  const r = employerIdentity({ ...employer, hmAnonymous: true, hmAlias: "Engineering lead" }, false);
  assert.equal(r.companyName, "Acme AG");
  assert.equal(r.companyMasked, false);
  assert.equal(r.hmName, "Engineering lead");
  assert.equal(r.hmHeadline, "Hiring manager · Acme AG");
});

test("employerIdentity: reveal restores everything", () => {
  const r = employerIdentity({ ...employer, companyConfidential: true, hmAnonymous: true }, true);
  assert.equal(r.companyName, "Acme AG");
  assert.equal(r.hmName, "Priya Nair");
  assert.equal(r.companyMasked, false);
  assert.equal(r.hmMasked, false);
});
