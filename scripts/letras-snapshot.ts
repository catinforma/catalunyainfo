/**
 * Builds `src/lib/programmatic/treasury-bills/snapshot.json`: every Letras
 * del Tesoro auction result since FROM, read from the Tesoro Público's own
 * pages (the "últimas subastas" table and one detail page per past auction;
 * the Tesoro publishes no CSV/XLS/JSON of the current year). The pages
 * (/es/calculadoras/letras-del-tesoro/ and its ca/en editions) read the
 * latest table live (treasury-bills/server.ts) and fall back to this file.
 *
 *   npm run letras:snapshot -- build    fetches what is missing and writes the snapshot
 *   npm run letras:snapshot -- check    compares the snapshot with the Tesoro; writes nothing
 *
 * Every column goes through parseResultsPage's checks (dates in order, the
 * average price equal to the Orden's formula for the average rate); a
 * refused column stops the build. Results already in the snapshot are kept
 * (the Tesoro does not revise them), so a rerun only fetches new auctions.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { madridDay } from "../src/lib/programmatic/rent-update/ine.ts";
import { LATEST_RESULTS_URL, TERMS, latestByTerm, mergeResults, parsePastList, parseResultsPage, pastDetailUrl, pastListUrl, type AuctionResult } from "../src/lib/programmatic/treasury-bills/results.ts";
import type { LetrasSnapshot } from "../src/lib/programmatic/treasury-bills/data.ts";

const ROOT = resolve(import.meta.dirname, "..");
const FILE = join(ROOT, "src/lib/programmatic/treasury-bills/snapshot.json");
const FROM = "2026-01-01";
const UA = { "user-agent": "CatalunyaInfo/2.0 (+https://www.catalunyainfo.com)", accept: "text/html" };

/** The VPS network drops packets: retry, and only accept a page that arrived whole. */
async function getHtml(url: string): Promise<string> {
  let last: unknown;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await fetch(url, { headers: UA, signal: AbortSignal.timeout(90_000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      if (!html.includes("</html>")) throw new Error("truncated page");
      return html;
    } catch (error) {
      last = error;
    }
  }
  throw new Error(`${url}: ${String(last)}`);
}

function readOwn(): LetrasSnapshot | null {
  try {
    return JSON.parse(readFileSync(FILE, "utf8")) as LetrasSnapshot;
  } catch {
    return null;
  }
}

async function latest(): Promise<AuctionResult[]> {
  const parsed = parseResultsPage(await getHtml(LATEST_RESULTS_URL), LATEST_RESULTS_URL);
  if (parsed.refused.length) throw new Error(`latest results refused: ${parsed.refused.join("; ")}`);
  if (parsed.results.length !== TERMS.length) throw new Error(`latest results: ${parsed.results.length} terms`);
  return parsed.results;
}

async function past(have: Set<string>): Promise<AuctionResult[]> {
  const out: AuctionResult[] = [];
  for (let page = 1; page <= 40; page++) {
    const entries = parsePastList(await getHtml(pastListUrl(page)));
    if (entries.length === 0) break;
    for (const e of entries) {
      if (e.auction < FROM || have.has(`${e.auction}|${e.term}`)) continue;
      const url = pastDetailUrl(e.entryId);
      const parsed = parseResultsPage(await getHtml(url), url);
      if (parsed.refused.length) throw new Error(`${url}: ${parsed.refused.join("; ")}`);
      const hit = parsed.results.find((r) => r.term === e.term && r.auction === e.auction);
      if (!hit) throw new Error(`${url}: no ${e.term}-month column for ${e.auction}`);
      out.push(hit);
      console.log(`  ${e.auction} ${e.term} m: medio ${hit.avgRate} %, marginal ${hit.marginalRate} %`);
    }
    if (entries.every((e) => e.auction < FROM)) break;
  }
  return out;
}

async function main() {
  const mode = process.argv[2] ?? "check";
  const now = new Date();
  const own = readOwn();
  const fresh = await latest();

  if (mode === "check") {
    const mine = latestByTerm(own?.results ?? []);
    for (const r of fresh) console.log(`${r.term} months: snapshot ${mine[r.term]?.auction ?? "none"}, Tesoro ${r.auction}${mine[r.term]?.auction === r.auction ? "" : "  <- rebuild"}`);
    return;
  }
  if (mode !== "build") throw new Error(`unknown mode ${mode}`);
  const kept = own?.results ?? [];
  const have = new Set(kept.map((r) => `${r.auction}|${r.term}`));
  const older = await past(have);
  const results = mergeResults(kept, older, fresh).filter((r) => r.auction >= FROM);
  const snapshot: LetrasSnapshot = { fetchedAt: now.toISOString(), asOf: madridDay(now), results };
  writeFileSync(FILE, `${JSON.stringify(snapshot, null, 1)}\n`);
  const top = latestByTerm(results);
  for (const t of TERMS) console.log(`${t} months: latest ${top[t]?.auction} medio ${top[t]?.avgRate} %`);
  console.log(`${results.length} results since ${FROM}`);
}

await main();
