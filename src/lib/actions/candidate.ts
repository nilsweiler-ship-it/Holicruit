"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getActiveCandidateId, getCurrentUser } from "@/lib/persona";
import { scenarioService } from "@/lib/services/scenario";
import { jobAdParser } from "@/lib/services/ingest";
import { runMatchingForCandidate } from "@/lib/matching/engine";
import { itemsForSkill, scoreSkillCheck, SKILL_CHECK_PASS, type SkillCheckItem } from "@/lib/fixtures/skill-checks";
import type { ScenarioResult } from "@/lib/scenario/types";
import { AccessDenied, assertHat } from "@/lib/access";
import { personIdentity } from "@/lib/identity";
import {
  appBaseUrl,
  ENDORSEMENT_RELATIONSHIPS,
  ENDORSEMENTS_TO_VERIFY,
  endorsementId,
  endorsementPath,
  endorsementSecret,
  issueEndorsementToken,
  verifyEndorsementToken,
} from "@/lib/integrity/endorsement";
import {
  nextAttemptAt,
  roleQuizFor,
  SCENARIO_COOLDOWN_MS,
  SKILL_CHECK_ATTEMPT_PREFIX,
  SKILL_CHECK_COOLDOWN_MS,
  skillCheckAttemptNeedle,
  skillCheckAttemptScores,
  validateSkillCheckAnswers,
} from "@/lib/integrity/assessment-attempts";
import { scoreScenario, validateScenarioAnswers } from "@/lib/integrity/scenario-scoring";

/**
 * A role's custom assessment items — only for a role the candidate is matched
 * to, and only for a skill that role requires. Throws AccessDenied when the
 * candidate isn't matched to `openingId`.
 */
async function roleQuizItems(candidateId: string, openingId: string, skill: string): Promise<SkillCheckItem[] | null> {
  const m = await prisma.match.findUnique({
    where: { candidateId_openingId: { candidateId, openingId } },
    select: { opening: { select: { quiz: true, requiredHard: true } } },
  });
  if (!m) throw new AccessDenied();
  return roleQuizFor(m.opening, skill);
}

function isUniqueViolation(e: unknown): boolean {
  return typeof e === "object" && e !== null && (e as { code?: unknown }).code === "P2002";
}

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

export type ScenarioSubmitResult =
  | { ok: true; result: ScenarioResult }
  | { ok: false; error: string; retryAt?: string };

/**
 * Persist scenario answers → soft-skill scores, mark complete, re-run matching.
 * Rejects (nothing written) unless every question has a valid option id; one
 * run per SCENARIO_COOLDOWN_MS, tracked as a ScenarioResult row. Option
 * loadings live only on the server — the client sends option ids.
 */
