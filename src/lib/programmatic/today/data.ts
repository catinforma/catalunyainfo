/**
 * "Avui a Catalunya": everything the page embeds, built from data that is
 * already committed and verified elsewhere. No network, no database, no
 * clock: the same HTML whichever day it is rendered. The page shows these
 * lists as dated facts ("as of" the dataset's own date); which day is today
 * is decided in the browser (`logic.ts`).
 *
 * What each item reads:
 *   holidays   the holiday engine's snapshot (Catalonia-wide calendar of the
 *              Generalitat's orders + every town's local days)
 *   strikes    STRIKES in lib/content/batch02/strikes.ts (as of STRIKES_AS_OF)
 *   Rodalies   /api/rodalies/alerts/ in the browser (line names from the snapshot)
 *   reservoirs /api/reservoirs/levels/ in the browser, the snapshot's dated
 *              reading as the fallback
 *   fuel       /api/fuel/catalonia/ in the browser
 *   weekend    the Catalonia-wide calendar (same rule as the weekend agenda)
 *   snow       a link, in season (same window as the homepage strip)
 */

import { B2_PATHS, b2href } from "@/lib/content/batch02/shared";
import { STRIKES, STRIKES_AS_OF, upcomingStrikes } from "@/lib/content/batch02/strikes";
import { STRIKE_11N_DATE } from "@/lib/content/batch02/strike-11n";
import { CALENDAR_VERIFIED_AT } from "@/lib/content/holidays/calendar";
import { PATHS as TOOL_PATHS, SEASONAL } from "@/lib/content/home-tools";
import type { Locale } from "@/lib/i18n/config";
import { NEXT, NEXT_YEAR, SNAPSHOT as HOLIDAYS, YEAR, localThrough, nextYearFor, regionalDays, regionalThrough } from "@/lib/programmatic/holidays/data";
import { GUIDES } from "@/lib/programmatic/holidays/links";
import { DATE_PAGES, datePath, hubPath as holidayHubPath, municipalityPath } from "@/lib/programmatic/holidays/paths";
import type { NucleusDays, SnapshotMunicipality } from "@/lib/programmatic/holidays/types";
import { fuelHubPath } from "@/lib/programmatic/fuel/paths";
import { SNAPSHOT as RESERVOIRS, snapshotReadings } from "@/lib/programmatic/reservoirs/data";
import { reservoirHubPath } from "@/lib/programmatic/reservoirs/paths";
import { LINES } from "@/lib/programmatic/rodalies/data";
import { officialUrl as rodaliesOfficial } from "@/lib/programmatic/rodalies/official";
import { hubPath as rodaliesHubPath, linePath } from "@/lib/programmatic/rodalies/paths";
import type { LineId } from "@/lib/programmatic/rodalies/types";
import { shippedZones } from "@/lib/programmatic/weekend/data";
import { weekendHubPath, zonePath } from "@/lib/programmatic/weekend/paths";

import { reservoirTotal, type HolidayData, type LocalPlace, type RegionalDay, type TodayStrike } from "./logic";

/* -------------------------------------------------------------------------- */
/* Holidays                                                                   */
/* -------------------------------------------------------------------------- */

/** First day the embedded lists cover: the day the holiday sources were read. */
export const DATA_FROM = HOLIDAYS.readOn;

/** Catalonia-wide days from DATA_FROM, with the Aran swap flagged both ways. */
export function regionalList(locale: Locale): RegionalDay[] {
  const out: RegionalDay[] = [];
  for (const year of [YEAR, NEXT]) {
    const all = regionalDays(year, false);
    const aran = regionalDays(year, true);
    const aranDates = new Set(aran.map((d) => d.date));
    for (const day of all) {
      out.push({ d: day.date, n: day.name[locale], ...(aranDates.has(day.date) ? {} : { xa: true as const }) });
    }
    for (const day of aran) if (day.aranOnly) out.push({ d: day.date, n: day.name[locale], ao: true });
  }
  return out.filter((day) => day.d >= DATA_FROM).sort((a, b) => a.d.localeCompare(b.d) || Number(Boolean(a.ao)) - Number(Boolean(b.ao)));
}

function addPlaces(
  byDate: Map<string, LocalPlace[]>,
  m: SnapshotMunicipality,
  local: readonly string[],
  nuclei: readonly NucleusDays[],
  href: string | null,
): void {
  const push = (date: string, place: LocalPlace) => {
    if (date < DATA_FROM) return;
    byDate.set(date, [...(byDate.get(date) ?? []), place]);
  };
  for (const date of local) push(date, { n: m.name, h: href, p: null });
  // A nucleus whose day is also the municipality's is already covered by the municipality's line.
  for (const nucleus of nuclei) for (const date of nucleus.dates) if (!local.includes(date)) push(date, { n: nucleus.name, h: href, p: m.name });
}

