import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount } from "../src/lib/content/blocks.ts";
import { DAY_DEPENDENT_BLOCKS, DAY_DEPENDENT_PATTERN } from "../src/lib/content/day-dependent.ts";
import { SNOW } from "../src/lib/content/batch02/pyrenees.ts";
import { SKI } from "../src/lib/content/batch02/ski.ts";
import { SNOW_NOW } from "../src/lib/content/batch02/snow-now.ts";
import { B2_PATHS, b2href } from "../src/lib/content/batch02/shared.ts";
import { IMAGES } from "../src/lib/content/images.ts";
import {
  areaFor,
  buildSnowReport,
  cleanStationName,
  formatInt,
  loadSnowReport,
  parseReadings,
  parseStations,
  SNOW_STATIONS,
  SnowSourceError,
  snowSummary,
  type ReadingRow,
} from "../src/lib/content/snow/depth.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/*
 * Fixtures are real rows from nzvn-apee and yqwd-vj5e, read on 25 Oct 2026 at
 * 10:16 UTC. That morning the unvalidated rows (codi_estat blank) said 12 cm
 * at Núria and 4 cm at Sort (677 m, 4-19 °C); the validated rows for the same
 * stations said 0. The page must print the second.
 */
const NOW = new Date("2026-10-25T10:16:00Z");

const STATION_ROWS = [
  { codi_estacio: "Z1", nom_estacio: "Bonaigua (2.262 m)", nom_comarca: "Pallars Sobirà", altitud: "2262" },
  { codi_estacio: "Z5", nom_estacio: "Certascan (2.398 m)", nom_comarca: "Pallars Sobirà", altitud: "2398" },
  { codi_estacio: "Z6", nom_estacio: "Sasseuva (2.226 m)", nom_comarca: "Val d'Aran", altitud: "2226" },
  { codi_estacio: "VS", nom_estacio: "Lac Redon (2.245 m)", nom_comarca: "Val d'Aran", altitud: "2245" },
  { codi_estacio: "DG", nom_estacio: "Núria (1.971 m)", nom_comarca: "Ripollès", altitud: "1971" },
  { codi_estacio: "XH", nom_estacio: "Sort", nom_comarca: "Pallars Sobirà", altitud: "677" },
  { codi_estacio: "Z9", nom_estacio: "Cadí Nord (2.145 m) - Prat d'Aguiló", nom_comarca: "Cerdanya", altitud: "2145" },
  { codi_estacio: "XK", nom_estacio: "Puig Sesolles (1.666 m)", nom_comarca: "Vallès Oriental", altitud: "1666" },
];

const row = (code: string, at: string, cm: string, estat?: string): ReadingRow => ({
  codi_estacio: code,
  data_lectura: `${at}:00.000`,
  valor_lectura: cm,
  ...(estat === undefined ? {} : { codi_estat: estat }),
});

const READING_ROWS: ReadingRow[] = [
  row("Z1", "2026-10-24T05:30", "1", "V"),
  row("Z5", "2026-10-24T06:00", "1", "V"),
  row("Z6", "2026-10-24T06:00", "1", "V"),
  row("Z6", "2026-10-23T06:00", "0", "V"),
  row("DG", "2026-10-24T06:00", "0", "V"),
  row("XH", "2026-10-24T06:00", "0", "V"),
  // Lac Redon's latest validated reading is three days old.
  row("VS", "2026-10-22T03:30", "1", "V"),
  // Unvalidated and in-validation rows: sensor noise, never shown.
  row("DG", "2026-10-25T09:00", "12"),
  row("XH", "2026-10-25T09:00", "4", ""),
  row("DG", "2026-10-24T23:30", "12", "T"),
];

const MEASURING = ["Z1", "Z5", "Z6", "VS", "DG", "XH", "ZZ"];

function report(rows = READING_ROWS, now = NOW) {
  return buildSnowReport(parseReadings(rows), MEASURING, parseStations(STATION_ROWS), now);
}

/* -------------------------------------------------------------------------- */
/* Parsing                                                                    */
/* -------------------------------------------------------------------------- */

