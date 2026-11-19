import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

import { PV_LOCALES, coef, money, pvEditions, type PvLocale } from "./copy";
import { calculateOk, inputOf, type PvInput, type PvOk } from "./engine";
import { BARCELONA, DEADLINE, MAX_BONUS, MAX_RATE, RULES_AS_OF, TABLES } from "./rules";

/**
 * Pure pieces of the plusvalía page: titles, the default input, our own
 * worked cases (each checked by hand from the quoted tables in
 * tests/plusvalia.test.ts), the FAQ and the sitemap entries. Every figure
 * the page prints comes from the engine.
 */

export type ExampleId = "sale-14y-nov" | "sale-14y-dec" | "sale-3y-real" | "sale-loss" | "inheritance-home" | "months";

/** Our own cases (no official worked example exists for the state rules): inputs only, every result from the engine. */
export const EXAMPLES: readonly { id: ExampleId; input: PvInput }[] = [
  { id: "sale-14y-nov", input: inputOf({ acquired: "2012-03-10", transferred: "2026-11-19", landValue: 60_000, totalValue: 150_000, acquisitionValue: 200_000, transferValue: 320_000 }) },
  { id: "sale-14y-dec", input: inputOf({ acquired: "2012-03-10", transferred: "2026-12-15", landValue: 60_000, totalValue: 150_000, acquisitionValue: 200_000, transferValue: 320_000 }) },
  { id: "sale-3y-real", input: inputOf({ acquired: "2023-06-01", transferred: "2026-12-15", landValue: 90_000, totalValue: 180_000, acquisitionValue: 250_000, transferValue: 265_000 }) },
  { id: "sale-loss", input: inputOf({ acquired: "2007-05-01", transferred: "2026-12-15", landValue: 70_000, totalValue: 175_000, acquisitionValue: 300_000, transferValue: 260_000 }) },
  { id: "inheritance-home", input: inputOf({ kind: "inheritance", acquired: "1998-02-01", transferred: "2026-12-15", landValue: 50_000, bonusPct: BARCELONA.bonus }) },
  { id: "months", input: inputOf({ acquired: "2026-03-10", transferred: "2026-12-15", landValue: 40_000 }) },
];

/** The first render, on the server: a sale in December 2026 of a flat bought in March 2012 (example "sale-14y-dec"). */
export const DEFAULT_INPUT: PvInput = EXAMPLES.find((e) => e.id === "sale-14y-dec")!.input;

export function examples(): { id: ExampleId; input: PvInput; result: PvOk }[] {
  return EXAMPLES.map((e) => ({ id: e.id, input: e.input, result: calculateOk(e.input) }));
}

export const example = (id: ExampleId): PvOk => calculateOk(EXAMPLES.find((e) => e.id === id)!.input);

export interface PvMeta {
  title: string;
  description: string;
  h1: string;
  breadcrumb: string;
  appName: string;
}

export function pvMeta(locale: PvLocale): PvMeta {
  const dec = example("sale-14y-dec");
  const M = (n: number) => money(n, locale);
  return {
    es: {
      title: "Plusvalía municipal 2026: calculadora con los dos métodos",
      description: `Un piso con 60.000 € de suelo vendido tras 14 años paga ${M(dec.toPay)} al 30 %. Calcula tu plusvalía por el método objetivo y el real, con los coeficientes de diciembre de 2026.`,
      h1: "Plusvalía municipal: calculadora por los dos métodos",
      breadcrumb: "Plusvalía municipal",
      appName: "Calculadora de la plusvalía municipal (IIVTNU, Ley Reguladora de las Haciendas Locales, arts. 104 a 110)",
    },
    ca: {
      title: "Plusvàlua municipal 2026: calculadora amb els dos mètodes",
      description: `Un pis amb 60.000 € de sòl venut després de 14 anys paga ${M(dec.toPay)} al 30 %. Calcula la plusvàlua pel mètode objectiu i el real, amb els coeficients de desembre de 2026.`,
      h1: "Plusvàlua municipal: calculadora pels dos mètodes",
      breadcrumb: "Plusvàlua municipal",
      appName: "Calculadora de la plusvàlua municipal (IIVTNU, Llei reguladora de les hisendes locals, arts. 104 a 110)",
    },
    en: {
      title: "Spain plusvalía tax calculator 2026 (IIVTNU)",
      description: `A flat with €60,000 of land sold after 14 years pays ${M(dec.toPay)} at 30%. Work out Spain's municipal plusvalía tax by the objective and real-gain methods, with the December 2026 coefficients.`,
      h1: "Plusvalía municipal tax: calculator by both methods",
      breadcrumb: "Plusvalía tax",
      appName: "Spain plusvalía municipal tax calculator (IIVTNU, Local Finance Act arts. 104 to 110)",
    },
  }[locale];
}

