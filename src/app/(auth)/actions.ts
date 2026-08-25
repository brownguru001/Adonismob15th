"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { checkRateLimit, isRateLimited, recordFailedAttempt, getClientIp } from "@/lib/rate-limit";

const redeemSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(2).max(100),
  password: z.string().min(8).max(72),
});

/**
 * The only way an account can be created on this platform. There is no
 * public registration — a code only exists because an admin issued it via
 * the Access section, and it's single-use and expiring.
 */
export async function redeemInvitation(
  formData: FormData
): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  const ip = await getClientIp();
  const limited = checkRateLimit(`redeem-invite:${ip}`, 10, 60 * 60 * 1000);
  if (!limited.ok) return { ok: false, error: limited.error };

  const parsed = redeemSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Please check your details — password must be at least 8 characters." };
  }

  const invitation = await prisma.invitation.findUnique({ where: { code: parsed.data.code } });
  if (!invitation || invitation.status !== "PENDING" || invitation.expiresAt < new Date()) {
    return { ok: false, error: "This invitation is invalid or has expired." };
  }

  const email = invitation.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.$transaction([
    prisma.user.create({
      data: {
        name: parsed.data.name,
        email,
        passwordHash,
        role: "MEMBER",
        membership: {
          create: {
            status: "VERIFIED",
            verifiedAt: new Date(),
            verifiedById: invitation.invitedById,
            note: "Joined via invitation.",
          },
        },
      },
    }),
    prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
    }),
  ]);

  return { ok: true, email };
}

const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function loginCustomer(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const emailKey = `login-email:${email.toLowerCase()}`;

  const ip = await getClientIp();
  const ipKey = `login-ip:${ip}`;

  // Peek rather than consume-and-check — a run of correct passwords (e.g.
  // someone genuinely re-authenticating several times) must never count
  // toward a limit meant to slow down guessing. Only a failed attempt below
  // actually records against either bucket.
  if (isRateLimited(ipKey, 20)) {
    return { ok: false, error: "Too many requests. Please wait a moment and try again." };
  }
  if (isRateLimited(emailKey, 5)) {
    return { ok: false, error: "Too many failed attempts for this account. Please wait a few minutes." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      recordFailedAttempt(ipKey, LOGIN_WINDOW_MS);
      recordFailedAttempt(emailKey, LOGIN_WINDOW_MS);
      return { ok: false, error: "Invalid email or password." };
    }
    throw error;
  }
}
