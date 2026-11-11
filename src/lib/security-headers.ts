/**
 * Security headers, shared by `next.config.ts` (static, applied to every
 * response without running code) and `src/proxy.ts` (for the few responses the
 * proxy builds itself: the locale redirect, the admin bounce and 410s).
 *
 * They used to be set only by the proxy, which therefore ran on every page and
 * every link prefetch — about 15 invocations per cold page view — to attach
 * headers that never vary per request.
 *
 * Content Security Policy: `script-src` allows inline script. That is a
 * deliberate, documented trade: the App Router streams its RSC payload through
 * inline `<script>` tags, so a nonce-based policy would have to be generated
 * per response — which makes every page dynamically rendered and uncacheable
 * at the CDN, and a nonce reused across a cached response protects nothing
 * anyway. What makes this acceptable is that the rendering path never converts
 * stored content into HTML (enforced by tests/security.test.ts). See
 * docs/SECURITY.md for the full reasoning and the review trigger.
 */

export function contentSecurityPolicy(isDev: boolean): string {
  return [
    `default-src 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    `frame-ancestors 'none'`,
    `form-action 'self'`,
    `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https:`,
    `font-src 'self' data:`,
    `connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://*.vercel-insights.com`,
    `frame-src 'self' https://www.youtube-nocookie.com https://player.vimeo.com https://www.openstreetmap.org https://open.spotify.com`,
    `media-src 'self'`,
    `manifest-src 'self'`,
    `worker-src 'self' blob:`,
    `upgrade-insecure-requests`,
  ].join("; ");
}

export const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(self), payment=(), usb=(), interest-cohort=(), browsing-topics=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

export const NOINDEX_VALUE = "noindex, nofollow, noarchive";

/*
 * Embeddable widgets (src/app/embed/, lib/programmatic/embed-2027/): the one
 * part of the site other websites may frame. Everything else keeps
 * `frame-ancestors 'none'` and `X-Frame-Options: DENY`.
 *
 * next.config.ts sends X-Frame-Options only on `NOT_EMBED_SOURCE` (every path
 * but /embed/...), because a later header rule cannot remove a header, and
 * overrides the CSP and X-Robots-Tag on `EMBED_SOURCE` in its last rule. The
 * widget is plain HTML with no script, no cookie and no third-party request,
 * so its policy is tighter than the site's on everything but framing.
 */

/** Every path under /embed/ (and /embed itself). */
export const EMBED_SOURCE = "/embed/:path*";

/** Every path except /embed and /embed/... ("/embedded/" still matches). */
export const NOT_EMBED_SOURCE = "/:path((?!embed(?:/|$)).*)";

/** The widget's policy: any site may frame it; it loads nothing but its own inline style. */
export function embedContentSecurityPolicy(): string {
  return [
    `default-src 'none'`,
    `base-uri 'none'`,
    `form-action 'none'`,
    `frame-ancestors *`,
    `style-src 'unsafe-inline'`,
    `img-src 'self' data:`,
    `upgrade-insecure-requests`,
  ].join("; ");
}

/**
 * The widget is never a search result of its own; Google may still index it
 * as part of the page that embeds it (`indexifembedded`), attribution link
 * included. No `nofollow`: the attribution link is a normal link.
 */
export const EMBED_ROBOTS_VALUE = "noindex, indexifembedded";

/** Path prefixes that must never be indexed, on any deployment or host. */
export const ALWAYS_NOINDEX_SOURCES = [
  "/admin",
  "/admin/:path*",
  "/api/:path*",
  "/ca/cerca",
  "/ca/cerca/:path*",
  "/es/buscar",
  "/es/buscar/:path*",
  "/en/search",
  "/en/search/:path*",
];
