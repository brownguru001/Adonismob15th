"use server";

import { z } from "zod";
import { requireUser } from "@/lib/authz";
import { changeOwnPassword, PasswordChangeError } from "@/lib/account";
import { checkRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(72),
});

// Shared by both the admin settings page and the member account page —
// requireUser() accepts either role, and ownership is implicit since the
// action only ever updates the caller's own row.
export async function updateOwnPassword(
  formData: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireUser();

  const limited = checkRateLimit(`change-password:${user.id}`, 5, 15 * 60 * 1000);
  if (!limited.ok) return { ok: false, error: limited.error };

  const parsed = schema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) {
    return { ok: false, error: "New password must be at least 8 characters." };
  }
  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return { ok: false, error: "New password must be different from your current password." };
  }

  try {
    await changeOwnPassword(user.id, parsed.data.currentPassword, parsed.data.newPassword);
    return { ok: true };
  } catch (err) {
    if (err instanceof PasswordChangeError) {
      return { ok: false, error: err.message };
    }
    throw err;
  }
}
