import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { bodyToPlainText, bodySchema, type Block } from "../src/lib/content/blocks.ts";
import { B2_PATHS } from "../src/lib/content/batch02/shared.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import {
  GORDO_AS_OF,
  GORDO_URLS,
  caA,
  gordoSources,
  hubBlocks,
  hubMeta,
  municipalityBlocks,
  municipalityMeta,
  provinceBlocks,
  provinceMeta,
} from "../src/lib/programmatic/gordo/copy.ts";
import { SNAPSHOT, provinceGroups, webSales } from "../src/lib/programmatic/gordo/data.ts";
import { GORDO_ROUTE, gordoHubPath } from "../src/lib/programmatic/gordo/paths.ts";
import { PROVINCES } from "../src/lib/programmatic/gordo/provinces.ts";
import { placeStaticParams, resolveMunicipalityPage, resolveProvincePage } from "../src/lib/programmatic/gordo/routing.ts";
import { gordoPaths } from "../src/lib/programmatic/gordo/sitemap.ts";
import type { GordoSnapshot } from "../src/lib/programmatic/gordo/types.ts";
import { loadSnapshot, snapshotProblems } from "../src/lib/programmatic/gordo/validate.ts";

/**
 * ¿Dónde ha tocado el Gordo? (11 Nov 2026): the hub that explains the draw
 * before 22 December and becomes the results page on the day, and the
 * province and municipality pages that exist only once the day's snapshot
 * lists them.
 *
 * The fixture (tests/fixtures/gordo/) is TEST DATA: invented numbers and
 * addresses ("DATOS DE PRUEBA") in the shape of SELAE's pages. It is never
 * imported by the site, the site refuses to load it, and the script refuses
 * to write it over the committed snapshot.
 */

const ROOT = join(import.meta.dirname, "..");
const FIXTURE_DIR = join(ROOT, "tests/fixtures/gordo/selae");
const FIXTURE = JSON.parse(readFileSync(join(ROOT, "tests/fixtures/gordo/snapshot.test-data.json"), "utf8")) as GordoSnapshot;
const S = loadSnapshot(FIXTURE, { allowTestData: true })!;

const plain = (blocks: Block[]) => bodyToPlainText(blocks);
const raw = (blocks: Block[]) => JSON.stringify(blocks);
const links = (blocks: Block[]) => [...raw(blocks).matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1] ?? "");
const clone = (): GordoSnapshot => JSON.parse(JSON.stringify(FIXTURE)) as GordoSnapshot;

const OFFICIAL = ["www.loteriasyapuestas.es", "www.selae.es", "www.boe.es", "www.rtve.es"];
const KNOWN_INTERNAL = new Set([
  ...Object.values(B2_PATHS).flatMap((paths) => LOCALES.map((locale) => `/${locale}/${paths[locale]}/`)),
  ...gordoPaths(S).map((entry) => entry.path),
]);

function checkLinks(blocks: Block[], locale: Locale, sources: string[]) {
  for (const href of links(blocks)) {
    if (href.startsWith("/")) {
      const path = href.split("#")[0]!;
      assert.ok(path.startsWith(`/${locale}/`), `${locale} links to ${href}`);
      assert.ok(KNOWN_INTERNAL.has(path), `${locale}: ${href} is not a page that exists`);
    } else {
      const url = new URL(href);
      assert.equal(url.protocol, "https:", href);
      assert.ok(OFFICIAL.includes(url.host), `${href} is not an official source`);
      assert.ok(sources.includes(href), `${href} is linked but not listed in the sources`);
      assert.ok(!/aerobusbcn/.test(href), href);
    }
  }
}

/* ------------------------------------------------------------ snapshot --- */

