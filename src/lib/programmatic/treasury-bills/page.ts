import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

import { CALENDAR_READ_ON, nextAuctionOf, upcoming, type CalendarRow } from "./calendar";
import { LETRAS_LOCALES, bareDay, elDay, letrasEditions, rate3, weekdayDay, type LetrasLocale } from "./copy";
import { TERMS, latestByTerm, type AuctionResult, type Term } from "./results";
import { RULES_AS_OF } from "./rules";

/**
 * The words of the Letras page that depend on the latest results and the
 * calendar: title, description, the answer-first lead and the freshness
 * line. Pure: the tests run it on the snapshot and on edge cases (no result
 * for a term, past the last calendar row).
 */

const L = <T>(locale: LetrasLocale, v: Record<LetrasLocale, T>): T => v[locale];

export interface PageInput {
  results: readonly AuctionResult[];
  today: string;
}

function terms(row: CalendarRow, locale: LetrasLocale): string {
  const [a, b] = row.terms;
  return L(locale, { es: `${a} y ${b} meses`, ca: `${a} i ${b} mesos`, en: `${a} and ${b} months` });
}

export function letrasMeta(locale: LetrasLocale, input: PageInput): { title: string; description: string; h1: string; breadcrumb: string } {
  const top = latestByTerm(input.results);
  const r = (t: Term) => (top[t] ? rate3(top[t]!.avgRate, locale) : "—");
  const twelve = top[12];
  const next = upcoming(input.today)[0] ?? null;
  const nextEs = next ? ` Próxima subasta: ${bareDay(next.auction, "es")} (${terms(next, "es")}).` : "";
  const nextCa = next ? ` Propera subhasta: ${bareDay(next.auction, "ca")} (${terms(next, "ca")}).` : "";
  const nextEn = next ? ` Next auction: ${bareDay(next.auction, "en")} (${terms(next, "en")}).` : "";
  return L(locale, {
    es: {
      title: twelve ? `Letras del Tesoro: ${r(12)} a 12 meses, próxima subasta y calculadora` : "Letras del Tesoro: último tipo, próximas subastas y calculadora",
      description: `Tipo medio de la última subasta del Tesoro: ${r(3)} a 3 meses, ${r(6)} a 6, ${r(9)} a 9 y ${r(12)} a 12.${nextEs} Plazos de petición, calculadora e IRPF.`,
      h1: "Letras del Tesoro: próximas subastas, último tipo y calculadora",
      breadcrumb: "Letras del Tesoro",
    },
    ca: {
      title: twelve ? `Lletres del Tresor: ${r(12)} a 12 mesos, propera subhasta i calculadora` : "Lletres del Tresor: últim tipus, properes subhastes i calculadora",
      description: `Tipus mitjà de l'última subhasta del Tresor: ${r(3)} a 3 mesos, ${r(6)} a 6, ${r(9)} a 9 i ${r(12)} a 12.${nextCa} Terminis, calculadora i IRPF.`,
      h1: "Lletres del Tresor: properes subhastes, últim tipus i calculadora",
      breadcrumb: "Lletres del Tresor",
    },
    en: {
      title: twelve ? `Spanish Treasury bills (Letras): ${r(12)} for 12 months, next auction` : "Spanish Treasury bills (Letras): latest rate, auctions, calculator",
      description: `Average rate at Spain's latest Treasury bill auctions: ${r(3)} for 3 months, ${r(6)} for 6, ${r(9)} for 9, ${r(12)} for 12.${nextEn} Deadlines, calculator, tax.`,
      h1: "Spanish Treasury bills (Letras del Tesoro): next auctions, latest rate and calculator",
      breadcrumb: "Treasury bills",
    },
  });
}

/** "2,652 % a 3 meses (subasta del 10 de noviembre)". */
function termLine(r: AuctionResult, locale: LetrasLocale): string {
  const day = bareDay(r.auction, locale).replace(/ (de )?\d{4}$/, "");
  return L(locale, {
    es: `${rate3(r.avgRate, "es")} a ${r.term} meses (subasta del ${day})`,
    ca: `${rate3(r.avgRate, "ca")} a ${r.term} mesos (subhasta del ${day})`,
    en: `${rate3(r.avgRate, "en")} for ${r.term} months (auction of ${day})`,
  });
}

function list(items: string[], locale: LetrasLocale): string {
  if (items.length <= 1) return items.join("");
  const and = L(locale, { es: " y ", ca: " i ", en: " and " });
  return `${items.slice(0, -1).join(", ")}${and}${items.at(-1)}`;
}

