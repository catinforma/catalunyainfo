import type { Block } from "@/lib/content/blocks";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { calcPath } from "@/lib/programmatic/calculators/paths";
import { money } from "@/lib/programmatic/net-salary/copy";
import { DEFAULT_INPUT, calculateNetSalary } from "@/lib/programmatic/net-salary/engine";
import { SOURCES as SALARY_SOURCES } from "@/lib/programmatic/net-salary/rules-2026";
import { NON_RESIDENT } from "@/lib/programmatic/net-salary/special-regime";
import { SAVINGS_SCALE } from "@/lib/programmatic/treasury-bills/rules";

import { B2_PATHS, b2Related, b2link, callout, faq, h2, keyFacts, lead, list, netSalaryRelatedItem, paras, steps, table, verifiedLine, type B2Article, type B2Source } from "./shared";

/**
 * Income tax (IRPF) brackets 2026 for residents of Catalonia: the State scale,
 * the Catalan scale, the combined marginal rate, the savings scale, who is
 * resident, who files, and worked examples from gross pay (21 Nov 2026).
 *
 * Why this page: "tramos irpf" ≈ 12k searches a month in Spain and "income tax
 * spain" ≈ 3.9k (research_notes/spain-utilities-opportunities-nov2026.md, rows
 * 7 and 25; Google Trends, geo ES). The site had the net salary calculator
 * (withholding) but no page with the scales, and the calculator says the
 * regional scale "only comes in with the Renta" without printing it. Results
 * read on 21 Nov 2026 disagree on the Catalan scale (six, eight or nine bands,
 * first rate 9.5 %, 10.5 % or 12 %): the law has eight, from 9.5 %.
 *
 * INCOME_TAX_AS_OF 2026-11-21. Fact pack research_notes/expat-guides-nov2026.md
 * (worktree copy). Sources and quotes, all fetched with curl that day:
 *
 *  - BOE, Ley 35/2006 del IRPF, consolidated (BOE-A-2006-20764, last update
 *    published 18/11/2026): art. 63.1 State scale (wording of Ley 11/2020, in
 *    force 01/01/2021): 0–12,450 9.50; 12,450 «1.182,75» 12.00; 20,200
 *    «2.112,75» 15.00; 35,200 «4.362,75» 18.50; 60,000 «8.950,75» 22.50;
 *    300,000 «62.950,75» 24.50; 63.1.2º the scale applied to the personal and
 *    family minimum is taken off. Art. 74: the regional scale is the one the
 *    region approves. Arts. 66.1 and 76 (Ley 7/2024 DF 7, from 1 Jan 2025):
 *    the savings halves 9.5 / 10.5 / 11.5 / 13.5 / 15. Art. 57: «5.550 euros
 *    anuales» (+1,150 over 65, +1,400 more over 75); art. 58 children. Art. 9.1
 *    «más de 183 días», centre of economic interests, family presumption.
 *    Art. 2 «con independencia del lugar donde se hubiesen producido». Art.
 *    19.2.a contributions, 19.2.f «2.000 euros anuales»; art. 20 reduction
 *    below 19,747.5 €. Art. 80 double taxation relief (the lesser of the tax
 *    paid abroad and the Spanish average rate on that income). Art. 96.2.a
 *    22,000 €, 96.3 15,876 € with more than one payer (unless the others add
 *    up to 1,500 € or less), self-employed always file.
 *  - BOE, Decret llei 5/2025, de 25 de març (Catalonia; BOE-A-2025-10270, DOGC
 *    26/03/2025), art. 3.1: «Con efectos del 1 de enero de 2025, se modifica el
 *    artículo 611-1 del libro sexto del Código tributario de Cataluña»: 0–12,500
 *    9.50; 12,500 «1.187,50» 12.50; 22,000 «2.375,00» 16.00; 33,000 «4.135,00»
 *    19.00; 53,000 «7.935,00» 21.50; 90,000 «15.890,00» 23.50; 120,000
 *    «22.940,00» 24.50; 175,000 «36.415,00» 25.50.
 *  - ATC, "Impost sobre la renda de les persones físiques": the same table as
 *    «Tarifes Exercici 2025»; «Per a l'exercici 2026 (a declarar l'any 2027)
 *    s'han aprovat deduccions relatives a l'habitatge habitual en municipis
 *    rurals»; the list of Catalan deductions. No later change to art. 611-1
 *    found: Decret llei 23/2025 (BOE-A-2026-5548, budget prorogation) has no
 *    IRPF article, Llei 8/2025 (rural municipalities, BOE-A-2025-16833) does
 *    not touch it. The page says "in force since 1 January 2025", not "set
 *    for 2026".
 *  - AEAT, Manual práctico de Renta 2025, "Comunidad Autónoma de Cataluña:
 *    Importes del mínimo personal y familiar" (updated 17/03/2026): art. 611-2
 *    DLeg 1/2024 «Se establece el mismo importe del mínimo personal del
 *    contribuyente que fija el artículo 57 de la Ley del IRPF, con carácter
 *    general». So both halves take off the same 5,550 €.
 *  - BOE, TRLIRNR art. 25.1.a (non-residents): 24 %, 19 % EU/EEA (NON_RESIDENT).
 *  - AEAT, withholding algorithm 2026 (rules-2026.ts): one scale (Tabla 2) for
 *    every common-regime region; the examples' withholding is the calculator's.
 *  - AEAT, "Campaña de Renta 2025" (updated 05/11/2026): «Comienzo de la
 *    campaña: 8 de abril de 2026». "Renta WEB Open": «funciona como un
 *    simulador. No requiere identificación».
 *
 * Conflict: the ATC prints the top regional savings rate as 14 %; the BOE
 * consolidated art. 76 says 15 % from 2025 (Ley 7/2024). The combined savings
 * scale printed here is the BOE's (SAVINGS_SCALE, treasury-bills/rules.ts).
 *
 * Not printed: other regions' scales (not read), Catalan deduction amounts
 * (not read article by article), the end date of the Renta campaign, the Renta
 * 2026 dates (not published on 21 Nov 2026), Navarra and the Basque Country
 * (own income tax).
 *
 * The examples (single, under 65, no children, one employer, open-ended
 * contract, no other income, before deductions) take Social Security, the
 * taxable base and the withholding from the net salary engine (validated
 * against the AEAT's own service) and apply the two scales below to that base.
 *
 * Re-read by INCOME_TAX_REREAD_BY: a new State budget or Catalan tax law can
 * change a scale from 1 January; a test fails after it.
 */
export const INCOME_TAX_AS_OF = "2026-11-21";
export const INCOME_TAX_REREAD_BY = "2027-01-15";
export const INCOME_TAX_YEAR = 2026;

export interface Band {
  /** Taxable base where the band starts, euros. */
  from: number;
  /** Rate on the part of the base inside the band, %. */
  rate: number;
}

/** LIRPF art. 63.1 (from 1 Jan 2021). */
export const STATE_SCALE: readonly Band[] = [
  { from: 0, rate: 9.5 },
  { from: 12450, rate: 12 },
  { from: 20200, rate: 15 },
  { from: 35200, rate: 18.5 },
  { from: 60000, rate: 22.5 },
  { from: 300000, rate: 24.5 },
];
/** The "Cuota íntegra" column as printed in art. 63.1: a test rebuilds it from the bands. */
export const STATE_SCALE_PRINTED = [0, 1182.75, 2112.75, 4362.75, 8950.75, 62950.75] as const;

/** Codi tributari de Catalunya, book six, art. 611-1, as rewritten by Decret llei 5/2025 (from 1 Jan 2025). */
export const CATALAN_SCALE: readonly Band[] = [
  { from: 0, rate: 9.5 },
  { from: 12500, rate: 12.5 },
  { from: 22000, rate: 16 },
  { from: 33000, rate: 19 },
  { from: 53000, rate: 21.5 },
  { from: 90000, rate: 23.5 },
  { from: 120000, rate: 24.5 },
  { from: 175000, rate: 25.5 },
];
/** The "Cuota íntegra" column as printed in art. 611-1. */
export const CATALAN_SCALE_PRINTED = [0, 1187.5, 2375, 4135, 7935, 15890, 22940, 36415] as const;

/** LIRPF art. 57.1; Catalonia keeps the same amount (art. 611-2 DLeg 1/2024, AEAT manual). */
export const PERSONAL_MINIMUM = 5550;
/** LIRPF art. 96.2.a and 96.3: work income only, one payer / more than one payer; second and later payers up to this keep the higher limit. */
export const FILING = { onePayer: 22000, severalPayers: 15876, otherPayersUpTo: 1500 } as const;
/** Gross salaries of the worked examples. */
export const EXAMPLE_SALARIES = [25000, 30000, 40000, 50000, 60000, 80000, 100000, 150000] as const;

