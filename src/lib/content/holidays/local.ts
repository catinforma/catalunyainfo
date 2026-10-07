/**
 * Local public holidays, for every municipality in Catalonia.
 *
 * ## Why this exists
 *
 * On top of the twelve Catalonia-wide days, every municipality sets two of its
 * own. Search Console shows the demand plainly: in one week, about 145
 * distinct queries asked whether a particular day was a holiday, many of them
 * about a particular place, nearly all answered from position 50 to 99. The
 * "is today a holiday" page said honestly that it could not answer for local
 * days, because there was no verified source for all of Catalonia.
 *
 * There is one. The Generalitat publishes the local holiday calendar as open
 * data (`b4eh-r8up`), one row per date per municipality or municipal nucleus.
 * This module reads it.
 *
 * ## What it will not do
 *
 * - **Assume next year.** Local holidays are set by each council, usually late
 *   in the year before. A year with no published rows is reported as not yet
 *   published, never extrapolated from the previous one: municipalities move
 *   their days more often than anyone would guess.
 * - **Silently merge a nucleus into its municipality.** Some villages within a
 *   municipality keep different local days. Those rows are kept apart and named.
 */

const ENDPOINT = "https://analisi.transparenciacatalunya.cat/resource/b4eh-r8up.json";

export const LOCAL_SOURCE = {
  name: "Calendari de festes locals a Catalunya",
  url: "https://analisi.transparenciacatalunya.cat/d/b4eh-r8up",
  publisher: "Departament d'Empresa i Treball — dades obertes",
};

/** A day. The calendar changes once a year; there is no reason to ask more often. */
const REVALIDATE_SECONDS = 86_400;

export interface LocalHolidayPlace {
  /** INE municipality code plus nucleus, unique per row group. */
  key: string;
  /** As the source writes it: the council, or the nucleus within it. */
  name: string;
  /** True when this is a nucleus with its own days, not the whole municipality. */
  isNucleus: boolean;
  /** ISO dates, sorted. */
  dates: string[];
}

export interface LocalCalendar {
  year: number;
  places: LocalHolidayPlace[];
  /** Null when the source answered. */
  error: string | null;
}

interface Row {
  data?: string;
  ajuntament_o_nucli_municipal?: string;
  codi_municipal?: string;
  pedania?: string;
  festiu?: string;
}

/**
 * The source writes articles after the name, as in a gazetteer: "Guàrdia, la",
 * "Pobla de Segur, la", "Masies de Voltregà, les". Listed next to each other
 * with commas, "Clua, la, Gimenells, Guàrdia, la" stops being readable, so the
 * article goes back in front where everyone says it.
 */
export function displayName(name: string): string {
  const match = /^(.*),\s*(la|el|les|els|l'|l’)$/i.exec(name.trim());
  if (!match) return name.trim();
  const [, base, article] = match;
  const lower = (article ?? "").toLowerCase().replace("’", "'");
  return lower === "l'" ? `l'${base}` : `${lower} ${base}`;
}

export function groupRows(rows: Row[]): LocalHolidayPlace[] {
  const byKey = new Map<string, LocalHolidayPlace>();
  for (const row of rows) {
    const date = (row.data ?? "").slice(0, 10);
    const name = displayName(row.ajuntament_o_nucli_municipal ?? "");
    const key = (row.codi_municipal ?? "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !name || !key) continue;

    const place = byKey.get(key) ?? {
      key,
      name,
      isNucleus: (row.pedania ?? "000") !== "000",
      dates: [],
    };
    if (!place.dates.includes(date)) place.dates.push(date);
    byKey.set(key, place);
  }

  const places = [...byKey.values()];
  for (const place of places) place.dates.sort();
  return places.sort((a, b) => a.name.localeCompare(b.name, "ca"));
}

export async function loadLocalCalendar(year: number): Promise<LocalCalendar> {
  const url = `${ENDPOINT}?any_calendari=${year}&$select=data,ajuntament_o_nucli_municipal,codi_municipal,pedania,festiu&$limit=10000`;
  try {
    const response = await fetch(url, {
      headers: { accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(20_000),
    } as RequestInit);
    if (!response.ok) throw new Error(`${response.status}`);
    const rows = (await response.json()) as Row[];
    return { year, places: groupRows(rows), error: null };
  } catch (error) {
    return { year, places: [], error: error instanceof Error ? error.message : "unreachable" };
  }
}

/** Places whose local holiday falls on this date. */
export function placesWithHolidayOn(calendar: LocalCalendar, iso: string): LocalHolidayPlace[] {
  return calendar.places.filter((place) => place.dates.includes(iso));
}
