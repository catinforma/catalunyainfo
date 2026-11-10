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

test("Murcia lists its 45 municipalities, Madrid's December days are in its table", () => {
  const mc = regionBySlug("murcia")!;
  assert.equal(mc.townDays?.length, 45);
  const murcia = mc.townDays!.find((t) => t.town === "Murcia")!;
  assert.deepEqual(murcia.local, ["2026-09-15", "2027-03-30"]);
  const rows = daysOffRows(regionBySlug("madrid")!).map((r) => r.date);
  assert.ok(rows.includes("2026-12-07") && rows.includes("2026-12-08"));
});
