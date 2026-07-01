/**
 * The matching engine — deterministic, server-side fit computation. Given a
 * candidate's skills and a role's required bars, it produces the fit object
 * (hard/soft/mutual + gaps + verified). Re-run whenever a profile changes — the
 * transparency flywheel: close a gap → re-match.
 */
import type { FitObject, SkillGap } from "../fit/types";
import { prisma } from "../db";

const SOFT_BAR = 75; // default role soft-skill bar
const HARD_W = 0.55;
const SOFT_W = 0.45;

interface ComputeInput {
  hardSkills: { name: string; verified: boolean }[];
  softSkills: { name: string; level: number }[];
  requiredHard: string[];
  requiredSoft: string[];
}

export function computeFit(input: ComputeInput): FitObject {
  const have = new Map(input.hardSkills.map((s) => [s.name.toLowerCase(), s]));
  const gaps: SkillGap[] = [];

  let hardScore = 0;
  for (const req of input.requiredHard) {
    const s = have.get(req.toLowerCase());
    if (s?.verified) hardScore += 1;
    else if (s) hardScore += 0.7;
    else gaps.push({ skill: req, type: "hard", severity: "major" });
  }
  const hardFit = input.requiredHard.length
    ? Math.round((100 * hardScore) / input.requiredHard.length)
    : 70;

  const softMap = new Map(input.softSkills.map((s) => [s.name.toLowerCase(), s.level]));
  const relevant = input.requiredSoft.length
    ? input.requiredSoft
    : input.softSkills.map((s) => s.name);
  let softSum = 0;
  let softN = 0;
  for (const req of relevant) {
    const lvl = softMap.get(req.toLowerCase());
    if (lvl != null) {
      softSum += lvl;
      softN += 1;
      if (lvl < SOFT_BAR) {
        gaps.push({ skill: req, type: "soft", severity: lvl < SOFT_BAR - 15 ? "moderate" : "minor" });
      }
    } else {
      gaps.push({ skill: req, type: "soft", severity: "moderate" });
    }
  }
  const softFit = softN ? Math.round(softSum / softN) : 60;
  const mutualFit = Math.round(HARD_W * hardFit + SOFT_W * softFit);

  const presentHard = input.requiredHard.filter((r) => have.has(r.toLowerCase()));
  const verifiedCount = presentHard.filter((r) => have.get(r.toLowerCase())?.verified).length;
  const verified =
    presentHard.length > 0 && verifiedCount >= Math.ceil(input.requiredHard.length / 2);

  return { hardFit, softFit, mutualFit, verified, gaps };
}

/**
 * Recompute every (non-closed) match for a candidate from their current skills,
 * and refresh their rank within each opening's pool. Call after any change to
 * the candidate's skills (scenario, endorsement, added skill, completed program).
 */
export async function recomputeCandidateMatches(candidateId: string): Promise<void> {
  const profile = await prisma.candidateProfile.findUnique({
    where: { id: candidateId },
    include: {
      hardSkills: true,
      softSkills: true,
      matches: { where: { stage: { not: "closed" } }, include: { opening: true } },
    },
  });
  if (!profile) return;

  for (const m of profile.matches) {
    const fit = computeFit({
      hardSkills: profile.hardSkills,
      softSkills: profile.softSkills,
      requiredHard: JSON.parse(m.opening.requiredHard) as string[],
      requiredSoft: JSON.parse(m.opening.requiredSoft) as string[],
    });
    await prisma.match.update({
      where: { id: m.id },
      data: {
        hardFit: fit.hardFit,
        softFit: fit.softFit,
        mutualFit: fit.mutualFit,
        verified: fit.verified,
        gaps: JSON.stringify(fit.gaps),
      },
    });
    await refreshRank(m.openingId, m.id);
  }
}

/** Set candidateRank/poolSize for a match within its opening's pool. */
async function refreshRank(openingId: string, matchId: string): Promise<void> {
  const pool = await prisma.match.findMany({
    where: { openingId },
    select: { id: true, mutualFit: true },
    orderBy: { mutualFit: "desc" },
  });
  const idx = pool.findIndex((p) => p.id === matchId);
  if (idx < 0) return;
  await prisma.match.update({
    where: { id: matchId },
    data: { candidateRank: idx + 1, poolSize: pool.length },
  });
}

/** Rank every match within an opening's pool. */
async function rankOpening(openingId: string): Promise<void> {
  const pool = await prisma.match.findMany({
    where: { openingId },
    select: { id: true },
    orderBy: { mutualFit: "desc" },
  });
  for (let i = 0; i < pool.length; i++) {
    await prisma.match.update({
      where: { id: pool[i]!.id },
      data: { candidateRank: i + 1, poolSize: pool.length },
    });
  }
}

/** A match is created when computed fit clears this bar (otherwise no match). */
export const MATCH_THRESHOLD = 48;
/** Priority roles (Scale plan) cast a wider net. */
export const PRIORITY_THRESHOLD = 40;

function fitFor(
  profile: { hardSkills: { name: string; verified: boolean }[]; softSkills: { name: string; level: number }[] },
  opening: { requiredHard: string; requiredSoft: string },
) {
  return computeFit({
    hardSkills: profile.hardSkills,
    softSkills: profile.softSkills,
    requiredHard: JSON.parse(opening.requiredHard) as string[],
    requiredSoft: JSON.parse(opening.requiredSoft) as string[],
  });
}

async function upsertMatch(
  candidateId: string,
  openingId: string,
  fit: ReturnType<typeof computeFit>,
  threshold = MATCH_THRESHOLD,
) {
  const existing = await prisma.match.findUnique({
    where: { candidateId_openingId: { candidateId, openingId } },
    select: { id: true, stage: true },
  });
  const data = {
    hardFit: fit.hardFit,
    softFit: fit.softFit,
    mutualFit: fit.mutualFit,
    verified: fit.verified,
    gaps: JSON.stringify(fit.gaps),
  };
  if (existing) {
    if (existing.stage !== "closed") await prisma.match.update({ where: { id: existing.id }, data });
  } else if (fit.mutualFit >= threshold) {
    await prisma.match.create({
      data: { candidateId, openingId, ...data, stage: "new", candidateOptIn: true, managerOptIn: true },
    });
  }
}

/**
 * Run matching for one candidate against every open role — creates matches that
 * clear the bar and updates existing ones. This is candidate-side discovery
 * (a fresh candidate gets matched once they've built a profile).
 */
export async function runMatchingForCandidate(candidateId: string): Promise<void> {
  const profile = await prisma.candidateProfile.findUnique({
    where: { id: candidateId },
    include: { hardSkills: true, softSkills: true },
  });
  if (!profile) return;
  const openings = await prisma.opening.findMany();
  const affected = new Set<string>();
  for (const o of openings) {
    await upsertMatch(candidateId, o.id, fitFor(profile, o));
    affected.add(o.id);
  }
  for (const openingId of affected) await rankOpening(openingId);
}

/**
 * Run matching for one opening against every candidate — populates the hiring
 * manager's pipeline when a role is posted.
 */
export async function runMatchingForOpening(openingId: string): Promise<void> {
  const opening = await prisma.opening.findUnique({ where: { id: openingId } });
  if (!opening) return;
  const threshold = opening.priority ? PRIORITY_THRESHOLD : MATCH_THRESHOLD;
  const profiles = await prisma.candidateProfile.findMany({
    include: { hardSkills: true, softSkills: true },
  });
  for (const p of profiles) {
    await upsertMatch(p.id, openingId, fitFor(p, opening), threshold);
  }
  await rankOpening(openingId);
}
