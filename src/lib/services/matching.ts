/**
 * MatchingService — the seam between this UI and matching. Now backed by the
 * database (Prisma) instead of fixtures; the returned shapes are unchanged so
 * the UI is untouched.
 */

import type { FitObject, GrowthReport, SkillGap } from "../fit/types";
import type { Match, PipelineStage } from "../types";
import { prisma } from "../db";
import { GAP_DEMAND } from "../fixtures";

export interface MatchingService {
  getCandidateMatches(candidateId: string): Promise<Match[]>;
  getDailyMatches(candidateId: string): Promise<Match[]>;
  getClosedMatches(candidateId: string): Promise<Match[]>;
  getMatch(matchId: string): Promise<Match | null>;
  getPipeline(openingId: string): Promise<Record<PipelineStage, Match[]>>;
  getGrowthReport(matchId: string): Promise<GrowthReport | null>;
  rolesClearedIfGapClosed(gap: SkillGap): Promise<number>;
}

const matchInclude = {
  candidate: { include: { user: { select: { name: true, initials: true } } } },
  opening: { include: { company: { select: { name: true, location: true } } } },
  thread: { select: { id: true } },
} as const;

type MatchRow = {
  id: string;
  hardFit: number;
  softFit: number;
  mutualFit: number;
  verified: boolean;
  gaps: string;
  candidateRank: number | null;
  poolSize: number | null;
  stage: string;
  saved: boolean;
  candidateOptIn: boolean;
  managerOptIn: boolean;
  candidate: { id: string; headline: string; avatarUrl: string | null; user: { name: string; initials: string } };
  opening: {
    id: string;
    title: string;
    industry: string;
    location: string;
    salaryMin: number | null;
    salaryMax: number | null;
    currency: string;
    hiringManagerName: string;
    hiringManagerHeadline: string;
    hiringManagerInitials: string;
    requiredHard: string;
    requiredSoft: string;
    priority: boolean;
    company: { name: string; location: string };
  };
  thread: { id: string } | null;
};

function toMatch(r: MatchRow): Match {
  const fit: FitObject = {
    hardFit: r.hardFit,
    softFit: r.softFit,
    mutualFit: r.mutualFit,
    verified: r.verified,
    gaps: JSON.parse(r.gaps) as SkillGap[],
    candidateRank: r.candidateRank ?? undefined,
    poolSize: r.poolSize ?? undefined,
  };
  return {
    id: r.id,
    candidate: {
      id: r.candidate.id,
      name: r.candidate.user.name,
      headline: r.candidate.headline,
      initials: r.candidate.user.initials,
      avatarUrl: r.candidate.avatarUrl ?? undefined,
    },
    opening: {
      id: r.opening.id,
      title: r.opening.title,
      industry: r.opening.industry,
      company: { id: "", name: r.opening.company.name, location: r.opening.company.location },
      location: r.opening.location,
      salaryMin: r.opening.salaryMin ?? undefined,
      salaryMax: r.opening.salaryMax ?? undefined,
      currency: r.opening.currency,
      hiringManager: {
        id: "",
        name: r.opening.hiringManagerName,
        headline: r.opening.hiringManagerHeadline,
        initials: r.opening.hiringManagerInitials,
      },
      requiredHard: JSON.parse(r.opening.requiredHard) as string[],
      requiredSoft: JSON.parse(r.opening.requiredSoft) as string[],
      priority: r.opening.priority,
    },
    fit,
    stage: r.stage as PipelineStage,
    contactable: r.candidateOptIn && r.managerOptIn,
    saved: r.saved,
    hasThread: Boolean(r.thread),
  };
}

class DbMatchingService implements MatchingService {
  async getCandidateMatches(candidateId: string): Promise<Match[]> {
    const rows = await prisma.match.findMany({
      where: { candidateId, stage: { not: "closed" } },
      include: matchInclude,
      orderBy: { mutualFit: "desc" },
    });
    return rows.map(toMatch);
  }

  async getDailyMatches(candidateId: string): Promise<Match[]> {
    const rows = await prisma.match.findMany({
      where: { candidateId, stage: { not: "closed" } },
      include: matchInclude,
      orderBy: { mutualFit: "desc" },
      take: 3,
    });
    return rows.map(toMatch);
  }

  async getClosedMatches(candidateId: string): Promise<Match[]> {
    const rows = await prisma.match.findMany({
      where: { candidateId, stage: "closed" },
      include: matchInclude,
      orderBy: { mutualFit: "desc" },
    });
    return rows.map(toMatch);
  }

  async getMatch(matchId: string): Promise<Match | null> {
    const row = await prisma.match.findUnique({ where: { id: matchId }, include: matchInclude });
    return row ? toMatch(row) : null;
  }

  async getPipeline(openingId: string): Promise<Record<PipelineStage, Match[]>> {
    const rows = await prisma.match.findMany({
      where: { openingId },
      include: matchInclude,
      orderBy: { mutualFit: "desc" },
    });
    const grouped: Record<PipelineStage, Match[]> = { new: [], talking: [], offer: [], closed: [] };
    for (const r of rows) grouped[r.stage as PipelineStage]?.push(toMatch(r));
    return grouped;
  }

  async getGrowthReport(matchId: string): Promise<GrowthReport | null> {
    const r = await prisma.growthReport.findUnique({ where: { matchId } });
    if (!r) return null;
    return {
      id: r.id,
      matchId: r.matchId,
      roleTitle: r.roleTitle,
      company: r.company,
      hard: {
        type: "hard",
        comparison: { label: "Hard skills", you: r.hardYou, roleBar: r.hardBar },
        gap: { skill: r.primaryGapSkill, type: r.primaryGapType as "hard" | "soft", severity: "moderate" },
        note: `Gap: ${r.primaryGapSkill}`,
      },
      soft: {
        type: "soft",
        comparison: { label: "Soft skills", you: r.softYou, roleBar: r.softBar },
        aboveBar: r.softYou >= r.softBar,
        note: "Above bar — a strength",
      },
      primaryGap: { skill: r.primaryGapSkill, type: r.primaryGapType as "hard" | "soft", severity: "moderate" },
      rolesClearedIfClosed: r.rolesClearedIfClosed,
      matchingProgramCount: r.matchingProgramCount,
    };
  }

  async rolesClearedIfGapClosed(gap: SkillGap): Promise<number> {
    const r = await prisma.growthReport.findFirst({ where: { primaryGapSkill: gap.skill } });
    if (r) return r.rolesClearedIfClosed;
    return prisma.program.count({ where: { closesGap: gap.skill } });
  }
}

// GAP_DEMAND stays a static analytics fixture (aggregate, not per-row).
export { GAP_DEMAND };

export const matchingService: MatchingService = new DbMatchingService();
