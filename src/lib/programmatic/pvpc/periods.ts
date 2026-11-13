/**
 * The three time periods of the 2.0TD toll (punta, llano, valle) and the
 * day's figures the pages print. Pure: no clock, no network.
 *
 * Periods: CNMC Circular 3/2020, art. 7.3 (BOE-A-2020-1066, consolidated
 * text read 13 Nov 2026). Monday to Friday:
 *   Península, Illes Balears, Canarias  P1 punta 10–14 h and 18–22 h;
 *                                       P2 llano 8–10 h, 14–18 h, 22–24 h;
 *                                       P3 valle 0–8 h.
 *   Ceuta, Melilla                      P1 punta 11–15 h and 19–23 h;
 *                                       P2 llano 8–11 h, 15–19 h, 23–24 h;
 *                                       P3 valle 0–8 h.
 * "Se consideran como horas del periodo 3 (valle) todas las horas de los
 * sábados, domingos, el 6 de enero y los días festivos de ámbito nacional,
 * definidos como tales en el calendario oficial del año correspondiente, con
 * exclusión tanto de los festivos sustituibles como de los que no tienen
 * fecha fija." Hours are the local wall clock of each system.
 *
 * The e·sios file of 13 Nov 2026 (tests/fixtures/pvpc) confirms the shift:
 * its PCB and CYM columns differ exactly at 10, 14, 18 and 22 h.
 */

import type { PvpcDay } from "./parse";
import { hourLabels, weekday, type HourLabel } from "./time";

export type Period = "punta" | "llano" | "valle";
export type TariffSystem = "pcb" | "cym";

/**
 * National holidays with a fixed date that no community may substitute
 * (RD 2001/1983 art. 45), plus 6 January, which the Circular names: valle all
 * day. Good Friday has no fixed date and is left out, as the Circular says.
 */
export const NATIONAL_VALLE_DAYS = ["01-01", "01-06", "05-01", "08-15", "10-12", "11-01", "12-06", "12-08", "12-25"] as const;

export function isValleDay(date: string): boolean {
  const wd = weekday(date);
  return wd === 0 || wd === 6 || (NATIONAL_VALLE_DAYS as readonly string[]).includes(date.slice(5));
}

/** The 2.0TD period of the hour that starts at wall-clock `hour` on `date`. */
export function periodOf(date: string, hour: number, system: TariffSystem = "pcb"): Period {
  if (isValleDay(date) || hour < 8) return "valle";
  const shift = system === "cym" ? 1 : 0;
  const punta = (hour >= 10 + shift && hour < 14 + shift) || (hour >= 18 + shift && hour < 22 + shift);
  return punta ? "punta" : "llano";
}

export interface HourView {
  index: number;
  label: HourLabel;
  /** €/MWh, as REE publishes it. */
  price: number;
  period: Period;
  cym?: number;
  cymPeriod?: Period;
}

/** The day's hours with their labels and periods. */
export function hoursOf(day: PvpcDay): HourView[] {
  const labels = hourLabels(day.hours.map((h) => Date.parse(h.start)));
  return day.hours.map((h, index) => {
    const label = labels[index]!;
    const view: HourView = { index, label, price: h.price, period: periodOf(day.date, label.hour, "pcb") };
    if (h.cym !== undefined) {
      view.cym = h.cym;
      view.cymPeriod = periodOf(day.date, label.hour, "cym");
    }
    return view;
  });
}

export interface DaySummary {
  date: string;
  hours: HourView[];
  cheapest: HourView;
  dearest: HourView;
  /** Arithmetic mean of the day's hourly prices, €/MWh (23, 24 or 25 hours). */
  average: number;
  /** The three cheapest and the three dearest hours, cheapest / dearest first; ties go to the earlier hour. */
  cheapest3: HourView[];
  dearest3: HourView[];
  /** Mean of each period's hours, when the day has any (weekends and national holidays are all valle). */
  periodAverage: Partial<Record<Period, number>>;
}

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Summary of a complete day: by the peninsular price (PCB) or, when the day carries it, the Ceuta/Melilla one. */
export function summarize(day: PvpcDay, system: TariffSystem = "pcb"): DaySummary | null {
  const hours = hoursOf(day);
  const priceOf = (h: HourView) => (system === "cym" ? h.cym : h.price);
  const periodOfHour = (h: HourView) => (system === "cym" ? h.cymPeriod : h.period);
  if (hours.length === 0 || hours.some((h) => priceOf(h) === undefined)) return null;
  const v = (h: HourView) => priceOf(h)!;
  const asc = [...hours].sort((a, b) => v(a) - v(b) || a.index - b.index);
  const desc = [...hours].sort((a, b) => v(b) - v(a) || a.index - b.index);
  const periodAverage: DaySummary["periodAverage"] = {};
  for (const p of ["punta", "llano", "valle"] as const) {
    const list = hours.filter((h) => periodOfHour(h) === p).map(v);
    if (list.length > 0) periodAverage[p] = mean(list);
  }
  return {
    date: day.date,
    hours,
    cheapest: asc[0]!,
    dearest: desc[0]!,
    average: mean(hours.map(v)),
    cheapest3: asc.slice(0, 3),
    dearest3: desc.slice(0, 3),
    periodAverage,
  };
}

/** €/MWh → €/kWh, the unit on a bill. */
export function perKwh(eurMwh: number): number {
  return eurMwh / 1000;
}
