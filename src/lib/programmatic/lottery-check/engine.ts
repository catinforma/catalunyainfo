import { breakdown, round2, type Breakdown } from "@/lib/programmatic/lottery-tax/engine";

import { CATEGORIES, DECIMO_PRICE, DRAWN, NUMBER_COUNT, perDecimo, type CategoryId } from "./programme";

/**
 * The Christmas lottery checker as arithmetic: which prizes a five-digit
 * number wins under the programme (programme.ts), from the numbers SELAE has
 * published, and what the reader keeps of them for what they played. Pure and
 * client-safe: the browser runs it on the JSON the page serves, the server on
 * the committed snapshot, the tests on the TEST fixture.
 *
 * Never says "no prize" unless every number has been read: until then the
 * answer is "not among the numbers published so far".
 */

/** The drawn numbers the checker knows: five digits each, as SELAE prints them. */
export interface CheckerDraw {
  first: string | null;
  second: string | null;
  third: string | null;
  /** The two fourth prizes, as drawn so far. */
  fourth: string[];
  /** The eight fifth prizes, as drawn so far. */
  fifth: string[];
  /** The 1,794 numbers of the pedrea as read so far; null when the list could not be read at all. */
  pedrea: string[] | null;
}

export interface Hit {
  category: CategoryId;
  /** The winning number the prize derives from (or the number itself for a drawn prize). */
  from: string;
  perDecimo: number;
}

export type CheckStatus =
  /** At least one prize. */
  | "prize"
  /** Every number is in and none matches. */
  | "none"
  /** Nothing matches the numbers read so far, but some are still missing. */
  | "none-yet";

export interface CheckResult {
  number: string;
  hits: Hit[];
  /** Sum of every hit, per 20 € décimo. */
  perDecimo: number;
  /** Per euro played. */
  perEuro: number;
  status: CheckStatus;
  /** Every one of the 1,807 drawn numbers is known. */
  complete: boolean;
  /** Which lists are not complete yet (for the "not yet" message). */
  missing: ("top" | "pedrea")[];
}

export const isNumber = (n: unknown): n is string => typeof n === "string" && /^\d{5}$/.test(n);

const pad = (n: number) => String(((n % NUMBER_COUNT) + NUMBER_COUNT) % NUMBER_COUNT).padStart(5, "0");

/** The number before and after (00000's anterior is 99999; 99999's posterior is 00000). */
export function neighbours(n: string): [string, string] {
  const v = Number(n);
  return [pad(v - 1), pad(v + 1)];
}

const sameHundred = (a: string, b: string) => a.slice(0, 3) === b.slice(0, 3);
const sameLastTwo = (a: string, b: string) => a.slice(3) === b.slice(3);
const sameLast = (a: string, b: string) => a.slice(4) === b.slice(4);

/** The pedrea as a Set, once per list: the tests sweep all 100,000 numbers. */
const PEDREA_SETS = new WeakMap<readonly string[], Set<string>>();
function inPedrea(d: CheckerDraw, n: string): boolean {
  if (!d.pedrea) return false;
  let set = PEDREA_SETS.get(d.pedrea);
  if (!set) PEDREA_SETS.set(d.pedrea, (set = new Set(d.pedrea)));
  return set.has(n);
}

/** Every top number drawn so far, in programme order. */
function tops(d: CheckerDraw): string[] {
  return [d.first, d.second, d.third, ...d.fourth, ...d.fifth].filter(isNumber);
}

/** True when all 1,807 numbers are known. */
export function drawComplete(d: CheckerDraw): boolean {
  return tops(d).length === DRAWN.first + DRAWN.second + DRAWN.third + DRAWN.fourth + DRAWN.fifth && (d.pedrea?.length ?? 0) === DRAWN.pedrea;
}

/**
 * Every prize `number` wins. Each derived prize excludes only the number it
 * derives from (BOE-A-2010-19540: "quedan exceptuados los números de los que,
 * respectivamente se deriven"), so prizes add up: a fifth prize ending in the
 * Gordo's last digit also gets the reintegro.
 */
