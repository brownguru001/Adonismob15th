import { prisma } from "@/lib/prisma";
import { RedeemInviteForm } from "@/components/redeem-invite-form";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const invitation = await prisma.invitation.findUnique({ where: { code } });

  if (!invitation || invitation.status !== "PENDING" || invitation.expiresAt < new Date()) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold">Invitation not valid</h1>
        <p className="mt-2 text-sm text-ink/60">
          This invitation link is invalid, has already been used, or has
          expired. Contact whoever invited you for a new one.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">You&apos;ve been invited</h1>
      <p className="mt-2 text-sm text-ink/60">
        Set up your account for <span className="font-medium text-ink">{invitation.email}</span>.
      </p>
      <RedeemInviteForm code={code} />
    </div>
  );
}
