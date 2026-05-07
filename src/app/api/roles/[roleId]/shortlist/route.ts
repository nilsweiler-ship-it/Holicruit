import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logDataAccess } from "@/lib/audit";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { roleId } = await params;

  const role = await prisma.jobRole.findUnique({
    where: { id: roleId },
    select: { threshold: true, companyId: true, claimedById: true },
  });

  if (!role) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }

  // Ownership check
  if (session.user.role === "HIRING_MANAGER") {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { companyId: true },
    });
    if (role.companyId !== user?.companyId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  } else if (session.user.role === "HEADHUNTER") {
    const hhProfile = await prisma.headhunterProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (role.claimedById !== hhProfile?.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  } else {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const applications = await prisma.application.findMany({
    where: {
      roleId,
      matchScore: { gte: role.threshold },
    },
    include: {
      candidate: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
    orderBy: { matchScore: "desc" },
  });

  logDataAccess({
    userId: session.user.id,
    action: "VIEW_CANDIDATE",
    resourceType: "JobRole",
    resourceId: roleId,
    metadata: { shortlistedCount: applications.length },
  });

  // Strip emails for headhunters
  if (session.user.role === "HEADHUNTER") {
    const sanitized = applications.map((app) => ({
      ...app,
      candidate: {
        ...app.candidate,
        user: { name: app.candidate.user.name },
      },
    }));
    return NextResponse.json(sanitized);
  }

  return NextResponse.json(applications);
}
