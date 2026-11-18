import type { CivilPlan, RoadIncident, WarningLevel, WeatherWarning } from "./types";

/**
 * Parsers for the three official feeds of the warnings page. Pure: text or
 * bytes in, typed rows out. Nothing is reworded; a row that does not parse is
 * left out, and a document that is not the expected feed gives null (the page
 * then says it could not read the source, never "no warnings").
 *
 *  - AEMET Meteoalerta, Catalonia (area 69): the RSS index
 *    (`CAP_AFAC69_RSS.xml`), the tar.gz bundle it links ("Estado completo de
 *    avisos para Cataluña") and the CAP 1.2 messages inside it.
 *  - Servei Català de Trànsit: the incidents RSS (`incidenciesRSS.xml`).
 *  - Protecció Civil: Socrata dataset `wj9c-j6vf` (JSON rows).
 */

/* -------------------------------------------------------------------------- */
/* XML text                                                                   */
/* -------------------------------------------------------------------------- */

const NAMED: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

/** XML character data: CDATA unwrapped, the five entities and numeric references decoded, spaces tidied. */
export function xmlText(raw: string | undefined | null): string {
  if (!raw) return "";
  const unwrapped = raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  return unwrapped
    .replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (match, ref: string) => {
      if (ref[0] === "#") {
        const code = ref[1] === "x" || ref[1] === "X" ? parseInt(ref.slice(2), 16) : parseInt(ref.slice(1), 10);
        return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : match;
      }
      return NAMED[ref.toLowerCase()] ?? match;
    })
    .replace(/\s+/g, " ")
    .trim();
}

