import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { MatchScoreBadge } from "@/components/matching/match-score-badge";
import { StageBadge } from "@/components/pipeline/stage-badge";
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

export default async function SubmissionsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "HEADHUNTER") redirect("/login");

  const hhProfile = await prisma.headhunterProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const applications = await prisma.application.findMany({
    where: { headhunterId: hhProfile?.id },
    include: {
      candidate: {
        include: { user: { select: { name: true, email: true } } },
      },
      role: { include: { company: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Submissions</h1>
        <p className="text-muted-foreground">
          Track all your candidate submissions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Submissions ({applications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">
                      {app.candidate.user.name}
                    </TableCell>
                    <TableCell>{app.role.title}</TableCell>
                    <TableCell>{app.role.company.name}</TableCell>
                    <TableCell>
                      {app.matchScore !== null ? (
                        <MatchScoreBadge score={app.matchScore} />
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <StageBadge stage={app.stage} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-sm">
              No submissions yet. Browse roles and submit candidates to get
              started.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
