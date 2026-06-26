"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/persona";

/** Promote (sponsor) or un-sponsor a program → featured placement. */
export async function setSponsored(programId: string, sponsored: boolean): Promise<void> {
  await prisma.program.update({ where: { id: programId }, data: { sponsored } });
  revalidatePath("/provider");
  revalidatePath("/candidate/growth-paths");
}

/** Offer a new program (provider-side). It immediately appears in the
 *  marketplace for candidates whose gap it closes. */
export async function createProgram(formData: FormData): Promise<void> {
  const user = await requireUser();
  const provider = await prisma.provider.findUnique({ where: { userId: user.id }, select: { id: true } });
  if (!provider) redirect("/select-role");

  const title = String(formData.get("title") ?? "").trim();
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
