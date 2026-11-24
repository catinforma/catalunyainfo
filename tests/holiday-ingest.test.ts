import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { SNAPSHOT, nextYearPlacesOn, regionalDays } from "../src/lib/programmatic/holidays/data.ts";
import { dateContent2027 } from "../src/lib/programmatic/holidays/dates-2027.ts";
import { buildNextYear, dogcRef, findLocalOrders, parseSummary, sourceRefOf } from "../src/lib/programmatic/holidays/ingest.ts";

/**
 * The day the 2027 local-holiday order appears (`npm run holidays:snapshot -- ingest`).
 *
 * No 2027 order exists yet (24 Nov 2026: DOGC 9801 has none), so nothing here
 * is invented 2027 data. The fixtures are real:
 *  - `ordre-emt-208-2025.txt` and `ordre-emt-3-2026.txt`: the 2026 order and
 *    its amendment, as `pdftotext` prints them. The tests run the 2027 pipeline
 *    on them with the year label moved to 2027 ("per a l'any 2026" -> 2027), so
 *    they prove the format, the matching and the checks, not any 2027 date.
 *  - `dogc-summary-9565-…json`: the real summary (DOGC API) of the issue that
 *    carried the 2026 order (17.12.2025), cut to the Department's header.
 *  - `dogc-summary-9801-…json`: the real summary of 24.11.2026, which has no
 *    local order.
 */

const ROOT = join(import.meta.dirname, "..");
const fixture = (name: string) => readFileSync(join(ROOT, "tests/fixtures/holidays", name), "utf8");
const summary = (name: string) => parseSummary(JSON.parse(fixture(name)));

const ORDER_2026 = fixture("ordre-emt-208-2025.txt");
const AMENDMENT_2026 = fixture("ordre-emt-3-2026.txt");
const asYear2027 = (text: string) => text.replaceAll("per a l'any 2026", "per a l'any 2027");
const SHIFT = (iso: string) => iso.replace(/^2026-/, "2027-");

const SOURCE = { name: "Ordre (format test)", ref: "DOGC núm. 0, de 1.1.2027", url: "https://dogc.gencat.cat/ca/document-del-dogc/?documentId=0" };
function build(orderText: string, extra: Partial<Parameters<typeof buildNextYear>[0]> = {}) {
  return buildNextYear({
    orderText,
    amendmentTexts: [AMENDMENT_2026],
    snapshot: SNAPSHOT,
    year: 2027,
    source: SOURCE,
    readOn: "2026-12-17",
    regionalDates: (aran) => regionalDays(2027, aran).map((d) => d.date),
    ...extra,
  });
}

/* -------------------------------------------------------------------------- */
/* Finding the order in the DOGC summaries                                    */
/* -------------------------------------------------------------------------- */

test("find: the summary of 17.12.2025 yields the 2026 order, with the reference the snapshot already carries", () => {
  const [issue] = summary("dogc-summary-9565-empresa-i-treball.json");
  assert.ok(issue);
  assert.equal(issue.numDOGC, 9565);
  assert.equal(issue.date, "2025-12-17");
  const hits = findLocalOrders(issue, 2026);
  assert.equal(hits.length, 1);
  assert.equal(hits[0]!.kind, "order");
  assert.equal(hits[0]!.documentId, "1032232");
  assert.deepEqual(sourceRefOf(hits[0]!), SNAPSHOT.sources.localOrder);
  assert.deepEqual(findLocalOrders(issue, 2027), [], "an order of another year is not this year's");
});

test("find: the summary of 24.11.2026 has no local order, and documents inside sub-headers are still read", () => {
  const [issue] = summary("dogc-summary-9801-empresa-i-treball.json");
  assert.ok(issue);
  assert.equal(issue.numDOGC, 9801);
  assert.equal(issue.date, "2026-11-24");
  assert.ok(issue.documents.some((d) => d.title.startsWith("Resolució EMT/4313/2026")), "a document under a sub-header (Agència Catalana del Consum)");
  assert.deepEqual(findLocalOrders(issue, 2027), []);
  assert.deepEqual(findLocalOrders(issue, 2026), []);
});

