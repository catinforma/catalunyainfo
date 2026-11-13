/**
 * Auction results of the Letras del Tesoro, read from the Tesoro Público's
 * own pages (no CSV, XLS or JSON of the current year exists: the Tesoro's
 * "histórico de subastas" XLSX stops at 2025 and is updated monthly, the
 * results are only published as HTML tables):
 *
 *  - "Resultado de últimas subastas · Letras del Tesoro"
 *    (LATEST_RESULTS_URL): one table, one column per term (3, 6, 9, 12
 *    months), class "teso-table";
 *  - "Resultados subastas anteriores" (PAST_RESULTS_URL, one detail page
 *    per auction and term, `entryId`): the same rows in a one-column
 *    "kv-table".
 *
 * Pure and client-safe: no fetch here (server.ts and
 * scripts/letras-snapshot.ts fetch). The parser only accepts a column whose
 * figures hold together (dates in order, the average price equal to the one
 * the Orden ECM/2/2026 art. 14 formula gives for the average rate), so a
 * changed page layout falls back to the committed snapshot instead of
 * printing a wrong rate.
 */

export type Term = 3 | 6 | 9 | 12;
export const TERMS: readonly Term[] = [3, 6, 9, 12];

export const LATEST_RESULTS_URL = "https://www.tesoro.es/deuda-publica/subastas/resultado-ultimas-subastas/letras-del-tesoro";
export const PAST_RESULTS_URL = "https://www.tesoro.es/deuda-publica/subastas/resultados-subastas-anteriores";
/** The Tesoro's portlet id on the past-results page (read 13 Nov 2026). */
export const PAST_RESULTS_PORTLET = "es_tesoro_subastas_web_TesoroSubastasWebPortlet_INSTANCE_lgqt";

/** The results page in the reader's language (the Tesoro has ca and en editions). */
export function latestResultsUrl(locale: "es" | "ca" | "en"): string {
  return locale === "es" ? LATEST_RESULTS_URL : LATEST_RESULTS_URL.replace("tesoro.es/", `tesoro.es/${locale}/`);
}

/** Page `page` of the past results, Letras only. */
export function pastListUrl(page: number): string {
  const p = PAST_RESULTS_PORTLET;
  return `${PAST_RESULTS_URL}?p_p_id=${p}&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&_${p}_cur=${page}&_${p}_type=LETRAS`;
}

/** One past auction's detail page. */
export function pastDetailUrl(entryId: string): string {
  const p = PAST_RESULTS_PORTLET;
  return `${PAST_RESULTS_URL}?p_p_id=${p}&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&_${p}_entryId=${entryId}&_${p}_type=LETRAS`;
}

/** One term of one auction, as the Tesoro publishes it. Amounts in millions of euros, prices in % of face value, rates in %. */
export interface AuctionResult {
  term: Term;
  /** ISO day of the auction ("Fecha subasta"). */
  auction: string;
  /** ISO day the bills are issued and paid for ("Fecha de liquidación"). */
  settlement: string;
  /** ISO day they are repaid at 1,000 € each ("Fecha vencimiento"). */
  maturity: string;
  requested: number;
  allotted: number;
  /** Allotted in the second round (0 when there was none). */
  allottedSecondRound: number;
  minPrice: number;
  marginalRate: number;
  avgPrice: number;
  avgRate: number;
  nonCompetitive: number | null;
  coverage: number | null;
  /** "Anterior tipo marginal": the previous auction's marginal rate for the term. */
  previousMarginalRate: number | null;
  /** The Tesoro page the figures were read from. */
  source: string;
}

/** Days between settlement and maturity (the "d" of the Tesoro's formula). */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

export function resultDays(r: Pick<AuctionResult, "settlement" | "maturity">): number {
  return daysBetween(r.settlement, r.maturity);
}

/* -------------------------------------------------------------------------- */
/* HTML parsing                                                               */
/* -------------------------------------------------------------------------- */

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', nbsp: " ", ordf: "ª", ordm: "º", aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú", ntilde: "ñ" };

