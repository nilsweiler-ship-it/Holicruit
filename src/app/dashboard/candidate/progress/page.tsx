import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { SkillProgressChart } from "@/components/retention/skill-progress-chart";
import { ReMatchNotifications } from "@/components/retention/re-match-notifications";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function CandidateProgressPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") redirect("/login");

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, skills: true },
  });

  if (!profile) redirect("/dashboard/candidate/profile");

  const snapshots = await prisma.skillSnapshot.findMany({
    where: { candidateId: profile.id },
    orderBy: { createdAt: "asc" },
  });

  const currentSkills: Array<{ name: string; level: number }> = JSON.parse(
    profile.skills || "[]"
  );

  // Find roles where candidate would now score higher
  const publishedRoles = await prisma.jobRole.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      hardSkills: true,
      softSkills: true,
      threshold: true,
      company: { select: { name: true } },
    },
    take: 20,
  });

  const reMatches = publishedRoles
    .map((role) => {
      const roleSkills = [
        ...JSON.parse(role.hardSkills),
        ...JSON.parse(role.softSkills),
      ] as Array<{ name: string; level: number }>;
      let totalMatch = 0;
      let totalRequired = 0;
      for (const req of roleSkills) {
        const match = currentSkills.find(
          (s) => s.name.toLowerCase().trim() === req.name.toLowerCase().trim()
        );
        totalMatch += Math.min(match?.level || 0, req.level);
        totalRequired += req.level;
      }
      const score = totalRequired > 0 ? Math.round((totalMatch / totalRequired) * 100) : 0;
      return { ...role, estimatedScore: score };
    })
    .filter((r) => r.estimatedScore >= r.threshold)
    .sort((a, b) => b.estimatedScore - a.estimatedScore)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Career Progress</h1>
        <p className="text-muted-foreground">
          Track how your skills grow over time and discover new role matches.
        </p>
      </div>

      <Card className="border-2 border-foreground/15">
        <CardHeader>
          <CardTitle className="text-base">Skill Growth Over Time</CardTitle>
          <CardDescription>
            Your skill levels across snapshots. Update your profile to record new progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SkillProgressChart
            snapshots={snapshots.map((s) => ({
              date: s.createdAt.toISOString(),
              skills: JSON.parse(s.skills),
            }))}
            currentSkills={currentSkills}
          />
        </CardContent>
      </Card>

      <Card className="border-2 border-foreground/15">
        <CardHeader>
          <CardTitle className="text-base">New Matches For You</CardTitle>
          <CardDescription>
            Roles where your current profile meets the threshold — you might not have qualified before.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReMatchNotifications matches={reMatches} />
        </CardContent>
      </Card>
    </div>
  );
}
