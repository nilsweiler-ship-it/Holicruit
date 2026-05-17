import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createContractSchema = z.object({
  roleId: z.string().min(1),
  candidateId: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  rateAmount: z.number().int().min(0),
  rateType: z.enum(["HOURLY", "DAILY"]),
});

const updateContractSchema = z.object({
  status: z.enum(["ACTIVE", "EXTENDED", "COMPLETED", "TERMINATED"]).optional(),
  extendTo: z.string().optional(),
  extensionReason: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const roleId = searchParams.get("roleId");

  const where: Record<string, unknown> = {};
  if (roleId) where.roleId = roleId;

  if (session.user.role === "HIRING_MANAGER") {
    where.role = { createdById: session.user.id };
  }

  const contracts = await prisma.contract.findMany({
    where,
    include: {
      role: { select: { title: true, company: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(contracts);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "HIRING_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createContractSchema.parse(body);

    const role = await prisma.jobRole.findUnique({
      where: { id: data.roleId },
    });

    if (!role || role.createdById !== session.user.id) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    const contract = await prisma.contract.create({
      data: {
        roleId: data.roleId,
        candidateId: data.candidateId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        rateAmount: data.rateAmount,
        rateType: data.rateType,
      },
    });

    return NextResponse.json(contract, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "HIRING_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...rest } = body;
    const data = updateContractSchema.parse(rest);

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!contract || contract.role.createdById !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (data.status) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;

    if (data.extendTo) {
      const extensions = JSON.parse(contract.extensions);
      extensions.push({
        extendedTo: data.extendTo,
        reason: data.extensionReason || "",
        timestamp: new Date().toISOString(),
      });
      updateData.extensions = JSON.stringify(extensions);
      updateData.endDate = new Date(data.extendTo);
      updateData.status = "EXTENDED";
    }

    const updated = await prisma.contract.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
