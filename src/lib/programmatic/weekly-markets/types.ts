/**
 * Types of the weekly street markets family (Vic and Mataró, the pilot of
 * 25 Nov 2026). Types only: the client component imports nothing else.
 *
 * Minimal model, as the 90-day plan asks: town, market, place, usual
 * pattern, dated exception, validity, source, last check.
 */

export type MkLocale = "ca" | "es" | "en";
export type L = Record<MkLocale, string>;

/** "HH:MM", 24 h, Europe/Madrid. */
export type Hhmm = string;

/** One source page read on `readOn`, with the words the fact rests on. */
export interface MarketSource {
  id: string;
  /** Page title as published. */
  name: string;
  publisher: string;
  url: string;
  /** The day the page was last read in full (ISO). */
  readOn: string;
  /** Words copied from the page (Catalan, as published); the check script greps each one. */
  quotes: readonly string[];
}

/** The zone of a town a reader picks: a square or a neighbourhood. */
export interface MarketArea {
  id: string;
  name: L;
}

/** One market: a place and its usual pattern. */
export interface Market {
  id: string;
  area: MarketArea;
  name: L;
  /** Where, as the council words it (short enough to sit in a sentence). */
  place: L;
  /** More exact streets, when a source gives them. */
  detail?: L;
  /** Weekdays it is held, 0 = Sunday. */
  days: readonly number[];
  /** Usual hours; null when the council only says "horari de matí". */
  hours: readonly [Hhmm, Hhmm] | null;
  /** What the hours (or their absence) rest on. */
  hoursNote?: L;
  goods: L;
  /** Source ids of the pattern. */
  src: readonly string[];
  /** The Generalitat census row (open data `vjxi-2iwi`): `identificador` and `dia_celebracio`. */
  census: { id: string; day: string };
}

/**
 * A dated exception to the usual pattern.
 *  - cancelled: no session that day;
 *  - moved: the session of `date` is held on `movedTo` instead;
 *  - normal: the council states the market is held as usual on a holiday.
 * It lapses after `date` (after `movedTo` for a move): `validUntil`.
 */
export interface MarketException {
  id: string;
  /** Ids of the markets it applies to. */
  markets: readonly string[];
  date: string;
  kind: "cancelled" | "moved" | "normal";
  movedTo?: string;
  note: L;
  /** Source id of the page that lists it. */
  src: string;
  /**
   * True when the council's own act or notice for this exception was read.
   * False when only a council listing was read: the page then asks the
   * reader to confirm with the council.
   */
  documentRead: boolean;
}

/** A different event with its own programme that people search next to the weekly market. */
export interface RelatedEvent {
  id: string;
  name: L;
  from: string;
  to: string;
  hours: L;
  url: string;
  note: L;
}

export interface MarketTown {
  slug: string;
  /** INE code. */
  ine: string;
  name: L;
  markets: readonly Market[];
  exceptions: readonly MarketException[];
  sources: readonly MarketSource[];
  /** Last day the council's own calendar of exceptions covers; null when the council publishes none. */
  calendarThrough: string | null;
  /** Where the council publishes holiday changes (linked next to every holiday session). */
  noticeUrl: string;
  /** Last day any source of the town was read. */
  checked: string;
  related: readonly RelatedEvent[];
}

/**
 * Why a session is shown the way it is:
 *  - calendar: held under the usual pattern and inside the council's published calendar of exceptions;
 *  - exception: a dated exception puts it here (a moved session) or confirms it (a holiday kept);
 *  - usual: the council's usual pattern, no exception published;
 *  - holiday-unconfirmed: a public holiday the council published nothing for: "horari habitual";
 *  - calendar-pending: after the last day of the council's calendar.
 */
export type SessionStatus = "calendar" | "exception" | "usual" | "holiday-unconfirmed" | "calendar-pending";

export interface Session {
  date: string;
  marketId: string;
  areaId: string;
  from: Hhmm | null;
  to: Hhmm | null;
  status: SessionStatus;
  /** Set when the session is held on a day that is not its weekday (moved). */
  movedFrom?: string;
  /** Name of the holiday when `status` is "holiday-unconfirmed". */
  holiday?: string;
}
