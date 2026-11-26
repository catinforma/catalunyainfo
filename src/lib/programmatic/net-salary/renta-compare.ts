import { CATALAN_SCALE, INCOME_TAX_URLS, PERSONAL_MINIMUM, cuota, taxExample, type Band } from "@/lib/content/batch02/income-tax";
import { b2href } from "@/lib/content/batch02/shared";
import { calcPath } from "@/lib/programmatic/calculators/paths";

import { money, percent, type NetLocale } from "./copy";
import { DEFAULT_INPUT, calculateNetSalary } from "./engine";
import { IRPF, SALARY_RULES_YEAR, SOCIAL_SECURITY, type Source } from "./rules-2026";

/**
 * Net salary page, 27 Nov 2026 (ci-edicio, batch 8B): the words of three
 * answers people search for, as plain text so the tests can read them (the
 * page renders them, NetSalaryPage.tsx):
 *
 *  1. "30.000 € brutos cuánto es neto": one sentence per common amount, each
 *     linking to its row of the net-by-gross table (#neto-30000);
 *  2. "salario neto Cataluña" / "¿se paga más IRPF en Cataluña que en
 *     Madrid?": the payslip is the same (one AEAT withholding scale), the
 *     annual return is not. Final tax = State cuota + regional cuota on the
 *     same taxable base the withholding uses (income-tax.ts taxExample, the
 *     engine's base), before deductions;
 *  3. FAQ entries in the searchers' words: Social Security 2026 with MEI
 *     (and the employer's share), the minimum withholding, the self-employed.
 *
 * Sources (curl + grep, 27 Nov 2026):
 *  - Catalonia: Decret llei 5/2025, art. 3.1 (art. 611-1 Codi tributari),
 *    BOE-A-2025-10270: «1.187,50», «2.375,00», «4.135,00», «7.935,00»,
 *    «15.890,00», «22.940,00», «36.415,00» all found (CATALAN_SCALE in
 *    income-tax.ts, read in full on 21 Nov). Personal minimum: the State's
 *    5,550 € (art. 611-2, AEAT manual; income-tax.ts).
 *  - Madrid: Decreto Legislativo 1/2010, de 21 de octubre (texto refundido de
 *    tributos cedidos), BOE consolidated text BOCM-m-2010-90068, «Última
 *    actualización publicada el 10/07/2026». Art. 1 «Escala autonómica»
 *    (wording of Ley 13/2023, «aplicación a todos los períodos impositivos que
 *    se inicien a partir del 1 de enero de 2023»): 0 / 0 / 13.362,22 / 8,50;
 *    13.362,22 / 1.135,79 / 5.642,41 / 10,70; 19.004,63 / 1.739,53 /
 *    16.421,05 / 12,80; 35.425,68 / 3.841,42 / 21.894,72 / 17,40; 57.320,40 /
 *    7.651,10 / en adelante / 20,50. Art. 2: «Para el cálculo del gravamen
 *    autonómico de la Comunidad de Madrid se aplicarán los siguientes importes
 *    de mínimo del contribuyente [...] con carácter general, de 5.956,65 euros
 *    anuales».
 *  - Social Security: Orden PJC/297/2026 (BOE-A-2026-7296), arts. 4, 16 and 33
 *    re-read the same day (rules-2026.ts, SOCIAL_SECURITY.employerRates).
 *
 * Not compared: the other 13 common-regime regions (scales not read), any
 * regional or State deduction (rent, home, donations...), several payers.
 * Re-read by REGIONAL_TAX_REREAD_BY: a Catalan or Madrid tax law for 2027 can
 * change a scale from 1 January; a test fails after that date.
 */

export const REGIONAL_TAX_AS_OF = "2026-11-27";
export const REGIONAL_TAX_REREAD_BY = "2027-01-15";

/** Madrid, DLeg 1/2010 art. 1 (Ley 13/2023, from 2023). */
export const MADRID_SCALE: readonly Band[] = [
  { from: 0, rate: 8.5 },
  { from: 13362.22, rate: 10.7 },
  { from: 19004.63, rate: 12.8 },
  { from: 35425.68, rate: 17.4 },
  { from: 57320.4, rate: 20.5 },
];
/** The "Cuota íntegra" column as printed in art. 1: a test rebuilds it from the bands. */
export const MADRID_SCALE_PRINTED = [0, 1135.79, 1739.53, 3841.42, 7651.1] as const;
/** DLeg 1/2010 art. 2.a: Madrid's own personal minimum for its half of the tax. */
export const MADRID_MINIMUM = 5956.65;

