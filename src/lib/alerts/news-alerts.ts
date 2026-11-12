import { b2href, type B2Key } from "@/lib/content/batch02/shared";
import { POSTAL_29N } from "@/lib/content/batch02/postal-vote";
import { STRIKES, andList, lastDay, type Strike } from "@/lib/content/batch02/strikes";
import { WEEKDAY_NAMES, shortDate, weekdayIndex } from "@/lib/content/holidays/calendar";
import type { Locale } from "@/lib/i18n/config";
import { GENERAL_ELECTION_DAY } from "@/lib/programmatic/elections/today";

/**
 * The sitewide alert strip: one line per news page of the moment, under the
 * header of every public page (components/NewsAlerts.tsx), in the page's
 * language, linking to that language's edition.
 *
 * Why (4 Nov 2026, docs/SEO_EXPERIMENTS.md): the 11N general strike pages were
 * the site's biggest traffic driver but sat at position 8.7-9.8 for the
 * Catalan head queries; the ~2,000 town and guide pages Google crawls every
 * day carried no link to them. The strip gives readers the way there and
 * gives those pages a link each.
 *
 * Dates come from the source modules, never typed here: a strike's days and
 * its end from its entry in strikes.ts (a day called off moves the end and the
 * wording with no edit here; a strike removed from STRIKES drops its line),
 * the election day from elections/today.ts.
 *
 * Time-boxing. Static pages are built once per deploy, so a line is decided
 * twice:
 *  1. on the server, when the page is rendered (build, ISR or request): only
 *     alerts whose window contains that instant are in the HTML;
 *  2. in the browser, by the inline script in the root layout
 *     (`newsAlertsExpiryScript`), which runs before the strip is parsed and
 *     hides every line past its `end`, so a page built on 11 Nov still shows
 *     nothing about 11N on the 12th. It also covers client-side navigation
 *     (the style it adds outlives it) and a tab left open across an end.
 * A line whose `start` falls after a page was rendered appears on that page
 * only when it is rendered again: at the next deploy for static pages, within
 * a day for content pages (revalidate = 86400).
 *
 * Copy rules: it must be true on any day the line can be seen (from `start`
 * to `end`), so it names the day ("el dimecres 11 de novembre") and never
 * says "today" or "tomorrow"; short and calm, no exclamation marks.
 *
 * 11 Nov 2026 (docs/SEO_EXPERIMENTS.md, "After 11N: next strikes"): from
 * the day after the general strike the strip points at what comes next, each
 * line until the end of its last day: the rail strike of 17 and 19 Nov, then
 * SEMAF's of 23 Nov (both to the Renfe guide, which follows the next rail
 * strike, so never two lines to it at once), the education strike of 26 Nov
 * and the 29 Nov election. The same lines, as of a page's own date, make the
 * "upcoming strikes and dates" block of the 11N pages (`nextDateLinks`).
 *
 * HOW TO UPDATE:
 *  - A strike called off: remove its entry from STRIKES or set the alert's
 *    `end` by hand; a day called off: remove it from the entry's `dates`.
 *  - A new alert: add it to `buildNewsAlerts`, pointing at a B2 guide that is
 *    published in every language (tests/news-alerts.test.ts checks the paths).
 *    Its id must be [a-z0-9-] (it goes into a CSS selector).
 */

export interface NewsAlert {
  /** Stable id: the line's `data-alert` attribute and its key in the expiry script. */
  id: string;
  /** First instant the line is shown (inclusive): ISO 8601 with Madrid's offset. */
  start: string;
  /** First instant it is no longer shown (exclusive): midnight in Madrid after its last day. */
  end: string;
  /** The guide it links to, in the reader's language (B2_PATHS). */
  target: B2Key;
  text: Record<Locale, string>;
}

/** What the strip renders for one line. */
export interface AlertLine {
  id: string;
  href: string;
  text: string;
}

/** The day the strip went live: the two strike lines show from then. */
export const ALERTS_LIVE_FROM = "2026-11-04";

/** The day after the general strike: the lines about what comes next start then. */
export const NEXT_ALERTS_FROM = "2026-11-12";

