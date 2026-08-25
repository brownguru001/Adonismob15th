import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/utils";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const statuses = [
    "PENDING_PAYMENT", "PAID", "PROCESSING", "PRODUCTION", "READY",
    "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED",
  ] as const;
  const activeStatus = statuses.find((s) => s === status);

  const orders = await prisma.order.findMany({
    where: activeStatus ? { status: activeStatus } : undefined,
    orderBy: { createdAt: "desc" },
    include: { user: true, items: true },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Orders</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/admin/orders" className={`rounded-full border px-3 py-1 text-xs ${!status ? "border-gold bg-gold text-ink" : "border-bone/20 text-bone/60"}`}>
          All
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`rounded-full border px-3 py-1 text-xs ${status === s ? "border-gold bg-gold text-ink" : "border-bone/20 text-bone/60"}`}
          >
            {s.replace("_", " ")}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-bone/10 bg-ink-soft">
        <table className="w-full text-sm">
          <thead className="border-b border-bone/10 text-left text-xs uppercase tracking-wide text-bone/40">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium hover:text-gold">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-bone/70">{order.user.name}</td>
                <td className="px-4 py-3 text-bone/70">{order.items.length}</td>
                <td className="px-4 py-3">{formatNaira(order.total)}</td>
                <td className="px-4 py-3 text-bone/70">{order.status.replace("_", " ")}</td>
                <td className="px-4 py-3 text-bone/50">{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-8 text-center text-bone/40">No orders found.</p>}
      </div>
    </div>
  );
}
