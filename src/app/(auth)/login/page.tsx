"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { loginCustomer } from "@/app/(auth)/actions";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Sign in</h1>
      <p className="mt-1 text-sm text-ink/60">
        Private access only. If you don&apos;t have an invitation, this
        platform isn&apos;t available to you.
      </p>

      <form
        action={(formData) => {
          startTransition(async () => {
            const result = await loginCustomer(formData);
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success("Signed in");
            router.push(searchParams.get("callbackUrl") ?? "/dashboard");
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
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
