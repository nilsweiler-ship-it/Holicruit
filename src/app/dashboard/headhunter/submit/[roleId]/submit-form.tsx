"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UpgradePrompt } from "@/components/billing/upgrade-prompt";
import { MatchRadarChart } from "@/components/matching/match-radar-chart";
import { MatchScoreBadge } from "@/components/matching/match-score-badge";
import { toast } from "sonner";

interface Candidate {
  id: string;
  name: string;
  skills: Array<{ name: string; level: number }>;
}

interface ScorePreview {
  overallScore: number;
  dimensions: {
    hardSkills: number;
    softSkills: number;
    experience: number;
    education: number;
  };
}

interface SubmitCandidateFormProps {
  roleId: string;
  headhunterId: string;
  candidates: Candidate[];
}

export function SubmitCandidateForm({
  roleId,
  headhunterId,
  candidates,
}: SubmitCandidateFormProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const [previewCandidate, setPreviewCandidate] = useState<Candidate | null>(null);
  const [scorePreview, setScorePreview] = useState<ScorePreview | null>(null);
  const [scoringLoading, setScoringLoading] = useState(false);

  useEffect(() => {
    if (!previewCandidate) {
      setScorePreview(null);
      return;
    }

    let cancelled = false;
    setScoringLoading(true);
    setScorePreview(null);

    fetch("/api/match/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateId: previewCandidate.id, roleId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setScorePreview({
            overallScore: data.overallScore,
            dimensions: data.dimensions,
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setScoringLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [previewCandidate, roleId]);

  function handleCandidateClick(candidate: Candidate) {
    setPreviewCandidate(candidate);
  }

  function handleSelectFromDialog() {
    if (previewCandidate) {
      setSelectedId(previewCandidate.id);
      setPreviewCandidate(null);
    }
  }

  async function handleSubmit() {
    if (!selectedId) return;
    setLoading(true);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: selectedId,
          roleId,
          headhunterId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error === "QUOTA_EXCEEDED") {
          setUpgradeMessage(data.message || "You have reached your plan limit.");
          setUpgradeOpen(true);
          return;
        }
        toast.error(data.error || "Failed to submit candidate");
        return;
      }

      toast.success("Candidate submitted successfully!");
      router.push("/dashboard/headhunter/submissions");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (candidates.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No available candidates to submit for this role.
      </p>
    );
  }

  const selectedCandidate = candidates.find((c) => c.id === selectedId);

  return (
    <div className="space-y-4">
      <UpgradePrompt
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        message={upgradeMessage}
        billingUrl="/dashboard/headhunter/billing"
        nextTierName="Pro ($49/mo)"
        nextTierBenefits={[
          "Unlimited role claims",
          "Unlimited submissions",
          "Full candidate profile access",
        ]}
      />

      <Dialog
        open={!!previewCandidate}
        onOpenChange={(open) => {
          if (!open) setPreviewCandidate(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-6">
              <span>{previewCandidate?.name}</span>
              {scorePreview && (
                <MatchScoreBadge score={scorePreview.overallScore} />
              )}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {previewCandidate?.skills.length ?? 0} skills
            </p>
          </DialogHeader>

          <div className="space-y-4">
            {scoringLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-500" />
              </div>
            )}

            {scorePreview && (
              <>
                <MatchRadarChart scores={scorePreview.dimensions} />

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Hard Skills", value: scorePreview.dimensions.hardSkills, color: "bg-indigo-500" },
                    { label: "Soft Skills", value: scorePreview.dimensions.softSkills, color: "bg-emerald-500" },
                    { label: "Experience", value: scorePreview.dimensions.experience, color: "bg-amber-500" },
                    { label: "Education", value: scorePreview.dimensions.education, color: "bg-rose-500" },
                  ].map((d) => (
                    <div key={d.label} className="rounded-lg border p-2.5">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`h-2.5 w-2.5 rounded-full ${d.color}`} />
                        <span className="text-xs text-muted-foreground">{d.label}</span>
                      </div>
                      <p className="text-lg font-semibold">{Math.round(d.value)}%</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {previewCandidate && previewCandidate.skills.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Skills</p>
                <div className="flex flex-wrap gap-1">
                  {previewCandidate.skills.map((s, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {s.name} (L{s.level})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button className="w-full" onClick={handleSelectFromDialog}>
              Select This Candidate
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-2">
        {candidates.map((c) => (
          <div
            key={c.id}
            onClick={() => handleCandidateClick(c)}
            className={`cursor-pointer rounded-lg border p-3 transition-colors ${
              selectedId === c.id
                ? "border-primary bg-primary/5"
                : "hover:bg-accent/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-muted-foreground">{c.skills.length} skills</p>
              </div>
              {selectedId === c.id && <Badge>Selected</Badge>}
            </div>
            {c.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {c.skills.slice(0, 5).map((s, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {s.name} (L{s.level})
                  </Badge>
                ))}
                {c.skills.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{c.skills.length - 5} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedCandidate && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
          Selected: <span className="font-medium">{selectedCandidate.name}</span>
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!selectedId || loading}
        className="w-full"
      >
        {loading ? "Submitting..." : "Submit Candidate"}
      </Button>
    </div>
  );
}
