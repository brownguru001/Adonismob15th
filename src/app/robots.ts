import type { MetadataRoute } from "next";

// This is a private, invite-only platform. There is nothing on it meant to
// be discoverable by search engines — disallow everything, and there is no
// sitemap.xml for the same reason.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", disallow: "/" }],
  };
}
