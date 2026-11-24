import { bareDay, euros, num, pct, percentText, rangeText, monthText, type PensionLocale } from "./copy";
import { revaluePension, type PensionInput, type RateStatus } from "./engine";
import { HOWTO_LGSS_UPDATED, HOWTO_READ, WINDOW_FROM, WINDOW_TO } from "./rules";

/**
 * "How is the pension increase calculated?": the three steps of LGSS art. 58
 * under the calculator, with the arithmetic of today's figure and one worked
 * pension. Every number comes from the same status the lead and the
 * calculator use (months released, mean, percent) and from revaluePension(),
 * so the text moves with the INE's releases and can never drift from the
 * calculator; tests/pensions-2027.test.ts pins it on the 13 Nov series. Pure.
 */

const L = <T>(locale: PensionLocale, v: Record<PensionLocale, T>): T => v[locale];

/** The worked pension: 1.500 € a month in 14 payments (the lead's example is 1.000 €). */
export const HOWTO_EXAMPLE: PensionInput = { monthly: 1500, payments: 14 };

export interface PensionHowTo {
  heading: string;
  /** The three steps, in order. */
  steps: string[];
  example: string;
  source: string;
}

/** The released rates (the flash November counts in "flash"), in tenths-exact sum. */
function released(status: RateStatus): { values: number[]; sum: number } {
  const values = status.months
    .map((m) => (m.value !== null ? m.value : status.flash && status.flash.month === m.month ? status.flash.value : null))
    .filter((v): v is number => v !== null);
  return { values, sum: Math.round(values.reduce((a, v) => a + Math.round(v * 10), 0)) / 10 };
}

