import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarCheck } from "lucide-react";
import { THREADS } from "@/lib/fixtures";
import { PersonAvatar } from "@/components/people/person-avatar";
import { ScoreSheetButton } from "@/components/pipeline/score-sheet-button";
import { cn } from "@/lib/utils";

/**
 * 3.3 Direct connect & interview — the direct manager↔candidate chat, with the
 * scheduled-interview panel (no scheduler email chain).
 */
export default async function ChatPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  const thread = THREADS.find((t) => t.id === threadId);
  if (!thread) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/hiring-manager/pipeline"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to pipeline
      </Link>

      <header className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <PersonAvatar person={thread.me} size={40} />
        <PersonAvatar person={thread.them} size={40} className="-ml-4" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            You ({thread.me.name}) ↔ {thread.them.name}
          </p>
          <p className="text-xs text-muted-foreground">Direct line — no recruiter relay</p>
        </div>
      </header>

      <div className="flex flex-col gap-3">
        {thread.messages.map((msg) => {
          const outgoing = msg.fromId === thread.me.id;
          return (
            <div
              key={msg.id}
              className={cn("flex flex-col gap-1", outgoing ? "items-end" : "items-start")}
            >
              <div
                className={cn(
                  "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm",
                  outgoing
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                {msg.text}
              </div>
              <span className="px-1 text-xs text-muted-foreground">{msg.ts}</span>
            </div>
          );
        })}
      </div>

      {thread.interview && (
        <div className="flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/8 p-5">
          <div className="flex items-center gap-2">
            <CalendarCheck className="size-5 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Interview scheduled</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {thread.interview.when} · {thread.interview.medium} — no back-and-forth, no scheduler
            email chain.
          </p>
          <div>
            <ScoreSheetButton />
          </div>
        </div>
      )}
    </div>
  );
}
