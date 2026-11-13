import { itemHolidays, itemInfo, packDates } from "@/lib/programmatic/working-days/copy";
import { workingDaysData } from "@/lib/programmatic/working-days/places";

import type { PlLocale, PlPlace } from "./copy";

/**
 * The places of the paid-leave calculator's working-day count: all of Spain
 * and each community as a whole (national and regional holidays of 2026 and
 * 2027, from the working-days calculator's data: BOE, DOGC and each region's
 * bulletin). Towns are left out on purpose, to keep the page light; the page
 * says local holidays are not counted and links the working-days calculator.
 * Server-only (it reads the holiday modules).
 */
export function paidLeavePlaces(locale: PlLocale): PlPlace[] {
  const data = workingDaysData(locale);
  const out: PlPlace[] = [];
  for (const [gi, g] of data.groups.entries()) {
    for (const item of g.items) {
      const kind = itemInfo(item).kind;
      if (kind !== "e" && kind !== "r") continue;
      // The national item keeps its own label; a community item is named by its group ("Madrid", "Cataluña").
      const label = gi === 0 ? item[1] : g.label;
      out.push([item[0], label, packDates(itemHolidays(data, item))]);
    }
  }
  return out;
}
