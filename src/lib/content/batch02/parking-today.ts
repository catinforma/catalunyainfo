import { holidayOn, isCovered, longDate, weekdayIndex } from "@/lib/content/holidays/calendar";
import type { Locale } from "@/lib/i18n/config";

import { BLUE_ROWS, GREEN_ROWS } from "./barcelona-practical";

/**
 * "Do I have to pay for the blue or green zone today, where, how much, for
 * how long?" for Barcelona, worked out from today's date (24 Nov 2026).
 *
 * Search Console, 28 days to 24 Nov 2026, `/es/guias/aparcar-barcelona-zona-
 * azul-verde/`: 18,614 impressions at position 7.8 and 0.3 % CTR; the top
 * queries ("horario zona azul barcelona", "zona verde trinitat vella", "zona
 * verde sábado", "hasta qué hora se paga la zona azul") ask exactly this, and
 * the answer was in the hours table further down, not in a line that names the
 * day. The sibling guides (shops, metro, school calendar) already open with
 * such a line; this is the same pattern, `parkingToday`, a day-dependent block.
 *
 * ## Sources (read 24 Nov 2026, www.areaverda.cat, Barcelona de Serveis
 * Municipals; fetched with curl, quotes grepped on the saved HTML)
 *
 * Blue, https://www.areaverda.cat/es/informacion/tipos-de-plazas/area-azul
 *   "Horarios. Con carácter general, el horario de funcionamiento es: De lunes
 *   a viernes, de 9:00 a 20:00 h, de manera ininterrumpida. En determinadas
 *   zonas, este horario se amplía: En el centro de la ciudad, también los
 *   sábados. En la zona de playas, también los domingos y festivos."
 *   "El tiempo máximo de estacionamiento es el que indique la señalización
 *   específica de la zona y, habitualmente, es de 1 o 2 horas."
 *   "IMPORTANTE: Es imprescindible verificar siempre la información indicada
 *   en la señalización vertical de cada tramo, dado que pueden existir
 *   condiciones específicas."
 *
 * Green, https://www.areaverda.cat/es/informacion/tipos-de-plazas/area-verde
 *   "No residentes: de lunes a viernes o de lunes a sábado, de 8:00 a 20:00 h
 *   o de 8:00 a 22:00 h, según la zona. Fuera de este horario, el
 *   estacionamiento es libre."
 *   Residents' rate "durante todo el año (de enero a diciembre, incluido el
 *   mes de agosto)": the only August sentence on either page; neither page
 *   gives non-residents an August exception, and this block does not invent
 *   one.
 *
 * Beach zone, https://areaverda.cat/en/news/regulated-parking-beach-zone-ends-its-2026-season
 *   (14/09/2026) "As of 1 October 2026, the special parking regulations in the
 *   beach area of the Sant Martí district will come to an end." "The 142
 *   regulated parking spaces on Av. Litoral, in the area between C. Joan Miró
 *   and C. de la Jonquera (on Av. Litoral), will remain AREA Blue spaces,
 *   with tariff B and regulated hours from 9:00 am to 8:00 pm, Monday to
 *   Sunday, including public holidays." The same item gives the other two
 *   stretches (Av. d'Icària, blue, and C. Salvador Espriu, green) Monday to
 *   Friday only. The page does not say what 2027's beach rules will be, so the
 *   block states none: its beach sentence is the 2026 one until the re-read
 *   date (PARKING_TODAY_REREAD_BY), then a neutral "check the sign" line.
 *
 * Resident-only spaces, https://areaverda.cat/en/information/places/exclusives-residents
 *   "Some may only be occupied between 8:00 a.m. and 8:00 p.m., from Monday to
 *   Sunday ... Others allow parking throughout the entire day, every day of the
 *   year; however, a ticket is only required between 8:00 a.m. and 8:00 p.m."
 *
 * Zone 36, https://areaverda.cat/en/news/new-zone-36-regulated-parking-area-in-the-sant-andreu-district
 *   (22/09/2026) "vehicles belonging to non-residents in Zone 36 will only be
 *   allowed to park for a maximum of two hours during the regulated hours
 *   indicated on the corresponding vertical sign".
 *
 * Prices: the rate tables of barcelona-practical.ts (Ordenança fiscal 3.12,
 * BOPB 2-2-2026, and the same AREA pages), read here as min and max.
 *
 * ## What is NOT stated, and so is not claimed
 * No AREA page and no line of Ordenança fiscal 3.12 (grep "festiu", "diumenge",
 * "agost" on the PDF, 24 Nov 2026) gives a general rule for public holidays that
 * fall on a weekday outside the beach zone. On such a day the block says
 * exactly that and sends the reader to the sign. It does not know Barcelona's
 * local holidays, so its note says the same for them. No August rule other
 * than the resident-rate sentence above is stated either.
 *
 * Rendered on the server by the `parkingToday` block (day-dependent): the
 * nightly cron rebuilds the page and every sentence names its own date.
 */