export const REGIONAL_SOURCES = {
  catalonia: {
    name: "Decreto-ley 5/2025 de Cataluña, art. 3.1 (escala autonómica del IRPF, art. 611-1 del Código tributario de Cataluña)",
    ref: "BOE-A-2025-10270",
    url: INCOME_TAX_URLS.dl5,
    date: "2025-03-26",
  },
  madrid: {
    name: "Decreto Legislativo 1/2010 de la Comunidad de Madrid, arts. 1 y 2 (escala autonómica y mínimo del contribuyente), texto consolidado",
    ref: "BOCM-m-2010-90068, actualización del 10-07-2026",
    url: "https://www.boe.es/buscar/act.php?id=BOCM-m-2010-90068",
    date: "2026-07-10",
  },
} as const satisfies Record<string, Source>;

/** The amounts answered in one sentence each (all rows of TABLE_SALARIES, test). */
export const QUICK_GROSS = [20000, 25000, 30000, 35000, 40000, 45000, 50000, 60000] as const;
/** The Catalonia vs Madrid rows (from 25,000 €: no SMI deduction to net off). */
export const COMPARE_GROSS = [25000, 30000, 35000, 40000, 50000, 60000] as const;
/** The salary the FAQ answers use. */
export const FAQ_GROSS = 30000;

const L = <T,>(locale: NetLocale, v: Record<NetLocale, T>): T => v[locale];
const round2 = (n: number) => Math.round(n * 100) / 100;

/* -------------------------------------------------------------------------- */
/* 1. "X € brutos, ¿cuánto es neto?"                                          */
/* -------------------------------------------------------------------------- */

export interface QuickAnswer {
  gross: number;
  /** The row of the net-by-gross table this sentence links to. */
  anchor: string;
  text: string;
}

export function quickAnswer(gross: number, locale: NetLocale): QuickAnswer {
  const r14 = calculateNetSalary({ ...DEFAULT_INPUT, gross, payments: 14 });
  const r12 = calculateNetSalary({ ...DEFAULT_INPUT, gross, payments: 12 });
  const m = (v: number, d: 0 | 2 = 2) => money(v, locale, d);
  const mark = r14.smiDeduction.applies ? " †" : "";
  const x = r14.net.extraPayment ?? 0;
  const text = L(locale, {
    es: `${m(gross, 0)} brutos al año${mark} son ${m(r14.net.perPayment)} netos al mes en 14 pagas, más dos pagas extra de ${m(x)}, o ${m(r12.net.perPayment)} al mes en 12 pagas (${m(r14.net.annual)} netos al año).`,
    ca: `${m(gross, 0)} bruts l'any${mark} són ${m(r14.net.perPayment)} nets al mes en 14 pagues, més dues pagues extra de ${m(x)}, o ${m(r12.net.perPayment)} al mes en 12 pagues (${m(r14.net.annual)} nets l'any).`,
    en: `${m(gross, 0)} gross a year${mark} is ${m(r14.net.perPayment)} net a month in 14 payments, plus two extra payments of ${m(x)}, or ${m(r12.net.perPayment)} a month in 12 payments (${m(r14.net.annual)} net a year).`,
  });
  return { gross, anchor: `neto-${gross}`, text };
}

export function quickAnswers(locale: NetLocale): QuickAnswer[] {
  return QUICK_GROSS.map((g) => quickAnswer(g, locale));
}

export function quickAnswersIntro(locale: NetLocale): string {
  return L(locale, {
    es: "En una frase, soltero, sin hijos y con contrato indefinido (cada cantidad lleva a su fila de la tabla):",
    ca: "En una frase, solter, sense fills i amb contracte indefinit (cada quantitat porta a la seva fila de la taula):",
    en: "In one sentence each, single, no children, open-ended contract (each links to its row of the table):",
  });
}

/* -------------------------------------------------------------------------- */
/* 2. Catalonia vs Madrid: same payslip, different annual return              */
/* -------------------------------------------------------------------------- */

