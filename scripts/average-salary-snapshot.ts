/**
 * Builds `src/lib/programmatic/average-salary/snapshot.json` and the CSV
 * readers download (`public/datos/salario-medio-ine.csv`) for "Salario medio
 * en España" (/es/calculadoras/salario-medio/, /ca/calculadores/salari-mitja/,
 * /en/calculators/average-salary-spain/), from the INE's JSON API:
 *
 *   EAES (Encuesta Anual de Estructura Salarial): tables 28191, 28201, 28192,
 *   28193, 28189, 28185, 28186, 28187 (+ 28185/28186 in English for INE's
 *   English names) and release calendar 163; the modal wage from the press
 *   release (not in the API).
 *   EPA, Decil de salarios del empleo principal: tables 66252, 66237 and
 *   release calendar 348.
 *
 *   npm run salary:snapshot -- build    writes the snapshot and the CSV
 *   npm run salary:snapshot -- check    compares the snapshot with the INE; writes nothing
 *
 * Stops (and writes nothing) when a table's newest year is not the newest
 * year the INE calendar says is out, or when a series cannot be classified:
 * a renamed INE category must be looked at, not guessed.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import { madridDay } from "../src/lib/programmatic/rent-update/ine.ts";
import {
  calendarApiUrl,
  latestYear,
  parseAgeNational,
  parseAgeRegion,
  parseCalendar,
  parseDecileWorkday,
  parseDeciles,
  parseDist,
  parseLabelled,
  parseModal,
  parseOccupationRegion,
  parseSectorRegion,
  parseTable,
  parseWorkday,
  pressUrl,
  releaseStatus,
  tableApiUrl,
  TABLES,
  type Op,
  type ParsedSeries,
  type SalarySnapshot,
  type TableKey,
} from "../src/lib/programmatic/average-salary/ine.ts";
import { salaryCsv } from "../src/lib/programmatic/average-salary/csv.ts";

const ROOT = resolve(import.meta.dirname, "..");
const FILE = join(ROOT, "src/lib/programmatic/average-salary/snapshot.json");
const CSV = join(ROOT, "public/datos/salario-medio-ine.csv");
const UA = { "user-agent": "CatalunyaInfo/2.0 (+https://www.catalunyainfo.com)" };

async function get(url: string): Promise<Response> {
  const response = await fetch(url, { headers: UA, signal: AbortSignal.timeout(90_000) });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response;
}

async function table(key: TableKey, lang: "ES" | "EN" = "ES"): Promise<ParsedSeries[]> {
  return parseTable(await (await get(tableApiUrl(key, lang))).json());
}

async function pressOrNull(op: Op, year: number): Promise<{ url: string; text: string } | null> {
  const url = pressUrl(op, year);
  const response = await fetch(url, { headers: UA, signal: AbortSignal.timeout(60_000) });
  return response.ok ? { url, text: await response.text() } : null;
}

async function main() {
  const mode = process.argv[2] ?? "check";
  const now = new Date();
  const today = madridDay(now);

  const status = {
    eaes: releaseStatus(parseCalendar(await (await get(calendarApiUrl("eaes"))).json(), madridDay), today),
    epa: releaseStatus(parseCalendar(await (await get(calendarApiUrl("epa"))).json(), madridDay), today),
  };

  const raw = {} as Record<TableKey, ParsedSeries[]>;
  for (const key of Object.keys(TABLES) as TableKey[]) {
    raw[key] = await table(key);
    const year = latestYear(raw[key]);
    const expected = status[TABLES[key].op].year;
    if (year !== expected) throw new Error(`table ${TABLES[key].id}: newest year ${year}, but the INE calendar says ${expected} is out (${status[TABLES[key].op].released}). Wait for the table or look at it.`);
  }

  if (mode === "check") {
    const own = JSON.parse(readFileSync(FILE, "utf8")) as SalarySnapshot;
    for (const op of ["eaes", "epa"] as const) {
      const a = own[op].year;
      const b = status[op].year;
      console.log(`${op}: snapshot ${a} (released ${own[op].released}), INE ${b} (released ${status[op].released}); next ${status[op].next ? `${status[op].next!.year} on ${status[op].next!.day}` : "not in the calendar"}${a === b ? "" : "  <- rebuild"}`);
    }
    return;
  }
  if (mode !== "build") throw new Error(`unknown mode ${mode} (build | check)`);

  const ey = status.eaes.year;
  const py = status.epa.year;
  const dist = parseDist(raw.dist, ey);
  const prev = parseDist(raw.dist, ey - 1);
  const mean = (d: typeof dist, sex: "both" | "women" | "men", k: "mean" | "median") => {
    const c = d.es[sex][k];
    if (!c) throw new Error(`28191: no national ${sex} ${k}`);
    return c.v;
  };
  const eaesPress = await pressOrNull("eaes", ey);
  const epaPress = await pressOrNull("epa", py);
  const modal = eaesPress ? parseModal(eaesPress.text) : null;
  if (!modal) console.warn(`EAES ${ey}: modal wage not found in the press release; the page leaves it out.`);

  const snapshot: SalarySnapshot = {
    fetchedAt: now.toISOString(),
    asOf: today,
    eaes: {
      year: ey,
      released: status.eaes.released,
      next: status.eaes.next,
      press: eaesPress?.url ?? null,
      modal,
      previous: { year: ey - 1, mean: mean(prev, "both", "mean"), median: mean(prev, "both", "median"), women: mean(prev, "women", "mean"), men: mean(prev, "men", "mean") },
      dist,
      ageRegion: parseAgeRegion(raw.ageRegion, ey),
      sectorRegion: parseSectorRegion(raw.sectorRegion, ey),
      occupationRegion: parseOccupationRegion(raw.occupationRegion, ey),
      ageNational: parseAgeNational(raw.ageNational, ey),
      sections: parseLabelled("28185", "SECCIONES", raw.sections, await table("sections", "EN"), ey),
      occupations: parseLabelled("28186", "OCUPACIONES", raw.occupations, await table("occupations", "EN"), ey),
      workday: parseWorkday(raw.workday, ey),
    },
    epa: {
      year: py,
      released: status.epa.released,
      next: status.epa.next,
      press: epaPress?.url ?? null,
      deciles: parseDeciles(raw.deciles, py),
      means: parseDecileWorkday(raw.decileWorkday, py),
    },
  };

  writeFileSync(FILE, `${JSON.stringify(snapshot, null, 1)}\n`);
  mkdirSync(dirname(CSV), { recursive: true });
  writeFileSync(CSV, salaryCsv(snapshot));
  console.log(`wrote ${FILE} (EAES ${ey}, released ${status.eaes.released}; EPA deciles ${py}, released ${status.epa.released}) and ${CSV}`);
  console.log(`national mean ${mean(dist, "both", "mean")}, median ${mean(dist, "both", "median")}, modal ${modal?.value ?? "—"}; EPA mean ${snapshot.epa.means.all}/month`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
