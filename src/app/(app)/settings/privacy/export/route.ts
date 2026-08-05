import { getCurrentUser } from "@/lib/persona";
import { prisma } from "@/lib/db";

/**
 * GDPR data portability (Art. 20): download everything we hold about you as a
 * single JSON file. Excludes the password hash.
 */
export async function GET(): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const [account, candidate, companies, intros, subscriptions, feedback, messages] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          name: true,
          initials: true,
          alias: true,
          anonymous: true,
          roles: true,
          createdAt: true,
        },
      }),
      prisma.candidateProfile.findUnique({
        where: { userId: user.id },
        include: {
          hardSkills: true,
          softSkills: true,
          endorsements: true,
          scenarioRuns: true,
          enrollments: true,
          matches: { select: { id: true, openingId: true, stage: true, createdAt: true } },
        },
      }),
      prisma.company.findMany({
        where: { ownerId: user.id },
        include: { openings: { select: { id: true, title: true } } },
      }),
      prisma.recruiterIntro.findMany({ where: { recruiterId: user.id } }),
      prisma.subscription.findMany({ where: { userId: user.id } }),
      prisma.productFeedback.findMany({ where: { userId: user.id } }),
      prisma.message.findMany({
        where: { fromUserId: user.id },
        select: { id: true, text: true, createdAt: true },
      }),
    ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    note: "Your Holicruit data. The password hash is never included.",
    account,
    candidateProfile: candidate,
    companies,
    recruiterIntros: intros,
    subscriptions,
    feedback,
    messages,
  };

  const filename = `holicruit-data-${new Date().toISOString().slice(0, 10)}.json`;
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
