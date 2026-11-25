import type { Locale } from "@/lib/i18n/config";
import { calcPath } from "@/lib/programmatic/calculators/paths";
import { headline } from "@/lib/programmatic/bono-social/page";
import { money, percent } from "@/lib/programmatic/net-salary/copy";
import { REVALUATION_2026 } from "@/lib/programmatic/pensions-2027/rules";
import {
  AMOUNT_BANDS,
  INCOME_LIMIT,
  INCOME_LIMIT_SHARE,
  OVER52_AGE,
  OVER52_SHARE,
  RULES_YEAR,
  monthlyAmount,
} from "@/lib/programmatic/unemployment-subsidy/rules";

/**
 * Contextual links to the two calculators that had almost no inlinks from
 * pages whose readers need them (link audit of 25 Nov 2026):
 *
 *  - the unemployment subsidy checker (calcPath "unemployment-subsidy"), from
 *    the SMI page (75 % of the SMI is the rents ceiling), the dismissal
 *    calculator's "do I get unemployment benefit" answer and the retirement
 *    age page's early-retirement list (the over-52 subsidy);
 *  - the 2027 pension increase calculator (calcPath "pensions-2027"), from the
 *    widow's pension and non-contributory pension pages' "changes in January
 *    2027" bullets.
 *
 * Every sentence is built from the constants the calculators themselves use
 * (unemployment-subsidy/rules.ts; SEPE "Cuantías anuales", read again on
 * 25 Nov 2026: «IPREM ... 600,00 €», «(95% IPREM) ... (90 % IPREM) ... Desde
 * el día 361 (80% IPREM)  570,00  540,00  480,00», «Renta máxima de acceso a
 * subsidio  75% SMI  915,75 €»; pensions-2027/rules.ts: RDL 3/2026 art. 2.1
 * «el 2,7 por ciento»), so a sentence moves with them and the year guards of
 * those modules stay the only dated thing. The pension sentence states the
 * rule and last January's percentage, never a 2027 percentage: that one is
 * not fixed until the INE's November CPI and the BOE norm are out.
 *
 * Plain markdown (**bold** and [label](path)); components render it with
 * `mdLinks` (components/programmatic/calculators/md-links.tsx). Client-safe.
 */

const subsidyLink = (locale: Locale, label: Record<Locale, string>) => `[${label[locale]}](${calcPath("unemployment-subsidy", locale)})`;
const pensionLink = (locale: Locale, label: Record<Locale, string>) => `[${label[locale]}](${calcPath("pensions-2027", locale)})`;

/** "IPREM de 2026" as a link to the IPREM page (anchor in the query's words: "IPREM 2026"). */
const ipremLink = (locale: Locale) =>
  `[${{ es: `IPREM de ${RULES_YEAR}`, ca: `IPREM del ${RULES_YEAR}`, en: `${RULES_YEAR} IPREM` }[locale]}](${calcPath("iprem", locale)})`;

const SUBSIDY_CHECK: Record<Locale, string> = {
  es: "Comprueba si te corresponde el subsidio por desempleo",
  ca: "Comprova si et correspon el subsidi d'atur",
  en: "Check whether you qualify for the unemployment subsidy",
};

/** SMI page: the SMI is the rents ceiling of the unemployment subsidy (LGSS art. 275). */
export function subsidyIncomeLimitLine(locale: Locale): string {
  const share = percent(INCOME_LIMIT_SHARE * 100, locale, 0);
  const limit = money(INCOME_LIMIT, locale);
  const link = subsidyLink(locale, SUBSIDY_CHECK);
  return {
    es: `El SMI también marca el tope de rentas mensuales del subsidio por desempleo: el ${share} del SMI mensual de ${RULES_YEAR}, sin pagas extra, son ${limit}. ${link}.`,
    ca: `L'SMI també marca el topall de rendes mensuals del subsidi d'atur: el ${share} de l'SMI mensual del ${RULES_YEAR}, sense pagues extra, són ${limit}. ${link}.`,
    en: `The SMI also sets the monthly income ceiling for the unemployment subsidy: ${share} of the ${RULES_YEAR} monthly SMI, extra payments left out, is ${limit}. ${link}.`,
  }[locale];
}

/** Dismissal calculator, "do I get unemployment benefit?": what is left under 360 days or after the benefit ends. */
export function subsidyAmountsLine(locale: Locale): string {
  const euros = AMOUNT_BANDS.map((band) => money(monthlyAmount(band.share), locale, 0));
  const shares = AMOUNT_BANDS.map((band) => percent(band.share * 100, locale, 0));
  const link = subsidyLink(locale, SUBSIDY_CHECK);
  const iprem = ipremLink(locale);
  return {
    es: `Si no llegas a los 360 días cotizados o se te acaba el paro, puede quedarte el subsidio por desempleo: ${euros[0]} al mes los 6 primeros meses (${shares[0]} del ${iprem}), ${euros[1]} hasta el mes 12 (${shares[1]}) y ${euros[2]} después (${shares[2]}). ${link}.`,
    ca: `Si no arribes als 360 dies cotitzats o se't acaba l'atur, et pot quedar el subsidi per desocupació: ${euros[0]} al mes els 6 primers mesos (${shares[0]} de l'${iprem}), ${euros[1]} fins al mes 12 (${shares[1]}) i ${euros[2]} després (${shares[2]}). ${link}.`,
    en: `If you fall short of 360 days contributed or your unemployment benefit runs out, the unemployment subsidy may be left: ${euros[0]} a month for the first 6 months (${shares[0]} of the ${iprem}), ${euros[1]} up to month 12 (${shares[1]}) and ${euros[2]} after that (${shares[2]}). ${link}.`,
  }[locale];
}

