"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit";

const supplierSchema = z.object({
  name: z.string().min(1).max(150),
  contactName: z.string().max(150).optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().max(30).optional(),
  location: z.string().max(150).optional(),
  services: z.string().max(500).optional(),
  pricingNotes: z.string().max(1000).optional(),
  capabilities: z.string().max(1000).optional(),
  internalNotes: z.string().max(2000).optional(),
});

export async function createSupplier(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = supplierSchema.safeParse({
    name: formData.get("name"),
    contactName: formData.get("contactName") || undefined,
    contactEmail: formData.get("contactEmail") || undefined,
    contactPhone: formData.get("contactPhone") || undefined,
    location: formData.get("location") || undefined,
    services: formData.get("services") || undefined,
    pricingNotes: formData.get("pricingNotes") || undefined,
    capabilities: formData.get("capabilities") || undefined,
    internalNotes: formData.get("internalNotes") || undefined,
  });
  if (!parsed.success) return { ok: false, error: "Please check the supplier details." };

  const supplier = await prisma.supplier.create({ data: parsed.data });

  await logAdminAction({
    actorId: admin.id,
    action: "supplier.create",
    targetType: "Supplier",
    targetId: supplier.id,
  });

  revalidatePath("/admin/suppliers");
  return { ok: true, id: supplier.id };
}

export async function toggleSupplierStatus(supplierId: string, status: "ACTIVE" | "INACTIVE") {
  const admin = await requireAdmin();
  await prisma.supplier.update({ where: { id: supplierId }, data: { status } });
  await logAdminAction({
    actorId: admin.id,
    action: "supplier.status_change",
    targetType: "Supplier",
    targetId: supplierId,
    metadata: { status },
  });
  revalidatePath("/admin/suppliers");
}
