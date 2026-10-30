/**
 * The 29N importer: the Interior Ministry's results file by municipality.
 *
 * Fixture: `tests/fixtures/interior/02202307/`, cut byte for byte from the
 * official 02202307_MUNI.zip (Congress, 23 July 2023), downloaded from
 * infoelectoral.interior.gob.es's download area on 30 Oct 2026 (sha256
 * 08cc98de85fa91f3e808705b9cb1886f63a78997b3563a106f5bedb213aee420): files
 * 01 and 02 whole; the rows of 05 and 06 for seven towns (Barcelona with its
 * ten districts, Sabadell, Girona, Lleida, Salou, Vielha e Mijaran and
 * Castellet i la Gornal); the Catalan rows of 07 and 08; and the rows of 03
 * those reference. File 04 (candidates' personal data) is left out.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { crc32, deflateRawSync } from "node:zlib";

import { carryGeneral2026, renderSnapshotFile, SNAPSHOT_FILE } from "../scripts/lib/elections-snapshot-file.ts";
import { dosDate, readZip } from "../scripts/lib/zip.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import {
  buildGeneralImport,
  checkCatalonia,
  compareTown,
  countsOf,
  decodeAnsi,
  electionFiles,
  InteriorFileError,
  LAYOUT,
  parseElection,
  RECORD_LENGTH,
  records,
  townResult,
  type FileType,
  type ParsedElection,
} from "../src/lib/programmatic/elections/interior.ts";
import { ELECTION_NIGHT_RESULTS_URL, buildElectionPage } from "../src/lib/programmatic/elections/model.ts";
import { electionsStaticParams, latestDataDate, municipalitiesFor, resolveElectionPage } from "../src/lib/programmatic/elections/pages.ts";
import { generalView, residents, share } from "../src/lib/programmatic/elections/results.ts";
import { SNAPSHOT } from "../src/lib/programmatic/elections/snapshot.ts";
import type { ElectionsSnapshot, General2026, InteriorList, Municipality } from "../src/lib/programmatic/elections/types.ts";

const FIXTURE = join(import.meta.dirname, "fixtures", "interior", "02202307");
const TOWNS = { barcelona: "08019", sabadell: "08187", girona: "17079", lleida: "25120", salou: "43905", "vielha-e-mijaran": "25243", "castellet-i-la-gornal": "08058" } as const;

/** The fixture's members, optionally edited as decoded text. */
function fixture(edit?: (name: string, text: string) => string, only?: (name: string) => boolean) {
  return readdirSync(FIXTURE)
    .filter((name) => !only || only(name))
    .map((name) => ({
      name,
      text: () => {
        const text = decodeAnsi(readFileSync(join(FIXTURE, name)));
        return edit ? edit(name, text) : text;
      },
    }));
}

const parseFixture = (edit?: (name: string, text: string) => string): ParsedElection => parseElection(electionFiles(fixture(edit)));

/** Replaces columns start-end (1-based, inclusive) of the lines `pick` selects. */
function setColumns(text: string, pick: (line: string) => boolean, start: number, end: number, value: string): string {
  assert.equal(value.length, end - start + 1, "same width");
  let hits = 0;
  const out = text.replace(/[^\n]+/g, (line) => {
    if (!pick(line)) return line;
    hits++;
    return line.slice(0, start - 1) + value + line.slice(end);
  });
  assert.ok(hits > 0, "the edit hit a record");
  return out;
}

const refuses = (fn: () => unknown, message: RegExp) => assert.throws(fn, (error: unknown) => error instanceof InteriorFileError && message.test(error.message));

/** The committed snapshot without any 29N data, whether or not the import has run. */
const BASE: ElectionsSnapshot = {
  ...SNAPSHOT,
  general2026: undefined,
  municipalities: SNAPSHOT.municipalities.map((m) => ({ ...m, g2026: undefined })),
};

const bySlug = (slug: string, snapshot: ElectionsSnapshot = BASE): Municipality => {
  const found = snapshot.municipalities.find((m) => m.slug === slug);
  assert.ok(found, slug);
  return found;
};

/* -------------------------------------------------------------------------- */
/* The fixture is the official file, byte for byte                             */
/* -------------------------------------------------------------------------- */

test("the fixture keeps the official format: record lengths, LF endings, ANSI text, one election", () => {
  for (const name of readdirSync(FIXTURE)) {
    const bytes = readFileSync(join(FIXTURE, name));
    assert.ok(!bytes.includes(0x0d), `${name}: LF only, as the 2023 archive ships`);
    const fileType = name.slice(0, 2) as FileType;
    for (const line of records(decodeAnsi(bytes))) assert.equal(line.length, RECORD_LENGTH[fileType], `${name}: record length`);
  }
  assert.ok(!readdirSync(FIXTURE).some((name) => name.startsWith("04")), "no candidates' personal data");
  // Every field of the layout lies inside its record.
  for (const [fileType, layout] of Object.entries(LAYOUT)) {
    for (const [field, [start, end]] of Object.entries(layout)) assert.ok(start >= 1 && end <= RECORD_LENGTH[fileType as FileType] && start <= end, `${fileType}.${field}`);
  }
});

/* -------------------------------------------------------------------------- */
/* Parser                                                                     */
/* -------------------------------------------------------------------------- */

