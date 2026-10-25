import { todayInCatalonia } from "@/lib/content/holidays/calendar";
import {
  AGENDA_SOURCE,
  ENDPOINT,
  MUNICIPALITIES,
  cleanUrl,
  prettify,
  slugify,
} from "@/lib/content/weekend/agenda";

/**
 * The living nativity calendar ("pessebres vivents"), read from the same
 * Generalitat open-data cultural agenda as the weekend listing (`rhpv-yr4f`).
 *
 * ## Why this exists
 *
 * "Pessebres vivents 2026" is asked every December, and the pages that rank
 * for it are lists typed by hand, often with last year's dates. The
 * organisers themselves post their nativity in the Generalitat's agenda — 44
 * of them for the 2025-26 season — so the list here is read from there at
 * render time and never refreshed by a person.
 *
 * ## What it shows
 *
 * Only activities whose own name (or subtitle) calls them a "pessebre
 * vivent", and, separately and labelled as such, other activities with
 * "pessebre" in the name: exhibitions, displays, monumental static scenes.
 * The agenda has no "living nativity" tag, and the wording of the organiser
 * is the only thing that reliably tells the two apart, so nothing without
 * "vivent" is ever presented as a living nativity. Concerts and plays that
 * merely have the word in their title (Pau Casals' oratorio *El Pessebre*,
 * the Pastorets) are left out.
 *
 * For each: the name as the organiser wrote it, the venue, the municipality,
 * the comarca, the first and last day, the agenda's own page for it and the
 * organiser's link. No description and no image is reproduced.
 *
 * ## What it refuses to do
 *
 * - **Show a past nativity.** Rows are asked for with `data_fi >= today` and
 *   filtered again against the day of rendering. The block is in
 *   `DAY_DEPENDENT_BLOCKS`, so the cron rebuilds the page just after midnight.
 * - **Fall back to a remembered list.** If the source cannot be read, the
 *   block says so and links to the agenda.
 */

export const NATIVITY_SOURCE = {
  name: AGENDA_SOURCE.name,
  /** The agenda's own Christmas section: where these are listed on the official site. */
  url: "https://agenda.cultura.gencat.cat/ca/resultats.html/categories/nadal/",
  home: AGENDA_SOURCE.url,
  dataUrl: AGENDA_SOURCE.dataUrl,
  publisher: AGENDA_SOURCE.publisher,
};

/**
 * One day, the same as the page. A fetch with a shorter `revalidate` would
 * shorten the whole page's ISR period (Next uses the lowest one on the route)
 * and multiply the ISR writes the Hobby plan is short of. The query carries
 * today's date, so the nightly cron's rebuild always asks the source afresh.
 */
export const REVALIDATE_SECONDS = 86_400;

export type NativityKind = "living" | "other";

export interface NativityEvent {
  id: string;
  title: string;
  kind: NativityKind;
  venue: string;
  municipality: string;
  comarca: string;
  /** ISO dates: first and last day the agenda gives. */
  start: string;
  end: string;
  /** The activity's page on agenda.cultura.gencat.cat (Catalan only). */
  agendaUrl: string | null;
  /** The organiser's own link, when the row has a web address. */
  organiserUrl: string | null;
}

export type AgendaRow = Record<string, string | undefined>;

/* -------------------------------------------------------------------------- */
/* Classifying a row                                                          */
/* -------------------------------------------------------------------------- */

/** "Pessebre vivent", "Pessebres Vivents", "Betlem vivent". */
const LIVING = /\b(pessebres?|betlems?)\s+vivents?\b/i;
const PESSEBRE = /pessebre/i;
/** Performances and talks that only carry the word in their title. */
const PERFORMANCE_WORDS = /\b(oratori|concerts?|cantata|pastorets|nadales)\b/i;
const PERFORMANCE_TAGS = /categories\/(concerts|teatre|dansa|opera|circ|cursos|conferencies|magia)(,|$)/;
const VISIT_TAGS = /categories\/(exposicions|rutes-i-visites)(,|$)/;

/**
 * "living" only when the organiser's own name or subtitle says so; "other"
 * for any other nativity scene that is something to go and see; null for
 * everything else, including concerts and plays named after the nativity.
 */
