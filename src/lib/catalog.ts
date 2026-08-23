import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

/**
 * Private-platform catalog. Every function here assumes it is only ever
 * called from within a route already gated by requireMember()/requireAdmin()
 * — there is no public tier to filter against, so the enforcement point is
 * the route layout, not this data layer. Do not call these from an
 * unauthenticated route.
 */

export async function getFeaturedProducts(take = 8) {
  return prisma.product.findMany({
    where: { isActive: true, featured: true },
    include: { variants: true, collection: true },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getLatestProducts(take = 8) {
  return prisma.product.findMany({
    where: { isActive: true },
    include: { variants: true, collection: true },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export type ShopFilters = {
  q?: string;
  category?: string;
  collectionSlug?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc";
};

export async function getShopProducts(filters: ShopFilters) {
  const where: Prisma.ProductWhereInput = {
    isActive: true,
  };

  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
    ];
  }
  if (filters.category) where.category = filters.category;
  if (filters.collectionSlug) where.collection = { slug: filters.collectionSlug };
  if (filters.size) where.variants = { some: { size: filters.size } };
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    filters.sort === "price_asc"
      ? { price: "asc" }
      : filters.sort === "price_desc"
        ? { price: "desc" }
        : { createdAt: "desc" };

  return prisma.product.findMany({
    where,
    include: { variants: true, collection: true },
    orderBy,
  });
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { variants: true, collection: true, design: true },
  });
  if (!product || !product.isActive) return null;
  return product;
}

export async function getRelatedProducts(productId: string, category: string, take = 4) {
  return prisma.product.findMany({
    where: {
      id: { not: productId },
      category,
      isActive: true,
    },
    include: { variants: true },
    take,
  });
}

export async function getCollections() {
  return prisma.collection.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function getCollectionBySlug(slug: string) {
  return prisma.collection.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isActive: true },
        include: { variants: true },
      },
    },
  });
}

export async function getProductCategories() {
  const rows = await prisma.product.findMany({
    where: { isActive: true },
    select: { category: true },
    distinct: ["category"],
  });
  return rows.map((r) => r.category);
}
