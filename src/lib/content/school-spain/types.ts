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
  /** Publication date in the bulletin. */
  date: string;
  /** The bulletin's own URL for the text. */
  url: string;
  /** The department's own page on the calendar, where there is one. */
  departmentUrl?: string;
}

/** Start and end for a group of levels, exactly as the order groups them. */
export interface LevelDates {
  levels: string;
  start: string | null;
  end: string | null;
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
  notPrimary?: boolean;
}

/** A province (or island) with its own resolution inside a regional framework. */
export interface ProvinceCalendar {
  name: string;
  order: SchoolOrder;
  levels: LevelDates[];
  christmas: Period;
  easter: Period;
  otherBreaks: SchoolBreak[];
  nonTeaching: NonTeachingDay[];
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
  /** Day the official text was read. */
  verifiedAt: string;
}
