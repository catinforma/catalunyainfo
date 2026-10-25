import { addDays, todayInCatalonia } from "@/lib/content/holidays/calendar";

/**
 * Who is standing in Catalonia at the 29 November 2026 general election, read
 * from the BOE at render time.
 *
 * ## Why the BOE, and not the provincial gazettes
 *
 * For Congress and Senate elections the law sends both stages of the lists to
 * the state gazette: "Las candidaturas presentadas y las candidaturas
 * proclamadas de todos los distritos se publican en el «Boletín Oficial del
 * Estado»" (LOREG art. 169.4). The provincial gazettes carry the lists only in
 * municipal elections (art. 187.4). Each stage is one BOE item for the whole
 * of Spain, Section III, issuing body "Juntas Electorales Provinciales", with
 * one block per province headed "JUNTA ELECTORAL DE <PROVINCIA>". In 2023:
 * presented candidacies BOE-A-2023-14733 (21 Jun), proclaimed BOE-A-2023-15066
 * (27 Jun), corrections BOE-A-2023-15548 (4 Jul) and BOE-A-2023-15828 (7 Jul).
 * For 29N the calendar sets 28 Oct (presented) and 3 Nov (proclaimed).
 *
 * ## How it is found
 *
 * Nothing is typed in when the lists appear. Every day from `scanFrom` to
 * today (Sundays skipped: there is no ordinary BOE on Sundays) the BOE's
 * open-data summary API is asked for that day's index
 * (`/datosabiertos/api/boe/sumario/AAAAMMDD`), and items from the electoral
 * boards whose title speaks of candidacies for Congress/Senate under this
 * election's decree are kept. The item's XML then gives the lists. Corrections
 * are found the same way, and also through the item's own "posteriores"
 * references, so a correction published after the scan window still shows.
 *
 * ## What it refuses to do
 *
 * - **Show another election's lists.** A title naming a different decree is
 *   dropped, and the scan never looks before `scanFrom`; before that day
 *   nothing is fetched at all.
 * - **Rewrite the lists.** Names, candidacy names and the Junta's numbering
 *   are printed exactly as published (LOREG 46.9: "este orden se guardará en
 *   todas las publicaciones"). Corrections are linked, never applied by us.
 * - **Turn external text into markup.** Everything parsed here is plain text;
 *   the component prints it as React text nodes only.
 * - **Fall back to a remembered list.** If the BOE cannot be read, the block
 *   says so and links to boe.es.
 *
 * ## Caching
 *
 * The page is regenerated at most once a day (route `revalidate = 86400`) and
 * by the nightly cron (`DAY_DEPENDENT_BLOCKS`). No fetch here has a shorter
 * revalidate than the page, because the lowest one would become the page's
 * ISR period. A day's summary that does not exist yet answers 404, which Next
 * never stores, so "today" is asked again on every rebuild; once published, a
 * day's summary does not change, so past days are kept for 30 days.
 */

/* -------------------------------------------------------------------------- */
/* The election                                                               */
/* -------------------------------------------------------------------------- */

export type ProvinceKey = "barcelona" | "girona" | "lleida" | "tarragona";
export const PROVINCES: ProvinceKey[] = ["barcelona", "girona", "lleida", "tarragona"];

export const PROVINCE_NAMES: Record<ProvinceKey, string> = {
  barcelona: "Barcelona",
  girona: "Girona",
  lleida: "Lleida",
  tarragona: "Tarragona",
};

/** Deputies: RD 806/2026, annex. Senators: RD 806/2026 art. 3.2, four per province. */
export const SEATS: Record<ProvinceKey, { deputies: number; senators: number }> = {
  barcelona: { deputies: 32, senators: 4 },
  girona: { deputies: 6, senators: 4 },
  lleida: { deputies: 4, senators: 4 },
  tarragona: { deputies: 6, senators: 4 },
};

/** A voter may mark up to three Senate candidates in a province (LOREG 166.1.a). */
export const SENATE_MARKS = 3;

