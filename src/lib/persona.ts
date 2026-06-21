/**
 * Resolves the current session's actors. Replaces the old demo persona cookie —
 * who you are is now your logged-in account and the hats (profiles) it holds.
 */
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { prisma } from "./db";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, initials: true, email: true, roles: true },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** The active candidate profile id (redirects if the account isn't a candidate). */
export async function getActiveCandidateId(): Promise<string> {
  const user = await requireUser();
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) redirect("/select-role");
  return profile.id;
}

export async function getActiveProvider() {
  const user = await requireUser();
  const provider = await prisma.provider.findUnique({
    where: { userId: user.id },
    select: { id: true, name: true, kind: true, headline: true, initials: true },
  });
  if (!provider) redirect("/select-role");
  return provider;
}

export async function getActiveRecruiterId(): Promise<string> {
  const user = await requireUser();
  return user.id;
}

/** First opening owned by the active hiring manager, or null. */
export async function getActiveHmOpeningId(): Promise<string | null> {
  const user = await requireUser();
  const opening = await prisma.opening.findFirst({
    where: { company: { ownerId: user.id } },
    select: { id: true },
    orderBy: { matches: { _count: "desc" } },
  });
  return opening?.id ?? null;
}
