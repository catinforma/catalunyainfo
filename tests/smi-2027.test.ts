import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { CALCULATORS_ROOT } from "../src/lib/programmatic/calculators/paths.ts";
import { CALC_COPY, SMI_LOCALES, money, netSalaryPreset, smiEditions, smiPath } from "../src/lib/programmatic/smi/copy.ts";
import { readHash } from "../src/lib/programmatic/net-salary/copy.ts";
import { DEFAULT_INPUT as NET_DEFAULT } from "../src/lib/programmatic/net-salary/engine.ts";
import { boeNumber, currentYear, domesticFor, findSmiDecree, increaseOn, isSmiDecreeTitle, officialYears, parseSmiDecree, prorated12, smi2027Status, smiFor, type LiveBoe } from "../src/lib/programmatic/smi/engine.ts";
import { HOWTO_DOMESTIC_HOURS, HOWTO_PART_TIME, smiHowTo } from "../src/lib/programmatic/smi/howto.ts";
import { freshnessText, leadText, smiMeta, smiSitemapEntries } from "../src/lib/programmatic/smi/page.ts";
import { DRAFT_2027, NORMS, OFFICIAL_2027, OFFICIAL_2027_DUE, QUOTE, SMI_2026, SMI_HISTORY, SMI_HOWTO_READ, SMI_HOWTO_REREAD_BY, SMI_RULES_AS_OF, STATUS_RECHECK_BY, boeUrl } from "../src/lib/programmatic/smi/rules.ts";
import { loadSmiBoe, searchUrl, summaryUrl, xmlUrl, type Fetcher } from "../src/lib/programmatic/smi/boe.ts";

/**
 * "Salario mínimo (SMI) 2027" (lib/programmatic/smi/): the date guards, the
 * BOE figures 2018–2026 against the decrees' own XML, reading the 2027
 * decree from the BOE's open data, the calculator, the page's states and
 * the routes.
 */

const ROOT = join(import.meta.dirname, "..");
const APP = join(ROOT, "src", "app", "(public)", "[locale]");
const FIX = join(ROOT, "tests", "fixtures");
const fixture = (f: string) => readFileSync(join(FIX, f), "utf8");
const today = () => new Date().toISOString().slice(0, 10);

const RD126 = fixture("boe-smi-2026-rd126.xml");

/** RD 126/2026's XML turned into a made-up 2027 decree (state tests only). */
function fake2027(monthly = "1 286", daily = "42,87", annual = "18 004"): string {
  return RD126.replace(/[\u00a0\u202f]/g, " ")
    .replaceAll("BOE-A-2026-3815", "BOE-A-2027-1234")
    .replace(/<titulo>[^<]+<\/titulo>/, "<titulo>Real Decreto 3/2027, de 12 de enero, por el que se fija el salario mínimo interprofesional para 2027.</titulo>")
    .replace("<fecha_publicacion>20260219</fecha_publicacion>", "<fecha_publicacion>20270113</fecha_publicacion>")
    .replace("40,70 euros/día o 1 221 euros/mes", `${daily} euros/día o ${monthly} euros/mes`)
    .replace("inferior a 17 094 euros.", `inferior a ${annual} euros.`)
    .replace("9,55 euros por hora", "10,06 euros por hora")
    .replace("57,82 euros por jornada", "60,88 euros por jornada")
    .replace("con efectos desde el 1 de enero de 2026", "con efectos desde el 1 de enero de 2027");
}

/* -------------------------------------------------------------------------- */
/* Date guards                                                                */
/* -------------------------------------------------------------------------- */

test(`date guard: from ${OFFICIAL_2027_DUE} the 2027 decree from the BOE is typed in (smi/rules.ts OFFICIAL_2027)`, () => {
  if (today() < OFFICIAL_2027_DUE) return;
  assert.ok(
    OFFICIAL_2027 !== null,
    "Look up the 2027 SMI royal decree in the BOE (search 'salario mínimo interprofesional para 2027'), read its XML (articles 1, 3.1, 4.1, 4.2 and the final provision on effects) and fill OFFICIAL_2027 in src/lib/programmatic/smi/rules.ts. If it is still not published, re-read the Ministry of Labour and La Moncloa, update the status rows and move OFFICIAL_2027_DUE (2023–2026 decrees came out 7–23 February).",
  );
});

