/**
 * Re-reads the sources of the weekly markets family (lib/programmatic/weekly-markets/data.ts):
 * each council page must still contain the quoted words, and the Generalitat
 * census (open data vjxi-2iwi) must still list our markets with the same
 * identifier and day. Prints one line per check; exit code 1 when something
 * moved. Read only: it changes nothing. After a green (or explained) run, move
 * `WEEKLY_MARKETS_AS_OF` / the sources' `readOn` and `WEEKLY_MARKETS_REREAD_BY`.
 *
 *   node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON \
 *     --import ./tests/register-alias.mjs scripts/check-weekly-markets.ts
 *
 * A source that fails to load is reported as "unreachable", not as a change:
 * the page keeps the last validated data with its date (see `checked`).
 */

import { TOWNS } from "../src/lib/programmatic/weekly-markets/data.ts";

const UA = "Mozilla/5.0 (compatible; CatalunyaInfoBot/1.0)";
const norm = (text: string) =>
  text
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_m, n: string) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&")
    .replace(/&rsquo;|&#8217;/g, "’")
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .toLowerCase();

async function get(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(25_000) });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

let problems = 0;
for (const town of TOWNS) {
  for (const source of town.sources) {
    if (source.id.endsWith("-census")) continue;
    const body = await get(source.url);
    if (body === null) {
      console.log(`UNREACHABLE ${town.slug} ${source.id} ${source.url}`);
      continue;
    }
    const text = norm(body);
    for (const quote of source.quotes) {
      const ok = text.includes(norm(quote));
      if (!ok) problems += 1;
      console.log(`${ok ? "ok     " : "CHANGED"} ${town.slug} ${source.id}: ${quote.slice(0, 70)}`);
    }
  }
  const rows = await get(`https://analisi.transparenciacatalunya.cat/resource/vjxi-2iwi.json?municipi=${encodeURIComponent(town.name.ca)}`);
  if (rows === null) {
    console.log(`UNREACHABLE ${town.slug} census`);
    continue;
  }
  const census = JSON.parse(rows) as { identificador: string; dia_celebracio: string }[];
  for (const market of town.markets) {
    const row = census.find((r) => r.identificador === market.census.id);
    const ok = row?.dia_celebracio === market.census.day;
    if (!ok) problems += 1;
    console.log(`${ok ? "ok     " : "CHANGED"} ${town.slug} census ${market.census.id}: ${row?.dia_celebracio ?? "missing"} (ours: ${market.census.day})`);
  }
  const extra = census.filter((r) => !town.markets.some((m) => m.census.id === r.identificador));
  if (extra.length > 0) {
    problems += 1;
    console.log(`CHANGED ${town.slug} census lists markets we do not have: ${extra.map((r) => r.identificador).join(", ")}`);
  }
}
process.exitCode = problems > 0 ? 1 : 0;
