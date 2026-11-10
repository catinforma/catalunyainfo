import type { Locale } from "@/lib/i18n/config";

import type { B2Key, B2Source } from "./shared";

/**
 * The data model of the Spain-wide strikes hub (`strikes-spain.ts`), in a
 * module of its own so that the facts (`strikes-spain-data.ts`), which the
 * strike watch edits, and the page builder share it without importing each
 * other. Three languages: every text field is written natively in Catalan,
 * Spanish and English (Markdown), never machine-mirrored.
 *
 * `{checked}` inside a text is replaced by the builder with the as-of date in
 * that language ("10 de noviembre de 2026"), so "not published as of ..."
 * lines move with STRIKES_SPAIN_AS_OF and are never typed by hand.
 */

export type L = Record<Locale, string>;

export type SpainStrikeSector = "general" | "rail" | "air" | "industry" | "education";

/**
 * official: a registered call or an official minimum-services order or
 * resolution exists and is linked. Only these are printed as "confirmed".
 * called: the organiser's own notice calls it, and no official order for it
 * was found on the as-of day. Never printed as "confirmed".
 */
export type SpainCallStatus = "official" | "called";

/**
 * published: an order or resolution is out and linked.
 * pending: one is due (the strike touches essential services) and is not out.
 * none: the strike touches no essential public service, or it is not a labour
 * strike; `text` says which.
 */
export type SpainMsStatus = "published" | "pending" | "none";

export interface SpainMinimumServices {
  status: SpainMsStatus;
  /** One plain line (no links) for the tables. */
  short: L;
  /** What is set and by whom, every order linked. While pending: who sets them and where they will appear. */
  text: L;
}

export interface SpainStrike {
  /** Stable anchor for the dated section, e.g. "huelga-general-2026-11-11". */
  id: string;
  /** Every day of action (ISO, civil date in Madrid), ascending. */
  dates: string[];
  sector: SpainStrikeSector;
  status: SpainCallStatus;
  /** After the date in the heading, lower case, tense-neutral. */
  title: L;
  /** Shortest name, for the day-by-day table and the meta description. */
  label: L;
  /** Where it applies. */
  scope: L;
  /** Hours as the organiser or the order published them. Omitted for past strikes. */
  hours?: L;
  /** Who calls it, with the organiser's own notice linked. */
  calledBy: L;
  /** Why it has the status it has: the registered call or official order, or only the organiser's notice. */
  basis: L;
  minimumServices: SpainMinimumServices;
  /** Our own trilingual guides about this strike, linked in the reader's language. */
  guides?: B2Key[];
  sources: B2Source[];
  /** The id of the same strike in the Catalan hub (`strikes.ts`), when it is there too: a test keeps the dates in step. */
  catalanEntry?: string;
}

/**
 * A long-running strike with no last day (airports): it has no row of its own
 * in the day-by-day table, since it applies every day (or on fixed weekdays)
 * while its minimum-services resolution is in force.
 */
export interface SpainOpenStrike {
  id: string;
  title: L;
  /** Where, who called it, and on which days, as the Ministry's list words it. */
  text: L;
  /**
   * The last day the cited resolution is in force: a test fails once
   * STRIKES_SPAIN_AS_OF passes it, until a new resolution is cited or the
   * strike is removed.
   */
  msValidUntil: string;
  sources: B2Source[];
}

/** A strike people search for that is not happening: postponed, called off, moved or never registered. */
export interface SpainNotHappening {
  id: string;
  title: L;
  text: L;
  sources: B2Source[];
}
