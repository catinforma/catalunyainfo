import { monthInForce, type SeriesData, type SeriesId } from "./ine";
import {
  FIRST_UPDATE,
  IGC_CAP_TO,
  IGC_CEILING,
  IRAV_CAP_FROM,
  LAST_UPDATE,
  LEY_12_2023_IN_FORCE,
  RDL_26_2026_DAY,
  RDL_29_2026_FROM,
  RDL_7_2019_IN_FORCE,
  RDL_8_2026_FROM,
  RDL_8_2026_PCT,
  RDL_8_2026_TO,
  THREE_PCT,
  THREE_PCT_FROM,
  THREE_PCT_TO,
  type NormId,
} from "./rules";

/**
 * The annual rent update, pure: the contract's agreed index on its
 * anniversary, every legal cap that applies that day, the lower of the two,
 * and the new rent. No dates are typed here: they are the dated constants
 * of rules.ts, and every index value comes from the INE series handed in.
 * Small enough for the browser (no data import).
 */

export type LeaseUse = "housing" | "commercial";
export type AgreedIndex = "irav" | "ipc" | "fixed";

export interface RentInput {
  /** Current monthly rent, euros. */
  rent: number;
  /** Day the contract was signed, "2024-11-20". */
  signed: string;
  /** Day the rent is updated (the anniversary), "2026-11-20". */
  update: string;
  index: AgreedIndex;
  /** The agreed fixed increase in %, when `index` is "fixed". */
  fixedPercent?: number;
  use: LeaseUse;
}

export interface RentSeries {
  ipc: SeriesData;
  irav: SeriesData;
  igc: SeriesData;
}

/** A figure taken from an INE month. */
export interface IndexUse {
  series: SeriesId;
  month: string;
  /** The INE's annual rate, %. */
  value: number;
  published: string;
}

export type CapKind = "igc" | "three" | "rdl8" | "irav" | "ipc";

export interface Cap {
  kind: CapKind;
  /** The cap in %. */
  percent: number;
  /** The INE month behind it (none for the 3 % and 2 % caps). */
  index: IndexUse | null;
  /** IGC only: the INE's rate before Ley 2/2015's 0–2 % band. */
  raw?: number;
  /** A landlord who is not a gran tenedor may agree a different increase (RDL 6/2022 art. 46, RDL 8/2026 art. 2). */
  negotiable: boolean;
  norms: NormId[];
}

export type NoteId =
  | "notify" // art. 18.2: due from the month after written notice
  | "releaseDay" // the INE released an index on the anniversary itself
  | "noLegalCap" // housing contract signed before 6 Mar 2019, outside the extraordinary caps
  | "commercial" // no legal cap
  | "negotiable" // a non-gran-tenedor landlord may agree otherwise
  | "decreeEdge" // within 3 days of a decree's start or end: check with a professional
  | "firstIrav" // 1 Jan 2025: DA 11 applied but no IRAV was out yet
  | "negative"; // the index fell: the clause may lower the rent

export interface PendingResult {
  /**
   * The INE has not published the month that applies yet ("scheduled": its
   * calendar gives the day; "unknown": the calendar does not reach the
   * anniversary yet), or the series did not exist on that day
   * ("before-series": e.g. an IRAV clause updated before the first IRAV).
   */
  status: "pending";
  series: SeriesId;
  reason: "scheduled" | "unknown" | "before-series";
  month: string | null;
  published: string | null;
}

export interface OkResult {
  status: "ok";
  agreed: { index: AgreedIndex; percent: number; source: IndexUse | null };
  caps: Cap[];
  /** The cap that binds (the lowest), when one is lower than the agreed rate. */
  binding: Cap | null;
  /** The change applied, in % (negative when the agreed index fell). */
  percent: number;
  newRent: number;
  /** Monthly difference, euros. */
  monthly: number;
  /** Twelve months of the difference, euros. */
  yearly: number;
  norms: NormId[];
  notes: NoteId[];
}

