import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { COMMON_DATES } from "../src/lib/programmatic/spain-2027/calendar.ts";
import { CITIES, SEARCHED_CITIES, cityBySlug, cityCalendar, cityLayers, cityReadOn, citiesOf, local2027, searchedCitiesOf } from "../src/lib/programmatic/spain-2027/cities.ts";
import { WAITING_RECHECK_BY } from "../src/lib/programmatic/spain-2027/cities-more.ts";
import { CITY_TITLES_FROM, cityAnswer, cityLayerLines, cityTitle } from "../src/lib/programmatic/spain-2027/city-copy.ts";
import { cityAnswerIntl, cityLayerLinesIntl } from "../src/lib/programmatic/spain-2027/city-copy-intl.ts";
import { TITLE_LIMIT, localStatusLine } from "../src/lib/programmatic/spain-2027/copy.ts";
import { localStatusLineIntl } from "../src/lib/programmatic/spain-2027/copy-intl.ts";
import { names } from "../src/lib/programmatic/spain-2027/communities.ts";
import { editionNames } from "../src/lib/programmatic/spain-2027/editions.ts";
import { PENDING_CHECKS, PENDING_READ_ON, SOURCES, latestReading } from "../src/lib/programmatic/spain-2027/sources.ts";
import { isLowDemandPath } from "../src/lib/seo/low-demand.ts";

/**
 * Calendario laboral 2027 push, 18 Nov 2026 (docs/SEO_EXPERIMENTS.md): the six
 * pending local lists read again, the city pages' layers block, the searched
 * titles from CITY_TITLES_FROM, the community pages' searched-cities line and
 * four more ca/en city pages kept in the index.
 */

const PENDING = ["AR", "VC", "CB", "CM", "MD", "NC"] as const;
const BULLETIN = { AR: "BOA", VC: "DOGV", CB: "BOC", CM: "DOCM", MD: "BOCM", NC: "BON" } as const;

test("pending lists: the six read again on PENDING_READ_ON, each with the last issue searched", () => {
  for (const r of PENDING) {
    const local = SOURCES[r].local;
    assert.equal(local.status, "pending", r);
    assert.ok(local.checked, r);
    assert.equal(local.checked, PENDING_CHECKS[r], r);
    assert.equal(local.checked!.date, PENDING_READ_ON, r);
    assert.match(local.checked!.through, new RegExp(`^${BULLETIN[r]} núm\\. \\d+, de 18\\.11\\.2026$`), r);
    assert.ok(local.y2026 && local.checked!.date > local.y2026.date, r);
  }
  // Only a pending list carries a check; every pending one does (Catalonia's DOGC order has its own engine).
  for (const [r, s] of Object.entries(SOURCES)) {
    if (s.local.checked) assert.equal(s.local.status, "pending", r);
    if (s.local.status === "pending" && r !== "CT") assert.ok(s.local.checked, r);
  }
  assert.ok(WAITING_RECHECK_BY > PENDING_READ_ON);
  assert.equal(latestReading(), PENDING_READ_ON);
});

test("status lines name the last issue searched (es, ca, en)", () => {
  for (const r of PENDING) {
    const through = PENDING_CHECKS[r].through;
    assert.ok(localStatusLine(names(r), SOURCES[r].local).includes(`consultado hasta el ${through}`), r);
    assert.ok(localStatusLineIntl(editionNames(r, "ca"), SOURCES[r].local, "ca").includes(`consultat fins al ${through}`), r);
    assert.ok(localStatusLineIntl(editionNames(r, "en"), SOURCES[r].local, "en").includes(`read up to ${through}`), r);
  }
});

test("pending cities: read on the day their bulletin was searched, and the answer says up to which issue", () => {
  const pending = CITIES.filter((c) => c.status2027 === "pending");
  assert.ok(pending.length >= 40);
  for (const c of pending) {
    const check = SOURCES[c.region].local.checked;
    assert.ok(check, c.slug);
    assert.equal(cityReadOn(c), PENDING_READ_ON, c.slug);
    assert.ok(cityAnswer(c).rest.includes(`(hasta el ${check!.through})`), c.slug);
    assert.ok(cityAnswerIntl(c, "ca").rest.includes(`(fins al ${check!.through})`), c.slug);
    assert.ok(cityAnswerIntl(c, "en").rest.includes(`(up to ${check!.through})`), c.slug);
  }
  // A published city keeps the day its own list was read.
  assert.notEqual(cityReadOn(cityBySlug("GA", "vigo")!), PENDING_READ_ON);
});

