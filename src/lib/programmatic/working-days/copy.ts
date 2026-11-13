import { calcEditions, calcPath } from "@/lib/programmatic/calculators/paths";
import { dayMonthYear, longDate, type DateLocale } from "@/lib/programmatic/holidays/format";

import type { Reason, RuleSet, Unit } from "./engine";

/**
 * Paths, browser data shape and words of the working-days calculator
 * ("Calculadora de días hábiles"), small enough for the browser: the client
 * component imports this file and engine.ts, never places.ts.
 *
 *   /es/calculadoras/dias-habiles/
 *   /ca/calculadores/dies-habils/
 *   /en/calculators/working-days-spain/
 */

export type WdLocale = DateLocale;
export const WD_LOCALES: readonly WdLocale[] = ["es", "ca", "en"];

export function workingDaysPath(locale: WdLocale): string {
  return calcPath("working-days", locale);
}

export function workingDaysEditions(): Record<WdLocale, string> {
  return calcEditions("working-days");
}

/* -------------------------------------------------------------------------- */
/* Browser data                                                               */
/* -------------------------------------------------------------------------- */

/**
 * [value, label, page, base index, extra days, info]. Days as "YYMMDD,YYMMDD".
 * Page as in the leave planner: "" = `townPrefix` + value + "/", "*" = the
 * Catalan town page. Info: a kind letter ("e" all of Spain, "r" a whole
 * community or Catalonia, "t" a Catalan town, "c" a Spanish city), then "1"
 * or "0" for "local days of 2026 counted" and the same for 2027, then "p"
 * when the council has approved 2027 days the DOGC has not published (not
 * counted) and "i" when an island day of Canarias is counted.
 */
export type WdItem = [string, string, string, number, string, string];

export interface WdGroup {
  label: string;
  items: WdItem[];
}

export interface WdData {
  townPrefix: string;
  /** 0 all of Spain, 1 Catalonia, 2 Aran, then one per community outside Catalonia. */
  bases: string[];
  groups: WdGroup[];
}

export const NATIONAL_ID = "espana";

const short = (iso: string) => iso.slice(2, 4) + iso.slice(5, 7) + iso.slice(8, 10);

export function packDates(dates: readonly string[]): string {
  return [...new Set(dates)].sort().map(short).join(",");
}

export function unpackDates(text: string): string[] {
  return text ? text.split(",").map((d) => `20${d.slice(0, 2)}-${d.slice(2, 4)}-${d.slice(4, 6)}`) : [];
}

export function itemHolidays(data: Pick<WdData, "bases">, item: WdItem): string[] {
  return [...new Set([...unpackDates(data.bases[item[3]] ?? ""), ...unpackDates(item[4])])].sort();
}

export function itemPage(data: Pick<WdData, "townPrefix">, item: WdItem): string {
  return item[2] === "*" ? `/ca/festius/${item[0]}/` : item[2] || `${data.townPrefix}${item[0]}/`;
}

export interface ItemInfo {
  kind: "e" | "r" | "t" | "c";
  local2026: boolean;
  local2027: boolean;
  councilPending: boolean;
  island: boolean;
}

export function itemInfo(item: WdItem): ItemInfo {
  const s = item[5];
  return { kind: s[0] as ItemInfo["kind"], local2026: s[1] === "1", local2027: s[2] === "1", councilPending: s.includes("p"), island: s.includes("i") };
}

/* -------------------------------------------------------------------------- */
/* The default example (server-rendered, the same in the calculator)          */
/* -------------------------------------------------------------------------- */

/**
 * Notified on Monday 30 November 2026, 10 días hábiles, administrative rules:
 * in Madrid 7 and 8 December are inhábiles, in Barcelona only the 8th, so the
 * two places end a day apart (tests hold both).
 */
export const DEFAULT_EXAMPLE = { notified: "2026-11-30", amount: 10, unit: "working" as Unit, rules: "admin" as RuleSet };
export const DEFAULT_PLACE: Record<WdLocale, string> = { es: "madrid/madrid", ca: "barcelona", en: "barcelona" };
/** The count mode's default span: December 2026. */
export const DEFAULT_SPAN = { from: "2026-12-01", to: "2026-12-31" };

/* -------------------------------------------------------------------------- */
/* Words                                                                      */
/* -------------------------------------------------------------------------- */

export function dateText(iso: string, locale: WdLocale): string {
  return longDate(iso, locale);
}

