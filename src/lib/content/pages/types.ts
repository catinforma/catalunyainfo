import type { Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";
import { LEGAL_SEGMENTS, SECTION_SEGMENTS, type LegalKey, type SectionKey } from "@/lib/i18n/routes";

/**
 * The institutional pages: legal notice, privacy, cookies, editorial policy,
 * corrections, sources, accessibility, about and contact.
 *
 * These are `page` entries in the database like any other content, so they are
 * editable in the CMS, translated per locale, linked by hreflang and listed in
 * the sitemap. What is special about them is only that their first draft ships
 * as code, because a site must not go live with its legal pages returning 404 -
 * which is exactly what was happening.
 */

export interface PageCopy {
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  blocks: Block[];
}

export interface PageSpec {
  /** Stable `entries.key`. */
  key: string;
  /** Path after the locale prefix, no leading or trailing slash. */
  path: Record<Locale, string>;
  copy: Record<Locale, PageCopy>;
}

/** `legal/privacitat` — derived from the route map so it can never drift. */
export function legalEntryPath(key: LegalKey): Record<Locale, string> {
  return {
    ca: `${SECTION_SEGMENTS.legal.ca}/${LEGAL_SEGMENTS[key].ca}`,
    es: `${SECTION_SEGMENTS.legal.es}/${LEGAL_SEGMENTS[key].es}`,
    en: `${SECTION_SEGMENTS.legal.en}/${LEGAL_SEGMENTS[key].en}`,
  };
}

/** `qui-som` / `quienes-somos` / `about` */
export function sectionEntryPath(key: SectionKey): Record<Locale, string> {
  return {
    ca: SECTION_SEGMENTS[key].ca,
    es: SECTION_SEGMENTS[key].es,
    en: SECTION_SEGMENTS[key].en,
  };
}

/** Shorthand for a run of paragraphs. */
export function paragraphs(...texts: string[]): Block[] {
  return texts.map((text) => ({ type: "paragraph", text }) as Block);
}

/** Heading followed by its paragraphs. */
export function section(heading: string, ...texts: string[]): Block[] {
  return [{ type: "heading", level: 2, text: heading } as Block, ...paragraphs(...texts)];
}
