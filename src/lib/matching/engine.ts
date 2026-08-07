/**
 * The matching engine — deterministic, server-side fit computation. Given a
 * candidate's skills and a role's required bars, it produces the fit object
 * (hard/soft/mutual + gaps + verified). Re-run whenever a profile changes — the
 * transparency flywheel: close a gap → re-match.
 */
import type { FitObject, SkillGap } from "../fit/types";
import { prisma } from "../db";

const SOFT_BAR = 75; // default role soft-skill bar
const DEFAULT_HARD_W = 55; // default hard weight (0–100) when a role isn't calibrated
const DEFAULT_SOFT_W = 45;

/** Per-skill importance → numeric weight and default gap severity. */
const LEVEL_W: Record<string, number> = { essential: 3, important: 2, bonus: 1 };

/** Parse an opening's skillWeights JSON safely into a skill→level map. */
function parseWeights(json: string | null | undefined): Record<string, string> {
  if (!json) return {};
  try {
    return JSON.parse(json) as Record<string, string>;
  } catch {
    return {};
  }
}

interface ComputeInput {
  hardSkills: { name: string; verified: boolean }[];
  softSkills: { name: string; level: number }[];
  requiredHard: string[];
  requiredSoft: string[];
  /** Custom role calibration (0–100). Falls back to the platform default. */
  hardWeight?: number | null;
  softWeight?: number | null;
  /** Per-skill importance map: skill name → "essential" | "important" | "bonus". */
  skillWeights?: Record<string, string> | null;
}

export function computeFit(input: ComputeInput): FitObject {
  const have = new Map(input.hardSkills.map((s) => [s.name.toLowerCase(), s]));
  const gaps: SkillGap[] = [];

  // Look up a skill's importance weight (case-insensitive); default "important".
  const wmap = new Map<string, number>();
  if (input.skillWeights) {
    for (const [k, v] of Object.entries(input.skillWeights)) {
      wmap.set(k.toLowerCase(), LEVEL_W[v] ?? 2);
    }
  }
  const wOf = (skill: string) => wmap.get(skill.toLowerCase()) ?? 2;
  const sevOf = (skill: string): SkillGap["severity"] => {
    const w = wOf(skill);
    return w >= 3 ? "major" : w >= 2 ? "moderate" : "minor";
  };

  let hardScore = 0;
  let hardWtot = 0;
  for (const req of input.requiredHard) {
    const w = wOf(req);
    hardWtot += w;
    const s = have.get(req.toLowerCase());
    hardScore += w * (s?.verified ? 1 : s ? 0.7 : 0);
    if (!s) gaps.push({ skill: req, type: "hard", severity: sevOf(req) });
  }
  const hardFit = hardWtot ? Math.round((100 * hardScore) / hardWtot) : 70;

  const softMap = new Map(input.softSkills.map((s) => [s.name.toLowerCase(), s.level]));
  const relevant = input.requiredSoft.length
    ? input.requiredSoft
    : input.softSkills.map((s) => s.name);
  let softSum = 0;
  let softWtot = 0;
  for (const req of relevant) {
    const w = wOf(req);
    const lvl = softMap.get(req.toLowerCase());
    if (lvl != null) {
      softSum += w * lvl;
      softWtot += w;
      if (lvl < SOFT_BAR) {
        gaps.push({ skill: req, type: "soft", severity: lvl < SOFT_BAR - 15 ? "moderate" : "minor" });
      }
    } else {
      gaps.push({ skill: req, type: "soft", severity: sevOf(req) });
    }
  }
  const softFit = softWtot ? Math.round(softSum / softWtot) : 60;

  // Calibration: weight hard vs. soft by the role's configured balance.
  const hw = input.hardWeight ?? DEFAULT_HARD_W;
  const sw = input.softWeight ?? DEFAULT_SOFT_W;
  const totalW = hw + sw > 0 ? hw + sw : 100;
  const mutualFit = Math.round((hw * hardFit + sw * softFit) / totalW);

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
      hardWeight: m.opening.hardWeight,
      softWeight: m.opening.softWeight,
      skillWeights: parseWeights(m.opening.skillWeights),
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
  opening: {
    requiredHard: string;
    requiredSoft: string;
    hardWeight?: number | null;
    softWeight?: number | null;
    skillWeights?: string | null;
  },
) {
  return computeFit({
    hardSkills: profile.hardSkills,
    softSkills: profile.softSkills,
    requiredHard: JSON.parse(opening.requiredHard) as string[],
    requiredSoft: JSON.parse(opening.requiredSoft) as string[],
    hardWeight: opening.hardWeight,
    softWeight: opening.softWeight,
    skillWeights: parseWeights(opening.skillWeights),
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
  // Calibration: the role's pass bar decides who clears into the pipeline.
  // Priority roles (Scale) cast a wider net by lowering that bar.
  const base = opening.passBar ?? MATCH_THRESHOLD;
  const threshold = opening.priority ? Math.min(base, PRIORITY_THRESHOLD) : base;
  // Only claimed candidates enter the open marketplace. Imported/unclaimed
  // profiles are private to the HM who imported them (matched explicitly there).
  const profiles = await prisma.candidateProfile.findMany({
    where: { claimed: true },
    include: { hardSkills: true, softSkills: true },
  });
  for (const p of profiles) {
    await upsertMatch(p.id, openingId, fitFor(p, opening), threshold);
  }
  await rankOpening(openingId);
}
