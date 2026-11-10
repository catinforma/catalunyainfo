import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

process.env.VERCEL_ENV = "production";
process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";

const { BOE_2027, BOE_2027_ROWS, REGIONS } = await import("../src/lib/programmatic/holidays/boe-2027.ts");
const { NEXT_YEAR, SNAPSHOT, aranSwap, regionalDays } = await import("../src/lib/programmatic/holidays/data.ts");
const { municipalities } = await import("../src/lib/programmatic/holidays/data.ts");
const {
  COMMON_DATES,
  SUBSTITUTIONS,
  communityDays,
  communityRuns,
  communityRunsWithLocal,
  dayCount,
  easterDays,
  easterSunday,
  isSubstitutionName,
  nationalNotKept,
  ownDays,
  runSummary,
  spainRuns,
  weekday,
} = await import("../src/lib/programmatic/spain-2027/calendar.ts");
const { COMMUNITIES, communityBySlug, names } = await import("../src/lib/programmatic/spain-2027/communities.ts");
const {
  DESCRIPTION_LIMIT,
  TITLE_LIMIT,
  bridgesDescription,
  communityDescription,
  communityFaq,
  communityH1,
  communityLead,
  communityTitle,
  compactDates,
  decreeLine,
  everywhereFree,
  hubDescription,
  rangeWords,
  BRIDGES,
  HUB,
} = await import("../src/lib/programmatic/spain-2027/copy.ts");
const { SPAIN_BRIDGES_SLUG, communityPath, communityStaticParams, resolveCommunity, spainBridgesPath, spainHubPath, spainPaths, spainSitemapEntries } = await import(
  "../src/lib/programmatic/spain-2027/paths.ts"
);
const { BOE_REF, SOURCES, SOURCES_READ_ON, STATUS_RECHECK_BY } = await import("../src/lib/programmatic/spain-2027/sources.ts");
const { CITIES } = await import("../src/lib/programmatic/spain-2027/cities.ts");

type Region = (typeof REGIONS)[number];

const ROOT = join(import.meta.dirname, "..");
const APP = join(ROOT, "src", "app", "(public)", "[locale]", "festivos", "2027");
const FIXTURE = readFileSync(join(ROOT, "tests/fixtures/holidays/boe-a-2026-21254.txt"), "utf8");

/** Weekday by Sakamoto's method, independent of `Date`: 0 = Sunday. */
function sakamoto(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  const t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  const year = m < 3 ? y - 1 : y;
  return (year + Math.floor(year / 4) - Math.floor(year / 100) + Math.floor(year / 400) + t[m - 1]! + d) % 7;
}

/* -------------------------------------------------------------------------- */
/* The source: BOE-A-2026-21254                                               */
/* -------------------------------------------------------------------------- */

test("BOE reference: the resolution, its number and URL are there, and the fixture is that text", () => {
  assert.equal(BOE_REF.id, "BOE-A-2026-21254");
  assert.equal(BOE_REF.date, "2026-10-13");
  assert.equal(BOE_REF.url, BOE_2027.url);
  assert.ok(BOE_REF.url.includes(BOE_REF.id), "the URL names the BOE id");
  assert.match(BOE_REF.ref, /BOE núm\. 254, de 13\.10\.2026/);
  assert.equal(BOE_REF.title, "Resolución de 8 de octubre de 2026, de la Dirección General de Trabajo, por la que se publica relación de fiestas laborales para el año 2027");
  assert.equal(BOE_REF.pdf, "https://www.boe.es/boe/dias/2026/10/13/pdfs/BOE-A-2026-21254.pdf");
  // The fixture the BOE rows are tested against is that resolution.
  assert.ok(FIXTURE.startsWith(`${BOE_REF.id} — Resolución de 8 de octubre de 2026`));
  assert.ok(FIXTURE.includes(BOE_2027.url));
  assert.equal(BOE_2027_ROWS.length, 35);
});

/* -------------------------------------------------------------------------- */
/* What each page says: counts and a known date per community                 */
/* -------------------------------------------------------------------------- */

const COUNTS: Record<Region, number> = {
  AN: 12, AR: 12, AS: 12, IB: 12, CN: 11, CB: 12, CM: 12, CL: 12, CT: 12, EX: 12,
  GA: 12, MD: 12, MC: 12, NC: 12, PV: 12, RI: 12, VC: 12, CE: 12, ML: 12,
};

