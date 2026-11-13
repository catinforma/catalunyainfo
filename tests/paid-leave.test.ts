import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { CALC_COPY, DEFAULT_PLACE, EVENT_LABEL, PL_LOCALES, calendarOf, paidLeaveEditions, paidLeavePath, readHash, writeHash } from "../src/lib/programmatic/paid-leave/copy.ts";
import { DEFAULT_INPUT, DEFAULT_START, birthPlan, countWorking, leaveDays, shortLeave, type PaidLeaveInput } from "../src/lib/programmatic/paid-leave/engine.ts";
import { paidLeavePlaces } from "../src/lib/programmatic/paid-leave/places.ts";
import { BIRTH, EVENTS, FORCE_MAJEURE_DAYS_PER_YEAR, NURSING, PARENTAL, QUOTE, RULES_AS_OF, RULES_UNTIL, SHORT_RULES, SOURCES } from "../src/lib/programmatic/paid-leave/rules.ts";
import { paidLeaveSitemapEntries } from "../src/lib/programmatic/paid-leave/sitemap.ts";

/**
 * "Permisos laborales 2026" (lib/programmatic/paid-leave/): the paid leave of
 * the Estatuto de los Trabajadores (arts. 37.3, 37.4, 37.9, 38.1, 48.4 and
 * 48 bis, read in the BOE on 13 Nov 2026), with hand-checked dates and the
 * date guards.
 */

