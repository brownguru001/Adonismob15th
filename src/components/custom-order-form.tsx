"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadCloud, X } from "lucide-react";
import { submitCustomOrder } from "@/app/(site)/custom-orders/actions";

export function CustomOrderForm() {
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files.slice(0, 6 - images.length)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/uploads", { method: "POST", body: formData });
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
        images.forEach((url) => formData.append("referenceImages", url));
        startTransition(async () => {
          const result = await submitCustomOrder(formData);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Custom order request submitted");
          router.push(`/custom-orders/${result.id}`);
        });
      }}
      className="space-y-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">
            Product type
          </label>
          <input
            name="productType"
            required
            placeholder="e.g. Hoodie, T-shirt, Cap"
            className="mt-2 w-full rounded-lg border border-ink/15 px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">
            Quantity
          </label>
          <input
            name="quantity"
            type="number"
            min={1}
            max={500}
            defaultValue={1}
            required
            className="mt-2 w-full rounded-lg border border-ink/15 px-4 py-3 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Sizes needed
        </label>
        <input
          name="sizes"
          required
          placeholder="e.g. 2x M, 3x L"
          className="mt-2 w-full rounded-lg border border-ink/15 px-4 py-3 text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Color preference
        </label>
        <input
          name="colorPreference"
          placeholder="e.g. Black with gold print"
          className="mt-2 w-full rounded-lg border border-ink/15 px-4 py-3 text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Design notes / instructions
        </label>
        <textarea
          name="designNotes"
          required
          rows={5}
          placeholder="Describe the design, placement, text/customization, and any other instructions."
          className="mt-2 w-full rounded-lg border border-ink/15 px-4 py-3 text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Reference artwork (optional, up to 6 images)
        </label>
        <div className="mt-2 flex flex-wrap gap-3">
          {images.map((url) => (
            <div key={url} className="relative h-20 w-20 overflow-hidden rounded-lg border border-ink/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="Reference" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((u) => u !== url))}
                className="absolute right-1 top-1 rounded-full bg-ink/70 p-0.5 text-bone"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {images.length < 6 && (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-ink/25 text-ink/40 hover:border-ink/50"
            >
              <UploadCloud className="h-5 w-5" />
              <span className="text-[10px]">{uploading ? "Uploading..." : "Add image"}</span>
            </button>
          )}
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <button
        disabled={isPending || uploading}
        className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bone hover:bg-ink-soft disabled:opacity-50"
      >
        {isPending ? "Submitting..." : "Submit custom order request"}
      </button>
    </form>
  );
}
