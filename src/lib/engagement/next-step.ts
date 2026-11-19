import { dayDate } from "@/lib/content/batch02/festive";
import { POSTAL_29N } from "@/lib/content/batch02/postal-vote";
import { B2_PATHS, b2href, type B2Key } from "@/lib/content/batch02/shared";
import { STRIKES_AS_OF, STRIKE_DAY_PAGES, guideEntry, isUpcoming } from "@/lib/content/batch02/strikes";
import { STRIKES_SPAIN_AS_OF } from "@/lib/content/batch02/strikes-spain-data";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { leavePath } from "@/lib/programmatic/leave-2027/copy";
import { hubMeta as rodaliesHubMeta } from "@/lib/programmatic/rodalies/pages";
import { hubPath as rodaliesHubPath } from "@/lib/programmatic/rodalies/paths";
import { workingDaysPath } from "@/lib/programmatic/working-days/copy";

import { NEXT_STEP_MAX_LINKS, b2Step, nextStep, pathOnly, type NextStep, type NextStepLink } from "./next-step-core";

/**
 * "Siguiente paso útil" / "Següent pas útil" / "Next useful step" (18 Nov
 * 2026): one compact box right after a page's answer, with the one onward
 * step a reader of that family most plausibly needs, in 1 to 3 links.
 *
 * Why (GA4, 4-17 Nov 2026, landing page families, logged in
 * docs/SEO_EXPERIMENTS.md): 1.11 page views per session. Strike pages, 72 %
 * of the landed sessions, 1.10; elections 1.19; holidays 1.27. Readers get
 * their answer and leave, because the onward links sit at the foot of the
 * page or in a generic "Lee también" box two sections down.
 *
 * Rules, the same for every family:
 *  - Links only, no fact of its own. Every anchor is the target page's own
 *    title (B2_TITLES, the Rodalies hub's title, a calculator's hub card) or
 *    the sentence that already links it elsewhere on the site (leave planner,
 *    working days), in the reader's language. Every target is a path the site
 *    builds (tests/next-step.test.ts resolves them).
 *  - Dated steps follow the same switch as the pages that show them: strikes
 *    by STRIKES_AS_OF / STRIKES_SPAIN_AS_OF (no clock, like the strike pages);
 *    the Christmas fair pages and the English town pages by the day the fairs
 *    were last read (their server render never reads the clock); elections,
 *    the December holidays and the other pages by the render date. Static
 *    pages (town holidays, town elections) render at deploy, so their box
 *    moves with each deploy, which the strike watch makes most days.
 *  - Never the page itself; at most NEXT_STEP_MAX_LINKS links.
 *  - Rendered by the templates (components/NextStep.tsx), never stored in a
 *    body: turning a family on or off needs a deploy only, no republish.
 *  - Clicks are `related_content_click` with `link_context: "next_step"`
 *    (lib/analytics/clicks.ts, from `data-ci-placement` on the box).
 */

export * from "./next-step-core";

/* -------------------------------------------------------------------------- */
/* Shared links                                                               */
/* -------------------------------------------------------------------------- */

/** The 2027 leave planner, with the words of the town pages' link (LeaveLink.tsx) without the town. */
export function leaveStep(locale: Locale): NextStepLink {
  const label = {
    ca: "Com aprofitar les vacances del 2027: quins dies demanar",
    es: "Cómo aprovechar las vacaciones de 2027: qué días pedir",
    en: "Make the most of your 2027 leave: which days to book",
  }[locale];
  return { href: leavePath(locale), label };
}

/** The working-days calculator, with the words of its hub link (WorkingDaysLink.tsx). */
export function workingDaysStep(locale: Locale): NextStepLink {
  const label = {
    ca: "Calcula els dies hàbils i l'últim dia del termini al teu municipi",
    es: "Calcula los días hábiles y el último día del plazo en tu municipio",
    en: "Work out the working days and the last day of the deadline where you are",
  }[locale];
  return { href: workingDaysPath(locale), label };
}

/** The Rodalies hub: live notices on every line. */
export function rodaliesStep(locale: Locale): NextStepLink {
  return { href: rodaliesHubPath(locale), label: rodaliesHubMeta(locale).title };
}

/* -------------------------------------------------------------------------- */
/* Strikes                                                                    */
/* -------------------------------------------------------------------------- */

