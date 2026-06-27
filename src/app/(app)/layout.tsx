import { Wordmark } from "@/components/brand/wordmark";
import { UserMenu } from "@/components/layout/user-menu";
import { requireUser, getRole } from "@/lib/persona";

const ROLE_LABEL: Record<string, string> = {
  candidate: "Candidate",
  hiring_manager: "Hiring Manager",
  recruiter: "Recruiter",
  provider: "Training Provider",
};

/**
 * The app shell, shared across all three hats. A slim top bar (wordmark +
 * persistent hat switcher) over a centered, responsive content column.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const role = await getRole();
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
          <Wordmark href="/" />
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-border bg-card px-3 py-1 text-sm font-medium text-foreground">
              {ROLE_LABEL[role] ?? "Account"}
            </span>
            <UserMenu name={user.name} initials={user.initials} />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
