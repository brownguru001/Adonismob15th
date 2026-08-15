import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export type Viewer = { role: string; membershipStatus: string | null } | null;

/**
 * Single source of truth for member-only visibility. Every catalog query in
 * the app must go through this — never hand-roll a `visibility` filter
 * elsewhere, or a page can accidentally leak members-only inventory to the
 * public (or to unverified/suspended members).
 */
function canSeeMembersOnly(viewer: Viewer) {
  if (!viewer) return false;
  if (viewer.role === "ADMIN") return true;
  return viewer.membershipStatus === "VERIFIED";
}

function visibilityFilter(viewer: Viewer): Prisma.ProductWhereInput {
  if (canSeeMembersOnly(viewer)) return {};
  return { visibility: "PUBLIC" };
}

function collectionVisibilityFilter(viewer: Viewer): Prisma.CollectionWhereInput {
  if (canSeeMembersOnly(viewer)) return {};
  return { visibility: "PUBLIC" };
}

export async function getFeaturedProducts(viewer: Viewer, take = 8) {
  return prisma.product.findMany({
    where: { isActive: true, featured: true, ...visibilityFilter(viewer) },
    include: { variants: true, collection: true },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getLatestProducts(viewer: Viewer, take = 8) {
  return prisma.product.findMany({
    where: { isActive: true, ...visibilityFilter(viewer) },
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

export async function getShopProducts(viewer: Viewer, filters: ShopFilters) {
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...visibilityFilter(viewer),
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

export async function getProductBySlug(viewer: Viewer, slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { variants: true, collection: true, design: true },
  });
  if (!product || !product.isActive) return null;
  if (product.visibility === "MEMBERS_ONLY" && !canSeeMembersOnly(viewer)) return null;
  return product;
}

export async function getRelatedProducts(viewer: Viewer, productId: string, category: string, take = 4) {
  return prisma.product.findMany({
    where: {
      id: { not: productId },
      category,
      isActive: true,
      ...visibilityFilter(viewer),
    },
    include: { variants: true },
    take,
  });
}

export async function getCollections(viewer: Viewer) {
  return prisma.collection.findMany({
    where: collectionVisibilityFilter(viewer),
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function getCollectionBySlug(viewer: Viewer, slug: string) {
  const collection = await prisma.collection.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isActive: true, ...visibilityFilter(viewer) },
        include: { variants: true },
      },
    },
  });
  if (!collection) return null;
  if (collection.visibility === "MEMBERS_ONLY" && !canSeeMembersOnly(viewer)) return null;
  return collection;
}

export async function getMembersCollectionProducts(viewer: Viewer) {
  if (!canSeeMembersOnly(viewer)) return [];
  return prisma.product.findMany({
    where: { isActive: true, visibility: "MEMBERS_ONLY" },
    include: { variants: true, collection: true },
    orderBy: { createdAt: "desc" },
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
