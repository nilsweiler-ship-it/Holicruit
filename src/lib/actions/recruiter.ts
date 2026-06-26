"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/persona";

const STAGES = ["talking", "interview", "offer", "hired"];

/** Log a new candidate→role introduction the recruiter is facilitating. */
export async function createIntro(formData: FormData): Promise<void> {
  const user = await requireUser();
  const candidateName = String(formData.get("candidateName") ?? "").trim();
  if (!candidateName) redirect("/recruiter");

  const stage = String(formData.get("stage") ?? "talking");
  await prisma.recruiterIntro.create({
    data: {
      recruiterId: user.id,
      candidateName,
      roleTitle: String(formData.get("roleTitle") ?? "").trim() || "Role",
      company: String(formData.get("company") ?? "").trim() || "Company",
      valueNote: String(formData.get("valueNote") ?? "").trim() || "Introduced by recruiter.",
      stage: STAGES.includes(stage) ? stage : "talking",
    },
  });
  revalidatePath("/recruiter");
  redirect("/recruiter");
}
