import assert from "node:assert/strict";
import { test } from "node:test";

process.env.VERCEL_ENV = "production";
process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";

/**
 * The 20,000+ wave of the Spain 2027 city pages (cities-more.ts): the
 * selection rule, one official source per row, two 2027 local days that are
 * not already a BOE day, unique slugs, and the same planner and .ics support
 * the first 129 cities have. The towns whose community has not published its
 * 2027 list wait in WAITING_TOWNS, with no page.
 */

type Region = import("../src/lib/programmatic/holidays/boe-2027.ts").Region;
const { CITY_ROWS, CORE_CITY_ROWS } = await import("../src/lib/programmatic/spain-2027/cities-data.ts");
const { GSC_SMALL_TOWNS, MORE_CITY_ROWS, MORE_MIN_POPULATION, MORE_READ_ON, WAITING_RECHECK_BY, WAITING_TOWNS } = await import(
  "../src/lib/programmatic/spain-2027/cities-more.ts"
);
const { CITIES, cityBySlug, cityReadOn, localDays, nonLocalDates } = await import("../src/lib/programmatic/spain-2027/cities.ts");
const { communityDays } = await import("../src/lib/programmatic/spain-2027/calendar.ts");
const { names } = await import("../src/lib/programmatic/spain-2027/communities.ts");
const { cityPath, spainPaths, spainSitemapEntries } = await import("../src/lib/programmatic/spain-2027/paths.ts");
const { editionCityPath, editionSitemapEntries } = await import("../src/lib/programmatic/spain-2027/editions.ts");
const { missingProse } = await import("../src/lib/programmatic/spain-2027/sources-intl.ts");
const { SOURCES } = await import("../src/lib/programmatic/spain-2027/sources.ts");
const { itemHolidays, plannerData, plannerPlace } = await import("../src/lib/programmatic/leave-2027/places.ts");
const { cityFeed, cityFeedPath } = await import("../src/lib/programmatic/ics/feeds.ts");

const PROVINCE_REGION: Record<string, Region> = {
  "01": "PV", "02": "CM", "03": "VC", "04": "AN", "05": "CL", "06": "EX", "07": "IB", "09": "CL", "10": "EX", "11": "AN", "12": "VC",
  "13": "CM", "14": "AN", "15": "GA", "16": "CM", "18": "AN", "19": "CM", "20": "PV", "21": "AN", "22": "AR", "23": "AN", "24": "CL",
  "26": "RI", "27": "GA", "28": "MD", "29": "AN", "30": "MC", "31": "NC", "32": "GA", "33": "AS", "34": "CL", "35": "CN", "36": "GA",
  "37": "CL", "38": "CN", "39": "CB", "40": "CL", "41": "AN", "42": "CL", "44": "AR", "45": "CM", "46": "VC", "47": "CL", "48": "PV",
  "49": "CL", "50": "AR",
};

const more = MORE_CITY_ROWS.map((r) => CITIES.find((c) => c.ine === r.ine)!);

test("waiting towns: re-read the pending communities by WAITING_RECHECK_BY (DOGV, BOCM, DOCM, BOC, BON, BOA publish Nov-Dec)", () => {
  // Fails from WAITING_RECHECK_BY until every pending community's bulletin is
  // read again: a published list moves its towns from WAITING_TOWNS to
  // MORE_CITY_ROWS (with the days, the source and the reading date), then
  // MORE_READ_ON and WAITING_RECHECK_BY move.
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
  assert.ok(today < WAITING_RECHECK_BY, `re-read the pending 2027 local lists (cities-more.ts, read ${MORE_READ_ON})`);
  assert.ok(WAITING_RECHECK_BY > MORE_READ_ON);
});

test("selection: 20,000+ inhabitants (INE 1 Jan 2025) below the core's 50,000, or a smaller town with Search Console queries", () => {
  assert.equal(MORE_MIN_POPULATION, 20_000);
  assert.ok(MORE_CITY_ROWS.length >= 100, `${MORE_CITY_ROWS.length} rows`);
  assert.equal(CITY_ROWS.length, CORE_CITY_ROWS.length + MORE_CITY_ROWS.length);
  const codes = [...CITY_ROWS, ...WAITING_TOWNS].map((r) => r.ine);
  assert.equal(new Set(codes).size, codes.length, "no municipality twice");
  for (const r of [...MORE_CITY_ROWS, ...WAITING_TOWNS]) {
    assert.match(r.ine, /^\d{5}$/);
    assert.equal(PROVINCE_REGION[r.ine.slice(0, 2)], r.region, `${r.ine} is not in ${r.region}`);
    assert.ok(r.population < 50_000, `${r.ine}: 50,000+ belongs to the core rows`);
    assert.ok(r.population >= MORE_MIN_POPULATION || GSC_SMALL_TOWNS.some((g) => g.ine === r.ine), `${r.ine}: ${r.population}, no query`);
    assert.ok(r.ineTable >= 2854 && r.ineTable <= 2909, r.ine);
  }
  for (const r of MORE_CITY_ROWS) assert.equal(r.capital, false, r.ine);
  for (const g of GSC_SMALL_TOWNS) {
    assert.ok(g.population < MORE_MIN_POPULATION && g.impressions > 0 && g.query.length > 0, g.ine);
    assert.ok([...MORE_CITY_ROWS, ...WAITING_TOWNS].some((r) => r.ine === g.ine), `${g.ine}: selected but not listed`);
  }
});

