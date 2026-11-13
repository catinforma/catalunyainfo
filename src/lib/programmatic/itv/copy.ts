import { calcPath, calculatorSlugs } from "@/lib/programmatic/calculators/paths";
import { dayMonthYear, longDate, type DateLocale } from "@/lib/programmatic/holidays/format";
import { elDay, euros } from "@/lib/programmatic/rent-update/copy";

import type { CategoryId, Frequency } from "./rules";

/**
 * Paths and words of "¿Cuándo me toca pasar la ITV?", small enough for the
 * browser (the calculator imports this file):
 *
 *   /es/calculadoras/itv/
 *   /ca/calculadores/itv/
 *   /en/calculators/itv-spain/
 *
 * Slugs from the calculators registry; dates in the holiday modules' words
 * (same output in Node and every browser).
 */

export type ItvLocale = DateLocale;
export const ITV_LOCALES: readonly ItvLocale[] = ["es", "ca", "en"];

export const ITV_SLUG: Record<ItvLocale, string> = calculatorSlugs("itv");

export function itvPath(locale: ItvLocale): string {
  return calcPath("itv", locale);
}

export function itvEditions(): Record<ItvLocale, string> {
  return { es: itvPath("es"), ca: itvPath("ca"), en: itvPath("en") };
}

export { elDay, euros };

/** "15 de marzo de 2027" / "15 March 2027". */
export function bareDay(iso: string, locale: ItvLocale): string {
  return dayMonthYear(iso, locale);
}

/** "lunes, 15 de marzo de 2027". */
export function weekdayDay(iso: string, locale: ItvLocale): string {
  return longDate(iso, locale);
}

/** The vehicle categories in the reader's words (the BOE codes follow in brackets). */
export const CATEGORY_LABEL: Record<CategoryId, Record<ItvLocale, string>> = {
  car: { es: "Turismo: coche particular (M1)", ca: "Turisme: cotxe particular (M1)", en: "Car, private use (M1)" },
  motorcycle: { es: "Moto, triciclo, cuadriciclo o quad (L)", ca: "Moto, tricicle, quadricicle o quad (L)", en: "Motorcycle, tricycle, quadricycle or quad (L)" },
  moped: { es: "Ciclomotor de dos ruedas (L1e, hasta 45 km/h)", ca: "Ciclomotor de dues rodes (L1e, fins a 45 km/h)", en: "Two-wheel moped (L1e, up to 45 km/h)" },
  van: { es: "Furgoneta o camión hasta 3,5 t, también mixto (N1)", ca: "Furgoneta o camió fins a 3,5 t, també mixt (N1)", en: "Van or truck up to 3.5 t, also dual-purpose (N1)" },
  caravan: { es: "Caravana remolcada (O2)", ca: "Caravana remolcada (O2)", en: "Towed caravan (O2)" },
  bus: { es: "Autobús o microbús (M2, M3)", ca: "Autobús o microbús (M2, M3)", en: "Bus or minibus (M2, M3)" },
  heavy: { es: "Camión de más de 3,5 t o remolque de carga (N2, N3, O2–O4)", ca: "Camió de més de 3,5 t o remolc de càrrega (N2, N3, O2–O4)", en: "Truck over 3.5 t or goods trailer (N2, N3, O2–O4)" },
  taxi: { es: "Taxi, ambulancia o transporte escolar (M1)", ca: "Taxi, ambulància o transport escolar (M1)", en: "Taxi, ambulance or school transport (M1)" },
  school: { es: "Coche o moto de autoescuela (M1, L)", ca: "Cotxe o moto d'autoescola (M1, L)", en: "Driving-school car or motorcycle (M1, L)" },
  "tractor-fast": { es: "Tractor agrícola de más de 40 km/h (T)", ca: "Tractor agrícola de més de 40 km/h (T)", en: "Farm tractor over 40 km/h (T)" },
  tractor: { es: "Otro tractor agrícola, máquina automotriz o remolque especial", ca: "Un altre tractor agrícola, màquina automotriu o remolc especial", en: "Other farm tractor, self-propelled machine or special trailer" },
  works: { es: "Vehículo especial de obras y servicios (25 km/h o más)", ca: "Vehicle especial d'obres i serveis (25 km/h o més)", en: "Special works vehicle (25 km/h or more)" },
};

