/**
 * Builds `src/lib/programmatic/zona-tensionada/declarations.json`: every
 * declared "zona de mercado residencial tensionado" (Ley 12/2023 art. 18), one
 * row per municipality and declaration, with its INE code, the BOE resolution
 * that lists it, the dates of validity, the large-landlord rule and the
 * Generalitat's October 2026 extension and new declaration (not yet in the BOE).
 *
 *   node --experimental-strip-types scripts/zonas-tensionadas-snapshot.ts build   writes the file
 *   node --experimental-strip-types scripts/zonas-tensionadas-snapshot.ts check   compares with the live sources; writes nothing
 *
 * Sources, all official:
 *  - The Ministry of Housing's quarterly lists in the BOE (Ley 12/2023 art.
 *    18.2.d), read as BOE XML (`RESOLUTIONS` below). They were found with the
 *    BOE title search "tensionado"; `check` runs that search again and stops
 *    when a list is missing here. BOE-A-2025-20246 (errata of BOE-A-2025-15728)
 *    only fixes two URLs and is not parsed.
 *  - The Ministry's own page of declared zones (MIVAU, "Consultar zonas de
 *    mercado residencial tensionado"): its "Desde el … hasta el …" must equal
 *    the dates computed here (the day after the BOE list, three years on).
 *  - DOGC: Resolució TER/3739/2026 (extension of 118 of the 140 towns of
 *    TER/800/2024) and TER/3740/2026 (53 new towns), DOGC 9775 of 19 Oct 2026,
 *    through the DOGC's own document API.
 *  - INE codes: scripts/data/ine-municipios-2026.tsv (INE, diccionario26.xlsx).
 *
 * The build stops on any name it cannot place in the INE register, on a count
 * that differs from the one the resolution states (140, 131, 118 + 22, 53), and
 * on a date that disagrees with the Ministry's page. Nothing is guessed.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const OUT = join(ROOT, "src/lib/programmatic/zona-tensionada/declarations.json");
const INE_FILE = join(ROOT, "scripts/data/ine-municipios-2026.tsv");
const UA = "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0 CatalunyaInfo/2.0 (+https://www.catalunyainfo.com)";

/** The Ministry's quarterly lists in the BOE, oldest first. */
const RESOLUTIONS = [
  { boe: "BOE-A-2024-5214", quarter: "2024-Q1" },
  { boe: "BOE-A-2024-20576", quarter: "2024-Q3" },
  { boe: "BOE-A-2025-1721", quarter: "2024-Q4" },
  { boe: "BOE-A-2025-8636", quarter: "2025-Q1" },
  { boe: "BOE-A-2025-15728", quarter: "2025-Q2" },
  { boe: "BOE-A-2025-21901", quarter: "2025-Q3" },
  { boe: "BOE-A-2026-2448", quarter: "2025-Q4" },
  { boe: "BOE-A-2026-9175", quarter: "2026-Q1" },
  { boe: "BOE-A-2026-16532", quarter: "2026-Q2" },
  { boe: "BOE-A-2026-23088", quarter: "2026-Q3" },
] as const;
/** In the BOE title search but not a list of zones (errata, rulings, subsidies, the index system). */
const NOT_LISTS = new Set(["BOE-A-2025-20246", "BOE-A-2026-22715", "BOE-A-2026-13753", "BOE-A-2024-12808", "BOE-A-2026-21951"]);

