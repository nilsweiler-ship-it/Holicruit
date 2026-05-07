import { prisma } from "@/lib/db";

export async function logDataAccess(params: {
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  // Fire-and-forget — don't block the response
  prisma.dataAccessLog
    .create({
      data: {
        userId: params.userId,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        metadata: JSON.stringify(params.metadata ?? {}),
      },
    })
    .catch((err) => {
      console.error("Audit log error:", err);
    });
}