test("parser: the 2023 file's identification, candidacies and town totals, exactly as published", () => {
  const p = parseFixture();
  assert.equal(p.type, "02");
  assert.equal(p.date, "2023-07-23");
  assert.equal(p.municipalities.size, 7, "district rows are not municipalities");
  // Names verbatim from file 03, accents decoded from ANSI.
  assert.deepEqual({ ...p.candidacies.get("000047") }, { code: "000047", short: "PSC", name: "PARTIT DELS SOCIALISTES DE CATALUNYA (PSC-PSOE)", provincial: "000047", regional: "000047", national: "000002" });
  assert.equal(p.candidacies.get("000055")?.name, "PARTIT DEMÒCRATA EUROPEU CATALÀ-ESPAI CIU");
  assert.equal(p.candidacies.get("000051")?.name, "SUMAR - EN COMÚ PODEM");
  // PP stood under two codes, added up in Catalonia under the regional one.
  assert.equal(p.candidacies.get("000048")?.name, "PARTIDO POPULAR / PARTIT POPULAR");
  assert.equal(p.candidacies.get("000048")?.regional, "000056");
  assert.equal(p.candidacies.get("000056")?.name, "PARTIT POPULAR / PARTIDO POPULAR");
  const sabadell = p.municipalities.get(TOWNS.sabadell)!;
  assert.deepEqual(
    { name: sabadell.name, region: sabadell.region, official: sabadell.official, population: sabadell.population, stations: sabadell.stations, electorate: sabadell.electorate, blank: sabadell.blankVotes, null: sabadell.nullVotes, lists: sabadell.listVotes },
    { name: "Sabadell", region: "09", official: "S", population: 215760, stations: 247, electorate: 155301, blank: 901, null: 874, lists: 101266 },
  );
  assert.deepEqual(countsOf(sabadell), { electorate: 155301, voters: 103041, nullVotes: 874, blankVotes: 901, listVotes: 101266, validVotes: 102167 });
  assert.equal(sabadell.votes["000047"], 39729);
  assert.equal(Object.keys(sabadell.votes).length, 12);
  assert.equal(p.municipalities.get(TOWNS.barcelona)?.name, "Barcelona");
  // Files 07 and 08: Catalonia and its provinces, seats included.
  const cat = p.areas!.find((a) => a.province === "99")!;
  assert.deepEqual([cat.name, cat.electorate, cat.seats, cat.votes["000047"], cat.seatsByList["000047"]], ["Cataluña", 5703784, 48, 1221335, 19]);
});

test("parser: CR+LF (what FICHEROS.doc describes) and LF (what 2023 shipped) give the same result", () => {
  const lf = parseFixture();
  const crlf = parseFixture((_, text) => text.replace(/\n/g, "\r\n"));
  assert.deepEqual([...crlf.municipalities.values()], [...lf.municipalities.values()]);
  assert.deepEqual([...crlf.candidacies.values()], [...lf.candidacies.values()]);
});

test("parser: Barcelona's ten districts add up to its total row, field by field and list by list", () => {
  const text = decodeAnsi(readFileSync(join(FIXTURE, "05022307.DAT")));
  assert.equal(records(text).filter((line) => line.slice(11, 16) === TOWNS.barcelona && line.slice(16, 18) !== "99").length, 10);
  // A district edited by one vote no longer adds up: refused.
  refuses(
    () => parseFixture((name, t) => (name.startsWith("06") ? setColumns(t, (l) => l.slice(9, 16) === "0801901" && l.slice(16, 22) === "000047", 23, 30, "00000001") : t)),
    /districts give candidacy 000047/,
  );
  refuses(
    () => parseFixture((name, t) => (name.startsWith("05") ? setColumns(t, (l) => l.slice(11, 18) === "0801901", 190, 197, "00000000") : t)),
    /08019 districts add up to .* blankVotes/,
  );
});

test("parser refuses a malformed file: length, digits, dates, unknown codes, duplicates, missing files", () => {
  refuses(() => parseFixture((name, t) => (name.startsWith("06") ? t.replace(/\n/, "X\n") : t)), /34 characters, file 06 records have 33/);
  refuses(() => parseFixture((name, t) => (name.startsWith("06") ? setColumns(t, (l) => l.slice(9, 14) === TOWNS.sabadell && l.slice(16, 22) === "000006", 23, 30, "0000842A") : t)), /votes .* is not a number/);
  refuses(() => parseFixture((name, t) => (name.startsWith("05") ? setColumns(t, (l) => l.slice(11, 16) === TOWNS.salou, 3, 6, "2022") : t)), /record is for 02\/2022-07, the file name says 02\/2023-07/);
  refuses(() => parseFixture((name, t) => (name.startsWith("06") ? setColumns(t, (l) => l.slice(9, 14) === TOWNS.salou && l.slice(16, 22) === "000006", 17, 22, "000999") : t)), /candidacy 000999 is not in 03022307\.DAT/);
  refuses(() => parseFixture((name, t) => (name.startsWith("06") ? `${t}${records(t).find((l) => l.slice(9, 16) === "0818799")}\n` : t)), /08187 has candidacy .* twice/);
  refuses(() => parseFixture((name, t) => (name.startsWith("02") ? setColumns(t, () => true, 15, 16, "08") : t)), /polling date 2023-08-23 is not in 2023-07/);
  refuses(() => parseElection(electionFiles(fixture(undefined, (name) => !name.startsWith("06")))), /06022307\.DAT is missing/);
  refuses(() => electionFiles([...fixture(), { name: "05032307.DAT", text: () => "" }]), /mixes elections/);
  refuses(() => electionFiles([...fixture(), { name: "13022307.DAT", text: () => "" }]), /unexpected file/);
  refuses(() => electionFiles([{ name: "FICHEROS.doc", text: () => "" }]), /no \.DAT files/);
  // The control file flags 07 as part of the election; an archive with 07 but a control saying otherwise is refused.
  refuses(() => parseFixture((name, t) => (name.startsWith("01") ? setColumns(t, () => true, 16, 16, "0") : t)), /07022307\.DAT is in the archive but 01022307\.DAT says/);
});

/* -------------------------------------------------------------------------- */
/* Cross-check: the parser against the Generalitat's open data                 */
/* -------------------------------------------------------------------------- */

/**
 * Interior regional code -> Generalitat list code, as `npm run elections:29n
 * -- crosscheck` derived it from the full 2023 file on 30 Oct 2026 (each
 * code's Catalonia resident vote matches exactly one Generalitat list). The
 * same run matched all 300 towns, Catalonia's totals and its 48 seats.
 */
const MAPPING = new Map([
  ["000001", "1134"],
  ["000006", "693"],
  ["000009", "697"],
  ["000047", "6"],
  ["000056", "86"],
  ["000050", "10"],
  ["000051", "1135"],
  ["000053", "1109"],
  ["000054", "1034"],
  ["000055", "1136"],
  ["000057", "1031"],
  ["000058", "1129"],
  ["000059", "643"],
  ["000060", "1137"],
  ["000061", "1138"],
]);

function fixtureLists(p: ParsedElection): Record<string, InteriorList> {
  return Object.fromEntries([...p.candidacies.values()].map((c) => [c.code, { short: c.short, name: c.name, regional: c.regional }]));
}