export async function submitScenario(answers: unknown): Promise<ScenarioSubmitResult> {
  await assertHat("candidate");
  const candidateId = await getActiveCandidateId();
  const questions = await scenarioService.getQuestions();
  const valid = validateScenarioAnswers(questions, answers);
  if (!valid.ok) return { ok: false, error: valid.error };

  const last = await prisma.scenarioResult.findFirst({
    where: { profileId: candidateId, NOT: { scores: { contains: SKILL_CHECK_ATTEMPT_PREFIX } } },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  const retry = nextAttemptAt(last?.createdAt, SCENARIO_COOLDOWN_MS);
  if (retry) {
    return { ok: false, error: "You've taken the scenario recently. You can retake it after the cooldown.", retryAt: retry.toISOString() };
  }

  const result = scoreScenario(questions, valid.answers);
  await prisma.scenarioResult.create({
    data: { profileId: candidateId, scores: JSON.stringify(result.scores) },
  });
  for (const s of result.scores) {
    await prisma.softSkillScore.upsert({
      where: { profileId_name: { profileId: candidateId, name: s.name } },
      update: { level: s.level },
      create: { profileId: candidateId, name: s.name, level: s.level },
    });
  }
  const traitProfile = JSON.stringify(
    Object.fromEntries(result.traits.map((t) => [t.name, t.level])),
  );
  await prisma.candidateProfile.update({
    where: { id: candidateId },
    data: { scenarioCompleted: true, traitProfile },
  });
  await recalcCompleteness(candidateId);
  await runMatchingForCandidate(candidateId);
  revalidateCandidate();
  return { ok: true, result };
}

/**
 * Parse step of import: translate pasted text (a CV, a job description, a
 * profile) into the structured skill model. Returns the extracted skills for
 * the candidate to review before anything is saved.
 */
export async function parseProfileText(text: string): Promise<{ skills: string[]; industry: string }> {
  await getActiveCandidateId();
  const clean = z.string().max(200_000).parse(text);
  const parsed = await jobAdParser.parseCv(clean);
  return { skills: parsed.hardSkills, industry: parsed.industry };
}

/**
 * PDF variant of the parse step: extract the text server-side (unpdf, no
 * upload stored anywhere) and run it through the same parser. 5 MB cap.
 */
export async function parseProfilePdf(
  formData: FormData,
): Promise<{ skills: string[]; industry: string; text: string } | { error: string }> {
  await getActiveCandidateId();
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Please choose a PDF file." };
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return { error: "Only PDF files are supported. Paste the text instead if your CV is in another format." };
  }
  if (file.size > 5 * 1024 * 1024) return { error: "That PDF is over 5 MB. Please use a smaller file." };

  const { extractText } = await import("unpdf");
  const buf = new Uint8Array(await file.arrayBuffer());
  const { text } = await extractText(buf, { mergePages: true });
  const clean = (Array.isArray(text) ? text.join("\n") : text).trim();
  if (clean.length < 40) {
    return { error: "We couldn't read text from that PDF (it may be a scanned image). Paste the text instead." };
  }
  const parsed = await jobAdParser.parseCv(clean);
  return { skills: parsed.hardSkills, industry: parsed.industry, text: clean };
}

/** Confirm step of import: add the reviewed skills and re-run matching. */
export async function addImportedSkills(rawNames: string[], rawIndustry?: string): Promise<void> {
  const candidateId = await getActiveCandidateId();
  const names = z.array(z.string().max(80)).max(200).parse(rawNames);
  const industry = z.string().max(80).optional().parse(rawIndustry);
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

/** Save an uploaded profile photo (data URL, resized client-side). */
export async function updateAvatar(dataUrl: string): Promise<void> {
  const candidateId = await getActiveCandidateId();
  // Accept only reasonably-sized raster image data URLs (no SVG).
  if (typeof dataUrl !== "string" || dataUrl.length > 600_000) return;
  if (!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(dataUrl)) return;
  await prisma.candidateProfile.update({
    where: { id: candidateId },
    data: { avatarUrl: dataUrl },
  });
  revalidateCandidate();
}

export type SkillCheckSubmitResult =
  | { ok: true; score: number; passed: boolean }
  | { ok: false; error: string; retryAt?: string };

const skillCheckInput = z.object({
  skill: z.string().trim().min(1).max(80),
  openingId: z.string().min(1).max(64).optional(),
});

/**
 * Take an applied skill check. Scores the answers server-side by option id
 * (the browser never receives option scores), records the attempt, verifies
 * the skill if passed, and re-runs matching.
 *  • One attempt per skill per SKILL_CHECK_COOLDOWN_MS (24 h), tracked as a
 *    timestamped ScenarioResult row; a concurrent double-submit keeps only the
 *    first row.
 *  • `openingId` is honoured only for a role the candidate is matched to, and
 *    only for a skill that role requires (else the universal bank is used).
 *  • Every served item must be answered with one of its own option ids.
 *  • A failed attempt never removes verification the skill already has.
 */
export async function submitSkillCheck(
  skill: unknown,
  answers: unknown,
  openingId?: unknown,
): Promise<SkillCheckSubmitResult> {
  await assertHat("candidate");
  const candidateId = await getActiveCandidateId();
  const input = skillCheckInput.safeParse({ skill, openingId: openingId || undefined });
  if (!input.success) return { ok: false, error: "That skill check isn't valid." };
  const clean = input.data.skill;

  // Score against the same items the candidate saw.
  const items =
    (input.data.openingId ? await roleQuizItems(candidateId, input.data.openingId, clean) : null) ??
    itemsForSkill(clean);
  const valid = validateSkillCheckAnswers(items, answers);
  if (!valid.ok) return { ok: false, error: valid.error };

  const windowStart = new Date(Date.now() - SKILL_CHECK_COOLDOWN_MS);
  const attemptsInWindow = {
    profileId: candidateId,
    createdAt: { gte: windowStart },
    scores: { contains: skillCheckAttemptNeedle(clean) },
  };
  const cooldownError = (at: Date): SkillCheckSubmitResult => ({
    ok: false,
    error: `You've already taken the ${clean} check in the last 24 hours.`,
    retryAt: new Date(at.getTime() + SKILL_CHECK_COOLDOWN_MS).toISOString(),
  });
  const recent = await prisma.scenarioResult.findFirst({
    where: attemptsInWindow,
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  if (recent) return cooldownError(recent.createdAt);

  const score = scoreSkillCheck(items, valid.answers);
  const passed = score >= SKILL_CHECK_PASS;

  // Record the attempt, then make sure it's the only one in the window (two
  // parallel submits both pass the check above; the earliest row wins).
  const attempt = await prisma.scenarioResult.create({
    data: { profileId: candidateId, scores: skillCheckAttemptScores(clean, score) },
    select: { id: true, createdAt: true },
  });
  const first = await prisma.scenarioResult.findFirst({
    where: attemptsInWindow,
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: { id: true, createdAt: true },
  });
  if (first && first.id !== attempt.id) {
    await prisma.scenarioResult.delete({ where: { id: attempt.id } });
    return cooldownError(first.createdAt);
  }

  await prisma.hardSkill.upsert({
    where: { profileId_name: { profileId: candidateId, name: clean } },
    update: passed ? { assessedScore: score, verified: true } : { assessedScore: score },
    create: { profileId: candidateId, name: clean, assessedScore: score, verified: passed },
  });
  await recalcCompleteness(candidateId);
  await runMatchingForCandidate(candidateId);
  revalidateCandidate();
  return { ok: true, score, passed };
}

/** Add a self-declared (unverified) hard skill. */
export async function addSkill(name: string): Promise<void> {
  const candidateId = await getActiveCandidateId();
  const clean = z.string().max(80).parse(name).trim();
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

export type EndorsementLinkResult =
  | { ok: true; url: string; expiresAt: string }
  | { ok: false; error: string };

/**
 * Mint a signed endorsement link for one of the candidate's own skills. The
 * token binds candidate + skill + 30-day expiry (HMAC under AUTH_SECRET), so a
 * peer's endorsement lands on the right profile and nobody can forge one for
 * another candidate. The domain comes from NEXT_PUBLIC_APP_URL; when unset the
 * path is returned and the client prefixes its own origin.
 */
export async function requestEndorsementLink(skill: unknown): Promise<EndorsementLinkResult> {
  await assertHat("candidate");
  const candidateId = await getActiveCandidateId();
  const name = z.string().trim().min(1).max(80).safeParse(skill);
  if (!name.success) return { ok: false, error: "Unknown skill." };
  const hs = await prisma.hardSkill.findUnique({
    where: { profileId_name: { profileId: candidateId, name: name.data } },
    select: { name: true },
  });
  if (!hs) return { ok: false, error: "Add this skill to your profile first." };
  const { token, exp } = issueEndorsementToken(candidateId, hs.name, endorsementSecret());
  const path = endorsementPath(hs.name, token);
  const base = appBaseUrl();
  return { ok: true, url: base ? `${base}${path}` : path, expiresAt: new Date(exp).toISOString() };
}

export type EndorseResult =
  | { ok: true; verified: boolean }
  | { ok: false; code: "login" | "invalid" | "self" | "duplicate" | "gone"; error: string };

const endorseInput = z.object({
  token: z.string().min(1).max(2048),
  relationship: z.enum(ENDORSEMENT_RELATIONSHIPS),
});

/**
 * Record a peer endorsement from a signed link. Requirements, in order:
 * a valid, unexpired token; a logged-in endorser (any account); the endorser
 * is not the candidate; one endorsement per endorser per skill (enforced by a
 * deterministic primary key). The skill turns verified once it has
 * ENDORSEMENTS_TO_VERIFY endorsements. Re-runs the candidate's matching.
 */
export async function giveEndorsement(input: unknown): Promise<EndorseResult> {
  const parsed = endorseInput.safeParse(input);
  if (!parsed.success) return { ok: false, code: "invalid", error: "Please choose how you know them." };
  const user = await getCurrentUser();
  if (!user) return { ok: false, code: "login", error: "Sign in to endorse." };

  const claim = verifyEndorsementToken(parsed.data.token, endorsementSecret());
  if (!claim) return { ok: false, code: "invalid", error: "This endorsement link is invalid or has expired." };

  const profile = await prisma.candidateProfile.findUnique({
    where: { id: claim.candidateId },
    select: {
      id: true,
      userId: true,
      hardSkills: { where: { name: claim.skill }, select: { name: true } },
    },
  });
  const skillRow = profile?.hardSkills[0];
  if (!profile || !skillRow) {
    return { ok: false, code: "gone", error: "This skill is no longer on their profile." };
  }
  if (profile.userId === user.id) {
    return { ok: false, code: "self", error: "You can't endorse your own skills — share the link with a peer." };
  }

  const id = endorsementId(user.id, profile.id, skillRow.name);
  if (await prisma.endorsement.findUnique({ where: { id }, select: { id: true } })) {
    return { ok: false, code: "duplicate", error: "You've already endorsed this skill." };
  }
  const endorser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, initials: true, alias: true, anonymous: true, candidate: { select: { headline: true } } },
  });
  const ident = personIdentity(endorser ?? { name: user.name, initials: user.initials }, false);
  try {
    await prisma.endorsement.create({
      data: {
        id,
        profileId: profile.id,
        skill: skillRow.name,
        endorserName: ident.name,
        endorserInitials: ident.initials || initialsOf(ident.name),
        endorserHeadline: (!ident.masked && endorser?.candidate?.headline?.trim()) || "Holicruit member",
        relationship: parsed.data.relationship,
      },
    });
  } catch (e) {
    if (isUniqueViolation(e)) return { ok: false, code: "duplicate", error: "You've already endorsed this skill." };
    throw e;
  }

  const count = await prisma.endorsement.count({ where: { profileId: profile.id, skill: skillRow.name } });
  const verified = count >= ENDORSEMENTS_TO_VERIFY;
  if (verified) {
    await prisma.hardSkill.update({
      where: { profileId_name: { profileId: profile.id, name: skillRow.name } },
      data: { verified: true },
    });
  }
  await recalcCompleteness(profile.id);
  await runMatchingForCandidate(profile.id);
  revalidateCandidate();
  return { ok: true, verified };
}

export type EnrollResult = { ok: true; alreadyEnrolled: boolean } | { ok: false; error: string };

/**
 * Enroll in a program: records status "enrolled", once per candidate per
 * program (the unique constraint makes repeat clicks no-ops, so the program's
 * enrollment counter increments exactly once). Enrolling never verifies a
 * skill, raises a soft score, or counts as a completion — that requires
 * provider-confirmed completion or other evidence.
 */
export async function enroll(programId: unknown): Promise<EnrollResult> {
  await assertHat("candidate");
  const candidateId = await getActiveCandidateId();
  const id = z.string().min(1).max(64).safeParse(programId);
  if (!id.success) return { ok: false, error: "Unknown program." };
  const program = await prisma.program.findUnique({ where: { id: id.data }, select: { id: true } });
  if (!program) return { ok: false, error: "Unknown program." };

  try {
    await prisma.enrollment.create({
      data: { programId: program.id, candidateId, status: "enrolled" },
    });
  } catch (e) {
    if (isUniqueViolation(e)) return { ok: true, alreadyEnrolled: true };
    throw e;
  }
  await prisma.program.update({
    where: { id: program.id },
    data: { enrollments: { increment: 1 } },
  });
  revalidateCandidate();
  return { ok: true, alreadyEnrolled: false };
}
