"use server";

import { z } from "zod";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

const customOrderSchema = z.object({
  productType: z.string().min(1).max(80),
  quantity: z.coerce.number().int().min(1).max(500),
  sizes: z.string().min(1).max(200),
  designNotes: z.string().min(1).max(3000),
  colorPreference: z.string().max(200).optional(),
  referenceImages: z.array(z.string().url()).max(6).optional(),
});

export async function submitCustomOrder(formData: FormData) {
  const user = await requireUser();

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
