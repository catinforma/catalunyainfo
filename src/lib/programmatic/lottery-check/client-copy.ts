import type { Locale } from "@/lib/i18n/config";

import type { CategoryId } from "./programme";

/**
 * The checker's words, small enough for the browser (the client component
 * imports this, the programme and the engine; nothing that reads data).
 */

export const CATEGORY_LABEL: Record<CategoryId, Record<Locale, string>> = {
  first: { es: "El Gordo (primer premio)", ca: "El Gordo (primer premi)", en: "El Gordo (first prize)" },
  second: { es: "Segundo premio", ca: "Segon premi", en: "Second prize" },
  third: { es: "Tercer premio", ca: "Tercer premi", en: "Third prize" },
  fourth: { es: "Cuarto premio", ca: "Quart premi", en: "Fourth prize" },
  fifth: { es: "Quinto premio", ca: "Cinquè premi", en: "Fifth prize" },
  pedrea: { es: "Pedrea", ca: "Pedrea", en: "Pedrea (smaller prizes)" },
  approxFirst: { es: "Aproximación al Gordo", ca: "Aproximació al Gordo", en: "Next to El Gordo (aproximación)" },
  approxSecond: { es: "Aproximación al segundo premio", ca: "Aproximació al segon premi", en: "Next to the second prize (aproximación)" },
  approxThird: { es: "Aproximación al tercer premio", ca: "Aproximació al tercer premi", en: "Next to the third prize (aproximación)" },
  hundredFirst: { es: "Centena del Gordo", ca: "Centena del Gordo", en: "Same hundred as El Gordo (centena)" },
  hundredSecond: { es: "Centena del segundo premio", ca: "Centena del segon premi", en: "Same hundred as the second prize" },
  hundredThird: { es: "Centena del tercer premio", ca: "Centena del tercer premi", en: "Same hundred as the third prize" },
  hundredFourth: { es: "Centena de un cuarto premio", ca: "Centena d'un quart premi", en: "Same hundred as a fourth prize" },
  lastTwoFirst: { es: "Dos últimas cifras del Gordo", ca: "Dues últimes xifres del Gordo", en: "Last two digits of El Gordo" },
  lastTwoSecond: { es: "Dos últimas cifras del segundo premio", ca: "Dues últimes xifres del segon premi", en: "Last two digits of the second prize" },
  lastTwoThird: { es: "Dos últimas cifras del tercer premio", ca: "Dues últimes xifres del tercer premi", en: "Last two digits of the third prize" },
  reintegro: { es: "Reintegro (última cifra del Gordo)", ca: "Reintegrament (última xifra del Gordo)", en: "Reintegro, money back (last digit of El Gordo)" },
};

/** "13:05" in Madrid. */
export function madridTime(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", { timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
}

export interface CheckerCopy {
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
  pedreaMissing: string;
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
  pending: string;
  official: string;
}

export const CHECKER_COPY: Record<Locale, CheckerCopy> = {
  es: {
    title: "Comprueba tu décimo",
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
    noscript: "Sin JavaScript, busca tu número en la lista de premios de más abajo, ordenada por millares.",
    prizeFor: (n) => `El ${n} tiene premio`,
    none: (n) => `El ${n} no tiene premio: no es ninguno de los 1.807 números premiados ni cobra aproximación, centena, terminación ni reintegro.`,
    noneYet: (n, read) => `El ${n} no está entre los números publicados hasta ahora (${read}). El sorteo o la lista aún no están completos: vuelve a comprobarlo más tarde.`,
    pedreaMissing: "La lista de la pedrea aún no está completa aquí: el resultado puede cambiar.",
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
    readAt: (time, complete) => (complete ? `Los 1.807 números, leídos en SELAE a las ${time}.` : `Números leídos en SELAE a las ${time}; el sorteo o la lista aún no están completos.`),
    pending: "Aproximaciones, centenas, terminaciones y reintegro según el último programa publicado en el BOE: pendiente de confirmar con el texto de SELAE para 2026.",
    official: "Para cobrar solo vale la Lista Oficial de Premios de SELAE.",
  },
  ca: {
    title: "Comprova el teu dècim",
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
    noscript: "Sense JavaScript, busca el teu número a la llista de premis de més avall, ordenada per milers.",
    prizeFor: (n) => `El ${n} té premi`,
    none: (n) => `El ${n} no té premi: no és cap dels 1.807 números premiats ni cobra aproximació, centena, terminació ni reintegrament.`,
    noneYet: (n, read) => `El ${n} no és entre els números publicats fins ara (${read}). El sorteig o la llista encara no són complets: torna-ho a comprovar més tard.`,
    pedreaMissing: "La llista de la pedrea encara no és completa aquí: el resultat pot canviar.",
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
    readAt: (time, complete) => (complete ? `Els 1.807 números, llegits a SELAE a les ${time}.` : `Números llegits a SELAE a les ${time}; el sorteig o la llista encara no són complets.`),
    pending: "Aproximacions, centenes, terminacions i reintegrament segons l'últim programa publicat al BOE: pendent de confirmar amb el text de SELAE per al 2026.",
    official: "Per cobrar només val la Llista Oficial de Premis de SELAE.",
  },
  en: {
    title: "Check your décimo",
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
    noscript: "Without JavaScript, look your number up in the prize list further down, sorted by thousand.",
    prizeFor: (n) => `${n} wins`,
    none: (n) => `${n} wins nothing: it is none of the 1,807 numbers drawn and gets no aproximación, centena, last-digits prize or reintegro.`,
    noneYet: (n, read) => `${n} is not among the numbers published so far (${read}). The draw or the list is not complete yet: check again later.`,
    pedreaMissing: "The pedrea list is not complete here yet: the answer may change.",
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
    readAt: (time, complete) => (complete ? `All 1,807 numbers, read from SELAE at ${time} (Madrid).` : `Numbers read from SELAE at ${time} (Madrid); the draw or the list is not complete yet.`),
    pending: "Aproximaciones, centenas, last digits and reintegro as in the last programme published in the BOE: pending confirmation against SELAE's 2026 text.",
    official: "Only SELAE's Lista Oficial de Premios is valid for payment.",
  },
};
