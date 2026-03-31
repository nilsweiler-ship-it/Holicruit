import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RoleCard } from "@/components/roles/role-card";
import { SearchInput } from "@/components/search-input";

export default async function RolesListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "HIRING_MANAGER")
    redirect("/login");
  const { q } = await searchParams;
  const query = q?.trim().toLowerCase() || "";

  const roles = await prisma.jobRole.findMany({
    where: {
      createdById: session.user.id,
      ...(query && {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
        ],
      }),
    },
    include: {
      company: { select: { name: true } },
      applications: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Roles</h1>
          <p className="text-muted-foreground">Manage your open positions</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-64">
            <SearchInput placeholder="Search roles..." />
          </div>
          <Button asChild>
            <Link href="/dashboard/hiring-manager/roles/new">Create Role</Link>
          </Button>
        </div>
      </div>

      {roles.length > 0 ? (
        <div className="grid gap-4">
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              role={{
                ...role,
                createdAt: role.createdAt.toISOString(),
              }}
              href={`/dashboard/hiring-manager/roles/${role.id}`}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground mb-4">
            You haven&apos;t created any roles yet.
          </p>
          <Button asChild>
            <Link href="/dashboard/hiring-manager/roles/new">
              Create your first role
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
