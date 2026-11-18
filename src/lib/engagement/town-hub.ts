import type { Locale } from "@/lib/i18n/config";
import { townH1 } from "@/lib/programmatic/christmas-fairs/copy";
import { hasEnglish, townBySlug } from "@/lib/programmatic/christmas-fairs/data";
import { townPath } from "@/lib/programmatic/christmas-fairs/paths";
import { electionPath } from "@/lib/programmatic/elections/paths";
import { municipalityH1 } from "@/lib/programmatic/holidays/copy";
import { SNAPSHOT as HOLIDAYS, municipalityBySlug, unlistedTownBySlug } from "@/lib/programmatic/holidays/data";
import { englishSelectionSlugs, englishTownBySlug } from "@/lib/programmatic/holidays/english";
import { englishTownH1 } from "@/lib/programmatic/holidays/english-copy";
import { caA, caDe, caStart, esName } from "@/lib/programmatic/holidays/names";
import { municipalityPath } from "@/lib/programmatic/holidays/paths";
import { slugify } from "@/lib/programmatic/holidays/slug";
import { unlistedCopy } from "@/lib/programmatic/holidays/unlisted-copy";
import { workingDaysLinkFor, workingDaysPath } from "@/lib/programmatic/working-days/copy";
import { isLowDemandPath } from "@/lib/seo/low-demand";

/**
 * "<Town>: tot el que hi ha a CatalunyaInfo" (18 Nov 2026, docs/MEDIA_PLAN.md
 * pillar D): one compact list, low on every per-town page, of the other pages
 * the site has for that town, so the holiday, Christmas fair and election
 * pages of one municipality link each other both ways.
 *
 * The hub is the town's holiday page (/ca/festius/<town>/): the only family
 * with demand all year, and the one that carries the 2027 calendar, the
 * "today or tomorrow?" box and the .ics feed. It comes first wherever it is
 * linked. Measured in docs/SEO_EXPERIMENTS.md (entry of 18 Nov 2026), where
 * the review date is.
 *
 * Rules:
 *  - Only pages that exist for the town in the reader's language and are
 *    indexable (`isLowDemandPath`): no link to a noindex variant. The .ics
 *    feed is noindex, so its item goes to the holiday page's subscribe box.
 *  - What the current page already holds is left out (on the holiday page:
 *    its 2026 and 2027 lists, the today box, the feed).
 *  - Shown only with at least one other family's town page in it: a lone
 *    calculator link is not a town cluster.
 *  - Anchors describe the target in the reader's language; the holiday and
 *    fair items are the target's own H1.
 *  - No fact of its own, no clock: dated choices (a fair still to come, the
 *    polling-station wording until 29N) read the `today` the page already
 *    renders with.
 *  - Light on purpose: no election snapshot (the per-town election pages
 *    exist for every municipality in ca/es and for the English selection; a
 *    test holds that against the elections family).
 */

export type TownFamily = "holidays" | "fair" | "elections";

export interface TownHubLink {
  href: string;
  label: string;
  family: TownFamily | "workingDays";
  /** Jump links into the same target, printed after the main link on its line. */
  more?: { href: string; label: string }[];
}

export interface TownHub {
  title: string;
  links: TownHubLink[];
}

/** 29N, the general election (elections/election-day.ts ELECTION_DAY.day; a test holds them equal). */
export const TOWN_HUB_ELECTION_DAY = "2026-11-29";

/** The holiday page's section ids (MunicipalityPage, EnglishTownPage, CalendarSubscribe). */
const ANCHOR = {
  next: { ca: "festius-2027", es: "festius-2027", en: "holidays-2027" },
  today: { ca: "avui", es: "avui", en: "today" },
  feed: "afegeix-calendari",
} as const;

/** Every Catalan municipality the holiday snapshot names (with days, or left out of the order): 947. */
const ALL_TOWNS: ReadonlyMap<string, string> = new Map([
  ...HOLIDAYS.municipalities.map((m) => [m.slug, m.name] as const),
  ...HOLIDAYS.excluded.map((e) => [slugify(e.name), e.name] as const),
]);
const ENGLISH_ELECTIONS = new Set(englishSelectionSlugs());

/** "l'Hospitalet de Llobregat" in Catalan running text; "L'Hospitalet de Llobregat" in Spanish and English. */
function placeIn(name: string, locale: Locale): string {
  return locale === "ca" ? name : esName(name);
}

const linkable = (path: string): boolean => !isLowDemandPath(path);

