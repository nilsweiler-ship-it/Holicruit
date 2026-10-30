/**
 * Soft-skill scenario (SJT) scoring + the unassessed rule. Exhaustive over all
 * answer patterns (4^6). Ported from the QA adversarial suite (B7, M17).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { SCENARIO_QUESTIONS } from "../../src/lib/fixtures/scenarios";
import {
  InvalidScenarioAnswers,
  scoreScenario,
  toPublicQuestions,
  validateScenarioAnswers,
} from "../../src/lib/integrity/scenario-scoring";
import { computeSoftFit, UNASSESSED_SOFT_FIT } from "../../src/lib/integrity/soft-fit";
import { TRAIT_CEIL, TRAIT_FLOOR, traitBand, traitBarWidth } from "../../src/lib/integrity/traits";

function* allPatterns(): Generator<Record<string, string>> {
  const total = SCENARIO_QUESTIONS.reduce((n, q) => n * q.options.length, 1);
  for (let n = 0; n < total; n++) {
    const ans: Record<string, string> = {};
    let x = n;
    for (const q of SCENARIO_QUESTIONS) {
      ans[q.id] = q.options[x % q.options.length]!.id;
      x = Math.floor(x / q.options.length);
    }
    yield ans;
  }
}

const softFit = (scores: { name: string; level: number }[], requiredSoft: string[] = []) =>
  computeSoftFit({ softSkills: scores, requiredSoft, weightOf: () => 2, severityOf: () => "moderate", softBar: 75 });

test("bank is well-formed: unique ids, ≥3 options, every option loads on a competency and a trait", () => {
  const qids = new Set<string>();
  for (const q of SCENARIO_QUESTIONS) {
    assert.ok(!qids.has(q.id), `dup question ${q.id}`);
    qids.add(q.id);
    assert.ok(q.options.length >= 3);
    assert.equal(new Set(q.options.map((o) => o.id)).size, q.options.length);
    for (const o of q.options) {
      assert.ok(Object.keys(o.weights).length > 0, `${q.id}/${o.id} has no competency weight`);
      assert.ok(Object.keys(o.traits).length > 0, `${q.id}/${o.id} has no trait loading`);
      for (const v of [...Object.values(o.weights), ...Object.values(o.traits)]) assert.ok(v! >= 0 && v! <= 10);
    }
  }
});

test("every pattern: integer scores in range; traits never 0/100 (always within the floor/ceiling)", () => {
  for (const ans of allPatterns()) {
    const r = scoreScenario(SCENARIO_QUESTIONS, ans);
    for (const s of r.scores) assert.ok(Number.isInteger(s.level) && s.level >= 0 && s.level <= 100, `${s.name}=${s.level}`);
    for (const t of r.traits) {
      assert.ok(Number.isInteger(t.level), `${t.name}=${t.level}`);
      assert.ok(t.level >= TRAIT_FLOOR && t.level <= TRAIT_CEIL, `${t.name}=${t.level} for ${JSON.stringify(ans)}`);
    }
  }
});

test("competency scores use the full scale (normalized to what the bank allows)", () => {
  const seen = new Map<string, { min: number; max: number }>();
  for (const ans of allPatterns()) {
    for (const s of scoreScenario(SCENARIO_QUESTIONS, ans).scores) {
      const m = seen.get(s.name) ?? { min: 100, max: 0 };
      seen.set(s.name, { min: Math.min(m.min, s.level), max: Math.max(m.max, s.level) });
    }
  }
  for (const [name, { min, max }] of seen) {
    assert.equal(min, 0, `${name} min`);
    assert.equal(max, 100, `${name} max`);
  }
});

test("a strong answer pattern beats the unassessed placeholder — and so does the typical taker", () => {
  let best = 0;
  const fits: number[] = [];
  for (const ans of allPatterns()) {
    const f = softFit(scoreScenario(SCENARIO_QUESTIONS, ans).scores).softFit;
    best = Math.max(best, f);
    fits.push(f);
  }
  fits.sort((a, b) => a - b);
  const median = fits[Math.floor(fits.length / 2)]!;
  assert.ok(best >= 75, `best achievable softFit is ${best}`);
  assert.ok(best > UNASSESSED_SOFT_FIT, `best ${best} ≤ unassessed ${UNASSESSED_SOFT_FIT}`);
  assert.ok(median >= UNASSESSED_SOFT_FIT, `median taker ${median} < unassessed ${UNASSESSED_SOFT_FIT}`);
});

test("some pattern clears the 75 bar on Communication AND Ownership (no soft gaps for a role asking for both)", () => {
  let minGaps = Infinity;
  for (const ans of allPatterns()) {
    const r = scoreScenario(SCENARIO_QUESTIONS, ans);
    minGaps = Math.min(minGaps, softFit(r.scores, ["Communication", "Ownership"]).gaps.length);
  }
  assert.equal(minGaps, 0);
});

test("unassessed = unknown: neutral placeholder below the scale midpoint, no invented gaps, flagged", () => {
  const f = softFit([], ["Communication", "Ownership"]);
  assert.equal(f.softAssessed, false);
  assert.equal(f.gaps.length, 0);
  assert.equal(f.softFit, UNASSESSED_SOFT_FIT);
  assert.ok(UNASSESSED_SOFT_FIT < 50 && UNASSESSED_SOFT_FIT < 75);
  assert.equal(softFit([{ name: "Communication", level: 80 }]).softAssessed, true);
});

test("soft fit is bounded: out-of-range and NaN levels are clamped / ignored", () => {
  assert.equal(softFit([{ name: "Communication", level: 150 }], ["Communication"]).softFit, 100);
  assert.equal(softFit([{ name: "Communication", level: -20 }], ["Communication"]).softFit, 0);
  const nan = softFit([{ name: "Communication", level: Number.NaN }], ["Communication"]);
  assert.ok(Number.isFinite(nan.softFit));
});

test("all-same answers ('always a') don't produce extreme trait scores", () => {
  const r = scoreScenario(SCENARIO_QUESTIONS, Object.fromEntries(SCENARIO_QUESTIONS.map((q) => [q.id, "a"])));
  for (const t of r.traits) assert.ok(t.level > 5 && t.level < 95, `${t.name}=${t.level}`);
});

test("no single option id is the key: 'always X' never tops the soft fit", () => {
  let best = 0;
  for (const ans of allPatterns()) best = Math.max(best, softFit(scoreScenario(SCENARIO_QUESTIONS, ans).scores).softFit);
  for (const id of ["a", "b", "c", "d"]) {
    const r = scoreScenario(SCENARIO_QUESTIONS, Object.fromEntries(SCENARIO_QUESTIONS.map((q) => [q.id, id])));
    assert.ok(softFit(r.scores).softFit < best - 10, `always-${id} is near-optimal`);
  }
});

test("invalid submissions are rejected, never scored as zeros", () => {
  const full = Object.fromEntries(SCENARIO_QUESTIONS.map((q) => [q.id, q.options[0]!.id]));
  const bad: unknown[] = [
    {},
    null,
    "a",
    [],
    Object.fromEntries(SCENARIO_QUESTIONS.map((q) => [q.id, "zz"])),
    { ...full, q1: undefined },
    { ...full, extra: "a" },
    { ...full, q1: 1 },
    JSON.parse('{"__proto__":{"q1":"a"},"constructor":"a"}'),
  ];
  for (const b of bad) {
    assert.equal(validateScenarioAnswers(SCENARIO_QUESTIONS, b).ok, false, JSON.stringify(b));
    assert.throws(() => scoreScenario(SCENARIO_QUESTIONS, b), InvalidScenarioAnswers);
  }
  assert.equal(validateScenarioAnswers(SCENARIO_QUESTIONS, full).ok, true);
});

test("public questions carry text + ids only (no weights/traits), shuffled per seed", () => {
  const pub = toPublicQuestions(SCENARIO_QUESTIONS, "s1");
  assert.doesNotMatch(JSON.stringify(pub), /weights|traits/);
  assert.equal(JSON.stringify(pub), JSON.stringify(toPublicQuestions(SCENARIO_QUESTIONS, "s1")));
  const orders = new Set<string>();
  for (let i = 0; i < 10; i++) orders.add(JSON.stringify(toPublicQuestions(SCENARIO_QUESTIONS, `s${i}`)));
  assert.ok(orders.size > 5);
});

test("trait display: bands, bar clamped to 5–95", () => {
  assert.equal(traitBand(0), "Low");
  assert.equal(traitBand(50), "Moderate");
  assert.equal(traitBand(100), "High");
  assert.equal(traitBarWidth(0), 5);
  assert.equal(traitBarWidth(100), 95);
  assert.equal(traitBarWidth(Number.NaN), 50);
});
