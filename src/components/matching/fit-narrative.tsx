"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, Sparkles } from "lucide-react";

interface FitNarrativeProps {
  candidateId: string;
  roleId: string;
  canAccess: boolean;
}

export function FitNarrative({
  candidateId,
  roleId,
  canAccess,
}: FitNarrativeProps) {
  const [narrative, setNarrative] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/match/narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, roleId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate narrative");
      }

      const data = await res.json();
      setNarrative(data.narrative);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate analysis"
      );
    } finally {
      setLoading(false);
    }
  }

  if (!canAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4" />
            AI Fit Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            AI-powered fit narratives are available on Professional and
            Enterprise plans. Upgrade to get detailed qualitative assessments
            of candidate-role fit.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4" />
            AI Fit Analysis
          </CardTitle>
          {!narrative && (
            <Button
              size="sm"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate AI Analysis"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Analyzing candidate fit...
          </div>
        )}
        {narrative && (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {narrative.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        )}
        {!narrative && !loading && (
          <p className="text-sm text-muted-foreground">
            Click &quot;Generate AI Analysis&quot; for a detailed qualitative
            assessment of this candidate&apos;s fit for the role.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