/** One date each page must list, with the BOE's name for it. */
const KNOWN: Record<Region, [string, string]> = {
  AN: ["2027-03-01", "Día de Andalucía"],
  AR: ["2027-04-23", "San Jorge/Día de Aragón"],
  AS: ["2027-09-08", "Día de Asturias"],
  IB: ["2027-03-01", "Día de les Illes Balears"],
  CN: ["2027-08-16", "Lunes siguiente a asunción de la Virgen"],
  CB: ["2027-07-28", "Día de las Instituciones de Cantabria"],
  CM: ["2027-05-31", "Día de Castilla-La Mancha"],
  CL: ["2027-04-23", "Fiesta de Castilla y León"],
  CT: ["2027-06-24", "Día de San Juan"],
  EX: ["2027-10-11", "Sustitución 15 de agosto"],
  GA: ["2027-05-17", "Día de las Letras Gallegas"],
  MD: ["2027-03-19", "San José"],
  MC: ["2027-06-09", "Día de la Región de Murcia"],
  NC: ["2027-03-29", "Lunes de Pascua"],
  PV: ["2027-10-07", "Aniversario 1er Gobierno Euskadi"],
  RI: ["2027-06-09", "Día de La Rioja"],
  VC: ["2027-10-09", "Día de la Comunitat Valenciana"],
  CE: ["2027-08-05", "Nuestra Señora de África"],
  ML: ["2027-03-10", "Fiesta del Eid Fitr"],
};

test("every community: its count and one known date, as the BOE prints them", () => {
  assert.equal(COMMUNITIES.length, 19);
  for (const r of REGIONS) {
    assert.equal(dayCount(r), COUNTS[r], `${r}: count`);
    assert.equal(communityDays(r).length, COUNTS[r], `${r}: one row per date`);
    const [iso, name] = KNOWN[r];
    assert.ok(communityDays(r).some((d) => d.date === iso && d.name === name), `${r}: ${iso} ${name}`);
  }
  // The brief's own example: Madrid, 12 days.
  assert.equal(communityTitle(names("MD")), "Festivos 2027 en Madrid: 12 días, puentes y fechas");
  // Holy Thursday everywhere but Catalonia and the Valencian Community.
  for (const r of REGIONS) assert.equal(communityDays(r).some((d) => d.date === "2027-03-25"), r !== "CT" && r !== "VC", r);
});

test("the nine days common to all Spain, and what each community adds", () => {
  assert.deepEqual(COMMON_DATES, ["2027-01-01", "2027-01-06", "2027-03-26", "2027-05-01", "2027-10-12", "2027-11-01", "2027-12-06", "2027-12-08", "2027-12-25"]);
  for (const r of REGIONS) {
    assert.equal(ownDays(r).length + COMMON_DATES.length, COUNTS[r], r);
    assert.ok(communityLead(names(r)).includes(`${COUNTS[r]} festivos laborales en 2027`), r);
  }
  assert.deepEqual(ownDays("MD").map((d) => d.date), ["2027-03-19", "2027-03-25", "2027-08-16"]);
  assert.deepEqual(ownDays("CT").map((d) => d.date), ["2027-03-29", "2027-06-24", "2027-09-11"]);
  assert.deepEqual(nationalNotKept("CT").map((x) => x.row.date), ["2027-03-19", "2027-03-25", "2027-08-16"]);
  assert.deepEqual(nationalNotKept("MD"), []);
});

test("Easter: the BOE's Holy Thursday, Good Friday and Easter Monday are the computed ones", () => {
  assert.equal(easterSunday(2027), "2027-03-28");
  // Known Easter Sundays, from the same algorithm's published table.
  assert.equal(easterSunday(2026), "2026-04-05");
  assert.equal(easterSunday(2025), "2025-04-20");
  const e = easterDays(2027);
  const row = (name: string) => BOE_2027_ROWS.find((r) => r.name === name)!.date;
  assert.equal(row("Jueves Santo"), e.holyThursday);
  assert.equal(row("Viernes Santo"), e.goodFriday);
  assert.equal(row("Lunes de Pascua"), e.easterMonday);
});

