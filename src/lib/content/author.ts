import type { Block } from "@/lib/content/blocks";
import { OWNER, aboutCopy } from "@/lib/content/pages/institutional";
import { section } from "@/lib/content/pages/types";
import { BYLINE_ENTRY_TYPES, type AuthorView, type EntryDetail } from "@/lib/content/types";
import type { Locale } from "@/lib/i18n/config";
import { sectionPath } from "@/lib/i18n/routes";

/**
 * The named author of the site's written pieces.
 *
 * Google News asks for "clear dates and bylines" and information about the
 * authors; Discover weighs who stands behind a page. Every guide and article
 * was signed by the Organization, and the authors page was empty and noindex.
 * The owner named himself the site's founder on the about page (OWNER in
 * institutional.ts, 5 Nov 2026), so the pieces now carry his byline and link
 * to an author page built from that page's own words: this module says
 * nothing about him or the method that the about page does not.
 *
 * Code, not a database row: the byline must not depend on a CMS record that a
 * publish could forget, and an entry with an author set in the CMS keeps it.
 */

export const SITE_AUTHOR_SLUG = "marti-aguilera";

/** Not a database id: marks the code-defined author (see isSiteAuthor). */
export const SITE_AUTHOR_ID = "site-author";

/** `/ca/autors/marti-aguilera/` */
export function siteAuthorPath(locale: Locale): string {
  return `${sectionPath("authors", locale)}${SITE_AUTHOR_SLUG}/`;
}

/** His role on this site: the Organization's `founder` (jsonld.ts). */
export const SITE_AUTHOR_ROLE: Record<Locale, string> = {
  ca: "Fundador de CatalunyaInfo",
  es: "Fundador de CatalunyaInfo",
  en: "Founder of CatalunyaInfo",
};

/**
 * One sentence: the about page's description of the project, with its
 * founder named. Used as the author page's meta description and lead, and as
 * the Person's `description`.
 */
export const SITE_AUTHOR_SUMMARY: Record<Locale, string> = {
  ca: `${OWNER.name} va fundar CatalunyaInfo: informació pràctica i verificada sobre Catalunya, i sobre la resta d'Espanya quan t'afecta, en català, castellà i anglès.`,
  es: `${OWNER.name} fundó CatalunyaInfo: información práctica y verificada sobre Cataluña, y sobre el resto de España cuando te afecta, en catalán, castellano e inglés.`,
  en: `${OWNER.name} founded CatalunyaInfo: practical, verified information about Catalonia, and the rest of Spain where it affects you, in Catalan, Spanish and English.`,
};

/** Profiles that identify him: the about page's three links (schema.org sameAs). */
export const SITE_AUTHOR_PROFILES: readonly string[] = [OWNER.links.portfolio, OWNER.links.github, OWNER.links.linkedin];

export function siteAuthor(locale: Locale): AuthorView {
  return {
    id: SITE_AUTHOR_ID,
    slug: SITE_AUTHOR_SLUG,
    name: OWNER.name,
    jobTitle: SITE_AUTHOR_ROLE[locale],
    bio: SITE_AUTHOR_SUMMARY[locale],
    expertise: null,
    links: { ...OWNER.links },
    avatar: null,
  };
}

export function isSiteAuthor(author: Pick<AuthorView, "id" | "slug"> | null | undefined): boolean {
  return Boolean(author && author.id === SITE_AUTHOR_ID && author.slug === SITE_AUTHOR_SLUG);
}

/** Whether pieces of this type are signed (guides, articles, news). */
export function hasByline(type: EntryDetail["type"]): boolean {
  return BYLINE_ENTRY_TYPES.includes(type);
}

/**
 * The author a piece is signed by: the one set in the CMS, else the site's
 * author for written pieces, else nobody (pages, places, events).
 */
export function bylineAuthor(entry: Pick<EntryDetail, "type" | "locale" | "author">): AuthorView | null {
  if (entry.author) return entry.author;
  return hasByline(entry.type) ? siteAuthor(entry.locale) : null;
}

/** The entry with its byline filled in, for the page, its metadata and its JSON-LD. */
export function withByline<T extends EntryDetail>(entry: T): T {
  const author = bylineAuthor(entry);
  return author === entry.author ? entry : { ...entry, author };
}

/* -------------------------------------------------------------------------- */
/* The author page                                                            */
/* -------------------------------------------------------------------------- */

/** The only heading the about page has no words for: the list of his pieces. */
export const SITE_AUTHOR_LATEST_HEADING: Record<Locale, string> = {
  ca: "Guies actualitzades fa poc",
  es: "Guías actualizadas recientemente",
  en: "Recently updated guides",
};

/**
 * The author page's text, before the list of his latest pieces and after it.
 * Every section is the about page's, word for word (aboutCopy): who he is and
 * his links, what the site publishes, then the editorial method (with the
 * editorial policy and sources links) and the AI disclosure, and how to report
 * an error.
 */
export function siteAuthorBlocks(locale: Locale): { intro: Block[]; method: Block[] } {
  const about = aboutCopy(locale);
  return {
    intro: [
      { type: "paragraph", lead: true, text: SITE_AUTHOR_SUMMARY[locale] } as Block,
      ...section(about.who.heading, ...about.who.paragraphs),
      ...section(about.what.heading, ...about.what.paragraphs),
    ],
    method: [
      ...section(about.how.heading, ...about.how.paragraphs),
      ...section(about.ai.heading, ...about.ai.paragraphs),
      ...section(about.help.heading, ...about.help.paragraphs),
    ],
  };
}
