import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Wand2 } from "lucide-react";
import { scenarioService } from "@/lib/services/scenario";
import { getActiveCandidateId } from "@/lib/persona";
import { getCandidateProfile, getEndorsements } from "@/lib/services/profile";
import { AvatarUpload } from "@/components/candidate/avatar-upload";
import { CompletenessRing } from "@/components/people/completeness-ring";
import { SkillChips } from "@/components/candidate/skill-chips";
import { SoftSkillBars } from "@/components/candidate/soft-skill-bars";
import { PersonalityBars } from "@/components/candidate/personality-bars";
import { ScenarioCta } from "@/components/candidate/scenario-cta";

export const metadata: Metadata = { title: "Your profile · Holicruit" };

/**
 * 2.1 — Candidate holistic profile builder. Captures hard skills, *verified*
 * skills, and soft skills measured objectively (via the scenario assessment).
 */
export default async function CandidateProfilePage() {
  const candidateId = await getActiveCandidateId();
  const profile = await getCandidateProfile(candidateId);
  if (!profile) notFound();
  const endorsements = await getEndorsements(candidateId);
  const softScores = await scenarioService.getSoftSkillScores(candidateId);
  const personality = await scenarioService.getPersonalityProfile(candidateId);
  const completed = await scenarioService.isComplete(candidateId);
  const minutes = scenarioService.estimatedMinutes();

  return (
    <div className="flex flex-col gap-8">
      {/* Header: avatar + name/headline + completeness ring */}
      <header className="flex items-center gap-4">
        <AvatarUpload person={profile} size={64} />
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
        <SkillChips
          initial={profile.hardSkills}
          endorsements={endorsements}
          candidateId={candidateId}
        />
        <Link
          href="/candidate/profile/import"
          className="inline-flex w-fit items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <Wand2 className="size-3.5" />
          Import skills from a CV or job description
        </Link>
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

      {/* Personality — Big Five + Integrity, measured from the scenario */}
      {personality && (
        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Personality
            </h2>
            <span className="text-xs text-muted-foreground">Big Five + Integrity</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Measured from your scenario choices and mapped to the scientifically validated{" "}
            <span className="font-medium text-foreground">Big Five</span> model (with HEXACO
            Integrity) — <span className="font-medium text-foreground">never self-rated</span>.
          </p>
          <PersonalityBars traits={personality} />
        </section>
      )}

      {/* Primary CTA */}
      <ScenarioCta minutes={minutes} completed={completed} />
    </div>
  );
}
