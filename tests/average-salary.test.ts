import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { HUB_GROUPS } from "../src/lib/programmatic/calculators/hub.ts";
import { CSV_ATTRIBUTION, CSV_PATH, salaryCsv } from "../src/lib/programmatic/average-salary/csv.ts";
import {
  AGE_LABEL,
  AGE5_LABEL,
  CATALAN_NAMES,
  DIST_LABEL,
  OCCUPATION_LEVEL_LABEL,
  REGION_LABEL,
  SECTOR_LABEL,
  SEX_LABEL,
  WAGE_LOCALES,
  WORKDAY_LABEL,
  cellText,
  euros,
  inRegion,
  netSalaryLink,
  wageEditions,
} from "../src/lib/programmatic/average-salary/copy.ts";
import { EAES_CALENDAR_RECHECK_BY, SALARY_SNAPSHOT as S } from "../src/lib/programmatic/average-salary/data.ts";
import { decileOf, find, finderData, percentileBand, regionRanking } from "../src/lib/programmatic/average-salary/engine.ts";
import {
  AGE_BANDS,
  AGE_BANDS_5,
  OCCUPATION_LEVELS,
  REGION_IDS,
  SECTORS,
  SEXES,
  TABLES,
  WORKDAYS,
  parseCalendar,
  parseModal,
  parseTable,
  releaseStatus,
  toCell,
} from "../src/lib/programmatic/average-salary/ine.ts";
import { headline, leadText, releaseText, wageFaq, wageMeta, wageSitemapEntries } from "../src/lib/programmatic/average-salary/page.ts";
import { madridDay } from "../src/lib/programmatic/rent-update/ine.ts";

/**
 * "Salario medio en España" (lib/programmatic/average-salary): the committed
 * INE snapshot against the INE's own press releases, the freshness guards,
 * the finder's arithmetic, the CSV and the page words.
 */

const ROOT = join(import.meta.dirname, "..");
const today = () => madridDay(new Date());

/* ------------------------------------------------------------ Freshness --- */

test("freshness: the EPA wage deciles are refreshed the day after the INE's scheduled release", () => {
  const next = S.epa.next;
  if (!next) return;
  assert.ok(
    today() <= next.day,
    `The INE calendar (publication 348) scheduled the EPA wage deciles for ${next.year} on ${next.day}; the snapshot still holds ${S.epa.year}. Run \`npm run salary:snapshot -- build\`, check the page (deciles table, finder, FAQ, llms.txt) and commit the snapshot and public/datos/salario-medio-ine.csv.`,
  );
});

test("freshness: the next EAES release is in the snapshot, or the INE calendar is re-read by the recheck day", () => {
  const next = S.eaes.next;
  if (next) {
    assert.ok(
      today() <= next.day,
      `The INE calendar (publication 163) scheduled the Encuesta Anual de Estructura Salarial ${next.year} on ${next.day}; the snapshot still holds ${S.eaes.year}. Run \`npm run salary:snapshot -- build\`, re-read the press release (modal wage, headline sentences), check the page and commit.`,
    );
    return;
  }
  assert.ok(
    today() < EAES_CALENDAR_RECHECK_BY,
    `The snapshot has no date for the EAES ${S.eaes.year + 1} (INE calendar 163 listed none on ${S.asOf}). Run \`npm run salary:snapshot -- check\`; when the calendar lists it, \`build\` and commit; if it still does not, move EAES_CALENDAR_RECHECK_BY in average-salary/data.ts forward (at most to the next 28 May).`,
  );
});

/* ------------------------------------------------ The INE's own figures --- */

