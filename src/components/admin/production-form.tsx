"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateProductionOrder } from "@/app/(admin)/admin/orders/actions";

const STAGES = [
  "QUEUED", "ASSIGNED", "PRINTING", "QUALITY_CHECK", "PACKED",
  "READY_FOR_DELIVERY", "SHIPPED", "DELIVERED",
] as const;

export function ProductionForm({
  orderId,
  suppliers,
  current,
}: {
  orderId: string;
  suppliers: { id: string; name: string }[];
  current?: { supplierId: string | null; stage: string; notes: string | null } | null;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          const result = await updateProductionOrder(orderId, formData);
          if (!result.ok) toast.error(result.error);
          else toast.success("Production updated");
        })
      }
      className="space-y-3"
    >
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-bone/50">Supplier</label>
        <select
          name="supplierId"
          defaultValue={current?.supplierId ?? ""}
          className="mt-1 w-full rounded-lg border border-bone/15 px-3 py-2 text-sm"
        >
          <option value="">Unassigned</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-bone/50">Stage</label>
        <select
          name="stage"
          defaultValue={current?.stage ?? "QUEUED"}
          className="mt-1 w-full rounded-lg border border-bone/15 px-3 py-2 text-sm"
        >
          {STAGES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-bone/50">Notes</label>
        <textarea
          name="notes"
          defaultValue={current?.notes ?? ""}
          rows={2}
          className="mt-1 w-full rounded-lg border border-bone/15 px-3 py-2 text-sm"
        />
      </div>
      <button
        disabled={isPending}
        className="rounded-full bg-ink px-5 py-2 text-xs font-semibold text-bone hover:bg-ink-soft disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Update production"}
      </button>
    </form>
  );
}
