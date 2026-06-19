"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, CalendarCheck, Send } from "lucide-react";
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

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
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
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-3 border-b-2 px-4 py-3">
        <Avatar className="size-8">
          <AvatarFallback className="text-xs">
            {getInitials(partner.name)}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-bold">
          You &#8596; {partner.name}{" "}
          <span className="text-muted-foreground font-normal">
            ({partner.role.replace("_", " ")})
          </span>
        </span>
      </div>

      {/* Message bubbles */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2.5 text-sm ${
                msg.isOwn
                  ? "bg-foreground text-background rounded-xl rounded-br-sm"
                  : "border bg-muted rounded-xl rounded-bl-sm"
              }`}
            >
              {msg.subject && (
                <p
                  className={`text-xs font-medium mb-1 ${
                    msg.isOwn
                      ? "text-background/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {msg.subject}
                </p>
              )}
              <p className="whitespace-pre-wrap">{msg.body}</p>
              <p
                className={`text-[10px] mt-1 ${
                  msg.isOwn
                    ? "text-background/60"
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

        {/* Interview scheduled panel */}
        <div className="rounded-xl border-2 bg-primary/5 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5 shrink-0">&#x1F4C5;</span>
            <div>
              <p className="text-sm font-bold">
                Interview scheduled
              </p>
              <p className="text-sm text-foreground/80 mt-0.5">
                Thu &middot; 2:00 pm &middot; video &mdash; no back-and-forth,
                no scheduler email chain.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full gap-1"
          >
            Add structured score sheet
            <ArrowRight className="h-3.5 w-3.5 ml-auto" />
          </Button>
        </div>
      </div>

      {/* Reply input */}
      <div className="border-t-2 px-4 py-3 flex items-end gap-2">
        <Textarea
          placeholder="Type a message..."
          value={replyBody}
          onChange={(e) => setReplyBody(e.target.value)}
          rows={2}
          className="text-sm resize-none flex-1"
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
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
