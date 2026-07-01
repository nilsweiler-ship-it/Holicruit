import { SubNav } from "@/components/layout/sub-nav";

const ITEMS = [
  { label: "Pipeline", href: "/hiring-manager/pipeline" },
  { label: "Roles", href: "/hiring-manager/roles" },
  { label: "Analytics", href: "/hiring-manager/analytics" },
  { label: "Billing", href: "/hiring-manager/billing" },
];

export default function HiringManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <SubNav items={ITEMS} />
      {children}
    </div>
  );
}
