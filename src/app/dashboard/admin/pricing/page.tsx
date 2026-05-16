import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPlatformConfig } from "@/lib/milestones";
import { PricingConfigForm } from "@/components/admin/pricing-config-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AdminPricingPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const config = await getPlatformConfig();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pricing Configuration</h1>
        <p className="text-muted-foreground">
          Configure milestone fees, headhunter splits, and attribution windows.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Milestone Fees</CardTitle>
          <CardDescription>
            Set the default fees charged at each milestone. Hiring managers pay
            these when milestones are triggered.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PricingConfigForm
            config={{
              shortlistFeeCents: config.shortlistFeeCents,
              hireFeePermanentCents: config.hireFeePermanentCents,
              hireFeeContractShort: config.hireFeeContractShort,
              hireFeeContractMedium: config.hireFeeContractMedium,
              hireFeeContractLong: config.hireFeeContractLong,
              defaultHHSplitPct: config.defaultHHSplitPct,
              attributionWindowDays: config.attributionWindowDays,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
