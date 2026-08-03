"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser, getRole } from "@/lib/persona";

export type FeedbackResult = { ok: true } | { ok: false; error: string };

/**
 * Records a piece of product feedback. Deliberately low-barrier: a sentiment,
 * a note, or both is enough. Ties the submission to the logged-in account and
 * their current role when available. Feeds the in-app feedback inbox.
 */
export async function submitProductFeedback(input: {
  message?: string;
  sentiment?: string;
  path?: string;
}): Promise<FeedbackResult> {
  const message = (input.message ?? "").trim().slice(0, 4000);
  const sentiment = input.sentiment?.trim() || null;

  if (!message && !sentiment) {
    return { ok: false, error: "Add a quick reaction or a note before sending." };
  }

  const user = await getCurrentUser();
  const role = user ? await getRole() : null;

  await prisma.productFeedback.create({
    data: {
      message,
      sentiment,
      path: input.path?.slice(0, 300) ?? null,
      role,
      userId: user?.id ?? null,
    },
  });

  revalidatePath("/feedback");
  return { ok: true };
}
