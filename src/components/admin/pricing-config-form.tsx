"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface PricingConfig {
  shortlistFeeCents: number;
  hireFeePermanentCents: number;
  hireFeeContractShort: number;
  hireFeeContractMedium: number;
  hireFeeContractLong: number;
  defaultHHSplitPct: number;
  attributionWindowDays: number;
}

export function PricingConfigForm({ config }: { config: PricingConfig }) {
  const [values, setValues] = useState(config);
  const [saving, setSaving] = useState(false);

  function update(key: keyof PricingConfig, val: string) {
    setValues((prev) => ({ ...prev, [key]: Number(val) }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        toast.error("Failed to save");
        return;
      }
      toast.success("Pricing updated");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const fields: { key: keyof PricingConfig; label: string; unit: string }[] = [
    { key: "shortlistFeeCents", label: "Shortlist Fee", unit: "cents" },
    { key: "hireFeePermanentCents", label: "Hire Fee (Permanent)", unit: "cents" },
    { key: "hireFeeContractShort", label: "Hire Fee (Contract <3mo)", unit: "cents" },
    { key: "hireFeeContractMedium", label: "Hire Fee (Contract 3-6mo)", unit: "cents" },
    { key: "hireFeeContractLong", label: "Hire Fee (Contract 6mo+)", unit: "cents" },
    { key: "defaultHHSplitPct", label: "Headhunter Default Split", unit: "%" },
    { key: "attributionWindowDays", label: "Attribution Window", unit: "days" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map(({ key, label, unit }) => (
          <div key={key} className="space-y-1">
            <Label className="text-sm">
              {label}{" "}
              <span className="text-muted-foreground font-normal">
                ({unit === "cents" ? `$${(values[key] / 100).toFixed(0)}` : `${values[key]} ${unit}`})
              </span>
            </Label>
            <Input
              type="number"
              value={values[key]}
              onChange={(e) => update(key, e.target.value)}
              min={0}
            />
          </div>
        ))}
      </div>
      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Configuration"}
      </Button>
    </div>
  );
}
