import type { B2Source } from "./shared";

/**
 * The data model of the Spain-wide strikes hub (`strikes-spain.ts`), in a
 * module of its own so that the facts (`strikes-spain-data.ts`), which the
 * strike watch edits, and the page builder share it without importing each
 * other. Spanish only: every text field is Spanish Markdown.
 */

export type SpainStrikeSector = "general" | "rail" | "air" | "health" | "education" | "justice" | "postal" | "road";

/**
 * convocada: the organiser's own notice says the strike is called (registered
 * or formally notified).
 * anunciada: the organiser has announced it in its own statement, but no
 * source says it has been registered; the page prints "anunciada, sin
 * convocatoria registrada" beside it.
 */
export type SpainCallStatus = "convocada" | "anunciada";

/**
 * published: every order or resolution the strike needs is out.
 * partial: some are out (one region, or the Generalitat's but not the Ministry's).
 * pending: none is out yet (only while the strike is upcoming).
 * none: nothing to publish: the strike passed or was called off with none, or
 * none apply (a students' strike); `text` says which.
 */
export type SpainMsStatus = "published" | "partial" | "pending" | "none";

export interface SpainMinimumServices {
  status: SpainMsStatus;
  /** One plain line (no links) for the calendar table and the key facts: "Publicados en Cataluña; pendientes los del Ministerio". */
  short: string;
  /** What is set and by whom, with every order or resolution linked (Markdown). While pending: who sets them and where they will appear. */
  text: string;
}

export interface SpainStrike {
  /** Stable anchor for the dated section, e.g. "huelga-general-2026-11-11". */
  id: string;
  /** Every day of action (ISO, civil date in Madrid), ascending. An indefinite strike lists its first day only. */
  dates: string[];
  /** An indefinite strike: in progress from `dates[0]` until `endedOn` is set. */
  indefinite?: { endedOn?: string };
  sector: SpainStrikeSector;
  call: SpainCallStatus;
  /** After the date in the heading, lower case, tense-neutral: "huelga de maquinistas del Grupo Renfe (SEMAF)". */
  title: string;
  /** Shortest name, for the meta description and the lead: "Renfe (SEMAF)". */
  label: string;
  /** Where it applies, plain: "toda España", "Grupo Renfe, en toda España". */
  scope: string;
  /** Hours as the organiser or the order published them; say so when none are published. Markdown. */
  hours: string;
  /** Who calls it, with the organiser's own notice linked (Markdown). */
  calledBy: string;
  /** Who is called out (Markdown). */
  who: string;
  /** Other facts read on the organiser's or an official page: talks, a day called off (Markdown). */
  notes: string[];
  /**
   * The general strike's minimum services are a slot per region and service
   * in `strike-11n-cities-data.ts` and `strikes.ts`: "strike11n" makes the
   * page read them from there, so the two never disagree.
   */
  minimumServices: SpainMinimumServices | "strike11n";
  /**
   * The last day the cited minimum-services resolution is in force, when it
   * says so (the Ministry's air resolutions run month by month): a test fails
   * once STRIKES_SPAIN_AS_OF passes it, until a new one is cited or the
   * strike is recorded as over.
   */
  msValidUntil?: string;
  /** Our own pages about this strike, Spanish only (Markdown links). */
  guides: string[];
  sources: B2Source[];
  /** The id of the same strike in the Catalan hub (`strikes.ts`), when it is there too: a test keeps the dates in step. */
  catalanEntry?: string;
}

/**
 * Where a sector stands when it has no dated strike of its own, or one that
 * was postponed (the doctors' state-wide strike, 7 Oct 2026): printed in the
 * "Médicos, educación, justicia y Correos" section and in that sector's FAQ
 * answer. Only what an organiser or an official page says, with the day it
 * was checked.
 */
export interface SpainSectorStatus {
  sector: SpainStrikeSector;
  /** The section's H3: "Médicos y sanidad". */
  heading: string;
  /** Markdown paragraphs, each with its source linked. The first one also answers the sector's FAQ when no dated strike does. */
  text: string[];
  sources: B2Source[];
}
