"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit";

const statusSchema = z.enum(["PENDING", "VERIFIED", "SUSPENDED", "REVOKED"]);

export async function updateMembershipStatus(membershipId: string, status: string) {
  const admin = await requireAdmin();
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) return { ok: false, error: "Invalid status." };

  await prisma.membership.update({
    where: { id: membershipId },
    data: {
      status: parsed.data,
      verifiedAt: parsed.data === "VERIFIED" ? new Date() : undefined,
      verifiedById: parsed.data === "VERIFIED" ? admin.id : undefined,
    },
  });

  await logAdminAction({
    actorId: admin.id,
    action: "membership.status_change",
    targetType: "Membership",
    targetId: membershipId,
    metadata: { status: parsed.data },
  });

  revalidatePath("/admin/members");
  return { ok: true };
}
