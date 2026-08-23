import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * All of these run server-side only (layouts, server actions, route handlers).
 * They are the single enforcement point for role/membership gating — client
 * code must never be trusted to hide unauthorized UI as the only protection.
 *
 * This is a private, invite-only platform: there is no public tier and no
 * self-service signup. An account only exists because an admin issued an
 * invitation and it was redeemed, so `membershipStatus` here is really an
 * access-control switch (ACTIVE vs SUSPENDED/REVOKED by an admin), not a
 * "pending approval" queue.
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

export async function requireMember() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "ADMIN") return session.user;
  if (session.user.membershipStatus !== "VERIFIED") redirect("/access-restricted");
  return session.user;
}

export async function getOptionalUser() {
  const session = await auth();
  return session?.user ?? null;
}