test("find: amendments and corrections are told from the order, and older titles still match", () => {
  const doc = (title: string) => ({ title, documentId: "1", numDOGC: 1, date: "2026-01-01" });
  const kind = (title: string, year: number) => findLocalOrders({ numDOGC: 1, date: "2026-01-01", documents: [doc(title)] }, year)[0]?.kind ?? null;
  // Titles as Treball's "Normativa relacionada" lists them.
  assert.equal(kind("Ordre EMT/208/2025, d'11 de desembre, per la qual s'estableix el calendari de festes locals a Catalunya per a l'any 2026", 2026), "order");
  assert.equal(
    kind("Ordre EMT/3/2026, de 14 de gener, de modificació de l'Ordre EMT/208/2025, d'11 de desembre, per la qual s'estableix el calendari de festes locals a Catalunya per a l'any 2026", 2026),
    "amendment",
  );
  assert.equal(
    kind("Correcció d'errades a l'Ordre TSF/341/2016, de 30 de novembre, per la qual s'estableix el calendari de festes locals a Catalunya per a l'any 2017", 2017),
    "correction",
  );
  assert.equal(kind("Ordre TSF/341/2016, de 30 de novembre, per la qual s'estableix el calendari de festes locals a la Comunitat Autònoma de Catalunya per a l'any 2017", 2017), "order");
  // Not local orders.
  assert.equal(kind("Ordre EMT/52/2026, de 25 de març, per la qual s'estableix el calendari oficial de festes laborals a Catalunya per a l'any 2027", 2027), null);
  assert.equal(kind("Ordre EMT/77/2025, de 22 de maig, calendari d'obertura dels establiments comercials en diumenge i dies festius per a l'any 2026", 2026), null);
});

test("find: an annex shares its issue's number, and the reference is written without zero padding", () => {
  const issues = parseSummary({
    sumaris: [
      { numDOGC: "9791", dateDOGC: "10/11/2026", section: [] },
      { numDOGC: "9791A", dateDOGC: "10/11/2026", section: [{ title: "Anuncis", header: [{ title: "X", document: [{ title: "Edicte", linkDownloadDocumentPDF: "https://portaldogc.gencat.cat/x?documentId=42&type=01" }] }] }] },
    ],
  });
  assert.deepEqual(issues.map((i) => i.numDOGC), [9791, 9791]);
  assert.equal(issues[1]!.documents[0]!.documentId, "42");
  assert.equal(dogcRef({ numDOGC: 9565, date: "2025-12-17" }), "DOGC núm. 9565, de 17.12.2025");
  assert.equal(dogcRef({ numDOGC: 9586, date: "2026-01-20" }), "DOGC núm. 9586, de 20.1.2026");
  assert.equal(dogcRef({ numDOGC: 9406, date: "2025-05-06" }), "DOGC núm. 9406, de 6.5.2025");
  assert.throws(() => parseSummary({ error: "x" }), /sumaris/);
});

/* -------------------------------------------------------------------------- */
/* The pipeline, on the 2026 order's real text with the year label moved      */
/* -------------------------------------------------------------------------- */

test("ingest: every town of the snapshot gets two days, nothing blocks, Aran is read", () => {
  const result = build(asYear2027(ORDER_2026));
  assert.deepEqual(result.errors, []);
  const s = result.stats;
  assert.equal(s.listedTowns, 917);
  assert.equal(s.townsWithOwnDays + s.townsNucleiOnly, 917);
  assert.equal(s.townsWithOwnDays, 886);
  assert.equal(s.townsNucleiOnly, 31);
  assert.equal(s.aranTowns, 8);
  assert.equal(s.amendmentsApplied, 10);
  assert.equal(s.unlistedStill.length, 30, "the councils the 2026 order left out are still 'proposta no formulada' in this text");
  assert.deepEqual(s.unlistedNowListed, []);
  assert.ok(s.orderEntries > 1300);

  // The result is the snapshot's own days, one year on, for every town and nucleus.
  assert.equal(Object.keys(result.next.municipalities).length, 917);
  for (const m of SNAPSHOT.municipalities) {
    const found = result.next.municipalities[m.slug];
    assert.ok(found, m.name);
    assert.deepEqual(found.local, m.local.map(SHIFT), m.name);
    assert.deepEqual(found.nuclei, m.nuclei.map((n) => ({ name: n.name, dates: n.dates.map(SHIFT) })), `${m.name} nuclei`);
    assert.ok(found.local.length === 2 || (found.local.length === 0 && found.nuclei.length > 0), m.name);
  }
  assert.deepEqual(result.next.order, SOURCE);
  assert.equal(result.next.readOn, "2026-12-17");
  // What `--write` stores is plain JSON the pages read back unchanged.
  assert.deepEqual(JSON.parse(JSON.stringify(result.next)), result.next);

  // Warnings are only the known kinds: Seguer's single day, or a day on a Catalonia-wide holiday.
  for (const w of result.warnings) assert.match(w, /Seguer|already a Catalonia-wide holiday/, w);
});

