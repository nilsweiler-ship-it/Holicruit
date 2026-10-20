import { test } from "node:test";
import assert from "node:assert/strict";
import { computeTermsFit, locationFit, parseModes, salaryBand } from "../../src/lib/terms";

test("salaryBand: in / stretch / gap / unknown", () => {
  assert.equal(salaryBand(80_000, 90_000), "in");
  assert.equal(salaryBand(80_000, 80_000), "in");
  assert.equal(salaryBand(80_000, 75_000), "stretch"); // within 10%
  assert.equal(salaryBand(80_000, 71_999), "gap");
  assert.equal(salaryBand(null, 90_000), "unknown");
  assert.equal(salaryBand(80_000, undefined), "unknown");
});

test("locationFit: exact, remote-suits-all, near-modes flexible, otherwise mismatch", () => {
  assert.equal(locationFit(["onsite"], "onsite"), "match");
  assert.equal(locationFit(["onsite"], "remote"), "match");
  assert.equal(locationFit(["onsite"], "hybrid"), "flexible");
  assert.equal(locationFit(["hybrid"], "onsite"), "flexible");
  assert.equal(locationFit(["remote"], "onsite"), "mismatch");
  assert.equal(locationFit(["remote"], "hybrid"), "mismatch");
  assert.equal(locationFit([], "onsite"), "unknown");
  assert.equal(locationFit(["onsite"], null), "unknown");
});

test("computeTermsFit: compatible is false only on gap or mismatch", () => {
  const ok = computeTermsFit({ expMin: 80_000, roleMax: 85_000, candidateModes: ["hybrid"], roleMode: "hybrid" });
  assert.equal(ok.compatible, true);
  assert.equal(ok.label, "In range · Location ✓");

  const gap = computeTermsFit({ expMin: 100_000, roleMax: 60_000, candidateModes: ["hybrid"], roleMode: "hybrid" });
  assert.equal(gap.compatible, false);

  const mismatch = computeTermsFit({ expMin: 50_000, roleMax: 60_000, candidateModes: ["remote"], roleMode: "onsite" });
  assert.equal(mismatch.compatible, false);

  const unknown = computeTermsFit({ candidateModes: [] });
  assert.equal(unknown.compatible, true);
  assert.match(unknown.label, /Set your preferences/);
});

test("computeTermsFit never leaks raw figures", () => {
  const r = computeTermsFit({ expMin: 123_456, roleMax: 99_999, candidateModes: ["onsite"], roleMode: "onsite" });
  const json = JSON.stringify(r);
  assert.ok(!json.includes("123456") && !json.includes("99999"));
});

test("parseModes: tolerant of bad JSON and unknown values", () => {
  assert.deepEqual(parseModes('["remote","hybrid","bogus"]'), ["remote", "hybrid"]);
  assert.deepEqual(parseModes("not json"), []);
  assert.deepEqual(parseModes(null), []);
});
