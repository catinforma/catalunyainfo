import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { CALC_COPY, DEFAULT_PLACE, EVENT_LABEL, PL_LOCALES, calendarOf, paidLeaveEditions, paidLeavePath, readHash, writeHash } from "../src/lib/programmatic/paid-leave/copy.ts";
import { DEFAULT_INPUT, DEFAULT_START, birthPlan, countWorking, leaveDays, shortLeave, type PaidLeaveInput } from "../src/lib/programmatic/paid-leave/engine.ts";
import { paidLeavePlaces } from "../src/lib/programmatic/paid-leave/places.ts";
import { BEREAVEMENT_START_WEEKS, BIRTH, CIVIL_SERVANT_BEREAVEMENT, CONVALIDATION_RECHECK_BY, EVENTS, FORCE_MAJEURE_DAYS_PER_YEAR, KIN_DEGREES, NURSING, PARENTAL, QUOTE, RDL42_IN_FORCE, RULES_AS_OF, RULES_UNTIL, SHORT_RULES, SOURCES, birthWeeks } from "../src/lib/programmatic/paid-leave/rules.ts";
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

test("kinship: the Civil Code quotes are verbatim (arts. 918-919, BOE fixture) and the degree table follows art. 918's count", () => {
  const cc = read("tests/fixtures/boe-codigo-civil-915-919.txt").replace(/\s+/g, " ");
  for (const q of [QUOTE.cc918, QUOTE.cc919]) assert.ok(cc.includes(q), q.slice(0, 50));
  // art. 918: father 1, grandfather 2, great-grandfather 3; brother 2, uncle 3, first cousin 4.
  const row = (word: string) => KIN_DEGREES.find((k) => k.es.toLowerCase().includes(word))!.degree;
  assert.deepEqual([row("padre"), row("abuelos"), row("bisabuelos"), row("hermanos"), row("tíos"), row("primos")], [1, 2, 3, 2, 3, 4]);
  for (const k of KIN_DEGREES) assert.ok(k.es && k.ca && k.en, `degree ${k.degree} in every language`);
  // The Statute's "hasta el segundo grado" is in both quoted letters the table applies.
  assert.match(QUOTE.death, /segundo grado de consanguinidad o afinidad/);
  assert.match(QUOTE.illness, /hasta el segundo grado/);
  assert.equal(SOURCES.cc.ref, "BOE-A-1889-4763");
  assert.match(read(PAGE), /<KinTable locale=\{locale\} \/>/);
});

test("RDL 42/2026 (BOE-A-2026-24700, read 26 Nov 2026): every quote of the new art. 37.3, 48.4, the transitional rule, EBEP 48 a bis and the entry into force is verbatim in the fixture", () => {
  const rdl = read("tests/fixtures/boe-rdl42-2026-20261126.txt").replace(/\s+/g, " ");
  for (const k of ["marriage", "illness", "death", "deathStart", "move", "publicDuty", "unreachable", "birth", "birthSingle", "birthMandatory", "birthFlexible", "birthChildcare", "rdl42inForce", "rdl42transitional", "rdl42request", "ebep48abis", "rdl42competence"] as const) {
    assert.ok(rdl.includes(QUOTE[k]), `${k}: ${QUOTE[k].slice(0, 60)}`);
  }
  assert.match(rdl, /Fecha de entrada en vigor: 26\/11\/2026/);
  assert.equal(RDL42_IN_FORCE, "2026-11-26");
  // The old wording is gone from the new letter b bis.
  assert.ok(!rdl.includes(QUOTE.deathBefore));
  const ce = read("tests/fixtures/boe-ce-art86-20261126.txt").replace(/\s+/g, " ");
  assert.ok(ce.includes(QUOTE.ce86));
  assert.equal(SOURCES.rdl42.ref, "BOE-A-2026-24700");
  assert.equal(SOURCES.et.date, "2026-11-25");
  assert.deepEqual(CIVIL_SERVANT_BEREAVEMENT, { close: 10, otherSameTown: 3, otherOtherTown: 5 });
  assert.match(QUOTE.ebep48abis, /diez días hábiles.*tres días hábiles.*cinco días hábiles/);
});

