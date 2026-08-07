"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/persona";
import { computeFit, runMatchingForCandidate } from "@/lib/matching/engine";
import { initialsFrom } from "@/lib/identity";

type Row = { name: string; email: string; skills: string[] };

/** Parse the pasted list: one candidate per line — `Name, email, Skill, Skill`. */
function parseRows(text: string): Row[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const fields = line.split(",").map((f) => f.trim()).filter(Boolean);
      if (!fields.length) return null;
      const name = fields[0]!;
      let rest = fields.slice(1);
      let email = "";
      if (rest[0]?.includes("@")) {
        email = rest[0]!.toLowerCase();
        rest = rest.slice(1);
      }
      return { name, email, skills: rest };
    })
    .filter((r): r is Row => r !== null);
}

/**
 * Import candidates the HM already has into a role's pipeline. Each becomes an
 * "unclaimed" profile — private to this HM, scored on the model, and surfaced
 * with an invite link. The person claims it to join, verify, and control their
 * own visibility. Demand brings its own supply.
 */
export async function importCandidates(openingId: string, formData: FormData): Promise<void> {
  const user = await requireUser();
  const opening = await prisma.opening.findUnique({
    where: { id: openingId },
    select: {
      id: true,
      industry: true,
      requiredHard: true,
      requiredSoft: true,
      hardWeight: true,
      softWeight: true,
      skillWeights: true,
      company: { select: { ownerId: true } },
    },
  });
  if (!opening || opening.company.ownerId !== user.id) redirect("/hiring-manager/pipeline");

  let skillWeights: Record<string, string> = {};
  try {
    skillWeights = JSON.parse(opening.skillWeights) as Record<string, string>;
  } catch {
    skillWeights = {};
  }

  const rows = parseRows(String(formData.get("candidates") ?? ""));
  let added = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row.name || !row.email || !row.email.includes("@")) {
      skipped++;
      continue;
    }
    // Respect existing members' consent — never auto-attach a real account.
    const existing = await prisma.user.findUnique({ where: { email: row.email }, select: { id: true } });
    if (existing) {
      skipped++;
      continue;
    }

    const created = await prisma.user.create({
      data: {
        email: row.email,
        passwordHash: "", // unusable until they claim and set one
        name: row.name,
        initials: initialsFrom(row.name),
        roles: JSON.stringify(["candidate"]),
        candidate: {
          create: {
            headline: row.skills[0] ? `${row.skills[0]} · imported` : "Imported candidate",
            industry: opening.industry,
            completeness: 25,
            claimed: false,
            invitedByUserId: user.id,
            inviteToken: randomUUID(),
            hardSkills: { create: row.skills.map((s) => ({ name: s, verified: false })) },
          },
        },
      },
      include: { candidate: { include: { hardSkills: true, softSkills: true } } },
    });
    const profile = created.candidate!;

    const fit = computeFit({
      hardSkills: profile.hardSkills,
      softSkills: profile.softSkills,
      requiredHard: JSON.parse(opening.requiredHard) as string[],
      requiredSoft: JSON.parse(opening.requiredSoft) as string[],
      hardWeight: opening.hardWeight,
      softWeight: opening.softWeight,
      skillWeights,
    });

    await prisma.match.create({
      data: {
        candidateId: profile.id,
        openingId,
        hardFit: fit.hardFit,
        softFit: fit.softFit,
        mutualFit: fit.mutualFit,
        verified: fit.verified,
        gaps: JSON.stringify(fit.gaps),
        stage: "new",
        candidateOptIn: false, // not contactable until the candidate claims + opts in
        managerOptIn: true,
      },
    });
    added++;
  }

  revalidatePath("/hiring-manager/pipeline");
  revalidatePath(`/hiring-manager/roles/${openingId}/import-candidates`);
  redirect(`/hiring-manager/roles/${openingId}/import-candidates?added=${added}&skipped=${skipped}`);
}

/**
 * Claim an imported profile via its invite link: set a password, take ownership,
 * and enter the marketplace (full matching runs). The person now controls their
 * own visibility, alias, and skill verification like any candidate.
 */
export async function claimProfile(token: string, formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) redirect(`/claim/${token}?error=short`);

  const profile = await prisma.candidateProfile.findUnique({
    where: { inviteToken: token },
    select: { id: true, userId: true, claimed: true },
  });
  if (!profile || profile.claimed) redirect(`/claim/${token}?error=invalid`);

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: profile.userId }, data: { passwordHash } });
  await prisma.candidateProfile.update({
    where: { id: profile.id },
    data: { claimed: true, inviteToken: null, invitedByUserId: null },
  });
  await runMatchingForCandidate(profile.id);
  redirect("/login?claimed=1");
}
