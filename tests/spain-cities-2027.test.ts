import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

process.env.VERCEL_ENV = "production";
process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";

type Region = import("../src/lib/programmatic/holidays/boe-2027.ts").Region;
const { SNAPSHOT, municipalities } = await import("../src/lib/programmatic/holidays/data.ts");
const { communityDays } = await import("../src/lib/programmatic/spain-2027/calendar.ts");
const { AUTONOMOUS_CITIES, CATALAN_CITIES, CITIES_AS_OF, CITIES_RECHECK_DAYS, CITY_ROWS, INE_POPULATION, NOT_YET, ineTableUrl } = await import(
  "../src/lib/programmatic/spain-2027/cities-data.ts"
);
const { CITIES, CITIES_RECHECK_BY, cityCalendar, cityRuns, commonLocalDays, holidayCount, islandDay, localDays, localOnRegional, localRuns } = await import(
  "../src/lib/programmatic/spain-2027/cities.ts"
);
const { cityDescription, cityFaq, cityH1, cityLead, cityTitle, pendingLine } = await import("../src/lib/programmatic/spain-2027/city-copy.ts");
const { DESCRIPTION_LIMIT, TITLE_LIMIT } = await import("../src/lib/programmatic/spain-2027/copy.ts");
const { cityPath, cityStaticParams, resolveCity, spainPaths, spainSitemapEntries } = await import("../src/lib/programmatic/spain-2027/paths.ts");
const { SOURCES } = await import("../src/lib/programmatic/spain-2027/sources.ts");

const ROOT = join(import.meta.dirname, "..");

/** Weekday by Sakamoto's method, independent of `Date`: 0 = Sunday. */
function sakamoto(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  const t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  const year = m < 3 ? y - 1 : y;
  return (year + Math.floor(year / 4) - Math.floor(year / 100) + Math.floor(year / 400) + t[m - 1]! + d) % 7;
}
const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

/** INE province code → BOE column, written out here independently of the data. */
const PROVINCE_REGION: Record<string, Region> = {
  "01": "PV", "02": "CM", "03": "VC", "04": "AN", "05": "CL", "06": "EX", "07": "IB", "08": "CT", "09": "CL", "10": "EX",
  "11": "AN", "12": "VC", "13": "CM", "14": "AN", "15": "GA", "16": "CM", "17": "CT", "18": "AN", "19": "CM", "20": "PV",
  "21": "AN", "22": "AR", "23": "AN", "24": "CL", "25": "CT", "26": "RI", "27": "GA", "28": "MD", "29": "AN", "30": "MC",
  "31": "NC", "32": "GA", "33": "AS", "34": "CL", "35": "CN", "36": "GA", "37": "CL", "38": "CN", "39": "CB", "40": "CL",
  "41": "AN", "42": "CL", "43": "CT", "44": "AR", "45": "CM", "46": "VC", "47": "CL", "48": "PV", "49": "CL", "50": "AR",
  "51": "CE", "52": "ML",
};

/** The 50 provincial capitals and Ceuta and Melilla, by INE code. */
const CAPITALS = [
  "01059", "02003", "03014", "04013", "05019", "06015", "07040", "08019", "09059", "10037", "11012", "12040", "13034", "14021", "15030", "16078",
  "17079", "18087", "19130", "20069", "21041", "22125", "23050", "24089", "25120", "26089", "27028", "28079", "29067", "30030", "31201", "32054",
  "33044", "34120", "35016", "36038", "37274", "38038", "39075", "40194", "41091", "42173", "43148", "44216", "45168", "46250", "47186", "48020",
  "49275", "50297", "51001", "52001",
];

/* -------------------------------------------------------------------------- */
/* Freshness                                                                  */
/* -------------------------------------------------------------------------- */

test("the city statuses are re-read within 21 days of CITIES_AS_OF", () => {
  // Pending communities publish their 2027 lists from mid-November to January
  // (sources.ts, the 2026 precedents). Fails from CITIES_RECHECK_BY until every
  // "missing" row and every NOT_YET community is read again, the new days are
  // transcribed with their source, and CITIES_AS_OF is moved.
  assert.equal(CITIES_RECHECK_DAYS, 21);
  const asOf = new Date(`${CITIES_AS_OF}T12:00:00Z`);
  assert.equal(CITIES_RECHECK_BY, new Date(asOf.getTime() + 21 * 86_400_000).toISOString().slice(0, 10));
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
  assert.ok(today < CITIES_RECHECK_BY, `re-read the pending local-holiday lists (cities-data.ts, read ${CITIES_AS_OF})`);
});