const round2 = (n: number) => Math.round(n * 100) / 100;

/** The tax a scale gives on a base (before the minimum). */
export function scaleTax(scale: readonly Band[], base: number): number {
  let tax = 0;
  for (let i = 0; i < scale.length; i++) {
    const band = scale[i]!;
    const next = scale[i + 1]?.from ?? Number.POSITIVE_INFINITY;
    if (base <= band.from) break;
    tax += ((Math.min(base, next) - band.from) * band.rate) / 100;
  }
  return round2(tax);
}

/** Art. 63.1 / 74.1: scale on the base minus the scale on the personal minimum (never below zero). */
export function cuota(scale: readonly Band[], base: number, minimum = PERSONAL_MINIMUM): number {
  return Math.max(0, round2(scaleTax(scale, base) - scaleTax(scale, Math.min(base, minimum))));
}

/** Every band where the State + Catalan marginal rate is constant. */
export function combinedBands(): { from: number; to: number | null; state: number; region: number; total: number }[] {
  const cuts = [...new Set([...STATE_SCALE, ...CATALAN_SCALE].map((b) => b.from))].sort((a, b) => a - b);
  const rateAt = (scale: readonly Band[], x: number) => [...scale].reverse().find((b) => x >= b.from)!.rate;
  return cuts.map((from, i) => {
    const state = rateAt(STATE_SCALE, from);
    const region = rateAt(CATALAN_SCALE, from);
    return { from, to: cuts[i + 1] ?? null, state, region, total: round2(state + region) };
  });
}

export interface TaxExample {
  gross: number;
  socialSecurity: number;
  base: number;
  state: number;
  region: number;
  total: number;
  /** total / gross, %. */
  rate: number;
  /** The year's withholding (AEAT 2026 algorithm, the calculator's engine). */
  withheld: number;
  /** total − withheld: positive means more to pay in the Renta (before deductions). */
  difference: number;
}

/** Single, under 65, no children, one employer, open-ended contract, living in Catalonia, no other income, before deductions. */
export function taxExample(gross: number): TaxExample {
  const r = calculateNetSalary({ ...DEFAULT_INPUT, gross, payments: 12 });
  const base = r.irpf.base;
  const state = cuota(STATE_SCALE, base, r.irpf.minimum);
  const region = cuota(CATALAN_SCALE, base, r.irpf.minimum);
  const total = round2(state + region);
  return {
    gross,
    socialSecurity: r.ss.annual,
    base,
    state,
    region,
    total,
    rate: gross > 0 ? round2((total / gross) * 100) : 0,
    withheld: r.irpf.annual,
    difference: round2(total - r.irpf.annual),
  };
}

export const INCOME_TAX_URLS = {
  lirpf: "https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764",
  lirpf63: "https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764#a63",
  lirpf9: "https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764#a9",
  lirpf96: "https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764#a96",
  lirpf66: "https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764#a66",
  lirpf80: "https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764#a80",
  dl5: "https://www.boe.es/buscar/doc.php?id=BOE-A-2025-10270",
  atc: "https://atc.gencat.cat/ca/tributs/irpf/",
  aeatMinimum:
    "https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c14-adecuacion-impuesto-circunstancias-personales/minimo-autonomico-personal-familiar/comunidad-autonoma-cataluna-importes-minimo-familiar.html",
  trlirnr: "https://www.boe.es/buscar/act.php?id=BOE-A-2004-4527#a25",
  algorithm: SALARY_SOURCES.algorithm.url,
  renta: "https://sede.agenciatributaria.gob.es/Sede/Renta.html",
  rentaOpen: "https://sede.agenciatributaria.gob.es/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/renta-web-open.html",
} as const;

const SOURCES: B2Source[] = [
  { name: "Ley 35/2006 del IRPF, texto consolidado (arts. 2, 9, 19, 20, 57, 58, 63, 66, 74, 76, 80 y 96)", url: INCOME_TAX_URLS.lirpf, publisher: "BOE" },
  { name: "Decreto-ley 5/2025 de Cataluña, art. 3.1 (escala autonómica, art. 611-1 del Código tributario de Cataluña)", url: INCOME_TAX_URLS.dl5, publisher: "BOE" },
  { name: "Impost sobre la renda de les persones físiques: tarifes i deduccions", url: INCOME_TAX_URLS.atc, publisher: "Agència Tributària de Catalunya" },
  { name: "Manual práctico de Renta 2025: Cataluña, importes del mínimo personal y familiar", url: INCOME_TAX_URLS.aeatMinimum, publisher: "Agencia Tributaria" },
  { name: "Texto refundido de la Ley del Impuesto sobre la Renta de no Residentes, art. 25", url: INCOME_TAX_URLS.trlirnr, publisher: "BOE" },
  { name: "Algoritmo de cálculo del tipo de retención del IRPF 2026", url: INCOME_TAX_URLS.algorithm, publisher: "Agencia Tributaria" },
  { name: "Campaña de Renta", url: INCOME_TAX_URLS.renta, publisher: "Agencia Tributaria" },
  { name: "Renta WEB Open (simulador)", url: INCOME_TAX_URLS.rentaOpen, publisher: "Agencia Tributaria" },
];

/** A Markdown link. */
const a = (href: string, label: string) => `[${label}](${href})`;

/** "9.5%" (en), "9,5 %" (es, ca): no trailing zeros. */
export function rateText(value: number, locale: Locale): string {
  const s = String(round2(value));
  return locale === "en" ? `${s}%` : `${s.replace(".", ",")} %`;
}

export const INCOME_TAX_META: Record<Locale, { title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    title: "Trams de l'IRPF 2026 a Catalunya: escala estatal, escala catalana i tipus combinat",
    seoTitle: "Trams de l'IRPF 2026 a Catalunya: escala estatal i catalana",
    seoDescription: "L'escala estatal (9,5 % a 24,5 %) i la catalana (9,5 % a 25,5 %), el tipus combinat del 19 % al 50 %, l'estalvi, qui és resident i exemples amb el sou brut.",
    excerpt: "Les dues escales de l'IRPF que paga un resident a Catalunya el 2026, el tipus marginal combinat, l'escala de l'estalvi, la regla dels 183 dies, qui ha de fer la renda i exemples de 25.000 a 150.000 € bruts.",
  },
  es: {
    title: "Tramos del IRPF 2026 en Cataluña: escala estatal, escala catalana y tipo combinado",
    seoTitle: "Tramos del IRPF 2026 en Cataluña: escala estatal y catalana",
    seoDescription: "La escala estatal (9,5 % a 24,5 %) y la catalana (9,5 % a 25,5 %), el tipo combinado del 19 % al 50 %, el ahorro, quién es residente y ejemplos con el sueldo bruto.",
    excerpt: "Las dos escalas del IRPF que paga un residente en Cataluña en 2026, el tipo marginal combinado, la escala del ahorro, la regla de los 183 días, quién tiene que hacer la renta y ejemplos de 25.000 a 150.000 € brutos.",
  },
  en: {
    title: "Income tax in Spain 2026: IRPF rates and brackets for residents of Catalonia",
    seoTitle: "Income tax in Spain 2026: rates and brackets in Catalonia",
    seoDescription: "The State scale (9.5% to 24.5%) and Catalonia's (9.5% to 25.5%), the combined 19% to 50% rate, savings income, who is resident and examples from gross pay.",
    excerpt: "The two income tax (IRPF) scales a resident of Catalonia pays in 2026, the combined marginal rate, the savings scale, the 183-day rule, who must file a return, and worked examples from €25,000 to €150,000 gross.",
  },
};

