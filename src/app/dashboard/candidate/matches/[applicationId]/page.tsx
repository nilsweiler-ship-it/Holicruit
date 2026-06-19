import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Building2,
  Handshake,
} from "lucide-react";

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") redirect("/login");

  const { applicationId } = await params;

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      role: {
        include: {
          company: { select: { name: true } },
          createdBy: { select: { name: true } },
        },
      },
      skillGaps: true,
    },
  });

  if (!application || application.candidateId !== profile?.id) notFound();

  // Parse score breakdown
  let hardScore: number | null = null;
  let softScore: number | null = null;
  let mutualFit = application.matchScore ?? 0;

  if (application.scoreBreakdown) {
    try {
      const breakdown = JSON.parse(application.scoreBreakdown) as {
        hardSkills: number;
        softSkills: number;
        experience: number;
        education: number;
      };
      hardScore = Math.round(breakdown.hardSkills);
      softScore = Math.round(breakdown.softSkills);
      mutualFit = Math.round(
        breakdown.hardSkills * 0.6 + breakdown.softSkills * 0.4
      );
    } catch {
      // fall back to matchScore
    }
  }

  // Separate skill gaps into strengths and stretches
  const strengths = application.skillGaps.filter((g) => g.status === "MET");
  const stretches = application.skillGaps.filter(
    (g) => g.status === "PARTIAL" || g.status === "MISSING"
  );

  const hiringManagerName =
    application.role.createdBy?.name ?? "Hiring manager";
  const hiringManagerRole = "Hiring Manager";

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/candidate/matches"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to matches
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {application.role.title}{" "}
            <span className="font-normal text-muted-foreground">
              &middot; {application.role.company.name}
            </span>
          </h1>
          <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <MapPin className="h-3.5 w-3.5" />
            Remote
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-4xl font-bold">{mutualFit}%</p>
          <p className="text-sm text-muted-foreground">mutual fit</p>
        </div>
      </div>

      {/* Fit Breakdown panel */}
      <Card className="border-2">
        <CardContent className="pt-0">
          <div className="flex items-start gap-6">
            {/* Left: fit radar placeholder */}
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted">
              <span className="text-xs text-muted-foreground text-center leading-tight">
                fit
                <br />
                radar
              </span>
            </div>

            {/* Right: evidence bullets */}
            <ul className="space-y-2 flex-1 min-w-0">
              {strengths.map((gap) => (
                <li key={gap.id} className="text-sm">
                  &#10003; Strong: {gap.skill}
                </li>
              ))}
              {stretches.map((gap) => (
                <li key={gap.id} className="text-sm text-amber-700">
                  &#9888; Stretch: {gap.skill}
                </li>
              ))}
              {strengths.length === 0 && stretches.length === 0 && (
                <li className="text-sm text-muted-foreground">
                  No skill evidence available yet.
                </li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Direct Line panel */}
      <Card className="border-2 bg-[#FFF8E0]">
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Handshake className="h-5 w-5 text-amber-700" />
            <h2 className="font-bold">
              Direct line to the hiring manager
            </h2>
          </div>
          <p className="text-sm text-foreground/80">
            You&apos;ll talk to{" "}
            <span className="font-medium">{hiringManagerName}</span>,{" "}
            {hiringManagerRole} &mdash; the person you&apos;d actually work
            with. No recruiter relay.
          </p>
          <div className="flex items-center gap-3">
            <Button asChild className="bg-foreground text-background hover:bg-foreground/90">
              <Link href="/dashboard/messages">
                Request intro <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline">
              <Bookmark className="mr-1.5 h-4 w-4" />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gap Summary link */}
      {stretches.length > 0 && (
        <div className="text-center">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/candidate/gaps/${applicationId}`}>
              See full growth report
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
