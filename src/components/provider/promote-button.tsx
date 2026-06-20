"use client";

import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * Provider action: promote (sponsor) or offer a program against a specific
 * skill gap, so it's featured to matched candidates carrying that gap. Mocked.
 */
export function PromoteButton({
  gap,
  label,
  variant = "ghost",
  size = "sm",
  isNew = false,
}: {
  gap: string;
  label?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "sm" | "default";
  isNew?: boolean;
}) {
  return (
    <Button
      variant={variant}
      size={size}
      className="shrink-0"
      onClick={() =>
        toast.success(`${isNew ? "Offering" : "Promoting"} against "${gap}"`, {
          description: "Your program will be featured to matched candidates with this gap.",
        })
      }
    >
      {label ?? (isNew ? "Be the first" : "Promote a program")}
      <ArrowRight className="size-3.5" />
    </Button>
  );
}
