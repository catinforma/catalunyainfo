/**
 * Builds and refreshes `src/lib/programmatic/holidays/snapshot.json`, the data
 * behind /ca/festius/ and /es/festivos/.
 *
 *   npm run holidays:snapshot -- build
 *       Re-reads the live sources (Generalitat open data b4eh-r8up, Idescat
 *       population and comarques) and the DOGC texts (by default the 2026
 *       texts committed under tests/fixtures/holidays/), cross-checks the open
 *       data against the DOGC (the DOGC wins) and writes the snapshot.
 *
 *   npm run holidays:snapshot -- check
 *       Reads the open-data metadata only and says whether rows for next year
 *       have appeared. Exits 0 either way; prints what changed.
 *
 *   npm run holidays:snapshot -- prepare2027 --order <file.txt|file.pdf|documentId> [--amend <…>] [--write]
 *       The 48-hour swap. Parses the 2027 local-holiday order (same format as
 *       Ordre EMT/208/2025: "Municipi, dd de mes i dd de mes."), finds each of
 *       the snapshot's municipalities and nuclei by the name and comarca they
 *       had in the 2026 order, and prints the result. With --write it stores
 *       the dates as `local2027` in src/lib/programmatic/holidays/local-2027.json
 *       - the pages then show them instead of "not published yet". Anything it
 *       cannot match is listed and the file is NOT written until it is fixed.
 *
 *   npm run holidays:snapshot -- urls
 *       Prints every URL of the family (for IndexNow or Search Console).
 *
 * A PDF is converted with `pdftotext -enc UTF-8` (Git for Windows ships it in
 * /mingw64/bin; poppler-utils elsewhere). A bare number is taken as a DOGC
 * documentId and downloaded from portaldogc.gencat.cat first.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import {
  articleFirst,
  nameKey,
  parseAmendments,
  parseLocalOrder,
  parseShopResolution,
  type OrderComarca,
} from "../src/lib/programmatic/holidays/dogc.ts";
import { applyAmendments, locate, nucleiAfter, sameComarca } from "../src/lib/programmatic/holidays/match.ts";
import { slugify } from "../src/lib/programmatic/holidays/slug.ts";
import type { DatePlace, HolidaySnapshot, NextYearLocal, SnapshotMunicipality } from "../src/lib/programmatic/holidays/types.ts";

const ROOT = resolve(import.meta.dirname, "..");
const SNAPSHOT = join(ROOT, "src/lib/programmatic/holidays/snapshot.json");
const LOCAL_2027 = join(ROOT, "src/lib/programmatic/holidays/local-2027.json");
const FIXTURES = join(ROOT, "tests/fixtures/holidays");

const YEAR = 2026;
const TOP = 100;
/** Dates the date pages (and the bridge/Christmas guides) talk about. */
const DATES_OF_INTEREST = ["2026-12-07", "2026-12-08", "2026-12-24", "2026-12-25", "2026-12-26", "2026-12-31"];

const SOCRATA = "https://analisi.transparenciacatalunya.cat";
const DATASET = "b4eh-r8up";
const IDESCAT_POPULATION = "https://www.idescat.cat/pub/?id=pmh&n=446&geo=mun&lang=ca";
const IDESCAT_COMARQUES = "https://www.idescat.cat/codis/?id=50&n=9";
const dogcPdf = (id: string) => `https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=${id}&type=01&language=ca_ES`;
const dogcPage = (id: string) => `https://dogc.gencat.cat/ca/document-del-dogc/?documentId=${id}`;

/**
 * Names the order prints differently from Idescat. Found by the build's own
 * report; every entry was checked against both texts on 27 Oct 2026.
 */
const DOGC_NAME_ALIASES: Record<string, string> = {};

/* -------------------------------------------------------------------------- */

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index > 0 ? process.argv[index + 1] : undefined;
}

function args(name: string): string[] {
  return process.argv.flatMap((value, index) => (value === `--${name}` && process.argv[index + 1] ? [process.argv[index + 1]!] : []));
}

