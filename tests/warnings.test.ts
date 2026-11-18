import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";

import { LOCALES } from "../src/lib/i18n/config.ts";
import { briefPayload, parseBrief } from "../src/lib/programmatic/warnings/brief.ts";
import {
  AEMET_CREDIT,
  CIVIL_CREDIT,
  SCT_CREDIT,
  answerLines,
  civilNotes,
  directionText,
  readLine,
  roadRow,
  roadsNotes,
  rowTime,
  sources,
  startText,
  townCase,
  weatherNotes,
  weatherRow,
  words,
} from "../src/lib/programmatic/warnings/copy.ts";
import { PHENOMENA, PLAN_TYPES, phaseName, provinceOf } from "../src/lib/programmatic/warnings/names.ts";
import { warningsFamilyPaths, warningsMetadata, warningsSitemapEntries } from "../src/lib/programmatic/warnings/page.ts";
import { capFileName, gencatUrl, parseAemetIndex, parseCap, parseCivilRows, parseSctRss, sctDate, untar } from "../src/lib/programmatic/warnings/parse.ts";
import { WARNINGS_ENDPOINT, WARNINGS_SEGMENT, resolveWarnings, warningsPath } from "../src/lib/programmatic/warnings/paths.ts";
import { SERVER_REVALIDATE_SECONDS, readAll, readSnapshot } from "../src/lib/programmatic/warnings/server.ts";
import type { CivilRead, RoadsRead, WarningsSnapshot, WeatherRead } from "../src/lib/programmatic/warnings/types.ts";
import { AEMET_RSS_URL, CIVIL_URL, SCT_RSS_URL, readWeather, type FetchLike } from "../src/lib/programmatic/warnings/upstream.ts";
import { KEEP_MAX_AGE_MS, ROADS_MAX_FEED_AGE_MS, WEATHER_MAX_ISSUE_AGE_MS, buildView, groupRoads, splitWarnings } from "../src/lib/programmatic/warnings/view.ts";
import { composeTitle } from "../src/lib/seo/metadata.ts";

/**
 * The warnings page (/ca/avisos/, /es/avisos/, /en/warnings/) and the today
 * page's island. Fixtures are the official answers read from the VPS on
 * 18 Nov 2026 ~12:35 CET: AEMET's Catalonia RSS (12 yellow warnings) and
 * its tar.gz bundle (12 warnings + 10 "verde" placeholders), SCT's incidents
 * RSS (243 items) and Protecció Civil's dataset (empty: no plan active).
 */

const ROOT = join(import.meta.dirname, "..");
const FIX = join(ROOT, "tests/fixtures/warnings");
const RSS = readFileSync(join(FIX, "aemet-cat-rss-2026-11-18.xml"), "utf8");
const BUNDLE = readFileSync(join(FIX, "aemet-cat-2026-11-18.tar.gz"));
const SCT = readFileSync(join(FIX, "sct-rss-2026-11-18.xml"), "utf8");
const CIVIL_EMPTY = JSON.parse(readFileSync(join(FIX, "proteccio-civil-2026-11-18-empty.json"), "utf8")) as unknown;
const FILES = untar(new Uint8Array(gunzipSync(BUNDLE)))!;

/** 18 Nov 2026 12:45 in Madrid, ten minutes after the fixtures were read: every warning starts later; SCT feed 13 minutes old. */
const NOV18_1245 = Date.parse("2026-11-18T11:45:00Z");
/** 18 Nov 22:30 Madrid: the two Tarragona coastal warnings (21:00–02:59) are in force. */
const NOV18_2230 = Date.parse("2026-11-18T21:30:00Z");
/** 19 Nov 06:30 Madrid: four warnings are over, the other eight in force. */
const NOV19_0630 = Date.parse("2026-11-19T05:30:00Z");

