import { addDays, holidayOn, longDate, shortDate, weekdayIndex, WEEKDAY_NAMES } from "@/lib/content/holidays/calendar";
import type { Locale } from "@/lib/i18n/config";
import { municipalityBySlug } from "@/lib/programmatic/holidays/data";
import { joinList } from "@/lib/programmatic/holidays/names";

import { CHRISTMAS_SHOPS_LAST_DAY, DEFAULT_DECEMBER_2026, GENERAL_2027_IN_WINDOW, LAW_CLOSING, WINDOW_2026 } from "./shops-christmas";
import { christmasTownRows } from "./shops-christmas-towns";

/**
 * "¿Abren hoy las tiendas en Barcelona?" / "¿Y este domingo?" (23 Nov 2026).
 *
 * Search Console, 27 Oct-23 Nov 2026, queries landing on the shops guide:
 * "tiendas abiertas hoy en barcelona 2026" 262 impressions at 8.9, "este
 * domingo abren las tiendas en barcelona (2026)" 75 + 70 at 8.5-9.1,
 * "tiendas abiertas mañana en barcelona 2026" 96 at 7.7, "hoy abren las
 * tiendas en barcelona" 60 at 10.2, "este domingo abren las tiendas" 57 at
 * 6.8: about 760 impressions in the family, 6 clicks. The guide answered them
 * only through a 13-row date table the reader has to scan for today's date.
 *
 * This module turns today's date into the answer, from the same official
 * texts the table uses and nothing else:
 * - Barcelona's 2026 days: Resolució EMT/4342/2025 (the snapshot's `shops`,
 *   held to the DOGC text by tests/shops-christmas.test.ts);
 * - closing days: Llei 18/2017, art. 36.2.d (25 and 26 Dec, 1 and 6 Jan);
 * - Sunday 3 January 2027: Ordre EMT/89/2026, art. 1 (general day; the
 *   council's swaps not published);
 * - Catalonia-wide holidays: Ordre EMT/66/2025 and EMT/52/2026
 *   (holidays/calendar.ts); Barcelona's local days from the snapshot.
 * - the rest of Catalonia: the 947-row per-town table (christmasTownRows).
 *
 * It answers only up to CHRISTMAS_SHOPS_LAST_DAY (6 Jan 2027). After that the
 * 2027 municipal list (not in the DOGC on 23 Nov 2026, issue 9800) is needed,
 * and the block says so instead of guessing.
 *
 * Rendered on the server by the `shopsToday` block, which is day-dependent
 * (day-dependent.ts): the nightly cron rebuilds the page, and every sentence
 * names its own date, so a copy served before the rebuild is still true.
 */

export type ShopsDayKind =
  /** One of Barcelona's ten 2026 Sundays and holidays. */
  | "open"
  /** A Sunday or holiday that is not one of them. */
  | "closed"
  /** Llei 18/2017, art. 36.2.d. */
  | "lawClosed"
  /** 3 January 2027: general day, Barcelona's 2027 days not published. */
  | "pending2027"
  /** Neither a Sunday nor a holiday: each shop's own hours. */
  | "working";

/** The first day the block answers (a day before it, the guide's table covers it). */
export const SHOPS_TODAY_FROM = "2026-11-01";
/** The last day it answers: Reis. */
export const SHOPS_TODAY_TO = CHRISTMAS_SHOPS_LAST_DAY;

const BARCELONA = municipalityBySlug("barcelona");

export function inShopsTodayWindow(iso: string): boolean {
  return iso >= SHOPS_TODAY_FROM && iso <= SHOPS_TODAY_TO;
}

