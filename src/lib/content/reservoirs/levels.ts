/**
 * Reservoir levels in Catalonia, read daily from the water agency's open data.
 *
 * ## Why this exists
 *
 * "How full are the reservoirs" is asked every week of the year in Catalonia,
 * and since the last drought it is asked anxiously. The answers that rank
 * are news articles frozen on the day they were written. The Agència Catalana
 * de l'Aigua publishes the figure every day as open data (`gn9e-3qhr`): one row
 * per reservoir per day, back to 2000. This module reads it.
 *
 * ## What it will not do
 *
 * - **Show a stale day as today.** The reading date is always printed, and a
 *   failed fetch is reported as a failure, never replaced by remembered data.
 * - **Trust a damaged row.** See `REFERENCE_CAPACITY`.
 * - **Invent a capacity.** The dataset gives volume (hm³) and percentage full,
 *   not capacity. Capacity is volume ÷ percentage, which reproduces the ACA's
 *   own bulletin to within rounding (Sau 165.8 hm³, Susqueda 223.5 hm³).
 */

const ENDPOINT = "https://analisi.transparenciacatalunya.cat/resource/gn9e-3qhr.json";

export const RESERVOIR_SOURCE = {
  name: "Quantitat d'aigua als embassaments de les Conques Internes de Catalunya",
  url: "https://analisi.transparenciacatalunya.cat/d/gn9e-3qhr",
  publisher: "Agència Catalana de l'Aigua — dades obertes",
};

/** The ACA updates once a day; three hours keeps the page within a morning of it. */
const REVALIDATE_SECONDS = 10_800;

/**
 * The five reservoirs the ACA's own basin plan treats as the storage of the
 * Ter-Llobregat system, which supplies the Barcelona area.
 */
export const TER_LLOBREGAT = ["Sau", "Susqueda", "la Baells", "la Llosa del Cavall", "Sant Ponç"] as const;

export interface ReservoirReading {
  /** Short name: "Sau", "la Baells". */
  name: string;
  /** Municipality as the source gives it in brackets, when it does. */
  place: string | null;
  volume: number;
  percent: number;
  /** Derived: volume ÷ percent. */
  capacity: number;
  /** Percentage points against the comparison day, when there is a clean one. */
  change: number | null;
}

export interface ReservoirTotals {
  volume: number;
  capacity: number;
  percent: number;
}

export interface ReservoirReport {
  /** ISO date of the reading. */
  date: string;
  /** ISO date the change is measured from; null when no clean day exists. */
  compareDate: string | null;
  reservoirs: ReservoirReading[];
  total: ReservoirTotals;
  terLlobregat: ReservoirTotals;
  totalCompare: ReservoirTotals | null;
  error: string | null;
}

interface Row {
  dia?: string;
  estaci?: string;
  percentatge_volum_embassat?: string;
  volum_embassat?: string;
}

export interface Parsed {
  date: string;
  name: string;
  place: string | null;
  volume: number;
  percent: number;
}

/**
 * "Embassament de la Llosa del Cavall (Navès)" → name "la Llosa del Cavall",
 * place "Navès". "Embassament de Riudecanyes" has no bracket.
 */
export function splitStation(station: string): { name: string; place: string | null } {
  const match = /^Embassament\s+(?:de\s+|d')?(.*?)\s*(?:\(([^)]+)\))?\s*$/i.exec(station.trim());
  if (!match) return { name: station.trim(), place: null };
  const [, rawName = "", place] = match;
  return { name: rawName.trim(), place: place?.trim() ?? null };
}

export function parseRows(rows: Row[]): Parsed[] {
  const out: Parsed[] = [];
  for (const row of rows) {
    const date = (row.dia ?? "").slice(0, 10);
    const volume = Number(row.volum_embassat);
    const percent = Number(row.percentatge_volum_embassat);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !row.estaci) continue;
    if (!Number.isFinite(volume) || !Number.isFinite(percent) || percent <= 0) continue;
    out.push({ date, ...splitStation(row.estaci), volume, percent });
  }
  return out;
}

/*
 * Capacities used only to reject damaged rows, never displayed.
 *
 * Most of this dataset's history has lost its decimal separator: on
 * 30 Sep 2026 Sau reads "68.3 % / 113.25 hm³" as "683" and "11325", and a year
 * earlier every row is like that. A row is trusted only when its volume and
 * percentage agree with the reservoir's known size. The five Ter-Llobregat
 * figures are the ACA's bulletin of 29 Sep 2026; the other four are derived
 * from the clean readings of 1-7 Oct 2026.
 */