test("cross-check: seven towns from Interior's file match the Generalitat's open data exactly", () => {
  const p = parseFixture();
  const lists = fixtureLists(p);
  const genLabels = SNAPSHOT.elections.congress.lists ?? {};
  // The mapping is not a guess: both sources write the same abbreviation.
  for (const [interior, generalitat] of MAPPING) assert.equal(lists[interior]?.short.toUpperCase(), genLabels[generalitat]?.short.toUpperCase(), interior);
  for (const [slug, code] of Object.entries(TOWNS)) {
    const m = bySlug(slug);
    assert.equal(m.code, code);
    const town = townResult(p, code);
    assert.deepEqual(compareTown(town, lists, MAPPING, m.congress), [], slug);
  }
  // The same figures the existing known-answer tests hold (read from the Generalitat on 27 Oct 2026).
  const sabadell = townResult(p, TOWNS.sabadell);
  assert.deepEqual([sabadell.electorate, sabadell.voters, sabadell.validVotes, sabadell.votes["000047"]], [155301, 103041, 102167, 39729]);
  const barcelona = townResult(p, TOWNS.barcelona);
  assert.deepEqual([barcelona.electorate, barcelona.voters, barcelona.validVotes, barcelona.votes["000047"]], [1084347, 730726, 726293, 241003]);
  // A one-vote difference is caught.
  const off = { ...sabadell, votes: { ...sabadell.votes, "000006": sabadell.votes["000006"]! + 1 } };
  assert.deepEqual(compareTown(off, lists, MAPPING, bySlug("sabadell").congress), ["list 693: 8430 against 8429"]);
  // The file's Catalonia row (vote from abroad included) and seats match the Generalitat's too.
  const cat = p.areas!.find((a) => a.province === "99")!;
  const regional = Object.fromEntries(Object.keys(cat.votes).map((c) => [c, { short: "", name: "", regional: c }]));
  assert.deepEqual(compareTown({ ...countsOf(cat), votes: cat.votes }, regional, MAPPING, SNAPSHOT.catalonia.congress.total), []);
  for (const [code, seats] of Object.entries(cat.seatsByList)) assert.equal(SNAPSHOT.catalonia.congress.seats[MAPPING.get(code)!] ?? 0, seats, code);
});

/* -------------------------------------------------------------------------- */
/* Import checks: refusals                                                     */
/* -------------------------------------------------------------------------- */

const SLOT_DAY = { type: "02", date: "2026-11-29" };
const codes = Object.values(TOWNS);

test("import refuses the 2023 file for the 29N slot, and a file cut down to a few towns", () => {
  const p = parseFixture();
  refuses(() => buildGeneralImport(p, codes, SLOT_DAY), /the file is for the election of 2023-07-23; this slot is for 2026-11-29/);
  refuses(() => buildGeneralImport(p, codes, { type: "03", date: "2023-07-23" }), /election type 02; expected 03/);
  // Right date, but seven towns cannot add up to the provinces: incomplete.
  refuses(() => buildGeneralImport(p, codes, { type: "02", date: "2023-07-23" }), /Barcelona: its 3 municipalities add up to .* population, the province row says 5727615; the file is incomplete/);
});

test("import refuses figures the file does not mark as official, and counts that do not add up", () => {
  const notOfficial = parseFixture((name, t) => (name.startsWith("05") ? setColumns(t, (l) => l.slice(11, 18) === "0818799", 233, 233, "N") : t));
  refuses(() => checkCatalonia(notOfficial), /1 Catalan municipalities are not marked as official data \("Datos oficiales" = N\), e\.g\. 08187 Sabadell/);
  refuses(() => townResult(notOfficial, TOWNS.sabadell), /not marked as official data/);
  const sevenRows = parseFixture((name, t) => (name.startsWith("07") ? setColumns(t, (l) => l.slice(11, 13) === "99", 172, 172, "N") : t));
  refuses(() => checkCatalonia(sevenRows), /Cataluña is not marked as official data/);
  // Sabadell's lists edited by one vote: they no longer add up to its list-vote total.
  const offByOne = parseFixture((name, t) => (name.startsWith("06") ? setColumns(t, (l) => l.slice(9, 16) === "0818799" && l.slice(16, 22) === "000006", 23, 30, "00008430") : t));
  refuses(() => checkCatalonia(offByOne), /08187 Sabadell: candidacies add up to 101267, the list-vote total \(file 05\) is 101266/);
  refuses(() => townResult(offByOne, TOWNS.sabadell), /candidacies add up to 101267/);
  // More voters than electors.
  const tooMany = parseFixture((name, t) => (name.startsWith("05") ? setColumns(t, (l) => l.slice(11, 18) === "0805899", 150, 157, "00001000") : t));
  refuses(() => townResult(tooMany, TOWNS["castellet-i-la-gornal"]), /1232 voters for 1000 electors/);
  // Outside the file or outside Catalonia.
  refuses(() => townResult(parseFixture(), "08101"), /municipality 08101 is not in file 05/);
  // Text decoded from the wrong character set (a C1 control from byte 0x81).
  refuses(() => parseFixture((name, t) => (name.startsWith("03") ? setColumns(t, (l) => l.slice(8, 14) === "000006", 15, 17, "V\u0081X") : t)), /candidacy 000006: .* is damaged/);
  refuses(() => parseFixture((name, t) => (name.startsWith("05") ? setColumns(t, (l) => l.slice(11, 18) === "0818799", 19, 21, "S�b") : t)), /municipality name .* is damaged/);
});

/**
 * A complete, consistent miniature of the file (four Catalan municipalities,
 * one per province, one outside Catalonia, CERA in the province rows), so the
 * Catalonia-wide checks can be exercised one rule at a time.
 */
interface Mini {
  towns: { code: string; region: string; population: number; stations: number; electorate: number; blank: number; null: number; votes: Record<string, number>; official?: string }[];
  provinces: { province: string; extra: { electorate: number; blank: number; null: number; votes: Record<string, number> }; seats: Record<string, number> }[];
  catalonia?: { votes?: Record<string, number>; seats?: Record<string, number>; electorate?: number };
}

const CANDIDACIES = [
  { code: "000001", short: "AAA", name: "CANDIDATURA A", regional: "000001" },
  { code: "000002", short: "BBB", name: "CANDIDATURA B", regional: "000002" },
  { code: "000003", short: "BBB", name: "CANDIDATURA B (GIRONA)", regional: "000002" },
];

