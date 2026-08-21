import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// Generated on request, not at build time — this route reads from the
// database, which isn't guaranteed reachable during a build/CI step.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/collections`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/custom-orders`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Members-only products/collections are deliberately excluded — this is
  // public SEO surface, and that catalog must never be discoverable here.
  const [products, collections] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, visibility: "PUBLIC" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.collection.findMany({
      where: { visibility: "PUBLIC" },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/shop/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const collectionRoutes: MetadataRoute.Sitemap = collections.map((c) => ({
    url: `${baseUrl}/collections/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...collectionRoutes];
}
