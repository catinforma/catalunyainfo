import type { Block } from "@/lib/content/blocks";
import { TRAINS } from "@/lib/content/features/trains";
import { addDays } from "@/lib/content/holidays/calendar";
import type { Locale } from "@/lib/i18n/config";

import { dateYear, dayDate } from "./festive";
import { B2_PATHS, B2_TITLES, b2Related, b2link, faq, keyFacts, lead, list, paras, table, verifiedLine, type B2Article, type B2Key, type B2Source } from "./shared";
import { DAY_URLS, MADRID_SOURCES, STRIKE_DAYS_VERIFIED, calledOffOnDay, strikeDaysCheckedOn, type StrikeDayPhase } from "./strike-days-1920n";
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
 * Pending, printed as pending until 23 Nov: the Generalitat's order for the
 * 26th (the Catalan entry's status; a test keeps the copy in step with it). The 19 Nov
 * flag for the Ministry's resolution on the 23rd (MINISTRY_23N_PUBLISHED) went
 * with the call-off of 20 Nov: no resolution is due for a strike that is off.
 *
 * Dates: before / eve / on the day / after from STRIKES_SPAIN_AS_OF only (no
 * clock). The `strikes` and `huelgas-espana` groups republish both, and
 * `huelga-23-26n` both on their own.
 *
 * 20 Nov 2026: SEMAF called off the 23rd ("SEMAF ha procedido a la
 * desconvocatoria de la jornada de huelga prevista para el próximo 23 de
 * noviembre tras alcanzar un acuerdo", nº 2026-38, 20/11/2026; nº 2026-39 calls
 * it an "Acuerdo de fin de huelga"). Its Spain and Catalan entries are gone;
 * the 23rd's page now opens with the call-off, printed from SPAIN_NOT_HAPPENING
 * through `calledOffOnDay` (strike-days-1920n.ts, as the 19th did for Adif),
 * says trains run to the usual timetable unless Renfe says otherwise (no
 * notice from Renfe or Rodalies yet on the 20th), then what still happens:
 * Correos, the doctors, Madrid's schools, the airports. Titles, descriptions,
 * leads, table and FAQ rewritten; URL kept. The 19 Nov measurement window
 * (docs/SEO_EXPERIMENTS.md) is overridden by this factual change, logged there.
 *
 * 21 Nov 2026: re-read (research_notes/x10/strikes-21nov-factpack.md). The
 * 26th: the mediation of Thursday 19 Nov (convened by the Departament
 * d'Empresa i Treball) ended with no proposal from Educació, USTEC·STEs, 20
 * Nov; the strike stays on and its minimum services are still not out
 * (Treball's list, e-Tauler). The fact comes from the Catalan entry; this page
 * adds one FAQ ("¿Sigue en pie...?"). The 23rd: unchanged (no new rail call
 * on the Ministry's list; Correos' order unchanged; no Renfe or Rodalies
 * notice about the call-off yet).
 *
 * 22 Nov 2026 (13:20-13:40 CET, the eve of the 23rd): re-read
 * (docs/SEO_EXPERIMENTS.md, "2026-11-22 — Strikes re-read (Sunday)"). Nothing
 * changed, no copy changed. The 23rd: SEMAF's call-off stands (newest items
 * still 20 Nov), no new rail call (Ministry's list, SCF, SFF-CGT, ALFERRO,
 * CCOO), Correos' order unchanged and no call-off, SMU's first phase runs to
 * 08:00 on Saturday 28; Renfe (press room feed, newest item 17 Nov) and
 * Rodalies (alterations list; the unlisted 23N page still dated 19.11.2026)
 * have still published nothing about the call-off, which is what the "what to
 * do" line says with the re-read date. The 26th: the strike stays on and its
 * minimum services are still not out (Treball's list, e-Tauler, DOGC: last
 * issue núm. 9799 of Friday 20 Nov).
 *
 * 23 Nov 2026 (18:05-18:40 CET): re-read (docs/SEO_EXPERIMENTS.md,
 * "2026-11-23 — Strikes re-read (Monday)"). The 26th: the Generalitat's
 * minimum-services order is out (Ordre EMT/ /2026 of 23 Nov, e-Tauler 660276,
 * on Treball's list dated 23/11/2026). Factual correction, overriding the 19 Nov
 * measurement window: the descriptions (before / eve / today), the lead, the
 * "Is there school?" paragraph and table, and two FAQ answers now give the
 * order's figures instead of "pending"; the lead and the FAQ name the four
 * unions whose calls the order lists (USTEC·STEs, CGT, COS, La Intersindical)
 * instead of the joint calendar's five (CNT registered none). Titles and URLs
 * unchanged. The 23rd: unchanged (still no Renfe or Rodalies notice).
 */

export const STRIKE_DAY_2326 = { strike23n: "2026-11-23", strike26n: "2026-11-26" } as const;
export type StrikeDay2326Key = keyof typeof STRIKE_DAY_2326;

const CORREOS_ID = "huelga-correos-2026-11-23";
const SMU_ID = "huelga-medicos-smu-2026-11-16";
const EDUCATION_CAT_ID = "vaga-educacio-2026-11-26";
/** 20 Nov 2026: SEMAF's strike of the 23rd, called off: in SPAIN_NOT_HAPPENING and in the Catalan hub's STRIKES_CALLED_OFF. */
const RENFE_OFF_ID = "renfe-23-noviembre-desconvocada";
const RENFE_OFF_CAT_ID = "vaga-renfe-2026-11-23-desconvocada";

/** The ids this module expects in the entries (a test checks them). */
export const STRIKE_DAY_2326_IDS = { renfeCalledOff: RENFE_OFF_ID, renfeCalledOffCatalan: RENFE_OFF_CAT_ID, correos: CORREOS_ID, smu: SMU_ID, education: EDUCATION_CAT_ID } as const;

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
  // SEMAF nº 2026-38 and nº 2026-39, 20 Nov 2026 (read that day): the 23rd called off, "Acuerdo de fin de huelga (art. 8.2 RDLRT)".
  semaf38: SPAIN_URLS.semaf38,
  semaf39: SPAIN_URLS.semaf39,
  // Ministry of Transport's rail list: newest entry on 20, 21 and 22 Nov 2026 still the resolution of 12 Nov (Grupo Renfe, 17 Nov); none for the 23rd.
  ministryRail: SPAIN_URLS.ministryRail,
  // The Departament d'Empresa i Treball's list: newest entry on 20, 21 and 22 Nov 2026 still the 23rd's Rodalies order (17/11); none for the 26th
  // (nor in the newest 200 e-Tauler edicts, 16-20 Nov, read 21 and 22 Nov, nor in the DOGC, last issue núm. 9799 of 20 Nov).
  // 23 Nov 2026: the 26th's order is out, listed with the date 23/11/2026 (e-Tauler 660276; strikes.ts, STRIKE_URLS.ordreEdu26).
  treballMs: STRIKE_URLS.treballMs,
  rodaliesStatus: STRIKE_URLS.rodaliesStatus,
  renfe: STRIKE_URLS.renfe,
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
    { name: "Resoluciones de servicios mínimos ferroviarios", url: U.ministryRail, publisher: MINISTRY },
    { name: "Informació de vagues amb serveis mínims", url: U.treballMs, publisher: "Generalitat de Catalunya, Departament d'Empresa i Treball" },
    { name: "Alteracions del servei", url: U.rodaliesStatus, publisher: "Rodalies de Catalunya" },
    { name: "Renfe", url: U.renfe, publisher: "Renfe" },
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
  /** 20 Nov 2026: the key fact for a strike called off that day (the 23rd: Renfe), first in the facts box. */
  callOffFact?: { label: string; value: string };
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
        // 20 Nov 2026: SEMAF called off the 23rd (nº 2026-38). The first thing the page says is that there is no Renfe strike that day.
        lead: (phase, checked) => {
          const rest = `SEMAF la desconvocó el 20 de noviembre tras alcanzar un acuerdo, así que Rodalies, Cercanías, Media Distancia, AVE y Larga Distancia circulan con su horario habitual, salvo aviso de Renfe; ningún otro sindicato tiene huelga de trenes convocada ese día en las fuentes revisadas el ${checked}. Lo que sí hay: empieza la huelga de Correos en la Comunidad de Madrid (hasta el 27) y en Cádiz, Córdoba, Huelva, Málaga y Sevilla (hasta el 25), con las oficinas abiertas para el voto por correo, y sigue la de médicos del Sindicato Médicos Unidos. No es una huelga general.`;
          if (phase === "after") return "**El lunes 23 de noviembre de 2026 no hubo huelga de Renfe:** el sindicato de maquinistas SEMAF la desconvocó el 20 de noviembre tras alcanzar un acuerdo. Empezó la huelga de Correos en Madrid y en cinco provincias andaluzas y siguió la de médicos. No fue una huelga general. Más abajo, quién convocó cada una y sus servicios mínimos.";
          if (phase === "today") return `**Hoy, lunes 23 de noviembre, no hay huelga de Renfe ni de Rodalies.** ${rest}`;
          if (phase === "eve") return `**Mañana, lunes 23 de noviembre, no hay huelga de Renfe ni de Rodalies.** ${rest}`;
          return `**No: la huelga de maquinistas de Renfe del lunes 23 de noviembre de 2026 está desconvocada.** ${rest}`;
        },
        firstQuestion: { eve: "¿Hay huelga mañana, lunes 23 de noviembre de 2026?", today: "¿Hay huelga hoy, lunes 23 de noviembre de 2026?" },
        // 20 Nov 2026 (docs/SEO_EXPERIMENTS.md): rewritten for SEMAF's call-off; the searched words stay first ("huelga 23 noviembre 2026", "huelga renfe 23 noviembre").
        title: "Huelga 23 de noviembre de 2026: la de Renfe y Rodalies, desconvocada; Correos y médicos",
        seoTitle: "Huelga 23 de noviembre de 2026: Renfe desconvocada, Correos",
        description: {
          before: "Lunes 23: SEMAF desconvocó la huelga de maquinistas de Renfe. Rodalies, AVE y Cercanías, con su horario habitual. Sí hay huelga de Correos y de médicos.",
          eve: "Mañana lunes 23 no hay huelga de Renfe: SEMAF la desconvocó. Rodalies, AVE y Cercanías, horario habitual. Sí hay huelga de Correos y de médicos.",
          today: "Hoy lunes 23 no hay huelga de Renfe: SEMAF la desconvocó. Rodalies, AVE y Cercanías, horario habitual. Sí hay huelga de Correos y de médicos.",
          after: "El 23 de noviembre de 2026 no hubo huelga de Renfe: SEMAF la desconvocó el 20. Empezó la huelga de Correos en Madrid y Andalucía y siguió la de médicos.",
        },
        excerpt: "Las huelgas del lunes 23 de noviembre de 2026: la de maquinistas de Renfe (SEMAF), desconvocada; Correos en Madrid y Andalucía, médicos y aeropuertos.",
        callOffFact: { label: "Renfe y Rodalies (SEMAF)", value: "Huelga desconvocada: trenes con su horario habitual, salvo aviso de Renfe." },
        extraHeading: "Trenes el lunes 23: sin huelga",
        extraId: "trenes",
        extra: (checked) => [
          ...paras(
            `**La huelga de maquinistas está desconvocada.** SEMAF lo anunció el 20 de noviembre: «SEMAF ha procedido a la desconvocatoria de la jornada de huelga prevista para el próximo 23 de noviembre tras alcanzar un acuerdo que transforma las reivindicaciones del colectivo en realidades normativas, operativas y verificables», según ${link(U.semaf38, "su comunicado 2026-38")}. En ${link(U.semaf39, "el 2026-39")} llama a ese texto «Acuerdo de fin de huelga (art. 8.2 RDLRT)».`,
          ),
          table(
            "Trenes del lunes 23 de noviembre de 2026, tras la desconvocatoria de SEMAF",
            ["Servicio", "El lunes 23", "Servicios mínimos"],
            [
              ["Rodalies de Catalunya y regionales de Cataluña", "Horario habitual, salvo aviso de Renfe: no hay huelga", "Ninguno: el 66% en hora punta y el 33% que había fijado la Generalitat eran para esta huelga"],
              ["Cercanías fuera de Cataluña", "Horario habitual, salvo aviso de Renfe: no hay huelga", "Ninguno: el Ministerio de Transportes no había publicado resolución para el 23"],
              ["AVE, Larga Distancia y Media Distancia de Renfe", "Horario habitual, salvo aviso de Renfe: no hay huelga", "Ninguno"],
              ["Iryo y Ouigo", "Sin huelga convocada en las fuentes revisadas", "—"],
              ["Metro, autobuses, tranvías y FGC", "No forman parte de ninguna huelga ese día", "—"],
            ],
            `Revisado el ${checked}.`,
          ),
          ...paras(
            `**Ninguna otra huelga de trenes ese día:** el ${checked}, el Ministerio de Transportes no tenía ninguna resolución de servicios mínimos para el 23 en ${link(U.ministryRail, "su lista de resoluciones ferroviarias")}, cuya última es la del 12 de noviembre para el 17, y la orden de la Generalitat para Rodalies del 16 de noviembre, en ${link(U.treballMs, "la lista del Departament d'Empresa i Treball")}, era para la huelga de SEMAF.`,
            `**Qué hacer:** el ${checked}, Renfe y Rodalies aún no habían publicado ningún aviso sobre la decisión de SEMAF. Antes de salir, mira ${link(U.rodaliesStatus, "el estado del servicio de Rodalies")}; si tienes billete de AVE, Larga o Media Distancia, sigue lo que publique ${link(U.renfe, "Renfe")} o te envíe por correo.`,
          ),
        ],
        madridDay: "**El lunes 23:** no es uno de los días de paros parciales de CSIF (los siguientes son el martes 24 y el jueves 26, de 9.00 a 11.00 y de 17.00 a 19.00 h, según su calendario); la huelga indefinida sigue convocada.",
        madridValue: "Huelga indefinida desde el 14 de octubre (sin paros de CSIF ese día)",
        notCalled:
          "No es una huelga general ni de trenes: la de maquinistas de Renfe está desconvocada, Iryo y Ouigo no tienen convocatoria en las fuentes revisadas, y el metro, los autobuses, los tranvías y FGC no forman parte de ninguna. En Andalucía, la huelga de Correos es solo en Cádiz, Córdoba, Huelva, Málaga y Sevilla.",
        catalanGuide: (locale) => b2link("strikeRenfe", locale, "Huelga de Renfe y Rodalies del 23 de noviembre: desconvocada"),
        faq: (checked) => [
          { question: "¿Hay huelga el lunes 23 de noviembre de 2026?", answer: "Sí, pero ni de trenes ni general: SEMAF desconvocó el 20 de noviembre la huelga de maquinistas de Renfe. Ese día empieza la huelga de Correos en la Comunidad de Madrid y en cinco provincias andaluzas, y sigue la de médicos del Sindicato Médicos Unidos." },
          { question: "¿Hay huelga de Renfe el 23 de noviembre?", answer: "No. El sindicato de maquinistas SEMAF la desconvocó el 20 de noviembre: «SEMAF ha procedido a la desconvocatoria de la jornada de huelga prevista para el próximo 23 de noviembre tras alcanzar un acuerdo», según su comunicado 2026-38." },
          { question: "¿Funciona Rodalies el 23 de noviembre?", answer: `Sí, con su horario habitual salvo aviso de Renfe: sin huelga no hay servicios mínimos, y el 66% en hora punta y el 33% que había fijado la Generalitat eran para la huelga de SEMAF. El ${checked}, Rodalies aún no había publicado ningún aviso: mira el estado del servicio antes de salir.` },
          { question: "¿Funcionan el AVE y los Cercanías de Madrid el 23 de noviembre?", answer: `Sí, sin huelga: SEMAF la desconvocó el 20 de noviembre y el ${checked} el Ministerio de Transportes no tenía ninguna resolución de servicios mínimos para ese día. Con cualquier duda sobre tu billete, sigue lo que publique Renfe.` },
          { question: "¿Afecta la huelga de Correos al voto por correo?", answer: "La orden del Ministerio del Interior obliga a abrir las oficinas de Correos en su horario habitual para el voto por correo, con 1, 2 o 3 empleados por turno según su plantilla, y fija el reparto de los envíos electorales con hasta el 50% de la plantilla del 23 al 25 de noviembre, «coincidiendo con la admisión del voto por correo»." },
        ],
      },
      strike26n: {
        lead: (phase, checked) => {
          const what = `huelga en la educación en toda Cataluña, de 0.00 a 24.00 h y cada trabajador durante su jornada, convocada por USTEC·STEs, la CGT, la COS y la Intersindical: los colegios abren, pero están llamados el profesorado, el personal no docente y el de comedor, ocio y transporte escolar. Los servicios mínimos, publicados por la Generalitat el 23 de noviembre, son una persona del equipo directivo y un docente por cada 3 aulas en cada centro, el 50% de la plantilla en educación especial y el 50% del personal de comedor y acogida. Siguen la huelga de médicos del Sindicato Médicos Unidos, con las urgencias garantizadas, y la de Correos en la Comunidad de Madrid; en Madrid, CSIF convoca paros en la enseñanza pública de 9.00 a 11.00 y de 17.00 a 19.00 h. No hay huelga general ni de trenes.`;
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
          // 23 Nov 2026: the Generalitat's order is out (factual correction, docs/SEO_EXPERIMENTS.md, "2026-11-23 — Strikes re-read (Monday)").
          before: "Jueves 26: huelga en la educación en Cataluña (mínimos: un docente por cada 3 aulas), de médicos (SMU) y de Correos en Madrid; paros en Madrid.",
          eve: "Mañana jueves 26: huelga en la educación en Cataluña (mínimos: un docente por cada 3 aulas), de médicos (SMU) y de Correos en Madrid; paros en Madrid.",
          today: "Hoy jueves 26: huelga en la educación en Cataluña (mínimos: un docente por cada 3 aulas), de médicos (SMU) y de Correos en Madrid; paros en Madrid.",
          after: "El 26 de noviembre de 2026 hubo huelga en la educación en Cataluña, de médicos (SMU) y de Correos en Madrid, y paros de CSIF en Madrid. Quién convocó.",
        },
        excerpt: "Las huelgas del jueves 26 de noviembre de 2026: educación en Cataluña (¿hay clase?), médicos (SMU), Correos en Madrid, paros en los colegios de Madrid y aeropuertos.",
        extraHeading: "¿Hay clase el jueves 26 en Cataluña?",
        extraId: "hay-clase",
        extra: (checked) => [
          ...paras(
            `**Sí, los centros abren:** es una huelga del personal, no un cierre, y el jueves 26 es día lectivo. Según ${link(U.cgtEns26Notice, "el preaviso de la CGT")}, que CGT Ensenyament publicó el 18 de noviembre (${link(U.cgtEns26Call, "«us convoquem a la vaga»")}), están llamados el personal docente y no docente de los centros públicos, las escuelas infantiles (escoles bressol), los EAP y los CREDA, y el personal de comedor, acogida, ocio, extraescolares y transporte escolar de los centros públicos, privados y concertados.`,
            `**Servicios mínimos:** los fijó el Departament d'Empresa i Treball por una orden del 23 de noviembre, en ${link(U.treballMs, "su lista")}: en cada centro, una persona del equipo directivo y, además, un docente por cada 3 aulas en infantil, primaria y secundaria; el 50% de la plantilla en educación especial y el 33% en las escuelas infantiles (llars d'infants); y el 50% del personal de comedor, cocina, acogida y extraescolares. La dirección de cada centro designa quién los cubre: pregunta en el tuyo qué garantiza ese día.`,
          ),
          table(
            "Qué funciona el jueves 26 de noviembre de 2026 en Cataluña",
            ["Servicio", "El jueves 26", "Servicios mínimos"],
            [
              ["Escuelas e institutos públicos", "Abren; el profesorado y el personal no docente están convocados", "Una persona del equipo directivo y un docente por cada 3 aulas; educación especial, 50% de la plantilla"],
              ["Escoles bressol, EAP y CREDA", "Convocados", "Escuelas infantiles (llars d'infants): 33% de la plantilla"],
              ["Comedor, acogida, extraescolares y transporte escolar", "Convocados también en la concertada y la privada: pregunta al centro o a la empresa", "50% del personal de comedor, cocina, acogida y extraescolares"],
              ["Sanidad pública", "Huelgas de médicos (Sindicato Médicos Unidos y Metges de Catalunya)", "Publicados: urgencias y unidades especiales con normalidad"],
              ["Rodalies, metro, autobuses y FGC", "Sin huelga convocada ese día en las fuentes revisadas", "—"],
            ],
            `Revisado el ${checked}.`,
          ),
          ...paras(`Con las novedades de la huelga en la educación, sus servicios mínimos y qué deben saber las familias: ${b2link("strikeEducation", "es", "Huelga en la educación del 26 de noviembre en Cataluña: ¿hay colegio?")}.`),
        ],
        madridDay: "**El jueves 26:** CSIF convoca paros parciales de 9.00 a 11.00 y de 17.00 a 19.00 h, según su calendario.",
        madridValue: "Huelga indefinida desde el 14 de octubre; CSIF, paros de 9.00 a 11.00 y de 17.00 a 19.00 h",
        notCalled:
          "No es una huelga general ni de trenes: SEMAF desconvocó la huelga de maquinistas de Renfe del lunes 23 y el Ministerio de Transportes no tiene ninguna resolución de servicios mínimos ferroviarios para el jueves 26. La huelga de Correos en Andalucía terminó el 25; en Madrid sigue hasta el 27.",
        catalanGuide: (locale) => b2link("strikeEducation", locale, B2_TITLES.strikeEducation[locale]),
        faq: (checked) => [
          { question: "¿Hay huelga el jueves 26 de noviembre de 2026?", answer: "Sí, pero no general: huelga en la educación en Cataluña, toda la jornada; siguen la huelga de médicos del Sindicato Médicos Unidos y la de Correos en la Comunidad de Madrid, y en Madrid CSIF convoca paros en la enseñanza pública. No hay huelga de trenes." },
          { question: "¿Hay huelga de educación el 26 de noviembre?", answer: "Sí, en Cataluña: USTEC, la COS y la Intersindical registraron la convocatoria el 13 de noviembre y la CGT el 14, según la orden de servicios mínimos; el calendario lo marcan con la CNT y la Assemblea Educativa de Catalunya. Según el preaviso de la CGT, es de 0.00 a 24.00 h en toda Cataluña, cada trabajador durante su jornada, y llama al personal docente y no docente, a las escoles bressol y al personal de comedor, ocio y transporte escolar." },
          // 21 Nov 2026: USTEC·STEs (20 Nov) on the mediation of the 19th, which ended with no proposal.
          { question: "¿Sigue en pie la huelga de educación del 26 de noviembre?", answer: `Sí. La mediación que el Departament d'Empresa i Treball convocó la mañana del jueves 19 de noviembre para intentar evitarla terminó sin acuerdo: según USTEC·STEs, Educació no presentó ninguna propuesta. El ${checked}, la huelga seguía convocada.` },
          { question: "¿Hay clase el jueves 26 de noviembre en Cataluña?", answer: "Sí: los centros abren, porque es una huelga del personal, no un cierre, pero parte del profesorado y del personal de comedor y de transporte escolar puede hacer huelga. Los servicios mínimos garantizan en cada centro una persona del equipo directivo y un docente por cada 3 aulas: pregunta en el tuyo qué garantiza ese día." },
          { question: "¿Qué servicios mínimos hay en los colegios el 26 de noviembre?", answer: "Los fijó el Departament d'Empresa i Treball por una orden del 23 de noviembre: una persona del equipo directivo en cada centro y, además, un docente por cada 3 aulas en infantil, primaria y secundaria; el 50% de la plantilla en educación especial y el 33% en las escuelas infantiles; y el 50% del personal de comedor, cocina, acogida y extraescolares." },
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
          const rest = `SEMAF la va desconvocar el 20 de novembre després d'arribar a un acord, de manera que Rodalies, Cercanías, Mitja Distància, AVE i Llarga Distància circulen amb l'horari habitual, llevat que Renfe avisi del contrari; cap altre sindicat no té vaga de trens convocada aquell dia a les fonts revisades el ${checked}. El que sí hi ha: comença la vaga de Correus a la Comunitat de Madrid (fins al 27) i a Cadis, Còrdova, Huelva, Màlaga i Sevilla (fins al 25), amb les oficines obertes per al vot per correu, i continua la de metges del Sindicato Médicos Unidos. No és una vaga general.`;
          if (phase === "after") return "**El dilluns 23 de novembre de 2026 no hi va haver vaga de Renfe:** el sindicat de maquinistes SEMAF la va desconvocar el 20 de novembre després d'arribar a un acord. Va començar la vaga de Correus a Madrid i a cinc províncies andaluses i va continuar la de metges. No va ser una vaga general. Més avall, qui va convocar cadascuna i els seus serveis mínims.";
          if (phase === "today") return `**Avui, dilluns 23 de novembre, no hi ha vaga de Renfe ni de Rodalies.** ${rest}`;
          if (phase === "eve") return `**Demà, dilluns 23 de novembre, no hi ha vaga de Renfe ni de Rodalies.** ${rest}`;
          return `**No: la vaga de maquinistes de Renfe del dilluns 23 de novembre de 2026 està desconvocada.** ${rest}`;
        },
        firstQuestion: { eve: "Hi ha vaga demà, dilluns 23 de novembre de 2026?", today: "Hi ha vaga avui, dilluns 23 de novembre de 2026?" },
        title: "Vaga 23 de novembre de 2026: la de Renfe i Rodalies, desconvocada; Correus i metges",
        seoTitle: "Vaga 23 de novembre de 2026: Renfe i Rodalies, desconvocada",
        description: {
          before: "Dilluns 23: SEMAF ha desconvocat la vaga de maquinistes de Renfe. Rodalies, AVE i Cercanías, amb l'horari habitual. Però hi ha vaga de Correus i de metges.",
          eve: "Demà dilluns 23 no hi ha vaga de Renfe: SEMAF la va desconvocar. Rodalies, AVE i Cercanías, horari habitual. Sí que hi ha vaga de Correus i de metges.",
          today: "Avui dilluns 23 no hi ha vaga de Renfe: SEMAF la va desconvocar. Rodalies, AVE i Cercanías, horari habitual. Sí que hi ha vaga de Correus i de metges.",
          after: "El 23 de novembre de 2026 no hi va haver vaga de Renfe: SEMAF la va desconvocar el 20. Sí que n'hi va haver a Correus (Madrid i Andalusia) i de metges.",
        },
        excerpt: "Les vagues del dilluns 23 de novembre de 2026: la de maquinistes de Renfe (SEMAF), desconvocada; Correus a Madrid i Andalusia, metges i aeroports.",
        callOffFact: { label: "Renfe i Rodalies (SEMAF)", value: "Vaga desconvocada: trens amb l'horari habitual, llevat que Renfe avisi del contrari." },
        extraHeading: "Trens el dilluns 23: sense vaga",
        extraId: "trens",
        extra: (checked) => [
          ...paras(
            `**La vaga de maquinistes està desconvocada.** SEMAF ho va anunciar el 20 de novembre: «SEMAF ha procedido a la desconvocatoria de la jornada de huelga prevista para el próximo 23 de noviembre tras alcanzar un acuerdo que transforma las reivindicaciones del colectivo en realidades normativas, operativas y verificables», segons ${link(U.semaf38, "el seu comunicat 2026-38")}. En ${link(U.semaf39, "el 2026-39")} qualifica aquest text d'«Acuerdo de fin de huelga (art. 8.2 RDLRT)».`,
          ),
          table(
            "Trens del dilluns 23 de novembre de 2026, després de la desconvocatòria de SEMAF",
            ["Servei", "El dilluns 23", "Serveis mínims"],
            [
              ["Rodalies de Catalunya i regionals de Catalunya", "Horari habitual, llevat d'avís de Renfe: no hi ha vaga", "Cap: el 66% en hora punta i el 33% que havia fixat la Generalitat eren per a aquesta vaga"],
              ["Cercanías fora de Catalunya", "Horari habitual, llevat d'avís de Renfe: no hi ha vaga", "Cap: el Ministeri de Transports no havia publicat cap resolució per al 23"],
              ["AVE, Llarga Distància i Mitja Distància de Renfe", "Horari habitual, llevat d'avís de Renfe: no hi ha vaga", "Cap"],
              ["Iryo i Ouigo", "Sense vaga convocada a les fonts revisades", "—"],
              ["Metro, autobusos, tramvies i FGC", "No formen part de cap vaga aquell dia", "—"],
            ],
            `Revisat el ${checked}.`,
          ),
          ...paras(
            `**Cap altra vaga de trens aquell dia:** el ${checked}, el Ministeri de Transports no tenia cap resolució de serveis mínims per al 23 a ${link(U.ministryRail, "la seva llista de resolucions ferroviàries")}, que acaba amb la del 12 de novembre per al 17, i l'ordre de la Generalitat per a Rodalies del 16 de novembre, a ${link(U.treballMs, "la llista del Departament d'Empresa i Treball")}, era per a la vaga de SEMAF.`,
            `**Què fer:** el ${checked}, Renfe i Rodalies encara no havien publicat cap avís sobre la decisió de SEMAF. Abans de sortir, mira ${link(U.rodaliesStatus, "l'estat del servei de Rodalies")}; si tens bitllet d'AVE, Llarga o Mitja Distància, segueix el que publiqui ${link(U.renfe, "Renfe")} o t'enviï per correu.`,
          ),
        ],
        madridDay: "**El dilluns 23:** no és un dels dies d'aturades parcials de CSIF (els següents són el dimarts 24 i el dijous 26, de 9.00 a 11.00 i de 17.00 a 19.00 h, segons el seu calendari); la vaga indefinida continua convocada.",
        madridValue: "Vaga indefinida des del 14 d'octubre (sense aturades de CSIF aquell dia)",
        notCalled:
          "No és una vaga general ni de trens: la de maquinistes de Renfe està desconvocada, Iryo i Ouigo no tenen convocatòria a les fonts revisades, i el metro, els autobusos, els tramvies i FGC no formen part de cap. A Andalusia, la vaga de Correus és només a Cadis, Còrdova, Huelva, Màlaga i Sevilla.",
        catalanGuide: (locale) => b2link("strikeRenfe", locale, "Vaga de Renfe i Rodalies del 23 de novembre: desconvocada"),
        faq: (checked) => [
          { question: "Hi ha vaga el dilluns 23 de novembre de 2026?", answer: "Sí, però ni de trens ni general: SEMAF va desconvocar el 20 de novembre la vaga de maquinistes de Renfe. Aquell dia comença la vaga de Correus a la Comunitat de Madrid i a cinc províncies andaluses, i continua la de metges del Sindicato Médicos Unidos." },
          { question: "Hi ha vaga de Rodalies el 23 de novembre?", answer: "No. El sindicat de maquinistes SEMAF la va desconvocar el 20 de novembre: «SEMAF ha procedido a la desconvocatoria de la jornada de huelga prevista para el próximo 23 de noviembre tras alcanzar un acuerdo», segons el seu comunicat 2026-38. Rodalies, que opera el Grup Renfe, circula amb l'horari habitual, llevat que Renfe avisi del contrari." },
          { question: "Hi ha serveis mínims a Rodalies el 23 de novembre?", answer: `No: sense vaga no n'hi ha, i el 66% en hora punta i el 33% que havia fixat la Generalitat eren per a la vaga de SEMAF. El ${checked}, Rodalies encara no havia publicat cap avís: mira l'estat del servei abans de sortir.` },
          { question: "Funcionen l'AVE i la Llarga Distància el 23 de novembre?", answer: `Sí, sense vaga: SEMAF la va desconvocar el 20 de novembre i el ${checked} el Ministeri de Transports no tenia cap resolució de serveis mínims per a aquell dia. Amb qualsevol dubte sobre el bitllet, segueix el que publiqui Renfe.` },
          { question: "La vaga de Correus afecta el vot per correu?", answer: "L'ordre del Ministeri de l'Interior obliga a obrir les oficines de Correus en el seu horari habitual per al vot per correu, amb 1, 2 o 3 treballadors per torn segons la plantilla, i fixa el repartiment dels enviaments electorals amb fins al 50% de la plantilla del 23 al 25 de novembre, «coincidiendo con la admisión del voto por correo». Aquesta vaga no és a Catalunya: és a Madrid i a cinc províncies andaluses." },
        ],
      },
      strike26n: {
        lead: (phase, checked) => {
          const what = `vaga a l'educació a tot Catalunya, de 0.00 a 24.00 h i cada treballador durant la seva jornada, convocada per USTEC·STEs, la CGT, la COS i La Intersindical: les escoles obren, però hi estan cridats el professorat, el personal no docent i el de menjador, lleure i transport escolar. Els serveis mínims, publicats per la Generalitat el 23 de novembre, són una persona de l'equip directiu i un docent per cada 3 aules a cada centre, el 50% de la plantilla a l'educació especial i el 50% del personal de menjador i d'acollida. Continuen la vaga de metges del Sindicato Médicos Unidos, amb les urgències garantides, i la de Correus a la Comunitat de Madrid; a Madrid, CSIF convoca aturades a l'ensenyament públic de 9.00 a 11.00 i de 17.00 a 19.00 h. No hi ha vaga general ni de trens.`;
          if (phase === "after") return "**El dijous 26 de novembre de 2026 hi va haver vaga a l'educació a Catalunya,** van continuar la de metges del Sindicato Médicos Unidos i la de Correus a Madrid, i CSIF va convocar aturades a l'ensenyament públic madrileny. No va ser una vaga general. Més avall, qui va convocar cadascuna.";
          if (phase === "today") return `**Avui, dijous 26 de novembre, hi ha** ${what}`;
          if (phase === "eve") return `**Demà, dijous 26 de novembre, hi ha** ${what}`;
          return `**Sí: el dijous 26 de novembre de 2026 hi ha** ${what}`;
        },
        firstQuestion: { eve: "Hi ha vaga demà, dijous 26 de novembre de 2026?", today: "Hi ha vaga avui, dijous 26 de novembre de 2026?" },
        title: "Vaga 26 de novembre de 2026: educació a Catalunya, metges i Madrid. Hi ha classe?",
        seoTitle: "Vaga 26 de novembre de 2026: educació a Catalunya",
        description: {
          before: "Dijous 26: vaga a l'educació a Catalunya (mínims: un docent per cada 3 aules), de metges (SMU) i de Correus a Madrid; aturades a Madrid.",
          eve: "Demà dijous 26: vaga a l'educació a Catalunya (mínims: un docent per cada 3 aules), de metges (SMU) i de Correus a Madrid; aturades a Madrid.",
          today: "Avui dijous 26: vaga a l'educació a Catalunya (mínims: un docent per cada 3 aules), de metges (SMU) i de Correus a Madrid; aturades a Madrid.",
          after: "El 26 de novembre de 2026 hi va haver vaga a l'educació a Catalunya, de metges (SMU) i de Correus a Madrid, i aturades de CSIF a Madrid.",
        },
        excerpt: "Les vagues del dijous 26 de novembre de 2026: educació a Catalunya (hi ha classe?), metges (SMU), Correus a Madrid, aturades a les escoles de Madrid i aeroports.",
        extraHeading: "Hi ha classe el dijous 26 a Catalunya?",
        extraId: "hi-ha-classe",
        extra: (checked) => [
          ...paras(
            `**Sí, els centres obren:** és una vaga del personal, no un tancament, i el dijous 26 és dia lectiu. Segons ${link(U.cgtEns26Notice, "el preavís de la CGT")}, que CGT Ensenyament va publicar el 18 de novembre (${link(U.cgtEns26Call, "«us convoquem a la vaga»")}), hi estan cridats el personal docent i no docent dels centres públics, les escoles bressol, els EAP i els CREDA, i el personal de menjador, acollida, lleure, extraescolars i transport escolar dels centres públics, privats i concertats.`,
            `**Serveis mínims:** els va fixar el Departament d'Empresa i Treball per una ordre del 23 de novembre, a ${link(U.treballMs, "la seva llista")}: a cada centre, una persona de l'equip directiu i, a més, un docent per cada 3 aules a infantil, primària i secundària; el 50% de la plantilla a l'educació especial i el 33% a les llars d'infants; i el 50% del personal de menjador, cuina, acollida i extraescolars. La direcció de cada centre designa qui els cobreix: pregunta al teu què garanteix aquell dia.`,
          ),
          table(
            "Què funciona el dijous 26 de novembre de 2026 a Catalunya",
            ["Servei", "El dijous 26", "Serveis mínims"],
            [
              ["Escoles i instituts públics", "Obren; el professorat i el personal no docent hi estan convocats", "Una persona de l'equip directiu i un docent per cada 3 aules; educació especial, 50% de la plantilla"],
              ["Escoles bressol, EAP i CREDA", "Convocats", "Llars d'infants: 33% de la plantilla"],
              ["Menjador, acollida, extraescolars i transport escolar", "Convocats també a la concertada i la privada: pregunta al centre o a l'empresa", "50% del personal de menjador, cuina, acollida i extraescolars"],
              ["Sanitat pública", "Vagues de metges (Sindicato Médicos Unidos i Metges de Catalunya)", "Publicats: urgències i unitats especials amb normalitat"],
              ["Rodalies, metro, autobusos i FGC", "Sense vaga convocada aquell dia a les fonts revisades", "—"],
            ],
            `Revisat el ${checked}.`,
          ),
          ...paras(`Amb les novetats de la vaga a l'educació, els seus serveis mínims i què han de saber les famílies: ${b2link("strikeEducation", "ca", "Vaga a l'educació del 26 de novembre a Catalunya: hi ha escola?")}.`),
        ],
        madridDay: "**El dijous 26:** CSIF hi convoca aturades parcials de 9.00 a 11.00 i de 17.00 a 19.00 h, segons el seu calendari.",
        madridValue: "Vaga indefinida des del 14 d'octubre; CSIF, aturades de 9.00 a 11.00 i de 17.00 a 19.00 h",
        notCalled:
          "No és una vaga general ni de trens: SEMAF va desconvocar la vaga de maquinistes de Renfe del dilluns 23 i el Ministeri de Transports no té cap resolució de serveis mínims ferroviaris per al dijous 26. La vaga de Correus a Andalusia es va acabar el 25; a Madrid continua fins al 27.",
        catalanGuide: (locale) => b2link("strikeEducation", locale, B2_TITLES.strikeEducation[locale]),
        faq: (checked) => [
          { question: "Hi ha vaga el dijous 26 de novembre de 2026?", answer: "Sí, però no general: vaga a l'educació a Catalunya, tota la jornada; continuen la vaga de metges del Sindicato Médicos Unidos i la de Correus a la Comunitat de Madrid, i a Madrid CSIF convoca aturades a l'ensenyament públic. No hi ha vaga de trens." },
          { question: "Hi ha vaga d'educació el 26 de novembre?", answer: "Sí, a Catalunya: USTEC, la COS i La Intersindical en van registrar la convocatòria el 13 de novembre i la CGT el 14, segons l'ordre de serveis mínims; el calendari el marquen amb la CNT i l'Assemblea Educativa de Catalunya. Segons el preavís de la CGT, és de 0.00 a 24.00 h a tot Catalunya, cada treballador durant la seva jornada, i crida el personal docent i no docent, les escoles bressol i el personal de menjador, lleure i transport escolar." },
          { question: "Es manté la vaga d'educació del 26 de novembre?", answer: `Sí. La mediació que el Departament d'Empresa i Treball va convocar el matí del dijous 19 de novembre per intentar evitar-la va acabar sense acord: segons USTEC·STEs, Educació no hi va presentar cap proposta. El ${checked}, la vaga continuava convocada.` },
          { question: "Hi ha classe el dijous 26 de novembre a Catalunya?", answer: "Sí: els centres obren, perquè és una vaga del personal, no un tancament, però part del professorat i del personal de menjador i de transport escolar pot fer vaga. Els serveis mínims garanteixen a cada centre una persona de l'equip directiu i un docent per cada 3 aules: pregunta al teu què garanteix aquell dia." },
          { question: "Quins serveis mínims hi ha a les escoles el 26 de novembre?", answer: "Els va fixar el Departament d'Empresa i Treball per una ordre del 23 de novembre: una persona de l'equip directiu a cada centre i, a més, un docent per cada 3 aules a infantil, primària i secundària; el 50% de la plantilla a l'educació especial i el 33% a les llars d'infants; i el 50% del personal de menjador, cuina, acollida i extraescolars." },
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
          const rest = `SEMAF called it off on 20 November after reaching an agreement, so Rodalies, Cercanías, Media Distancia, AVE and long-distance trains run to their usual timetable unless Renfe says otherwise; no other union has a rail strike called that day in the sources checked on ${checked}. What does happen: Correos (the Spanish post office) goes on strike in the Community of Madrid (to the 27th) and in Cádiz, Córdoba, Huelva, Málaga and Seville (to the 25th), with post offices open for postal votes, and the Sindicato Médicos Unidos doctors' strike goes on. It is not a general strike.`;
          if (phase === "after") return "**There was no Renfe strike on Monday 23 November 2026:** the train drivers' union SEMAF called it off on 20 November after reaching an agreement. Correos' strike began in Madrid and five Andalusian provinces and the doctors' strike went on. It was not a general strike. Who called each one and its minimum services are below.";
          if (phase === "today") return `**Today, Monday 23 November, there is no Renfe or Rodalies strike.** ${rest}`;
          if (phase === "eve") return `**Tomorrow, Monday 23 November, there is no Renfe or Rodalies strike.** ${rest}`;
          return `**No: the Renfe train drivers' strike on Monday 23 November 2026 is called off.** ${rest}`;
        },
        firstQuestion: { eve: "Is there a strike in Spain tomorrow, Monday 23 November 2026?", today: "Is there a strike in Spain today, Monday 23 November 2026?" },
        title: "Strike in Spain on 23 November 2026: Renfe and Rodalies drivers' strike called off; Correos, doctors",
        seoTitle: "Spain strike 23 November 2026: Renfe strike called off",
        description: {
          before: "Monday 23: SEMAF has called off the Renfe train drivers' strike. Rodalies, AVE and Cercanías run to the usual timetable. Correos and doctors do strike.",
          eve: "Tomorrow, Monday 23: no Renfe strike, SEMAF called it off. Rodalies, AVE and Cercanías run as usual. Correos and doctors do strike.",
          today: "Today, Monday 23: no Renfe strike, SEMAF called it off. Rodalies, AVE and Cercanías run as usual. Correos and doctors do strike.",
          after: "There was no Renfe strike on 23 November 2026: SEMAF called it off on the 20th. Correos' strike began in Madrid and Andalusia; the doctors' went on.",
        },
        excerpt: "Strikes in Spain on Monday 23 November 2026: the Renfe train drivers' strike (SEMAF) is called off; Correos in Madrid and Andalusia, doctors and airports.",
        callOffFact: { label: "Renfe and Rodalies (SEMAF)", value: "Strike called off: trains run to the usual timetable unless Renfe says otherwise." },
        extraHeading: "Trains on Monday 23: no strike",
        extraId: "trains",
        extra: (checked) => [
          ...paras(
            `**The drivers' strike is called off.** SEMAF announced it on 20 November: "SEMAF ha procedido a la desconvocatoria de la jornada de huelga prevista para el próximo 23 de noviembre tras alcanzar un acuerdo que transforma las reivindicaciones del colectivo en realidades normativas, operativas y verificables" (SEMAF has called off the strike day planned for 23 November after reaching an agreement that turns the drivers' demands into regulatory, operational and verifiable facts), according to ${link(U.semaf38, "its notice 2026-38")}. ${link(U.semaf39, "Notice 2026-39")} calls the text an "Acuerdo de fin de huelga (art. 8.2 RDLRT)" (an agreement ending the strike).`,
          ),
          table(
            "Trains on Monday 23 November 2026, after SEMAF's call-off",
            ["Service", "On Monday 23", "Minimum services"],
            [
              ["Rodalies de Catalunya and Catalan regional trains", "Usual timetable unless Renfe says otherwise: no strike", "None: the 66% at peak and 33% the Generalitat had set were for this strike"],
              ["Cercanías outside Catalonia", "Usual timetable unless Renfe says otherwise: no strike", "None: the Ministry of Transport had published no resolution for the 23rd"],
              ["Renfe AVE, long-distance and Media Distancia trains", "Usual timetable unless Renfe says otherwise: no strike", "None"],
              ["Iryo and Ouigo", "No strike called in the sources checked", "—"],
              ["Metro, buses, trams and FGC", "Not part of any strike that day", "—"],
            ],
            `Checked on ${checked}.`,
          ),
          ...paras(
            `**No other rail strike that day:** on ${checked}, the Ministry of Transport had no minimum-services resolution for the 23rd on ${link(U.ministryRail, "its list of rail resolutions")}, whose newest is the one of 12 November for the 17th, and the Generalitat's Rodalies order of 16 November, on ${link(U.treballMs, "the Catalan labour department's list")}, was for SEMAF's strike.`,
            `**What to do:** on ${checked}, Renfe and Rodalies had not yet published a notice about SEMAF's decision. Before you set off, check ${link(U.rodaliesStatus, "the Rodalies live service status")}; if you hold an AVE, long-distance or Media Distancia ticket, follow what ${link(U.renfe, "Renfe")} publishes or emails you.`,
          ),
        ],
        madridDay: "**On Monday 23:** not one of CSIF's partial-stoppage days (the next are Tuesday 24 and Thursday 26, 09:00 to 11:00 and 17:00 to 19:00, according to its calendar); the open-ended strike stays called.",
        madridValue: "Open-ended strike since 14 October (no CSIF stoppage that day)",
        notCalled:
          "It is not a general strike or a rail strike: the Renfe drivers' strike is called off, Iryo and Ouigo have no call in the sources checked, and metros, buses, trams and FGC are not part of any. In Andalusia, Correos' strike is only in Cádiz, Córdoba, Huelva, Málaga and Seville.",
        catalanGuide: (locale) => b2link("strikeRenfe", locale, "Renfe and Rodalies strike on 23 November: called off"),
        faq: (checked) => [
          { question: "Is there a strike in Spain on Monday 23 November 2026?", answer: "Yes, but not a rail strike or a general strike: SEMAF called off the Renfe train drivers' strike on 20 November. That day Correos' strike begins in the Community of Madrid and five Andalusian provinces, and the Sindicato Médicos Unidos doctors' strike goes on." },
          { question: "Is there a Renfe strike on 23 November?", answer: "No. The train drivers' union SEMAF called it off on 20 November: \"SEMAF ha procedido a la desconvocatoria de la jornada de huelga prevista para el próximo 23 de noviembre tras alcanzar un acuerdo\" (SEMAF has called off the strike day planned for 23 November after reaching an agreement), according to its notice 2026-38." },
          { question: "Does Rodalies run on 23 November?", answer: `Yes, to its usual timetable unless Renfe says otherwise: with no strike there are no minimum services, and the 66% at peak and 33% the Generalitat had set were for SEMAF's strike. On ${checked}, Rodalies had not yet published a notice: check the live service status before you set off.` },
          { question: "Do AVE and Madrid's Cercanías run on 23 November?", answer: `Yes, with no strike: SEMAF called it off on 20 November, and on ${checked} the Ministry of Transport had no minimum-services resolution for that day. If in doubt about your ticket, follow what Renfe publishes.` },
          { question: "Does the Correos strike affect postal voting?", answer: "The Interior Ministry's order makes Correos open its post offices at their usual hours for postal votes, with 1, 2 or 3 staff per shift depending on the office's size, and sets delivery of election mail with up to 50% of staff from 23 to 25 November, \"coincidiendo con la admisión del voto por correo\" (while postal votes are being accepted)." },
        ],
      },
      strike26n: {
        lead: (phase, checked) => {
          const what = `an education strike across Catalonia, 00:00 to 24:00 and each worker during their own working day, called by USTEC·STEs, CGT, COS and La Intersindical: schools open, but teachers, non-teaching staff and lunchtime, leisure and school-transport staff are called out. The minimum services, which the Generalitat published on 23 November, are one member of the head team and one teacher per 3 classes at each school, 50% of staff at special-needs schools and 50% of lunchtime and before-school care staff. The Sindicato Médicos Unidos doctors' strike goes on, with A&E guaranteed, and so does Correos' strike in the Community of Madrid; in Madrid, CSIF calls stoppages in state schools from 09:00 to 11:00 and 17:00 to 19:00. There is no general strike and no rail strike.`;
          if (phase === "after") return "**On Thursday 26 November 2026 there was an education strike in Catalonia,** the Sindicato Médicos Unidos doctors' strike and Correos' strike in Madrid went on, and CSIF called stoppages in Madrid's state schools. It was not a general strike. Who called each one is below.";
          if (phase === "today") return `**Today, Thursday 26 November, there is** ${what}`;
          if (phase === "eve") return `**Tomorrow, Thursday 26 November, there is** ${what}`;
          return `**Yes: on Thursday 26 November 2026 there is** ${what}`;
        },
        firstQuestion: { eve: "Is there a strike in Spain tomorrow, Thursday 26 November 2026?", today: "Is there a strike in Spain today, Thursday 26 November 2026?" },
        title: "Strike on 26 November 2026: Catalonia schools, doctors and Madrid. Is there school?",
        seoTitle: "Spain strike 26 November 2026: Catalonia schools, doctors",
        description: {
          before: "Thursday 26: education strike in Catalonia (minimum: one teacher per 3 classes), SMU doctors' strike, Correos in Madrid; Madrid school stoppages.",
          eve: "Tomorrow, Thursday 26: education strike in Catalonia (minimum: one teacher per 3 classes), SMU doctors' strike, Correos in Madrid; Madrid stoppages.",
          today: "Today, Thursday 26: education strike in Catalonia (minimum: one teacher per 3 classes), SMU doctors' strike, Correos in Madrid; Madrid stoppages.",
          after: "On 26 November 2026 there was an education strike in Catalonia, SMU doctors and Correos in Madrid struck, and CSIF stopped work in Madrid's schools.",
        },
        excerpt: "Strikes on Thursday 26 November 2026: education in Catalonia (is there school?), SMU doctors, Correos in Madrid, Madrid school stoppages and airports.",
        extraHeading: "Is there school in Catalonia on Thursday 26?",
        extraId: "is-there-school",
        extra: (checked) => [
          ...paras(
            `**Yes, schools open:** it is a strike by staff, not a closure, and Thursday 26 is a school day. According to ${link(U.cgtEns26Notice, "CGT's strike notice")}, which CGT Ensenyament published on 18 November (${link(U.cgtEns26Call, "\"us convoquem a la vaga\"")}, we call you out on strike), teaching and non-teaching staff at state schools, nursery schools (escoles bressol), the EAP and CREDA support teams, and lunchtime, before- and after-school, leisure and school-transport staff at state, private and concertada (state-funded private) schools are called out.`,
            `**Minimum services:** the Department of Business and Labour set them by an order of 23 November, on ${link(U.treballMs, "its list")}: at each school, one member of the head team plus one teacher per 3 classes in infant, primary and secondary schools; 50% of staff at special-needs schools and 33% at nursery schools (llars d'infants); and 50% of lunchtime, kitchen, before-school care and after-school activity staff. Each school's management names who covers them: ask yours what it can provide that day.`,
          ),
          table(
            "What runs in Catalonia on Thursday 26 November 2026",
            ["Service", "On Thursday 26", "Minimum services"],
            [
              ["State schools", "Open; teachers and non-teaching staff are called out", "One member of the head team and one teacher per 3 classes; special-needs schools, 50% of staff"],
              ["Nursery schools (escoles bressol), EAP and CREDA", "Called out", "Nursery schools (llars d'infants): 33% of staff"],
              ["Lunchtime, before- and after-school care, school transport", "Called out at concertada and private schools too: ask your school or the provider", "50% of lunchtime, kitchen, before-school care and after-school activity staff"],
              ["Public healthcare", "Doctors' strikes (Sindicato Médicos Unidos and Metges de Catalunya)", "Published: A&E and special units run normally"],
              ["Rodalies, metro, buses and FGC", "No strike called that day in the sources checked", "—"],
            ],
            `Checked on ${checked}.`,
          ),
          ...paras(`For the latest on the education strike, its minimum services and what parents need to know: ${b2link("strikeEducation", "en", "Catalonia teachers' strike on 26 November: is there school?")}.`),
        ],
        madridDay: "**On Thursday 26:** CSIF calls partial stoppages from 09:00 to 11:00 and from 17:00 to 19:00, according to its calendar.",
        madridValue: "Open-ended strike since 14 October; CSIF stoppages 09:00-11:00 and 17:00-19:00",
        notCalled:
          "There is no general strike and no rail strike: SEMAF called off the Renfe drivers' strike of Monday 23, and the Ministry of Transport has no rail minimum-services resolution for Thursday 26. Correos' strike in Andalusia ended on the 25th; in Madrid it runs to the 27th.",
        catalanGuide: (locale) => b2link("strikeEducation", locale, B2_TITLES.strikeEducation[locale]),
        faq: (checked) => [
          { question: "Is there a strike in Spain on Thursday 26 November 2026?", answer: "Yes, but not a general strike: an education strike in Catalonia for the whole day; the Sindicato Médicos Unidos doctors' strike and Correos' strike in the Community of Madrid go on, and in Madrid CSIF calls stoppages in state schools. There is no rail strike." },
          { question: "Is there an education strike on 26 November?", answer: "Yes, in Catalonia: USTEC, COS and La Intersindical registered their calls on 13 November and CGT on the 14th, according to the minimum-services order; they set the calendar with CNT and the Assemblea Educativa de Catalunya. According to CGT's notice, it runs from 00:00 to 24:00 across Catalonia, each worker during their own working day, and calls out teaching and non-teaching staff, nursery schools and lunchtime, leisure and school-transport staff." },
          { question: "Is the 26 November education strike still on?", answer: `Yes. The mediation the Department of Business and Labour called on the morning of Thursday 19 November to try to avoid it ended without agreement: according to USTEC·STEs, the Education Department put forward no proposal. On ${checked}, the strike was still on.` },
          { question: "Is there school in Catalonia on Thursday 26 November?", answer: "Yes: schools open, because it is a strike by staff, not a closure, but some teachers and lunchtime and school-transport staff may strike. The minimum services keep one member of the head team and one teacher per 3 classes at each school: ask yours what it can provide that day." },
          { question: "What minimum services are there in schools on 26 November?", answer: "The Department of Business and Labour set them by an order of 23 November: one member of the head team at each school plus one teacher per 3 classes in infant, primary and secondary schools; 50% of staff at special-needs schools and 33% at nursery schools; and 50% of lunchtime, kitchen, before-school care and after-school activity staff." },
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

  const calledOff = calledOffOnDay(key);
  const facts = [
    ...(d.callOffFact && calledOff.length > 0 ? [d.callOffFact] : []),
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
    // 20 Nov 2026: the 23rd's Renfe strike, called off, from SPAIN_NOT_HAPPENING (as the 19th printed Adif's).
    ...(calledOff.length > 0 ? [list(...calledOff.map((item) => `**${item.title[locale]}.** ${fillChecked(item.text, locale, strikeDaysCheckedOn())}`))] : []),
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
  for (const item of calledOffOnDay(key)) item.sources.forEach(add);
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
