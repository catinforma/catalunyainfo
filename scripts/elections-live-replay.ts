/**
 * Election-night dry run (PROTOTYPE; docs/elections-live-results.md, 2.8):
 * replays the Interior Ministry's official 2023 results file by municipality
 * through the night pipeline (adapter -> checks -> versioned per-town files)
 * into a scratch directory. Never point --out at /srv: nothing reads it.
 *
 *   node --experimental-strip-types --import ./tests/register-alias.mjs \
 *     scripts/elections-live-replay.ts <02202307_MUNI.zip | directory of .DAT files> --out <scratch dir>
 *
 * With the whole archive every one of the 947 towns must be present; with a
 * directory (the test fixture) only the towns it holds are expected. A second
 * run of the same file is refused by nothing and changes no town (0 changed);
 * a run of an older file is refused by `checkProgress`.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

import { readZip } from "./lib/zip.ts";
import { readCurrent, writeRefusal, writeVersion } from "./lib/live-files.ts";
import { CONGRESS, decodeAnsi, electionFiles, parseElection } from "../src/lib/programmatic/elections/interior.ts";
import { fromInteriorFinal, INTERIOR_FINAL_ADAPTER } from "../src/lib/programmatic/elections/live/adapters/interior-final.ts";
import { livePaths } from "../src/lib/programmatic/elections/live/paths.ts";
import { changedTowns, checkProgress, checkSnapshot } from "../src/lib/programmatic/elections/live/store.ts";
import { SNAPSHOT } from "../src/lib/programmatic/elections/snapshot.ts";

const PROVINCE_SEATS = { "08": 32, "17": 6, "25": 4, "43": 6 };

async function members(source: string): Promise<{ members: { name: string; text: () => string }[]; whole: boolean; fileDate: string }> {
  if ((await stat(source)).isDirectory()) {
    const names = (await readdir(source)).filter((n) => /\.DAT$/i.test(n));
    const texts = await Promise.all(names.map(async (n) => [n, decodeAnsi(await readFile(join(source, n)))] as const));
    const dates = await Promise.all(names.map(async (n) => (await stat(join(source, n))).mtime.toISOString().slice(0, 10)));
    return { members: texts.map(([name, text]) => ({ name, text: () => text })), whole: false, fileDate: dates.sort().at(-1)! };
  }
  const zip = readZip(await readFile(source));
  const dat = zip.filter((m) => /\.DAT$/i.test(m.name));
  return { members: zip.map((m) => ({ name: m.name, text: () => decodeAnsi(m.read()) })), whole: true, fileDate: dat.map((m) => m.modified).sort().at(-1)! };
}

async function main() {
  const args = process.argv.slice(2);
  const outAt = args.indexOf("--out");
  const source = args.find((a, i) => !a.startsWith("--") && i !== outAt + 1);
  const out = outAt >= 0 ? args[outAt + 1] : undefined;
  if (!source || !out) throw new Error("usage: elections-live-replay.ts <02202307_MUNI.zip | dir> --out <scratch dir>");
  if (out.startsWith("/srv")) throw new Error("dry run only: --out must not be under /srv");

  const started = Date.now();
  const read = await members(source);
  const files = electionFiles(read.members);
  if (files.type !== CONGRESS) throw new Error(`election type ${files.type}, the replay takes the Congress file (02)`);
  const parsed = parseElection(files);
  const ours = SNAPSHOT.municipalities.map((m) => m.code);
  const towns = read.whole ? ours : ours.filter((code) => parsed.municipalities.has(code));
  const fetchedAt = new Date().toISOString();
  const snapshot = fromInteriorFinal(parsed, towns, {
    source: { adapter: INTERIOR_FINAL_ADAPTER, name: `Resultados por municipio (${files.type}${files.year}${files.month}_MUNI.zip)`, publisher: "Ministerio del Interior", url: source },
    sourceUpdatedAt: `${read.fileDate}T00:00:00+01:00`,
    fetchedAt,
  });

  const previous = await readCurrent(out);
  const problems = [
    ...checkSnapshot(snapshot, { electionDate: parsed.date, chamber: "congress", towns, provinceSeats: PROVINCE_SEATS }),
    ...checkProgress(previous, snapshot),
  ];
  if (problems.length) {
    await writeRefusal(out, fetchedAt, problems);
    console.log(`REFUSED (${problems.length} problems; current files untouched):\n  ${problems.slice(0, 20).join("\n  ")}`);
    process.exitCode = 1;
    return;
  }
  const changed = changedTowns(previous, snapshot);
  const written = await writeVersion(out, snapshot);
  const paths = livePaths(changed);
  console.log(`${parsed.date} Congress, ${Object.keys(snapshot.towns).length} towns, 4 provinces: every check passed`);
  console.log(`  wrote ${out}/v/${written.version} (${written.towns} town files, ${written.bytes} bytes), current -> it; pruned ${written.pruned.length}`);
  console.log(`  ${changed.length} towns changed -> ${paths.paths.length} page URLs to revalidate${paths.unknown.length ? `, ${paths.unknown.length} unknown codes` : ""}`);
  console.log(`  ${Date.now() - started} ms`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
