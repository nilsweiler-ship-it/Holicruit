import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
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
import { SearchInput } from "@/components/search-input";

export default async function AdminRolesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");
  const { q } = await searchParams;
  const query = q?.trim().toLowerCase() || "";

  const roles = await prisma.jobRole.findMany({
    where: query
      ? {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
          ],
        }
      : undefined,
    include: {
      company: { select: { name: true } },
      createdBy: { select: { name: true, email: true } },
      applications: { select: { id: true, matchScore: true, stage: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">All Roles</h1>
          <p className="text-muted-foreground">
            View and monitor all job roles on the platform
          </p>
        </div>
        <div className="w-64">
          <SearchInput placeholder="Search roles..." />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {query ? `Search results for "${query}"` : "All Roles"} ({roles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applicants</TableHead>
                <TableHead>Avg Score</TableHead>
                <TableHead>Threshold</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => {
                const avgScore =
                  role.applications.length > 0
                    ? Math.round(
                        role.applications.reduce(
                          (sum, a) => sum + (a.matchScore || 0),
                          0
                        ) / role.applications.length
                      )
                    : null;

                return (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.title}</TableCell>
                    <TableCell>{role.company.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {role.createdBy.name || role.createdBy.email}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>{role.applications.length}</TableCell>
                    <TableCell>
                      {avgScore !== null ? `${avgScore}%` : "—"}
                    </TableCell>
                    <TableCell>{role.threshold}%</TableCell>
                  </TableRow>
                );
              })}
              {roles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No roles found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