test("snapshot: EAES 2024 as the INE printed it in its press release of 28 May 2026", () => {
  assert.equal(S.eaes.year, 2024);
  assert.equal(S.eaes.released, "2026-05-28");
  const es = S.eaes.dist.es;
  // "El salario medio anual fue de 29.540,26 euros por trabajador en 2024, un 5,3% mayor que el del año anterior. El de las mujeres fue de 26.904,90 euros y el de los hombres de 32.057,55."
  assert.deepEqual(es.both.mean, { v: 29540.26 });
  assert.deepEqual(es.women.mean, { v: 26904.9 });
  assert.deepEqual(es.men.mean, { v: 32057.55 });
  // "el salario mediano … presentó un valor de 24.497,17 euros en 2024."
  assert.deepEqual(es.both.median, { v: 24497.17 });
  // "El salario modal (el que tuvo mayor frecuencia, con un 3,8% de los asalariados) se situó en 16.520,18 euros."
  assert.deepEqual(S.eaes.modal, { value: 16520.18, share: 3.8 });
  // "País Vasco (35.170,28 euros por trabajador), Comunidad de Madrid (34.410,01) y Comunidad Foral de Navarra (32.605,28)… Extremadura (24.979,44 euros), Canarias (25.120,38) y Castilla-La Mancha (26.062,05)"
  const h = headline(S);
  assert.deepEqual(h.top.map((r) => [r.region, r.mean]), [["pais-vasco", 35170.28], ["madrid", 34410.01], ["navarra", 32605.28]]);
  assert.deepEqual(h.bottom.map((r) => [r.region, r.mean]), [["extremadura", 24979.44], ["canarias", 25120.38], ["castilla-la-mancha", 26062.05]]);
  // INE's rounding of the change and of the women/men ratio: "un 5,3% mayor", "el 83,9% del masculino".
  assert.equal(h.change, 5.3);
  assert.equal(h.womenShareOfMen, 83.9);
  // "Suministro de energía eléctrica… con 57.931,81 euros… Hostelería… 17.653,42"; "Directores y gerentes (63.865,45 euros)… Trabajadores no cualificados en servicios (excepto transportes) fue de 16.062,57 euros"
  assert.deepEqual(S.eaes.sections.find((r) => r.code === "D")?.values.both, { v: 57931.81 });
  assert.deepEqual(S.eaes.sections.find((r) => r.code === "I")?.values.both, { v: 17653.42 });
  assert.deepEqual(S.eaes.occupations.find((r) => r.code === "A")?.values.both, { v: 63865.45 });
  assert.deepEqual(S.eaes.occupations.find((r) => r.code === "O")?.values.both, { v: 16062.57 });
});

test("snapshot: EPA wage deciles 2024 as the INE printed them on 14 Nov 2025", () => {
  assert.equal(S.epa.year, 2024);
  assert.equal(S.epa.released, "2025-11-14");
  // "El salario medio mensual (en términos brutos) fue de 2.385,6 euros"; "el salario mediano… se situó en 2.001,4 euros"
  assert.equal(S.epa.means.all, 2385.6);
  assert.equal(S.epa.deciles.find((d) => d.decile === 6)?.lower, 2001.4);
  // "El 40% de los asalariados ganó entre 1.582,2 y menos de 2.659,8 euros."
  assert.equal(S.epa.deciles.find((d) => d.decile === 4)?.lower, 1582.2);
  assert.equal(S.epa.deciles.find((d) => d.decile === 8)?.lower, 2659.8);
  assert.equal(S.epa.deciles.length, 10);
  assert.equal(S.epa.deciles[0]!.lower, null);
  // The INE calendar (publication 348) on 18 Nov 2026: the 2025 deciles on 25 Nov 2026.
  assert.deepEqual(S.epa.next, { year: 2025, day: "2026-11-25" });
});

test("snapshot: every community × sex × key cell exists; INE's low-sample flags are kept, nothing is filled in", () => {
  for (const r of REGION_IDS) {
    for (const s of SEXES) {
      for (const k of ["mean", "p10", "q1", "median", "q3", "p90"] as const) assert.ok(k in S.eaes.dist[r][s], `${r} ${s} ${k}`);
      for (const k of AGE_BANDS) assert.ok(k in S.eaes.ageRegion[r][s]);
      for (const k of SECTORS) assert.ok(k in S.eaes.sectorRegion[r][s]);
      for (const k of OCCUPATION_LEVELS) assert.ok(k in S.eaes.occupationRegion[r][s]);
      // The percentiles of every community and sex are published and ordered.
      const d = S.eaes.dist[r][s];
      const p = [d.p10, d.q1, d.median, d.q3, d.p90].map((c) => c?.v ?? NaN);
      for (let i = 1; i < p.length; i++) assert.ok(p[i]! > p[i - 1]!, `${r} ${s} percentiles not increasing`);
    }
  }
  // INE's "-" before the figure: women under 20, Spain (table 28189).
  assert.deepEqual(S.eaes.ageNational.women.u20, { v: 9280.82, low: true });
  // Military occupations: no figure (fewer than 100 observations).
  assert.equal(S.eaes.occupations.find((r) => r.code === "Q")?.values.both, null);
  for (const w of WORKDAYS) assert.ok(S.eaes.workday.both[w]);
});

/* ----------------------------------------------------------------- Parsing --- */

