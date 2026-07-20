import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions — Holicruit",
  description:
    "Holicruit General Terms & Conditions: the service, accounts, opt-in matching, fees and success fees, training-provider listings, liability, and governing law.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm font-medium text-muted-foreground">Legal</p>
      <h1 className="font-serif mt-2 text-4xl tracking-tight">
        General Terms &amp; Conditions
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated: 2026
      </p>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/40 bg-primary/8 p-4 text-sm">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-primary" />
        <p className="text-foreground">
          <strong>Template for review — not yet legal advice.</strong> This
          document is a starting template and must be reviewed by qualified
          counsel before launch.
        </p>
      </div>

      <div className="mt-10 space-y-10 text-[15px] leading-relaxed text-muted-foreground">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">1. Definitions</h2>
          <p>
            &ldquo;Holicruit,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
            &ldquo;our&rdquo; means the operator of the Holicruit platform.
            &ldquo;Platform&rdquo; means the Holicruit website, applications, and
            related services. &ldquo;User,&rdquo; &ldquo;you,&rdquo; or
            &ldquo;your&rdquo; means any person or organisation that accesses or
            uses the Platform. &ldquo;Hat&rdquo; means a role you act in on the
            Platform: Candidate, Hiring Manager, Recruiter, or Training Provider.
            &ldquo;Fit Model&rdquo; means the structured assessment of hard fit,
            soft fit, and mutual fit used to evaluate alignment between a
            candidate and a role.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">2. The Service</h2>
          <p>
            Holicruit is a holistic recruiting and matching platform built on
            radical transparency. The Platform helps candidates understand their
            fit for roles, helps hiring managers evaluate candidates against a
            consistent bar, enables recruiters to facilitate matches, and lets
            training providers offer programs that close candidates&apos; skill
            gaps. We may add, modify, or discontinue features at our discretion.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            3. Accounts &amp; Roles
          </h2>
          <p>
            You need an account to use most features. Each account operates under a single role; register a separate account to use Holicruit in another capacity. You are responsible for the accuracy of the
            information you provide, for maintaining the confidentiality of your
            credentials, and for all activity under your account. You must be of
            legal working age in your jurisdiction and have the authority to
            accept these Terms on behalf of any organisation you represent.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            4. Acceptable Use
          </h2>
          <p>
            You agree not to misuse the Platform. This includes not submitting
            false, misleading, or fraudulent information; not impersonating any
            person or organisation; not scraping, reverse-engineering, or
            circumventing the matching or assessment systems; not using the
            Platform to discriminate unlawfully; and not interfering with the
            security or integrity of the Platform. We may suspend or terminate
            accounts that violate this section.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            5. Matching is Opt-In — No Guarantee of Employment or Hire
          </h2>
          <p>
            Matching on Holicruit is opt-in. We do not send cold applications,
            and a candidate&apos;s profile is shared with hiring managers or
            recruiters only where the candidate has consented to be matched. The
            Fit Model, scores, and Growth Reports are informational tools. We do
            not guarantee that any candidate will be hired, that any role will be
            filled, or that any match will result in employment. Hiring decisions
            rest solely with the relevant hiring manager and candidate.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            6. Fees, Subscriptions &amp; Payments
          </h2>
          <p>
            Candidate accounts are free. Hiring Manager and Training Provider
            features may be offered on free and paid subscription tiers. Paid
            subscriptions are billed in advance on a recurring basis (monthly
            unless stated otherwise) and renew automatically until cancelled.
            Recruiters join for free and are charged a platform success fee only
            upon a successful hire facilitated through the Platform.
          </p>
          <p>
            Payments are processed by Stripe. By providing payment details, you
            authorise us and Stripe to charge the applicable fees. Prices are
            shown in EUR and exclusive of taxes unless stated otherwise. Except
            where required by law, fees are non-refundable. We may change pricing
            on reasonable notice; changes take effect at your next billing cycle.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            7. Training-Provider Listings
          </h2>
          <p>
            Training Providers may list programs that close candidates&apos; skill
            gaps. Listings are ranked primarily by outcomes. Promoted placement
            on paid tiers is clearly distinguishable from organic ranking.
            Providers are solely responsible for the accuracy of their listings
            and the delivery and quality of their programs. We are not a party to,
            and accept no responsibility for, any agreement between a candidate
            and a Training Provider.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            8. Intellectual Property
          </h2>
          <p>
            The Platform, including the Fit Model, scenario assessments, software,
            design, and trademarks, is owned by Holicruit or its licensors and is
            protected by intellectual-property laws. You retain ownership of the
            content you submit, and you grant us a worldwide, non-exclusive
            licence to host, process, and display that content as needed to
            operate the Platform. You may not copy, distribute, or create
            derivative works from the Platform except as expressly permitted.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            9. Data Protection
          </h2>
          <p>
            Our handling of personal data is described in our{" "}
            <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
            , which forms part of these Terms. By using the Platform you
            acknowledge that policy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            10. Disclaimers &amp; Limitation of Liability
          </h2>
          <p>
            The Platform is provided &ldquo;as is&rdquo; and &ldquo;as
            available,&rdquo; without warranties of any kind to the fullest extent
            permitted by law. We do not warrant that the Platform will be
            uninterrupted, error-free, or that scores and matches will be
            accurate or complete. To the maximum extent permitted by law, our
            aggregate liability arising out of or relating to the Platform will
            not exceed the amounts you paid to us in the twelve months preceding
            the claim. We are not liable for indirect, incidental, or
            consequential damages, including lost profits or hiring outcomes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">11. Termination</h2>
          <p>
            You may stop using the Platform and close your account at any time.
            We may suspend or terminate your access if you breach these Terms or
            where required by law. On termination, your right to use the Platform
            ceases; sections that by their nature should survive (including fees
            already due, intellectual property, disclaimers, and liability limits)
            will survive.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            12. Governing Law &amp; Changes
          </h2>
          <p>
            These Terms are governed by the laws of the European Union and the
            member state in which Holicruit is established, without regard to
            conflict-of-laws rules. We may update these Terms from time to time;
            material changes will be communicated through the Platform. Your
            continued use after changes take effect constitutes acceptance of the
            updated Terms.
          </p>
        </section>
      </div>
    </div>
  );
}
