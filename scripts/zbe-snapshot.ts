/**
 * Builds `src/lib/programmatic/zbe/snapshot.json` from the DGT's low-emission
 * zone files (DATEX II v3, one XML per zone) published on the National Access
 * Point under CC BY 4.0 (lib/programmatic/zbe/datex.ts says what the files
 * hold and what they do not). The pages read the committed file only: nothing
 * is fetched from the DGT at request time.
 *
 *   npm run zbe:snapshot -- build
 *       Downloads the directory listing and every .xml into a new temporary
 *       directory of its own (untrusted downloads: read as text, never
 *       executed) and writes the snapshot.
 *       --from <dir>   read a directory already downloaded (index.html + xml/)
 *       --dir <dir>    where to create the temporary directory (default: the OS temp dir)
 *
 *   npm run zbe:snapshot -- check
 *       Says how old the snapshot is and which files changed on the DGT
 *       server since (new, gone, or a later listing date). Writes nothing.
 *
 * Refresh: monthly; tests/zbe.test.ts fails ZBE_SNAPSHOT_MAX_AGE_DAYS after
 * the build. After a refresh, read the diff: a zone that is new, or whose
 * hours, start date or URL changed, means the council's page must be read
 * again before cities.ts is touched (the access rule never comes from here).
 */

import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import {
  DGT_ZBE_DATASET,
  DGT_ZBE_INDEX,
  DGT_ZBE_LICENCE,
  DGT_ZBE_PUBLISHER,
  ZBE_SNAPSHOT_MAX_AGE_DAYS,
  parseControlledZones,
  parseIndex,
  type DgtSnapshot,
  type DgtZone,
} from "../src/lib/programmatic/zbe/datex.ts";

const OUT = resolve(import.meta.dirname, "../src/lib/programmatic/zbe/snapshot.json");
const UA = "catalunyainfo.com zbe snapshot (+https://www.catalunyainfo.com/)";

function arg(name: string): string | null {
  const at = process.argv.indexOf(name);
  return (at > 0 ? process.argv[at + 1] : undefined) ?? null;
}

function madridToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
}

async function get(url: string): Promise<string> {
  const response = await fetch(url, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}

async function download(dir: string): Promise<void> {
  mkdirSync(join(dir, "xml"), { recursive: true });
  const index = await get(DGT_ZBE_INDEX);
  writeFileSync(join(dir, "index.html"), index);
  for (const row of parseIndex(index)) {
    writeFileSync(join(dir, "xml", row.file), await get(DGT_ZBE_INDEX + row.href));
  }
}

function build(dir: string): DgtSnapshot {
  const rows = parseIndex(readFileSync(join(dir, "index.html"), "utf8"));
  if (rows.length < 20) throw new Error(`only ${rows.length} files in the DGT listing: not writing a snapshot from it`);
  const zones: DgtZone[] = rows
    .flatMap((row) => parseControlledZones(readFileSync(join(dir, "xml", row.file), "utf8"), row.file, row.modified))
    .sort((a, b) => a.file.localeCompare(b.file, "es"));
  return { builtOn: madridToday(), index: DGT_ZBE_INDEX, dataset: DGT_ZBE_DATASET, licence: DGT_ZBE_LICENCE, publisher: DGT_ZBE_PUBLISHER, zones };
}

async function main(): Promise<void> {
  const mode = process.argv[2];
  if (mode === "build") {
    let dir = arg("--from");
    if (!dir) {
      dir = mkdtempSync(join(arg("--dir") ?? tmpdir(), "zbe-dgt-"));
      await download(dir);
    }
    const snapshot = build(resolve(dir));
    writeFileSync(OUT, `${JSON.stringify(snapshot, null, 1)}\n`);
    console.log(`${snapshot.zones.length} zones from ${new Set(snapshot.zones.map((z) => z.file)).size} files read in ${dir}; snapshot dated ${snapshot.builtOn}`);
    return;
  }
  if (mode === "check") {
    const current = JSON.parse(readFileSync(OUT, "utf8")) as DgtSnapshot;
    const age = Math.round((Date.parse(madridToday()) - Date.parse(current.builtOn)) / 86_400_000);
    console.log(`snapshot of ${current.builtOn}: ${age} days old (the test fails after ${ZBE_SNAPSHOT_MAX_AGE_DAYS})`);
    const listed = parseIndex(await get(DGT_ZBE_INDEX));
    const known = new Map(current.zones.map((z) => [z.file, z.modified]));
    for (const row of listed) {
      if (!known.has(row.file)) console.log(`new on the DGT server: ${row.file}`);
      else if (known.get(row.file) !== row.modified) console.log(`changed: ${row.file} (${known.get(row.file)} -> ${row.modified})`);
    }
    for (const file of known.keys()) if (!listed.some((row) => row.file === file)) console.log(`gone from the DGT server: ${file}`);
    return;
  }
  console.error("usage: npm run zbe:snapshot -- build [--from <dir>] [--dir <dir>] | check");
  process.exitCode = 1;
}

await main();