export interface RegionalRow {
  gross: number;
  /** The year's withholding: the same in both (and in every common-regime region). */
  withheld: number;
  socialSecurity: number;
  /** Taxable base (the engine's withholding base: pay − contributions − 2,000 € − art. 20 reduction). */
  base: number;
  state: number;
  catalonia: number;
  madrid: number;
  totalCatalonia: number;
  totalMadrid: number;
  /** totalCatalonia − totalMadrid. */
  difference: number;
  /** Final tax − withholding: positive = to pay in the Renta, negative = refund (before deductions). */
  rentaCatalonia: number;
  rentaMadrid: number;
  /** Gross − Social Security − final tax. */
  netCatalonia: number;
  netMadrid: number;
}

/** Single, under 65, no children, one employer, open-ended contract, no other income, before deductions. */
export function regionalRow(gross: number): RegionalRow {
  const t = taxExample(gross);
  const madrid = cuota(MADRID_SCALE, t.base, MADRID_MINIMUM);
  const totalMadrid = round2(t.state + madrid);
  return {
    gross,
    withheld: t.withheld,
    socialSecurity: t.socialSecurity,
    base: t.base,
    state: t.state,
    catalonia: t.region,
    madrid,
    totalCatalonia: t.total,
    totalMadrid,
    difference: round2(t.total - totalMadrid),
    rentaCatalonia: round2(t.total - t.withheld),
    rentaMadrid: round2(totalMadrid - t.withheld),
    netCatalonia: round2(gross - t.socialSecurity - t.total),
    netMadrid: round2(gross - t.socialSecurity - totalMadrid),
  };
}

export function regionalRows(): RegionalRow[] {
  return COMPARE_GROSS.map(regionalRow);
}

/** "a pagar 32,75 €" / "a devolver 327,99 €" / "a bill of €32.75" (0: "0 €"). */
export function rentaText(value: number, locale: NetLocale): string {
  const m = (v: number) => money(v, locale);
  if (value === 0) return m(0);
  return value > 0
    ? L(locale, { es: `a pagar ${m(value)}`, ca: `a pagar ${m(value)}`, en: `a bill of ${m(value)}` })
    : L(locale, { es: `a devolver ${m(-value)}`, ca: `a retornar ${m(-value)}`, en: `a refund of ${m(-value)}` });
}

export interface RegionalCopy {
  h2: string;
  paras: string[];
  caption: string;
  cols: string[];
  note: string;
  guideLabel: string;
  guideHref: string;
  /** Added to the existing FAQ answer "¿Cambia algo si vivo en Madrid o en Cataluña?". */
  faqTail: string;
}

