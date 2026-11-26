import { euros, type ItvLocale } from "./copy";
import { PRICES_AS_OF, REGIONS } from "./prices";
import { EARLY_DAYS, FINE } from "./rules";

/**
 * "¿Cuánto cuesta la ITV en Cataluña?" (26 Nov 2026): the first-screen price
 * answer and the questions in the searchers' words, for the ITV page. Queries
 * (GSC, 28 days to 25 Nov, es): "cuanto vale la itv" 3 at 44, "precio itv
 * barcelona" 3 at 61.7, "itv furgonetas precio" 3 at 70.3, "precio itv coche"
 * 2 at 41, "precio itv furgoneta" 2 at 49, "cuanto cuesta pasar la itv" 2 at
 * 84, "itv moto precio" 1 at 70. Every amount is the Catalonia row of
 * prices.ts (Ordre IUE/361/2010 maximums, read 13 Nov 2026).
 *
 * The Generalitat's ITV page ("Inspecció tècnica de vehicles", empresa.gencat.cat,
 * the second source of the Catalonia row), curled and grepped on 26 Nov 2026:
 *  - the operators, «Operadors del servei d'ITV de Catalunya»: «APPLUS ITEUVE
 *    TECHNOLOGY, S.L.», «TÜV RHEINLAND CERTIO, S.L», «CONTROLAUTO ITV (R.V.S.A.)»,
 *    «TÜV SÜD ATISAE, S.A. GRUPO-ITEVELESA-S.L.»;
 *  - «tenen establertes uns valors màxims que no es poden superar»;
 *  - re-inspection within two months «la tarifa serà del 60% del seu valor
 *    inicial»; «La inspecció és gratuïta si es fa durant els primers 15 dies
 *    naturals i a la mateixa estació en què es va fer la primera»;
 *  - «Les tarifes que ofereixen els operadors de la inspecció d'ITV, es poden
 *    consultar al destacat d'Operadors del servei d'ITV de Catalunya».
 * Pure; client-safe.
 */

export const GENCAT_ITV_READ = "2026-11-26";

/** The four operators the Generalitat lists, as it writes them. */
export const CATALONIA_OPERATORS = ["APPLUS ITEUVE TECHNOLOGY, S.L.", "TÜV RHEINLAND CERTIO, S.L", "CONTROLAUTO ITV (R.V.S.A.)", "TÜV SÜD ATISAE, S.A. GRUPO-ITEVELESA-S.L."] as const;

export const GENCAT_QUOTE = {
  max: "tenen establertes uns valors màxims que no es poden superar",
  retest: "la tarifa serà del 60% del seu valor inicial",
  free: "La inspecció és gratuïta si es fa durant els primers 15 dies naturals i a la mateixa estació en què es va fer la primera",
} as const;

/** The re-inspection share and the free window the Generalitat states. */
export const RETEST = { pct: 60, months: 2, freeDays: 15 } as const;

const cat = REGIONS.find((r) => r.id === "cataluna")!;
const price = (es: string) => cat.prices!.find((p) => p.label.es === es)!.amount;

/** The Catalonia maximums the answers quote (pre-tax). */
export function cataloniaPrices() {
  return {
    petrolCar: price("Turismo de gasolina (motor catalizado)"),
    dieselCar: price("Turismo diésel"),
    petrolVan: price("Furgoneta hasta 3.500 kg, gasolina"),
    dieselVan: price("Furgoneta hasta 3.500 kg, diésel"),
    moto: price("Moto o ciclomotor (hasta tres ruedas)"),
    url: cat.sources[1]!.url,
    stationsUrl: cat.stations[0]!.url,
  };
}

export interface ItvCatCopy {
  title: string;
  answer: string;
  operators: string;
  faqTitle: string;
  faq: { q: string; a: string }[];
}

