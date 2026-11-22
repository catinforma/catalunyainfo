/**
 * The DGT's low-emission-zone files (DATEX II v3, ControlledZoneTablePublication)
 * as the pages use them: one record per zone with the fields the files really
 * carry. Pure: the snapshot script (scripts/zbe-snapshot.ts) and the tests
 * call it; nothing here reads the network.
 *
 * What a file holds: the zone's id (INE code + name), a free-text description
 * (often a placeholder), the council's URL, a `noEntry` access restriction
 * with a polygon, a list of DGT labels ("stickerCondition") and the hours for
 * working days ("L") and public holidays ("F"). What it does not hold: vehicle
 * categories, exemptions, fines or which weekdays count. And the label list
 * is not reliable across files (some list the restricted labels, some every
 * label, one lists none), so no page takes its answer from it: the access
 * rule of each city comes from the council's own page (cities.ts) and the
 * file is shown next to it, with any difference said.
 */

export const DGT_ZBE_INDEX = "https://nap.dgt.es/datex2/v3/dgt/zbe/ControledZonePublication/";
export const DGT_ZBE_DATASET = "https://nap.dgt.es/dataset/zonas-de-bajas-emisiones";
export const DGT_ZBE_LICENCE = "https://creativecommons.org/licenses/by/4.0/deed.es";
export const DGT_ZBE_PUBLISHER = "Dirección General de Tráfico (DGT), Punto de Acceso Nacional de Tráfico y Movilidad";

/** tests/zbe.test.ts fails when snapshot.json is older than this: npm run zbe:snapshot -- build */
export const ZBE_SNAPSHOT_MAX_AGE_DAYS = 30;

export interface DgtPeriod {
  /** "L" (working days) or "F" (public holidays), as the file names it. */
  name: string;
  /** Local time, "07:00". The files write it with a "Z" that is not UTC. */
  from: string;
  to: string;
  holiday: boolean;
}

export interface DgtZone {
  /** File name in the DGT directory: "Tarragona.xml". */
  file: string;
  /** Listing date of the file on the DGT server, "2026-07-08T12:24", when the listing gave one. */
  modified: string | null;
  id: string;
  /** INE municipality code, the prefix of the id. */
  ine: string | null;
  name: string;
  /** Free text; null when empty or a placeholder ("null", "Condiciones"). */
  description: string | null;
  recordVersion: string | null;
  url: string | null;
  status: string | null;
  regulation: string | null;
  /** The labels the file lists, in its order: "0", "ECO", "C", "B", "Sin distintivo". */
  stickers: string[];
  negated: boolean;
  /** overallStartTime, date only. */
  start: string | null;
  periods: DgtPeriod[];
  polygons: number;
  corners: number;
  /** [south, west, north, east] of every polygon corner, 5 decimals. */
  bbox: [number, number, number, number] | null;
}

export interface DgtSnapshot {
  /** Day the files were read, YYYY-MM-DD. */
  builtOn: string;
  index: string;
  dataset: string;
  licence: string;
  publisher: string;
  zones: DgtZone[];
}

const PLACEHOLDERS = new Set(["", "null", "condiciones", "condiciones ejemplo", "-", "."]);

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

