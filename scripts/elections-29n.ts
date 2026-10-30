/**
 * The 29N slot on the election-results pages (`/ca/eleccions/<slug>/`,
 * `/es/elecciones/<slug>/`, `/en/elections/<slug>/`): imports the Interior
 * Ministry's official results file by municipality for the general election
 * of 29 November 2026 (Congress) into `src/lib/programmatic/elections/snapshot.ts`.
 * Until it is run, every page keeps the honest empty slot.
 *
 *   npm run elections:29n -- import <path-or-url> [--dry-run] [--preview <slug>]
 *   npm run elections:29n -- crosscheck <path-or-url to 02202307_MUNI.zip> [--preview <slug>]
 *   npm run elections:29n -- status
 *
 * `import` writes a `g2026` object to each of the 300 municipalities and a
 * `general2026` block (source, Catalonia's totals and seats, list names) to
 * the snapshot, or writes nothing and says why. Parser and checks:
 * `src/lib/programmatic/elections/interior.ts` (FICHEROS.doc, the format
 * description shipped in every archive). Every check must pass:
 *   - the archive: members named nn02aamm.DAT, one election, CRC-32 intact;
 *     every record the exact length FICHEROS.doc gives, numbers all digits,
 *     election type/year/month equal to the file name's;
 *   - Congress (type 02), polling date 2026-11-29 (file 02);
 *   - every Catalan row marked "Datos oficiales" = S: a file that does not
 *     call its own figures official is never imported;
 *   - complete: each province's municipalities add up to the province row's
 *     population and polling stations;
 *   - counts add up: candidacies = list votes in every municipality and
 *     district; municipalities <= province row (the gap is the vote from
 *     abroad); Catalonia row = the four provinces; seats = each row's total;
 *   - each of the 300 towns present, with voters <= electors;
 *   - names are copied exactly as file 03 writes them; candidacy codes are
 *     mapped to names only through that table.
 * Percentages are never stored: the page computes them from the counts.
 *
 * `crosscheck` runs the same parser and checks on the 2023 file (23 July
 * 2023, the same format) and compares all 300 towns with the Generalitat's
 * open data already in the snapshot (G20231): census, voters, blank, null and
 * every list's votes must match exactly. Verified 30 Oct 2026: 300/300.
 *
 * -------------------------------------------------------------------------
 * ON THE DAY THE 2026 FILE APPEARS (for the lead)
 * -------------------------------------------------------------------------
 * 1. Where to look. Interior publishes the file by municipality after the
 *    general count (escrutinio general), not on election night: the 2023
 *    file's data are dated November 2023 and the archive December 2023.
 *    Open https://infoelectoral.interior.gob.es/es/elecciones-celebradas/area-de-descargas/
 *    in a browser: "Convocatoria" = Congreso, "Fecha" = Noviembre 2026,
 *    "Consultar". Download the row "29 de Noviembre de 2026 (Municipio)":
 *    02202611_MUNI.zip. (The 2023 one, for reference, was
 *    https://infoelectoral.interior.gob.es/estaticos/docxl/apliextr/02202307_MUNI.zip.)
 *    The site sits behind a browser challenge that blocks scripts, so
 *    download it in the browser; do not use any other site or mirror.
 * 2. Try it without writing:
 *      npm run elections:29n -- import ~/Downloads/02202611_MUNI.zip --dry-run --preview sabadell
 *    It prints the checks, Catalonia's turnout and leading lists, and the
 *    Sabadell slot as the page will show it. Compare two or three numbers
 *    with the download area's own tables. Any failure: stop, write nothing,
 *    read the message (it names the file, record and field).
 * 3. Import:
 *      npm run elections:29n -- import ~/Downloads/02202611_MUNI.zip
 *    Then: npm test, npx tsc --noEmit, npm run build. Look at
 *    /ca/eleccions/sabadell/, /es/elecciones/girona/ and /en/elections/salou/
 *    locally (npm run dev): the 29N box shows the table, the Ministry as
 *    source and the file's date.
 * 4. Commit `src/lib/programmatic/elections/snapshot.ts` only, merge to main
 *    and deploy as usual (Vercel builds from main). The pages are cached
 *    until a deploy, so the deploy is what publishes the results; the
 *    sitemap's lastmod moves to the import date.
 * 5. If Interior republishes the file (a correction), run step 2 and 3 again
 *    with the new archive: the import replaces the previous one and prints
 *    what changed.
 * Never: hand-edit the snapshot, type results in, or import anything but the
 * Ministry's own archive. `ELECTION_NIGHT_RESULTS_URL` (model.ts) is a
 * separate thing and stays null unless the Ministry officially announces a
 * public results website.
 */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { basename } from "node:path";

