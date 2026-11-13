import { DRAFT_2027, LEGAL_MAX_WEEKLY_HOURS, OFFICIAL_2027, SMI_2026, SMI_HISTORY, TARGET_YEAR, boeUrl, type SmiYear } from "./rules";

/**
 * The SMI page's logic, pure (client and tests):
 *  - the part-time calculator: the decree's amount "a prorrata" of the hours
 *    worked, in 14 or 12 payments, and the domestic-worker hourly rate;
 *  - reading the 2027 decree from the BOE's open data (the search answer
 *    and the decree's XML), with sanity checks, so the page shows it the
 *    day it is published without anyone typing a figure;
 *  - where 2027 stands on a given day.
 */

export type Payments = 12 | 14;

export interface SmiInput {
  /** Hours a week you work. */
  weeklyHours: number;
  /** The full-time week of your agreement (legal maximum 40, ET art. 34.1). */
  fullTimeHours: number;
  payments: Payments;
}

export const DEFAULT_INPUT: SmiInput = { weeklyHours: 40, fullTimeHours: 40, payments: 14 };

export type SmiResult =
  | { status: "invalid" }
  | {
      status: "ok";
      /** weeklyHours ÷ fullTimeHours. */
      share: number;
      /** Each of the 12 or 14 payments. */
      perPayment: number;
      /** What a month brings on average (yearly ÷ 12). */
      monthlyAverage: number;
      yearly: number;
      daily: number;
    };

const round2 = (x: number) => Math.round(x * 100) / 100;

/** The minimum for a week of `weeklyHours` out of a full-time `fullTimeHours`, in 14 or 12 payments. */
export function smiFor(year: Pick<SmiYear, "monthly" | "annual" | "daily">, input: SmiInput): SmiResult {
  const { weeklyHours: h, fullTimeHours: full, payments } = input;
  if (!Number.isFinite(h) || !Number.isFinite(full) || h <= 0 || full <= 0 || full > LEGAL_MAX_WEEKLY_HOURS || h > full) return { status: "invalid" };
  const share = h / full;
  const yearly = round2(year.annual * share);
  const perPayment = round2(payments === 14 ? year.monthly * share : (year.annual / 12) * share);
  return { status: "ok", share, perPayment, monthlyAverage: round2(yearly / 12), yearly, daily: round2(year.daily * share) };
}

/** Domestic workers paid by the hour: the hourly rate already includes extra payments and holidays (RD art. 4.2). */
export function domesticFor(year: Pick<SmiYear, "domesticHourly">, weeklyHours: number): { weekly: number; monthly: number } | null {
  if (!Number.isFinite(weeklyHours) || weeklyHours <= 0 || weeklyHours > 60) return null;
  const weekly = round2(year.domesticHourly * weeklyHours);
  return { weekly, monthly: round2((weekly * 52) / 12) };
}

/** The 12-payment month: yearly ÷ 12 (17.094 € → 1.424,50 €). */
export function prorated12(year: Pick<SmiYear, "annual">): number {
  return round2(year.annual / 12);
}

/** % rise on the previous year, one decimal; null for the first row. */
export function increaseOn(prev: Pick<SmiYear, "monthly"> | null, year: Pick<SmiYear, "monthly">): number | null {
  if (!prev) return null;
  return Math.round(((year.monthly / prev.monthly - 1) * 100) * 10) / 10;
}

/* -------------------------------------------------------------------------- */
/* The 2027 decree from the BOE's open data                                   */
/* -------------------------------------------------------------------------- */

export interface BoeHit {
  boeId: string;
  title: string;
  /** "2027-02-10", when the answer says it. */
  published: string | null;
}

/** "Real Decreto 87/2025, de 11 de febrero, por el que se fija el salario mínimo interprofesional para 2025." */
export function isSmiDecreeTitle(title: string, year: number): boolean {
  return new RegExp(`^Real Decreto \\d+/\\d{4}, de \\d{1,2} de [a-záéíóú]+, por el que se fija el salario mínimo interprofesional para ${year}\\.?$`, "i").test(title.trim());
}

const isoOf = (yyyymmdd: unknown): string | null => (typeof yyyymmdd === "string" && /^\d{8}$/.test(yyyymmdd) ? `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}` : null);

/**
 * The year's SMI decree in a BOE open-data answer: the legislation search
 * (`/datosabiertos/api/legislacion-consolidada`) or a day's summary
 * (`/datosabiertos/api/boe/sumario/AAAAMMDD`). Walks the whole JSON, so both
 * shapes work; corrections and orders that merely cite the decree do not
 * match the title. Pure.
 */
export function findSmiDecree(json: unknown, year: number, summaryDay: string | null = null): BoeHit | null {
  const stack: unknown[] = [json];
  while (stack.length) {
    const node = stack.pop();
    if (Array.isArray(node)) {
      stack.push(...node);
      continue;
    }
    if (!node || typeof node !== "object") continue;
    const o = node as Record<string, unknown>;
    if (typeof o.identificador === "string" && typeof o.titulo === "string" && /^BOE-A-\d{4}-\d+$/.test(o.identificador) && isSmiDecreeTitle(o.titulo, year)) {
      return { boeId: o.identificador, title: o.titulo.trim().replace(/\.$/, ""), published: isoOf(o.fecha_publicacion) ?? summaryDay };
    }
    for (const v of Object.values(o)) if (v && typeof v === "object") stack.push(v);
  }
  return null;
}

