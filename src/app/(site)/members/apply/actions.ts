"use server";

import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export async function applyForMembership(formData: FormData) {
  const user = await requireUser();
  const note = (formData.get("note") as string | null)?.slice(0, 1000) || null;

  const existing = await prisma.membership.findUnique({ where: { userId: user.id } });
  if (existing) {
    return { ok: false, error: "You've already applied for membership." };
  }

  await prisma.membership.create({
    data: { userId: user.id, status: "PENDING", note },
  });

  return { ok: true };
}
