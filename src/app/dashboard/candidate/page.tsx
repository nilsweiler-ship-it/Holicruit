import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default async function CandidateDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") redirect("/login");

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      applications: {
        include: { role: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  const skills = profile?.skills ? JSON.parse(profile.skills) : [];
  const experience = profile?.experience ? JSON.parse(profile.experience) : [];
  const education = profile?.education ? JSON.parse(profile.education) : [];

  const completeness =
    [
      profile?.bio ? 1 : 0,
      skills.length > 0 ? 1 : 0,
      experience.length > 0 ? 1 : 0,
      education.length > 0 ? 1 : 0,
      profile?.resumeUrl ? 1 : 0,
    ].reduce((a: number, b: number) => a + b, 0) * 20;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {session.user.name}</h1>
        <p className="text-muted-foreground">Candidate Dashboard</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Profile Completeness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completeness}%</div>
            <Progress value={completeness} className="mt-2" />
            {completeness < 100 && (
              <Button variant="link" className="mt-2 p-0" asChild>
                <Link href="/dashboard/candidate/profile">
                  Complete your profile
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile?.applications.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Total applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Match</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile?.applications.length
                ? Math.max(
                    ...profile.applications.map((a) => a.matchScore || 0)
                  ) + "%"
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Highest match score</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>Your latest role applications</CardDescription>
        </CardHeader>
        <CardContent>
          {profile?.applications.length ? (
            <div className="space-y-3">
              {profile.applications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{app.role.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Applied{" "}
                      {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {app.matchScore && (
                      <Badge variant="secondary">{app.matchScore}%</Badge>
                    )}
                    <Badge>{app.stage}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              No applications yet.{" "}
              <Link
                href="/dashboard/candidate/matches"
                className="underline hover:text-primary"
              >
                Browse matches
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
