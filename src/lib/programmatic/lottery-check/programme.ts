/**
 * The prize programme the Christmas lottery checker applies ("Comprobar
 * Lotería de Navidad"): how many prizes of each kind, what each pays, and
 * which numbers each one goes to. Client-safe and data-free: the checker in
 * the browser, the page, the build script's checks and the tests read it.
 *
 * ## Counts and amounts: SELAE's 2026 programme
 *
 * SELAE, "Programas de premios, cuarto trimestre de 2026, sábados", page 12
 * ("Madrid, 26 de enero de 2026"), read on 31 Oct 2026 (the PDF in SOURCES):
 * 205 series of 100,000 billetes at 200 €, décimos of 20 €; per series one
 * 4,000,000 € first prize, one 1,250,000 € second, one 500,000 € third, two
 * 200,000 € fourths, eight 60,000 € fifths, 1,794 prizes of 1,000 € (the
 * pedrea), two aproximaciones of 20,000 € (first), 12,500 € (second) and
 * 9,600 € (third), 99 + 99 + 99 prizes of 1,000 € for the rest of the centena
 * of the first, second and third, 198 for the centenas of the two fourths,
 * 999 + 999 + 999 of 1,000 € for the last two digits of the first, second and
 * third, and 9,999 reintegros of 200 € (last digit of the first): 15,304
 * prizes and 14,000,000 € per series. Both totals add up (test). The lottery
 * guide prints the same programme (src/lib/content/batch02/loteria-nadal.ts,
 * PROGRAMME) and the prize tax calculator the same per-décimo figures; the
 * tests keep the three in step.
 *
 * ## Which numbers get each derived prize: the BOE's wording (2010)
 *
 * The BOE stopped publishing Lotería Nacional programmes after the draw of 5
 * March 2011 (a BOE title search on 18 Nov 2026 finds none for 2011-2026). Its
 * last Christmas programme, BOE-A-2010-19540 (Resolución de 13 de diciembre
 * de 2010, de Loterías y Apuestas del Estado), read on 18 Nov 2026, defines
 * the aproximaciones (the number before and after; 00000 and the last number
 * wrap round), the centenas (the other 99 numbers of the same hundred), the
 * terminaciones (same last two digits) and the reintegro (same last digit),
 * each excluding the number it derives from: QUOTE below, verbatim. Applied to
 * 2026's 100,000 numbers it gives exactly 2026's counts (99, 198, 999, 9,999;
 * test). Prizes add up: a décimo can win several (SELAE's 2025 dossier counts
 * the last two digits of the Gordo plus the reintegro as 6 € per euro).
 *
 * ## Pending
 *
 * SELAE answers 403 to the server since 13 Nov 2026 (re-tested 18 Nov), so the
 * 2026 programme's own wording of those rules could not be re-read: the page
 * says "pendiente de confirmar" while PROGRAMME_CONFIRMED is null, and a test
 * fails from CONFIRM_BY until someone reads page 12 of the 2026 PDF (a browser
 * on the owner's PC, or `scripts/gordo-snapshot.py programme` on the PC fetch)
 * and fills it. For 2027: a new programme, a new YEAR, new tests.
 */

/** The draw this programme is for. The page's titles and the snapshot's year must match it. */
export const PROGRAMME_YEAR = 2026;
export const DRAW_DATE = "2026-12-22";

/** Numbers 00000 to 99999 (SELAE 2026: "100.000 billetes" per series). */
export const NUMBER_COUNT = 100_000;
export const BILLETE_PRICE = 200;
export const DECIMO_PRICE = 20;
export const DECIMOS_PER_BILLETE = BILLETE_PRICE / DECIMO_PRICE;

/** When SELAE's 2026 programme (counts and amounts) was read. */
export const SELAE_PROGRAMME_READ = "2026-10-31";
/** When the BOE's last Christmas programme (the wording of the derived prizes) was read. */
export const BOE_READ = "2026-11-18";

/**
 * Who read the 2026 programme's rule wording on SELAE, when and how. Null
 * until someone does: the page then says the derived prizes follow the BOE's
 * wording "pendiente de confirmar" for 2026.
 */
export const PROGRAMME_CONFIRMED: { read: string; how: string } | null = null;

/** From this day a test fails while PROGRAMME_CONFIRMED is null (a week before the draw). */
export const CONFIRM_BY = "2026-12-14";

export const SOURCES = {
  selaeProgramme: {
    name: "Programa de premios del Sorteo Extraordinario de Navidad del 22 de diciembre de 2026 (programas de premios, cuarto trimestre de 2026, sábados, página 12)",
    url: "https://www.loteriasyapuestas.es/f/loterias/documentos/Loter%C3%ADa%20Nacional/programas%20de%20premios/PROGRAMAS_PREMIOS_CUARTO_TRIMESTRE_2026_SABADOS.pdf",
    publisher: "SELAE",
    ref: "Madrid, 26 de enero de 2026",
    read: SELAE_PROGRAMME_READ,
  },
  boe2010: {
    name: "Resolución de 13 de diciembre de 2010, de Loterías y Apuestas del Estado, por la que se publica el programa de premios para el sorteo de la Lotería Nacional que se ha de celebrar el día 22 de diciembre de 2010",
    url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2010-19540",
    publisher: "BOE",
    ref: "BOE-A-2010-19540, BOE núm. 308, de 20 de diciembre de 2010",
    read: BOE_READ,
  },
} as const;

