"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { assertHat } from "@/lib/access";

const STAGES = ["talking", "interview", "offer", "hired"];

/** Log a new candidate→role introduction the recruiter is facilitating. */
export async function createIntro(formData: FormData): Promise<void> {
  const user = await assertHat("recruiter");
  const candidateName = String(formData.get("candidateName") ?? "").trim().slice(0, 120);
  if (!candidateName) redirect("/recruiter");

  const stage = String(formData.get("stage") ?? "talking");
  await prisma.recruiterIntro.create({
    data: {
      recruiterId: user.id,
      candidateName,
      roleTitle: String(formData.get("roleTitle") ?? "").trim().slice(0, 160) || "Role",
      company: String(formData.get("company") ?? "").trim().slice(0, 160) || "Company",
      valueNote: String(formData.get("valueNote") ?? "").trim().slice(0, 2000) || "Introduced by recruiter.",
      stage: STAGES.includes(stage) ? stage : "talking",
    },
  });
  revalidatePath("/recruiter");
  redirect("/recruiter");
}
