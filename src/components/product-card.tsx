import Link from "next/link";
import Image from "next/image";
import { formatNaira } from "@/lib/utils";

export type ProductCardData = {
  slug: string;
  name: string;
  price: number | string;
  images: string[];
  category: string;
  isPreOrder: boolean;
  dropQuantityRemaining: number | null;
  variants: { stock: number }[];
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const inStock = product.variants.some((v) => v.stock > 0);
  const dropSoldOut = product.dropQuantityRemaining !== null && product.dropQuantityRemaining <= 0;
  const soldOut = !inStock || dropSoldOut;
  const image = product.images[0];

  return (
    <Link href={`/dashboard/products/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-bone-dim">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink/30">
            No image
          </div>
        )}
        {product.isPreOrder && !soldOut && (
          <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-gold">
            Pre-order
          </span>
        )}
        {soldOut && (
          <span className="absolute right-3 top-3 rounded-full bg-bone px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink/60">
            Sold Out
          </span>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-ink">{product.name}</p>
          <p className="text-xs uppercase tracking-wide text-ink/40">{product.category}</p>
        </div>
        <p className="text-sm font-semibold text-ink">{formatNaira(product.price)}</p>
      </div>
    </Link>
  );
}