export function shortDate(iso: string, locale: WdLocale): string {
  return dayMonthYear(iso, locale);
}

export interface CalcCopy {
  title: string;
  intro: string;
  noscript: string;
  mode: string;
  modes: Record<"deadline" | "count", string>;
  rules: string;
  rulesName: Record<RuleSet, string>;
  rulesHelp: Record<RuleSet, string>;
  place: string;
  placeHelp: Record<RuleSet, string>;
  otherPlace: string;
  secondPlace: string;
  secondPlaceNone: string;
  secondPlaceHelp: string;
  saturdays: string;
  notified: string;
  notifiedHelp: string;
  amount: string;
  maxText: (n: number) => string;
  unit: string;
  unitName: Record<Unit, string>;
  judicialUnitNote: string;
  from: string;
  to: string;
  includeFrom: string;
  /* results */
  lastDay: string;
  firstDay: string;
  movedLine: (nominal: string, reasons: string) => string;
  grace: (day: string) => string;
  workingInside: string;
  calendarInside: string;
  workingCount: string;
  calendarCount: string;
  nonWorkingCount: string;
  skippedTitle: (n: number) => string;
  reason: Record<Reason, string>;
  errors: Record<"invalid" | "order" | "range" | "amount" | "unit", string>;
  /* what is counted */
  countedTitle: string;
  counted: (info: ItemInfo, place: string) => string[];
  holidaysTitle: (n: number) => string;
  placePage: (place: string) => string;
  disclaimer: string;
}

const AND: Record<WdLocale, string> = { es: " y ", ca: " i ", en: " and " };
export const joinWords = (parts: string[], locale: WdLocale) =>
  parts.length <= 1 ? (parts[0] ?? "") : `${parts.slice(0, -1).join(", ")}${AND[locale]}${parts.at(-1)}`;

