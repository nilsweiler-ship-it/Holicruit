import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { SubmitCandidateForm } from "./submit-form";

export default async function SubmitCandidatePage({
  params,
}: {
  params: Promise<{ roleId: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "HEADHUNTER") redirect("/login");

  const { roleId } = await params;

  const hhProfile = await prisma.headhunterProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const role = await prisma.jobRole.findUnique({
    where: { id: roleId },
    include: { company: { select: { name: true } } },
  });

  if (!role || role.claimedById !== hhProfile?.id) notFound();

  // Get candidates who haven't applied to this role yet
  const existingApplications = await prisma.application.findMany({
    where: { roleId },
    select: { candidateId: true },
  });
  const appliedIds = existingApplications.map((a) => a.candidateId);

  const candidates = await prisma.candidateProfile.findMany({
    where: {
      visibility: { not: "HIDDEN" },
      ...(appliedIds.length > 0 && { id: { notIn: appliedIds } }),
    },
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Submit Candidate</h1>
        <p className="text-muted-foreground">
          Submit a candidate for: {role.title} at {role.company.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Candidate</CardTitle>
          <CardDescription>
            Choose from existing candidates to submit for this role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubmitCandidateForm
            roleId={roleId}
            headhunterId={hhProfile!.id}
            candidates={candidates.map((c) => ({
              id: c.id,
              name: c.user.name,
              email: c.user.email,
              skills: JSON.parse(c.skills),
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
