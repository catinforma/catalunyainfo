/**
 * Words of the timetable summary (line pages and hub), in ca, es and en.
 * Pure: every time, count and date comes from timetable.json (Renfe's GTFS,
 * see timetable.ts); nothing here is written by hand except the sentences
 * around them.
 */

import type { Locale } from "@/lib/i18n/config";
import { dayMonth, dayMonthYear, weekdayName } from "@/lib/programmatic/holidays/format";

import { officialUrl } from "./official";
import { linePath } from "./paths";
import type { LineId, SnapshotLine } from "./types";
import TIMETABLE_JSON from "./timetable.json" with { type: "json" };
import {
  BANDS,
  DAY_TYPES,
  duration,
  timetableCurrent,
  type BandCount,
  type DateRun,
  type DayType,
  type DirectionTimetable,
  type LineTimetable,
  type TimetableSnapshot,
} from "./timetable";

export const TIMETABLE = TIMETABLE_JSON as unknown as TimetableSnapshot;

export const TIMETABLE_ID = "horari";

const link = (label: string, url: string) => `[${label}](${url})`;

/* -------------------------------------------------------------------------- */
/* Small words                                                                */
/* -------------------------------------------------------------------------- */

/** "la R2 Sud", "l'R2 Sud", "the R2 Sud". */
function the(line: SnapshotLine, locale: Locale): string {
  return locale === "ca" ? `l'${line.name}` : locale === "es" ? `la ${line.name}` : `the ${line.name}`;
}