export function nativityKind(row: AgendaRow): NativityKind | null {
  const text = `${row.denominaci ?? ""} ${row.subt_tol ?? ""}`;
  if (LIVING.test(text)) return "living";
  if (!PESSEBRE.test(text)) return null;
  if (PERFORMANCE_WORDS.test(text)) return null;
  const tags = row.tags_categor_es ?? "";
  if (PERFORMANCE_TAGS.test(tags) && !VISIT_TAGS.test(tags)) return null;
  return "other";
}

/* -------------------------------------------------------------------------- */
/* Normalising                                                                */
/* -------------------------------------------------------------------------- */

/**
 * `agenda:ubicacions/girona/garrotxa/la-vall-d-en-bas` → comarca and
 * municipality slugs. The row's own `comarca` field is unreliable (on some
 * rows it repeats the municipality), so both come from the full path.
 */
export function parseLocation(path: string | undefined): { comarca: string; municipality: string } {
  const first = (path ?? "").split(",")[0]?.trim() ?? "";
  const parts = first.replace(/^agenda:ubicacions\/?/, "").split("/").filter(Boolean);
  return { comarca: parts[1] ?? "", municipality: parts[2] ?? "" };
}

/** The agenda redirects `activitat.html/<codi>` to the activity's page. */
export function agendaPageUrl(codi: string | undefined): string | null {
  const id = (codi ?? "").trim();
  if (!/^\d{8,16}$/.test(id)) return null;
  return `https://agenda.cultura.gencat.cat/ca/activitat.html/${id}`;
}

const TRACKING = /^(utm_|_gl$|_ga|gclid$|fbclid$|mc_)/;

