import type { Block } from "@/lib/content/blocks";
import { addDays } from "@/lib/content/holidays/calendar";
import type { Locale } from "@/lib/i18n/config";

import { dateYear, dayDate } from "./festive";
import { B2_PATHS, B2_TITLES, b2Related, b2link, faq, keyFacts, lead, list, paras, table, verifiedLine, type B2Article, type B2Key, type B2Source } from "./shared";
import { CITY_HERO } from "./strike-11n-cities";
import { STRIKES, STRIKES_AS_OF, STRIKES_VERIFIED, isOnDay, type Strike } from "./strikes";
import { SPAIN_NOT_HAPPENING, SPAIN_OPEN_STRIKES, SPAIN_STRIKES, SPAIN_URLS, STRIKES_SPAIN_AS_OF, STRIKES_SPAIN_VERIFIED } from "./strikes-spain-data";
import type { L, SpainStrike } from "./strikes-spain-model";
import { fillChecked, spainDays, strikesOn } from "./strikes-spain";

/**
 * "¿Hay huelga el jueves 19 / el viernes 20 de noviembre?" (17 Nov 2026), two
 * pages in Catalan, Spanish and English.
 *
 * Why (GSC 14-16 Nov 2026): "huelga 20 noviembre 2026" 877 impressions at
 * position 9.6 (0.5 % CTR), "huelga renfe 19 noviembre" 491 at 8.4, "huelga
 * 19 noviembre 2026" 436 at 6.6, "el viernes hay huelga" 259, "este viernes
 * hay huelga" 91, all landing on the Spain hub (/es/guias/huelgas-espana/),
 * whose first screen is the whole week. Each day has enough of its own to
 * answer on a page: on the 19th Adif's traffic controllers (SCF), the SMU
 * doctors' strike with its marches at 18:00, Bizkaia's cleaning strike; on
 * the 20th the students' strike, the doctors, Bizkaia, CSIF's stoppages in
 * Madrid's schools. Two pages, not one "this week" page: the searches name
 * one day each, and "is there a rail strike on the 19th?" is a question of
 * its own (no Renfe call that day).
 *
 * SINGLE SOURCE OF TRUTH: the dated strikes come from SPAIN_STRIKES
 * (`strikes-spain-data.ts`, via `strikesOn`), the airports from
 * SPAIN_OPEN_STRIKES, Catalonia from STRIKES (`strikes.ts`, via `isOnDay`).
 * What this module adds, read on 17 Nov 2026: the SMU's list of marches on
 * the 19th (medicosunidos.es/manifestaciones/) and the indefinite strike in
 * Madrid's state schools (CCOO Madrid, CSIF), which no other page carries.
 *
 * Dates: before / eve / on the day / after from STRIKES_SPAIN_AS_OF only (no
 * clock). The `strikes` and `huelgas-espana` groups republish both, so the
 * strike watch that moves the as-of moves these pages too.
 *
 * 17 Nov 2026 (afternoon): titles open with the searched words ("Huelga 20
 * de noviembre de 2026: …"); the eve says "Mañana, jueves 19…" with the check
 * date; the 20th lists the Sindicato de Estudiantes' mobilisations at 12:00.
 *
 * 18 Nov 2026: SCF called off the 19th at Adif (SCFCOM 38, 17 Nov). The rail
 * entry no longer lists the 19th, so the page has no rail section; the
 * call-off is printed from SPAIN_NOT_HAPPENING ("adif-19-noviembre-
 * desconvocada") under "what is not on that day", and the lead, titles and
 * FAQ say there is no rail strike. Every "Fuentes revisadas" line prints the
 * verification date (STRIKE_DAYS_VERIFIED), never a later as-of day.
 */

export const STRIKE_DAY = { strike19n: "2026-11-19", strike20n: "2026-11-20" } as const;
export type StrikeDayKey = keyof typeof STRIKE_DAY;
/**
 * 17 Nov 2026: "eve" is the as-of day just before the strike day ("Mañana,
 * jueves 19 de noviembre…", with the check date in the same sentence, as the
 * Catalan hub's "Mañana" line). "huelga mañana" / "mañana hay huelga" ~260
 * impressions each at position 8 (GSC, 14 days to 17 Nov).
 */
export type StrikeDayPhase = "before" | "eve" | "today" | "after";

const SMU_ID = "huelga-medicos-smu-2026-11-16";
const RAIL_ID = "huelga-ferroviaria-2026-11-17";
const STUDENTS_ID = "huelga-estudiantil-2026-11-20";
/** 18 Nov 2026: the 19th's Adif strike, called off (SPAIN_NOT_HAPPENING). */
const CALLED_OFF_19N_ID = "adif-19-noviembre-desconvocada";

/** The earlier of the two hubs' verification dates: the page never claims a re-check it did not get. */
export const STRIKE_DAYS_VERIFIED = STRIKES_VERIFIED < STRIKES_SPAIN_VERIFIED ? STRIKES_VERIFIED : STRIKES_SPAIN_VERIFIED;

/** The date the "Fuentes revisadas" lines print for a page built as of `asOf`: the last re-read, never later than the as-of day. */
export function strikeDaysCheckedOn(asOf: string = STRIKES_SPAIN_AS_OF): string {
  return STRIKE_DAYS_VERIFIED < asOf ? STRIKE_DAYS_VERIFIED : asOf;
}

/** The Spain-wide strikes searched for on the day that are not happening (the 19th: Adif, called off). */
export function calledOffOnDay(key: StrikeDayKey) {
  return key === "strike19n" ? SPAIN_NOT_HAPPENING.filter((item) => item.id === CALLED_OFF_19N_ID) : [];
}

export function strikeDayPhase(key: StrikeDayKey, asOf: string = STRIKES_SPAIN_AS_OF): StrikeDayPhase {
  const day = STRIKE_DAY[key];
  if (asOf === addDays(day, -1)) return "eve";
  if (asOf < day) return "before";
  if (asOf === day) return "today";
  return "after";
}

/* -------------------------------------------------------------------------- */
/* Facts this module adds (read on 17 Nov 2026)                               */
/* -------------------------------------------------------------------------- */

export const DAY_URLS = {
  smuMarches: SPAIN_URLS.smuMarches,
  // CCOO Madrid (Federación de Educación), press note of 27 May 2026: "una huelga indefinida convocada por CCOO y UGT".
  ccooMadridCall: "https://docpublicos.ccoo.es/cendoc/073766EscuelaPublicaMadrile%C3%B1a.pdf",
  // CCOO Madrid, 11 Nov 2026: "la huelga indefinida docente"; it will seek "medidas cautelarísimas" against the new minimum-services order.
  ccooMadridMs: "https://www.feccoo-madrid.org/noticia:772317--CCOO_llevara_a_los_tribunales_el_endurecimiento_de_los_servicios_minimos_y_actuara_frente_a_la_retirada_de_carteleria_de_la_huelga",
  // CSIF Educación Madrid: "convoca huelga indefinida a partir del 14 de octubre", partial stoppages 9:00-11:00 and 17:00-19:00 on listed days (20 Nov among them).
  csifMadrid: "https://www.csif.es/es/articulo/comunidaddemadrid/educacion/97107",
} as const;

