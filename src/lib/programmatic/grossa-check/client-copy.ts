import type { Locale } from "@/lib/i18n/config";

import type { PrizeKey, Tier } from "./programme";

/**
 * The Grossa checker's words, small enough for the browser (the client
 * component imports this, the programme and the engine; nothing that reads
 * data).
 */

export const PRIZE_LABEL: Record<PrizeKey, Record<Locale, string>> = {
  first: { ca: "Primer premi (La Grossa)", es: "Primer premio (La Grossa)", en: "First prize (La Grossa)" },
  second: { ca: "Segon premi", es: "Segundo premio", en: "Second prize" },
  third: { ca: "Tercer premi", es: "Tercer premio", en: "Third prize" },
  fourth: { ca: "Quart premi", es: "Cuarto premio", en: "Fourth prize" },
  fifth: { ca: "Cinquè premi", es: "Quinto premio", en: "Fifth prize" },
};

export const TIER_LABEL: Record<Tier, Record<Locale, string>> = {
  five: { ca: "les cinc xifres", es: "las cinco cifras", en: "all five digits" },
  neighbour: { ca: "número anterior o posterior", es: "número anterior o posterior", en: "number just before or after" },
  last4: { ca: "les quatre últimes xifres", es: "las cuatro últimas cifras", en: "the last four digits" },
  last3: { ca: "les tres últimes xifres", es: "las tres últimas cifras", en: "the last three digits" },
  last2: { ca: "les dues últimes xifres", es: "las dos últimas cifras", en: "the last two digits" },
  last1: { ca: "l'última xifra (reintegrament)", es: "la última cifra (reintegro)", en: "the last digit (money back)" },
};

/** "13:05" in Barcelona. */
export function barcelonaTime(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", { timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
}

export interface GrossaCheckerCopy {
  title: string;
  intro: string;
  number: string;
  numberHint: string;
  played: string;
  playedHint: string;
  submit: string;
  loading: string;
  loadError: string;
  badNumber: string;
  badPlayed: string;
  noscript: string;
  prizeFor: (n: string) => string;
  none: (n: string) => string;
  noneYet: (n: string, read: string) => string;
  colPrize: string;
  colTicket: string;
  colEuro: string;
  hitLabel: (prize: string, tier: string, from: string, own: boolean) => string;
  total: string;
  gross: (played: string) => string;
  exempt: string;
  withholding: string;
  net: string;
  noTax: string;
  readAt: (time: string, complete: boolean) => string;
  official: string;
}

