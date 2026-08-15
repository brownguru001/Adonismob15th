"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { applyForMembership } from "@/app/(site)/members/apply/actions";

export function ApplyForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          const result = await applyForMembership(formData);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Application submitted — we'll review it soon.");
          router.push("/members");
          router.refresh();
        });
      }}
      className="mt-6 space-y-4"
    >
      <textarea
        name="note"
        rows={4}
        placeholder="Optional — tell us why you'd like to join (referral, past support, community involvement, etc.)"
        className="w-full rounded-lg border border-ink/15 px-4 py-3 text-sm"
      />
      <button
        disabled={isPending}
        className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bone hover:bg-ink-soft disabled:opacity-50"
      >
        {isPending ? "Submitting..." : "Submit application"}
      </button>
    </form>
  );
}
