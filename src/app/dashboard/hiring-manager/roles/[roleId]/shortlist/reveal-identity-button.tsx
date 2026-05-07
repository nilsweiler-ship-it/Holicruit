"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function RevealIdentityButton({
  applicationId,
}: {
  applicationId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleReveal() {
    setLoading(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}/reveal`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to reveal identity");
        return;
      }

      toast.success("Identity revealed");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleReveal}
      disabled={loading}
      className="text-xs"
    >
      {loading ? "Revealing..." : "Reveal Identity"}
    </Button>
  );
}
