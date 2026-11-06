import type { Region } from "@/lib/programmatic/holidays/boe-2027";

/**
 * The school calendar 2026-2027 of one Spanish community (or Ceuta, or
 * Melilla), as its education department's own order or resolution sets it.
 *
 * Every date is transcribed from that text, read on `verifiedAt`; the fact
 * pack (research_notes/x10/calendario-escolar-espana-2026-27.md) keeps the
 * sentence each date comes from. Nothing is inferred from another year or
 * another community: a field the order does not fix is left out.
 */

/**
 * Both days inclusive: the first day without class and the day before
 * classes resume (a Sunday when they resume on a Monday). When the order's
 * own holiday dates are narrower (non-teaching days glued to them, as in
 * Madrid), `note` says what the text calls the holidays.
 */
export interface Period {
  from: string;
  to: string;
  note?: string;
  /** País Vasco: the text sets a minimum each school may lengthen. */
  minimum?: boolean;
  /**
   * Andalucía: the provinces disagree, so the period holds only the days
   * without class in all of them, and this says the whole range in words
   * ("del 23 o 24 de diciembre al 6, 7 u 8 de enero, según la provincia").
   */
  label?: string;
  /** The same for a table cell: "23-24 dic – 6-8 ene". */
  labelShort?: string;
}

/** The official text: an order or resolution in the region's bulletin. */
export interface SchoolOrder {
  /** How the text names itself: "Orden 1234/2026, de 5 de mayo". */
  short: string;
  /** Full official title. */
  title: string;
  issuer: string;
  /** "BOCM", "DOGV", "BOJA"... */
  bulletin: string;
  number: string | null;
  /**
   * Publication date in the bulletin; for a text published only on the
   * department's page (Ceuta, Melilla), its signature date, or null.
   */
  date: string | null;
  /** The bulletin's own URL for the text. */
  url: string;
  /** The department's own page on the calendar, where there is one. */
  departmentUrl?: string;
}

/** Start and end for a group of levels, exactly as the order groups them. */
export interface LevelDates {
  levels: string;
  /** Where each school picks its own day inside a window (Navarra, País Vasco): the earliest start. */
  start: string | null;
  /** ...and the latest end. */
  end: string | null;
  /** The window in words, shown instead of `start`: "entre el 4 y el 8 de septiembre". */
  startText?: string;
  /** Navarra: the latest a school may start (the window is start..startLatest). */
  startLatest?: string;
  /** Navarra: the earliest a school may end (the window is endEarliest..end). */
  endEarliest?: string;
  /** Shown instead of `end`: "entre el 18 y el 22 de junio". */
  endText?: string;
  /** "2º de Bachillerato: según el calendario de la PAU". */
  note?: string;
}

/** A break other than Christmas and Easter: carnival, February, November... */
export interface SchoolBreak {
  name: string;
  from: string;
  to: string;
  /** Who it applies to, when not everyone. */
  note?: string;
}

/** A day the order declares non-teaching across the region. */
export interface NonTeachingDay {
  date: string;
  reason: string;
  /** Who it applies to, when not every level. */
  levels?: string;
  /** True when infant and primary still have class that day. */
  partial?: boolean;
}

/** One municipality's days without class, where the order lists them. */
export interface TownDays {
  town: string;
  /** The two local holidays. */
  local: string[];
  /** The other non-teaching days its municipal school council chose. */
  other: string[];
  note?: string;
}

/** A province (or island) with its own resolution inside a regional framework. */
export interface ProvinceCalendar {
  name: string;
  order: SchoolOrder;
  /** Each left out where the province repeats the regional dates. */
  levels?: LevelDates[];
  christmas?: Period;
  easter?: Period;
  otherBreaks?: SchoolBreak[];
  nonTeaching?: NonTeachingDay[];
  /** How this province's resolution handles local days, when it differs. */
  localDays?: string;
}

export interface RegionCalendar {
  /** URL suffix: /es/guias/calendario-escolar-<slug>/ */
  slug: string;
  /** Column in the BOE's national holiday table. */
  boe: Region;
  /** "Comunidad de Madrid" */
  name: string;
  /** "Madrid": the word people search, used in titles. */
  short: string;
  /** "en la Comunidad de Madrid", "en Andalucía". */
  inName: string;
  /** "de la Comunidad de Madrid", "del País Vasco". */
  deName: string;
  /** The order that sets the calendar (for a provincial region, the framework or the portal). */
  order: SchoolOrder;
  /** The first row is always infant and primary: the dates the titles name. */
  levels: LevelDates[];
  christmas: Period;
  easter: Period;
  otherBreaks: SchoolBreak[];
  nonTeaching: NonTeachingDay[];
  /** How local free days work, in the order's terms. */
  localDays: string;
  /** Other things a parent needs that the order states. */
  notes: string[];
  /** Andalucía, Castilla-La Mancha...: one resolution per province. */
  provinces?: ProvinceCalendar[];
  /** What the provincial resolutions add to the regional dates. */
  provincesNote?: string;
  /** Provinces whose 2026-2027 resolution could not be read: "por confirmar". */
  pendingProvinces?: string[];
  /** Teaching days, where the text states the number. */
  schoolDays?: number;
  /** Murcia: the order lists each municipality's days (its annex V). */
  townDays?: TownDays[];
  /** The hub's "other breaks" cell, when the breaks are not region-wide (Aragón's provinces). */
  hubOther?: string;
  /**
   * Navarra, País Vasco: the department sets windows and minimums and each
   * school approves its own calendar inside them. One sentence saying so,
   * shown first; titles then name the minimum, never a single school's dates.
   */
  flexible?: string;
  /** Day the official text was read. */
  verifiedAt: string;
}
