import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RoleCardProps {
  role: {
    id: string;
    title: string;
    description: string;
    status: string;
    threshold: number;
    company?: { name: string } | null;
    applications?: { id: string }[];
    createdAt: string;
  };
  href: string;
}

export function RoleCard({ role, href }: RoleCardProps) {
  return (
    <Link href={href}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{role.title}</CardTitle>
            <Badge
              variant={
                role.status === "PUBLISHED"
                  ? "default"
                  : role.status === "CLOSED"
                    ? "destructive"
                    : "secondary"
              }
            >
              {role.status}
            </Badge>
          </div>
          {role.company && (
            <CardDescription>{role.company.name}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {role.description}
          </p>
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              {role.applications?.length || 0} applicant
              {(role.applications?.length || 0) !== 1 ? "s" : ""}
            </span>
            <span>Threshold: {role.threshold}%</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