test("2027: OFFICIAL_2027 is RD 1013/2026 as the parser reads it from the BOE's own XML, and its quotes are in that text", () => {
  assert.ok(OFFICIAL_2027, "OFFICIAL_2027 is typed in");
  const xml = fixture("boe-smi-2027-rd1013.xml");
  const p = parseSmiDecree(xml, 2027);
  assert.ok(p, "the RD 1013/2026 fixture parses");
  assert.deepEqual(
    { boeId: p.boeId, norm: p.norm, published: p.published, monthly: p.monthly, daily: p.daily, annual: p.annual, domesticHourly: p.domesticHourly, temporaryDaily: p.temporaryDaily, effectiveFrom: p.effectiveFrom },
    { boeId: OFFICIAL_2027.boeId, norm: OFFICIAL_2027.norm, published: OFFICIAL_2027.published, monthly: OFFICIAL_2027.monthly, daily: OFFICIAL_2027.daily, annual: OFFICIAL_2027.annual, domesticHourly: OFFICIAL_2027.domesticHourly, temporaryDaily: OFFICIAL_2027.temporaryDaily, effectiveFrom: OFFICIAL_2027.effectiveFrom },
  );
  assert.ok(Math.abs(OFFICIAL_2027.annual - OFFICIAL_2027.monthly * 14) < 0.001);
  const flat = xml.replace(/<[^>]+>/g, " ").replace(/[\s  ]+/g, " ");
  for (const q of [QUOTE.rd1013effects, QUOTE.rd1013competence, QUOTE.rd1013partTime, QUOTE.rd1013annual, QUOTE.rd1013domestic]) assert.ok(flat.includes(q), q.slice(0, 60));
  assert.equal(smi2027Status(null).kind, "official", "the page no longer depends on the live BOE answer");
});

test(`date guard: the 2027 status (draft, hearing, Council of Ministers) is re-read by ${STATUS_RECHECK_BY}`, () => {
  if (OFFICIAL_2027 !== null) return;
  assert.ok(
    today() <= STATUS_RECHECK_BY,
    "Re-read the SMI 2027 status on official sources only (expinterweb.mites.gob.es/participa, Consejo de Ministros references at lamoncloa.gob.es, the BOE) and update DRAFT_2027 / the status rows in SmiPage.tsx, SMI_RULES_AS_OF and STATUS_RECHECK_BY.",
  );
});

/* -------------------------------------------------------------------------- */
/* The official figures                                                       */
/* -------------------------------------------------------------------------- */

test("history: 2018–2026, one decree a year, yearly = monthly × 14, daily ≈ monthly ÷ 30, BOE ids and links", () => {
  assert.deepEqual(SMI_HISTORY.map((y) => y.year), [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]);
  for (const y of SMI_HISTORY) {
    assert.ok(Math.abs(y.annual - y.monthly * 14) < 0.001, `${y.year}: ${y.annual} ≠ ${y.monthly} × 14`);
    assert.ok(Math.abs(y.daily - y.monthly / 30) < 0.01, `${y.year}: daily`);
    assert.match(y.boeId, /^BOE-A-\d{4}-\d+$/);
    assert.ok(y.published < `${y.year + 1}-01-01` && y.published >= `${y.year - 1}-12-01`, `${y.year}: published ${y.published}`);
    assert.match(y.norm, /^Real Decreto \d+\/\d{4}, de \d{1,2} de [a-z]+$/);
    assert.equal(boeUrl(y), `https://www.boe.es/buscar/act.php?id=${y.boeId}`);
  }
  for (let i = 1; i < SMI_HISTORY.length; i++) assert.ok(SMI_HISTORY[i]!.monthly > SMI_HISTORY[i - 1]!.monthly);
  assert.deepEqual(
    { monthly: SMI_2026.monthly, daily: SMI_2026.daily, annual: SMI_2026.annual, hour: SMI_2026.domesticHourly, temp: SMI_2026.temporaryDaily, boe: SMI_2026.boeId },
    { monthly: 1221, daily: 40.7, annual: 17094, hour: 9.55, temp: 57.82, boe: "BOE-A-2026-3815" },
  );
  assert.equal(prorated12(SMI_2026), 1424.5);
  assert.equal(increaseOn(SMI_HISTORY[7]!, SMI_2026), 3.1); // "Con esta subida del 3,1 por ciento" (RD 126/2026, preamble)
  assert.equal(SMI_HISTORY.find((y) => y.year === 2021)!.effectiveFrom, "2021-09-01");
});

