import { CALENDAR_2026_PDF, CALENDAR_2027, CALENDAR_PAGE_URL, nextAuctionOf, upcoming, type CalendarRow } from "./calendar";
import { bareDay, rate3, pct, termName, weekdayDay, type LetrasLocale } from "./copy";
import { taeFromRate } from "./engine";
import { TERMS, latestByTerm, resultDays, type AuctionResult } from "./results";

/**
 * The Letras page's first-screen "next auctions" lines and its questions
 * (26 Nov 2026), in the words Search Console shows people typing at the page
 * (29 Oct-25 Nov 2026, es 2,258 impressions at position 7.1: "calendario
 * letras del tesoro 2026 pdf" 59, "próximas subastas letras del tesoro 2026"
 * 44, "calendario subastas letras del tesoro 2027" 25, "proxima subasta
 * letras del tesoro" 25, "… a 12 meses" variants; ca "lletres del tresor a 12
 * mesos" 59, "rendibilitat lletres del tresor" 7). Everything comes from the
 * Tesoro's calendar rows (calendar.ts, typed in from its PDF and checked
 * against it by test) and the auction results the page already reads from
 * tesoro.es (snapshot + live), so the answers move with each auction by
 * themselves; the snapshot's date guard in tests/treasury-bills.test.ts fails
 * 3 days after any auction whose result is missing. Pure, client-safe.
 */

export interface Faq {
  q: string;
  a: string;
}

const L = <T>(locale: LetrasLocale, v: Record<LetrasLocale, T>): T => v[locale];

function termsText(row: CalendarRow, locale: LetrasLocale): string {
  const [a, b] = row.terms;
  return L(locale, { es: `${a} y ${b} meses`, ca: `${a} i ${b} mesos`, en: `${a}- and ${b}-month bills` });
}

/** One upcoming auction in a sentence: day, terms and the Banco de España deadline. */
export function auctionLine(row: CalendarRow, locale: LetrasLocale): string {
  return L(locale, {
    es: `${cap(weekdayDay(row.auction, "es"))}: ${termsText(row, "es")}. Peticiones en el Banco de España hasta el ${weekdayDay(row.requestsBy, "es")} a las 14:00.`,
    ca: `${cap(weekdayDay(row.auction, "ca"))}: ${termsText(row, "ca")}. Peticions al Banc d'Espanya fins al ${weekdayDay(row.requestsBy, "ca")} a les 14.00.`,
    en: `${weekdayDay(row.auction, "en")}: ${termsText(row, "en")}. Banco de España requests by ${weekdayDay(row.requestsBy, "en")}, 14:00.`,
  });
}