function decode(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&(amp|lt|gt|quot|apos);/g, (_, n: string) => ENTITIES[n] ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function inner(xml: string, tag: string): string | null {
  const match = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`).exec(xml);
  return match ? (match[1] ?? null) : null;
}

function value(xml: string | null): string | null {
  if (xml === null) return null;
  const text = inner(xml, "com:value");
  return text === null ? null : decode(text);
}

function plain(xml: string, tag: string): string | null {
  const text = inner(xml, tag);
  if (text === null) return null;
  const clean = decode(text);
  return clean === "" || clean === "null" ? null : clean;
}

const clock = (raw: string | null): string => (raw ?? "").slice(0, 5);
const round5 = (n: number): number => Math.round(n * 1e5) / 1e5;

/** Every zone of one DGT file. Throws on a file with no zone, so a changed format stops the snapshot. */
export function parseControlledZones(xml: string, file: string, modified: string | null = null): DgtZone[] {
  const zones: DgtZone[] = [];
  const zonePattern = /<conz:controlledZone\s+id="([^"]*)"[^>]*>([\s\S]*?)<\/conz:controlledZone>/g;
  for (let match = zonePattern.exec(xml); match; match = zonePattern.exec(xml)) {
    const id = decode(match[1] ?? "");
    const body = match[2] ?? "";
    const description = value(inner(body, "conz:controlledZoneDescription"));
    const stickers = [...body.matchAll(/<conz:condition>([\s\S]*?)<\/conz:condition>\s*<conz:type>stickerCondition<\/conz:type>/g)]
      .map((m) => value(m[1] ?? null))
      .filter((s): s is string => s !== null && s !== "");
    const periods: DgtPeriod[] = [...body.matchAll(/<com:validPeriod>([\s\S]*?)<\/com:validPeriod>/g)].map((m) => {
      const period = m[1] ?? "";
      return {
        name: value(inner(period, "com:periodName")) ?? "",
        from: clock(inner(period, "com:startTimeOfPeriod")),
        to: clock(inner(period, "com:endTimeOfPeriod")),
        holiday: period.includes("publicHoliday"),
      };
    });
    const lats = [...body.matchAll(/<loc:latitude>([-\d.]+)<\/loc:latitude>/g)].map((m) => Number(m[1]));
    const lons = [...body.matchAll(/<loc:longitude>([-\d.]+)<\/loc:longitude>/g)].map((m) => Number(m[1]));
    const ok = lats.length > 0 && lats.length === lons.length && [...lats, ...lons].every(Number.isFinite);
    const ine = /^(\d{4,5})_/.exec(id)?.[1] ?? null;
    zones.push({
      file,
      modified,
      id,
      ine,
      name: value(inner(body, "conz:name")) ?? id,
      description: description === null || PLACEHOLDERS.has(description.toLowerCase()) ? null : description,
      recordVersion: plain(body, "conz:controlledZoneRecordVersionTime"),
      url: plain(body, "conz:urlForFurtherInformation"),
      status: plain(body, "conz:status"),
      regulation: plain(body, "tra:accessRestrictionType"),
      stickers,
      negated: /<tra:negate>\s*true\s*<\/tra:negate>/.test(body),
      start: plain(body, "com:overallStartTime")?.slice(0, 10) ?? null,
      periods,
      polygons: (body.match(/<loc:openlrPolygonCorners>/g) ?? []).length,
      corners: lats.length,
      bbox: ok ? [round5(Math.min(...lats)), round5(Math.min(...lons)), round5(Math.max(...lats)), round5(Math.max(...lons))] : null,
    });
  }
  if (zones.length === 0) throw new Error(`${file}: no conz:controlledZone found; the DGT format may have changed`);
  return zones;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The .xml files of the DGT directory listing, with the listing's date for each. */
export function parseIndex(html: string): { href: string; file: string; modified: string | null }[] {
  const rows: { href: string; file: string; modified: string | null }[] = [];
  for (const m of html.matchAll(/<a href="([^"?/]+\.xml)">[^<]*<\/a>\s*(?:(\d{2})-([A-Za-z]{3})-(\d{4}) (\d{2}):(\d{2}))?/g)) {
    const href = m[1];
    if (!href) continue;
    const month = m[3] ? MONTHS.indexOf(m[3]) + 1 : 0;
    rows.push({
      href,
      file: decodeURIComponent(href),
      modified: month > 0 ? `${m[4]}-${String(month).padStart(2, "0")}-${m[2]}T${m[5]}:${m[6]}` : null,
    });
  }
  return rows;
}

/** The hours the file gives for working days, "07:00–20:00", or null. */
export function dgtWorkingHours(zone: DgtZone): { from: string; to: string } | null {
  const period = zone.periods.find((p) => !p.holiday);
  return period && period.from && period.to ? { from: period.from, to: period.to } : null;
}

/** Whether the file also restricts on public holidays (an "F" period). */
export function dgtHolidays(zone: DgtZone): boolean {
  return zone.periods.some((p) => p.holiday);
}
