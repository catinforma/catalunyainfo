import type { Block } from "@/lib/content/blocks";
import { TRAINS } from "@/lib/content/features/trains";
import type { Locale } from "@/lib/i18n/config";
import { hubPath as rodaliesHub } from "@/lib/programmatic/rodalies/paths";
import { TODAY_NAME, todayPath } from "@/lib/programmatic/today/paths";

import { dateYear, dayDate } from "./festive";
import {
  b2Related,
  b2link,
  callout,
  faq,
  h2,
  h3,
  keyFacts,
  languageLinks,
  lead,
  list,
  paras,
  table,
  verifiedLine,
  B2_TITLES,
  type B2Article,
  type B2Key,
  type B2Source,
} from "./shared";
import { strike11nCityLinks } from "./strike-11n-city-paths";

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
 * Added on 30 Oct 2026 (read that day on the organiser's or the Generalitat's
 * own page):
 *  - Doctors' indefinite strike: the Departament d'Empresa i Treball's order
 *    of 22 Oct (e-Tauler notice 654506: Metges de Catalunya, from 08:00 on
 *    28 Oct, indefinite; minimum services) and Metges de Catalunya's notices
 *    of 10 Sep and 28 Oct.
 *  - Renfe drivers on 10 and 12 Nov: SEMAF's notice nº 2026-51 of 29 Oct
 *    ("paro total" on the 10th, "paros parciales a lo largo de la jornada" on
 *    the 12th; no hours, no minimum services yet).
 *  - 29 Oct: the order itself (e-Tauler notice 654526, signed 22 Oct: 33% off
 *    peak, 66% at peak), beside Rodalies' notice.
 *  e-Tauler withdraws its notices after about four weeks (these two on 19 Nov
 *  2026): once the DOGC prints the order with its number, swap the link.
 *
 * Re-checked on the evening of 30 Oct 2026 (research_notes/x10/strikes-hub-factpack-2026-10-30.md):
 *  - Both orders are in the DOGC (núm. 9780, 26 Oct 2026): Ordre EMT/209/2026
 *    (doctors) and Ordre EMT/210/2026 (Renfe, 29 Oct). The links now point at
 *    the Portal Jurídic ELI, which does not expire; e-Tauler is no longer cited
 *    for them.
 *  - Doctors: Metges de Catalunya's news list (newest items 28 and 30 Oct)
 *    announces no agreement and no end date; the strike is still open.
 *  - Ouigo: the Ministry of Transport's resolution of 27 Oct sets 72.41% of
 *    trains and lists six days, two full (30 Oct, 2 Nov) and four of partial
 *    stoppages (6 and 9 Nov, 4 and 8 Dec, 06:00-12:00 and 18:00-23:59).
 *    Ouigo's own page answers 403 to every reader we have; its "55 of 77"
 *    (read 27 Oct) matches the resolution's 40 + 37 trains on the two full days.
 *  - SEMAF 10 and 12 Nov and the 11N general strike: no order in the DOGC up
 *    to núm. 9784 (30 Oct), none on Treball's e-Tauler list (newest 23 Oct),
 *    no resolution on the Ministry of Transport's rail list, no notice at
 *    Rodalies, Renfe, TMB or FGC; SEMAF has not called anything off.
 *  - Education strike on Thu 26 Nov: announced by USTEC·STEs and CGT
 *    Ensenyament on 28 Oct (their own pages); no hours, no order yet. For the
 *    8 Sep 2026 education strike the order was signed on 3 Sep.
 *  - Groundforce (ground handling at El Prat, CGT, indefinite since 4 Aug
 *    2026): the Ministry's resolution of 28 Sep sets flight protection from
 *    1 Oct to 30 Nov. It sits in the airports paragraph of "how minimum
 *    services work", not as a dated strike: whether it is still being held
 *    is in no official source, and as an open strike it would push Renfe's
 *    10/12 Nov out of the meta description.
 *  - Left out: the Irvia strike (maintenance staff of the Rodalies and
 *    regional trains, 19 Oct to 1 Nov, Ordre EMT/211/2026, 33% of the
 *    maintenance work): Rodalies had no notice for it on 30 Oct, and the
 *    order announces no change to passenger trains. UGT FICA's meat-industry
 *    strike of 9-13 Nov: no passenger, patient or school service.
 *
 * Re-checked on the evening of 2 Nov 2026 (research_notes/x10/strikes-hub-factpack-2026-11-02.md):
 *  - Doctors: Metges de Catalunya's news list (newest item 30 Oct) and its
 *    home page announce no agreement, suspension or end; Treball's list has
 *    no new order for it. Still open.
 *  - SEMAF 10 and 12 Nov: SEMAF's notice nº 2026-52 of 2 Nov keeps the
 *    "huelga que hemos convocado los días 10 y 12 de noviembre", still with
 *    no hours. No Ministry resolution (rail list: newest the Ouigo one of 27
 *    Oct and a 28 Oct amendment to the 29 Oct Renfe one), no order in the DOGC
 *    (núm. 9785, 2 Nov) or on Treball's list (newest Renfe entry 23 Oct), no
 *    notice at Rodalies. Precedent for 29 Oct: Generalitat order 7 days
 *    before (so about 3 Nov), Ministry resolution 6 days before (about 4 Nov).
 *  - 11N: no order (DOGC 9785, Treball's list), no notice at Rodalies, TMB or
 *    FGC; 11n.cat, ugt.cat and cgtcatalunya.cat give no demonstration time or
 *    place.
 *  - Education 26 Nov: the joint press release of 28 Oct (USTEC-STEs, CGT,
 *    La Intersindical, COS and CNT with the Assemblea Educativa de Catalunya,
 *    PDF on cgtensenyament.cat) lists "26 de novembre: vaga de les
 *    treballadores de l'educació" and "21 de novembre: manifestació en
 *    defensa de l'educació pública", details of the march still to come. No
 *    hours, no order.
 *  - Ouigo: no change; the all-day strike of 2 Nov is on today, so it stays
 *    upcoming until STRIKES_AS_OF moves past it.
 *  - Left out: the strike of the A&E staff at Parc de Salut Mar (Hospital del
 *    Mar), 21:30 on 2 Nov to 07:45 on 4 Nov. The Generalitat's order of 2 Nov
 *    (e-Tauler only, no DOGC number yet) keeps A&E and the special units
 *    running normally, so no patient would notice, and it is over before the
 *    next deploy. Treball's other entries (TMB, social sector) were for October.
 *
 * Re-checked on the afternoon of 3 Nov 2026 (research_notes/x10/strikes-hub-factpack-2026-11-03.md):
 *  - Ouigo: the all-day strike of 2 Nov is past and moves to "past strikes"
 *    with what was published for it (the Ministry's resolution of 27 Oct,
 *    Ouigo's 55 of 77 of 27 Oct). Ouigo's page still answers 403. The partial
 *    stoppages of 6 and 9 Nov and 4 and 8 Dec stay, from the same resolution.
 *  - Doctors: Metges de Catalunya's news list (newest item still 30 Oct) and
 *    home page (agenda: executive council on 3 Nov) announce no agreement,
 *    suspension or end. Still open.
 *  - SEMAF 10 and 12 Nov: nothing new from SEMAF (newest notice nº 2026-52 of
 *    2 Nov, feed included); no order yet in the DOGC (núm. 9786, 3 Nov, has
 *    only Ordre EMT/215/2026, Parc de Salut Mar) or on Treball's list (newest
 *    entry 2 Nov); no resolution on the Ministry's rail list (newest 28 Oct);
 *    no notice at Rodalies. The 29 Oct precedent (order 7 days before,
 *    resolution 6 days before) points at 3-4 Nov: not out at 17:00 on the 3rd.
 *  - 11N: no order (DOGC 9786, Treball's list), no Ministry resolution (rail
 *    or air), no notice at Rodalies, TMB or FGC. The demonstration time and
 *    place are on the 11N page, from the Sindicat de Llogateres' own notice;
 *    the hub keeps CCOO de Catalunya's line and links there.
 *  - Education 26 Nov and the 21 Nov march: nothing new on sindicat.net or
 *    cgtensenyament.cat (no hours, no order, no march details).
 *  - No new strike for 3-30 Nov that a traveller, patient or family would
 *    notice: Treball's list, the DOGC, the Ministry's rail and air lists,
 *    TMB, FGC and Rodalies have nothing new. CCOO's Semillas Batlle strike
 *    (6 Nov, a seed company in Bell-lloc d'Urgell) touches no public service.
 *
 * Left out on purpose (press only, not confirmed by an organiser or an
 * operator): the 11N demonstration's place and time, Rodalies' peak-hour
 * bands for a strike whose order is not out, the TMB bus stoppages of
 * October (an order was signed on 2 Oct; whether they were called off is
 * only in the press), any 11N percentage. Ouigo's further dates (6 and 9 Nov,
 * 4 and 8 Dec) were press only until the Ministry's resolution of 27 Oct
 * listed them: they are in now, from that resolution.
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
 *  - Indefinite strike (`indefinite`): it stays "in progress" until you set
 *    `indefinite.endedOn` to the day it was called off or ended. Re-check
 *    the organiser at least weekly: a test fails seven days after
 *    STRIKES_AS_OF while one is still open.
 *  - `affects` drives the "what runs" table at the top: list every service a
 *    traveller, patient or family would notice.
 *  - Strike guides (4 Nov 2026): an entry with `guide` also has a page of its
 *    own (strike-guides.ts: Renfe 10/12 Nov, education 26 Nov), built from this
 *    entry only, titles and dates included. Edit the entry, never the guide;
 *    `?only=strikes` republishes the hub and every guide. If a day is called
 *    off, remove it from `dates` (the guide's title follows); if the whole
 *    strike is called off, say so in `facts` and set `minimumServices` to
 *    "none" once its day has passed, as for any other strike.
 */

/**
 * The day the list was last brought up to date. Upcoming and past are decided
 * against this date, never against the clock: the HTML must be the same
 * whichever day it is rendered.
 */
export const STRIKES_AS_OF = "2026-11-05";

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

/** The services a traveller, patient or family would notice; one row each in the "what runs" table. */
export type ServiceKey = "rodalies" | "longDistance" | "metroBus" | "fgcTram" | "health" | "schools";

export const SERVICE_KEYS: ServiceKey[] = ["rodalies", "metroBus", "fgcTram", "longDistance", "health", "schools"];

export interface Strike {
  /** Stable anchor for the dated section, e.g. "vaga-general-2026-11-11". */
  id: string;
  /** Every day of strike action (ISO, Catalan civil date), ascending. An indefinite strike lists its first day only. */
  dates: string[];
  /**
   * An indefinite strike: it began on `dates[0]` and has no last day. It is in
   * progress until `endedOn` is set to the day it was called off or ended.
   */
  indefinite?: { endedOn?: string };
  scope: StrikeScope;
  /** What it touches, for the "what runs" table. */
  affects: ServiceKey[];
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
  /**
   * The strike's own guide (strike-guides.ts), rendered from this entry. The
   * hub's section links to it; editing the entry updates both pages, and
   * `?only=strikes` republishes both.
   */
  guide?: B2Key;
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
  semaf1012: "https://www.semaf.org/informaciones/semaf-continua-convocando-huelgas-10-12-noviembre/",
  // SEMAF nº 2026-52 (2 Nov 2026): keeps the 10 and 12 Nov strikes, still no hours.
  semaf52: "https://www.semaf.org/informaciones/cumplimiento-inmediato-compromisos-seguridad/",
  // Ordres EMT/210/2026 and EMT/209/2026 (DOGC núm. 9780, 26 Oct 2026), by their ELI.
  ordreRenfe29: "https://portaljuridic.gencat.cat/eli/es-ct/o/2026/10/22/emt210/dof/cat/html",
  // 5 Nov 2026: the two orders signed that day, on e-Tauler until the DOGC prints them with a number (then swap to the ELI link).
  ordreRenfe1012: "https://tauler.seu-e.cat/detall?idEns=1&idEdicte=657097",
  ordre11n: "https://tauler.seu-e.cat/detall?idEns=1&idEdicte=657102",
  semafCuerpo: "https://www.semaf.org/informaciones/encuentro-con-el-ministro-carlos-cuerpo-ni-una-tragedia-mas/",
  semafOuigo: "https://www.semaf.org/informaciones/ouigo-firma-todas-reivindicaciones/",
  alferro80: "https://www.alferro.org/comunicado/comunicado-80-2026-modificacion-de-las-fechas-de-huelga-de-noviembre-de-2026/",
  scfAdif: "https://www.scf.es/com33/",
  ordreMetges: "https://portaljuridic.gencat.cat/eli/es-ct/o/2026/10/22/emt209/dof/cat/html",
  ministryRail: "https://www.transportes.gob.es/transporte-terrestre/resoluciones-de-servicios-minimos-ferroviarios",
  ouigoResolution: "https://cdn.transportes.gob.es/portal-web-transportes/transporte-terrestre/servicios-minimos/resolucion-20261027-ssmm_ouigo.pdf",
  // Ministry of Transport, 28 Sep 2026: Groundforce BCN (CGT) at El Prat, in force 1 Oct to 30 Nov 2026.
  groundforce: "https://cdn.transportes.gob.es/portal-web-transportes/aereo/huelga-servicios-minimos/49_26-10-01----resolucion-ssmm-huelga-groundforce-bcn_vi.pdf",
  metgesStrike: "https://metgesdecatalunya.cat/ca/actualitat/noticies/mc-prou-dexcuses-salut-pot-negociar-si-vol-i-fins-ara-no-ha-volgut",
  metgesCall: "https://metgesdecatalunya.cat/ca/actualitat/noticies/els-sindicats-medics-acorden-iniciar-la-vaga-indefinida-de-facultatius-el-proper-28-doctubre",
  metgesNews: "https://metgesdecatalunya.cat/ca/actualitat/noticies",
  treballMs: "https://treball.gencat.cat/ca/ambits/relacions_laborals/vagues/serveis-minims/",
  ccooRegistered: "https://www.ccoo.es/noticia:770401",
  ccooCall: "https://www.ccoo.es/noticia:769574--Convocamos_huelga_general_para_el_11_de_noviembre",
  ugt: "https://www.ugt.es/huelga-general-11-noviembre",
  ccooCatalunya: "https://11n.cat/",
  ugtCatalunya: "https://www.ugt.cat/vaga-general-11n/",
  ugtCatalunyaCall: "https://www.ugt.cat/l11-n-vaga-general-per-uns-salaris-dignes-un-habitatge-assequible-i-una-vida-millor/",
  cgtCatalunya: "https://cgtcatalunya.cat/11n-cgt-convoca-vaga-general/",
  ustec: "https://www.sindicat.net/2026/10/09/ratifiquem-la-vaga-general-de-l11-de-novembre-sense-casa-no-hi-ha-educacio-per-una-educacio-publica-de-qualitat-i-en-catala/",
  ustec26: "https://www.sindicat.net/2026/10/28/aquest-novembre-blindem-la-publica/",
  cgtEns26: "https://www.cgtensenyament.cat/al-novembre-tornem-al-carrer-el-conflicte-educatiu-segueix-viu/",
  // Joint press release of 28 Oct 2026 (USTEC-STEs, CGT, La Intersindical, COS, CNT and the Assemblea Educativa de Catalunya).
  edu26Joint: "https://www.cgtensenyament.cat/wp-content/uploads/2026/10/NdP-US-i-AEC-28octubre26.pdf",
  constitution: "https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229",
  rdl17: "https://www.boe.es/buscar/act.php?id=BOE-A-1977-6061",
  emt201: "https://portaljuridic.gencat.cat/eli/es-ct/o/2024/09/25/emt201/dof/cat/html",
  emt38: "https://portaljuridic.gencat.cat/eli/es-ct/o/2024/03/05/emt38/dof/cat/html",
  decret120: "https://portaljuridic.gencat.cat/eli/es-ct/d/1995/03/24/120/dof/cat/html",
} as const;

const U = STRIKE_URLS;
const link = (href: string, label: string) => `[${label}](${href})`;

const OUIGO_RESOLUTION_NAME =
  "Resolución de 27 de octubre de 2026: servicios mínimos durante la huelga convocada por SEMAF en OUIGO España (30 de octubre, 2, 6 y 9 de noviembre, 4 y 8 de diciembre)";

/* -------------------------------------------------------------------------- */
/* The strikes                                                                */
/* -------------------------------------------------------------------------- */

export const STRIKES: Strike[] = [
  {
    id: "vaga-renfe-2026-10-29",
    dates: ["2026-10-29"],
    scope: "rail",
    affects: ["rodalies", "longDistance"],
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
        ca: `A **Rodalies de Catalunya**, incloses les línies regionals, el servei es fa amb els serveis mínims que fixa ${link(U.ordreRenfe29, "l'Ordre EMT/210/2026 del Departament d'Empresa i Treball")}, del 22 d'octubre de 2026: el **66% del servei habitual en hora punta** i el **33% la resta del dia**, segons també ${link(U.rodalies29, "l'avís de Rodalies")} actualitzat el 26 d'octubre de 2026, que enllaça l'horari de serveis mínims de cada línia. Per als altres trens de Renfe (alta velocitat, llarga i mitjana distància), Renfe té un avís de serveis mínims a ${link(U.renfe, "renfe.com")}.`,
        es: `En **Rodalies de Catalunya**, incluidas las líneas regionales, el servicio se presta con los servicios mínimos que fija ${link(U.ordreRenfe29, "la Ordre EMT/210/2026 del Departament d'Empresa i Treball")}, del 22 de octubre de 2026: el **66% del servicio habitual en hora punta** y el **33% el resto del día**, según también ${link(U.rodalies29, "el aviso de Rodalies")} actualizado el 26 de octubre de 2026, que enlaza el horario de servicios mínimos de cada línea. Para los demás trenes de Renfe (alta velocidad, larga y media distancia), Renfe tiene un aviso de servicios mínimos en ${link(U.renfe, "renfe.com")}.`,
        en: `On **Rodalies de Catalunya**, regional lines included, trains run to the minimum services set by ${link(U.ordreRenfe29, "Order EMT/210/2026 of the Generalitat's Department of Business and Labour")}, of 22 October 2026: **66% of the usual service at peak times** and **33% for the rest of the day**, as ${link(U.rodalies29, "Rodalies' notice")} (updated 26 October 2026) also says, which links a minimum-service timetable for every line. For Renfe's other trains (high-speed, long and medium distance), Renfe carries a minimum-services notice on ${link(U.renfe, "renfe.com")}.`,
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
      { name: "Ordre EMT/210/2026, de 22 d'octubre: servei essencial de transport de viatgers per ferrocarril (rodalies i regionals) del Grupo Renfe (DOGC núm. 9780, 26/10/2026)", url: U.ordreRenfe29, publisher: "DOGC" },
      { name: "Renfe: avisos de servicios mínimos", url: U.renfe, publisher: "Renfe" },
    ],
  },
  {
    id: "vaga-metges-2026-10-28",
    dates: ["2026-10-28"],
    indefinite: {},
    scope: "health",
    affects: ["health"],
    title: {
      ca: "vaga indefinida de metges (Metges de Catalunya)",
      es: "huelga indefinida de médicos (Metges de Catalunya)",
      en: "indefinite doctors' strike (Metges de Catalunya)",
    },
    short: {
      ca: "vaga indefinida de metges a la sanitat pública i concertada, que continua: urgències i unitats especials funcionen",
      es: "huelga indefinida de médicos en la sanidad pública y concertada, que continúa: urgencias y unidades especiales funcionan",
      en: "indefinite doctors' strike in public and publicly funded healthcare, still on: A&E and special units keep running",
    },
    label: { ca: "metges des del 28 d'octubre", es: "médicos desde el 28 de octubre", en: "doctors since 28 October" },
    facts: {
      ca: [
        "**Convocatòria:** el sindicat Metges de Catalunya (MC), que la va registrar el 15 de setembre de 2026. Els sindicats mèdics de tot l'Estat havien acordat començar una vaga indefinida el 28 d'octubre, i MC la fa a Catalunya.",
        "**Des de quan:** des de les 8.00 h del dimecres 28 d'octubre de 2026, sense data de final. En paraules del secretari general de MC, Xavier Lleonart, «té data d'inici, però no de final».",
        `**On és:** el 5 de novembre de 2026 la vaga continuava. Metges de Catalunya no havia anunciat cap acord amb el Departament de Salut ni cap data de final a ${link(U.metgesNews, "les seves notícies")}.`,
        "**Qui hi està cridat:** el personal facultatiu (metges i altres facultatius, també els residents en formació) dels hospitals, els CAP i la resta de centres de la xarxa sanitària pública SISCAT i de les entitats adscrites al CatSalut o al Departament de Salut.",
        `**Per què:** MC reclama un conveni propi per als metges i que el Departament de Salut negociï amb el sindicat; diu que només hi ha «dues sortides possibles» per a la vaga, una negociació «real i efectiva» amb MC o unes eleccions, segons ${link(U.metgesStrike, "el seu comunicat del 28 d'octubre")}.`,
      ],
      es: [
        "**Convocatoria:** el sindicato Metges de Catalunya (MC), que la registró el 15 de septiembre de 2026. Los sindicatos médicos de toda España habían acordado empezar una huelga indefinida el 28 de octubre, y MC la hace en Cataluña.",
        "**Desde cuándo:** desde las 8.00 h del miércoles 28 de octubre de 2026, sin fecha de final. En palabras del secretario general de MC, Xavier Lleonart, «té data d'inici, però no de final» (tiene fecha de inicio, pero no de final).",
        `**Cómo está:** el 5 de noviembre de 2026 la huelga seguía. Metges de Catalunya no había anunciado ningún acuerdo con el Departament de Salut ni ninguna fecha de final en ${link(U.metgesNews, "sus noticias")}.`,
        "**A quién llama:** al personal facultativo (médicos y otros facultativos, también los residentes en formación) de los hospitales, los CAP y el resto de centros de la red sanitaria pública SISCAT y de las entidades adscritas al CatSalut o al Departament de Salut.",
        `**Por qué:** MC reclama un convenio propio para los médicos y que el Departament de Salut negocie con el sindicato; dice que solo hay dos salidas posibles para la huelga, una negociación real y efectiva con MC o unas elecciones, según ${link(U.metgesStrike, "su comunicado del 28 de octubre")}.`,
      ],
      en: [
        "**Called by:** the doctors' union Metges de Catalunya (MC), which registered it on 15 September 2026. Doctors' unions across Spain had agreed to start an indefinite strike on 28 October, and MC is holding it in Catalonia.",
        "**Since when:** 08:00 on Wednesday 28 October 2026, with no end date. In the words of MC's general secretary, Xavier Lleonart, it \"té data d'inici, però no de final\" (has a start date but no end date).",
        `**Where it stands:** on 5 November 2026 the strike was still on. Metges de Catalunya had announced no agreement with the Health Department and no end date in ${link(U.metgesNews, "its news")}.`,
        "**Who is called out:** doctors and other medical graduates (residents in training included) at hospitals, primary care centres (CAP) and the other centres of Catalonia's public health network SISCAT and the bodies attached to CatSalut or the Health Department.",
        `**Why:** MC wants a collective agreement of doctors' own and for the Health Department to negotiate with the union; it says there are only two ways out of the strike, real and effective negotiation with MC or elections, according to ${link(U.metgesStrike, "its statement of 28 October")}.`,
      ],
    },
    minimumServices: {
      status: "published",
      msShort: {
        ca: "Serveis mínims publicats: urgències, UCI, parts, diàlisi i tractaments oncològics urgents, amb normalitat",
        es: "Servicios mínimos publicados: urgencias, UCI, partos, diálisis y tratamientos oncológicos urgentes, con normalidad",
        en: "Minimum services published: A&E, intensive care, maternity, dialysis and urgent cancer treatment run normally",
      },
      text: {
        ca: `Els fixa ${link(U.ordreMetges, "l'Ordre EMT/209/2026 del Departament d'Empresa i Treball")}, del 22 d'octubre de 2026 (DOGC del 26 d'octubre). **Als hospitals**, funcionen amb normalitat les urgències i les unitats especials (cures intensives, unitats coronàries, hemodiàlisi, neonatologia, parts, radioteràpia i quimioteràpia), i s'ha de fer la cirurgia que no es pot ajornar. **Als CAP i als altres centres fora de l'hospital**, l'atenció urgent dels CUAP, els PAC i els PADES funciona amb normalitat, i la resta de serveis, amb el 25% de la plantilla el primer dia i un terç a partir del segon. Els altres serveis funcionen com un dia festiu, o amb el 50% de la plantilla on un festiu es treballa amb la mateixa plantilla que un dia feiner. Es mantenen el transport sanitari urgent, els serveis d'emergències mèdiques i els serveis farmacèutics dels centres, amb el personal dels torns de guàrdia i de nit, i les donacions del Banc de Sang i Teixits funcionen al 50%.`,
        es: `Los fija ${link(U.ordreMetges, "la Ordre EMT/209/2026 del Departament d'Empresa i Treball")}, del 22 de octubre de 2026 (DOGC del 26 de octubre). **En los hospitales**, funcionan con normalidad las urgencias y las unidades especiales (cuidados intensivos, unidades coronarias, hemodiálisis, neonatología, partos, radioterapia y quimioterapia), y debe hacerse la cirugía que no se puede aplazar. **En los CAP y los demás centros fuera del hospital**, la atención urgente de los CUAP, los PAC y los PADES funciona con normalidad, y el resto de servicios, con el 25% de la plantilla el primer día y un tercio a partir del segundo. Los demás servicios funcionan como un día festivo, o con el 50% de la plantilla donde un festivo se trabaja con la misma plantilla que un día laborable. Se mantienen el transporte sanitario urgente, los servicios de emergencias médicas y los servicios farmacéuticos de los centros, con el personal de los turnos de guardia y de noche, y las donaciones del Banc de Sang i Teixits funcionan al 50%.`,
        en: `They are set by ${link(U.ordreMetges, "Order EMT/209/2026 of the Generalitat's Department of Business and Labour")}, of 22 October 2026 (DOGC, 26 October). **In hospitals**, A&E and the special units (intensive care, coronary units, haemodialysis, neonatal care, maternity, radiotherapy and chemotherapy) run normally, and surgery that cannot be postponed goes ahead. **At primary care and other centres outside hospitals**, urgent care at the CUAP, PAC and PADES runs normally, and other services with 25% of staff on the first day and a third from the second day on. All other services run as on a public holiday, or with 50% of staff where a holiday is normally staffed like a working day. Urgent patient transport, the medical emergency services and the centres' pharmacy services (with their on-call and night staff) are kept, and Blood and Tissue Bank donations run at 50%.`,
      },
    },
    advice: {
      ca: [
        "Si tens una visita o una operació programada, pregunta al teu centre si es manté: fora de les urgències i de les unitats especials, l'ordre només garanteix una part de la plantilla.",
        "Per a una urgència, les urgències dels hospitals, els CUAP i els PAC funcionen amb normalitat.",
      ],
      es: [
        "Si tienes una visita o una operación programada, pregunta a tu centro si se mantiene: fuera de las urgencias y de las unidades especiales, la orden solo garantiza una parte de la plantilla.",
        "Para una urgencia, las urgencias de los hospitales, los CUAP y los PAC funcionan con normalidad.",
      ],
      en: [
        "If you have an appointment or an operation booked, ask your centre whether it goes ahead: outside A&E and the special units, the order only guarantees part of the staff.",
        "For anything urgent, hospital A&E and the CUAP and PAC urgent-care centres run normally.",
      ],
    },
    sources: [
      { name: "Ordre EMT/209/2026, de 22 d'octubre: servei essencial d'assistència sanitària dels centres del SISCAT (DOGC núm. 9780, 26/10/2026)", url: U.ordreMetges, publisher: "DOGC" },
      { name: "MC: «Prou d'excuses, Salut pot negociar si vol i fins ara no ha volgut» (28/10/2026)", url: U.metgesStrike, publisher: "Metges de Catalunya" },
      { name: "Notícies de Metges de Catalunya (consultades el 03/11/2026)", url: U.metgesNews, publisher: "Metges de Catalunya" },
      { name: "Els sindicats mèdics acorden iniciar la vaga indefinida de facultatius el proper 28 d'octubre (10/09/2026)", url: U.metgesCall, publisher: "Metges de Catalunya" },
    ],
  },
  {
    id: "vaga-ouigo-2026-10-30",
    dates: ["2026-10-30", "2026-11-02"],
    scope: "rail",
    affects: ["longDistance"],
    title: {
      ca: "vaga de maquinistes d'Ouigo (SEMAF)",
      es: "huelga de maquinistas de Ouigo (SEMAF)",
      en: "Ouigo train drivers' strike (SEMAF)",
    },
    short: {
      ca: "vaga de maquinistes d'Ouigo tot el dia: comprova el teu tren a la web d'Ouigo",
      es: "huelga de maquinistas de Ouigo todo el día: comprueba tu tren en la web de Ouigo",
      en: "all-day Ouigo train drivers' strike: check your train on Ouigo's website",
    },
    label: {
      ca: "Ouigo el 30 d'octubre i el 2 de novembre",
      es: "Ouigo el 30 de octubre y el 2 de noviembre",
      en: "Ouigo on 30 October and 2 November",
    },
    facts: {
      ca: [
        "**Convocatòria:** el sindicat de maquinistes SEMAF, per a tots els maquinistes d'Ouigo, l'operador d'alta velocitat que uneix Barcelona amb Madrid.",
        "**Dies i hores:** tot el dia el divendres 30 d'octubre i el dilluns 2 de novembre de 2026, de les 00.00 a les 23.59 h, segons la resolució de serveis mínims del Ministeri de Transports.",
        `**Aturades desconvocades:** SEMAF va desconvocar el 5 de novembre de 2026 les aturades parcials d'Ouigo de la mateixa convocatòria (6 i 9 de novembre, 4 i 8 de desembre), quan la direcció de l'empresa va signar l'acord amb les seves reivindicacions, segons ${link(U.semafOuigo, "el comunicat de SEMAF")}.`,
      ],
      es: [
        "**Convocatoria:** el sindicato de maquinistas SEMAF, para todos los maquinistas de Ouigo, el operador de alta velocidad que une Barcelona con Madrid.",
        "**Días y horas:** todo el día el viernes 30 de octubre y el lunes 2 de noviembre de 2026, de 00.00 a 23.59 h, según la resolución de servicios mínimos del Ministerio de Transportes.",
        `**Paros desconvocados:** SEMAF desconvocó el 5 de noviembre de 2026 los paros parciales de Ouigo de la misma convocatoria (6 y 9 de noviembre, 4 y 8 de diciembre), cuando la dirección de la empresa firmó el acuerdo con sus reivindicaciones, según ${link(U.semafOuigo, "el comunicado de SEMAF")}.`,
      ],
      en: [
        "**Called by:** the train drivers' union SEMAF, for all drivers at Ouigo, the high-speed operator that links Barcelona and Madrid.",
        "**Days and hours:** all day on Friday 30 October and Monday 2 November 2026, 00:00 to 23:59, according to the Ministry of Transport's minimum-services resolution.",
        `**Stoppages called off:** SEMAF called off Ouigo's partial stoppages in the same call (6 and 9 November, 4 and 8 December) on 5 November 2026, when the company's management signed the agreement meeting its demands, according to ${link(U.semafOuigo, "SEMAF's notice")}.`,
      ],
    },
    minimumServices: {
      status: "published",
      msShort: {
        ca: "Serveis mínims del Ministeri de Transports: el 72,41% dels trens",
        es: "Servicios mínimos del Ministerio de Transportes: el 72,41% de los trenes",
        en: "Minimum service set by the Ministry of Transport: 72.41% of trains",
      },
      text: {
        ca: `Els fixa el Ministeri de Transports i Mobilitat Sostenible: ${link(U.ouigoResolution, "la seva resolució del 27 d'octubre de 2026")} hi garanteix el **72,41% de les circulacions** previstes, per a tots els dies i les hores de la vaga, i llista a l'annex els trens que han de circular. Per a aquests dos dies, ${link(U.ouigoStrike, "l'avís d'Ouigo")} deia el 27 d'octubre que circularien **55 de les 77** circulacions programades.`,
        es: `Los fija el Ministerio de Transportes y Movilidad Sostenible: ${link(U.ouigoResolution, "su resolución del 27 de octubre de 2026")} garantiza el **72,41% de las circulaciones** previstas, para todos los días y las horas de la huelga, y lista en el anexo los trenes que deben circular. Para estos dos días, ${link(U.ouigoStrike, "el aviso de Ouigo")} decía el 27 de octubre que circularían **55 de las 77** circulaciones programadas.`,
        en: `They are set by Spain's Ministry of Transport: ${link(U.ouigoResolution, "its resolution of 27 October 2026")} guarantees **72.41% of scheduled trains** on every day and at every hour of the strike, and lists in its annex the trains that must run. For these two days, ${link(U.ouigoStrike, "Ouigo's notice")} said on 27 October that **55 of the 77** scheduled trains would run.`,
      },
    },
    advice: {
      ca: [
        `Abans de viatjar, comprova el teu tren a ${link(U.ouigo, "la web d'Ouigo")}: és l'única font que diu quins trens circulen.`,
        "Ouigo deia el 27 d'octubre que havia avisat per correu electrònic els viatgers afectats, que poden canviar el bitllet sense cost o demanar-ne la devolució, segons el temps d'avís i les seves condicions generals.",
      ],
      es: [
        `Antes de viajar, comprueba tu tren en ${link(U.ouigo, "la web de Ouigo")}: es la única fuente que dice qué trenes circulan.`,
        "Ouigo decía el 27 de octubre que había avisado por correo electrónico a los viajeros afectados, que pueden cambiar el billete sin coste o pedir la devolución, según el tiempo de preaviso y sus condiciones generales.",
      ],
      en: [
        `Before you travel, check your train on ${link(U.ouigo, "Ouigo's website")}: it is the only source for which trains run.`,
        "Ouigo said on 27 October that it had emailed affected passengers, who can change their ticket free of charge or ask for a refund, depending on how much notice they were given and on its general conditions.",
      ],
    },
    sources: [
      { name: OUIGO_RESOLUTION_NAME, url: U.ouigoResolution, publisher: "Ministerio de Transportes y Movilidad Sostenible" },
      { name: "Trenes afectados por huelga de maquinistas", url: U.ouigoStrike, publisher: "OUIGO España" },
      { name: "Ouigo firma todas las reivindicaciones tras dos días sin circular ningún tren (05/11/2026)", url: U.semafOuigo, publisher: "SEMAF" },
    ],
  },
  {
    id: "vaga-renfe-2026-11-10",
    dates: ["2026-11-10", "2026-11-12"],
    scope: "rail",
    affects: ["rodalies", "longDistance"],
    title: {
      ca: "vaga de maquinistes del Grup Renfe (SEMAF)",
      es: "huelga de maquinistas del Grupo Renfe (SEMAF)",
      en: "Renfe train drivers' strike (SEMAF)",
    },
    short: {
      ca: "vaga de maquinistes de Renfe, que afecta Rodalies: aturada total el 10 i aturades parcials el 12",
      es: "huelga de maquinistas de Renfe, que afecta a Rodalies: paro total el 10 y paros parciales el 12",
      en: "Renfe train drivers' strike, which affects Rodalies: a full stoppage on the 10th, partial stoppages on the 12th",
    },
    label: {
      ca: "Renfe el 10 i el 12 de novembre",
      es: "Renfe el 10 y el 12 de noviembre",
      en: "Renfe on 10 and 12 November",
    },
    facts: {
      ca: [
        `**Convocatòria:** el sindicat de maquinistes SEMAF, que la va anunciar el 29 d'octubre de 2026, el dia de la vaga anterior, en ${link(U.semaf1012, "el seu comunicat núm. 2026-51")}, i que el 2 de novembre la mantenia en ${link(U.semaf52, "el comunicat núm. 2026-52")}.`,
        `**Dies:** el dimarts 10 de novembre, «paro total» (aturada total), de 0.01 a 23.59 h; el dijous 12 de novembre, «paros parciales a lo largo de la jornada» (aturades parcials), de 6.20 a 9.20 h, de 14.20 a 17.20 h i de 21.20 a 23.20 h, segons ${link(U.ordreRenfe1012, "l'ordre de serveis mínims del 5 de novembre")}.`,
        `**ALFERRO ja no:** aquest sindicat havia convocat vaga els mateixos dos dies, però el 4 de novembre la va substituir per una sola jornada el 17 de novembre, segons ${link(U.alferro80, "el seu comunicat 80/2026")}.`,
        `**Negociació:** SEMAF es va reunir el 5 de novembre amb el ministre de Transports, Carlos Cuerpo, sense acord, i el Ministeri l'ha tornat a convocar el divendres 6, segons ${link(U.semafCuerpo, "el comunicat de SEMAF")}.`,
        "**Qui hi està cridat:** el personal de conducció del Grup Renfe, segons SEMAF. El metro, els autobusos, el tramvia i FGC no formen part de la convocatòria.",
        "**Entre els dos dies**, el dimecres 11 de novembre, hi ha la vaga general.",
      ],
      es: [
        `**Convocatoria:** el sindicato de maquinistas SEMAF, que la anunció el 29 de octubre de 2026, el día de la huelga anterior, en ${link(U.semaf1012, "su comunicado n.º 2026-51")}, y que el 2 de noviembre la mantenía en ${link(U.semaf52, "el comunicado n.º 2026-52")}.`,
        `**Días:** el martes 10 de noviembre, «paro total», de 0.01 a 23.59 h; el jueves 12 de noviembre, «paros parciales a lo largo de la jornada», de 6.20 a 9.20 h, de 14.20 a 17.20 h y de 21.20 a 23.20 h, según ${link(U.ordreRenfe1012, "la orden de servicios mínimos del 5 de noviembre")}.`,
        `**ALFERRO ya no:** este sindicato había convocado huelga los mismos dos días, pero el 4 de noviembre la sustituyó por una sola jornada el 17 de noviembre, según ${link(U.alferro80, "su comunicado 80/2026")}.`,
        `**Negociación:** SEMAF se reunió el 5 de noviembre con el ministro de Transportes, Carlos Cuerpo, sin acuerdo, y el Ministerio lo ha vuelto a convocar el viernes 6, según ${link(U.semafCuerpo, "el comunicado de SEMAF")}.`,
        "**A quién llama:** al personal de conducción del Grupo Renfe, según SEMAF. El metro, los autobuses, el tranvía y FGC no forman parte de la convocatoria.",
        "**Entre los dos días**, el miércoles 11 de noviembre, está la huelga general.",
      ],
      en: [
        `**Called by:** the train drivers' union SEMAF, which announced it on 29 October 2026, the day of its previous strike, in ${link(U.semaf1012, "its notice no. 2026-51")}, and was still holding to it on 2 November in ${link(U.semaf52, "notice no. 2026-52")}.`,
        `**Days:** Tuesday 10 November, a "paro total" (full stoppage), 00:01 to 23:59; Thursday 12 November, "paros parciales a lo largo de la jornada" (partial stoppages), 06:20 to 09:20, 14:20 to 17:20 and 21:20 to 23:20, according to ${link(U.ordreRenfe1012, "the minimum-services order of 5 November")}.`,
        `**Not ALFERRO any more:** this union had called a strike on the same two days, but on 4 November replaced it with a single day on 17 November, according to ${link(U.alferro80, "its notice 80/2026")}.`,
        `**Talks:** SEMAF met the Minister of Transport, Carlos Cuerpo, on 5 November without agreement, and the Ministry has called it back for Friday 6, according to ${link(U.semafCuerpo, "SEMAF's notice")}.`,
        "**Who is called out:** Renfe Group drivers, according to SEMAF. The metro, buses, tram and FGC are not part of it.",
        "**In between**, on Wednesday 11 November, is the general strike.",
      ],
    },
    minimumServices: {
      status: "published",
      msShort: {
        ca: "Rodalies: 66% del servei en hora punta i 33% la resta del dia",
        es: "Rodalies: 66% del servicio en hora punta y 33% el resto del día",
        en: "Rodalies: 66% of service at peak times, 33% the rest of the day",
      },
      text: {
        ca: `A **Rodalies de Catalunya i els regionals**, ${link(U.ordreRenfe1012, "l'ordre del Departament d'Empresa i Treball del 5 de novembre de 2026")} fixa, els dos dies, el **66% del servei habitual en hora punta** (de 6.00 a 9.30 h i de 17.00 a 20.30 h) i el **33% la resta del dia**. Rodalies sol publicar l'horari de serveis mínims de cada línia uns dies abans. Per als altres trens de Renfe (alta velocitat, llarga distància i els regionals que surten de Catalunya), els serveis mínims els fixa el Ministeri de Transports per resolució, que encara no ha publicat (consultat el 5 de novembre de 2026 a la ${link(U.ministryRail, "seva llista de resolucions")}).`,
        es: `En **Rodalies de Catalunya y los regionales**, ${link(U.ordreRenfe1012, "la orden del Departament d'Empresa i Treball del 5 de noviembre de 2026")} fija, los dos días, el **66% del servicio habitual en hora punta** (de 6.00 a 9.30 h y de 17.00 a 20.30 h) y el **33% el resto del día**. Rodalies suele publicar el horario de servicios mínimos de cada línea unos días antes. Para los demás trenes de Renfe (alta velocidad, larga distancia y los regionales que salen de Cataluña), los servicios mínimos los fija el Ministerio de Transportes por resolución, que aún no ha publicado (consultado el 5 de noviembre de 2026 en su ${link(U.ministryRail, "lista de resoluciones")}).`,
        en: `On **Rodalies de Catalunya and regional trains**, ${link(U.ordreRenfe1012, "the Department of Business and Labour's order of 5 November 2026")} sets, on both days, **66% of the usual service at peak times** (06:00 to 09:30 and 17:00 to 20:30) and **33% for the rest of the day**. Rodalies usually publishes each line's minimum-service timetable a few days before. For Renfe's other trains (high-speed, long-distance and regional trains that leave Catalonia), the Ministry of Transport sets them by resolution, which it has not published yet (checked on 5 November 2026 on its ${link(U.ministryRail, "list of resolutions")}).`,
      },
    },
    advice: {
      ca: [
        `Si has d'agafar Rodalies o un tren de Renfe aquests dies, mira l'horari de serveis mínims de la teva línia quan es publiqui i, el mateix dia, ${link(U.rodaliesStatus, "l'estat del servei")}.`,
        "El dia 12 la vaga de SEMAF és a trams (6.20-9.20, 14.20-17.20 i 21.20-23.20 h): fora d'aquestes hores el servei es pot recuperar a poc a poc.",
      ],
      es: [
        `Si tienes que coger Rodalies o un tren de Renfe esos días, mira el horario de servicios mínimos de tu línea cuando se publique y, el mismo día, ${link(U.rodaliesStatus, "el estado del servicio")}.`,
        "El día 12 la huelga de SEMAF es por tramos (6.20-9.20, 14.20-17.20 y 21.20-23.20 h): fuera de esas horas el servicio puede tardar en recuperarse.",
      ],
      en: [
        `If you need Rodalies or a Renfe train on those days, check your line's minimum-service timetable once it is out and, on the day, ${link(U.rodaliesStatus, "the live service status")}.`,
        "On the 12th SEMAF strikes in slots (06:20-09:20, 14:20-17:20 and 21:20-23:20): outside them, service may take time to recover.",
      ],
    },
    sources: [
      { name: "SEMAF continúa convocando huelgas los días 10 y 12 de noviembre en el Grupo Renfe (nº 2026-51, 29/10/2026)", url: U.semaf1012, publisher: "SEMAF" },
      { name: "Por el cumplimiento inmediato de los compromisos en seguridad ferroviaria (nº 2026-52, 02/11/2026)", url: U.semaf52, publisher: "SEMAF" },
      { name: "Encuentro con el ministro Carlos Cuerpo: Ni una tragedia más (05/11/2026)", url: U.semafCuerpo, publisher: "SEMAF" },
      { name: "Ordre EMT/ /2026, de 5 de novembre, per la qual es garanteix el servei essencial de transport de viatgers per ferrocarril a Catalunya (serveis de rodalies i regionals) que presta l'empresa Grupo Renfe (e-Tauler, 5/11/2026; al DOGC quan es publiqui)", url: U.treballMs, publisher: "Departament d'Empresa i Treball" },
      { name: "Resoluciones de servicios mínimos ferroviarios", url: U.ministryRail, publisher: "Ministerio de Transportes y Movilidad Sostenible" },
      { name: "Comunicado 80/2026: modificación de las fechas de huelga de noviembre de 2026 (04/11/2026)", url: U.alferro80, publisher: "ALFERRO" },
    ],
    guide: "strikeRenfe",
  },
  {
    id: "vaga-general-2026-11-11",
    dates: ["2026-11-11"],
    scope: "general",
    affects: ["rodalies", "longDistance", "metroBus", "fgcTram", "health", "schools"],
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
      status: "published",
      msShort: {
        ca: "Serveis mínims publicats: transport públic al 25% de 6.30 a 9.30 h i de 16.30 a 21 h",
        es: "Servicios mínimos publicados: transporte público al 25% de 6.30 a 9.30 h y de 16.30 a 21 h",
        en: "Minimum services published: public transport at 25% from 06:30 to 09:30 and 16:30 to 21:00",
      },
      text: {
        ca: `${link(U.ordre11n, "L'ordre del Departament d'Empresa i Treball del 5 de novembre de 2026")} fixa per a Catalunya: **Rodalies i regionals, metro, autobusos de TMB, FGC, tramvia i la resta de transport urbà i interurbà**, el **25% del servei habitual de 6.30 a 9.30 h i de 16.30 a 21 h** (fora d'aquestes franges l'ordre no hi garanteix servei); l'autobús entre Barcelona i l'aeroport, el 50%; el transport de persones amb discapacitat i el transport escolar sense alternativa, el servei habitual. **Escoles:** una persona de l'equip directiu per centre i, a infantil i primària, un docent per cada 6 grups (a les llars d'infants, el 33% de la plantilla). **Sanitat:** urgències i unitats especials amb normalitat, atenció primària amb el 25% de la plantilla i farmàcies de guàrdia obertes. Els trens d'alta velocitat i de llarga distància i els aeroports depenen del Govern espanyol, que encara no ha publicat els seus serveis mínims (consultat el 5 de novembre de 2026).`,
        es: `${link(U.ordre11n, "La orden del Departament d'Empresa i Treball del 5 de noviembre de 2026")} fija para Cataluña: **Rodalies y regionales, metro, autobuses de TMB, FGC, tranvía y el resto del transporte urbano e interurbano**, el **25% del servicio habitual de 6.30 a 9.30 h y de 16.30 a 21 h** (fuera de esas franjas la orden no garantiza servicio); el autobús entre Barcelona y el aeropuerto, el 50%; el transporte de personas con discapacidad y el transporte escolar sin alternativa, el servicio habitual. **Escuelas:** una persona del equipo directivo por centro y, en infantil y primaria, un docente por cada 6 grupos (en las guarderías, el 33% de la plantilla). **Sanidad:** urgencias y unidades especiales con normalidad, atención primaria con el 25% de la plantilla y farmacias de guardia abiertas. Los trenes de alta velocidad y de larga distancia y los aeropuertos dependen del Gobierno de España, que aún no ha publicado sus servicios mínimos (consultado el 5 de noviembre de 2026).`,
        en: `${link(U.ordre11n, "The Department of Business and Labour's order of 5 November 2026")} sets for Catalonia: **Rodalies and regional trains, metro, TMB buses, FGC, tram and all other urban and interurban transport** run **25% of the usual service from 06:30 to 09:30 and from 16:30 to 21:00** (outside those slots the order guarantees no service); the bus between Barcelona and the airport, 50%; transport for people with disabilities and school transport with no alternative, the usual service. **Schools:** one member of the management team per school and, in infant and primary, one teacher for every 6 classes (nurseries, 33% of staff). **Healthcare:** A&E and special units as normal, primary care with 25% of staff, and duty pharmacies open. High-speed and long-distance trains and the airports answer to the Spanish government, which has not published its minimum services yet (checked on 5 November 2026).`,
      },
    },
    advice: {
      ca: [
        "Si t'has de moure l'11, fes-ho entre les 6.30 i les 9.30 h o entre les 16.30 i les 21 h, les franges amb serveis mínims (el 25% del servei): fora d'aquestes hores pot no haver-hi trens ni autobusos. Els horaris de cada operador, als webs de la taula de més avall.",
        "Famílies: USTEC·STEs crida tot el personal educatiu a la vaga. L'escola us dirà què pot garantir aquell dia.",
      ],
      es: [
        "Si tienes que moverte el 11, hazlo entre las 6.30 y las 9.30 h o entre las 16.30 y las 21 h, las franjas con servicios mínimos (el 25% del servicio): fuera de esas horas puede no haber trenes ni autobuses. Los horarios de cada operador, en las webs de la tabla de más abajo.",
        "Familias: USTEC·STEs llama a todo el personal educativo a la huelga. La escuela os dirá qué puede garantizar ese día.",
      ],
      en: [
        "If you need to travel on the 11th, do it between 06:30 and 09:30 or between 16:30 and 21:00, the slots with minimum services (25% of service): outside those hours there may be no trains or buses. Each operator's timetables are on the websites in the table below.",
        "Parents: USTEC·STEs is calling all education staff out. Your school will tell you what it can provide that day.",
      ],
    },
    sources: [
      { name: "Ordre EMT/ /2026, de 5 de novembre, per la qual es garanteixen els serveis essencials que s'han de prestar a Catalunya durant les convocatòries de vaga general previstes per al dia 11 de novembre de 2026 (e-Tauler, 5/11/2026; al DOGC quan es publiqui)", url: U.treballMs, publisher: "Departament d'Empresa i Treball" },
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
  {
    id: "vaga-ferroviaria-2026-11-17",
    dates: ["2026-11-17", "2026-11-19"],
    scope: "rail",
    affects: ["rodalies", "longDistance"],
    title: {
      ca: "vaga ferroviària: maquinistes (SEMAF, ALFERRO) i Adif",
      es: "huelga ferroviaria: maquinistas (SEMAF, ALFERRO) y Adif",
      en: "rail strike: train drivers (SEMAF, ALFERRO) and Adif",
    },
    short: {
      ca: "vaga ferroviària el 17 (maquinistes de Renfe i altres operadores, i Adif) i el 19 (Adif)",
      es: "huelga ferroviaria el 17 (maquinistas de Renfe y otras operadoras, y Adif) y el 19 (Adif)",
      en: "rail strike on the 17th (drivers at Renfe and other operators, and Adif) and the 19th (Adif)",
    },
    label: {
      ca: "Trens el 17 i el 19 de novembre",
      es: "Trenes el 17 y el 19 de noviembre",
      en: "Trains on 17 and 19 November",
    },
    facts: {
      ca: [
        `**17 de novembre, Adif:** vaga de 0.00 a 23.59 h convocada pel Comitè General d'Empresa d'Adif, i el sindicat SCF també en convoca el 19, 24 hores, segons ${link(U.scfAdif, "el comunicat de l'SCF")}.`,
        `**17 de novembre, maquinistes:** SEMAF crida els maquinistes de Renfe, Iryo, Ouigo, Transfesa, Continental Rail, Tracción Rail, Captrain i Medway, segons ${link(U.semafCuerpo, "el seu comunicat del 5 de novembre")}; i ALFERRO hi trasllada les vagues que tenia el 10 i el 12, segons ${link(U.alferro80, "el seu comunicat 80/2026")}.`,
        "**Serveis mínims:** encara no publicats. A Rodalies els fixa el Departament d'Empresa i Treball; a l'alta velocitat i la llarga distància, el Ministeri de Transports.",
      ],
      es: [
        `**17 de noviembre, Adif:** huelga de 0.00 a 23.59 h convocada por el Comité General de Empresa de Adif, y el sindicato SCF convoca también el 19, 24 horas, según ${link(U.scfAdif, "el comunicado del SCF")}.`,
        `**17 de noviembre, maquinistas:** SEMAF llama a los maquinistas de Renfe, Iryo, Ouigo, Transfesa, Continental Rail, Tracción Rail, Captrain y Medway, según ${link(U.semafCuerpo, "su comunicado del 5 de noviembre")}; y ALFERRO traslada ahí las huelgas que tenía el 10 y el 12, según ${link(U.alferro80, "su comunicado 80/2026")}.`,
        "**Servicios mínimos:** aún no publicados. En Rodalies los fija el Departament d'Empresa i Treball; en alta velocidad y larga distancia, el Ministerio de Transportes.",
      ],
      en: [
        `**17 November, Adif:** a strike from 00:00 to 23:59 called by Adif's company works council, and the SCF union also calls one on the 19th, 24 hours, according to ${link(U.scfAdif, "SCF's notice")}.`,
        `**17 November, train drivers:** SEMAF calls out drivers at Renfe, Iryo, Ouigo, Transfesa, Continental Rail, Tracción Rail, Captrain and Medway, according to ${link(U.semafCuerpo, "its notice of 5 November")}; ALFERRO moves its 10 and 12 November strikes to this day, according to ${link(U.alferro80, "its notice 80/2026")}.`,
        "**Minimum services:** not published yet. The Catalan Department of Business and Labour sets them for Rodalies; the Ministry of Transport for high-speed and long-distance trains.",
      ],
    },
    minimumServices: {
      status: "pending",
      msShort: {
        ca: "Encara no publicats",
        es: "Aún no publicados",
        en: "Not published yet",
      },
      text: {
        ca: `Encara no s'han publicat. Els de Rodalies sortiran a la ${link(U.treballMs, "llista de serveis mínims del Departament d'Empresa i Treball")}; els de la resta de trens, a les ${link(U.ministryRail, "resolucions del Ministeri de Transports")}.`,
        es: `Aún no se han publicado. Los de Rodalies saldrán en la ${link(U.treballMs, "lista de servicios mínimos del Departament d'Empresa i Treball")}; los del resto de trenes, en las ${link(U.ministryRail, "resoluciones del Ministerio de Transportes")}.`,
        en: `Not published yet. Rodalies' will appear on the ${link(U.treballMs, "Department of Business and Labour's minimum-services list")}; other trains' in the ${link(U.ministryRail, "Ministry of Transport's resolutions")}.`,
      },
    },
    advice: {
      ca: [`Si has de viatjar en tren el 17 o el 19, mira el dia abans l'horari de serveis mínims i, el mateix dia, ${link(U.rodaliesStatus, "l'estat del servei")}.`],
      es: [`Si tienes que viajar en tren el 17 o el 19, mira la víspera el horario de servicios mínimos y, el mismo día, ${link(U.rodaliesStatus, "el estado del servicio")}.`],
      en: [`If you travel by train on the 17th or 19th, check the minimum-service timetable the day before and, on the day, ${link(U.rodaliesStatus, "the live service status")}.`],
    },
    sources: [
      { name: "Huelga en Adif los días 17 y 19 de noviembre (comunicado 33, 06/11/2026)", url: U.scfAdif, publisher: "Sindicato de Circulación Ferroviario (SCF)" },
      { name: "Encuentro con el ministro Carlos Cuerpo: Ni una tragedia más (05/11/2026)", url: U.semafCuerpo, publisher: "SEMAF" },
      { name: "Comunicado 80/2026: modificación de las fechas de huelga de noviembre de 2026 (04/11/2026)", url: U.alferro80, publisher: "ALFERRO" },
      { name: "Serveis mínims de vagues", url: U.treballMs, publisher: "Departament d'Empresa i Treball" },
      { name: "Resoluciones de servicios mínimos ferroviarios", url: U.ministryRail, publisher: "Ministerio de Transportes y Movilidad Sostenible" },
    ],
  },
  {
    id: "vaga-educacio-2026-11-26",
    dates: ["2026-11-26"],
    scope: "education",
    affects: ["schools"],
    title: {
      ca: "vaga a l'educació (USTEC·STEs, CGT)",
      es: "huelga en la educación (USTEC·STEs, CGT)",
      en: "education strike (USTEC·STEs, CGT)",
    },
    short: {
      ca: "vaga a l'educació anunciada pels sindicats USTEC·STEs i CGT Ensenyament",
      es: "huelga en la educación anunciada por los sindicatos USTEC·STEs y CGT Ensenyament",
      en: "education strike announced by the teachers' unions USTEC·STEs and CGT Ensenyament",
    },
    label: { ca: "educació el 26 de novembre", es: "educación el 26 de noviembre", en: "schools on 26 November" },
    facts: {
      ca: [
        `**Convocatòria:** el sindicat docent USTEC·STEs, que la va anunciar el 28 d'octubre de 2026 en ${link(U.ustec26, "el seu comunicat «Aquest novembre, blindem la pública!»")} («El 26N, vaga educativa»), i CGT Ensenyament, que el mateix dia ${link(U.cgtEns26, "crida a preparar")} «la vaga educativa del 26 de novembre».`,
        `**Amb qui:** segons ${link(U.edu26Joint, "la nota de premsa conjunta del 28 d'octubre")}, el calendari de mobilitzacions el marquen USTEC·STEs, la CGT, La Intersindical, la COS i la CNT amb l'Assemblea Educativa de Catalunya, i el 26 de novembre hi consta com a «vaga de les treballadores de l'educació».`,
        "**Dia:** dijous 26 de novembre de 2026, dia lectiu. Els sindicats encara no n'han publicat l'horari ni a quin personal es convoca exactament.",
        "**Abans:** el dissabte 21 de novembre, USTEC·STEs crida a una gran manifestació de la comunitat educativa a Barcelona, «en defensa de l'educació pública» segons la nota conjunta, que diu que els sindicats en concretaran els detalls més endavant.",
      ],
      es: [
        `**Convocatoria:** el sindicato docente USTEC·STEs, que la anunció el 28 de octubre de 2026 en ${link(U.ustec26, "su comunicado «Aquest novembre, blindem la pública!»")} («El 26N, vaga educativa»), y CGT Ensenyament, que ese mismo día ${link(U.cgtEns26, "llama a preparar")} «la vaga educativa del 26 de novembre».`,
        `**Con quién:** según ${link(U.edu26Joint, "la nota de prensa conjunta del 28 de octubre")}, el calendario de movilizaciones lo marcan USTEC·STEs, la CGT, La Intersindical, la COS y la CNT con la Assemblea Educativa de Catalunya, y el 26 de noviembre figura en él como «vaga de les treballadores de l'educació» (huelga de las trabajadoras de la educación).`,
        "**Día:** jueves 26 de noviembre de 2026, día lectivo. Los sindicatos aún no han publicado el horario ni a qué personal se convoca exactamente.",
        "**Antes:** el sábado 21 de noviembre, USTEC·STEs llama a una gran manifestación de la comunidad educativa en Barcelona, «en defensa de l'educació pública» según la nota conjunta, que dice que los sindicatos concretarán los detalles más adelante.",
      ],
      en: [
        `**Called by:** the teachers' union USTEC·STEs, which announced it on 28 October 2026 in ${link(U.ustec26, "its statement \"Aquest novembre, blindem la pública!\"")} ("El 26N, vaga educativa"), and CGT Ensenyament, which on the same day ${link(U.cgtEns26, "called on staff to prepare")} "la vaga educativa del 26 de novembre".`,
        `**With whom:** according to ${link(U.edu26Joint, "the joint press release of 28 October")}, the calendar of protests is set by USTEC·STEs, CGT, La Intersindical, COS and CNT together with the Assemblea Educativa de Catalunya, and it lists 26 November as a "vaga de les treballadores de l'educació" (a strike of education workers).`,
        "**Day:** Thursday 26 November 2026, a school day. The unions have not yet published the hours or exactly which staff are called out.",
        "**Before that:** on Saturday 21 November, USTEC·STEs is calling a large demonstration of the school community in Barcelona, \"en defensa de l'educació pública\" (in defence of state education) according to the joint release, which says the unions will give the details later.",
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
        ca: `**Encara no s'han publicat** (consultat el 5 de novembre de 2026 a la ${link(U.treballMs, "llista de vagues amb serveis mínims del Departament d'Empresa i Treball")}). A les escoles i els instituts públics els fixa el Departament d'Empresa i Treball per ordre: per a la vaga a l'educació del 8 de setembre de 2026, l'ordre es va signar el 3 de setembre, cinc dies abans. Els afegirem aquí quan surtin.`,
        es: `**Aún no se han publicado** (consultado el 5 de noviembre de 2026 en la ${link(U.treballMs, "lista de huelgas con servicios mínimos del Departament d'Empresa i Treball")}). En las escuelas e institutos públicos los fija el Departament d'Empresa i Treball por orden: para la huelga en la educación del 8 de septiembre de 2026, la orden se firmó el 3 de septiembre, cinco días antes. Los añadiremos aquí en cuanto salgan.`,
        en: `**Not published yet** (checked on 5 November 2026 on the ${link(U.treballMs, "Department of Business and Labour's list of strikes with minimum services")}). For state schools, the Department of Business and Labour sets them by order: for the education strike of 8 September 2026, the order was signed on 3 September, five days before. We will add them here as soon as they are out.`,
      },
    },
    advice: {
      ca: ["Famílies: l'escola no tanca, però alguns docents poden fer vaga. Quan surti l'ordre de serveis mínims, l'escola us dirà què pot garantir aquell dia."],
      es: ["Familias: la escuela no cierra, pero algunos docentes pueden hacer huelga. Cuando salga la orden de servicios mínimos, la escuela os dirá qué puede garantizar ese día."],
      en: ["Parents: schools do not close, but some teachers may strike. Once the minimum-services order is out, your school will tell you what it can provide that day."],
    },
    sources: [
      { name: "Aquest novembre, blindem la pública! (28/10/2026)", url: U.ustec26, publisher: "USTEC·STEs" },
      { name: "Al novembre, tornem al carrer: el conflicte educatiu segueix viu! (28/10/2026)", url: U.cgtEns26, publisher: "CGT Ensenyament" },
      { name: "Nota de premsa conjunta: nou calendari de mobilitzacions aprovat a la 9a Assemblea Educativa de Catalunya (28/10/2026, PDF)", url: U.edu26Joint, publisher: "CGT Ensenyament" },
    ],
    guide: "strikeEducation",
  },
];

/* -------------------------------------------------------------------------- */
/* Date logic (deterministic: only STRIKES_AS_OF decides upcoming vs past)    */
/* -------------------------------------------------------------------------- */

/** An indefinite strike nobody has recorded as over. */
export function isOpen(strike: Strike): boolean {
  return Boolean(strike.indefinite) && !strike.indefinite?.endedOn;
}

/** The last day of action; for an indefinite strike, the day it ended (or its first day while it is open). */
export function lastDay(strike: Strike): string {
  return strike.indefinite?.endedOn ?? strike.dates[strike.dates.length - 1] ?? "";
}

/** Upcoming or under way on `asOf`; past from the day after its last day. An open indefinite strike is never past. */
export function isUpcoming(strike: Strike, asOf: string): boolean {
  return isOpen(strike) || lastDay(strike) >= asOf;
}

/** Whether `asOf` is a day of action: one of its dates, or any day of an indefinite strike once it has begun. */
export function isOnDay(strike: Strike, asOf: string): boolean {
  if (strike.indefinite) return (strike.dates[0] ?? "") <= asOf && (isOpen(strike) || asOf <= lastDay(strike));
  return strike.dates.includes(asOf);
}

/** Days between two ISO dates (b - a). */
function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86_400_000);
}