test("rules: the days are the ones the quoted ET text says (art. 37.3 as worded by RDL 42/2026)", () => {
  assert.equal(SHORT_RULES.marriage.days, 15);
  assert.match(QUOTE.marriage, /^Quince días naturales/);
  assert.equal(SHORT_RULES.marriage.count, "natural");
  assert.equal(SHORT_RULES.illness.days, 5);
  assert.match(QUOTE.illness, /^Cinco días por/);
  // Bereavement (b bis): 10 working days, first degree by blood; 3 (+2 with travel) for the rest up to the second degree.
  assert.equal(SHORT_RULES.death.days, 10);
  assert.equal(SHORT_RULES.death.travelExtra, 0);
  assert.equal(SHORT_RULES.death2.days, 3);
  assert.equal(SHORT_RULES.death2.travelExtra, 2);
  assert.match(QUOTE.death, /^Diez días laborables por duelo.*primer grado de consanguinidad y tres días laborables.*se ampliarán en dos más cuando/);
  assert.equal(SHORT_RULES.death.count, "working");
  assert.equal(SHORT_RULES.death2.count, "working");
  assert.equal(BEREAVEMENT_START_WEEKS, 4);
  assert.match(QUOTE.deathStart, /cuatro semanas posteriores a la fecha del fallecimiento/);
  assert.equal(SHORT_RULES.move.days, 1);
  assert.match(QUOTE.move, /^Un día por traslado/);
  assert.equal(SHORT_RULES.vacation.days, 30);
  assert.match(QUOTE.vacation, /inferior a treinta días naturales\.$/);
  assert.equal(SHORT_RULES.vacation.count, "natural");
  assert.equal(FORCE_MAJEURE_DAYS_PER_YEAR, 4);
  assert.match(QUOTE.forceMajeure, /equivalentes a cuatro días al año/);
  assert.equal(NURSING.untilMonths, 9);
  assert.match(QUOTE.nursing, /hasta que este cumpla nueve meses/);
  // Only marriage and holidays say "naturales", only bereavement "laborables"; the others say "días" with nothing after.
  for (const e of ["illness", "move"] as const) {
    assert.equal(SHORT_RULES[e].count, "unspecified", e);
    assert.doesNotMatch(QUOTE[e], /naturales|hábiles|laborables/, e);
  }
});

