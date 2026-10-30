import { test } from "node:test";
import assert from "node:assert/strict";
import { itemsForSkill } from "../../src/lib/fixtures/skill-checks";
import {
  nextAttemptAt,
  parseQuizItems,
  roleQuizFor,
  SKILL_CHECK_COOLDOWN_MS,
  skillCheckAttemptNeedle,
  skillCheckAttemptScores,
  toPublicSkillCheckItems,
  validateSkillCheckAnswers,
} from "../../src/lib/integrity/assessment-attempts";
import { seededShuffle } from "../../src/lib/integrity/shuffle";

test("public items carry {id,text} only — no scores reach the browser", () => {
  const items = itemsForSkill("SQL");
  const pub = toPublicSkillCheckItems(items, "seed-1");
  const json = JSON.stringify(pub);
  assert.doesNotMatch(json, /"score"/);
  for (const [i, it] of pub.entries()) {
    assert.equal(it.id, items[i]!.id);
    for (const o of it.options) assert.deepEqual(Object.keys(o).sort(), ["id", "text"]);
    assert.deepEqual(it.options.map((o) => o.id).sort(), items[i]!.options.map((o) => o.id).sort());
  }
});

test("option order: deterministic per attempt seed, varies across seeds", () => {
  const items = itemsForSkill("Kubernetes");
  const a = JSON.stringify(toPublicSkillCheckItems(items, "cand:k8s:first"));
  assert.equal(a, JSON.stringify(toPublicSkillCheckItems(items, "cand:k8s:first")));
  const orders = new Set<string>();
  for (let i = 0; i < 20; i++) orders.add(JSON.stringify(toPublicSkillCheckItems(items, `seed-${i}`)));
  assert.ok(orders.size > 10, `only ${orders.size} distinct orders over 20 seeds`);
});

test("seededShuffle is a permutation", () => {
  const xs = [1, 2, 3, 4, 5, 6];
  const out = seededShuffle(xs, "x");
  assert.deepEqual([...out].sort(), xs);
  assert.deepEqual(xs, [1, 2, 3, 4, 5, 6], "input not mutated");
});

test("validateSkillCheckAnswers: every item exactly once, valid ids only", () => {
  const items = itemsForSkill("React");
  const full = Object.fromEntries(items.map((i) => [i.id, i.options[0]!.id]));
  assert.ok(validateSkillCheckAnswers(items, full).ok);
  assert.equal(validateSkillCheckAnswers(items, {}).ok, false);
  assert.equal(validateSkillCheckAnswers(items, null).ok, false);
  assert.equal(validateSkillCheckAnswers(items, [] as unknown).ok, false);
  const partial = { ...full };
  delete partial[items[0]!.id];
  assert.equal(validateSkillCheckAnswers(items, partial).ok, false);
  assert.equal(validateSkillCheckAnswers(items, { ...full, [items[0]!.id]: "zz" }).ok, false);
  assert.equal(validateSkillCheckAnswers(items, { ...full, extra: "a" }).ok, false);
  assert.equal(validateSkillCheckAnswers(items, { ...full, [items[0]!.id]: 1 } as unknown).ok, false);
});

test("parseQuizItems: accepts well-formed HM quizzes, rejects junk", () => {
  const good = JSON.stringify([{ id: "q", prompt: "p", options: [{ id: "a", text: "x", score: 1 }, { id: "b", text: "y", score: 10 }] }]);
  assert.equal(parseQuizItems(good)?.length, 1);
  for (const bad of [null, "", "{", "{}", "[]", '[{"id":"q"}]', '[{"id":"q","prompt":"p","options":[{"id":"a","text":"x"}]}]',
    '[{"id":"q","prompt":"p","options":[{"id":"a","text":"x","score":1},{"id":"a","text":"y","score":2}]}]']) {
    assert.equal(parseQuizItems(bad), null, String(bad));
  }
});

test("roleQuizFor: only for a matched role that requires the skill", () => {
  const quiz = JSON.stringify([{ id: "q", prompt: "p", options: [{ id: "a", text: "x", score: 10 }, { id: "b", text: "y", score: 0 }] }]);
  const opening = { quiz, requiredHard: JSON.stringify(["SQL", "Python"]) };
  assert.equal(roleQuizFor(null, "SQL"), null, "not matched → universal bank");
  assert.equal(roleQuizFor(opening, "Figma"), null, "skill not required by the role");
  assert.equal(roleQuizFor(opening, "sql")?.length, 1);
  assert.equal(roleQuizFor({ quiz: null, requiredHard: '["SQL"]' }, "SQL"), null);
  assert.equal(roleQuizFor({ quiz, requiredHard: "nope" }, "SQL"), null);
});

test("cooldown: 24 h per skill", () => {
  const now = new Date("2026-10-30T12:00:00Z");
  assert.equal(nextAttemptAt(null, SKILL_CHECK_COOLDOWN_MS, now), null);
  const last = new Date("2026-10-30T02:00:00Z");
  assert.equal(nextAttemptAt(last, SKILL_CHECK_COOLDOWN_MS, now)?.toISOString(), "2026-10-31T02:00:00.000Z");
  assert.equal(nextAttemptAt(new Date("2026-10-29T11:59:00Z"), SKILL_CHECK_COOLDOWN_MS, now), null);
});

test("attempt rows: needle matches its own row only, and is injection-safe", () => {
  const row = skillCheckAttemptScores("  SQL ", 80);
  assert.ok(row.includes(skillCheckAttemptNeedle("sql")));
  assert.ok(!row.includes(skillCheckAttemptNeedle("sq")));
  assert.ok(!skillCheckAttemptScores("PostgreSQL", 80).includes(skillCheckAttemptNeedle("SQL")));
  const evil = 'x","name":"skill-check:sql';
  assert.ok(!skillCheckAttemptScores(evil, 1).includes(skillCheckAttemptNeedle("sql")));
  assert.deepEqual(JSON.parse(row), [{ name: "skill-check:sql", level: 80 }]);
});