/** The SMU's marches on Thursday 19 November 2026, all at 18:00, as its page lists them (read 17 Nov 2026). `end` empty: a rally in one place. */
export const SMU_MARCHES_19N: readonly { city: string; start: string; end: string }[] = [
  { city: "Madrid", start: "Plaza de Carlos V", end: "Ministerio de Sanidad (Paseo del Prado, 18-20)" },
  { city: "Barcelona", start: "Plaça de les Drassanes", end: "Plaça d'Espanya" },
  { city: "Sevilla", start: "HUV Rocío (Av. Manuel Siurot, s/n)", end: "Servicio Andaluz de Salud (calle Federico Sánchez Bedoya)" },
  { city: "Bilbao", start: "Plaza del Sagrado Corazón", end: "Plaza de Bizkaia" },
  { city: "Palma", start: "Plaça d'Espanya (frente a la Conselleria de Salut, nº 9)", end: "Delegación del Gobierno (C/ Constitució, 4)" },
  { city: "Santiago de Compostela", start: "Parque de la Alameda", end: "Praza das Praterías" },
  { city: "Granada", start: "Plaza de la Caleta", end: "Gobierno Civil (Gran Vía)" },
  { city: "Vitoria", start: "Plaza de Bilbao", end: "Virgen Blanca" },
  { city: "Santa Cruz de Tenerife", start: "Plaza Weyler", end: "Plaza España" },
  { city: "Albacete", start: "Paseo Circunvalación, frente al Hospital General", end: "Plaza Altozano" },
  { city: "Badajoz", start: "Avenida Santa Marina, 19 (frente al colegio Sagrada Familia)", end: "Avenida de Huelva, 4 (Delegación del Gobierno)" },
  { city: "Burgos", start: "Junta de Castilla y León (Plaza Bilbao, 3)", end: "Teatro Principal (Plaza de Mío Cid)" },
  { city: "León", start: "C/ Ordoño II", end: "Subdelegación del Gobierno (Plaza de la Inmaculada), y vuelta al inicio" },
  { city: "Zaragoza", start: "Paraninfo (Plaza Basilio Paraíso, 4)", end: "" },
  { city: "Valladolid", start: "Plaza Fuente Dorada", end: "" },
  { city: "Murcia", start: "Consejería de Salud (Ronda de Levante, 11)", end: "" },
  { city: "Alicante", start: "Plaza de la Montanyeta", end: "" },
  { city: "Santander", start: "Plaza de Valdecilla", end: "" },
  { city: "Palencia", start: "Plaza Pío XII (COM Palencia)", end: "" },
  { city: "Jaén", start: "Subdelegación del Gobierno (Plaza de las Batallas)", end: "" },
];

/**
 * The Sindicato de Estudiantes' mobilisations on Friday 20 November 2026, all
 * at 12:00, as its 20N page lists them ("MOVILIZACIONES 12H", read 17 Nov
 * 2026, SPAIN_URLS.students). Places verbatim; city names in their usual
 * form (the page writes Bilbo, Gasteiz, Xixón, Uviéu, Compostela, Alacant,
 * Castelló).
 */
export const STUDENT_DEMOS_20N: readonly { city: string; place: string }[] = [
  { city: "Madrid", place: "Sol" },
  { city: "Barcelona", place: "Plaça Universitat" },
  { city: "Tarragona", place: "Plaça Imperial Tàrraco" },
  { city: "Sevilla", place: "Plaza San Francisco" },
  { city: "Málaga", place: "Plaza de la Constitución" },
  { city: "Granada", place: "Jardines del Triunfo" },
  { city: "Córdoba", place: "Plaza de las Tendillas" },
  { city: "A Coruña", place: "Obelisco" },
  { city: "Vigo", place: "Farola Urzáiz" },
  { city: "Ferrol", place: "Edificio Xunta" },
  { city: "Santiago de Compostela", place: "Alameda" },
  { city: "Bilbao", place: "Ayuntamiento" },
  { city: "Vitoria-Gasteiz", place: "Virgen Blanca" },
  { city: "Gijón", place: "Plaza Parchís" },
  { city: "Oviedo", place: "Plaza Escandalera" },
  { city: "València", place: "Facultat d'Història" },
  { city: "Alicante", place: "Escales Jorge Juan" },
  { city: "Castellón", place: "Plaça Maria Agustina" },
  { city: "Palencia", place: "Estatua de la Mujer Palentina" },
  { city: "Salamanca", place: "Plaza de los Bandos" },
  { city: "Valladolid", place: "Fuente Dorada" },
  { city: "Segovia", place: "Plaza del Azoguejo" },
  { city: "Santander", place: "Plaza de Numancia" },
  { city: "Murcia", place: "Plaza de la Merced (Pº Menéndez Pelayo, 2)" },
];

const MADRID_SOURCES: B2Source[] = [
  { name: "La escuela pública madrileña abrirá en septiembre con una huelga indefinida (nota de prensa, 27 de mayo de 2026)", url: DAY_URLS.ccooMadridCall, publisher: "Federación de Educación de CCOO Madrid" },
  { name: "CCOO llevará a los tribunales el endurecimiento de los servicios mínimos (11 de noviembre de 2026)", url: DAY_URLS.ccooMadridMs, publisher: "Federación de Educación de CCOO Madrid" },
  { name: "CSIF Educación Madrid convoca huelga indefinida a partir del 14 de octubre", url: DAY_URLS.csifMadrid, publisher: "CSIF Educación Madrid" },
];

/* -------------------------------------------------------------------------- */
/* Copy                                                                       */
/* -------------------------------------------------------------------------- */

const link = (href: string, label: string) => `[${label}](${href})`;
const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const heading = (level: 2 | 3, text: string, id?: string): Block => ({ type: "heading", level, text, ...(id ? { id } : {}) }) as Block;
const strip = (text: string) => text.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

interface DayCopy {
  /** The first line: who, where, hours and minimum services, in the searched words. `checked`: the as-of day, named beside "mañana". */
  lead: (phase: StrikeDayPhase, checked: string) => string;
  /** The first FAQ question on the eve and on the day ("¿Hay huelga mañana…?", "¿Hay huelga hoy…?"). */
  firstQuestion: Partial<Record<StrikeDayPhase, string>>;
  title: string;
  seoTitle: string;
  description: Record<StrikeDayPhase, string>;
  excerpt: string;
  /** Day-only section (the 19th: the doctors' marches; the 20th: is there school?). */
  extraHeading: string;
  extraId: string;
  extra: () => Block[];
  /** What is not called that day. */
  notCalled: string;
  faq: { question: string; answer: string }[];
}

interface Copy {
  factsTitle: (day: string) => string;
  allHeading: (day: string) => string;
  allId: string;
  scope: string;
  hours: string;
  calledBy: string;
  ms: string;
  more: string;
  madridHeading: string;
  madridId: string;
  madrid: (onTwentieth: boolean) => string[];
  madridLabel: string;
  madridValue: (onTwentieth: boolean) => string;
  airportsHeading: string;
  airportsId: string;
  airportsIntro: string;
  catalanHeading: string;
  catalanId: string;
  catalanIntro: (day: string) => string;
  catalanHub: (link: string) => string;
  notHeading: string;
  notId: string;
  nextLinks: (locale: Locale) => string[];
  checked: (checked: string) => string;
  days: Record<StrikeDayKey, DayCopy>;
}

const marchRows = (locale: Locale): string[][] =>
  SMU_MARCHES_19N.map((m) => [m.city, m.start, m.end || { ca: "Concentració", es: "Concentración", en: "Rally (no march)" }[locale]]);

const demoRows = (): string[][] => STUDENT_DEMOS_20N.map((d) => [d.city, d.place]);