/** An open indefinite strike must be re-checked on the organiser at least this often. */
export const OPEN_STRIKE_RECHECK_DAYS = 7;

/** Open indefinite strikes the page has not re-checked for more than a week on `today`. */
export function unrecheckedOpenStrikes(today: string, asOf: string = STRIKES_AS_OF, strikes: Strike[] = STRIKES): Strike[] {
  return strikes.filter((strike) => isOpen(strike) && daysBetween(asOf, today) > OPEN_STRIKE_RECHECK_DAYS);
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
  return upcomingStrikes(asOf, strikes).filter((strike) => !isOpen(strike) && lastDay(strike) < today);
}

const AND: Record<Locale, string> = { ca: " i ", es: " y ", en: " and " };
const FROM: Record<Locale, string> = { ca: "des del ", es: "desde el ", en: "from " };
const TO: Record<Locale, string> = { ca: " fins al ", es: " hasta el ", en: " to " };

/**
 * "dijous 29 d'octubre de 2026" / "divendres 30 d'octubre i dilluns 2 de
 * novembre de 2026"; an indefinite strike: "des del dimecres 28 d'octubre de
 * 2026", or "des del ... fins al ..." once it has ended.
 */
export function strikeDays(strike: Strike, locale: Locale): string {
  if (strike.indefinite) {
    const first = strike.dates[0] ?? "";
    const end = strike.indefinite.endedOn;
    if (!end) return `${FROM[locale]}${dayDate(first, locale)}`;
    return `${FROM[locale]}${dayDate(first, locale, first.slice(0, 4) !== end.slice(0, 4))}${TO[locale]}${dayDate(end, locale)}`;
  }
  const last = strike.dates.length - 1;
  return andList(strike.dates.map((iso, index) => dayDate(iso, locale, index === last)), locale);
}

