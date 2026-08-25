import { prisma } from "@/lib/prisma";
import { RedeemInviteForm } from "@/components/redeem-invite-form";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Generous enough for a real invitee reloading their own link a few times,
// but caps how fast this page can be used to probe for valid codes — the
// lookup below discloses the invited email address on a hit, and this was
// previously the only invite-related endpoint with no rate limit at all
// (redemption itself was already limited).
const VIEW_LIMIT = 20;
const VIEW_WINDOW_MS = 60 * 60 * 1000;

function InvalidInvite() {
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

export default async function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const ip = await getClientIp();
  const limited = checkRateLimit(`invite-view:${ip}`, VIEW_LIMIT, VIEW_WINDOW_MS);
  if (!limited.ok) return <InvalidInvite />;

  const invitation = await prisma.invitation.findUnique({ where: { code } });

  if (!invitation || invitation.status !== "PENDING" || invitation.expiresAt < new Date()) {
    return <InvalidInvite />;
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
