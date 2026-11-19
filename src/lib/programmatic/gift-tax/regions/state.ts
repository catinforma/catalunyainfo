import { STATE_QUOTE } from "@/lib/programmatic/inheritance-tax/regions/state";

/**
 * The state rules behind the four gift tax calculators: who pays and on what
 * (Ley 29/1987 arts. 5, 9, 24), the base liquidable equal to the base
 * imponible where a community has no reductions of its own (art. 20.5), the
 * accumulation of gifts from the same donor within three years (art. 30), the
 * state's 30-working-day deadline (RD 1629/1991 art. 67.1.b) and which
 * community taxes a gift (Ley 22/2009 arts. 28 and 32), in the words of the
 * BOE's consolidated texts.
 *
 * Read on 19 Nov 2026 with curl + grep: Ley 29/1987 (BOE-A-1987-28141, last
 * update published 28/12/2022; art. 30 in the wording of Ley 11/2021, in
 * force 11/07/2021), RD 1629/1991 (BOE-A-1991-27678, last update 05/04/2023),
 * Ley 22/2009 (BOE-A-2009-20375, last update 29/07/2022).
 *
 * A test fails from RULES_UNTIL (tests/gift-tax.test.ts): re-read the four
 * communities' texts and these articles, then move both dates.
 */

export const RULES_AS_OF = "2026-11-19";
/** From this day a test fails: the communities' budget and fiscal-measures laws usually change this tax from 1 January. */
export const RULES_UNTIL = "2027-01-01";

export interface GiftSource {
  name: string;
  publisher: string;
  ref: string;
  url: string;
  /** A Catalan- or Valencian-language edition, for the ca page, when the publisher has one. */
  urlCa?: string;
  /** A Spanish-language edition, for the es and en pages (the Catalan agency's pages). */
  urlEs?: string;
  read: string;
}

export const GIFT_STATE_SOURCES = {
  lisd: {
    name: "Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones",
    publisher: "BOE",
    ref: "BOE-A-1987-28141, arts. 5, 9, 20.5, 22.2, 24.2 y 30 (texto consolidado, última actualización 28/12/2022)",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-1987-28141",
    read: RULES_AS_OF,
  },
  risd: {
    name: "Real Decreto 1629/1991, de 8 de noviembre, Reglamento del Impuesto sobre Sucesiones y Donaciones",
    publisher: "BOE",
    ref: "BOE-A-1991-27678, arts. 46 y 67.1.b",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-1991-27678",
    read: RULES_AS_OF,
  },
  lofca: {
    name: "Ley 22/2009, de 18 de diciembre, del sistema de financiación de las Comunidades Autónomas de régimen común",
    publisher: "BOE",
    ref: "BOE-A-2009-20375, arts. 28 y 32",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2009-20375",
    read: RULES_AS_OF,
  },
} as const satisfies Record<string, GiftSource>;

/** Ley 29/1987 art. 30.1: gifts from the same donor to the same donee within this many years count as one. */
export const ACCUMULATION_YEARS = 3;
/** RD 1629/1991 art. 67.1.b: the state deadline for gifts. */
export const STATE_DEADLINE_WORKING_DAYS = 30;
/** Ley 29/1987 art. 22.2: the first prior-wealth bracket (Andalucía's art. 32 and 33 refer to it). */
export const STATE_FIRST_BRACKET = 402_678.11;

/** The BOE's words. Tests check every figure the calculators use appears in its quote. */
export const GIFT_STATE_QUOTE = {
  taxpayer: "b) En las donaciones y demás transmisiones lucrativas «inter vivos» equiparables, el donatario o el favorecido por ellas.",
  base: "b) En las donaciones y demás transmisiones lucrativas ''inter vivos'' equiparables, el valor neto de los bienes y derechos adquiridos, entendiéndose como tal el valor de los bienes y derechos minorado por las cargas y deudas que fueren deducibles.",
  noReductions:
    "5. En las adquisiciones por título de donación o equiparable, si la Comunidad Autónoma no hubiese regulado las reducciones a que se refiere el apartado 1 o no resultase aplicable a los sujetos pasivos la normativa propia de la Comunidad, la base liquidable coincidirá, en todo caso, con la imponible, salvo lo dispuesto en los siguientes apartados y en la disposición final primera.",
  accrual: "2. En las transmisiones lucrativas «inter vivos» el impuesto se devengará el día en que se cause o celebre el acto o contrato.",
  accumulation:
    "1. Las donaciones y demás transmisiones ''inter vivos'' equiparables que se otorguen por un mismo donante a un mismo donatario, así como las adquisiciones producidas en vida del causante como consecuencia de contratos y pactos sucesorios formalizados entre las mismas personas, todas ellas dentro del plazo de tres años, a contar desde la fecha de cada una, se considerarán como una sola transmisión a los efectos de la liquidación del impuesto. Para determinar la cuota tributaria se aplicará, a la base liquidable de la actual adquisición, el tipo medio correspondiente a la base liquidable teórica del total de las adquisiciones acumuladas.",
  theoreticalBase:
    "3. A estos efectos se entenderá por base liquidable teórica del total de las adquisiciones acumuladas la suma de las bases liquidables de las donaciones y demás transmisiones ''inter vivos'' equiparables anteriores, de las herencias, legados o cualesquier otros títulos sucesorios y la de la adquisición actual.",
  averageRate: "El tipo medio efectivo será el que resulte de dividir la cuota tributaria por la base liquidable, multiplicando el resultado por 100. El tipo medio se expresará incluyendo hasta dos decimales.",
  deadline: "b) En los demás supuestos, en el de treinta días hábiles, a contar desde el siguiente a aquel en que se cause el acto o contrato.",
  realEstate: "b) En el caso del impuesto que grava las donaciones de bienes inmuebles, cuando éstos radiquen en el territorio de esa Comunidad Autónoma.",
  otherAssets: "c) En el caso del impuesto que grava las donaciones de los demás bienes y derechos, en el territorio donde el donatario tenga su residencia habitual a la fecha del devengo.",
  residence: STATE_QUOTE.residence,
  excess: STATE_QUOTE.excess,
} as const;
