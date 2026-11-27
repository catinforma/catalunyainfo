import { calendarHubLink } from "@/lib/content/batch02/christmas-season-links";
import { GROSSA_DRAW_DATE } from "@/lib/content/batch02/grossa";
import { NADAL_DRAW_DATE } from "@/lib/content/batch02/loteria-nadal";
import { POSTAL_29N } from "@/lib/content/batch02/postal-vote";
import { REIS_DAY } from "@/lib/content/batch02/reis";
import { RELATED_HEADING, type B2Key } from "@/lib/content/batch02/shared";
import { STRIKE_11N_DATE } from "@/lib/content/batch02/strike-11n";
import { STRIKES_AS_OF, STRIKE_DAY_PAGES, guideEntry, isUpcoming } from "@/lib/content/batch02/strikes";
import { STRIKES_SPAIN_AS_OF } from "@/lib/content/batch02/strikes-spain-data";
import type { Block } from "@/lib/content/blocks";
import { HUB_PATHS as SCHOOL_SPAIN_HUB_PATHS } from "@/lib/content/school-spain/regions";
import type { Locale } from "@/lib/i18n/config";
import { electionPhase } from "@/lib/programmatic/elections/election-day";
import { hubMeta as electionsHubMeta } from "@/lib/programmatic/elections/pages";
import { hubPath as electionsHubPath } from "@/lib/programmatic/elections/paths";
import { DATE_PAGES, datePath } from "@/lib/programmatic/holidays/paths";
import { dateQuestion } from "@/lib/programmatic/holidays/question";
import { hubEditions as spain2027HubEditions } from "@/lib/programmatic/spain-2027/editions";
import { isLowDemandPath } from "@/lib/seo/low-demand";

import {
  CATALONIA_STRIKE_KEYS,
  CHRISTMAS_KEYS,
  DECEMBER_BRIDGE_LAST_DAY,
  ELECTION_KEYS,
  SPAIN_STRIKE_KEYS,
  STRIKE_11N_SPAIN_KEY_PREFIX,
  b2KeyForHref,
  nextStrikePages,
  votingWhereStep,
} from "./next-step";
import { b2Step, pathOnly, type NextStepLink } from "./next-step-core";
import { SPAIN_2027_LABEL, SPAIN_SCHOOL_LABEL } from "./useful-now";

/**
 * "Continua llegint" / "Sigue leyendo" / "Keep reading", made clearer (27 Nov
 * 2026, batch 8S): the onward links at the foot of a content page, where the
 * reader who got the answer stops.
 *
 * Why (GA4 19-26 Nov 2026, landing pages, docs/SEO_EXPERIMENTS.md): pages per
 * session 1.04-1.34 on every top landing page (the 26N strike page 1.09 on
 * 3,613 sessions, candidates 1.10, the December bridge 1.04, the shops guide
 * 1.14, the 7 December date page 1.34). The stored "Continua llegint" list
 * sits after the FAQ, but it is a flat list of three to nine titles, written
 * when the page was published: on 27 Nov the 26N page still led with strike
 * pages of past days, and the December bridge's list led with the Christmas
 * markets, not the 7 December page or the shops.
 *
 * What it does, at render time (the stored body is not rewritten):
 *  - the stored heading stays; its list is shown as one box of up to
 *    CONTINUE_TOPICAL_MAX topical links and one seasonal link, then the stored
 *    items that are not linked anywhere else on the page, as they were;
 *  - topical: the family's links for this moment (the next strike day, where
 *    to vote then results, the 7 December page and the shops before the
 *    bridge), then the stored items in their order, then the edition's
 *    most-read pages;
 *  - seasonal: the first page of SEASON for the day that is not already on the
 *    page; every date comes from the module that owns it (the bridge,
 *    the Christmas lottery and La Grossa draws, Reis);
 *  - never the page itself; never a path another onward box of the page
 *    already links (the caller passes them: the "keep it" block, the next
 *    useful step, the election line, the calculator line, "Useful now", the
 *    most-read list); every link in the page's language; at most
 *    CONTINUE_TOPICAL_MAX + 1 links; never a noindex date page.
 *  - Every anchor is the target's own title (B2_TITLES, the date page's H1),
 *    the stored item as written, or the anchor the site already uses for the
 *    target (the Christmas calendar hub, the Spain school and 2027 hubs, the
 *    "where do I vote" section).
 *  - Clicks: `related_content_click` with `link_context: "continue_reading"`
 *    (topical and the stored rest) or `"seasonal_next"` (the seasonal link),
 *    from `data-ci-placement` (components/ContinueReading.tsx).
 */