function weatherFixture(): WeatherRead {
  const index = parseAemetIndex(RSS)!;
  const warnings = index.capUrls.map((url) => parseCap(FILES.get(capFileName(url)) ?? "")).filter((w) => w !== null);
  return { issued: index.issued, answeredAt: "2026-11-18T11:34:21.000Z", warnings, unread: 0 };
}
function roadsFixture(): RoadsRead {
  const feed = parseSctRss(SCT)!;
  return { published: feed.published, answeredAt: "2026-11-18T11:36:00.000Z", incidents: feed.incidents };
}
const civilFixture = (): CivilRead => ({ updated: "2026-11-17T18:03:44.000Z", answeredAt: "2026-11-18T11:36:00.000Z", plans: [] });
const live = (): WarningsSnapshot => ({ weather: weatherFixture(), roads: roadsFixture(), civil: civilFixture() });
const EMPTY: WarningsSnapshot = { weather: null, roads: null, civil: null };

/* -------------------------------------------------------------------------- */
/* AEMET                                                                      */
/* -------------------------------------------------------------------------- */

test("AEMET index: 12 warning items, the bundle link and the build time", () => {
  const index = parseAemetIndex(RSS);
  assert.ok(index);
  assert.equal(index.issued, "2026-11-18T09:57:34.000Z");
  assert.equal(index.capUrls.length, 12);
  assert.match(index.bundleUrl ?? "", /^https:\/\/www\.aemet\.es\/.*_AFAC69\.tar\.gz$/);
  for (const url of index.capUrls) assert.match(url, /^https:\/\/www\.aemet\.es\/documentos_d\/.*\.xml$/);
  assert.equal(parseAemetIndex("<html>no</html>"), null);
  // An index with no warning item is a valid answer: no warnings.
  const none = RSS.replace(/<item>\s*<title>Aviso[\s\S]*?<\/item>/g, "");
  assert.deepEqual(parseAemetIndex(none)?.capUrls, []);
  // A link to another host is never followed.
  assert.equal(parseAemetIndex(RSS.replace(/https:\/\/www\.aemet\.es\/documentos_d/g, "https://evil.example/documentos_d"))?.capUrls.length, 0);
});

test("AEMET bundle: 22 CAP files, 12 warnings (the 10 'verde' placeholders dropped), every field from the file", () => {
  assert.equal(FILES.size, 22);
  const all = [...FILES.values()].map(parseCap).filter((w) => w !== null);
  assert.equal(all.length, 12);
  const w = weatherFixture().warnings;
  assert.equal(w.length, 12);
  assert.ok(w.every((x) => x.level === "yellow"));
  assert.deepEqual([...new Set(w.map((x) => x.phenomenon))].sort(), ["CO", "VI"]);
  const gusts = w.find((x) => x.zoneCode === "690803")!;
  assert.equal(gusts.zone, "Prelitoral de Barcelona");
  assert.equal(gusts.phenomenonEs, "Vientos");
  assert.equal(gusts.onset, "2026-11-18T23:00:00.000Z");
  assert.equal(gusts.expires, "2026-11-19T08:59:59.000Z");
  assert.equal(gusts.probability, "40%-70%");
  assert.match(gusts.description, /^Rachas máximas: 70 km\/h\./);
  // Coastal zones carry a "C" suffix; the province comes from the code.
  const coast = w.find((x) => x.zoneCode === "694303C")!;
  assert.equal(coast.zone, "Costa - Litoral norte de Tarragona");
  assert.equal(provinceOf(coast.zoneCode), "Tarragona");
  assert.equal(provinceOf("691702"), "Girona");
  assert.equal(provinceOf("692501"), "Lleida");
  assert.equal(provinceOf("690803"), "Barcelona");
});

