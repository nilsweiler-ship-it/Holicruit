import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
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
      {/* Back link */}
      <Link
        href="/dashboard/candidate/matches"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Matches
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">
          Not this time &mdash; here&apos;s exactly why
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {application.role.title} &middot;{" "}
          {application.role.company.name} &middot; closed
        </p>
      </div>

      {/* Two-column skill panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hard skills */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Hard skills</CardTitle>
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
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Soft skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {softGaps.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No soft skill data for this role.
              </p>
            )}
            {softGaps.map((gap) => (
              <SkillBar key={gap.id} gap={gap} />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* CTA panel */}
      {gapCount > 0 && (
        <div className="rounded-xl border-2 bg-[#FFE27A] p-6 space-y-3">
          <h2 className="text-base font-bold">
            &#127919; Close the {gapCount === 1 ? "one gap" : `${gapCount} gaps`}{" "}
            &rarr; re-match next time
          </h2>
          <p className="text-sm text-foreground/80">
            {gapCount} short{" "}
            {gapCount === 1 ? "program matches" : "programs match"}{" "}
            &lsquo;{primaryGapSkill}&rsquo;. Finish one and you&apos;d
            clear the bar for{" "}
            {matchingRoleCount > 0 ? matchingRoleCount : "several"} open{" "}
            {matchingRoleCount === 1 ? "role" : "roles"}.
          </p>
          <Button
            asChild
            className="w-full bg-foreground text-background hover:bg-foreground/90"
          >
            <Link href="/dashboard/candidate/progress">
              See growth paths <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SkillBar — renders a You vs Role bar comparison
   ───────────────────────────────────────────── */

interface SkillGapRow {
  id: string;
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  status: string;
  category: string;
}

function SkillBar({ gap }: { gap: SkillGapRow }) {
  const maxLevel = 5;
  const youPct = (gap.currentLevel / maxLevel) * 100;
  const rolePct = (gap.requiredLevel / maxLevel) * 100;

  const isMet = gap.status === "MET";
  const isAboveBar = gap.currentLevel >= gap.requiredLevel;

  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium">{gap.skill}</span>

      {/* "You" bar — solid */}
      <div className="flex items-center gap-2">
        <span className="w-8 shrink-0 text-[11px] text-muted-foreground">
          You
        </span>
        <div className="h-3 w-full rounded-full bg-muted">
          <div
            className="h-3 rounded-full bg-foreground/80"
            style={{ width: `${youPct}%` }}
          />
        </div>
      </div>

      {/* "Role" bar — hatched pattern */}
      <div className="flex items-center gap-2">
        <span className="w-8 shrink-0 text-[11px] text-muted-foreground">
          Role
        </span>
        <div className="h-3 w-full rounded-full bg-muted">
          <div
            className="h-3 rounded-full border"
            style={{
              width: `${rolePct}%`,
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)",
            }}
          />
        </div>
      </div>

      {/* Status callout */}
      {isMet || isAboveBar ? (
        <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-green-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Above bar &mdash; a strength
        </span>
      ) : (
        <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-amber-600">
          <AlertTriangle className="h-3.5 w-3.5" />
          Gap: {gap.skill}
        </span>
      )}
    </div>
  );
}