export type RentResult =
  | { status: "invalid"; reason: "rent" | "dates" | "order" | "fixed" }
  | { status: "out-of-range"; first: string; last: string }
  | PendingResult
  | OkResult;

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function validIso(s: string): boolean {
  if (!ISO.test(s)) return false;
  const d = new Date(`${s}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/** Days between two ISO dates (b − a). */
function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86_400_000);
}

const cents = (n: number) => Math.round(n * 100) / 100;

/**
 * The day of `month` ("2026-11") on which a contract signed on `signed`
 * has its anniversary: the same day, or the month's last day (29 Feb, 31st).
 */
export function anniversaryIn(signed: string, month: string): string {
  const [y, m] = month.split("-").map(Number) as [number, number];
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const day = Math.min(Number(signed.slice(8, 10)), last);
  return `${month}-${String(day).padStart(2, "0")}`;
}

/**
 * The value in force on `date`, or why there is none. The month is only
 * certain when the INE's calendar already lists a release after `date`
 * (otherwise a release nobody has scheduled yet could fall in between).
 */
function inForce(series: SeriesData, date: string): { ok: IndexUse } | { pending: PendingResult } {
  const first = series.points.find((p) => p.published)?.published ?? null;
  if (!first || date < first) return { pending: { status: "pending", series: series.id, reason: "before-series", month: null, published: first } };
  // Certain when a later release is already listed, or when no unlisted month could be out yet:
  // a month's figure cannot come out before that month has ended.
  const listed = series.points.filter((p) => p.published !== null);
  const lastListed = listed.at(-1)?.month ?? "0000-01";
  const known = listed.some((p) => p.published! > date) || date < `${addMonths(lastListed, 2)}-01`;
  const p = monthInForce(series, date);
  if (!known || !p) return { pending: { status: "pending", series: series.id, reason: "unknown", month: null, published: null } };
  if (p.value === null || !p.published) return { pending: { status: "pending", series: series.id, reason: "scheduled", month: p.month, published: p.published } };
  return { ok: { series: series.id, month: p.month, value: p.value, published: p.published } };
}

/** "2026-11" + 2 → "2027-01". */
function addMonths(month: string, n: number): string {
  const [y, m] = month.split("-").map(Number) as [number, number];
  const t = y * 12 + (m - 1) + n;
  return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, "0")}`;
}

const within = (d: string, from: string, to: string) => d >= from && d <= to;

/** Days a decree started or stopped applying: a few days either side deserve a professional's check. */
const DECREE_EDGES = [RDL_8_2026_FROM, RDL_8_2026_TO, RDL_26_2026_DAY, RDL_29_2026_FROM];

export function computeRentUpdate(input: RentInput, data: RentSeries): RentResult {
  const { rent, signed, update, index, use } = input;
  if (!Number.isFinite(rent) || rent <= 0 || rent > 1_000_000) return { status: "invalid", reason: "rent" };
  if (!validIso(signed) || !validIso(update)) return { status: "invalid", reason: "dates" };
  if (daysBetween(signed, update) < 365) return { status: "invalid", reason: "order" };
  if (update < FIRST_UPDATE || update > LAST_UPDATE) return { status: "out-of-range", first: FIRST_UPDATE, last: LAST_UPDATE };

  const notes = new Set<NoteId>(["notify"]);
  const norms = new Set<NormId>([use === "housing" ? "lau18" : "lau4"]);

  // 1. What the contract says.
  let agreed: OkResult["agreed"];
  if (index === "fixed") {
    const p = input.fixedPercent;
    if (p === undefined || !Number.isFinite(p) || p < -50 || p > 100) return { status: "invalid", reason: "fixed" };
    agreed = { index, percent: p, source: null };
  } else {
    const got = inForce(data[index], update);
    if ("pending" in got) return got.pending;
    agreed = { index, percent: got.ok.value, source: got.ok };
  }

  // 2. The caps of that day (housing only: LAU art. 4.3 leaves other leases to the contract).
  const caps: Cap[] = [];
  if (use === "housing") {
    if (update <= IGC_CAP_TO) {
      const got = inForce(data.igc, update);
      if ("pending" in got) return got.pending;
      const raw = got.ok.value;
      caps.push({ kind: "igc", percent: Math.min(Math.max(raw, 0), IGC_CEILING), raw, index: got.ok, negotiable: true, norms: ["rdl6art46", "ley2Annex"] });
    } else if (within(update, THREE_PCT_FROM, THREE_PCT_TO)) {
      caps.push({ kind: "three", percent: THREE_PCT, index: null, negotiable: true, norms: ["rdl6art46"] });
    }
    if (within(update, RDL_8_2026_FROM, RDL_8_2026_TO)) {
      caps.push({ kind: "rdl8", percent: RDL_8_2026_PCT, index: null, negotiable: true, norms: ["rdl8", "rdl8Repeal"] });
    }

    // The ordinary cap of art. 18.1 / DA 11, by signing day and update day.
    const newContract = signed >= LEY_12_2023_IN_FORCE;
    const everyContractOnIrav = update === RDL_26_2026_DAY || update >= RDL_29_2026_FROM;
    const irav = update >= IRAV_CAP_FROM && (newContract || everyContractOnIrav) ? inForce(data.irav, update) : null;
    // 1 Jan 2025: DA 11 applied, but the first IRAV came out on 2 Jan; the IPC cap of art. 18.1 still held.
    const iravMissing = irav !== null && "pending" in irav && irav.pending.reason === "before-series";
    if (irav && !iravMissing) {
      if ("pending" in irav) return irav.pending;
      const capNorms: NormId[] = newContract ? ["lauDa11"] : [];
      // RDL 26 / 29 rewrote art. 18.1 (every contract) and Ley 12/2023 DT 4 (the ones signed before it).
      if (everyContractOnIrav) capNorms.push(update === RDL_26_2026_DAY ? "rdl26" : "rdl29", ...(newContract ? [] : (["ley12Dt4"] as NormId[])));
      if (update >= RDL_29_2026_FROM) capNorms.push("rdl29Valid");
      caps.push({ kind: "irav", percent: irav.ok.value, index: irav.ok, negotiable: false, norms: capNorms });
    } else if (signed >= RDL_7_2019_IN_FORCE) {
      // RDL 7/2019 wording of art. 18.1: never above the IPC.
      const got = inForce(data.ipc, update);
      if ("pending" in got) return got.pending;
      const capNorms: NormId[] = ["rdl7"];
      if (!newContract) capNorms.push("ley12Dt4");
      if (iravMissing) notes.add("firstIrav");
      caps.push({ kind: "ipc", percent: got.ok.value, index: got.ok, negotiable: false, norms: capNorms });
    } else if (caps.length === 0) {
      notes.add("noLegalCap");
      norms.add("ley12Dt4");
    }
  } else {
    notes.add("commercial");
  }

  // 3. The lower of what was agreed and every cap.
  let binding: Cap | null = null;
  for (const c of caps) if (c.percent < agreed.percent && (!binding || c.percent < binding.percent)) binding = c;
  const percent = binding ? binding.percent : agreed.percent;
  for (const c of caps) for (const n of c.norms) norms.add(n);
  if (binding?.negotiable) notes.add("negotiable");
  if (percent < 0) notes.add("negative");
  for (const src of [agreed.source, binding?.index ?? null]) if (src && src.published === update) notes.add("releaseDay");
  if (use === "housing" && DECREE_EDGES.some((d) => Math.abs(daysBetween(d, update)) <= 3)) notes.add("decreeEdge");

  const newRent = cents(rent * (1 + percent / 100));
  const monthly = cents(newRent - rent);
  return { status: "ok", agreed, caps, binding, percent, newRent, monthly, yearly: cents(monthly * 12), norms: [...norms], notes: [...notes] };
}

/** What a reader types as an amount: "1.000", "1000,50", "1,000.50", "950.5", "3" → a number (NaN when it is not one). */
export function parseAmount(text: string): number {
  let t = text.replace(/[\s€%]/g, "");
  if (t.includes(",") && t.includes(".")) t = t.lastIndexOf(",") > t.lastIndexOf(".") ? t.replace(/\./g, "").replace(",", ".") : t.replace(/,/g, "");
  else if (t.includes(",")) t = t.replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, "");
  return t === "" ? Number.NaN : Number(t);
}

/** The page's default example: a 1,000 € flat on the IRAV, signed two years before `today`, updated today. */
export function defaultExample(today: string): RentInput {
  const signed = `${Number(today.slice(0, 4)) - 2}${today.slice(4)}`.replace(/-02-29$/, "-02-28");
  return { rent: 1000, signed, update: today, index: "irav", use: "housing" };
}
