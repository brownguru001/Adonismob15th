import "server-only";
import { headers } from "next/headers";

/**
 * In-memory sliding-window rate limiter. Fine for a single-instance
 * deployment (which is what this prototype targets); if the app ever runs
 * on multiple instances/serverless, swap this for a shared store (Redis,
 * Upstash) since each instance would otherwise track its own counts.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

// Periodic cleanup so the map doesn't grow unbounded over a long-running process.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}, 5 * 60 * 1000).unref?.();

export async function getClientIp() {
  const hdrs = await headers();
  const forwardedFor = hdrs.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return hdrs.get("x-real-ip") ?? "unknown";
}

export type RateLimitResult = { ok: true } | { ok: false; error: string };

/**
 * @param key Identifies the bucket, e.g. `login:${ip}`.
 * @param limit Max requests allowed within the window.
 * @param windowMs Window size in milliseconds.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (bucket.count >= limit) {
    return { ok: false, error: "Too many requests. Please wait a moment and try again." };
  }

  bucket.count += 1;
  return { ok: true };
}
