import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { getActiveCandidateId } from "@/lib/persona";
import { requireHat } from "@/lib/access";
import { prisma } from "@/lib/db";
import { itemsForSkill } from "@/lib/fixtures/skill-checks";
import {
  nextAttemptAt,
  roleQuizFor,
  SKILL_CHECK_COOLDOWN_MS,
  skillCheckAttemptNeedle,
  toPublicSkillCheckItems,
} from "@/lib/integrity/assessment-attempts";
import { SkillCheckRunner } from "@/components/candidate/skill-check-runner";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Skill check · Holicruit" };

/**
 * Applied skill check — a short work-sample/judgment quiz that turns a claimed
 * hard skill into verified evidence. Measures judgment, not recall, so it holds
 * up in the age of AI. Uses a role's custom assessment when `?opening=` names a
 * role the candidate is matched to and that role requires this skill.
 *
 * Only `{ id, text }` reaches the browser: option scores stay on the server,
 * option order is shuffled per attempt here (seeded, so SSR and hydration
 * agree), and scoring happens by option id in `submitSkillCheck`.
 */
export default async function SkillCheckPage({
  params,
  searchParams,
}: {
  params: Promise<{ skill: string }>;
  searchParams: Promise<{ opening?: string | string[] }>;
}) {
  await requireHat("candidate");
  const candidateId = await getActiveCandidateId();
  const { skill: raw } = await params;
  const { opening } = await searchParams;
  let skill: string;
  try {
    skill = decodeURIComponent(raw).trim().slice(0, 80);
  } catch {
    skill = raw.trim().slice(0, 80);
  }
  if (!skill) skill = "this skill";

  // A custom quiz only for a role this candidate is actually matched to.
  const requested = typeof opening === "string" && opening.length <= 64 ? opening : undefined;
  const match = requested
    ? await prisma.match.findUnique({
        where: { candidateId_openingId: { candidateId, openingId: requested } },
        select: { opening: { select: { quiz: true, requiredHard: true } } },
      })
    : null;
  const roleItems = roleQuizFor(match?.opening, skill);
  const items = roleItems ?? itemsForSkill(skill);
  const openingId = roleItems ? requested : undefined;

  const last = await prisma.scenarioResult.findFirst({
    where: { profileId: candidateId, scores: { contains: skillCheckAttemptNeedle(skill) } },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  const retryAt = nextAttemptAt(last?.createdAt, SKILL_CHECK_COOLDOWN_MS);
  const attemptSeed = `${candidateId}:${skill.toLowerCase()}:${openingId ?? ""}:${last?.createdAt.toISOString() ?? "first"}`;

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
        <h1 className="font-serif text-3xl tracking-tight text-foreground">Skill check: {skill}</h1>
        <p className="text-sm text-muted-foreground">
          {items.length} applied situations · ~4 min. There are no trick facts here — we measure how
          you&apos;d actually handle real work. Using AI is fine; we score your judgment. One attempt per
          skill per day.
        </p>
      </header>

      {retryAt ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Clock className="size-4 text-muted-foreground" />
            You&apos;ve taken this check in the last 24 hours
          </div>
          <p className="text-sm text-muted-foreground">
            You can retake it after{" "}
            <time dateTime={retryAt.toISOString()} className="font-medium text-foreground">
              {retryAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC
            </time>
            . A short break keeps the result about judgment, not memorising the answers.
          </p>
          <Button asChild variant="outline" className="self-start">
            <Link href="/candidate/profile">Back to profile</Link>
          </Button>
        </div>
      ) : (
        <SkillCheckRunner skill={skill} items={toPublicSkillCheckItems(items, attemptSeed)} openingId={openingId} />
      )}
    </div>
  );
}