/** What general-timetable shops in Barcelona may do on one date of the window. */
export function barcelonaShopsDay(iso: string): ShopsDayKind {
  if ((LAW_CLOSING as readonly string[]).includes(iso)) return "lawClosed";
  if (iso === GENERAL_2027_IN_WINDOW) return "pending2027";
  if (iso.startsWith("2026-") && BARCELONA?.shops.includes(iso)) return "open";
  const festive = weekdayIndex(iso) === 0 || holidayOn(iso) !== null || Boolean(BARCELONA?.local.includes(iso));
  return festive ? "closed" : "working";
}

/** The Sunday on or after `iso`. */
export function sundayFrom(iso: string): string {
  return addDays(iso, (7 - weekdayIndex(iso)) % 7);
}

/** The next day strictly after `iso`, up to the window's end, on which shops may open on a Sunday or holiday. */
export function nextOpeningAfter(iso: string): string | null {
  for (let d = addDays(iso, 1); d <= SHOPS_TODAY_TO; d = addDays(d, 1)) {
    const kind = barcelonaShopsDay(d);
    if (kind === "open" || kind === "pending2027") return d;
  }
  return null;
}

/**
 * The rest of Catalonia on one Sunday or holiday of the 29 Nov-31 Dec window:
 * the towns that do not open on a day Barcelona opens, or that open on a day
 * Barcelona does not (per-town table, Resolució EMT/4342/2025).
 */
export function cataloniaDiff(iso: string): { notOpen: string[]; alsoOpen: string[] } {
  if (iso < WINDOW_2026.from || iso > WINDOW_2026.to) return { notOpen: [], alsoOpen: [] };
  const rows = christmasTownRows();
  const isDefault = (DEFAULT_DECEMBER_2026 as readonly string[]).includes(iso);
  return {
    notOpen: isDefault ? rows.filter((r) => r.swapped.includes(iso)).map((r) => r.name) : [],
    alsoOpen: isDefault ? [] : rows.filter((r) => r.open.includes(iso)).map((r) => r.name),
  };
}