export const CALC_COPY: Record<WdLocale, CalcCopy> = {
  es: {
    title: "Calcula tus días hábiles",
    intro: "Elige si quieres saber el último día de un plazo o cuántos días hábiles hay entre dos fechas, el tipo de cómputo y el lugar. Funciona con los festivos oficiales de 2026 y 2027.",
    noscript: "Sin JavaScript ves el ejemplo de abajo (10 días hábiles administrativos desde el 30 de noviembre de 2026). Para tus fechas, activa JavaScript.",
    mode: "¿Qué quieres calcular?",
    modes: { deadline: "El último día de un plazo", count: "Días hábiles entre dos fechas" },
    rules: "Tipo de cómputo",
    rulesName: { admin: "Plazo administrativo (Ley 39/2015)", judicial: "Plazo judicial (LOPJ y LEC)", general: "Días laborables (trabajo)" },
    rulesHelp: {
      admin: "Sábados, domingos y festivos nacionales, autonómicos y locales son inhábiles. Agosto es hábil.",
      judicial: "Además de sábados, domingos y festivos, son inhábiles todo agosto y del 24 de diciembre al 6 de enero.",
      general: "De lunes a viernes, sin los festivos del lugar. Marca la casilla si trabajas los sábados.",
    },
    place: "Lugar",
    placeHelp: { admin: "Tu municipio. Si el órgano está en otro, márcalo abajo.", judicial: "Donde está el juzgado o tribunal.", general: "Donde trabajas." },
    otherPlace: "El órgano que lleva el procedimiento está en otro lugar",
    secondPlace: "Sede del órgano, si es otro lugar",
    secondPlaceNone: "El mismo lugar",
    secondPlaceHelp: "Un día inhábil en tu municipio o en el del órgano es inhábil para el plazo (art. 30.6).",
    saturdays: "Trabajo los sábados (el sábado cuenta como laborable)",
    notified: "Fecha de notificación o publicación",
    notifiedHelp: "El plazo empieza a contar al día siguiente.",
    amount: "Duración del plazo",
    maxText: (n) => `Máximo: ${n}`,
    unit: "Unidad",
    unitName: { working: "días hábiles", calendar: "días naturales", months: "meses" },
    judicialUnitNote: "En modo judicial solo se calculan plazos por días hábiles: los plazos por meses se cuentan de fecha a fecha (LEC art. 133.3) y cada jurisdicción tiene reglas propias para agosto.",
    from: "Desde",
    to: "Hasta",
    includeFrom: "Contar también el primer día",
    lastDay: "Último día del plazo",
    firstDay: "Empieza a contar",
    movedLine: (nominal, reasons) => `El plazo acababa el ${nominal}, que es inhábil (${reasons}): pasa al primer día hábil siguiente.`,
    grace: (day) => `En la jurisdicción civil, el escrito se puede presentar hasta las 15:00 del ${day} (LEC art. 135.5).`,
    workingInside: "Días hábiles dentro del plazo",
    calendarInside: "Días naturales dentro del plazo",
    workingCount: "Días hábiles",
    calendarCount: "Días naturales",
    nonWorkingCount: "Días inhábiles",
    skippedTitle: (n) => `Ver los ${n} días inhábiles`,
    reason: { holiday: "festivo", august: "agosto (inhábil judicial)", christmas: "24 dic.–6 ene. (inhábil judicial)", sunday: "domingo", saturday: "sábado" },
    errors: {
      invalid: "Escribe una fecha válida.",
      order: "La fecha final es anterior a la inicial.",
      range: "Solo tenemos los festivos oficiales de 2026 y 2027: el cálculo tiene que caber entre el 1 de enero de 2026 y el 31 de diciembre de 2027.",
      amount: "Escribe un número entero dentro del máximo.",
      unit: "Esa unidad no existe para este tipo de cómputo.",
    },
    countedTitle: "Qué festivos contamos aquí",
    counted: (info, place) => {
      const out: string[] = [];
      if (info.kind === "e") out.push("Solo los festivos que el BOE marca para todas las comunidades. Los autonómicos y locales de tu lugar no están: elige tu comunidad, tu ciudad o tu municipio.");
      if (info.kind === "r") out.push(`Los festivos nacionales y autonómicos de ${place} de 2026 y 2027 (BOE y boletín de la comunidad).${info.local2026 || info.local2027 ? " También la fiesta local que comparte toda la comunidad." : " Sin fiestas locales: elige tu municipio si lo tenemos."}`);
      if (info.kind === "t" || info.kind === "c") {
        out.push("Festivos nacionales y autonómicos de 2026 y 2027.");
        out.push(info.local2026 ? "Fiestas locales de 2026: incluidas." : "Fiestas locales de 2026: no las tenemos para este lugar, no se cuentan.");
        out.push(
          info.local2027
            ? "Fiestas locales de 2027: incluidas, del boletín oficial."
            : info.councilPending
              ? "Fiestas locales de 2027: el ayuntamiento ya las ha aprobado, pero el DOGC aún no las ha publicado. No se cuentan hasta la orden."
              : "Fiestas locales de 2027: aún no publicadas en el boletín oficial, no se cuentan.",
        );
        if (info.island) out.push("Incluye la fiesta insular de cada año.");
      }
      return out;
    },
    holidaysTitle: (n) => `Los ${n} festivos que contamos para este lugar`,
    placePage: (place) => `Calendario de festivos de ${place}`,
    disclaimer: "Cálculo orientativo. El plazo que vale es el de tu notificación: comprueba la fecha en que la recibiste, si el plazo es en días hábiles, naturales o meses, y el calendario de días inhábiles del órgano competente.",
  },
  ca: {
    title: "Calcula els teus dies hàbils",
    intro: "Tria si vols saber l'últim dia d'un termini o quants dies hàbils hi ha entre dues dates, el tipus de còmput i el lloc. Funciona amb els festius oficials del 2026 i el 2027.",
    noscript: "Sense JavaScript veus l'exemple de sota (10 dies hàbils administratius des del 30 de novembre de 2026). Per a les teves dates, activa JavaScript.",
    mode: "Què vols calcular?",
    modes: { deadline: "L'últim dia d'un termini", count: "Dies hàbils entre dues dates" },
    rules: "Tipus de còmput",
    rulesName: { admin: "Termini administratiu (Llei 39/2015)", judicial: "Termini judicial (LOPJ i LEC)", general: "Dies laborables (feina)" },
    rulesHelp: {
      admin: "Dissabtes, diumenges i festius nacionals, autonòmics i locals són inhàbils. L'agost és hàbil.",
      judicial: "A més de dissabtes, diumenges i festius, són inhàbils tot l'agost i del 24 de desembre al 6 de gener.",
      general: "De dilluns a divendres, sense els festius del lloc. Marca la casella si treballes els dissabtes.",
    },
    place: "Lloc",
    placeHelp: { admin: "El teu municipi. Si l'òrgan és en un altre, marca-ho a sota.", judicial: "On és el jutjat o tribunal.", general: "On treballes." },
    otherPlace: "L'òrgan que porta el procediment és en un altre lloc",
    secondPlace: "Seu de l'òrgan, si és un altre lloc",
    secondPlaceNone: "El mateix lloc",
    secondPlaceHelp: "Un dia inhàbil al teu municipi o al de l'òrgan és inhàbil per al termini (art. 30.6).",
    saturdays: "Treballo els dissabtes (el dissabte compta com a laborable)",
    notified: "Data de notificació o publicació",
    notifiedHelp: "El termini comença a comptar l'endemà.",
    amount: "Durada del termini",
    maxText: (n) => `Màxim: ${n}`,
    unit: "Unitat",
    unitName: { working: "dies hàbils", calendar: "dies naturals", months: "mesos" },
    judicialUnitNote: "En mode judicial només es calculen terminis per dies hàbils: els terminis per mesos es compten de data a data (LEC art. 133.3) i cada jurisdicció té regles pròpies per a l'agost.",
    from: "Des de",
    to: "Fins a",
    includeFrom: "Comptar també el primer dia",
    lastDay: "Últim dia del termini",
    firstDay: "Comença a comptar",
    movedLine: (nominal, reasons) => `El termini acabava el ${nominal}, que és inhàbil (${reasons}): passa al primer dia hàbil següent.`,
    grace: (day) => `A la jurisdicció civil, l'escrit es pot presentar fins a les 15.00 del ${day} (LEC art. 135.5).`,
    workingInside: "Dies hàbils dins del termini",
    calendarInside: "Dies naturals dins del termini",
    workingCount: "Dies hàbils",
    calendarCount: "Dies naturals",
    nonWorkingCount: "Dies inhàbils",
    skippedTitle: (n) => `Veure els ${n} dies inhàbils`,
    reason: { holiday: "festiu", august: "agost (inhàbil judicial)", christmas: "24 des.–6 gen. (inhàbil judicial)", sunday: "diumenge", saturday: "dissabte" },
    errors: {
      invalid: "Escriu una data vàlida.",
      order: "La data final és anterior a la inicial.",
      range: "Només tenim els festius oficials del 2026 i el 2027: el càlcul ha de cabre entre l'1 de gener de 2026 i el 31 de desembre de 2027.",
      amount: "Escriu un nombre enter dins del màxim.",
      unit: "Aquesta unitat no existeix per a aquest tipus de còmput.",
    },
    countedTitle: "Quins festius comptem aquí",
    counted: (info, place) => {
      const out: string[] = [];
      if (info.kind === "e") out.push("Només els festius que el BOE marca per a totes les comunitats. Els autonòmics i locals del teu lloc no hi són: tria la teva comunitat, ciutat o municipi.");
      if (info.kind === "r") out.push(`Els festius nacionals i autonòmics de ${place} del 2026 i el 2027 (BOE i butlletí de la comunitat).${info.local2026 || info.local2027 ? " També la festa local que comparteix tota la comunitat." : " Sense festes locals: tria el teu municipi si el tenim."}`);
      if (info.kind === "t" || info.kind === "c") {
        out.push("Festius nacionals i autonòmics del 2026 i el 2027.");
        out.push(info.local2026 ? "Festes locals del 2026: incloses." : "Festes locals del 2026: no les tenim per a aquest lloc, no es compten.");
        out.push(
          info.local2027
            ? "Festes locals del 2027: incloses, del butlletí oficial."
            : info.councilPending
              ? "Festes locals del 2027: l'ajuntament ja les ha aprovat, però el DOGC encara no les ha publicades. No es compten fins a l'ordre."
              : "Festes locals del 2027: encara no publicades al butlletí oficial, no es compten.",
        );
        if (info.island) out.push("Inclou la festa insular de cada any.");
      }
      return out;
    },
    holidaysTitle: (n) => `Els ${n} festius que comptem per a aquest lloc`,
    placePage: (place) => `Calendari de festius: ${place}`,
    disclaimer: "Càlcul orientatiu. El termini que val és el de la teva notificació: comprova la data en què la vas rebre, si el termini és en dies hàbils, naturals o mesos, i el calendari de dies inhàbils de l'òrgan competent.",
  },
  en: {
    title: "Work out your working days",
    intro: "Choose whether you want the last day of a deadline or the number of working days between two dates, the counting rules and the place. It uses the official 2026 and 2027 holidays.",
    noscript: "Without JavaScript you see the example below (10 administrative working days from 30 November 2026). Turn JavaScript on for your own dates.",
    mode: "What do you want to work out?",
    modes: { deadline: "The last day of a deadline", count: "Working days between two dates" },
    rules: "Counting rules",
    rulesName: { admin: "Administrative deadline (Ley 39/2015)", judicial: "Court deadline (LOPJ and LEC)", general: "Working days (a job)" },
    rulesHelp: {
      admin: "Saturdays, Sundays and national, regional and local holidays do not count. August counts.",
      judicial: "Besides Saturdays, Sundays and holidays, all of August and 24 December to 6 January do not count.",
      general: "Monday to Friday, without the place's holidays. Tick the box if you work Saturdays.",
    },
    place: "Place",
    placeHelp: { admin: "Where you live. If the authority is elsewhere, tick the box below.", judicial: "Where the court sits.", general: "Where you work." },
    otherPlace: "The authority handling the case is somewhere else",
    secondPlace: "Where the authority sits, if somewhere else",
    secondPlaceNone: "The same place",
    secondPlaceHelp: "A day that is a non-working day where you live or where the authority sits does not count (art. 30.6).",
    saturdays: "I work Saturdays (Saturday counts as a working day)",
    notified: "Date of notification or publication",
    notifiedHelp: "The count starts the next day.",
    amount: "Length of the deadline",
    maxText: (n) => `Maximum: ${n}`,
    unit: "Unit",
    unitName: { working: "working days", calendar: "calendar days", months: "months" },
    judicialUnitNote: "Court mode only counts deadlines in working days: deadlines in months run date to date (LEC art. 133.3) and each jurisdiction has its own rules for August.",
    from: "From",
    to: "To",
    includeFrom: "Count the first day too",
    lastDay: "Last day of the deadline",
    firstDay: "Count starts",
    movedLine: (nominal, reasons) => `The deadline ended on ${nominal}, a non-working day (${reasons}): it moves to the next working day.`,
    grace: (day) => `In civil courts, the filing can be made until 15:00 on ${day} (LEC art. 135.5).`,
    workingInside: "Working days within the deadline",
    calendarInside: "Calendar days within the deadline",
    workingCount: "Working days",
    calendarCount: "Calendar days",
    nonWorkingCount: "Non-working days",
    skippedTitle: (n) => `See the ${n} non-working days`,
    reason: { holiday: "holiday", august: "August (courts)", christmas: "24 Dec–6 Jan (courts)", sunday: "Sunday", saturday: "Saturday" },
    errors: {
      invalid: "Enter a valid date.",
      order: "The end date is before the start date.",
      range: "We only hold the official 2026 and 2027 holidays: the sum has to fit between 1 January 2026 and 31 December 2027.",
      amount: "Enter a whole number within the maximum.",
      unit: "That unit does not exist for these rules.",
    },
    countedTitle: "Which holidays count here",
    counted: (info, place) => {
      const out: string[] = [];
      if (info.kind === "e") out.push("Only the holidays the BOE marks for every region. Your region's and town's own days are not in: pick your region, city or town.");
      if (info.kind === "r") out.push(`The national and regional holidays of ${place} in 2026 and 2027 (BOE and the regional bulletin).${info.local2026 || info.local2027 ? " Also the local holiday the whole region shares." : " No local holidays: pick your town if we have it."}`);
      if (info.kind === "t" || info.kind === "c") {
        out.push("National and regional holidays of 2026 and 2027.");
        out.push(info.local2026 ? "2026 local holidays: included." : "2026 local holidays: we do not hold them for this place, not counted.");
        out.push(
          info.local2027
            ? "2027 local holidays: included, from the official bulletin."
            : info.councilPending
              ? "2027 local holidays: the council has approved them but the DOGC has not published them yet. Not counted until the order is out."
              : "2027 local holidays: not in the official bulletin yet, not counted.",
        );
        if (info.island) out.push("Includes each year's island holiday.");
      }
      return out;
    },
    holidaysTitle: (n) => `The ${n} holidays counted for this place`,
    placePage: (place) => `Holiday calendar: ${place}`,
    disclaimer: "An estimate. The deadline that counts is the one in your notification: check the day you received it, whether the deadline is in working days, calendar days or months, and the competent authority's calendar of non-working days.",
  },
};
