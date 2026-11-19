import type { Locale } from "@/lib/i18n/config";

import type { NinoCategory, TopKey } from "./programme";

/**
 * The El Niño checker's words, small enough for the browser. Category labels
 * are built from the programme's kinds (the 2027 programme is data), never
 * typed per category.
 */

const TOP: Record<TopKey, Record<Locale, string>> = {
  first: { es: "Primer premio", ca: "Primer premi", en: "First prize" },
  second: { es: "Segundo premio", ca: "Segon premi", en: "Second prize" },
  third: { es: "Tercer premio", ca: "Tercer premi", en: "Third prize" },
};

const OF: Record<TopKey, Record<Locale, string>> = {
  first: { es: "del primer premio", ca: "del primer premi", en: "of the first prize" },
  second: { es: "del segundo premio", ca: "del segon premi", en: "of the second prize" },
  third: { es: "del tercer premio", ca: "del tercer premi", en: "of the third prize" },
};

const DIGITS: Record<number, Record<Locale, string>> = {
  1: { es: "una cifra", ca: "una xifra", en: "one digit" },
  2: { es: "dos cifras", ca: "dues xifres", en: "two digits" },
  3: { es: "tres cifras", ca: "tres xifres", en: "three digits" },
  4: { es: "cuatro cifras", ca: "quatre xifres", en: "four digits" },
  5: { es: "cinco cifras", ca: "cinc xifres", en: "five digits" },
};

const LAST: Record<number, Record<Locale, string>> = {
  1: { es: "Última cifra", ca: "Última xifra", en: "Last digit" },
  2: { es: "Dos últimas cifras", ca: "Dues últimes xifres", en: "Last two digits" },
  3: { es: "Tres últimas cifras", ca: "Tres últimes xifres", en: "Last three digits" },
  4: { es: "Cuatro últimas cifras", ca: "Quatre últimes xifres", en: "Last four digits" },
};

export function categoryLabel(c: NinoCategory, locale: Locale): string {
  switch (c.kind) {
    case "top":
      return TOP[c.id][locale];
    case "extraction":
      if (c.digits === 1) return { es: "Reintegro (extracciones especiales de una cifra)", ca: "Reintegrament (extraccions especials d'una xifra)", en: "Reintegro, money back (special one-digit extractions)" }[locale];
      if (c.digits === 5) return { es: "Otras extracciones de cinco cifras", ca: "Altres extraccions de cinc xifres", en: "Other five-digit extractions" }[locale];
      return { es: `Extracciones de ${DIGITS[c.digits]!.es}`, ca: `Extraccions de ${DIGITS[c.digits]!.ca}`, en: `${DIGITS[c.digits]!.en[0]!.toUpperCase()}${DIGITS[c.digits]!.en.slice(1)} extractions` }[locale];
    case "approx":
      return { es: `Aproximación ${OF[c.from].es}`, ca: `Aproximació ${OF[c.from].ca}`, en: `Next to the ${TOP[c.from].en.toLowerCase()} (aproximación)` }[locale];
    case "hundred":
      return { es: `Centena ${OF[c.from].es}`, ca: `Centena ${OF[c.from].ca}`, en: `Same hundred as the ${TOP[c.from].en.toLowerCase()} (centena)` }[locale];
    case "ending":
      if (c.digits === 1) return { es: `Reintegro (última cifra ${OF[c.from].es})`, ca: `Reintegrament (última xifra ${OF[c.from].ca})`, en: `Reintegro, money back (last digit ${OF[c.from].en})` }[locale];
      return `${LAST[c.digits]![locale]} ${OF[c.from][locale]}`;
  }
}

export function madridTime(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", { timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
}

export interface NinoCheckerCopy {
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
  colDecimo: string;
  colEuro: string;
  from: (n: string) => string;
  total: string;
  gross: (played: string) => string;
  exempt: string;
  withholding: string;
  net: string;
  noTax: string;
  readAt: (time: string, complete: boolean) => string;
  official: string;
}