const MIVAU_ZONES = "https://www.mivau.gob.es/vivienda/alquila-bien-es-tu-derecho/serpavi/consultar-zonas-de-mercado-residencial-tensionado";
const DOGC_API = "https://portaldogc.gencat.cat/eadop-rest/api/dogc/documentDOGC";
const DOGC_DOC = (id: number) => `https://dogc.gencat.cat/ca/document-del-dogc/?documentId=${id}`;
const BOE_SEARCH =
  "https://www.boe.es/buscar/boe.php?campo%5B0%5D=ORIS&dato%5B0%5D%5B1%5D=1&dato%5B0%5D%5B2%5D=2&dato%5B0%5D%5B3%5D=3&dato%5B0%5D%5B4%5D=4&dato%5B0%5D%5B5%5D=5&dato%5B0%5D%5BT%5D=T&operador%5B0%5D=and&campo%5B1%5D=TITULOS&dato%5B1%5D=tensionado&operador%5B1%5D=and&campo%5B2%5D=DEM&dato%5B2%5D=&operador%5B2%5D=and&campo%5B3%5D=DOC&dato%5B3%5D=&operador%5B3%5D=and&campo%5B4%5D=NBOS&dato%5B4%5D=&operador%5B4%5D=and&campo%5B5%5D=NOF&dato%5B5%5D=&operador%5B5%5D=and&campo%5B6%5D=FPU&dato%5B6%5D%5B0%5D=&dato%5B6%5D%5B1%5D=&page_hits=200&sort_field%5B0%5D=FPU&sort_order%5B0%5D=desc&sort_field%5B1%5D=ORI&sort_order%5B1%5D=asc&sort_field%5B2%5D=REF&sort_order%5B2%5D=asc&accion=Buscar";

type CommunityId = "catalonia" | "basque-country" | "navarre" | "galicia" | "asturias";
const COMMUNITY: Record<string, CommunityId> = {
  "Cataluña": "catalonia",
  "País Vasco": "basque-country",
  Navarra: "navarre",
  Galicia: "galicia",
  "Principado de Asturias": "asturias",
};
const PROVINCES: Record<CommunityId, string[]> = {
  catalonia: ["08", "17", "25", "43"],
  "basque-country": ["01", "20", "48"],
  navarre: ["31"],
  galicia: ["15", "27", "32", "36"],
  asturias: ["33"],
};
/** How many towns each Catalan act names, in its own title or text. */
const CATALAN_COUNTS: Record<string, number> = { "TER/800/2024": 140, "TER/2408/2024": 131 };

/* ------------------------------------------------------------------ fetch */

