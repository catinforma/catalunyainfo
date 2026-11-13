import type { Locale } from "@/lib/i18n/config";
import { calcPath } from "@/lib/programmatic/calculators/paths";
import { money, parseAmount, percent } from "@/lib/programmatic/net-salary/copy";

import { bandFrom, type FlatRate, type Period, type SelfEmployedInput, type SelfEmployedResult } from "./engine";
import { CORPORATE_LEGACY_PROVISIONAL_BASE, CORPORATE_MIN_BASE, FLAT_RATE, MAX_BASE, MIN_BASE, SMI_ANNUAL, TOTAL_RATE, type Band, type RateKey } from "./rules-2026";

/**
 * Paths and words of the self-employed contributions calculator, small
 * enough for the browser (the client component imports this file, the
 * engine and the rules; nothing that reads data).
 *
 *   /es/calculadoras/cuota-autonomos/
 *   /ca/calculadores/quota-autonoms/
 *   /en/calculators/spain-self-employed-contributions/
 */

export type SeLocale = Locale;
export const SE_LOCALES: readonly SeLocale[] = ["es", "ca", "en"];

export { money, parseAmount, percent };

export function selfEmployedPath(locale: SeLocale): string {
  return calcPath("self-employed", locale);
}

export function selfEmployedEditions(): Record<SeLocale, string> {
  return { ca: selfEmployedPath("ca"), es: selfEmployedPath("es"), en: selfEmployedPath("en") };
}

/** "Tramo 5 de la tabla general" / "Tram 5 de la taula general" / "General table, band 5". */
export function bandName(band: Band, locale: SeLocale): string {
  return {
    es: `Tramo ${band.n} de la tabla ${band.table === "reduced" ? "reducida" : "general"}`,
    ca: `Tram ${band.n} de la taula ${band.table === "reduced" ? "reduïda" : "general"}`,
    en: `${band.table === "reduced" ? "Reduced" : "General"} table, band ${band.n}`,
  }[locale];
}

/** "1.209,15 € a 2.030,00 €" / "€1,209.15 to €2,030.00". */
export function rangeText(min: number, max: number, locale: SeLocale): string {
  return `${money(min, locale)} ${locale === "en" ? "to" : "a"} ${money(max, locale)}`;
}

/** "≤ 670", "> 670 y ≤ 900", "≥ 1.166,70 y ≤ 1.300", "> 6.000" (euros a month), as the BOE prints them. */
export function bandRangeText(band: Band, locale: SeLocale): string {
  const n = (v: number) => money(v, locale, Number.isInteger(v) ? 0 : 2).replace(/\s?€|€/g, "").trim();
  const and = { es: "y", ca: "i", en: "and" }[locale];
  const from = bandFrom(band);
  const lower = from ? `${from.inclusive ? "≥" : ">"} ${n(from.value)}` : "";
  const upper = band.upTo === null ? "" : `${band.upToInclusive ? "≤" : "<"} ${n(band.upTo)}`;
  return lower && upper ? `${lower} ${and} ${upper}` : lower || upper;
}

/* -------------------------------------------------------------------------- */
/* Shareable state in the URL hash                                            */
/* -------------------------------------------------------------------------- */

/** "#i=30000&g=6000&p=a&s=0&t=0" (+ "&b=1300" when a base was chosen). */
export function writeHash(s: SelfEmployedInput): string {
  const p = new URLSearchParams();
  p.set("i", String(s.income));
  p.set("g", String(s.expenses));
  p.set("p", s.period === "monthly" ? "m" : "a");
  p.set("s", s.corporate ? "1" : "0");
  p.set("t", { none: "0", first: "1", second: "2" }[s.flatRate]);
  if (s.base !== null) p.set("b", String(s.base));
  return `#${p.toString()}`;
}

