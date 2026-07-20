import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/persona";
import { getActivePlan } from "@/lib/services/billing";
import { updateCalibration } from "@/lib/actions/hm";
import { CalibrationFields } from "@/components/pipeline/calibration-fields";
import { LockedFeature } from "@/components/billing/locked-feature";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Calibrate role · Holicruit" };

/**
 * Edit an existing role's calibration (Team+). Saving re-runs matching so the
 * new weighting and pass bar immediately re-rank the pipeline.
 */
export default async function EditCalibrationPage({
  params,
}: {
  params: Promise<{ openingId: string }>;
}) {
  const { openingId } = await params;
  const user = await requireUser();
  const { plan } = await getActivePlan(user.id, "hiring_manager");

  const opening = await prisma.opening.findFirst({
    where: { id: openingId, company: { ownerId: user.id } },
    select: { id: true, title: true, hardWeight: true, passBar: true, company: { select: { name: true } } },
  });
  if (!opening) notFound();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link
          href={`/hiring-manager/pipeline?opening=${opening.id}`}
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to pipeline
        </Link>
        <h1 className="font-serif text-2xl tracking-tight text-foreground">Calibrate: {opening.title}</h1>
        <p className="text-sm text-muted-foreground">
          {opening.company.name} — tune the balance and bar, then we re-rank the pipeline.
        </p>
      </header>

      {plan.calibration ? (
        <form action={updateCalibration.bind(null, opening.id)} className="flex flex-col gap-4">
          <CalibrationFields defaultHard={opening.hardWeight} defaultBar={opening.passBar} />
          <div className="flex">
            <Button type="submit">Save &amp; re-rank pipeline</Button>
          </div>
        </form>
      ) : (
        <LockedFeature
          title="Custom role calibration"
          tier="Team"
          blurb="Weight hard vs. soft skills and set the pass bar for this role, so matching optimizes for what a great hire actually looks like on your team."
          learnMoreHref="/hiring-manager/features/calibration"
        />
      )}
    </div>
  );
}
