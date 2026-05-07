"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { ParsedCV } from "@/lib/ai";
import type { Skill, ExperienceEntry, EducationEntry } from "@/types";

interface CVReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parsedData: ParsedCV;
  onApply: (data: {
    bio?: string;
    skills?: Skill[];
    experience?: ExperienceEntry[];
    education?: EducationEntry[];
  }) => void;
}

export function CVReviewDialog({
  open,
  onOpenChange,
  parsedData,
  onApply,
}: CVReviewDialogProps) {
  const [selected, setSelected] = useState({
    bio: true,
    skills: true,
    experience: true,
    education: true,
  });

  function toggle(key: keyof typeof selected) {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleApplySelected() {
    const data: Parameters<typeof onApply>[0] = {};
    if (selected.bio && parsedData.bio) data.bio = parsedData.bio;
    if (selected.skills) data.skills = parsedData.skills;
    if (selected.experience) data.experience = parsedData.experience;
    if (selected.education) data.education = parsedData.education;
    onApply(data);
    onOpenChange(false);
  }

  function handleApplyAll() {
    onApply({
      bio: parsedData.bio || undefined,
      skills: parsedData.skills,
      experience: parsedData.experience,
      education: parsedData.education,
    });
    onOpenChange(false);
  }

  const levelLabels = ["", "Beginner", "Some exp.", "Proficient", "Advanced", "Expert"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>CV Analysis Results</DialogTitle>
          <DialogDescription>
            Review the extracted data and select which sections to apply to your
            profile. You can still edit everything before saving.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Bio */}
          {parsedData.bio && (
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="cv-bio"
                  checked={selected.bio}
                  onCheckedChange={() => toggle("bio")}
                />
                <Label htmlFor="cv-bio" className="text-sm font-semibold">
                  Bio / Summary
                </Label>
              </div>
              <p className="ml-6 text-sm text-muted-foreground">
                {parsedData.bio}
              </p>
            </section>
          )}

          {/* Skills */}
          {parsedData.skills.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="cv-skills"
                  checked={selected.skills}
                  onCheckedChange={() => toggle("skills")}
                />
                <Label htmlFor="cv-skills" className="text-sm font-semibold">
                  Skills ({parsedData.skills.length})
                </Label>
              </div>
              <div className="ml-6 flex flex-wrap gap-1.5">
                {parsedData.skills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {skill.name}{" "}
                    <span className="ml-1 text-muted-foreground">
                      L{skill.level} — {levelLabels[skill.level]}
                    </span>
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Experience */}
          {parsedData.experience.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="cv-experience"
                  checked={selected.experience}
                  onCheckedChange={() => toggle("experience")}
                />
                <Label htmlFor="cv-experience" className="text-sm font-semibold">
                  Experience ({parsedData.experience.length})
                </Label>
              </div>
              <div className="ml-6 space-y-2">
                {parsedData.experience.map((exp, i) => (
                  <div key={i} className="rounded border p-2 text-sm">
                    <div className="font-medium">
                      {exp.title} at {exp.company}
                    </div>
                    <div className="text-muted-foreground">
                      {exp.years} year{exp.years !== 1 ? "s" : ""}
                      {exp.description && ` — ${exp.description}`}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {parsedData.education.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="cv-education"
                  checked={selected.education}
                  onCheckedChange={() => toggle("education")}
                />
                <Label htmlFor="cv-education" className="text-sm font-semibold">
                  Education ({parsedData.education.length})
                </Label>
              </div>
              <div className="ml-6 space-y-2">
                {parsedData.education.map((edu, i) => (
                  <div key={i} className="rounded border p-2 text-sm">
                    <div className="font-medium">{edu.degree}</div>
                    <div className="text-muted-foreground">
                      {edu.institution}, {edu.year}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={handleApplySelected}>
            Apply Selected
          </Button>
          <Button onClick={handleApplyAll}>Apply All</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