test("CAP: cancellations, exercises, green level and missing times are not warnings", () => {
  const one = FILES.get(capFileName(parseAemetIndex(RSS)!.capUrls[0]!))!;
  assert.ok(parseCap(one));
  assert.equal(parseCap(one.replace(/<msgType>\w+<\/msgType>/, "<msgType>Cancel</msgType>")), null);
  assert.equal(parseCap(one.replace("<status>Actual</status>", "<status>Exercise</status>")), null);
  assert.equal(parseCap(one.replace(/<value>amarillo<\/value>/g, "<value>verde</value>")), null);
  assert.equal(parseCap(one.replace(/<onset>[^<]*<\/onset>/g, "<onset></onset>")), null);
  assert.equal(parseCap("<html/>"), null);
  const orange = parseCap(one.replace(/<value>amarillo<\/value>/g, "<value>naranja</value>"));
  assert.equal(orange?.level, "orange");
  assert.equal(parseCap(one.replace(/<value>amarillo<\/value>/g, "<value>rojo</value>"))?.level, "red");
});

test("every phenomenon AEMET uses has a name in the three languages; the bundle's placeholders list them all", () => {
  const codes = new Set<string>();
  for (const xml of FILES.values()) {
    const m = /AEMET-Meteoalerta fenomeno<\/valueName>\s*<value>(\w+);/.exec(xml);
    if (m) codes.add(m[1]!);
  }
  assert.equal(codes.size, 10);
  for (const code of codes) for (const locale of LOCALES) assert.ok(PHENOMENA[code]?.[locale], `${code} ${locale}`);
});

/* -------------------------------------------------------------------------- */
/* Upstream reads (fake fetch)                                                */
/* -------------------------------------------------------------------------- */

const DATE = "Wed, 18 Nov 2026 11:34:21 GMT";
function fakeFetch(routes: Record<string, () => Response>): FetchLike & { calls: string[] } {
  const calls: string[] = [];
  const fn = (async (url: string) => {
    calls.push(url);
    const route = routes[url];
    return route ? route() : new Response("not found", { status: 404, headers: { date: DATE } });
  }) as FetchLike & { calls: string[] };
  fn.calls = calls;
  return fn;
}
const xml = (body: string) => () => new Response(body, { headers: { "content-type": "application/xml", date: DATE } });

test("readWeather: one RSS and one bundle request; the answer time is the server's Date header", async () => {
  const index = parseAemetIndex(RSS)!;
  const fetcher = fakeFetch({ [AEMET_RSS_URL]: xml(RSS), [index.bundleUrl!]: () => new Response(new Uint8Array(BUNDLE), { headers: { date: DATE } }) });
  const read = await readWeather(fetcher, NOV18_1245);
  assert.ok(read);
  assert.equal(read.warnings.length, 12);
  assert.equal(read.unread, 0);
  assert.equal(read.answeredAt, "2026-11-18T11:34:21.000Z");
  assert.equal(fetcher.calls.length, 2);
});

test("readWeather: without the bundle, each CAP file is read; one failing read fails the whole list", async () => {
  const index = parseAemetIndex(RSS)!;
  const singles = Object.fromEntries(index.capUrls.map((url) => [url, xml(FILES.get(capFileName(url))!)]));
  const ok = await readWeather(fakeFetch({ [AEMET_RSS_URL]: xml(RSS), ...singles }), NOV18_1245);
  assert.equal(ok?.warnings.length, 12);
  const broken = { ...singles, [index.capUrls[3]!]: () => new Response("err", { status: 500 }) };
  assert.equal(await readWeather(fakeFetch({ [AEMET_RSS_URL]: xml(RSS), ...broken }), NOV18_1245), null, "a partial list is never shown as the list");
  // A listed warning whose file does not parse is counted, not hidden.
  const garbled = { ...singles, [index.capUrls[0]!]: xml("<alert><status>Actual</status></alert>") };
  assert.equal((await readWeather(fakeFetch({ [AEMET_RSS_URL]: xml(RSS), ...garbled }), NOV18_1245))?.unread, 1);
  assert.equal(await readWeather(fakeFetch({}), NOV18_1245), null);
});

