"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CVUploadProps {
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
}

export function CVUpload({ currentUrl, onUploaded }: CVUploadProps) {
  const [uploading, setUploading] = useState(false);
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
      onUploaded(data.url);
      toast.success("CV uploaded successfully");
    } catch {
      toast.error("Failed to upload CV");
    } finally {
      setUploading(false);
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
          disabled={uploading}
        >
          {uploading ? "Uploading..." : currentUrl ? "Replace CV" : "Upload CV"}
        </Button>
        <span className="text-xs text-muted-foreground">
          PDF or DOCX, max 5MB
        </span>
      </div>
    </div>
  );
}