test("rows: each from its community's official 2027 list, read on MORE_READ_ON, two 2027 local days off the BOE ones", () => {
  for (const r of MORE_CITY_ROWS) {
    const s = SOURCES[r.region].local;
    assert.equal(r.status2027, "published", r.slug);
    assert.equal(s.status, "published", `${r.slug}: the community list must be out`);
    assert.equal(r.local2026, null, r.slug);
    assert.equal(r.readOn, MORE_READ_ON, r.slug);
    const list = r.local2027!;
    assert.equal(list.year, 2027);
    const official = [s.y2027, ...(s.parts ?? []).map((p) => p.text)].filter((t) => t !== null);
    assert.ok(official.some((t) => t.url === list.source.url && t.ref === list.source.ref), `${r.slug}: not the community's 2027 list`);
    assert.match(list.source.url, /^https:\/\//);
    assert.match(list.source.ref, /núm\./, `${r.slug}: bulletin number`);
    assert.equal(list.days.length, 2, r.slug);
    const dates = list.days.map((d) => d.date);
    assert.equal(new Set(dates).size, 2, `${r.slug}: two different days`);
    for (const d of dates) {
      assert.match(d, /^2027-\d\d-\d\d$/);
      assert.ok(!Number.isNaN(Date.parse(`${d}T00:00:00Z`)), d);
    }
  }
  for (const c of more) {
    assert.ok(c, "every row has a city");
    const boe = new Set(nonLocalDates(c));
    for (const d of localDays(c)) assert.ok(!boe.has(d.date), `${c.slug}: ${d.date} is already a holiday of ${c.region}`);
    assert.equal(cityReadOn(c), MORE_READ_ON);
  }
  // The core rows keep their own reading date.
  assert.notEqual(cityReadOn(CITIES.find((c) => c.slug === "sevilla")!), MORE_READ_ON);
});

test("rows: a sample transcribed by hand from each bulletin", () => {
  const days = (region: Region, slug: string) => localDays(cityBySlug(region, slug)!).map((d) => [d.date, d.name]);
  assert.deepEqual(days("AN", "mairena-del-aljarafe"), [["2027-01-23", null], ["2027-06-25", null]]);
  assert.deepEqual(days("AN", "lepe"), [["2027-05-10", null], ["2027-08-17", null]]);
  assert.deepEqual(days("MC", "alcantarilla"), [["2027-05-14", null], ["2027-09-14", null]]);
  assert.deepEqual(days("PV", "santurtzi"), [["2027-07-16", "Virgen del Carmen"], ["2027-07-31", "San Ignacio de Loyola"]]);
  assert.deepEqual(days("PV", "errenteria"), [["2027-07-22", "Día de la Madalena"], ["2027-07-31", "San Ignacio de Loyola"]]);
  assert.deepEqual(days("AS", "castrillon"), [["2027-03-29", "Lunes de Pascua"], ["2027-07-05", "Día de Castrillón"]]);
  assert.deepEqual(days("IB", "mahon"), [["2027-09-08", "Virgen de Gracia"], ["2027-09-09", "Segunda fiesta Virgen de Gracia"]]);
  assert.deepEqual(days("CN", "mogan"), [["2027-06-14", "Festividad de San Antonio de Padua en Domingo"], ["2027-07-16", "Festividad de la Virgen del Carmen"]]);
  assert.deepEqual(days("CL", "miranda-de-ebro"), [["2027-05-17", "San Juan del Monte"], ["2027-09-13", "Nuestra Señora de Altamira"]]);
  assert.deepEqual(days("CL", "san-andres-del-rabanedo"), [["2027-06-24", null], ["2027-10-05", null]]);
  assert.deepEqual(days("EX", "plasencia"), [["2027-06-10", null], ["2027-06-11", null]]);
  assert.deepEqual(days("GA", "naron"), [["2027-06-24", "San Juan"], ["2027-11-23", "Día de Narón"]]);
  assert.deepEqual(days("RI", "calahorra"), [["2027-03-03", null], ["2027-08-31", null]]);
  // Split municipalities keep the bulletin's areas.
  assert.equal(cityBySlug("AS", "mieres")!.local2027!.zones![0]!.place, "Valle de Turón");
  assert.equal(cityBySlug("IB", "santa-eularia-des-riu")!.local2027!.zones!.length, 3);
  // Left out on purpose: Arcos (not in the BOJA) and Cangas (the DOG's 19 March is already a Galicia holiday; the Xunta's data has only 30 August).
  for (const ine of ["11006", "36008"]) assert.equal(WAITING_TOWNS.find((t) => t.ine === ine)?.reason, "missing", ine);
});

test("slugs: lower-case ASCII, unique in the community, no clash with the community's own sub-pages", () => {
  for (const r of MORE_CITY_ROWS) assert.match(r.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, r.slug);
  for (const t of WAITING_TOWNS) assert.match(t.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, t.slug);
  const keys = [...CITY_ROWS, ...WAITING_TOWNS].map((r) => `${r.region}/${r.slug}`);
  assert.equal(new Set(keys).size, keys.length, "slug twice in a community");
  for (const r of MORE_CITY_ROWS) assert.ok(!["puentes", "dia", "aprovechar-vacaciones", "en-tu-web"].includes(r.slug), r.slug);
});

test("pages: in the sitemap (es, ca, en with hreflang) and the publish group, like the first 129", () => {
  const es = new Set(spainSitemapEntries().map((e) => e.url));
  const intl = new Set(editionSitemapEntries().map((e) => e.url));
  const paths = new Set(spainPaths());
  for (const c of more) {
    const p = cityPath(c);
    assert.equal(p, `/es/festivos/2027/${names(c.region).slug}/${c.slug}/`);
    assert.ok(paths.has(p), p);
    assert.ok(es.has(`https://www.catalunyainfo.com${p}`), p);
    for (const l of ["ca", "en"] as const) assert.ok(intl.has(`https://www.catalunyainfo.com${editionCityPath(l, c)}`), `${l} ${c.slug}`);
  }
  assert.deepEqual(missingProse(), []);
});

test("planner: every new city is a place with its two local days counted; its page links to it preselected", () => {
  for (const locale of ["ca", "es", "en"] as const) {
    const data = plannerData(locale);
    for (const c of more) {
      const found = plannerPlace(data, `${c.community.slug}/${c.slug}`);
      assert.ok(found, `${locale} ${c.slug}: not in the planner`);
      const all = itemHolidays(data, found.item);
      for (const d of localDays(c)) assert.ok(all.includes(d.date), `${locale} ${c.slug}: ${d.date}`);
      for (const d of communityDays(c.region)) assert.ok(all.includes(d.date), `${locale} ${c.slug}: BOE ${d.date}`);
      assert.equal(found.item[6], "b", `${c.slug}: published status`);
    }
  }
});

test("ics: every new city has a feed with its two local days, served by the existing route", async () => {
  for (const c of more) {
    for (const locale of ["ca", "es", "en"] as const) {
      const local = cityFeed(locale, c).calendar.events.filter((e) => e.scope === "local").map((e) => e.date);
      assert.deepEqual(local, localDays(c).map((d) => d.date), `${locale} ${c.slug}`);
    }
  }
  const route = await import("../src/app/ics/[locale]/2027/[comunidad]/[file]/route.ts");
  const req = new Request("http://localhost/");
  const sample = more[0]!;
  assert.equal(cityFeedPath("es", sample), `/ics/es/2027/${sample.community.slug}/${sample.slug}.ics`);
  const res = await route.GET(req, { params: Promise.resolve({ locale: "es", comunidad: sample.community.slug, file: `${sample.slug}.ics` }) });
  assert.equal(res.status, 200);
  const body = await res.text();
  for (const d of localDays(sample)) assert.ok(body.includes(d.date.replaceAll("-", "")), d.date);
});

test("waiting towns: no page until their community publishes; each says why", () => {
  for (const t of WAITING_TOWNS) {
    assert.equal(cityBySlug(t.region, t.slug), null, `${t.slug}: has a page`);
    const s = SOURCES[t.region].local;
    if (t.reason === "pending") {
      // The day the community's status turns "published", this fails: transcribe the towns into MORE_CITY_ROWS.
      assert.equal(s.status, "pending", `${t.region} published its 2027 list: move ${t.slug} to MORE_CITY_ROWS`);
      assert.ok(s.y2026, t.slug);
    } else {
      assert.equal(s.status, "published", t.slug);
      assert.ok(t.note && t.note.length > 20, `${t.slug}: say what the list does with the town`);
    }
  }
  const valencian = WAITING_TOWNS.filter((t) => t.region === "VC");
  assert.ok(valencian.length >= 40, "the Valencian 20,000+ towns wait for the DOGV");
});
