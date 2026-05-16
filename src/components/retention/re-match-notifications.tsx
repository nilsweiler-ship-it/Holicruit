"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RoleMatch {
  id: string;
  title: string;
  estimatedScore: number;
  threshold: number;
  company: { name: string };
}

interface ReMatchNotificationsProps {
  matches: RoleMatch[];
}

export function ReMatchNotifications({ matches }: ReMatchNotificationsProps) {
  if (matches.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground">
          No new role matches yet. Keep improving your profile — we&apos;ll
          notify you when new roles match your skills.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((match) => (
        <div
          key={match.id}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <div className="space-y-1">
            <p className="font-medium text-sm">{match.title}</p>
            <p className="text-xs text-muted-foreground">
              {match.company.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800"
            >
              {match.estimatedScore}% match
            </Badge>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/dashboard/candidate/matches`}>Apply</Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
