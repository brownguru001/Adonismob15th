"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit";

const CUSTOM_ORDER_STATUSES = [
  "SUBMITTED", "REVIEWING", "QUOTE_SENT", "CUSTOMER_APPROVED",
  "PAYMENT", "PRODUCTION", "READY", "FULFILLED", "DECLINED",
] as const;

const updateSchema = z.object({
  status: z.enum(CUSTOM_ORDER_STATUSES),
  quotedPrice: z.coerce.number().positive().optional(),
  adminNotes: z.string().max(2000).optional(),
});

export async function updateCustomOrder(customOrderId: string, formData: FormData) {
  const admin = await requireAdmin();
  const parsed = updateSchema.safeParse({
    status: formData.get("status"),
    quotedPrice: formData.get("quotedPrice") || undefined,
    adminNotes: formData.get("adminNotes") || undefined,
  });
  if (!parsed.success) return { ok: false, error: "Invalid update." };

  await prisma.$transaction([
    prisma.customOrder.update({
      where: { id: customOrderId },
      data: {
        status: parsed.data.status,
        quotedPrice: parsed.data.quotedPrice,
        adminNotes: parsed.data.adminNotes,
      },
    }),
    prisma.customOrderStatusEvent.create({
      data: {
        customOrderId,
        status: parsed.data.status,
        note: parsed.data.quotedPrice ? `Quoted at ${parsed.data.quotedPrice}` : undefined,
      },
    }),
  ]);

  await logAdminAction({
    actorId: admin.id,
    action: "custom_order.update",
    targetType: "CustomOrder",
    targetId: customOrderId,
    metadata: { status: parsed.data.status },
  });

  revalidatePath(`/admin/custom-orders/${customOrderId}`);
  revalidatePath("/admin/custom-orders");
  return { ok: true };
}

export async function confirmCustomOrderBankTransfer(customOrderId: string) {
  const admin = await requireAdmin();

  const customOrder = await prisma.customOrder.findUnique({
    where: { id: customOrderId },
    include: { payments: true },
  });
  if (!customOrder) return { ok: false, error: "Custom order not found." };

  const payment = customOrder.payments.find((p) => p.provider === "BANK_TRANSFER");
  if (!payment || payment.status !== "AWAITING_VERIFICATION") {
    return { ok: false, error: "This request has no bank transfer awaiting confirmation." };
  }

  await prisma.$transaction([
    prisma.payment.update({ where: { id: payment.id }, data: { status: "SUCCESSFUL", verifiedAt: new Date() } }),
    prisma.customOrder.update({ where: { id: customOrder.id }, data: { status: "PRODUCTION" } }),
    prisma.customOrderStatusEvent.create({
      data: { customOrderId: customOrder.id, status: "PRODUCTION", note: "Bank transfer confirmed by admin." },
    }),
  ]);

  await logAdminAction({
    actorId: admin.id,
    action: "custom_order.bank_transfer_confirmed",
    targetType: "CustomOrder",
    targetId: customOrderId,
  });

  revalidatePath(`/admin/custom-orders/${customOrderId}`);
  revalidatePath("/admin/custom-orders");
  return { ok: true };
}

export async function rejectCustomOrderBankTransfer(customOrderId: string) {
  const admin = await requireAdmin();

  const customOrder = await prisma.customOrder.findUnique({
    where: { id: customOrderId },
    include: { payments: true },
  });
  if (!customOrder) return { ok: false, error: "Custom order not found." };

  const payment = customOrder.payments.find((p) => p.provider === "BANK_TRANSFER");
  if (!payment || payment.status !== "AWAITING_VERIFICATION") {
    return { ok: false, error: "This request has no bank transfer awaiting confirmation." };
  }

  await prisma.$transaction([
    prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } }),
    prisma.customOrder.update({ where: { id: customOrder.id }, data: { status: "QUOTE_SENT" } }),
    prisma.customOrderStatusEvent.create({
      data: {
        customOrderId: customOrder.id,
        status: "QUOTE_SENT",
        note: "Bank transfer could not be confirmed by admin — back to quote sent.",
      },
    }),
  ]);

  await logAdminAction({
    actorId: admin.id,
    action: "custom_order.bank_transfer_rejected",
    targetType: "CustomOrder",
    targetId: customOrderId,
  });

  revalidatePath(`/admin/custom-orders/${customOrderId}`);
  revalidatePath("/admin/custom-orders");
  return { ok: true };
}