export function frequencyText(f: Frequency, locale: ItvLocale): string {
  const t: Record<string, Record<ItvLocale, string>> = {
    exempt: { es: "exento", ca: "exempt", en: "exempt" },
    "6": { es: "cada 6 meses", ca: "cada 6 mesos", en: "every 6 months" },
    "12": { es: "cada año", ca: "cada any", en: "every year" },
    "24": { es: "cada 2 años", ca: "cada 2 anys", en: "every 2 years" },
    "36": { es: "cada 3 años", ca: "cada 3 anys", en: "every 3 years" },
    "48": { es: "cada 4 años", ca: "cada 4 anys", en: "every 4 years" },
  };
  return t[String(f)]![locale];
}

/** "a los 4 años" style age words. */
export function yearsText(n: number, locale: ItvLocale): string {
  if (locale === "en") return n === 1 ? "1 year" : `${n} years`;
  if (locale === "ca") return n === 1 ? "1 any" : `${n} anys`;
  return n === 1 ? "1 año" : `${n} años`;
}

/* -------------------------------------------------------------------------- */
/* Calculator words                                                           */
/* -------------------------------------------------------------------------- */

export interface ItvCalcCopy {
  title: string;
  intro: string;
  noscript: string;
  category: string;
  commonGroup: string;
  otherGroup: string;
  registration: string;
  registrationHint: string;
  last: string;
  lastHint: string;
  previous: string;
  previousHint: string;
  due: string;
  early: (from: string, to: string) => string;
  firstNoEarly: string;
  every: (f: string) => string;
  basis: Record<"first" | "from-last" | "from-previous-expiry" | "assumed-on-time", string>;
  left: (days: number) => string;
  today: string;
  expired: (days: number) => string;
  then: string;
  bandChange: (on: string, years: string, every: string) => string;
  check: string;
  invalid: Record<"dates" | "order" | "future", string>;
  example: string;
}

