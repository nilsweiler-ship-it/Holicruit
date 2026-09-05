import type { Metadata } from "next";
import { LegalShell, LegalHeading, LegalP, LegalList } from "@/components/legal/legal-shell";

export const metadata: Metadata = { title: "Terms of Service · Holicruit" };

/**
 * Starting-point Terms of Service. Replace the [BRACKETED] placeholders and have
 * qualified counsel review the whole document before launch.
 */
export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="Last updated: [DATE]">
      <LegalP>
        These terms govern your use of Holicruit, operated by [COMPANY], [ADDRESS] (&quot;we&quot;,
        &quot;us&quot;). By creating an account or using the service, you agree to them. If you use the
        service on behalf of an organisation, you confirm you&apos;re authorised to bind it.
      </LegalP>

      <LegalHeading>The service</LegalHeading>
      <LegalP>
        Holicruit is a hiring platform that measures whole-person fit and connects candidates,
        hiring managers, recruiters, and training providers through opt-in, transparent matching. We
        may change or improve features over time.
      </LegalP>

      <LegalHeading>Your account</LegalHeading>
      <LegalList
        items={[
          "Provide accurate information and keep your credentials secure.",
          "You're responsible for activity under your account.",
          "One person or organisation per account, used for its intended role.",
        ]}
      />

      <LegalHeading>Acceptable use</LegalHeading>
      <LegalList
        items={[
          "Don't misrepresent your identity, skills, or a role.",
          "Don't harass, discriminate, scrape, spam, or attempt to de-anonymise other users.",
          "Don't use the platform for anything unlawful or to infringe others' rights.",
          "Employers and recruiters must use candidate data only to evaluate people for genuine roles, consistent with applicable employment and data-protection law.",
        ]}
      />

      <LegalHeading>No guarantee of outcomes</LegalHeading>
      <LegalP>
        Fit scores, growth reports, and matches are decision-support tools, not guarantees. We do not
        guarantee that a candidate will be hired, that a role will be filled, or that any assessment
        perfectly predicts performance. Hiring decisions and their legal compliance remain the
        employer&apos;s responsibility.
      </LegalP>

      <LegalHeading>Fees</LegalHeading>
      <LegalP>
        Some features are paid (for example certain hiring-manager and provider plans, and
        recruiter success fees). Applicable fees, billing terms, and taxes will be shown before you
        subscribe. [Add plan and refund terms.]
      </LegalP>

      <LegalHeading>Your content</LegalHeading>
      <LegalP>
        You keep ownership of the content you submit. You grant us the licence needed to operate the
        service (for example to display your profile to matched, opted-in parties). You&apos;re
        responsible for having the rights to what you submit.
      </LegalP>

      <LegalHeading>Disclaimers and liability</LegalHeading>
      <LegalP>
        The service is provided &quot;as is&quot; to the extent permitted by law. We are not liable for
        indirect or consequential losses, and our total liability is limited as set out here. [Insert
        jurisdiction-appropriate limitation.] Nothing limits liability that cannot be limited by law.
      </LegalP>

      <LegalHeading>Termination</LegalHeading>
      <LegalP>
        You can stop using the service and delete your account at any time from your settings. We may
        suspend or end access for breach of these terms or to protect the platform.
      </LegalP>

      <LegalHeading>Governing law and changes</LegalHeading>
      <LegalP>
        These terms are governed by the laws of [JURISDICTION], with disputes handled by its courts,
        unless mandatory law says otherwise. We&apos;ll post changes here and update the date above.
        Contact [LEGAL_EMAIL] with any questions.
      </LegalP>
    </LegalShell>
  );
}
