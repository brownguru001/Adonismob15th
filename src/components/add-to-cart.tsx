"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/components/cart-context";
import { formatNaira } from "@/lib/utils";

type Variant = {
  id: string;
  size: string;
  color: string;
  stock: number;
  priceDelta: string | number;
};

export function AddToCart({
  product,
}: {
  product: {
    id: string;
    slug: string;
    name: string;
    price: string | number;
    images: string[];
    variants: Variant[];
  };
}) {
  const { addItem } = useCart();
  const router = useRouter();

  const sizes = useMemo(
    () => Array.from(new Set(product.variants.map((v) => v.size))),
    [product.variants]
  );
  const [size, setSize] = useState<string | null>(sizes[0] ?? null);

  const colorsForSize = useMemo(
    () => product.variants.filter((v) => v.size === size),
    [product.variants, size]
  );
  const [color, setColor] = useState<string | null>(colorsForSize[0]?.color ?? null);
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = product.variants.find(
    (v) => v.size === size && v.color === color
  );
  const basePrice = Number(product.price);
  const unitPrice = basePrice + Number(selectedVariant?.priceDelta ?? 0);
  const inStock = (selectedVariant?.stock ?? 0) > 0;

  function handleAdd(navigateToCheckout: boolean) {
    if (!selectedVariant) {
      toast.error("Please select a size and color.");
      return;
    }
    if (!inStock) {
      toast.error("This variant is out of stock.");
      return;
    }
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? "",
      size: selectedVariant.size,
      color: selectedVariant.color,
      unitPrice,
      quantity,
    });
    toast.success(`Added ${product.name} to cart`);
    if (navigateToCheckout) router.push("/dashboard/checkout");
  }

  return (
    <div>
      <p className="mt-3 text-2xl font-semibold text-ink">{formatNaira(unitPrice)}</p>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Size</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              onClick={() => {
                setSize(s);
                const firstColor = product.variants.find((v) => v.size === s)?.color ?? null;
                setColor(firstColor);
              }}
              className={`h-9 min-w-10 rounded-lg border px-3 text-sm ${
                size === s ? "border-ink bg-ink text-bone" : "border-ink/20 text-ink/70"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Color</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {colorsForSize.map((v) => (
            <button
              key={v.id}
              onClick={() => setColor(v.color)}
              disabled={v.stock === 0}
              className={`rounded-lg border px-3 py-2 text-sm capitalize disabled:opacity-30 ${
                color === v.color ? "border-ink bg-ink text-bone" : "border-ink/20 text-ink/70"
              }`}
            >
              {v.color}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Qty</p>
        <div className="flex items-center rounded-lg border border-ink/20">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="h-9 w-9 text-ink/70"
          >
            −
          </button>
          <span className="w-8 text-center text-sm">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="h-9 w-9 text-ink/70"
          >
            +
          </button>
        </div>
      </div>

      {!inStock && selectedVariant && (
        <p className="mt-3 text-sm text-clay">This size/color is sold out.</p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => handleAdd(false)}
          disabled={!inStock}
          className="flex-1 rounded-full border border-ink px-6 py-3 text-sm font-semibold text-ink transition hover:bg-ink hover:text-bone disabled:opacity-40"
        >
          Add to Cart
        </button>
        <button
          onClick={() => handleAdd(true)}
          disabled={!inStock}
          className="flex-1 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bone transition hover:bg-ink-soft disabled:opacity-40"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
