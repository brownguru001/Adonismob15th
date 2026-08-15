import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/utils";
import { OrderStatusControl } from "@/components/admin/order-status-control";
import { ProductionForm } from "@/components/admin/production-form";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, suppliers] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        address: true,
        items: { include: { product: true, variant: true } },
        payments: true,
        statusEvents: { orderBy: { createdAt: "asc" } },
        productionOrder: true,
      },
    }),
    prisma.supplier.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } }),
  ]);

  if (!order) notFound();

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Order</p>
          <h1 className="font-display text-2xl font-semibold">{order.orderNumber}</h1>
          <p className="text-sm text-ink/50">
            {order.user.name} &middot; {order.user.email}
          </p>
        </div>
        <OrderStatusControl orderId={order.id} status={order.status} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-ink/10 bg-white p-6">
          <p className="text-sm font-semibold">Items</p>
          <div className="mt-3 divide-y divide-ink/5 text-sm">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between py-2">
                <span>{item.product.name} ({item.variant.size}/{item.variant.color}) &times; {item.quantity}</span>
                <span>{formatNaira(item.lineTotal)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 border-t border-ink/10 pt-3 text-sm">
            <div className="flex justify-between text-ink/60"><span>Subtotal</span><span>{formatNaira(order.subtotal)}</span></div>
            <div className="flex justify-between text-ink/60"><span>Shipping</span><span>{formatNaira(order.shippingFee)}</span></div>
            <div className="flex justify-between font-semibold"><span>Total</span><span>{formatNaira(order.total)}</span></div>
          </div>
        </div>

        <div className="rounded-xl border border-ink/10 bg-white p-6">
          <p className="text-sm font-semibold">Payments</p>
          <div className="mt-3 space-y-2 text-sm">
            {order.payments.map((p) => (
              <div key={p.id} className="flex justify-between">
                <span className="font-mono text-xs text-ink/60">{p.txRef}</span>
                <span>{p.status}</span>
              </div>
            ))}
            {order.payments.length === 0 && <p className="text-ink/40">No payments recorded.</p>}
          </div>

          {order.address && (
            <>
              <p className="mt-6 text-sm font-semibold">Delivery address</p>
              <p className="mt-2 text-sm text-ink/70">
                {order.address.fullName}<br />
                {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}<br />
                {order.address.city}, {order.address.state}<br />
                {order.address.phone}
              </p>
            </>
          )}
        </div>

        <div className="rounded-xl border border-ink/10 bg-white p-6">
          <p className="text-sm font-semibold">Production</p>
          <div className="mt-3">
            <ProductionForm orderId={order.id} suppliers={suppliers} current={order.productionOrder} />
          </div>
        </div>

        <div className="rounded-xl border border-ink/10 bg-white p-6">
          <p className="text-sm font-semibold">Timeline</p>
          <div className="mt-3 space-y-2 text-sm">
            {order.statusEvents.map((e) => (
              <div key={e.id} className="flex justify-between">
                <span>{e.status.replace("_", " ")}</span>
                <span className="text-ink/40">{new Date(e.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
