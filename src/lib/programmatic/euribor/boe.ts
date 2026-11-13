import type { BoeGroup } from "./series";

/**
 * The BOE side of the Euribor pages: finding the Banco de España's monthly
 * resolutions in a BOE daily summary (open-data API) and reading the figures
 * they print, so the snapshot script can check every Banco de España value
 * against the BOE text and keep each resolution's identifier for the page's
 * links. Pure: the script (scripts/euribor-snapshot.ts) does the fetching.
 */

export const BOE_SUMMARY_API = "https://www.boe.es/datosabiertos/api/boe/sumario/";

/** "2026-11-04" → the BOE open-data summary URL of that day. */
export function boeSummaryUrl(date: string): string {
  return `${BOE_SUMMARY_API}${date.replaceAll("-", "")}`;
}

export function boeTextUrl(id: string): string {
  return `https://www.boe.es/diario_boe/txt.php?id=${id}`;
}

/** Titles of the Banco de España resolutions with official mortgage reference rates (Euribor and IRPH share one wording). */
const TITLES: { kind: SummaryHit["kind"]; re: RegExp }[] = [
  { kind: "rates", re: /del Banco de España, por la que se publican determinados tipos de interés oficiales de referencia del mercado hipotecario/i },
  { kind: "debt", re: /del Banco de España, por la que se publica el tipo de rendimiento interno en el mercado secundario de la deuda pública de plazo entre dos y seis años/i },
];

export interface SummaryHit {
  id: string;
  title: string;
  /** "rates": the Euribor/IRS/€STR or the IRPH resolution (told apart by their figures); "debt": public debt 2–6 years. */
  kind: "rates" | "debt";
}

/** The Banco de España reference-rate resolutions in a BOE summary answer. */
export function findResolutions(json: unknown): SummaryHit[] {
  const out: SummaryHit[] = [];
  const walk = (o: unknown) => {
    if (Array.isArray(o)) {
      o.forEach(walk);
      return;
    }
    if (!o || typeof o !== "object") return;
    const rec = o as Record<string, unknown>;
    const id = rec.identificador;
    const title = rec.titulo;
    if (typeof id === "string" && typeof title === "string" && /^BOE-A-\d{4}-\d+$/.test(id)) {
      const t = TITLES.find((x) => x.re.test(title));
      if (t) out.push({ id, title, kind: t.kind });
    }
    Object.values(rec).forEach(walk);
  };
  walk(json);
  return out;
}

const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

const strip = (html: string) =>
  html
    .replace(/<sup>[\s\S]*?<\/sup>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .replace(/\( /g, "(")
    .replace(/ \)/g, ")")
    .trim();

export interface BoeFigures {
  /** "2026-10": the month the resolution's figures refer to (its caption, "Octubre de 2026"). */
  month: string | null;
  /** Euribor one year (interbank resolution). */
  euribor: number | null;
  irs5: number | null;
  estr12: number | null;
  /** IRPH entidades (Spain). */
  irph: number | null;
  /** The euro-area 1–5 year housing loans rate. */
  irphEuro: number | null;
  debt26: number | null;
}

/** Which group a resolution's figures belong to. */
export function groupOf(f: BoeFigures, kind: SummaryHit["kind"]): BoeGroup | null {
  if (kind === "debt") return f.debt26 === null ? null : "debt";
  if (f.euribor !== null) return "interbank";
  if (f.irph !== null) return "irph";
  return null;
}

/**
 * The figures of one resolution page (txt.php), read from its table: the
 * caption gives the month, each row a label and a value ("3,239"). The
 * one-year rows of the Euribor and €STR blocks are told apart by the block
 * heading above them. Null where the text does not have a figure.
 */
export function parseResolution(html: string): BoeFigures {
  const out: BoeFigures = { month: null, euribor: null, irs5: null, estr12: null, irph: null, irphEuro: null, debt26: null };
  const body = /<div id="textoxslt"[\s\S]*$/i.exec(html)?.[0] ?? html;
  // The month is a line of its own ("Octubre de 2026", "Febrero 2024"): in the table caption or a paragraph above the table, depending on the year.
  for (const m of body.matchAll(/<(p|caption)[^>]*>([\s\S]*?)<\/\1>/gi)) {
    const mm = /^(\p{L}+) (?:de )?(\d{4})$/u.exec(strip(m[2]!));
    const mi = mm ? MONTHS.indexOf(mm[1]!.toLowerCase()) : -1;
    if (mm && mi >= 0) {
      out.month = `${mm[2]}-${String(mi + 1).padStart(2, "0")}`;
      break;
    }
  }
  let block: "euribor" | "estr" | null = null;
  for (const row of body.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...row[1]!.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((c) => strip(c[1]!));
    // A block heading can be a single cell spanning both columns (2024 resolutions).
    const label = cells[0] ?? "";
    const raw = cells[1] ?? "";
    const value = /^-?\d+,\d{3}( ?%)?$/.test(raw) ? Number(raw.replace(/ ?%$/, "").replace(",", ".")) : null;
    if (/Eur[ií]bor\. Plazos/i.test(label)) block = "euribor";
    else if (/€\s*STR/.test(label)) block = "estr";
    else if (/^\d+[.)]/.test(label)) block = null;
    if (value === null) continue;
    if (/^[–—-] ?Un año\.?$/.test(label)) {
      if (block === "euribor") out.euribor = value;
      if (block === "estr") out.estr12 = value;
    } else if (/\(IRS\) al plazo de cinco años/i.test(label)) out.irs5 = value;
    else if (/préstamos hipotecarios a más de tres años, para adquisición de vivienda libre, concedidos por las entidades de crédito en España/i.test(label)) out.irph = value;
    else if (/préstamos a la vivienda entre uno y cinco años concedidos por las entidades de crédito en la zona euro/i.test(label)) out.irphEuro = value;
    else if (/deuda pública de plazo entre dos y seis años/i.test(label)) out.debt26 = value;
  }
  return out;
}