export const CONTINUE_TOPICAL_MAX = 3;
export const CONTINUE_MAX_LINKS = CONTINUE_TOPICAL_MAX + 1;

/** The seasonal link's small label. */
export const SEASONAL_NOTE: Record<Locale, string> = {
  ca: "Per a aquests dies",
  es: "Para estos días",
  en: "Coming up",
};

export type OnwardScope = "catalonia" | "spain";

export interface ContinueItem extends NextStepLink {
  /** The stored list item, as written (Markdown), when the link comes from it. */
  markdown?: string;
}

export interface ContinueReading {
  /** Topical links, at most CONTINUE_TOPICAL_MAX. */
  topical: ContinueItem[];
  /** The one seasonal link, or null when every candidate is already on the page. */
  seasonal: NextStepLink | null;
  /** The stored items left out of the box and linked nowhere else on the page, as written. */
  rest: string[];
}

/* -------------------------------------------------------------------------- */
/* Seasonal                                                                   */
/* -------------------------------------------------------------------------- */

interface SeasonWindow {
  /** Last day (inclusive, Madrid) the window answers. */
  until: string;
  catalonia: (locale: Locale) => NextStepLink[];
  spain: (locale: Locale) => NextStepLink[];
}

const b = (key: B2Key, locale: Locale): NextStepLink => b2Step(key, locale);
const schoolSpain = (locale: Locale): NextStepLink => ({ href: `/${locale}/${SCHOOL_SPAIN_HUB_PATHS[locale]}/`, label: SPAIN_SCHOOL_LABEL[locale] });
const spain2027 = (locale: Locale): NextStepLink => ({ href: spain2027HubEditions()[locale], label: SPAIN_2027_LABEL[locale] });

/**
 * The season, in date order: the first window whose `until` is on or after
 * the day answers, its links in order of preference (the first one not on the
 * page wins). After the last window: the 2027 long weekends (Catalonia) and
 * the 2027 calendar (Spain), which hold all year.
 */
export const SEASON: readonly SeasonWindow[] = [
  {
    // To Tuesday 8 December: the long weekend.
    until: DECEMBER_BRIDGE_LAST_DAY,
    catalonia: (l) => [b("decemberBridge", l), calendarHubLink(l), b("shops", l), b("loteriaNadal", l)],
    spain: (l) => [b("decemberBridgeSpain", l), b("shopsSpainDecember", l), b("loteriaNadal", l)],
  },
  {
    // To the Christmas lottery draw (22 Dec).
    until: NADAL_DRAW_DATE,
    catalonia: (l) => [b("loteriaNadal", l), calendarHubLink(l), b("shops", l)],
    spain: (l) => [b("loteriaNadal", l), schoolSpain(l)],
  },
  {
    // To La Grossa's draw (31 Dec).
    until: GROSSA_DRAW_DATE,
    catalonia: (l) => [b("newYear", l), b("grossa", l), calendarHubLink(l)],
    spain: (l) => [schoolSpain(l), spain2027(l)],
  },
  {
    // To Reis (6 Jan); the sales guide second (its first opening Sunday, winter-sales.ts WINTER_SALES.firstSunday, falls in this window: tests/continue-reading.test.ts).
    until: REIS_DAY,
    catalonia: (l) => [b("reis", l), b("winterSales", l), calendarHubLink(l)],
    spain: (l) => [spain2027(l)],
  },
];

