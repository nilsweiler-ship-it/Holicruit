/**
 * Seeds the database from the existing demo fixtures so the app has the same
 * data it had in mocked mode — now persisted. Creates one login account per
 * hat (all use password `password123`).
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  CANDIDATE_WORLDS,
  PIPELINE_MATCHES,
  THREADS,
  RECRUITER_INTROS,
  PROVIDERS,
  PROGRAMS,
} from "../src/lib/fixtures";
import type { Match, Opening, Person } from "../src/lib/types";

const prisma = new PrismaClient();

const PASSWORD = "password123";
const emailFor = (id: string) => `${id.replace(/^(cand-|prov-|hm-|rec-)/, "")}@holicruit.test`;

async function main() {
  // Idempotent: clear everything (order respects FKs via cascade on User/parent).
  await prisma.message.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.thread.deleteMany();
  await prisma.growthReport.deleteMany();
  await prisma.feedbackDraft.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.match.deleteMany();
  await prisma.opening.deleteMany();
  await prisma.company.deleteMany();
  await prisma.program.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.recruiterIntro.deleteMany();
  await prisma.endorsement.deleteMany();
  await prisma.softSkillScore.deleteMany();
  await prisma.hardSkill.deleteMany();
  await prisma.scenarioResult.deleteMany();
  await prisma.candidateProfile.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  // ── A hiring-manager account that owns the seeded companies/openings ──
  const hmUser = await prisma.user.create({
    data: {
      email: "priya@holicruit.test",
      passwordHash,
      name: "Priya Nair",
      initials: "PN",
      roles: JSON.stringify(["hiring_manager"]),
    },
  });
  await prisma.subscription.create({
    data: { userId: hmUser.id, hat: "hiring_manager", plan: "hm-scale", status: "active" },
  });

  // Openings, created lazily and shared across candidates (keyed by fixture id).
  const openingRows = new Map<string, string>(); // fixtureOpeningId -> db opening id
  async function ensureOpening(o: Opening): Promise<string> {
    const existing = openingRows.get(o.id);
    if (existing) return existing;
    const company = await prisma.company.create({
      data: { name: o.company.name, location: o.company.location, ownerId: hmUser.id },
    });
    const row = await prisma.opening.create({
      data: {
        title: o.title,
        industry: o.industry,
        companyId: company.id,
        location: o.location,
        salaryMin: o.salaryMin ?? null,
        salaryMax: o.salaryMax ?? null,
        currency: o.currency ?? "€",
        hiringManagerName: o.hiringManager.name,
        hiringManagerHeadline: o.hiringManager.headline,
        hiringManagerInitials: o.hiringManager.initials,
        requiredHard: JSON.stringify(o.requiredHard),
        requiredSoft: JSON.stringify(o.requiredSoft),
      },
    });
    openingRows.set(o.id, row.id);
    return row.id;
  }

  const profileByCandidateId = new Map<string, string>(); // fixture candidate id -> profile id
  const matchByFixtureId = new Map<string, string>(); // fixture match id -> db match id

  async function createMatch(m: Match, profileId: string, opts: { optedIn: boolean }) {
    const openingId = await ensureOpening(m.opening);
    // A candidate has one relationship per opening — upsert so a closed match
    // overrides an earlier active one for the same opening (e.g. Sam ↔ Orbit).
    const data = {
      hardFit: m.fit.hardFit,
      softFit: m.fit.softFit,
      mutualFit: m.fit.mutualFit,
      verified: m.fit.verified,
      gaps: JSON.stringify(m.fit.gaps),
      candidateRank: m.fit.candidateRank ?? null,
      poolSize: m.fit.poolSize ?? null,
      stage: m.stage,
      candidateOptIn: opts.optedIn,
      managerOptIn: opts.optedIn,
    };
    const row = await prisma.match.upsert({
      where: { candidateId_openingId: { candidateId: profileId, openingId } },
      update: data,
      create: { candidateId: profileId, openingId, ...data },
    });
    matchByFixtureId.set(m.id, row.id);
    return row.id;
  }

  // ── Candidate personas (Sam / Aisha / Diego) ──
  for (const world of Object.values(CANDIDATE_WORLDS)) {
    const p = world.profile;
    const user = await prisma.user.create({
      data: {
        email: emailFor(p.id),
        passwordHash,
        name: p.name,
        initials: p.initials,
        roles: JSON.stringify(["candidate"]),
        candidate: {
          create: {
            headline: p.headline,
            industry: p.industry,
            completeness: p.completeness,
            scenarioCompleted: p.scenarioCompleted,
            hardSkills: { create: p.hardSkills.map((s) => ({ name: s.name, verified: s.verified })) },
            softSkills: { create: p.softSkills.map((s) => ({ name: s.name, level: s.level })) },
            endorsements: {
              create: world.endorsements.map((e) => ({
                skill: e.skill,
                endorserName: e.endorserName,
                endorserInitials: e.endorserInitials,
                endorserHeadline: e.endorserHeadline,
                relationship: e.relationship,
              })),
            },
          },
        },
      },
      include: { candidate: true },
    });
    const profileId = user.candidate!.id;
    profileByCandidateId.set(p.id, profileId);

    for (const m of world.matches) await createMatch(m, profileId, { optedIn: true });
    for (const m of world.closed) await createMatch(m, profileId, { optedIn: true });

    for (const r of world.growthReports) {
      const matchId = matchByFixtureId.get(r.matchId);
      if (!matchId) continue;
      await prisma.growthReport.create({
        data: {
          matchId,
          roleTitle: r.roleTitle,
          company: r.company,
          hardYou: r.hard.comparison.you,
          hardBar: r.hard.comparison.roleBar,
          softYou: r.soft.comparison.you,
          softBar: r.soft.comparison.roleBar,
          primaryGapSkill: r.primaryGap.skill,
          primaryGapType: r.primaryGap.type,
          rolesClearedIfClosed: r.rolesClearedIfClosed,
          matchingProgramCount: r.matchingProgramCount,
        },
      });
    }
  }

  // ── HM pipeline: pool candidates + their matches to the pipeline opening ──
  // pm-6 is Sam, who already has a match to that opening — promote it to "talking".
  const samProfileId = profileByCandidateId.get("cand-sam")!;
  async function ensurePoolProfile(person: Person): Promise<string> {
    const existing = profileByCandidateId.get(person.id);
    if (existing) return existing;
    const user = await prisma.user.create({
      data: {
        email: emailFor(person.id),
        passwordHash,
        name: person.name,
        initials: person.initials,
        roles: JSON.stringify(["candidate"]),
        candidate: {
          create: { headline: person.headline, industry: "Software", completeness: 60, scenarioCompleted: true },
        },
      },
      include: { candidate: true },
    });
    profileByCandidateId.set(person.id, user.candidate!.id);
    return user.candidate!.id;
  }

  for (const pm of PIPELINE_MATCHES) {
    if (pm.candidate.id === "cand-sam") {
      // Sam's existing match to this opening becomes the pipeline "talking" card.
      const openingId = await ensureOpening(pm.opening);
      await prisma.match.update({
        where: { candidateId_openingId: { candidateId: samProfileId, openingId } },
        data: { stage: "talking" },
      });
      matchByFixtureId.set(pm.id, (await prisma.match.findUnique({
        where: { candidateId_openingId: { candidateId: samProfileId, openingId } },
        select: { id: true },
      }))!.id);
      continue;
    }
    const profileId = await ensurePoolProfile(pm.candidate);
    await createMatch(pm, profileId, { optedIn: true });
  }

  // ── Threads (the Priya ↔ Sam conversation, on Sam's pipeline match) ──
  for (const t of THREADS) {
    const matchId = matchByFixtureId.get(t.matchId);
    if (!matchId) continue;
    const thread = await prisma.thread.create({ data: { matchId } });
    for (const msg of t.messages) {
      await prisma.message.create({
        data: {
          threadId: thread.id,
          fromUserId: msg.fromId === hmUser.initials ? null : null, // sender label kept below
          fromName: msg.fromId === t.me.id ? t.me.name : t.them.name,
          text: msg.text,
        },
      });
    }
    if (t.interview) {
      await prisma.interview.create({
        data: {
          threadId: thread.id,
          whenText: t.interview.when,
          medium: t.interview.medium,
          scoreSheetAttached: t.interview.scoreSheetAttached,
        },
      });
    }
  }

  // ── Recruiter account + intros ──
  const recUser = await prisma.user.create({
    data: {
      email: "jordan@holicruit.test",
      passwordHash,
      name: "Jordan Lee",
      initials: "JL",
      roles: JSON.stringify(["recruiter"]),
      intros: {
        create: RECRUITER_INTROS.map((r) => ({
          candidateName: r.candidateName,
          roleTitle: r.roleTitle,
          company: r.company,
          valueNote: r.valueNote,
          stage: r.stage,
        })),
      },
    },
  });

  // ── Provider accounts + programs ──
  const providerRowByFixtureId = new Map<string, string>();
  for (const prov of PROVIDERS) {
    const user = await prisma.user.create({
      data: {
        email: emailFor(prov.id),
        passwordHash,
        name: prov.name,
        initials: prov.initials,
        roles: JSON.stringify(["provider"]),
        provider: {
          create: { name: prov.name, kind: prov.kind, headline: prov.headline, initials: prov.initials },
        },
      },
      include: { provider: true },
    });
    providerRowByFixtureId.set(prov.id, user.provider!.id);
  }
  for (const prog of PROGRAMS) {
    const providerId = providerRowByFixtureId.get(prog.providerId);
    if (!providerId) continue;
    await prisma.program.create({
      data: {
        providerId,
        title: prog.title,
        format: prog.format,
        credential: prog.credential ?? null,
        tags: JSON.stringify(prog.tags),
        closesGap: prog.closesGap,
        gapType: prog.gapType,
        sponsored: prog.sponsored,
        enrollments: prog.enrollments,
        completions: prog.completions,
        reMatches: prog.reMatches,
      },
    });
  }

  const fmUser = await prisma.user.findUnique({ where: { email: "fm@holicruit.test" } });
  if (fmUser) {
    await prisma.subscription.create({
      data: { userId: fmUser.id, hat: "provider", plan: "provider-partner", status: "active" },
    });
  }

  const counts = {
    users: await prisma.user.count(),
    candidates: await prisma.candidateProfile.count(),
    openings: await prisma.opening.count(),
    matches: await prisma.match.count(),
    programs: await prisma.program.count(),
  };
  console.log("Seeded:", counts);
  console.log("Demo login — password for all accounts:", PASSWORD);
  console.log("  candidate: sam@holicruit.test / aisha@holicruit.test / diego@holicruit.test");
  console.log("  hiring manager: priya@holicruit.test");
  console.log("  recruiter: jordan@holicruit.test");
  console.log("  provider: fm@holicruit.test");
  void recUser;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
