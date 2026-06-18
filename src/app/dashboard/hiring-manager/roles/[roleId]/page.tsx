import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { Info } from "lucide-react";

export default async function RoleDetailPage({
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
      company: true,
      applications: {
        include: {
          candidate: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
        },
        orderBy: { matchScore: "desc" },
      },
    },
  });

  if (!role || role.createdById !== session.user.id) notFound();

  // Determine which candidates have messages with this HM
  const candidateUserIds = role.applications.map(
    (app) => app.candidate.user.id
  );

  const messageCounts = candidateUserIds.length > 0
    ? await prisma.message.groupBy({
        by: ["senderId"],
        where: {
          OR: [
            { senderId: { in: candidateUserIds }, receiverId: session.user.id },
            { senderId: session.user.id, receiverId: { in: candidateUserIds } },
          ],
        },
        _count: true,
      })
    : [];

  const userIdsWithMessages = new Set(
    messageCounts.map((m) => m.senderId)
  );
  // Also check if the HM sent messages to the candidate
  const sentMessages = candidateUserIds.length > 0
    ? await prisma.message.groupBy({
        by: ["receiverId"],
        where: {
          senderId: session.user.id,
          receiverId: { in: candidateUserIds },
        },
        _count: true,
      })
    : [];
  for (const m of sentMessages) {
    userIdsWithMessages.add(m.receiverId);
  }

  const totalMatched = role.applications.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold">{role.title}</h1>
          <Badge variant="secondary" className="text-xs">
            {totalMatched} matched
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{role.company.name}</p>
      </div>

      {/* Kanban board */}
      <PipelineBoard
        applications={role.applications.map((app) => ({
          id: app.id,
          candidateName: app.candidate.user.name,
          matchScore: app.matchScore,
          stage: app.stage,
          createdAt: app.createdAt.toISOString(),
          roleId: role.id,
          hasMessages: userIdsWithMessages.has(app.candidate.user.id),
        }))}
        roleId={role.id}
      />

      {/* Footer banner */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 flex items-center gap-3">
        <Info className="h-4 w-4 text-primary shrink-0" />
        <p className="text-sm text-foreground">
          Auto-feedback drafted for everyone you pass &mdash; review &amp; send
          in one click.
        </p>
      </div>
    </div>
  );
}
