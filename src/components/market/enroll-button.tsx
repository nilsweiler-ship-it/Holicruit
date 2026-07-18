"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { enroll } from "@/lib/actions/candidate";

/**
 * Enroll in (and, for the demo, complete) a program. This closes the gap on the
 * candidate's profile and automatically re-runs matching — the flywheel — then
 * sends them to their matches to see the result.
 */
export function EnrollButton({
  programTitle,
  programId,
}: {
  programTitle: string;
  programId: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      className="w-full"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await enroll(programId);
          toast.success(`Completed ${programTitle}`, {
            description: "Gap closed — we re-ran matching and refreshed your matches.",
          });
          router.push("/candidate/matches");
          router.refresh();
        });
      }}
    >
      {pending ? "Updating your profile…" : "Complete & re-run my matches"}
      <ArrowRight className="size-4" />
    </Button>
  );
}
