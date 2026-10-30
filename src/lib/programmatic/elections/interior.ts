/**
 * Parser for the Interior Ministry's official results files by municipality
 * (infoelectoral.interior.gob.es, "Área de descargas", e.g. 02202307_MUNI.zip
 * for the 23 July 2023 Congress election). Pure: decoded text in, typed
 * records out; no file system, no network, no clock. The zip is opened by
 * `scripts/lib/zip.ts`; `scripts/elections-29n.ts` wires the two together.
 *
 * Format: FICHEROS.doc, shipped inside every zip ("Base de datos de resultados
 * electorales. Ficheros de datos de procesos electorales"). Fixed-width
 * records in the ANSI character set; numbers right-aligned and zero-padded,
 * text left-aligned and blank-padded. Positions below are the document's,
 * 1-based and inclusive. File names are `nnxxaamm.DAT`: nn the file type,
 * xx the election type (02 = Congress), aamm the year and month.
 *
 *   01 control           which files are attached
 *   02 identification    the polling date
 *   03 candidacies       code, abbreviation (siglas), name (denominación)
 *   05 municipalities    electorate, blank, null and list votes per municipality
 *   06 municipal votes   votes per candidacy per municipality
 *   07 above municipality  the same as 05 for provinces, regions and Spain
 *   08 above municipality  the same as 06, with seats
 *
 * Only counts are read: every percentage is computed on the page.
 */

import type { Counts, InteriorList, ListLabel, RegionalVotes } from "./types";

/** Field positions, 1-based and inclusive, as FICHEROS.doc lists them. */
type Layout = Record<string, readonly [start: number, end: number]>;

const HEAD = { type: [1, 2], year: [3, 6], month: [7, 8] } as const;

export const LAYOUT = {
  "01": { ...HEAD, round: [9, 9], files: [10, 25] },
  "02": { ...HEAD, round: [9, 9], scopeType: [10, 10], scope: [11, 12], day: [13, 14], dateMonth: [15, 16], dateYear: [17, 20], opens: [21, 25], closes: [26, 30] },
  "03": { ...HEAD, code: [9, 14], short: [15, 64], name: [65, 214], provincial: [215, 220], regional: [221, 226], national: [227, 232] },
  "05": {
    ...HEAD,
    round: [9, 9],
    region: [10, 11],
    province: [12, 13],
    municipality: [14, 16],
    district: [17, 18],
    name: [19, 118],
    constituency: [119, 119],
    population: [129, 136],
    stations: [137, 141],
    ineRoll: [142, 149],
    electorate: [150, 157],
    blankVotes: [190, 197],
    nullVotes: [198, 205],
    listVotes: [206, 213],
    official: [233, 233],
  },
  "06": { ...HEAD, round: [9, 9], province: [10, 11], municipality: [12, 14], district: [15, 16], code: [17, 22], votes: [23, 30], seats: [31, 33] },
  "07": {
    ...HEAD,
    round: [9, 9],
    region: [10, 11],
    province: [12, 13],
    constituency: [14, 14],
    name: [15, 64],
    population: [65, 72],
    stations: [73, 77],
    ineRoll: [78, 85],
    electorate: [86, 93],
    blankVotes: [126, 133],
    nullVotes: [134, 141],
    listVotes: [142, 149],
    seats: [150, 155],
    official: [172, 172],
  },
  "08": { ...HEAD, round: [9, 9], region: [10, 11], province: [12, 13], constituency: [14, 14], code: [15, 20], votes: [21, 28], seats: [29, 33] },
} as const satisfies Record<string, Layout>;

export type FileType = keyof typeof LAYOUT;

/** Record length of each file type: the end of its last field. */
export const RECORD_LENGTH: Record<FileType, number> = { "01": 25, "02": 40, "03": 232, "05": 233, "06": 33, "07": 172, "08": 33 };