const COPY: Record<Locale, Copy> = {
  es: {
    factsTitle: (day) => `Las huelgas del ${day}, de un vistazo`,
    allHeading: (day) => `Todas las huelgas convocadas el ${day}`,
    allId: "huelgas",
    scope: "A quién afecta",
    hours: "Horario",
    calledBy: "Quién convoca",
    ms: "Servicios mínimos",
    more: "Más información",
    madridHeading: "Madrid: huelga indefinida en la enseñanza pública",
    madridId: "madrid-educacion",
    madrid: (twentieth) => [
      `**Qué es:** la enseñanza pública no universitaria de la Comunidad de Madrid está en huelga indefinida desde el 14 de octubre de 2026, convocada por CCOO y UGT, según ${link(DAY_URLS.ccooMadridCall, "la nota de CCOO Madrid")}, y por CSIF Educación Madrid (${link(DAY_URLS.csifMadrid, "su convocatoria")}). El 11 de noviembre CCOO seguía hablando de «la huelga indefinida docente» (${link(DAY_URLS.ccooMadridMs, "su comunicado")}).`,
      twentieth
        ? `**El viernes 20:** CSIF convoca ese día paros parciales de 9.00 a 11.00 y de 17.00 a 19.00 h, según ${link(DAY_URLS.csifMadrid, "su calendario")}.`
        : `**El jueves 19:** no es uno de los días de paros parciales de CSIF (el siguiente es el viernes 20, de 9.00 a 11.00 y de 17.00 a 19.00 h, según ${link(DAY_URLS.csifMadrid, "su calendario")}); la huelga indefinida sigue convocada.`,
      `**Servicios mínimos:** los fija la Comunidad de Madrid. CCOO ha recurrido los vigentes y anunció el 11 de noviembre que pedirá medidas cautelarísimas contra la nueva orden con la que la Consejería quiere endurecerlos (${link(DAY_URLS.ccooMadridMs, "CCOO Madrid")}). Pregunta en tu centro qué clases se mantienen.`,
    ],
    madridLabel: "Madrid, enseñanza pública",
    madridValue: (twentieth) =>
      twentieth ? "Huelga indefinida desde el 14 de octubre; CSIF, paros de 9.00 a 11.00 y de 17.00 a 19.00 h" : "Huelga indefinida desde el 14 de octubre (sin paros de CSIF ese día)",
    airportsHeading: "Aeropuertos: huelgas indefinidas que siguen",
    airportsId: "aeropuertos",
    airportsIntro: "No tienen día propio: siguen abiertas, con servicios mínimos del Ministerio de Transportes. Si vuelas, mira el estado de tu vuelo en tu aerolínea.",
    catalanHeading: "En Cataluña",
    catalanId: "cataluna",
    catalanIntro: (day) => `Las huelgas que afectan a Cataluña el ${day}, con sus servicios mínimos:`,
    catalanHub: (href) => `Todas las huelgas en Cataluña, con lo que funciona cada día: ${href}.`,
    notHeading: "Lo que no hay ese día",
    notId: "no-convocado",
    nextLinks: (locale) => [
      b2link("strikesSpain", locale, "Todas las huelgas convocadas en España, día a día"),
      b2link("railStrike17n", locale, B2_TITLES.railStrike17n[locale]),
    ],
    checked: (checked) => `Fuentes revisadas: ${checked}.`,
    days: {
      strike19n: {
        lead: (phase, checked) => {
          const what =
            "sigue la huelga de médicos del Sindicato Médicos Unidos en la sanidad pública de toda España, con urgencias garantizadas y manifestaciones a las 18.00 h en una veintena de ciudades, y sigue la de la limpieza en Bizkaia (ELA). En Madrid continúa la huelga indefinida de la enseñanza pública. No hay huelga de trenes: el sindicato SCF desconvocó la de Adif, y Renfe no estaba convocada. No es una huelga general.";
          if (phase === "after") return "**El jueves 19 de noviembre de 2026 hubo huelga en la sanidad pública (médicos del SMU, con manifestaciones a las 18.00 h) y en la limpieza de Bizkaia;** no fue una huelga general ni de trenes: el SCF desconvocó la de Adif. Más abajo, quién convocó cada una y sus servicios mínimos.";
          if (phase === "today") return `**Hoy, jueves 19 de noviembre, hay huelga, pero no general:** ${what}`;
          if (phase === "eve") return `**Mañana, jueves 19 de noviembre, hay huelga, pero no general:** ${what} Fuentes revisadas el ${checked}.`;
          return `**Sí: el jueves 19 de noviembre de 2026 hay huelga, pero no general:** ${what}`;
        },
        firstQuestion: { eve: "¿Hay huelga mañana, jueves 19 de noviembre de 2026?", today: "¿Hay huelga hoy, jueves 19 de noviembre de 2026?" },
        // 17 Nov 2026 (new page, docs/SEO_EXPERIMENTS.md): the H1 and the title open with the searched words, "huelga 19 noviembre (2026)".
        // 18 Nov 2026: Adif's strike called off (SCFCOM 38): a correctness fix, logged in docs/SEO_EXPERIMENTS.md.
        title: "Huelga 19 de noviembre de 2026: médicos, limpieza en Bizkaia y Madrid; Adif, desconvocada",
        seoTitle: "Huelga 19 de noviembre de 2026: médicos; Adif, desconvocada",
        description: {
          before: "Jueves 19: huelga de médicos (SMU) con manifestaciones a las 18 h y de limpieza en Bizkaia. La de Adif, desconvocada: no hay huelga de trenes.",
          eve: "Mañana jueves 19: huelga de médicos (SMU) con manifestaciones a las 18 h y de limpieza en Bizkaia. Adif, desconvocada: no hay huelga de trenes.",
          today: "Hoy jueves 19: huelga de médicos (SMU) con manifestaciones a las 18 h y de limpieza en Bizkaia. Adif, desconvocada: no hay huelga de trenes.",
          after: "El 19 de noviembre de 2026 hubo huelga de médicos (SMU) y de limpieza en Bizkaia; la de Adif se desconvocó. Quién convocó cada una.",
        },
        excerpt: "Las huelgas del jueves 19 de noviembre de 2026 en España: médicos (SMU) y sus manifestaciones, limpieza en Bizkaia, Madrid y aeropuertos; Adif, desconvocada.",
        extraHeading: "Manifestaciones de médicos el jueves 19 a las 18.00 h",
        extraId: "manifestaciones",
        extra: () => [
          ...paras(`El Sindicato Médicos Unidos convoca a las 18.00 h del jueves 19 estas manifestaciones y concentraciones, según ${link(DAY_URLS.smuMarches, "su lista")}. En Valencia, la convocatoria es del miércoles 18, a la misma hora.`),
          table("Manifestaciones del SMU el jueves 19 de noviembre de 2026, 18.00 h", ["Ciudad", "Salida", "Llegada"], marchRows("es"), "Tal como las publica el sindicato; donde no hay recorrido, es una concentración."),
        ],
        notCalled:
          "No hay huelga general ni de trenes: el SCF desconvocó el paro del personal de circulación de Adif, y Renfe, Iryo y Ouigo no están convocados el jueves 19. El metro, los autobuses y los tranvías no forman parte de ninguna convocatoria estatal ese día.",
        faq: [
          { question: "¿Hay huelga el jueves 19 de noviembre de 2026?", answer: "Sí, pero no general: sigue la huelga de médicos del Sindicato Médicos Unidos en la sanidad pública, con manifestaciones a las 18.00 h, y la de la limpieza en Bizkaia. En Madrid sigue la huelga indefinida de la enseñanza pública. La huelga de Adif (SCF) se desconvocó." },
          { question: "¿Hay huelga de Renfe el 19 de noviembre?", answer: "No: el 19 no hay ninguna convocatoria en Renfe, Iryo ni Ouigo, y el sindicato SCF desconvocó el 17 de noviembre el paro de 24 horas del personal de circulación de Adif, después de que la empresa aceptara sus reivindicaciones. Ese día no queda ninguna huelga ferroviaria convocada." },
          { question: "¿Hay huelga de médicos el 19 de noviembre?", answer: "Sí: el Sindicato Médicos Unidos mantiene su huelga en la sanidad pública de todas las comunidades desde las 8.00 h del 16 hasta las 8.00 h del 28 de noviembre, con manifestaciones el 19 a las 18.00 h. Las urgencias funcionan: cada comunidad fija sus servicios mínimos." },
          { question: "¿Dónde es la manifestación de médicos del 19 de noviembre?", answer: "En una veintena de ciudades a las 18.00 h. En Madrid, de la plaza de Carlos V al Ministerio de Sanidad; en Barcelona, de las Drassanes a la plaza de España; en Sevilla, del Hospital Virgen del Rocío al Servicio Andaluz de Salud." },
        ],
      },
      strike20n: {
        lead: (phase, checked) => {
          const what =
            "huelga de estudiantes en toda España (Sindicato de Estudiantes, toda la jornada lectiva, desde 3.º de ESO, con movilizaciones a las 12 h; no es una huelga laboral), y siguen la huelga de médicos del Sindicato Médicos Unidos en la sanidad pública, con las urgencias garantizadas, y la de la limpieza en Bizkaia (ELA). En Madrid, la enseñanza pública sigue en huelga indefinida y CSIF convoca paros de 9.00 a 11.00 y de 17.00 a 19.00 h. No hay huelga general ni de trenes.";
          if (phase === "after") return "**El viernes 20 de noviembre de 2026 hubo huelga de estudiantes en toda España,** siguió la de médicos del Sindicato Médicos Unidos y la de la limpieza en Bizkaia, y en Madrid hubo paros en la enseñanza pública. No fue una huelga general.";
          if (phase === "today") return `**Hoy, viernes 20 de noviembre, hay** ${what}`;
          if (phase === "eve") return `**Mañana, viernes 20 de noviembre, hay** ${what} Fuentes revisadas el ${checked}.`;
          return `**Sí: el viernes 20 de noviembre de 2026 hay** ${what}`;
        },
        firstQuestion: { eve: "¿Hay huelga mañana, viernes 20 de noviembre de 2026?", today: "¿Hay huelga hoy, viernes 20 de noviembre de 2026?" },
        // 17 Nov 2026 (new page, docs/SEO_EXPERIMENTS.md): the H1 and the title open with the searched words, "huelga 20 noviembre 2026".
        title: "Huelga 20 de noviembre de 2026: estudiantes, médicos y Madrid. ¿Hay clase?",
        seoTitle: "Huelga 20 de noviembre de 2026: estudiantes y médicos",
        description: {
          before: "Viernes 20: huelga de estudiantes (toda la jornada, movilizaciones a las 12 h), de médicos (SMU) y de limpieza en Bizkaia; paros en Madrid. No es general.",
          eve: "Mañana viernes 20: huelga de estudiantes (toda la jornada, movilizaciones a las 12 h), de médicos (SMU) y de limpieza en Bizkaia; paros en Madrid.",
          today: "Hoy viernes 20: huelga de estudiantes (toda la jornada, movilizaciones a las 12 h), de médicos (SMU) y de limpieza en Bizkaia; paros en Madrid.",
          after: "El 20 de noviembre de 2026 hubo huelga de estudiantes, de médicos (SMU) y de limpieza en Bizkaia, y paros en Madrid: quién convocó cada una.",
        },
        excerpt: "Las huelgas del viernes 20 de noviembre de 2026 en España: estudiantes, médicos (SMU), limpieza en Bizkaia, educación en Madrid y aeropuertos.",
        extraHeading: "¿Hay clase el viernes 20?",
        extraId: "hay-clase",
        extra: () => [
          ...paras(
            `**Sí, los colegios e institutos abren.** La huelga del 20 es de estudiantes, no del profesorado: el Sindicato de Estudiantes la comunica a cada dirección como una decisión colectiva de los alumnos desde 3.º de ESO, que el artículo 8 de la Ley Orgánica 8/1985 permite sin sanción si se comunica antes al centro (${link(SPAIN_URLS.studentsNotice, "su comunicación oficial")}). Los alumnos más pequeños tienen clase con normalidad.`,
            "**En Madrid** es distinto: allí el profesorado de la enseñanza pública está en huelga indefinida y CSIF para el 20 de 9.00 a 11.00 y de 17.00 a 19.00 h, con los servicios mínimos de la Comunidad. Lo detallamos más abajo.",
          ),
          heading(2, "Manifestaciones de estudiantes el viernes 20 a las 12 h", "manifestaciones"),
          ...paras(`El Sindicato de Estudiantes convoca movilizaciones a las 12 h del viernes 20 en estas ciudades, según ${link(SPAIN_URLS.students, "su convocatoria")}.`),
          table("Movilizaciones del Sindicato de Estudiantes el viernes 20 de noviembre de 2026, 12 h", ["Ciudad", "Lugar"], demoRows(), "Tal como las publica el sindicato."),
        ],
        notCalled:
          "No hay huelga general, ni de trenes: el Ministerio de Transportes no tiene ninguna resolución de servicios mínimos ferroviarios para el viernes 20 y ningún sindicato ferroviario ha convocado ese día. El metro, los autobuses y los tranvías no forman parte de ninguna convocatoria estatal.",
        faq: [
          { question: "¿Hay huelga el viernes 20 de noviembre de 2026?", answer: "Sí, pero no general: huelga de estudiantes en toda España convocada por el Sindicato de Estudiantes, la huelga de médicos del Sindicato Médicos Unidos, que sigue, y la de la limpieza en Bizkaia. En Madrid, paros en la enseñanza pública. No hay huelga de trenes." },
          { question: "¿Hay huelga de estudiantes el 20 de noviembre?", answer: "Sí: el Sindicato de Estudiantes la convoca en toda la jornada lectiva del viernes 20, desde 3.º de ESO, con movilizaciones a las 12 h, dentro de una jornada estudiantil europea contra las guerras y el militarismo. No es una huelga laboral." },
          { question: "¿Dónde son las manifestaciones de estudiantes del 20 de noviembre?", answer: "A las 12 h, en una veintena de ciudades. En Madrid, en Sol; en Barcelona, en la plaça Universitat; en Sevilla, en la plaza San Francisco; en València, en la Facultat d'Història; en Bilbao, en el Ayuntamiento." },
          { question: "¿Hay clase el viernes 20 de noviembre?", answer: "Sí: los centros abren y el profesorado no está convocado, salvo en Madrid, donde la enseñanza pública está en huelga indefinida y CSIF convoca paros de 9.00 a 11.00 y de 17.00 a 19.00 h." },
          { question: "¿Hay huelga de trenes el viernes 20?", answer: "No: el Ministerio de Transportes no tiene ninguna resolución de servicios mínimos ferroviarios para el 20 y ningún sindicato ferroviario ha convocado ese día. La próxima huelga de trenes es la de los maquinistas del Grupo Renfe (SEMAF), el lunes 23, de 0.01 a 23.59 h." },
        ],
      },
    },
  },
  ca: {
    factsTitle: (day) => `Les vagues del ${day}, d'un cop d'ull`,
    allHeading: (day) => `Totes les vagues convocades el ${day}`,
    allId: "vagues",
    scope: "A qui afecta",
    hours: "Horari",
    calledBy: "Qui la convoca",
    ms: "Serveis mínims",
    more: "Més informació",
    madridHeading: "Madrid: vaga indefinida a l'ensenyament públic",
    madridId: "madrid-educacio",
    madrid: (twentieth) => [
      `**Què és:** l'ensenyament públic no universitari de la Comunitat de Madrid és en vaga indefinida des del 14 d'octubre de 2026, convocada per CCOO i UGT, segons ${link(DAY_URLS.ccooMadridCall, "la nota de CCOO Madrid")}, i per CSIF Educación Madrid (${link(DAY_URLS.csifMadrid, "la seva convocatòria")}). L'11 de novembre CCOO continuava parlant de «la huelga indefinida docente» (${link(DAY_URLS.ccooMadridMs, "el seu comunicat")}).`,
      twentieth
        ? `**El divendres 20:** CSIF hi convoca aturades parcials de 9.00 a 11.00 i de 17.00 a 19.00 h, segons ${link(DAY_URLS.csifMadrid, "el seu calendari")}.`
        : `**El dijous 19:** no és un dels dies d'aturades parcials de CSIF (el següent és el divendres 20, de 9.00 a 11.00 i de 17.00 a 19.00 h, segons ${link(DAY_URLS.csifMadrid, "el seu calendari")}); la vaga indefinida continua convocada.`,
      `**Serveis mínims:** els fixa la Comunitat de Madrid. CCOO ha recorregut els vigents i va anunciar l'11 de novembre que demanarà mesures cautelaríssimes contra la nova ordre amb què la conselleria els vol endurir (${link(DAY_URLS.ccooMadridMs, "CCOO Madrid")}). Pregunta al teu centre quines classes es mantenen.`,
    ],
    madridLabel: "Madrid, ensenyament públic",
    madridValue: (twentieth) =>
      twentieth ? "Vaga indefinida des del 14 d'octubre; CSIF, aturades de 9.00 a 11.00 i de 17.00 a 19.00 h" : "Vaga indefinida des del 14 d'octubre (sense aturades de CSIF aquell dia)",
    airportsHeading: "Aeroports: vagues indefinides que continuen",
    airportsId: "aeroports",
    airportsIntro: "No tenen dia propi: continuen obertes, amb serveis mínims del Ministeri de Transports. Si voles, mira l'estat del teu vol a la teva aerolínia.",
    catalanHeading: "A Catalunya",
    catalanId: "catalunya",
    catalanIntro: (day) => `Les vagues que afecten Catalunya el ${day}, amb els seus serveis mínims:`,
    catalanHub: (href) => `Totes les vagues a Catalunya, amb el que funciona cada dia: ${href}.`,
    notHeading: "El que no hi ha aquell dia",
    notId: "no-convocat",
    nextLinks: (locale) => [
      b2link("strikesSpain", locale, "Totes les vagues convocades a Espanya, dia a dia"),
      b2link("railStrike17n", locale, B2_TITLES.railStrike17n[locale]),
    ],
    checked: (checked) => `Fonts revisades: ${checked}.`,
    days: {
      strike19n: {
        lead: (phase, checked) => {
          const what =
            "continua la vaga de metges del Sindicato Médicos Unidos a la sanitat pública de tot Espanya, amb les urgències garantides i manifestacions a les 18.00 h en una vintena de ciutats, també Barcelona, i continua la de la neteja a Biscaia (ELA). A Madrid continua la vaga indefinida de l'ensenyament públic. No hi ha vaga de trens: el sindicat SCF va desconvocar la d'Adif, i Renfe no hi estava convocada. No és una vaga general.";
          if (phase === "after") return "**El dijous 19 de novembre de 2026 hi va haver vaga a la sanitat pública (metges de l'SMU, amb manifestacions a les 18.00 h) i a la neteja de Biscaia;** no va ser una vaga general ni de trens: l'SCF va desconvocar la d'Adif. Més avall, qui va convocar cadascuna i els seus serveis mínims.";
          if (phase === "today") return `**Avui, dijous 19 de novembre, hi ha vaga, però no general:** ${what}`;
          if (phase === "eve") return `**Demà, dijous 19 de novembre, hi ha vaga, però no general:** ${what} Fonts revisades el ${checked}.`;
          return `**Sí: el dijous 19 de novembre de 2026 hi ha vaga, però no general:** ${what}`;
        },
        firstQuestion: { eve: "Hi ha vaga demà, dijous 19 de novembre de 2026?", today: "Hi ha vaga avui, dijous 19 de novembre de 2026?" },
        title: "Vaga 19 de novembre de 2026: metges, neteja a Biscaia i Madrid; Adif, desconvocada",
        seoTitle: "Vaga 19 de novembre de 2026: metges; Adif, desconvocada",
        description: {
          before: "Dijous 19: vaga de metges (SMU) amb manifestacions a les 18 h, també a Barcelona, i de neteja a Biscaia. Adif, desconvocada: no hi ha vaga de trens.",
          eve: "Demà dijous 19: vaga de metges (SMU) amb manifestacions a les 18 h, també a Barcelona, i de neteja a Biscaia. Adif, desconvocada: no hi ha vaga de trens.",
          today: "Avui dijous 19: vaga de metges (SMU) amb manifestacions a les 18 h, també a Barcelona, i de neteja a Biscaia. Adif, desconvocada: no hi ha vaga de trens.",
          after: "El 19 de novembre de 2026 hi va haver vaga de metges (SMU) i de neteja a Biscaia; la d'Adif es va desconvocar. Qui va convocar cadascuna.",
        },
        excerpt: "Les vagues del dijous 19 de novembre de 2026 a Espanya: metges (SMU) i les seves manifestacions, neteja a Biscaia, Madrid i aeroports; Adif, desconvocada.",
        extraHeading: "Manifestacions de metges el dijous 19 a les 18.00 h",
        extraId: "manifestacions",
        extra: () => [
          ...paras(`El Sindicato Médicos Unidos convoca a les 18.00 h del dijous 19 aquestes manifestacions i concentracions, segons ${link(DAY_URLS.smuMarches, "la seva llista")}. A València, la convocatòria és del dimecres 18, a la mateixa hora.`),
          table("Manifestacions de l'SMU el dijous 19 de novembre de 2026, 18.00 h", ["Ciutat", "Sortida", "Arribada"], marchRows("ca"), "Tal com les publica el sindicat; on no hi ha recorregut, és una concentració."),
        ],
        notCalled:
          "No hi ha vaga general ni de trens: l'SCF va desconvocar l'aturada del personal de circulació d'Adif, i Renfe, Iryo i Ouigo no hi estan convocats el dijous 19. El metro, els autobusos i els tramvies no formen part de cap convocatòria estatal aquell dia.",
        faq: [
          { question: "Hi ha vaga el dijous 19 de novembre de 2026?", answer: "Sí, però no general: continua la vaga de metges del Sindicato Médicos Unidos a la sanitat pública, amb manifestacions a les 18.00 h, i la de la neteja a Biscaia. A Madrid continua la vaga indefinida de l'ensenyament públic. La vaga d'Adif (SCF) es va desconvocar." },
          { question: "Hi ha vaga de Renfe el 19 de novembre?", answer: "No: el 19 no hi ha cap convocatòria a Renfe, Iryo ni Ouigo, i el sindicat SCF va desconvocar el 17 de novembre l'aturada de 24 hores del personal de circulació d'Adif, després que l'empresa acceptés les seves reivindicacions. Aquell dia no queda cap vaga ferroviària convocada." },
          { question: "Hi ha vaga de metges el 19 de novembre?", answer: "Sí: el Sindicato Médicos Unidos manté la vaga a la sanitat pública de totes les comunitats des de les 8.00 h del 16 fins a les 8.00 h del 28 de novembre, amb manifestacions el 19 a les 18.00 h. A Catalunya continua també la vaga indefinida de Metges de Catalunya. Les urgències funcionen." },
          { question: "On és la manifestació de metges del 19 de novembre?", answer: "En una vintena de ciutats a les 18.00 h. A Barcelona, de la plaça de les Drassanes a la plaça d'Espanya; a Madrid, de la plaça de Carlos V al Ministeri de Sanitat; a Palma, de la plaça d'Espanya a la Delegació del Govern." },
        ],
      },
      strike20n: {
        lead: (phase, checked) => {
          const what =
            "vaga d'estudiants a tot Espanya (Sindicato de Estudiantes, tota la jornada lectiva, des de 3r d'ESO, amb mobilitzacions a les 12 h; no és una vaga laboral), i continuen la vaga de metges del Sindicato Médicos Unidos a la sanitat pública, amb les urgències garantides, i la de la neteja a Biscaia (ELA). A Madrid, l'ensenyament públic continua en vaga indefinida i CSIF hi convoca aturades de 9.00 a 11.00 i de 17.00 a 19.00 h. No hi ha vaga general ni de trens.";
          if (phase === "after") return "**El divendres 20 de novembre de 2026 hi va haver vaga d'estudiants a tot Espanya,** va continuar la de metges del Sindicato Médicos Unidos i la de la neteja a Biscaia, i a Madrid hi va haver aturades a l'ensenyament públic. No va ser una vaga general.";
          if (phase === "today") return `**Avui, divendres 20 de novembre, hi ha** ${what}`;
          if (phase === "eve") return `**Demà, divendres 20 de novembre, hi ha** ${what} Fonts revisades el ${checked}.`;
          return `**Sí: el divendres 20 de novembre de 2026 hi ha** ${what}`;
        },
        firstQuestion: { eve: "Hi ha vaga demà, divendres 20 de novembre de 2026?", today: "Hi ha vaga avui, divendres 20 de novembre de 2026?" },
        title: "Vaga 20 de novembre de 2026: estudiants, metges i Madrid. Hi ha classe?",
        seoTitle: "Vaga 20 de novembre de 2026: estudiants i metges",
        description: {
          before: "Divendres 20: vaga d'estudiants (tota la jornada, mobilitzacions a les 12 h), de metges (SMU) i de neteja a Biscaia; aturades a Madrid. No és general.",
          eve: "Demà divendres 20: vaga d'estudiants (tota la jornada, mobilitzacions a les 12 h), de metges (SMU) i de neteja a Biscaia; aturades a Madrid.",
          today: "Avui divendres 20: vaga d'estudiants (tota la jornada, mobilitzacions a les 12 h), de metges (SMU) i de neteja a Biscaia; aturades a Madrid.",
          after: "El 20 de novembre de 2026 hi va haver vaga d'estudiants, de metges (SMU) i de neteja a Biscaia, i aturades a Madrid: qui va convocar cadascuna.",
        },
        excerpt: "Les vagues del divendres 20 de novembre de 2026 a Espanya: estudiants, metges (SMU), neteja a Biscaia, educació a Madrid i aeroports.",
        extraHeading: "Hi ha classe el divendres 20?",
        extraId: "hi-ha-classe",
        extra: () => [
          ...paras(
            `**Sí, les escoles i els instituts obren.** La vaga del 20 és d'estudiants, no del professorat: el Sindicato de Estudiantes la comunica a cada direcció com una decisió col·lectiva dels alumnes des de 3r d'ESO, que l'article 8 de la Llei orgànica 8/1985 permet sense sanció si es comunica abans al centre (${link(SPAIN_URLS.studentsNotice, "la seva comunicació oficial")}). Els alumnes més petits tenen classe amb normalitat.`,
            "**A Madrid** és diferent: allà el professorat de l'ensenyament públic és en vaga indefinida i CSIF s'hi atura el 20 de 9.00 a 11.00 i de 17.00 a 19.00 h, amb els serveis mínims de la Comunitat. Ho detallem més avall.",
          ),
          heading(2, "Manifestacions d'estudiants el divendres 20 a les 12 h", "manifestacions"),
          ...paras(`El Sindicato de Estudiantes convoca mobilitzacions a les 12 h del divendres 20 en aquestes ciutats, segons ${link(SPAIN_URLS.students, "la seva convocatòria")}; a Catalunya, a la plaça Universitat de Barcelona i a la plaça Imperial Tàrraco de Tarragona.`),
          table("Mobilitzacions del Sindicato de Estudiantes el divendres 20 de novembre de 2026, 12 h", ["Ciutat", "Lloc"], demoRows(), "Tal com les publica el sindicat."),
        ],
        notCalled:
          "No hi ha vaga general, ni de trens: el Ministeri de Transports no té cap resolució de serveis mínims ferroviaris per al divendres 20 i cap sindicat ferroviari hi ha convocat. El metro, els autobusos i els tramvies no formen part de cap convocatòria estatal.",
        faq: [
          { question: "Hi ha vaga el divendres 20 de novembre de 2026?", answer: "Sí, però no general: vaga d'estudiants a tot Espanya convocada pel Sindicato de Estudiantes, la vaga de metges del Sindicato Médicos Unidos, que continua, i la de la neteja a Biscaia. A Madrid, aturades a l'ensenyament públic. No hi ha vaga de trens." },
          { question: "Hi ha vaga d'estudiants el 20 de novembre?", answer: "Sí: el Sindicato de Estudiantes la convoca tota la jornada lectiva del divendres 20, des de 3r d'ESO, amb mobilitzacions a les 12 h, dins una jornada estudiantil europea contra les guerres i el militarisme. No és una vaga laboral." },
          { question: "On són les manifestacions d'estudiants del 20 de novembre?", answer: "A les 12 h, en una vintena de ciutats. A Barcelona, a la plaça Universitat; a Tarragona, a la plaça Imperial Tàrraco; a Madrid, a Sol; a València, a la Facultat d'Història; a Sevilla, a la plaza San Francisco." },
          { question: "Hi ha classe el divendres 20 de novembre?", answer: "Sí: els centres obren i el professorat no hi està convocat, llevat de Madrid, on l'ensenyament públic és en vaga indefinida i CSIF hi convoca aturades de 9.00 a 11.00 i de 17.00 a 19.00 h." },
          { question: "Hi ha vaga de trens el divendres 20?", answer: "No: el Ministeri de Transports no té cap resolució de serveis mínims ferroviaris per al 20 i cap sindicat ferroviari hi ha convocat. La propera vaga de trens és la dels maquinistes del Grup Renfe (SEMAF), el dilluns 23, de 0.01 a 23.59 h." },
        ],
      },
    },
  },
  en: {
    factsTitle: (day) => `Strikes on ${day} at a glance`,
    allHeading: (day) => `Every strike called on ${day}`,
    allId: "strikes",
    scope: "Who is called out",
    hours: "Hours",
    calledBy: "Called by",
    ms: "Minimum services",
    more: "More",
    madridHeading: "Madrid: open-ended strike in state schools",
    madridId: "madrid-schools",
    madrid: (twentieth) => [
      `**What it is:** state schools (below university) in the Community of Madrid have been on an open-ended strike since 14 October 2026, called by CCOO and UGT, according to ${link(DAY_URLS.ccooMadridCall, "CCOO Madrid's note")}, and by CSIF Educación Madrid (${link(DAY_URLS.csifMadrid, "its call")}). On 11 November CCOO still described it as "la huelga indefinida docente" (the teachers' open-ended strike; ${link(DAY_URLS.ccooMadridMs, "its statement")}).`,
      twentieth
        ? `**On Friday 20:** CSIF calls partial stoppages from 09:00 to 11:00 and from 17:00 to 19:00, according to ${link(DAY_URLS.csifMadrid, "its calendar")}.`
        : `**On Thursday 19:** not one of CSIF's partial-stoppage days (the next is Friday 20, 09:00 to 11:00 and 17:00 to 19:00, according to ${link(DAY_URLS.csifMadrid, "its calendar")}); the open-ended strike stays called.`,
      `**Minimum services:** set by the Community of Madrid. CCOO has appealed the current ones and said on 11 November it will ask for urgent interim measures against the new order with which the regional education department wants to tighten them (${link(DAY_URLS.ccooMadridMs, "CCOO Madrid")}). Ask your school which lessons go ahead.`,
    ],
    madridLabel: "Madrid, state schools",
    madridValue: (twentieth) =>
      twentieth ? "Open-ended strike since 14 October; CSIF stoppages 09:00-11:00 and 17:00-19:00" : "Open-ended strike since 14 October (no CSIF stoppage that day)",
    airportsHeading: "Airports: open-ended strikes that continue",
    airportsId: "airports",
    airportsIntro: "They have no day of their own: they stay open, with minimum services set by the Ministry of Transport. If you are flying, check your flight with your airline.",
    catalanHeading: "In Catalonia",
    catalanId: "catalonia",
    catalanIntro: (day) => `The strikes that touch Catalonia on ${day}, with their minimum services:`,
    catalanHub: (href) => `Every strike in Catalonia, with what runs each day: ${href}.`,
    notHeading: "What is not on that day",
    notId: "not-called",
    nextLinks: (locale) => [
      b2link("strikesSpain", locale, "Every strike called in Spain, day by day"),
      b2link("railStrike17n", locale, B2_TITLES.railStrike17n[locale]),
    ],
    checked: (checked) => `Sources checked: ${checked}.`,
    days: {
      strike19n: {
        lead: (phase, checked) => {
          const what =
            "the Sindicato Médicos Unidos doctors' strike in public healthcare across Spain continues, with A&E guaranteed and marches at 18:00 in some twenty cities, and so does Bizkaia's cleaning strike (ELA). In Madrid the open-ended strike in state schools goes on. There is no rail strike: the SCF union called off Adif's, and Renfe was not called out. It is not a general strike.";
          if (phase === "after") return "**On Thursday 19 November 2026 there were strikes in public healthcare (SMU doctors, with marches at 18:00) and in Bizkaia's cleaning sector;** it was not a general strike and there was no rail strike: SCF called off Adif's. Who called each one and its minimum services are below.";
          if (phase === "today") return `**Today, Thursday 19 November, there are strikes, but not a general strike:** ${what}`;
          if (phase === "eve") return `**Tomorrow, Thursday 19 November, there are strikes in Spain, but not a general strike:** ${what} Sources checked on ${checked}.`;
          return `**Yes: on Thursday 19 November 2026 there are strikes in Spain, but not a general strike:** ${what}`;
        },
        firstQuestion: { eve: "Is there a strike in Spain tomorrow, Thursday 19 November 2026?", today: "Is there a strike in Spain today, Thursday 19 November 2026?" },
        title: "Strike in Spain on 19 November 2026: doctors, Bizkaia cleaning, Madrid schools; Adif called off",
        seoTitle: "Spain strike 19 November 2026: doctors; Adif called off",
        description: {
          before: "Thursday 19: SMU doctors' strike with marches at 18:00 and Bizkaia cleaning strike. Adif's strike was called off: there is no rail strike.",
          eve: "Tomorrow, Thursday 19: SMU doctors' strike with marches at 18:00 and Bizkaia cleaning strike. Adif's was called off: no rail strike.",
          today: "Today, Thursday 19: SMU doctors' strike with marches at 18:00 and Bizkaia cleaning strike. Adif's was called off: no rail strike.",
          after: "On 19 November 2026 SMU doctors and Bizkaia's cleaners were on strike; Adif's strike was called off. Who called each one.",
        },
        excerpt: "Strikes in Spain on Thursday 19 November 2026: SMU doctors and their marches, Bizkaia cleaning, Madrid schools and airports; Adif's was called off.",
        extraHeading: "Doctors' marches on Thursday 19 at 18:00",
        extraId: "marches",
        extra: () => [
          ...paras(`Sindicato Médicos Unidos calls these marches and rallies at 18:00 on Thursday 19, according to ${link(DAY_URLS.smuMarches, "its list")}. Valencia's is on Wednesday 18, at the same time.`),
          table("SMU marches on Thursday 19 November 2026, 18:00", ["City", "Starts at", "Ends at"], marchRows("en"), "As the union lists them; where there is no route, it is a rally in one place."),
        ],
        notCalled:
          "There is no general strike and no rail strike: SCF called off the stoppage by Adif's traffic-control staff, and Renfe, Iryo and Ouigo are not called out on Thursday 19. Metros, buses and trams are not part of any nationwide call that day.",
        faq: [
          { question: "Is there a strike in Spain on Thursday 19 November 2026?", answer: "Yes, but not a general strike: the Sindicato Médicos Unidos doctors' strike in public healthcare continues, with marches at 18:00, and so does Bizkaia's cleaning strike. In Madrid the open-ended strike in state schools goes on. Adif's strike (SCF) was called off." },
          { question: "Is there a Renfe strike on 19 November?", answer: "No: there is no call at Renfe, Iryo or Ouigo on the 19th, and on 17 November the SCF union called off the 24-hour stoppage by Adif's traffic controllers, after Adif accepted its demands. No rail strike is left on that day." },
          { question: "Is there a doctors' strike on 19 November?", answer: "Yes: Sindicato Médicos Unidos keeps its strike in every region's public healthcare from 08:00 on the 16th to 08:00 on 28 November, with marches on the 19th at 18:00. A&E keeps running: each region sets its minimum services." },
          { question: "Where are the doctors' marches on 19 November?", answer: "In some twenty cities at 18:00. In Madrid, from Plaza de Carlos V to the Ministry of Health; in Barcelona, from Plaça de les Drassanes to Plaça d'Espanya; in Seville, from Virgen del Rocío hospital to the Andalusian Health Service." },
        ],
      },
      strike20n: {
        lead: (phase, checked) => {
          const what =
            "a students' strike across Spain (Sindicato de Estudiantes, the whole school day, from the third year of secondary school, with demonstrations at 12:00; not a labour strike), and the Sindicato Médicos Unidos doctors' strike in public healthcare continues, with A&E guaranteed, as does Bizkaia's cleaning strike (ELA). In Madrid, state schools stay on an open-ended strike and CSIF calls stoppages from 09:00 to 11:00 and 17:00 to 19:00. There is no general strike and no rail strike.";
          if (phase === "after") return "**On Friday 20 November 2026 there was a students' strike across Spain,** the Sindicato Médicos Unidos doctors' strike and Bizkaia's cleaning strike went on, and Madrid's state schools had stoppages. It was not a general strike.";
          if (phase === "today") return `**Today, Friday 20 November, there is** ${what}`;
          if (phase === "eve") return `**Tomorrow, Friday 20 November, there is** ${what} Sources checked on ${checked}.`;
          return `**Yes: on Friday 20 November 2026 there is** ${what}`;
        },
        firstQuestion: { eve: "Is there a strike in Spain tomorrow, Friday 20 November 2026?", today: "Is there a strike in Spain today, Friday 20 November 2026?" },
        title: "Strike in Spain on 20 November 2026: students, doctors and Madrid schools. Is there school?",
        seoTitle: "Spain strike 20 November 2026: students and doctors",
        description: {
          before: "Friday 20: students' strike (whole school day, demos at 12:00), SMU doctors' strike, Bizkaia cleaning strike, Madrid school stoppages. Not general.",
          eve: "Tomorrow, Friday 20: students' strike (whole school day, demos at 12:00), SMU doctors' strike, Bizkaia cleaning strike, Madrid school stoppages.",
          today: "Today, Friday 20: students' strike (whole school day, demos at 12:00), SMU doctors' strike, Bizkaia cleaning strike, Madrid school stoppages.",
          after: "On 20 November 2026 students, SMU doctors and Bizkaia's cleaners were on strike, with stoppages in Madrid schools: who called each one.",
        },
        excerpt: "Strikes in Spain on Friday 20 November 2026: students, SMU doctors, Bizkaia cleaning, Madrid's state schools and airports.",
        extraHeading: "Is there school on Friday 20?",
        extraId: "is-there-school",
        extra: () => [
          ...paras(
            `**Yes, schools open.** The 20th is a students' strike, not a teachers' one: Sindicato de Estudiantes notifies each school head of a collective decision by pupils from the third year of secondary school (ESO), which article 8 of Organic Law 8/1985 allows without sanction if the school is told beforehand (${link(SPAIN_URLS.studentsNotice, "its official notice")}). Younger pupils have lessons as usual.`,
            "**Madrid** is different: there, state-school teachers are on an open-ended strike and CSIF stops work on the 20th from 09:00 to 11:00 and 17:00 to 19:00, under the Community's minimum services. Details below.",
          ),
          heading(2, "Students' demonstrations on Friday 20 at 12:00", "demonstrations"),
          ...paras(`Sindicato de Estudiantes calls demonstrations at 12:00 on Friday 20 in these cities, according to ${link(SPAIN_URLS.students, "its call")}.`),
          table("Sindicato de Estudiantes demonstrations on Friday 20 November 2026, 12:00", ["City", "Place"], demoRows(), "As the union lists them."),
        ],
        notCalled:
          "There is no general strike and no rail strike: the Ministry of Transport has no rail minimum-services resolution for Friday 20 and no rail union has called that day. Metros, buses and trams are not part of any nationwide call.",
        faq: [
          { question: "Is there a strike in Spain on Friday 20 November 2026?", answer: "Yes, but not a general strike: a nationwide students' strike called by Sindicato de Estudiantes, the Sindicato Médicos Unidos doctors' strike, which continues, and Bizkaia's cleaning strike. In Madrid, stoppages in state schools. There is no rail strike." },
          { question: "Is there a student strike on 20 November?", answer: "Yes: Sindicato de Estudiantes calls it for the whole school day on Friday 20, from the third year of secondary school, with demonstrations at 12:00, as part of a European student day against war and militarism. It is not a labour strike." },
          { question: "Where are the students' demonstrations on 20 November?", answer: "At 12:00, in some twenty cities. In Madrid, at Sol; in Barcelona, at Plaça Universitat; in Seville, at Plaza San Francisco; in Valencia, at the Facultat d'Història; in Bilbao, at the city hall (Ayuntamiento)." },
          { question: "Is there school on Friday 20 November?", answer: "Yes: schools open and teachers are not called out, except in Madrid, where state schools are on an open-ended strike and CSIF calls stoppages from 09:00 to 11:00 and 17:00 to 19:00." },
          { question: "Is there a rail strike on Friday 20?", answer: "No: the Ministry of Transport has no rail minimum-services resolution for the 20th and no rail union has called that day. The next rail strike is the Renfe Group train drivers' strike (SEMAF) on Monday 23, 00:01 to 23:59." },
        ],
      },
    },
  },
};