/** "A i B"; from three items on, "A, B i C". */
export function andList(items: string[], locale: Locale): string {
  return items.length <= 2 ? items.join(AND[locale]) : `${items.slice(0, -1).join(", ")}${AND[locale]}${items[items.length - 1]}`;
}

/** "del dimarts 10 ..." / "de la vaga indefinida ..." : after "Serveis mínims". */
function strikeRef(strike: Strike, locale: Locale): string {
  const days = strikeDays(strike, locale);
  if (strike.indefinite) return { ca: `de la ${strike.title.ca}`, es: `de la ${strike.title.es}`, en: `for the ${strike.title.en}` }[locale];
  return { ca: `del ${days}`, es: `del ${days}`, en: `on ${days}` }[locale];
}

/** "el dimarts 10 ..." / "durant la vaga indefinida ...": after "Què cal fer". */
function strikeWhen(strike: Strike, locale: Locale): string {
  const days = strikeDays(strike, locale);
  if (strike.indefinite) return { ca: `durant la ${strike.title.ca}`, es: `durante la ${strike.title.es}`, en: `during the ${strike.title.en}` }[locale];
  return { ca: `el ${days}`, es: `el ${days}`, en: `on ${days}` }[locale];
}

const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

const DESCRIPTION_LIMIT = 155;

