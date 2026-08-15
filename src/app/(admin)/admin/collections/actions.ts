"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit";
import { slugify } from "@/lib/utils";

const collectionSchema = z.object({
  name: z.string().min(1).max(150),
  description: z.string().max(2000).optional(),
  coverImage: z.string().url().optional(),
  visibility: z.enum(["PUBLIC", "MEMBERS_ONLY"]),
  featured: z.coerce.boolean().default(false),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function createCollection(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = collectionSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    coverImage: formData.get("coverImage") || undefined,
    visibility: formData.get("visibility"),
    featured: formData.get("featured") === "on",
    startDate: formData.get("startDate") || undefined,
    endDate: formData.get("endDate") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: "Please check the collection details." };
  }

  const baseSlug = slugify(parsed.data.name);
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.collection.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const collection = await prisma.collection.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      coverImage: parsed.data.coverImage,
      visibility: parsed.data.visibility,
      featured: parsed.data.featured,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    },
  });

  await logAdminAction({
    actorId: admin.id,
    action: "collection.create",
    targetType: "Collection",
    targetId: collection.id,
  });

  revalidatePath("/admin/collections");
  revalidatePath("/collections");
  return { ok: true, id: collection.id };
}
