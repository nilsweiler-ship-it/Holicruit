import { test } from "node:test";
import assert from "node:assert/strict";
import { categoryOf, itemsForSkill, scoreSkillCheck, SKILL_CHECK_PASS } from "../../src/lib/fixtures/skill-checks";

function validate(items: ReturnType<typeof itemsForSkill>, skill: string) {
  assert.ok(Array.isArray(items), `${skill}: not an array`);
  assert.ok(items.length >= 3, `${skill}: expected ≥3 items, got ${items.length}`);
  const ids = new Set<string>();
  for (const it of items) {
    assert.ok(!ids.has(it.id), `${skill}: duplicate item id ${it.id}`);
    ids.add(it.id);
    assert.ok(it.options.length >= 3, `${skill}: item ${it.id} needs ≥3 options`);
    assert.equal(Math.max(...it.options.map((o) => o.score)), 10, `${skill}/${it.id}: no 10-point option`);
    for (const o of it.options) assert.ok(o.score >= 0 && o.score <= 10, `${skill}/${it.id}/${o.id}`);
    const oids = new Set(it.options.map((o) => o.id));
    assert.equal(oids.size, it.options.length, `${skill}: duplicate option ids in ${it.id}`);
  }
}

/** One skill per bank: 2 hand-authored, 12 domain banks, the generic fallback. */
const BANK_SAMPLE = [
  "SQL", "React", "Kubernetes", "Tableau", "GMP", "Triage", "Figma", "Product strategy", "Scrum",
  "Salesforce", "SEO", "FP&A", "Supply chain", "Curriculum design", "Basket weaving",
];

test("hand-authored banks are well-formed", () => {
  for (const s of ["sql", "react", "SQL", "React"]) validate(itemsForSkill(s), s);
});

test("every bank is well-formed", () => {
  for (const s of [...BANK_SAMPLE, "Python", "Machine learning"]) validate(itemsForSkill(s), s);
});

test("category banks are tailored: skill name appears in the items", () => {
  for (const s of ["Python", "Kubernetes", "GMP", "Figma", "Salesforce", "Excel"]) {
    const items = itemsForSkill(s);
    validate(items, s);
    assert.ok(JSON.stringify(items).includes(s), `${s}: items should reference the skill`);
  }
});

test("unknown skill falls back to a generic but valid bank", () => {
  validate(itemsForSkill("Underwater basket weaving"), "generic");
});

test("itemsForSkill always returns a non-empty array (prototype-named / blank skills)", () => {
  for (const s of ["constructor", "Constructor", "__proto__", "toString", "hasOwnProperty", "valueOf", "", " "]) {
    let items: unknown;
    assert.doesNotThrow(() => {
      items = itemsForSkill(s);
    }, s);
    validate(items as ReturnType<typeof itemsForSkill>, JSON.stringify(s));
  }
  assert.doesNotMatch(JSON.stringify(itemsForSkill(" ")), /leans heavily on ,/);
});

// ── Routing (M6): whole-word aliases, longest first ──────────────────────────
const prompts = (s: string) => itemsForSkill(s).map((i) => i.prompt).join(" | ");

test("routing: Accounting → finance, not sales", () => {
  assert.equal(categoryOf("Accounting"), "finance");
  assert.doesNotMatch(prompts("Accounting"), /prospect|discount|deal|quota/i);
  assert.equal(categoryOf("Account management"), "sales");
});

test("routing: Recruiting → ops, not design", () => {
  assert.equal(categoryOf("Recruiting"), "ops");
  assert.doesNotMatch(prompts("Recruiting"), /User testing|design/i);
});

test("routing: 'ui' substring doesn't send unrelated skills to design", () => {
  for (const s of ["Liquidity risk", "Requirements engineering", "Building Information Modeling", "Guitar"]) {
    assert.notEqual(categoryOf(s), "design", s);
    assert.doesNotMatch(prompts(s), /User testing contradicts/i, s);
  }
  assert.equal(categoryOf("UI design"), "design");
  assert.equal(categoryOf("UX/UI"), "design");
});

test("routing: 'go' substring doesn't send non-engineering skills to code review", () => {
  for (const s of ["Google Ads", "Category management", "Logistics", "Go-to-market"]) {
    assert.notEqual(categoryOf(s), "engineering", s);
    assert.doesNotMatch(prompts(s), /pull request|passes CI/i, s);
  }
  assert.equal(categoryOf("Go"), "engineering");
  assert.equal(categoryOf("Golang"), "engineering");
});

