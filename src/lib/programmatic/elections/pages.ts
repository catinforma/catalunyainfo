/**
 * Election results per municipality: which pages exist, their paths, titles,
 * descriptions, siblings and sitemap entries. Pure apart from `electionsSitemap`,
 * which reads the deployment's indexing switch like the rest of the sitemap.
 *
 * Tranche 1 (27 Oct 2026): the 100 most populous municipalities in Catalan and
 * Spanish, the 10 most populous in English. Tranche 2 (29 Oct 2026): the 300
 * most populous in Catalan and Spanish (down to 2,776 residents), 30 in
 * English (the 11 largest and `EN_RESORTS`). Tranche 3 (30 Oct 2026): all
 * 947 municipalities in Catalan and Spanish, down to Sant Jaume de Frontanyà
 * (25 residents), plus a page per comarca (43) with every town's 2023 result
 * in a table; English stays at 30. Population: Idescat, 1 Jan 2025.
 *
 * Small councils are rendered by their own rules (`councilSystem` in
 * results.ts): 174 councils of up to 250 residents elected with open lists
 * (LOREG art. 184), where the page prints no percentages and no D'Hondt,
 * and 5 in concejo abierto (art. 179.2), where voters elect the mayor.
 *
 * Doorway guardrail: every page carries data that exists only for its place
 * (the lists, votes and councillors, the D'Hondt quotients of its last seat,
 * its turnout against Catalonia's) inside guidance written once; the
 * snapshot script refuses any municipality whose figures do not add up or
 * whose councillors the rule for its size does not reproduce.
 */

import type { MetadataRoute } from "next";