/** The holiday page for the town in this language, if it exists: its path, H1, and whether it has the full town layout. */
function holidayPage(slug: string, locale: Locale): { path: string; h1: string; full: boolean } | null {
  const path = municipalityPath(locale, slug);
  if (locale === "en") {
    const m = englishTownBySlug(slug);
    return m ? { path, h1: englishTownH1(m), full: true } : null;
  }
  const m = municipalityBySlug(slug);
  if (m) return { path, h1: municipalityH1(m, locale), full: true };
  const u = unlistedTownBySlug(slug);
  return u ? { path, h1: unlistedCopy(u, locale).h1, full: false } : null;
}

/** The election page exists for every municipality in ca and es, and for the English selection in en. */
function hasElectionPage(slug: string, locale: Locale): boolean {
  return locale === "en" ? ENGLISH_ELECTIONS.has(slug) : ALL_TOWNS.has(slug);
}

function electionLabel(place: string, locale: Locale, today: string): string {
  if (today <= TOWN_HUB_ELECTION_DAY) {
    return {
      ca: `On votar el 29N ${caA(place)}: locals electorals i meses`,
      es: `Dónde votar el 29N en ${place}: locales electorales y mesas`,
      en: `Where to vote on 29 November in ${place}: polling stations`,
    }[locale];
  }
  // From 30 Nov: the page's own H1 (model.ts), true before and after the official file is imported.
  return { ca: `Resultats de les eleccions ${caA(place)}`, es: `Resultados de las elecciones en ${place}`, en: `Election results in ${place}` }[locale];
}

/**
 * The block for `slug` on a page of family `current`, or null when it would
 * hold no other family's page. `today`: the date the page renders with.
 */
export function townHub(slug: string, locale: Locale, current: TownFamily, today: string): TownHub | null {
  const name = ALL_TOWNS.get(slug);
  if (!name) return null;
  const place = placeIn(name, locale);
  const links: TownHubLink[] = [];

  const holidays = holidayPage(slug, locale);
  const hub = holidays && linkable(holidays.path) ? holidays : null;
  if (hub && current !== "holidays") {
    const more = hub.full
      ? [
          { href: `${hub.path}#${ANCHOR.next[locale]}`, label: { ca: "calendari 2027", es: "calendario 2027", en: "2027 calendar" }[locale] },
          { href: `${hub.path}#${ANCHOR.today[locale]}`, label: { ca: "és festiu avui o demà?", es: "¿es festivo hoy o mañana?", en: "is today or tomorrow a holiday?" }[locale] },
        ]
      : [];
    links.push({ href: hub.path, label: hub.h1, family: "holidays", ...(more.length ? { more } : {}) });
  }

  const fair = townBySlug(slug);
  if (fair && current !== "fair" && (locale !== "en" || hasEnglish(fair)) && fair.fairs.some((f) => f.end && f.end >= today)) {
    const path = townPath(locale, slug);
    if (linkable(path)) links.push({ href: path, label: townH1(fair, locale), family: "fair" });
  }

  if (current !== "elections" && hasElectionPage(slug, locale)) {
    const path = electionPath(locale, slug);
    if (linkable(path)) links.push({ href: path, label: electionLabel(place, locale, today), family: "elections" });
  }

  // Only a cluster when another family's page is in it.
  if (links.length === 0) return null;

  // The calculator knows the towns with days in the order (leave-2027/places.ts plannerData).
  if (municipalityBySlug(slug) && linkable(workingDaysPath(locale))) {
    links.push({
      href: workingDaysLinkFor(locale, slug),
      label: { ca: `Dies hàbils i terminis ${caA(place)}`, es: `Días hábiles y plazos en ${place}`, en: `Working days and deadlines in ${place}` }[locale],
      family: "workingDays",
    });
  }

  // The feed is noindex: its item opens the holiday page's subscribe box (webcal, Google Calendar, download).
  if (hub?.full && current !== "holidays") {
    links.push({
      href: `${hub.path}#${ANCHOR.feed}`,
      label: { ca: `Festius ${caDe(place)} al teu calendari (.ics)`, es: `Festivos de ${place} en tu calendario (.ics)`, en: `${place} holidays in your calendar (.ics)` }[locale],
      family: "holidays",
    });
  }

  const title = {
    ca: `${caStart(place)}: tot el que hi ha a CatalunyaInfo`,
    es: `${place}: todo lo que hay en CatalunyaInfo`,
    en: `${place}: everything on CatalunyaInfo`,
  }[locale];
  return { title, links };
}
