import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import {
  barcelonaHolidayLinks,
  barcelonaHolidaysSentence,
  butaneLink,
  railLineHrefs,
  railLinesSentence,
  reservoirLinks,
  reservoirsSentence,
  tarragonaHolidayLink,
  workingDaysLink,
} from "../src/lib/content/audit-links.ts";
import { BARCELONA_HUB } from "../src/lib/content/batch02/barcelona-hub.ts";
import { ZBE } from "../src/lib/content/batch02/barcelona-practical.ts";
import { CLIMATE } from "../src/lib/content/batch02/climate.ts";
import { TARRAGONA } from "../src/lib/content/batch02/coast-trips.ts";
import { TRAINS } from "../src/lib/content/features/trains.ts";
import { isLowDemandPath } from "../src/lib/seo/low-demand.ts";

/**
 * 25 Nov 2026 internal-link audit, round 2 (docs/SEO_EXPERIMENTS.md): pages at
 * position 8-20 with few contextual inlinks get links from the guide or hub a
 * reader of that subject is already on. Each added link is checked at its
 * builder, in ca, es and en, indexable and in the page's own language.
 */

const ROOT = join(import.meta.dirname, "..");
const LOCALES = ["ca", "es", "en"] as const;
const TODAY = "2026-11-25";

const text = (blocks: unknown): string => JSON.stringify(blocks);
const has = (haystack: string, href: string): boolean => haystack.includes(`](${href})`);

test("every target is in the page's language, with the expected path", () => {
  const expected = {
    ca: { sau: "/ca/embassaments/sau/", hub: "/ca/embassaments/", bcn: "/ca/festius/barcelona/", tgn: "/ca/festius/tarragona/", butane: "/ca/preu-buta/" },
    es: { sau: "/es/embalses/sau/", hub: "/es/embalses/", bcn: "/es/festivos/barcelona/", tgn: "/es/festivos/tarragona/", butane: "/es/precio-butano/" },
    en: { sau: "/en/reservoirs/sau/", hub: "/en/reservoirs/", bcn: "/en/holidays/barcelona/", tgn: "/en/holidays/tarragona/", butane: "/en/butane-price-spain/" },
  } as const;
  for (const l of LOCALES) {
    const [sau, susqueda, hub] = reservoirLinks(l);
    assert.equal(sau!.href, expected[l].sau);
    assert.equal(susqueda!.href, expected[l].sau.replace("sau", "susqueda"));
    assert.equal(hub!.href, expected[l].hub);
    assert.equal(barcelonaHolidayLinks(l)[0]!.href, expected[l].bcn);
    assert.equal(tarragonaHolidayLink(l).href, expected[l].tgn);
    assert.equal(butaneLink(l).href, expected[l].butane);
    assert.match(workingDaysLink(l).href, new RegExp(`^/${l}/`));
    assert.deepEqual(railLineHrefs(l), [`/${l}/rodalies/r1/`, `/${l}/rodalies/r2/`, `/${l}/rodalies/r4/`]);
  }
});

test("no target is a noindex page", () => {
  for (const l of LOCALES) {
    const hrefs = [
      ...reservoirLinks(l).map((x) => x.href),
      ...barcelonaHolidayLinks(l).map((x) => x.href),
      tarragonaHolidayLink(l).href,
      butaneLink(l).href,
      workingDaysLink(l).href,
      ...railLineHrefs(l),
    ];
    for (const href of hrefs) assert.equal(isLowDemandPath(href, TODAY), false, href);
  }
});

test("weather guide: Sau, Susqueda and the reservoir hub are linked from its body (ca, es, en)", () => {
  for (const l of LOCALES) {
    const body = text(CLIMATE.editions[l].blocks);
    for (const { href } of reservoirLinks(l)) assert.ok(has(body, href), `${l} ${href}`);
    assert.ok(body.includes(reservoirsSentence(l).slice(0, 40)), l);
  }
});

test("Barcelona practical guide: the Barcelona holidays page and the holidays hub", () => {
  for (const l of LOCALES) {
    const body = text(BARCELONA_HUB.editions[l].blocks);
    for (const { href } of barcelonaHolidayLinks(l)) assert.ok(has(body, href), `${l} ${href}`);
    assert.ok(body.includes(barcelonaHolidaysSentence(l).slice(0, 30)), l);
  }
});

test("Tarragona train guide: the Tarragona holidays page, once", () => {
  for (const l of LOCALES) {
    const body = text(TARRAGONA.editions[l].blocks);
    assert.equal(body.split(`](${tarragonaHolidayLink(l).href})`).length - 1, 1, l);
  }
});

test("ZBE guide: the working-days calculator in its related list, next to the 15 working days", () => {
  for (const l of LOCALES) {
    const body = text(ZBE.editions[l].blocks);
    assert.ok(has(body, workingDaysLink(l).href), l);
    assert.match(body, /15 (días hábiles|dies hàbils|working days)/);
  }
});

test("12 day trips by train: R1, R2 and R4 line pages", () => {
  for (const l of LOCALES) {
    const body = text(TRAINS.editions[l].blocks);
    for (const href of railLineHrefs(l)) assert.ok(has(body, href), `${l} ${href}`);
    assert.ok(body.includes(railLinesSentence(l).slice(0, 30)), l);
  }
});

test("Today page: the butane price and the Sau and Susqueda pages sit with their answers", () => {
  const src = readFileSync(join(ROOT, "src/components/programmatic/today/TodayPage.tsx"), "utf8");
  assert.match(src, /\.\.\.reservoirLinks\(locale\)\.slice\(0, 2\)/);
  const reservoirs = src.indexOf("reservoirs: [");
  const fuel = src.indexOf("fuel: [");
  assert.ok(reservoirs > 0 && src.indexOf("reservoirLinks(locale)", reservoirs) < fuel, "Sau and Susqueda in the reservoirs item");
  const electricity = src.indexOf("electricity: [");
  const weekend = src.indexOf("weekend: some(");
  const butane = src.indexOf("butaneLink(locale)", electricity);
  assert.ok(electricity > 0 && butane > electricity && butane < weekend, "butane in the electricity item");
});
