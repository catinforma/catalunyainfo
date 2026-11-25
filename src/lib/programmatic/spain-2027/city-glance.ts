import { commonLocalDays, councilAct, holidayCount, isZoned, local2027, localDays, nonLocalDates, type City } from "./cities";
import { compactDates } from "./copy";
import { compactDatesIntl } from "./copy-intl";
import { SOURCES } from "./sources";
import { SOURCE_PROSE } from "./sources-intl";

/**
 * The one-glance line of a Spain 2027 city page (26 Nov 2026), above the
 * layers and the table: how many holidays the city has in 2027, how many of
 * them are its local days and which (or, while the community's bulletin has
 * not printed them, how many are pending and in which bulletin), and the link
 * to the calendar feed. GSC 28 days: every query of the family is
 * "calendario laboral <ciudad> 2027" or "festivos <ciudad> 2027", asking for
 * the full list; the answer paragraph gives the two local days but, while they
 * are pending, no count, and nothing on the first screen offered the .ics.
 *
 * Nothing is stated here that the rest of the page does not: the total is
 * `holidayCount` (the number the answer paragraph and the table use), the
 * local days are `localDays` / `commonLocalDays`, the bulletin is the
 * community's own (`SOURCES`, `SOURCE_PROSE`). A pending day is never given a
 * date; 2026's days are not repeated here.
 *
 * Kept short on purpose: two lines on a 390 px phone (about 95 characters at
 * 0.95rem; a test holds the limit for every city in ca, es and en).
 */

export type GlanceLocale = "es" | "ca" | "en";

export type GlanceStatus = "published" | "council" | "zoned" | "pending" | "missing";

export interface CityGlance {
  status: GlanceStatus;
  /** Days off already fixed (`holidayCount`: the number the table and the answer print). */
  total: number;
  /** Of those, the BOE days of the community and the island day. */
  base: number;
  /** Local days among the total (the city's own list, or a day fixed for the whole community). */
  local: number;
  /** Local days still to be published (0, 1 or 2). */
  pending: number;
}

export function cityGlance(c: City): CityGlance {
  const total = holidayCount(c);
  const base = new Set(nonLocalDates(c)).size;
  const local = total - base;
  const list = local2027(c);
  if (list) {
    return { status: isZoned(c) ? "zoned" : councilAct(c) ? "council" : "published", total, base, local, pending: 0 };
  }
  if (c.status2027 === "missing") return { status: "missing", total, base, local, pending: 0 };
  return { status: "pending", total, base, local, pending: 2 - commonLocalDays(c).length };
}

/** The anchor of `CalendarSubscribe` (the same block on every city page, in every language). */
export const GLANCE_FEED_ANCHOR = "#afegeix-calendari";

/** The bulletin with its article: "el BOCM", "the BOCM"; a name that is a sentence ("los boletines oficiales de las 3 provincias") becomes "su boletín oficial". */
function bulletinRaw(c: City, locale: GlanceLocale): string {
  const raw = locale === "es" ? SOURCES[c.region].local.bulletinShort : SOURCE_PROSE[c.region][locale].bulletinShort;
  if (raw.length <= 16) return raw;
  return { es: "su boletín oficial", ca: "el seu butlletí oficial", en: "its official gazette" }[locale];
}

/** "del BOCM" / "in the BOCM": after "pendientes" / "pending". */
function bulletinWord(c: City, locale: GlanceLocale): string {
  const raw = bulletinRaw(c, locale);
  if (locale === "en") return `in ${raw}`;
  return raw.replace(/^el /, "del ").replace(/^su /, "de su ");
}

export interface GlanceCopy {
  /** The bold part: "14 festivos en 2027". */
  strong: string;
  /** What follows it, up to the feed link. */
  rest: string;
  /** The feed link's text. */
  cta: string;
}

/** `list` of an unzoned or zoned city: the dates of its own local days (compact: "29 mar y 16 ago"). */
function ownDates(c: City, locale: GlanceLocale): string {
  const dates = localDays(c).map((d) => d.date);
  return locale === "es" ? compactDates(dates) : compactDatesIntl(dates, locale);
}

export function cityGlanceCopy(c: City, locale: GlanceLocale): GlanceCopy {
  const g = cityGlance(c);
  const cta = { es: "Añadir al calendario", ca: "Afegeix al calendari", en: "Add to calendar" }[locale];
  const total = g.total;
  const where = bulletinWord(c, locale);

  if (g.status === "published" || g.status === "council") {
    const dates = ownDates(c, locale);
    const strong = { es: `${total} festivos en 2027`, ca: `${total} festius el 2027`, en: `${total} public holidays in 2027` }[locale];
    if (g.status === "council") {
      return {
        strong,
        rest: {
          es: ` (${g.base} + ${g.local} locales aprobadas, falta ${bulletinRaw(c, locale)})`,
          ca: ` (${g.base} + ${g.local} locals aprovades, falta ${bulletinRaw(c, locale)})`,
          en: ` (${g.base} + ${g.local} local, approved; ${bulletinRaw(c, locale).replace(/^the /, "")} pending)`,
        }[locale],
        cta,
      };
    }
    return {
      strong,
      rest: {
        es: ` (${g.base} + ${g.local} locales: ${dates})`,
        ca: ` (${g.base} + ${g.local} locals: ${dates})`,
        en: ` (${g.base} + ${g.local} local: ${dates})`,
      }[locale],
      cta,
    };
  }

  if (g.status === "zoned") {
    return {
      strong: { es: `${total} festivos en 2027`, ca: `${total} festius el 2027`, en: `${total} public holidays in 2027` }[locale],
      rest: {
        es: ` (${g.base} + ${g.local} locales en la zona principal)`,
        ca: ` (${g.base} + ${g.local} locals a la zona principal)`,
        en: ` (${g.base} + ${g.local} local in the main area)`,
      }[locale],
      cta,
    };
  }

  if (g.status === "missing") {
    return {
      strong: { es: `${total} festivos en 2027`, ca: `${total} festius el 2027`, en: `${total} public holidays in 2027` }[locale],
      rest: {
        es: "; locales: no están en la lista de 2027",
        ca: "; locals: no són a la llista del 2027",
        en: "; local days: not in the 2027 list",
      }[locale],
      cta,
    };
  }

  // Pending: the days already known (Navarra's community-wide 3 December) are in the total; the rest have no date.
  const n = g.pending;
  return {
    strong: { es: `${total} festivos en 2027`, ca: `${total} festius el 2027`, en: `${total} public holidays in 2027` }[locale],
    rest: {
      es: ` + ${n} ${n === 1 ? "local pendiente" : "locales pendientes"} ${where}`,
      ca: ` + ${n} ${n === 1 ? "local pendent" : "locals pendents"} ${where}`,
      en: ` + ${n} local ${n === 1 ? "one" : "ones"} pending ${where}`,
    }[locale],
    cta,
  };
}
