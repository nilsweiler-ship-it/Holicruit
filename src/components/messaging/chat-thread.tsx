"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CalendarCheck, ClipboardList, Send } from "lucide-react";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  body: string;
  createdAt: string;
  isOwn: boolean;
  subject: string | null;
}

interface ChatThreadProps {
  partner: { id: string; name: string; role: string };
  messages: ChatMessage[];
  currentUserName: string;
}

export function ChatThread({
  partner,
  messages,
  currentUserName,
}: ChatThreadProps) {
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!replyBody.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: partner.id,
          body: replyBody,
        }),
      });
      if (!res.ok) {
        toast.error("Failed to send message");
        return;
      }
      toast.success("Message sent");
      setReplyBody("");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  }

  return (
    <Card>
      {/* Chat header */}
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            You ↔ {partner.name}
          </span>
          <Badge variant="secondary" className="text-xs">
            {partner.role.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Message bubbles */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  msg.isOwn
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {msg.subject && (
                  <p
                    className={`text-xs font-medium mb-1 ${
                      msg.isOwn
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {msg.subject}
                  </p>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    msg.isOwn
                      ? "text-primary-foreground/60"
                      : "text-muted-foreground"
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Interview scheduled panel (placeholder) */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-center gap-3">
          <CalendarCheck className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">Interview scheduled</p>
            <p className="text-xs text-muted-foreground">
              Time and details will appear here once confirmed.
            </p>
          </div>
        </div>

        {/* Reply input */}
        <div className="flex gap-2">
          <Textarea
            placeholder="Type a message..."
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            rows={2}
            className="text-sm resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={sending || !replyBody.trim()}
            className="shrink-0 self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Score sheet placeholder button */}
        <Button variant="outline" size="sm" className="w-full gap-2" disabled>
          <ClipboardList className="h-4 w-4" />
          Add structured score sheet
          <ArrowRight className="h-3 w-3 ml-auto" />
        </Button>
      </CardContent>
    </Card>
  );
}