export function pensionHowTo(locale: PensionLocale, status: RateStatus): PensionHowTo {
  const range = rangeText(WINDOW_FROM, WINDOW_TO, locale);
  const dec = status.kind === "provisional" ? 2 : 1;
  const p = percentText(status, locale);
  const { values, sum } = released(status);
  const n = values.length;
  const missing = status.months.find((m) => m.value === null && !(status.flash && status.flash.month === m.month));
  const mean = status.mean;

  const step1 = L(locale, {
    es: `Se toman las tasas de variación anual del IPC general de cada mes, de ${range}, tal como las publica el INE (la tabla de arriba).`,
    ca: `Es prenen les taxes de variació anual de l'IPC general de cada mes, de ${range}, tal com les publica l'INE (la taula de dalt).`,
    en: `Take the annual CPI rate of each month, from ${range}, as the INE publishes them (the table above).`,
  });

  let step2: string;
  if (status.kind === "official" && status.official) {
    const o = status.official;
    step2 = L(locale, {
      es: `La subida oficial es del ${p}, la que fija ${o.norm} (BOE del ${bareDay(o.published, "es")}).`,
      ca: `La pujada oficial és del ${p}, la que fixa ${o.norm} (BOE del ${bareDay(o.published, "ca")}).`,
      en: `The official increase is ${p}, the one ${o.norm} sets (BOE of ${bareDay(o.published, "en")}).`,
    });
  } else if (status.kind === "provisional") {
    const miss = missing ? monthText(missing.month, locale) : "";
    step2 = L(locale, {
      es: `Se hace la media: con los ${n} meses publicados, ${num(sum, 1, "es")} ÷ ${n} = ${pct(mean ?? status.percent, 2, "es")}. Falta el IPC de ${miss}: con los doce se hace la media completa; para 2026 el RDL 3/2026 la expresó con un decimal («expresado con un decimal»).`,
      ca: `Es fa la mitjana: amb els ${n} mesos publicats, ${num(sum, 1, "ca")} ÷ ${n} = ${pct(mean ?? status.percent, 2, "ca")}. Falta l'IPC de ${miss}: amb els dotze es fa la mitjana completa; per al 2026 el RDL 3/2026 la va expressar amb un decimal («expresado con un decimal»).`,
      en: `Average them: on the ${n} months released, ${num(sum, 1, "en")} ÷ ${n} = ${pct(mean ?? status.percent, 2, "en")}. ${miss}'s CPI is missing: with all twelve the full average is made; for 2026 RDL 3/2026 expressed it with one decimal (“expresado con un decimal”).`,
    });
  } else {
    const flash = status.kind === "flash";
    step2 = L(locale, {
      es: `Se hace la media de los doce${flash ? ", con el dato adelantado de noviembre" : ", con los datos definitivos"}: ${num(sum, 1, "es")} ÷ ${n} = ${pct(mean ?? status.percent, 2, "es")}, que con un decimal, como en el RDL 3/2026 para 2026, es ${p}.`,
      ca: `Es fa la mitjana dels dotze${flash ? ", amb la dada avançada de novembre" : ", amb les dades definitives"}: ${num(sum, 1, "ca")} ÷ ${n} = ${pct(mean ?? status.percent, 2, "ca")}, que amb un decimal, com al RDL 3/2026 per al 2026, és ${p}.`,
      en: `Average the twelve${flash ? ", with November's flash figure" : ", on the final figures"}: ${num(sum, 1, "en")} ÷ ${n} = ${pct(mean ?? status.percent, 2, "en")}, which to one decimal, as in RDL 3/2026 for 2026, is ${p}.`,
    });
  }

  const step3 = L(locale, {
    es: "Esa media es el porcentaje: la pensión de enero de 2027 es la de 2026 × (1 + porcentaje ÷ 100), y también la paga extra. Si la media saliera negativa, las pensiones no bajan (art. 58.3).",
    ca: "Aquesta mitjana és el percentatge: la pensió de gener del 2027 és la del 2026 × (1 + percentatge ÷ 100), i també la paga extra. Si la mitjana sortís negativa, les pensions no baixen (art. 58.3).",
    en: "That average is the percentage: the January 2027 pension is the 2026 one × (1 + percentage ÷ 100), and so is the extra payment. If the average came out negative, pensions do not fall (art. 58.3).",
  });

  const r = revaluePension(HOWTO_EXAMPLE, status.percent);
  if (r.status !== "ok") throw new Error("pension how-to example is invalid");
  const factor = (loc: PensionLocale) => num(1 + status.percent / 100, dec + 2, loc);
  const qual = L(locale, {
    es: { provisional: "provisional, con los meses publicados", flash: "que sale con el IPC adelantado de noviembre", final: "de los doce datos definitivos", official: "oficial" },
    ca: { provisional: "provisional, amb els mesos publicats", flash: "que surt amb l'IPC avançat de novembre", final: "de les dotze dades definitives", official: "oficial" },
    en: { provisional: "provisional, on the months released", flash: "from November's flash CPI", final: "from the twelve final figures", official: "official" },
  })[status.kind];
  const example = L(locale, {
    es: `Ejemplo con el ${p} (${qual}): una pensión de ${euros(r.monthly2026, "es")} al mes en ${HOWTO_EXAMPLE.payments} pagas × ${factor("es")} = ${euros(r.monthly2027, "es")} al mes (+${euros(r.monthlyRise, "es")}), o ${euros(r.annual2027, "es")} al año frente a ${euros(r.annual2026, "es")} (+${euros(r.annualRise, "es")}). Es bruto, antes del IRPF.`,
    ca: `Exemple amb el ${p} (${qual}): una pensió de ${euros(r.monthly2026, "ca")} al mes en ${HOWTO_EXAMPLE.payments} pagues × ${factor("ca")} = ${euros(r.monthly2027, "ca")} al mes (+${euros(r.monthlyRise, "ca")}), o ${euros(r.annual2027, "ca")} l'any davant de ${euros(r.annual2026, "ca")} (+${euros(r.annualRise, "ca")}). És brut, abans de l'IRPF.`,
    en: `Example with ${p} (${qual}): a pension of ${euros(r.monthly2026, "en")} a month in ${HOWTO_EXAMPLE.payments} payments × ${factor("en")} = ${euros(r.monthly2027, "en")} a month (+${euros(r.monthlyRise, "en")}), or ${euros(r.annual2027, "en")} a year against ${euros(r.annual2026, "en")} (+${euros(r.annualRise, "en")}). It is gross, before income tax.`,
  });

  return {
    heading: L(locale, {
      es: "¿Cómo se calcula la subida de las pensiones en 2027?",
      ca: "Com es calcula la pujada de les pensions el 2027?",
      en: "How is the 2027 pension increase calculated?",
    }),
    steps: [step1, step2, step3],
    example,
    source: L(locale, {
      es: `Fuente: art. 58 de la Ley General de la Seguridad Social, texto consolidado del BOE (actualización del ${bareDay(HOWTO_LGSS_UPDATED, "es")}), leído el ${bareDay(HOWTO_READ, "es")}; el decimal, del preámbulo del Real Decreto-ley 3/2026 (BOE-A-2026-2548, leído el mismo día); las tasas, del INE. Tu importe lo fija la Seguridad Social en tu carta de revalorización.`,
      ca: `Font: art. 58 de la Llei general de la Seguretat Social, text consolidat del BOE (actualització del ${bareDay(HOWTO_LGSS_UPDATED, "ca")}), llegit el ${bareDay(HOWTO_READ, "ca")}; el decimal, del preàmbul del Reial decret llei 3/2026 (BOE-A-2026-2548, llegit el mateix dia); les taxes, de l'INE. El teu import el fixa la Seguretat Social a la teva carta de revaloració.`,
      en: `Source: art. 58 of the General Social Security Act, consolidated text on the BOE (updated ${bareDay(HOWTO_LGSS_UPDATED, "en")}), read on ${bareDay(HOWTO_READ, "en")}; the decimal, from the preamble of Royal Decree-law 3/2026 (BOE-A-2026-2548, read the same day); the rates, from the INE. Social Security sets your amount in your revaluation letter.`,
    }),
  };
}
