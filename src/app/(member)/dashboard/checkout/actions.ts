"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { requireMember } from "@/lib/authz";
import { createOrderFromCart, OrderValidationError, type CartLineInput } from "@/lib/orders";
import { checkRateLimit } from "@/lib/rate-limit";

const checkoutSchema = z.object({
  fullName: z.string().min(2).max(120),
  phone: z.string().min(7).max(20),
  email: z.string().email(),
  line1: z.string().min(3).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
});

export async function submitCheckout(
  items: CartLineInput[],
  formData: FormData
): Promise<{ ok: true; paymentLink: string | null; orderNumber: string; paymentError: string | null } | { ok: false; error: string }> {
  const user = await requireMember();

  const limited = checkRateLimit(`checkout:${user.id}`, 10, 15 * 60 * 1000);
  if (!limited.ok) return { ok: false, error: limited.error };

  const parsed = checkoutSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    line1: formData.get("line1"),
    line2: formData.get("line2") || undefined,
    city: formData.get("city"),
    state: formData.get("state"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Please fill in all required delivery details." };
  }

  const hdrs = await headers();
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const host = hdrs.get("host");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `${proto}://${host}`;

  try {
    const { order, paymentLink, paymentError } = await createOrderFromCart({
      userId: user.id,
      customerEmail: parsed.data.email,
      customerPhone: parsed.data.phone,
      customerName: parsed.data.fullName,
      address: parsed.data,
      items,
      appUrl,
    });

    return { ok: true, paymentLink, orderNumber: order.orderNumber, paymentError };
  } catch (err) {
    if (err instanceof OrderValidationError) {
      return { ok: false, error: err.message };
    }
    throw err;
  }
}
