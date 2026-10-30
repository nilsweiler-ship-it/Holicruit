/**
 * MarketplaceService — programs, provider stats and the aggregate gap-demand
 * rollup, all read from the DB (no fixture numbers reach real users).
 */

import type { GapDemand, Program, ProviderStats } from "../types";
import { prisma } from "../db";
import { aggregateGapDemand } from "../integrity/gap-demand";

/** Currency for provider earnings. There's no payout ledger yet, so earnings are 0. */
const PROVIDER_CURRENCY = "€";

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

  /**
   * Gaps carried by real, claimed candidates in open (non-closed) matches,
   * k-anonymized (see integrity/gap-demand.ts). Empty on a fresh install.
   */
  async getGapDemand(): Promise<GapDemand[]> {
    const [matches, programs] = await Promise.all([
      prisma.match.findMany({
        where: { stage: { not: "closed" }, candidate: { claimed: true } },
        select: { candidateId: true, openingId: true, gaps: true, opening: { select: { industry: true } } },
      }),
      prisma.program.findMany({ select: { closesGap: true } }),
    ]);
    const programsByGap = new Map<string, number>();
    for (const p of programs) {
      const k = p.closesGap.trim().toLowerCase();
      programsByGap.set(k, (programsByGap.get(k) ?? 0) + 1);
    }
    return aggregateGapDemand(
      matches.map((m) => ({ candidateId: m.candidateId, openingId: m.openingId, gaps: m.gaps, industry: m.opening.industry })),
      programsByGap,
    );
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
      // No payout ledger exists yet: report 0 rather than a fixture figure.
      revenue: 0,
      currency: PROVIDER_CURRENCY,
    };
  }
}

export const marketplaceService: MarketplaceService = new DbMarketplaceService();
