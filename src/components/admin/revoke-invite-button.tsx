"use client";

import { useTransition } from "react";
import { revokeInvitation } from "@/app/(admin)/admin/access/actions";

export function RevokeInviteButton({ invitationId }: { invitationId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => revokeInvitation(invitationId))}
      disabled={isPending}
      className="text-xs text-bone/40 underline hover:text-clay"
    >
      Revoke
    </button>
  );
}
