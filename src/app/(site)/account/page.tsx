import Link from "next/link";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
  const user = await requireUser();
  const [orderCount, customOrderCount, membership] = await Promise.all([
    prisma.order.count({ where: { userId: user.id } }),
    prisma.customOrder.count({ where: { userId: user.id } }),
    prisma.membership.findUnique({ where: { userId: user.id } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold">My Account</h1>
      <p className="mt-1 text-ink/60">{user.name} &middot; {user.email}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/account/orders" className="rounded-xl border border-ink/10 p-6 hover:border-ink/30">
          <p className="text-sm text-ink/50">Orders</p>
          <p className="mt-1 text-2xl font-semibold">{orderCount}</p>
          <p className="mt-2 text-sm text-ink/60">Track order status and history</p>
        </Link>
        <Link href="/custom-orders" className="rounded-xl border border-ink/10 p-6 hover:border-ink/30">
          <p className="text-sm text-ink/50">Custom Orders</p>
          <p className="mt-1 text-2xl font-semibold">{customOrderCount}</p>
          <p className="mt-2 text-sm text-ink/60">View custom order requests</p>
        </Link>
      </div>

      <div className="mt-8 rounded-xl border border-ink/10 p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-ink/50">
          Membership
        </p>
        {membership ? (
          <p className="mt-2 text-sm text-ink/70">
            Status: <span className="font-medium text-ink">{membership.status}</span>
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm text-ink/70">
              You haven&apos;t applied for the Members Collection yet.
            </p>
            <Link href="/members/apply" className="mt-3 inline-block text-sm font-medium text-ink underline">
              Apply for membership
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