const EXEMPT: Record<Locale, string> = {
  ca: "Hi poden obrir igualment els forns i pastisseries, les botigues de conveniència, les farmàcies i les botigues d'alimentació o de pimes de fins a 300 m², entre d'altres.",
  es: "Pueden abrir igualmente las panaderías y pastelerías, las tiendas de conveniencia, las farmacias y las tiendas de alimentación o de pymes de hasta 300 m², entre otras.",
  en: "Bakeries and cake shops, convenience stores, pharmacies, and food or small-business shops of up to 300 m², among others, may still open.",
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Hoy, domingo, 29 de noviembre de 2026, …": the answer for today in Barcelona. */
function todaySentence(iso: string, kind: ShopsDayKind, locale: Locale): string {
  const date = longDate(iso, locale);
  const holiday = holidayOn(iso)?.name[locale];
  const named = holiday ? `${date} (${holiday})` : date;
  if (locale === "ca") {
    const lead = `Avui, ${named},`;
    switch (kind) {
      case "open":
        return `${lead} les botigues poden obrir a Barcelona: és un dels seus deu diumenges i festius d'obertura del 2026.`;
      case "closed":
        return `${lead} les botigues amb horari general no poden obrir a Barcelona: no és un dels seus dies d'obertura. ${EXEMPT.ca}`;
      case "lawClosed":
        return `${lead} les botigues amb horari general han de tancar a tot Catalunya (Llei 18/2017, art. 36.2.d). ${EXEMPT.ca}`;
      case "pending2027":
        return `${lead} és dia d'obertura del calendari general del 2027 (Ordre EMT/89/2026): les botigues hi poden obrir, tret que l'Ajuntament de Barcelona l'hagi canviat, cosa que encara no ha publicat.`;
      case "working":
        return `${lead} no és diumenge ni festiu a Barcelona: les botigues obren amb el seu horari habitual, sempre entre les 6.00 i les 21.00.`;
    }
  }
  if (locale === "es") {
    const lead = `Hoy, ${named},`;
    switch (kind) {
      case "open":
        return `${lead} las tiendas pueden abrir en Barcelona: es uno de sus diez domingos y festivos de apertura de 2026.`;
      case "closed":
        return `${lead} las tiendas con horario general no pueden abrir en Barcelona: no es uno de sus días de apertura. ${EXEMPT.es}`;
      case "lawClosed":
        return `${lead} las tiendas con horario general deben cerrar en toda Cataluña (Ley 18/2017, art. 36.2.d). ${EXEMPT.es}`;
      case "pending2027":
        return `${lead} es día de apertura del calendario general de 2027 (Orden EMT/89/2026): las tiendas pueden abrir, salvo que el Ayuntamiento de Barcelona lo haya cambiado, algo que aún no ha publicado.`;
      case "working":
        return `${lead} no es domingo ni festivo en Barcelona: las tiendas abren con su horario habitual, siempre entre las 6.00 y las 21.00.`;
    }
  }
  const lead = `Today, ${named},`;
  switch (kind) {
    case "open":
      return `${lead} shops may open in Barcelona: it is one of the city's ten Sunday and holiday opening days of 2026.`;
    case "closed":
      return `${lead} shops on the general timetable may not open in Barcelona: it is not one of its opening days. ${EXEMPT.en}`;
    case "lawClosed":
      return `${lead} shops on the general timetable must close all over Catalonia (Llei 18/2017, art. 36.2.d). ${EXEMPT.en}`;
    case "pending2027":
      return `${lead} is an opening day in the 2027 general calendar (Ordre EMT/89/2026): shops may open unless Barcelona City Council has swapped it, which it has not published yet.`;
    case "working":
      return `${lead} is neither a Sunday nor a holiday in Barcelona: shops keep their usual hours, always between 6:00 and 21:00.`;
  }
}

/** The short verdict for a Sunday or holiday (the "this Sunday" line). */
function verdict(kind: ShopsDayKind, locale: Locale): string {
  const v: Record<Locale, Record<ShopsDayKind, string>> = {
    ca: {
      open: "Sí, les botigues poden obrir a Barcelona.",
      closed: "No. A Barcelona només hi poden obrir les botigues excloses de l'horari general (forns, conveniència, alimentació de fins a 300 m²…).",
      lawClosed: "No. Dia de tancament obligatori a tot Catalunya (Llei 18/2017, art. 36.2.d).",
      pending2027: "Sí, és dia general del 2027, tret que l'Ajuntament l'hagi canviat (encara no ho ha publicat).",
      working: "És dia laborable: cada botiga obre amb el seu horari.",
    },
    es: {
      open: "Sí, las tiendas pueden abrir en Barcelona.",
      closed: "No. En Barcelona solo pueden abrir las tiendas excluidas del horario general (panaderías, conveniencia, alimentación de hasta 300 m²…).",
      lawClosed: "No. Día de cierre obligatorio en toda Cataluña (Ley 18/2017, art. 36.2.d).",
      pending2027: "Sí, es día general de 2027, salvo que el Ayuntamiento lo haya cambiado (aún no lo ha publicado).",
      working: "Es laborable: cada tienda abre con su horario.",
    },
    en: {
      open: "Yes, shops may open in Barcelona.",
      closed: "No. In Barcelona only shops outside the general timetable may open (bakeries, convenience stores, food shops of up to 300 m²…).",
      lawClosed: "No. A compulsory closing day all over Catalonia (Llei 18/2017, art. 36.2.d).",
      pending2027: "Yes, it is a 2027 general day, unless the council has swapped it (not published yet).",
      working: "A working day: each shop keeps its own hours.",
    },
  };
  return v[locale][kind];
}

/** "Al resto de Cataluña, también, salvo en Gironella, Martorell y Salt." */
function cataloniaSentence(iso: string, kind: ShopsDayKind, locale: Locale): string | null {
  if (kind === "lawClosed" || kind === "working") return null;
  if (kind === "pending2027") {
    return {
      ca: "La resta de municipis també el tenen al calendari general; els canvis de cada ajuntament per al 2027 encara no són al DOGC.",
      es: "El resto de municipios también lo tienen en el calendario general; los cambios de cada ayuntamiento para 2027 aún no están en el DOGC.",
      en: "Every other town has it in the general calendar too; each council's 2027 changes are not in the DOGC yet.",
    }[locale];
  }
  const { notOpen, alsoOpen } = cataloniaDiff(iso);
  const p = { ca: "a", es: "en", en: "in" }[locale];
  const names = (towns: string[]) =>
    towns.length <= 4
      ? joinList(towns, locale)
      : { ca: `${towns.length} municipis (són a la taula de sota)`, es: `${towns.length} municipios (están en la tabla de abajo)`, en: `${towns.length} towns (listed in the table below)` }[locale];
  if (kind === "open") {
    if (!notOpen.length) return { ca: "A la resta de Catalunya, també.", es: "En el resto de Cataluña, también.", en: "In the rest of Catalonia too." }[locale];
    const except = { ca: "excepte", es: "salvo", en: "except" }[locale];
    const head = { ca: "A la resta de Catalunya, també,", es: "En el resto de Cataluña, también,", en: "In the rest of Catalonia too," }[locale];
    return `${head} ${except} ${notOpen.length <= 4 ? `${p} ` : ""}${names(notOpen)}.`;
  }
  // kind === "closed"
  if (!alsoOpen.length) {
    if (iso < WINDOW_2026.from) return null;
    return { ca: "Tampoc no és dia d'obertura a cap altre municipi de Catalunya.", es: "Tampoco es día de apertura en ningún otro municipio de Cataluña.", en: "It is not an opening day in any other town in Catalonia either." }[locale];
  }
  return {
    ca: `Sí que ho és ${p} ${names(alsoOpen)}, que l'ha triat com a dia propi.`,
    es: `Sí lo es en ${names(alsoOpen)}, que lo ha elegido como día propio.`,
    en: `It is in ${names(alsoOpen)}, which chose it as one of its own days.`,
  }[locale];
}

export interface ShopsTodayLines {
  today: string;
  todayKind: ShopsDayKind;
  /** "Este domingo, 29 de noviembre" (or "El domingo siguiente" when today is Sunday). */
  sundayLabel: string;
  sundayIso: string;
  sundayValue: string;
  /** The rest of Catalonia today, when today is a Sunday or holiday with a Barcelona answer (the Sunday's goes in sundayValue). */
  catalonia: string | null;
  nextLabel: string;
  nextValue: string;
  /** "Mañana, jueves 26 de noviembre" and its answer; null when tomorrow is the Sunday row or outside the window. */
  tomorrowLabel: string | null;
  tomorrowValue: string | null;
  /** The December 2026 opening days of Barcelona, in the past tense for the dates already gone (25 Nov 2026). */
  decemberLabel: string | null;
  decemberValue: string | null;
  note: string;
}

/** "el domingo 6, el martes 8 y el domingo 13 de diciembre" (every date is a December 2026 date). */
function decemberDays(isos: string[], locale: Locale): string {
  const items = isos.map((iso) => `${locale === "en" ? "" : "el "}${WEEKDAY_NAMES[locale][weekdayIndex(iso)]} ${Number(iso.slice(8, 10))}`);
  const month = { ca: "de desembre", es: "de diciembre", en: "December" }[locale];
  return `${joinList(items, locale)} ${month}`;
}

const DECEMBER_CLOSING = ["2026-12-25", "2026-12-26"];

/**
 * Barcelona's December 2026 in one sentence (25 Nov 2026): the dates before
 * today go in the past tense ("pudieron abrir"), today and later in the
 * present. Barcelona's days come from the snapshot (Resolució EMT/4342/2025),
 * the closing days from Llei 18/2017, art. 36.2.d. The rest of Catalonia opens
 * the same days except the towns of the table below.
 */
export function decemberLine(today: string, locale: Locale): string {
  const open = (BARCELONA?.shops ?? []).filter((d) => d.startsWith("2026-12"));
  const T = {
    ca: { subject: "les botigues", pastOpen: "van poder obrir", nextOpen: "poden obrir", pastClose: "van haver de tancar", nextClose: "han de tancar", head: "Desembre del 2026 a Barcelona", rest: "A la resta de Catalunya, els mateixos dies, amb les excepcions de la taula de més avall." },
    es: { subject: "las tiendas", pastOpen: "pudieron abrir", nextOpen: "pueden abrir", pastClose: "tuvieron que cerrar", nextClose: "deben cerrar", head: "Diciembre de 2026 en Barcelona", rest: "En el resto de Cataluña, los mismos días, con las excepciones de la tabla de más abajo." },
    en: { subject: "shops", pastOpen: "could open on", nextOpen: "may open on", pastClose: "had to close on", nextClose: "must close on", head: "December 2026 in Barcelona", rest: "In the rest of Catalonia, the same days apart from the exceptions in the table below." },
  }[locale];
  const parts: string[] = [];
  const add = (verb: string, isos: string[]) => {
    if (isos.length) parts.push(`${parts.length ? "" : `${T.subject} `}${verb} ${decemberDays(isos, locale)}`);
  };
  add(T.pastOpen, open.filter((d) => d < today));
  add(T.nextOpen, open.filter((d) => d >= today));
  add(T.pastClose, DECEMBER_CLOSING.filter((d) => d < today));
  add(T.nextClose, DECEMBER_CLOSING.filter((d) => d >= today));
  return `${T.head}: ${parts.join("; ")}. ${T.rest}`;
}

const NOTE: Record<Locale, string> = {
  ca: "Calculat per a la data d'avui amb la Resolució EMT/4342/2025 (dies de cada municipi del 2026), l'Ordre EMT/89/2026 (2027) i la Llei 18/2017, art. 36.2.d (dies de tancament). «Poden obrir» no vol dir que obrin: cada botiga decideix.",
  es: "Calculado para la fecha de hoy con la Resolución EMT/4342/2025 (días de cada municipio de 2026), la Orden EMT/89/2026 (2027) y la Ley 18/2017, art. 36.2.d (días de cierre). «Pueden abrir» no quiere decir que abran: cada tienda decide.",
  en: "Worked out for today's date from Resolució EMT/4342/2025 (each town's 2026 days), Ordre EMT/89/2026 (2027) and Llei 18/2017, art. 36.2.d (closing days). \"May open\" does not mean every shop will: each one decides.",
};

/**
 * The block's lines for one day, or null outside the window (the component
 * then says the 2027 list is pending, without a verdict).
 */
export function shopsTodayLines(today: string, locale: Locale): ShopsTodayLines | null {
  if (!inShopsTodayWindow(today)) return null;
  const todayKind = barcelonaShopsDay(today);
  const isSunday = weekdayIndex(today) === 0;
  const sundayIso = isSunday ? addDays(today, 7) : sundayFrom(today);
  const sundayKind = sundayIso <= SHOPS_TODAY_TO ? barcelonaShopsDay(sundayIso) : null;
  const sundayWord = WEEKDAY_NAMES[locale][0]!;
  const sundayTomorrow = !isSunday && addDays(today, 1) === sundayIso;
  const sundayLabel = sundayTomorrow
    ? { ca: `Demà, diumenge, ${shortDate(sundayIso, "ca")}`, es: `Mañana, domingo, ${shortDate(sundayIso, "es")}`, en: `Tomorrow, Sunday, ${shortDate(sundayIso, "en")}` }[locale]
    : isSunday
    ? { ca: `El diumenge vinent, ${shortDate(sundayIso, "ca")}`, es: `El domingo siguiente, ${shortDate(sundayIso, "es")}`, en: `Next Sunday, ${shortDate(sundayIso, "en")}` }[locale]
    : { ca: `Aquest ${sundayWord}, ${shortDate(sundayIso, "ca")}`, es: `Este ${sundayWord}, ${shortDate(sundayIso, "es")}`, en: `This ${sundayWord}, ${shortDate(sundayIso, "en")}` }[locale];
  const pendingAfter = { ca: "Encara no publicat: cal la llista del 2027 del DOGC.", es: "Aún no publicado: falta la lista de 2027 del DOGC.", en: "Not published yet: the DOGC's 2027 list is needed." }[locale];
  const sundayRest = sundayKind ? cataloniaSentence(sundayIso, sundayKind, locale) : null;
  const sundayValue = sundayKind ? [verdict(sundayKind, locale), sundayRest].filter(Boolean).join(" ") : pendingAfter;
  const festiveToday = todayKind === "open" || todayKind === "closed" || todayKind === "pending2027";
  const catalonia = festiveToday ? cataloniaSentence(today, todayKind, locale) : null;
  const next = nextOpeningAfter(today);
  const nextLabel = { ca: "Pròxim diumenge o festiu d'obertura a Barcelona", es: "Próximo domingo o festivo de apertura en Barcelona", en: "Next Sunday or holiday opening in Barcelona" }[locale];
  const nextValue = next ? cap(longDate(next, locale)) : pendingAfter;
  // "Mañana": the queries ask "tiendas abiertas mañana en barcelona". When tomorrow is the Sunday row, that row says so.
  const tomorrowIso = addDays(today, 1);
  const tomorrowIsSunday = tomorrowIso === sundayIso;
  const tomorrowKind = inShopsTodayWindow(tomorrowIso) ? barcelonaShopsDay(tomorrowIso) : null;
  const tomorrowRest = tomorrowKind ? cataloniaSentence(tomorrowIso, tomorrowKind, locale) : null;
  const tomorrowWord = { ca: "Demà", es: "Mañana", en: "Tomorrow" }[locale];
  const tomorrowLabel = tomorrowKind && !tomorrowIsSunday ? `${tomorrowWord}, ${longDate(tomorrowIso, locale)}` : null;
  const tomorrowValue = tomorrowKind && !tomorrowIsSunday ? [verdict(tomorrowKind, locale), tomorrowRest].filter(Boolean).join(" ") : null;
  const decemberOn = today <= "2026-12-31";
  return {
    today: todaySentence(today, todayKind, locale),
    todayKind,
    sundayLabel,
    sundayIso,
    sundayValue,
    catalonia,
    nextLabel,
    nextValue,
    tomorrowLabel,
    tomorrowValue,
    decemberLabel: decemberOn ? { ca: "Desembre del 2026", es: "Diciembre de 2026", en: "December 2026" }[locale] : null,
    decemberValue: decemberOn ? decemberLine(today, locale) : null,
    note: NOTE[locale],
  };
}

/** What the block prints after 6 January 2027 (no verdict: the 2027 list is needed). */
export const SHOPS_TODAY_AFTER: Record<Locale, string> = {
  ca: "Des del 7 de gener de 2027, la resposta de cada dia depèn de la llista de dies d'obertura del 2027 de cada municipi, que el DOGC encara no havia publicat el 25 de novembre de 2026. Els vuit dies generals del 2027 són a la taula del calendari del 2027, més avall.",
  es: "Desde el 7 de enero de 2027, la respuesta de cada día depende de la lista de días de apertura de 2027 de cada municipio, que el DOGC aún no había publicado el 25 de noviembre de 2026. Los ocho días generales de 2027 están en la tabla del calendario de 2027, más abajo.",
  en: "From 7 January 2027, each day's answer depends on every town's list of 2027 opening days, which the DOGC had not published by 25 November 2026. The eight general days of 2027 are in the 2027 calendar table below.",
};
