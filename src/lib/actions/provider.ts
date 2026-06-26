"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

/** Promote (sponsor) or un-sponsor a program → featured placement. */
export async function setSponsored(programId: string, sponsored: boolean): Promise<void> {
  await prisma.program.update({ where: { id: programId }, data: { sponsored } });
  revalidatePath("/provider");
  revalidatePath("/candidate/growth-paths");
}
