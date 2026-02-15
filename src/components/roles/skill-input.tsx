"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Skill } from "@/types";

interface SkillInputProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
  showRequired?: boolean;
  label?: string;
}

export function SkillInput({
  skills,
  onChange,
  showRequired = false,
  label = "Skills",
}: SkillInputProps) {
  const [name, setName] = useState("");
  const [level, setLevel] = useState(3);

  function addSkill() {
    if (!name.trim()) return;
    if (skills.some((s) => s.name.toLowerCase() === name.trim().toLowerCase()))
      return;
    onChange([...skills, { name: name.trim(), level, required: true }]);
    setName("");
    setLevel(3);
  }

  function removeSkill(index: number) {
    onChange(skills.filter((_, i) => i !== index));
  }

  function toggleRequired(index: number) {
    const updated = [...skills];
    updated[index] = { ...updated[index], required: !updated[index].required };
    onChange(updated);
  }

  function updateLevel(index: number, newLevel: number) {
    const updated = [...skills];
    updated[index] = { ...updated[index], level: newLevel };
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-2">
        <Input
          placeholder="Skill name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill();
            }
          }}
          className="flex-1"
        />
        <select
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
          className="rounded-md border px-2 text-sm"
        >
          {[1, 2, 3, 4, 5].map((l) => (
            <option key={l} value={l}>
              Lvl {l}
            </option>
          ))}
        </select>
        <Button type="button" onClick={addSkill} size="sm">
          Add
        </Button>
      </div>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <div
              key={i}
              className="flex items-center gap-1 rounded-md border px-2 py-1"
            >
              <span className="text-sm font-medium">{skill.name}</span>
              <select
                value={skill.level}
                onChange={(e) => updateLevel(i, Number(e.target.value))}
                className="border-0 bg-transparent text-xs p-0"
              >
                {[1, 2, 3, 4, 5].map((l) => (
                  <option key={l} value={l}>
                    L{l}
                  </option>
                ))}
              </select>
              {showRequired && (
                <Badge
                  variant={skill.required ? "default" : "secondary"}
                  className="cursor-pointer text-xs"
                  onClick={() => toggleRequired(i)}
                >
                  {skill.required ? "Req" : "Nice"}
                </Badge>
              )}
              <button
                type="button"
                onClick={() => removeSkill(i)}
                className="ml-1 text-muted-foreground hover:text-destructive text-xs"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
