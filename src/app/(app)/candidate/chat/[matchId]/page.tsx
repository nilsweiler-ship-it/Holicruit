import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import { matchingService } from "@/lib/services/matching";
import { THREADS } from "@/lib/fixtures";
import { ChatThread } from "@/components/chat/chat-thread";

export const metadata: Metadata = { title: "Direct line · Holicruit" };

/**
 * Candidate-side direct line to the named hiring manager. Reuses an existing
 * thread when one exists for the match, otherwise synthesizes a starter
 * conversation seeded by a friendly note from the hiring manager.
 */
export default async function CandidateChatPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const match = await matchingService.getMatch(matchId);
  if (!match) notFound();

  const { opening } = match;
  const existing = THREADS.find((t) => t.matchId === matchId);

  const me = existing?.me ?? match.candidate;
  const them = existing?.them ?? opening.hiringManager;
  const interview = existing?.interview;

  const seed: ChatMessage[] = [
    {
      id: "seed-1",
      fromId: opening.hiringManager.id,
      text: `Hi ${match.candidate.name.split(" ")[0]} — really liked your fit for ${opening.title}. Want to grab a quick call this week?`,
      ts: "Today",
    },
  ];
  const initialMessages = existing?.messages ?? seed;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/candidate/matches/${matchId}`}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to match
      </Link>

      <div>
        <h1 className="text-sm font-semibold text-foreground">
          Direct line · {opening.title} @ {opening.company.name}
        </h1>
      </div>

      <ChatThread
        me={me}
        them={them}
        initialMessages={initialMessages}
        initialInterview={interview}
      />
    </div>
  );
}
