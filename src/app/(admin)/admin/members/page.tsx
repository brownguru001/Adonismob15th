import { prisma } from "@/lib/prisma";
import { MembershipStatusSelect } from "@/components/admin/membership-status-select";

export default async function AdminMembersPage() {
  const memberships = await prisma.membership.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Members</h1>
      <p className="mt-1 text-sm text-ink/50">
        Review applications and manage verified-member access to the Members Collection.
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-ink/10 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/40">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Note</th>
              <th className="px-4 py-3">Applied</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {memberships.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3 font-medium">{m.user.name}</td>
                <td className="px-4 py-3 text-ink/70">{m.user.email}</td>
                <td className="px-4 py-3 max-w-xs truncate text-ink/50">{m.note ?? "—"}</td>
                <td className="px-4 py-3 text-ink/50">{new Date(m.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <MembershipStatusSelect membershipId={m.id} status={m.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {memberships.length === 0 && <p className="p-8 text-center text-ink/40">No membership applications yet.</p>}
      </div>
    </div>
  );
}
