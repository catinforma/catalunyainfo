/**
 * The fact table and the short FAQ of the Christmas fair pages (25 Nov 2026),
 * ca / es / en. Pure and data-driven: every cell and every answer is built
 * from fields the fair already carries (`Fair`: dates, place, hours, the
 * organiser's `details`) and the town's station list. A row or a question
 * exists only when its field does: nothing is filled in, and the FAQ is
 * dropped when fewer than two questions can be answered. The page shows the
 * answers as written here and the JSON-LD (FAQPage) carries the same strings.
 *
 * Source: the ai-traffic analysis (25 Nov 2026) found the Montserrat page,
 * with the answer in the first sentence, a fact table and a FAQ, the model
 * assistants cite; the fairs pages had a dated lead and no table or FAQ.
 */

import { caDe, joinList } from "@/lib/programmatic/holidays/names";

import { SEASON_YEAR } from "./classify";
import { fairShortName, townName } from "./copy";
import { capitalize, fullDate, rangeText, untilDate, onDate } from "./format";
import type { FairsLocale } from "./paths";
import type { Fair } from "./types";

/** Same stripping as the JSON-LD's: links to their text, no emphasis marks. */
export function plain(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`]/g, "")
    .trim();
}

const sentence = (text: string) => (/[.!?…»]$/.test(text) ? text : `${text}.`);

/** An hours line that says nothing is published is not an answer to "what time does it open". */
const NO_HOURS = /sense horari|sin horario|no opening hours/i;

export interface RailLine {
  name: string;
  stations: readonly string[];
}

export interface FactsContext {
  /** The town's Rodalies / regional lines with a station in it (`linesFor`). */
  lines: readonly RailLine[];
  /** Day the official calendar was read (`SNAPSHOT.readOn`). */
  calendarReadOn: string;
}

export interface FactRow {
  key: "dates" | "hours" | "place" | "getThere" | "entry";
  label: string;
  value: string;
  /** True when the organiser's own directions follow in the "how to get there" section. */
  seeDirections?: boolean;
}

export interface FairFacts {
  id: string;
  name: string;
  rows: FactRow[];
}

const COPY = {
  ca: {
    heading: "Dades clau",
    caption: (name: string) => `Dades clau: ${name}`,
    labels: { dates: "Dates", hours: "Horari", place: "Lloc", getThere: "Com arribar-hi", entry: "Entrades i preus" },
    train: (items: string) => `En tren: ${items}.`,
    directions: "Indicacions de l'organitzador: vegeu «Com arribar-hi» més avall.",
    unconfirmed: "dates del calendari oficial; l'organitzador encara no ha confirmat l'edició 2026",
    toConfirm: "dates pendents de confirmar segons el calendari oficial",
    directionsLink: "Vés a les indicacions de l'organitzador",
    placeSource: "per al lloc",
    sourceLead: "Font i data de lectura",
    calendar: "calendari oficial de fires de la Generalitat (Departament d'Empresa i Treball)",
    agenda: "Agenda Cultural de Catalunya",
    readOn: (d: string) => `llegit el ${d}`,
    faqHeading: "Preguntes freqüents",
    hubHeading: "Les principals fires de Nadal, d'un cop d'ull",
    hubCols: { fair: "Fira", dates: "Dates", hours: "Horari", place: "Lloc" },
    hubCaption: "Les fires més buscades: dates, horari i lloc segons els webs oficials",
  },
  es: {
    heading: "Datos clave",
    caption: (name: string) => `Datos clave: ${name}`,
    labels: { dates: "Fechas", hours: "Horario", place: "Lugar", getThere: "Cómo llegar", entry: "Entradas y precios" },
    train: (items: string) => `En tren: ${items}.`,
    directions: "Indicaciones del organizador: véase «Cómo llegar» más abajo.",
    unconfirmed: "fechas del calendario oficial; el organizador aún no ha confirmado la edición 2026",
    toConfirm: "fechas pendientes de confirmar según el calendario oficial",
    directionsLink: "Ir a las indicaciones del organizador",
    placeSource: "para el lugar",
    sourceLead: "Fuente y fecha de lectura",
    calendar: "calendario oficial de ferias de la Generalitat (Departament d'Empresa i Treball)",
    agenda: "Agenda Cultural de Catalunya",
    readOn: (d: string) => `leído el ${d}`,
    faqHeading: "Preguntas frecuentes",
    hubHeading: "Las principales ferias de Navidad de un vistazo",
    hubCols: { fair: "Feria", dates: "Fechas", hours: "Horario", place: "Lugar" },
    hubCaption: "Las ferias más buscadas: fechas, horario y lugar según las webs oficiales",
  },
  en: {
    heading: "Key facts",
    caption: (name: string) => `Key facts: ${name}`,
    labels: { dates: "Dates", hours: "Hours", place: "Place", getThere: "Getting there", entry: "Tickets and prices" },
    train: (items: string) => `By train: ${items}.`,
    directions: "The organiser's directions: see \"Getting there\" below.",
    unconfirmed: "dates from the official calendar; the organiser has not confirmed the 2026 edition yet",
    toConfirm: "dates still to be confirmed, according to the official calendar",
    directionsLink: "Go to the organiser's directions",
    placeSource: "for the place",
    sourceLead: "Source and date read",
    calendar: "the Catalan government's official fairs calendar (Department of Business and Labour)",
    agenda: "Agenda Cultural de Catalunya",
    readOn: (d: string) => `read on ${d}`,
    faqHeading: "Frequently asked questions",
    hubHeading: "The main Christmas markets at a glance",
    hubCols: { fair: "Market", dates: "Dates", hours: "Hours", place: "Place" },
    hubCaption: "The most searched markets: dates, hours and place from the official websites",
  },
} as const;

export function factsCopy(locale: FairsLocale) {
  return COPY[locale];
}

/** The fair's name in the page's language; without a Spanish name in the calendar, the Catalan one (as the lead does). */
export function listName(f: Pick<Fair, "name" | "nameEs">, locale: FairsLocale): string {
  return locale === "es" && !f.nameEs ? fairShortName(f, "ca") : fairShortName(f, locale);
}

/** Who gave the fair's data and when it was read: the organiser's page, else the calendar or the agenda. */
export function factSource(fair: Fair, ctx: FactsContext, locale: FairsLocale): string {
  const c = COPY[locale];
  if (fair.checked) return `${fair.checked.publisher}, ${c.readOn(fullDate(fair.checked.readOn, locale))}`;
  return datasetSource(fair, ctx, locale);
}

/** The official calendar (or the agenda) and the day it was read: where a fair's place comes from when the organiser's page names none. */
function datasetSource(fair: Pick<Fair, "source">, ctx: FactsContext, locale: FairsLocale): string {
  const c = COPY[locale];
  return `${fair.source === "agenda" ? c.agenda : c.calendar}, ${c.readOn(fullDate(ctx.calendarReadOn, locale))}`;
}

/**
 * Every source of a page's facts, each once: each fair's own, and, for a place
 * that the calendar gave because the organiser's page names none
 * (`placeFromDataset`: Cardedeu, Arbúcies), the calendar and its reading day
 * marked as the place's source.
 */
function sourceItems(fairs: readonly Fair[], ctx: FactsContext, locale: FairsLocale): string[] {
  const out = new Set(fairs.map((f) => factSource(f, ctx, locale)));
  for (const f of fairs) if (f.place && f.placeFromDataset) out.add(`${COPY[locale].placeSource}: ${datasetSource(f, ctx, locale)}`);
  return [...out];
}

/** "Del carrer…" inside a sentence or brackets: only the leading preposition is lowercased, never a proper name ("Roca Umbert"). */
function lowerLead(text: string): string {
  return text.replace(/^(Del|Dels|De la|De l'|Des de|Al|A la)(?=[\s'’])/, (w) => w.toLowerCase());
}

/** "days (place)"; "days, place" when the place has brackets of its own, so none are nested. */
function daysAndPlace(days: string, place: string | null): string {
  if (!place) return days;
  return place.includes("(") ? `${days}, ${lowerLead(place)}` : `${days} (${lowerLead(place)})`;
}

export function hoursOf(fair: Fair, locale: FairsLocale): string | null {
  const h = fair.hours?.[locale];
  return h && !NO_HOURS.test(h) ? plain(h) : null;
}

/** The organiser's own direction lines of a fair, as plain text. */
const accessPlain = (fair: Pick<Fair, "details">, locale: FairsLocale): string[] => (fair.details?.access ?? []).map((l) => plain(l[locale]));

/**
 * "By train: R3 (Vic)". Nothing when the town has more than three lines
 * (Barcelona: 14): a list of every line with a station in a city does not say
 * how to reach one square (the page's "how to get there" section lists the
 * stations in full). Nothing either when the organiser's own directions
 * already name every line (Vic: "Rodalies R3").
 */
function railText(lines: readonly RailLine[], locale: FairsLocale, own: readonly string[] = []): string | null {
  if (lines.length === 0 || lines.length > 3) return null;
  if (own.length > 0 && lines.every((l) => own.some((text) => text.includes(l.name)))) return null;
  const items = lines.map((l) => `${l.name} (${joinList(l.stations, locale)})`);
  return COPY[locale].train(joinList(items, locale));
}

/** The dates cell: the days, and what the page knows about how firm they are. */
function datesCell(fair: Fair, locale: FairsLocale): string {
  const c = COPY[locale];
  const days = capitalize(rangeText(fair.start, fair.end, locale));
  const note = fair.unconfirmed ? c.unconfirmed : fair.toConfirm ? c.toConfirm : null;
  return note ? `${days} (${note})` : days;
}

/** One fair's rows: only the fields it has. */
export function fairRows(fair: Fair, ctx: FactsContext, locale: FairsLocale): FactRow[] {
  const c = COPY[locale];
  const rows: FactRow[] = [{ key: "dates", label: c.labels.dates, value: datesCell(fair, locale) }];
  const hours = hoursOf(fair, locale);
  if (hours) rows.push({ key: "hours", label: c.labels.hours, value: capitalize(hours) });
  if (fair.place) rows.push({ key: "place", label: c.labels.place, value: fair.place });
  const own = accessPlain(fair, locale);
  const rail = railText(ctx.lines, locale, own);
  const directions = own.length > 0;
  if (rail || directions) {
    rows.push({
      key: "getThere",
      label: c.labels.getThere,
      value: [rail, directions ? c.directions : null].filter(Boolean).join(" "),
      seeDirections: directions,
    });
  }
  if (fair.details?.tickets) rows.push({ key: "entry", label: c.labels.entry, value: plain(fair.details.tickets[locale]) });
  return rows;
}

export function townFacts(fairs: readonly Fair[], ctx: FactsContext, locale: FairsLocale): FairFacts[] {
  return fairs.map((f) => ({ id: f.id, name: listName(f, locale), rows: fairRows(f, ctx, locale) }));
}

/** "Source and date read: A, read on …; B, read on …" for the fairs of one page, each source once. */
export function factsSources(fairs: readonly Fair[], ctx: FactsContext, locale: FairsLocale): string {
  return `${COPY[locale].sourceLead}: ${sourceItems(fairs, ctx, locale).join("; ")}.`;
}

/* -------------------------------------------------------------------------- */
/* FAQ                                                                        */
/* -------------------------------------------------------------------------- */

export interface FaqItem {
  question: string;
  answer: string;
}

type Subject = { name: string; fairs: readonly Fair[] };

function questions(town: Subject, locale: FairsLocale) {
  const many = town.fairs.length > 1;
  const y = SEASON_YEAR;
  if (locale === "ca") {
    const de = caDe(town.name);
    const what = many ? `les fires de Nadal ${de}` : `la fira de Nadal ${de}`;
    return {
      dates: many ? `Quan són les fires de Nadal ${de} el ${y}?` : `Quan és la fira de Nadal ${de} el ${y}?`,
      hours: many ? `A quina hora obren les fires de Nadal ${de}?` : `A quina hora obre la fira de Nadal ${de}?`,
      place: many ? `On se celebren les fires de Nadal ${de}?` : `On se celebra la fira de Nadal ${de}?`,
      getThere: `Com arribar a ${what}?`,
      entry: `Quines entrades i preus hi ha a ${what}?`,
    };
  }
  if (locale === "es") {
    const de = `de ${townName(town.name, "es")}`;
    const what = many ? `las ferias de Navidad ${de}` : `la feria de Navidad ${de}`;
    return {
      dates: many ? `¿Cuándo son las ferias de Navidad ${de} en ${y}?` : `¿Cuándo es la feria de Navidad ${de} en ${y}?`,
      hours: many ? `¿A qué hora abren las ferias de Navidad ${de}?` : `¿A qué hora abre la feria de Navidad ${de}?`,
      place: many ? `¿Dónde se celebran las ferias de Navidad ${de}?` : `¿Dónde se celebra la feria de Navidad ${de}?`,
      getThere: `¿Cómo llegar a ${what}?`,
      entry: `¿Qué entradas y precios hay en ${what}?`,
    };
  }
  const t = townName(town.name, "en");
  return {
    dates: many ? `When are the Christmas markets in ${t} in ${y}?` : `When is the ${t} Christmas market in ${y}?`,
    hours: many ? `What time do the ${t} Christmas markets open?` : `What time does the ${t} Christmas market open?`,
    place: many ? `Where are the Christmas markets in ${t}?` : `Where is the ${t} Christmas market?`,
    getThere: many ? `How do I get to the Christmas markets in ${t}?` : `How do I get to the ${t} Christmas market?`,
    entry: many ? `What tickets and prices do the ${t} Christmas markets have?` : `What tickets and prices does the ${t} Christmas market have?`,
  };
}

/** "Name: text" per fair when the page has several; the bare text when it has one. */
function perFair(fairs: readonly Fair[], locale: FairsLocale, text: (f: Fair) => string | null): string | null {
  const parts = fairs.map((f) => ({ f, t: text(f) })).filter((p): p is { f: Fair; t: string } => Boolean(p.t));
  if (parts.length === 0) return null;
  if (fairs.length === 1) return parts[0]!.t;
  return parts.map((p) => `${listName(p.f, locale)}: ${p.t}`).join(" ");
}

const withDot = sentence;

/** When: the days, the place in brackets, how firm they are, and where it was read. */
export function datesAnswer(fairs: readonly Fair[], ctx: FactsContext, locale: FairsLocale): string {
  const one = (f: Fair): string => {
    const days = fairs.length === 1 ? capitalize(rangeText(f.start, f.end, locale)) : rangeText(f.start, f.end, locale, { weekdays: false, year: false });
    const note = f.unconfirmed ? `; ${COPY[locale].unconfirmed}` : f.toConfirm ? `; ${COPY[locale].toConfirm}` : "";
    return `${daysAndPlace(days, f.place)}${note}`;
  };
  const body = perFair(fairs, locale, (f) => withDot(one(f)))!;
  const sources = `${COPY[locale].sourceLead}: ${sourceItems(fairs, ctx, locale).join("; ")}.`;
  return `${body} ${sources}`;
}

/** `withSource: false` when the answer follows the dates answer, which already names the same sources. */
export function hoursAnswer(fairs: readonly Fair[], locale: FairsLocale, withSource = true): string | null {
  const body = perFair(fairs, locale, (f) => {
    const h = hoursOf(f, locale);
    return h ? withDot(fairs.length === 1 ? capitalize(h) : h) : null;
  });
  if (!body) return null;
  const withHours = fairs.filter((f) => hoursOf(f, locale) && f.checked);
  const src = [...new Set(withHours.map((f) => `${f.checked!.publisher}, ${COPY[locale].readOn(fullDate(f.checked!.readOn, locale))}`))];
  return withSource && src.length > 0 ? `${body} ${COPY[locale].sourceLead}: ${src.join("; ")}.` : body;
}

export function placeAnswer(fairs: readonly Fair[], ctx: FactsContext, locale: FairsLocale): string | null {
  const body = perFair(fairs, locale, (f) => (f.place ? withDot(f.place) : null));
  if (!body) return null;
  const placed = fairs.filter((f) => f.place);
  const sources = [...new Set(placed.map((f) => (f.placeFromDataset ? datasetSource(f, ctx, locale) : factSource(f, ctx, locale))))];
  return `${body} ${COPY[locale].sourceLead}: ${sources.join("; ")}.`;
}

/** Up to two of the organiser's own direction lines, with who published them and when. */
export function directionsAnswer(fairs: readonly Fair[], ctx: FactsContext, locale: FairsLocale): string | null {
  const lines = fairs.flatMap((f) => accessPlain(f, locale).map((text) => ({ f, text })));
  const rail = railText(ctx.lines, locale, lines.map((l) => l.text));
  if (!rail && lines.length === 0) return null;
  // With several fairs, each line says which fair it is for.
  const own = lines.slice(0, 2).map((l) => (fairs.length > 1 ? `${listName(l.f, locale)}: ${withDot(l.text)}` : withDot(l.text)));
  const d = fairs.find((f) => f.details?.access?.length)?.details;
  const publisher = d ? (d.organizer?.name ?? fairs.find((f) => f.details === d)?.checked?.publisher ?? "") : "";
  const src = d && publisher ? ` ${COPY[locale].sourceLead}: ${publisher}, ${COPY[locale].readOn(fullDate(d.readOn, locale))}.` : "";
  return [rail, ...own].filter(Boolean).join(" ") + src;
}

export function entryAnswer(fairs: readonly Fair[], locale: FairsLocale): string | null {
  const body = perFair(fairs, locale, (f) => (f.details?.tickets ? withDot(plain(f.details.tickets[locale])) : null));
  if (!body) return null;
  const f = fairs.find((x) => x.details?.tickets)!;
  const publisher = f.details!.organizer?.name ?? f.checked?.publisher;
  return publisher ? `${body} ${COPY[locale].sourceLead}: ${publisher}, ${COPY[locale].readOn(fullDate(f.details!.readOn, locale))}.` : body;
}

/**
 * A town's FAQ: the dates (always answerable), plus the hours, the place, how
 * to get there and the tickets when the page has them. Empty when fewer than
 * two questions have an answer.
 */
export function townFaq(town: Subject, ctx: FactsContext, locale: FairsLocale): FaqItem[] {
  const q = questions(town, locale);
  const items: (FaqItem | null)[] = [
    { question: q.dates, answer: datesAnswer(town.fairs, ctx, locale) },
    ...[
      [q.hours, hoursAnswer(town.fairs, locale)],
      [q.place, placeAnswer(town.fairs, ctx, locale)],
      [q.getThere, directionsAnswer(town.fairs, ctx, locale)],
      [q.entry, entryAnswer(town.fairs, locale)],
    ].map(([question, answer]) => (answer ? { question: question!, answer } : null)),
  ];
  const out = items.filter((i): i is FaqItem => Boolean(i));
  return out.length >= 2 ? out : [];
}

/* -------------------------------------------------------------------------- */
/* Hub                                                                        */
/* -------------------------------------------------------------------------- */

export interface HubRow {
  slug: string | null;
  name: string;
  town: string;
  dates: string;
  hours: string | null;
  place: string | null;
  start: string;
}

/** One row per fair, for the hub's table of the most searched fairs. */
export function hubRow(f: Fair, town: string, slug: string | null, locale: FairsLocale): HubRow {
  return {
    slug,
    name: listName(f, locale),
    town: townName(town, locale),
    dates: rangeText(f.start, f.end, locale, { weekdays: false, year: false }),
    hours: hoursOf(f, locale),
    place: f.place,
    start: f.start,
  };
}

/**
 * The hub's FAQ: how many fairs there are and which starts first and ends last,
 * then, for each of the headline towns, the same answer its page gives (dates,
 * place, hours).
 */
export function hubFaq(
  all: readonly Fair[],
  townCount: number,
  headline: readonly { town: Subject; ctx: FactsContext }[],
  checked: string,
  locale: FairsLocale,
  townOf: (f: Fair) => string,
): FaqItem[] {
  const out: FaqItem[] = [];
  const dated = all.filter((f) => !f.toConfirm);
  if (dated.length > 0) {
    const first = [...dated].sort((a, b) => a.start.localeCompare(b.start))[0]!;
    const last = [...dated].sort((a, b) => b.end.localeCompare(a.end))[0]!;
    const fairTown = (f: Fair) => townName(townOf(f), locale);
    const n = all.length;
    // Fairs whose organiser has not confirmed 2026 (dates are the official calendar's) or whose dates are still to be confirmed.
    const k = all.filter((f) => f.unconfirmed || f.toConfirm).length;
    if (locale === "ca") {
      out.push({
        question: `Quantes fires de Nadal hi ha a Catalunya el ${SEASON_YEAR}?`,
        answer: `Hi ha ${n} fires i mercats de Nadal a ${townCount} municipis de Catalunya, segons el calendari oficial de fires de la Generalitat i els webs dels ajuntaments (revisat el ${fullDate(checked, "ca")}).${k > 0 ? ` En ${k} d'aquestes l'organitzador encara no ha confirmat l'edició del 2026: les dates són les del calendari oficial.` : ""} La primera en començar és ${listName(first, "ca")} (${fairTown(first)}, ${onDate(first.start, "ca")}); la que acaba més tard és ${listName(last, "ca")} (${fairTown(last)}, fins ${untilDate(last.end, "ca")}).`,
      });
    } else if (locale === "es") {
      out.push({
        question: `¿Cuántas ferias de Navidad hay en Cataluña en ${SEASON_YEAR}?`,
        answer: `Hay ${n} ferias y mercados de Navidad en ${townCount} municipios de Cataluña, según el calendario oficial de ferias de la Generalitat y las webs de los ayuntamientos (revisado el ${fullDate(checked, "es")}).${k > 0 ? ` En ${k} de ellas el organizador aún no ha confirmado la edición de 2026: las fechas son las del calendario oficial.` : ""} La primera en empezar es ${listName(first, "es")} (${fairTown(first)}, ${onDate(first.start, "es")}); la que termina más tarde es ${listName(last, "es")} (${fairTown(last)}, hasta ${untilDate(last.end, "es")}).`,
      });
    } else {
      out.push({
        question: `How many Christmas markets are there in Catalonia in ${SEASON_YEAR}?`,
        answer: `There are ${n} Christmas markets and fairs in ${townCount} towns in Catalonia, according to the Catalan government's official fairs calendar and the town councils' websites (checked on ${fullDate(checked, "en")}).${k > 0 ? ` For ${k} of them the organiser has not confirmed the 2026 edition yet: the dates are the official calendar's.` : ""} The first to open is ${listName(first, "en")} (${fairTown(first)}, ${onDate(first.start, "en")}); the last to close is ${listName(last, "en")} (${fairTown(last)}, until ${untilDate(last.end, "en")}).`,
      });
    }
  }
  for (const { town, ctx } of headline) {
    const q = questions(town, locale);
    const hours = hoursAnswer(town.fairs, locale, false);
    out.push({ question: q.dates, answer: [datesAnswer(town.fairs, ctx, locale), hours ? `${COPY[locale].labels.hours}: ${hours}` : null].filter(Boolean).join(" ") });
  }
  return out.length >= 2 ? out : [];
}
