"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  subject: z.string().min(1).max(150),
  message: z.string().min(1).max(3000),
});

export async function submitContactMessage(formData: FormData) {
  const ip = await getClientIp();
  const limited = checkRateLimit(`contact:${ip}`, 5, 60 * 60 * 1000);
  if (!limited.ok) return { ok: false, error: limited.error };

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Please fill in all fields with a valid email." };
  }

  await prisma.contactMessage.create({ data: parsed.data });
  return { ok: true };
}