test("history: the parser reads the same figures from the BOE's own XML of RD 1077/2017, RD 817/2021 and RD 126/2026", () => {
  const cases = [
    ["boe-smi-2018-rd1077.xml", 2018],
    ["boe-smi-2021-rd817.xml", 2021],
    ["boe-smi-2026-rd126.xml", 2026],
  ] as const;
  for (const [file, year] of cases) {
    const row = SMI_HISTORY.find((y) => y.year === year)!;
    // 2018 has no earlier row here: any floor below its amount does for the range check.
    const prev = SMI_HISTORY.find((y) => y.year === year - 1) ?? { monthly: row.monthly * 0.95 };
    const p = parseSmiDecree(fixture(file), year, prev);
    assert.ok(p, `${file} did not parse`);
    assert.deepEqual(
      { boeId: p.boeId, norm: p.norm, published: p.published, monthly: p.monthly, daily: p.daily, annual: p.annual, domesticHourly: p.domesticHourly, temporaryDaily: p.temporaryDaily, effectiveFrom: p.effectiveFrom },
      { boeId: row.boeId, norm: row.norm, published: row.published, monthly: row.monthly, daily: row.daily, annual: row.annual, domesticHourly: row.domesticHourly, temporaryDaily: row.temporaryDaily, effectiveFrom: row.effectiveFrom },
      file,
    );
  }
});

