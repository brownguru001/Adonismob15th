import "server-only";
import { prisma } from "@/lib/prisma";

export async function logAdminAction(params: {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.adminAction.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      metadata: params.metadata as object | undefined,
    },
  });
}
