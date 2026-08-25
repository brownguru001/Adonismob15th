import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "@/app/(admin)/admin/products/actions";

export default async function NewProductPage() {
  const [collections, designs] = await Promise.all([
    prisma.collection.findMany({ orderBy: { name: "asc" } }),
    prisma.design.findMany({ orderBy: { title: "asc" } }),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-semibold">New Product</h1>
      <div className="mt-6 rounded-xl border border-bone/10 bg-ink-soft p-6">
        <ProductForm
          collections={collections}
          designs={designs}
          onSubmit={createProduct}
          submitLabel="Create product"
        />
      </div>
    </div>
  );
}
