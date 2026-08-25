import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // 30 days matches Auth.js's own default — made explicit so it's a
  // deliberate choice for a private membership site, not an implicit one.
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  // Required for self-hosted deployments behind a reverse proxy/load balancer
  // (Docker, VPS, etc.) where Auth.js can't otherwise verify the Host header
  // against a known deployment URL the way it can on Vercel.
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          include: { membership: true },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          membershipStatus: user.membership?.status ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = user.role;
        token.membershipStatus = user.membershipStatus;
      }
      // Refresh membership status on each session check so revocations take effect immediately.
      if (trigger === "update" || !user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          include: { membership: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.membershipStatus = dbUser.membership?.status ?? null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
        session.user.membershipStatus = token.membershipStatus as string | null;
      }
      return session;
    },
  },
});
