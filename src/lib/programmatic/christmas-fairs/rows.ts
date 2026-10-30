/**
 * Open-data rows to snapshot fairs. Pure and parametrised, so the snapshot
 * script and the known-answer tests (real rows read on 30 Oct 2026) run the
 * very same code. Reuses the weekend family's fair-website cleaner and its
 * agenda placement (register lookup, renamed towns, Catalonia-only rule).
 */

import { isInCatalonia } from "@/lib/content/weekend/agenda";
import { cleanWeb } from "@/lib/programmatic/weekend/compact";
import { placeRow, type PlaceLookup } from "@/lib/programmatic/weekend/live";

import { SEASON, inSeason, isChristmasAgendaMarket, isChristmasName } from "./classify";
import type { SnapshotChristmasFair } from "./types";

type Row = Record<string, string | undefined>;

const clean = (value: string | undefined): string | null => {
  const text = (value ?? "").replace(/\s+/g, " ").trim();
  return text ? text : null;
};

/**
 * Websites in the fairs calendar that did not lead to the organiser when
 * checked on 30 Oct 2026, by host, with the council's own site linked instead
 * (each opened that day). A page must never send a reader to a dead domain or,
 * worse, to whoever bought it since.
 */
export const WEB_REPLACEMENTS: Record<string, string> = {
  // Ascó: the domain now serves an unrelated site.
  "www.ascoturisme.com": "https://www.asco.cat/",
  // Arbúcies: the domain no longer resolves.
  "www.visitarbucies.cat": "https://www.arbucies.cat/",
  // Banyoles: the certificate is not valid for "www."; the bare domain is.
  "www.banyoles.cat": "https://banyoles.cat/",
  // Ripoll: expired certificate.
  "www.ajripoll.cat": "https://ripoll.cat/",
  // Cardedeu's fair site: certificate rejected by browsers' stores.
  "www.firadenadal.cat": "https://www.cardedeu.cat/",
  // Tremp (Vilamitjana): expired certificate.
  "vilamitjana.ajuntamentdetremp.cat": "https://www.tremp.cat/",
  // Manresa's fair site: certificate not valid for the host.
  "www.firamanresa.com": "https://web.manresa.cat/",
};

/** The calendar's website, or the council's when that one is known not to work. */
export function organiserWeb(raw: string | undefined): { web: string | null; webReplaced: boolean } {
  const web = cleanWeb(raw);
  if (!web) return { web: null, webReplaced: false };
  const replacement = WEB_REPLACEMENTS[new URL(web).hostname];
  return replacement ? { web: replacement, webReplaced: true } : { web, webReplaced: false };
}

/**
 * One fairs-calendar (`vm32-przc`) row to a snapshot fair; null when it is not
 * a Christmas fair of the season. Throws when the municipality code is not in
 * the register: a fair we cannot place is a bug to look at, not a row to drop.
 */
export function fairFromRow(r: Row, known: ReadonlySet<string>, season: { from: string; to: string } = SEASON): SnapshotChristmasFair | null {
  const start = (r.data_inici ?? "").slice(0, 10);
  const end = (r.data_fi ?? r.data_inici ?? "").slice(0, 10);
  if (!isChristmasName(r.nom, r.nom_castellano) || !inSeason(start, end, season)) return null;
  const ine = (r.codi_municipi_idescat ?? "").slice(0, 5);
  if (!known.has(ine)) throw new Error(`Fair ${r.nom}: municipality ${r.codi_municipi_idescat} (${r.municipi}) is not in the register`);
  const since = Number(r.any_primera_edici);
  return {
    id: `vm32:${r.id_activitats_firals ?? `${ine}-${start}`}`,
    source: "fairs",
    name: (r.nom ?? "").trim(),
    nameEs: clean(r.nom_castellano),
    ine,
    start,
    end,
    place: clean(r.ubicaci),
    ...organiserWeb(r.p_gina_web),
    organiser: clean(r.organitzador_firal),
    since: Number.isInteger(since) && since > 1000 && since <= Number(start.slice(0, 4)) ? since : null,
    toConfirm: /^s[ií]$/i.test((r.dates_a_confirmar ?? "").trim()),
  };
}

/**
 * Agenda (`rhpv-yr4f`) rows to snapshot fairs: Christmas fairs and markets of
 * the season, in Catalonia, placed in a municipality. A row in a town that the
 * calendar already lists on overlapping days is the same fair and is dropped.
 */
export function agendaFairs(
  rows: readonly Row[],
  lookup: PlaceLookup,
  names: ReadonlyMap<string, string>,
  existing: readonly SnapshotChristmasFair[],
  season: { from: string; to: string } = SEASON,
): SnapshotChristmasFair[] {
  const out: SnapshotChristmasFair[] = [];
  const seen = new Set<string>();
  for (const r of rows) {
    if (!isChristmasAgendaMarket(r) || !isInCatalonia(r, names)) continue;
    const place = placeRow(r, lookup);
    const start = (r.data_inici ?? "").slice(0, 10);
    const end = (r.data_fi ?? r.data_inici ?? "").slice(0, 10);
    if (!place?.ine || !inSeason(start, end, season) || !r.codi || seen.has(r.codi)) continue;
    if ([...existing, ...out].some((f) => f.ine === place.ine && f.start <= end && f.end >= start)) continue;
    seen.add(r.codi);
    out.push({
      id: `agenda:${r.codi}`,
      source: "agenda",
      name: (r.denominaci ?? "").trim(),
      nameEs: null,
      ine: place.ine,
      start,
      end,
      place: clean(r.espai),
      web: cleanWeb(r.url),
      webReplaced: false,
      organiser: null,
      since: null,
      toConfirm: false,
    });
  }
  return out;
}