test("layers: every 2027 day of the city in exactly one layer, each layer with its source", () => {
  for (const c of CITIES) {
    const l = cityLayers(c);
    const dates = [...l.common, ...l.community].map((d) => d.date).concat(l.island ? [l.island.date] : [], l.local.map((d) => d.date));
    const calendar = cityCalendar(c).map((d) => d.date);
    assert.deepEqual([...dates].sort(), [...calendar].sort(), c.slug);
    assert.equal(l.common.length, COMMON_DATES.length, c.slug);
    for (const lines of [cityLayerLines(c), cityLayerLinesIntl(c, "ca"), cityLayerLinesIntl(c, "en")]) {
      assert.equal(lines[0]!.id, "common", c.slug);
      assert.match(lines[0]!.source, /BOE-A-2026-21254/, c.slug);
      const local = lines.find((x) => x.id === "local");
      assert.ok(local, c.slug);
      for (const x of lines) assert.ok(x.days.length > 0 && x.source.length > 0, `${c.slug} ${x.id}`);
      const list = local2027(c);
      // A council's days (status "council", cities-council.ts) name the act and the bulletin still to publish them.
      if (list && c.status2027 === "council") assert.ok(local!.source.includes(SOURCES[c.region].local.checked!.through), c.slug);
      else if (list) assert.equal(local!.source, list.source.ref, c.slug);
      else if (c.status2027 === "pending") assert.ok(local!.source.includes(SOURCES[c.region].local.checked!.through), c.slug);
    }
  }
  const vigo = cityLayerLines(cityBySlug("GA", "vigo")!);
  assert.equal(vigo.find((x) => x.id === "local")!.days.startsWith("lun 29 mar"), true, vigo.find((x) => x.id === "local")!.days);
  const alcobendas = cityLayerLines(cityBySlug("MD", "alcobendas")!).find((x) => x.id === "local")!;
  assert.equal(alcobendas.days, "pendientes de publicación en el BOCM");
  assert.equal(alcobendas.source, "consultado hasta el BOCM núm. 277, de 18.11.2026");
  // Navarra: the shared 3 December is known; the town's own day is pending.
  const pamplona = cityLayerLines(cityBySlug("NC", "pamplona")!).find((x) => x.id === "local")!;
  assert.match(pamplona.days, /^vie 3 dic \(San Francisco Javier.*\) y otra pendiente de publicación en el BON$/);
});

test("titles from CITY_TITLES_FROM: 'Festivos <Ciudad> 2027: calendario laboral…', unique, within the limit", () => {
  assert.equal(CITY_TITLES_FROM, "2026-12-02");
  const titles = new Set<string>();
  for (const c of CITIES) {
    const t = cityTitle(c, CITY_TITLES_FROM);
    assert.ok(t.length <= TITLE_LIMIT, `${t} (${t.length})`);
    assert.match(t, /^Festivos .+ 2027: /, t);
    titles.add(t);
    if (!local2027(c)) assert.match(t, /: calendario laboral$/, t);
    // Before the switch, the 6 Nov titles, unchanged up to the last day of the window.
    assert.equal(cityTitle(c, "2026-12-01"), cityTitle(c, "2026-11-18"), c.slug);
  }
  assert.equal(titles.size, CITIES.length, "no two cities share a title");
  assert.ok(CITIES.filter((c) => cityTitle(c, "2026-12-01") !== cityTitle(c, CITY_TITLES_FROM)).length > CITIES.length * 0.9);
  assert.equal(cityTitle(cityBySlug("GA", "vigo")!, CITY_TITLES_FROM), "Festivos Vigo 2027: calendario laboral, 29 mar y 16 ago");
  assert.equal(cityTitle(cityBySlug("MD", "alcobendas")!, CITY_TITLES_FROM), "Festivos Alcobendas 2027: calendario laboral");
  assert.equal(cityTitle(cityBySlug("CB", "torrelavega")!, CITY_TITLES_FROM), "Festivos Torrelavega 2027: calendario laboral");
});

test("community pages: the searched-cities line resolves every slug, most searched first", () => {
  for (const [region, slugs] of Object.entries(SEARCHED_CITIES)) {
    const cities = searchedCitiesOf(region as keyof typeof SOURCES);
    assert.deepEqual(
      cities.map((c) => c.slug),
      [...slugs!],
      region,
    );
    assert.ok(cities.length <= 6, region);
  }
  // Castilla-La Mancha had no city page with 50 impressions: its four most populous.
  assert.deepEqual(searchedCitiesOf("CM"), citiesOf("CM").slice(0, 4));
  const es = readFileSync(join(import.meta.dirname, "../src/components/programmatic/spain-2027/pages.tsx"), "utf8");
  const intl = readFileSync(join(import.meta.dirname, "../src/components/programmatic/spain-2027/pages-intl.tsx"), "utf8");
  assert.match(es, /\{weekend \? <p>\{weekend\}<\/p> : null\}\n\s+<SearchedCities c=\{c\} \/>/);
  assert.match(intl, /\{weekend \? <p>\{weekend\}<\/p> : null\}\n\s+<SearchedCities c=\{c\} locale=\{locale\} \/>/);
});

test("low-demand keep lists: the four ca/en city pages over the bar with their 2027 days are indexable", () => {
  for (const p of [
    "/en/holidays/2027/basque-country/san-sebastian/",
    "/en/holidays/2027/andalusia/torremolinos/",
    "/en/holidays/2027/extremadura/merida/",
    "/ca/festius/2027/illes-balears/sant-antoni-de-portmany/",
  ]) {
    assert.equal(isLowDemandPath(p, "2026-11-18"), false, p);
  }
  // Over the bar but without 2027 local days yet: held.
  for (const p of ["/en/holidays/2027/navarre/pamplona/", "/en/holidays/2027/valencian-community/benidorm/", "/en/holidays/2027/castile-and-leon/burgos/"]) {
    assert.equal(isLowDemandPath(p, "2026-11-18"), true, p);
  }
});
