import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateApplicationSchema } from "@/lib/validations/application";

export async function GET(
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
      candidate: {
        include: { user: { select: { name: true, email: true } } },
      },
      role: { include: { company: true } },
      skillGaps: true,
    },
  });

  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Ownership check: candidates see own apps, HMs see their company's apps, HHs see their submissions
  if (session.user.role === "CANDIDATE") {
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (application.candidateId !== profile?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else if (session.user.role === "HIRING_MANAGER") {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { companyId: true },
    });
    if (application.role.company.id !== user?.companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else if (session.user.role === "HEADHUNTER") {
    const profile = await prisma.headhunterProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (application.headhunterId !== profile?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.json(application);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { applicationId } = await params;

  try {
    const body = await req.json();
    const data = updateApplicationSchema.parse(body);

    const existing = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { role: { select: { companyId: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Only HMs of the owning company can update stage
    if (session.user.role === "HIRING_MANAGER") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { companyId: true },
      });
      if (existing.role.companyId !== user?.companyId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Append to audit log
    const currentLog = JSON.parse(existing.auditLog);
    currentLog.push({
      timestamp: new Date().toISOString(),
      action: `Stage changed: ${existing.stage} -> ${data.stage}`,
      actor: session.user.name,
    });

    const application = await prisma.application.update({
      where: { id: applicationId },
      data: {
        stage: data.stage,
        auditLog: JSON.stringify(currentLog),
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("Update application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
