"use client";

import { useState, useTransition } from "react";
import { Check, FileUp, Loader2, Wand2 } from "lucide-react";
import { parseProfileText, parseProfilePdf, addImportedSkills } from "@/lib/actions/candidate";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Two-step import: paste → extract (parse) → review the recognised skills →
 * confirm. Nothing is saved until the candidate confirms their selection.
 */
export function ImportReview() {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<{ skills: string[]; industry: string } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [parsing, startParse] = useTransition();
  const [adding, startAdd] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);

  function extract() {
    startParse(async () => {
      const r = await parseProfileText(text);
      setParsed(r);
      setSelected(new Set(r.skills));
    });
  }

  function extractPdf(file: File) {
    setUploadError(null);
    const fd = new FormData();
    fd.set("file", file);
    startParse(async () => {
      const r = await parseProfilePdf(fd);
      if ("error" in r) {
        setUploadError(r.error);
        return;
      }
      setText(r.text);
      setParsed({ skills: r.skills, industry: r.industry });
      setSelected(new Set(r.skills));
    });
  }

  function toggle(s: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  }

  if (!parsed) {
    return (
      <div className="flex flex-col gap-3">
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card/60 p-6 text-center transition-colors hover:border-primary/40 hover:bg-accent">
          <FileUp className="size-6 text-primary" />
          <span className="text-sm font-medium text-foreground">Upload your CV as a PDF</span>
          <span className="text-xs text-muted-foreground">
            We read the text and extract your skills — the file itself isn&apos;t stored. Max 5 MB.
          </span>
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            disabled={parsing}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) extractPdf(f);
              e.target.value = "";
            }}
          />
        </label>
        {uploadError && <p className="text-sm text-primary">{uploadError}</p>}

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">or paste the text</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          placeholder={"Paste your CV or experience here…\n\ne.g. \"6 years building React + TypeScript apps, system design, testing. Strong communication and ownership.\""}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
        <Button disabled={!text.trim() || parsing} onClick={extract} className="self-start">
          {parsing ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
          Extract skills
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        We recognised <span className="font-semibold text-foreground">{parsed.skills.length}</span>{" "}
        skill{parsed.skills.length === 1 ? "" : "s"}
        {parsed.industry !== "General" && (
          <>
            {" "}· industry <span className="font-semibold text-foreground">{parsed.industry}</span>
          </>
        )}
        . Pick the ones to add — verification is still earned via endorsements.
      </p>

      {parsed.skills.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          No skills recognised — try pasting more detail.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {parsed.skills.map((s) => {
            const on = selected.has(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggle(s)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition-colors",
                  on
                    ? "bg-primary/12 text-primary ring-1 ring-primary/30"
                    : "bg-muted text-muted-foreground hover:bg-accent",
                )}
              >
                {on && <Check className="size-3.5" />}
                {s}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex gap-2">
        <Button disabled={selected.size === 0 || adding} onClick={() => startAdd(() => void addImportedSkills([...selected], parsed.industry))}>
          {adding ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          Add {selected.size} skill{selected.size === 1 ? "" : "s"}
        </Button>
        <Button variant="outline" onClick={() => setParsed(null)} disabled={adding}>
          Back
        </Button>
      </div>
    </div>
  );
}
