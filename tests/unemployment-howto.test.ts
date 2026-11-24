import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { CALC_LOCALES } from "../src/lib/programmatic/calculators/paths.ts";
import { BENEFIT_SS_RATE, RULES_VALID_UNTIL } from "../src/lib/programmatic/employment/rules.ts";
import { benefitLimits, unemploymentBenefit } from "../src/lib/programmatic/employment/unemployment.ts";
import {
  BOE_QUOTE,
  HOWTO_ASKED_BASE,
  HOWTO_BASES,
  HOWTO_DAYS,
  HOWTO_LINKS,
  SEPE_QUOTE,
  SEPE_READ,
  SEPE_SS_QUOTE,
  SEPE_REREAD_BY,
  howToRows,
  unemploymentHowTo,
} from "../src/lib/programmatic/employment/unemployment-howto.ts";

/**
 * The "¿Cómo se calcula el paro?" section of /es/calculadoras/paro/ (and
 * ca, en): the SEPE quotes against the text read with curl on SEPE_READ, the
 * worked table and the "si cobro 1.200" answer against unemploymentBenefit(),
 * the dated guards and the page wiring.
 */

const ROOT = join(import.meta.dirname, "..");
const today = () => new Date().toISOString().slice(0, 10);
const flat = (s: string) => s.replace(/\s+/g, " ");
/** The page text with every no-break space (money, percentages) written as a plain space, so the expected strings can be read. */
const H = (l: "es" | "ca" | "en") => JSON.parse(JSON.stringify(unemploymentHowTo(l)).replace(/[\u00a0\u202f]/g, " ")) as ReturnType<typeof unemploymentHowTo>;
const SEPE_TEXT = flat(readFileSync(join(ROOT, "tests", "fixtures", `sepe-paro-${SEPE_READ.replaceAll("-", "")}.txt`), "utf8"));

test(`date guard: the SEPE figures and quotes are 2026's; re-read before ${SEPE_REREAD_BY}`, () => {
  assert.ok(
    today() < SEPE_REREAD_BY,
    `From ${SEPE_REREAD_BY}: read SEPE "Prestación contributiva" (section Cuantía) and "Cuantías anuales" again with curl, save them as tests/fixtures/sepe-paro-<day>.txt, check SEPE_QUOTE, the limits (benefitLimits) and the 4,85 %, then move SEPE_READ and SEPE_REREAD_BY (employment/unemployment-howto.ts). employment/rules.ts RULES_VALID_UNTIL (${RULES_VALID_UNTIL}) already fails on 1 January until IPREM, SMI and the caps are re-read.`,
  );
  assert.ok(SEPE_READ <= today());
});

