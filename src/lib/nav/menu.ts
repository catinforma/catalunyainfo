import type { Locale } from "@/lib/i18n/config";

/**
 * The topical entries of the site menu: the hubs that carry the traffic.
 *
 * Chosen from Search Console, 28 days to 11 Nov 2026 (`snapshot.py families 28`
 * and `pages 28`, impressions summed by topic): strikes 538k (es 466k, ca 54k,
 * en 18k), holidays 160k (es 128k, ca 28k, en 3.5k), elections 154k (es 76k,
 * ca 54k, en 24k), school calendar 14k. Each edition orders them by its own
 * numbers. Every target is an evergreen, indexable hub in all three languages
 * (none is on lib/seo/low-demand.ts); tests/site-nav.test.ts checks each path
 * against the module that publishes it, so a renamed slug fails the suite
 * instead of leaving a dead menu link.
 *
 * `primary` entries sit in the desktop bar; `more` entries go in its "More"
 * group. The phone menu lists all of them.
 */

export type MenuKey = "strikes" | "holidays" | "elections" | "school" | "localHolidays" | "spain2027" | "contact";

export interface MenuItem {
  key: MenuKey;
  label: string;
  href: string;
}

export const MENU_PATHS: Record<MenuKey, Record<Locale, string>> = {
  // The strikes calendar hub (batch02 `strikes`), which links on to the Spain-wide one.
  strikes: {
    ca: "/ca/guies/vaga-avui-catalunya/",
    es: "/es/guias/huelga-hoy-cataluna/",
    en: "/en/guides/strike-barcelona-catalonia-today/",
  },
  // The 2027 work calendar for Catalonia (batch02 `workCalendar`): the
  // holiday page with the most impressions in all three editions.
  holidays: {
    ca: "/ca/guies/calendari-laboral-catalunya/",
    es: "/es/guias/calendario-laboral-cataluna/",
    en: "/en/guides/catalonia-public-holidays/",
  },
  // The elections hub: results for every municipality, the 29N night included.
  elections: { ca: "/ca/eleccions/", es: "/es/elecciones/", en: "/en/elections/" },
  school: {
    ca: "/ca/guies/calendari-escolar-catalunya/",
    es: "/es/guias/calendario-escolar-cataluna/",
    en: "/en/guides/catalonia-school-calendar/",
  },
  // Local holidays, town by town (2026 and 2027).
  localHolidays: { ca: "/ca/festius/", es: "/es/festivos/", en: "/en/holidays/" },
  // Spain's 2027 calendar, community by community.
  spain2027: { ca: "/ca/festius/2027/", es: "/es/festivos/2027/", en: "/en/holidays/2027/" },
  contact: { ca: "/ca/contacte/", es: "/es/contacto/", en: "/en/contact/" },
};

export const MENU_LABELS: Record<MenuKey, Record<Locale, string>> = {
  strikes: { ca: "Vagues", es: "Huelgas", en: "Strikes" },
  holidays: { ca: "Festius", es: "Festivos", en: "Holidays" },
  elections: { ca: "Eleccions", es: "Elecciones", en: "Elections" },
  school: { ca: "Calendari escolar", es: "Calendario escolar", en: "School calendar" },
  localHolidays: { ca: "Festius per municipi", es: "Festivos por municipio", en: "Holidays by town" },
  spain2027: { ca: "Festius 2027 a Espanya", es: "Festivos 2027 en España", en: "Spain holidays 2027" },
  contact: { ca: "Contacte", es: "Contacto", en: "Contact" },
};

/** Desktop-bar entries, before the section hubs, ordered by each edition's impressions. */
export const PRIMARY_ORDER: Record<Locale, MenuKey[]> = {
  es: ["strikes", "holidays", "elections"],
  ca: ["elections", "strikes", "holidays"],
  en: ["elections", "strikes", "holidays"],
};

/** The "More" group, after the section hubs. */
export const MORE_ORDER: MenuKey[] = ["school", "localHolidays", "spain2027", "contact"];

/** Label of the desktop "More" group. */
export const MORE_LABEL: Record<Locale, string> = { ca: "Més", es: "Más", en: "More" };

/** Accessible name of the phone menu button. */
export const MENU_BUTTON_LABEL: Record<Locale, string> = { ca: "Menú", es: "Menú", en: "Menu" };

function item(key: MenuKey, locale: Locale): MenuItem {
  return { key, label: MENU_LABELS[key][locale], href: MENU_PATHS[key][locale] };
}

export function primaryItems(locale: Locale): MenuItem[] {
  return PRIMARY_ORDER[locale].map((key) => item(key, locale));
}

export function moreItems(locale: Locale): MenuItem[] {
  return MORE_ORDER.map((key) => item(key, locale));
}
