import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { DESCRIPTION_LIMIT, TITLE_LIMIT } from "../src/lib/programmatic/fuel/copy.ts";
import { PROVINCE_CODES } from "../src/lib/programmatic/fuel/data.ts";
import { SERVER_REVALIDATE_SECONDS as CATALAN_REVALIDATE } from "../src/lib/programmatic/fuel/server.ts";
import { fuelFamilyPaths } from "../src/lib/programmatic/fuel/sitemap.ts";
import { FUEL_HUB_LOCALES, fuelPath, spainHubPath, spainProvincePath, type FuelHubLocale } from "../src/lib/programmatic/fuel/paths.ts";
import { resolveProvince, resolveSpainProvince, spainProvinceStaticParams } from "../src/lib/programmatic/fuel/routing.ts";
import {
  CATALAN_PROVINCE_CODES,
  CHEAPEST_SHOWN,
  SPAIN_SNAPSHOT,
  allProvinces,
  centsVsNational,
  extremes,
  mainTowns,
  provinceByCode,
  spainProvinceBySlug,
  spainProvinces,
  spainSummary,
  summarize,
} from "../src/lib/programmatic/fuel/spain.ts";
import {
  priceText,
  spainHubDescription,
  spainHubFaq,
  spainHubLead,
  spainHubMeta,
  spainLabels,
  spainProvinceDescription,
  spainProvinceFaq,
  spainProvinceH1,
  spainProvinceLead,
  spainProvinceTitle,
} from "../src/lib/programmatic/fuel/spain-copy.ts";
import { SPAIN_REVALIDATE_SECONDS, loadSpainPrices, loadSpainReadingTime, resetSpainMemo } from "../src/lib/programmatic/fuel/spain-server.ts";
import { spainFamilyPaths, spainFuelSitemapEntries } from "../src/lib/programmatic/fuel/spain-sitemap.ts";
import { MIN_SPAIN_STATIONS, SPAIN_API_URLS, compactSpainPayload, compactSpainStation, loadSpain, type SpainPayload } from "../src/lib/programmatic/fuel/spain-upstream.ts";
import { PROVINCES } from "../src/lib/programmatic/gordo/provinces.ts";
import { SLUG_PATTERN } from "../src/lib/programmatic/holidays/slug.ts";
import { isLowDemandPath } from "../src/lib/seo/low-demand.ts";

