import { Badge } from "@/components/ui/badge";

const stageColors: Record<string, string> = {
  APPLIED: "bg-blue-100 text-blue-800",
  SCREENING: "bg-yellow-100 text-yellow-800",
  SHORTLISTED: "bg-green-100 text-green-800",
  INTERVIEW: "bg-purple-100 text-purple-800",
  OFFER: "bg-orange-100 text-orange-800",
  HIRED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
};

export function StageBadge({ stage }: { stage: string }) {
  return (
    <Badge className={stageColors[stage] || ""} variant="secondary">
      {stage}
    </Badge>
  );
}