/**
 * Electors, INE Oficina del Censo Electoral, consultation census ("censo de
 * consulta", census closed 1 Aug 2026), press note of 9 Oct 2026 and table
 * Elecgral_2026_cc_tab2.xlsx. Not the final figure: the INE publishes that later.
 */
export const ELECTORS: Record<ProvinceKey, { total: number; resident: number; abroad: number }> = {
  barcelona: { total: 4_398_757, resident: 4_133_070, abroad: 265_687 },
  girona: { total: 575_269, resident: 545_107, abroad: 30_162 },
  lleida: { total: 326_300, resident: 304_391, abroad: 21_909 },
  tarragona: { total: 626_161, resident: 599_563, abroad: 26_598 },
};

export interface ElectionConfig {
  /** "806/2026": the convening Real Decreto, as BOE titles cite it. */
  decree: string;
  /** Legal calendar (LOREG 47, JEC calendar). ISO dates. */
  presentedDay: string;
  proclamationDay: string;
  proclaimedDay: string;
  appealsFrom: string;
  appealsTo: string;
  appealsResolvedBy: string;
  campaignFrom: string;
  campaignTo: string;
  reflectionDay: string;
  electionDay: string;
  /** First and last day whose BOE summary is read. */
  scanFrom: string;
  scanTo: string;
}

export const ELECTION_29N: ElectionConfig = {
  decree: "806/2026",
  presentedDay: "2026-10-28",
  proclamationDay: "2026-11-02",
  proclaimedDay: "2026-11-03",
  appealsFrom: "2026-11-04",
  appealsTo: "2026-11-05",
  appealsResolvedBy: "2026-11-12",
  campaignFrom: "2026-11-13",
  campaignTo: "2026-11-27",
  reflectionDay: "2026-11-28",
  electionDay: "2026-11-29",
  scanFrom: "2026-10-28",
  // Corrections came 7 and 10 days after the proclamation in 2023; later
  // ones are still found through the item's own references.
  scanTo: "2026-11-28",
};

export const BOE_SOURCE = {
  name: "Boletín Oficial del Estado (BOE)",
  publisher: "Agencia Estatal Boletín Oficial del Estado",
  home: "https://www.boe.es/",
  api: "https://www.boe.es/datosabiertos/",
};

const REVALIDATE_TODAY = 86_400;
const REVALIDATE_PAST = 2_592_000;
/** Per request, and for the whole render: a slow BOE must not hang the page. */
const TIMEOUT_MS = 8_000;
const BUDGET_MS = 25_000;
const CONCURRENCY = 8;
/** The 2023 item was 1.2 MB; anything far larger is not what we asked for. */
const MAX_BYTES = 12_000_000;

/* -------------------------------------------------------------------------- */
/* Dates and links                                                            */
/* -------------------------------------------------------------------------- */

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const BOE_ID = /^BOE-A-\d{4}-\d{1,7}$/;

export function compact(iso: string): string {
  return iso.replaceAll("-", "");
}

