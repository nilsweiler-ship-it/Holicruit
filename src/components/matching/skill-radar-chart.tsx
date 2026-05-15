"use client";

interface RadarPoint {
  label: string;
  candidate: number;
  required: number;
}

interface SkillRadarChartProps {
  points: RadarPoint[];
  size?: number;
}

export function SkillRadarChart({ points, size = 300 }: SkillRadarChartProps) {
  if (points.length < 3) return null;

  const cx = size / 2;
  const cy = size / 2;
  const radius = (size / 2) - 40;
  const levels = 5;
  const angleStep = (2 * Math.PI) / points.length;

  function polarToCartesian(angle: number, r: number) {
    // Start from top (-PI/2 offset)
    const a = angle - Math.PI / 2;
    return {
      x: cx + r * Math.cos(a),
      y: cy + r * Math.sin(a),
    };
  }

  function makePolygonPoints(values: number[]): string {
    return values
      .map((val, i) => {
        const r = (val / 5) * radius;
        const { x, y } = polarToCartesian(i * angleStep, r);
        return `${x},${y}`;
      })
      .join(" ");
  }

  const gridLines = Array.from({ length: levels }, (_, i) => {
    const r = ((i + 1) / levels) * radius;
    const pts = points
      .map((_, j) => {
        const { x, y } = polarToCartesian(j * angleStep, r);
        return `${x},${y}`;
      })
      .join(" ");
    return pts;
  });

  const requiredPolygon = makePolygonPoints(points.map((p) => p.required));
  const candidatePolygon = makePolygonPoints(points.map((p) => p.candidate));

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid rings */}
        {gridLines.map((pts, i) => (
          <polygon
            key={`grid-${i}`}
            points={pts}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity={0.15}
          />
        ))}

        {/* Axis lines */}
        {points.map((_, i) => {
          const { x, y } = polarToCartesian(i * angleStep, radius);
          return (
            <line
              key={`axis-${i}`}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="currentColor"
              strokeWidth="0.5"
              opacity={0.15}
            />
          );
        })}

        {/* Required skills polygon */}
        <polygon
          points={requiredPolygon}
          fill="hsl(0 72% 51%)"
          fillOpacity={0.1}
          stroke="hsl(0 72% 51%)"
          strokeWidth="2"
          strokeDasharray="6 3"
        />

        {/* Candidate skills polygon */}
        <polygon
          points={candidatePolygon}
          fill="hsl(142 71% 45%)"
          fillOpacity={0.2}
          stroke="hsl(142 71% 45%)"
          strokeWidth="2"
        />

        {/* Data points for candidate */}
        {points.map((p, i) => {
          const r = (p.candidate / 5) * radius;
          const { x, y } = polarToCartesian(i * angleStep, r);
          return (
            <circle
              key={`dot-${i}`}
              cx={x}
              cy={y}
              r={4}
              fill="hsl(142 71% 45%)"
              stroke="white"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Labels */}
        {points.map((p, i) => {
          const { x, y } = polarToCartesian(i * angleStep, radius + 20);
          const anchor =
            Math.abs(x - cx) < 5
              ? "middle"
              : x < cx
                ? "end"
                : "start";
          return (
            <text
              key={`label-${i}`}
              x={x}
              y={y}
              textAnchor={anchor}
              dominantBaseline="central"
              className="fill-foreground"
              fontSize={11}
              fontWeight={500}
            >
              {p.label.length > 14 ? p.label.slice(0, 12) + "…" : p.label}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-2 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-green-500 rounded" />
          <span className="text-muted-foreground">Your Profile</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 border-t-2 border-dashed border-red-500" />
          <span className="text-muted-foreground">Required</span>
        </div>
      </div>
    </div>
  );
}