// 3 Nov 2026: the closing line says "today" (avui/hoy), the word the hub's
// top queries carry ("huelga hoy", "hoy hay huelga", "vaga avui"); ES drops
// "oficiales" so Renfe's 10 and 12 Nov still fit beside the general strike.

const DESCRIPTION: Record<Locale, { prefix: string; base: string; fallback: string }> = {
  ca: {
    prefix: "Vagues: ",
    base: "Què funciona avui i serveis mínims oficials.",
    fallback: "Què funciona a Catalunya els dies de vaga: Rodalies, metro, bus, escoles i salut, qui fixa els serveis mínims i on es publiquen.",
  },
  es: {
    prefix: "Huelgas: ",
    base: "Qué funciona hoy y servicios mínimos.",
    fallback: "Qué funciona en Cataluña los días de huelga: Rodalies, metro, bus, escuelas y salud, quién fija los servicios mínimos y dónde se publican.",
  },
  en: {
    prefix: "Strikes: ",
    base: "What runs in Barcelona today and official minimum services.",
    fallback: "What runs in Barcelona and Catalonia on strike days: Rodalies, metro, buses, schools and health, and where official minimum services are published.",
  },
};

/** General strikes first, then strikes in progress, then those touching more services, then by date. */
function descriptionRank(strike: Strike): number[] {
  return [strike.scope === "general" ? 0 : 1, isOpen(strike) ? 0 : 1, -strike.affects.length];
}

