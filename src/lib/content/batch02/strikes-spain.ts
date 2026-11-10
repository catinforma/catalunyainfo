import type { Block } from "@/lib/content/blocks";

import { dateYear, dayDate } from "./festive";
import {
  B2_TITLES,
  RELATED_HEADING,
  b2href,
  b2link,
  callout,
  faq,
  keyFacts,
  lead,
  list,
  paras,
  table,
  verifiedLine,
  type B2Source,
  type B2SpanishArticle,
} from "./shared";
import { CITY_HERO, regionalOrderPublished } from "./strike-11n-cities";
import { CITIES, CITY_STATE_URLS, STATE_SERVICES } from "./strike-11n-cities-data";
import type { StateService, Strike11nCity } from "./strike-11n-cities-model";
import { strike11nCityHref } from "./strike-11n-city-paths";
import { STRIKES, STRIKE_URLS, isUpcoming as isCatalanUpcoming, strikeDays as catalanDays, type Strike } from "./strikes";
import { SPAIN_FRAMEWORK_SOURCES, SPAIN_SECTOR_STATUS, SPAIN_STRIKES, STRIKES_SPAIN_AS_OF, STRIKES_SPAIN_VERIFIED } from "./strikes-spain-data";
import type { SpainMinimumServices, SpainSectorStatus, SpainStrike, SpainStrikeSector } from "./strikes-spain-model";
import { STRIKES_SPAIN_PATH } from "./strikes-spain-path";

/**
 * "Huelgas en España": the Spain-wide strikes calendar, one evergreen Spanish
 * URL (/es/guias/huelgas-espana/) with one dated section per state-wide or
 * multi-region strike. Past strikes move to a compact "recientes" list, so
 * the URL keeps its authority from one strike to the next (6 Nov 2026).
 *
 * Why: strikes were the site's first traffic source in November 2026. The
 * Spanish 11N page took 30k impressions and 2.8k clicks in one day, mostly
 * from place-less, Spain-wide queries, and Spain-wide strike demand is about
 * five times Catalonia's. The Catalan hub (`strikes.ts`) answers for
 * Catalonia only; this page answers "huelgas noviembre 2026", "huelga hoy",
 * "próximas huelgas España", "huelga médicos / renfe / educación <mes>".
 *
 * Discipline (fact pack: research_notes/x10/huelgas-espana-factpack.md):
 *  - Every call is read on the organiser's own site; minimum services only
 *    from the BOE, the regional bulletins and the ministries' own lists.
 *    Nothing the press reports and no official or organiser page says.
 *  - A call that only exists in the organiser's statement, with no
 *    registered call in any source, is printed as "anunciada, sin
 *    convocatoria registrada", with the statement linked.
 *  - The general strike of 11 Nov reads its minimum services from the 11N
 *    city pages' data and the Catalan hub, so the three never disagree.
 *  - Legal basis only from the BOE (Constitución art. 28.2, RDL 17/1977).
 *
 * HOW TO UPDATE (facts live in `strikes-spain-data.ts`, the file the strike
 * watch edits; this file is the page):
 *  - Every check: re-read each organiser and the official lists (BOE summary,
 *    the Ministry of Transport's rail and air lists), then move
 *    STRIKES_SPAIN_AS_OF to the day you checked. A test fails 4 days after it.
 *  - New state-wide or multi-region strike: add an entry to SPAIN_STRIKES
 *    (dates, hours, organiser's notice in `calledBy` and `sources`,
 *    minimum services "pending" with who sets them and where). Only on the
 *    organiser's own notice; "anunciada" if no source says it is registered.
 *  - Minimum services out: set `minimumServices.status` ("partial" or
 *    "published"), rewrite `short` and `text` with the order's own figures
 *    and its link, add the order to `sources`.
 *  - Doctors, schools, the courts, Correos: SPAIN_SECTOR_STATUS says where
 *    each stands when it has no dated strike (the doctors' state-wide strike
 *    is postponed, not called off). Re-read and re-date those lines too.
 *  - 11N: nothing to do here; fill the slot in `strike-11n-cities-data.ts`
 *    (or `strikes.ts` for Catalonia) and this page follows.
 *  - A strike also in the Catalan hub (`catalanEntry`): change its days in
 *    both files (a test keeps them in step).
 *  - The day after a strike's last day it moves to "recientes" by itself once
 *    STRIKES_SPAIN_AS_OF passes it (a test fails until you move the date). A
 *    past strike may not stay "pending": record what was published, or "none".
 *  - Deploy, then publish `?only=huelgas-espana`.
 */

export { STRIKES_SPAIN_AS_OF, STRIKES_SPAIN_VERIFIED };

/* -------------------------------------------------------------------------- */
/* Date logic (deterministic: only STRIKES_SPAIN_AS_OF decides what is shown) */
/* -------------------------------------------------------------------------- */

type Dated = Pick<SpainStrike, "dates" | "indefinite">;

export function isOpen(strike: Dated): boolean {
  return Boolean(strike.indefinite) && !strike.indefinite?.endedOn;
}