import { renderSnapshotFile, SNAPSHOT_FILE } from "./lib/elections-snapshot-file.ts";
import { readZip } from "./lib/zip.ts";
import {
  buildGeneralImport,
  CONGRESS,
  compareTown,
  decodeAnsi,
  electionFiles,
  generalitatMapping,
  InteriorFileError,
  parseElection,
  type GeneralImport,
} from "../src/lib/programmatic/elections/interior.ts";
import { residents, share, turnout } from "../src/lib/programmatic/elections/results.ts";
import { SNAPSHOT } from "../src/lib/programmatic/elections/snapshot.ts";
import { GENERAL_ELECTION_DAY } from "../src/lib/programmatic/elections/today.ts";
import type { ElectionsSnapshot, General2026, RegionalVotes } from "../src/lib/programmatic/elections/types.ts";

const OFFICIAL_HOST = "infoelectoral.interior.gob.es";
const OFFICIAL_PATH = /^\/estaticos\/docxl\/apliextr\/02\d{6}_MUNI\.zip$/;
const MAX_ARCHIVE_BYTES = 100 * 1024 * 1024;

class Refusal extends Error {}

function refuse(message: string): never {
  throw new Refusal(message);
}

/** Madrid date of the run. */
function madridToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
}

/** The archive's bytes, from a local path or the Ministry's own site (nowhere else). */
async function readArchive(source: string): Promise<{ bytes: Buffer; origin: string }> {
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(source)) {
    const bytes = await readFile(source).catch((error: Error) => refuse(`cannot read ${source}: ${error.message}`));
    if (bytes.length > MAX_ARCHIVE_BYTES) refuse(`${source}: ${bytes.length} bytes, too large for a results archive`);
    return { bytes, origin: source };
  }
  const url = new URL(source);
  if (url.protocol !== "https:" || url.hostname !== OFFICIAL_HOST || !OFFICIAL_PATH.test(url.pathname) || url.search || url.username) {
    refuse(`only the Ministry's own archives are accepted: https://${OFFICIAL_HOST}/estaticos/docxl/apliextr/02aaaamm_MUNI.zip, or a local path`);
  }
  const response = await fetch(url, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; CatalunyaInfo-29N-importer; +https://catalunyainfo.com)" },
    redirect: "error",
    signal: AbortSignal.timeout(180_000),
  }).catch((error: Error) => refuse(`${url.href}: ${error.message}`));
  const type = response.headers.get("content-type") ?? "";
  if (!response.ok || type.includes("text/html")) {
    refuse(
      `${url.href} answered ${response.status} ${type}: the site's browser check blocks scripts. ` +
        "Download the archive in a browser from the download area and pass its path instead.",
    );
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > MAX_ARCHIVE_BYTES) refuse(`${url.href}: ${bytes.length} bytes, too large for a results archive`);
  return { bytes, origin: url.href };
}

interface Opened {
  imported: GeneralImport;
  file: string;
  fileDate: string;
  sha256: string;
  origin: string;
}

/** Reads, parses and checks an archive for the given polling date. */
async function open(source: string, date: string): Promise<Opened> {
  const { bytes, origin } = await readArchive(source);
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const members = readZip(bytes);
  const files = electionFiles(members.map((m) => ({ name: m.name, text: () => decodeAnsi(m.read()) })));
  if (files.type !== CONGRESS) refuse(`the archive is for election type ${files.type}; the 29N slot takes the Congress file (type 02)`);
  const dat = members.filter((m) => /\.DAT$/i.test(m.name));
  const fileDate = dat.map((m) => m.modified).sort().at(-1)!;
  const file = `${files.type}${files.year}${files.month}_MUNI.zip`;
  if (basename(origin) !== file) console.log(`note: ${basename(origin)} holds ${file}; the page cites ${file}`);
  const parsed = parseElection(files);
  const imported = buildGeneralImport(parsed, SNAPSHOT.municipalities.map((m) => m.code), { type: CONGRESS, date });
  return { imported, file, fileDate, sha256, origin };
}

function general2026Of(o: Opened, importedAt: string): General2026 {
  const { imported } = o;
  return {
    date: imported.date,
    source: {
      name: `Resultados por municipio: elecciones al Congreso de los Diputados (${o.file})`,
      publisher: "Ministerio del Interior",
      file: o.file,
      fileDate: o.fileDate,
      sha256: o.sha256,
      importedAt,
    },
    lists: imported.lists,
    catalonia: imported.catalonia,
    cataloniaTotal: imported.cataloniaTotal,
    cataloniaSeats: imported.cataloniaSeats,
  };
}