/**
 * The meta description names the strikes in progress and the next ones,
 * general strikes first, as many as fit in 155 characters, printed in date
 * order. With none upcoming it falls back to the evergreen line.
 */
export function strikesDescription(locale: Locale, asOf: string = STRIKES_AS_OF, strikes: Strike[] = STRIKES): string {
  const { prefix, base, fallback } = DESCRIPTION[locale];
  const ranked = [...upcomingStrikes(asOf, strikes)].sort((a, b) => {
    const ra = descriptionRank(a);
    const rb = descriptionRank(b);
    for (let i = 0; i < ra.length; i += 1) if (ra[i] !== rb[i]) return (ra[i] ?? 0) - (rb[i] ?? 0);
    return (a.dates[0] ?? "").localeCompare(b.dates[0] ?? "");
  });
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
    title: "Vaga avui i demà a Catalunya: què funciona, serveis mínims i calendari de vagues",
    seoTitle: "Vaga avui i demà a Catalunya: què funciona i serveis mínims",
    excerpt:
      "Les vagues en curs i les properes que afecten Catalunya, què funciona cada dia (Rodalies, metro, bus, sanitat, escoles) i els serveis mínims oficials.",
  },
  es: {
    path: "guias/huelga-hoy-cataluna",
    title: "Huelga hoy y mañana en Cataluña: qué funciona, servicios mínimos y calendario de huelgas",
    seoTitle: "Huelga hoy y mañana en Cataluña: qué funciona y calendario",
    excerpt:
      "Las huelgas en curso y las próximas que afectan a Cataluña, qué funciona cada día (Rodalies, metro, bus, sanidad, colegios) y los servicios mínimos oficiales.",
  },
  en: {
    path: "guides/strike-barcelona-catalonia-today",
    title: "Barcelona and Catalonia strike today: trains, metro, what runs and the next strikes",
    seoTitle: "Barcelona strike today: trains, metro and what runs",
    excerpt:
      "Strikes under way and coming up in Barcelona and Catalonia, what runs on each day (trains, metro, buses, health, schools) and the official minimum services.",
  },
};