/** The three editions with reciprocal hreflang; x-default English, like every page's HTML. */
export function pvSitemapEntries(lastModified: string = RULES_AS_OF): MetadataRoute.Sitemap {
  const e = pvEditions();
  const languages = { ca: absoluteUrl(e.ca), es: absoluteUrl(e.es), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
  return PV_LOCALES.map((locale) => ({
    url: absoluteUrl(e[locale]),
    lastModified: new Date(`${lastModified}T00:00:00Z`),
    changeFrequency: "monthly" as const,
    priority: locale === "en" ? 0.6 : 0.8,
    alternates: { languages },
  }));
}

/** The FAQ, every figure from the engine or rules.ts (also the FAQPage JSON-LD). */
export function pvFaq(locale: PvLocale): { q: string; a: string }[] {
  const M = (n: number) => money(n, locale);
  const C = (n: number) => coef(n, locale);
  const nov = example("sale-14y-nov");
  const dec = example("sale-14y-dec");
  const real = example("sale-3y-real");
  const inh = example("inheritance-home");
  const t24 = TABLES["rdl8-2023"].values;
  const t26 = TABLES["rdl29-2026"].values;
  const wd = DEADLINE.interVivosWorkingDays;
  const mc = DEADLINE.mortisCausaMonths;
  return {
    es: [
      { q: "¿Qué es la plusvalía municipal y quién la paga?", a: `Es el impuesto municipal sobre el incremento de valor de los terrenos urbanos (IIVTNU), que se paga al vender, heredar o donar un inmueble urbano (art. 104.1 del texto refundido de la Ley Reguladora de las Haciendas Locales). En una venta paga quien vende; en una herencia o una donación, quien recibe (art. 106). Si quien vende es una persona física no residente, paga quien compra como sustituto.` },
      { q: "¿Cómo se calcula la plusvalía municipal?", a: `Por dos métodos, y pagas el menor si lo pides. El objetivo multiplica el valor catastral del suelo por un coeficiente según los años completos que lo has tenido (art. 107.4) y aplica el tipo de tu ayuntamiento, como máximo el ${MAX_RATE} %. El real toma la diferencia entre el precio de venta y el de compra en la parte que corresponde al suelo (arts. 104.5 y 107.5). Con 60.000 € de suelo y 14 años, el método objetivo da ${M(dec.objective.base)} de base y ${M(dec.toPay)} al 30 %; el real, ${M(dec.realGain ?? 0)} de base.` },
      { q: "¿Qué coeficientes se aplican en 2026?", a: `Hasta el 30 de noviembre de 2026, los del Real Decreto-ley 8/2023 (por ejemplo, ${C(t24[14]!)} para 14 años y ${C(t24[20]!)} para 20 años o más), porque el Congreso derogó el Real Decreto-ley 16/2025, que los cambiaba desde el 1 de enero. Desde el 1 de diciembre de 2026, los del Real Decreto-ley 29/2026, convalidado el 12 de noviembre: ${C(t26[14]!)} para 14 años y ${C(t26[20]!)} para 20 años o más. Para el mismo piso, vender el 19 de noviembre sale a ${M(nov.toPay)} y el 15 de diciembre, a ${M(dec.toPay)}. Tu ayuntamiento puede tener coeficientes más bajos.` },
      { q: "¿Hay que pagar plusvalía si vendo con pérdidas?", a: "No. Si el valor de transmisión no supera el de adquisición (el mayor entre el de la escritura y el comprobado por la Administración, sin gastos ni impuestos), no hay incremento de valor y la transmisión no está sujeta (art. 104.5). Pero tienes que declararla igualmente en el ayuntamiento, con las escrituras de compra y de venta." },
      { q: "¿Cuándo conviene el método del incremento real?", a: `Cuando la ganancia real en la parte del suelo es menor que la base objetiva. Un piso comprado por 250.000 € en junio de 2023 y vendido por 265.000 € en diciembre de 2026, con el suelo a la mitad del valor catastral, tiene una base objetiva de ${M(real.objective.base)} y una real de ${M(real.realGain ?? 0)}: paga ${M(real.toPay)} en lugar de ${M(real.objective.cuotaLiquida)}.` },
      { q: "¿Qué plazo hay para pagar la plusvalía?", a: `En una venta o una donación, ${wd} días hábiles desde la fecha de la escritura; en una herencia, ${mc} meses desde el fallecimiento, prorrogables hasta un año si lo pides (art. 110.2). Si tu ayuntamiento exige autoliquidación (la ley se lo permite, art. 110.4), la calculas y la pagas en ese mismo plazo; Barcelona la exige.` },
      { q: "¿Se paga plusvalía en una herencia?", a: `Sí: paga el heredero, y la fecha que cuenta es la del fallecimiento. Los ayuntamientos pueden regular una bonificación de hasta el ${MAX_BONUS} % para descendientes, cónyuges y ascendientes (art. 108.4); Barcelona da el 95 % por la vivienda habitual de la persona fallecida si se conserva tres años. Con 50.000 € de suelo y más de 20 años, la cuota de ${M(inh.objective.cuotaIntegra)} queda en ${M(inh.toPay)} con esa bonificación.` },
      { q: "¿Dónde encuentro el valor catastral del suelo?", a: "Es el valor catastral del terreno a efectos del IBI en la fecha de la transmisión (art. 107.2.a). Consulta los datos catastrales de tu inmueble en la Sede Electrónica del Catastro (apartado Inmuebles) o pregunta en tu ayuntamiento; para el método real necesitas también el valor catastral total." },
    ],
    ca: [
      { q: "Què és la plusvàlua municipal i qui la paga?", a: `És l'impost municipal sobre l'increment de valor dels terrenys urbans (IIVTNU), que es paga en vendre, heretar o donar un immoble urbà (art. 104.1 del text refós de la Llei reguladora de les hisendes locals). En una venda paga qui ven; en una herència o una donació, qui rep (art. 106). Si qui ven és una persona física no resident, paga qui compra com a substitut.` },
      { q: "Com es calcula la plusvàlua municipal?", a: `Per dos mètodes, i pagues el més baix si ho demanes. L'objectiu multiplica el valor cadastral del sòl per un coeficient segons els anys complets que l'has tingut (art. 107.4) i hi aplica el tipus del teu ajuntament, com a màxim el ${MAX_RATE} %. El real pren la diferència entre el preu de venda i el de compra en la part que correspon al sòl (arts. 104.5 i 107.5). Amb 60.000 € de sòl i 14 anys, el mètode objectiu dona ${M(dec.objective.base)} de base i ${M(dec.toPay)} al 30 %; el real, ${M(dec.realGain ?? 0)} de base.` },
      { q: "Quins coeficients s'apliquen el 2026?", a: `Fins al 30 de novembre de 2026, els del Reial decret llei 8/2023 (per exemple, ${C(t24[14]!)} per a 14 anys i ${C(t24[20]!)} per a 20 anys o més), perquè el Congrés va derogar el Reial decret llei 16/2025, que els canviava des de l'1 de gener. Des de l'1 de desembre de 2026, els del Reial decret llei 29/2026, convalidat el 12 de novembre: ${C(t26[14]!)} per a 14 anys i ${C(t26[20]!)} per a 20 anys o més. Per al mateix pis, vendre el 19 de novembre surt a ${M(nov.toPay)} i el 15 de desembre, a ${M(dec.toPay)}. El teu ajuntament pot tenir coeficients més baixos.` },
      { q: "Cal pagar plusvàlua si venc amb pèrdues?", a: "No. Si el valor de transmissió no supera el d'adquisició (el més alt entre el de l'escriptura i el comprovat per l'Administració, sense despeses ni impostos), no hi ha increment de valor i la transmissió no està subjecta (art. 104.5). Però l'has de declarar igualment a l'ajuntament, amb les escriptures de compra i de venda." },
      { q: "Quan convé el mètode de l'increment real?", a: `Quan el guany real en la part del sòl és més baix que la base objectiva. Un pis comprat per 250.000 € el juny de 2023 i venut per 265.000 € el desembre de 2026, amb el sòl a la meitat del valor cadastral, té una base objectiva de ${M(real.objective.base)} i una de real de ${M(real.realGain ?? 0)}: paga ${M(real.toPay)} en lloc de ${M(real.objective.cuotaLiquida)}.` },
      { q: "Quin termini hi ha per pagar la plusvàlua?", a: `En una venda o una donació, ${wd} dies hàbils des de la data de l'escriptura; en una herència, ${mc} mesos des de la mort, prorrogables fins a un any si ho demanes (art. 110.2). Si el teu ajuntament exigeix autoliquidació (la llei li ho permet, art. 110.4), la calcules i la pagues en aquest mateix termini; Barcelona l'exigeix.` },
      { q: "Es paga plusvàlua en una herència?", a: `Sí: paga l'hereu, i la data que compta és la de la mort. Els ajuntaments poden regular una bonificació de fins al ${MAX_BONUS} % per a descendents, cònjuges i ascendents (art. 108.4); Barcelona dona el 95 % per l'habitatge habitual de la persona morta si es conserva tres anys. Amb 50.000 € de sòl i més de 20 anys, la quota de ${M(inh.objective.cuotaIntegra)} queda en ${M(inh.toPay)} amb aquesta bonificació.` },
      { q: "On trobo el valor cadastral del sòl?", a: "És el valor cadastral del terreny a efectes de l'IBI en la data de la transmissió (art. 107.2.a). Consulta les dades cadastrals del teu immoble a la Seu Electrònica del Cadastre (apartat Inmuebles) o pregunta al teu ajuntament; per al mètode real també necessites el valor cadastral total." },
    ],
    en: [
      { q: "What is the plusvalía municipal tax and who pays it?", a: `It is the municipal tax on the increase in value of urban land (IIVTNU), due when urban property is sold, inherited or given away (art. 104.1 of the consolidated Local Finance Act, TRLRHL). On a sale the seller pays; on an inheritance or gift, the person receiving it (art. 106). If the seller is an individual not resident in Spain, the buyer pays as a substitute.` },
      { q: "How is plusvalía worked out?", a: `By two methods, and you pay the lower one if you ask. The objective method multiplies the land's cadastral value by a coefficient for the full years you held it (art. 107.4) and applies your council's rate, at most ${MAX_RATE}%. The real-gain method takes the difference between the sale and purchase prices in the part that belongs to the land (arts. 104.5 and 107.5). With €60,000 of land and 14 years, the objective method gives a ${M(dec.objective.base)} base and ${M(dec.toPay)} at 30%; the real gain, a ${M(dec.realGain ?? 0)} base.` },
      { q: "Which coefficients apply in 2026?", a: `Until 30 November 2026, those of Royal Decree-law 8/2023 (for example ${C(t24[14]!)} for 14 years and ${C(t24[20]!)} for 20 years or more), because Congress derogated Royal Decree-law 16/2025, which changed them from 1 January. From 1 December 2026, those of Royal Decree-law 29/2026, ratified on 12 November: ${C(t26[14]!)} for 14 years and ${C(t26[20]!)} for 20 years or more. For the same flat, selling on 19 November costs ${M(nov.toPay)} and on 15 December ${M(dec.toPay)}. Your council may set lower coefficients.` },
      { q: "Do I pay plusvalía if I sell at a loss?", a: "No. If the transfer value does not exceed the acquisition value (the higher of the deed value and the one checked by the tax authority, without costs or taxes), there is no increase in value and the transfer is not subject to the tax (art. 104.5). You must still declare it to the council, with the purchase and sale deeds." },
      { q: "When is the real-gain method better?", a: `When the real gain on the land is below the objective base. A flat bought for €250,000 in June 2023 and sold for €265,000 in December 2026, with the land at half the cadastral value, has an objective base of ${M(real.objective.base)} and a real one of ${M(real.realGain ?? 0)}: it pays ${M(real.toPay)} instead of ${M(real.objective.cuotaLiquida)}.` },
      { q: "What is the deadline to pay plusvalía?", a: `On a sale or a gift, ${wd} working days from the date of the deed; on an inheritance, ${mc} months from the death, extendable to one year if you ask (art. 110.2). If your council requires self-assessment (the law allows it, art. 110.4), you work it out and pay within the same period; Barcelona requires it.` },
      { q: "Is plusvalía paid on an inheritance?", a: `Yes: the heir pays, and the date that counts is the date of death. Councils may set a rebate of up to ${MAX_BONUS}% for descendants, spouses and ascendants (art. 108.4); Barcelona gives 95% on the deceased's habitual home if it is kept for three years. With €50,000 of land and over 20 years, a ${M(inh.objective.cuotaIntegra)} tax comes down to ${M(inh.toPay)} with that rebate.` },
      { q: "Where do I find the land's cadastral value?", a: "It is the land's cadastral value for IBI (council property tax) on the transfer date (art. 107.2.a). Check your property's cadastral data on the Catastro's e-office (Inmuebles section) or ask your council; the real-gain method also needs the total cadastral value." },
    ],
  }[locale];
}