export function regionalCopy(locale: NetLocale): RegionalCopy {
  const m = (v: number, d: 0 | 2 = 2) => money(v, locale, d);
  const pc = (v: number) => percent(v, locale, v % 1 === 0 ? 0 : 1);
  const r = regionalRow(FAQ_GROSS);
  const cat = CATALAN_SCALE;
  const catFirst = cat[0]!.rate;
  const catTop = cat[cat.length - 1]!.rate;
  const madFirst = MADRID_SCALE[0]!.rate;
  const madTop = MADRID_SCALE[MADRID_SCALE.length - 1]!.rate;
  const Y = SALARY_RULES_YEAR;
  const perMonth = round2(r.difference / 12);
  return {
    h2: L(locale, {
      es: "¿Se paga más IRPF en Cataluña que en Madrid?",
      ca: "Es paga més IRPF a Catalunya que a Madrid?",
      en: "Do you pay more income tax in Catalonia than in Madrid?",
    }),
    paras: L(locale, {
      es: [
        `En la nómina, no: la retención se calcula con la misma escala en Cataluña, en Madrid y en el resto de comunidades de régimen común, así que el sueldo neto de cada mes es el mismo. En la declaración de la Renta, sí: el IRPF final suma la escala estatal y la de tu comunidad. La catalana va del ${pc(catFirst)} al ${pc(catTop)}; la de Madrid, del ${pc(madFirst)} al ${pc(madTop)}, y Madrid resta además un mínimo personal más alto en su mitad del impuesto (${m(MADRID_MINIMUM)} en lugar de ${m(PERSONAL_MINIMUM, 0)}).`,
        `Con ${m(r.gross, 0)} brutos al año, soltero y sin hijos, el IRPF final de ${Y} es de ${m(r.totalCatalonia)} en Cataluña y de ${m(r.totalMadrid)} en Madrid: ${m(r.difference)} más al año en Cataluña (unos ${m(perMonth)} al mes). A los dos les retienen lo mismo en nómina, ${m(r.withheld)}; por eso, antes de deducciones, la Renta sale ${rentaText(r.rentaCatalonia, locale)} en Cataluña y ${rentaText(r.rentaMadrid, locale)} en Madrid.`,
      ],
      ca: [
        `A la nòmina, no: la retenció es calcula amb la mateixa escala a Catalunya, a Madrid i a la resta de comunitats de règim comú, així que el sou net de cada mes és el mateix. A la declaració de la renda, sí: l'IRPF final suma l'escala estatal i la de la teva comunitat. La catalana va del ${pc(catFirst)} al ${pc(catTop)}; la de Madrid, del ${pc(madFirst)} al ${pc(madTop)}, i Madrid resta a més un mínim personal més alt a la seva meitat de l'impost (${m(MADRID_MINIMUM)} en lloc de ${m(PERSONAL_MINIMUM, 0)}).`,
        `Amb ${m(r.gross, 0)} bruts l'any, solter i sense fills, l'IRPF final del ${Y} és de ${m(r.totalCatalonia)} a Catalunya i de ${m(r.totalMadrid)} a Madrid: ${m(r.difference)} més l'any a Catalunya (uns ${m(perMonth)} al mes). A tots dos els retenen el mateix a la nòmina, ${m(r.withheld)}; per això, abans de deduccions, la renda surt ${rentaText(r.rentaCatalonia, locale)} a Catalunya i ${rentaText(r.rentaMadrid, locale)} a Madrid.`,
      ],
      en: [
        `On the payslip, no: withholding uses the same scale in Catalonia, Madrid and every other common-regime region, so the monthly net pay is the same. In the annual return (Renta), yes: the final tax adds the State scale and your region's. Catalonia's runs from ${pc(catFirst)} to ${pc(catTop)}; Madrid's from ${pc(madFirst)} to ${pc(madTop)}, and Madrid also takes a higher personal allowance off its half of the tax (${m(MADRID_MINIMUM)} instead of ${m(PERSONAL_MINIMUM, 0)}).`,
        `On ${m(r.gross, 0)} gross a year, single, no children, the final ${Y} income tax is ${m(r.totalCatalonia)} in Catalonia and ${m(r.totalMadrid)} in Madrid: ${m(r.difference)} more a year in Catalonia (about ${m(perMonth)} a month). Both have the same ${m(r.withheld)} withheld from their pay, so before deductions the return comes out at ${rentaText(r.rentaCatalonia, locale)} in Catalonia and ${rentaText(r.rentaMadrid, locale)} in Madrid.`,
      ],
    }),
    caption: L(locale, {
      es: `IRPF ${Y} en Cataluña y en Madrid; soltero, sin hijos, contrato indefinido, antes de deducciones`,
      ca: `IRPF ${Y} a Catalunya i a Madrid; solter, sense fills, contracte indefinit, abans de deduccions`,
      en: `Income tax ${Y} in Catalonia and Madrid; single, no children, open-ended contract, before deductions`,
    }),
    cols: L(locale, {
      es: ["Bruto anual", "Retención en nómina (las dos)", "IRPF final, Cataluña", "IRPF final, Madrid", "Cataluña paga más", "Renta en Cataluña"],
      ca: ["Brut anual", "Retenció a la nòmina (totes dues)", "IRPF final, Catalunya", "IRPF final, Madrid", "Catalunya paga més", "Renda a Catalunya"],
      en: ["Gross a year", "Withheld from pay (both)", "Final tax, Catalonia", "Final tax, Madrid", "Catalonia pays more", "Return in Catalonia"],
    }),
    note: L(locale, {
      es: `Menos de 65 años, un solo pagador, sin otras rentas y sin deducciones (alquiler, vivienda, donativos y las demás estatales o autonómicas). IRPF final = cuota estatal (art. 63 de la Ley del IRPF) + cuota autonómica, sobre la misma base que usa la retención; Cataluña: art. 611-1 del Código tributario de Cataluña (Decreto-ley 5/2025); Madrid: arts. 1 y 2 del Decreto Legislativo 1/2010 (textos del BOE leídos el 27 de noviembre de ${Y}). No comparamos el resto de comunidades. Para tu caso exacto, el simulador Renta WEB Open de la Agencia Tributaria.`,
      ca: `Menys de 65 anys, un sol pagador, sense altres rendes i sense deduccions (lloguer, habitatge, donatius i les altres estatals o autonòmiques). IRPF final = quota estatal (art. 63 de la Llei de l'IRPF) + quota autonòmica, sobre la mateixa base que fa servir la retenció; Catalunya: art. 611-1 del Codi tributari de Catalunya (Decret llei 5/2025); Madrid: arts. 1 i 2 del Decret legislatiu 1/2010 (textos del BOE llegits el 27 de novembre de ${Y}). No comparem la resta de comunitats. Per al teu cas exacte, el simulador Renta WEB Open de l'Agència Tributària.`,
      en: `Under 65, one payer, no other income and no deductions (rent, home, donations and the other State or regional ones). Final tax = State tax (art. 63 of the IRPF Law) + regional tax, on the same base withholding uses; Catalonia: art. 611-1 of the Catalan Tax Code (Decree-law 5/2025); Madrid: arts. 1 and 2 of Legislative Decree 1/2010 (BOE texts read on 27 November ${Y}). Other regions are not compared. For your own case, the Tax Agency's Renta WEB Open simulator.`,
    }),
    guideLabel: L(locale, {
      es: `Tramos del IRPF ${Y} en Cataluña: escala estatal, catalana y tipo combinado`,
      ca: `Trams de l'IRPF ${Y} a Catalunya: escala estatal, catalana i tipus combinat`,
      en: `Income tax brackets ${Y} in Catalonia: State and Catalan scales, combined rate`,
    }),
    guideHref: b2href("incomeTax", locale),
    faqTail: L(locale, {
      es: `En la Renta sí cambia: con ${m(r.gross, 0)} brutos, soltero y sin hijos, el IRPF final es ${m(r.difference)} más alto en Cataluña (${m(r.totalCatalonia)}) que en Madrid (${m(r.totalMadrid)}), antes de deducciones.`,
      ca: `A la renda sí que canvia: amb ${m(r.gross, 0)} bruts, solter i sense fills, l'IRPF final és ${m(r.difference)} més alt a Catalunya (${m(r.totalCatalonia)}) que a Madrid (${m(r.totalMadrid)}), abans de deduccions.`,
      en: `The annual return does differ: on ${m(r.gross, 0)} gross, single, no children, the final tax is ${m(r.difference)} higher in Catalonia (${m(r.totalCatalonia)}) than in Madrid (${m(r.totalMadrid)}), before deductions.`,
    }),
  };
}

