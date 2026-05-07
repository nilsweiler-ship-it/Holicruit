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
  BarChart3,
  FileSearch,
  Lightbulb,
  Eye,
  Inbox,
  MessageSquareOff,
  Ghost,
} from "lucide-react";
import { MatchRadarChart } from "@/components/matching/match-radar-chart";

export const metadata: Metadata = {
  title: "For Candidates - Traditional Recruiting vs Holicruit",
  description:
    "Stop applying into a black hole. See your match scores, get gap reports with recommendations, and always know where you stand.",
};

function CheckIcon() {
  return <span className="mt-0.5 shrink-0 text-primary">&#10003;</span>;
}

const painPoints = [
  {
    icon: Inbox,
    title: "Black-hole applications",
    description:
      "You spend time tailoring your CV, hit submit, and then... nothing. Weeks go by with zero feedback. Did anyone even look at it?",
  },
  {
    icon: MessageSquareOff,
    title: "No feedback",
    description:
      "When you do hear back, it's a form rejection: \"We've decided to move forward with other candidates.\" No idea what went wrong or how to improve.",
  },
  {
    icon: Ghost,
    title: "Recruiter ghosting",
    description:
      "Recruiters reach out, ask for your CV, schedule a call, get your hopes up — then disappear completely. Radio silence.",
  },
];

const comparisonRows = [
  {
    aspect: "Application feedback",
    traditional: "None (black hole)",
    holicruit: "Instant match score against role criteria",
  },
  {
    aspect: "Skill visibility",
    traditional: "Hidden — you never know the real criteria",
    holicruit: "Transparent — see what skills matter and at what level",
  },
  {
    aspect: "Rejection reason",
    traditional: "Form letter or silence",
    holicruit: "Detailed gap report: skill-by-skill breakdown",
  },
  {
    aspect: "Improvement path",
    traditional: "None — figure it out yourself",
    holicruit: "Actionable recommendations to close each skill gap",
  },
  {
    aspect: "Application status",
    traditional: "Unknown — no visibility",
    holicruit: "Real-time pipeline stage visibility",
  },
  {
    aspect: "Fairness",
    traditional: "Subjective recruiter screening",
    holicruit: "Objective criteria-based scoring — same rubric for everyone",
  },
];

const usps = [
  {
    icon: BarChart3,
    title: "Match scores",
    description:
      "See how well you match each role based on hard skills, soft skills, experience, and education. Don't waste time on positions where you're not competitive.",
  },
  {
    icon: FileSearch,
    title: "Gap reports",
    description:
      "Get a detailed breakdown of where you meet requirements and where you fall short. Skill by skill, level by level — Met, Partial, or Missing.",
  },
  {
    icon: Lightbulb,
    title: "Actionable recommendations",
    description:
      "Each gap comes with specific recommendations for how to close it. Turn rejections into a growth roadmap — know exactly what to learn next.",
  },
  {
    icon: Eye,
    title: "Pipeline transparency",
    description:
      "Always know where you stand in the hiring process. See your stage (Applied, Screening, Shortlisted, Interview, Offer) in real time. No more wondering.",
  },
];

const mockGapData = [
  {
    skill: "React",
    category: "Hard",
    current: 4,
    required: 4,
    status: "MET" as const,
    recommendation: null,
  },
  {
    skill: "System Design",
    category: "Hard",
    current: 2,
    required: 4,
    status: "PARTIAL" as const,
    recommendation: "Take a distributed systems course; practice designing at scale",
  },
  {
    skill: "Team Leadership",
    category: "Soft",
    current: 3,
    required: 3,
    status: "MET" as const,
    recommendation: null,
  },
  {
    skill: "GraphQL",
    category: "Hard",
    current: 0,
    required: 3,
    status: "MISSING" as const,
    recommendation: "Build a project with Apollo Server; complete online GraphQL course",
  },
  {
    skill: "Communication",
    category: "Soft",
    current: 4,
    required: 4,
    status: "MET" as const,
    recommendation: null,
  },
  {
    skill: "Kubernetes",
    category: "Hard",
    current: 1,
    required: 3,
    status: "PARTIAL" as const,
    recommendation: "Get hands-on with K8s clusters; consider CKA certification",
  },
];

function GapStatusBadge({ status }: { status: "MET" | "PARTIAL" | "MISSING" }) {
  const styles = {
    MET: "bg-green-100 text-green-800",
    PARTIAL: "bg-yellow-100 text-yellow-800",
    MISSING: "bg-red-100 text-red-800",
  };
  const labels = { MET: "Met", PARTIAL: "Partial", MISSING: "Missing" };

  return (
    <Badge className={styles[status]} variant="secondary">
      {labels[status]}
    </Badge>
  );
}

export default function CandidatesComparePage() {
  return (
    <>
      {/* Hero */}
      <section className="flex flex-col items-center justify-center gap-6 px-4 py-24 text-center md:py-32">
        <Badge variant="outline">For Candidates</Badge>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
          Finally, a hiring process that tells you where you stand.
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          No more sending CVs into a void. Holicruit shows you your match
          score, identifies your skill gaps, and gives you actionable
          recommendations to grow.
        </p>
        <Button size="lg" asChild>
          <Link href="/register">See Your Match Score</Link>
        </Button>
      </section>

      {/* Pain Points */}
      <section className="border-t bg-muted/50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-3 text-center text-2xl font-bold">
            Sound familiar?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">
            The traditional hiring process treats candidates as an afterthought.
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
            Traditional vs Holicruit: a candidate&apos;s perspective
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">
            Transparency at every step instead of silence.
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
            How Holicruit works for candidates
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">
            Apply with confidence. Learn from every application.
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

      {/* Mock Gap Report */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-3 text-center text-2xl font-bold">
            See exactly where you stand
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">
            Here&apos;s what a gap report looks like on Holicruit. Every
            application gives you this level of detail.
          </p>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Example: Senior Full-Stack Developer
                </CardTitle>
                <Badge className="bg-green-100 text-green-800 font-bold" variant="secondary">
                  74%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="mx-auto max-w-[300px]">
                <MatchRadarChart
                  scores={{
                    hardSkills: 68,
                    softSkills: 85,
                    experience: 72,
                    education: 70,
                  }}
                />
              </div>
              <div className="overflow-x-auto -mx-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Skill</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-center">Your Level</TableHead>
                      <TableHead className="text-center">Required</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Recommendation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockGapData.map((gap) => (
                      <TableRow key={gap.skill}>
                        <TableCell className="font-medium">{gap.skill}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {gap.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {gap.current}/5
                        </TableCell>
                        <TableCell className="text-center">
                          {gap.required}/5
                        </TableCell>
                        <TableCell>
                          <GapStatusBadge status={gap.status} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[250px]">
                          {gap.recommendation || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            3 skills met &middot; 2 partial gaps &middot; 1 missing skill
            &middot; actionable recommendations for each gap
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/50 py-16 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold mb-4">
            Stop guessing. Start knowing.
          </h2>
          <p className="text-muted-foreground mb-6">
            Create your profile and see how you match against real
            opportunities. Always free for candidates.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/register">Create Your Profile</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/compare">Back to Overview</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