/** Organiser links arrive with analytics parameters glued on; drop them. */
export function withoutTracking(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    for (const key of [...parsed.searchParams.keys()]) {
      if (TRACKING.test(key)) parsed.searchParams.delete(key);
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export interface PlaceNames {
  /** Municipality slug → official name ("la Vall d'en Bas"). */
  municipalities: ReadonlyMap<string, string>;
  /** Comarca slug → official name ("Alt Empordà"). */
  comarques: ReadonlyMap<string, string>;
  /** Municipality slug → its comarca's official name. */
  comarcaOf: ReadonlyMap<string, string>;
}

export const NO_NAMES: PlaceNames = { municipalities: new Map(), comarques: new Map(), comarcaOf: new Map() };

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

export function normaliseNativity(
  row: AgendaRow,
  today: string,
  names: PlaceNames = NO_NAMES,
): NativityEvent | null {
  const kind = nativityKind(row);
  if (!kind) return null;

  const title = (row.denominaci ?? "").trim();
  const start = (row.data_inici ?? "").slice(0, 10);
  let end = (row.data_fi ?? "").slice(0, 10);
  if (!ISO_DAY.test(end)) end = start;
  if (!title || !ISO_DAY.test(start) || end < start) return null;

  // Never a past one, whatever the cache returned.
  if (end < today) return null;
  // A standing collection is not a date in the Christmas calendar, and an
  // online-only "nativity" is not somewhere to go.
  if ((row.permanent ?? "").trim().toLowerCase() === "sí") return null;
  if ((row.modalitat ?? "").trim().toLowerCase() === "virtual") return null;

  const place = parseLocation(row.comarca_i_municipi ?? row.municipi);
  const municipality = names.municipalities.get(place.municipality) ?? prettify(place.municipality);
  const comarca =
    names.comarques.get(place.comarca) ??
    names.comarcaOf.get(place.municipality) ??
    prettify(place.comarca);

  const agendaUrl = agendaPageUrl(row.codi);
  return {
    id: row.codi?.trim() || `${title}-${start}`,
    title,
    kind,
    venue: (row.espai ?? "").trim(),
    municipality,
    comarca,
    start,
    end,
    agendaUrl,
    organiserUrl: withoutTracking(cleanUrl(row.url) ?? cleanUrl(row.enllac1_url)),
  };
}

/** Rows → events: classified, deduplicated, past ones dropped, by date then name. */
export function selectNativities(rows: AgendaRow[], today: string, names: PlaceNames = NO_NAMES): NativityEvent[] {
  const seen = new Set<string>();
  const events: NativityEvent[] = [];
  for (const row of rows) {
    const event = normaliseNativity(row, today, names);
    if (!event || seen.has(event.id)) continue;
    seen.add(event.id);
    events.push(event);
  }
  return events.sort(
    (a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end) || a.title.localeCompare(b.title, "ca"),
  );
}

export interface ComarcaGroup {
  comarca: string;
  items: NativityEvent[];
}

/** Living nativities by comarca, alphabetically, each comarca in date order. */
export function groupByComarca(events: NativityEvent[]): ComarcaGroup[] {
  const groups = new Map<string, NativityEvent[]>();
  for (const event of events) {
    const key = event.comarca || "—";
    groups.set(key, [...(groups.get(key) ?? []), event]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "ca"))
    .map(([comarca, items]) => ({ comarca, items }));
}

/* -------------------------------------------------------------------------- */
/* Fetching                                                                   */
/* -------------------------------------------------------------------------- */

async function fetchAgenda(url: string): Promise<{ rows: AgendaRow[]; lastModified: string | null }> {
  const response = await fetch(url, {
    headers: { accept: "application/json" },
    next: { revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(20_000),
  } as RequestInit);
  if (!response.ok) throw new Error(`${response.status} from ${new URL(url).host}`);
  const rows = (await response.json()) as unknown;
  if (!Array.isArray(rows)) throw new Error("unexpected response");
  return { rows: rows as AgendaRow[], lastModified: response.headers.get("last-modified") };
}

/** `Fri, 23 Oct 2026 16:54:03 GMT` → `2026-10-23` in Catalan time; null if unreadable. */
export function updatedDay(header: string | null): string | null {
  if (!header) return null;
  const date = new Date(header);
  return Number.isNaN(date.getTime()) ? null : todayInCatalonia(date);
}

async function placeNames(): Promise<PlaceNames> {
  try {
    const response = await fetch(`${MUNICIPALITIES}?$select=municipi,cap_de_municipi,comarca&$limit=2000`, {
      headers: { accept: "application/json" },
      next: { revalidate: 604_800 },
      signal: AbortSignal.timeout(20_000),
    } as RequestInit);
    if (!response.ok) return NO_NAMES;
    const rows = (await response.json()) as { municipi?: string; cap_de_municipi?: string; comarca?: string }[];
    const municipalities = new Map<string, string>();
    const comarques = new Map<string, string>();
    const comarcaOf = new Map<string, string>();
    for (const row of rows) {
      const comarca = row.comarca?.trim();
      if (comarca) comarques.set(slugify(comarca), comarca);
      for (const name of [row.municipi?.trim(), row.cap_de_municipi?.trim()]) {
        if (!name) continue;
        const slug = slugify(name);
        if (!municipalities.has(slug)) municipalities.set(slug, name);
        if (comarca && !comarcaOf.has(slug)) comarcaOf.set(slug, comarca);
      }
    }
    return { municipalities, comarques, comarcaOf };
  } catch {
    // Names are cosmetic; the slug fallback is readable without accents.
    return NO_NAMES;
  }
}

export interface NativityResult {
  today: string;
  events: NativityEvent[];
  /** Day the Generalitat last updated the dataset, from its Last-Modified header. */
  updatedAt: string | null;
  /** Null when the source answered; the reason when it did not. */
  error: string | null;
}

export function nativityQuery(today: string): string {
  const where =
    `data_fi >= '${today}T00:00:00'` +
    ` AND (upper(denominaci) like '%PESSEBRE%' OR upper(subt_tol) like '%PESSEBRE%'` +
    ` OR upper(denominaci) like '%BETLEM%VIVENT%')`;
  return (
    `${ENDPOINT}?$select=codi,denominaci,subt_tol,espai,comarca_i_municipi,municipi,` +
    `data_inici,data_fi,tags_categor_es,permanent,modalitat,url,enllac1_url` +
    `&$where=${encodeURIComponent(where)}&$order=data_inici&$limit=500`
  );
}

export async function loadNativities(today: string = todayInCatalonia()): Promise<NativityResult> {
  if (!ISO_DAY.test(today)) throw new Error(`bad date ${today}`);
  try {
    const [{ rows, lastModified }, names] = await Promise.all([fetchAgenda(nativityQuery(today)), placeNames()]);
    return { today, events: selectNativities(rows, today, names), updatedAt: updatedDay(lastModified), error: null };
  } catch (error) {
    return { today, events: [], updatedAt: null, error: error instanceof Error ? error.message : "unreachable" };
  }
}