export function lastDay(strike: Dated): string {
  return strike.indefinite?.endedOn ?? strike.dates[strike.dates.length - 1] ?? "";
}

/** Upcoming or under way on `asOf`; past from the day after its last day. An open indefinite strike is never past. */
export function isUpcoming(strike: Dated, asOf: string): boolean {
  return isOpen(strike) || lastDay(strike) >= asOf;
}

/** Whether `asOf` is a day of action. */
export function isOnDay(strike: Dated, asOf: string): boolean {
  if (strike.indefinite) return (strike.dates[0] ?? "") <= asOf && (isOpen(strike) || asOf <= lastDay(strike));
  return strike.dates.includes(asOf);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86_400_000);
}

const byFirstDay = (a: SpainStrike, b: SpainStrike) => (a.dates[0] ?? "").localeCompare(b.dates[0] ?? "");

export function upcomingSpainStrikes(asOf: string = STRIKES_SPAIN_AS_OF, strikes: SpainStrike[] = SPAIN_STRIKES): SpainStrike[] {
  return strikes.filter((strike) => isUpcoming(strike, asOf)).sort(byFirstDay);
}

export function pastSpainStrikes(asOf: string = STRIKES_SPAIN_AS_OF, strikes: SpainStrike[] = SPAIN_STRIKES): SpainStrike[] {
  return strikes.filter((strike) => !isUpcoming(strike, asOf)).sort((a, b) => lastDay(b).localeCompare(lastDay(a)));
}

/** Strikes still shown as upcoming although their last day is before `today`. */
export function staleSpainStrikes(today: string, asOf: string = STRIKES_SPAIN_AS_OF, strikes: SpainStrike[] = SPAIN_STRIKES): SpainStrike[] {
  return upcomingSpainStrikes(asOf, strikes).filter((strike) => !isOpen(strike) && lastDay(strike) < today);
}

/** The page must be re-checked against the sources at least this often: a test fails this many days after STRIKES_SPAIN_AS_OF. */
export const STRIKES_SPAIN_MAX_AGE_DAYS = 4;

export function isHubStale(today: string, asOf: string = STRIKES_SPAIN_AS_OF): boolean {
  return daysBetween(asOf, today) >= STRIKES_SPAIN_MAX_AGE_DAYS;
}

/** At most this many past strikes are listed under "recientes"; older ones drop off. */
export const RECENT_LIMIT = 8;

/* -------------------------------------------------------------------------- */
/* Wording                                                                    */
/* -------------------------------------------------------------------------- */

const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const monthName = (iso: string) => MONTHS[Number(iso.slice(5, 7)) - 1] ?? "";
const dayNumber = (iso: string) => String(Number(iso.slice(8, 10)));
const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const strip = (text: string) => text.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

/** "a y b"; from three on, "a, b y c". */
export function andList(items: string[]): string {
  return items.length <= 2 ? items.join(" y ") : `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

function consecutive(dates: string[]): boolean {
  return dates.every((iso, index) => index === 0 || daysBetween(dates[index - 1]!, iso) === 1);
}

/**
 * "martes 10 de noviembre de 2026 y jueves 12 de noviembre de 2026" is long:
 * "martes 10 y jueves 12 de noviembre de 2026", the month said once after its
 * last day; three or more days in a row, "del lunes 14 al viernes 18 de
 * diciembre de 2026"; an indefinite strike, "desde el miércoles 28 de octubre
 * de 2026" (or "del … al …" once it has ended).
 */
export function spainDays(strike: Dated, withYear = true): string {
  const year = (iso: string) => (withYear ? ` de ${iso.slice(0, 4)}` : "");
  if (strike.indefinite) {
    // Always with the year: an indefinite strike may have begun months ago.
    const first = strike.dates[0] ?? "";
    const end = strike.indefinite.endedOn;
    if (!end) return `desde el ${dayDate(first, "es")}`;
    return `del ${dayDate(first, "es", first.slice(0, 4) !== end.slice(0, 4))} al ${dayDate(end, "es")}`;
  }
  const { dates } = strike;
  const first = dates[0] ?? "";
  const last = dates[dates.length - 1] ?? "";
  if (dates.length >= 3 && consecutive(dates)) {
    const firstPart = first.slice(0, 7) === last.slice(0, 7) ? dayDate(first, "es", false).replace(/ de \S+$/, "") : dayDate(first, "es", false);
    return `del ${firstPart} al ${dayDate(last, "es", false)}${year(last)}`;
  }
  // Group by month: "martes 10 y jueves 12 de noviembre".
  const groups: string[][] = [];
  for (const iso of dates) {
    const group = groups[groups.length - 1];
    if (group && group[0]!.slice(0, 7) === iso.slice(0, 7)) group.push(iso);
    else groups.push([iso]);
  }
  return andList(
    groups.map((group, index) => {
      const days = andList(group.map((iso) => dayDate(iso, "es", false).replace(/ de \S+$/, "")));
      const lastOfGroup = group[group.length - 1]!;
      return `${days} de ${monthName(lastOfGroup)}${index === groups.length - 1 ? year(lastOfGroup) : ""}`;
    }),
  );
}

/** For the meta description: "el 10 y el 12 de noviembre", "desde el 28 de octubre". */
function shortDays(strike: Dated): string {
  if (strike.indefinite && !strike.indefinite.endedOn) {
    const first = strike.dates[0] ?? "";
    return `desde el ${dayNumber(first)} de ${monthName(first)}`;
  }
  const groups: string[][] = [];
  for (const iso of strike.dates) {
    const group = groups[groups.length - 1];
    if (group && group[0]!.slice(0, 7) === iso.slice(0, 7)) group.push(iso);
    else groups.push([iso]);
  }
  return andList(groups.map((group) => `${andList(group.map((iso) => `el ${dayNumber(iso)}`))} de ${monthName(group[group.length - 1]!)}`));
}

/** The months the title and the month questions speak of. */
export interface TitleMonths {
  /** "noviembre 2026", "noviembre y diciembre 2026", "diciembre 2026 y enero 2027". */
  short: string;
  /** "noviembre de 2026", "noviembre y diciembre de 2026", "diciembre de 2026 y enero de 2027". */
  long: string;
  /** "2026-11", and "2026-12" from the 20th. */
  months: string[];
}

function nextMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number) as [number, number];
  return month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, "0")}`;
}

