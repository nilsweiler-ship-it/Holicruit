import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { PassFeedbackButton } from "@/components/pipeline/pass-feedback-button";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "HIRING_MANAGER")
    redirect("/login");

  const { applicationId } = await params;

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      candidate: {
        include: { user: { select: { name: true, email: true } } },
      },
      role: true,
    },
  });

  if (!application || application.role.createdById !== session.user.id)
    notFound();

  const breakdown: {
    hardSkills: number;
    softSkills: number;
    experience: number;
    education: number;
  } | null = application.scoreBreakdown
    ? JSON.parse(application.scoreBreakdown)
    : null;

  const hardScore = breakdown ? Math.round(breakdown.hardSkills) : null;
  const softScore = breakdown ? Math.round(breakdown.softSkills) : null;
  const fitPercent = application.matchScore;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header: avatar + name + fit % */}
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 shrink-0 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground">
          {application.candidate.user.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold">{application.candidate.user.name}</p>
          <p className="text-sm text-muted-foreground">{application.candidate.user.email}</p>
        </div>
        {fitPercent !== null && (
          <div className="text-right">
            <span className="text-4xl font-bold tabular-nums">
              {fitPercent}
            </span>
            <span className="text-lg text-muted-foreground">%</span>
            <p className="text-xs text-muted-foreground">fit</p>
          </div>
        )}
      </div>

      {/* Three score tiles */}
      <div className="grid grid-cols-3 gap-3">
        {/* Hard */}
        <div className="rounded-xl border-2 border-foreground/20 px-4 py-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Hard</p>
          <p className="text-2xl font-bold tabular-nums">
            {hardScore ?? "—"}
          </p>
        </div>
        {/* Soft */}
        <div className="rounded-xl border-2 border-foreground/20 px-4 py-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Soft</p>
          <p className="text-2xl font-bold tabular-nums">
            {softScore ?? "—"}
          </p>
        </div>
        {/* Verified */}
        <div className="rounded-xl border-2 border-foreground/20 bg-[#FFE27A] px-4 py-4 text-center">
          <p className="text-xs text-foreground/60 mb-1">Verified</p>
          <p className="text-2xl font-bold tabular-nums">&#10003;</p>
        </div>
      </div>

      {/* Evidence, not claims */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold">Evidence, not claims</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span>&#9874;</span>
            <span>Skill scenario score + recording</span>
          </div>
          <div className="flex items-center gap-2">
            <span>&#129309;</span>
            <span>2 peer endorsements (verified)</span>
          </div>
          <div className="flex items-center gap-2">
            <span>&#128196;</span>
            <span>Portfolio &amp; work samples</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button asChild className="flex-1 gap-2">
          <Link href="/dashboard/messages">
            <MessageCircle className="h-4 w-4" />
            Open direct chat
          </Link>
        </Button>
        <PassFeedbackButton applicationId={application.id} />
      </div>
    </div>
  );
}
