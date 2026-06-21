import { getActiveCandidateId } from "@/lib/persona";
import { SubNav } from "@/components/layout/sub-nav";

const ITEMS = [
  { label: "Matches", href: "/candidate/matches" },
  { label: "Today", href: "/candidate/today" },
  { label: "Profile", href: "/candidate/profile" },
];

export default async function CandidateLayout({ children }: { children: React.ReactNode }) {
  // Guard: candidate-only area (redirects non-candidate accounts).
  await getActiveCandidateId();

  return (
    <div className="flex flex-col gap-6">
      <SubNav items={ITEMS} />
      {children}
    </div>
  );
}
