"use client";

import { Button } from "@/components/ui/button";
import { saveScoreSheet } from "@/lib/actions/hm";
import { SCORE_CRITERIA, RECOMMENDATIONS } from "@/lib/scoresheet";

const RATINGS = [1, 2, 3, 4, 5] as const;

/** Structured interview scorecard form. Rates each criterion 1–5. */
export function ScoreSheetForm({ matchId }: { matchId: string }) {
  return (
    <form
      action={saveScoreSheet.bind(null, matchId)}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5"
    >
      <div className="flex flex-col gap-3">
        {SCORE_CRITERIA.map((criterion, i) => (
          <div key={criterion} className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-medium text-foreground">{criterion}</span>
            <fieldset
              className="flex items-center overflow-hidden rounded-lg border border-border"
              aria-label={criterion}
            >
              {RATINGS.map((value) => (
                <label
                  key={value}
                  className="relative cursor-pointer border-l border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors first:border-l-0 hover:bg-accent has-[:checked]:bg-primary has-[:checked]:text-primary-foreground"
                >
                  <input
                    type="radio"
                    name={`rating-${i}`}
                    value={value}
                    defaultChecked={value === 3}
                    className="sr-only"
                  />
                  {value}
                </label>
              ))}
            </fieldset>
          </div>
        ))}
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-foreground">Recommendation</span>
        <select
          name="recommendation"
          defaultValue="yes"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        >
          {RECOMMENDATIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-foreground">Notes</span>
        <textarea
          name="notes"
          rows={4}
          className="resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
      </label>

      <div>
        <Button type="submit">Save scorecard</Button>
      </div>
    </form>
  );
}
