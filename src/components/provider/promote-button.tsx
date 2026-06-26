"use client";

import { useTransition } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setSponsored } from "@/lib/actions/provider";

/**
 * Provider action: promote (sponsor) or offer a program against a specific
 * skill gap, so it's featured to matched candidates carrying that gap. When a
 * `programId` is supplied (a provider's own program row), it persists the boost
 * via the server action; otherwise it's the toast-only gap-demand affordance.
 */
export function PromoteButton({
  gap,
  label,
  variant = "ghost",
  size = "sm",
  isNew = false,
  programId,
}: {
  gap: string;
  label?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "sm" | "default";
  isNew?: boolean;
  programId?: string;
}) {
  const [, startTransition] = useTransition();

  return (
    <Button
      variant={variant}
      size={size}
      className="shrink-0"
      onClick={() => {
        if (programId) {
          startTransition(() => setSponsored(programId, true));
        }
        toast.success(`${isNew ? "Offering" : "Promoting"} against "${gap}"`, {
          description: "Your program will be featured to matched candidates with this gap.",
        });
      }}
    >
      {label ?? (isNew ? "Be the first" : "Promote a program")}
      <ArrowRight className="size-3.5" />
    </Button>
  );
}
