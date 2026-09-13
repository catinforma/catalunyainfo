import type { MetadataRoute } from "next";

import { absoluteUrl, indexingAllowed, siteOrigin } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = 3600;

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
 */
export default function robots(): MetadataRoute.Robots {
  if (!indexingAllowed()) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
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
