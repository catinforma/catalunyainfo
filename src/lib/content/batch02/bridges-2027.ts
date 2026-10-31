import type { Block } from "@/lib/content/blocks";
import { bestUse, distinctRuns, guideBridge, plansFor, type BestUse, type DayPlan, type Plan, type Span } from "@/lib/content/holidays/bridges";
import { WEEKDAY_NAMES, addDays, holidayOn, shortDate, weekdayIndex } from "@/lib/content/holidays/calendar";
import { SANT_JOAN_IMAGE } from "@/lib/content/holidays/images";
import { BARCELONA_LOCAL, LAST_VERIFIED, SOURCES as HOLIDAY_SOURCES, YEAR } from "@/lib/content/holidays/payload";
import { SCHOOL_VERIFIED_AT, SCHOOL_YEARS, schoolStatusOn } from "@/lib/content/school/calendar";
import type { Locale } from "@/lib/i18n/config";
import { displayName } from "@/lib/programmatic/holidays/copy";
import { NEXT_YEAR, SNAPSHOT, aranSwap, councilApproved2027, nextYearFor, regionalDays } from "@/lib/programmatic/holidays/data";
import { hasEnglishPage } from "@/lib/programmatic/holidays/english";
import { enName } from "@/lib/programmatic/holidays/english-copy";
import { caDayArticle, dayMonthYear } from "@/lib/programmatic/holidays/format";
import { joinList } from "@/lib/programmatic/holidays/names";
import { hubPath, municipalityPath } from "@/lib/programmatic/holidays/paths";
import type { SnapshotMunicipality, SourceRef } from "@/lib/programmatic/holidays/types";

import { SIBLING_PATHS, runWords } from "./december-bridge";
import { dayDate, span } from "./festive";
import { B2_PATHS, b2Related, b2link, callout, faq, h2, keyFacts, lead, list, paras, table, verifiedLine, type B2Article, type B2Source } from "./shared";

/**
 * "Ponts 2027 a Catalunya" / "Puentes 2027 en Cataluña" / "Long weekends
 * 2027 in Catalonia": every 2027 holiday, the bridge it makes and the leave it
 * takes, for the searches that peak from December to January while people
 * plan their holidays.
 *
 * Nothing on this page is typed by hand except the words around the dates:
 *
 *  - the twelve Catalonia-wide days are `regionalDays(2027)`, which reads
 *    `CATALONIA_HOLIDAYS` (Ordre EMT/52/2026, DOGC 9637, 1.4.2026), and the
 *    Aran swap is `aranSwap(2027)` (art. 1.b of the same order);
 *  - the bridges, the "best use of leave" and the local bridges are computed
 *    by `holidays/bridges.ts` from those dates;
 *  - Barcelona's two local days are `BARCELONA_LOCAL` (the city's decree);
 *  - other towns' days come from `nextYearFor` (the DOGC local order, once
 *    `prepare2027` has parsed it) or, until then, `councilApproved2027` (each
 *    council's own channel, `council-2027.ts`), printed as pending the DOGC
 *    order. The same functions switch every town page, so a republish after
 *    the order lands switches this page too;
 *  - the school dates are `SCHOOL_YEARS` (Ordre EDF/66/2026).
 *
 * The one fact read for this page: when the local order usually appears.
 * The Treball "normativa" page (read 31 Oct 2026) lists Ordre EMT/262/2024 in
 * DOGC 9320 of 31.12.2024 (2025) and Ordre EMT/208/2025, de 11 de desembre
 * (2026), which DOGC 9565 published on 17.12.2025; earlier years came out on
 * 28.12.2023, 9.12.2021, 2.12.2020, 20.12.2019 and 28.12.2018. December, then,
 * not "mid-December": the page says December and gives the last two dates.
 *
 * The Easter 2027 page is being built in parallel; this page links to its
 * planned paths (`EASTER_2027_PATHS`) and keeps its own Easter section short.
 */

/** When the local order came out, from the Treball normativa page (read 31 Oct 2026). */
export const LOCAL_ORDERS = [
  { year: 2026, order: "Ordre EMT/208/2025", dogcDate: "2025-12-17" },
  { year: 2025, order: "Ordre EMT/262/2024", dogcDate: "2024-12-31" },
] as const;
export const LOCAL_ORDERS_READ = "2026-10-31";

/** The Easter 2027 page another agent is building (31 Oct 2026). */
export const EASTER_2027_PATHS: Record<Locale, string> = {
  ca: "guies/setmana-santa-2027-catalunya",
  es: "guias/semana-santa-2027-cataluna",
  en: "guides/easter-2027-catalonia",
};

/** How many towns the local table shows, by population (Barcelona has its own section). */
export const TOWN_COUNT = 12;

/** The leave budgets of the "best use" list. */
export const BEST_USE_BUDGETS = [1, 2, 3, 4] as const;

/* -------------------------------------------------------------------------- */
/* The computed calendar                                                      */
/* -------------------------------------------------------------------------- */

export const BRIDGES_YEAR = YEAR;

const REGIONAL = regionalDays(YEAR);
export const REGIONAL_DATES: readonly string[] = REGIONAL.map((d) => d.date);
const OFF = new Set(REGIONAL_DATES);

/** One row per Catalonia-wide holiday, in date order. */
export const HOLIDAY_PLANS: DayPlan[] = plansFor(REGIONAL_DATES);
/** The different long weekends and bridges (Good Friday and Easter Monday make one). */
export const RUNS: Plan[] = distinctRuns(HOLIDAY_PLANS.map((p) => p.plan));
export const FREE_RUNS = RUNS.filter((r) => r.take.length === 0);
export const LEAVE_RUNS = RUNS.filter((r) => r.take.length > 0);
export const LOST = HOLIDAY_PLANS.filter((p) => !p.plan);
export const BRIDGE_COUNT = RUNS.length;

/** The longest run each budget of leave buys, from no leave up. */
export const BEST_USE: BestUse[] = BEST_USE_BUDGETS.map((k) => bestUse(OFF, k, YEAR));
const NO_LEAVE = bestUse(OFF, 0, YEAR);

/** The single day of leave that buys the longest run (then the earliest). */
export const BEST_ONE_DAY: Plan | null =
  [...LEAVE_RUNS].filter((r) => r.take.length === 1).sort((a, b) => b.days - a.days || a.from.localeCompare(b.from))[0] ?? null;

/** The budget where one more day of leave adds the most days off. */
export const BIGGEST_JUMP: { leave: number; gain: number; use: BestUse } = BEST_USE.reduce(
  (best, use, i) => {
    const gain = use.days - (i === 0 ? NO_LEAVE.days : BEST_USE[i - 1]!.days);
    return gain > best.gain ? { leave: use.leave, gain, use } : best;
  },
  { leave: 0, gain: -1, use: NO_LEAVE },
);

/* -------------------------------------------------------------------------- */
/* Local days                                                                 */
/* -------------------------------------------------------------------------- */

export type LocalStatus = "dogc" | "council";

export interface TownDays {
  town: SnapshotMunicipality;
  local: string[];
  status: LocalStatus;
  source: SourceRef | null;
  readOn: string | null;
}

/**
 * A town's 2027 local days: the DOGC order's once it is parsed, else the
 * council's own (pending the order), else none. The same two functions the
 * town pages use, so both switch on the same deploy.
 */
export function localDays2027(
  town: SnapshotMunicipality,
  dogc: { local: string[] } | null = nextYearFor(town.slug),
  order: { source: SourceRef | null; readOn: string | null } = { source: NEXT_YEAR.order, readOn: NEXT_YEAR.readOn },
): TownDays | null {
  if (dogc && dogc.local.length > 0) {
    return { town, local: [...dogc.local].sort(), status: "dogc", source: order.source, readOn: order.readOn };
  }
  // Null for every town once the order is parsed (`councilApproved2027`).
  const council = councilApproved2027(town.slug);
  if (council) return { town, local: [...council.local], status: "council", source: council.source, readOn: council.readOn };
  return null;
}

/** The most populous towns (Barcelona apart) whose 2027 days are known, largest first. */
export function localTowns(count = TOWN_COUNT): TownDays[] {
  return [...SNAPSHOT.municipalities]
    .sort((a, b) => a.rank - b.rank)
    .filter((m) => m.slug !== "barcelona")
    .flatMap((m) => {
      const days = localDays2027(m);
      return days ? [days] : [];
    })
    .slice(0, count);
}

const TOWNS = localTowns();
/** "council" while any listed town's days are the council's own. */
export const LOCAL_STATUS: LocalStatus = TOWNS.some((t) => t.status === "council") ? "council" : "dogc";

export const BARCELONA_PLANS: DayPlan[] = plansFor(
  BARCELONA_LOCAL.map((h) => h.date),
  REGIONAL_DATES,
);

