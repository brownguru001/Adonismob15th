import { prisma } from "@/lib/prisma";
import { SupplierForm } from "@/components/admin/supplier-form";
import { SupplierStatusToggle } from "@/components/admin/supplier-status-toggle";

export default async function AdminSuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { productionOrders: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Suppliers</h1>
      <p className="mt-1 text-sm text-bone/50">
        Verified commercial printing partners used for production until in-house equipment is in place.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {suppliers.map((s) => (
            <div key={s.id} className="rounded-xl border border-bone/10 bg-ink-soft p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{s.name}</p>
                <SupplierStatusToggle supplierId={s.id} status={s.status} />
              </div>
              <p className="mt-1 text-xs text-bone/50">
                {s.location ?? "No location"} &middot; {s._count.productionOrders} orders assigned
              </p>
              {s.services && <p className="mt-1 text-xs text-bone/60">{s.services}</p>}
            </div>
          ))}
          {suppliers.length === 0 && <p className="text-bone/40">No suppliers yet.</p>}
        </div>

        <div className="h-fit rounded-xl border border-bone/10 bg-ink-soft p-6">
          <p className="text-sm font-semibold">New supplier</p>
          <div className="mt-4">
            <SupplierForm />
          </div>
        </div>
      </div>
    </div>
  );
}
