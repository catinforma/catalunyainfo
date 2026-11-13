import type { MetadataRoute } from "next";

import { latestPoint, type RefSeries } from "@/lib/programmatic/euribor/series";
import { absoluteUrl } from "@/lib/site";

import { caOfMonth } from "@/lib/programmatic/rent-update/copy";

import { MORTGAGE_LOCALES, monthText, mortgageEditions, pct, type MortgageLocale } from "./copy";
import { RULES_AS_OF } from "./rules";

/**
 * The words of the mortgage page that depend on the Euribor: title,
 * description, h1 and the answer-first lead. Pure.
 */

const L = <T>(locale: MortgageLocale, v: Record<MortgageLocale, T>): T => v[locale];

export function mortgageMeta(locale: MortgageLocale, series: RefSeries): { title: string; description: string; h1: string; breadcrumb: string } {
  const e = latestPoint(series.euribor);
  const eEs = e ? ` Euríbor oficial ${pct(e.value, 3, "es")} (${monthText(e.month, "es")}).` : "";
  const eCa = e ? ` Euríbor oficial ${pct(e.value, 3, "ca")} (${monthText(e.month, "ca")}).` : "";
  const eEn = e ? ` Official Euribor ${pct(e.value, 3, "en")} (${monthText(e.month, "en")}).` : "";
  return L(locale, {
    es: {
      title: "Calculadora de hipoteca: cuota fija, variable o mixta",
      description: `Cuota mensual, intereses totales y cuadro de amortización de tu hipoteca, y cuánto cambia en la revisión.${eEs}`,
      h1: "Calculadora de hipoteca: cuota fija, variable o mixta y revisión con el Euríbor",
      breadcrumb: "Calculadora de hipoteca",
    },
    ca: {
      title: "Calculadora d'hipoteca: quota fixa, variable o mixta",
      description: `Quota mensual, interessos totals i quadre d'amortització de la teva hipoteca, i quant canvia a la revisió.${eCa}`,
      h1: "Calculadora d'hipoteca: quota fixa, variable o mixta i revisió amb l'Euríbor",
      breadcrumb: "Calculadora d'hipoteca",
    },
    en: {
      title: "Spain mortgage calculator: fixed, variable or mixed",
      description: `Monthly instalment, total interest and amortisation table of a Spanish mortgage, and how it changes at the revision.${eEn}`,
      h1: "Spain mortgage calculator: fixed, variable or mixed, and your Euribor revision",
      breadcrumb: "Mortgage calculator",
    },
  });
}

export function mortgageLead(locale: MortgageLocale, series: RefSeries): string {
  const e = latestPoint(series.euribor);
  const eur = e
    ? L(locale, {
        es: ` Las variables y mixtas llevan ya puesto el último Euríbor oficial, el de ${monthText(e.month, "es")}: ${pct(e.value, 3, "es")} (Banco de España, BOE).`,
        ca: ` Les variables i mixtes ja porten posat l'últim Euríbor oficial, el ${caOfMonth(e.month)}: ${pct(e.value, 3, "ca")} (Banc d'Espanya, BOE).`,
        en: ` Variable and mixed loans start on the latest official Euribor, ${monthText(e.month, "en")}: ${pct(e.value, 3, "en")} (Banco de España, BOE).`,
      })
    : "";
  return L(locale, {
    es: `Calcula la cuota mensual de una hipoteca fija, variable o mixta con el sistema francés, los intereses que pagarás en total y el cuadro de amortización año a año, y cuánto cambia tu cuota en la próxima revisión.${eur}`,
    ca: `Calcula la quota mensual d'una hipoteca fixa, variable o mixta amb el sistema francès, els interessos que pagaràs en total i el quadre d'amortització any a any, i quant canvia la quota a la propera revisió.${eur}`,
    en: `Work out the monthly instalment of a fixed, variable or mixed Spanish mortgage with the French system, the total interest and the year-by-year amortisation table, and how much your instalment changes at the next revision.${eur}`,
  });
}

/** Sitemap: the three editions, last modified on the newest Euribor BOE day or the rules read. */
export function mortgageSitemapEntries(series: RefSeries): MetadataRoute.Sitemap {
  const e = mortgageEditions();
  const last = [RULES_AS_OF, latestPoint(series.euribor)?.boe ?? ""].sort().at(-1)!;
  const languages = { es: absoluteUrl(e.es), ca: absoluteUrl(e.ca), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
  return MORTGAGE_LOCALES.map((locale) => ({
    url: absoluteUrl(e[locale]),
    lastModified: new Date(`${last}T00:00:00Z`),
    changeFrequency: "weekly" as const,
    priority: locale === "es" ? 0.8 : 0.6,
    alternates: { languages },
  }));
}
