import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
    select: { threshold: true },
  });

  if (!role) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
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

  return NextResponse.json(applications);
}