function mini(): Mini {
  return {
    towns: [
      { code: "08001", region: "09", population: 1000, stations: 3, electorate: 800, blank: 2, null: 1, votes: { "000001": 300, "000002": 200 } },
      { code: "17001", region: "09", population: 500, stations: 2, electorate: 400, blank: 1, null: 1, votes: { "000001": 150, "000003": 100 } },
      { code: "25001", region: "09", population: 300, stations: 1, electorate: 250, blank: 0, null: 2, votes: { "000001": 60, "000002": 90 } },
      { code: "43001", region: "09", population: 400, stations: 1, electorate: 300, blank: 1, null: 0, votes: { "000001": 100, "000002": 80 } },
      { code: "28079", region: "12", population: 9000, stations: 9, electorate: 7000, blank: 5, null: 5, votes: { "000001": 4000 } },
    ],
    provinces: [
      { province: "08", extra: { electorate: 90, blank: 0, null: 1, votes: { "000001": 4, "000002": 3 } }, seats: { "000001": 1, "000002": 1 } },
      { province: "17", extra: { electorate: 10, blank: 0, null: 0, votes: { "000001": 1, "000003": 0 } }, seats: { "000001": 1, "000003": 0 } },
      { province: "25", extra: { electorate: 5, blank: 0, null: 0, votes: { "000001": 0, "000002": 1 } }, seats: { "000001": 0, "000002": 1 } },
      { province: "43", extra: { electorate: 5, blank: 1, null: 0, votes: { "000001": 1, "000002": 0 } }, seats: { "000001": 1, "000002": 0 } },
    ],
  };
}

const field = (value: string | number, width: number) => (typeof value === "number" ? String(value).padStart(width, "0") : value.padEnd(width, " "));

function line(fileType: FileType, values: Record<string, string | number>): string {
  const chars = "0".repeat(RECORD_LENGTH[fileType]).split("");
  for (const [name, [start, end]] of Object.entries(LAYOUT[fileType] as Record<string, readonly [number, number]>)) {
    const value = values[name];
    if (value === undefined) continue;
    const text = field(value, end - start + 1);
    assert.equal(text.length, end - start + 1, `${fileType}.${name}`);
    for (let i = 0; i < text.length; i++) chars[start - 1 + i] = text[i]!;
  }
  return chars.join("");
}

function miniFiles(m: Mini): ParsedElection {
  const head = { type: "02", year: "2026", month: "11", round: "1" };
  const sum = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0);
  const l05 = m.towns.map((t) =>
    line("05", { ...head, region: t.region, province: t.code.slice(0, 2), municipality: t.code.slice(2), district: "99", name: `Town ${t.code}`, constituency: 0, population: t.population, stations: t.stations, ineRoll: t.electorate, electorate: t.electorate, blankVotes: t.blank, nullVotes: t.null, listVotes: sum(t.votes), official: t.official ?? "S" }),
  );
  const l06 = m.towns.flatMap((t) => Object.entries(t.votes).map(([code, votes]) => line("06", { ...head, province: t.code.slice(0, 2), municipality: t.code.slice(2), district: "99", code, votes, seats: 0 })));
  const area = (province: string, name: string, totals: { population: number; stations: number; electorate: number; blank: number; null: number; votes: Record<string, number> }, seats: number) =>
    line("07", { ...head, region: "09", province, constituency: 9, name, population: totals.population, stations: totals.stations, ineRoll: totals.electorate, electorate: totals.electorate, blankVotes: totals.blank, nullVotes: totals.null, listVotes: sum(totals.votes), seats, official: "S" });
  const provinceTotals = m.provinces.map((p) => {
    const own = m.towns.filter((t) => t.region === "09" && t.code.startsWith(p.province));
    const votes: Record<string, number> = { ...p.extra.votes };
    for (const t of own) for (const [code, n] of Object.entries(t.votes)) votes[code] = (votes[code] ?? 0) + n;
    return {
      p,
      totals: {
        population: own.reduce((a, t) => a + t.population, 0),
        stations: own.reduce((a, t) => a + t.stations, 0),
        electorate: own.reduce((a, t) => a + t.electorate, 0) + p.extra.electorate,
        blank: own.reduce((a, t) => a + t.blank, 0) + p.extra.blank,
        null: own.reduce((a, t) => a + t.null, 0) + p.extra.null,
        votes,
      },
    };
  });
  const regionalOf = (code: string) => CANDIDACIES.find((c) => c.code === code)!.regional;
  const catVotes: Record<string, number> = {};
  const catSeats: Record<string, number> = {};
  for (const { p, totals } of provinceTotals) {
    for (const [code, n] of Object.entries(totals.votes)) catVotes[regionalOf(code)] = (catVotes[regionalOf(code)] ?? 0) + n;
    for (const [code, n] of Object.entries(p.seats)) catSeats[regionalOf(code)] = (catSeats[regionalOf(code)] ?? 0) + n;
  }
  const votes = m.catalonia?.votes ?? catVotes;
  const seats = m.catalonia?.seats ?? catSeats;
  const add = (key: "population" | "stations" | "electorate" | "blank" | "null") => provinceTotals.reduce((a, x) => a + x.totals[key], 0);
  const catTotals = { population: add("population"), stations: add("stations"), electorate: m.catalonia?.electorate ?? add("electorate"), blank: add("blank"), null: add("null"), votes };
  const l07 = [...provinceTotals.map(({ p, totals }) => area(p.province, `Province ${p.province}`, totals, sum(p.seats))), area("99", "Cataluña", catTotals, sum(seats))];
  const l08 = [
    ...provinceTotals.flatMap(({ p, totals }) => Object.entries(totals.votes).map(([code, n]) => line("08", { ...head, region: "09", province: p.province, constituency: 9, code, votes: n, seats: p.seats[code] ?? 0 }))),
    ...Object.entries(votes).map(([code, n]) => line("08", { ...head, region: "09", province: "99", constituency: 9, code, votes: n, seats: seats[code] ?? 0 })),
  ];
  const text: Record<string, string> = {
    "01": "0220261111111111111000000",
    "02": "022026111N992911202609:0020:0014:0018:00",
    "03": CANDIDACIES.map((c) => line("03", { type: "02", year: "2026", month: "11", code: c.code, short: c.short, name: c.name, provincial: c.code, regional: c.regional, national: c.regional })).join("\n"),
    "05": l05.join("\n"),
    "06": l06.join("\n"),
    "07": l07.join("\n"),
    "08": l08.join("\n"),
  };
  return parseElection(electionFiles(Object.entries(text).map(([type, body]) => ({ name: `${type}022611.DAT`, text: () => `${body}\n` }))));
}

