/**
 * The 11 November 2026 general strike, city by city (6 Nov 2026): the keys,
 * names and paths of the Spanish-only city pages, in a module with no imports.
 *
 * Kept apart from `strike-11n-cities.ts` (the pages themselves) so that the
 * 11N page (`strike-11n.ts`) and the strikes hub (`strikes.ts`) can link to
 * the city pages without an import cycle: the city pages import both of them.
 *
 * Spanish only, on purpose: Search Console (2-4 Nov 2026) shows the demand
 * outside Catalonia ("huelga 11 noviembre madrid", "servicios mínimos huelga
 * 11 noviembre metro valencia") in Spanish; there are no Catalan or English
 * editions, so nothing here is linked from the ca or en pages.
 */

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
}

const P = "guias/huelga-general-11-noviembre-";

/** In order of population, which is also the order of the link lists. */
export const STRIKE_11N_CITY_REFS: Strike11nCityRef[] = [
  { key: "madrid", name: "Madrid", path: `${P}madrid` },
  { key: "valencia", name: "Valencia", path: `${P}valencia` },
  { key: "sevilla", name: "Sevilla", path: `${P}sevilla` },
  { key: "zaragoza", name: "Zaragoza", path: `${P}zaragoza` },
  { key: "malaga", name: "Málaga", path: `${P}malaga` },
  { key: "palma", name: "Palma", path: `${P}palma-mallorca` },
  { key: "lasPalmas", name: "Las Palmas de Gran Canaria", path: `${P}las-palmas-gran-canaria` },
  { key: "bilbao", name: "Bilbao", path: `${P}bilbao` },
  { key: "murcia", name: "Murcia", path: `${P}murcia` },
  { key: "alicante", name: "Alicante", path: `${P}alicante` },
  { key: "valladolid", name: "Valladolid", path: `${P}valladolid` },
  { key: "vigo", name: "Vigo", path: `${P}vigo` },
  { key: "coruna", name: "A Coruña", path: `${P}a-coruna` },
];

export function strike11nCityRef(key: Strike11nCityKey): Strike11nCityRef {
  const ref = STRIKE_11N_CITY_REFS.find((city) => city.key === key);
  if (!ref) throw new Error(`unknown 11N city ${key}`);
  return ref;
}

/** "/es/guias/huelga-general-11-noviembre-madrid/" */
export function strike11nCityHref(key: Strike11nCityKey): string {
  return `/es/${strike11nCityRef(key).path}/`;
}

/** "[Madrid](/es/...), [Valencia](/es/...) y [A Coruña](/es/...)": every city page, or all but one. */
export function strike11nCityLinks(except?: Strike11nCityKey): string {
  const links = STRIKE_11N_CITY_REFS.filter((city) => city.key !== except).map((city) => `[${city.name}](${strike11nCityHref(city.key)})`);
  return links.length <= 1 ? links.join("") : `${links.slice(0, -1).join(", ")} y ${links[links.length - 1]}`;
}
