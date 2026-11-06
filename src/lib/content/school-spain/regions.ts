import { SCHOOL_SOURCE, SCHOOL_VERIFIED_AT, SCHOOL_YEARS } from "@/lib/content/school/calendar";

import type { RegionCalendar } from "./types";

/**
 * The 2026-2027 school calendars of the Spanish communities and of Ceuta and
 * Melilla, one record per official order or resolution.
 *
 * Transcribed on 6 Nov 2026 from each text in its bulletin (or the
 * education department's own page where the text lives there). The sentence
 * behind every date is quoted in research_notes/x10/calendario-escolar-espana-2026-27.md.
 * A community whose 2026-2027 text could not be read is not here, and no page
 * is published for it: never fill one from memory or from another year.
 *
 * Order: alphabetical by the Spanish name, as the hub's table lists them.
 */
export const SPAIN_REGIONS: readonly RegionCalendar[] = [];

const Y = SCHOOL_YEARS[0]!;

/**
 * Catalonia, for the hub's table only: its page already exists
 * (/es/guias/calendario-escolar-cataluna/, `school/publish.ts`), from the same
 * order these dates come from, so it gets no second page here.
 */
export const CATALONIA: RegionCalendar = {
  slug: "cataluna",
  boe: "CT",
  name: "Cataluña",
  short: "Cataluña",
  inName: "en Cataluña",
  order: {
    short: "Orden EDF/66/2026, de 22 de abril",
    title: SCHOOL_SOURCE.name,
    issuer: "Departament d'Educació i Formació Professional",
    bulletin: "DOGC",
    number: "9653",
    date: "2026-04-27",
    url: SCHOOL_SOURCE.url,
  },
  levels: [
    { levels: "Infantil, Primaria y ESO", start: Y.start, end: Y.end },
    { levels: "1.º de Bachillerato", start: Y.start, end: Y.endBatxillerat1 },
    { levels: "Formación Profesional", start: Y.startFP, end: null, note: "empieza como muy tarde ese día" },
  ],
  christmas: { from: Y.christmas[0], to: Y.christmas[1] },
  easter: { from: Y.easter[0], to: Y.easter[1] },
  otherBreaks: [],
  nonTeaching: [],
  localDays: "Cada centro fija cuatro días de libre disposición, y no hay clase en las dos fiestas locales del municipio.",
  notes: [],
  verifiedAt: SCHOOL_VERIFIED_AT,
};

/** Every community in the hub's table, Catalonia included, alphabetically. */
export function hubRegions(): RegionCalendar[] {
  return [...SPAIN_REGIONS, CATALONIA].sort((a, b) => a.short.localeCompare(b.short, "es"));
}

export function regionBySlug(slug: string): RegionCalendar | undefined {
  return SPAIN_REGIONS.find((r) => r.slug === slug) ?? (slug === CATALONIA.slug ? CATALONIA : undefined);
}

/** Path after the locale prefix, no slashes: "guias/calendario-escolar-madrid". */
export function regionPath(slug: string): string {
  return `guias/calendario-escolar-${slug}`;
}

export const HUB_PATH = "guias/calendario-escolar-espana";
