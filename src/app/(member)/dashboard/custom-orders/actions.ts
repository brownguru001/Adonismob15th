"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireMember } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateTxRef } from "@/lib/utils";

const customOrderSchema = z.object({
  productType: z.string().min(1).max(80),
  quantity: z.coerce.number().int().min(1).max(500),
  sizes: z.string().min(1).max(200),
  designNotes: z.string().min(1).max(3000),
  colorPreference: z.string().max(200).optional(),
  referenceImages: z.array(z.string().url()).max(6).optional(),
});

export async function submitCustomOrder(formData: FormData) {
  const user = await requireMember();

  const limited = checkRateLimit(`custom-order:${user.id}`, 10, 60 * 60 * 1000);
  if (!limited.ok) return { ok: false, error: limited.error };

  const referenceImages = formData.getAll("referenceImages").filter(Boolean) as string[];

  const parsed = customOrderSchema.safeParse({
    productType: formData.get("productType"),
    quantity: formData.get("quantity"),
    sizes: formData.get("sizes"),
    designNotes: formData.get("designNotes"),
    colorPreference: formData.get("colorPreference") || undefined,
    referenceImages,
  });

  if (!parsed.success) {
    return { ok: false, error: "Please check your custom order details." };
  }

  const customOrder = await prisma.customOrder.create({
    data: {
      userId: user.id,
      productType: parsed.data.productType,
      quantity: parsed.data.quantity,
      sizes: parsed.data.sizes,
      designNotes: parsed.data.designNotes,
      colorPreference: parsed.data.colorPreference,
      referenceImages: parsed.data.referenceImages ?? [],
      status: "SUBMITTED",
      statusEvents: { create: { status: "SUBMITTED", note: "Request submitted by customer." } },
    },
  });

  return { ok: true, id: customOrder.id };
}

/**
 * Customer accepts a quote. Only bank transfer is offered here — a custom
 * order's price is set by an admin, not computed from a cart, so there's no
 * pre-known amount to hand Flutterwave until this moment; bank transfer
 * needs no provider round-trip and mirrors the regular-order flow exactly.
 */
export async function approveCustomOrderQuote(
  customOrderId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireMember();

  const customOrder = await prisma.customOrder.findUnique({
    where: { id: customOrderId },
    include: { payments: true },
  });

  if (!customOrder || customOrder.userId !== user.id) {
    return { ok: false, error: "Custom order not found." };
  }
  if (customOrder.status !== "QUOTE_SENT" || !customOrder.quotedPrice) {
    return { ok: false, error: "This request doesn't have a quote awaiting approval." };
  }
  if (customOrder.payments.some((p) => p.status !== "FAILED")) {
    return { ok: false, error: "A payment for this request already exists." };
  }

  await prisma.$transaction([
    prisma.customOrder.update({ where: { id: customOrder.id }, data: { status: "PAYMENT" } }),
    prisma.customOrderStatusEvent.create({
      data: { customOrderId: customOrder.id, status: "CUSTOMER_APPROVED", note: "Quote approved by customer." },
    }),
    prisma.customOrderStatusEvent.create({
      data: { customOrderId: customOrder.id, status: "PAYMENT", note: "Awaiting bank transfer." },
    }),
    prisma.payment.create({
      data: {
        customOrderId: customOrder.id,
        txRef: generateTxRef(),
        amount: customOrder.quotedPrice,
        status: "PENDING",
        provider: "BANK_TRANSFER",
      },
    }),
  ]);

  revalidatePath(`/dashboard/custom-orders/${customOrder.id}`);
  return { ok: true };
}

/**
 * Mirrors markBankTransferPaid for regular orders: only flips the payment to
 * AWAITING_VERIFICATION so admin knows to check for it and confirm.
 */
export async function markCustomOrderBankTransferPaid(
  customOrderId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireMember();

  const customOrder = await prisma.customOrder.findUnique({
    where: { id: customOrderId },
    include: { payments: true },
  });

  if (!customOrder || customOrder.userId !== user.id) {
    return { ok: false, error: "Custom order not found." };
  }

  const payment = customOrder.payments.find((p) => p.provider === "BANK_TRANSFER");
  if (!payment || payment.status !== "PENDING") {
    return { ok: false, error: "This request isn't awaiting a bank transfer confirmation." };
  }

  await prisma.$transaction([
    prisma.payment.update({ where: { id: payment.id }, data: { status: "AWAITING_VERIFICATION" } }),
    prisma.customOrderStatusEvent.create({
      data: {
        customOrderId: customOrder.id,
        status: "PAYMENT",
        note: "Customer reported the bank transfer was sent — awaiting admin confirmation.",
      },
    }),
  ]);

  revalidatePath(`/dashboard/custom-orders/${customOrder.id}`);
  return { ok: true };
}
