/**
 * Builds `src/lib/programmatic/euribor/snapshot.json`: the official mortgage
 * reference rates (Euribor one year, IRPH, IRS five years, €STR one year,
 * public debt 2–6 years) since SERIES_FROM, read from the Banco de España's
 * table 19.1 (be1901.csv), each value checked against the BOE resolution
 * that published it. The Euribor and mortgage pages read the CSV live
 * (euribor/server.ts) and fall back to this file.
 *
 *   npm run euribor:snapshot -- build    reads the CSV, checks every value in the BOE, writes the snapshot
 *   npm run euribor:snapshot -- check    compares the snapshot's latest months with the CSV; writes nothing
 *
 * Only the monthly official figures are read (never the daily Euribor: see
 * euribor/rules.ts, EMMI's terms). A value whose BOE text differs, or whose
 * BOE resolution cannot be found, stops the build. Resolutions already in
 * the snapshot are not fetched again.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { boeSummaryUrl, boeTextUrl, findResolutions, groupOf, parseResolution } from "../src/lib/programmatic/euribor/boe.ts";
import type { EuriborSnapshot } from "../src/lib/programmatic/euribor/data.ts";
import { BDE_CSV_URL, REF_IDS, REF_SERIES, latestPoint, parseBdeCsv, publishedBy, type BoeGroup, type BoeResolution, type RefId, type RefSeries } from "../src/lib/programmatic/euribor/series.ts";
import { madridDay } from "../src/lib/programmatic/rent-update/ine.ts";

const ROOT = resolve(import.meta.dirname, "..");
const FILE = join(ROOT, "src/lib/programmatic/euribor/snapshot.json");
const UA = { "user-agent": "CatalunyaInfo/2.0 (+https://www.catalunyainfo.com)" };

/** The VPS network drops packets: retry, and only accept an answer that arrived whole. */
async function get(url: string, accept: string, complete: (body: string) => boolean, latin1 = false): Promise<string> {
  let last: unknown;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await fetch(url, { headers: { ...UA, accept }, signal: AbortSignal.timeout(60_000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = latin1 ? new TextDecoder("latin1").decode(await response.arrayBuffer()) : await response.text();
      if (!complete(body)) throw new Error("truncated answer");
      return body;
    } catch (error) {
      last = error;
    }
  }
  throw new Error(`${url}: ${String(last)}`);
}

function readOwn(): EuriborSnapshot | null {
  try {
    return JSON.parse(readFileSync(FILE, "utf8")) as EuriborSnapshot;
  } catch {
    return null;
  }
}

async function readCsv(today: string): Promise<RefSeries> {
  const text = await get(BDE_CSV_URL, "text/csv", (b) => b.includes("FUENTE"), true);
  const parsed = parseBdeCsv(text);
  if (parsed.missing.length) throw new Error(`be1901.csv: columns missing ${parsed.missing.join(", ")}`);
  return publishedBy(parsed.series, today);
}

const GROUP_IDS: Record<BoeGroup, RefId[]> = {
  interbank: REF_IDS.filter((id) => REF_SERIES[id].group === "interbank"),
  irph: REF_IDS.filter((id) => REF_SERIES[id].group === "irph"),
  debt: REF_IDS.filter((id) => REF_SERIES[id].group === "debt"),
};

/** Every (group, month, BOE day) the series need a resolution for. */
function needed(series: RefSeries): { group: BoeGroup; month: string; date: string }[] {
  const seen = new Map<string, { group: BoeGroup; month: string; date: string }>();
  for (const id of REF_IDS) {
    for (const p of series[id]) {
      const group = REF_SERIES[id].group;
      seen.set(`${group}|${p.month}`, { group, month: p.month, date: p.boe });
    }
  }
  return [...seen.values()].sort((a, b) => a.date.localeCompare(b.date));
}

async function checkInBoe(series: RefSeries, known: BoeResolution[]): Promise<BoeResolution[]> {
  const out: BoeResolution[] = [];
  const summaries = new Map<string, ReturnType<typeof findResolutions>>();
  for (const need of needed(series)) {
    const have = known.find((r) => r.group === need.group && r.month === need.month && r.date === need.date);
    if (have) {
      out.push(have);
      continue;
    }
    if (!summaries.has(need.date)) {
      const json = await get(boeSummaryUrl(need.date), "application/json", (b) => b.trim().endsWith("}"));
      summaries.set(need.date, findResolutions(JSON.parse(json)));
    }
    const hits = summaries.get(need.date)!.filter((h) => (need.group === "debt" ? h.kind === "debt" : h.kind === "rates"));
    let found: BoeResolution | null = null;
    for (const hit of hits) {
      const figures = parseResolution(await get(boeTextUrl(hit.id), "text/html", (b) => b.includes("</html>")));
      if (groupOf(figures, hit.kind) !== need.group) continue;
      if (figures.month !== need.month) throw new Error(`${hit.id}: figures for ${figures.month}, the CSV dates ${need.month} on ${need.date}`);
      for (const id of GROUP_IDS[need.group]) {
        const mine = series[id].find((p) => p.month === need.month)?.value ?? null;
        const boe = figures[id];
        if (mine !== null && boe !== mine) throw new Error(`${hit.id} ${need.month} ${id}: BOE ${boe}, Banco de España ${mine}`);
      }
      found = { month: need.month, group: need.group, date: need.date, id: hit.id };
    }
    if (!found) throw new Error(`No BOE resolution for ${need.group} ${need.month} on ${need.date}`);
    console.log(`  ${need.date} ${found.id} ${need.group} ${need.month} ok`);
    out.push(found);
  }
  return out;
}

async function main() {
  const mode = process.argv[2] ?? "check";
  const now = new Date();
  const today = madridDay(now);
  const own = readOwn();
  const series = await readCsv(today);

  if (mode === "check") {
    for (const id of REF_IDS) {
      const mine = latestPoint(own?.series[id] ?? []);
      const theirs = latestPoint(series[id]);
      console.log(`${id}: snapshot ${mine?.month ?? "none"} ${mine?.value ?? ""}, Banco de España ${theirs?.month} ${theirs?.value}${mine?.month === theirs?.month ? "" : "  <- rebuild"}`);
    }
    return;
  }
  if (mode !== "build") throw new Error(`unknown mode ${mode}`);
  const resolutions = await checkInBoe(series, own?.resolutions ?? []);
  const snapshot: EuriborSnapshot = { fetchedAt: now.toISOString(), asOf: today, source: BDE_CSV_URL, series, resolutions };
  writeFileSync(FILE, `${JSON.stringify(snapshot, null, 1)}\n`);
  for (const id of REF_IDS) {
    const p = latestPoint(series[id]);
    console.log(`${id}: ${series[id].length} months, latest ${p?.month} ${p?.value} % (BOE ${p?.boe})`);
  }
  console.log(`${resolutions.length} BOE resolutions checked`);
}

await main();
