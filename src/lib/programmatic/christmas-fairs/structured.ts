/**
 * Event markup for the fairs a town page lists, in the same form as the
 * weekend family's (`townEventSchema`: name, dates, municipality, and the
 * organiser's own page when there is one). Each fair is marked up once, on its
 * town's page, never on the hub, so one event is never described by two URLs.
 * Fairs whose dates are still "to be confirmed" are left out, and a council
 * homepage that stands in for a dead organiser website is not given as the
 * event's URL.
 */

import { townEventSchema, townPlaceId } from "@/lib/seo/jsonld";
import { municipality } from "@/lib/programmatic/weekend/data";

import { townName } from "./copy";
import type { FairsLocale } from "./paths";
import type { Fair } from "./types";

const PROVINCE: Record<string, string> = { "08": "Barcelona", "17": "Girona", "25": "Lleida", "43": "Tarragona" };

/**
 * "2026-11-21" + "09:00" -> "2026-11-21T09:00:00+01:00". The season (November
 * to mid-January) is all winter time in Catalonia, so the offset is always
 * +01:00 (tests/christmas-fairs.test.ts checks every fair given times falls in it).
 */
export function winterDateTime(date: string, time: string): string {
  return `${date}T${time}:00+01:00`;
}

/** `image`: the crops of a photograph of the fair itself (place-photos.ts `fairEventImages`), when there is one. */
export function christmasFairEvents(fairs: readonly Fair[], path: string, locale: FairsLocale, image?: string[]) {
  return fairs
    .filter((f) => !f.toConfirm && /^\d{4}-\d{2}-\d{2}$/.test(f.start) && /^\d{4}-\d{2}-\d{2}$/.test(f.end))
    .flatMap((f) => {
      const m = municipality(f.ine);
      if (!m) return [];
      // With the organiser's programme read (organisers.ts `details`): the day's opening and closing
      // times, its own one-line summary and the organiser's page.
      const d = f.details;
      return [
        townEventSchema({
          path,
          id: f.id.replace(/[^a-z0-9-]+/gi, "-"),
          name: f.name,
          startDate: d?.times ? winterDateTime(f.start, d.times.opens) : f.start,
          endDate: d?.times ? winterDateTime(f.end, d.times.closes) : f.end,
          ...(d?.snippet ? { description: d.snippet[locale] } : {}),
          // Only an organiser its own pages name (a listing such as the Guia BCN is not the organiser).
          ...(d?.organizer ? { organizer: d.organizer } : {}),
          town: townName(m.name, locale),
          region: PROVINCE[m.province] ?? "Catalunya",
          // With details read, the organiser's own page for this edition rather than the calendar's website.
          url: d?.organizer?.url ?? (d && f.checked ? f.checked.url : f.webReplaced ? null : f.web),
          // The same Place as the town's holiday and election pages (INE code).
          placeId: townPlaceId(f.ine),
          ...(image ? { image } : {}),
        }),
      ];
    });
}
