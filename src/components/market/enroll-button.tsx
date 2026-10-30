"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { enroll } from "@/lib/actions/candidate";

/**
 * Enroll in a program. This only records the enrollment (once per program) —
 * it doesn't close a gap or verify anything. Gaps close when the provider
 * confirms completion or the candidate shows new evidence (e.g. a skill check).
 */
export function EnrollButton({
  programTitle,
  programId,
}: {
  programTitle: string;
  programId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [enrolled, setEnrolled] = useState(false);
  const router = useRouter();

  return (
    <Button
      className="w-full"
      variant={enrolled ? "outline" : "default"}
      disabled={pending || enrolled}
      onClick={() => {
        startTransition(async () => {
          try {
            const res = await enroll(programId);
            if (!res.ok) {
              toast.error(res.error);
              return;
            }
            setEnrolled(true);
            toast.success(res.alreadyEnrolled ? `You're already enrolled in ${programTitle}` : `Enrolled in ${programTitle}`, {
              description: "When you complete it, prove the skill with a skill check to close the gap.",
            });
            router.refresh();
          } catch {
            toast.error("Couldn't enroll right now. Please try again.");
          }
        });
      }}
    >
      {enrolled ? (
        <>
          <Check className="size-4" />
          Enrolled
        </>
      ) : (
        <>
          {pending ? "Enrolling…" : "Enroll"}
          <ArrowRight className="size-4" />
        </>
      )}
    </Button>
  );
}