/** The 29N line is one of them (13 Nov until 11 Nov 2026). */
export const ELECTION_ALERT_FROM = NEXT_ALERTS_FROM;

/**
 * 13 Nov 2026 (docs/SEO_EXPERIMENTS.md, "13 Nov 2026 — 29N results night"):
 * the postal-vote lines start this day. Their two deadlines come from
 * POSTAL_29N in postal-vote.ts (Correos and Interior, re-read 13 Nov).
 */
export const POSTAL_ALERT_FROM = "2026-11-13";

/** The civil date before `isoDate`. */
function previousDay(isoDate: string): string {
  return new Date(Date.parse(`${isoDate}T12:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
}

/** The entries in strikes.ts the strike lines are built from. */
export const STRIKE_11N_ID = "vaga-general-2026-11-11";
export const STRIKE_RENFE_ID = "vaga-renfe-2026-11-10";
export const STRIKE_RAIL_ID = "vaga-ferroviaria-2026-11-17";
export const STRIKE_RENFE_23_ID = "vaga-renfe-2026-11-23";
export const STRIKE_EDUCATION_ID = "vaga-educacio-2026-11-26";

export const NEWS_ALERTS_LABEL: Record<Locale, string> = {
  ca: "Avisos d'actualitat",
  es: "Avisos de actualidad",
  en: "Current notices",
};

/* -------------------------------------------------------------------------- */
/* Instants in Europe/Madrid                                                  */
/* -------------------------------------------------------------------------- */

const MADRID_PARTS = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Madrid",
  hourCycle: "h23",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
});

/** Madrid's UTC offset at an instant, in minutes (60 in winter, 120 in summer). */
export function madridOffsetMinutes(instant: number): number {
  const parts = MADRID_PARTS.formatToParts(new Date(instant));
  const n = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const wall = Date.UTC(n("year"), n("month") - 1, n("day"), n("hour"), n("minute"), n("second"));
  return Math.round((wall - Math.floor(instant / 1000) * 1000) / 60_000);
}

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * Midnight at the start of a civil date in Catalonia, as ISO 8601 with its
 * offset: "2026-11-12" -> "2026-11-12T00:00:00+01:00". Clocks change at 02:00
 * or 03:00, so the offset read at 00:00 UTC is the one in force at midnight.
 */
export function madridMidnight(isoDate: string): string {
  const offset = madridOffsetMinutes(Date.parse(`${isoDate}T00:00:00Z`));
  const sign = offset < 0 ? "-" : "+";
  const abs = Math.abs(offset);
  return `${isoDate}T00:00:00${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

/** The civil date after `isoDate`. */
export function nextDay(isoDate: string): string {
  return new Date(Date.parse(`${isoDate}T12:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
}

/** The end of a civil date in Catalonia: midnight at the start of the next one. */
export function endOfMadridDay(isoDate: string): string {
  return madridMidnight(nextDay(isoDate));
}

/* -------------------------------------------------------------------------- */
/* Wording                                                                    */
/* -------------------------------------------------------------------------- */

const ARTICLE: Record<Locale, string> = { ca: "el ", es: "el ", en: "" };

/**
 * "el dimecres 11 de novembre", "el dimarts 10 i el dijous 12 de novembre" /
 * "el martes 10 y el jueves 12 de noviembre" / "on Tuesday 10 and Thursday 12
 * November". The month is said once per run of days in the same month.
 */
export function daysPhrase(dates: readonly string[], locale: Locale): string {
  const items = dates.map((iso, index) => {
    const monthFollows = (dates[index + 1] ?? "").slice(0, 7) === iso.slice(0, 7);
    const day = monthFollows ? String(Number(iso.slice(8, 10))) : shortDate(iso, locale);
    return `${ARTICLE[locale]}${WEEKDAY_NAMES[locale][weekdayIndex(iso)] ?? ""} ${day}`;
  });
  const list = andList(items, locale);
  return locale === "en" ? `on ${list}` : list;
}

/* -------------------------------------------------------------------------- */
/* The alerts                                                                 */
/* -------------------------------------------------------------------------- */

function strikeAlert(
  strikes: readonly Strike[],
  id: string,
  alertId: string,
  target: B2Key,
  text: (days: Record<Locale, string>) => Record<Locale, string>,
  from: string = madridMidnight(ALERTS_LIVE_FROM),
): NewsAlert[] {
  const strike = strikes.find((s) => s.id === id);
  if (!strike || strike.indefinite || strike.dates.length === 0) return [];
  const days = {
    ca: daysPhrase(strike.dates, "ca"),
    es: daysPhrase(strike.dates, "es"),
    en: daysPhrase(strike.dates, "en"),
  };
  const end = endOfMadridDay(lastDay(strike));
  // A line that would end before it starts (its days already past) is dropped.
  if (Date.parse(end) <= Date.parse(from)) return [];
  return [{ id: alertId, start: from, end, target, text: text(days) }];
}

/** The later of two ISO instants. */
const later = (a: string, b: string) => (Date.parse(a) >= Date.parse(b) ? a : b);

/**
 * Lines that link the same guide follow one another: each starts when the
 * one before it ends, so the strip never carries two links to one page.
 */
function chained(lines: NewsAlert[]): NewsAlert[] {
  const out: NewsAlert[] = [];
  for (const line of lines) {
    const before = out.filter((other) => other.target === line.target).at(-1);
    const start = before ? later(line.start, before.end) : line.start;
    if (Date.parse(start) < Date.parse(line.end)) out.push({ ...line, start });
  }
  return out;
}

/** Built from the source modules; the parameters are for the tests. */
export function buildNewsAlerts(
  strikes: readonly Strike[] = STRIKES,
  electionDay: string = GENERAL_ELECTION_DAY,
  postal: { requestBy: string; deliverBy: string } = POSTAL_29N,
): NewsAlert[] {
  const next = madridMidnight(NEXT_ALERTS_FROM);
  return chained([
    ...strikeAlert(strikes, STRIKE_11N_ID, "strike-11n", "strike11n", (d) => ({
      ca: `Vaga general ${d.ca}: què funciona i serveis mínims`,
      es: `Huelga general ${d.es}: qué funciona y servicios mínimos`,
      en: `General strike ${d.en}: what runs and minimum services`,
    })),
    ...strikeAlert(strikes, STRIKE_RENFE_ID, "strike-renfe", "strikeRenfe", (d) => ({
      ca: `Vaga de Renfe ${d.ca}: Rodalies i serveis mínims`,
      es: `Huelga de Renfe ${d.es}: Rodalies y servicios mínimos`,
      en: `Renfe strike ${d.en}: Rodalies and minimum services`,
    })),
    ...strikeAlert(
      strikes,
      STRIKE_RAIL_ID,
      "strike-rail-17n",
      "strikeRenfe",
      (d) => ({
        ca: `Vaga de trens ${d.ca}: Renfe, Adif i serveis mínims`,
        es: `Huelga de trenes ${d.es}: Renfe, Adif y servicios mínimos`,
        en: `Rail strike ${d.en}: Renfe, Adif and minimum services`,
      }),
      next,
    ),
    ...strikeAlert(
      strikes,
      STRIKE_RENFE_23_ID,
      "strike-renfe-23n",
      "strikeRenfe",
      (d) => ({
        ca: `Vaga de maquinistes ${d.ca}: Renfe, Rodalies i serveis mínims`,
        es: `Huelga de maquinistas ${d.es}: Renfe, Rodalies y servicios mínimos`,
        en: `Train drivers' strike ${d.en}: Renfe, Rodalies and minimum services`,
      }),
      next,
    ),
    ...strikeAlert(
      strikes,
      STRIKE_EDUCATION_ID,
      "strike-education-26n",
      "strikeEducation",
      (d) => ({
        ca: `Vaga a l'educació a Catalunya ${d.ca}: hi ha escola?`,
        es: `Huelga educativa en Cataluña ${d.es}: ¿hay colegio?`,
        en: `Catalonia education strike ${d.en}: is there school?`,
      }),
      next,
    ),
    // 13 Nov 2026: the postal vote, request deadline then hand-in deadline
    // (one guide, so the second line starts when the first ends).
    {
      id: "postal-vote-request",
      start: madridMidnight(POSTAL_ALERT_FROM),
      end: endOfMadridDay(postal.requestBy),
      target: "postalVote",
      text: {
        ca: `Vot per correu: es pot demanar fins ${daysPhrase([postal.requestBy], "ca").replace(/^el /, "al ")}`,
        es: `Voto por correo: se puede pedir hasta ${daysPhrase([postal.requestBy], "es")}`,
        en: `Postal vote: apply by ${daysPhrase([postal.requestBy], "en").replace(/^on /, "")}`,
      },
    },
    {
      id: "postal-vote-deliver",
      start: madridMidnight(POSTAL_ALERT_FROM),
      end: endOfMadridDay(postal.deliverBy),
      target: "postalVote",
      text: {
        ca: `Vot per correu: es lliura a Correus fins ${daysPhrase([postal.deliverBy], "ca").replace(/^el /, "al ")}`,
        es: `Voto por correo: se entrega en Correos hasta ${daysPhrase([postal.deliverBy], "es")}`,
        en: `Postal vote: hand it in at Correos by ${daysPhrase([postal.deliverBy], "en").replace(/^on /, "")}`,
      },
    },
    {
      id: "election-29n",
      start: madridMidnight(ELECTION_ALERT_FROM),
      end: endOfMadridDay(electionDay),
      target: "voting",
      text: {
        ca: `Eleccions generals ${daysPhrase([electionDay], "ca")}: on i com votar`,
        es: `Elecciones generales ${daysPhrase([electionDay], "es")}: dónde y cómo votar`,
        en: `General election ${daysPhrase([electionDay], "en")}: how and where to vote`,
      },
    },
    {
      // 13 Nov 2026: results, from the day of reflection to the end of the
      // day after polling day, to the guide that says when they come out and
      // where (the official link comes from elections/results-night.ts).
      id: "election-results-29n",
      start: madridMidnight(previousDay(electionDay)),
      end: endOfMadridDay(nextDay(electionDay)),
      target: "electionNight",
      text: {
        ca: `Resultats de les eleccions ${daysPhrase([electionDay], "ca").replace(/^el /, "del ")}: quan i on surten`,
        es: `Resultados de las elecciones ${daysPhrase([electionDay], "es").replace(/^el /, "del ")}: cuándo y dónde salen`,
        en: `General election results, Sunday ${shortDate(electionDay, "en")}: when and where`,
      },
    },
    {
      // 12 Nov 2026 (docs/SEO_EXPERIMENTS.md): after the election the strip
      // points at the next date most people search, the December bridge, on
      // the Spain-wide page (it sends Catalan readers on to the Catalan one).
      id: "december-bridge",
      start: endOfMadridDay(electionDay),
      end: endOfMadridDay(DECEMBER_BRIDGE_LAST_DAY),
      target: "decemberBridgeSpain",
      text: {
        ca: `Pont de desembre: on és festiu ${daysPhrase([DECEMBER_BRIDGE_MONDAY], "ca")}`,
        es: `Puente de diciembre: dónde es festivo ${daysPhrase([DECEMBER_BRIDGE_MONDAY], "es")}`,
        en: `December bridge: where it is a holiday ${daysPhrase([DECEMBER_BRIDGE_MONDAY], "en")}`,
      },
    },
  ]);
}

/**
 * The December bridge line (12 Nov 2026): Monday 7 December 2026 is the day
 * that differs between communities (BOE-A-2025-21667), and the line runs to
 * the end of Tuesday 8, the Immaculate Conception. A test holds both to the
 * Spain-wide page's own SPAIN_DAYS.
 */
export const DECEMBER_BRIDGE_MONDAY = "2026-12-07";
export const DECEMBER_BRIDGE_LAST_DAY = "2026-12-08";

/** The lines about what comes after 11N, in the order they run. */
export const NEXT_ALERT_IDS = ["strike-rail-17n", "strike-renfe-23n", "strike-education-26n", "election-29n"] as const;

/**
 * The "upcoming strikes and dates" links of the 11N pages (11 Nov 2026): the
 * strip's lines about what comes next, as markdown links in the page's
 * language, each while its last day is not past on the page's own as-of date
 * (pages are deterministic: no clock), one per guide (the first still to come).
 */
export function nextDateLinks(locale: Locale, asOf: string, alerts: readonly NewsAlert[] = NEWS_ALERTS): string[] {
  const from = Date.parse(madridMidnight(asOf));
  const seen = new Set<B2Key>();
  const links: string[] = [];
  for (const alert of alerts) {
    if (!(NEXT_ALERT_IDS as readonly string[]).includes(alert.id) || Date.parse(alert.end) <= from || seen.has(alert.target)) continue;
    seen.add(alert.target);
    links.push(`[${alert.text[locale]}](${alertHref(alert, locale)})`);
  }
  return links;
}

export const NEWS_ALERTS: readonly NewsAlert[] = buildNewsAlerts();

export function isAlertActive(alert: NewsAlert, now: number): boolean {
  return Date.parse(alert.start) <= now && now < Date.parse(alert.end);
}

export function alertHref(alert: NewsAlert, locale: Locale): string {
  return b2href(alert.target, locale);
}

/** "/ca/guies/x" and "/ca/guies/x/" are the same page. */
const samePath = (a: string, b: string) => a.replace(/\/+$/, "") === b.replace(/\/+$/, "");

/**
 * The lines to render at `now` on the page at `currentPath`: alerts in their
 * window, minus the one that links to the page itself.
 */
export function activeNewsAlerts(
  locale: Locale,
  currentPath?: string,
  now: number = Date.now(),
  alerts: readonly NewsAlert[] = NEWS_ALERTS,
): AlertLine[] {
  return alerts
    .filter((alert) => isAlertActive(alert, now))
    .map((alert) => ({ id: alert.id, href: alertHref(alert, locale), text: alert.text[locale] }))
    .filter((line) => !currentPath || !samePath(line.href, currentPath));
}

/* -------------------------------------------------------------------------- */
/* Client-side expiry                                                         */
/* -------------------------------------------------------------------------- */

/** The `<style>` the expiry script owns. */
export const EXPIRED_STYLE_ID = "ci-alerts-expired";

/**
 * The inline script for the root layout (components/NewsAlerts.tsx). It holds
 * every alert's end, decides against the reader's clock, and writes one
 * `<style>` in <head> that hides each ended line and, when no line is left,
 * the whole strip (`:has`; where it is unsupported the empty strip has no
 * height anyway). On phones (< 768 px) it also keeps only the first line that
 * has not ended (12 Nov 2026: three lines took ~210 px above the title); the
 * full list stays on wider screens, and without the script every line shows. It runs before the strip is parsed, so nothing is painted
 * and then removed; the style survives client-side navigation; and it re-runs
 * at the next end for a tab left open. A constant built from this module, no
 * stored content: CSP and tests/security.test.ts reasoning unchanged.
 */
export function newsAlertsExpiryScript(alerts: readonly NewsAlert[] = NEWS_ALERTS): string {
  const schedule = JSON.stringify(alerts.map((alert) => [alert.id, Date.parse(alert.end)]));
  return [
    "(function(){",
    `var a=${schedule},d=document;`,
    "function run(){",
    "var n=Date.now(),off=[],on=[],next=0;",
    "for(var i=0;i<a.length;i++){",
    "if(n>=a[i][1])off.push('[data-alert=\"'+a[i][0]+'\"]');",
    "else{on.push('[data-alert=\"'+a[i][0]+'\"]');if(!next||a[i][1]<next)next=a[i][1];}",
    "}",
    `var s=d.getElementById("${EXPIRED_STYLE_ID}");`,
    `if(!s){s=d.createElement("style");s.id="${EXPIRED_STYLE_ID}";d.head.appendChild(s);}`,
    "s.textContent=(off.length?off.join(',')+'{display:none}.ci-alerts:not(:has(li'+off.map(function(x){return':not('+x+')';}).join('')+')){display:none}':'')+(on.length?'@media (max-width:767.98px){.ci-alerts li:is('+on.join(',')+')~li{display:none}}':'');",
    "if(next&&next-n<2147483647)setTimeout(run,next-n+1000);",
    "}",
    "run();",
    "})();",
  ].join("");
}
