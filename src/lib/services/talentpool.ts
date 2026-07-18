/**
 * Talent-pool service — the "silver medalist" re-engagement layer.
 *
 * Strong candidates a team passed on don't disappear: they stay in a nurtured
 * pool tied to the gap that cost them the role. When the market shows that gap
 * is closeable (programs with real completions), we flag them "ready to
 * re-match" so the hiring manager can reach back out with a warm, honest invite.
 *
 * This is unique to Holicruit: it's only possible because every rejection
 * produces a structured Growth Report with a named, trackable gap.
 */
import { prisma } from "../db";

export type PoolStatus = "ready" | "nurturing";

export interface PoolCandidate {
  matchId: string;
  candidateId: string;
  name: string;
  initials: string;
  headline: string;
  roleTitle: string;
  company: string;
  hardFit: number;
  softFit: number;
  mutualFit: number;
  /** The one gap that cost them the role. */
  gapSkill: string | null;
  gapType: "hard" | "soft" | null;
  /** Programs in the marketplace that close this gap. */
  programsForGap: number;
  /** Learners who have completed a gap-closing program (market signal). */
  completionsForGap: number;
  status: PoolStatus;
  saved: boolean;
}

export interface TalentPoolSummary {
  total: number;
  ready: number;
  saved: number;
  candidates: PoolCandidate[];
}

/**
 * All strong-but-not-selected candidates across the roles this HM owns, ranked
 * by re-match readiness then mutual fit.
 */
export async function getTalentPool(userId: string): Promise<TalentPoolSummary> {
  const rows = await prisma.match.findMany({
    where: { stage: "closed", opening: { company: { ownerId: userId } } },
    include: {
      candidate: { include: { user: { select: { name: true, initials: true } } } },
      opening: { include: { company: { select: { name: true } } } },
      growthReport: true,
    },
    orderBy: { mutualFit: "desc" },
  });

  // Aggregate marketplace signal per gap skill (programs + total completions).
  const gapSkills = Array.from(
    new Set(rows.map((r) => r.growthReport?.primaryGapSkill).filter(Boolean) as string[]),
  );
  const programsByGap = new Map<string, { programs: number; completions: number }>();
  for (const skill of gapSkills) {
    const programs = await prisma.program.findMany({
      where: { closesGap: skill },
      select: { completions: true },
    });
    programsByGap.set(skill, {
      programs: programs.length,
      completions: programs.reduce((s, p) => s + p.completions, 0),
    });
  }

  const candidates: PoolCandidate[] = rows.map((r) => {
    const gapSkill = r.growthReport?.primaryGapSkill ?? null;
    const sig = gapSkill ? programsByGap.get(gapSkill) : undefined;
    const programsForGap = sig?.programs ?? 0;
    const completionsForGap = sig?.completions ?? 0;
    // "Ready to re-match" when the market proves the gap is closeable: at least
    // one program exists AND learners have completed it.
    const status: PoolStatus =
      programsForGap > 0 && completionsForGap > 0 ? "ready" : "nurturing";
    return {
      matchId: r.id,
      candidateId: r.candidate.id,
      name: r.candidate.user.name,
      initials: r.candidate.user.initials,
      headline: r.candidate.headline,
      roleTitle: r.opening.title,
      company: r.opening.company.name,
      hardFit: r.hardFit,
      softFit: r.softFit,
      mutualFit: r.mutualFit,
      gapSkill,
      gapType: (r.growthReport?.primaryGapType as "hard" | "soft" | undefined) ?? null,
      programsForGap,
      completionsForGap,
      status,
      saved: r.saved,
    };
  });

  candidates.sort((a, b) => {
    if (a.status !== b.status) return a.status === "ready" ? -1 : 1;
    return b.mutualFit - a.mutualFit;
  });

  return {
    total: candidates.length,
    ready: candidates.filter((c) => c.status === "ready").length,
    saved: candidates.filter((c) => c.saved).length,
    candidates,
  };
}
