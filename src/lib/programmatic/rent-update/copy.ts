import { MONTHS, caDayArticle, dayMonthYear, type DateLocale } from "@/lib/programmatic/holidays/format";

import type { AgreedIndex, Cap, NoteId, PendingResult } from "./engine";
import type { SeriesId } from "./ine";


/**
 * Paths and words of the rent-update calculator, small enough for the
 * browser (the client component imports this file, never data.ts or
 * server.ts).
 *
 *   /es/calculadoras/actualizar-alquiler/
 *   /ca/calculadores/actualitzar-lloguer/
 *   /en/calculators/rent-increase-spain/
 *
 * Static folders under each language's calculators folder, beside the
 * other calculators; there is deliberately no calculators hub page.
 */

export type RentLocale = DateLocale;
export const RENT_LOCALES: readonly RentLocale[] = ["es", "ca", "en"];

const FOLDER: Record<RentLocale, string> = { es: "calculadoras", ca: "calculadores", en: "calculators" };
export const RENT_SLUG: Record<RentLocale, string> = { es: "actualizar-alquiler", ca: "actualitzar-lloguer", en: "rent-increase-spain" };

export function rentPath(locale: RentLocale): string {
  return `/${locale}/${FOLDER[locale]}/${RENT_SLUG[locale]}/`;
}

export function rentEditions(): Record<RentLocale, string> {
  return { es: rentPath("es"), ca: rentPath("ca"), en: rentPath("en") };
}

/* -------------------------------------------------------------------------- */
/* Numbers and months                                                         */
/* -------------------------------------------------------------------------- */

/** Decimals the INE prints each series with. */
export const DECIMALS: Record<SeriesId, number> = { ipc: 1, irav: 2, igc: 2 };

