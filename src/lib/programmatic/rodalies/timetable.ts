/**
 * Timetable summary per Rodalies line and direction, from Renfe's official
 * GTFS ("Horarios cercanías", data.renfe.com/dataset/horarios-cercanias).
 *
 * Licence and terms (read 21 Nov 2026):
 *  - the dataset is CC BY 4.0 (CKAN `license_id` "CC-BY-4.0" on
 *    data.renfe.com; the build refuses any other value);
 *  - data.renfe.com/legal ("Condiciones generales para la reutilización"):
 *    cite the source, "Origen de los datos: Renfe Operadora"; give the date
 *    of the last update when the document carries it; do not distort the
 *    information; do not suggest that Renfe takes part in, sponsors or
 *    supports the reuse. The pages print all three.
 *
 * The feed is one file for every Cercanías network in Spain, refreshed daily,
 * with one service per calendar day and about 30 days ahead (21 Nov 2026:
 * 21 Nov to 20 Dec, no Rodalies trips 30 Nov to 4 Dec). Replacement buses
 * travel in it as routes of type 3, under the line's own name.
 *
 * Built by `npm run rodalies:timetable -- build` into timetable.json; never
 * read per request. Everything here is pure: the script feeds it parsed GTFS
 * rows, the tests a small fixture.
 */

import type { LineId, SnapshotLine } from "./types";

/* -------------------------------------------------------------------------- */
/* Rules                                                                      */
/* -------------------------------------------------------------------------- */

/** The test fails when the snapshot is older than this (the feed looks ~30 days ahead). */
export const TIMETABLE_MAX_AGE_DAYS = 21;

export const TIMETABLE_SOURCE = {
  name: "Horarios cercanías (GTFS)",
  publisher: "Renfe Operadora",
  dataset: "https://data.renfe.com/dataset/horarios-cercanias",
  api: "https://data.renfe.com/api/3/action/package_show?id=horarios-cercanias",
  url: "https://ssl.renfe.com/ftransit/Fichero_CER_FOMENTO/fomento_transit.zip",
  licence: "CC BY 4.0",
  licenceId: "CC-BY-4.0",
  licenceUrl: "https://creativecommons.org/licenses/by/4.0/",
  terms: "https://data.renfe.com/legal",
  attribution: "Origen de los datos: Renfe Operadora",
} as const;

export type DayType = "weekday" | "saturday" | "sunday";
export const DAY_TYPES: readonly DayType[] = ["weekday", "saturday", "sunday"];

/**
 * Time bands for "trains per hour". The first and last are open (before 7:00,
 * from 23:00): they get a count, not a rate.
 */
export const BANDS: readonly { from: string | null; to: string | null }[] = [
  { from: null, to: "07:00" },
  { from: "07:00", to: "10:00" },
  { from: "10:00", to: "17:00" },
  { from: "17:00", to: "20:00" },
  { from: "20:00", to: "23:00" },
  { from: "23:00", to: null },
];

/** Up to this many departures a day, the page lists every time instead of trains per hour. */
export const LIST_UP_TO = 16;

/**
 * The stations a reader asks about on each line, by station code (the
 * snapshot's ids, shared with the GTFS `stop_id`), in line order: both ends,
 * the central Barcelona stop, the big towns and the stations where trains
 * start or end during long works. An editorial choice; the times come from
 * the feed, and a station without a train in it is left off the page. The
 * test holds every id to the line's stations.
 */
