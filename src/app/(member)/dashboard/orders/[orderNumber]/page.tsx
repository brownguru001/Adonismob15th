import { notFound } from "next/navigation";
import { requireMember } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/utils";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const user = await requireMember();

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: { include: { product: true, variant: true } },
      statusEvents: { orderBy: { createdAt: "asc" } },
      address: true,
      productionOrder: true,
    },
  });

  // IDOR guard: an order number alone must never expose someone else's order.
  if (!order || (order.userId !== user.id && user.role !== "ADMIN")) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-bone/50">Order</p>
      <h1 className="font-display text-2xl font-semibold">{order.orderNumber}</h1>
      <p className="mt-1 text-sm text-bone/60">
        Placed {new Date(order.createdAt).toLocaleDateString()}
      </p>

      <div className="mt-8 rounded-xl border border-bone/10 p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-bone/50">Timeline</p>
        <div className="mt-4 space-y-3">
          {order.statusEvents.map((event) => (
            <div key={event.id} className="flex items-start gap-3 text-sm">
              <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
              <div>
                <p className="font-medium text-bone">{event.status.replace("_", " ")}</p>
                {event.note && <p className="text-bone/50">{event.note}</p>}
                <p className="text-xs text-bone/40">{new Date(event.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 divide-y divide-ink/10 rounded-xl border border-bone/10">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 text-sm">
            <div>
              <p className="font-medium">{item.product.name}</p>
              <p className="text-xs text-bone/50">
                {item.variant.size}/{item.variant.color} &times; {item.quantity}
              </p>
            </div>
            <p className="font-semibold">{formatNaira(item.lineTotal)}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-bone/10 p-6 text-sm">
        <div className="flex justify-between text-bone/70">
          <span>Subtotal</span>
          <span>{formatNaira(order.subtotal)}</span>
        </div>
        <div className="flex justify-between text-bone/70">
          <span>Shipping</span>
          <span>{formatNaira(order.shippingFee)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-bone/10 pt-2 text-base font-semibold">
          <span>Total</span>
          <span>{formatNaira(order.total)}</span>
        </div>
      </div>

      {order.address && (
        <div className="mt-6 rounded-xl border border-bone/10 p-6 text-sm text-bone/70">
          <p className="text-sm font-semibold uppercase tracking-wide text-bone/50">Delivery to</p>
          <p className="mt-2">{order.address.fullName}</p>
          <p>{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}</p>
          <p>{order.address.city}, {order.address.state}</p>
          <p>{order.address.phone}</p>
        </div>
      )}
    </div>
  );
}
