import type { Metadata } from "next";
import { Check, Mail } from "lucide-react";
import { submitLead } from "@/lib/actions/leads";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Talk to us — Holicruit",
  description: "Get in touch with Holicruit about hiring for your team, enterprise plans, or partnerships.",
};

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30";
const labelCls = "text-xs font-semibold uppercase tracking-wide text-muted-foreground";

const PLAN_LABEL: Record<string, string> = {
  "hm-team": "Team plan (hiring)",
  "hm-scale": "Scale plan (hiring, enterprise)",
  "provider-partner": "Partner plan (training provider)",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string; plan?: string }>;
}) {
  const { sent, error, plan } = await searchParams;
  const planLabel = plan ? PLAN_LABEL[plan] : undefined;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
      <p className="text-sm font-medium text-muted-foreground">Contact</p>
      <h1 className="font-serif mt-2 text-4xl tracking-tight">Talk to us</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
        Hiring for your team, an enterprise rollout, a training partnership, or press — tell us a little
        about what you need and a person will get back to you, usually within one business day.
      </p>

      {sent ? (
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-border bg-card p-5">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
            <Check className="size-4" />
          </span>
          <div className="text-sm">
            <p className="font-medium text-foreground">Thank you — we&apos;ve received your message.</p>
            <p className="text-muted-foreground">We&apos;ll be in touch shortly.</p>
          </div>
        </div>
      ) : (
        <form action={submitLead} className="mt-8 flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
          {planLabel && (
            <>
              <input type="hidden" name="plan" value={plan} />
              <p className="rounded-xl border border-primary/25 bg-primary/5 p-3 text-sm text-foreground">
                You&apos;re enquiring about the <strong>{planLabel}</strong>. We&apos;ll come back with a
                quote and next steps.
              </p>
            </>
          )}
          {error && (
            <p className="rounded-xl border border-primary/30 bg-primary/8 p-3 text-sm text-foreground">
              Please provide your name and a valid email address.
            </p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Name</span>
              <input name="name" required className={inputCls} placeholder="Your name" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Work email</span>
              <input name="email" type="email" required className={inputCls} placeholder="you@company.com" />
            </label>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Company (optional)</span>
            <input name="company" className={inputCls} placeholder="Company or organisation" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>How can we help?</span>
            <textarea name="message" rows={5} className={inputCls} placeholder="A few lines about your hiring needs, team size, or question…" />
          </label>
          <Button type="submit" className="self-start">
            <Mail className="size-4" />
            Send message
          </Button>
          <p className="text-xs text-muted-foreground">
            We use your details only to reply to you. See our Privacy Policy.
          </p>
        </form>
      )}
    </div>
  );
}
