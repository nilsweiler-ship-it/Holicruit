"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkillRadarChart } from "@/components/matching/skill-radar-chart";
import { UpgradePrompt } from "@/components/billing/upgrade-prompt";
import { toast } from "sonner";

interface Skill {
  name: string;
  level: number;
  category?: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  skills: Skill[];
}

interface SubmitCandidateFormProps {
  roleId: string;
  headhunterId: string;
  roleHardSkills: Array<{ name: string; level: number }>;
  roleSoftSkills: Array<{ name: string; level: number }>;
  candidates: Candidate[];
}

function buildRadarPoints(
  candidateSkills: Skill[],
  requiredSkills: Array<{ name: string; level: number }>
) {
  return requiredSkills.map((req) => {
    const match = candidateSkills.find(
      (s) => s.name.toLowerCase().trim() === req.name.toLowerCase().trim()
    );
    return {
      label: req.name,
      candidate: match?.level || 0,
      required: req.level,
    };
  });
}

export function SubmitCandidateForm({
  roleId,
  headhunterId,
  roleHardSkills,
  roleSoftSkills,
  candidates,
}: SubmitCandidateFormProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit() {
    if (selectedIds.size === 0) return;
    setLoading(true);

    let submitted = 0;
    let failed = 0;

    for (const candidateId of selectedIds) {
      try {
        const res = await fetch("/api/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ candidateId, roleId, headhunterId }),
        });

        if (!res.ok) {
          const data = await res.json();
          if (data.error === "QUOTA_EXCEEDED") {
            setUpgradeMessage(data.message || "Submission limit reached.");
            setUpgradeOpen(true);
            break;
          }
          failed++;
        } else {
          submitted++;
        }
      } catch {
        failed++;
      }
    }

    if (submitted > 0) {
      toast.success(
        `${submitted} candidate${submitted > 1 ? "s" : ""} submitted${failed > 0 ? ` (${failed} failed)` : ""}`
      );
      router.push("/dashboard/headhunter/submissions");
      router.refresh();
    } else if (failed > 0) {
      toast.error("Failed to submit candidates");
    }

    setLoading(false);
  }

  if (candidates.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground">
          No available candidates to submit for this role.
        </p>
      </div>
    );
  }

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

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {selectedIds.size} candidate{selectedIds.size !== 1 ? "s" : ""} selected
        </p>
        <Button
          onClick={handleSubmit}
          disabled={selectedIds.size === 0 || loading}
        >
          {loading
            ? "Submitting..."
            : `Submit ${selectedIds.size} Candidate${selectedIds.size !== 1 ? "s" : ""}`}
        </Button>
      </div>

      <div className="space-y-3">
        {candidates.map((c) => {
          const isSelected = selectedIds.has(c.id);
          const isExpanded = expandedId === c.id;
          const hardPoints = buildRadarPoints(c.skills, roleHardSkills);
          const softPoints = buildRadarPoints(c.skills, roleSoftSkills);

          const hardMatch = roleHardSkills.length > 0
            ? Math.round(
                hardPoints.reduce((sum, p) => sum + Math.min(p.candidate, p.required), 0) /
                hardPoints.reduce((sum, p) => sum + p.required, 0) * 100
              )
            : 100;
          const softMatch = roleSoftSkills.length > 0
            ? Math.round(
                softPoints.reduce((sum, p) => sum + Math.min(p.candidate, p.required), 0) /
                softPoints.reduce((sum, p) => sum + p.required, 0) * 100
              )
            : 100;

          return (
            <div
              key={c.id}
              className={`rounded-lg border transition-colors ${
                isSelected ? "border-primary bg-primary/5" : "hover:bg-accent/30"
              }`}
            >
              <div
                className="flex items-center gap-3 p-4 cursor-pointer"
                onClick={() => toggleSelect(c.id)}
              >
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                    isSelected
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-input"
                  }`}
                >
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{c.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {c.skills.slice(0, 4).map((s, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] py-0">
                        {s.name} L{s.level}
                      </Badge>
                    ))}
                    {c.skills.length > 4 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{c.skills.length - 4}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className={hardMatch >= 70 ? "bg-green-100 text-green-800" : hardMatch >= 50 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}>
                    Hard: {hardMatch}%
                  </Badge>
                  <Badge variant="secondary" className={softMatch >= 70 ? "bg-green-100 text-green-800" : softMatch >= 50 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}>
                    Soft: {softMatch}%
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedId(isExpanded ? null : c.id);
                    }}
                  >
                    {isExpanded ? "Hide" : "Charts"}
                  </Button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t px-4 py-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {hardPoints.length >= 3 && (
                      <div className="text-center">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Hard Skills ({hardMatch}% match)
                        </p>
                        <SkillRadarChart points={hardPoints} size={260} />
                      </div>
                    )}
                    {softPoints.length >= 3 && (
                      <div className="text-center">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Soft Skills ({softMatch}% match)
                        </p>
                        <SkillRadarChart points={softPoints} size={260} />
                      </div>
                    )}
                    {hardPoints.length < 3 && softPoints.length < 3 && (
                      <p className="text-sm text-muted-foreground col-span-2 text-center py-4">
                        Not enough skills to render radar charts (minimum 3 per category).
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
