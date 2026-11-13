import { dayMonth, dayMonthYear, weekdayDayMonth, weekdayName, type DateLocale } from "@/lib/programmatic/holidays/format";
import { caA, caDe, caStart } from "@/lib/programmatic/holidays/names";

/**
 * Paths and words of the 2027 leave planner ("Com aprofitar les vacances el
 * 2027"), small enough for the browser: the client component imports this
 * file, never `places.ts` (which reads the holiday data).
 *
 *   /ca/festius/2027/aprofitar-vacances/
 *   /es/festivos/2027/aprovechar-vacaciones/
 *   /en/holidays/2027/leave-planner/
 *
 * Static folders beside the 2027 calendar's `[comunitat]` / `[comunidad]` /
 * `[community]`, like the embeddable calendar's page (`embed-2027/places.ts`):
 * no community slug is any of them (a test holds it).
 */

export type LeaveLocale = DateLocale;
export const LEAVE_LOCALES: readonly LeaveLocale[] = ["ca", "es", "en"];
export const LEAVE_YEAR = 2027;

/** The holiday family's root folder in each language (`holidays/paths.ts` ROUTE; a test holds the two together). */
const ROOT: Record<LeaveLocale, string> = { ca: "festius", es: "festivos", en: "holidays" };
export const LEAVE_SLUG: Record<LeaveLocale, string> = { ca: "aprofitar-vacances", es: "aprovechar-vacaciones", en: "leave-planner" };

export function isLeaveLocale(locale: string): locale is LeaveLocale {
  return (LEAVE_LOCALES as readonly string[]).includes(locale);
}

/** "/ca/festius/2027/aprofitar-vacances/". */
export function leavePath(locale: LeaveLocale): string {
  return `/${locale}/${ROOT[locale]}/${LEAVE_YEAR}/${LEAVE_SLUG[locale]}/`;
}

export function leaveEditions(): Record<LeaveLocale, string> {
  return { ca: leavePath("ca"), es: leavePath("es"), en: leavePath("en") };
}

/** A town or city page's link, with the place picked: "#p=sabadell", "#p=andalucia/sevilla". */
export function leaveLinkFor(locale: LeaveLocale, placeId: string): string {
  return `${leavePath(locale)}#p=${placeId}`;
}

/** The place the page opens with (server-rendered, so it works without JavaScript) and the leave it plans. */
export const DEFAULT_PLACE = "barcelona";
export const DEFAULT_LEAVE = 5;
/** `MIN_GAP` (optimizer.ts) in words, for the page's rules (a test holds the two together). */
export const MIN_GAP_WORDS: Record<LeaveLocale, string> = { ca: "tres dies", es: "tres días", en: "three working days" };

/** The id of the "Catalonia-wide days only" entry. */
export const CATALONIA_ID = "catalunya";

/* -------------------------------------------------------------------------- */
/* Statuses                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * How much of a place's 2027 calendar is known, one letter in the browser data:
 *  - "d": the DOGC local order is out; the town's local days are counted;
 *  - "c": the council has approved its days, the DOGC order is not out yet;
 *    counted only when the reader ticks the box;
 *  - "p": a Catalan town with no local days published yet; Catalonia-wide days only;
 *  - "s": a Spanish city whose community has not published its 2027 list yet;
 *  - "n": the order gives days to the town's nuclei only, which differ;
 *  - "r": a whole community or Catalonia, local days left out by design;
 *  - "b": a Spanish city (or Ceuta, Melilla) whose bulletin lists its days;
 *  - "m": the community's list is out and does not include the city.
 */
export type PlaceStatus = "d" | "c" | "p" | "s" | "n" | "r" | "b" | "m";

/* -------------------------------------------------------------------------- */
/* Date words                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * "del dijous 25 al dilluns 29 de març", "del dissabte 30 d'octubre al
 * dilluns 1 de novembre", "del lunes 20 de diciembre de 2027 al domingo 2 de
 * enero de 2028", "Thursday 25 to Monday 29 March".
 */
