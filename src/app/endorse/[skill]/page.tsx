import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/persona";
import { personIdentity } from "@/lib/identity";
import { endorsementId, verifyEndorsementToken } from "@/lib/integrity/endorsement";
import { Wordmark } from "@/components/brand/wordmark";
import { EndorseForm } from "@/components/candidate/endorse-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Endorse a skill · Holicruit", robots: { index: false } };

/**
 * The "give" side of peer endorsement — a standalone page a peer reaches via a
 * signed link (`/endorse/<skill>?t=<token>`) the candidate shared. The token
 * names the candidate and skill; the page shows the candidate's *display*
 * identity (their alias if they're anonymous). Endorsing requires a signed-in
 * account that isn't the candidate's own; `giveEndorsement` re-checks all of it.
 */
export default async function EndorsePage({
  searchParams,
}: {
  params: Promise<{ skill: string }>;
  searchParams: Promise<{ t?: string | string[] }>;
}) {
  const { t } = await searchParams;
  const token = typeof t === "string" ? t : "";
  // A missing AUTH_SECRET makes every link invalid rather than crashing the page.
  const claim = verifyEndorsementToken(token, process.env.AUTH_SECRET ?? "");

  const profile = claim
    ? await prisma.candidateProfile.findUnique({
        where: { id: claim.candidateId },
        select: {
          id: true,
          userId: true,
          headline: true,
          user: { select: { name: true, initials: true, alias: true, anonymous: true } },
          hardSkills: { where: { name: claim.skill }, select: { name: true } },
        },
      })
    : null;
  const skill = profile?.hardSkills[0]?.name ?? null;

  if (!claim || !profile || !skill) {
    return (
      <Shell>
        <Notice title="This endorsement link isn't valid">
          It may have expired (links last 30 days) or the skill was removed. Ask the person who sent it
          for a fresh link from their Holicruit profile.
        </Notice>
      </Shell>
    );
  }

  const candidate = personIdentity(profile.user, false);
  const viewer = await getCurrentUser();
  const isSelf = viewer?.id === profile.userId;
  const already =
    viewer && !isSelf
      ? !!(await prisma.endorsement.findUnique({
          where: { id: endorsementId(viewer.id, profile.id, skill) },
          select: { id: true },
        }))
      : false;

  return (
    <Shell
      lead={
        <>
          <span className="font-medium text-foreground">{candidate.name}</span>
          {profile.headline ? <span> · {profile.headline}</span> : null} asked you to vouch for their{" "}
          <span className="font-medium text-foreground">{skill}</span>.
        </>
      }
    >
      {isSelf ? (
        <Notice title="You can't endorse your own skill">
          Share this link with a manager, teammate or client who has seen your {skill} work. Their
          endorsement is what verifies it.
        </Notice>
      ) : !viewer ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 text-sm">
          <p className="text-muted-foreground">
            Endorsements come from real people, so you&apos;ll need a free Holicruit account. Sign in or
            create one, then open this link again.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/register">Create an account</Link>
            </Button>
          </div>
        </div>
      ) : already ? (
        <Notice title="You've already endorsed this skill">
          Thank you — your endorsement of {candidate.name}&apos;s {skill} is on their profile.
        </Notice>
      ) : (
        <EndorseForm token={token} candidateName={candidate.name} skill={skill} />
      )}
    </Shell>
  );
}

function Shell({ lead, children }: { lead?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Wordmark href="/select-role" className="text-xl" />
          {lead && <p className="text-muted-foreground">{lead}</p>}
        </div>
        {children}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Endorsements are evidence, not claims — a skill shows as &ldquo;verified&rdquo; on Holicruit once
          a peer with their own account vouches for it.
        </p>
      </div>
    </div>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-6 text-sm">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="text-muted-foreground">{children}</p>
    </div>
  );
}
