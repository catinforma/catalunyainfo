import { inhabilReason, isIsoDate, plusDays, plusMonths, type Calendar } from "@/lib/programmatic/working-days/engine";

import {
  APREMIO_DAY,
  BOE_DEEMED_DAYS,
  DEV_REJECT_DAYS,
  DISCOUNT_DAYS,
  DISCOUNT_RATE,
  FINAL_PAYMENT_DAYS,
  FULL_PAYMENT_DAYS,
  IDENTIFY_DAYS,
  POINTS,
  PRESCRIPTION_MONTHS,
  REPOSICION_MONTHS,
  SURCHARGE_RATE,
  type Severity,
  type Surcharge,
} from "./rules";

/**
 * The traffic-fines engine: pure date-only arithmetic on ISO "YYYY-MM-DD"
 * strings, on the working-days engine's day numbers (no `Date`, so no time
 * zone can move a day). Every count is the one rules.ts quotes:
 *
 *  - días naturales from the day after the notification (LSV arts. 93.1,
 *    94, 95.1, 110.1): the Nth calendar day after it is the last one;
 *  - a last day that falls on a Saturday, Sunday or holiday moves to the next
 *    working day (Ley 39/2015 art. 30.5, applied by LSV art. 83.1). The
 *    calculator shows both: the Nth natural day as the safe day, the moved
 *    day as the legal one;
 *  - months "de fecha a fecha": the same day number, or the month's last day
 *    (Ley 39/2015 art. 30.4), for the recurso de reposición and the
 *    prescription;
 *  - the providencia de apremio: the 20th of the month or the 5th of the next
 *    (LGT art. 62.5), moved to the next working day.
 *
 * The notification date the counts start from depends on the channel: the
 * day of the stop or of delivery, the day the DEV message was opened, ten
 * natural days after it was put there when never opened (LSV art. 90.2), or
 * the Tablón Edictal's publication day (the DGT's reading; art. 91 deems it
 * made twenty days later, which the result carries as the later reading).
 */

export type Stage = "denuncia" | "resolucion" | "apremio";
export const STAGES: readonly Stage[] = ["denuncia", "resolucion", "apremio"];

export type Channel = "spot" | "paper" | "dev-opened" | "dev-unopened" | "teu";
export const CHANNELS: readonly Channel[] = ["spot", "paper", "dev-opened", "dev-unopened", "teu"];

export type SeverityInput = Severity | "unknown";
export const SEVERITIES: readonly SeverityInput[] = ["leve", "grave", "muy-grave", "unknown"];

export interface FineInput {
  stage: Stage;
  /** How the denuncia reached you (stage "denuncia" only). */
  channel: Channel;
  /** The date you have: of the stop, of delivery, the DEV date, the TEU publication, the resolution's or the providencia's notification. */
  date: string;
  /** The fine on the notification, in euros, without any surcharge. */
  amount: number;
  /** The notification says it takes points away. */
  points: boolean;
  severity: SeverityInput;
  /** One of the offences of LSV art. 93.2 (no 50 %): a radar jammer, not identifying the driver… */
  excluded: boolean;
  /** Optional: the day of the facts, for the prescription. */
  offence: string | null;
}

/** A plazo's end: the Nth natural day and, when that day is inhábil, the next working day. */
export interface Due {
  /** The Nth natural day (or the date the rule names): the safe last day. */
  nominal: string;
  /** Why `nominal` is inhábil, or null when it is a working day. */
  reason: "saturday" | "sunday" | "holiday" | null;
  /** The legal last day: `nominal`, or the next working day when it is inhábil; null when the holidays that far are not known. */
  legal: string | null;
}

export interface Prescription {
  /** 3 or 6 months (art. 112.1); both when the severity is not known and nothing else tells it. */
  months: readonly number[];
  /** The end of each, "de fecha a fecha" from the day of the facts. */
  until: readonly string[];
  /** True when the notification came inside the shortest of them (it interrupts it, art. 112.2), false when after all of them, null when in between. */
  notifiedInside: boolean | null;
}

/** What happens after the 20 days if you neither pay nor file alegaciones (art. 95.4). */
export type IfNothing = "denuncia-resolves" | "resolution-follows" | "depends";

