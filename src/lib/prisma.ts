import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Supabase's Session pooler (required here — see .env.example) caps
// concurrent clients much lower than Transaction mode. Each serverless
// instance gets its own pool, and pg.Pool defaults to max:10 — a handful
// of concurrent Vercel invocations could each open up to 10 connections
// and exhaust that cap on their own, independent of real traffic volume.
// Keeping each instance's pool small leaves room for other instances
// (and for `prisma migrate deploy` during the next build) to connect.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: 3,
  idleTimeoutMillis: 10_000,
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