export function readHash(hash: string, base: SelfEmployedInput): SelfEmployedInput {
  const p = new URLSearchParams(hash.replace(/^#/, ""));
  const out: SelfEmployedInput = { ...base };
  const num = (k: string) => (p.has(k) ? Number(p.get(k)) : NaN);
  const i = num("i");
  if (Number.isFinite(i) && i >= 0 && i <= 100_000_000) out.income = i;
  const g = num("g");
  if (Number.isFinite(g) && g >= 0 && g <= 100_000_000) out.expenses = g;
  if (p.get("p") === "m" || p.get("p") === "a") out.period = (p.get("p") === "m" ? "monthly" : "annual") as Period;
  if (p.has("s")) out.corporate = p.get("s") === "1";
  const t = ({ "0": "none", "1": "first", "2": "second" } as Record<string, FlatRate>)[p.get("t") ?? ""];
  if (t) out.flatRate = t;
  const b = num("b");
  out.base = Number.isFinite(b) && b > 0 && b <= 100_000 ? b : null;
  return out;
}

/* -------------------------------------------------------------------------- */
/* Calculator words                                                           */
/* -------------------------------------------------------------------------- */

export interface CalculatorCopy {
  title: string;
  intro: string;
  noscript: string;
  period: string;
  periodOptions: Record<Period, string>;
  income: (p: Period) => string;
  incomeHint: string;
  expenses: (p: Period) => string;
  expensesHint: string;
  corporate: string;
  corporateHint: string;
  flatRate: string;
  flatRateOptions: Record<FlatRate, string>;
  base: string;
  baseHint: (r: SelfEmployedResult) => string;
  results: string;
  pay: (flat: boolean) => string;
  payAnnual: (flat: boolean) => string;
  earningsNet: string;
  earningsGeneric: (pct: number) => string;
  earningsComputable: string;
  earningsMonthly: string;
  band: string;
  range: string;
  full: string;
  breakdown: (base: number) => string;
  lines: Record<RateKey, string>;
  regularisation: (r: SelfEmployedResult) => string;
  flatNote: (r: SelfEmployedResult) => string | null;
  corporateNote: string;
  clamped: string;
  share: string;
  disclaimer: string;
}

const m = (v: number, l: SeLocale) => money(v, l);

export const CALC_COPY: Record<SeLocale, CalculatorCopy> = {
  es: {
    title: "Calcula tu cuota de autónomo 2026",
    intro: "Pon lo que prevés facturar y gastar en el año (o al mes). La calculadora saca tus rendimientos netos como los cuenta la Seguridad Social, tu tramo, la base mínima y máxima que puedes elegir y la cuota que pagarás.",
    noscript: "Sin JavaScript ves el ejemplo de esta página. Para hacer tu cálculo, activa JavaScript o usa la tabla de tramos de más abajo.",
    period: "Las cantidades son",
    periodOptions: { annual: "Del año entero", monthly: "Al mes" },
    income: (p) => (p === "monthly" ? "Ingresos al mes (sin IVA)" : "Ingresos del año (sin IVA)"),
    incomeHint: "Lo que facturas por tu actividad, sin el IVA.",
    expenses: (p) => (p === "monthly" ? "Gastos deducibles al mes" : "Gastos deducibles del año"),
    expensesHint: "Los gastos de la actividad que deduces en el IRPF, sin contar tu propia cuota de autónomo.",
    corporate: "Soy autónomo societario (socio o administrador de una sociedad, o socio de una sociedad laboral)",
    corporateHint: "Con al menos el 33 % del capital, o el 25 % siendo administrador. Cambia la deducción del 7 % al 3 % y la base mínima.",
    flatRate: "Tarifa plana",
    flatRateOptions: { none: "No la tengo", first: "Primeros 12 meses de alta", second: "Prórroga (meses 13 a 24)" },
    base: "Base de cotización que eliges o pagas (opcional)",
    baseHint: (r) => `Vacío = la mínima de tu tramo. Puedes elegir de ${rangeText(r.range.min, r.range.max, "es")} al mes.`,
    results: "Resultado",
    pay: (flat) => (flat ? "Pagas al mes (tarifa plana)" : "Cuota mensual"),
    payAnnual: (flat) => (flat ? "En 12 meses de tarifa plana" : "Cuota al año"),
    earningsNet: "Ingresos − gastos (al año)",
    earningsGeneric: (pct) => `Deducción por gastos genéricos (${pct} %)`,
    earningsComputable: "Rendimientos netos computables (al año)",
    earningsMonthly: "Promedio mensual",
    band: "Tu tramo",
    range: "Base que puedes elegir",
    full: "Cuota sin tarifa plana",
    breakdown: (b) => `Sobre una base de ${m(b, "es")}`,
    lines: {
      commonContingencies: "Contingencias comunes",
      professionalContingencies: "Contingencias profesionales",
      cessation: "Cese de actividad",
      vocationalTraining: "Formación profesional",
      intergenerationalEquity: "MEI",
    },
    regularisation: (r) => {
      const g = r.regularisation;
      if (g.kind === "flat-rate") return "Regularización: el periodo de tarifa plana no se regulariza mientras cumplas sus requisitos.";
      if (g.kind === "flat-rate-lost") return `Prórroga de la tarifa plana: no te corresponde, porque tus rendimientos (${m(r.annual.computable, "es")}) no son inferiores al salario mínimo anual (${m(SMI_ANNUAL, "es")}). Si la disfrutaras, al regularizar la Seguridad Social te reclamaría la diferencia: unos ${m(g.annual, "es")} en 12 meses.`;
      if (g.kind === "pay") return `Regularización: tu base (${m(r.base, "es")}) está por debajo de la mínima de tu tramo. Cuando Hacienda comunique tus rendimientos, la Seguridad Social te pedirá unos ${m(g.annual, "es")} por un año entero, sin recargo si pagas en plazo. Para evitarlo, sube la base a ${m(g.definitiveBase, "es")}.`;
      if (g.kind === "refund") return `Regularización: tu base (${m(r.base, "es")}) supera la máxima de tu tramo. La Seguridad Social te devolvería de oficio unos ${m(-g.annual, "es")} por un año entero, antes del 30 de abril del año siguiente a recibir tus datos fiscales.`;
      return "Regularización: tu base está dentro de tu tramo. Si tus rendimientos reales acaban en este tramo, no tendrás que pagar ni te devolverán nada.";
    },
    flatNote: (r) =>
      r.pay.flatRate
        ? `La tarifa plana es de ${m(FLAT_RATE.fee, "es")} al mes más el MEI: ${m(FLAT_RATE.totalWithMei, "es")} en total según la Tesorería. Sin ella pagarías ${m(r.full.monthly, "es")}.`
        : null,
    corporateNote: `Societario: base mínima de ${m(CORPORATE_MIN_BASE, "es")} al mes (la del grupo 7 del Régimen General). Si ya cotizabas en 2025 puedes mantener tu base provisional (no menos de ${m(CORPORATE_LEGACY_PROVISIONAL_BASE, "es")}), pero al regularizar se aplica ${m(CORPORATE_MIN_BASE, "es")}.`,
    clamped: `La base que has puesto está fuera de los límites legales (de ${m(MIN_BASE, "es")} a ${m(MAX_BASE, "es")}, o desde ${m(CORPORATE_MIN_BASE, "es")} si eres societario): calculamos con el límite más cercano.`,
    share: "El enlace de esta página guarda tus datos: cópialo para compartir el cálculo.",
    disclaimer: `Estimación orientativa con las normas de 2026 (cuota = base × ${percent(TOTAL_RATE, "es")}). No es asesoramiento: tu cuota definitiva la fija la Tesorería General de la Seguridad Social con los rendimientos que le comunique Hacienda. Comprueba tu caso con el simulador oficial de Import@ss o con un profesional.`,
  },
  ca: {
    title: "Calcula la teva quota d'autònom 2026",
    intro: "Posa el que preveus facturar i gastar l'any (o al mes). La calculadora treu els teus rendiments nets com els compta la Seguretat Social, el teu tram, la base mínima i màxima que pots triar i la quota que pagaràs.",
    noscript: "Sense JavaScript veus l'exemple d'aquesta pàgina. Per fer el teu càlcul, activa JavaScript o fes servir la taula de trams de més avall.",
    period: "Les quantitats són",
    periodOptions: { annual: "De tot l'any", monthly: "Al mes" },
    income: (p) => (p === "monthly" ? "Ingressos al mes (sense IVA)" : "Ingressos de l'any (sense IVA)"),
    incomeHint: "El que factures per la teva activitat, sense l'IVA.",
    expenses: (p) => (p === "monthly" ? "Despeses deduïbles al mes" : "Despeses deduïbles de l'any"),
    expensesHint: "Les despeses de l'activitat que dedueixes a l'IRPF, sense comptar la teva pròpia quota d'autònom.",
    corporate: "Soc autònom societari (soci o administrador d'una societat, o soci d'una societat laboral)",
    corporateHint: "Amb almenys el 33 % del capital, o el 25 % si n'ets administrador. Canvia la deducció del 7 % al 3 % i la base mínima.",
    flatRate: "Tarifa plana",
    flatRateOptions: { none: "No la tinc", first: "Primers 12 mesos d'alta", second: "Pròrroga (mesos 13 a 24)" },
    base: "Base de cotització que tries o pagues (opcional)",
    baseHint: (r) => `Buit = la mínima del teu tram. Pots triar de ${rangeText(r.range.min, r.range.max, "ca")} al mes.`,
    results: "Resultat",
    pay: (flat) => (flat ? "Pagues al mes (tarifa plana)" : "Quota mensual"),
    payAnnual: (flat) => (flat ? "En 12 mesos de tarifa plana" : "Quota a l'any"),
    earningsNet: "Ingressos − despeses (l'any)",
    earningsGeneric: (pct) => `Deducció per despeses genèriques (${pct} %)`,
    earningsComputable: "Rendiments nets computables (l'any)",
    earningsMonthly: "Mitjana mensual",
    band: "El teu tram",
    range: "Base que pots triar",
    full: "Quota sense tarifa plana",
    breakdown: (b) => `Sobre una base de ${m(b, "ca")}`,
    lines: {
      commonContingencies: "Contingències comunes",
      professionalContingencies: "Contingències professionals",
      cessation: "Cessament d'activitat",
      vocationalTraining: "Formació professional",
      intergenerationalEquity: "MEI",
    },
    regularisation: (r) => {
      const g = r.regularisation;
      if (g.kind === "flat-rate") return "Regularització: el període de tarifa plana no es regularitza mentre en compleixis els requisits.";
      if (g.kind === "flat-rate-lost") return `Pròrroga de la tarifa plana: no et correspon, perquè els teus rendiments (${m(r.annual.computable, "ca")}) no són inferiors al salari mínim anual (${m(SMI_ANNUAL, "ca")}). Si en gaudissis, en regularitzar la Seguretat Social et reclamaria la diferència: uns ${m(g.annual, "ca")} en 12 mesos.`;
      if (g.kind === "pay") return `Regularització: la teva base (${m(r.base, "ca")}) és per sota de la mínima del teu tram. Quan Hisenda comuniqui els teus rendiments, la Seguretat Social et demanarà uns ${m(g.annual, "ca")} per un any sencer, sense recàrrec si pagues dins de termini. Per evitar-ho, puja la base a ${m(g.definitiveBase, "ca")}.`;
      if (g.kind === "refund") return `Regularització: la teva base (${m(r.base, "ca")}) supera la màxima del teu tram. La Seguretat Social et retornaria d'ofici uns ${m(-g.annual, "ca")} per un any sencer, abans del 30 d'abril de l'any següent a rebre les teves dades fiscals.`;
      return "Regularització: la teva base és dins del teu tram. Si els teus rendiments reals acaben en aquest tram, no hauràs de pagar ni et retornaran res.";
    },
    flatNote: (r) =>
      r.pay.flatRate
        ? `La tarifa plana és de ${m(FLAT_RATE.fee, "ca")} al mes més l'MEI: ${m(FLAT_RATE.totalWithMei, "ca")} en total segons la Tresoreria. Sense tarifa plana pagaries ${m(r.full.monthly, "ca")}.`
        : null,
    corporateNote: `Societari: base mínima de ${m(CORPORATE_MIN_BASE, "ca")} al mes (la del grup 7 del règim general). Si ja cotitzaves el 2025 pots mantenir la base provisional (no menys de ${m(CORPORATE_LEGACY_PROVISIONAL_BASE, "ca")}), però en regularitzar s'aplica ${m(CORPORATE_MIN_BASE, "ca")}.`,
    clamped: `La base que has posat és fora dels límits legals (de ${m(MIN_BASE, "ca")} a ${m(MAX_BASE, "ca")}, o des de ${m(CORPORATE_MIN_BASE, "ca")} si ets societari): calculem amb el límit més proper.`,
    share: "L'enllaç d'aquesta pàgina desa les teves dades: copia'l per compartir el càlcul.",
    disclaimer: `Estimació orientativa amb les normes del 2026 (quota = base × ${percent(TOTAL_RATE, "ca")}). No és assessorament: la quota definitiva la fixa la Tresoreria General de la Seguretat Social amb els rendiments que li comuniqui Hisenda. Comprova el teu cas amb el simulador oficial d'Import@ss o amb un professional.`,
  },
  en: {
    title: "Work out your 2026 self-employed contribution",
    intro: "Enter what you expect to invoice and spend in the year (or a month). The calculator works out your net earnings as Social Security counts them, your band, the lowest and highest base you can choose and the monthly contribution (cuota) you will pay.",
    noscript: "Without JavaScript you see this page's example. To run your own figures, turn JavaScript on or use the band table further down.",
    period: "The amounts are",
    periodOptions: { annual: "For the whole year", monthly: "Per month" },
    income: (p) => (p === "monthly" ? "Income per month (without VAT)" : "Income for the year (without VAT)"),
    incomeHint: "What you invoice for your activity, VAT excluded.",
    expenses: (p) => (p === "monthly" ? "Deductible expenses per month" : "Deductible expenses for the year"),
    expensesHint: "The business expenses you deduct for income tax (IRPF), not counting your own self-employed contribution.",
    corporate: "I am a corporate self-employed worker (partner or director of a company, or partner in a sociedad laboral)",
    corporateHint: "Holding at least 33% of the capital, or 25% as a director. It changes the 7% deduction to 3% and the minimum base.",
    flatRate: "Flat rate (tarifa plana)",
    flatRateOptions: { none: "I don't have it", first: "First 12 months after registering", second: "Extension (months 13 to 24)" },
    base: "Contribution base you choose or pay (optional)",
    baseHint: (r) => `Empty = your band's minimum. You can choose ${rangeText(r.range.min, r.range.max, "en")} a month.`,
    results: "Result",
    pay: (flat) => (flat ? "You pay a month (flat rate)" : "Monthly contribution"),
    payAnnual: (flat) => (flat ? "Over 12 months of flat rate" : "Contribution for the year"),
    earningsNet: "Income − expenses (year)",
    earningsGeneric: (pct) => `Generic expenses deduction (${pct}%)`,
    earningsComputable: "Net earnings that count (year)",
    earningsMonthly: "Monthly average",
    band: "Your band",
    range: "Base you can choose",
    full: "Contribution without flat rate",
    breakdown: (b) => `On a base of ${m(b, "en")}`,
    lines: {
      commonContingencies: "Common contingencies",
      professionalContingencies: "Professional contingencies",
      cessation: "Cessation of activity",
      vocationalTraining: "Vocational training",
      intergenerationalEquity: "MEI (intergenerational equity)",
    },
    regularisation: (r) => {
      const g = r.regularisation;
      if (g.kind === "flat-rate") return "Year-end adjustment: the flat-rate period is not adjusted while you meet its conditions.";
      if (g.kind === "flat-rate-lost") return `Flat-rate extension: you don't qualify, because your net earnings (${m(r.annual.computable, "en")}) are not below the annual minimum wage (${m(SMI_ANNUAL, "en")}). If you had it, the adjustment would claim the difference back: about ${m(g.annual, "en")} over 12 months.`;
      if (g.kind === "pay") return `Year-end adjustment: your base (${m(r.base, "en")}) is below your band's minimum. Once the Tax Agency reports your earnings, Social Security will ask for about ${m(g.annual, "en")} for a full year, with no surcharge if you pay on time. To avoid it, raise your base to ${m(g.definitiveBase, "en")}.`;
      if (g.kind === "refund") return `Year-end adjustment: your base (${m(r.base, "en")}) is above your band's maximum. Social Security would refund about ${m(-g.annual, "en")} for a full year, before 30 April of the year after it receives your tax data.`;
      return "Year-end adjustment: your base is within your band. If your real earnings end up in this band, you will neither pay more nor get anything back.";
    },
    flatNote: (r) =>
      r.pay.flatRate
        ? `The flat rate is ${m(FLAT_RATE.fee, "en")} a month plus the MEI: ${m(FLAT_RATE.totalWithMei, "en")} in all according to the Social Security Treasury. Without it you would pay ${m(r.full.monthly, "en")}.`
        : null,
    corporateNote: `Corporate: minimum base ${m(CORPORATE_MIN_BASE, "en")} a month (the General Regime's group 7 minimum). If you already paid in 2025 you can keep your provisional base (at least ${m(CORPORATE_LEGACY_PROVISIONAL_BASE, "en")}), but the year-end adjustment applies ${m(CORPORATE_MIN_BASE, "en")}.`,
    clamped: `The base you entered is outside the legal limits (${m(MIN_BASE, "en")} to ${m(MAX_BASE, "en")}, or from ${m(CORPORATE_MIN_BASE, "en")} if corporate): we use the nearest limit.`,
    share: "This page's link keeps your figures: copy it to share the result.",
    disclaimer: `An estimate with the 2026 rules (contribution = base × ${percent(TOTAL_RATE, "en")}). Not advice: your final contribution is set by the Social Security Treasury (TGSS) from the earnings the Tax Agency reports. Check your case with the official Import@ss simulator or a professional.`,
  },
};
