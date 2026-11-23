import { B2_TITLES, b2href, type B2Key } from "@/lib/content/batch02/shared";
import { STRIKES_AS_OF } from "@/lib/content/batch02/strikes";
import { STRIKES_SPAIN_AS_OF } from "@/lib/content/batch02/strikes-spain-data";
import { HUB_PATHS as SCHOOL_SPAIN_HUB_PATHS } from "@/lib/content/school-spain/regions";
import type { Locale } from "@/lib/i18n/config";
import { hubEditions as spain2027HubEditions } from "@/lib/programmatic/spain-2027/editions";
import { zbeCityPath, zbeHubPath } from "@/lib/programmatic/zbe/paths";
import { zaHubPath } from "@/lib/programmatic/zona-azul/paths";

import { CATALONIA_STRIKE_KEYS, DECEMBER_BRIDGE_LAST_DAY, SPAIN_STRIKE_KEYS, STRIKE_11N_SPAIN_KEY_PREFIX, b2KeyForHref, type NextStep } from "./next-step";
import { pathOnly, type NextStepLink } from "./next-step-core";

/**
 * "Útil ahora" / "Útil ara" / "Useful now" (23 Nov 2026): a compact list of
 * evergreen pages at the foot of the strike pages' main column, after the
 * body and before the sources.
 *
 * Why (GSC 26 Oct–23 Nov 2026, `snapshot.py families 28` and `pages 28`):
 * /es/guias/ and /ca/guies/ took 68 % of the site's impressions, mostly
 * strike pages (huelga-20-noviembre 52k, huelgas-espana 30k,
 * huelga-hoy-cataluna 83k, vaga-20-novembre 12k, huelga-26-noviembre 11k).
 * Their links pointed only at other strike pages, the header and the footer:
 * the live crawl of 23 Nov found no link from any of them to the December
 * bridge, the shops, the 2027 work calendar (position 21), the Barcelona
 * parking guide (0.3 % CTR at 7.8) or the new zona azul and ZBE families.
 * These are the pages a strike reader asks about next (is the Monday a
 * holiday, are the shops open, can I drive into the city if the trains
 * stop), and they rank on demand that lasts all year.
 *
 * Rules (the same as the "next useful step" box, next-step.ts):
 *  - Links only, no fact of its own. Each anchor is the target page's own
 *    title, or the sentence that already links it from the 11N pages
 *    (strike-11n-next.ts). tests/useful-now.test.ts holds both.
 *  - Never the page itself, nor a link the "next useful step" box of the same
 *    page already carries; 3 to USEFUL_NOW_MAX_LINKS links.
 *  - Dated links follow the strike pages' own switch (STRIKES_AS_OF /
 *    STRIKES_SPAIN_AS_OF, no clock), so the HTML only changes with a deploy.
 *  - Not on the 11N pages for the rest of Spain: their "Y ahora en <ciudad>"
 *    section (strike-11n-next.ts) already does this per city.
 *  - Rendered by the template (components/UsefulNow.tsx), never stored in a
 *    body: turning it off needs a deploy only, no republish.
 *  - Clicks are `related_content_click` with `link_context: "useful_now"`.
 */

export type UsefulNowScope = "catalonia" | "spain";

export interface UsefulNow {
  scope: UsefulNowScope;
  links: NextStepLink[];
}

export const USEFUL_NOW_MAX_LINKS = 5;
export const USEFUL_NOW_MIN_LINKS = 3;

export const USEFUL_NOW_TITLE: Record<Locale, string> = {
  ca: "Útil ara",
  es: "Útil ahora",
  en: "Useful now",
};

/** Barcelona metro, bus and Rodalies at Christmas: the seasonal link once the December bridge is past. */
export const CHRISTMAS_TRANSPORT_LAST_DAY = "2027-01-07";

const b = (key: B2Key, locale: Locale): NextStepLink => ({ href: b2href(key, locale), label: B2_TITLES[key][locale] });

/** The Spain-wide December pages, with the anchors the 11N pages already use for them (strike-11n-next.ts). */
export const SPAIN_DECEMBER_LABELS: Record<"bridge" | "shops", Record<Locale, string>> = {
  bridge: {
    es: "Puente de diciembre 2026: dónde es festivo el lunes 7, comunidad por comunidad",
    ca: "Pont de desembre 2026: on és festiu el dilluns 7, comunitat per comunitat",
    en: "December 2026 long weekend: where Monday 7 December is a holiday, region by region",
  },
  shops: {
    es: "Tiendas abiertas el 6, 7 y 8 de diciembre y en Navidad, por comunidad",
    ca: "Botigues obertes el 6, 7 i 8 de desembre i per Nadal, per comunitat",
    en: "Shops open on 6, 7 and 8 December and at Christmas in Spain, by region",
  },
};

/** School and 2027 pages for Spain, with the 11N Spain page's anchors (strike-11n-next.ts spainNextLinks). */
export const SPAIN_SCHOOL_LABEL: Record<Locale, string> = {
  es: "Vacaciones de Navidad 2026-27 por comunidades: calendario escolar",
  ca: "Vacances de Nadal 2026-27 per comunitats: calendari escolar",
  en: "Christmas school holidays 2026-27 by region: school calendar",
};
export const SPAIN_2027_LABEL: Record<Locale, string> = {
  es: "Festivos 2027 en España: calendario laboral por comunidad y ciudad",
  ca: "Festius 2027 a Espanya: calendari laboral per comunitat i ciutat",
  en: "Public holidays 2027 in Spain: work calendar by region and city",
};

