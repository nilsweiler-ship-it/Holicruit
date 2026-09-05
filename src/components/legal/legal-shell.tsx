import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand/wordmark";

/** Simple centered layout for public legal pages. */
export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-8 px-4 py-10">
      <Wordmark href="/" />
      <header className="flex flex-col gap-1 border-b border-border pb-4">
        <h1 className="font-serif text-4xl tracking-tight text-foreground">{title}</h1>
        {updated && <p className="text-sm text-muted-foreground">{updated}</p>}
      </header>
      <main className="flex flex-col gap-5 text-[15px] leading-relaxed text-foreground">
        {children}
      </main>
    </div>
  );
}

export function LegalHeading({ children }: { children: ReactNode }) {
  return <h2 className="font-serif text-2xl tracking-tight text-foreground">{children}</h2>;
}

export function LegalP({ children }: { children: ReactNode }) {
  return <p className="text-muted-foreground">{children}</p>;
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((it) => (
        <li key={it} className="flex gap-2 text-muted-foreground">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/60" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}
