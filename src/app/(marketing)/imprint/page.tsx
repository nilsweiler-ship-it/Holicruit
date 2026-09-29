import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Imprint (Impressum) — Holicruit",
  description: "Legal notice and provider identification for Holicruit.",
};

/**
 * Impressum / legal notice. Required under German (§5 TMG/DDG) and Austrian
 * (§5 ECG) law and expected in Switzerland. Replace every [BRACKETED] value
 * with the real company details before launch.
 */
export default function ImprintPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm font-medium text-muted-foreground">Legal</p>
      <h1 className="font-serif mt-2 text-4xl tracking-tight">Imprint</h1>
      <p className="mt-3 text-sm text-muted-foreground">Impressum · Legal notice</p>

      <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Provider</h2>
          <p>
            [COMPANY LEGAL NAME], [LEGAL FORM, e.g. GmbH / AG]
            <br />
            [STREET AND NUMBER]
            <br />
            [POSTAL CODE, CITY]
            <br />
            [COUNTRY]
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Contact</h2>
          <p>
            Email: [CONTACT EMAIL]
            <br />
            Phone: [PHONE]
            <br />
            <Link href="/contact" className="text-primary underline-offset-4 hover:underline">
              Contact form
            </Link>
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Represented by</h2>
          <p>[MANAGING DIRECTOR(S) / BOARD]</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Register &amp; identifiers</h2>
          <p>
            Commercial register: [REGISTER COURT / HANDELSREGISTERAMT], [REGISTER NUMBER]
            <br />
            Company identification (UID / VAT): [UID or VAT ID]
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Responsible for content</h2>
          <p>[NAME], [ADDRESS AS ABOVE]</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Dispute resolution</h2>
          <p>
            The European Commission provides a platform for online dispute resolution at{" "}
            <a href="https://ec.europa.eu/consumers/odr" className="text-primary underline-offset-4 hover:underline">
              ec.europa.eu/consumers/odr
            </a>
            . We are not obliged and not willing to participate in dispute-resolution proceedings
            before a consumer arbitration board.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Related</h2>
          <p>
            <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
              Privacy Policy
            </Link>{" "}
            ·{" "}
            <Link href="/terms" className="text-primary underline-offset-4 hover:underline">
              Terms &amp; Conditions
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
