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
import { Badge } from "@/components/ui/badge";
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

  const roleHardSkills: Array<{ name: string; level: number }> = JSON.parse(role.hardSkills);
  const roleSoftSkills: Array<{ name: string; level: number }> = JSON.parse(role.softSkills);

  const roleTypeLabel =
    role.roleType === "PERMANENT" ? "Permanent" :
    role.roleType === "PROJECT" ? "Project-bound" :
    role.roleType === "CONTRACT_SHORT" ? "Contract (<3mo)" :
    role.roleType === "CONTRACT_MEDIUM" ? "Contract (3-6mo)" :
    role.roleType === "CONTRACT_LONG" ? "Contract (6mo+)" : role.roleType;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Submit Candidates</h1>
        <p className="text-muted-foreground">
          {role.title} at {role.company.name}
        </p>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline">{roleTypeLabel}</Badge>
          <Badge variant="outline">Threshold: {role.threshold}%</Badge>
          {role.bounty && (
            <Badge className="bg-green-100 text-green-800">
              Bounty: ${(role.bounty / 100).toFixed(0)}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Required Hard Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {roleHardSkills.map((s, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {s.name} (L{s.level})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Required Soft Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {roleSoftSkills.map((s, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {s.name} (L{s.level})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Candidates</CardTitle>
          <CardDescription>
            Select one or multiple candidates to submit. Radar charts show each
            candidate&apos;s skills vs. role requirements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubmitCandidateForm
            roleId={roleId}
            headhunterId={hhProfile!.id}
            roleHardSkills={roleHardSkills}
            roleSoftSkills={roleSoftSkills}
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
