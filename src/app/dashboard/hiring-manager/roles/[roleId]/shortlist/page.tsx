import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { triggerMilestone } from "@/lib/milestones";
import { Badge } from "@/components/ui/badge";
import { MatchScoreBadge } from "@/components/matching/match-score-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ShortlistPage({
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
      applications: {
        where: {
          matchScore: { gte: 0 },
        },
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

  // Trigger shortlist milestone fee (idempotent — only charges once per role)
  if (role.applications.length > 0) {
    triggerMilestone(role.id, "SHORTLIST").catch(() => {});
  }

  const shortlisted = role.applications.filter(
    (a) => a.matchScore !== null && a.matchScore >= role.threshold
  );
  const belowThreshold = role.applications.filter(
    (a) => a.matchScore !== null && a.matchScore < role.threshold
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shortlist: {role.title}</h1>
          <p className="text-muted-foreground">
            Threshold: {role.threshold}% — {shortlisted.length} candidate
            {shortlisted.length !== 1 ? "s" : ""} above threshold
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/hiring-manager/roles/${role.id}`}>
            Back to Role
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Above Threshold ({shortlisted.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {shortlisted.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shortlisted.map((app) => {
                  const contactRevealed = ["INTERVIEW", "OFFER", "HIRED"].includes(app.stage);
                  return (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">
                        {app.candidate.user.name}
                      </TableCell>
                      <TableCell>
                        {contactRevealed
                          ? app.candidate.user.email
                          : <span className="text-muted-foreground italic">Revealed at interview stage</span>
                        }
                      </TableCell>
                      <TableCell>
                        <MatchScoreBadge score={app.matchScore!} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{app.stage}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" asChild>
                          <Link
                            href={`/dashboard/hiring-manager/applications/${app.id}`}
                          >
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-sm">
              No candidates above threshold yet.
            </p>
          )}
        </CardContent>
      </Card>

      {belowThreshold.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Below Threshold ({belowThreshold.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Stage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {belowThreshold.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>{app.candidate.user.name}</TableCell>
                    <TableCell>
                      <MatchScoreBadge score={app.matchScore!} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{app.stage}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
