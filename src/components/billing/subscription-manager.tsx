"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface PlanOption {
  tier: string;
  label: string;
  price: number;
  features: string[];
}

interface SubscriptionManagerProps {
  currentPlan: string;
  plans: PlanOption[];
  periodEnd?: string | null;
}

export function SubscriptionManager({
  currentPlan,
  plans,
  periodEnd,
}: SubscriptionManagerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [downgradeTarget, setDowngradeTarget] = useState<PlanOption | null>(null);

  const currentIndex = plans.findIndex((p) => p.tier === currentPlan);

  async function executeSwitch(tier: string) {
    setLoading(tier);
    setDowngradeTarget(null);
    try {
      const res = await fetch("/api/billing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: tier }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to switch plan");
        return;
      }

      toast.success(`Switched to ${plans.find((p) => p.tier === tier)?.label} plan`);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  function handleSwitch(plan: PlanOption) {
    if (plan.tier === currentPlan) return;

    const targetIndex = plans.findIndex((p) => p.tier === plan.tier);
    if (targetIndex < currentIndex) {
      setDowngradeTarget(plan);
    } else {
      executeSwitch(plan.tier);
    }
  }

  // Features the user would lose on downgrade
  const lostFeatures = downgradeTarget
    ? plans[currentIndex].features.filter(
        (f) => !downgradeTarget.features.includes(f)
      )
    : [];

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3 snap-x snap-mandatory overflow-x-auto pb-2 md:overflow-visible md:pb-0">
        {plans.map((plan) => {
          const isCurrent = plan.tier === currentPlan;
          const planIndex = plans.findIndex((p) => p.tier === plan.tier);
          const isUpgrade = planIndex > currentIndex;
          return (
            <Card
              key={plan.tier}
              className={`snap-center min-w-[260px] md:min-w-0 ${
                isCurrent
                  ? "border-primary shadow-md"
                  : "shadow-sm"
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{plan.label}</CardTitle>
                  {isCurrent && <Badge>Current</Badge>}
                </div>
                <CardDescription>
                  {plan.price === 0 ? (
                    "Free"
                  ) : (
                    <>
                      <span className="text-2xl font-bold text-foreground">
                        ${plan.price}
                      </span>
                      /mo
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  {plan.features.map((f, i) => {
                    const isNew =
                      isUpgrade &&
                      !plans[currentIndex]?.features.includes(f);
                    return (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">&#10003;</span>
                        <span>
                          {f}
                          {isNew && (
                            <span className="ml-1.5 text-[10px] font-medium text-tier-pro bg-tier-pro-bg px-1 py-0.5 rounded">
                              NEW
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <Button
                  className="w-full"
                  variant={isCurrent ? "outline" : "default"}
                  disabled={isCurrent || loading !== null}
                  onClick={() => handleSwitch(plan)}
                >
                  {loading === plan.tier
                    ? "Switching..."
                    : isCurrent
                      ? "Current Plan"
                      : isUpgrade
                        ? "Upgrade"
                        : "Downgrade"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {periodEnd && (
        <p className="text-xs text-muted-foreground mt-3">
          Your plan renews on{" "}
          {new Date(periodEnd).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      )}

      {/* Downgrade confirmation */}
      <Dialog
        open={downgradeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDowngradeTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Downgrade to {downgradeTarget?.label}?</DialogTitle>
            <DialogDescription>
              You&apos;ll lose access to these features:
            </DialogDescription>
          </DialogHeader>
          {lostFeatures.length > 0 && (
            <ul className="space-y-1.5 text-sm">
              {lostFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-destructive">
                  <span className="mt-0.5">&#10005;</span>
                  {f}
                </li>
              ))}
            </ul>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDowngradeTarget(null)}>
              Keep Current Plan
            </Button>
            <Button
              variant="destructive"
              disabled={loading !== null}
              onClick={() =>
                downgradeTarget && executeSwitch(downgradeTarget.tier)
              }
            >
              {loading ? "Switching..." : "Confirm Downgrade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