test("readAll: each source on its own; one failing never hides the others", async () => {
  const index = parseAemetIndex(RSS)!;
  const fetcher = fakeFetch({
    [AEMET_RSS_URL]: xml(RSS),
    [index.bundleUrl!]: () => new Response(new Uint8Array(BUNDLE), { headers: { date: DATE } }),
    [SCT_RSS_URL]: () => new Response("upstream down", { status: 502 }),
    [CIVIL_URL]: () => new Response(JSON.stringify(CIVIL_EMPTY), { headers: { "content-type": "application/json", date: DATE, "last-modified": "Tue, 17 Nov 2026 18:03:44 GMT" } }),
  });
  const all = await readAll(fetcher, NOV18_1245);
  assert.equal(all.weather?.warnings.length, 12);
  assert.equal(all.roads, null);
  assert.deepEqual(all.civil?.plans, []);
  assert.equal(all.civil?.updated, "2026-11-17T18:03:44.000Z");
});

/* -------------------------------------------------------------------------- */
/* SCT and Protecció Civil                                                    */
/* -------------------------------------------------------------------------- */

test("SCT: 243 incidents, CET feed time, title and description split into fields", () => {
  const feed = parseSctRss(SCT);
  assert.ok(feed);
  assert.equal(feed.published, "2026-11-18T11:32:02.000Z");
  assert.equal(feed.incidents.length, 243);
  const first = feed.incidents[0]!;
  assert.deepEqual(first, {
    id: "152650101",
    type: "Obres",
    cause: "Treballs d'enllumenat",
    description: "Calçada restringida",
    road: "A-2",
    municipality: "CORNELLÀ DE LLOBREGAT",
    direction: "Ambdós sentits",
    km: "609-610",
    since: "2026-11-18T05:00:00.000Z",
  });
  assert.equal(sctDate("Sun, 05 Jul 2026 12:00:00 CEST"), "2026-07-05T10:00:00.000Z");
  assert.equal(parseSctRss("<html/>"), null);
  const g = groupRoads(feed.incidents);
  assert.equal(g.traffic.length, 9);
  assert.ok(g.traffic.every((i) => i.type !== "Obres"));
  assert.ok(g.closures.length > 0 && g.closures.every((i) => /tallada/i.test(i.description)));
  assert.equal(g.traffic.length + g.closures.length + g.works.length, 243);
  const roads = g.traffic.map((i) => i.road);
  assert.deepEqual(roads, [...roads].sort((a, b) => a.localeCompare(b, "ca", { numeric: true })));
});

test("Protecció Civil: empty dataset = no plan; rows keep the published words; links only to Generalitat hosts", () => {
  assert.deepEqual(parseCivilRows(CIVIL_EMPTY), []);
  assert.equal(parseCivilRows({ error: true }), null);
  // Shape of a row per the dataset's column list (plaacronim, planom, plafase, plaactivat, fasedatahora, comunicatpdf, descripcio).
  const rows = parseCivilRows([
    { plaacronim: "TEST", planom: "Pla de prova", plafase: "ALERTA", plaactivat: "Si", fasedatahora: "18/11/2026 10:00", comunicatpdf: { url: "https://documents.example.org/x.pdf" }, descripcio: "Text" },
    { plaacronim: "TEST2", plafase: "PREALERTA", comunicatpdf: "https://govern.gencat.cat/a.pdf" },
    { planom: "", plafase: "" },
  ]);
  assert.equal(rows?.length, 2);
  assert.equal(rows?.[0]?.communique, null, "a non-Generalitat link is dropped");
  assert.equal(rows?.[1]?.communique, "https://govern.gencat.cat/a.pdf");
  assert.equal(gencatUrl("http://govern.gencat.cat/a.pdf"), null);
  assert.equal(phaseName("EMERGÈNCIA", "es"), "Emergencia");
  assert.equal(phaseName("ALTRA", "en"), "ALTRA");
  for (const plan of ["INUNCAT", "NEUCAT", "VENTCAT"]) for (const l of LOCALES) assert.ok(PLAN_TYPES[plan]?.[l]);
});

