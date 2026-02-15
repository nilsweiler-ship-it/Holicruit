"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UpgradePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  billingUrl: string;
  nextTierName?: string;
  nextTierBenefits?: string[];
}

export function UpgradePrompt({
  open,
  onOpenChange,
  message,
  billingUrl,
  nextTierName,
  nextTierBenefits,
}: UpgradePromptProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade Your Plan</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        {nextTierName && nextTierBenefits && nextTierBenefits.length > 0 && (
          <div className="rounded-lg border border-tier-pro/20 bg-tier-pro-bg/50 p-4">
            <p className="text-sm font-medium text-tier-pro mb-2">
              {nextTierName} includes:
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {nextTierBenefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-tier-pro mt-0.5">&#10003;</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Not Now
          </Button>
          <Button asChild>
            <Link href={billingUrl}>View Plans</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