export const MAIN_STATIONS: Record<LineId, readonly string[]> = {
  // Molins de Rei and L'Hospitalet: the line's end and where its trains start in the 21 Nov 2026 feed.
  R1: ["72300", "72305", "78805", "79500", "79606", "79200"], // + Pl. Catalunya, Mataró, Blanes, Maçanet
  R2: ["71705", "71706", "71707", "71801", "79100"], // Castelldefels, Gavà, El Prat, Sants, Granollers Centre
  R2N: ["72400", "71801", "71802", "79100", "79104", "79200"], // Aeroport, Sants, Passeig de Gràcia, Granollers Centre, Sant Celoni, Maçanet
  R2S: ["71600", "71700", "71701", "71801", "79400"], // Sant Vicenç, Vilanova, Sitges, Sants, Estació de França
  // Sant Martí de Centelles: where the trains start while buses replace them from Barcelona (21 Nov 2026 feed).
  R3: ["72305", "78805", "77006", "77104", "77109", "77200", "77309"], // L'Hospitalet, Pl. Catalunya, Granollers-Canovelles, Sant Martí, Vic, Ripoll, Puigcerdà
  R4: ["71600", "72204", "72209", "71801", "78704", "78700", "78600"], // Sant Vicenç, Vilafranca, Martorell, Sants, Sabadell Centre, Terrassa, Manresa
  R7: ["78802", "78706", "72503"], // Fabra i Puig, Cerdanyola del Vallès, Cerdanyola-Universitat
  R8: ["72209", "72501", "72503", "79100"], // Martorell Central, Rubí, Cerdanyola-Universitat, Granollers Centre
  R11: ["71801", "71802", "79300", "79309", "79315"], // Sants, Passeig de Gràcia, Girona, Figueres, Portbou
  R13: ["79400", "71801", "76004", "73100", "73008", "73003", "78400"], // Estació de França, Sants, Valls, La Plana-Picamoixons, Montblanc, Les Borges Blanques, Lleida
  R14: ["79400", "71801", "71500", "71400", "73100", "78400"], // Estació de França, Sants, Tarragona, Reus, La Plana-Picamoixons, Lleida
  R15: ["79400", "71801", "71500", "71400", "71300", "71209"], // Estació de França, Sants, Tarragona, Reus, Móra la Nova, Riba-roja
  R16: ["79400", "71801", "71500", "65422", "65400", "65314"], // Estació de França, Sants, Tarragona, Cambrils, Tortosa, Ulldecona
  R17: ["79400", "71801", "71500", "65411"], // Estació de França, Sants, Tarragona, Salou - Port Aventura
  RG1: ["78805", "79500", "79200", "79300", "79309", "79315"], // Pl. Catalunya, Mataró, Maçanet, Girona, Figueres, Portbou
  RT1: ["71500", "71400", "73100"], // Tarragona, Reus, La Plana-Picamoixons
  RT2: ["71500", "65411"], // Tarragona, Salou - Port Aventura
  RL3: ["78500", "78408", "78403", "78400"], // Cervera, Tàrrega, Mollerussa, Lleida
  RL4: ["78700", "78600", "78503", "78500", "78400"], // Terrassa, Manresa, Calaf, Cervera, Lleida
};

/* -------------------------------------------------------------------------- */
/* Snapshot shape                                                             */
/* -------------------------------------------------------------------------- */

/** An inclusive run of dates ("2026-12-07" to "2026-12-18"); one day when equal. */
export type DateRun = [string, string];

export interface StationDay {
  /** "HH:MM", local clock; after midnight reads "00:12" and still sorts last (`serviceMinutes`). */
  first: string;
  last: string;
  /** Departures in this direction that day. */
  trains: number;
}

export interface BandCount {
  trains: number;
  /** Trains per hour, one decimal; null for the open bands. */
  perHour: number | null;
  /**
   * Mean minutes between trains in the band (first to last over the gaps):
   * the median misleads where trains come in pairs (R2 Sud at Sants, 17-20 h:
   * 4 an hour, median gap 21 min). Null under two trains.
   */
  gap: number | null;
}

export interface DirectionTimetable {
  /** The line end it runs towards, as the line snapshot names it. */
  towards: string;
  towardsId: string;
  /** Where the trains per hour are counted: the main station with most departures. */
  frequencyAt: { id: string; name: string } | null;
  /** Main stations with a departure in this direction, in travel order. */
  stations: { id: string; name: string; days: Record<DayType, StationDay | null> }[];
  /** One entry per BANDS item, at `frequencyAt`. */
  bands: Record<DayType, BandCount[] | null>;
  /**
   * Every departure from the direction's origin (the first main station with
   * at least a third of the busiest one's departures), per day type, when neither it nor `frequencyAt` has
   * more than LIST_UP_TO on any day: the regional lines' whole timetable.
   */
  listed: { id: string; name: string; days: Record<DayType, string[] | null> } | null;
  /** Median minutes from the direction's origin (see `listed`) to each later main station, on `journeyDay`. */
  journeys: { fromId: string; from: string; legs: { id: string; name: string; minutes: number; trips: number }[] } | null;
}