/** Aran keeps one other day: the plans for the days whose run changes there. */
const ARAN = aranSwap(YEAR);
const ARAN_DAYS = regionalDays(YEAR, true);
export const ARAN_PLANS: DayPlan[] = (() => {
  if (!ARAN) return [];
  const plans = plansFor(ARAN_DAYS.map((d) => d.date));
  return plans.filter((p) => {
    if (p.date === ARAN.date) return true;
    const main = HOLIDAY_PLANS.find((m) => m.date === p.date)?.plan;
    return Boolean(main && p.plan && (main.from !== p.plan.from || main.to !== p.plan.to));
  });
})();

/** The oldest date any of the page's data was last read on. */
export const BRIDGES_VERIFIED: string = [LAST_VERIFIED, SCHOOL_VERIFIED_AT, LOCAL_ORDERS_READ, ...TOWNS.map((t) => t.readOn ?? LAST_VERIFIED)].sort()[0]!;

/* -------------------------------------------------------------------------- */
/* Words                                                                      */
/* -------------------------------------------------------------------------- */

const L = <T>(locale: Locale, values: Record<Locale, T>): T => values[locale];

function cap(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function daysWord(n: number, locale: Locale): string {
  return L(locale, { ca: n === 1 ? "1 dia" : `${n} dies`, es: n === 1 ? "1 día" : `${n} días`, en: n === 1 ? "1 day" : `${n} days` });
}

function leaveWord(n: number, locale: Locale): string {
  return L(locale, {
    ca: n === 1 ? "1 dia de vacances" : `${n} dies de vacances`,
    es: n === 1 ? "1 día de vacaciones" : `${n} días de vacaciones`,
    en: n === 1 ? "1 day of leave" : `${n} days of leave`,
  });
}

/** "a; b; c i d" — for items that carry commas of their own. */
function joinSemi(items: readonly string[], locale: Locale): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join("; ")}; ${L(locale, { ca: "i", es: "y", en: "and" })} ${items.at(-1)}`;
}

function joinOr(items: readonly string[], locale: Locale): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} ${locale === "en" ? "or" : "o"} ${items.at(-1)}`;
}

/** "dilluns 4 i dimarts 5 de gener"; with `article`, "el dilluns 4 i el dimarts 5 de gener". */
export function dayList(dates: readonly string[], locale: Locale, article = false): string {
  const art = article && locale !== "en" ? "el " : "";
  const weekday = (iso: string) => WEEKDAY_NAMES[locale][weekdayIndex(iso)] ?? "";
  const sameMonth = dates.every((d) => d.slice(0, 7) === dates[0]?.slice(0, 7));
  const items = dates.map((iso, i) =>
    sameMonth && i < dates.length - 1 ? `${art}${weekday(iso)} ${Number(iso.slice(8, 10))}` : `${art}${dayDate(iso, locale, false)}`,
  );
  return joinList(items, locale);
}

/** "el 7 de desembre", "l'11 d'octubre", "el 7 de diciembre", "7 December". */
function theDay(iso: string, locale: Locale): string {
  if (locale === "en") return shortDate(iso, locale);
  return `${locale === "ca" ? caDayArticle(iso) : "el "}${shortDate(iso, locale)}`;
}

/** "28 i 29 de juny", "17 de maig i 24 de setembre", "28 and 29 June". */
function datesWords(dates: readonly string[], locale: Locale): string {
  const sameMonth = dates.every((d) => d.slice(0, 7) === dates[0]?.slice(0, 7));
  return joinList(
    dates.map((d, i) => (sameMonth && i < dates.length - 1 ? String(Number(d.slice(8, 10))) : shortDate(d, locale))),
    locale,
  );
}

/** The holiday's name; `full` keeps a gloss such as "Sant Joan (St John's Day)", which reads badly inside brackets. */
function holidayName(iso: string, locale: Locale, full = false): string {
  const name = REGIONAL.find((d) => d.date === iso)?.name[locale] ?? ARAN_DAYS.find((d) => d.date === iso)?.name[locale] ?? "";
  return full ? name : name.replace(/ \(.*\)$/, "");
}

/** The Catalonia-wide holidays inside a run. */
function holidaysIn(run: Span): string[] {
  return REGIONAL_DATES.filter((d) => d >= run.from && d <= run.to);
}

/** "Setmana Santa" for a run of two holidays the guide names; otherwise the holiday's own name. */
export function runLabel(run: Plan, locale: Locale): string {
  if (run.take.length === 0 && holidaysIn(run).length > 1) {
    const guide = guideBridge(run);
    if (guide) return guide.label[locale];
    return joinList(holidaysIn(run).map((d) => holidayName(d, locale)), locale);
  }
  return holidayName(run.date, locale);
}

/** " (també festiu: Dilluns de Pasqua Florida)": the other Catalonia-wide holidays in the run. */
function alsoNote(run: Span, own: readonly string[], locale: Locale): string {
  // A holiday on a weekend adds nothing to the run, so it is not worth naming.
  const others = holidaysIn(run).filter((d) => !own.includes(d) && weekdayIndex(d) !== 0 && weekdayIndex(d) !== 6);
  if (others.length === 0) return "";
  const names = joinList(others.map((d) => holidayName(d, locale)), locale);
  return L(locale, { ca: ` (també és festiu: ${names})`, es: ` (también es festivo: ${names})`, en: ` (also a holiday: ${names})` });
}

/** "4 dies, del divendres 26 al dilluns 29 de març, sense vacances" / "…, demanant el divendres 25 de juny". */
function planPhrase(plan: Plan, own: readonly string[], locale: Locale): string {
  const run = `${daysWord(plan.days, locale)}, ${runWords(plan, locale)}${alsoNote(plan, own, locale)}`;
  if (plan.take.length === 0) return `${run}, ${L(locale, { ca: "sense vacances", es: "sin vacaciones", en: "with no leave" })}`;
  return L(locale, {
    ca: `${run}, demanant ${dayList(plan.take, "ca", true)}`,
    es: `${run}, pidiendo ${dayList(plan.take, "es", true)}`,
    en: `${run}, taking ${dayList(plan.take, "en")} off`,
  });
}

function weekendWords(iso: string, locale: Locale): string {
  const day = WEEKDAY_NAMES[locale][weekdayIndex(iso)] ?? "";
  return L(locale, { ca: `cau en ${day}`, es: `cae en ${day}`, en: `falls on a ${day}` });
}

const KIND: Record<Locale, Record<Exclude<DayPlan["kind"], "weekend">, string>> = {
  ca: { "long-weekend": "Cap de setmana llarg", bridge: "Pont d'un dia", midweek: "Pont de dimecres" },
  es: { "long-weekend": "Fin de semana largo", bridge: "Puente de un día", midweek: "Puente de miércoles" },
  en: { "long-weekend": "Long weekend", bridge: "One-day bridge", midweek: "Midweek bridge" },
};

function kindLabel(p: DayPlan, locale: Locale): string {
  if (p.kind === "weekend") return L(locale, { ca: `Perdut: ${weekendWords(p.date, "ca")}`, es: `Se pierde: ${weekendWords(p.date, "es")}`, en: `Lost: ${weekendWords(p.date, "en")}` });
  return KIND[locale][p.kind];
}

/** The twelve rows of the answer table. */
export function holidayRows(locale: Locale): string[][] {
  return HOLIDAY_PLANS.map((p) => {
    const name = holidayName(p.date, locale, true);
    const day = cap(dayDate(p.date, locale, false));
    if (!p.plan) return [name, day, kindLabel(p, locale), "—", "—"];
    const leave = p.plan.take.length === 0 ? L(locale, { ca: "Cap", es: "Ninguno", en: "None" }) : cap(dayList(p.plan.take, locale));
    const result = `${daysWord(p.plan.days, locale)}: ${runWords(p.plan, locale)}${alsoNote(p.plan, [p.date], locale)}`;
    return [name, day, kindLabel(p, locale), leave, result];
  });
}

/** "**1 dia de vacances: 5 dies seguits.** Del 25 al 29 de març (demanant …) o …". */
export function bestUseItems(locale: Locale): string[] {
  return BEST_USE.map((use) => {
    const head = L(locale, {
      ca: `**${cap(leaveWord(use.leave, "ca"))}: ${use.days} dies seguits.**`,
      es: `**${cap(leaveWord(use.leave, "es"))}: ${use.days} días seguidos.**`,
      en: `**${cap(leaveWord(use.leave, "en"))}: ${use.days} days in a row.**`,
    });
    const options = use.runs.map((r) =>
      L(locale, {
        ca: `${span(r.from, r.to, "ca")} (demanant ${dayList(r.take, "ca", true)})`,
        es: `${span(r.from, r.to, "es")} (pidiendo ${dayList(r.take, "es", true)})`,
        en: `${span(r.from, r.to, "en")} (taking ${dayList(r.take, "en")} off)`,
      }),
    );
    return `${head} ${cap(joinOr(options, locale))}.`;
  });
}

function townName(t: TownDays, locale: Locale): string {
  return locale === "en" ? enName(t.town) : displayName(t.town, locale);
}

