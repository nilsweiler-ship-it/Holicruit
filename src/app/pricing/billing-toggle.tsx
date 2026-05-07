"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function Check() {
  return <span className="text-primary mt-0.5 shrink-0">&#10003;</span>;
}

interface HmFeature {
  feature: string;
  starter: string;
  professional: string;
  enterprise: string;
}

const plans = {
  monthly: {
    professional: { price: 99, period: "mo" },
    enterprise: { price: 299, period: "mo" },
  },
  annual: {
    professional: { price: 79, period: "mo" },
    enterprise: { price: 239, period: "mo" },
  },
};

export function BillingToggle({
  hmFeatures,
}: {
  hmFeatures: HmFeature[];
}) {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const prices = plans[billing];

  return (
    <>
      {/* Billing toggle */}
      <div className="mb-8 flex items-center justify-center gap-3">
        <span
          className={`text-sm font-medium ${billing === "monthly" ? "text-foreground" : "text-muted-foreground"}`}
        >
          Monthly
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={billing === "annual"}
          onClick={() =>
            setBilling(billing === "monthly" ? "annual" : "monthly")
          }
          className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-muted transition-colors focus-visible:outline-2 focus-visible:outline-ring data-[state=checked]:bg-primary"
          data-state={billing === "annual" ? "checked" : "unchecked"}
        >
          <span
            className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
            data-state={billing === "annual" ? "checked" : "unchecked"}
          />
        </button>
        <span
          className={`text-sm font-medium ${billing === "annual" ? "text-foreground" : "text-muted-foreground"}`}
        >
          Annual
        </span>
        {billing === "annual" && (
          <Badge variant="secondary" className="text-xs text-primary">
            Save 20%
          </Badge>
        )}
      </div>

      {/* Plan cards */}
      <div className="flex gap-6 mb-8 snap-x snap-mandatory overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
        <Card className="shadow-sm snap-center min-w-[280px] md:min-w-0">
          <CardHeader>
            <CardTitle>Starter</CardTitle>
            <CardDescription>
              <span className="text-2xl font-bold text-foreground">Free</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm mb-6">
              <li className="flex items-start gap-2"><Check />2 active roles</li>
              <li className="flex items-start gap-2"><Check />10 apps per role</li>
              <li className="flex items-start gap-2"><Check />Score only matching</li>
              <li className="flex items-start gap-2"><Check />1 team member</li>
            </ul>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary shadow-sm snap-center min-w-[280px] md:min-w-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Professional</CardTitle>
              <Badge>Popular</Badge>
            </div>
            <CardDescription>
              <span className="text-2xl font-bold text-foreground">
                ${prices.professional.price}
              </span>
              /{prices.professional.period}
              {billing === "annual" && (
                <span className="ml-2 text-xs text-muted-foreground line-through">
                  $99/mo
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm mb-6">
              <li className="flex items-start gap-2"><Check />10 active roles</li>
              <li className="flex items-start gap-2"><Check />50 apps per role</li>
              <li className="flex items-start gap-2"><Check />Full match breakdown</li>
              <li className="flex items-start gap-2"><Check />Gap analysis</li>
              <li className="flex items-start gap-2"><Check />5 team members</li>
              <li className="flex items-start gap-2"><Check />Email support</li>
            </ul>
            <Button className="w-full" asChild>
              <Link href="/register">Start Free Trial</Link>
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              14-day free trial &middot; Cancel anytime
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm snap-center min-w-[280px] md:min-w-0">
          <CardHeader>
            <CardTitle>Enterprise</CardTitle>
            <CardDescription>
              <span className="text-2xl font-bold text-foreground">
                ${prices.enterprise.price}
              </span>
              /{prices.enterprise.period}
              {billing === "annual" && (
                <span className="ml-2 text-xs text-muted-foreground line-through">
                  $299/mo
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm mb-6">
              <li className="flex items-start gap-2"><Check />Unlimited roles</li>
              <li className="flex items-start gap-2"><Check />Unlimited apps per role</li>
              <li className="flex items-start gap-2"><Check />Full + custom scoring</li>
              <li className="flex items-start gap-2"><Check />Gap analysis</li>
              <li className="flex items-start gap-2"><Check />Unlimited team members</li>
              <li className="flex items-start gap-2"><Check />Dedicated support</li>
              <li className="flex items-start gap-2"><Check />Custom branding</li>
            </ul>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/register">Contact Sales</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Feature comparison table */}
      <Card>
        <CardHeader>
          <CardTitle>Compare Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>Starter</TableHead>
                <TableHead>Professional</TableHead>
                <TableHead>Enterprise</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hmFeatures.map((row) => (
                <TableRow key={row.feature}>
                  <TableCell className="font-medium">{row.feature}</TableCell>
                  <TableCell>{row.starter}</TableCell>
                  <TableCell>{row.professional}</TableCell>
                  <TableCell>{row.enterprise}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