export interface DaySummary {
  /** The day the summary is from (first day of that type after the build with a train). */
  date: string;
  trains: number;
  buses: number;
  /** First and last day of that type in the file after the build. */
  span: DateRun;
  /** Days of that type, after `date`, whose first/last/frequency figures differ. */
  differentOn: DateRun[];
}

export interface LineTimetable {
  id: LineId;
  days: Record<DayType, DaySummary | null>;
  /** Days of each type (after the build) with no train of the line at all. */
  noTrains: Record<DayType, DateRun[]>;
  /** Public holidays in the file and whether their figures equal those of a Sunday in it. */
  holidays: { date: string; sameAsSunday: boolean }[];
  /** Saturday and Sunday figures are the same: one column on the page. */
  saturdayIsSunday: boolean;
  /** The day type the journey times and the frequency station come from. */
  journeyDay: DayType | null;
  directions: DirectionTimetable[];
  /** Replacement road services (route type 3) of the line in the file. */
  buses: { span: DateRun; trips: number; stops: string[] } | null;
}

export interface TimetableSnapshot {
  /** Madrid date of the build. */
  builtOn: string;
  source: typeof TIMETABLE_SOURCE & {
    /** The resource's last update as data.renfe.com states it (ISO, local time). */
    updated: string;
  };
  /** Days with Rodalies trips in the file: first, last, and the runs missing in between. */
  feed: { from: string; to: string; gaps: DateRun[] };
  lines: Record<LineId, LineTimetable>;
}

/* -------------------------------------------------------------------------- */
/* Time helpers                                                               */
/* -------------------------------------------------------------------------- */

/** GTFS "25:09:00" -> 1509 minutes after the service day's midnight. */
export function gtfsMinutes(value: string): number {
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());
  if (!m) throw new Error(`not a GTFS time: ${value}`);
  return Number(m[1]) * 60 + Number(m[2]);
}

