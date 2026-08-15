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
