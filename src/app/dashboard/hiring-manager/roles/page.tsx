import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RoleCard } from "@/components/roles/role-card";

export default async function RolesListPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "HIRING_MANAGER")
    redirect("/login");

  const roles = await prisma.jobRole.findMany({
    where: { createdById: session.user.id },
    include: {
      company: { select: { name: true } },
      applications: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Roles</h1>
          <p className="text-muted-foreground">Manage your open positions</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/hiring-manager/roles/new">Create Role</Link>
        </Button>
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
