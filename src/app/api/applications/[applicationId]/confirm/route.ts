import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { triggerMilestone, createPlacement } from "@/lib/milestones";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { applicationId } = await params;

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      role: true,
      candidate: { select: { userId: true } },
    },
  });

  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (application.stage !== "HIRED" && application.stage !== "OFFER") {
    return NextResponse.json(
      { error: "Application must be at OFFER or HIRED stage to confirm" },
      { status: 400 }
    );
  }

  const isHM =
    session.user.role === "HIRING_MANAGER" &&
    application.role.createdById === session.user.id;
  const isCandidate =
    session.user.role === "CANDIDATE" &&
    application.candidate.userId === session.user.id;

  if (!isHM && !isCandidate) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updateData: Record<string, boolean> = {};
  if (isHM) updateData.hmConfirmed = true;
  if (isCandidate) updateData.candidateConfirmed = true;

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: updateData,
  });

  const hmConfirmed = isHM ? true : updated.hmConfirmed;
  const candidateConfirmed = isCandidate ? true : updated.candidateConfirmed;

  if (hmConfirmed && candidateConfirmed) {
    if (application.stage !== "HIRED") {
      const currentLog = JSON.parse(application.auditLog);
      currentLog.push({
        timestamp: new Date().toISOString(),
        action: "Hire confirmed by both parties",
        actor: "System",
      });

      await prisma.application.update({
        where: { id: applicationId },
        data: { stage: "HIRED", auditLog: JSON.stringify(currentLog) },
      });
    }

    await triggerMilestone(application.roleId, "HIRE");

    if (application.headhunterId) {
      await createPlacement(applicationId);
    }
  }

  return NextResponse.json({
    hmConfirmed,
    candidateConfirmed,
    fullyConfirmed: hmConfirmed && candidateConfirmed,
  });
}
