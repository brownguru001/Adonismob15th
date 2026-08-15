"use client";

import { useTransition } from "react";
import { markMessageRead } from "@/app/(admin)/admin/messages/actions";

export function MessageReadButton({ id, isRead }: { id: string; isRead: boolean }) {
  const [isPending, startTransition] = useTransition();

  if (isRead) return <span className="text-xs text-ink/30">Read</span>;

  return (
    <button
      onClick={() => startTransition(() => markMessageRead(id))}
      disabled={isPending}
      className="text-xs text-ink/50 underline hover:text-ink"
    >
      Mark as read
    </button>
  );
}