test("substitution days: every moved row is known, and what it replaces is a Sunday", () => {
  const moved = BOE_2027_ROWS.filter((r) => isSubstitutionName(r.name));
  assert.deepEqual(moved.map((r) => r.date), ["2027-08-16", "2027-10-11"]);
  for (const r of moved) {
    const s = SUBSTITUTIONS[r.name];
    assert.ok(s, `${r.name}: not in SUBSTITUTIONS`);
    assert.equal(sakamoto(s.replaces), 0, `${s.replaces} is a Sunday`);
  }
  assert.equal(communityDays("EX").find((d) => d.date === "2027-10-11")!.replaces, "2027-08-15");
  // Every date the pages print carries its own weekday.
  for (const r of REGIONS) for (const d of communityDays(r)) assert.equal(weekday(d.date), sakamoto(d.date), d.date);
});

/* -------------------------------------------------------------------------- */
/* Long weekends (computed)                                                   */
/* -------------------------------------------------------------------------- */

test("long weekends: computed from the BOE days, the three everywhere and Madrid's", () => {
  assert.deepEqual(
    everywhereFree().map((r) => [r.from, r.to]),
    [
      ["2027-01-01", "2027-01-03"],
      ["2027-10-30", "2027-11-01"],
      ["2027-12-04", "2027-12-06"],
    ],
  );
  const md = communityRuns("MD");
  assert.deepEqual(runSummary(md), { free: 6, oneDay: 2, twoDays: 1, total: 9 });
  assert.ok(md.some((r) => r.from === "2027-08-14" && r.to === "2027-08-16" && r.take.length === 0));
  // Extremadura's 11 October makes the 12 October weekend free there only.
  assert.ok(communityRuns("EX").some((r) => r.from === "2027-10-09" && r.to === "2027-10-12" && r.take.length === 0));
  assert.ok(communityRuns("MD").some((r) => r.from === "2027-10-09" && r.to === "2027-10-12" && r.take.join() === "2027-10-11"));
  // Every run in the Spain table belongs to the communities it names.
  for (const run of spainRuns()) {
    for (const r of run.regions) assert.ok(communityRuns(r).some((x) => x.from === run.from && x.to === run.to && x.take.join() === run.take.join()), `${run.from} ${r}`);
    for (const h of run.holidays) assert.ok(run.regions.every((r) => communityDays(r).some((d) => d.date === h.date)) || run.holidays.length > 1, h.date);
  }
  assert.equal(rangeWords("2027-10-30", "2027-11-01"), "del sábado 30 de octubre al lunes 1 de noviembre");
  assert.equal(compactDates(["2027-01-01", "2027-01-06", "2027-03-19"]), "1 y 6 ene, 19 mar");
});

/* -------------------------------------------------------------------------- */
/* Official sources per community                                             */
/* -------------------------------------------------------------------------- */

/** The official hosts each community's texts may come from. */
const HOSTS: Record<Region, RegExp> = {
  AN: /(^|\.)juntadeandalucia\.es$/,
  AR: /(^|\.)aragon\.es$/,
  AS: /(^|\.)asturias\.es$/,
  IB: /(^|\.)caib\.es$/,
  CN: /(^|\.)gobiernodecanarias\.org$/,
  CB: /(^|\.)cantabria\.es$/,
  CM: /(^|\.)jccm\.es$/,
  // The Junta's copies of the nine provincial bulletins, and Ávila's own.
  CL: /(^|\.)(jcyl\.es|diputacionavila\.es)$/,
  CT: /(^|\.)(gencat\.cat|transparenciacatalunya\.cat)$/,
  EX: /(^|\.)juntaex\.es$/,
  GA: /(^|\.)xunta\.gal$/,
  MD: /(^|\.)(comunidad\.madrid|bocm\.es)$/,
  MC: /(^|\.)(borm\.es|carm\.es)$/,
  NC: /(^|\.)navarra\.es$/,
  PV: /(^|\.)(euskadi\.eus|araba\.eus|bizkaia\.eus|gipuzkoa\.eus)$/,
  RI: /(^|\.)larioja\.org$/,
  VC: /(^|\.)gva\.es$/,
  CE: /(^|\.)ceuta\.es$/,
  ML: /(^|\.)(melilla\.es|bomemelilla\.es)$/,
};

function host(url: string): string {
  return new URL(url).hostname;
}

