import { DISCOUNT_2026 } from "@/lib/programmatic/bono-social/rules";
import { RULES_VALID_UNTIL as EMPLOYMENT_UNTIL } from "@/lib/programmatic/employment/rules";
import { EXTRA_PAY_RULES_UNTIL } from "@/lib/programmatic/extra-pay/rules";
import { caDayArticle, dayMonthYear } from "@/lib/programmatic/holidays/format";
import { IPREM_RECHECK_FROM } from "@/lib/programmatic/iprem/rules";
import { SALARY_RULES_UNTIL, SMI_DEDUCTION, SOCIAL_SECURITY } from "@/lib/programmatic/net-salary/rules-2026";
import { RULES_UNTIL as NC_PENSION_UNTIL } from "@/lib/programmatic/non-contributory-pension/rules";
import { RULES_UNTIL as SELF_EMPLOYED_UNTIL, SMI_ANNUAL as SELF_EMPLOYED_SMI_2026, STATUS_2027 as SELF_EMPLOYED_2027 } from "@/lib/programmatic/self-employed/rules-2026";
import { RULES_UNTIL as SICK_LEAVE_UNTIL } from "@/lib/programmatic/sick-leave/rules";
import { money } from "@/lib/programmatic/smi/copy";
import { OFFICIAL_2027 as SMI_OFFICIAL_2027, SMI_2026 } from "@/lib/programmatic/smi/rules";
import { INCOME_LIMIT as SUBSIDY_INCOME_LIMIT_2026, INCOME_LIMIT_SHARE, SUBSIDY_RULES_UNTIL } from "@/lib/programmatic/unemployment-subsidy/rules";
import {
  BURDEN_SMI_SHARE,
  BURDEN_THRESHOLD as WIDOW_BURDEN_2026,
  REMARRIAGE_INCOME_LIMIT as WIDOW_REMARRIAGE_2026,
  REMARRIAGE_SMI_TIMES,
  RULES_UNTIL as WIDOW_UNTIL,
} from "@/lib/programmatic/widow-pension/rules";

import { calculatorCard } from "./hub";
import { calcPath, type CalcLocale, type CalculatorId } from "./paths";

/**
 * 2027 in every calculator of the registry (paths.ts): which 2027 figures are
 * already official, which are not and which instrument will set them, and
 * what the page says once its 2026 figures stop applying.
 *
 * The rule (docs/CALCULATORS_2027.md, the watch-list): a 2027 figure appears
 * here only once a norm in the BOE prints it ("published"), the law itself
 * fixes it for 2027 ("law", e.g. the MEI scale of LGSS DT 43.ª) or it follows
 * by arithmetic from such a figure and a rule the norm states ("derived",
 * e.g. 75 % of the 2027 SMI). Nothing is estimated: what a future
 * instrument will fix stays in `PENDING` with that instrument, last year's
 * one and the official page to watch.
 *
 * The block (components/programmatic/calculators/Year2027Status.tsx) sits under
 * each tool, inside CalculatorNextStep:
 *  - before the tool's own guard date: the 2027 figures already official, if any;
 *  - "yearly" tools, from their guard date (the module's RULES_UNTIL, the
 *    first day its 2026 figures may be out of date): a warning that the tool
 *    still applies 2026's figures, in force until the day before, with the
 *    pending ones and their official links;
 *  - "law" tools (rules that stay in force until a norm changes them, often
 *    from 1 January): from 1 January 2027, while their rules were last read
 *    before that day, the read date and where a 2027 change would appear;
 *  - "self" tools already switch on their own (the SMI, pensions, data pages).
 * The browser switches too (DateSwitch), so a page built in December says
 * the right thing on 1 January without a new build.
 */

export const CHECKED_2027 = "2026-11-21";
export const YEAR_2027_FROM = "2027-01-01";

type L = Record<CalcLocale, string>;

export interface OfficialSource {
  name: string;
  url: string;
  /** BOE day of the norm or of the wording quoted, when read in the BOE. */
  published?: string;
}

export type OfficialId =
  | "smi2027"
  | "irpfSmi2027"
  | "mei2027Employee"
  | "mei2027SelfEmployed"
  | "solidarity2027"
  | "subsidyIncome2027"
  | "widowSmi2027"
  | "flatRateSmi2027";

export interface OfficialFact {
  id: OfficialId;
  kind: "published" | "law" | "derived";
  text: L;
  sources: OfficialSource[];
  /** Something still open about the norm (a decree-law awaiting convalidation). */
  caveat?: L;
}

export type PendingId =
  | "cotizacion2027"
  | "aeat2027"
  | "reta2027"
  | "pensions2027"
  | "iprem2027"
  | "bono2027"
  | "taxCat"
  | "taxMad"
  | "taxAnd"
  | "taxVal"
  | "taxAll"
  | "plusvalia2027"
  | "aranceles"
  | "lottery"
  | "itv2027"
  | "et2027";

export interface PendingFact {
  id: PendingId;
  what: L;
  /** The instrument that will set it. */
  instrument: L;
  /** Last year's instrument and its day: the evidence for when it comes. */
  last?: L;
  /** The official page to watch. */
  watch: string;
  /** tests/calculators-2027.test.ts fails after this day while the item is still pending: read the source again. */
  recheckBy: string;
}

export type YearKind = "yearly" | "law" | "self";

export interface CalcYear {
  kind: YearKind;
  /** "yearly": the first day the tool's 2026 figures may be out of date (its module's guard date). */
  until?: string;
  official: OfficialId[];
  pending: PendingId[];
  /** "self": why the block is not needed. */
  why?: string;
}

/* -------------------------------------------------------------------------- */
/* Figures already official for 2027 (read in the BOE on CHECKED_2027)        */
/* -------------------------------------------------------------------------- */

const SMI_2027 = SMI_OFFICIAL_2027!;
const cents = (n: number) => Math.round(n * 100) / 100;

const BOE = (id: string) => `https://www.boe.es/diario_boe/txt.php?id=${id}`;
const LGSS = "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724";