/* -------------------------------------------------------------------------- */
/* View rules                                                                 */
/* -------------------------------------------------------------------------- */

test("in force, coming up and over: by AEMET's own start and end times", () => {
  const w = weatherFixture().warnings;
  let s = splitWarnings(w, NOV18_1245);
  assert.equal(s.inForce.length, 0);
  assert.equal(s.upcoming.length, 12);
  assert.equal(s.upcoming[0]!.onset, "2026-11-18T20:00:00.000Z");
  s = splitWarnings(w, NOV18_2230);
  assert.deepEqual(s.inForce.map((x) => x.zone).sort(), ["Costa - Litoral norte de Tarragona", "Costa - Litoral sur de Tarragona"]);
  assert.equal(s.upcoming.length, 10);
  s = splitWarnings(w, NOV19_0630);
  assert.equal(s.inForce.length, 8);
  assert.equal(s.upcoming.length, 0);
  assert.equal(splitWarnings(w, Date.parse("2026-11-19T14:00:00Z")).inForce.length, 0, "never shown after its end");
});

test("freshness: an old AEMET file or SCT feed is not current; a held read only while recent, with its own time", () => {
  const now = NOV18_1245;
  const fresh = buildView(live(), EMPTY, now);
  assert.equal(fresh.weather.kind, "live");
  assert.equal(fresh.roads.kind, "live");
  assert.equal(fresh.civil.kind, "live");
  // AEMET file built more than 18 h before.
  const old = { ...weatherFixture(), issued: new Date(now - WEATHER_MAX_ISSUE_AGE_MS - 1).toISOString() };
  assert.equal(buildView({ ...live(), weather: old }, EMPTY, now).weather.kind, "none");
  // SCT feed stamped more than an hour before.
  const stale = { ...roadsFixture(), published: new Date(now - ROADS_MAX_FEED_AGE_MS - 1).toISOString() };
  assert.equal(buildView({ ...live(), roads: stale }, EMPTY, now).roads.kind, "none");
  // Source down: the held read, if young enough.
  const kept = buildView(EMPTY, live(), Date.parse("2026-11-18T11:50:00Z"));
  assert.equal(kept.weather.kind, "kept");
  assert.equal(kept.roads.kind, "kept");
  assert.equal(kept.civil.kind, "kept");
  const later = Date.parse("2026-11-18T11:36:00Z") + KEEP_MAX_AGE_MS.roads + 1;
  assert.equal(buildView(EMPTY, live(), later).roads.kind, "none");
  assert.equal(buildView(EMPTY, EMPTY, now).weather.kind, "none");
});

test("kept file: malformed parts are dropped, good parts survive", () => {
  const good = live();
  assert.deepEqual(readSnapshot(JSON.parse(JSON.stringify(good))), good);
  assert.deepEqual(readSnapshot(null), EMPTY);
  const bad = readSnapshot({ weather: { issued: "x", warnings: [] }, roads: good.roads, civil: { plans: "no" } });
  assert.equal(bad.weather, null);
  assert.equal(bad.civil, null);
  assert.equal(bad.roads?.incidents.length, 243);
});

/* -------------------------------------------------------------------------- */
/* Words                                                                      */
/* -------------------------------------------------------------------------- */