/** Catalonia's strike pages: the hub, the 11N page, the Renfe and education guides. */
export const CATALONIA_STRIKE_KEYS: readonly B2Key[] = ["strikes", "strike11n", "strikeRenfe", "strikeEducation"];
/** The Spain-wide strike pages (and, by entry key, the 11N Spain and city pages). */
export const SPAIN_STRIKE_KEYS: readonly B2Key[] = ["strikesSpain", "railStrike17n", "strike19n", "strike20n", "strike23n", "strike26n"];
/** `entries.key` of the 11N Spain page and the 13 city pages ("…-spain", "…-sevilla"…). */
export const STRIKE_11N_SPAIN_KEY_PREFIX = "guide-general-strike-11-november-2026-";

/** Catalonia's dated guides that follow their strike entry in strikes.ts. */
const CATALONIA_DATED_GUIDES: readonly B2Key[] = ["strikeRenfe", "strikeEducation"];

interface DatedStrikePage {
  key: B2Key;
  date: string;
}

/**
 * The next strike pages with a day, in date order, one page per day: the 19,
 * 20, 23 and 26 November day pages (STRIKES_SPAIN_AS_OF, as those pages read it)
 * and, for Catalonia, the Renfe and education guides on the next day of
 * action of the strike they cover (STRIKES_AS_OF, guideEntry). The strike day
 * itself still counts. On a day with both, the day page wins: it lists every
 * strike of that day.
 */
export function nextStrikePages(scope: "catalonia" | "spain", asOf: string = STRIKES_AS_OF, spainAsOf: string = STRIKES_SPAIN_AS_OF): DatedStrikePage[] {
  // 19 Nov 2026: every one-day page (19, 20, 23 and 26 Nov), from the list both hubs link them from.
  const days: DatedStrikePage[] = STRIKE_DAY_PAGES.filter((page) => spainAsOf <= page.day).map((page) => ({ key: page.key, date: page.day }));
  if (scope === "spain") return days;
  const guides = CATALONIA_DATED_GUIDES.flatMap((key): DatedStrikePage[] => {
    const entry = guideEntry(key, asOf);
    if (!entry || entry.indefinite || !isUpcoming(entry, asOf)) return [];
    const next = entry.dates.find((date) => date >= asOf);
    return next ? [{ key, date: next }] : [];
  });
  // Stable sort: the day pages, listed first, stay ahead of a guide on the same day.
  const sorted = [...days, ...guides].sort((a, b) => a.date.localeCompare(b.date));
  return sorted.filter((page, i) => sorted.findIndex((other) => other.date === page.date) === i);
}

/** A strike page link; its day under it when the title does not say it ("Huelga de Renfe en noviembre"). */
function strikePageStep(page: DatedStrikePage, locale: Locale): NextStepLink {
  const link = b2Step(page.key, locale);
  const day = String(Number(page.date.slice(8, 10)));
  if (new RegExp(`(^|\\D)${day}(\\D|$)`).test(link.label)) return link;
  const when = dayDate(page.date, locale, false);
  return { ...link, note: when.charAt(0).toUpperCase() + when.slice(1) };
}

/**
 * Catalonia: Rodalies live, then the next two strike days. Rest of Spain: the
 * next two strike days, then the Spain strikes calendar. Once no dated strike
 * page is ahead, the hubs stand in.
 */
export function strikeNextStep(scope: "catalonia" | "spain", locale: Locale, self: string, asOf: string = STRIKES_AS_OF, spainAsOf: string = STRIKES_SPAIN_AS_OF): NextStep | null {
  const dated = nextStrikePages(scope, asOf, spainAsOf)
    .filter((page) => pathOnly(b2href(page.key, locale)) !== pathOnly(self))
    .slice(0, 2)
    .map((page) => strikePageStep(page, locale));
  const links =
    scope === "catalonia"
      ? [rodaliesStep(locale), ...dated, b2Step("strikes", locale), b2Step("strikesSpain", locale)]
      : [...dated, b2Step("strikesSpain", locale)];
  return nextStep("strikes", links, self, NEXT_STEP_MAX_LINKS);
}

/* -------------------------------------------------------------------------- */
/* Elections (29 November 2026)                                               */
/* -------------------------------------------------------------------------- */

export const ELECTION_KEYS: readonly B2Key[] = ["candidates", "voting", "mesa", "postalVote", "electionNight"];

/**
 * The how-to-vote guide's "Where do I vote?" section: its heading as the
 * anchor text and its generated id (tests/next-step.test.ts holds both to the
 * guide's body).
 */
