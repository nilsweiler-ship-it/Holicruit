import { cn } from "@/lib/utils";

export interface RadarAxis {
  label: string;
  /** 0–100 */
  value: number;
}

/**
 * A lightweight SVG radar for the match-detail fit breakdown. Pure geometry —
 * no chart dependency. Plots one polygon (the candidate) over concentric grid
 * rings. Needs at least 3 axes.
 */
export function FitRadar({
  axes,
  size = 220,
  className,
}: {
  axes: RadarAxis[];
  size?: number;
  className?: string;
}) {
  const n = axes.length;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 34; // padding for labels
  const rings = [0.25, 0.5, 0.75, 1];

  // Angle for axis i, starting at the top and going clockwise.
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const point = (i: number, r: number) => ({
    x: cx + Math.cos(angle(i)) * radius * r,
    y: cy + Math.sin(angle(i)) * radius * r,
  });

  const valuePath =
    axes
      .map((a, i) => {
        const p = point(i, Math.max(0, Math.min(100, a.value)) / 100);
        return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      })
      .join(" ") + " Z";

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={cn("h-auto w-full max-w-[260px]", className)}
      role="img"
      aria-label={`Fit breakdown radar: ${axes.map((a) => `${a.label} ${a.value}`).join(", ")}`}
    >
      {/* grid rings */}
      {rings.map((r) => (
        <polygon
          key={r}
          points={axes
            .map((_, i) => {
              const p = point(i, r);
              return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
            })
            .join(" ")}
          className="fill-none stroke-border"
          strokeWidth={1}
        />
      ))}

      {/* spokes */}
      {axes.map((_, i) => {
        const p = point(i, 1);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            className="stroke-border"
            strokeWidth={1}
          />
        );
      })}

      {/* value polygon */}
      <polygon
        points={axes
          .map((a, i) => {
            const p = point(i, Math.max(0, Math.min(100, a.value)) / 100);
            return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
          })
          .join(" ")}
        className="fill-primary/15 stroke-primary"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path d={valuePath} className="fill-none" />

      {/* vertices */}
      {axes.map((a, i) => {
        const p = point(i, Math.max(0, Math.min(100, a.value)) / 100);
        return <circle key={i} cx={p.x} cy={p.y} r={2.5} className="fill-primary" />;
      })}

      {/* labels */}
      {axes.map((a, i) => {
        const p = point(i, 1.18);
        const anchor = Math.abs(p.x - cx) < 8 ? "middle" : p.x > cx ? "start" : "end";
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor={anchor}
            dominantBaseline="middle"
            className="fill-muted-foreground text-[9px] font-medium"
          >
            {a.label}
          </text>
        );
      })}
    </svg>
  );
}
