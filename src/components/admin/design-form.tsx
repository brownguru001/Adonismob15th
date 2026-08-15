"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";
import { createDesign } from "@/app/(admin)/admin/designs/actions";

export function DesignForm({ collections }: { collections: { id: string; name: string }[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState("");
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
      setImageUrl(data.url);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      action={(formData) => {
        formData.set("imageUrl", imageUrl);
        startTransition(async () => {
          const result = await createDesign(formData);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Design created");
          router.push("/admin/designs");
          router.refresh();
        });
      }}
      className="space-y-4"
    >
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">Title</label>
        <input name="title" required className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">Description</label>
        <textarea name="description" rows={3} className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">Artwork</label>
        <div className="mt-2 flex items-center gap-3">
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="h-16 w-16 rounded-lg object-cover" />
          )}
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-lg border border-dashed border-ink/25 px-4 py-2 text-xs text-ink/50"
          >
            <UploadCloud className="h-4 w-4" /> {uploading ? "Uploading..." : imageUrl ? "Replace" : "Upload image"}
          </button>
        </div>
        <input ref={fileInput} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">Status</label>
          <select name="status" defaultValue="DRAFT" className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm">
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">Visibility</label>
          <select name="visibility" defaultValue="PUBLIC" className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm">
            <option value="PUBLIC">Public</option>
            <option value="MEMBERS_ONLY">Members Only</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">Collection</label>
          <select name="collectionId" defaultValue="" className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm">
            <option value="">None</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>
      <button
        disabled={isPending || uploading || !imageUrl}
        className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bone hover:bg-ink-soft disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Create design"}
      </button>
    </form>
  );
}
