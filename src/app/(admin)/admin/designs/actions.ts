"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit";

const designSchema = z.object({
  title: z.string().min(1).max(150),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  collectionId: z.string().optional(),
});

export async function createDesign(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = designSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    imageUrl: formData.get("imageUrl"),
    status: formData.get("status"),
    collectionId: formData.get("collectionId") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: "Please check the design details." };
  }

  const design = await prisma.design.create({
    data: { ...parsed.data, collectionId: parsed.data.collectionId || null },
  });

  await logAdminAction({
    actorId: admin.id,
    action: "design.create",
    targetType: "Design",
    targetId: design.id,
  });

  revalidatePath("/admin/designs");
  return { ok: true, id: design.id };
}

export async function updateDesignStatus(designId: string, status: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
  const admin = await requireAdmin();
  await prisma.design.update({ where: { id: designId }, data: { status } });
  await logAdminAction({
    actorId: admin.id,
    action: "design.status_change",
    targetType: "Design",
    targetId: designId,
    metadata: { status },
  });
  revalidatePath("/admin/designs");
}
