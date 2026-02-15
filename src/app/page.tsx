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
            Hire expert-to-expert. Skip the middleman.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Holicruit lets hiring managers define exactly what they need and
            see only the candidates who match — no recruiter phone tag, no
            bloated long-lists. Experts evaluating experts, directly.
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

        {/* Pain → Solution */}
        <section className="border-t bg-muted/50 py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="mb-3 text-center text-2xl font-bold">
              Traditional recruiting is broken
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">
              Recruiters who don&apos;t understand the role flood you with
              mismatched CVs. You spend hours sifting instead of hiring.
              Holicruit fixes that.
            </p>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="space-y-2 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                  1
                </div>
                <h3 className="font-semibold">You define the bar</h3>
                <p className="text-sm text-muted-foreground">
                  Set exact skill requirements, levels, and weights — your
                  domain knowledge drives the criteria, not a recruiter&apos;s
                  guess.
                </p>
              </div>
              <div className="space-y-2 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                  2
                </div>
                <h3 className="font-semibold">Only matches land on your desk</h3>
                <p className="text-sm text-muted-foreground">
                  Candidates are scored against your criteria automatically.
                  No more 50-page long-lists — just a ranked shortlist of
                  people who actually fit.
                </p>
              </div>
              <div className="space-y-2 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                  3
                </div>
                <h3 className="font-semibold">Decide in minutes, not weeks</h3>
                <p className="text-sm text-muted-foreground">
                  See match scores, skill gaps, and fit breakdowns at a
                  glance. Make informed hiring decisions without the
                  back-and-forth.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Expert-to-expert value prop */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4">
            <div className="grid gap-10 md:grid-cols-2 items-center">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">
                  Why expert-to-expert works
                </h2>
                <p className="text-muted-foreground">
                  When a senior engineer defines what &quot;senior&quot; means
                  for their team, the signal quality is incomparably better
                  than a generalist recruiter&apos;s keyword scan.
                </p>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <span className="mt-0.5 shrink-0 text-primary">&#10003;</span>
                    <span><strong>Hiring managers set skill-level criteria</strong> — not vague job descriptions rewritten by someone outside the domain</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 shrink-0 text-primary">&#10003;</span>
                    <span><strong>Headhunters submit only pre-qualified candidates</strong> — they see the scoring rubric upfront and know exactly what qualifies</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 shrink-0 text-primary">&#10003;</span>
                    <span><strong>No more 80-CV long-lists</strong> — auto-shortlisting surfaces the top matches so you review 5 candidates, not 50</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 shrink-0 text-primary">&#10003;</span>
                    <span><strong>Gap analysis shows exactly where candidates fall short</strong> — no guessing, no second-hand summaries</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-xl border bg-muted/30 p-6 space-y-4">
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  The old way
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>1. Write job description</p>
                  <p>2. Recruiter rewrites it (loses nuance)</p>
                  <p>3. Recruiter sends 40+ CVs</p>
                  <p>4. You spend days screening</p>
                  <p>5. Half don&apos;t meet basic requirements</p>
                </div>
                <div className="border-t pt-4">
                  <div className="text-sm font-medium text-primary uppercase tracking-wide">
                    The Holicruit way
                  </div>
                  <div className="space-y-2 text-sm mt-2">
                    <p>1. Define skills, levels &amp; weights directly</p>
                    <p>2. Candidates scored against your criteria</p>
                    <p>3. Review a ranked shortlist of top matches</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t bg-muted/50 py-16 text-center">
          <div className="mx-auto max-w-2xl px-4">
            <h2 className="text-2xl font-bold mb-4">
              Stop drowning in CVs. Start hiring the right people.
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
