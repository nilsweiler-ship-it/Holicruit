import { test } from "node:test";
import assert from "node:assert/strict";
import { jobAdParser } from "../../src/lib/services/ingest";

const PHARMA_CV = `
Dr. Jane Example
Quality Assurance Manager · Basel

PROFESSIONAL EXPERIENCE
2019–2024  QA Manager, Example Pharma AG
- Led GMP compliance for sterile manufacturing; hosted 3 FDA inspections and 2 Swissmedic audits
- Owned CAPA and deviation management; introduced risk-based validation (CSV, GAMP 5)
- Batch record review, change control, supplier qualification

SKILLS
GMP, GDP, CAPA, Deviation Management, Change Control, Computer System Validation, GAMP 5,
Audit Management, Risk Management (ICH Q9), SAP QM, Veeva Vault, Excel, English, German

CERTIFICATIONS
ISO 9001 Lead Auditor · Six Sigma Green Belt
`;

const DEV_CV = `
Sam Developer — Senior Frontend Engineer
6 years building React and TypeScript apps with GraphQL and Node.js. Strong in system design,
testing (Jest, Playwright), CI/CD on GitHub Actions, and AWS. Clear communicator, takes ownership.
`;

test("parseCv extracts structured skills from a skills section, not just vocabulary hits", async () => {
  const r = await jobAdParser.parseCv(PHARMA_CV);
  assert.ok(r.hardSkills.length >= 10, `expected ≥10 skills, got ${r.hardSkills.length}: ${r.hardSkills.join(", ")}`);
  for (const s of ["GMP", "CAPA", "Change Control", "GAMP 5"]) {
    assert.ok(r.hardSkills.some((x) => x.toLowerCase() === s.toLowerCase()), `missing ${s}`);
  }
});

test("parseCv filters noise (languages, sentence fragments) and caps the list", async () => {
  const r = await jobAdParser.parseCv(PHARMA_CV);
  assert.ok(r.hardSkills.length <= 40);
  for (const s of r.hardSkills) {
    assert.ok(s.length <= 40, `suspiciously long skill: "${s}"`);
    assert.ok(!/^(and|the|with|for)$/i.test(s));
  }
});

test("parseCv on a dev CV finds core stack and an industry", async () => {
  const r = await jobAdParser.parseCv(DEV_CV);
  for (const s of ["React", "TypeScript", "GraphQL"]) {
    assert.ok(r.hardSkills.some((x) => x.toLowerCase() === s.toLowerCase()), `missing ${s}`);
  }
  assert.equal(typeof r.industry, "string");
});

test("parseCv on empty / garbage input is safe", async () => {
  const r = await jobAdParser.parseCv("");
  assert.deepEqual(r.hardSkills, []);
  const g = await jobAdParser.parseCv("lorem ipsum dolor sit amet ".repeat(50));
  assert.ok(Array.isArray(g.hardSkills));
});

test("parseJobAd extracts title and skills", async () => {
  const r = await jobAdParser.parseJobAd(`
Senior Frontend Engineer (m/w/d)
Acme AG · Zürich · Hybrid
We are looking for an engineer with React, TypeScript and GraphQL experience.
Requirements: strong communication, ownership.
`);
  assert.ok(r.title.length > 0);
  assert.ok(r.requiredHard.some((s) => /react/i.test(s)));
});
