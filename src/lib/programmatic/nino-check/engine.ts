import { withStake as stakeAt, type StakeResult } from "@/lib/programmatic/lottery-check/engine";
import { round2 } from "@/lib/programmatic/lottery-tax/engine";

import { NUMBER_COUNT, type Digits, type NinoCategory, type NinoProgramme, type TopKey } from "./programme";

/**
 * The El Niño checker as arithmetic: which prizes a five-digit number wins
 * from the numbers SELAE has published, under a programme (programme.ts:
 * SELAE's 2027 one once read, the BOE's 2011 one in the tests), and what the
 * reader keeps. Pure and client-safe.
 *
 * Every prize adds up; a derived prize (centena, terminación, reintegro)
 * leaves out only the number it derives from (BOE-A-2010-20031: "quedan
 * exceptuados los números de los que, respectivamente se deriven"). Never
 * says "no prize" until every extraction the programme lists is in.
 */

/** The drawn numbers the checker knows, as SELAE prints them. */
export interface NinoDraw {
  first: string | null;
  second: string | null;
  third: string | null;
  /** Other extractions by number of digits, in draw order, as drawn so far (x1: the special reintegro extractions). */
  x5: string[];
  x4: string[];
  x3: string[];
  x2: string[];
  x1: string[];
}

export interface Hit {
  category: string;
  /** The drawn number (or ending) the prize comes from. */
  from: string;
  perDecimo: number;
}

export type CheckStatus = "prize" | "none" | "none-yet";

export interface CheckResult {
  number: string;
  hits: Hit[];
  perDecimo: number;
  perEuro: number;
  status: CheckStatus;
  complete: boolean;
}

export const isNumber = (n: unknown): n is string => typeof n === "string" && /^\d{5}$/.test(n);

const pad = (n: number) => String(((n % NUMBER_COUNT) + NUMBER_COUNT) % NUMBER_COUNT).padStart(5, "0");

/** The number before and after (00000's anterior is 99999; 99999's posterior is 00000: BOE-A-2010-20031). */
export function neighbours(n: string): [string, string] {
  const v = Number(n);
  return [pad(v - 1), pad(v + 1)];
}

const list = (d: NinoDraw, digits: Digits): string[] => d[`x${digits}` as const];
const top = (d: NinoDraw, key: TopKey): string | null => d[key];
const perDecimoOf = (c: NinoCategory, p: NinoProgramme) => c.perBillete / (p.billetePrice / p.decimoPrice);

/** True when every extraction of the programme is known. */
export function drawComplete(d: NinoDraw, p: NinoProgramme): boolean {
  return p.categories.every((c) => (c.kind === "top" ? isNumber(top(d, c.id)) : c.kind === "extraction" ? list(d, c.digits).length === c.extractions : true));
}

/** Every prize `number` wins. */
export function prizesOf(number: string, d: NinoDraw, p: NinoProgramme): Hit[] {
  const hits: Hit[] = [];
  for (const c of p.categories) {
    const add = (from: string) => hits.push({ category: c.id, from, perDecimo: perDecimoOf(c, p) });
    if (c.kind === "top") {
      if (top(d, c.id) === number) add(number);
      continue;
    }
    if (c.kind === "extraction") {
      for (const e of list(d, c.digits)) if (e.length === c.digits && number.slice(5 - c.digits) === e) add(e);
      continue;
    }
    const src = top(d, c.from);
    if (!isNumber(src)) continue;
    if (c.kind === "approx" && neighbours(src).includes(number)) add(src);
    if (c.kind === "hundred" && number !== src && number.slice(0, 3) === src.slice(0, 3)) add(src);
    if (c.kind === "ending" && number !== src && number.slice(5 - c.digits) === src.slice(5 - c.digits)) add(src);
  }
  return hits;
}

export function check(number: string, d: NinoDraw, p: NinoProgramme): CheckResult {
  const hits = prizesOf(number, d, p);
  const total = round2(hits.reduce((s, h) => s + h.perDecimo, 0));
  const complete = drawComplete(d, p);
  return { number, hits, perDecimo: total, perEuro: round2(total / p.decimoPrice), status: hits.length ? "prize" : complete ? "none" : "none-yet", complete };
}

/** What `played` euros on this number keep after the levy (20 € décimos, each with its own 40,000 € exempt). */
export function withStake(prizePerDecimo: number, played: number, p: NinoProgramme): StakeResult {
  return stakeAt(prizePerDecimo, played, p.decimoPrice);
}

/** How many numbers of 00000-99999 win each category: the tests compare it with the programme's counts. */
export function countWinners(d: NinoDraw, p: NinoProgramme): Record<string, number> {
  const out: Record<string, number> = Object.fromEntries(p.categories.map((c) => [c.id, 0]));
  for (let i = 0; i < NUMBER_COUNT; i++) for (const h of prizesOf(pad(i), d, p)) out[h.category] = (out[h.category] ?? 0) + 1;
  return out;
}