/** The two hubs' own titles (zona-azul/copy.ts hubView, zbe/copy.ts hubMeta); the test holds them equal. */
export const ZONA_AZUL_HUB_LABEL: Record<Locale, string> = {
  es: "Zona azul por ciudad: horarios y precios",
  ca: "Zona blava per ciutat: horaris i preus",
  en: "Blue zone parking in Spain by city: hours and prices",
};
export const ZBE_HUB_LABEL: Record<Locale, string> = {
  es: "ZBE en España: ciudades, etiquetas y horarios",
  ca: "ZBE a Espanya: ciutats, etiquetes i horaris",
  en: "Low-emission zones in Spain (ZBE): cities, labels, hours",
};
/** The Barcelona ZBE page's own title (zbe/copy.ts cityMeta). */
export const ZBE_BARCELONA_LABEL: Record<Locale, string> = {
  es: "ZBE Barcelona: etiquetas, horario, mapa y multa",
  ca: "ZBE Barcelona: etiquetes, horari, mapa i multa",
  en: "Barcelona low-emission zone (ZBE): labels, hours, fines",
};

/**
 * Catalonia (the strikes hub, 11N, Renfe and education guides): the season's
 * holiday page (December bridge to 8 Dec, Christmas transport to 7 Jan, then
 * the 2027 bridges), shops on Sundays and holidays, the 2027 work calendar,
 * then driving into Barcelona (parking, ZBE).
 */
function cataloniaLinks(locale: Locale, asOf: string): NextStepLink[] {
  const season =
    asOf <= DECEMBER_BRIDGE_LAST_DAY ? b("decemberBridge", locale) : asOf <= CHRISTMAS_TRANSPORT_LAST_DAY ? b("christmasTransport", locale) : b("bridges2027", locale);
  return [
    season,
    b("shops", locale),
    b("workCalendar", locale),
    b("parking", locale),
    { href: zbeCityPath(locale, "barcelona"), label: ZBE_BARCELONA_LABEL[locale] },
  ];
}

/**
 * Rest of Spain (the Spain strikes calendar, the 17N rail page, the day
 * pages): the December bridge and shops by community to 8 Dec, the school
 * holidays by community to 7 Jan, then the zona azul and ZBE hubs (cities
 * across Spain), and the 2027 calendar for Spain when a slot is left.
 */
function spainLinks(locale: Locale, asOf: string): NextStepLink[] {
  const december = asOf <= DECEMBER_BRIDGE_LAST_DAY;
  return [
    december ? { href: b2href("decemberBridgeSpain", locale), label: SPAIN_DECEMBER_LABELS.bridge[locale] } : null,
    december ? { href: b2href("shopsSpainDecember", locale), label: SPAIN_DECEMBER_LABELS.shops[locale] } : null,
    asOf <= CHRISTMAS_TRANSPORT_LAST_DAY ? { href: `/${locale}/${SCHOOL_SPAIN_HUB_PATHS[locale]}/`, label: SPAIN_SCHOOL_LABEL[locale] } : null,
    { href: zaHubPath(locale), label: ZONA_AZUL_HUB_LABEL[locale] },
    { href: zbeHubPath(locale), label: ZBE_HUB_LABEL[locale] },
    { href: spain2027HubEditions()[locale], label: SPAIN_2027_LABEL[locale] },
  ].filter((link): link is NextStepLink => link !== null);
}

/** Which list a content page gets, from its path and `entries.key`; null off the strike families. */
export function usefulNowScope(entry: { href: string; key?: string | null }): UsefulNowScope | null {
  if (entry.key?.startsWith(STRIKE_11N_SPAIN_KEY_PREFIX)) return null;
  const key = b2KeyForHref(entry.href);
  if (!key) return null;
  if (CATALONIA_STRIKE_KEYS.includes(key)) return "catalonia";
  if (SPAIN_STRIKE_KEYS.includes(key)) return "spain";
  return null;
}

/**
 * The list for one page: never the page itself or a path the page's "next
 * useful step" box already links, at most USEFUL_NOW_MAX_LINKS; null below
 * USEFUL_NOW_MIN_LINKS (a two-link block reads as an afterthought).
 */
export function usefulNow(
  entry: { href: string; key?: string | null; locale: Locale },
  step: NextStep | null,
  asOf: string = STRIKES_AS_OF > STRIKES_SPAIN_AS_OF ? STRIKES_AS_OF : STRIKES_SPAIN_AS_OF,
): UsefulNow | null {
  const scope = usefulNowScope(entry);
  if (!scope) return null;
  const candidates = scope === "catalonia" ? cataloniaLinks(entry.locale, asOf) : spainLinks(entry.locale, asOf);
  const seen = new Set<string>([pathOnly(entry.href), ...(step?.links ?? []).map((link) => pathOnly(link.href))]);
  const links: NextStepLink[] = [];
  for (const link of candidates) {
    const path = pathOnly(link.href);
    if (seen.has(path)) continue;
    seen.add(path);
    links.push(link);
    if (links.length >= USEFUL_NOW_MAX_LINKS) break;
  }
  return links.length >= USEFUL_NOW_MIN_LINKS ? { scope, links } : null;
}