async function get(url: string, init: RequestInit = {}): Promise<string> {
  const response = await fetch(url, { ...init, headers: { "user-agent": UA, accept: "text/html,application/xml,application/json", ...(init.headers ?? {}) }, signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}

const decode = (s: string) =>
  s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

/* -------------------------------------------------------------------- INE */

interface IneRow {
  code: string;
  name: string;
}
const ine: IneRow[] = readFileSync(INE_FILE, "utf8")
  .split("\n")
  .filter((l) => l && !l.startsWith("#"))
  .map((l) => {
    const [code, name] = l.split("\t");
    return { code: code!, name: name! };
  });

/** "Bisbal d'Empordà, La" → "la bisbal d'empordà"; apostrophes and case unified. */
function norm(name: string): string {
  let s = name.replace(/[’`´]/g, "'").trim();
  const m = s.match(/^(.*), (La|El|Els|Les|L'|A|O|As|Os)$/);
  if (m) s = m[2]!.endsWith("'") ? `${m[2]}${m[1]}` : `${m[2]} ${m[1]}`;
  return s.toLowerCase().replace(/\s+/g, " ");
}
/** INE "Bisbal d'Empordà, La" → "la Bisbal d'Empordà", as the DOGC writes names in its lists. */
function displayIne(name: string): string {
  const m = name.match(/^(.*), (La|El|Els|Les|L')$/);
  if (!m) return name;
  const article = m[2]!.toLowerCase();
  return article.endsWith("'") ? `${article}${m[1]}` : `${article} ${m[1]}`;
}
const bare = (s: string) => norm(s).normalize("NFD").replace(/\p{M}/gu, "");

function findIne(name: string, community: CommunityId): IneRow | null {
  const rows = ine.filter((r) => PROVINCES[community].includes(r.code.slice(0, 2)));
  const variants = (n: string) => [n, ...n.split("/")];
  for (const key of [norm, bare]) {
    const want = key(name);
    const hits = rows.filter((r) => variants(r.name).some((v) => key(v) === want) || key(r.name) === want);
    if (hits.length === 1) return hits[0]!;
    if (hits.length > 1) throw new Error(`${name}: several INE matches ${hits.map((h) => h.code).join(", ")}`);
  }
  return null;
}

/* -------------------------------------------------------- lists of towns */

/** Splits a list at commas outside parentheses; the last item may be "X i Y" or "i Y" (Catalan) and is split only where both halves are INE names. */
function splitTowns(cell: string, community: CommunityId): { name: string; area: string | null }[] {
  let text = cell.trim().replace(/\.$/, "");
  // BOE-A-2024-5214 prints "Manresa el Masnou" with no comma; TER/3739/2026 lists "Manresa, el Masnou".
  text = text.replace("Manresa el Masnou", "Manresa, el Masnou");
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of text) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else current += ch;
  }
  if (current.trim()) parts.push(current.trim());

  // Re-join names that carry a comma of their own ("Castell d'Aro, Platja d'Aro i S'Agaró").
  const joined: string[] = [];
  for (const p of parts) {
    const prev = joined.at(-1);
    if (prev && !findIneLoose(prev, community) && findIneLoose(`${prev}, ${p}`, community)) joined[joined.length - 1] = `${prev}, ${p}`;
    else if (prev && /^excepto /.test(p)) joined[joined.length - 1] = `${prev}, ${p}`;
    else joined.push(p);
  }

  const out: { name: string; area: string | null }[] = [];
  for (const raw of joined) {
    const p = raw.replace(/^i /, "");
    const paren = p.match(/^([^(]+?) \((.+)\)$/);
    const except = p.match(/^([^,]+), (excepto .+)$/);
    if (paren) out.push({ name: paren[1]!.trim(), area: paren[2]!.trim() });
    else if (except) out.push({ name: except[1]!.trim(), area: except[2]!.trim() });
    else if (findIneLoose(p, community)) out.push({ name: p, area: null });
    else {
      const words = p.split(" i ");
      let done = false;
      for (let k = 1; k < words.length && !done; k++) {
        const a = words.slice(0, k).join(" i ");
        const b = words.slice(k).join(" i ");
        if (findIneLoose(a, community) && findIneLoose(b, community)) {
          out.push({ name: a, area: null }, { name: b, area: null });
          done = true;
        }
      }
      if (!done) throw new Error(`cannot place "${p}" (${community}) in the INE register`);
    }
  }
  return out;
}

function findIneLoose(name: string, community: CommunityId): boolean {
  try {
    return findIne(name, community) !== null;
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------- the BOE */

interface Row {
  community: CommunityId;
  towns: string;
  granTenedor: string;
  neverRented: string;
  links: string;
}

function parseBoe(xml: string): { title: string; published: string; rows: Row[] } {
  const title = decode(xml.match(/<titulo>([\s\S]*?)<\/titulo>/)![1]!);
  const ymd = xml.match(/<fecha_publicacion>(\d{8})<\/fecha_publicacion>/)![1]!;
  const published = `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
  const body = xml.match(/<tbody>([\s\S]*?)<\/tbody>/)![1]!;
  const rows: Row[] = [];
  for (const tr of body.match(/<tr>[\s\S]*?<\/tr>/g) ?? []) {
    const cells = (tr.match(/<td[^>]*>[\s\S]*?<\/td>/g) ?? []).map((c) => decode(c));
    if (cells.length !== 6) throw new Error(`row with ${cells.length} cells: ${cells[0]}`);
    const community = COMMUNITY[cells[0]!.replace(/\.$/, "")];
    if (!community) throw new Error(`unknown community "${cells[0]}"`);
    if (!/^Tres años desde el día siguiente a la publicación de la presente resolución/.test(cells[2]!)) throw new Error(`validity not the 3-year rule: ${cells[2]}`);
    rows.push({ community, towns: cells[1]!, granTenedor: cells[3]!, neverRented: cells[4]!, links: cells[5]! });
  }
  return { title, published, rows };
}

const addDays = (iso: string, n: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
const addYears = (iso: string, n: number) => `${Number(iso.slice(0, 4)) + n}${iso.slice(4)}`;

type GranTenedorRule = "five-or-more" | "more-than-five" | "general";
function granRule(text: string): GranTenedorRule {
  if (/cinco o más/.test(text)) return "five-or-more";
  if (/más de cinco/.test(text)) return "more-than-five";
  if (/más de diez/.test(text)) return "general";
  throw new Error(`unknown large-landlord rule: ${text}`);
}

interface Act {
  act: string;
  bulletin: string | null;
  url: string | null;
}

/** "<act> (BOPV núm. 154, 14 de agosto de 2026) https://…" → act, bulletin, url (the first URL; any text after it is a second act). */
function parseAct(text: string): Act & { rest: string | null } {
  const urlMatch = text.match(/https?:\/\/\S+/);
  const head = (urlMatch ? text.slice(0, urlMatch.index) : text).trim().replace(/\.$/, "");
  const rest = urlMatch ? text.slice(urlMatch.index! + urlMatch[0].length).replace(/^[.\s]*(y\s+)?/, "").trim() : "";
  const b = head.match(/^(.*) \(((?:BOPV|BON|BOGC|BOPA)[^)]*)\)\.?$/);
  // The BOE writes "BOGC" for the DOGC (the Generalitat's rules page: "DOGC número 9122", "DOGC número 9196").
  return { act: (b ? b[1]! : head).replace(/,$/, "").trim(), bulletin: b ? b[2]!.replace(/^BOGC /, "DOGC ") : null, url: urlMatch ? urlMatch[0].replace(/\.$/, "") : null, rest: rest || null };
}

/** The links cell: "– Declaración: <act> … – Memoria: https://…". The BOE printed some URLs with a space before a %-escape (errata BOE-A-2025-20246): joined here. */
function parseLinks(raw: string): Act & { also: Act | null; memoria: string | null } {
  const text = raw.replace(/ (?=%[0-9A-F]{2})/g, "");
  const decl = text.match(/Declaración:\s*(.+?)(?=– Memoria|$)/)![1]!.trim();
  const first = parseAct(decl);
  const second = first.rest && /^Resoluci|^Orden/.test(first.rest) ? parseAct(first.rest) : null;
  const memoria = text.match(/Memoria[:.]?\s*(https?:\/\/\S+)/)?.[1]?.replace(/\.$/, "") ?? null;
  return { act: first.act, bulletin: first.bulletin, url: first.url, also: second ? { act: second.act, bulletin: second.bulletin, url: second.url } : null, memoria };
}

/**
 * Where the BOE list prints no link, the declaration's own page in the
 * Generalitat's rules list (habitatge.gencat.cat …/limit-preu-lloguer/normativa/),
 * checked through the DOGC API: documentId 980806 = TER/800/2024, DOGC 9122.
 */
const LINK_FALLBACK: Record<string, { url: string; memoria: string }> = {
  "TER/800/2024": {
    url: "https://dogc.gencat.cat/ca/document-del-dogc/?documentId=980806",
    memoria: "https://habitatge.gencat.cat/web/.content/home/normativa/Zones-mercat-tensionat/20240313-Memoria-ZMRT-CAT.pdf",
  },
};

/* --------------------------------------------------------- the Ministry */

const MONTHS: Record<string, string> = { enero: "01", febrero: "02", marzo: "03", abril: "04", mayo: "05", junio: "06", julio: "07", agosto: "08", septiembre: "09", octubre: "10", noviembre: "11", diciembre: "12" };
const isoOf = (d: string, m: string, y: string) => `${y}-${MONTHS[m]}-${d.padStart(2, "0")}`;

/** Resolution date ("2024-03-14") → the periods the Ministry's page prints for its zones. */
function parseMivau(html: string): Map<string, Set<string>> {
  const text = decode(html);
  const out = new Map<string, Set<string>>();
  const sections = text.split(/Zonas de mercado residencial tensionado según Resolución de /).slice(1);
  for (const s of sections) {
    const head = s.match(/^(\d{1,2}) de (\w+) de (\d{4})/)!;
    const key = isoOf(head[1]!, head[2]!, head[3]!);
    const set = out.get(key) ?? new Set<string>();
    for (const m of s.matchAll(/Desde el (\d{1,2}) de (\w+) de (\d{4}) hasta el (\d{1,2}) de (\w+) de (\d{4})/g)) set.add(`${isoOf(m[1]!, m[2]!, m[3]!)}/${isoOf(m[4]!, m[5]!, m[6]!)}`);
    out.set(key, set);
  }
  return out;
}

/* --------------------------------------------------------------- the DOGC */

async function dogc(documentId: number): Promise<{ number: string; date: string; dogc: string; published: string; title: string; text: string }> {
  const body = await get(DOGC_API, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: `documentId=${documentId}&language=ca` });
  const d = JSON.parse(body) as { documentData: { numDocument: string; dateDocument: string; numDOGC: string; dateDOGC: string }; titleDocument: string; textDocument: string };
  const dmy = (s: string) => s.split("/").reverse().join("-");
  const text = d.textDocument.replace(/<\/p>|<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, "").replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ");
  return { number: d.documentData.numDocument, date: dmy(d.documentData.dateDocument), dogc: d.documentData.numDOGC, published: dmy(d.documentData.dateDOGC), title: d.titleDocument.replace(/\s+/g, " ").trim(), text };
}

/** The operative part ("Resolc:"), so items are never taken from the "Fets". */
function resolc(text: string): string {
  const at = text.indexOf("Resolc:");
  if (at < 0) throw new Error("DOGC: no operative part");
  return text.slice(at);
}

/** The list right after "<n>. <verb> … continuació:" in a DOGC resolution. */
function dogcList(text: string, item: number): string {
  const m = resolc(text).match(new RegExp(`\\n\\s*${item}\\. [^\\n]*continuació:\\s*\\n([^\\n]+)`));
  if (!m) throw new Error(`DOGC: no list at item ${item}`);
  return m[1]!.trim();
}

/* ------------------------------------------------------------------ build */

export interface Declaration {
  id: string;
  community: CommunityId;
  act: string;
  bulletin: string | null;
  url: string | null;
  also: Act | null;
  memoria: string | null;
  boe: string | null;
  from: string | null;
  until: string | null;
  granTenedor: { rule: GranTenedorRule; quote: string };
  neverRented: { applies: boolean; quote: string };
}

async function build() {
  const today = new Date().toISOString().slice(0, 10);
  const mivau = parseMivau(await get(MIVAU_ZONES));
  const resolutions: { boe: string; quarter: string; title: string; published: string; from: string; until: string; url: string }[] = [];
  const declarations: Declaration[] = [];
  const entries: { ine: string; name: string; community: CommunityId; area: string | null; declaration: string; extension: "extended" | "not-extended" | null }[] = [];

  for (const r of RESOLUTIONS) {
    const parsed = parseBoe(await get(`https://www.boe.es/diario_boe/xml.php?id=${r.boe}`));
    const from = addDays(parsed.published, 1);
    const until = addYears(from, 3);
    const date = parsed.title.match(/^Resolución de (\d{1,2}) de (\w+) de (\d{4})/)!;
    const periods = mivau.get(isoOf(date[1]!, date[2]!, date[3]!));
    if (!periods || periods.size !== 1 || !periods.has(`${from}/${until}`)) throw new Error(`${r.boe}: computed ${from}/${until}, Ministry page says ${[...(periods ?? [])].join(", ") || "nothing"}`);
    resolutions.push({ boe: r.boe, quarter: r.quarter, title: parsed.title, published: parsed.published, from, until, url: `https://www.boe.es/diario_boe/txt.php?id=${r.boe}` });

    parsed.rows.forEach((row, i) => {
      const links = parseLinks(row.links);
      const fallback = Object.entries(LINK_FALLBACK).find(([act]) => links.act.includes(act))?.[1];
      const id = `${r.boe}#${i + 1}`;
      declarations.push({
        id,
        community: row.community,
        act: links.act,
        bulletin: links.bulletin,
        url: links.url ?? fallback?.url ?? null,
        also: links.also,
        memoria: links.memoria ?? fallback?.memoria ?? null,
        boe: r.boe,
        from,
        until,
        granTenedor: { rule: granRule(row.granTenedor), quote: row.granTenedor },
        neverRented: { applies: /^Sí[,.\s]/.test(row.neverRented), quote: row.neverRented },
      });
      const towns = splitTowns(row.towns, row.community);
      const catalan = Object.entries(CATALAN_COUNTS).find(([act]) => links.act.includes(act));
      if (catalan && towns.length !== catalan[1]) throw new Error(`${catalan[0]}: ${towns.length} towns, the act names ${catalan[1]}`);
      for (const t of towns) {
        const hit = findIne(t.name, row.community)!;
        entries.push({ ine: hit.code, name: t.name, community: row.community, area: t.area, declaration: id, extension: null });
      }
    });
  }

  // Generalitat, October 2026: the extension (TER/3739/2026) and the 53 new towns (TER/3740/2026), not yet in a BOE list.
  const ext = await dogc(1057089);
  const add = await dogc(1057087);
  if (ext.number !== "TER/3739/2026" || add.number !== "TER/3740/2026") throw new Error(`DOGC ids moved: ${ext.number}, ${add.number}`);
  const first = declarations.find((d) => d.act.includes("TER/800/2024"))!;
  const firstEntries = entries.filter((e) => e.declaration === first.id);
  const extended = splitTowns(dogcList(ext.text, 1), "catalonia").map((t) => findIne(t.name, "catalonia")!.code);
  const dropped = splitTowns(dogcList(ext.text, 2), "catalonia").map((t) => findIne(t.name, "catalonia")!.code);
  if (extended.length !== 118 || dropped.length !== 22) throw new Error(`TER/3739/2026: ${extended.length} extended, ${dropped.length} not (the act says 118 of 140)`);
  for (const e of firstEntries) {
    if (extended.includes(e.ine)) e.extension = "extended";
    else if (dropped.includes(e.ine)) e.extension = "not-extended";
    else throw new Error(`TER/3739/2026 says nothing of ${e.name}`);
  }
  if (extended.length + dropped.length !== firstEntries.length) throw new Error("TER/3739/2026: towns outside TER/800/2024");

  const pendingTowns = splitTowns(dogcList(add.text, 1), "catalonia");
  if (pendingTowns.length !== 53) throw new Error(`TER/3740/2026: ${pendingTowns.length} towns, the title says 53`);
  const pendingGran = resolc(add.text).match(/\n\s*2\. ([^\n]+)/)![1]!.trim();
  const pendingNever = resolc(add.text).match(/\n\s*3\. ([^\n]+)/)![1]!.trim();
  const pendingId = "TER/3740/2026";
  declarations.push({
    id: pendingId,
    community: "catalonia",
    act: add.title.replace(/^Resolució (TER\/3740\/2026, de 16 d'octubre),?\s*/, "Resolució $1, "),
    bulletin: `DOGC núm. ${add.dogc}`,
    url: DOGC_DOC(1057087),
    also: null,
    memoria: null,
    boe: null,
    from: null,
    until: null,
    granTenedor: { rule: /cinc o més/.test(pendingGran) ? "five-or-more" : "general", quote: pendingGran },
    neverRented: { applies: /^Aplicar/.test(pendingNever), quote: pendingNever },
  });
  for (const t of pendingTowns) {
    const hit = findIne(t.name, "catalonia")!;
    if (entries.some((e) => e.ine === hit.code)) throw new Error(`TER/3740/2026: ${t.name} is already declared`);
    entries.push({ ine: hit.code, name: t.name, community: "catalonia", area: null, declaration: pendingId, extension: null });
  }

  const file = {
    _about:
      "Built by scripts/zonas-tensionadas-snapshot.ts from the Ministry of Housing's quarterly lists in the BOE (Ley 12/2023 art. 18.2.d), checked against the Ministry's page of declared zones, plus the Generalitat's DOGC resolutions TER/3739/2026 and TER/3740/2026 (19 Oct 2026, not yet in a BOE list). INE codes: INE municipal register at 1 Jan 2026. Do not edit by hand: rebuild.",
    boeIds: resolutions.map((r) => r.boe),
    boeErrata: ["BOE-A-2025-20246"],
    dogc: [
      { act: "TER/3739/2026", dogc: ext.dogc, published: ext.published, url: DOGC_DOC(1057089) },
      { act: "TER/3740/2026", dogc: add.dogc, published: add.published, url: DOGC_DOC(1057087) },
    ],
    builtOn: today,
    resolutions,
    extension: {
      act: ext.title,
      number: ext.number,
      date: ext.date,
      bulletin: `DOGC núm. ${ext.dogc}`,
      published: ext.published,
      url: DOGC_DOC(1057089),
      of: first.id,
      extended: extended.length,
      notExtended: dropped.length,
    },
    pending: { declaration: pendingId, date: add.date, bulletin: `DOGC núm. ${add.dogc}`, published: add.published, url: DOGC_DOC(1057087) },
    declarations,
    entries,
    // Every municipality of Catalonia (INE, 1 Jan 2026), so the checker can answer "no" for one that is in no zone.
    register: {
      source: "INE, Relación de municipios y sus códigos a 1 de enero de 2026 (diccionario26.xlsx)",
      catalonia: ine
        .filter((r) => PROVINCES.catalonia.includes(r.code.slice(0, 2)))
        .map((r) => [r.code, displayIne(r.name)] as [string, string])
        .sort((a, b) => a[0].localeCompare(b[0])),
    },
  };
  return file;
}

async function checkSearch() {
  const html = await get(BOE_SEARCH);
  const ids = [...new Set([...html.matchAll(/BOE-A-\d{4}-\d+/g)].map((m) => m[0]))];
  const known = new Set<string>([...RESOLUTIONS.map((r) => r.boe), ...NOT_LISTS]);
  const unknown = ids.filter((id) => !known.has(id));
  if (unknown.length) throw new Error(`BOE title search "tensionado" has new documents: ${unknown.join(", ")}. Read them; add the quarterly lists to RESOLUTIONS.`);
  console.log(`BOE search: ${ids.length} documents, all known.`);
}

async function main() {
  const mode = process.argv[2] ?? "check";
  await checkSearch();
  const built = await build();
  const summary = (f: { entries: { community: string; declaration: string }[] }) =>
    Object.entries(f.entries.reduce<Record<string, number>>((acc, e) => ((acc[e.community] = (acc[e.community] ?? 0) + 1), acc), {}))
      .map(([c, n]) => `${c} ${n}`)
      .join(", ");
  if (mode === "build") {
    writeFileSync(OUT, `${JSON.stringify(built, null, 2)}\n`);
    console.log(`wrote ${OUT}: ${built.entries.length} rows (${summary(built)})`);
    return;
  }
  const own = JSON.parse(readFileSync(OUT, "utf8")) as typeof built;
  const strip = (f: typeof built) => JSON.stringify({ ...f, builtOn: "" });
  console.log(strip(own) === strip(built) ? `up to date: ${summary(own)}` : `CHANGED: live sources give ${summary(built)}, file has ${summary(own)} <- rebuild`);
}

await main();
