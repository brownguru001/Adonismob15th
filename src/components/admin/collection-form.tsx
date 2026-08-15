"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";
import { createCollection } from "@/app/(admin)/admin/collections/actions";

export function CollectionForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [coverImage, setCoverImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Upload failed");
        return;
      }
      setCoverImage(data.url);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      action={(formData) => {
        formData.set("coverImage", coverImage);
        startTransition(async () => {
          const result = await createCollection(formData);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Collection created");
          router.push("/admin/collections");
          router.refresh();
        });
      }}
      className="space-y-4"
    >
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">Name</label>
        <input name="name" required className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">Description</label>
        <textarea name="description" rows={3} className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">Cover image</label>
        <div className="mt-2 flex items-center gap-3">
          {coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImage} alt="" className="h-16 w-24 rounded-lg object-cover" />
          )}
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-lg border border-dashed border-ink/25 px-4 py-2 text-xs text-ink/50"
          >
            <UploadCloud className="h-4 w-4" /> {uploading ? "Uploading..." : coverImage ? "Replace" : "Upload"}
          </button>
        </div>
        <input ref={fileInput} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">Start date</label>
          <input name="startDate" type="date" className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">End date</label>
          <input name="endDate" type="date" className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <select name="visibility" defaultValue="PUBLIC" className="rounded-lg border border-ink/15 px-3 py-2 text-sm">
          <option value="PUBLIC">Public</option>
          <option value="MEMBERS_ONLY">Members Only</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input name="featured" type="checkbox" className="h-4 w-4" /> Featured
        </label>
      </div>
      <button
        disabled={isPending || uploading}
        className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bone hover:bg-ink-soft disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Create collection"}
      </button>
    </form>
  );
}