/** 1509 -> "01:09". */
export function clock(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  return `${String(h).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

/**
 * "HH:MM" back to minutes of the service day: Rodalies runs from about 4:30,
 * so a time before 04:00 belongs to the night after (00:12 sorts after 23:50).
 */
export function serviceMinutes(hhmm: string): number {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(hhmm);
  if (!m) throw new Error(`not HH:MM: ${hhmm}`);
  const minutes = Number(m[1]) * 60 + Number(m[2]);
  return minutes < 240 ? minutes + 1440 : minutes;
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : Math.round((sorted[mid - 1]! + sorted[mid]!) / 2);
}

/** ISO date -> its day of the week, 0 Sunday … 6 Saturday. */
export function weekday(iso: string): number {
  return new Date(`${iso}T12:00:00Z`).getUTCDay();
}

export function dayTypeOf(iso: string, holidays: ReadonlySet<string>): DayType | "holiday" {
  if (holidays.has(iso)) return "holiday";
  const d = weekday(iso);
  return d === 0 ? "sunday" : d === 6 ? "saturday" : "weekday";
}

function addDay(iso: string, n = 1): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Calendar runs missing between the first and last of `dates` (sorted ISO dates). */
export function gaps(dates: readonly string[]): DateRun[] {
  const out: DateRun[] = [];
  for (let i = 1; i < dates.length; i++) {
    const after = addDay(dates[i - 1]!);
    if (after < dates[i]!) out.push([after, addDay(dates[i]!, -1)]);
  }
  return out;
}

/** `picked` (a subset of `all`, both sorted) as runs of neighbours in `all`. */
export function runsWithin(picked: readonly string[], all: readonly string[]): DateRun[] {
  const set = new Set(picked);
  const out: DateRun[] = [];
  let open: DateRun | null = null;
  for (const d of all) {
    if (set.has(d)) {
      if (open) open[1] = d;
      else open = [d, d];
    } else if (open) {
      out.push(open);
      open = null;
    }
  }
  if (open) out.push(open);
  return out;
}

/* -------------------------------------------------------------------------- */
/* Builder                                                                    */
/* -------------------------------------------------------------------------- */

/** One GTFS trip of a Rodalies line, already joined to its route and calendar. */
export interface FeedTrip {
  line: LineId;
  /** Route type 3 (road): a replacement bus. */
  bus: boolean;
  /** The days it runs (ISO). */
  dates: readonly string[];
  /** In stop_sequence order; minutes after the service day's midnight. */
  stops: readonly { station: string; arrival: number; departure: number }[];
}

interface Directed {
  dir: 0 | 1;
  stops: FeedTrip["stops"];
  dates: readonly string[];
}

const bandBounds = BANDS.map((b) => ({
  from: b.from ? gtfsMinutes(b.from) : -Infinity,
  to: b.to ? gtfsMinutes(b.to) : Infinity,
  hours: b.from && b.to ? (gtfsMinutes(b.to) - gtfsMinutes(b.from)) / 60 : null,
}));

function bandCounts(departures: number[]): BandCount[] {
  const sorted = [...departures].sort((a, b) => a - b);
  return bandBounds.map((band) => {
    const inBand = sorted.filter((t) => t >= band.from && t < band.to);
    return {
      trains: inBand.length,
      perHour: band.hours === null ? null : Math.round((inBand.length / band.hours) * 10) / 10,
      gap: inBand.length < 2 ? null : Math.round((inBand[inBand.length - 1]! - inBand[0]!) / (inBand.length - 1)),
    };
  });
}

/** Departures (minutes) from `station` in direction `dir` on `date`; the trip's final stop is not a departure. */
function departuresFrom(trips: Directed[], dir: 0 | 1, station: string, date: string): number[] {
  const out: number[] = [];
  for (const trip of trips) {
    if (trip.dir !== dir || !trip.dates.includes(date)) continue;
    const at = trip.stops.findIndex((s) => s.station === station);
    if (at >= 0 && at < trip.stops.length - 1) out.push(trip.stops[at]!.departure);
  }
  return out;
}

export interface BuildOptions {
  /** Only days after this one count (the build day, Madrid). */
  after: string;
  /** Catalonia-wide public holidays (ISO). */
  holidays: readonly string[];
  /** Every day with a Rodalies trip in the file (sorted ISO). */
  feedDates: readonly string[];
}

export function buildLineTimetable(line: SnapshotLine, trips: readonly FeedTrip[], options: BuildOptions): LineTimetable {
  const order = new Map(line.stations.map((s, i) => [s.id, i]));
  const names = new Map(line.stations.map((s) => [s.id, s.name]));
  const interchanges = new Map(line.stations.map((s) => [s.id, s.lines.length + s.transfers.length]));
  const main = MAIN_STATIONS[line.id];
  for (const id of main) if (!order.has(id)) throw new Error(`${line.id}: main station ${id} is not on the line`);
  const holidays = new Set(options.holidays);
  const days = options.feedDates.filter((d) => d > options.after);

  // Trains with a direction: from their first to their last stop on this line's list.
  const directed: Directed[] = [];
  const buses = trips.filter((t) => t.line === line.id && t.bus);
  for (const trip of trips) {
    if (trip.line !== line.id || trip.bus) continue;
    const known = trip.stops.filter((s) => order.has(s.station));
    if (known.length < 2) continue;
    const a = order.get(known[0]!.station)!;
    const b = order.get(known[known.length - 1]!.station)!;
    if (a === b) continue;
    directed.push({ dir: b > a ? 0 : 1, stops: trip.stops, dates: trip.dates.filter((d) => d > options.after) });
  }
  const trainsOn = (date: string) => directed.filter((t) => t.dates.includes(date)).length;

  const candidates: Record<DayType, string[]> = { weekday: [], saturday: [], sunday: [] };
  const holidayDays: string[] = [];
  for (const d of days) {
    const type = dayTypeOf(d, holidays);
    if (type === "holiday") holidayDays.push(d);
    else candidates[type].push(d);
  }
  const reference: Record<DayType, string | null> = {
    weekday: candidates.weekday.find((d) => trainsOn(d) > 0) ?? null,
    saturday: candidates.saturday.find((d) => trainsOn(d) > 0) ?? null,
    sunday: candidates.sunday.find((d) => trainsOn(d) > 0) ?? null,
  };
  const journeyDay = DAY_TYPES.find((t) => reference[t] !== null) ?? null;
  const baseDate = journeyDay ? reference[journeyDay]! : null;

  // Per direction: the main stations in travel order, the last one being where it ends.
  const directions = ([0, 1] as const).map((dir) => {
    const inOrder = dir === 0 ? [...main] : [...main].reverse();
    const towardsId = dir === 0 ? line.stations[line.stations.length - 1]!.id : line.stations[0]!.id;
    const from = inOrder.slice(0, -1);
    // Most departures; on a tie, the bigger interchange (Plaça de Catalunya before Mataró), then travel order.
    let frequencyAt: string | null = null;
    if (baseDate) {
      let best = { n: 0, links: -1 };
      for (const id of from) {
        const n = departuresFrom(directed, dir, id, baseDate).length;
        const links = interchanges.get(id) ?? 0;
        if (n > best.n || (n === best.n && n > 0 && links > best.links)) {
          best = { n, links };
          frequencyAt = id;
        }
      }
    }
    return { dir, inOrder, from, towardsId, frequencyAt };
  });

  /** Everything a page prints for one day: compared across days to find the ones that differ. */
  const figures = (date: string) =>
    directions.map((d) => ({
      stations: d.from.map((id) => {
        const deps = departuresFrom(directed, d.dir, id, date);
        return deps.length ? { first: Math.min(...deps), last: Math.max(...deps), trains: deps.length } : null;
      }),
      bands: d.frequencyAt ? bandCounts(departuresFrom(directed, d.dir, d.frequencyAt, date)) : null,
    }));
  const signature = (date: string) => JSON.stringify(figures(date));

  const summaries = {} as Record<DayType, DaySummary | null>;
  const noTrains = {} as Record<DayType, DateRun[]>;
  for (const type of DAY_TYPES) {
    const list = candidates[type];
    noTrains[type] = runsWithin(
      list.filter((d) => trainsOn(d) === 0),
      list,
    );
    const ref = reference[type];
    if (!ref) {
      summaries[type] = null;
      continue;
    }
    const sig = signature(ref);
    const later = list.filter((d) => d > ref && trainsOn(d) > 0 && signature(d) !== sig);
    summaries[type] = {
      date: ref,
      trains: trainsOn(ref),
      buses: buses.filter((b) => b.dates.includes(ref)).length,
      span: [list[0]!, list[list.length - 1]!],
      differentOn: runsWithin(later, list),
    };
  }

  const sundaySig = reference.sunday ? signature(reference.sunday) : null;
  const saturdaySig = reference.saturday ? signature(reference.saturday) : null;
  // A holiday "runs the Sunday timetable" when its figures equal those of any Sunday in the file.
  const sundaySigs = new Set(candidates.sunday.filter((d) => trainsOn(d) > 0).map(signature));

  const out: DirectionTimetable[] = [];
  for (const d of directions) {
    const stations = d.from
      .map((id) => {
        const perDay = {} as Record<DayType, StationDay | null>;
        for (const type of DAY_TYPES) {
          const ref = reference[type];
          const deps = ref ? departuresFrom(directed, d.dir, id, ref) : [];
          perDay[type] = deps.length ? { first: clock(Math.min(...deps)), last: clock(Math.max(...deps)), trains: deps.length } : null;
        }
        return { id, name: names.get(id)!, days: perDay };
      })
      .filter((s) => DAY_TYPES.some((t) => s.days[t]));
    if (stations.length === 0) continue;
    const bands = {} as Record<DayType, BandCount[] | null>;
    for (const type of DAY_TYPES) {
      const ref = reference[type];
      bands[type] = ref && d.frequencyAt ? bandCounts(departuresFrom(directed, d.dir, d.frequencyAt, ref)) : null;
    }
    let journeys: DirectionTimetable["journeys"] = null;
    let listed: DirectionTimetable["listed"] = null;
    // Where most trains start: the first main station with at least a third of the busiest one's
    // departures (Sant Celoni, not Maçanet's 3 trains, for the R2 Nord to the airport).
    let origin: string | undefined;
    if (baseDate) {
      const counts = d.from.map((id) => ({ id, n: departuresFrom(directed, d.dir, id, baseDate).length }));
      const most = Math.max(0, ...counts.map((c) => c.n));
      origin = most > 0 ? counts.find((c) => c.n * 3 >= most)?.id : undefined;
    }
    if (origin) {
      const perDay = {} as Record<DayType, string[] | null>;
      for (const type of DAY_TYPES) {
        const ref = reference[type];
        const deps = ref ? departuresFrom(directed, d.dir, origin, ref).sort((a, b) => a - b) : [];
        perDay[type] = deps.length ? deps.map(clock) : null;
      }
      // Only where the whole direction is sparse: its busiest main station too.
      const sparse = DAY_TYPES.every((t) => {
        const ref = reference[t];
        const busiest = ref && d.frequencyAt ? departuresFrom(directed, d.dir, d.frequencyAt, ref).length : 0;
        return (perDay[t]?.length ?? 0) <= LIST_UP_TO && busiest <= LIST_UP_TO;
      });
      if (sparse) listed = { id: origin, name: names.get(origin)!, days: perDay };
    }
    if (baseDate) {
      if (origin) {
        const legs = d.inOrder
          .slice(d.inOrder.indexOf(origin) + 1)
          .map((id) => {
            const minutes: number[] = [];
            for (const trip of directed) {
              if (trip.dir !== d.dir || !trip.dates.includes(baseDate)) continue;
              const a = trip.stops.findIndex((s) => s.station === origin);
              const b = trip.stops.findIndex((s) => s.station === id);
              if (a >= 0 && b > a) minutes.push(trip.stops[b]!.arrival - trip.stops[a]!.departure);
            }
            const m = median(minutes);
            return m === null ? null : { id, name: names.get(id)!, minutes: m, trips: minutes.length };
          })
          .filter((leg): leg is NonNullable<typeof leg> => leg !== null);
        if (legs.length) journeys = { fromId: origin, from: names.get(origin)!, legs };
      }
    }
    out.push({
      towards: names.get(d.towardsId)!,
      towardsId: d.towardsId,
      frequencyAt: d.frequencyAt ? { id: d.frequencyAt, name: names.get(d.frequencyAt)! } : null,
      stations,
      bands,
      listed,
      journeys,
    });
  }

  const busDays = [...new Set(buses.flatMap((b) => b.dates).filter((d) => d > options.after))].sort();
  const busStops = new Set<string>();
  for (const bus of buses) {
    for (const s of [bus.stops[0], bus.stops[bus.stops.length - 1]]) if (s && order.has(s.station)) busStops.add(s.station);
  }

  return {
    id: line.id,
    days: summaries,
    noTrains,
    holidays: holidayDays.map((date) => ({ date, sameAsSunday: trainsOn(date) > 0 && sundaySigs.has(signature(date)) })),
    saturdayIsSunday: saturdaySig !== null && saturdaySig === sundaySig,
    journeyDay,
    directions: out,
    buses: busDays.length
      ? {
          span: [busDays[0]!, busDays[busDays.length - 1]!],
          trips: buses.filter((b) => b.dates.some((d) => d > options.after)).length,
          stops: [...busStops].sort((a, b) => order.get(a)! - order.get(b)!).map((id) => names.get(id)!),
        }
      : null,
  };
}

/* -------------------------------------------------------------------------- */
/* Reading the snapshot                                                       */
/* -------------------------------------------------------------------------- */

/** The figures stay on the page only while today is inside the file. */
export function timetableCurrent(snapshot: Pick<TimetableSnapshot, "feed">, today: string): boolean {
  return today <= snapshot.feed.to;
}

/** "1 h 12 min", "45 min". */
export function duration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h} h${m ? ` ${m} min` : ""}` : `${m} min`;
}
