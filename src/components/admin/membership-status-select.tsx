"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateMembershipStatus } from "@/app/(admin)/admin/members/actions";

const STATUSES = ["PENDING", "VERIFIED", "SUSPENDED", "REVOKED"] as const;

export function MembershipStatusSelect({ membershipId, status }: { membershipId: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) =>
        startTransition(async () => {
          const result = await updateMembershipStatus(membershipId, e.target.value);
          if (!result.ok) toast.error(result.error);
          else toast.success("Membership updated");
        })
      }
      className="rounded-full border border-bone/15 px-3 py-1.5 text-xs"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}