function townLink(t: TownDays, locale: Locale): string {
  const name = townName(t, locale);
  if (locale === "en") return hasEnglishPage(t.town.slug) ? `[${name}](${municipalityPath("en", t.town.slug)})` : name;
  return `[${name}](${municipalityPath(locale, t.town.slug)})`;
}

/** "11 de maig: 4 dies, … demanant el dilluns 10 de maig; 17 de maig: 3 dies, …, sense vacances". */
function townPlans(t: TownDays, locale: Locale): string {
  const plans = plansFor(t.local, REGIONAL_DATES);
  const parts: string[] = [];
  for (const run of distinctRuns(plans.map((p) => p.plan))) {
    const own = plans.filter((p) => p.plan && p.plan.from === run.from && p.plan.to === run.to).map((p) => p.date);
    const days = datesWords(own, locale);
    parts.push(`${days}: ${planPhrase(run, t.local, locale)}`);
  }
  for (const p of plans.filter((x) => !x.plan)) parts.push(`${shortDate(p.date, locale)}: ${weekendWords(p.date, locale)}`);
  return parts.join("; ");
}

export function townRows(locale: Locale): string[][] {
  return TOWNS.map((t) => [townLink(t, locale), cap(joinList(t.local.map((d) => dayDate(d, locale, false)), locale)), cap(townPlans(t, locale))]);
}

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

/** The holiday guide's sources this page uses, the school order, and each listed town's own. */
export function bridgesSources(): B2Source[] {
  const regional = HOLIDAY_SOURCES.filter((s) => !s.name.startsWith("Ordre EMT/66/2025") && !s.url.includes("analisi.transparenciacatalunya.cat"));
  const towns = TOWNS.flatMap((t) => (t.source ? [{ name: t.source.name, url: t.source.url, publisher: t.source.ref }] : []));
  const seen = new Set<string>();
  return [...regional, ...towns].filter((s) => (seen.has(s.url) ? false : (seen.add(s.url), true)));
}

/* -------------------------------------------------------------------------- */
/* Meta                                                                       */
/* -------------------------------------------------------------------------- */

const fit = (candidates: string[], max: number) => candidates.find((c) => c.length <= max) ?? candidates.at(-1) ?? "";

/** The one-day bridges grouped by length, longest first: [[5, [7 Dec]], [4, [25 Jun, 11 Oct]]]. */
function oneDayGroups(): [number, string[]][] {
  const groups = new Map<number, string[]>();
  for (const r of LEAVE_RUNS.filter((x) => x.take.length === 1)) groups.set(r.days, [...(groups.get(r.days) ?? []), r.take[0]!]);
  return [...groups.entries()].sort((a, b) => b[0] - a[0]);
}

const BEST_FREE: Plan | undefined = [...FREE_RUNS].sort((a, b) => b.days - a.days || a.from.localeCompare(b.from))[0];

function description(locale: Locale): string {
  const groups = oneDayGroups();
  const free = BEST_FREE;
  const n = BRIDGE_COUNT;
  if (locale === "ca") {
    const parts = groups.map(([days, takes], i) => `${i === 0 ? "demanant " : ""}${joinOr(takes.map((t) => theDay(t, "ca")), "ca")}, ${i === 0 ? `${days} dies seguits` : days}`);
    const tail = free ? ` ${runLabel(free, "ca")}, ${free.days} dies sense vacances.` : "";
    return fit([`Els ${n} ponts del ${YEAR} a Catalunya: ${parts.join("; ")}.${tail}`, `Els ${n} ponts del ${YEAR} a Catalunya: ${parts.join("; ")}.`], 155);
  }
  if (locale === "es") {
    const parts = groups.map(([days, takes], i) => `${i === 0 ? "pidiendo " : ""}${joinOr(takes.map((t) => theDay(t, "es")), "es")}, ${i === 0 ? `${days} días seguidos` : days}`);
    const tail = free ? ` ${runLabel(free, "es")}, ${free.days} días sin vacaciones.` : "";
    return fit([`Los ${n} puentes de ${YEAR} en Cataluña: ${parts.join("; ")}.${tail}`, `Los ${n} puentes de ${YEAR} en Cataluña: ${parts.join("; ")}.`], 155);
  }
  const parts = groups.map(([days, takes], i) => (i === 0 ? `take ${joinOr(takes.map((t) => theDay(t, "en")), "en")} off for ${days} days in a row` : `${joinOr(takes.map((t) => theDay(t, "en")), "en")} for ${days}`));
  const tail = free ? ` ${runLabel(free, "en")}: ${free.days} days with no leave.` : "";
  return fit([`Catalonia's ${n} long weekends in ${YEAR}: ${parts.join("; ")}.${tail}`, `Catalonia's ${n} long weekends in ${YEAR}: ${parts.join("; ")}.`], 155);
}

export const BRIDGES_2027_PATHS: Record<Locale, string> = B2_PATHS.bridges2027;

export const BRIDGES_2027_META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: BRIDGES_2027_PATHS.ca,
    title: `Ponts ${YEAR} a Catalunya: els ${BRIDGE_COUNT} ponts, quins dies de vacances demanar i les festes locals`,
    seoTitle: fit([`Ponts ${YEAR} a Catalunya: els ${BRIDGE_COUNT} ponts i com aprofitar-los`, `Ponts ${YEAR} a Catalunya: els ${BRIDGE_COUNT} ponts`], 60),
    seoDescription: description("ca"),
    excerpt: `Els ponts del ${YEAR} a Catalunya, festiu a festiu: quins dies demanar, quants dies seguits surten, Barcelona i les festes locals de les grans ciutats.`,
  },
  es: {
    path: BRIDGES_2027_PATHS.es,
    title: `Puentes ${YEAR} en Cataluña: los ${BRIDGE_COUNT} puentes, qué días de vacaciones pedir y las fiestas locales`,
    seoTitle: fit(
      [`Puentes ${YEAR} en Cataluña: los ${BRIDGE_COUNT} puentes y cómo aprovecharlos`, `Puentes ${YEAR} en Cataluña: los ${BRIDGE_COUNT} puentes y qué días pedir`, `Puentes ${YEAR} en Cataluña: los ${BRIDGE_COUNT} puentes`],
      60,
    ),
    seoDescription: description("es"),
    excerpt: `Los puentes de ${YEAR} en Cataluña, festivo a festivo: qué días pedir, cuántos días seguidos salen, Barcelona y las fiestas locales de las grandes ciudades.`,
  },
  en: {
    path: BRIDGES_2027_PATHS.en,
    title: `Long weekends ${YEAR} in Catalonia: all ${BRIDGE_COUNT}, which days of leave to book and local holidays`,
    seoTitle: fit([`Long weekends ${YEAR} in Catalonia: all ${BRIDGE_COUNT} and the days to book`, `Long weekends ${YEAR} in Catalonia: all ${BRIDGE_COUNT}`], 60),
    seoDescription: description("en"),
    excerpt: `Catalonia's ${YEAR} long weekends, holiday by holiday: which days of leave to book, how many days off in a row, Barcelona and the main towns' local holidays.`,
  },
};

/* -------------------------------------------------------------------------- */
/* Body                                                                       */
/* -------------------------------------------------------------------------- */

const RELATED = ["workCalendar", "decemberBridge", "holidayToday", "shops", "ski", "climate"] as const;

function easterHref(locale: Locale): string {
  return `/${locale}/${EASTER_2027_PATHS[locale]}/`;
}

function sibling(key: "school" | "local", locale: Locale, label: string): string {
  return `[${label}](/${locale}/${SIBLING_PATHS[key][locale]}/)`;
}

function answerTable(locale: Locale): Block {
  const caption = L(locale, {
    ca: `Festius del ${YEAR} a Catalunya: el pont que fa cadascun i els dies de vacances`,
    es: `Festivos de ${YEAR} en Cataluña: el puente que hace cada uno y los días de vacaciones`,
    en: `Catalonia's ${YEAR} public holidays: the long weekend each one makes and the leave it takes`,
  });
  const headers = L(locale, {
    ca: ["Festiu", "Dia", "Què permet", "Vacances per demanar", "Dies seguits de festa"],
    es: ["Festivo", "Día", "Qué permite", "Vacaciones que pedir", "Días seguidos de fiesta"],
    en: ["Holiday", "Day", "What it gives", "Leave to book", "Days off in a row"],
  });
  const note = L(locale, {
    ca: "Font: Ordre EMT/52/2026 (DOGC de l'1 d'abril de 2026). Càlcul de CatalunyaInfo per a una setmana de dilluns a divendres; no inclou les festes locals ni substitueix el calendari de la teva empresa.",
    es: "Fuente: Orden EMT/52/2026 (DOGC del 1 de abril de 2026). Cálculo de CatalunyaInfo para una semana de lunes a viernes; no incluye las fiestas locales ni sustituye el calendario de tu empresa.",
    en: "Source: Order EMT/52/2026 (DOGC, 1 April 2026). CatalunyaInfo's calculation for a Monday-to-Friday week; it leaves out local holidays and does not replace your employer's calendar.",
  });
  return table(caption, headers, holidayRows(locale), note);
}

