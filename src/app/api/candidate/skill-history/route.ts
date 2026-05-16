import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const snapshots = await prisma.skillSnapshot.findMany({
    where: { candidateId: profile.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(snapshots);
}

export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, skills: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const snapshot = await prisma.skillSnapshot.create({
    data: {
      candidateId: profile.id,
      skills: profile.skills,
    },
  });

  return NextResponse.json(snapshot, { status: 201 });
}
