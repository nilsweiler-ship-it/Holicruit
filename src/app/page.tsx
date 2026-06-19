import Link from "next/link";
import { Button } from "@/components/ui/button";
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
  BarChart3,
  Handshake,
} from "lucide-react";
import { LogoMark, LogoFull } from "@/components/brand/logo";
import { Watermark } from "@/components/brand/watermark";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark size={32} />
            <span className="text-2xl font-bold tracking-tight">holicruit</span>
          </Link>
          <div className="flex items-center gap-3">
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
        <section className="relative flex flex-col items-center justify-center gap-8 px-4 pt-20 pb-16 text-center md:pt-28 md:pb-20 overflow-hidden">
          <Watermark />
          <LogoMark size={72} className="relative" />
          <h1 className="relative text-5xl font-extrabold tracking-tight md:text-6xl">
            holicruit
          </h1>
          <p className="relative max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Holistic recruiting that re-connects hiring managers and candidates
            directly &mdash; stripping out the admin drag, and giving every
            candidate honest feedback on where they fell short and how to grow.
          </p>

          {/* Principle badges */}
          <div className="relative flex flex-wrap justify-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-lg border-2 bg-card px-4 py-2.5 text-sm font-bold shadow-card">
              &#128172; Radical transparency
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border-2 bg-card px-4 py-2.5 text-sm font-bold shadow-card">
              &#129309; Expert &rarr; expert
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border-2 bg-card px-4 py-2.5 text-sm font-bold shadow-card">
              &#9889; Zero admin drag
            </span>
          </div>

          <div className="relative flex gap-4 pt-2">
            <Button size="lg" className="px-8 text-base" asChild>
              <Link href="/register">
                Get started free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8 text-base" asChild>
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
        </section>

        {/* Three perspectives */}
        <section className="border-t bg-muted/40 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-4 text-center text-3xl font-bold tracking-tight">
              One platform, three perspectives
            </h2>
            <p className="mx-auto mb-12 max-w-xl text-center text-muted-foreground">
              Whether you are looking, hiring, or connecting &mdash; holicruit
              gives you tools that respect everyone in the process.
            </p>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Candidate */}
              <Card className="relative overflow-hidden border-2 transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <CardTitle className="text-xl font-bold">
                      I&apos;m looking
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">
                      &mdash; Candidate
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Find roles &amp; grow my profile
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        See exactly where you stand &mdash; hard vs soft sub-scores
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        Rank among other candidates (you&apos;re top 3!)
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        Honest feedback when you don&apos;t get picked
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        Close skill gaps with targeted growth paths
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Hiring Manager */}
              <Card className="relative overflow-hidden border-2 transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <CardTitle className="text-xl font-bold">
                      I&apos;m hiring
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">
                      &mdash; Hiring Manager
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Meet candidates for my team
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        Evidence-based candidate profiles, not claim-based CVs
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        Direct line to candidates &mdash; no recruiter relay
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        Auto-drafted feedback for every pass &mdash; one-click send
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        Pipeline kanban: New &rarr; Talking &rarr; Offer
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Recruiter */}
              <Card className="relative overflow-hidden border-2 transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Target className="h-6 w-6" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <CardTitle className="text-xl font-bold">
                      I connect people
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">
                      &mdash; Recruiter
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Facilitate matches, earn on outcomes
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>No retainers, no exclusivity</span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        Success fee only when your intro gets hired
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        Compete on judgment and coaching, not CV hoarding
                      </span>
                    </li>
                    <li className="flex gap-3">
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
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="mb-3 text-center text-3xl font-bold tracking-tight">
              The heart of holicruit: honest feedback
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
              Every rejection auto-generates a Growth Report. No more
              &quot;we&apos;ll be in touch.&quot;
            </p>

            <Card className="mx-auto max-w-lg border-2">
              <CardHeader className="pb-2">
                <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Growth Report Preview
                  </span>
                </div>
                <CardTitle className="text-xl">
                  Not this time &mdash; here&apos;s exactly why
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Hard skills bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">Hard skills</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                      <AlertTriangle className="h-3 w-3" />
                      Gap &mdash; needs work
                    </span>
                  </div>
                  <div className="relative h-6 w-full overflow-hidden rounded-full bg-muted">
                    {/* You bar (solid) */}
                    <div className="absolute inset-y-0 left-0 h-full w-[45%] rounded-full bg-amber-400" />
                    {/* Role bar (hatched) */}
                    <div
                      className="absolute inset-y-0 left-0 h-full w-[70%] rounded-full opacity-30"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(135deg, transparent, transparent 3px, rgb(245 158 11) 3px, rgb(245 158 11) 5px)",
                      }}
                    />
                    {/* Role bar marker */}
                    <div className="absolute inset-y-0 left-[70%] w-0.5 bg-amber-700" />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">
                      You: <span className="text-lg font-bold text-amber-600">45</span>
                    </span>
                    <span className="text-muted-foreground">
                      Role bar: 70
                    </span>
                  </div>
                </div>

                {/* Soft skills bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">Soft skills</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" />
                      Above bar &mdash; a strength
                    </span>
                  </div>
                  <div className="relative h-6 w-full overflow-hidden rounded-full bg-muted">
                    {/* You bar (solid) */}
                    <div className="absolute inset-y-0 left-0 h-full w-[82%] rounded-full bg-emerald-400" />
                    {/* Role bar (hatched) */}
                    <div
                      className="absolute inset-y-0 left-0 h-full w-[65%] rounded-full opacity-30"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(135deg, transparent, transparent 3px, rgb(16 185 129) 3px, rgb(16 185 129) 5px)",
                      }}
                    />
                    {/* Role bar marker */}
                    <div className="absolute inset-y-0 left-[65%] w-0.5 bg-emerald-700" />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">
                      You: <span className="text-lg font-bold text-emerald-600">82</span>
                    </span>
                    <span className="text-muted-foreground">
                      Role bar: 65
                    </span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 rounded-lg border border-dashed border-muted-foreground/25 py-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-6 rounded-sm bg-muted-foreground/40" />
                    You (solid)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-3 w-6 rounded-sm"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(135deg, transparent, transparent 2px, rgb(156 163 175) 2px, rgb(156 163 175) 3.5px)",
                      }}
                    />
                    Role bar (hatched)
                  </span>
                </div>

                <Button className="w-full" size="lg" asChild>
                  <Link href="/register">
                    Close the gap &mdash; re-match next time
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="relative border-t bg-primary/5 py-20 text-center overflow-hidden">
          <Watermark />
          <div className="relative mx-auto max-w-2xl px-4">
            <Handshake className="mx-auto mb-6 h-10 w-10 text-primary" />
            <h2 className="mb-3 text-3xl font-bold tracking-tight">
              Ready to try something different?
            </h2>
            <p className="mb-8 text-muted-foreground">
              Join a hiring ecosystem built on transparency, not gatekeeping.
            </p>
            <Button size="lg" className="mb-4 px-10 text-base" asChild>
              <Link href="/register">
                Get started &mdash; it&apos;s free for candidates
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              No credit card required. Post roles with milestone-based pricing.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 md:flex-row md:justify-between">
          <span className="inline-flex items-center gap-2">
            <LogoMark size={24} />
            <span className="text-lg font-bold">holicruit</span>
          </span>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} holicruit. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
