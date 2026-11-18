import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

import { DECIMALS, RENT_LOCALES, elDay, euros, indexOfMonth, monthText, pct, rentEditions, type RentLocale } from "./copy";
import { RENT_SNAPSHOT } from "./data";
import { computeRentUpdate, defaultExample, type OkResult, type RentSeries } from "./engine";
import { latestPoint, publishedPoints, type MonthPoint } from "./ine";
import { FIRST_UPDATE, LAST_UPDATE, RDL_26_2026_DAY, RDL_29_2026_FROM, df6Decree } from "./rules";

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

/**
 * The answer-first lead, from this render's figures; null when today's
 * update cannot be worked out (and on 1 Oct 2026, the one day of RDL
 * 26/2026, which the lead does not word). From 8 Oct 2026 to 31 Dec 2027 it
 * says the 2 % of RDL 29/2026 DF 6ª when that binds, and names it when the
 * IRAV is lower.
 */
export function leadText(locale: RentLocale, series: RentSeries, today: string): string | null {
  if (today < FIRST_UPDATE || today > LAST_UPDATE || today === RDL_26_2026_DAY) return null;
  const { flat, shop } = workedExamples(series, today);
  const cap = flat?.caps.find((c) => c.kind === "irav")?.index ?? null;
  if (!flat || !cap || cap.series !== "irav") return null;
  const every = today >= RDL_29_2026_FROM;
  const df6 = df6Decree(today) === "rdl29";
  const two = df6 && flat.binding?.kind === "two";
  const iravV = pct(cap.value, DECIMALS.irav, locale);
  const capText = `${indexOfMonth("irav", cap.month, locale)}: ${iravV}`;
  const rent = euros(1000, locale);
  const next = euros(flat.newRent, locale);
  const shopText = shop?.agreed.source ? pct(shop.agreed.source.value, DECIMALS.ipc, locale) : null;
  return L(locale, {
    es: [
      two
        ? `Si tu contrato de alquiler de vivienda se actualiza hoy, ${elDay(today, "es")}, la subida máxima sin un nuevo pacto con el casero es del 2 %: el tope del Real Decreto-ley 29/2026 hasta el 31 de diciembre de 2027, más bajo que ${indexOfMonth("irav", cap.month, "es")} (${iravV}), el último que ha publicado el INE (${elDay(cap.published, "es")}). Una renta de ${rent} pasa a ${next} al mes, y no sube nada si ya supera el índice de referencia del Ministerio.`
        : `Si tu contrato de alquiler de vivienda se actualiza hoy, ${elDay(today, "es")}, la subida máxima es ${capText}, el último que ha publicado el INE (${elDay(cap.published, "es")}). Una renta de ${rent} pasa a ${next} al mes.`,
      df6 && !two ? "Hasta el 31 de diciembre de 2027 tampoco puede pasar del 2 % sin un nuevo pacto, ni subir si la renta supera el índice de referencia del Ministerio (Real Decreto-ley 29/2026)." : "",
      every
        ? `Desde el 8 de octubre de 2026 ${df6 ? "estos límites valen" : "este límite vale"} para todos los contratos de vivienda, también los firmados antes del 26 de mayo de 2023 (Real Decreto-ley 29/2026, convalidado por el Congreso el 12 de noviembre de 2026).`
        : "Este límite vale para los contratos de vivienda firmados desde el 26 de mayo de 2023.",
      shopText ? `En un local de negocio no hay límite legal: si el contrato dice IPC, se aplica entero (${shopText}).` : "",
    ]
      .filter(Boolean)
      .join(" "),
    ca: [
      two
        ? `Si el teu contracte de lloguer d'habitatge s'actualitza avui, ${elDay(today, "ca")}, la pujada màxima sense un nou pacte amb el propietari és del 2 %: el topall del Reial decret llei 29/2026 fins al 31 de desembre de 2027, més baix que ${indexOfMonth("irav", cap.month, "ca")} (${iravV}), l'últim que ha publicat l'INE (${elDay(cap.published, "ca")}). Una renda de ${rent} passa a ${next} al mes, i no puja gens si ja supera l'índex de referència del Ministeri.`
        : `Si el teu contracte de lloguer d'habitatge s'actualitza avui, ${elDay(today, "ca")}, la pujada màxima és ${capText}, l'últim que ha publicat l'INE (${elDay(cap.published, "ca")}). Una renda de ${rent} passa a ${next} al mes.`,
      df6 && !two ? "Fins al 31 de desembre de 2027 tampoc no pot passar del 2 % sense un nou pacte, ni pujar si la renda supera l'índex de referència del Ministeri (Reial decret llei 29/2026)." : "",
      every
        ? `Des del 8 d'octubre de 2026 ${df6 ? "aquests límits valen" : "aquest límit val"} per a tots els contractes d'habitatge, també els signats abans del 26 de maig de 2023 (Reial decret llei 29/2026, convalidat pel Congrés el 12 de novembre de 2026).`
        : "Aquest límit val per als contractes d'habitatge signats des del 26 de maig de 2023.",
      shopText ? `En un local de negoci no hi ha límit legal: si el contracte diu IPC, s'aplica sencer (${shopText}).` : "",
    ]
      .filter(Boolean)
      .join(" "),
    en: [
      two
        ? `If your housing lease is updated today, ${dayOnly(today)}, the most the rent can rise without a new agreement with the landlord is 2%: the cap of Royal Decree-law 29/2026 until 31 December 2027, lower than ${indexOfMonth("irav", cap.month, "en")} (${iravV}), the latest figure the INE has released (${elDay(cap.published, "en")}). A rent of ${rent} becomes ${next} a month, and it does not rise at all if it is already above the Ministry's reference index.`
        : `If your housing lease is updated today, ${dayOnly(today)}, the most the rent can rise is ${capText}, the latest figure the INE has released (${elDay(cap.published, "en")}). A rent of ${rent} becomes ${next} a month.`,
      df6 && !two ? "Until 31 December 2027 it also cannot exceed 2% without a new agreement, nor rise at all if the rent is above the Ministry's reference index (Royal Decree-law 29/2026)." : "",
      every
        ? `Since 8 October 2026 ${df6 ? "these caps apply" : "this cap applies"} to every housing lease, including those signed before 26 May 2023 (Royal Decree-law 29/2026, validated by the Spanish Congress on 12 November 2026).`
        : "This cap applies to housing leases signed from 26 May 2023.",
      shopText ? `A shop or office lease has no legal cap: if the contract says CPI, the full CPI applies (${shopText}).` : "",
    ]
      .filter(Boolean)
      .join(" "),
  });
}