const SRC_SMI: OfficialSource = { name: "Real Decreto 1013/2026 (BOE-A-2026-24189)", url: BOE(SMI_2027.boeId), published: SMI_2027.published };
const SRC_DT43: OfficialSource = { name: "LGSS, disposición transitoria cuadragésima tercera", url: `${LGSS}#dt-14`, published: "2023-03-17" };
const SRC_DT42: OfficialSource = { name: "LGSS, disposición transitoria cuadragésima segunda", url: `${LGSS}#dt-13`, published: "2023-03-17" };
const SRC_RDL38: OfficialSource = { name: "Real Decreto-ley 38/2026, arts. 5 y 6 (BOE-A-2026-24120)", url: BOE("BOE-A-2026-24120"), published: "2026-11-18" };

/** LGSS DT 43.ª: "En el año 2027, será de 1 punto porcentual, del que el 0,83 corresponderá a la empresa y el 0,17 al trabajador." */
export const MEI_2027 = { total: 1, employer: 0.83, worker: 0.17 } as const;
/** LGSS DT 42.ª, table, row 2027: the three bands above the maximum base (total rate, employer + worker). */
export const SOLIDARITY_2027 = [1.38, 1.5, 1.75] as const;
/** The 2026 row of the same table, for the comparison the page prints. */
export const SOLIDARITY_2026 = [1.15, 1.25, 1.46] as const;
/** RDL 38/2026 art. 5 (new DA 61.ª LIRPF, effects 1 Jan 2027) and art. 6 (RIRPF art. 85.3, the withholding). */
export const IRPF_SMI_DEDUCTION_2027 = { full: 1033.58, fullUpTo: 18004, endBelow: 23171.89, slope: 0.2, otherIncomeMax: 6500 } as const;
/** RDL 38/2026 must be convalidated within 30 days of its promulgation (CE art. 86.2): read the BOE again by this day. */
export const RDL38_CONVALIDATION_RECHECK_BY = "2026-12-18";

/** LGSS art. 275: 75 % of the monthly SMI, the extra payments left out. */
export const SUBSIDY_INCOME_LIMIT_2027 = cents(SMI_2027.monthly * INCOME_LIMIT_SHARE);
/** Decreto 3158/1966 art. 31.2: 75 % of 12 SMI months, per family member. */
export const WIDOW_BURDEN_2027 = Math.round(SMI_2027.monthly * 12 * BURDEN_SMI_SHARE) / 100;
/** Orden 13/02/1967 art. 11.1: twice the annual SMI. */
export const WIDOW_REMARRIAGE_2027 = SMI_2027.annual * REMARRIAGE_SMI_TIMES;

const m = (n: number, locale: CalcLocale) => money(n, locale);
const pct = (n: number, locale: CalcLocale) => (locale === "en" ? `${n.toFixed(2)} %` : `${n.toFixed(2).replace(".", ",")} %`);
const pts = (n: number, locale: CalcLocale) => (locale === "en" ? n.toFixed(2) : n.toFixed(2).replace(".", ","));
/** "1 punto" / "1,10 puntos", as the LGSS writes the MEI. */
const point = (n: number, locale: CalcLocale) => {
  const one = n === 1;
  const value = one ? "1" : pts(n, locale);
  return `${value} ${{ es: one ? "punto" : "puntos", ca: one ? "punt" : "punts", en: one ? "point" : "points" }[locale]}`;
};

const RDL38_CAVEAT: L = {
  es: "Es un real decreto-ley de 17 de noviembre de 2026: el Congreso tiene que convalidarlo en 30 días (Constitución, art. 86.2).",
  ca: "És un reial decret llei del 17 de novembre de 2026: el Congrés l'ha de convalidar en 30 dies (Constitució, art. 86.2).",
  en: "It is a royal decree-law of 17 November 2026: Congress must ratify it within 30 days (Constitution, art. 86.2).",
};

