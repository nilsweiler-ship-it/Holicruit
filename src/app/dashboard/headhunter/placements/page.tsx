import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatCents } from "@/lib/milestones";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
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

export default async function HeadhunterPlacementsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "HEADHUNTER") redirect("/login");

  const profile = await prisma.headhunterProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) redirect("/dashboard/headhunter");

  const placements = await prisma.placement.findMany({
    where: { headhunterId: profile.id },
    include: {
      application: {
        include: {
          candidate: {
            include: { user: { select: { name: true } } },
          },
          role: {
            select: { title: true, company: { select: { name: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalEarned = placements
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.commissionCents, 0);
  const totalPending = placements
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + p.commissionCents, 0);

  // Reputation stats
  const totalSubmissions = await prisma.application.count({
    where: { headhunterId: profile.id },
  });
  const hiredCount = await prisma.application.count({
    where: { headhunterId: profile.id, stage: "HIRED" },
  });
  const successRate =
    totalSubmissions > 0
      ? Math.round((hiredCount / totalSubmissions) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Placements & Reputation</h1>
        <p className="text-muted-foreground">
          Track your successful placements, commissions, and reputation score.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Placements</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{hiredCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Success Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{successRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Earned</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatCents(totalEarned)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">
              {formatCents(totalPending)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Placement History</CardTitle>
        </CardHeader>
        <CardContent>
          {placements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {placements.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      {p.application.candidate.user.name}
                    </TableCell>
                    <TableCell>{p.application.role.title}</TableCell>
                    <TableCell>
                      {p.application.role.company.name}
                    </TableCell>
                    <TableCell>{formatCents(p.commissionCents)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          p.status === "PAID"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {p.createdAt.toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">
              No placements yet. Submit qualified candidates to start building
              your track record.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
