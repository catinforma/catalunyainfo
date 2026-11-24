import { nameKey, parseAmendments, parseLocalOrder, type OrderComarca } from "./dogc";
import { applyAmendments, rawKey } from "./match";
import { extractLocalDays } from "./prepare";
import { slugify } from "./slug";
import type { HolidaySnapshot, NextYearLocal, NucleusDays, SourceRef } from "./types";

/**
 * The day the Generalitat publishes next year's local-holiday order, in one
 * step: find it in the DOGC's own summaries, parse it, check it against the
 * snapshot and produce the `local-2027.json` content. Pure functions, no I/O:
 * `scripts/holidays-snapshot.ts` (`find`, `ingest`, `prepare2027`) feeds
 * them, and `tests/holiday-ingest.test.ts` runs them on the 2026 order's real
 * text and on real DOGC summary excerpts (9565, 17.12.2025, the issue with
 * Ordre EMT/208/2025; 9801, 24.11.2026, without any local order).
 */

/* -------------------------------------------------------------------------- */
/* Finding the order in a DOGC summary                                        */
/* -------------------------------------------------------------------------- */

export const DOGC_PAGE = "https://dogc.gencat.cat/ca/document-del-dogc/?documentId=";
export const DOGC_PDF = (documentId: string) =>
  `https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=${documentId}&type=01&language=ca_ES`;

export interface DogcDocument {
  title: string;
  documentId: string;
  numDOGC: number;
  /** ISO date of the issue. */
  date: string;
}

/** One issue of the DOGC as `summaryDOGC` / `summaryLastPublishedDOGC` (POST, `?language=ca`) returns it. */
export interface DogcIssue {
  numDOGC: number;
  /** ISO date; null for the "last published" call, which prints a long date. */
  date: string | null;
  documents: DogcDocument[];
}

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

function isRecord(value: unknown): value is { [key: string]: Json } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** "24/11/2026" -> "2026-11-24". */
function isoFromDogcDate(text: string): string | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text.trim());
  return m ? `${m[3]}-${m[2]!.padStart(2, "0")}-${m[1]!.padStart(2, "0")}` : null;
}

/** Every issue in a summary response, with every document under any section, header or subheader. */
export function parseSummary(json: unknown): DogcIssue[] {
  if (!isRecord(json) || !Array.isArray(json.sumaris)) throw new Error("dogc summary: no 'sumaris'");
  return json.sumaris.map((issue) => {
    if (!isRecord(issue)) throw new Error("dogc summary: malformed issue");
    // An issue can come with annexes ("9791A"): same number, same date, more documents.
    const numDOGC = Number(/^(\d+)/.exec(String(issue.numDOGC))?.[1]);
    if (!Number.isInteger(numDOGC)) throw new Error("dogc summary: no issue number");
    const documents: DogcDocument[] = [];
    const date = typeof issue.dateDOGC === "string" ? isoFromDogcDate(issue.dateDOGC) : null;
    const walk = (node: Json): void => {
      if (Array.isArray(node)) return void node.forEach(walk);
      if (!isRecord(node)) return;
      const link = node.linkDownloadDocumentPDF;
      const title = node.title;
      if (typeof link === "string" && typeof title === "string") {
        const id = /documentId=(\d+)/.exec(link)?.[1];
        if (id) documents.push({ title, documentId: id, numDOGC, date: date ?? "" });
      }
      for (const value of Object.values(node)) walk(value);
    };
    walk(issue.section ?? null);
    return { numDOGC, date, documents };
  });
}

export type LocalOrderKind = "order" | "amendment" | "correction";

export interface LocalOrderHit extends DogcDocument {
  year: number;
  kind: LocalOrderKind;
}

