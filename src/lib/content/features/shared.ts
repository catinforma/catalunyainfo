import type { Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";

/**
 * The feature guides.
 *
 * Ten evergreen and seasonal guides, each in three languages, published through
 * the same `publishArticle` path as everything else. What lives here is the
 * copy and the block structure; nothing about routing, SEO or the sitemap needs
 * to change, because a `page`/`article` entry with a `path` is already all the
 * URL index needs.
 *
 * ## The link registry
 *
 * Every internal link in these articles is built from `ARTICLE_PATHS` below, so
 * a link can only ever point at a URL this repository actually publishes. That
 * is the whole reason the registry exists: cross-links written by hand across
 * thirty editions in three languages is exactly where dead internal links come
 * from.
 */

export type ArticleKey =
  | "trains"
  | "gaudi"
  | "medieval"
  | "sitges"
  | "foodfairs"
  | "castanyada"
  | "montserrat"
  | "traps"
  | "surprising"
  | "rainy"
  /* Already published before this batch. */
  | "mushrooms"
  | "autumn"
  | "weekend";

/** Path after the locale prefix, no leading or trailing slash. */
export const ARTICLE_PATHS: Record<ArticleKey, Record<Locale, string>> = {
  trains: {
    ca: "escapades/catalunya-sense-cotxe-tren",
    es: "escapadas/cataluna-sin-coche-tren",
    en: "day-trips/barcelona-day-trips-by-train",
  },
  gaudi: {
    ca: "cultura/gaudi-obres-menys-conegudes",
    es: "cultura/gaudi-obras-menos-conocidas",
    en: "culture/lesser-known-gaudi-sites",
  },
  medieval: {
    ca: "pobles/pobles-medievals-catalunya",
    es: "pueblos/pueblos-medievales-cataluna",
    en: "villages/best-medieval-villages-catalonia",
  },
  sitges: {
    ca: "agenda/festival-sitges-guia",
    es: "agenda/festival-sitges-guia",
    en: "events/sitges-film-festival-guide",
  },
  foodfairs: {
    ca: "gastronomia/fires-gastronomiques-tardor-catalunya",
    es: "gastronomia/ferias-gastronomicas-otono-cataluna",
    en: "food/catalonia-autumn-food-festivals",
  },
  castanyada: {
    ca: "tradicions/castanyada-catalunya",
    es: "tradiciones/castanyada-cataluna",
    en: "traditions/castanyada-catalonia",
  },
  montserrat: {
    ca: "escapades/escapades-barcelona-mes-enlla-montserrat",
    es: "escapadas/escapadas-barcelona-mas-alla-montserrat",
    en: "day-trips/beyond-montserrat-barcelona-day-trips",
  },
  traps: {
    ca: "barcelona/barcelona-trampes-turistes-alternatives",
    es: "barcelona/barcelona-trampas-turistas-alternativas",
    en: "barcelona/barcelona-tourist-traps-alternatives",
  },
  surprising: {
    ca: "llocs/llocs-sorprenents-catalunya",
    es: "lugares/lugares-sorprendentes-cataluna",
    en: "places/hidden-places-catalonia",
  },
  rainy: {
    ca: "plans/que-fer-catalunya-quan-plou",
    es: "planes/que-hacer-cataluna-cuando-llueve",
    en: "things-to-do/catalonia-rainy-day",
  },
  mushrooms: {
    ca: "natura/bolets-catalunya-condicions",
    es: "naturaleza/setas-cataluna-condiciones",
    en: "nature/mushroom-season-catalonia",
  },
  autumn: {
    ca: "natura/colors-tardor-catalunya",
    es: "naturaleza/colores-otono-cataluna",
    en: "nature/fall-colors-catalonia",
  },
  weekend: {
    ca: "agenda/que-fer-aquest-cap-de-setmana-catalunya",
    es: "agenda/que-hacer-este-fin-de-semana-cataluna",
    en: "agenda/things-to-do-catalonia-this-weekend",
  },
};

/** Absolute, locale-correct, trailing-slashed href for an article. */
export function href(key: ArticleKey, locale: Locale): string {
  return `/${locale}/${ARTICLE_PATHS[key][locale]}/`;
}

/** Inline markdown link to another article. */
export function link(key: ArticleKey, locale: Locale, label: string): string {
  return `[${label}](${href(key, locale)})`;
}

/** Titles used by the related-content rail at the foot of each article. */
export const ARTICLE_TITLES: Record<ArticleKey, Record<Locale, string>> = {
  trains: {
    ca: "12 escapades per Catalunya que pots fer en tren",
    es: "12 escapadas por Cataluña que puedes hacer en tren",
    en: "12 day trips from Barcelona by train",
  },
  gaudi: {
    ca: "8 obres de Gaudí menys conegudes",
    es: "8 obras menos conocidas de Gaudí",
    en: "8 lesser-known Gaudí sites",
  },
  medieval: {
    ca: "10 pobles medievals de Catalunya",
    es: "10 pueblos medievales de Cataluña",
    en: "10 medieval villages in Catalonia",
  },
  sitges: {
    ca: "Festival de Sitges: guia per anar-hi per primera vegada",
    es: "Festival de Sitges: guía para ir por primera vez",
    en: "Sitges Film Festival: a first-timer's guide",
  },
  foodfairs: {
    ca: "Les fires gastronòmiques de la tardor catalana",
    es: "Las ferias gastronómicas del otoño catalán",
    en: "Catalonia's autumn food festivals",
  },
  castanyada: {
    ca: "La Castanyada: on viure-la de veritat",
    es: "La Castanyada: dónde vivirla de verdad",
    en: "Where to experience the Castanyada",
  },
  montserrat: {
    ca: "Més enllà de Montserrat: 10 escapades des de Barcelona",
    es: "Más allá de Montserrat: 10 escapadas desde Barcelona",
    en: "Beyond Montserrat: 10 Barcelona day trips",
  },
  traps: {
    ca: "Barcelona sense trampes per a turistes",
    es: "Barcelona sin trampas para turistas",
    en: "Barcelona tourist traps, and what to do instead",
  },
  surprising: {
    ca: "15 llocs sorprenents de Catalunya",
    es: "15 lugares sorprendentes de Cataluña",
    en: "15 places in Catalonia most visitors miss",
  },
  rainy: {
    ca: "20 plans per a un dia de pluja",
    es: "20 planes para un día de lluvia",
    en: "20 things to do on a rainy day",
  },
  mushrooms: {
    ca: "Condicions per als bolets, setmana a setmana",
    es: "Condiciones para las setas, semana a semana",
    en: "Mushroom conditions, week by week",
  },
  autumn: {
    ca: "Colors de tardor: on i quan veure'ls",
    es: "Colores de otoño: dónde y cuándo verlos",
    en: "Fall colours: where and when",
  },
  weekend: {
    ca: "Què fer aquest cap de setmana a Catalunya",
    es: "Qué hacer este fin de semana en Cataluña",
    en: "What's on in Catalonia this weekend",
  },
};

const RELATED_HEADING: Record<Locale, string> = {
  ca: "Continua llegint",
  es: "Sigue leyendo",
  en: "Keep reading",
};

/**
 * The related-content rail.
 *
 * A list of real internal links rather than a `relatedLinks` block, because
 * that block resolves entry row ids and these articles are addressed by path.
 * Same result for the reader, and it cannot render an empty rail if a row is
 * missing.
 */
export function relatedBlocks(keys: ArticleKey[], locale: Locale): Block[] {
  return [
    { type: "heading", level: 2, text: RELATED_HEADING[locale] },
    {
      type: "list",
      ordered: false,
      items: keys.map((key) => link(key, locale, ARTICLE_TITLES[key][locale])),
    },
  ] as Block[];
}

/** Paragraph run. */
export function paras(...texts: string[]): Block[] {
  return texts.map((text) => ({ type: "paragraph", text }) as Block);
}

/** `## heading` followed by its paragraphs. */
export function h2(heading: string, ...texts: string[]): Block[] {
  return [{ type: "heading", level: 2, text: heading } as Block, ...paras(...texts)];
}

/** `### heading` followed by its paragraphs. */
export function h3(heading: string, ...texts: string[]): Block[] {
  return [{ type: "heading", level: 3, text: heading } as Block, ...paras(...texts)];
}

export function lead(text: string): Block {
  return { type: "paragraph", lead: true, text } as Block;
}

export function callout(
  tone: "info" | "tip" | "warning" | "official",
  title: string,
  text: string,
): Block {
  return { type: "callout", tone, title, text } as Block;
}

export function list(...items: string[]): Block {
  return { type: "list", ordered: false, items } as Block;
}

export function table(
  caption: string,
  headers: string[],
  rows: string[][],
  note?: string,
): Block {
  return { type: "table", caption, headers, rows, ...(note ? { note } : {}) } as Block;
}

export function keyFacts(title: string, items: { label: string; value: string }[]): Block {
  return { type: "keyFacts", title, items } as Block;
}

/** Host of a URL, for a readable link label. */
export function host(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** `Font oficial: [domain](url)` */
export function sourceLine(locale: Locale, url: string): string {
  const label: Record<Locale, string> = {
    ca: "Font oficial",
    es: "Fuente oficial",
    en: "Official source",
  };
  return `${label[locale]}: [${host(url)}](${url})`;
}

export interface FeatureSource {
  name: string;
  url: string;
  publisher?: string | null;
}

export interface FeatureEdition {
  path: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  blocks: Block[];
}

export interface FeatureArticle {
  key: ArticleKey;
  entryKey: string;
  categoryKey: string;
  /** Image keys, when the files exist in the manifest. */
  heroKey?: string;
  secondaryKey?: string;
  heroAlt?: Record<Locale, string>;
  heroCaption?: Record<Locale, string>;
  secondaryAlt?: Record<Locale, string>;
  secondaryCaption?: Record<Locale, string>;
  sources: FeatureSource[];
  editions: Record<Locale, FeatureEdition>;
}
