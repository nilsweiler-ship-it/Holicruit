import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getActiveCandidateId } from "@/lib/persona";
import { itemsForSkill } from "@/lib/fixtures/skill-checks";
import { SkillCheckRunner } from "@/components/candidate/skill-check-runner";

export const metadata: Metadata = { title: "Skill check · Holicruit" };

/**
 * Applied skill check — a short work-sample/judgment quiz that turns a claimed
 * hard skill into verified evidence. Measures judgment, not recall, so it holds
 * up in the age of AI.
 */
export default async function SkillCheckPage({
  params,
}: {
  params: Promise<{ skill: string }>;
}) {
  await getActiveCandidateId();
  const { skill: raw } = await params;
  const skill = decodeURIComponent(raw);
  const items = itemsForSkill(skill);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link
          href="/candidate/profile"
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Profile
        </Link>
        <h1 className="font-serif text-2xl tracking-tight text-foreground">
          Skill check: {skill}
        </h1>
        <p className="text-sm text-muted-foreground">
          {items.length} applied situations · ~4 min. There are no trick facts here — we measure how
          you&apos;d actually handle real work. Using AI is fine; we score your judgment.
        </p>
      </header>

      <SkillCheckRunner skill={skill} items={items} />
    </div>
  );
}
