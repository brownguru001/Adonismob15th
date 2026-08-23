"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit";
import { slugify } from "@/lib/utils";

const variantSchema = z.object({
  size: z.string().min(1),
  color: z.string().min(1),
  stock: z.coerce.number().int().min(0),
  priceDelta: z.coerce.number().default(0),
});

const productSchema = z.object({
  name: z.string().min(2).max(150),
  description: z.string().min(1).max(4000),
  category: z.string().min(1).max(60),
  price: z.coerce.number().positive(),
  cost: z.coerce.number().min(0).default(0),
  careInfo: z.string().max(1000).optional(),
  images: z.array(z.string().url()).min(1),
  featured: z.coerce.boolean().default(false),
  isPreOrder: z.coerce.boolean().default(false),
  preOrderClosesAt: z.string().optional(),
  dropQuantityLimit: z.coerce.number().int().min(0).optional(),
  collectionId: z.string().optional(),
  designId: z.string().optional(),
  variants: z.array(variantSchema).min(1),
});

function parseFormData(formData: FormData) {
  const variants = JSON.parse((formData.get("variants") as string) || "[]");
  const images = formData.getAll("images").filter(Boolean) as string[];

  return productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    category: formData.get("category"),
    price: formData.get("price"),
    cost: formData.get("cost") || 0,
    careInfo: formData.get("careInfo") || undefined,
    images,
    featured: formData.get("featured") === "on",
    isPreOrder: formData.get("isPreOrder") === "on",
    preOrderClosesAt: formData.get("preOrderClosesAt") || undefined,
    dropQuantityLimit: formData.get("dropQuantityLimit") || undefined,
    collectionId: formData.get("collectionId") || undefined,
    designId: formData.get("designId") || undefined,
    variants,
  });
}

export async function createProduct(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { ok: false, error: "Please check all required product fields." };
  }

  const baseSlug = slugify(parsed.data.name);
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const product = await prisma.product.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      category: parsed.data.category,
      price: parsed.data.price,
      cost: parsed.data.cost,
      careInfo: parsed.data.careInfo,
      images: parsed.data.images,
      featured: parsed.data.featured,
      isPreOrder: parsed.data.isPreOrder,
      preOrderClosesAt: parsed.data.preOrderClosesAt ? new Date(parsed.data.preOrderClosesAt) : null,
      dropQuantityLimit: parsed.data.dropQuantityLimit ?? null,
      dropQuantityRemaining: parsed.data.dropQuantityLimit ?? null,
      collectionId: parsed.data.collectionId || null,
      designId: parsed.data.designId || null,
      variants: {
        create: parsed.data.variants.map((v) => ({
          size: v.size,
          color: v.color,
          stock: v.stock,
          priceDelta: v.priceDelta,
          sku: `${slug}-${v.size}-${v.color}`.toUpperCase().replace(/\s+/g, "-"),
        })),
      },
    },
  });

  await logAdminAction({
    actorId: admin.id,
    action: "product.create",
    targetType: "Product",
    targetId: product.id,
    metadata: { name: product.name },
  });

  revalidatePath("/admin/products");
  revalidatePath("/dashboard/products");
  return { ok: true, id: product.id };
}

export async function updateProduct(productId: string, formData: FormData) {
  const admin = await requireAdmin();
  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { ok: false, error: "Please check all required product fields." };
  }

  await prisma.$transaction(async (tx) => {
    const existingProduct = await tx.product.findUniqueOrThrow({ where: { id: productId } });

    // If a drop limit is newly introduced (wasn't set before), start the
    // remaining count at that limit. If one already existed, leave it
    // alone — adjusting it after units have sold is an admin edge case
    // outside this foundation's scope.
    const dropQuantityRemaining =
      existingProduct.dropQuantityLimit === null && parsed.data.dropQuantityLimit !== undefined
        ? parsed.data.dropQuantityLimit
        : undefined;

    await tx.product.update({
      where: { id: productId },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        category: parsed.data.category,
        price: parsed.data.price,
        cost: parsed.data.cost,
        careInfo: parsed.data.careInfo,
        images: parsed.data.images,
        featured: parsed.data.featured,
        isPreOrder: parsed.data.isPreOrder,
        preOrderClosesAt: parsed.data.preOrderClosesAt ? new Date(parsed.data.preOrderClosesAt) : null,
        dropQuantityLimit: parsed.data.dropQuantityLimit ?? null,
        ...(dropQuantityRemaining !== undefined && { dropQuantityRemaining }),
        collectionId: parsed.data.collectionId || null,
        designId: parsed.data.designId || null,
      },
    });

    const existingVariants = await tx.productVariant.findMany({ where: { productId } });
    const keepKeys = new Set(parsed.data.variants.map((v) => `${v.size}::${v.color}`));

    for (const existing of existingVariants) {
      const key = `${existing.size}::${existing.color}`;
      if (!keepKeys.has(key)) {
        await tx.productVariant.delete({ where: { id: existing.id } }).catch(() => {
          // has order history referencing it — leave in place rather than break past orders
        });
      }
    }

    for (const v of parsed.data.variants) {
      const existing = existingVariants.find((e) => e.size === v.size && e.color === v.color);
      if (existing) {
        await tx.productVariant.update({
          where: { id: existing.id },
          data: { stock: v.stock, priceDelta: v.priceDelta },
        });
      } else {
        await tx.productVariant.create({
          data: {
            productId,
            size: v.size,
            color: v.color,
            stock: v.stock,
            priceDelta: v.priceDelta,
            sku: `${productId}-${v.size}-${v.color}`.toUpperCase().replace(/\s+/g, "-").slice(0, 60),
          },
        });
      }
    }
  });

  await logAdminAction({
    actorId: admin.id,
    action: "product.update",
    targetType: "Product",
    targetId: productId,
  });

  revalidatePath("/admin/products");
  revalidatePath("/dashboard/products");
  return { ok: true };
}

export async function toggleProductActive(productId: string, isActive: boolean) {
  const admin = await requireAdmin();
  await prisma.product.update({ where: { id: productId }, data: { isActive } });
  await logAdminAction({
    actorId: admin.id,
    action: isActive ? "product.activate" : "product.deactivate",
    targetType: "Product",
    targetId: productId,
  });
  revalidatePath("/admin/products");
  revalidatePath("/dashboard/products");
}
