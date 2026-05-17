"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Extension {
  extendedTo: string;
  reason: string;
  timestamp: string;
}

interface ContractItem {
  id: string;
  roleTitle: string;
  candidateId: string;
  status: string;
  startDate: string;
  endDate: string;
  rateAmount: number;
  rateType: string;
  extensions: Extension[];
}

interface ContractListProps {
  contracts: ContractItem[];
}

function statusColor(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800";
    case "EXTENDED":
      return "bg-blue-100 text-blue-800";
    case "COMPLETED":
      return "bg-gray-100 text-gray-800";
    case "TERMINATED":
      return "bg-red-100 text-red-800";
    default:
      return "";
  }
}

function daysRemaining(endDate: string) {
  return Math.ceil(
    (new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

export function ContractList({ contracts }: ContractListProps) {
  const [extending, setExtending] = useState<string | null>(null);
  const [extendTo, setExtendTo] = useState("");
  const [extendReason, setExtendReason] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleExtend(contractId: string) {
    if (!extendTo) return;
    setSaving(true);
    try {
      const res = await fetch("/api/contracts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: contractId,
          extendTo,
          extensionReason: extendReason,
        }),
      });
      if (!res.ok) {
        toast.error("Failed to extend contract");
        return;
      }
      toast.success("Contract extended");
      setExtending(null);
      setExtendTo("");
      setExtendReason("");
    } catch {
      toast.error("Failed to extend");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(contractId: string, status: string) {
    setSaving(true);
    try {
      const res = await fetch("/api/contracts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: contractId, status }),
      });
      if (!res.ok) {
        toast.error("Failed to update");
        return;
      }
      toast.success(`Contract marked as ${status.toLowerCase()}`);
    } catch {
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  }

  if (contracts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground">
          No contracts yet. Contracts are created when you hire a candidate for
          a temporary or interim role.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {contracts.map((c) => {
        const days = daysRemaining(c.endDate);
        const isExpiring = days <= 14 && days > 0;
        const isExpired = days <= 0;

        return (
          <div key={c.id} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{c.roleTitle}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(c.startDate).toLocaleDateString()} &mdash;{" "}
                  {new Date(c.endDate).toLocaleDateString()}
                  {" "}({c.rateType === "HOURLY" ? `$${(c.rateAmount / 100).toFixed(0)}/hr` : `$${(c.rateAmount / 100).toFixed(0)}/day`})
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isExpiring && (
                  <Badge className="bg-amber-100 text-amber-800 text-xs">
                    {days} days left
                  </Badge>
                )}
                {isExpired && c.status === "ACTIVE" && (
                  <Badge className="bg-red-100 text-red-800 text-xs">
                    Expired
                  </Badge>
                )}
                <Badge variant="secondary" className={statusColor(c.status)}>
                  {c.status}
                </Badge>
              </div>
            </div>

            {c.extensions.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Extended {c.extensions.length} time{c.extensions.length > 1 ? "s" : ""}
                {c.extensions.length > 0 && (
                  <span>
                    {" "}&mdash; last to {new Date(c.extensions[c.extensions.length - 1].extendedTo).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}

            {(c.status === "ACTIVE" || c.status === "EXTENDED") && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setExtending(extending === c.id ? null : c.id)
                  }
                >
                  Extend
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange(c.id, "COMPLETED")}
                  disabled={saving}
                >
                  Mark Complete
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => handleStatusChange(c.id, "TERMINATED")}
                  disabled={saving}
                >
                  Terminate
                </Button>
              </div>
            )}

            {extending === c.id && (
              <div className="rounded-md border bg-muted/30 p-3 space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs">Extend To</Label>
                  <Input
                    type="date"
                    value={extendTo}
                    onChange={(e) => setExtendTo(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Reason (optional)</Label>
                  <Textarea
                    value={extendReason}
                    onChange={(e) => setExtendReason(e.target.value)}
                    rows={2}
                    placeholder="e.g. Project extended, client requested..."
                    className="text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleExtend(c.id)}
                    disabled={saving || !extendTo}
                  >
                    {saving ? "Saving..." : "Confirm Extension"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setExtending(null);
                      setExtendTo("");
                      setExtendReason("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