/** Fields FICHEROS.doc declares numeric ("Num."), by file type. */
const NUMERIC: Record<FileType, readonly string[]> = {
  "01": ["type", "year", "month", "round", "files"],
  "02": ["type", "year", "month", "round", "scope", "day", "dateMonth", "dateYear"],
  "03": ["type", "year", "month", "code", "provincial", "regional", "national"],
  "05": ["type", "year", "month", "round", "region", "province", "municipality", "district", "constituency", "population", "stations", "ineRoll", "electorate", "blankVotes", "nullVotes", "listVotes"],
  "06": ["type", "year", "month", "round", "province", "municipality", "district", "code", "votes", "seats"],
  "07": ["type", "year", "month", "round", "region", "province", "constituency", "population", "stations", "ineRoll", "electorate", "blankVotes", "nullVotes", "listVotes", "seats"],
  "08": ["type", "year", "month", "round", "region", "province", "constituency", "code", "votes", "seats"],
};

/** Election types in the second pair of digits of a file name (FICHEROS.doc). */
export const CONGRESS = "02";
/** Catalonia's region code in these files ("Código de la Comunidad Autónoma"). */
export const CATALONIA_REGION = "09";
/** District code of a municipality's total row ("99 si es el total municipal"). */
export const MUNICIPAL_TOTAL = "99";

export class InteriorFileError extends Error {
  override name = "InteriorFileError";
}

function fail(message: string): never {
  throw new InteriorFileError(message);
}

/**
 * The ANSI (Windows-1252) bytes as text. Every byte is one UTF-16 code unit
 * after decoding, so FICHEROS.doc's byte positions stay valid.
 */
export function decodeAnsi(bytes: Uint8Array): string {
  return new TextDecoder("windows-1252").decode(bytes);
}

/** Control characters or the replacement character: text decoded with the wrong character set. */
const DAMAGED_TEXT = /[\u0000-\u001f\u007f-\u009f�]/;

