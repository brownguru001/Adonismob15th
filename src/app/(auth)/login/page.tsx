"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { loginCustomer } from "@/app/(auth)/actions";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Sign in</h1>
      <p className="mt-1 text-sm text-ink/60">Welcome back to ADONISMOB15TH.</p>

      <form
        action={(formData) => {
          startTransition(async () => {
            const result = await loginCustomer(formData);
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success("Signed in");
            router.push(searchParams.get("callbackUrl") ?? "/account");
            router.refresh();
          });
        }}
        className="mt-6 space-y-4"
      >
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
          placeholder="Password"
          className="w-full rounded-lg border border-ink/15 px-4 py-3 text-sm outline-none focus:border-ink"
        />
        <button
          disabled={isPending}
          className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bone hover:bg-ink-soft disabled:opacity-50"
        >
          {isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-ink underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
