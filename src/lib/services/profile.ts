/**
 * Candidate profile reads (DB-backed), returning the domain shapes the UI uses.
 */
import type { CandidateProfile, Endorsement } from "../types";
import { prisma } from "../db";

export async function getCandidateProfile(profileId: string): Promise<CandidateProfile | null> {
  const p = await prisma.candidateProfile.findUnique({
    where: { id: profileId },
    include: {
      user: { select: { name: true, initials: true } },
      hardSkills: { select: { name: true, verified: true } },
      softSkills: { select: { name: true, level: true } },
    },
  });
  if (!p) return null;
  return {
    id: p.id,
    name: p.user.name,
    headline: p.headline,
    initials: p.user.initials,
    industry: p.industry,
    completeness: p.completeness,
    scenarioCompleted: p.scenarioCompleted,
    hardSkills: p.hardSkills,
    softSkills: p.softSkills,
  };
}

export async function getEndorsements(profileId: string): Promise<Endorsement[]> {
  const rows = await prisma.endorsement.findMany({
    where: { profileId },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((e) => ({
    id: e.id,
    skill: e.skill,
    endorserName: e.endorserName,
    endorserInitials: e.endorserInitials,
    endorserHeadline: e.endorserHeadline,
    relationship: e.relationship,
  }));
}
