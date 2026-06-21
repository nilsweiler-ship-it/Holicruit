import { Wordmark } from "@/components/brand/wordmark";
import { HatSwitcher } from "@/components/layout/hat-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { requireUser } from "@/lib/persona";

/**
 * The app shell, shared across all three hats. A slim top bar (wordmark +
 * persistent hat switcher) over a centered, responsive content column.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
          <Wordmark href="/select-role" />
          <div className="flex items-center gap-2">
            <HatSwitcher />
            <UserMenu name={user.name} initials={user.initials} />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