test("only validated, well-formed, plausible readings are kept, with UT made explicit", () => {
  const parsed = parseReadings([
    ...READING_ROWS,
    row("Z2", "2026-10-24T06:00", "-4", "V"),
    row("Z2", "2026-10-24T06:30", "4500", "V"),
    row("Z2", "2026-10-24T07:00", "", "V"),
    row("Z2", "2026-10-24T07:30", "abc", "V"),
    { codi_estacio: "Z2", data_lectura: "yesterday", valor_lectura: "3", codi_estat: "V" },
  ]);
  assert.equal(parsed.length, 7);
  assert.ok(parsed.every((r) => r.code !== "Z2"));
  assert.ok(!parsed.some((r) => r.cm === 12 || r.cm === 4), "unvalidated noise leaked through");
  assert.equal(parsed.find((r) => r.code === "Z1")?.at, "2026-10-24T05:30:00.000Z");
});

test("station names lose the altitude Meteocat puts in them; comarques map to areas", () => {
  assert.equal(cleanStationName("Cadí Nord (2.145 m) - Prat d'Aguiló"), "Cadí Nord - Prat d'Aguiló");
  assert.equal(cleanStationName("Bonaigua (2.262 m)"), "Bonaigua");
  assert.equal(cleanStationName("Sort"), "Sort");
  assert.equal(areaFor("Val d'Aran"), "aran");
  assert.equal(areaFor("Pallars Sobirà"), "pallars");
  assert.equal(areaFor("Solsonès"), "cerdanya");
  assert.equal(areaFor("Ripollès"), "ripolles");
  assert.equal(areaFor("Baix Camp"), "other");
});

/* -------------------------------------------------------------------------- */
/* The report                                                                 */
/* -------------------------------------------------------------------------- */

test("the report counts, ranks and flags from validated data alone", () => {
  const r = report();
  assert.equal(r.error, null);
  // ZZ has no metadata, so it cannot be shown meaningfully.
  assert.equal(r.stations.length, 6);
  assert.equal(r.current, 5);
  assert.equal(r.withSnow, 3);
  // Three stations at 1 cm: the tie goes to the highest.
  assert.equal(r.deepest?.code, "Z5");
  assert.equal(r.latestAt, "2026-10-24T06:00:00.000Z");

  const by = new Map(r.stations.map((s) => [s.code, s]));
  assert.equal(by.get("DG")?.cm, 0, "Núria must read the validated 0, not the raw 12");
  assert.equal(by.get("XH")?.cm, 0, "Sort must read the validated 0, not the raw 4");
  assert.equal(by.get("Z6")?.change24h, 1);
  assert.equal(by.get("Z1")?.change24h, null);
  assert.equal(by.get("Z1")?.name, "Bonaigua");
});

test("a reading older than 48 hours is never shown as current", () => {
  const vs = report().stations.find((s) => s.code === "VS");
  assert.ok(vs);
  assert.equal(vs.cm, null);
  assert.equal(vs.at, null);
  assert.equal(vs.change24h, null);
});

test("stations are grouped west to east, highest first within each area", () => {
  assert.deepEqual(
    report().stations.map((s) => s.code),
    ["VS", "Z6", "Z5", "Z1", "XH", "DG"],
  );
});

test("a reading stamped in the future is ignored", () => {
  const r = report([row("Z1", "2026-10-26T06:00", "80", "V"), row("Z1", "2026-10-24T05:30", "1", "V")]);
  assert.equal(r.stations.find((s) => s.code === "Z1")?.cm, 1);
});

/* -------------------------------------------------------------------------- */
/* The one-line answer                                                        */
/* -------------------------------------------------------------------------- */

test("the summary is computed: count, deepest station, local reading time", () => {
  const r = report();
  const [ca] = snowSummary(r, "ca");
  assert.match(ca ?? "", /a 3 de les 5 estacions/);
  assert.match(ca ?? "", /Certascan \(2\.398 m\): 1 cm/);
  const en = snowSummary(r, "en");
  assert.match(en[0] ?? "", /at 3 of the 5 Meteocat stations/);
  // 06:00 UT on 24 October is 08:00 in Catalonia (summer time until the 25th).
  assert.ok(en.some((line) => line.includes("Saturday 24 October at 08:00")), en.join(" | "));
  assert.ok(en.some((line) => /1 more station has no validated reading|One more station/.test(line)), en.join(" | "));
});

