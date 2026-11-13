/**
 * Geometry of the server-rendered SVG bar chart (one bar per hour). Pure.
 * Bars start at the zero line; a negative price (possible in principle, never
 * seen in the PVPC) would hang below it.
 */

import type { HourView, Period } from "./periods";
import { perKwh } from "./periods";

export const CHART = { width: 600, height: 250, left: 44, right: 8, top: 26, bottom: 30, gap: 2, radius: 4 } as const;

export interface Bar {
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
  period: Period;
  /** €/kWh, REE's figure / 1000. */
  value: number;
  /** SVG path with rounded data end. */
  d: string;
}

export interface ChartGeometry {
  bars: Bar[];
  /** y of the zero line. */
  zero: number;
  ticks: { value: number; y: number }[];
  /** Decimals the tick labels need (3 for a 0.025 step). */
  tickDecimals: number;
  /** Hours that get an x-axis label (every third). */
  xLabels: { index: number; x: number; text: string }[];
}

/** A round step so that about five gridlines cover `max`. */
export function niceStep(max: number): number {
  const raw = max / 5;
  const pow = 10 ** Math.floor(Math.log10(raw));
  for (const m of [1, 2, 2.5, 5, 10]) if (raw <= m * pow) return m * pow;
  return 10 * pow;
}

function barPath(x: number, top: number, w: number, bottom: number, r: number): string {
  const h = bottom - top;
  if (h <= 0) return `M${x},${bottom}h${w}`;
  const rr = Math.min(r, w / 2, h);
  return `M${x},${bottom}V${top + rr}Q${x},${top} ${x + rr},${top}H${x + w - rr}Q${x + w},${top} ${x + w},${top + rr}V${bottom}Z`;
}

const round = (n: number) => Math.round(n * 100) / 100;

export function chartGeometry(hours: readonly HourView[]): ChartGeometry {
  const values = hours.map((h) => perKwh(h.price));
  const max = Math.max(0, ...values);
  const min = Math.min(0, ...values);
  const step = niceStep(max > 0 ? max : 0.1);
  const top = Math.ceil(max / step) * step || step;
  const bottomValue = min < 0 ? -Math.ceil(-min / step) * step : 0;
  const plotH = CHART.height - CHART.top - CHART.bottom;
  const plotW = CHART.width - CHART.left - CHART.right;
  const y = (v: number) => round(CHART.top + ((top - v) / (top - bottomValue)) * plotH);
  const zero = y(0);
  const slot = plotW / Math.max(1, hours.length);
  const w = round(Math.max(1, slot - CHART.gap));
  const bars = hours.map((h, i) => {
    const x = round(CHART.left + i * slot + CHART.gap / 2);
    const value = values[i]!;
    const yv = y(value);
    const [barTop, barBottom] = value >= 0 ? [yv, zero] : [zero, yv];
    return { index: h.index, x, y: barTop, w, h: round(barBottom - barTop), period: h.period, value, d: value >= 0 ? barPath(x, barTop, w, barBottom, CHART.radius) : `M${x},${barTop}H${x + w}V${barBottom}H${x}Z` };
  });
  const ticks: ChartGeometry["ticks"] = [];
  for (let v = bottomValue; v <= top + step / 1000; v += step) ticks.push({ value: round(v * 10_000) / 10_000, y: y(v) });
  const xLabels = hours.filter((_, i) => i % 3 === 0).map((h) => ({ index: h.index, x: round(CHART.left + h.index * slot + slot / 2), text: h.label.from.slice(0, 2) }));
  const tickDecimals = Math.abs(step * 100 - Math.round(step * 100)) > 1e-9 ? 3 : 2;
  return { bars, zero, ticks, tickDecimals, xLabels };
}