test("parsing: the sign convention, the calendar and the press-release sentence", () => {
  assert.deepEqual(toCell(-9280.82), { v: 9280.82, low: true });
  assert.deepEqual(toCell(12.5), { v: 12.5 });
  assert.equal(toCell(null), null);
  const ms = (iso: string) => Date.parse(`${iso}T09:00:00Z`);
  const cal = parseCalendar(
    [
      { Nombre: "Encuesta Anual de Estructura Salarial. Avance 2022", Anyo: 2022, Fecha: ms("2024-06-20") },
      { Nombre: "Encuesta Anual de Estructura Salarial. Definitivos 2022", Anyo: 2022, Fecha: ms("2024-09-23") },
      { Nombre: "Encuesta Anual de Estructura Salarial. Definitivos 2023", Anyo: 2023, Fecha: ms("2025-05-28") },
      { Nombre: "Encuesta Anual de Estructura Salarial. Definitivos 2024", Anyo: 2024, Fecha: ms("2026-05-28") },
    ],
    madridDay,
  );
  assert.deepEqual(releaseStatus(cal, "2026-11-18"), { year: 2024, released: "2026-05-28", next: null });
  assert.deepEqual(releaseStatus(cal, "2026-01-10"), { year: 2023, released: "2025-05-28", next: { year: 2024, day: "2026-05-28" } });
  assert.deepEqual(releaseStatus(cal, "2024-07-01").released, "2024-06-20");
  assert.deepEqual(releaseStatus(cal, "2024-10-01").released, "2024-09-23");
  assert.deepEqual(parseModal("<p>El salario modal (el que tuvo mayor frecuencia, con un 3,8% de los asalariados) se situó en 16.520,18 euros. El</p>"), { value: 16520.18, share: 3.8 });
  assert.equal(parseModal("nothing here"), null);
  assert.throws(() => parseTable([{ COD: "X", Data: [] }]), /MetaData/);
});

/* ------------------------------------------------------------------ Engine --- */

test("engine: EPA decile of a monthly wage, at and around each lower limit", () => {
  const d = S.epa.deciles;
  assert.equal(decileOf(0, d), 1);
  assert.equal(decileOf(1068.8, d), 1);
  assert.equal(decileOf(1068.9, d), 2);
  assert.equal(decileOf(1582.1, d), 3);
  assert.equal(decileOf(1582.2, d), 4);
  assert.equal(decileOf(2001.4, d), 6);
  assert.equal(decileOf(4056.7, d), 10);
  assert.equal(decileOf(100000, d), 10);
});

test("engine: the percentile band of a yearly salary", () => {
  const es = S.eaes.dist.es.both;
  assert.deepEqual(percentileBand(5000, es), { from: 0, to: 10, below: null, above: "p10" });
  assert.deepEqual(percentileBand(24497.17, es), { from: 50, to: 75, below: "median", above: "q3" });
  assert.deepEqual(percentileBand(30000, es), { from: 50, to: 75, below: "median", above: "q3" });
  assert.deepEqual(percentileBand(60000, es), { from: 90, to: 100, below: "p90", above: null });
});

test("engine: the finder on its default case and on a group", () => {
  const data = finderData(S);
  const r = find({ region: "es", sex: "both", age: "all", sector: "all", occupation: "all", salary: 30000 }, data);
  assert.equal(r.position?.monthly, 2500);
  // 30,000 / 12 = 2,500 a month: from decile 7's lower limit (2,265.4) to under decile 8's (2,659.8).
  assert.equal(r.position?.decile, 7);
  assert.equal(r.position?.decileFrom, 2265.4);
  assert.equal(r.position?.decileTo, 2659.8);
  const g = find({ region: "cataluna", sex: "women", age: "25-34", sector: "services", occupation: "high", salary: null }, data);
  assert.equal(g.position, null);
  assert.deepEqual(g.dist.mean, S.eaes.dist.cataluna.women.mean);
  assert.deepEqual(g.age, S.eaes.ageRegion.cataluna.women["25-34"]);
  assert.deepEqual(g.sector, S.eaes.sectorRegion.cataluna.women.services);
  assert.deepEqual(g.occupation, S.eaes.occupationRegion.cataluna.women.high);
  // Nonsense salaries are ignored, not placed.
  assert.equal(find({ ...r.input, salary: -5 }, data).position, null);
  assert.equal(find({ ...r.input, salary: 1e9 }, data).position, null);
  assert.equal(regionRanking(S).length, 17);
});

/* --------------------------------------------------------------------- CSV --- */

test("CSV: the committed file is exactly the snapshot's, every row attributed to the INE with its table and release day", () => {
  const file = readFileSync(join(ROOT, "public", CSV_PATH), "utf8");
  assert.equal(file, salaryCsv(S), "public/datos/salario-medio-ine.csv is not the snapshot's: run `npm run salary:snapshot -- build`.");
  const lines = file.replace(/^﻿/, "").trimEnd().split("\r\n");
  assert.equal(lines[0], "fuente,operacion,tabla_ine,url_tabla,anyo,publicado_ine,territorio,sexo,desglose,categoria,medida,unidad,valor,nota");
  for (const line of lines.slice(1)) assert.ok(line.startsWith(`${CSV_ATTRIBUTION},`), line);
  assert.ok(lines.some((l) => l.includes(",28191,") && l.includes(",Total Nacional,Ambos sexos,Total,,Media,euros brutos al año,29540.26,")));
  assert.ok(lines.some((l) => l.includes(",66252,") && l.includes(",Decil,6,Límite inferior,euros brutos al mes,2001.4,")));
  assert.ok(lines.some((l) => l.includes("Menos de 20 años") && l.includes("9280.82") && l.includes("gran variabilidad")));
});