test("zero everywhere says there is no snow, with the reading time", () => {
  const zero = READING_ROWS.filter((r) => r.codi_estat === "V").map((r) => ({ ...r, valor_lectura: "0" }));
  const r = report(zero);
  assert.equal(r.withSnow, 0);
  assert.equal(r.deepest, null);
  assert.match(snowSummary(r, "ca")[0] ?? "", /no hi ha neu a terra a cap de les 5 estacions/i);
  assert.match(snowSummary(r, "es")[0] ?? "", /no hay nieve en el suelo en ninguna de las 5 estaciones/i);
  assert.match(snowSummary(r, "en")[0] ?? "", /no snow on the ground at any of the 5 Meteocat stations/);
  assert.ok(snowSummary(r, "es").some((line) => line.startsWith("Lectura validada más reciente:")));
});

test("when nothing validated is recent, no figure is given at all", () => {
  const r = report(READING_ROWS, new Date("2026-10-28T12:00:00Z"));
  assert.equal(r.current, 0);
  assert.ok(r.stations.every((s) => s.cm === null));
  assert.deepEqual(snowSummary(r, "en"), ["Meteocat has not published a validated snow-depth reading from the last 48 hours."]);
});

test("with no current Pyrenean reading, the summary says so before the stations outside the Pyrenees", () => {
  // 26 Oct 2026, en: all Pyrenean stations lacked a validated reading, and the
  // headline "no snow at any of the 3 stations" rested on Puig Sesolles, Els
  // Ports and Prades, on a page titled "Is there snow in the Pyrenees today?".
  const stations = parseStations([
    ...STATION_ROWS,
    { codi_estacio: "T1", nom_estacio: "Test station outside the Pyrenees", nom_comarca: "Baix Ebre", altitud: "1000" },
  ]);
  const rows = [
    row("XK", "2026-10-24T06:00", "0", "V"),
    row("T1", "2026-10-24T06:00", "0", "V"),
    // Pyrenean readings, all older than 48 hours.
    row("Z1", "2026-10-22T05:30", "0", "V"),
    row("VS", "2026-10-22T03:30", "1", "V"),
  ];
  const r = buildSnowReport(parseReadings(rows), ["Z1", "Z5", "VS", "XK", "T1"], stations, NOW);
  assert.equal(r.current, 2);

  const ca = snowSummary(r, "ca");
  assert.equal(
    ca[0],
    "Cap de les 3 estacions del Meteocat al Pirineu que seguim no té encara una lectura validada de les últimes 48 hores, així que avui no podem dir si hi ha neu a terra al Pirineu.",
  );
  assert.match(ca[1] ?? "", /no hi ha neu a terra a cap de les 2 estacions/i);
  assert.equal(
    snowSummary(r, "es")[0],
    "Ninguna de las 3 estaciones de Meteocat en el Pirineo que seguimos tiene todavía una lectura validada de las últimas 48 horas, así que hoy no podemos decir si hay nieve en el suelo en el Pirineo.",
  );
  const en = snowSummary(r, "en");
  assert.equal(
    en[0],
    "None of the 3 Meteocat stations in the Pyrenees that we follow has a validated reading from the last 48 hours yet, so we can't say today whether there is snow on the ground in the Pyrenees.",
  );
  assert.match(en[1] ?? "", /no snow on the ground at any of the 2 Meteocat stations/);
  // The Pyrenean stations are already counted in the first line, not again as "more stations".
  assert.ok(!en.some((line) => /more station/i.test(line)), en.join(" | "));
});

test("one current Pyrenean reading is enough to answer for the Pyrenees", () => {
  const r = report();
  assert.ok(!snowSummary(r, "en").some((line) => /Pyrenean stations has a validated reading/.test(line)));
});

test("numbers are grouped the local way whatever the runtime does", () => {
  assert.equal(formatInt(2262, "ca"), "2.262");
  assert.equal(formatInt(2262, "es"), "2.262");
  assert.equal(formatInt(2262, "en"), "2,262");
  assert.equal(formatInt(-3, "en"), "−3");
  assert.equal(formatInt(677, "ca"), "677");
});

/* -------------------------------------------------------------------------- */
/* Fetching                                                                   */
/* -------------------------------------------------------------------------- */

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

/** Runs `body` as if inside `next build`, restoring the environment afterwards. */
async function duringBuild<T>(body: () => Promise<T>): Promise<T> {
  const previous = process.env.NEXT_PHASE;
  process.env.NEXT_PHASE = "phase-production-build";
  try {
    return await body();
  } finally {
    if (previous === undefined) delete process.env.NEXT_PHASE;
    else process.env.NEXT_PHASE = previous;
  }
}

