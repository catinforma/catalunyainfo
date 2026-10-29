import type { Block } from "@/lib/content/blocks";
import { TRAINS } from "@/lib/content/features/trains";
import type { Locale } from "@/lib/i18n/config";
import { hubPath as rodaliesHub } from "@/lib/programmatic/rodalies/paths";

import { dateYear, dayDate } from "./festive";
import {
  b2Related,
  b2link,
  callout,
  faq,
  h2,
  h3,
  keyFacts,
  lead,
  list,
  paras,
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * "Vaga avui a Catalunya: què funciona" — one evergreen URL per language, one
 * dated section per strike, so the page keeps its authority from one strike to
 * the next (research_notes/x10 §B2 #7).
 *
 * Every fact was read on 27 Oct 2026 on the organiser's, the operator's or the
 * official gazette's own page (fact pack: research_notes/x10/strikes-hub-factpack.md):
 *
 *  - 29 Oct: SEMAF's call of 16 Oct (Grupo Renfe drivers, 00:01-23:59) and
 *    Rodalies' notice updated 26 Oct (Departament d'Empresa i Treball minimum
 *    services: 66% at peak times, 33% the rest of the day; per-line PDFs).
 *  - 30 Oct and 2 Nov: Ouigo's own notice (SEMAF; 71% approved by the
 *    Ministry of Transport, 55 of 77 trains; every Barcelona train runs).
 *  - 11 Nov: CCOO (19 Oct: "ya está registrada", presented with UGT, CGT,
 *    CNT, Confederación Intersindical, CO.BAS, Sindicato de Inquilinas, Unión
 *    de Actores y Actrices), UGT, CCOO de Catalunya (hours and shifts), UGT de
 *    Catalunya, CGT Catalunya and USTEC·STEs. Minimum services not published.
 *  - Legal basis only from the BOE (Constitution art. 28.2; RDL 17/1977 arts.
 *    3, 4 and 10.2) and the DOGC (Ordres EMT/38/2024 and EMT/201/2024, which
 *    cite Decret 120/1995; the decree itself is a scanned PDF).
 *
 * Left out on purpose (press only, not confirmed by an organiser or an
 * operator): the 11N demonstration's place and time, Rodalies' peak-hour
 * bands, further Ouigo dates, any 11N percentage.
 *
 * HOW TO UPDATE (the lead):
 *  - New strike: add an entry to STRIKES (dates, title, facts, minimum
 *    services, sources), move STRIKES_AS_OF to the day you checked, run the
 *    tests, deploy, publish `?only=strikes`.
 *  - Minimum services out: set `minimumServices.status = "published"`, rewrite
 *    `minimumServices.text` and `msShort` from the order/operator, add the
 *    order to `sources`, move STRIKES_AS_OF, deploy, publish `?only=strikes`.
 *  - 11 November: the general strike also has its own page (`strike-11n.ts`,
 *    one minimum-services slot per sector). Update both and publish
 *    `?only=strike-11n`, which republishes that page and this hub; a test
 *    fails if this entry and that page disagree on whether the order is out.
 *  - The day after a listed strike: move STRIKES_AS_OF (the test
 *    "no listed strike is shown as upcoming after its last day" fails until
 *    you do), so it is rendered under "past strikes". A past strike may not
 *    stay "pending": record what was published, or set "none" and say why.
 */

/**
 * The day the list was last brought up to date. Upcoming and past are decided
 * against this date, never against the clock: the HTML must be the same
 * whichever day it is rendered.
 */
export const STRIKES_AS_OF = "2026-10-27";

/**
 * The day the facts on the page were last read on the sources. Bringing the
 * list up to date means re-reading them, so it is the same day by design: one
 * constant to move.
 */
export const STRIKES_VERIFIED = STRIKES_AS_OF;

export type StrikeScope = "general" | "rail" | "transport" | "education" | "health" | "other";

/**
 * pending: not published yet (only allowed while the strike is upcoming).
 * published: the order or the operator's notice is out; `text` says what it set.
 * none: the strike passed, or was called off, with nothing to publish; `text` says which.
 */
export type MinimumServicesStatus = "pending" | "published" | "none";

export interface StrikeSource {
  name: string;
  url: string;
  publisher: string;
}

export interface Strike {
  /** Stable anchor for the dated section, e.g. "vaga-general-2026-11-11". */
  id: string;
  /** Every day of strike action (ISO, Catalan civil date), ascending. */
  dates: string[];
  scope: StrikeScope;
  /** What it is, after the date in the heading. Tense-neutral. */
  title: Record<Locale, string>;
  /** One phrase for the lead and the key facts. */
  short: Record<Locale, string>;
  /** Shortest name for the meta description, e.g. "Renfe el 29 d'octubre". */
  label: Record<Locale, string>;
  /** Who called it, when, who is called out. Tense-neutral list items. */
  facts: Record<Locale, string[]>;
  minimumServices: {
    status: MinimumServicesStatus;
    /** One line for the key facts. */
    msShort: Record<Locale, string>;
    /** Who sets them and what is published (or that nothing is yet). */
    text: Record<Locale, string>;
  };
  /** Advice printed only while the strike is upcoming. */
  advice: Record<Locale, string[]>;
  sources: StrikeSource[];
}

export const STRIKE_URLS = {
  dogc: "https://dogc.gencat.cat/ca/",
  rodaliesStatus: "https://rodalies.gencat.cat/ca/alteracions_del_servei/",
  rodalies29: "https://rodalies.gencat.cat/ca/detalls/article/10_19_Vaga_29",
  renfe: "https://www.renfe.com/es/es",
  ouigo: "https://www.ouigo.com/es/",
  ouigoStrike: "https://www.ouigo.com/es/servicios-minimos-huelga",
  tmb: "https://www.tmb.cat/ca/transport-barcelona/avisos-servei",
  fgc: "https://www.fgc.cat/",
  aena: "https://www.aena.es/es/infovuelos.html",
  semaf29: "https://www.semaf.org/informaciones/huelga-grupo-renfe-29-octubre/",
  ccooRegistered: "https://www.ccoo.es/noticia:770401",
  ccooCall: "https://www.ccoo.es/noticia:769574--Convocamos_huelga_general_para_el_11_de_noviembre",
  ugt: "https://www.ugt.es/huelga-general-11-noviembre",
  ccooCatalunya: "https://11n.cat/",
  ugtCatalunya: "https://www.ugt.cat/vaga-general-11n/",
  ugtCatalunyaCall: "https://www.ugt.cat/l11-n-vaga-general-per-uns-salaris-dignes-un-habitatge-assequible-i-una-vida-millor/",
  cgtCatalunya: "https://cgtcatalunya.cat/11n-cgt-convoca-vaga-general/",
  ustec: "https://www.sindicat.net/2026/10/09/ratifiquem-la-vaga-general-de-l11-de-novembre-sense-casa-no-hi-ha-educacio-per-una-educacio-publica-de-qualitat-i-en-catala/",
  constitution: "https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229",
  rdl17: "https://www.boe.es/buscar/act.php?id=BOE-A-1977-6061",
  emt201: "https://portaljuridic.gencat.cat/eli/es-ct/o/2024/09/25/emt201/dof/cat/html",
  emt38: "https://portaljuridic.gencat.cat/eli/es-ct/o/2024/03/05/emt38/dof/cat/html",
  decret120: "https://portaljuridic.gencat.cat/eli/es-ct/d/1995/03/24/120/dof/cat/html",
} as const;

const U = STRIKE_URLS;
const link = (href: string, label: string) => `[${label}](${href})`;

/* -------------------------------------------------------------------------- */
/* The strikes                                                                */
/* -------------------------------------------------------------------------- */

