"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { ArrowRight, Check, Plus } from "lucide-react";
import type { Skill } from "@/types";

interface ProfileFormProps {
  userName: string;
  profile: {
    bio: string | null;
    resumeUrl: string | null;
    skills: string;
    experience: string;
    education: string;
    visibility: string;
  };
  completeness: number;
  hardSkills: Skill[];
  softSkills: Skill[];
}

function CompletenessRing({ percentage }: { percentage: number }) {
  const size = 56;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - percentage / 100);

  return (
    <svg
      width={size}
      height={size}
      className="-rotate-90 shrink-0"
    >
      {/* Background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted"
      />
      {/* Filled arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashoffset}
        className="text-primary transition-all duration-500"
      />
      {/* Percentage text */}
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-foreground rotate-90 origin-center text-xs font-bold"
      >
        {percentage}%
      </text>
    </svg>
  );
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

export function ProfileForm({
  userName,
  profile,
  completeness,
  hardSkills: initialHardSkills,
  softSkills,
}: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hardSkills, setHardSkills] = useState<Skill[]>(initialHardSkills);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");

  async function save(allSkills: Skill[]) {
    setLoading(true);
    try {
      const res = await fetch("/api/candidates/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: profile.bio,
          skills: allSkills,
          experience: JSON.parse(profile.experience || "[]"),
          education: JSON.parse(profile.education || "[]"),
          visibility: profile.visibility,
        }),
      });

      if (!res.ok) throw new Error();

      toast.success("Profile updated!");
      router.refresh();
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  function handleAddSkill() {
    const trimmed = newSkillName.trim();
    if (!trimmed) return;

    const newSkill: Skill = { name: trimmed, level: 3, category: "hard" };
    const updatedHardSkills = [...hardSkills, newSkill];
    setHardSkills(updatedHardSkills);
    setNewSkillName("");
    setShowAddSkill(false);

    // Combine with soft skills and save
    const allSkills = [...updatedHardSkills, ...softSkills];
    save(allSkills);
  }

  const bio = profile.bio;
  const headline =
    bio && bio.trim().length > 0 ? bio.trim() : "Full-stack Developer";

  return (
    <div className="space-y-6">
      {/* A) Hero section: avatar + name + completeness ring in one row */}
      <div className="flex items-center gap-4 rounded-xl border-2 bg-card p-5">
        <Avatar className="size-[58px] text-xl shrink-0">
          <AvatarFallback className="text-xl">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{userName}</h1>
          <p className="text-sm text-muted-foreground truncate">{headline}</p>
        </div>
        <CompletenessRing percentage={completeness} />
      </div>

      {/* B) Hard Skills section */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">&#x1F527; Hard skills</h2>
        <div className="flex flex-wrap items-center gap-2">
          {hardSkills.map((skill, index) => {
            const isVerified = skill.level >= 4;
            return (
              <span
                key={`${skill.name}-${index}`}
                className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-sm ${
                  isVerified
                    ? "bg-[#FFE27A] text-foreground"
                    : "text-foreground"
                }`}
              >
                <Check className="size-3.5" />
                {skill.name}
                {isVerified && (
                  <span className="text-foreground/60 text-xs">
                    &middot; peer-verified
                  </span>
                )}
              </span>
            );
          })}

          {showAddSkill ? (
            <div className="flex items-center gap-2">
              <Input
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                  if (e.key === "Escape") {
                    setShowAddSkill(false);
                    setNewSkillName("");
                  }
                }}
                placeholder="Skill name"
                className="h-8 w-40"
                autoFocus
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddSkill}
                disabled={loading || !newSkillName.trim()}
              >
                Add
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddSkill(true)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1 text-sm text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
            >
              <Plus className="size-3.5" />
              add
            </button>
          )}
        </div>
      </div>

      {/* C) Soft Skills section */}
      <div className="space-y-3">
        <div>
        <h2 className="text-sm font-semibold">&#x2764;&#xFE0F; Soft skills</h2>
          <p className="text-xs text-muted-foreground">
            from a short scenario test, not self-rated
          </p>
        </div>

        {softSkills.length > 0 ? (
          <div className="space-y-3">
            {softSkills.map((skill, index) => (
              <div
                key={`${skill.name}-${index}`}
                className="flex items-center gap-3"
              >
                <span className="w-28 shrink-0 text-sm">{skill.name}</span>
                <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-foreground transition-all duration-500"
                    style={{ width: `${(skill.level / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No soft skill scores yet. Complete a scenario test to get your
            results.
          </p>
        )}
      </div>

      {/* D) Primary CTA */}
      <Button
        size="lg"
        className="w-full py-6 text-base font-bold bg-foreground text-background hover:bg-foreground/90"
        onClick={() => toast("Coming soon!")}
      >
        Take the 8-min skill scenario
        <ArrowRight className="size-4 ml-1" />
      </Button>
    </div>
  );
}
