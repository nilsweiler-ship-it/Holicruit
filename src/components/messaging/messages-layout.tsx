"use client";

import { useState } from "react";
import { ChatThread } from "./chat-thread";
import { Card, CardContent } from "@/components/ui/card";

interface ChatMessage {
  id: string;
  body: string;
  createdAt: string;
  isOwn: boolean;
  subject: string | null;
}

interface Conversation {
  partner: { id: string; name: string; role: string };
  messages: ChatMessage[];
}

interface MessagesLayoutProps {
  conversations: Conversation[];
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

export function MessagesLayout({
  conversations,
  currentUserName,
}: MessagesLayoutProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = conversations[activeIndex];

  if (conversations.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-sm text-muted-foreground">
            In-platform communication. Contact details are shared only after
            interview stage.
          </p>
        </div>
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No messages yet. Communication will appear here when hiring
              managers or headhunters reach out through the platform.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-sm text-muted-foreground">
          Direct expert-to-expert. No recruiter relay.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 min-h-[60vh]">
        {/* Conversation list sidebar */}
        <div className="space-y-1">
          {conversations.map((conv, idx) => {
            const lastMsg = conv.messages[conv.messages.length - 1];
            const isActive = idx === activeIndex;
            return (
              <button
                key={conv.partner.id}
                onClick={() => setActiveIndex(idx)}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                  isActive
                    ? "bg-[#FFF8E0] border-2"
                    : "border-2 border-transparent hover:bg-muted"
                }`}
              >
                <div className="h-9 w-9 shrink-0 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-bold">
                  {getInitials(conv.partner.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {conv.partner.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {lastMsg?.body ?? "No messages"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active thread */}
        <div className="rounded-xl border-2 overflow-hidden">
          {active ? (
            <ChatThread
              partner={active.partner}
              messages={active.messages}
              currentUserName={currentUserName}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              Select a conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