export const VOTING_WHERE: Record<Locale, { id: string; label: string }> = {
  ca: { id: "on-voto-com-saber-el-teu-col-legi-electoral-per-al-29-de-novembre", label: "On voto? Com saber el teu col·legi electoral per al 29 de novembre" },
  es: { id: "donde-voto-como-saber-tu-colegio-electoral-para-el-29-de-noviembre", label: "¿Dónde voto? Cómo saber tu colegio electoral para el 29 de noviembre" },
  en: { id: "where-do-i-vote-finding-your-polling-station-for-29-november", label: "Where do I vote? Finding your polling station for 29 November" },
};

export function votingWhereStep(locale: Locale): NextStepLink {
  return { href: `${b2href("voting", locale)}#${VOTING_WHERE[locale].id}`, label: VOTING_WHERE[locale].label };
}

/**
 * Up to the postal-vote request deadline (19 Nov): the postal vote, then
 * where to vote. Up to polling day: where to vote, then results night. After
 * it: results night. The page itself is skipped, so the next in line fills in.
 */
export function electionNextStep(locale: Locale, self: string, today: string): NextStep | null {
  const where = votingWhereStep(locale);
  const night = b2Step("electionNight", locale);
  const links =
    today <= POSTAL_29N.requestBy
      ? [b2Step("postalVote", locale), where, night]
      : today <= POSTAL_29N.election
        ? [where, night, b2Step("mesa", locale)]
        : [night];
  return nextStep("elections", links, self);
}

/** A town's election page (/es/elecciones/<town>/) already lists its polling places: the postal vote while it can be requested, then results night. */
export function electionTownNextStep(locale: Locale, self: string, today: string): NextStep | null {
  const links = today <= POSTAL_29N.requestBy ? [b2Step("postalVote", locale), b2Step("electionNight", locale)] : [b2Step("electionNight", locale)];
  return nextStep("elections", links, self);
}

/* -------------------------------------------------------------------------- */
/* Holidays                                                                   */
/* -------------------------------------------------------------------------- */

/** The December 2026 holidays (6 to 8 Dec): the bridge pages answer until the last of them. */
export const DECEMBER_BRIDGE_LAST_DAY = "2026-12-08";

export const HOLIDAY_KEYS: readonly B2Key[] = [
  "decemberBridge",
  "decemberBridgeSpain",
  "shops",
  "shopsSpainDecember",
  "workCalendar",
  "bridges2027",
  "holidayToday",
  "easter2027",
  "schoolFreeDays",
];

/** One onward page per holiday guide, then the 2027 leave planner (the family's step for the year ahead). */
export function holidayGuideNextStep(key: B2Key, locale: Locale, self: string, today: string): NextStep | null {
  const december = today <= DECEMBER_BRIDGE_LAST_DAY;
  const b = (k: B2Key) => b2Step(k, locale);
  const first: Partial<Record<B2Key, NextStepLink | null>> = {
    decemberBridge: december ? b("schoolFreeDays") : b("bridges2027"),
    decemberBridgeSpain: december ? b("shopsSpainDecember") : null,
    shops: december ? b("decemberBridge") : null,
    shopsSpainDecember: december ? b("decemberBridgeSpain") : null,
    workCalendar: null,
    bridges2027: null,
    holidayToday: december ? b("decemberBridge") : null,
    easter2027: null,
    schoolFreeDays: december ? b("decemberBridge") : null,
  };
  const second = key === "workCalendar" || key === "bridges2027" ? [leaveStep(locale), workingDaysStep(locale)] : [leaveStep(locale)];
  return nextStep("holidays", [first[key], ...second], self);
}

/** "Is <date> a holiday?" pages: the December bridge for the days around it, the 2027 bridges for a 2027 day, and the leave planner. */
export function holidayDateNextStep(iso: string, locale: Locale, self: string, today: string): NextStep | null {
  const bridge = iso.startsWith("2026-") && today <= DECEMBER_BRIDGE_LAST_DAY ? b2Step("decemberBridge", locale) : null;
  const year2027 = iso.startsWith("2027-") ? b2Step("bridges2027", locale) : null;
  return nextStep("holidays", [bridge, year2027, leaveStep(locale)], self);
}

/* -------------------------------------------------------------------------- */
/* Christmas fairs                                                            */
/* -------------------------------------------------------------------------- */

/** The fairs season (christmas-fairs/classify.ts SEASON.to): after it the box goes. */
export const CHRISTMAS_LAST_DAY = "2027-01-07";

/**
 * Fair pages (the guide, the hub, a town): the lights switch-on, then the
 * December holidays while they are ahead (Barcelona: what's on in December).
 * The lights and Christmas-in-Barcelona guides hand on to the fairs.
 */
