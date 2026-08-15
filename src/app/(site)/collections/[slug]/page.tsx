import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollectionBySlug } from "@/lib/catalog";
import { getOptionalUser } from "@/lib/authz";
import { ProductCard } from "@/components/product-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const user = await getOptionalUser();
  const collection = await getCollectionBySlug(user, slug);
  if (!collection) return {};
  return { title: collection.name, description: collection.description ?? undefined };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getOptionalUser();
  const collection = await getCollectionBySlug(user, slug);
  if (!collection) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {collection.visibility === "MEMBERS_ONLY" && (
        <span className="mb-3 inline-block rounded-full bg-ink px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-gold">
          Members Collection
        </span>
      )}
      <h1 className="font-display text-3xl font-semibold">{collection.name}</h1>
      {collection.description && (
        <p className="mt-2 max-w-2xl text-ink/60">{collection.description}</p>
      )}

      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3">
        {collection.products.map((product) => (
          <ProductCard
            key={product.id}
            product={{ ...product, price: product.price.toString() }}
          />
        ))}
      </div>
      {collection.products.length === 0 && (
        <p className="py-20 text-center text-ink/50">No products in this collection yet.</p>
      )}
    </div>
  );
}
