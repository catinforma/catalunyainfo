import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { SITGES as FESTIVAL } from "../src/lib/content/features/sitges.ts";
import { TRAINS } from "../src/lib/content/features/trains.ts";
import { SITGES as TRAIN_GUIDE } from "../src/lib/content/batch02/coast-trips.ts";
import { b2href } from "../src/lib/content/batch02/shared.ts";
import { href as featureHref } from "../src/lib/content/features/shared.ts";
import { sitgesCarnivalHref, sitgesHolidaysHref, sitgesNextLinks, sitgesR2Href } from "../src/lib/content/sitges-links.ts";
import { DAY_PAGES } from "../src/lib/programmatic/spain-2027/days.ts";
import { indexableDayPages, spainDayPath } from "../src/lib/programmatic/spain-2027/paths.ts";
import { isLowDemandPath } from "../src/lib/seo/low-demand.ts";

/**
 * 25 Nov 2026 internal-link audit, follow-up (docs/SEO_EXPERIMENTS.md): the
 * "Dia a dia / Día a día / Day by day" row on the 2027 hubs and the Catalonia
 * pages, and hand-picked links around the two Sitges guides. Both only ever
 * link pages Google keeps.
 */

const ROOT = join(import.meta.dirname, "..");
const LOCALES = ["ca", "es", "en"] as const;
// Fixed date: the low-demand list is date-driven for date pages (14 days after the date).
const TODAY = "2026-11-25";

test("the day row links exactly the indexable day pages of the language", () => {
  assert.deepEqual(indexableDayPages("ca", TODAY).map((iso) => spainDayPath(iso, "ca")), ["/ca/festius/2027/dia/29-marc/"]);
  assert.deepEqual(indexableDayPages("en", TODAY).map((iso) => spainDayPath(iso, "en")), ["/en/holidays/2027/day/8-september/"]);
  for (const l of LOCALES) {
    for (const iso of indexableDayPages(l, TODAY)) assert.equal(isLowDemandPath(spainDayPath(iso, l), TODAY), false, `${l} ${iso}`);
    // Nothing indexable is left out, nothing noindex is let in.
    const expected = DAY_PAGES.filter((iso) => !isLowDemandPath(spainDayPath(iso, l), TODAY));
    assert.deepEqual(indexableDayPages(l, TODAY), expected);
  }
  // The Spanish hub already lists every day (SpainDayIndex): all of them are indexable.
  assert.equal(indexableDayPages("es", TODAY).length, DAY_PAGES.length);
});

test("a date page that has passed its grace period drops out of the row", () => {
  assert.deepEqual(indexableDayPages("ca", "2027-04-20"), []);
  assert.deepEqual(indexableDayPages("en", "2027-09-30"), []);
});

test("the hubs and the Catalonia page render the row after the month table; the Spanish hub keeps its full list", () => {
  const intl = readFileSync(join(ROOT, "src/components/programmatic/spain-2027/pages-intl.tsx"), "utf8");
  const row = intl.lastIndexOf("<DayByDayRow locale={locale} />");
  assert.ok(row > 0, "hub row");
  const months = intl.indexOf('<h2 id="mesos">');
  const communities = intl.indexOf('<h2 id="comunitats">');
  assert.ok(months > 0 && row > months && row < communities, "row sits between the month table and the communities table");
  assert.match(intl, /c\.region === "CT" \? <DayByDayRow locale=\{locale\} \/> : null/);
  const es = readFileSync(join(ROOT, "src/components/programmatic/spain-2027/pages.tsx"), "utf8");
  assert.match(es, /<SpainDayIndex \/>/);
  const days = readFileSync(join(ROOT, "src/components/programmatic/spain-2027/days.tsx"), "utf8");
  assert.match(days, /Dia a dia/);
  assert.match(days, /Día a día/);
  assert.match(days, /Day by day/);
  assert.match(days, /indexableDayPages\(locale\)/);
});

function bodyText(blocks: unknown): string {
  return JSON.stringify(blocks);
}

test("Sitges links: indexable targets, same language, in the searched words", () => {
  for (const l of LOCALES) {
    const links = sitgesNextLinks(l);
    assert.equal(links.length, 3);
    assert.equal(links[0]!.href, `/${l}/${l === "ca" ? "festius" : l === "es" ? "festivos" : "holidays"}/sitges/`);
    assert.equal(links[2]!.href, `/${l}/rodalies/r2-sud/`);
    assert.equal(sitgesCarnivalHref(l), b2href("carnival", l));
    for (const { href } of links) {
      assert.ok(href.startsWith(`/${l}/`), href);
      assert.equal(isLowDemandPath(href, TODAY), false, href);
    }
  }
  assert.match(sitgesNextLinks("ca")[0]!.label, /festius a Sitges/);
  assert.match(sitgesNextLinks("es")[0]!.label, /festivos en Sitges/);
  assert.match(sitgesNextLinks("en")[0]!.label, /public holidays in Sitges/);
  assert.match(sitgesNextLinks("en")[1]!.label, /Sitges Carnival 2027/);
  assert.match(sitgesNextLinks("en")[2]!.label, /R2 Sud/);
});

test("the festival guide links the holidays page, Carnival 2027 and the R2 Sud page, once each", () => {
  for (const l of LOCALES) {
    const text = bodyText(FESTIVAL.editions[l].blocks);
    for (const target of [sitgesHolidaysHref(l), sitgesCarnivalHref(l), sitgesR2Href(l)]) {
      assert.equal(text.split(`](${target})`).length - 1, 1, `${l} ${target}`);
    }
  }
});

test("the train guide links back to the festival guide, the holidays page and the R2 Sud page", () => {
  for (const l of LOCALES) {
    const text = bodyText(TRAIN_GUIDE.editions[l].blocks);
    for (const target of [featureHref("sitges", l), sitgesHolidaysHref(l), sitgesR2Href(l)]) {
      assert.ok(text.includes(`](${target})`), `${l} ${target}`);
    }
    // The existing Carnival link stays (SITGES_CARNIVAL), and the target never doubles up.
    assert.equal(text.split(`](${sitgesCarnivalHref(l)})`).length - 1, 1, `${l} carnival`);
    assert.ok(!text.includes(".."), `${l} no double full stop`);
    assert.equal(isLowDemandPath(featureHref("sitges", l), TODAY), false);
  }
});

test("the 12 day trips guide links the festival guide from its Sitges section", () => {
  for (const l of LOCALES) {
    assert.ok(bodyText(TRAINS.editions[l].blocks).includes(`](${featureHref("sitges", l)})`), l);
  }
});