export function fromCompact(day: string): string | null {
  const match = /^(\d{4})(\d{2})(\d{2})$/.exec(day.trim());
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

function isSunday(iso: string): boolean {
  return new Date(`${iso}T12:00:00Z`).getUTCDay() === 0;
}

/** Days whose summary is read: `scanFrom`…min(today, `scanTo`), no Sundays. */
export function scanDays(config: ElectionConfig, today: string): string[] {
  const last = today < config.scanTo ? today : config.scanTo;
  const days: string[] = [];
  for (let day = config.scanFrom; day <= last; day = addDays(day, 1)) {
    if (!isSunday(day)) days.push(day);
  }
  return days;
}

export function sumarioUrl(iso: string): string {
  return `https://www.boe.es/datosabiertos/api/boe/sumario/${compact(iso)}`;
}

export function boeDayUrl(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `https://www.boe.es/boe/dias/${y}/${m}/${d}/`;
}

/**
 * Links built from a validated id and date, never copied from the response:
 * an item from the summary can only ever link to boe.es.
 */
export function boeLinks(id: string, date: string): { html: string; xml: string; pdf: string | null } {
  if (!BOE_ID.test(id)) throw new Error(`not a BOE id: ${id}`);
  const [y, m, d] = date.split("-");
  return {
    html: `https://www.boe.es/diario_boe/txt.php?id=${id}`,
    xml: `https://www.boe.es/diario_boe/xml.php?id=${id}`,
    pdf: ISO_DAY.test(date) ? `https://www.boe.es/boe/dias/${y}/${m}/${d}/pdfs/${id}.pdf` : null,
  };
}

export function isBoeId(id: string): boolean {
  return BOE_ID.test(id);
}

/* -------------------------------------------------------------------------- */
/* Text                                                                       */
/* -------------------------------------------------------------------------- */

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, body: string) => {
    if (body[0] === "#") {
      const code = body[1] === "x" || body[1] === "X" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return whole;
      // Control characters have no business in a name.
      if (code < 32 && code !== 9 && code !== 10 && code !== 13) return "";
      return String.fromCodePoint(code);
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? whole;
  });
}

/**
 * Markup → plain text. Tags are removed *before* entities are decoded, so the
 * BOE's own `<span>`s disappear while anything the text spells out with
 * entities (`&lt;b&gt;`) survives as the literal characters it is.
 */
export function plainText(fragment: string): string {
  return decodeEntities(fragment.replace(/<[^>]*>/g, " "))
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** "Meritxell Batet Lamaña." → "Meritxell Batet Lamaña". */
function cleanName(text: string): string {
  return text.replace(/\s*\.\s*$/, "").trim();
}

function fold(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
}

const PROVINCE_ALIASES: Record<string, ProvinceKey> = {
  BARCELONA: "barcelona",
  GIRONA: "girona",
  GERONA: "girona",
  LLEIDA: "lleida",
  LERIDA: "lleida",
  TARRAGONA: "tarragona",
};

/** "JUNTA ELECTORAL DE BARCELONA" → "barcelona"; any other Junta → null. */
export function provinceOf(junta: string): ProvinceKey | null {
  const match = /^JUNTA\s+ELECTORAL\s+(?:PROVINCIAL\s+)?DE\s+(.+?)\s*\.?$/.exec(fold(junta.trim()));
  if (!match) return null;
  return PROVINCE_ALIASES[match[1]!.replace(/\s+/g, " ")] ?? null;
}

/* -------------------------------------------------------------------------- */
/* Parsing an item                                                            */
/* -------------------------------------------------------------------------- */

export interface Candidate {
  /** The Junta's number for this candidate, as published. */
  number: number | null;
  name: string;
  /** Senate only: "Suplente 1", "Suplente 2", in order. */
  substitutes: string[];
}

export type CandidacyStatus = "listed" | "notProclaimed" | "withdrawn" | "note";

export interface Candidacy {
  /** The Junta's number (order of presentation, LOREG 46.9). */
  number: number | null;
  name: string;
  status: CandidacyStatus;
  /** The Junta's own words when the candidacy carries no list. */
  note: string | null;
  candidates: Candidate[];
  /** Congress only: the list's substitutes ("Suplentes:"). */
  substitutes: Candidate[];
}

export interface JuntaLists {
  /** As written: "JUNTA ELECTORAL DE BARCELONA". */
  junta: string;
  province: ProvinceKey | null;
  congress: Candidacy[];
  senate: Candidacy[];
}

interface Paragraph {
  cls: string;
  text: string;
}

/** The `<p>` elements of the item's `<texto>`, as class + plain text. */
export function paragraphs(xml: string): Paragraph[] {
  // The analysis block before the text has `<texto>` elements of its own
  // ("en BOE núm. 161 de 7 de julio"), so look after it.
  const after = Math.max(0, xml.indexOf("</analisis>"));
  const found = xml.slice(after).search(/<texto[\s>]/);
  const start = found < 0 ? -1 : after + found;
  const end = xml.lastIndexOf("</texto>");
  if (start < 0 || end < start) return [];
  const body = xml.slice(start, end);
  const out: Paragraph[] = [];
  const pattern = /<p\b([^>]*?)(?:\/>|>([\s\S]*?)<\/p>)/g;
  for (const match of body.matchAll(pattern)) {
    const cls = /\bclass\s*=\s*"([^"]*)"/.exec(match[1] ?? "")?.[1] ?? "";
    const text = plainText(match[2] ?? "");
    if (text) out.push({ cls, text });
  }
  return out;
}