const ROOT = join(import.meta.dirname, "..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

/**
 * Recorded from the Ministry's national service on 21 Nov 2026 at 11:52:04
 * (96 of the 11,541 stations, unedited: every station of Ceuta and Melilla,
 * the first 15 of Madrid and 12 of Soria in the Ministry's order, and the
 * first of every other province). Known answers below were computed from
 * this file independently, in Python.
 */
type Answer = { Fecha: string; ListaEESSPrecio: Record<string, string>[]; ResultadoConsulta: string };
const FIXTURE = JSON.parse(read("tests/fixtures/fuel/spain-2026-11-21.json")) as Answer;
const PAYLOAD = compactSpainPayload(FIXTURE, 1)!;
const AT = Date.parse(PAYLOAD.updated!);
const SUMMARY = spainSummary(PAYLOAD, AT + 60_000)!;
const PRICE_IN_TEXT = /\d[.,]\d{3}\s?€/;

/** The fixture repeated with fresh ids, to pass the national minimum (a real answer has ~11,500). */
function bigAnswer(): Answer {
  const copies = Math.ceil(MIN_SPAIN_STATIONS / FIXTURE.ListaEESSPrecio.length);
  const rows = Array.from({ length: copies }, (_, k) => FIXTURE.ListaEESSPrecio.map((r) => ({ ...r, IDEESS: `${r.IDEESS}-${k}` }))).flat();
  return { ...FIXTURE, ListaEESSPrecio: rows };
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

/* -------------------------------------------------------------------------- */
/* Which pages exist                                                          */
/* -------------------------------------------------------------------------- */

test("provinces: 52 in the table, a page for each of the 48 outside Catalonia, the Catalan four never duplicated", () => {
  assert.equal(allProvinces().length, 52);
  assert.equal(new Set(allProvinces().map((p) => p.code)).size, 52);
  assert.deepEqual([...CATALAN_PROVINCE_CODES], [...PROVINCE_CODES], "the same four as the Catalan family");
  const pages = spainProvinces();
  assert.equal(pages.length, 48);
  assert.ok(pages.every((p) => !CATALAN_PROVINCE_CODES.includes(p.code)));
  for (const slug of ["barcelona", "girona", "lleida", "tarragona"]) assert.equal(spainProvinceBySlug(slug), null, slug);
  assert.equal(spainProvinceBySlug("madrid")?.code, "28");
  assert.equal(spainProvinceBySlug("ceuta")?.autonomousCity, true);
  assert.equal(spainProvinceBySlug("nowhere"), null);
  // Every INE province and autonomous city (gordo/provinces.ts, INE's list) is in the table.
  assert.deepEqual(allProvinces().map((p) => p.code).sort(), PROVINCES.map((p) => p.code).sort());
});

test("snapshot: dated, from the national service, a station count for every province", () => {
  assert.match(SPAIN_SNAPSHOT.readOn, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(SPAIN_SNAPSHOT.ministryTimestamp, /^\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{2}:\d{2}$/);
  assert.equal(SPAIN_SNAPSHOT.api, SPAIN_API_URLS[0]);
  assert.match(SPAIN_SNAPSHOT.api, /ServiciosRESTCarburantes\/PreciosCarburantes\/EstacionesTerrestres\/$/, "the national list, no community filter");
  let sum = 0;
  for (const p of allProvinces()) {
    const s = SPAIN_SNAPSHOT.provinces[p.code];
    assert.ok(s && s.stations >= 1 && s.towns >= 1 && s.towns <= s.stations, p.name);
    assert.equal(p.stations, s.stations);
    sum += s.stations;
  }
  assert.equal(sum, SPAIN_SNAPSHOT.stations);
  assert.ok(SPAIN_SNAPSHOT.stations >= MIN_SPAIN_STATIONS);
  // Read on 21 Nov 2026 at 11:52:04 (the list the fixture is cut from).
  assert.equal(provinceByCode("28")!.stations, 894);
  assert.equal(provinceByCode("51")!.stations, 10);
});

test("paths: every Spain province has a page in es, ca and en; all paths unique and apart from the Catalan family", () => {
  const entries = spainFamilyPaths();
  assert.equal(entries.length, 3 + 3 * 48);
  const paths = entries.map((e) => e.path);
  assert.equal(new Set(paths).size, paths.length, "unique");
  const catalan = new Set(fuelFamilyPaths().map((e) => e.path));
  for (const p of paths) assert.ok(!catalan.has(p), `${p} is already a Catalan page`);
  for (const p of spainProvinces()) {
    assert.match(p.slug, SLUG_PATTERN);
    for (const locale of FUEL_HUB_LOCALES) assert.ok(paths.includes(spainProvincePath(locale, p.slug)), `${p.name} ${locale}`);
    assert.equal(spainProvincePath("es", p.slug), `/es/gasolineras/provincia/${p.slug}/`);
    assert.equal(spainProvincePath("ca", p.slug), `/ca/benzineres/provincia/${p.slug}/`);
    assert.equal(spainProvincePath("en", p.slug), `/en/fuel-prices-spain/${p.slug}/`);
    // Same segment as the Catalan provinces.
    assert.equal(spainProvincePath("es", p.slug), fuelPath("es", "province", p.slug));
  }
  assert.deepEqual(FUEL_HUB_LOCALES.map(spainHubPath), ["/es/gasolineras/provincia/", "/ca/benzineres/provincia/", "/en/fuel-prices-spain/"]);
  for (const e of entries) {
    assert.deepEqual(Object.keys(e.translations).sort(), ["ca", "en", "es"]);
    assert.ok(Object.values(e.translations).includes(e.path));
    assert.equal(isLowDemandPath(e.path), false, `${e.path}: indexable`);
  }
});

test("routing: each route answers its own locale; Catalan slugs stay on the Catalan page; 48 built per language", () => {
  for (const locale of FUEL_HUB_LOCALES) {
    assert.equal(resolveSpainProvince(locale, locale, "madrid")?.code, "28");
    assert.equal(resolveSpainProvince(locale, locale, "barcelona"), null);
    assert.equal(resolveSpainProvince(locale, locale, "osona"), null);
    const params = spainProvinceStaticParams(locale, "provincia");
    assert.equal(params.length, 48);
    assert.ok(params.every((p) => p.locale === locale));
  }
  assert.equal(resolveSpainProvince("es", "ca", "madrid"), null);
  assert.equal(resolveSpainProvince("en", "es", "madrid"), null);
  // The es/ca route tries the Catalan family first: Barcelona keeps its page.
  assert.equal(resolveProvince("es", "es", "barcelona")?.code, "08");
  assert.equal(resolveProvince("es", "es", "madrid"), null);
});

/* -------------------------------------------------------------------------- */
/* Sitemap                                                                    */
/* -------------------------------------------------------------------------- */

test("sitemap: 147 entries with the three-language hreflang, dated by the Ministry's reading time", () => {
  assert.deepEqual(spainFuelSitemapEntries("2026-11-21T11:52:04+01:00"), [], "nothing on a deployment that may not be indexed");
  const env = { ...process.env };
  process.env.VERCEL_ENV = "production";
  process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";
  try {
    const entries = spainFuelSitemapEntries("2026-11-21T11:52:04+01:00");
    assert.equal(entries.length, 147);
    assert.equal(new Set(entries.map((e) => e.url)).size, 147);
    assert.ok(entries.every((e) => (e.lastModified as Date).toISOString() === "2026-11-21T10:52:04.000Z"), "the reading time, not midnight");
    const madrid = entries.find((e) => e.url === "https://www.catalunyainfo.com/en/fuel-prices-spain/madrid/")!;
    assert.deepEqual(madrid.alternates?.languages, {
      ca: "https://www.catalunyainfo.com/ca/benzineres/provincia/madrid/",
      es: "https://www.catalunyainfo.com/es/gasolineras/provincia/madrid/",
      en: "https://www.catalunyainfo.com/en/fuel-prices-spain/madrid/",
      "x-default": "https://www.catalunyainfo.com/en/fuel-prices-spain/madrid/",
    });
    // No current list (or an older or unreadable time): the snapshot's day, never earlier.
    const snapshotDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(spainFuelSitemapEntries(null)[0]!.lastModified as Date);
    assert.equal(snapshotDay, SPAIN_SNAPSHOT.readOn);
    assert.equal(spainFuelSitemapEntries("2020-01-01T00:00:00+01:00")[0]!.lastModified?.valueOf(), spainFuelSitemapEntries(null)[0]!.lastModified?.valueOf());
    assert.equal(spainFuelSitemapEntries("not a date")[0]!.lastModified?.valueOf(), spainFuelSitemapEntries(null)[0]!.lastModified?.valueOf());
  } finally {
    process.env.VERCEL_ENV = env.VERCEL_ENV;
    process.env.NEXT_PUBLIC_ALLOW_INDEXING = env.NEXT_PUBLIC_ALLOW_INDEXING;
    if (env.VERCEL_ENV === undefined) delete process.env.VERCEL_ENV;
    if (env.NEXT_PUBLIC_ALLOW_INDEXING === undefined) delete process.env.NEXT_PUBLIC_ALLOW_INDEXING;
  }
  const site = read("src/app/sitemap.ts");
  assert.match(site, /import \{ spainFuelSitemapEntries \} from "@\/lib\/programmatic\/fuel\/spain-sitemap";/);
  assert.match(site, /\.\.\.spainFuelSitemapEntries\(await loadSpainReadingTime\(\)\)/);
});

/* -------------------------------------------------------------------------- */
/* The Ministry's answer                                                      */
/* -------------------------------------------------------------------------- */

test("upstream: one national row to the compact form, opening hours as published", () => {
  const row = FIXTURE.ListaEESSPrecio.find((r) => r.IDEESS === "15023")!;
  assert.deepEqual(compactSpainStation(row), {
    id: "15023",
    b: "PLENERGY",
    a: "AVENIDA MADRID, 2",
    t: "el Álamo",
    m: "4279",
    p: "28",
    h: "L-D: 24H",
    lat: 40.23306,
    lon: -3.98042,
    e95: 1.379,
    goa: 1.689,
  });
  assert.equal(compactSpainStation({ ...row, IDEESS: "" }), null);
  assert.equal(compactSpainStation({ ...row, IDProvincia: "" }), null);
});

test("upstream: whole answer; restricted sale left out; broken or short answers rejected", () => {
  assert.equal(PAYLOAD.fecha, "21/11/2026 11:52:04");
  assert.equal(PAYLOAD.updated, "2026-11-21T11:52:04+01:00");
  assert.equal(PAYLOAD.stations.length, 96);
  assert.equal(compactSpainPayload(FIXTURE), null, "96 stations is not Spain");
  assert.equal(compactSpainPayload({ ...FIXTURE, ResultadoConsulta: "ERROR" }, 1), null);
  assert.equal(compactSpainPayload({ Fecha: "x" }, 1), null);
  assert.equal(compactSpainPayload(null, 1), null);
  const restricted = { ...FIXTURE, ListaEESSPrecio: FIXTURE.ListaEESSPrecio.map((r, i) => (i === 0 ? { ...r, "Tipo Venta": "R" } : r)) };
  assert.equal(compactSpainPayload(restricted, 1)!.stations.length, 95);
  assert.ok(compactSpainPayload(bigAnswer())!.stations.length >= MIN_SPAIN_STATIONS);
});

test("upstream: second host when the first fails, never throws, no data-cache option on the 12 MB answer", async () => {
  const seen: { url: string; init: RequestInit | undefined }[] = [];
  const ok = await loadSpain((async (url: string, init?: RequestInit) => {
    seen.push({ url, init });
    return seen.length === 1 ? json({}, 503) : json(bigAnswer());
  }) as typeof fetch);
  assert.equal(ok.ok, true);
  assert.deepEqual(seen.map((s) => s.url), [...SPAIN_API_URLS]);
  for (const s of seen) {
    const init = s.init as RequestInit & { next?: unknown };
    assert.equal(init.cache, undefined, "over the 2 MB data-cache limit: no cache option");
    assert.equal(init.next, undefined);
    assert.ok(init.signal, "timeout");
  }
  const failed = await loadSpain((async () => {
    throw new TypeError("fetch failed");
  }) as typeof fetch);
  assert.equal(failed.ok, false);
  assert.match((failed as { error: string }).error, /energia\.serviciosmin\.gob\.es: TypeError; sedeaplicaciones\.minetur\.gob\.es: TypeError/);
  assert.equal((await loadSpain((async () => json({ ResultadoConsulta: "OK", ListaEESSPrecio: [] })) as typeof fetch)).ok, false);
});

test("loader: one national read shared by every page (single flight), kept for the half hour; a failure retried after a minute", async () => {
  resetSpainMemo();
  let calls = 0;
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  const fetchImpl = (async () => {
    calls++;
    await gate;
    return json(bigAnswer());
  }) as typeof fetch;
  const t0 = Date.parse("2026-11-21T11:00:00+01:00");
  const a = loadSpainPrices(t0, fetchImpl);
  const b = loadSpainPrices(t0 + 1000, fetchImpl);
  release();
  const [pa, pb] = await Promise.all([a, b]);
  assert.equal(calls, 1, "concurrent renders wait for the same request");
  assert.ok(pa && pa === pb);
  assert.equal(await loadSpainPrices(t0 + (SPAIN_REVALIDATE_SECONDS - 1) * 1000, fetchImpl), pa);
  assert.equal(calls, 1);
  await loadSpainPrices(t0 + SPAIN_REVALIDATE_SECONDS * 1000, fetchImpl);
  assert.equal(calls, 2, "read again after the half hour");

  resetSpainMemo();
  let down = 0;
  const offline = (async () => {
    down++;
    throw new TypeError("fetch failed");
  }) as typeof fetch;
  assert.equal(await loadSpainPrices(t0, offline), null, "offline: no list, no throw");
  assert.equal(await loadSpainPrices(t0 + 30_000, offline), null);
  assert.equal(down, 2, "both hosts once, then the failure is kept for a minute");
  await loadSpainPrices(t0 + 61_000, offline);
  assert.equal(down, 4);
  resetSpainMemo();
});

test("loader: the sitemap's reading time is the memoised list's, null offline or when the list is over a day old", async () => {
  resetSpainMemo();
  await loadSpainPrices(AT + 60_000, (async () => json(bigAnswer())) as typeof fetch);
  assert.equal(await loadSpainReadingTime(AT + 120_000), "2026-11-21T11:52:04+01:00");
  resetSpainMemo();
  await loadSpainPrices(AT + 25 * 3_600_000, (async () => json(bigAnswer())) as typeof fetch);
  assert.equal(await loadSpainReadingTime(AT + 25 * 3_600_000), null, "a day-old list does not date the sitemap");
  resetSpainMemo();
  await loadSpainPrices(AT, (async () => json({}, 503)) as typeof fetch);
  assert.equal(await loadSpainReadingTime(AT), null);
  resetSpainMemo();
});

/* -------------------------------------------------------------------------- */
/* Known answers (fixture of 21 Nov 2026, computed independently)             */
/* -------------------------------------------------------------------------- */

test("known answer: Madrid's cheapest, median and ten cheapest from the Ministry's list", () => {
  const madrid = SUMMARY.provinces["28"]!;
  assert.equal(madrid.stations, 15);
  assert.equal(madrid.towns, 3);
  assert.deepEqual([madrid.fuels.e95!.count, madrid.fuels.e95!.min, madrid.fuels.e95!.median], [15, 1.379, 1.449]);
  assert.deepEqual([madrid.fuels.goa!.count, madrid.fuels.goa!.min, madrid.fuels.goa!.median], [15, 1.599, 1.719]);
  assert.deepEqual(madrid.fuels.e95!.cheapest.slice(0, 3).map((s) => [s.b, s.a, s.t, s.h, s.e95]), [
    ["PLENERGY", "AVENIDA MADRID, 2", "el Álamo", "L-D: 24H", 1.379],
    ["FAST FUEL", "CALLE LIBERTAD, 54", "el Álamo", "L-D: 24H", 1.397],
    ["BP DUALEZ 365", "CARRETERA M-404 KM. 4,950", "el Álamo", "L-D: 06:00-22:00", 1.399],
  ]);
  assert.deepEqual(madrid.fuels.goa!.cheapest.slice(0, 2).map((s) => [s.b, s.t, s.h, s.goa]), [
    ["GASEXPRESS", "Alcalá de Henares", "L-D: 24H", 1.599],
    ["ENERGY", "Alcalá de Henares", "L: 06:00-21:00", 1.639],
  ]);
  assert.equal(madrid.fuels.e95!.cheapest.length, CHEAPEST_SHOWN);
  // Every listed station is a real row of the Ministry's answer, at its own price.
  for (const s of madrid.fuels.e95!.cheapest) {
    const row = FIXTURE.ListaEESSPrecio.find((r) => r.IDEESS === s.id)!;
    assert.equal(Number(row["Precio Gasolina 95 E5"]!.replace(",", ".")), s.e95);
  }
  assert.deepEqual(madrid.mainTowns.map((t) => [t.name, t.stations]), [["Alcalá de Henares", 8], ["el Álamo", 4], ["Ajalvir", 3]]);
});

test("known answer: national median, province vs Spain, extremes, Ceuta and Melilla", () => {
  assert.equal(SUMMARY.national.stations, 96);
  assert.deepEqual([SUMMARY.national.fuels.e95!.count, SUMMARY.national.fuels.e95!.median], [91, 1.589]);
  assert.deepEqual([SUMMARY.national.fuels.goa!.count, SUMMARY.national.fuels.goa!.median], [94, 1.784]);
  assert.equal(centsVsNational(SUMMARY, "28", "e95"), -14);
  assert.equal(centsVsNational(SUMMARY, "42", "e95"), 0);
  assert.equal(centsVsNational(SUMMARY, "99", "e95"), null);
  const x = extremes(SUMMARY, "e95")!;
  assert.deepEqual([x.cheapest.code, x.dearest.code], ["15", "25"]);
  const ceuta = SUMMARY.provinces["51"]!;
  assert.deepEqual([ceuta.fuels.e95!.min, ceuta.fuels.e95!.median, ceuta.fuels.goa!.median], [1.499, 1.548, 1.718]);
  // Ties at the same price: by brand, then address.
  assert.deepEqual(ceuta.fuels.e95!.cheapest.slice(0, 2).map((s) => s.a), ["AVENIDA TENIENTE GRAL MUSLERA, S/N", "MUELLE ALFAU, S/N"]);
  assert.deepEqual(ceuta.mainTowns.map((t) => [t.name, t.stations]), [["Ceuta", 10]], "one town: the whole city");
  const soria = SUMMARY.provinces["42"]!;
  assert.deepEqual([soria.fuels.e95!.count, soria.fuels.e95!.min, soria.fuels.e95!.median, soria.fuels.goa!.min], [11, 1.479, 1.589, 1.557]);
  assert.deepEqual(soria.mainTowns.map((t) => t.name), ["Almazán", "Arcos de Jalón", "Ágreda"], "towns with two stations or more");
  assert.deepEqual(soria.mainTowns[0]!.prices.e95 && Object.keys(soria.mainTowns[0]!.prices.e95), ["count", "min", "median"]);
});

test("summary: computed once per list; old list flagged; nothing from a list over a day old", () => {
  assert.equal(SUMMARY.fresh, "fresh");
  assert.equal(SUMMARY.fecha, "21/11/2026 11:52:04");
  assert.equal(spainSummary(PAYLOAD, AT + 120_000)!.provinces, SUMMARY.provinces, "same reduced list for every page");
  assert.equal(spainSummary(PAYLOAD, AT + 5 * 3_600_000)!.fresh, "old");
  assert.equal(spainSummary(PAYLOAD, AT + 25 * 3_600_000), null);
  assert.equal(spainSummary(null, AT), null);
  const unreadable: SpainPayload = { ...PAYLOAD, updated: null };
  assert.equal(spainSummary(unreadable, AT), null);
  // A town table is never padded with towns that have no station.
  assert.deepEqual(mainTowns([]), []);
  assert.deepEqual(Object.keys(summarize({ ...PAYLOAD, stations: [] }).provinces), []);
});

/* -------------------------------------------------------------------------- */
/* Words: figures only from the summary                                       */
/* -------------------------------------------------------------------------- */

test("copy: titles <= 60, descriptions <= 155, H1 with the place, in three languages, with and without a list", () => {
  for (const locale of FUEL_HUB_LOCALES) {
    for (const p of spainProvinces()) {
      const title = spainProvinceTitle(p, locale);
      assert.ok(title.length <= TITLE_LIMIT, `${locale} ${p.slug}: ${title}`);
      assert.ok(title.includes(p.name), title);
      assert.doesNotMatch(title, PRICE_IN_TEXT, "titles never carry a price");
      for (const summary of [SUMMARY, null]) {
        const d = spainProvinceDescription(p, locale, summary);
        assert.ok(d.length <= DESCRIPTION_LIMIT, `${locale} ${p.slug}: ${d.length} ${d}`);
      }
      assert.ok(spainProvinceH1(p, locale).includes(p.name));
    }
    const hub = spainHubMeta(locale);
    assert.ok(hub.title.length <= TITLE_LIMIT && hub.h1.length > 20 && hub.crumb, locale);
    for (const summary of [SUMMARY, null]) assert.ok(spainHubDescription(locale, summary).length <= DESCRIPTION_LIMIT, locale);
  }
  assert.equal(spainProvinceH1(spainProvinceBySlug("ceuta")!, "es"), "Precio de la gasolina y el diésel hoy en Ceuta", "an autonomous city, not a province");
  assert.equal(spainProvinceH1(spainProvinceBySlug("albacete")!, "ca"), "Preu de la gasolina i el dièsel avui a la província d'Albacete");
  assert.equal(spainProvinceH1(spainProvinceBySlug("illes-balears")!, "ca"), "Preu de la gasolina i el dièsel avui a la província de les Illes Balears");
});

test("copy: with the list, the lead, description and FAQ give the Ministry's figures and time; without it, no price at all", () => {
  const madrid = spainProvinceBySlug("madrid")!;
  for (const locale of FUEL_HUB_LOCALES) {
    const f = (v: number) => priceText(v, locale);
    const lead = spainProvinceLead(madrid, locale, SUMMARY);
    for (const v of [1.379, 1.599, 1.449, 1.719, 1.589, 1.784]) assert.ok(lead.includes(f(v)), `${locale} lead: ${f(v)}`);
    assert.ok(lead.includes("11:52") && lead.includes("21/11/2026"), locale);
    const desc = spainProvinceDescription(madrid, locale, SUMMARY);
    assert.ok(desc.includes(f(1.379)) && desc.includes(f(1.599)) && desc.includes("21/11, 11:52"), desc);
    const faq = spainProvinceFaq(madrid, locale, SUMMARY);
    assert.equal(faq.length, 4);
    const text = JSON.stringify(faq);
    for (const v of [1.379, 1.449, 1.599, 1.719, 1.589]) assert.ok(text.includes(f(v)), `${locale} faq: ${f(v)}`);
    assert.ok(text.includes("PLENERGY") && text.includes("GASEXPRESS") && text.includes("L-D: 24H"), locale);
    assert.match(text, /14[.,]0/, `${locale}: 14.0 cents below Spain's median`);

    for (const words of [spainProvinceLead(madrid, locale, null), spainProvinceDescription(madrid, locale, null), JSON.stringify(spainProvinceFaq(madrid, locale, null)), spainHubLead(locale, null), spainHubDescription(locale, null), JSON.stringify(spainHubFaq(locale, null))]) {
      assert.doesNotMatch(words, PRICE_IN_TEXT, `${locale}: no list, no price`);
    }
    assert.equal(spainProvinceFaq(madrid, locale, null).length, 1, "only the update question");
    const hubLead = spainHubLead(locale, SUMMARY);
    assert.ok(hubLead.includes(f(1.589)) && hubLead.includes(f(1.784)) && hubLead.includes("A Coruña") && hubLead.includes("Lleida"), hubLead);
  }
  // The questions are the searched words.
  const es = spainProvinceFaq(madrid, "es", SUMMARY).map((f) => f.q);
  assert.deepEqual(es.slice(0, 2), ["¿Cuál es el precio de la gasolina hoy en Madrid?", "¿Cuál es la gasolinera más barata de Madrid hoy?"]);
  const l = spainLabels("es");
  assert.equal(l.cents(-14), "−14,0 cént.");
  assert.equal(l.cents(2.1), "+2,1 cént.");
  assert.equal(spainLabels("en").cents(0), "same");
});

/* -------------------------------------------------------------------------- */
/* Route files and links                                                      */
/* -------------------------------------------------------------------------- */

test("routes: half-hourly ISR like the Catalan area pages, one locale each, the national list read only in spain-server.ts", () => {
  assert.equal(SPAIN_REVALIDATE_SECONDS, CATALAN_REVALIDATE);
  const files: [string, FuelHubLocale][] = [
    ["src/app/(public)/[locale]/gasolineras/provincia/page.tsx", "es"],
    ["src/app/(public)/[locale]/gasolineras/provincia/[provincia]/page.tsx", "es"],
    ["src/app/(public)/[locale]/benzineres/provincia/page.tsx", "ca"],
    ["src/app/(public)/[locale]/benzineres/provincia/[provincia]/page.tsx", "ca"],
    ["src/app/(public)/[locale]/fuel-prices-spain/page.tsx", "en"],
    ["src/app/(public)/[locale]/fuel-prices-spain/[province]/page.tsx", "en"],
  ];
  for (const [file, locale] of files) {
    const source = read(file);
    assert.match(source, new RegExp(`export const revalidate = ${SPAIN_REVALIDATE_SECONDS};`), file);
    assert.match(source, /export const dynamicParams = true;/, file);
    assert.match(source, /notFound\(\)/, file);
    for (const other of FUEL_HUB_LOCALES.filter((l) => l !== locale)) assert.ok(!source.includes(`"${other}"`), `${file}: serves ${locale} only`);
    assert.doesNotMatch(source, /new Date\(|fetch\(/, file);
  }
  const routes = read("src/components/programmatic/fuel/routes.tsx");
  assert.match(routes, /spainSummary\(await loadSpainPrices\(\), Date\.now\(\)\)/);
  const pages = read("src/components/programmatic/fuel/SpainPages.tsx");
  assert.doesNotMatch(pages, /^"use client"/, "server HTML only");
  assert.doesNotMatch(pages, /fetch\(|loadSpain/, "pages print the summary they are given");
  const upstream = read("src/lib/programmatic/fuel/spain-upstream.ts");
  assert.doesNotMatch(upstream, /cache:|next:/, "no data-cache option");
  assert.match(read("src/lib/programmatic/fuel/spain-server.ts"), /^import "server-only";/);
});

test("links: the Catalonia hubs and the today page link the Spain table; the Spain pages link Catalonia, never duplicate it", () => {
  const hub = read("src/components/programmatic/fuel/FuelHubPage.tsx");
  assert.ok(hub.indexOf("<RestOfSpain") > hub.indexOf('id="cadenes"') && hub.indexOf("<RestOfSpain") < hub.indexOf("<Guidance"));
  const today = read("src/lib/programmatic/today/data.ts");
  assert.match(today, /spain: spainHubPath\(locale\)/);
  assert.match(read("src/components/programmatic/today/TodayPage.tsx"), /\{ label: w\.fuelSpain!, href: l\.fuel\.spain \}/);
  const pages = read("src/components/programmatic/fuel/SpainPages.tsx");
  assert.match(pages, /p\.catalan \? cataloniaHref\(p, locale\) : spainProvincePath\(locale, p\.slug\)/);
  assert.match(pages, /\$\{fuelHubPath\("en"\)\}#per-zona/, "English: the Catalonia hub's area table");
  assert.match(read("src/components/programmatic/fuel/FuelHubPage.tsx"), /id="per-zona"/);
  assert.match(read("src/lib/seo/llms.ts"), /hubs: spainHubTranslations\(\)/);
  // The Catalan noindex decision is untouched: the four provinces and every place page stay listed.
  for (const slug of ["barcelona", "girona", "lleida", "tarragona"]) {
    assert.equal(isLowDemandPath(`/es/gasolineras/provincia/${slug}/`), true);
    assert.equal(isLowDemandPath(`/ca/benzineres/provincia/${slug}/`), true);
  }
});
