"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface MessageUser {
  id: string;
  name: string;
  role: string;
}

interface MessageItem {
  id: string;
  sender: MessageUser;
  receiver: MessageUser;
  subject: string | null;
  body: string;
  createdAt: string;
  isOwn: boolean;
}

interface MessageListProps {
  messages: MessageItem[];
  currentUserId: string;
}

function getRoleBadgeColor(role: string) {
  switch (role) {
    case "HIRING_MANAGER":
      return "bg-blue-100 text-blue-800";
    case "HEADHUNTER":
      return "bg-purple-100 text-purple-800";
    case "CANDIDATE":
      return "bg-green-100 text-green-800";
    default:
      return "";
  }
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [subject, setSubject] = useState("");
  const [sending, setSending] = useState(false);

  async function handleReply(receiverId: string) {
    if (!replyBody.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId,
          subject: subject || undefined,
          body: replyBody,
        }),
      });
      if (!res.ok) {
        toast.error("Failed to send message");
        return;
      }
      toast.success("Message sent");
      setReplyTo(null);
      setReplyBody("");
      setSubject("");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  }

  if (messages.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground">
          No messages yet. Communication will appear here when hiring managers
          or headhunters reach out through the platform.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((msg) => {
        const otherUser = msg.isOwn ? msg.receiver : msg.sender;
        return (
          <div
            key={msg.id}
            className={`rounded-lg border p-4 ${msg.isOwn ? "border-l-4 border-l-blue-300 bg-blue-50/30" : ""}`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {msg.isOwn ? `To: ${msg.receiver.name}` : msg.sender.name}
                </span>
                <Badge
                  variant="secondary"
                  className={`text-xs ${getRoleBadgeColor(otherUser.role)}`}
                >
                  {otherUser.role.replace("_", " ")}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(msg.createdAt).toLocaleString()}
              </span>
            </div>
            {msg.subject && (
              <p className="text-xs font-medium text-muted-foreground mb-1">
                {msg.subject}
              </p>
            )}
            <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
            {!msg.isOwn && (
              <div className="mt-2">
                {replyTo === msg.id ? (
                  <div className="space-y-2">
                    <Input
                      placeholder="Subject (optional)"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="text-sm"
                    />
                    <Textarea
                      placeholder="Write your reply..."
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      rows={3}
                      className="text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReply(msg.sender.id)}
                        disabled={sending || !replyBody.trim()}
                      >
                        {sending ? "Sending..." : "Send"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setReplyTo(null);
                          setReplyBody("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs"
                    onClick={() => setReplyTo(msg.id)}
                  >
                    Reply
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
