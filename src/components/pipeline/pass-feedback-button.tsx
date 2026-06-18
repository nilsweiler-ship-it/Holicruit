"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PassFeedbackButtonProps {
  applicationId: string;
}

export function PassFeedbackButton({ applicationId }: PassFeedbackButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handlePass() {
    setLoading(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: "REJECTED" }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Candidate passed — feedback will be drafted.");
      router.push(`/dashboard/hiring-manager/applications/${applicationId}`);
      router.refresh();
    } catch {
      toast.error("Failed to update application stage");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      className="flex-1 gap-2"
      onClick={handlePass}
      disabled={loading}
    >
      <ArrowRight className="h-4 w-4" />
      {loading ? "Processing..." : "Pass + feedback"}
    </Button>
  );
}