function townTable(locale: Locale): Block {
  const council = LOCAL_STATUS === "council";
  const caption = council
    ? L(locale, {
        ca: `Festes locals ${YEAR} aprovades pels ajuntaments, pendents de l'ordre del DOGC`,
        es: `Fiestas locales ${YEAR} aprobadas por los ayuntamientos, pendientes de la orden del DOGC`,
        en: `${YEAR} local holidays approved by the councils, pending the DOGC order`,
      })
    : L(locale, { ca: `Festes locals ${YEAR} segons l'ordre del DOGC`, es: `Fiestas locales ${YEAR} según la orden del DOGC`, en: `${YEAR} local holidays in the DOGC order` });
  const headers = L(locale, {
    ca: ["Municipi", `Festes locals ${YEAR}`, "Ponts que afegeixen"],
    es: ["Municipio", `Fiestas locales ${YEAR}`, "Puentes que añaden"],
    en: ["Town", `Local holidays ${YEAR}`, "Long weekends they add"],
  });
  const reads = [...new Set(TOWNS.map((t) => t.readOn).filter((d): d is string => Boolean(d)))].sort();
  const read = reads.length ? dayMonthYear(reads.at(-1)!, locale) : "";
  const note = council
    ? L(locale, {
        ca: `Font: el web, la seu electrònica o l'acta de cada ajuntament, consultats el ${read}. Ponts calculats per a una setmana de dilluns a divendres, amb els festius de tot Catalunya.`,
        es: `Fuente: la web, la sede electrónica o el acta de cada ayuntamiento, consultados el ${read}. Puentes calculados para una semana de lunes a viernes, con los festivos de toda Cataluña.`,
        en: `Source: each council's website, e-office or minutes, read on ${read}. Long weekends calculated for a Monday-to-Friday week, with the Catalonia-wide holidays.`,
      })
    : L(locale, {
        ca: `Font: ${NEXT_YEAR.order?.name ?? "ordre de festes locals"}. Ponts calculats per a una setmana de dilluns a divendres, amb els festius de tot Catalunya.`,
        es: `Fuente: ${NEXT_YEAR.order?.name ?? "orden de fiestas locales"}. Puentes calculados para una semana de lunes a viernes, con los festivos de toda Cataluña.`,
        en: `Source: ${NEXT_YEAR.order?.name ?? "local holidays order"}. Long weekends calculated for a Monday-to-Friday week, with the Catalonia-wide holidays.`,
      });
  return table(caption, headers, townRows(locale), note);
}

/** "la del 2026 va sortir el 17 de desembre de 2025, i la del 2025, el 31 de desembre de 2024". */
function ordersLine(locale: Locale): string {
  const [last, before] = LOCAL_ORDERS;
  const d = (iso: string) => dayMonthYear(iso, locale);
  return L(locale, {
    ca: `la del ${last.year} va sortir el ${d(last.dogcDate)}, i la del ${before.year}, el ${d(before.dogcDate)}`,
    es: `la de ${last.year} salió el ${d(last.dogcDate)}, y la de ${before.year}, el ${d(before.dogcDate)}`,
    en: `the ${last.year} order came out on ${d(last.dogcDate)}, and the ${before.year} one on ${d(before.dogcDate)}`,
  });
}

function bodyParts(locale: Locale) {
  const n = BRIDGE_COUNT;
  const free = FREE_RUNS.length;
  const paid = LEAVE_RUNS.length;
  const best = BEST_ONE_DAY;
  const jump = BIGGEST_JUMP.use.runs.length === 1 ? BIGGEST_JUMP : null;
  const jumpRun = jump?.use.runs[0] ?? null;
  const allSaturdays = LOST.every((p) => weekdayIndex(p.date) === 6);
  const lostList = joinList(LOST.map((p) => `${shortDate(p.date, locale)} (${holidayName(p.date, locale)})`), locale);
  const leaveCounts = [...new Set(LEAVE_RUNS.map((r) => r.take.length))].sort();
  const freeList = joinList(FREE_RUNS.map((r) => `${span(r.from, r.to, locale)} (${runLabel(r, locale)})`), locale);
  const paidList = joinList(LEAVE_RUNS.map((r) => `${theDay(r.date, locale)} (${runLabel(r, locale)}, ${leaveWord(r.take.length, locale)})`), locale);
  const towns = TOWNS;
  const bcnAllFree = BARCELONA_PLANS.every((p) => p.plan && p.plan.take.length === 0);
  const bcnItems = BARCELONA_PLANS.map((p) => {
    const name = (BARCELONA_LOCAL.find((h) => h.date === p.date)?.name[locale] ?? "").replace(/ \(.*\)$/, "");
    const day = cap(dayDate(p.date, locale, false));
    return `**${day}** (${name}): ${p.plan ? planPhrase(p.plan, BARCELONA_LOCAL.map((h) => h.date), locale) : weekendWords(p.date, locale)}`;
  });
  const bcnHref = locale === "en" ? (hasEnglishPage("barcelona") ? municipalityPath("en", "barcelona") : hubPath("en")) : municipalityPath(locale, "barcelona");
  const bcnFaq = joinList(
    BARCELONA_PLANS.map((p) => {
      const day = `${locale === "en" ? "" : "el "}${dayDate(p.date, locale, false)}`;
      if (!p.plan) return `${day} (${weekendWords(p.date, locale)})`;
      const how =
        p.plan.take.length === 0
          ? L(locale, { ca: "sense vacances", es: "sin vacaciones", en: "with no leave" })
          : L(locale, { ca: `demanant ${dayList(p.plan.take, "ca", true)}`, es: `pidiendo ${dayList(p.plan.take, "es", true)}`, en: `taking ${dayList(p.plan.take, "en")} off` });
      return `${day} (${daysWord(p.plan.days, locale)}, ${how})`;
    }),
    locale,
  );
  const aranItems = ARAN_PLANS.map((p) => `**${holidayName(p.date, locale)}** (${dayDate(p.date, locale, false)}): ${p.plan ? planPhrase(p.plan, [p.date], locale) : weekendWords(p.date, locale)}`);

  // School: what the order says about the days the bridges ask for.
  const current = SCHOOL_YEARS.find((y) => y.easter[0].startsWith(String(YEAR)));
  const next = SCHOOL_YEARS.find((y) => y.start.startsWith(String(YEAR)));
  const easterMatch = current
    ? (BEST_USE.flatMap((u) => u.runs).find((r) => r.from === current.easter[0] && r.to === current.easter[1]) ?? null)
    : null;
  const takes = LEAVE_RUNS.flatMap((r) => r.take.map((iso) => ({ iso, run: r })));
  const inChristmas = takes.filter(({ iso }) => schoolStatusOn(iso).kind === "christmas");
  const inSummer = takes.filter(({ iso }) => schoolStatusOn(iso).kind === "summer");
  const inTerm = takes.filter(({ iso }) => schoolStatusOn(iso).kind === "term");

  const goodFriday = REGIONAL.find((d) => d.name.en === "Good Friday");
  const easterMonday = REGIONAL.find((d) => d.name.en === "Easter Monday");
  const easterRun = goodFriday ? (HOLIDAY_PLANS.find((p) => p.date === goodFriday.date)?.plan ?? null) : null;
  const maundy = goodFriday ? addDays(goodFriday.date, -1) : null;
  const maundyWorking = maundy ? holidayOn(maundy) === null : false;

  const midweekOne = HOLIDAY_PLANS.find((p) => p.kind === "midweek" && p.plan?.take.length === 1);
  const december = HOLIDAY_PLANS.filter((p) => p.date.slice(5, 7) === "12");
  const decemberOn = december.filter((p) => p.plan);
  const decemberBest = [...decemberOn].map((p) => p.plan!).filter((p) => p.take.length > 0).sort((a, b) => a.take.length - b.take.length || b.days - a.days)[0];

  return { n, free, paid, best, jump, jumpRun, allSaturdays, lostList, leaveCounts, freeList, paidList, towns, bcnAllFree, bcnItems, bcnFaq, bcnHref, aranItems, current, next, easterMatch, inChristmas, inSummer, inTerm, goodFriday, easterMonday, easterRun, maundy, maundyWorking, midweekOne, decemberOn, decemberBest };
}

