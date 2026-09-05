import type { Metadata } from "next";
import { LegalShell, LegalHeading, LegalP, LegalList } from "@/components/legal/legal-shell";

export const metadata: Metadata = { title: "Privacy Policy · Holicruit" };

/**
 * Starting-point Privacy Policy. Replace the [BRACKETED] placeholders and have
 * qualified counsel review the whole document before launch.
 */
export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="Last updated: [DATE]">
      <LegalP>
        This policy explains what personal data Holicruit — the platform operated by [COMPANY],
        [ADDRESS] — collects, why, and the choices and rights you have. We are the data controller for
        the processing described here. Questions: [PRIVACY_EMAIL].
      </LegalP>

      <LegalHeading>Our approach</LegalHeading>
      <LegalP>
        Holicruit is built on data minimisation and opt-in sharing. Your identity is never shown to
        another party unless you choose to reveal it, and pay and location figures stay private until
        both sides agree to share. We do not sell your personal data.
      </LegalP>

      <LegalHeading>What we collect</LegalHeading>
      <LegalList
        items={[
          "Account data: name, email, password (stored only as a secure hash), and the role(s) you hold.",
          "Profile data: headline, skills, assessment and scenario results, endorsements, and any avatar you upload.",
          "Preferences: your optional alias, anonymity setting, and confidential pay and location expectations.",
          "Activity: matches, messages, and actions you take on the platform.",
          "Technical data: basic logs needed to run and secure the service.",
        ]}
      />

      <LegalHeading>Why we process it, and our legal basis</LegalHeading>
      <LegalList
        items={[
          "To provide the service (matching, messaging, assessments) — performance of a contract with you.",
          "To keep the platform secure and prevent abuse — our legitimate interests.",
          "To send service messages — performance of a contract; marketing only with your consent.",
          "To meet legal obligations where they apply.",
        ]}
      />

      <LegalHeading>How your data is shared</LegalHeading>
      <LegalP>
        Sharing is opt-in by design. Counterparties see your alias and verified evidence — not your
        real name — until you reveal yourself for a specific match. Employers see whether pay and
        location are compatible, never your figures, until both sides share. We use vetted service
        providers (for example hosting) under data-processing terms, and never sell your data.
      </LegalP>

      <LegalHeading>Your rights</LegalHeading>
      <LegalP>
        Subject to applicable law (including the GDPR), you can access, correct, export, or erase your
        data, object to or restrict certain processing, and withdraw consent at any time. You can
        export your data and delete your account yourself from the Privacy &amp; data section of your
        settings. You may also lodge a complaint with your local supervisory authority.
      </LegalP>

      <LegalHeading>Retention</LegalHeading>
      <LegalP>
        We keep your data while your account is active and for a limited period afterwards as needed
        for legal, security, and record-keeping purposes, then delete or anonymise it.
      </LegalP>

      <LegalHeading>International transfers and security</LegalHeading>
      <LegalP>
        Where data is processed outside your region, we rely on appropriate safeguards. We use
        industry-standard measures to protect your data, though no system is perfectly secure.
      </LegalP>

      <LegalHeading>Cookies</LegalHeading>
      <LegalP>
        We use only the cookies strictly necessary to run the service, including keeping you signed
        in. We do not use advertising trackers.
      </LegalP>

      <LegalHeading>Changes</LegalHeading>
      <LegalP>We&apos;ll post any changes here and update the date above. Contact [PRIVACY_EMAIL] with any questions.</LegalP>
    </LegalShell>
  );
}
