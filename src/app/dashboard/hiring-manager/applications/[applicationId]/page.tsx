import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageCircle, Wrench, Users, FileText, Check } from "lucide-react";
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
        <div className="h-14 w-14 shrink-0 rounded-full bg-muted" />
        <div className="flex-1 min-w-0">
          <div className="bg-muted h-4 w-36 rounded mb-2" />
          <div className="bg-muted h-3 w-48 rounded" />
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
        <div className="rounded-lg border px-4 py-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Hard</p>
          <p className="text-2xl font-bold tabular-nums">
            {hardScore ?? "—"}
          </p>
        </div>
        {/* Soft */}
        <div className="rounded-lg border px-4 py-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Soft</p>
          <p className="text-2xl font-bold tabular-nums">
            {softScore ?? "—"}
          </p>
        </div>
        {/* Verified */}
        <div className="rounded-lg bg-amber-100 px-4 py-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Check className="h-3.5 w-3.5 text-amber-700" />
            <p className="text-xs text-amber-700">Verified</p>
          </div>
          <p className="text-2xl font-bold tabular-nums text-amber-900">
            &#10003;
          </p>
        </div>
      </div>

      {/* Evidence, not claims */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold">Evidence, not claims</h2>
        <ul className="space-y-3">
          <li className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm">Skill scenario score + recording</span>
          </li>
          <li className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm">2 peer endorsements (verified)</span>
          </li>
          <li className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm">Portfolio &amp; work samples</span>
          </li>
        </ul>
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
