"use client";

import { useRouter } from "next/navigation";
import { Check, ChevronDown, Users } from "lucide-react";
import { CANDIDATE_PERSONAS } from "@/lib/fixtures";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Kept in sync with PERSONA_COOKIE in src/lib/persona.ts (server-only module).
const PERSONA_COOKIE = "hc_persona";

// Defined at module scope so the cookie side effect isn't flagged as mutating
// outside state from within the component.
function writePersonaCookie(id: string) {
  document.cookie = `${PERSONA_COOKIE}=${id}; path=/; max-age=31536000; samesite=lax`;
}

/**
 * Switches the active demo candidate persona. The personas span industries, so
 * this is how a reviewer sees the candidate flow render for a nurse or a
 * salesperson, not just an engineer.
 */
export function PersonaSwitcher({ activeId }: { activeId: string }) {
  const router = useRouter();
  const active = CANDIDATE_PERSONAS.find((p) => p.id === activeId) ?? CANDIDATE_PERSONAS[0];

  function pick(id: string) {
    writePersonaCookie(id);
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm transition-colors hover:bg-accent">
        <Users className="size-4 text-primary" />
        <span className="font-medium">{active.name}</span>
        <span className="hidden text-muted-foreground sm:inline">· {active.industry}</span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Viewing as (demo persona)
        </DropdownMenuLabel>
        {CANDIDATE_PERSONAS.map((p) => (
          <DropdownMenuItem
            key={p.id}
            onClick={() => pick(p.id)}
            className="cursor-pointer flex-col items-start gap-0"
          >
            <div className="flex w-full items-center gap-2">
              <span className="font-medium">{p.name}</span>
              {p.id === active.id && <Check className="ml-auto size-4 text-primary" />}
            </div>
            <span className="text-xs text-muted-foreground">
              {p.industry} · {p.headline}
            </span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[11px] font-normal text-muted-foreground">
          Same screens, any industry — the fit model is domain-agnostic.
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