test("import: a complete, consistent file passes, with Catalonia's residents, total and seats", () => {
  const imported = buildGeneralImport(miniFiles(mini()), ["08001", "43001"], SLOT_DAY);
  assert.equal(imported.date, "2026-11-29");
  assert.deepEqual(imported.catalonia.votes, { "000001": 610, "000002": 470 }, "by regional code: B stood as 000003 in Girona");
  assert.equal(imported.catalonia.electorate, 1750);
  assert.equal(imported.cataloniaTotal.electorate, 1750 + 110, "the Catalonia row includes the vote from abroad");
  assert.deepEqual(imported.cataloniaTotal.votes, { "000001": 616, "000002": 474 });
  assert.deepEqual(imported.cataloniaSeats, { "000001": 3, "000002": 2 });
  assert.deepEqual(imported.lists["000003"], { short: "BBB", name: "CANDIDATURA B (GIRONA)", regional: "000002" });
  assert.deepEqual(imported.towns.get("08001"), { electorate: 800, voters: 503, nullVotes: 1, blankVotes: 2, listVotes: 500, validVotes: 502, votes: { "000001": 300, "000002": 200 } });
  assert.equal(imported.towns.size, 2);
});

/**
 * Tranche 3: the importer asks the file for every municipality in the
 * snapshot, 947 of them. A complete, consistent file (built with the same
 * writer as above) holding all 947 under their INE codes must import every
 * one, and the slot must render in a town of each kind: open lists,
 * concejo abierto, a D'Hondt town with a drawn seat, and the largest.
 * (The real 2023 archive, 02202307_MUNI.zip, was run through the same code
 * with `npm run elections:29n -- crosscheck` on 30 Oct 2026: 947/947 towns
 * equal to the Generalitat's data, Catalonia's totals and 48 seats too.)
 */
function everyTown(): Mini {
  return {
    towns: BASE.municipalities.map((m) => {
      const list = m.congress.listVotes;
      const girona = m.code.startsWith("17");
      return {
        code: m.code,
        region: "09",
        population: m.population,
        stations: 1,
        electorate: m.congress.electorate,
        blank: m.congress.blankVotes,
        null: m.congress.nullVotes,
        votes: { "000001": Math.ceil(list / 2), [girona ? "000003" : "000002"]: Math.floor(list / 2) },
      };
    }),
    provinces: mini().provinces,
  };
}

test("import: a complete file with all 947 municipalities imports every one, and each kind of council renders the slot", () => {
  const codes = BASE.municipalities.map((m) => m.code);
  assert.equal(codes.length, 947);
  const parsed = miniFiles(everyTown());
  const imported = buildGeneralImport(parsed, codes, SLOT_DAY);
  assert.equal(imported.towns.size, 947);
  for (const m of BASE.municipalities) {
    const town = imported.towns.get(m.code)!;
    assert.deepEqual([town.electorate, town.voters, town.validVotes, town.listVotes], [m.congress.electorate, m.congress.voters, m.congress.validVotes, m.congress.listVotes], m.slug);
  }
  // The same file read into a snapshot, as `npm run elections:29n -- import` writes it.
  const snap: ElectionsSnapshot = {
    ...BASE,
    municipalities: BASE.municipalities.map((m) => ({ ...m, g2026: imported.towns.get(m.code)! })),
    general2026: {
      date: imported.date,
      source: { name: "Resultados por municipio (test)", publisher: "Ministerio del Interior", file: "02202611_MUNI.zip", fileDate: "2026-12-10", sha256: "0".repeat(64), importedAt: "2026-12-14" },
      lists: imported.lists,
      catalonia: imported.catalonia,
      cataloniaTotal: imported.cataloniaTotal,
      cataloniaSeats: imported.cataloniaSeats,
    },
  };
  // Carried over a Generalitat refresh of the same 947 towns, nothing dropped.
  assert.equal(carryGeneral2026(snap, BASE).municipalities.filter((m) => m.g2026).length, 947);
  for (const slug of ["sant-jaume-de-frontanya", "argencola", "la-floresta", "gisclareny", "rasquera", "barcelona"]) {
    const m = snap.municipalities.find((x) => x.slug === slug)!;
    for (const locale of ["ca", "es"] as const) {
      const model = buildElectionPage(m, locale, snap);
      assert.ok(model.slot.results, `${locale}/${slug}: the slot shows results`);
      assert.equal(model.turnout.table.rows.length, 4, `${locale}/${slug}: four elections`);
      assert.doesNotMatch(JSON.stringify(model), /\$\{|undefined|NaN|\[object/, `${locale}/${slug}`);
    }
  }
  // Every town's slot adds up.
  for (const m of snap.municipalities) {
    const view = generalView(m.g2026!, snap.general2026!);
    const total = view.rows.reduce((a, r) => a + r.share, 0) + view.blank.share;
    assert.ok(Math.abs(total - 100) < 1e-9, `${m.slug}: shares sum to ${total}`);
  }
  // A town missing from the file is refused, not skipped.
  const short = { ...parsed, municipalities: new Map([...parsed.municipalities].filter(([code]) => code !== "08093")) };
  refuses(() => buildGeneralImport(short, codes, SLOT_DAY), /Province 08: its .* municipalities add up to .* population, the province row says .*; the file is incomplete/);
});

test("import refuses each Catalonia-wide inconsistency", () => {
  // A municipality missing (Lleida's only one): its province no longer adds up.
  const p = miniFiles(mini());
  const cut = { ...p, municipalities: new Map([...p.municipalities].filter(([code]) => code !== "25001")) };
  refuses(() => checkCatalonia(cut), /Province 25: its 0 municipalities add up to 0 population, the province row says 300; the file is incomplete/);
  const cases: [string, (m: Mini) => void, RegExp][] = [
    ["a town not marked official", (m) => (m.towns[1]!.official = "N"), /1 Catalan municipalities are not marked as official data/],
    ["Catalonia row != sum of provinces", (m) => (m.catalonia = { electorate: 9999 }), /the provinces add up to 1860 electorate, the Catalonia row says 9999/],
    ["Catalonia votes by regional code", (m) => (m.catalonia = { votes: { "000001": 617, "000002": 473 } }), /do not add up to the Catalonia row \(000001: 616 against 617\)/],
    ["seats by regional code", (m) => (m.catalonia = { seats: { "000001": 4, "000002": 1 } }), /seats by regional code do not add up/],
    ["province below its municipalities", (m) => (m.provinces[0]!.extra.votes["000001"] = -5), /Province 08: its municipalities add up to 500 listVotes, more than the province row's 498/],
  ];
  for (const [label, mutate, message] of cases) {
    const m = mini();
    mutate(m);
    assert.throws(() => buildGeneralImport(miniFiles(m), ["08001"], SLOT_DAY), (error: unknown) => error instanceof InteriorFileError && message.test(error.message), label);
  }
  refuses(() => buildGeneralImport(miniFiles(mini()), ["28079"], SLOT_DAY), /28079 \(Town 28079\) is not in Catalonia/);
  refuses(() => buildGeneralImport(miniFiles(mini()), ["08001", "08001"], SLOT_DAY), /requested twice/);
  const noAreas = { ...miniFiles(mini()), areas: null };
  refuses(() => buildGeneralImport(noAreas, ["08001"], SLOT_DAY), /files 07 and 08 .* are missing/);
});

/* -------------------------------------------------------------------------- */
/* Zip reader                                                                 */
/* -------------------------------------------------------------------------- */

function makeZip(entries: { name: string; data: Buffer; method: 0 | 8; flags?: number; crc?: number }[]): Buffer {
  const parts: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;
  const date = (43 << 9) | (11 << 5) | 10; // 2023-11-10
  for (const e of entries) {
    const body = e.method === 8 ? deflateRawSync(e.data) : e.data;
    const crc = (e.crc ?? crc32(e.data)) >>> 0;
    const name = Buffer.from(e.name, "latin1");
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(e.flags ?? 0, 6);
    local.writeUInt16LE(e.method, 8);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(e.data.length, 22);
    local.writeUInt16LE(name.length, 26);
    const entry = Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50, 0);
    entry.writeUInt16LE(20, 4);
    entry.writeUInt16LE(20, 6);
    entry.writeUInt16LE(e.flags ?? 0, 8);
    entry.writeUInt16LE(e.method, 10);
    entry.writeUInt16LE(date, 14);
    entry.writeUInt32LE(crc, 16);
    entry.writeUInt32LE(body.length, 20);
    entry.writeUInt32LE(e.data.length, 24);
    entry.writeUInt16LE(name.length, 28);
    entry.writeUInt32LE(offset, 42);
    parts.push(local, name, body);
    central.push(entry, name);
    offset += 30 + name.length + body.length;
  }
  const directory = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, directory, end]);
}

