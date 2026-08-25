import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { DesignForm } from "@/components/admin/design-form";
import { DesignStatusSelect } from "@/components/admin/design-status-select";

export default async function AdminDesignsPage() {
  const [designs, collections] = await Promise.all([
    prisma.design.findMany({ orderBy: { createdAt: "desc" }, include: { collection: true, products: true } }),
    prisma.collection.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Designs</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {designs.map((d) => (
            <div key={d.id} className="flex items-center gap-4 rounded-xl border border-bone/10 bg-ink-soft p-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-ink-soft">
                <Image src={d.imageUrl} alt={d.title} fill className="object-cover" sizes="64px" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{d.title}</p>
                <p className="text-xs text-bone/50">
                  {d.collection?.name ?? "No collection"} &middot; {d.products.length} products
                </p>
              </div>
              <DesignStatusSelect designId={d.id} status={d.status} />
            </div>
          ))}
          {designs.length === 0 && <p className="text-bone/40">No designs yet.</p>}
        </div>

        <div className="h-fit rounded-xl border border-bone/10 bg-ink-soft p-6">
          <p className="text-sm font-semibold">New design</p>
          <div className="mt-4">
            <DesignForm collections={collections} />
          </div>
        </div>
      </div>
    </div>
  );
}
