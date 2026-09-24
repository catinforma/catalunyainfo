import type { MetadataRoute } from "next";
import { headers } from "next/headers";

import { CANONICAL_HOST, absoluteUrl, indexingAllowed, siteOrigin } from "@/lib/site";

// Dynamic so the host can be checked. robots.txt is requested rarely enough
// that a function invocation per request is not worth optimising away.
export const dynamic = "force-dynamic";

/**
 * robots.txt
 *
 * Two distinct states:
 *
 *  - Not indexable (any preview, any non-production deployment, or production
 *    before we flip `NEXT_PUBLIC_ALLOW_INDEXING`): a blanket disallow, and no
 *    sitemap reference. This is what keeps `*.vercel.app` preview URLs out of
 *    the index, backed by an `X-Robots-Tag` header from the middleware — a
 *    header, unlike robots.txt, also stops an already-discovered URL from
 *    being indexed.
 *
 *  - Production: crawlable, with the admin area, the API and internal search
 *    excluded. Internal search is excluded because result pages are thin and
 *    near-duplicate by nature.
 *
 * Query strings are disallowed to keep faceted and tracking variants out, but
 * the image optimiser is explicitly allowed back in — see below.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  // A production build is also served on its `*.vercel.app` alias. Only the
  // canonical host may ever invite crawlers.
  const host = (await headers()).get("host")?.split(":")[0]?.toLowerCase();
  const onCanonicalHost = host === CANONICAL_HOST;

  if (!indexingAllowed() || !onCanonicalHost) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        // `/_next/image` has to be allowed explicitly, and before the query
        // rule below: every content image is served from it, and `/*?*` would
        // otherwise hide all of them from Googlebot. A more specific Allow
        // wins over a broader Disallow, which is what makes this work.
        allow: ["/", "/_next/image"],
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/ca/cerca/",
          "/es/buscar/",
          "/en/search/",
          "/*/internal-search/",
          "/*?*",
        ],
      },
      // Explicitly welcome the AdSense crawler so that, when ads are switched
      // on, it can read the same pages as Googlebot.
      { userAgent: "Mediapartners-Google", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteOrigin(),
  };
}
