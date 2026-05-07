import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "HEADHUNTER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { roleId } = await params;

  const hhProfile = await prisma.headhunterProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!hhProfile) {
    return NextResponse.json(
      { error: "Headhunter profile not found" },
      { status: 400 }
    );
  }

  const role = await prisma.jobRole.findUnique({
    where: { id: roleId },
  });

  if (!role || role.status !== "PUBLISHED") {
    return NextResponse.json(
      { error: "Role not found or not published" },
      { status: 400 }
    );
  }

  if (role.claimedById) {
    return NextResponse.json(
      { error: "Role already claimed" },
      { status: 400 }
    );
  }

  // Quota check: role claims
  const { checkQuota } = await import("@/lib/plans");
  const quota = await checkQuota(session.user.id, "CLAIM_ROLE");
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

  const updated = await prisma.jobRole.update({
    where: { id: roleId },
    data: { claimedById: hhProfile.id },
  });

  return NextResponse.json(updated);
}