const ROOT = join(import.meta.dirname, "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const PAGE = "src/components/programmatic/paid-leave/PaidLeavePage.tsx";

const placesEs = paidLeavePlaces("es");
const placesCa = paidLeavePlaces("ca");
const national = calendarOf(placesEs, "espana");

/* -------------------------------------------------------------------------- */
/* The rules match the BOE wording                                            */
/* -------------------------------------------------------------------------- */

test("rules: the days are the ones the quoted ET text says (art. 37.3 as worded by RDL 5/2023)", () => {
  assert.equal(SHORT_RULES.marriage.days, 15);
  assert.match(QUOTE.marriage, /^Quince días naturales/);
  assert.equal(SHORT_RULES.marriage.count, "natural");
  assert.equal(SHORT_RULES.illness.days, 5);
  assert.match(QUOTE.illness, /^Cinco días por/);
  assert.equal(SHORT_RULES.death.days, 2);
  assert.equal(SHORT_RULES.death.travelExtra, 2);
  assert.match(QUOTE.death, /^Dos días por el fallecimiento.*el plazo se ampliará en dos días\.$/);
  assert.equal(SHORT_RULES.move.days, 1);
  assert.match(QUOTE.move, /^Un día por traslado/);
  assert.equal(SHORT_RULES.vacation.days, 30);
  assert.match(QUOTE.vacation, /inferior a treinta días naturales\.$/);
  assert.equal(SHORT_RULES.vacation.count, "natural");
  assert.equal(FORCE_MAJEURE_DAYS_PER_YEAR, 4);
  assert.match(QUOTE.forceMajeure, /equivalentes a cuatro días al año/);
  assert.equal(NURSING.untilMonths, 9);
  assert.match(QUOTE.nursing, /hasta que este cumpla nueve meses/);
  // Only marriage and holidays say "naturales"; the others say "días" with nothing after.
  for (const e of ["illness", "death", "move"] as const) {
    assert.equal(SHORT_RULES[e].count, "unspecified", e);
    assert.doesNotMatch(QUOTE[e], /naturales|hábiles|laborables/, e);
  }
});

test("rules: birth leave is 19 weeks (6 + 11 + 2), 32 for a single parent (6 + 22 + 4), per RDL 9/2025; parental leave 8 weeks", () => {
  assert.equal(BIRTH.mandatoryWeeks + BIRTH.flexibleWeeks + BIRTH.childcareWeeks, BIRTH.totalWeeks);
  assert.equal(BIRTH.totalWeeks, 19);
  assert.equal(BIRTH.mandatoryWeeks + BIRTH.single.flexibleWeeks + BIRTH.single.childcareWeeks, BIRTH.single.totalWeeks);
  assert.equal(BIRTH.single.totalWeeks, 32);
  assert.match(QUOTE.birth, /durante diecinueve semanas\.$/);
  assert.match(QUOTE.birthMandatory, /^Seis semanas ininterrumpidas/);
  assert.match(QUOTE.birthFlexible, /^Once semanas, veintidós en el caso de monoparentalidad.*cumpla doce meses\.$/);
  assert.match(QUOTE.birthChildcare, /^Dos semanas, cuatro en el caso de monoparentalidad.*cumpla los ocho años\.$/);
  assert.equal(BIRTH.benefitPct, 100);
  assert.match(QUOTE.benefit, /100 por ciento de la base reguladora/);
  assert.equal(PARENTAL.weeks, 8);
  assert.match(QUOTE.parental, /no superior a ocho semanas/);
  assert.match(QUOTE.suspension, /exonera de las obligaciones recíprocas de trabajar y remunerar/);
  assert.match(QUOTE.rdl9transitional, /a partir del 2 de agosto de 2024\.$/);
  assert.equal(BIRTH.extraWeeksBirthsFrom, "2024-08-02");
});

/* -------------------------------------------------------------------------- */
/* Short leaves, hand-checked                                                 */
/* -------------------------------------------------------------------------- */

test("default example in Madrid: 5 days from Thu 3 Dec 2026 end Mon 7 Dec counted consecutively, Fri 11 Dec counting working days (6 Sun, 7 and 8 Dec holidays)", () => {
  const r = shortLeave("illness", DEFAULT_START, false, calendarOf(placesEs, DEFAULT_PLACE.es));
  assert.equal(r.days, 5);
  assert.equal(r.lastCalendar, "2026-12-07");
  assert.ok(r.working);
  assert.equal(r.working.first, "2026-12-03");
  assert.equal(r.working.last, "2026-12-11");
  assert.deepEqual(
    r.working.skipped.map((s) => `${s.date}:${s.reason}`),
    ["2026-12-05:saturday", "2026-12-06:sunday", "2026-12-07:holiday", "2026-12-08:holiday"],
  );
});

test("default example in Catalonia (ca, en): 7 Dec is a working day there, so the working count ends Thu 10 Dec", () => {
  assert.equal(DEFAULT_PLACE.ca, "catalunya");
  const r = shortLeave("illness", DEFAULT_START, false, calendarOf(placesCa, DEFAULT_PLACE.ca));
  assert.equal(r.lastCalendar, "2026-12-07");
  assert.equal(r.working?.last, "2026-12-10");
  assert.deepEqual(r.working?.skipped.map((s) => s.date), ["2026-12-05", "2026-12-06", "2026-12-08"]);
});

test("death: 2 days, 4 with travel; a Friday start skips the weekend in the working count", () => {
  assert.equal(leaveDays("death", false), 2);
  assert.equal(leaveDays("death", true), 4);
  const r = shortLeave("death", "2026-11-13", true, national);
  assert.equal(r.lastCalendar, "2026-11-16");
  assert.equal(r.working?.last, "2026-11-18");
  const plain = shortLeave("death", "2026-11-13", false, national);
  assert.equal(plain.lastCalendar, "2026-11-14");
  assert.equal(plain.working?.last, "2026-11-16");
});

test("moving house on a Saturday: the working count starts on Monday", () => {
  const r = shortLeave("move", "2026-11-14", false, national);
  assert.equal(r.lastCalendar, "2026-11-14");
  assert.equal(r.working?.first, "2026-11-16");
  assert.equal(r.working?.last, "2026-11-16");
  assert.deepEqual(r.working?.skipped, []);
});

test("marriage and holidays are natural days only: no working count", () => {
  const m = shortLeave("marriage", "2026-06-12", false, national);
  assert.equal(m.lastCalendar, "2026-06-26");
  assert.equal(m.working, null);
  assert.equal(m.outOfRange, false);
  const v = shortLeave("vacation", "2026-08-01", false, national);
  assert.equal(v.lastCalendar, "2026-08-30");
  assert.equal(v.working, null);
});

test("outside the holiday data (2026–2027) the working count is not guessed", () => {
  const r = shortLeave("illness", "2028-01-10", false, national);
  assert.equal(r.lastCalendar, "2028-01-14");
  assert.equal(r.working, null);
  assert.equal(r.outOfRange, true);
  // A count that would run past 31 Dec 2027 is refused too.
  assert.equal(countWorking("2027-12-30", 5, national), null);
});

/* -------------------------------------------------------------------------- */
/* Birth leave, hand-checked                                                  */
/* -------------------------------------------------------------------------- */

test("birth on 3 Dec 2026: mandatory to 13 Jan 2027, flexible until 3 Dec 2027 (17 weeks in a row end 31 Mar 2027), 2 weeks until 3 Dec 2034", () => {
  const b = birthPlan("2026-12-03", false);
  assert.equal(b.totalWeeks, 19);
  assert.equal(b.mandatoryEnd, "2027-01-13");
  assert.equal(b.flexibleFrom, "2027-01-14");
  assert.equal(b.flexibleUntil, "2027-12-03");
  assert.equal(b.continuousEnd, "2027-03-31");
  assert.equal(b.flexibleWeeks, 11);
  assert.equal(b.childcareWeeks, 2);
  assert.equal(b.childcareUntil, "2034-12-03");
  assert.equal(b.nursingUntil, "2027-09-03");
  assert.equal(b.nursingSharedUntil, "2027-12-03");
  assert.equal(b.parentalUntil, "2034-12-03");
});

test("birth, single parent: 32 weeks, 22 flexible (28 weeks in a row end 16 Jun 2027), 4 until age 8", () => {
  const b = birthPlan("2026-12-03", true);
  assert.equal(b.totalWeeks, 32);
  assert.equal(b.flexibleWeeks, 22);
  assert.equal(b.childcareWeeks, 4);
  assert.equal(b.continuousEnd, "2027-06-16");
  assert.equal(b.mandatoryEnd, "2027-01-13");
});

test("birth on 29 Feb 2028: the first birthday clamps to 28 Feb 2029", () => {
  const b = birthPlan("2028-02-29", false);
  assert.equal(b.flexibleUntil, "2029-02-28");
  assert.equal(b.mandatoryEnd, "2028-04-10");
});

/* -------------------------------------------------------------------------- */
/* Places, hash, words                                                        */
/* -------------------------------------------------------------------------- */

test("places: all of Spain and every community as a whole, no towns; defaults exist", () => {
  for (const l of PL_LOCALES) {
    const places = paidLeavePlaces(l);
    const values = places.map((p) => p[0]);
    assert.equal(new Set(values).size, values.length);
    assert.equal(values[0], "espana");
    assert.ok(values.includes("catalunya") && values.includes("madrid/all"), l);
    assert.ok(values.includes(DEFAULT_PLACE[l]), l);
    assert.ok(places.length >= 19 && places.length <= 21, `${l}: ${places.length}`);
    for (const p of places) assert.ok(p[1].trim() && p[2].length > 0, p[0]);
  }
});

test("hash: round trip, and junk is ignored", () => {
  const base: PaidLeaveInput = { ...DEFAULT_INPUT, place: "madrid/all" };
  const death: PaidLeaveInput = { ...base, event: "death", start: "2027-03-02", travel: true, place: "catalunya" };
  assert.deepEqual(readHash(writeHash(death), base, placesEs), death);
  const birth: PaidLeaveInput = { ...base, event: "birth", birth: "2027-05-20", single: true };
  assert.deepEqual(readHash(writeHash(birth), base, placesEs), birth);
  assert.deepEqual(readHash("#e=nope&d=2027-02-30&p=atlantis&b=x", base, placesEs), base);
});

test("every event has a label in each language, and the calculator copy is complete", () => {
  for (const l of PL_LOCALES) {
    for (const e of EVENTS) assert.ok(EVENT_LABEL[l][e].trim(), `${l} ${e}`);
    const t = CALC_COPY[l];
    for (const [k, v] of Object.entries(t)) if (typeof v === "string") assert.ok(v.trim(), `${l}.${k}`);
  }
});

/* -------------------------------------------------------------------------- */
/* Page, routes, sitemap, hub, llms                                           */
/* -------------------------------------------------------------------------- */

test("routes: one static page per language, a 404 in the others, never dynamicParams = false", () => {
  const files = {
    es: "src/app/(public)/[locale]/calculadoras/permisos-laborales/page.tsx",
    ca: "src/app/(public)/[locale]/calculadores/permisos-laborals/page.tsx",
    en: "src/app/(public)/[locale]/calculators/spain-paid-leave/page.tsx",
  } as const;
  for (const l of PL_LOCALES) {
    assert.ok(existsSync(join(ROOT, files[l])), files[l]);
    const src = read(files[l]);
    assert.match(src, new RegExp(`if \\(locale !== "${l}"\\) notFound\\(\\);`));
    assert.match(src, /^export const dynamicParams = true;$/m);
    assert.match(src, new RegExp(`<PaidLeaveRoute locale="${l}" />`));
  }
  assert.deepEqual(paidLeaveEditions(), { ca: "/ca/calculadores/permisos-laborals/", es: "/es/calculadoras/permisos-laborales/", en: "/en/calculators/spain-paid-leave/" });
  assert.equal(paidLeavePath("es"), "/es/calculadoras/permisos-laborales/");
});

test("titles and descriptions fit the snippet", () => {
  const src = read(PAGE);
  const titles = [...src.matchAll(/^\s{4}title: "([^"]+)",$/gm)].map((m) => m[1]!);
  const descs = [...src.matchAll(/^\s{4}description: "([^"]+)",$/gm)].map((m) => m[1]!);
  assert.equal(titles.length, 3);
  assert.equal(descs.length, 3);
  for (const t of titles) assert.ok(t.length <= 60, `${t.length}: ${t}`);
  for (const d of descs) assert.ok(d.length >= 70 && d.length <= 165, `${d.length}: ${d}`);
});

test("sitemap (hreflang), hub card, llms.txt and 'More calculators' carry the page", () => {
  const entries = paidLeaveSitemapEntries();
  assert.equal(entries.length, 3);
  for (const e of entries) {
    assert.deepEqual(Object.keys(e.alternates!.languages!).sort(), ["ca", "en", "es", "x-default"]);
    assert.ok(String(e.alternates!.languages!["x-default"]).endsWith("/en/calculators/spain-paid-leave/"));
  }
  assert.match(read("src/app/sitemap.ts"), /\.\.\.paidLeaveSitemapEntries\(\)/);
  assert.match(read("src/lib/seo/llms.ts"), /hubs: paidLeaveEditions\(\)/);
  assert.match(read("src/lib/programmatic/calculators/hub.ts"), /key: "paid-leave"/);
  assert.match(read(PAGE), /<MoreCalculators current="paid-leave" locale=\{locale\} \/>/);
  assert.match(read(PAGE), /hubCrumb\(locale\),/);
});

test("official sources only: BOE and Seguridad Social; no URL typed in the page; YMYL disclaimer shown", () => {
  const hosts = new Set(["www.boe.es", "www.seg-social.es"]);
  for (const s of Object.values(SOURCES)) assert.ok(hosts.has(new URL(s.url).host), s.url);
  const page = read(PAGE);
  for (const m of page.matchAll(/https?:\/\/[^"'`\s)]+/g)) assert.fail(`hard-coded URL in the page: ${m[0]}`);
  assert.match(page, /\{DISCLAIMER\[locale\]\}/);
  assert.match(read("src/components/programmatic/paid-leave/PaidLeaveCalculator.tsx"), /\{DISCLAIMER\[locale\]\}/);
});

/* -------------------------------------------------------------------------- */
/* Date guards                                                                */
/* -------------------------------------------------------------------------- */

test("date guard: the rules' as-of date is not in the future", () => {
  assert.ok(Date.parse(`${RULES_AS_OF}T00:00:00Z`) <= Date.now(), "RULES_AS_OF in the future");
});

test("date guard: from 1 January 2027 the paid-leave rules need re-reading", () => {
  // Re-read in the BOE the consolidated Estatuto de los Trabajadores (arts. 37, 38, 45, 48, 48 bis: any change to
  // the days, the 19 weeks or a benefit for the parental leave) and LGSS arts. 177-185, and the Seguridad Social's
  // birth-benefit page. The working-day count only has 2026 and 2027 holidays (working-days/rules.ts COVER_TO):
  // the page's example dates (3 Dec 2026) must move to the new year. Then move RULES_AS_OF and RULES_UNTIL, and
  // the page title's year ("Permisos laborales 2026").
  assert.ok(Date.now() < Date.parse(`${RULES_UNTIL}T00:00:00Z`), "Permisos laborales: re-read the rules for 2027");
});
