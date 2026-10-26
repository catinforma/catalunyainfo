import { INTL_LOCALE, type Locale } from "@/lib/i18n/config";

/**
 * Snow on the ground in the Catalan mountains, read from Meteocat's
 * automatic weather stations (XEMA) through the Generalitat's open data.
 *
 * ## Why this exists
 *
 * "Is there snow in the Pyrenees today?" is asked every winter morning, and
 * the pages that answer it are ski-resort reports (the pistes, not the
 * mountain) or news pieces frozen on the day they were written. Meteocat
 * measures the depth of snow on the ground every half hour at twenty stations
 * and publishes it as open data (`nzvn-apee`, variable 38, "Gruix de neu a
 * terra"). This module reads it at render time; nobody refreshes it by hand.
 *
 * ## Validated readings only
 *
 * Every row carries `codi_estat`: blank (validation not started), `T`
 * (started) or `V` (valid). On 25 Oct 2026 the unvalidated rows read 1-13 cm
 * at Sort (677 m, where the air was at 4-19 °C that week), Prades and Núria,
 * while the validated rows for the same stations and days were all 0, and
 * Meteocat's own station page showed the unvalidated figure. A page that
 * answers "is there snow" cannot print sensor noise as snow, so only `V` rows
 * are used. They arrive later (that week Meteocat validated a few morning
 * readings a day and the rest about a week later), which is why every row
 * shows its own reading time, and why a station with no validated reading in
 * the last 48 hours is flagged rather than shown with an old figure.
 *
 * ## What it will not do
 *
 * - **Show a stale reading as current.** Older than `MAX_AGE_HOURS` and the
 *   station is listed without a figure.
 * - **Replace a good page with a failure.** A failed fetch throws
 *   (`SnowSourceError`) instead of rendering "we could not read the data".
 *   The page is ISR: on Vercel a failed regeneration, background or on demand
 *   (the nightly cron's `revalidatePath`), keeps serving the last good HTML
 *   and retries about 30 seconds later ("If revalidation fails, Vercel keeps
 *   serving the existing cached content", vercel.com/docs/incremental-static-
 *   regeneration, read 26 Oct 2026). Rendering the failure instead cached it
 *   for a day: on 25-26 Oct 2026 Google crawled the ca and es pages that way.
 *   Only during `next build`, where there is no previous page and a throw
 *   would fail the deploy, is the failure rendered as such. A module-level
 *   "last good" copy would not help: serverless instances do not share or
 *   keep memory. The readings still carry their own times, so the last good
 *   page never presents an old reading as today's.
 * - **Use the daily dataset (`7bvh-jvq2`).** Its snow variables (1600 mean
 *   depth, 1602 new snow) were three days behind on 25 Oct 2026, computed
 *   from the unvalidated readings (12 cm of "new snow" at Núria at 0-8 °C)
 *   and in one case negative (-4 cm at Lac Redon). The 24-hour change shown
 *   here is computed from two validated readings instead, and labelled as a
 *   change, not as new snow.
 */

const SOCRATA = "https://analisi.transparenciacatalunya.cat/resource";
const READINGS = `${SOCRATA}/nzvn-apee.json`;
const STATIONS = `${SOCRATA}/yqwd-vj5e.json`;

/** `38` is "Gruix de neu a terra", in centimetres, half-hourly. */
export const SNOW_DEPTH_VARIABLE = "38";

export const SNOW_SOURCE = {
  name: "Dades meteorològiques de la XEMA",
  url: "https://analisi.transparenciacatalunya.cat/d/nzvn-apee",
  publisher: "Servei Meteorològic de Catalunya (Meteocat)",
};

/** Meteocat's own map of its automatic stations, for when the data cannot be read. */
export const METEOCAT_XEMA_URL = "https://www.meteo.cat/observacions/xema";

/** Meteocat's page for one station, which also shows the unvalidated readings. */
export function stationUrl(code: string): string {
  return `${METEOCAT_XEMA_URL}/dades?codi=${encodeURIComponent(code)}`;
}