/** The seasonal candidates for a day, in order of preference. */
export function seasonalCandidates(scope: OnwardScope, locale: Locale, today: string): NextStepLink[] {
  const window = SEASON.find((w) => today <= w.until);
  if (window) return window[scope](locale);
  return scope === "catalonia" ? [b("bridges2027", locale), b("workCalendar", locale)] : [spain2027(locale)];
}

/* -------------------------------------------------------------------------- */
/* Topical                                                                    */
/* -------------------------------------------------------------------------- */

/** "Is <date> a holiday?" page link, only while the page is indexable. */
function dateStep(iso: string, locale: Locale, today: string): NextStepLink | null {
  if (!DATE_PAGES.includes(iso)) return null;
  const href = datePath(locale, iso);
  if (isLowDemandPath(href, today)) return null;
  return { href, label: dateQuestion(iso, locale) };
}

/** Strike pages: the next strike days, then the two hubs. */
function strikeTopical(scope: OnwardScope, locale: Locale): NextStepLink[] {
  const dated = nextStrikePages(scope, STRIKES_AS_OF, STRIKES_SPAIN_AS_OF).map((page) => b(page.key, locale));
  return scope === "catalonia" ? [...dated, b("strikes", locale), b("strikesSpain", locale)] : [...dated, b("strikesSpain", locale), b("strikes", locale)];
}

/** Election guides: before the polls close, where to vote and the polling-day guides; after, the results. */
function electionTopical(locale: Locale, today: string, now: Date): NextStepLink[] {
  const phase = electionPhase(now);
  if (phase === "count" || phase === "after" || phase === "over") {
    return [{ href: electionsHubPath(locale), label: electionsHubMeta(locale).h1 }, b("electionNight", locale), b("congressResults", locale)];
  }
  return [
    votingWhereStep(locale),
    b("candidates", locale),
    today <= POSTAL_29N.requestBy ? b("postalVote", locale) : b("mesa", locale),
    b("electionNight", locale),
  ];
}

/** Holiday and shop guides: around the December bridge, the date pages and the shops; after it, the year ahead. */
function holidayTopical(key: B2Key, locale: Locale, today: string): NextStepLink[] {
  const december = today <= DECEMBER_BRIDGE_LAST_DAY;
  const d7 = december ? dateStep("2026-12-07", locale, today) : null;
  const d8 = december ? dateStep("2026-12-08", locale, today) : null;
  switch (key) {
    case "decemberBridge":
      return december ? [d7, b("shops", locale), d8].filter((l): l is NextStepLink => l !== null) : [b("bridges2027", locale), b("workCalendar", locale)];
    case "decemberBridgeSpain":
      return december ? [b("shopsSpainDecember", locale), schoolSpain(locale)] : [spain2027(locale)];
    case "shops":
      return december ? [d8, b("decemberBridge", locale), d7].filter((l): l is NextStepLink => l !== null) : [b("winterSales", locale), b("holidayToday", locale)];
    case "shopsSpainDecember":
      return december ? [b("decemberBridgeSpain", locale), b("loteriaNadal", locale)] : [spain2027(locale)];
    case "holidayToday":
      return [december ? b("decemberBridge", locale) : null, b("workCalendar", locale), b("bridges2027", locale)].filter((l): l is NextStepLink => l !== null);
    case "workCalendar":
      return [b("bridges2027", locale), b("holidayToday", locale)];
    case "bridges2027":
      return [b("workCalendar", locale), b("holidayToday", locale)];
    default:
      return [];
  }
}

const HOLIDAY_TOPICAL_KEYS: readonly B2Key[] = ["decemberBridge", "decemberBridgeSpain", "shops", "shopsSpainDecember", "holidayToday", "workCalendar", "bridges2027"];