const LOCAL_TITLE = /calendari de festes locals a (?:la Comunitat Aut[òo]noma de )?Catalunya per a l['’]any (\d{4})/i;

/** The documents of an issue that are the local-holiday order of `year`, its amendments or its corrections. */
export function findLocalOrders(issue: DogcIssue, year: number): LocalOrderHit[] {
  return issue.documents.flatMap((doc) => {
    const match = LOCAL_TITLE.exec(doc.title);
    if (!match || Number(match[1]) !== year) return [];
    const kind: LocalOrderKind = /^Correcci[óòo] d['’]errades/i.test(doc.title)
      ? "correction"
      : /\bde modificaci[óòo] de l['’]Ordre/i.test(doc.title)
        ? "amendment"
        : /^Ordre\b/i.test(doc.title)
          ? "order"
          : "correction";
    return [{ ...doc, year, kind }];
  });
}

/** "DOGC núm. 9565, de 17.12.2025": the way snapshot.json writes a reference (no zero padding). */
export function dogcRef(hit: Pick<DogcDocument, "numDOGC" | "date">): string {
  const [y, m, d] = hit.date.split("-");
  return `DOGC núm. ${hit.numDOGC}, de ${Number(d)}.${Number(m)}.${y}`;
}

export function sourceRefOf(hit: DogcDocument): SourceRef {
  return { name: hit.title, ref: dogcRef(hit), url: `${DOGC_PAGE}${hit.documentId}` };
}

/* -------------------------------------------------------------------------- */
/* Building and checking next year's file                                     */
/* -------------------------------------------------------------------------- */

export interface IngestInput {
  /** `pdftotext` text of the order. */
  orderText: string;
  /** Texts of amending orders, applied in the order given. */
  amendmentTexts?: string[];
  snapshot: Pick<HolidaySnapshot, "municipalities" | "excluded">;
  year: number;
  source: SourceRef;
  /** ISO date the order was read. */
  readOn: string;
  /** Catalonia-wide days of `year` as ISO dates; `aran` for the Aran list (Festa d'Aran instead of one day). */
  regionalDates: (aran: boolean) => string[];
}

export interface IngestStats {
  orderEntries: number;
  amendmentsApplied: number;
  listedTowns: number;
  townsWithOwnDays: number;
  townsNucleiOnly: number;
  nuclei: number;
  /** Towns the 2026 order left out ("proposta no formulada") that this order gives two days. */
  unlistedNowListed: string[];
  /** Towns still left out. */
  unlistedStill: string[];
  aranTowns: number;
  /** Local days that fall on a Sunday (informational: the pages say so). */
  sundayDays: number;
}

export interface IngestResult {
  next: NextYearLocal;
  /** Anything here blocks `--write`. */
  errors: string[];
  /** To read before the deploy; does not block. */
  warnings: string[];
  stats: IngestStats;
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;

function validIso(value: string): boolean {
  return ISO.test(value) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
}

/**
 * Next year's `local-2027.json` from the order text: the same extraction as
 * `prepare2027` always did, plus the councils the previous order left out, and
 * the checks a person would otherwise do by eye (every town present, two days
 * each, right year, Aran, no day that is already a Catalonia-wide holiday,
 * nothing in the order that no town claims).
 */
export function buildNextYear(input: IngestInput): IngestResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const order = parseLocalOrder(input.orderText);
  if (order.year !== input.year) errors.push(`the order is for ${order.year}, expected ${input.year}`);

  const amendments = (input.amendmentTexts ?? []).flatMap((text) => parseAmendments(text, order.year));
  const amended = applyAmendments(order.comarques, amendments);
  for (const u of amended.unmatched) errors.push(`amendment not matched: ${u.comarca} / ${u.name} (${u.reason})`);

  const listed = extractLocalDays(amended.comarques, input.snapshot.municipalities);
  errors.push(...listed.problems);
  const municipalities = { ...listed.municipalities };

  // Councils the previous order left out. "Proposta no formulada" again is no news; a name that
  // is gone from the order altogether is worth a look; two days make the town a page.
  const unlistedNowListed: string[] = [];
  const unlistedStill: string[] = [];
  const unlisted = input.snapshot.excluded.map((e) => ({ slug: slugify(e.name), name: e.name, dogcName: e.name, comarca: e.comarca, nuclei: [] as NucleusDays[] }));
  const second = extractLocalDays(amended.comarques, unlisted);
  for (const u of unlisted) {
    const found = second.municipalities[u.slug];
    if (!found || found.local.length === 0) {
      unlistedStill.push(u.name);
      if (!found) warnings.push(`left-out council ${u.name} (${u.comarca}) is not in the order at all`);
      continue;
    }
    if (found.local.length !== 2) errors.push(`${u.name}: ${found.local.length} dates (${found.local.join(", ")}), check the text`);
    else unlistedNowListed.push(u.name);
    municipalities[u.slug] = found;
  }

  // The checks.
  const regionalFor = new Map<boolean, Set<string>>([
    [false, new Set(input.regionalDates(false))],
    [true, new Set(input.regionalDates(true))],
  ]);
  const everyTown = [...input.snapshot.municipalities.map((m) => ({ ...m, listed: true })), ...unlisted.filter((u) => unlistedNowListed.includes(u.name)).map((u) => ({ ...u, listed: false }))];
  let sundayDays = 0;
  let own = 0;
  let nucleiOnly = 0;
  let nuclei = 0;
  let aranTowns = 0;
  for (const m of everyTown) {
    const found = municipalities[m.slug];
    if (!found) {
      errors.push(`${m.name}: no entry in the result`);
      continue;
    }
    const aran = m.comarca === "Aran";
    if (aran && m.listed) aranTowns += 1;
    if (found.local.length === 0) {
      if (m.listed) nucleiOnly += 1;
      if (found.nuclei.every((n) => n.dates.length === 0)) errors.push(`${m.name}: no days of its own and none in its nuclei`);
    } else if (m.listed) own += 1;
    if (found.local.length !== 0 && found.local.length !== 2) errors.push(`${m.name}: ${found.local.length} local days`);
    for (const n of found.nuclei) {
      nuclei += 1;
      if (n.dates.length === 0) errors.push(`${m.name} / ${n.name}: no days`);
      else if (n.dates.length !== 2) warnings.push(`${m.name} / ${n.name}: ${n.dates.length} day(s), the 2026 order gave Seguer one and every other nucleus two`);
    }
    for (const d of [...found.local, ...found.nuclei.flatMap((n) => n.dates)]) {
      if (!validIso(d) || !d.startsWith(`${input.year}-`)) errors.push(`${m.name}: "${d}" is not a ${input.year} date`);
      else if (new Date(`${d}T12:00:00Z`).getUTCDay() === 0) sundayDays += 1;
    }
    if (new Set(found.local).size !== found.local.length) errors.push(`${m.name}: the same day twice`);
    const regional = regionalFor.get(aran)!;
    for (const d of found.local) if (regional.has(d)) warnings.push(`${m.name}${aran ? " (Aran)" : ""}: local day ${d} is already a Catalonia-wide holiday there`);
  }
  if (aranTowns === 0) errors.push("no municipality of the Aran comarca in the result");

  // Entries of the order that no town, nucleus or left-out council claims.
  const claimed = new Set<string>();
  for (const m of input.snapshot.municipalities) {
    claimed.add(nameKey(m.dogcName));
    for (const n of m.nuclei) claimed.add(nameKey(n.name));
    for (const n of m.unlisted ?? []) claimed.add(nameKey(n.name));
  }
  for (const u of unlisted) claimed.add(nameKey(u.dogcName));
  // A municipality without days of its own prints its name straight into its first nucleus
  // ("Naut Aran Arties, ..."): claimed through the municipality's name as a prefix.
  const prefixes = input.snapshot.municipalities.map((m) => `${rawKey(m.dogcName)} `);
  const orphans = amended.comarques.flatMap((c) =>
    c.entries.filter((e) => !claimed.has(nameKey(e.name)) && !prefixes.some((p) => rawKey(e.name).startsWith(p))).map((e) => `${c.heading} / ${e.name}`),
  );
  if (orphans.length > 0) {
    warnings.push(`${orphans.length} order entries match no town, nucleus or left-out council (a new or renamed place): ${orphans.slice(0, 40).join("; ")}${orphans.length > 40 ? "; …" : ""}`);
  }

  const next: NextYearLocal = { order: input.source, readOn: input.readOn, municipalities };
  return {
    next,
    errors: [...new Set(errors)],
    warnings,
    stats: {
      orderEntries: countEntries(amended.comarques),
      amendmentsApplied: amended.applied.length,
      listedTowns: input.snapshot.municipalities.length,
      townsWithOwnDays: own,
      townsNucleiOnly: nucleiOnly,
      nuclei,
      unlistedNowListed,
      unlistedStill,
      aranTowns,
      sundayDays,
    },
  };
}

function countEntries(comarques: OrderComarca[]): number {
  return comarques.reduce((n, c) => n + c.entries.length, 0);
}
