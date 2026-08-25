"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateOrderStatus } from "@/app/(admin)/admin/orders/actions";

const STATUSES = [
  "PENDING_PAYMENT", "PAID", "PROCESSING", "PRODUCTION", "READY",
  "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED",
] as const;

export function OrderStatusControl({ orderId, status }: { orderId: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) =>
        startTransition(async () => {
          const result = await updateOrderStatus(orderId, e.target.value as (typeof STATUSES)[number]);
          if (!result.ok) toast.error(result.error);
          else toast.success("Order status updated");
        })
      }
      className="rounded-lg border border-bone/15 px-3 py-2 text-sm"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s.replace("_", " ")}</option>
      ))}
    </select>
  );
}