/* -------------------------------------------------------------------------- */
/* Body                                                                       */
/* -------------------------------------------------------------------------- */

/** The Spain-wide dated strikes on the day, from SPAIN_STRIKES. */
export function spainStrikesOnDay(key: StrikeDayKey, strikes: SpainStrike[] = SPAIN_STRIKES): SpainStrike[] {
  return strikesOn(STRIKE_DAY[key], strikes);
}

/** The Catalan hub's strikes on the day (an indefinite one counts every day it runs). */
export function catalanStrikesOnDay(key: StrikeDayKey, strikes: Strike[] = STRIKES): Strike[] {
  return strikes.filter((strike) => isOnDay(strike, STRIKE_DAY[key]));
}

function strikeSection(strike: SpainStrike, locale: Locale, page: StrikeDayKey): Block[] {
  const t = COPY[locale];
  const fill = (value: L) => fillChecked(value, locale, strikeDaysCheckedOn());
  // The Catalan hub is linked from its own section; the page never links itself.
  const guides = (strike.guides ?? []).filter((key) => key !== "strikes" && key !== page).map((key: B2Key) => b2link(key, locale, B2_TITLES[key][locale]));
  return [
    heading(3, `${cap(spainDays(strike.dates, locale))}: ${strike.title[locale]}`, strike.id),
    list(
      `**${t.scope}:** ${fill(strike.scope)}`,
      ...(strike.hours ? [`**${t.hours}:** ${fill(strike.hours)}`] : []),
      `**${t.calledBy}:** ${fill(strike.calledBy)}`,
      `**${t.ms}:** ${fill(strike.minimumServices.text)}`,
      ...(guides.length > 0 ? [`**${t.more}:** ${guides.join(" · ")}`] : []),
    ),
  ];
}

