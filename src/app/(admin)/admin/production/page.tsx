import Link from "next/link";
import { prisma } from "@/lib/prisma";

const STAGES = [
  "QUEUED", "ASSIGNED", "PRINTING", "QUALITY_CHECK", "PACKED",
  "READY_FOR_DELIVERY", "SHIPPED", "DELIVERED",
];

export default async function AdminProductionPage() {
  const productionOrders = await prisma.productionOrder.findMany({
    orderBy: { updatedAt: "desc" },
    include: { order: { include: { user: true } }, supplier: true },
  });

  const grouped = STAGES.map((stage) => ({
    stage,
    orders: productionOrders.filter((p) => p.stage === stage),
  }));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Production Queue</h1>
      <p className="mt-1 text-sm text-bone/50">
        Every paid order enters the production pipeline here. Update stage and supplier from the order page.
      </p>

      <div className="mt-6 grid gap-4 overflow-x-auto pb-4 lg:grid-cols-4">
        {grouped.map((group) => (
          <div key={group.stage} className="min-w-[220px] rounded-xl border border-bone/10 bg-ink-soft p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-bone/50">
              {group.stage.replace(/_/g, " ")} ({group.orders.length})
            </p>
            <div className="mt-3 space-y-2">
              {group.orders.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/orders/${p.orderId}`}
                  className="block rounded-lg border border-bone/10 p-3 text-xs hover:border-bone/30"
                >
                  <p className="font-medium">{p.order.orderNumber}</p>
                  <p className="text-bone/50">{p.order.user.name}</p>
                  <p className="text-bone/40">{p.supplier?.name ?? "Unassigned"}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