import { caA, caComarca, caDe } from "@/lib/programmatic/holidays/names";
import { HTML_LANG, INTL_LOCALE, LOCALES, X_DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { absoluteUrl, indexingAllowed } from "@/lib/site";

import { englishSelection } from "./english";
import { capitalised, slugify } from "./names";
import { COMARCA_LOCALES, comarcaPath, electionPath, hubPath, PAGES_PER_LOCALE, type ComarcaLocale } from "./paths";
import { councilSystem, pooledTurnout, turnout } from "./results";
import { SNAPSHOT } from "./snapshot";
import type { ElectionsSnapshot, Municipality } from "./types";

export { COMARCA_LOCALES, comarcaPath, ELECTIONS_SEGMENT, electionPath, hubPath, isComarcaLocale, PAGES_PER_LOCALE, type ComarcaLocale } from "./paths";

/**
 * English: the big towns and the resorts, where English-speaking readers are
 * (`EN_LARGEST` and `EN_RESORTS`, in `english.ts`: the holiday family uses
 * the same selection).
 */
export { EN_LARGEST, EN_RESORTS } from "./english";

/**
 * The newest data the pages carry: the date the Generalitat's data were read,
 * or the date the 29N file was imported (`scripts/elections-29n.ts`) when later.
 */
export function latestDataDate(snapshot: ElectionsSnapshot = SNAPSHOT): string {
  const imported = snapshot.general2026?.source.importedAt;
  return imported && imported > snapshot.readAt ? imported : snapshot.readAt;
}

/** Prerendered at build time; the rest render once on first request. */
export const PRERENDERED_PER_LOCALE = 20;
/** Comarca pages prerendered at build time, the most populous first; the rest render on first request. */
export const PRERENDERED_COMARQUES = 4;

export const TITLE_LIMIT = 60;
export const DESCRIPTION_LIMIT = 155;

function pagesFor(locale: Locale): Municipality[] {
  if (locale !== "en") return SNAPSHOT.municipalities.slice(0, PAGES_PER_LOCALE[locale]);
  return englishSelection(SNAPSHOT.municipalities);
}

/** Computed once: the sitemap and every page's hreflang ask for them. */
const PAGES = Object.fromEntries(LOCALES.map((locale) => [locale, pagesFor(locale)])) as Record<Locale, Municipality[]>;
const SLUGS = Object.fromEntries(LOCALES.map((locale) => [locale, new Set(PAGES[locale].map((m) => m.slug))])) as Record<Locale, Set<string>>;

/** The municipalities with a page in this language, largest first. */
export function municipalitiesFor(locale: Locale): Municipality[] {
  return PAGES[locale];
}

/**
 * The municipality behind a URL, or null for a 404. `routeLocale` is the
 * language the route folder serves; any other `[locale]` param is a 404, so
 * `/es/eleccions/sabadell/` and `/ca/elections/barcelona/` never render.
 */
export function resolveElectionPage(routeLocale: Locale, locale: string, slug: string): Municipality | null {
  if (locale !== routeLocale || !SLUGS[routeLocale].has(slug)) return null;
  return municipalitiesFor(routeLocale).find((m) => m.slug === slug) ?? null;
}

/** Hubs exist in every language; any other locale on a route is a 404. */
export function resolveElectionsHub(routeLocale: Locale, locale: string): boolean {
  return locale === routeLocale;
}

/**
 * Both segments, always in the route's own locale. Next runs this once per
 * locale the layout generates and merges the result into it; an empty answer
 * for the other two locales left them without `municipi`, and Next 16.3 then
 * prerendered nothing for the route at all (read in
 * `next/dist/build/static-paths/app.js`, 27 Oct 2026). Returning the same
 * list every time, locale included, is deduplicated there.
 */
export function electionsStaticParams(routeLocale: Locale): { locale: string; municipi: string }[] {
  return municipalitiesFor(routeLocale)
    .slice(0, PRERENDERED_PER_LOCALE)
    .map((m) => ({ locale: routeLocale, municipi: m.slug }));
}

/** The language editions that exist for a municipality. */
export function electionTranslations(m: Municipality): Partial<Record<Locale, string>> {
  const out: Partial<Record<Locale, string>> = {};
  for (const locale of LOCALES) {
    if (SLUGS[locale].has(m.slug)) out[locale] = electionPath(locale, m.slug);
  }
  return out;
}

export function hubTranslations(): Partial<Record<Locale, string>> {
  return Object.fromEntries(LOCALES.map((locale) => [locale, hubPath(locale)])) as Record<Locale, string>;
}

/** The name as it is written in each language: Catalan keeps the lower-case article mid-sentence. */
export function placeName(m: Municipality, locale: Locale): string {
  return locale === "ca" ? m.name : capitalised(m.name);
}

/* -------------------------------------------------------------------------- */
/* Titles and descriptions                                                    */
/* -------------------------------------------------------------------------- */

const TITLES: Record<Locale, ((place: string) => string)[]> = {
  ca: [
    (p) => `Resultats eleccions ${p}: municipals 2023, generals i 29N`,
    (p) => `Resultats eleccions ${p}: municipals 2023 i 29N`,
    (p) => `Eleccions ${p}: municipals 2023, generals i 29N`,
    (p) => `Eleccions ${p}: municipals 2023 i 29N`,
    (p) => `Eleccions ${p}: resultats 2023`,
    // Names of 36-37 characters (Castell d'Aro, Platja d'Aro i s'Agaró).
    (p) => `Eleccions ${p}: 2023 i 29N`,
    // 42: Cruïlles, Monells i Sant Sadurní de l'Heura.
    (p) => `${p}: eleccions 2023`,
  ],
  es: [
    (p) => `Resultados elecciones ${p}: municipales 2023, generales y 29N`,
    (p) => `Resultados elecciones ${p}: municipales 2023 y 29N`,
    (p) => `Elecciones ${p}: municipales 2023, generales y 29N`,
    (p) => `Elecciones ${p}: municipales 2023 y 29N`,
    (p) => `Elecciones ${p}: resultados 2023`,
    (p) => `Elecciones ${p}: 2023 y 29N`,
    (p) => `${p}: elecciones 2023`,
  ],
  en: [
    (p) => `${p} election results: 2023 local, general and 29 Nov`,
    (p) => `${p} election results: 2023 local and 29 Nov`,
    (p) => `${p} election results: 2023 and 29 Nov`,
    (p) => `${p} elections: 2023 local results and 29 Nov`,
    (p) => `${p} elections: 2023 results`,
    (p) => `${p}: 2023 election results`,
    (p) => `${p}: elections 2023`,
  ],
};

/** The first title in the list that fits the limit. */
export function electionTitle(locale: Locale, m: Municipality): string {
  // Catalan keeps the article lower case mid-title ("Resultats eleccions la Garriga").
  const place = placeName(m, locale);
  const options = TITLES[locale].map((build) => build(place));
  return options.find((title) => title.length <= TITLE_LIMIT) ?? options[options.length - 1]!;
}

const pct = (value: number, locale: Locale) =>
  new Intl.NumberFormat(INTL_LOCALE[locale], { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);

export function electionDescription(locale: Locale, m: Municipality): string {
  const place = placeName(m, locale);
  const seats = m.municipal.seats;
  const t = pct(turnout(m.municipal), locale);
  // Concejo abierto (LOREG 179.2): one post, the mayoralty, not councillors.
  const council = councilSystem(m.municipal) === "council";
  const options: string[] = council
    ? locale === "ca"
      ? [
          `Municipals 2023 ${inCa(place)}: consell obert, amb elecció directa de l'alcaldia i participació del ${t} %. Generals 2023 i Parlament 2024 davant de Catalunya, i el 29N.`,
          `Municipals 2023 ${inCa(place)}: consell obert, elecció directa de l'alcaldia, participació del ${t} %. Generals, Parlament i 29N.`,
        ]
      : locale === "es"
        ? [
            `Municipales 2023 en ${place}: concejo abierto, con elección directa de la alcaldía y participación del ${t} %. Generales 2023 y Parlament 2024 frente a Cataluña, y el 29N.`,
            `Municipales 2023 en ${place}: concejo abierto, elección directa de la alcaldía, participación del ${t} %. Generales, Parlament y 29N.`,
          ]
        : [
            `${place} local election 2023: open council, the mayor elected directly, ${t}% turnout; the 2023 general and 2024 Catalan elections, and 29 Nov.`,
            `${place} local election 2023: open council, mayor elected directly, ${t}% turnout; general, Catalan and 29 Nov elections.`,
          ]
    : locale === "ca"
      ? [
          `Municipals 2023 ${inCa(place)}: ${seats} regidors i participació del ${t} %. Vots de cada llista, generals 2023 i Parlament 2024 davant de Catalunya, i el 29N.`,
          `Municipals 2023 ${inCa(place)}: ${seats} regidors, participació del ${t} %. Vots per llista, generals, Parlament i 29N.`,
          `Municipals 2023 ${inCa(place)}: ${seats} regidors i vots per llista. Generals, Parlament i 29N.`,
        ]
      : locale === "es"
        ? [
            `Municipales 2023 en ${place}: ${seats} concejales y participación del ${t} %. Votos de cada lista, generales 2023 y Parlament 2024 frente a Cataluña, y el 29N.`,
            `Municipales 2023 en ${place}: ${seats} concejales, participación del ${t} %. Votos por lista, generales, Parlament y 29N.`,
            `Municipales 2023 en ${place}: ${seats} concejales y votos por lista. Generales, Parlament y 29N.`,
          ]
        : [
            `${place} local election 2023: ${seats} councillors, ${t}% turnout, votes for every list; the 2023 general and 2024 Catalan elections against Catalonia, and 29 Nov.`,
            `${place} local election 2023: ${seats} councillors, ${t}% turnout and votes by list; general, Catalan and 29 Nov elections.`,
            `${place} local election 2023: ${seats} councillors and votes by list; general and 29 Nov elections.`,
          ];
  return options.find((text) => text.length <= DESCRIPTION_LIMIT) ?? options[options.length - 1]!;
}

const HUB_META: Record<Locale, { title: string; description: string; h1: string }> = {
  ca: {
    title: `Resultats eleccions per municipi: els ${PAGES_PER_LOCALE.ca} de Catalunya`,
    description: SNAPSHOT.general2026
      ? `Generals del 29N, municipals 2023, generals 2023 i Parlament 2024 als ${PAGES_PER_LOCALE.ca} municipis de Catalunya, per comarques. Dades oficials.`
      : `Municipals 2023, generals 2023 i Parlament 2024 als ${PAGES_PER_LOCALE.ca} municipis de Catalunya, per comarques, amb dades oficials i espai per al 29N.`,
    h1: "Resultats de les eleccions per municipi",
  },
  es: {
    title: `Resultados elecciones por municipio: los ${PAGES_PER_LOCALE.es} de Cataluña`,
    description: SNAPSHOT.general2026
      ? `Generales del 29N, municipales 2023, generales 2023 y Parlament 2024 en los ${PAGES_PER_LOCALE.es} municipios de Cataluña, por comarcas. Datos oficiales.`
      : `Municipales 2023, generales 2023 y Parlament 2024 en los ${PAGES_PER_LOCALE.es} municipios de Cataluña, por comarcas, con datos oficiales y espacio para el 29N.`,
    h1: "Resultados de las elecciones por municipio",
  },
  en: {
    title: "Catalonia election results by town: cities and resorts",
    description: SNAPSHOT.general2026
      ? `29 November general election, 2023 local and general and 2024 Catalan results in ${PAGES_PER_LOCALE.en} towns: Catalonia's largest and its main resorts. Official data.`
      : `2023 local, general and 2024 Catalan election results in ${PAGES_PER_LOCALE.en} towns: Catalonia's largest and its main resorts. Official data, with space for 29 November.`,
    h1: "Election results by town in Catalonia",
  },
};

export const hubMeta = (locale: Locale) => HUB_META[locale];

/* -------------------------------------------------------------------------- */
/* Catalan prepositions                                                       */
/* -------------------------------------------------------------------------- */

/** "a Sabadell", "a l'Hospitalet", "al Prat de Llobregat", "als ...". */
export function inCa(name: string): string {
  if (name.startsWith("el ")) return `al ${name.slice(3)}`;
  if (name.startsWith("els ")) return `als ${name.slice(4)}`;
  return `a ${name}`;
}

/** "de Sabadell", "d'Igualada", "de l'Hospitalet", "del Prat", "de la Garriga". */
export function ofCa(name: string): string {
  if (name.startsWith("el ")) return `del ${name.slice(3)}`;
  if (name.startsWith("els ")) return `dels ${name.slice(4)}`;
  if (/^(l'|la |les )/.test(name)) return `de ${name}`;
  if (/^[aeiouàèéíòóúAEIOUÀÈÉÍÒÓÚ]/.test(name) || /^h[aeiouàèéíòóú]/i.test(name)) return `d'${name}`;
  return `de ${name}`;
}

/* -------------------------------------------------------------------------- */
/* Hub groups and siblings                                                    */
/* -------------------------------------------------------------------------- */

export interface ComarcaGroup {
  /** As the register of local authorities writes it: "Vallès Oriental". */
  comarca: string;
  /** URL segment of the comarca page, the same as the holiday family's: "valles-oriental". */
  slug: string;
  /** Its municipalities with a page in the language asked for, largest first. */
  municipalities: Municipality[];
}

function groupsOf(list: Municipality[]): ComarcaGroup[] {
  const groups = new Map<string, Municipality[]>();
  for (const m of list) groups.set(m.comarca, [...(groups.get(m.comarca) ?? []), m]);
  return [...groups.entries()]
    .map(([comarca, towns]) => ({ comarca, slug: slugify(comarca), municipalities: towns }))
    .sort((a, b) => a.comarca.localeCompare(b.comarca, "ca"));
}

const GROUPS = Object.fromEntries(LOCALES.map((locale) => [locale, groupsOf(PAGES[locale])])) as Record<Locale, ComarcaGroup[]>;

/** The comarques with at least one page in this language, by name; each with its towns, largest first. */
export function byComarca(locale: Locale): ComarcaGroup[] {
  return GROUPS[locale];
}

/** The hub's anchor for a comarca's list: "Vallès Oriental" -> "c-valles-oriental". */
export const comarcaAnchor = (comarca: string): string => `c-${slugify(comarca)}`;

/** Every comarca, with all its municipalities: the comarca pages (Catalan and Spanish, which cover every town). */
export function comarques(): ComarcaGroup[] {
  return GROUPS.ca;
}

const COMARCA_BY_SLUG = new Map(GROUPS.ca.map((g) => [g.slug, g]));

/** The comarca of a municipality, with every town in it. */
export function comarcaOf(m: Pick<Municipality, "comarca">): ComarcaGroup {
  return COMARCA_BY_SLUG.get(slugify(m.comarca))!;
}

/**
 * The comarca behind a URL, or null for a 404: `routeLocale` is the language
 * the route folder serves (ca or es; English has no comarca pages), and any
 * other `[locale]` param or unknown slug is a 404.
 */
export function resolveComarcaPage(routeLocale: ComarcaLocale, locale: string, slug: string): ComarcaGroup | null {
  if (locale !== routeLocale) return null;
  return COMARCA_BY_SLUG.get(slug) ?? null;
}

/** Both segments, always in the route's own locale (see `electionsStaticParams`): the most populous comarques. */
export function comarcaStaticParams(routeLocale: ComarcaLocale): { locale: string; comarca: string }[] {
  const people = (g: ComarcaGroup) => g.municipalities.reduce((n, m) => n + m.population, 0);
  return [...comarques()]
    .sort((a, b) => people(b) - people(a) || a.slug.localeCompare(b.slug))
    .slice(0, PRERENDERED_COMARQUES)
    .map((g) => ({ locale: routeLocale, comarca: g.slug }));
}

export function comarcaTranslations(slug: string): Record<ComarcaLocale, string> {
  return Object.fromEntries(COMARCA_LOCALES.map((locale) => [locale, comarcaPath(locale, slug)])) as Record<ComarcaLocale, string>;
}

/** "al Bages", "a l'Alt Empordà", "a la Selva", "a Osona". */
export const caInComarca = (comarca: string): string => caA(caComarca(comarca));
/** "del Bages", "de l'Alt Empordà", "d'Osona". */
export const caOfComarca = (comarca: string): string => caDe(caComarca(comarca));

const fit = (options: string[], limit: number) => options.find((text) => text.length <= limit) ?? options[options.length - 1]!;

export function comarcaTitle(locale: ComarcaLocale, g: ComarcaGroup): string {
  const n = g.municipalities.length;
  if (locale === "ca") {
    const a = caInComarca(g.comarca);
    return fit(
      [`Eleccions municipals 2023 ${a}: resultats per municipi`, `Municipals 2023 ${a}: resultats per municipi`, `Municipals 2023 ${a}: els ${n} municipis`, `Eleccions ${g.comarca} 2023`],
      TITLE_LIMIT,
    );
  }
  return fit([`${g.comarca}: elecciones municipales 2023 por municipio`, `${g.comarca}: municipales 2023 por municipio`, `Elecciones ${g.comarca} 2023`], TITLE_LIMIT);
}

export function comarcaH1(locale: ComarcaLocale, g: ComarcaGroup): string {
  return locale === "ca"
    ? `Resultats de les eleccions municipals del 2023 ${caInComarca(g.comarca)}`
    : `${g.comarca}: resultados de las elecciones municipales de 2023 por municipio`;
}

export function comarcaDescription(locale: ComarcaLocale, g: ComarcaGroup): string {
  const n = g.municipalities.length;
  const t = pct(pooledTurnout(g.municipalities.map((m) => m.municipal)), locale);
  if (locale === "ca") {
    const de = caOfComarca(g.comarca);
    return fit(
      [
        `Municipals del 2023 als ${n} municipis ${de}: la llista amb més regidors, els regidors i la participació de cadascun. Participació conjunta: ${t} %.`,
        `Municipals del 2023 als ${n} municipis ${de}: llista amb més regidors i participació de cadascun. Participació: ${t} %.`,
        `Municipals del 2023 als ${n} municipis ${de}: regidors i participació de cadascun.`,
      ],
      DESCRIPTION_LIMIT,
    );
  }
  return fit(
    [
      `Municipales de 2023 en los ${n} municipios de la comarca ${g.comarca}: la lista con más concejales, los concejales y la participación de cada uno. Participación: ${t} %.`,
      `Municipales de 2023 en los ${n} municipios de la comarca ${g.comarca}: lista con más concejales y participación de cada uno. Participación: ${t} %.`,
      `Municipales de 2023 en los ${n} municipios de la comarca ${g.comarca}: concejales y participación de cada uno.`,
    ],
    DESCRIPTION_LIMIT,
  );
}

/**
 * Other pages to read next, up to `limit`: the same comarca, then the
 * nearest in size elsewhere in the province. In a comarca with more pages
 * than links (30 in the Vallès Oriental), the comarca's largest town and then
 * the towns nearest in population; at least two links always go to other
 * comarques, so a comarca with one page (Moià, the Moianès) is linked from
 * its neighbours in size too. Comarca links are listed largest first. Since
 * tranche 3 a comarca can hold 68 towns (Alt Empordà): the comarca page
 * links every one of them, and every town page links its comarca page.
 */
export const SIBLINGS_OTHER_COMARQUES = 2;

export function siblings(m: Municipality, locale: Locale, limit = 8): { sameComarca: Municipality[]; sameProvince: Municipality[] } {
  const pool = municipalitiesFor(locale).filter((x) => x.slug !== m.slug);
  const nearest = (a: Municipality, b: Municipality) =>
    Math.abs(a.population - m.population) - Math.abs(b.population - m.population) || b.population - a.population || a.slug.localeCompare(b.slug);
  const province = pool.filter((x) => x.province === m.province && x.comarca !== m.comarca).sort(nearest);
  const comarca = pool.filter((x) => x.comarca === m.comarca);
  const comarcaRoom = Math.max(1, limit - Math.min(SIBLINGS_OTHER_COMARQUES, province.length));
  const [largest, ...rest] = comarca;
  const sameComarca =
    comarca.length <= comarcaRoom || !largest
      ? comarca
      : [largest, ...rest.sort(nearest).slice(0, comarcaRoom - 1)].sort((a, b) => b.population - a.population || a.slug.localeCompare(b.slug));
  const room = Math.max(0, Math.min(4, limit - sameComarca.length));
  return { sameComarca, sameProvince: province.slice(0, room) };
}

/* -------------------------------------------------------------------------- */
/* Sitemap                                                                    */
/* -------------------------------------------------------------------------- */

export interface ElectionsSitemapPath {
  path: string;
  /** The snapshot's newest data date (`latestDataDate`): the only date these pages carry. */
  lastModified: string;
  translations: Partial<Record<Locale, string>>;
}

export function electionsSitemapPaths(): ElectionsSitemapPath[] {
  const lastModified = latestDataDate();
  const hubs = LOCALES.map((locale) => ({ path: hubPath(locale), lastModified, translations: hubTranslations() }));
  const groups = COMARCA_LOCALES.flatMap((locale) =>
    comarques().map((g) => ({ path: comarcaPath(locale, g.slug), lastModified, translations: comarcaTranslations(g.slug) })),
  );
  const pages = LOCALES.flatMap((locale) =>
    municipalitiesFor(locale).map((m) => ({ path: electionPath(locale, m.slug), lastModified, translations: electionTranslations(m) })),
  );
  return [...hubs, ...groups, ...pages];
}

/** Sitemap entries, with hreflang alternates; nothing on a non-indexable deployment. */
export function electionsSitemap(): MetadataRoute.Sitemap {
  if (!indexingAllowed()) return [];
  return electionsSitemapPaths().map((entry) => {
    const languages: Record<string, string> = {};
    for (const locale of LOCALES) {
      const href = entry.translations[locale];
      if (href) languages[HTML_LANG[locale]] = absoluteUrl(href);
    }
    const fallback = entry.translations[X_DEFAULT_LOCALE] ?? entry.translations.ca;
    if (fallback) languages["x-default"] = absoluteUrl(fallback);
    return {
      url: absoluteUrl(entry.path),
      lastModified: new Date(`${entry.lastModified}T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: { languages },
    };
  });
}
