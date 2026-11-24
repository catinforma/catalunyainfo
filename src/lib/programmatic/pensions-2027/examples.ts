import { bareDay, euros, pct, percentText, type PensionLocale } from "./copy";
import { perMonth, revaluePension, type RateStatus } from "./engine";
import { GENDER_GAP_2026, INE_FINAL_DAY, INE_FLASH_DAY, MINIMUMS_2026, PNC_2026_ANNUAL, REVALUATION_2026 } from "./rules";

/**
 * "Cuánto sube tu pensión": the worked-example table and the questions under
 * it (25 Nov 2026), for the pensions 2027 page. The rows are
 * `revaluePension` at the percentage the page is showing, so they move with
 * each INE release and with the BOE figure; nothing here is typed in. The
 * questions answer what Search Console shows people typing at the page
 * ("cuanto suben las pensiones en 2027", "pensión mínima 2027", "tabla de
 * pensiones no contributivas 2027", "subida pensiones 2027 incapacidad
 * permanente", "irpf pensiones 2027"); where an answer would need a 2027
 * amount that is not in the BOE, it says what is fixed (the rule, the 2026
 * figure) and when the rest is due, and prints no 2027 figure.
 * Pure, client-safe.
 */

/** Monthly pensions (14 payments) of the table, € a month in 2026. */
export const EXAMPLE_PENSIONS = [700, 1000, 1500, 2000, 2500, 3000] as const;

export interface ExampleRow {
  monthly2026: number;
  monthly2027: number;
  monthlyRise: number;
  annualRise: number;
}

export function exampleRows(percent: number): ExampleRow[] {
  return EXAMPLE_PENSIONS.map((monthly) => {
    const r = revaluePension({ monthly, payments: 14 }, percent);
    if (r.status !== "ok") throw new Error(`bad example ${monthly}`);
    return { monthly2026: r.monthly2026, monthly2027: r.monthly2027, monthlyRise: r.monthlyRise, annualRise: r.annualRise };
  });
}

const RET65_SINGLE = MINIMUMS_2026.find((m) => m.id === "ret65")!.single;
/** 2026 minimum retirement pension at 65 without a dependent spouse, € a month (RD 241/2026 anexo I ÷ 14). */
export const RET65_SINGLE_MONTHLY_2026 = perMonth(RET65_SINGLE);
/** 2026 non-contributory pension, € a month in 14 payments (8.803,20 ÷ 14 = 628,80). */
export const PNC_MONTHLY_2026 = perMonth(PNC_2026_ANNUAL);

export interface ExampleCopy {
  title: string;
  intro: string;
  caption: string;
  cols: [string, string, string, string];
  note: string;
  faqTitle: string;
  faq: { q: string; a: string }[];
}

const L = <T>(locale: PensionLocale, v: Record<PensionLocale, T>): T => v[locale];