const NUMBERED = /^(\d{1,3})\s*\.\s*(.+)$/;
const SUBSTITUTE = /^Suplente\s*(\d)\s*[:.]\s*(.+)$/i;
const SUBSTITUTES_HEADING = /^Suplentes\s*:?$/i;

function chamberOf(text: string): "congress" | "senate" | null {
  const folded = fold(text);
  if (/CONGRESO/.test(folded)) return "congress";
  if (/SENADO/.test(folded)) return "senate";
  return null;
}

function statusOf(text: string): CandidacyStatus {
  const folded = fold(text);
  if (/NO\s+PROCLAMAD/.test(folded)) return "notProclaimed";
  if (/RETIRAD/.test(folded)) return "withdrawn";
  return "note";
}

/**
 * Every Junta's lists, in document order.
 *
 * The structure, verified on the 2023 items: `centro_negrita` opens a Junta,
 * `centro_cursiva` a chamber, `centro_redonda` a candidacy ("1. NAME"), then
 * one paragraph per candidate ("1. Name."). Congress substitutes follow a
 * "Suplentes:" line; each Senate candidate is followed by "Suplente 1: …" and
 * "Suplente 2: …". A candidacy with no list carries a one-line note instead
 * ("No proclamada.", "La candidatura ha sido retirada.", "Sin candidatos.").
 * Spacing varies between Juntas ("1.María", "Suplente 2.Teresa"), so the
 * patterns allow it; the BOE's paragraph classes for indentation do not, so
 * they are not relied on.
 */