test("the committed snapshot is empty or valid real data, and the script's check agrees", () => {
  const committed = JSON.parse(readFileSync(join(ROOT, "src/lib/programmatic/gordo/snapshot.json"), "utf8")) as unknown;
  assert.deepEqual(snapshotProblems(committed), []);
  if (committed !== null) assert.equal((committed as GordoSnapshot).testData, false, "test data was committed as the real snapshot");
  assert.equal(SNAPSHOT, committed === null ? null : SNAPSHOT);
  const python = spawnSync("python3", ["-I", join(ROOT, "scripts/gordo-snapshot.py"), "check"], { encoding: "utf8" });
  if (python.error) return; // no Python on this machine
  assert.equal(python.status, 0, python.stderr);
});

test("with no snapshot only the three hubs exist: no province or municipality page, nothing else in the sitemap", () => {
  if (SNAPSHOT !== null) return; // from 22 December the committed snapshot is real
  const paths = gordoPaths().map((entry) => entry.path);
  assert.deepEqual(paths, [gordoHubPath("ca"), gordoHubPath("es"), gordoHubPath("en")]);
  for (const locale of LOCALES) {
    assert.equal(resolveProvincePage(locale, locale, "barcelona"), null);
    assert.equal(resolveProvincePage(locale, locale, "madrid"), null);
    assert.equal(resolveMunicipalityPage(locale, locale, "barcelona", "terrassa"), null);
  }
  assert.deepEqual(placeStaticParams(), []);
});

test("the fixture is test data: the site refuses it unless a test asks, and every address says so", () => {
  assert.equal(FIXTURE.testData, true);
  assert.throws(() => loadSnapshot(FIXTURE), /test data/);
  for (const prize of S.prizes) {
    for (const outlet of prize.outlets ?? []) {
      if (outlet.channel === "outlet") assert.match(outlet.address ?? "", /DATOS DE PRUEBA/);
    }
  }
  assert.match(readFileSync(join(FIXTURE_DIR, "TEST_DATA"), "utf8"), /NOT REAL RESULTS/);
});

test("the validator refuses typos, repeats, unknown provinces, unofficial hosts and two towns on one URL", () => {
  const cases: [string, (s: GordoSnapshot) => void, RegExp][] = [
    ["six digits", (s) => (s.prizes[0]!.numbers = ["123456"]), /five digits/],
    ["a repeat", (s) => (s.prizes[1]!.numbers = ["12345"]), /twice/],
    ["too many fourths", (s) => (s.prizes[3]!.numbers = ["11111", "22222", "33333"]), /more than 2/],
    ["a wrong amount", (s) => (s.prizes[0]!.perDecimo = 40_000), /perDecimo/],
    ["an unknown province", (s) => (s.prizes[0]!.outlets![0]!.province = "99"), /INE province/],
    ["a town in another province", (s) => (s.prizes[0]!.outlets![0]!.municipality!.ine = "28079"), /not in province/],
    ["an unofficial source", (s) => (s.sources.results = "https://example.com/resultados"), /official/],
    ["no Gordo", (s) => (s.prizes[0]!.numbers = []), /no Gordo|without a number/],
    ["prizes out of order", (s) => s.prizes.reverse(), /order/],
    ["a slug for two towns", (s) => (s.prizes[2]!.outlets![0]!.municipality = { ine: "08101", name: "Terrassa", slug: "terrassa" }), /two municipalities/],
  ];
  for (const [name, breakIt, message] of cases) {
    const s = clone();
    breakIt(s);
    const problems = snapshotProblems(s);
    assert.ok(problems.some((p) => message.test(p)), `${name}: ${problems.join("; ")}`);
  }
  assert.deepEqual(snapshotProblems(null), []);
});

/* --------------------------------------------------------------- paths --- */