function group(int: string, sep: string): string {
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

/** "2,57", "2.57", "-0,3"; fixed decimals, no locale data (same output in Node and every browser). */
export function num(n: number, decimals: number, locale: RentLocale): string {
  const fixed = Math.abs(n).toFixed(decimals);
  const [int = "0", frac] = fixed.split(".");
  const sign = n < 0 && Number(fixed) !== 0 ? "−" : "";
  const g = group(int, locale === "en" ? "," : ".");
  return `${sign}${g}${frac ? (locale === "en" ? "." : ",") + frac : ""}`;
}

/** "2,57 %" / "2.57%". */
export function pct(n: number, decimals: number, locale: RentLocale): string {
  return locale === "en" ? `${num(n, decimals, locale)}%` : `${num(n, decimals, locale)} %`;
}

/** "1.025,70 €" / "€1,025.70". */
export function euros(n: number, locale: RentLocale): string {
  if (locale === "en") return `${n < 0 ? "−" : ""}€${num(Math.abs(n), 2, locale)}`;
  return `${num(n, 2, locale)} €`;
}

/** Decimals of a typed fixed percentage (0 to 2). */
export function decimalsOf(n: number): number {
  const s = String(n);
  const i = s.indexOf(".");
  return i < 0 ? 0 : Math.min(2, s.length - i - 1);
}

/** "octubre de 2026" / "d'octubre de 2026" is left to the caller; this is "octubre de 2026", "October 2026". */
export function monthText(month: string, locale: RentLocale): string {
  const [y, m] = month.split("-").map(Number) as [number, number];
  const name = MONTHS[locale][m - 1] ?? "";
  return locale === "en" ? `${name} ${y}` : `${name} de ${y}`;
}

/** Catalan "de"/"d'" before a month: "d'octubre de 2026", "de novembre de 2026". */
export function caOfMonth(month: string): string {
  const t = monthText(month, "ca");
  return /^[aeiouàèéíòóú]/i.test(t) ? `d'${t}` : `de ${t}`;
}

/** "el IRAV de octubre de 2026" / "l'IRAV d'octubre de 2026" / "the IRAV for October 2026". */
export function indexOfMonth(series: SeriesId, month: string, locale: RentLocale): string {
  const name = SERIES_NAME[locale][series];
  if (locale === "ca") return `${name} ${caOfMonth(month)}`;
  if (locale === "es") return `${name} de ${monthText(month, "es")}`;
  return `${name} for ${monthText(month, "en")}`;
}

/** "el 13 de noviembre de 2026", "l'1 de gener de 2026", "on 13 November 2026". */
export function elDay(iso: string, locale: RentLocale): string {
  const d = dayMonthYear(iso, locale);
  if (locale === "ca") return `${caDayArticle(iso)}${d}`;
  return locale === "es" ? `el ${d}` : `on ${d}`;
}

export function dayText(iso: string, locale: RentLocale): string {
  return dayMonthYear(iso, locale);
}

/* -------------------------------------------------------------------------- */
/* Words                                                                      */
/* -------------------------------------------------------------------------- */

/** Short names, with the article where the language puts one. */
export const SERIES_NAME: Record<RentLocale, Record<SeriesId, string>> = {
  es: { ipc: "el IPC", irav: "el IRAV", igc: "el IGC" },
  ca: { ipc: "l'IPC", irav: "l'IRAV", igc: "l'IGC" },
  en: { ipc: "the CPI (IPC)", irav: "the IRAV", igc: "the IGC" },
};

/** Bare labels for tables and options. */
export const SERIES_LABEL: Record<RentLocale, Record<SeriesId, string>> = {
  es: { ipc: "IPC general (variación anual)", irav: "IRAV", igc: "IGC" },
  ca: { ipc: "IPC general (variació anual)", irav: "IRAV", igc: "IGC" },
  en: { ipc: "CPI, all items (annual change)", irav: "IRAV", igc: "IGC" },
};


export interface CalcCopy {
  title: string;
  intro: string;
  noscript: string;
  rent: string;
  use: string;
  useOptions: Record<"housing" | "commercial", string>;
  signed: string;
  updateMonth: string;
  updateYear: string;
  updateHint: (day: string) => string;
  index: string;
  indexOptions: Record<AgreedIndex, string>;
  fixed: string;
  newRent: string;
  change: string;
  monthly: string;
  yearly: string;
  agreedLine: (what: string, value: string, published: string) => string;
  fixedLine: (value: string) => string;
  capLine: (cap: Cap, locale: RentLocale) => string;
  capBinds: string;
  capDoesNotBind: string;
  iravIsCap: string;
  noCap: string;
  basis: string;
  pending: (p: PendingResult, latest: string | null) => string;
  invalid: Record<"rent" | "dates" | "order" | "fixed", string>;
  outOfRange: (first: string, last: string) => string;
  notes: Record<NoteId, string>;
  sourceLink: string;
}

const CAP_ES = (c: Cap, l: RentLocale): string => {
  const v = pct(c.percent, c.index ? DECIMALS[c.index.series] : 0, l);
  switch (c.kind) {
    case "irav":
      return `Límite legal: ${indexOfMonth("irav", c.index!.month, l)}, ${v} (publicado ${elDay(c.index!.published, l)}).`;
    case "ipc":
      return `Límite legal: ${indexOfMonth("ipc", c.index!.month, l)}, ${v} (art. 18.1 en la redacción del Real Decreto-ley 7/2019).`;
    case "igc":
      return `Límite legal en 2023: ${indexOfMonth("igc", c.index!.month, l)} (${pct(c.raw!, 2, l)}; la Ley 2/2015 lo deja entre el 0 y el 2 %): ${v}.`;
    case "three":
      return `Límite legal en 2024: ${v} (Real Decreto-ley 6/2022, art. 46).`;
    case "rdl8":
      return `Límite extraordinario del 22 de marzo al 29 de abril de 2026: ${v} (Real Decreto-ley 8/2026, derogado).`;
  }
};

const CAP_CA = (c: Cap, l: RentLocale): string => {
  const v = pct(c.percent, c.index ? DECIMALS[c.index.series] : 0, l);
  switch (c.kind) {
    case "irav":
      return `Límit legal: ${indexOfMonth("irav", c.index!.month, l)}, ${v} (publicat ${elDay(c.index!.published, l)}).`;
    case "ipc":
      return `Límit legal: ${indexOfMonth("ipc", c.index!.month, l)}, ${v} (art. 18.1 en la redacció del Reial decret llei 7/2019).`;
    case "igc":
      return `Límit legal el 2023: ${indexOfMonth("igc", c.index!.month, l)} (${pct(c.raw!, 2, l)}; la Llei 2/2015 el deixa entre el 0 i el 2 %): ${v}.`;
    case "three":
      return `Límit legal el 2024: ${v} (Reial decret llei 6/2022, art. 46).`;
    case "rdl8":
      return `Límit extraordinari del 22 de març al 29 d'abril de 2026: ${v} (Reial decret llei 8/2026, derogat).`;
  }
};

const CAP_EN = (c: Cap, l: RentLocale): string => {
  const v = pct(c.percent, c.index ? DECIMALS[c.index.series] : 0, l);
  switch (c.kind) {
    case "irav":
      return `Legal cap: ${indexOfMonth("irav", c.index!.month, l)}, ${v} (released ${dayText(c.index!.published, l)}).`;
    case "ipc":
      return `Legal cap: ${indexOfMonth("ipc", c.index!.month, l)}, ${v} (art. 18.1 as worded by Royal Decree-law 7/2019).`;
    case "igc":
      return `Legal cap in 2023: ${indexOfMonth("igc", c.index!.month, l)} (${pct(c.raw!, 2, l)}; Law 2/2015 keeps it between 0 and 2%): ${v}.`;
    case "three":
      return `Legal cap in 2024: ${v} (Royal Decree-law 6/2022, art. 46).`;
    case "rdl8":
      return `Emergency cap from 22 March to 29 April 2026: ${v} (Royal Decree-law 8/2026, since repealed).`;
  }
};

export const CALC_COPY: Record<RentLocale, CalcCopy> = {
  es: {
    title: "Calcula tu actualización",
    intro: "Con los datos oficiales del INE y las normas del BOE. El ejemplo de abajo ya está calculado: cambia los datos de tu contrato.",
    noscript: "Sin JavaScript ves el ejemplo calculado. La tabla de debajo tiene los índices de cada mes para hacer la cuenta a mano.",
    rent: "Renta actual al mes",
    use: "Tipo de alquiler",
    useOptions: { housing: "Vivienda", commercial: "Local de negocio u otro uso" },
    signed: "Fecha de firma del contrato",
    updateMonth: "Mes de la actualización",
    updateYear: "Año",
    updateHint: (day) => `La actualización se hace el día en que se cumple cada año de contrato: aquí, ${day}.`,
    index: "Índice pactado en el contrato",
    indexOptions: { irav: "IRAV (índice de referencia del INE)", ipc: "IPC", fixed: "Porcentaje fijo pactado" },
    fixed: "Porcentaje pactado",
    newRent: "Nueva renta al mes",
    change: "Subida aplicada",
    monthly: "Diferencia al mes",
    yearly: "Diferencia en 12 meses",
    agreedLine: (what, value, published) => `Índice del contrato: ${what}, ${value} (INE, publicado ${published}).`,
    fixedLine: (value) => `Índice del contrato: un ${value} fijo.`,
    capLine: CAP_ES,
    capBinds: "Como el índice del contrato es más alto, se aplica el límite.",
    capDoesNotBind: "El índice del contrato no pasa del límite: se aplica tal cual.",
    iravIsCap: "El IRAV del contrato es también el límite legal: se aplica tal cual.",
    noCap: "Ningún límite legal se aplica a este caso: manda lo que diga el contrato.",
    basis: "Base legal",
    pending: (p, latest) => {
      const next = p.month && p.published ? `Te corresponde ${indexOfMonth(p.series, p.month, "es")}, que el INE publicará ${elDay(p.published, "es")}.` : "";
      if (p.reason === "before-series") return `En esa fecha el INE aún no publicaba ${SERIES_NAME.es[p.series]} (el primer dato salió ${p.published ? elDay(p.published, "es") : "—"}).`;
      if (p.reason === "scheduled") return `${next} Hasta entonces no se puede saber la subida.${latest ? ` Último dato publicado: ${latest}.` : ""}`;
      return `El INE aún no ha fijado en su calendario el dato que corresponderá a esa fecha.${latest ? ` Último dato publicado: ${latest}.` : ""}`;
    },
    invalid: {
      rent: "Escribe la renta mensual en euros.",
      dates: "Revisa las fechas.",
      order: "La actualización tiene que ser al menos un año después de la firma.",
      fixed: "Escribe el porcentaje pactado (por ejemplo, 3).",
    },
    outOfRange: (first, last) => `La calculadora cubre actualizaciones entre ${elDay(first, "es")} y ${elDay(last, "es")}.`,
    notes: {
      notify:
        "La renta actualizada se paga a partir del mes siguiente a la notificación por escrito, que debe indicar el porcentaje aplicado (vale una nota en el recibo del mes anterior). Puedes pedir el certificado del INE (art. 18.2 LAU).",
      releaseDay: "El INE publicó un dato nuevo el mismo día de la actualización (a las 9:00). Comprueba con tu contrato qué día exacto se cumple.",
      noLegalCap:
        "Contrato de vivienda firmado antes del 6 de marzo de 2019: en esa fecha ningún límite legal se aplicaba a la actualización, salvo lo que diga el contrato.",
      commercial: "En un local de negocio o un alquiler de uso distinto de vivienda manda lo pactado (art. 4.3 LAU): los límites del IRAV, del 2 % y del 3 % no se aplican.",
      negotiable:
        "Si el arrendador no es gran tenedor, la norma le permite pactar con el inquilino otra subida; sin ese nuevo pacto, el máximo es el límite. Si es gran tenedor, el límite se aplica siempre.",
      decreeEdge: "La fecha está a pocos días de la entrada en vigor o la derogación de un real decreto-ley: conviene confirmarlo con un profesional.",
      firstIrav: "El 1 de enero de 2025 el INE aún no había publicado el primer IRAV (salió el 2 de enero): ese día el límite era el IPC.",
      negative: "El índice bajó: si la cláusula del contrato lo prevé, la renta baja en la misma proporción.",
    },
    sourceLink: "Ver la serie en el INE",
  },
  ca: {
    title: "Calcula la teva actualització",
    intro: "Amb les dades oficials de l'INE i les normes del BOE. L'exemple de sota ja està calculat: canvia les dades del teu contracte.",
    noscript: "Sense JavaScript veus l'exemple calculat. La taula de sota té els índexs de cada mes per fer el càlcul a mà.",
    rent: "Renda actual al mes",
    use: "Tipus de lloguer",
    useOptions: { housing: "Habitatge", commercial: "Local de negoci o un altre ús" },
    signed: "Data de signatura del contracte",
    updateMonth: "Mes de l'actualització",
    updateYear: "Any",
    updateHint: (day) => `L'actualització es fa el dia que es compleix cada any de contracte: aquí, ${day}.`,
    index: "Índex pactat al contracte",
    indexOptions: { irav: "IRAV (índex de referència de l'INE)", ipc: "IPC", fixed: "Percentatge fix pactat" },
    fixed: "Percentatge pactat",
    newRent: "Nova renda al mes",
    change: "Pujada aplicada",
    monthly: "Diferència al mes",
    yearly: "Diferència en 12 mesos",
    agreedLine: (what, value, published) => `Índex del contracte: ${what}, ${value} (INE, publicat ${published}).`,
    fixedLine: (value) => `Índex del contracte: un ${value} fix.`,
    capLine: CAP_CA,
    capBinds: "Com que l'índex del contracte és més alt, s'aplica el límit.",
    capDoesNotBind: "L'índex del contracte no passa del límit: s'aplica tal qual.",
    iravIsCap: "L'IRAV del contracte és també el límit legal: s'aplica tal qual.",
    noCap: "Cap límit legal no s'aplica en aquest cas: mana el que digui el contracte.",
    basis: "Base legal",
    pending: (p, latest) => {
      const next = p.month && p.published ? `Et correspon ${indexOfMonth(p.series, p.month, "ca")}, que l'INE publicarà ${elDay(p.published, "ca")}.` : "";
      if (p.reason === "before-series") return `En aquella data l'INE encara no publicava ${SERIES_NAME.ca[p.series]} (la primera dada va sortir ${p.published ? elDay(p.published, "ca") : "—"}).`;
      if (p.reason === "scheduled") return `${next} Fins aleshores no es pot saber la pujada.${latest ? ` Última dada publicada: ${latest}.` : ""}`;
      return `L'INE encara no ha fixat al seu calendari la dada que correspondrà a aquella data.${latest ? ` Última dada publicada: ${latest}.` : ""}`;
    },
    invalid: {
      rent: "Escriu la renda mensual en euros.",
      dates: "Revisa les dates.",
      order: "L'actualització ha de ser com a mínim un any després de la signatura.",
      fixed: "Escriu el percentatge pactat (per exemple, 3).",
    },
    outOfRange: (first, last) => `La calculadora cobreix actualitzacions entre ${elDay(first, "ca")} i ${elDay(last, "ca")}.`,
    notes: {
      notify:
        "La renda actualitzada es paga a partir del mes següent a la notificació per escrit, que ha d'indicar el percentatge aplicat (val una nota al rebut del mes anterior). Pots demanar el certificat de l'INE (art. 18.2 LAU).",
      releaseDay: "L'INE va publicar una dada nova el mateix dia de l'actualització (a les 9.00). Comprova al contracte quin dia exacte es compleix.",
      noLegalCap:
        "Contracte d'habitatge signat abans del 6 de març de 2019: en aquella data cap límit legal no s'aplicava a l'actualització, més enllà del que digui el contracte.",
      commercial: "En un local de negoci o un lloguer d'ús diferent d'habitatge mana el que s'ha pactat (art. 4.3 LAU): els límits de l'IRAV, del 2 % i del 3 % no s'hi apliquen.",
      negotiable:
        "Si l'arrendador no és gran tenidor, la norma li permet pactar amb l'inquilí una altra pujada; sense aquest nou pacte, el màxim és el límit. Si és gran tenidor, el límit s'aplica sempre.",
      decreeEdge: "La data és a pocs dies de l'entrada en vigor o la derogació d'un reial decret llei: val la pena confirmar-ho amb un professional.",
      firstIrav: "L'1 de gener de 2025 l'INE encara no havia publicat el primer IRAV (va sortir el 2 de gener): aquell dia el límit era l'IPC.",
      negative: "L'índex va baixar: si la clàusula del contracte ho preveu, la renda baixa en la mateixa proporció.",
    },
    sourceLink: "Veure la sèrie a l'INE",
  },
  en: {
    title: "Work out your rent update",
    intro: "With the INE's official figures and the rules in the BOE. The example below is already worked out: change it to your contract's details.",
    noscript: "Without JavaScript you see the worked example. The table below has each month's index to do the sum by hand.",
    rent: "Current monthly rent",
    use: "Type of lease",
    useOptions: { housing: "Home (housing lease)", commercial: "Shop, office or other non-housing use" },
    signed: "Date the contract was signed",
    updateMonth: "Month of the update",
    updateYear: "Year",
    updateHint: (day) => `The rent is updated on the day each year of the contract is completed: here, ${day}.`,
    index: "Index agreed in the contract",
    indexOptions: { irav: "IRAV (the INE's reference index)", ipc: "CPI (IPC)", fixed: "Agreed fixed percentage" },
    fixed: "Agreed percentage",
    newRent: "New monthly rent",
    change: "Increase applied",
    monthly: "Difference per month",
    yearly: "Difference over 12 months",
    agreedLine: (what, value, published) => `Contract index: ${what}, ${value} (INE, released ${published}).`,
    fixedLine: (value) => `Contract index: a fixed ${value}.`,
    capLine: CAP_EN,
    capBinds: "The contract's index is higher, so the cap applies.",
    capDoesNotBind: "The contract's index is below the cap: it applies as it is.",
    iravIsCap: "The contract's IRAV is also the legal cap: it applies as it is.",
    noCap: "No legal cap applies here: the contract decides.",
    basis: "Legal basis",
    pending: (p, latest) => {
      const next = p.month && p.published ? `Your update uses ${indexOfMonth(p.series, p.month, "en")}, which the INE will release on ${dayText(p.published, "en")}.` : "";
      if (p.reason === "before-series") return `On that date the INE did not publish ${SERIES_NAME.en[p.series]} yet (the first figure came out on ${p.published ? dayText(p.published, "en") : "—"}).`;
      if (p.reason === "scheduled") return `${next} Until then the increase cannot be known.${latest ? ` Latest figure: ${latest}.` : ""}`;
      return `The INE's release calendar does not reach that date yet.${latest ? ` Latest figure: ${latest}.` : ""}`;
    },
    invalid: {
      rent: "Type the monthly rent in euros.",
      dates: "Check the dates.",
      order: "The update must be at least one year after the signing date.",
      fixed: "Type the agreed percentage (for example, 3).",
    },
    outOfRange: (first, last) => `The calculator covers updates between ${dayText(first, "en")} and ${dayText(last, "en")}.`,
    notes: {
      notify:
        "The updated rent is due from the month after written notice stating the percentage applied (a note on the previous month's receipt is valid). You can ask for the INE certificate (LAU art. 18.2).",
      releaseDay: "The INE released a new figure on the day of the update itself (at 9:00). Check in your contract which exact day the year is completed.",
      noLegalCap: "Housing contract signed before 6 March 2019: on that date no legal cap applied to the update beyond what the contract says.",
      commercial: "For a shop, office or any non-housing lease the contract decides (LAU art. 4.3): the IRAV, 2% and 3% caps do not apply.",
      negotiable:
        "If the landlord is not a large landlord (gran tenedor), the rule lets them agree a different increase with the tenant; without that new agreement the cap is the maximum. For a large landlord the cap always applies.",
      decreeEdge: "The date is within a few days of a royal decree-law coming into force or being repealed: check it with a professional.",
      firstIrav: "On 1 January 2025 the INE had not released the first IRAV yet (it came out on 2 January): that day the cap was the CPI.",
      negative: "The index fell: if the contract's clause allows it, the rent goes down by the same proportion.",
    },
    sourceLink: "See the series at the INE",
  },
};