/** One body for the three editions: the same sections, tables and links in each. */
export function buildIncomeTaxBody(locale: Locale): Block[] {
  const L = locale;
  const U = INCOME_TAX_URLS;
  const m = (v: number, d: 0 | 2 = 0) => money(v, L, d);
  const r = (v: number) => rateText(v, L);
  const Y = INCOME_TAX_YEAR;

  const bands = combinedBands();
  const top = bands[bands.length - 1]!;
  const first = bands[0]!;
  const savingsTop = SAVINGS_SCALE[SAVINGS_SCALE.length - 1]!.rate * 100;
  const savingsFirst = SAVINGS_SCALE[0]!.rate * 100;
  const examples = EXAMPLE_SALARIES.map((g) => taxExample(g));
  const ex30 = examples.find((e) => e.gross === 30000)!;
  const ex50 = examples.find((e) => e.gross === 50000)!;
  const stateTop = STATE_SCALE[STATE_SCALE.length - 1]!;
  const catTop = CATALAN_SCALE[CATALAN_SCALE.length - 1]!;

  const calc = `${calcPath("net-salary", L)}`;
  const calcLink = a(calc, { ca: "calculadora de sou net", es: "calculadora de sueldo neto", en: "net salary calculator" }[L]);
  const beckham = b2link("beckhamLaw", L, { ca: "guia de la llei Beckham", es: "guía de la ley Beckham", en: "Beckham law guide" }[L]);
  const nieTie = b2link("nieTie", L, { ca: "guia del NIE i la TIE", es: "guía del NIE y la TIE", en: "NIE and TIE guide" }[L]);
  const lirpf = a(U.lirpf63, { ca: "Llei de l'IRPF, art. 63", es: "Ley del IRPF, art. 63", en: "IRPF Law, art. 63" }[L]);
  const dl5 = a(U.dl5, { ca: "Decret llei 5/2025", es: "Decreto-ley 5/2025", en: "Decree-law 5/2025" }[L]);
  const atc = a(U.atc, { ca: "Agència Tributària de Catalunya", es: "Agència Tributària de Catalunya", en: "Catalan Tax Agency (ATC)" }[L]);
  const min = a(U.aeatMinimum, { ca: "manual de la renda de l'AEAT", es: "manual de la Renta de la AEAT", en: "AEAT's Renta manual" }[L]);
  const art9 = a(U.lirpf9, { ca: "article 9 de la Llei de l'IRPF", es: "artículo 9 de la Ley del IRPF", en: "article 9 of the IRPF Law" }[L]);
  const art96 = a(U.lirpf96, { ca: "article 96", es: "artículo 96", en: "article 96" }[L]);
  const art80 = a(U.lirpf80, { ca: "article 80", es: "artículo 80", en: "article 80" }[L]);
  const savingsLaw = a(U.lirpf66, { ca: "articles 66 i 76", es: "artículos 66 y 76", en: "articles 66 and 76" }[L]);
  const irnr = a(U.trlirnr, { ca: "llei dels no residents, art. 25", es: "ley de no residentes, art. 25", en: "non-residents' law, art. 25" }[L]);
  const algorithm = a(U.algorithm, { ca: "algorisme de retencions 2026 de l'AEAT", es: "algoritmo de retenciones 2026 de la AEAT", en: "AEAT's 2026 withholding algorithm" }[L]);
  const renta = a(U.renta, { ca: "pàgina de la campanya de la renda", es: "página de la campaña de la Renta", en: "Renta campaign page" }[L]);
  const open = a(U.rentaOpen, { ca: "Renta WEB Open", es: "Renta WEB Open", en: "Renta WEB Open" }[L]);

  const scaleRows = (scale: readonly Band[]) =>
    scale.map((b, i) => {
      const next = scale[i + 1]?.from;
      const range = next === undefined
        ? { ca: `Més de ${m(b.from)}`, es: `Más de ${m(b.from)}`, en: `Over ${m(b.from)}` }[L]
        : { ca: `De ${m(b.from)} a ${m(next)}`, es: `De ${m(b.from)} a ${m(next)}`, en: `${m(b.from)} to ${m(next)}` }[L];
      return [range, r(b.rate), m(scaleTax(scale, b.from), 2)];
    });
  const combinedRows = bands.map((b) => [
    b.to === null
      ? { ca: `Més de ${m(b.from)}`, es: `Más de ${m(b.from)}`, en: `Over ${m(b.from)}` }[L]
      : { ca: `De ${m(b.from)} a ${m(b.to)}`, es: `De ${m(b.from)} a ${m(b.to)}`, en: `${m(b.from)} to ${m(b.to)}` }[L],
    r(b.state),
    r(b.region),
    r(b.total),
  ]);
  const savingsRows = SAVINGS_SCALE.map((b, i) => {
    const from = i === 0 ? 0 : SAVINGS_SCALE[i - 1]!.upTo;
    const range = Number.isFinite(b.upTo)
      ? { ca: `De ${m(from)} a ${m(b.upTo)}`, es: `De ${m(from)} a ${m(b.upTo)}`, en: `${m(from)} to ${m(b.upTo)}` }[L]
      : { ca: `Més de ${m(from)}`, es: `Más de ${m(from)}`, en: `Over ${m(from)}` }[L];
    const total = b.rate * 100;
    return [range, r(total / 2), r(total / 2), r(total)];
  });
  const exampleRows = examples.map((e) => [m(e.gross), m(e.base), m(e.state), m(e.region), `${m(e.total)} (${r(e.rate)})`, m(e.withheld), e.difference >= 0 ? `+${m(e.difference)}` : m(e.difference)]);

  const t = {
    ca: {
      lead: `**Si ets resident fiscal a Espanya i vius a Catalunya, l'IRPF que pagues és la suma de dues escales: l'estatal, del ${r(STATE_SCALE[0]!.rate)} al ${r(stateTop.rate)}, i la catalana, del ${r(CATALAN_SCALE[0]!.rate)} al ${r(catTop.rate)}.** El tipus combinat comença en el ${r(first.total)} sobre els primers ${m(first.to ?? 0)} de base liquidable i arriba al ${r(top.total)} per sobre de ${m(top.from)}. Les rendes de l'estalvi (interessos, dividends, guanys per vendes) tenen una escala pròpia, del ${r(savingsFirst)} al ${r(savingsTop)}. L'impost dels primers ${m(PERSONAL_MINIMUM)} (el mínim personal) es resta. Ets resident si passes més de 183 dies l'any a Espanya o si hi tens el centre dels teus interessos econòmics, i aleshores tributes per tota la renda mundial. L'empresa et reté cada mes amb una sola escala per a tot Espanya; l'escala catalana s'aplica quan fas la declaració anual (la renda), que és on es regularitza la diferència. Són les escales del ${Y}: l'estatal no ha canviat des del 2021 i la catalana, des de l'1 de gener de 2025.`,
      factsTitle: `L'IRPF del ${Y} a Catalunya en set respostes`,
      facts: [
        { label: "Escala estatal", value: `Del ${r(STATE_SCALE[0]!.rate)} al ${r(stateTop.rate)}, en ${STATE_SCALE.length} trams (Llei de l'IRPF, art. 63)` },
        { label: "Escala catalana", value: `Del ${r(CATALAN_SCALE[0]!.rate)} al ${r(catTop.rate)}, en ${CATALAN_SCALE.length} trams (Codi tributari de Catalunya, art. 611-1)` },
        { label: "Tipus combinat", value: `Del ${r(first.total)} al ${r(top.total)} (per sobre de ${m(top.from)})` },
        { label: "Estalvi", value: `Del ${r(savingsFirst)} al ${r(savingsTop)}, igual a tot Espanya` },
        { label: "Mínim personal", value: `${m(PERSONAL_MINIMUM)} l'any, també a l'escala catalana (més si tens més de 65 anys o fills)` },
        { label: "Residència fiscal", value: "Més de 183 dies a Espanya l'any natural, o el centre dels interessos econòmics aquí" },
        { label: "Declaració", value: "La renda es presenta a la primavera; la campanya de la renda 2025 va començar el 8 d'abril de 2026" },
      ],
      whoH: "Qui paga l'IRPF i per quines rendes",
      who: [
        `Paga l'IRPF qui és **resident fiscal a Espanya**. Segons l'${art9}, ho ets si passes més de 183 dies a Espanya durant l'any natural (les absències esporàdiques compten com a dies aquí, tret que demostris que ets resident fiscal en un altre país), o si aquí hi ha el nucli principal o la base de les teves activitats o interessos econòmics. També es presumeix que ets resident si hi viuen el teu cònjuge no separat i els fills menors que depenen de tu.`,
        `Un resident tributa per **tota la seva renda, sigui on sigui que l'hagi obtinguda**: el sou, però també els lloguers, els interessos o les pensions de fora. Si aquestes rendes ja han pagat impost a l'estranger, l'${art80} de la llei permet deduir el menor de dos imports: el que vas pagar fora o el que suposaria aquí aquella renda al teu tipus mitjà. Els convenis per evitar la doble imposició poden canviar on tributa cada renda.`,
        `Qui **no és resident** no paga IRPF, sinó l'impost sobre la renda de no residents, i només per les rendes obtingudes a Espanya: el ${r(NON_RESIDENT.general)} amb caràcter general i el ${r(NON_RESIDENT.euEea)} si resideix en un altre país de la UE o de l'Espai Econòmic Europeu (${irnr}). Qui es trasllada a Espanya per feina pot optar, durant sis anys, per un règim especial amb un tipus fix del 24 %: és la ${beckham}.`,
        "Navarra i el País Basc tenen un IRPF propi (règim foral): aquesta guia no els cobreix.",
      ],
      stateH: `L'escala estatal del ${Y}`,
      stateCaption: `Escala general estatal de l'IRPF (art. 63.1 de la Llei de l'IRPF, vigent des del 2021)`,
      scaleHead: ["Base liquidable", "Tipus", "Impost de la part de sota"],
      stateNote: `Font: ${lirpf} (BOE, text consolidat), llegida el 21 de novembre de 2026. La darrera columna és la quota íntegra que imprimeix la llei per a l'inici de cada tram.`,
      catH: `L'escala catalana del ${Y}`,
      catCaption: "Escala autonòmica de Catalunya (art. 611-1 del llibre sisè del Codi tributari de Catalunya)",
      catNote: `Font: ${dl5}, art. 3.1, i ${atc}, llegits el 21 de novembre de 2026.`,
      cat: [
        `El ${dl5} va reescriure l'escala catalana «amb efectes de l'1 de gener de 2025»: va passar de nou trams a vuit i el primer tipus va baixar al ${r(CATALAN_SCALE[0]!.rate)}. L'${atc} la publica com a tarifa de l'exercici 2025 i, per al 2026, només hi afegeix deduccions noves per a l'habitatge habitual en municipis rurals. No hem trobat cap norma posterior que torni a modificar l'escala (21 de novembre de 2026).`,
        `Catalunya aplica el mateix mínim personal que l'Estat, ${m(PERSONAL_MINIMUM)} l'any, segons el ${min}. Per això, en els exemples d'aquesta pàgina, l'impost dels primers ${m(PERSONAL_MINIMUM)} es resta a totes dues escales.`,
      ],
      combH: "El tipus marginal combinat d'un resident a Catalunya",
      combCaption: "Tipus marginal estatal + català per tram de base liquidable general",
      combHead: ["Base liquidable", "Estat", "Catalunya", "Total"],
      combNote: "Suma dels dos tipus de cada tram. És el tipus de l'últim euro, no el de tot el sou: el tipus mitjà sempre és més baix (vegeu els exemples).",
      comb: [
        `El tipus marginal més alt d'un resident a Catalunya és el ${r(top.total)}, per sobre de ${m(top.from)} de base (${r(top.state)} estatal i ${r(top.region)} català).`,
      ],
      exH: "Del sou brut a l'impost: exemples",
      stepsTitle: "Com es calcula l'IRPF d'un assalariat",
      steps: [
        { title: "Rendiment del treball", text: "Al sou brut li restes les cotitzacions a la Seguretat Social i 2.000 € l'any d'altres despeses (art. 19). Si el rendiment net és inferior a 19.747,50 €, hi ha a més una reducció (art. 20)." },
        { title: "Base liquidable", text: "Amb una sola empresa i cap altra renda, aquest import és la base liquidable general. Les aportacions a plans de pensions, per exemple, la redueixen." },
        { title: "Les dues escales", text: "Hi apliques l'escala estatal i la catalana, i a cadascuna li restes l'impost que donaria el mínim personal i familiar." },
        { title: "Deduccions i retencions", text: "De la quota en surten les deduccions (estatals i catalanes) i el que l'empresa ja t'ha retingut durant l'any. El resultat és la renda a pagar o a retornar." },
      ],
      exCaption: `IRPF ${Y} d'un resident a Catalunya: solter, menor de 65 anys, sense fills, una empresa, contracte indefinit, cap altra renda, abans de deduccions`,
      exHead: ["Sou brut", "Base liquidable", "Estat", "Catalunya", "IRPF total (% del brut)", "Retingut a la nòmina", "Diferència a la renda"],
      exNote: `Seguretat Social i retenció: les de la nostra calculadora, validada amb el servei de retencions de l'AEAT. Base: brut menys Seguretat Social i 2.000 €. L'IRPF aplica les dues escales d'aquesta pàgina amb un mínim de ${m(PERSONAL_MINIMUM)}. Una diferència positiva vol dir que a la renda surt a pagar, abans de les deduccions que et corresponguin.`,
      ex: [
        `Amb ${m(30000)} bruts, l'IRPF és de ${m(ex30.total)} (${r(ex30.rate)} del brut) i amb ${m(50000)}, de ${m(ex50.total)} (${r(ex50.rate)}). Per al teu cas, amb fills, una altra edat o pagues extra, fes servir la ${calcLink}: et dona la Seguretat Social, la retenció i el net de cada nòmina.`,
      ],
      whH: "Per què la renda pot sortir a pagar a Catalunya",
      wh: [
        `L'empresa no aplica l'escala catalana. Segons l'${algorithm}, la retenció es calcula amb una sola escala per a totes les comunitats de règim comú, i l'escala de cada comunitat només entra a la declaració. On l'escala catalana és més alta que aquesta escala comuna, el que t'han retingut es queda curt i la renda surt a pagar; la taula ho mostra a la darrera columna. Amb deduccions (lloguer, naixement d'un fill, donatius) o amb més d'una empresa, el resultat canvia.`,
      ],
      savH: "L'escala de l'estalvi",
      savCaption: "Escala de la base liquidable de l'estalvi (interessos, dividends, guanys i pèrdues per transmissions)",
      savHead: ["Base de l'estalvi", "Estat", "Comunitat", "Total"],
      savNote: `Font: Llei de l'IRPF, ${savingsLaw}, en la redacció de la Llei 7/2024, des de l'1 de gener de 2025. La meitat autonòmica la fixa la llei estatal: és igual a tot Espanya.`,
      fileH: "Has de fer la declaració de la renda?",
      file: [
        `L'${art96} de la llei diu qui no ha de declarar. Si només tens sou, no estàs obligat fins a ${m(FILING.onePayer)} bruts l'any d'una sola empresa, i fins a ${m(FILING.severalPayers)} si en tens més d'una (llevat que la segona i les següents sumin ${m(FILING.otherPayersUpTo)} o menys). Qui ha estat d'alta com a autònom en algun moment de l'any ha de declarar sempre. Encara que no hi estiguis obligat, et pot convenir declarar si te n'han de tornar.`,
        `La declaració de cada any es presenta a la primavera següent: la campanya de la renda 2025 va començar el 8 d'abril de 2026, segons la ${renta} de l'AEAT. Les dates de la renda 2026 les fixa una ordre ministerial i encara no s'havien publicat el 21 de novembre de 2026. Per entrar-hi necessites NIF o NIE i identificar-te (Cl@ve, certificat digital o número de referència); com aconseguir el NIE i la Cl@ve ho expliquem a la ${nieTie}. Per fer números abans, l'AEAT té el ${open}, un simulador que no demana identificació.`,
      ],
      dedH: "Deduccions catalanes",
      ded: [
        `Sobre la part catalana de la quota es poden aplicar, entre d'altres, les deduccions per lloguer de l'habitatge habitual, per naixement o adopció d'un fill, per quedar vidu o vídua, per rehabilitació de l'habitatge, per interessos de préstecs per a màsters i doctorats, per donatius (llengua catalana o occitana, recerca, medi ambient) i per haver de declarar per tenir més d'un pagador. Per a l'exercici 2026 n'hi ha de noves per a l'habitatge habitual en municipis rurals. Requisits i imports, a la pàgina de l'${atc}.`,
      ],
      mistakesH: "Errors habituals",
      mistakes: [
        `**Pensar que el ${r(top.total)} s'aplica a tot el sou.** Cada tipus només grava la part de la base que cau dins del seu tram; el tipus mitjà sempre és més baix que el marginal.`,
        "**Prendre la retenció de la nòmina per l'impost final.** La retenció és un avançament calculat amb una escala comuna; l'impost de debò es decideix a la renda, amb l'escala catalana i les teves deduccions.",
        "**Creure que els 183 dies són l'única regla.** També ets resident si aquí tens el centre dels teus interessos econòmics, encara que passis menys dies a Espanya.",
        "**Oblidar les rendes de fora.** Un resident declara també els comptes, els lloguers i les pensions de l'estranger; l'impost pagat fora es dedueix, no fa desaparèixer la renda.",
        "**Barrejar l'IRPF amb l'impost de no residents.** Si no ets resident no fas la renda: pagues l'impost de no residents per les rendes d'Espanya.",
      ],
      warnTitle: "Abans de decidir res",
      warn: "Aquesta pàgina explica les escales i un cas simple; no és assessorament fiscal. Si tens rendes en més d'un país, guanys per vendes, un negoci propi o dubtes sobre la residència, consulta l'Agència Tributària o un assessor fiscal abans de presentar res.",
      faqH: "Preguntes freqüents",
      faq: [
        { question: `Quins són els trams de l'IRPF del ${Y}?`, answer: `L'escala estatal té ${STATE_SCALE.length} trams, del ${r(STATE_SCALE[0]!.rate)} al ${r(stateTop.rate)}, i la catalana ${CATALAN_SCALE.length}, del ${r(CATALAN_SCALE[0]!.rate)} al ${r(catTop.rate)}. Un resident a Catalunya paga la suma: del ${r(first.total)} sobre els primers ${m(first.to ?? 0)} al ${r(top.total)} per sobre de ${m(top.from)}.` },
        { question: "Quin és el tipus màxim de l'IRPF a Catalunya?", answer: `El ${r(top.total)} de la base general per sobre de ${m(top.from)} (${r(top.state)} estatal més ${r(top.region)} català). Les rendes de l'estalvi tenen un màxim del ${r(savingsTop)}.` },
        { question: "Quant IRPF es paga amb un sou de 30.000 € a Catalunya?", answer: `Per a una persona sola, sense fills, amb una sola empresa i abans de deduccions, ${m(ex30.total)} l'any (${r(ex30.rate)} del brut). Amb ${m(50000)}, ${m(ex50.total)} (${r(ex50.rate)}). La taula d'exemples en dona més imports.` },
        { question: "He de pagar a Espanya si hi visc menys de 183 dies?", answer: "Pots ser resident igualment si aquí tens el centre dels teus interessos econòmics, o si hi viuen el teu cònjuge i els fills menors. Si no ets resident, pagues l'impost de no residents, només per les rendes obtingudes a Espanya." },
        { question: "Tributen a Espanya les rendes de l'estranger?", answer: "Si ets resident, sí: l'IRPF grava tota la renda mundial. L'impost pagat fora es pot deduir dins dels límits de l'article 80 de la llei, i els convenis de doble imposició poden decidir quin país grava cada renda." },
        { question: "He de fer la declaració de la renda?", answer: `Amb només sou, no hi estàs obligat fins a ${m(FILING.onePayer)} bruts d'una sola empresa o ${m(FILING.severalPayers)} si en tens més d'una. Els autònoms declaren sempre.` },
        { question: `Han canviat els trams de l'IRPF el ${Y}?`, answer: "No. L'escala estatal és la mateixa des del 2021 i la catalana, des de l'1 de gener de 2025 (Decret llei 5/2025). Per al 2026, Catalunya hi ha afegit deduccions per a l'habitatge en municipis rurals." },
        { question: "Em convé la llei Beckham?", answer: "Si et traslladeu a Espanya per feina i no hi has estat resident els cinc anys anteriors, pots tributar al 24 % fix sobre el sou fins a 600.000 €. Com més alt és el sou, més hi guanyes; els requisits i el termini de sis mesos són a la guia de la llei Beckham." },
      ],
      official: `Llei de l'IRPF (BOE, text consolidat, arts. 2, 9, 19, 20, 57, 63, 66, 74, 76, 80 i 96), ${dl5}, ${atc}, ${min}, ${irnr}, ${algorithm} i ${renta}.`,
    },
    es: {
      lead: `**Si eres residente fiscal en España y vives en Cataluña, el IRPF que pagas es la suma de dos escalas: la estatal, del ${r(STATE_SCALE[0]!.rate)} al ${r(stateTop.rate)}, y la catalana, del ${r(CATALAN_SCALE[0]!.rate)} al ${r(catTop.rate)}.** El tipo combinado empieza en el ${r(first.total)} sobre los primeros ${m(first.to ?? 0)} de base liquidable y llega al ${r(top.total)} por encima de ${m(top.from)}. Las rentas del ahorro (intereses, dividendos, ganancias por ventas) tienen una escala propia, del ${r(savingsFirst)} al ${r(savingsTop)}. El impuesto de los primeros ${m(PERSONAL_MINIMUM)} (el mínimo personal) se resta. Eres residente si pasas más de 183 días al año en España o si tienes aquí el centro de tus intereses económicos, y entonces tributas por toda tu renta mundial. La empresa te retiene cada mes con una sola escala para toda España; la escala catalana se aplica cuando haces la declaración anual (la Renta), que es donde se regulariza la diferencia. Son las escalas de ${Y}: la estatal no ha cambiado desde 2021 y la catalana, desde el 1 de enero de 2025.`,
      factsTitle: `El IRPF de ${Y} en Cataluña en siete respuestas`,
      facts: [
        { label: "Escala estatal", value: `Del ${r(STATE_SCALE[0]!.rate)} al ${r(stateTop.rate)}, en ${STATE_SCALE.length} tramos (Ley del IRPF, art. 63)` },
        { label: "Escala catalana", value: `Del ${r(CATALAN_SCALE[0]!.rate)} al ${r(catTop.rate)}, en ${CATALAN_SCALE.length} tramos (Código tributario de Cataluña, art. 611-1)` },
        { label: "Tipo combinado", value: `Del ${r(first.total)} al ${r(top.total)} (por encima de ${m(top.from)})` },
        { label: "Ahorro", value: `Del ${r(savingsFirst)} al ${r(savingsTop)}, igual en toda España` },
        { label: "Mínimo personal", value: `${m(PERSONAL_MINIMUM)} al año, también en la escala catalana (más si tienes más de 65 años o hijos)` },
        { label: "Residencia fiscal", value: "Más de 183 días en España en el año natural, o el centro de los intereses económicos aquí" },
        { label: "Declaración", value: "La Renta se presenta en primavera; la campaña de la Renta 2025 empezó el 8 de abril de 2026" },
      ],
      whoH: "Quién paga el IRPF y por qué rentas",
      who: [
        `Paga el IRPF quien es **residente fiscal en España**. Según el ${art9}, lo eres si pasas más de 183 días en España durante el año natural (las ausencias esporádicas cuentan como días aquí, salvo que demuestres que eres residente fiscal en otro país), o si aquí está el núcleo principal o la base de tus actividades o intereses económicos. También se presume que eres residente si viven aquí tu cónyuge no separado y los hijos menores que dependen de ti.`,
        `Un residente tributa por **toda su renta, la haya obtenido donde la haya obtenido**: el sueldo, pero también los alquileres, los intereses o las pensiones de fuera. Si esas rentas ya han pagado impuesto en el extranjero, el ${art80} de la ley permite deducir el menor de dos importes: lo que pagaste fuera o lo que supondría aquí esa renta a tu tipo medio. Los convenios para evitar la doble imposición pueden cambiar dónde tributa cada renta.`,
        `Quien **no es residente** no paga IRPF, sino el impuesto sobre la renta de no residentes, y solo por las rentas obtenidas en España: el ${r(NON_RESIDENT.general)} con carácter general y el ${r(NON_RESIDENT.euEea)} si reside en otro país de la UE o del Espacio Económico Europeo (${irnr}). Quien se traslada a España por trabajo puede optar, durante seis años, por un régimen especial con un tipo fijo del 24 %: es la ${beckham}.`,
        "Navarra y el País Vasco tienen un IRPF propio (régimen foral): esta guía no los cubre.",
      ],
      stateH: `La escala estatal de ${Y}`,
      stateCaption: "Escala general estatal del IRPF (art. 63.1 de la Ley del IRPF, vigente desde 2021)",
      scaleHead: ["Base liquidable", "Tipo", "Impuesto de la parte de abajo"],
      stateNote: `Fuente: ${lirpf} (BOE, texto consolidado), leída el 21 de noviembre de 2026. La última columna es la cuota íntegra que imprime la ley para el inicio de cada tramo.`,
      catH: `La escala catalana de ${Y}`,
      catCaption: "Escala autonómica de Cataluña (art. 611-1 del libro sexto del Código tributario de Cataluña)",
      catNote: `Fuente: ${dl5}, art. 3.1, y ${atc}, leídos el 21 de noviembre de 2026.`,
      cat: [
        `El ${dl5} reescribió la escala catalana «con efectos del 1 de enero de 2025»: pasó de nueve tramos a ocho y el primer tipo bajó al ${r(CATALAN_SCALE[0]!.rate)}. La ${atc} la publica como tarifa del ejercicio 2025 y, para 2026, solo añade deducciones nuevas por la vivienda habitual en municipios rurales. No hemos encontrado ninguna norma posterior que vuelva a modificar la escala (21 de noviembre de 2026).`,
        `Cataluña aplica el mismo mínimo personal que el Estado, ${m(PERSONAL_MINIMUM)} al año, según el ${min}. Por eso, en los ejemplos de esta página, el impuesto de los primeros ${m(PERSONAL_MINIMUM)} se resta en las dos escalas.`,
      ],
      combH: "El tipo marginal combinado de un residente en Cataluña",
      combCaption: "Tipo marginal estatal + catalán por tramo de base liquidable general",
      combHead: ["Base liquidable", "Estado", "Cataluña", "Total"],
      combNote: "Suma de los dos tipos de cada tramo. Es el tipo del último euro, no el de todo el sueldo: el tipo medio siempre es más bajo (mira los ejemplos).",
      comb: [
        `El tipo marginal más alto de un residente en Cataluña es el ${r(top.total)}, por encima de ${m(top.from)} de base (${r(top.state)} estatal y ${r(top.region)} catalán).`,
      ],
      exH: "Del sueldo bruto al impuesto: ejemplos",
      stepsTitle: "Cómo se calcula el IRPF de un asalariado",
      steps: [
        { title: "Rendimiento del trabajo", text: "Al sueldo bruto le restas las cotizaciones a la Seguridad Social y 2.000 € al año de otros gastos (art. 19). Si el rendimiento neto es inferior a 19.747,50 €, hay además una reducción (art. 20)." },
        { title: "Base liquidable", text: "Con una sola empresa y ninguna otra renta, ese importe es la base liquidable general. Las aportaciones a planes de pensiones, por ejemplo, la reducen." },
        { title: "Las dos escalas", text: "Le aplicas la escala estatal y la catalana, y a cada una le restas el impuesto que daría el mínimo personal y familiar." },
        { title: "Deducciones y retenciones", text: "De la cuota salen las deducciones (estatales y catalanas) y lo que la empresa ya te ha retenido durante el año. El resultado es la Renta a pagar o a devolver." },
      ],
      exCaption: `IRPF ${Y} de un residente en Cataluña: soltero, menor de 65 años, sin hijos, una empresa, contrato indefinido, ninguna otra renta, antes de deducciones`,
      exHead: ["Sueldo bruto", "Base liquidable", "Estado", "Cataluña", "IRPF total (% del bruto)", "Retenido en la nómina", "Diferencia en la Renta"],
      exNote: `Seguridad Social y retención: las de nuestra calculadora, validada con el servicio de retenciones de la AEAT. Base: bruto menos Seguridad Social y 2.000 €. El IRPF aplica las dos escalas de esta página con un mínimo de ${m(PERSONAL_MINIMUM)}. Una diferencia positiva quiere decir que la Renta sale a pagar, antes de las deducciones que te correspondan.`,
      ex: [
        `Con ${m(30000)} brutos, el IRPF es de ${m(ex30.total)} (${r(ex30.rate)} del bruto) y con ${m(50000)}, de ${m(ex50.total)} (${r(ex50.rate)}). Para tu caso, con hijos, otra edad o pagas extra, usa la ${calcLink}: te da la Seguridad Social, la retención y el neto de cada nómina.`,
      ],
      whH: "Por qué la Renta puede salir a pagar en Cataluña",
      wh: [
        `La empresa no aplica la escala catalana. Según el ${algorithm}, la retención se calcula con una sola escala para todas las comunidades de régimen común, y la escala de cada comunidad solo entra en la declaración. Donde la escala catalana es más alta que esa escala común, lo que te han retenido se queda corto y la Renta sale a pagar; la tabla lo muestra en la última columna. Con deducciones (alquiler, nacimiento de un hijo, donativos) o con más de una empresa, el resultado cambia.`,
      ],
      savH: "La escala del ahorro",
      savCaption: "Escala de la base liquidable del ahorro (intereses, dividendos, ganancias y pérdidas por transmisiones)",
      savHead: ["Base del ahorro", "Estado", "Comunidad", "Total"],
      savNote: `Fuente: Ley del IRPF, ${savingsLaw}, en la redacción de la Ley 7/2024, desde el 1 de enero de 2025. La mitad autonómica la fija la ley estatal: es igual en toda España.`,
      fileH: "¿Tienes que hacer la declaración de la Renta?",
      file: [
        `El ${art96} de la ley dice quién no tiene que declarar. Si solo tienes sueldo, no estás obligado hasta ${m(FILING.onePayer)} brutos al año de una sola empresa, y hasta ${m(FILING.severalPayers)} si tienes más de una (salvo que la segunda y las siguientes sumen ${m(FILING.otherPayersUpTo)} o menos). Quien ha estado dado de alta como autónomo en algún momento del año tiene que declarar siempre. Aunque no estés obligado, te puede convenir declarar si te tienen que devolver.`,
        `La declaración de cada año se presenta en la primavera siguiente: la campaña de la Renta 2025 empezó el 8 de abril de 2026, según la ${renta} de la AEAT. Las fechas de la Renta 2026 las fija una orden ministerial y aún no se habían publicado el 21 de noviembre de 2026. Para entrar necesitas NIF o NIE e identificarte (Cl@ve, certificado digital o número de referencia); cómo conseguir el NIE y la Cl@ve lo explicamos en la ${nieTie}. Para hacer números antes, la AEAT tiene ${open}, un simulador que no pide identificación.`,
      ],
      dedH: "Deducciones catalanas",
      ded: [
        `Sobre la parte catalana de la cuota se pueden aplicar, entre otras, las deducciones por alquiler de la vivienda habitual, por nacimiento o adopción de un hijo, por quedarse viudo o viuda, por rehabilitación de la vivienda, por intereses de préstamos para másteres y doctorados, por donativos (lengua catalana u occitana, investigación, medio ambiente) y por tener que declarar por tener más de un pagador. Para el ejercicio 2026 hay nuevas para la vivienda habitual en municipios rurales. Requisitos e importes, en la página de la ${atc}.`,
      ],
      mistakesH: "Errores habituales",
      mistakes: [
        `**Pensar que el ${r(top.total)} se aplica a todo el sueldo.** Cada tipo solo grava la parte de la base que cae dentro de su tramo; el tipo medio siempre es más bajo que el marginal.`,
        "**Tomar la retención de la nómina por el impuesto final.** La retención es un adelanto calculado con una escala común; el impuesto de verdad se decide en la Renta, con la escala catalana y tus deducciones.",
        "**Creer que los 183 días son la única regla.** También eres residente si aquí tienes el centro de tus intereses económicos, aunque pases menos días en España.",
        "**Olvidar las rentas de fuera.** Un residente declara también las cuentas, los alquileres y las pensiones del extranjero; el impuesto pagado fuera se deduce, no hace desaparecer la renta.",
        "**Mezclar el IRPF con el impuesto de no residentes.** Si no eres residente no haces la Renta: pagas el impuesto de no residentes por las rentas de España.",
      ],
      warnTitle: "Antes de decidir nada",
      warn: "Esta página explica las escalas y un caso simple; no es asesoramiento fiscal. Si tienes rentas en más de un país, ganancias por ventas, un negocio propio o dudas sobre la residencia, consulta a la Agencia Tributaria o a un asesor fiscal antes de presentar nada.",
      faqH: "Preguntas frecuentes",
      faq: [
        { question: `¿Cuáles son los tramos del IRPF de ${Y}?`, answer: `La escala estatal tiene ${STATE_SCALE.length} tramos, del ${r(STATE_SCALE[0]!.rate)} al ${r(stateTop.rate)}, y la catalana ${CATALAN_SCALE.length}, del ${r(CATALAN_SCALE[0]!.rate)} al ${r(catTop.rate)}. Un residente en Cataluña paga la suma: del ${r(first.total)} sobre los primeros ${m(first.to ?? 0)} al ${r(top.total)} por encima de ${m(top.from)}.` },
        { question: "¿Cuál es el tipo máximo del IRPF en Cataluña?", answer: `El ${r(top.total)} de la base general por encima de ${m(top.from)} (${r(top.state)} estatal más ${r(top.region)} catalán). Las rentas del ahorro tienen un máximo del ${r(savingsTop)}.` },
        { question: "¿Cuánto IRPF se paga con un sueldo de 30.000 € en Cataluña?", answer: `Para una persona sola, sin hijos, con una sola empresa y antes de deducciones, ${m(ex30.total)} al año (${r(ex30.rate)} del bruto). Con ${m(50000)}, ${m(ex50.total)} (${r(ex50.rate)}). La tabla de ejemplos da más importes.` },
        { question: "¿Tengo que pagar en España si vivo aquí menos de 183 días?", answer: "Puedes ser residente igualmente si aquí tienes el centro de tus intereses económicos, o si viven aquí tu cónyuge y los hijos menores. Si no eres residente, pagas el impuesto de no residentes, solo por las rentas obtenidas en España." },
        { question: "¿Tributan en España las rentas del extranjero?", answer: "Si eres residente, sí: el IRPF grava toda la renta mundial. El impuesto pagado fuera se puede deducir dentro de los límites del artículo 80 de la ley, y los convenios de doble imposición pueden decidir qué país grava cada renta." },
        { question: "¿Tengo que hacer la declaración de la Renta?", answer: `Con solo sueldo, no estás obligado hasta ${m(FILING.onePayer)} brutos de una sola empresa o ${m(FILING.severalPayers)} si tienes más de una. Los autónomos declaran siempre.` },
        { question: `¿Han cambiado los tramos del IRPF en ${Y}?`, answer: "No. La escala estatal es la misma desde 2021 y la catalana, desde el 1 de enero de 2025 (Decreto-ley 5/2025). Para 2026, Cataluña ha añadido deducciones por la vivienda en municipios rurales." },
        { question: "¿Me conviene la ley Beckham?", answer: "Si te trasladas a España por trabajo y no has sido residente aquí los cinco años anteriores, puedes tributar al 24 % fijo sobre el sueldo hasta 600.000 €. Cuanto más alto es el sueldo, más ganas; los requisitos y el plazo de seis meses están en la guía de la ley Beckham." },
      ],
      official: `Ley del IRPF (BOE, texto consolidado, arts. 2, 9, 19, 20, 57, 63, 66, 74, 76, 80 y 96), ${dl5}, ${atc}, ${min}, ${irnr}, ${algorithm} y ${renta}.`,
    },
    en: {
      lead: `**If you are tax resident in Spain and live in Catalonia, your income tax (IRPF) is two scales added together: the State's, from ${r(STATE_SCALE[0]!.rate)} to ${r(stateTop.rate)}, and Catalonia's, from ${r(CATALAN_SCALE[0]!.rate)} to ${r(catTop.rate)}.** The combined rate starts at ${r(first.total)} on the first ${m(first.to ?? 0)} of taxable income and reaches ${r(top.total)} above ${m(top.from)}. Savings income (interest, dividends, gains on sales) has its own scale, ${r(savingsFirst)} to ${r(savingsTop)}. The tax on the first ${m(PERSONAL_MINIMUM)} (the personal allowance) is taken off. You are resident if you spend more than 183 days a year in Spain or your main economic interests are here, and then Spain taxes your worldwide income. Your employer withholds tax every month with one Spain-wide scale; the Catalan scale is applied when you file the annual return (the Renta), which settles the difference. These are the ${Y} scales: the State one has not changed since 2021, the Catalan one since 1 January 2025.`,
      factsTitle: `Income tax in Catalonia in ${Y}: seven answers`,
      facts: [
        { label: "State scale", value: `${r(STATE_SCALE[0]!.rate)} to ${r(stateTop.rate)}, ${STATE_SCALE.length} bands (IRPF Law, art. 63)` },
        { label: "Catalan scale", value: `${r(CATALAN_SCALE[0]!.rate)} to ${r(catTop.rate)}, ${CATALAN_SCALE.length} bands (Catalan Tax Code, art. 611-1)` },
        { label: "Combined rate", value: `${r(first.total)} to ${r(top.total)} (above ${m(top.from)})` },
        { label: "Savings income", value: `${r(savingsFirst)} to ${r(savingsTop)}, the same across Spain` },
        { label: "Personal allowance", value: `${m(PERSONAL_MINIMUM)} a year, in the Catalan scale too (more over 65 or with children)` },
        { label: "Tax residence", value: "More than 183 days in Spain in the calendar year, or your centre of economic interests here" },
        { label: "Tax return", value: "The Renta is filed in spring; the 2025 campaign opened on 8 April 2026" },
      ],
      whoH: "Who pays Spanish income tax, and on what",
      who: [
        `You pay IRPF if you are **tax resident in Spain**. Under ${art9}, you are if you spend more than 183 days in Spain in the calendar year (sporadic absences count as days here unless you prove you are tax resident in another country), or if your main centre or base of activities or economic interests is here. You are also presumed resident if your spouse (not legally separated) and the minor children who depend on you live here.`,
        `A resident is taxed on **all their income, wherever it is earned**: salary, but also rent, interest or pensions from abroad. If that income has already been taxed abroad, ${art80} of the law lets you deduct the lower of two amounts: what you paid abroad, or what that income would cost here at your average rate. Double tax treaties can change where each kind of income is taxed.`,
        `A **non-resident** pays non-residents' income tax instead, and only on income earned in Spain: ${r(NON_RESIDENT.general)} in general and ${r(NON_RESIDENT.euEea)} for residents of another EU or European Economic Area country (${irnr}). If you move to Spain for work you may be able to choose, for six years, a special regime with a flat 24% rate: see our ${beckham}.`,
        "Navarre and the Basque Country have their own income tax (foral regime): this guide does not cover them.",
      ],
      stateH: `The State scale for ${Y}`,
      stateCaption: "State general income tax scale (art. 63.1 of the IRPF Law, in force since 2021)",
      scaleHead: ["Taxable base", "Rate", "Tax on the part below"],
      stateNote: `Source: ${lirpf} (BOE consolidated text), read on 21 November 2026. The last column is the tax the law prints for the start of each band.`,
      catH: `The Catalan scale for ${Y}`,
      catCaption: "Catalonia's regional scale (art. 611-1 of book six of the Catalan Tax Code)",
      catNote: `Source: ${dl5}, art. 3.1, and the ${atc}, read on 21 November 2026.`,
      cat: [
        `${dl5} rewrote the Catalan scale "with effect from 1 January 2025": it went from nine bands to eight and the first rate fell to ${r(CATALAN_SCALE[0]!.rate)}. The ${atc} publishes it as the 2025 tariff and, for 2026, only adds new deductions for a main home in a rural municipality. We found no later law changing the scale again (21 November 2026).`,
        `Catalonia uses the same personal allowance as the State, ${m(PERSONAL_MINIMUM)} a year, according to the ${min}. That is why, in the examples on this page, the tax on the first ${m(PERSONAL_MINIMUM)} is taken off in both scales.`,
      ],
      combH: "The combined marginal rate for a resident of Catalonia",
      combCaption: "State + Catalan marginal rate by band of general taxable base",
      combHead: ["Taxable base", "State", "Catalonia", "Total"],
      combNote: "The two rates of each band added together. It is the rate on the last euro, not on the whole salary: the average rate is always lower (see the examples).",
      comb: [
        `The highest marginal rate for a resident of Catalonia is ${r(top.total)}, on taxable income above ${m(top.from)} (${r(top.state)} State and ${r(top.region)} Catalan).`,
      ],
      exH: "From gross salary to tax: worked examples",
      stepsTitle: "How an employee's income tax is worked out",
      steps: [
        { title: "Net employment income", text: "Take your gross pay and subtract your Social Security contributions and €2,000 a year of other expenses (art. 19). If the result is under €19,747.50 there is a further reduction (art. 20)." },
        { title: "Taxable base", text: "With one employer and no other income, that amount is your general taxable base. Pension plan contributions, for example, reduce it." },
        { title: "The two scales", text: "Apply the State scale and the Catalan scale, and from each take off the tax the same scale gives on your personal and family allowance." },
        { title: "Deductions and withholding", text: "Subtract any deductions (State and Catalan) and what your employer has already withheld during the year. The result is what you pay or get back in the Renta." },
      ],
      exCaption: `Income tax ${Y} for a resident of Catalonia: single, under 65, no children, one employer, open-ended contract, no other income, before deductions`,
      exHead: ["Gross salary", "Taxable base", "State", "Catalonia", "Total tax (% of gross)", "Withheld from pay", "Difference in the Renta"],
      exNote: `Social Security and withholding come from our calculator, checked against the AEAT's withholding service. Base: gross minus Social Security and €2,000. The tax applies the two scales on this page with a ${m(PERSONAL_MINIMUM)} allowance. A positive difference means the return asks you to pay, before any deductions you are entitled to.`,
      ex: [
        `On ${m(30000)} gross, the income tax is ${m(ex30.total)} (${r(ex30.rate)} of gross) and on ${m(50000)}, ${m(ex50.total)} (${r(ex50.rate)}). For your own case, with children, another age or extra payments, use the ${calcLink}: it gives you Social Security, the withholding and the net on each payslip.`,
      ],
      whH: "Why the Renta can ask Catalan residents to pay",
      wh: [
        `Your employer does not apply the Catalan scale. Under the ${algorithm}, withholding uses one scale for every common-regime region, and each region's scale only comes in with the return. Where the Catalan scale is higher than that common scale, what was withheld falls short and the return asks you to pay; the table shows it in its last column. Deductions (rent, a new child, donations) or a second employer change the result.`,
      ],
      savH: "The savings income scale",
      savCaption: "Scale for the savings taxable base (interest, dividends, gains and losses on sales)",
      savHead: ["Savings base", "State", "Region", "Total"],
      savNote: `Source: IRPF Law, ${savingsLaw}, as worded by Ley 7/2024, from 1 January 2025. The regional half is set by State law, so it is the same in every region.`,
      fileH: "Do you have to file a tax return?",
      file: [
        `${art96} of the law says who does not have to file. With salary only, you are not obliged up to ${m(FILING.onePayer)} gross a year from one employer, or ${m(FILING.severalPayers)} with more than one (unless the second and later ones add up to ${m(FILING.otherPayersUpTo)} or less). Anyone registered as self-employed at any point in the year must always file. Even when you do not have to, filing can pay off if you are owed a refund.`,
        `Each year's return is filed the following spring: the Renta 2025 campaign opened on 8 April 2026, according to the AEAT's ${renta}. The dates for Renta 2026 are set by a ministerial order and had not been published on 21 November 2026. To file you need a NIF or NIE and a way to identify yourself (Cl@ve, a digital certificate or a reference number); how to get the NIE and Cl@ve is in our ${nieTie}. To run the numbers first, the AEAT has ${open}, a simulator that needs no login.`,
      ],
      dedH: "Catalan deductions",
      ded: [
        `On the Catalan part of the tax you can apply, among others, deductions for renting your main home, for the birth or adoption of a child, for becoming a widow or widower, for renovating your home, for interest on loans for master's and doctoral studies, for donations (Catalan or Occitan language, research, environment) and for having to file because you had more than one payer. For tax year 2026 there are new ones for a main home in a rural municipality. Conditions and amounts are on the ${atc} page.`,
      ],
      mistakesH: "Common mistakes",
      mistakes: [
        `**Thinking ${r(top.total)} applies to the whole salary.** Each rate only taxes the part of the base inside its band; your average rate is always lower than the marginal one.`,
        "**Taking payslip withholding for the final tax.** Withholding is an advance worked out with a common scale; the real tax is settled in the Renta, with the Catalan scale and your deductions.",
        "**Believing 183 days is the only test.** You are also resident if your centre of economic interests is here, even if you spend fewer days in Spain.",
        "**Forgetting income from abroad.** A resident also declares foreign accounts, rent and pensions; tax paid abroad is deducted, it does not make the income disappear.",
        "**Mixing up income tax and non-residents' tax.** If you are not resident you do not file a Renta: you pay non-residents' income tax on your Spanish income.",
      ],
      warnTitle: "Before you decide anything",
      warn: "This page explains the scales and one simple case; it is not tax advice. If you have income in more than one country, gains on sales, your own business or doubts about your residence, ask the Tax Agency or a tax adviser before you file.",
      faqH: "Frequently asked questions",
      faq: [
        { question: `What are the income tax rates in Spain in ${Y}?`, answer: `The State scale has ${STATE_SCALE.length} bands, ${r(STATE_SCALE[0]!.rate)} to ${r(stateTop.rate)}, and Catalonia's has ${CATALAN_SCALE.length}, ${r(CATALAN_SCALE[0]!.rate)} to ${r(catTop.rate)}. A resident of Catalonia pays both: from ${r(first.total)} on the first ${m(first.to ?? 0)} to ${r(top.total)} above ${m(top.from)}.` },
        { question: "What is the top income tax rate in Catalonia?", answer: `${r(top.total)} of general taxable income above ${m(top.from)} (${r(top.state)} State plus ${r(top.region)} Catalan). Savings income tops out at ${r(savingsTop)}.` },
        { question: "How much income tax do I pay on a €30,000 salary in Catalonia?", answer: `For a single person without children, one employer and before deductions, ${m(ex30.total)} a year (${r(ex30.rate)} of gross). On ${m(50000)}, ${m(ex50.total)} (${r(ex50.rate)}). The examples table has more amounts.` },
        { question: "Do I pay tax in Spain if I live here less than 183 days?", answer: "You can still be resident if your centre of economic interests is here, or if your spouse and minor children live here. If you are not resident, you pay non-residents' income tax, on income earned in Spain only." },
        { question: "Do I pay Spanish tax on income from abroad?", answer: "If you are resident, yes: income tax covers your worldwide income. Tax paid abroad can be deducted within the limits of article 80 of the law, and double tax treaties can decide which country taxes each kind of income." },
        { question: "Do I have to file a tax return in Spain?", answer: `With salary only, not up to ${m(FILING.onePayer)} gross from one employer, or ${m(FILING.severalPayers)} with more than one. The self-employed always file.` },
        { question: `Did the income tax brackets change in ${Y}?`, answer: "No. The State scale has been the same since 2021 and the Catalan one since 1 January 2025 (Decree-law 5/2025). For 2026 Catalonia added deductions for a home in a rural municipality." },
        { question: "Is the Beckham law better for me?", answer: "If you move to Spain for work and were not resident here in the previous five years, you may pay a flat 24% on your salary up to €600,000. The higher the salary, the more you gain; the conditions and the six-month deadline are in our Beckham law guide." },
      ],
      official: `IRPF Law (BOE consolidated text, arts. 2, 9, 19, 20, 57, 63, 66, 74, 76, 80 and 96), ${dl5}, the ${atc}, the ${min}, the ${irnr}, the ${algorithm} and the ${renta}.`,
    },
  }[L];

  return [
    lead(t.lead),
    keyFacts(t.factsTitle, t.facts),
    ...h2(t.whoH, ...t.who),
    ...h2(t.stateH),
    table(t.stateCaption, t.scaleHead, scaleRows(STATE_SCALE), t.stateNote),
    ...h2(t.catH),
    table(t.catCaption, t.scaleHead, scaleRows(CATALAN_SCALE), t.catNote),
    ...paras(...t.cat),
    ...h2(t.combH),
    table(t.combCaption, t.combHead, combinedRows, t.combNote),
    ...paras(...t.comb),
    { type: "heading", level: 2, text: t.exH } as Block,
    steps(t.stepsTitle, t.steps),
    table(t.exCaption, t.exHead, exampleRows, t.exNote),
    ...paras(...t.ex),
    ...h2(t.whH, ...t.wh),
    ...h2(t.savH),
    table(t.savCaption, t.savHead, savingsRows, t.savNote),
    ...h2(t.fileH, ...t.file),
    ...h2(t.dedH, ...t.ded),
    ...h2(t.mistakesH),
    list(...t.mistakes),
    callout("warning", t.warnTitle, t.warn),
    { type: "heading", level: 2, text: t.faqH } as Block,
    faq(t.faq),
    callout("official", verifiedLine(L, INCOME_TAX_AS_OF), t.official),
    ...b2Related(["beckhamLaw", "nieTie", "padro", "tsi"], L, [netSalaryRelatedItem(L)]),
  ];
}