/** Questions and answers of the page (and its FAQPage JSON-LD): the 2 % cap of RDL 29/2026 DF 6ª and its edges. */
export function rentFaq(locale: RentLocale): { q: string; a: string }[] {
  return L(locale, {
    es: [
      {
        q: "¿Cuánto me pueden subir el alquiler hasta el 31 de diciembre de 2027?",
        a: "Si el contrato de vivienda cumple su anualidad entre el 8 de octubre de 2026 y el 31 de diciembre de 2027, sin un nuevo pacto entre casero e inquilino la subida no puede pasar del 2 % (ni del IRAV, si es más bajo), y si la renta supera el límite del índice de referencia del Ministerio no sube nada. Es la disposición final sexta del Real Decreto-ley 29/2026, convalidado por el Congreso el 12 de noviembre de 2026.",
      },
      {
        q: "¿El tope del 2 % vale para contratos firmados antes de 2023?",
        a: "Sí. La norma habla de cualquier «contrato de alquiler de vivienda sujeto a la Ley 29/1994» cuya renta deba actualizarse en ese periodo, sin mirar la fecha de firma. Cuenta el día en que se cumple el año de contrato.",
      },
      {
        q: "¿Cambia algo si el casero es gran tenedor o un pequeño propietario?",
        a: "No. A diferencia de los topes de 2023 y 2024 (Real Decreto-ley 6/2022, art. 46), la disposición final sexta del Real Decreto-ley 29/2026 no distingue entre grandes tenedores y pequeños propietarios.",
      },
      {
        q: "¿Puede el casero subir más del 2 %?",
        a: "Solo con un nuevo pacto entre las dos partes: la norma dice que «el incremento de la renta será el que resulte del nuevo pacto entre las partes» y que, sin él, no podrá ser superior al dos por ciento. El art. 18.1 de la LAU sigue diciendo que «en todo caso» la subida no puede pasar del IRAV. Si la renta supera el índice de referencia, no procede ninguna subida.",
      },
      {
        q: "¿Y en un local de negocio?",
        a: "No: la disposición final sexta solo habla de contratos de alquiler de vivienda. En un local o en otro uso distinto de vivienda manda lo que diga el contrato (art. 4.3 LAU).",
      },
    ],
    ca: [
      {
        q: "Quant em poden apujar el lloguer fins al 31 de desembre de 2027?",
        a: "Si el contracte d'habitatge compleix l'anualitat entre el 8 d'octubre de 2026 i el 31 de desembre de 2027, sense un nou pacte entre propietari i inquilí la pujada no pot passar del 2 % (ni de l'IRAV, si és més baix), i si la renda supera el límit de l'índex de referència del Ministeri no puja gens. És la disposició final sisena del Reial decret llei 29/2026, convalidat pel Congrés el 12 de novembre de 2026.",
      },
      {
        q: "El topall del 2 % val per als contractes signats abans del 2023?",
        a: "Sí. La norma parla de qualsevol «contrato de alquiler de vivienda sujeto a la Ley 29/1994» la renda del qual s'hagi d'actualitzar en aquest període, sense mirar la data de signatura. Compta el dia que es compleix l'any de contracte.",
      },
      {
        q: "Canvia res si el propietari és gran tenidor o un petit propietari?",
        a: "No. A diferència dels topalls del 2023 i el 2024 (Reial decret llei 6/2022, art. 46), la disposició final sisena del Reial decret llei 29/2026 no distingeix entre grans tenidors i petits propietaris.",
      },
      {
        q: "Pot el propietari apujar més del 2 %?",
        a: "Només amb un nou pacte entre les dues parts: la norma diu que «el incremento de la renta será el que resulte del nuevo pacto entre las partes» i que, sense, no podrà ser superior al dos per cent. L'art. 18.1 de la LAU continua dient que «en todo caso» la pujada no pot passar de l'IRAV. Si la renda supera l'índex de referència, no hi ha cap pujada.",
      },
      {
        q: "I en un local de negoci?",
        a: "No: la disposició final sisena només parla de contractes de lloguer d'habitatge. En un local o en un altre ús diferent d'habitatge mana el que digui el contracte (art. 4.3 LAU).",
      },
    ],
    en: [
      {
        q: "How much can my rent go up until 31 December 2027?",
        a: "If the housing lease completes a year between 8 October 2026 and 31 December 2027, without a new agreement between landlord and tenant the increase cannot exceed 2% (nor the IRAV, if lower), and if the rent is above the limit of the Ministry's reference index it does not rise at all. This is the sixth final provision of Royal Decree-law 29/2026, validated by the Spanish Congress on 12 November 2026.",
      },
      {
        q: "Does the 2% cap apply to leases signed before 2023?",
        a: "Yes. The rule covers any “contrato de alquiler de vivienda sujeto a la Ley 29/1994” (housing lease under the Urban Leases Act) whose rent is due to be updated in that period, whatever the signing date. What counts is the day the year of the lease is completed.",
      },
      {
        q: "Does it matter whether the landlord is a large landlord or a small one?",
        a: "No. Unlike the 2023 and 2024 caps (Royal Decree-law 6/2022, art. 46), the sixth final provision of Royal Decree-law 29/2026 does not distinguish large landlords (grandes tenedores) from small ones.",
      },
      {
        q: "Can the landlord raise the rent by more than 2%?",
        a: "Only through a new agreement between both parties: the rule says the increase “será el que resulte del nuevo pacto entre las partes” and that, without one, it cannot be above two per cent. LAU art. 18.1 still says that “en todo caso” (in any case) the increase cannot exceed the IRAV. If the rent is above the reference index, no increase applies.",
      },
      {
        q: "And for a shop or office?",
        a: "No: the sixth final provision only covers housing leases. For a shop or any other non-housing use the contract decides (LAU art. 4.3).",
      },
    ],
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
