import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import { matchingService } from "@/lib/services/matching";
import { getThreadView } from "@/lib/services/thread";
import { ChatThread } from "@/components/chat/chat-thread";

export const metadata: Metadata = { title: "Direct line · Holicruit" };

/** Candidate-side direct line to the named hiring manager (DB-backed). */
export default async function CandidateChatPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const match = await matchingService.getMatch(matchId);
  if (!match) notFound();
  const view = await getThreadView(matchId, "candidate");
  if (!view) notFound();

  const seed: ChatMessage[] = view.messages.length
    ? view.messages
    : [
        {
          id: "seed-1",
          fromId: view.them.name,
          text: `Hi ${view.me.name.split(" ")[0]} — really liked your fit for ${match.opening.title}. Want to grab a quick call this week?`,
          ts: "Today",
        },
      ];

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

      <ChatThread
        matchId={matchId}
        me={view.me}
        them={view.them}
        initialMessages={seed}
        initialInterview={view.interview}
      />
    </div>
  );
}
