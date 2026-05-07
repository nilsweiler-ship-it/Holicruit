import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { AnimatedExplainer } from "@/components/landing/animated-explainer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero — dark navy with serif heading in gold */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.18_0.06_240)] via-[oklch(0.23_0.06_242)] to-[oklch(0.30_0.04_248)]" />
          {/* Replace with <div className="absolute inset-0 bg-[url('/hero.jpg')] bg-cover bg-center opacity-30" /> for a photo background */}
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.15)_0%,transparent_50%,rgba(0,0,0,0.1)_100%)]" />

          <div className="relative mx-auto max-w-6xl px-4 py-24 md:px-6 md:py-32 lg:py-40">
            <p className="mb-4 text-sm font-semibold tracking-widest text-white/60 uppercase">
              Direct. Transparent. Efficient.
            </p>
            <h1 className="font-display max-w-3xl text-5xl font-bold tracking-tight text-[oklch(0.88_0.09_85)] md:text-7xl lg:text-8xl">
              Revolutionizing the Recruiting Experience
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/70">
              Connect hiring managers directly with specialized recruiting
              agents. No intermediaries, no lag times, complete transparency.
            </p>
            <div className="mt-10 flex gap-4">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-8"
                asChild
              >
                <Link href="/compare">Learn More</Link>
              </Button>
              <Button
                size="lg"
                className="bg-white text-[oklch(0.18_0.06_240)] hover:bg-white/90 px-8"
                asChild
              >
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Why Choose */}
        <section className="border-t bg-muted/50 py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="mb-3 text-center font-display text-2xl font-bold text-primary md:text-3xl">
              Why Choose Holicruit?
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">
              Recruiters who don&apos;t understand the role flood you with
              mismatched CVs. You spend hours sifting instead of hiring.
              Holicruit fixes that.
            </p>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="space-y-2 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
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
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
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
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
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

        {/* Animated explainer — problem vs solution */}
        <AnimatedExplainer />

        {/* Pricing preview */}
        <section className="border-t bg-muted/50 py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="mb-3 text-center font-display text-2xl font-bold text-primary md:text-3xl">
              Plans for Hiring Managers
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">
              Start free, upgrade as your hiring needs grow. All plans include
              a 14-day free trial.
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-lg border bg-card p-6 text-center">
                <h3 className="font-semibold">Starter</h3>
                <div className="mt-2 text-3xl font-bold">Free</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  2 roles &middot; 10 apps/role
                </p>
                <Button className="mt-4 w-full" variant="outline" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
              <div className="rounded-lg border border-primary bg-card p-6 text-center shadow-sm">
                <div className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
                  Popular
                </div>
                <h3 className="font-semibold">Professional</h3>
                <div className="mt-2 text-3xl font-bold">
                  $99<span className="text-base font-normal text-muted-foreground">/mo</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  10 roles &middot; Full scoring &middot; Gap analysis
                </p>
                <Button className="mt-4 w-full" asChild>
                  <Link href="/register">Start Free Trial</Link>
                </Button>
              </div>
              <div className="rounded-lg border bg-card p-6 text-center">
                <h3 className="font-semibold">Enterprise</h3>
                <div className="mt-2 text-3xl font-bold">
                  $299<span className="text-base font-normal text-muted-foreground">/mo</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Unlimited &middot; Custom scoring &middot; Dedicated support
                </p>
                <Button className="mt-4 w-full" variant="outline" asChild>
                  <Link href="/register">Contact Sales</Link>
                </Button>
              </div>
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Save 20% with annual billing.{" "}
              <Link href="/pricing" className="text-primary hover:underline">
                See full comparison &rarr;
              </Link>
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center">
          <div className="mx-auto max-w-2xl px-4">
            <h2 className="font-display text-2xl font-bold text-primary mb-4 md:text-3xl">
              Stop drowning in CVs. Start hiring the right people.
            </h2>
            <p className="text-muted-foreground mb-6">
              Free to start. Upgrade when you need more roles, more
              submissions, or deeper insights.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="px-8" asChild>
                <Link href="/register">Get Started Free</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8"
                asChild
              >
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
