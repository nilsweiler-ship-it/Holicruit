import { cn } from "@/lib/utils";

/**
 * Holicruit logo mark — a "fit gauge": a coral arc over a muted track with a
 * coral core. It nods to the fit model (a fit %) and to the holistic whole.
 * Uses Tailwind stroke/fill classes so it inherits the brand tokens.
 */
const R = 9;
const C = 2 * Math.PI * R;
const FILL = 0.72;

export function LogoMark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <circle cx="12" cy="12" r={R} fill="none" strokeWidth="3" className="stroke-muted" />
      <circle
        cx="12"
        cy="12"
        r={R}
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${(FILL * C).toFixed(2)} ${C.toFixed(2)}`}
        transform="rotate(-90 12 12)"
        className="stroke-primary"
      />
      <circle cx="12" cy="12" r="3.2" className="fill-primary" />
    </svg>
  );
}
