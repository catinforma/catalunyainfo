import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { HUB_GROUPS } from "../src/lib/programmatic/calculators/hub.ts";
import { calcPath } from "../src/lib/programmatic/calculators/paths.ts";
import { CALCULATOR_NEXT } from "../src/lib/engagement/next-step-calculators.ts";
import { driverGuides } from "../src/lib/programmatic/fuel/copy.ts";
import { ANNEX_LABEL, CALC_COPY, CHANNEL_LABEL, LETTER_LABEL, SEVERITY_LABEL, STAGE_LABEL, SURCHARGE_LABEL, TF_LOCALES, dateLabel, dueNote, money, trafficFinesEditions } from "../src/lib/programmatic/traffic-fines/copy.ts";
import { CHANNELS, SEVERITIES, STAGES, apremioDue, calculate, calculateOk, fine, ifNothing, notificationDay, pointsBack, prescription, type FineInput } from "../src/lib/programmatic/traffic-fines/engine.ts";
import { DEFAULT_INPUT, exampleInputs, examples, trafficFinesFaq, trafficFinesMeta, trafficFinesSitemapEntries } from "../src/lib/programmatic/traffic-fines/page.ts";
import { DEFAULT_PLACE, NATIONAL_ID, calendarOf, fineCalendar, finePlaces } from "../src/lib/programmatic/traffic-fines/places.ts";
import {
  ANNEX_II,
  BASE_FINE,
  CATALAN_QUOTES,
  DISCOUNT_DAYS,
  FULL_PAYMENT_DAYS,
  IDENTIFY_DAYS,
  LSV_LAST_UPDATE,
  NO_DISCOUNT_DRIVER,
  NO_DISCOUNT_LETTERS,
  NO_DISCOUNT_LETTERS_2015,
  POINTS,
  PRESCRIPTION_MONTHS,
  QUOTE,
  RED_LIGHT,
  RULES_AS_OF,
  RULES_UNTIL,
  SERVICES,
  SOURCES,
  SPEED_BANDS,
  SPEED_LIMITS,
  SURCHARGE_RATE,
} from "../src/lib/programmatic/traffic-fines/rules.ts";

/**
 * "Multas de tráfico: plazos, descuento del 50 % y recursos"
 * (lib/programmatic/traffic-fines/): the Ley de Tráfico's counts (arts.
 * 90-96, 110, 112), the last-day rule of Ley 39/2015 art. 30.5 on the real
 * holiday data, the LGT surcharges, the tables, the page, its links and the
 * date from which the rules must be re-read.
 */

