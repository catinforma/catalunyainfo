import assert from "node:assert/strict";
import { test } from "node:test";

process.env.VERCEL_ENV = "production";
process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";

/**
 * Calendario laboral 2027, 18 Nov 2026 (docs/SEO_EXPERIMENTS.md): 20,000+
 * towns whose community has not published its 2027 local list, with a page
 * because the council's own minutes fix both days (cities-council.ts). Every
 * town cites the council's act, on the council's own site, with its date; the
 * page says the days are pending the bulletin; the counting tools leave them
 * out until it publishes them.
 */

type Region = import("../src/lib/programmatic/holidays/boe-2027.ts").Region;
const { COUNCIL_CITY_ROWS, COUNCIL_READ_ON } = await import("../src/lib/programmatic/spain-2027/cities-council.ts");
const { CITY_ROWS, CORE_CITY_ROWS } = await import("../src/lib/programmatic/spain-2027/cities-data.ts");
const { MORE_CITY_ROWS, MORE_MIN_POPULATION, WAITING_TOWNS } = await import("../src/lib/programmatic/spain-2027/cities-more.ts");
const { CITIES, bulletinLocal2027, cityBySlug, cityCalendar, councilAct, local2027, localDays, nonLocalDates, officialCalendar } = await import(
  "../src/lib/programmatic/spain-2027/cities.ts"
);
const { cityAnswer, cityDescription, cityFaq, cityLayerLines, cityLead, cityListLine, cityTitle, CITY_TITLES_FROM } = await import("../src/lib/programmatic/spain-2027/city-copy.ts");
const { cityAnswerIntl, cityLayerLinesIntl, cityLeadIntl } = await import("../src/lib/programmatic/spain-2027/city-copy-intl.ts");
const { cityPath, spainSitemapEntries } = await import("../src/lib/programmatic/spain-2027/paths.ts");
const { editionCityPath, editionSitemapEntries } = await import("../src/lib/programmatic/spain-2027/editions.ts");
const { PENDING_CHECKS, PENDING_READ_ON, SOURCES } = await import("../src/lib/programmatic/spain-2027/sources.ts");
const { isLowDemandPath } = await import("../src/lib/seo/low-demand.ts");
const { itemHolidays, plannerData, plannerPlace, unpack } = await import("../src/lib/programmatic/leave-2027/places.ts");
const { cityExtra } = await import("../src/lib/programmatic/working-days/places.ts");
const { cityFeed } = await import("../src/lib/programmatic/ics/feeds.ts");
const { embedModel } = await import("../src/lib/programmatic/embed-2027/render.ts");

/** The council's own site (or the video-acta platform its site links to) for each town: never a newspaper or an aggregator. */
// The 10 Valencian towns of 18 Nov 2026 moved to cities-more.ts on 20 Nov, when their provincial BOPs listed them.
const COUNCIL_HOSTS: Record<string, string> = {
  "13071": "www.puertollano.es",
};

const PROVINCE_REGION: Record<string, Region> = { "02": "CM", "03": "VC", "12": "VC", "13": "CM", "16": "CM", "19": "CM", "22": "AR", "28": "MD", "31": "NC", "39": "CB", "44": "AR", "45": "CM", "46": "VC", "50": "AR" };

const towns = COUNCIL_CITY_ROWS.map((r) => cityBySlug(r.region, r.slug)!);

