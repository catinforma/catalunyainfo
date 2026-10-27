/**
 * Parsers for the three DOGC texts the holiday engine is built from.
 *
 *  1. The yearly local-holiday order ("Ordre EMT/208/2025 ... calendari de
 *     festes locals a Catalunya per a l'any 2026"). One paragraph per comarca,
 *     one entry per council or nucleus: `Figueres, 25 de maig i 29 de juny.`
 *  2. The orders that amend it ("Ordre EMT/3/2026 ... de modificació"), which
 *     quote the old entry and the new one: `on diu: "…", ha de dir: "…".`
 *  3. The yearly resolution with the shop-opening Sundays and holidays of the
 *     councils that changed the general calendar ("Resolució EMT/4342/2025"):
 *     `Badalona 4 i 11 de gener. 10 de maig. 15 d'agost. …`
 *
 * Input is the text of the official PDF as `pdftotext -enc UTF-8` prints it
 * (Git for Windows and poppler both ship it), or the same text copied from the
 * DOGC's HTML view. Page furniture (page numbers, the gazette header, ISSN,
 * legal deposit) is stripped first, so an entry split across two pages is
 * read as one.
 *
 * Pure functions, no I/O: the refresh script (`scripts/holidays-snapshot.ts`)
 * feeds them, and the tests run them against the 2026 texts as fixtures.
 */

export const CA_MONTHS = [
  "gener",
  "febrer",
  "març",
  "abril",
  "maig",
  "juny",
  "juliol",
  "agost",
  "setembre",
  "octubre",
  "novembre",
  "desembre",
] as const;

const MONTH = `(?:${CA_MONTHS.join("|")})`;
/** `25 de maig`, `14 d'agost`, `14 d’agost`. */
const OF = `(?:de\\s+|d['’]\\s*)`;
/** One day number, optionally with its month: `4`, `11 de gener`. */
const DAY = `\\d{1,2}(?:\\s+${OF}${MONTH})?`;
/** A list of days ending in a month: `25 de maig i 29 de juny`, `6, 8, 13 i 20 de desembre`. */
const DAY_LIST = `${DAY}(?:\\s*(?:,|\\si\\s)\\s*${DAY})*`;

/* -------------------------------------------------------------------------- */
/* Text clean-up                                                              */
/* -------------------------------------------------------------------------- */

const FURNITURE = [
  /^\d+\/\d+$/, // page "3/42"
  /^Diari Oficial de la Generalitat de Catalunya$/,
  /^Núm\.\s*\d+\s*-\s*\d{1,2}\.\d{1,2}\.\d{4}(\s+CVE-DOGC-[A-Z]-[\d-]+)?$/,
  /^CVE-DOGC-[A-Z]-[\d-]+$/,
  /^ISSN\s+[\d-X]+$/,
  /^https:\/\/www\.gencat\.cat\/dogc$/,
  /^DL B [\d-]+$/,
];