test("pages come only from the snapshot: provinces and municipalities with a point of sale, in three languages", () => {
  const paths = gordoPaths(S);
  const es = paths.filter((entry) => entry.path.startsWith("/es/")).map((entry) => entry.path);
  assert.deepEqual(es, [
    "/es/donde-ha-tocado-el-gordo/",
    "/es/donde-ha-tocado-el-gordo/almeria/",
    "/es/donde-ha-tocado-el-gordo/barcelona/",
    "/es/donde-ha-tocado-el-gordo/barcelona/el-prat-de-llobregat/",
    "/es/donde-ha-tocado-el-gordo/barcelona/l-hospitalet-de-llobregat/",
    "/es/donde-ha-tocado-el-gordo/barcelona/terrassa/",
    "/es/donde-ha-tocado-el-gordo/a-coruna/",
    "/es/donde-ha-tocado-el-gordo/a-coruna/a-coruna/",
    "/es/donde-ha-tocado-el-gordo/leon/",
    "/es/donde-ha-tocado-el-gordo/leon/la-pola-de-gordon/",
    "/es/donde-ha-tocado-el-gordo/santa-cruz-de-tenerife/",
    "/es/donde-ha-tocado-el-gordo/santa-cruz-de-tenerife/santa-cruz-de-tenerife/",
  ]);
  assert.equal(paths.length, es.length * 3);
  assert.equal(new Set(paths.map((entry) => entry.path)).size, paths.length);
  for (const entry of paths) {
    assert.match(entry.path, /^\/(ca|es|en)\/[a-z0-9-]+\/([a-z0-9]+(-[a-z0-9]+)*\/){0,2}$/);
    for (const locale of LOCALES) assert.ok(entry.translations[locale].startsWith(`/${locale}/${GORDO_ROUTE[locale]}/`));
  }
  // SELAE's online channel is no place: no Madrid page from it. Las Norias is no municipality: no page of its own.
  assert.equal(webSales(S).length, 1);
  assert.equal(resolveProvincePage("es", "es", "madrid", S), null);
  assert.ok(resolveProvincePage("es", "es", "almeria", S));
  assert.equal(resolveProvincePage("es", "es", "almeria", S)!.municipalities.length, 0);
  assert.equal(resolveMunicipalityPage("es", "es", "almeria", "las-norias", S), null);
  // Each route answers its own locale only.
  assert.equal(resolveProvincePage("es", "ca", "barcelona", S), null);
  assert.ok(resolveMunicipalityPage("ca", "ca", "barcelona", "terrassa", S));
  assert.equal(resolveMunicipalityPage("en", "en", "leon", "terrassa", S), null);
});

test("province slugs are unique, and every INE province code has one", () => {
  assert.equal(PROVINCES.length, 52);
  assert.equal(new Set(PROVINCES.map((p) => p.slug)).size, 52);
  assert.equal(new Set(PROVINCES.map((p) => p.code)).size, 52);
});

test("the nine route files render on demand and never use dynamicParams = false", () => {
  const base = join(ROOT, "src/app/(public)/[locale]");
  const files = [
    "on-ha-tocat-la-loteria-de-nadal/page.tsx",
    "on-ha-tocat-la-loteria-de-nadal/[provincia]/page.tsx",
    "on-ha-tocat-la-loteria-de-nadal/[provincia]/[municipi]/page.tsx",
    "donde-ha-tocado-el-gordo/page.tsx",
    "donde-ha-tocado-el-gordo/[provincia]/page.tsx",
    "donde-ha-tocado-el-gordo/[provincia]/[municipio]/page.tsx",
    "spanish-christmas-lottery-results/page.tsx",
    "spanish-christmas-lottery-results/[province]/page.tsx",
    "spanish-christmas-lottery-results/[province]/[town]/page.tsx",
  ];
  for (const file of files) {
    const source = readFileSync(join(base, file), "utf8");
    assert.match(source, /export const dynamicParams = true;/, file);
    assert.match(source, /export const revalidate = false;/, file);
    if (file.split("/").length > 2) assert.match(source, /placeStaticParams\(\)/, file);
  }
  const publish = readFileSync(join(ROOT, "src/app/api/admin/publish/route.ts"), "utf8");
  assert.match(publish, /wants\("gordo-navidad"\)/);
  assert.match(publish, /wants\("gordo-navidad-links"\)/);
  assert.match(readFileSync(join(ROOT, "src/app/sitemap.ts"), "utf8"), /gordoSitemapEntries\(\)/);
});

