import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

import { COMMUNITIES_AS_OF } from "./as-of";
import { HT_LOCALES, htEditions, type HtLocale } from "./copy";
import { STATE_RULES_AS_OF } from "./rules";

/** Title, description, H1 and breadcrumb. Pure: the tests check their length. */
export function htMeta(locale: HtLocale): { title: string; description: string; h1: string; breadcrumb: string } {
  return {
    es: {
      title: "Calculadora ITP e IVA 2026: impuestos al comprar vivienda",
      description: "Calcula el ITP de una vivienda de segunda mano, o el IVA y el AJD de una nueva, en cada comunidad, con los tipos reducidos para jóvenes y familias numerosas.",
      h1: "Impuestos al comprar una vivienda: ITP o IVA y AJD por comunidad",
      breadcrumb: "Impuestos de compra de vivienda",
    },
    ca: {
      title: "Calculadora ITP i IVA 2026: impostos en comprar habitatge",
      description: "Calcula l'ITP d'un habitatge de segona mà, o l'IVA i l'AJD d'un de nou, a cada comunitat, amb els tipus reduïts per a joves, famílies nombroses i discapacitat.",
      h1: "Impostos en comprar un habitatge: ITP o IVA i AJD per comunitat",
      breadcrumb: "Impostos de compra d'habitatge",
    },
    en: {
      title: "Spain home purchase taxes 2026: ITP, IVA and AJD calculator",
      description: "Work out the transfer tax (ITP) on a resale home in Spain, or the VAT and stamp duty (AJD) on a new one, by region, with reduced rates for young buyers and families.",
      h1: "Taxes on buying a home in Spain: ITP or IVA plus AJD, by region",
      breadcrumb: "Home purchase taxes",
    },
  }[locale];
}

/** The three editions with reciprocal hreflang; x-default English like every page's HTML. */
export function htSitemapEntries(): MetadataRoute.Sitemap {
  const e = htEditions();
  const last = [STATE_RULES_AS_OF, COMMUNITIES_AS_OF].sort().at(-1)!;
  const languages = { es: absoluteUrl(e.es), ca: absoluteUrl(e.ca), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
  return HT_LOCALES.map((locale) => ({
    url: absoluteUrl(e[locale]),
    lastModified: new Date(`${last}T00:00:00Z`),
    changeFrequency: "monthly" as const,
    priority: locale === "es" ? 0.8 : 0.6,
    alternates: { languages },
  }));
}
