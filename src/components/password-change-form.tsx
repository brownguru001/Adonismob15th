"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { updateOwnPassword } from "@/lib/actions/account";

export function PasswordChangeForm() {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          const result = await updateOwnPassword(formData);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Password updated.");
          formRef.current?.reset();
        });
      }}
      className="space-y-4"
    >
      <input
        name="currentPassword"
        type="password"
        required
        autoComplete="current-password"
        placeholder="Current password"
        className="w-full rounded-lg border border-bone/15 px-4 py-3 text-sm outline-none focus:border-gold"
      />
      <input
        name="newPassword"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        placeholder="New password (min. 8 characters)"
        className="w-full rounded-lg border border-bone/15 px-4 py-3 text-sm outline-none focus:border-gold"
      />
      <button
        disabled={isPending}
        className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bone hover:bg-ink-soft disabled:opacity-50"
      >
        {isPending ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
