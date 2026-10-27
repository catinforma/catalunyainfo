/**
 * Builds the election-results snapshot for the per-municipality pages
 * (`/ca/eleccions/<slug>/`, `/es/elecciones/<slug>/`, `/en/elections/<slug>/`).
 *
 * Usage: `node --experimental-strip-types scripts/elections-snapshot.ts`
 * Writes `src/lib/programmatic/elections/snapshot.ts` (generated: do not edit
 * by hand). When nothing but the read date would change, the file is left
 * alone, so a re-run on unchanged data produces no diff and no revalidation.
 *
 * Sources, all official and all read at run time:
 *   - Idescat, population API (`pob/v1`): population on 1 January per
 *     municipality (padró municipal d'habitants). Picks the 100 largest.
 *   - Generalitat open data, Processos electorals: `tgns-3xuy` (elections),
 *     `irrv-2mfc` (electorate, voters, blank and null votes), `ntc4-rnwr`
 *     (votes and seats per list). Municipality rows (`MU`) for the 2023
 *     municipal (M20231), 2023 Congress (G20231) and 2024 Parliament (A20241)
 *     elections, plus the Catalonia rows and the four "Residents Absents"
 *     rows (vote from abroad) for the last two.
 *   - Generalitat, register of local authorities (`6nei-4b44`, comarca,
 *     province and current mayor) and mayors' history (`2v2p-vu4h`). A mayor
 *     is kept only when both registers give the same name.
 *
 * Only counts are stored. Percentages are computed on the page from them,
 * never copied from the source's percentage fields (see
 * `src/lib/content/elections/history.ts` for the case of a wrong one).
 *
 * Every invariant the page relies on is asserted here before anything is
 * written: list votes + blank = valid, valid + null = voters, the lists' votes
 * add up to the list total, the councillors add up to the council size.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { displayName, slugify } from "../src/lib/programmatic/elections/names.ts";
import type {
  CataloniaRegional,
  Counts,
  ElectionKey,
  ElectionMeta,
  ElectionsSnapshot,
  Mayor,
  MunicipalList,
  Municipality,
  RegionalVotes,
  SourceRef,
} from "../src/lib/programmatic/elections/types.ts";

const TOP = 100;
const SOCRATA = "https://analisi.transparenciacatalunya.cat";
const IDESCAT = "https://api.idescat.cat/pob/v1/cerca.json";
const OUT = join(import.meta.dirname, "..", "src", "lib", "programmatic", "elections", "snapshot.ts");

const IDS: Record<ElectionKey, string> = { municipal: "M20231", congress: "G20231", parliament: "A20241" };

type Row = Record<string, string | undefined>;

async function getJson<T>(url: string): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(60_000) });
    if (response.ok) return (await response.json()) as T;
    if (attempt >= 3) throw new Error(`${response.status} ${url}\n${(await response.text()).slice(0, 400)}`);
    await new Promise((resolve) => setTimeout(resolve, 2_000 * attempt));
  }
}

async function soql(dataset: string, where: string, select: string): Promise<Row[]> {
  const url = `${SOCRATA}/resource/${dataset}.json?$where=${encodeURIComponent(where)}&$select=${encodeURIComponent(select)}&$limit=50000`;
  const rows = await getJson<Row[]>(url);
  if (rows.length >= 50_000) throw new Error(`${dataset}: hit the row limit`);
  return rows;
}

async function datasetSource(id: string, publisher: string): Promise<SourceRef> {
  const meta = await getJson<{ name: string; rowsUpdatedAt: number; attribution?: string }>(`${SOCRATA}/api/views/${id}.json`);
  return {
    name: meta.name,
    publisher: meta.attribution ? `Generalitat de Catalunya, ${meta.attribution}` : publisher,
    url: `${SOCRATA}/d/${id}`,
    updated: new Date(meta.rowsUpdatedAt * 1000).toISOString().slice(0, 10),
  };
}

const int = (value: string | undefined, label: string): number => {
  const n = Number(value);
  if (value === undefined || !Number.isInteger(n) || n < 0) throw new Error(`not a count: ${label} = ${value}`);
  return n;
};

function counts(row: Row | undefined, label: string): Counts {
  if (!row) throw new Error(`missing turnout row: ${label}`);
  const c: Counts = {
    electorate: int(row.cens_electoral, `${label} cens_electoral`),
    voters: int(row.votants, `${label} votants`),
    nullVotes: int(row.vots_nuls, `${label} vots_nuls`),
    blankVotes: int(row.vots_blancs, `${label} vots_blancs`),
    listVotes: int(row.vots_candidatures, `${label} vots_candidatures`),
    validVotes: int(row.vots_valids, `${label} vots_valids`),
  };
  assert(c.listVotes + c.blankVotes === c.validVotes, `${label}: list + blank != valid`);
  assert(c.validVotes + c.nullVotes === c.voters, `${label}: valid + null != voters`);
  assert(c.voters <= c.electorate, `${label}: voters > electorate`);
  return c;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`invariant failed: ${message}`);
}

const pad = (code: string | undefined) => (code ?? "").trim().padStart(5, "0");

/** Madrid date of the run: the date printed as "read on". */
function madridToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
}