/* ---------------------------------------------------------------- copy --- */

test("before the draw the hub explains it, links the guide, prints no winning number and cites only official pages", () => {
  for (const locale of LOCALES) {
    const blocks = hubBlocks(locale, null);
    bodySchema.parse(blocks);
    const text = plain(blocks);
    assert.match(text, /22/);
    assert.match(text, /Teatro Real/);
    assert.match(text, /400\.000 €|€400,000/);
    assert.match(text, /SELAE/);
    assert.ok(links(blocks).includes(`/${locale}/${B2_PATHS.loteriaNadal[locale]}/`), `${locale}: no link to the lottery guide`);
    assert.ok(links(blocks).includes(`/${locale}/${B2_PATHS.grossa[locale]}/`), `${locale}: no link to La Grossa`);
    for (const n of ["12345", "79432"]) assert.ok(!text.includes(n), `${locale} prints ${n} before the draw`);
    checkLinks(blocks, locale, gordoSources(null).map((s) => s.url));
    const meta = hubMeta(locale, null);
    assert.ok(meta.title.length <= 60, `${locale} title: ${meta.title.length}`);
    assert.ok(meta.description.length <= 160, `${locale} description: ${meta.description.length}`);
  }
});

test("Catalan says 'loteria de Nadal', never 'Grossa de Nadal' (La Grossa is the Generalitat's own lottery)", () => {
  const all = [hubBlocks("ca", null), hubBlocks("ca", S), ...provinceGroups(S).map((g) => provinceBlocks("ca", S, g))];
  for (const blocks of all) {
    assert.doesNotMatch(raw(blocks), /Grossa de Nadal/i);
  }
  assert.match(plain(hubBlocks("ca", null)), /loteria de Nadal/);
  assert.match(hubMeta("ca", null).title, /loteria de Nadal/);
});

test("on the day the hub leads with the Gordo, tabulates every prize and links each province page", () => {
  const es = hubBlocks("es", S);
  bodySchema.parse(es);
  const text = plain(es);
  assert.match(text, /El 12345 es el Gordo de la Lotería de Navidad 2026: 400\.000 € por décimo de 20 €, vendido en Terrassa y La Pola de Gordón\./);
  assert.match(text, /El segundo, el 23456 y el tercero, el 34567\./);
  assert.match(text, /22 de diciembre de 2026 a las 13:05/);
  assert.match(text, /SELAE aún no los ha publicado/); // the fifth prizes' page is not out in the fixture
  assert.match(text, /SELAE no dice cuál de los números vendió cada punto/);
  assert.match(text, /la venta por internet de SELAE/i);
  assert.match(text, /NORIAS \(LAS\)/); // SELAE's own spelling, no page of its own
  for (const slug of ["barcelona", "leon", "almeria", "santa-cruz-de-tenerife", "a-coruna"]) {
    assert.ok(links(es).includes(`/es/donde-ha-tocado-el-gordo/${slug}/`), slug);
  }
  assert.equal(hubMeta("es", S).title, "Gordo de Navidad 2026: el 12345. Dónde ha tocado");
  for (const locale of LOCALES) {
    const blocks = hubBlocks(locale, S);
    checkLinks(blocks, locale, gordoSources(S).map((s) => s.url));
    assert.ok(plain(blocks).includes("12345"));
  }
});

