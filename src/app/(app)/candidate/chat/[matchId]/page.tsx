import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireMatchAccess } from "@/lib/access";
import { matchingService } from "@/lib/services/matching";
import { getThreadView } from "@/lib/services/thread";
import { ChatThread } from "@/components/chat/chat-thread";
import { IdentityBanner } from "@/components/identity/identity-banner";

export const metadata: Metadata = { title: "Direct line · Holicruit" };

/** Candidate-side direct line to the hiring manager (DB-backed). */
export default async function CandidateChatPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  // Only the candidate on this match may open it (404 otherwise).
  const { user } = await requireMatchAccess(matchId, "candidate");
  const match = await matchingService.getMatch(matchId, "candidate");
  if (!match) notFound();
  const view = await getThreadView(matchId, "candidate", user.id);
  if (!view) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/candidate/matches/${matchId}`}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to match
      </Link>

      <h1 className="truncate text-sm font-semibold text-foreground">
        Direct line · {match.opening.title} @ {match.opening.company.name}
      </h1>

      <IdentityBanner matchId={matchId} side="candidate" />

      <ChatThread
        matchId={matchId}
        me={view.me}
        them={view.them}
        initialMessages={view.messages}
        initialInterview={view.interview}
        initialProposal={view.pendingProposal}
      />
    </div>
  );
}