/* -------------------------------------------------------------------------- */
/* Scope                                                                      */
/* -------------------------------------------------------------------------- */

test("scope: every provincial capital and 50,000+ municipality, each once, with its INE figure", () => {
  const all = [
    ...CITY_ROWS.map((r) => ({ ine: r.ine, population: r.population, capital: r.capital, ineTable: r.ineTable })),
    ...NOT_YET.map((r) => ({ ine: r.ine, population: r.population, capital: r.capital, ineTable: r.ineTable })),
    ...AUTONOMOUS_CITIES.map((r) => ({ ine: r.ine, population: r.population, capital: true, ineTable: r.ineTable })),
    ...CATALAN_CITIES.map((r) => ({ ine: r.ine, population: r.population, capital: r.capital, ineTable: r.ineTable })),
  ];
  const codes = all.map((r) => r.ine);
  assert.equal(new Set(codes).size, codes.length, "no city twice");
  // 131 outside Catalonia (INE padrón at 1 Jan 2025), 24 in Catalonia.
  assert.equal(all.length - CATALAN_CITIES.length, 131);
  assert.equal(CATALAN_CITIES.length, 24);
  for (const code of CAPITALS) assert.ok(codes.includes(code), `capital ${code} missing`);
  for (const r of all) {
    assert.match(r.ine, /^\d{5}$/);
    assert.ok(r.capital === CAPITALS.includes(r.ine), `${r.ine}: capital flag`);
    assert.ok(r.capital || r.population >= 50_000, `${r.ine}: ${r.population}`);
    assert.ok(r.ineTable >= 2854 && r.ineTable <= 2909, `${r.ine}: INE table ${r.ineTable}`);
  }
  for (const r of CATALAN_CITIES) assert.equal(PROVINCE_REGION[r.ine.slice(0, 2)], "CT", r.ine);
  for (const r of [...CITY_ROWS, ...NOT_YET, ...AUTONOMOUS_CITIES]) assert.equal(PROVINCE_REGION[r.ine.slice(0, 2)], r.region, `${r.ine} is not in ${r.region}`);
  assert.match(INE_POPULATION.url, /BOE-A-2025-25362$/);
  assert.equal(INE_POPULATION.asOf, "2025-01-01");
  assert.equal(ineTableUrl(2895), "https://www.ine.es/jaxiT3/Tabla.htm?t=2895");
});

test("scope: the Catalan cities link to their town page, Ceuta and Melilla to their community page", () => {
  // Every one has a town page, except a council the DOGC order lists with no proposal (Cerdanyola del Vallès), which the list skips.
  const excluded = new Set(SNAPSHOT.excluded.map((e) => e.ine));
  for (const r of CATALAN_CITIES) assert.ok(municipalities().some((m) => m.ine === r.ine) || excluded.has(r.ine), `${r.ine}: no Catalan town page`);
  assert.equal(CATALAN_CITIES.filter((r) => excluded.has(r.ine)).length, 1);
  for (const r of AUTONOMOUS_CITIES) {
    assert.equal(SOURCES[r.region].local.days?.length, 2, r.name);
    assert.ok(!CITIES.some((c) => c.region === r.region), `${r.name}: no separate city page`);
  }
});

/* -------------------------------------------------------------------------- */
/* Data                                                                       */
/* -------------------------------------------------------------------------- */

