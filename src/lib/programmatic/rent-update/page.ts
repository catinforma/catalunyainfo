import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

import { DECIMALS, RENT_LOCALES, elDay, euros, indexOfMonth, monthText, pct, rentEditions, type RentLocale } from "./copy";
import { RENT_SNAPSHOT } from "./data";
import { computeRentUpdate, defaultExample, type OkResult, type RentSeries } from "./engine";
import { latestPoint, publishedPoints, type MonthPoint } from "./ine";
import { FIRST_UPDATE, LAST_UPDATE, RDL_29_2026_FROM } from "./rules";

/**
 * The words of the rent-update page that depend on the INE's figures:
 * title, description, the answer-first lead and the 12-month table, all
 * computed from the series of this render (live or snapshot). Pure: the
 * tests run it on the committed snapshot.
 */

const L = <T>(locale: RentLocale, v: Record<RentLocale, T>): T => v[locale];

/** The newest month both series have published (they come out the same morning). */
export function latestShared(series: RentSeries): { month: string; ipc: MonthPoint; irav: MonthPoint } | null {
  const irav = latestPoint(series.irav);
  if (!irav) return null;
  const ipc = series.ipc.points.find((p) => p.month === irav.month && p.value !== null);
  return ipc ? { month: irav.month, ipc, irav } : null;
}

export function rentMeta(locale: RentLocale, series: RentSeries): { title: string; description: string; h1: string; breadcrumb: string } {
  const last = latestShared(series);
  const iravV = last ? pct(last.irav.value!, DECIMALS.irav, locale) : "";
  const ipcV = last ? pct(last.ipc.value!, DECIMALS.ipc, locale) : "";
  const m = last ? monthText(last.month, locale) : "";
  const mName = m.replace(/ (de )?\d{4}$/, "");
  return L(locale, {
    es: {
      title: last ? `Actualizar el alquiler: IRAV ${iravV} e IPC ${ipcV} de ${mName}` : "Actualizar el alquiler con el IRAV y el IPC",
      description: `Calcula cuánto te pueden subir el alquiler${last ? ` con el IRAV y el IPC de ${m} (INE)` : ""}: límite legal para contratos anteriores y posteriores al 26 de mayo de 2023, locales de negocio y la base legal en el BOE.`,
      h1: "Actualizar el alquiler: cuánto te pueden subir la renta",
      breadcrumb: "Actualizar el alquiler",
    },
    ca: {
      title: last ? `Actualitzar el lloguer: IRAV ${iravV} i IPC ${ipcV} ${mName.match(/^[aeiou]/i) ? "d'" : "de "}${mName}` : "Actualitzar el lloguer amb l'IRAV i l'IPC",
      description: `Calcula quant et poden apujar el lloguer${last ? ` amb l'IRAV i l'IPC ${m.match(/^[aeiou]/i) ? "d'" : "de "}${m} (INE)` : ""}: límit legal per a contractes anteriors i posteriors al 26 de maig de 2023, locals de negoci i la base legal al BOE.`,
      h1: "Actualitzar el lloguer: quant et poden apujar la renda",
      breadcrumb: "Actualitzar el lloguer",
    },
    en: {
      title: last ? `Rent increase in Spain: IRAV ${iravV} and CPI ${ipcV} for ${mName}` : "Rent increase in Spain: IRAV and CPI calculator",
      description: `How much your landlord can raise the rent in Spain${last ? `, with the INE's IRAV and CPI for ${m}` : ""}: the legal cap for contracts signed before and after 26 May 2023, commercial leases, and the law in the BOE.`,
      h1: "Rent increase in Spain: how much can your rent go up?",
      breadcrumb: "Rent increase calculator",
    },
  });
}

/** The page's two worked examples on `today`: a flat on the IRAV, and a shop on the IPC. */
export function workedExamples(series: RentSeries, today: string): { flat: OkResult | null; shop: OkResult | null } {
  const input = defaultExample(today);
  const flat = computeRentUpdate(input, series);
  const shop = computeRentUpdate({ ...input, index: "ipc", use: "commercial" }, series);
  return { flat: flat.status === "ok" ? flat : null, shop: shop.status === "ok" ? shop : null };
}

