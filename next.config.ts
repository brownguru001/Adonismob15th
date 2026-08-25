import type { NextConfig } from "next";

// 'unsafe-inline' on script-src/style-src is a real gap, not an oversight —
// Next.js App Router streams small inline bootstrap scripts (RSC payload
// chunks) that a strict script-src would block outright; removing this
// requires per-request nonces threaded through middleware, which is a
// separate, larger change. Everything else here is as tight as the app
// actually needs: no external script/frame/object sources, images limited
// to the app itself plus the two demo photo hosts already allowlisted for
// next/image, and no cross-origin fetches since every client-side fetch()
// in this codebase targets same-origin API routes.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://picsum.photos https://*.public.blob.vercel-storage.com",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: CSP },
  // No `preload`: submitting to browsers' built-in preload list is a
  // separate, essentially permanent step (removal takes months to
  // propagate) — worth doing deliberately once you're on a stable custom
  // domain, not as a side effect of this header existing.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
