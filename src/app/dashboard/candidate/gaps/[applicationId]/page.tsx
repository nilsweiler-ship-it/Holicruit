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
import { ArrowLeft, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function CandidateGapReportPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") redirect("/login");

  const { applicationId } = await params;

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, skills: true },
  });

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      role: { include: { company: { select: { name: true } } } },
      skillGaps: true,
    },
  });

  if (!application || application.candidateId !== profile?.id) notFound();

  const hardGaps = application.skillGaps.filter((g) => g.category === "HARD");
  const softGaps = application.skillGaps.filter((g) => g.category === "SOFT");

  // Collect gap skill names for the CTA query
  const gapSkillNames = application.skillGaps
    .filter((g) => g.status === "MISSING" || g.status === "PARTIAL")
    .map((g) => g.skill);

  // Count published roles that mention any of the gap skills
  let matchingRoleCount = 0;
  if (gapSkillNames.length > 0) {
    const publishedRoles = await prisma.jobRole.findMany({
      where: { status: "PUBLISHED" },
      select: { hardSkills: true, softSkills: true },
    });

    const lowerGapNames = gapSkillNames.map((s) => s.toLowerCase());

    matchingRoleCount = publishedRoles.filter((role) => {
      const hard: Array<{ name: string }> = JSON.parse(role.hardSkills);
      const soft: Array<{ name: string }> = JSON.parse(role.softSkills);
      const allSkills = [...hard, ...soft];
      return allSkills.some((s) =>
        lowerGapNames.includes(s.name.toLowerCase())
      );
    }).length;
  }

  const gapCount = gapSkillNames.length;
  const primaryGapSkill = gapSkillNames[0] ?? "your gap skills";

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Not this time — here&apos;s exactly why
        </h1>
        <p className="text-muted-foreground mt-1">
          {application.role.title} &middot; {application.role.company.name} &middot;{" "}
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
            closed
          </span>
        </p>

        <Button variant="ghost" size="sm" className="mt-3 -ml-2 gap-1.5" asChild>
          <Link href="/dashboard/candidate/matches">
            <ArrowLeft className="h-4 w-4" />
            Back to Matches
          </Link>
        </Button>
      </div>

      {/* ── Two-column skill panels ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hard skills */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hard skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {hardGaps.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No hard skill data for this role.
              </p>
            )}
            {hardGaps.map((gap) => (
              <SkillBar key={gap.id} gap={gap} />
            ))}
          </CardContent>
        </Card>

        {/* Soft skills */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Soft skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {softGaps.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No soft skill data for this role.
              </p>
            )}
            {softGaps.map((gap) => (
              <SkillBar key={gap.id} gap={gap} showStrength />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── CTA panel ── */}
      {gapCount > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                Close the {gapCount === 1 ? "one gap" : `${gapCount} gaps`} — re-match
                next time
              </h2>
              <p className="text-sm text-muted-foreground">
                {gapCount} short{" "}
                {gapCount === 1 ? "program matches" : "programs match"}{" "}
                {primaryGapSkill} at scale. Finish one and you&apos;d clear the bar
                for {matchingRoleCount > 0 ? matchingRoleCount : "several"} open{" "}
                {matchingRoleCount === 1 ? "role" : "roles"}.
              </p>
            </div>
            <Button asChild className="shrink-0">
              <Link href="/dashboard/candidate/matches">See growth paths</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Internal helper — renders a single skill row
   ───────────────────────────────────────────── */

interface SkillGapRow {
  id: string;
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  status: string;
  category: string;
}

function SkillBar({
  gap,
  showStrength = false,
}: {
  gap: SkillGapRow;
  showStrength?: boolean;
}) {
  const youWidth = `${(gap.currentLevel / 5) * 100}%`;
  const roleWidth = `${(gap.requiredLevel / 5) * 100}%`;

  const isMet = gap.status === "MET";
  const isAboveBar = gap.currentLevel >= gap.requiredLevel;

  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium">{gap.skill}</span>

      {/* "You" bar */}
      <div className="flex items-center gap-2">
        <span className="w-8 shrink-0 text-[11px] text-muted-foreground">You</span>
        <div className="h-3 w-full rounded-full bg-muted">
          <div
            className="h-3 rounded-full bg-primary"
            style={{ width: youWidth }}
          />
        </div>
      </div>

      {/* "Role" bar — hatched */}
      <div className="flex items-center gap-2">
        <span className="w-8 shrink-0 text-[11px] text-muted-foreground">Role</span>
        <div className="h-3 w-full rounded-full bg-muted">
          <div
            className="h-3 rounded-full bg-primary/30"
            style={{
              width: roleWidth,
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 4px)",
            }}
          />
        </div>
      </div>

      {/* Status pill */}
      {isMet ? (
        showStrength && isAboveBar ? (
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-200">
            <CheckCircle2 className="h-3 w-3" />
            Above bar — a strength
          </span>
        ) : (
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-200">
            <CheckCircle2 className="h-3 w-3" />
            Met
          </span>
        )
      ) : (
        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          <AlertTriangle className="h-3 w-3" />
          Gap: {gap.skill}
        </span>
      )}
    </div>
  );
}
