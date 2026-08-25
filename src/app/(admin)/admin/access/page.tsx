import { prisma } from "@/lib/prisma";
import { InviteForm } from "@/components/admin/invite-form";
import { RevokeInviteButton } from "@/components/admin/revoke-invite-button";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-ink-soft text-bone/60",
  ACCEPTED: "bg-green-100 text-green-700",
  EXPIRED: "bg-bone/10 text-bone/50",
  REVOKED: "bg-red-100 text-red-700",
};

export default async function AdminAccessPage() {
  const invitations = await prisma.invitation.findMany({
    orderBy: { createdAt: "desc" },
    include: { invitedBy: true },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Access</h1>
      <p className="mt-1 text-sm text-bone/50">
        This platform is invite-only. There is no public registration —
        invitations issued here are the only way an account gets created.
      </p>

      <div className="mt-6 rounded-xl border border-bone/10 bg-ink-soft p-6">
        <p className="text-sm font-semibold">New invitation</p>
        <div className="mt-4">
          <InviteForm />
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-bone/10 bg-ink-soft">
        <table className="w-full text-sm">
          <thead className="border-b border-bone/10 text-left text-xs uppercase tracking-wide text-bone/40">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Invited by</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {invitations.map((inv) => {
              const expired = inv.status === "PENDING" && inv.expiresAt < new Date();
              const status = expired ? "EXPIRED" : inv.status;
              return (
                <tr key={inv.id}>
                  <td className="px-4 py-3">{inv.email}</td>
                  <td className="px-4 py-3 text-bone/70">{inv.invitedBy.name}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs ${STATUS_STYLE[status]}`}>{status}</span>
                  </td>
                  <td className="px-4 py-3 text-bone/50">{inv.expiresAt.toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    {inv.status === "PENDING" && !expired && (
                      <RevokeInviteButton invitationId={inv.id} />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {invitations.length === 0 && <p className="p-8 text-center text-bone/40">No invitations yet.</p>}
      </div>
    </div>
  );
}
