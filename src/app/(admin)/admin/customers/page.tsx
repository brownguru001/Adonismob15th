import { prisma } from "@/lib/prisma";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true, customOrders: true } }, membership: true },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Customers</h1>

      <div className="mt-6 overflow-x-auto rounded-xl border border-ink/10 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/40">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Custom Orders</th>
              <th className="px-4 py-3">Membership</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {customers.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-ink/70">{c.email}</td>
                <td className="px-4 py-3 text-ink/70">{c._count.orders}</td>
                <td className="px-4 py-3 text-ink/70">{c._count.customOrders}</td>
                <td className="px-4 py-3 text-ink/70">{c.membership?.status ?? "—"}</td>
                <td className="px-4 py-3 text-ink/50">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && <p className="p-8 text-center text-ink/40">No customers yet.</p>}
      </div>
    </div>
  );
}
