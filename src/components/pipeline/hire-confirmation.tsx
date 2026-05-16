"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface HireConfirmationProps {
  applicationId: string;
  hmConfirmed: boolean;
  candidateConfirmed: boolean;
  role: "HIRING_MANAGER" | "CANDIDATE";
}

export function HireConfirmation({
  applicationId,
  hmConfirmed,
  candidateConfirmed,
  role,
}: HireConfirmationProps) {
  const [confirming, setConfirming] = useState(false);
  const [hmDone, setHmDone] = useState(hmConfirmed);
  const [candidateDone, setCandidateDone] = useState(candidateConfirmed);

  const alreadyConfirmed =
    (role === "HIRING_MANAGER" && hmDone) ||
    (role === "CANDIDATE" && candidateDone);

  async function handleConfirm() {
    setConfirming(true);
    try {
      const res = await fetch(
        `/api/applications/${applicationId}/confirm`,
        { method: "POST" }
      );
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to confirm");
        return;
      }
      const data = await res.json();
      setHmDone(data.hmConfirmed);
      setCandidateDone(data.candidateConfirmed);
      if (data.fullyConfirmed) {
        toast.success("Hire confirmed by both parties!");
      } else {
        toast.success("Your confirmation recorded. Waiting for the other party.");
      }
    } catch {
      toast.error("Failed to confirm");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Hire Confirmation</h3>
        {hmDone && candidateDone && (
          <Badge className="bg-green-100 text-green-800">Fully Confirmed</Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Both hiring manager and candidate must confirm to finalize the hire.
      </p>
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <div
            className={`h-2.5 w-2.5 rounded-full ${hmDone ? "bg-green-500" : "bg-gray-300"}`}
          />
          <span className={hmDone ? "text-green-700" : "text-muted-foreground"}>
            Hiring Manager
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className={`h-2.5 w-2.5 rounded-full ${candidateDone ? "bg-green-500" : "bg-gray-300"}`}
          />
          <span className={candidateDone ? "text-green-700" : "text-muted-foreground"}>
            Candidate
          </span>
        </div>
      </div>
      {!alreadyConfirmed && (
        <Button
          size="sm"
          onClick={handleConfirm}
          disabled={confirming}
        >
          {confirming ? "Confirming..." : "Confirm Hire"}
        </Button>
      )}
    </div>
  );
}
