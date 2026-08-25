import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/utils";
import { ProductActiveToggle } from "@/components/admin/product-active-toggle";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { variants: true, collection: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bone hover:bg-ink-soft"
        >
          New product
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-bone/10 bg-ink-soft">
        <table className="w-full text-sm">
          <thead className="border-b border-bone/10 text-left text-xs uppercase tracking-wide text-bone/40">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Drop</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {products.map((p) => {
              const stock = p.variants.reduce((s, v) => s + v.stock, 0);
              return (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}`} className="font-medium hover:text-gold">
                      {p.name}
                    </Link>
                    {p.featured && <span className="ml-2 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] text-gold">Featured</span>}
                  </td>
                  <td className="px-4 py-3 capitalize text-bone/70">{p.category}</td>
                  <td className="px-4 py-3">{formatNaira(p.price)}</td>
                  <td className="px-4 py-3">{stock}</td>
                  <td className="px-4 py-3 text-bone/60">
                    {p.dropQuantityLimit !== null
                      ? `${p.dropQuantityRemaining}/${p.dropQuantityLimit}`
                      : p.isPreOrder
                        ? "Pre-order"
                        : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <ProductActiveToggle productId={p.id} isActive={p.isActive} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/products/${p.id}`} className="text-xs text-bone/50 hover:text-bone">
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-8 text-center text-bone/40">No products yet.</p>}
      </div>
    </div>
  );
}
