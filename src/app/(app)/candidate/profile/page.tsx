import type { Metadata } from "next";
import { scenarioService } from "@/lib/services/scenario";
import { getActiveWorld } from "@/lib/persona";
import { PersonAvatar } from "@/components/people/person-avatar";
import { CompletenessRing } from "@/components/people/completeness-ring";
import { SkillChips } from "@/components/candidate/skill-chips";
import { SoftSkillBars } from "@/components/candidate/soft-skill-bars";
import { ScenarioCta } from "@/components/candidate/scenario-cta";

export const metadata: Metadata = { title: "Your profile · Holicruit" };

/**
 * 2.1 — Candidate holistic profile builder. Captures hard skills, *verified*
 * skills, and soft skills measured objectively (via the scenario assessment).
 */
export default async function CandidateProfilePage() {
  const world = await getActiveWorld();
  const profile = world.profile;
  const softScores = await scenarioService.getSoftSkillScores(profile.id);
  const completed = await scenarioService.isComplete(profile.id);
  const minutes = scenarioService.estimatedMinutes();

  return (
    <div className="flex flex-col gap-8">
      {/* Header: avatar + name/headline + completeness ring */}
      <header className="flex items-center gap-4">
        <PersonAvatar person={profile} size={56} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold tracking-tight">{profile.name}</h1>
          <p className="truncate text-sm text-muted-foreground">{profile.headline}</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <CompletenessRing value={profile.completeness} />
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            complete
          </span>
        </div>
      </header>

      {/* Hard skills */}
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Hard skills
          </h2>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <span className="inline-block size-2 rounded-full bg-success" />
            verified = peer-endorsed
          </span>
        </div>
        <SkillChips initial={profile.hardSkills} endorsements={world.endorsements} />
      </section>

      {/* Soft skills */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Soft skills
        </h2>
        <p className="text-sm text-muted-foreground">
          From a short scenario test — <span className="font-medium text-foreground">not self-rated</span>.
        </p>
        <SoftSkillBars scores={softScores} />
      </section>

      {/* Primary CTA */}
      <ScenarioCta minutes={minutes} completed={completed} />
    </div>
  );
}
