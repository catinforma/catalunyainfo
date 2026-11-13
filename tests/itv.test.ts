import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { CALC_COPY, CATEGORY_LABEL, EXAMPLE, ITV_LOCALES, itvEditions } from "../src/lib/programmatic/itv/copy.ts";
import { addDays, addMonths, ageInYears, categoryOf, daysBetween, firstDue, frequencyAt, isIsoDate, nextItv, onTimeChain } from "../src/lib/programmatic/itv/engine.ts";
import { itvMeta, itvSitemapEntries } from "../src/lib/programmatic/itv/page.ts";
import { DGT_FEE, PRICES_AS_OF, PRICES_REREAD_BY, REGIONS } from "../src/lib/programmatic/itv/prices.ts";
import { CATEGORIES, EARLY_DAYS, FINE, ITV_REREAD_BY, ITV_RULES_AS_OF, QUOTE } from "../src/lib/programmatic/itv/rules.ts";

/**
 * "¿Cuándo me toca pasar la ITV?" (lib/programmatic/itv/): RD 920/2017
 * art. 6 as date arithmetic, the official fee per community, and the dates
 * by which both must be re-read.
 */

const ROOT = join(import.meta.dirname, "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const today = () => new Date().toISOString().slice(0, 10);
const ok = (r: ReturnType<typeof nextItv>) => {
  assert.equal(r.status, "ok");
  return r as Extract<ReturnType<typeof nextItv>, { status: "ok" }>;
};

/* ---------------------------------------------------------------- dates */

test("date helpers: months to the same day, the month's last day when it has none, leap years", () => {
  assert.equal(addMonths("2025-01-31", 1), "2025-02-28");
  assert.equal(addMonths("2024-01-31", 1), "2024-02-29");
  assert.equal(addMonths("2024-02-29", 12), "2025-02-28");
  assert.equal(addMonths("2026-11-13", 6), "2027-05-13");
  assert.equal(addMonths("2026-08-31", 6), "2027-02-28");
  assert.equal(addDays("2027-03-15", -30), "2027-02-13");
  assert.equal(addDays("2028-03-15", -30), "2028-02-14");
  assert.equal(daysBetween("2026-11-13", "2027-03-15"), 122);
  assert.equal(ageInYears("2016-01-01", "2025-12-31"), 9);
  assert.equal(ageInYears("2016-01-01", "2026-01-01"), 10);
  assert.equal(ageInYears("2020-02-29", "2024-02-28"), 3);
  assert.equal(ageInYears("2020-02-29", "2024-02-29"), 4);
  assert.ok(isIsoDate("2024-02-29") && !isIsoDate("2025-02-29") && !isIsoDate("2025-13-01") && !isIsoDate("") && !isIsoDate("15/03/2019"));
});

/* ---------------------------------------------------------------- art. 6.1 */

test("art. 6.1: a private car is exempt 4 years, then every 2, then every year from its 10th anniversary", () => {
  const car = categoryOf("car");
  assert.equal(frequencyAt(car, 3), "exempt");
  assert.equal(frequencyAt(car, 4), 24);
  assert.equal(frequencyAt(car, 9), 24);
  assert.equal(frequencyAt(car, 10), 12);
  assert.deepEqual(onTimeChain(car, "2016-01-01", 8), ["2020-01-01", "2022-01-01", "2024-01-01", "2026-01-01", "2027-01-01", "2028-01-01", "2029-01-01", "2030-01-01"]);
});

test("art. 6.1: vans, motorcycles, mopeds, caravans, buses, lorries, taxis and driving schools", () => {
  // N1: exempt 2, every 2 until 6, yearly until 10, then every 6 months.
  assert.deepEqual(onTimeChain(categoryOf("van"), "2016-01-01", 9), ["2018-01-01", "2020-01-01", "2022-01-01", "2023-01-01", "2024-01-01", "2025-01-01", "2026-01-01", "2026-07-01", "2027-01-01"]);
  assert.deepEqual(onTimeChain(categoryOf("motorcycle"), "2020-05-10", 3), ["2024-05-10", "2026-05-10", "2028-05-10"]);
  assert.deepEqual(onTimeChain(categoryOf("moped"), "2020-05-10", 3), ["2023-05-10", "2025-05-10", "2027-05-10"]);
  assert.deepEqual(onTimeChain(categoryOf("caravan"), "2020-05-10", 2), ["2026-05-10", "2028-05-10"]);
  // No exempt period: yearly from registration, every 6 months from the 5th anniversary.
  assert.deepEqual(onTimeChain(categoryOf("bus"), "2020-05-10", 7), ["2021-05-10", "2022-05-10", "2023-05-10", "2024-05-10", "2025-05-10", "2025-11-10", "2026-05-10"]);
  assert.deepEqual(onTimeChain(categoryOf("heavy"), "2016-01-01", 12).slice(-3), ["2026-01-01", "2026-07-01", "2027-01-01"]);
  assert.equal(firstDue(categoryOf("taxi"), "2026-03-01"), "2027-03-01");
  assert.deepEqual(onTimeChain(categoryOf("school"), "2020-01-01", 5), ["2022-01-01", "2023-01-01", "2024-01-01", "2025-01-01", "2025-07-01"]);
  assert.equal(firstDue(categoryOf("tractor"), "2020-01-01"), "2028-01-01");
});

test("art. 6.1: each category's bands say what its verbatim BOE quote says", () => {
  const words: Record<string, number> = { dos: 2, cinco: 5, seis: 6 };
  for (const c of CATEGORIES) {
    for (const b of c.bands.slice(1)) {
      const n = String(b.fromYears);
      const word = Object.entries(words).find(([, v]) => v === b.fromYears)?.[0];
      assert.ok(c.quote.includes(`${n} años`) || (word && c.quote.includes(`${word} años`)), `${c.id}: ${b.fromYears} not in "${c.quote}"`);
    }
    const kinds = { exempt: "Exento", 6: "Semestral", 12: "Anual", 24: "Bienal" } as Record<string, string>;
    for (const b of c.bands) assert.ok(c.quote.includes(kinds[String(b.every)]!), `${c.id}: ${b.every}`);
    for (const l of ITV_LOCALES) assert.ok(CATEGORY_LABEL[c.id][l].trim(), `${c.id} (${l})`);
  }
});

/* ---------------------------------------------------------------- art. 6.5 */

test("art. 6.5: passed within the 30 days before the expiry, the new validity counts from the expiry", () => {
  const base = { category: "car" as const, firstRegistration: "2019-03-15", previousExpiry: "2025-03-15", today: "2026-11-13" };
  const kept = ok(nextItv({ ...base, lastInspection: "2025-02-13" })); // exactly 30 days before
  assert.equal(kept.due, "2027-03-15");
  assert.equal(kept.basis, "from-previous-expiry");
  assert.equal(kept.earlyFrom, "2027-02-13");
  assert.equal(EARLY_DAYS, 30);
  const lost = ok(nextItv({ ...base, lastInspection: "2025-02-12" })); // 31 days before
  assert.equal(lost.due, "2027-02-12");
  assert.equal(lost.basis, "from-last");
  // Without the old expiry the calculator counts from the inspection day (and says so).
  assert.equal(ok(nextItv({ ...base, previousExpiry: null, lastInspection: "2025-02-20" })).due, "2027-02-20");
  // Late: counts from the day it was passed.
  assert.equal(ok(nextItv({ ...base, lastInspection: "2025-04-01" })).due, "2027-04-01");
});

test("the page's example: car of 15 Mar 2019, last ITV 20 Feb 2025 (expiry 15 Mar) → before 15 Mar 2027", () => {
  const r = ok(nextItv({ ...EXAMPLE }));
  assert.equal(r.due, "2027-03-15");
  assert.equal(r.basis, "from-previous-expiry");
  assert.equal(r.earlyFrom, "2027-02-13");
  assert.equal(r.daysLeft, null, "no 'days left' in the server-rendered example");
  assert.deepEqual(r.then, ["2029-03-15", "2030-03-15", "2031-03-15", "2032-03-15"]);
});

test("first ITV, no inspection typed, overdue, band change, invalid input", () => {
  const first = ok(nextItv({ category: "car", firstRegistration: "2024-06-01", today: "2026-11-13" }));
  assert.equal(first.due, "2028-06-01");
  assert.equal(first.basis, "first");
  assert.equal(first.earlyFrom, null, "the 30-day rule speaks of the previous inspection: none for the first");
  const assumed = ok(nextItv({ category: "car", firstRegistration: "2016-01-01", today: "2026-11-13" }));
  assert.equal(assumed.due, "2027-01-01");
  assert.equal(assumed.basis, "assumed-on-time");
  assert.equal(assumed.every, 12);
  const overdue = ok(nextItv({ category: "car", firstRegistration: "2016-01-01", lastInspection: "2024-10-01", today: "2026-11-13" }));
  assert.equal(overdue.due, "2026-10-01");
  assert.equal(overdue.daysLeft, -43);
  // Passed at 9 years and 10 months: two years by the band of that day, but the car turns 10 before.
  const band = ok(nextItv({ category: "car", firstRegistration: "2017-01-01", lastInspection: "2026-11-01", today: "2026-11-13" }));
  assert.equal(band.due, "2028-11-01");
  assert.deepEqual(band.bandChange, { on: "2027-01-01", years: 10, every: 12 });
  assert.equal(ok(nextItv({ ...EXAMPLE })).bandChange, null);
  assert.deepEqual(nextItv({ category: "car", firstRegistration: "2019-02-30" }), { status: "invalid", reason: "dates" });
  assert.deepEqual(nextItv({ category: "car", firstRegistration: "2019-03-15", lastInspection: "2018-01-01" }), { status: "invalid", reason: "order" });
  assert.deepEqual(nextItv({ category: "car", firstRegistration: "2027-01-01", today: "2026-11-13" }), { status: "invalid", reason: "future" });
});

/* ---------------------------------------------------------------- quotes, fines */

test("quotes and fines as read in the BOE", () => {
  assert.match(QUOTE.early, /30 días naturales precedentes a la expiración/);
  assert.match(QUOTE.fine, /las graves, con multa de 200 euros/);
  assert.match(QUOTE.discount, /50 por ciento/);
  assert.match(QUOTE.discountWhen, /veinte días naturales/);
  assert.match(QUOTE.offence, /inspección técnica de vehículos/);
  assert.match(QUOTE.sticker, /distintivo V-19/);
  assert.match(QUOTE.tenDays, /plazo de 10 días/);
  assert.deepEqual(FINE, { serious: 200, paidEarly: 100, discountDays: 20 });
});

/* ---------------------------------------------------------------- prices */

// Bulletins, regional governments and public ITV companies (VEIASA, ITVASA): never press or private operators.
const OFFICIAL_HOSTS =
  /(^|\.)(boe\.es|gencat\.cat|caib\.es|conselldemallorca\.cat|cime\.es|gva\.es|carm\.es|aragon\.es|juntadeandalucia\.es|veiasa\.es|itvcita\.com|juntaex\.es|jccm\.es|castillalamancha\.es|comunidad\.madrid|jcyl\.es|xunta\.gal|asturias\.es|cantabria\.es|euskadi\.eus|navarra\.es|gobiernodecanarias\.org|bomemelilla\.es|melilla\.es)$/;

test("prices: one row per community and autonomous city, Catalonia first, figures only from official sources", () => {
  assert.equal(REGIONS.length, 19);
  assert.equal(REGIONS[0]?.id, "cataluna");
  assert.equal(new Set(REGIONS.map((r) => r.id)).size, REGIONS.length);
  for (const r of REGIONS) {
    for (const l of ITV_LOCALES) assert.ok(r.name[l].trim(), `${r.id} (${l})`);
    if (r.regime === "unpublished") {
      assert.ok(!r.prices || r.prices.length === 0, `${r.id}: prices printed without an official tariff`);
      assert.ok(r.note, `${r.id}: say why there is no price`);
    } else {
      assert.ok(r.prices && r.prices.length > 0, `${r.id}: tariff with no prices`);
      assert.ok(r.taxes, `${r.id}: say what the amounts include`);
      assert.ok(r.validFor, `${r.id}: say what period the amounts are for`);
      assert.ok(r.sources.some((s) => s.published), `${r.id}: no dated bulletin`);
      for (const p of r.prices) {
        assert.ok(p.amount > 0 && p.amount < 100, `${r.id}: ${p.label.es} ${p.amount}`);
        for (const l of ITV_LOCALES) assert.ok(p.label[l].trim(), `${r.id}: ${p.label.es} (${l})`);
      }
    }
    for (const s of r.sources) if (s.published) assert.ok(s.published <= PRICES_AS_OF, `${r.id}: ${s.published}`);
    for (const u of [...r.sources.map((s) => s.url), ...r.stations.map((s) => s.url)]) {
      assert.ok(u.startsWith("https://") && OFFICIAL_HOSTS.test(new URL(u).hostname), `${r.id}: ${u} is not an official host`);
    }
  }
  // Catalonia: Ordre IUE/361/2010 maximums (DOGC 5660), before VAT and fee.
  const cat = REGIONS[0]!;
  assert.equal(cat.regime, "max");
  assert.equal(cat.taxes, "excluded");
  assert.deepEqual(cat.prices!.slice(0, 2).map((p) => p.amount), [30.1, 34.22]);
  assert.equal(DGT_FEE.amount, 4.18);
});

/* ---------------------------------------------------------------- date guards */

test(`date guard: RD 920/2017 art. 6 and the Ley de Tráfico are re-read by ${ITV_REREAD_BY}`, () => {
  assert.ok(ITV_RULES_AS_OF <= today());
  assert.ok(
    today() <= ITV_REREAD_BY,
    "Re-read RD 920/2017 (BOE-A-2017-12841: art. 6, 11, 12, 14, 19, annex II) and RDL 6/2015 (BOE-A-2015-11722: arts. 76, 80, 94) on boe.es; update QUOTE/CATEGORIES/FINE in itv/rules.ts, then move ITV_RULES_AS_OF and ITV_REREAD_BY.",
  );
});

test(`date guard: every community's ITV tariff is re-read by ${PRICES_REREAD_BY}`, () => {
  assert.ok(PRICES_AS_OF <= today());
  assert.ok(
    today() <= PRICES_REREAD_BY,
    "Re-read each community's ITV tariff in its official bulletin or industry department (2027 tariffs), update REGIONS in itv/prices.ts, then move PRICES_AS_OF and PRICES_REREAD_BY.",
  );
});

/* ---------------------------------------------------------------- page */

test("page: titles and descriptions fit the snippet; three editions with hreflang in the sitemap", () => {
  for (const l of ITV_LOCALES) {
    const m = itvMeta(l);
    assert.ok(m.title.length <= 60, `${l} title: ${m.title.length}`);
    assert.ok(m.description.length <= 170, `${l} description: ${m.description.length}`);
    assert.ok(CALC_COPY[l].title.trim());
  }
  assert.deepEqual(itvEditions(), { es: "/es/calculadoras/itv/", ca: "/ca/calculadores/itv/", en: "/en/calculators/itv-spain/" });
  const entries = itvSitemapEntries();
  assert.equal(entries.length, 3);
  for (const e of entries) assert.deepEqual(Object.keys(e.alternates!.languages!).sort(), ["ca", "en", "es", "x-default"]);
  assert.match(read("src/app/sitemap.ts"), /\.\.\.itvSitemapEntries\(\)/);
  assert.match(read("src/lib/seo/llms.ts"), /hubs: itvEditions\(\)/);
});

test("page: breadcrumb through the hub, 'More calculators', calculator server-rendered on the fixed example", () => {
  const page = read("src/components/programmatic/itv/ItvPage.tsx");
  assert.match(page, /<MoreCalculators current="itv" locale=\{locale\} \/>/);
  assert.match(page, /hubCrumb\(locale\),/);
  assert.match(page, /<ItvCalculator locale=\{locale\} \/>/);
  const calc = read("src/components/programmatic/itv/ItvCalculator.tsx");
  assert.match(calc, /^"use client";/);
  // Today is only known in the browser: the server render shows the example without a days-left line.
  assert.match(calc, /useState<string \| null>\(null\)/);
  assert.match(calc, /<noscript>/);
  for (const l of ITV_LOCALES) assert.deepEqual(Object.keys(CALC_COPY[l]).sort(), Object.keys(CALC_COPY.es).sort(), l);
});
