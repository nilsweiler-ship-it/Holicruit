import { getActiveCandidateId } from "@/lib/persona";
import { SubNav } from "@/components/layout/sub-nav";
import { PersonaSwitcher } from "@/components/candidate/persona-switcher";

const ITEMS = [
  { label: "Matches", href: "/candidate/matches" },
  { label: "Today", href: "/candidate/today" },
  { label: "Profile", href: "/candidate/profile" },
];

export default async function CandidateLayout({ children }: { children: React.ReactNode }) {
  const activeId = await getActiveCandidateId();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <SubNav items={ITEMS} />
        <PersonaSwitcher activeId={activeId} />
      </div>
      {children}
    </div>
  );
}
