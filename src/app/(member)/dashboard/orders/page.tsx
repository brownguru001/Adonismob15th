import Link from "next/link";
import { requireMember } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  PENDING_PAYMENT: "bg-ink-soft text-bone/60",
  PAID: "bg-gold/20 text-gold",
  PROCESSING: "bg-gold/20 text-gold",
  PRODUCTION: "bg-gold/20 text-gold",
  READY: "bg-gold/20 text-gold",
  SHIPPED: "bg-bone/10 text-bone",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-red-100 text-red-700",
};

export default async function OrdersPage() {
  const user = await requireMember();
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold">Your Orders</h1>

      {orders.length === 0 ? (
        <p className="mt-8 text-bone/60">No orders yet.</p>
      ) : (
        <div className="mt-8 divide-y divide-ink/10">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.orderNumber}`}
              className="flex items-center justify-between py-5 hover:bg-ink-soft/40"
            >
              <div>
                <p className="text-sm font-medium">{order.orderNumber}</p>
                <p className="text-xs text-bone/50">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""} &middot;{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold">{formatNaira(order.total)}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[order.status]}`}>
                  {order.status.replace("_", " ")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