/* -------------------------------------------------------------------------- */
/* Copy                                                                       */
/* -------------------------------------------------------------------------- */

type Copy = {
  /** Strikes under way on the as-of day. */
  leadNow: (items: string, date: string) => string;
  leadNoneNow: (date: string) => string;
  /** Strikes that start after the as-of day. */
  leadNext: (items: string) => string;
  leadNone: (date: string) => string;
  /** `refs`: "del dimarts 10 ... i del dimecres 11 ...". */
  pending: (refs: string) => string;
  /** "Metro, bus and FGC": `refs` of the strikes that touch them, or none. */
  cityTransport: (refs: string[]) => string;
  runsHeading: string;
  runsCaption: string;
  runsHeaders: [string, string];
  services: Record<ServiceKey, string>;
  noStrike: string;
  runsNote: (date: string) => string;
  keyFactsTitle: string;
  /** One sentence under the answer: the daily page, which works out today's strikes, holiday and Rodalies notices. */
  today: string;
  dataTitle: string;
  data: string;
  /** `ref`: "del dimarts 10 ..." / "de la vaga indefinida ...". */
  msHeading: (ref: string) => string;
  /** `when`: "el dimarts 10 ..." / "durant la vaga indefinida ...". */
  adviceHeading: (when: string) => string;
  pastHeading: string;
  pastIntro: string;
  msLabel: string;
  /** Label of the last item of a strike's facts when it has a guide of its own. */
  guideLabel: string;
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
  faqMsQ: (when: string) => string;
  faqStatic: { question: string; answer: string }[];
};

