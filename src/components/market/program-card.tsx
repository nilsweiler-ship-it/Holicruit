import { Megaphone, Sparkles, TrendingUp } from "lucide-react";
import type { Program } from "@/lib/types";
import { CompanyMark } from "@/components/people/person-avatar";
import { EnrollButton } from "@/components/market/enroll-button";
import { cn } from "@/lib/utils";

/**
 * Candidate-facing marketplace card for a program offered by a fourth-party
 * training provider. Sponsored (promoted) programs get a visible badge and a
 * coral-accented border.
 */
export function ProgramCard({
  program,
  rolesCleared,
}: {
  program: Program;
  rolesCleared: number;
}) {
  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-2xl border bg-card p-5",
        program.sponsored ? "border-primary/40" : "border-border",
      )}
    >
      <div className="flex items-start gap-3">
        <CompanyMark name={program.provider} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{program.provider}</p>
          <p className="truncate text-xs text-muted-foreground">{program.providerKind}</p>
        </div>
        {program.sponsored && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-2 py-0.5 text-xs font-semibold text-primary">
            <Megaphone className="size-3" />
            Promoted
          </span>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-foreground">{program.title}</h3>
        <p className="text-sm text-muted-foreground">{program.format}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-xs font-medium text-success">
          <Sparkles className="size-3" />
          closes your gap
        </span>
        {rolesCleared > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            <TrendingUp className="size-3" />+{rolesCleared} matches
          </span>
        )}
        {program.tags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </div>

      <EnrollButton programTitle={program.title} programId={program.id} />
    </article>
  );
}