test("quotes: the RD 126/2026 sentences are in the BOE text, and the draft figures are in the Ministry's draft", () => {
  const flat = RD126.replace(/<[^>]+>/g, " ").replace(/[\s  ]+/g, " ");
  for (const q of [QUOTE.rd126art1, QUOTE.rd126partTime, QUOTE.rd126annual, QUOTE.rd126domestic, QUOTE.rd126effects]) {
    assert.ok(flat.includes(q.replace(/[\s  ]+/g, " ")), q.slice(0, 60));
  }
  const draft = fixture("mites-smi-2027-draft.txt").replace(/\s+/g, " ");
  assert.ok(draft.includes(QUOTE.draftArt1), "draft art. 1");
  assert.ok(draft.includes("inferior a 18 004 euros"));
  assert.ok(draft.includes("10,06 euros por hora"));
  assert.ok(draft.includes("inferior a 60,88 euros por jornada"));
  assert.ok(draft.includes("incremento del 5,3 por ciento"));
  assert.ok(draft.includes("Informe presentado el 3 de noviembre de 2026 por la Comisión Asesora"));
  assert.ok(draft.includes("entrará en vigor el 1 de enero de 2027"));
  assert.equal(DRAFT_2027.annual, DRAFT_2027.monthly * 14);
  assert.equal(DRAFT_2027.committee.annual, DRAFT_2027.committee.monthly * 14);
  assert.ok(DRAFT_2027.hearingFrom <= DRAFT_2027.hearingTo && DRAFT_2027.published <= DRAFT_2027.hearingFrom);
  assert.ok(SMI_RULES_AS_OF <= today());
  for (const n of Object.values(NORMS)) assert.match(n.url, /^https:\/\/www\.boe\.es\//);
});

/* -------------------------------------------------------------------------- */
/* Reading the 2027 decree from the BOE                                       */
/* -------------------------------------------------------------------------- */

test("BOE: the title test takes the decree and nothing that merely cites it", () => {
  assert.ok(isSmiDecreeTitle("Real Decreto 126/2026, de 18 de febrero, por el que se fija el salario mínimo interprofesional para 2026.", 2026));
  assert.ok(!isSmiDecreeTitle("Real Decreto 126/2026, de 18 de febrero, por el que se fija el salario mínimo interprofesional para 2026.", 2027));
  assert.ok(!isSmiDecreeTitle("Corrección de errores del Real Decreto 3/2027, de 12 de enero, por el que se fija el salario mínimo interprofesional para 2027.", 2027));
  assert.ok(!isSmiDecreeTitle("REAL DECRETO /2026, de X de X, por el que se fija el salario mínimo interprofesional para 2027.", 2027));
  assert.equal(boeNumber("1 221"), 1221);
  assert.equal(boeNumber("1.000"), 1000);
  assert.equal(boeNumber("10.302,6"), 10302.6);
  assert.equal(boeNumber("16 576"), 16576);
});

test("BOE: finds the decree in the legislation search answer and in a day's summary; an empty answer is no decree", () => {
  const search = { status: { code: "200" }, data: [{ identificador: "BOE-A-2027-1234", titulo: "Real Decreto 3/2027, de 12 de enero, por el que se fija el salario mínimo interprofesional para 2027.", fecha_publicacion: "20270113" }] };
  assert.deepEqual(findSmiDecree(search, 2027), { boeId: "BOE-A-2027-1234", title: "Real Decreto 3/2027, de 12 de enero, por el que se fija el salario mínimo interprofesional para 2027", published: "2027-01-13" });
  assert.equal(findSmiDecree({ status: { code: "200" }, data: "" }, 2027), null);
  const summary = { data: { sumario: { diario: [{ seccion: [{ departamento: [{ nombre: "MINISTERIO DE TRABAJO Y ECONOMÍA SOCIAL", epigrafe: [{ item: { identificador: "BOE-A-2027-1234", titulo: "Real Decreto 3/2027, de 12 de enero, por el que se fija el salario mínimo interprofesional para 2027." } }] }] }] }] } } };
  assert.equal(findSmiDecree(summary, 2027, "2027-01-13")?.published, "2027-01-13");
  // The 2026 decree is never mistaken for 2027's.
  assert.equal(findSmiDecree({ data: [{ identificador: "BOE-A-2026-3815", titulo: "Real Decreto 126/2026, de 18 de febrero, por el que se fija el salario mínimo interprofesional para 2026.", fecha_publicacion: "20260219" }] }, 2027), null);
});

test("BOE: a 2027 decree's XML parses; inconsistent figures do not (the page then prints none)", () => {
  const ok = parseSmiDecree(fake2027(), 2027);
  assert.deepEqual(ok && { m: ok.monthly, d: ok.daily, a: ok.annual, h: ok.domesticHourly, t: ok.temporaryDaily, norm: ok.norm, from: ok.effectiveFrom, pub: ok.published }, { m: 1286, d: 42.87, a: 18004, h: 10.06, t: 60.88, norm: "Real Decreto 3/2027, de 12 de enero", from: "2027-01-01", pub: "2027-01-13" });
  assert.equal(parseSmiDecree(fake2027("1 286", "42,87", "17 004"), 2027), null, "yearly ≠ monthly × 14");
  assert.equal(parseSmiDecree(fake2027("1 100", "36,67", "15 400"), 2027), null, "below 2026");
  assert.equal(parseSmiDecree(RD126, 2027), null, "the 2026 decree is not 2027's");
});

test("BOE loader: draft when the BOE has nothing, official the day it does, draft (unchecked) when it is down", async () => {
  const now = new Date("2027-01-13T09:00:00Z");
  const asked: string[] = [];
  const respond = (body: unknown, status = 200, text = false) => new Response(text ? String(body) : JSON.stringify(body), { status });
  const empty: Fetcher = async (url) => (asked.push(url), url.includes("sumario") ? respond({}, 404) : respond({ data: "" }));
  const none = await loadSmiBoe(now, empty);
  assert.deepEqual({ checked: none.checked, hit: none.hit, parsed: none.parsed }, { checked: true, hit: null, parsed: null });
  assert.ok(asked.includes(searchUrl()) && asked.includes(summaryUrl("2027-01-13")));
  assert.ok(decodeURIComponent(searchUrl()).includes('titulo:\\"salario mínimo interprofesional para 2027\\"'), decodeURIComponent(searchUrl()));

  const published: Fetcher = async (url) =>
    url === xmlUrl("BOE-A-2027-1234") ? respond(fake2027(), 200, true) : respond({ data: [{ identificador: "BOE-A-2027-1234", titulo: "Real Decreto 3/2027, de 12 de enero, por el que se fija el salario mínimo interprofesional para 2027.", fecha_publicacion: "20270113" }] });
  const live = await loadSmiBoe(now, published);
  const status = smi2027Status(live, null);
  assert.equal(status.kind, "official");
  assert.equal(status.kind === "official" && status.year.monthly, 1286);
  assert.equal(currentYear(status, "2027-01-13").year, 2027);
  assert.equal(currentYear(status, "2026-12-31").year, 2026);
  assert.equal(officialYears(status).at(-1)!.year, 2027);

  const badXml: Fetcher = async (url) => (url.includes("xml.php") ? respond("<documento/>", 200, true) : published(url));
  assert.equal(smi2027Status(await loadSmiBoe(now, badXml), null).kind, "published");

  const down: Fetcher = async () => {
    throw new Error("timeout");
  };
  const offline = await loadSmiBoe(now, down);
  assert.equal(offline.checked, false);
  assert.equal(smi2027Status(offline, null).kind, "draft");
});

/* -------------------------------------------------------------------------- */
/* Calculator                                                                 */
/* -------------------------------------------------------------------------- */

test("calculator: part time a prorrata, 12 vs 14 payments, domestic hours, invalid input", () => {
  const full = smiFor(SMI_2026, { weeklyHours: 40, fullTimeHours: 40, payments: 14 });
  assert.deepEqual(full, { status: "ok", share: 1, perPayment: 1221, monthlyAverage: 1424.5, yearly: 17094, daily: 40.7 });
  const twelve = smiFor(SMI_2026, { weeklyHours: 40, fullTimeHours: 40, payments: 12 });
  assert.equal(twelve.status === "ok" && twelve.perPayment, 1424.5);
  const half = smiFor(SMI_2026, { weeklyHours: 20, fullTimeHours: 40, payments: 14 });
  assert.deepEqual(half.status === "ok" && [half.perPayment, half.yearly, half.daily], [610.5, 8547, 20.35]);
  const agreement = smiFor(SMI_2026, { weeklyHours: 30, fullTimeHours: 37.5, payments: 12 });
  assert.equal(agreement.status === "ok" && agreement.perPayment, 1139.6);
  for (const bad of [{ weeklyHours: 0, fullTimeHours: 40 }, { weeklyHours: 41, fullTimeHours: 40 }, { weeklyHours: 20, fullTimeHours: 45 }, { weeklyHours: NaN, fullTimeHours: 40 }]) {
    assert.equal(smiFor(SMI_2026, { ...bad, payments: 14 }).status, "invalid", JSON.stringify(bad));
  }
  assert.deepEqual(domesticFor(SMI_2026, 10), { weekly: 95.5, monthly: 413.83 });
  assert.equal(domesticFor(SMI_2026, 0), null);
});

test("calculator: the net-salary link opens that calculator on the SMI (its hash preset)", () => {
  for (const l of SMI_LOCALES) {
    const href = netSalaryPreset(l, SMI_2026.annual, 14);
    const [path, hash] = href.split("#");
    assert.ok(existsSync(join(APP, path!.split("/")[2]!, path!.split("/")[3]!, "page.tsx")), href);
    const input = readHash(`#${hash}`, NET_DEFAULT, () => true);
    assert.equal(input.gross, 17094);
    assert.equal(input.payments, 14);
    assert.ok(CALC_COPY[l].net.length > 10);
  }
  assert.equal(readHash(`#${netSalaryPreset("es", 8547, 12).split("#")[1]}`, NET_DEFAULT, () => true).payments, 12);
});

test("page: the 2026 SMI in net (12 and 14 payments) from the net salary engine, with the DA 61.ª note and the preset link", () => {
  const src = readFileSync(join(import.meta.dirname, "..", "src", "components", "programmatic", "smi", "SmiPage.tsx"), "utf8");
  assert.match(src, /calculateNetSalary\(\{ \.\.\.NET_DEFAULT, gross: SMI_2026\.annual, payments: 14 \}\)/);
  assert.match(src, /calculateNetSalary\(\{ \.\.\.NET_DEFAULT, gross: SMI_2026\.annual, payments: 12 \}\)/);
  assert.match(src, /netSalaryPreset\(locale, SMI_2026\.annual, 14\)/);
  assert.equal(netSalaryPreset("es", SMI_2026.annual, 14), "/es/calculadoras/sueldo-neto/#b=17094&n=14");
  assert.match(src, /NORMS\.lirpfDa61/);
});

/* -------------------------------------------------------------------------- */
/* Page words, states and routes                                              */
/* -------------------------------------------------------------------------- */

test("page: draft state says the 2026 decree is the last in the BOE and never calls the draft official", () => {
  const status = smi2027Status(null, null);
  for (const l of SMI_LOCALES) {
    const m = smiMeta(l, status);
    assert.ok(m.title.length <= 60, `${l} title ${m.title.length}: ${m.title}`);
    assert.ok(m.description.length <= 165, `${l} description ${m.description.length}`);
    const lead = leadText(l, status, "2026-11-13");
    assert.ok(lead.includes(money(1221, l)) && lead.includes(money(1286, l)), lead);
    assert.ok(!/es oficial|és oficial|is official/i.test(lead), lead);
  }
  assert.match(leadText("es", status, "2026-11-13"), /está en audiencia pública hasta el 16 de noviembre de 2026/);
  assert.match(leadText("es", status, "2026-11-20"), /estuvo en audiencia pública/);
  assert.match(smiMeta("es", status).title, /proyecto/);
  assert.match(freshnessText("es", true, "2026-11-13"), /BOE consultado el 13 de noviembre de 2026/);
});

test("page: official and published states", async () => {
  const live: LiveBoe = { checked: true, hit: { boeId: "BOE-A-2027-1234", title: "Real Decreto 3/2027, de 12 de enero, por el que se fija el salario mínimo interprofesional para 2027", published: "2027-01-13" }, parsed: parseSmiDecree(fake2027(), 2027) };
  const official = smi2027Status(live, null);
  for (const l of SMI_LOCALES) {
    const m = smiMeta(l, official);
    assert.ok(m.title.length <= 60, `${l}: ${m.title}`);
    assert.ok(m.description.length <= 165, `${l} description ${m.description.length}`);
    assert.ok(leadText(l, official, "2027-01-13").includes(money(1286, l)));
  }
  assert.match(leadText("es", official, "2027-01-13"), /^Es oficial: .*Real Decreto 3\/2027, BOE del 13 de enero de 2027.*Sube un 5,3 %/);
  const published = smi2027Status({ ...live, parsed: null }, null);
  assert.equal(published.kind, "published");
  assert.ok(!leadText("es", published, "2027-01-13").includes(money(1286, "es")), "no figure without a parsed decree");
  for (const l of SMI_LOCALES) assert.ok(smiMeta(l, published).title.length <= 60);
});

test("routes: one static route per language, hourly revalidation, never dynamicParams = false; sitemap with hreflang", () => {
  const e = smiEditions();
  assert.deepEqual(e, { es: "/es/calculadoras/salario-minimo-2027/", ca: "/ca/calculadores/salari-minim-2027/", en: "/en/calculators/spain-minimum-wage-2027/" });
  for (const l of SMI_LOCALES) {
    const file = join(APP, CALCULATORS_ROOT[l], smiPath(l).split("/")[3]!, "page.tsx");
    const src = readFileSync(file, "utf8");
    assert.match(src, new RegExp(`const LOCALE = "${l}";`));
    assert.match(src, /^export const revalidate = 3600;$/m);
    assert.match(src, /^export const dynamicParams = true;$/m);
    assert.match(src, /if \(locale !== LOCALE\) notFound\(\);/);
  }
  const entries = smiSitemapEntries();
  assert.equal(entries.length, 3);
  for (const x of entries) assert.deepEqual(Object.keys(x.alternates!.languages!).sort(), ["ca", "en", "es", "x-default"]);
  assert.match(readFileSync(join(ROOT, "src/app/sitemap.ts"), "utf8"), /\.\.\.smiSitemapEntries\(\)/);
  assert.match(readFileSync(join(ROOT, "src/lib/seo/llms.ts"), "utf8"), /hubs: smiEditions\(\)/);
  assert.match(readFileSync(join(ROOT, "src/components/programmatic/smi/SmiPage.tsx"), "utf8"), /<MoreCalculators current="smi-2027" locale=\{locale\} \/>/);
  assert.match(readFileSync(join(ROOT, "src/components/programmatic/smi/SmiPage.tsx"), "utf8"), /hubCrumb\(locale\),/);
});

/* -------------------------------------------------------------------------- */
/* "How is the SMI calculated": 12 payments, part time, per hour              */
/* -------------------------------------------------------------------------- */

test(`date guard: the how-to's examples are the 2027 decree's; re-read before ${SMI_HOWTO_REREAD_BY}`, () => {
  assert.ok(
    today() < SMI_HOWTO_REREAD_BY,
    `From ${SMI_HOWTO_REREAD_BY}: the "¿Cómo se calcula el SMI?" section (smi/howto.ts, SmiPage.tsx) still quotes RD 1013/2026 for 2027. Read the 2028 decree in the BOE (QUOTE.rd1013*), point the section at it and move SMI_HOWTO_READ and SMI_HOWTO_REREAD_BY.`,
  );
  assert.ok(SMI_HOWTO_READ <= today(), "the read day is not in the future");
});

test("how-to: the figures are the calculator's own, pinned (RD 1013/2026: 1.286 × 14 = 18.004; 12 payments 1.500,33)", () => {
  assert.ok(OFFICIAL_2027);
  assert.deepEqual(HOWTO_PART_TIME, [
    [20, 40],
    [30, 37.5],
  ]);
  // 20 h of 40 (50 %): half of 1.286 = 643, half of 18.004 ÷ 12 = 750,17, half of 18.004 = 9.002.
  const a14 = smiFor(OFFICIAL_2027, { weeklyHours: 20, fullTimeHours: 40, payments: 14 });
  const a12 = smiFor(OFFICIAL_2027, { weeklyHours: 20, fullTimeHours: 40, payments: 12 });
  assert.ok(a14.status === "ok" && a12.status === "ok");
  assert.deepEqual([a14.perPayment, a12.perPayment, a14.yearly], [643, 750.17, 9002]);
  // 30 h of a 37,5 h agreement (80 %): 1.028,80 / 1.200,27 / 14.403,20.
  const b14 = smiFor(OFFICIAL_2027, { weeklyHours: 30, fullTimeHours: 37.5, payments: 14 });
  const b12 = smiFor(OFFICIAL_2027, { weeklyHours: 30, fullTimeHours: 37.5, payments: 12 });
  assert.ok(b14.status === "ok" && b12.status === "ok");
  assert.deepEqual([b14.perPayment, b12.perPayment, b14.yearly], [1028.8, 1200.27, 14403.2]);
  assert.equal(prorated12(OFFICIAL_2027), 1500.33);
  assert.equal(OFFICIAL_2027.monthly * 14, OFFICIAL_2027.annual);
  assert.deepEqual(domesticFor(OFFICIAL_2027, HOWTO_DOMESTIC_HOURS), { weekly: 100.6, monthly: 435.93 });
});

test("how-to: the section prints those figures in es, ca and en, from the same functions", () => {
  assert.ok(OFFICIAL_2027);
  const es = smiHowTo("es", OFFICIAL_2027);
  assert.equal(es.heading, "¿Cómo se calcula el SMI de 2027? En 12 pagas, a media jornada y por hora");
  assert.equal(es.yearly, "El decreto fija 1.286 € al mes (art. 1; 42,87 € por día) y un mínimo anual de 18.004 € (art. 3.1). Es lo mismo que 14 pagas: 1.286 € × 14 = 18.004 €.");
  assert.match(smiHowTo("ca", OFFICIAL_2027).yearly, /^El decret fixa 1\.286 € al mes \(art\. 1; 42,87 € per dia\) i un mínim anual de 18\.004 € \(art\. 3\.1\)\. És el mateix que 14 pagues/);
  assert.match(smiHowTo("en", OFFICIAL_2027).yearly, /^The decree sets €1,286 a month \(art\. 1; €42\.87 a day\) and a yearly minimum of €18,004 \(art\. 3\.1\)\. That equals 14 payments/);
  for (const l of SMI_LOCALES) assert.ok(!/simulad|simulator/i.test(smiHowTo(l, OFFICIAL_2027).source), `${l}: no unsourced claim about simulators`);
  assert.match(es.twelve, /18\.004 € ÷ 12 = 1\.500,33 € al mes/);
  assert.deepEqual(es.examples, [
    "20 horas a la semana con una jornada completa de 40 (50 %): 643 € en cada una de las 14 pagas, 750,17 € al mes en 12 pagas y 9.002 € al año.",
    "30 horas a la semana con una jornada completa de 37,5 (80 %): 1.028,80 € en cada una de las 14 pagas, 1.200,27 € al mes en 12 pagas y 14.403,20 € al año.",
  ]);
  assert.match(es.hourly, /10,06 € por hora efectivamente trabajada \(art\. 4\.2\).* 10 horas a la semana son 100,60 € a la semana, unos 435,93 € al mes/);
  assert.match(es.source, /Real Decreto 1013\/2026, BOE del 19 de noviembre de 2026, texto leído en el BOE el 24 de noviembre de 2026/);

  const ca = smiHowTo("ca", OFFICIAL_2027);
  assert.equal(ca.heading, "Com es calcula l'SMI del 2027? En 12 pagues, a mitja jornada i per hora");
  assert.match(ca.twelve, /18\.004 € ÷ 12 = 1\.500,33 € al mes/);
  assert.equal(ca.examples[0], "20 hores a la setmana amb una jornada completa de 40 (50 %): 643 € a cadascuna de les 14 pagues, 750,17 € al mes en 12 pagues i 9.002 € l'any.");
  assert.match(ca.hourly, /10,06 € per hora efectivament treballada.*100,60 € a la setmana, uns 435,93 € al mes/);

  const en = smiHowTo("en", OFFICIAL_2027);
  assert.equal(en.heading, "How is the 2027 SMI worked out? In 12 payments, part time and per hour");
  assert.match(en.twelve, /€18,004 ÷ 12 = €1,500\.33 a month/);
  assert.equal(en.examples[1], "30 hours a week with a full-time week of 37.5 (80%): €1,028.80 in each of the 14 payments, €1,200.27 a month in 12 payments and €14,403.20 a year.");
  assert.match(en.hourly, /€10\.06 per hour actually worked \(art\. 4\.2\).*€100\.60 a week, about €435\.93 a month/);
});

test("how-to: the page renders the section for the typed decree, with the three BOE quotes and the BOE link", () => {
  const src = readFileSync(join(ROOT, "src", "components", "programmatic", "smi", "SmiPage.tsx"), "utf8");
  assert.match(src, /const howTo = decree27 \? smiHowTo\(locale, decree27\) : null;/);
  assert.match(src, /<h2 id="como-se-calcula">\{howTo\.heading\}<\/h2>/);
  for (const q of ["rd1013annual", "rd1013partTime", "rd1013domestic"]) assert.match(src, new RegExp(`<Quote>\\{QUOTE\\.${q}\\}</Quote>`), q);
  assert.match(src, /boeUrl\(decree27!\)/);
  // The quotes are the BOE's words, read in the XML fixture of the decree (the same bytes the BOE served on SMI_HOWTO_READ).
  const flat = fixture("boe-smi-2027-rd1013.xml").replace(/<[^>]+>/g, " ").replace(/[\s  ]+/g, " ");
  assert.ok(flat.includes(QUOTE.rd1013annual) && flat.includes(QUOTE.rd1013partTime) && flat.includes(QUOTE.rd1013domestic));
});