/* -------------------------------------------------------------------------- */

interface IdescatEntry {
  title: string;
  updated: string;
  "cross:DataSet": { "cross:Section": { AREA: string; TIME_PERIOD: string; "cross:Obs": { SEX: string; OBS_VALUE: string }[] | { SEX: string; OBS_VALUE: string } } };
}

async function loadPopulation() {
  const all: { idescat: string; sortName: string; population: number; period: string; updated: string }[] = [];
  for (let position = 0; ; position += 50) {
    const page = await getJson<{ feed: { "opensearch:totalResults": string; entry?: IdescatEntry | IdescatEntry[] } }>(
      `${IDESCAT}?q=&tipus=mun&lang=ca&posicio=${position}`,
    );
    const entries = ([] as IdescatEntry[]).concat(page.feed.entry ?? []);
    for (const entry of entries) {
      const section = entry["cross:DataSet"]["cross:Section"];
      const total = ([] as { SEX: string; OBS_VALUE: string }[]).concat(section["cross:Obs"]).find((obs) => obs.SEX === "T");
      all.push({
        idescat: section.AREA,
        sortName: entry.title,
        population: int(total?.OBS_VALUE, `population ${entry.title}`),
        period: section.TIME_PERIOD,
        updated: entry.updated.slice(0, 10),
      });
    }
    if (entries.length === 0 || all.length >= Number(page.feed["opensearch:totalResults"])) break;
  }
  assert(all.length >= 940, `Idescat returned ${all.length} municipalities`);
  const periods = new Set(all.map((row) => row.period));
  assert(periods.size === 1, `mixed population periods ${[...periods].join(", ")}`);
  all.sort((a, b) => b.population - a.population || a.sortName.localeCompare(b.sortName, "ca"));
  return all;
}

