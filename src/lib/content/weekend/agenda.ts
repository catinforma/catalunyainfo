import {
  addDays,
  holidayOn,
  todayInCatalonia,
  weekdayIndex,
} from "@/lib/content/holidays/calendar";

/**
 * The live weekend agenda.
 *
 * ## Why this exists
 *
 * "What to do this weekend in Catalonia" is one of the highest-volume recurring
 * queries the site can answer, and the page that answered it was titled
 * "19 and 20 September" on 7 October. It listed twenty-five plans that had all
 * happened three weeks earlier. A page about *this* weekend that is about a
 * past weekend is not stale, it is wrong, and it was wrong in the title Google
 * shows.
 *
 * The mushroom report failed the same way and lost all its clicks. The fix here
 * is the same in kind and stronger in form: the listing is not refreshed by a
 * person, it is read from the Generalitat's open-data cultural agenda at render
 * time and cached for six hours, so there is no step that can be forgotten.
 *
 * ## What it publishes
 *
 * For each activity: its name as the organiser wrote it, the venue, the
 * municipality, the dates, the category, whether entry is free, and the
 * organiser's own link. Nothing is rewritten and no description is reproduced;
 * the page's own text is the guidance around the list, and the list is a tool.
 *
 * ## What it refuses to do
 *
 * - **Show a past weekend.** If the source cannot be reached, the block says so
 *   and links to the official agenda. It never falls back to a cached list
 *   from an earlier weekend, because that is the exact failure being fixed.
 * - **Invent a long weekend.** The window extends to a Friday or a Monday only
 *   when that day is a Catalonia-wide public holiday in the published calendar.
 */

export const AGENDA_SOURCE = {
  name: "Agenda Cultural de Catalunya",
  url: "https://agenda.cultura.gencat.cat/",
  dataUrl: "https://analisi.transparenciacatalunya.cat/d/rhpv-yr4f",
  publisher: "Generalitat de Catalunya — dades obertes",
};

const ENDPOINT = "https://analisi.transparenciacatalunya.cat/resource/rhpv-yr4f.json";
const MUNICIPALITIES = "https://analisi.transparenciacatalunya.cat/resource/wpyq-we8x.json";

/** Six hours: the source updates daily, and a weekend list changes slowly. */
export const REVALIDATE_SECONDS = 21_600;

/* -------------------------------------------------------------------------- */
/* The window                                                                 */
/* -------------------------------------------------------------------------- */

export interface WeekendWindow {
  /** First day, ISO. A Friday, or a Thursday when Friday is a holiday. */
  from: string;
  /** Last day, ISO. A Sunday, or the Monday when Monday is a holiday. */
  to: string;
  /** True when a public holiday makes it a long weekend. */
  long: boolean;
}

/**
 * The weekend a reader means when they ask on a given day.
 *
 * Monday to Thursday: the coming one. Friday to Sunday: the one they are in.
 * A Monday that is a public holiday belongs to the weekend before it, which is
 * how everybody in Catalonia already talks about a "pont".
 */
export function weekendWindow(today: string = todayInCatalonia()): WeekendWindow {
  const weekday = weekdayIndex(today); // 0 Sunday … 6 Saturday

  // Days back to this weekend's Friday when inside it; forward otherwise.
  let friday: string;
  if (weekday === 5) friday = today;
  else if (weekday === 6) friday = addDays(today, -1);
  else if (weekday === 0) friday = addDays(today, -2);
  else if (weekday === 1 && holidayOn(today)) friday = addDays(today, -3);
  else friday = addDays(today, 5 - weekday);

  let from = friday;
  let to = addDays(friday, 2);
  let long = false;

  if (holidayOn(addDays(to, 1))) {
    to = addDays(to, 1);
    long = true;
  }
  if (holidayOn(addDays(from, -1)) || holidayOn(from)) {
    if (holidayOn(addDays(from, -1))) from = addDays(from, -1);
    long = true;
  }

  return { from, to, long };
}

/* -------------------------------------------------------------------------- */
/* Normalising the source                                                     */
/* -------------------------------------------------------------------------- */

export type AgendaCategory =
  | "music"
  | "theatre"
  | "family"
  | "fairs"
  | "exhibitions"
  | "festivals"
  | "routes"
  | "dance"
  | "other";

const CATEGORY_TAGS: { tag: string; category: AgendaCategory }[] = [
  { tag: "infantil", category: "family" },
  { tag: "fires-i-mercats", category: "fairs" },
  { tag: "festivals-i-mostres", category: "festivals" },
  { tag: "concerts", category: "music" },
  { tag: "teatre", category: "theatre" },
  { tag: "circ", category: "theatre" },
  { tag: "dansa", category: "dance" },
  { tag: "exposicions", category: "exhibitions" },
  { tag: "rutes-i-visites", category: "routes" },
];

export interface AgendaEvent {
  id: string;
  title: string;
  venue: string;
  municipality: string;
  comarca: string;
  start: string;
  end: string;
  category: AgendaCategory;
  free: boolean;
  url: string | null;
  /** Starts inside the window, rather than having started before it. */
  startsThisWeekend: boolean;
}