const ROOT = join(import.meta.dirname, "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const today = () => new Date().toISOString().slice(0, 10);
const NAT = fineCalendar("es", NATIONAL_ID);
const MADRID = fineCalendar("es", "madrid/all");
const CAT = fineCalendar("es", "catalunya");

/* ------------------------------------------------------------------ rules */

test("the BOE's words: 20 natural days from the day after the notification, the 50 %, the waiver", () => {
  assert.equal(DISCOUNT_DAYS, 20);
  assert.equal(IDENTIFY_DAYS, 20);
  assert.match(QUOTE.twentyDays, /plazo de veinte días naturales para realizar el pago voluntario con reducción/);
  assert.match(QUOTE.abbreviated, /dentro del plazo de veinte días naturales contados desde el día siguiente al de su notificación/);
  assert.match(QUOTE.reduction, /reducción del 50 por ciento/);
  assert.match(QUOTE.waiver, /se tendrán por no presentadas/);
  assert.match(QUOTE.alegaciones, /veinte días naturales para formular las alegaciones/);
  assert.match(QUOTE.identify, /veinte días naturales para identificar al conductor/);
  // 30 (art. 95.4) + 15 (art. 110.1) = the DGT's 45 days.
  assert.equal(FULL_PAYMENT_DAYS, 45);
  assert.match(QUOTE.enforceable, /treinta días naturales/);
  assert.match(QUOTE.finalPayment, /quince días naturales/);
  assert.match(QUOTE.dgt45, /45 días/);
  assert.match(QUOTE.dgtAeat, /20% de recargo/);
});

test("no 50 %: art. 93.2 as worded by Ley 18/2021, ten letters; the 2015 list (SCT) lacks s) and t)", () => {
  assert.equal(NO_DISCOUNT_LETTERS.length, 10);
  assert.equal(QUOTE.excluded, "El procedimiento sancionador abreviado no será de aplicación a las infracciones previstas en el artículo 77.h), j), n), ñ), o), p), q), r), s) y t).");
  for (const l of NO_DISCOUNT_LETTERS) assert.match(QUOTE.excluded, new RegExp(`[ .]${l}\\)`), l);
  assert.deepEqual(NO_DISCOUNT_LETTERS.filter((l) => !(NO_DISCOUNT_LETTERS_2015 as readonly string[]).includes(l)), ["s", "t"]);
  for (const l of NO_DISCOUNT_DRIVER) assert.ok(NO_DISCOUNT_LETTERS.includes(l), l);
  for (const l of NO_DISCOUNT_LETTERS) for (const loc of TF_LOCALES) assert.ok(LETTER_LABEL[l][loc].trim(), `${l} (${loc})`);
  assert.match(QUOTE.noIdentifyFine, /el doble .* leve, y el triple, si es infracción grave o muy grave/);
});

test("notification: DEV rejected after 10 natural days, BOE deemed after 20, the DGT counts from the TEU publication", () => {
  assert.match(QUOTE.devRejected, /diez días naturales sin que se acceda a su contenido/);
  assert.match(QUOTE.boe, /veinte días naturales desde que la notificación se hubiese publicado en el BOE/);
  assert.match(QUOTE.dgtTeu, /fecha de publicación en el TEU/);
  assert.match(QUOTE.testra, /Con carácter previo y facultativo/);
  assert.match(QUOTE.lastDayInhabil, /prorrogado al primer día hábil siguiente/);
  assert.match(QUOTE.supletoria, /supletoriamente, en la normativa de procedimiento administrativo común/);
});

test("surcharges and deadlines of the General Tax Act; prescription; points", () => {
  assert.deepEqual(SURCHARGE_RATE, { executive: 0.05, reduced: 0.1, ordinary: 0.2 });
  assert.match(QUOTE.surchargeExecutive, /cinco por ciento/);
  assert.match(QUOTE.surchargeReduced, /10 por ciento/);
  assert.match(QUOTE.surchargeOrdinary, /20 por ciento/);
  assert.match(QUOTE.apremioFirst, /entre los días uno y 15 .* hasta el día 20 de dicho mes/);
  assert.match(QUOTE.apremioSecond, /entre los días 16 y último .* hasta el día cinco del mes siguiente/);
  assert.deepEqual(PRESCRIPTION_MONTHS, { leve: 3, grave: 6, "muy-grave": 6 });
  assert.match(QUOTE.prescription, /tres meses para las infracciones leves y de seis meses para las infracciones graves y muy graves/);
  assert.equal(POINTS.initial, 12);
  assert.equal(POINTS.novice, 8);
  assert.equal(POINTS.max, 15);
  assert.equal(POINTS.dayCap, 8);
  assert.match(QUOTE.dayCap, /más de ocho puntos/);
  assert.equal(POINTS.recoveryYears, 2);
  assert.match(QUOTE.twoYears, /^Transcurridos dos años/);
  // The course: the Act allows up to six, the Orden sets four (what the DGT applies).
  assert.match(QUOTE.courseLaw, /hasta un máximo de seis puntos/);
  assert.match(QUOTE.courseOrder, /recuperación de cuatro puntos/);
  assert.deepEqual([POINTS.courseLawMax, POINTS.course], [6, 4]);
  // The three-year rule is quoted only as the deleted paragraph.
  assert.match(QUOTE.threeYearsDeleted, /será de tres años/);
});

test("amounts: art. 80.1 and annex IV, bands continuous for every limit", () => {
  assert.deepEqual(BASE_FINE, { leveMax: 100, grave: 200, muyGrave: 500 });
  assert.match(QUOTE.amounts, /hasta 100 euros; las graves, con multa de 200 euros, y las muy graves, con multa de 500 euros/);
  assert.equal(SPEED_LIMITS.length, 12);
  assert.deepEqual(SPEED_BANDS.map((b) => [b.fine, b.points]), [[100, 0], [300, 2], [400, 4], [500, 6], [600, 6]]);
  for (const b of SPEED_BANDS) {
    assert.equal(b.from.length, SPEED_LIMITS.length);
    if (b.to) assert.equal(b.to.length, SPEED_LIMITS.length);
  }
  SPEED_LIMITS.forEach((limit, i) => {
    // The first band starts 1 km/h over the limit; each band starts right after the previous one.
    assert.equal(SPEED_BANDS[0]!.from[i], limit + 1, `limit ${limit}`);
    for (let k = 1; k < SPEED_BANDS.length; k++) assert.equal(SPEED_BANDS[k]!.from[i], SPEED_BANDS[k - 1]!.to![i]! + 1, `limit ${limit} band ${k}`);
  });
  // The DGT's own table: 120 km/h → 121-150 / 151-170 / 171-180 / 181-190 / 191+; 50 km/h → 51-70 … 101+.
  const at = (limit: number) => SPEED_BANDS.map((b) => [b.from[SPEED_LIMITS.indexOf(limit as never)], b.to?.[SPEED_LIMITS.indexOf(limit as never)] ?? null]);
  assert.deepEqual(at(120), [[121, 150], [151, 170], [171, 180], [181, 190], [191, null]]);
  assert.deepEqual(at(50), [[51, 70], [71, 80], [81, 90], [91, 100], [101, null]]);
});

test("annex II: 22 rows (alcohol in two), points 3, 4 or 6, translated in ca and en", () => {
  assert.equal(ANNEX_II.length, 22);
  for (const r of ANNEX_II) assert.ok([3, 4, 6].includes(r.points), `${r.n}: ${r.points}`);
  assert.equal(ANNEX_II.find((r) => r.n === "8")!.points, 6);
  assert.equal(ANNEX_II.find((r) => r.n === "21")!.points, 3);
  assert.equal(ANNEX_LABEL.ca.length, ANNEX_II.length);
  assert.equal(ANNEX_LABEL.en.length, ANNEX_II.length);
});

test("sources: official hosts over https, read on the as-of day; the BOE ids of every norm used", () => {
  const hosts = new Set(["www.boe.es", "www.dgt.es", "transit.gencat.cat", "atc.gencat.cat"]);
  for (const [key, s] of Object.entries(SOURCES)) {
    const url = new URL(s.url);
    assert.equal(url.protocol, "https:", key);
    assert.ok(hosts.has(url.host), `${key}: ${url.host}`);
    assert.equal(s.read, RULES_AS_OF, key);
  }
  assert.match(SOURCES.lsv.url, /BOE-A-2015-11722$/);
  assert.match(SOURCES.lsv.ref, /26\/06\/2026/);
  assert.equal(LSV_LAST_UPDATE, "2026-06-26");
  assert.match(SOURCES.l39.url, /BOE-A-2015-10565$/);
  assert.match(SOURCES.lgt.url, /BOE-A-2003-23186$/);
  assert.match(SOURCES.int914.url, /BOE-A-2024-17780$/);
  // The DGT's services through its own dgt.es links (sede.dgt.gob.es does not answer from our server).
  for (const href of [SERVICES.dgtPay, SERVICES.dgtDev, SERVICES.dgtTeu, SERVICES.dgtAppeal, SERVICES.dgtPoints]) assert.match(href, /^https:\/\/www\.dgt\.es\//);
  assert.deepEqual(CATALAN_QUOTES, ["sct", "sctAtc", "atc"]);
});

test(`date guard: re-read the Ley de Tráfico, the DGT and the SCT before ${RULES_UNTIL}`, () => {
  assert.ok(RULES_AS_OF <= today());
  assert.ok(
    today() < RULES_UNTIL,
    "Traffic fines: re-read the BOE consolidated Ley de Tráfico (BOE-A-2015-11722: its 'última actualización', arts. 63-65, 80, 90-96, 110, 112 and annexes II and IV), Ley 39/2015 art. 30, LGT arts. 28 and 62.5, Orden INT/914/2024, the DGT pages (45 days, TEU date, list without discount) and the SCT page; update rules.ts and the page's words, then move RULES_AS_OF and RULES_UNTIL.",
  );
});

/* ----------------------------------------------------------------- engine */

test("default example: letter received 18 Nov 2026, day 20 is 8 Dec (national holiday) → 9 Dec; 45 days → Sat 2 Jan → Mon 4 Jan", () => {
  const r = calculateOk(DEFAULT_INPUT as FineInput & { stage: "denuncia" }, NAT);
  assert.equal(r.notified, "2026-11-18");
  assert.deepEqual(r.discount, { nominal: "2026-12-08", reason: "holiday", legal: "2026-12-09" });
  assert.deepEqual(r.alegaciones, r.discount);
  assert.deepEqual(r.identify, r.discount);
  assert.equal(r.reduced, 100);
  assert.equal(r.ifNothing, "denuncia-resolves");
  assert.deepEqual(r.fullUntil, { nominal: "2027-01-02", reason: "saturday", legal: "2027-01-04" });
  assert.deepEqual(r.surcharged, { executive: 210, reduced: 220, ordinary: 240 });
  // Same in Catalonia (the ca and en default) and in Madrid.
  assert.deepEqual(calculateOk(DEFAULT_INPUT as FineInput & { stage: "denuncia" }, CAT).discount, r.discount);
  assert.deepEqual(calculateOk(DEFAULT_INPUT as FineInput & { stage: "denuncia" }, MADRID).discount, r.discount);
});

test("last day on a weekend or holiday moves to the next working day, with the reader's community (Ley 39/2015 art. 30.5)", () => {
  // TEU published 16 Nov 2026: day 20 is Sunday 6 Dec. All of Spain: Monday 7. Madrid (7 Dec holiday, 8 Dec holiday): Wednesday 9.
  const teu = fine("2026-11-16", 100, { channel: "teu", severity: "leve" });
  assert.deepEqual(calculateOk(teu as FineInput & { stage: "denuncia" }, NAT).discount, { nominal: "2026-12-06", reason: "sunday", legal: "2026-12-07" });
  assert.deepEqual(calculateOk(teu as FineInput & { stage: "denuncia" }, MADRID).discount, { nominal: "2026-12-06", reason: "sunday", legal: "2026-12-09" });
  // A working day stays put.
  assert.deepEqual(calculateOk(fine("2026-12-01", 300, { points: true }) as FineInput & { stage: "denuncia" }, NAT).discount, { nominal: "2026-12-21", reason: null, legal: "2026-12-21" });
  // Beyond the holiday data (2027): the weekend is known, no legal day is given.
  const far = calculateOk(fine("2027-12-20", 200) as FineInput & { stage: "denuncia" }, NAT);
  assert.deepEqual(far.discount, { nominal: "2028-01-09", reason: "sunday", legal: null });
  for (const l of TF_LOCALES) assert.ok(dueNote(far.discount!, l)?.includes("30.5"), l);
  for (const l of TF_LOCALES) assert.equal(dueNote({ nominal: "2026-12-21", reason: null, legal: "2026-12-21" }, l), null);
});

test("notification day by channel: DEV unopened +10, TEU publication (and art. 91's +20), the rest as given", () => {
  assert.deepEqual(notificationDay("dev-unopened", "2026-11-20"), { notified: "2026-11-30", law: null });
  assert.deepEqual(notificationDay("teu", "2026-11-16"), { notified: "2026-11-16", law: "2026-12-06" });
  for (const c of ["spot", "paper", "dev-opened"] as const) assert.deepEqual(notificationDay(c, "2026-11-18"), { notified: "2026-11-18", law: null });
  const teu = calculateOk(fine("2026-11-16", 100, { channel: "teu", severity: "leve" }) as FineInput & { stage: "denuncia" }, NAT);
  assert.equal(teu.notifiedLaw, "2026-12-06");
  assert.deepEqual(teu.discountLaw, { nominal: "2026-12-26", reason: "saturday", legal: "2026-12-28" });
  // On the spot there is no driver to name.
  assert.equal(calculateOk(fine("2026-11-18", 200, { channel: "spot" }) as FineInput & { stage: "denuncia" }, NAT).identify, null);
});

test("art. 95.4: when the notice itself resolves, by type, points and stop", () => {
  assert.equal(ifNothing("leve", false, false), "denuncia-resolves");
  assert.equal(ifNothing("grave", false, false), "denuncia-resolves");
  assert.equal(ifNothing("grave", true, false), "resolution-follows");
  assert.equal(ifNothing("grave", true, true), "denuncia-resolves");
  assert.equal(ifNothing("muy-grave", false, true), "denuncia-resolves");
  assert.equal(ifNothing("muy-grave", true, false), "resolution-follows");
  assert.equal(ifNothing("unknown", false, true), "denuncia-resolves");
  assert.equal(ifNothing("unknown", true, false), "resolution-follows");
  assert.equal(ifNothing("unknown", false, false), "depends");
  // No 45-day date when a resolution follows.
  assert.equal(calculateOk(fine("2026-12-01", 300, { points: true }) as FineInput & { stage: "denuncia" }, NAT).fullUntil, null);
});

test("no discount for art. 93.2 offences; points come back two years after the sanction is firm", () => {
  const r = calculateOk(fine("2026-11-25", 600, { severity: "muy-grave", excluded: true }) as FineInput & { stage: "denuncia" }, NAT);
  assert.equal(r.discount, null);
  assert.equal(r.reduced, null);
  assert.deepEqual(r.alegaciones, { nominal: "2026-12-15", reason: null, legal: "2026-12-15" });
  const p = calculateOk(fine("2026-11-18", 200, { channel: "spot", points: true }) as FineInput & { stage: "denuncia" }, NAT);
  assert.deepEqual(p.pointsBackIfPaidOn, { paid: "2026-12-08", back: "2028-12-08" });
  assert.equal(pointsBack("2028-02-29"), "2030-02-28");
});

test("resolution: reposición one month (same day number), full payment 15 natural days; apremio: the 20th or the 5th (LGT art. 62.5)", () => {
  const res = calculateOk({ ...fine("2026-11-18", 200), stage: "resolucion" }, NAT);
  assert.deepEqual(res.reposicion, { nominal: "2026-12-18", reason: null, legal: "2026-12-18" });
  assert.deepEqual(res.payFull, { nominal: "2026-12-03", reason: null, legal: "2026-12-03" });
  assert.equal(calculateOk({ ...fine("2027-01-31", 200), stage: "resolucion" }, NAT).reposicion.nominal, "2027-02-28");
  assert.deepEqual(apremioDue("2026-11-10", NAT), { nominal: "2026-11-20", reason: null, legal: "2026-11-20" });
  assert.deepEqual(apremioDue("2026-11-15", NAT).nominal, "2026-11-20");
  assert.deepEqual(apremioDue("2026-11-18", NAT), { nominal: "2026-12-05", reason: "saturday", legal: "2026-12-07" });
  assert.deepEqual(apremioDue("2026-12-20", NAT).nominal, "2027-01-05");
  const ap = calculateOk({ ...fine("2026-11-18", 200), stage: "apremio" }, NAT);
  assert.deepEqual(ap.surcharged, { executive: 210, reduced: 220, ordinary: 240 });
});

test("prescription: 3 or 6 months from the day of the facts, interrupted by the notification", () => {
  assert.deepEqual(prescription("2026-06-10", "2026-11-18", "grave", false), { months: [6], until: ["2026-12-10"], notifiedInside: true });
  assert.deepEqual(prescription("2026-05-01", "2026-11-18", "leve", false), { months: [3], until: ["2026-08-01"], notifiedInside: false });
  // Type not known, no points: leve (3) or grave/muy grave (6).
  assert.deepEqual(prescription("2026-07-01", "2026-11-18", "unknown", false), { months: [3, 6], until: ["2026-10-01", "2027-01-01"], notifiedInside: null });
  // Points mean grave or muy grave: six months.
  assert.deepEqual(prescription("2026-07-01", "2026-11-18", "unknown", true).months, [6]);
  const r = calculateOk(fine("2026-11-18", 200, { offence: "2026-10-01" }) as FineInput & { stage: "denuncia" }, NAT);
  assert.equal(r.prescription!.notifiedInside, true);
});

test("invalid input: date, amount, an offence after the notification, a leve with points", () => {
  assert.deepEqual(calculate(fine("2026-02-30", 200), NAT), { status: "invalid", reason: "date" });
  assert.deepEqual(calculate(fine("2026-11-18", 0), NAT), { status: "invalid", reason: "amount" });
  assert.deepEqual(calculate(fine("2026-11-18", Number.NaN), NAT), { status: "invalid", reason: "amount" });
  assert.deepEqual(calculate(fine("2026-11-18", 1e9), NAT), { status: "invalid", reason: "amount" });
  assert.deepEqual(calculate(fine("2026-11-18", 200, { offence: "2026-11-19" }), NAT), { status: "invalid", reason: "offence" });
  assert.deepEqual(calculate(fine("2026-11-18", 90, { severity: "leve", points: true }), NAT), { status: "invalid", reason: "leve-points" });
  for (const l of TF_LOCALES) for (const r of Object.values(CALC_COPY[l].invalid)) assert.ok(r.trim(), l);
});

/* ------------------------------------------------------------------ places */

test("places: all of Spain, Catalonia and every community, from the working-days data; defaults per language", () => {
  const places = finePlaces("es");
  assert.equal(places[0]!.id, NATIONAL_ID);
  assert.ok(places.some((p) => p.id === "catalunya"));
  assert.ok(places.length >= 19, String(places.length));
  for (const l of TF_LOCALES) assert.ok(finePlaces(l).some((p) => p.id === DEFAULT_PLACE[l]), l);
  // 8 December is a national holiday in both years; 7 December 2026 only in some communities.
  assert.ok(NAT.holidays.has("2026-12-08") && NAT.holidays.has("2027-12-08"));
  assert.ok(!NAT.holidays.has("2026-12-07") && MADRID.holidays.has("2026-12-07"));
  assert.deepEqual(calendarOf(places[0]!).holidays, NAT.holidays);
});

/* ------------------------------------------------------------------- page */

test("page: titles and descriptions fit the snippet and carry the 20 days and the 50 %; three editions", () => {
  for (const l of TF_LOCALES) {
    const m = trafficFinesMeta(l);
    assert.ok(m.title.length <= 60, `${l} title: ${m.title.length}`);
    assert.ok(m.description.length <= 160, `${l} description: ${m.description.length}`);
    assert.ok(m.description.includes("20") && m.description.includes("50"), l);
    assert.ok(m.h1.length <= 80, `${l} h1: ${m.h1.length}`);
    assert.deepEqual(Object.keys(CALC_COPY[l]).sort(), Object.keys(CALC_COPY.es).sort(), l);
    for (const s of STAGES) assert.ok(STAGE_LABEL[s][l].trim() && dateLabel(s, "paper", l).trim(), `${s} (${l})`);
    for (const c of CHANNELS) assert.ok(CHANNEL_LABEL[c][l].trim() && dateLabel("denuncia", c, l).trim(), `${c} (${l})`);
    for (const s of SEVERITIES) assert.ok(SEVERITY_LABEL[s][l].trim(), `${s} (${l})`);
    for (const s of Object.keys(SURCHARGE_LABEL) as (keyof typeof SURCHARGE_LABEL)[]) assert.ok(SURCHARGE_LABEL[s][l].trim(), `${s} (${l})`);
  }
  assert.deepEqual(trafficFinesEditions(), { ca: "/ca/calculadores/multes-transit/", es: "/es/calculadoras/multas-trafico/", en: "/en/calculators/traffic-fines-spain/" });
  const entries = trafficFinesSitemapEntries();
  assert.equal(entries.length, 3);
  for (const e of entries) assert.deepEqual(Object.keys(e.alternates!.languages!).sort(), ["ca", "en", "es", "x-default"]);
  assert.match(read("src/app/sitemap.ts"), /\.\.\.trafficFinesSitemapEntries\(\)/);
  assert.match(read("src/lib/seo/llms.ts"), /hubs: trafficFinesEditions\(\)/);
  // The hub: the vehicle group, next to the ITV.
  assert.deepEqual(HUB_GROUPS.find((g) => g.id === "vehicle")?.cards.map((c) => c.key), ["itv", "traffic-fines"]);
});

test("page: one static route per language, a 404 in the others, server-rendered calculator, tables, FAQ and YMYL pieces", () => {
  const routes = { es: "calculadoras/multas-trafico", ca: "calculadores/multes-transit", en: "calculators/traffic-fines-spain" } as const;
  for (const l of TF_LOCALES) {
    const file = join("src", "app", "(public)", "[locale]", routes[l], "page.tsx");
    assert.ok(existsSync(join(ROOT, file)), file);
    const src = read(file);
    assert.match(src, new RegExp(`if \\(locale !== "${l}"\\) notFound\\(\\);`));
    assert.match(src, new RegExp(`<TrafficFinesRoute locale="${l}" />`));
    assert.match(src, /^export const dynamicParams = true;$/m);
    assert.match(src, /^export const revalidate = false;$/m);
  }
  const page = read("src/components/programmatic/traffic-fines/TrafficFinesPage.tsx");
  assert.match(page, /<MoreCalculators current="traffic-fines" locale=\{locale\} \/>/);
  assert.match(page, /<CalculatorNextStep current="traffic-fines" locale=\{locale\} \/>/);
  assert.match(page, /hubCrumb\(locale\)/);
  assert.match(page, /<TrafficFinesCalculator locale=\{locale\} initial=\{DEFAULT_INPUT\} places=\{places\} defaultPlace=\{DEFAULT_PLACE\[locale\]\} \/>/);
  // The answer is in the HTML: deadlines, the speeding and points tables and the examples render on the server.
  assert.match(page, /deadlineRows\.map/);
  assert.match(page, /SPEED_LIMITS\.map/);
  assert.match(page, /ANNEX_II\.map/);
  assert.match(page, /exs\.map/);
  // YMYL: the disclaimer with the DGT's link, the official services, the rules date, the FAQ schema.
  assert.match(page, /SOURCES\.dgtFine\.url/);
  assert.match(page, /SERVICES\.dgtPay/);
  assert.match(page, /RULES_AS_OF/);
  assert.match(page, /"@type": "FAQPage"/);
  assert.match(page, /workingDaysPath\(locale\)/);
  assert.match(page, /itvPath\(locale\)/);
  const calc = read("src/components/programmatic/traffic-fines/TrafficFinesCalculator.tsx");
  assert.match(calc, /^"use client";/);
  assert.match(calc, /<noscript>/);
  assert.match(calc, /useCalculatorUse\("traffic-fines"/);
  // Never a plate, an ID or a file number.
  assert.doesNotMatch(calc, /matr[ií]cula"|placeholder="[^"]*DNI/i);
});

test("examples: every one from the engine, the TEU and DEV cases, the apremio row", () => {
  const ids = exampleInputs().map(([id]) => id);
  assert.equal(new Set(ids).size, ids.length);
  const ex = Object.fromEntries(examples(NAT).map((e) => [e.id, e.result]));
  assert.equal(ex["paper-holiday"]!.stage, "denuncia");
  const teu = ex.teu as Extract<typeof ex.teu, { stage: "denuncia" }>;
  assert.equal(teu.discount!.legal, "2026-12-07");
  const dev = ex["dev-unopened"] as Extract<typeof ex.teu, { stage: "denuncia" }>;
  assert.equal(dev.notified, "2026-11-30");
  assert.deepEqual(dev.discount, { nominal: "2026-12-20", reason: "sunday", legal: "2026-12-21" });
  const noId = ex["no-identify"] as Extract<typeof ex.teu, { stage: "denuncia" }>;
  assert.equal(noId.discount, null);
  assert.equal(ex.resolution!.stage, "resolucion");
  assert.equal(ex.apremio!.stage, "apremio");
  // The calculator's fixed words agree with the server-rendered default.
  for (const l of TF_LOCALES) {
    assert.ok(CALC_COPY[l].noscript.includes(money(BASE_FINE.grave, l)), l);
    assert.ok(CALC_COPY[l].example.includes(money(BASE_FINE.grave, l)), l);
  }
});

test("FAQ: ten questions per language, the real queries, every figure from the rules", () => {
  const es = trafficFinesFaq("es");
  assert.deepEqual(es.map((f) => f.q).slice(0, 3), ["¿Cuántos días tengo para pagar una multa con el 50 % de descuento?", "¿Qué multas no tienen descuento del 50 %?", "¿Si pago la multa con descuento pierdo los puntos?"]);
  for (const l of TF_LOCALES) {
    const faq = trafficFinesFaq(l);
    assert.equal(faq.length, 10, l);
    assert.equal(new Set(faq.map((f) => f.q)).size, 10, l);
    const all = faq.map((f) => f.a).join(" ");
    for (const n of [money(BASE_FINE.grave, l), money(BASE_FINE.grave / 2, l), String(FULL_PAYMENT_DAYS), String(DISCOUNT_DAYS), String(POINTS.course)]) assert.ok(all.includes(n), `${l}: ${n}`);
    assert.doesNotMatch(all, /undefined|NaN/, l);
    // Never the deleted three-year rule as current.
    assert.doesNotMatch(all, /tres años para (las )?muy graves|three years for very serious/);
  }
});

test("links: ITV page and fuel guides link the tool; next steps both ways", () => {
  assert.match(read("src/components/programmatic/itv/ItvPage.tsx"), /calcPath\("traffic-fines", locale\)/);
  for (const l of ["es", "ca"] as const) assert.ok(driverGuides(l).some((g) => g.href === calcPath("traffic-fines", l)), `fuel ${l}`);
  assert.deepEqual(CALCULATOR_NEXT["traffic-fines"], ["itv", "working-days"]);
  assert.ok(CALCULATOR_NEXT.itv?.includes("traffic-fines"));
});

test("FAQ 27 Nov: how long a fine takes to arrive (red light) and the amounts, from the quoted articles", () => {
  // Queries (GSC 28 d to 26 Nov): "cuanto tarda en llegar una multa por saltarse un semaforo" 1 at 22, "importe multas" 1 at 7, "sanciones trafico" 1 at 32, "sancions transit" 2 at 23.
  assert.equal(RED_LIGHT.severity, "grave");
  assert.match(QUOTE.redLight, /^k\) No respetar la luz roja de un semáforo\.$/);
  assert.match(QUOTE.noticeCamera, /medios de captación y reproducción de imágenes/);
  const red = ANNEX_II.find((r) => r.n === RED_LIGHT.annexRow)!;
  assert.match(red.text, /semáforos con luz roja encendida/);
  assert.equal(red.points, 4);
  assert.match(QUOTE.amounts, /hasta 100 euros; las graves, con multa de 200 euros, y las muy graves, con multa de 500 euros/);
  const q = { es: ["¿Cuánto tarda en llegar una multa de tráfico?", "¿Cuánto es una multa de tráfico leve, grave o muy grave?"], ca: ["Quant triga a arribar una multa de trànsit?", "Quant és una multa de trànsit lleu, greu o molt greu?"], en: ["How long does a Spanish traffic fine take to arrive?", "How much is a minor, serious or very serious traffic fine in Spain?"] } as const;
  for (const l of TF_LOCALES) {
    const faq = trafficFinesFaq(l);
    const [arrive, amounts] = q[l].map((x) => faq.find((f) => f.q === x));
    assert.ok(arrive && amounts, l);
    for (const n of [String(PRESCRIPTION_MONTHS.leve), String(PRESCRIPTION_MONTHS.grave), money(BASE_FINE.grave, l), money(BASE_FINE.grave / 2, l), String(red.points), "76 k", "89.2", "112"]) assert.ok(arrive.a.includes(n), `${l} arrive: ${n}`);
    for (const n of [money(BASE_FINE.leveMax, l), money(BASE_FINE.grave, l), money(BASE_FINE.muyGrave, l), money(BASE_FINE.leveMax / 2, l), money(BASE_FINE.muyGrave / 2, l), money(100, l), money(600, l), money(1_000, l), "80.1"]) assert.ok(amounts.a.includes(n), `${l} amounts: ${n}`);
  }
});
