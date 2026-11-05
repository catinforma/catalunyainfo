import type { Locale } from "@/lib/i18n/config";

/**
 * URLs of the official-polls page (CIS and CEO) for the 29N general election.
 * No data here, so guides, the election hub, the sitemap and next.config can
 * link to it or match it without pulling a single figure in.
 *
 *   ca  /ca/guies/enquestes-eleccions-generals-catalunya/
 *   es  /es/guias/encuestas-elecciones-generales-cataluna/
 *   en  /en/guides/spain-general-election-polls-catalonia/
 *
 * Served by `app/(public)/[locale]/internal-polls/` through rewrites
 * (`pollsRewrites()`, next.config.ts), like internal search: an afterFiles
 * rewrite is matched before the `[...slug]` catch-all, which must not serve
 * this page (its ISR would cache the figures). Checked 5 Nov 2026: no content
 * path, B2 registry path or legacy redirect uses these paths; a test keeps it
 * so (a published DB entry at the same path would be served first).
 */
export const POLLS_PATHS: Record<Locale, string> = {
  ca: "guies/enquestes-eleccions-generals-catalunya",
  es: "guias/encuestas-elecciones-generales-cataluna",
  en: "guides/spain-general-election-polls-catalonia",
};

/** The internal route segment the rewrites point at. */
export const POLLS_INTERNAL_SEGMENT = "internal-polls";

const LOCALE_KEYS = Object.keys(POLLS_PATHS) as Locale[];

export function pollsPath(locale: Locale): string {
  return `/${locale}/${POLLS_PATHS[locale]}/`;
}

export function pollsTranslations(): Record<Locale, string> {
  return { ca: pollsPath("ca"), es: pollsPath("es"), en: pollsPath("en") };
}

/** next.config.ts rewrites: each public URL to the internal route, in its own locale only. */
export function pollsRewrites(): { source: string; destination: string }[] {
  return LOCALE_KEYS.map((locale) => ({ source: pollsPath(locale), destination: `/${locale}/${POLLS_INTERNAL_SEGMENT}/` }));
}

/**
 * Header sources (next.config.ts) for the public URLs and the internal one,
 * with and without the trailing slash, as `ALWAYS_NOINDEX_SOURCES` does for
 * search. Header rules match the request path, before rewrites.
 */
export function pollsHeaderSources(): string[] {
  return LOCALE_KEYS.flatMap((locale) =>
    [`/${locale}/${POLLS_PATHS[locale]}`, `/${locale}/${POLLS_INTERNAL_SEGMENT}`].flatMap((base) => [base, `${base}/:path*`]),
  );
}

/**
 * Sent on every response of the page, inside and outside the blackout. The
 * route is dynamic, so Next would send `private, no-cache, no-store` by
 * itself; setting it here as well (Next keeps a Cache-Control that is already
 * set on a dynamic route) plus the CDN-specific headers means no shared cache
 * (Cloudflare, see ops/vps/README.md section 10) ever holds a copy that could
 * carry figures into the blackout.
 */
export const POLLS_CACHE_HEADERS: { key: string; value: string }[] = [
  { key: "Cache-Control", value: "private, no-cache, no-store, max-age=0, must-revalidate" },
  { key: "CDN-Cache-Control", value: "no-store" },
  { key: "Cloudflare-CDN-Cache-Control", value: "no-store" },
];