/** BOE-A-2010-19540, verbatim (Spanish). The 2010 draw had 85,000 numbers, hence "84.999". */
export const QUOTE = {
  derive:
    "De los números que obtengan los premios primero, segundo, tercero y cuartos se derivarán las centenas correspondientes, de los premios primero, segundo y tercero las aproximaciones y terminaciones, asimismo, del que obtenga el premio primero, el reintegro.",
  wrap: "Con respecto a las aproximaciones señaladas para los números anterior y posterior de los premios primero, segundo y tercero, se entenderá que si saliese premiado, en cualquiera de ellos, el número 00000, su anterior es el 84.999 y el siguiente el 00001. Asimismo si el agraciado fuese el 84.999, su anterior es el 84.998 y el 00000 será el siguiente.",
  hundreds:
    "Para la adjudicación de los premios de centenas de 1.000 euros, se entenderá que si cualquiera de los premios primero, segundo, tercero o cuartos correspondiera, por ejemplo, al número 00025, se considerarán agraciados los 99 números restantes de la misma, es decir, desde el 00000 al 00024 y desde el 00026 al 00099.",
  lastTwo: "Tendrán derecho a premio de 1.000 euros todos los billetes cuyas dos últimas cifras sean iguales y estén igualmente dispuestas que las de cualquiera de los que obtengan los premios primero, segundo o tercero.",
  reintegro: "Tendrán derecho al reintegro de su precio todos los billetes cuya última cifra sea igual a la del que obtenga el premio primero.",
  except:
    "De los premios de centenas, terminaciones y reintegro ha de entenderse que quedan exceptuados los números de los que, respectivamente se deriven, agraciados con los premios primero, segundo, tercero o cuartos.",
  list: "Verificado el sorteo se expondrán al público la lista de los números que hayan obtenido premio, único documento por el que se efectuará el pago de éstos.",
} as const;

/* -------------------------------------------------------------------------- */
/* Categories                                                                 */
/* -------------------------------------------------------------------------- */

/** The five drawn top prizes, as the gordo snapshot names them. */
export type TopKey = "first" | "second" | "third" | "fourth" | "fifth";

export type CategoryId =
  | "first"
  | "second"
  | "third"
  | "fourth"
  | "fifth"
  | "pedrea"
  | "approxFirst"
  | "approxSecond"
  | "approxThird"
  | "hundredFirst"
  | "hundredSecond"
  | "hundredThird"
  | "hundredFourth"
  | "lastTwoFirst"
  | "lastTwoSecond"
  | "lastTwoThird"
  | "reintegro";

export interface Category {
  id: CategoryId;
  /** Prizes of this kind in each series. */
  count: number;
  /** Euros per 200 € billete. */
  perBillete: number;
  /** For a derived prize: the top prize it derives from. */
  from?: Extract<TopKey, "first" | "second" | "third" | "fourth">;
}

/** SELAE's 2026 programme, one row per category (the centenas and terminaciones split by the prize they come from). */
export const CATEGORIES: readonly Category[] = [
  { id: "first", count: 1, perBillete: 4_000_000 },
  { id: "second", count: 1, perBillete: 1_250_000 },
  { id: "third", count: 1, perBillete: 500_000 },
  { id: "fourth", count: 2, perBillete: 200_000 },
  { id: "fifth", count: 8, perBillete: 60_000 },
  { id: "pedrea", count: 1_794, perBillete: 1_000 },
  { id: "approxFirst", count: 2, perBillete: 20_000, from: "first" },
  { id: "approxSecond", count: 2, perBillete: 12_500, from: "second" },
  { id: "approxThird", count: 2, perBillete: 9_600, from: "third" },
  { id: "hundredFirst", count: 99, perBillete: 1_000, from: "first" },
  { id: "hundredSecond", count: 99, perBillete: 1_000, from: "second" },
  { id: "hundredThird", count: 99, perBillete: 1_000, from: "third" },
  { id: "hundredFourth", count: 198, perBillete: 1_000, from: "fourth" },
  { id: "lastTwoFirst", count: 999, perBillete: 1_000, from: "first" },
  { id: "lastTwoSecond", count: 999, perBillete: 1_000, from: "second" },
  { id: "lastTwoThird", count: 999, perBillete: 1_000, from: "third" },
  { id: "reintegro", count: 9_999, perBillete: 200, from: "first" },
];

/** SELAE 2026: "15.304 premios" and "14.000.000" euros per series. */
export const PRIZES_PER_SERIES = 15_304;
export const EUROS_PER_SERIES = 14_000_000;

/** How many numbers each top prize draws (1, 1, 1, 2, 8), and the pedrea (1,794): 1,807 balls in all. */
export const DRAWN: Record<TopKey | "pedrea", number> = { first: 1, second: 1, third: 1, fourth: 2, fifth: 8, pedrea: 1_794 };
export const DRAWN_TOTAL = Object.values(DRAWN).reduce((a, b) => a + b, 0);

export function category(id: CategoryId): Category {
  const c = CATEGORIES.find((x) => x.id === id);
  if (!c) throw new Error(`unknown category ${id}`);
  return c;
}

/** Euros one 20 € décimo of this category wins: a tenth of the billete. */
export function perDecimo(id: CategoryId): number {
  return category(id).perBillete / DECIMOS_PER_BILLETE;
}

/** Euros per euro played. */
export function perEuro(id: CategoryId): number {
  return category(id).perBillete / BILLETE_PRICE;
}