export const PARKING_TODAY_AS_OF = "2026-11-24";
/** The beach-zone facts are seasonal: re-read before the 2027 beach rules can start. From this date the block stops stating the beach rule. */
export const PARKING_TODAY_REREAD_BY = "2027-03-25";

export type ParkingDayKind = "weekday" | "saturday" | "sunday";

export function parkingDayKind(iso: string): ParkingDayKind {
  const w = weekdayIndex(iso);
  return w === 0 ? "sunday" : w === 6 ? "saturday" : "weekday";
}

/** Lowest and highest hourly price in a rate table (columns A and B). */
function range(rows: string[][]): [number, number] {
  const values = rows.flatMap((r) => [r[1], r[2]]).map((v) => Number((v ?? "").replace(" €", "").replace(",", ".")));
  return [Math.min(...values), Math.max(...values)];
}

export function parkingPriceRanges(): { blue: [number, number]; green: [number, number] } {
  return { blue: range(BLUE_ROWS), green: range(GREEN_ROWS) };
}

function euros(v: number, locale: Locale): string {
  const s = v.toFixed(2);
  return locale === "en" ? `€${s}` : `${s.replace(".", ",")} €`;
}

type Copy = {
  today: string;
  labels: { blue: string; green: string; resident: string; stay: string; price: string };
  blueWeekday: string;
  greenWeekday: string;
  blueSaturday: string;
  greenSaturday: string;
  blueSunday: string;
  greenSunday: string;
  blueHoliday: string;
  greenHoliday: string;
  beachNow: string;
  beachGeneric: string;
  /** Saturday headline: where blue is also charged outside the centre. */
  beachSatNow: string;
  beachSatLater: string;
  resident: string;
  stay: string;
  price: (blue: string, green: string) => string;
  headline: {
    weekday: (date: string) => string;
    saturday: (date: string, beach: string) => string;
    sunday: (date: string) => string;
    weekdayHoliday: (date: string) => string;
    weekendHoliday: string;
  };
  note: string;
};

