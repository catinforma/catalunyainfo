import assert from "node:assert/strict";
import { test } from "node:test";

process.env.VERCEL_ENV = "production";
process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";

/**
 * The 10,000+ wave of the Spain 2027 city pages (cities-10k.ts, 24 Nov 2026):
 * the selection rule, one official bulletin per row, two 2027 local days per
 * area that are not already a BOE day, unique slugs, pages in the three
 * editions, and no page for the towns that wait or were left out.
 *
 * The rows were checked twice on 24 Nov 2026: transcribed from each bulletin,
 * then every row compared again by a second reading of a fresh download of
 * the same 24 documents (and each population against the INE table).
 */

type Region = import("../src/lib/programmatic/holidays/boe-2027.ts").Region;
const { CORE_CITY_ROWS } = await import("../src/lib/programmatic/spain-2027/cities-data.ts");
const { COUNCIL_CITY_ROWS } = await import("../src/lib/programmatic/spain-2027/cities-council.ts");
const { MORE_CITY_ROWS, WAITING_RECHECK_BY, WAITING_TOWNS } = await import("../src/lib/programmatic/spain-2027/cities-more.ts");
const { TEN_K_CITY_ROWS, TEN_K_LEFT_OUT, TEN_K_MIN_POPULATION, TEN_K_PENDING_READ, TEN_K_READ_ON, TEN_K_RECHECK_BY, TEN_K_WAITING } = await import(
  "../src/lib/programmatic/spain-2027/cities-10k.ts"
);
const { CITIES, cityBySlug, cityReadOn, localDays, nonLocalDates } = await import("../src/lib/programmatic/spain-2027/cities.ts");
const { names } = await import("../src/lib/programmatic/spain-2027/communities.ts");
const { cityPath, spainPaths, spainSitemapEntries } = await import("../src/lib/programmatic/spain-2027/paths.ts");
const { editionCityPath, editionSitemapEntries } = await import("../src/lib/programmatic/spain-2027/editions.ts");
const { areaNameIntl } = await import("../src/lib/programmatic/spain-2027/city-copy-intl.ts");
const { SOURCES } = await import("../src/lib/programmatic/spain-2027/sources.ts");
const { itemHolidays, plannerData, plannerPlace } = await import("../src/lib/programmatic/leave-2027/places.ts");

const PROVINCE_REGION: Record<string, Region> = {
  "01": "PV", "02": "CM", "03": "VC", "04": "AN", "05": "CL", "06": "EX", "07": "IB", "09": "CL", "10": "EX", "11": "AN", "12": "VC",
  "13": "CM", "14": "AN", "15": "GA", "16": "CM", "18": "AN", "19": "CM", "20": "PV", "21": "AN", "22": "AR", "23": "AN", "24": "CL",
  "26": "RI", "27": "GA", "28": "MD", "29": "AN", "30": "MC", "31": "NC", "32": "GA", "33": "AS", "34": "CL", "35": "CN", "36": "GA",
  "37": "CL", "38": "CN", "39": "CB", "40": "CL", "41": "AN", "42": "CL", "44": "AR", "45": "CM", "46": "VC", "47": "CL", "48": "PV",
  "49": "CL", "50": "AR",
};
const PENDING: Region[] = ["AR", "CM", "MD", "NC"];
const WEEKDAY = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const weekday = (date: string) => WEEKDAY[new Date(`${date}T12:00:00Z`).getUTCDay()]!;

const tenK = TEN_K_CITY_ROWS.map((r) => CITIES.find((c) => c.ine === r.ine)!);

