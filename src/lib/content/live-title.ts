import type { Body } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";
import { liveReservoirTitle, loadReservoirs } from "@/lib/content/reservoirs/levels";
import { weekendWindow, type WeekendWindow } from "@/lib/content/weekend/agenda";
import { EVERGREEN } from "@/lib/content/weekend/evergreen";

/**
 * A page title computed at render time, for pages whose answer is a live
 * figure or a date. Null means "use the stored seoTitle".
 *
 * Both cases are pages the nightly cron already revalidates (their blocks are
 * in DAY_DEPENDENT_BLOCKS), so the title changes exactly when the content
 * does and costs no extra ISR write. The reservoir fetch is the same one the
 * block makes in the same render, which Next memoises.
 */
export async function liveEntryTitle(body: Body, locale: Locale): Promise<string | null> {
  if (body.some((block) => block.type === "reservoirLevels")) {
    return liveReservoirTitle(locale, await loadReservoirs());
  }
  if (body.some((block) => block.type === "weekendAgenda")) {
    return weekendTitle(locale, weekendWindow());
  }
  return null;
}

const SHORT_MONTHS: Record<Locale, string[]> = {
  ca: ["gen", "febr", "març", "abr", "maig", "juny", "jul", "ag", "set", "oct", "nov", "des"],
  es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

/**
 * "Què fer aquest cap de setmana a Catalunya (30 oct–1 nov)".
 *
 * The pages that rank for the weekend queries put the dates in the title
 * (research_notes/x10, A14), and the one failure this page exists to avoid is
 * a title naming a weekend that is over: the window comes from the same
 * function the agenda block uses, on the same render.
 */
export function weekendTitle(locale: Locale, window: WeekendWindow): string {
  const day = (iso: string) => Number(iso.slice(8, 10));
  const month = (iso: string) => SHORT_MONTHS[locale][Number(iso.slice(5, 7)) - 1] ?? "";
  const range =
    month(window.from) === month(window.to)
      ? `${day(window.from)}–${day(window.to)} ${month(window.to)}`
      : `${day(window.from)} ${month(window.from)}–${day(window.to)} ${month(window.to)}`;
  return `${EVERGREEN[locale].seoTitle} (${range})`;
}
