"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SkillInput } from "./skill-input";
import { UpgradePrompt } from "@/components/billing/upgrade-prompt";
import { toast } from "sonner";
import type { Skill, RoleWeights, RoleType } from "@/types";
import { ROLE_TYPES } from "@/types";

const STEPS = [
  "Basic Info",
  "Hard Skills",
  "Soft Skills",
  "Weights",
  "Review",
];

export function RoleForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [roleType, setRoleType] = useState<RoleType>("PERMANENT");
  const [bounty, setBounty] = useState<string>("");
  const [hardSkills, setHardSkills] = useState<Skill[]>([]);
  const [softSkills, setSoftSkills] = useState<Skill[]>([]);
  const [weights, setWeights] = useState<RoleWeights>({
    hardSkills: 40,
    softSkills: 25,
    experience: 25,
    education: 10,
  });
  const [threshold, setThreshold] = useState(70);

  const totalWeight =
    weights.hardSkills + weights.softSkills + weights.experience + weights.education;

  async function handleSubmit(status: "DRAFT" | "PUBLISHED") {
    setLoading(true);
    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          roleType,
          bounty: bounty ? Math.round(parseFloat(bounty) * 100) : undefined,
          hardSkills,
          softSkills,
          weights,
          threshold,
          status,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error === "QUOTA_EXCEEDED") {
          setUpgradeMessage(data.message || "You have reached your plan limit.");
          setUpgradeOpen(true);
          setLoading(false);
          return;
        }
        toast.error(data.error || "Failed to create role");
        setLoading(false);
        return;
      }

      toast.success(
        status === "PUBLISHED" ? "Role published!" : "Role saved as draft"
      );
      router.push("/dashboard/hiring-manager/roles");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <UpgradePrompt
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        message={upgradeMessage}
        billingUrl="/dashboard/hiring-manager/billing"
        nextTierName="Professional ($99/mo)"
        nextTierBenefits={[
          "10 active roles",
          "50 apps per role",
          "Full match breakdown",
          "Gap analysis",
          "5 team members",
        ]}
      />
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep(i)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                i === step
                  ? "bg-primary text-primary-foreground"
                  : i < step
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </button>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 w-8 ${i < step ? "bg-primary" : "bg-muted"}`}
              />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step]}</CardTitle>
          <CardDescription>Step {step + 1} of {STEPS.length}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label>Role Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior React Developer"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the role, responsibilities, and requirements..."
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <Label>Role Type</Label>
                <select
                  value={roleType}
                  onChange={(e) => setRoleType(e.target.value as RoleType)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  {ROLE_TYPES.map((rt) => (
                    <option key={rt.value} value={rt.value}>
                      {rt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Headhunter Bounty (optional)</Label>
                <Input
                  type="number"
                  value={bounty}
                  onChange={(e) => setBounty(e.target.value)}
                  placeholder="e.g. 3000 (in USD, overrides default platform split)"
                  min="0"
                  step="100"
                />
                <p className="text-xs text-muted-foreground">
                  Set a custom bounty for headhunters. Leave empty to use the platform default (60/40 split of hire fee).
                </p>
              </div>
            </>
          )}

          {step === 1 && (
            <SkillInput
              skills={hardSkills}
              onChange={setHardSkills}
              showRequired
              label="Hard Skills (Technical)"
            />
          )}

          {step === 2 && (
            <SkillInput
              skills={softSkills}
              onChange={setSoftSkills}
              label="Soft Skills"
            />
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Adjust the importance of each dimension. Total must equal 100%.
              </p>
              {(
                Object.entries(weights) as [keyof RoleWeights, number][]
              ).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <Label className="capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </Label>
                    <span className="font-medium">{value}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={value}
                    onChange={(e) =>
                      setWeights({ ...weights, [key]: Number(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>
              ))}
              <div
                className={`text-sm font-medium ${totalWeight === 100 ? "text-green-600" : "text-destructive"}`}
              >
                Total: {totalWeight}%{" "}
                {totalWeight !== 100 && "(must equal 100%)"}
              </div>

              <div className="space-y-2">
                <Label>Auto-shortlist Threshold</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="w-12 text-right font-medium">
                    {threshold}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Candidates scoring above this threshold will be
                  auto-shortlisted.
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Title</h3>
                <p className="text-muted-foreground">{title || "—"}</p>
              </div>
              <div>
                <h3 className="font-medium">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {description || "—"}
                </p>
              </div>
              <div>
                <h3 className="font-medium">
                  Hard Skills ({hardSkills.length})
                </h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {hardSkills.map((s, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs"
                    >
                      {s.name} (L{s.level})
                      {s.required ? " *" : ""}
                    </span>
                  ))}
                  {hardSkills.length === 0 && (
                    <span className="text-muted-foreground text-sm">None</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-medium">
                  Soft Skills ({softSkills.length})
                </h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {softSkills.map((s, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs"
                    >
                      {s.name} (L{s.level})
                    </span>
                  ))}
                  {softSkills.length === 0 && (
                    <span className="text-muted-foreground text-sm">None</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-medium">Weights</h3>
                <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
                  {Object.entries(weights).map(([key, value]) => (
                    <div key={key}>
                      <span className="capitalize text-muted-foreground">
                        {key.replace(/([A-Z])/g, " $1").trim()}:
                      </span>{" "}
                      {value}%
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium">Threshold</h3>
                <p className="text-muted-foreground">{threshold}%</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
        >
          Previous
        </Button>
        <div className="flex gap-2">
          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 0 && (!title.trim() || !description.trim())) ||
                (step === 1 && hardSkills.length === 0)
              }
            >
              Next
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => handleSubmit("DRAFT")}
                disabled={loading}
              >
                Save Draft
              </Button>
              <Button
                onClick={() => handleSubmit("PUBLISHED")}
                disabled={loading || totalWeight !== 100}
              >
                {loading ? "Publishing..." : "Publish Role"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
