import type { Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";

import { b2link, h2, list, type B2Key } from "./shared";

/**
 * 25 Nov 2026 (December demand, audit section 2 "sense classificar" and 7):
 * the durable Christmas-season guides (Barcelona in December, New Year's Eve,
 * the lights, the markets hub, the Three Kings, the shops guide, "is today a
 * holiday?") each send the reader to the next one with the words people
 * search, not the page's title. One place for the anchors, so the pages say
 * the same thing the same way. No date or figure lives here: the linked page
 * carries them, so nothing in this file can go stale.
 */

export type SeasonKey = Extract<B2Key, "barcelonaDecember" | "christmasLights" | "christmas" | "reis" | "shops" | "holidayToday" | "newYear">;

interface Entry {
  label: string;
  gloss: string;
}

const ENTRIES: Record<SeasonKey, Record<Locale, Entry>> = {
  barcelonaDecember: {
    ca: { label: "què fer a Barcelona al desembre del 2026", gloss: "festius, botigues, concerts, La Marató i Cap d'Any, dia a dia" },
    es: { label: "qué hacer en Barcelona en diciembre de 2026", gloss: "festivos, tiendas, conciertos, La Marató y Nochevieja, día a día" },
    en: { label: "what to do in Barcelona in December 2026", gloss: "holidays, shops, concerts, La Marató and New Year's Eve, day by day" },
  },
  christmasLights: {
    ca: { label: "encesa de llums de Nadal 2026 a Barcelona", gloss: "data, hora i lloc, i els llums d'altres municipis" },
    es: { label: "encendido de luces de Navidad 2026 en Barcelona", gloss: "fecha, hora y lugar, y las luces de otros municipios" },
    en: { label: "Barcelona Christmas lights 2026", gloss: "switch-on date, time and place, and other towns' lights" },
  },
  christmas: {
    ca: { label: "mercats i fires de Nadal a Catalunya 2026", gloss: "la Fira de Santa Llúcia i les fires amb data oficial" },
    es: { label: "mercados y ferias de Navidad en Cataluña 2026", gloss: "la Fira de Santa Llúcia y las ferias con fecha oficial" },
    en: { label: "Christmas markets in Catalonia 2026", gloss: "the Fira de Santa Llúcia and the fairs with an official date" },
  },
  reis: {
    ca: { label: "Cavalcada de Reis 2027", gloss: "què se sap de l'horari i el recorregut, a Barcelona i a altres ciutats" },
    es: { label: "Cabalgata de Reyes 2027", gloss: "qué se sabe del horario y el recorrido, en Barcelona y en otras ciudades" },
    en: { label: "Three Kings parade 2027", gloss: "what is known of the times and route, in Barcelona and other towns" },
  },
  shops: {
    ca: { label: "botigues obertes els diumenges de desembre i els festius", gloss: "quins diumenges i festius poden obrir" },
    es: { label: "tiendas abiertas en los domingos de diciembre y festivos", gloss: "qué domingos y festivos pueden abrir" },
    en: { label: "shops open on December Sundays and holidays", gloss: "which Sundays and holidays shops may open" },
  },
  holidayToday: {
    ca: { label: "és festiu avui a Catalunya?", gloss: "avui, demà i al teu municipi" },
    es: { label: "¿es festivo hoy en Cataluña?", gloss: "hoy, mañana y en tu municipio" },
    en: { label: "is today a holiday in Catalonia?", gloss: "today, tomorrow and in your town" },
  },
  newYear: {
    ca: { label: "Cap d'Any a Barcelona 2026", gloss: "la festa, el metro tota la nit i què obre l'1 de gener" },
    es: { label: "Nochevieja en Barcelona 2026", gloss: "la fiesta, el metro toda la noche y qué abre el 1 de enero" },
    en: { label: "New Year's Eve in Barcelona 2026", gloss: "the show, the all-night metro and what is open on 1 January" },
  },
};

const HEADING: Record<Locale, string> = {
  ca: "Per a les festes: llums, fires, botigues i festius",
  es: "Para las fiestas: luces, ferias, tiendas y festivos",
  en: "For the holidays: lights, markets, shops and holidays",
};

/**
 * 27 Nov 2026 (batch 8M): the two Christmas hubs now open with a dated
 * calendar, 1 December to the end of the school holidays (christmas-calendar.ts).
 * The seasonal pages send readers to it with the words people search for the
 * whole season. No date here either: the gloss names the stretch, not its days.
 */
export type CalendarHubKey = Extract<B2Key, "christmas" | "christmasBarcelona">;

const CALENDAR_HUBS: Record<CalendarHubKey, Record<Locale, Entry>> = {
  christmas: {
    ca: { label: "calendari de Nadal 2026 a Catalunya", gloss: "festius, botigues obertes, vacances escolars i loteries, del pont de desembre a Reis" },
    es: { label: "calendario de Navidad 2026 en Cataluña", gloss: "festivos, tiendas abiertas, vacaciones escolares y loterías, del puente de diciembre a Reyes" },
    en: { label: "Christmas 2026 in Catalonia, day by day", gloss: "public holidays, shop openings, school holidays and lotteries, from the December long weekend to the Three Kings" },
  },
  christmasBarcelona: {
    ca: { label: "Nadal 2026 a Barcelona, dia a dia", gloss: "llums, fires, botigues, festius i Reis a la ciutat" },
    es: { label: "Navidad 2026 en Barcelona, día a día", gloss: "luces, ferias, tiendas, festivos y Reyes en la ciudad" },
    en: { label: "Christmas 2026 in Barcelona, day by day", gloss: "lights, markets, shops, holidays and the Three Kings in the city" },
  },
};

const CALENDAR_LEAD: Record<Locale, string> = {
  ca: "Tot el Nadal en una taula",
  es: "Toda la Navidad en una tabla",
  en: "The whole season in one table",
};

/** One sentence for a seasonal page's body: "Tot el Nadal en una taula, [calendari de Nadal 2026 a Catalunya](...): festius, ...". */
export function calendarLine(locale: Locale, key: CalendarHubKey = "christmas"): string {
  const entry = CALENDAR_HUBS[key][locale];
  return `${CALENDAR_LEAD[locale]}, ${b2link(key, locale, entry.label)}: ${entry.gloss}.`;
}

/** One list item: the searched words as the anchor, then what the page has. */
export function seasonItem(key: SeasonKey, locale: Locale): string {
  const entry = ENTRIES[key][locale];
  return `${b2link(key, locale, entry.label)}: ${entry.gloss}.`;
}

/** An H2 and a list of the given pages, in the order given. */
export function seasonLinks(locale: Locale, keys: readonly SeasonKey[]): Block[] {
  return [...h2(HEADING[locale]), list(...keys.map((key) => seasonItem(key, locale)))];
}

/** The same links as a sentence-less run, for a paragraph that already has its own lead-in. */
export function seasonAnchors(locale: Locale, keys: readonly SeasonKey[]): string[] {
  return keys.map((key) => b2link(key, locale, ENTRIES[key][locale].label));
}
