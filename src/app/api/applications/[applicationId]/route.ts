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
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
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
      include: {
        candidate: {
          include: { user: { select: { name: true, email: true } } },
        },
        role: { include: { company: { select: { name: true } } } },
      },
      data: {
        stage: data.stage,
        auditLog: JSON.stringify(currentLog),
      },
    });

    // Send email notifications (fire-and-forget)
    try {
      const { sendStageUpdate, sendOfferExtended, sendShortlisted, sendHeadhunterSubmissionUpdate } =
        await import("@/lib/email");
      const candidateEmail = application.candidate.user.email;
      const candidateName = application.candidate.user.name || "Candidate";
      const roleTitle = application.role.title;
      const companyName = application.role.company.name;

      if (data.stage === "SHORTLISTED") {
        sendShortlisted(candidateEmail, roleTitle, companyName);
      } else if (data.stage === "OFFER") {
        sendOfferExtended(candidateEmail, roleTitle, companyName);
      } else {
        sendStageUpdate(candidateEmail, roleTitle, data.stage);
      }

      // Notify headhunter if applicable
      if (application.headhunterId) {
        const hh = await prisma.headhunterProfile.findUnique({
          where: { id: application.headhunterId },
          include: { user: { select: { email: true } } },
        });
        if (hh?.user.email) {
          sendHeadhunterSubmissionUpdate(hh.user.email, candidateName, roleTitle, data.stage);
        }
      }
    } catch {
      // Don't fail the request if email fails
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("Update application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
