import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

import { ITV_LOCALES, itvEditions, type ItvLocale } from "./copy";
import { PRICES_AS_OF } from "./prices";
import { ITV_RULES_AS_OF } from "./rules";

/** Title, description, H1 and breadcrumb of the ITV page. Pure: the tests check their length. */
export function itvMeta(locale: ItvLocale): { title: string; description: string; h1: string; breadcrumb: string } {
  return {
    es: {
      title: "¿Cuándo me toca la ITV? Calculadora y precio por comunidad",
      description: "Calcula cuándo te toca pasar la ITV según el vehículo y su matriculación (RD 920/2017), cómo adelantarla 30 días sin perder fecha y el precio oficial por comunidad.",
      h1: "¿Cuándo me toca pasar la ITV? Calculadora, plazos y precios",
      breadcrumb: "ITV",
    },
    ca: {
      title: "Quan em toca passar l'ITV? Calculadora i preu per comunitat",
      description: "Calcula quan et toca passar l'ITV segons el vehicle i la matriculació (RD 920/2017), com avançar-la 30 dies sense perdre data i el preu oficial per comunitat.",
      h1: "Quan em toca passar l'ITV? Calculadora, terminis i preus",
      breadcrumb: "ITV",
    },
    en: {
      title: "When is my ITV due? Spain vehicle inspection calculator",
      description: "Work out when your Spanish ITV (vehicle inspection) is due from the vehicle type and first registration (RD 920/2017), the 30-day early rule and official fees by region.",
      h1: "When is my ITV due? Spain's vehicle inspection calculator and fees",
      breadcrumb: "ITV",
    },
  }[locale];
}

/** The three editions with reciprocal hreflang; x-default English like every page's HTML. */
export function itvSitemapEntries(): MetadataRoute.Sitemap {
  const e = itvEditions();
  const last = [ITV_RULES_AS_OF, PRICES_AS_OF].sort().at(-1)!;
  const languages = { es: absoluteUrl(e.es), ca: absoluteUrl(e.ca), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
  return ITV_LOCALES.map((locale) => ({
    url: absoluteUrl(e[locale]),
    lastModified: new Date(`${last}T00:00:00Z`),
    changeFrequency: "monthly" as const,
    priority: locale === "es" ? 0.8 : 0.6,
    alternates: { languages },
  }));
}
