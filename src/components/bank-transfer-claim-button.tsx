"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { markBankTransferPaid } from "@/app/(member)/dashboard/orders/actions";

export function BankTransferClaimButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await markBankTransferPaid(orderId);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Thanks — we'll confirm your payment shortly.");
          router.refresh();
        })
      }
      className="mt-4 w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bone hover:bg-ink-soft disabled:opacity-50"
    >
      {isPending ? "Submitting..." : "I've made the transfer"}
    </button>
  );
}
