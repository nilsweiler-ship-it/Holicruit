"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/persona";

export type Hat = "candidate" | "hiring_manager" | "recruiter" | "provider";

const HAT_HOME: Record<Hat, string> = {
  candidate: "/candidate/matches",
  hiring_manager: "/hiring-manager/pipeline",
  recruiter: "/recruiter",
  provider: "/provider",
};

/** Add a hat to the current account (creating its profile if needed) and go to
 *  that hat's home. One account, many hats. */
export async function addHat(hat: Hat): Promise<void> {
  const user = await requireUser();
  const full = await prisma.user.findUnique({
    where: { id: user.id },
    select: { roles: true, name: true, initials: true, candidate: { select: { id: true } }, provider: { select: { id: true } } },
  });
  if (!full) redirect("/login");

  let roles: string[] = [];
  try {
    roles = JSON.parse(full.roles) as string[];
  } catch {
    roles = [];
  }
  if (!roles.includes(hat)) roles.push(hat);

  if (hat === "candidate" && !full.candidate) {
    await prisma.candidateProfile.create({
      data: { userId: user.id, headline: "New candidate", industry: "General", completeness: 20 },
    });
  }
  if (hat === "provider" && !full.provider) {
    await prisma.provider.create({
      data: { userId: user.id, name: full.name, kind: "Course platform", headline: "New provider", initials: full.initials },
    });
  }

  await prisma.user.update({ where: { id: user.id }, data: { roles: JSON.stringify(roles) } });
  revalidatePath("/select-role");
  redirect(HAT_HOME[hat]);
}
