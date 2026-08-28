import "server-only";
import { prisma } from "@/lib/prisma";
import { verifyTransaction } from "@/lib/flutterwave";

/**
 * The single choke point where a payment is allowed to mark an order PAID.
 * Called from both the redirect callback and the webhook — either entry
 * point re-verifies against Flutterwave's API directly rather than trusting
 * whatever query params or webhook body arrived, and both are idempotent so
 * a duplicate callback/webhook for the same transaction is a no-op.
 */
export async function confirmFlutterwaveTransaction(transactionId: string) {
  const verification = await verifyTransaction(transactionId);
  const data = verification.data;

  if (verification.status !== "success" || !data) {
    return { ok: false as const, reason: "Verification with payment provider failed." };
  }

  const payment = await prisma.payment.findUnique({
    where: { txRef: data.tx_ref },
    include: { order: { include: { items: true } } },
  });

  if (!payment || !payment.orderId || !payment.order) {
    return { ok: false as const, reason: "No matching order found for this transaction." };
  }
  const orderId = payment.orderId;
  const order = payment.order;

  // Idempotency: already processed, nothing to do.
  if (payment.status === "SUCCESSFUL") {
    return { ok: true as const, order, alreadyProcessed: true };
  }

  const amountMatches = Math.abs(data.amount - Number(payment.amount)) < 1;
  const currencyMatches = data.currency === "NGN";

  if (data.status !== "successful" || !amountMatches || !currencyMatches) {
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          providerRef: String(data.id),
          rawResponse: verification as unknown as object,
        },
      });
      await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });
      await tx.orderStatusEvent.create({
        data: {
          orderId,
          status: "CANCELLED",
          note: "Payment verification failed or amount/currency mismatch.",
        },
      });
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
    });
    return { ok: false as const, reason: "Payment could not be verified." };
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESSFUL",
        providerRef: String(data.id),
        verifiedAt: new Date(),
        rawResponse: verification as unknown as object,
      },
    });
    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
    });
    await tx.orderStatusEvent.create({
      data: { orderId, status: "PAID", note: "Payment verified via Flutterwave." },
    });
    await tx.productionOrder.create({
      data: { orderId, stage: "QUEUED" },
    });
    return updated;
  });

  return { ok: true as const, order: updatedOrder, alreadyProcessed: false };
}