function withImport(snapshot: ElectionsSnapshot, o: Opened, importedAt: string): ElectionsSnapshot {
  return {
    ...snapshot,
    municipalities: snapshot.municipalities.map((m) => ({ ...m, g2026: o.imported.towns.get(m.code)! })),
    general2026: general2026Of(o, importedAt),
  };
}

const pct = (n: number) => `${n.toFixed(2)} %`;

function summary(o: Opened) {
  const { imported } = o;
  console.log(`${o.file} (${o.origin})`);
  console.log(`  sha256 ${o.sha256}, data files dated up to ${o.fileDate}, polling day ${imported.date}`);
  console.log(`  every check passed; ${imported.towns.size} towns, ${Object.keys(imported.lists).length} candidacies in Catalonia`);
  const cat = imported.catalonia;
  console.log(`  Catalonia without the vote from abroad: turnout ${pct(turnout(cat))} (${cat.voters} of ${cat.electorate})`);
  console.log(`  Catalonia, file row with the vote from abroad: turnout ${pct(turnout(imported.cataloniaTotal))}`);
  const top = Object.entries(cat.votes).sort((a, b) => b[1] - a[1]).slice(0, 8);
  for (const [code, n] of top) {
    const list = imported.lists[code];
    console.log(`    ${list?.short ?? code}: ${n} (${pct(share(n, cat.validVotes))}), ${imported.cataloniaSeats[code] ?? 0} seats`);
  }
}

async function preview(snapshot: ElectionsSnapshot, slug: string | undefined) {
  if (!slug) return;
  const m = snapshot.municipalities.find((x) => x.slug === slug);
  if (!m) refuse(`--preview: no municipality ${slug}`);
  const { buildElectionPage } = await import("../src/lib/programmatic/elections/model.ts");
  const slot = buildElectionPage(m, "ca", snapshot).slot;
  console.log(`\npreview, /ca/eleccions/${slug}/ (${slot.title}):`);
  if (!slot.results) refuse("preview: the slot shows no results");
  console.log(`  ${slot.results.summary}`);
  console.log(`  ${slot.results.table.headers.join(" | ")}`);
  for (const row of [...slot.results.table.rows, ...slot.results.table.footRows]) console.log(`  ${row.map((cell) => cell.replace("\n", " · ")).join(" | ")}`);
  console.log(`  ${slot.results.table.note}`);
  for (const line of slot.md) console.log(`  ${line}`);
}

function changes(before: RegionalVotes | undefined, after: RegionalVotes): string | null {
  if (!before) return null;
  const fields = (["electorate", "voters", "nullVotes", "blankVotes", "listVotes"] as const).filter((f) => before[f] !== after[f]);
  const lists = [...new Set([...Object.keys(before.votes), ...Object.keys(after.votes)])].filter((c) => before.votes[c] !== after.votes[c]);
  return fields.length || lists.length ? [...fields, ...lists.map((c) => `list ${c}`)].join(", ") : null;
}

async function runImport(source: string, dryRun: boolean, previewSlug: string | undefined) {
  const opened = await open(source, GENERAL_ELECTION_DAY);
  summary(opened);
  const next = withImport(SNAPSHOT, opened, madridToday());
  if (SNAPSHOT.general2026) {
    const changed = SNAPSHOT.municipalities.map((m, i) => [m.name, changes(m.g2026, next.municipalities[i]!.g2026!)] as const).filter(([, c]) => c);
    console.log(`replacing the import of ${SNAPSHOT.general2026.source.file} (sha256 ${SNAPSHOT.general2026.source.sha256.slice(0, 12)}…, ${SNAPSHOT.general2026.source.importedAt}): ${changed.length} towns change`);
    for (const [name, c] of changed.slice(0, 20)) console.log(`    ${name}: ${c}`);
  }
  await preview(next, previewSlug);
  if (dryRun) {
    console.log("\ndry run: nothing written");
    return;
  }
  await writeFile(SNAPSHOT_FILE, renderSnapshotFile(next), "utf8");
  console.log(`\nwrote ${SNAPSHOT_FILE}: 29N results for ${opened.imported.towns.size} municipalities`);
}