/** Where the figure stands, in one sentence (the first answer of the FAQ). */
export function rateAnswer(locale: PensionLocale, status: RateStatus | null): string {
  const flashDay = bareDay(INE_FLASH_DAY, locale);
  const finalDay = bareDay(INE_FINAL_DAY, locale);
  if (!status) {
    return L(locale, {
      es: "En enero de 2027 las pensiones contributivas suben la media del IPC de diciembre de 2025 a noviembre de 2026 (art. 58.2 de la LGSS).",
      ca: "El gener del 2027 les pensions contributives pugen la mitjana de l'IPC de desembre del 2025 a novembre del 2026 (art. 58.2 de la LGSS).",
      en: "In January 2027 contributory pensions rise by the average CPI from December 2025 to November 2026 (LGSS art. 58.2).",
    });
  }
  const p = percentText(status, locale);
  switch (status.kind) {
    case "provisional":
      return L(locale, {
        es: `De momento, el ${p}: es la media de los ${status.known} meses de IPC que ha publicado el INE, y falta el de noviembre (dato adelantado el ${flashDay}, definitivo el ${finalDay}). No es oficial hasta que el Gobierno lo apruebe en el BOE.`,
        ca: `De moment, el ${p}: és la mitjana dels ${status.known} mesos d'IPC que ha publicat l'INE, i falta el de novembre (dada avançada ${flashDay}, definitiva ${finalDay}). No és oficial fins que el Govern l'aprovi al BOE.`,
        en: `For now, ${p}: the average of the ${status.known} CPI months the INE has released, with November missing (flash figure ${flashDay}, final ${finalDay}). It is not official until the government approves it in the BOE.`,
      });
    case "flash":
      return L(locale, {
        es: `${p}, con el IPC adelantado de noviembre (${pct(status.flash!.value, 1, "es")}, INE, ${bareDay(status.flash!.published, "es")}). El dato definitivo llega el ${finalDay} y la subida es oficial cuando el Gobierno la aprueba en el BOE.`,
        ca: `${p}, amb l'IPC avançat de novembre (${pct(status.flash!.value, 1, "ca")}, INE, ${bareDay(status.flash!.published, "ca")}). La dada definitiva arriba ${finalDay} i la pujada és oficial quan el Govern l'aprova al BOE.`,
        en: `${p}, on November's flash CPI (${pct(status.flash!.value, 1, "en")}, INE, ${bareDay(status.flash!.published, "en")}). The final figure comes on ${finalDay}, and the increase is official when the government approves it in the BOE.`,
      });
    case "final":
      return L(locale, {
        es: `${p}, con los 12 datos definitivos del INE. Falta que el Gobierno lo apruebe en el BOE.`,
        ca: `${p}, amb les 12 dades definitives de l'INE. Falta que el Govern ho aprovi al BOE.`,
        en: `${p}, on the INE's 12 final figures. The government still has to approve it in the BOE.`,
      });
    case "official":
      return L(locale, {
        es: `${p}: es oficial (${status.official!.norm}, BOE del ${bareDay(status.official!.published, "es")}).`,
        ca: `${p}: és oficial (${status.official!.norm}, BOE del ${bareDay(status.official!.published, "ca")}).`,
        en: `${p}: it is official (${status.official!.norm}, BOE of ${bareDay(status.official!.published, "en")}).`,
      });
  }
}