export const REFERENCE_CAPACITY: Record<string, number> = {
  Susqueda: 223.58,
  Sau: 165.81,
  "la Baells": 108.71,
  "la Llosa del Cavall": 71.56,
  "Sant Ponç": 24.41,
  "Darnius Boadella": 63.3,
  Siurana: 12.0,
  Riudecanyes: 5.3,
  Foix: 3.4,
};

export function isClean(row: Parsed): boolean {
  const reference = REFERENCE_CAPACITY[row.name];
  if (!reference || row.percent > 100.5) return false;
  return Math.abs((row.volume / row.percent) * 100 / reference - 1) < 0.04;
}

export function totals(rows: { volume: number; percent: number }[]): ReservoirTotals {
  const volume = rows.reduce((sum, r) => sum + r.volume, 0);
  const capacity = rows.reduce((sum, r) => sum + (r.volume / r.percent) * 100, 0);
  return { volume, capacity, percent: capacity > 0 ? (volume / capacity) * 100 : 0 };
}

function shiftIso(iso: string, days: number): string {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

const EMPTY: ReservoirTotals = { volume: 0, capacity: 0, percent: 0 };

/**
 * Builds the report from parsed rows of the last fortnight. Pure, so it is
 * tested without the network.
 *
 * "Today" is the latest day on which every reservoir reads clean. The change
 * is measured from the earliest clean day three to seven days before it, and
 * that date is printed: a week when there is one, fewer days when the dataset
 * only has those.
 */
export function buildReport(rows: Parsed[]): ReservoirReport {
  const names = Object.keys(REFERENCE_CAPACITY);
  const byDate = new Map<string, Parsed[]>();
  for (const row of rows) byDate.set(row.date, [...(byDate.get(row.date) ?? []), row]);
  const complete = (iso: string) => {
    const day = byDate.get(iso) ?? [];
    return names.every((n) => day.some((r) => r.name === n && isClean(r)));
  };
  const cleanDays = [...byDate.keys()].filter(complete).sort();
  const date = cleanDays.at(-1);
  if (!date) {
    return { date: "", compareDate: null, reservoirs: [], total: EMPTY, terLlobregat: EMPTY, totalCompare: null, error: "no clean day" };
  }

  const compareDate =
    cleanDays.find((d) => d >= shiftIso(date, -7) && d <= shiftIso(date, -3)) ?? null;
  const today = (byDate.get(date) ?? []).filter((r) => names.includes(r.name));
  const before = new Map((compareDate ? byDate.get(compareDate) ?? [] : []).map((r) => [r.name, r]));

  const reservoirs: ReservoirReading[] = today
    .map((r) => ({
      name: r.name,
      place: r.place,
      volume: r.volume,
      percent: r.percent,
      capacity: (r.volume / r.percent) * 100,
      change: before.has(r.name) ? r.percent - before.get(r.name)!.percent : null,
    }))
    .sort((a, b) => b.capacity - a.capacity);

  const terNames = new Set<string>(TER_LLOBREGAT);
  return {
    date,
    compareDate,
    reservoirs,
    total: totals(today),
    terLlobregat: totals(today.filter((r) => terNames.has(r.name))),
    totalCompare: compareDate ? totals(today.map((r) => before.get(r.name)!)) : null,
    error: null,
  };
}

async function query(params: string): Promise<Row[]> {
  const response = await fetch(`${ENDPOINT}?${params}`, {
    headers: { accept: "application/json" },
    next: { revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(20_000),
  } as RequestInit);
  if (!response.ok) throw new Error(`${response.status}`);
  return (await response.json()) as Row[];
}

export async function loadReservoirs(now: Date = new Date()): Promise<ReservoirReport> {
  try {
    const since = shiftIso(now.toISOString().slice(0, 10), -14);
    const rows = await query(`$where=${encodeURIComponent(`dia >= '${since}T00:00:00.000'`)}&$limit=500`);
    return buildReport(parseRows(rows));
  } catch (error) {
    return {
      date: "",
      compareDate: null,
      reservoirs: [],
      total: EMPTY,
      terLlobregat: EMPTY,
      totalCompare: null,
      error: error instanceof Error ? error.message : "unreachable",
    };
  }
}
