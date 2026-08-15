import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * All of these run server-side only (layouts, server actions, route handlers).
 * They are the single enforcement point for role/membership gating — client
 * code must never be trusted to hide unauthorized UI as the only protection.
 */

export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");
  return session.user;
}

export async function requireVerifiedMember() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "ADMIN") return session.user;
  if (session.user.membershipStatus !== "VERIFIED") redirect("/members/apply");
  return session.user;
}

export async function getOptionalUser() {
  const session = await auth();
  return session?.user ?? null;
}