test("rows: published cities carry two 2027 days from their community's official list", () => {
  for (const c of CITY_ROWS) {
    const s = SOURCES[c.region].local;
    if (c.status2027 === "published") {
      assert.ok(c.local2027, c.slug);
      assert.equal(c.local2027.year, 2027);
      assert.equal(c.local2026, null, `${c.slug}: no 2026 days once 2027 is out`);
      assert.equal(s.status, "published", `${c.slug}: the community list must be out`);
      const official = [s.y2027?.url, ...(s.parts ?? []).map((p) => p.text.url)].filter(Boolean);
      assert.ok(official.includes(c.local2027.source.url), `${c.slug}: source is not the community's 2027 list`);
      assert.ok(c.local2027.days.length === 2, `${c.slug}: ${c.local2027.days.length} days`);
      for (const z of c.local2027.zones ?? []) assert.ok(z.days.length >= 1 && z.days.every((d) => d.date.startsWith("2027-")), `${c.slug} ${z.place}`);
      if (c.local2027.zones?.length) assert.ok(c.local2027.mainArea, `${c.slug}: name the main area`);
    } else {
      assert.equal(c.local2027, null, c.slug);
      assert.ok(c.local2026, `${c.slug}: a city with no 2027 days needs its 2026 ones, or no page`);
      assert.equal(c.local2026.year, 2026);
      if (c.status2027 === "missing") assert.ok(c.note && s.status === "published", `${c.slug}: say what the list does with the city`);
      if (c.status2027 === "pending") {
        assert.equal(s.status, "pending", c.slug);
        assert.equal(c.local2026.source.url, s.y2026?.url, `${c.slug}: the community's 2026 list`);
      }
    }
    const lists = [c.local2027, c.local2026].filter((l) => l !== null);
    for (const list of lists) {
      assert.match(list.source.url, /^https:\/\//, c.slug);
      const dates = list.days.map((d) => d.date);
      assert.deepEqual(dates, [...new Set(dates)], `${c.slug}: no day twice`);
      for (const d of list.days) {
        assert.ok(d.date.startsWith(`${list.year}-`), `${c.slug}: ${d.date}`);
        assert.ok(!Number.isNaN(Date.parse(`${d.date}T00:00:00Z`)), d.date);
        if (d.printedWeekday) assert.equal(WEEKDAYS[sakamoto(d.date)], d.printedWeekday.toLowerCase(), `${c.slug}: ${d.date} is not a ${d.printedWeekday}`);
      }
    }
  }
});

test("rows: a sample transcribed by hand from each bulletin", () => {
  const days = (slug: string) => localDays(CITIES.find((c) => c.slug === slug)!).map((d) => [d.date, d.name]);
  assert.deepEqual(days("sevilla"), [["2027-04-14", null], ["2027-05-27", null]]);
  assert.deepEqual(days("oviedo"), [["2027-05-18", "Martes de Campo"], ["2027-09-21", "San Mateo"]]);
  assert.deepEqual(days("palma"), [["2027-01-20", "San Sebastián"], ["2027-06-24", "San Juan"]]);
  assert.deepEqual(days("santa-cruz-de-tenerife"), [["2027-02-23", "Martes de Carnaval"], ["2027-05-03", "Festividad del Día de la Cruz"]]);
  assert.deepEqual(days("leon"), [["2027-06-24", "San Juan"], ["2027-10-05", "San Froilán"]]);
  assert.deepEqual(days("badajoz"), [["2027-02-09", null], ["2027-06-24", null]]);
  assert.deepEqual(days("vigo"), [["2027-03-29", null], ["2027-08-16", null]]);
  assert.deepEqual(days("cartagena"), [["2027-01-07", null], ["2027-09-24", null]]);
  assert.deepEqual(days("bilbao"), [["2027-07-31", "San Ignacio de Loyola"], ["2027-08-27", "Viernes de la Semana Grande"]]);
  assert.deepEqual(days("logrono"), [["2027-06-11", "San Bernabé"], ["2027-09-21", "San Mateo"]]);
  // Bizkaia and Gipuzkoa share 31 July, a Saturday in 2027.
  for (const slug of ["bilbao", "barakaldo", "getxo", "san-sebastian", "irun"]) assert.ok(days(slug).some(([d]) => d === "2027-07-31"), slug);
  assert.equal(sakamoto("2027-07-31"), 6);
  // Pending communities: the 2026 days, from the 2026 lists.
  const days26 = (slug: string) => CITIES.find((c) => c.slug === slug)!.local2026!.days.map((d) => d.date);
  assert.deepEqual(days26("madrid"), ["2026-05-15", "2026-11-09"]);
  assert.deepEqual(days26("valencia"), ["2026-01-22", "2026-04-13"]);
  assert.deepEqual(days26("zaragoza"), ["2026-01-29", "2026-03-05"]);
  assert.deepEqual(days26("santander"), ["2026-05-25", "2026-07-25"]);
  assert.deepEqual(days26("toledo"), ["2026-01-23", "2026-11-26"]);
  assert.deepEqual(days26("pamplona"), ["2026-11-30", "2026-12-03"]);
  // Navarra's 3 December 2027 is already fixed for every municipality: Pamplona's page counts it.
  const pamplona = CITIES.find((c) => c.slug === "pamplona")!;
  assert.deepEqual(commonLocalDays(pamplona).map((d) => d.date), ["2027-12-03"]);
  assert.equal(holidayCount(pamplona), 13);
  // Burgos and Valladolid: the 2027 provincial lists leave the capital out.
  for (const slug of ["burgos", "valladolid"]) {
    const c = CITIES.find((x) => x.slug === slug)!;
    assert.equal(c.status2027, "missing");
    assert.ok(c.local2026!.days.every((d) => d.date.startsWith("2026-")));
  }
});

test("calendar: local days add to the BOE days, never fall on one, and Canarias adds the island's day", () => {
  for (const c of CITIES) {
    assert.deepEqual(localOnRegional(c), [], `${c.slug}: a local day on a regional holiday`);
    const regional = communityDays(c.region).length;
    const island = islandDay(c);
    if (c.region === "CN") assert.ok(island, `${c.slug}: island day`);
    else assert.equal(island, null);
    assert.equal(holidayCount(c), regional + (island ? 1 : 0) + localDays(c).length + commonLocalDays(c).length, c.slug);
    assert.equal(cityCalendar(c).filter((d) => d.kind === "local").length, localDays(c).length + commonLocalDays(c).length);
    // Runs are the holiday engine's; a local run always contains a local day.
    for (const r of localRuns(c)) assert.ok(localDays(c).some((d) => d.date >= r.from && d.date <= r.to), `${c.slug}: ${r.from}`);
    assert.ok(cityRuns(c).length >= localRuns(c).length);
  }
  const lasPalmas = CITIES.find((c) => c.slug === "las-palmas-de-gran-canaria")!;
  assert.deepEqual(islandDay(lasPalmas), { date: "2027-09-08", name: "Nuestra Señora del Pino", place: "Gran Canaria" });
  assert.equal(holidayCount(lasPalmas), 14);
  // Murcia: Thursday 25 and Friday 26 March, then the local Tuesday 30 March: 6 days for 1 of leave.
  const murcia = CITIES.find((c) => c.slug === "murcia")!;
  assert.ok(localRuns(murcia).some((r) => r.from === "2027-03-25" && r.to === "2027-03-30" && r.take.join() === "2027-03-29"));
});

/* -------------------------------------------------------------------------- */
/* Copy                                                                       */
/* -------------------------------------------------------------------------- */

test("titles: 'Festivos locales <Ciudad> 2027: <día 1> y <día 2>' when known, else 'Calendario laboral <Ciudad> 2027: festivos'", () => {
  const titles = new Set<string>();
  for (const c of CITIES) {
    const title = cityTitle(c);
    assert.ok(title.length <= TITLE_LIMIT, `${title} (${title.length})`);
    titles.add(title);
    const known = c.status2027 === "published" && !c.local2027?.zones?.length;
    if (known) {
      assert.match(title, /^Festivos (locales )?.+ 2027: \d/, title);
      for (const d of localDays(c)) assert.ok(title.includes(String(Number(d.date.slice(8, 10)))), `${title}: ${d.date}`);
    } else {
      assert.match(title, /^Calendario laboral .+ 2027: festivos$/, title);
    }
    const description = cityDescription(c);
    assert.ok(description.length <= DESCRIPTION_LIMIT, `${c.slug}: ${description.length}`);
    assert.ok(description.includes(c.name), description);
    assert.ok(cityH1(c).startsWith(`Calendario laboral ${c.name} 2027`), c.slug);
  }
  assert.equal(titles.size, CITIES.length, "no two cities share a title");
  assert.equal(cityTitle(CITIES.find((c) => c.slug === "sevilla")!), "Festivos locales Sevilla 2027: 14 de abril y 27 de mayo");
  assert.equal(cityTitle(CITIES.find((c) => c.slug === "burgos")!), "Calendario laboral Burgos 2027: festivos");
});

test("intros: each city's own facts, no two alike; pending cities say so plainly", () => {
  const leads = CITIES.map((c) => cityLead(c));
  assert.equal(new Set(leads).size, leads.length, "every intro is unique");
  for (const c of CITIES) {
    const lead = cityLead(c);
    assert.ok(lead.includes(c.name), c.slug);
    assert.ok(lead.includes(new Intl.NumberFormat("es-ES").format(c.population)), `${c.slug}: population`);
    if (c.status2027 === "published") {
      assert.ok(lead.includes(c.local2027!.source.ref), `${c.slug}: the bulletin`);
    } else {
      assert.ok(lead.startsWith(`Las fiestas locales de 2027 de ${c.name} aún no se han publicado`), lead);
      assert.ok(pendingLine(c).includes("En 2026 fueron"), c.slug);
    }
  }
  assert.match(cityLead(CITIES.find((c) => c.slug === "valladolid")!), /«No comunicada»/);
});

test("FAQ: '¿es festivo…?' for each local day, with the answer and its effect on the week", () => {
  for (const c of CITIES) {
    const faq = cityFaq(c);
    assert.ok(faq.length >= 2, c.slug);
    if (c.status2027 === "published") {
      for (const d of localDays(c)) {
        const q = faq.find((f) => f.question.startsWith("¿Es festivo el") && f.question.includes(`${Number(d.date.slice(8, 10))} de`) && f.question.endsWith(`en ${c.name}?`));
        assert.ok(q, `${c.slug}: question for ${d.date}`);
        assert.match(q.answer, /^Sí\. Es fiesta local/);
      }
      assert.ok(faq[0]!.answer.includes(c.local2027!.source.ref));
    } else {
      assert.match(faq[0]!.answer, /^No\. Las fiestas locales de 2027/);
    }
  }
});

/* -------------------------------------------------------------------------- */
/* URLs, route, sitemap                                                       */
/* -------------------------------------------------------------------------- */

test("URLs: /es/festivos/2027/<comunidad>/<ciudad>/, unique, in the sitemap and the publish group", () => {
  const paths = CITIES.map((c) => cityPath(c));
  assert.equal(new Set(paths).size, paths.length);
  for (const p of paths) assert.match(p, /^\/es\/festivos\/2027\/[a-z]+(-[a-z]+)*\/[a-z]+(-[a-z]+)*\/$/, p);
  assert.equal(cityPath(CITIES.find((c) => c.slug === "sevilla")!), "/es/festivos/2027/andalucia/sevilla/");
  for (const p of paths) assert.ok(spainPaths().includes(p), p);
  const sitemap = new Set(spainSitemapEntries().map((e) => e.url));
  for (const p of paths) assert.ok(sitemap.has(`https://www.catalunyainfo.com${p}`), p);
  assert.equal(cityStaticParams().length, CITIES.length);
  assert.equal(resolveCity("es", "andalucia", "sevilla")?.ine, "41091");
  assert.equal(resolveCity("es", "madrid", "sevilla"), null);
  assert.equal(resolveCity("ca", "andalucia", "sevilla"), null);
  assert.equal(resolveCity("es", "andalucia", "puentes"), null);
});

test("route: dynamicParams = true (revalidated by calendario-2027-espana), revalidate = false, notFound() for the rest", () => {
  const path = join(ROOT, "src", "app", "(public)", "[locale]", "festivos", "2027", "[comunidad]", "[ciudad]", "page.tsx");
  assert.ok(existsSync(path));
  const source = readFileSync(path, "utf8");
  assert.match(source, /^export const dynamicParams = true;$/m);
  assert.doesNotMatch(source, /^export const dynamicParams = false/m);
  assert.match(source, /^export const revalidate = false;$/m);
  assert.match(source, /notFound\(\)/);
  assert.match(source, /generateStaticParams/);
});
