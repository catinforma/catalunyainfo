import type { MetadataRoute } from "next";

import { BOE_2026_ROWS, REGION_WIDE_LOCAL } from "@/lib/programmatic/holidays/boe-2026";
import { BOE_2027_ROWS, REGIONS, type BoeRow, type Region } from "@/lib/programmatic/holidays/boe-2027";
import { councilApproved2027, isAran, municipalityBySlug, nextYearFor, nextYearPublished, regionalDays } from "@/lib/programmatic/holidays/data";
import { CATALONIA_ID } from "@/lib/programmatic/leave-2027/copy";
import { plannerData } from "@/lib/programmatic/leave-2027/places";
import { communityDays } from "@/lib/programmatic/spain-2027/calendar";
import { CITIES, cityCalendar, type City } from "@/lib/programmatic/spain-2027/cities";
import { COMMUNITIES } from "@/lib/programmatic/spain-2027/communities";
import { editionHubPath } from "@/lib/programmatic/spain-2027/editions";
import { spainHubPath } from "@/lib/programmatic/spain-2027/paths";
import { SOURCES } from "@/lib/programmatic/spain-2027/sources";
import { absoluteUrl } from "@/lib/site";

import { NATIONAL_ID, WD_LOCALES, packDates, workingDaysEditions, type WdData, type WdGroup, type WdItem, type WdLocale } from "./copy";
import { CANARIAS_ISLAND_DAYS_2026 } from "./rules";

/**
 * The places the working-days calculator offers and the holidays it counts
 * for each, 2026 and 2027, read from the modules the holiday pages use.
 * Nothing here states a date of its own; only what the site gives as
 * confirmed counts:
 *
 *  - all of Spain: the days the BOE's lists mark for every community
 *    (BOE-A-2025-21667 for 2026, BOE-A-2026-21254 for 2027);
 *  - a community: its column of those lists; Navarra adds the local day the
 *    whole community shares (3 December, both years); Ceuta and Melilla, one
 *    municipality each, their 2027 local days;
 *  - Catalonia: Ordre EMT/66/2025 and EMT/52/2026 (`regionalDays`, the Aran
 *    swap in Aran); a town adds its 2026 local days (DOGC order, snapshot)
 *    and its 2027 ones once the DOGC order is parsed (`nextYearFor`). The
 *    days a council has approved but the DOGC has not published are NOT
 *    counted (flag "c": the page says so);
 *  - a Spanish city with a page: its 2027 calendar as the city page gives it
 *    (`cityCalendar`: island day, Navarra's common day, local days once the
 *    bulletin lists them) and, for 2026, its local days where the data holds
 *    them (`local2026`), the island day of Canarias (BOE-A-2025-23702, note 1)
 *    and Navarra's 3 December.
 *
 * The item order, labels and pages are the leave planner's (`plannerData`),
 * so a place reads the same on both tools.
 */

const BOE_ROWS: Record<2026 | 2027, readonly BoeRow[]> = { 2026: BOE_2026_ROWS, 2027: BOE_2027_ROWS };

/** The dates of a year's BOE list marked for every community and city: holidays all over Spain. */
export function nationalDates(year: 2026 | 2027): string[] {
  const rows = BOE_ROWS[year];
  const dates = [...new Set(rows.map((r) => r.date))];
  return dates.filter((d) => REGIONS.every((reg) => rows.some((r) => r.date === d && r.marks[reg]))).sort();
}

/** A community's 2026 column of the BOE list (Catalonia reads the DOGC order instead). */
export function region2026(region: Region): string[] {
  return [...new Set(BOE_2026_ROWS.filter((r) => r.marks[region]).map((r) => r.date))].sort();
}

function region2027(region: Region): string[] {
  return communityDays(region).map((d) => d.date);
}

/** Local days fixed for a whole community: Navarra's 3 December (2026 and 2027), Ceuta's and Melilla's (2027). */
export function regionLocal(region: Region): { y2026: string[]; y2027: string[] } {
  const y2026 = REGION_WIDE_LOCAL.filter((d) => d.region === region).map((d) => d.date);
  const local = SOURCES[region].local;
  const y2027 = local.status === "published" || local.daysScope === "common" ? (local.days ?? []).map((d) => d.date).filter((d) => d.startsWith("2027-")) : [];
  return { y2026, y2027 };
}