export function buildStrikeDayBody(key: StrikeDayKey, locale: Locale, asOf: string = STRIKES_SPAIN_AS_OF): Block[] {
  const t = COPY[locale];
  const d = t.days[key];
  const day = STRIKE_DAY[key];
  const dayName = dayDate(day, locale, false);
  const twentieth = key === "strike20n";
  const phase = strikeDayPhase(key, asOf);
  const spain = spainStrikesOnDay(key);
  const catalan = catalanStrikesOnDay(key);
  // 18 Nov 2026: "Fuentes revisadas" prints the day the sources were re-read, never a later as-of day.
  const checked = dateYear(strikeDaysCheckedOn(asOf), locale);
  const calledOff = calledOffOnDay(key);

  const facts = [
    ...spain.map((strike) => ({ label: cap(strike.title[locale]), value: `${strike.minimumServices.short[locale]}.` })),
    { label: t.madridLabel, value: `${t.madridValue(twentieth)}.` },
  ];

  const first = d.firstQuestion[phase];
  const faqItems = d.faq.map((item, index) => ({ question: index === 0 && first ? first : item.question, answer: strip(item.answer) }));

  return [
    lead(d.lead(phase, dayDate(strikeDaysCheckedOn(asOf), locale))),
    keyFacts(t.factsTitle(dayName), facts),
    heading(2, d.extraHeading, d.extraId),
    ...d.extra(),
    heading(2, t.allHeading(dayName), t.allId),
    ...spain.flatMap((strike) => strikeSection(strike, locale, key)),
    heading(2, t.madridHeading, t.madridId),
    list(...t.madrid(twentieth)),
    heading(2, t.airportsHeading, t.airportsId),
    ...paras(t.airportsIntro),
    list(...SPAIN_OPEN_STRIKES.map((strike) => `**${strike.title[locale]}.** ${fillChecked(strike.text, locale, strikeDaysCheckedOn())}`)),
    heading(2, t.catalanHeading, t.catalanId),
    ...paras(t.catalanIntro(dayName)),
    list(...catalan.map((strike) => `**${cap(strike.title[locale])}.** ${strike.minimumServices.msShort[locale]}.`)),
    ...paras(t.catalanHub(b2link("strikes", locale, B2_TITLES.strikes[locale]))),
    heading(2, t.notHeading, t.notId),
    ...paras(`${d.notCalled} ${t.checked(checked)}`),
    ...(calledOff.length > 0 ? [list(...calledOff.map((item) => `**${item.title[locale]}.** ${fillChecked(item.text, locale, strikeDaysCheckedOn())}`))] : []),
    list(...t.nextLinks(locale), b2link(key === "strike19n" ? "strike20n" : "strike19n", locale, B2_TITLES[key === "strike19n" ? "strike20n" : "strike19n"][locale])),
    ...(phase === "after" ? [] : [faq(faqItems)]),
    ...paras(verifiedLine(locale, STRIKE_DAYS_VERIFIED)),
    ...b2Related(["strikesSpain", "strikes", "strikeRenfe"], locale),
  ];
}

