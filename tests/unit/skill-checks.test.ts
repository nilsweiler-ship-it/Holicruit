import { test } from "node:test";
import assert from "node:assert/strict";
import { itemsForSkill, scoreSkillCheck, SKILL_CHECK_PASS } from "../../src/lib/fixtures/skill-checks";

function validate(items: ReturnType<typeof itemsForSkill>, skill: string) {
  assert.ok(items.length >= 3, `${skill}: expected ≥3 items, got ${items.length}`);
  const ids = new Set<string>();
  for (const it of items) {
    assert.ok(!ids.has(it.id), `${skill}: duplicate item id ${it.id}`);
    ids.add(it.id);
    assert.ok(it.options.length >= 3, `${skill}: item ${it.id} needs ≥3 options`);
    assert.ok(it.options.some((o) => o.score > 0), `${skill}: item ${it.id} has no scoring option`);
    const oids = new Set(it.options.map((o) => o.id));
    assert.equal(oids.size, it.options.length, `${skill}: duplicate option ids in ${it.id}`);
  }
}

test("hand-authored banks are well-formed", () => {
  for (const s of ["sql", "react", "SQL", "React"]) validate(itemsForSkill(s), s);
});

test("category banks are tailored: skill name appears in the items", () => {
  for (const s of ["Python", "Kubernetes", "GMP", "Figma", "Salesforce", "Excel"]) {
    const items = itemsForSkill(s);
    validate(items, s);
    const text = JSON.stringify(items);
    assert.ok(text.includes(s), `${s}: items should reference the skill`);
  }
});

test("unknown skill falls back to a generic but valid bank", () => {
  validate(itemsForSkill("Underwater basket weaving"), "generic");
});

test("scoreSkillCheck: best answers pass, worst answers fail", () => {
  const items = itemsForSkill("sql");
  const best: Record<string, string> = {};
  const worst: Record<string, string> = {};
  for (const it of items) {
    const sorted = [...it.options].sort((a, b) => b.score - a.score);
    best[it.id] = sorted[0].id;
    worst[it.id] = sorted[sorted.length - 1].id;
  }
  assert.equal(scoreSkillCheck(items, best), 100);
  assert.ok(scoreSkillCheck(items, worst) < SKILL_CHECK_PASS);
  assert.equal(scoreSkillCheck(items, {}), 0);
});