/** Retirement age page, early retirement after the subsidy: the over-52 subsidy is 80 % of the IPREM. */
export function subsidyOver52Line(locale: Locale): string {
  const amount = money(monthlyAmount(OVER52_SHARE), locale, 0);
  const share = percent(OVER52_SHARE * 100, locale, 0);
  const link = subsidyLink(locale, SUBSIDY_CHECK);
  const iprem = ipremLink(locale);
  return {
    es: `Desde los ${OVER52_AGE} años ese subsidio es de ${amount} al mes (el ${share} del ${iprem}). ${link}.`,
    ca: `Des dels ${OVER52_AGE} anys aquest subsidi és de ${amount} al mes (el ${share} de l'${iprem}). ${link}.`,
    en: `From age ${OVER52_AGE} that subsidy is ${amount} a month (${share} of the ${iprem}). ${link}.`,
  }[locale];
}

export type BonoSocialKind = "smi" | "subsidy" | "non-contributory";

/**
 * Subsidy, SMI and non-contributory pension pages: the bono social's income
 * limit for one person alone (RD 897/2017 art. 3.2.a: 1.5 × the 14-payment
 * IPREM) with the extras per adult and per minor, from the bono social
 * module's own headline() (the same numbers as the bono social page's lead).
 * No discount percentage here: the 2026 rate ends on 31 Dec 2026 and the
 * bono social page (date-guarded) is where it is stated.
 */
export function bonoSocialLimitLine(locale: Locale, kind: BonoSocialKind): string {
  const h = headline();
  const alone = money(h.alone.vulnerable, locale, 0);
  const adult = money(h.perAdult, locale, 0);
  const minor = money(h.perMinor, locale, 0);
  const link = `[${{ es: "bono social eléctrico", ca: "bo social elèctric", en: "bono social for electricity" }[locale]}](${calcPath("bono-social", locale)})`;
  const lead: Record<BonoSocialKind, Record<Locale, string>> = {
    smi: {
      es: `Otro límite de ingresos que usa el IPREM, no el SMI: el ${link}.`,
      ca: `Un altre límit d'ingressos que fa servir l'IPREM, no l'SMI: el ${link}.`,
      en: `Another income limit that runs on the IPREM, not the SMI: the ${link}.`,
    },
    subsidy: {
      es: `Con estos ingresos puedes mirar también el ${link}.`,
      ca: `Amb aquests ingressos pots mirar també el ${link}.`,
      en: `On an income like this you can also check the ${link}.`,
    },
    "non-contributory": {
      es: `Si tus ingresos son bajos, comprueba también el ${link}.`,
      ca: `Si els teus ingressos són baixos, comprova també el ${link}.`,
      en: `If your income is low, also check the ${link}.`,
    },
  };
  return {
    es: `${lead[kind].es} El límite de ingresos del bono social para una persona sola es de ${alone} al año (1,5 veces el IPREM de 14 pagas), más ${adult} por cada adulto más y ${minor} por cada menor.`,
    ca: `${lead[kind].ca} El límit d'ingressos del bo social per a una persona sola és de ${alone} l'any (1,5 vegades l'IPREM de 14 pagues), més ${adult} per cada adult més i ${minor} per cada menor.`,
    en: `${lead[kind].en} The bono social income limit for one person alone is ${alone} a year (1.5 times the 14-payment IPREM), plus ${adult} for each further adult and ${minor} for each minor.`,
  }[locale];
}

export type PensionKind = "widow" | "non-contributory";

/** Widow's and non-contributory pension pages: the January rule, last January's percentage, the calculator. */
export function pensionRevaluationLine(locale: Locale, kind: PensionKind): string {
  const pc = percent(REVALUATION_2026, locale, 1);
  const link = pensionLink(locale, {
    es: "Calcula la subida de las pensiones en 2027",
    ca: "Calcula la pujada de les pensions el 2027",
    en: "Work out the 2027 pension increase",
  });
  const lead: Record<PensionKind, Record<Locale, string>> = {
    widow: {
      es: "La pensión de viudedad es contributiva y se revaloriza como las demás:",
      ca: "La pensió de viduïtat és contributiva i es revaloritza com les altres:",
      en: "The widow's pension is contributory and is revalued like the others:",
    },
    "non-contributory": {
      es: "Las contributivas, la referencia de esa subida, se revalorizan así:",
      ca: "Les contributives, la referència d'aquesta pujada, es revaloritzen així:",
      en: "Contributory pensions, the benchmark for that rise, are revalued like this:",
    },
  };
  return {
    es: `${lead[kind].es} cada enero, la media de las tasas anuales del IPC de diciembre a noviembre (LGSS art. 58.2); en 2026 fue el ${pc} (RDL 3/2026, art. 2.1). ${link}.`,
    ca: `${lead[kind].ca} cada gener, la mitjana de les taxes anuals de l'IPC de desembre a novembre (LGSS art. 58.2); el 2026 va ser el ${pc} (RDL 3/2026, art. 2.1). ${link}.`,
    en: `${lead[kind].en} each January, by the mean of the annual CPI rates from December to November (LGSS art. 58.2); in 2026 it was ${pc} (RDL 3/2026, art. 2.1). ${link}.`,
  }[locale];
}
