import { calcPath, calculatorSlugs } from "@/lib/programmatic/calculators/paths";
import { caOfMonth, elDay, monthText, num, pct } from "@/lib/programmatic/rent-update/copy";
import type { DateLocale } from "@/lib/programmatic/holidays/format";

/**
 * Paths and number words of "IPC hoy: último dato y calendario del INE":
 *
 *   /es/calculadoras/ipc/
 *   /ca/calculadores/ipc/
 *   /en/calculators/spain-inflation-cpi/
 *
 * Slugs from the calculators registry (hub group "official").
 */

export type IpcLocale = DateLocale;
export const IPC_LOCALES: readonly IpcLocale[] = ["es", "ca", "en"];

export const IPC_SLUG: Record<IpcLocale, string> = calculatorSlugs("ipc");

export function ipcPath(locale: IpcLocale): string {
  return calcPath("ipc", locale);
}

export function ipcEditions(): Record<IpcLocale, string> {
  return { es: ipcPath("es"), ca: ipcPath("ca"), en: ipcPath("en") };
}

export { caOfMonth, elDay, monthText, num, pct };

/** "4,9 %", "−0,3 %", one decimal as the INE prints the CPI. */
export function rate(n: number | null, locale: IpcLocale): string {
  return n === null ? "—" : pct(n, 1, locale);
}

/** "+0,6 %" for a monthly change (sign always shown). */
export function signedRate(n: number | null, locale: IpcLocale): string {
  if (n === null) return "—";
  return n > 0 ? `+${pct(n, 1, locale)}` : pct(n, 1, locale);
}

/** The bare day: "13 de noviembre de 2026" / "13 November 2026". */
export function bareDay(iso: string, locale: IpcLocale): string {
  return elDay(iso, locale).replace(/^(el |l'|la |on )/, "");
}