export function christmasNextStep(locale: Locale, self: string, today: string, opts: { barcelona?: boolean } = {}): NextStep | null {
  if (today > CHRISTMAS_LAST_DAY) return null;
  const december = today <= DECEMBER_BRIDGE_LAST_DAY ? b2Step("decemberBridge", locale) : null;
  const links = opts.barcelona
    ? [b2Step("barcelonaDecember", locale), b2Step("christmasLights", locale)]
    : [b2Step("christmasLights", locale), december, b2Step("christmas", locale)];
  return nextStep("christmas", links, self);
}

export const CHRISTMAS_KEYS: readonly B2Key[] = ["christmas", "christmasLights", "christmasBarcelona"];

function christmasGuideNextStep(key: B2Key, locale: Locale, self: string, today: string): NextStep | null {
  if (key === "christmas") return christmasNextStep(locale, self, today);
  if (today > CHRISTMAS_LAST_DAY) return null;
  return nextStep("christmas", [b2Step("christmas", locale), b2Step("barcelonaDecember", locale)], self);
}

/* -------------------------------------------------------------------------- */
/* Barcelona practical                                                        */
/* -------------------------------------------------------------------------- */

/** Each practical guide's onward page(s): getting around, then the season. */
export function barcelonaNextStep(key: B2Key, locale: Locale, self: string, today: string): NextStep | null {
  const b = (k: B2Key) => b2Step(k, locale);
  const map: Partial<Record<B2Key, NextStepLink[]>> = {
    transport: [b("airport"), rodaliesStep(locale)],
    airport: [b("transport"), rodaliesStep(locale)],
    parking: [b("zbe")],
    zbe: [b("parking")],
    touristTax: [b("transport"), b("airport")],
    climate: today <= "2026-12-31" ? [b("barcelonaDecember"), b("transport")] : [b("transport")],
  };
  const links = map[key];
  return links ? nextStep("barcelona", links, self) : null;
}

export const BARCELONA_KEYS: readonly B2Key[] = ["transport", "airport", "parking", "zbe", "touristTax", "climate"];

/* -------------------------------------------------------------------------- */
/* Content pages (EntryArticle)                                               */
/* -------------------------------------------------------------------------- */

const KEY_BY_HREF: ReadonlyMap<string, B2Key> = new Map(
  (Object.keys(B2_PATHS) as B2Key[]).flatMap((key) => LOCALES.map((locale) => [b2href(key, locale), key] as const)),
);

/** The registry key of a content page from its path ("/es/guias/huelga-hoy-cataluna/" → "strikes"). */
export function b2KeyForHref(href: string): B2Key | null {
  const path = pathOnly(href);
  return KEY_BY_HREF.get(path.endsWith("/") ? path : `${path}/`) ?? null;
}

/**
 * The box for a content page, or null when its family has none.
 * `key` is `entries.key` (the 11N Spain and city pages are told by it).
 */
export function entryNextStep(entry: { href: string; key?: string | null; locale: Locale }, today: string): NextStep | null {
  const { href, locale } = entry;
  if (entry.key?.startsWith(STRIKE_11N_SPAIN_KEY_PREFIX)) return strikeNextStep("spain", locale, href);
  const key = b2KeyForHref(href);
  if (!key) return null;
  if (CATALONIA_STRIKE_KEYS.includes(key)) return strikeNextStep("catalonia", locale, href);
  if (SPAIN_STRIKE_KEYS.includes(key)) return strikeNextStep("spain", locale, href);
  if (ELECTION_KEYS.includes(key)) return electionNextStep(locale, href, today);
  if (HOLIDAY_KEYS.includes(key)) return holidayGuideNextStep(key, locale, href, today);
  if (CHRISTMAS_KEYS.includes(key)) return christmasGuideNextStep(key, locale, href, today);
  if (BARCELONA_KEYS.includes(key)) return barcelonaNextStep(key, locale, href, today);
  return null;
}

/**
 * Where the box goes in a stored body that has no answer-first summary:
 * after the first key-facts block of the preamble (before the first H2),
 * else after the lead paragraph, else at the first H2.
 */
export function nextStepIndex(body: readonly { type: string; level?: number; lead?: boolean }[]): number {
  const firstH2 = body.findIndex((block) => block.type === "heading" && block.level === 2);
  const preamble = firstH2 < 0 ? body.length : firstH2;
  const facts = body.slice(0, preamble).findIndex((block) => block.type === "keyFacts");
  if (facts >= 0) return facts + 1;
  const lead = body.slice(0, preamble).findIndex((block) => block.type === "paragraph" && block.lead);
  if (lead >= 0) return lead + 1;
  return preamble;
}
