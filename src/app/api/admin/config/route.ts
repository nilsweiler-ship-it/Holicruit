import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateConfigSchema = z.object({
  shortlistFeeCents: z.number().int().min(0).optional(),
  hireFeePermanentCents: z.number().int().min(0).optional(),
  hireFeeContractShort: z.number().int().min(0).optional(),
  hireFeeContractMedium: z.number().int().min(0).optional(),
  hireFeeContractLong: z.number().int().min(0).optional(),
  defaultHHSplitPct: z.number().int().min(0).max(100).optional(),
  attributionWindowDays: z.number().int().min(30).max(730).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let config = await prisma.platformConfig.findFirst();
  if (!config) {
    config = await prisma.platformConfig.create({ data: {} });
  }

  return NextResponse.json(config);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = updateConfigSchema.parse(body);

    let config = await prisma.platformConfig.findFirst();
    if (!config) {
      config = await prisma.platformConfig.create({ data: {} });
    }

    const updated = await prisma.platformConfig.update({
      where: { id: config.id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
