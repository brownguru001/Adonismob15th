import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/utils";
import { RevenueLineChart, OrdersByStatusChart } from "@/components/admin/analytics-charts";

const PAID_STATUSES = ["PAID", "PROCESSING", "PRODUCTION", "READY", "SHIPPED", "DELIVERED"] as const;

export default async function AdminAnalyticsPage() {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [paidOrders, allOrders, ordersByStatusRaw, customOrdersByStatusRaw, customerOrderCounts] =
    await Promise.all([
      prisma.order.findMany({
        where: { status: { in: [...PAID_STATUSES] }, createdAt: { gte: since } },
        select: { total: true, createdAt: true },
      }),
      prisma.order.findMany({
        where: {},
        select: { subtotal: true, status: true },
      }),
      prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.customOrder.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.order.groupBy({ by: ["userId"], _count: { _all: true } }),
    ]);

  const revenueByDay = new Map<string, number>();
  for (const o of paidOrders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + Number(o.total));
  }
  const revenueSeries = Array.from(revenueByDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({ date: date.slice(5), revenue }));

  const totalRevenue = paidOrders.reduce((s, o) => s + Number(o.total), 0);
  const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

  const paidCount = allOrders.filter((o) => (PAID_STATUSES as readonly string[]).includes(o.status)).length;
  const conversionRate = allOrders.length > 0 ? (paidCount / allOrders.length) * 100 : 0;

  const repeatCustomers = customerOrderCounts.filter((c) => c._count._all > 1).length;
  const repeatRate = customerOrderCounts.length > 0 ? (repeatCustomers / customerOrderCounts.length) * 100 : 0;

  // Gross contribution: revenue minus stored product cost, for internal eyes only.
  const orderItemsForMargin = await prisma.orderItem.findMany({
    where: { order: { status: { in: [...PAID_STATUSES] } } },
    include: { product: true },
  });
  const grossContribution = orderItemsForMargin.reduce(
    (sum, item) => sum + (Number(item.unitPrice) - Number(item.product.cost)) * item.quantity,
    0
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Analytics</h1>
      <p className="mt-1 text-sm text-ink/50">
        Live figures from the database — no fabricated numbers. Values will
        be small until real orders accumulate.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Revenue (30d)", value: formatNaira(totalRevenue) },
          { label: "Avg. order value", value: formatNaira(avgOrderValue) },
          { label: "Conversion rate", value: `${conversionRate.toFixed(1)}%` },
          { label: "Repeat customers", value: `${repeatRate.toFixed(1)}%` },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-ink/10 bg-white p-5">
            <p className="text-xs text-ink/50">{c.label}</p>
            <p className="mt-1 text-xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-ink/10 bg-white p-6">
          <p className="text-sm font-semibold">Revenue, last 30 days</p>
          <div className="mt-4">
            <RevenueLineChart data={revenueSeries} />
          </div>
        </div>
        <div className="rounded-xl border border-ink/10 bg-white p-6">
          <p className="text-sm font-semibold">Orders by status</p>
          <div className="mt-4">
            <OrdersByStatusChart
              data={ordersByStatusRaw.map((o) => ({ status: o.status.replace("_", " "), count: o._count._all }))}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-ink/10 bg-white p-6">
          <p className="text-sm font-semibold">Custom order funnel</p>
          <div className="mt-4 space-y-2 text-sm">
            {customOrdersByStatusRaw.map((c) => (
              <div key={c.status} className="flex justify-between">
                <span>{c.status.replace(/_/g, " ")}</span>
                <span className="text-ink/50">{c._count._all}</span>
              </div>
            ))}
            {customOrdersByStatusRaw.length === 0 && <p className="text-ink/40">No custom orders yet.</p>}
          </div>
        </div>
        <div className="rounded-xl border border-ink/10 bg-white p-6">
          <p className="text-sm font-semibold">Gross contribution (internal)</p>
          <p className="mt-2 text-xs text-ink/50">
            Revenue minus stored product cost across paid orders. Never shown to customers.
          </p>
          <p className="mt-4 text-2xl font-semibold">{formatNaira(grossContribution)}</p>
        </div>
      </div>
    </div>
  );
}
