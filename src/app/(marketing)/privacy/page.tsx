import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Holicruit",
  description:
    "How Holicruit collects, uses, and protects personal data: profile and skills data, scenario results, endorsements, legal bases, sharing, retention, and your GDPR rights.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm font-medium text-muted-foreground">Legal</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight">
        Privacy Policy
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated: 2026</p>

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
          <h2 className="text-xl font-semibold text-foreground">1. Overview</h2>
          <p>
            This Privacy Policy explains how Holicruit (&ldquo;we,&rdquo;
            &ldquo;us&rdquo;) collects, uses, shares, and protects personal data
            when you use the Holicruit platform. We act as a data controller for
            the personal data described here. We are committed to processing
            personal data in line with the EU General Data Protection Regulation
            (GDPR) and applicable data-protection law.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            2. Data We Collect
          </h2>
          <ul className="space-y-2">
            <li>
              <strong className="text-foreground">Profile data</strong> — name,
              contact details, account credentials, the Hats you operate in, and
              role or company information.
            </li>
            <li>
              <strong className="text-foreground">Skills data</strong> — declared
              skills, experience, and the hard-fit attributes used by the Fit
              Model.
            </li>
            <li>
              <strong className="text-foreground">Scenario results</strong> —
              responses to and outcomes of the objective soft-skill scenario
              assessment.
            </li>
            <li>
              <strong className="text-foreground">Endorsements</strong> — skill
              endorsements you give or receive.
            </li>
            <li>
              <strong className="text-foreground">Usage data</strong> — device,
              log, and interaction data generated as you use the Platform.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            3. How and Why We Use Data
          </h2>
          <p>We use personal data to:</p>
          <ul className="space-y-2">
            <li>provide opt-in matching between candidates and roles;</li>
            <li>
              produce transparency outputs — your Fit Model scores and Growth
              Reports;
            </li>
            <li>operate scenario assessments and skill endorsements;</li>
            <li>process payments and manage subscriptions and success fees;</li>
            <li>secure, maintain, and improve the Platform;</li>
            <li>communicate with you and meet legal obligations.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            4. Legal Bases for Processing
          </h2>
          <p>
            We rely on the following legal bases: <strong className="text-foreground">contract</strong>{" "}
            (to provide the services you sign up for);{" "}
            <strong className="text-foreground">consent</strong> (for opt-in
            matching and sharing your profile with hiring managers and
            recruiters, which you can withdraw at any time);{" "}
            <strong className="text-foreground">legitimate interests</strong>{" "}
            (to secure and improve the Platform, balanced against your rights);
            and <strong className="text-foreground">legal obligation</strong>{" "}
            (for example, accounting and tax records).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            5. Sharing of Data
          </h2>
          <p>
            We share personal data only as needed to operate the Platform. Your
            candidate profile is shared with hiring managers and recruiters only
            where you have opted in to be matched. We use{" "}
            <strong className="text-foreground">Stripe</strong> to process
            payments; payment data is handled by Stripe under its own terms. We
            may share data with infrastructure and analytics processors acting on
            our instructions, and where required by law. We do not sell your
            personal data.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">6. Retention</h2>
          <p>
            We retain personal data for as long as your account is active and as
            needed to provide the Platform, then for the period required to meet
            legal, accounting, or dispute-resolution obligations. When data is no
            longer needed, we delete or anonymise it. You can ask us to delete
            your account, subject to retention we are legally required to keep.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            7. Your Data-Subject Rights
          </h2>
          <p>
            Subject to applicable law, you have the right to access, rectify, or
            erase your personal data; to restrict or object to processing; to
            data portability; and to withdraw consent at any time without
            affecting prior processing. You also have the right to lodge a
            complaint with your local data-protection authority. To exercise
            these rights, contact us using the details below.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">8. Cookies</h2>
          <p>
            We use cookies and similar technologies to keep you signed in, to
            remember preferences, and to understand how the Platform is used.
            Strictly necessary cookies are required for the Platform to function;
            other cookies are used in line with your choices where consent is
            required. You can manage cookies through your browser settings.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">9. Contact</h2>
          <p>
            For privacy questions or to exercise your rights, contact our team
            through the Platform or at the contact details we publish. This
            policy works alongside our{" "}
            <Link href="/terms" className="text-primary underline-offset-4 hover:underline">
              Terms &amp; Conditions
            </Link>
            . We may update this policy from time to time and will communicate
            material changes through the Platform.
          </p>
        </section>
      </div>
    </div>
  );
}