test("selection: 10,000 to 19,999 inhabitants (INE 1 Jan 2025), outside Catalonia, not already a page", () => {
  assert.equal(TEN_K_MIN_POPULATION, 10_000);
  assert.ok(TEN_K_CITY_ROWS.length >= 200, `${TEN_K_CITY_ROWS.length} rows`);
  const all = [...TEN_K_CITY_ROWS, ...TEN_K_WAITING, ...TEN_K_LEFT_OUT];
  for (const r of all) {
    assert.match(r.ine, /^\d{5}$/);
    assert.equal(PROVINCE_REGION[r.ine.slice(0, 2)], r.region, `${r.ine} is not in ${r.region}`);
    assert.ok(r.population >= TEN_K_MIN_POPULATION && r.population < 20_000, `${r.ine}: ${r.population}`);
    assert.ok(r.ineTable >= 2854 && r.ineTable <= 2909, r.ine);
  }
  const codes = all.map((r) => r.ine);
  assert.equal(new Set(codes).size, codes.length, "no municipality twice in the wave");
  const earlier = new Set([...CORE_CITY_ROWS, ...MORE_CITY_ROWS, ...COUNCIL_CITY_ROWS, ...WAITING_TOWNS].map((r) => r.ine));
  for (const r of all) assert.ok(!earlier.has(r.ine), `${r.ine} ${r.ineName}: already in an earlier wave`);
  for (const r of TEN_K_CITY_ROWS) assert.equal(r.capital, false, r.ine);
});

test("waiting: the four communities with no 2027 list on TEN_K_READ_ON, re-read with the 20,000+ wave", () => {
  assert.equal(TEN_K_RECHECK_BY, WAITING_RECHECK_BY);
  assert.deepEqual([...new Set(TEN_K_WAITING.map((t) => t.region))].sort(), PENDING);
  assert.deepEqual(Object.keys(TEN_K_PENDING_READ).sort(), PENDING);
  for (const region of PENDING) {
    // The day one of them publishes, its towns move to rows (and this fails until they do).
    assert.notEqual(SOURCES[region].local.status, "published", `${region}: list out, move its towns from TEN_K_WAITING to rows`);
    assert.match(TEN_K_PENDING_READ[region]!, /núm\. \d+, de 24\.11\.2026$/);
    assert.ok(!TEN_K_CITY_ROWS.some((r) => r.region === region), `${region}: a row without a published list`);
  }
  for (const t of [...TEN_K_WAITING, ...TEN_K_LEFT_OUT]) assert.ok(!CITIES.some((c) => c.ine === t.ine), `${t.ineName}: no page`);
});

test("left out: each with the bulletin's reason; Benissa's printed weekdays contradict 2027", () => {
  assert.deepEqual(TEN_K_LEFT_OUT.map((t) => t.ineName).sort(), ["Astorga", "Benavente", "Benissa", "Llanes", "Villaquilambre"]);
  for (const t of TEN_K_LEFT_OUT) assert.ok(t.reason.length > 60, t.ineName);
  // BOP Alicante: «BENISSA: 27 de abril, lunes, …; 29 de junio, lunes, …».
  assert.equal(weekday("2027-04-27"), "Martes");
  assert.equal(weekday("2027-06-29"), "Martes");
});