/** A Spanish city: the days it adds to its community's column, each year, and what they include. */
export function cityExtra(c: City): { dates: string[]; local2026: boolean; local2027: boolean; island: boolean } {
  const base27 = new Set(region2027(c.region));
  const y2027 = cityCalendar(c)
    .map((d) => d.date)
    .filter((d) => !base27.has(d));
  const island26 = c.island ? (CANARIAS_ISLAND_DAYS_2026[c.island] ?? null) : null;
  if (c.island && !island26) throw new Error(`working days: no 2026 island day for ${c.island}`);
  const y2026 = [...(c.local2026?.days.map((d) => d.date) ?? []), ...(island26 ? [island26] : []), ...regionLocal(c.region).y2026];
  return { dates: [...new Set([...y2026, ...y2027])].sort(), local2026: Boolean(c.local2026?.days.length), local2027: c.status2027 === "published", island: Boolean(c.island) };
}

const NATIONAL_LABEL: Record<WdLocale, { group: string; item: string }> = {
  es: { group: "España", item: "Toda España (solo fiestas nacionales)" },
  ca: { group: "Espanya", item: "Tot Espanya (només festes nacionals)" },
  en: { group: "Spain", item: "All of Spain (national holidays only)" },
};

/** Every place of the picker, with its 2026 and 2027 holidays packed for the browser. */
export function workingDaysData(locale: WdLocale): WdData {
  const planner = plannerData(locale);
  const spainRegions: Region[] = COMMUNITIES.map((c) => c.region).filter((r) => r !== "CT");
  const bases = [
    packDates([...nationalDates(2026), ...nationalDates(2027)]),
    packDates([...regionalDays(2026).map((d) => d.date), ...regionalDays(2027).map((d) => d.date)]),
    packDates([...regionalDays(2026, true).map((d) => d.date), ...regionalDays(2027, true).map((d) => d.date)]),
    ...spainRegions.map((r) => packDates([...region2026(r), ...region2027(r)])),
  ];
  const baseOf = (r: Region) => 3 + spainRegions.indexOf(r);
  const dogc = nextYearPublished();

  const groups: WdGroup[] = [
    { label: NATIONAL_LABEL[locale].group, items: [[NATIONAL_ID, NATIONAL_LABEL[locale].item, locale === "es" ? spainHubPath() : editionHubPath(locale), 0, "", "e00"]] },
  ];
  for (const g of planner.groups) {
    const items: WdItem[] = g.items.map(([value, label, page]) => {
      if (value === CATALONIA_ID) return [value, label, page, 1, "", "r00"];
      if (value.endsWith("/all")) {
        const c = COMMUNITIES.find((x) => `${x.slug}/all` === value)!;
        const loc = regionLocal(c.region);
        return [value, label, page, baseOf(c.region), packDates([...loc.y2026, ...loc.y2027]), `r${loc.y2026.length ? 1 : 0}${loc.y2027.length ? 1 : 0}`];
      }
      if (value.includes("/")) {
        const [communitySlug, citySlug] = value.split("/");
        const city = CITIES.find((x) => x.slug === citySlug && COMMUNITIES.find((c) => c.region === x.region)?.slug === communitySlug)!;
        const e = cityExtra(city);
        return [value, label, page, baseOf(city.region), packDates(e.dates), `c${e.local2026 ? 1 : 0}${e.local2027 ? 1 : 0}${e.island ? "i" : ""}`];
      }
      const m = municipalityBySlug(value)!;
      const next = dogc ? (nextYearFor(m.slug)?.local ?? []) : [];
      const council = councilApproved2027(m.slug) ? "p" : "";
      return [value, label, page, isAran(m) ? 2 : 1, packDates([...m.local, ...next]), `t${m.local.length ? 1 : 0}${next.length ? 1 : 0}${council}`];
    });
    groups.push({ label: g.label, items });
  }
  return { townPrefix: planner.townPrefix, bases, groups };
}

/** When the page's words last changed (the data has its own dates). */
export const WD_PAGE_AS_OF = "2026-11-13";

export function workingDaysSitemapEntries(lastModified: string = WD_PAGE_AS_OF): MetadataRoute.Sitemap {
  const e = workingDaysEditions();
  const languages = { es: absoluteUrl(e.es), ca: absoluteUrl(e.ca), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
  return WD_LOCALES.map((locale) => ({
    url: absoluteUrl(e[locale]),
    lastModified: new Date(`${lastModified}T00:00:00Z`),
    changeFrequency: "weekly" as const,
    priority: locale === "es" ? 0.8 : 0.6,
    alternates: { languages },
  }));
}
