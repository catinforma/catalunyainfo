import assert from "node:assert/strict";
import { test } from "node:test";

import { bodySchema } from "../src/lib/content/blocks.ts";
import { DAY_DEPENDENT_BLOCKS } from "../src/lib/content/day-dependent.ts";
import { todayInCatalonia, weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { IMAGES } from "../src/lib/content/images.ts";
import { buildHubBody, buildRegionBody, daysOffRows, regionTitle } from "../src/lib/content/school-spain/body.ts";
import {
  SPAIN_SCHOOL_EXPIRES,
  SPAIN_TITLE_MAX,
  liveHubDescription,
  liveHubTitle,
  liveRegionDescription,
  liveRegionTitle,
  mainLevels,
  nextSchoolDay,
  schoolDayIn,
  variesByProvince,
} from "../src/lib/content/school-spain/logic.ts";
import { liveSpainSchoolTitle, spainSchoolRegionOf } from "../src/lib/content/school-spain/live.ts";
import {
  CATALONIA,
  HUB_PATH,
  SPAIN_REGIONS,
  hubRegions,
  isRegionSchoolPage,
  pendingRegions,
  regionBySlug,
  regionPath,
} from "../src/lib/content/school-spain/regions.ts";
import { COMMUNITIES } from "../src/lib/programmatic/spain-2027/communities.ts";
import { buildBody as buildCatalanBody } from "../src/lib/content/school/publish.ts";

/**
 * The Spanish school calendars 2026-2027 (school-spain/). Every date below
 * was read in the community's own order or resolution on 6 Nov 2026; the
 * fact pack (research_notes/x10/calendario-escolar-espana-2026-27.md) quotes
 * the sentence. A failing pin means the data moved away from the text.
 */

test("the 2026-2027 calendars still answer for today, or the build fails", () => {
  assert.ok(
    todayInCatalonia() < SPAIN_SCHOOL_EXPIRES,
    "From 1 Jul 2027 the pages answer for a school year that is over: read the 2027-2028 orders (published April-July 2027) and replace data.ts",
  );
});

/** One known date per community, as its text gives it: first day of infant/primary and first day of Christmas without class. */
const PINS: Record<string, { start: string; christmasFrom: string; christmasBack: string; easterFrom: string }> = {
  andalucia: { start: "2026-09-10", christmasFrom: "2026-12-24", christmasBack: "2027-01-07", easterFrom: "2027-03-22" },
  aragon: { start: "2026-09-08", christmasFrom: "2026-12-23", christmasBack: "2027-01-07", easterFrom: "2027-03-25" },
  asturias: { start: "2026-09-09", christmasFrom: "2026-12-23", christmasBack: "2027-01-11", easterFrom: "2027-03-22" },
  baleares: { start: "2026-09-10", christmasFrom: "2026-12-23", christmasBack: "2027-01-07", easterFrom: "2027-03-25" },
  canarias: { start: "2026-09-09", christmasFrom: "2026-12-23", christmasBack: "2027-01-11", easterFrom: "2027-03-22" },
  cantabria: { start: "2026-09-08", christmasFrom: "2026-12-23", christmasBack: "2027-01-11", easterFrom: "2027-03-22" },
  "castilla-la-mancha": { start: "2026-09-08", christmasFrom: "2026-12-23", christmasBack: "2027-01-11", easterFrom: "2027-03-22" },
  "castilla-y-leon": { start: "2026-09-09", christmasFrom: "2026-12-23", christmasBack: "2027-01-11", easterFrom: "2027-03-20" },
  ceuta: { start: "2026-09-08", christmasFrom: "2026-12-23", christmasBack: "2027-01-11", easterFrom: "2027-03-22" },
  "comunidad-valenciana": { start: "2026-09-09", christmasFrom: "2026-12-22", christmasBack: "2027-01-07", easterFrom: "2027-03-25" },
  extremadura: { start: "2026-09-10", christmasFrom: "2026-12-23", christmasBack: "2027-01-08", easterFrom: "2027-03-22" },
  galicia: { start: "2026-09-09", christmasFrom: "2026-12-22", christmasBack: "2027-01-08", easterFrom: "2027-03-22" },
  madrid: { start: "2026-09-07", christmasFrom: "2026-12-23", christmasBack: "2027-01-11", easterFrom: "2027-03-19" },
  melilla: { start: "2026-09-09", christmasFrom: "2026-12-23", christmasBack: "2027-01-11", easterFrom: "2027-03-22" },
  murcia: { start: "2026-09-08", christmasFrom: "2026-12-23", christmasBack: "2027-01-07", easterFrom: "2027-03-22" },
  navarra: { start: "2026-09-04", christmasFrom: "2026-12-23", christmasBack: "2027-01-11", easterFrom: "2027-03-25" },
  "pais-vasco": { start: "2026-09-07", christmasFrom: "2026-12-24", christmasBack: "2027-01-07", easterFrom: "2027-03-25" },
  "la-rioja": { start: "2026-09-09", christmasFrom: "2026-12-23", christmasBack: "2027-01-07", easterFrom: "2027-03-25" },
};

test("each community keeps the dates its order gives (pinned)", () => {
  assert.deepEqual(SPAIN_REGIONS.map((r) => r.slug).sort(), Object.keys(PINS).sort(), "a community was added or dropped: pin it");
  for (const r of SPAIN_REGIONS) {
    const pin = PINS[r.slug]!;
    assert.equal(mainLevels(r).start, pin.start, `${r.slug} start`);
    assert.equal(r.christmas.from, pin.christmasFrom, `${r.slug} Christmas`);
    assert.equal(nextSchoolDay(r, r.christmas.to), pin.christmasBack, `${r.slug} back after Christmas`);
    assert.equal(r.easter.from, pin.easterFrom, `${r.slug} Easter`);
  }
});

test("no community is invented: the ones without a readable 2026-2027 text are 'por confirmar'", () => {
  const pending = pendingRegions().map((p) => p.slug);
  // La Rioja added 8 Nov 2026 (BOR núm. 71, read via ChatGPT dossier + the full BOR copy of 6 Nov; dates agree).
  assert.deepEqual(pending, []);
  assert.ok(regionBySlug("la-rioja"));
  assert.deepEqual(regionBySlug("andalucia")?.pendingProvinces, ["Jaén"]);
  assert.match(JSON.stringify(buildRegionBody(regionBySlug("andalucia")!)), /Jaén","por confirmar"/);
});

/** The bulletins' and the education departments' own hosts. */
const OFFICIAL_HOSTS = [
  "juntadeandalucia.es",
  "boa.aragon.es",
  "larioja.org",
  "asturias.es",
  "caib.es",
  "gobiernodecanarias.org",
  "boc.cantabria.es",
  "docm.jccm.es",
  "educacion.castillalamancha.es",
  "bocyl.jcyl.es",
  "educacionfpydeportes.gob.es",
  "dogv.gva.es",
  "doe.juntaex.es",
  "xunta.gal",
  "bocm.es",
  "borm.es",
  "bon.navarra.es",
  "euskadi.eus",
];

test("dates are coherent and every source is an official https link", () => {
  for (const r of SPAIN_REGIONS) {
    const { start, end } = mainLevels(r);
    assert.ok(start < r.christmas.from && r.christmas.from <= r.christmas.to, r.slug);
    assert.ok(r.christmas.to < r.easter.from && r.easter.from <= r.easter.to && r.easter.to < end, r.slug);
    // Good Friday 2027 (26 March) is inside every Easter break; 1 January inside every Christmas.
    assert.ok(r.easter.from <= "2027-03-26" && r.easter.to >= "2027-03-26", `${r.slug} Easter`);
    assert.ok(r.christmas.from <= "2027-01-01" && r.christmas.to >= "2027-01-01", `${r.slug} Christmas`);
    for (const b of r.otherBreaks) assert.ok(b.from > start && b.to < end && b.from <= b.to, `${r.slug} ${b.name}`);
    for (const l of r.levels) {
      if (l.start && !l.startText) assert.ok(weekdayIndex(l.start) >= 1 && weekdayIndex(l.start) <= 5, `${r.slug} ${l.levels} starts on a weekend`);
    }
    assert.ok(OFFICIAL_HOSTS.some((host) => new URL(r.order.url).hostname.endsWith(host)), `${r.slug} source: ${r.order.url}`);
    for (const p of r.provinces ?? []) assert.ok(OFFICIAL_HOSTS.some((host) => new URL(p.order.url).hostname.endsWith(host)), `${r.slug} ${p.name}`);
    assert.ok(r.order.url.startsWith("https://"), r.slug);
    assert.equal(r.verifiedAt, "2026-11-06");
  }
});

test("slugs are the 2027 work calendar's, and no page collides with Catalonia's own", () => {
  const slugs = new Set(COMMUNITIES.map((c) => c.slug));
  for (const r of SPAIN_REGIONS) assert.ok(slugs.has(r.slug), r.slug);
  assert.ok(!SPAIN_REGIONS.some((r) => r.slug === CATALONIA.slug));
  assert.equal(regionPath(CATALONIA.slug), "guias/calendario-escolar-cataluna");
  assert.equal(HUB_PATH, "guias/calendario-escolar-espana");
  assert.ok(isRegionSchoolPage("guias/calendario-escolar-madrid"));
  assert.ok(!isRegionSchoolPage(HUB_PATH) && !isRegionSchoolPage("guias/calendario-escolar-cataluna"));
  assert.equal(hubRegions().length, SPAIN_REGIONS.length + 1);
});

test("what a day is: the December long weekend, glued non-teaching days, provinces", () => {
  const md = regionBySlug("madrid")!;
  assert.equal(schoolDayIn(md, "2026-12-07").kind, "holiday");
  assert.equal(schoolDayIn(md, "2027-01-08").kind, "christmas");
  assert.equal(schoolDayIn(md, "2027-02-12").kind, "break");
  assert.equal(schoolDayIn(regionBySlug("galicia")!, "2026-12-07").kind, "nonTeaching");
  assert.equal(schoolDayIn(regionBySlug("baleares")!, "2026-12-07").kind, "school");
  assert.equal(schoolDayIn(regionBySlug("comunidad-valenciana")!, "2027-03-19").kind, "holiday");
  // Aragón's provincial days are not the whole community's.
  assert.equal(schoolDayIn(regionBySlug("aragon")!, "2027-02-18").kind, "school");
  const an = regionBySlug("andalucia")!;
  assert.ok(variesByProvince(an, "2026-12-23"), "Sevilla has class on 23 December, the others do not");
  assert.ok(variesByProvince(an, "2027-01-08"));
  assert.ok(!variesByProvince(an, "2026-12-28"));
});

test("titles answer first, name the break people search for, and fit", () => {
  assert.equal(liveRegionTitle(regionBySlug("madrid")!, "2026-11-06"), "Vacaciones de Navidad 2026 en Madrid: del 23 de diciembre al 8 de enero");
  assert.match(liveRegionTitle(regionBySlug("madrid")!, "2027-01-20"), /^Vacaciones de Semana Santa 2027 en Madrid: del 19 al 29 de marzo$/);
  assert.match(liveRegionTitle(regionBySlug("madrid")!, "2027-05-10"), /^Fin de curso 2027 en Madrid: .*18 de junio$/);
  // Cantabria's Easter ends on Friday 26; over the weekend the title still says when school is back.
  assert.match(liveRegionTitle(regionBySlug("cantabria")!, "2027-03-27"), /^Semana Santa en Cantabria: .*29 de marzo$/);
  assert.match(liveRegionTitle(regionBySlug("andalucia")!, "2026-11-06"), /provincia/);
  assert.match(liveRegionTitle(regionBySlug("pais-vasco")!, "2026-11-06"), /mínimo/);
  assert.match(liveHubTitle(hubRegions(), "2026-11-06"), /^Vacaciones de Navidad 2026/);
  assert.match(liveHubTitle(hubRegions(), "2027-02-01"), /^Semana Santa 2027/);
  for (const r of SPAIN_REGIONS) {
    for (const day of ["2026-11-06", "2026-12-28", "2027-02-01", "2027-03-27", "2027-05-10", "2027-06-29"]) {
      const title = liveRegionTitle(r, day);
      assert.ok(title.length <= SPAIN_TITLE_MAX, `${r.slug} ${day}: ${title}`);
      assert.ok(title.includes(r.short), `${r.slug} ${day}: ${title}`);
    }
    assert.ok(liveRegionDescription(r, "2026-11-06").length <= 158, r.slug);
    assert.match(regionTitle(r), /^Calendario escolar 2026-2027 de.*: vacaciones de Navidad, Semana Santa y fin de curso$/);
  }
  assert.equal(liveSpainSchoolTitle("cataluna", "2026-11-06"), null, "Catalonia keeps its own page's live title");
});

test("every body validates, puts the live block first and links the hub and the 2027 work calendar", () => {
  assert.ok(DAY_DEPENDENT_BLOCKS.includes("spainSchoolCalendar"));
  assert.ok(IMAGES.some((image) => image.key === "calendario-escolar-espana-ceip-ayora"));
  for (const r of SPAIN_REGIONS) {
    const body = buildRegionBody(r);
    bodySchema.parse(body);
    assert.equal(spainSchoolRegionOf(body), r.slug);
    const block = body.findIndex((b) => b.type === "spainSchoolCalendar");
    const heading = body.findIndex((b) => b.type === "heading");
    assert.ok(block >= 0 && block < heading, r.slug);
    const text = JSON.stringify(body);
    assert.ok(text.includes("(/es/guias/calendario-escolar-espana/)"), r.slug);
    assert.ok(text.includes(`(/es/festivos/2027/${r.slug}/)`), r.slug);
    assert.ok(text.includes(r.order.url), r.slug);
    assert.ok(body.some((b) => b.type === "faq"), r.slug);
  }
  const hub = buildHubBody();
  bodySchema.parse(hub);
  assert.equal(spainSchoolRegionOf(hub), "espana");
  const text = JSON.stringify(hub);
  for (const r of SPAIN_REGIONS) assert.ok(text.includes(`(/es/${regionPath(r.slug)}/)`), r.slug);
  assert.ok(text.includes("(/es/guias/calendario-escolar-cataluna/)"));
});

test("Christmas answered first: each community's lead, the hub's table with one source per row, the hub's description", () => {
  // Community lead: "Vacaciones de Navidad 2026-27 en ...: del ... al ... (vuelta a clase el ...)".
  for (const r of SPAIN_REGIONS) {
    const body = buildRegionBody(r);
    const lead = (body[0] as { text: string }).text;
    assert.match(lead, /^\*\*Vacaciones de Navidad 2026-27 /, r.slug);
    assert.match(lead, /[Vv]uelta a clase/, r.slug);
    // The hub link sits right under the Christmas section, before Easter.
    const hubLink = body.findIndex((b) => b.type === "paragraph" && JSON.stringify(b).includes("(/es/guias/calendario-escolar-espana/)"));
    const easter = body.findIndex((b) => b.type === "heading" && /Semana Santa/.test((b as { text: string }).text));
    assert.ok(hubLink > 0 && hubLink < easter, r.slug);
  }
  const madrid = (buildRegionBody(regionBySlug("madrid")!)[0] as { text: string }).text;
  assert.ok(madrid.includes("del miércoles 23 de diciembre de 2026 al viernes 8 de enero de 2027 (vuelta a clase el lunes 11 de enero)"));
  assert.ok(madrid.includes("El último día de clase es el martes 22 de diciembre."));
  const andalucia = (buildRegionBody(regionBySlug("andalucia")!)[0] as { text: string }).text;
  assert.ok(andalucia.includes("el jueves 7 de enero en Almería, Granada y Málaga; el viernes 8 de enero en Córdoba y Huelva; el lunes 11 de enero en Cádiz y Sevilla"));
  assert.ok(andalucia.includes("Jaén: por confirmar."));

  // Hub: one row per community, Catalonia included, each with its official text.
  const hub = buildHubBody();
  const table = hub.find((b) => b.type === "table") as { headers: string[]; rows: string[][] };
  assert.deepEqual(table.headers, ["Comunidad", "Último día de clase", "Primer día sin clase", "Vuelta a clase", "Fuente"]);
  assert.equal(table.rows.length, hubRegions().length + pendingRegions().length);
  for (const row of table.rows) assert.match(row[4]!, /\]\(https:\/\//, row[0]);
  const row = (slug: string) => table.rows.find((r) => r[0]!.includes(`/${slug}/`))!;
  assert.deepEqual(row("calendario-escolar-madrid").slice(1, 4), ["martes 22 de diciembre", "miércoles 23 de diciembre", "lunes 11 de enero"]);
  assert.deepEqual(row("calendario-escolar-cataluna").slice(1, 4), ["lunes 21 de diciembre", "martes 22 de diciembre", "viernes 8 de enero"]);
  assert.equal(row("calendario-escolar-andalucia")[3], "7, 8 u 11 de enero (según la provincia)");
  // Castilla-La Mancha's Christmas is the regional order's, not the provinces'.
  assert.ok(row("calendario-escolar-castilla-la-mancha")[4]!.includes(regionBySlug("castilla-la-mancha")!.order.url));
  assert.match((hub[0] as { text: string }).text, /^\*\*Vacaciones de Navidad 2026 en los colegios: en la mayoría de comunidades el último día de clase es el martes 22 de diciembre, y se vuelve a clase entre el 7 y el 11 de enero\.\*\*/);

  // Description: the answer until the last community is back, then the calendar again.
  assert.equal(
    liveHubDescription(hubRegions(), "2026-11-13"),
    "Vacaciones de Navidad 2026 en los colegios: último día de clase el 21, 22 o 23 de diciembre, según la comunidad, y vuelta entre el 7 y el 11 de enero.",
  );
  assert.match(liveHubDescription(hubRegions(), "2027-01-11"), /^Calendario escolar 2026-2027/);
  for (const locale of ["ca", "en"] as const) {
    const d = liveHubDescription(hubRegions(locale), "2026-11-13");
    assert.ok(d.length > 0 && d.length <= 158 && /2026/.test(d), `${locale}: ${d}`);
  }
});

test("Catalonia's guide hands the Spain-wide Christmas question to the hub from its Christmas box, in each language", () => {
  const hubs = { ca: "/ca/guies/calendari-escolar-espanya/", es: "/es/guias/calendario-escolar-espana/", en: "/en/guides/spain-school-calendar/" } as const;
  for (const locale of ["ca", "es", "en"] as const) {
    const callout = buildCatalanBody(locale).find((b) => b.type === "callout") as { text: string } | undefined;
    // The line is for the 2026-2027 year only; from summer 2027 the guide shows the next year without it.
    if (todayInCatalonia() >= "2027-07-01") continue;
    assert.ok(callout?.text.includes(`(${hubs[locale]})`), locale);
    assert.match(callout!.text, /21, 22 (o|or) 23/, locale);
  }
});

test("Murcia lists its 45 municipalities, Madrid's December days are in its table", () => {
  const mc = regionBySlug("murcia")!;
  assert.equal(mc.townDays?.length, 45);
  const murcia = mc.townDays!.find((t) => t.town === "Murcia")!;
  assert.deepEqual(murcia.local, ["2026-09-15", "2027-03-30"]);
  const rows = daysOffRows(regionBySlug("madrid")!).map((r) => r.date);
  assert.ok(rows.includes("2026-12-07") && rows.includes("2026-12-08"));
});