test("at runtime an unreachable source throws, so ISR keeps the last good page", async () => {
  // A resolved error report would be rendered and cached for a day in place of
  // the previous good page (ca and es, 25-26 Oct 2026). A rejection fails the
  // regeneration instead, and the cached page stays up.
  globalThis.fetch = (async () => {
    throw new Error("network down");
  }) as typeof fetch;
  await assert.rejects(loadSnowReport(NOW), (error: unknown) => error instanceof SnowSourceError && /network down/.test(error.message));

  globalThis.fetch = (async () => new Response("oops", { status: 503 })) as typeof fetch;
  await assert.rejects(loadSnowReport(NOW), (error: unknown) => error instanceof SnowSourceError && /503/.test(error.message));

  globalThis.fetch = (async () => new Response(JSON.stringify({ error: true }), { status: 200 })) as typeof fetch;
  await assert.rejects(loadSnowReport(NOW), (error: unknown) => error instanceof SnowSourceError && error.message === "unexpected response");

  // Station metadata missing: nothing could be shown, so it is a failure too.
  globalThis.fetch = (async () => new Response(JSON.stringify([]))) as typeof fetch;
  await assert.rejects(loadSnowReport(NOW), SnowSourceError);
});

test("an error report is never what a regenerated page renders", async () => {
  // Whatever the source does, loadSnowReport either resolves with a report
  // that has no error or rejects. It never hands the block the "could not
  // read" state outside `next build`.
  const responses: Array<() => Promise<Response>> = [
    async () => {
      throw new Error("timeout");
    },
    async () => new Response("", { status: 500 }),
    async () => new Response("{}"),
    async () => new Response("[]"),
  ];
  for (const respond of responses) {
    globalThis.fetch = respond as unknown as typeof fetch;
    const outcome = await loadSnowReport(NOW).then(
      (report) => report.error,
      () => "rejected",
    );
    assert.equal(outcome, "rejected");
  }
});

test("during next build, with no earlier page to keep, the failure is rendered as such", async () => {
  globalThis.fetch = (async () => {
    throw new Error("network down");
  }) as typeof fetch;
  const r = await duringBuild(() => loadSnowReport(NOW));
  assert.equal(r.error, "network down");
  assert.equal(r.stations.length, 0);
  assert.deepEqual(snowSummary(r, "ca"), ["Quan s'ha actualitzat aquesta pàgina no hem pogut llegir les dades del Meteocat."]);
});

test("the live query asks for variable 38, validated rows only, with a day-stable bound", async () => {
  const urls: string[] = [];
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input);
    urls.push(url);
    if (url.includes("yqwd-vj5e")) return new Response(JSON.stringify(STATION_ROWS));
    return new Response(JSON.stringify(READING_ROWS.filter((r) => r.codi_estat === "V")));
  }) as typeof fetch;

  const r = await loadSnowReport(NOW);
  assert.equal(r.error, null);
  assert.equal(r.current, 5);
  assert.equal(urls.length, 2);
  const readings = urls.map((u) => decodeURIComponent(u)).filter((u) => u.includes("nzvn-apee"));
  assert.equal(readings.length, 1);
  assert.ok(readings[0]?.includes("codi_variable='38' AND codi_estat='V' AND data_lectura >= '2026-10-21T00:00:00'"), readings[0]);
});

test("every known snow station is listed, the ones with nothing recent without a figure", async () => {
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input);
    if (url.includes("yqwd-vj5e")) return new Response(JSON.stringify(STATION_ROWS));
    return new Response(JSON.stringify(READING_ROWS.filter((r) => r.codi_estat === "V")));
  }) as typeof fetch;
  const r = await loadSnowReport(NOW);
  assert.equal(SNOW_STATIONS.length, 20);
  // Cadí Nord and Puig Sesolles have metadata but no validated row in the window.
  for (const code of ["Z9", "XK", "VS"]) {
    const station = r.stations.find((s) => s.code === code);
    assert.ok(station, code);
    assert.equal(station.cm, null, code);
  }
  assert.ok(snowSummary(r, "ca").some((line) => line === "3 estacions més no tenen cap lectura validada de les últimes 48 hores."));
});

/* -------------------------------------------------------------------------- */
/* The article                                                                */
/* -------------------------------------------------------------------------- */