function text(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#\d+|[a-z]+);/gi, (m, e: string) => (e.startsWith("#") ? String.fromCharCode(Number(e.slice(1))) : (ENTITIES[e.toLowerCase()] ?? m)))
    .replace(/\s+/g, " ")
    .trim();
}

/** "1.946,17" → 1946.17; "" → null. */
export function esNumber(s: string): number | null {
  const t = s.trim();
  if (!/^-?[\d.]+(,\d+)?$/.test(t)) return null;
  const n = Number(t.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/** "10/11/2026" → "2026-11-10". */
export function esDate(s: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s.trim());
  if (!m) return null;
  const iso = `${m[3]}-${m[2]}-${m[1]}`;
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== iso ? null : iso;
}

/** The rows of the Tesoro's results table: label → one cell per column. */
export function tableRows(html: string): Map<string, string[]> {
  const rows = new Map<string, string[]>();
  const start = html.search(/<table[^>]*class="(?:teso-table|kv-table)"/);
  if (start < 0) return rows;
  const end = html.indexOf("</table>", start);
  const table = html.slice(start, end < 0 ? undefined : end);
  for (const tr of table.split(/<tr[\s>]/i).slice(1)) {
    const cells = [...tr.matchAll(/<(td|th)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => text(m[2] ?? ""));
    if (cells.length < 2) continue;
    const [label, ...values] = cells as [string, ...string[]];
    if (!rows.has(label)) rows.set(label, values);
  }
  return rows;
}

/** The price the Orden ECM/2/2026 art. 14 formula gives for a rate (in %) and days, for terms up to one year: P = 100 / (1 + i·d/360). */
export function priceForRate(ratePct: number, days: number): number {
  return 100 / (1 + (ratePct / 100) * (days / 360));
}

/** Why a parsed column is refused, or null when it holds together. */
export function resultProblem(r: AuctionResult): string | null {
  const days = resultDays(r);
  if (!(r.auction < r.settlement && r.settlement < r.maturity)) return "dates out of order";
  const expected: Record<Term, [number, number]> = { 3: [70, 100], 6: [160, 200], 9: [250, 290], 12: [340, 371] };
  const [lo, hi] = expected[r.term];
  if (days < lo || days > hi) return `${days} days for a ${r.term}-month bill`;
  for (const [k, v] of [["avgRate", r.avgRate], ["marginalRate", r.marginalRate]] as const) if (!(v > -2 && v < 15)) return `${k} ${v} out of range`;
  for (const [k, v] of [["avgPrice", r.avgPrice], ["minPrice", r.minPrice]] as const) if (!(v > 85 && v < 102)) return `${k} ${v} out of range`;
  if (r.minPrice > r.avgPrice + 1e-9) return "minimum price above the average";
  if (r.marginalRate + 1e-9 < r.avgRate) return "marginal rate below the average";
  if (Math.abs(priceForRate(r.avgRate, days) - r.avgPrice) > 0.003) return `average price ${r.avgPrice} does not match the average rate ${r.avgRate} over ${days} days`;
  if (Math.abs(priceForRate(r.marginalRate, days) - r.minPrice) > 0.003) return `minimum price ${r.minPrice} does not match the marginal rate ${r.marginalRate} over ${days} days`;
  if (!(r.allotted >= 0 && r.requested >= r.allotted)) return "allotted above requested";
  return null;
}

const LABEL = {
  term: "Plazo",
  auction: "Fecha subasta",
  maturity: "Fecha vencimiento",
  settlement: "Fecha de liquidación",
  requested: "Nominal solicitado",
  allotted: "Nominal adjudicado",
  allotted2: "Nominal adjudicado (2ª vuelta)",
  minPrice: "Precio mínimo aceptado",
  marginalRate: "Tipo de interés marginal",
  avgPrice: "Precio medio",
  avgRate: "Tipo de interés medio",
  nonCompetitive: "Peticiones no competitivas",
  coverage: "Ratio de cobertura",
  previousMarginal: "Anterior tipo marginal",
} as const;

export interface ParseOutcome {
  results: AuctionResult[];
  /** Columns that were found but refused, with the reason. */
  refused: string[];
}

/** Every term column of a Tesoro results page (latest results or one past auction) that holds together. */
export function parseResultsPage(html: string, source: string): ParseOutcome {
  const rows = tableRows(html);
  const terms = rows.get(LABEL.term) ?? [];
  const out: ParseOutcome = { results: [], refused: [] };
  terms.forEach((label, i) => {
    const m = /^(\d{1,2})\s*MES(?:ES)?$/i.exec(label);
    const term = m ? (Number(m[1]) as Term) : null;
    if (!term || !TERMS.includes(term)) return;
    const cell = (k: keyof typeof LABEL) => rows.get(LABEL[k])?.[i] ?? "";
    const num = (k: keyof typeof LABEL) => esNumber(cell(k));
    const auction = esDate(cell("auction"));
    const maturity = esDate(cell("maturity"));
    const settlement = esDate(cell("settlement"));
    const required = { requested: num("requested"), allotted: num("allotted"), minPrice: num("minPrice"), marginalRate: num("marginalRate"), avgPrice: num("avgPrice"), avgRate: num("avgRate") };
    if (!auction || !maturity || !settlement || Object.values(required).some((v) => v === null)) {
      out.refused.push(`${term} months: missing cells`);
      return;
    }
    const r: AuctionResult = {
      term,
      auction,
      settlement,
      maturity,
      requested: required.requested!,
      allotted: required.allotted!,
      allottedSecondRound: num("allotted2") ?? 0,
      minPrice: required.minPrice!,
      marginalRate: required.marginalRate!,
      avgPrice: required.avgPrice!,
      avgRate: required.avgRate!,
      nonCompetitive: num("nonCompetitive"),
      coverage: num("coverage"),
      previousMarginalRate: num("previousMarginal"),
      source,
    };
    const problem = resultProblem(r);
    if (problem) out.refused.push(`${term} months, ${auction}: ${problem}`);
    else out.results.push(r);
  });
  return out;
}

/** The past-results list page: each Letras auction's entry id, term and date. */
export function parsePastList(html: string): { entryId: string; term: Term; auction: string }[] {
  const out: { entryId: string; term: Term; auction: string }[] = [];
  const re = /entryId=(\d+)[^"]*"[^>]*>\s*Subasta de Letras a (\d{1,2}) meses\s*<\/a>\s*<div class="subastas-historico__date">([^<]+)<\/div>/g;
  for (const m of html.matchAll(re)) {
    const term = Number(m[2]) as Term;
    const auction = esDate(m[3] ?? "");
    if (TERMS.includes(term) && auction) out.push({ entryId: m[1]!, term, auction });
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* Merging                                                                    */
/* -------------------------------------------------------------------------- */

const key = (r: Pick<AuctionResult, "term" | "auction">) => `${r.auction}|${r.term}`;

/** Union of results, one per auction and term (the later list wins), newest auction first. */
export function mergeResults(...lists: (readonly AuctionResult[] | null | undefined)[]): AuctionResult[] {
  const byKey = new Map<string, AuctionResult>();
  for (const list of lists) for (const r of list ?? []) byKey.set(key(r), r);
  return [...byKey.values()].sort((a, b) => (a.auction === b.auction ? a.term - b.term : a.auction < b.auction ? 1 : -1));
}

/** The newest result of each term (terms never auctioned are missing). */
export function latestByTerm(results: readonly AuctionResult[]): Partial<Record<Term, AuctionResult>> {
  const out: Partial<Record<Term, AuctionResult>> = {};
  for (const r of results) if (!out[r.term] || out[r.term]!.auction < r.auction) out[r.term] = r;
  return out;
}

/** The newest results of one term, newest first. */
export function termHistory(results: readonly AuctionResult[], term: Term, count: number): AuctionResult[] {
  return results
    .filter((r) => r.term === term)
    .sort((a, b) => (a.auction < b.auction ? 1 : -1))
    .slice(0, count);
}
