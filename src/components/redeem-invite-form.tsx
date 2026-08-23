"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { redeemInvitation, loginCustomer } from "@/app/(auth)/actions";

export function RedeemInviteForm({ code }: { code: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          const result = await redeemInvitation(formData);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          const loginForm = new FormData();
          loginForm.set("email", result.email);
          loginForm.set("password", formData.get("password") as string);
          const login = await loginCustomer(loginForm);
          if (login.ok) {
            toast.success("Welcome.");
            router.push("/dashboard");
            router.refresh();
          } else {
            router.push("/login");
          }
        });
      }}
      className="mt-6 space-y-4"
    >
      <input type="hidden" name="code" value={code} />
      <input
        name="name"
        required
        placeholder="Full name"
        className="w-full rounded-lg border border-ink/15 px-4 py-3 text-sm outline-none focus:border-ink"
      />
      <input
        name="password"
        type="password"
        required
        minLength={8}
        placeholder="Set a password (min. 8 characters)"
        className="w-full rounded-lg border border-ink/15 px-4 py-3 text-sm outline-none focus:border-ink"
      />
      <button
        disabled={isPending}
        className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bone hover:bg-ink-soft disabled:opacity-50"
      >
        {isPending ? "Setting up..." : "Create account"}
      </button>
    </form>
  );
}
