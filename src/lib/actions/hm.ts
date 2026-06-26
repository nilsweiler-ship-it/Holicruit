"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/persona";
import { runMatchingForOpening } from "@/lib/matching/engine";
import type { SkillGap } from "@/lib/fit/types";

const HARD_BAR = 85;
const SOFT_BAR = 75;

const parseList = (v: FormDataEntryValue | null) =>
  String(v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/** Post a role: create the opening and run matching to populate its pipeline. */
export async function createOpening(formData: FormData): Promise<void> {
  const user = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect("/hiring-manager/roles");

  const company = await prisma.company.create({
    data: {
      name: String(formData.get("companyName") ?? "").trim() || "My Company",
      location: String(formData.get("location") ?? "").trim() || "Remote",
      ownerId: user.id,
    },
  });
  const opening = await prisma.opening.create({
    data: {
      title,
      industry: String(formData.get("industry") ?? "").trim() || "General",
      companyId: company.id,
      location: String(formData.get("location") ?? "").trim() || "Remote",
      salaryMin: Number(formData.get("salaryMin")) || null,
      salaryMax: Number(formData.get("salaryMax")) || null,
      currency: String(formData.get("currency") ?? "").trim() || "€",
      hiringManagerName: user.name,
      hiringManagerHeadline: `Hiring manager · ${company.name}`,
      hiringManagerInitials: user.initials,
      requiredHard: JSON.stringify(parseList(formData.get("requiredHard"))),
      requiredSoft: JSON.stringify(parseList(formData.get("requiredSoft"))),
    },
  });

  await runMatchingForOpening(opening.id);
  revalidatePath("/hiring-manager/pipeline");
  revalidatePath("/hiring-manager/roles");
  redirect(`/hiring-manager/pipeline?opening=${opening.id}`);
}

/** Advance/move a candidate between pipeline stages. */
export async function setStage(
  matchId: string,
  stage: "new" | "talking" | "offer" | "closed",
): Promise<void> {
  await prisma.match.update({ where: { id: matchId }, data: { stage } });
  revalidatePath("/hiring-manager/pipeline");
}

/**
 * Pass a candidate with feedback: close the match, mark the feedback sent, and
 * generate the candidate's Growth Report (rejection is never silent).
 */
export async function passWithFeedback(matchId: string, body: string): Promise<void> {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { opening: { include: { company: { select: { name: true } } } } },
  });
  if (!match) return;

  const gaps = JSON.parse(match.gaps) as SkillGap[];
  const primary = gaps.find((g) => g.type === "hard") ?? gaps[0] ?? { skill: "—", type: "hard" as const };

  const others = await prisma.match.findMany({
    where: { candidateId: match.candidateId, stage: { not: "closed" }, id: { not: matchId } },
    select: { gaps: true },
  });
  const rolesCleared = others.filter((o) =>
    (JSON.parse(o.gaps) as SkillGap[]).some((g) => g.skill === primary.skill),
  ).length;
  const programCount = await prisma.program.count({ where: { closesGap: primary.skill } });

  await prisma.match.update({ where: { id: matchId }, data: { stage: "closed" } });
  await prisma.feedbackDraft.upsert({
    where: { matchId },
    update: { body, sent: true },
    create: { matchId, body, sent: true },
  });
  await prisma.growthReport.upsert({
    where: { matchId },
    update: {
      hardYou: match.hardFit,
      softYou: match.softFit,
      primaryGapSkill: primary.skill,
      primaryGapType: primary.type,
      rolesClearedIfClosed: rolesCleared,
      matchingProgramCount: programCount,
    },
    create: {
      matchId,
      roleTitle: match.opening.title,
      company: match.opening.company.name,
      hardYou: match.hardFit,
      hardBar: HARD_BAR,
      softYou: match.softFit,
      softBar: SOFT_BAR,
      primaryGapSkill: primary.skill,
      primaryGapType: primary.type,
      rolesClearedIfClosed: rolesCleared,
      matchingProgramCount: programCount,
    },
  });

  revalidatePath("/hiring-manager/pipeline");
  revalidatePath(`/hiring-manager/candidate/${matchId}`);
  revalidatePath("/candidate/matches");
}