/* -------------------------------------------------------------------------- */
/* Sources and articles                                                       */
/* -------------------------------------------------------------------------- */

/** Every external link the page carries: the day's Spain and Catalan entries, the airports, Madrid, the marches. */
export function strikeDaySources(key: StrikeDayKey): B2Source[] {
  const all: B2Source[] = [];
  const add = (source: B2Source) => {
    if (!all.some((s) => s.url === source.url)) all.push({ name: source.name, url: source.url, publisher: source.publisher });
  };
  for (const strike of spainStrikesOnDay(key)) strike.sources.forEach(add);
  for (const strike of SPAIN_OPEN_STRIKES) strike.sources.forEach(add);
  for (const item of calledOffOnDay(key)) item.sources.forEach(add);
  MADRID_SOURCES.forEach(add);
  return all;
}

export function strikeDayDescription(key: StrikeDayKey, locale: Locale, asOf: string = STRIKES_SPAIN_AS_OF): string {
  return COPY[locale].days[key].description[strikeDayPhase(key, asOf)];
}

const LOCALES: Locale[] = ["ca", "es", "en"];

function editions(key: StrikeDayKey): B2Article["editions"] {
  return Object.fromEntries(
    LOCALES.map((locale) => [
      locale,
      {
        path: B2_PATHS[key][locale],
        title: COPY[locale].days[key].title,
        seoTitle: COPY[locale].days[key].seoTitle,
        seoDescription: strikeDayDescription(key, locale),
        excerpt: COPY[locale].days[key].excerpt,
        blocks: buildStrikeDayBody(key, locale),
      },
    ]),
  ) as B2Article["editions"];
}

