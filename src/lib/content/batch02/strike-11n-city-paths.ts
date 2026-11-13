/**
 * The 11 November 2026 general strike, city by city (6 Nov 2026): the keys,
 * names and paths of the Spanish-only city pages, in a module with no imports.
 *
 * Kept apart from `strike-11n-cities.ts` (the pages themselves) so that the
 * 11N page (`strike-11n.ts`) and the strikes hub (`strikes.ts`) can link to
 * the city pages without an import cycle: the city pages import both of them.
 *
 * Spanish first: Search Console (2-4 Nov 2026) shows the demand outside
 * Catalonia ("huelga 11 noviembre madrid", "servicios mínimos huelga 11
 * noviembre metro valencia") in Spanish. Since 10 Nov 2026 every page also has
 * a Catalan and an English edition (`paths`, `names`); the Spanish `path` and
 * `name` are the Spanish ones, unchanged.
 */

type Locale = "ca" | "es" | "en";

export type Strike11nCityKey =
  | "madrid"
  | "valencia"
  | "sevilla"
  | "zaragoza"
  | "malaga"
  | "bilbao"
  | "palma"
  | "lasPalmas"
  | "murcia"
  | "alicante"
  | "valladolid"
  | "vigo"
  | "coruna";

export interface Strike11nCityRef {
  key: Strike11nCityKey;
  /** The name as the page's H1 and links write it. */
  name: string;
  /** Path after `/es/`, no leading or trailing slash. No year: the URL is the strike's, not the season's. */
  path: string;
  /** The name in each language ("València", "Seville"); `names.es` is `name`. */
  names: Record<Locale, string>;
  /** The path after `/<locale>/` in each language; `paths.es` is `path`. */
  paths: Record<Locale, string>;
}

const P = { ca: "guies/vaga-general-11-novembre-", es: "guias/huelga-general-11-noviembre-", en: "guides/general-strike-11-november-" };

function city(key: Strike11nCityKey, names: [string, string, string], slugs: [string, string, string]): Strike11nCityRef {
  const [ca, es, en] = names;
  const paths = { ca: `${P.ca}${slugs[0]}`, es: `${P.es}${slugs[1]}`, en: `${P.en}${slugs[2]}` };
  return { key, name: es, path: paths.es, names: { ca, es, en }, paths };
}

/** In order of population, which is also the order of the link lists. */
export const STRIKE_11N_CITY_REFS: Strike11nCityRef[] = [
  city("madrid", ["Madrid", "Madrid", "Madrid"], ["madrid", "madrid", "madrid"]),
  city("valencia", ["València", "Valencia", "Valencia"], ["valencia", "valencia", "valencia"]),
  city("sevilla", ["Sevilla", "Sevilla", "Seville"], ["sevilla", "sevilla", "seville"]),
  city("zaragoza", ["Saragossa", "Zaragoza", "Zaragoza"], ["saragossa", "zaragoza", "zaragoza"]),
  city("malaga", ["Màlaga", "Málaga", "Málaga"], ["malaga", "malaga", "malaga"]),
  city("palma", ["Palma", "Palma", "Palma"], ["palma-mallorca", "palma-mallorca", "palma-mallorca"]),
  city("lasPalmas", ["Las Palmas de Gran Canària", "Las Palmas de Gran Canaria", "Las Palmas de Gran Canaria"], ["las-palmas-gran-canaria", "las-palmas-gran-canaria", "las-palmas-gran-canaria"]),
  city("bilbao", ["Bilbao", "Bilbao", "Bilbao"], ["bilbao", "bilbao", "bilbao"]),
  city("murcia", ["Múrcia", "Murcia", "Murcia"], ["murcia", "murcia", "murcia"]),
  city("alicante", ["Alacant", "Alicante", "Alicante"], ["alacant", "alicante", "alicante"]),
  city("valladolid", ["Valladolid", "Valladolid", "Valladolid"], ["valladolid", "valladolid", "valladolid"]),
  city("vigo", ["Vigo", "Vigo", "Vigo"], ["vigo", "vigo", "vigo"]),
  city("coruna", ["A Coruña", "A Coruña", "A Coruña"], ["a-coruna", "a-coruna", "a-coruna"]),
];

export function strike11nCityRef(key: Strike11nCityKey): Strike11nCityRef {
  const ref = STRIKE_11N_CITY_REFS.find((city) => city.key === key);
  if (!ref) throw new Error(`unknown 11N city ${key}`);
  return ref;
}

/** "/es/guias/huelga-general-11-noviembre-madrid/", "/ca/guies/vaga-general-11-novembre-madrid/" */
export function strike11nCityHref(key: Strike11nCityKey, locale: Locale = "es"): string {
  return `/${locale}/${strike11nCityRef(key).paths[locale]}/`;
}

/**
 * The Spain-wide 11N page (`strike-11n-spain.ts`), here so that the city pages
 * can link it without an import cycle (the Spain page imports them).
 */
export const STRIKE_11N_SPAIN_PATHS: Record<Locale, string> = {
  ca: "guies/vaga-general-11-novembre-espanya",
  es: "guias/huelga-general-11-noviembre-espana",
  en: "guides/general-strike-11-november-spain-by-city",
};

const AND: Record<Locale, string> = { ca: "i", es: "y", en: "and" };

/** "[Madrid](/es/...), [Valencia](/es/...) y [A Coruña](/es/...)": every city page, or all but one, in one language. */
export function strike11nCityLinks(except?: Strike11nCityKey, locale: Locale = "es"): string {
  const links = STRIKE_11N_CITY_REFS.filter((city) => city.key !== except).map((city) => `[${city.names[locale]}](${strike11nCityHref(city.key, locale)})`);
  return links.length <= 1 ? links.join("") : `${links.slice(0, -1).join(", ")} ${AND[locale]} ${links[links.length - 1]}`;
}
