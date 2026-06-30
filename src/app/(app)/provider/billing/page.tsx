import type { Metadata } from "next";
import { Building2, Check, CheckCircle2, Megaphone, Receipt } from "lucide-react";
import { plansFor, planByKey, type Plan } from "@/lib/plans";
import { getActivePlan } from "@/lib/services/billing";
import { requireUser } from "@/lib/persona";
import { choosePlan } from "@/lib/actions/billing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Billing · Holicruit" };

/**
 * Provider billing. Training/education providers are organisations, so the paid
 * Partner tier uses the corporate quote flow → invoice / PO, not a card. Listed
 * is free; there is no enterprise tier here.
 */
export default async function ProviderBillingPage({
  searchParams,
}: {
  searchParams: Promise<{ activated?: string; promote?: string }>;
}) {
  const { activated, promote } = await searchParams;
  const user = await requireUser();
  const { plan: current } = await getActivePlan(user.id, "provider");
  const tiers = plansFor("provider");
  const activatedName = activated ? planByKey(activated)?.name ?? "Your plan" : undefined;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Plans for training providers — billed by invoice, annual contracts.
        </p>
      </header>

      {/* Current plan status */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-center gap-2">
            <Building2 className="size-5 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Current plan
            </span>
          </div>
          {current.paid && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <Receipt className="size-3.5" />
              Billed by invoice
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-2xl font-bold tracking-tight text-foreground">{current.name}</span>
          <span className="text-sm text-muted-foreground">
            {current.price}
            {current.cadence ? ` ${current.cadence}` : ""}
          </span>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {current.features.map((f) => (
            <li key={f} className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Check className="size-3.5 text-success" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Banners */}
      {activatedName && (
        <Banner tone="success" icon={CheckCircle2}>
          {activatedName} is active — an invoice will be sent to your billing contact.
        </Banner>
      )}
      {promote && (
        <Banner tone="warning" icon={Megaphone}>
          Promoting programs needs the Partner plan.
        </Banner>
      )}

      {/* Tier cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {tiers.map((plan) => (
          <TierCard key={plan.key} plan={plan} current={current.key === plan.key} />
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Prices in EUR, excl. VAT. Annual contracts. Candidates and recruiters are always free.
      </p>
    </div>
  );
}

function TierCard({ plan, current }: { plan: Plan; current: boolean }) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-4 rounded-2xl border p-5",
        plan.highlight ? "border-primary/30 bg-primary/8" : "border-border bg-card",
      )}
    >
      {plan.highlight && (
        <span className="absolute -top-2.5 left-5 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
          Most popular
        </span>
      )}

      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-foreground">{plan.name}</h2>
        <p className="flex items-baseline gap-1">
          <span className="text-2xl font-bold tracking-tight text-foreground">{plan.price}</span>
          {plan.cadence && <span className="text-sm text-muted-foreground">{plan.cadence}</span>}
        </p>
      </div>

      <ul className="flex flex-1 flex-col gap-2">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-foreground">
            <Check className="mt-0.5 size-4 shrink-0 text-success" />
            {f}
          </li>
        ))}
      </ul>

      <TierCta plan={plan} current={current} />
    </div>
  );
}

function TierCta({ plan, current }: { plan: Plan; current: boolean }) {
  if (current) {
    return (
      <Button className="w-full" variant="outline" disabled>
        Current plan
      </Button>
    );
  }

  if (!plan.paid) {
    return (
      <form action={choosePlan}>
        <input type="hidden" name="plan" value={plan.key} />
        <Button className="w-full">Switch to {plan.name}</Button>
      </form>
    );
  }

  return <QuoteForm plan={plan} />;
}

/** The corporate "Request a quote" disclosure — invoice / PO, no card. */
function QuoteForm({ plan }: { plan: Plan }) {
  return (
    <details className="group rounded-lg border border-border bg-background/50 p-3 open:bg-background">
      <summary className="cursor-pointer list-none text-sm font-medium text-primary">
        <span className="group-open:hidden">Request a quote</span>
        <span className="hidden group-open:inline">Billing details</span>
      </summary>
      <form action={choosePlan} className="mt-3 flex flex-col gap-3">
        <input type="hidden" name="plan" value={plan.key} />
        <Field label="Company legal name" name="companyLegalName" placeholder="Acme Academy GmbH" required />
        <Field label="VAT / Tax ID" name="vatId" placeholder="DE123456789" required />
        <Field
          label="Billing email"
          name="billingEmail"
          type="email"
          placeholder="ap@acme.com"
          required
        />
        <Field label="Seats" name="seats" type="number" min={1} defaultValue={3} required />
        <div className="flex flex-col gap-1">
          <label
            htmlFor={`cycle-${plan.key}`}
            className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Billing cycle
          </label>
          <select
            id={`cycle-${plan.key}`}
            name="billingCycle"
            defaultValue="Annual"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="Annual">Annual</option>
            <option value="Quarterly">Quarterly</option>
          </select>
        </div>
        <Button type="submit" className="w-full">
          Request quote &amp; activate
        </Button>
        <p className="text-xs text-muted-foreground">
          No card needed — billed annually by invoice / PO.
        </p>
      </form>
    </details>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  min,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  min?: number;
  defaultValue?: string | number;
}) {
  const id = `f-${name}`;
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        min={min}
        defaultValue={defaultValue}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}

function Banner({
  tone,
  icon: Icon,
  children,
}: {
  tone: "success" | "warning";
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-2xl border p-4 text-sm",
        tone === "success" && "border-success/30 bg-success/10 text-success",
        tone === "warning" && "border-primary/30 bg-primary/8 text-foreground",
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}
