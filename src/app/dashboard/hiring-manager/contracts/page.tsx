import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ContractList } from "@/components/contracts/contract-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ContractsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "HIRING_MANAGER")
    redirect("/login");

  const contracts = await prisma.contract.findMany({
    where: { role: { createdById: session.user.id } },
    include: {
      role: { select: { title: true, company: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const active = contracts.filter((c) => c.status === "ACTIVE" || c.status === "EXTENDED");
  const completed = contracts.filter((c) => c.status === "COMPLETED");
  const expiringSoon = active.filter((c) => {
    const daysLeft = Math.ceil(
      (c.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysLeft <= 14 && daysLeft > 0;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contracts</h1>
        <p className="text-muted-foreground">
          Manage active and completed contractor/interim engagements.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Contracts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{active.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Expiring Within 14 Days</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{expiringSoon.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{completed.length}</p>
          </CardContent>
        </Card>
      </div>

      {expiringSoon.length > 0 && (
        <Card className="border-amber-300">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              Expiring Soon
              <Badge className="bg-amber-100 text-amber-800">{expiringSoon.length}</Badge>
            </CardTitle>
            <CardDescription>
              These contracts end within 14 days. Consider extending or completing them.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContractList
              contracts={expiringSoon.map((c) => ({
                id: c.id,
                roleTitle: c.role.title,
                candidateId: c.candidateId,
                status: c.status,
                startDate: c.startDate.toISOString(),
                endDate: c.endDate.toISOString(),
                rateAmount: c.rateAmount,
                rateType: c.rateType,
                extensions: JSON.parse(c.extensions),
              }))}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          <ContractList
            contracts={contracts.map((c) => ({
              id: c.id,
              roleTitle: c.role.title,
              candidateId: c.candidateId,
              status: c.status,
              startDate: c.startDate.toISOString(),
              endDate: c.endDate.toISOString(),
              rateAmount: c.rateAmount,
              rateType: c.rateType,
              extensions: JSON.parse(c.extensions),
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
