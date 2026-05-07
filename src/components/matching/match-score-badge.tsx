import { Badge } from "@/components/ui/badge";

function getScoreColor(score: number): string {
  if (score >= 80) return "bg-green-100 text-green-800";
  if (score >= 60) return "bg-yellow-100 text-yellow-800";
  if (score >= 40) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
}

export function MatchScoreBadge({ score }: { score: number }) {
  return (
    <Badge className={`${getScoreColor(score)} font-bold`} variant="secondary">
      {score}%
    </Badge>
  );
}