/** The 2023 file against the Generalitat's open data in the snapshot: every town must match exactly. */
async function runCrosscheck(source: string, previewSlug: string | undefined) {
  const opened = await open(source, SNAPSHOT.elections.congress.date);
  summary(opened);
  const { imported } = opened;
  const gen = SNAPSHOT.catalonia.congress;
  const genLists = SNAPSHOT.elections.congress.lists ?? {};
  const mapping = generalitatMapping(imported.catalonia, imported.lists, residents(gen), genLists);
  console.log(`\nInterior regional code -> Generalitat list code (by Catalonia's resident vote, abbreviations agree):`);
  for (const [code, target] of mapping) console.log(`    ${code} ${imported.lists[code]?.short} -> ${target}`);
  const problems: string[] = [];
  // Catalonia, both bases, and the seats.
  const cataloniaAll = compareTown({ ...imported.cataloniaTotal }, Object.fromEntries(Object.keys(imported.cataloniaTotal.votes).map((c) => [c, { short: "", name: "", regional: c }])), mapping, gen.total);
  const cataloniaResidents = compareTown({ ...imported.catalonia }, Object.fromEntries(Object.keys(imported.catalonia.votes).map((c) => [c, { short: "", name: "", regional: c }])), mapping, residents(gen));
  problems.push(...cataloniaAll.map((p) => `Catalonia (with abroad): ${p}`), ...cataloniaResidents.map((p) => `Catalonia (residents): ${p}`));
  for (const [code, seats] of Object.entries(imported.cataloniaSeats)) {
    if ((gen.seats[mapping.get(code) ?? ""] ?? 0) !== seats) problems.push(`seats ${code}: Interior ${seats}, Generalitat ${gen.seats[mapping.get(code) ?? ""]}`);
  }
  let matched = 0;
  for (const m of SNAPSHOT.municipalities) {
    const diff = compareTown(imported.towns.get(m.code)!, imported.lists, mapping, m.congress);
    if (diff.length) problems.push(...diff.map((d) => `${m.name}: ${d}`));
    else matched++;
  }
  for (const slug of ["barcelona", "sabadell", "girona", "lleida", "salou", "vielha-e-mijaran", "castellet-i-la-gornal"]) {
    const m = SNAPSHOT.municipalities.find((x) => x.slug === slug)!;
    const t = imported.towns.get(m.code)!;
    console.log(`    ${m.name}: census ${t.electorate}, voters ${t.voters}, blank ${t.blankVotes}, null ${t.nullVotes}, lists ${t.listVotes} | Generalitat ${m.congress.electorate}, ${m.congress.voters}, ${m.congress.blankVotes}, ${m.congress.nullVotes}, ${m.congress.listVotes}`);
  }
  console.log(`\n${matched}/${SNAPSHOT.municipalities.length} towns match the Generalitat's G20231 data exactly; Catalonia totals and seats ${cataloniaAll.length + cataloniaResidents.length === 0 ? "match" : "differ"}`);
  await preview(withImport(SNAPSHOT, opened, madridToday()), previewSlug);
  if (problems.length) {
    for (const p of problems.slice(0, 40)) console.error(`  MISMATCH ${p}`);
    process.exitCode = 1;
  }
}

function status() {
  const g = SNAPSHOT.general2026;
  if (!g) {
    console.log("29N slot: empty (no file imported). The pages say the results will appear when the Ministry publishes its file.");
    return;
  }
  const missing = SNAPSHOT.municipalities.filter((m) => !m.g2026).length;
  console.log(`29N slot: ${g.source.file}, data files dated ${g.source.fileDate}, imported ${g.source.importedAt}, sha256 ${g.source.sha256}`);
  console.log(`  ${SNAPSHOT.municipalities.length - missing}/${SNAPSHOT.municipalities.length} towns with results`);
}

async function main() {
  const [command, source] = process.argv.slice(2).filter((a, i, all) => !a.startsWith("--") && all[i - 1] !== "--preview");
  const flag = (name: string) => process.argv.includes(name);
  const previewSlug = flag("--preview") ? process.argv[process.argv.indexOf("--preview") + 1] : undefined;
  if (command === "status") return status();
  if ((command === "import" || command === "crosscheck") && source) {
    return command === "import" ? runImport(source, flag("--dry-run"), previewSlug) : runCrosscheck(source, previewSlug);
  }
  console.error("usage: npm run elections:29n -- import <path-or-url> [--dry-run] [--preview <slug>]\n       npm run elections:29n -- crosscheck <02202307_MUNI.zip> [--preview <slug>]\n       npm run elections:29n -- status");
  process.exitCode = 2;
}

try {
  await main();
} catch (error) {
  if (error instanceof Refusal || error instanceof InteriorFileError || (error as Error).name === "ZipError") {
    console.error(`\nREFUSED, nothing written: ${(error as Error).message}`);
    process.exitCode = 1;
  } else {
    throw error;
  }
}
