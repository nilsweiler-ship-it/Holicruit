import { VenetianMask } from "lucide-react";
import { prisma } from "@/lib/db";
import { RevealButton } from "./reveal-button";

/**
 * Privacy banner for a conversation. Tells the viewer when the other side is
 * masked, and lets the viewer reveal their own identity (per match) if they're
 * currently anonymous. Renders nothing when neither side is anonymous.
 */
export async function IdentityBanner({
  matchId,
  side,
}: {
  matchId: string;
  side: "candidate" | "employer";
}) {
  const m = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      candidateRevealed: true,
      employerRevealed: true,
      candidate: { select: { user: { select: { anonymous: true } } } },
      opening: { select: { companyConfidential: true, hmAnonymous: true } },
    },
  });
  if (!m) return null;

  const employerAnon = m.opening.companyConfidential || m.opening.hmAnonymous;
  const candidateAnon = m.candidate.user.anonymous;

  const iAmAnonymous = side === "candidate" ? candidateAnon : employerAnon;
  const iHaveRevealed = side === "candidate" ? m.candidateRevealed : m.employerRevealed;
  const theyAreAnonymous = side === "candidate" ? employerAnon : candidateAnon;
  const theyHaveRevealed = side === "candidate" ? m.employerRevealed : m.candidateRevealed;

  const theyMasked = theyAreAnonymous && !theyHaveRevealed;
  const iCanReveal = iAmAnonymous && !iHaveRevealed;

  if (!theyMasked && !iCanReveal) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-4">
      <VenetianMask className="size-5 shrink-0 text-primary" />
      <div className="min-w-0 flex-1 text-sm">
        {theyMasked && (
          <p className="text-foreground">
            The other side is talking under an alias for now — you&apos;ll see their real identity
            only if they choose to reveal it.
          </p>
        )}
        {iCanReveal && (
          <p className="text-muted-foreground">
            You&apos;re anonymous in this conversation. Reveal your real identity here when you&apos;re
            ready — it applies to this match only.
          </p>
        )}
      </div>
      {iCanReveal && <RevealButton matchId={matchId} side={side} />}
    </div>
  );
}
