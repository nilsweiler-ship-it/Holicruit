import Link from "next/link";
import { Button } from "@/components/ui/button";

export function GapReportGate() {
  return (
    <div className="relative">
      {/* Blurred placeholder */}
      <div className="blur-sm pointer-events-none select-none" aria-hidden>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 rounded border p-3">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-4 w-16 rounded bg-muted" />
              <div className="h-4 w-12 rounded bg-muted" />
              <div className="h-4 w-12 rounded bg-muted" />
              <div className="h-5 w-16 rounded-full bg-muted" />
              <div className="h-4 w-40 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-lg">
        <div className="text-center space-y-3 max-w-sm">
          <p className="font-semibold">Gap Analysis</p>
          <p className="text-sm text-muted-foreground">
            Skill gap analysis is available on Professional and Enterprise plans.
            See exactly where candidates fall short and get actionable recommendations.
          </p>
          <Button asChild>
            <Link href="/dashboard/hiring-manager/billing">Upgrade to Unlock</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
