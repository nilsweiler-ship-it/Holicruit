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
  Target,
  BarChart3,
  Zap,
  Search,
  KanbanSquare,
  ShieldCheck,
  FileStack,
  Languages,
  Clock,
  UserX,
} from "lucide-react";

export const metadata: Metadata = {
  title: "For Hiring Managers - Traditional Recruiting vs Holicruit",
  description:
    "Stop drowning in unqualified CVs. Define expert criteria, auto-score candidates, and review only top matches.",
};

function CheckIcon() {
  return <span className="mt-0.5 shrink-0 text-primary">&#10003;</span>;
}

const painPoints = [
  {
    icon: FileStack,
    title: "CV floods",
    description:
      "Recruiters send 40-80 CVs per role. You spend days screening candidates who don't even meet basic requirements.",
  },
  {
    icon: Languages,
    title: "Lost in translation",
    description:
      "Recruiters rewrite your job description and lose the technical nuance. The criteria that reach candidates aren't the ones you set.",
  },
  {
    icon: Clock,
    title: "Slow screening",
    description:
      "Manual CV review takes 1-2 weeks per role. Meanwhile your team is understaffed and the best candidates move on.",
  },
  {
    icon: UserX,
    title: "Recruiter middlemen",
    description:
      "Someone without domain expertise is your first filter. They can't distinguish a strong senior from a keyword-stuffed CV.",
  },
];

const comparisonRows = [
  {
    aspect: "Defining requirements",
    traditional: "Write job description, recruiter interprets",
    holicruit: "Set exact skills, levels (1-5), and dimension weights directly",
  },
  {
    aspect: "Screening",
    traditional: "Manual CV review (40-80 per role)",
    holicruit: "Auto-scored shortlist (top 5-10 matches)",
  },
  {
    aspect: "Quality signal",
    traditional: "Recruiter's subjective assessment",
    holicruit: "Objective match score with 4-dimension breakdown",
  },
  {
    aspect: "Gap visibility",
    traditional: "None — guesswork",
    holicruit: "Detailed gap analysis per candidate, skill by skill",
  },
  {
    aspect: "Time to shortlist",
    traditional: "1-2 weeks of manual review",
    holicruit: "Instant — candidates auto-shortlist above your threshold",
  },
  {
    aspect: "Feedback loop",
    traditional: "Phone tag with recruiter",
    holicruit: "Direct pipeline visibility with audit log",
  },
];

const usps = [
  {
    icon: Target,
    title: "Expert-defined criteria",
    description:
      "Set exact skill requirements with proficiency levels (1-5) and mark which are required vs nice-to-have. Your domain knowledge drives the scoring, not a recruiter's keyword matching.",
  },
  {
    icon: BarChart3,
    title: "Weighted scoring engine",
    description:
      "Assign different weights to hard skills, soft skills, experience, and education. Prioritize what actually matters for your team — a backend role might weight hard skills at 45% and soft skills at 15%.",
  },
  {
    icon: Zap,
    title: "Auto-shortlisting",
    description:
      "Set a match threshold (e.g. 70%). Only candidates who score above it appear on your shortlist. Review 5 candidates, not 50.",
  },
  {
    icon: Search,
    title: "Gap analysis",
    description:
      "See exactly where each candidate falls short — skill by skill, level by level. Each gap comes with a status (Met, Partial, Missing) and specific recommendations.",
  },
  {
    icon: KanbanSquare,
    title: "Pipeline management",
    description:
      "Track candidates through stages: Applied, Screening, Shortlisted, Interview, Offer, Hired. Drag-and-drop pipeline board with full visibility.",
  },
  {
    icon: ShieldCheck,
    title: "No middleman",
    description:
      "Headhunters see your scoring rubric upfront and self-qualify before submitting. Every candidate that reaches you has been pre-vetted against your actual criteria.",
  },
];

export default function HiringManagersComparePage() {
  return (
    <>
      {/* Hero */}
      <section className="flex flex-col items-center justify-center gap-6 px-4 py-24 text-center md:py-32">
        <Badge variant="outline">For Hiring Managers</Badge>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
          You&apos;re the expert. Your criteria should drive the hiring.
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Traditional recruiters don&apos;t understand your domain. They flood
          you with mismatched CVs and call it a &quot;long-list.&quot; Holicruit
          puts you in control.
        </p>
        <Button size="lg" asChild>
          <Link href="/register">Start Defining Your Criteria</Link>
        </Button>
      </section>

      {/* Pain Points */}
      <section className="border-t bg-muted/50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-3 text-center text-2xl font-bold">
            The pain of traditional hiring
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">
            If any of these sound familiar, you&apos;re not alone.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {painPoints.map((point) => (
              <Card key={point.title}>
                <CardHeader className="flex-row items-start gap-3 space-y-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                    <point.icon className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{point.title}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {point.description}
                    </p>
                  </div>
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
            Traditional vs Holicruit: a hiring manager&apos;s perspective
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">
            A direct comparison across the aspects that matter most to you.
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
            How Holicruit works for hiring managers
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">
            Six features that fundamentally change how you hire.
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

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold mb-4">
            Ready to hire like an expert?
          </h2>
          <p className="text-muted-foreground mb-6">
            Define your first role in minutes. See only candidates who match.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/register">Create Your First Role</Link>
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