/** Local holidays of every town with a page from DATA_FROM, by date, largest first. */
export function localByDate(locale: Locale): Record<string, LocalPlace[]> {
  const byDate = new Map<string, LocalPlace[]>();
  const towns = [...HOLIDAYS.municipalities].sort((a, b) => a.rank - b.rank);
  for (const m of towns) {
    const href = locale === "en" ? null : municipalityPath(locale, m.slug);
    addPlaces(byDate, m, m.local, m.nuclei, href);
    const next = nextYearFor(m.slug);
    if (next) addPlaces(byDate, m, next.local, next.nuclei, href);
  }
  return Object.fromEntries([...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

export function holidayData(locale: Locale): HolidayData {
  const datePages: HolidayData["datePages"] = {};
  for (const iso of DATE_PAGES) {
    if (iso < DATA_FROM) continue;
    datePages[iso] = { href: datePath(locale, iso), places: HOLIDAYS.localByDate[iso]?.length ?? 0 };
  }
  return {
    from: DATA_FROM,
    regional: regionalList(locale),
    regionalThrough: regionalThrough(),
    local: localByDate(locale),
    localThrough: localThrough(),
    towns: HOLIDAYS.municipalities.length,
    datePages,
  };
}

/* -------------------------------------------------------------------------- */
/* Strikes                                                                    */
/* -------------------------------------------------------------------------- */

/** Where a strike is explained: the general strike's own page, else its section of the strikes page. */
export function strikeHref(strike: (typeof STRIKES)[number], locale: Locale): string {
  if (strike.scope === "general" && strike.dates.includes(STRIKE_11N_DATE)) return b2href("strike11n", locale);
  return `${b2href("strikes", locale)}#${strike.id}`;
}

/** The strikes still to come on the list's own date (never on the clock's). */
export function todayStrikes(locale: Locale): TodayStrike[] {
  return upcomingStrikes(STRIKES_AS_OF).map((strike) => ({
    id: strike.id,
    dates: [...strike.dates],
    title: strike.title[locale],
    ms: strike.minimumServices.msShort[locale],
    href: strikeHref(strike, locale),
  }));
}

export { STRIKES_AS_OF };

/* -------------------------------------------------------------------------- */
/* Rodalies                                                                   */
/* -------------------------------------------------------------------------- */

export function rodaliesLines(locale: Locale): { names: Record<string, string>; hrefs: Partial<Record<LineId, string>> } {
  return {
    names: Object.fromEntries(LINES.map((l) => [l.id, l.name])),
    // Line pages exist in Catalan and Spanish; the English edition is the hub only.
    hrefs: locale === "en" ? {} : Object.fromEntries(LINES.map((l) => [l.id, linePath(locale, l.id)])),
  };
}

/* -------------------------------------------------------------------------- */
/* Reservoirs                                                                 */
/* -------------------------------------------------------------------------- */

/** The snapshot's own reading: the dated fallback the page shows before (or without) today's. */
export function reservoirFallback(): { readings: ReturnType<typeof snapshotReadings>; total: { date: string; percent: number } | null } {
  const readings = snapshotReadings();
  return { readings, total: reservoirTotal(readings) };
}

/* -------------------------------------------------------------------------- */
/* Snow season                                                                */
/* -------------------------------------------------------------------------- */

/** The snow page's window on the homepage strip: one definition for both. */
export function snowSeason(): { from: string; to: string } {
  const window = SEASONAL.find((s) => s.key === "snowNow");
  if (!window) throw new Error("home-tools has no snowNow season");
  return { from: window.from, to: window.to };
}

/* -------------------------------------------------------------------------- */
/* Links                                                                      */
/* -------------------------------------------------------------------------- */

const tool = (key: keyof typeof TOOL_PATHS, locale: Locale) => `/${locale}/${TOOL_PATHS[key][locale]}/`;

/** Every internal page the daily page links to, by item. Tests check each resolves to a real route. */
export function todayLinks(locale: Locale) {
  const muni = locale === "en" ? null : locale;
  return {
    holidays: {
      hub: muni ? holidayHubPath(muni) : null,
      today: GUIDES.holidayToday[locale],
      local: GUIDES.localHolidays[locale],
      calendar: GUIDES.workCalendar[locale],
    },
    strikes: { hub: b2href("strikes", locale), general: b2href("strike11n", locale) },
    rodalies: { hub: rodaliesHubPath(locale), official: rodaliesOfficial.status(locale) },
    reservoirs: { hub: reservoirHubPath(locale), guide: tool("reservoirs", locale) },
    // The fuel pages are Catalan and Spanish; the English edition links the Spanish hub.
    fuel: { hub: fuelHubPath(muni ?? "es"), sameLanguage: muni !== null },
    weekend: {
      agenda: tool("weekend", locale),
      hub: muni ? weekendHubPath(muni) : null,
      zones: muni ? shippedZones().map((z) => ({ label: z.name[muni], href: zonePath(muni, z) })) : [],
      bridge: GUIDES.decemberBridge[locale],
    },
    snow: { page: `/${locale}/${B2_PATHS.snowNow[locale]}/` },
  };
}

export type TodayLinks = ReturnType<typeof todayLinks>;

/* -------------------------------------------------------------------------- */
/* Dates                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The page's last real change: the newest of the dates of the data printed in
 * its HTML (holiday sources, next year's local order, the strike list, the
 * Catalonia-wide calendar check, the reservoir snapshot). Deterministic; the
 * daily answers are the browser's and do not change the HTML.
 */
export function todayLastModified(): string {
  const dates = [HOLIDAYS.readOn, NEXT_YEAR.readOn ?? "", STRIKES_AS_OF, CALENDAR_VERIFIED_AT, RESERVOIRS.readOn];
  return dates.reduce((a, b) => (b > a ? b : a), "");
}

export { HOLIDAYS as HOLIDAY_SNAPSHOT, RESERVOIRS as RESERVOIR_SNAPSHOT };