const COPY: Record<Locale, Copy> = {
  ca: {
    today: "Avui",
    labels: { blue: "Zona blava", green: "Zona verda (no residents)", resident: "Places exclusives per a residents", stay: "Temps màxim", price: "Preu per hora" },
    blueWeekday: "Es paga de 9.00 a 20.00 h, sense pausa.",
    greenWeekday: "Es paga de 8.00 a 20.00 h o fins a les 22.00 h, segons la zona.",
    blueSaturday: "Es paga al centre de la ciutat; a la resta no, tret de la zona de platja.",
    greenSaturday: "Es paga només a les zones que funcionen de dilluns a dissabte (de 8.00 a 20.00 h o fins a les 22.00 h, segons la zona); a les de dilluns a divendres, és lliure.",
    blueSunday: "No es paga, tret de la zona de platja.",
    greenSunday: "No es paga: la zona verda de no residents funciona de dilluns a divendres o de dilluns a dissabte.",
    blueHoliday: "L'horari general d'AREA és de dilluns a divendres, de 9.00 a 20.00 h, i AREA no publica cap regla general per als festius entre setmana fora de la zona de platja: mana el senyal vertical del tram.",
    greenHoliday: "L'horari general d'AREA és de dilluns a divendres o a dissabte, i AREA no publica cap regla general per als festius entre setmana: mana el senyal vertical del tram.",
    beachNow: "A la zona de platja, des de l'1 d'octubre de 2026 només el tram de l'avinguda Litoral entre Joan Miró i la Jonquera (142 places) es paga de dilluns a diumenge, festius inclosos.",
    beachGeneric: "A la zona de platja, la regla canvia cada temporada i aquesta pàgina no recull la del 2027: mira el senyal del tram.",
    beachSatNow: "al tram de l'avinguda Litoral",
    beachSatLater: "a la zona de platja segons el seu senyal",
    resident: "No hi pots aparcar cap dia: són reservades per a residents autoritzats (de 8.00 a 20.00 h tots els dies; a la Barceloneta i al Born, 24 h).",
    stay: "El que digui el senyal, normalment 1 o 2 hores. A la zona verda 36 de la Trinitat Vella, 2 hores com a màxim per als no residents.",
    price: (blue, green) => `Blava ${blue}; verda per a no residents ${green}, segons la tarifa (A o B) i el distintiu ambiental.`,
    headline: {
      weekday: (d) => `Avui, ${d}, sí que es paga: la zona blava de 9.00 a 20.00 h i la zona verda de no residents de 8.00 a 20.00 h o fins a les 22.00 h, segons la zona (horari general d'AREA).`,
      saturday: (d, b) => `Avui, ${d}, la zona blava es paga al centre de la ciutat i ${b}, i la zona verda només on funciona de dilluns a dissabte.`,
      sunday: (d) => `Avui, ${d}, no es paga ni la zona blava ni la verda de no residents, tret de la zona de platja.`,
      weekdayHoliday: (d) => `Avui, ${d}, és festiu entre setmana i AREA no publica cap regla general per als festius fora de la zona de platja: l'horari general és de dilluns a divendres i mana el senyal del tram.`,
      weekendHoliday: " És festiu, però AREA no publica cap regla general per als festius fora de la zona de platja: mana el senyal del tram.",
    },
    note: "Calculat per a la data d'avui amb les pàgines «Blaves» i «Verdes» d'AREA (Barcelona de Serveis Municipals) i les seves notícies de la zona de platja i de la zona 36, llegides el 24 de novembre de 2026. Si avui és festa local de Barcelona, AREA tampoc no publica cap regla general: mana el senyal vertical. A l'agost: les pàgines d'AREA no preveuen cap excepció d'agost per als no residents (la tarifa de residents regeix «de gener a desembre, agost inclòs»).",
  },
  es: {
    today: "Hoy",
    labels: { blue: "Zona azul", green: "Zona verde (no residentes)", resident: "Plazas exclusivas para residentes", stay: "Tiempo máximo", price: "Precio por hora" },
    blueWeekday: "Se paga de 9:00 a 20:00, sin pausa.",
    greenWeekday: "Se paga de 8:00 a 20:00 o hasta las 22:00, según la zona.",
    blueSaturday: "Se paga en el centro de la ciudad; en el resto no, salvo en la zona de playa.",
    greenSaturday: "Se paga solo en las zonas que funcionan de lunes a sábado (de 8:00 a 20:00 o hasta las 22:00, según la zona); en las de lunes a viernes, es libre.",
    blueSunday: "No se paga, salvo en la zona de playa.",
    greenSunday: "No se paga: la zona verde de no residentes funciona de lunes a viernes o de lunes a sábado.",
    blueHoliday: "El horario general de AREA es de lunes a viernes, de 9:00 a 20:00, y AREA no publica ninguna regla general para los festivos entre semana fuera de la zona de playa: manda la señal vertical del tramo.",
    greenHoliday: "El horario general de AREA es de lunes a viernes o a sábado, y AREA no publica ninguna regla general para los festivos entre semana: manda la señal vertical del tramo.",
    beachNow: "En la zona de playa, desde el 1 de octubre de 2026 solo el tramo de la avenida Litoral entre Joan Miró y la Jonquera (142 plazas) se paga de lunes a domingo, festivos incluidos.",
    beachGeneric: "En la zona de playa, la regla cambia cada temporada y esta página no recoge la de 2027: mira la señal del tramo.",
    beachSatNow: "en el tramo de la avenida Litoral",
    beachSatLater: "en la zona de playa según su señal",
    resident: "No puedes aparcar ningún día: están reservadas a residentes autorizados (de 8:00 a 20:00 todos los días; en la Barceloneta y El Born, 24 h).",
    stay: "El que diga la señal, normalmente 1 o 2 horas. En la zona verde 36 de Trinitat Vella, 2 horas como máximo para no residentes.",
    price: (blue, green) => `Azul ${blue}; verde para no residentes ${green}, según la tarifa (A o B) y el distintivo ambiental.`,
    headline: {
      weekday: (d) => `Hoy, ${d}, sí se paga: la zona azul de 9:00 a 20:00 y la zona verde de no residentes de 8:00 a 20:00 o hasta las 22:00, según la zona (horario general de AREA).`,
      saturday: (d, b) => `Hoy, ${d}, la zona azul se paga en el centro de la ciudad y ${b}, y la zona verde solo donde funciona de lunes a sábado.`,
      sunday: (d) => `Hoy, ${d}, no se paga ni la zona azul ni la verde de no residentes, salvo en la zona de playa.`,
      weekdayHoliday: (d) => `Hoy, ${d}, es festivo entre semana y AREA no publica ninguna regla general para los festivos fuera de la zona de playa: el horario general es de lunes a viernes y manda la señal del tramo.`,
      weekendHoliday: " Es festivo, pero AREA no publica ninguna regla general para los festivos fuera de la zona de playa: manda la señal del tramo.",
    },
    note: "Calculado para la fecha de hoy con las páginas «Azules» y «Verdes» de AREA (Barcelona de Serveis Municipals) y sus noticias de la zona de playa y de la zona 36, leídas el 24 de noviembre de 2026. Si hoy es fiesta local de Barcelona, AREA tampoco publica ninguna regla general: manda la señal vertical. En agosto: las páginas de AREA no prevén ninguna excepción de agosto para los no residentes (la tarifa de residentes rige «de enero a diciembre, incluido el mes de agosto»).",
  },
  en: {
    today: "Today",
    labels: { blue: "Blue zone", green: "Green zone (non-residents)", resident: "Resident-only spaces", stay: "Maximum stay", price: "Price per hour" },
    blueWeekday: "You pay from 9:00 to 20:00, with no break.",
    greenWeekday: "You pay from 8:00 to 20:00 or until 22:00, depending on the zone.",
    blueSaturday: "You pay in the city centre; elsewhere it is free, except in the beach zone.",
    greenSaturday: "You pay only in zones that run Monday to Saturday (8:00 to 20:00 or until 22:00, depending on the zone); in Monday-to-Friday zones it is free.",
    blueSunday: "Free, except in the beach zone.",
    greenSunday: "Free: the non-resident green zone runs Monday to Friday or Monday to Saturday.",
    blueHoliday: "AREA's general hours are Monday to Friday, 9:00 to 20:00, and AREA publishes no general rule for weekday public holidays outside the beach zone: the vertical sign for the stretch decides.",
    greenHoliday: "AREA's general hours are Monday to Friday or Monday to Saturday, and AREA publishes no general rule for weekday public holidays: the vertical sign for the stretch decides.",
    beachNow: "In the beach zone, since 1 October 2026 only the Avinguda Litoral stretch between Joan Miró and Jonquera (142 spaces) is charged Monday to Sunday, public holidays included.",
    beachGeneric: "In the beach zone the rule changes each season and this page does not cover 2027's: check the sign for the stretch.",
    beachSatNow: "on the Avinguda Litoral stretch",
    beachSatLater: "in the beach zone as its sign says",
    resident: "You cannot park there on any day: they are reserved for authorised residents (8:00 to 20:00 every day; in Barceloneta and El Born, 24 hours).",
    stay: "As the sign says, usually 1 or 2 hours. In green Zone 36 (Trinitat Vella), 2 hours at most for non-residents.",
    price: (blue, green) => `Blue ${blue}; green for non-residents ${green}, depending on the rate (A or B) and the environmental label.`,
    headline: {
      weekday: (d) => `Today, ${d}, you pay: blue zone from 9:00 to 20:00 and non-resident green zone from 8:00 to 20:00 or until 22:00, depending on the zone (AREA's general hours).`,
      saturday: (d, b) => `Today, ${d}, blue zone is charged in the city centre and ${b}, and green zone only where it runs Monday to Saturday.`,
      sunday: (d) => `Today, ${d}, neither the blue zone nor the non-resident green zone is charged, except in the beach zone.`,
      weekdayHoliday: (d) => `Today, ${d}, is a weekday public holiday and AREA publishes no general rule for public holidays outside the beach zone: the general hours are Monday to Friday and the sign for the stretch decides.`,
      weekendHoliday: " It is a public holiday, but AREA publishes no general rule for public holidays outside the beach zone: the sign for the stretch decides.",
    },
    note: "Worked out for today's date from AREA's \"Azules\" and \"Verdes\" pages (Barcelona de Serveis Municipals) and its beach-zone and Zone 36 news items, read on 24 November 2026. If today is a Barcelona local holiday, AREA publishes no general rule for it either: the vertical sign decides. In August: AREA's pages state no August exception for non-residents (the resident rate runs \"January to December, including August\").",
  },
};