const COPY: Record<Locale, Copy> = {
  ca: {
    leadNow: (items, date) => `**Vagues en curs a Catalunya el ${date}, segons les fonts oficials:** ${items}.`,
    leadNoneNow: (date) => `**El ${date} no hi havia cap vaga en curs a Catalunya a les fonts oficials.**`,
    leadNext: (items) => `**Properes vagues:** ${items}.`,
    leadNone: (date) => `**No hi ha cap vaga anunciada que afecti Catalunya a les fonts oficials consultades el ${date}.** Quan se'n convoqui una, l'afegirem aquí amb els serveis mínims oficials.`,
    pending: (refs) => `Els serveis mínims ${refs} encara no s'han publicat: es fixen per ordre o resolució pocs dies abans.`,
    cityTransport: (refs) =>
      refs.length === 0
        ? "**Metro, bus i FGC:** cap d'aquestes vagues no els afecta."
        : `**Metro, bus i FGC:** de totes aquestes vagues, només els ${refs.length === 1 ? "afecta la" : "afecten les"} ${refs.join(" i ")}.`,
    runsHeading: "Què funciona: les vagues anunciades, servei per servei",
    runsCaption: "Quines vagues anunciades afecten cada servei",
    runsHeaders: ["Servei", "Vagues anunciades que l'afecten"],
    services: {
      rodalies: "Rodalies i regionals",
      metroBus: "Metro i autobusos de TMB",
      fgcTram: "FGC i tramvia",
      longDistance: "Alta velocitat i llarga distància (Renfe, Ouigo)",
      health: "Hospitals, CAP i urgències",
      schools: "Escoles i llars d'infants",
    },
    noStrike: "Cap vaga anunciada",
    runsNote: (date) => `Consultat el ${date}. Els serveis mínims de cada vaga són a la seva secció, més avall.`,
    keyFactsTitle: "Les vagues, d'un cop d'ull",
    today: `Si només vols saber què passa avui, [${TODAY_NAME.ca}](${todayPath("ca")}) diu en una sola pàgina si hi ha vaga, si és festiu i quins avisos té Rodalies.`,
    dataTitle: verifiedLine("ca", STRIKES_VERIFIED),
    data: "Només hi posem el que publiquen els sindicats convocants, els operadors i el DOGC o el BOE, i no el que avança la premsa. Cada vaga té la seva secció, amb data, i quan passa queda a la llista de vagues anteriors.",
    msHeading: (ref) => `Serveis mínims ${ref}`,
    adviceHeading: (when) => `Què cal fer ${when}`,
    pastHeading: "Vagues anteriors",
    pastIntro: "El que s'havia anunciat i publicat abans de cada vaga, tal com era a les fonts oficials.",
    msLabel: "Serveis mínims",
    guideLabel: "Tot sobre aquesta vaga",
    howHeading: "Com funcionen els serveis mínims a Catalunya",
    how: [
      `El dret de vaga el reconeix ${link(U.constitution, "l'article 28.2 de la Constitució")}, que també demana que la llei garanteixi «el mantenimiento de los servicios esenciales de la comunidad». El ${link(U.rdl17, "Reial decret llei 17/1977")} hi afegeix dues regles: una vaga s'ha de comunicar a l'empresa i a l'autoritat laboral amb cinc dies naturals d'antelació, o deu si afecta serveis públics (articles 3 i 4), i l'autoritat governativa pot acordar les mesures necessàries per assegurar el funcionament dels serveis (article 10.2). Per això una vaga que afecta serveis públics, com el transport, s'anuncia com a mínim deu dies abans.`,
      `A Catalunya, d'acord amb el ${link(U.decret120, "Decret 120/1995")}, els fixa la persona titular del Departament d'Empresa i Treball, tant en les vagues d'empreses i entitats que presten serveis essencials de competència de la Generalitat com en les del personal de la mateixa Generalitat, tal com recullen les ordres de serveis mínims publicades al DOGC. Ho fa amb una ordre per a cada vaga que fixa, servei per servei, un percentatge o una plantilla mínima: transport de viatgers, urgències i hospitals, centres de salut, escoles, farmàcies de guàrdia, aigua, llum i gas, o la mateixa Administració.`,
      `Els serveis de l'Estat, com els trens d'alta velocitat i de llarga distància, tenen els serveis mínims que fixa el Govern espanyol: per a la vaga d'Ouigo de la tardor del 2026, el Ministeri de Transports. Pel que fa als aeroports, les ordres de la Generalitat només fixen l'operativa dels que gestiona ella, Lleida-Alguaire i Andorra-la Seu d'Urgell: per als vols del Prat, Girona i Reus, que són d'Aena, el que compta és el que publiquin Aena i la companyia aèria. Les vagues del personal de terra d'aquests aeroports també tenen els serveis mínims que fixa el Ministeri de Transports: per a la vaga indefinida convocada per CGT a Groundforce, al Prat, des del 4 d'agost de 2026, ${link(U.groundforce, "la seva resolució")} protegeix al novembre el 77% dels vols que atén aquesta empresa amb les Balears, les Canàries, Ceuta i Melilla, el 55% dels internacionals i dels nacionals a més de cinc hores en transport públic i el 34% de la resta, i és vigent fins al 30 de novembre de 2026.`,
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
    faqToday: (items, date) => `Aquesta pàgina es va actualitzar el ${date}. Les vagues anunciades que afecten Catalunya, en curs i properes, són: ${items}.`,
    faqTodayNone: (date) => `Aquesta pàgina es va actualitzar el ${date} i en aquell moment no hi havia cap vaga anunciada que afectés Catalunya a les fonts oficials que seguim.`,
    faqMsQ: (when) => `Quins serveis mínims hi ha ${when}?`,
    faqStatic: [
      { question: "Qui fixa els serveis mínims a Catalunya?", answer: "El Departament d'Empresa i Treball de la Generalitat, per ordre publicada al DOGC, en els serveis de competència de la Generalitat: Rodalies, metro, autobusos, FGC, escoles, sanitat pública i la mateixa Administració. Els serveis de l'Estat, com l'alta velocitat i la llarga distància, els fixa el Govern espanyol." },
      { question: "Quan es publiquen els serveis mínims?", answer: "Pocs dies abans de la vaga. A les vagues generals del 2024, l'ordre es va signar dos o tres dies abans i el DOGC la va publicar entre dos dies abans i el mateix dia de la vaga." },
      { question: "Funciona el metro els dies de vaga?", answer: "Si la vaga afecta TMB, el metro funciona amb els serveis mínims que fixi la Generalitat; a la vaga general del 27 de setembre de 2024 van ser el 85% del servei. Una vaga només de Renfe no atura el metro." },
      { question: "Obren les escoles els dies de vaga general?", answer: "Sí. L'ordre de serveis mínims hi fixa un mínim de personal per centre, i és l'escola qui informa les famílies del que pot garantir." },
    ],
  },
  es: {
    leadNow: (items, date) => `**Huelgas en curso en Cataluña el ${date}, según las fuentes oficiales:** ${items}.`,
    leadNoneNow: (date) => `**El ${date} no había ninguna huelga en curso en Cataluña en las fuentes oficiales.**`,
    leadNext: (items) => `**Próximas huelgas:** ${items}.`,
    leadNone: (date) => `**No hay ninguna huelga anunciada que afecte a Cataluña en las fuentes oficiales consultadas el ${date}.** Cuando se convoque una, la añadiremos aquí con los servicios mínimos oficiales.`,
    pending: (refs) => `Los servicios mínimos ${refs} aún no se han publicado: se fijan por orden o resolución pocos días antes.`,
    cityTransport: (refs) =>
      refs.length === 0
        ? "**Metro, bus y FGC:** no les afecta ninguna de estas huelgas."
        : `**Metro, bus y FGC:** de todas estas huelgas, solo les ${refs.length === 1 ? "afecta la" : "afectan las"} ${refs.join(" y ")}.`,
    runsHeading: "Qué funciona: las huelgas anunciadas, servicio por servicio",
    runsCaption: "Qué huelgas anunciadas afectan a cada servicio",
    runsHeaders: ["Servicio", "Huelgas anunciadas que le afectan"],
    services: {
      rodalies: "Rodalies y regionales",
      metroBus: "Metro y autobuses de TMB",
      fgcTram: "FGC y tranvía",
      longDistance: "Alta velocidad y larga distancia (Renfe, Ouigo)",
      health: "Hospitales, CAP y urgencias",
      schools: "Colegios y guarderías",
    },
    noStrike: "Ninguna huelga anunciada",
    runsNote: (date) => `Consultado el ${date}. Los servicios mínimos de cada huelga están en su sección, más abajo.`,
    keyFactsTitle: "Las huelgas, de un vistazo",
    today: `Si solo quieres saber qué pasa hoy, [${TODAY_NAME.es}](${todayPath("es")}) dice en una sola página si hay huelga, si es festivo y qué avisos tiene Rodalies.`,
    dataTitle: verifiedLine("es", STRIKES_VERIFIED),
    data: "Solo ponemos lo que publican los sindicatos convocantes, los operadores y el DOGC o el BOE, no lo que adelanta la prensa. Cada huelga tiene su sección, con fecha, y cuando pasa queda en la lista de huelgas anteriores.",
    msHeading: (ref) => `Servicios mínimos ${ref}`,
    adviceHeading: (when) => `Qué hacer ${when}`,
    pastHeading: "Huelgas anteriores",
    pastIntro: "Lo que se había anunciado y publicado antes de cada huelga, tal como estaba en las fuentes oficiales.",
    msLabel: "Servicios mínimos",
    guideLabel: "Todo sobre esta huelga",
    howHeading: "Cómo funcionan los servicios mínimos en Cataluña",
    how: [
      `El derecho de huelga lo reconoce ${link(U.constitution, "el artículo 28.2 de la Constitución")}, que también pide que la ley garantice «el mantenimiento de los servicios esenciales de la comunidad». El ${link(U.rdl17, "Real Decreto-ley 17/1977")} añade dos reglas: una huelga debe comunicarse a la empresa y a la autoridad laboral con cinco días naturales de antelación, o diez si afecta a servicios públicos (artículos 3 y 4), y la autoridad gubernativa puede acordar las medidas necesarias para asegurar el funcionamiento de los servicios (artículo 10.2). Por eso una huelga que afecta a servicios públicos, como el transporte, se anuncia como mínimo diez días antes.`,
      `En Cataluña, de acuerdo con el ${link(U.decret120, "Decret 120/1995")}, los fija la persona titular del Departament d'Empresa i Treball, tanto en las huelgas de empresas y entidades que prestan servicios esenciales de competencia de la Generalitat como en las del personal de la propia Generalitat, tal como recogen las órdenes de servicios mínimos publicadas en el DOGC. Lo hace con una orden para cada huelga que fija, servicio por servicio, un porcentaje o una plantilla mínima: transporte de viajeros, urgencias y hospitales, centros de salud, escuelas, farmacias de guardia, agua, luz y gas, o la propia Administración.`,
      `Los servicios del Estado, como los trenes de alta velocidad y de larga distancia, tienen los servicios mínimos que fija el Gobierno de España: para la huelga de Ouigo del otoño de 2026, el Ministerio de Transportes. En cuanto a los aeropuertos, las órdenes de la Generalitat solo fijan la operativa de los que gestiona ella, Lleida-Alguaire y Andorra-La Seu d'Urgell: para los vuelos de El Prat, Girona y Reus, que son de Aena, lo que cuenta es lo que publiquen Aena y la compañía aérea. Las huelgas del personal de tierra de esos aeropuertos también tienen los servicios mínimos que fija el Ministerio de Transportes: para la huelga indefinida convocada por CGT en Groundforce, en El Prat, desde el 4 de agosto de 2026, ${link(U.groundforce, "su resolución")} protege en noviembre el 77% de los vuelos que atiende esa empresa con Baleares, Canarias, Ceuta y Melilla, el 55% de los internacionales y de los nacionales a más de cinco horas en transporte público y el 34% del resto, y está vigente hasta el 30 de noviembre de 2026.`,
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
    faqToday: (items, date) => `Esta página se actualizó el ${date}. Las huelgas anunciadas que afectan a Cataluña, en curso y próximas, son: ${items}.`,
    faqTodayNone: (date) => `Esta página se actualizó el ${date} y en ese momento no había ninguna huelga anunciada que afectara a Cataluña en las fuentes oficiales que seguimos.`,
    faqMsQ: (when) => `¿Qué servicios mínimos hay ${when}?`,
    faqStatic: [
      { question: "¿Quién fija los servicios mínimos en Cataluña?", answer: "El Departament d'Empresa i Treball de la Generalitat, por orden publicada en el DOGC, en los servicios de competencia de la Generalitat: Rodalies, metro, autobuses, FGC, escuelas, sanidad pública y la propia Administración. Los servicios del Estado, como la alta velocidad y la larga distancia, los fija el Gobierno de España." },
      { question: "¿Cuándo se publican los servicios mínimos?", answer: "Pocos días antes de la huelga. En las huelgas generales de 2024, la orden se firmó dos o tres días antes y el DOGC la publicó entre dos días antes y el mismo día de la huelga." },
      { question: "¿Funciona el metro los días de huelga?", answer: "Si la huelga afecta a TMB, el metro funciona con los servicios mínimos que fije la Generalitat; en la huelga general del 27 de septiembre de 2024 fueron el 85% del servicio. Una huelga solo de Renfe no para el metro." },
      { question: "¿Abren los colegios los días de huelga general?", answer: "Sí. La orden de servicios mínimos fija un mínimo de personal por centro, y es la escuela quien informa a las familias de lo que puede garantizar." },
    ],
  },
  en: {
    leadNow: (items, date) => `**Strikes under way in Barcelona and Catalonia on ${date}, according to the official sources:** ${items}.`,
    leadNoneNow: (date) => `**On ${date} no strike was under way in Catalonia, according to the official sources.**`,
    leadNext: (items) => `**Coming up:** ${items}.`,
    leadNone: (date) => `**No strike affecting Catalonia had been announced in the official sources checked on ${date}.** When one is called, we will add it here with the official minimum services.`,
    pending: (refs) => `Minimum services ${refs} have not been published yet: they are set by an order or resolution a few days before.`,
    cityTransport: (refs) =>
      refs.length === 0
        ? "**Metro, buses and FGC:** none of these strikes affects them."
        : `**Metro, buses and FGC:** of these strikes, only the ${refs.join(" and the ")} ${refs.length === 1 ? "affects" : "affect"} them.`,
    runsHeading: "What runs: the announced strikes, service by service",
    runsCaption: "Which announced strikes affect each service",
    runsHeaders: ["Service", "Announced strikes that affect it"],
    services: {
      rodalies: "Rodalies and regional trains",
      metroBus: "TMB metro and buses",
      fgcTram: "FGC and tram",
      longDistance: "High-speed and long-distance trains (Renfe, Ouigo)",
      health: "Hospitals, health centres and A&E",
      schools: "Schools and nurseries",
    },
    noStrike: "No strike announced",
    runsNote: (date) => `Checked on ${date}. Each strike's minimum services are in its own section below.`,
    keyFactsTitle: "The strikes at a glance",
    today: `If you only need today, [${TODAY_NAME.en}](${todayPath("en")}) shows on one page whether there is a strike, whether it is a public holiday and what Rodalies is warning about.`,
    dataTitle: verifiedLine("en", STRIKES_VERIFIED),
    data: "We only print what the unions calling a strike, the operators and the official gazettes (DOGC, BOE) publish, never what the press reports ahead of them. Each strike has its own dated section, which moves to the list of past strikes once it is over.",
    msHeading: (ref) => `Minimum services ${ref}`,
    adviceHeading: (when) => `What to do ${when}`,
    pastHeading: "Past strikes",
    pastIntro: "What had been announced and published before each strike, as it stood in the official sources.",
    msLabel: "Minimum services",
    guideLabel: "Everything about this strike",
    howHeading: "How minimum services work in Catalonia",
    how: [
      `The right to strike is recognised by ${link(U.constitution, "Article 28.2 of the Spanish Constitution")}, which also requires the law to guarantee "el mantenimiento de los servicios esenciales de la comunidad" (that the community's essential services keep running). ${link(U.rdl17, "Royal Decree-Law 17/1977")} adds two rules: a strike must be notified to the employer and the labour authority five calendar days ahead, or ten if it affects public services (Articles 3 and 4), and the government authority may take the measures needed to keep services running (Article 10.2). That is why a strike affecting public services, such as transport, is announced at least ten days in advance.`,
      `In Catalonia, under ${link(U.decret120, "Decree 120/1995")}, they are set by the head of the Generalitat's Department of Business and Labour (Departament d'Empresa i Treball), both for strikes at companies that provide essential services within the Generalitat's powers and for strikes by the Generalitat's own staff, as the minimum-services orders published in the DOGC state. The department issues one order per strike, setting a percentage or a minimum headcount service by service: public transport, A&E and hospitals, health centres, schools, duty pharmacies, water, electricity and gas, and the administration itself.`,
      `State services such as high-speed and long-distance trains get their minimum services from the Spanish government: for Ouigo's strike in autumn 2026, the Ministry of Transport. As for airports, the Generalitat's orders only set the operations of the two it runs itself, Lleida-Alguaire and Andorra-La Seu d'Urgell: for flights at Barcelona-El Prat, Girona and Reus, which Aena runs, what counts is what Aena and your airline publish. Strikes by ground staff at those airports also get their minimum services from the Ministry of Transport: for the indefinite strike CGT called at Groundforce, at El Prat, from 4 August 2026, ${link(U.groundforce, "its resolution")} protects, in November, 77% of the flights that company handles to and from the Balearic and Canary Islands, Ceuta and Melilla, 55% of international flights and of domestic ones over five hours away by public transport, and 34% of the rest; it runs until 30 November 2026.`,
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
    faqToday: (items, date) => `This page was last updated on ${date}. The strikes announced that affect Catalonia, under way or coming up, are: ${items}.`,
    faqTodayNone: (date) => `This page was last updated on ${date}, when no strike affecting Catalonia had been announced in the official sources we follow.`,
    faqMsQ: (when) => `What minimum services are there ${when}?`,
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

/** "vaga del dimecres 11 ..." / the title of an indefinite strike: for the metro, bus and FGC line. */
function strikeName(strike: Strike, locale: Locale): string {
  if (strike.indefinite) return strike.title[locale];
  const days = strikeDays(strike, locale);
  return { ca: `vaga del ${days}`, es: `huelga del ${days}`, en: `strike on ${days}` }[locale];
}

/** One row per service: the upcoming strikes that touch it, in date order, or "none". */
export function whatRunsRows(locale: Locale, asOf: string = STRIKES_AS_OF, strikes: Strike[] = STRIKES): string[][] {
  const t = COPY[locale];
  const upcoming = upcomingStrikes(asOf, strikes);
  return SERVICE_KEYS.map((key) => {
    const touching = upcoming.filter((strike) => strike.affects.includes(key));
    return [t.services[key], touching.length > 0 ? touching.map((strike) => `${cap(strikeDays(strike, locale))}: ${strike.title[locale]}`).join("; ") : t.noStrike];
  });
}

export function buildStrikesBody(locale: Locale, asOf: string = STRIKES_AS_OF, strikes: Strike[] = STRIKES): Block[] {
  const t = COPY[locale];
  const upcoming = upcomingStrikes(asOf, strikes);
  const past = pastStrikes(asOf, strikes);
  const checked = dayDate(asOf, locale);
  const checkedShort = dateYear(asOf, locale);
  const items = upcoming.map((strike) => `${strikeDays(strike, locale)}, ${strike.short[locale]}`).join("; ");
  const pending = upcoming.filter((strike) => strike.minimumServices.status === "pending");
  const city = upcoming.filter((strike) => strike.affects.includes("metroBus") || strike.affects.includes("fgcTram"));

  const blocks: Block[] = [];

  if (upcoming.length > 0) {
    const pendingLine = pending.length > 0 ? t.pending(andList(pending.map((strike) => strikeRef(strike, locale)), locale)) : "";
    const now = upcoming.filter((strike) => isOnDay(strike, asOf));
    const next = upcoming.filter((strike) => !isOnDay(strike, asOf));
    const nowLine =
      now.length > 0 ? t.leadNow(now.map((strike) => `${strike.title[locale]}, ${strikeDays(strike, locale)}`).join("; "), checked) : t.leadNoneNow(checked);
    const nextLine = next.length > 0 ? t.leadNext(next.map((strike) => `${strikeDays(strike, locale)}, ${strike.short[locale]}`).join("; ")) : "";
    blocks.push(lead([nowLine, nextLine, t.cityTransport(city.map((strike) => strikeName(strike, locale))), pendingLine].filter(Boolean).join(" ")));
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
    blocks.push(lead(t.leadNone(checkedShort)));
  }

  // 3 Nov 2026: "En català · En castellano · In English", under the answer.
  // Catalan "vaga" queries land on the Spanish edition (hreflang follows the
  // Google interface language); this line takes the reader to theirs.
  blocks.push(languageLinks());

  // 1 Nov 2026: the next step for "huelga hoy" readers is the daily page, which
  // answers for today's date from the same strike list. Under the answer, not in
  // the travel list below the fold.
  blocks.push(...paras(t.today));
  blocks.push(callout("official", t.dataTitle, t.data));

  if (upcoming.length > 0) {
    blocks.push(heading(2, t.runsHeading, "que-funciona"));
    blocks.push(table(t.runsCaption, [...t.runsHeaders], whatRunsRows(locale, asOf, strikes), t.runsNote(checkedShort)));
  }

  // 4 Nov 2026: a strike with a guide of its own links to it from its card,
  // as the card's last fact (the 11N entry links its page from its facts).
  const guideItem = (strike: Strike): string[] =>
    strike.guide ? [`**${t.guideLabel}:** ${b2link(strike.guide, locale, B2_TITLES[strike.guide][locale])}.`] : [];

  for (const strike of upcoming) {
    const days = strikeDays(strike, locale);
    blocks.push(heading(2, `${cap(days)}: ${strike.title[locale]}`, strike.id));
    blocks.push(list(...strike.facts[locale], ...guideItem(strike)));
    // 6 Nov 2026: the general strike's pages for the rest of Spain (Spanish
    // only, strike-11n-cities.ts), linked from the Spanish edition's 11N card.
    if (locale === "es" && strike.id === "vaga-general-2026-11-11") {
      blocks.push(...paras(`**Fuera de Cataluña:** servicios mínimos y qué funciona el 11 de noviembre en ${strike11nCityLinks()}.`));
    }
    blocks.push(...h3(t.msHeading(strikeRef(strike, locale)), strike.minimumServices.text[locale]));
    if (strike.advice[locale].length > 0) {
      blocks.push(heading(3, t.adviceHeading(strikeWhen(strike, locale))));
      blocks.push(list(...strike.advice[locale]));
    }
  }

  if (past.length > 0) {
    blocks.push(...h2(t.pastHeading, t.pastIntro));
    for (const strike of past) {
      const days = strikeDays(strike, locale);
      blocks.push(heading(3, `${cap(days)}: ${strike.title[locale]}`, strike.id));
      blocks.push(list(...strike.facts[locale], `**${t.msLabel}:** ${strike.minimumServices.text[locale]}`, ...guideItem(strike)));
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
      ? { question: t.faqTodayQ, answer: strip(t.faqToday(items, checkedShort)) }
      : { question: t.faqTodayQ, answer: strip(t.faqTodayNone(checkedShort)) },
    ...upcoming.map((strike) => ({
      question: t.faqMsQ(strikeWhen(strike, locale)),
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
  { name: "Resolución de servicios mínimos en Groundforce BCN durante la huelga convocada por CGT (vigente del 1 de octubre al 30 de noviembre de 2026)", url: U.groundforce, publisher: "Ministerio de Transportes y Movilidad Sostenible" },
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
