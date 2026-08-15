"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadCloud, X, Plus, Trash2 } from "lucide-react";

type Variant = { size: string; color: string; stock: number; priceDelta: number };

export type ProductFormValue = {
  name: string;
  description: string;
  category: string;
  price: number;
  cost: number;
  careInfo: string;
  images: string[];
  visibility: "PUBLIC" | "MEMBERS_ONLY";
  featured: boolean;
  collectionId: string;
  designId: string;
  variants: Variant[];
};

export function ProductForm({
  initial,
  collections,
  designs,
  onSubmit,
  submitLabel,
}: {
  initial?: Partial<ProductFormValue>;
  collections: { id: string; name: string }[];
  designs: { id: string; title: string }[];
  onSubmit: (formData: FormData) => Promise<{ ok: boolean; error?: string; id?: string }>;
  submitLabel: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [variants, setVariants] = useState<Variant[]>(
    initial?.variants ?? [{ size: "M", color: "Black", stock: 10, priceDelta: 0 }]
  );
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/uploads", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error ?? "Upload failed");
          continue;
        }
        setImages((prev) => [...prev, data.url]);
      }
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <form
      action={(formData) => {
        formData.set("variants", JSON.stringify(variants));
        images.forEach((url) => formData.append("images", url));
        startTransition(async () => {
          const result = await onSubmit(formData);
          if (!result.ok) {
            toast.error(result.error ?? "Something went wrong.");
            return;
          }
          toast.success("Saved");
          router.push("/admin/products");
          router.refresh();
        });
      }}
      className="space-y-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">Name</label>
          <input
            name="name"
            required
            defaultValue={initial?.name}
            className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">Category</label>
          <input
            name="category"
            required
            defaultValue={initial?.category}
            placeholder="e.g. hoodie, tshirt, cap"
            className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">Description</label>
        <textarea
          name="description"
          required
          rows={4}
          defaultValue={initial?.description}
          className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">Price (NGN)</label>
          <input
            name="price"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={initial?.price}
            className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">
            Cost (internal)
          </label>
          <input
            name="cost"
            type="number"
            min={0}
            step="0.01"
            defaultValue={initial?.cost ?? 0}
            className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">Visibility</label>
          <select
            name="visibility"
            defaultValue={initial?.visibility ?? "PUBLIC"}
            className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
          >
            <option value="PUBLIC">Public</option>
            <option value="MEMBERS_ONLY">Members Only</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">Collection</label>
          <select
            name="collectionId"
            defaultValue={initial?.collectionId ?? ""}
            className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
          >
            <option value="">None</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">Design</label>
          <select
            name="designId"
            defaultValue={initial?.designId ?? ""}
            className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
          >
            <option value="">None</option>
            {designs.map((d) => (
              <option key={d.id} value={d.id}>{d.title}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2 pb-2">
          <input
            id="featured"
            name="featured"
            type="checkbox"
            defaultChecked={initial?.featured}
            className="h-4 w-4"
          />
          <label htmlFor="featured" className="text-sm">Featured</label>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">Care info</label>
        <input
          name="careInfo"
          defaultValue={initial?.careInfo}
          className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">Images</label>
        <div className="mt-2 flex flex-wrap gap-3">
          {images.map((url) => (
            <div key={url} className="relative h-20 w-20 overflow-hidden rounded-lg border border-ink/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((u) => u !== url))}
                className="absolute right-1 top-1 rounded-full bg-ink/70 p-0.5 text-bone"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
            className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-ink/25 text-ink/40"
          >
            <UploadCloud className="h-5 w-5" />
            <span className="text-[10px]">{uploading ? "Uploading..." : "Add"}</span>
          </button>
        </div>
        <input ref={fileInput} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">
            Variants (size / color / stock)
          </label>
          <button
            type="button"
            onClick={() => setVariants((prev) => [...prev, { size: "", color: "", stock: 0, priceDelta: 0 }])}
            className="flex items-center gap-1 text-xs text-ink/60 hover:text-ink"
          >
            <Plus className="h-3.5 w-3.5" /> Add variant
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2">
              <input
                placeholder="Size"
                value={v.size}
                onChange={(e) =>
                  setVariants((prev) => prev.map((p, idx) => (idx === i ? { ...p, size: e.target.value } : p)))
                }
                className="rounded-lg border border-ink/15 px-2 py-1.5 text-sm"
              />
              <input
                placeholder="Color"
                value={v.color}
                onChange={(e) =>
                  setVariants((prev) => prev.map((p, idx) => (idx === i ? { ...p, color: e.target.value } : p)))
                }
                className="rounded-lg border border-ink/15 px-2 py-1.5 text-sm"
              />
              <input
                type="number"
                placeholder="Stock"
                value={v.stock}
                onChange={(e) =>
                  setVariants((prev) =>
                    prev.map((p, idx) => (idx === i ? { ...p, stock: Number(e.target.value) } : p))
                  )
                }
                className="rounded-lg border border-ink/15 px-2 py-1.5 text-sm"
              />
              <input
                type="number"
                placeholder="+/- Price"
                value={v.priceDelta}
                onChange={(e) =>
                  setVariants((prev) =>
                    prev.map((p, idx) => (idx === i ? { ...p, priceDelta: Number(e.target.value) } : p))
                  )
                }
                className="rounded-lg border border-ink/15 px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={() => setVariants((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-ink/30 hover:text-clay"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        disabled={isPending || uploading}
        className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bone hover:bg-ink-soft disabled:opacity-50"
      >
        {isPending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
