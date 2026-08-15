"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart-context";
import { formatNaira } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-2xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-ink/60">Browse the shop to find something you like.</p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bone hover:bg-ink-soft"
        >
          Go to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold">Your Cart</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="divide-y divide-ink/10">
          {items.map((item) => (
            <div key={item.variantId} className="flex gap-4 py-6">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-bone-dim">
                {item.image && (
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link href={`/shop/${item.slug}`} className="text-sm font-medium hover:text-gold">
                      {item.name}
                    </Link>
                    <p className="text-xs text-ink/50">
                      {item.size} / {item.color}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">{formatNaira(item.unitPrice * item.quantity)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-ink/20">
                    <button
                      onClick={() => updateQuantity(item.variantId, Math.max(1, item.quantity - 1))}
                      className="h-8 w-8 text-sm text-ink/70"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="h-8 w-8 text-sm text-ink/70"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-xs text-ink/40 underline hover:text-clay"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-xl border border-ink/10 p-6">
          <div className="flex justify-between text-sm text-ink/70">
            <span>Subtotal</span>
            <span>{formatNaira(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-ink/40">Shipping calculated at checkout.</p>
          <Link
            href="/checkout"
            className="mt-6 block rounded-full bg-ink px-6 py-3 text-center text-sm font-semibold text-bone hover:bg-ink-soft"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
