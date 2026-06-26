import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Wordmark } from "@/components/brand/wordmark";
import { EndorseForm } from "@/components/candidate/endorse-form";

export const metadata: Metadata = { title: "Endorse a skill · Holicruit" };

/**
 * The "give" side of peer endorsement — a standalone page a peer reaches via a
 * shared link (no candidate app chrome). Endorsing here is what earns a skill
 * its "verified" badge.
 */
export default async function EndorsePage({ params }: { params: Promise<{ skill: string }> }) {
  const { skill: rawSkill } = await params;
  const skill = decodeURIComponent(rawSkill);
  const session = await auth();
  let candidateName = "this candidate";
  let candidateId = "";
  if (session?.user?.id) {
    const u = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, candidate: { select: { id: true } } },
    });
    if (u) {
      candidateName = u.name;
      candidateId = u.candidate?.id ?? "";
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Wordmark href="/select-role" className="text-xl" />
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">{candidateName}</span> asked you to vouch for
            their <span className="font-medium text-foreground">{skill}</span>.
          </p>
        </div>
        <EndorseForm candidateId={candidateId} candidateName={candidateName} skill={skill} />
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Endorsements are evidence, not claims — they&apos;re what turns a skill &ldquo;verified&rdquo; on
          Holicruit.
        </p>
      </div>
    </div>
  );
}
