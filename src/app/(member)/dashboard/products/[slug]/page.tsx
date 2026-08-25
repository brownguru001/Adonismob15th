import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { AddToCart } from "@/components/add-to-cart";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    robots: { index: false, follow: false },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.category);
  const dropSoldOut = product.dropQuantityRemaining !== null && product.dropQuantityRemaining <= 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-ink-soft">
            {product.images[0] && (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority
              />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.slice(1, 5).map((img) => (
                <div key={img} className="relative aspect-square overflow-hidden rounded-lg bg-ink-soft">
                  <Image src={img} alt={product.name} fill className="object-cover" sizes="25vw" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.isPreOrder && (
            <span className="mb-3 inline-block rounded-full bg-ink px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-gold">
              Pre-order{product.preOrderClosesAt ? ` — closes ${product.preOrderClosesAt.toLocaleDateString()}` : ""}
            </span>
          )}
          <h1 className="font-display text-3xl font-semibold">{product.name}</h1>
          {product.collection && (
            <p className="mt-1 text-sm text-bone/50">{product.collection.name}</p>
          )}
          {product.dropQuantityLimit !== null && !dropSoldOut && (
            <p className="mt-1 text-xs text-clay">
              Limited drop — {product.dropQuantityRemaining} of {product.dropQuantityLimit} remaining
            </p>
          )}
          {dropSoldOut && <p className="mt-1 text-xs text-bone/50">This drop has sold out.</p>}

          <AddToCart
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price.toString(),
              images: product.images,
              variants: product.variants.map((v) => ({
                id: v.id,
                size: v.size,
                color: v.color,
                stock: v.stock,
                priceDelta: v.priceDelta.toString(),
              })),
            }}
          />

          <div className="mt-10 space-y-6 border-t border-bone/10 pt-6 text-sm">
            <div>
              <p className="font-semibold text-bone">Description</p>
              <p className="mt-2 text-bone/70">{product.description}</p>
            </div>
            {product.design?.description && (
              <div>
                <p className="font-semibold text-bone">Design</p>
                <p className="mt-2 text-bone/70">{product.design.description}</p>
              </div>
            )}
            {product.careInfo && (
              <div>
                <p className="font-semibold text-bone">Care</p>
                <p className="mt-2 text-bone/70">{product.careInfo}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-2xl font-semibold">You may also like</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={{ ...p, price: p.price.toString() }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
