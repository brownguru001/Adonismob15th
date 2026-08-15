import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/utils";

async function getStats() {
  const [
    revenueAgg,
    orderCount,
    customerCount,
    verifiedMemberCount,
    productCount,
    pendingOrders,
    productionOrders,
    pendingCustomOrders,
    lowStockVariants,
    recentOrders,
    recentCustomOrders,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ["PAID", "PROCESSING", "PRODUCTION", "READY", "SHIPPED", "DELIVERED"] } },
    }),
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.membership.count({ where: { status: "VERIFIED" } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count({ where: { status: "PENDING_PAYMENT" } }),
    prisma.order.count({ where: { status: "PRODUCTION" } }),
    prisma.customOrder.count({
      where: { status: { in: ["SUBMITTED", "REVIEWING", "QUOTE_SENT"] } },
    }),
    prisma.productVariant.findMany({
      where: { stock: { lte: 3 } },
      include: { product: true },
      take: 5,
      orderBy: { stock: "asc" },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: true },
    }),
    prisma.customOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: true },
    }),
  ]);

  const bestSellers = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });
  const bestSellerProducts = await prisma.product.findMany({
    where: { id: { in: bestSellers.map((b) => b.productId) } },
  });

  return {
    revenue: revenueAgg._sum.total ?? 0,
    orderCount,
    customerCount,
    verifiedMemberCount,
    productCount,
    pendingOrders,
    productionOrders,
    pendingCustomOrders,
    lowStockVariants,
    recentOrders,
    recentCustomOrders,
    bestSellers: bestSellers.map((b) => ({
      product: bestSellerProducts.find((p) => p.id === b.productId),
      quantity: b._sum.quantity ?? 0,
    })),
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "Revenue (paid orders)", value: formatNaira(stats.revenue) },
    { label: "Total Orders", value: stats.orderCount },
    { label: "Customers", value: stats.customerCount },
    { label: "Verified Members", value: stats.verifiedMemberCount },
    { label: "Active Products", value: stats.productCount },
    { label: "Pending Payment", value: stats.pendingOrders },
    { label: "In Production", value: stats.productionOrders },
    { label: "Custom Requests Open", value: stats.pendingCustomOrders },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-sm text-ink/50">
        Demo data is seeded for demonstration — replace with real activity as
        orders come in.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-ink/10 bg-white p-5">
            <p className="text-xs text-ink/50">{card.label}</p>
            <p className="mt-1 text-xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-ink/10 bg-white p-6">
          <p className="text-sm font-semibold">Best-selling products</p>
          <div className="mt-4 space-y-3">
            {stats.bestSellers.length === 0 && (
              <p className="text-sm text-ink/40">No sales yet.</p>
            )}
            {stats.bestSellers.map((item) =>
              item.product ? (
                <div key={item.product.id} className="flex items-center justify-between text-sm">
                  <span>{item.product.name}</span>
                  <span className="text-ink/50">{item.quantity} sold</span>
                </div>
              ) : null
            )}
          </div>
        </div>

        <div className="rounded-xl border border-ink/10 bg-white p-6">
          <p className="text-sm font-semibold">Low stock alerts</p>
          <div className="mt-4 space-y-3">
            {stats.lowStockVariants.length === 0 && (
              <p className="text-sm text-ink/40">Nothing running low.</p>
            )}
            {stats.lowStockVariants.map((v) => (
              <div key={v.id} className="flex items-center justify-between text-sm">
                <span>
                  {v.product.name} ({v.size}/{v.color})
                </span>
                <span className={v.stock === 0 ? "text-red-600" : "text-clay"}>
                  {v.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-ink/10 bg-white p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Recent orders</p>
            <Link href="/admin/orders" className="text-xs text-ink/50 hover:text-ink">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {stats.recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between text-sm hover:text-gold"
              >
                <span>{order.orderNumber} &middot; {order.user.name}</span>
                <span className="text-ink/50">{order.status.replace("_", " ")}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-ink/10 bg-white p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Recent custom requests</p>
            <Link href="/admin/custom-orders" className="text-xs text-ink/50 hover:text-ink">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {stats.recentCustomOrders.map((req) => (
              <Link
                key={req.id}
                href={`/admin/custom-orders/${req.id}`}
                className="flex items-center justify-between text-sm hover:text-gold"
              >
                <span>{req.productType} &middot; {req.user.name}</span>
                <span className="text-ink/50">{req.status.replace("_", " ")}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