test("council towns: each cites the council's own act, with its date, read on COUNCIL_READ_ON", () => {
  assert.ok(COUNCIL_CITY_ROWS.length >= 1, `${COUNCIL_CITY_ROWS.length} towns`);
  assert.ok(COUNCIL_READ_ON <= PENDING_READ_ON, "the acts were read no later than the last bulletin search");
  for (const r of COUNCIL_CITY_ROWS) {
    assert.equal(r.status2027, "council", r.slug);
    assert.equal(r.readOn, COUNCIL_READ_ON, r.slug);
    assert.equal(r.local2026, null, `${r.slug}: no 2026 days on a new town's page`);
    const list = r.local2027!;
    assert.ok(list && list.year === 2027, r.slug);
    // The act: who adopted it and when, before the day it was read.
    assert.ok(list.act, `${r.slug}: no act`);
    assert.ok(["pleno", "junta", "decreto"].includes(list.act.kind), r.slug);
    assert.match(list.act.date, /^2026-\d\d-\d\d$/, r.slug);
    assert.ok(list.act.date <= COUNCIL_READ_ON, `${r.slug}: act after the reading`);
    // The document: dated, on the council's own site, named as minutes of that session.
    assert.equal(list.source.date, list.act.date, r.slug);
    assert.match(list.source.url, /^https:\/\//, r.slug);
    assert.equal(new URL(list.source.url).hostname, COUNCIL_HOSTS[r.ine], `${r.slug}: not the council's own site`);
    assert.match(list.source.title, /^(Acta|Borrador del acta|Esborrany de l'acta)\b/, `${r.slug}: the minutes of the session`);
    assert.match(list.source.ref, new RegExp(`^acta del Pleno de .+ de \\d{1,2}\\.\\d{1,2}\\.2026, pp?\\. \\d`), r.slug);
    const [y, m, d] = list.act.date.split("-");
    assert.ok(list.source.ref.includes(`${Number(d)}.${Number(m)}.${y}`), `${r.slug}: ref and act date differ`);
  }
  assert.equal(Object.keys(COUNCIL_HOSTS).length, COUNCIL_CITY_ROWS.length, "one host per town, none left over");
});

test("council towns: only while their community's list is pending; the day it is out, transcribe them from the bulletin", () => {
  for (const r of COUNCIL_CITY_ROWS) {
    const s = SOURCES[r.region].local;
    // Fails the day the community publishes: move the town to cities-more.ts with the bulletin's days.
    assert.equal(s.status, "pending", `${r.region} published its 2027 list: transcribe ${r.slug} from it (cities-more.ts)`);
    assert.ok(s.checked, r.slug);
    assert.equal(s.checked, PENDING_CHECKS[r.region as keyof typeof PENDING_CHECKS], r.slug);
  }
});

test("council towns: 20,000+ inhabitants, in scope, never twice, out of the waiting list", () => {
  const codes = [...CITY_ROWS, ...WAITING_TOWNS].map((r) => r.ine);
  assert.equal(new Set(codes).size, codes.length, "no municipality twice");
  for (const r of COUNCIL_CITY_ROWS) {
    assert.match(r.ine, /^\d{5}$/);
    assert.equal(PROVINCE_REGION[r.ine.slice(0, 2)], r.region, `${r.ine} is not in ${r.region}`);
    assert.ok(r.population >= MORE_MIN_POPULATION && r.population < 50_000, `${r.slug}: ${r.population}`);
    assert.equal(r.capital, false, r.slug);
    assert.ok(r.ineTable >= 2854 && r.ineTable <= 2909, r.slug);
    assert.match(r.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, r.slug);
    assert.ok(!WAITING_TOWNS.some((t) => t.ine === r.ine), `${r.slug}: still waiting`);
    assert.ok(![...CORE_CITY_ROWS, ...MORE_CITY_ROWS].some((x) => x.ine === r.ine), `${r.slug}: already a row`);
  }
});

test("council towns: two different 2027 days, none already a holiday of the community, printed weekdays right", () => {
  const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  for (const c of towns) {
    const days = localDays(c);
    assert.equal(days.length, 2, c.slug);
    assert.equal(new Set(days.map((d) => d.date)).size, 2, c.slug);
    const boe = new Set(nonLocalDates(c));
    for (const d of days) {
      assert.match(d.date, /^2027-\d\d-\d\d$/, c.slug);
      assert.ok(!boe.has(d.date), `${c.slug}: ${d.date} is already a holiday of ${c.region}`);
      assert.ok(d.name && d.name.length > 2, `${c.slug}: the act names each day`);
      if (d.printedWeekday) assert.equal(WEEKDAYS[new Date(`${d.date}T12:00:00Z`).getUTCDay()], d.printedWeekday, `${c.slug}: ${d.date}`);
    }
  }
  // Transcribed by hand from the minutes.
  const pair = (region: Region, slug: string) => localDays(cityBySlug(region, slug)!).map((d) => [d.date, d.name]);
  assert.deepEqual(pair("CM", "puertollano"), [["2027-05-13", "Santo Voto"], ["2027-09-08", "Virgen de Gracia"]]);
});

test("council towns: the page prints the days as the council's, pending the bulletin (es, ca, en)", () => {
  for (const c of towns) {
    const k = councilAct(c)!;
    assert.ok(k, c.slug);
    const through = k.check!.through;
    const answer = cityAnswer(c);
    assert.match(answer.strong, /^Fiestas locales de .+ en 2027: el /, c.slug);
    assert.match(answer.rest, /Las aprobó el Pleno del Ayuntamiento el \d{1,2} de [a-z]+ de 2026; falta que las publique (el|la) /, c.slug);
    assert.ok(answer.rest.includes(`(consultado hasta el ${through})`), c.slug);
    assert.ok(cityLead(c).includes("falta que las publique"), c.slug);
    assert.match(cityDescription(c), /\(aprobadas por el Ayuntamiento\)/, c.slug);
    assert.match(cityListLine(c), /\(aprobadas por el Ayuntamiento\)$/, c.slug);
    assert.ok(!/Las publica el/.test(`${answer.rest} ${cityLead(c)}`), `${c.slug}: a council act is not a bulletin`);
    const faq = cityFaq(c);
    assert.ok(faq[0]!.answer.includes(c.local2027!.source.title), c.slug);
    const local = cityLayerLines(c).find((x) => x.id === "local")!;
    assert.match(local.source, /^acuerdo del Pleno del Ayuntamiento de \d{1,2}\.\d{1,2}\.2026, pendiente de publicación en el /, c.slug);
    assert.ok(local.source.includes(through), c.slug);
    for (const locale of ["ca", "en"] as const) {
      const rest = cityAnswerIntl(c, locale).rest;
      assert.ok(rest.includes(locale === "ca" ? `(consultat fins al ${through})` : `(read up to ${through})`), `${locale} ${c.slug}`);
      assert.ok(!/Les publica el|Published in the/.test(`${rest} ${cityLeadIntl(c, locale)}`), `${locale} ${c.slug}`);
      assert.ok(cityLayerLinesIntl(c, locale).find((x) => x.id === "local")!.source.includes(through), `${locale} ${c.slug}`);
    }
    // Titles: the same rule as every city page, the two days in it once CITY_TITLES_FROM comes.
    assert.match(cityTitle(c, CITY_TITLES_FROM), /^Festivos .+ 2027: /, c.slug);
  }
});

test("council towns: the .ics feed, the widget and the working-days calculator count only the bulletin's days; the planner on a tick", () => {
  const data = plannerData("es");
  for (const c of towns) {
    const own = localDays(c).map((d) => d.date);
    assert.equal(bulletinLocal2027(c), null, c.slug);
    assert.ok(local2027(c), c.slug);
    assert.deepEqual(
      officialCalendar(c).map((d) => d.date),
      cityCalendar(c)
        .filter((d) => d.kind !== "local")
        .map((d) => d.date),
      c.slug,
    );
    for (const locale of ["ca", "es", "en"] as const) {
      const feed = cityFeed(locale, c);
      assert.deepEqual(feed.calendar.events.filter((e) => e.scope === "local"), [], `${locale} ${c.slug}`);
      assert.equal(feed.localPending, true, c.slug);
      assert.deepEqual(embedModel(locale, { kind: "city", c }).rows.filter((r) => r.local), [], `${locale} ${c.slug}`);
    }
    const wd = cityExtra(c);
    assert.equal(wd.local2027, false, c.slug);
    for (const d of own) assert.ok(!wd.dates.includes(d), `${c.slug}: working days count ${d}`);
    const item = plannerPlace(data, `${c.community.slug}/${c.slug}`)!.item;
    assert.equal(item[6], "k", c.slug);
    assert.deepEqual(unpack(item[5]), own, c.slug);
    for (const d of own) {
      assert.ok(!itemHolidays(data, item).includes(d), `${c.slug}: counted by default`);
      assert.ok(itemHolidays(data, item, true).includes(d), `${c.slug}: not counted when ticked`);
    }
  }
});

test("council towns: in the sitemap; indexable in Spanish, ca/en under the family's noindex rules", () => {
  const es = new Set(spainSitemapEntries().map((e) => e.url));
  const intl = new Set(editionSitemapEntries().map((e) => e.url));
  for (const c of towns) {
    const p = cityPath(c);
    assert.equal(p, `/es/festivos/2027/${c.community.slug}/${c.slug}/`);
    assert.ok(es.has(`https://www.catalunyainfo.com${p}`), p);
    assert.equal(isLowDemandPath(p, COUNCIL_READ_ON), false, `${p}: noindex`);
    for (const l of ["ca", "en"] as const) {
      const q = editionCityPath(l, c);
      // spain-2027-ca / spain-2027-en: noindex until a page clears the bar (low-demand.ts).
      assert.equal(isLowDemandPath(q, COUNCIL_READ_ON), true, `${q}: indexable`);
      assert.ok(intl.has(`https://www.catalunyainfo.com${q}`), `${q}: no edition entry (with hreflang)`);
    }
  }
  // The core cities with a council act (cities-data.ts `councilCity`) are held in tests/spain-2027-laboral-20nov.test.ts.
  assert.equal(CITIES.filter((c) => c.status2027 === "council" && c.population < 50_000).length, COUNCIL_CITY_ROWS.length);
});
