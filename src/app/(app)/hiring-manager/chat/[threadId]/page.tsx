import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { THREADS } from "@/lib/fixtures";
import { ChatThread } from "@/components/chat/chat-thread";

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

      <ChatThread
        me={thread.me}
        them={thread.them}
        initialMessages={thread.messages}
        initialInterview={thread.interview}
      />
    </div>
  );
}