export function leadText(locale: LetrasLocale, input: PageInput): string {
  const top = latestByTerm(input.results);
  const known = TERMS.map((t) => top[t]).filter((r): r is AuctionResult => Boolean(r));
  const rates = list(
    known.map((r) => termLine(r, locale)),
    locale,
  );
  const next = upcoming(input.today)[0] ?? null;
  const first = known.length
    ? L(locale, {
        es: `En sus últimas subastas, el Tesoro Público colocó las Letras a un tipo de interés medio del ${rates}.`,
        ca: `A les últimes subhastes, el Tresor Públic va col·locar les lletres a un tipus d'interès mitjà del ${rates}.`,
        en: `At its latest auctions, Spain's Treasury (Tesoro Público) sold its bills (Letras) at an average rate of ${rates}.`,
      })
    : L(locale, { es: "No tenemos ahora un resultado comprobado de las subastas del Tesoro.", ca: "Ara no tenim cap resultat comprovat de les subhastes del Tresor.", en: "We have no checked Treasury auction result right now." });
  if (!next) {
    return `${first} ${L(locale, {
      es: "La próxima subasta aún no está en el calendario oficial publicado: el Tesoro lo publica cada diciembre para el año siguiente.",
      ca: "La propera subhasta encara no és al calendari oficial publicat: el Tresor el publica cada desembre per a l'any següent.",
      en: "The next auction is not in the published official calendar yet: the Treasury publishes it every December for the following year.",
    })}`;
  }
  const by = weekdayDay(next.requestsBy, locale);
  const on = weekdayDay(next.auction, locale);
  if (input.today > next.requestsBy) {
    const open = upcoming(input.today).find((r) => input.today <= r.requestsBy) ?? null;
    const then = open
      ? L(locale, {
          es: ` La siguiente con plazo abierto es la del ${weekdayDay(open.auction, "es")} (${terms(open, "es")}), con peticiones hasta el ${weekdayDay(open.requestsBy, "es")} a las 14:00.`,
          ca: ` La següent amb termini obert és la del ${weekdayDay(open.auction, "ca")} (${terms(open, "ca")}), amb peticions fins al ${weekdayDay(open.requestsBy, "ca")} a les 14.00.`,
          en: ` The next one still open is on ${weekdayDay(open.auction, "en")} (${terms(open, "en")}), with requests due by ${weekdayDay(open.requestsBy, "en")} at 14:00.`,
        })
      : "";
    return `${first} ${L(locale, {
      es: `La próxima subasta es el ${on} (${terms(next, "es")}); el plazo de peticiones en el Banco de España ya ha cerrado.`,
      ca: `La propera subhasta és el ${on} (${terms(next, "ca")}); el termini de peticions al Banc d'Espanya ja s'ha tancat.`,
      en: `The next auction is on ${on} (${terms(next, "en")}); the Banco de España request window has closed.`,
    })}${then}`;
  }
  return `${first} ${L(locale, {
    es: `La próxima subasta es el ${on} (${terms(next, "es")}); si compras en el Banco de España, la petición se presenta hasta el ${by} a las 14:00.`,
    ca: `La propera subhasta és el ${on} (${terms(next, "ca")}); si compres al Banc d'Espanya, la petició es presenta fins al ${by} a les 14.00.`,
    en: `The next auction is on ${on} (${terms(next, "en")}); buying through the Banco de España, the request is due by ${by} at 14:00.`,
  })}`;
}

export function freshnessText(locale: LetrasLocale, liveAny: boolean, snapshotAsOf: string, today: string): string {
  const cal = L(locale, {
    es: `Calendario: PDF oficial del Tesoro para 2026, revisado ${elDay(CALENDAR_READ_ON, "es")}; normas e impuestos, ${elDay(RULES_AS_OF, "es")}.`,
    ca: `Calendari: PDF oficial del Tresor per al 2026, revisat ${elDay(CALENDAR_READ_ON, "ca")}; normes i impostos, ${elDay(RULES_AS_OF, "ca")}.`,
    en: `Calendar: the Treasury's official 2026 PDF, checked ${elDay(CALENDAR_READ_ON, "en")}; rules and tax, ${elDay(RULES_AS_OF, "en")}.`,
  });
  const res = liveAny
    ? L(locale, {
        es: `Resultados leídos de tesoro.es ${elDay(today, "es")} (cada 3 horas).`,
        ca: `Resultats llegits de tesoro.es ${elDay(today, "ca")} (cada 3 hores).`,
        en: `Results read from tesoro.es ${elDay(today, "en")} (every 3 hours).`,
      })
    : L(locale, {
        es: `No hemos podido consultar tesoro.es ahora: resultados comprobados ${elDay(snapshotAsOf, "es")}.`,
        ca: `Ara no hem pogut consultar tesoro.es: resultats comprovats ${elDay(snapshotAsOf, "ca")}.`,
        en: `We could not reach tesoro.es just now: results checked ${elDay(snapshotAsOf, "en")}.`,
      });
  return `${res} ${cal}`;
}

/** The next auction line of one term, for the calculator. */
export function nextOf(term: Term, today: string): CalendarRow | null {
  return nextAuctionOf(term, today);
}

/** Sitemap: the three editions, last modified on the newest auction or rules read. */
export function letrasSitemapEntries(results: readonly AuctionResult[]): MetadataRoute.Sitemap {
  const e = letrasEditions();
  const last = [RULES_AS_OF, CALENDAR_READ_ON, ...results.map((r) => r.auction)].sort().at(-1)!;
  const languages = { es: absoluteUrl(e.es), ca: absoluteUrl(e.ca), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
  return LETRAS_LOCALES.map((locale) => ({
    url: absoluteUrl(e[locale]),
    lastModified: new Date(`${last}T00:00:00Z`),
    changeFrequency: "weekly" as const,
    priority: locale === "es" ? 0.8 : 0.6,
    alternates: { languages },
  }));
}
