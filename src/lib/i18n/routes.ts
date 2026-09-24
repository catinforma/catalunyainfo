import { LOCALES, type Locale } from "./config";

/**
 * URL architecture.
 *
 * Every public URL is `/{locale}/{...localised segments}/`. There are two
 * kinds of path:
 *
 *  1. SYSTEM paths — hubs and utility pages whose first segment is fixed per
 *     locale and declared here (e.g. `/ca/destinacions/`, `/es/destinos/`).
 *  2. CONTENT paths — resolved against the `url_index` table, which lets an
 *     editor give each translation its own natural slug
 *     (`/ca/montserrat/com-arribar-hi/` vs `/en/montserrat/how-to-get-there/`).
 *
 * Localised segments are NEVER query strings and never swapped client-side.
 */
export const SECTION_KEYS = [
  "news",
  "guides",
  "destinations",
  "events",
  "routes",
  "topics",
  "authors",
  "search",
  "about",
  "contact",
  "legal",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export const SECTION_SEGMENTS: Record<SectionKey, Record<Locale, string>> = {
  news: { ca: "actualitat", es: "actualidad", en: "news" },
  guides: { ca: "guies", es: "guias", en: "guides" },
  destinations: { ca: "destinacions", es: "destinos", en: "destinations" },
  events: { ca: "agenda", es: "agenda", en: "events" },
  routes: { ca: "rutes", es: "rutas", en: "routes" },
  topics: { ca: "temes", es: "temas", en: "topics" },
  authors: { ca: "autors", es: "autores", en: "authors" },
  search: { ca: "cerca", es: "buscar", en: "search" },
  about: { ca: "qui-som", es: "quienes-somos", en: "about" },
  contact: { ca: "contacte", es: "contacto", en: "contact" },
  legal: { ca: "legal", es: "legal", en: "legal" },
};

/** Sub-pages under the `legal` hub. Keys double as the page entity slug. */
export const LEGAL_KEYS = [
  "legal-notice",
  "privacy",
  "cookies",
  "editorial-policy",
  "corrections",
  "sources",
  "accessibility",
] as const;

export type LegalKey = (typeof LEGAL_KEYS)[number];

export const LEGAL_SEGMENTS: Record<LegalKey, Record<Locale, string>> = {
  "legal-notice": { ca: "avis-legal", es: "aviso-legal", en: "legal-notice" },
  privacy: { ca: "privacitat", es: "privacidad", en: "privacy" },
  cookies: { ca: "cookies", es: "cookies", en: "cookies" },
  "editorial-policy": {
    ca: "politica-editorial",
    es: "politica-editorial",
    en: "editorial-policy",
  },
  corrections: { ca: "correccions", es: "correcciones", en: "corrections" },
  sources: { ca: "fonts", es: "fuentes", en: "sources" },
  accessibility: {
    ca: "accessibilitat",
    es: "accesibilidad",
    en: "accessibility",
  },
};

/** `/ca/destinacions/` */
export function sectionPath(section: SectionKey, locale: Locale): string {
  return `/${locale}/${SECTION_SEGMENTS[section][locale]}/`;
}

/** `/ca/legal/privacitat/` */
export function legalPath(key: LegalKey, locale: Locale): string {
  return `/${locale}/${SECTION_SEGMENTS.legal[locale]}/${LEGAL_SEGMENTS[key][locale]}/`;
}

export function homePath(locale: Locale): string {
  return `/${locale}/`;
}

type SegmentIndex = Map<string, SectionKey>;

const SECTION_INDEX: Record<Locale, SegmentIndex> = (() => {
  const out = {} as Record<Locale, SegmentIndex>;
  for (const locale of LOCALES) {
    const map: SegmentIndex = new Map();
    for (const key of SECTION_KEYS) map.set(SECTION_SEGMENTS[key][locale], key);
    out[locale] = map;
  }
  return out;
})();

const LEGAL_INDEX: Record<Locale, Map<string, LegalKey>> = (() => {
  const out = {} as Record<Locale, Map<string, LegalKey>>;
  for (const locale of LOCALES) {
    const map = new Map<string, LegalKey>();
    for (const key of LEGAL_KEYS) map.set(LEGAL_SEGMENTS[key][locale], key);
    out[locale] = map;
  }
  return out;
})();

/** Reverse lookup: which section does this first segment belong to? */
export function sectionFromSegment(
  locale: Locale,
  segment: string | undefined,
): SectionKey | null {
  if (!segment) return null;
  return SECTION_INDEX[locale].get(segment) ?? null;
}

export function legalFromSegment(
  locale: Locale,
  segment: string | undefined,
): LegalKey | null {
  if (!segment) return null;
  return LEGAL_INDEX[locale].get(segment) ?? null;
}

/**
 * Translate a system path across locales. Content paths are translated through
 * the database instead (see `lib/content/urls.ts`).
 */
export function translateSectionPath(
  section: SectionKey,
  target: Locale,
): string {
  return sectionPath(section, target);
}

/**
 * Every system path, used by the sitemap generator.
 *
 * `authors` and `topics` are excluded: both render an index that is empty
 * until there are authors or tagged entries to list, and a sitemap entry for a
 * page with twenty words is an invitation to crawl nothing. They are still
 * reachable and still render; they are simply not advertised until they have
 * something to show. The section hubs are filtered the same way, by content,
 * in `sitemap.ts`.
 */
export function allSystemPaths(locale: Locale): string[] {
  const excluded: SectionKey[] = ["search", "authors", "topics"];
  return [
    homePath(locale),
    ...SECTION_KEYS.filter((k) => !excluded.includes(k)).map((k) => sectionPath(k, locale)),
    ...LEGAL_KEYS.map((k) => legalPath(k, locale)),
  ];
}
