import "server-only";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber, generateTxRef } from "@/lib/utils";
import { initiatePayment } from "@/lib/flutterwave";

const SHIPPING_FEE = 2500;

export type CartLineInput = { variantId: string; quantity: number };

export class OrderValidationError extends Error {}

/**
 * Recomputes every line item's price from the database — the cart the
 * client sent only supplies variantId + quantity. Client-supplied prices
 * are never read here, so a tampered request can change what's requested
 * but never what's charged.
 */
export async function createOrderFromCart(params: {
  userId: string;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  address: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
  };
  items: CartLineInput[];
  appUrl: string;
}) {
  if (params.items.length === 0) {
    throw new OrderValidationError("Cart is empty.");
  }

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: params.items.map((i) => i.variantId) } },
    include: { product: true },
  });

  const variantMap = new Map(variants.map((v) => [v.id, v]));

  let subtotal = 0;
  const lineItems: {
    productId: string;
    variantId: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[] = [];

  for (const item of params.items) {
    const variant = variantMap.get(item.variantId);
    if (!variant || !variant.product.isActive) {
      throw new OrderValidationError("One of the items in your cart is no longer available.");
    }
    if (item.quantity < 1 || item.quantity > 20) {
      throw new OrderValidationError("Invalid quantity.");
    }
    if (variant.stock < item.quantity) {
      throw new OrderValidationError(`Not enough stock for ${variant.product.name} (${variant.size}/${variant.color}).`);
    }
    if (
      variant.product.dropQuantityRemaining !== null &&
      variant.product.dropQuantityRemaining < item.quantity
    ) {
      throw new OrderValidationError(`${variant.product.name} — this drop doesn't have enough units left.`);
    }

    const unitPrice = Number(variant.product.price) + Number(variant.priceDelta);
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

    lineItems.push({
      productId: variant.productId,
      variantId: variant.id,
      quantity: item.quantity,
      unitPrice,
      lineTotal,
    });
  }

  const total = subtotal + SHIPPING_FEE;

  const order = await prisma.$transaction(async (tx) => {
    const address = await tx.address.create({
      data: {
        userId: params.userId,
        fullName: params.address.fullName,
        phone: params.address.phone,
        line1: params.address.line1,
        line2: params.address.line2,
        city: params.address.city,
        state: params.address.state,
      },
    });

    const createdOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: params.userId,
        addressId: address.id,
        status: "PENDING_PAYMENT",
        subtotal,
        shippingFee: SHIPPING_FEE,
        total,
        customerEmail: params.customerEmail,
        customerPhone: params.customerPhone,
        items: { create: lineItems },
        statusEvents: { create: { status: "PENDING_PAYMENT", note: "Order created, awaiting payment." } },
      },
    });

    for (const item of lineItems) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
      const variant = variantMap.get(item.variantId)!;
      if (variant.product.dropQuantityRemaining !== null) {
        await tx.product.update({
          where: { id: item.productId },
          data: { dropQuantityRemaining: { decrement: item.quantity } },
        });
      }
    }

    return createdOrder;
  });

  const txRef = generateTxRef();
  await prisma.payment.create({
    data: {
      orderId: order.id,
      txRef,
      amount: total,
      status: "PENDING",
    },
  });

  let paymentLink: string | null = null;
  let paymentError: string | null = null;
  try {
    const initResult = await initiatePayment({
      txRef,
      amount: total,
      customerEmail: params.customerEmail,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      redirectUrl: `${params.appUrl}/api/payments/callback`,
      title: `ADONISMOB15TH order ${order.orderNumber}`,
    });
    paymentLink = initResult.data?.link ?? null;
  } catch (err) {
    paymentError =
      err instanceof Error
        ? err.message
        : "Payment provider is not configured in this environment.";
  }

  return { order, paymentLink, paymentError };
}
