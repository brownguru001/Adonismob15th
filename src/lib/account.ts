import "server-only";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export class PasswordChangeError extends Error {}

/**
 * Requires the current password before accepting a new one — a valid
 * session alone (which could come from a hijacked cookie) isn't sufficient
 * to authorize changing the credential that protects the account.
 */
export async function changeOwnPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new PasswordChangeError("Account not found.");

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new PasswordChangeError("Current password is incorrect.");

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}
