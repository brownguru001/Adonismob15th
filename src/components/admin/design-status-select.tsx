"use client";

import { useTransition } from "react";
import { updateDesignStatus } from "@/app/(admin)/admin/designs/actions";

export function DesignStatusSelect({
  designId,
  status,
}: {
  designId: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) =>
        startTransition(() =>
          updateDesignStatus(designId, e.target.value as "DRAFT" | "PUBLISHED" | "ARCHIVED")
        )
      }
      className="rounded-full border border-ink/15 px-3 py-1.5 text-xs"
    >
      <option value="DRAFT">Draft</option>
      <option value="PUBLISHED">Published</option>
      <option value="ARCHIVED">Archived</option>
    </select>
  );
}
