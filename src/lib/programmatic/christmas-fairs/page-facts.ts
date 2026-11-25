/**
 * What the Christmas fair pages' fact tables and FAQs read, joined to the
 * family's data (25 Nov 2026). The pages and their JSON-LD both call these,
 * so the structured data is the visible text. Server only, pure.
 */

import type { Block } from "@/lib/content/blocks";
import { faqSchema } from "@/lib/seo/jsonld";

import { FAIRS, SNAPSHOT, familyLastChecked, hasEnglish, linesFor, townByIne, townBySlug, towns, type Town } from "./data";
import { hubFaq, hubRow, townFaq, type FactsContext, type FaqItem, type HubRow } from "./facts";
import type { FairsLocale } from "./paths";

/**
 * The most searched fairs (Search Console, 28 days to 25 Nov 2026: the town
 * pages with most impressions and clicks, plus the towns with an English
 * page): the hub's fact table lists these towns' fairs. In English, only the
 * towns that have an English page.
 */
export const TOP_SLUGS: readonly string[] = ["barcelona", "girona", "vic", "tarragona", "olot", "canyelles", "espinelves", "caldes-de-montbui", "cardedeu"];
/** The towns the hub's FAQ answers one question each for (the four with an English page). */
export const FAQ_SLUGS: readonly string[] = ["barcelona", "girona", "vic", "tarragona"];

/** What the fact table and the FAQ read besides the fairs: the town's stations and the day the calendar was read. */
export function factsContextFor(town: Town): FactsContext {
  return { lines: linesFor(town), calendarReadOn: SNAPSHOT.readOn };
}

/** The town's FAQ (empty when fewer than two questions can be answered): shown on the page and carried by its FAQPage JSON-LD. */
export function townFaqFor(town: Town, locale: FairsLocale): FaqItem[] {
  return townFaq(town, factsContextFor(town), locale);
}

function topTowns(slugs: readonly string[], locale: FairsLocale): Town[] {
  return slugs.map((s) => townBySlug(s)).filter((t): t is Town => t !== null && (locale !== "en" || hasEnglish(t)));
}

/** One row per fair of the top towns, in date order. */
export function hubTopRows(locale: FairsLocale): HubRow[] {
  return topTowns(TOP_SLUGS, locale)
    .flatMap((town) => town.fairs.map((f) => hubRow(f, town.name, town.slug, locale)))
    .sort((a, b) => a.start.localeCompare(b.start) || a.name.localeCompare(b.name, locale));
}

/** The hub's FAQ (see `hubFaq`): empty when fewer than two questions can be answered. */
export function hubFaqItems(locale: FairsLocale): FaqItem[] {
  return hubFaq(
    FAIRS,
    towns().length,
    topTowns(FAQ_SLUGS, locale).map((town) => ({ town, ctx: factsContextFor(town) })),
    familyLastChecked(),
    locale,
    (f) => townByIne(f.ine)?.name ?? "",
  );
}

/** FAQPage JSON-LD from the same items the page shows (null when the page has no FAQ). */
export function faqNode(items: readonly FaqItem[]) {
  return items.length > 0 ? faqSchema([{ type: "faq", items: [...items] } as Block]) : null;
}
