"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { registerCustomer, loginCustomer } from "@/app/(auth)/actions";

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Create your account</h1>
      <p className="mt-1 text-sm text-ink/60">Join ADONISMOB15TH to shop and track orders.</p>

      <form
        action={(formData) => {
          startTransition(async () => {
            const result = await registerCustomer(formData);
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            const login = await loginCustomer(formData);
            if (login.ok) {
              toast.success("Welcome to ADONISMOB15TH");
              router.push("/account");
              router.refresh();
            } else {
              router.push("/login");
            }
          });
        }}
        className="mt-6 space-y-4"
      >
        <input
          name="name"
          required
          placeholder="Full name"
          className="w-full rounded-lg border border-ink/15 px-4 py-3 text-sm outline-none focus:border-ink"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full rounded-lg border border-ink/15 px-4 py-3 text-sm outline-none focus:border-ink"
        />
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Password (min. 8 characters)"
          className="w-full rounded-lg border border-ink/15 px-4 py-3 text-sm outline-none focus:border-ink"
        />
        <button
          disabled={isPending}
          className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bone hover:bg-ink-soft disabled:opacity-50"
        >
          {isPending ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-ink underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