export interface DenunciaResult {
  status: "ok";
  stage: "denuncia";
  /** The day the 20 days count from (the DGT's reading for the Tablón Edictal). */
  notified: string;
  /** Tablón Edictal only: art. 91's reading, twenty natural days after publication. */
  notifiedLaw: string | null;
  /** Last day to pay with the 50 %; null when the offence has no discount (art. 93.2). */
  discount: Due | null;
  /** Tablón Edictal only: the same under art. 91's reading. */
  discountLaw: Due | null;
  /** The amount with the 50 % off; null when excluded. */
  reduced: number | null;
  /** Last day for alegaciones (art. 95.1): same 20 days. */
  alegaciones: Due;
  /** Last day to identify the driver (art. 93.1); null when the vehicle was stopped. */
  identify: Due | null;
  ifNothing: IfNothing;
  /** When the denuncia resolves (or may): the DGT's 45 days to pay the full amount (arts. 95.4 + 110.1). */
  fullUntil: Due | null;
  /** The amount with each surcharge if it goes to apremio. */
  surcharged: Record<Surcharge, number>;
  /** With points: the day the 12 points come back if paid with the discount on its last safe day and nothing else firm follows (arts. 94 f, 65.1). */
  pointsBackIfPaidOn: { paid: string; back: string } | null;
  prescription: Prescription | null;
}

export interface ResolucionResult {
  status: "ok";
  stage: "resolucion";
  notified: string;
  /** Recurso de reposición: one month from the day after (art. 96.2). */
  reposicion: Due;
  /** Pay the full amount: 15 natural days (art. 110.1), counted from the notification (the resolution is enforceable from the next day, art. 96.1). */
  payFull: Due;
  surcharged: Record<Surcharge, number>;
}

export interface ApremioResult {
  status: "ok";
  stage: "apremio";
  notified: string;
  /** LGT art. 62.5: the 20th of the month (notified 1-15) or the 5th of the next (16 to the end). */
  due: Due;
  surcharged: Record<Surcharge, number>;
}

export type InvalidReason = "date" | "amount" | "offence" | "leve-points";
export type FineResult = DenunciaResult | ResolucionResult | ApremioResult | { status: "invalid"; reason: InvalidReason };

/** Fines above this are not traffic fines a person gets (art. 80.2 d tops at 20,000 €, +30 % art. 81). */
export const MAX_AMOUNT = 26_000;

/* -------------------------------------------------------------------------- */
/* Days                                                                       */
/* -------------------------------------------------------------------------- */

const ADMIN = { rules: "admin" } as const;
const inRange = (iso: string, cal: Calendar) => iso >= cal.from && iso <= cal.to;

/** `nominal` as a Due: its inhábil reason and the next working day (Ley 39/2015 art. 30.5). */
export function dueOn(nominal: string, cal: Calendar): Due {
  // Beyond the holiday data only the weekend is known: no legal day is given.
  if (!inRange(nominal, cal)) return { nominal, reason: inhabilReason(nominal, { holidays: new Set() }, ADMIN) as Due["reason"], legal: null };
  const reason = inhabilReason(nominal, cal, ADMIN) as Due["reason"];
  if (!reason) return { nominal, reason: null, legal: nominal };
  let day = nominal;
  while (inhabilReason(day, cal, ADMIN)) {
    day = plusDays(day, 1);
    if (!inRange(day, cal)) return { nominal, reason, legal: null };
  }
  return { nominal, reason, legal: day };
}

/** N natural days counted from the day after `from`: the Nth day after it. */
export function afterDays(from: string, days: number, cal: Calendar): Due {
  return dueOn(plusDays(from, days), cal);
}

/** N months "de fecha a fecha" from `from` (Ley 39/2015 art. 30.4). */
export function afterMonths(from: string, months: number, cal: Calendar): Due {
  return dueOn(plusMonths(from, months), cal);
}

/** LGT art. 62.5: the deadline of a providencia de apremio notified on `notified`. */
export function apremioDue(notified: string, cal: Calendar): Due {
  const day = Number(notified.slice(8, 10));
  const ym = notified.slice(0, 8);
  const nominal = day <= APREMIO_DAY.firstHalfUntil ? `${ym}${String(APREMIO_DAY.thisMonth).padStart(2, "0")}` : `${plusMonths(`${ym}01`, 1).slice(0, 8)}${String(APREMIO_DAY.nextMonth).padStart(2, "0")}`;
  return dueOn(nominal, cal);
}

/** The day the 20 days count from, by channel (LSV arts. 89-91; the DGT for the Tablón Edictal). */
export function notificationDay(channel: Channel, date: string): { notified: string; law: string | null } {
  if (channel === "dev-unopened") return { notified: plusDays(date, DEV_REJECT_DAYS), law: null };
  if (channel === "teu") return { notified: date, law: plusDays(date, BOE_DEEMED_DAYS) };
  return { notified: date, law: null };
}

/** Art. 95.4: does the denuncia itself resolve the procedure when you do nothing? */
export function ifNothing(severity: SeverityInput, points: boolean, spot: boolean): IfNothing {
  if (severity === "leve") return "denuncia-resolves";
  if (severity === "grave") return spot || !points ? "denuncia-resolves" : "resolution-follows";
  if (severity === "muy-grave") return spot ? "denuncia-resolves" : "resolution-follows";
  // Not known: on the spot every class resolves; off it, points mean grave or muy grave (a resolution follows), no points leave leve / grave (resolves) or muy grave (follows).
  if (spot) return "denuncia-resolves";
  return points ? "resolution-follows" : "depends";
}

