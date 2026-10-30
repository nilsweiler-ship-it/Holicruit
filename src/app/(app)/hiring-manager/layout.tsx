import { SubNav } from "@/components/layout/sub-nav";
import { requireHat } from "@/lib/access";

const ITEMS = [
  { label: "Pipeline", href: "/hiring-manager/pipeline" },
  { label: "Roles", href: "/hiring-manager/roles" },
  { label: "Talent pool", href: "/hiring-manager/talent-pool" },
  { label: "Analytics", href: "/hiring-manager/analytics" },
  { label: "Billing", href: "/hiring-manager/billing" },
];

export default async function HiringManagerLayout({ children }: { children: React.ReactNode }) {
  // Guard: hiring-manager-only area. Pages still check ownership themselves —
  // a layout is not re-run on every client navigation.
  await requireHat("hiring_manager");

  return (
    <div className="flex flex-col gap-6">
      <SubNav items={ITEMS} />
      {children}
    </div>
  );
}
