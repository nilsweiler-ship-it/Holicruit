import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  Flag,
  UserCheck,
  TrendingUp,
  FileQuestion,
  SendHorizonal,
  MessageSquareOff,
} from "lucide-react";

export const metadata: Metadata = {
  title: "For Headhunters - Traditional Recruiting vs Holicruit",
  description:
    "Stop guessing what qualifies. See transparent scoring rubrics, claim roles, and track your submission performance.",
};

function CheckIcon() {
  return <span className="mt-0.5 shrink-0 text-primary">&#10003;</span>;
}

const painPoints = [
  {
    icon: FileQuestion,
    title: "Vague job descriptions",
    description:
      "JDs are written by HR or marketing, not the hiring manager. You're left guessing what actually matters — seniority level, specific tech stack, or team culture fit.",
  },
  {
    icon: SendHorizonal,
    title: "Wasted submissions",
    description:
      "You submit strong candidates only to hear \"not a fit\" with no explanation. No way to calibrate. No way to learn what you got wrong.",
  },
  {
    icon: MessageSquareOff,
    title: "No feedback on quality",
    description:
      "You never learn why candidates were rejected. Was it skills? Experience? Cultural fit? Without data, you can't improve your sourcing strategy.",
  },
];

const comparisonRows = [
  {
    aspect: "Role clarity",
    traditional: "Vague JD from HR / marketing",
    holicruit: "Exact skills, levels (1-5), and weights set by the hiring manager",
  },
  {
    aspect: "Submission quality",
    traditional: "Guess and hope",
    holicruit: "Pre-score candidates against the rubric before submitting",
  },
  {
    aspect: "Feedback",
    traditional: "None, or just \"not a fit\"",
    holicruit: "Match scores and gap analysis for every submission",
  },
  {
    aspect: "Role selection",
    traditional: "Cold outreach to companies",
    holicruit: "Browse published roles and claim the ones you can fill",
  },
  {
    aspect: "Performance tracking",
    traditional: "No visibility",
    holicruit: "Track submission success rate and average match scores",
  },
  {
    aspect: "Payment signal",
    traditional: "Opaque process, unclear outcomes",
    holicruit: "Transparent scoring shows exactly where your candidates rank",
  },
];

const usps = [
  {
    icon: Eye,
    title: "Transparent scoring rubrics",
    description:
      "See the exact skills, proficiency levels, and dimension weights the hiring manager has set. No more decoding vague job descriptions — you know precisely what a \"strong\" candidate looks like.",
  },
  {
    icon: Flag,
    title: "Claim roles",
    description:
      "Browse published roles and claim the ones that match your sourcing specialty. Focus your efforts where you can deliver the highest-quality candidates.",
  },
  {
    icon: UserCheck,
    title: "Pre-qualify candidates",
    description:
      "Score candidates against the rubric before you submit. Know upfront whether they'll meet the threshold — no more wasted submissions.",
  },
  {
    icon: TrendingUp,
    title: "Performance tracking",
    description:
      "See your submission acceptance rate, average match scores, and how your candidates rank against others. Build your reputation with data, not promises.",
  },
];

export default function HeadhuntersComparePage() {
  return (
    <>
      {/* Hero */}
      <section className="flex flex-col items-center justify-center gap-6 px-4 py-24 text-center md:py-32">
        <Badge variant="outline">For Headhunters</Badge>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
          Know exactly what qualifies &mdash; before you submit.
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Traditional recruiting gives you a vague job description and hopes for
          the best. Holicruit gives you the scoring rubric so you can submit
          candidates that actually match.
        </p>
        <Button size="lg" asChild>
          <Link href="/register">Start Sourcing Smarter</Link>
        </Button>
      </section>

      {/* Pain Points */}
      <section className="border-t bg-muted/50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-3 text-center text-2xl font-bold">
            The headhunter&apos;s frustration
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">
            You&apos;re good at sourcing. The process is what&apos;s broken.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {painPoints.map((point) => (
              <Card key={point.title}>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                    <point.icon className="h-5 w-5 text-destructive" />
                  </div>
                  <CardTitle className="text-base">{point.title}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {point.description}
                  </p>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-3 text-center text-2xl font-bold">
            Traditional vs Holicruit: a headhunter&apos;s perspective
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">
            More clarity, better submissions, actual feedback.
          </p>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Aspect</TableHead>
                      <TableHead>Traditional Recruiting</TableHead>
                      <TableHead>Holicruit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonRows.map((row) => (
                      <TableRow key={row.aspect}>
                        <TableCell className="font-medium">
                          {row.aspect}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {row.traditional}
                        </TableCell>
                        <TableCell>
                          <span className="flex items-start gap-2">
                            <CheckIcon />
                            {row.holicruit}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Key USPs */}
      <section className="border-t bg-muted/50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-3 text-center text-2xl font-bold">
            How Holicruit works for headhunters
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">
            Source with confidence. Submit with data.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {usps.map((usp) => (
              <Card key={usp.title}>
                <CardHeader className="flex-row items-start gap-3 space-y-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <usp.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{usp.title}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {usp.description}
                    </p>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-3 text-center text-2xl font-bold">
            Your workflow on Holicruit
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">
            Three steps to better placements.
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-2 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                1
              </div>
              <h3 className="font-semibold">Browse &amp; claim</h3>
              <p className="text-sm text-muted-foreground">
                Find published roles that match your specialization. See the
                exact scoring criteria. Claim the ones you can fill.
              </p>
            </div>
            <div className="space-y-2 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                2
              </div>
              <h3 className="font-semibold">Source &amp; submit</h3>
              <p className="text-sm text-muted-foreground">
                Find candidates who match the rubric. Submit them with
                confidence, knowing they&apos;ll score well against the hiring
                manager&apos;s criteria.
              </p>
            </div>
            <div className="space-y-2 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                3
              </div>
              <h3 className="font-semibold">Track &amp; improve</h3>
              <p className="text-sm text-muted-foreground">
                See match scores for every submission. Track your acceptance
                rate. Refine your sourcing based on real data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/50 py-16 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold mb-4">
            Source smarter. Submit better.
          </h2>
          <p className="text-muted-foreground mb-6">
            Join Holicruit and start filling roles with confidence.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/register">Sign Up as Headhunter</Link>
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
