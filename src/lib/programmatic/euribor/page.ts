import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

import { EURIBOR_LOCALES, bareDay, euriborEditions, monthText, ofMonth, points, rate3, type EuriborLocale } from "./copy";
import { RULES_AS_OF } from "./rules";
import { REF_IDS, boeDayRange, change, latestPoint, monthAfter, nextMonthOf, pointOf, yearBefore, type RefPoint, type RefSeries } from "./series";

/**
 * The words of the Euribor page that depend on the figures: title,
 * description, the answer-first lead, when the next figure comes, and the
 * freshness line. Pure: the tests run it on the snapshot and on edge cases
 * (no previous month, a figure overdue).
 */

const L = <T>(locale: EuriborLocale, v: Record<EuriborLocale, T>): T => v[locale];
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Catalan month with its article and year: "el setembre de 2026", "l'octubre de 2025". */
export function caArticleMonth(month: string): string {
  const t = monthText(month, "ca");
  return /^[aeiouàèéíòóú]/i.test(t) ? `l'${t}` : `el ${t}`;
}

/** "4 nov. 2026" for snippets. */
function shortBoe(iso: string, locale: EuriborLocale): string {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  const es = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sept.", "oct.", "nov.", "dic."];
  const ca = ["gen.", "febr.", "març", "abr.", "maig", "juny", "jul.", "ag.", "set.", "oct.", "nov.", "des."];
  const en = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const name = L(locale, { es, ca, en })[m - 1];
  return `${d} ${name} ${y}`;
}

export function euriborMeta(locale: EuriborLocale, series: RefSeries): { title: string; description: string; h1: string; breadcrumb: string } {
  const e = latestPoint(series.euribor);
  const irph = latestPoint(series.irph);
  if (!e) {
    return L(locale, {
      es: { title: "Euríbor hoy: dato oficial del Banco de España y del BOE", description: "El Euríbor oficial de cada mes según el Banco de España y el BOE, el IRPH y los demás índices hipotecarios, y cuánto cambia tu cuota.", h1: "Euríbor hoy: el dato oficial del mes", breadcrumb: "Euríbor hoy" },
      ca: { title: "Euríbor avui: dada oficial del Banc d'Espanya i del BOE", description: "L'Euríbor oficial de cada mes segons el Banc d'Espanya i el BOE, l'IRPH i els altres índexs hipotecaris, i quant canvia la teva quota.", h1: "Euríbor avui: la dada oficial del mes", breadcrumb: "Euríbor avui" },
      en: { title: "Euribor today: the official monthly figure in Spain", description: "Spain's official monthly Euribor from the Banco de España and the BOE, the IRPH and other mortgage indices, and how your instalment changes.", h1: "Euribor today: the official monthly figure", breadcrumb: "Euribor today" },
    });
  }
  const v = (loc: EuriborLocale) => rate3(e.value, loc);
  const irphEs = irph ? ` IRPH: ${rate3(irph.value, "es")}.` : "";
  const irphCa = irph ? ` IRPH: ${rate3(irph.value, "ca")}.` : "";
  const irphEn = irph ? ` IRPH: ${rate3(irph.value, "en")}.` : "";
  return L(locale, {
    es: {
      title: `Euríbor hoy: ${v("es")} en ${monthText(e.month, "es")} (dato oficial)`,
      description: `Euríbor oficial ${ofMonth(e.month, "es")}: ${v("es")} (Banco de España, BOE ${shortBoe(e.boe, "es")}).${irphEs} Tabla de 24 meses, cuándo sale el próximo y cuánto cambia tu cuota.`,
      h1: `Euríbor hoy: ${v("es")}, el dato oficial ${ofMonth(e.month, "es")}`,
      breadcrumb: "Euríbor hoy",
    },
    ca: {
      title: `Euríbor avui: ${v("ca")} ${ofMonth(e.month, "ca").replace(/^de |^d'/, (m) => (m === "d'" ? "a l'" : "al "))} (dada oficial)`,
      description: `Euríbor oficial ${ofMonth(e.month, "ca")}: ${v("ca")} (Banc d'Espanya, BOE ${shortBoe(e.boe, "ca")}).${irphCa} Taula de 24 mesos, quan surt el proper i quant canvia la quota.`,
      h1: `Euríbor avui: ${v("ca")}, la dada oficial ${ofMonth(e.month, "ca")}`,
      breadcrumb: "Euríbor avui",
    },
    en: {
      title: `Euribor today: ${v("en")} in ${monthText(e.month, "en")} (official, Spain)`,
      description: `Official 12-month Euribor for ${monthText(e.month, "en")}: ${v("en")} (Banco de España, BOE ${shortBoe(e.boe, "en")}).${irphEn} 24-month table, next release, mortgage revision.`,
      h1: `Euribor today: ${v("en")}, the official figure for ${monthText(e.month, "en")}`,
      breadcrumb: "Euribor today",
    },
  });
}