export interface ParkingTodayLines {
  /** The one-sentence answer, naming the date. */
  headline: string;
  kind: ParkingDayKind;
  /** Name of a Catalonia-wide public holiday today, if any. */
  holiday: string | null;
  /** True on a Sunday: neither zone is charged under AREA's general hours (beach zone and the sign aside). */
  free: boolean;
  facts: { label: string; value: string }[];
  note: string;
}

/**
 * The block's lines for one date. Holidays are only known for the years the
 * Generalitat's calendar covers (`isCovered`); outside them the block keeps
 * to the weekday and says nothing about holidays beyond the standing note.
 */
export function parkingTodayLines(today: string, locale: Locale): ParkingTodayLines {
  const c = COPY[locale];
  const kind = parkingDayKind(today);
  const holiday = isCovered(today) ? (holidayOn(today)?.name[locale] ?? null) : null;
  const date = longDate(today, locale);
  const named = holiday ? `${date} (${holiday})` : date;
  const beachKnown = today < PARKING_TODAY_REREAD_BY;
  const beach = beachKnown ? c.beachNow : c.beachGeneric;
  const weekdayHoliday = holiday !== null && kind === "weekday";

  let headline: string;
  let blue: string;
  let green: string;
  if (weekdayHoliday) {
    headline = c.headline.weekdayHoliday(named);
    blue = `${c.blueHoliday} ${beach}`;
    green = c.greenHoliday;
  } else if (kind === "weekday") {
    headline = c.headline.weekday(named);
    blue = c.blueWeekday;
    green = c.greenWeekday;
  } else if (kind === "saturday") {
    headline = c.headline.saturday(named, beachKnown ? c.beachSatNow : c.beachSatLater) + (holiday ? c.headline.weekendHoliday : "");
    blue = `${c.blueSaturday} ${beach}`;
    green = c.greenSaturday;
  } else {
    headline = c.headline.sunday(named) + (holiday ? c.headline.weekendHoliday : "");
    blue = `${c.blueSunday} ${beach}`;
    green = c.greenSunday;
  }

  const { blue: b, green: g } = parkingPriceRanges();
  const span = (r: [number, number]) => `${euros(r[0], locale)}–${euros(r[1], locale)}`;
  return {
    headline,
    kind,
    holiday,
    free: kind === "sunday",
    facts: [
      { label: c.labels.blue, value: blue },
      { label: c.labels.green, value: green },
      { label: c.labels.resident, value: c.resident },
      { label: c.labels.stay, value: c.stay },
      { label: c.labels.price, value: c.price(span(b), span(g)) },
    ],
    note: c.note,
  };
}
