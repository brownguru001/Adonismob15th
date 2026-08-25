"use server";

import { revalidatePath } from "next/cache";
import { requireMember } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

/**
 * Customer self-reports that they've sent the bank transfer. This does NOT
 * mark the order paid — it only flips the payment to AWAITING_VERIFICATION
 * so admin knows to check for it and confirm (or reject) from their side.
 * Ownership is checked explicitly since orderId comes straight from the
 * client.
 */
export async function markBankTransferPaid(
  orderId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireMember();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payments: true },
  });

  if (!order || order.userId !== user.id) {
    return { ok: false, error: "Order not found." };
  }

  const payment = order.payments.find((p) => p.provider === "BANK_TRANSFER");
  if (!payment || payment.status !== "PENDING") {
    return { ok: false, error: "This order isn't awaiting a bank transfer confirmation." };
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: "AWAITING_VERIFICATION" },
    }),
    prisma.orderStatusEvent.create({
      data: {
        orderId: order.id,
        status: order.status,
        note: "Customer reported the bank transfer was sent — awaiting admin confirmation.",
      },
    }),
  ]);

  revalidatePath(`/dashboard/orders/${order.orderNumber}`);
  return { ok: true };
}
