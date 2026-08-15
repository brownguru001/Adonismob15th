"use client";

import { useTransition } from "react";
import { toggleProductActive } from "@/app/(admin)/admin/products/actions";

export function ProductActiveToggle({
  productId,
  isActive,
}: {
  productId: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => toggleProductActive(productId, !isActive))}
      disabled={isPending}
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        isActive ? "bg-green-100 text-green-700" : "bg-ink/10 text-ink/50"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </button>
  );
}
