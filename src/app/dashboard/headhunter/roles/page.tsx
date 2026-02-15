import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { ClaimButton } from "./claim-button";

export default async function HeadhunterRolesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "HEADHUNTER") redirect("/login");

  const hhProfile = await prisma.headhunterProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const roles = await prisma.jobRole.findMany({
    where: { status: "PUBLISHED" },
    include: {
      company: { select: { name: true } },
      applications: { select: { id: true } },
      claimedBy: {
        select: { id: true, user: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Browse Roles</h1>
        <p className="text-muted-foreground">
          Find and claim roles to submit candidates
        </p>
      </div>

      {roles.length > 0 ? (
        <div className="grid gap-4">
          {roles.map((role) => {
            const isMyClaim = role.claimedById === hhProfile?.id;
            const isClaimed = !!role.claimedById;
            return (
              <Card key={role.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{role.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {role.company.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isMyClaim && (
                        <Badge className="bg-green-100 text-green-800">
                          Your Claim
                        </Badge>
                      )}
                      {isClaimed && !isMyClaim && (
                        <Badge variant="secondary">Claimed</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {role.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {role.applications.length} applicant
                      {role.applications.length !== 1 ? "s" : ""} — Threshold:{" "}
                      {role.threshold}%
                    </span>
                    <div className="flex gap-2">
                      {!isClaimed && (
                        <ClaimButton roleId={role.id} />
                      )}
                      {isMyClaim && (
                        <Button size="sm" asChild>
                          <Link
                            href={`/dashboard/headhunter/submit/${role.id}`}
                          >
                            Submit Candidate
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            No published roles available at the moment.
          </p>
        </div>
      )}
    </div>
  );
}