/** The next `count` auctions for the box on the first screen. */
export function nextAuctionLines(today: string, locale: LetrasLocale, count = 3): string[] {
  return upcoming(today)
    .slice(0, count)
    .map((r) => auctionLine(r, locale));
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "3 meses: 2,652 % (subasta del 10 de noviembre de 2026)". */
function rateLine(r: AuctionResult, locale: LetrasLocale): string {
  return L(locale, {
    es: `${termName(r.term, "es")}: ${rate3(r.avgRate, "es")} (subasta del ${bareDay(r.auction, "es")})`,
    ca: `${termName(r.term, "ca")}: ${rate3(r.avgRate, "ca")} (subhasta del ${bareDay(r.auction, "ca")})`,
    en: `${termName(r.term, "en")}: ${rate3(r.avgRate, "en")} (auction of ${bareDay(r.auction, "en")})`,
  });
}

export interface FaqInput {
  results: readonly AuctionResult[];
  today: string;
  /** A 2027 calendar PDF found on tesoro.es while calendar.ts has no 2027 rows. */
  calendar2027Pdf: string | null;
}

export function letrasFaq(locale: LetrasLocale, input: FaqInput): Faq[] {
  const { today } = input;
  const top = latestByTerm(input.results);
  const next = upcoming(today);
  const faq: Faq[] = [];

  const n0 = next[0] ?? null;
  const n1 = next[1] ?? null;
  if (n0) {
    faq.push({
      q: L(locale, { es: "¿Cuándo es la próxima subasta de Letras del Tesoro?", ca: "Quan és la propera subhasta de lletres del Tresor?", en: "When is the next Spanish Treasury bill auction?" }),
      a: [auctionLine(n0, locale), n1 ? L(locale, { es: `La siguiente: ${auctionLine(n1, "es").charAt(0).toLowerCase()}${auctionLine(n1, "es").slice(1)}`, ca: `La següent: ${auctionLine(n1, "ca").charAt(0).toLowerCase()}${auctionLine(n1, "ca").slice(1)}`, en: `The one after: ${auctionLine(n1, "en")}` }) : ""]
        .filter(Boolean)
        .join(" "),
    });
  }

  const n12 = nextAuctionOf(12, today);
  const r12 = top[12] ?? null;
  if (n12) {
    faq.push({
      q: L(locale, { es: "¿Cuándo es la próxima subasta de Letras a 12 meses?", ca: "Quan és la propera subhasta de lletres a 12 mesos?", en: "When is the next 12-month bill auction?" }),
      a: L(locale, {
        es: `El ${weekdayDay(n12.auction, "es")} (las de 6 y 12 meses se subastan juntas). Si compras en el Banco de España, pide hasta el ${weekdayDay(n12.requestsBy, "es")} a las 14:00; las letras se emiten el ${bareDay(n12.issue, "es")}.${r12 ? ` En la última, del ${bareDay(r12.auction, "es")}, el tipo medio fue del ${rate3(r12.avgRate, "es")}.` : ""}`,
        ca: `El ${weekdayDay(n12.auction, "ca")} (les de 6 i 12 mesos se subhasten juntes). Si compres al Banc d'Espanya, demana-les fins al ${weekdayDay(n12.requestsBy, "ca")} a les 14.00; les lletres s'emeten el ${bareDay(n12.issue, "ca")}.${r12 ? ` A l'última, del ${bareDay(r12.auction, "ca")}, el tipus mitjà va ser del ${rate3(r12.avgRate, "ca")}.` : ""}`,
        en: `On ${weekdayDay(n12.auction, "en")} (6- and 12-month bills are auctioned together). Buying through the Banco de España, request by ${weekdayDay(n12.requestsBy, "en")}, 14:00; the bills are issued on ${bareDay(n12.issue, "en")}.${r12 ? ` At the last one, on ${bareDay(r12.auction, "en")}, the average rate was ${rate3(r12.avgRate, "en")}.` : ""}`,
      }),
    });
  }

  const known = TERMS.map((t) => top[t]).filter((r): r is AuctionResult => Boolean(r));
  if (r12 && known.length) {
    const tae = taeFromRate(r12.avgRate, resultDays(r12));
    faq.push({
      q: L(locale, { es: "¿Qué rentabilidad dan las Letras del Tesoro a 12 meses?", ca: "Quina rendibilitat donen les lletres del Tresor a 12 mesos?", en: "What do 12-month Spanish Treasury bills yield?" }),
      a: L(locale, {
        es: `Un tipo medio del ${rate3(r12.avgRate, "es")} en la subasta del ${bareDay(r12.auction, "es")} (Tesoro Público), que equivale a una TAE del ${pct(tae, 3, "es")}. Es lo que obtiene una petición no competitiva, antes del IRPF. Últimos tipos medios por plazo: ${known.map((r) => rateLine(r, "es")).join("; ")}.`,
        ca: `Un tipus mitjà del ${rate3(r12.avgRate, "ca")} a la subhasta del ${bareDay(r12.auction, "ca")} (Tresor Públic), que equival a una TAE del ${pct(tae, 3, "ca")}. És el que obté una petició no competitiva, abans de l'IRPF. Últims tipus mitjans per termini: ${known.map((r) => rateLine(r, "ca")).join("; ")}.`,
        en: `An average rate of ${rate3(r12.avgRate, "en")} at the ${bareDay(r12.auction, "en")} auction (Tesoro Público), equivalent to a TAE (APR) of ${pct(tae, 3, "en")}. That is what a non-competitive bid gets, before income tax. Latest average rates by term: ${known.map((r) => rateLine(r, "en")).join("; ")}.`,
      }),
    });
  }

  faq.push({
    q: L(locale, { es: "¿Dónde está el calendario de Letras del Tesoro de 2026 en PDF?", ca: "On és el calendari de lletres del Tresor del 2026 en PDF?", en: "Where is the 2026 Treasury bill calendar PDF?" }),
    a: L(locale, {
      es: `En la web del Tesoro Público: ${CALENDAR_2026_PDF} («Calendario de subastas de los valores del Tesoro», con las Letras de 6 y 12 meses y las de 3 y 9 meses). En esta página tienes sus fechas en una tabla, con el plazo para pedir en el Banco de España.`,
      ca: `Al web del Tresor Públic: ${CALENDAR_2026_PDF} («Calendario de subastas de los valores del Tesoro», amb les lletres de 6 i 12 mesos i les de 3 i 9 mesos). En aquesta pàgina en tens les dates en una taula, amb el termini per demanar-les al Banc d'Espanya.`,
      en: `On the Tesoro Público website: ${CALENDAR_2026_PDF} ("Calendario de subastas de los valores del Tesoro", with the 6- and 12-month and the 3- and 9-month bills). This page has its dates in a table, with the Banco de España request deadline.`,
    }),
  });

  if (!CALENDAR_2027) {
    const jan = upcoming(today).filter((r) => r.auction.startsWith("2027-01"));
    const janText = (locale: LetrasLocale) => jan.map((r) => `${bareDay(r.auction, locale)} (${termsText(r, locale)})`).join(L(locale, { es: " y ", ca: " i ", en: " and " }));
    faq.push({
      q: L(locale, { es: "¿Cuándo sale el calendario de subastas de Letras de 2027?", ca: "Quan surt el calendari de subhastes de lletres del 2027?", en: "When is the 2027 Treasury bill calendar published?" }),
      a: input.calendar2027Pdf
        ? L(locale, {
            es: `Ya está publicado en la web del Tesoro: ${input.calendar2027Pdf}. Añadimos sus fechas a esta página en cuanto las comprobamos.`,
            ca: `Ja està publicat al web del Tresor: ${input.calendar2027Pdf}. N'afegim les dates a aquesta pàgina tan bon punt les comprovem.`,
            en: `It is out on the Treasury's website: ${input.calendar2027Pdf}. We add its dates here as soon as we have checked them.`,
          })
        : L(locale, {
            es: `Aún no: el Tesoro lo publica en diciembre (el de 2026 lleva fecha del 3 de diciembre de 2025) en ${CALENDAR_PAGE_URL}.${jan.length ? ` Las subastas de enero de 2027 ya están en el calendario de 2026: ${janText("es")}.` : ""}`,
            ca: `Encara no: el Tresor el publica al desembre (el del 2026 porta data del 3 de desembre de 2025) a ${CALENDAR_PAGE_URL}.${jan.length ? ` Les subhastes de gener del 2027 ja són al calendari del 2026: ${janText("ca")}.` : ""}`,
            en: `Not yet: the Treasury publishes it in December (2026's is dated 3 December 2025) at ${CALENDAR_PAGE_URL}.${jan.length ? ` The January 2027 auctions are already in the 2026 calendar: ${janText("en")}.` : ""}`,
          }),
    });
  }
  return faq;
}