export function rangeText(from: string, to: string, locale: LeaveLocale): string {
  const sameYear = from.slice(0, 4) === to.slice(0, 4);
  const sameMonth = sameYear && from.slice(0, 7) === to.slice(0, 7);
  const first = sameMonth
    ? `${weekdayName(from, locale)} ${Number(from.slice(8))}`
    : sameYear
      ? weekdayDayMonth(from, locale)
      : `${weekdayName(from, locale)} ${dayMonthYear(from, locale)}`;
  const last = sameYear ? weekdayDayMonth(to, locale) : `${weekdayName(to, locale)} ${dayMonthYear(to, locale)}`;
  return locale === "en" ? `${first} to ${last}` : `del ${first} al ${last}`;
}

/** "dimarts 7 de desembre", for the leave to book. */
export function dayText(iso: string, locale: LeaveLocale): string {
  return weekdayDayMonth(iso, locale);
}

/** "7 de desembre", short. */
export function shortDay(iso: string, locale: LeaveLocale): string {
  return dayMonth(iso, locale);
}

/** "4,4" / "4.4", and "5" rather than "5,0". */
export function ratioText(ratio: number, locale: LeaveLocale): string {
  const fixed = (Math.round(ratio * 10) / 10).toFixed(1).replace(/\.0$/, "");
  return locale === "en" ? fixed : fixed.replace(".", ",");
}

