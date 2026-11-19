import type { Block } from "@/lib/content/blocks";
import { TRAINS } from "@/lib/content/features/trains";
import { addDays } from "@/lib/content/holidays/calendar";
import type { Locale } from "@/lib/i18n/config";

import { dateYear, dayDate } from "./festive";
import { B2_PATHS, B2_TITLES, b2Related, b2link, faq, keyFacts, lead, list, paras, table, verifiedLine, type B2Article, type B2Key, type B2Source } from "./shared";
import { DAY_URLS, MADRID_SOURCES, STRIKE_DAYS_VERIFIED, strikeDaysCheckedOn, type StrikeDayPhase } from "./strike-days-1920n";
import { STRIKE_GUIDE_SPECS } from "./strike-guides";
import { STRIKES, STRIKES_AS_OF, STRIKE_DAY_PAGES, STRIKE_URLS, isOnDay, type Strike } from "./strikes";
import { SPAIN_OPEN_STRIKES, SPAIN_STRIKES, SPAIN_URLS, STRIKES_SPAIN_AS_OF } from "./strikes-spain-data";
import type { L, SpainStrike } from "./strikes-spain-model";
import { fillChecked, spainDays, strikesOn } from "./strikes-spain";

/**
 * "¿Hay huelga el lunes 23 / el jueves 26 de noviembre?" (19 Nov 2026), two
 * pages in Catalan, Spanish and English, built like the 19N/20N pages
 * (strike-days-1920n.ts), which took "huelga 20 noviembre 2026" from the Spain
 * hub within a day (GSC 18 Nov: the 20N page 17,557 impressions at 7.0).
 *
 * Why: the next two big strike days. Monday 23: SEMAF calls out every Grupo
 * Renfe train driver, 00:01-23:59 (Rodalies 66 % / 33 % by the Generalitat's
 * order of 16 Nov; the Ministry of Transport's resolution for the rest of
 * Renfe not out on 19 Nov), Correos goes on strike in Madrid and five
 * Andalusian provinces (Orden INT/1239/2026), the SMU doctors' strike goes on.
 * Thursday 26: the education strike in Catalonia (CGT's notice, USTEC·STEs and
 * the others; minimum services not out on 19 Nov), the doctors, Correos in
 * Madrid, CSIF's stoppages in Madrid's state schools. "vaga 26 novembre" 567
 * impressions at 5.1 and "el 26 de noviembre hay huelga" 40 at 8.4 (GSC 13-19
 * Nov) land on the education guide and the Spain hub.
 *
 * SINGLE SOURCE OF TRUTH, as on the 19N/20N pages: the dated strikes come from
 * SPAIN_STRIKES (`strikesOn`), the airports from SPAIN_OPEN_STRIKES, Catalonia
 * from STRIKES (`isOnDay`); the 26th's education strike is the Catalan entry
 * "vaga-educacio-2026-11-26". What this module adds, read on 19 Nov 2026
 * (~23:10-23:40 CET; research_notes/x10/strike-days-2326-factpack.md): the
 * table of trains on the 23rd (who sets what, and that the Ministry's part is
 * still pending), SEMAF nº 2026-36 of 19 Nov ("permanece vigente la
 * conflictividad"), the Basque Government's list (no order for the 23rd yet),
 * the table of what runs in Catalonia on the 26th and CSIF's stoppage days.
 *
 * Pending on 19 Nov 2026, printed as pending: the Ministry of Transport's
 * resolution for Grupo Renfe on the 23rd (`MINISTRY_23N_PUBLISHED`) and the
 * Generalitat's order for the 26th (the Catalan entry's status). A test keeps
 * both flags in step with the entries, so an update to the entries that drops
 * "por confirmar" / "pending" fails until this copy is rewritten.
 *
 * Dates: before / eve / on the day / after from STRIKES_SPAIN_AS_OF only (no
 * clock). The `strikes` and `huelgas-espana` groups republish both, and
 * `huelga-23-26n` both on their own.
 */

export const STRIKE_DAY_2326 = { strike23n: "2026-11-23", strike26n: "2026-11-26" } as const;
export type StrikeDay2326Key = keyof typeof STRIKE_DAY_2326;

/**
 * 19 Nov 2026 (23:10 CET): the Ministry of Transport's rail list's newest entry
 * is still its resolution of 12 Nov for the 17th; nothing for the 23rd. Set to
 * true only with the resolution in hand, and rewrite the 23rd's copy (lead,
 * descriptions, table, FAQ) with its figures.
 */
export const MINISTRY_23N_PUBLISHED = false;

const RENFE_ID = "huelga-renfe-2026-11-23";
const CORREOS_ID = "huelga-correos-2026-11-23";
const SMU_ID = "huelga-medicos-smu-2026-11-16";
const EDUCATION_CAT_ID = "vaga-educacio-2026-11-26";
const RENFE_CAT_ID = "vaga-renfe-2026-11-23";

/** The ids this module expects in the entries (a test checks them). */
export const STRIKE_DAY_2326_IDS = { renfe: RENFE_ID, correos: CORREOS_ID, smu: SMU_ID, education: EDUCATION_CAT_ID, renfeCatalan: RENFE_CAT_ID } as const;

export function strikeDay2326Phase(key: StrikeDay2326Key, asOf: string = STRIKES_SPAIN_AS_OF): StrikeDayPhase {
  const day = STRIKE_DAY_2326[key];
  if (asOf === addDays(day, -1)) return "eve";
  if (asOf < day) return "before";
  if (asOf === day) return "today";
  return "after";
}

/* -------------------------------------------------------------------------- */
/* Facts this module adds (read on 19 Nov 2026)                               */
/* -------------------------------------------------------------------------- */

export const DAY2326_URLS = {
  // SEMAF nº 2026-36, 19 Nov 2026: "Al mismo tiempo que permanece vigente la conflictividad, desde SEMAF estamos trabajando y negociando".
  semaf36: "https://www.semaf.org/informaciones/protocolo-actuacion-fenomenos-meteorologicos/",
  // Ministry of Transport's rail list: newest entry on 19 Nov 2026 the resolution of 12 Nov (Grupo Renfe, 17 Nov).
  ministryRail: SPAIN_URLS.ministryRail,
  // Basque Government's list of minimum-services orders: on 19 Nov 2026 none for 23 Nov (its order of 13 Nov covered Renfe's Cercanías on the 17th).
  euskadiList: SPAIN_URLS.euskadiList,
  euskadi17: SPAIN_URLS.euskadi17,
  // The Departament d'Empresa i Treball's list: newest entry on 19 Nov 2026 the 23rd's Rodalies order (17/11); none for the 26th.
  treballMs: STRIKE_URLS.treballMs,
  csifMadrid: DAY_URLS.csifMadrid,
  ccooMadridCall: DAY_URLS.ccooMadridCall,
  ccooMadridMs: DAY_URLS.ccooMadridMs,
  cgtEns26Call: STRIKE_URLS.cgtEns26Call,
  cgtEns26Notice: STRIKE_URLS.cgtEns26Notice,
} as const;

const U = DAY2326_URLS;
const MINISTRY = "Ministerio de Transportes y Movilidad Sostenible";

const EXTRA_SOURCES: Record<StrikeDay2326Key, B2Source[]> = {
  strike23n: [
    { name: "Aprobado el protocolo de actuación ante fenómenos meteorológicos adversos (nº 2026-36, 19 de noviembre de 2026)", url: U.semaf36, publisher: "SEMAF" },
    { name: "Resoluciones de servicios mínimos ferroviarios", url: U.ministryRail, publisher: MINISTRY },
    { name: "Órdenes de servicios mínimos", url: U.euskadiList, publisher: "Gobierno Vasco, Departamento de Trabajo" },
    { name: "Orden de 13 de noviembre de 2026: servicios mínimos del Grupo Renfe (Cercanías de Bilbao y San Sebastián) el 17 de noviembre", url: U.euskadi17, publisher: "Gobierno Vasco, Departamento de Trabajo" },
  ],
  strike26n: [
    { name: "Informació de vagues amb serveis mínims", url: U.treballMs, publisher: "Generalitat de Catalunya, Departament d'Empresa i Treball" },
    { name: "Resoluciones de servicios mínimos ferroviarios", url: U.ministryRail, publisher: MINISTRY },
  ],
};

/* -------------------------------------------------------------------------- */
/* Copy                                                                       */
/* -------------------------------------------------------------------------- */

const link = (href: string, label: string) => `[${label}](${href})`;
const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const heading = (level: 2 | 3, text: string, id?: string): Block => ({ type: "heading", level, text, ...(id ? { id } : {}) }) as Block;
const strip = (text: string) => text.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