export const INCOME_TAX_GUIDE: B2Article = {
  key: "incomeTax",
  entryKey: "guide-income-tax-brackets-catalonia",
  categoryKey: "public-services",
  sources: SOURCES,
  heroKey: "irpf-agencia-tributaria-aduana-barcelona",
  heroAlt: {
    ca: "Edifici de la Duana de Barcelona, que acull oficines de l'Agència Tributària, a la vora del port",
    es: "Edificio de la Aduana de Barcelona, con oficinas de la Agencia Tributaria, junto al puerto",
    en: "The Barcelona Customs House, home to Tax Agency (Agència Tributària) offices, beside the harbour",
  },
  heroCaption: {
    ca: "Edifici de la Duana, oficina de l'Agència Tributària al port de Barcelona.",
    es: "Edificio de la Aduana, oficina de la Agencia Tributaria en el puerto de Barcelona.",
    en: "The Customs House, a Tax Agency office at the port of Barcelona.",
  },
  verifiedAt: INCOME_TAX_AS_OF,
  publishedAt: "2026-11-21T20:00:00+01:00",
  editions: Object.fromEntries(
    LOCALES.map((locale) => [locale, { path: B2_PATHS.incomeTax[locale], ...INCOME_TAX_META[locale], blocks: buildIncomeTaxBody(locale) }]),
  ) as B2Article["editions"],
};
