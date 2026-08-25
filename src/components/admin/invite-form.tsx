"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createInvitation } from "@/app/(admin)/admin/access/actions";

export function InviteForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [link, setLink] = useState<string | null>(null);

  return (
    <div>
      <form
        action={(formData) => {
          setLink(null);
          startTransition(async () => {
            const result = await createInvitation(formData);
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            const url = `${window.location.origin}/invite/${result.code}`;
            setLink(url);
            toast.success("Invitation created");
            router.refresh();
          });
        }}
        className="flex gap-3"
      >
        <input
          name="email"
          type="email"
          required
          placeholder="email@example.com"
          className="flex-1 rounded-lg border border-bone/15 px-3 py-2 text-sm"
        />
        <button
          disabled={isPending}
          className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-bone hover:bg-ink-soft disabled:opacity-50"
        >
          {isPending ? "Sending..." : "Invite"}
        </button>
      </form>
      {link && (
        <div className="mt-3 rounded-lg bg-ink-soft p-3 text-xs text-bone/70">
          <p>Share this link with them — it expires in 7 days:</p>
          <p className="mt-1 break-all font-mono text-bone">{link}</p>
        </div>
      )}
    </div>
  );
}
