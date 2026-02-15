"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UpgradePrompt } from "@/components/billing/upgrade-prompt";
import { toast } from "sonner";

export function ClaimButton({ roleId }: { roleId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  async function handleClaim() {
    setLoading(true);
    try {
      const res = await fetch(`/api/roles/${roleId}/claim`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error === "QUOTA_EXCEEDED") {
          setUpgradeMessage(data.message || "You have reached your plan limit.");
          setUpgradeOpen(true);
          return;
        }
        toast.error(data.error || "Failed to claim role");
        return;
      }

      toast.success("Role claimed!");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <UpgradePrompt
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        message={upgradeMessage}
        billingUrl="/dashboard/headhunter/billing"
        nextTierName="Pro ($49/mo)"
        nextTierBenefits={[
          "Unlimited role claims",
          "Unlimited submissions",
          "Full candidate profile access",
        ]}
      />
      <Button size="sm" variant="outline" onClick={handleClaim} disabled={loading}>
        {loading ? "Claiming..." : "Claim"}
      </Button>
    </>
  );
}