/**
 * The stations that measure snow depth: every station with a variable-38
 * reading between 1 Oct 2025 and 25 Oct 2026, all twenty reporting throughout
 * (checked 25 Oct 2026 with a grouped query on `nzvn-apee`).
 *
 * Fixed rather than queried: the grouped query took from 0.6 to 58 seconds on
 * the day it was tested, and the list only decides which stations appear
 * without a figure when they have nothing recent. A new station still appears
 * as soon as it has a validated reading; a retired one would stay listed as
 * "no validated reading", never with an old figure.
 */
export const SNOW_STATIONS: readonly string[] = [
  "CG", "DG", "DP", "VS", "X5", "XH", "XK", "XR", "YN", "YT",
  "Z1", "Z2", "Z3", "Z5", "Z6", "Z7", "Z9", "ZB", "ZC", "ZE",
];

/** A validated reading older than this is not presented as current. */
export const MAX_AGE_HOURS = 48;

/** The "24 h change" compares with a validated reading this close to 24 h earlier. */
const CHANGE_TOLERANCE_HOURS = 3;

/** Last season's deepest reading was 282 cm (Lac Redon); anything past this is damage. */
const MAX_PLAUSIBLE_CM = 1000;

/**
 * A day, the same as the page. A shorter `revalidate` on a fetch shortens the
 * whole route's ISR interval (Next's `fetch` reference: "the whole route
 * revalidation interval will be decreased"), which is the ISR budget this site
 * cannot spend. Fresh readings come from the nightly cron instead: its
 * `revalidatePath` invalidates the page and the data cached for it.
 */
const READINGS_REVALIDATE_SECONDS = 86_400;
/** Station names and altitudes change a few times a decade. */
const STATIONS_REVALIDATE_SECONDS = 86_400;

/* -------------------------------------------------------------------------- */
/* Areas                                                                      */
/* -------------------------------------------------------------------------- */

export type SnowArea = "aran" | "pallars" | "ribagorca" | "cerdanya" | "ripolles" | "other";

/** West to east along the Pyrenees, then everything outside them. */
export const AREA_ORDER: SnowArea[] = ["aran", "pallars", "ribagorca", "cerdanya", "ripolles", "other"];

const AREA_BY_COMARCA: Record<string, SnowArea> = {
  "Val d'Aran": "aran",
  Aran: "aran",
  "Pallars Sobirà": "pallars",
  "Pallars Jussà": "pallars",
  "Alta Ribagorça": "ribagorca",
  Cerdanya: "cerdanya",
  "Alt Urgell": "cerdanya",
  "Solsonès": "cerdanya",
  "Berguedà": "cerdanya",
  "Ripollès": "ripolles",
  Garrotxa: "ripolles",
};

export const AREA_LABEL: Record<SnowArea, Record<Locale, string>> = {
  aran: { ca: "Val d'Aran", es: "Val d'Aran", en: "Val d'Aran" },
  pallars: { ca: "Pallars", es: "Pallars", en: "Pallars" },
  ribagorca: { ca: "Alta Ribagorça", es: "Alta Ribagorça", en: "Alta Ribagorça" },
  cerdanya: {
    ca: "Cerdanya, Alt Urgell i Solsonès",
    es: "Cerdanya, Alt Urgell y Solsonès",
    en: "Cerdanya, Alt Urgell and Solsonès",
  },
  ripolles: { ca: "Ripollès", es: "Ripollès", en: "Ripollès" },
  other: {
    ca: "Altres muntanyes, fora del Pirineu",
    es: "Otras montañas, fuera del Pirineo",
    en: "Other mountains, outside the Pyrenees",
  },
};

/** The comarca's place in the list; any comarca not named above is "other". */
export function areaFor(comarca: string): SnowArea {
  return AREA_BY_COMARCA[comarca.normalize("NFC").trim()] ?? "other";
}

