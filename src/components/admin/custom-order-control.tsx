"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateCustomOrder } from "@/app/(admin)/admin/custom-orders/actions";

const STATUSES = [
  "SUBMITTED", "REVIEWING", "QUOTE_SENT", "CUSTOMER_APPROVED",
  "PAYMENT", "PRODUCTION", "READY", "FULFILLED", "DECLINED",
] as const;

export function CustomOrderControl({
  id,
  status,
  quotedPrice,
  adminNotes,
}: {
  id: string;
  status: string;
  quotedPrice: number | null;
  adminNotes: string | null;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          const result = await updateCustomOrder(id, formData);
          if (!result.ok) toast.error(result.error);
          else toast.success("Custom order updated");
        })
      }
      className="space-y-3"
    >
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-bone/50">Status</label>
        <select name="status" defaultValue={status} className="mt-1 w-full rounded-lg border border-bone/15 px-3 py-2 text-sm">
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-bone/50">Quoted price (NGN)</label>
        <input
          name="quotedPrice"
          type="number"
          min={0}
          step="0.01"
          defaultValue={quotedPrice ?? ""}
          className="mt-1 w-full rounded-lg border border-bone/15 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-bone/50">Admin notes</label>
        <textarea
          name="adminNotes"
          defaultValue={adminNotes ?? ""}
          rows={3}
          className="mt-1 w-full rounded-lg border border-bone/15 px-3 py-2 text-sm"
        />
      </div>
      <button
        disabled={isPending}
        className="rounded-full bg-ink px-5 py-2 text-xs font-semibold text-bone hover:bg-ink-soft disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save update"}
      </button>
    </form>
  );
}
