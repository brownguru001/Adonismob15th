"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

const contactSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  subject: z.string().min(1).max(150),
  message: z.string().min(1).max(3000),
});

export async function submitContactMessage(formData: FormData) {
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
