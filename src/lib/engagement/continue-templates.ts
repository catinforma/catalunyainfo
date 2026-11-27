import { b2href } from "@/lib/content/batch02/shared";
import type { Locale } from "@/lib/i18n/config";
import { DATE_PAGES, datePath, hubPath as holidaysHubPath, municipalityPath, sameDayIn2026, sameDayIn2027, type DatePage } from "@/lib/programmatic/holidays/paths";
import { GUIDES, withHolidayHub, type GuideKey } from "@/lib/programmatic/holidays/links";
import { dateContent } from "@/lib/programmatic/holidays/dates";
import { hasDayPage } from "@/lib/programmatic/spain-2027/days";
import { spainDayPath } from "@/lib/programmatic/spain-2027/paths";

import { dateCalculatorLine } from "./calculator-line";
import { continueReading, itemPaths, type ContinueReading, type OnwardScope } from "./continue-reading";
import { dateElectionLine } from "./election-line";
import { holidayDateNextStep } from "./next-step";
import type { NextStep, NextStepLink } from "./next-step-core";
import type { TownHub } from "./town-hub";

/**
 * The 8S "Continua llegint" chooser (continue-reading.ts) on the big
 * programmatic templates (27 Nov 2026, batch 8U): the holiday date pages, the
 * holiday town pages (ca/es and the English selection), the Christmas fair
 * town pages, the election town pages and, inside their related-calculators
 * box, the calculators.
 *
 * Why only the seasonal link here: on each of these templates every topical
 * candidate the chooser has (the December bridge, the shops guide, the date
 * pages, the town's other pages, the election guides, the related tools) is
 * already linked by a box of the page (the next useful step, the election
 * line, the calculator line, the guides list, the "other dates" list, the
 * town hub, the election guides list, the related calculators:
 * continue-calculators.ts). What none of
 * them has is the page for the days ahead (the Christmas calendar, the
 * Christmas lottery, New Year's Eve, Reis, then 2027), so the box is the one
 * seasonal link, chosen by the same `continueReading` with no topical family:
 * never the page itself, never a path in `exclude`, same language only.
 *
 * `exclude` is every path the template's other onward boxes and inline
 * sentences link; each template's collector below reads the same functions
 * the template renders with (a test holds them to the template).
 */

/** The one seasonal link for a template page, or null when every candidate is already on it. */
export function seasonalOnward(input: { self: string; locale: Locale; scope: OnwardScope; exclude: readonly string[]; today: string }): ContinueReading | null {
  const box = continueReading({
    entry: { href: input.self, locale: input.locale },
    stored: [],
    exclude: input.exclude,
    family: { links: [], scope: input.scope },
    today: input.today,
  });
  return box?.seasonal ? { topical: [], seasonal: box.seasonal, rest: [] } : null;
}

const hrefs = (links: readonly { href: string }[] | null | undefined): string[] => (links ?? []).map((link) => link.href);
const stepHrefs = (step: NextStep | null | undefined): string[] => hrefs(step?.links);
/** The town hub's links and their jump links. */
export const townHubHrefs = (hub: TownHub | null): string[] => (hub?.links ?? []).flatMap((link) => [link.href, ...hrefs(link.more)]);
const guideHrefs = (keys: readonly GuideKey[], locale: Locale): string[] => withHolidayHub(keys).map((key) => GUIDES[key][locale]);

/* -------------------------------------------------------------------------- */
/* Holiday date pages (/ca/festius/dia/…, /es/festivos/dia/…, /en/…)           */
/* -------------------------------------------------------------------------- */

/**
 * Every path a date page links (components/programmatic/holidays/DatePage.tsx):
 * the next useful step, the election line, the calculator line, the notices,
 * the rest-of-Spain and same-day lines, the guides list, the other dates and
 * the hub. `now` is the election line's clock (the page passes none).
 */
