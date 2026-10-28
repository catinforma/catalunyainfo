/**
 * Agenda rows to the compact list the weekend pages read. Pure and
 * parametrised by the register, so the snapshot script (which measures each
 * zone's volume over a year of history before any snapshot exists) and the
 * route handler (which builds this weekend's list) run the very same code.
 *
 * It reuses the Catalonia weekend page's rules from `content/weekend/agenda.ts`:
 * the same query, `isInCatalonia` and `normaliseEvent` (title, venue, dates,
 * category, free entry, organiser link, and no activity running for more than
 * 45 days). The one difference is the municipality list, which comes from the
 * committed register instead of a second live request, and gives every row
 * its INE, comarca and province codes.
 */

import { ENDPOINT, isInCatalonia, normaliseEvent, slugify } from "@/lib/content/weekend/agenda";

import { byRelevance, placeRow, type LiveEvent, type PlaceLookup } from "./live";
import type { WeekendSnapshot } from "./types";

type Register = Pick<WeekendSnapshot, "municipalities" | "comarques" | "agendaAliases">;

export function buildLookup(register: Register): PlaceLookup {
  const towns = new Map<string, { ine: string; name: string; comarca: string; province: string }>();
  const byIne = new Map(register.municipalities.map((m) => [m.ine, m]));
  for (const m of register.municipalities) towns.set(slugify(m.name), { ine: m.ine, name: m.name, comarca: m.comarca, province: m.province });
  for (const [slug, ine] of Object.entries(register.agendaAliases)) {
    const m = byIne.get(ine);
    if (m) towns.set(slug, { ine: m.ine, name: m.name, comarca: m.comarca, province: m.province });
  }
  // Agenda comarca slugs are Idescat's names slugified ("pla-de-l-estany", "aran").
  const comarques = new Map<string, string>();
  for (const [code, name] of Object.entries(register.comarques)) comarques.set(slugify(name), code);
  return { town: (slug) => towns.get(slug), comarca: (slug) => comarques.get(slug) };
}

/** Slug -> name, the map `isInCatalonia` and `normaliseEvent` expect. */
export function municipalityNames(register: Register): Map<string, string> {
  const map = new Map<string, string>();
  const byIne = new Map(register.municipalities.map((m) => [m.ine, m]));
  for (const m of register.municipalities) map.set(slugify(m.name), m.name);
  for (const [slug, ine] of Object.entries(register.agendaAliases)) {
    const m = byIne.get(ine);
    if (m) map.set(slug, m.name);
  }
  return map;
}

/** The same query as `loadWeekendAgenda`, for one window. */
export function agendaUrl(window: { from: string; to: string }, limit = 1500): string {
  const where =
    `data_inici <= '${window.to}T23:59:59' AND data_fi >= '${window.from}T00:00:00'` +
    ` AND (permanent IS NULL OR permanent != 'Sí')` +
    ` AND (modalitat IS NULL OR modalitat != 'Virtual')`;
  return (
    `${ENDPOINT}?$select=codi,denominaci,espai,comarca_i_municipi,municipi,comarca,` +
    `data_inici,data_fi,tags_categor_es,gratuita,url,linkbotoentrades` +
    `&$where=${encodeURIComponent(where)}&$order=data_inici&$limit=${limit}`
  );
}

/** Agenda rows to the compact list: Catalonia only, placed, deduplicated, sorted. */
export function compactEvents(
  rows: readonly Record<string, string | undefined>[],
  window: { from: string; to: string; long: boolean },
  lookup: PlaceLookup,
  names: ReadonlyMap<string, string>,
): LiveEvent[] {
  const seen = new Set<string>();
  const out: LiveEvent[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object" || !isInCatalonia(row, names)) continue;
    const event = normaliseEvent(row, window, names);
    const place = placeRow(row, lookup);
    if (!event || !place || seen.has(event.id)) continue;
    seen.add(event.id);
    out.push({
      id: event.id,
      t: event.title,
      v: event.venue,
      m: place.name,
      ine: place.ine,
      c: place.comarca,
      p: place.province,
      s: event.start,
      e: event.end,
      k: event.category,
      f: event.free,
      u: event.url,
      n: event.startsThisWeekend,
    });
  }
  return out.sort(byRelevance);
}

/** "www.firagirona.com", "a / b", "https://…" -> one https URL, or null. */
export function cleanWeb(value: string | undefined): string | null {
  const first = (value ?? "").trim().split(/\s+\/\s+|\s+/)[0] ?? "";
  if (!first) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(first) ? first : `https://${first}`);
    if (!url.hostname.includes(".")) return null;
    url.protocol = "https:";
    return url.href;
  } catch {
    return null;
  }
}
