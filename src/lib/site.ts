/**
 * Single source of truth for the public identity of the site.
 *
 * CANONICAL HOST DECISION: `www.catalunyainfo.com`.
 * The previous site was already indexed on the `www` host and the apex already
 * redirected to it. Switching the canonical host to the apex now would force a
 * full re-crawl of every indexed URL for zero technical gain, so we keep `www`
 * and make the apex -> www redirect permanent (308) instead of temporary (307).
 */
/** The only host that may ever be indexed. */
export const CANONICAL_HOST = "www.catalunyainfo.com";

export const SITE = {
  name: "CatalunyaInfo",
  /** Canonical production origin. Never a *.vercel.app URL. */
  productionOrigin: `https://${CANONICAL_HOST}`,
  /** Contact mailbox surfaced on legal/editorial pages. */
  contactEmail: "hola@catalunyainfo.com",
  /** Twitter/X handle, without the @. Empty string = not published yet. */
  twitter: "",
} as const;

/**
 * Deployment environment as reported by Vercel, normalised.
 * - "production"  -> the real site on the custom domain
 * - "preview"     -> a Vercel preview deployment (MUST be noindex)
 * - "development" -> local `next dev`
 */
export type DeployEnv = "production" | "preview" | "development";

export function deployEnv(): DeployEnv {
  const v = process.env.VERCEL_ENV;
  if (v === "production") return "production";
  if (v === "preview") return "preview";
  if (process.env.NODE_ENV === "production" && !v) return "production";
  return "development";
}

export const isProduction = () => deployEnv() === "production";
export const isPreview = () => deployEnv() === "preview";
export const isDevelopment = () => deployEnv() === "development";

/**
 * Origin to use when building absolute URLs.
 *
 * Production always uses the custom domain so that canonicals, hreflang, OG
 * tags and the sitemap can never leak a `*.vercel.app` host into the index.
 * Previews use their own deployment URL (they are noindexed anyway) so that
 * links inside a preview stay inside that preview.
 */
export function siteOrigin(): string {
  if (isProduction()) return SITE.productionOrigin;
  const vercelUrl = process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;
  const port = process.env.PORT ?? "3000";
  return `http://localhost:${port}`;
}

/** Absolute URL for a site-relative path (`/ca/…`). */
export function absoluteUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${siteOrigin()}${p}`;
}

/**
 * Whether robots should be allowed to index this deployment.
 * Only ever true on the production deployment served from the custom domain.
 */
export function indexingAllowed(): boolean {
  if (!isProduction()) return false;
  // Escape hatch used during the pre-launch phase: while the site has no real
  // editorial content we do not want it crawled or reviewed by AdSense.
  return process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
}
