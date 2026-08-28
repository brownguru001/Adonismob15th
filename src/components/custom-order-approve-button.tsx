"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { approveCustomOrderQuote } from "@/app/(member)/dashboard/custom-orders/actions";

export function CustomOrderApproveButton({ customOrderId }: { customOrderId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await approveCustomOrderQuote(customOrderId);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Quote approved — pay by bank transfer to move to production.");
          router.refresh();
        })
      }
      className="mt-4 w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bone hover:bg-ink-soft disabled:opacity-50"
    >
      {isPending ? "Approving..." : "Approve quote & pay"}
    </button>
  );
}