/**
 * The time token of the title: the month of STRIKES_SPAIN_AS_OF, and from the
 * 20th the next one too, when people start searching for it ("huelgas
 * diciembre 2026").
 */
export function titleMonths(asOf: string = STRIKES_SPAIN_AS_OF): TitleMonths {
  const current = asOf.slice(0, 7);
  const name = (ym: string) => MONTHS[Number(ym.slice(5, 7)) - 1] ?? "";
  const year = (ym: string) => ym.slice(0, 4);
  if (Number(asOf.slice(8, 10)) < 20) {
    return { short: `${name(current)} ${year(current)}`, long: `${name(current)} de ${year(current)}`, months: [current] };
  }
  const next = nextMonth(current);
  if (year(next) === year(current)) {
    return { short: `${name(current)} y ${name(next)} ${year(current)}`, long: `${name(current)} y ${name(next)} de ${year(current)}`, months: [current, next] };
  }
  return {
    short: `${name(current)} ${year(current)} y ${name(next)} ${year(next)}`,
    long: `${name(current)} de ${year(current)} y ${name(next)} de ${year(next)}`,
    months: [current, next],
  };
}

export const SEO_TITLE_LIMIT = 60;
export const DESCRIPTION_LIMIT = 155;

function firstFit(candidates: string[], limit: number): string {
  return candidates.find((candidate) => candidate.length <= limit) ?? candidates[candidates.length - 1]!;
}

/**
 * The searched words with the month: "Huelgas en España en noviembre 2026:
 * calendario y mínimos". CTR lesson of 6 Nov 2026 (docs/SEO_EXPERIMENTS.md):
 * a title that promises the per-date detail a snippet cannot hold ("calendario")
 * beats one that tries to carry the answer; the dates go in the description.
 */
export function strikesSpainSeoTitle(asOf: string = STRIKES_SPAIN_AS_OF): string {
  const { short } = titleMonths(asOf);
  return firstFit(
    [
      `Huelgas en España en ${short}: calendario y servicios mínimos`,
      `Huelgas en España en ${short}: calendario y mínimos`,
      `Huelgas en España en ${short}: calendario`,
      `Huelgas en España ${short}: calendario`,
      `Huelgas ${short} en España`,
    ],
    SEO_TITLE_LIMIT,
  );
}

/** The H1. */
export function strikesSpainTitle(asOf: string = STRIKES_SPAIN_AS_OF): string {
  return `Huelgas en España en ${titleMonths(asOf).long}: calendario, huelgas de hoy y servicios mínimos`;
}

export const STRIKES_SPAIN_EXCERPT =
  "Las huelgas convocadas en toda España, por fecha: las de hoy y las próximas, quién las convoca, su horario y los servicios mínimos oficiales, con el enlace a cada boletín.";

/**
 * Which strikes the meta description names first: the ones most people
 * search for (a general strike, then trains, doctors, schools...), then by
 * date. A long-running strike at a few airports does not push Renfe out.
 */
const SECTOR_WEIGHT: Record<SpainStrikeSector, number> = { general: 0, rail: 1, health: 2, education: 3, postal: 4, justice: 5, road: 6, air: 7 };

function descriptionRank(strike: SpainStrike): number[] {
  return [SECTOR_WEIGHT[strike.sector]];
}

/**
 * "Huelgas en España: Renfe el 10 y el 12 de noviembre, huelga general el 11
 * de noviembre… Hoy y próximas, con servicios mínimos.": as many upcoming
 * strikes as fit in 155 characters, general strikes first, printed in date
 * order; with none upcoming, the evergreen line.
 */