/** Christmas guides: the other season guides. */
function christmasTopical(locale: Locale): NextStepLink[] {
  return [b("christmasLights", locale), b("christmasBarcelona", locale), b("barcelonaDecember", locale), b("christmas", locale)];
}

/** A content page's family links and the seasonal scope (Spain for the rest-of-Spain pages, else Catalonia). */
export function topicalFor(entry: { href: string; key?: string | null; locale: Locale }, today: string, now: Date): { links: NextStepLink[]; scope: OnwardScope } {
  const { locale } = entry;
  if (entry.key?.startsWith(STRIKE_11N_SPAIN_KEY_PREFIX)) return { links: strikeTopical("spain", locale), scope: "spain" };
  const key = b2KeyForHref(entry.href);
  if (!key) return { links: [], scope: "catalonia" };
  if (CATALONIA_STRIKE_KEYS.includes(key)) return { links: strikeTopical("catalonia", locale), scope: "catalonia" };
  if (SPAIN_STRIKE_KEYS.includes(key)) return { links: strikeTopical("spain", locale), scope: "spain" };
  if (ELECTION_KEYS.includes(key) || key === "congressResults" || key === "municipalResults") return { links: electionTopical(locale, today, now), scope: "catalonia" };
  if (HOLIDAY_TOPICAL_KEYS.includes(key)) {
    const spain = key === "decemberBridgeSpain" || key === "shopsSpainDecember";
    return { links: holidayTopical(key, locale, today), scope: spain ? "spain" : "catalonia" };
  }
  if (CHRISTMAS_KEYS.includes(key)) return { links: christmasTopical(locale), scope: "catalonia" };
  return { links: [], scope: "catalonia" };
}

/**
 * A page about one day that is over, which the box does not offer as a topical
 * link (it stays in the stored rest): a strike day page before `today`, the
 * 11N page after 11 Nov, the education strike guide once its strike is past,
 * the postal-vote guide after the last hand-in day. Dates from the modules
 * that own them.
 */
export function isPastEventPage(href: string, today: string): boolean {
  const key = b2KeyForHref(href);
  if (!key) return false;
  const day = STRIKE_DAY_PAGES.find((page) => page.key === key)?.day;
  if (day) return day < today;
  if (key === "strike11n") return STRIKE_11N_DATE < today;
  if (key === "postalVote") return POSTAL_29N.deliverBy < today;
  if (key === "strikeEducation") {
    const entry = guideEntry(key, today);
    return !entry || (!entry.indefinite && !isUpcoming(entry, today));
  }
  return false;
}

/* -------------------------------------------------------------------------- */
/* The stored list                                                            */
/* -------------------------------------------------------------------------- */

/** Where the stored "Continua llegint" list is: the index of its H2 and of the list after it; null when the body has none. */
export function storedRelated(body: readonly Block[], locale: Locale): { heading: number; list: number; items: string[] } | null {
  const heading = body.findIndex((block) => block.type === "heading" && block.level === 2 && block.text === RELATED_HEADING[locale]);
  if (heading < 0) return null;
  const list = body[heading + 1];
  if (!list || list.type !== "list" || list.items.length === 0) return null;
  return { heading, list: heading + 1, items: list.items };
}

/** Every internal path an item links, in order. */
export function itemPaths(markdown: string): string[] {
  return [...markdown.matchAll(/\]\((\/[^)\s]*)\)/g)].map((m) => pathOnly(m[1]!));
}

/** An item that is one link (with an optional gloss after it): its href and anchor. */
function singleLink(markdown: string): NextStepLink | null {
  const links = [...markdown.matchAll(/\[([^\]]+)\]\((\/[^)\s]*)\)/g)];
  if (links.length !== 1) return null;
  return { href: links[0]![2]!, label: links[0]![1]! };
}

