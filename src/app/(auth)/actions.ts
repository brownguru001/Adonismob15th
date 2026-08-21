"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export async function registerCustomer(formData: FormData) {
  const ip = await getClientIp();
  const limited = checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
  if (!limited.ok) return { ok: false, error: limited.error };

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Please check your details — password must be at least 8 characters." };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
      role: "CUSTOMER",
    },
  });

  return { ok: true };
}

export async function loginCustomer(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const ip = await getClientIp();
  const ipLimited = checkRateLimit(`login-ip:${ip}`, 20, 15 * 60 * 1000);
  if (!ipLimited.ok) return { ok: false, error: ipLimited.error };
  const emailLimited = checkRateLimit(`login-email:${email.toLowerCase()}`, 5, 15 * 60 * 1000);
  if (!emailLimited.ok) return { ok: false, error: "Too many failed attempts for this account. Please wait a few minutes." };

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "Invalid email or password." };
    }
    throw error;
  }
}