test("sources: every community has its bulletin, the local-holiday status and official URLs only", () => {
  assert.match(SOURCES_READ_ON, /^2026-11-\d\d$/);
  for (const r of REGIONS) {
    const s = SOURCES[r];
    assert.ok(s, r);
    const urls = [
      s.local.bulletinUrl,
      s.local.y2027?.url,
      s.local.y2026?.url,
      s.local.dataset?.url,
      s.decree.status === "published" ? s.decree.text.url : s.decree.where.url,
      ...(s.extraSources ?? []).map((x) => x.url),
      ...(s.local.parts ?? []).map((x) => x.text.url),
    ].filter((u): u is string => Boolean(u));
    for (const url of urls) {
      assert.match(url, /^https:\/\//, `${r}: ${url}`);
      assert.ok(HOSTS[r].test(host(url)) || host(url) === "www.boe.es", `${r}: ${url} is not an official host`);
    }
    assert.ok(s.local.bulletinName.length > 3 && s.local.bulletinShort.length > 3, r);
    assert.ok(["published", "pending", "partial"].includes(s.local.status), r);
    if (s.local.status === "published") assert.ok(s.local.y2027 || s.local.parts?.length, `${r}: published without the 2027 text`);
    if (s.local.status !== "published") assert.ok(s.local.y2026 || s.local.note, `${r}: pending with no precedent or note`);
    for (const t of [s.local.y2027, s.local.y2026, s.decree.status === "published" ? s.decree.text : null, ...(s.local.parts ?? []).map((p) => p.text)]) {
      if (t) assert.match(t.date, /^20\d\d-\d\d-\d\d$/, `${r}: ${t.ref}`);
    }
  }
});

test("each community's own decree, where published, says what the BOE says (or the page shows the difference)", () => {
  let published = 0;
  for (const r of REGIONS) {
    const d = SOURCES[r].decree;
    if (d.status !== "published") continue;
    published += 1;
    const boe = communityDays(r).map((x) => x.date);
    if (d.differences !== null) assert.notDeepEqual([...d.dates].sort(), boe, `${r}: a difference is stated but the dates agree`);
    else if (d.covers === "all") assert.deepEqual([...d.dates].sort(), boe, `${r}: ${d.text.ref} vs BOE`);
    else for (const iso of d.dates) assert.ok(boe.includes(iso), `${r}: ${iso} of ${d.text.ref} is not in the BOE column`);
    for (const m of d.moves) {
      assert.ok(boe.includes(m.date), `${r}: moved day ${m.date} not in the BOE`);
      assert.equal(sakamoto(m.replaces), 0, `${r}: ${m.replaces} should be a Sunday`);
    }
    assert.ok(d.text.date <= BOE_REF.date, `${r}: decree dated after the BOE that lists it?`);
    const line = decreeLine(names(r));
    assert.ok(line.includes(d.text.ref), r);
    if (d.differences === null) assert.match(line, /coincide con el BOE/, r);
  }
  assert.ok(published >= 15, `only ${published} decrees read`);
  // Catalonia: the decree is the order the Catalan engine already reads.
  const ct = SOURCES.CT.decree;
  assert.equal(ct.status, "published");
  if (ct.status === "published") {
    assert.equal(ct.text.url, SNAPSHOT.sources.regional["2027"]!.url);
    assert.deepEqual(ct.dates, regionalDays(2027).map((d) => d.date));
  }
  // Catalonia's local list follows the DOGC order the holiday engine parses.
  assert.equal(SOURCES.CT.local.status, NEXT_YEAR.order ? "published" : "pending");
  assert.equal(SOURCES.CT.local.y2026!.url, SNAPSHOT.sources.localOrder.url);
});

test("BOE footnotes: Canarias' island days and Aran are the BOE's own words", () => {
  const cn = SOURCES.CN.subRegional;
  assert.ok(cn);
  assert.equal(cn.items.length, 7);
  for (const i of cn.items) {
    const day = Number(i.date.slice(8, 10));
    assert.ok(FIXTURE.includes(`el ${day} de`) && FIXTURE.includes(i.name), `${i.place}: ${i.date} ${i.name}`);
  }
  assert.ok(FIXTURE.includes(SOURCES.CN.boeNote!.slice(0, 60)));
  assert.ok(FIXTURE.includes(SOURCES.CT.boeNote!));
  const aran = aranSwap(2027)!;
  assert.match(SOURCES.CT.boeNote!, new RegExp(`${Number(aran.date.slice(8, 10))} de junio`));
  assert.equal(communityTitle(names("CN")), "Festivos 2027 en Canarias: 11 días + 1 insular y puentes");
});

test("local statuses as read on 5-6 Nov 2026, and the local days that apply everywhere", () => {
  const published = REGIONS.filter((r) => SOURCES[r].local.status === "published");
  assert.deepEqual(published, ["AN", "AS", "IB", "CN", "CL", "EX", "GA", "MC", "PV", "RI", "CE", "ML"]);
  assert.deepEqual(REGIONS.filter((r) => SOURCES[r].local.status === "pending"), ["AR", "CB", "CM", "CT", "MD", "NC", "VC"]);
  // Castilla y León: nine provincial bulletins; País Vasco: three.
  assert.equal(SOURCES.CL.local.parts!.length, 9);
  assert.deepEqual(SOURCES.PV.local.parts!.map((p) => p.place), ["Álava", "Bizkaia", "Gipuzkoa"]);
  // Ceuta and Melilla are one municipality each: their two local days, not in their BOE column.
  assert.deepEqual(SOURCES.CE.local.days!.map((d) => d.date), ["2027-03-10", "2027-09-02"]);
  assert.deepEqual(SOURCES.ML.local.days!.map((d) => d.date), ["2027-09-08", "2027-09-17"]);
  for (const r of ["CE", "ML"] as const) {
    for (const d of SOURCES[r].local.days!) assert.ok(!communityDays(r).some((x) => x.date === d.date), `${r}: ${d.date}`);
    assert.match(communityFaq(names(r))[0]!.answer, /son 14\./);
  }
  // Navarra: 3 December is local everywhere (Resolución 232/2026), so the BOE leaves it out.
  assert.deepEqual(SOURCES.NC.local.days, [{ date: "2027-12-03", name: "San Francisco Javier, Día de Navarra" }]);
  assert.ok(!communityDays("NC").some((d) => d.date === "2027-12-03"));
  assert.ok(communityRunsWithLocal("NC", ["2027-12-03"]).some((r) => r.from === "2027-12-03" && r.to === "2027-12-08"));
  // Andalucía moved its own day from Sunday 28 February (the decree says so; the BOE row does not).
  const an = SOURCES.AN.decree;
  assert.ok(an.status === "published" && an.moves.some((m) => m.date === "2027-03-01" && m.replaces === "2027-02-28"));
  // Asturias' decree fixes only its own day.
  assert.ok(SOURCES.AS.decree.status === "published" && SOURCES.AS.decree.covers === "own");
  // Ceuta's own decree was not found: the page says so and rests on the BOE.
  assert.equal(SOURCES.CE.decree.status, "not-found");
});

test("the local-holiday statuses are re-read in time", () => {
  // Statuses change every week from November to January (the bulletins publish the 2027 lists).
  // Fails from STATUS_RECHECK_BY until sources.ts is read again and the date moved.
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
  assert.ok(today <= STATUS_RECHECK_BY, `re-read every community's local-holiday status (sources.ts, read ${SOURCES_READ_ON})`);
  assert.ok(STATUS_RECHECK_BY > SOURCES_READ_ON);
});

/* -------------------------------------------------------------------------- */
/* Copy                                                                       */
/* -------------------------------------------------------------------------- */

test("titles and descriptions answer first and fit", () => {
  for (const c of COMMUNITIES) {
    const title = communityTitle(c);
    assert.ok(title.startsWith(`Festivos 2027 en ${c.short}: ${dayCount(c.region)} días`), title);
    assert.ok(title.length <= TITLE_LIMIT, `${title} (${title.length})`);
    const description = communityDescription(c);
    assert.ok(description.length <= DESCRIPTION_LIMIT, `${c.slug}: ${description.length}`);
    assert.ok(description.includes(`${dayCount(c.region)} festivos en 2027`), description);
    assert.ok(communityH1(c).startsWith("Calendario laboral 2027 "), c.slug);
    const faq = communityFaq(c);
    assert.equal(faq.length, 4);
    assert.match(faq[0]!.answer, /BOE de 13 de octubre de 2026/);
    assert.match(faq[2]!.answer, /Cálculo de CatalunyaInfo/);
  }
  for (const t of [HUB.title, BRIDGES.title]) assert.ok(t.length <= TITLE_LIMIT, t);
  for (const d of [hubDescription(), bridgesDescription()]) assert.ok(d.length <= DESCRIPTION_LIMIT, `${d.length}: ${d}`);
  assert.equal(communityH1(names("PV")), "Calendario laboral 2027 del País Vasco: festivos y puentes");
  assert.match(communityDescription(names("MD")), /^La Comunidad de Madrid tiene 12 festivos en 2027 \(BOE\): 1 y 6 ene, 19, 25 y 26 mar, 1 may, 16 ago, 12 oct, 1 nov, 6, 8 y 25 dic\./);
});

/* -------------------------------------------------------------------------- */
/* URLs, routes, sitemap, publish group                                       */
/* -------------------------------------------------------------------------- */

test("URLs: /es/festivos/2027/<comunidad>/, no collision with the Catalan town slugs", () => {
  assert.equal(spainHubPath(), "/es/festivos/2027/");
  assert.equal(spainBridgesPath(), "/es/festivos/2027/puentes/");
  assert.equal(communityPath(names("MD")), "/es/festivos/2027/madrid/");
  const slugs = COMMUNITIES.map((c) => c.slug);
  assert.equal(new Set(slugs).size, 19);
  assert.ok(!slugs.includes(SPAIN_BRIDGES_SLUG));
  for (const s of slugs) assert.match(s, /^[a-z]+(-[a-z]+)*$/, s);
  // The static `2027` folder sits beside `[municipi]`: no town may be called that.
  assert.ok(!municipalities().some((m) => m.slug === "2027" || m.slug === "comarca" || m.slug === "dia"));
  // 21 community-level pages, then one per city (cities.ts; tests/spain-cities-2027.test.ts).
  assert.equal(spainPaths().length, 21 + CITIES.length);
  assert.equal(new Set(spainPaths()).size, 21 + CITIES.length);
  assert.deepEqual(communityStaticParams().map((p) => p.comunidad), slugs);
  assert.ok(communityStaticParams().every((p) => p.locale === "es"));
  assert.equal(resolveCommunity("es", "madrid")?.region, "MD");
  assert.equal(resolveCommunity("ca", "madrid"), null);
  assert.equal(resolveCommunity("es", "puentes"), null);
  assert.equal(communityBySlug("barcelona"), null);
});

test("routes: revalidated by the publish group, so dynamicParams = true, notFound() for the rest", () => {
  for (const file of ["page.tsx", "puentes/page.tsx", "[comunidad]/page.tsx"]) {
    const path = join(APP, file);
    assert.ok(existsSync(path), file);
    const source = readFileSync(path, "utf8");
    assert.match(source, /^export const dynamicParams = true;$/m, file);
    assert.doesNotMatch(source, /^export const dynamicParams = false/m, file);
    assert.match(source, /^export const revalidate = false;$/m, file);
    assert.match(source, /notFound\(\)/, file);
    assert.match(source, /generateStaticParams/, file);
  }
});

test("sitemap and publish group: the 21 URLs and the city pages are listed, and the group revalidates only them", () => {
  const entries = spainSitemapEntries();
  assert.equal(entries.length, 21 + CITIES.length);
  for (const e of entries) {
    assert.ok(e.url.startsWith("https://www.catalunyainfo.com/es/festivos/2027/"), e.url);
    assert.equal(e.alternates?.languages?.es, e.url);
  }
  const sitemap = readFileSync(join(ROOT, "src/app/sitemap.ts"), "utf8");
  assert.match(sitemap, /\.\.\.spainSitemapEntries\(\)/);
  const publish = readFileSync(join(ROOT, "src/app/api/admin/publish/route.ts"), "utf8");
  assert.match(publish, /wants\("calendario-2027-espana"\) \? \[\.\.\.spainPaths\(\), \.\.\.editionPaths\(\)\] : \[\]/);
  assert.match(publish, /for \(const path of codePaths\) revalidate\(path\.replace/);
  assert.match(publish, /\.\.\.codePaths\]\)/, "IndexNow gets them too");
  // The guide that links to the hub goes out on its own group.
  assert.match(publish, /wants\("calendario-2027-espana-links"\)\) published\.push\(await publishHolidayGuide\(\)\)/);
  // The parent /es/festivos hub keeps dynamicParams = false: nothing here may revalidate it.
  for (const p of spainPaths()) assert.ok(p.replace(/\/$/, "") !== "/es/festivos", p);
});

test("links in: the Spanish town hub and the Catalan work calendar guide point at the Spain hub", () => {
  const hub = readFileSync(join(ROOT, "src/components/programmatic/holidays/HubPage.tsx"), "utf8");
  assert.match(hub, /spainHubPath\(\)/);
  const copy = readFileSync(join(ROOT, "src/lib/content/holidays/copy.ts"), "utf8");
  assert.ok(copy.includes(`](${spainHubPath()})`));
});