/** Normalises quotes and spaces and removes the gazette's page furniture. */
export function cleanText(raw: string): string[] {
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/[   ]/g, " ")
    .replace(/[‘’ʼ´`]/g, "'")
    .replace(/[“”«»]/g, '"')
    .replace(/­/g, "")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line !== "" && !FURNITURE.some((re) => re.test(line)));
}

/* -------------------------------------------------------------------------- */
/* Names                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The gazette writes articles after the name ("Prat de Llobregat, el",
 * "Hospitalet de Llobregat, l'"). Puts them back in front, lower case:
 * "el Prat de Llobregat", "l'Hospitalet de Llobregat".
 */
export function articleFirst(name: string): string {
  const clean = name.replace(/[’]/g, "'").replace(/\s+/g, " ").trim();
  const match = /^(.*?),\s*(la|el|les|els|l')$/i.exec(clean);
  if (!match) return clean;
  const base = match[1] ?? "";
  const article = (match[2] ?? "").toLowerCase();
  return article === "l'" ? `l'${base}` : `${article} ${base}`;
}

/** Comparison key: article in front, lower case, no accents, single spaces. */
export function nameKey(name: string): string {
  return articleFirst(name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/l·l|l\.l/g, "ll")
    .replace(/['’]/g, "'")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

/* -------------------------------------------------------------------------- */
/* Dates                                                                      */
/* -------------------------------------------------------------------------- */

function monthIndex(word: string): number {
  return CA_MONTHS.indexOf(word.toLowerCase() as (typeof CA_MONTHS)[number]);
}

function iso(year: number, month: number, day: number): string {
  const date = new Date(Date.UTC(year, month, day));
  if (date.getUTCMonth() !== month || date.getUTCDate() !== day) {
    throw new Error(`dogc: impossible date ${day}/${month + 1}/${year}`);
  }
  return date.toISOString().slice(0, 10);
}

/**
 * `25 de maig i 29 de juny` -> ["YYYY-05-25", "YYYY-06-29"].
 * `6, 8, 13 i 20 de desembre` -> four December dates: a day without its own
 * month takes the next month written after it.
 */
export function parseDayList(text: string, year: number): string[] {
  const parts = [...text.matchAll(new RegExp(`(\\d{1,2})(?:\\s+${OF}(${MONTH}))?`, "giu"))];
  const out: string[] = [];
  let pending: number[] = [];
  for (const part of parts) {
    const day = Number(part[1]);
    const month = part[2];
    if (!month) {
      pending.push(day);
      continue;
    }
    const index = monthIndex(month);
    for (const d of [...pending, day]) out.push(iso(year, index, d));
    pending = [];
  }
  if (pending.length > 0) throw new Error(`dogc: days without a month in "${text}"`);
  return out;
}

/* -------------------------------------------------------------------------- */
/* 1. The local-holiday order                                                 */
/* -------------------------------------------------------------------------- */

export interface OrderEntry {
  /** As the gazette writes it, e.g. "Prat de Llobregat, el". */
  name: string;
  /** ISO dates in the order written; empty when no proposal was made. */
  dates: string[];
  /** "proposta no formulada": the council sent no proposal in time. */
  noProposal: boolean;
}

export interface OrderComarca {
  /** As the heading prints it, upper case: "BAIX LLOBREGAT". */
  heading: string;
  entries: OrderEntry[];
}

function isHeading(line: string): boolean {
  if (line.length < 3 || line.length > 40) return false;
  if (/\d/.test(line)) return false;
  if (!/\p{Lu}/u.test(line)) return false;
  return line === line.toUpperCase() && !/[.,:;]$/.test(line);
}

/**
 * Entries of one comarca paragraph. Each entry ends with ", <days>" or
 * ", proposta no formulada", usually followed by a full stop; the name is
 * whatever lies between the previous entry and that comma. The gazette
 * sometimes drops the full stop ("Sitges, 23 de setembre Vilanova i la
 * Geltrú, …"), which this tolerates because it never relies on the stop.
 */
export function parseEntries(text: string, year: number): OrderEntry[] {
  const tail = new RegExp(`,\\s*(${DAY_LIST}|proposta no formulada)\\s*\\.?`, "giu");
  const out: OrderEntry[] = [];
  let last = 0;
  for (const match of text.matchAll(tail)) {
    const name = text
      .slice(last, match.index)
      .replace(/^[\s.;]+|[\s.;]+$/g, "")
      .trim();
    last = (match.index ?? 0) + match[0].length;
    if (!name) continue;
    const body = match[1] ?? "";
    const noProposal = /proposta no formulada/i.test(body);
    out.push({ name, dates: noProposal ? [] : parseDayList(body, year), noProposal });
  }
  return out;
}

/**
 * Reads the whole order: the year from its title, then one block per comarca
 * heading, from the first heading to "Disposició final".
 */
export function parseLocalOrder(raw: string): { year: number; comarques: OrderComarca[] } {
  const lines = cleanText(raw);
  const all = lines.join(" ");
  const yearMatch = /calendari de festes locals a Catalunya per a l'any (\d{4})/i.exec(all);
  if (!yearMatch) throw new Error("dogc: not a local-holiday order (no 'calendari de festes locals ... per a l'any')");
  const year = Number(yearMatch[1]);

  const comarques: OrderComarca[] = [];
  let current: { heading: string; text: string[] } | null = null;
  let started = false;
  for (const line of lines) {
    if (/^Disposició final/i.test(line)) break;
    if (isHeading(line) && !/^(ALTRES DISPOSICIONS|DEPARTAMENT\b)/.test(line)) {
      if (current) comarques.push({ heading: current.heading, entries: parseEntries(current.text.join(" "), year) });
      current = { heading: line, text: [] };
      started = true;
      continue;
    }
    if (started && current) current.text.push(line);
  }
  if (current) comarques.push({ heading: current.heading, entries: parseEntries(current.text.join(" "), year) });
  if (comarques.length === 0) throw new Error("dogc: no comarca headings found");
  return { year, comarques };
}

/* -------------------------------------------------------------------------- */
/* 2. Amending orders                                                         */
/* -------------------------------------------------------------------------- */

export interface Amendment {
  /** Comarca as the amending order names it: "Baix Llobregat". */
  comarca: string;
  /** The entries as quoted ("on diu"). */
  before: OrderEntry[];
  /** The replacement entries ("ha de dir"). */
  entries: OrderEntry[];
}

/**
 * `A la comarca del Baix Llobregat, on diu: "…", ha de dir: "Viladecans, 25 de
 * maig i 8 de setembre. …".` -> one Amendment per sentence, with the quoted
 * and the new entries parsed like the order's own.
 */
export function parseAmendments(raw: string, year: number): Amendment[] {
  const text = cleanText(raw).join(" ");
  const re = /A la comarca (?:del |de la |de l'|de les |dels |d'|de )?([^,]+?),\s*on diu:\s*"([^"]*)",\s*ha de dir:\s*"([^"]*)"/giu;
  const out: Amendment[] = [];
  for (const match of text.matchAll(re)) {
    out.push({
      comarca: (match[1] ?? "").trim(),
      before: parseEntries(match[2] ?? "", year),
      entries: parseEntries(match[3] ?? "", year),
    });
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* The Catalonia-wide calendar order (Ordre EMT/66/2025, EMT/52/2026)         */
/* -------------------------------------------------------------------------- */

/**
 * Article 1 of the yearly calendar order: "a) Seran festes laborals a
 * Catalunya durant l'any 2026: 1 de gener, dijous 6 de gener, … b) Al
 * territori d'Aran, la festa del dia 26 de desembre (Sant Esteve) queda
 * substituïda per la de 17 de juny (Festa d'Aran)". The PDF prints the
 * weekdays in a column beside the dates, so they are dropped, not trusted.
 */
export function parseRegionalOrder(raw: string): { year: number; dates: string[]; aran: { replaces: string; date: string } | null } {
  const text = cleanText(raw).join(" ");
  const head = /Seran festes laborals a Catalunya durant l'any (\d{4}):\s*(.*?)\s*b\)\s*Al territori d'Aran,(.*?)Article 2/i.exec(text);
  if (!head) throw new Error("dogc: not a Catalonia-wide calendar order");
  const year = Number(head[1]);
  const list = (head[2] ?? "").replace(/\b(dilluns|dimarts|dimecres|dijous|divendres|dissabte|diumenge)\b/gi, "");
  const dates = [...new Set(parseDayList(list, year))].sort();
  const aranMatch = /del dia (\d{1,2}\s+(?:de\s+|d')\S+)\s*\(.*?\)\s*queda substituïda per la de (\d{1,2}\s+(?:de\s+|d')\S+)/i.exec(head[3] ?? "");
  const aran = aranMatch
    ? { replaces: parseDayList(aranMatch[1] ?? "", year)[0] ?? "", date: parseDayList(aranMatch[2] ?? "", year)[0] ?? "" }
    : null;
  return { year, dates, aran };
}

/* -------------------------------------------------------------------------- */
/* 3. Shop-opening days per council                                           */
/* -------------------------------------------------------------------------- */

export interface ShopEntry {
  name: string;
  dates: string[];
}

/**
 * The resolution lists, after "Resolc:", each council that changed the
 * general calendar followed by its full list of ten days. Names carry no
 * comma, so the text is read as alternating runs of name and dates.
 */
export function parseShopResolution(raw: string): { year: number; defaults: string[]; councils: ShopEntry[] } {
  const text = cleanText(raw).join(" ");
  const yearMatch = /obertura comercial autoritzada de diversos municipis per a l'any (\d{4})/i.exec(text);
  if (!yearMatch) throw new Error("dogc: not a shop-opening resolution");
  const year = Number(yearMatch[1]);

  // "els deu dies festius ... per als municipis que no consten en aquesta
  // Resolució, són el 4 i l'11 de gener, el 15 d'agost, …;"
  const defaultsMatch = /per als municipis que no consten en aquesta Resolució, són (.*?);/i.exec(text);
  const defaults = defaultsMatch
    ? parseDayList((defaultsMatch[1] ?? "").replace(/(^|\s)(?:el|l')\s*/g, "$1"), year)
    : [];

  const start = text.search(/Resolc:/i);
  const end = text.search(/Contra aquesta Resolució/i);
  if (start < 0 || end < 0) throw new Error("dogc: resolution body not found");
  // Skip the operative sentence ("Fer públics els calendaris … (DOGC núm. …).").
  const body = text.slice(start, end).replace(/^Resolc:\s*Fer públics[^]*?\d{1,2}\.\d{1,2}\.\d{4}\)\.\s*/i, "");

  const dateRun = new RegExp(`(?:${DAY_LIST}\\.?\\s*)+`, "giu");
  const councils: ShopEntry[] = [];
  let last = 0;
  let pendingName: string | null = null;
  for (const match of body.matchAll(dateRun)) {
    const between = body.slice(last, match.index).trim();
    if (between) pendingName = between;
    last = (match.index ?? 0) + match[0].length;
    if (!pendingName) continue;
    const dates = [...match[0].matchAll(new RegExp(DAY_LIST, "giu"))].flatMap((m) => parseDayList(m[0], year));
    const existing = councils.at(-1);
    if (existing && existing.name === pendingName) existing.dates.push(...dates);
    else councils.push({ name: pendingName, dates });
  }
  for (const council of councils) council.dates = [...new Set(council.dates)].sort();
  return { year, defaults: [...new Set(defaults)].sort(), councils };
}