function officialFacts(): Record<OfficialId, OfficialFact> {
  const s = SMI_2027;
  const t = (f: (l: CalcLocale) => string): L => ({ es: f("es"), ca: f("ca"), en: f("en") });
  return {
    smi2027: {
      id: "smi2027",
      kind: "published",
      sources: [SRC_SMI],
      text: t((l) =>
        ({
          es: `Salario mínimo (SMI) de 2027: ${m(s.monthly, l)} al mes en 14 pagas (${m(s.annual, l)} al año) o ${m(s.daily, l)} al día, desde el 1 de enero de 2027 (en 2026, ${m(SMI_2026.monthly, l)} y ${m(SMI_2026.annual, l)}).`,
          ca: `Salari mínim (SMI) del 2027: ${m(s.monthly, l)} al mes en 14 pagues (${m(s.annual, l)} l'any) o ${m(s.daily, l)} al dia, des de l'1 de gener de 2027 (el 2026, ${m(SMI_2026.monthly, l)} i ${m(SMI_2026.annual, l)}).`,
          en: `Minimum wage (SMI) for 2027: ${m(s.monthly, l)} a month in 14 payments (${m(s.annual, l)} a year) or ${m(s.daily, l)} a day, from 1 January 2027 (2026: ${m(SMI_2026.monthly, l)} and ${m(SMI_2026.annual, l)}).`,
        })[l],
      ),
    },
    irpfSmi2027: {
      id: "irpfSmi2027",
      kind: "published",
      sources: [SRC_RDL38],
      caveat: RDL38_CAVEAT,
      text: t((l) => {
        const d = IRPF_SMI_DEDUCTION_2027;
        const o = SMI_DEDUCTION;
        return {
          es: `IRPF de 2027: la deducción por rendimientos del trabajo sube a ${m(d.full, l)} al año con un sueldo bruto de hasta ${m(d.fullUpTo, l)} y baja hasta desaparecer en ${m(d.endBelow, l)} (si las demás rentas no pasan de ${m(d.otherIncomeMax, l)}); se descuenta ya en la retención desde enero. En 2026: ${m(o.full, l)} hasta ${m(o.fullUpTo, l)}, nada desde ${m(o.endBelow, l)}.`,
          ca: `IRPF del 2027: la deducció per rendiments del treball puja a ${m(d.full, l)} l'any amb un sou brut de fins a ${m(d.fullUpTo, l)} i baixa fins a desaparèixer a ${m(d.endBelow, l)} (si la resta de rendes no passen de ${m(d.otherIncomeMax, l)}); es descompta ja a la retenció des del gener. El 2026: ${m(o.full, l)} fins a ${m(o.fullUpTo, l)}, res des de ${m(o.endBelow, l)}.`,
          en: `Income tax (IRPF) 2027: the earned-income deduction rises to ${m(d.full, l)} a year for gross pay up to ${m(d.fullUpTo, l)} and tapers to nothing at ${m(d.endBelow, l)} (if other income is no more than ${m(d.otherIncomeMax, l)}); it already comes off the withholding from January. 2026: ${m(o.full, l)} up to ${m(o.fullUpTo, l)}, nothing from ${m(o.endBelow, l)}.`,
        }[l];
      }),
    },
    mei2027Employee: {
      id: "mei2027Employee",
      kind: "law",
      sources: [SRC_DT43],
      text: t((l) => {
        const now = SOCIAL_SECURITY.rates;
        return {
          es: `Mecanismo de equidad intergeneracional (MEI) de 2027: ${point(MEI_2027.total, l)}, de los que ${pts(MEI_2027.worker, l)} paga el trabajador y ${pts(MEI_2027.employer, l)} la empresa (en 2026, ${pts(now.intergenerationalEquityTotal, l)}, de los que ${pts(now.intergenerationalEquity, l)} el trabajador). Lo fija la ley para cada año.`,
          ca: `Mecanisme d'equitat intergeneracional (MEI) del 2027: ${point(MEI_2027.total, l)}, dels quals ${pts(MEI_2027.worker, l)} paga el treballador i ${pts(MEI_2027.employer, l)} l'empresa (el 2026, ${pts(now.intergenerationalEquityTotal, l)}, dels quals ${pts(now.intergenerationalEquity, l)} el treballador). La llei el fixa per a cada any.`,
          en: `Intergenerational equity mechanism (MEI) for 2027: ${point(MEI_2027.total, l)}, of which the worker pays ${pts(MEI_2027.worker, l)} and the employer ${pts(MEI_2027.employer, l)} (2026: ${pts(now.intergenerationalEquityTotal, l)}, ${pts(now.intergenerationalEquity, l)} the worker). The law sets it for each year.`,
        }[l];
      }),
    },
    mei2027SelfEmployed: {
      id: "mei2027SelfEmployed",
      kind: "law",
      sources: [SRC_DT43],
      text: t((l) => {
        const mei = point(SELF_EMPLOYED_2027.intergenerationalEquity, l);
        return {
          es: `Mecanismo de equidad intergeneracional (MEI) de 2027: ${mei} sobre tu base de cotización (0,90 en 2026). Lo fija la ley para cada año; el resto de tipos y los tramos de 2027 aún no están publicados.`,
          ca: `Mecanisme d'equitat intergeneracional (MEI) del 2027: ${mei} sobre la teva base de cotització (0,90 el 2026). La llei el fixa per a cada any; la resta de tipus i els trams del 2027 encara no s'han publicat.`,
          en: `Intergenerational equity mechanism (MEI) for 2027: ${mei} on your contribution base (0.90 in 2026). The law sets it for each year; the other rates and the 2027 bands are not published yet.`,
        }[l];
      }),
    },
    solidarity2027: {
      id: "solidarity2027",
      kind: "law",
      sources: [SRC_DT42],
      text: t((l) => {
        const [a, b, c] = SOLIDARITY_2027.map((n) => pct(n, l));
        const [a0, b0, c0] = SOLIDARITY_2026.map((n) => pct(n, l));
        return {
          es: `Cotización adicional de solidaridad de 2027, sobre el sueldo que pasa de la base máxima: ${a}, ${b} y ${c} por tramos, repartidos entre empresa y trabajador como las contingencias comunes (en 2026, ${a0}, ${b0} y ${c0}). Los tramos se miden con la base máxima de 2027, que aún no está publicada.`,
          ca: `Cotització addicional de solidaritat del 2027, sobre el sou que passa de la base màxima: ${a}, ${b} i ${c} per trams, repartits entre empresa i treballador com les contingències comunes (el 2026, ${a0}, ${b0} i ${c0}). Els trams es mesuren amb la base màxima del 2027, que encara no s'ha publicat.`,
          en: `Solidarity contribution for 2027, on pay above the maximum base: ${a}, ${b} and ${c} by band, split between employer and worker like the common-contingencies rate (2026: ${a0}, ${b0} and ${c0}). The bands are measured against the 2027 maximum base, not published yet.`,
        }[l];
      }),
    },
    subsidyIncome2027: {
      id: "subsidyIncome2027",
      kind: "derived",
      sources: [{ name: "LGSS, art. 275", url: `${LGSS}#a275` }, SRC_SMI],
      text: t((l) =>
        ({
          es: `Límite de rentas del subsidio en 2027: ${m(SUBSIDY_INCOME_LIMIT_2027, l)} al mes, el 75 % del SMI de 2027 (${m(s.monthly, l)}) sin las pagas extra, como dice el art. 275; en 2026, ${m(SUBSIDY_INCOME_LIMIT_2026, l)}. Las cuantías del subsidio dependen del IPREM de 2027, aún sin publicar.`,
          ca: `Límit de rendes del subsidi el 2027: ${m(SUBSIDY_INCOME_LIMIT_2027, l)} al mes, el 75 % de l'SMI del 2027 (${m(s.monthly, l)}) sense les pagues extra, com diu l'art. 275; el 2026, ${m(SUBSIDY_INCOME_LIMIT_2026, l)}. Les quanties del subsidi depenen de l'IPREM del 2027, encara sense publicar.`,
          en: `Income limit for the subsidy in 2027: ${m(SUBSIDY_INCOME_LIMIT_2027, l)} a month, 75 % of the 2027 SMI (${m(s.monthly, l)}) without the extra payments, as art. 275 says; 2026: ${m(SUBSIDY_INCOME_LIMIT_2026, l)}. The subsidy amounts depend on the 2027 IPREM, not published yet.`,
        })[l],
      ),
    },
    widowSmi2027: {
      id: "widowSmi2027",
      kind: "derived",
      sources: [
        { name: "Decreto 3158/1966, art. 31.2", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1966-21116" },
        { name: "Orden de 13 de febrero de 1967, art. 11.1", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1967-2876" },
        SRC_SMI,
      ],
      text: t((l) =>
        ({
          es: `Con el SMI de 2027, los dos umbrales que dependen de él pasan a ${m(WIDOW_BURDEN_2027, l)} al año por miembro de la familia (cargas familiares: 75 % de 12 mensualidades) y ${m(WIDOW_REMARRIAGE_2027, l)} al año de ingresos de la pareja (nuevo matrimonio a partir de los 61: dos veces el SMI anual); en 2026, ${m(WIDOW_BURDEN_2026, l)} y ${m(WIDOW_REMARRIAGE_2026, l)}.`,
          ca: `Amb l'SMI del 2027, els dos llindars que en depenen passen a ${m(WIDOW_BURDEN_2027, l)} l'any per membre de la família (càrregues familiars: 75 % de 12 mensualitats) i ${m(WIDOW_REMARRIAGE_2027, l)} l'any d'ingressos de la parella (nou matrimoni a partir dels 61: dues vegades l'SMI anual); el 2026, ${m(WIDOW_BURDEN_2026, l)} i ${m(WIDOW_REMARRIAGE_2026, l)}.`,
          en: `With the 2027 SMI, the two thresholds tied to it become ${m(WIDOW_BURDEN_2027, l)} a year per family member (family burdens: 75 % of 12 monthly SMIs) and ${m(WIDOW_REMARRIAGE_2027, l)} a year of the couple's income (remarriage from 61: twice the annual SMI); 2026: ${m(WIDOW_BURDEN_2026, l)} and ${m(WIDOW_REMARRIAGE_2026, l)}.`,
        })[l],
      ),
    },
    flatRateSmi2027: {
      id: "flatRateSmi2027",
      kind: "derived",
      sources: [{ name: "Ley 20/2007, art. 38 ter", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2007-13409" }, SRC_SMI],
      text: t((l) =>
        ({
          es: `Tarifa plana: el SMI anual con el que se miden los rendimientos para alargarla otros 12 meses es, en 2027, ${m(s.annual, l)} (${m(SELF_EMPLOYED_SMI_2026, l)} en 2026).`,
          ca: `Tarifa plana: l'SMI anual amb què es mesuren els rendiments per allargar-la 12 mesos més és, el 2027, ${m(s.annual, l)} (${m(SELF_EMPLOYED_SMI_2026, l)} el 2026).`,
          en: `Flat rate: the annual SMI that net earnings are measured against to extend it for another 12 months is ${m(s.annual, l)} in 2027 (${m(SELF_EMPLOYED_SMI_2026, l)} in 2026).`,
        })[l],
      ),
    },
  };
}

export const OFFICIAL: Record<OfficialId, OfficialFact> = officialFacts();

/* -------------------------------------------------------------------------- */
/* Figures not official yet: the instrument, last year's, the page to watch   */
/* -------------------------------------------------------------------------- */

const BOE_TODAY = "https://www.boe.es/diario_boe/";

export const PENDING: Record<PendingId, PendingFact> = {
  cotizacion2027: {
    id: "cotizacion2027",
    what: { es: "Bases máxima y mínima y tipos de cotización de 2027", ca: "Bases màxima i mínima i tipus de cotització del 2027", en: "2027 maximum and minimum contribution bases and rates" },
    instrument: {
      es: "la Ley de Presupuestos de 2027 o, con los presupuestos prorrogados, un real decreto-ley y la orden de cotización (BOE)",
      ca: "la Llei de pressupostos del 2027 o, amb els pressupostos prorrogats, un reial decret llei i l'ordre de cotització (BOE)",
      en: "the 2027 Budget Act or, with the budget rolled over, a royal decree-law and the contribution order (BOE)",
    },
    last: { es: "en 2026, la Orden PJC/297/2026 (BOE del 31 de marzo)", ca: "el 2026, l'Ordre PJC/297/2026 (BOE del 31 de març)", en: "in 2026, Orden PJC/297/2026 (BOE, 31 March)" },
    watch: "https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537",
    recheckBy: "2027-04-15",
  },
  aeat2027: {
    id: "aeat2027",
    what: { es: "Algoritmo de retenciones del IRPF de 2027", ca: "Algorisme de retencions de l'IRPF del 2027", en: "2027 IRPF withholding algorithm" },
    instrument: { es: "la Agencia Tributaria, en su página de retenciones", ca: "l'Agència Tributària, a la seva pàgina de retencions", en: "the Tax Agency (AEAT), on its withholding page" },
    last: { es: "la versión de 2026 en vigor es la del 10 de septiembre", ca: "la versió del 2026 vigent és la del 10 de setembre", en: "the 2026 version in force is dated 10 September" },
    watch: "https://sede.agenciatributaria.gob.es/Sede/Retenciones.shtml",
    recheckBy: "2027-01-20",
  },
  reta2027: {
    id: "reta2027",
    what: { es: "Tramos de rendimientos y bases de los autónomos de 2027", ca: "Trams de rendiments i bases dels autònoms del 2027", en: "2027 self-employed earnings bands and bases" },
    instrument: { es: "la Ley de Presupuestos de 2027 o un real decreto-ley (BOE)", ca: "la Llei de pressupostos del 2027 o un reial decret llei (BOE)", en: "the 2027 Budget Act or a royal decree-law (BOE)" },
    last: { es: "en 2026, el Real Decreto-ley 3/2026 (BOE del 4 de febrero)", ca: "el 2026, el Reial decret llei 3/2026 (BOE del 4 de febrer)", en: "in 2026, Real Decreto-ley 3/2026 (BOE, 4 February)" },
    watch: BOE_TODAY,
    recheckBy: "2027-02-15",
  },
  pensions2027: {
    id: "pensions2027",
    what: {
      es: "Cuantías de 2027 de las pensiones mínimas, la máxima, la no contributiva y el ingreso mínimo vital, y sus límites de ingresos",
      ca: "Quanties del 2027 de les pensions mínimes, la màxima, la no contributiva i l'ingrés mínim vital, i els seus límits d'ingressos",
      en: "2027 amounts of the minimum, maximum and non-contributory pensions and the minimum income (IMV), and their income limits",
    },
    instrument: {
      es: "un real decreto-ley de revalorización y un real decreto de cuantías (BOE); el porcentaje general lo fija la ley: la media del IPC de diciembre de 2025 a noviembre de 2026 (LGSS art. 58.2)",
      ca: "un reial decret llei de revaloració i un reial decret de quanties (BOE); el percentatge general el fixa la llei: la mitjana de l'IPC de desembre del 2025 a novembre del 2026 (LGSS art. 58.2)",
      en: "a revaluation royal decree-law and a royal decree with the amounts (BOE); the general percentage is set by law: the average CPI from December 2025 to November 2026 (LGSS art. 58.2)",
    },
    last: {
      es: "en 2026, el Real Decreto-ley 3/2026 (BOE del 4 de febrero) y el Real Decreto 241/2026 (BOE del 26 de marzo)",
      ca: "el 2026, el Reial decret llei 3/2026 (BOE del 4 de febrer) i el Reial decret 241/2026 (BOE del 26 de març)",
      en: "in 2026, Real Decreto-ley 3/2026 (BOE, 4 February) and Real Decreto 241/2026 (BOE, 26 March)",
    },
    watch: "https://www.seg-social.es/wps/portal/wss/internet/Pensionistas/Revalorizacion",
    recheckBy: "2027-02-15",
  },
  iprem2027: {
    id: "iprem2027",
    what: { es: "IPREM de 2027", ca: "IPREM del 2027", en: "2027 IPREM" },
    instrument: { es: "la Ley de Presupuestos de 2027 o un real decreto-ley (BOE)", ca: "la Llei de pressupostos del 2027 o un reial decret llei (BOE)", en: "the 2027 Budget Act or a royal decree-law (BOE)" },
    last: { es: "la última cuantía la fijó la Ley 31/2022 (presupuestos de 2023): 600 € al mes", ca: "l'última quantia la va fixar la Llei 31/2022 (pressupostos del 2023): 600 € al mes", en: "the last amount was set by Ley 31/2022 (2023 budget): €600 a month" },
    watch: "https://www.sepe.es/HomeSepe/prestaciones-desempleo/Cuantias-anuales.html",
    recheckBy: "2027-01-15",
  },
  bono2027: {
    id: "bono2027",
    what: { es: "Descuento del bono social eléctrico desde el 1 de enero de 2027", ca: "Descompte del bo social elèctric des de l'1 de gener de 2027", en: "Bono social electricity discount from 1 January 2027" },
    instrument: {
      es: "un real decreto-ley que prorrogue el 42,5 % y el 57,5 %; si no hay ninguno, rige el 35 % y el 50 % del Real Decreto 897/2017 (art. 6.3)",
      ca: "un reial decret llei que prorrogui el 42,5 % i el 57,5 %; si no n'hi ha cap, regeix el 35 % i el 50 % del Reial decret 897/2017 (art. 6.3)",
      en: "a royal decree-law extending the 42.5 % and 57.5 %; without one, the 35 % and 50 % of Real Decreto 897/2017 (art. 6.3) apply",
    },
    last: { es: "en 2026, el Real Decreto-ley 7/2026 (BOE del 21 de marzo)", ca: "el 2026, el Reial decret llei 7/2026 (BOE del 21 de març)", en: "in 2026, Real Decreto-ley 7/2026 (BOE, 21 March)" },
    watch: BOE_TODAY,
    recheckBy: "2027-01-05",
  },
  taxCat: {
    id: "taxCat",
    what: { es: "Cambios de 2027 en el impuesto en Cataluña", ca: "Canvis del 2027 en l'impost a Catalunya", en: "2027 changes to the tax in Catalonia" },
    instrument: { es: "una ley de presupuestos o de medidas fiscales de la Generalitat (DOGC)", ca: "una llei de pressupostos o de mesures fiscals de la Generalitat (DOGC)", en: "a Generalitat budget or tax-measures act (DOGC)" },
    last: { es: "la última, la Ley 11/2026, de 9 de julio, de medidas fiscales", ca: "l'última, la Llei 11/2026, del 9 de juliol, de mesures fiscals", en: "the last one, Llei 11/2026 of 9 July, fiscal measures" },
    watch: "https://dogc.gencat.cat/ca/",
    recheckBy: "2027-01-15",
  },
  taxMad: {
    id: "taxMad",
    what: { es: "Cambios de 2027 en el impuesto en la Comunidad de Madrid", ca: "Canvis del 2027 en l'impost a la Comunitat de Madrid", en: "2027 changes to the tax in the Madrid region" },
    instrument: { es: "una ley de presupuestos o de medidas fiscales de la Comunidad de Madrid (BOCM)", ca: "una llei de pressupostos o de mesures fiscals de la Comunitat de Madrid (BOCM)", en: "a Madrid budget or tax-measures act (BOCM)" },
    watch: "https://www.bocm.es/",
    recheckBy: "2027-01-15",
  },
  taxAnd: {
    id: "taxAnd",
    what: { es: "Cambios de 2027 en el impuesto en Andalucía", ca: "Canvis del 2027 en l'impost a Andalusia", en: "2027 changes to the tax in Andalusia" },
    instrument: { es: "una ley de presupuestos o de medidas tributarias de la Junta de Andalucía (BOJA)", ca: "una llei de pressupostos o de mesures tributàries de la Junta d'Andalusia (BOJA)", en: "an Andalusian budget or tax-measures act (BOJA)" },
    watch: "https://www.juntadeandalucia.es/eboja.html",
    recheckBy: "2027-01-15",
  },
  taxVal: {
    id: "taxVal",
    what: { es: "Cambios de 2027 en el impuesto en la Comunitat Valenciana", ca: "Canvis del 2027 en l'impost a la Comunitat Valenciana", en: "2027 changes to the tax in the Valencian region" },
    instrument: { es: "una ley de presupuestos o de medidas fiscales de la Generalitat Valenciana (DOGV)", ca: "una llei de pressupostos o de mesures fiscals de la Generalitat Valenciana (DOGV)", en: "a Valencian budget or tax-measures act (DOGV)" },
    watch: "https://dogv.gva.es/",
    recheckBy: "2027-01-15",
  },
  taxAll: {
    id: "taxAll",
    what: { es: "Cambios de 2027 en el impuesto en cualquier comunidad", ca: "Canvis del 2027 en l'impost a qualsevol comunitat", en: "2027 changes to the tax in any region" },
    instrument: {
      es: "las leyes de presupuestos o de medidas fiscales de cada comunidad (su boletín oficial) y del Estado (BOE)",
      ca: "les lleis de pressupostos o de mesures fiscals de cada comunitat (el seu butlletí oficial) i de l'Estat (BOE)",
      en: "each region's budget or tax-measures acts (its official bulletin) and the State's (BOE)",
    },
    watch: BOE_TODAY,
    recheckBy: "2027-01-15",
  },
  plusvalia2027: {
    id: "plusvalia2027",
    what: { es: "Coeficientes máximos de la plusvalía para 2027", ca: "Coeficients màxims de la plusvàlua per al 2027", en: "2027 maximum plusvalía coefficients" },
    instrument: {
      es: "una norma con rango de ley, como la Ley de Presupuestos o un real decreto-ley (TRLRHL art. 107.4); mientras no haya otra, sigue la tabla del Real Decreto-ley 29/2026",
      ca: "una norma amb rang de llei, com la Llei de pressupostos o un reial decret llei (TRLRHL art. 107.4); mentre no n'hi hagi cap altra, continua la taula del Reial decret llei 29/2026",
      en: "a norm with the rank of law, such as the Budget Act or a royal decree-law (TRLRHL art. 107.4); until another one, the Real Decreto-ley 29/2026 table stays",
    },
    last: { es: "la última, el Real Decreto-ley 29/2026, art. 10 (BOE del 7 de octubre)", ca: "l'última, el Reial decret llei 29/2026, art. 10 (BOE del 7 d'octubre)", en: "the last one, Real Decreto-ley 29/2026, art. 10 (BOE, 7 October)" },
    watch: BOE_TODAY,
    recheckBy: "2027-01-15",
  },
  aranceles: {
    id: "aranceles",
    what: { es: "Aranceles de notarios y registradores", ca: "Aranzels de notaris i registradors", en: "Notary and Land Registry fee scales" },
    instrument: { es: "un real decreto que modifique el RD 1426/1989 o el RD 1427/1989 (BOE)", ca: "un reial decret que modifiqui l'RD 1426/1989 o l'RD 1427/1989 (BOE)", en: "a royal decree amending RD 1426/1989 or RD 1427/1989 (BOE)" },
    last: { es: "la última, el Real Decreto 1612/2011", ca: "l'última, el Reial decret 1612/2011", en: "the last one, Real Decreto 1612/2011" },
    watch: "https://www.boe.es/buscar/act.php?id=BOE-A-1989-28111",
    recheckBy: "2027-01-15",
  },
  lottery: {
    id: "lottery",
    what: { es: "Gravamen especial sobre los premios de loterías", ca: "Gravamen especial sobre els premis de loteries", en: "Special levy on lottery prizes" },
    instrument: { es: "una ley que cambie la disposición adicional 33.ª de la Ley del IRPF, como la de Presupuestos (BOE)", ca: "una llei que canviï la disposició addicional 33a de la Llei de l'IRPF, com la de pressupostos (BOE)", en: "an act amending additional provision 33 of the IRPF Act, such as the Budget Act (BOE)" },
    watch: "https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764",
    recheckBy: "2027-01-15",
  },
  itv2027: {
    id: "itv2027",
    what: { es: "Tarifas de la ITV de 2027", ca: "Tarifes de l'ITV del 2027", en: "2027 ITV fees" },
    instrument: { es: "cada comunidad, en su boletín oficial (en Cataluña sigue la Orden IUE/361/2010)", ca: "cada comunitat, al seu butlletí oficial (a Catalunya continua l'Ordre IUE/361/2010)", en: "each region, in its official bulletin (Catalonia: Ordre IUE/361/2010 still applies)" },
    watch: "https://dogc.gencat.cat/ca/document-del-dogc/?documentId=541600",
    recheckBy: "2027-02-01",
  },
  et2027: {
    id: "et2027",
    what: { es: "Cambios en el Estatuto de los Trabajadores", ca: "Canvis a l'Estatut dels treballadors", en: "Changes to the Workers' Statute" },
    instrument: { es: "una ley o un real decreto-ley (BOE, texto consolidado)", ca: "una llei o un reial decret llei (BOE, text consolidat)", en: "an act or a royal decree-law (BOE, consolidated text)" },
    watch: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430",
    recheckBy: "2027-01-15",
  },
};

/* -------------------------------------------------------------------------- */
/* Every calculator of the registry                                            */
/* -------------------------------------------------------------------------- */

function nextDay(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

const SALARY = { official: ["smi2027", "irpfSmi2027", "mei2027Employee", "solidarity2027"], pending: ["aeat2027", "cotizacion2027"] } as const;

export const CALC_2027: Record<CalculatorId, CalcYear> = {
  "net-salary": { kind: "yearly", until: SALARY_RULES_UNTIL, official: [...SALARY.official], pending: [...SALARY.pending] },
  "extra-pay": { kind: "yearly", until: EXTRA_PAY_RULES_UNTIL, official: [...SALARY.official], pending: [...SALARY.pending] },
  "self-employed": { kind: "yearly", until: SELF_EMPLOYED_UNTIL, official: ["mei2027SelfEmployed", "flatRateSmi2027"], pending: ["reta2027", "cotizacion2027"] },
  dismissal: { kind: "law", official: ["smi2027"], pending: ["et2027"] },
  settlement: { kind: "law", official: [], pending: ["et2027"] },
  unemployment: { kind: "yearly", until: nextDay(EMPLOYMENT_UNTIL), official: [], pending: ["iprem2027", "cotizacion2027"] },
  "unemployment-subsidy": { kind: "yearly", until: SUBSIDY_RULES_UNTIL, official: ["subsidyIncome2027"], pending: ["iprem2027", "pensions2027"] },
  "sick-leave": { kind: "yearly", until: SICK_LEAVE_UNTIL, official: [], pending: ["cotizacion2027"] },
  "paid-leave": { kind: "law", official: [], pending: ["et2027"] },
  "rent-update": { kind: "self", official: [], pending: [], why: "IRAV/IPC read from the INE every day; the RDL 29/2026 cap runs to 31 Dec 2027 (rules.ts DF6_*)" },
  euribor: { kind: "self", official: [], pending: [], why: "monthly Banco de España/BOE figure; title and lead take the month from the data" },
  mortgage: { kind: "self", official: [], pending: [], why: "Ley 5/2019 rules have no year; the rate comes from the euribor module" },
  "home-purchase-tax": { kind: "law", official: [], pending: ["taxAll"] },
  "home-purchase-costs": { kind: "law", official: [], pending: ["aranceles"] },
  plusvalia: { kind: "law", official: [], pending: ["plusvalia2027"] },
  "inheritance-tax": { kind: "law", official: [], pending: ["taxCat"] },
  "inheritance-tax-madrid": { kind: "law", official: [], pending: ["taxMad"] },
  "inheritance-tax-andalucia": { kind: "law", official: [], pending: ["taxAnd"] },
  "inheritance-tax-valencia": { kind: "law", official: [], pending: ["taxVal"] },
  "inheritance-tax-by-region": { kind: "law", official: [], pending: ["taxAll"] },
  "gift-tax-catalonia": { kind: "law", official: [], pending: ["taxCat"] },
  "gift-tax-madrid": { kind: "law", official: [], pending: ["taxMad"] },
  "gift-tax-andalucia": { kind: "law", official: [], pending: ["taxAnd"] },
  "gift-tax-valencia": { kind: "law", official: [], pending: ["taxVal"] },
  "zona-tensionada": { kind: "self", official: [], pending: [], why: "declarations carry their own end dates (per-zone guard); the update rule runs to 31 Dec 2027" },
  "pensions-2027": { kind: "self", official: [], pending: [], why: "switches provisional/flash/final/official on the INE and BOE dates (pensions-2027/engine.ts)" },
  "retirement-age": { kind: "self", official: [], pending: [], why: "the 2027 row is in the law (LGSS DT 7.ª) and already in the table" },
  "widow-pension": { kind: "yearly", until: WIDOW_UNTIL, official: ["widowSmi2027"], pending: ["pensions2027"] },
  "non-contributory-pension": { kind: "yearly", until: NC_PENSION_UNTIL, official: [], pending: ["pensions2027", "iprem2027"] },
  "working-days": { kind: "self", official: [], pending: [], why: "2027 holidays (BOE-A-2026-21254) and the AGE 2027 calendar (BOE-A-2026-23826) are loaded; local days are counted once published" },
  "smi-2027": { kind: "self", official: [], pending: [], why: "shows RD 1013/2026 and switches to it on 1 Jan 2027 (smi/engine.ts currentYear)" },
  "average-salary": { kind: "self", official: [], pending: [], why: "INE data with its own release dates" },
  ipc: { kind: "self", official: [], pending: [], why: "INE monthly series; the year comes from the data" },
  "treasury-bills": { kind: "self", official: [], pending: [], why: "auction calendar 2027 handled on the page while CALENDAR_2027 is null" },
  iprem: { kind: "yearly", until: IPREM_RECHECK_FROM, official: [], pending: ["iprem2027"] },
  "lottery-tax": { kind: "law", official: [], pending: ["lottery"] },
  itv: { kind: "law", official: [], pending: ["itv2027"] },
  "traffic-fines": { kind: "self", official: [], pending: [], why: "no yearly figure: the Ley de Tráfico amounts have no year (guard 18 May 2027)" },
  "bono-social": { kind: "yearly", until: nextDay(DISCOUNT_2026.until), official: [], pending: ["bono2027", "iprem2027"] },
};

/* -------------------------------------------------------------------------- */
/* What the block says on a given day                                          */
/* -------------------------------------------------------------------------- */

export interface NoticeItem {
  text: string;
  links: { label: string; url: string }[];
  /** Internal link to the calculator the item is about (anchor in the query's words), never to the host page itself. */
  onward?: { label: string; url: string };
  note?: string;
}

export interface Notice {
  tone: "info" | "warning";
  title: string;
  intro: string;
  pendingHeading: string;
  pending: NoticeItem[];
  officialHeading: string;
  official: NoticeItem[];
  /** Official first ("already official" block), or pending first (the warning). */
  officialFirst: boolean;
}

/** The block before and after its switch day; the page shows the one for today, and the browser re-checks. */
export interface NoticeStates {
  switchOn: string;
  before: Notice | null;
  after: Notice | null;
}

function day(iso: string, locale: CalcLocale): string {
  return locale === "ca" ? `${caDayArticle(iso)}${dayMonthYear(iso, "ca")}` : locale === "es" ? `el ${dayMonthYear(iso, "es")}` : dayMonthYear(iso, "en");
}

function bare(iso: string, locale: CalcLocale): string {
  return dayMonthYear(iso, locale);
}

const WORDS = {
  es: {
    source: "Fuente oficial",
    officialHeading: "Ya oficial para 2027",
    pendingHeading: "Aún sin publicar para 2027, y qué norma lo fijará",
    pendingHeadingAfter: "Pendiente de publicar o de cargar, y qué norma lo fija",
    lawHeading: "Dónde se publicaría un cambio",
  },
  ca: {
    source: "Font oficial",
    officialHeading: "Ja oficial per al 2027",
    pendingHeading: "Encara sense publicar per al 2027, i quina norma ho fixarà",
    pendingHeadingAfter: "Pendent de publicar o de carregar, i quina norma ho fixa",
    lawHeading: "On es publicaria un canvi",
  },
  en: {
    source: "Official source",
    officialHeading: "Already official for 2027",
    pendingHeading: "Not published for 2027 yet, and what will set it",
    pendingHeadingAfter: "Not published yet or not loaded here, and what sets it",
    lawHeading: "Where a change would be published",
  },
} as const;

const SMI_LABEL: Record<CalcLocale, string> = { es: "Salario mínimo (SMI) 2027", ca: "Salari mínim (SMI) 2027", en: "Spain minimum wage (SMI) 2027" };

/**
 * Which calculator each 2027 fact is about, with the words people search: the
 * SMI facts link to the SMI 2027 page, the pending pension amounts to the
 * pension increase page, the pending IPREM to the IPREM page.
 */
const ONWARD: Partial<Record<OfficialId | PendingId, { calc: CalculatorId; label: Record<CalcLocale, string> }>> = {
  smi2027: { calc: "smi-2027", label: SMI_LABEL },
  subsidyIncome2027: { calc: "smi-2027", label: SMI_LABEL },
  widowSmi2027: { calc: "smi-2027", label: SMI_LABEL },
  flatRateSmi2027: { calc: "smi-2027", label: SMI_LABEL },
  pensions2027: { calc: "pensions-2027", label: { es: "Subida de las pensiones 2027", ca: "Pujada de les pensions 2027", en: "Spain pension increase 2027" } },
  iprem2027: { calc: "iprem", label: { es: "IPREM 2026: cuantías", ca: "IPREM 2026: quanties", en: "2026 IPREM amounts" } },
};

function onwardFor(fact: OfficialId | PendingId, host: CalculatorId, locale: CalcLocale): NoticeItem["onward"] {
  const o = ONWARD[fact];
  return o && o.calc !== host ? { label: o.label[locale], url: calcPath(o.calc, locale) } : undefined;
}

function officialItem(f: OfficialFact, locale: CalcLocale, host: CalculatorId): NoticeItem {
  return { text: f.text[locale], links: f.sources.map((s) => ({ label: s.name, url: s.url })), onward: onwardFor(f.id, host, locale), note: f.caveat?.[locale] };
}

function pendingItem(p: PendingFact, locale: CalcLocale, host: CalculatorId): NoticeItem {
  const last = p.last?.[locale];
  return {
    text: `${p.what[locale]}: ${p.instrument[locale]}.`,
    links: [{ label: WORDS[locale].source, url: p.watch }],
    onward: onwardFor(p.id, host, locale),
    note: last ? `${last.charAt(0).toUpperCase()}${last.slice(1)}.` : undefined,
  };
}

/** The block's two states for a calculator, or null when it has none (kind "self", or nothing to say). */
export function year2027Notices(id: CalculatorId, locale: CalcLocale): NoticeStates | null {
  const c = CALC_2027[id];
  if (c.kind === "self") return null;
  const w = WORDS[locale];
  const official = c.official.map((k) => officialItem(OFFICIAL[k], locale, id));
  const pending = c.pending.map((k) => pendingItem(PENDING[k], locale, id));

  if (c.kind === "yearly") {
    const until = c.until!;
    const last = bare(lastDayBefore(until), locale);
    const before: Notice | null = official.length
      ? {
          tone: "info",
          title: w.officialHeading,
          intro: {
            es: `Revisado en el BOE ${day(CHECKED_2027, "es")}. La calculadora sigue con las cifras de 2026, que rigen hasta el ${last}.`,
            ca: `Revisat al BOE ${day(CHECKED_2027, "ca")}. La calculadora continua amb les xifres del 2026, que regeixen fins al ${last}.`,
            en: `Checked in the BOE on ${day(CHECKED_2027, "en")}. The calculator still uses the 2026 figures, in force until ${last}.`,
          }[locale],
          pendingHeading: w.pendingHeading,
          pending,
          officialHeading: w.officialHeading,
          official,
          officialFirst: true,
        }
      : null;
    const after: Notice = {
      tone: "warning",
      title: {
        es: "Cifras de 2026: las de 2027 aún no están en esta calculadora",
        ca: "Xifres del 2026: les del 2027 encara no són en aquesta calculadora",
        en: "2026 figures: the 2027 ones are not in this calculator yet",
      }[locale],
      intro: {
        es: `Esta calculadora aplica las cifras de 2026, en vigor hasta el ${last}. En nuestra última revisión (${bare(CHECKED_2027, "es")}) las de 2027 que necesita aún no se habían publicado; si ya lo están, todavía no las hemos incorporado. Compruébalas en la fuente oficial antes de usar el resultado.`,
        ca: `Aquesta calculadora aplica les xifres del 2026, vigents fins al ${last}. A la nostra última revisió (${bare(CHECKED_2027, "ca")}) les del 2027 que necessita encara no s'havien publicat; si ja ho estan, encara no les hem incorporat. Comprova-les a la font oficial abans de fer servir el resultat.`,
        en: `This calculator applies the 2026 figures, in force until ${last}. At our last check (${bare(CHECKED_2027, "en")}) the 2027 ones it needs were not published; if they are now, we have not loaded them yet. Check the official source before you rely on the result.`,
      }[locale],
      pendingHeading: w.pendingHeadingAfter,
      pending,
      officialHeading: w.officialHeading,
      official,
      officialFirst: false,
    };
    return { switchOn: until, before, after };
  }

  // "law": rules that stay in force until a norm changes them.
  const checked = calculatorCard(id).checked!;
  const before: Notice | null = official.length
    ? {
        tone: "info",
        title: w.officialHeading,
        intro: {
          es: `Revisado en el BOE ${day(CHECKED_2027, "es")}.`,
          ca: `Revisat al BOE ${day(CHECKED_2027, "ca")}.`,
          en: `Checked in the BOE on ${day(CHECKED_2027, "en")}.`,
        }[locale],
        pendingHeading: w.pendingHeading,
        pending: [],
        officialHeading: w.officialHeading,
        official,
        officialFirst: true,
      }
    : null;
  const after: Notice | null =
    checked < YEAR_2027_FROM
      ? {
          tone: "info",
          title: { es: `Normas revisadas ${day(checked, "es")}`, ca: `Normes revisades ${day(checked, "ca")}`, en: `Rules checked on ${day(checked, "en")}` }[locale],
          intro: {
            es: "Estas reglas siguen en vigor mientras una norma nueva no las cambie, y las leyes de presupuestos o de medidas fiscales suelen aplicarse desde el 1 de enero. Si una de 2027 las ha cambiado, aún no está en esta calculadora: compruébalo en la fuente oficial.",
            ca: "Aquestes regles continuen vigents mentre una norma nova no les canviï, i les lleis de pressupostos o de mesures fiscals solen aplicar-se des de l'1 de gener. Si una del 2027 les ha canviat, encara no és en aquesta calculadora: comprova-ho a la font oficial.",
            en: "These rules stay in force until a new norm changes them, and budget or tax-measures acts usually apply from 1 January. If a 2027 one has changed them, it is not in this calculator yet: check the official source.",
          }[locale],
          pendingHeading: w.lawHeading,
          pending,
          officialHeading: w.officialHeading,
          official,
          officialFirst: false,
        }
      : before;
  return before === null && after === null ? null : { switchOn: YEAR_2027_FROM, before, after };
}

/** The block for one day (server render and tests). */
export function year2027NoticeOn(id: CalculatorId, locale: CalcLocale, today: string): Notice | null {
  const s = year2027Notices(id, locale);
  if (!s) return null;
  return today >= s.switchOn ? s.after : s.before;
}

function lastDayBefore(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}
