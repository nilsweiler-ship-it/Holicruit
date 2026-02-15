"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ApplyButtonClient({
  roleId,
  candidateProfileId,
}: {
  roleId: string;
  candidateProfileId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleApply() {
    setLoading(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: candidateProfileId,
          roleId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to apply");
        return;
      }

      toast.success("Applied successfully!");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" onClick={handleApply} disabled={loading}>
      {loading ? "Applying..." : "Apply"}
    </Button>
  );
}