/** "1 221", "1.000", "735,9", "10.302,6" (BOE thousands: dot, space, no-break or narrow no-break space). */
export function boeNumber(text: string): number {
  const n = Number(text.replace(/[\s  .]/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

function plainText(xml: string): string {
  return xml
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCharCode(Number(d)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[\s  ]+/g, " ");
}

const NUM = "(\\d[\\d.,\\u00a0\\u202f ]*\\d|\\d)";

export interface ParsedDecree {
  boeId: string;
  /** "Real Decreto 3/2027, de 12 de enero". */
  norm: string;
  published: string;
  monthly: number;
  daily: number;
  annual: number;
  domesticHourly: number;
  temporaryDaily: number;
  /** "2027-01-01": the date its effects start (disposición final tercera). */
  effectiveFrom: string;
}

const MONTHS_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/**
 * The amounts of an SMI decree from its BOE XML (`/diario_boe/xml.php?id=`),
 * or null when any of them is missing or fails the checks: yearly = monthly
 * × 14, daily ≈ monthly ÷ 30, monthly at least the previous year's and at
 * most 25 % above it. Pure.
 */
export function parseSmiDecree(xml: string, year: number, previous: Pick<SmiYear, "monthly"> = SMI_2026): ParsedDecree | null {
  const t = plainText(xml);
  const title = /<titulo>([^<]+)<\/titulo>/.exec(xml)?.[1]?.trim() ?? "";
  const boeId = /<identificador>(BOE-A-\d{4}-\d+)<\/identificador>/.exec(xml)?.[1] ?? null;
  const published = isoOf(/<fecha_publicacion>(\d{8})<\/fecha_publicacion>/.exec(xml)?.[1]);
  if (!boeId || !published || !isSmiDecreeTitle(title, year)) return null;
  const norm = /^(Real Decreto \d+\/\d{4}, de \d{1,2} de [a-záéíóú]+)/i.exec(title)?.[1];
  const art1 = new RegExp(`queda fijad[oa](?: para \\d{4})? en ${NUM} euros/día o ${NUM} euros/mes`).exec(t);
  const annual = new RegExp(`cuantía anual inferior a ${NUM} euros`).exec(t);
  const domestic = new RegExp(`será(?: para \\d{4})? de ${NUM} euros por hora`).exec(t);
  const temporary = new RegExp(`inferior a ${NUM} euros por jornada legal`).exec(t);
  const effects = /con efectos (?:desde el|del) (\d{1,2}) de ([a-z]+) de (\d{4})/.exec(t);
  if (!norm || !art1 || !annual || !domestic || !temporary) return null;
  const daily = boeNumber(art1[1]!);
  const monthly = boeNumber(art1[2]!);
  const out: ParsedDecree = {
    boeId,
    norm,
    published,
    monthly,
    daily,
    annual: boeNumber(annual[1]!),
    domesticHourly: boeNumber(domestic[1]!),
    temporaryDaily: boeNumber(temporary[1]!),
    effectiveFrom: effects && MONTHS_ES.includes(effects[2]!) ? `${effects[3]}-${String(MONTHS_ES.indexOf(effects[2]!) + 1).padStart(2, "0")}-${effects[1]!.padStart(2, "0")}` : `${year}-01-01`,
  };
  const ok =
    [out.monthly, out.daily, out.annual, out.domesticHourly, out.temporaryDaily].every((n) => Number.isFinite(n) && n > 0) &&
    Math.abs(out.annual - out.monthly * 14) < 0.01 &&
    Math.abs(out.daily - out.monthly / 30) < 0.02 &&
    out.monthly >= previous.monthly &&
    out.monthly <= previous.monthly * 1.25 &&
    out.domesticHourly < out.daily &&
    out.temporaryDaily > out.daily;
  return ok ? out : null;
}

/* -------------------------------------------------------------------------- */
/* Where 2027 stands                                                          */
/* -------------------------------------------------------------------------- */

/** What the server learnt from the BOE in this render. */
export interface LiveBoe {
  /** The BOE answered (search or summary). */
  checked: boolean;
  /** The 2027 decree, when the BOE has it. */
  hit: BoeHit | null;
  /** Its amounts, when the XML read cleanly. */
  parsed: ParsedDecree | null;
}

export type Smi2027Status =
  /** In the BOE and its amounts are known (typed in OFFICIAL_2027 or read from the XML). */
  | { kind: "official"; year: SmiYear; source: "rules" | "boe-live" }
  /** In the BOE, amounts not read (the XML did not parse): link only. */
  | { kind: "published"; hit: BoeHit }
  /** Not in the BOE: the Ministry's draft is the newest official document. */
  | { kind: "draft" };

export function smi2027Status(live: LiveBoe | null, official: SmiYear | null = OFFICIAL_2027): Smi2027Status {
  if (official) return { kind: "official", year: official, source: "rules" };
  if (live?.parsed) {
    const p = live.parsed;
    return { kind: "official", source: "boe-live", year: { year: TARGET_YEAR, norm: p.norm, boeId: p.boeId, published: p.published, effectiveFrom: p.effectiveFrom, monthly: p.monthly, daily: p.daily, annual: p.annual, domesticHourly: p.domesticHourly, temporaryDaily: p.temporaryDaily } };
  }
  if (live?.hit) return { kind: "published", hit: live.hit };
  return { kind: "draft" };
}

/** Every official year, oldest first (2027 once it is in the BOE). */
export function officialYears(status: Smi2027Status): SmiYear[] {
  return status.kind === "official" ? [...SMI_HISTORY, status.year] : [...SMI_HISTORY];
}

/** The year the calculator opens on: 2027 from its effective day once official, else 2026. */
export function currentYear(status: Smi2027Status, today: string): SmiYear {
  return status.kind === "official" && today >= status.year.effectiveFrom ? status.year : SMI_2026;
}

export { DRAFT_2027, boeUrl };