export const CALC_COPY: Record<ItvLocale, ItvCalcCopy> = {
  es: {
    title: "Calcula cuándo te toca la ITV",
    intro: "Elige el tipo de vehículo y pon la fecha de primera matriculación del permiso de circulación. Si ya pasó alguna ITV, añade la fecha de la última para afinar el resultado.",
    noscript: "Sin JavaScript ves el ejemplo de abajo: un turismo matriculado el 15 de marzo de 2019 que pasó la última ITV el 20 de febrero de 2025, cuando caducaba el 15 de marzo de 2025. Con la tabla de frecuencias de esta página puedes hacer el cálculo a mano.",
    category: "Tipo de vehículo",
    commonGroup: "Los más habituales",
    otherGroup: "Otros vehículos",
    registration: "Fecha de primera matriculación",
    registrationHint: "En el permiso de circulación (casilla «Fecha de primera matriculación»).",
    last: "Fecha de la última ITV favorable (opcional)",
    lastHint: "Si la dejas vacía, suponemos que siempre la has pasado a tiempo.",
    previous: "Fecha en que caducaba la ITV anterior (opcional)",
    previousHint: "Solo si pasaste la última en los 30 días antes de que caducara: así se conserva la fecha.",
    due: "Próxima ITV: pásala antes de este día",
    early: (from, to) => `Puedes adelantarla sin perder días: si la pasas entre ${from} y ${to} (los 30 días naturales anteriores), la siguiente se cuenta desde la fecha de caducidad (art. 6.5).`,
    firstNoEarly: "Es la primera ITV. El art. 6.5 habla de la «inspección anterior», así que la regla de los 30 días no está escrita para la primera: si quieres adelantarla, pregunta a la estación cómo contará la fecha.",
    every: (f) => `Frecuencia que se aplica: ${f}.`,
    basis: {
      first: "Primera ITV: cuando acaba el periodo de exención, contado desde la primera matriculación.",
      "from-last": "Contada desde el día de tu última ITV favorable.",
      "from-previous-expiry": "Contada desde la fecha en que caducaba la anterior, porque la pasaste en los 30 días previos.",
      "assumed-on-time": "Suponiendo que has pasado todas las ITV a tiempo. Si no, añade la fecha de la última.",
    },
    left: (d) => (d === 1 ? "Queda 1 día." : `Quedan ${d} días.`),
    today: "Caduca hoy.",
    expired: (d) => (d === 1 ? "La ITV caducó ayer: no circules con el vehículo hasta pasarla." : `La ITV caducó hace ${d} días: no circules con el vehículo hasta pasarla.`),
    then: "Las siguientes, si pasas cada una a tiempo",
    bandChange: (on, years, every) => `Ojo: el vehículo cumple ${years} ${on}, antes de esa fecha, y a partir de esa edad le toca ${every}. El reglamento no dice si eso adelanta la fecha: mira la del informe de tu última ITV.`,
    check: "La fecha que vale es la del informe de tu última inspección («Fecha próxima inspección») y la del Registro de Vehículos de la DGT.",
    invalid: {
      dates: "Escribe fechas completas y válidas.",
      order: "La última ITV no puede ser anterior a la primera matriculación.",
      future: "La matriculación y la última ITV no pueden ser fechas futuras.",
    },
    example: "Ejemplo",
  },
  ca: {
    title: "Calcula quan et toca l'ITV",
    intro: "Tria el tipus de vehicle i posa la data de primera matriculació del permís de circulació. Si ja ha passat alguna ITV, afegeix la data de l'última per afinar el resultat.",
    noscript: "Sense JavaScript veus l'exemple de sota: un turisme matriculat el 15 de març de 2019 que va passar l'última ITV el 20 de febrer de 2025, quan caducava el 15 de març de 2025. Amb la taula de freqüències d'aquesta pàgina pots fer el càlcul a mà.",
    category: "Tipus de vehicle",
    commonGroup: "Els més habituals",
    otherGroup: "Altres vehicles",
    registration: "Data de primera matriculació",
    registrationHint: "Al permís de circulació (casella «Fecha de primera matriculación»).",
    last: "Data de l'última ITV favorable (opcional)",
    lastHint: "Si la deixes buida, suposem que sempre l'has passada a temps.",
    previous: "Data en què caducava l'ITV anterior (opcional)",
    previousHint: "Només si vas passar l'última en els 30 dies abans que caduqués: així es conserva la data.",
    due: "Propera ITV: passa-la abans d'aquest dia",
    early: (from, to) => `Pots avançar-la sense perdre dies: si la passes entre ${from} i ${to} (els 30 dies naturals anteriors), la següent es compta des de la data de caducitat (art. 6.5).`,
    firstNoEarly: "És la primera ITV. L'art. 6.5 parla de la «inspección anterior», així que la regla dels 30 dies no està escrita per a la primera: si la vols avançar, pregunta a l'estació com comptarà la data.",
    every: (f) => `Freqüència que s'aplica: ${f}.`,
    basis: {
      first: "Primera ITV: quan acaba el període d'exempció, comptat des de la primera matriculació.",
      "from-last": "Comptada des del dia de la teva última ITV favorable.",
      "from-previous-expiry": "Comptada des de la data en què caducava l'anterior, perquè la vas passar en els 30 dies previs.",
      "assumed-on-time": "Suposant que has passat totes les ITV a temps. Si no, afegeix la data de l'última.",
    },
    left: (d) => (d === 1 ? "Queda 1 dia." : `Queden ${d} dies.`),
    today: "Caduca avui.",
    expired: (d) => (d === 1 ? "L'ITV va caducar ahir: no circulis amb el vehicle fins que la passis." : `L'ITV va caducar fa ${d} dies: no circulis amb el vehicle fins que la passis.`),
    then: "Les següents, si passes cadascuna a temps",
    bandChange: (on, years, every) => `Compte: el vehicle fa ${years} ${on}, abans d'aquesta data, i a partir d'aquesta edat li toca ${every}. El reglament no diu si això avança la data: mira la de l'informe de la teva última ITV.`,
    check: "La data que val és la de l'informe de la teva última inspecció («Fecha próxima inspección») i la del Registre de Vehicles de la DGT.",
    invalid: {
      dates: "Escriu dates completes i vàlides.",
      order: "L'última ITV no pot ser anterior a la primera matriculació.",
      future: "La matriculació i l'última ITV no poden ser dates futures.",
    },
    example: "Exemple",
  },
  en: {
    title: "Work out when your ITV is due",
    intro: "Pick the type of vehicle and enter the first registration date from the registration certificate (permiso de circulación). If it has had an ITV already, add the date of the last one for a sharper answer.",
    noscript: "Without JavaScript you see the example below: a car first registered on 15 March 2019 that passed its last ITV on 20 February 2025, when it was due to expire on 15 March 2025. The frequency table on this page lets you do the sum by hand.",
    category: "Type of vehicle",
    commonGroup: "Most common",
    otherGroup: "Other vehicles",
    registration: "First registration date",
    registrationHint: "On the registration certificate (box “Fecha de primera matriculación”).",
    last: "Date of the last passed ITV (optional)",
    lastHint: "Leave it empty and we assume every ITV was passed on time.",
    previous: "Date the previous ITV expired (optional)",
    previousHint: "Only if you passed the last one in the 30 days before it expired: then the old date is kept.",
    due: "Next ITV: pass it before this day",
    early: (from, to) => `You can go early without losing days: pass it between ${from} and ${to} (the 30 calendar days before) and the next one counts from the expiry date (art. 6.5).`,
    firstNoEarly: "This is the first ITV. Art. 6.5 speaks of the “previous inspection”, so the 30-day rule is not written for the first one: if you want to go early, ask the station how it will count the date.",
    every: (f) => `Frequency that applies: ${f}.`,
    basis: {
      first: "First ITV: when the exemption ends, counted from the first registration.",
      "from-last": "Counted from the day of your last passed ITV.",
      "from-previous-expiry": "Counted from the day the previous one expired, because you passed it in the 30 days before.",
      "assumed-on-time": "Assuming every ITV was passed on time. If not, add the date of the last one.",
    },
    left: (d) => (d === 1 ? "1 day left." : `${d} days left.`),
    today: "It expires today.",
    expired: (d) => (d === 1 ? "The ITV expired yesterday: do not drive the vehicle until it passes." : `The ITV expired ${d} days ago: do not drive the vehicle until it passes.`),
    then: "The following ones, if each is passed on time",
    bandChange: (on, years, every) => `Note: the vehicle turns ${years} on ${on}, before that date, and from that age it is due ${every}. The regulation does not say whether that brings the date forward: check the one on your last ITV report.`,
    check: "The date that counts is the one on your last inspection report (“Fecha próxima inspección”) and in the DGT's vehicle register.",
    invalid: {
      dates: "Enter full, valid dates.",
      order: "The last ITV cannot be before the first registration.",
      future: "The registration and the last ITV cannot be in the future.",
    },
    example: "Example",
  },
};

/**
 * The server-rendered example: a private car first registered on 15 March
 * 2019 that passed its last ITV on 20 February 2025, inside the 30 days
 * before its 15 March 2025 expiry → next one before 15 March 2027 (art. 6.5).
 * Fixed dates, so the page reads the same whatever day it was built.
 */
export const EXAMPLE = { category: "car" as CategoryId, firstRegistration: "2019-03-15", lastInspection: "2025-02-20", previousExpiry: "2025-03-15" };

/** "el 15 de marzo de 2027" / "l'1 de gener" / "15 March 2027": a day inside a sentence. */
export function dayInText(iso: string, locale: ItvLocale): string {
  return locale === "en" ? dayMonthYear(iso, "en") : elDay(iso, locale);
}