test("rows: each from its community's official 2027 list, read on TEN_K_READ_ON, two days per area off the BOE ones", () => {
  assert.equal(TEN_K_READ_ON, "2026-11-24");
  for (const r of TEN_K_CITY_ROWS) {
    const s = SOURCES[r.region].local;
    assert.equal(r.status2027, "published", r.slug);
    assert.equal(s.status, "published", `${r.slug}: the community list must be out`);
    assert.equal(r.local2026, null, r.slug);
    assert.equal(r.readOn, TEN_K_READ_ON, r.slug);
    const list = r.local2027!;
    assert.equal(list.year, 2027);
    assert.ok(list.source.date <= TEN_K_READ_ON, `${r.slug}: read before its bulletin came out`);
    const official = [s.y2027, ...(s.parts ?? []).map((p) => p.text)].filter((t) => t !== null);
    assert.ok(official.some((t) => t.url === list.source.url && t.ref === list.source.ref), `${r.slug}: not the community's 2027 list`);
    assert.match(list.source.url, /^https:\/\//);
    for (const [area, days] of [["main", list.days] as const, ...(list.zones ?? []).map((z) => [z.place, z.days] as const)]) {
      assert.equal(days.length, 2, `${r.slug} ${area}`);
      assert.notEqual(days[0]!.date, days[1]!.date, `${r.slug} ${area}: two different days`);
      for (const d of days) {
        assert.match(d.date, /^2027-\d\d-\d\d$/);
        assert.equal(new Date(`${d.date}T12:00:00Z`).toISOString().slice(0, 10), d.date, `${r.slug}: ${d.date} is not a date`);
        // A weekday printed in the bulletin must be the real one, or the town is left out (Benissa).
        if (d.printedWeekday) assert.equal(d.printedWeekday, weekday(d.date), `${r.slug}: ${d.date}`);
      }
    }
    if (list.zones?.length) assert.ok(list.mainArea, `${r.slug}: zones need the main area's name`);
  }
  for (const c of tenK) {
    assert.ok(c, "every row has a city");
    const boe = new Set(nonLocalDates(c));
    for (const d of localDays(c)) assert.ok(!boe.has(d.date), `${c.slug}: ${d.date} is already a holiday of ${c.region}`);
    assert.equal(cityReadOn(c), TEN_K_READ_ON);
  }
});

test("rows: a sample read again on each bulletin (second download, 24 Nov 2026)", () => {
  const days = (region: Region, slug: string) => localDays(cityBySlug(region, slug)!).map((d) => [d.date, d.name]);
  // BOJA núm. 210: province heading, then «CABRA | 24 DE JUNIO | 08 DE SEPTIEMBRE».
  assert.deepEqual(days("AN", "cabra"), [["2027-06-24", null], ["2027-09-08", null]]);
  assert.deepEqual(days("AN", "huetor-vega"), [["2027-05-03", null], ["2027-05-28", null]]);
  // BOPA: the town's name sits between its two lines.
  assert.deepEqual(days("AS", "corvera-de-asturias"), [["2027-06-24", "Fiesta de San Juan"], ["2027-09-10", "Fiestas Populares de Corvera de Asturias"]]);
  // BOC Cantabria: «ASTILLERO, EL | SAN JOSE | 19 | MARZO» and «SAN PEDRO | 29 | JUNIO».
  assert.deepEqual(days("CB", "el-astillero"), [["2027-03-19", "San José"], ["2027-06-29", "San Pedro"]]);
  assert.deepEqual(days("CB", "laredo"), [["2027-08-27", "Batalla de las Flores"], ["2027-09-17", "El Último Desembarco de Carlos V"]]);
  // BOP de León (annex read on the page image: its text layer is not extractable).
  assert.deepEqual(days("CL", "la-baneza"), [["2027-02-09", "Carnaval Bañezano"], ["2027-08-17", "San Roque"]]);
  // DOE: «NAVALMORAL DE LA MATA. 9 de febrero y 10 de febrero.»
  assert.deepEqual(days("EX", "navalmoral-de-la-mata"), [["2027-02-09", null], ["2027-02-10", null]]);
  assert.deepEqual(days("EX", "zafra"), [["2027-05-15", null], ["2027-10-05", null]]);
  // DOG: the Spanish edition prints «Tomillo»; the Galician one, «Tomiño», same days.
  assert.deepEqual(days("GA", "tomino"), [["2027-02-09", "Martes de Carnaval"], ["2027-09-13", "Lunes del Alivio"]]);
  // BORM prints the weekday.
  assert.deepEqual(days("MC", "fuente-alamo-de-murcia"), [["2027-07-20", null], ["2027-08-28", null]]);
  // Bizkaia and Gipuzkoa: the town's day plus 31 July in the whole territory.
  assert.deepEqual(days("PV", "mungia"), [["2027-06-29", null], ["2027-07-31", "San Ignacio de Loyola"]]);
  // Formentera's 25 July 2027 is a Sunday in the BOIB: kept as printed.
  assert.deepEqual(days("IB", "formentera"), [["2027-07-25", "San Jaime"], ["2027-12-03", "San Francisco Javier"]]);
  assert.equal(weekday("2027-07-25"), "Domingo");
});

test("split towns keep the bulletin's areas, each with its own two days and a name in ca and en", () => {
  const zones = (region: Region, slug: string) => cityBySlug(region, slug)!.local2027!.zones!.map((z) => [z.place, ...z.days.map((d) => d.date)]);
  assert.deepEqual(zones("AS", "valdes"), [["Parroquia rural de Trevías", "2027-08-23", "2027-09-29"]]);
  assert.deepEqual(zones("AS", "san-martin-del-rey-aurelio"), [["Parroquias de San Andrés (L'Entregu/El Entrego) y Cocañín (La Güeria)", "2027-02-09", "2027-11-30"]]);
  assert.deepEqual(zones("CL", "el-espinar"), [
    ["San Rafael", "2027-07-30", "2027-09-29"],
    ["La Estación del Espinar", "2027-06-11", "2027-07-16"],
  ]);
  assert.deepEqual(zones("PV", "pasaia"), [
    ["Pasai San Pedro", "2027-06-29", "2027-07-31"],
    ["Pasai Antxo", "2027-07-07", "2027-07-31"],
    ["Trintxerpe", "2027-07-16", "2027-07-31"],
  ]);
  assert.equal(cityBySlug("IB", "felanitx")!.local2027!.zones!.length, 4);
  // No Spanish connective left in the Catalan or English name of an area.
  for (const r of TEN_K_CITY_ROWS) {
    const list = r.local2027!;
    for (const place of [list.mainArea, ...(list.zones ?? []).map((z) => z.place)]) {
      if (!place) continue;
      for (const l of ["ca", "en"] as const) {
        assert.doesNotMatch(areaNameIntl(place, l), /\b(Parroquias?|Todo el|salvo| y )\b/, `${r.slug} ${l}: ${place}`);
      }
    }
  }
});

test("slugs: lower-case ASCII, unique in the community across every wave", () => {
  for (const r of TEN_K_CITY_ROWS) {
    assert.match(r.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, r.slug);
    assert.ok(!["puentes", "dia", "aprovechar-vacaciones", "en-tu-web"].includes(r.slug), r.slug);
  }
  const keys = [...CITIES.map((c) => `${c.region}/${c.slug}`), ...WAITING_TOWNS.map((t) => `${t.region}/${t.slug}`)];
  assert.equal(new Set(keys).size, keys.length, "slug twice in a community");
});

test("pages: es, ca and en in the sitemap, and in the leave planner with both local days", () => {
  const es = new Set(spainSitemapEntries().map((e) => e.url));
  const intl = new Set(editionSitemapEntries().map((e) => e.url));
  const paths = new Set(spainPaths());
  for (const c of tenK) {
    const p = cityPath(c);
    assert.equal(p, `/es/festivos/2027/${names(c.region).slug}/${c.slug}/`);
    assert.ok(paths.has(p), p);
    assert.ok(es.has(`https://www.catalunyainfo.com${p}`), p);
    for (const l of ["ca", "en"] as const) assert.ok(intl.has(`https://www.catalunyainfo.com${editionCityPath(l, c)}`), `${l} ${c.slug}`);
  }
  const data = plannerData("es");
  for (const c of tenK) {
    const found = plannerPlace(data, `${c.community.slug}/${c.slug}`);
    assert.ok(found, `${c.slug}: not in the planner`);
    const all = itemHolidays(data, found.item);
    for (const d of localDays(c)) assert.ok(all.includes(d.date), `${c.slug}: ${d.date}`);
  }
});
