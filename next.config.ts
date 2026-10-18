import type { NextConfig } from "next";

import { LEGACY_REDIRECTS } from "./src/lib/migration/legacy-redirects";
import {
  ALWAYS_NOINDEX_SOURCES,
  contentSecurityPolicy,
  NOINDEX_VALUE,
  SECURITY_HEADERS,
} from "./src/lib/security-headers";

/**
 * Host policy.
 *
 * `www.catalunyainfo.com` is the canonical host. The apex is redirected to it
 * permanently (308) rather than temporarily (307, which is what version 1
 * served), so that link equity consolidates on one host and browsers stop
 * re-asking on every visit.
 *
 * The apex -> www redirect is configured in Vercel's domain settings as well;
 * this rule is the belt to that braces, and it also covers custom preview
 * aliases.
 */
const APEX_HOST = "catalunyainfo.com";
const CANONICAL_HOST = "www.catalunyainfo.com";

/**
 * Indexing requires the production environment and the explicit switch,
 * evaluated at build time (Vercel exposes VERCEL_ENV to the build), plus a
 * request on the canonical host, evaluated per request with a `missing host`
 * condition below. A production build is also served on its *.vercel.app
 * alias with VERCEL_ENV=production; the host condition keeps that duplicate
 * out of the index.
 */
const INDEXING_ALLOWED =
  process.env.VERCEL_ENV === "production" && process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  /**
   * Every public URL ends in a slash. One spelling per URL means no duplicate
   * content, no redirect chains from the sitemap, and a canonical that always
   * matches what was crawled.
   */
  trailingSlash: true,

  typescript: { ignoreBuildErrors: false },

  images: {
    // AVIF first, WebP as the fallback: both are handled by Vercel's image
    // optimiser and keep LCP images small.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 420, 640, 828, 1080, 1200, 1600, 1920],
    imageSizes: [96, 160, 240, 320, 480],
    // Cache optimised variants for a month; content images are immutable once
    // uploaded because every upload gets a new key.
    minimumCacheTTL: 2592000,
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
    // Never let an SVG through the optimiser: they can carry script.
    dangerouslyAllowSVG: false,
  },

  experimental: {
    // Ship only the icons/components actually imported.
    optimizePackageImports: ["@/components"],
  },

  async redirects() {
    return [
      // Apex -> www, permanently.
      {
        source: "/:path*",
        has: [{ type: "host", value: APEX_HOST }],
        destination: `https://${CANONICAL_HOST}/:path*`,
        permanent: true,
      },
      // Legacy URLs from version 1. Generated from migration/redirects.csv,
      // which stays the source of truth down to the status code, so what an
      // auditor reads in the CSV is exactly what the edge serves.
      ...LEGACY_REDIRECTS.map((r) => ({
        source: r.from,
        destination: r.to,
        // 308, not 301. Next serves permanent redirects as 308 and Google
        // treats the two identically; migration/redirects.csv records 308 so
        // the audit artefact matches what the edge actually sends.
        permanent: true,
      })),
    ];
  },

  async rewrites() {
    // Internal search lives on a fixed route so that the public catch-all never
    // has to read `searchParams` — which would opt every content page into
    // dynamic rendering and give up CDN caching. The public URL stays
    // localised; only the internal route name is fixed.
    return [
      { source: "/ca/cerca/", destination: "/ca/internal-search/" },
      { source: "/es/buscar/", destination: "/es/internal-search/" },
      { source: "/en/search/", destination: "/en/internal-search/" },
    ];
  },

  async headers() {
    return [
      {
        // Generated feeds: short shared cache, long stale window, so a publish
        // is picked up quickly without hammering the function on every crawl.
        source: "/:path*(sitemap.*\\.xml|robots\\.txt)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        // The full security header set, statically: none of it varies per
        // request, so the proxy no longer has to run on every page for it.
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy(process.env.NODE_ENV !== "production") },
          ...Object.entries(SECURITY_HEADERS).map(([key, value]) => ({ key, value })),
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
      // Not indexable: any non-production build, any build without the
      // switch, and on production any host other than the canonical one.
      INDEXING_ALLOWED
        ? {
            source: "/:path*",
            missing: [{ type: "host" as const, value: CANONICAL_HOST }],
            headers: [{ key: "X-Robots-Tag", value: NOINDEX_VALUE }],
          }
        : { source: "/:path*", headers: [{ key: "X-Robots-Tag", value: NOINDEX_VALUE }] },
      ...ALWAYS_NOINDEX_SOURCES.map((source) => ({
        source,
        headers: [{ key: "X-Robots-Tag", value: NOINDEX_VALUE }],
      })),
      {
        source: "/fonts/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