test("ingest: the year in the order must be the year asked for", () => {
  const result = build(ORDER_2026);
  assert.ok(result.errors.some((e) => /the order is for 2026, expected 2027/.test(e)), result.errors.join("; "));
});

test("ingest: what a person must decide is an error, not a guess", () => {
  const text = asYear2027(ORDER_2026);
  // Without the January amendment, Viladecans has no proposal and Sitges one day.
  const withoutAmendment = build(text, { amendmentTexts: [] });
  assert.ok(withoutAmendment.errors.some((e) => e.startsWith("Viladecans") && e.includes("proposta no formulada")));
  assert.ok(withoutAmendment.errors.some((e) => e.startsWith("Sitges") && e.includes("1 dates")));
  // A town that disappears from the text.
  const gone = build(text.replace("Girona, 25 de juliol i 29 d'octubre.", ""));
  assert.ok(gone.errors.some((e) => e.startsWith("Girona")), gone.errors.join("; "));
  // Three days for one town.
  const three = build(text.replace("Girona, 25 de juliol i 29 d'octubre.", "Girona, 25 de juliol, 29 d'octubre i 30 d'octubre."));
  assert.ok(three.errors.some((e) => e.startsWith("Girona") && e.includes("3 dates")), three.errors.join("; "));
  // A date from the wrong year cannot reach the file (an order for 2027 that prints a 2026 date is not possible to parse; the check is on the result).
  assert.ok(build(text).errors.every((e) => !/is not a 2027 date/.test(e)));
});

test("ingest: a council the 2026 order left out that now has two days gets its page's data", () => {
  const text = asYear2027(ORDER_2026).replace("Aiguafreda, proposta no formulada.", "Aiguafreda, 4 de maig i 7 de desembre.");
  const result = build(text);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.stats.unlistedNowListed, ["Aiguafreda"]);
  assert.equal(result.stats.unlistedStill.length, 29);
  assert.deepEqual(result.next.municipalities["aiguafreda"], { local: ["2027-05-04", "2027-12-07"], nuclei: [] });
  assert.equal(result.stats.listedTowns, 917, "the listed count is the snapshot's; the new town is counted apart");
});

test("ingest: a left-out council that vanishes from the order is a warning, not an error", () => {
  const result = build(asYear2027(ORDER_2026).replace("Aiguafreda, proposta no formulada.", ""));
  assert.deepEqual(result.errors, []);
  assert.ok(result.warnings.some((w) => w.includes("Aiguafreda") && w.includes("not in the order at all")));
});

test("ingest: a local day on a Catalonia-wide holiday is flagged, and Aran has its own list (29 March is not a holiday there, 17 June is)", () => {
  const text = asYear2027(ORDER_2026);
  // Catalonia 2027: 1 Nov and 29 Mar are holidays; Aran: 1 Nov and 17 Jun are, 29 Mar is not.
  const girona = build(text.replace("Girona, 25 de juliol i 29 d'octubre.", "Girona, 1 de novembre i 29 d'octubre."));
  assert.ok(girona.warnings.some((w) => w.startsWith("Girona:") && w.includes("2027-11-01")), girona.warnings.join("; "));

  const arresMarch = build(text.replace("Arres, 20 de gener i 29 d'agost.", "Arres, 29 de març i 29 d'agost."));
  assert.ok(!arresMarch.warnings.some((w) => w.startsWith("Arres")), "29 March is an ordinary working day in Aran in 2027");
  const gironaMarch = build(text.replace("Girona, 25 de juliol i 29 d'octubre.", "Girona, 29 de març i 29 d'octubre."));
  assert.ok(gironaMarch.warnings.some((w) => w.startsWith("Girona:") && w.includes("2027-03-29")));

  const arresJune = build(text.replace("Arres, 20 de gener i 29 d'agost.", "Arres, 17 de juny i 29 d'agost."));
  assert.ok(arresJune.warnings.some((w) => w.startsWith("Arres (Aran):") && w.includes("2027-06-17")), arresJune.warnings.join("; "));
  assert.deepEqual(arresJune.errors, []);
});