export function strikesSpainDescription(asOf: string = STRIKES_SPAIN_AS_OF, strikes: SpainStrike[] = SPAIN_STRIKES): string {
  const prefix = "Huelgas en España: ";
  const base = "Hoy y próximas, con servicios mínimos.";
  const fallback = "Calendario de huelgas en España: las de hoy y las próximas, quién las convoca y los servicios mínimos oficiales de cada una, con su boletín.";
  const ranked = [...upcomingSpainStrikes(asOf, strikes)].sort((a, b) => {
    const ra = descriptionRank(a);
    const rb = descriptionRank(b);
    for (let i = 0; i < ra.length; i += 1) if (ra[i] !== rb[i]) return (ra[i] ?? 0) - (rb[i] ?? 0);
    return byFirstDay(a, b);
  });
  const compose = (picked: SpainStrike[]) => `${prefix}${[...picked].sort(byFirstDay).map((s) => `${s.label} ${shortDays(s)}`).join(", ")}. ${base}`;
  const chosen: SpainStrike[] = [];
  for (const strike of ranked) {
    if (compose([...chosen, strike]).length <= DESCRIPTION_LIMIT) chosen.push(strike);
  }
  return chosen.length > 0 ? compose(chosen) : fallback;
}

/* -------------------------------------------------------------------------- */
/* The general strike's minimum services, read from the 11N pages' data       */
/* -------------------------------------------------------------------------- */

const U = { ...STRIKE_URLS, ...CITY_STATE_URLS };
const link = (href: string, label: string) => `[${label}](${href})`;
const STRIKE_11N_ID = "vaga-general-2026-11-11";

/** The ES 11N page, which covers Catalonia. */
const CATALONIA_11N = `[Cataluña](${b2href("strike11n", "es")})`;

/**
 * The 11N minimum services across Spain: the Generalitat's order (Catalan
 * hub's entry), each city's regional order (strike-11n-cities-data.ts), the
 * State's trains and flights, and the BOE's private-security and Correos
 * orders, which are out already.
 */
export function strike11nMinimumServices(
  checked: string,
  cities: Strike11nCity[] = CITIES,
  state: Record<"rail" | "air", StateService> = STATE_SERVICES,
  catalanStrikes: Strike[] = STRIKES,
): SpainMinimumServices {
  const catalonia = catalanStrikes.find((strike) => strike.id === STRIKE_11N_ID)?.minimumServices.status === "published";
  const published = cities.filter(regionalOrderPublished);
  const pendingCities = cities.filter((city) => !regionalOrderPublished(city));
  const regionsOut = [...(catalonia ? [CATALONIA_11N] : []), ...published.map((city) => `[${city.name}](${strike11nCityHref(city.key)})`)];
  const regionsOutPlain = [...(catalonia ? ["Cataluña"] : []), ...published.map((city) => city.name)];
  const regionsMissing = [...(catalonia ? [] : ["Cataluña"]), ...pendingCities.map((city) => city.name)];
  const stateOut = (["rail", "air"] as const).filter((key) => state[key].status === "published");
  const stateMissing = (["rail", "air"] as const).filter((key) => state[key].status !== "published");
  const stateName = { rail: "los trenes de Renfe", air: "los vuelos" } as const;

  const all = regionsMissing.length === 0 && stateMissing.length === 0;
  const none = regionsOut.length === 0 && stateOut.length === 0;
  const status = all ? "published" : none ? "pending" : "partial";

  const boe = `El BOE ya ha publicado los de la seguridad privada (el 90% del personal de seguridad en los transportes públicos, según ${link(U.securityOrder, "la resolución de la Secretaría de Estado de Seguridad")}) y los de Correos para el voto por correo (${link(U.correosOrder, "Orden INT/1170/2026")}).`;
  const statePieces = stateOut.map((key) => `**${cap(stateName[key])}:** ${state[key].text}`);
  const missingPieces = [
    ...(regionsMissing.length > 0 ? [`los de ${andList(regionsMissing)}`] : []),
    ...(stateMissing.length > 0
      ? [
          `los de ${andList(stateMissing.map((key) => stateName[key]))}, que fija el Ministerio de Transportes en sus listas de resoluciones ${andList([
            ...(stateMissing.includes("rail") ? [link(U.ministryRail, "ferroviarias")] : []),
            ...(stateMissing.includes("air") ? [link(U.ministryAir, "del transporte aéreo")] : []),
          ])}`,
        ]
      : []),
  ];

  const text = [
    status === "pending"
      ? `**Aún no publicados** (consultado el ${checked}). Los fija cada gobierno para los servicios que dependen de él: las comunidades autónomas, su transporte, su sanidad y sus colegios; el Ministerio de Transportes, los trenes de Renfe y los vuelos.`
      : status === "published"
        ? `**Publicados** (consultado el ${checked}): ${andList(regionsOut)}, con el detalle servicio por servicio en cada página.`
        : `**Publicados en parte** (consultado el ${checked}). Ya hay servicios mínimos para ${andList(regionsOut)}, fijados por sus gobiernos autonómicos, con el detalle servicio por servicio en cada página.`,
    ...statePieces,
    missingPieces.length > 0 ? `Aún faltan ${andList(missingPieces)}.` : "",
    boe,
  ]
    .filter(Boolean)
    .join(" ");

  const stateShort = { rail: "trenes", air: "vuelos" } as const;
  const missingShort = [...(regionsMissing.length > 0 ? ["otras comunidades"] : []), ...(stateMissing.length > 0 ? [andList(stateMissing.map((key) => stateShort[key]))] : [])];
  const short =
    status === "pending"
      ? "Aún no publicados"
      : status === "published"
        ? "Publicados en todas las comunidades y en trenes y vuelos"
        : `Publicados en ${andList([...regionsOutPlain, ...stateOut.map((key) => stateShort[key])])}; pendientes en ${missingShort.join(" y en ")}`;
  return { status, short, text };
}

