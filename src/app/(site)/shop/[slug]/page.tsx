import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import { getOptionalUser } from "@/lib/authz";
import { ProductCard } from "@/components/product-card";
import { AddToCart } from "@/components/add-to-cart";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const user = await getOptionalUser();
  const product = await getProductBySlug(user, slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description.slice(0, 155),
    openGraph: { images: product.images.slice(0, 1) },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getOptionalUser();
  const product = await getProductBySlug(user, slug);
  if (!product) notFound();

  const related = await getRelatedProducts(user, product.id, product.category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-bone-dim">
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
                <div key={img} className="relative aspect-square overflow-hidden rounded-lg bg-bone-dim">
                  <Image src={img} alt={product.name} fill className="object-cover" sizes="25vw" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.visibility === "MEMBERS_ONLY" && (
            <span className="mb-3 inline-block rounded-full bg-ink px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-gold">
              Members Collection
            </span>
          )}
          <h1 className="font-display text-3xl font-semibold">{product.name}</h1>
          {product.collection && (
            <p className="mt-1 text-sm text-ink/50">{product.collection.name}</p>
          )}

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

          <div className="mt-10 space-y-6 border-t border-ink/10 pt-6 text-sm">
            <div>
              <p className="font-semibold text-ink">Description</p>
              <p className="mt-2 text-ink/70">{product.description}</p>
            </div>
            {product.design?.description && (
              <div>
                <p className="font-semibold text-ink">Design</p>
                <p className="mt-2 text-ink/70">{product.design.description}</p>
              </div>
            )}
            {product.careInfo && (
              <div>
                <p className="font-semibold text-ink">Care</p>
                <p className="mt-2 text-ink/70">{product.careInfo}</p>
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
