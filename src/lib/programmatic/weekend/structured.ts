/**
 * Event markup for the fairs the weekend pages list in their HTML.
 *
 * Only the fairs of the official calendar (Generalitat, Departament d'Empresa
 * i Treball, `vm32-przc`) are marked up: they are rendered by the server with
 * their name, municipality and dates, which is what Google requires of an
 * Event (name, startDate, location with an address). Fairs whose dates the
 * calendar flags "to be confirmed" are left out, because EventScheduled would
 * then claim more than the source does. The agenda activities are fetched in
 * the browser after load, so no markup describes them.
 */

import type { Block } from "@/lib/content/blocks";
import { faqSchema, townEventSchema } from "@/lib/seo/jsonld";
import { esName } from "@/lib/programmatic/holidays/names";

import type { ProvinceCode, SnapshotFair } from "./types";
import type { WeekendLocale } from "./zones";

const PROVINCE: Record<ProvinceCode, string> = { "08": "Barcelona", "17": "Girona", "25": "Lleida", "43": "Tarragona" };

/** Every fair the page lists (this weekend's and the next ones), as `listedFairs` returns them. */
export function fairEvents(listed: { now: readonly SnapshotFair[]; next: readonly SnapshotFair[] }, path: string, locale: WeekendLocale) {
  const seen = new Set<string>();
  return [...listed.now, ...listed.next]
    .filter((f) => {
      if (seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    })
    .filter((f) => !f.toConfirm && /^\d{4}-\d{2}-\d{2}$/.test(f.start) && /^\d{4}-\d{2}-\d{2}$/.test(f.end))
    .map((f) =>
      townEventSchema({
        path,
        id: f.id,
        name: f.name,
        startDate: f.start,
        endDate: f.end,
        town: locale === "es" ? esName(f.town) : f.town,
        region: PROVINCE[f.province],
        url: f.web,
      }),
    );
}

/**
 * FAQPage JSON-LD from the same items the page shows in its visible FAQ
 * (`facts.ts`); null when the page has none. One per page.
 */
export function weekendFaqNode(items: readonly { question: string; answer: string }[]) {
  return items.length > 0 ? faqSchema([{ type: "faq", items: [...items] } as Block]) : null;
}