export function prizesOf(number: string, d: CheckerDraw): Hit[] {
  const hits: Hit[] = [];
  const add = (category: CategoryId, from: string) => hits.push({ category, from, perDecimo: perDecimo(category) });
  const top: [CategoryId, string | null][] = [
    ["first", d.first],
    ["second", d.second],
    ["third", d.third],
  ];
  for (const [id, n] of top) if (n === number) add(id, n);
  for (const n of d.fourth) if (n === number) add("fourth", n);
  for (const n of d.fifth) if (n === number) add("fifth", n);
  if (inPedrea(d, number)) add("pedrea", number);

  const derived: ["first" | "second" | "third", string | null, CategoryId, CategoryId, CategoryId][] = [
    ["first", d.first, "approxFirst", "hundredFirst", "lastTwoFirst"],
    ["second", d.second, "approxSecond", "hundredSecond", "lastTwoSecond"],
    ["third", d.third, "approxThird", "hundredThird", "lastTwoThird"],
  ];
  for (const [, n, approx, hundred, lastTwo] of derived) {
    if (!isNumber(n)) continue;
    if (neighbours(n).includes(number)) add(approx, n);
    if (number !== n && sameHundred(number, n)) add(hundred, n);
    if (number !== n && sameLastTwo(number, n)) add(lastTwo, n);
  }
  for (const n of d.fourth) if (number !== n && sameHundred(number, n)) add("hundredFourth", n);
  if (isNumber(d.first) && number !== d.first && sameLast(number, d.first)) add("reintegro", d.first);
  return hits;
}

export function check(number: string, d: CheckerDraw): CheckResult {
  const hits = prizesOf(number, d);
  const total = round2(hits.reduce((sum, h) => sum + h.perDecimo, 0));
  const complete = drawComplete(d);
  const missing: ("top" | "pedrea")[] = [];
  if (tops(d).length < 13) missing.push("top");
  if ((d.pedrea?.length ?? 0) < DRAWN.pedrea) missing.push("pedrea");
  return {
    number,
    hits,
    perDecimo: total,
    perEuro: round2(total / DECIMO_PRICE),
    status: hits.length ? "prize" : complete ? "none" : "none-yet",
    complete,
    missing,
  };
}

/** Most a reader may type, in euros (1,000 décimos): a guard against typos, not a rule. */
export const MAX_PLAYED = 20_000;

export type StakeResult = { status: "invalid" } | { status: "ok"; decimos: number; total: Breakdown };

/**
 * What `played` euros on this number keep after the special levy (lottery-tax
 * engine, Ley 35/2006 DA 33ª): each whole 20 € décimo has its own 40,000 €
 * exempt part, and a share of a décimo (a participación) its share of it.
 * 25 € = one whole décimo + a quarter of another. `price` is the ticket's
 * (20 € décimos here and for El Niño, 10 € La Grossa tickets).
 */
export function withStake(prizePerDecimo: number, played: number, price: number = DECIMO_PRICE): StakeResult {
  if (!Number.isFinite(played) || played <= 0 || played > MAX_PLAYED || !(prizePerDecimo >= 0) || !(price > 0)) return { status: "invalid" };
  const whole = Math.floor(played / price + 1e-9);
  const rest = round2(played - whole * price);
  const zero: Breakdown = { gross: 0, exempt: 0, base: 0, withholding: 0, net: 0 };
  if (prizePerDecimo === 0) return { status: "ok", decimos: played / price, total: zero };
  const one = breakdown(prizePerDecimo, price, 1);
  const part = rest > 0 ? breakdown(prizePerDecimo, price, rest / price) : zero;
  const sum = (k: keyof Breakdown) => round2(one[k] * whole + part[k]);
  return { status: "ok", decimos: played / price, total: { gross: sum("gross"), exempt: sum("exempt"), base: sum("base"), withholding: sum("withholding"), net: sum("net") } };
}

/** How many numbers of 00000-99999 win each category: the tests compare it with the programme's counts. */
export function countWinners(d: CheckerDraw): Record<CategoryId, number> {
  const out = Object.fromEntries(CATEGORIES.map((c) => [c.id, 0])) as Record<CategoryId, number>;
  for (let i = 0; i < NUMBER_COUNT; i++) for (const h of prizesOf(pad(i), d)) out[h.category] += 1;
  return out;
}