test("the block is day-dependent, so the nightly cron rebuilds the page", () => {
  assert.ok(DAY_DEPENDENT_BLOCKS.includes("snowDepth"));
  assert.match('{"type": "snowDepth"}', new RegExp(DAY_DEPENDENT_PATTERN));
});

test("every edition validates, carries the live block right after the lead, and is substantial", () => {
  for (const locale of LOCALES) {
    const blocks = SNOW_NOW.editions[locale].blocks;
    const parsed = bodySchema.safeParse(blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.equal(blocks.filter((b) => b.type === "snowDepth").length, 1, locale);
    assert.equal(blocks[1]?.type, "snowDepth", `${locale}: the answer comes first`);
    assert.ok(wordCount(bodyToPlainText(blocks)) > 400, locale);
  }
});

test("paths, titles and descriptions fit the house rules", () => {
  for (const locale of LOCALES) {
    const e = SNOW_NOW.editions[locale];
    assert.equal(e.path, B2_PATHS.snowNow[locale]);
    assert.match(e.path, /^[a-z0-9-]+\/[a-z0-9-]+$/);
    assert.ok(!/\d{4}/.test(e.path), e.path);
    assert.ok(e.title.length <= 60, `${locale} title ${e.title.length}`);
    assert.ok(e.seoTitle.length <= 60, `${locale} seoTitle ${e.seoTitle.length}`);
    assert.ok(e.seoDescription.length > 60 && e.seoDescription.length <= 155, `${locale} description ${e.seoDescription.length}`);
  }
});

test("links stay in their language, end in a slash, and point at published paths", () => {
  const known = new Set(Object.keys(B2_PATHS).flatMap((key) => LOCALES.map((l) => b2href(key as keyof typeof B2_PATHS, l))));
  for (const locale of LOCALES) {
    const text = JSON.stringify(SNOW_NOW.editions[locale].blocks);
    for (const match of text.matchAll(/\]\((\/[^)]*)\)/g)) {
      const href = match[1] ?? "";
      assert.ok(href.startsWith(`/${locale}/`), `${locale}: ${href}`);
      assert.ok(known.has(href), `${locale}: ${href} is not a registry path`);
    }
    assert.ok(!/aerobusbcn/i.test(text));
    assert.ok(!text.includes("${"), `${locale}: unrendered helper`);
  }
});

test("sources are https and the page shows its verification date", () => {
  for (const source of SNOW_NOW.sources) assert.match(source.url, /^https:\/\//);
  for (const locale of LOCALES) {
    assert.match(bodyToPlainText(SNOW_NOW.editions[locale].blocks), /verificaci|verified/i);
  }
});

test("the hero is an existing photograph with the snow guide's own wording, so the shared media row is unchanged", () => {
  assert.ok(IMAGES.some((image) => image.key === SNOW_NOW.heroKey));
  assert.equal(SNOW_NOW.heroKey, SNOW.secondaryKey);
  assert.deepEqual(SNOW_NOW.heroAlt, SNOW.secondaryAlt);
  assert.deepEqual(SNOW_NOW.heroCaption, SNOW.secondaryCaption);
  for (const locale of LOCALES) assert.match(SNOW_NOW.heroCaption?.[locale] ?? "", /avui|hoy|today/);
});

test("the ski guide and the snow guide link to the new page in every language", () => {
  for (const locale of LOCALES) {
    const href = b2href("snowNow", locale);
    assert.ok(JSON.stringify(SKI.editions[locale].blocks).includes(`](${href})`), `ski/${locale}`);
    assert.ok(JSON.stringify(SNOW.editions[locale].blocks).includes(`](${href})`), `snow/${locale}`);
  }
});

test("no Pyrenean station in the report at all still leads with the missing Pyrenean reading", () => {
  // Found in review: a station dropped for missing metadata or an unknown
  // comarca spelling left no Pyrenean station, and the headline fell back to
  // "no snow at any of the N stations" built from outside the Pyrenees.
  const report = {
    stations: [{ code: "X1", name: "Montseny", area: "other", altitude: 1700, cm: 0, at: "2026-10-26T06:00:00Z", change24h: null }],
    current: 1,
    withSnow: 0,
    deepest: null,
    latestAt: "2026-10-26T06:00:00Z",
    error: null,
  } as unknown as Parameters<typeof snowSummary>[0];
  const ca = snowSummary(report, "ca");
  assert.match(ca[0] ?? "", /^Cap de les estacions del Meteocat al Pirineu que seguim/);
});
