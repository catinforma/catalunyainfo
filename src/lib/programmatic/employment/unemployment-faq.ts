import type { CalcLocale } from "@/lib/programmatic/calculators/paths";
import { IPREM_MONTHLY } from "@/lib/programmatic/iprem/rules";

import { socCopy } from "./catalonia-soc";
import { money, pct } from "./paths";
import { BENEFIT_SS_RATE, RATE_AFTER, RATE_FIRST } from "./rules";
import { benefitLimits } from "./unemployment";

/**
 * Three more questions on the paro calculator (27 Nov 2026, batch 8J), in the
 * searchers' words (GSC 28 days to 25 Nov: "maximo paro 2026" lands on the
 * subsidy page at 9.0, "import maxim atur 2026" on the Catalan one at 9.0,
 * "calculadora paro 2025" 4 at 19.2 and "calculo prestacion desempleo 2009"
 * 5 at 25.8 on this page). Limits from `benefitLimits` (LGSS art. 270.3 on
 * the IPREM of iprem/rules.ts), the SOC answer from catalonia-soc.ts.
 * Plain text: printed and FAQPage strings are the same. Pure.
 */

export function extraUnemploymentFaq(locale: CalcLocale): { q: string; a: string }[] {
  const m = (x: number) => money(x, locale);
  const [none, one, two] = [benefitLimits(0), benefitLimits(1), benefitLimits(2)];
  const ss = pct(BENEFIT_SS_RATE, locale);
  const first = pct(RATE_FIRST, locale);
  const after = pct(RATE_AFTER, locale);
  const iprem = m(IPREM_MONTHLY);
  const soc = socCopy(locale).faq;
  if (locale === "es") {
    return [
      {
        q: "¿Cuál es el paro máximo en 2026?",
        a: `${m(none.max)} al mes sin hijos a cargo, ${m(one.max)} con un hijo y ${m(two.max)} con dos o más (LGSS, art. 270.3). El mínimo es ${m(none.min)} sin hijos y ${m(one.min)} con hijos. Son importes brutos a jornada completa: el SEPE descuenta el ${ss} de cotización y, si toca, IRPF.`,
      },
      {
        q: "¿El paro de 2026 se calcula igual que el de 2025?",
        a: `Sí: el ${first} de la base reguladora los primeros 180 días y el ${after} después, y el mismo mínimo y máximo, porque se fijan sobre el IPREM, que sigue en ${iprem} al mes desde 2023. Con los mismos días cotizados y la misma base, la calculadora da lo mismo para un paro de 2025 que para uno de 2026.`,
      },
      soc,
    ];
  }
  if (locale === "ca") {
    return [
      {
        q: "Quin és l'atur màxim el 2026?",
        a: `${m(none.max)} al mes sense fills a càrrec, ${m(one.max)} amb un fill i ${m(two.max)} amb dos o més (LGSS, art. 270.3). El mínim és ${m(none.min)} sense fills i ${m(one.min)} amb fills. Són imports bruts a jornada completa: el SEPE descompta el ${ss} de cotització i, si correspon, IRPF.`,
      },
      {
        q: "L'atur del 2026 es calcula igual que el del 2025?",
        a: `Sí: el ${first} de la base reguladora els primers 180 dies i el ${after} després, i el mateix mínim i màxim, perquè es fixen sobre l'IPREM, que continua en ${iprem} al mes des del 2023. Amb els mateixos dies cotitzats i la mateixa base, la calculadora dona el mateix per a un atur del 2025 que per a un del 2026.`,
      },
      soc,
    ];
  }
  return [
    {
      q: "What is the maximum unemployment benefit in Spain in 2026?",
      a: `${m(none.max)} a month with no children in your care, ${m(one.max)} with one child and ${m(two.max)} with two or more (LGSS, art. 270.3). The minimum is ${m(none.min)} without children and ${m(one.min)} with children. These are gross full-time amounts: SEPE deducts ${ss} in contributions and, where due, income tax.`,
    },
    {
      q: "Is unemployment benefit worked out the same way in 2026 as in 2025?",
      a: `Yes: ${first} of the base reguladora for the first 180 days and ${after} after, with the same minimum and maximum, because they are set on the IPREM, still ${iprem} a month since 2023. With the same days contributed and the same base, the calculator gives the same result for a 2025 claim as for a 2026 one.`,
    },
    soc,
  ];
}
