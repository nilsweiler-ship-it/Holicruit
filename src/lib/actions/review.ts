"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getActiveCandidateId } from "@/lib/persona";

/**
 * GDPR Art. 22 right to contest: a candidate asks for a human to review the
 * outcome of a match they were not selected for. Recorded for the employer.
 */
export async function requestHumanReview(matchId: string, note: string): Promise<{ ok: boolean }> {
  const candidateId = await getActiveCandidateId();
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { candidateId: true },
  });
  if (!match || match.candidateId !== candidateId) return { ok: false };

  await prisma.decisionReviewRequest.create({
    data: { matchId, note: note.trim().slice(0, 2000) || null },
  });
  revalidatePath(`/candidate/growth/${matchId}`);
  return { ok: true };
}