function todayInMadrid(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, { headers: { "user-agent": "CatalunyaInfo holidays snapshot (+https://www.catalunyainfo.com)" }, signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}

/** A DOGC text: a .txt file, a .pdf (via pdftotext) or a documentId (downloaded). */
async function readDogc(source: string): Promise<string> {
  let path = source;
  if (/^\d{6,8}$/.test(source)) {
    const dir = mkdtempSync(join(tmpdir(), "dogc-"));
    path = join(dir, `${source}.pdf`);
    const response = await fetch(dogcPdf(source), { signal: AbortSignal.timeout(60_000) });
    if (!response.ok) throw new Error(`DOGC ${source}: HTTP ${response.status}`);
    writeFileSync(path, Buffer.from(await response.arrayBuffer()));
  }
  if (!existsSync(path)) throw new Error(`not found: ${path}`);
  if (path.toLowerCase().endsWith(".pdf")) {
    return execFileSync("pdftotext", ["-enc", "UTF-8", path, "-"], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  }
  return readFileSync(path, "utf8");
}

interface Row {
  data: string;
  ajuntament_o_nucli_municipal: string;
  codi_municipal: string;
  codi_municipi_ine: string;
  pedania: string;
}

/* -------------------------------------------------------------------------- */
/* build                                                                      */
/* -------------------------------------------------------------------------- */

async function build(): Promise<void> {
  const readOn = arg("date") ?? todayInMadrid();

  // Live sources.
  const meta = JSON.parse(await fetchText(`${SOCRATA}/api/views/${DATASET}.json`)) as { rowsUpdatedAt: number };
  const rows = JSON.parse(await fetchText(`${SOCRATA}/resource/${DATASET}.json?any_calendari=${YEAR}&$limit=20000`)) as Row[];
  const populationCsv = await fetchText(`${IDESCAT_POPULATION}&f=ssv`);
  const comarquesCsv = await fetchText(`${IDESCAT_COMARQUES}&f=ssv`);

  const popYear = Number(/Municipis\.\s*(\d{4})/.exec(populationCsv)?.[1]);
  if (!popYear) throw new Error("Idescat population table: no year in the header");
  const population = new Map<string, { name: string; total: number }>();
  for (const line of populationCsv.split(/\r?\n/)) {
    const cells = line.split(";");
    if (!/^\d{6}$/.test(cells[0] ?? "")) continue;
    population.set((cells[0] ?? "").slice(0, 5), { name: cells[1] ?? "", total: Number(cells[4]) });
  }
  const comarcaByIne = new Map<string, string>();
  for (const line of comarquesCsv.split(/\r?\n/)) {
    const cells = line.split(";");
    if (!/^\d{6}$/.test(cells[0] ?? "")) continue;
    comarcaByIne.set((cells[0] ?? "").slice(0, 5), cells[3] ?? "");
  }
  if (population.size < 940 || comarcaByIne.size < 940) throw new Error(`Idescat: only ${population.size} / ${comarcaByIne.size} municipalities`);

  // DOGC texts: the 2026 order, its amendments, the shop-opening resolution.
  const orderText = await readDogc(arg("order") ?? join(FIXTURES, "ordre-emt-208-2025.txt"));
  const amendTexts = await Promise.all((args("amend").length ? args("amend") : [join(FIXTURES, "ordre-emt-3-2026.txt")]).map(readDogc));
  const shopsText = await readDogc(arg("shops") ?? join(FIXTURES, "resolucio-emt-4342-2025.txt"));

  const order = parseLocalOrder(orderText);
  if (order.year !== YEAR) throw new Error(`order is for ${order.year}, expected ${YEAR}`);
  const amended = applyAmendments(order.comarques, amendTexts.flatMap((text) => parseAmendments(text, YEAR)));
  if (amended.unmatched.length) throw new Error(`amendments not matched: ${JSON.stringify(amended.unmatched)}`);
  const comarques = amended.comarques;
  const shops = parseShopResolution(shopsText);
  if (shops.defaults.length !== 10) throw new Error(`shop defaults: ${shops.defaults.length} days`);

  // Open data grouped by place.
  type Place = { code: string; ine: string; nucleus: boolean; name: string; dates: string[] };
  const places = new Map<string, Place>();
  for (const row of rows) {
    const date = (row.data ?? "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const place = places.get(row.codi_municipal) ?? {
      code: row.codi_municipal,
      ine: row.codi_municipi_ine,
      nucleus: row.pedania !== "000",
      name: row.ajuntament_o_nucli_municipal,
      dates: [],
    };
    if (!place.dates.includes(date)) place.dates.push(date);
    places.set(row.codi_municipal, place);
  }
  for (const place of places.values()) place.dates.sort();

  const comarcaOf = (ine: string): OrderComarca => {
    const name = comarcaByIne.get(ine) ?? "";
    const found = comarques.find((c) => sameComarca(c.heading, name));
    if (!found) throw new Error(`no comarca "${name}" for ${ine} in the order`);
    return found;
  };

  // Rank, skipping councils with no days at all ("proposta no formulada").
  const ranked = [...population.entries()].sort((a, b) => b[1].total - a[1].total);
  const municipalities: SnapshotMunicipality[] = [];
  const excluded: HolidaySnapshot["excluded"] = [];
  const report: string[] = [];

  for (const [ine, pop] of ranked) {
    if (municipalities.length >= TOP) break;
    const comarca = comarcaOf(ine);
    const own = [...places.values()].find((p) => p.ine === ine && !p.nucleus);
    const nucleiOpen = [...places.values()].filter((p) => p.ine === ine && p.nucleus).sort((a, b) => a.name.localeCompare(b.name, "ca"));

    const candidates = [DOGC_NAME_ALIASES[ine], pop.name, own?.name].filter((n): n is string => !!n);
    let located = null;
    let dogcName = pop.name;
    for (const candidate of candidates) {
      located = locate(comarca, candidate);
      if (located) {
        dogcName = candidate;
        break;
      }
    }
    if (!located) throw new Error(`${pop.name} (${ine}) not found in the order under ${comarca.heading}`);

    const local = located.shape === "own" ? [...located.entry.dates].sort() : [];
    const nuclei = nucleiOpen.length
      ? nucleiAfter(comarca, located, dogcName, nucleiOpen.map((n) => n.name))
      : { found: new Map(), missing: [] as string[] };
    // A nucleus the open data lists but the order does not name keeps the
    // municipality's days (Jesús, els Reguers and Vinallop in Tortosa: same
    // dates in the open data as Tortosa's own). Anything else stops the build.
    const ownDates = located.shape === "own" ? [...located.entry.dates].sort().join(",") : "";
    for (const missing of nuclei.missing) {
      const open = nucleiOpen.find((n) => n.name === missing);
      if (!open || open.dates.join(",") !== ownDates) {
        throw new Error(`${pop.name}: nucleus "${missing}" is in the open data with other days but not in the order`);
      }
      report.push(`Nucleus not named in the order, same days as the municipality (folded in): ${pop.name} / ${missing}`);
    }
    nucleiOpen.splice(0, nucleiOpen.length, ...nucleiOpen.filter((n) => !nuclei.missing.includes(n.name)));

    if (located.shape === "own" && located.entry.noProposal && nuclei.found.size === 0) {
      excluded.push({ name: articleFirst(pop.name), ine, population: pop.total, comarca: comarcaByIne.get(ine) ?? "", reason: "no-proposal" });
      continue;
    }

    const openDates = own?.dates ?? [];
    const correction = openDates.join(",") === local.join(",") ? null : { openData: openDates, by: amendedBy(comarca.heading, dogcName) };
    if (correction) report.push(`DOGC wins: ${pop.name} open data [${openDates.join(", ")}] -> DOGC [${local.join(", ")}] (${correction.by})`);

    const nucleusDays = nucleiOpen.map((n) => {
      const entry = nuclei.found.get(n.name);
      const dates = [...(entry?.dates ?? [])].sort();
      if (dates.join(",") !== n.dates.join(",")) report.push(`DOGC wins: ${pop.name} / ${n.name} open data [${n.dates.join(", ")}] -> [${dates.join(", ")}]`);
      return { name: articleFirst(n.name), dates };
    });

    const shopKeys = new Set([pop.name, dogcName, own?.name ?? pop.name].map(nameKey));
    const shopEntry = shops.councils.find((c) => shopKeys.has(nameKey(c.name)));
    const name = articleFirst(pop.name);
    municipalities.push({
      slug: slugify(name),
      ine,
      name,
      dogcName,
      comarca: comarcaByIne.get(ine) ?? "",
      population: pop.total,
      rank: municipalities.length + 1,
      local,
      nuclei: nucleusDays,
      correction,
      shops: shopEntry ? shopEntry.dates : shops.defaults,
      shopsOwnList: !!shopEntry,
    });
  }

  function amendedBy(heading: string, name: string): string {
    return amended.applied.some((a) => sameComarca(heading, a.comarca) && nameKey(a.name) === nameKey(name))
      ? "Ordre EMT/3/2026"
      : "Ordre EMT/208/2025";
  }

  // Every place with a local holiday on the dates of interest: the open data,
  // corrected by the DOGC where the two disagree, plus DOGC entries that are
  // municipalities missing from the open data altogether.
  const bySlugIne = new Map(municipalities.map((m) => [m.ine, m.slug]));
  const merged: { name: string; parent: string | null; ine: string; dates: string[] }[] = [];
  const matchedEntries = new Set<object>();
  const safeLocate = (comarca: OrderComarca, name: string, who: string) => {
    try {
      return locate(comarca, name);
    } catch (error) {
      report.push(`Ambiguous in the order, open data kept: ${who} (${error instanceof Error ? error.message : error})`);
      return null;
    }
  };
  // Nuclei are looked up per municipality, all of its nuclei at once, after
  // the municipality's entry (their names repeat across the comarca).
  const nucleusEntries = new Map<string, Map<string, (typeof comarques)[number]["entries"][number]>>();
  for (const ine of new Set([...places.values()].filter((p) => p.nucleus).map((p) => p.ine))) {
    const comarca = comarcaOf(ine);
    const parentName = population.get(ine)?.name ?? "";
    const parent = [parentName, [...places.values()].find((p) => p.ine === ine && !p.nucleus)?.name]
      .filter((n): n is string => !!n)
      .map((n) => ({ n, at: safeLocate(comarca, n, parentName) }))
      .find((x) => x.at);
    if (!parent?.at) continue;
    const names = [...places.values()].filter((p) => p.ine === ine && p.nucleus).map((p) => p.name);
    nucleusEntries.set(ine, nucleiAfter(comarca, parent.at, parent.n, names).found);
  }
  for (const place of places.values()) {
    const comarca = comarcaOf(place.ine);
    const parentName = population.get(place.ine)?.name ?? "";
    let dates = place.dates;
    if (!place.nucleus) {
      let own = safeLocate(comarca, place.name, place.name);
      if (!own) {
        // Idescat and the order can file a municipality under different
        // comarques (Torà: Solsonès / Segarra). Accept a unique exact match.
        const elsewhere = comarques.flatMap((c) => c.entries.filter((e) => nameKey(e.name) === nameKey(place.name)).map((e) => ({ c, e })));
        if (elsewhere.length === 1) {
          own = { entry: elsewhere[0]!.e, index: elsewhere[0]!.c.entries.indexOf(elsewhere[0]!.e), shape: "own" };
          report.push(`Found under another comarca in the order: ${place.name} (${elsewhere[0]!.c.heading})`);
        }
      }
      if (own) {
        matchedEntries.add(own.entry);
        if (own.shape === "own") dates = [...own.entry.dates].sort();
      }
    } else {
      const found = nucleusEntries.get(place.ine)?.get(place.name);
      if (found) {
        matchedEntries.add(found);
        dates = [...found.dates].sort();
      } else {
        // Not named in the order: it keeps its municipality's days, so it is
        // not a place of its own (Baltarga, Bor and Pi in Bellver de Cerdanya).
        const parentDates = [...places.values()].find((p) => p.ine === place.ine && !p.nucleus)?.dates ?? [];
        if (parentDates.join(",") === place.dates.join(",")) continue;
        report.push(`CHECK BY HAND: nucleus not in the order with its own days in the open data, kept: ${parentName} / ${place.name} [${place.dates.join(", ")}]`);
      }
    }
    if (dates.join(",") !== place.dates.join(",") && !municipalities.some((m) => m.ine === place.ine)) {
      report.push(`DOGC wins (outside the list): ${place.name} [${place.dates.join(", ")}] -> [${dates.join(", ")}]`);
    }
    merged.push({ name: articleFirst(place.name), parent: place.nucleus ? articleFirst(parentName) : null, ine: place.ine, dates });
  }
  const knownIne = new Set([...places.values()].map((p) => p.ine));
  const byKey = new Map([...population.entries()].map(([ine, p]) => [nameKey(p.name), ine]));
  for (const comarca of comarques) {
    for (const entry of comarca.entries) {
      if (matchedEntries.has(entry) || entry.noProposal) continue;
      const ine = byKey.get(nameKey(entry.name));
      if (ine && !knownIne.has(ine)) {
        report.push(`Only in the DOGC (added): ${entry.name} [${entry.dates.join(", ")}]`);
        merged.push({ name: articleFirst(entry.name), parent: null, ine, dates: [...entry.dates].sort() });
      } else if (!ine && entry.dates.some((d) => DATES_OF_INTEREST.includes(d))) {
        report.push(`CHECK BY HAND: unmatched DOGC entry with a date of interest: ${comarca.heading} / ${entry.name} [${entry.dates.join(", ")}]`);
      }
    }
  }

  const localByDate: Record<string, DatePlace[]> = {};
  for (const date of DATES_OF_INTEREST) {
    localByDate[date] = merged
      .filter((p) => p.dates.includes(date))
      .map((p) => ({ name: p.name, parent: p.parent, slug: p.parent ? null : (bySlugIne.get(p.ine) ?? null) }))
      .sort((a, b) => a.name.localeCompare(b.name, "ca"));
  }

  const snapshot: HolidaySnapshot = {
    schema: 1,
    readOn,
    year: YEAR,
    sources: {
      localOrder: { name: "Ordre EMT/208/2025, d'11 de desembre, per la qual s'estableix el calendari de festes locals a Catalunya per a l'any 2026", ref: "DOGC núm. 9565, de 17.12.2025", url: dogcPage("1032232") },
      localAmendments: [{ name: "Ordre EMT/3/2026, de 14 de gener, de modificació de l'Ordre EMT/208/2025", ref: "DOGC núm. 9586, de 20.1.2026", url: dogcPage("1034587") }],
      localOpenData: {
        name: "Calendari de festes locals a Catalunya",
        ref: DATASET,
        url: `${SOCRATA}/d/${DATASET}`,
        rowsUpdatedAt: new Date(meta.rowsUpdatedAt * 1000).toISOString().slice(0, 10),
        rows: rows.length,
      },
      regional: {
        "2026": { name: "Ordre EMT/66/2025, de 30 d'abril, per la qual s'estableix el calendari oficial de festes laborals a Catalunya per a l'any 2026", ref: "DOGC núm. 9406, de 6.5.2025", url: dogcPage("1013204") },
        "2027": { name: "Ordre EMT/52/2026, de 25 de març, per la qual s'estableix el calendari oficial de festes laborals a Catalunya per a l'any 2027", ref: "DOGC núm. 9637, de 1.4.2026", url: dogcPage("1040896") },
      },
      shops: { name: "Resolució EMT/4342/2025, de 20 de novembre, dates afegides o substituïdes en el calendari de dies festius amb obertura comercial autoritzada de diversos municipis per a l'any 2026", ref: "DOGC núm. 9551, de 27.11.2025", url: dogcPage("1030324") },
      shopsOrder: { name: "Ordre EMT/77/2025, de 22 de maig, calendari d'obertura dels establiments comercials en diumenge i dies festius per a l'any 2026", ref: "DOGC núm. 9421, de 27.5.2025", url: dogcPage("1015009") },
      population: { name: `Idescat, Padró municipal d'habitants: població a 1 de gener de ${popYear}, per municipis`, ref: `PMH ${popYear}`, url: IDESCAT_POPULATION, year: popYear },
      comarques: { name: "Idescat, codis territorials: municipis i comarques", ref: "Idescat codis", url: IDESCAT_COMARQUES },
    },
    municipalities,
    excluded,
    localByDate,
  };

  writeFileSync(SNAPSHOT, `${JSON.stringify(snapshot, null, 1)}\n`);
  console.log(`snapshot: ${municipalities.length} municipalities, ${excluded.length} excluded, read ${readOn}`);
  console.log(`open data: ${rows.length} rows, updated ${snapshot.sources.localOpenData.rowsUpdatedAt}; Idescat population ${popYear}`);
  for (const [date, list] of Object.entries(localByDate)) console.log(`${date}: ${list.length} places`);
  for (const line of report) console.log(line);
  for (const item of excluded) console.log(`excluded (no proposal in the order): ${item.name} (${item.population})`);
}

/* -------------------------------------------------------------------------- */
/* check                                                                      */
/* -------------------------------------------------------------------------- */

async function check(): Promise<void> {
  const snapshot = JSON.parse(readFileSync(SNAPSHOT, "utf8")) as HolidaySnapshot;
  const meta = JSON.parse(await fetchText(`${SOCRATA}/api/views/${DATASET}.json`)) as { rowsUpdatedAt: number };
  const updated = new Date(meta.rowsUpdatedAt * 1000).toISOString().slice(0, 10);
  const counts = JSON.parse(await fetchText(`${SOCRATA}/resource/${DATASET}.json?$select=any_calendari,count(*)&$group=any_calendari`)) as { any_calendari: string; count: string }[];
  const next = counts.find((c) => Number(c.any_calendari) === snapshot.year + 1);
  console.log(`open data updated ${updated} (snapshot read ${snapshot.sources.localOpenData.rowsUpdatedAt})`);
  console.log(next ? `${snapshot.year + 1}: ${next.count} rows are now in the open data` : `${snapshot.year + 1}: no rows yet - watch the DOGC for the order`);
  if (updated !== snapshot.sources.localOpenData.rowsUpdatedAt) console.log("The dataset changed since the snapshot: run `build` and review the report.");
}

/* -------------------------------------------------------------------------- */
/* prepare2027                                                                */
/* -------------------------------------------------------------------------- */

async function prepare(): Promise<void> {
  const source = arg("order");
  if (!source) throw new Error("--order <file.txt|file.pdf|documentId> is required");
  const snapshot = JSON.parse(readFileSync(SNAPSHOT, "utf8")) as HolidaySnapshot;
  const order = parseLocalOrder(await readDogc(source));
  const amendments = (await Promise.all(args("amend").map(readDogc))).flatMap((text) => parseAmendments(text, order.year));
  const amended = applyAmendments(order.comarques, amendments);

  const { extractLocalDays } = await import("../src/lib/programmatic/holidays/prepare.ts");
  const result = extractLocalDays(amended.comarques, snapshot.municipalities);
  for (const problem of [...amended.unmatched.map((u) => `amendment not matched: ${u.comarca} / ${u.name}`), ...result.problems]) console.log(`PROBLEM: ${problem}`);
  for (const m of snapshot.municipalities) {
    const found = result.municipalities[m.slug];
    console.log(`${m.name}: ${found ? found.local.join(", ") || "(nuclei only)" : "NOT FOUND"}`);
  }
  if (process.argv.includes("--write")) {
    if (result.problems.length || amended.unmatched.length) throw new Error("not written: fix the problems above first");
    const ref = arg("ref") ?? "";
    const name = arg("name") ?? "";
    const url = arg("url") ?? (/^\d+$/.test(source) ? dogcPage(source) : "");
    if (!ref || !name || !url) throw new Error("--name, --ref and --url (or a documentId as --order) are required with --write");
    if (order.year !== YEAR + 1) throw new Error(`the order is for ${order.year}, expected ${YEAR + 1}`);
    const out: NextYearLocal = { order: { name, ref, url }, readOn: todayInMadrid(), municipalities: result.municipalities };
    writeFileSync(LOCAL_2027, `${JSON.stringify(out, null, 1)}\n`);
    console.log(`written ${LOCAL_2027} (year ${order.year}): review the diff, run npm test, deploy`);
  }
}

/* -------------------------------------------------------------------------- */

async function urls(): Promise<void> {
  const { holidayFamilyPaths } = await import("../src/lib/programmatic/holidays/paths.ts");
  for (const entry of holidayFamilyPaths()) console.log(`https://www.catalunyainfo.com${entry.path}`);
}

const command = process.argv[2];
const run = { build, check, prepare2027: prepare, urls }[command ?? ""];
if (!run) {
  console.error("usage: holidays-snapshot.ts build | check | prepare2027 --order <…> [--amend <…>] [--write] | urls");
  process.exit(2);
}
run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
