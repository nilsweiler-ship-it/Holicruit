import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { MessageList } from "@/components/messaging/message-list";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    orderBy: { createdAt: "desc" },
    take: 50,
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground">
          In-platform communication. Contact details are shared only after
          interview stage.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Inbox ({messages.filter((m) => m.receiverId === session.user.id).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MessageList
            messages={messages.map((m) => ({
              id: m.id,
              sender: m.sender,
              receiver: m.receiver,
              subject: m.subject,
              body: m.body,
              createdAt: m.createdAt.toISOString(),
              isOwn: m.senderId === session.user.id,
            }))}
            currentUserId={session.user.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
