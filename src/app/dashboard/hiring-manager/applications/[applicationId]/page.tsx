import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  User,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Users,
  Briefcase,
} from "lucide-react";
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

  // Evidence items (placeholder since we don't have evidence data model yet)
  const evidenceItems = [
    {
      icon: FileText,
      label: "Skill scenario score + recording",
      available: true,
    },
    {
      icon: Users,
      label: "Peer endorsements (verified)",
      available: true,
    },
    {
      icon: Briefcase,
      label: "Portfolio & work samples",
      available: true,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header: avatar + name + fit % */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted">
          <User className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">
            {application.candidate.user.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {application.candidate.user.email} &middot; Applied for{" "}
            {application.role.title}
          </p>
        </div>
        {fitPercent !== null && (
          <div className="text-right">
            <span className="text-4xl font-bold tabular-nums text-primary">
              {fitPercent}
            </span>
            <span className="text-lg text-muted-foreground">%</span>
            <p className="text-xs text-muted-foreground">Fit</p>
          </div>
        )}
      </div>

      {/* Score tiles */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Hard</p>
            <p className="text-2xl font-bold tabular-nums">
              {hardScore ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Soft</p>
            <p className="text-2xl font-bold tabular-nums">
              {softScore ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Verified</p>
            <div className="flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evidence list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Evidence, not claims
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {evidenceItems.map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-sm">{item.label}</span>
                {item.available && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    Available
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
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
