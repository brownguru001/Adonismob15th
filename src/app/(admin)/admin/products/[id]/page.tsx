import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { updateProduct } from "@/app/(admin)/admin/products/actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, collections, designs] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { variants: true } }),
    prisma.collection.findMany({ orderBy: { name: "asc" } }),
    prisma.design.findMany({ orderBy: { title: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-semibold">Edit Product</h1>
      <div className="mt-6 rounded-xl border border-bone/10 bg-ink-soft p-6">
        <ProductForm
          initial={{
            name: product.name,
            description: product.description,
            category: product.category,
            price: Number(product.price),
            cost: Number(product.cost),
            careInfo: product.careInfo ?? "",
            images: product.images,
            featured: product.featured,
            isPreOrder: product.isPreOrder,
            preOrderClosesAt: product.preOrderClosesAt
              ? product.preOrderClosesAt.toISOString().slice(0, 10)
              : "",
            dropQuantityLimit: product.dropQuantityLimit,
            collectionId: product.collectionId ?? "",
            designId: product.designId ?? "",
            variants: product.variants.map((v) => ({
              size: v.size,
              color: v.color,
              stock: v.stock,
              priceDelta: Number(v.priceDelta),
            })),
          }}
          collections={collections}
          designs={designs}
          onSubmit={updateProduct.bind(null, product.id)}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
