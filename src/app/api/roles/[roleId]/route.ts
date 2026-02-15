import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateRoleSchema } from "@/lib/validations/role";

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

  await prisma.jobRole.delete({ where: { id: roleId } });

  return NextResponse.json({ success: true });
}