test("ingest: an entry of the order that no town claims is listed (a new or renamed place)", () => {
  const result = build(asYear2027(ORDER_2026).replace("Aiguafreda, proposta no formulada.", "Aiguafreda, proposta no formulada. Poblenou de Proves, 4 de maig i 7 de desembre."));
  assert.ok(result.warnings.some((w) => w.includes("Poblenou de Proves")), result.warnings.join("; "));
  assert.deepEqual(result.errors, []);
});

/* -------------------------------------------------------------------------- */
/* What the pages do once the file is written                                 */
/* -------------------------------------------------------------------------- */

test("switch: with the order parsed, the 2027 date pages read it (status dogc, one place per entry) in ca, es and en", () => {
  const { next } = build(asYear2027(ORDER_2026));
  // 24 June is a Catalonia-wide holiday; pick a day with several local holidays instead.
  const counts = new Map<string, number>();
  for (const m of Object.values(next.municipalities)) for (const d of m.local) counts.set(d, (counts.get(d) ?? 0) + 1);
  const [busiest] = [...counts.entries()].filter(([d]) => !regionalDays(2027).some((r) => r.date === d)).sort((a, b) => b[1] - a[1]);
  assert.ok(busiest);
  const places = nextYearPlacesOn(busiest[0], next);
  assert.equal(places.status, "dogc");
  assert.equal(places.known, 917);
  assert.ok(places.places.length >= busiest[1], "a place per town with the day, plus nuclei");
  assert.deepEqual(places.councils, [], "once the order is out the council's own act no longer counts");
  for (const locale of ["ca", "es", "en"] as const) {
    const content = dateContent2027(busiest[0], locale, next);
    assert.ok(!/undefined|NaN|\{\w+\}/.test(JSON.stringify(content)), `${locale}`);
  }
  // Before the order: nothing from the file, the pages keep their "pending" wording.
  assert.equal(nextYearPlacesOn(busiest[0], { order: null, readOn: null, municipalities: {} }).status, "council");
});

/* -------------------------------------------------------------------------- */
/* The command, offline, on the real fixtures                                 */
/* -------------------------------------------------------------------------- */

function script(args: string[]) {
  return spawnSync(
    process.execPath,
    ["--experimental-strip-types", "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "--import", "./tests/register-alias.mjs", "scripts/holidays-snapshot.ts", ...args],
    { cwd: ROOT, encoding: "utf8", timeout: 120_000 },
  );
}
const LOCAL_2027_JSON = join(ROOT, "src/lib/programmatic/holidays/local-2027.json");

test("command: prepare2027 on the 2026 order is a clean dry run and writes nothing", () => {
  const before = readFileSync(LOCAL_2027_JSON, "utf8");
  const run = script([
    "prepare2027",
    "--order",
    "tests/fixtures/holidays/ordre-emt-208-2025.txt",
    "--amend",
    "tests/fixtures/holidays/ordre-emt-3-2026.txt",
    "--year",
    "2026",
  ]);
  assert.equal(run.status, 0, run.stdout + run.stderr);
  assert.match(run.stdout, /order entries \d+, amendments applied 10; towns on the list 917: 886 with two days of their own, 31 by nuclei only/);
  assert.match(run.stdout, /DRY RUN: clean/);
  assert.equal(readFileSync(LOCAL_2027_JSON, "utf8"), before);
});

test("command: --write refuses an order of the wrong year and leaves local-2027.json alone", () => {
  const before = readFileSync(LOCAL_2027_JSON, "utf8");
  const run = script([
    "prepare2027",
    "--order",
    "tests/fixtures/holidays/ordre-emt-208-2025.txt",
    "--amend",
    "tests/fixtures/holidays/ordre-emt-3-2026.txt",
    "--write",
    "--name",
    "x",
    "--ref",
    "y",
    "--url",
    "https://dogc.gencat.cat/ca/document-del-dogc/?documentId=1",
  ]);
  assert.notEqual(run.status, 0);
  assert.match(run.stdout + run.stderr, /the order is for 2026, expected 2027/);
  assert.equal(readFileSync(LOCAL_2027_JSON, "utf8"), before);
});
