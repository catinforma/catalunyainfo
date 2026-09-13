import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/config";
import { LEGACY_GONE } from "@/lib/migration/legacy-redirects";

/**
 * Edge proxy (the Next 16 replacement for the middleware file convention). Responsibilities, in order:
 *
 *  1. Answer 410 for the version-1 URLs we deliberately removed.
 *  2. Send `/` to a locale root, using the visitor's Accept-Language.
 *  3. Gate `/admin` behind the presence of a session cookie. The cookie is
 *     *verified* in the route handlers; this is only a cheap early bounce.
 *  4. Attach the security headers, and keep every non-production deployment
 *     out of the index.
 *
 * Deliberately does NOT touch the database: this runs on every request at
 * the edge, and a database round trip there would tax every page view. Content
 * redirects live in `next.config.ts` (legacy, static) and in the catch-all
 * route (editor-managed, cached).
 */

const SESSION_COOKIE = "ci_session";
const LOCALE_COOKIE = "ci_locale";

function detectLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookie)) return cookie;

  const header = request.headers.get("accept-language");
  if (!header) return DEFAULT_LOCALE;

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag = "", ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? Number.parseFloat(qParam.split("=")[1] ?? "1") : 1;
      return { tag: tag.toLowerCase(), q: Number.isNaN(q) ? 0 : q };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}

/** The one host that is ever allowed into a search index. */
const CANONICAL_HOST = "www.catalunyainfo.com";

/**
 * Indexing requires all three: the production environment, the explicit switch,
 * and a request that actually arrived on the canonical host.
 *
 * The host check is the one that matters in practice. Vercel assigns the first
 * deployment — and every later production deployment — a `*.vercel.app` alias
 * that serves the same build with `VERCEL_ENV=production`. Without this check,
 * flipping the indexing switch would make those aliases indexable too, and the
 * site would be competing with a duplicate of itself on a host we do not
 * control.
 */
function isIndexableRequest(request: NextRequest): boolean {
  if (process.env.VERCEL_ENV !== "production") return false;
  if (process.env.NEXT_PUBLIC_ALLOW_INDEXING !== "true") return false;

  const host = (request.headers.get("host") ?? "").split(":")[0]?.toLowerCase();
  return host === CANONICAL_HOST;
}

/**
 * Content Security Policy.
 *
 * `script-src` allows inline script. That is a deliberate, documented trade:
 * the App Router streams its RSC payload through inline `<script>` tags, so a
 * nonce-based policy would have to be generated per response — which makes
 * every page dynamically rendered and uncacheable at the CDN, and a nonce
 * reused across a cached response protects nothing anyway.
 *
 * What makes this acceptable here is that the rendering path never converts
 * stored content into HTML: block bodies are structured JSON rendered as React
 * elements, inline formatting is parsed into elements by `lib/content/inline`,
 * and `dangerouslySetInnerHTML` appears nowhere in the codebase (enforced by a
 * test). The usual injection route that `unsafe-inline` would widen does not
 * exist. Everything else is locked down: no plugins, no framing, no arbitrary
 * connect targets, and a closed allowlist for embeds.
 *
 * See docs/SECURITY.md for the full reasoning and the review trigger.
 */
function contentSecurityPolicy(): string {
  const isDev = process.env.NODE_ENV !== "production";

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

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(self), payment=(), usb=(), interest-cohort=(), browsing-topics=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

/** Paths that must never be indexed, on any deployment. */
function isAlwaysNoindex(pathname: string): boolean {
  if (pathname.startsWith("/admin")) return true;
  if (pathname.startsWith("/api")) return true;
  return /^\/(?:ca\/cerca|es\/buscar|en\/search)(?:\/|$)/.test(pathname);
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ---- Removed legacy URLs ------------------------------------------------
  // 410 rather than 404: these pages existed, were indexed, and were removed on
  // purpose. 410 gets them dropped from the index faster and stops Google
  // re-crawling them for months.
  if (LEGACY_GONE.has(pathname)) {
    return decorate(new NextResponse(null, { status: 410 }), pathname, request);
  }

  // ---- Admin gate ---------------------------------------------------------
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!request.cookies.get(SESSION_COOKIE)) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = `?next=${encodeURIComponent(pathname)}`;
      return decorate(NextResponse.redirect(url), pathname, request);
    }
  }

  // ---- Locale root --------------------------------------------------------
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = `/${detectLocale(request)}/`;
    // 307, not 308: the destination depends on the visitor's language, so the
    // mapping must never be cached as permanent by a browser or a proxy.
    const response = NextResponse.redirect(url, 307);
    response.headers.set("Vary", "Accept-Language, Cookie");
    return decorate(response, pathname, request);
  }

  return decorate(NextResponse.next(), pathname, request);
}

function decorate(
  response: NextResponse,
  pathname: string,
  request: NextRequest,
): NextResponse {
  response.headers.set("Content-Security-Policy", contentSecurityPolicy());
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  if (!isIndexableRequest(request) || isAlwaysNoindex(pathname)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  return response;
}

export const config = {
  matcher: [
    // Everything except Next internals and the static asset pipeline.
    // `robots.txt` and `sitemap.xml` are route handlers, so they are matched
    // on purpose and receive the security headers.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|woff|woff2|ttf)$).*)",
  ],
};

export { SESSION_COOKIE, LOCALE_COOKIE };
