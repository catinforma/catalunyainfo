import type { Region } from "@/lib/programmatic/holidays/boe-2027";

/**
 * Types of the regulated street parking family ("zona azul" by city). No data
 * and no logic here: the client component imports these as types only.
 */

export type ZaLocale = "es" | "ca" | "en";
export type L = Record<ZaLocale, string>;

/** One paid stretch of a day, "HH:MM" to "HH:MM" (24 h clock, Europe/Madrid). */
export type Range = readonly [string, string];

/** The paid hours of each kind of day; an empty list means parking is free that day. */
export interface DaySchedule {
  weekday: readonly Range[];
  saturday: readonly Range[];
  sunday: readonly Range[];
  holiday: readonly Range[];
}

/** A stretch of the year with its own timetable (August in Madrid, July and August in Sevilla). */
export interface Season {
  /** Inclusive window, "MM-DD" to "MM-DD". */
  from: string;
  to: string;
  label: L;
  schedule: DaySchedule;
  src: readonly string[];
}

/**
 * Single days with a shorter timetable (24 and 31 December in Madrid). The
 * ranges replace the day's own only when it is a working day or a Saturday:
 * a Sunday or a public holiday keeps its own rule.
 */
export interface SpecialDay {
  /** "MM-DD" for a day of every year, or full ISO dates for movable days. */
  dates: readonly string[];
  label: L;
  weekday?: readonly Range[];
  saturday?: readonly Range[];
  src: readonly string[];
}

export interface PaidRule {
  base: DaySchedule;
  seasons: readonly Season[];
  special: readonly SpecialDay[];
}

export interface PriceStep {
  /** How long the amount buys; null when the tariff fixes only the amount (Girona's minimum charge). */
  minutes: number | null;
  eur: number;
}

/** Null fields are printed as "not published"; a step longer than the maximum stay is printed as a dash. */
export interface Prices {
  min: PriceStep | null;
  hour1: number | null;
  hour2: number | null;
  max: PriceStep | null;
}

export type ZoneColour = "blue" | "green" | "orange" | "red" | "white";

export interface Zone {
  id: string;
  colour: ZoneColour;
  name: L;
  /** Who may park there. */
  who: L;
  /** Paid hours; null when the published timetable is not one rule (see `hoursNote`). */
  rule: PaidRule | null;
  hoursNote?: L;
  /** Longest stay for a visitor, in minutes; null = not published. */
  maxStayMinutes: number | null;
  maxStayNote?: L;
  /** Visitor prices; null = no visitor tariff (residents only) or not published (`pricesNote` says which). */
  prices: Prices | null;
  pricesNote?: L;
  src: readonly string[];
}

export interface Fact {
  text: L;
  src: readonly string[];
}

export interface Source {
  id: string;
  /** The document's own title, in its language. */
  name: string;
  url: string;
  publisher: string;
}

/** Where the city's public holidays come from (see `holidays.ts`). */
export type HolidayKey =
  /** A city of the Spain 2027 family: BOE column `region`, local days by `slug` in `spain-2027/cities-data.ts`. */
  | { kind: "spain"; region: Region; slug: string }
  /** A Catalan municipality: local days from the DOGC snapshot of the holidays family, by its slug. */
  | { kind: "catalonia"; slug: string };

export interface City {
  /** URL segment, the same in the three languages. */
  slug: string;
  name: L;
  /** The service's own short name when the city has one people search by (SER, ORA, SARE); null otherwise. */
  service: string | null;
  operator: L | null;
  holidays: HolidayKey;
  /** The first zone is the visitor (blue) zone the "is it paid today?" answer is computed for. */
  zones: readonly Zone[];
  /** Fee that cancels a parking notice; null = not published. */
  cancel: { eur: number; text: L; src: readonly string[] } | null;
  /** What the official texts say when no cancellation fee is published, or about its limits. */
  cancelNote?: Fact;
  /** Official payment apps; null = none named in the official sources read. */
  apps: { names: readonly string[]; src: readonly string[] } | null;
  payNote: Fact;
  /** Who does not pay. `electric` and `pmr` are asked about on every page: null = not published. */
  exemptions: { electric: Fact | null; pmr: Fact | null; other: readonly Fact[] };
  /** Summer rules, festivals and other dated exceptions that are not part of the computed timetable. */
  seasonal: readonly Fact[];
  notes: readonly Fact[];
  sources: readonly Source[];
  /** The day every fact above was last read on its source. */
  verified: string;
}

/** Barcelona has its own guide: the hub prints one row from it and links there. */
export interface HubOnlyRow {
  name: L;
  weekday: L;
  saturday: L;
  sunday: L;
  hour: L;
  maxStay: L;
  source: Source;
  verified: string;
}
