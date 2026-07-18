/**
 * Onboarding curriculum — a role-aware, guided "getting started" path. Each step
 * is a short lesson (what + why) tied to a real action, with completion computed
 * from the account's actual state so the checklist reflects genuine progress.
 */
import { prisma } from "../db";

export interface OnboardingStep {
  id: string;
  label: string;
  /** The "why it matters" lesson line. */
  why: string;
  href: string;
  cta: string;
  done: boolean;
}

export interface Onboarding {
  title: string;
  intro: string;
  steps: OnboardingStep[];
  completed: number;
}

function pack(title: string, intro: string, steps: OnboardingStep[]): Onboarding {
  return { title, intro, steps, completed: steps.filter((s) => s.done).length };
}

export async function getCandidateOnboarding(candidateId: string): Promise<Onboarding> {
  const p = await prisma.candidateProfile.findUnique({
    where: { id: candidateId },
    select: {
      avatarUrl: true,
      scenarioCompleted: true,
      _count: { select: { hardSkills: true, endorsements: true, matches: true } },
    },
  });

  const steps: OnboardingStep[] = [
    {
      id: "photo",
      label: "Add a profile photo",
      why: "A face builds trust — profiles with a photo get taken more seriously by hiring managers.",
      href: "/candidate/profile",
      cta: "Upload photo",
      done: Boolean(p?.avatarUrl),
    },
    {
      id: "skills",
      label: "Add your skills",
      why: "Your hard skills are half of every match. Import them from a CV in seconds.",
      href: "/candidate/profile/import",
      cta: "Add skills",
      done: (p?._count.hardSkills ?? 0) > 0,
    },
    {
      id: "scenario",
      label: "Take the scenario assessment",
      why: "Measures your soft skills objectively and builds your Big Five profile — never self-rated, so it counts.",
      href: "/candidate/profile/scenario",
      cta: "Start assessment",
      done: Boolean(p?.scenarioCompleted),
    },
    {
      id: "endorse",
      label: "Get a peer endorsement",
      why: "Endorsements turn a claimed skill into a verified one — verified skills win matches.",
      href: "/candidate/profile",
      cta: "Request one",
      done: (p?._count.endorsements ?? 0) > 0,
    },
    {
      id: "matches",
      label: "Review your matches & growth path",
      why: "See where you stand on every role — and if you're not selected, your Growth Report shows the exact next thing to learn.",
      href: "/candidate/matches",
      cta: "See matches",
      done: (p?._count.matches ?? 0) > 0,
    },
  ];

  return pack(
    "Get started",
    "Five steps to a complete, verified profile that gets you matched on merit.",
    steps,
  );
}

export async function getHmOnboarding(userId: string): Promise<Onboarding> {
  const openings = await prisma.opening.findMany({
    where: { company: { ownerId: userId } },
    select: { id: true, hardWeight: true, passBar: true },
  });
  const openingIds = openings.map((o) => o.id);
  const calibrated = openings.some((o) => o.hardWeight !== 60 || o.passBar !== 60);

  const [scoreSheets, interviews] = openingIds.length
    ? await Promise.all([
        prisma.scoreSheet.count({ where: { match: { openingId: { in: openingIds } } } }),
        prisma.interview.count({ where: { thread: { match: { openingId: { in: openingIds } } } } }),
      ])
    : [0, 0];

  const firstRole = openings[0]?.id;

  const steps: OnboardingStep[] = [
    {
      id: "role",
      label: "Post or import a role",
      why: "Matching runs against the role's real bar — post one and your pipeline fills with opted-in candidates.",
      href: "/hiring-manager/roles/new",
      cta: "Post a role",
      done: openings.length > 0,
    },
    {
      id: "calibrate",
      label: "Calibrate the role",
      why: "Weight hard vs. soft and set the pass bar so matching optimizes for what a great hire looks like on your team.",
      href: firstRole ? `/hiring-manager/roles/${firstRole}/calibration` : "/hiring-manager/roles",
      cta: "Calibrate",
      done: calibrated,
    },
    {
      id: "guide",
      label: "Generate an interview guide",
      why: "One click turns a candidate into a structured, bias-reducing interview kit — no more writing scripts from scratch.",
      href: "/hiring-manager/pipeline",
      cta: "Open pipeline",
      done: scoreSheets > 0,
    },
    {
      id: "schedule",
      label: "Schedule an interview on-platform",
      why: "Book the time here — the scorecard, guide, and feedback all stay linked to the candidate.",
      href: "/hiring-manager/pipeline",
      cta: "Go to pipeline",
      done: interviews > 0,
    },
  ];

  return pack(
    "Get started",
    "Four steps to your first great hire — matched, calibrated, and interviewed on-platform.",
    steps,
  );
}
