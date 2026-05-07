import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import type { Skill, RoleWeights } from "@/types";

export default async function RoleDetailPage({
  params,
}: {
  params: Promise<{ roleId: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "HIRING_MANAGER")
    redirect("/login");

  const { roleId } = await params;

  const role = await prisma.jobRole.findUnique({
    where: { id: roleId },
    include: {
      company: true,
      applications: {
        include: {
          candidate: {
            include: { user: { select: { name: true, email: true } } },
          },
        },
        orderBy: { matchScore: "desc" },
      },
    },
  });

  if (!role || role.createdById !== session.user.id) notFound();

  const hardSkills: Skill[] = JSON.parse(role.hardSkills);
  const softSkills: Skill[] = JSON.parse(role.softSkills);
  const weights: RoleWeights = JSON.parse(role.weights);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{role.title}</h1>
            <Badge
              variant={
                role.status === "PUBLISHED"
                  ? "default"
                  : role.status === "CLOSED"
                    ? "destructive"
                    : "secondary"
              }
            >
              {role.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">{role.company.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link
              href={`/dashboard/hiring-manager/roles/${role.id}/shortlist`}
            >
              View Shortlist
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{role.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scoring Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(weights).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize text-muted-foreground">
                    {key.replace(/([A-Z])/g, " $1")}
                  </span>
                  <span className="font-medium">{value}%</span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Threshold</span>
              <span className="font-medium">{role.threshold}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Hard Skills ({hardSkills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {hardSkills.map((skill, i) => (
                <Badge key={i} variant="outline">
                  {skill.name} (L{skill.level})
                  {skill.required ? " *" : ""}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Soft Skills ({softSkills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {softSkills.map((skill, i) => (
                <Badge key={i} variant="secondary">
                  {skill.name} (L{skill.level})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-bold mb-4">
          Pipeline ({role.applications.length} candidates)
        </h2>
        <PipelineBoard
          applications={role.applications.map((app) => ({
            id: app.id,
            candidateName: app.candidate.user.name,
            matchScore: app.matchScore,
            stage: app.stage,
            createdAt: app.createdAt.toISOString(),
            roleId: role.id,
          }))}
          roleId={role.id}
        />
      </div>
    </div>
  );
}