/** The first `<tag …>…</tag>` in `xml` (namespace prefixes allowed in the name), raw. */
function element(xml: string, tag: string): string | undefined {
  const match = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`).exec(xml);
  return match?.[1];
}

function elements(xml: string, tag: string): string[] {
  return [...xml.matchAll(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "g"))].map((m) => m[1] ?? "");
}

/** An ISO instant for a parseable date, else null. */
function iso(value: string): string | null {
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
}

/** Only https links on the source's own host are kept (the page fetches some of them). */
export function officialUrl(value: string, hosts: readonly string[]): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && hosts.includes(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* AEMET: RSS index                                                           */
/* -------------------------------------------------------------------------- */

export const AEMET_HOSTS = ["www.aemet.es"] as const;

export interface AemetIndex {
  /** Channel lastBuildDate (or pubDate), ISO. */
  issued: string;
  /** "Estado completo de avisos para Cataluña", when listed. */
  bundleUrl: string | null;
  /** One CAP file per warning item ("Aviso. Nivel …"). */
  capUrls: string[];
}

/**
 * AEMET's RSS for Catalonia. Every warning is an item whose title starts with
 * "Aviso" and links its CAP file; one more item links the tar.gz with all of
 * them. An index with no warning item is a valid answer: no warnings.
 */
export function parseAemetIndex(xml: string): AemetIndex | null {
  if (!/<rss[\s>]/.test(xml)) return null;
  const channel = element(xml, "channel");
  if (channel === undefined) return null;
  const head = channel.split("<item")[0] ?? "";
  const issued = iso(xmlText(element(head, "lastBuildDate") ?? element(head, "pubDate")));
  if (!issued) return null;
  let bundleUrl: string | null = null;
  const capUrls: string[] = [];
  for (const item of elements(channel, "item")) {
    const link = officialUrl(xmlText(element(item, "link")), AEMET_HOSTS);
    if (!link) continue;
    const title = xmlText(element(item, "title"));
    if (/\.tar\.gz$/i.test(link)) bundleUrl = link;
    else if (/\.xml$/i.test(link) && /^Aviso\b/i.test(title)) capUrls.push(link);
  }
  return { issued, bundleUrl, capUrls };
}

/** File name of a CAP link: the bundle holds the same names. */
export function capFileName(url: string): string {
  return url.slice(url.lastIndexOf("/") + 1);
}

/* -------------------------------------------------------------------------- */
/* AEMET: tar bundle                                                          */
/* -------------------------------------------------------------------------- */

function cString(bytes: Uint8Array, from: number, length: number): string {
  let end = from;
  while (end < from + length && bytes[end] !== 0) end += 1;
  return new TextDecoder("utf-8").decode(bytes.subarray(from, end));
}

/**
 * The regular files of an (uncompressed) ustar archive, name → UTF-8 text.
 * Null when the bytes are not a tar archive.
 */
export function untar(bytes: Uint8Array): Map<string, string> | null {
  const files = new Map<string, string>();
  let offset = 0;
  while (offset + 512 <= bytes.length) {
    const header = bytes.subarray(offset, offset + 512);
    if (header.every((b) => b === 0)) return files;
    const name = cString(header, 0, 100);
    const size = parseInt(cString(header, 124, 12).trim() || "0", 8);
    const type = String.fromCharCode(header[156] ?? 0);
    const magic = cString(header, 257, 5);
    if (!Number.isFinite(size) || size < 0 || (magic !== "ustar" && magic !== "")) return null;
    const prefix = magic === "ustar" ? cString(header, 345, 155) : "";
    const start = offset + 512;
    if (start + size > bytes.length) return null;
    if (type === "0" || type === "\0") {
      const full = prefix ? `${prefix}/${name}` : name;
      files.set(full.slice(full.lastIndexOf("/") + 1), new TextDecoder("utf-8").decode(bytes.subarray(start, start + size)));
    }
    offset = start + Math.ceil(size / 512) * 512;
  }
  return files.size > 0 ? files : null;
}

/* -------------------------------------------------------------------------- */
/* AEMET: CAP message                                                         */
/* -------------------------------------------------------------------------- */

const LEVELS: Record<string, WarningLevel> = { amarillo: "yellow", naranja: "orange", rojo: "red" };

/** The value of `<parameter>` / `<eventCode>` / `<geocode>` named `name` inside `block`. */
function namedValue(block: string, name: string): string | null {
  const re = new RegExp(`<valueName>\\s*${name.replace(/ /g, "\\s+")}\\s*</valueName>\\s*<value>([\\s\\S]*?)</value>`);
  const match = re.exec(block);
  return match ? xmlText(match[1]) : null;
}

/**
 * One AEMET CAP 1.2 message, read from its Spanish `<info>` block. Null for
 * anything that is not a current warning: level "verde" (no warning), a
 * cancellation, a test or exercise, or a message missing its zone or times.
 */
export function parseCap(xml: string): WeatherWarning | null {
  if (!/<alert[\s>]/.test(xml)) return null;
  const status = xmlText(element(xml, "status"));
  const msgType = xmlText(element(xml, "msgType"));
  if (status !== "Actual" || (msgType !== "Alert" && msgType !== "Update")) return null;
  const infos = elements(xml, "info");
  const info = infos.find((block) => /<language>\s*es(-ES)?\s*<\/language>/i.test(block)) ?? infos[0];
  if (!info) return null;

  const level = LEVELS[(namedValue(info, "AEMET-Meteoalerta nivel") ?? "").toLowerCase()];
  if (!level) return null;
  const [code, name] = (namedValue(info, "AEMET-Meteoalerta fenomeno") ?? "").split(";");
  const onset = iso(xmlText(element(info, "onset")));
  const expires = iso(xmlText(element(info, "expires")));
  const area = element(info, "area") ?? "";
  const zone = xmlText(element(area, "areaDesc"));
  const zoneCode = namedValue(area, "AEMET-Meteoalerta zona") ?? "";
  const id = xmlText(element(xml, "identifier"));
  if (!code || !name || !onset || !expires || !zone || !/^\d{6}[A-Z]?$/.test(zoneCode) || !id) return null;
  if (Date.parse(expires) <= Date.parse(onset)) return null;

  return {
    id,
    phenomenon: code.trim(),
    phenomenonEs: name.trim(),
    level,
    zoneCode,
    zone,
    onset,
    expires,
    description: xmlText(element(info, "description")),
    probability: namedValue(info, "AEMET-Meteoalerta probabilidad"),
  };
}

/* -------------------------------------------------------------------------- */
/* Servei Català de Trànsit: incidents RSS                                    */
/* -------------------------------------------------------------------------- */

/** RFC 822 dates with the Central European zone names SCT uses, which Date.parse does not know. */
export function sctDate(value: string): string | null {
  const fixed = value.replace(/\s+CEST$/i, " +0200").replace(/\s+CET$/i, " +0100");
  return iso(fixed);
}

/** "TREBALLS DE MANTENIMENT" → "Treballs de manteniment" (presentation only). */
export function sentenceCase(value: string): string {
  const lower = value.toLocaleLowerCase("ca");
  return lower.charAt(0).toLocaleUpperCase("ca") + lower.slice(1);
}

/**
 * One SCT item. Title: "CAUSE. Description (Type)"; description: "road |
 * municipality | Sentit … | Punt km. a-b | HH:MM". Null when the title has no
 * type in brackets or the item has no road.
 */
export function parseSctItem(item: string): RoadIncident | null {
  const id = xmlText(element(item, "guid"));
  const since = sctDate(xmlText(element(item, "pubDate")));
  const title = xmlText(element(item, "title"));
  const typed = /^(.*)\(([^()]+)\)\s*$/.exec(title);
  if (!id || !since || !typed) return null;
  const body = (typed[1] ?? "").trim();
  const type = (typed[2] ?? "").trim();
  const dot = body.indexOf(". ");
  const cause = dot > 0 ? sentenceCase(body.slice(0, dot).trim()) : "";
  const description = (dot > 0 ? body.slice(dot + 2) : body).trim();

  const parts = xmlText(element(item, "description")).split("|").map((p) => p.trim());
  const road = parts[0] ?? "";
  if (!road || !type) return null;
  const direction = parts.find((p) => /^Sentit\b/i.test(p))?.replace(/^Sentit\s*/i, "").trim() ?? "";
  const km = parts.find((p) => /^Punt km\./i.test(p))?.replace(/^Punt km\.\s*/i, "").trim() ?? "";
  const municipality = parts.length >= 5 ? (parts[1] ?? "") : "";
  return { id, type, cause, description, road, municipality, direction, km, since };
}

export interface SctFeed {
  published: string;
  incidents: RoadIncident[];
}

export function parseSctRss(xml: string): SctFeed | null {
  if (!/<rss[\s>]/.test(xml)) return null;
  const channel = element(xml, "channel");
  if (channel === undefined) return null;
  const head = channel.split("<item")[0] ?? "";
  const published = sctDate(xmlText(element(head, "pubDate")));
  if (!published) return null;
  const incidents: RoadIncident[] = [];
  const seen = new Set<string>();
  for (const item of elements(channel, "item")) {
    const incident = parseSctItem(item);
    if (!incident || seen.has(incident.id)) continue;
    seen.add(incident.id);
    incidents.push(incident);
  }
  return { published, incidents };
}

/* -------------------------------------------------------------------------- */
/* Protecció Civil: Socrata rows                                              */
/* -------------------------------------------------------------------------- */

/**
 * A communiqué link is only linked, never fetched: any https address on a
 * Generalitat host (Documents Oberts, Interior, the open-data portal).
 */
export function gencatUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const host = url.hostname;
    const ok = host === "gencat.cat" || host.endsWith(".gencat.cat") || host.endsWith("transparenciacatalunya.cat");
    return url.protocol === "https:" && ok ? url.toString() : null;
  } catch {
    return null;
  }
}

function field(row: Record<string, unknown>, key: string): string | null {
  const value = row[key];
  if (typeof value === "string") return value.trim() || null;
  // Socrata "url" columns come as { url, description }.
  if (value && typeof value === "object" && typeof (value as { url?: unknown }).url === "string") return ((value as { url: string }).url).trim() || null;
  return null;
}

/**
 * The dataset's rows. An empty array is the documented answer when no plan is
 * in pre-alert, alert or emergency ("Quan no hi ha cap pla d'emergència
 * activat, el conjunt de dades és buit"). Null when the answer is not a list.
 */
export function parseCivilRows(json: unknown): CivilPlan[] | null {
  if (!Array.isArray(json)) return null;
  const plans: CivilPlan[] = [];
  for (const raw of json) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Record<string, unknown>;
    const acronym = field(row, "plaacronim");
    const name = field(row, "planom");
    const phase = field(row, "plafase");
    if (!(acronym || name) || !phase) continue;
    const pdf = field(row, "comunicatpdf");
    plans.push({
      acronym: acronym ?? "",
      name: name ?? "",
      phase,
      activated: field(row, "plaactivat"),
      since: field(row, "fasedatahora"),
      communique: pdf ? gencatUrl(pdf) : null,
      description: field(row, "descripcio"),
    });
  }
  return plans;
}
