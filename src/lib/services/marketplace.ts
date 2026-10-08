/**
 * MarketplaceService — programs read from the DB; the aggregate gap-demand
 * analytics stays a static fixture (it's a cross-tenant rollup, not per-row).
 */

import type { GapDemand, Program, ProviderStats } from "../types";
import { prisma } from "../db";
import { GAP_DEMAND, PROVIDER_STATS } from "../fixtures";

export interface MarketplaceService {
  getProgramsForGap(skill: string): Promise<Program[]>;
  /** Trainings that close the candidate's current gaps (across their matches). */
  getRecommendedPrograms(candidateId: string, limit?: number): Promise<Program[]>;
  getProviderPrograms(providerId: string): Promise<Program[]>;
  getGapDemand(): Promise<GapDemand[]>;
  getProviderStats(providerId: string): Promise<ProviderStats>;
}

const programInclude = { provider: { select: { name: true, kind: true } } } as const;

type ProgramRow = {
  id: string;
  providerId: string;
  title: string;
  format: string;
  credential: string | null;
  tags: string;
  closesGap: string;
  gapType: string;
  sponsored: boolean;
  enrollments: number;
  completions: number;
  reMatches: number;
  provider: { name: string; kind: string };
};

function toProgram(r: ProgramRow): Program {
  return {
    id: r.id,
    providerId: r.providerId,
    provider: r.provider.name,
    providerKind: r.provider.kind as Program["providerKind"],
    title: r.title,
    format: r.format,
    credential: r.credential ?? undefined,
    tags: JSON.parse(r.tags) as string[],
    closesGap: r.closesGap,
    gapType: r.gapType as Program["gapType"],
    sponsored: r.sponsored,
    enrollments: r.enrollments,
    completions: r.completions,
    reMatches: r.reMatches,
  };
}

class DbMarketplaceService implements MarketplaceService {
  async getProgramsForGap(skill: string): Promise<Program[]> {
    const rows = await prisma.program.findMany({
      where: { closesGap: skill },
      include: programInclude,
      orderBy: [{ sponsored: "desc" }, { reMatches: "desc" }],
    });
    return rows.map(toProgram);
  }

  /**
   * Programs relevant to THIS candidate — never a generic catalogue. Relevance
   * is, in priority order: (1) closes a gap from one of their matches;
   * (2) closes a gap that roles in their industry commonly require (the skills
   * those openings ask for that the candidate doesn't yet have). If neither
   * applies, we return nothing rather than something irrelevant.
   */
  async getRecommendedPrograms(candidateId: string, limit = 3): Promise<Program[]> {
    const profile = await prisma.candidateProfile.findUnique({
      where: { id: candidateId },
      select: { industry: true, hardSkills: { select: { name: true } } },
    });
    if (!profile) return [];
    const have = new Set(profile.hardSkills.map((s) => s.name.toLowerCase()));

    // (1) gaps from the candidate's own matches
    const matches = await prisma.match.findMany({ where: { candidateId }, select: { gaps: true } });
    const gapSkills = new Set<string>();
    for (const m of matches) {
      for (const g of JSON.parse(m.gaps) as { skill: string }[]) gapSkills.add(g.skill);
    }

    // (2) skills demanded by roles in the candidate's industry that they lack
    const industryNeeds = new Set<string>();
    if (profile.industry && profile.industry !== "General") {
      const openings = await prisma.opening.findMany({
        where: { industry: profile.industry },
        select: { requiredHard: true },
      });
      for (const o of openings) {
        for (const s of JSON.parse(o.requiredHard) as string[]) {
          if (!have.has(s.toLowerCase())) industryNeeds.add(s);
        }
      }
    }

    const relevant = [...new Set([...gapSkills, ...industryNeeds])];
    if (relevant.length === 0) return [];

    const rows = await prisma.program.findMany({
      where: { closesGap: { in: relevant } },
      include: programInclude,
      orderBy: [{ sponsored: "desc" }, { reMatches: "desc" }],
      take: limit * 3,
    });
    // Rank: own-match gaps first, then industry needs; keep marketplace order within each.
    const ranked = rows
      .map((r) => ({ r, tier: gapSkills.has(r.closesGap) ? 0 : 1 }))
      .sort((a, b) => a.tier - b.tier)
      .map((x) => x.r);
    return ranked.slice(0, limit).map(toProgram);
  }

  async getProviderPrograms(providerId: string): Promise<Program[]> {
    const rows = await prisma.program.findMany({ where: { providerId }, include: programInclude });
    return rows.map(toProgram);
  }

  async getGapDemand(): Promise<GapDemand[]> {
    return [...GAP_DEMAND].sort((a, b) => b.candidatesWithGap - a.candidatesWithGap);
  }

  async getProviderStats(providerId: string): Promise<ProviderStats> {
    const programs = await prisma.program.findMany({
      where: { providerId },
      select: { enrollments: true, completions: true, reMatches: true },
    });
    return {
      activePrograms: programs.length,
      learnersEnrolled: programs.reduce((n, p) => n + p.enrollments, 0),
      gapsClosed: programs.reduce((n, p) => n + p.completions, 0),
      reMatchesGenerated: programs.reduce((n, p) => n + p.reMatches, 0),
      revenue: PROVIDER_STATS.revenue,
      currency: PROVIDER_STATS.currency,
    };
  }
}

export const marketplaceService: MarketplaceService = new DbMarketplaceService();
