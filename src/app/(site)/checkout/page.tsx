"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/components/cart-context";
import { formatNaira } from "@/lib/utils";
import { submitCheckout } from "@/app/(site)/checkout/actions";

const SHIPPING_FEE = 2500;

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-2xl font-semibold">Nothing to check out</h1>
        <p className="mt-2 text-ink/60">Your cart is empty.</p>
        <Link href="/shop" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bone">
          Go to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold">Checkout</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        <form
          action={(formData) => {
            startTransition(async () => {
              const result = await submitCheckout(
                items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
                formData
              );
              if (!result.ok) {
                toast.error(result.error);
                return;
              }
              clear();
              if (result.paymentLink) {
                window.location.href = result.paymentLink;
              } else {
                setNotice(
                  result.paymentError
                    ? `Order ${result.orderNumber} created, but the payment provider isn't configured in this environment (${result.paymentError}). In production this would redirect to Flutterwave.`
                    : `Order ${result.orderNumber} created.`
                );
                toast.success("Order created");
                router.push(`/account/orders/${result.orderNumber}`);
              }
            });
          }}
          className="space-y-4"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
            Delivery details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input name="fullName" required placeholder="Full name" className="rounded-lg border border-ink/15 px-4 py-3 text-sm" />
            <input name="phone" required placeholder="Phone number" className="rounded-lg border border-ink/15 px-4 py-3 text-sm" />
          </div>
          <input name="email" type="email" required placeholder="Email" className="w-full rounded-lg border border-ink/15 px-4 py-3 text-sm" />
          <input name="line1" required placeholder="Address line 1" className="w-full rounded-lg border border-ink/15 px-4 py-3 text-sm" />
          <input name="line2" placeholder="Address line 2 (optional)" className="w-full rounded-lg border border-ink/15 px-4 py-3 text-sm" />
          <div className="grid gap-4 sm:grid-cols-2">
            <input name="city" required placeholder="City" className="rounded-lg border border-ink/15 px-4 py-3 text-sm" />
            <input name="state" required placeholder="State" className="rounded-lg border border-ink/15 px-4 py-3 text-sm" />
          </div>

          {notice && <p className="rounded-lg bg-bone-dim p-4 text-sm text-ink/70">{notice}</p>}

          <button
            disabled={isPending}
            className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bone hover:bg-ink-soft disabled:opacity-50"
          >
            {isPending ? "Processing..." : "Pay with Flutterwave"}
          </button>
          <p className="text-center text-xs text-ink/40">
            You&apos;ll be redirected to Flutterwave to complete payment securely.
          </p>
        </form>

        <div className="h-fit space-y-3 rounded-xl border border-ink/10 p-6 text-sm">
          {items.map((item) => (
            <div key={item.variantId} className="flex justify-between text-ink/70">
              <span>
                {item.name} ({item.size}/{item.color}) &times; {item.quantity}
              </span>
              <span>{formatNaira(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-ink/10 pt-3">
            <div className="flex justify-between text-ink/70">
              <span>Subtotal</span>
              <span>{formatNaira(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink/70">
              <span>Shipping</span>
              <span>{formatNaira(SHIPPING_FEE)}</span>
            </div>
            <div className="mt-2 flex justify-between text-base font-semibold text-ink">
              <span>Total</span>
              <span>{formatNaira(subtotal + SHIPPING_FEE)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
