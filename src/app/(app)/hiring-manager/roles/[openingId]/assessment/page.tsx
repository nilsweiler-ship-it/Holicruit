import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/persona";
import { getActivePlan } from "@/lib/services/billing";
import { saveRoleQuiz } from "@/lib/actions/hm";
import { itemsForSkill, type SkillCheckItem } from "@/lib/fixtures/skill-checks";
import { QuizEditor } from "@/components/pipeline/quiz-editor";
import { LockedFeature } from "@/components/billing/locked-feature";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Role assessment · Holicruit" };

/**
 * Customize a role's applied skill assessment (Scale). Starts from the
 * pre-populated, judgment-based bank; the HM edits/adds items. Candidates take
 * it to turn a claimed skill into verified evidence.
 */
export default async function RoleAssessmentPage({
  params,
}: {
  params: Promise<{ openingId: string }>;
}) {
  const { openingId } = await params;
  const user = await requireUser();
  const { plan } = await getActivePlan(user.id, "hiring_manager");

  const opening = await prisma.opening.findFirst({
    where: { id: openingId, company: { ownerId: user.id } },
    select: { id: true, title: true, requiredHard: true, quiz: true, company: { select: { name: true } } },
  });
  if (!opening) notFound();

  const header = (
    <header className="flex flex-col gap-2">
      <Link
        href={`/hiring-manager/pipeline?opening=${opening.id}`}
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to pipeline
      </Link>
      <h1 className="font-serif text-2xl tracking-tight text-foreground">
        Assessment: {opening.title}
      </h1>
      <p className="text-sm text-muted-foreground">
        {opening.company.name} — applied, judgment-based items candidates can&apos;t Google. Edit the
        starter set or add your own.
      </p>
    </header>
  );

  if (!plan.customAssessments) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <LockedFeature
          title="Company-specific assessments"
          tier="Scale"
          blurb="Go beyond the universal bank with role- and company-specific applied assessments — measure the exact judgment that predicts success on your team."
          learnMoreHref="/hiring-manager/features/assessments"
        />
      </div>
    );
  }

  const requiredHard = JSON.parse(opening.requiredHard) as string[];
  let initial: SkillCheckItem[] = [];
  if (opening.quiz) {
    try {
      initial = JSON.parse(opening.quiz) as SkillCheckItem[];
    } catch {
      initial = [];
    }
  }
  if (initial.length === 0) initial = itemsForSkill(requiredHard[0] ?? opening.title);

  return (
    <div className="flex flex-col gap-6">
      {header}
      <form action={saveRoleQuiz.bind(null, opening.id)} className="flex flex-col gap-4">
        <QuizEditor initial={initial} />
        <div className="flex">
          <Button type="submit">Save assessment</Button>
        </div>
      </form>
    </div>
  );
}
