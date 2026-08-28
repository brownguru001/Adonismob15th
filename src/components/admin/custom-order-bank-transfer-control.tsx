"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { confirmCustomOrderBankTransfer, rejectCustomOrderBankTransfer } from "@/app/(admin)/admin/custom-orders/actions";

export function CustomOrderBankTransferControl({ customOrderId }: { customOrderId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mt-4 rounded-lg border border-gold/30 bg-gold/10 p-4">
      <p className="text-sm font-semibold text-bone">Bank transfer awaiting confirmation</p>
      <p className="mt-1 text-xs text-bone/60">
        Check your bank statement for this request&apos;s reference, then confirm or reject.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await confirmCustomOrderBankTransfer(customOrderId);
              if (!result.ok) toast.error(result.error);
              else toast.success("Payment confirmed — moved to production.");
            })
          }
          className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-bone hover:bg-ink-soft disabled:opacity-50"
        >
          Confirm received
        </button>
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await rejectCustomOrderBankTransfer(customOrderId);
              if (!result.ok) toast.error(result.error);
              else toast.success("Sent back to quote sent.");
            })
          }
          className="rounded-full border border-bone/20 px-4 py-2 text-xs font-semibold text-bone/70 hover:text-bone disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
