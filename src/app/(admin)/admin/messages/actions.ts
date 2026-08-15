"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export async function markMessageRead(messageId: string) {
  await requireAdmin();
  await prisma.contactMessage.update({ where: { id: messageId }, data: { isRead: true } });
  revalidatePath("/admin/messages");
}
