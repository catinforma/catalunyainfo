/**
 * Parsers for Red Eléctrica's two open answers that carry the PVPC. Pure: no
 * clock, no network. Every number they return is REE's own, unrounded.
 *
 * 1. REData (apidatos.ree.es), widget `mercados/precios-mercados-tiempo-real`
 *    with `time_trunc=hour`. Its `included` array holds series id "1001"
 *    ("PVPC") and id "600" ("Precio mercado spot"). Series 1001 is the term
 *    for active energy of the PVPC 2.0TD, in €/MWh, one value per hour with
 *    the Madrid offset on every instant: 24 values a day (23 on the last
 *    Sunday of March, 25 on the last Sunday of October), checked on
 *    13 Nov 2026 for 12–13 Nov, 29 Mar and 25 Oct 2026. It is the price of
 *    the peninsular system, which REE applies to Baleares and Canarias too
 *    (the e·sios file's "PCB" column carries the same figures). Since
 *    1 Oct 2025 the spot series has 96 quarter-hour values a day, but the
 *    PVPC series is still hourly. A day appears only once REE has published
 *    it: before ~20:15 tomorrow has spot prices and no PVPC.
 *
 * 2. e·sios archive 70 (api.esios.ree.es/archives/70/download_json), the
 *    daily PVPC file, open without a token. It has one row per hour
 *    ("Hora" "00-01" … "23-24", up to "24-25" on the 25-hour day) and two
 *    columns of totals: "PCB" (Península, Canarias, Baleares) and "CYM"
 *    (Ceuta y Melilla, whose tariff periods start an hour later). Decimal
 *    commas. Used only for the Ceuta and Melilla figures, and only when its
 *    PCB column matches REData's hour by hour.
 */

import { hourStarts, isIsoDate, madridDate } from "./time";

export interface PvpcHour {
  /** Start of the hour, ISO with REE's own offset ("2026-11-13T00:00:00.000+01:00"). */
  start: string;
  /** Term of active energy of the PVPC 2.0TD, €/MWh, Península/Baleares/Canarias (REE series 1001). */
  price: number;
  /** Same term for Ceuta and Melilla (e·sios "CYM"), when read. */
  cym?: number;
}

export interface PvpcDay {
  /** Madrid date, "2026-11-13". */
  date: string;
  hours: PvpcHour[];
}

export interface RedataSeries {
  /** REE's `last-update` of series 1001 (ISO): when the newest day was published. */
  updated: string | null;
  /** Complete days only, oldest first. */
  days: PvpcDay[];
}

/** REE's series id for the PVPC 2.0TD in REData. */
export const PVPC_SERIES_ID = "1001";

/**
 * Plausible bounds for an hourly PVPC term, €/MWh. The term adds tolls and
 * charges to the market price, so it has stayed well inside these even when
 * the spot price was zero or negative; a value outside is a broken answer.
 */
export const MIN_PRICE = -500;
export const MAX_PRICE = 5000;

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

function validPrice(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v > MIN_PRICE && v < MAX_PRICE;
}

/** True when every hour of `day` is exactly the hours of its Madrid date, each with a usable price. */
export function isCompleteDay(day: PvpcDay): boolean {
  if (!isIsoDate(day.date)) return false;
  const starts = hourStarts(day.date);
  if (day.hours.length !== starts.length) return false;
  for (let i = 0; i < starts.length; i++) {
    const h = day.hours[i]!;
    if (Date.parse(h.start) !== starts[i] || !validPrice(h.price)) return false;
    if (h.cym !== undefined && !validPrice(h.cym)) return false;
  }
  // A day of zeros is a placeholder, not prices.
  return day.hours.some((h) => h.price !== 0);
}

/** Series 1001 of a REData answer, grouped into complete Madrid days; null when the answer is not usable. */
export function parseRedata(json: unknown): RedataSeries | null {
  if (!isObj(json) || !Array.isArray(json.included)) return null;
  const series = json.included.find((x): x is Obj => isObj(x) && String(x.id) === PVPC_SERIES_ID);
  if (!series || !isObj(series.attributes) || !Array.isArray(series.attributes.values)) {
    // The widget answered but REE has no PVPC in the window (e.g. only tomorrow, before publication).
    return isObj(json.data) ? { updated: null, days: [] } : null;
  }
  const attrs = series.attributes;
  const updatedMs = typeof attrs["last-update"] === "string" ? Date.parse(attrs["last-update"]) : NaN;
  const byDate = new Map<string, PvpcHour[]>();
  for (const row of attrs.values as unknown[]) {
    if (!isObj(row) || typeof row.datetime !== "string") continue;
    const ms = Date.parse(row.datetime);
    if (!Number.isFinite(ms) || typeof row.value !== "number") continue;
    const date = madridDate(ms);
    const list = byDate.get(date) ?? [];
    list.push({ start: row.datetime, price: row.value });
    byDate.set(date, list);
  }
  const days: PvpcDay[] = [];
  for (const [date, hours] of byDate) {
    hours.sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
    const day = { date, hours };
    if (isCompleteDay(day)) days.push(day);
  }
  days.sort((a, b) => a.date.localeCompare(b.date));
  return { updated: Number.isFinite(updatedMs) ? (attrs["last-update"] as string) : null, days };
}

/** "159,11" → 159.11; "1.234,50" → 1234.5. */
export function parseSpanishDecimal(text: unknown): number | undefined {
  if (typeof text !== "string" || !/^-?[\d.]+(,\d+)?$/.test(text.trim())) return undefined;
  const n = Number(text.trim().replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

export interface EsiosDay {
  date: string;
  /** Península, Canarias, Baleares, €/MWh, one per hour of the day in order. */
  pcb: number[];
  /** Ceuta y Melilla, €/MWh. */
  cym: number[];
}

/**
 * The e·sios PVPC file for `date`, or null when it is not that date's
 * complete file. Rows are in order of the day's hours; on the DST days the
 * labels run "00-01" … "22-23" (23 rows) or to "24-25" (25 rows), so the
 * position, not the label, says which hour a row is.
 */
export function parseEsiosArchive(json: unknown, date: string): EsiosDay | null {
  if (!isObj(json) || !Array.isArray(json.PVPC) || !isIsoDate(date)) return null;
  const [y, m, d] = date.split("-");
  const dia = `${d}/${m}/${y}`;
  const rows = json.PVPC as unknown[];
  if (rows.length !== hourStarts(date).length) return null;
  const pcb: number[] = [];
  const cym: number[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!isObj(row) || row.Dia !== dia) return null;
    const expected = `${String(i).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
    if (row.Hora !== expected) return null;
    const p = parseSpanishDecimal(row.PCB);
    const c = parseSpanishDecimal(row.CYM);
    if (!validPrice(p) || !validPrice(c)) return null;
    pcb.push(p);
    cym.push(c);
  }
  return { date, pcb, cym };
}

/** Adds the e·sios Ceuta/Melilla column to a REData day, only when both sources agree on every peninsular hour. */
export function withCym(day: PvpcDay, esios: EsiosDay | null): PvpcDay {
  if (!esios || esios.date !== day.date || esios.pcb.length !== day.hours.length) return day;
  const agrees = day.hours.every((h, i) => Math.abs(h.price - esios.pcb[i]!) < 0.006);
  if (!agrees) return day;
  return { ...day, hours: day.hours.map((h, i) => ({ ...h, cym: esios.cym[i]! })) };
}