/* -------------------------------------------------------------------------- */
/* 3. FAQ entries in the searchers' words                                     */
/* -------------------------------------------------------------------------- */

export interface FaqEntry {
  q: string;
  a: string;
  /** A link shown under the answer (not in the JSON-LD text). */
  link?: { href: string; label: string };
}

/** Worker's total rate: common contingencies + unemployment + training + MEI. */
function workerTotal(fixedTerm: boolean): number {
  const s = SOCIAL_SECURITY.rates;
  return round2(s.commonContingencies + (fixedTerm ? s.unemploymentFixedTerm : s.unemploymentOpenEnded) + s.vocationalTraining + s.intergenerationalEquity);
}

/** The questions added on 27 Nov 2026: first one goes first, the rest after the existing ones. */
export function searcherFaq(locale: NetLocale): { first: FaqEntry; rest: FaqEntry[] } {
  const m = (v: number, d: 0 | 2 = 2) => money(v, locale, d);
  const pc = (v: number) => percent(v, locale);
  const S = SOCIAL_SECURITY;
  const R = S.rates;
  const E = S.employerRates;
  const ex = calculateNetSalary({ ...DEFAULT_INPUT, gross: FAQ_GROSS, payments: 14 });
  const q30 = quickAnswer(FAQ_GROSS, locale).text;
  const open = workerTotal(false);
  const fixed = workerTotal(true);
  const employer = round2(E.commonContingencies + E.unemploymentOpenEnded + E.wageGuaranteeFund + E.vocationalTraining + E.intergenerationalEquity);
  const solidarity = S.solidarity.map(([, rate]) => pc(rate)).join(" / ");
  const ex1 = IRPF.exemptUpTo[3][0]!;
  const exParent = IRPF.exemptUpTo[1][1]!;
  const seHref = calcPath("self-employed", locale);
  const limit = percent(IRPF.limitRate * 100, locale, 0);
  const Y = SALARY_RULES_YEAR;
  const net30k = `${m(FAQ_GROSS, 0)}`;
  return L(locale, {
    es: {
      first: { q: `¿Cuánto es ${net30k} brutos en neto al mes?`, a: `${q30} La Seguridad Social se lleva ${m(ex.ss.annual)} al año y la retención de IRPF, del ${pc(ex.irpf.rate)}, ${m(ex.irpf.annual)}. Es el caso de un soltero sin hijos con contrato indefinido en cualquier comunidad de régimen común.` },
      rest: [
        { q: `¿Cuánto se cotiza a la Seguridad Social en ${Y}?`, a: `El trabajador paga el ${pc(open)} de su base de cotización con contrato indefinido: ${pc(R.commonContingencies)} de contingencias comunes, ${pc(R.unemploymentOpenEnded)} de desempleo, ${pc(R.vocationalTraining)} de formación profesional y ${pc(R.intergenerationalEquity)} del MEI (mecanismo de equidad intergeneracional). Con contrato temporal, el ${pc(fixed)}, porque el desempleo es del ${pc(R.unemploymentFixedTerm)}. La base es el bruto anual entre 12, con un máximo de ${m(S.maxBaseMonthly)} al mes; por encima solo se paga la cotización de solidaridad (${solidarity} a tu cargo, según el tramo). Con ${m(FAQ_GROSS, 0)}: ${m(ex.ss.monthly)} al mes. La empresa paga aparte el ${pc(employer)} (${pc(E.commonContingencies)} de contingencias comunes, ${pc(E.unemploymentOpenEnded)} de desempleo, ${pc(E.wageGuaranteeFund)} de Fogasa, ${pc(E.vocationalTraining)} de formación y ${pc(E.intergenerationalEquity)} de MEI) más accidentes de trabajo, que depende de la actividad (Orden PJC/297/2026, arts. 4, 16 y 33).` },
        { q: "¿Cuál es la retención mínima de IRPF en la nómina?", a: `No hay un porcentaje mínimo general. Por debajo de un sueldo que depende de la familia no se retiene nada: ${m(ex1, 0)} al año para un soltero sin hijos y ${m(exParent, 0)} en una familia monoparental con un hijo. Con un contrato de menos de un año, la retención es al menos del ${pc(IRPF.minRateShortContract)}. Y hasta ${m(IRPF.limitPayUpTo, 0)} brutos, la retención no puede pasar del ${limit} de lo que el sueldo supera ese mínimo (algoritmo de retenciones ${Y} de la Agencia Tributaria).` },
        { q: "Soy autónomo: ¿me sirve esta calculadora?", a: "No: es para asalariados. Un autónomo no paga el porcentaje de Seguridad Social de la nómina, sino una cuota mensual que depende de sus rendimientos netos, y adelanta el IRPF con pagos fraccionados o con la retención de sus facturas. Para la cuota, usa la calculadora de cuota de autónomos.", link: { href: seHref, label: `Calculadora de cuota de autónomos ${Y}` } },
      ],
    },
    ca: {
      first: { q: `Quant és ${net30k} bruts en net al mes?`, a: `${q30} La Seguretat Social s'emporta ${m(ex.ss.annual)} l'any i la retenció d'IRPF, del ${pc(ex.irpf.rate)}, ${m(ex.irpf.annual)}. És el cas d'un solter sense fills amb contracte indefinit a qualsevol comunitat de règim comú.` },
      rest: [
        { q: `Quant es cotitza a la Seguretat Social el ${Y}?`, a: `El treballador paga el ${pc(open)} de la base de cotització amb contracte indefinit: ${pc(R.commonContingencies)} de contingències comunes, ${pc(R.unemploymentOpenEnded)} d'atur, ${pc(R.vocationalTraining)} de formació professional i ${pc(R.intergenerationalEquity)} de l'MEI (mecanisme d'equitat intergeneracional). Amb contracte temporal, el ${pc(fixed)}, perquè l'atur és de l'${pc(R.unemploymentFixedTerm)}. La base és el brut anual entre 12, amb un màxim de ${m(S.maxBaseMonthly)} al mes; per sobre només es paga la cotització de solidaritat (${solidarity} a càrrec teu, segons el tram). Amb ${m(FAQ_GROSS, 0)}: ${m(ex.ss.monthly)} al mes. L'empresa paga a part el ${pc(employer)} (${pc(E.commonContingencies)} de contingències comunes, ${pc(E.unemploymentOpenEnded)} d'atur, ${pc(E.wageGuaranteeFund)} de Fogasa, ${pc(E.vocationalTraining)} de formació i ${pc(E.intergenerationalEquity)} d'MEI) més accidents de treball, que depèn de l'activitat (Ordre PJC/297/2026, arts. 4, 16 i 33).` },
        { q: "Quina és la retenció mínima d'IRPF a la nòmina?", a: `No hi ha un percentatge mínim general. Per sota d'un sou que depèn de la família no es reté res: ${m(ex1, 0)} l'any per a un solter sense fills i ${m(exParent, 0)} en una família monoparental amb un fill. Amb un contracte de menys d'un any, la retenció és com a mínim del ${pc(IRPF.minRateShortContract)}. I fins a ${m(IRPF.limitPayUpTo, 0)} bruts, la retenció no pot superar el ${limit} del que el sou excedeix aquest mínim (algoritme de retencions ${Y} de l'Agència Tributària).` },
        { q: "Soc autònom: em serveix aquesta calculadora?", a: "No: és per a assalariats. Un autònom no paga el percentatge de Seguretat Social de la nòmina, sinó una quota mensual que depèn dels seus rendiments nets, i avança l'IRPF amb pagaments fraccionats o amb la retenció de les seves factures. Per a la quota, fes servir la calculadora de quota d'autònoms.", link: { href: seHref, label: `Calculadora de quota d'autònoms ${Y}` } },
      ],
    },
    en: {
      first: { q: `How much is ${net30k} gross in net pay a month?`, a: `${q30} Social Security takes ${m(ex.ss.annual)} a year and IRPF withholding, at ${pc(ex.irpf.rate)}, ${m(ex.irpf.annual)}. That is for a single person with no children on an open-ended contract in any common-regime region.` },
      rest: [
        { q: `How much is the Social Security contribution in ${Y}?`, a: `Employees pay ${pc(open)} of their contribution base on an open-ended contract: ${pc(R.commonContingencies)} common contingencies, ${pc(R.unemploymentOpenEnded)} unemployment, ${pc(R.vocationalTraining)} vocational training and ${pc(R.intergenerationalEquity)} MEI (intergenerational equity mechanism). On a fixed-term contract it is ${pc(fixed)}, as unemployment is ${pc(R.unemploymentFixedTerm)}. The base is gross annual pay divided by 12, capped at ${m(S.maxBaseMonthly)} a month; above that only the solidarity contribution applies (${solidarity} your share, by band). On ${m(FAQ_GROSS, 0)}: ${m(ex.ss.monthly)} a month. The employer pays a further ${pc(employer)} (${pc(E.commonContingencies)} common contingencies, ${pc(E.unemploymentOpenEnded)} unemployment, ${pc(E.wageGuaranteeFund)} wage guarantee fund, ${pc(E.vocationalTraining)} training and ${pc(E.intergenerationalEquity)} MEI) plus work-accident cover, which depends on the activity (Orden PJC/297/2026, arts. 4, 16 and 33).` },
        { q: "What is the minimum IRPF withholding on a payslip?", a: `There is no general minimum percentage. Below a salary that depends on your family nothing is withheld: ${m(ex1, 0)} a year for a single person with no children and ${m(exParent, 0)} for a single parent with one child. On a contract of less than a year, withholding is at least ${pc(IRPF.minRateShortContract)}. And up to ${m(IRPF.limitPayUpTo, 0)} gross, withholding cannot exceed ${limit} of the pay above that minimum (Tax Agency withholding algorithm ${Y}).` },
        { q: "I am self-employed: does this calculator apply?", a: "No: it is for employees. The self-employed do not pay the payslip's Social Security percentage but a monthly fee that depends on their net earnings, and they pay income tax in advance through instalments or the withholding on their invoices. For the fee, use the self-employed contributions calculator.", link: { href: seHref, label: `Spain self-employed contributions calculator ${Y}` } },
      ],
    },
  });
}
