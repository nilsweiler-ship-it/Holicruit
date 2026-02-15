"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SkillGapItem {
  id: string;
  skill: string;
  category: string;
  currentLevel: number;
  requiredLevel: number;
  status: string;
  recommendations: string;
}

interface GapReportViewProps {
  gaps: SkillGapItem[];
}

function getStatusBadge(status: string) {
  switch (status) {
    case "MET":
      return (
        <Badge className="bg-green-100 text-green-800" variant="secondary">
          Met
        </Badge>
      );
    case "PARTIAL":
      return (
        <Badge className="bg-yellow-100 text-yellow-800" variant="secondary">
          Partial
        </Badge>
      );
    case "MISSING":
      return (
        <Badge className="bg-red-100 text-red-800" variant="secondary">
          Missing
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export function GapReportView({ gaps }: GapReportViewProps) {
  if (gaps.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No skill gap data available.</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Skill</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-center">Current</TableHead>
          <TableHead className="text-center">Required</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Recommendations</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {gaps.map((gap) => {
          const recs: string[] = JSON.parse(gap.recommendations || "[]");
          return (
            <TableRow key={gap.id}>
              <TableCell className="font-medium">{gap.skill}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {gap.category}
                </Badge>
              </TableCell>
              <TableCell className="text-center">{gap.currentLevel}/5</TableCell>
              <TableCell className="text-center">
                {gap.requiredLevel}/5
              </TableCell>
              <TableCell>{getStatusBadge(gap.status)}</TableCell>
              <TableCell>
                {recs.length > 0 ? (
                  <ul className="text-xs text-muted-foreground list-disc list-inside">
                    {recs.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
