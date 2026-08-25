"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/components/cart-context";
import { formatNaira } from "@/lib/utils";
import { submitCheckout } from "@/app/(member)/dashboard/checkout/actions";

const SHIPPING_FEE = 2500;

export function CheckoutForm() {
  const { items, subtotal, clear } = useCart();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"FLUTTERWAVE" | "BANK_TRANSFER">("FLUTTERWAVE");

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-2xl font-semibold">Nothing to check out</h1>
        <p className="mt-2 text-bone/60">Your cart is empty.</p>
        <Link href="/dashboard/products" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bone">
          Go to products
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
              if (result.paymentMethod === "BANK_TRANSFER") {
                toast.success("Order created — see payment instructions.");
                router.push(`/dashboard/orders/${result.orderNumber}`);
                return;
              }
              if (result.paymentLink) {
                window.location.href = result.paymentLink;
              } else {
                setNotice(
                  result.paymentError
                    ? `Order ${result.orderNumber} created, but the payment provider isn't configured in this environment (${result.paymentError}). In production this would redirect to Flutterwave.`
                    : `Order ${result.orderNumber} created.`
                );
                toast.success("Order created");
                router.push(`/dashboard/orders/${result.orderNumber}`);
              }
            });
          }}
          className="space-y-4"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-bone/50">
            Delivery details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input name="fullName" required placeholder="Full name" className="rounded-lg border border-bone/15 px-4 py-3 text-sm" />
            <input name="phone" required placeholder="Phone number" className="rounded-lg border border-bone/15 px-4 py-3 text-sm" />
          </div>
          <input name="email" type="email" required placeholder="Email" className="w-full rounded-lg border border-bone/15 px-4 py-3 text-sm" />
          <input name="line1" required placeholder="Address line 1" className="w-full rounded-lg border border-bone/15 px-4 py-3 text-sm" />
          <input name="line2" placeholder="Address line 2 (optional)" className="w-full rounded-lg border border-bone/15 px-4 py-3 text-sm" />
          <div className="grid gap-4 sm:grid-cols-2">
            <input name="city" required placeholder="City" className="rounded-lg border border-bone/15 px-4 py-3 text-sm" />
            <input name="state" required placeholder="State" className="rounded-lg border border-bone/15 px-4 py-3 text-sm" />
          </div>

          <h2 className="pt-2 text-sm font-semibold uppercase tracking-wide text-bone/50">
            Payment method
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label
              className={`cursor-pointer rounded-lg border p-4 text-sm transition ${
                paymentMethod === "FLUTTERWAVE" ? "border-gold bg-gold/10" : "border-bone/15"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="FLUTTERWAVE"
                checked={paymentMethod === "FLUTTERWAVE"}
                onChange={() => setPaymentMethod("FLUTTERWAVE")}
                className="sr-only"
              />
              <p className="font-semibold text-bone">Flutterwave</p>
              <p className="mt-1 text-xs text-bone/50">
                Card or transfer, confirmed instantly.
              </p>
            </label>
            <label
              className={`cursor-pointer rounded-lg border p-4 text-sm transition ${
                paymentMethod === "BANK_TRANSFER" ? "border-gold bg-gold/10" : "border-bone/15"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="BANK_TRANSFER"
                checked={paymentMethod === "BANK_TRANSFER"}
                onChange={() => setPaymentMethod("BANK_TRANSFER")}
                className="sr-only"
              />
              <p className="font-semibold text-bone">Bank transfer</p>
              <p className="mt-1 text-xs text-bone/50">
                You transfer manually; we confirm once it lands.
              </p>
            </label>
          </div>

          {notice && <p className="rounded-lg bg-ink-soft p-4 text-sm text-bone/70">{notice}</p>}

          <button
            disabled={isPending}
            className="w-full rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink hover:bg-gold-soft disabled:opacity-50"
          >
            {isPending
              ? "Processing..."
              : paymentMethod === "FLUTTERWAVE"
                ? "Pay with Flutterwave"
                : "Place order — pay by bank transfer"}
          </button>
          <p className="text-center text-xs text-bone/40">
            {paymentMethod === "FLUTTERWAVE"
              ? "You'll be redirected to Flutterwave to complete payment securely."
              : "You'll get our bank details on the next page and can mark the order paid once you've sent the transfer."}
          </p>
        </form>

        <div className="h-fit space-y-3 rounded-xl border border-bone/10 p-6 text-sm">
          {items.map((item) => (
            <div key={item.variantId} className="flex justify-between text-bone/70">
              <span>
                {item.name} ({item.size}/{item.color}) &times; {item.quantity}
              </span>
              <span>{formatNaira(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-bone/10 pt-3">
            <div className="flex justify-between text-bone/70">
              <span>Subtotal</span>
              <span>{formatNaira(subtotal)}</span>
            </div>
            <div className="flex justify-between text-bone/70">
              <span>Shipping</span>
              <span>{formatNaira(SHIPPING_FEE)}</span>
            </div>
            <div className="mt-2 flex justify-between text-base font-semibold text-bone">
              <span>Total</span>
              <span>{formatNaira(subtotal + SHIPPING_FEE)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
