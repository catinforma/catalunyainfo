/**
 * Event markup for the fairs a town page lists, in the same form as the
 * weekend family's (`townEventSchema`: name, dates, municipality, and the
 * organiser's own page when there is one). Each fair is marked up once, on its
 * town's page, never on the hub, so one event is never described by two URLs.
 * Fairs whose dates are still "to be confirmed" are left out, and a council
 * homepage that stands in for a dead organiser website is not given as the
 * event's URL.
 */

import { townEventSchema } from "@/lib/seo/jsonld";
import { municipality } from "@/lib/programmatic/weekend/data";

import { townName } from "./copy";
import type { FairsLocale } from "./paths";
import type { Fair } from "./types";

const PROVINCE: Record<string, string> = { "08": "Barcelona", "17": "Girona", "25": "Lleida", "43": "Tarragona" };

export function christmasFairEvents(fairs: readonly Fair[], path: string, locale: FairsLocale) {
  return fairs
    .filter((f) => !f.toConfirm && /^\d{4}-\d{2}-\d{2}$/.test(f.start) && /^\d{4}-\d{2}-\d{2}$/.test(f.end))
    .flatMap((f) => {
      const m = municipality(f.ine);
      if (!m) return [];
      return [
        townEventSchema({
          path,
          id: f.id.replace(/[^a-z0-9-]+/gi, "-"),
          name: f.name,
          startDate: f.start,
          endDate: f.end,
          town: townName(m.name, locale),
          region: PROVINCE[m.province] ?? "Catalunya",
          url: f.webReplaced ? null : f.web,
        }),
      ];
    });
}