function join(items: string[], locale: LeaveLocale): string {
  const and = locale === "ca" ? "i" : locale === "es" ? "y" : "and";
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} ${and} ${items.at(-1)}`;
}

export function listDays(days: readonly string[], locale: LeaveLocale): string {
  return join(
    days.map((d) => dayText(d, locale)),
    locale,
  );
}

/* -------------------------------------------------------------------------- */
/* The planner's words                                                        */
/* -------------------------------------------------------------------------- */

export interface PlannerCopy {
  title: string;
  intro: string;
  place: string;
  leave: string;
  leaveOption: (n: number) => string;
  saturdays: string;
  council: (dates: string) => string;
  noscript: string;
  daysOff: string;
  leaveUsed: string;
  ratio: string;
  holidaysCounted: string;
  planTitle: (place: string, n: number) => string;
  breakLine: (range: string, days: number) => string;
  take: string;
  /** "els 9 dies laborables del dilluns 4 al divendres 15 de gener". */
  takeBlock: (n: number, range: string) => string;
  holidays: string;
  perDay: (ratio: string) => string;
  noBreaks: string;
  unused: (n: number) => string;
  longestTitle: string;
  longestLine: (n: number, range: string, days: number, take: string) => string;
  listTitle: (n: number) => string;
  page: (place: string) => string;
  status: Record<PlaceStatus, (place: string) => string>;
  /** Shown when the reader has ticked the council box. */
  councilCounted: (place: string) => string;
  saturdaysOn: string;
}

const days = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export const PLANNER_COPY: Record<LeaveLocale, PlannerCopy> = {
  ca: {
    title: "Calcula el teu pla del 2027",
    intro: "Tria el municipi i quants dies de vacances vols fer servir: el pla diu quins dies laborables demanar per fer més dies de festa seguits.",
    place: "Municipi o ciutat",
    leave: "Dies de vacances",
    leaveOption: (n) => days(n, "dia", "dies"),
    saturdays: "També treballo els dissabtes",
    council: (dates) => `Compta-hi les festes locals que ha aprovat l'ajuntament (${dates}), pendents de l'ordre del DOGC`,
    noscript: "Sense JavaScript, el càlcul es queda en l'exemple: Barcelona amb 5 dies de vacances.",
    daysOff: "Dies de festa seguits, en total",
    leaveUsed: "Dies de vacances que demanes",
    ratio: "Dies de festa per cada dia de vacances",
    holidaysCounted: "Festius que cauen en dia laborable",
    planTitle: (place, n) => `El pla per ${caA(place)} amb ${days(n, "dia", "dies")}, del pont que més rendeix al que menys`,
    breakLine: (range, d) => `${range.charAt(0).toUpperCase()}${range.slice(1)}: ${d} dies seguits`,
    take: "Demana",
    takeBlock: (n, range) => `els ${n} dies laborables ${range}`,
    holidays: "Festius",
    perDay: (r) => `${r} dies de festa per dia de vacances`,
    noBreaks: "Amb aquests festius no hi ha cap pont on fer servir els dies de vacances.",
    unused: (n) => `Et sobren ${days(n, "dia", "dies")}: cap pont més els aprofita. Guarda'ls per a l'estiu o per allargar algun dels de dalt.`,
    longestTitle: "Si prefereixes unes vacances llargues de cop",
    longestLine: (n, range, d, take) => `Amb ${days(n, "dia", "dies")}, el bloc més llarg de l'any és ${range}: ${d} dies seguits. Demana ${take}.`,
    listTitle: (n) => `Els ${n} festius que hem comptat`,
    page: (place) => `Tots els festius del 2027 ${caA(place)}`,
    status: {
      d: (p) => `Amb els festius de tot Catalunya i les dues festes locals ${caDe(p)} de l'ordre del DOGC.`,
      c: (p) => `L'ordre del DOGC amb les festes locals del 2027 encara no ha sortit (se sol publicar al desembre): el càlcul fa servir només els festius de tot Catalunya. L'Ajuntament ${caDe(p)} ja ha aprovat les seves; marca la casella per comptar-les.`,
      p: (p) => `Les festes locals ${caDe(p)} del 2027 encara no s'han publicat (l'ordre del DOGC se sol publicar al desembre): el càlcul fa servir només els festius de tot Catalunya.`,
      s: (p) => `Les festes locals ${caDe(p)} del 2027 encara no s'han publicat: el càlcul fa servir només els festius de la comunitat.`,
      n: (p) => `${caStart(caA(p))} les festes locals són diferents a cada nucli: el càlcul fa servir només els festius de tot Catalunya.`,
      r: (p) => `Només els festius de tota la comunitat (${p}), sense festes locals: les de cada municipi s'hi afegeixen.`,
      b: (p) => `Amb els festius de la comunitat i les festes locals ${caDe(p)} publicades al butlletí oficial.`,
      m: (p) => `La llista oficial de festes locals del 2027 ja ha sortit però no hi consta ${p}: el càlcul fa servir només els festius de la comunitat.`,
    },
    councilCounted: (p) => `Inclou les dues festes locals que ha aprovat l'Ajuntament ${caDe(p)}, pendents de l'ordre del DOGC.`,
    saturdaysOn: "Comptem el dissabte com a dia laborable: els festius que cauen en dissabte també afegeixen un dia de festa.",
  },
  es: {
    title: "Calcula tu plan de 2027",
    intro: "Elige el municipio y cuántos días de vacaciones quieres usar: el plan dice qué días laborables pedir para encadenar más días de fiesta seguidos.",
    place: "Municipio o ciudad",
    leave: "Días de vacaciones",
    leaveOption: (n) => days(n, "día", "días"),
    saturdays: "También trabajo los sábados",
    council: (dates) => `Contar las fiestas locales que ha aprobado el ayuntamiento (${dates}), pendientes de la orden del DOGC`,
    noscript: "Sin JavaScript, el cálculo se queda en el ejemplo: Barcelona con 5 días de vacaciones.",
    daysOff: "Días de fiesta seguidos, en total",
    leaveUsed: "Días de vacaciones que pides",
    ratio: "Días de fiesta por cada día de vacaciones",
    holidaysCounted: "Festivos que caen en día laborable",
    planTitle: (place, n) => `El plan para ${place} con ${days(n, "día", "días")}, del puente que más rinde al que menos`,
    breakLine: (range, d) => `${range.charAt(0).toUpperCase()}${range.slice(1)}: ${d} días seguidos`,
    take: "Pide",
    takeBlock: (n, range) => `los ${n} días laborables ${range}`,
    holidays: "Festivos",
    perDay: (r) => `${r} días de fiesta por día de vacaciones`,
    noBreaks: "Con estos festivos no hay ningún puente donde usar los días de vacaciones.",
    unused: (n) => `Te sobran ${days(n, "día", "días")}: ningún puente más los aprovecha. Guárdalos para el verano o para alargar alguno de los de arriba.`,
    longestTitle: "Si prefieres unas vacaciones largas de una vez",
    longestLine: (n, range, d, take) => `Con ${days(n, "día", "días")}, el bloque más largo del año es ${range}: ${d} días seguidos. Pide ${take}.`,
    listTitle: (n) => `Los ${n} festivos que hemos contado`,
    page: (place) => `Todos los festivos de 2027 en ${place}`,
    status: {
      d: (p) => `Con los festivos de toda Cataluña y las dos fiestas locales de ${p} de la orden del DOGC.`,
      c: (p) => `La orden del DOGC con las fiestas locales de 2027 aún no ha salido (suele publicarse en diciembre): el cálculo usa solo los festivos de toda Cataluña. El Ayuntamiento de ${p} ya ha aprobado las suyas; marca la casilla para contarlas.`,
      p: (p) => `Las fiestas locales de ${p} de 2027 aún no se han publicado (la orden del DOGC suele salir en diciembre): el cálculo usa solo los festivos de toda Cataluña.`,
      s: (p) => `Las fiestas locales de ${p} de 2027 aún no se han publicado: el cálculo usa solo los festivos de la comunidad.`,
      n: (p) => `En ${p} las fiestas locales son distintas en cada núcleo: el cálculo usa solo los festivos de toda Cataluña.`,
      r: (p) => `Solo los festivos de toda la comunidad (${p}), sin fiestas locales: las de cada municipio se suman.`,
      b: (p) => `Con los festivos de la comunidad y las fiestas locales de ${p} publicadas en el boletín oficial.`,
      m: (p) => `La lista oficial de fiestas locales de 2027 ya ha salido, pero no incluye ${p}: el cálculo usa solo los festivos de la comunidad.`,
    },
    councilCounted: (p) => `Incluye las dos fiestas locales que ha aprobado el Ayuntamiento de ${p}, pendientes de la orden del DOGC.`,
    saturdaysOn: "Contamos el sábado como día laborable: los festivos que caen en sábado también suman un día de fiesta.",
  },
  en: {
    title: "Work out your 2027 plan",
    intro: "Pick the town and how many days of leave you want to use: the plan says which working days to book to get the most days off in a row.",
    place: "Town or city",
    leave: "Days of leave",
    leaveOption: (n) => days(n, "day", "days"),
    saturdays: "I also work Saturdays",
    council: (dates) => `Count the local holidays the council has approved (${dates}), pending the DOGC order`,
    noscript: "Without JavaScript the calculation stays on the example: Barcelona with 5 days of leave.",
    daysOff: "Days off in a row, in total",
    leaveUsed: "Days of leave you book",
    ratio: "Days off per day of leave",
    holidaysCounted: "Holidays on a working day",
    planTitle: (place, n) => `The plan for ${place} with ${days(n, "day", "days")}, from the best value bridge down`,
    breakLine: (range, d) => `${range}: ${d} days off in a row`,
    take: "Book",
    takeBlock: (n, range) => `the ${n} working days from ${range}`,
    holidays: "Holidays",
    perDay: (r) => `${r} days off per day of leave`,
    noBreaks: "With these holidays there is no bridge to spend the leave on.",
    unused: (n) => `${days(n, "day", "days")} left over: no further bridge uses them. Keep them for the summer or to stretch one of the breaks above.`,
    longestTitle: "If you would rather take one long break",
    longestLine: (n, range, d, take) => `With ${days(n, "day", "days")}, the longest block of the year is ${range}: ${d} days off in a row. Book ${take}.`,
    listTitle: (n) => `The ${n} holidays counted`,
    page: (place) => `All 2027 holidays in ${place}`,
    status: {
      d: (p) => `With the Catalonia-wide holidays and ${p}'s two local holidays from the DOGC order.`,
      c: (p) => `The DOGC order with the 2027 local holidays is not out yet (it usually comes in December): the plan uses the Catalonia-wide holidays only. ${p} council has already approved its own; tick the box to count them.`,
      p: (p) => `${p}'s 2027 local holidays are not published yet (the DOGC order usually comes in December): the plan uses the Catalonia-wide holidays only.`,
      s: (p) => `${p}'s 2027 local holidays are not published yet: the plan uses the region's holidays only.`,
      n: (p) => `In ${p} the local holidays differ from one village to the next: the plan uses the Catalonia-wide holidays only.`,
      r: (p) => `Region-wide holidays only (${p}), without local holidays: each town adds its own.`,
      b: (p) => `With the region's holidays and ${p}'s local holidays as the official bulletin publishes them.`,
      m: (p) => `The official 2027 local-holiday list is out but does not include ${p}: the plan uses the region's holidays only.`,
    },
    councilCounted: (p) => `Includes the two local holidays ${p} council has approved, pending the DOGC order.`,
    saturdaysOn: "Saturday counts as a working day: holidays that fall on a Saturday add a day off too.",
  },
};
