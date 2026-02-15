import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateProfileSchema } from "@/lib/validations/candidate";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = updateProfileSchema.parse(body);

    const profile = await prisma.candidateProfile.upsert({
      where: { userId: session.user.id },
      update: {
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.skills !== undefined && { skills: JSON.stringify(data.skills) }),
        ...(data.experience !== undefined && {
          experience: JSON.stringify(data.experience),
        }),
        ...(data.education !== undefined && {
          education: JSON.stringify(data.education),
        }),
        ...(data.preferences !== undefined && {
          preferences: JSON.stringify(data.preferences),
        }),
        ...(data.visibility !== undefined && { visibility: data.visibility }),
      },
      create: {
        userId: session.user.id,
        bio: data.bio,
        skills: JSON.stringify(data.skills || []),
        experience: JSON.stringify(data.experience || []),
        education: JSON.stringify(data.education || []),
        preferences: JSON.stringify(data.preferences || {}),
        visibility: data.visibility || "ACTIVE",
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
