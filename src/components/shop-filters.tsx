"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export function ShopFiltersBar({
  categories,
  current,
}: {
  categories: string[];
  current: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [q, setQ] = useState(current.q ?? "");

  function updateParam(key: string, value: string | undefined) {
    const params = new URLSearchParams(
      Object.entries(current).filter(([, v]) => v) as [string, string][]
    );
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <aside className="space-y-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateParam("q", q || undefined);
        }}
      >
        <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Search
        </label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products"
          className="mt-2 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-ink"
        />
      </form>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Category
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={() => updateParam("category", undefined)}
            className={`rounded-full border px-3 py-1 text-xs ${
              !current.category ? "border-ink bg-ink text-bone" : "border-ink/20 text-ink/70"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => updateParam("category", cat)}
              className={`rounded-full border px-3 py-1 text-xs capitalize ${
                current.category === cat
                  ? "border-ink bg-ink text-bone"
                  : "border-ink/20 text-ink/70"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Size
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => updateParam("size", current.size === size ? undefined : size)}
              className={`h-8 w-10 rounded-lg border text-xs ${
                current.size === size
                  ? "border-ink bg-ink text-bone"
                  : "border-ink/20 text-ink/70"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Sort by
        </p>
        <select
          defaultValue={current.sort ?? "newest"}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="mt-2 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}