test("answer lines: the honest empty state with the read time, the upcoming warnings, Civil Protection and roads", () => {
  const view = buildView(live(), EMPTY, NOV18_1245);
  const ca = answerLines(view, "ca");
  assert.equal(ca[0], "**No hi ha avisos en vigor segons l'AEMET a les 12:45.**");
  assert.equal(ca[1], "Hi ha 12 avisos previstos; el primer comença dc. 18/11 a les 21:00 (nivell màxim: groc): fenòmens costaners i vent.");
  assert.equal(ca[2], "Protecció Civil: cap pla en prealerta, alerta o emergència.");
  assert.match(ca[3]!, /^Carreteres: 9 incidències de circulació i \d+ obres amb la calçada tallada/);
  assert.equal(answerLines(view, "es")[0], "**No hay avisos en vigor según la AEMET a las 12:45.**");
  assert.equal(answerLines(view, "en")[0], "**No warnings in force according to AEMET at 12:45.**");
  const night = answerLines(buildView(live(), EMPTY, NOV18_2230), "es");
  assert.equal(night[0], "**Ahora hay 2 avisos de la AEMET en vigor en Cataluña** (nivel máximo: amarillo): costeros.");
  assert.match(night[1]!, /^Además, hay 10 avisos previstos; el primero empieza el jue\. 19\/11 a las 00:00/);
  // Nothing read: each line says so and links the source; never "no warnings".
  const none = answerLines(buildView(EMPTY, EMPTY, NOV18_1245), "ca");
  assert.equal(none.length, 3);
  for (const line of none) assert.match(line, /^No hem pogut llegir/);
  for (const locale of LOCALES) {
    for (const line of [...answerLines(view, locale), readLine(view, locale)]) assert.doesNotMatch(line, /undefined|NaN|null|\{\w+\}/, line);
  }
});