export function exampleCopy(locale: PensionLocale, status: RateStatus | null): ExampleCopy {
  const eur = (x: number) => euros(x, locale);
  const p = status ? percentText(status, locale) : "";
  const ex = status ? revaluePension({ monthly: 1000, payments: 14 }, status.percent) : null;
  const one = ex && ex.status === "ok" ? ex : null;
  const kindWord = status
    ? L(locale, {
        es: { provisional: "provisional", flash: "con el IPC adelantado", final: "con el IPC definitivo", official: "oficial" },
        ca: { provisional: "provisional", flash: "amb l'IPC avançat", final: "amb l'IPC definitiu", official: "oficial" },
        en: { provisional: "provisional", flash: "on the flash CPI", final: "on the final CPI", official: "official" },
      })[status.kind]
    : "";
  const pncFaq = L(locale, {
    es: `La ley fija la regla, no la cifra: las no contributivas se actualizan en la Ley de Presupuestos «al menos, en el mismo porcentaje» que las contributivas (LGSS, art. 62), y para las contributivas mínimas la disposición adicional 53ª dice que el 1 de enero de 2027 la cuantía de referencia se incrementa, si hace falta, hasta el umbral de pobreza de un hogar de dos adultos. Las cuantías de 2027 no son oficiales hasta que las publique el BOE. Las de 2026 son: pensión mínima de jubilación con 65 años y sin cónyuge a cargo, ${eur(RET65_SINGLE)} al año (${eur(RET65_SINGLE_MONTHLY_2026)} al mes en 14 pagas), y pensión no contributiva, ${eur(PNC_2026_ANNUAL)} al año (${eur(PNC_MONTHLY_2026)} al mes).`,
    ca: `La llei fixa la regla, no la xifra: les no contributives s'actualitzen a la Llei de pressupostos «almenys, en el mateix percentatge» que les contributives (LGSS, art. 62), i per a les contributives mínimes la disposició addicional 53a diu que l'1 de gener del 2027 la quantia de referència s'incrementa, si cal, fins al llindar de pobresa d'una llar de dos adults. Les quanties del 2027 no són oficials fins que les publiqui el BOE. Les del 2026 són: pensió mínima de jubilació amb 65 anys i sense cònjuge a càrrec, ${eur(RET65_SINGLE)} l'any (${eur(RET65_SINGLE_MONTHLY_2026)} al mes en 14 pagues), i pensió no contributiva, ${eur(PNC_2026_ANNUAL)} l'any (${eur(PNC_MONTHLY_2026)} al mes).`,
    en: `The law fixes the rule, not the figure: non-contributory pensions are updated in the Budget Act "at least by the same percentage" as contributory ones (LGSS art. 62), and for the minimum contributory pensions additional provision 53 says that on 1 January 2027 the reference amount rises, if needed, to the poverty threshold of a two-adult household. The 2027 amounts are not official until the BOE publishes them. The 2026 ones are: minimum retirement pension at 65 with no dependent spouse, ${eur(RET65_SINGLE)} a year (${eur(RET65_SINGLE_MONTHLY_2026)} a month in 14 payments), and non-contributory pension, ${eur(PNC_2026_ANNUAL)} a year (${eur(PNC_MONTHLY_2026)} a month).`,
  });
  return {
    title: L(locale, { es: "Cuánto sube tu pensión: ejemplos con el dato de hoy", ca: "Quant puja la teva pensió: exemples amb la dada d'avui", en: "How much your pension rises: examples on today's figure" }),
    intro: status
      ? L(locale, {
          es: `Con el ${p} (${kindWord}), calculado con la misma función que la calculadora, en 14 pagas. Si la cifra cambia (nuevo dato del INE o el BOE), la tabla cambia con ella.`,
          ca: `Amb el ${p} (${kindWord}), calculat amb la mateixa funció que la calculadora, en 14 pagues. Si la xifra canvia (nova dada de l'INE o el BOE), la taula canvia amb ella.`,
          en: `At ${p} (${kindWord}), worked out with the same function as the calculator, in 14 payments. If the figure changes (a new INE release or the BOE), the table changes with it.`,
        })
      : "",
    caption: L(locale, {
      es: "Pensión contributiva por debajo del máximo, antes de IRPF",
      ca: "Pensió contributiva per sota del màxim, abans d'IRPF",
      en: "Contributory pension below the maximum, before income tax",
    }),
    cols: L<[string, string, string, string]>(locale, {
      es: ["Pensión de 2026 al mes", "Pensión de 2027 al mes", "Sube al mes", "Sube al año (14 pagas)"],
      ca: ["Pensió del 2026 al mes", "Pensió del 2027 al mes", "Puja al mes", "Puja a l'any (14 pagues)"],
      en: ["2026 pension a month", "2027 pension a month", "Rise a month", "Rise a year (14 payments)"],
    }),
    note: L(locale, {
      es: "El IRPF y otros descuentos no están incluidos. Las pensiones por debajo de la mínima pueden recibir un complemento y las que superan el máximo no pasan de él: mira las secciones de mínimas y de ley.",
      ca: "No s'inclouen l'IRPF ni altres descomptes. Les pensions per sota de la mínima poden rebre un complement i les que superen el màxim no hi passen: mira les seccions de mínimes i de llei.",
      en: "Income tax and other deductions are not included. Pensions below the minimum may get a top-up and those above the maximum are capped: see the minimums and law sections.",
    }),
    faqTitle: L(locale, { es: "Preguntas frecuentes sobre la subida de 2027", ca: "Preguntes freqüents sobre la pujada del 2027", en: "Questions on the 2027 increase" }),
    faq: [
      {
        q: L(locale, { es: "¿Cuánto suben las pensiones en 2027?", ca: "Quant pugen les pensions el 2027?", en: "How much do pensions rise in 2027?" }),
        a: rateAnswer(locale, status),
      },
      {
        q: L(locale, { es: "¿Cuándo se sabe la subida de las pensiones de 2027?", ca: "Quan se sap la pujada de les pensions del 2027?", en: "When will the 2027 pension increase be known?" }),
        a: L(locale, {
          es: `El INE publica el IPC de noviembre adelantado el ${bareDay(INE_FLASH_DAY, "es")} y definitivo el ${bareDay(INE_FINAL_DAY, "es")}; con él se calcula la media de diciembre a noviembre. La subida es oficial cuando el Gobierno la aprueba en el BOE: la de 2026 fue el ${pct(REVALUATION_2026, 1, "es")} del Real Decreto-ley 3/2026, publicado el 4 de febrero de 2026.`,
          ca: `L'INE publica l'IPC de novembre avançat ${bareDay(INE_FLASH_DAY, "ca")} i definitiu ${bareDay(INE_FINAL_DAY, "ca")}; amb ell es calcula la mitjana de desembre a novembre. La pujada és oficial quan el Govern l'aprova al BOE: la del 2026 va ser el ${pct(REVALUATION_2026, 1, "ca")} del Reial decret llei 3/2026, publicat el 4 de febrer de 2026.`,
          en: `The INE publishes November's CPI as a flash figure on ${bareDay(INE_FLASH_DAY, "en")} and the final one on ${bareDay(INE_FINAL_DAY, "en")}; the December-to-November average comes from it. The increase is official when the government approves it in the BOE: 2026's was ${pct(REVALUATION_2026, 1, "en")}, in Royal Decree-law 3/2026, published on 4 February 2026.`,
        }),
      },
      {
        q: L(locale, { es: "¿Suben la pensión mínima y las pensiones no contributivas en 2027?", ca: "Pugen la pensió mínima i les pensions no contributives el 2027?", en: "Do the minimum and non-contributory pensions rise in 2027?" }),
        a: pncFaq,
      },
      {
        q: L(locale, { es: "¿Suben la incapacidad permanente y la viudedad en 2027?", ca: "Pugen la incapacitat permanent i la viduïtat el 2027?", en: "Do permanent disability and widow's pensions rise in 2027?" }),
        a: L(locale, {
          es: `Sí, todas las pensiones contributivas con el mismo porcentaje (LGSS, art. 58.2): jubilación, incapacidad permanente, viudedad, orfandad y a favor de familiares, además del complemento de brecha de género, que en 2026 es de ${eur(GENDER_GAP_2026)} al mes.`,
          ca: `Sí, totes les pensions contributives amb el mateix percentatge (LGSS, art. 58.2): jubilació, incapacitat permanent, viduïtat, orfandat i a favor de familiars, a més del complement de bretxa de gènere, que el 2026 és de ${eur(GENDER_GAP_2026)} al mes.`,
          en: `Yes, every contributory pension rises by the same percentage (LGSS art. 58.2): retirement, permanent disability, widow's, orphan's and family-member pensions, plus the gender-gap supplement, ${eur(GENDER_GAP_2026)} a month in 2026.`,
        }),
      },
      {
        q: L(locale, { es: "¿Cuánto sube una pensión de 1.000 euros?", ca: "Quant puja una pensió de 1.000 euros?", en: "How much does a €1,000 pension rise?" }),
        a: one
          ? L(locale, {
              es: `Con el ${p}, una pensión de ${eur(one.monthly2026)} al mes pasa a ${eur(one.monthly2027)}: ${eur(one.monthlyRise)} más al mes y ${eur(one.annualRise)} más al año en 14 pagas.`,
              ca: `Amb el ${p}, una pensió de ${eur(one.monthly2026)} al mes passa a ${eur(one.monthly2027)}: ${eur(one.monthlyRise)} més al mes i ${eur(one.annualRise)} més a l'any en 14 pagues.`,
              en: `At ${p}, a pension of ${eur(one.monthly2026)} a month becomes ${eur(one.monthly2027)}: ${eur(one.monthlyRise)} more a month and ${eur(one.annualRise)} more a year in 14 payments.`,
            })
          : L(locale, { es: "Usa la calculadora: depende del porcentaje que fije el IPC.", ca: "Fes servir la calculadora: depèn del percentatge que fixi l'IPC.", en: "Use the calculator: it depends on the percentage the CPI sets." }),
      },
    ],
  };
}
