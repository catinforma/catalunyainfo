import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { CALCULATORS_ROOT } from "../src/lib/programmatic/calculators/paths.ts";
import { CALC_COPY, SMI_LOCALES, money, netSalaryPreset, smiEditions, smiPath } from "../src/lib/programmatic/smi/copy.ts";
import { readHash } from "../src/lib/programmatic/net-salary/copy.ts";
import { DEFAULT_INPUT as NET_DEFAULT } from "../src/lib/programmatic/net-salary/engine.ts";
import { boeNumber, currentYear, domesticFor, findSmiDecree, increaseOn, isSmiDecreeTitle, officialYears, parseSmiDecree, prorated12, smi2027Status, smiFor, type LiveBoe } from "../src/lib/programmatic/smi/engine.ts";
import { freshnessText, leadText, smiMeta, smiSitemapEntries } from "../src/lib/programmatic/smi/page.ts";
import { DRAFT_2027, NORMS, OFFICIAL_2027, OFFICIAL_2027_DUE, QUOTE, SMI_2026, SMI_HISTORY, SMI_RULES_AS_OF, STATUS_RECHECK_BY, boeUrl } from "../src/lib/programmatic/smi/rules.ts";
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