/** The answer-first lead, from this render's figures; null when today's update cannot be worked out. */
export function leadText(locale: RentLocale, series: RentSeries, today: string): string | null {
  if (today < FIRST_UPDATE || today > LAST_UPDATE) return null;
  const { flat, shop } = workedExamples(series, today);
  const cap = flat?.binding?.index ?? flat?.caps.find((c) => c.kind === "irav")?.index ?? null;
  if (!flat || !cap || cap.series !== "irav") return null;
  const every = today >= RDL_29_2026_FROM;
  const capText = `${indexOfMonth("irav", cap.month, locale)}: ${pct(cap.value, DECIMALS.irav, locale)}`;
  const rent = euros(1000, locale);
  const next = euros(flat.newRent, locale);
  const shopText = shop?.agreed.source ? pct(shop.agreed.source.value, DECIMALS.ipc, locale) : null;
  return L(locale, {
    es: [
      `Si tu contrato de alquiler de vivienda se actualiza hoy, ${elDay(today, "es")}, la subida máxima es ${capText}, el último que ha publicado el INE (${elDay(cap.published, "es")}). Una renta de ${rent} pasa a ${next} al mes.`,
      every
        ? "Desde el 8 de octubre de 2026 este límite vale para todos los contratos de vivienda, también los firmados antes del 26 de mayo de 2023 (Real Decreto-ley 29/2026, convalidado por el Congreso el 12 de noviembre de 2026)."
        : "Este límite vale para los contratos de vivienda firmados desde el 26 de mayo de 2023.",
      shopText ? `En un local de negocio no hay límite legal: si el contrato dice IPC, se aplica entero (${shopText}).` : "",
    ]
      .filter(Boolean)
      .join(" "),
    ca: [
      `Si el teu contracte de lloguer d'habitatge s'actualitza avui, ${elDay(today, "ca")}, la pujada màxima és ${capText}, l'últim que ha publicat l'INE (${elDay(cap.published, "ca")}). Una renda de ${rent} passa a ${next} al mes.`,
      every
        ? "Des del 8 d'octubre de 2026 aquest límit val per a tots els contractes d'habitatge, també els signats abans del 26 de maig de 2023 (Reial decret llei 29/2026, convalidat pel Congrés el 12 de novembre de 2026)."
        : "Aquest límit val per als contractes d'habitatge signats des del 26 de maig de 2023.",
      shopText ? `En un local de negoci no hi ha límit legal: si el contracte diu IPC, s'aplica sencer (${shopText}).` : "",
    ]
      .filter(Boolean)
      .join(" "),
    en: [
      `If your housing lease is updated today, ${dayOnly(today)}, the most the rent can rise is ${capText}, the latest figure the INE has released (${elDay(cap.published, "en")}). A rent of ${rent} becomes ${next} a month.`,
      every
        ? "Since 8 October 2026 this cap applies to every housing lease, including those signed before 26 May 2023 (Royal Decree-law 29/2026, validated by the Spanish Congress on 12 November 2026)."
        : "This cap applies to housing leases signed from 26 May 2023.",
      shopText ? `A shop or office lease has no legal cap: if the contract says CPI, the full CPI applies (${shopText}).` : "",
    ]
      .filter(Boolean)
      .join(" "),
  });
}

function dayOnly(iso: string): string {
  return elDay(iso, "en").replace(/^on /, "");
}

export interface TableRow {
  month: string;
  ipc: number | null;
  irav: number | null;
  published: string | null;
}

/** The last `n` months the INE has published, newest first (IPC and IRAV side by side). */
export function lastMonths(series: RentSeries, n = 12): TableRow[] {
  const months = publishedPoints(series.irav)
    .map((p) => p.month)
    .concat(publishedPoints(series.ipc).map((p) => p.month));
  const unique = [...new Set(months)].sort().reverse().slice(0, n);
  const value = (pts: MonthPoint[], m: string) => pts.find((p) => p.month === m)?.value ?? null;
  return unique.map((month) => ({
    month,
    ipc: value(series.ipc.points, month),
    irav: value(series.irav.points, month),
    published: series.irav.points.find((p) => p.month === month)?.published ?? series.ipc.points.find((p) => p.month === month)?.published ?? null,
  }));
}

/** The next release the INE's calendar lists for the IRAV (null when none is listed). */
export function nextRelease(series: RentSeries): MonthPoint | null {
  return series.irav.points.find((p) => p.value === null && p.published !== null) ?? null;
}

/** Sitemap: the three editions, last modified on the newest INE release in the snapshot. */
export function rentSitemapEntries(): MetadataRoute.Sitemap {
  const e = rentEditions();
  const last = latestPoint(RENT_SNAPSHOT.series.irav)?.published ?? RENT_SNAPSHOT.asOf;
  // x-default = the English edition, as buildAlternates (lib/seo/metadata.ts) says in the page head.
  const languages = { es: absoluteUrl(e.es), ca: absoluteUrl(e.ca), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
  return RENT_LOCALES.map((locale) => ({
    url: absoluteUrl(e[locale]),
    lastModified: new Date(`${last}T00:00:00Z`),
    changeFrequency: "weekly" as const,
    priority: locale === "es" ? 0.8 : 0.6,
    alternates: { languages },
  }));
}