export const NINO_CHECKER_COPY: Record<Locale, NinoCheckerCopy> = {
  es: {
    title: "Comprueba tu décimo del Niño",
    intro: "Escribe el número de cinco cifras y lo que juegas en él (20 € es un décimo entero; 5 €, una participación de un cuarto).",
    number: "Número",
    numberHint: "Las cinco cifras, con los ceros de delante: 01234.",
    played: "Lo que juegas",
    playedHint: "En euros. Un décimo cuesta 20 €; 40 € son dos décimos.",
    submit: "Comprobar",
    loading: "Cargando los números de SELAE…",
    loadError: "No se han podido cargar los números. Vuelve a intentarlo o búscalo en la lista de más abajo.",
    badNumber: "Escribe un número de cinco cifras (de 00000 a 99999).",
    badPlayed: "Escribe lo que juegas en euros, más de 0 y hasta 20.000 €.",
    noscript: "Sin JavaScript, busca tu número en la lista de números premiados de más abajo.",
    prizeFor: (n) => `El ${n} tiene premio`,
    none: (n) => `El ${n} no tiene premio con ninguna de las extracciones del sorteo ni con los premios que se deducen de ellas.`,
    noneYet: (n, read) => `El ${n} no tiene premio con los números publicados hasta ahora (${read}). Aún faltan extracciones: vuelve a comprobarlo más tarde.`,
    colPrize: "Premio",
    colDecimo: "Por décimo (20 €)",
    colEuro: "Por euro",
    from: (n) => `del ${n}`,
    total: "Total",
    gross: (played) => `Premio de lo que juegas (${played})`,
    exempt: "Exento (40.000 € por décimo)",
    withholding: "Hacienda (20 %)",
    net: "Cobras",
    noTax: "Hasta 40.000 € por décimo no paga nada a Hacienda.",
    readAt: (time, complete) => (complete ? `Todas las extracciones, leídas en SELAE a las ${time}.` : `Números leídos en SELAE a las ${time}; aún faltan extracciones.`),
    official: "Para cobrar solo vale la lista oficial de premios de SELAE.",
  },
  ca: {
    title: "Comprova el teu dècim del Nen",
    intro: "Escriu el número de cinc xifres i el que hi jugues (20 € és un dècim sencer; 5 €, una participació d'un quart).",
    number: "Número",
    numberHint: "Les cinc xifres, amb els zeros del davant: 01234.",
    played: "El que hi jugues",
    playedHint: "En euros. Un dècim costa 20 €; 40 € són dos dècims.",
    submit: "Comprovar",
    loading: "Carregant els números de SELAE…",
    loadError: "No s'han pogut carregar els números. Torna-ho a provar o busca'l a la llista de més avall.",
    badNumber: "Escriu un número de cinc xifres (del 00000 al 99999).",
    badPlayed: "Escriu el que hi jugues en euros, més de 0 i fins a 20.000 €.",
    noscript: "Sense JavaScript, busca el teu número a la llista de números premiats de més avall.",
    prizeFor: (n) => `El ${n} té premi`,
    none: (n) => `El ${n} no té premi amb cap de les extraccions del sorteig ni amb els premis que se'n dedueixen.`,
    noneYet: (n, read) => `El ${n} no té premi amb els números publicats fins ara (${read}). Encara falten extraccions: torna-ho a comprovar més tard.`,
    colPrize: "Premi",
    colDecimo: "Per dècim (20 €)",
    colEuro: "Per euro",
    from: (n) => `del ${n}`,
    total: "Total",
    gross: (played) => `Premi del que hi jugues (${played})`,
    exempt: "Exempt (40.000 € per dècim)",
    withholding: "Hisenda (20 %)",
    net: "Cobres",
    noTax: "Fins a 40.000 € per dècim no paga res a Hisenda.",
    readAt: (time, complete) => (complete ? `Totes les extraccions, llegides a SELAE a les ${time}.` : `Números llegits a SELAE a les ${time}; encara falten extraccions.`),
    official: "Per cobrar només val la llista oficial de premis de SELAE.",
  },
  en: {
    title: "Check your El Niño décimo",
    intro: "Type the five-digit number and how much you play on it (€20 is a whole décimo; €5, a quarter share).",
    number: "Number",
    numberHint: "All five digits, leading zeros included: 01234.",
    played: "Amount you play",
    playedHint: "In euros. A décimo costs €20; €40 is two décimos.",
    submit: "Check",
    loading: "Loading SELAE's numbers…",
    loadError: "The numbers could not be loaded. Try again, or look it up in the list further down.",
    badNumber: "Type a five-digit number (00000 to 99999).",
    badPlayed: "Type the amount you play in euros, above 0 and up to €20,000.",
    noscript: "Without JavaScript, look your number up in the winning numbers further down.",
    prizeFor: (n) => `${n} wins`,
    none: (n) => `${n} wins nothing: it matches none of the draw's extractions or the prizes that follow from them.`,
    noneYet: (n, read) => `${n} wins nothing on the numbers published so far (${read}). Some extractions are still missing: check again later.`,
    colPrize: "Prize",
    colDecimo: "Per €20 décimo",
    colEuro: "Per euro",
    from: (n) => `from ${n}`,
    total: "Total",
    gross: (played) => `Prize on what you play (${played})`,
    exempt: "Tax-free (€40,000 per décimo)",
    withholding: "Tax withheld (20%)",
    net: "You get",
    noTax: "Up to €40,000 per décimo pays no tax.",
    readAt: (time, complete) => (complete ? `All extractions, read from SELAE at ${time} (Madrid).` : `Numbers read from SELAE at ${time} (Madrid); some extractions are still missing.`),
    official: "Only SELAE's official prize list is valid for payment.",
  },
};
