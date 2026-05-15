import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="flex h-14 items-center px-4 md:px-6">
          <span className="text-xl font-bold">Holicruit</span>
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
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            Radical transparency in hiring. For everyone.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            No more black-box rejections. Candidates see exactly which skills
            they lack. Hiring managers see every candidate scored against
            their criteria. Headhunters can&apos;t hide progress. Everyone
            wins when everyone knows where they stand.
          </p>
          <div className="flex gap-4">
            <Button size="lg" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Log in</Link>
            </Button>
          </div>
        </section>

        {/* Transparency USP */}
        <section className="border-t bg-muted/50 py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="mb-3 text-center text-2xl font-bold">
              We&apos;re all grown-ups here
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">
              Candidates can handle a &quot;no&quot; — what they can&apos;t
              handle is silence. Holicruit shows everyone the full picture:
              what&apos;s required, what&apos;s missing, and what to do about it.
            </p>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="space-y-2 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                  1
                </div>
                <h3 className="font-semibold">Transparent scoring</h3>
                <p className="text-sm text-muted-foreground">
                  Every candidate sees a radar chart comparing their skills
                  to the role requirements — hard skills, soft skills, and
                  experience, all in the open.
                </p>
              </div>
              <div className="space-y-2 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                  2
                </div>
                <h3 className="font-semibold">Honest gap reports</h3>
                <p className="text-sm text-muted-foreground">
                  Rejected? You&apos;ll know exactly why — which skill was
                  too low, which experience was missing. No vague
                  &quot;we went with another candidate&quot; emails.
                </p>
              </div>
              <div className="space-y-2 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                  3
                </div>
                <h3 className="font-semibold">Actionable next steps</h3>
                <p className="text-sm text-muted-foreground">
                  Every gap links to targeted training courses and job
                  opportunities. A rejection becomes a roadmap to your
                  next role.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Three perspectives */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="mb-10 text-center text-2xl font-bold">
              Full visibility for every role
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-xl border p-6 space-y-3">
                <div className="text-sm font-medium text-primary uppercase tracking-wide">
                  For Candidates
                </div>
                <h3 className="font-semibold text-lg">Know where you stand</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="mt-0.5 shrink-0 text-primary">&#10003;</span>
                    <span>See your skills vs. role requirements in a live radar chart</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 shrink-0 text-primary">&#10003;</span>
                    <span>Get a detailed gap report showing exactly where you fell short</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 shrink-0 text-primary">&#10003;</span>
                    <span>Links to Coursera, Udemy, and LinkedIn Learning to close your gaps</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 shrink-0 text-primary">&#10003;</span>
                    <span>Job opportunities on LinkedIn and Indeed to build missing experience</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-xl border p-6 space-y-3">
                <div className="text-sm font-medium text-primary uppercase tracking-wide">
                  For Hiring Managers
                </div>
                <h3 className="font-semibold text-lg">Always in control</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="mt-0.5 shrink-0 text-primary">&#10003;</span>
                    <span>Define exact skill criteria — your domain expertise sets the bar</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 shrink-0 text-primary">&#10003;</span>
                    <span>Every candidate scored and ranked against your requirements</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 shrink-0 text-primary">&#10003;</span>
                    <span>Full pipeline visibility — see every stage, even for headhunter submissions</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 shrink-0 text-primary">&#10003;</span>
                    <span>Audit log tracks who did what and when — no surprises</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-xl border p-6 space-y-3">
                <div className="text-sm font-medium text-primary uppercase tracking-wide">
                  For Headhunters
                </div>
                <h3 className="font-semibold text-lg">No more guessing</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="mt-0.5 shrink-0 text-primary">&#10003;</span>
                    <span>See the scoring rubric before you submit — know what qualifies</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 shrink-0 text-primary">&#10003;</span>
                    <span>Submit only candidates who meet the bar, not a hopeful long-list</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 shrink-0 text-primary">&#10003;</span>
                    <span>Track submission status in real-time — hiring managers see it too</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 shrink-0 text-primary">&#10003;</span>
                    <span>Build trust by working in the open, not behind closed doors</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Holistic approach */}
        <section className="border-t bg-muted/50 py-16">
          <div className="mx-auto max-w-5xl px-4">
            <div className="grid gap-10 md:grid-cols-2 items-center">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">
                  Holistic recruiting, not just matching
                </h2>
                <p className="text-muted-foreground">
                  Most platforms stop at &quot;fit / no fit.&quot; Holicruit
                  goes further — it helps candidates grow. A rejection
                  isn&apos;t a dead end, it&apos;s a development plan.
                </p>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <span className="mt-0.5 shrink-0 text-primary">&#10003;</span>
                    <span><strong>Skill radar charts</strong> — see strengths and gaps at a glance, no spreadsheets required</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 shrink-0 text-primary">&#10003;</span>
                    <span><strong>Training recommendations</strong> — each gap links to courses on Coursera, Udemy, and LinkedIn Learning</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 shrink-0 text-primary">&#10003;</span>
                    <span><strong>Experience-building opportunities</strong> — missing hands-on experience? See relevant roles on LinkedIn and Indeed</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 shrink-0 text-primary">&#10003;</span>
                    <span><strong>Come back stronger</strong> — close the gaps, update your profile, and re-apply with confidence</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-xl border bg-muted/30 p-6 space-y-4">
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  The old way
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>1. Apply to 30 jobs</p>
                  <p>2. Get 28 auto-rejections</p>
                  <p>3. &quot;We decided to move forward with other candidates&quot;</p>
                  <p>4. No idea what went wrong</p>
                  <p>5. Repeat the same cycle</p>
                </div>
                <div className="border-t pt-4">
                  <div className="text-sm font-medium text-primary uppercase tracking-wide">
                    The Holicruit way
                  </div>
                  <div className="space-y-2 text-sm mt-2">
                    <p>1. Apply and see your match score instantly</p>
                    <p>2. Radar chart shows exactly where you stand</p>
                    <p>3. Gap report names the specific skills to improve</p>
                    <p>4. Direct links to courses and experience opportunities</p>
                    <p>5. Come back with a stronger profile next time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t py-16 text-center">
          <div className="mx-auto max-w-2xl px-4">
            <h2 className="text-2xl font-bold mb-4">
              Hiring should be transparent. Start here.
            </h2>
            <p className="text-muted-foreground mb-6">
              Free to start. Upgrade when you need more roles, more
              submissions, or deeper insights.
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
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Holicruit &copy; {new Date().getFullYear()}. All rights reserved.
      </footer>
    </div>
  );
}
