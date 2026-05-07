import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ClipboardCheck,
  Search,
  User,
  ArrowRight,
  X,
  Check,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Why Holicruit? Traditional Recruiting vs Expert-to-Expert Hiring",
  description:
    "See how Holicruit fixes traditional recruiting for hiring managers, headhunters, and candidates. Expert-defined criteria, transparent scoring, zero ghosting.",
};

function CheckIcon() {
  return <span className="mt-0.5 shrink-0 text-primary">&#10003;</span>;
}

function XIcon() {
  return <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />;
}

export default function ComparePage() {
  return (
    <>
      {/* Hero */}
      <section className="flex flex-col items-center justify-center gap-6 px-4 py-24 text-center md:py-32">
        <Badge variant="secondary" className="text-sm">
          Why Holicruit?
        </Badge>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          Traditional recruiting is broken. Here&apos;s how we fix it.
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Recruiters who don&apos;t understand the role flood you with
          mismatched CVs. Candidates apply into a void and never hear back.
          Headhunters guess at criteria and waste everyone&apos;s time. There&apos;s
          a better way.
        </p>
        <div className="flex gap-4">
          <Button size="lg" asChild>
            <Link href="/register">Get Started Free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/pricing">See Pricing</Link>
          </Button>
        </div>
      </section>

      {/* Process Comparison */}
      <section className="border-t bg-muted/50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-3 text-center text-2xl font-bold">
            Side by side: the old way vs the Holicruit way
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">
            Every step in traditional recruiting adds friction, removes nuance,
            and wastes time. Holicruit eliminates the middleman and lets experts
            drive the process.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <X className="h-5 w-5" />
                  Traditional Recruiting
                </CardTitle>
                <CardDescription>Slow, opaque, full of friction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <XIcon />
                  <span>Hiring manager writes a vague job description</span>
                </div>
                <div className="flex gap-3">
                  <XIcon />
                  <span>Recruiter rewrites it and loses the technical nuance</span>
                </div>
                <div className="flex gap-3">
                  <XIcon />
                  <span>Recruiter sends 40-80 CVs based on keyword matching</span>
                </div>
                <div className="flex gap-3">
                  <XIcon />
                  <span>Hiring manager spends days screening unqualified candidates</span>
                </div>
                <div className="flex gap-3">
                  <XIcon />
                  <span>Half the candidates don&apos;t meet basic requirements</span>
                </div>
                <div className="flex gap-3">
                  <XIcon />
                  <span>Candidates never hear back &mdash; total black hole</span>
                </div>
                <div className="flex gap-3">
                  <XIcon />
                  <span>Headhunters get zero feedback on why candidates were rejected</span>
                </div>
                <div className="mt-4 rounded-lg bg-destructive/5 p-3 text-center font-medium text-destructive">
                  Average time to hire: 6-12 weeks
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Check className="h-5 w-5" />
                  The Holicruit Way
                </CardTitle>
                <CardDescription>Fast, transparent, expert-driven</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <CheckIcon />
                  <span>Hiring manager defines exact skill criteria with proficiency levels</span>
                </div>
                <div className="flex gap-3">
                  <CheckIcon />
                  <span>Sets weights for hard skills, soft skills, experience, and education</span>
                </div>
                <div className="flex gap-3">
                  <CheckIcon />
                  <span>Candidates are automatically scored against the criteria</span>
                </div>
                <div className="flex gap-3">
                  <CheckIcon />
                  <span>Only top matches land on the hiring manager&apos;s desk</span>
                </div>
                <div className="flex gap-3">
                  <CheckIcon />
                  <span>Gap analysis shows exactly where each candidate stands</span>
                </div>
                <div className="flex gap-3">
                  <CheckIcon />
                  <span>Candidates see their score and get actionable feedback</span>
                </div>
                <div className="flex gap-3">
                  <CheckIcon />
                  <span>Headhunters see the rubric and submit only qualified candidates</span>
                </div>
                <div className="mt-4 rounded-lg bg-primary/5 p-3 text-center font-medium text-primary">
                  Time to shortlist: instant. Time to hire: days, not months.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Role Cards */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-3 text-center text-2xl font-bold">
            Built for every role in the hiring process
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">
            Whether you&apos;re hiring, sourcing, or job-hunting, Holicruit
            gives you transparency and control.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="group hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Hiring Managers</CardTitle>
                <CardDescription>
                  Stop drowning in unqualified CVs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <CheckIcon />
                    <span>Define exact skill criteria with levels and weights</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckIcon />
                    <span>Auto-scored shortlist of top matches</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckIcon />
                    <span>Gap analysis for every candidate</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/compare/hiring-managers">
                    Learn more <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Headhunters</CardTitle>
                <CardDescription>
                  Stop guessing what qualifies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <CheckIcon />
                    <span>See the hiring manager&apos;s scoring rubric upfront</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckIcon />
                    <span>Claim roles and submit pre-qualified candidates</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckIcon />
                    <span>Track your submission performance</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/compare/headhunters">
                    Learn more <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Candidates</CardTitle>
                <CardDescription>
                  Stop applying into a black hole
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <CheckIcon />
                    <span>See your match score for every role</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckIcon />
                    <span>Get gap reports with actionable recommendations</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckIcon />
                    <span>Always know where you stand in the pipeline</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/compare/candidates">
                    Learn more <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-t bg-muted/50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid gap-8 text-center md:grid-cols-4">
            <div>
              <div className="text-3xl font-bold text-primary">5</div>
              <p className="mt-1 text-sm text-muted-foreground">
                candidates to review, not 50
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">Minutes</div>
              <p className="mt-1 text-sm text-muted-foreground">
                to review a shortlist, not weeks
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">100%</div>
              <p className="mt-1 text-sm text-muted-foreground">
                transparent &mdash; every score explained
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">Zero</div>
              <p className="mt-1 text-sm text-muted-foreground">
                ghosting &mdash; candidates always know where they stand
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold mb-4">
            Ready to hire the way experts should?
          </h2>
          <p className="text-muted-foreground mb-6">
            Free to start. No credit card required. See the difference in your
            first role.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/register">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
