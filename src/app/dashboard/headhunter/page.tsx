import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const ACTIVE_STAGES = ["APPLIED", "SHORTLISTED", "INTERVIEW"];

function stagePill(stage: string) {
  switch (stage) {
    case "INTERVIEW":
      return <Badge variant="outline">interview</Badge>;
    case "OFFER":
      return (
        <Badge variant="default" className="bg-primary text-primary-foreground">
          offer
        </Badge>
      );
    case "HIRED":
      return (
        <Badge variant="default" className="bg-primary text-primary-foreground">
          hired
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="text-muted-foreground">
          {stage.toLowerCase()}
        </Badge>
      );
  }
}

export default async function HeadhunterDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "HEADHUNTER") redirect("/login");

  const profile = await prisma.headhunterProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) redirect("/onboarding/headhunter");

  // Fetch all applications submitted by this headhunter with role + company + candidate
  const applications = await prisma.application.findMany({
    where: { headhunterId: profile.id },
    include: {
      role: { include: { company: true } },
      candidate: { include: { user: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Stat: active intros (APPLIED, SHORTLISTED, INTERVIEW)
  const activeIntros = applications.filter((a) =>
    ACTIVE_STAGES.includes(a.stage)
  );
  const activeCount = activeIntros.length;

  // Stat: in interview
  const interviewCount = applications.filter(
    (a) => a.stage === "INTERVIEW"
  ).length;

  // Stat: earned from placements
  const placements = await prisma.placement.findMany({
    where: { headhunterId: profile.id },
  });
  const totalEarnedCents = placements.reduce(
    (sum, p) => sum + p.commissionCents,
    0
  );
  const totalEarnedEur = (totalEarnedCents / 100).toLocaleString("en-IE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // Active introductions: applications in active or offer stages
  const introStages = ["APPLIED", "SHORTLISTED", "INTERVIEW", "OFFER"];
  const activeIntroductions = applications.filter((a) =>
    introStages.includes(a.stage)
  );

  return (
    <div className="space-y-8">
      {/* Stat tiles */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Active intros */}
        <div className="rounded-xl border-2 px-4 py-5 text-center">
          <p className="text-4xl font-bold tabular-nums leading-none">{activeCount}</p>
          <p className="text-xs text-muted-foreground mt-2">active intros</p>
        </div>

        {/* In interview */}
        <div className="rounded-xl border-2 px-4 py-5 text-center">
          <p className="text-4xl font-bold tabular-nums leading-none">{interviewCount}</p>
          <p className="text-xs text-muted-foreground mt-2">in interview</p>
        </div>

        {/* Earned — novel feature yellow */}
        <div className="rounded-xl border-2 bg-[#FFE27A] px-4 py-5 text-center">
          <p className="text-4xl font-bold tabular-nums leading-none">
            &euro;{totalEarnedEur}
          </p>
          <p className="text-xs text-foreground/60 mt-2">earned on hires</p>
        </div>
      </div>

      {/* Where you add value */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Where you add value</h2>

        {activeIntroductions.length > 0 ? (
          <div className="space-y-2">
            {activeIntroductions.map((app) => (
              <div
                key={app.id}
                className="flex items-center gap-4 rounded-xl border-2 px-4 py-3"
              >
                {/* Avatar circle */}
                <div className="h-9 w-9 shrink-0 rounded-full bg-muted" />

                {/* Intro details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {app.candidate.user.name} &rarr; {app.role.title}
                    {app.role.company?.name
                      ? ` @ ${app.role.company.name}`
                      : ""}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    you spotted the soft-skill fit&hellip;
                  </p>
                </div>

                {/* Stage pill */}
                <div className="shrink-0">{stagePill(app.stage)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border px-4 py-8 text-center">
            <p className="text-muted-foreground">
              No active introductions yet.{" "}
              <Link
                href="/dashboard/headhunter/roles"
                className="underline hover:text-primary"
              >
                Browse roles to get started
              </Link>
            </p>
          </div>
        )}
      </section>

      {/* Footer */}
      <div className="border-t border-dashed pt-3 px-1">
        <p className="text-sm text-muted-foreground">
          &#x1F4B0; No retainers, no exclusivity. A success fee only when your
          intro gets hired.
        </p>
      </div>
    </div>
  );
}