test("province and municipality pages list SELAE's addresses, numbers and prize amounts", () => {
  const barcelona = resolveProvincePage("es", "es", "barcelona", S)!;
  const pb = provinceBlocks("es", S, barcelona);
  bodySchema.parse(pb);
  const text = plain(pb);
  assert.match(text, /SELAE lista 4 puntos de venta de la provincia de Barcelona que han vendido el Gordo, el segundo premio, el tercer premio y los cuartos premios/);
  assert.match(text, /CALLE DE PRUEBA, 3 \(DATOS DE PRUEBA\) \(en parte vendido en la web oficial\)/);
  assert.match(text, /uno de estos: 45678 o 56789/);
  assert.equal(provinceMeta("es", S, barcelona).title, "Gordo y Lotería de Navidad 2026 en Barcelona: dónde ha tocado");
  checkLinks(pb, "es", gordoSources(S).map((s) => s.url));

  const terrassa = resolveMunicipalityPage("es", "es", "barcelona", "terrassa", S)!;
  const mb = municipalityBlocks("es", S, terrassa);
  bodySchema.parse(mb);
  assert.match(plain(mb), /SELAE lista 2 puntos de venta en Terrassa \(provincia de Barcelona\) que han vendido el Gordo y el tercer premio/);
  assert.match(plain(mb), /400\.000 €/);
  assert.equal(municipalityMeta("es", S, terrassa).title, "Gordo de Navidad 2026 en Terrassa: el 12345");

  const prat = resolveMunicipalityPage("ca", "ca", "barcelona", "el-prat-de-llobregat", S)!;
  assert.equal(municipalityMeta("ca", S, prat).h1, "Loteria de Nadal 2026: premis venuts al Prat de Llobregat");
  assert.equal(municipalityMeta("en", S, prat).crumb, "El Prat de Llobregat");
  for (const locale of LOCALES) {
    for (const g of provinceGroups(S)) {
      checkLinks(provinceBlocks(locale, S, g), locale, gordoSources(S).map((s) => s.url));
      for (const m of g.municipalities) checkLinks(municipalityBlocks(locale, S, m), locale, gordoSources(S).map((s) => s.url));
    }
  }
});

test("Catalan place prepositions", () => {
  assert.equal(caA("el Prat de Llobregat"), "al Prat de Llobregat");
  assert.equal(caA("els Hostalets de Pierola"), "als Hostalets de Pierola");
  assert.equal(caA("Terrassa"), "a Terrassa");
  assert.equal(caA("l'Hospitalet de Llobregat"), "a l'Hospitalet de Llobregat");
});

test("the facts were checked recently and every fixed source is an official https page", () => {
  assert.ok(GORDO_AS_OF <= new Date().toISOString().slice(0, 10));
  for (const url of Object.values(GORDO_URLS)) {
    const u = new URL(url);
    assert.equal(u.protocol, "https:");
    assert.ok(OFFICIAL.includes(u.host), url);
  }
});

/* ------------------------------------------------------------- script --- */

test("the script builds the fixture snapshot, refuses test data without the flag and never writes it over the committed file", (t) => {
  const probe = spawnSync("python3", ["--version"]);
  if (probe.error) return t.skip("no python3");
  const script = join(ROOT, "scripts/gordo-snapshot.py");
  const dir = mkdtempSync(join(tmpdir(), "gordo-test-"));
  try {
    const out = join(dir, "snapshot.json");
    execFileSync("python3", ["-I", script, "build", "--year", "2026", "--dir", FIXTURE_DIR, "--test-data", "--read-at", "2026-12-22T13:05:00+01:00", "--out", out]);
    assert.deepEqual(JSON.parse(readFileSync(out, "utf8")), FIXTURE);
    const refused = spawnSync("python3", ["-I", script, "build", "--year", "2026", "--dir", FIXTURE_DIR, "--out", out], { encoding: "utf8" });
    assert.equal(refused.status, 1);
    assert.match(refused.stderr, /TEST_DATA/);
    const overCommitted = spawnSync("python3", ["-I", script, "build", "--year", "2026", "--dir", FIXTURE_DIR, "--test-data"], { encoding: "utf8" });
    assert.equal(overCommitted.status, 1);
    assert.match(overCommitted.stderr, /never goes into the committed snapshot/);
    const wrongYear = spawnSync("python3", ["-I", script, "build", "--year", "2025", "--dir", FIXTURE_DIR, "--test-data", "--dry-run"], { encoding: "utf8" });
    assert.equal(wrongYear.status, 1);
    assert.match(wrongYear.stderr, /22 December 2025/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
