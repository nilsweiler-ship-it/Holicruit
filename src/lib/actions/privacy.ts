"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser, getActiveCandidateId } from "@/lib/persona";
import { signOut } from "@/lib/auth";

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
  const candidateId = await getActiveCandidateId();
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { candidateId: true },
  });
  if (!match || match.candidateId !== candidateId) return;
  await prisma.match.update({ where: { id: matchId }, data: { candidateRevealed: true } });
  revalidatePath(`/candidate/chat/${matchId}`);
  revalidatePath(`/candidate/matches/${matchId}`);
}

/** Employer reveals company + hiring-manager identity to a candidate — this match only. */
export async function revealEmployer(matchId: string): Promise<void> {
  const user = await requireUser();
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { opening: { select: { company: { select: { ownerId: true } } } } },
  });
  if (!match || match.opening.company.ownerId !== user.id) return;
  await prisma.match.update({ where: { id: matchId }, data: { employerRevealed: true } });
  revalidatePath(`/hiring-manager/chat/${matchId}`);
  revalidatePath(`/hiring-manager/candidate/${matchId}`);
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
  await prisma.user.delete({ where: { id: user.id } });
  // Outside try/catch — signOut throws a redirect by design.
  await signOut({ redirectTo: "/login?deleted=1" });
}
