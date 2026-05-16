import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { SkillRadarChart } from "@/components/matching/skill-radar-chart";
import { TalentPool } from "@/components/retention/talent-pool";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function TeamSkillMapPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "HIRING_MANAGER")
    redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true },
  });

  if (!user?.companyId) redirect("/dashboard/hiring-manager");

  // Get all hired candidates for this company
  const hiredApps = await prisma.application.findMany({
    where: {
      stage: "HIRED",
      role: { companyId: user.companyId },
    },
    include: {
      candidate: {
        include: { user: { select: { name: true } } },
      },
      role: { select: { title: true, hardSkills: true, softSkills: true } },
    },
  });

  // Aggregate team skills
  const teamSkillMap: Record<string, { total: number; count: number }> = {};
  for (const app of hiredApps) {
    const skills: Array<{ name: string; level: number }> = JSON.parse(
      app.candidate.skills || "[]"
    );
    for (const skill of skills) {
      const key = skill.name.toLowerCase().trim();
      if (!teamSkillMap[key]) teamSkillMap[key] = { total: 0, count: 0 };
      teamSkillMap[key].total += skill.level;
      teamSkillMap[key].count += 1;
    }
  }

  const teamSkills = Object.entries(teamSkillMap)
    .map(([name, { total, count }]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      avgLevel: Math.round((total / count) * 10) / 10,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  // Get all open roles' required skills to find team gaps
  const openRoles = await prisma.jobRole.findMany({
    where: { companyId: user.companyId, status: "PUBLISHED" },
    select: { hardSkills: true, softSkills: true },
  });

  const neededSkills: Record<string, number> = {};
  for (const role of openRoles) {
    const skills = [
      ...JSON.parse(role.hardSkills),
      ...JSON.parse(role.softSkills),
    ] as Array<{ name: string; level: number }>;
    for (const s of skills) {
      const key = s.name.toLowerCase().trim();
      neededSkills[key] = Math.max(neededSkills[key] || 0, s.level);
    }
  }

  const teamGaps = Object.entries(neededSkills)
    .filter(([ key ]) => !teamSkillMap[key] || teamSkillMap[key].total / teamSkillMap[key].count < neededSkills[key])
    .map(([name, required]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      required,
      teamAvg: teamSkillMap[name]
        ? Math.round((teamSkillMap[name].total / teamSkillMap[name].count) * 10) / 10
        : 0,
    }))
    .sort((a, b) => (b.required - b.teamAvg) - (a.required - a.teamAvg));

  // Radar chart data (top skills)
  const radarPoints = teamSkills.slice(0, 8).map((s) => ({
    label: s.name,
    candidate: s.avgLevel,
    required: neededSkills[s.name.toLowerCase().trim()] || s.avgLevel,
  }));

  // Talent pool: silver-medal candidates (scored high but not hired)
  const talentPool = await prisma.application.findMany({
    where: {
      role: { companyId: user.companyId },
      stage: { in: ["SHORTLISTED", "INTERVIEW", "REJECTED"] },
      matchScore: { gte: 60 },
    },
    include: {
      candidate: {
        include: { user: { select: { name: true } } },
      },
      role: { select: { title: true } },
    },
    orderBy: { matchScore: "desc" },
    take: 10,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Team Skills & Talent Pool</h1>
        <p className="text-muted-foreground">
          See what your team covers, where gaps remain, and which candidates
          are ready for future roles.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {radarPoints.length >= 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Team Skill Coverage</CardTitle>
              <CardDescription>
                Average team skills vs. open role requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <SkillRadarChart points={radarPoints} size={320} />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team Gaps</CardTitle>
            <CardDescription>
              Skills your open roles need that your current team lacks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teamGaps.length > 0 ? (
              <div className="space-y-2">
                {teamGaps.slice(0, 8).map((gap) => (
                  <div
                    key={gap.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="font-medium">{gap.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Team: {gap.teamAvg}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-amber-100 text-amber-800 text-xs"
                      >
                        Need: {gap.required}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No skill gaps detected. Your team covers all open role
                requirements.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Talent Pool</CardTitle>
          <CardDescription>
            Strong candidates from past roles — reach out when new positions open
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TalentPool
            candidates={talentPool.map((app) => ({
              id: app.id,
              name: app.candidate.user.name,
              score: app.matchScore!,
              role: app.role.title,
              stage: app.stage,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
