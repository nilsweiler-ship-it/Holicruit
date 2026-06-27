import Link from "next/link";
import { Plus, Briefcase, Wand2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/persona";
import { Button } from "@/components/ui/button";

/**
 * Roles list — every opening the hiring manager owns, each linking into its
 * pipeline. A prominent "Post a role" entry point sits in the header.
 */
export default async function RolesPage() {
  const user = await requireUser();
  const openings = await prisma.opening.findMany({
    where: { company: { ownerId: user.id } },
    include: { company: true, _count: { select: { matches: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Roles</h1>
          <p className="text-sm text-muted-foreground">Openings you own and their matches.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/hiring-manager/roles/import">
              <Wand2 className="size-4" />
              Import a job ad
            </Link>
          </Button>
          <Button asChild>
            <Link href="/hiring-manager/roles/new">
              <Plus className="size-4" />
              Post a role
            </Link>
          </Button>
        </div>
      </header>

      {openings.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-10 text-center">
          <Briefcase className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Post your first role to start matching.
          </p>
          <Button asChild>
            <Link href="/hiring-manager/roles/new">
              <Plus className="size-4" />
              Post a role
            </Link>
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {openings.map((o) => (
            <li key={o.id}>
              <Link
                href={`/hiring-manager/pipeline?opening=${o.id}`}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-accent"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">{o.title}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {o.company.name}
                    {o.location ? ` · ${o.location}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-medium text-foreground">
                  {o._count.matches} matched
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
