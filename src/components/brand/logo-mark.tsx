import { cn } from "@/lib/utils";

/**
 * Holicruit logo mark — the "whole person": a *complete* ring of four rounded
 * facets (hard skills, soft skills, evidence, growth) around a coral core.
 * Keeps the fit-gauge DNA but closes the loop — holistic, nothing missing.
 * Uses Tailwind stroke/fill classes so it inherits the brand tokens.
 */
const R = 9;
const C = 2 * Math.PI * R;
const SEGMENTS = 4;
const GAP = 5; // visual gap between facets (dash units)
const SEG = C / SEGMENTS - GAP;

export function LogoMark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r={R}
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${SEG.toFixed(2)} ${GAP.toFixed(2)}`}
        transform="rotate(-90 12 12)"
        className="stroke-primary"
      />
      <circle cx="12" cy="12" r="3.2" className="fill-primary" />
    </svg>
  );
}