test("rules: birth leave is 20 weeks (6 + 11 + 3), 34 for a single parent (6 + 22 + 6), per RDL 42/2026 for births from 26 Nov 2026; 19 (32) before; parental leave 8 weeks", () => {
  assert.equal(BIRTH.mandatoryWeeks + BIRTH.flexibleWeeks + BIRTH.childcareWeeks, BIRTH.totalWeeks);
  assert.equal(BIRTH.totalWeeks, 20);
  assert.equal(BIRTH.mandatoryWeeks + BIRTH.single.flexibleWeeks + BIRTH.single.childcareWeeks, BIRTH.single.totalWeeks);
  assert.equal(BIRTH.single.totalWeeks, 34);
  assert.match(QUOTE.birth, /durante veinte semanas\.$/);
  assert.match(QUOTE.birthSingle, /treinta y cuatro semanas\.$/);
  assert.equal(BIRTH.week20BirthsFrom, RDL42_IN_FORCE);
  assert.equal(BIRTH.week20RequestFrom, "2027-03-01");
  assert.deepEqual(birthWeeks("2026-11-25", false), { totalWeeks: 19, flexibleWeeks: 11, childcareWeeks: 2 });
  assert.deepEqual(birthWeeks("2026-11-26", false), { totalWeeks: 20, flexibleWeeks: 11, childcareWeeks: 3 });
  assert.deepEqual(birthWeeks("2026-11-25", true), { totalWeeks: 32, flexibleWeeks: 22, childcareWeeks: 4 });
  assert.deepEqual(birthWeeks("2026-11-26", true), { totalWeeks: 34, flexibleWeeks: 22, childcareWeeks: 6 });
  assert.match(QUOTE.birthMandatory, /^Seis semanas ininterrumpidas/);
  assert.match(QUOTE.birthFlexible, /^Once semanas, veintidós en el caso de monoparentalidad.*cumpla doce meses\.$/);
  assert.match(QUOTE.birthChildcare, /^Tres semanas, seis en el caso de monoparentalidad.*cumpla los ocho años\.$/);
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

test("bereavement, second degree: 3 working days, 5 with travel; a Friday start skips the weekend", () => {
  assert.equal(leaveDays("death2", false), 3);
  assert.equal(leaveDays("death2", true), 5);
  // Fri 27 Nov 2026 + travel: 27, 30 Nov, 1, 2, 3 Dec.
  const r = shortLeave("death2", "2026-11-27", true, national);
  assert.equal(r.count, "working");
  assert.equal(r.working?.last, "2026-12-03");
  // Without travel: 27, 30 Nov, 1 Dec.
  assert.equal(shortLeave("death2", "2026-11-27", false, national).working?.last, "2026-12-01");
});

test("bereavement, first degree: 10 working days (no travel extra); from Thu 3 Dec 2026 they end Thu 17 Dec in Catalonia and Fri 18 Dec in Madrid", () => {
  assert.equal(leaveDays("death", true), 10);
  // Catalonia: 8 Dec off, 7 Dec a working day: 3, 4, 7, 9, 10, 11, 14, 15, 16, 17.
  const ca = shortLeave("death", DEFAULT_START, false, calendarOf(placesCa, "catalunya"));
  assert.equal(ca.working?.last, "2026-12-17");
  // Madrid: 7 and 8 Dec off: 3, 4, 9, 10, 11, 14, 15, 16, 17, 18.
  const md = shortLeave("death", DEFAULT_START, false, calendarOf(placesEs, "madrid/all"));
  assert.equal(md.working?.last, "2026-12-18");
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

test("birth on 3 Dec 2026: 20 weeks; mandatory to 13 Jan 2027, flexible until 3 Dec 2027 (17 weeks in a row end 31 Mar 2027), 3 weeks until 3 Dec 2034", () => {
  const b = birthPlan("2026-12-03", false);
  assert.equal(b.totalWeeks, 20);
  assert.equal(b.mandatoryEnd, "2027-01-13");
  assert.equal(b.flexibleFrom, "2027-01-14");
  assert.equal(b.flexibleUntil, "2027-12-03");
  assert.equal(b.continuousEnd, "2027-03-31");
  assert.equal(b.flexibleWeeks, 11);
  assert.equal(b.childcareWeeks, 3);
  assert.equal(b.childcareUntil, "2034-12-03");
  assert.equal(b.nursingUntil, "2027-09-03");
  assert.equal(b.nursingSharedUntil, "2027-12-03");
  assert.equal(b.parentalUntil, "2034-12-03");
});

test("birth, single parent: 34 weeks, 22 flexible (28 weeks in a row end 16 Jun 2027), 6 until age 8", () => {
  const b = birthPlan("2026-12-03", true);
  assert.equal(b.totalWeeks, 34);
  assert.equal(b.flexibleWeeks, 22);
  assert.equal(b.childcareWeeks, 6);
  assert.equal(b.continuousEnd, "2027-06-16");
  assert.equal(b.mandatoryEnd, "2027-01-13");
});

test("birth on 25 Nov 2026 (the day before RDL 42/2026): still 19 weeks, 2 until age 8", () => {
  const b = birthPlan("2026-11-25", false);
  assert.equal(b.totalWeeks, 19);
  assert.equal(b.childcareWeeks, 2);
  assert.equal(birthPlan("2026-11-25", true).totalWeeks, 32);
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
  const death: PaidLeaveInput = { ...base, event: "death2", start: "2027-03-02", travel: true, place: "catalunya" };
  assert.deepEqual(readHash(writeHash(death), base, placesEs), death);
  // First degree has no travel extra: "v" is not written.
  assert.doesNotMatch(writeHash({ ...death, event: "death" }), /v=1/);
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

test("page: the 26 Nov 2026 changes section, the Catalonia and grandparent questions, the old 2/4 days and 19 weeks gone from the copy", () => {
  const page = read(PAGE);
  assert.match(page, /<h2 id="cambios-26-noviembre">\{changes\.h\}<\/h2>/);
  assert.match(page, /¿Cuántos días de permiso por fallecimiento hay en Cataluña\?/);
  assert.match(page, /Quants dies de permís per defunció hi ha a Catalunya\?/);
  assert.match(page, /How many days of bereavement leave are there in Catalonia\?/);
  assert.match(page, /QUOTE\.rdl42competence/);
  assert.doesNotMatch(page, /2 o 4 por fallecimiento|2 o 4 per defunció|2 or 4 for a death|19 semanas por nacimiento/);
  for (const l of PL_LOCALES) {
    assert.match(EVENT_LABEL[l].death, /10 /);
    assert.match(EVENT_LABEL[l].death2, /3 .*5 /);
    assert.match(EVENT_LABEL[l].birth, /20 /);
    assert.ok(CALC_COPY[l].workingNote.includes("42/2026"), l);
  }
});

test("date guard: Congress must vote RDL 42/2026 within 30 days of 24 Nov 2026: re-read the BOE by CONVALIDATION_RECHECK_BY", () => {
  // Re-read the BOE record of BOE-A-2026-24700 ("Referencias posteriores") for the Congress resolution. If it was
  // ratified, say so in the changes section's status line (es/ca/en) with its BOE reference, and move this date
  // past the next check; if repealed, put back the 2/4 days and 19 weeks (QUOTE.deathBefore, BIRTH.before).
  assert.ok(Date.now() < Date.parse(`${CONVALIDATION_RECHECK_BY}T00:00:00Z`), "Permisos laborales: check the RDL 42/2026 convalidation in the BOE");
});

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