export function itvCataloniaCopy(locale: ItvLocale): ItvCatCopy {
  const p = cataloniaPrices();
  const e = (x: number) => euros(x, locale);
  const ops = CATALONIA_OPERATORS.join(", ");
  if (locale === "es") {
    return {
      title: "¿Cuánto cuesta la ITV en Cataluña?",
      answer: `En Cataluña la Generalitat fija precios máximos: un turismo de gasolina paga como mucho ${e(p.petrolCar)} y uno diésel ${e(p.dieselCar)}; una furgoneta de hasta 3.500 kg, ${e(p.petrolVan)} (gasolina) o ${e(p.dieselVan)} (diésel), y una moto o un ciclomotor, ${e(p.moto)}. Son importes sin IVA ni tasas, que la orden no incluye. Si no la pasas, volver en ${RETEST.freeDays} días naturales a la misma estación es gratis; en ${RETEST.months} meses, el ${RETEST.pct} % de la tarifa. Es igual en Barcelona, Girona, Lleida y Tarragona.`,
      operators: `Las estaciones son de cuatro operadores autorizados por la Generalitat, cada uno con su cita y su precio (nunca por encima del máximo): ${ops}.`,
      faqTitle: "Preguntas frecuentes sobre la ITV",
      faq: [
        { q: "¿Cuánto cuesta la ITV de un coche en Barcelona?", a: `Como máximo ${e(p.petrolCar)} un turismo de gasolina y ${e(p.dieselCar)} uno diésel, sin IVA ni tasas: son los máximos de la Generalitat (Ordre IUE/361/2010) para toda Cataluña. Cada operador puede cobrar menos.` },
        { q: "¿Cuánto cuesta la ITV de una furgoneta?", a: `En Cataluña, una furgoneta de hasta 3.500 kg paga como máximo ${e(p.petrolVan)} si es de gasolina y ${e(p.dieselVan)} si es diésel, sin IVA ni tasas. En otras comunidades, mira la tabla de precios de esta página.` },
        { q: "¿Cuánto cuesta la ITV de una moto?", a: `En Cataluña, como máximo ${e(p.moto)} una moto o un ciclomotor (hasta tres ruedas), sin IVA ni tasas.` },
        { q: "¿Cuánto cuesta volver a pasar la ITV si no la paso?", a: `En Cataluña es gratis si vuelves en los primeros ${RETEST.freeDays} días naturales a la misma estación (una sola vez); dentro de los ${RETEST.months} meses, pagas el ${RETEST.pct} % de la tarifa. Pasados los ${RETEST.months} meses hay que hacer una inspección nueva.` },
        { q: "¿Qué empresas pasan la ITV en Cataluña?", a: `Cuatro operadores autorizados por la Generalitat: ${ops}. La cita se pide a cada uno.` },
        { q: "¿Cada cuánto se pasa la ITV de un coche?", a: `Un turismo particular, a los 4 años de la primera matriculación, después cada 2 años y, desde los 10 años, cada año (Real Decreto 920/2017, art. 6). Puedes adelantarla hasta ${EARLY_DAYS} días sin perder la fecha. Circular con ella caducada cuesta ${FINE.serious} euros (${FINE.paidEarly} con pronto pago).` },
      ],
    };
  }
  if (locale === "ca") {
    return {
      title: "Quant costa l'ITV a Catalunya?",
      answer: `A Catalunya la Generalitat fixa preus màxims: un turisme de benzina paga com a màxim ${e(p.petrolCar)} i un de dièsel ${e(p.dieselCar)}; una furgoneta de fins a 3.500 kg, ${e(p.petrolVan)} (benzina) o ${e(p.dieselVan)} (dièsel), i una moto o un ciclomotor, ${e(p.moto)}. Són imports sense IVA ni taxes, que l'ordre no inclou. Si no la passes, tornar en ${RETEST.freeDays} dies naturals a la mateixa estació és gratuït; en ${RETEST.months} mesos, el ${RETEST.pct} % de la tarifa. És igual a Barcelona, Girona, Lleida i Tarragona.`,
      operators: `Les estacions són de quatre operadors autoritzats per la Generalitat, cadascun amb la seva cita i el seu preu (mai per sobre del màxim): ${ops}.`,
      faqTitle: "Preguntes freqüents sobre l'ITV",
      faq: [
        { q: "Quant costa l'ITV d'un cotxe a Barcelona?", a: `Com a màxim ${e(p.petrolCar)} un turisme de benzina i ${e(p.dieselCar)} un de dièsel, sense IVA ni taxes: són els màxims de la Generalitat (Ordre IUE/361/2010) per a tot Catalunya. Cada operador pot cobrar menys.` },
        { q: "Quant costa l'ITV d'una furgoneta?", a: `A Catalunya, una furgoneta de fins a 3.500 kg paga com a màxim ${e(p.petrolVan)} si és de benzina i ${e(p.dieselVan)} si és dièsel, sense IVA ni taxes. En altres comunitats, mira la taula de preus d'aquesta pàgina.` },
        { q: "Quant costa l'ITV d'una moto?", a: `A Catalunya, com a màxim ${e(p.moto)} una moto o un ciclomotor (fins a tres rodes), sense IVA ni taxes.` },
        { q: "Quant costa tornar a passar l'ITV si no la passo?", a: `A Catalunya és gratuït si tornes en els primers ${RETEST.freeDays} dies naturals a la mateixa estació (un sol cop); dins dels ${RETEST.months} mesos, pagues el ${RETEST.pct} % de la tarifa. Passats els ${RETEST.months} mesos cal fer una inspecció nova.` },
        { q: "Quines empreses passen l'ITV a Catalunya?", a: `Quatre operadors autoritzats per la Generalitat: ${ops}. La cita es demana a cadascun.` },
        { q: "Cada quant es passa l'ITV d'un cotxe?", a: `Un turisme particular, als 4 anys de la primera matriculació, després cada 2 anys i, a partir dels 10 anys, cada any (Reial decret 920/2017, art. 6). La pots avançar fins a ${EARLY_DAYS} dies sense perdre la data. Circular amb l'ITV caducada costa ${FINE.serious} euros (${FINE.paidEarly} amb pagament avançat).` },
      ],
    };
  }
  return {
    title: "How much does the ITV cost in Catalonia?",
    answer: `In Catalonia the Generalitat sets maximum prices: a petrol car pays at most ${e(p.petrolCar)} and a diesel car ${e(p.dieselCar)}; a van up to 3,500 kg, ${e(p.petrolVan)} (petrol) or ${e(p.dieselVan)} (diesel); and a motorcycle or moped, ${e(p.moto)}. These are before VAT and fees, which the order leaves out. If you fail, going back to the same station within ${RETEST.freeDays} calendar days is free; within ${RETEST.months} months, ${RETEST.pct}% of the fee. It is the same in Barcelona, Girona, Lleida and Tarragona.`,
    operators: `The stations belong to four operators authorised by the Generalitat, each with its own booking and price (never above the maximum): ${ops}.`,
    faqTitle: "ITV questions",
    faq: [
      { q: "How much is the ITV for a car in Barcelona?", a: `At most ${e(p.petrolCar)} for a petrol car and ${e(p.dieselCar)} for a diesel car, before VAT and fees: the Generalitat's maximums (Ordre IUE/361/2010) for all of Catalonia. Each operator may charge less.` },
      { q: "How much is the ITV for a van?", a: `In Catalonia, a van up to 3,500 kg pays at most ${e(p.petrolVan)} (petrol) or ${e(p.dieselVan)} (diesel), before VAT and fees. For other regions, see the fee table on this page.` },
      { q: "How much is the ITV for a motorbike?", a: `In Catalonia, at most ${e(p.moto)} for a motorcycle or moped (up to three wheels), before VAT and fees.` },
      { q: "How much is an ITV re-test after a fail?", a: `In Catalonia it is free if you go back to the same station within the first ${RETEST.freeDays} calendar days (once only); within ${RETEST.months} months you pay ${RETEST.pct}% of the fee. After ${RETEST.months} months a new inspection is needed.` },
      { q: "Which companies run the ITV in Catalonia?", a: `Four operators authorised by the Generalitat: ${ops}. You book with each one.` },
      { q: "How often does a car need the ITV in Spain?", a: `A private car at 4 years from first registration, then every 2 years and, from 10 years old, every year (Royal Decree 920/2017, art. 6). You can take it up to ${EARLY_DAYS} days early without losing the date. Driving with an expired ITV costs €${FINE.serious} (€${FINE.paidEarly} if paid early).` },
    ],
  };
}

/** For the date guard: the Catalonia answer follows the prices' read date. */
export const CATALONIA_PRICES_AS_OF = PRICES_AS_OF;
