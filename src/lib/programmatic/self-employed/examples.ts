import type { CalcLocale } from "@/lib/programmatic/calculators/paths";
import { money } from "./copy";

import { DEFAULT_INPUT, calculateSelfEmployed, type SelfEmployedResult } from "./engine";
import { GENERIC_EXPENSES, RULES_YEAR } from "./rules-2026";

/**
 * "Cuota de autónomos según ingresos" (27 Nov 2026, batch 8J): eight yearly
 * net earnings (income minus expenses) run through `calculateSelfEmployed`,
 * the calculator's own function, at the minimum base of the band (individual
 * self-employed, no flat rate). Queries (GSC 28 days to 25 Nov): "cuota
 * autónomo según ingresos 2026" 5 at 65.6, "tabla de cuotas de autónomos
 * 2026" 4 at 51.5, "cuota autonomos 2026" 3 at 47.0, "calculo cuota
 * autonomos 2026" 2 at 16.0. 2026 rules (rules-2026.ts, RULES_UNTIL guard in
 * tests/self-employed.test.ts). Pure.
 */

export const EXAMPLE_NET_YEAR = [8000, 12000, 15000, 18000, 24000, 30000, 40000, 60000] as const;
/** The "1.000 € al mes" question: net earnings of the activity, per month. */
export const FAQ_NET_MONTH = 1000;

export function earningsRows(): { net: number; r: SelfEmployedResult }[] {
  return EXAMPLE_NET_YEAR.map((net) => ({ net, r: calculateSelfEmployed({ ...DEFAULT_INPUT, period: "annual", income: net, expenses: 0, flatRate: "none", base: null, corporate: false }) }));
}

export interface EarningsCopy {
  title: string;
  intro: string;
  caption: string;
  cols: [string, string, string, string];
  band: (r: SelfEmployedResult) => string;
  faq: { q: string; a: string }[];
}

export function earningsCopy(locale: CalcLocale): EarningsCopy {
  const m = (x: number) => money(x, locale);
  const m0 = (x: number) => money(x, locale, 0);
  const Y = RULES_YEAR;
  const g = GENERIC_EXPENSES.general;
  const f = calculateSelfEmployed({ ...DEFAULT_INPUT, period: "monthly", income: FAQ_NET_MONTH, expenses: 0, flatRate: "none", base: null, corporate: false });
  const tableName = (r: SelfEmployedResult) =>
    ({
      es: r.band.table === "reduced" ? "reducida" : "general",
      ca: r.band.table === "reduced" ? "reduïda" : "general",
      en: r.band.table === "reduced" ? "reduced" : "general",
    })[locale];
  const band = (r: SelfEmployedResult) => ({ es: `Tramo ${r.band.n}, tabla ${tableName(r)}`, ca: `Tram ${r.band.n}, taula ${tableName(r)}`, en: `Band ${r.band.n}, ${tableName(r)} table` })[locale];
  if (locale === "es") {
    return {
      title: `Cuota de autónomos según ingresos: ejemplos ${Y}`,
      intro: `Calculados con la misma función que la calculadora. «Rendimiento neto» es lo que facturas sin IVA menos los gastos deducibles; la Seguridad Social le resta un ${g} % de gastos genéricos y lo pasa a media mensual para elegir tramo. Cuota con la base mínima del tramo, autónomo persona física y sin tarifa plana.`,
      caption: `Cuota mínima de autónomos ${Y} según el rendimiento neto del año`,
      cols: ["Rendimiento neto al año", "Al mes, tras el " + g + " %", "Tramo", "Cuota mínima al mes (al año)"],
      band,
      faq: [
        {
          q: `¿Cuánto paga de autónomo alguien que gana ${m0(FAQ_NET_MONTH)} al mes?`,
          a: `Con ${m0(FAQ_NET_MONTH)} netos al mes de la actividad, la Seguridad Social cuenta ${m(f.monthlyEarnings)} tras restar el ${g} %: tramo ${f.band.n} de la tabla ${tableName(f)}, con una cuota mínima de ${m(f.full.monthly)} al mes (${m(f.full.annual)} al año) en ${Y}. Si te das de alta por primera vez (o tras dos años sin ser autónomo), pagas la tarifa plana durante los primeros 12 meses.`,
        },
      ],
    };
  }
  if (locale === "ca") {
    return {
      title: `Quota d'autònoms segons ingressos: exemples ${Y}`,
      intro: `Calculats amb la mateixa funció que la calculadora. «Rendiment net» és el que factures sense IVA menys les despeses deduïbles; la Seguretat Social li resta un ${g} % de despeses genèriques i el passa a mitjana mensual per triar tram. Quota amb la base mínima del tram, autònom persona física i sense tarifa plana.`,
      caption: `Quota mínima d'autònoms ${Y} segons el rendiment net de l'any`,
      cols: ["Rendiment net a l'any", "Al mes, després del " + g + " %", "Tram", "Quota mínima al mes (a l'any)"],
      band,
      faq: [
        {
          q: `Quant paga d'autònom algú que guanya ${m0(FAQ_NET_MONTH)} al mes?`,
          a: `Amb ${m0(FAQ_NET_MONTH)} nets al mes de l'activitat, la Seguretat Social compta ${m(f.monthlyEarnings)} després de restar el ${g} %: tram ${f.band.n} de la taula ${tableName(f)}, amb una quota mínima de ${m(f.full.monthly)} al mes (${m(f.full.annual)} a l'any) el ${Y}. Si et dones d'alta per primera vegada (o després de dos anys sense ser autònom), pagues la tarifa plana durant els primers 12 mesos.`,
        },
      ],
    };
  }
  return {
    title: `Self-employed contributions by earnings: ${Y} examples`,
    intro: `Worked out with the calculator's own function. "Net earnings" are what you invoice without VAT minus deductible expenses; Social Security takes off ${g}% for generic expenses and uses the monthly average to pick the band. Contribution on the band's minimum base, individual self-employed, no flat rate.`,
    caption: `Minimum ${Y} self-employed contribution by yearly net earnings`,
    cols: ["Net earnings a year", `A month, after the ${g}%`, "Band", "Minimum a month (a year)"],
    band,
    faq: [
      {
        q: `How much does a self-employed worker earning ${m0(FAQ_NET_MONTH)} a month pay in Spain?`,
        a: `With ${m0(FAQ_NET_MONTH)} a month of net earnings from the activity, Social Security counts ${m(f.monthlyEarnings)} after taking off ${g}%: band ${f.band.n} of the ${tableName(f)} table, with a minimum contribution of ${m(f.full.monthly)} a month (${m(f.full.annual)} a year) in ${Y}. If you register for the first time (or after two years without being self-employed), you pay the flat rate for the first 12 months.`,
      },
    ],
  };
}