/* ----------------------------------------------------------- Words, links --- */

test("copy: every label in ca, es and en; Catalan names for every INE section and occupation code", () => {
  for (const l of WAGE_LOCALES) {
    for (const map of [REGION_LABEL, SEX_LABEL, DIST_LABEL, AGE_LABEL, AGE5_LABEL, SECTOR_LABEL, OCCUPATION_LEVEL_LABEL, WORKDAY_LABEL] as Record<string, Record<string, string>>[]) {
      for (const [k, v] of Object.entries(map)) assert.ok(v[l]?.trim(), `${k} (${l})`);
    }
  }
  for (const r of REGION_IDS) assert.ok(REGION_LABEL[r]);
  for (const a of AGE_BANDS_5) assert.ok(AGE5_LABEL[a]);
  for (const row of S.eaes.sections) assert.ok(CATALAN_NAMES.sections[row.code], `section ${row.code}`);
  for (const row of S.eaes.occupations) assert.ok(CATALAN_NAMES.occupations[row.code], `occupation ${row.code}`);
  assert.equal(euros(29540.26, "es"), "29.540,26 €");
  assert.equal(euros(29540.26, "en"), "€29,540.26");
  assert.equal(euros(2385.6, "ca", 1), "2.385,6 €");
  assert.equal(cellText({ v: 9280.82, low: true }, "es"), "9.280,82 € *");
  assert.equal(cellText(null, "es"), "—");
  assert.equal(inRegion("pais-vasco", "en"), "in the Basque Country");
  assert.equal(inRegion("pais-vasco", "ca"), "al País Basc");
  assert.equal(inRegion("cataluna", "es"), "en Cataluña");
  assert.equal(netSalaryLink("es", 29540.26, "madrid"), "/es/calculadoras/sueldo-neto/#b=29540.26&r=madrid");
  assert.equal(netSalaryLink("en", 30000, "es"), "/en/calculators/net-salary-spain/#b=30000");
});

test("page words: the year the figures are for is in the title, the lead and the description, with INE's exact figures", () => {
  for (const l of WAGE_LOCALES) {
    const m = wageMeta(l, S);
    assert.ok(m.title.includes("2024") && m.title.length <= 65, `${l} title: ${m.title}`);
    assert.ok(m.description.includes("2024") && m.description.length <= 160, `${l} description: ${m.description.length}`);
    assert.ok(m.title.includes(euros(29540.26, l)));
    const lead = leadText(l, S);
    assert.ok(lead.includes("2024") && lead.includes(euros(24497.17, l)), lead);
    assert.equal(releaseText(l, S).length, 2);
    const faq = wageFaq(l, S);
    assert.ok(faq.length >= 6);
    for (const f of faq) assert.ok(f.q.trim() && f.a.trim());
  }
  assert.deepEqual(wageEditions(), { es: "/es/calculadoras/salario-medio/", ca: "/ca/calculadores/salari-mitja/", en: "/en/calculators/average-salary-spain/" });
  const entries = wageSitemapEntries(S);
  assert.equal(entries.length, 3);
  assert.equal(entries[0]!.lastModified?.toString(), new Date("2026-05-28T00:00:00Z").toString());
});

test("wiring: hub card in the official group, links from the net salary and SMI pages, the finder links the net salary calculator", () => {
  const official = HUB_GROUPS.find((g) => g.id === "official")!;
  const card = official.cards.find((c) => c.key === "average-salary");
  assert.ok(card);
  for (const id of Object.values(TABLES).map((t) => String(t.id))) assert.ok(card.basis.es.includes(id), `hub card basis names table ${id}`);
  const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
  assert.match(read("src/components/programmatic/net-salary/NetSalaryPage.tsx"), /<Link href=\{wagePath\(locale\)\}>/);
  assert.match(read("src/components/programmatic/smi/SmiPage.tsx"), /<Link href=\{wagePath\(locale\)\}>/);
  assert.match(read("src/components/programmatic/average-salary/WageFinder.tsx"), /netSalaryLink\(locale, p\.salary, region\)/);
  for (const dir of ["calculadoras/salario-medio", "calculadores/salari-mitja", "calculators/average-salary-spain"]) {
    assert.match(read(`src/app/(public)/[locale]/${dir}/page.tsx`), /AverageSalaryRoute/);
  }
});
