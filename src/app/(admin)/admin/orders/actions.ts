"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit";

const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "PRODUCTION",
  "READY",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

export async function updateOrderStatus(orderId: string, status: (typeof ORDER_STATUSES)[number], note?: string) {
  const admin = await requireAdmin();
  if (!ORDER_STATUSES.includes(status)) return { ok: false, error: "Invalid status" };

  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status } }),
    prisma.orderStatusEvent.create({
      data: { orderId, status, note: note || `Status updated to ${status} by admin.` },
    }),
  ]);

  await logAdminAction({
    actorId: admin.id,
    action: "order.status_change",
    targetType: "Order",
    targetId: orderId,
    metadata: { status },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { ok: true };
}

const PRODUCTION_STAGES = [
  "QUEUED",
  "ASSIGNED",
  "PRINTING",
  "QUALITY_CHECK",
  "PACKED",
  "READY_FOR_DELIVERY",
  "SHIPPED",
  "DELIVERED",
] as const;

const assignSchema = z.object({
  supplierId: z.string().optional(),
  stage: z.enum(PRODUCTION_STAGES),
  notes: z.string().max(2000).optional(),
});

export async function updateProductionOrder(orderId: string, formData: FormData) {
  const admin = await requireAdmin();
  const parsed = assignSchema.safeParse({
    supplierId: formData.get("supplierId") || undefined,
    stage: formData.get("stage"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { ok: false, error: "Invalid production update." };

  await prisma.productionOrder.upsert({
    where: { orderId },
    create: {
      orderId,
      supplierId: parsed.data.supplierId || null,
      stage: parsed.data.stage,
      notes: parsed.data.notes,
    },
    update: {
      supplierId: parsed.data.supplierId || null,
      stage: parsed.data.stage,
      notes: parsed.data.notes,
    },
  });

  await logAdminAction({
    actorId: admin.id,
    action: "production.update",
    targetType: "Order",
    targetId: orderId,
    metadata: { stage: parsed.data.stage, supplierId: parsed.data.supplierId },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/production");
  return { ok: true };
}
