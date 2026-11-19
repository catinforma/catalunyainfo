import type { ScaleRow } from "@/lib/programmatic/inheritance-tax/regions/types";

import type { CmpSource } from "./types";

/**
 * The state rules of the comparison: Ley 29/1987 del Impuesto sobre
 * Sucesiones y Donaciones, which applies in full in Ceuta and Melilla (with
 * the rebate of its art. 23 bis) and wherever a community has no rule of its
 * own (arts. 20.2, 21.2, 22.2).
 *
 * Read on 19 Nov 2026 in the BOE's consolidated text (BOE-A-1987-28141, last
 * update published 28/12/2022): art. 20 as worded since 28/12/2012 (its
 * group and home figures since 2002), arts. 21 and 22 since 01/01/2002, art.
 * 23 bis since 01/01/2004 (Ley 62/2003 raised the Ceuta and Melilla rebate to
 * 99 % for groups I and II). The AEAT, which manages the tax in Ceuta and
 * Melilla, lists forms 650 and 651 on its page for the tax.
 *
 * A test fails from RULES_UNTIL (tests/inheritance-compare.test.ts): re-read
 * every territory's text, then move both dates.
 */

export const RULES_AS_OF = "2026-11-19";
/** From this day a test fails: most communities change this tax in their budget laws from 1 January. */
export const RULES_UNTIL = "2027-01-01";

export const STATE_SOURCES = {
  lisd: {
    short: "Ley 29/1987",
    name: "Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones",
    publisher: "BOE (texto consolidado)",
    ref: "BOE-A-1987-28141, arts. 20, 21, 22 y 23 bis; última actualización publicada el 28/12/2022",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-1987-28141",
    read: RULES_AS_OF,
  },
  lofca: {
    short: "Ley 22/2009",
    name: "Ley 22/2009, de 18 de diciembre, del sistema de financiación de las Comunidades Autónomas de régimen común",
    publisher: "BOE (texto consolidado)",
    ref: "BOE-A-2009-20375, arts. 28, 32 y 48",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2009-20375",
    read: RULES_AS_OF,
  },
  aeat: {
    short: "AEAT",
    name: "Impuesto sobre Sucesiones y Donaciones (modelos 650 y 651)",
    publisher: "Agencia Tributaria (AEAT)",
    ref: "sede electrónica",
    url: "https://sede.agenciatributaria.gob.es/Sede/impuestos-tasas/impuesto-sobre-sucesiones-donaciones.html",
    read: RULES_AS_OF,
  },
} as const satisfies Record<string, CmpSource>;

/** The day the current wording of each state article applies (BOE, "Seleccionar redacción"). */
export const STATE_FROM = { art20: "2012-12-28", art21: "2002-01-01", art22: "2002-01-01", art23bis: "2004-01-01" } as const;

/** Art. 20.2.a. */
export const STATE_GROUP_II = 15_956.87;
export const STATE_GROUP_III = 7_993.46;
/** Art. 20.2.c, third paragraph: 95 % of the deceased's habitual home, up to this per taxpayer. */
export const STATE_HOME = { percent: 95, cap: 122_606.47 } as const;
/** Art. 22.2: groups I and II, prior wealth up to 402.678,11 €. */
export const STATE_COEFFICIENT_I_II = 1;
export const STATE_COEFFICIENT_III = 1.5882;

/** Art. 21.2, as printed: from `from` of base liquidable, the quota, then `rate` % on the rest. */
export const STATE_SCALE: readonly ScaleRow[] = [
  { from: 0, quota: 0, rate: 7.65 },
  { from: 7_993.46, quota: 611.5, rate: 8.5 },
  { from: 15_980.91, quota: 1_290.43, rate: 9.35 },
  { from: 23_968.36, quota: 2_037.26, rate: 10.2 },
  { from: 31_955.81, quota: 2_851.98, rate: 11.05 },
  { from: 39_943.26, quota: 3_734.59, rate: 11.9 },
  { from: 47_930.72, quota: 4_685.1, rate: 12.75 },
  { from: 55_918.17, quota: 5_703.5, rate: 13.6 },
  { from: 63_905.62, quota: 6_789.79, rate: 14.45 },
  { from: 71_893.07, quota: 7_943.98, rate: 15.3 },
  { from: 79_880.52, quota: 9_166.06, rate: 16.15 },
  { from: 119_757.67, quota: 15_606.22, rate: 18.7 },
  { from: 159_634.83, quota: 23_063.25, rate: 21.25 },
  { from: 239_389.13, quota: 40_011.04, rate: 25.5 },
  { from: 398_777.54, quota: 80_655.08, rate: 29.75 },
  { from: 797_555.08, quota: 199_291.4, rate: 34 },
];

