import type { Metadata } from "next";
import { getShopProducts, getProductCategories, type ShopFilters } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { ShopFiltersBar } from "@/components/shop-filters";

export const metadata: Metadata = {
  title: "Products",
  robots: { index: false, follow: false },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const filters: ShopFilters = {
    q: params.q,
    category: params.category,
    size: params.size,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    sort: (params.sort as ShopFilters["sort"]) ?? "newest",
  };

  const [products, categories] = await Promise.all([
    getShopProducts(filters),
    getProductCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-semibold">Products</h1>
        <p className="mt-2 text-bone/60">{products.length} products</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <ShopFiltersBar categories={categories} current={params} />
        <div>
          {products.length === 0 ? (
            <p className="py-20 text-center text-bone/50">
              No products match those filters.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{ ...product, price: product.price.toString() }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