test("zip reader: stored and deflated members, dates, CRC; the fixture through a zip parses the same", () => {
  const members = readdirSync(FIXTURE).map((name, i) => ({ name, data: readFileSync(join(FIXTURE, name)), method: (i % 2 ? 0 : 8) as 0 | 8 }));
  const zip = readZip(makeZip([...members, { name: "FICHEROS.doc", data: Buffer.from("doc"), method: 0 }]));
  assert.equal(zip.length, members.length + 1);
  for (const m of zip) assert.equal(m.modified, "2023-11-10");
  const viaZip = parseElection(electionFiles(zip.map((m) => ({ name: m.name, text: () => decodeAnsi(m.read()) }))));
  assert.deepEqual([...viaZip.municipalities.values()], [...parseFixture().municipalities.values()]);
  assert.equal(dosDate((46 << 9) | (12 << 5) | 1), "2026-12-01");
  assert.throws(() => readZip(Buffer.from("not a zip at all, just text padding to 22+ bytes")), /not a zip archive/);
  assert.throws(() => readZip(makeZip([{ name: "x.DAT", data: Buffer.from("abc"), method: 0, flags: 1 }])), /encrypted/);
  const bad = readZip(makeZip([{ name: "x.DAT", data: Buffer.from("abc"), method: 8, crc: 12345 }]));
  assert.throws(() => bad[0]!.read(), /CRC-32 mismatch/);
});

/* -------------------------------------------------------------------------- */
/* Render: without and with the 29N results                                    */
/* -------------------------------------------------------------------------- */

