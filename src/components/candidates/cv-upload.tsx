"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { ParsedCV } from "@/lib/ai";

interface CVUploadProps {
  currentUrl?: string | null;
  onUploaded: (url: string, parsed?: ParsedCV | null) => void;
}

export function CVUpload({ currentUrl, onUploaded }: CVUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !file.name.endsWith(".pdf") &&
      !file.name.endsWith(".docx") &&
      !file.name.endsWith(".doc")
    ) {
      toast.error("Please upload a PDF or DOCX file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/candidates/upload-cv", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      onUploaded(data.url, data.parsed);

      if (data.parsed) {
        toast.success("CV uploaded and analyzed successfully");
      } else if (data.parseError) {
        toast.warning(`CV uploaded. ${data.parseError}`);
      } else {
        toast.success("CV uploaded successfully");
      }
    } catch {
      toast.error("Failed to upload CV");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleReanalyze() {
    setReanalyzing(true);
    try {
      const res = await fetch("/api/candidates/parse-cv", {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Re-analysis failed");
      }

      const data = await res.json();
      onUploaded(currentUrl || "", data.parsed);
      toast.success("CV re-analyzed successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to re-analyze CV"
      );
    } finally {
      setReanalyzing(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Resume / CV</label>
      {currentUrl && (
        <p className="text-sm text-muted-foreground">
          Current file:{" "}
          <a href={currentUrl} className="underline" target="_blank">
            {currentUrl.split("/").pop()}
          </a>
        </p>
      )}
      <div className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleUpload}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || reanalyzing}
        >
          {uploading
            ? "Uploading & Analyzing..."
            : currentUrl
              ? "Replace CV"
              : "Upload CV"}
        </Button>
        {currentUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReanalyze}
            disabled={uploading || reanalyzing}
          >
            {reanalyzing ? "Analyzing..." : "Re-analyze CV"}
          </Button>
        )}
        <span className="text-xs text-muted-foreground">
          PDF or DOCX, max 5MB
        </span>
      </div>
    </div>
  );
}
