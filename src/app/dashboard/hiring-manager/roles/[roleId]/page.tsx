import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";

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
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-bold">
          {role.title} &mdash; your pipeline
        </h1>
        <span className="text-sm text-muted-foreground">
          {totalMatched} matched
        </span>
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

      {/* Auto-feedback footer */}
      <div className="border-t border-dashed pt-3 px-1">
        <p className="text-sm text-muted-foreground">
          &#9889; Auto-feedback drafted for everyone you pass &mdash; review
          &amp; send in one click.
        </p>
      </div>
    </div>
  );
}
