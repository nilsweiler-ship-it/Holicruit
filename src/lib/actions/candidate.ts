"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getActiveCandidateId } from "@/lib/persona";
import { scenarioService } from "@/lib/services/scenario";
import { jobAdParser } from "@/lib/services/ingest";
import { runMatchingForCandidate } from "@/lib/matching/engine";
import type { ScenarioResult } from "@/lib/scenario/types";

function initialsOf(name: string): string {
  const w = name.trim().split(/\s+/).filter(Boolean);
  return ((w[0]?.[0] ?? "") + (w.length > 1 ? w[w.length - 1]?.[0] ?? "" : "")).toUpperCase() || "?";
}

async function recalcCompleteness(candidateId: string): Promise<void> {
  const p = await prisma.candidateProfile.findUnique({
    where: { id: candidateId },
    include: { hardSkills: true },
  });
  if (!p) return;
  const verified = p.hardSkills.filter((s) => s.verified).length;
  const completeness = Math.min(
    100,
    40 + Math.min(p.hardSkills.length * 4, 24) + (p.scenarioCompleted ? 20 : 0) + Math.min(verified * 4, 16),
  );
  await prisma.candidateProfile.update({ where: { id: candidateId }, data: { completeness } });
}

function revalidateCandidate() {
  revalidatePath("/candidate/matches");
  revalidatePath("/candidate/profile");
  revalidatePath("/candidate/today");
  revalidatePath("/candidate/growth-paths");
}

/** Persist scenario answers → soft-skill scores, mark complete, re-run matching. */
export async function submitScenario(answers: Record<string, string>): Promise<ScenarioResult> {
  const candidateId = await getActiveCandidateId();
  const result = await scenarioService.score(answers);
  for (const s of result.scores) {
    await prisma.softSkillScore.upsert({
      where: { profileId_name: { profileId: candidateId, name: s.name } },
      update: { level: s.level },
      create: { profileId: candidateId, name: s.name, level: s.level },
    });
  }
  await prisma.candidateProfile.update({
    where: { id: candidateId },
    data: { scenarioCompleted: true },
  });
  await recalcCompleteness(candidateId);
  await runMatchingForCandidate(candidateId);
  revalidateCandidate();
  return result;
}

/**
 * Parse step of import: translate pasted text (a CV, a job description, a
 * profile) into the structured skill model. Returns the extracted skills for
 * the candidate to review before anything is saved.
 */
export async function parseProfileText(text: string): Promise<{ skills: string[]; industry: string }> {
  await getActiveCandidateId();
  const parsed = await jobAdParser.parseCv(text);
  return { skills: parsed.hardSkills, industry: parsed.industry };
}

/** Confirm step of import: add the reviewed skills and re-run matching. */
export async function addImportedSkills(names: string[], industry?: string): Promise<void> {
  const candidateId = await getActiveCandidateId();
  for (const name of names) {
    const clean = name.trim();
    if (!clean) continue;
    await prisma.hardSkill.upsert({
      where: { profileId_name: { profileId: candidateId, name: clean } },
      update: {},
      create: { profileId: candidateId, name: clean, verified: false },
    });
  }
  if (industry && industry !== "General") {
    await prisma.candidateProfile.update({ where: { id: candidateId }, data: { industry } });
  }
  await recalcCompleteness(candidateId);
  await runMatchingForCandidate(candidateId);
  revalidateCandidate();
  redirect("/candidate/profile");
}

/** Add a self-declared (unverified) hard skill. */
export async function addSkill(name: string): Promise<void> {
  const candidateId = await getActiveCandidateId();
  const clean = name.trim();
  if (!clean) return;
  await prisma.hardSkill.upsert({
    where: { profileId_name: { profileId: candidateId, name: clean } },
    update: {},
    create: { profileId: candidateId, name: clean, verified: false },
  });
  await recalcCompleteness(candidateId);
  await runMatchingForCandidate(candidateId);
  revalidateCandidate();
}

/** Record a peer endorsement → the skill becomes verified. Re-runs matching. */
export async function giveEndorsement(input: {
  candidateId: string;
  skill: string;
  relationship: string;
  endorserName?: string;
}): Promise<void> {
  const { candidateId, skill, relationship } = input;
  const endorserName = input.endorserName?.trim() || "A verified peer";
  await prisma.endorsement.create({
    data: {
      profileId: candidateId,
      skill,
      endorserName,
      endorserInitials: initialsOf(endorserName),
      endorserHeadline: "Worked with you",
      relationship,
    },
  });
  await prisma.hardSkill.upsert({
    where: { profileId_name: { profileId: candidateId, name: skill } },
    update: { verified: true },
    create: { profileId: candidateId, name: skill, verified: true },
  });
  await recalcCompleteness(candidateId);
  await runMatchingForCandidate(candidateId);
  revalidateCandidate();
}

/** Enroll in a program. For the demo flywheel this also closes a hard gap and
 *  re-runs matching (a real flow would do this on completion). */
export async function enroll(programId: string): Promise<void> {
  const candidateId = await getActiveCandidateId();
  const program = await prisma.program.findUnique({ where: { id: programId } });
  if (!program) return;

  await prisma.enrollment.upsert({
    where: { programId_candidateId: { programId, candidateId } },
    update: { status: "completed" },
    create: { programId, candidateId, status: "completed" },
  });
  await prisma.program.update({
    where: { id: programId },
    data: { enrollments: { increment: 1 }, completions: { increment: 1 }, reMatches: { increment: 1 } },
  });

  if (program.gapType === "hard") {
    await prisma.hardSkill.upsert({
      where: { profileId_name: { profileId: candidateId, name: program.closesGap } },
      update: { verified: true },
      create: { profileId: candidateId, name: program.closesGap, verified: true },
    });
    await recalcCompleteness(candidateId);
    await runMatchingForCandidate(candidateId);
  }
  revalidateCandidate();
}