export const GROSSA_CHECKER_COPY: Record<Locale, GrossaCheckerCopy> = {
  ca: {
    title: "Comprova el teu bitllet",
    intro: "Escriu el número de cinc xifres i el que hi jugues (10 € és un bitllet sencer; si tens dos bitllets del mateix número, 20 €).",
    number: "Número",
    numberHint: "Les cinc xifres, amb els zeros del davant: 01234.",
    played: "El que hi jugues",
    playedHint: "En euros. Un bitllet costa 10 €.",
    submit: "Comprovar",
    loading: "Carregant els números de Loteries de Catalunya…",
    loadError: "No s'han pogut carregar els números. Torna-ho a provar o busca'l a la taula de més avall.",
    badNumber: "Escriu un número de cinc xifres (del 00000 al 99999).",
    badPlayed: "Escriu el que hi jugues en euros, més de 0 i fins a 20.000 €.",
    noscript: "Sense JavaScript, compara el teu número amb la taula de números premiats de més avall.",
    prizeFor: (n) => `El ${n} té premi`,
    none: (n) => `El ${n} no té premi: no és cap dels vuit números premiats, ni l'anterior o el posterior de cap, ni n'acaba en les mateixes xifres.`,
    noneYet: (n, read) => `El ${n} no té premi amb els números publicats fins ara (${read}). Encara no hi són tots: torna-ho a comprovar més tard.`,
    colPrize: "Premi",
    colTicket: "Per bitllet (10 €)",
    colEuro: "Per euro",
    hitLabel: (prize, tier, from, own) => (own ? prize : `${prize}: ${tier} del ${from}`),
    total: "Total",
    gross: (played) => `Premi del que hi jugues (${played})`,
    exempt: "Exempt (40.000 € per bitllet)",
    withholding: "Hisenda (20 %)",
    net: "Cobres",
    noTax: "Fins a 40.000 € per bitllet no paga res a Hisenda.",
    readAt: (time, complete) => (complete ? `Els vuit números, llegits a Loteries de Catalunya a les ${time}.` : `Números llegits a Loteries de Catalunya a les ${time}; encara no hi són tots.`),
    official: "Val el resultat oficial de Loteries de Catalunya, que també comprova qualsevol punt de venda amb terminal.",
  },
  es: {
    title: "Comprueba tu billete",
    intro: "Escribe el número de cinco cifras y lo que juegas en él (10 € es un billete entero; si tienes dos billetes del mismo número, 20 €).",
    number: "Número",
    numberHint: "Las cinco cifras, con los ceros de delante: 01234.",
    played: "Lo que juegas",
    playedHint: "En euros. Un billete cuesta 10 €.",
    submit: "Comprobar",
    loading: "Cargando los números de Loteries de Catalunya…",
    loadError: "No se han podido cargar los números. Vuelve a intentarlo o búscalo en la tabla de más abajo.",
    badNumber: "Escribe un número de cinco cifras (de 00000 a 99999).",
    badPlayed: "Escribe lo que juegas en euros, más de 0 y hasta 20.000 €.",
    noscript: "Sin JavaScript, compara tu número con la tabla de números premiados de más abajo.",
    prizeFor: (n) => `El ${n} tiene premio`,
    none: (n) => `El ${n} no tiene premio: no es ninguno de los ocho números premiados, ni el anterior o el posterior de ninguno, ni acaba en sus mismas cifras.`,
    noneYet: (n, read) => `El ${n} no tiene premio con los números publicados hasta ahora (${read}). Aún no están todos: vuelve a comprobarlo más tarde.`,
    colPrize: "Premio",
    colTicket: "Por billete (10 €)",
    colEuro: "Por euro",
    hitLabel: (prize, tier, from, own) => (own ? prize : `${prize}: ${tier} del ${from}`),
    total: "Total",
    gross: (played) => `Premio de lo que juegas (${played})`,
    exempt: "Exento (40.000 € por billete)",
    withholding: "Hacienda (20 %)",
    net: "Cobras",
    noTax: "Hasta 40.000 € por billete no paga nada a Hacienda.",
    readAt: (time, complete) => (complete ? `Los ocho números, leídos en Loteries de Catalunya a las ${time}.` : `Números leídos en Loteries de Catalunya a las ${time}; aún no están todos.`),
    official: "Vale el resultado oficial de Loteries de Catalunya, que también comprueba cualquier punto de venta con terminal.",
  },
  en: {
    title: "Check your ticket",
    intro: "Type the five-digit number and how much you play on it (€10 is one whole ticket; two tickets of the same number, €20).",
    number: "Number",
    numberHint: "All five digits, leading zeros included: 01234.",
    played: "Amount you play",
    playedHint: "In euros. A ticket costs €10.",
    submit: "Check",
    loading: "Loading Loteries de Catalunya's numbers…",
    loadError: "The numbers could not be loaded. Try again, or compare it with the table further down.",
    badNumber: "Type a five-digit number (00000 to 99999).",
    badPlayed: "Type the amount you play in euros, above 0 and up to €20,000.",
    noscript: "Without JavaScript, compare your number with the winning numbers table further down.",
    prizeFor: (n) => `${n} wins`,
    none: (n) => `${n} wins nothing: it is none of the eight winning numbers, not next to any of them, and does not end in their digits.`,
    noneYet: (n, read) => `${n} wins nothing on the numbers published so far (${read}). Not all of them are out yet: check again later.`,
    colPrize: "Prize",
    colTicket: "Per €10 ticket",
    colEuro: "Per euro",
    hitLabel: (prize, tier, from, own) => (own ? prize : `${prize}: ${tier} of ${from}`),
    total: "Total",
    gross: (played) => `Prize on what you play (${played})`,
    exempt: "Tax-free (€40,000 per ticket)",
    withholding: "Tax withheld (20%)",
    net: "You get",
    noTax: "Up to €40,000 per ticket pays no tax.",
    readAt: (time, complete) => (complete ? `All eight numbers, read from Loteries de Catalunya at ${time}.` : `Numbers read from Loteries de Catalunya at ${time}; not all of them are out yet.`),
    official: "Loteries de Catalunya's official result is what counts; any outlet with a terminal can also check your ticket.",
  },
};
