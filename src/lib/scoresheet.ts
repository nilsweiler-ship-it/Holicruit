/** Structured interview scorecard definitions (shared by the form + the action). */

export const SCORE_CRITERIA = [
  "Technical / role skills",
  "Communication",
  "Ownership & drive",
  "Culture & values",
] as const;

export const RECOMMENDATIONS = [
  { value: "strong_yes", label: "Strong yes", tone: "success" as const },
  { value: "yes", label: "Yes", tone: "neutral" as const },
  { value: "no", label: "No", tone: "muted" as const },
  { value: "strong_no", label: "Strong no", tone: "muted" as const },
];

export function recommendationLabel(value: string): string {
  return RECOMMENDATIONS.find((r) => r.value === value)?.label ?? value;
}

export interface CriterionScore {
  criterion: string;
  score: number;
}
