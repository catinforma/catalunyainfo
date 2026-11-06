import { SCHOOL_SOURCE, SCHOOL_VERIFIED_AT, SCHOOL_YEARS } from "@/lib/content/school/calendar";
import { REGIONS, type Region } from "@/lib/programmatic/holidays/boe-2027";
import { names } from "@/lib/programmatic/spain-2027/communities";

import { REGION_DATA, type RegionData } from "./data";
import type { RegionCalendar } from "./types";

/**
 * The communities with a page: every record in `data.ts`, named and slugged
 * like the 2027 work calendar's pages (/es/festivos/2027/<slug>/), so the two
 * families share their words ("baleares", "comunidad-valenciana").
 *
 * A community whose 2026-2027 text could not be read has no record, no page
 * and a "por confirmar" row in the hub: never fill one from memory or from
 * another year.
 */
function define(data: RegionData): RegionCalendar {
  const n = names(data.boe);
  return { ...data, slug: n.slug, name: n.Full, short: n.short, inName: n.en, deName: n.de };
}

export const SPAIN_REGIONS: readonly RegionCalendar[] = REGION_DATA.map(define).sort((a, b) => a.short.localeCompare(b.short, "es"));

const Y = SCHOOL_YEARS[0]!;

/**
 * Catalonia, for the hub's table only: its page already exists
 * (/es/guias/calendario-escolar-cataluna/, `school/publish.ts`), from the same
 * order these dates come from, so it gets no second page here.
 */
export const CATALONIA: RegionCalendar = define({
  boe: "CT",
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
});

/** Every community in the hub's table, Catalonia included, alphabetically. */
export function hubRegions(): RegionCalendar[] {
  return [...SPAIN_REGIONS, CATALONIA].sort((a, b) => a.short.localeCompare(b.short, "es"));
}

/** Communities (and cities) whose 2026-2027 text is not transcribed yet: "por confirmar" in the hub. */
export function pendingRegions(): { region: Region; short: string; slug: string }[] {
  const done = new Set(hubRegions().map((r) => r.boe));
  return REGIONS.filter((r) => !done.has(r))
    .map((r) => ({ region: r, short: names(r).short, slug: names(r).slug }))
    .sort((a, b) => a.short.localeCompare(b.short, "es"));
}

export function regionBySlug(slug: string): RegionCalendar | undefined {
  return SPAIN_REGIONS.find((r) => r.slug === slug) ?? (slug === CATALONIA.slug ? CATALONIA : undefined);
}

/** Path after the locale prefix, no slashes: "guias/calendario-escolar-madrid". */
export function regionPath(slug: string): string {
  return `guias/calendario-escolar-${slug}`;
}

export const HUB_PATH = "guias/calendario-escolar-espana";

/**
 * A community page of this family (not the hub, not Catalonia's own page):
 * the home page shows the hub instead of up to six of them in a row.
 */
export function isRegionSchoolPage(path: string): boolean {
  return SPAIN_REGIONS.some((r) => regionPath(r.slug) === path.replace(/^\/?(es\/)?|\/$/g, ""));
}
