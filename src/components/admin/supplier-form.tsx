"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createSupplier } from "@/app/(admin)/admin/suppliers/actions";

export function SupplierForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          const result = await createSupplier(formData);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Supplier added");
          router.refresh();
        })
      }
      className="space-y-3"
    >
      <input name="name" required placeholder="Supplier name" className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm" />
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="contactName" placeholder="Contact name" className="rounded-lg border border-ink/15 px-3 py-2 text-sm" />
        <input name="contactPhone" placeholder="Contact phone" className="rounded-lg border border-ink/15 px-3 py-2 text-sm" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="contactEmail" type="email" placeholder="Contact email" className="rounded-lg border border-ink/15 px-3 py-2 text-sm" />
        <input name="location" placeholder="Location" className="rounded-lg border border-ink/15 px-3 py-2 text-sm" />
      </div>
      <input name="services" placeholder="Services (e.g. screen printing, embroidery)" className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm" />
      <input name="capabilities" placeholder="Production capabilities / capacity" className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm" />
      <textarea name="pricingNotes" rows={2} placeholder="Pricing notes" className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm" />
      <textarea name="internalNotes" rows={2} placeholder="Internal notes (never shown to customers)" className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm" />
      <button
        disabled={isPending}
        className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bone hover:bg-ink-soft disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Add supplier"}
      </button>
    </form>
  );
}
