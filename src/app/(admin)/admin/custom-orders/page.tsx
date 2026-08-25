import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminCustomOrdersPage() {
  const requests = await prisma.customOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Custom Orders</h1>

      <div className="mt-6 overflow-x-auto rounded-xl border border-bone/10 bg-ink-soft">
        <table className="w-full text-sm">
          <thead className="border-b border-bone/10 text-left text-xs uppercase tracking-wide text-bone/40">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {requests.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3">
                  <Link href={`/admin/custom-orders/${r.id}`} className="font-medium hover:text-gold">
                    {r.user.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-bone/70">{r.productType}</td>
                <td className="px-4 py-3 text-bone/70">{r.quantity}</td>
                <td className="px-4 py-3 text-bone/70">{r.status.replace("_", " ")}</td>
                <td className="px-4 py-3 text-bone/50">{new Date(r.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {requests.length === 0 && <p className="p-8 text-center text-bone/40">No custom order requests yet.</p>}
      </div>
    </div>
  );
}