/** Art. 23 bis: Ceuta and Melilla. */
export const CITY_BONUS = { groupsIandII: 99, others: 50, gifts: 50, residenceYears: 5 } as const;

/** The BOE's words. Tests check every figure above appears in its quote. */
export const STATE_QUOTE = {
  groupII: "Grupo II: adquisiciones por descendientes y adoptados de veintiuno o más años, cónyuges, ascendientes y adoptantes, 15.956,87 euros.",
  groupIII: "Grupo III: adquisiciones por colaterales de segundo y tercer grado, ascendientes y descendientes por afinidad, 7.993,46 euros.",
  home: 'Del mismo porcentaje de reducción, con el límite de 122.606,47 euros para cada sujeto pasivo y con el requisito de permanencia señalado anteriormente, gozarán las adquisiciones "mortis causa" de la vivienda habitual de la persona fallecida, siempre que los causahabientes sean cónyuge, ascendientes o descendientes de aquél, o bien pariente colateral mayor de sesenta y cinco años que hubiese convivido con el causante durante los dos años anteriores al fallecimiento.',
  homeKeep: "otra del 95 por 100 del mencionado valor, siempre que la adquisición se mantenga, durante los diez años siguientes al fallecimiento del causante, salvo que falleciera el adquirente dentro de ese plazo.",
  scale: "la base liquidable será gravada a los tipos que se indican en la siguiente escala:",
  scaleTop: "797.555,08",
  coefficient: "1,0000 1,5882 2,0000 De más de 402.678,11 a 2.007.380,43",
  giftBase: "5. En las adquisiciones por título de donación o equiparable, si la Comunidad Autónoma no hubiese regulado las reducciones a que se refiere el apartado 1 o no resultase aplicable a los sujetos pasivos la normativa propia de la Comunidad, la base liquidable coincidirá, en todo caso, con la imponible, salvo lo dispuesto en los siguientes apartados y en la disposición final primera.",
  cityInheritance:
    '1. En las cuotas de este impuesto derivadas de adquisiciones "mortis causa" y las cantidades percibidas por los beneficiarios de seguros sobre la vida, que se acumulen al resto de bienes y derechos que integran la porción hereditaria del beneficiario, se efectuará una bonificación del 50 por 100 de la cuota, siempre que el causante hubiera tenido su residencia habitual a la fecha del devengo en Ceuta o Melilla y durante los cinco años anteriores, contados fecha a fecha, que finalicen el día anterior al del devengo.',
  cityGroupsIandII: "No obstante, la bonificación a que se refiere el párrafo anterior se elevará al 99 por ciento para los causahabientes comprendidos, según el grado de parentesco, en los grupos I y II señalados en el artículo 20 de esta ley.",
  cityGiftProperty: '2. En los supuestos de adquisiciones "inter vivos", se aplicará una bonificación del 50 por 100 de la parte de la cuota que proporcionalmente corresponda a los inmuebles situados en Ceuta o Melilla.',
  cityGiftOther: '3. En el caso de las demás adquisiciones "inter vivos", se aplicará una bonificación del 50 por 100 de la cuota que corresponda cuando el adquirente tenga su residencia habitual en Ceuta o Melilla.',
  improved: "Si la actividad de la Comunidad Autónoma consistiese en mejorar una reducción estatal, la reducción mejorada sustituirá, en esa Comunidad Autónoma, a la reducción estatal.",
} as const;