test("attribution: AEMET's required text, the Generalitat licence formula, each source's update time", () => {
  const view = buildView(live(), EMPTY, NOV18_1245);
  assert.equal(AEMET_CREDIT, "© AEMET. Información elaborada por la Agencia Estatal de Meteorología");
  assert.equal(SCT_CREDIT, "Generalitat de Catalunya. Departament d'Interior i Seguretat Pública. Servei Català de Trànsit");
  assert.equal(CIVIL_CREDIT, "Generalitat de Catalunya. Departament d'Interior i Seguretat Pública. Direcció General de Protecció Civil");
  for (const locale of LOCALES) {
    const weather = weatherNotes(view, locale).source;
    assert.ok(weather.includes(AEMET_CREDIT), locale);
    assert.match(weather, /18\/11\/2026|18 Nov 2026/, "AEMET's own build date is printed");
    assert.match(weather, /10:57/);
    assert.match(weather, /no participa|does not take part/);
    const roads = roadsNotes(view, locale).source;
    assert.ok(roads.includes(SCT_CREDIT) && roads.includes("Llicència oberta"), locale);
    assert.match(roads, /12:32/, "SCT's feed time");
    const civil = civilNotes(view, locale).source;
    assert.ok(civil.includes(CIVIL_CREDIT) && civil.includes("Llicència oberta"), locale);
    assert.match(civil, /17\/11\/2026|17 Nov 2026/, "the dataset's last update");
    assert.match(civilNotes(view, locale).empty, /12:45/);
    for (const s of sources(locale)) assert.match(s.url, /^https:\/\//);
  }
});

test("rows: AEMET's zone and text verbatim (marked Spanish outside es); SCT's words translated only from the closed list", () => {
  const w = weatherFixture().warnings.find((x) => x.zoneCode === "690803")!;
  const ca = weatherRow(w, "ca");
  assert.deepEqual(ca.slice(0, 6).map((c) => c.text), ["groc", "Vent", "Prelitoral de Barcelona", "Barcelona", "dj. 19/11 00:00", "dj. 19/11 09:59"]);
  assert.equal(ca[2]!.lang, "es");
  assert.match(ca[6]!.text, /^Rachas máximas: 70 km\/h\..*\(probabilitat 40%-70%\)$/);
  assert.equal(weatherRow(w, "es")[2]!.lang, undefined);
  assert.equal(weatherRow(w, "en")[4]!.text, "Thu 19 Nov 00:00");
  assert.equal(rowTime("2026-11-19T08:59:59.000Z", "es"), "jue. 19/11 09:59");
  assert.equal(startText("2026-11-18T20:00:00.000Z", "en"), "Wed 18 Nov at 21:00");

  assert.equal(townCase("SANT JOAN DE LES ABADESSES"), "Sant Joan de les Abadesses");
  assert.equal(townCase("LA SEU D'URGELL"), "La Seu d'Urgell");
  assert.equal(townCase("L'HOSPITALET DE LLOBREGAT"), "L'Hospitalet de Llobregat");
  assert.equal(townCase("MONTCADA I REIXAC"), "Montcada i Reixac");
  assert.equal(townCase("CASTELL-PLATJA D'ARO"), "Castell-Platja d'Aro");
  assert.equal(directionText("Nord cap a GIRONA-UN CARRIL TALLAT", "en"), "North towards GIRONA-UN CARRIL TALLAT");
  assert.equal(directionText("Ambdós sentits", "es"), "Ambos sentidos");
  assert.equal(directionText("Oest cap a LLEIDA", "ca"), "Oest cap a LLEIDA");

  const incident = roadsFixture().incidents.find((i) => i.cause === "Accident")!;
  const en = roadRow(incident, "en", NOV18_1245, true);
  assert.equal(en[0]!.text, "Queue");
  assert.match(en[5]!.text, /^Accident\. /);
  const odd = { ...incident, cause: "Causa nova", description: "Calçada tallada" };
  const es = roadRow(odd, "es", NOV18_1245, false);
  assert.equal(es[4]!.text, "Causa nova. Calzada cortada");
  assert.equal(es[4]!.lang, "ca", "an untranslated term stays Catalan and is marked so");
  // Older than this year: the year is printed.
  assert.match(roadRow({ ...incident, since: "2025-12-02T06:46:13.000Z" }, "ca", NOV18_1245, false)[5]!.text, /^02\/12\/2025 07:46$/);
});

/* -------------------------------------------------------------------------- */
/* Routes, metadata, sitemap, API                                             */
/* -------------------------------------------------------------------------- */

const APP = join(ROOT, "src/app/(public)/[locale]");

test("routes: /ca/avisos/ and /es/avisos/ share a folder, /en/warnings/ its own; revalidate literal = SERVER_REVALIDATE_SECONDS", () => {
  const expected = { ca: "/ca/avisos/", es: "/es/avisos/", en: "/en/warnings/" } as const;
  for (const locale of LOCALES) assert.equal(warningsPath(locale), expected[locale]);
  assert.equal(resolveWarnings("avisos", "ca"), "ca");
  assert.equal(resolveWarnings("avisos", "es"), "es");
  assert.equal(resolveWarnings("avisos", "en"), null);
  assert.equal(resolveWarnings("warnings", "en"), "en");
  assert.equal(resolveWarnings("warnings", "ca"), null);
  assert.ok(SERVER_REVALIDATE_SECONDS >= 300 && SERVER_REVALIDATE_SECONDS <= 600, "5–10 minutes");
  for (const segment of new Set(Object.values(WARNINGS_SEGMENT))) {
    const source = readFileSync(join(APP, segment, "page.tsx"), "utf8");
    assert.match(source, new RegExp(`export const revalidate = ${SERVER_REVALIDATE_SECONDS};`), segment);
    assert.match(source, /^export const dynamicParams = true;$/m, segment);
    assert.match(source, new RegExp(`const SEGMENT = "${segment}";`));
    assert.match(source, /notFound\(\)/);
    assert.doesNotMatch(source, /fetch\(|@\/lib\/db/);
  }
  // No legacy redirect and no content section uses these URLs.
  const redirects = readFileSync(join(ROOT, "migration/redirects.csv"), "utf8");
  for (const locale of LOCALES) assert.ok(!redirects.includes(`,${warningsPath(locale)}`) && !redirects.includes(`\n${warningsPath(locale)},`), locale);
  const component = readFileSync(join(ROOT, "src/components/programmatic/warnings/WarningsPage.tsx"), "utf8");
  assert.match(component, /loadWarnings\(\)/, "data only through server.ts");
  assert.doesNotMatch(component, /fetch\(|"use client"/);
});

test("metadata: static titles <= 60 rendered, descriptions <= 155 with no figure that would go stale; hreflang between the three", () => {
  for (const locale of LOCALES) {
    const w = words(locale);
    const rendered = composeTitle(w.title, warningsPath(locale), "2026-11-18");
    const shown = typeof rendered === "string" ? `${rendered} · CatalunyaInfo` : rendered.absolute;
    assert.ok(shown.length <= 60, `${locale} rendered ${shown.length}`);
    assert.ok(w.description.length <= 155 && w.description.length >= 100, `${locale} description ${w.description.length}`);
    assert.doesNotMatch(w.description, /\d/);
    const meta = warningsMetadata(locale);
    const languages = (meta.alternates?.languages ?? {}) as Record<string, string>;
    assert.ok(Object.values(languages).some((href) => String(href).endsWith("/en/warnings/")), locale);
    assert.ok(Object.values(languages).some((href) => String(href).endsWith("/ca/avisos/")), locale);
  }
  assert.equal(warningsFamilyPaths().length, 3);
  const entries = warningsSitemapEntries(NOV18_1245);
  if (entries.length > 0) {
    assert.equal(entries.length, 3);
    assert.equal((entries[0]!.lastModified as Date).toISOString(), "2026-11-18T12:00:00.000Z");
  }
});

test("API: CDN-cached route handler; the brief round-trips and lets the browser judge 'in force' by its own clock", () => {
  const route = join(ROOT, "src/app", WARNINGS_ENDPOINT.replace(/\/$/, ""), "route.ts");
  assert.ok(existsSync(route));
  const source = readFileSync(route, "utf8");
  assert.match(source, /s-maxage=300/);
  assert.match(source, /force-dynamic/);
  const view = buildView(live(), EMPTY, NOV18_1245);
  const brief = briefPayload(view);
  assert.equal(brief.weather?.warnings.length, 12);
  assert.equal(brief.roads?.traffic, 9);
  assert.deepEqual(brief.civil?.plans, []);
  assert.deepEqual(parseBrief(JSON.parse(JSON.stringify(brief))), brief);
  assert.equal(parseBrief({ nope: 1 }), null);
  // Warnings already over are not sent.
  const nextMorning = { ...live(), weather: { ...weatherFixture(), issued: "2026-11-19T05:00:00.000Z" } };
  assert.equal(briefPayload(buildView(nextMorning, EMPTY, NOV19_0630)).weather?.warnings.length, 8);
  // The same file read the next morning without a newer build is not current.
  assert.equal(briefPayload(buildView(live(), EMPTY, NOV19_0630)).weather, null);
  assert.equal(briefPayload(buildView(EMPTY, EMPTY, NOV18_1245)).weather, null);
});

test("links: the today page, the snow and rainy-day guides and llms.txt point at the warnings page", () => {
  const today = readFileSync(join(ROOT, "src/components/programmatic/today/TodayPage.tsx"), "utf8");
  assert.match(today, /<WarningsToday locale=\{locale\}>/);
  const snow = readFileSync(join(ROOT, "src/lib/content/batch02/snow-now.ts"), "utf8");
  const rainy = readFileSync(join(ROOT, "src/lib/content/features/rainy.ts"), "utf8");
  for (const l of ["ca", "es", "en"]) {
    assert.ok(snow.includes(`warningsPath("${l}")`), `snow-now ${l}`);
    assert.ok(rainy.includes(`warningsPath("${l}")`), `rainy ${l}`);
  }
});