async function main() {
  const readAt = madridToday();
  const population = await loadPopulation();
  const top = population.slice(0, TOP);
  const codes = top.map((row) => row.idescat.slice(0, 5));
  const variants = [...new Set(codes.flatMap((code) => [code, code.replace(/^0+/, "")]))].map((code) => `'${code}'`).join(",");

  const [electionRows, entities, mayors] = await Promise.all([
    soql("tgns-3xuy", `id_eleccio in('${Object.values(IDS).join("','")}')`, "id_eleccio,nom_eleccio,data_eleccio"),
    soql("6nei-4b44", "coditipus='2'", "codi_ens,municipi,comarca,provincia,president,cens,any_cens"),
    soql("2v2p-vu4h", "legislatura_alcalde='2023-2027'", "codi_10,nom_alcalde,partit_alcalde,data_pressa_possessio,data_baixa"),
  ]);

  const entityBy = new Map(entities.map((row) => [(row.codi_ens ?? "").slice(0, 6), row]));
  const mayorsBy = new Map<string, Row[]>();
  for (const row of mayors) {
    const key = (row.codi_10 ?? "").slice(0, 6);
    mayorsBy.set(key, [...(mayorsBy.get(key) ?? []), row]);
  }

  const elections = {} as Record<ElectionKey, ElectionMeta>;
  for (const key of Object.keys(IDS) as ElectionKey[]) {
    const row = electionRows.find((r) => r.id_eleccio === IDS[key]);
    assert(row?.nom_eleccio && row.data_eleccio, `election ${IDS[key]} missing from tgns-3xuy`);
    elections[key] = { id: IDS[key], name: row.nom_eleccio.trim(), date: row.data_eleccio.slice(0, 10) };
  }

  const turnoutSelect = "territori_codi,territori_nom,cens_electoral,votants,vots_nuls,vots_blancs,vots_candidatures,vots_valids,escons,padro";
  const voteSelect = "territori_codi,candidatura_codi,candidatura_sigles,candidatura_denominacio,vots,escons";
  const mu = (id: string) => `id_eleccio='${id}' AND id_nivell_territorial='MU' AND territori_codi in(${variants})`;
  const ca = (id: string) => `id_eleccio='${id}' AND id_nivell_territorial='CA'`;
  // The vote from abroad appears as four pseudo-municipalities, code xx998.
  const abroad = (id: string) => `id_eleccio='${id}' AND id_nivell_territorial='MU' AND territori_codi in('08998','17998','25998','43998','8998')`;

  const turnout: Record<ElectionKey, Row[]> = { municipal: [], congress: [], parliament: [] };
  const votes: Record<ElectionKey, Row[]> = { municipal: [], congress: [], parliament: [] };
  for (const key of Object.keys(IDS) as ElectionKey[]) {
    [turnout[key], votes[key]] = await Promise.all([soql("irrv-2mfc", mu(IDS[key]), turnoutSelect), soql("ntc4-rnwr", mu(IDS[key]), voteSelect)]);
  }
  const [caTurnoutM, caTurnoutG, caVotesG, abTurnoutG, abVotesG, caTurnoutA, caVotesA, abTurnoutA, abVotesA] = await Promise.all([
    soql("irrv-2mfc", ca(IDS.municipal), turnoutSelect),
    soql("irrv-2mfc", ca(IDS.congress), turnoutSelect),
    soql("ntc4-rnwr", ca(IDS.congress), voteSelect),
    soql("irrv-2mfc", abroad(IDS.congress), turnoutSelect),
    soql("ntc4-rnwr", abroad(IDS.congress), voteSelect),
    soql("irrv-2mfc", ca(IDS.parliament), turnoutSelect),
    soql("ntc4-rnwr", ca(IDS.parliament), voteSelect),
    soql("irrv-2mfc", abroad(IDS.parliament), turnoutSelect),
    soql("ntc4-rnwr", abroad(IDS.parliament), voteSelect),
  ]);

  // Congress and Parliament list names come from the Catalonia rows.
  for (const [key, rows] of [["congress", caVotesG], ["parliament", caVotesA]] as const) {
    const lists: Record<string, { short: string; name: string }> = {};
    for (const row of rows) {
      const code = row.candidatura_codi ?? "";
      assert(code && !lists[code], `${key}: duplicate or empty list code ${code}`);
      lists[code] = { short: row.candidatura_sigles ?? "", name: row.candidatura_denominacio ?? "" };
    }
    elections[key].lists = lists;
  }

  const regional = (label: string, turnoutRow: Row | undefined, voteRows: Row[]): RegionalVotes => {
    const c = counts(turnoutRow, label);
    const byList: Record<string, number> = {};
    for (const row of voteRows) {
      const code = row.candidatura_codi ?? "";
      assert(code && byList[code] === undefined, `${label}: duplicate list ${code}`);
      byList[code] = int(row.vots, `${label} vots ${code}`);
    }
    const sum = Object.values(byList).reduce((a, b) => a + b, 0);
    assert(sum === c.listVotes, `${label}: lists add up to ${sum}, list total is ${c.listVotes}`);
    return { ...c, votes: byList };
  };

  const sumRegional = (label: string, turnoutRows: Row[], voteRows: Row[]): RegionalVotes => {
    assert(turnoutRows.length === 4, `${label}: expected 4 abroad rows, got ${turnoutRows.length}`);
    const parts = turnoutRows.map((row) =>
      regional(`${label} ${row.territori_codi}`, row, voteRows.filter((v) => pad(v.territori_codi) === pad(row.territori_codi))),
    );
    const total: RegionalVotes = { electorate: 0, voters: 0, nullVotes: 0, blankVotes: 0, listVotes: 0, validVotes: 0, votes: {} };
    for (const part of parts) {
      for (const field of ["electorate", "voters", "nullVotes", "blankVotes", "listVotes", "validVotes"] as const) total[field] += part[field];
      for (const [code, n] of Object.entries(part.votes)) total.votes[code] = (total.votes[code] ?? 0) + n;
    }
    return total;
  };

  const cataloniaRegional = (label: string, t: Row[], v: Row[], abT: Row[], abV: Row[]): CataloniaRegional => {
    assert(t.length === 1, `${label}: expected one Catalonia row`);
    const seats: Record<string, number> = {};
    for (const row of v) if (Number(row.escons) > 0) seats[row.candidatura_codi ?? ""] = int(row.escons, `${label} escons`);
    return { total: regional(`${label} CA`, t[0], v), seats, abroad: sumRegional(`${label} abroad`, abT, abV) };
  };

  assert(caTurnoutM.length === 1, "municipal: expected one Catalonia row");
  const catalonia = {
    municipal: counts(caTurnoutM[0], "M20231 CA"),
    congress: cataloniaRegional("G20231", caTurnoutG, caVotesG, abTurnoutG, abVotesG),
    parliament: cataloniaRegional("A20241", caTurnoutA, caVotesA, abTurnoutA, abVotesA),
  };
  assert(Object.values(catalonia.congress.seats).reduce((a, b) => a + b, 0) === 48, "Congress: Catalonia elects 48");
  assert(Object.values(catalonia.parliament.seats).reduce((a, b) => a + b, 0) === 135, "Parliament has 135 seats");

  const slugs = new Set<string>();
  const municipalities: Municipality[] = top.map((place) => {
    const code = place.idescat.slice(0, 5);
    const name = displayName(place.sortName);
    const slug = slugify(name);
    assert(!slugs.has(slug), `duplicate slug ${slug}`);
    slugs.add(slug);

    const entity = entityBy.get(place.idescat);
    assert(entity?.comarca && entity.provincia, `${name}: no entry in the register of local authorities`);

    const turnoutOf = (key: ElectionKey) => {
      const rows = turnout[key].filter((row) => pad(row.territori_codi) === code);
      assert(rows.length === 1, `${name} ${IDS[key]}: ${rows.length} turnout rows`);
      return rows[0];
    };
    const votesOf = (key: ElectionKey) => votes[key].filter((row) => pad(row.territori_codi) === code);

    // Municipal 2023
    const mRow = turnoutOf("municipal");
    const mCounts = counts(mRow, `${name} M20231`);
    const lists: MunicipalList[] = votesOf("municipal")
      .map((row) => ({
        code: row.candidatura_codi ?? "",
        short: row.candidatura_sigles ?? "",
        name: row.candidatura_denominacio ?? "",
        votes: int(row.vots, `${name} M vots`),
        seats: int(row.escons ?? "0", `${name} M escons`),
      }))
      .sort((a, b) => b.votes - a.votes || a.short.localeCompare(b.short, "ca"));
    assert(lists.length > 0 && lists.every((list) => list.code && list.short), `${name} M20231: empty lists`);
    assert(new Set(lists.map((list) => list.code)).size === lists.length, `${name} M20231: duplicate list codes`);
    const seats = int(mRow?.escons, `${name} M escons total`);
    assert(lists.reduce((a, l) => a + l.votes, 0) === mCounts.listVotes, `${name} M20231: lists do not add up to the list total`);
    assert(lists.reduce((a, l) => a + l.seats, 0) === seats, `${name} M20231: councillors do not add up to ${seats}`);

    // Mayor: only when both Generalitat registers agree on the name.
    const fold = (s: string | undefined) => (s ?? "").replace(/\s+/g, " ").trim().toLocaleLowerCase("ca");
    const current = (mayorsBy.get(place.idescat) ?? []).filter((row) => !row.data_baixa);
    let mayor: Mayor | null = null;
    if (current.length === 1 && current[0] && fold(current[0].nom_alcalde) && fold(current[0].nom_alcalde) === fold(entity.president)) {
      const party = (current[0].partit_alcalde ?? "").trim();
      mayor = {
        name: (current[0].nom_alcalde ?? "").replace(/\s+/g, " ").trim(),
        // The register truncates labels to ten characters; a label is shown
        // only when it is exactly one of the 2023 lists' abbreviations.
        party: lists.some((list) => list.short === party) ? party : "",
        since: (current[0].data_pressa_possessio ?? "").slice(0, 10),
      };
      assert(/^\d{4}-\d{2}-\d{2}$/.test(mayor.since), `${name}: mayor without a date`);
    }

    return {
      code,
      idescat: place.idescat,
      slug,
      name,
      comarca: entity.comarca.trim(),
      province: entity.provincia.trim(),
      population: place.population,
      mayor,
      municipal: { ...mCounts, seats, censusPopulation: int(mRow?.padro, `${name} padro`), lists },
      congress: regional(`${name} G20231`, turnoutOf("congress"), votesOf("congress")),
      parliament: regional(`${name} A20241`, turnoutOf("parliament"), votesOf("parliament")),
    };
  });

  const [votesSource, turnoutSource, electionsSource, entitiesSource, mayorsSource] = await Promise.all([
    datasetSource("ntc4-rnwr", "Generalitat de Catalunya"),
    datasetSource("irrv-2mfc", "Generalitat de Catalunya"),
    datasetSource("tgns-3xuy", "Generalitat de Catalunya"),
    datasetSource("6nei-4b44", "Generalitat de Catalunya"),
    datasetSource("2v2p-vu4h", "Generalitat de Catalunya"),
  ]);
  const first = population[0];
  assert(first, "no population");

  const snapshot: ElectionsSnapshot = {
    readAt,
    sources: {
      population: {
        name: "Població a 1 de gener (padró municipal d'habitants), per municipis",
        publisher: "Idescat, Institut d'Estadística de Catalunya",
        url: "https://www.idescat.cat/poblacio/",
        updated: first.updated,
        period: first.period,
      },
      votes: votesSource,
      turnout: turnoutSource,
      elections: electionsSource,
      entities: entitiesSource,
      mayors: mayorsSource,
    },
    elections,
    catalonia,
    municipalities,
  };

  const body = JSON.stringify(snapshot, null, 1);
  const file = [
    "// GENERATED by scripts/elections-snapshot.ts from the official sources listed in",
    "// `sources` below. Do not edit by hand: re-run the script.",
    'import type { ElectionsSnapshot } from "./types";',
    "",
    `export const SNAPSHOT: ElectionsSnapshot = ${body};`,
    "",
  ].join("\n");

  // Leave the file alone when only dates would change (the read date, and the
  // register of local authorities, which is re-stamped every day): no new
  // data, no diff, no revalidation, and the pages keep their one date.
  const previous = await readFile(OUT, "utf8").catch(() => "");
  const strip = (text: string) => text.replace(/"readAt": "[^"]*"/, "").replace(/"updated": "[^"]*"/g, "");
  if (previous && strip(previous) === strip(file)) {
    console.log(`unchanged (${municipalities.length} municipalities); kept readAt from the previous run`);
    return;
  }
  await writeFile(OUT, file, "utf8");
  console.log(`wrote ${OUT}: ${municipalities.length} municipalities, read ${readAt}`);
  console.log(`population: ${first.period}, 100th = ${top[TOP - 1]?.sortName} ${top[TOP - 1]?.population}, 101st = ${population[TOP]?.sortName} ${population[TOP]?.population}`);
  console.log(`mayors kept: ${municipalities.filter((m) => m.mayor).length}/${municipalities.length}`);
}

await main();
