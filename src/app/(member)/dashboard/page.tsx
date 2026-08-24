import Link from "next/link";
import { requireMember } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const user = await requireMember();
  const [orderCount, customOrderCount, membership] = await Promise.all([
    prisma.order.count({ where: { userId: user.id } }),
    prisma.customOrder.count({ where: { userId: user.id } }),
    prisma.membership.findUnique({ where: { userId: user.id } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-ink/60">{user.name} &middot; {user.email}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/dashboard/orders" className="rounded-xl border border-ink/10 p-6 hover:border-ink/30">
          <p className="text-sm text-ink/50">Orders</p>
          <p className="mt-1 text-2xl font-semibold">{orderCount}</p>
          <p className="mt-2 text-sm text-ink/60">Track order status and history</p>
        </Link>
        <Link href="/dashboard/custom-orders" className="rounded-xl border border-ink/10 p-6 hover:border-ink/30">
          <p className="text-sm text-ink/50">Custom Orders</p>
          <p className="mt-1 text-2xl font-semibold">{customOrderCount}</p>
          <p className="mt-2 text-sm text-ink/60">View custom order requests</p>
        </Link>
      </div>

      <div className="mt-8 rounded-xl border border-ink/10 p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-ink/50">
          Membership
        </p>
        <p className="mt-2 text-sm text-ink/70">
          Status:{" "}
          <span className="font-medium text-ink">
            {membership?.status ?? (user.role === "ADMIN" ? "ADMIN" : "—")}
          </span>
        </p>
      </div>

      <Link
        href="/dashboard/account"
        className="mt-4 block rounded-xl border border-ink/10 p-6 hover:border-ink/30"
      >
        <p className="text-sm font-semibold uppercase tracking-wide text-ink/50">
          Account
        </p>
        <p className="mt-2 text-sm text-ink/70">Change your password</p>
      </Link>
    </div>
  );
}