/** The months of art. 112.1 that can apply: points mean grave or muy grave (art. 64.1). */
export function prescriptionMonths(severity: SeverityInput, points: boolean): number[] {
  if (severity !== "unknown") return [PRESCRIPTION_MONTHS[severity]];
  if (points) return [PRESCRIPTION_MONTHS.grave];
  return [...new Set([PRESCRIPTION_MONTHS.leve, PRESCRIPTION_MONTHS.grave])].sort((a, b) => a - b);
}

export function prescription(offence: string, notified: string, severity: SeverityInput, points: boolean): Prescription {
  const months = prescriptionMonths(severity, points);
  const until = months.map((m) => plusMonths(offence, m));
  const inside = notified <= until[0]!;
  const after = notified > until[until.length - 1]!;
  return { months, until, notifiedInside: inside ? true : after ? false : null };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function surcharged(amount: number): Record<Surcharge, number> {
  return {
    executive: round2(amount * (1 + SURCHARGE_RATE.executive)),
    reduced: round2(amount * (1 + SURCHARGE_RATE.reduced)),
    ordinary: round2(amount * (1 + SURCHARGE_RATE.ordinary)),
  };
}

/** Two years "de fecha a fecha" after the sanction became firm, with no other firm sanction with points (art. 65.1). */
export function pointsBack(firm: string): string {
  return plusMonths(firm, POINTS.recoveryYears * 12);
}

/* -------------------------------------------------------------------------- */
/* The calculation                                                            */
/* -------------------------------------------------------------------------- */

export function calculate(input: FineInput, cal: Calendar): FineResult {
  if (!isIsoDate(input.date)) return { status: "invalid", reason: "date" };
  if (!Number.isFinite(input.amount) || input.amount <= 0 || input.amount > MAX_AMOUNT) return { status: "invalid", reason: "amount" };
  if (input.points && input.severity === "leve") return { status: "invalid", reason: "leve-points" };
  const amount = round2(input.amount);
  const extra = surcharged(amount);

  if (input.stage === "resolucion") {
    return {
      status: "ok",
      stage: "resolucion",
      notified: input.date,
      reposicion: afterMonths(input.date, REPOSICION_MONTHS, cal),
      payFull: afterDays(input.date, FINAL_PAYMENT_DAYS, cal),
      surcharged: extra,
    };
  }
  if (input.stage === "apremio") {
    return { status: "ok", stage: "apremio", notified: input.date, due: apremioDue(input.date, cal), surcharged: extra };
  }

  const { notified, law } = notificationDay(input.channel, input.date);
  if (input.offence !== null && (!isIsoDate(input.offence) || input.offence > notified)) return { status: "invalid", reason: "offence" };
  const spot = input.channel === "spot";
  const discount = input.excluded ? null : afterDays(notified, DISCOUNT_DAYS, cal);
  const nothing = ifNothing(input.severity, input.points, spot);
  return {
    status: "ok",
    stage: "denuncia",
    notified,
    notifiedLaw: law,
    discount,
    discountLaw: law && !input.excluded ? afterDays(law, DISCOUNT_DAYS, cal) : null,
    reduced: input.excluded ? null : round2(amount * (1 - DISCOUNT_RATE)),
    alegaciones: afterDays(notified, DISCOUNT_DAYS, cal),
    identify: spot ? null : afterDays(notified, IDENTIFY_DAYS, cal),
    ifNothing: nothing,
    fullUntil: nothing === "resolution-follows" ? null : afterDays(notified, FULL_PAYMENT_DAYS, cal),
    surcharged: extra,
    pointsBackIfPaidOn: input.points && discount ? { paid: discount.nominal, back: pointsBack(discount.nominal) } : null,
    prescription: input.offence ? prescription(input.offence, notified, input.severity, input.points) : null,
  };
}

/** The calculation, for callers that know the input is valid (the page's examples). */
export function calculateOk<S extends Stage>(input: FineInput & { stage: S }, cal: Calendar): Extract<FineResult, { stage: S }> {
  const r = calculate(input, cal);
  if (r.status !== "ok") throw new Error(`traffic fines: invalid example (${r.reason})`);
  return r as Extract<FineResult, { stage: S }>;
}

/** A denuncia input with the defaults the page uses. */
export function fine(date: string, amount: number, over: Partial<FineInput> = {}): FineInput {
  return { stage: "denuncia", channel: "paper", date, amount, points: false, severity: "grave", excluded: false, offence: null, ...over };
}
