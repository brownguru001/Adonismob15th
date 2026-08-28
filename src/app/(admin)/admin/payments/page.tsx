import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/utils";

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-ink-soft text-bone/60",
  SUCCESSFUL: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-bone/10 text-bone/60",
};

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: { include: { user: true } },
      customOrder: { include: { user: true } },
    },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Payments</h1>
      <p className="mt-1 text-sm text-bone/50">
        Every payment is verified server-side against Flutterwave before an order is marked paid.
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-bone/10 bg-ink-soft">
        <table className="w-full text-sm">
          <thead className="border-b border-bone/10 text-left text-xs uppercase tracking-wide text-bone/40">
            <tr>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-mono text-xs text-bone/60">{p.txRef}</td>
                <td className="px-4 py-3">
                  {p.order ? (
                    <Link href={`/admin/orders/${p.orderId}`} className="hover:text-gold">
                      {p.order.orderNumber}
                    </Link>
                  ) : p.customOrder ? (
                    <Link href={`/admin/custom-orders/${p.customOrderId}`} className="hover:text-gold">
                      Custom order
                    </Link>
                  ) : (
                    <span className="text-bone/40">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-bone/70">{p.order?.user.name ?? p.customOrder?.user.name ?? "—"}</td>
                <td className="px-4 py-3">{formatNaira(p.amount)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs ${STATUS_COLOR[p.status]}`}>{p.status}</span>
                </td>
                <td className="px-4 py-3 text-bone/50">{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && <p className="p-8 text-center text-bone/40">No payments yet.</p>}
      </div>
    </div>
  );
}
