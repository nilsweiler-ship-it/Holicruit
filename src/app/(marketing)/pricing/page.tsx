import type { Metadata } from "next";
import Link from "next/link";
import {
  Briefcase,
  Check,
  GraduationCap,
  Target,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pricing — Holicruit",
  description:
    "Candidates are always free. Transparent pricing for hiring managers, recruiters (success fee only), and training providers.",
};

type Tier = {
  name: string;
  price: string;
  cadence?: string;
  blurb: string;
  features: string[];
  cta: { label: string; href: string };
  popular?: boolean;
};

type Audience = {
  icon: typeof User;
  hat: string;
  tagline: string;
  tiers: Tier[];
};

const AUDIENCES: Audience[] = [
  {
    icon: User,
    hat: "Candidate",
    tagline: "Always free. You should never pay to be seen for who you are.",
    tiers: [
      {
        name: "Free",
        price: "€0",
        blurb: "Everything you need to get matched on merit.",
        features: [
          "Opt-in matches, no cold applications",
          "Full fit breakdown (hard / soft / mutual)",
          "Growth Report on every outcome",
          "Objective scenario assessment",
          "Verified skill endorsements",
        ],
        cta: { label: "Get started", href: "/register" },
      },
    ],
  },
  {
    icon: Briefcase,
    hat: "Hiring Manager",
    tagline: "Meet every candidate scored against your bar.",
    tiers: [
      {
        name: "Starter",
        price: "€0",
        blurb: "Everything you need to hire one role, transparently.",
        features: [
          "1 open role",
          "Full pipeline & opt-in matching",
          "Structured score sheets",
          "Auto-drafted Growth Report feedback",
        ],
        cta: { label: "Start free", href: "/register?plan=hm-starter" },
      },
      {
        name: "Team",
        price: "€500",
        cadence: "/mo",
        blurb: "The Holicruit advantage — a warmer pipeline and sharper decisions.",
        features: [
          "Up to 5 open roles · 5 seats",
          "Silver-medalist talent pool",
          "Custom role calibration",
          "Team decision intelligence",
        ],
        cta: { label: "Choose Team", href: "/register?plan=hm-team" },
        popular: true,
      },
      {
        name: "Scale",
        price: "Custom",
        blurb: "For high-volume hiring that needs proof of quality and fairness.",
        features: [
          "Everything in Team · unlimited roles & seats",
          "Quality-of-hire & fairness analytics",
          "Company-specific assessments",
          "Priority matching · SSO · DPA",
        ],
        cta: { label: "Talk to sales", href: "/register?plan=hm-scale" },
      },
    ],
  },
  {
    icon: Target,
    hat: "Recruiter",
    tagline: "Get paid on outcomes — never on retainers.",
    tiers: [
      {
        name: "Free + success fee",
        price: "€0",
        blurb: "Free to join. A platform success fee applies only on a hire.",
        features: [
          "Free to join and source",
          "Facilitate opt-in matches",
          "Success fee only on a successful hire",
          "No retainers, no monthly fees",
        ],
        cta: { label: "Join as recruiter", href: "/register?plan=recruiter" },
      },
    ],
  },
  {
    icon: GraduationCap,
    hat: "Training Provider",
    tagline: "Reach candidates with the exact gaps you close.",
    tiers: [
      {
        name: "Listed",
        price: "€0",
        blurb: "Get discovered by candidates who need your programs.",
        features: [
          "Programs ranked by real outcomes",
          "Matched to candidates' gaps",
          "Outcome-based discovery",
        ],
        cta: { label: "List for free", href: "/register?plan=provider-listed" },
      },
      {
        name: "Partner",
        price: "€300",
        cadence: "/mo",
        blurb: "Promote your programs against targeted gaps.",
        features: [
          "Promoted placement on targeted gaps",
          "Demand analytics",
          "Priority discovery",
        ],
        cta: { label: "Become a Partner", href: "/register?plan=provider-partner" },
        popular: true,
      },
    ],
  },
];

function TierCard({ tier }: { tier: Tier }) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-card p-6 ${
        tier.popular ? "border-primary ring-1 ring-primary" : "border-border"
      }`}
    >
      {tier.popular && (
        <span className="absolute -top-3 left-6 inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          Most popular
        </span>
      )}
      <h3 className="text-lg font-semibold">{tier.name}</h3>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-extrabold tracking-tight">{tier.price}</span>
        {tier.cadence && (
          <span className="text-sm text-muted-foreground">{tier.cadence}</span>
        )}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{tier.blurb}</p>

      <ul className="mt-5 flex-1 space-y-2.5">
        {tier.features.map((feat) => (
          <li key={feat} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-success" />
            <span>{feat}</span>
          </li>
        ))}
      </ul>

      <Button
        asChild
        className="mt-6 w-full"
        variant={tier.popular ? "default" : "outline"}
      >
        <Link href={tier.cta.href}>{tier.cta.label}</Link>
      </Button>
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Simple pricing for every hat
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Candidates are always free. Everyone else pays only for what moves the
          needle — and never for a black box.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Prices in EUR. Test mode.
        </p>
      </div>

      <div className="mt-16 space-y-16">
        {AUDIENCES.map((audience) => {
          const Icon = audience.icon;
          return (
            <section key={audience.hat}>
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {audience.hat}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {audience.tagline}
                  </p>
                </div>
              </div>

              <div
                className={`mt-6 grid gap-5 ${
                  audience.tiers.length === 1
                    ? "max-w-md"
                    : audience.tiers.length === 2
                      ? "sm:grid-cols-2"
                      : "lg:grid-cols-3"
                }`}
              >
                {audience.tiers.map((tier) => (
                  <TierCard key={tier.name} tier={tier} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
