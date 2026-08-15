"use client";

import { useTransition } from "react";
import { toggleSupplierStatus } from "@/app/(admin)/admin/suppliers/actions";

export function SupplierStatusToggle({ supplierId, status }: { supplierId: string; status: "ACTIVE" | "INACTIVE" }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => toggleSupplierStatus(supplierId, status === "ACTIVE" ? "INACTIVE" : "ACTIVE"))}
      disabled={isPending}
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-ink/10 text-ink/50"
      }`}
    >
      {status}
    </button>
  );
}