function cap(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function joinList(items: string[], locale: Locale): string {
  const and = locale === "ca" ? " i " : locale === "es" ? " y " : " and ";
  return items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")}${and}${items[items.length - 1]}`;
}

/** 4 -> "4", 2.3 -> "2,3" (ca, es) or "2.3" (en). */
function decimal(value: number, locale: Locale): string {
  const text = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return locale === "en" ? text : text.replace(".", ",");
}

const dayNum = (iso: string) => Number(iso.slice(8, 10));

/** "el 27 de novembre", "l'1 de desembre", "el 27 de noviembre", "27 November". */
function onDay(iso: string, locale: Locale): string {
  if (locale === "en") return dayMonth(iso, locale);
  if (locale === "ca") return `${dayNum(iso) === 1 || dayNum(iso) === 11 ? "l'" : "el "}${dayMonth(iso, locale)}`;
  return `el ${dayMonth(iso, locale)}`;
}

/**
 * "del 7 al 18 de desembre", "del 27 de noviembre al 18 de diciembre",
 * "from 7 to 18 December" ("7 to 18 December" when `bare`); one day as
 * onDay ("on 13 December" in English unless bare).
 */
export function runText([a, b]: DateRun, locale: Locale, bare = false): string {
  if (a === b) return locale === "en" && !bare ? `on ${onDay(a, locale)}` : onDay(a, locale);
  const sameMonth = a.slice(0, 7) === b.slice(0, 7);
  const first = sameMonth ? String(dayNum(a)) : dayMonth(a, locale);
  if (locale === "en") return `${bare ? "" : "from "}${first} to ${dayMonth(b, locale)}`;
  if (locale === "ca") {
    const from = dayNum(a) === 1 || dayNum(a) === 11 ? `de l'${first}` : `del ${first}`;
    const to = dayNum(b) === 1 || dayNum(b) === 11 ? `a l'${dayMonth(b, locale)}` : `al ${dayMonth(b, locale)}`;
    return `${from} ${to}`;
  }
  return `del ${first} al ${dayMonth(b, locale)}`;
}

function runsText(runs: DateRun[], locale: Locale, bare = false): string {
  return joinList(
    runs.map((r) => runText(r, locale, bare)),
    locale,
  );
}

/** "fins al 19 de desembre", "fins a l'1 de gener"; "hasta el 19 de diciembre"; "until 19 December". */
function until(iso: string, locale: Locale): string {
  if (locale === "ca") return dayNum(iso) === 1 || dayNum(iso) === 11 ? `fins a l'${dayMonth(iso, locale)}` : `fins al ${dayMonth(iso, locale)}`;
  return locale === "es" ? `hasta el ${dayMonth(iso, locale)}` : `until ${dayMonth(iso, locale)}`;
}

/** "del 8 de desembre", "de l'1 de gener"; "del 8 de diciembre"; "8 December". */
function ofDay(iso: string, locale: Locale): string {
  if (locale === "ca") return dayNum(iso) === 1 || dayNum(iso) === 11 ? `de l'${dayMonth(iso, locale)}` : `del ${dayMonth(iso, locale)}`;
  return locale === "es" ? `del ${dayMonth(iso, locale)}` : dayMonth(iso, locale);
}

/** "dl. 23 nov." style is avoided: "dilluns 23 de novembre", "lunes 23 de noviembre", "Monday 23 November". */
function weekdayDate(iso: string, locale: Locale): string {
  return `${weekdayName(iso, locale)} ${dayMonth(iso, locale)}`;
}

/** Sundays and holidays together only where the file shows a holiday running a Sunday timetable. */
function holidaysAsSunday(t: LineTimetable): boolean {
  return t.holidays.length > 0 && t.holidays.every((h) => h.sameAsSunday);
}

const PLURAL: Record<Locale, Record<DayType, string>> = {
  ca: { weekday: "feiners", saturday: "dissabtes", sunday: "diumenges" },
  es: { weekday: "laborables", saturday: "sábados", sunday: "domingos" },
  en: { weekday: "weekdays", saturday: "Saturdays", sunday: "Sundays" },
};

export interface Column {
  types: DayType[];
  /** "Laborables", "Sábados, domingos y festivos"… */
  label: string;
  /** The day the figures are from: "lunes 23 de noviembre". */
  date: string;
  /** The type whose figures fill the column. */
  type: DayType;
}

export function columns(t: LineTimetable, locale: Locale): Column[] {
  const holidays = holidaysAsSunday(t);
  const label = (types: DayType[]): string => {
    if (types.length === 1 && types[0] === "weekday") return locale === "ca" ? "Feiners" : locale === "es" ? "Laborables" : "Weekdays";
    if (types.length === 1 && types[0] === "saturday") return locale === "ca" ? "Dissabtes" : locale === "es" ? "Sábados" : "Saturdays";
    if (types.length === 1) {
      if (locale === "ca") return holidays ? "Diumenges i festius" : "Diumenges";
      if (locale === "es") return holidays ? "Domingos y festivos" : "Domingos";
      return holidays ? "Sundays and holidays" : "Sundays";
    }
    if (locale === "ca") return holidays ? "Dissabtes, diumenges i festius" : "Dissabtes i diumenges";
    if (locale === "es") return holidays ? "Sábados, domingos y festivos" : "Sábados y domingos";
    return holidays ? "Weekends and holidays" : "Weekends";
  };
  const groups: DayType[][] = t.saturdayIsSunday ? [["weekday"], ["saturday", "sunday"]] : [["weekday"], ["saturday"], ["sunday"]];
  return groups
    .filter((types) => t.days[types[0]!] !== null)
    .map((types) => ({ types, type: types[0]!, label: label(types), date: weekdayDate(t.days[types[0]!]!.date, locale) }));
}

function bandLabel(index: number, locale: Locale): string {
  const band = BANDS[index]!;
  const h = (hhmm: string) => String(Number(hhmm.slice(0, 2)));
  if (!band.from) return locale === "ca" ? `Abans de les ${h(band.to!)} h` : locale === "es" ? `Antes de las ${h(band.to!)} h` : `Before ${band.to}`;
  if (!band.to) return locale === "ca" ? `A partir de les ${h(band.from)} h` : locale === "es" ? `Desde las ${h(band.from)} h` : `From ${band.from}`;
  return locale === "en" ? `${band.from}–${band.to}` : `De ${h(band.from)} a ${h(band.to)} h`;
}

function trainsWord(n: number, locale: Locale): string {
  if (locale === "ca") return n === 1 ? "1 tren" : `${n} trens`;
  if (locale === "es") return n === 1 ? "1 tren" : `${n} trenes`;
  return n === 1 ? "1 train" : `${n} trains`;
}

export function bandCell(band: BandCount, locale: Locale): string {
  if (band.trains === 0) return "—";
  const every = band.gap === null ? "" : locale === "ca" ? ` · cada ${band.gap} min` : locale === "es" ? ` · cada ${band.gap} min` : ` · every ${band.gap} min`;
  if (band.trains >= 2 && band.perHour !== null) {
    const one = band.perHour === 1;
    const rate =
      locale === "ca"
        ? `${decimal(band.perHour, locale)} ${one ? "tren" : "trens"}/h`
        : locale === "es"
          ? `${decimal(band.perHour, locale)} ${one ? "tren" : "trenes"}/h`
          : `${decimal(band.perHour, locale)} ${one ? "train" : "trains"}/h`;
    return `${rate}${every}`;
  }
  return `${trainsWord(band.trains, locale)}${every}`;
}

/* -------------------------------------------------------------------------- */
/* Line page                                                                  */
/* -------------------------------------------------------------------------- */

export interface DirectionView {
  title: string;
  /** First column header ("Estación") then one per column. */
  headers: string[];
  dates: string[];
  firstLastCaption: string;
  stations: { name: string; cells: { times: string; trains: string | null }[] }[];
  /** Trains per hour at `frequencyAt`, or every departure on sparse lines. */
  frequency: { caption: string; rows: { label: string; cells: string[] }[] } | null;
  listed: { caption: string; rows: { label: string; times: string }[] } | null;
  journeys: string | null;
}

export interface TimetableView {
  id: string;
  title: string;
  intro: string;
  directions: DirectionView[];
  notes: string[];
  attribution: string;
}

/** The direction's origin: where its listed departures and journey times start. */
function originOf(d: DirectionTimetable): string | null {
  return d.listed?.id ?? d.journeys?.fromId ?? d.stations[0]?.id ?? null;
}

function directionView(t: LineTimetable, d: DirectionTimetable, cols: Column[], locale: Locale): DirectionView {
  const station = locale === "ca" ? "Estació" : locale === "es" ? "Estación" : "Station";
  const view: DirectionView = {
    title: locale === "ca" ? `Cap a ${d.towards}` : locale === "es" ? `Hacia ${d.towards}` : `Towards ${d.towards}`,
    headers: [station, ...cols.map((c) => c.label)],
    dates: cols.map((c) => c.date),
    firstLastCaption:
      locale === "ca"
        ? "Primer i últim tren de cada estació en aquest sentit (alguns acaben abans del final de la línia)"
        : locale === "es"
          ? "Primer y último tren desde cada estación en este sentido (algunos acaban antes del final de la línea)"
          : "First and last train from each station this way (some end before the end of the line)",
    stations: d.stations.map((s) => ({
      name: s.name,
      cells: cols.map((c) => {
        const day = s.days[c.type];
        return day ? { times: `${day.first} – ${day.last}`, trains: trainsWord(day.trains, locale) } : { times: "—", trains: null };
      }),
    })),
    frequency: null,
    listed: null,
    journeys: null,
  };
  if (d.listed) {
    const from = d.listed.name;
    view.listed = {
      caption: locale === "ca" ? `Totes les sortides des de ${from}` : locale === "es" ? `Todas las salidas desde ${from}` : `Every departure from ${from}`,
      rows: cols.map((c) => ({ label: c.label, times: d.listed!.days[c.type]?.join(" · ") ?? "—" })),
    };
  } else if (d.frequencyAt) {
    const at = d.frequencyAt.name;
    view.frequency = {
      caption:
        locale === "ca"
          ? `Trens per hora a ${at} (i cada quants minuts passen, de mitjana)`
          : locale === "es"
            ? `Trenes por hora en ${at} (y cada cuántos minutos pasan, de media)`
            : `Trains per hour at ${at} (and minutes between trains, on average)`,
      rows: BANDS.map((_, i) => ({ label: bandLabel(i, locale), cells: cols.map((c) => (d.bands[c.type]?.[i] ? bandCell(d.bands[c.type]![i]!, locale) : "—")) })).filter((row) =>
        row.cells.some((cell) => cell !== "—"),
      ),
    };
  }
  if (d.journeys && t.journeyDay) {
    const day = weekdayDate(t.days[t.journeyDay]!.date, locale);
    const legs = d.journeys.legs.map((leg) => `${leg.name}, ${duration(leg.minutes)}`).join("; ");
    view.journeys =
      locale === "ca"
        ? `**Temps de viatge des de ${d.journeys.from}** (mediana dels trens del ${day}): ${legs}.`
        : locale === "es"
          ? `**Tiempo de viaje desde ${d.journeys.from}** (mediana de los trenes del ${day}): ${legs}.`
          : `**Journey time from ${d.journeys.from}** (median of the trains on ${day}): ${legs}.`;
  }
  return view;
}

// 21 Nov 2026: a day range missing from the feed is worded as missing data, never as "no trains" (readers took it for a closure).
function feedSentence(locale: Locale): string {
  const f = TIMETABLE.feed;
  const gap = f.gaps.length
    ? locale === "ca"
      ? `; encara no hi consten els horaris de Rodalies ${runsText(f.gaps, locale)}, cosa que no vol dir que aquells dies no hi hagi trens`
      : locale === "es"
        ? `; aún no incluye los horarios de Rodalies ${runsText(f.gaps, locale)}, lo que no significa que esos días no haya trenes`
        : `; it does not yet include Rodalies timetables ${runsText(f.gaps, locale)}, which does not mean there are no trains on those days`
    : "";
  if (locale === "ca") return `El fitxer cobreix ${runText([f.from, f.to], locale)} de ${f.to.slice(0, 4)}${gap}.`;
  if (locale === "es") return `El fichero cubre ${runText([f.from, f.to], locale)} de ${f.to.slice(0, 4)}${gap}.`;
  return `The file covers ${runText([f.from, f.to], locale, true)} ${f.to.slice(0, 4)}${gap}.`;
}

/** "21/11/2026 a les 03:09" from the dataset's "2026-11-21T03:09:19" (local time, as data.renfe.com gives it). */
function updatedText(locale: Locale): string {
  const u = TIMETABLE.source.updated;
  const date = `${u.slice(8, 10)}/${u.slice(5, 7)}/${u.slice(0, 4)}`;
  const time = u.slice(11, 16);
  if (!time) return date;
  return locale === "ca" ? `${date} a les ${time}` : locale === "es" ? `${date} a las ${time}` : `${date} at ${time}`;
}

export function attribution(locale: Locale): string {
  const s = TIMETABLE.source;
  const dataset = link("Horarios cercanías", s.dataset);
  const licence = link(s.licence, s.licenceUrl);
  if (locale === "ca")
    return `Origen de les dades: Renfe Operadora (${dataset}, GTFS, llicència ${licence}; fitxer actualitzat el ${updatedText(locale)}). Resum calculat per CatalunyaInfo; Renfe no participa en aquesta pàgina ni la patrocina.`;
  if (locale === "es")
    return `Origen de los datos: Renfe Operadora (${dataset}, GTFS, licencia ${licence}; fichero actualizado el ${updatedText(locale)}). Resumen calculado por CatalunyaInfo; Renfe no participa en esta página ni la patrocina.`;
  return `Data origin: Renfe Operadora (${dataset}, GTFS, licence ${licence}; file updated ${updatedText(locale)}). Summary worked out by CatalunyaInfo; Renfe does not take part in or sponsor this page.`;
}

function notes(line: SnapshotLine, t: LineTimetable, locale: Locale): string[] {
  const out: string[] = [];
  const name = the(line, locale);
  const search = link(locale === "ca" ? "cercador d'horaris de Rodalies" : locale === "es" ? "buscador de horarios de Rodalies" : "Rodalies journey planner", officialUrl.timetables(locale));

  // Days without a train.
  for (const type of DAY_TYPES) {
    const runs = t.noTrains[type];
    if (!runs.length) continue;
    const summary = t.days[type];
    const plural = cap(PLURAL[locale][type]);
    if (!summary) {
      const to = until(runs[runs.length - 1]![1], locale);
      out.push(
        locale === "ca"
          ? `**${plural}:** cap tren de ${name} al fitxer de Renfe (${PLURAL.ca[type]} ${to}, l'últim del fitxer).`
          : locale === "es"
            ? `**${plural}:** ningún tren de ${name} en el fichero de Renfe (${PLURAL.es[type]} ${to}, el último del fichero).`
            : `**${plural}:** no ${line.name} train in Renfe's file (${PLURAL.en[type]} ${to}, the last in the file).`,
      );
    } else {
      const shown = weekdayDate(summary.date, locale);
      out.push(
        locale === "ca"
          ? `**${plural}:** el fitxer de Renfe no porta cap tren de ${name} ${runsText(runs, locale)}; la columna és la del ${shown}.`
          : locale === "es"
            ? `**${plural}:** el fichero de Renfe no trae ningún tren de ${name} ${runsText(runs, locale)}; la columna es la del ${shown}.`
            : `**${plural}:** Renfe's file has no ${line.name} train ${runsText(runs, locale)}; the column is ${shown}.`,
      );
    }
  }

  // Do the figures hold for the other days of the file?
  const changed = DAY_TYPES.filter((type) => t.days[type]?.differentOn.length);
  const present = DAY_TYPES.filter((type) => t.days[type]);
  if (changed.length) {
    const list = joinList(
      changed.map((type) => {
        const runs = t.days[type]!.differentOn;
        if (locale === "ca") return `els ${PLURAL.ca[type]} ${runsText(runs, locale)}`;
        if (locale === "es") return `los ${PLURAL.es[type]} ${runsText(runs, locale)}`;
        return `${PLURAL.en[type]} (${runsText(runs, locale, true)})`;
      }),
      locale,
    );
    out.push(
      locale === "ca"
        ? `Les hores són les del dia que diu cada columna. Al fitxer de Renfe canvien ${list}: per a aquests dies, mira el ${search}.`
        : locale === "es"
          ? `Las horas son las del día que indica cada columna. En el fichero de Renfe cambian ${list}: para esos días, mira el ${search}.`
          : `The times are those of the day each column gives. In Renfe's file they change on ${list}: for those days, check the ${search}.`,
    );
  } else if (present.length) {
    const kinds = joinList(
      present.map((type) => PLURAL[locale][type]),
      locale,
    );
    const to = until(TIMETABLE.feed.to, locale);
    out.push(
      locale === "ca"
        ? `Al fitxer de Renfe són les mateixes tots els ${kinds} ${to}; abans de viatjar, mira també el ${search} i els avisos de dalt.`
        : locale === "es"
          ? `En el fichero de Renfe son las mismas todos los ${kinds} ${to}; antes de viajar, mira también el ${search} y los avisos de arriba.`
          : `In Renfe's file they are the same on all ${kinds} ${to}; before you travel, also check the ${search} and the notices above.`,
    );
  }

  // Holidays (only where there is a Sunday to compare with).
  if (t.days.sunday) {
    for (const h of t.holidays) {
      const day = ofDay(h.date, locale);
      out.push(
        h.sameAsSunday
          ? locale === "ca"
            ? `El festiu ${day} té al fitxer el mateix horari que un diumenge.`
            : locale === "es"
              ? `El festivo ${day} tiene en el fichero el mismo horario que un domingo.`
              : `The ${day} holiday runs a Sunday timetable in the file.`
          : locale === "ca"
            ? `El festiu ${day} té un horari propi al fitxer: mira el ${search}.`
            : locale === "es"
              ? `El festivo ${day} tiene un horario propio en el fichero: mira el ${search}.`
              : `The ${day} holiday has a timetable of its own in the file: check the ${search}.`,
      );
    }
  }

  // Replacement buses.
  if (t.buses) {
    const span = runText(t.buses.span, locale);
    const stops = joinList(t.buses.stops, locale);
    // No count: the file splits replacement journeys into many short legs.
    out.push(
      locale === "ca"
        ? `**Servei per carretera:** ${span} el fitxer de Renfe porta també autobusos de ${name}, amb sortida o arribada a ${stops}. Les hores de dalt són només dels trens; mira els avisos i el ${search}.`
        : locale === "es"
          ? `**Servicio por carretera:** ${span} el fichero de Renfe trae también autobuses de ${name}, con salida o llegada en ${stops}. Las horas de arriba son solo de los trenes; mira los avisos y el ${search}.`
          : `**Replacement buses:** ${span} Renfe's file also has ${line.name} buses, starting or ending at ${stops}. The times above are for trains only; check the notices and the ${search}.`,
    );
  }
  return out;
}

/** The timetable section of a line page; null when the snapshot has nothing for the line or its file has ended. */
export function timetableView(line: SnapshotLine, locale: Locale, today: string): TimetableView | null {
  if (!timetableCurrent(TIMETABLE, today)) return null;
  const t = TIMETABLE.lines[line.id];
  if (!t || t.directions.length === 0) return null;
  const cols = columns(t, locale);
  if (cols.length === 0) return null;
  const name = the(line, locale);
  const title =
    locale === "ca"
      ? `Horaris de ${name}: primer i últim tren i cada quant passa`
      : locale === "es"
        ? `Horarios de ${name}: primer y último tren y cada cuánto pasa`
        : `${line.name} timetable: first and last train and how often it runs`;
  const intro =
    locale === "ca"
      ? `Resum de l'horari oficial de Renfe per a ${name}, en cada sentit: el primer i l'últim tren de les estacions principals, quants trens passen per hora i quant es triga. Cada columna diu de quin dia són les hores. ${feedSentence(locale)}`
      : locale === "es"
        ? `Resumen del horario oficial de Renfe para ${name}, en cada sentido: el primer y el último tren de las estaciones principales, cuántos trenes pasan por hora y cuánto se tarda. Cada columna dice de qué día son las horas. ${feedSentence(locale)}`
        : `A summary of Renfe's official timetable for the ${line.name}, in each direction: the first and last train from the main stations, how many trains an hour and how long the trip takes. Each column says which day the times are from. ${feedSentence(locale)}`;
  return {
    id: TIMETABLE_ID,
    title,
    intro,
    directions: t.directions.map((d) => directionView(t, d, cols, locale)),
    notes: notes(line, t, locale),
    attribution: attribution(locale),
  };
}

/* -------------------------------------------------------------------------- */
/* FAQ, in the searched words                                                 */
/* -------------------------------------------------------------------------- */

function stationDay(d: DirectionTimetable, id: string | null, type: DayType) {
  return id ? (d.stations.find((s) => s.id === id)?.days[type] ?? null) : null;
}

/** "a les 05:18 des de Sant Vicenç de Calders cap a Barcelona-Estació de França" and the other direction. */
function endsPhrase(t: LineTimetable, type: DayType, which: "first" | "last", locale: Locale): string | null {
  const parts = t.directions
    .map((d) => {
      const origin = originOf(d);
      const day = stationDay(d, origin, type);
      if (!day || !origin) return null;
      const from = d.stations.find((s) => s.id === origin)!.name;
      const time = day[which];
      return locale === "ca"
        ? `a les ${time} des de ${from} cap a ${d.towards}`
        : locale === "es"
          ? `a las ${time} desde ${from} hacia ${d.towards}`
          : `at ${time} from ${from} towards ${d.towards}`;
    })
    .filter((p): p is string => p !== null);
  return parts.length ? joinList(parts, locale) : null;
}

export function timetableFaq(line: SnapshotLine, locale: Locale, today: string): { question: string; answer: string }[] {
  if (!timetableCurrent(TIMETABLE, today)) return [];
  const t = TIMETABLE.lines[line.id];
  if (!t || t.directions.length === 0) return [];
  const cols = columns(t, locale);
  const name = the(line, locale);
  const Name = cap(name);
  const source = (type: DayType) => {
    const date = dayMonthYear(t.days[type]!.date, locale);
    return locale === "ca" ? `horari de Renfe del ${date}` : locale === "es" ? `horario de Renfe del ${date}` : `Renfe timetable for ${date}`;
  };
  const out: { question: string; answer: string }[] = [];

  for (const which of ["first", "last"] as const) {
    const parts = cols
      .map((c) => {
        const phrase = endsPhrase(t, c.type, which, locale);
        if (!phrase) return null;
        const label = c.label.toLowerCase();
        return locale === "en" ? `${c.label} (${source(c.type)}): ${phrase}` : `${cap(label)} (${source(c.type)}): ${phrase}`;
      })
      .filter((p): p is string => p !== null);
    if (!parts.length) continue;
    const question =
      which === "first"
        ? locale === "ca"
          ? `A quina hora passa el primer tren de ${name}?`
          : locale === "es"
            ? `¿A qué hora pasa el primer tren de ${name}?`
            : `What time is the first ${line.name} train?`
        : locale === "ca"
          ? `A quina hora surt l'últim tren de ${name}?`
          : locale === "es"
            ? `¿A qué hora sale el último tren de ${name}?`
            : `What time is the last ${line.name} train?`;
    out.push({ question, answer: `${parts.join(". ")}.` });
  }

  // How often: the first direction, weekday column.
  const d = t.directions[0]!;
  const weekday = t.days.weekday ? "weekday" : (cols[0]?.type ?? null);
  if (weekday) {
    const colLabel = cols.find((c) => c.type === weekday)!.label.toLowerCase();
    const question = locale === "ca" ? `Cada quant passa ${name}?` : locale === "es" ? `¿Cada cuánto pasa ${name}?` : `How often does the ${line.name} run?`;
    if (d.listed) {
      const times = d.listed.days[weekday] ?? [];
      const n = times.length;
      const answer =
        locale === "ca"
          ? `${Name} té ${trainsWord(n, locale)} al dia des de ${d.listed.name} cap a ${d.towards} (${colLabel}, ${source(weekday)}): ${joinList(times, locale)}.`
          : locale === "es"
            ? `${Name} tiene ${trainsWord(n, locale)} al día desde ${d.listed.name} hacia ${d.towards} (${colLabel}, ${source(weekday)}): ${joinList(times, locale)}.`
            : `The ${line.name} has ${trainsWord(n, locale)} a day from ${d.listed.name} towards ${d.towards} (${colLabel}, ${source(weekday)}): ${joinList(times, locale)}.`;
      out.push({ question, answer });
    } else if (d.frequencyAt && d.bands[weekday]) {
      const bands = d.bands[weekday]!;
      const parts = [1, 2, 3]
        .map((i) => ({ i, band: bands[i]! }))
        .filter(({ band }) => band.trains >= 2 && band.perHour !== null && band.gap !== null)
        .map(({ i, band }) => {
          const label = bandLabel(i, locale).toLowerCase();
          return locale === "ca"
            ? `${decimal(band.perHour!, locale)} per hora ${label} (un cada ${band.gap} min de mitjana)`
            : locale === "es"
              ? `${decimal(band.perHour!, locale)} por hora ${label} (uno cada ${band.gap} min de media)`
              : `${decimal(band.perHour!, locale)} an hour ${label} (one every ${band.gap} min on average)`;
        });
      if (parts.length) {
        const answer =
          locale === "ca"
            ? `En ${colLabel === "feiners" ? "un dia feiner" : colLabel} (${source(weekday)}), a ${d.frequencyAt.name} cap a ${d.towards} hi passen ${joinList(parts, locale)}. La taula de dalt té totes les franges, l'altre sentit i el cap de setmana.`
            : locale === "es"
              ? `En ${colLabel === "laborables" ? "un día laborable" : colLabel} (${source(weekday)}), en ${d.frequencyAt.name} hacia ${d.towards} pasan ${joinList(parts, locale)}. La tabla de arriba tiene todas las franjas, el otro sentido y el fin de semana.`
              : `On ${colLabel === "weekdays" ? "a weekday" : colLabel} (${source(weekday)}), ${joinList(parts, locale)} pass ${d.frequencyAt.name} towards ${d.towards}. The table above has every time band, the other direction and weekends.`;
        out.push({ question, answer });
      }
    }
  }

  // Journey time end to end.
  const j = d.journeys;
  if (j && t.journeyDay && j.legs.length) {
    const last = j.legs[j.legs.length - 1]!;
    const others = j.legs.slice(0, -1).map((leg) => `${leg.name}, ${duration(leg.minutes)}`);
    const question =
      locale === "ca"
        ? `Quant triga ${name} de ${j.from} a ${last.name}?`
        : locale === "es"
          ? `¿Cuánto tarda ${name} de ${j.from} a ${last.name}?`
          : `How long does the ${line.name} take from ${j.from} to ${last.name}?`;
    const tail = others.length ? (locale === "ca" ? ` Fins a ${others.join("; ")}.` : locale === "es" ? ` Hasta ${others.join("; ")}.` : ` To ${others.join("; ")}.`) : "";
    const answer =
      locale === "ca"
        ? `${cap(duration(last.minutes))} de mediana (${trainsWord(last.trips, locale)} que fan el trajecte sencer, ${source(t.journeyDay)}).${tail}`
        : locale === "es"
          ? `${cap(duration(last.minutes))} de mediana (${trainsWord(last.trips, locale)} que hacen el trayecto entero, ${source(t.journeyDay)}).${tail}`
          : `${duration(last.minutes)} (median of the ${trainsWord(last.trips, locale)} that run the whole way, ${source(t.journeyDay)}).${tail}`;
    out.push({ question, answer });
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* Line-to-line links and the hub table                                       */
/* -------------------------------------------------------------------------- */

/** "Horaris R1", "Horarios R2 Sud", "R4 timetable": the anchor words people search. */
export function timetableLinkLabel(name: string, locale: Locale): string {
  return locale === "ca" ? `Horaris ${name}` : locale === "es" ? `Horarios ${name}` : `${name} timetable`;
}

export function timetableLinks(lines: readonly SnapshotLine[], self: LineId | null, locale: Locale): { label: string; href: string }[] {
  return lines.filter((l) => l.id !== self).map((l) => ({ label: timetableLinkLabel(l.name, locale), href: `${linePath(locale, l.id)}#${TIMETABLE_ID}` }));
}

export interface HubTimetable {
  title: string;
  note: string;
  headers: [string, string, string, string];
  rows: { id: LineId; label: string; href: string; station: string; times: string; peak: string }[];
  attribution: string;
}

export function hubTimetable(lines: readonly SnapshotLine[], locale: Locale, today: string): HubTimetable | null {
  if (!timetableCurrent(TIMETABLE, today)) return null;
  const weekdayDates = lines.map((l) => TIMETABLE.lines[l.id]?.days.weekday?.date).filter((d): d is string => Boolean(d));
  const counts = new Map<string, number>();
  for (const d of weekdayDates) counts.set(d, (counts.get(d) ?? 0) + 1);
  const common = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0];
  if (!common) return null;
  const rows: HubTimetable["rows"] = [];
  for (const line of lines) {
    const t = TIMETABLE.lines[line.id];
    const d = t?.directions[0];
    const day = t?.days.weekday;
    if (!t || !d || !day) continue;
    // Regional lines: the station whose every departure the line page lists; the rest: the busiest one.
    const at = d.listed ? { id: d.listed.id, name: d.listed.name } : (d.frequencyAt ?? (d.stations[0] ? { id: d.stations[0].id, name: d.stations[0].name } : null));
    const times = at ? stationDay(d, at.id, "weekday") : null;
    if (!at || !times) continue;
    const other = day.date !== common ? ` (${dayMonth(day.date, locale)})` : "";
    const peakBand = d.bands.weekday?.[1];
    const peak = d.listed
      ? locale === "ca"
        ? `${trainsWord(d.listed.days.weekday?.length ?? 0, locale)} al dia`
        : locale === "es"
          ? `${trainsWord(d.listed.days.weekday?.length ?? 0, locale)} al día`
          : `${trainsWord(d.listed.days.weekday?.length ?? 0, locale)} a day`
      : peakBand
        ? bandCell(peakBand, locale)
        : "—";
    rows.push({
      id: line.id,
      label: timetableLinkLabel(line.name, locale),
      href: `${linePath(locale, line.id)}#${TIMETABLE_ID}`,
      station: `${at.name} → ${d.towards}`,
      times: `${times.first} – ${times.last}${other}`,
      peak,
    });
  }
  const date = weekdayDate(common, locale);
  return {
    title: locale === "ca" ? "Horaris de Rodalies: primer i últim tren de cada línia" : locale === "es" ? "Horarios de Rodalies: primer y último tren de cada línea" : "Rodalies timetables: first and last train on every line",
    note:
      locale === "ca"
        ? `Un dia feiner (el ${date}, si no es diu una altra data), a l'estació amb més trens de cada línia (a les regionals, on comencen) i en el sentit indicat, segons l'horari oficial de Renfe. A la pàgina de cada línia hi ha els dos sentits, el cap de setmana i quant es triga. ${feedSentence(locale)}`
        : locale === "es"
          ? `Un día laborable (el ${date}, salvo que se indique otra fecha), en la estación con más trenes de cada línea (en las regionales, donde empiezan) y en el sentido indicado, según el horario oficial de Renfe. En la página de cada línea están los dos sentidos, el fin de semana y cuánto se tarda. ${feedSentence(locale)}`
          : `On a weekday (${date}, unless another date is given), at each line's busiest station (on regional lines, where they start) and in the direction shown, from Renfe's official timetable. Each line's page has both directions, weekends and journey times. ${feedSentence(locale)}`,
    headers:
      locale === "ca"
        ? ["Línia", "Estació i sentit", "Primer i últim tren", "De 7 a 10 h"]
        : locale === "es"
          ? ["Línea", "Estación y sentido", "Primer y último tren", "De 7 a 10 h"]
          : ["Line", "Station and direction", "First and last train", "07:00–10:00"],
    rows,
    attribution: attribution(locale),
  };
}

/** Label of the line-to-line timetable links on a line page. */
export function timetableLinksLabel(locale: Locale): string {
  return locale === "ca" ? "Horaris de les altres línies" : locale === "es" ? "Horarios de las otras líneas" : "Timetables of the other lines";
}
