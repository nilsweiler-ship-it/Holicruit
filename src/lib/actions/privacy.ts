"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser, getActiveCandidateId } from "@/lib/persona";
import { assertHat, assertMatchAccess, safeRedirectPath } from "@/lib/access";
import { signOut } from "@/lib/auth";
import { runMatchingForCandidate } from "@/lib/matching/engine";

/**
 * Save alias + anonymity preference. When anonymous is on, counterparties see
 * the alias instead of the real name until an explicit per-match reveal.
 */
export async function updatePrivacy(formData: FormData): Promise<void> {
  const user = await requireUser();
  const alias = String(formData.get("alias") ?? "").trim().slice(0, 60) || null;
  const anonymous = formData.get("anonymous") === "on";
  await prisma.user.update({ where: { id: user.id }, data: { alias, anonymous } });
  revalidatePath("/settings/privacy");
}

/** Candidate reveals their real identity to the employer — for this match only. */
export async function revealMyIdentity(matchId: string): Promise<void> {
  await assertMatchAccess(String(matchId), "candidate");
  await prisma.match.update({ where: { id: matchId }, data: { candidateRevealed: true } });
  revalidatePath(`/candidate/chat/${matchId}`);
  revalidatePath(`/candidate/matches/${matchId}`);
}

/** Employer reveals company + hiring-manager identity to a candidate — this match only. */
export async function revealEmployer(matchId: string): Promise<void> {
  await assertHat("hiring_manager");
  await assertMatchAccess(String(matchId), "manager");
  await prisma.match.update({ where: { id: matchId }, data: { employerRevealed: true } });
  revalidatePath(`/hiring-manager/chat/${matchId}`);
  revalidatePath(`/hiring-manager/candidate/${matchId}`);
}

/**
 * Save the candidate's confidential pay + location expectations. These are
 * must-haves for matching, so saving re-runs matching (hard incompatibilities
 * are filtered out of what the candidate sees).
 */
export async function updateWorkPrefs(formData: FormData): Promise<void> {
  const candidateId = await getActiveCandidateId();
  const min = Number(formData.get("expectedSalaryMin")) || null;
  const max = Number(formData.get("expectedSalaryMax")) || null;
  const currency = String(formData.get("salaryCurrency") ?? "€").trim() || "€";
  const modes = formData
    .getAll("workModes")
    .map(String)
    .filter((m) => m === "onsite" || m === "hybrid" || m === "remote");
  const locationPref = String(formData.get("locationPref") ?? "").trim() || null;
  const redirectTo = String(formData.get("redirectTo") ?? "").trim();

  // Must-haves: a minimum and at least one work mode. (Settings page is lenient;
  // the onboarding page marks these required in the form as well.)
  if (redirectTo && (!min || modes.length === 0)) {
    redirect("/candidate/profile/expectations?error=1");
  }

  await prisma.candidateProfile.update({
    where: { id: candidateId },
    data: {
      expectedSalaryMin: min,
      expectedSalaryMax: max,
      salaryCurrency: currency,
      workModes: JSON.stringify(modes),
      locationPref,
    },
  });
  await runMatchingForCandidate(candidateId);
  revalidatePath("/settings/privacy");
  revalidatePath("/candidate/matches");
  revalidatePath("/candidate/today");
  // Same-origin paths only ("//evil" and "/\evil" fall back to no redirect).
  const target = redirectTo ? safeRedirectPath(redirectTo, "") : "";
  if (target) redirect(target);
}

/** Candidate opts to share their exact pay/location figures for one match. */
export async function shareTermsAsCandidate(matchId: string): Promise<void> {
  await assertMatchAccess(String(matchId), "candidate");
  await prisma.match.update({ where: { id: matchId }, data: { candidateSharesTerms: true } });
  revalidatePath(`/candidate/matches/${matchId}`);
  revalidatePath(`/candidate/chat/${matchId}`);
}

/** Employer opts to share the role's exact band for one match. */
export async function shareTermsAsEmployer(matchId: string): Promise<void> {
  await assertHat("hiring_manager");
  await assertMatchAccess(String(matchId), "manager");
  await prisma.match.update({ where: { id: matchId }, data: { employerSharesTerms: true } });
  revalidatePath(`/hiring-manager/candidate/${matchId}`);
  revalidatePath(`/hiring-manager/chat/${matchId}`);
}

/**
 * Right to erasure (GDPR Art. 17). Deletes the account and everything that
 * cascades from it, then signs out. Requires typing DELETE to confirm.
 */
export async function deleteMyAccount(formData: FormData): Promise<void> {
  const user = await requireUser();
  if (String(formData.get("confirm") ?? "").trim().toUpperCase() !== "DELETE") {
    redirect("/settings/privacy?delete=confirm");
  }
  // Pseudonymize what the user wrote into records that outlive the account
  // (the other party's thread, and an employer's score sheets / notes), so the
  // real name doesn't survive erasure. Messages are matched by author id, plus
  // any legacy rows stored under the account's real name in threads it was
  // party to.
  const DELETED = "Deleted user";
  const myThreads = {
    match: {
      OR: [{ candidate: { userId: user.id } }, { opening: { company: { ownerId: user.id } } }],
    },
  };
  // Score sheets / notes are written by the hiring manager on their own roles.
  const managedMatches = { opening: { company: { ownerId: user.id } } };
  await prisma.$transaction([
    prisma.message.updateMany({ where: { fromUserId: user.id }, data: { fromName: DELETED, fromUserId: null } }),
    prisma.message.updateMany({
      where: { fromUserId: null, fromName: user.name, thread: myThreads },
      data: { fromName: DELETED },
    }),
    prisma.scoreSheet.updateMany({ where: { author: user.name, match: managedMatches }, data: { author: DELETED } }),
    prisma.pipelineNote.updateMany({ where: { author: user.name, match: managedMatches }, data: { author: DELETED } }),
  ]);
  await prisma.user.delete({ where: { id: user.id } });
  // Outside try/catch — signOut throws a redirect by design.
  await signOut({ redirectTo: "/login?deleted=1" });
}
