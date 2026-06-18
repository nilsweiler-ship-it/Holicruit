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
  User,
  Briefcase,
  Target,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="flex h-14 items-center px-4 md:px-6">
          <span className="text-xl font-bold text-primary">holicruit</span>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/pricing">Pricing</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="flex flex-col items-center justify-center gap-6 px-4 py-24 text-center md:py-32">
          <h1 className="text-4xl font-bold text-primary">holicruit</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Holistic recruiting that re-connects hiring managers and candidates
            directly.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary">Radical transparency</Badge>
            <Badge variant="secondary">Expert &rarr; expert</Badge>
            <Badge variant="secondary">Zero admin drag</Badge>
          </div>
          <div className="flex gap-4">
            <Button size="lg" asChild>
              <Link href="/register">Get started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">See how it works</Link>
            </Button>
          </div>
        </section>

        {/* Three perspectives */}
        <section className="border-t bg-muted/50 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-10 text-center text-2xl font-bold">
              One platform, three perspectives
            </h2>
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Candidate */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 text-primary">
                    <User className="h-5 w-5" />
                    <span className="text-sm font-medium uppercase tracking-wide">
                      Candidate
                    </span>
                  </div>
                  <CardTitle className="text-xl">
                    I&apos;m looking
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Find roles &amp; grow my profile
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        See exactly where you stand — hard vs soft sub-scores
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        Rank among other candidates (you&apos;re top 3!)
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        Honest feedback when you don&apos;t get picked
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        Close skill gaps with targeted growth paths
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Hiring Manager */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 text-primary">
                    <Briefcase className="h-5 w-5" />
                    <span className="text-sm font-medium uppercase tracking-wide">
                      Hiring Manager
                    </span>
                  </div>
                  <CardTitle className="text-xl">
                    I&apos;m hiring
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Meet candidates for my team
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        Evidence-based candidate profiles, not claim-based CVs
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        Direct line to candidates — no recruiter relay
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        Auto-drafted feedback for every pass — one-click send
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        Pipeline kanban: New &rarr; Talking &rarr; Offer
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Recruiter */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 text-primary">
                    <Target className="h-5 w-5" />
                    <span className="text-sm font-medium uppercase tracking-wide">
                      Recruiter
                    </span>
                  </div>
                  <CardTitle className="text-xl">
                    I connect people
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Facilitate matches, earn on outcomes
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>No retainers, no exclusivity</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        Success fee only when your intro gets hired
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        Compete on judgment and coaching, not CV hoarding
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        Track active intros, interviews, and earnings
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Growth Report Preview */}
        <section className="py-16">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="mb-3 text-center text-2xl font-bold">
              The heart of holicruit: honest feedback
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">
              Every rejection auto-generates a Growth Report. No more
              &quot;we&apos;ll be in touch.&quot;
            </p>

            <Card className="mx-auto max-w-lg">
              <CardHeader>
                <CardTitle className="text-lg">
                  Not this time — here&apos;s exactly why
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Hard skills bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Hard skills</span>
                    <span className="flex items-center gap-1 text-xs text-amber-600">
                      <AlertTriangle className="h-3 w-3" />
                      Gap — needs work
                    </span>
                  </div>
                  <div className="relative h-2 w-full rounded-full bg-muted">
                    <div className="absolute inset-y-0 left-0 h-2 w-[45%] rounded-full bg-amber-500" />
                    <div className="absolute inset-y-0 left-[70%] h-2 w-px bg-foreground/40" />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>You: 45%</span>
                    <span>Bar: 70%</span>
                  </div>
                </div>

                {/* Soft skills bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Soft skills</span>
                    <span className="flex items-center gap-1 text-xs text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" />
                      Above bar — a strength
                    </span>
                  </div>
                  <div className="relative h-2 w-full rounded-full bg-muted">
                    <div className="absolute inset-y-0 left-0 h-2 w-[82%] rounded-full bg-emerald-500" />
                    <div className="absolute inset-y-0 left-[65%] h-2 w-px bg-foreground/40" />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>You: 82%</span>
                    <span>Bar: 65%</span>
                  </div>
                </div>

                <Button className="w-full" asChild>
                  <Link href="/register">
                    Close the gap &rarr; re-match next time
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="border-t bg-muted/50 py-16 text-center">
          <div className="mx-auto max-w-2xl px-4">
            <h2 className="mb-4 text-2xl font-bold">
              Ready to try something different?
            </h2>
            <Button size="lg" className="mb-3" asChild>
              <Link href="/register">
                Get started — it&apos;s free for candidates
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              No credit card required. Post roles with milestone-based pricing.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        holicruit &copy; {new Date().getFullYear()}. All rights reserved.
      </footer>
    </div>
  );
}