test("sources: the SEPE quotes are in the page text read on SEPE_READ, and its 2026 figures are the engine's", () => {
  assert.ok(SEPE_TEXT.includes(SEPE_QUOTE.rate), "70 % / 60 % sentence");
  assert.ok(SEPE_TEXT.includes(SEPE_QUOTE.limits), "tope máximo / mínimo sentence");
  assert.ok(SEPE_TEXT.includes("durante los 180 últimos días cotizados, sin tener en cuenta las horas extraordinarias"), "180-day base");
  // "Cuantías anuales": minimum 560 / 749, maximum 1.225 / 1.400 / 1.575, SS 4,85 %.
  assert.ok(SEPE_TEXT.includes("Cuantía mínima prestación contributiva Euros Sin hijos/as 560,00 € 1 hijo/a o más 749,00 €"));
  assert.ok(SEPE_TEXT.includes("Cuantía máxima prestación contributiva Euros Sin hijos/as 1.225,00 € 1 hijo/a 1.400,00 € 2 hijos/as o más 1.575,00 €"));
  assert.ok(SEPE_TEXT.includes("Cotización a la Seguridad Social: 4,85 %"));
  assert.deepEqual([benefitLimits(0).min, benefitLimits(1).min, benefitLimits(2).min], [560, 749, 749]);
  assert.deepEqual([benefitLimits(0).max, benefitLimits(1).max, benefitLimits(2).max], [1225, 1400, 1575]);
  assert.equal(BENEFIT_SS_RATE, 0.0485);
  assert.match(SEPE_TEXT, /prestacion-contributiva-mas-de-un-anyo\.html/);
  assert.match(SEPE_TEXT, /Cuantias-anuales\.html/);
  for (const l of [HOWTO_LINKS.contributory, HOWTO_LINKS.amounts]) assert.match(l.url, /^https:\/\/www\.sepe\.es\/HomeSepe\/prestaciones-desempleo\//);
});

test("sources: the BOE sentences (LGSS 270.3 and 273.1, Orden PJC/297/2026 art. 8.1) and SEPE's 4,85 % are verbatim in the texts read on SEPE_READ", () => {
  const boe = flat(readFileSync(join(ROOT, "tests", "fixtures", `boe-paro-lgss270-273-orden-art8-${SEPE_READ.replaceAll("-", "")}.txt`), "utf8"));
  assert.ok(boe.includes(BOE_QUOTE.partTime), "270.3 part time");
  assert.ok(boe.includes(BOE_QUOTE.contribution), "273.1");
  assert.ok(boe.includes(BOE_QUOTE.base), "Orden art. 8.1");
  // 270.3 also says the limits are 175/200/225 % (maximum) and 107/80 % (minimum) of the IPREM + 1/6: the engine's figures.
  assert.ok(boe.includes("del 175 por ciento del indicador público de rentas de efectos múltiples") && boe.includes("del 107 por ciento o del 80 por ciento"));
  assert.ok(SEPE_TEXT.includes(SEPE_SS_QUOTE), "SEPE 4,85 %");
});

test("table: four bases at 1.500 days contributed (480 days: 180 at 70 %, 300 at 60 %), from unemploymentBenefit()", () => {
  assert.equal(HOWTO_DAYS, 1500);
  assert.deepEqual([...HOWTO_BASES], [700, 1200, 1800, 3000]);
  const rows = howToRows();
  assert.deepEqual(
    rows.map((r) => [r.base, r.first.monthly, r.first.limit, r.after.monthly, r.after.limit, r.result.ssMonthly]),
    [
      [700, 560, "min", 560, "min", 33.95], // 70 % = 490 and 60 % = 420, both lifted to the 560 minimum
      [1200, 840, null, 720, null, 58.2], // 1.200 × 0,70 and × 0,60
      [1800, 1225, "max", 1080, null, 87.3], // 70 % = 1.260 cut to the 1.225 maximum; 60 % = 1.080
      [3000, 1225, "max", 1225, "max", 145.5], // 2.100 and 1.800 both cut to 1.225
    ],
  );
  for (const r of rows) {
    assert.equal(r.result.durationDays, 480);
    assert.deepEqual([r.first.days, r.after.days], [180, 300]);
    assert.equal(r.result.total, Math.round((r.first.monthly * 6 + r.after.monthly * 10) * 100) / 100);
  }
  // 1.200 base: 840 × 6 + 720 × 10 = 12.240 € in all.
  assert.equal(rows[1]!.result.total, 12_240);
});

test("answer: «si cobro 1.200 cuánto me queda de paro» in es, ca and en, every figure from the table's row", () => {
  assert.equal(HOWTO_ASKED_BASE, 1200);
  const es = H("es");
  assert.equal(es.heading, "¿Cómo se calcula el paro? Base reguladora, 70 % y 60 %");
  assert.equal(
    es.asked,
    "Si tu base reguladora es de 1.200,00 € al mes: 1.200,00 € × 70 % = 840,00 € al mes los primeros 180 días y 1.200,00 € × 60 % = 720,00 € desde el día 181, los dos dentro de los límites. Mientras cobras, el SEPE ingresa las cotizaciones, «asumiendo la aportación empresarial y descontando de la cuantía de la prestación, incluidos los supuestos a que hace referencia el artículo 270.3, la aportación que corresponda al trabajador» (LGSS, art. 273.1); la base de cotización «será la base reguladora de la prestación por desempleo» (Orden PJC/297/2026, art. 8.1) y el SEPE publica «Cotización a la Seguridad Social: 4,85 %». Con ese 4,85 %: 1.200,00 € × 4,85 % = 58,20 € al mes, así que te quedan 781,80 € y 661,80 €, antes de la retención de IRPF si te corresponde. La base no es tu sueldo neto: es la base de contingencias profesionales de tu nómina.",
  );
  // Part-time: art. 270.3 weights the minimum and maximum by the hours worked (half time: 280 / 612,50, benefitLimits(0, 50)).
  assert.match(es.steps[2]!, /A tiempo parcial el mismo artículo toma el indicador «calculado en función del promedio de las horas trabajadas durante el período de los últimos 180 días», así que mínimo y máximo se reducen con las horas: a media jornada y sin hijos, 280,00 € y 612,50 €\./);
  assert.deepEqual(benefitLimits(0, 50), { min: 280, max: 612.5 });
  assert.match(H("ca").steps[2]!, /A temps parcial el mateix article pren l'indicador «calculado en función del promedio de las horas trabajadas.*280,00 € i 612,50 €\./);
  assert.match(H("en").steps[2]!, /For part-time work the same article takes the indicator “calculado en función del promedio de las horas trabajadas.*€280\.00 and €612\.50\./);
  assert.ok(!es.asked.includes("de la base ("), "no unsourced 'of the base' wording for the SEPE rate");
  assert.match(es.steps[2]!, /560,00 € y 1\.225,00 € al mes sin hijos a cargo; 749,00 € y 1\.400,00 € con un hijo; 749,00 € y 1\.575,00 € con dos o más/);
  assert.equal(es.caption, "Con 1.500 días cotizados (480 días de paro: 180 al 70 % y 300 al 60 %) y sin hijos a cargo, con los límites de 2026.");
  assert.deepEqual(es.rows, [
    ["700,00 €", "560,00 € (mínimo)", "560,00 € (mínimo)", "33,95 €"],
    ["1.200,00 €", "840,00 €", "720,00 €", "58,20 €"],
    ["1.800,00 €", "1.225,00 € (máximo)", "1.080,00 €", "87,30 €"],
    ["3.000,00 €", "1.225,00 € (máximo)", "1.225,00 € (máximo)", "145,50 €"],
  ]);
  assert.deepEqual(es.cols, ["Base reguladora al mes", "Días 1 a 180 (70 %)", "Desde el día 181 (60 %)", "Seguridad Social (4,85 %)"]);

  const ca = H("ca");
  assert.equal(ca.heading, "Com es calcula l'atur? Base reguladora, 70 % i 60 %");
  assert.match(ca.asked, /840,00 € al mes els primers 180 dies i 1\.200,00 € × 60 % = 720,00 € des del dia 181.*et queden 781,80 € i 661,80 €/);
  assert.equal(ca.rows[0]![1], "560,00 € (mínim)");
  assert.equal(ca.rows[3]![2], "1.225,00 € (màxim)");

  const en = H("en");
  assert.equal(en.heading, "How is unemployment benefit calculated? Base reguladora, 70% and 60%");
  assert.match(en.asked, /€1,200\.00 × 70% = €840\.00 a month for the first 180 days and €1,200\.00 × 60% = €720\.00 from day 181.*you are left with €781\.80 and €661\.80/);
  assert.equal(en.rows[2]![1], "€1,225.00 (maximum)");
  assert.deepEqual(en.rows[1], ["€1,200.00", "€840.00", "€720.00", "€58.20"]);
  assert.equal(en.caption, "With 1,500 days contributed (480 days of benefit: 180 at 70% and 300 at 60%) and no children in care, with the 2026 limits.");
  // SS is 4,85 % of the base, whatever the cap on the benefit.
  assert.equal(unemploymentBenefit({ contributedDays: HOWTO_DAYS, monthlyBase: 1200, children: 0 }).ssMonthly, 58.2);
});

test("sources line and quotes: dated on SEPE_READ in every language, quotes verbatim in Spanish", () => {
  for (const l of CALC_LOCALES) {
    const h = unemploymentHowTo(l);
    assert.equal(h.quotes.length, 2);
    assert.deepEqual([...h.quotes], [SEPE_QUOTE.rate, SEPE_QUOTE.limits]);
    assert.match(h.source, /24 de noviembre de 2026|24 de novembre de 2026|24 November 2026/);
    assert.equal(h.steps.length, 3);
    assert.ok(h.steps[0]!.includes("270.1") && h.steps[1]!.includes("270.2") && h.steps[2]!.includes("270.3"));
  }
});

test("page: the section sits between the amounts and the 2024 reform, with the table, the quotes and the SEPE links", () => {
  const src = readFileSync(join(ROOT, "src", "components", "programmatic", "employment", "UnemploymentPage.tsx"), "utf8");
  assert.match(src, /const howTo = unemploymentHowTo\(locale\);/);
  assert.match(src, /<h2 id="como-se-calcula">\{howTo\.heading\}<\/h2>/);
  assert.ok(src.indexOf('id="cuantia"') < src.indexOf('id="como-se-calcula"') && src.indexOf('id="como-se-calcula"') < src.indexOf('id="reforma-2024"'));
  for (const piece of ["howTo.steps.map", "howTo.quotes.map", "howTo.asked", "howTo.rows.map", "HOWTO_LINKS.contributory.url", "HOWTO_LINKS.amounts.url"]) assert.ok(src.includes(piece), piece);
});
