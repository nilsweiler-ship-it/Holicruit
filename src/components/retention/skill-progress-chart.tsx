"use client";

interface Skill {
  name: string;
  level: number;
}

interface Snapshot {
  date: string;
  skills: Skill[];
}

interface SkillProgressChartProps {
  snapshots: Snapshot[];
  currentSkills: Skill[];
}

export function SkillProgressChart({
  snapshots,
  currentSkills,
}: SkillProgressChartProps) {
  const allPoints = [
    ...snapshots,
    { date: new Date().toISOString(), skills: currentSkills },
  ];

  if (allPoints.length < 2) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Update your profile over time to see your skill growth chart.
          Each profile update records a snapshot.
        </p>
      </div>
    );
  }

  const allSkillNames = Array.from(
    new Set(allPoints.flatMap((p) => p.skills.map((s) => s.name)))
  );

  const width = 600;
  const height = 250;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const colors = [
    "hsl(142 71% 45%)",
    "hsl(221 83% 53%)",
    "hsl(38 92% 50%)",
    "hsl(0 72% 51%)",
    "hsl(280 65% 60%)",
    "hsl(180 60% 45%)",
  ];

  return (
    <div className="space-y-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-[600px]"
      >
        {/* Y-axis labels */}
        {[1, 2, 3, 4, 5].map((level) => {
          const y = padding.top + chartH - (level / 5) * chartH;
          return (
            <g key={level}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + chartW}
                y2={y}
                stroke="currentColor"
                strokeWidth="0.5"
                opacity={0.1}
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                fontSize={10}
                className="fill-muted-foreground"
              >
                {level}
              </text>
            </g>
          );
        })}

        {/* Lines per skill */}
        {allSkillNames.slice(0, 6).map((skillName, si) => {
          const points = allPoints.map((p, pi) => {
            const skill = p.skills.find(
              (s) => s.name.toLowerCase() === skillName.toLowerCase()
            );
            const x = padding.left + (pi / (allPoints.length - 1)) * chartW;
            const y =
              padding.top + chartH - ((skill?.level || 0) / 5) * chartH;
            return `${x},${y}`;
          });

          return (
            <polyline
              key={skillName}
              points={points.join(" ")}
              fill="none"
              stroke={colors[si % colors.length]}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {/* X-axis date labels */}
        {allPoints.map((p, i) => {
          const x = padding.left + (i / (allPoints.length - 1)) * chartW;
          const label = new Date(p.date).toLocaleDateString(undefined, {
            month: "short",
            year: "2-digit",
          });
          return (
            <text
              key={i}
              x={x}
              y={height - 8}
              textAnchor="middle"
              fontSize={9}
              className="fill-muted-foreground"
            >
              {label}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {allSkillNames.slice(0, 6).map((name, i) => (
          <div key={name} className="flex items-center gap-1.5">
            <div
              className="w-3 h-0.5 rounded"
              style={{ backgroundColor: colors[i % colors.length] }}
            />
            <span className="text-muted-foreground">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