/** "0,008 puntos menos que en septiembre (3,247 %)". */
function versus(now: RefPoint, then: RefPoint | null, locale: EuriborLocale, label: Record<EuriborLocale, string>): string | null {
  if (!then) return null;
  const d = change(now.value, then.value);
  const abs = Math.abs(d);
  const n = points(abs, locale).replace(/^\+/, "");
  if (d === 0) return L(locale, { es: `igual que ${label.es} (${rate3(then.value, "es")})`, ca: `igual que ${label.ca} (${rate3(then.value, "ca")})`, en: `the same as ${label.en} (${rate3(then.value, "en")})` });
  const more = d > 0;
  return L(locale, {
    es: `${n.replace(" p. p.", more ? " puntos más" : " puntos menos")} que ${label.es} (${rate3(then.value, "es")})`,
    ca: `${n.replace(" p. p.", more ? " punts més" : " punts menys")} que ${label.ca} (${rate3(then.value, "ca")})`,
    en: `${n.replace(" pp", more ? " points higher" : " points lower")} than ${label.en} (${rate3(then.value, "en")})`,
  });
}

/** When the next Euribor figure is due, from the BOE days of the last 12 months: never a made-up date. */
export function nextText(locale: EuriborLocale, series: RefSeries, today: string): string {
  const next = nextMonthOf(series.euribor);
  const range = boeDayRange(series.euribor);
  if (!next || !range) return "";
  const due = monthAfter(next).slice(0, 7);
  const window = L(locale, {
    es: `en los últimos 12 meses salió en el BOE entre el día ${range.min} y el ${range.max} del mes siguiente`,
    ca: `els últims 12 mesos ha sortit al BOE entre el dia ${range.min} i el ${range.max} del mes següent`,
    en: `over the last 12 months it came out in the BOE between day ${range.min} and day ${range.max} of the following month`,
  });
  const late = today > `${due}-${String(range.max).padStart(2, "0")}`;
  if (late) {
    return L(locale, {
      es: `El Euríbor ${ofMonth(next, "es")} aún no está en nuestros datos del Banco de España (${window}); lo añadimos en cuanto el BOE lo publique.`,
      ca: `L'Euríbor ${ofMonth(next, "ca")} encara no és a les nostres dades del Banc d'Espanya (${window}); l'afegim tan bon punt el BOE el publiqui.`,
      en: `The Euribor for ${monthText(next, "en")} is not in our Banco de España data yet (${window}); it appears here as soon as the BOE publishes it.`,
    });
  }
  return L(locale, {
    es: `El Euríbor ${ofMonth(next, "es")} se publicará a primeros de ${monthText(due, "es")}: ${window}.`,
    ca: `L'Euríbor ${ofMonth(next, "ca")} es publicarà a primers ${ofMonth(due, "ca")}: ${window}.`,
    en: `The Euribor for ${monthText(next, "en")} will be published in early ${monthText(due, "en")}: ${window}.`,
  });
}

