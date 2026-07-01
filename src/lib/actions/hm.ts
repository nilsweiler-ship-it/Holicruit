"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/persona";
import { runMatchingForOpening } from "@/lib/matching/engine";
import { jobAdParser } from "@/lib/services/ingest";
import { getActivePlan, countOpenRoles } from "@/lib/services/billing";
import { SCORE_CRITERIA } from "@/lib/scoresheet";
import type { SkillGap } from "@/lib/fit/types";

/** Block posting beyond the plan's open-role limit → send to billing. */
async function enforceRoleLimit(userId: string): Promise<void> {
  const { plan } = await getActivePlan(userId, "hiring_manager");
  if (plan.openRoleLimit !== undefined) {
    const count = await countOpenRoles(userId);
    if (count >= plan.openRoleLimit) redirect("/hiring-manager/billing?limit=1");
  }
}

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
  await enforceRoleLimit(user.id);
  const { plan } = await getActivePlan(user.id, "hiring_manager");
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
      priority: plan.priorityMatching ?? false,
    },
  });

  await runMatchingForOpening(opening.id);
  revalidatePath("/hiring-manager/pipeline");
  revalidatePath("/hiring-manager/roles");
  redirect(`/hiring-manager/pipeline?opening=${opening.id}`);
}

/**
 * Import a role by pasting a job ad from another platform: the parser
 * "translates" the free text into the structured opening (title, skills,
 * industry), then matching runs against the candidate pool.
 */
export async function importOpening(formData: FormData): Promise<void> {
  await requireUser();
  const text = String(formData.get("text") ?? "").trim();
  if (!text) redirect("/hiring-manager/roles/import");

  // Parse → hand off to the create form prefilled, so the HM reviews/edits the
  // "translation" before it goes live.
  const parsed = await jobAdParser.parseJobAd(text);
  const params = new URLSearchParams({
    title: parsed.title,
    companyName: parsed.company ?? "",
    location: parsed.location,
    industry: parsed.industry,
    requiredHard: parsed.requiredHard.join(", "),
    requiredSoft: parsed.requiredSoft.join(", "),
    imported: "1",
  });
  redirect(`/hiring-manager/roles/new?${params.toString()}`);
}

/** Advance/move a candidate between pipeline stages. */
export async function setStage(
  matchId: string,
  stage: "new" | "talking" | "offer" | "closed",
): Promise<void> {
  await prisma.match.update({ where: { id: matchId }, data: { stage, stageChangedAt: new Date() } });
  revalidatePath("/hiring-manager/pipeline");
}

/** Gate a premium hiring-manager capability, sending to billing if not on plan. */
async function requireHmFeature(
  userId: string,
  feature: "scoreSheets" | "pipelineTools",
  redirectTo: string,
): Promise<void> {
  const { plan } = await getActivePlan(userId, "hiring_manager");
  if (!plan[feature]) redirect(redirectTo);
}

/** Save a structured interview scorecard (Team plan). */
export async function saveScoreSheet(matchId: string, formData: FormData): Promise<void> {
  const user = await requireUser();
  await requireHmFeature(user.id, "scoreSheets", "/hiring-manager/billing?feature=score-sheets");

  const ratings = SCORE_CRITERIA.map((criterion, i) => ({
    criterion,
    score: Math.min(5, Math.max(1, Number(formData.get(`rating-${i}`)) || 3)),
  }));
  const overall = Math.round(ratings.reduce((s, r) => s + r.score, 0) / ratings.length);

  await prisma.scoreSheet.create({
    data: {
      matchId,
      author: user.name,
      ratings: JSON.stringify(ratings),
      overall,
      recommendation: String(formData.get("recommendation") ?? "yes"),
      notes: String(formData.get("notes") ?? "").trim(),
    },
  });
  revalidatePath(`/hiring-manager/candidate/${matchId}`);
}

/** Add a private note on a candidate (Team plan — full pipeline management). */
export async function addNote(matchId: string, formData: FormData): Promise<void> {
  const user = await requireUser();
  await requireHmFeature(user.id, "pipelineTools", "/hiring-manager/billing?feature=pipeline");
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  await prisma.pipelineNote.create({ data: { matchId, author: user.name, body } });
  revalidatePath(`/hiring-manager/candidate/${matchId}`);
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