export const STRIKES: Strike[] = [
  {
    id: "vaga-renfe-2026-10-29",
    dates: ["2026-10-29"],
    scope: "rail",
    title: {
      ca: "vaga de maquinistes del Grup Renfe (SEMAF)",
      es: "huelga de maquinistas del Grupo Renfe (SEMAF)",
      en: "Renfe train drivers' strike (SEMAF)",
    },
    short: {
      ca: "vaga de maquinistes de Renfe, que afecta Rodalies",
      es: "huelga de maquinistas de Renfe, que afecta a Rodalies",
      en: "Renfe train drivers' strike, which affects Rodalies",
    },
    label: { ca: "Renfe el 29 d'octubre", es: "Renfe el 29 de octubre", en: "Renfe on 29 October" },
    facts: {
      ca: [
        "**Convocatòria:** el sindicat de maquinistes SEMAF, que la va anunciar el 16 d'octubre de 2026.",
        "**Horari:** de les 00.01 a les 23.59 h.",
        "**Qui hi està cridat:** el personal de conducció de totes les empreses del Grup Renfe, a tot l'Estat. El metro, els autobusos, el tramvia i FGC no formen part de la convocatòria.",
      ],
      es: [
        "**Convocatoria:** el sindicato de maquinistas SEMAF, que la anunció el 16 de octubre de 2026.",
        "**Horario:** de 00.01 a 23.59 h.",
        "**A quién llama:** al personal de conducción de todas las empresas del Grupo Renfe, en toda España. El metro, los autobuses, el tranvía y FGC no forman parte de la convocatoria.",
      ],
      en: [
        "**Called by:** the train drivers' union SEMAF, which announced it on 16 October 2026.",
        "**Hours:** 00:01 to 23:59.",
        "**Who is called out:** drivers at every Renfe Group company, across Spain. The metro, buses, tram and FGC are not part of it.",
      ],
    },
    minimumServices: {
      status: "published",
      msShort: {
        ca: "Serveis mínims publicats: a Rodalies, el 66% en hora punta i el 33% la resta del dia",
        es: "Servicios mínimos publicados: en Rodalies, el 66% en hora punta y el 33% el resto del día",
        en: "Minimum services published: Rodalies runs 66% at peak times and 33% the rest of the day",
      },
      text: {
        ca: `A **Rodalies de Catalunya**, incloses les línies regionals, el servei es fa amb els serveis mínims del Departament d'Empresa i Treball de la Generalitat: el **66% del servei habitual en hora punta** i el **33% la resta del dia**, segons ${link(U.rodalies29, "l'avís de Rodalies")} actualitzat el 26 d'octubre de 2026, que enllaça l'horari de serveis mínims de cada línia. Per als altres trens de Renfe (alta velocitat, llarga i mitjana distància), Renfe té un avís de serveis mínims a ${link(U.renfe, "renfe.com")}.`,
        es: `En **Rodalies de Catalunya**, incluidas las líneas regionales, el servicio se presta con los servicios mínimos del Departament d'Empresa i Treball de la Generalitat: el **66% del servicio habitual en hora punta** y el **33% el resto del día**, según ${link(U.rodalies29, "el aviso de Rodalies")} actualizado el 26 de octubre de 2026, que enlaza el horario de servicios mínimos de cada línea. Para los demás trenes de Renfe (alta velocidad, larga y media distancia), Renfe tiene un aviso de servicios mínimos en ${link(U.renfe, "renfe.com")}.`,
        en: `On **Rodalies de Catalunya**, regional lines included, trains run to the minimum services set by the Generalitat's Department of Business and Labour: **66% of the usual service at peak times** and **33% for the rest of the day**, according to ${link(U.rodalies29, "Rodalies' notice")} (updated 26 October 2026), which links a minimum-service timetable for every line. For Renfe's other trains (high-speed, long and medium distance), Renfe carries a minimum-services notice on ${link(U.renfe, "renfe.com")}.`,
      },
    },
    advice: {
      ca: [
        `Abans de sortir, mira l'horari de serveis mínims de la teva línia a l'avís de Rodalies i, el mateix dia, ${link(U.rodaliesStatus, "l'estat del servei")}: Renfe avisa que la freqüència de pas pot canviar al llarg de la jornada.`,
        "Si pots, viatja fora de l'hora punta o fes el trajecte amb metro, FGC o autobús interurbà, que no són a la convocatòria.",
      ],
      es: [
        `Antes de salir, mira el horario de servicios mínimos de tu línea en el aviso de Rodalies y, el mismo día, ${link(U.rodaliesStatus, "el estado del servicio")}: Renfe advierte de que la frecuencia de paso puede cambiar a lo largo de la jornada.`,
        "Si puedes, viaja fuera de la hora punta o haz el trayecto en metro, FGC o autobús interurbano, que no están en la convocatoria.",
      ],
      en: [
        `Before you set off, check your line's minimum-service timetable in the Rodalies notice and, on the day, ${link(U.rodaliesStatus, "the live service status")}: Renfe warns that frequencies may change during the day.`,
        "If you can, travel outside the peak, or use the metro, FGC or an interurban bus instead: none of them is part of this strike.",
      ],
    },
    sources: [
      { name: "SEMAF convoca huelga en el Grupo Renfe para el 29 de octubre", url: U.semaf29, publisher: "SEMAF" },
      { name: "Convocatòria de vaga del dijous 29 d'octubre", url: U.rodalies29, publisher: "Rodalies de Catalunya" },
      { name: "Renfe: avisos de servicios mínimos", url: U.renfe, publisher: "Renfe" },
    ],
  },
  {
    id: "vaga-ouigo-2026-10-30",
    dates: ["2026-10-30", "2026-11-02"],
    scope: "rail",
    title: {
      ca: "vaga de maquinistes d'Ouigo (SEMAF)",
      es: "huelga de maquinistas de Ouigo (SEMAF)",
      en: "Ouigo train drivers' strike (SEMAF)",
    },
    short: {
      ca: "vaga de maquinistes d'Ouigo, amb tots els seus trens de Barcelona en servei",
      es: "huelga de maquinistas de Ouigo, con todos sus trenes de Barcelona en servicio",
      en: "Ouigo train drivers' strike, with all its Barcelona trains running",
    },
    label: {
      ca: "Ouigo el 30 d'octubre i el 2 de novembre",
      es: "Ouigo el 30 de octubre y el 2 de noviembre",
      en: "Ouigo on 30 October and 2 November",
    },
    facts: {
      ca: [
        "**Convocatòria:** el sindicat de maquinistes SEMAF, per als maquinistes d'Ouigo, l'operador d'alta velocitat que uneix Barcelona amb Madrid.",
        "**Dies:** divendres 30 d'octubre i dilluns 2 de novembre de 2026, segons Ouigo.",
      ],
      es: [
        "**Convocatoria:** el sindicato de maquinistas SEMAF, para los maquinistas de Ouigo, el operador de alta velocidad que une Barcelona con Madrid.",
        "**Días:** viernes 30 de octubre y lunes 2 de noviembre de 2026, según Ouigo.",
      ],
      en: [
        "**Called by:** the train drivers' union SEMAF, for drivers at Ouigo, the high-speed operator that links Barcelona and Madrid.",
        "**Days:** Friday 30 October and Monday 2 November 2026, according to Ouigo.",
      ],
    },
    minimumServices: {
      status: "published",
      msShort: {
        ca: "Serveis mínims del 71%: tots els trens d'Ouigo de Barcelona circulen",
        es: "Servicios mínimos del 71%: todos los trenes de Ouigo de Barcelona circulan",
        en: "71% minimum service: every Ouigo train to or from Barcelona runs",
      },
      text: {
        ca: `El Ministeri de Transports i Mobilitat Sostenible hi ha aprovat uns serveis mínims del **71%**: 55 de les 77 circulacions programades per a les dues jornades, segons ${link(U.ouigoStrike, "l'avís d'Ouigo")}. A la llista que publica Ouigo, **tots els trens amb origen o destinació a Barcelona circulen** tots dos dies (deu cada dia, entre els Barcelona-Madrid i els Barcelona-Sevilla); els cancel·lats són de les rutes de Madrid a Sevilla, València, Múrcia i Màlaga.`,
        es: `El Ministerio de Transportes y Movilidad Sostenible ha aprobado unos servicios mínimos del **71%**: 55 de las 77 circulaciones programadas para las dos jornadas, según ${link(U.ouigoStrike, "el aviso de Ouigo")}. En la lista que publica Ouigo, **todos los trenes con origen o destino en Barcelona circulan** los dos días (diez cada día, entre los Barcelona-Madrid y los Barcelona-Sevilla); los cancelados son de las rutas de Madrid a Sevilla, Valencia, Murcia y Málaga.`,
        en: `Spain's Ministry of Transport approved a **71%** minimum service: 55 of the 77 trains scheduled over the two days, according to ${link(U.ouigoStrike, "Ouigo's notice")}. On the list Ouigo publishes, **every train to or from Barcelona runs** on both days (ten a day, between Barcelona–Madrid and Barcelona–Seville); the cancelled trains are on routes from Madrid to Seville, Valencia, Murcia and Málaga.`,
      },
    },
    advice: {
      ca: ["Ouigo diu que ha avisat per correu electrònic els viatgers afectats, que poden canviar el bitllet sense cost o demanar-ne la devolució, segons el temps d'avís i les seves condicions generals."],
      es: ["Ouigo dice que ha avisado por correo electrónico a los viajeros afectados, que pueden cambiar el billete sin coste o pedir la devolución, según el tiempo de preaviso y sus condiciones generales."],
      en: ["Ouigo says it has emailed affected passengers, who can change their ticket free of charge or ask for a refund, depending on how much notice they were given and on its general conditions."],
    },
    sources: [{ name: "Trenes afectados por huelga de maquinistas", url: U.ouigoStrike, publisher: "OUIGO España" }],
  },
  {
    id: "vaga-general-2026-11-11",
    dates: ["2026-11-11"],
    scope: "general",
    title: {
      ca: "vaga general de 24 hores",
      es: "huelga general de 24 horas",
      en: "24-hour general strike",
    },
    short: {
      ca: "vaga general de 24 hores convocada per CCOO i UGT, entre altres organitzacions",
      es: "huelga general de 24 horas convocada por CCOO y UGT, entre otras organizaciones",
      en: "24-hour general strike called by CCOO and UGT, among other organisations",
    },
    label: { ca: "vaga general l'11 de novembre", es: "huelga general el 11 de noviembre", en: "general strike on 11 November" },
    facts: {
      ca: [
        "**Convocatòria:** CCOO i UGT, que la van presentar el 19 d'octubre de 2026 amb CGT, CNT, la Confederación Intersindical, CO.BAS, el Sindicato de Inquilinas i la Unión de Actores y Actrices. A Catalunya la convoquen CCOO de Catalunya, la UGT de Catalunya i CGT Catalunya, i el sindicat docent USTEC·STEs l'ha ratificada per a l'educació.",
        "**Registre:** CCOO va informar el 19 d'octubre de 2026 que la vaga ja estava registrada, i la UGT de Catalunya també n'ha anunciat el registre.",
        "**Horari:** 24 hores des de les 0 h de l'11 de novembre, segons CCOO de Catalunya. On es treballa per torns, comença amb el primer torn encara que comenci abans de mitjanit i acaba amb l'últim, encara que acabi després.",
        "**Qui hi està cridat:** totes les persones treballadores, del sector públic i del privat, en totes les activitats.",
        "**Reivindicacions:** habitatge assequible, salaris, preus i serveis públics, segons els sindicats convocants.",
        "**Manifestacions:** a les principals capitals de província, segons CCOO de Catalunya, que n'anunciarà l'hora i el lloc als seus canals.",
        `**Sector per sector:** els serveis mínims de cada servei, les escoles, la sanitat i els drets de qui fa vaga, a ${b2link("strike11n", "ca", "la guia de la vaga general de l'11 de novembre")}.`,
      ],
      es: [
        "**Convocatoria:** CCOO y UGT, que la presentaron el 19 de octubre de 2026 con CGT, CNT, la Confederación Intersindical, CO.BAS, el Sindicato de Inquilinas y la Unión de Actores y Actrices. En Cataluña la convocan CCOO de Catalunya, la UGT de Catalunya y CGT Catalunya, y el sindicato docente USTEC·STEs la ha ratificado para la educación.",
        "**Registro:** CCOO informó el 19 de octubre de 2026 de que la huelga ya estaba registrada, y la UGT de Catalunya también ha anunciado su registro.",
        "**Horario:** 24 horas desde las 0 h del 11 de noviembre, según CCOO de Catalunya. Donde se trabaja por turnos, empieza con el primer turno aunque comience antes de medianoche y acaba con el último, aunque termine después.",
        "**A quién llama:** a todas las personas trabajadoras, del sector público y del privado, en todas las actividades.",
        "**Reivindicaciones:** vivienda asequible, salarios, precios y servicios públicos, según los sindicatos convocantes.",
        "**Manifestaciones:** en las principales capitales de provincia, según CCOO de Catalunya, que anunciará la hora y el lugar en sus canales.",
        `**Sector por sector:** los servicios mínimos de cada servicio, los colegios, la sanidad y los derechos de quien hace huelga, en ${b2link("strike11n", "es", "la guía de la huelga general del 11 de noviembre")}.`,
      ],
      en: [
        "**Called by:** CCOO and UGT, who presented it on 19 October 2026 with CGT, CNT, Confederación Intersindical, CO.BAS, the Sindicato de Inquilinas tenants' union and the actors' union Unión de Actores y Actrices. In Catalonia it is called by CCOO de Catalunya, UGT de Catalunya and CGT Catalunya, and the teachers' union USTEC·STEs has ratified it for education.",
        "**Registration:** CCOO said on 19 October 2026 that the strike had been registered, and UGT de Catalunya has announced its registration too.",
        "**Hours:** 24 hours from 00:00 on 11 November, according to CCOO de Catalunya. Where people work shifts, it starts with the first shift even if that begins before midnight, and ends with the last one even if that ends after.",
        "**Who is called out:** all workers, public and private, in every activity.",
        "**Demands:** affordable housing, wages, prices and public services, according to the unions.",
        "**Demonstrations:** in the main provincial capitals, according to CCOO de Catalunya, which will announce times and places on its channels.",
        `**Sector by sector:** minimum services for each service, schools, health and strikers' rights, in ${b2link("strike11n", "en", "our guide to the 11 November general strike")}.`,
      ],
    },
    minimumServices: {
      status: "pending",
      msShort: {
        ca: "Serveis mínims encara no publicats",
        es: "Servicios mínimos aún no publicados",
        en: "Minimum services not published yet",
      },
      text: {
        ca: `**Encara no s'han publicat** (consultat el 27 d'octubre de 2026). Els dels serveis que depenen de la Generalitat (Rodalies i regionals, metro, autobusos, tramvia, FGC, escoles, sanitat pública i la mateixa Administració) els fixarà el Departament d'Empresa i Treball amb una ordre que es publica al ${link(U.dogc, "DOGC")}; els dels serveis de l'Estat, com els trens d'alta velocitat i de llarga distància, el Govern espanyol. A les vagues generals del 2024, l'ordre es va signar dos o tres dies abans de la vaga. Els afegirem aquí quan surtin.`,
        es: `**Aún no se han publicado** (consultado el 27 de octubre de 2026). Los de los servicios que dependen de la Generalitat (Rodalies y regionales, metro, autobuses, tranvía, FGC, escuelas, sanidad pública y la propia Administración) los fijará el Departament d'Empresa i Treball con una orden que se publica en el ${link(U.dogc, "DOGC")}; los de los servicios del Estado, como los trenes de alta velocidad y de larga distancia, el Gobierno de España. En las huelgas generales de 2024, la orden se firmó dos o tres días antes de la huelga. Los añadiremos aquí en cuanto salgan.`,
        en: `**Not published yet** (checked on 27 October 2026). For services that answer to the Generalitat (Rodalies and regional trains, metro, buses, tram, FGC, schools, public healthcare and the Catalan administration itself), the Department of Business and Labour will set them in an order published in the ${link(U.dogc, "DOGC")}, the Catalan official gazette; for State services such as high-speed and long-distance trains, the Spanish government sets them. In the 2024 general strikes the order was signed two or three days before the strike. We will add them here as soon as they are out.`,
      },
    },
    advice: {
      ca: [
        "Torna a aquesta pàgina els dies abans de l'11: quan el Departament d'Empresa i Treball publiqui l'ordre, hi posarem el que fixi per a Rodalies, el metro, els autobusos, FGC, les escoles i la sanitat. Els horaris de cada operador, als webs de la taula de més avall.",
        "Famílies: USTEC·STEs crida tot el personal educatiu a la vaga. L'escola us dirà què pot garantir aquell dia.",
      ],
      es: [
        "Vuelve a esta página los días antes del 11: cuando el Departament d'Empresa i Treball publique la orden, pondremos lo que fije para Rodalies, el metro, los autobuses, FGC, las escuelas y la sanidad. Los horarios de cada operador, en las webs de la tabla de más abajo.",
        "Familias: USTEC·STEs llama a todo el personal educativo a la huelga. La escuela os dirá qué puede garantizar ese día.",
      ],
      en: [
        "Come back in the days before the 11th: once the Department of Business and Labour publishes its order, we will add what it sets for Rodalies, the metro, buses, FGC, schools and healthcare. Each operator's timetables will be on the websites in the table below.",
        "Parents: USTEC·STEs is calling all education staff out. Your school will tell you what it can provide that day.",
      ],
    },
    sources: [
      { name: "Registro de la huelga general del 11N", url: U.ccooRegistered, publisher: "CCOO" },
      { name: "Convocamos huelga general para el 11 de noviembre", url: U.ccooCall, publisher: "CCOO" },
      { name: "Huelga general de 24 horas este 11 de noviembre", url: U.ugt, publisher: "UGT" },
      { name: "11N. Vaga general: preguntes freqüents", url: U.ccooCatalunya, publisher: "CCOO de Catalunya" },
      { name: "11N. Vaga general. Salaris, habitatge i preus", url: U.ugtCatalunya, publisher: "UGT de Catalunya" },
      { name: "L'11-N: vaga general per uns salaris dignes, un habitatge assequible i una vida millor", url: U.ugtCatalunyaCall, publisher: "UGT de Catalunya" },
      { name: "11N: CGT convoca Vaga General per l'habitatge i els salaris dignes", url: U.cgtCatalunya, publisher: "CGT Catalunya" },
      { name: "Ratifiquem la vaga general de l'11 de novembre", url: U.ustec, publisher: "USTEC·STEs" },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Date logic (deterministic: only STRIKES_AS_OF decides upcoming vs past)    */
/* -------------------------------------------------------------------------- */

export function lastDay(strike: Strike): string {
  return strike.dates[strike.dates.length - 1] ?? "";
}

/** Upcoming or under way on `asOf`; past from the day after its last day. */
export function isUpcoming(strike: Strike, asOf: string): boolean {
  return lastDay(strike) >= asOf;
}

export function upcomingStrikes(asOf: string, strikes: Strike[] = STRIKES): Strike[] {
  return strikes.filter((strike) => isUpcoming(strike, asOf)).sort((a, b) => (a.dates[0] ?? "").localeCompare(b.dates[0] ?? ""));
}

export function pastStrikes(asOf: string, strikes: Strike[] = STRIKES): Strike[] {
  return strikes.filter((strike) => !isUpcoming(strike, asOf)).sort((a, b) => lastDay(b).localeCompare(lastDay(a)));
}

/** The civil date in Catalonia for an instant. Used by the staleness test only. */
export function madridDate(instant: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(instant);
}

/**
 * Strikes the page would still call upcoming although their last day is
 * before `today`: the module was not brought up to date after them.
 */
export function staleStrikes(today: string, asOf: string = STRIKES_AS_OF, strikes: Strike[] = STRIKES): Strike[] {
  return upcomingStrikes(asOf, strikes).filter((strike) => lastDay(strike) < today);
}

const AND: Record<Locale, string> = { ca: " i ", es: " y ", en: " and " };

/** "dijous 29 d'octubre de 2026" / "divendres 30 d'octubre i dilluns 2 de novembre de 2026". */
export function strikeDays(strike: Strike, locale: Locale): string {
  const last = strike.dates.length - 1;
  return strike.dates.map((iso, index) => dayDate(iso, locale, index === last)).join(AND[locale]);
}

const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

const DESCRIPTION_LIMIT = 155;

const DESCRIPTION: Record<Locale, { prefix: string; base: string; fallback: string }> = {
  ca: {
    prefix: "Properes vagues: ",
    base: "Què funciona a Catalunya i on es publiquen els serveis mínims oficials.",
    fallback: "Què funciona a Catalunya els dies de vaga: Rodalies, metro, bus, escoles i salut, qui fixa els serveis mínims i on es publiquen.",
  },
  es: {
    prefix: "Próximas huelgas: ",
    base: "Qué funciona en Cataluña y dónde se publican los servicios mínimos oficiales.",
    fallback: "Qué funciona en Cataluña los días de huelga: Rodalies, metro, bus, escuelas y salud, quién fija los servicios mínimos y dónde se publican.",
  },
  en: {
    prefix: "Next strikes: ",
    base: "What runs in Barcelona and Catalonia, and where minimum services are published.",
    fallback: "What runs in Barcelona and Catalonia on strike days: Rodalies, metro, buses, schools and health, and where official minimum services are published.",
  },
};

/**
 * The meta description names the next strikes, general strikes first, as many
 * as fit in 155 characters, printed in date order. With none upcoming it falls
 * back to the evergreen line.
 */
export function strikesDescription(locale: Locale, asOf: string = STRIKES_AS_OF, strikes: Strike[] = STRIKES): string {
  const { prefix, base, fallback } = DESCRIPTION[locale];
  const ranked = [...upcomingStrikes(asOf, strikes)].sort(
    (a, b) => Number(b.scope === "general") - Number(a.scope === "general") || (a.dates[0] ?? "").localeCompare(b.dates[0] ?? ""),
  );
  const chosen: Strike[] = [];
  const compose = (picked: Strike[]) =>
    `${prefix}${[...picked].sort((a, b) => (a.dates[0] ?? "").localeCompare(b.dates[0] ?? "")).map((s) => s.label[locale]).join(", ")}. ${base}`;
  for (const strike of ranked) {
    if (compose([...chosen, strike]).length <= DESCRIPTION_LIMIT) chosen.push(strike);
  }
  return chosen.length > 0 ? compose(chosen) : fallback;
}

export const STRIKES_META: Record<Locale, { path: string; title: string; seoTitle: string; excerpt: string }> = {
  ca: {
    path: "guies/vaga-avui-catalunya",
    title: "Vaga avui a Catalunya: què funciona, serveis mínims i properes vagues",
    seoTitle: "Vaga avui a Catalunya: què funciona i serveis mínims",
    excerpt:
      "Les properes vagues que afecten Catalunya, què funciona cada dia i els serveis mínims oficials: qui els fixa, quan es publiquen i on consultar-los.",
  },
  es: {
    path: "guias/huelga-hoy-cataluna",
    title: "Huelga hoy en Cataluña: qué funciona, servicios mínimos y próximas huelgas",
    seoTitle: "Huelga hoy en Cataluña: qué funciona y servicios mínimos",
    excerpt:
      "Las próximas huelgas que afectan a Cataluña, qué funciona cada día y los servicios mínimos oficiales: quién los fija, cuándo se publican y dónde consultarlos.",
  },
  en: {
    path: "guides/strike-barcelona-catalonia-today",
    title: "Strike in Barcelona and Catalonia today: what runs, minimum services and the next strikes",
    seoTitle: "Strike in Barcelona and Catalonia today: what runs",
    excerpt:
      "The next strikes affecting Barcelona and Catalonia, what runs on each day and the official minimum services: who sets them, when they come out and where to check.",
  },
};

/* -------------------------------------------------------------------------- */
/* Copy                                                                       */
/* -------------------------------------------------------------------------- */

type Copy = {
  leadUpcoming: (items: string, date: string) => string;
  leadNone: (date: string) => string;
  pending: (days: string) => string;
  keyFactsTitle: string;
  dataTitle: string;
  data: string;
  msHeading: (days: string) => string;
  adviceHeading: (days: string) => string;
  pastHeading: string;
  pastIntro: string;
  msLabel: string;
  howHeading: string;
  how: string[];
  whenHeading: string;
  when: string;
  refHeading: string;
  ref: string;
  refWarningTitle: string;
  refWarning: string;
  whereHeading: string;
  tableCaption: string;
  tableHeaders: string[];
  tableRows: string[][];
  tableNote: string;
  travelHeading: string;
  travel: string[];
  familiesHeading: string;
  families: string[];
  faqToday: (items: string, date: string) => string;
  faqTodayNone: (date: string) => string;
  faqTodayQ: string;
  faqMsQ: (days: string) => string;
  faqStatic: { question: string; answer: string }[];
};

const COPY: Record<Locale, Copy> = {
  ca: {
    leadUpcoming: (items, date) => `**Properes vagues que afecten Catalunya, segons les fonts oficials consultades el ${date}:** ${items}.`,
    leadNone: (date) => `**No hi ha cap vaga anunciada que afecti Catalunya a les fonts oficials consultades el ${date}.** Quan se'n convoqui una, l'afegirem aquí amb els serveis mínims oficials.`,
    pending: (days) => `Els serveis mínims del ${days} encara no s'han publicat: es fixen per ordre o resolució pocs dies abans.`,
    keyFactsTitle: "Properes vagues, d'un cop d'ull",
    dataTitle: verifiedLine("ca", STRIKES_VERIFIED),
    data: "Només hi posem el que publiquen els sindicats convocants, els operadors i el DOGC o el BOE, i no el que avança la premsa. Cada vaga té la seva secció, amb data, i quan passa queda a la llista de vagues anteriors.",
    msHeading: (days) => `Serveis mínims del ${days}`,
    adviceHeading: (days) => `Què cal fer el ${days}`,
    pastHeading: "Vagues anteriors",
    pastIntro: "El que s'havia anunciat i publicat abans de cada vaga, tal com era a les fonts oficials.",
    msLabel: "Serveis mínims",
    howHeading: "Com funcionen els serveis mínims a Catalunya",
    how: [
      `El dret de vaga el reconeix ${link(U.constitution, "l'article 28.2 de la Constitució")}, que també demana que la llei garanteixi «el mantenimiento de los servicios esenciales de la comunidad». El ${link(U.rdl17, "Reial decret llei 17/1977")} hi afegeix dues regles: una vaga s'ha de comunicar a l'empresa i a l'autoritat laboral amb cinc dies naturals d'antelació, o deu si afecta serveis públics (articles 3 i 4), i l'autoritat governativa pot acordar les mesures necessàries per assegurar el funcionament dels serveis (article 10.2). Per això una vaga que afecta serveis públics, com el transport, s'anuncia com a mínim deu dies abans.`,
      `A Catalunya, d'acord amb el ${link(U.decret120, "Decret 120/1995")}, els fixa la persona titular del Departament d'Empresa i Treball, tant en les vagues d'empreses i entitats que presten serveis essencials de competència de la Generalitat com en les del personal de la mateixa Generalitat, tal com recullen les ordres de serveis mínims publicades al DOGC. Ho fa amb una ordre per a cada vaga que fixa, servei per servei, un percentatge o una plantilla mínima: transport de viatgers, urgències i hospitals, centres de salut, escoles, farmàcies de guàrdia, aigua, llum i gas, o la mateixa Administració.`,
      "Els serveis de l'Estat, com els trens d'alta velocitat i de llarga distància, tenen els serveis mínims que fixa el Govern espanyol: per a la vaga d'Ouigo de la tardor del 2026, el Ministeri de Transports. Pel que fa als aeroports, les ordres de la Generalitat només fixen l'operativa dels que gestiona ella, Lleida-Alguaire i Andorra-la Seu d'Urgell: per als vols del Prat, Girona i Reus, que són d'Aena, el que compta és el que publiquin Aena i la companyia aèria.",
      `Un cop publicada l'ordre, cada empresa, després d'escoltar el comitè de vaga, designa les persones que han de cobrir els serveis mínims, preferentment entre les que no fan vaga, i els ho ha de comunicar de manera formal (article 2 de l'${link(U.emt201, "Ordre EMT/201/2024")}). Els serveis de seguretat i manteniment de les instal·lacions no són serveis mínims: els fixa cada empresa després d'escoltar la representació dels treballadors.`,
    ],
    whenHeading: "Quan es publiquen",
    when: `Molt a prop de la vaga. Per a la vaga general del 8 de març de 2024, l'${link(U.emt38, "Ordre EMT/38/2024")} es va signar el 5 de març i el DOGC la va publicar el 6; per a la del 27 de setembre de 2024, l'Ordre EMT/201/2024 es va signar el 25 i el DOGC la va publicar el mateix dia 27. Després, cada operador publica els seus horaris: per a la vaga de Renfe del 29 d'octubre de 2026, l'avís de Rodalies amb els percentatges ja era actualitzat el dia 26.`,
    refHeading: "Què va fixar l'ordre d'una vaga general anterior (només com a referència)",
    ref: "Per a la vaga general del 27 de setembre de 2024, l'Ordre EMT/201/2024 va fixar el **85% del servei** a Rodalies i regionals, al metro, als autobusos de TMB, a FGC, al tramvia i a la resta del transport urbà i interurbà, inclòs l'autobús entre Barcelona i l'aeroport. A les escoles, una persona de l'equip directiu per centre i, a més, dos docents per cada quatre grups a infantil i primària, un per cada tres a secundària i el 50% de la plantilla a l'educació especial i a les llars d'infants. Als hospitals, el funcionament normal de les urgències i de les unitats especials (cures intensives, diàlisi, parts, radioteràpia i quimioteràpia); als centres d'atenció fora de l'hospital, l'atenció urgent en el seu horari habitual, i les farmàcies de guàrdia, obertes.",
    refWarningTitle: "No és una previsió per a l'11 de novembre",
    refWarning: "Aquella ordre justificava els percentatges, entre altres raons, perquè la vaga no l'havien convocada «altres associacions sindicals que disposen de més àmplia representativitat en el teixit laboral català». La de l'11 de novembre la convoquen CCOO i UGT, i l'ordre pot fixar percentatges diferents.",
    whereHeading: "On es publiquen els serveis mínims de cada servei",
    tableCaption: "Qui fixa els serveis mínims i on es consulten",
    tableHeaders: ["Servei", "Qui els fixa", "On es consulten"],
    tableRows: [
      ["Rodalies i regionals", "Generalitat (Departament d'Empresa i Treball)", `${link(U.rodaliesStatus, "rodalies.gencat.cat")}, amb l'horari de cada línia`],
      ["Alta velocitat i llarga distància (Renfe, Ouigo)", "Govern espanyol", `${link(U.renfe, "renfe.com")} i ${link(U.ouigo, "ouigo.com")}`],
      ["Metro i autobusos de TMB", "Generalitat", `${link(U.tmb, "tmb.cat")}, avisos de servei`],
      ["FGC", "Generalitat", link(U.fgc, "fgc.cat")],
      ["Vols del Prat, Girona i Reus", "L'operativa d'Aena no és a les ordres de la Generalitat", `${link(U.aena, "Infovuelos d'Aena")} i la teva companyia aèria`],
      ["Escoles i llars d'infants", "Generalitat", "L'escola informa les famílies"],
      ["Hospitals, centres de salut i farmàcies de guàrdia", "Generalitat", "El teu centre de salut o hospital"],
      ["L'ordre sencera", "Departament d'Empresa i Treball", link(U.dogc, "DOGC")],
    ],
    tableNote: "Comprovat el 27 d'octubre de 2026. Les ordres de la Generalitat també cobreixen el tramvia i la resta d'autobusos urbans i interurbans.",
    travelHeading: "Què fer si has de viatjar un dia de vaga",
    travel: [
      "**Mira l'operador el vespre abans i el mateix matí.** Les ordres permeten repartir el percentatge de manera desigual al llarg del dia, així que no tots els trens o autobusos de la teva hora hi seran.",
      "**Evita l'hora punta si pots** i compta amb trens i andanes més plens que de costum.",
      "**No totes les vagues ho aturen tot.** Una vaga de maquinistes de Renfe no afecta el metro ni FGC; una vaga general pot afectar-ho tot alhora.",
      "**Si et cancel·len el tren o el vol**, el canvi o la devolució depèn de l'operador: segueix el que publiqui al seu web o t'enviï per correu.",
      `**Per anar a l'aeroport**, mira l'estat del vol a la teva companyia o a Infovuelos d'Aena, i les alternatives per arribar-hi a ${b2link("airport", "ca", "la guia de l'aeroport al centre de Barcelona")}.`,
      `**Si vas amb Rodalies**, mira [els avisos de la teva línia avui](${rodaliesHub("ca")}), llegits en directe de Rodalies de Catalunya.`,
      `**Els dies normals**, ${b2link("hours", "ca", "l'horari del metro i del NitBus")} i ${b2link("transport", "ca", "quina targeta de transport et convé")}.`,
    ],
    familiesHeading: "Què han de saber les famílies",
    families: [
      "Quan la vaga inclou l'ensenyament, com la de l'11 de novembre, les escoles no tanquen: l'ordre de serveis mínims hi fixa un mínim de personal, i és l'escola qui explica a les famílies què pot garantir aquell dia. En paraules de l'ordre del 2024, els serveis mínims garanteixen «un servei de vigilància i atenció» per als alumnes que hi vagin.",
      "El menjador i el transport escolar també hi tenen serveis mínims: el 2024, el 50% del personal de menjador i activitats complementàries, i el transport escolar mantingut cap a les escoles d'infantil i primària sense transport públic alternatiu.",
    ],
    faqTodayQ: "Hi ha vaga avui a Catalunya?",
    faqToday: (items, date) => `Aquesta pàgina es va actualitzar el ${date}. Les properes vagues anunciades que afecten Catalunya són: ${items}.`,
    faqTodayNone: (date) => `Aquesta pàgina es va actualitzar el ${date} i en aquell moment no hi havia cap vaga anunciada que afectés Catalunya a les fonts oficials que seguim.`,
    faqMsQ: (days) => `Quins serveis mínims hi ha el ${days}?`,
    faqStatic: [
      { question: "Qui fixa els serveis mínims a Catalunya?", answer: "El Departament d'Empresa i Treball de la Generalitat, per ordre publicada al DOGC, en els serveis de competència de la Generalitat: Rodalies, metro, autobusos, FGC, escoles, sanitat pública i la mateixa Administració. Els serveis de l'Estat, com l'alta velocitat i la llarga distància, els fixa el Govern espanyol." },
      { question: "Quan es publiquen els serveis mínims?", answer: "Pocs dies abans de la vaga. A les vagues generals del 2024, l'ordre es va signar dos o tres dies abans i el DOGC la va publicar entre dos dies abans i el mateix dia de la vaga." },
      { question: "Funciona el metro els dies de vaga?", answer: "Si la vaga afecta TMB, el metro funciona amb els serveis mínims que fixi la Generalitat; a la vaga general del 27 de setembre de 2024 van ser el 85% del servei. Una vaga només de Renfe no atura el metro." },
      { question: "Obren les escoles els dies de vaga general?", answer: "Sí. L'ordre de serveis mínims hi fixa un mínim de personal per centre, i és l'escola qui informa les famílies del que pot garantir." },
    ],
  },
  es: {
    leadUpcoming: (items, date) => `**Próximas huelgas que afectan a Cataluña, según las fuentes oficiales consultadas el ${date}:** ${items}.`,
    leadNone: (date) => `**No hay ninguna huelga anunciada que afecte a Cataluña en las fuentes oficiales consultadas el ${date}.** Cuando se convoque una, la añadiremos aquí con los servicios mínimos oficiales.`,
    pending: (days) => `Los servicios mínimos del ${days} aún no se han publicado: se fijan por orden o resolución pocos días antes.`,
    keyFactsTitle: "Próximas huelgas, de un vistazo",
    dataTitle: verifiedLine("es", STRIKES_VERIFIED),
    data: "Solo ponemos lo que publican los sindicatos convocantes, los operadores y el DOGC o el BOE, no lo que adelanta la prensa. Cada huelga tiene su sección, con fecha, y cuando pasa queda en la lista de huelgas anteriores.",
    msHeading: (days) => `Servicios mínimos del ${days}`,
    adviceHeading: (days) => `Qué hacer el ${days}`,
    pastHeading: "Huelgas anteriores",
    pastIntro: "Lo que se había anunciado y publicado antes de cada huelga, tal como estaba en las fuentes oficiales.",
    msLabel: "Servicios mínimos",
    howHeading: "Cómo funcionan los servicios mínimos en Cataluña",
    how: [
      `El derecho de huelga lo reconoce ${link(U.constitution, "el artículo 28.2 de la Constitución")}, que también pide que la ley garantice «el mantenimiento de los servicios esenciales de la comunidad». El ${link(U.rdl17, "Real Decreto-ley 17/1977")} añade dos reglas: una huelga debe comunicarse a la empresa y a la autoridad laboral con cinco días naturales de antelación, o diez si afecta a servicios públicos (artículos 3 y 4), y la autoridad gubernativa puede acordar las medidas necesarias para asegurar el funcionamiento de los servicios (artículo 10.2). Por eso una huelga que afecta a servicios públicos, como el transporte, se anuncia como mínimo diez días antes.`,
      `En Cataluña, de acuerdo con el ${link(U.decret120, "Decret 120/1995")}, los fija la persona titular del Departament d'Empresa i Treball, tanto en las huelgas de empresas y entidades que prestan servicios esenciales de competencia de la Generalitat como en las del personal de la propia Generalitat, tal como recogen las órdenes de servicios mínimos publicadas en el DOGC. Lo hace con una orden para cada huelga que fija, servicio por servicio, un porcentaje o una plantilla mínima: transporte de viajeros, urgencias y hospitales, centros de salud, escuelas, farmacias de guardia, agua, luz y gas, o la propia Administración.`,
      "Los servicios del Estado, como los trenes de alta velocidad y de larga distancia, tienen los servicios mínimos que fija el Gobierno de España: para la huelga de Ouigo del otoño de 2026, el Ministerio de Transportes. En cuanto a los aeropuertos, las órdenes de la Generalitat solo fijan la operativa de los que gestiona ella, Lleida-Alguaire y Andorra-La Seu d'Urgell: para los vuelos de El Prat, Girona y Reus, que son de Aena, lo que cuenta es lo que publiquen Aena y la compañía aérea.",
      `Una vez publicada la orden, cada empresa, tras escuchar al comité de huelga, designa a las personas que deben cubrir los servicios mínimos, preferentemente entre las que no hacen huelga, y se lo tiene que comunicar de forma formal (artículo 2 de la ${link(U.emt201, "Ordre EMT/201/2024")}). Los servicios de seguridad y mantenimiento de las instalaciones no son servicios mínimos: los fija cada empresa tras escuchar a la representación de los trabajadores.`,
    ],
    whenHeading: "Cuándo se publican",
    when: `Muy cerca de la huelga. Para la huelga general del 8 de marzo de 2024, la ${link(U.emt38, "Ordre EMT/38/2024")} se firmó el 5 de marzo y el DOGC la publicó el 6; para la del 27 de septiembre de 2024, la Ordre EMT/201/2024 se firmó el 25 y el DOGC la publicó el mismo día 27. Después, cada operador publica sus horarios: para la huelga de Renfe del 29 de octubre de 2026, el aviso de Rodalies con los porcentajes ya estaba actualizado el día 26.`,
    refHeading: "Qué fijó la orden de una huelga general anterior (solo como referencia)",
    ref: "Para la huelga general del 27 de septiembre de 2024, la Ordre EMT/201/2024 fijó el **85% del servicio** en Rodalies y regionales, el metro, los autobuses de TMB, FGC, el tranvía y el resto del transporte urbano e interurbano, incluido el autobús entre Barcelona y el aeropuerto. En las escuelas, una persona del equipo directivo por centro y, además, dos docentes por cada cuatro grupos en infantil y primaria, uno por cada tres en secundaria y el 50% de la plantilla en educación especial y en las guarderías. En los hospitales, el funcionamiento normal de las urgencias y de las unidades especiales (cuidados intensivos, diálisis, partos, radioterapia y quimioterapia); en los centros de atención fuera del hospital, la atención urgente en su horario habitual, y las farmacias de guardia, abiertas.",
    refWarningTitle: "No es una previsión para el 11 de noviembre",
    refWarning: "Aquella orden justificaba los porcentajes, entre otras razones, porque la huelga no la habían convocado «altres associacions sindicals que disposen de més àmplia representativitat en el teixit laboral català». La del 11 de noviembre la convocan CCOO y UGT, y la orden puede fijar porcentajes distintos.",
    whereHeading: "Dónde se publican los servicios mínimos de cada servicio",
    tableCaption: "Quién fija los servicios mínimos y dónde se consultan",
    tableHeaders: ["Servicio", "Quién los fija", "Dónde se consultan"],
    tableRows: [
      ["Rodalies y regionales", "Generalitat (Departament d'Empresa i Treball)", `${link(U.rodaliesStatus, "rodalies.gencat.cat")}, con el horario de cada línea`],
      ["Alta velocidad y larga distancia (Renfe, Ouigo)", "Gobierno de España", `${link(U.renfe, "renfe.com")} y ${link(U.ouigo, "ouigo.com")}`],
      ["Metro y autobuses de TMB", "Generalitat", `${link(U.tmb, "tmb.cat")}, avisos de servicio`],
      ["FGC", "Generalitat", link(U.fgc, "fgc.cat")],
      ["Vuelos de El Prat, Girona y Reus", "La operativa de Aena no está en las órdenes de la Generalitat", `${link(U.aena, "Infovuelos de Aena")} y tu compañía aérea`],
      ["Escuelas y guarderías", "Generalitat", "La escuela informa a las familias"],
      ["Hospitales, centros de salud y farmacias de guardia", "Generalitat", "Tu centro de salud u hospital"],
      ["La orden completa", "Departament d'Empresa i Treball", link(U.dogc, "DOGC")],
    ],
    tableNote: "Comprobado el 27 de octubre de 2026. Las órdenes de la Generalitat también cubren el tranvía y el resto de autobuses urbanos e interurbanos.",
    travelHeading: "Qué hacer si tienes que viajar un día de huelga",
    travel: [
      "**Mira el operador la noche antes y la misma mañana.** Las órdenes permiten repartir el porcentaje de forma desigual a lo largo del día, así que no todos los trenes o autobuses de tu hora estarán.",
      "**Evita la hora punta si puedes** y cuenta con trenes y andenes más llenos de lo habitual.",
      "**No todas las huelgas lo paran todo.** Una huelga de maquinistas de Renfe no afecta al metro ni a FGC; una huelga general puede afectar a todo a la vez.",
      "**Si te cancelan el tren o el vuelo**, el cambio o la devolución depende del operador: sigue lo que publique en su web o te envíe por correo.",
      `**Para ir al aeropuerto**, mira el estado del vuelo en tu compañía o en Infovuelos de Aena, y las alternativas para llegar en ${b2link("airport", "es", "la guía del aeropuerto al centro de Barcelona")}.`,
      `**Si vas en Rodalies**, mira [los avisos de tu línea hoy](${rodaliesHub("es")}), leídos en directo de Rodalies de Catalunya.`,
      `**Los días normales**, ${b2link("hours", "es", "el horario del metro y del NitBus")} y ${b2link("transport", "es", "qué tarjeta de transporte te conviene")}.`,
    ],
    familiesHeading: "Qué deben saber las familias",
    families: [
      "Cuando la huelga incluye la enseñanza, como la del 11 de noviembre, las escuelas no cierran: la orden de servicios mínimos fija un mínimo de personal, y es la escuela quien explica a las familias qué puede garantizar ese día. En palabras de la orden de 2024, los servicios mínimos garantizan «un servei de vigilància i atenció» para los alumnos que asistan.",
      "El comedor y el transporte escolar también tienen servicios mínimos: en 2024, el 50% del personal de comedor y actividades complementarias, y el transporte escolar mantenido hacia las escuelas de infantil y primaria sin transporte público alternativo.",
    ],
    faqTodayQ: "¿Hay huelga hoy en Cataluña?",
    faqToday: (items, date) => `Esta página se actualizó el ${date}. Las próximas huelgas anunciadas que afectan a Cataluña son: ${items}.`,
    faqTodayNone: (date) => `Esta página se actualizó el ${date} y en ese momento no había ninguna huelga anunciada que afectara a Cataluña en las fuentes oficiales que seguimos.`,
    faqMsQ: (days) => `¿Qué servicios mínimos hay el ${days}?`,
    faqStatic: [
      { question: "¿Quién fija los servicios mínimos en Cataluña?", answer: "El Departament d'Empresa i Treball de la Generalitat, por orden publicada en el DOGC, en los servicios de competencia de la Generalitat: Rodalies, metro, autobuses, FGC, escuelas, sanidad pública y la propia Administración. Los servicios del Estado, como la alta velocidad y la larga distancia, los fija el Gobierno de España." },
      { question: "¿Cuándo se publican los servicios mínimos?", answer: "Pocos días antes de la huelga. En las huelgas generales de 2024, la orden se firmó dos o tres días antes y el DOGC la publicó entre dos días antes y el mismo día de la huelga." },
      { question: "¿Funciona el metro los días de huelga?", answer: "Si la huelga afecta a TMB, el metro funciona con los servicios mínimos que fije la Generalitat; en la huelga general del 27 de septiembre de 2024 fueron el 85% del servicio. Una huelga solo de Renfe no para el metro." },
      { question: "¿Abren los colegios los días de huelga general?", answer: "Sí. La orden de servicios mínimos fija un mínimo de personal por centro, y es la escuela quien informa a las familias de lo que puede garantizar." },
    ],
  },
  en: {
    leadUpcoming: (items, date) => `**The next strikes affecting Barcelona and Catalonia, from the official sources checked on ${date}:** ${items}.`,
    leadNone: (date) => `**No strike affecting Catalonia had been announced in the official sources checked on ${date}.** When one is called, we will add it here with the official minimum services.`,
    pending: (days) => `Minimum services for ${days} have not been published yet: they are set by an order or resolution a few days before.`,
    keyFactsTitle: "The next strikes at a glance",
    dataTitle: verifiedLine("en", STRIKES_VERIFIED),
    data: "We only print what the unions calling a strike, the operators and the official gazettes (DOGC, BOE) publish, never what the press reports ahead of them. Each strike has its own dated section, which moves to the list of past strikes once it is over.",
    msHeading: (days) => `Minimum services on ${days}`,
    adviceHeading: (days) => `What to do on ${days}`,
    pastHeading: "Past strikes",
    pastIntro: "What had been announced and published before each strike, as it stood in the official sources.",
    msLabel: "Minimum services",
    howHeading: "How minimum services work in Catalonia",
    how: [
      `The right to strike is recognised by ${link(U.constitution, "Article 28.2 of the Spanish Constitution")}, which also requires the law to guarantee "el mantenimiento de los servicios esenciales de la comunidad" (that the community's essential services keep running). ${link(U.rdl17, "Royal Decree-Law 17/1977")} adds two rules: a strike must be notified to the employer and the labour authority five calendar days ahead, or ten if it affects public services (Articles 3 and 4), and the government authority may take the measures needed to keep services running (Article 10.2). That is why a strike affecting public services, such as transport, is announced at least ten days in advance.`,
      `In Catalonia, under ${link(U.decret120, "Decree 120/1995")}, they are set by the head of the Generalitat's Department of Business and Labour (Departament d'Empresa i Treball), both for strikes at companies that provide essential services within the Generalitat's powers and for strikes by the Generalitat's own staff, as the minimum-services orders published in the DOGC state. The department issues one order per strike, setting a percentage or a minimum headcount service by service: public transport, A&E and hospitals, health centres, schools, duty pharmacies, water, electricity and gas, and the administration itself.`,
      "State services such as high-speed and long-distance trains get their minimum services from the Spanish government: for Ouigo's strike in autumn 2026, the Ministry of Transport. As for airports, the Generalitat's orders only set the operations of the two it runs itself, Lleida-Alguaire and Andorra-La Seu d'Urgell: for flights at Barcelona-El Prat, Girona and Reus, which Aena runs, what counts is what Aena and your airline publish.",
      `Once the order is out, each employer, after hearing the strike committee, names the staff who must cover the minimum services, preferably people who are not striking, and must notify them formally (Article 2 of ${link(U.emt201, "Order EMT/201/2024")}). Safety and maintenance cover for premises and equipment is not a minimum service: each employer sets it after hearing the workers' representatives.`,
    ],
    whenHeading: "When they are published",
    when: `Very close to the strike. For the general strike of 8 March 2024, ${link(U.emt38, "Order EMT/38/2024")} was signed on 5 March and published in the DOGC on the 6th; for the one on 27 September 2024, Order EMT/201/2024 was signed on the 25th and published in the DOGC on the day itself, the 27th. Each operator then publishes its timetables: for the Renfe strike of 29 October 2026, Rodalies' notice with the percentages had already been updated on the 26th.`,
    refHeading: "What an earlier general strike's order set (for reference only)",
    ref: "For the general strike of 27 September 2024, Order EMT/201/2024 set **85% of normal service** on Rodalies and regional trains, the metro, TMB buses, FGC, the tram and all other urban and interurban transport, including the bus between Barcelona and the airport. In schools, one member of the management team per school plus two teachers for every four classes in nursery and primary, one for every three in secondary, and 50% of staff in special education and nurseries. In hospitals, A&E and the special units (intensive care, dialysis, maternity, radiotherapy and chemotherapy) ran normally; health centres outside hospitals kept urgent care during their usual hours, and duty pharmacies stayed open.",
    refWarningTitle: "This is not a forecast for 11 November",
    refWarning: "That order justified its percentages partly because the strike had not been called by \"altres associacions sindicals que disposen de més àmplia representativitat en el teixit laboral català\" (other unions with wider representation among Catalan workers). The 11 November strike is called by CCOO and UGT, so the order may set different percentages.",
    whereHeading: "Where each service publishes its minimum services",
    tableCaption: "Who sets minimum services and where to check them",
    tableHeaders: ["Service", "Who sets them", "Where to check"],
    tableRows: [
      ["Rodalies and regional trains", "Generalitat (Department of Business and Labour)", `${link(U.rodaliesStatus, "rodalies.gencat.cat")}, with a timetable for each line`],
      ["High-speed and long-distance (Renfe, Ouigo)", "Spanish government", `${link(U.renfe, "renfe.com")} and ${link(U.ouigo, "ouigo.com")}`],
      ["TMB metro and buses", "Generalitat", `${link(U.tmb, "tmb.cat")}, service notices`],
      ["FGC", "Generalitat", link(U.fgc, "fgc.cat")],
      ["Flights at Barcelona-El Prat, Girona and Reus", "Aena's operations are not in the Generalitat's orders", `${link(U.aena, "Aena's Infovuelos")} and your airline`],
      ["Schools and nurseries", "Generalitat", "Your school tells families"],
      ["Hospitals, health centres and duty pharmacies", "Generalitat", "Your health centre or hospital"],
      ["The full order", "Department of Business and Labour", link(U.dogc, "DOGC")],
    ],
    tableNote: "Checked on 27 October 2026. The Generalitat's orders also cover the tram and all other urban and interurban buses.",
    travelHeading: "What to do if you have to travel on a strike day",
    travel: [
      "**Check the operator the evening before and that morning.** The orders let operators spread the percentage unevenly over the day, so not every train or bus at your usual time will run.",
      "**Avoid the peak if you can**, and expect fuller trains and platforms than usual.",
      "**Not every strike stops everything.** A Renfe drivers' strike does not touch the metro or FGC; a general strike can affect all of them at once.",
      "**If your train or flight is cancelled**, changes and refunds depend on the operator: follow what it publishes on its website or emails you.",
      `**Going to the airport?** Check your flight with your airline or on Aena's Infovuelos, and the ways to get there in ${b2link("airport", "en", "our airport to city centre guide")}.`,
      `**Travelling on Rodalies?** Check [today's notices for your line](${rodaliesHub("en")}), read live from Rodalies de Catalunya.`,
      `**On normal days**, see ${b2link("hours", "en", "Barcelona metro and night bus hours")} and ${b2link("transport", "en", "which transport pass to buy")}.`,
    ],
    familiesHeading: "What parents need to know",
    families: [
      "When a strike includes education, as the one on 11 November does, schools do not close: the minimum-services order sets a minimum number of staff, and your school tells families what it can provide that day. In the words of the 2024 order, minimum services guarantee \"un servei de vigilància i atenció\" (supervision and care) for the pupils who attend.",
      "School meals and school buses also get minimum services: in 2024, 50% of lunchtime and after-school staff, and school transport kept running to nursery and primary schools with no public transport alternative.",
    ],
    faqTodayQ: "Is there a strike in Barcelona or Catalonia today?",
    faqToday: (items, date) => `This page was last updated on ${date}. The next strikes announced that affect Catalonia are: ${items}.`,
    faqTodayNone: (date) => `This page was last updated on ${date}, when no strike affecting Catalonia had been announced in the official sources we follow.`,
    faqMsQ: (days) => `What minimum services are there on ${days}?`,
    faqStatic: [
      { question: "Who sets minimum services in Catalonia?", answer: "The Generalitat's Department of Business and Labour, by an order published in the DOGC, for services within the Generalitat's powers: Rodalies, metro, buses, FGC, schools, public healthcare and the Catalan administration. State services such as high-speed and long-distance trains get theirs from the Spanish government." },
      { question: "When are minimum services published?", answer: "A few days before the strike. In the 2024 general strikes the order was signed two or three days before, and the DOGC published it between two days before and the day of the strike itself." },
      { question: "Does the Barcelona metro run during a strike?", answer: "If the strike covers TMB, the metro runs the minimum service the Generalitat sets; in the general strike of 27 September 2024 that was 85% of normal service. A Renfe-only strike does not stop the metro." },
      { question: "Are schools open during a general strike?", answer: "Yes. The minimum-services order sets a minimum number of staff per school, and the school tells families what it can provide." },
    ],
  },
};

/* -------------------------------------------------------------------------- */
/* Body                                                                       */
/* -------------------------------------------------------------------------- */

const RELATED = ["hours", "transport", "airport", "holidayToday", "shops"] as const;

const strip = (text: string) => text.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

function heading(level: 2 | 3, text: string, id?: string): Block {
  return { type: "heading", level, text, ...(id ? { id } : {}) } as Block;
}

export function buildStrikesBody(locale: Locale, asOf: string = STRIKES_AS_OF, strikes: Strike[] = STRIKES): Block[] {
  const t = COPY[locale];
  const upcoming = upcomingStrikes(asOf, strikes);
  const past = pastStrikes(asOf, strikes);
  const checked = dateYear(asOf, locale);
  const items = upcoming.map((strike) => `${strikeDays(strike, locale)}, ${strike.short[locale]}`).join("; ");
  const pending = upcoming.filter((strike) => strike.minimumServices.status === "pending");

  const blocks: Block[] = [];

  if (upcoming.length > 0) {
    blocks.push(lead(`${t.leadUpcoming(items, checked)} ${pending.map((strike) => t.pending(strikeDays(strike, locale))).join(" ")}`.trim()));
    blocks.push(
      keyFacts(
        t.keyFactsTitle,
        upcoming.map((strike) => ({
          label: cap(strikeDays(strike, locale)),
          value: `${cap(strike.short[locale])}. ${strike.minimumServices.msShort[locale]}.`,
        })),
      ),
    );
  } else {
    blocks.push(lead(t.leadNone(checked)));
  }

  blocks.push(callout("official", t.dataTitle, t.data));

  for (const strike of upcoming) {
    const days = strikeDays(strike, locale);
    blocks.push(heading(2, `${cap(days)}: ${strike.title[locale]}`, strike.id));
    blocks.push(list(...strike.facts[locale]));
    blocks.push(...h3(t.msHeading(days), strike.minimumServices.text[locale]));
    if (strike.advice[locale].length > 0) {
      blocks.push(heading(3, t.adviceHeading(days)));
      blocks.push(list(...strike.advice[locale]));
    }
  }

  if (past.length > 0) {
    blocks.push(...h2(t.pastHeading, t.pastIntro));
    for (const strike of past) {
      const days = strikeDays(strike, locale);
      blocks.push(heading(3, `${cap(days)}: ${strike.title[locale]}`, strike.id));
      blocks.push(list(...strike.facts[locale], `**${t.msLabel}:** ${strike.minimumServices.text[locale]}`));
    }
  }

  blocks.push(...h2(t.howHeading, ...t.how));
  blocks.push(...h3(t.whenHeading, t.when));
  blocks.push(...h2(t.refHeading, t.ref));
  blocks.push(callout("warning", t.refWarningTitle, t.refWarning));
  blocks.push(...h2(t.whereHeading));
  blocks.push(table(t.tableCaption, t.tableHeaders, t.tableRows, t.tableNote));
  blocks.push(...h2(t.travelHeading));
  blocks.push(list(...t.travel));
  blocks.push(...h2(t.familiesHeading, ...t.families));

  const faqItems = [
    upcoming.length > 0
      ? { question: t.faqTodayQ, answer: strip(t.faqToday(items, checked)) }
      : { question: t.faqTodayQ, answer: strip(t.faqTodayNone(checked)) },
    ...upcoming.map((strike) => ({
      question: t.faqMsQ(strikeDays(strike, locale)),
      answer: strip(strike.minimumServices.text[locale]),
    })),
    ...t.faqStatic,
  ];
  blocks.push(faq(faqItems));
  blocks.push(...paras(verifiedLine(locale, STRIKES_VERIFIED)));
  blocks.push(...b2Related([...RELATED], locale));
  return blocks;
}

/* -------------------------------------------------------------------------- */
/* Article                                                                    */
/* -------------------------------------------------------------------------- */

const FRAMEWORK_SOURCES: B2Source[] = [
  { name: "Constitución Española, artículo 28.2", url: U.constitution, publisher: "BOE" },
  { name: "Real Decreto-ley 17/1977, de 4 de marzo, sobre relaciones de trabajo (artículos 3, 4 y 10)", url: U.rdl17, publisher: "BOE" },
  { name: "Ordre EMT/201/2024, de 25 de setembre (serveis essencials, vaga general del 27 de setembre de 2024)", url: U.emt201, publisher: "DOGC" },
  { name: "Ordre EMT/38/2024, de 5 de març (serveis essencials, vaga general del 8 de març de 2024)", url: U.emt38, publisher: "DOGC" },
  { name: "Decret 120/1995, de 24 de març", url: U.decret120, publisher: "DOGC" },
  { name: "Avisos de servei", url: U.tmb, publisher: "TMB" },
  { name: "Alteracions del servei", url: U.rodaliesStatus, publisher: "Rodalies de Catalunya" },
  { name: "Ferrocarrils de la Generalitat de Catalunya", url: U.fgc, publisher: "FGC" },
  { name: "Infovuelos", url: U.aena, publisher: "Aena" },
];

/** Every source the page cites: the framework plus each listed strike's, once. */
export function strikesSources(strikes: Strike[] = STRIKES): B2Source[] {
  const seen = new Set<string>();
  const all: B2Source[] = [];
  for (const source of [...strikes.flatMap((strike) => strike.sources), ...FRAMEWORK_SOURCES]) {
    if (seen.has(source.url)) continue;
    seen.add(source.url);
    all.push({ name: source.name, url: source.url, publisher: source.publisher });
  }
  return all;
}

export const STRIKES_GUIDE: B2Article = {
  key: "strikes",
  entryKey: "guide-strikes-catalonia-today",
  categoryKey: "public-services",
  sources: strikesSources(),
  // No new photograph: the Rodalies trains of the trains feature, with that
  // feature's exact alt text and caption (media rows are keyed by file, so a
  // different wording here would overwrite the feature's).
  heroKey: TRAINS.heroKey,
  heroAlt: TRAINS.heroAlt,
  heroCaption: TRAINS.heroCaption,
  verifiedAt: STRIKES_VERIFIED,
  publishedAt: "2026-10-27T20:00:00+01:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [
      locale,
      { ...STRIKES_META[locale], seoDescription: strikesDescription(locale), blocks: buildStrikesBody(locale) },
    ]),
  ) as B2Article["editions"],
};
