"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit";

const inviteSchema = z.object({
  email: z.string().email(),
});

export async function createInvitation(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = inviteSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { ok: false, error: "Enter a valid email address." };

  const email = parsed.data.email.toLowerCase();

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return { ok: false, error: "An account with this email already exists." };

  const existingPending = await prisma.invitation.findFirst({
    where: { email, status: "PENDING", expiresAt: { gt: new Date() } },
  });
  if (existingPending) return { ok: false, error: "There's already a pending invitation for this email." };

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invitation = await prisma.invitation.create({
    data: { email, invitedById: admin.id, expiresAt },
  });

  await logAdminAction({
    actorId: admin.id,
    action: "invitation.create",
    targetType: "Invitation",
    targetId: invitation.id,
    metadata: { email },
  });

  revalidatePath("/admin/access");
  return { ok: true, code: invitation.code };
}

export async function revokeInvitation(invitationId: string) {
  const admin = await requireAdmin();
  await prisma.invitation.update({ where: { id: invitationId }, data: { status: "REVOKED" } });
  await logAdminAction({
    actorId: admin.id,
    action: "invitation.revoke",
    targetType: "Invitation",
    targetId: invitationId,
  });
  revalidatePath("/admin/access");
}
