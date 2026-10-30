/**
 * How personality (Big Five + Integrity) levels may be shown to people.
 *
 * Six situational-judgment items can't support a precise trait score, and an
 * employer must never see "Emotional stability 0". So stored levels are kept
 * inside [TRAIT_FLOOR, TRAIT_CEIL] at scoring time, and every display goes
 * through `traitBand` (Low / Moderate / High) with the bar clamped to 5–95.
 * Safe to import from client components (no server dependencies).
 */

/** Scored trait levels are mapped into this range (never 0 or 100). */
export const TRAIT_FLOOR = 10;
export const TRAIT_CEIL = 90;

export type TraitBand = "Low" | "Moderate" | "High";

export function traitBand(level: number): TraitBand {
  if (!Number.isFinite(level)) return "Moderate";
  if (level < 35) return "Low";
  if (level > 65) return "High";
  return "Moderate";
}

/** Bar width for display: clamped to 5–95 so it never reads as an absolute. */
export function traitBarWidth(level: number): number {
  if (!Number.isFinite(level)) return 50;
  return Math.max(5, Math.min(95, Math.round(level)));
}