/** The strike's minimum services, resolved. */
export function msOf(strike: SpainStrike, checked: string): SpainMinimumServices {
  return strike.minimumServices === "strike11n" ? strike11nMinimumServices(checked) : strike.minimumServices;
}

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

/** The 11N general strike's State-level sources (the BOE orders and the Ministry's lists), plus any State resolution once out. */
function strike11nSources(state: Record<"rail" | "air", StateService> = STATE_SERVICES): B2Source[] {
  return [
    ...(["rail", "air"] as const).flatMap((key) => (state[key].status === "published" && state[key].source ? [state[key].source!] : [])),
    {
      name: "Resolución de 30 de octubre de 2026, de la Secretaría de Estado de Seguridad: personal de seguridad privada en los servicios esenciales durante la huelga general del 11 de noviembre de 2026 (BOE núm. 274, 4 de noviembre)",
      url: U.securityOrder,
      publisher: "BOE",
    },
    {
      name: "Orden INT/1170/2026, de 5 de noviembre: servicios esenciales en Correos durante las huelgas del 11 de noviembre de 2026 (BOE, 6 de noviembre)",
      url: U.correosOrder,
      publisher: "BOE",
    },
    { name: "Resoluciones de servicios mínimos ferroviarios", url: U.ministryRail, publisher: "Ministerio de Transportes y Movilidad Sostenible" },
    { name: "Resoluciones de servicios mínimos (transporte aéreo)", url: U.ministryAir, publisher: "Ministerio de Transportes y Movilidad Sostenible" },
  ];
}

/** Every source the page cites, once: each listed strike's, the sectors' statuses, then the framework. */
export function strikesSpainSources(strikes: SpainStrike[] = SPAIN_STRIKES, sectors: SpainSectorStatus[] = SPAIN_SECTOR_STATUS): B2Source[] {
  const seen = new Set<string>();
  const all: B2Source[] = [];
  const shown = [...upcomingSpainStrikes(STRIKES_SPAIN_AS_OF, strikes), ...pastSpainStrikes(STRIKES_SPAIN_AS_OF, strikes).slice(0, RECENT_LIMIT)];
  for (const source of [
    ...shown.flatMap((strike) => [...strike.sources, ...(strike.minimumServices === "strike11n" ? strike11nSources() : [])]),
    ...sectors.flatMap((sector) => sector.sources),
    ...SPAIN_FRAMEWORK_SOURCES,
  ]) {
    if (seen.has(source.url)) continue;
    seen.add(source.url);
    all.push({ name: source.name, url: source.url, publisher: source.publisher ?? null });
  }
  return all;
}

/* -------------------------------------------------------------------------- */
/* Body                                                                       */
/* -------------------------------------------------------------------------- */

function heading(level: 2 | 3, text: string, id?: string): Block {
  return { type: "heading", level, text, ...(id ? { id } : {}) } as Block;
}

/** "(anunciada, sin convocatoria registrada)" after the title of an announced strike. */
const ANNOUNCED = "anunciada, sin convocatoria registrada";
const titleOf = (strike: SpainStrike) => (strike.call === "anunciada" ? `${strike.title} (${ANNOUNCED})` : strike.title);

/** The searched sector words, for the FAQ: "¿Hay huelga de médicos en noviembre de 2026?". */
const SECTOR_QUESTIONS: { sector: SpainStrikeSector; catalan: Strike["scope"][]; question: string; noun: string }[] = [
  { sector: "health", catalan: ["health"], question: "huelga de médicos", noun: "de médicos o de la sanidad" },
  { sector: "rail", catalan: ["rail"], question: "huelga de Renfe", noun: "de trenes (Renfe, Adif u otras operadoras)" },
  { sector: "education", catalan: ["education"], question: "huelga de educación", noun: "en la educación" },
  { sector: "postal", catalan: [], question: "huelga de Correos", noun: "en Correos" },
  { sector: "justice", catalan: [], question: "huelga en la justicia", noun: "en la justicia" },
];

