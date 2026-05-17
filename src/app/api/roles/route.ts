import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createRoleSchema } from "@/lib/validations/role";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};

  if (session.user.role === "HIRING_MANAGER") {
    where.createdById = session.user.id;
  } else if (session.user.role === "HEADHUNTER") {
    where.status = "PUBLISHED";
  }

  if (status) {
    where.status = status;
  }

  const roles = await prisma.jobRole.findMany({
    where,
    include: {
      company: { select: { name: true } },
      applications: { select: { id: true } },
      claimedBy: { select: { id: true, user: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(roles);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "HIRING_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createRoleSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { companyId: true },
    });

    if (!user?.companyId) {
      return NextResponse.json(
        { error: "No company associated with your account" },
        { status: 400 }
      );
    }

    // Quota check: active roles
    const { checkQuota } = await import("@/lib/plans");
    const quota = await checkQuota(session.user.id, "CREATE_ROLE");
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: "QUOTA_EXCEEDED",
          message: quota.message,
          quota: { current: quota.current, limit: quota.limit },
        },
        { status: 403 }
      );
    }

    const role = await prisma.jobRole.create({
      data: {
        title: data.title,
        description: data.description,
        roleType: data.roleType,
        bounty: data.bounty,
        contractStart: data.contractStart ? new Date(data.contractStart) : null,
        contractEnd: data.contractEnd ? new Date(data.contractEnd) : null,
        rateAmount: data.rateAmount,
        rateType: data.rateType,
        hardSkills: JSON.stringify(data.hardSkills),
        softSkills: JSON.stringify(data.softSkills),
        weights: JSON.stringify(data.weights),
        threshold: data.threshold,
        status: data.status,
        companyId: user.companyId,
        createdById: session.user.id,
      },
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    console.error("Create role error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
