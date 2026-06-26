import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import { matchingService } from "@/lib/services/matching";
import { getThreadView } from "@/lib/services/thread";
import { ChatThread } from "@/components/chat/chat-thread";

export const metadata: Metadata = { title: "Direct line · Holicruit" };

/** Hiring-manager-side direct line with a candidate (DB-backed). */
export default async function HmChatPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const match = await matchingService.getMatch(matchId);
  if (!match) notFound();
  const view = await getThreadView(matchId, "manager");
  if (!view) notFound();

  const seed: ChatMessage[] = view.messages.length
    ? view.messages
    : [
        {
          id: "seed-1",
          fromId: view.me.name,
          text: `Hi ${view.them.name.split(" ")[0]} — thanks for the conversation. Shall we find a time to talk properly?`,
          ts: "Today",
        },
      ];

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/hiring-manager/candidate/${matchId}`}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to candidate
      </Link>

      <h1 className="text-sm font-semibold text-foreground">
        Direct line · {view.them.name} · {match.opening.title}
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
