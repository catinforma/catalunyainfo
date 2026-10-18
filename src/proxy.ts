import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/config";
import { LEGACY_GONE } from "@/lib/migration/legacy-redirects";
import { contentSecurityPolicy, NOINDEX_VALUE, SECURITY_HEADERS } from "@/lib/security-headers";

/**
 * Edge proxy (the Next 16 replacement for the middleware file convention). Responsibilities, in order:
 *
 *  1. Answer 410 for the version-1 URLs we deliberately removed.
 *  2. Send `/` to a locale root, using the visitor's Accept-Language.
 *  3. Gate `/admin` behind the presence of a session cookie. The cookie is
 *     *verified* in the route handlers; this is only a cheap early bounce.
 *  4. Attach the security headers to the responses it builds itself.
 *
 * Every other response gets its security and X-Robots-Tag headers statically
 * from `next.config.ts`, so the proxy only runs on the three paths that need
 * logic (see `config.matcher`). It used to run on every page and prefetch —
 * about 15 invocations per cold page view — just to attach constant headers.
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
  response.headers.set("Content-Security-Policy", contentSecurityPolicy(process.env.NODE_ENV !== "production"));
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  if (!isIndexableRequest(request) || isAlwaysNoindex(pathname)) {
    response.headers.set("X-Robots-Tag", NOINDEX_VALUE);
  }

  return response;
}

export const config = {
  // Only where the proxy has logic to run: the locale redirect on "/", the
  // admin gate, and the version-1 URLs answered with 410 (all under
  // /article/, see LEGACY_GONE). Headers for everything else are static.
  matcher: ["/", "/admin/:path*", "/article/:path*"],
};

export { SESSION_COOKIE, LOCALE_COOKIE };
