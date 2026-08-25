import { prisma } from "@/lib/prisma";
import { CollectionForm } from "@/components/admin/collection-form";

export default async function AdminCollectionsPage() {
  const collections = await prisma.collection.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Collections</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {collections.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl border border-bone/10 bg-ink-soft p-4">
              <div>
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-bone/50">{c._count.products} products</p>
              </div>
              {c.featured && <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] text-gold">Featured</span>}
            </div>
          ))}
          {collections.length === 0 && <p className="text-bone/40">No collections yet.</p>}
        </div>

        <div className="h-fit rounded-xl border border-bone/10 bg-ink-soft p-6">
          <p className="text-sm font-semibold">New collection</p>
          <div className="mt-4">
            <CollectionForm />
          </div>
        </div>
      </div>
    </div>
  );
}