export function buildBridgesBody(locale: Locale): Block[] {
  const x = bodyParts(locale);
  const count = REGIONAL_DATES.length;
  const council = LOCAL_STATUS === "council";
  const order = NEXT_YEAR.order;
  const local = sibling("local", locale, L(locale, { ca: "festius locals de tots els municipis", es: "festivos locales de todos los municipios", en: "local holidays in every town" }));
  const school = sibling("school", locale, L(locale, { ca: "calendari escolar", es: "calendario escolar", en: "school calendar" }));
  const easter = `[${L(locale, { ca: `Setmana Santa ${YEAR} a Catalunya`, es: `Semana Santa ${YEAR} en Cataluña`, en: `Easter ${YEAR} in Catalonia` })}](${easterHref(locale)})`;
  const work = b2link("workCalendar", locale, L(locale, { ca: `calendari laboral ${YEAR}`, es: `calendario laboral ${YEAR}`, en: `Catalonia public holidays ${YEAR}` }));
  const numberWords = L(locale, { ca: ["cap", "un", "dos", "tres", "quatre"], es: ["ninguno", "uno", "dos", "tres", "cuatro"], en: ["no", "one", "two", "three", "four"] });
  const leaveRange = joinOr(x.leaveCounts.map((c) => numberWords[c] ?? String(c)), locale);
  const weekendWord = x.allSaturdays ? L(locale, { ca: "en dissabte", es: "en sábado", en: "on a Saturday" }) : L(locale, { ca: "en cap de setmana", es: "en fin de semana", en: "at a weekend" });
  const bestLine = x.best
    ? L(locale, {
        ca: ` El dia de vacances que més rendeix és ${dayList(x.best.take, "ca", true)}: ${x.best.days} dies seguits, ${runWords(x.best, "ca")}.`,
        es: ` El día de vacaciones que más rinde es ${dayList(x.best.take, "es", true)}: ${x.best.days} días seguidos, ${runWords(x.best, "es")}.`,
        en: ` The day of leave that goes furthest is ${dayList(x.best.take, "en")}: ${x.best.days} days in a row, ${runWords(x.best, "en")}.`,
      })
    : "";
  const jumpLine =
    x.jump && x.jumpRun
      ? L(locale, {
          ca: `El salt més gran arriba amb ${leaveWord(x.jump.leave, "ca")}: demanant ${dayList(x.jumpRun.take, "ca", true)} tens ${x.jumpRun.days} dies seguits, ${runWords(x.jumpRun, "ca")}, ${x.jump.gain} més que amb un dia menys.`,
          es: `El salto más grande llega con ${leaveWord(x.jump.leave, "es")}: pidiendo ${dayList(x.jumpRun.take, "es", true)} tienes ${x.jumpRun.days} días seguidos, ${runWords(x.jumpRun, "es")}, ${x.jump.gain} más que con un día menos.`,
          en: `The biggest jump comes with ${leaveWord(x.jump.leave, "en")}: taking ${dayList(x.jumpRun.take, "en")} off gives ${x.jumpRun.days} days in a row, ${runWords(x.jumpRun, "en")}, ${x.jump.gain} more than with one day fewer.`,
        })
      : "";
  const bestUseShort = joinSemi(
    BEST_USE.map((u, i) =>
      L(locale, {
        ca: i === 0 ? `amb ${leaveWord(u.leave, "ca")}, ${u.days} dies seguits` : `amb ${u.leave}, ${u.days}`,
        es: i === 0 ? `con ${leaveWord(u.leave, "es")}, ${u.days} días seguidos` : `con ${u.leave}, ${u.days}`,
        en: i === 0 ? `with ${leaveWord(u.leave, "en")}, ${u.days} days in a row` : `with ${u.leave}, ${u.days}`,
      }),
    ),
    locale,
  );
  const decemberHolidays = joinList(x.decemberOn.map((p) => `${locale === "en" ? "" : "el "}${dayDate(p.date, locale, false)} (${holidayName(p.date, locale)})`), locale);
  const decemberLine = x.decemberBest
    ? L(locale, {
        ca: ` Demanant ${dayList(x.decemberBest.take, "ca", true)} tens ${x.decemberBest.days} dies seguits, ${runWords(x.decemberBest, "ca")}.`,
        es: ` Pidiendo ${dayList(x.decemberBest.take, "es", true)} tienes ${x.decemberBest.days} días seguidos, ${runWords(x.decemberBest, "es")}.`,
        en: ` Taking ${dayList(x.decemberBest.take, "en")} off gives ${x.decemberBest.days} days in a row, ${runWords(x.decemberBest, "en")}.`,
      })
    : "";
  const verified = verifiedLine(locale, BRIDGES_VERIFIED);
  const ordersFact = ordersLine(locale);
  const townCount = x.towns.length;

  // School sentences, each only if the dates bear it out.
  const schoolParas: string[] = [];
  if (x.current) {
    const [e0, e1] = x.current.easter;
    schoolParas.push(
      L(locale, {
        ca: `Les vacances escolars de Setmana Santa del curs ${x.current.label} van ${span(e0, e1, "ca")}, tots dos inclosos, segons l'Ordre EDF/66/2026.${x.easterMatch ? ` Coincideixen amb els ${x.easterMatch.days} dies seguits que tens demanant ${dayList(x.easterMatch.take, "ca", true)}.` : ""}`,
        es: `Las vacaciones escolares de Semana Santa del curso ${x.current.label} van ${span(e0, e1, "es")}, ambos incluidos, según la Orden EDF/66/2026.${x.easterMatch ? ` Coinciden con los ${x.easterMatch.days} días seguidos que tienes pidiendo ${dayList(x.easterMatch.take, "es", true)}.` : ""}`,
        en: `School Easter holidays in the ${x.current.label} year run from ${span(e0, e1, "en")}, both included, under Order EDF/66/2026.${x.easterMatch ? ` They match the ${x.easterMatch.days} days in a row you get by taking ${dayList(x.easterMatch.take, "en")} off.` : ""}`,
      }),
    );
    const christmasEnd = x.current.christmas[1];
    if (x.inChristmas.length > 0) {
      const days = dayList(x.inChristmas.map((t) => t.iso), locale, true);
      const name = holidayName(x.inChristmas[0]!.run.date, locale);
      schoolParas.push(
        L(locale, {
          ca: `Les de Nadal acaben el ${dayDate(christmasEnd, "ca", false)}: els dies de vacances del pont de ${name}, ${days}, encara són vacances escolars.`,
          es: `Las de Navidad terminan el ${dayDate(christmasEnd, "es", false)}: los días de vacaciones del puente de ${name}, ${days}, aún son vacaciones escolares.`,
          en: `The Christmas holidays end on ${dayDate(christmasEnd, "en", false)}: the days of leave for the ${name} bridge, ${days}, are still school holidays.`,
        }),
      );
    }
    if (x.inSummer.length > 0) {
      const days = dayList(x.inSummer.map((t) => t.iso), locale, true);
      const name = holidayName(x.inSummer[0]!.run.date, locale);
      schoolParas.push(
        L(locale, {
          ca: `El curs acaba el ${dayDate(x.current.end, "ca", false)} a infantil, primària i ESO, així que ${days}, el dia de pont de ${name}, ja no hi ha classe.`,
          es: `El curso termina el ${dayDate(x.current.end, "es", false)} en infantil, primaria y ESO, así que ${days}, el día de puente de ${name}, ya no hay clase.`,
          en: `The school year ends on ${dayDate(x.current.end, "en", false)} for infant, primary and ESO pupils, so there is no school on ${days}, the ${name} bridge day.`,
        }),
      );
    }
  }
  if (x.next) {
    const termDays = x.inTerm.length > 0 ? dayList(x.inTerm.map((t) => t.iso), locale, true) : "";
    schoolParas.push(
      L(locale, {
        ca: `El curs ${x.next.label} comença el ${dayDate(x.next.start, "ca", false)} i les vacances de Nadal, el ${dayDate(x.next.christmas[0], "ca", false)}.${termDays ? ` Si hi ha classe els dies de pont que cauen en període lectiu, ${termDays}, depèn de cada escola` : " Els dies sense classe dins del curs depenen de cada escola"}: cada centre fixa quatre dies de lliure disposició per curs, i el consell escolar municipal proposa quins convindria que fessin totes les escoles del municipi. Varien d'una escola i d'un municipi a l'altre, així que cal preguntar-ho a l'escola o a l'ajuntament. Tot el curs, al ${school}.`,
        es: `El curso ${x.next.label} empieza el ${dayDate(x.next.start, "es", false)} y las vacaciones de Navidad, el ${dayDate(x.next.christmas[0], "es", false)}.${termDays ? ` Si hay clase los días de puente que caen en periodo lectivo, ${termDays}, depende de cada colegio` : " Los días sin clase dentro del curso dependen de cada colegio"}: cada centro fija cuatro días de libre disposición por curso, y el consejo escolar municipal propone cuáles convendría que hicieran todos los colegios del municipio. Varían de un colegio y de un municipio a otro, así que hay que preguntarlo en el colegio o en el ayuntamiento. Todo el curso, en el ${school}.`,
        en: `The ${x.next.label} school year starts on ${dayDate(x.next.start, "en", false)} and its Christmas holidays on ${dayDate(x.next.christmas[0], "en", false)}.${termDays ? ` Whether there is school on the bridge days that fall in term, ${termDays}, depends on each school` : " Days off within the year depend on each school"}: every school sets four free-choice days a year, and the town's school council suggests days all its schools should share. They vary from school to school and town to town, so ask the school or the town council. The whole year is in the ${school}.`,
      }),
    );
  }

  const easterPara =
    x.goodFriday && x.easterMonday && x.easterRun
      ? L(locale, {
          ca: `El ${dayDate(x.goodFriday.date, "ca", false)} (Divendres Sant) i el ${dayDate(x.easterMonday.date, "ca", false)} (Dilluns de Pasqua Florida) són festius a tot Catalunya, excepte el dilluns a l'Aran: Setmana Santa fa ${x.easterRun.days} dies seguits sense vacances, ${runWords(x.easterRun, "ca")}.${x.maundyWorking && x.maundy ? ` El Dijous Sant, ${shortDate(x.maundy, "ca")}, no és festiu a Catalunya.` : ""} Tot sobre Setmana Santa, a ${easter}.`,
          es: `El ${dayDate(x.goodFriday.date, "es", false)} (Viernes Santo) y el ${dayDate(x.easterMonday.date, "es", false)} (Lunes de Pascua Florida) son festivos en toda Cataluña, salvo el lunes en Arán: Semana Santa hace ${x.easterRun.days} días seguidos sin vacaciones, ${runWords(x.easterRun, "es")}.${x.maundyWorking && x.maundy ? ` El Jueves Santo, ${shortDate(x.maundy, "es")}, no es festivo en Cataluña.` : ""} Todo sobre Semana Santa, en ${easter}.`,
          en: `${cap(dayDate(x.goodFriday.date, "en", false))} (Good Friday) and ${dayDate(x.easterMonday.date, "en", false)} (Easter Monday) are public holidays across Catalonia, except the Monday in Aran: Easter makes ${x.easterRun.days} days off in a row with no leave, ${runWords(x.easterRun, "en")}.${x.maundyWorking && x.maundy ? ` Maundy Thursday, ${shortDate(x.maundy, "en")}, is not a holiday in Catalonia.` : ""} Everything about Easter is in ${easter}.`,
        })
      : "";

  const midweekNote = x.midweekOne?.plan
    ? L(locale, {
        ca: ` Si el dia que caldria demanar ja és festiu, no compta: per això ${theDay(x.midweekOne.date, "ca")}, que cau en dimecres, només cal demanar ${dayList(x.midweekOne.plan.take, "ca", true)}.`,
        es: ` Si el día que habría que pedir ya es festivo, no cuenta: por eso ${theDay(x.midweekOne.date, "es")}, que cae en miércoles, solo hace falta pedir ${dayList(x.midweekOne.plan.take, "es", true)}.`,
        en: ` If a day you would have to book is already a holiday, it does not count: that is why ${theDay(x.midweekOne.date, "en")}, a Wednesday, needs only ${dayList(x.midweekOne.plan.take, "en")}.`,
      })
    : "";

  const localFaq = council
    ? L(locale, {
        ca: `Les fixa una ordre del Departament d'Empresa i Treball al DOGC, que surt al desembre: ${ordersFact}. Fins llavors, la llista completa no és oficial. Barcelona ja ha fixat les seves, i molts altres ajuntaments també, pendents de l'ordre: les de les grans ciutats són més amunt.`,
        es: `Las fija una orden del Departament d'Empresa i Treball en el DOGC, que sale en diciembre: ${ordersFact}. Hasta entonces, la lista completa no es oficial. Barcelona ya ha fijado las suyas, y muchos otros ayuntamientos también, pendientes de la orden: las de las grandes ciudades están más arriba.`,
        en: `An order of the Catalan labour department sets them in the DOGC, Catalonia's official gazette, in December: ${ordersFact}. Until then the full list is not official. Barcelona has set its days, and many other councils have approved theirs pending the order: the largest towns' are above.`,
      })
    : L(locale, {
        ca: `Ja s'han publicat: les fixa l'${order?.name ?? "ordre de festes locals"} (${order?.ref ?? "DOGC"}).`,
        es: `Ya se han publicado: las fija la ${order?.name ?? "orden de fiestas locales"} (${order?.ref ?? "DOGC"}).`,
        en: `They are out: ${order?.name ?? "the local holidays order"} (${order?.ref ?? "DOGC"}) sets them.`,
      });

  const localIntro = council
    ? L(locale, {
        ca: `Fora de Barcelona, les festes locals del ${YEAR} encara no són oficials: **la llista completa de tots els municipis arriba amb l'ordre del DOGC**, que el Departament d'Empresa i Treball publica al desembre (${ordersFact}). Molts ajuntaments ja han aprovat les seves. Aquestes són les dels ${townCount} municipis més poblats que ho han fet, **pendents de l'ordre del DOGC**, i els ponts que hi afegeixen:`,
        es: `Fuera de Barcelona, las fiestas locales de ${YEAR} aún no son oficiales: **la lista completa de todos los municipios llega con la orden del DOGC**, que el Departament d'Empresa i Treball publica en diciembre (${ordersFact}). Muchos ayuntamientos ya han aprobado las suyas. Estas son las de los ${townCount} municipios más poblados que lo han hecho, **pendientes de la orden del DOGC**, y los puentes que añaden:`,
        en: `Outside Barcelona, the ${YEAR} local holidays are not official yet: **the full list for every town comes with the DOGC order**, which the Catalan labour department publishes in December (${ordersFact}). Many councils have already approved theirs. These are the ${townCount} largest towns that have, **pending the DOGC order**, and the long weekends they add:`,
      })
    : L(locale, {
        ca: `Les festes locals del ${YEAR} ja són oficials: les fixa l'${order?.name ?? "ordre de festes locals"} (${order?.ref ?? "DOGC"}). Aquestes són les dels ${townCount} municipis més poblats després de Barcelona, i els ponts que hi afegeixen:`,
        es: `Las fiestas locales de ${YEAR} ya son oficiales: las fija la ${order?.name ?? "orden de fiestas locales"} (${order?.ref ?? "DOGC"}). Estas son las de los ${townCount} municipios más poblados después de Barcelona, y los puentes que añaden:`,
        en: `The ${YEAR} local holidays are official: ${order?.name ?? "the local holidays order"} (${order?.ref ?? "DOGC"}) sets them. These are the ${townCount} largest towns after Barcelona, and the long weekends they add:`,
      });

  const localOutro = L(locale, {
    ca: `Cada municipi té la seva pàgina, amb tots els festius de l'any: la resta, a [festius locals per municipi](${hubPath("ca")}), i en una sola llista a ${local}.${council ? " Hi posarem les dates oficials quan surti l'ordre." : ""}`,
    es: `Cada municipio tiene su página, con todos los festivos del año: el resto, en [festivos locales por municipio](${hubPath("es")}), y en una sola lista en ${local}.${council ? " Pondremos las fechas oficiales cuando salga la orden." : ""}`,
    en: `The largest towns and the main resorts have a page each, with every holiday of the year, in [public holidays town by town](${hubPath("en")}); every town is in ${local}.${council ? " We will add the official dates when the order is out." : ""}`,
  });

  if (locale === "ca") {
    return [
      lead(
        `**El ${YEAR} hi ha ${x.n} ponts a Catalunya per a qui treballa de dilluns a divendres: ${x.free} caps de setmana llargs sense demanar cap dia de vacances i ${x.paid} ponts que es fan demanant-ne ${leaveRange}.** ${LOST.length} dels ${count} festius cauen ${weekendWord} i no sumen cap dia lliure.${bestLine}`,
      ),
      keyFacts(`Els ponts del ${YEAR}, d'un cop d'ull`, [
        { label: "Festius a tot Catalunya", value: String(count) },
        { label: "Caps de setmana llargs sense vacances", value: `${x.free}: ${x.freeList}` },
        { label: "Ponts amb vacances", value: `${x.paid}: ${x.paidList}` },
        { label: `Festius que cauen ${weekendWord}`, value: `${LOST.length}: ${x.lostList}` },
        ...(x.best ? [{ label: "El dia de vacances que més rendeix", value: `${cap(dayList(x.best.take, "ca"))}: ${x.best.days} dies seguits` }] : []),
        ...(x.jump && x.jumpRun ? [{ label: `Amb ${leaveWord(x.jump.leave, "ca")}`, value: `${x.jumpRun.days} dies seguits, ${span(x.jumpRun.from, x.jumpRun.to, "ca")}` }] : []),
        { label: "Festes locals", value: council ? "2 per municipi; la llista oficial, amb l'ordre del DOGC (al desembre)" : `2 per municipi, segons l'${order?.name ?? "ordre del DOGC"}` },
      ]),
      callout(
        "official",
        "D'on surten aquests ponts",
        `Els dotze festius són els de l'Ordre EMT/52/2026 (DOGC de l'1 d'abril de 2026), el calendari oficial de festes laborals de Catalunya del ${YEAR}. Els ponts els calculem a partir d'aquestes dates, festiu a festiu, amb la mateixa regla per a tots; no hi ha cap data escrita a mà.`,
      ),
      ...h2(`Tots els festius del ${YEAR} i el pont que fa cadascun`, `Els ${count} festius de tot Catalunya, el dia de la setmana en què cauen, què permeten i quants dies de vacances cal demanar per allargar-los:`),
      answerTable("ca"),
      ...h2(
        "Amb quants dies de vacances, quants dies seguits de festa",
        `El màxim de dies seguits sense treballar que dona el ${YEAR} per a cada nombre de dies de vacances, amb els festius de tot Catalunya, i totes les maneres d'aconseguir-lo:`,
      ),
      list(...bestUseItems("ca")),
      ...paras(
        ...(jumpLine ? [jumpLine] : []),
        "És un càlcul, no un dret: les vacances es demanen i es pacten amb l'empresa, i els torns, els convenis i les festes locals ho poden canviar tot.",
      ),
      ...h2(
        "Barcelona: dos ponts més amb les festes locals",
        `L'Ajuntament de Barcelona ja ha fixat les seves dues festes locals del ${YEAR}, així que la ciutat en té ${count + BARCELONA_LOCAL.length}.${x.bcnAllFree ? " Totes dues fan cap de setmana llarg sense demanar cap dia:" : " Aquests són els ponts que hi afegeixen:"}`,
      ),
      list(...x.bcnItems),
      ...paras(`Tots els festius de la ciutat, dia a dia, a [festius de Barcelona](${x.bcnHref}).`),
      ...h2("Els ponts de les festes locals a les grans ciutats", localIntro),
      townTable("ca"),
      ...paras(localOutro),
      ...(x.aranItems.length > 0 && ARAN
        ? [
            ...h2(
              "I a l'Aran?",
              `A l'Aran, la ${holidayName(ARAN.date, "ca")} (${dayDate(ARAN.date, "ca", false)}) substitueix el ${holidayName(ARAN.replaces, "ca")} (${shortDate(ARAN.replaces, "ca")}). Això hi canvia aquests ponts:`,
            ),
            list(...x.aranItems),
          ]
        : []),
      ...h2("I l'escola? Vacances escolars i dies de lliure disposició", ...schoolParas),
      ...(easterPara ? h2(`Setmana Santa ${YEAR}`, easterPara) : []),
      ...h2(
        "Com ho hem calculat",
        `Per a cada festiu de tot Catalunya mirem el dia de la setmana. En dilluns o divendres fa un cap de setmana llarg sense demanar res; en dimarts o dijous, un pont amb un dia de vacances (el dilluns abans o el divendres després); en dimecres, en calen dos per tenir-ne cinc de seguits, i en dissabte o diumenge es perd.${midweekNote}`,
        `Tot pressuposa una setmana laboral de dilluns a divendres. Per als dotze festius i la descàrrega per al calendari, mira el ${work}.`,
      ),
      faq([
        { question: `Quants ponts hi ha el ${YEAR} a Catalunya?`, answer: `${x.n}. Sense vacances, ${x.free} caps de setmana llargs: ${x.freeList}. Amb vacances, ${x.paid} ponts: ${x.paidList}. ${LOST.length} festius més cauen ${weekendWord}.` },
        ...(x.best ? [{ question: `Quin és el millor pont del ${YEAR}?`, answer: `Si només pots demanar un dia, ${dayList(x.best.take, "ca", true)}: ${x.best.days} dies seguits, ${runWords(x.best, "ca")}.${jumpLine ? ` ${jumpLine}` : ""}` }] : []),
        { question: `Quins festius del ${YEAR} cauen ${weekendWord}?`, answer: `${cap(x.lostList)}. Per a qui treballa de dilluns a divendres no sumen cap dia lliure, i el calendari oficial no els passa a cap altre dia.` },
        ...(x.decemberOn.length > 0 ? [{ question: `Hi ha pont al desembre del ${YEAR}?`, answer: `Sí: ${x.decemberOn.length === 1 ? "és festiu" : "són festius"} ${decemberHolidays}.${decemberLine}` }] : []),
        { question: `Quan es publiquen les festes locals del ${YEAR}?`, answer: localFaq },
        { question: `Quins ponts té Barcelona el ${YEAR}?`, answer: `Els de tot Catalunya i ${BARCELONA_PLANS.filter((p) => p.plan).length} més amb les festes locals: ${x.bcnFaq}.` },
        { question: `Quants dies de vacances calen per fer més dies de festa el ${YEAR}?`, answer: `${cap(bestUseShort)}. Totes les combinacions són a la llista de més amunt.` },
      ]),
      ...paras(verified),
      ...b2Related([...RELATED], "ca"),
    ];
  }

  if (locale === "es") {
    return [
      lead(
        `**En ${YEAR} hay ${x.n} puentes en Cataluña para quien trabaja de lunes a viernes: ${x.free} fines de semana largos sin pedir ningún día de vacaciones y ${x.paid} puentes que se hacen pidiendo ${leaveRange}.** ${LOST.length} de los ${count} festivos caen ${weekendWord} y no suman ningún día libre.${bestLine}`,
      ),
      keyFacts(`Los puentes de ${YEAR}, de un vistazo`, [
        { label: "Festivos en toda Cataluña", value: String(count) },
        { label: "Fines de semana largos sin vacaciones", value: `${x.free}: ${x.freeList}` },
        { label: "Puentes con vacaciones", value: `${x.paid}: ${x.paidList}` },
        { label: `Festivos que caen ${weekendWord}`, value: `${LOST.length}: ${x.lostList}` },
        ...(x.best ? [{ label: "El día de vacaciones que más rinde", value: `${cap(dayList(x.best.take, "es"))}: ${x.best.days} días seguidos` }] : []),
        ...(x.jump && x.jumpRun ? [{ label: `Con ${leaveWord(x.jump.leave, "es")}`, value: `${x.jumpRun.days} días seguidos, ${span(x.jumpRun.from, x.jumpRun.to, "es")}` }] : []),
        { label: "Fiestas locales", value: council ? "2 por municipio; la lista oficial, con la orden del DOGC (en diciembre)" : `2 por municipio, según la ${order?.name ?? "orden del DOGC"}` },
      ]),
      callout(
        "official",
        "De dónde salen estos puentes",
        `Los doce festivos son los de la Orden EMT/52/2026 (DOGC del 1 de abril de 2026), el calendario oficial de fiestas laborales de Cataluña de ${YEAR}. Los puentes los calculamos a partir de esas fechas, festivo a festivo, con la misma regla para todos; no hay ninguna fecha escrita a mano.`,
      ),
      ...h2(`Todos los festivos de ${YEAR} y el puente que hace cada uno`, `Los ${count} festivos de toda Cataluña, el día de la semana en que caen, qué permiten y cuántos días de vacaciones hay que pedir para alargarlos:`),
      answerTable("es"),
      ...h2(
        "Con cuántos días de vacaciones, cuántos días seguidos de fiesta",
        `El máximo de días seguidos sin trabajar que da ${YEAR} para cada número de días de vacaciones, con los festivos de toda Cataluña, y todas las maneras de conseguirlo:`,
      ),
      list(...bestUseItems("es")),
      ...paras(
        ...(jumpLine ? [jumpLine] : []),
        "Es un cálculo, no un derecho: las vacaciones se piden y se pactan con la empresa, y los turnos, los convenios y las fiestas locales pueden cambiarlo todo.",
      ),
      ...h2(
        "Barcelona: dos puentes más con las fiestas locales",
        `El Ayuntamiento de Barcelona ya ha fijado sus dos fiestas locales de ${YEAR}, así que la ciudad tiene ${count + BARCELONA_LOCAL.length}.${x.bcnAllFree ? " Las dos hacen fin de semana largo sin pedir ningún día:" : " Estos son los puentes que añaden:"}`,
      ),
      list(...x.bcnItems),
      ...paras(`Todos los festivos de la ciudad, día a día, en [festivos de Barcelona](${x.bcnHref}).`),
      ...h2("Los puentes de las fiestas locales en las grandes ciudades", localIntro),
      townTable("es"),
      ...paras(localOutro),
      ...(x.aranItems.length > 0 && ARAN
        ? [
            ...h2(
              "¿Y en Arán?",
              `En Arán, la ${holidayName(ARAN.date, "es")} (${dayDate(ARAN.date, "es", false)}) sustituye al ${holidayName(ARAN.replaces, "es")} (${shortDate(ARAN.replaces, "es")}). Eso cambia estos puentes:`,
            ),
            list(...x.aranItems),
          ]
        : []),
      ...h2("¿Y el colegio? Vacaciones escolares y días de libre disposición", ...schoolParas),
      ...(easterPara ? h2(`Semana Santa ${YEAR}`, easterPara) : []),
      ...h2(
        "Cómo lo hemos calculado",
        `Para cada festivo de toda Cataluña miramos el día de la semana. En lunes o viernes hace un fin de semana largo sin pedir nada; en martes o jueves, un puente con un día de vacaciones (el lunes antes o el viernes después); en miércoles, hacen falta dos para tener cinco seguidos, y en sábado o domingo se pierde.${midweekNote}`,
        `Todo presupone una semana laboral de lunes a viernes. Para los doce festivos y la descarga para el calendario, mira el ${work}.`,
      ),
      faq([
        { question: `¿Cuántos puentes hay en ${YEAR} en Cataluña?`, answer: `${x.n}. Sin vacaciones, ${x.free} fines de semana largos: ${x.freeList}. Con vacaciones, ${x.paid} puentes: ${x.paidList}. ${LOST.length} festivos más caen ${weekendWord}.` },
        ...(x.best ? [{ question: `¿Cuál es el mejor puente de ${YEAR}?`, answer: `Si solo puedes pedir un día, ${dayList(x.best.take, "es", true)}: ${x.best.days} días seguidos, ${runWords(x.best, "es")}.${jumpLine ? ` ${jumpLine}` : ""}` }] : []),
        { question: `¿Qué festivos de ${YEAR} caen ${weekendWord}?`, answer: `${cap(x.lostList)}. Para quien trabaja de lunes a viernes no suman ningún día libre, y el calendario oficial no los pasa a ningún otro día.` },
        ...(x.decemberOn.length > 0 ? [{ question: `¿Hay puente en diciembre de ${YEAR}?`, answer: `Sí: ${x.decemberOn.length === 1 ? "es festivo" : "son festivos"} ${decemberHolidays}.${decemberLine}` }] : []),
        { question: `¿Cuándo se publican las fiestas locales de ${YEAR}?`, answer: localFaq },
        { question: `¿Qué puentes tiene Barcelona en ${YEAR}?`, answer: `Los de toda Cataluña y ${BARCELONA_PLANS.filter((p) => p.plan).length} más con las fiestas locales: ${x.bcnFaq}.` },
        { question: `¿Cuántos días de vacaciones hacen falta para tener más días de fiesta en ${YEAR}?`, answer: `${cap(bestUseShort)}. Todas las combinaciones están en la lista de más arriba.` },
      ]),
      ...paras(verified),
      ...b2Related([...RELATED], "es"),
    ];
  }

  return [
    lead(
      `**In ${YEAR} Catalonia has ${x.n} long weekends for anyone who works Monday to Friday: ${x.free} that need no leave at all and ${x.paid} bridges that take ${leaveRange} ${x.leaveCounts.at(-1) === 1 ? "day" : "days"} of leave.** ${LOST.length} of the ${count} public holidays fall ${weekendWord} and add no day off.${bestLine}`,
    ),
    keyFacts(`${YEAR} long weekends at a glance`, [
      { label: "Catalonia-wide public holidays", value: String(count) },
      { label: "Long weekends with no leave", value: `${x.free}: ${x.freeList}` },
      { label: "Bridges that take leave", value: `${x.paid}: ${x.paidList}` },
      { label: `Holidays that fall ${weekendWord}`, value: `${LOST.length}: ${x.lostList}` },
      ...(x.best ? [{ label: "The day of leave that goes furthest", value: `${dayList(x.best.take, "en")}: ${x.best.days} days in a row` }] : []),
      ...(x.jump && x.jumpRun ? [{ label: `With ${leaveWord(x.jump.leave, "en")}`, value: `${x.jumpRun.days} days in a row, ${span(x.jumpRun.from, x.jumpRun.to, "en")}` }] : []),
      { label: "Local holidays", value: council ? "2 per town; the official list comes with the DOGC order (in December)" : `2 per town, in ${order?.name ?? "the DOGC order"}` },
    ]),
    callout(
      "official",
      "Where these long weekends come from",
      `The twelve holidays are those of Order EMT/52/2026 (DOGC, Catalonia's official gazette, 1 April 2026), Catalonia's official ${YEAR} holiday calendar. We calculate the long weekends from those dates, holiday by holiday, with the same rule for all of them; no date is typed by hand.`,
    ),
    ...h2(`Every ${YEAR} public holiday and the long weekend it makes`, `Catalonia's ${count} public holidays, the day of the week each falls on, what it gives and how much leave it takes to stretch it:`),
    answerTable("en"),
    ...h2(
      "How many days of leave, how many days off in a row",
      `The most days off in a row that ${YEAR} gives for each number of days of leave, with the Catalonia-wide holidays, and every way to get them:`,
    ),
    list(...bestUseItems("en")),
    ...paras(
      ...(jumpLine ? [jumpLine] : []),
      "This is a calculation, not an entitlement: leave has to be requested and agreed with your employer, and shifts, collective agreements and local holidays can change everything.",
    ),
    ...h2(
      "Barcelona: two more long weekends from its local holidays",
      `Barcelona city council has set its two ${YEAR} local holidays, so the city has ${count + BARCELONA_LOCAL.length} public holidays.${x.bcnAllFree ? " Both make a long weekend with no leave:" : " These are the long weekends they add:"}`,
    ),
    list(...x.bcnItems),
    ...paras(`Every Barcelona holiday, day by day, is in [Barcelona public holidays](${x.bcnHref}).`),
    ...h2("Local-holiday long weekends in the largest towns", localIntro),
    townTable("en"),
    ...paras(localOutro),
    ...(x.aranItems.length > 0 && ARAN
      ? [
          ...h2(
            "What about Aran?",
            `In Aran, the ${holidayName(ARAN.date, "en")} (${dayDate(ARAN.date, "en", false)}) replaces ${holidayName(ARAN.replaces, "en")} (${shortDate(ARAN.replaces, "en")}). That changes these long weekends there:`,
          ),
          list(...x.aranItems),
        ]
      : []),
    ...h2("What about school? School holidays and free-choice days", ...schoolParas),
    ...(easterPara ? h2(`Easter ${YEAR}`, easterPara) : []),
    ...h2(
      "How we calculated it",
      `For each Catalonia-wide holiday we look at the day of the week. On a Monday or a Friday it makes a long weekend with no leave; on a Tuesday or a Thursday, a bridge with one day of leave (the Monday before or the Friday after); on a Wednesday it takes two to get five days in a row; and on a Saturday or a Sunday it is lost.${midweekNote}`,
      `All of it assumes a Monday-to-Friday working week. For the twelve holidays and a calendar file to download, see ${work}.`,
    ),
    faq([
      { question: `How many long weekends are there in ${YEAR} in Catalonia?`, answer: `${x.n}. With no leave, ${x.free} long weekends: ${x.freeList}. With leave, ${x.paid} bridges: ${x.paidList}. ${LOST.length} more holidays fall ${weekendWord}.` },
      ...(x.best ? [{ question: `What is the best long weekend of ${YEAR}?`, answer: `If you can take only one day, make it ${dayList(x.best.take, "en")}: ${x.best.days} days in a row, ${runWords(x.best, "en")}.${jumpLine ? ` ${jumpLine}` : ""}` }] : []),
      { question: `Which ${YEAR} holidays fall ${weekendWord}?`, answer: `${cap(x.lostList)}. For a Monday-to-Friday worker they add no day off, and the official calendar does not move them to another day.` },
      ...(x.decemberOn.length > 0 ? [{ question: `Is there a long weekend in December ${YEAR}?`, answer: `Yes: ${decemberHolidays} ${x.decemberOn.length === 1 ? "is a public holiday" : "are public holidays"}.${decemberLine}` }] : []),
      { question: `When are the ${YEAR} local holidays published?`, answer: localFaq },
      { question: `What long weekends does Barcelona have in ${YEAR}?`, answer: `The Catalonia-wide ones and ${BARCELONA_PLANS.filter((p) => p.plan).length} more from its local holidays: ${x.bcnFaq}.` },
      { question: `How many days of leave do I need for the most days off in ${YEAR}?`, answer: `${cap(bestUseShort)}. Every combination is in the list above.` },
    ]),
    ...paras(verified),
    ...b2Related([...RELATED], "en"),
  ];
}

export const BRIDGES_2027: B2Article = {
  key: "bridges2027",
  entryKey: "guide-bridges-2027-catalonia",
  categoryKey: "calendar",
  sources: bridgesSources(),
  // The holiday guide's Sant Joan photograph, with its alt text and caption
  // (media rows are keyed by file): Sant Joan is one of the year's bridges.
  heroKey: SANT_JOAN_IMAGE.key,
  heroAlt: SANT_JOAN_IMAGE.alt,
  heroCaption: SANT_JOAN_IMAGE.caption,
  verifiedAt: BRIDGES_VERIFIED,
  publishedAt: "2026-10-31T12:00:00+01:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...BRIDGES_2027_META[locale], blocks: buildBridgesBody(locale) }]),
  ) as B2Article["editions"],
};