export function leadText(locale: EuriborLocale, series: RefSeries, today: string): string {
  const e = latestPoint(series.euribor);
  if (!e) {
    return L(locale, {
      es: "Ahora no tenemos un dato comprobado del Euríbor oficial: consulta el BOE o el Banco de España.",
      ca: "Ara no tenim cap dada comprovada de l'Euríbor oficial: consulta el BOE o el Banc d'Espanya.",
      en: "We have no checked official Euribor figure right now: see the BOE or the Banco de España.",
    });
  }
  const prevMonth = series.euribor.at(-2) ?? null;
  const yearAgo = pointOf(series.euribor, yearBefore(e.month));
  const prevLabel = prevMonth
    ? { es: `en ${monthText(prevMonth.month, "es")}`, ca: caArticleMonth(prevMonth.month), en: `in ${monthText(prevMonth.month, "en")}` }
    : null;
  const parts = [prevMonth && prevLabel ? versus(e, prevMonth, locale, prevLabel) : null, versus(e, yearAgo, locale, { es: "hace un año", ca: "fa un any", en: "a year earlier" })].filter((x): x is string => Boolean(x));
  const cmp = parts.length ? L(locale, { es: `: ${parts.join(" y ")}`, ca: `: ${parts.join(" i ")}`, en: `: ${parts.join(" and ")}` }) : "";
  const first = L(locale, {
    es: `El Euríbor a un año ${ofMonth(e.month, "es")} fue del ${rate3(e.value, "es")}, según el Banco de España (BOE del ${bareDay(e.boe, "es")})${cmp}.`,
    ca: `L'Euríbor a un any ${ofMonth(e.month, "ca")} va ser del ${rate3(e.value, "ca")}, segons el Banc d'Espanya (BOE del ${bareDay(e.boe, "ca")})${cmp}.`,
    en: `The 12-month Euribor for ${monthText(e.month, "en")} was ${rate3(e.value, "en")}, according to the Banco de España (BOE of ${bareDay(e.boe, "en")})${cmp}.`,
  });
  const what = L(locale, {
    es: "Es la media mensual oficial con la que se revisan las hipotecas variables.",
    ca: "És la mitjana mensual oficial amb què es revisen les hipoteques variables.",
    en: "It is the official monthly average Spanish variable-rate mortgages are revised with.",
  });
  const next = nextText(locale, series, today);
  return `${first} ${what}${next ? ` ${next}` : ""}`;
}

export function freshnessText(locale: EuriborLocale, live: boolean, today: string, snapshotAsOf: string): string {
  return live
    ? L(locale, {
        es: `Datos del Banco de España (tabla 19.1 del Boletín Estadístico) leídos el ${bareDay(today, "es")}, una vez al día; solo meses ya publicados en el BOE. Fuentes revisadas el ${bareDay(RULES_AS_OF, "es")}.`,
        ca: `Dades del Banc d'Espanya (taula 19.1 del Butlletí Estadístic) llegides el ${bareDay(today, "ca")}, un cop al dia; només mesos ja publicats al BOE. Fonts revisades el ${bareDay(RULES_AS_OF, "ca")}.`,
        en: `Banco de España data (Statistical Bulletin table 19.1) read on ${bareDay(today, "en")}, once a day; only months already published in the BOE. Sources checked on ${bareDay(RULES_AS_OF, "en")}.`,
      })
    : L(locale, {
        es: `No hemos podido consultar ahora el Banco de España: datos comprobados con el BOE el ${bareDay(snapshotAsOf, "es")}.`,
        ca: `Ara no hem pogut consultar el Banc d'Espanya: dades comprovades amb el BOE el ${bareDay(snapshotAsOf, "ca")}.`,
        en: `We could not reach the Banco de España just now: figures checked against the BOE on ${bareDay(snapshotAsOf, "en")}.`,
      });
}

/** "Octubre de 2026" for a table header. */
export function monthHead(month: string, locale: EuriborLocale): string {
  return capital(monthText(month, locale));
}

/** Sitemap: the three editions, last modified on the newest BOE day or the rules read. */
export function euriborSitemapEntries(series: RefSeries): MetadataRoute.Sitemap {
  const e = euriborEditions();
  const last = [RULES_AS_OF, ...REF_IDS.map((id) => latestPoint(series[id])?.boe ?? "")].sort().at(-1)!;
  const languages = { es: absoluteUrl(e.es), ca: absoluteUrl(e.ca), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
  return EURIBOR_LOCALES.map((locale) => ({
    url: absoluteUrl(e[locale]),
    lastModified: new Date(`${last}T00:00:00Z`),
    changeFrequency: "weekly" as const,
    priority: locale === "es" ? 0.8 : 0.6,
    alternates: { languages },
  }));
}