interface DayCopy {
  /** The first line: who, where, hours and minimum services, in the searched words. `checked`: the day the sources were re-read. */
  lead: (phase: StrikeDayPhase, checked: string) => string;
  firstQuestion: Partial<Record<StrikeDayPhase, string>>;
  title: string;
  seoTitle: string;
  description: Record<StrikeDayPhase, string>;
  excerpt: string;
  /** Day-only section (the 23rd: the trains; the 26th: is there school in Catalonia?). */
  extraHeading: string;
  extraId: string;
  extra: (checked: string) => Block[];
  /** Madrid's state schools that day (CSIF's stoppage days). */
  madridDay: string;
  madridValue: string;
  notCalled: string;
  /** The day's own guide, under "In Catalonia". */
  catalanGuide: (locale: Locale) => string;
  faq: (checked: string) => { question: string; answer: string }[];
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
  madrid: (day: string) => string[];
  madridLabel: string;
  airportsHeading: string;
  airportsId: string;
  airportsIntro: string;
  catalanHeading: string;
  catalanId: string;
  catalanIntro: (day: string) => string;
  catalanHub: (link: string) => string;
  notHeading: string;
  notId: string;
  spainLink: string;
  checked: (checked: string) => string;
  days: Record<StrikeDay2326Key, DayCopy>;
}

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
    madrid: (day) => [
      `**Qué es:** la enseñanza pública no universitaria de la Comunidad de Madrid está en huelga indefinida desde el 14 de octubre de 2026, convocada por CCOO y UGT, según ${link(U.ccooMadridCall, "la nota de CCOO Madrid")}, y por CSIF Educación Madrid (${link(U.csifMadrid, "su convocatoria")}). El 11 de noviembre CCOO seguía hablando de «la huelga indefinida docente» (${link(U.ccooMadridMs, "su comunicado")}).`,
      day,
      `**Servicios mínimos:** los fija la Comunidad de Madrid. CCOO ha recurrido los vigentes y anunció el 11 de noviembre que pedirá medidas cautelarísimas contra la nueva orden con la que la Consejería quiere endurecerlos (${link(U.ccooMadridMs, "CCOO Madrid")}). Pregunta en tu centro qué clases se mantienen.`,
    ],
    madridLabel: "Madrid, enseñanza pública",
    airportsHeading: "Aeropuertos: huelgas indefinidas que siguen",
    airportsId: "aeropuertos",
    airportsIntro: "No tienen día propio: siguen abiertas, con servicios mínimos del Ministerio de Transportes. Si vuelas, mira el estado de tu vuelo en tu aerolínea.",
    catalanHeading: "En Cataluña",
    catalanId: "cataluna",
    catalanIntro: (day) => `Las huelgas que afectan a Cataluña el ${day}, con sus servicios mínimos:`,
    catalanHub: (href) => `Todas las huelgas en Cataluña, con lo que funciona cada día: ${href}.`,
    notHeading: "Lo que no hay ese día",
    notId: "no-convocado",
    spainLink: "Todas las huelgas convocadas en España, día a día",
    checked: (checked) => `Fuentes revisadas: ${checked}.`,
    days: {
      strike23n: {
        lead: (phase, checked) => {
          const what = `huelga de todos los maquinistas del Grupo Renfe (SEMAF), de 0.01 a 23.59 h. En Rodalies de Catalunya y los regionales, la Generalitat fija el 66% del servicio habitual en hora punta (de 6.00 a 9.30 h y de 17.00 a 20.30 h) y el 33% el resto del día; los servicios mínimos de Cercanías fuera de Cataluña, Media Distancia, AVE y Larga Distancia los fija el Ministerio de Transportes, que el ${checked} aún no los había publicado. Empieza además la huelga de Correos en la Comunidad de Madrid (hasta el 27) y en Cádiz, Córdoba, Huelva, Málaga y Sevilla (hasta el 25), con las oficinas abiertas para el voto por correo, y sigue la de médicos del Sindicato Médicos Unidos. No es una huelga general.`;
          if (phase === "after") return "**El lunes 23 de noviembre de 2026 hubo huelga de maquinistas en el Grupo Renfe (SEMAF),** con el 66% del servicio en hora punta y el 33% el resto del día en Rodalies; empezó la huelga de Correos en Madrid y en cinco provincias andaluzas y siguió la de médicos. No fue una huelga general. Más abajo, quién convocó cada una y sus servicios mínimos.";
          if (phase === "today") return `**Hoy, lunes 23 de noviembre, hay** ${what}`;
          if (phase === "eve") return `**Mañana, lunes 23 de noviembre, hay** ${what}`;
          return `**Sí: el lunes 23 de noviembre de 2026 hay** ${what}`;
        },
        firstQuestion: { eve: "¿Hay huelga mañana, lunes 23 de noviembre de 2026?", today: "¿Hay huelga hoy, lunes 23 de noviembre de 2026?" },
        // 19 Nov 2026 (new page, docs/SEO_EXPERIMENTS.md): the H1 and the title open with the searched words, "huelga 23 noviembre 2026", "huelga renfe 23 noviembre".
        title: "Huelga 23 de noviembre de 2026: Renfe y Rodalies (SEMAF), Correos y médicos",
        seoTitle: "Huelga 23 de noviembre de 2026: Renfe, Rodalies y Correos",
        description: {
          before: "Lunes 23: huelga de maquinistas de Renfe (SEMAF), 0.01-23.59 h. Rodalies, 66% en hora punta y 33%; AVE y Cercanías, por confirmar. Y Correos.",
          eve: "Mañana lunes 23: huelga de maquinistas de Renfe (SEMAF). Rodalies, 66% en hora punta y 33% el resto; AVE y Cercanías, por confirmar. Y Correos.",
          today: "Hoy lunes 23: huelga de maquinistas de Renfe (SEMAF). Rodalies, 66% en hora punta y 33% el resto; AVE y Cercanías, por confirmar. Y Correos.",
          after: "El 23 de noviembre de 2026 hubo huelga de maquinistas de Renfe (SEMAF), con el 66% en hora punta en Rodalies, y empezó la de Correos en Madrid y Andalucía.",
        },
        excerpt: "Las huelgas del lunes 23 de noviembre de 2026: maquinistas de Renfe (SEMAF), con los servicios mínimos de Rodalies, Correos en Madrid y Andalucía, médicos y aeropuertos.",
        extraHeading: "Trenes el lunes 23: qué circula",
        extraId: "trenes",
        extra: (checked) => [
          ...paras(
            `La huelga es de todo el colectivo de maquinistas del Grupo Renfe, de 0.01 a 23.59 h, según la orden de servicios mínimos de la Generalitat del 16 de noviembre (${link(U.treballMs, "lista del Departament d'Empresa i Treball")}). Cada administración fija los servicios mínimos de los trenes que le tocan:`,
          ),
          table(
            "Servicios mínimos de los trenes del Grupo Renfe el lunes 23 de noviembre de 2026",
            ["Servicio", "Servicios mínimos", "Quién los fija"],
            [
              ["Rodalies de Catalunya y regionales de Cataluña", "66% del servicio habitual de 6.00 a 9.30 h y de 17.00 a 20.30 h; 33% el resto del día", "Generalitat (orden del 16 de noviembre)"],
              ["Cercanías fuera de Cataluña", "Pendientes de publicar", "Ministerio de Transportes; en Bilbao y San Sebastián, el Gobierno Vasco (así fue el 17)"],
              ["AVE, Larga Distancia y Media Distancia de Renfe", "Pendientes de publicar", "Ministerio de Transportes"],
              ["Iryo y Ouigo", "Sin convocatoria para el 23 en las fuentes revisadas: la huelga de SEMAF es en el Grupo Renfe", "—"],
              ["Metro, autobuses, tranvías y FGC", "No forman parte de esta huelga", "—"],
            ],
            `Revisado el ${checked}.`,
          ),
          ...paras(
            `**Lo que falta:** el ${checked}, el Ministerio de Transportes aún no tenía resolución para el 23 en ${link(U.ministryRail, "su lista")}; para la huelga de SEMAF del 10 de noviembre la publicó el 6, y para la del 17, el 12. El Gobierno Vasco tampoco tenía orden para el 23 en ${link(U.euskadiList, "su lista")}; la del 17 la fijó por ${link(U.euskadi17, "orden del 13 de noviembre")}.`,
            `**¿Se mantiene?** Sí. SEMAF sustituyó por esta huelga los paros del 12 de noviembre y el 17 escribía «afrontamos el 23 de noviembre como la próxima jornada de movilización» (${link(SPAIN_URLS.semaf35, "comunicado 2026-35")}). El 19, tras aprobar con el Ministerio, Adif y Renfe un protocolo ante fenómenos meteorológicos adversos, seguía en conflicto: «Al mismo tiempo que permanece vigente la conflictividad, desde SEMAF estamos trabajando y negociando» (${link(U.semaf36, "comunicado 2026-36")}).`,
            "**Qué hacer:** mira tu tren la víspera y el mismo día, porque los servicios mínimos no se reparten igual a todas las horas. Si tienes billete de AVE, Larga o Media Distancia, el cambio o la devolución depende de Renfe: sigue lo que publique en renfe.com o te envíe por correo.",
          ),
        ],
        madridDay: "**El lunes 23:** no es uno de los días de paros parciales de CSIF (los siguientes son el martes 24 y el jueves 26, de 9.00 a 11.00 y de 17.00 a 19.00 h, según su calendario); la huelga indefinida sigue convocada.",
        madridValue: "Huelga indefinida desde el 14 de octubre (sin paros de CSIF ese día)",
        notCalled:
          "No es una huelga general. Iryo y Ouigo no tienen convocatoria para el lunes 23 en las fuentes revisadas, y el metro, los autobuses, los tranvías y FGC no forman parte de ninguna. En Andalucía, la huelga de Correos es solo en Cádiz, Córdoba, Huelva, Málaga y Sevilla.",
        catalanGuide: (locale) => b2link("strikeRenfe", locale, "Huelga de Renfe y Rodalies del 23 de noviembre: líneas y servicios mínimos"),
        faq: (checked) => [
          { question: "¿Hay huelga el lunes 23 de noviembre de 2026?", answer: "Sí, pero no general: huelga de todos los maquinistas del Grupo Renfe (SEMAF) de 0.01 a 23.59 h, que afecta a Rodalies, Cercanías, Media Distancia, AVE y Larga Distancia; empieza la huelga de Correos en Madrid y en cinco provincias andaluzas, y sigue la de médicos del Sindicato Médicos Unidos." },
          { question: "¿Hay huelga de Renfe el 23 de noviembre?", answer: "Sí: el sindicato de maquinistas SEMAF convoca a todo el colectivo de maquinistas del Grupo Renfe el lunes 23, de 0.01 a 23.59 h. Sustituye a los paros del 12 de noviembre, que desconvocó, y el 19 de noviembre el sindicato mantenía el conflicto abierto." },
          { question: "¿Qué servicios mínimos hay en Rodalies el 23 de noviembre?", answer: "La orden de la Generalitat del 16 de noviembre fija en Rodalies de Catalunya y los regionales el 66% del servicio habitual en hora punta, de 6.00 a 9.30 h y de 17.00 a 20.30 h, y el 33% el resto del día." },
          { question: "¿Funcionan el AVE y los Cercanías de Madrid el 23 de noviembre?", answer: `Con servicios mínimos, que aún no se conocen: los fija el Ministerio de Transportes, que el ${checked} todavía no había publicado su resolución. Para la huelga de SEMAF del 10 de noviembre la publicó el 6, y para la del 17, el 12.` },
          { question: "¿Afecta la huelga de Correos al voto por correo?", answer: "La orden del Ministerio del Interior obliga a abrir las oficinas de Correos en su horario habitual para el voto por correo, con 1, 2 o 3 empleados por turno según su plantilla, y fija el reparto de los envíos electorales con hasta el 50% de la plantilla del 23 al 25 de noviembre, «coincidiendo con la admisión del voto por correo»." },
        ],
      },
      strike26n: {
        lead: (phase, checked) => {
          const what = `huelga en la educación en toda Cataluña, de 0.00 a 24.00 h y cada trabajador durante su jornada, convocada por USTEC·STEs, CGT, la Intersindical, la COS y la CNT con la Assemblea Educativa de Catalunya: los colegios abren, pero están llamados el profesorado, el personal no docente y el de comedor, ocio y transporte escolar, y los servicios mínimos, que fija la Generalitat, aún no estaban publicados el ${checked}. Siguen la huelga de médicos del Sindicato Médicos Unidos, con las urgencias garantizadas, y la de Correos en la Comunidad de Madrid; en Madrid, CSIF convoca paros en la enseñanza pública de 9.00 a 11.00 y de 17.00 a 19.00 h. No hay huelga general ni de trenes.`;
          if (phase === "after") return "**El jueves 26 de noviembre de 2026 hubo huelga en la educación en Cataluña,** siguieron la de médicos del Sindicato Médicos Unidos y la de Correos en Madrid, y CSIF convocó paros en la enseñanza pública madrileña. No fue una huelga general. Más abajo, quién convocó cada una.";
          if (phase === "today") return `**Hoy, jueves 26 de noviembre, hay** ${what}`;
          if (phase === "eve") return `**Mañana, jueves 26 de noviembre, hay** ${what}`;
          return `**Sí: el jueves 26 de noviembre de 2026 hay** ${what}`;
        },
        firstQuestion: { eve: "¿Hay huelga mañana, jueves 26 de noviembre de 2026?", today: "¿Hay huelga hoy, jueves 26 de noviembre de 2026?" },
        // 19 Nov 2026 (new page, docs/SEO_EXPERIMENTS.md): "huelga 26 noviembre 2026", "huelga educación 26 noviembre".
        title: "Huelga 26 de noviembre de 2026: educación en Cataluña, médicos y Madrid. ¿Hay clase?",
        seoTitle: "Huelga 26 de noviembre de 2026: educación en Cataluña",
        description: {
          before: "Jueves 26: huelga en la educación en Cataluña (toda la jornada; servicios mínimos, pendientes), de médicos (SMU) y de Correos en Madrid; paros en Madrid.",
          eve: "Mañana jueves 26: huelga en la educación en Cataluña (servicios mínimos, pendientes), de médicos (SMU) y de Correos en Madrid; paros en Madrid.",
          today: "Hoy jueves 26: huelga en la educación en Cataluña (servicios mínimos, pendientes), de médicos (SMU) y de Correos en Madrid; paros en Madrid.",
          after: "El 26 de noviembre de 2026 hubo huelga en la educación en Cataluña, de médicos (SMU) y de Correos en Madrid, y paros de CSIF en Madrid. Quién convocó.",
        },
        excerpt: "Las huelgas del jueves 26 de noviembre de 2026: educación en Cataluña (¿hay clase?), médicos (SMU), Correos en Madrid, paros en los colegios de Madrid y aeropuertos.",
        extraHeading: "¿Hay clase el jueves 26 en Cataluña?",
        extraId: "hay-clase",
        extra: (checked) => [
          ...paras(
            `**Sí, los centros abren:** es una huelga del personal, no un cierre, y el jueves 26 es día lectivo. Según ${link(U.cgtEns26Notice, "el preaviso de la CGT")}, que CGT Ensenyament publicó el 18 de noviembre (${link(U.cgtEns26Call, "«us convoquem a la vaga»")}), están llamados el personal docente y no docente de los centros públicos, las escuelas infantiles (escoles bressol), los EAP y los CREDA, y el personal de comedor, acogida, ocio, extraescolares y transporte escolar de los centros públicos, privados y concertados.`,
            `**Servicios mínimos:** los fija el Departament d'Empresa i Treball por orden y el ${checked} aún no estaban en ${link(U.treballMs, "su lista")}. Cuando salgan, cada centro dirá qué garantiza ese día.`,
          ),
          table(
            "Qué funciona el jueves 26 de noviembre de 2026 en Cataluña",
            ["Servicio", "El jueves 26", "Servicios mínimos"],
            [
              ["Escuelas e institutos públicos", "Abren; el profesorado y el personal no docente están convocados", "Pendientes (Generalitat)"],
              ["Escoles bressol, EAP y CREDA", "Convocados", "Pendientes (Generalitat)"],
              ["Comedor, acogida, extraescolares y transporte escolar", "Convocados también en la concertada y la privada: pregunta al centro o a la empresa", "Pendientes (Generalitat)"],
              ["Sanidad pública", "Huelgas de médicos (Sindicato Médicos Unidos y Metges de Catalunya)", "Publicados: urgencias y unidades especiales con normalidad"],
              ["Rodalies, metro, autobuses y FGC", "Sin huelga convocada ese día en las fuentes revisadas", "—"],
            ],
            `Revisado el ${checked}.`,
          ),
          ...paras(`Con las novedades de la huelga en la educación, los servicios mínimos en cuanto salgan y qué deben saber las familias: ${b2link("strikeEducation", "es", "Huelga en la educación del 26 de noviembre en Cataluña: ¿hay colegio?")}.`),
        ],
        madridDay: "**El jueves 26:** CSIF convoca paros parciales de 9.00 a 11.00 y de 17.00 a 19.00 h, según su calendario.",
        madridValue: "Huelga indefinida desde el 14 de octubre; CSIF, paros de 9.00 a 11.00 y de 17.00 a 19.00 h",
        notCalled:
          "No es una huelga general ni de trenes: la huelga de maquinistas de SEMAF es solo el lunes 23 y el Ministerio de Transportes no tiene ninguna resolución de servicios mínimos ferroviarios para el jueves 26. La huelga de Correos en Andalucía terminó el 25; en Madrid sigue hasta el 27.",
        catalanGuide: (locale) => b2link("strikeEducation", locale, B2_TITLES.strikeEducation[locale]),
        faq: (checked) => [
          { question: "¿Hay huelga el jueves 26 de noviembre de 2026?", answer: "Sí, pero no general: huelga en la educación en Cataluña, toda la jornada; siguen la huelga de médicos del Sindicato Médicos Unidos y la de Correos en la Comunidad de Madrid, y en Madrid CSIF convoca paros en la enseñanza pública. No hay huelga de trenes." },
          { question: "¿Hay huelga de educación el 26 de noviembre?", answer: "Sí, en Cataluña: la convocan USTEC·STEs, CGT, la Intersindical, la COS y la CNT con la Assemblea Educativa de Catalunya. Según el preaviso de la CGT, es de 0.00 a 24.00 h en toda Cataluña, cada trabajador durante su jornada, y llama al personal docente y no docente, a las escoles bressol y al personal de comedor, ocio y transporte escolar." },
          { question: "¿Hay clase el jueves 26 de noviembre en Cataluña?", answer: "Sí: los centros abren, porque es una huelga del personal, no un cierre, pero parte del profesorado y del personal de comedor y de transporte escolar puede hacer huelga. Cada centro dirá qué garantiza cuando salgan los servicios mínimos." },
          { question: "¿Qué servicios mínimos hay en los colegios el 26 de noviembre?", answer: `Aún no se conocen: los fija el Departament d'Empresa i Treball por orden, y el ${checked} no estaban publicados. Para la huelga en la educación del 8 de septiembre de 2026, la orden se firmó el 3, cinco días antes.` },
          { question: "¿Hay huelga de profesores en Madrid el 26 de noviembre?", answer: "Sí: la enseñanza pública madrileña sigue en huelga indefinida (CCOO, UGT y CSIF) y el jueves 26 CSIF convoca paros parciales de 9.00 a 11.00 y de 17.00 a 19.00 h." },
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
    madrid: (day) => [
      `**Què és:** l'ensenyament públic no universitari de la Comunitat de Madrid és en vaga indefinida des del 14 d'octubre de 2026, convocada per CCOO i UGT, segons ${link(U.ccooMadridCall, "la nota de CCOO Madrid")}, i per CSIF Educación Madrid (${link(U.csifMadrid, "la seva convocatòria")}). L'11 de novembre CCOO continuava parlant de «la huelga indefinida docente» (${link(U.ccooMadridMs, "el seu comunicat")}).`,
      day,
      `**Serveis mínims:** els fixa la Comunitat de Madrid. CCOO ha recorregut els vigents i va anunciar l'11 de novembre que demanarà mesures cautelaríssimes contra la nova ordre amb què la conselleria els vol endurir (${link(U.ccooMadridMs, "CCOO Madrid")}). Pregunta al teu centre quines classes es mantenen.`,
    ],
    madridLabel: "Madrid, ensenyament públic",
    airportsHeading: "Aeroports: vagues indefinides que continuen",
    airportsId: "aeroports",
    airportsIntro: "No tenen dia propi: continuen obertes, amb serveis mínims del Ministeri de Transports. Si voles, mira l'estat del teu vol a la teva aerolínia.",
    catalanHeading: "A Catalunya",
    catalanId: "catalunya",
    catalanIntro: (day) => `Les vagues que afecten Catalunya el ${day}, amb els seus serveis mínims:`,
    catalanHub: (href) => `Totes les vagues a Catalunya, amb el que funciona cada dia: ${href}.`,
    notHeading: "El que no hi ha aquell dia",
    notId: "no-convocat",
    spainLink: "Totes les vagues convocades a Espanya, dia a dia",
    checked: (checked) => `Fonts revisades: ${checked}.`,
    days: {
      strike23n: {
        lead: (phase, checked) => {
          const what = `vaga de tots els maquinistes del Grup Renfe (SEMAF), de 0.01 a 23.59 h. A Rodalies de Catalunya i els regionals, la Generalitat fixa el 66% del servei habitual en hora punta (de 6.00 a 9.30 h i de 17.00 a 20.30 h) i el 33% la resta del dia; els serveis mínims de Cercanías fora de Catalunya, Mitja Distància, AVE i Llarga Distància els fixa el Ministeri de Transports, que el ${checked} encara no els havia publicat. Comença a més la vaga de Correus a la Comunitat de Madrid (fins al 27) i a Cadis, Còrdova, Huelva, Màlaga i Sevilla (fins al 25), amb les oficines obertes per al vot per correu, i continua la de metges del Sindicato Médicos Unidos. No és una vaga general.`;
          if (phase === "after") return "**El dilluns 23 de novembre de 2026 hi va haver vaga de maquinistes al Grup Renfe (SEMAF),** amb el 66% del servei en hora punta i el 33% la resta del dia a Rodalies; va començar la vaga de Correus a Madrid i a cinc províncies andaluses i va continuar la de metges. No va ser una vaga general. Més avall, qui va convocar cadascuna i els seus serveis mínims.";
          if (phase === "today") return `**Avui, dilluns 23 de novembre, hi ha** ${what}`;
          if (phase === "eve") return `**Demà, dilluns 23 de novembre, hi ha** ${what}`;
          return `**Sí: el dilluns 23 de novembre de 2026 hi ha** ${what}`;
        },
        firstQuestion: { eve: "Hi ha vaga demà, dilluns 23 de novembre de 2026?", today: "Hi ha vaga avui, dilluns 23 de novembre de 2026?" },
        title: "Vaga 23 de novembre de 2026: Renfe i Rodalies (SEMAF), Correus i metges",
        seoTitle: "Vaga 23 de novembre de 2026: Renfe, Rodalies i Correus",
        description: {
          before: "Dilluns 23: vaga de maquinistes de Renfe (SEMAF), 0.01-23.59 h. Rodalies, 66% en hora punta i 33%; AVE i Cercanías, per confirmar. I Correus.",
          eve: "Demà dilluns 23: vaga de maquinistes de Renfe (SEMAF). Rodalies, 66% en hora punta i 33% la resta; AVE i Cercanías, per confirmar. I Correus.",
          today: "Avui dilluns 23: vaga de maquinistes de Renfe (SEMAF). Rodalies, 66% en hora punta i 33% la resta; AVE i Cercanías, per confirmar. I Correus.",
          after: "El 23 de novembre de 2026 hi va haver vaga de maquinistes de Renfe (SEMAF), amb el 66% en hora punta a Rodalies, i va començar la de Correus.",
        },
        excerpt: "Les vagues del dilluns 23 de novembre de 2026: maquinistes de Renfe (SEMAF), amb els serveis mínims de Rodalies, Correus a Madrid i Andalusia, metges i aeroports.",
        extraHeading: "Trens el dilluns 23: què circula",
        extraId: "trens",
        extra: (checked) => [
          ...paras(
            `La vaga és de tot el col·lectiu de maquinistes del Grup Renfe, de 0.01 a 23.59 h, segons l'ordre de serveis mínims de la Generalitat del 16 de novembre (${link(U.treballMs, "llista del Departament d'Empresa i Treball")}). Cada administració fixa els serveis mínims dels trens que li toquen:`,
          ),
          table(
            "Serveis mínims dels trens del Grup Renfe el dilluns 23 de novembre de 2026",
            ["Servei", "Serveis mínims", "Qui els fixa"],
            [
              ["Rodalies de Catalunya i regionals de Catalunya", "66% del servei habitual de 6.00 a 9.30 h i de 17.00 a 20.30 h; 33% la resta del dia", "Generalitat (ordre del 16 de novembre)"],
              ["Cercanías fora de Catalunya", "Pendents de publicar", "Ministeri de Transports; a Bilbao i Sant Sebastià, el Govern Basc (així va ser el 17)"],
              ["AVE, Llarga Distància i Mitja Distància de Renfe", "Pendents de publicar", "Ministeri de Transports"],
              ["Iryo i Ouigo", "Sense convocatòria per al 23 a les fonts revisades: la vaga de SEMAF és al Grup Renfe", "—"],
              ["Metro, autobusos, tramvies i FGC", "No formen part d'aquesta vaga", "—"],
            ],
            `Revisat el ${checked}.`,
          ),
          ...paras(
            `**El que falta:** el ${checked}, el Ministeri de Transports encara no tenia resolució per al 23 a ${link(U.ministryRail, "la seva llista")}; per a la vaga de SEMAF del 10 de novembre la va publicar el 6, i per a la del 17, el 12. El Govern Basc tampoc no tenia ordre per al 23 a ${link(U.euskadiList, "la seva llista")}; la del 17 la va fixar per ${link(U.euskadi17, "ordre del 13 de novembre")}.`,
            `**Es manté?** Sí. SEMAF va substituir per aquesta vaga les aturades del 12 de novembre i el 17 escrivia «afrontamos el 23 de noviembre como la próxima jornada de movilización» (${link(SPAIN_URLS.semaf35, "comunicat 2026-35")}). El 19, després d'aprovar amb el Ministeri, Adif i Renfe un protocol davant fenòmens meteorològics adversos, continuava en conflicte: «Al mismo tiempo que permanece vigente la conflictividad, desde SEMAF estamos trabajando y negociando» (${link(U.semaf36, "comunicat 2026-36")}).`,
            "**Què fer:** mira el teu tren el vespre abans i el mateix dia, perquè els serveis mínims no es reparteixen igual a totes les hores. Si tens bitllet d'AVE, Llarga o Mitja Distància, el canvi o la devolució depèn de Renfe: segueix el que publiqui a renfe.com o t'enviï per correu.",
          ),
        ],
        madridDay: "**El dilluns 23:** no és un dels dies d'aturades parcials de CSIF (els següents són el dimarts 24 i el dijous 26, de 9.00 a 11.00 i de 17.00 a 19.00 h, segons el seu calendari); la vaga indefinida continua convocada.",
        madridValue: "Vaga indefinida des del 14 d'octubre (sense aturades de CSIF aquell dia)",
        notCalled:
          "No és una vaga general. Iryo i Ouigo no tenen convocatòria per al dilluns 23 a les fonts revisades, i el metro, els autobusos, els tramvies i FGC no formen part de cap. A Andalusia, la vaga de Correus és només a Cadis, Còrdova, Huelva, Màlaga i Sevilla.",
        catalanGuide: (locale) => b2link("strikeRenfe", locale, "Vaga de Renfe i Rodalies del 23 de novembre: línies i serveis mínims"),
        faq: (checked) => [
          { question: "Hi ha vaga el dilluns 23 de novembre de 2026?", answer: "Sí, però no general: vaga de tots els maquinistes del Grup Renfe (SEMAF) de 0.01 a 23.59 h, que afecta Rodalies, Cercanías, Mitja Distància, AVE i Llarga Distància; comença la vaga de Correus a Madrid i a cinc províncies andaluses, i continua la de metges del Sindicato Médicos Unidos." },
          { question: "Hi ha vaga de Rodalies el 23 de novembre?", answer: "Sí: el sindicat de maquinistes SEMAF convoca tot el col·lectiu de maquinistes del Grup Renfe, que opera Rodalies, el dilluns 23, de 0.01 a 23.59 h. Substitueix les aturades del 12 de novembre, que va desconvocar, i el 19 de novembre el sindicat mantenia el conflicte obert." },
          { question: "Quins serveis mínims hi ha a Rodalies el 23 de novembre?", answer: "L'ordre de la Generalitat del 16 de novembre fixa a Rodalies de Catalunya i els regionals el 66% del servei habitual en hora punta, de 6.00 a 9.30 h i de 17.00 a 20.30 h, i el 33% la resta del dia." },
          { question: "Funcionen l'AVE i la Llarga Distància el 23 de novembre?", answer: `Amb serveis mínims, que encara no es coneixen: els fixa el Ministeri de Transports, que el ${checked} encara no havia publicat la seva resolució. Per a la vaga de SEMAF del 10 de novembre la va publicar el 6, i per a la del 17, el 12.` },
          { question: "La vaga de Correus afecta el vot per correu?", answer: "L'ordre del Ministeri de l'Interior obliga a obrir les oficines de Correus en el seu horari habitual per al vot per correu, amb 1, 2 o 3 treballadors per torn segons la plantilla, i fixa el repartiment dels enviaments electorals amb fins al 50% de la plantilla del 23 al 25 de novembre, «coincidiendo con la admisión del voto por correo». Aquesta vaga no és a Catalunya: és a Madrid i a cinc províncies andaluses." },
        ],
      },
      strike26n: {
        lead: (phase, checked) => {
          const what = `vaga a l'educació a tot Catalunya, de 0.00 a 24.00 h i cada treballador durant la seva jornada, convocada per USTEC·STEs, CGT, la Intersindical, la COS i la CNT amb l'Assemblea Educativa de Catalunya: les escoles obren, però hi estan cridats el professorat, el personal no docent i el de menjador, lleure i transport escolar, i els serveis mínims, que fixa la Generalitat, encara no s'havien publicat el ${checked}. Continuen la vaga de metges del Sindicato Médicos Unidos, amb les urgències garantides, i la de Correus a la Comunitat de Madrid; a Madrid, CSIF convoca aturades a l'ensenyament públic de 9.00 a 11.00 i de 17.00 a 19.00 h. No hi ha vaga general ni de trens.`;
          if (phase === "after") return "**El dijous 26 de novembre de 2026 hi va haver vaga a l'educació a Catalunya,** van continuar la de metges del Sindicato Médicos Unidos i la de Correus a Madrid, i CSIF va convocar aturades a l'ensenyament públic madrileny. No va ser una vaga general. Més avall, qui va convocar cadascuna.";
          if (phase === "today") return `**Avui, dijous 26 de novembre, hi ha** ${what}`;
          if (phase === "eve") return `**Demà, dijous 26 de novembre, hi ha** ${what}`;
          return `**Sí: el dijous 26 de novembre de 2026 hi ha** ${what}`;
        },
        firstQuestion: { eve: "Hi ha vaga demà, dijous 26 de novembre de 2026?", today: "Hi ha vaga avui, dijous 26 de novembre de 2026?" },
        title: "Vaga 26 de novembre de 2026: educació a Catalunya, metges i Madrid. Hi ha classe?",
        seoTitle: "Vaga 26 de novembre de 2026: educació a Catalunya",
        description: {
          before: "Dijous 26: vaga a l'educació a Catalunya (tota la jornada; serveis mínims, pendents), de metges (SMU) i de Correus a Madrid; aturades a Madrid.",
          eve: "Demà dijous 26: vaga a l'educació a Catalunya (serveis mínims, pendents), de metges (SMU) i de Correus a Madrid; aturades a Madrid.",
          today: "Avui dijous 26: vaga a l'educació a Catalunya (serveis mínims, pendents), de metges (SMU) i de Correus a Madrid; aturades a Madrid.",
          after: "El 26 de novembre de 2026 hi va haver vaga a l'educació a Catalunya, de metges (SMU) i de Correus a Madrid, i aturades de CSIF a Madrid.",
        },
        excerpt: "Les vagues del dijous 26 de novembre de 2026: educació a Catalunya (hi ha classe?), metges (SMU), Correus a Madrid, aturades a les escoles de Madrid i aeroports.",
        extraHeading: "Hi ha classe el dijous 26 a Catalunya?",
        extraId: "hi-ha-classe",
        extra: (checked) => [
          ...paras(
            `**Sí, els centres obren:** és una vaga del personal, no un tancament, i el dijous 26 és dia lectiu. Segons ${link(U.cgtEns26Notice, "el preavís de la CGT")}, que CGT Ensenyament va publicar el 18 de novembre (${link(U.cgtEns26Call, "«us convoquem a la vaga»")}), hi estan cridats el personal docent i no docent dels centres públics, les escoles bressol, els EAP i els CREDA, i el personal de menjador, acollida, lleure, extraescolars i transport escolar dels centres públics, privats i concertats.`,
            `**Serveis mínims:** els fixa el Departament d'Empresa i Treball per ordre i el ${checked} encara no eren a ${link(U.treballMs, "la seva llista")}. Quan surtin, cada centre dirà què garanteix aquell dia.`,
          ),
          table(
            "Què funciona el dijous 26 de novembre de 2026 a Catalunya",
            ["Servei", "El dijous 26", "Serveis mínims"],
            [
              ["Escoles i instituts públics", "Obren; el professorat i el personal no docent hi estan convocats", "Pendents (Generalitat)"],
              ["Escoles bressol, EAP i CREDA", "Convocats", "Pendents (Generalitat)"],
              ["Menjador, acollida, extraescolars i transport escolar", "Convocats també a la concertada i la privada: pregunta al centre o a l'empresa", "Pendents (Generalitat)"],
              ["Sanitat pública", "Vagues de metges (Sindicato Médicos Unidos i Metges de Catalunya)", "Publicats: urgències i unitats especials amb normalitat"],
              ["Rodalies, metro, autobusos i FGC", "Sense vaga convocada aquell dia a les fonts revisades", "—"],
            ],
            `Revisat el ${checked}.`,
          ),
          ...paras(`Amb les novetats de la vaga a l'educació, els serveis mínims quan surtin i què han de saber les famílies: ${b2link("strikeEducation", "ca", "Vaga a l'educació del 26 de novembre a Catalunya: hi ha escola?")}.`),
        ],
        madridDay: "**El dijous 26:** CSIF hi convoca aturades parcials de 9.00 a 11.00 i de 17.00 a 19.00 h, segons el seu calendari.",
        madridValue: "Vaga indefinida des del 14 d'octubre; CSIF, aturades de 9.00 a 11.00 i de 17.00 a 19.00 h",
        notCalled:
          "No és una vaga general ni de trens: la vaga de maquinistes de SEMAF és només el dilluns 23 i el Ministeri de Transports no té cap resolució de serveis mínims ferroviaris per al dijous 26. La vaga de Correus a Andalusia es va acabar el 25; a Madrid continua fins al 27.",
        catalanGuide: (locale) => b2link("strikeEducation", locale, B2_TITLES.strikeEducation[locale]),
        faq: (checked) => [
          { question: "Hi ha vaga el dijous 26 de novembre de 2026?", answer: "Sí, però no general: vaga a l'educació a Catalunya, tota la jornada; continuen la vaga de metges del Sindicato Médicos Unidos i la de Correus a la Comunitat de Madrid, i a Madrid CSIF convoca aturades a l'ensenyament públic. No hi ha vaga de trens." },
          { question: "Hi ha vaga d'educació el 26 de novembre?", answer: "Sí, a Catalunya: la convoquen USTEC·STEs, CGT, la Intersindical, la COS i la CNT amb l'Assemblea Educativa de Catalunya. Segons el preavís de la CGT, és de 0.00 a 24.00 h a tot Catalunya, cada treballador durant la seva jornada, i crida el personal docent i no docent, les escoles bressol i el personal de menjador, lleure i transport escolar." },
          { question: "Hi ha classe el dijous 26 de novembre a Catalunya?", answer: "Sí: els centres obren, perquè és una vaga del personal, no un tancament, però part del professorat i del personal de menjador i de transport escolar pot fer vaga. Cada centre dirà què garanteix quan surtin els serveis mínims." },
          { question: "Quins serveis mínims hi ha a les escoles el 26 de novembre?", answer: `Encara no es coneixen: els fixa el Departament d'Empresa i Treball per ordre, i el ${checked} no s'havien publicat. Per a la vaga a l'educació del 8 de setembre de 2026, l'ordre es va signar el 3, cinc dies abans.` },
          { question: "Hi ha vaga de professors a Madrid el 26 de novembre?", answer: "Sí: l'ensenyament públic madrileny continua en vaga indefinida (CCOO, UGT i CSIF) i el dijous 26 CSIF hi convoca aturades parcials de 9.00 a 11.00 i de 17.00 a 19.00 h." },
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
    madrid: (day) => [
      `**What it is:** state schools (below university) in the Community of Madrid have been on an open-ended strike since 14 October 2026, called by CCOO and UGT, according to ${link(U.ccooMadridCall, "CCOO Madrid's note")}, and by CSIF Educación Madrid (${link(U.csifMadrid, "its call")}). On 11 November CCOO still described it as "la huelga indefinida docente" (the teachers' open-ended strike; ${link(U.ccooMadridMs, "its statement")}).`,
      day,
      `**Minimum services:** set by the Community of Madrid. CCOO has appealed the current ones and said on 11 November it will ask for urgent interim measures against the new order with which the regional education department wants to tighten them (${link(U.ccooMadridMs, "CCOO Madrid")}). Ask your school which lessons go ahead.`,
    ],
    madridLabel: "Madrid, state schools",
    airportsHeading: "Airports: open-ended strikes that continue",
    airportsId: "airports",
    airportsIntro: "They have no day of their own: they stay open, with minimum services set by the Ministry of Transport. If you are flying, check your flight with your airline.",
    catalanHeading: "In Catalonia",
    catalanId: "catalonia",
    catalanIntro: (day) => `The strikes that touch Catalonia on ${day}, with their minimum services:`,
    catalanHub: (href) => `Every strike in Catalonia, with what runs each day: ${href}.`,
    notHeading: "What is not on that day",
    notId: "not-called",
    spainLink: "Every strike called in Spain, day by day",
    checked: (checked) => `Sources checked: ${checked}.`,
    days: {
      strike23n: {
        lead: (phase, checked) => {
          const what = `a strike by every Renfe Group train driver (SEMAF), 00:01 to 23:59. On Rodalies de Catalunya and regional trains, the Generalitat sets 66% of the usual service at peak times (06:00 to 09:30 and 17:00 to 20:30) and 33% the rest of the day; minimum services for Cercanías outside Catalonia, Media Distancia, AVE and long-distance trains are set by the Ministry of Transport, which had not published them by ${checked}. Correos (the Spanish post office) also goes on strike in the Community of Madrid (to the 27th) and in Cádiz, Córdoba, Huelva, Málaga and Seville (to the 25th), with post offices open for postal votes, and the Sindicato Médicos Unidos doctors' strike goes on. It is not a general strike.`;
          if (phase === "after") return "**On Monday 23 November 2026 the Renfe Group's train drivers were on strike (SEMAF),** with 66% of the usual Rodalies service at peak times and 33% the rest of the day; Correos' strike began in Madrid and five Andalusian provinces and the doctors' strike went on. It was not a general strike. Who called each one and its minimum services are below.";
          if (phase === "today") return `**Today, Monday 23 November, there is** ${what}`;
          if (phase === "eve") return `**Tomorrow, Monday 23 November, there is** ${what}`;
          return `**Yes: on Monday 23 November 2026 there is** ${what}`;
        },
        firstQuestion: { eve: "Is there a strike in Spain tomorrow, Monday 23 November 2026?", today: "Is there a strike in Spain today, Monday 23 November 2026?" },
        title: "Strike in Spain on 23 November 2026: Renfe and Rodalies drivers (SEMAF), Correos, doctors",
        seoTitle: "Spain strike 23 November 2026: Renfe, Rodalies, Correos",
        description: {
          before: "Monday 23: Renfe train drivers' strike (SEMAF), 00:01-23:59. Rodalies 66% at peak, 33% otherwise; AVE and Cercanías to be confirmed. Correos too.",
          eve: "Tomorrow, Monday 23: Renfe drivers' strike (SEMAF). Rodalies 66% at peak, 33% otherwise; AVE and Cercanías to be confirmed. Correos too.",
          today: "Today, Monday 23: Renfe drivers' strike (SEMAF). Rodalies 66% at peak, 33% otherwise; AVE and Cercanías to be confirmed. Correos too.",
          after: "On 23 November 2026 Renfe's train drivers struck (SEMAF), with 66% of Rodalies at peak times, and Correos' strike began in Madrid and Andalusia.",
        },
        excerpt: "Strikes in Spain on Monday 23 November 2026: Renfe train drivers (SEMAF) with Rodalies minimum services, Correos in Madrid and Andalusia, doctors and airports.",
        extraHeading: "Trains on Monday 23: what runs",
        extraId: "trains",
        extra: (checked) => [
          ...paras(
            `Every Renfe Group train driver is called out, 00:01 to 23:59, according to the Generalitat's minimum-services order of 16 November (${link(U.treballMs, "the Catalan labour department's list")}). Each authority sets the minimum services for its own trains:`,
          ),
          table(
            "Minimum services on Renfe Group trains on Monday 23 November 2026",
            ["Service", "Minimum services", "Set by"],
            [
              ["Rodalies de Catalunya and Catalan regional trains", "66% of the usual service 06:00-09:30 and 17:00-20:30; 33% the rest of the day", "Generalitat (order of 16 November)"],
              ["Cercanías outside Catalonia", "Not published yet", "Ministry of Transport; in Bilbao and San Sebastián, the Basque Government (as on the 17th)"],
              ["Renfe AVE, long-distance and Media Distancia trains", "Not published yet", "Ministry of Transport"],
              ["Iryo and Ouigo", "No call for the 23rd in the sources checked: SEMAF's strike is at the Renfe Group", "—"],
              ["Metro, buses, trams and FGC", "Not part of this strike", "—"],
            ],
            `Checked on ${checked}.`,
          ),
          ...paras(
            `**Still to come:** on ${checked}, the Ministry of Transport had no resolution for the 23rd on ${link(U.ministryRail, "its list")} yet; for SEMAF's strike of 10 November it published one on the 6th, and for the 17th, on the 12th. Nor did the Basque Government have an order for the 23rd on ${link(U.euskadiList, "its list")}; it set the 17th's by ${link(U.euskadi17, "an order of 13 November")}.`,
            `**Is it still on?** Yes. SEMAF replaced the 12 November stoppages with this strike, and on the 17th wrote "afrontamos el 23 de noviembre como la próxima jornada de movilización" (we face 23 November as the next day of action; ${link(SPAIN_URLS.semaf35, "notice 2026-35")}). On the 19th, after agreeing a bad-weather protocol with the Ministry, Adif and Renfe, the dispute was still on: "Al mismo tiempo que permanece vigente la conflictividad, desde SEMAF estamos trabajando y negociando" (while the dispute stays in force, SEMAF is working and negotiating; ${link(U.semaf36, "notice 2026-36")}).`,
            "**What to do:** check your train the evening before and on the day, because minimum services are not spread evenly over the day. If you hold an AVE, long-distance or Media Distancia ticket, changes and refunds depend on Renfe: follow what it publishes on renfe.com or emails you.",
          ),
        ],
        madridDay: "**On Monday 23:** not one of CSIF's partial-stoppage days (the next are Tuesday 24 and Thursday 26, 09:00 to 11:00 and 17:00 to 19:00, according to its calendar); the open-ended strike stays called.",
        madridValue: "Open-ended strike since 14 October (no CSIF stoppage that day)",
        notCalled:
          "It is not a general strike. Iryo and Ouigo have no call for Monday 23 in the sources checked, and metros, buses, trams and FGC are not part of any. In Andalusia, Correos' strike is only in Cádiz, Córdoba, Huelva, Málaga and Seville.",
        catalanGuide: (locale) => b2link("strikeRenfe", locale, "Renfe and Rodalies strike on 23 November: lines and minimum services"),
        faq: (checked) => [
          { question: "Is there a strike in Spain on Monday 23 November 2026?", answer: "Yes, but not a general strike: every Renfe Group train driver is called out (SEMAF) from 00:01 to 23:59, which hits Rodalies, Cercanías, Media Distancia, AVE and long-distance trains; Correos' strike begins in Madrid and five Andalusian provinces, and the Sindicato Médicos Unidos doctors' strike goes on." },
          { question: "Is there a Renfe strike on 23 November?", answer: "Yes: the train drivers' union SEMAF calls out every Renfe Group train driver on Monday 23, 00:01 to 23:59. It replaces the 12 November stoppages, which it called off, and on 19 November the union was keeping the dispute open." },
          { question: "What are the Rodalies minimum services on 23 November?", answer: "The Generalitat's order of 16 November sets 66% of the usual service on Rodalies de Catalunya and regional trains at peak times, 06:00 to 09:30 and 17:00 to 20:30, and 33% the rest of the day." },
          { question: "Do AVE and Madrid's Cercanías run on 23 November?", answer: `With minimum services that are not known yet: the Ministry of Transport sets them and had not published its resolution by ${checked}. For SEMAF's strike of 10 November it published one on the 6th, and for the 17th, on the 12th.` },
          { question: "Does the Correos strike affect postal voting?", answer: "The Interior Ministry's order makes Correos open its post offices at their usual hours for postal votes, with 1, 2 or 3 staff per shift depending on the office's size, and sets delivery of election mail with up to 50% of staff from 23 to 25 November, \"coincidiendo con la admisión del voto por correo\" (while postal votes are being accepted)." },
        ],
      },
      strike26n: {
        lead: (phase, checked) => {
          const what = `an education strike across Catalonia, 00:00 to 24:00 and each worker during their own working day, called by USTEC·STEs, CGT, La Intersindical, COS and CNT with the Assemblea Educativa de Catalunya: schools open, but teachers, non-teaching staff and lunchtime, leisure and school-transport staff are called out, and the minimum services, which the Generalitat sets, had not been published by ${checked}. The Sindicato Médicos Unidos doctors' strike goes on, with A&E guaranteed, and so does Correos' strike in the Community of Madrid; in Madrid, CSIF calls stoppages in state schools from 09:00 to 11:00 and 17:00 to 19:00. There is no general strike and no rail strike.`;
          if (phase === "after") return "**On Thursday 26 November 2026 there was an education strike in Catalonia,** the Sindicato Médicos Unidos doctors' strike and Correos' strike in Madrid went on, and CSIF called stoppages in Madrid's state schools. It was not a general strike. Who called each one is below.";
          if (phase === "today") return `**Today, Thursday 26 November, there is** ${what}`;
          if (phase === "eve") return `**Tomorrow, Thursday 26 November, there is** ${what}`;
          return `**Yes: on Thursday 26 November 2026 there is** ${what}`;
        },
        firstQuestion: { eve: "Is there a strike in Spain tomorrow, Thursday 26 November 2026?", today: "Is there a strike in Spain today, Thursday 26 November 2026?" },
        title: "Strike on 26 November 2026: Catalonia schools, doctors and Madrid. Is there school?",
        seoTitle: "Spain strike 26 November 2026: Catalonia schools, doctors",
        description: {
          before: "Thursday 26: education strike in Catalonia (whole day; minimum services pending), SMU doctors' strike, Correos in Madrid; Madrid school stoppages.",
          eve: "Tomorrow, Thursday 26: education strike in Catalonia (minimum services pending), SMU doctors' strike, Correos in Madrid; Madrid stoppages.",
          today: "Today, Thursday 26: education strike in Catalonia (minimum services pending), SMU doctors' strike, Correos in Madrid; Madrid stoppages.",
          after: "On 26 November 2026 there was an education strike in Catalonia, SMU doctors and Correos in Madrid struck, and CSIF stopped work in Madrid's schools.",
        },
        excerpt: "Strikes on Thursday 26 November 2026: education in Catalonia (is there school?), SMU doctors, Correos in Madrid, Madrid school stoppages and airports.",
        extraHeading: "Is there school in Catalonia on Thursday 26?",
        extraId: "is-there-school",
        extra: (checked) => [
          ...paras(
            `**Yes, schools open:** it is a strike by staff, not a closure, and Thursday 26 is a school day. According to ${link(U.cgtEns26Notice, "CGT's strike notice")}, which CGT Ensenyament published on 18 November (${link(U.cgtEns26Call, "\"us convoquem a la vaga\"")}, we call you out on strike), teaching and non-teaching staff at state schools, nursery schools (escoles bressol), the EAP and CREDA support teams, and lunchtime, before- and after-school, leisure and school-transport staff at state, private and concertada (state-funded private) schools are called out.`,
            `**Minimum services:** the Department of Business and Labour sets them by order, and on ${checked} they were not on ${link(U.treballMs, "its list")} yet. Once they are out, your school will tell you what it can provide that day.`,
          ),
          table(
            "What runs in Catalonia on Thursday 26 November 2026",
            ["Service", "On Thursday 26", "Minimum services"],
            [
              ["State schools", "Open; teachers and non-teaching staff are called out", "Pending (Generalitat)"],
              ["Nursery schools (escoles bressol), EAP and CREDA", "Called out", "Pending (Generalitat)"],
              ["Lunchtime, before- and after-school care, school transport", "Called out at concertada and private schools too: ask your school or the provider", "Pending (Generalitat)"],
              ["Public healthcare", "Doctors' strikes (Sindicato Médicos Unidos and Metges de Catalunya)", "Published: A&E and special units run normally"],
              ["Rodalies, metro, buses and FGC", "No strike called that day in the sources checked", "—"],
            ],
            `Checked on ${checked}.`,
          ),
          ...paras(`For the latest on the education strike, the minimum services as soon as they are out and what parents need to know: ${b2link("strikeEducation", "en", "Catalonia teachers' strike on 26 November: is there school?")}.`),
        ],
        madridDay: "**On Thursday 26:** CSIF calls partial stoppages from 09:00 to 11:00 and from 17:00 to 19:00, according to its calendar.",
        madridValue: "Open-ended strike since 14 October; CSIF stoppages 09:00-11:00 and 17:00-19:00",
        notCalled:
          "There is no general strike and no rail strike: SEMAF's drivers' strike is on Monday 23 only, and the Ministry of Transport has no rail minimum-services resolution for Thursday 26. Correos' strike in Andalusia ended on the 25th; in Madrid it runs to the 27th.",
        catalanGuide: (locale) => b2link("strikeEducation", locale, B2_TITLES.strikeEducation[locale]),
        faq: (checked) => [
          { question: "Is there a strike in Spain on Thursday 26 November 2026?", answer: "Yes, but not a general strike: an education strike in Catalonia for the whole day; the Sindicato Médicos Unidos doctors' strike and Correos' strike in the Community of Madrid go on, and in Madrid CSIF calls stoppages in state schools. There is no rail strike." },
          { question: "Is there an education strike on 26 November?", answer: "Yes, in Catalonia: USTEC·STEs, CGT, La Intersindical, COS and CNT call it with the Assemblea Educativa de Catalunya. According to CGT's notice, it runs from 00:00 to 24:00 across Catalonia, each worker during their own working day, and calls out teaching and non-teaching staff, nursery schools and lunchtime, leisure and school-transport staff." },
          { question: "Is there school in Catalonia on Thursday 26 November?", answer: "Yes: schools open, because it is a strike by staff, not a closure, but some teachers and lunchtime and school-transport staff may strike. Each school will say what it can provide once the minimum services are out." },
          { question: "What minimum services are there in schools on 26 November?", answer: `Not known yet: the Department of Business and Labour sets them by order, and they had not been published by ${checked}. For the education strike of 8 September 2026, the order was signed on the 3rd, five days before.` },
          { question: "Are Madrid's teachers on strike on 26 November?", answer: "Yes: Madrid's state schools stay on an open-ended strike (CCOO, UGT and CSIF), and on Thursday 26 CSIF calls partial stoppages from 09:00 to 11:00 and 17:00 to 19:00." },
        ],
      },
    },
  },
};

/* -------------------------------------------------------------------------- */
/* Body                                                                       */
/* -------------------------------------------------------------------------- */

/** The Spain-wide dated strikes on the day, from SPAIN_STRIKES. */
export function spainStrikesOn2326(key: StrikeDay2326Key, strikes: SpainStrike[] = SPAIN_STRIKES): SpainStrike[] {
  return strikesOn(STRIKE_DAY_2326[key], strikes);
}

/** The Catalan hub's strikes on the day (an indefinite one counts every day it runs). */
export function catalanStrikesOn2326(key: StrikeDay2326Key, strikes: Strike[] = STRIKES): Strike[] {
  return strikes.filter((strike) => isOnDay(strike, STRIKE_DAY_2326[key]));
}

/** The 26th's education strike, from the Catalan hub (not in SPAIN_STRIKES: it is Catalonia's own). */
export function educationEntry(strikes: Strike[] = STRIKES): Strike {
  const entry = strikes.find((strike) => strike.id === EDUCATION_CAT_ID);
  if (!entry) throw new Error(`strike-days-2326n: no entry ${EDUCATION_CAT_ID} in strikes.ts`);
  return entry;
}

/** A one-day page whose day has passed is no longer linked. */
function dayPageOver(key: B2Key, asOf: string): boolean {
  const page = STRIKE_DAY_PAGES.find((p) => p.key === key);
  return Boolean(page && page.day < asOf);
}

const isDayPage = (key: B2Key) => STRIKE_DAY_PAGES.some((p) => p.key === key);

function strikeSection(strike: SpainStrike, locale: Locale): Block[] {
  const t = COPY[locale];
  const fill = (value: L) => fillChecked(value, locale, strikeDaysCheckedOn());
  // The Catalan hub is linked from its own section; the day pages from the list under "what is not on that day" (the 19th's
  // marches are not this page's business).
  const guides = (strike.guides ?? []).filter((key) => key !== "strikes" && !isDayPage(key)).map((key: B2Key) => b2link(key, locale, B2_TITLES[key][locale]));
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

/** The 26th: the Catalan education entry as a section of its own, with its facts and minimum services. */
function educationSection(locale: Locale): Block[] {
  const entry = educationEntry();
  const t = COPY[locale];
  return [
    heading(3, `${cap(dayDate(STRIKE_DAY_2326.strike26n, locale))}: ${entry.title[locale]}`, entry.id),
    list(...entry.facts[locale], `**${t.ms}:** ${entry.minimumServices.text[locale]}`),
  ];
}

export function buildStrikeDay2326Body(key: StrikeDay2326Key, locale: Locale, asOf: string = STRIKES_SPAIN_AS_OF): Block[] {
  const t = COPY[locale];
  const d = t.days[key];
  const day = STRIKE_DAY_2326[key];
  const dayName = dayDate(day, locale, false);
  const phase = strikeDay2326Phase(key, asOf);
  const spain = spainStrikesOn2326(key);
  const catalan = catalanStrikesOn2326(key);
  const checkedOn = strikeDaysCheckedOn(asOf);
  // "Fuentes revisadas" prints the day the sources were re-read, never a later as-of day (as on the 19N/20N pages).
  const checked = dateYear(checkedOn, locale);
  const checkedDay = dayDate(checkedOn, locale);
  const education = key === "strike26n" ? educationEntry() : undefined;

  const facts = [
    ...(education ? [{ label: cap(education.title[locale]), value: `${education.minimumServices.msShort[locale]}.` }] : []),
    ...spain.map((strike) => ({ label: cap(strike.title[locale]), value: `${strike.minimumServices.short[locale]}.` })),
    { label: t.madridLabel, value: `${d.madridValue}.` },
  ];

  const first = d.firstQuestion[phase];
  const faqItems = d.faq(checked).map((item, index) => ({ question: index === 0 && first ? first : item.question, answer: strip(item.answer) }));
  const other: StrikeDay2326Key = key === "strike23n" ? "strike26n" : "strike23n";

  return [
    lead(d.lead(phase, checkedDay)),
    keyFacts(t.factsTitle(dayName), facts),
    heading(2, d.extraHeading, d.extraId),
    ...d.extra(checked),
    heading(2, t.allHeading(dayName), t.allId),
    ...(education ? educationSection(locale) : []),
    ...spain.flatMap((strike) => strikeSection(strike, locale)),
    heading(2, t.madridHeading, t.madridId),
    list(...t.madrid(d.madridDay)),
    heading(2, t.airportsHeading, t.airportsId),
    ...paras(t.airportsIntro),
    list(...SPAIN_OPEN_STRIKES.map((strike) => `**${strike.title[locale]}.** ${fillChecked(strike.text, locale, strikeDaysCheckedOn())}`)),
    heading(2, t.catalanHeading, t.catalanId),
    ...paras(t.catalanIntro(dayName)),
    list(...catalan.map((strike) => `**${cap(strike.title[locale])}.** ${strike.minimumServices.msShort[locale]}.`)),
    ...paras(`${d.catalanGuide(locale)} · ${t.catalanHub(b2link("strikes", locale, B2_TITLES.strikes[locale]))}`),
    heading(2, t.notHeading, t.notId),
    ...paras(`${d.notCalled} ${t.checked(checked)}`),
    list(
      b2link("strikesSpain", locale, t.spainLink),
      ...(dayPageOver(other, asOf) ? [] : [b2link(other, locale, B2_TITLES[other][locale])]),
      ...(key === "strike23n" ? [b2link("postalVote", locale, B2_TITLES.postalVote[locale])] : []),
    ),
    ...(phase === "after" ? [] : [faq(faqItems)]),
    ...paras(verifiedLine(locale, STRIKE_DAYS_VERIFIED)),
    ...b2Related(key === "strike23n" ? ["strikesSpain", "strikeRenfe", "strikes"] : ["strikesSpain", "strikeEducation", "strikes"], locale),
  ];
}

/* -------------------------------------------------------------------------- */
/* Sources and articles                                                       */
/* -------------------------------------------------------------------------- */

/** Every external link the page carries: the day's Spain and Catalan entries, the airports, Madrid, and this module's own. */
export function strikeDay2326Sources(key: StrikeDay2326Key): B2Source[] {
  const all: B2Source[] = [];
  const add = (source: B2Source) => {
    if (!all.some((s) => s.url === source.url)) all.push({ name: source.name, url: source.url, publisher: source.publisher });
  };
  if (key === "strike26n") educationEntry().sources.forEach(add);
  for (const strike of spainStrikesOn2326(key)) strike.sources.forEach(add);
  EXTRA_SOURCES[key].forEach(add);
  for (const strike of SPAIN_OPEN_STRIKES) strike.sources.forEach(add);
  MADRID_SOURCES.forEach(add);
  return all;
}

export function strikeDay2326Description(key: StrikeDay2326Key, locale: Locale, asOf: string = STRIKES_SPAIN_AS_OF): string {
  return COPY[locale].days[key].description[strikeDay2326Phase(key, asOf)];
}

const LOCALES: Locale[] = ["ca", "es", "en"];

function editions(key: StrikeDay2326Key): B2Article["editions"] {
  return Object.fromEntries(
    LOCALES.map((locale) => [
      locale,
      {
        path: B2_PATHS[key][locale],
        title: COPY[locale].days[key].title,
        seoTitle: COPY[locale].days[key].seoTitle,
        seoDescription: strikeDay2326Description(key, locale),
        excerpt: COPY[locale].days[key].excerpt,
        blocks: buildStrikeDay2326Body(key, locale),
      },
    ]),
  ) as B2Article["editions"];
}

/** No new photograph: the 23rd takes the Renfe guide's (the trains feature's Rodalies trains), the 26th the education guide's school. */
const hero = (guide: "strikeRenfe" | "strikeEducation") => {
  const spec = STRIKE_GUIDE_SPECS.find((s) => s.key === guide);
  const fallback = { key: TRAINS.heroKey ?? "", alt: TRAINS.heroAlt ?? { ca: "", es: "", en: "" }, caption: TRAINS.heroCaption ?? { ca: "", es: "", en: "" } };
  const h = spec?.hero ?? fallback;
  return { heroKey: h.key, heroAlt: { ...h.alt }, heroCaption: { ...h.caption } };
};

export const STRIKE_23N_GUIDE: B2Article = {
  key: "strike23n",
  entryKey: "guide-strike-23-november-2026-spain",
  categoryKey: "public-services",
  sources: strikeDay2326Sources("strike23n"),
  ...hero("strikeRenfe"),
  verifiedAt: STRIKE_DAYS_VERIFIED,
  publishedAt: "2026-11-19T23:30:00+01:00",
  editions: editions("strike23n"),
};

export const STRIKE_26N_GUIDE: B2Article = {
  key: "strike26n",
  entryKey: "guide-strike-26-november-2026-spain",
  categoryKey: "public-services",
  sources: strikeDay2326Sources("strike26n"),
  ...hero("strikeEducation"),
  verifiedAt: STRIKE_DAYS_VERIFIED,
  publishedAt: "2026-11-19T23:30:00+01:00",
  editions: editions("strike26n"),
};

/** Exposed for tests: the as-of the pages were built on. */
export const STRIKE_DAYS_2326_AS_OF = { spain: STRIKES_SPAIN_AS_OF, catalan: STRIKES_AS_OF } as const;