test("render without g2026: the honest empty slot, unchanged", () => {
  for (const locale of LOCALES) {
    const model = buildElectionPage(bySlug("sabadell"), locale, BASE);
    assert.equal(model.slot.results, null);
    assert.match(model.slot.md[0]!, /Ministeri de l'Interior publiqui|Ministerio del Interior publique|Ministry of the Interior publishes/);
    assert.match(model.slot.md[1]!, /provisional/i, "says honestly that the night's provisional site is not announced");
    assert.equal(model.turnout.table.rows.length, 3);
    assert.equal(model.dataDate, BASE.readAt);
    assert.ok(!model.sources.items.some((s) => s.publisher === "Ministerio del Interior"));
    assert.match(model.standfirst, /un espai per als resultats|un espacio para los resultados|with space for the results/);
  }
  assert.equal(latestDataDate(BASE), BASE.readAt);
  assert.equal(ELECTION_NIGHT_RESULTS_URL, null, "no results-night link until Interior announces it");
  // Today (30 Oct 2026) nothing is imported: the committed pages show the empty slot.
  assert.equal(SNAPSHOT.general2026 === undefined, SNAPSHOT.municipalities.every((m) => m.g2026 === undefined), "both or neither");
});

/**
 * A snapshot with the 2023 file imported into the slot, for rendering only:
 * the seven fixture towns from the fixture; Catalonia's resident figures are
 * the Generalitat's (equal to Interior's, as the cross-check proves),
 * re-keyed by Interior's regional codes; the Catalonia row and seats from
 * the fixture's file 08.
 */
function snapshotWith2023(): ElectionsSnapshot {
  const p = parseFixture();
  const gen = residents(SNAPSHOT.catalonia.congress);
  const back = new Map([...MAPPING].map(([interior, generalitat]) => [generalitat, interior]));
  const cat = p.areas!.find((a) => a.province === "99")!;
  const general2026: General2026 = {
    date: p.date,
    source: { name: "Resultados por municipio: elecciones al Congreso de los Diputados (02202307_MUNI.zip)", publisher: "Ministerio del Interior", file: "02202307_MUNI.zip", fileDate: "2023-11-10", sha256: "08cc98de85fa91f3e808705b9cb1886f63a78997b3563a106f5bedb213aee420", importedAt: "2026-12-14" },
    lists: fixtureLists(p),
    catalonia: { ...gen, votes: Object.fromEntries(Object.entries(gen.votes).map(([code, n]) => [back.get(code)!, n])) },
    cataloniaTotal: { ...countsOf(cat), votes: { ...cat.votes } },
    cataloniaSeats: Object.fromEntries(Object.entries(cat.seatsByList).filter(([, n]) => n > 0)),
  };
  const towns = new Set<string>(Object.values(TOWNS));
  return {
    ...BASE,
    municipalities: BASE.municipalities.map((m) => (towns.has(m.code) ? { ...m, g2026: townResult(p, m.code) } : m)),
    general2026,
  };
}

test("render with g2026: the official table, the Ministry and the file's date, in every language", () => {
  const snap = snapshotWith2023();
  const sabadell = snap.municipalities.find((m) => m.slug === "sabadell")!;
  const ca = buildElectionPage(sabadell, "ca", snap);
  assert.ok(ca.slot.results);
  assert.equal(ca.slot.results.summary, "A Sabadell van votar 103.041 persones d'un cens de 155.301: una participació del 66,3 %, davant del 65,4 % de Catalunya. La candidatura més votada va ser PSC, amb 39.729 vots (el 38,9 % dels vots vàlids; 34,5 % a Catalunya).");
  assert.deepEqual(ca.slot.results.table.headers, ["Candidatura", "Vots", "% Sabadell", "% Catalunya", "Diputats"]);
  assert.deepEqual(ca.slot.results.table.rows[0], ["PSC\nPARTIT DELS SOCIALISTES DE CATALUNYA (PSC-PSOE)", "39.729", "38,9 %", "34,5 %", "19"]);
  assert.deepEqual(ca.slot.results.table.rows[2], ["PP\nPARTIDO POPULAR / PARTIT POPULAR", "12.088", "11,8 %", "13,3 %", "6"], "PP's Barcelona code, compared under its regional code");
  assert.equal(ca.slot.results.table.rows.length, 12, "every candidacy on Sabadell's ballot");
  assert.deepEqual(ca.slot.results.table.footRows, [["Vots en blanc", "901", "0,9 %", "0,8 %", ""]]);
  assert.match(ca.slot.results.table.note, /^Font: Ministeri de l'Interior, fitxer oficial de resultats per municipis 02202307_MUNI\.zip, del 10 de novembre de 2023\./);
  assert.match(ca.slot.results.table.note, /participació oficial va ser del 62,7 %/);
  assert.match(ca.slot.results.table.note, /\(48 diputats\)/);
  assert.match(ca.slot.md[0]!, /^\*\*Resultats oficials del Ministeri de l'Interior\*\*/);
  // The row is labelled with the file's own polling date (here the 2023 file's).
  assert.deepEqual(ca.turnout.table.rows[0], ["Generals, 23 de juliol de 2023", "66,3 %", "65,4 %"]);
  assert.match(ca.turnout.table.caption, /quatre últimes/);
  assert.equal(ca.sources.items[0]?.publisher, "Ministerio del Interior");
  assert.equal(ca.sources.items[0]?.updated, "10 de novembre de 2023");
  assert.equal(ca.dataDate, "2026-12-14", "the import is newer than the Generalitat read");
  assert.match(ca.readLine, /14 de desembre de 2026/);
  assert.equal(ca.faq[2]?.question, "Quina candidatura va tenir més vots el 29N a Sabadell?");
  assert.match(ca.faq[2]!.answer, /^PSC \(PARTIT DELS SOCIALISTES DE CATALUNYA \(PSC-PSOE\)\), amb 39\.729 vots, el 38,9 % dels vàlids\. La participació va ser del 66,3 %/);
  assert.match(ca.standfirst, /del fitxer oficial del Ministeri de l'Interior/);

  const es = buildElectionPage(sabadell, "es", snap);
  assert.match(es.slot.results!.summary, /^En Sabadell votaron 103\.041 personas de un censo de 155\.301: una participación del 66,3 %, frente al 65,4 % de Cataluña\. La candidatura más votada fue PSC/);
  assert.match(es.slot.results!.table.note, /^Fuente: Ministerio del Interior, fichero oficial de resultados por municipios 02202307_MUNI\.zip, del 10 de noviembre de 2023\./);
  const salou = snap.municipalities.find((m) => m.slug === "salou")!;
  const en = buildElectionPage(salou, "en", snap);
  assert.match(en.slot.results!.summary, /^In Salou, 9,740 people voted out of an electorate of 16,437: turnout of 59\.3%/);
  assert.match(en.slot.results!.table.note, /^Source: Spanish Ministry of the Interior, official results file by municipality 02202307_MUNI\.zip, dated 10 November 2023\./);
  assert.deepEqual(en.slot.results!.table.headers, ["List", "Votes", "% Salou", "% Catalonia", "Seats"]);
  assert.ok(en.slot.results!.table.rows.some((row) => row[0] === "PP\nPARTIT POPULAR / PARTIDO POPULAR"), "Tarragona's PP code, its own name");
});

test("render with g2026: percentages from counts, nothing claims provisional results, neutral copy", () => {
  const snap = snapshotWith2023();
  for (const slug of Object.keys(TOWNS)) {
    const m = snap.municipalities.find((x) => x.slug === slug)!;
    const view = generalView(m.g2026!, snap.general2026!);
    const total = view.rows.reduce((a, r) => a + r.share, 0) + view.blank.share;
    assert.ok(Math.abs(total - 100) < 1e-9, `${slug}: shares sum to ${total}`);
    for (const row of view.rows) assert.equal(row.share, share(row.votes, m.g2026!.validVotes));
    for (let i = 1; i < view.rows.length; i++) assert.ok(view.rows[i - 1]!.votes >= view.rows[i]!.votes, `${slug}: most votes first`);
    const names = Object.values(snap.general2026!.lists).flatMap((l) => [l.name, l.short]).sort((a, b) => b.length - a.length);
    for (const locale of LOCALES) {
      const model = buildElectionPage(m, locale, snap);
      assert.ok(model.slot.results, `${locale}/${slug}`);
      const text = JSON.stringify([model.standfirst, model.slot, model.faq, model.turnout]);
      assert.doesNotMatch(text, /provisional|provisionals|provisionales|escrutini provisional|escrutinio provisional/i, `${locale}/${slug}`);
      assert.doesNotMatch(text, /apareixeran aquí|aparecerán aquí|will appear here|\$\{|undefined|NaN|\[object/, `${locale}/${slug}`);
      const own = names.reduce((t, name) => t.split(JSON.stringify(name).slice(1, -1)).join(""), JSON.stringify(model));
      assert.doesNotMatch(own, /enquest|sondeig|encuesta|sondeo|\bpolls?\b|previsi|pronòstic|pronóstico|forecast|projecci|proyecci|projection|guanyador|ganador|winner|victòria|victoria|victory/i, `${locale}/${slug}`);
      if (locale === "ca") assert.doesNotMatch(own, /\b(el|del|El) 1{1,2}(,\d| %|è|r)/, `ca/${slug}: elision`);
    }
  }
  // A town the import did not cover keeps the empty slot (the real import refuses to leave any out).
  const other = snap.municipalities.find((m) => m.slug === "terrassa")!;
  assert.equal(buildElectionPage(other, "ca", snap).slot.results, null);
});

test("render with g2026: a tie at the top names every list with most votes", () => {
  const snap = snapshotWith2023();
  const m = snap.municipalities.find((x) => x.slug === "vielha-e-mijaran")!;
  const [first, second] = Object.entries(m.g2026!.votes).sort((a, b) => b[1] - a[1]);
  const tied = { ...m, g2026: { ...m.g2026!, votes: { ...m.g2026!.votes, [second![0]]: first![1] }, listVotes: m.g2026!.listVotes + first![1] - second![1], voters: m.g2026!.voters + first![1] - second![1], validVotes: m.g2026!.validVotes + first![1] - second![1] } };
  const ca = buildElectionPage(tied, "ca", snap);
  assert.match(ca.slot.results!.summary, /Les candidatures més votades van ser .+ i .+, empatades amb/);
  assert.match(buildElectionPage(tied, "en", snap).faq[2]!.answer, / and .+ each,/);
});

test("committed snapshot: once imported, every town has 29N counts that add up, labelled from the file", () => {
  const g = SNAPSHOT.general2026;
  if (!g) {
    assert.ok(SNAPSHOT.municipalities.every((m) => !m.g2026), "no town results without the import block");
    return;
  }
  assert.equal(g.date, "2026-11-29");
  assert.equal(g.source.publisher, "Ministerio del Interior");
  assert.match(g.source.file, /^02202611_MUNI\.zip$/);
  assert.match(g.source.sha256, /^[0-9a-f]{64}$/);
  for (const date of [g.source.fileDate, g.source.importedAt]) assert.match(date, /^2026-(11|12)-\d{2}$|^2027-\d{2}-\d{2}$/);
  for (const c of [g.catalonia, g.cataloniaTotal]) {
    assert.equal(c.listVotes + c.blankVotes, c.validVotes);
    assert.equal(c.validVotes + c.nullVotes, c.voters);
    assert.equal(Object.values(c.votes).reduce((a, b) => a + b, 0), c.listVotes);
  }
  for (const m of SNAPSHOT.municipalities) {
    const t = m.g2026;
    assert.ok(t, `${m.slug}: 29N results`);
    assert.equal(t.listVotes + t.blankVotes, t.validVotes, m.slug);
    assert.equal(t.validVotes + t.nullVotes, t.voters, m.slug);
    assert.ok(t.voters > 0 && t.voters <= t.electorate, m.slug);
    assert.equal(Object.values(t.votes).reduce((a, b) => a + b, 0), t.listVotes, m.slug);
    for (const code of Object.keys(t.votes)) assert.ok(g.lists[code], `${m.slug}: label for ${code}`);
  }
});

test("routing is unchanged by the 29N slot", () => {
  assert.equal(municipalitiesFor("ca").length, 947);
  assert.equal(municipalitiesFor("es").length, 947);
  assert.equal(municipalitiesFor("en").length, 30);
  assert.equal(resolveElectionPage("ca", "ca", "sabadell")?.slug, "sabadell");
  assert.equal(resolveElectionPage("en", "en", "salou")?.slug, "salou");
  assert.equal(resolveElectionPage("es", "ca", "sabadell"), null);
  assert.equal(resolveElectionPage("en", "en", "linyola"), null);
  assert.deepEqual(electionsStaticParams("ca")[0], { locale: "ca", municipi: "barcelona" });
  // The slot's anchor and title stay put, with or without results.
  const snap = snapshotWith2023();
  for (const locale of LOCALES as readonly Locale[]) {
    const m = snap.municipalities.find((x) => x.slug === "sabadell")!;
    assert.equal(buildElectionPage(m, locale, snap).slot.title, buildElectionPage(bySlug("sabadell"), locale).slot.title);
  }
});

/* -------------------------------------------------------------------------- */
/* Snapshot file                                                              */
/* -------------------------------------------------------------------------- */

test("snapshot file: re-rendering the committed snapshot reproduces it (no churn from the importer)", () => {
  // Line endings as git checks the file out (core.autocrlf) aside.
  assert.equal(renderSnapshotFile(SNAPSHOT), readFileSync(SNAPSHOT_FILE, "utf8").replace(/\r\n/g, "\n"));
});

test("snapshot file: a Generalitat refresh carries the 29N import, or refuses to drop part of it", () => {
  const withImport = snapshotWith2023();
  // Every town imported.
  const full: ElectionsSnapshot = { ...withImport, municipalities: withImport.municipalities.map((m) => ({ ...m, g2026: m.g2026 ?? { ...m.congress } })) };
  const refreshed = carryGeneral2026(full, BASE);
  assert.deepEqual(refreshed.general2026, full.general2026);
  assert.ok(refreshed.municipalities.every((m) => m.g2026));
  assert.match(renderSnapshotFile(refreshed), /scripts\/elections-29n\.ts/);
  assert.doesNotMatch(renderSnapshotFile(BASE), /elections-29n/, "no 29N header line before the import");
  // Some towns without results: refused unless told to drop the import.
  assert.throws(() => carryGeneral2026(withImport, BASE), /municipalities now in the set have none .* --drop-29n/);
  assert.equal(carryGeneral2026(withImport, BASE, true).general2026, undefined);
  assert.equal(carryGeneral2026(BASE, BASE), BASE, "nothing imported: nothing to carry");
});
