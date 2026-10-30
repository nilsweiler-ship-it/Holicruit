"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { assertHat, assertProgramOwner } from "@/lib/access";
import { getActivePlan } from "@/lib/services/billing";

/** Promote (sponsor) or un-sponsor a program → featured placement.
 *  Promoting requires the Partner plan. */
export async function setSponsored(programId: string, sponsored: boolean): Promise<void> {
  const id = z.string().min(1).max(64).parse(programId);
  const value = z.boolean().parse(sponsored);
  // Only the provider that owns the program can (un)sponsor it.
  const user = await assertProgramOwner(id);
  if (value) {
    const { plan } = await getActivePlan(user.id, "provider");
    if (!plan.canPromote) redirect("/provider/billing?promote=1");
  }
  await prisma.program.update({ where: { id }, data: { sponsored: value } });
  revalidatePath("/provider");
  revalidatePath("/candidate/growth-paths");
}

/** Offer a new program (provider-side). It immediately appears in the
 *  marketplace for candidates whose gap it closes. */
export async function createProgram(formData: FormData): Promise<void> {
  const user = await assertHat("provider");
  const provider = await prisma.provider.findUnique({ where: { userId: user.id }, select: { id: true } });
  if (!provider) redirect("/select-role");

  const title = String(formData.get("title") ?? "").trim().slice(0, 160);
  if (!title) redirect("/provider");

  await prisma.program.create({
    data: {
      providerId: provider.id,
      title,
      format: String(formData.get("format") ?? "").trim() || "Online course",
      credential: String(formData.get("credential") ?? "").trim() || null,
      closesGap: String(formData.get("closesGap") ?? "").trim() || "General",
      gapType: String(formData.get("gapType")) === "soft" ? "soft" : "hard",
      tags: JSON.stringify(
        String(formData.get("tags") ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    },
  });
  revalidatePath("/provider");
  revalidatePath("/candidate/growth-paths");
  redirect("/provider");
}
