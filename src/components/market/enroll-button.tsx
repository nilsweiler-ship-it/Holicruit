"use client";

import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * Enroll in a program. Completing it would update the candidate's profile (the
 * skill becomes present/verified) and automatically re-run matching — the
 * flywheel. Mocked here.
 */
export function EnrollButton({ programTitle }: { programTitle: string }) {
  return (
    <Button
      className="w-full"
      onClick={() =>
        toast.success(`Enrolled in ${programTitle}`, {
          description: "We'll auto-update your profile and re-run matching when you finish.",
        })
      }
    >
      Enroll &amp; auto-update my profile
      <ArrowRight className="size-4" />
    </Button>
  );
}
