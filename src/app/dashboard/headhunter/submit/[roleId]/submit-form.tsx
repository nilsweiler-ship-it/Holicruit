"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UpgradePrompt } from "@/components/billing/upgrade-prompt";
import { toast } from "sonner";

interface Candidate {
  id: string;
  name: string;
  email: string;
  skills: Array<{ name: string; level: number }>;
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
      <div className="space-y-2">
        {candidates.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelectedId(c.id)}
            className={`cursor-pointer rounded-lg border p-3 transition-colors ${
              selectedId === c.id
                ? "border-primary bg-primary/5"
                : "hover:bg-accent/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-muted-foreground">{c.email}</p>
              </div>
              {selectedId === c.id && (
                <Badge>Selected</Badge>
              )}
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
