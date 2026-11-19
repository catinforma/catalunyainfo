import { round2 } from "@/lib/programmatic/lottery-tax/engine";
import { withStake as stakeAt, type StakeResult } from "@/lib/programmatic/lottery-check/engine";

import { DRAWN_TOTAL, EXTRACTIONS, NUMBER_COUNT, TICKET_PRICE, TIER_ORDER, type Extraction, type PrizeKey, type Tier } from "./programme";

/**
 * The La Grossa de Cap d'Any checker as arithmetic: which prizes a
 * five-digit number wins from the winning numbers Loteries de Catalunya has
 * published, under DOGC 9640 annex 3 (programme.ts), and what the reader
 * keeps of them. Pure and client-safe: the browser runs it on the JSON the
 * page serves, the tests on TEST draws.
 *
 * Never says "no prize" until all eight numbers are in.
 */

/** The eight winning numbers as published so far, five digits each. */
export interface GrossaDraw {
  /** 8th extraction, La Grossa. */
  first: string | null;
  /** 7th extraction. */
  second: string | null;
  /** 6th extraction. */
  third: string | null;
  /** 4th and 5th extractions, in draw order, as drawn so far. */
  fourth: string[];
  /** 1st, 2nd and 3rd extractions, in draw order, as drawn so far. */
  fifth: string[];
}

export interface Hit {
  /** Extraction 1-8. */
  extraction: number;
  prize: PrizeKey;
  tier: Tier;
  /** The winning number of that extraction. */
  from: string;
  /** Euros per 10 € ticket. */
  perTicket: number;
}

export type CheckStatus = "prize" | "none" | "none-yet";

export interface CheckResult {
  number: string;
  hits: Hit[];
  perTicket: number;
  perEuro: number;
  status: CheckStatus;
  complete: boolean;
  /** How many of the eight numbers are known. */
  known: number;
}

export const isNumber = (n: unknown): n is string => typeof n === "string" && /^\d{5}$/.test(n);

const pad = (n: number) => String(((n % NUMBER_COUNT) + NUMBER_COUNT) % NUMBER_COUNT).padStart(5, "0");

/** The number before and after (00000's previous is 99999; 99999's next is 00000: Loteries de Catalunya's game page). */
export function neighbours(n: string): [string, string] {
  const v = Number(n);
  return [pad(v - 1), pad(v + 1)];
}

/** Each extraction's winning number so far, in draw order (null while not drawn). */
export function byExtraction(d: GrossaDraw): (string | null)[] {
  return [d.fifth[0] ?? null, d.fifth[1] ?? null, d.fifth[2] ?? null, d.fourth[0] ?? null, d.fourth[1] ?? null, d.third, d.second, d.first];
}

export function knownCount(d: GrossaDraw): number {
  return byExtraction(d).filter(isNumber).length;
}

export function drawComplete(d: GrossaDraw): boolean {
  return knownCount(d) === DRAWN_TOTAL;
}

/** The tiers `number` matches against one winning number (before 8.2 picks the best). */
function matches(number: string, winner: string, e: Extraction): Tier[] {
  if (number === winner) return ["five"];
  const out: Tier[] = [];
  if (neighbours(winner).includes(number)) out.push("neighbour");
  for (const [tier, k] of [["last4", 4], ["last3", 3], ["last2", 2], ["last1", 1]] as const) {
    if (e.pays[tier] !== undefined && number.slice(5 - k) === winner.slice(5 - k)) out.push(tier);
  }
  return out;
}

/**
 * Every prize `number` wins: per extraction, the highest-paying tier it
 * matches (DOGC 9640 annex 3, 8.2: "el premi de major import dins les
 * categories establertes per a aquesta extracció"); across extractions they
 * add up (8.3: "la categoria més alta de cada extracció").
 */
export function prizesOf(number: string, d: GrossaDraw): Hit[] {
  const hits: Hit[] = [];
  byExtraction(d).forEach((winner, i) => {
    if (!isNumber(winner)) return;
    const e = EXTRACTIONS[i]!;
    const tiers = matches(number, winner, e);
    if (!tiers.length) return;
    const best = tiers.reduce((a, b) => ((e.pays[b] ?? 0) > (e.pays[a] ?? 0) ? b : a));
    hits.push({ extraction: e.n, prize: e.prize, tier: best, from: winner, perTicket: e.pays[best]! });
  });
  return hits;
}

export function check(number: string, d: GrossaDraw): CheckResult {
  const hits = prizesOf(number, d);
  const total = round2(hits.reduce((s, h) => s + h.perTicket, 0));
  const complete = drawComplete(d);
  return { number, hits, perTicket: total, perEuro: round2(total / TICKET_PRICE), status: hits.length ? "prize" : complete ? "none" : "none-yet", complete, known: knownCount(d) };
}

/** What `played` euros on this number keep after the levy: each whole 10 € ticket its own 40,000 € exempt, a participació its share. */
export function withStake(prizePerTicket: number, played: number): StakeResult {
  return stakeAt(prizePerTicket, played, TICKET_PRICE);
}

/** How many numbers of 00000-99999 win each (extraction, tier): the tests compare it with TIER_COUNT. */
export function countWinners(d: GrossaDraw): Map<string, number> {
  const out = new Map<string, number>();
  for (let i = 0; i < NUMBER_COUNT; i++) for (const h of prizesOf(pad(i), d)) out.set(`${h.extraction}:${h.tier}`, (out.get(`${h.extraction}:${h.tier}`) ?? 0) + 1);
  return out;
}

/** The order the page lists tiers in. */
export const TIERS = TIER_ORDER;