test("routing: healthcare and other whole-word cases", () => {
  assert.equal(categoryOf("Nursing"), "healthcare");
  assert.doesNotMatch(prompts("Nursing"), /You're handed a task that leans heavily on Nursing/);
  assert.equal(categoryOf("Clinical research"), "quality", "longest alias wins over 'clinical'");
  assert.equal(categoryOf("CI/CD"), "engineering");
  assert.equal(categoryOf("C++"), "engineering");
  assert.equal(categoryOf("Node.js"), "engineering");
  assert.equal(categoryOf("FP&A"), "finance");
  assert.equal(categoryOf("constructor"), null);
  assert.equal(categoryOf("__proto__"), null);
});

// ── Scoring ──────────────────────────────────────────────────────────────────
test("scoreSkillCheck: best answers pass, worst answers fail, empty is 0", () => {
  const items = itemsForSkill("sql");
  const best: Record<string, string> = {};
  const worst: Record<string, string> = {};
  for (const it of items) {
    const sorted = [...it.options].sort((a, b) => b.score - a.score);
    best[it.id] = sorted[0]!.id;
    worst[it.id] = sorted[sorted.length - 1]!.id;
  }
  assert.equal(scoreSkillCheck(items, best), 100);
  assert.ok(scoreSkillCheck(items, worst) < SKILL_CHECK_PASS);
  assert.equal(scoreSkillCheck(items, {}), 0);
  assert.equal(scoreSkillCheck([], {}), 0);
  const half = Object.fromEntries(Object.entries(best).slice(0, Math.ceil(items.length / 2)));
  assert.ok(scoreSkillCheck(items, half) < SKILL_CHECK_PASS, "half-answered must not pass");
});

test("scoreSkillCheck: negative custom-quiz scores never give a negative result", () => {
  const s = scoreSkillCheck(
    [{ id: "x", prompt: "p", options: [{ id: "a", text: "t", score: -5 }, { id: "b", text: "t", score: 3 }] }],
    { x: "a" },
  );
  assert.ok(s >= 0, `score=${s}`);
});

test("scoreSkillCheck: tolerant of non-array items and prototype keys in answers", () => {
  assert.doesNotThrow(() => scoreSkillCheck(itemsForSkill("__proto__"), {}));
  assert.equal(scoreSkillCheck(null as never, {}), 0);
  const items = itemsForSkill("sql");
  assert.equal(scoreSkillCheck(items, JSON.parse('{"__proto__":{"slow-query":"c"}}')), 0);
});

// ── Answer-key heuristics (B5) ───────────────────────────────────────────────
test("no fixed position passes any bank ('always pick a/b/c/d')", () => {
  for (const s of BANK_SAMPLE) {
    const items = itemsForSkill(s);
    for (const pos of [0, 1, 2, 3]) {
      const pick = Object.fromEntries(items.map((i) => [i.id, i.options[pos]!.id]));
      const score = scoreSkillCheck(items, pick);
      assert.ok(score < SKILL_CHECK_PASS, `${s}: always option #${pos + 1} scores ${score}`);
    }
  }
});

test("best answer position is spread evenly within every bank", () => {
  for (const s of BANK_SAMPLE) {
    const positions = itemsForSkill(s).map((i) => i.options.findIndex((o) => o.score === 10));
    assert.equal(new Set(positions).size, positions.length, `${s}: best answer repeats a position (${positions})`);
  }
});

test("longest / shortest option is not a reliable cue", () => {
  let n = 0;
  let longestIsBest = 0;
  let shortestIsBest = 0;
  for (const s of BANK_SAMPLE) {
    const items = itemsForSkill(s);
    const longest = Object.fromEntries(items.map((i) => [i.id, i.options.reduce((a, b) => (b.text.length > a.text.length ? b : a)).id]));
    const shortest = Object.fromEntries(items.map((i) => [i.id, i.options.reduce((a, b) => (b.text.length < a.text.length ? b : a)).id]));
    assert.ok(scoreSkillCheck(items, longest) < SKILL_CHECK_PASS, `${s}: always-longest passes`);
    assert.ok(scoreSkillCheck(items, shortest) < SKILL_CHECK_PASS, `${s}: always-shortest passes`);
    for (const it of items) {
      n++;
      if (it.options.reduce((a, b) => (b.text.length > a.text.length ? b : a)).score === 10) longestIsBest++;
      if (it.options.reduce((a, b) => (b.text.length < a.text.length ? b : a)).score === 10) shortestIsBest++;
    }
  }
  assert.ok(longestIsBest / n < 0.35, `longest is best in ${longestIsBest}/${n}`);
  assert.ok(shortestIsBest / n < 0.35, `shortest is best in ${shortestIsBest}/${n}`);
});