/** Every area but "other" is in the Pyrenees. */
export function isPyrenean(area: SnowArea): boolean {
  return area !== "other";
}

/** "Cadí Nord (2.145 m) - Prat d'Aguiló" → "Cadí Nord - Prat d'Aguiló"; the altitude has its own column. */
export function cleanStationName(name: string): string {
  return name
    .normalize("NFC")
    .replace(/\s*\(\s*[\d.,]+\s*m\s*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* -------------------------------------------------------------------------- */
/* Parsing                                                                    */
/* -------------------------------------------------------------------------- */

export interface ReadingRow {
  codi_estacio?: string;
  data_lectura?: string;
  valor_lectura?: string;
  codi_estat?: string;
}

export interface StationRow {
  codi_estacio?: string;
  nom_estacio?: string;
  nom_comarca?: string;
  altitud?: string;
}

export interface Reading {
  code: string;
  /** ISO instant, UTC. The source labels each half hour by its start, in UT. */
  at: string;
  cm: number;
}

export interface StationMeta {
  code: string;
  name: string;
  comarca: string;
  altitude: number;
}

/** The source gives `2026-10-24T06:00:00.000` with no zone; its documentation says UT. */
export function toUtcIso(value: string | undefined): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) return null;
  const date = new Date(`${value.slice(0, 19)}Z`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Validated, well-formed, physically plausible readings only. */
export function parseReadings(rows: ReadingRow[]): Reading[] {
  const out: Reading[] = [];
  for (const row of rows) {
    if (row.codi_estat !== "V") continue;
    const code = row.codi_estacio?.trim();
    const at = toUtcIso(row.data_lectura);
    const raw = row.valor_lectura?.trim() ?? "";
    const cm = Number(raw);
    if (!code || !at || raw === "" || !Number.isFinite(cm)) continue;
    if (cm < 0 || cm > MAX_PLAUSIBLE_CM) continue;
    out.push({ code, at, cm: Math.round(cm) });
  }
  return out;
}

export function parseStations(rows: StationRow[]): Map<string, StationMeta> {
  const out = new Map<string, StationMeta>();
  for (const row of rows) {
    const code = row.codi_estacio?.trim();
    const name = row.nom_estacio?.trim();
    const altitude = Number(row.altitud);
    if (!code || !name || !Number.isFinite(altitude)) continue;
    out.set(code, { code, name: cleanStationName(name), comarca: (row.nom_comarca ?? "").normalize("NFC").trim(), altitude });
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* The report                                                                 */
/* -------------------------------------------------------------------------- */

export interface StationSnow {
  code: string;
  name: string;
  comarca: string;
  altitude: number;
  area: SnowArea;
  /** Latest validated depth when it is recent enough; null otherwise. */
  cm: number | null;
  /** When that reading was taken (ISO, UTC); null when there is no current one. */
  at: string | null;
  /** Depth now minus the validated depth about 24 h earlier; null without a clean pair. */
  change24h: number | null;
}

export interface SnowReport {
  /** Every station that measures snow depth, grouped and ordered for display. */
  stations: StationSnow[];
  /** How many have a validated reading from the last `MAX_AGE_HOURS`. */
  current: number;
  /** How many of those have at least 1 cm on the ground. */
  withSnow: number;
  /** The deepest current reading, if any station has snow. */
  deepest: StationSnow | null;
  /** The newest current reading (ISO, UTC). */
  latestAt: string | null;
  error: string | null;
}

const HOUR = 3_600_000;

function emptyReport(error: string | null): SnowReport {
  return { stations: [], current: 0, withSnow: 0, deepest: null, latestAt: null, error };
}

/**
 * Pure, so it is tested without the network.
 *
 * @param measuring codes of the stations that measure snow depth, listed even
 *   when they have no recent validated reading (`SNOW_STATIONS` in production).
 */
export function buildSnowReport(
  readings: Reading[],
  measuring: Iterable<string>,
  stations: ReadonlyMap<string, StationMeta>,
  now: Date = new Date(),
): SnowReport {
  const byStation = new Map<string, Reading[]>();
  const nowMs = now.getTime();
  for (const reading of readings) {
    const t = Date.parse(reading.at);
    // A reading stamped in the future is a clock fault, not a measurement.
    if (t > nowMs + HOUR) continue;
    byStation.set(reading.code, [...(byStation.get(reading.code) ?? []), reading]);
  }

  const codes = new Set<string>([...measuring, ...byStation.keys()]);
  const out: StationSnow[] = [];
  for (const code of codes) {
    const meta = stations.get(code);
    // Without its name and altitude a row would tell the reader nothing.
    if (!meta) continue;

    const list = (byStation.get(code) ?? []).sort((a, b) => b.at.localeCompare(a.at));
    const latest = list[0];
    const fresh = latest && nowMs - Date.parse(latest.at) <= MAX_AGE_HOURS * HOUR ? latest : null;

    let change24h: number | null = null;
    if (fresh) {
      const target = Date.parse(fresh.at) - 24 * HOUR;
      let best: Reading | null = null;
      for (const candidate of list) {
        const gap = Math.abs(Date.parse(candidate.at) - target);
        if (gap > CHANGE_TOLERANCE_HOURS * HOUR) continue;
        if (!best || gap < Math.abs(Date.parse(best.at) - target)) best = candidate;
      }
      if (best) change24h = fresh.cm - best.cm;
    }

    out.push({
      code,
      name: meta.name,
      comarca: meta.comarca,
      altitude: meta.altitude,
      area: areaFor(meta.comarca),
      cm: fresh ? fresh.cm : null,
      at: fresh ? fresh.at : null,
      change24h,
    });
  }

  out.sort(
    (a, b) =>
      AREA_ORDER.indexOf(a.area) - AREA_ORDER.indexOf(b.area) ||
      b.altitude - a.altitude ||
      a.name.localeCompare(b.name, "ca"),
  );

  const current = out.filter((s) => s.cm !== null);
  const snowy = current.filter((s) => (s.cm ?? 0) >= 1);
  const deepest =
    [...snowy].sort((a, b) => (b.cm ?? 0) - (a.cm ?? 0) || b.altitude - a.altitude)[0] ?? null;
  const latestAt = current.map((s) => s.at ?? "").sort().at(-1) || null;

  return {
    stations: out,
    current: current.length,
    withSnow: snowy.length,
    deepest,
    latestAt,
    error: out.length === 0 ? "no stations" : null,
  };
}

/* -------------------------------------------------------------------------- */
/* Wording                                                                    */
/* -------------------------------------------------------------------------- */

/** "2.262" in Catalan and Spanish, "2,262" in English, whatever the runtime's grouping rules. */
export function formatInt(value: number, locale: Locale): string {
  const sign = value < 0 ? "−" : "";
  const digits = String(Math.abs(Math.round(value)));
  const separator = locale === "en" ? "," : ".";
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

/** A reading time in Catalonia's official time, which the source does not give. */
export function formatReadingTime(iso: string, locale: Locale, long = false): string {
  const options: Intl.DateTimeFormatOptions = long
    ? { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Europe/Madrid" }
    : { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Europe/Madrid" };
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], options).format(new Date(iso));
}

const SUMMARY: Record<
  Locale,
  {
    snow: (n: number, total: number, station: string, altitude: string, cm: number) => string;
    none: (total: number) => string;
    pyreneesNoCurrent: (n: number) => string;
    latest: (when: string) => string;
    stale: (n: number) => string;
    noCurrent: string;
    unreachable: string;
  }
> = {
  ca: {
    snow: (n, total, station, altitude, cm) =>
      `Hi ha neu a terra a ${n} de les ${total} estacions del Meteocat amb lectura recent. El gruix més alt és a ${station} (${altitude} m): ${cm} cm.`,
    none: (total) =>
      total === 1
        ? "No hi ha neu a terra a l'única estació del Meteocat amb lectura validada recent."
        : `No hi ha neu a terra a cap de les ${total} estacions del Meteocat amb lectura validada recent.`,
    pyreneesNoCurrent: (n) =>
      `Cap de les ${n} estacions del Meteocat al Pirineu no té encara una lectura validada de les últimes 48 hores, així que avui no podem dir si hi ha neu a terra al Pirineu.`,
    latest: (when) => `Lectura validada més recent: ${when}.`,
    stale: (n) =>
      n === 1
        ? "Una altra estació no té cap lectura validada de les últimes 48 hores."
        : `${n} estacions més no tenen cap lectura validada de les últimes 48 hores.`,
    noCurrent: "El Meteocat no ha publicat cap lectura validada del gruix de neu de les últimes 48 hores.",
    unreachable: "Quan s'ha actualitzat aquesta pàgina no hem pogut llegir les dades del Meteocat.",
  },
  es: {
    snow: (n, total, station, altitude, cm) =>
      `Hay nieve en el suelo en ${n} de las ${total} estaciones de Meteocat con lectura reciente. El mayor espesor está en ${station} (${altitude} m): ${cm} cm.`,
    none: (total) =>
      total === 1
        ? "No hay nieve en el suelo en la única estación de Meteocat con lectura validada reciente."
        : `No hay nieve en el suelo en ninguna de las ${total} estaciones de Meteocat con lectura validada reciente.`,
    pyreneesNoCurrent: (n) =>
      `Ninguna de las ${n} estaciones de Meteocat en el Pirineo tiene todavía una lectura validada de las últimas 48 horas, así que hoy no podemos decir si hay nieve en el suelo en el Pirineo.`,
    latest: (when) => `Lectura validada más reciente: ${when}.`,
    stale: (n) =>
      n === 1
        ? "Otra estación no tiene ninguna lectura validada de las últimas 48 horas."
        : `Otras ${n} estaciones no tienen ninguna lectura validada de las últimas 48 horas.`,
    noCurrent: "Meteocat no ha publicado ninguna lectura validada del espesor de nieve de las últimas 48 horas.",
    unreachable: "Cuando se actualizó esta página no pudimos leer los datos de Meteocat.",
  },
  en: {
    snow: (n, total, station, altitude, cm) =>
      `There is snow on the ground at ${n} of the ${total} Meteocat stations with a recent reading. The deepest is at ${station} (${altitude} m): ${cm} cm.`,
    none: (total) =>
      total === 1
        ? "There is no snow on the ground at the one Meteocat station with a recent validated reading."
        : `There is no snow on the ground at any of the ${total} Meteocat stations with a recent validated reading.`,
    pyreneesNoCurrent: (n) =>
      `None of Meteocat's ${n} Pyrenean stations has a validated reading from the last 48 hours yet, so we can't say today whether there is snow on the ground in the Pyrenees.`,
    latest: (when) => `Latest validated reading: ${when}.`,
    stale: (n) =>
      n === 1
        ? "One more station has no validated reading from the last 48 hours."
        : `${n} more stations have no validated reading from the last 48 hours.`,
    noCurrent: "Meteocat has not published a validated snow-depth reading from the last 48 hours.",
    unreachable: "We could not read Meteocat's data when this page was last updated.",
  },
};

/**
 * The one-line answer at the top of the block, computed from the report and
 * never written by hand. Returns the sentences to print, in order.
 */
export function snowSummary(report: SnowReport, locale: Locale): string[] {
  const t = SUMMARY[locale];
  if (report.error) return [t.unreachable];
  if (report.current === 0) return [t.noCurrent];

  // The page answers "is there snow in the Pyrenees". When every reading it
  // has comes from outside them (Montseny, Ports, Prades on 26 Oct 2026), a
  // "no snow at any station" headline would answer a different question, so
  // the missing Pyrenean readings lead.
  const pyrenean = report.stations.filter((s) => isPyrenean(s.area));
  const noPyreneanReading = pyrenean.length > 0 && pyrenean.every((s) => s.cm === null);

  const lines: string[] = [];
  if (noPyreneanReading) lines.push(t.pyreneesNoCurrent(pyrenean.length));
  if (report.withSnow > 0 && report.deepest) {
    const d = report.deepest;
    lines.push(t.snow(report.withSnow, report.current, d.name, formatInt(d.altitude, locale), d.cm ?? 0));
  } else {
    lines.push(t.none(report.current));
  }
  if (report.latestAt) lines.push(t.latest(formatReadingTime(report.latestAt, locale, true)));
  // Stations without a current reading that the lines above have not already named.
  const stale = report.stations.filter((s) => s.cm === null && !(noPyreneanReading && isPyrenean(s.area))).length;
  if (stale > 0) lines.push(t.stale(stale));
  return lines;
}

/* -------------------------------------------------------------------------- */
/* Fetching                                                                   */
/* -------------------------------------------------------------------------- */

async function getJson<T>(url: string, revalidate: number): Promise<T> {
  const response = await fetch(url, {
    headers: { accept: "application/json" },
    // Next.js caches the response; the nightly cron's revalidatePath clears it.
    next: { revalidate },
    signal: AbortSignal.timeout(20_000),
  } as RequestInit);
  if (!response.ok) throw new Error(`${response.status} from ${new URL(url).host}`);
  const body = (await response.json()) as unknown;
  if (!Array.isArray(body)) throw new Error("unexpected response");
  return body as T;
}

/** Midnight UTC `days` before `now`: a day-stable bound, so the cache key does not change every render. */
function dayBound(now: Date, days: number): string {
  const date = new Date(now.getTime() - days * 86_400_000);
  return `${date.toISOString().slice(0, 10)}T00:00:00`;
}

function query(base: string, params: Record<string, string>): string {
  const search = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  return `${base}?${search}`;
}

/** Meteocat's open data could not be read; see "What it will not do" above. */
export class SnowSourceError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "SnowSourceError";
  }
}

/** `next build` sets this before prerendering (`PHASE_PRODUCTION_BUILD`). */
function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

/**
 * The report, or a throw.
 *
 * At runtime a failure rejects, so the ISR regeneration fails and the last
 * good page stays up. During `next build` there is no earlier page to keep and
 * a throw would fail the deploy, so the failure is returned as a report with
 * `error` set and the block says it could not read the data.
 */
export async function loadSnowReport(now: Date = new Date()): Promise<SnowReport> {
  const report = await readSnowReport(now);
  if (report.error && !isBuildPhase()) throw new SnowSourceError(report.error);
  return report;
}

async function readSnowReport(now: Date): Promise<SnowReport> {
  try {
    const [validated, stations] = await Promise.all([
      // Validated rows only, enough days back for the 48 h window and the 24 h change.
      getJson<ReadingRow[]>(
        query(READINGS, {
          $select: "codi_estacio,data_lectura,valor_lectura,codi_estat",
          $where: `codi_variable='${SNOW_DEPTH_VARIABLE}' AND codi_estat='V' AND data_lectura >= '${dayBound(now, 4)}'`,
          $order: "data_lectura DESC",
          $limit: "10000",
        }),
        READINGS_REVALIDATE_SECONDS,
      ),
      getJson<StationRow[]>(
        query(STATIONS, { $select: "codi_estacio,nom_estacio,nom_comarca,altitud", $limit: "2000" }),
        STATIONS_REVALIDATE_SECONDS,
      ),
    ]);

    return buildSnowReport(parseReadings(validated), SNOW_STATIONS, parseStations(stations), now);
  } catch (error) {
    return emptyReport(error instanceof Error ? error.message : "unreachable");
  }
}