/** Catalan hub entries that are not also one of this page's strikes: the Catalonia-only ones. */
function catalanOnly(asOf: string, strikes: SpainStrike[]): Strike[] {
  const mirrored = new Set(strikes.flatMap((strike) => (strike.catalanEntry ? [strike.catalanEntry] : [])));
  return STRIKES.filter((strike) => !mirrored.has(strike.id) && isCatalanUpcoming(strike, asOf)).sort((a, b) => (a.dates[0] ?? "").localeCompare(b.dates[0] ?? ""));
}

const inMonth = (strike: Dated, ym: string) =>
  strike.indefinite ? (strike.dates[0] ?? "").slice(0, 7) <= ym && (isOpen(strike) || lastDay(strike).slice(0, 7) >= ym) : strike.dates.some((iso) => iso.slice(0, 7) === ym);

const monthLabel = (ym: string) => `${MONTHS[Number(ym.slice(5, 7)) - 1]} de ${ym.slice(0, 4)}`;

export function buildStrikesSpainBody(
  asOf: string = STRIKES_SPAIN_AS_OF,
  strikes: SpainStrike[] = SPAIN_STRIKES,
  sectors: SpainSectorStatus[] = SPAIN_SECTOR_STATUS,
): Block[] {
  const checked = dateYear(asOf, "es");
  const today = dayDate(asOf, "es");
  const upcoming = upcomingSpainStrikes(asOf, strikes);
  const past = pastSpainStrikes(asOf, strikes).slice(0, RECENT_LIMIT);
  const ms = new Map(strikes.map((strike) => [strike.id, msOf(strike, checked)]));
  const msFor = (strike: SpainStrike) => ms.get(strike.id)!;
  const months = titleMonths(asOf);

  const blocks: Block[] = [];

  /* Lead: today, the next 14 days, how many more. */
  const now = upcoming.filter((strike) => isOnDay(strike, asOf));
  const next = upcoming.filter((strike) => !isOnDay(strike, asOf));
  const soon = next.filter((strike) => daysBetween(asOf, strike.dates[0] ?? asOf) <= 14);
  const later = next.length - soon.length;
  const pendingMs = upcoming.filter((strike) => msFor(strike).status !== "published");
  const nowLine =
    now.length > 0
      ? `**Hoy, ${today}, hay huelga en España:** ${now.map((strike) => `${titleOf(strike)} (${spainDays(strike)})`).join("; ")}.`
      : `**Hoy, ${today}, no hay en curso ninguna huelga de ámbito estatal** en las fuentes oficiales que seguimos.`;
  const soonLine = soon.length > 0 ? `**Próximos días:** ${soon.map((strike) => `${spainDays(strike, false)}, ${titleOf(strike)}`).join("; ")}.` : "";
  const laterLine = later > 0 ? `${later === 1 ? "Hay una más" : `Hay ${later} más`} en el calendario de más abajo.` : "";
  const msLine =
    pendingMs.length > 0
      ? "Los servicios mínimos los fija cada gobierno por orden o resolución pocos días antes de cada huelga: abajo, en cada una, si ya se han publicado y dónde."
      : "";
  const noneLine =
    upcoming.length === 0
      ? `**No hay ninguna huelga de ámbito estatal convocada en las fuentes oficiales consultadas el ${checked}.** Cuando se convoque una, la añadiremos aquí con sus servicios mínimos oficiales.`
      : "";
  blocks.push(lead(upcoming.length > 0 ? [nowLine, soonLine, laterLine, msLine].filter(Boolean).join(" ") : noneLine));

  if (upcoming.length > 0) {
    blocks.push(
      keyFacts(
        "Las próximas huelgas, de un vistazo",
        upcoming.map((strike) => ({
          label: cap(spainDays(strike, false)),
          value: `${cap(titleOf(strike))}. Ámbito: ${strike.scope}. Servicios mínimos: ${msFor(strike).short.charAt(0).toLowerCase()}${msFor(strike).short.slice(1)}.`,
        })),
      ),
    );
  }

  blocks.push(
    callout(
      "official",
      verifiedLine("es", asOf),
      "Solo ponemos lo que publican los sindicatos convocantes en sus webs, el BOE, los boletines autonómicos y los ministerios, no lo que adelanta la prensa. Si una huelga solo está anunciada, sin convocatoria registrada, lo decimos. Cada huelga tiene su sección, con fecha, y cuando pasa queda en la lista de huelgas recientes.",
    ),
  );

  /* The calendar. */
  if (upcoming.length > 0) {
    blocks.push(heading(2, `Calendario de huelgas en España: ${months.long}`, "calendario"));
    blocks.push(
      table(
        "Huelgas convocadas en España, por fecha",
        ["Fecha", "Huelga", "Ámbito", "Servicios mínimos"],
        upcoming.map((strike) => [cap(spainDays(strike, false)), cap(titleOf(strike)), cap(strike.scope), msFor(strike).short]),
        `Consultado el ${checked}. Cada huelga tiene su sección más abajo, con quién la convoca, su horario y el enlace a su convocatoria.`,
      ),
    );
    for (const strike of upcoming) {
      const m = msFor(strike);
      blocks.push(heading(3, `${cap(spainDays(strike))}: ${titleOf(strike)}`, strike.id));
      blocks.push(
        list(
          `**Ámbito:** ${strike.scope}.`,
          `**Horario:** ${strike.hours}`,
          `**Convoca:** ${strike.calledBy}`,
          `**A quién llama:** ${strike.who}`,
          ...(strike.call === "anunciada" ? [`**Estado:** ${ANNOUNCED}. Lo que hay es el anuncio del sindicato, enlazado aquí; una huelga que afecta a servicios públicos debe comunicarse al menos diez días antes (artículo 4 del Real Decreto-ley 17/1977).`] : []),
          ...strike.notes,
          `**Servicios mínimos:** ${m.text}`,
          ...(strike.guides.length > 0 ? [`**Más información:** ${strike.guides.join(" · ")}.`] : []),
        ),
      );
    }
  }

  /* Catalonia: the Catalan hub, and its Catalonia-only strikes. */
  const catalan = catalanOnly(asOf, strikes);
  blocks.push(heading(2, "Huelgas en Cataluña", "cataluna"));
  blocks.push(
    ...paras(
      `Las huelgas que afectan solo a Cataluña (Rodalies, metro y autobuses, la sanidad y los colegios catalanes) y lo que funciona allí cada día, con los servicios mínimos de la Generalitat, están en ${b2link("strikes", "es", "huelga hoy en Cataluña: qué funciona")}.${catalan.length > 0 ? " Ahora mismo hay estas:" : ""}`,
    ),
  );
  if (catalan.length > 0) {
    blocks.push(
      list(
        ...catalan.map((strike) => {
          const title = strike.guide ? B2_TITLES[strike.guide].es : "";
          const guide = strike.guide ? ` ${b2link(strike.guide, "es", title)}${/[?!]$/.test(title) ? "" : "."}` : "";
          return `**${cap(catalanDays(strike, "es"))}:** ${strike.title.es}.${guide}`;
        }),
      ),
    );
  }

  /* Doctors, schools, the courts, Correos: where each stands. */
  if (sectors.length > 0) {
    blocks.push(heading(2, "Médicos, educación, justicia y Correos: qué hay convocado", "sectores"));
    for (const sector of sectors) {
      const dated = upcoming.filter((strike) => strike.sector === sector.sector);
      blocks.push(heading(3, sector.heading));
      blocks.push(
        ...paras(
          ...(dated.length > 0 ? [`**En el calendario:** ${dated.map((strike) => `${spainDays(strike)}, ${titleOf(strike)}`).join("; ")}.`] : []),
          ...sector.text,
        ),
      );
    }
  }

  /* Recent strikes. */
  if (past.length > 0) {
    blocks.push(heading(2, "Huelgas recientes", "recientes"));
    blocks.push(...paras("Las últimas huelgas de ámbito estatal y lo que se publicó para cada una, tal como estaba en las fuentes oficiales."));
    blocks.push(
      list(
        ...past.map((strike) => {
          const m = msFor(strike);
          const guides = strike.guides.length > 0 ? ` ${strike.guides.join(" · ")}.` : "";
          return `**${cap(spainDays(strike))}: ${strike.title}**, ${strike.scope}. ${m.text}${guides}`;
        }),
      ),
    );
  }

  /* How minimum services are set: the BOE only. */
  blocks.push(heading(2, "Cómo se fijan los servicios mínimos", "servicios-minimos"));
  blocks.push(
    ...paras(
      `El derecho de huelga lo reconoce ${link(U.constitution, "el artículo 28.2 de la Constitución")}: «Se reconoce el derecho a la huelga de los trabajadores para la defensa de sus intereses». El mismo artículo pide que la ley establezca las garantías precisas para asegurar «el mantenimiento de los servicios esenciales de la comunidad».`,
      `El ${link(U.rdl17, "Real Decreto-ley 17/1977")} fija el resto: la huelga se comunica a la empresa y a la autoridad laboral con cinco días naturales de antelación, o diez si afecta a servicios públicos (artículos 3 y 4), y «la Autoridad gubernativa podrá acordar las medidas necesarias para asegurar el funcionamiento de los servicios» (artículo 10). Por eso cada gobierno fija los de los servicios que dependen de él: el Ministerio de Transportes, los de Renfe, Adif, los aeropuertos y las compañías aéreas, que publica en sus listas de resoluciones ${link(U.ministryRail, "ferroviarias")} y ${link(U.ministryAir, "del transporte aéreo")}; cada comunidad autónoma, los de su transporte, su sanidad y sus colegios, en su boletín oficial.`,
    ),
  );

  /* FAQ. */
  const listOf = (items: SpainStrike[]) => items.map((strike) => `${spainDays(strike)}, ${titleOf(strike)}`).join("; ");
  const faqItems: { question: string; answer: string }[] = [
    {
      question: "¿Hay huelga hoy en España?",
      answer:
        now.length > 0
          ? `Esta página se actualizó el ${checked}. Ese día había en curso: ${listOf(now)}.${next.length > 0 ? ` Las próximas: ${listOf(next.slice(0, 4))}.` : ""}`
          : `Esta página se actualizó el ${checked} y ese día no había en curso ninguna huelga de ámbito estatal en las fuentes oficiales que seguimos.${next.length > 0 ? ` Las próximas: ${listOf(next.slice(0, 4))}.` : ""}`,
    },
    ...months.months.map((ym) => {
      const inThisMonth = [...upcoming, ...pastSpainStrikes(asOf, strikes)].filter((strike) => inMonth(strike, ym)).sort(byFirstDay);
      return {
        question: `¿Qué huelgas hay en ${monthLabel(ym)}?`,
        answer:
          inThisMonth.length > 0
            ? `Las huelgas de ámbito estatal o de varias comunidades en ${monthLabel(ym)}, según las fuentes oficiales consultadas el ${checked}: ${listOf(inThisMonth)}. Las de Cataluña, en la sección «Huelgas en Cataluña».`
            : `A ${checked} no hay ninguna huelga de ámbito estatal convocada para ${monthLabel(ym)} en las fuentes oficiales que seguimos. Una huelga en servicios públicos se comunica al menos diez días antes, así que pueden convocarse más.`,
      };
    }),
    ...SECTOR_QUESTIONS.map(({ sector, catalan: scopes, question, noun }) => {
      const spain = upcoming.filter((strike) => strike.sector === sector);
      const cat = catalanOnly(asOf, strikes).filter((strike) => scopes.includes(strike.scope));
      const status = sectors.find((s) => s.sector === sector)?.text[0];
      const spainPart =
        spain.length > 0
          ? `Sí: ${listOf(spain)}.`
          : status
            ? status
            : `A ${checked} no hay ninguna huelga ${noun} de ámbito estatal convocada en las fuentes oficiales que seguimos.`;
      // Education: a students' strike is not a teachers' one, so the status line follows the dated list.
      const extra = spain.length > 0 && status && spain.every((strike) => strike.minimumServices !== "strike11n" && strike.minimumServices.status === "none") ? ` ${status}` : "";
      const catPart = cat.length > 0 ? ` En Cataluña: ${cat.map((strike) => `${catalanDays(strike, "es")}, ${strike.title.es}`).join("; ")}.` : "";
      return { question: `¿Hay ${question} en ${months.long}?`, answer: `${spainPart}${extra}${catPart}` };
    }),
    {
      question: "¿Quién fija los servicios mínimos de una huelga?",
      answer:
        "El gobierno del que depende cada servicio, como prevé el artículo 10 del Real Decreto-ley 17/1977: el Ministerio de Transportes, los de los trenes de Renfe y Adif, los aeropuertos y las compañías aéreas; cada comunidad autónoma, los de su transporte público, su sanidad y sus colegios, por orden publicada en su boletín oficial.",
    },
    {
      question: "¿Con cuánta antelación se convoca una huelga?",
      answer:
        "Según el Real Decreto-ley 17/1977, la huelga se comunica a la empresa y a la autoridad laboral con cinco días naturales de antelación, y con diez si afecta a servicios públicos, como el transporte, la sanidad o la educación.",
    },
  ];
  blocks.push(faq(faqItems.map((item) => ({ question: item.question, answer: strip(item.answer) }))));
  blocks.push(...paras(verifiedLine("es", STRIKES_SPAIN_VERIFIED)));

  /* Related rail (its first two links also become the read-next box): the 11N page and the Catalan hub. */
  blocks.push(heading(2, RELATED_HEADING.es));
  blocks.push(
    list(
      b2link("strike11n", "es", B2_TITLES.strike11n.es),
      b2link("strikes", "es", B2_TITLES.strikes.es),
      b2link("strikeRenfe", "es", B2_TITLES.strikeRenfe.es),
      b2link("strikeEducation", "es", B2_TITLES.strikeEducation.es),
    ),
  );
  return blocks;
}

/* -------------------------------------------------------------------------- */
/* Article                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * No new photograph: the 11N city pages' march beside an EMT bus in Madrid
 * (Israel Hergón, CC BY-SA 2.0, Wikimedia Commons), with their exact alt text
 * and caption, since media rows are keyed by file.
 */
export const STRIKES_SPAIN_GUIDE: B2SpanishArticle = {
  entryKey: "guide-strikes-spain",
  categoryKey: "public-services",
  sources: strikesSpainSources(),
  heroKey: CITY_HERO.key,
  heroAlt: { ...CITY_HERO.alt },
  heroCaption: { ...CITY_HERO.caption },
  verifiedAt: STRIKES_SPAIN_VERIFIED,
  publishedAt: "2026-11-06T20:00:00+01:00",
  editions: {
    es: {
      path: STRIKES_SPAIN_PATH,
      title: strikesSpainTitle(),
      seoTitle: strikesSpainSeoTitle(),
      seoDescription: strikesSpainDescription(),
      excerpt: STRIKES_SPAIN_EXCERPT,
      blocks: buildStrikesSpainBody(),
    },
  },
};
