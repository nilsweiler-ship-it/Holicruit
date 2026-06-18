import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ChatThread } from "@/components/messaging/chat-thread";
import { Card, CardContent } from "@/components/ui/card";

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: session.user.id },
        { receiverId: session.user.id },
      ],
    },
    include: {
      sender: { select: { id: true, name: true, role: true } },
      receiver: { select: { id: true, name: true, role: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  // Mark unread messages as read
  const unreadIds = messages
    .filter((m) => m.receiverId === session.user.id && !m.readAt)
    .map((m) => m.id);

  if (unreadIds.length > 0) {
    await prisma.message.updateMany({
      where: { id: { in: unreadIds } },
      data: { readAt: new Date() },
    });
  }

  // Group messages by conversation partner
  const conversationMap = new Map<
    string,
    {
      partner: { id: string; name: string; role: string };
      messages: Array<{
        id: string;
        body: string;
        createdAt: string;
        isOwn: boolean;
        subject: string | null;
      }>;
    }
  >();

  for (const m of messages) {
    const partnerId = m.senderId === session.user.id ? m.receiverId : m.senderId;
    const partner = m.senderId === session.user.id ? m.receiver : m.sender;

    if (!conversationMap.has(partnerId)) {
      conversationMap.set(partnerId, { partner, messages: [] });
    }
    conversationMap.get(partnerId)!.messages.push({
      id: m.id,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
      isOwn: m.senderId === session.user.id,
      subject: m.subject,
    });
  }

  const conversations = Array.from(conversationMap.values());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-sm text-muted-foreground">
          In-platform communication. Contact details are shared only after
          interview stage.
        </p>
      </div>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No messages yet. Communication will appear here when hiring
              managers or headhunters reach out through the platform.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {conversations.map((conv) => (
            <ChatThread
              key={conv.partner.id}
              partner={conv.partner}
              messages={conv.messages}
              currentUserName={session.user.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