/** Lines of a .DAT file: CR+LF per FICHEROS.doc; the 2023 files use LF alone. */
export function records(text: string): string[] {
  const lines = text.split(/\r?\n/);
  while (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

export type Fields<T extends FileType> = Record<keyof (typeof LAYOUT)[T] & string, string>;

/**
 * One record, field by field. Refuses a record of the wrong length, a numeric
 * field with anything but digits, and a record whose election type, year or
 * month differs from the file name's.
 */
export function parseRecord<T extends FileType>(fileType: T, line: string, expect: { type: string; year: string; month: string }, where: string): Fields<T> {
  if (line.length !== RECORD_LENGTH[fileType]) fail(`${where}: ${line.length} characters, file ${fileType} records have ${RECORD_LENGTH[fileType]}`);
  const out = {} as Record<string, string>;
  for (const [field, [start, end]] of Object.entries(LAYOUT[fileType] as Layout)) {
    const raw = line.slice(start - 1, end);
    if (NUMERIC[fileType].includes(field)) {
      if (!/^\d+$/.test(raw)) fail(`${where}: ${field} (columns ${start}-${end}) is not a number: "${raw}"`);
      out[field] = raw;
    } else {
      out[field] = raw.replace(/ +$/, "");
    }
  }
  if (out.type !== expect.type || out.year !== expect.year || out.month !== expect.month) {
    fail(`${where}: record is for ${out.type}/${out.year}-${out.month}, the file name says ${expect.type}/${expect.year}-${expect.month}`);
  }
  return out as Fields<T>;
}

export const num = (value: string): number => Number.parseInt(value, 10);

/* -------------------------------------------------------------------------- */
/* The set of files                                                           */
/* -------------------------------------------------------------------------- */

export interface ElectionFiles {
  type: string;
  /** Four digits. */
  year: string;
  /** Two digits. */
  month: string;
  /** Decoded text by file type ("01", "02"...). */
  text: Partial<Record<FileType, string>>;
}

/** `02202307_MUNI.zip` members: `01022307.DAT`... Returns null for anything else (FICHEROS.doc). */
export function memberName(name: string): { fileType: string; type: string; yy: string; month: string } | null {
  const match = /^(\d{2})(\d{2})(\d{2})(\d{2})\.DAT$/i.exec(name.split("/").pop() ?? "");
  if (!match) return null;
  const [, fileType, type, yy, month] = match;
  return { fileType: fileType!, type: type!, yy: yy!, month: month! };
}

/**
 * Files 01 to 12 exist (FICHEROS.doc); this importer reads the ones in
 * `LAYOUT`. File 04, the candidates (names, dates of birth, ID numbers), is
 * in the archive and is never read.
 */
const KNOWN_FILE_TYPES = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

/**
 * Groups the zip's .DAT members into one election. Refuses a zip that mixes
 * elections or dates, carries the same file twice or a file type FICHEROS.doc
 * does not define. `text` is called only for the files that are parsed.
 */
export function electionFiles(members: { name: string; text: () => string }[], century = "20"): ElectionFiles {
  const dat = members.map((m) => ({ ...m, parsed: memberName(m.name) })).filter((m) => m.parsed);
  if (dat.length === 0) fail("no .DAT files in the archive");
  const keys = new Set(dat.map((m) => `${m.parsed!.type}${m.parsed!.yy}${m.parsed!.month}`));
  if (keys.size !== 1) fail(`the archive mixes elections: ${[...keys].join(", ")}`);
  const first = dat[0]!.parsed!;
  const seen = new Set<string>();
  const text: Partial<Record<FileType, string>> = {};
  for (const m of dat) {
    const fileType = m.parsed!.fileType;
    if (!KNOWN_FILE_TYPES.includes(fileType)) fail(`unexpected file ${m.name} (type ${fileType}) in the archive`);
    if (seen.has(fileType)) fail(`${m.name}: file ${fileType} appears twice`);
    seen.add(fileType);
    if (fileType in LAYOUT) text[fileType as FileType] = m.text();
  }
  return { type: first.type, year: `${century}${first.yy}`, month: first.month, text };
}

/* -------------------------------------------------------------------------- */
/* Parsed election                                                            */
/* -------------------------------------------------------------------------- */

export interface Totals {
  /** "Población de derecho". */
  population: number;
  /** "Número de mesas": polling stations. */
  stations: number;
  /** "Censo de escrutinio": the roll the count was made on. */
  electorate: number;
  blankVotes: number;
  nullVotes: number;
  listVotes: number;
}

export const TOTAL_FIELDS = ["population", "stations", "electorate", "blankVotes", "nullVotes", "listVotes"] as const;

export interface MunicipalityRow extends Totals {
  /** INE code, province + municipality: "08187". */
  code: string;
  region: string;
  name: string;
  /** "Datos oficiales": S or N. */
  official: string;
  /** Votes by candidacy code, from file 06. */
  votes: Record<string, number>;
}

export interface AreaRow extends Totals {
  region: string;
  province: string;
  constituency: string;
  name: string;
  seats: number;
  official: string;
  votes: Record<string, number>;
  seatsByList: Record<string, number>;
}

export interface Candidacy extends ListLabel {
  code: string;
  provincial: string;
  regional: string;
  national: string;
}

export interface ParsedElection {
  type: string;
  year: string;
  month: string;
  /** ISO polling date, from file 02. */
  date: string;
  candidacies: Map<string, Candidacy>;
  /** Municipality totals (district 99), by INE code. */
  municipalities: Map<string, MunicipalityRow>;
  /** Rows of files 07 and 08 when attached (provinces, regions, Spain). */
  areas: AreaRow[] | null;
}

/**
 * Positions 10-25 of file 01, one flag per file of the whole election (01 to
 * 12, then 0510 to 0810). The flags describe the election's complete set:
 * the polling-station files (09, 10) are flagged but ship in the separate
 * `_MESA.zip`, so only the files read here are checked against them.
 */
const CONTROL_POSITION: Partial<Record<FileType, number>> = { "02": 1, "03": 2, "05": 4, "06": 5, "07": 6, "08": 7 };

/**
 * Parses the files of one election and checks every record against
 * FICHEROS.doc. Does not judge the numbers: see `checkElection`.
 */
export function parseElection(files: ElectionFiles): ParsedElection {
  const expect = { type: files.type, year: files.year, month: files.month };
  const name = (fileType: FileType) => `${fileType}${files.type}${files.year.slice(2)}${files.month}.DAT`;
  const lines = (fileType: FileType): string[] => {
    const text = files.text[fileType];
    if (text === undefined) fail(`${name(fileType)} is missing from the archive`);
    return records(text);
  };

  // 01: control. Every file read here must be both flagged and present.
  const control = lines("01");
  if (control.length !== 1) fail(`${name("01")}: ${control.length} records, expected 1`);
  const c = parseRecord("01", control[0]!, expect, name("01"));
  if (c.round !== "1") fail(`${name("01")}: round ${c.round}; a general election has one round`);
  if (!/^[01]{16}$/.test(c.files)) fail(`${name("01")}: flags "${c.files}" are not 0/1`);
  for (const [fileType, i] of Object.entries(CONTROL_POSITION) as [FileType, number][]) {
    const flagged = c.files[i] === "1";
    const attached = files.text[fileType] !== undefined;
    if (attached && !flagged) fail(`${name(fileType)} is in the archive but ${name("01")} says it is not part of the election`);
    if (flagged && !attached && ["02", "03", "05", "06"].includes(fileType)) fail(`${name(fileType)} is missing from the archive`);
  }
  for (const required of ["02", "03", "05", "06"] as const) if (files.text[required] === undefined) fail(`${name(required)} is missing from the archive`);

  // 02: identification, one record per election in the set.
  const ident = lines("02").map((line, i) => parseRecord("02", line, expect, `${name("02")} record ${i + 1}`));
  if (ident.length !== 1) fail(`${name("02")}: ${ident.length} records, expected 1`);
  const id = ident[0]!;
  const date = `${id.dateYear}-${id.dateMonth}-${id.day}`;
  if (id.dateYear !== files.year || id.dateMonth !== files.month) fail(`${name("02")}: polling date ${date} is not in ${files.year}-${files.month}`);
  if (Number.isNaN(Date.parse(`${date}T12:00:00Z`))) fail(`${name("02")}: polling date ${date} is not a date`);

  // 03: candidacies.
  const candidacies = new Map<string, Candidacy>();
  lines("03").forEach((line, i) => {
    const r = parseRecord("03", line, expect, `${name("03")} record ${i + 1}`);
    if (candidacies.has(r.code)) fail(`${name("03")}: candidacy ${r.code} appears twice`);
    if (!r.short.trim() || !r.name.trim()) fail(`${name("03")}: candidacy ${r.code} has no abbreviation or name`);
    for (const text of [r.short, r.name]) if (DAMAGED_TEXT.test(text)) fail(`${name("03")}: candidacy ${r.code}: "${text.trim()}" is damaged (wrong character set?)`);
    candidacies.set(r.code, { code: r.code, short: r.short.trim(), name: r.name.trim(), provincial: r.provincial, regional: r.regional, national: r.national });
  });

  // 05: municipality totals. District rows (Barcelona's ten, Madrid's...) are
  // kept only to check that they add up to the municipality's total.
  const municipalities = new Map<string, MunicipalityRow>();
  const districts = new Map<string, Totals[]>();
  lines("05").forEach((line, i) => {
    const where = `${name("05")} record ${i + 1}`;
    const r = parseRecord("05", line, expect, where);
    if (r.round !== "1") fail(`${where}: round ${r.round}`);
    const code = `${r.province}${r.municipality}`;
    if (DAMAGED_TEXT.test(r.name)) fail(`${where}: municipality name "${r.name.trim()}" is damaged (wrong character set?)`);
    const totals: Totals = {
      population: num(r.population),
      stations: num(r.stations),
      electorate: num(r.electorate),
      blankVotes: num(r.blankVotes),
      nullVotes: num(r.nullVotes),
      listVotes: num(r.listVotes),
    };
    if (r.district !== MUNICIPAL_TOTAL) {
      districts.set(code, [...(districts.get(code) ?? []), totals]);
      return;
    }
    if (municipalities.has(code)) fail(`${where}: municipality ${code} has two total rows`);
    municipalities.set(code, { code, region: r.region, name: r.name.trim(), official: r.official, ...totals, votes: {} });
  });
  for (const [code, parts] of districts) {
    const total = municipalities.get(code);
    if (!total) fail(`${name("05")}: municipality ${code} has district rows and no total`);
    // District rows leave the population at zero (2023 file); everything else adds up.
    for (const field of ["stations", "electorate", "blankVotes", "nullVotes", "listVotes"] as const) {
      const sum = parts.reduce((a, p) => a + p[field], 0);
      if (sum !== total[field]) fail(`${name("05")}: ${code} districts add up to ${sum} ${field}, the total says ${total[field]}`);
    }
  }

  // 06: votes per candidacy, total rows only.
  const districtVotes = new Map<string, number>();
  lines("06").forEach((line, i) => {
    const where = `${name("06")} record ${i + 1}`;
    const r = parseRecord("06", line, expect, where);
    if (r.round !== "1") fail(`${where}: round ${r.round}`);
    if (!candidacies.has(r.code)) fail(`${where}: candidacy ${r.code} is not in ${name("03")}`);
    const code = `${r.province}${r.municipality}`;
    if (r.district !== MUNICIPAL_TOTAL) {
      const key = `${code}:${r.code}`;
      districtVotes.set(key, (districtVotes.get(key) ?? 0) + num(r.votes));
      return;
    }
    const m = municipalities.get(code);
    if (!m) fail(`${where}: municipality ${code} is not in ${name("05")}`);
    if (m.votes[r.code] !== undefined) fail(`${where}: ${code} has candidacy ${r.code} twice`);
    m.votes[r.code] = num(r.votes);
  });
  for (const [key, votes] of districtVotes) {
    const [code, list] = key.split(":") as [string, string];
    const total = municipalities.get(code)?.votes[list] ?? 0;
    if (votes !== total) fail(`${name("06")}: ${code} districts give candidacy ${list} ${votes} votes, the total row ${total}`);
  }

  // 07 and 08: areas above the municipality, when attached.
  let areas: AreaRow[] | null = null;
  if (files.text["07"] !== undefined && files.text["08"] !== undefined) {
    const byKey = new Map<string, AreaRow>();
    areas = lines("07").map((line, i) => {
      const where = `${name("07")} record ${i + 1}`;
      const r = parseRecord("07", line, expect, where);
      if (r.round !== "1") fail(`${where}: round ${r.round}`);
      const key = `${r.region}${r.province}${r.constituency}`;
      if (byKey.has(key)) fail(`${where}: area ${key} appears twice`);
      const row: AreaRow = {
        region: r.region,
        province: r.province,
        constituency: r.constituency,
        name: r.name.trim(),
        population: num(r.population),
        stations: num(r.stations),
        electorate: num(r.electorate),
        blankVotes: num(r.blankVotes),
        nullVotes: num(r.nullVotes),
        listVotes: num(r.listVotes),
        seats: num(r.seats),
        official: r.official,
        votes: {},
        seatsByList: {},
      };
      byKey.set(key, row);
      return row;
    });
    lines("08").forEach((line, i) => {
      const where = `${name("08")} record ${i + 1}`;
      const r = parseRecord("08", line, expect, where);
      if (!candidacies.has(r.code)) fail(`${where}: candidacy ${r.code} is not in ${name("03")}`);
      const area = byKey.get(`${r.region}${r.province}${r.constituency}`);
      if (!area) fail(`${where}: area ${r.region}/${r.province}/${r.constituency} is not in ${name("07")}`);
      if (area.votes[r.code] !== undefined) fail(`${where}: candidacy ${r.code} twice in area ${area.name}`);
      area.votes[r.code] = num(r.votes);
      area.seatsByList[r.code] = num(r.seats);
    });
  }

  return { type: files.type, year: files.year, month: files.month, date, candidacies, municipalities, areas };
}

/* -------------------------------------------------------------------------- */
/* Import for the 29N slot: every check, then the counts the page needs       */
/* -------------------------------------------------------------------------- */

/** Catalonia's four provinces (INE codes). */
export const CATALAN_PROVINCES: readonly string[] = ["08", "17", "25", "43"];

export interface ImportExpectation {
  /** Election type: "02", Congress. */
  type: string;
  /** ISO polling date the file must carry in file 02. */
  date: string;
}

export interface CataloniaImport {
  lists: Record<string, InteriorList>;
  /** Sum of Catalonia's municipalities (no vote from abroad), votes by regional code. */
  catalonia: RegionalVotes;
  /** The file's Catalonia row, vote from abroad included, by regional code. */
  cataloniaTotal: RegionalVotes;
  cataloniaSeats: Record<string, number>;
}

export interface GeneralImport extends CataloniaImport {
  date: string;
  /** Each requested municipality, by INE code; votes by the file's candidacy code. */
  towns: Map<string, RegionalVotes>;
}

/** Voters and valid votes are not fields of the file: they are these sums (FICHEROS.doc, file 05). */
export function countsOf(t: Totals): Counts {
  return {
    electorate: t.electorate,
    voters: t.blankVotes + t.nullVotes + t.listVotes,
    nullVotes: t.nullVotes,
    blankVotes: t.blankVotes,
    listVotes: t.listVotes,
    validVotes: t.blankVotes + t.listVotes,
  };
}

const sumOf = (values: Iterable<number>) => [...values].reduce((a, b) => a + b, 0);

function addTo(target: Record<string, number>, key: string, n: number) {
  target[key] = (target[key] ?? 0) + n;
}

/** Two vote tables are equal when every code has the same count (a missing code is 0). */
function sameVotes(a: Record<string, number>, b: Record<string, number>): string | null {
  for (const code of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if ((a[code] ?? 0) !== (b[code] ?? 0)) return `${code}: ${a[code] ?? 0} against ${b[code] ?? 0}`;
  }
  return null;
}

/**
 * Catalonia as a whole, checked against itself before any town is read:
 *
 *  - every Catalan row of files 05 and 07 is marked official ("Datos
 *    oficiales" = S); anything else is refused, so the page can never show
 *    figures the file itself does not call official;
 *  - the file is complete: each province's municipalities add up to the
 *    province row's population and polling stations exactly;
 *  - each municipality's candidacies add up to its list votes, and no
 *    municipality has more voters than electors;
 *  - each province row is at least the sum of its municipalities, field by
 *    field and candidacy by candidacy (the difference is the vote from
 *    abroad, which belongs to no municipality);
 *  - the Catalonia row is exactly the sum of the four province rows, and its
 *    candidacies are the provinces' candidacies added up by regional code;
 *  - seats add up to each row's total, in every province and in Catalonia.
 */
export function checkCatalonia(parsed: ParsedElection): CataloniaImport {
  const areas = parsed.areas;
  if (!areas) fail("files 07 and 08 (areas above the municipality) are missing: Catalonia's totals and seats cannot be checked");
  const candidacy = (code: string): Candidacy => parsed.candidacies.get(code) ?? fail(`candidacy ${code} is not in file 03`);

  const catalan = [...parsed.municipalities.values()].filter((m) => m.region === CATALONIA_REGION);
  if (catalan.length === 0) fail("no Catalan municipality in the file");
  const unofficial = catalan.filter((m) => m.official !== "S");
  if (unofficial.length) {
    fail(
      `${unofficial.length} Catalan municipalities are not marked as official data ("Datos oficiales" = ${[...new Set(unofficial.map((m) => m.official))].join("/")}), e.g. ${unofficial
        .slice(0, 3)
        .map((m) => `${m.code} ${m.name}`)
        .join(", ")}`,
    );
  }
  for (const m of catalan) {
    if (!CATALAN_PROVINCES.includes(m.code.slice(0, 2))) fail(`${m.code} ${m.name}: region 09 but not a Catalan province`);
    const sum = sumOf(Object.values(m.votes));
    if (sum !== m.listVotes) fail(`${m.code} ${m.name}: candidacies add up to ${sum}, the list-vote total (file 05) is ${m.listVotes}`);
    const c = countsOf(m);
    if (c.voters > c.electorate) fail(`${m.code} ${m.name}: ${c.voters} voters, ${c.electorate} electors`);
  }

  const row = (province: string): AreaRow => {
    const found = areas.filter((a) => a.region === CATALONIA_REGION && a.province === province && a.constituency === "9");
    if (found.length !== 1) fail(`file 07: ${found.length} rows for region ${CATALONIA_REGION}, province ${province}`);
    return found[0]!;
  };
  const cat = row("99");
  const provinces = CATALAN_PROVINCES.map(row);
  for (const r of [cat, ...provinces]) {
    if (r.official !== "S") fail(`file 07: ${r.name} is not marked as official data ("Datos oficiales" = ${r.official})`);
    const listSum = sumOf(Object.values(r.votes));
    if (listSum !== r.listVotes) fail(`file 08: ${r.name} candidacies add up to ${listSum}, file 07 says ${r.listVotes}`);
    const seatSum = sumOf(Object.values(r.seatsByList));
    if (r.seats <= 0 || seatSum !== r.seats) fail(`file 08: ${r.name} candidacies won ${seatSum} seats, file 07 says ${r.seats}`);
  }

  for (const p of provinces) {
    const own = catalan.filter((m) => m.code.startsWith(p.province));
    for (const field of ["population", "stations"] as const) {
      const sum = sumOf(own.map((m) => m[field]));
      if (sum !== p[field]) fail(`${p.name}: its ${own.length} municipalities add up to ${sum} ${field}, the province row says ${p[field]}; the file is incomplete`);
    }
    for (const field of ["electorate", "blankVotes", "nullVotes", "listVotes"] as const) {
      const sum = sumOf(own.map((m) => m[field]));
      if (sum > p[field]) fail(`${p.name}: its municipalities add up to ${sum} ${field}, more than the province row's ${p[field]}`);
    }
    const residents: Record<string, number> = {};
    for (const m of own) for (const [code, n] of Object.entries(m.votes)) addTo(residents, code, n);
    for (const [code, n] of Object.entries(residents)) {
      const provinceVotes = p.votes[code];
      if (provinceVotes === undefined) fail(`${p.name}: candidacy ${code} has votes in municipalities and no province row`);
      if (n > provinceVotes) fail(`${p.name}: candidacy ${code} has ${n} votes in its municipalities, more than the province row's ${provinceVotes}`);
    }
  }

  // The Catalonia row is the four provinces added up.
  for (const field of TOTAL_FIELDS) {
    const sum = sumOf(provinces.map((p) => p[field]));
    if (sum !== cat[field]) fail(`file 07: the provinces add up to ${sum} ${field}, the Catalonia row says ${cat[field]}`);
  }
  const byRegional: Record<string, number> = {};
  const seatsByRegional: Record<string, number> = {};
  for (const p of provinces) {
    for (const [code, n] of Object.entries(p.votes)) addTo(byRegional, candidacy(code).regional, n);
    for (const [code, n] of Object.entries(p.seatsByList)) addTo(seatsByRegional, candidacy(code).regional, n);
  }
  const votesDiff = sameVotes(byRegional, cat.votes);
  if (votesDiff) fail(`file 08: the provinces' candidacies by regional code do not add up to the Catalonia row (${votesDiff})`);
  const seatsDiff = sameVotes(seatsByRegional, cat.seatsByList);
  if (seatsDiff) fail(`file 08: the provinces' seats by regional code do not add up to the Catalonia row (${seatsDiff})`);

  // Labels: every candidacy in a Catalan municipality or row, and every regional code.
  const lists: Record<string, InteriorList> = {};
  const label = (code: string) => {
    const c = candidacy(code);
    if (!parsed.candidacies.has(c.regional)) fail(`candidacy ${code}: regional code ${c.regional} is not in file 03`);
    lists[code] ??= { short: c.short, name: c.name, regional: c.regional };
  };
  for (const m of catalan) Object.keys(m.votes).forEach(label);
  for (const p of provinces) Object.keys(p.votes).forEach(label);
  Object.keys(cat.votes).forEach(label);

  const residentsVotes: Record<string, number> = {};
  for (const m of catalan) for (const [code, n] of Object.entries(m.votes)) addTo(residentsVotes, lists[code]!.regional, n);
  const residentsTotals = Object.fromEntries(TOTAL_FIELDS.map((field) => [field, sumOf(catalan.map((m) => m[field]))])) as unknown as Totals;
  return {
    lists,
    catalonia: { ...countsOf(residentsTotals), votes: residentsVotes },
    cataloniaTotal: { ...countsOf(cat), votes: { ...cat.votes } },
    cataloniaSeats: Object.fromEntries(Object.entries(cat.seatsByList).filter(([, n]) => n > 0)),
  };
}

/** One municipality's counts. Refuses a town missing from the file, outside Catalonia, unofficial or empty. */
export function townResult(parsed: ParsedElection, code: string): RegionalVotes {
  const m = parsed.municipalities.get(code);
  if (!m) fail(`municipality ${code} is not in file 05`);
  if (m.region !== CATALONIA_REGION) fail(`municipality ${code} (${m.name}) is not in Catalonia`);
  if (m.official !== "S") fail(`${code} ${m.name}: not marked as official data ("Datos oficiales" = ${m.official})`);
  const c = countsOf(m);
  const sum = sumOf(Object.values(m.votes));
  if (sum !== c.listVotes) fail(`${code} ${m.name}: candidacies add up to ${sum}, the list-vote total is ${c.listVotes}`);
  if (c.voters <= 0 || c.voters > c.electorate) fail(`${code} ${m.name}: ${c.voters} voters for ${c.electorate} electors`);
  return { ...c, votes: { ...m.votes } };
}

/**
 * Everything the 29N slot stores, or an `InteriorFileError` saying what is
 * wrong. Nothing is returned unless every check passes.
 */
export function buildGeneralImport(parsed: ParsedElection, towns: readonly string[], expect: ImportExpectation): GeneralImport {
  if (parsed.type !== expect.type) fail(`the file is for election type ${parsed.type}; expected ${expect.type} (Congress)`);
  if (parsed.date !== expect.date) fail(`the file is for the election of ${parsed.date}; this slot is for ${expect.date}`);
  const catalonia = checkCatalonia(parsed);
  const results = new Map<string, RegionalVotes>();
  for (const code of towns) {
    if (results.has(code)) fail(`municipality ${code} requested twice`);
    const town = townResult(parsed, code);
    for (const list of Object.keys(town.votes)) if (!catalonia.lists[list]) fail(`${code}: candidacy ${list} has no label`);
    results.set(code, town);
  }
  return { date: parsed.date, ...catalonia, towns: results };
}

/* -------------------------------------------------------------------------- */
/* Cross-check against the Generalitat's open data (2023 Congress)            */
/* -------------------------------------------------------------------------- */

/**
 * Interior's regional codes to the Generalitat's list codes, matched by
 * Catalonia's resident vote (both without the vote from abroad): each count
 * must find exactly one partner, and the abbreviations must then agree too.
 */
export function generalitatMapping(
  interior: RegionalVotes,
  interiorLists: Record<string, InteriorList>,
  generalitat: RegionalVotes,
  generalitatLists: Record<string, ListLabel>,
): Map<string, string> {
  const mapping = new Map<string, string>();
  const used = new Set<string>();
  for (const [code, n] of Object.entries(interior.votes)) {
    if (n === 0) continue;
    const partners = Object.entries(generalitat.votes)
      .filter(([, v]) => v === n)
      .map(([c]) => c);
    if (partners.length !== 1) fail(`regional code ${code} (${n} votes) matches ${partners.length} Generalitat lists`);
    const partner = partners[0]!;
    if (used.has(partner)) fail(`Generalitat list ${partner} matched twice`);
    const a = interiorLists[code]?.short ?? "";
    const b = generalitatLists[partner]?.short ?? "";
    if (a.toLocaleUpperCase("es") !== b.toLocaleUpperCase("es")) fail(`regional code ${code} "${a}" matched Generalitat list ${partner} "${b}"`);
    used.add(partner);
    mapping.set(code, partner);
  }
  return mapping;
}

/** Differences between Interior's and the Generalitat's figures for one town; empty when they match exactly. */
export function compareTown(town: RegionalVotes, lists: Record<string, InteriorList>, mapping: Map<string, string>, generalitat: RegionalVotes): string[] {
  const out: string[] = [];
  for (const field of ["electorate", "voters", "nullVotes", "blankVotes", "listVotes", "validVotes"] as const) {
    if (town[field] !== generalitat[field]) out.push(`${field}: Interior ${town[field]}, Generalitat ${generalitat[field]}`);
  }
  const mapped: Record<string, number> = {};
  for (const [code, n] of Object.entries(town.votes)) {
    const regional = lists[code]?.regional ?? code;
    const target = mapping.get(regional);
    if (target === undefined) {
      if (n > 0) out.push(`candidacy ${code}: ${n} votes and no Generalitat list`);
      continue;
    }
    addTo(mapped, target, n);
  }
  const diff = sameVotes(mapped, generalitat.votes);
  if (diff) out.push(`list ${diff}`);
  return out;
}
