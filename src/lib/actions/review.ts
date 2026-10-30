"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { AccessDenied, assertMatchAccess } from "@/lib/access";

/**
 * GDPR Art. 22 right to contest: a candidate asks for a human to review the
 * outcome of a match they were not selected for. Recorded for the employer.
 */
export async function requestHumanReview(matchId: string, note: string): Promise<{ ok: boolean }> {
  const id = z.string().min(1).max(64).safeParse(matchId);
  const text = z.string().max(20_000).safeParse(note ?? "");
  if (!id.success || !text.success) return { ok: false };
  try {
    await assertMatchAccess(id.data, "candidate");
  } catch (e) {
    if (e instanceof AccessDenied) return { ok: false };
    throw e; // e.g. the redirect to /login
  }

  await prisma.decisionReviewRequest.create({
    data: { matchId: id.data, note: text.data.trim().slice(0, 2000) || null },
  });
  revalidatePath(`/candidate/growth/${id.data}`);
  return { ok: true };
}
