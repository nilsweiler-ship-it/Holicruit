/**
 * MatchingService — the seam between this UI and matching. Now backed by the
 * database (Prisma) instead of fixtures; the returned shapes are unchanged so
 * the UI is untouched.
 */

import type { FitObject, GrowthReport, SkillGap } from "../fit/types";
import type { Match, PipelineStage } from "../types";
import { prisma } from "../db";
import { GAP_DEMAND } from "../fixtures";
import { personIdentity, employerIdentity } from "../identity";
import { computeTermsFit, parseModes, type TermsView } from "../terms";

/** Who is looking at a match — decides which side's identity may be masked. */
export type Viewer = "candidate" | "employer";

export interface MatchingService {
  getCandidateMatches(candidateId: string): Promise<Match[]>;
  getDailyMatches(candidateId: string): Promise<Match[]>;
  getClosedMatches(candidateId: string): Promise<Match[]>;
  getMatch(matchId: string, viewer?: Viewer): Promise<Match | null>;
  getPipeline(openingId: string): Promise<Record<PipelineStage, Match[]>>;
  getGrowthReport(matchId: string): Promise<GrowthReport | null>;
  rolesClearedIfGapClosed(gap: SkillGap): Promise<number>;
}

const matchInclude = {
  candidate: {
    include: {
      user: { select: { name: true, initials: true, alias: true, anonymous: true } },
    },
  },
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
  candidateRevealed: boolean;
  employerRevealed: boolean;
  candidateSharesTerms: boolean;
  employerSharesTerms: boolean;
  candidate: {
    id: string;
    headline: string;
    avatarUrl: string | null;
    claimed: boolean;
    expectedSalaryMin: number | null;
    expectedSalaryMax: number | null;
    salaryCurrency: string | null;
    workModes: string;
    locationPref: string | null;
    user: { name: string; initials: string; alias: string | null; anonymous: boolean };
  };
  opening: {
    id: string;
    title: string;
    industry: string;
    location: string;
    salaryMin: number | null;
    salaryMax: number | null;
    currency: string;
    workMode: string;
    hiringManagerName: string;
    hiringManagerHeadline: string;
    hiringManagerInitials: string;
    companyConfidential: boolean;
    hmAnonymous: boolean;
    companyAlias: string | null;
    hiringManagerAlias: string | null;
    requiredHard: string;
    requiredSoft: string;
    priority: boolean;
    company: { name: string; location: string };
  };
  thread: { id: string } | null;
};

function toMatch(r: MatchRow, viewer: Viewer): Match {
  // Each side always sees its own real identity; the other side is masked until
  // that person explicitly reveals for this match.
  const cand = personIdentity(r.candidate.user, viewer === "candidate" || r.candidateRevealed);
  const emp = employerIdentity(
    {
      companyName: r.opening.company.name,
      companyConfidential: r.opening.companyConfidential,
      companyAlias: r.opening.companyAlias,
      hmName: r.opening.hiringManagerName,
      hmInitials: r.opening.hiringManagerInitials,
      hmHeadline: r.opening.hiringManagerHeadline,
      hmAnonymous: r.opening.hmAnonymous,
      hmAlias: r.opening.hiringManagerAlias,
    },
    viewer === "employer" || r.employerRevealed,
  );

  // Terms fit — compatibility always; raw figures only when both sides share.
  const candidateModes = parseModes(r.candidate.workModes);
  const compat = computeTermsFit({
    expMin: r.candidate.expectedSalaryMin,
    roleMax: r.opening.salaryMax,
    candidateModes,
    roleMode: r.opening.workMode,
  });
  const termsRevealed = r.candidateSharesTerms && r.employerSharesTerms;
  const terms: TermsView = {
    ...compat,
    revealed: termsRevealed,
    youShared: viewer === "candidate" ? r.candidateSharesTerms : r.employerSharesTerms,
    theyShared: viewer === "candidate" ? r.employerSharesTerms : r.candidateSharesTerms,
    roleMode: r.opening.workMode,
    candidateModes,
    roleRegion: r.opening.location,
    candidateRegion: r.candidate.locationPref ?? undefined,
    ...(termsRevealed
      ? {
          candidateRange: {
            min: r.candidate.expectedSalaryMin ?? undefined,
            max: r.candidate.expectedSalaryMax ?? undefined,
            currency: r.candidate.salaryCurrency ?? "€",
          },
          roleBand: {
            min: r.opening.salaryMin ?? undefined,
            max: r.opening.salaryMax ?? undefined,
            currency: r.opening.currency,
          },
        }
      : {}),
  };
  // The role's raw pay stays private to candidates unless terms are shared.
  const showRoleSalary = viewer === "employer" || termsRevealed;
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
      name: cand.name,
      headline: r.candidate.headline,
      initials: cand.initials,
      // Hide the photo while the candidate is masked to this viewer.
      avatarUrl: cand.masked ? undefined : r.candidate.avatarUrl ?? undefined,
    },
    opening: {
      id: r.opening.id,
      title: r.opening.title,
      industry: r.opening.industry,
      company: { id: "", name: emp.companyName, location: r.opening.company.location },
      location: r.opening.location,
      salaryMin: showRoleSalary ? r.opening.salaryMin ?? undefined : undefined,
      salaryMax: showRoleSalary ? r.opening.salaryMax ?? undefined : undefined,
      currency: r.opening.currency,
      hiringManager: {
        id: "",
        name: emp.hmName,
        headline: emp.hmHeadline,
        initials: emp.hmInitials,
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
    invitePending: !r.candidate.claimed,
    terms,
  };
}

class DbMatchingService implements MatchingService {
  async getCandidateMatches(candidateId: string): Promise<Match[]> {
    const rows = await prisma.match.findMany({
      where: { candidateId, stage: { not: "closed" } },
      include: matchInclude,
      orderBy: { mutualFit: "desc" },
    });
    return rows.map((r) => toMatch(r, "candidate"));
  }

  async getDailyMatches(candidateId: string): Promise<Match[]> {
    const rows = await prisma.match.findMany({
      where: { candidateId, stage: { not: "closed" } },
      include: matchInclude,
      orderBy: { mutualFit: "desc" },
      take: 3,
    });
    return rows.map((r) => toMatch(r, "candidate"));
  }

  async getClosedMatches(candidateId: string): Promise<Match[]> {
    const rows = await prisma.match.findMany({
      where: { candidateId, stage: "closed" },
      include: matchInclude,
      orderBy: { mutualFit: "desc" },
    });
    return rows.map((r) => toMatch(r, "candidate"));
  }

  async getMatch(matchId: string, viewer: Viewer = "employer"): Promise<Match | null> {
    const row = await prisma.match.findUnique({ where: { id: matchId }, include: matchInclude });
    return row ? toMatch(row, viewer) : null;
  }

  async getPipeline(openingId: string): Promise<Record<PipelineStage, Match[]>> {
    const rows = await prisma.match.findMany({
      where: { openingId },
      include: matchInclude,
      orderBy: { mutualFit: "desc" },
    });
    const grouped: Record<PipelineStage, Match[]> = { new: [], talking: [], offer: [], closed: [] };
    for (const r of rows) grouped[r.stage as PipelineStage]?.push(toMatch(r, "employer"));
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
