"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart-context";

export function CartLink() {
  const { count } = useCart();

  return (
    <Link href="/cart" className="relative text-ink/80 hover:text-ink" aria-label="Cart">
      <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-semibold text-ink">
          {count}
        </span>
      )}
    </Link>
  );
}
