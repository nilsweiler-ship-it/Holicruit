"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Check, Plus, Zap } from "lucide-react";
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
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - percentage / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/40"
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
        {/* Percentage text (rotated back to upright) */}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-foreground rotate-90 origin-center text-xl font-bold"
        >
          {percentage}%
        </text>
      </svg>
      <span className="text-sm text-muted-foreground">Profile completeness</span>
    </div>
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
  const headline = bio && bio.trim().length > 0 ? bio.trim() : "Full-stack Developer";

  return (
    <div className="space-y-6">
      {/* A) Hero section */}
      <Card>
        <CardContent className="flex items-center justify-between py-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-20 text-2xl">
              <AvatarFallback className="text-2xl">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{userName}</h1>
              <p className="text-muted-foreground">{headline}</p>
            </div>
          </div>
          <CompletenessRing percentage={completeness} />
        </CardContent>
      </Card>

      {/* B) Hard Skills section */}
      <Card>
        <CardHeader>
          <CardTitle>Hard skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            {hardSkills.map((skill, index) => {
              const isVerified = skill.level >= 4;
              return (
                <Badge
                  key={`${skill.name}-${index}`}
                  variant={isVerified ? "default" : "outline"}
                  className="gap-1 px-3 py-1.5 text-sm"
                >
                  {isVerified && <Check className="size-3" />}
                  {skill.name}
                </Badge>
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => setShowAddSkill(true)}
              >
                <Plus className="size-3.5" />
                Add skill
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* C) Soft Skills section */}
      <Card>
        <CardHeader>
          <CardTitle>Soft skills</CardTitle>
          <CardDescription>
            From a short scenario test, not self-rated
          </CardDescription>
        </CardHeader>
        <CardContent>
          {softSkills.length > 0 ? (
            <div className="space-y-4">
              {softSkills.map((skill, index) => (
                <div
                  key={`${skill.name}-${index}`}
                  className="flex items-center gap-4"
                >
                  <span className="w-32 shrink-0 text-sm font-medium">
                    {skill.name}
                  </span>
                  <Progress
                    value={(skill.level / 5) * 100}
                    className="flex-1"
                  />
                  <span className="w-10 shrink-0 text-right text-sm text-muted-foreground">
                    {skill.level}/5
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No soft skill scores yet. Complete a scenario test to get your
              results.
            </p>
          )}
        </CardContent>
      </Card>

      {/* D) Primary CTA */}
      <Button
        size="lg"
        className="w-full gap-2 py-6 text-base"
        onClick={() => toast("Coming soon!")}
      >
        <Zap className="size-5" />
        Take the 8-min skill scenario
      </Button>
    </div>
  );
}
