/**
 * Terms fit — pay + working-location compatibility, as a third fit dimension.
 *
 * Philosophy mirrors the rest of Holicruit: transparent about *compatibility*,
 * confidential about the raw figures. Both sides learn whether pay and location
 * work before investing time, but neither sees the other's number until both
 * explicitly choose to share it for that match.
 */

export type SalaryBand = "in" | "stretch" | "gap" | "unknown";
export type LocationFit = "match" | "flexible" | "mismatch" | "unknown";
export type WorkMode = "onsite" | "hybrid" | "remote";

export type TermsCompat = {
  salary: SalaryBand;
  location: LocationFit;
  /** Short human summary, e.g. "In range · Remote". */
  label: string;
  /** Signal only — a good skills match is never hidden on this. */
  compatible: boolean;
};

/** The full view attached to a match: compatibility always, figures only when shared. */
export type TermsView = TermsCompat & {
  revealed: boolean;
  /** Whether the viewing side / the other side has opted to share exact figures. */
  youShared: boolean;
  theyShared: boolean;
  roleMode?: string;
  candidateModes?: string[];
  roleRegion?: string;
  candidateRegion?: string;
  /** Present only when both sides have shared. */
  candidateRange?: { min?: number; max?: number; currency: string };
  roleBand?: { min?: number; max?: number; currency: string };
};

const SALARY_LABEL: Record<SalaryBand, string> = {
  in: "In range",
  stretch: "Slight stretch",
  gap: "Below target",
  unknown: "Pay TBD",
};
const LOCATION_LABEL: Record<LocationFit, string> = {
  match: "Location ✓",
  flexible: "Location flexible",
  mismatch: "Location gap",
  unknown: "Location TBD",
};

export function salaryBand(
  expMin?: number | null,
  roleMax?: number | null,
): SalaryBand {
  if (expMin == null || roleMax == null) return "unknown";
  if (roleMax >= expMin) return "in";
  if (roleMax >= expMin * 0.9) return "stretch";
  return "gap";
}

export function locationFit(candidateModes: string[], roleMode?: string | null): LocationFit {
  if (!roleMode || candidateModes.length === 0) return "unknown";
  if (candidateModes.includes(roleMode)) return "match";
  // Remote roles suit anyone; near-modes (onsite↔hybrid) are flexible.
  if (roleMode === "remote") return "match";
  if (roleMode === "hybrid" && candidateModes.includes("onsite")) return "flexible";
  if (roleMode === "onsite" && candidateModes.includes("hybrid")) return "flexible";
  return "mismatch";
}

export function computeTermsFit(input: {
  expMin?: number | null;
  roleMax?: number | null;
  candidateModes: string[];
  roleMode?: string | null;
}): TermsCompat {
  const salary = salaryBand(input.expMin, input.roleMax);
  const location = locationFit(input.candidateModes, input.roleMode);
  const parts: string[] = [];
  if (salary !== "unknown") parts.push(SALARY_LABEL[salary]);
  if (location !== "unknown") parts.push(LOCATION_LABEL[location]);
  const label = parts.length ? parts.join(" · ") : "Set your preferences to see terms fit";
  const compatible = salary !== "gap" && location !== "mismatch";
  return { salary, location, label, compatible };
}

/** Safe parse of the candidate's workModes JSON array. */
export function parseModes(json: string | null | undefined): WorkMode[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json) as string[];
    return arr.filter((m): m is WorkMode => m === "onsite" || m === "hybrid" || m === "remote");
  } catch {
    return [];
  }
}
