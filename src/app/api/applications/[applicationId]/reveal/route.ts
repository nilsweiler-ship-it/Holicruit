import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logDataAccess } from "@/lib/audit";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "HIRING_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { applicationId } = await params;

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { role: { select: { companyId: true, threshold: true } } },
  });

  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Verify company ownership
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true },
  });

  if (application.role.companyId !== user?.companyId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only allow revealing for candidates above threshold
  if (
    application.matchScore === null ||
    application.matchScore < application.role.threshold
  ) {
    return NextResponse.json(
      { error: "Cannot reveal identity for candidates below threshold" },
      { status: 403 }
    );
  }

  if (application.identityRevealed) {
    return NextResponse.json({ error: "Already revealed" }, { status: 400 });
  }

  try {
    // Append to audit log
    const currentLog = JSON.parse(application.auditLog);
    currentLog.push({
      timestamp: new Date().toISOString(),
      action: "Identity revealed",
      actor: session.user.id,
    });

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        identityRevealed: true,
        revealedAt: new Date(),
        revealedById: session.user.id,
        auditLog: JSON.stringify(currentLog),
      },
      include: {
        candidate: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    });

    logDataAccess({
      userId: session.user.id,
      action: "REVEAL_IDENTITY",
      resourceType: "Application",
      resourceId: applicationId,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Reveal error:", err);
    return NextResponse.json(
      { error: "Failed to reveal identity", detail: String(err) },
      { status: 500 }
    );
  }
}
