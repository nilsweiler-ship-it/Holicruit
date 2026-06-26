"use client";

"use client";

import { useTransition } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { enroll } from "@/lib/actions/candidate";

/**
 * Enroll in a program. Completing it would update the candidate's profile (the
 * skill becomes present/verified) and automatically re-run matching — the
 * flywheel. Mocked here.
 */
export function EnrollButton({
  programTitle,
  programId,
}: {
  programTitle: string;
  programId: string;
}) {
  const [, startTransition] = useTransition();

  return (
    <Button
      className="w-full"
      onClick={() => {
        startTransition(() => enroll(programId));
        toast.success(`Enrolled in ${programTitle}`, {
          description: "We'll auto-update your profile and re-run matching when you finish.",
        });
      }}
    >
      Enroll &amp; auto-update my profile
      <ArrowRight className="size-4" />
    </Button>
  );
}