/** The 11N city pages' Commons photo (a march beside an EMT bus in Madrid), as the Spain hub uses it. */
const HERO = { heroKey: CITY_HERO.key, heroAlt: { ...CITY_HERO.alt }, heroCaption: { ...CITY_HERO.caption } };

export const STRIKE_19N_GUIDE: B2Article = {
  key: "strike19n",
  entryKey: "guide-strike-19-november-2026-spain",
  categoryKey: "public-services",
  sources: strikeDaySources("strike19n"),
  ...HERO,
  verifiedAt: STRIKE_DAYS_VERIFIED,
  publishedAt: "2026-11-17T13:00:00+01:00",
  editions: editions("strike19n"),
};

export const STRIKE_20N_GUIDE: B2Article = {
  key: "strike20n",
  entryKey: "guide-strike-20-november-2026-spain",
  categoryKey: "public-services",
  sources: strikeDaySources("strike20n"),
  ...HERO,
  verifiedAt: STRIKE_DAYS_VERIFIED,
  publishedAt: "2026-11-17T13:00:00+01:00",
  editions: editions("strike20n"),
};

/** The ids this module expects in the entries (a test checks them). */
export const STRIKE_DAY_IDS = { smu: SMU_ID, rail: RAIL_ID, students: STUDENTS_ID } as const;
/** Exposed for tests: the as-of the pages were built on. */
export const STRIKE_DAYS_AS_OF = { spain: STRIKES_SPAIN_AS_OF, catalan: STRIKES_AS_OF } as const;
