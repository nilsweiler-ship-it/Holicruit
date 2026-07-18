"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { PersonAvatar } from "@/components/people/person-avatar";
import { updateAvatar } from "@/lib/actions/candidate";
import type { Person } from "@/lib/types";

/**
 * Profile-photo uploader. Resizes the chosen image client-side to a small square
 * data URL and saves it via a server action — no external storage needed.
 */
export function AvatarUpload({
  person,
  size = 64,
}: {
  person: Pick<Person, "name" | "initials" | "avatarUrl">;
  size?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function onFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      const s = 256;
      const canvas = document.createElement("canvas");
      canvas.width = s;
      canvas.height = s;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const scale = Math.max(s / img.width, s / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (s - w) / 2, (s - h) / 2, w, h);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
      URL.revokeObjectURL(img.src);
      startTransition(async () => {
        await updateAvatar(dataUrl);
        router.refresh();
      });
    };
    img.onerror = () => setError("Couldn't read that image.");
    img.src = URL.createObjectURL(file);
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        aria-label="Upload profile photo"
        title="Upload a photo"
      >
        <PersonAvatar person={person} size={size} />
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/45 text-background opacity-0 transition-opacity group-hover:opacity-100">
          {pending ? <Loader2 className="size-5 animate-spin" /> : <Camera className="size-5" />}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
