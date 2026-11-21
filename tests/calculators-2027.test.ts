import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { CALC_LOCALES, CALCULATOR_IDS } from "../src/lib/programmatic/calculators/paths.ts";
import {
  CALC_2027,
  CHECKED_2027,
  IRPF_SMI_DEDUCTION_2027,
  MEI_2027,
  OFFICIAL,
  PENDING,
  RDL38_CONVALIDATION_RECHECK_BY,
  SOLIDARITY_2026,
  SOLIDARITY_2027,
  SUBSIDY_INCOME_LIMIT_2027,
  WIDOW_BURDEN_2027,
  WIDOW_REMARRIAGE_2027,
  YEAR_2027_FROM,
  year2027NoticeOn,
  year2027Notices,
} from "../src/lib/programmatic/calculators/year-2027.ts";
import { SOCIAL_SECURITY } from "../src/lib/programmatic/net-salary/rules-2026.ts";
import { QUOTE as SELF_EMPLOYED_QUOTE, STATUS_2027 as SELF_EMPLOYED_2027 } from "../src/lib/programmatic/self-employed/rules-2026.ts";
import { OFFICIAL_2027 as SMI_2027 } from "../src/lib/programmatic/smi/rules.ts";
import { AGE_2027, AGE_2027_ANNEX } from "../src/lib/programmatic/working-days/rules.ts";

/**
 * 2027 across the calculators (lib/programmatic/calculators/year-2027.ts,
 * docs/CALCULATORS_2027.md): every registry tool is classified, every 2027
 * figure shown is in a BOE text (fixtures read on CHECKED_2027), the block
 * fails safe from each tool's guard date, and every pending figure has a day
 * by which someone looks at its official source again.
 */

const ROOT = join(import.meta.dirname, "..");
const fixture = (name: string) => readFileSync(join(ROOT, "tests/fixtures", name), "utf8");
const today = new Date().toISOString().slice(0, 10);
const OFFICIAL_HOSTS = /^https:\/\/(www\.)?(boe\.es|seg-social\.es|sepe\.es|sede\.agenciatributaria\.gob\.es|dogc\.gencat\.cat|bocm\.es|juntadeandalucia\.es|dogv\.gva\.es)\//;

test("every registry calculator has a 2027 status", () => {
  assert.deepEqual(Object.keys(CALC_2027).sort(), [...CALCULATOR_IDS].sort());
  for (const id of CALCULATOR_IDS) {
    const c = CALC_2027[id];
    if (c.kind === "self") {
      assert.ok(c.why && c.official.length === 0 && c.pending.length === 0, `${id}: a "self" tool says why and lists nothing`);
      assert.equal(year2027Notices(id, "es"), null, id);
      continue;
    }
    assert.ok(c.pending.length > 0, `${id}: what would change in 2027, and where`);
    if (c.kind === "yearly") assert.match(c.until ?? "", /^20\d\d-\d\d-\d\d$/, `${id}: yearly tools need the module's guard date`);
    for (const k of c.official) assert.ok(OFFICIAL[k], `${id}: ${k}`);
    for (const k of c.pending) assert.ok(PENDING[k], `${id}: ${k}`);
  }
});

