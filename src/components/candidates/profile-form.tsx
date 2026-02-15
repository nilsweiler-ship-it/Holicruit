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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SkillInput } from "@/components/roles/skill-input";
import { CVUpload } from "./cv-upload";
import { toast } from "sonner";
import type { Skill, ExperienceEntry, EducationEntry } from "@/types";

interface ProfileFormProps {
  profile: {
    bio: string | null;
    resumeUrl: string | null;
    skills: string;
    experience: string;
    education: string;
    visibility: string;
  };
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [bio, setBio] = useState(profile.bio || "");
  const [resumeUrl, setResumeUrl] = useState(profile.resumeUrl || "");
  const [skills, setSkills] = useState<Skill[]>(
    JSON.parse(profile.skills || "[]")
  );
  const [experience, setExperience] = useState<ExperienceEntry[]>(
    JSON.parse(profile.experience || "[]")
  );
  const [education, setEducation] = useState<EducationEntry[]>(
    JSON.parse(profile.education || "[]")
  );

  function addExperience() {
    setExperience([
      ...experience,
      { title: "", company: "", years: 0, description: "" },
    ]);
  }

  function updateExperience(index: number, field: string, value: string | number) {
    const updated = [...experience];
    updated[index] = { ...updated[index], [field]: value };
    setExperience(updated);
  }

  function removeExperience(index: number) {
    setExperience(experience.filter((_, i) => i !== index));
  }

  function addEducation() {
    setEducation([
      ...education,
      { degree: "", institution: "", year: new Date().getFullYear() },
    ]);
  }

  function updateEducation(index: number, field: string, value: string | number) {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  }

  function removeEducation(index: number) {
    setEducation(education.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/candidates/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          skills,
          experience,
          education,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>
          <CVUpload currentUrl={resumeUrl} onUploaded={setResumeUrl} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <SkillInput skills={skills} onChange={setSkills} label="Your Skills" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Experience</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addExperience}>
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {experience.map((exp, i) => (
            <div key={i} className="space-y-2 rounded-lg border p-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Experience #{i + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExperience(i)}
                >
                  Remove
                </Button>
              </div>
              <div className="grid gap-2 md:grid-cols-3">
                <div>
                  <Label className="text-xs">Title</Label>
                  <Input
                    value={exp.title}
                    onChange={(e) =>
                      updateExperience(i, "title", e.target.value)
                    }
                    placeholder="Job title"
                  />
                </div>
                <div>
                  <Label className="text-xs">Company</Label>
                  <Input
                    value={exp.company}
                    onChange={(e) =>
                      updateExperience(i, "company", e.target.value)
                    }
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <Label className="text-xs">Years</Label>
                  <Input
                    type="number"
                    min={0}
                    value={exp.years}
                    onChange={(e) =>
                      updateExperience(i, "years", Number(e.target.value))
                    }
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={exp.description || ""}
                  onChange={(e) =>
                    updateExperience(i, "description", e.target.value)
                  }
                  placeholder="Brief description of responsibilities"
                  rows={2}
                />
              </div>
            </div>
          ))}
          {experience.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No experience entries. Click &quot;Add&quot; to add one.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Education</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addEducation}>
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {education.map((edu, i) => (
            <div key={i} className="space-y-2 rounded-lg border p-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Education #{i + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEducation(i)}
                >
                  Remove
                </Button>
              </div>
              <div className="grid gap-2 md:grid-cols-3">
                <div>
                  <Label className="text-xs">Degree</Label>
                  <Input
                    value={edu.degree}
                    onChange={(e) =>
                      updateEducation(i, "degree", e.target.value)
                    }
                    placeholder="e.g. Bachelor of Science"
                  />
                </div>
                <div>
                  <Label className="text-xs">Institution</Label>
                  <Input
                    value={edu.institution}
                    onChange={(e) =>
                      updateEducation(i, "institution", e.target.value)
                    }
                    placeholder="University name"
                  />
                </div>
                <div>
                  <Label className="text-xs">Year</Label>
                  <Input
                    type="number"
                    value={edu.year}
                    onChange={(e) =>
                      updateEducation(i, "year", Number(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>
          ))}
          {education.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No education entries. Click &quot;Add&quot; to add one.
            </p>
          )}
        </CardContent>
      </Card>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}