export function parseJuntas(xml: string): JuntaLists[] {
  const juntas: JuntaLists[] = [];
  let junta: JuntaLists | null = null;
  let chamber: "congress" | "senate" | null = null;
  let candidacy: Candidacy | null = null;
  let inSubstitutes = false;
  let lastCandidate: Candidate | null = null;

  for (const { cls, text } of paragraphs(xml)) {
    if (cls === "centro_negrita") {
      if (/^JUNTA\s+ELECTORAL/i.test(text)) {
        junta = { junta: text, province: provinceOf(text), congress: [], senate: [] };
        juntas.push(junta);
        chamber = null;
        candidacy = null;
      }
      // "Circunscripción electoral: Mallorca" (island districts) keeps the Junta.
      continue;
    }
    if (!junta) continue;

    if (cls === "centro_cursiva") {
      chamber = chamberOf(text);
      candidacy = null;
      continue;
    }
    if (!chamber) continue;

    if (cls === "centro_redonda") {
      const header = text.replace(/^[«"]?\s*Candidatura\s+n[úu]m\.?\s*:?\s*/i, "");
      const numbered = NUMBERED.exec(header);
      candidacy = {
        number: numbered ? Number(numbered[1]) : null,
        name: (numbered ? numbered[2]! : header).trim(),
        status: "listed",
        note: null,
        candidates: [],
        substitutes: [],
      };
      junta[chamber].push(candidacy);
      inSubstitutes = false;
      lastCandidate = null;
      continue;
    }
    if (!candidacy) continue;

    if (SUBSTITUTES_HEADING.test(text)) {
      inSubstitutes = true;
      continue;
    }
    const substitute = SUBSTITUTE.exec(text);
    if (substitute) {
      if (lastCandidate) lastCandidate.substitutes.push(cleanName(substitute[2]!));
      continue;
    }
    const numbered = NUMBERED.exec(text);
    if (numbered) {
      const candidate: Candidate = { number: Number(numbered[1]), name: cleanName(numbered[2]!), substitutes: [] };
      (inSubstitutes ? candidacy.substitutes : candidacy.candidates).push(candidate);
      lastCandidate = candidate;
      continue;
    }
    if (candidacy.candidates.length === 0 && candidacy.substitutes.length === 0 && text.length <= 300) {
      candidacy.status = statusOf(text);
      candidacy.note = text;
    }
  }

  // A candidacy with a status line and a list is still a list.
  for (const item of juntas) {
    for (const list of [...item.congress, ...item.senate]) {
      if (list.candidates.length > 0) {
        list.status = "listed";
        list.note = null;
      }
    }
  }
  return juntas;
}

export interface ProvinceLists {
  province: ProvinceKey;
  junta: string;
  congress: Candidacy[];
  senate: Candidacy[];
}

/** The four Catalan provinces found in an item, in fixed order. */
export function catalanLists(xml: string): ProvinceLists[] {
  const found = new Map<ProvinceKey, ProvinceLists>();
  for (const junta of parseJuntas(xml)) {
    if (!junta.province || found.has(junta.province)) continue;
    if (junta.congress.length === 0 && junta.senate.length === 0) continue;
    found.set(junta.province, {
      province: junta.province,
      junta: junta.junta,
      congress: junta.congress,
      senate: junta.senate,
    });
  }
  return PROVINCES.flatMap((key) => (found.has(key) ? [found.get(key)!] : []));
}

/** Junta headings an item mentions: which provinces a correction touches. */
export function juntasIn(xml: string): string[] {
  const seen: string[] = [];
  for (const { cls, text } of paragraphs(xml)) {
    if (cls === "centro_negrita" && /^JUNTA\s+ELECTORAL/i.test(text) && !seen.includes(text)) seen.push(text);
  }
  return seen;
}

export interface ItemMeta {
  id: string;
  title: string;
  date: string;
  issue: string | null;
  /** Ids the BOE lists as "CORRECCIÓN de errores" of this item. */
  corrections: string[];
}

function tag(xml: string, name: string): string | null {
  const match = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`).exec(xml);
  return match ? plainText(match[1] ?? "") : null;
}

export function itemMeta(xml: string): ItemMeta | null {
  const metadata = /<metadatos>([\s\S]*?)<\/metadatos>/.exec(xml)?.[1];
  if (!metadata) return null;
  const id = tag(metadata, "identificador") ?? "";
  const date = fromCompact(tag(metadata, "fecha_publicacion") ?? "");
  if (!BOE_ID.test(id) || !date) return null;
  const corrections: string[] = [];
  for (const match of xml.matchAll(/<posterior\b[^>]*\breferencia="(BOE-A-\d{4}-\d{1,7})"[^>]*>([\s\S]*?)<\/posterior>/g)) {
    if (/CORRECCI/i.test(fold(match[2] ?? "")) && !corrections.includes(match[1]!)) corrections.push(match[1]!);
  }
  return {
    id,
    title: tag(metadata, "titulo") ?? "",
    date,
    issue: tag(metadata, "diario_numero") || null,
    corrections,
  };
}

/* -------------------------------------------------------------------------- */
/* Finding the items                                                          */
/* -------------------------------------------------------------------------- */

export interface BoeItem {
  id: string;
  title: string;
  date: string;
  /** BOE issue number ("152"). */
  issue: string | null;
  department: string;
  section: string;
}

type Json = unknown;

function asList(value: Json): Json[] {
  return Array.isArray(value) ? value : value === undefined || value === null ? [] : [value];
}

/**
 * Every item in a day's summary with the issue, section and issuing body it
 * sits under. The JSON nests departments and items in several shapes
 * (`departamento.item`, `departamento.epigrafe[].item[]`,
 * `departamento.texto.epigrafe.item`), so the walk is generic.
 */
export function sumarioItems(json: Json, date: string): BoeItem[] {
  const items: BoeItem[] = [];
  const walk = (node: Json, issue: string | null, section: string, department: string): void => {
    if (Array.isArray(node)) {
      for (const child of node) walk(child, issue, section, department);
      return;
    }
    if (!node || typeof node !== "object") return;
    for (const [key, value] of Object.entries(node as Record<string, Json>)) {
      if (key === "diario") {
        for (const diario of asList(value)) {
          const numero = (diario as { numero?: unknown })?.numero;
          walk(diario, typeof numero === "string" ? numero : issue, section, department);
        }
      } else if (key === "seccion") {
        for (const s of asList(value)) {
          const codigo = (s as { codigo?: unknown })?.codigo;
          walk(s, issue, typeof codigo === "string" ? codigo : section, department);
        }
      } else if (key === "departamento") {
        for (const d of asList(value)) {
          const nombre = (d as { nombre?: unknown })?.nombre;
          walk(d, issue, section, typeof nombre === "string" ? nombre : department);
        }
      } else if (key === "item") {
        for (const raw of asList(value)) {
          const item = raw as { identificador?: unknown; titulo?: unknown };
          if (typeof item?.identificador === "string" && typeof item.titulo === "string" && BOE_ID.test(item.identificador)) {
            items.push({ id: item.identificador, title: plainText(item.titulo), date, issue, section, department });
          }
        }
      } else if (value && typeof value === "object") {
        walk(value, issue, section, department);
      }
    }
  };
  walk(json, null, "", "");
  return items;
}

export type NoticeKind = "presented" | "proclaimed" | "correction";
export type Stage = "presented" | "proclaimed";

export interface BoeNotice extends BoeItem {
  kind: NoticeKind;
  /** For a correction: which stage it corrects, when the title says. */
  corrects: Stage | null;
}

/**
 * An item is a candidacy notice for this election when the electoral boards
 * issue it, its title is about candidacies for Congress or Senate, and any
 * decree it cites is this election's.
 */
export function classify(item: BoeItem, config: ElectionConfig): BoeNotice | null {
  const department = fold(item.department);
  if (!/JUNTAS?\s+ELECTORAL(ES)?\s+PROVINCIAL(ES)?/.test(department)) return null;
  const title = fold(item.title);
  if (!/CANDIDATURAS/.test(title) || !/(CONGRESO|SENADO)/.test(title)) return null;
  const decrees = [...title.matchAll(/REAL\s+DECRETO\s+(\d+\/\d{4})/g)].map((match) => match[1]);
  if (decrees.length > 0 && !decrees.includes(config.decree)) return null;
  if (decrees.length === 0 && (item.date < config.scanFrom || item.date > config.electionDay)) return null;

  const stage: Stage | null = /PROCLAMAD/.test(title) ? "proclaimed" : /PRESENTAD/.test(title) ? "presented" : null;
  if (/CORRECCION\s+DE\s+ERRORES|CORRECCION\s+DE\s+ERRATAS/.test(title)) {
    return { ...item, kind: "correction", corrects: stage };
  }
  if (!stage) return null;
  return { ...item, kind: stage, corrects: null };
}

/* -------------------------------------------------------------------------- */
/* Fetching                                                                   */
/* -------------------------------------------------------------------------- */

type Answer<T> = { ok: true; value: T } | { ok: false; missing: boolean; error: string };

/** Wall-clock limit shared by every request of one render. */
export interface Deadline {
  at: number;
}

export function deadlineIn(ms: number = BUDGET_MS): Deadline {
  return { at: Date.now() + ms };
}

async function fetchText(url: string, accept: string, revalidate: number, deadline: Deadline): Promise<Answer<string>> {
  const left = deadline.at - Date.now();
  if (left <= 0) return { ok: false, missing: false, error: "time budget spent" };
  try {
    const response = await fetch(url, {
      headers: { accept },
      next: { revalidate },
      signal: AbortSignal.timeout(Math.min(TIMEOUT_MS, left)),
    } as RequestInit);
    if (response.status === 404) return { ok: false, missing: true, error: "404" };
    if (!response.ok) return { ok: false, missing: false, error: `${response.status} from ${new URL(url).host}` };
    const text = await response.text();
    if (text.length > MAX_BYTES) return { ok: false, missing: false, error: "response too large" };
    return { ok: true, value: text };
  } catch (error) {
    return { ok: false, missing: false, error: error instanceof Error ? error.message : "unreachable" };
  }
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index]!);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

type DayAnswer = { day: string; status: "ok"; items: BoeItem[] } | { day: string; status: "none" | "failed"; error?: string };

async function readDay(day: string, today: string, deadline: Deadline): Promise<DayAnswer> {
  const answer = await fetchText(
    sumarioUrl(day),
    "application/json",
    day === today ? REVALIDATE_TODAY : REVALIDATE_PAST,
    deadline,
  );
  if (!answer.ok) return answer.missing ? { day, status: "none" } : { day, status: "failed", error: answer.error };
  try {
    const json = JSON.parse(answer.value) as { status?: { code?: unknown } };
    if (String(json?.status?.code ?? "") === "404") return { day, status: "none" };
    if (String(json?.status?.code ?? "") !== "200") return { day, status: "failed", error: "unexpected status" };
    return { day, status: "ok", items: sumarioItems(json, day) };
  } catch {
    return { day, status: "failed", error: "unreadable summary" };
  }
}

export interface Discovery {
  notices: BoeNotice[];
  checked: string[];
  failed: string[];
}

/** Reads each day's summary and keeps this election's candidacy notices. */
export async function discover(
  config: ElectionConfig,
  today: string,
  deadline: Deadline = deadlineIn(),
): Promise<Discovery> {
  const days = scanDays(config, today);
  const answers = await mapLimit(days, CONCURRENCY, (day) => readDay(day, today, deadline));
  const notices: BoeNotice[] = [];
  const seen = new Set<string>();
  for (const answer of answers) {
    if (answer.status !== "ok") continue;
    for (const item of answer.items) {
      const notice = classify(item, config);
      if (notice && !seen.has(notice.id)) {
        seen.add(notice.id);
        notices.push(notice);
      }
    }
  }
  return {
    notices: notices.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id)),
    checked: days,
    failed: answers.filter((answer) => answer.status === "failed").map((answer) => answer.day),
  };
}

async function readItem(id: string, deadline: Deadline): Promise<Answer<string>> {
  const answer = await fetchText(boeLinks(id, "").xml, "application/xml", REVALIDATE_TODAY, deadline);
  if (!answer.ok) return answer;
  // A missing id answers 200 with `<error>`; that is not a document.
  if (!/<documento[\s>]/.test(answer.value)) return { ok: false, missing: true, error: "not a BOE document" };
  return answer;
}

/* -------------------------------------------------------------------------- */
/* The block's data                                                           */
/* -------------------------------------------------------------------------- */

export interface ProvinceResult extends ProvinceLists {
  stage: Stage;
  source: BoeNotice;
}

export interface CorrectionNotice extends BoeNotice {
  /** Junta headings in the correction; null when it could not be read. */
  juntas: string[] | null;
  catalan: ProvinceKey[];
}

export type Phase = "before" | "waiting" | "lists" | "unreadable" | "unreachable";

export interface CandidatesResult {
  today: string;
  phase: Phase;
  config: ElectionConfig;
  provinces: ProvinceResult[];
  /** Catalan provinces the published items did not yield. */
  missing: ProvinceKey[];
  presented: BoeNotice[];
  proclaimed: BoeNotice[];
  corrections: CorrectionNotice[];
  /** Items found in the summary whose text could not be read or parsed. */
  unreadable: BoeNotice[];
  /** Last day whose summary was asked for. */
  checkedThrough: string | null;
  failedDays: string[];
}

function empty(today: string, config: ElectionConfig, phase: Phase): CandidatesResult {
  return {
    today,
    phase,
    config,
    provinces: [],
    missing: [],
    presented: [],
    proclaimed: [],
    corrections: [],
    unreadable: [],
    checkedThrough: null,
    failedDays: [],
  };
}

export async function loadCandidates(
  today: string = todayInCatalonia(),
  config: ElectionConfig = ELECTION_29N,
): Promise<CandidatesResult> {
  if (!ISO_DAY.test(today)) throw new Error(`bad date ${today}`);
  // Before the first publication day there is nothing to read, and nothing
  // older is ever shown in its place.
  if (today < config.scanFrom) return empty(today, config, "before");

  const deadline = deadlineIn();
  const found = await discover(config, today, deadline);
  const result = empty(today, config, "waiting");
  result.checkedThrough = found.checked.at(-1) ?? null;
  result.failedDays = found.failed;
  result.presented = found.notices.filter((notice) => notice.kind === "presented");
  result.proclaimed = found.notices.filter((notice) => notice.kind === "proclaimed");
  const corrections = new Map(found.notices.filter((n) => n.kind === "correction").map((n) => [n.id, n]));

  if (found.checked.length > 0 && found.failed.length === found.checked.length) {
    result.phase = "unreachable";
    return result;
  }
  if (result.presented.length === 0 && result.proclaimed.length === 0) return result;

  // Proclaimed lists first; presented ones only for a province the
  // proclaimed items do not cover (or before they exist).
  const byProvince = new Map<ProvinceKey, ProvinceResult>();
  const read = async (notices: BoeNotice[], stage: Stage) => {
    const texts = await mapLimit(notices, CONCURRENCY, async (notice) => ({
      notice,
      answer: await readItem(notice.id, deadline),
    }));
    for (const { notice, answer } of texts) {
      const found = answer.ok ? catalanLists(answer.value) : [];
      if (found.length === 0) result.unreadable.push(notice);
      for (const lists of found) {
        if (!byProvince.has(lists.province)) byProvince.set(lists.province, { ...lists, stage, source: notice });
      }
      if (!answer.ok) continue;
      // A correction the scan did not reach is still listed by the item.
      for (const id of itemMeta(answer.value)?.corrections ?? []) {
        if (corrections.has(id)) continue;
        corrections.set(id, {
          id,
          title: "",
          date: "",
          issue: null,
          department: notice.department,
          section: notice.section,
          kind: "correction",
          corrects: stage,
        });
      }
    }
  };
  await read(result.proclaimed, "proclaimed");
  if (byProvince.size < PROVINCES.length) await read(result.presented, "presented");

  result.provinces = PROVINCES.flatMap((key) => (byProvince.has(key) ? [byProvince.get(key)!] : []));
  result.missing = PROVINCES.filter((key) => !byProvince.has(key));
  result.phase = result.provinces.length > 0 ? "lists" : "unreadable";

  // Which provinces each correction touches, read from the correction itself.
  result.corrections = (
    await mapLimit([...corrections.values()], CONCURRENCY, async (notice): Promise<CorrectionNotice> => {
      const answer = await readItem(notice.id, deadline);
      if (!answer.ok) return { ...notice, juntas: null, catalan: [] };
      const meta = itemMeta(answer.value);
      const filled: BoeNotice =
        meta && !notice.date ? { ...notice, title: meta.title, date: meta.date, issue: meta.issue } : notice;
      const juntas = juntasIn(answer.value);
      const catalan = PROVINCES.filter((key) => juntas.some((junta) => provinceOf(junta) === key));
      return { ...filled, juntas, catalan };
    })
  ).sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999") || a.id.localeCompare(b.id));

  return result;
}

/* -------------------------------------------------------------------------- */
/* Small helpers for the component                                            */
/* -------------------------------------------------------------------------- */

export function listed(candidacies: Candidacy[]): Candidacy[] {
  return candidacies.filter((candidacy) => candidacy.status === "listed");
}

export function unlisted(candidacies: Candidacy[]): Candidacy[] {
  return candidacies.filter((candidacy) => candidacy.status !== "listed");
}
