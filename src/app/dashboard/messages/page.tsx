import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { MessagesLayout } from "@/components/messaging/messages-layout";

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
    <MessagesLayout
      conversations={conversations}
      currentUserName={session.user.name ?? "You"}
    />
  );
}
