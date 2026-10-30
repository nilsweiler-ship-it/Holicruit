import { test } from "node:test";
import assert from "node:assert/strict";
import { aggregateGapDemand } from "../../src/lib/integrity/gap-demand";
import { growthPanel, isRealGapSkill, plural } from "../../src/lib/integrity/growth-notes";

const gaps = (...g: [string, "hard" | "soft"][]) => JSON.stringify(g.map(([skill, type]) => ({ skill, type, severity: "moderate" })));

test("gap demand: distinct candidates and roles, k-anonymous, real program counts", () => {
  const rows = [
    { candidateId: "c1", openingId: "o1", industry: "Tech", gaps: gaps(["Kubernetes", "hard"]) },
    { candidateId: "c1", openingId: "o2", industry: "Tech", gaps: gaps(["Kubernetes", "hard"]) },
    { candidateId: "c2", openingId: "o1", industry: "Tech", gaps: gaps(["kubernetes", "hard"], ["Ownership", "soft"]) },
    { candidateId: "c3", openingId: "o3", industry: "Health", gaps: gaps(["Kubernetes", "hard"]) },
    { candidateId: "c4", openingId: "o3", industry: "Health", gaps: gaps(["Ownership", "soft"]) },
    { candidateId: "c5", openingId: "o3", industry: "Health", gaps: "not json" },
  ];
  const out = aggregateGapDemand(rows, new Map([["kubernetes", 2]]));
  assert.equal(out.length, 1, "Ownership has only 2 candidates → hidden");
  assert.deepEqual(out[0], {
    skill: "Kubernetes",
    type: "hard",
    industry: "Tech",
    candidatesWithGap: 3,
    rolesBlocked: 3,
    programsOffered: 2,
  });
  assert.deepEqual(aggregateGapDemand([], new Map()), []);
});

test("growth panel: above bar only when you >= bar", () => {
  const above = growthPanel({ type: "soft", you: 80, bar: 75, primaryGap: { skill: "SQL", type: "hard" } });
  assert.equal(above.aboveBar, true);
  assert.equal(above.note, "Above bar — a strength");
  assert.equal(above.gap, undefined);

  const below = growthPanel({ type: "soft", you: 60, bar: 75, primaryGap: { skill: "SQL", type: "hard" } });
  assert.equal(below.aboveBar, false);
  assert.notEqual(below.note, "Above bar — a strength");
  assert.equal(below.note, "Below bar by 15 points");
});

test("growth panel: names the gap only when it's real and of this panel's type", () => {
  const hard = growthPanel({ type: "hard", you: 50, bar: 85, primaryGap: { skill: "SQL", type: "hard" } });
  assert.equal(hard.note, "Gap: SQL");
  assert.equal(hard.gap?.skill, "SQL");
  const hardAbove = growthPanel({ type: "hard", you: 90, bar: 85, primaryGap: { skill: "SQL", type: "hard" } });
  assert.equal(hardAbove.note, "Above bar — a strength");
  const dash = growthPanel({ type: "hard", you: 84, bar: 85, primaryGap: { skill: "—", type: "hard" } });
  assert.equal(dash.note, "Below bar by 1 point");
  assert.equal(dash.gap, undefined);
});

test("plural / isRealGapSkill", () => {
  assert.equal(plural(1, "open role"), "1 open role");
  assert.equal(plural(0, "open role"), "0 open roles");
  assert.equal(plural(3, "program match", "program matches"), "3 program matches");
  assert.equal(isRealGapSkill("—"), false);
  assert.equal(isRealGapSkill(""), false);
  assert.equal(isRealGapSkill("SQL"), true);
});
