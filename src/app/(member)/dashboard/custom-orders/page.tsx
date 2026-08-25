import type { Metadata } from "next";
import Link from "next/link";
import { requireMember } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { CustomOrderForm } from "@/components/custom-order-form";

export const metadata: Metadata = {
  title: "Custom Orders",
  robots: { index: false, follow: false },
};

const STEPS = [
  "SUBMITTED",
  "REVIEWING",
  "QUOTE SENT",
  "APPROVED",
  "PAYMENT",
  "PRODUCTION",
  "READY",
  "FULFILLED",
];

export default async function CustomOrdersPage() {
  const user = await requireMember();
  const myRequests = await prisma.customOrder.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Made to order
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold">Custom Orders</h1>
        <p className="mt-2 text-bone/60">
          Tell us what you want made. We&apos;ll review your request, send a
          quote, and take it into production once you approve.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {STEPS.map((step, i) => (
          <span key={step} className="flex items-center gap-2 text-xs text-bone/40">
            <span className="rounded-full border border-bone/15 px-3 py-1">{step}</span>
            {i < STEPS.length - 1 && <span>&rarr;</span>}
          </span>
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <CustomOrderForm />

        {myRequests.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-bone/50">
              Your requests
            </p>
            <div className="mt-3 space-y-3">
              {myRequests.map((req) => (
                <Link
                  key={req.id}
                  href={`/dashboard/custom-orders/${req.id}`}
                  className="block rounded-lg border border-bone/10 p-4 text-sm hover:border-bone/30"
                >
                  <p className="font-medium">{req.productType}</p>
                  <p className="mt-1 text-xs text-bone/50">{req.status.replace("_", " ")}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