/* -------------------------------------------------------------------------- */
/* The chooser                                                                */
/* -------------------------------------------------------------------------- */

export interface ContinueInput {
  entry: { href: string; key?: string | null; locale: Locale };
  /** The stored list's items (Markdown), in order. */
  stored: readonly string[];
  /** Paths the page's other onward boxes already link (any locale prefix; compared without the hash). */
  exclude: readonly string[];
  /** The edition's most-read pages (lib/content/most-read.ts), the last topical fallback. */
  mostRead?: readonly NextStepLink[];
  today: string;
  now?: Date;
}

const sameLocale = (href: string, locale: Locale) => href.startsWith(`/${locale}/`);

/**
 * The box for a page: up to CONTINUE_TOPICAL_MAX topical links and one
 * seasonal link, never the page itself or a path in `exclude`, every link in
 * the page's language; `rest` keeps the stored items that are neither in the
 * box nor linked by another box, so no stored link leaves the page. Null when
 * the box would have no link.
 */
export function continueReading(input: ContinueInput): ContinueReading | null {
  const { entry, today } = input;
  const now = input.now ?? new Date();
  const locale = entry.locale;
  const self = pathOnly(entry.href);
  const taken = new Set<string>([self, ...input.exclude.map(pathOnly)]);
  const { links: family, scope } = topicalFor(entry, today, now);

  // The seasonal link first, so a stored item that is also the season's page
  // (the Christmas hub on the bridge guide) is shown as the seasonal link; it
  // never takes a path the family wants for itself.
  const familyPaths = new Set(family.map((link) => pathOnly(link.href)));
  let seasonal: NextStepLink | null = null;
  for (const link of seasonalCandidates(scope, locale, today)) {
    const path = pathOnly(link.href);
    if (!sameLocale(path, locale) || taken.has(path) || familyPaths.has(path)) continue;
    taken.add(path);
    seasonal = link;
    break;
  }

  const topical: ContinueItem[] = [];
  const consider = (item: ContinueItem): boolean => {
    const path = pathOnly(item.href);
    if (!sameLocale(path, locale) || taken.has(path) || isPastEventPage(path, today)) return false;
    taken.add(path);
    topical.push(item);
    return true;
  };

  const storedLinks = input.stored.map((markdown) => ({ markdown, link: singleLink(markdown) }));
  for (const link of family) {
    if (topical.length >= CONTINUE_TOPICAL_MAX) break;
    // A family link the stored list also has keeps the stored item's words,
    // unless it points at a section (the "where do I vote" anchor).
    const stored = link.href.includes("#") ? undefined : storedLinks.find((s) => s.link && pathOnly(s.link.href) === pathOnly(link.href));
    consider(stored?.link ? { ...stored.link, markdown: stored.markdown } : link);
  }
  for (const { markdown, link } of storedLinks) {
    if (topical.length >= CONTINUE_TOPICAL_MAX) break;
    if (link) consider({ ...link, markdown });
  }
  for (const link of input.mostRead ?? []) {
    if (topical.length >= CONTINUE_TOPICAL_MAX) break;
    consider(link);
  }

  // The stored items left: shown as written unless every path they link is
  // already on the page (in the box or another onward box).
  const rest = input.stored.filter((markdown) => {
    const paths = itemPaths(markdown);
    if (topical.some((item) => item.markdown === markdown)) return false;
    return paths.length === 0 || paths.some((path) => !taken.has(path));
  });

  if (topical.length === 0 && !seasonal) return null;
  return { topical, seasonal, rest };
}

/** Every path the box links (topical, seasonal, rest), for tests and the duplicate check. */
export function continuePaths(box: ContinueReading): string[] {
  return [...box.topical.map((l) => pathOnly(l.href)), ...(box.seasonal ? [pathOnly(box.seasonal.href)] : []), ...box.rest.flatMap(itemPaths)];
}