test("fail-safe: from its guard date a yearly tool says its figures are 2026's, until when, and links the official source", () => {
  for (const id of CALCULATOR_IDS) {
    const c = CALC_2027[id];
    if (c.kind !== "yearly") continue;
    for (const locale of CALC_LOCALES) {
      const n = year2027NoticeOn(id, locale, c.until!);
      assert.ok(n, `${id} ${locale}`);
      assert.equal(n.tone, "warning");
      assert.match(n.title, /2026/);
      assert.match(n.intro, /2026/);
      // "in force until" the day before the guard date: 31 Dec 2026 for every tool on 2026 rules.
      if (c.until === "2027-01-01") assert.match(n.intro, /31 (de )?(diciembre|desembre|December) (de )?2026/, `${id} ${locale}`);
      assert.equal(n.pending.length, c.pending.length);
      for (const p of n.pending) assert.ok(p.links.length > 0 && p.links.every((l) => OFFICIAL_HOSTS.test(l.url)), `${id}: ${p.links.map((l) => l.url)}`);
      // The day before, no warning.
      const dayBefore = new Date(Date.parse(`${c.until}T12:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
      assert.notEqual(year2027NoticeOn(id, locale, dayBefore)?.tone, "warning", `${id} ${locale}`);
    }
  }
});

test("fail-safe: from 1 January 2027 a law-based tool read before then names its read date and where a change would appear", () => {
  for (const id of CALCULATOR_IDS) {
    if (CALC_2027[id].kind !== "law") continue;
    for (const locale of CALC_LOCALES) {
      const n = year2027NoticeOn(id, locale, YEAR_2027_FROM);
      assert.ok(n, `${id} ${locale}`);
      assert.match(n.title, /2026/, `${id} ${locale}: the read date`);
      assert.ok(n.pending.length > 0 && n.pending.every((p) => p.links.every((l) => OFFICIAL_HOSTS.test(l.url))), id);
    }
  }
});

test("before the switch, only tools with an official 2027 figure show a block, and it names the BOE check day", () => {
  for (const id of CALCULATOR_IDS) {
    const c = CALC_2027[id];
    if (c.kind === "self") continue;
    const n = year2027NoticeOn(id, "es", "2026-11-21");
    if (c.official.length === 0) {
      assert.equal(n, null, `${id}: nothing to show before the switch`);
    } else {
      assert.ok(n && n.tone === "info" && n.title === "Ya oficial para 2027", id);
      assert.match(n.intro, /21 de noviembre de 2026/);
      assert.equal(n.official.length, c.official.length);
    }
  }
});

test("every text exists in ca, es and en, and every source is official", () => {
  for (const f of Object.values(OFFICIAL)) {
    for (const l of CALC_LOCALES) assert.ok(f.text[l].length > 40, `${f.id} ${l}`);
    assert.notEqual(f.text.es, f.text.en);
    assert.ok(f.sources.every((s) => OFFICIAL_HOSTS.test(s.url)), f.id);
  }
  for (const p of Object.values(PENDING)) {
    for (const l of CALC_LOCALES) assert.ok(p.what[l] && p.instrument[l], `${p.id} ${l}`);
    assert.match(p.watch, OFFICIAL_HOSTS, p.id);
  }
  assert.ok(CHECKED_2027 <= today);
});

/* ------------------------------------------------- figures against the BOE --- */

test("SMI 2027 and the figures derived from it (RD 1013/2026, fixture of its XML)", () => {
  assert.ok(SMI_2027);
  const xml = fixture("boe-smi-2027-rd1013.xml");
  assert.match(xml, /42,87 euros\/día o\s1\s286 euros\/mes/);
  assert.match(xml, /18\s004 euros/);
  assert.deepEqual([SMI_2027.monthly, SMI_2027.annual, SMI_2027.daily], [1286, 18004, 42.87]);
  // LGSS art. 275: 75 % of the monthly SMI. Decreto 3158/1966 art. 31.2: 75 % of 12 months. Orden 13-2-1967 art. 11.1: twice the annual SMI.
  assert.equal(SUBSIDY_INCOME_LIMIT_2027, 964.5);
  assert.equal(WIDOW_BURDEN_2027, 11574);
  assert.equal(WIDOW_REMARRIAGE_2027, 36008);
  assert.match(OFFICIAL.subsidyIncome2027.text.es, /964,50 €/);
  assert.match(OFFICIAL.widowSmi2027.text.es, /11\.574 €.*36\.008 €/);
  assert.match(OFFICIAL.smi2027.text.en, /€1,286 a month/);
});

test("MEI and solidarity contribution 2027 are the LGSS's own rows (DT 43.ª and 42.ª)", () => {
  const text = fixture("boe-lgss-dt42-dt43.txt");
  assert.match(text, /En el año 2027, será de 1 punto porcentual, del que el 0,83 corresponderá a la empresa y el 0,17 al trabajador\./);
  assert.match(text, /^2027 \| 1,38 \| 1,5 \| 1,75$/m);
  assert.match(text, /^2026 \| 1,15 \| 1,25 \| 1,46$/m);
  assert.deepEqual(MEI_2027, { total: 1, employer: 0.83, worker: 0.17 });
  assert.deepEqual([...SOLIDARITY_2027], [1.38, 1.5, 1.75]);
  assert.deepEqual([...SOLIDARITY_2026], [1.15, 1.25, 1.46]);
  // The same law as the other modules print for 2026 and 2027.
  assert.equal(SELF_EMPLOYED_2027.intergenerationalEquity, MEI_2027.total);
  assert.match(SELF_EMPLOYED_QUOTE.lgssMei2027, /0,83 .* 0,17/);
  assert.equal(SOCIAL_SECURITY.rates.intergenerationalEquityTotal, 0.9);
  assert.match(OFFICIAL.mei2027Employee.text.es, /1 punto, de los que 0,17 paga el trabajador y 0,83 la empresa/);
  assert.match(OFFICIAL.solidarity2027.text.es, /1,38 %, 1,50 % y 1,75 %/);
});

test("IRPF 2027 earned-income deduction is RDL 38/2026 art. 5 and 6, word for word", () => {
  const text = fixture("boe-rdl38-2026-art5-6.txt");
  assert.match(text, /Con efectos desde el 1 de enero de 2027 se modifica la disposición adicional sexagésima primera/);
  assert.match(text, /iguales o inferiores a 18\.004 euros anuales: 1\.033,58 euros anuales/);
  assert.match(text, /inferiores a 23\.171,89 euros anuales/);
  assert.match(text, /multiplicar por 0,2 la diferencia/);
  assert.match(text, /superiores a 6\.500 euros/);
  assert.match(text, /Se añade un nuevo apartado 3 al artículo 85/);
  const d = IRPF_SMI_DEDUCTION_2027;
  assert.deepEqual([d.full, d.fullUpTo, d.endBelow, d.slope, d.otherIncomeMax], [1033.58, 18004, 23171.89, 0.2, 6500]);
  // The taper reaches zero at the upper limit, as in the norm.
  assert.ok(Math.abs(d.full - d.slope * (d.endBelow - d.fullUpTo)) < 0.01);
  assert.equal(d.fullUpTo, SMI_2027!.annual);
});

test("the AGE 2027 calendar of días inhábiles in the code is the BOE annex (BOE-A-2026-23826)", () => {
  assert.equal(AGE_2027?.ref, "BOE-A-2026-23826");
  const text = fixture("boe-age-2027-dias-inhabiles.txt");
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const dates: string[] = [];
  let month = 0;
  for (const line of text.split("\n")) {
    const mm = months.findIndex((m) => line.startsWith(`${m}:`));
    if (mm >= 0) month = mm + 1;
    const d = /^Día (\d+):/.exec(line);
    if (d) dates.push(`2027-${String(month).padStart(2, "0")}-${(d[1] ?? "").padStart(2, "0")}`);
  }
  assert.deepEqual(dates, AGE_2027_ANNEX.map((r) => r.date));
  for (const r of AGE_2027_ANNEX.filter((r) => r.where === "ALL")) {
    const [, mo, dd] = r.date.split("-");
    assert.ok(text.includes(`Día ${Number(dd)}: Inhábil en todo el territorio nacional.`), r.date);
    assert.ok(Number(mo) >= 1);
  }
});

/* ---------------------------------------------------------- date guards --- */

test("watch-list: every pending 2027 figure is looked for again by its recheck day", () => {
  for (const p of Object.values(PENDING)) {
    assert.ok(
      today <= p.recheckBy,
      `${p.id} still pending on ${today}: read ${p.watch} (${p.instrument.es}). If the 2027 figure is out, load it in the calculator's module and move it to OFFICIAL (or drop the tool to "self"); if not, move recheckBy and say so in docs/CALCULATORS_2027.md.`,
    );
  }
});

test("RDL 38/2026 (IRPF deduction 2027) convalidation is re-read in the BOE before its 30 days run out", () => {
  assert.ok(
    today < RDL38_CONVALIDATION_RECHECK_BY,
    "Search the BOE for the Congress resolution on Real Decreto-ley 38/2026 (convalidación or derogación). Convalidated: drop OFFICIAL.irpfSmi2027.caveat and this guard. Derogated: remove irpfSmi2027 from CALC_2027 and the doc.",
  );
});
