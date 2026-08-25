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

export async function confirmBankTransfer(orderId: string) {
  const admin = await requireAdmin();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payments: true, items: true },
  });
  if (!order) return { ok: false, error: "Order not found." };

  const payment = order.payments.find((p) => p.provider === "BANK_TRANSFER");
  if (!payment || payment.status !== "AWAITING_VERIFICATION") {
    return { ok: false, error: "This order has no bank transfer awaiting confirmation." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "SUCCESSFUL", verifiedAt: new Date() },
    });
    await tx.order.update({ where: { id: order.id }, data: { status: "PAID" } });
    await tx.orderStatusEvent.create({
      data: { orderId: order.id, status: "PAID", note: "Bank transfer confirmed by admin." },
    });
    await tx.productionOrder.upsert({
      where: { orderId: order.id },
      create: { orderId: order.id, stage: "QUEUED" },
      update: {},
    });
  });

  await logAdminAction({
    actorId: admin.id,
    action: "order.bank_transfer_confirmed",
    targetType: "Order",
    targetId: orderId,
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { ok: true };
}

export async function rejectBankTransfer(orderId: string) {
  const admin = await requireAdmin();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payments: true, items: true },
  });
  if (!order) return { ok: false, error: "Order not found." };

  const payment = order.payments.find((p) => p.provider === "BANK_TRANSFER");
  if (!payment || payment.status !== "AWAITING_VERIFICATION") {
    return { ok: false, error: "This order has no bank transfer awaiting confirmation." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    await tx.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
    await tx.orderStatusEvent.create({
      data: {
        orderId: order.id,
        status: "CANCELLED",
        note: "Bank transfer could not be confirmed by admin — order cancelled.",
      },
    });
    for (const item of order.items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { increment: item.quantity } },
      });
    }
  });

  await logAdminAction({
    actorId: admin.id,
    action: "order.bank_transfer_rejected",
    targetType: "Order",
    targetId: orderId,
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
