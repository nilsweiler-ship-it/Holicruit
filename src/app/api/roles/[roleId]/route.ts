import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateRoleSchema } from "@/lib/validations/role";
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
    include: {
      company: true,
      applications: {
        include: {
          candidate: { include: { user: { select: { name: true, email: true } } } },
          skillGaps: true,
        },
        orderBy: { matchScore: "desc" },
      },
      claimedBy: { include: { user: { select: { name: true } } } },
    },
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
    // Other roles (CANDIDATE, etc.) cannot access role details with applications
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  logDataAccess({
    userId: session.user.id,
    action: "VIEW_CANDIDATE",
    resourceType: "JobRole",
    resourceId: role.id,
    metadata: { applicationCount: role.applications.length },
  });

  // Strip emails from response for headhunters
  if (session.user.role === "HEADHUNTER") {
    const sanitized = {
      ...role,
      applications: role.applications.map((app) => ({
        ...app,
        candidate: {
          ...app.candidate,
          user: { name: app.candidate.user.name },
        },
      })),
    };
    return NextResponse.json(sanitized);
  }

  return NextResponse.json(role);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "HIRING_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { roleId } = await params;

  const existing = await prisma.jobRole.findUnique({
    where: { id: roleId },
  });

  if (!existing || existing.createdById !== session.user.id) {
    return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const data = updateRoleSchema.parse(body);

    const role = await prisma.jobRole.update({
      where: { id: roleId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.hardSkills !== undefined && { hardSkills: JSON.stringify(data.hardSkills) }),
        ...(data.softSkills !== undefined && { softSkills: JSON.stringify(data.softSkills) }),
        ...(data.weights !== undefined && { weights: JSON.stringify(data.weights) }),
        ...(data.threshold !== undefined && { threshold: data.threshold }),
        ...(data.status !== undefined && { status: data.status }),
      },
    });

    return NextResponse.json(role);
  } catch (error) {
    console.error("Update role error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "HIRING_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { roleId } = await params;

  const existing = await prisma.jobRole.findUnique({
    where: { id: roleId },
  });

  if (!existing || existing.createdById !== session.user.id) {
    return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });
  }

  // Delete related records first (skill gaps → applications → role)
  await prisma.skillGap.deleteMany({ where: { application: { roleId } } });
  await prisma.application.deleteMany({ where: { roleId } });
  await prisma.jobRole.delete({ where: { id: roleId } });

  return NextResponse.json({ success: true });
}