/** `agenda:ubicacions/barcelona/barcelones/sant-cugat-del-valles` → its last segment. */
function lastSegment(path: string | undefined): string {
  if (!path) return "";
  const parts = path.split(",")[0]?.split("/") ?? [];
  return parts[parts.length - 1] ?? "";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/l·l/g, "ll")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Title-cased fallback for a slug the municipality list does not know. */
function prettify(slug: string): string {
  const lower = new Set(["de", "del", "dels", "la", "les", "el", "els", "i", "d", "l"]);
  return slug
    .split("-")
    .map((word, index) =>
      index > 0 && lower.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}

function categoryOf(tags: string | undefined): AgendaCategory {
  const value = tags ?? "";
  for (const { tag, category } of CATEGORY_TAGS) {
    if (value.includes(`categories/${tag}`)) return category;
  }
  return "other";
}

/** Only an organiser link we can vouch for being a web address. */
function cleanUrl(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!/^https?:\/\/[^\s]+\.[^\s]+/.test(trimmed)) return null;
  return trimmed.replace(/^http:\/\//, "https://");
}

export function normaliseEvent(
  row: Record<string, string | undefined>,
  window: WeekendWindow,
  names: ReadonlyMap<string, string>,
): AgendaEvent | null {
  const title = (row.denominaci ?? "").trim();
  const start = (row.data_inici ?? "").slice(0, 10);
  const end = (row.data_fi ?? row.data_inici ?? "").slice(0, 10);
  if (!title || !start) return null;

  // An activity running for months is a standing exhibition, not a weekend
  // plan; listing a year-long show as "this weekend" pads the list with things
  // that were equally true last month.
  const spanDays =
    (new Date(`${end}T12:00:00Z`).getTime() - new Date(`${start}T12:00:00Z`).getTime()) /
    86_400_000;
  if (spanDays > 45) return null;

  const municipalitySlug = lastSegment(row.comarca_i_municipi ?? row.municipi);
  const comarcaSlug = lastSegment(row.comarca);

  return {
    id: row.codi ?? `${title}-${start}`,
    title,
    venue: (row.espai ?? "").trim(),
    municipality: names.get(municipalitySlug) ?? prettify(municipalitySlug),
    comarca: prettify(comarcaSlug),
    start,
    end,
    category: categoryOf(row.tags_categor_es),
    free: (row.gratuita ?? "").toLowerCase() === "sí" || (row.gratuita ?? "").toLowerCase() === "si",
    url: cleanUrl(row.url) ?? cleanUrl(row.linkbotoentrades),
    startsThisWeekend: start >= window.from && start <= window.to,
  };
}

/* -------------------------------------------------------------------------- */
/* Fetching                                                                   */
/* -------------------------------------------------------------------------- */

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { accept: "application/json" },
    // Next.js caches this response and refreshes it in the background.
    next: { revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(20_000),
  } as RequestInit);
  if (!response.ok) throw new Error(`${response.status} from ${new URL(url).host}`);
  return (await response.json()) as T;
}

async function municipalityNames(): Promise<Map<string, string>> {
  try {
    const rows = await fetchJson<{ cap_de_municipi?: string }[]>(
      `${MUNICIPALITIES}?$select=cap_de_municipi&$limit=2000`,
    );
    const map = new Map<string, string>();
    for (const row of rows) {
      const name = row.cap_de_municipi?.trim();
      if (name) map.set(slugify(name), name);
    }
    return map;
  } catch {
    // Names are cosmetic; the slug fallback is readable without accents.
    return new Map();
  }
}

export interface AgendaResult {
  window: WeekendWindow;
  events: AgendaEvent[];
  /** Null when the source answered; the reason when it did not. */
  error: string | null;
}

export async function loadWeekendAgenda(today?: string): Promise<AgendaResult> {
  const window = weekendWindow(today);

  const where =
    `data_inici <= '${window.to}T23:59:59' AND data_fi >= '${window.from}T00:00:00'` +
    ` AND (permanent IS NULL OR permanent != 'Sí')` +
    ` AND (modalitat IS NULL OR modalitat != 'Virtual')`;
  const url =
    `${ENDPOINT}?$select=codi,denominaci,espai,comarca_i_municipi,municipi,comarca,` +
    `data_inici,data_fi,tags_categor_es,gratuita,url,linkbotoentrades` +
    `&$where=${encodeURIComponent(where)}&$order=data_inici&$limit=1500`;

  try {
    const [rows, names] = await Promise.all([
      fetchJson<Record<string, string | undefined>[]>(url),
      municipalityNames(),
    ]);

    const seen = new Set<string>();
    const events: AgendaEvent[] = [];
    for (const row of rows) {
      const event = normaliseEvent(row, window, names);
      if (!event || seen.has(event.id)) continue;
      seen.add(event.id);
      events.push(event);
    }

    // New this weekend first, then by date, then by name.
    events.sort(
      (a, b) =>
        Number(b.startsThisWeekend) - Number(a.startsThisWeekend) ||
        a.start.localeCompare(b.start) ||
        a.title.localeCompare(b.title, "ca"),
    );

    return { window, events, error: null };
  } catch (error) {
    return {
      window,
      events: [],
      error: error instanceof Error ? error.message : "unreachable",
    };
  }
}