export function dateOnwardExclude(iso: DatePage, locale: Locale, today: string, now?: Date): string[] {
  const self = datePath(locale, iso);
  const content = dateContent(iso, locale);
  const step = holidayDateNextStep(iso, locale, self, today);
  const twin2026 = sameDayIn2026(iso);
  const twin2027 = sameDayIn2027(iso);
  return [
    ...stepHrefs(step),
    ...hrefs(dateElectionLine(iso, locale, now)?.links),
    ...hrefs(dateCalculatorLine(locale, step, today)?.links),
    ...(content.notice ? [content.notice.href] : []),
    ...(content.transportNotice ? [content.transportNotice.href] : []),
    ...(content.restOfSpain ? [content.restOfSpain.href] : []),
    ...(hasDayPage(iso) ? [spainDayPath(iso, locale)] : []),
    ...(twin2026 ? [datePath(locale, twin2026)] : []),
    ...(twin2027 ? [datePath(locale, twin2027)] : []),
    ...guideHrefs(content.guides, locale),
    ...DATE_PAGES.map((d) => datePath(locale, d)),
    holidaysHubPath(locale),
  ];
}

export function dateOnward(iso: DatePage, locale: Locale, today: string, now?: Date): ContinueReading | null {
  return seasonalOnward({ self: datePath(locale, iso), locale, scope: "catalonia", exclude: dateOnwardExclude(iso, locale, today, now), today });
}

/* -------------------------------------------------------------------------- */
/* Holiday town pages (/ca/festius/<town>/, /es/festivos/<town>/, /en/…)       */
/* -------------------------------------------------------------------------- */

/** The guides list of a ca/es town page (MunicipalityPage renders this list). */
export function townGuideKeys(slug: string): GuideKey[] {
  return ["holidayToday", "workCalendar", "localHolidays", "shops", "school", "decemberBridge", ...(slug === "barcelona" ? (["metroHours"] as const) : [])];
}

/**
 * Every guide or date path a town page links besides its town lists: the next
 * useful step, the town hub, the guides list, the in-body guide links (shops,
 * school, school free days, the 2027 work calendar, strikes and metro on the
 * English page), the FAQ links, the upcoming dates and the 2027 date line.
 */
export function townOnwardExclude(input: {
  slug: string;
  locale: Locale;
  step: NextStep | null;
  hub: TownHub | null;
  guides: readonly GuideKey[];
  faqLinks?: readonly (string | undefined)[];
  datePages?: readonly string[];
}): string[] {
  const { locale } = input;
  return [
    ...stepHrefs(input.step),
    ...townHubHrefs(input.hub),
    ...guideHrefs(input.guides, locale),
    GUIDES.shops[locale],
    GUIDES.school[locale],
    GUIDES.workCalendar[locale],
    GUIDES.strikes[locale],
    GUIDES.metroHours[locale],
    b2href("schoolFreeDays", locale),
    ...(input.faqLinks ?? []).filter((href): href is string => Boolean(href)),
    ...(input.datePages ?? DATE_PAGES).map((d) => datePath(locale, d)),
    holidaysHubPath(locale),
  ];
}

export function townOnward(input: Parameters<typeof townOnwardExclude>[0] & { today: string }): ContinueReading | null {
  return seasonalOnward({ self: municipalityPath(input.locale, input.slug), locale: input.locale, scope: "catalonia", exclude: townOnwardExclude(input), today: input.today });
}

/* -------------------------------------------------------------------------- */
/* Christmas fair town pages and election town pages                          */
/* -------------------------------------------------------------------------- */

/**
 * A per-town page of another family: its next useful step, "keep it" block,
 * town hub, guides list and every internal path its Markdown sentences link
 * (the trains, holidays and weekend lines of a fair page; the election-day
 * block and the model's sections of an election page).
 */
export function townFamilyOnward(input: {
  self: string;
  locale: Locale;
  today: string;
  steps: readonly (NextStep | { links: readonly NextStepLink[] } | null | undefined)[];
  hub: TownHub | null;
  links: readonly (NextStepLink | { href: string })[];
  markdown: readonly string[];
}): ContinueReading | null {
  const exclude = [
    ...input.steps.flatMap((step) => hrefs(step?.links)),
    ...townHubHrefs(input.hub),
    ...hrefs(input.links),
    ...input.markdown.flatMap(itemPaths),
  ];
  return seasonalOnward({ self: input.self, locale: input.locale, scope: "catalonia", exclude, today: input.today });
}

/**
 * Every internal path a page model holds: its Markdown links and its `href`
 * fields, wherever they sit (the election page model and its election-day
 * block, whose sections the page prints whole).
 */
export function pathsIn(value: unknown): string[] {
  const json = JSON.stringify(value ?? null);
  const hrefFields = [...json.matchAll(/"href":"(\/[^"]*)"/g)].map((m) => m[1]!);
  return [...itemPaths(json), ...hrefFields];
}
