import { SubNav } from "@/components/layout/sub-nav";

const ITEMS = [
  { label: "Matches", href: "/candidate/matches" },
  { label: "Today", href: "/candidate/today" },
  { label: "Profile", href: "/candidate/profile" },
];

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <SubNav items={ITEMS} />
      {children}
    </div>
  );
}
