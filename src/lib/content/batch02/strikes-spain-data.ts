import type { B2Source } from "./shared";
import { CITY_STATE_URLS } from "./strike-11n-cities-data";
import { STRIKE_URLS } from "./strikes";
import type { SpainNotHappening, SpainOpenStrike, SpainStrike } from "./strikes-spain-model";

/**
 * The facts of the Spain-wide strikes calendar (`strikes-spain.ts`): the file
 * the strike watch edits. The page builder and its wording live in
 * `strikes-spain.ts`; the shapes in `strikes-spain-model.ts`.
 *
 * Every URL below was fetched on 10 Nov 2026 with a browser User-Agent and
 * the fact it carries was read in the response:
 *  - Calls: the organiser's own notice (semaf.org, ccoo.es,
 *    ferroviario.fsc.ccoo.es, alferro.org, scf.es, ugt-fica.org, usca.es,
 *    cesm.org, sindicatodeestudiantes.net).
 *  - Minimum services: the BOE, the Ministry of Transport's lists of rail and
 *    air resolutions, and Renfe's own notices of what the Ministry set.
 *  - Figures that only exist inside a resolution's PDF are not restated: the
 *    PDF is linked and the page says what the Ministry's list says about it.
 *
 * Status discipline: "official" only with a registered call or an official
 * minimum-services order; everything else is "called", with its minimum
 * services "pending" (printed as "to be confirmed") until an order is out.
 *
 * Left out on 10 Nov 2026 because no official or organiser page carried the
 * fact: any Correos-only or justice-only strike, the Rodalies percentages of
 * the Generalitat's orders (its e-Tauler pages are scripts; the Catalan
 * guides carry them), and any strike in December or January (none found).
 */

/**
 * The day every source below was last read. Tests fail 4 days after it, and on the Monday after its week.
 *
 * 13 Nov 2026: every source re-read with a browser User-Agent. Changes: the
 * meat-industry strike's 12 and 13 Nov were called off on 12 Nov (UGT FICA
 * nº 3857, pre-agreement); the 17 Nov rail strike now lists the six unions
 * whose registered calls at Grupo Renfe the Generalitat's order of 12 Nov
 * cites (FeSMC-UGT, CCOO, SF-Intersindical, SEMAF, ALFERRO, SFF-CGT), SCF nº
 * 35 (12 Nov) keeps 17 and 19 Nov, CCOO (12 Nov) keeps the 17th. Unchanged:
 * the Ministry's rail list (no resolution for 17, 19 or 23 Nov) and air list
 * (SAERCO, Groundforce and Outsmart resolutions in force to 30 Nov), SEMAF
 * (newest 10 Nov), ALFERRO (newest 82/2026), Sindicato de Estudiantes (20N
 * call of 30 Oct, mobilisations at 12:00), CESM (indefinite strike still
 * postponed; on 12 Nov it also postponed its 21 Nov march).
 *
 * 16 Nov 2026 (~15:00): re-read. The 17 Nov rail strike is now "official":
 * the Ministry's resolution of 12 Nov for Grupo Renfe (Cercanías 75 % / 50 %,
 * Media Distancia 65 %, AVE-LD 72 %, freight 26 %; Renfe's notice of 14 Nov
 * agrees), its resolutions of 13 Nov for Iryo (70 %) and Ouigo (65,38 %),
 * listed on its air page, and the Basque Government's order of 13 Nov for
 * Cercanías Bilbao and San Sebastián (50 % / 25 %). SEMAF nº 2026-33 (14 Nov)
 * keeps the 17th and the 23rd. Unchanged: no resolution for Adif (17, 19) or
 * for 23 Nov; SCF (nº 36, 13 Nov), CCOO rail (13 Nov), ALFERRO, Sindicato de
 * Estudiantes (20N, 12:00), CESM (newest 13 Nov; strike still postponed),
 * UGT FICA (nothing new on poultry), the Ministry's air list (SAERCO,
 * Groundforce, Outsmart in force to 30 Nov).
 *
 * 17 Nov 2026 (~10:30 UTC, the 17N strike day): re-read. New: the doctors'
 * strike of Sindicato Médicos Unidos (SMU), 08:00 on 16 Nov to 08:00 on 28
 * Nov, every region's public health service plus INGESA (its notice of 4
 * Nov, the regional minimum-services orders it publishes, the Generalitat's
 * order of 13 Nov on Treball's list; marches on 19 Nov at 18:00); ELA's
 * Bizkaia building-cleaning strike, 17 to 20 Nov (the Ministry's air
 * resolution of 13 Nov for Bilbao airport); the students' 20N notice to
 * schools (whole school day). SCFCOM 37 (16 Nov) keeps the 19th and says
 * Adif's minimum services were set by the Secretary of State and Circular nº
 * 5 of 13 Nov; the Ministry's rail list still has no Adif resolution (17,
 * 19) and none for 23 Nov. Unchanged: SEMAF (nº 2026-34, 16 Nov), CCOO rail,
 * CESM (newest 12 Nov, strike still postponed), the air list (SAERCO,
 * Groundforce, Outsmart in force to 30 Nov).
 *
 * 17 Nov 2026 (~16:00-17:10 CET): re-read again
 * (research_notes/x10/strikes-wave-17nov-factpack.md). The 23 Nov strike is
 * now "official": the Generalitat's order of 16 Nov (e-Tauler 659191, on
 * Treball's list on the 17th) cites SEMAF's notice registered at Grupo Renfe
 * on 11 Nov, 0.01 to 23.59, all drivers, and sets Rodalies 66 % / 33 %; SEMAF
 * nº 2026-34 (16 Nov) keeps "la jornada trasladada al día 23". Still no
 * Ministry resolution for Adif (17, 19) or for the rest of Renfe on the 23rd
 * (rail list newest = 12 Nov; air list 2026 top = the 17N ones and ELA
 * Bizkaia). SCF newest SCFCOM 37 (19th kept). Sindicato de Estudiantes:
 * 20N kept, mobilisations at 12:00 (city list on its page). SMU: no
 * call-off. BOE sumarios of 13, 14, 16 and 17 Nov: no strike order.
 */
export const STRIKES_SPAIN_AS_OF = "2026-11-18";

/** Printed as the page's "last verified" date. */
export const STRIKES_SPAIN_VERIFIED = "2026-11-17";

const CDN = "https://cdn.transportes.gob.es/portal-web-transportes";
const FICA = "https://ugt-fica.org/component/content/article";

export const SPAIN_URLS = {
  ministryRail: STRIKE_URLS.ministryRail,
  ministryAir: CITY_STATE_URLS.ministryAir,
  // Rail, 10 and 12 Nov.
  semaf1012: STRIKE_URLS.semaf1012,
  renfeSemafResolution: `${CDN}/transporte-terrestre/servicios-minimos/20261105_resolucion_ssmm_renfe__nacional_conduccionv1_vi.pdf`,
  renfeSemafNotice: STRIKE_URLS.renfeSemaf1012,
  // General strike, 11 Nov.
  ccooRegistered: STRIKE_URLS.ccooRegistered,
  correosOrder: CITY_STATE_URLS.correosOrder,
  securityOrder: CITY_STATE_URLS.securityOrder,
  renfe11n: "https://grupo.renfe.com/es/es/sala-de-prensa/noticias/2026/11/establecidos-los-servicios-minimos-para-la-huelga-general-convocada-el-11n",
  air11n: "https://www.transportes.gob.es/recursos_mfom/paginabasica/recursos/53_26-11-11-resolucion_huelga_general_vi.pdf",
  // Rail, 17 and 19 Nov.
  ccooRail17:
    "https://ferroviario.fsc.ccoo.es/noticia:771650--CCOO_anuncia_movilizaciones_los_dias_16_y_17_de_noviembre_para_exigir_un_cambio_de_modelo_ferroviario_y_garantizar_la_seguridad",
  alferro80: STRIKE_URLS.alferro80,
  semafCuerpo: STRIKE_URLS.semafCuerpo,
  // Rail, 23 Nov (SEMAF, 10 Nov: replaces the 12th's stoppages).
  semaf23: STRIKE_URLS.semaf23,
  scfAdif: STRIKE_URLS.scfAdif,
  scf35: STRIKE_URLS.scf35,
  ccooRail17Still: STRIKE_URLS.ccooRail17Still,
  semaf33: STRIKE_URLS.semaf33,
  ministryRenfe17: STRIKE_URLS.ministryRenfe17,
  renfe17: STRIKE_URLS.renfe17,
  iryo17: STRIKE_URLS.iryo17,
  ouigo17: STRIKE_URLS.ouigo17,
  euskadi17: STRIKE_URLS.euskadi17,
  treballMs: STRIKE_URLS.treballMs,
  // Meat industry, 9 to 13 Nov.
  meatCall: `${FICA}/3806?catid=43`,
  meatMediation: `${FICA}/3815?catid=43`,
  meatFirstDay: `${FICA}/3847?catid=43`,
  meatCalledOff: `${FICA}/3857?catid=43`,
  poultry: `${FICA}/3831?catid=43`,
  // Students, 20 Nov.
  students: "https://www.sindicatodeestudiantes.net/index.php/noticias/internacional/20n-huelga-estudiantil-europea",
  studentsNotice: "https://www.sindicatodeestudiantes.net/images/2026/noviembre/comunicacionoficial_20N.pdf",
  // Doctors (Sindicato Médicos Unidos), 16 to 27 Nov (read 17 Nov 2026).
  smuNotice: "https://cdn.medicosunidos.es/huelga-2026-16N/Preavisos/_ESTATAL.pdf",
  smuDocs: "https://medicosunidos.es/documentacion-convocatoria/",
  smuMarches: "https://medicosunidos.es/manifestaciones/",
  treballMsList: STRIKE_URLS.treballMs,
  // Building cleaning in Bizkaia (ELA), 17 to 20 Nov (read 17 Nov 2026).
  elaResolution: `${CDN}/aereo/huelga-servicios-minimos/2026/54_26-11-17_-_dgac_resolucion_huelga_aspel_sectorial_limpieza_vizcaya_-_ela_vi.pdf`,
  // Adif, 17 and 19 Nov: SCFCOM 37 (16 Nov 2026).
  scf37: "https://www.scf.es/com37/",
  // Rail, 23 Nov (read 17 Nov 2026): SEMAF nº 2026-34 (16 Nov). The Generalitat's order of 16 Nov is cited through treballMs.
  semaf34: STRIKE_URLS.semaf34,
  // Airports.
  usca: "https://www.usca.es/usca-y-ccoo-convocan-huelga-indefinida-en-saerco-por-recortes-de-plantilla-y-riesgos-para-la-seguridad-operacional/",
  saercoResolution: `${CDN}/aereo/huelga-servicios-minimos/51_26-10-01--resolucion-huelga-saerco_vi.pdf`,
  groundforceResolution: STRIKE_URLS.groundforce,
  outsmartResolution: `${CDN}/aereo/huelga-servicios-minimos/48_26-10-01---resolucion-outsmart--sate-mad_vi.pdf`,
  // Not happening.
  cesm: "https://www.cesm.org/2026/10/07/el-comite-de-huelga-aplaza-los-paros-indefinidos-tras-la-convocatoria-electoral-pero-mantiene-vivo-el-conflicto/",
  semafOuigo: STRIKE_URLS.semafOuigo,
  // Law.
  constitution: STRIKE_URLS.constitution,
  rdl17: STRIKE_URLS.rdl17,
} as const;

const U = SPAIN_URLS;
const link = (url: string, label: string) => `[${label}](${url})`;

const MINISTRY = "Ministerio de Transportes y Movilidad Sostenible";

const SRC = {
  ministryRail: { name: "Resoluciones de servicios mínimos ferroviarios", url: U.ministryRail, publisher: MINISTRY },
  ministryAir: { name: "Resoluciones de servicios mínimos del transporte aéreo", url: U.ministryAir, publisher: MINISTRY },
} satisfies Record<string, B2Source>;

/* -------------------------------------------------------------------------- */
/* Dated strikes                                                              */
/* -------------------------------------------------------------------------- */

export const SPAIN_STRIKES: SpainStrike[] = [
  {
    id: "huelga-renfe-2026-10-29",
    dates: ["2026-10-29"],
    sector: "rail",
    status: "official",
    catalanEntry: "vaga-renfe-2026-10-29",
    title: {
      ca: "vaga de maquinistes del Grup Renfe (SEMAF)",
      es: "huelga de maquinistas del Grupo Renfe (SEMAF)",
      en: "Renfe train drivers' strike (SEMAF)",
    },
    label: { ca: "maquinistes de Renfe", es: "maquinistas de Renfe", en: "Renfe train drivers" },
    scope: {
      ca: "El personal de conducció del Grup Renfe, a tot Espanya.",
      es: "El personal de conducción del Grupo Renfe, en toda España.",
      en: "Train drivers across the Renfe group, all over Spain.",
    },
    calledBy: { ca: "SEMAF.", es: "SEMAF.", en: "SEMAF." },
    basis: {
      ca: "Amb serveis mínims fixats pel Ministeri de Transports.",
      es: "Con servicios mínimos fijados por el Ministerio de Transportes.",
      en: "With minimum services set by the Ministry of Transport.",
    },
    minimumServices: {
      status: "published",
      short: { ca: "Fixats pel Ministeri de Transports", es: "Fijados por el Ministerio de Transportes", en: "Set by the Ministry of Transport" },
      text: {
        ca: `El Ministeri de Transports va fixar els serveis mínims per resolució del 23 d'octubre, que va modificar el 28 d'octubre, totes dues a ${link(U.ministryRail, "la seva llista de resolucions ferroviàries")}.`,
        es: `El Ministerio de Transportes fijó los servicios mínimos por resolución de 23 de octubre, que modificó el 28 de octubre, ambas en ${link(U.ministryRail, "su lista de resoluciones ferroviarias")}.`,
        en: `The Ministry of Transport set minimum services in a resolution of 23 October, amended on 28 October; both are on ${link(U.ministryRail, "its list of rail resolutions")}.`,
      },
    },
    sources: [SRC.ministryRail],
  },
  {
    id: "huelga-ouigo-2026-10-30",
    dates: ["2026-10-30", "2026-11-02"],
    sector: "rail",
    status: "official",
    catalanEntry: "vaga-ouigo-2026-10-30",
    title: {
      ca: "vaga de maquinistes d'Ouigo (SEMAF)",
      es: "huelga de maquinistas de Ouigo (SEMAF)",
      en: "Ouigo train drivers' strike (SEMAF)",
    },
    label: { ca: "maquinistes d'Ouigo", es: "maquinistas de Ouigo", en: "Ouigo train drivers" },
    scope: {
      ca: "El personal de conducció d'Ouigo España.",
      es: "El personal de conducción de Ouigo España.",
      en: "Train drivers at Ouigo España.",
    },
    calledBy: { ca: "SEMAF.", es: "SEMAF.", en: "SEMAF." },
    basis: {
      ca: "Amb serveis mínims fixats pel Ministeri de Transports.",
      es: "Con servicios mínimos fijados por el Ministerio de Transportes.",
      en: "With minimum services set by the Ministry of Transport.",
    },
    minimumServices: {
      status: "published",
      short: { ca: "Fixats pel Ministeri de Transports", es: "Fijados por el Ministerio de Transportes", en: "Set by the Ministry of Transport" },
      text: {
        ca: `El Ministeri de Transports va fixar els serveis mínims per resolució del 27 d'octubre, a ${link(U.ministryRail, "la seva llista de resolucions ferroviàries")}.`,
        es: `El Ministerio de Transportes fijó los servicios mínimos por resolución de 27 de octubre, en ${link(U.ministryRail, "su lista de resoluciones ferroviarias")}.`,
        en: `The Ministry of Transport set minimum services in a resolution of 27 October, on ${link(U.ministryRail, "its list of rail resolutions")}.`,
      },
    },
    sources: [SRC.ministryRail],
  },
  {
    id: "huelga-carnicas-2026-11-09",
    // 12 and 13 Nov called off on 12 Nov after a pre-agreement (UGT FICA, meatCalledOff).
    dates: ["2026-11-09", "2026-11-10", "2026-11-11"],
    sector: "industry",
    status: "called",
    title: {
      ca: "vaga a les indústries càrnies",
      es: "huelga en las industrias cárnicas",
      en: "meat industry strike",
    },
    label: { ca: "indústries càrnies", es: "industrias cárnicas", en: "meat industry" },
    scope: {
      ca: "Les plantilles del sector d'indústries càrnies, a tot Espanya. No afecta el transport, la sanitat ni les escoles.",
      es: "Las plantillas del sector de industrias cárnicas, en toda España. No afecta al transporte, la sanidad ni los colegios.",
      en: "Workers in the meat-processing industry, all over Spain. It does not touch transport, health care or schools.",
    },
    calledBy: {
      ca: `UGT FICA i CCOO Indústria, segons ${link(U.meatCall, "la convocatòria que UGT FICA va publicar el 16 d'octubre")}.`,
      es: `UGT FICA y CCOO Industria, según ${link(U.meatCall, "la convocatoria que UGT FICA publicó el 16 de octubre")}.`,
      en: `The unions UGT FICA and CCOO Industria, according to ${link(U.meatCall, "the call UGT FICA published on 16 October")}.`,
    },
    basis: {
      ca: `Consta als avisos dels sindicats: la mediació prèvia al SIMA va acabar sense acord i van mantenir la convocatòria (${link(U.meatMediation, "UGT FICA, 22 d'octubre")}), i el 9 de novembre UGT FICA va informar de la primera jornada de vaga (${link(U.meatFirstDay, "la seva nota")}). El 12 de novembre, UGT FICA i CCOO van desconvocar les jornades del 12 i el 13 després d'un preacord (${link(U.meatCalledOff, "UGT FICA, 12 de novembre")}).`,
      es: `Consta en los avisos de los sindicatos: la mediación previa en el SIMA terminó sin acuerdo y mantuvieron la convocatoria (${link(U.meatMediation, "UGT FICA, 22 de octubre")}), y el 9 de noviembre UGT FICA informó de la primera jornada de huelga (${link(U.meatFirstDay, "su nota")}). El 12 de noviembre, UGT FICA y CCOO desconvocaron las jornadas del 12 y el 13 tras un preacuerdo (${link(U.meatCalledOff, "UGT FICA, 12 de noviembre")}).`,
      en: `It rests on the unions' own notices: the mediation at SIMA beforehand ended without agreement and they kept the call (${link(U.meatMediation, "UGT FICA, 22 October")}), and on 9 November UGT FICA reported on the first strike day (${link(U.meatFirstDay, "its note")}). On 12 November, UGT FICA and CCOO called off the 12th and 13th after a pre-agreement (${link(U.meatCalledOff, "UGT FICA, 12 November")}).`,
    },
    minimumServices: {
      status: "none",
      short: { ca: "No afecta serveis públics", es: "No afecta a servicios públicos", en: "No public service affected" },
      text: {
        ca: "És una vaga en una indústria privada: no afecta el transport, la sanitat ni les escoles.",
        es: "Es una huelga en una industria privada: no afecta al transporte, la sanidad ni los colegios.",
        en: "It is a strike in a private industry: transport, health care and schools are not affected.",
      },
    },
    sources: [
      { name: "UGT FICA y CCOO Industria convocan cinco días de huelga en el sector cárnico (16 de octubre de 2026)", url: U.meatCall, publisher: "UGT FICA" },
      { name: "Mediación en el SIMA sin acuerdo: se mantiene la huelga de industrias cárnicas (22 de octubre de 2026)", url: U.meatMediation, publisher: "UGT FICA" },
      { name: "Primera jornada de huelga en las industrias cárnicas (9 de noviembre de 2026)", url: U.meatFirstDay, publisher: "UGT FICA" },
      { name: "Desconvocada la huelga en las industrias cárnicas tras alcanzar un preacuerdo (12 de noviembre de 2026)", url: U.meatCalledOff, publisher: "UGT FICA" },
    ],
  },
  {
    id: "huelga-renfe-2026-11-10",
    // 12 Nov called off by SEMAF on 10 Nov: replaced by huelga-renfe-2026-11-23.
    dates: ["2026-11-10"],
    sector: "rail",
    status: "official",
    catalanEntry: "vaga-renfe-2026-11-10",
    guides: ["strikeRenfe"],
    title: {
      ca: "vaga de maquinistes del Grup Renfe (SEMAF)",
      es: "huelga de maquinistas del Grupo Renfe (SEMAF)",
      en: "Renfe train drivers' strike (SEMAF)",
    },
    label: { ca: "maquinistes de Renfe", es: "maquinistas de Renfe", en: "Renfe train drivers" },
    scope: {
      ca: "El personal de conducció del Grup Renfe, a tot Espanya: Rodalies, Mitjana Distància, AVE i Llarga Distància, i mercaderies.",
      es: "El personal de conducción del Grupo Renfe, en toda España: Cercanías, Media Distancia, AVE y Larga Distancia, y mercancías.",
      en: "Train drivers across the Renfe group, all over Spain: Cercanías commuter trains, Media Distancia regional trains, AVE and long-distance trains, and freight.",
    },
    hours: {
      ca: `El dia 10, aturada total, segons SEMAF. Les aturades parcials del dia 12 es van desconvocar el 10 de novembre, segons ${link(U.semaf23, "SEMAF")}, que les va substituir per una nova vaga el 23.`,
      es: `El día 10, paro total, según SEMAF. Los paros parciales del día 12 se desconvocaron el 10 de noviembre, según ${link(U.semaf23, "SEMAF")}, que los sustituyó por una nueva huelga el 23.`,
      en: `A full stoppage on the 10th, according to SEMAF. The partial stoppages on the 12th were called off on 10 November, according to ${link(U.semaf23, "SEMAF")}, which replaced them with a new strike on the 23rd.`,
    },
    calledBy: {
      ca: `El sindicat de maquinistes SEMAF, a ${link(U.semaf1012, "el seu comunicat")}.`,
      es: `El sindicato de maquinistas SEMAF, en ${link(U.semaf1012, "su comunicado")}.`,
      en: `The train drivers' union SEMAF, in ${link(U.semaf1012, "its notice")}.`,
    },
    basis: {
      ca: `El Ministeri de Transports en va fixar els serveis mínims per ${link(U.renfeSemafResolution, "resolució del 6 de novembre")}, publicada a ${link(U.ministryRail, "la seva llista de resolucions ferroviàries")}.`,
      es: `El Ministerio de Transportes fijó sus servicios mínimos por ${link(U.renfeSemafResolution, "resolución de 6 de noviembre")}, publicada en ${link(U.ministryRail, "su lista de resoluciones ferroviarias")}.`,
      en: `The Ministry of Transport set its minimum services in a ${link(U.renfeSemafResolution, "resolution of 6 November")}, published on ${link(U.ministryRail, "its list of rail resolutions")}.`,
    },
    minimumServices: {
      status: "published",
      short: {
        ca: "75% de Cercanías en hora punta i 50% la resta del dia",
        es: "75% de Cercanías en hora punta y 50% el resto del día",
        en: "75% of Cercanías trains at peak times, 50% the rest of the day",
      },
      text: {
        ca: `Segons ${link(U.renfeSemafNotice, "l'avís de Renfe")}: als trens de Cercanías, el 75% del servei habitual en hora punta (de 6.00 a 9.00 h, de 13.30 a 15.30 h i de 18.30 a 20.30 h) i el 50% la resta del dia; a Mitjana Distància, una mitjana del 65%; a l'AVE i la Llarga Distància, el 72%; a mercaderies, el 20%. A Catalunya, els serveis mínims de Rodalies els fixa la Generalitat.`,
        es: `Según ${link(U.renfeSemafNotice, "el aviso de Renfe")}: en Cercanías, el 75% del servicio habitual en hora punta (de 6.00 a 9.00 h, de 13.30 a 15.30 h y de 18.30 a 20.30 h) y el 50% el resto del día; en Media Distancia, una media del 65%; en AVE y Larga Distancia, el 72%; en mercancías, el 20%. En Cataluña, los servicios mínimos de Rodalies los fija la Generalitat.`,
        en: `According to ${link(U.renfeSemafNotice, "Renfe's notice")}: on Cercanías commuter trains, 75% of the usual service at peak times (06:00 to 09:00, 13:30 to 15:30 and 18:30 to 20:30) and 50% the rest of the day; on Media Distancia, 65% on average; on AVE and long-distance trains, 72%; on freight, 20%. In Catalonia, the Generalitat sets minimum services for Rodalies.`,
      },
    },
    sources: [
      { name: "SEMAF convoca huelga en el Grupo Renfe los días 10 y 12 de noviembre", url: U.semaf1012, publisher: "SEMAF" },
      { name: "Resolución de 6 de noviembre de 2026: servicios mínimos de la huelga de SEMAF en el Grupo Renfe (10 y 12 de noviembre)", url: U.renfeSemafResolution, publisher: MINISTRY },
      { name: "Establecidos los servicios mínimos para la huelga convocada por Semaf para el 10 y 12 de noviembre", url: U.renfeSemafNotice, publisher: "Renfe" },
      SRC.ministryRail,
      { name: "Primer Real Decreto-ley aprobado: SEMAF mueve el paro del 12 al 23 de noviembre (10/11/2026)", url: U.semaf23, publisher: "SEMAF" },
    ],
  },
  {
    id: "huelga-general-2026-11-11",
    dates: ["2026-11-11"],
    sector: "general",
    status: "official",
    catalanEntry: "vaga-general-2026-11-11",
    guides: ["strike11n", "strikes"],
    title: {
      ca: "vaga general de 24 hores",
      es: "huelga general de 24 horas",
      en: "24-hour general strike",
    },
    label: { ca: "vaga general", es: "huelga general", en: "general strike" },
    scope: {
      ca: "Tots els sectors, públics i privats, a tot Espanya.",
      es: "Todos los sectores, públicos y privados, en toda España.",
      en: "Every sector, public and private, all over Spain.",
    },
    hours: {
      ca: `De les 0.00 a les 24.00 h. Als centres amb torns, comença amb el primer torn, encara que entri abans de les 0.00 h, i acaba quan surt l'últim, segons la convocatòria que recull ${link(U.correosOrder, "l'Ordre INT/1170/2026")}.`,
      es: `De las 0.00 a las 24.00 h. En los centros con turnos, empieza con el primer turno, aunque entre antes de las 0.00 h, y termina cuando sale el último, según la convocatoria que recoge ${link(U.correosOrder, "la Orden INT/1170/2026")}.`,
      en: `From 00:00 to 24:00. Where people work shifts, it starts with the first shift, even if that begins before midnight, and ends when the last one finishes, according to the call as set out in ${link(U.correosOrder, "Order INT/1170/2026")}.`,
    },
    calledBy: {
      ca: `CCOO i UGT, que la van presentar amb el Sindicato de Inquilinas, CGT, CNT, Confederación Intersindical, CO.BAS i la Unión de Actores y Actrices, segons ${link(U.ccooRegistered, "CCOO")}. CGT hi té, a més, una convocatòria pròpia de jornada completa, segons l'Ordre INT/1170/2026.`,
      es: `CCOO y UGT, que la presentaron con el Sindicato de Inquilinas, CGT, CNT, Confederación Intersindical, CO.BAS y la Unión de Actores y Actrices, según ${link(U.ccooRegistered, "CCOO")}. CGT tiene además una convocatoria propia de jornada completa, según la Orden INT/1170/2026.`,
      en: `The unions CCOO and UGT, who presented it alongside the tenants' union Sindicato de Inquilinas, CGT, CNT, Confederación Intersindical, CO.BAS and the actors' union Unión de Actores y Actrices, according to ${link(U.ccooRegistered, "CCOO")}. CGT also has a full-day call of its own, according to Order INT/1170/2026.`,
    },
    basis: {
      ca: `La convocatòria està registrada, segons ${link(U.ccooRegistered, "CCOO")}, i té serveis mínims publicats al BOE i pel Ministeri de Transports.`,
      es: `La convocatoria está registrada, según ${link(U.ccooRegistered, "CCOO")}, y tiene servicios mínimos publicados en el BOE y por el Ministerio de Transportes.`,
      en: `The call is registered, according to ${link(U.ccooRegistered, "CCOO")}, and minimum services have been published in the BOE (the official state gazette) and by the Ministry of Transport.`,
    },
    minimumServices: {
      status: "published",
      short: {
        ca: "Publicats pel Ministeri de Transports i al BOE; la resta, cada comunitat autònoma",
        es: "Publicados por el Ministerio de Transportes y en el BOE; el resto, cada comunidad autónoma",
        en: "Published by the Ministry of Transport and in the BOE; the rest, by each region",
      },
      text: {
        ca: `Trens de Renfe, segons ${link(U.renfe11n, "el seu avís")}: a Cercanías, el 75% del servei habitual en hora punta (de 6.00 a 9.00 h, de 13.30 a 15.30 h i de 18.30 a 20.30 h) i el 50% la resta del dia; a Mitjana Distància, una mitjana del 65%; a l'AVE i la Llarga Distància, el 73%; a mercaderies, el 26%. El Ministeri de Transports publica les resolucions de cada operadora ferroviària a ${link(U.ministryRail, "la seva llista")} i la ${link(U.air11n, "resolució del transport aeri")} a ${link(U.ministryAir, "la d'aviació")}. Al BOE hi ha els de ${link(U.correosOrder, "Correus (Ordre INT/1170/2026)")} i els de ${link(U.securityOrder, "la seguretat privada (Resolució del 30 d'octubre de 2026)")}. El transport urbà, la sanitat i les escoles depenen de cada comunitat autònoma, que publica els seus.`,
        es: `Trenes de Renfe, según ${link(U.renfe11n, "su aviso")}: en Cercanías, el 75% del servicio habitual en hora punta (de 6.00 a 9.00 h, de 13.30 a 15.30 h y de 18.30 a 20.30 h) y el 50% el resto del día; en Media Distancia, una media del 65%; en AVE y Larga Distancia, el 73%; en mercancías, el 26%. El Ministerio de Transportes publica las resoluciones de cada operadora ferroviaria en ${link(U.ministryRail, "su lista")} y la ${link(U.air11n, "resolución del transporte aéreo")} en ${link(U.ministryAir, "la de aviación")}. En el BOE están los de ${link(U.correosOrder, "Correos (Orden INT/1170/2026)")} y los de ${link(U.securityOrder, "la seguridad privada (Resolución de 30 de octubre de 2026)")}. El transporte urbano, la sanidad y los colegios dependen de cada comunidad autónoma, que publica los suyos.`,
        en: `Renfe trains, according to ${link(U.renfe11n, "its notice")}: on Cercanías commuter trains, 75% of the usual service at peak times (06:00 to 09:00, 13:30 to 15:30 and 18:30 to 20:30) and 50% the rest of the day; on Media Distancia, 65% on average; on AVE and long-distance trains, 73%; on freight, 26%. The Ministry of Transport publishes each rail operator's resolution on ${link(U.ministryRail, "its rail list")} and the ${link(U.air11n, "air transport resolution")} on ${link(U.ministryAir, "its aviation list")}. The BOE carries those for ${link(U.correosOrder, "the post office, Correos (Order INT/1170/2026)")} and for ${link(U.securityOrder, "private security (Resolution of 30 October 2026)")}. City transport, health care and schools depend on each region, which publishes its own.`,
      },
    },
    sources: [
      { name: "Registro de la huelga general del 11N", url: U.ccooRegistered, publisher: "CCOO" },
      { name: "Orden INT/1170/2026: servicios mínimos en Correos durante la huelga general del 11 de noviembre de 2026", url: U.correosOrder, publisher: "Boletín Oficial del Estado" },
      { name: "Resolución de 30 de octubre de 2026: servicios mínimos de la seguridad privada durante la huelga general del 11 de noviembre", url: U.securityOrder, publisher: "Boletín Oficial del Estado" },
      { name: "Establecidos los servicios mínimos para la huelga general convocada el 11 de noviembre", url: U.renfe11n, publisher: "Renfe" },
      { name: "Resolución de servicios mínimos del transporte aéreo para la huelga general del 11 de noviembre de 2026", url: U.air11n, publisher: MINISTRY },
      SRC.ministryRail,
      SRC.ministryAir,
    ],
  },
  {
    id: "huelga-ferroviaria-2026-11-17",
    dates: ["2026-11-17", "2026-11-19"],
    sector: "rail",
    status: "official",
    catalanEntry: "vaga-ferroviaria-2026-11-17",
    // 17 Nov 2026: the 19th has a page of its own ("huelga renfe 19 noviembre" lands here and on the Renfe guide).
    guides: ["railStrike17n", "strike19n", "strikes"],
    title: {
      ca: "vaga ferroviària a Adif, Renfe i les operadores privades",
      es: "huelga ferroviaria en Adif, Renfe y las operadoras privadas",
      en: "rail strike at Adif, Renfe and the private operators",
    },
    label: { ca: "vaga ferroviària", es: "huelga ferroviaria", en: "rail strike" },
    scope: {
      ca: "El dia 17: tot el personal del Grup Renfe (Rodalies i Cercanías, Mitja Distància, AVE i Llarga Distància, mercaderies) i Adif, i els maquinistes d'Iryo, Ouigo, Transfesa, Continental Rail, Tracción Rail, Captrain i Medway. El dia 19: el personal de circulació d'Adif.",
      es: "El día 17: toda la plantilla del Grupo Renfe (Cercanías y Rodalies, Media Distancia, AVE y Larga Distancia, mercancías) y Adif, y los maquinistas de Iryo, Ouigo, Transfesa, Continental Rail, Tracción Rail, Captrain y Medway. El día 19: el personal de circulación de Adif.",
      en: "On the 17th: all Renfe Group staff (Cercanías and Rodalies commuter trains, Media Distancia, AVE and long distance, freight) and Adif (the track operator), plus train drivers at Iryo, Ouigo, Transfesa, Continental Rail, Tracción Rail, Captrain and Medway. On the 19th: Adif's traffic-control staff.",
    },
    hours: {
      ca: "El 17, de 0.00 a 23.59 h al Grup Renfe, segons l'ordre de serveis mínims de la Generalitat; a Adif, aturades de 24 hores el 17 i el 19, segons l'SCF.",
      es: "El 17, de 0.00 a 23.59 h en el Grupo Renfe, según la orden de servicios mínimos de la Generalitat; en Adif, paros de 24 horas el 17 y el 19, según el SCF.",
      en: "On the 17th, 00:00 to 23:59 at the Renfe Group, according to the Generalitat's minimum-services order; at Adif, 24-hour stoppages on the 17th and the 19th, according to SCF.",
    },
    calledBy: {
      ca: `El dia 17, els sindicats del Comitè General d'Empresa d'Adif (${link(U.ccooRail17, "CCOO, 3 de novembre")}), als quals es va sumar el Comitè General d'Empresa de Renfe (${link(U.alferro80, "ALFERRO, comunicat 80/2026")}): al Grup Renfe hi han registrat vaga FeSMC-UGT, CCOO, SF-Intersindical, SEMAF, ALFERRO i SFF-CGT, segons l'ordre de la Generalitat del 12 de novembre (${link(U.treballMs, "llista del Departament d'Empresa i Treball")}). SEMAF també crida els maquinistes de les altres operadores (${link(U.semafCuerpo, "SEMAF, 5 de novembre")}). El 17 i el 19, el sindicat SCF a Adif (${link(U.scfAdif, "SCF, 6 de novembre")}), que els mantenia el 12 de novembre (${link(U.scf35, "comunicat 35")}). CCOO, el 12 de novembre: «la huelga del 17 de noviembre sigue siendo necesaria» (${link(U.ccooRail17Still, "el seu comunicat")}); SEMAF, el 14: «Se mantienen los paros convocados para el día 17» (${link(U.semaf33, "comunicat 2026-33")}).`,
      es: `El día 17, los sindicatos del Comité General de Empresa de Adif (${link(U.ccooRail17, "CCOO, 3 de noviembre")}), a los que se sumó el Comité General de Empresa de Renfe (${link(U.alferro80, "ALFERRO, comunicado 80/2026")}): en el Grupo Renfe han registrado huelga FeSMC-UGT, CCOO, SF-Intersindical, SEMAF, ALFERRO y SFF-CGT, según la orden de la Generalitat del 12 de noviembre (${link(U.treballMs, "lista del Departament d'Empresa i Treball")}). SEMAF llama también a los maquinistas de las demás operadoras (${link(U.semafCuerpo, "SEMAF, 5 de noviembre")}). El 17 y el 19, el sindicato SCF en Adif (${link(U.scfAdif, "SCF, 6 de noviembre")}), que los mantenía el 12 de noviembre (${link(U.scf35, "comunicado 35")}). CCOO, el 12 de noviembre: «la huelga del 17 de noviembre sigue siendo necesaria» (${link(U.ccooRail17Still, "su comunicado")}); SEMAF, el 14: «Se mantienen los paros convocados para el día 17» (${link(U.semaf33, "comunicado 2026-33")}).`,
      en: `On the 17th, the unions on Adif's company-wide works council (${link(U.ccooRail17, "CCOO, 3 November")}), joined by Renfe's works council (${link(U.alferro80, "ALFERRO, notice 80/2026")}): at the Renfe Group, FeSMC-UGT, CCOO, SF-Intersindical, SEMAF, ALFERRO and SFF-CGT have registered strike calls, according to the Generalitat's order of 12 November (${link(U.treballMs, "the Catalan labour department's list")}). SEMAF also calls out drivers at the other operators (${link(U.semafCuerpo, "SEMAF, 5 November")}). On the 17th and the 19th, the SCF union at Adif (${link(U.scfAdif, "SCF, 6 November")}), which kept both days on 12 November (${link(U.scf35, "notice 35")}). CCOO on 12 November: "la huelga del 17 de noviembre sigue siendo necesaria" (the 17 November strike is still necessary; ${link(U.ccooRail17Still, "its notice")}); SEMAF on the 14th: "Se mantienen los paros convocados para el día 17" (the stoppages called for the 17th stand; ${link(U.semaf33, "notice 2026-33")}).`,
    },
    basis: {
      ca: `El 17, ${link(U.ministryRenfe17, "la resolució de serveis mínims del Ministeri de Transports del 12 de novembre")}, que cita les convocatòries del Comitè General del Grup Renfe, SEMAF, CCOO, UGT, SFF-CGT, SF-Intersindical i ALFERRO, de 0.00 a 23.59 h. El 19 (Adif) consta al comunicat de l'SCF, que el 16 de novembre cridava «Todos a la huelga» (${link(U.scf37, "comunicat 37")}). El {checked} no hi havia cap resolució per a aquest dia a ${link(U.ministryRail, "la llista del Ministeri")}.`,
      es: `El 17, ${link(U.ministryRenfe17, "la resolución de servicios mínimos del Ministerio de Transportes del 12 de noviembre")}, que cita las convocatorias del Comité General del Grupo Renfe, SEMAF, CCOO, UGT, SFF-CGT, SF-Intersindical y ALFERRO, de 0.00 a 23.59 h. El 19 (Adif) consta en el comunicado del SCF, que el 16 de noviembre llamaba «Todos a la huelga» (${link(U.scf37, "comunicado 37")}). El {checked} no había ninguna resolución para ese día en ${link(U.ministryRail, "la lista del Ministerio")}.`,
      en: `For the 17th, ${link(U.ministryRenfe17, "the Ministry of Transport's minimum-services resolution of 12 November")}, which cites the calls by the Renfe Group's works council, SEMAF, CCOO, UGT, SFF-CGT, SF-Intersindical and ALFERRO, 00:00 to 23:59. The 19th (Adif) rests on SCF's notice, which on 16 November said "Todos a la huelga" (everyone on strike; ${link(U.scf37, "notice 37")}). On {checked} there was no resolution for that day on ${link(U.ministryRail, "the Ministry's list")}.`,
    },
    minimumServices: {
      status: "published",
      short: {
        ca: "Publicats: Cercanías 75% en hora punta, AVE 72%, Mitja Distància 65%; Adif, per confirmar",
        es: "Publicados: Cercanías 75% en hora punta, AVE 72%, Media Distancia 65%; Adif, por confirmar",
        en: "Published: Cercanías 75% at peak, AVE 72%, Media Distancia 65%; Adif to be confirmed",
      },
      text: {
        ca: `Per al 17, ${link(U.ministryRenfe17, "la resolució del Ministeri de Transports del 12 de novembre")} fixa al Grup Renfe: **Cercanías, el 75% del servei habitual en hora punta** (de 6.00 a 9.00, de 13.30 a 15.30 i de 18.30 a 20.30 h; fora de Madrid, la franja del migdia és de 13.30/14.00 a 15.30/16.00 h) **i el 50% la resta del dia**; **Mitja Distància, una mitjana del 65%** (444 de 682 trens); **AVE i Llarga Distància, el 72%** (177 de 246 trens), i mercaderies, el 26%. Renfe ho confirma en ${link(U.renfe17, "el seu avís del 14 de novembre")}. A **Iryo**, el 70% (28 de 40 trens), i a **Ouigo**, el 65,38% (17 de 26), segons les resolucions del 13 de novembre (${link(U.iryo17, "Iryo")}, ${link(U.ouigo17, "Ouigo")}). A **Cercanías de Bilbao i Sant Sebastià** els fixa el Govern Basc: el 50% en hora punta i el 25% la resta del dia (${link(U.euskadi17, "ordre del 13 de novembre")}); a **Rodalies de Catalunya** i els regionals, la Generalitat: el 66% i el 33% (${link(U.treballMs, "llista del Departament d'Empresa i Treball")}). **Adif, el 17 i el 19:** per confirmar. El {checked} encara no hi havia cap resolució a ${link(U.ministryRail, "la llista del Ministeri")}; l'SCF diu que el personal d'Adif es regeix pels serveis mínims «determinados por la Secretaría de estado de transportes y movilidad sostenible y la Circular de Dirección General nº 5 del 13-11-2026» i que, durant les aturades, la circulació garanteix la seguretat del trànsit i les obres d'emergència (${link(U.scf37, "comunicat 37, 16 de novembre")}).`,
        es: `Para el 17, ${link(U.ministryRenfe17, "la resolución del Ministerio de Transportes del 12 de noviembre")} fija en el Grupo Renfe: **Cercanías, el 75% del servicio habitual en hora punta** (de 6.00 a 9.00, de 13.30 a 15.30 y de 18.30 a 20.30 h; fuera de Madrid, la franja de mediodía es de 13.30/14.00 a 15.30/16.00 h) **y el 50% el resto del día**; **Media Distancia, una media del 65%** (444 de 682 trenes); **AVE y Larga Distancia, el 72%** (177 de 246 trenes), y mercancías, el 26%. Renfe lo confirma en ${link(U.renfe17, "su aviso del 14 de noviembre")}. En **Iryo**, el 70% (28 de 40 trenes), y en **Ouigo**, el 65,38% (17 de 26), según las resoluciones del 13 de noviembre (${link(U.iryo17, "Iryo")}, ${link(U.ouigo17, "Ouigo")}). En **Cercanías de Bilbao y San Sebastián** los fija el Gobierno Vasco: el 50% en hora punta y el 25% el resto del día (${link(U.euskadi17, "orden del 13 de noviembre")}); en **Rodalies de Catalunya** y los regionales, la Generalitat: el 66% y el 33% (${link(U.treballMs, "lista del Departament d'Empresa i Treball")}). **Adif, el 17 y el 19:** por confirmar. El {checked} aún no había ninguna resolución en ${link(U.ministryRail, "la lista del Ministerio")}; el SCF dice que la plantilla de Adif se rige por los servicios mínimos «determinados por la Secretaría de estado de transportes y movilidad sostenible y la Circular de Dirección General nº 5 del 13-11-2026» y que, durante los paros, la circulación garantiza la seguridad del tráfico y las obras de emergencia (${link(U.scf37, "comunicado 37, 16 de noviembre")}).`,
        en: `For the 17th, ${link(U.ministryRenfe17, "the Ministry of Transport's resolution of 12 November")} sets at the Renfe Group: **Cercanías, 75% of the usual service at peak times** (06:00 to 09:00, 13:30 to 15:30 and 18:30 to 20:30; outside Madrid the midday band is 13:30/14:00 to 15:30/16:00) **and 50% the rest of the day**; **Media Distancia, 65% on average** (444 of 682 trains); **AVE and long distance, 72%** (177 of 246 trains); freight, 26%. Renfe confirms it in ${link(U.renfe17, "its notice of 14 November")}. **Iryo**, 70% (28 of 40 trains), and **Ouigo**, 65.38% (17 of 26), under the resolutions of 13 November (${link(U.iryo17, "Iryo")}, ${link(U.ouigo17, "Ouigo")}). On **Cercanías Bilbao and San Sebastián** the Basque Government sets them: 50% at peak times and 25% the rest of the day (${link(U.euskadi17, "order of 13 November")}); on **Rodalies de Catalunya** and regional trains, the Generalitat: 66% and 33% (${link(U.treballMs, "the Catalan labour department's list")}). **Adif, 17th and 19th:** to be confirmed. On {checked} there was still no resolution on ${link(U.ministryRail, "the Ministry's list")}; SCF says Adif staff follow the minimum services "determinados por la Secretaría de estado de transportes y movilidad sostenible y la Circular de Dirección General nº 5 del 13-11-2026" (set by the Secretary of State for Transport and Adif's Circular no. 5 of 13 November) and that during the stoppages traffic control keeps rail traffic safe and emergency works going (${link(U.scf37, "notice 37, 16 November")}).`,
      },
    },
    sources: [
      { name: "CCOO anuncia movilizaciones los días 16 y 17 de noviembre (3 de noviembre de 2026)", url: U.ccooRail17, publisher: "CCOO, Sector Ferroviario" },
      { name: "Comunicado 80/2026: modificación de las fechas de huelga de noviembre de 2026", url: U.alferro80, publisher: "ALFERRO" },
      { name: "Encuentro con el ministro Carlos Cuerpo: alcance de las movilizaciones (5 de noviembre de 2026)", url: U.semafCuerpo, publisher: "SEMAF" },
      { name: "SCFCOM 33: SCF convoca huelga en Adif (6 de noviembre de 2026)", url: U.scfAdif, publisher: "Sindicato de Circulación Ferroviario (SCF)" },
      { name: "SCFCOM 35: Las motivaciones de una negociación (12 de noviembre de 2026)", url: U.scf35, publisher: "Sindicato de Circulación Ferroviario (SCF)" },
      { name: "Avances en seguridad y derechos que deben notarse en el trabajo (12 de noviembre de 2026)", url: U.ccooRail17Still, publisher: "CCOO, Sector Ferroviario" },
      SRC.ministryRail,
      { name: "Serveis mínims en cas de vaga", url: U.treballMs, publisher: "Generalitat de Catalunya, Departament d'Empresa i Treball" },
      { name: "Resolución de 12 de noviembre de 2026: servicios mínimos en el Grupo Renfe el 17 de noviembre", url: U.ministryRenfe17, publisher: MINISTRY },
      { name: "Establecidos los servicios mínimos para la huelga convocada para el 17 de noviembre en el Grupo Renfe (14 de noviembre de 2026)", url: U.renfe17, publisher: "Renfe" },
      { name: "Resolución de servicios mínimos en Intermodalidad de Levante (Iryo), 17 de noviembre de 2026", url: U.iryo17, publisher: MINISTRY },
      { name: "Resolución de servicios mínimos en Ouigo España, 17 de noviembre de 2026", url: U.ouigo17, publisher: MINISTRY },
      { name: "Orden de 13 de noviembre de 2026: servicios mínimos del Grupo Renfe en Euskadi (Cercanías), 17 de noviembre", url: U.euskadi17, publisher: "Gobierno Vasco, Departamento de Economía, Trabajo y Empleo" },
      { name: "Reunión de trabajo con el Ministerio de Transportes; las movilizaciones por la Seguridad continúan (nº 2026-33, 14 de noviembre de 2026)", url: U.semaf33, publisher: "SEMAF" },
      { name: "SCFCOM 37: Todos a la huelga (16 de noviembre de 2026)", url: U.scf37, publisher: "Sindicato de Circulación Ferroviario (SCF)" },
    ],
  },
  {
    id: "huelga-renfe-2026-11-23",
    dates: ["2026-11-23"],
    sector: "rail",
    // 17 Nov 2026: "official" — the Generalitat's order of 16 Nov (on Treball's official list) cites SEMAF's strike notice registered at
    // Grupo Renfe on 11 Nov and sets Rodalies' minimum services; the Ministry's resolution for the rest of Renfe is still to come.
    status: "official",
    catalanEntry: "vaga-renfe-2026-11-23",
    guides: ["strikeRenfe"],
    title: {
      ca: "vaga de maquinistes del Grup Renfe (SEMAF)",
      es: "huelga de maquinistas del Grupo Renfe (SEMAF)",
      en: "Renfe Group train drivers' strike (SEMAF)",
    },
    label: { ca: "maquinistes de Renfe (SEMAF)", es: "maquinistas de Renfe (SEMAF)", en: "Renfe train drivers (SEMAF)" },
    scope: {
      ca: "Tot el col·lectiu de maquinistes del Grup Renfe, segons l'ordre de serveis mínims de la Generalitat del 16 de novembre. Substitueix les aturades parcials del 12 de novembre, que eren al Grup Renfe a tot Espanya.",
      es: "Todo el colectivo de maquinistas del Grupo Renfe, según la orden de servicios mínimos de la Generalitat del 16 de noviembre. Sustituye a los paros parciales del 12 de noviembre, que eran en el Grupo Renfe en toda España.",
      en: "All Renfe Group train drivers, according to the Generalitat's minimum-services order of 16 November. It replaces the partial stoppages of 12 November, which were at the Renfe Group across Spain.",
    },
    hours: {
      ca: "De 0.01 a 23.59 h, segons l'ordre de serveis mínims de la Generalitat.",
      es: "De 0.01 a 23.59 h, según la orden de servicios mínimos de la Generalitat.",
      en: "00:01 to 23:59, according to the Generalitat's minimum-services order.",
    },
    calledBy: {
      ca: `El sindicat de maquinistes SEMAF, que el 10 de novembre va decidir «sustituir el paro previsto para el día 12 de noviembre por una nueva convocatoria de huelga el día 23 de noviembre», segons ${link(U.semaf23, "el seu comunicat")}, i el 16 de novembre la mantenia: «así como la jornada trasladada al día 23» (${link(U.semaf34, "comunicat 2026-34")}).`,
      es: `El sindicato de maquinistas SEMAF, que el 10 de noviembre decidió «sustituir el paro previsto para el día 12 de noviembre por una nueva convocatoria de huelga el día 23 de noviembre», según ${link(U.semaf23, "su comunicado")}, y el 16 de noviembre la mantenía: «así como la jornada trasladada al día 23» (${link(U.semaf34, "comunicado 2026-34")}).`,
      en: `The train drivers' union SEMAF, which on 10 November decided to "sustituir el paro previsto para el día 12 de noviembre por una nueva convocatoria de huelga el día 23 de noviembre" (replace the 12 November stoppage with a new strike call on 23 November), according to ${link(U.semaf23, "its notice")}, and kept it on 16 November: "así como la jornada trasladada al día 23" (as well as the day moved to the 23rd; ${link(U.semaf34, "notice 2026-34")}).`,
    },
    // The order is cited through Treball's official list, never by its e-Tauler notice (withdrawn on 15 Dec; the DOGC number is not out yet).
    basis: {
      ca: `L'ordre del Departament d'Empresa i Treball del 16 de novembre, a ${link(U.treballMs, "la llista oficial de vagues amb serveis mínims")}, cita la comunicació de vaga de SEMAF al Grup Renfe, registrada l'11 de novembre. El {checked} no hi havia cap resolució del Ministeri de Transports per a aquest dia a ${link(U.ministryRail, "la seva llista")}.`,
      es: `La orden del Departament d'Empresa i Treball del 16 de noviembre, en ${link(U.treballMs, "la lista oficial de huelgas con servicios mínimos")}, cita la comunicación de huelga de SEMAF en el Grupo Renfe, registrada el 11 de noviembre. El {checked} no había ninguna resolución del Ministerio de Transportes para este día en ${link(U.ministryRail, "su lista")}.`,
      en: `The Catalan Department of Business and Labour's order of 16 November, on ${link(U.treballMs, "the official list of strikes with minimum services")}, cites SEMAF's strike notice at the Renfe Group, registered on 11 November. On {checked} there was no Ministry of Transport resolution for this day on ${link(U.ministryRail, "its list")}.`,
    },
    minimumServices: {
      status: "published",
      short: {
        ca: "A Rodalies, 66% en hora punta i 33%; Cercanías, Mitja Distància i AVE, per confirmar",
        es: "En Rodalies, 66% en hora punta y 33%; Cercanías, Media Distancia y AVE, por confirmar",
        en: "On Rodalies, 66% at peak and 33%; Cercanías, Media Distancia, AVE to be confirmed",
      },
      text: {
        ca: `**Rodalies de Catalunya i regionals:** l'ordre de la Generalitat del 16 de novembre (${link(U.treballMs, "llista del Departament d'Empresa i Treball")}) fixa el 66% del servei habitual en hora punta (de 6.00 a 9.30 h i de 17.00 a 20.30 h) i el 33% la resta del dia. **Cercanías, Mitja Distància, AVE i Llarga Distància:** per confirmar; els fixa el Ministeri de Transports, que el {checked} encara no els tenia a ${link(U.ministryRail, "la seva llista de resolucions ferroviàries")}. Per a la vaga de SEMAF del 10 de novembre, la resolució va ser del 6, quatre dies abans.`,
        es: `**Rodalies de Catalunya y regionales:** la orden de la Generalitat del 16 de noviembre (${link(U.treballMs, "lista del Departament d'Empresa i Treball")}) fija el 66% del servicio habitual en hora punta (de 6.00 a 9.30 h y de 17.00 a 20.30 h) y el 33% el resto del día. **Cercanías, Media Distancia, AVE y Larga Distancia:** por confirmar; los fija el Ministerio de Transportes, que el {checked} aún no los tenía en ${link(U.ministryRail, "su lista de resoluciones ferroviarias")}. Para la huelga de SEMAF del 10 de noviembre, la resolución fue del 6, cuatro días antes.`,
        en: `**Rodalies de Catalunya and regional trains:** the Generalitat's order of 16 November (${link(U.treballMs, "the Catalan labour department's list")}) sets 66% of the usual service at peak times (06:00 to 09:30 and 17:00 to 20:30) and 33% the rest of the day. **Cercanías, Media Distancia, AVE and long distance:** to be confirmed; the Ministry of Transport sets them and on {checked} they were not yet on ${link(U.ministryRail, "its list of rail resolutions")}. For SEMAF's strike of 10 November, the resolution was dated the 6th, four days before.`,
      },
    },
    sources: [
      {
        name: "Ordre EMT/ /2026, de 16 de novembre: serveis mínims de Rodalies i regionals el 23 de novembre, vaga de SEMAF al Grupo Renfe (llista de vagues amb serveis mínims, 17/11/2026)",
        url: U.treballMs,
        publisher: "Generalitat de Catalunya, Departament d'Empresa i Treball",
      },
      { name: "Primer Real Decreto-ley aprobado: SEMAF mueve el paro del 12 al 23 de noviembre (10/11/2026)", url: U.semaf23, publisher: "SEMAF" },
      { name: "La fuerza del colectivo da resultados (nº 2026-34, 16/11/2026)", url: U.semaf34, publisher: "SEMAF" },
      SRC.ministryRail,
    ],
  },
  {
    id: "huelga-medicos-smu-2026-11-16",
    dates: ["2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19", "2026-11-20", "2026-11-21", "2026-11-22", "2026-11-23", "2026-11-24", "2026-11-25", "2026-11-26", "2026-11-27"],
    sector: "health",
    status: "official",
    catalanEntry: "vaga-metges-smu-2026-11-16",
    // The marches of the 19th are on that day's page.
    guides: ["strike19n"],
    title: {
      ca: "vaga de metges a la sanitat pública (Sindicato Médicos Unidos)",
      es: "huelga de médicos en la sanidad pública (Sindicato Médicos Unidos)",
      en: "doctors' strike in public healthcare (Sindicato Médicos Unidos)",
    },
    label: { ca: "metges (SMU)", es: "médicos (SMU)", en: "doctors (SMU)" },
    scope: {
      ca: "Els metges, també els residents en formació (MIR), dels centres sanitaris públics dels serveis de salut de totes les comunitats autònomes i dels que gestiona l'INGESA a Ceuta i Melilla.",
      es: "Los médicos, también los residentes en formación (MIR), de los centros sanitarios públicos de los servicios de salud de todas las comunidades autónomas y de los que gestiona el INGESA en Ceuta y Melilla.",
      en: "Doctors, residents in training (MIR) included, at the public health centres of every region's health service and those run by INGESA in Ceuta and Melilla.",
    },
    hours: {
      ca: "Des de les 8.00 h del dilluns 16 fins a les 8.00 h del dissabte 28 de novembre (a Canàries, hora local), cada dia: és la primera fase d'una vaga indefinida, amb aturada total excepte els serveis mínims.",
      es: "Desde las 8.00 h del lunes 16 hasta las 8.00 h del sábado 28 de noviembre (en Canarias, hora local), todos los días: es la primera fase de una huelga indefinida, con cese total de la actividad salvo los servicios mínimos.",
      en: "From 08:00 on Monday 16 to 08:00 on Saturday 28 November (local time in the Canaries), every day: it is the first phase of an open-ended strike, a full stoppage except for minimum services.",
    },
    calledBy: {
      ca: `El Sindicato Médicos Unidos (SMU), en ${link(U.smuNotice, "el seu preavís de vaga d'àmbit estatal")}, adreçat al Ministeri de Treball, al de Sanitat i als serveis de salut. Convoca també manifestacions el dijous 19 de novembre a les 18.00 h en una vintena de ciutats, entre les quals Madrid, Barcelona, Sevilla, Bilbao i Palma (${link(U.smuMarches, "llista del sindicat")}). És una convocatòria diferent de la de CESM, que continua ajornada.`,
      es: `El Sindicato Médicos Unidos (SMU), en ${link(U.smuNotice, "su preaviso de huelga de ámbito estatal")}, dirigido al Ministerio de Trabajo, al de Sanidad y a los servicios de salud. Convoca también manifestaciones el jueves 19 de noviembre a las 18.00 h en una veintena de ciudades, entre ellas Madrid, Barcelona, Sevilla, Bilbao y Palma (${link(U.smuMarches, "lista del sindicato")}). Es una convocatoria distinta de la de CESM, que sigue aplazada.`,
      en: `Sindicato Médicos Unidos (SMU), in ${link(U.smuNotice, "its notice of a nationwide strike")} to the Ministries of Labour and Health and the regional health services. It also calls marches on Thursday 19 November at 18:00 in some twenty cities, Madrid, Barcelona, Seville, Bilbao and Palma among them (${link(U.smuMarches, "the union's list")}). It is a different call from CESM's, which stays postponed.`,
    },
    basis: {
      ca: `Hi ha ordres de serveis mínims: el sindicat publica la de cada comunitat a ${link(U.smuDocs, "la documentació de la convocatòria")}, i a Catalunya l'ordre del Departament d'Empresa i Treball del 13 de novembre és a ${link(U.treballMsList, "la llista oficial de vagues amb serveis mínims")}.`,
      es: `Hay órdenes de servicios mínimos: el sindicato publica la de cada comunidad en ${link(U.smuDocs, "la documentación de la convocatoria")}, y en Cataluña la orden del Departament d'Empresa i Treball del 13 de noviembre está en ${link(U.treballMsList, "la lista oficial de huelgas con servicios mínimos")}.`,
      en: `Minimum-services orders are out: the union posts each region's in ${link(U.smuDocs, "its strike documents")}, and in Catalonia the Department of Business and Labour's order of 13 November is on ${link(U.treballMsList, "the official list of strikes with minimum services")}.`,
    },
    minimumServices: {
      status: "published",
      short: {
        ca: "Els fixa cada comunitat; a Catalunya, urgències i unitats especials amb normalitat",
        es: "Los fija cada comunidad; en Cataluña, urgencias y unidades especiales con normalidad",
        en: "Set by each region; in Catalonia, A&E and special units run normally",
      },
      text: {
        ca: `Els fixa cada servei de salut, amb una ordre pròpia (${link(U.smuDocs, "totes, a la pàgina del sindicat")}). **A Catalunya**, ${link(U.treballMsList, "l'ordre del Departament d'Empresa i Treball del 13 de novembre")} manté amb normalitat les urgències, les unitats especials (cures intensives, unitats coronàries, hemodiàlisi, neonatologia, parts, radioteràpia i quimioteràpia), la cirurgia urgent que no es pot ajornar i l'atenció urgent dels CUAP, els PAC i els PADES; la resta de l'atenció primària, amb el 25% de la plantilla; els altres serveis, com un dia festiu (o amb el 50% on un festiu es treballa amb la plantilla d'un dia feiner), i les donacions de sang, al 50%. El transport sanitari urgent i les emergències mèdiques es mantenen.`,
        es: `Los fija cada servicio de salud, con una orden propia (${link(U.smuDocs, "todas, en la página del sindicato")}). **En Cataluña**, ${link(U.treballMsList, "la orden del Departament d'Empresa i Treball del 13 de noviembre")} mantiene con normalidad las urgencias, las unidades especiales (cuidados intensivos, unidades coronarias, hemodiálisis, neonatología, partos, radioterapia y quimioterapia), la cirugía urgente que no se puede aplazar y la atención urgente de los CUAP, los PAC y los PADES; el resto de la atención primaria, con el 25% de la plantilla; los demás servicios, como un día festivo (o con el 50% donde un festivo se trabaja con la plantilla de un día laborable), y las donaciones de sangre, al 50%. El transporte sanitario urgente y las emergencias médicas se mantienen.`,
        en: `Each health service sets them in an order of its own (${link(U.smuDocs, "all of them on the union's page")}). **In Catalonia**, ${link(U.treballMsList, "the Department of Business and Labour's order of 13 November")} keeps A&E, the special units (intensive care, coronary units, haemodialysis, neonatal care, maternity, radiotherapy and chemotherapy), urgent surgery that cannot wait and urgent care at the CUAP, PAC and PADES running normally; the rest of primary care runs with 25% of staff; other services as on a public holiday (or with 50% where a holiday is staffed like a working day), and blood donations at 50%. Urgent patient transport and medical emergencies are kept.`,
      },
    },
    sources: [
      { name: "Comunicación de huelga de ámbito estatal del personal médico del Sistema Nacional de Salud (preaviso, 4 de noviembre de 2026)", url: U.smuNotice, publisher: "Sindicato Médicos Unidos (SMU)" },
      { name: "Documentación de la convocatoria: preavisos y órdenes de servicios mínimos por comunidad", url: U.smuDocs, publisher: "Sindicato Médicos Unidos (SMU)" },
      { name: "Manifestaciones del 19 de noviembre de 2026", url: U.smuMarches, publisher: "Sindicato Médicos Unidos (SMU)" },
      { name: "Informació de vagues amb serveis mínims (e-Tauler): ordre del 13 de novembre de 2026, assistència sanitària de l'ICS i del SISCAT", url: U.treballMsList, publisher: "Generalitat de Catalunya, Departament d'Empresa i Treball" },
    ],
  },
  {
    id: "huelga-limpieza-bizkaia-2026-11-17",
    dates: ["2026-11-17", "2026-11-18", "2026-11-19", "2026-11-20"],
    sector: "services",
    status: "official",
    title: {
      ca: "vaga de la neteja d'edificis i locals a Biscaia (ELA)",
      es: "huelga de la limpieza de edificios y locales en Bizkaia (ELA)",
      en: "building-cleaning strike in Bizkaia (ELA)",
    },
    label: { ca: "neteja a Biscaia", es: "limpieza en Bizkaia", en: "cleaning in Bizkaia" },
    scope: {
      ca: "Les plantilles de la neteja d'edificis i locals de la província de Biscaia, també la neteja de l'aeroport de Bilbao.",
      es: "Las plantillas de la limpieza de edificios y locales de la provincia de Bizkaia, también la limpieza del aeropuerto de Bilbao.",
      en: "Building and premises cleaning staff in the province of Bizkaia, cleaning at Bilbao airport included.",
    },
    hours: {
      ca: "Tota la jornada, del dimarts 17 al divendres 20 de novembre, segons la resolució del Ministeri de Transports.",
      es: "Toda la jornada, del martes 17 al viernes 20 de noviembre, según la resolución del Ministerio de Transportes.",
      en: "The whole working day, Tuesday 17 to Friday 20 November, according to the Ministry of Transport's resolution.",
    },
    calledBy: {
      ca: `El sindicat ELA, que va comunicar la vaga al Govern Basc el 12 d'octubre de 2026, segons ${link(U.elaResolution, "la resolució del Ministeri de Transports")}.`,
      es: `El sindicato ELA, que comunicó la huelga al Gobierno Vasco el 12 de octubre de 2026, según ${link(U.elaResolution, "la resolución del Ministerio de Transportes")}.`,
      en: `The ELA union, which notified the Basque Government of the strike on 12 October 2026, according to ${link(U.elaResolution, "the Ministry of Transport's resolution")}.`,
    },
    basis: {
      ca: `${link(U.elaResolution, "La resolució de serveis mínims del Ministeri de Transports del 13 de novembre")} per a l'aeroport de Bilbao, a ${link(U.ministryAir, "la seva llista del transport aeri")}.`,
      es: `${link(U.elaResolution, "La resolución de servicios mínimos del Ministerio de Transportes del 13 de noviembre")} para el aeropuerto de Bilbao, en ${link(U.ministryAir, "su lista del transporte aéreo")}.`,
      en: `${link(U.elaResolution, "The Ministry of Transport's minimum-services resolution of 13 November")} for Bilbao airport, on ${link(U.ministryAir, "its air-transport list")}.`,
    },
    minimumServices: {
      status: "published",
      short: {
        ca: "A l'aeroport de Bilbao, fixats pel Ministeri de Transports",
        es: "En el aeropuerto de Bilbao, fijados por el Ministerio de Transportes",
        en: "At Bilbao airport, set by the Ministry of Transport",
      },
      text: {
        ca: `A l'aeroport de Bilbao, ${link(U.elaResolution, "la resolució del Ministeri de Transports del 13 de novembre")} fixa el **50% de la plantilla programada** per als lavabos de les terminals, les dependències tècniques i de control del trànsit aeri i l'exterior de les terminals al costat aire, i el **25%** per a la resta de zones públiques; la neteja dels avions es manté segons el tipus de vol (tots els d'emergència, la majoria dels que van a les illes). És l'única ordre d'aquesta vaga que hem trobat publicada.`,
        es: `En el aeropuerto de Bilbao, ${link(U.elaResolution, "la resolución del Ministerio de Transportes del 13 de noviembre")} fija el **50% de la plantilla programada** para los aseos de las terminales, las dependencias técnicas y de control del tráfico aéreo y el exterior de las terminales en el lado aire, y el **25%** para el resto de zonas públicas; la limpieza de los aviones se mantiene según el tipo de vuelo (todos los de emergencia, la mayoría de los que van a las islas). Es la única orden de esta huelga que hemos encontrado publicada.`,
        en: `At Bilbao airport, ${link(U.elaResolution, "the Ministry of Transport's resolution of 13 November")} sets **50% of scheduled staff** for terminal toilets, the technical and air-traffic-control premises and the outside of the terminals airside, and **25%** for the other public areas; aircraft cleaning is kept according to the type of flight (every emergency flight, most flights to the islands). It is the only order for this strike we found published.`,
      },
    },
    sources: [
      { name: "Resolución de servicios mínimos en el transporte aéreo durante la huelga sectorial de limpieza de edificios y locales en Bizkaia convocada por ELA (13 de noviembre de 2026)", url: U.elaResolution, publisher: MINISTRY },
      SRC.ministryAir,
    ],
  },
  {
    id: "huelga-estudiantil-2026-11-20",
    dates: ["2026-11-20"],
    sector: "education",
    status: "called",
    guides: ["strike20n"],
    title: {
      ca: "vaga estudiantil europea",
      es: "huelga estudiantil europea",
      en: "European student strike",
    },
    label: { ca: "vaga estudiantil", es: "huelga estudiantil", en: "student strike" },
    scope: {
      ca: "Estudiants, des de 3r d'ESO. No és una vaga laboral: els professors i els centres no hi estan convocats.",
      es: "Estudiantes, desde 3.º de ESO. No es una huelga laboral: el profesorado y los centros no están convocados.",
      en: "Students, from the third year of secondary school (ESO). It is not a labour strike: teachers and schools are not called out.",
    },
    hours: {
      ca: `Tota la jornada lectiva, de matí i de tarda, segons ${link(U.studentsNotice, "la comunicació que el Sindicato de Estudiantes fa arribar a les direccions dels centres")}; mobilitzacions a les 12 h.`,
      es: `Toda la jornada lectiva, también la de la tarde, según ${link(U.studentsNotice, "la comunicación que el Sindicato de Estudiantes hace llegar a las direcciones de los centros")}; movilizaciones a las 12 h.`,
      en: `The whole school day, morning and afternoon, according to ${link(U.studentsNotice, "the notice Sindicato de Estudiantes hands to school heads")}; demonstrations at 12:00.`,
    },
    calledBy: {
      ca: `El Sindicato de Estudiantes, amb organitzacions estudiantils d'altres països europeus, a ${link(U.students, "la seva convocatòria del 30 d'octubre")}.`,
      es: `El Sindicato de Estudiantes, con organizaciones estudiantiles de otros países europeos, en ${link(U.students, "su convocatoria del 30 de octubre")}.`,
      en: `The students' union Sindicato de Estudiantes, with student organisations from other European countries, in ${link(U.students, "its call of 30 October")}.`,
    },
    basis: {
      ca: "Consta a l'avís de l'organització estudiantil que la convoca.",
      es: "Consta en el aviso de la organización estudiantil que la convoca.",
      en: "It rests on the notice of the student organisation that calls it.",
    },
    minimumServices: {
      status: "none",
      short: { ca: "No és una vaga laboral", es: "No es una huelga laboral", en: "Not a labour strike" },
      text: {
        ca: "La convoca una organització estudiantil i s'adreça als estudiants: no és una vaga laboral.",
        es: "La convoca una organización estudiantil y se dirige a los estudiantes: no es una huelga laboral.",
        en: "A student organisation calls it and it is addressed to students: it is not a labour strike.",
      },
    },
    sources: [
      { name: "20N: huelga estudiantil europea (30 de octubre de 2026)", url: U.students, publisher: "Sindicato de Estudiantes" },
      { name: "Comunicación oficial a los equipos directivos: huelga de estudiantes del viernes 20 de noviembre de 2026", url: U.studentsNotice, publisher: "Sindicato de Estudiantes" },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Open-ended strikes at airports                                             */
/* -------------------------------------------------------------------------- */

/**
 * The three strikes with a minimum-services resolution in force on the
 * Ministry of Transport's air list on 10 Nov 2026 ("los efectos de la
 * resolución serán del 1 de octubre hasta el 30 de noviembre de 2026").
 * Wording follows the list's own text; the resolutions' figures are not
 * restated.
 */
export const SPAIN_OPEN_STRIKES: SpainOpenStrike[] = [
  {
    id: "huelga-saerco-controladores",
    msValidUntil: "2026-11-30",
    title: {
      ca: "Controladors aeris de SAERCO: nou aeroports",
      es: "Controladores aéreos de SAERCO: nueve aeropuertos",
      en: "SAERCO air traffic controllers: nine airports",
    },
    text: {
      ca: `Vaga indefinida convocada pels sindicats USCA i CCOO a les torres de control que gestiona SAERCO, des de les 0.00 h del 17 d'abril de 2026 (${link(U.usca, "USCA")}). Afecta els aeroports de Jerez de la Frontera, la Corunya, Madrid-Cuatro Vientos, Sevilla, Vigo, El Hierro, Fuerteventura, Lanzarote i La Palma. La ${link(U.saercoResolution, "resolució de serveis mínims")} vigent té efectes de l'1 d'octubre al 30 de novembre de 2026, segons ${link(U.ministryAir, "la llista del Ministeri de Transports")}.`,
      es: `Huelga indefinida convocada por los sindicatos USCA y CCOO en las torres de control que gestiona SAERCO, desde las 0.00 h del 17 de abril de 2026 (${link(U.usca, "USCA")}). Afecta a los aeropuertos de Jerez de la Frontera, A Coruña, Madrid-Cuatro Vientos, Sevilla, Vigo, El Hierro, Fuerteventura, Lanzarote y La Palma. La ${link(U.saercoResolution, "resolución de servicios mínimos")} vigente tiene efectos del 1 de octubre al 30 de noviembre de 2026, según ${link(U.ministryAir, "la lista del Ministerio de Transportes")}.`,
      en: `An indefinite strike called by the unions USCA and CCOO at the control towers run by SAERCO, from 00:00 on 17 April 2026 (${link(U.usca, "USCA")}). It affects the airports of Jerez de la Frontera, A Coruña, Madrid-Cuatro Vientos, Seville, Vigo, El Hierro, Fuerteventura, Lanzarote and La Palma. The ${link(U.saercoResolution, "minimum-services resolution")} in force runs from 1 October to 30 November 2026, according to ${link(U.ministryAir, "the Ministry of Transport's list")}.`,
    },
    sources: [
      { name: "USCA y CCOO convocan huelga indefinida en SAERCO (7 de abril de 2026)", url: U.usca, publisher: "USCA" },
      { name: "Resolución de servicios mínimos de la huelga indefinida en SAERCO (efectos del 1 de octubre al 30 de noviembre de 2026)", url: U.saercoResolution, publisher: MINISTRY },
      SRC.ministryAir,
    ],
  },
  {
    id: "huelga-groundforce-el-prat",
    msValidUntil: "2026-11-30",
    title: {
      ca: "Groundforce: personal de terra a l'aeroport de Barcelona-El Prat",
      es: "Groundforce: personal de tierra en el aeropuerto de Barcelona-El Prat",
      en: "Groundforce: ground staff at Barcelona-El Prat airport",
    },
    text: {
      ca: `Vaga convocada pel sindicat CGT a Groundforce BCN 2023 UTE, a l'aeroport Josep Tarradellas Barcelona-El Prat, indefinida des del 4 d'agost de 2026, 24 hores cada dia. La ${link(U.groundforceResolution, "resolució de serveis mínims")} vigent té efectes de l'1 d'octubre al 30 de novembre de 2026, segons ${link(U.ministryAir, "la llista del Ministeri de Transports")}.`,
      es: `Huelga convocada por el sindicato CGT en Groundforce BCN 2023 UTE, en el aeropuerto Josep Tarradellas Barcelona-El Prat, indefinida desde el 4 de agosto de 2026, 24 horas cada día. La ${link(U.groundforceResolution, "resolución de servicios mínimos")} vigente tiene efectos del 1 de octubre al 30 de noviembre de 2026, según ${link(U.ministryAir, "la lista del Ministerio de Transportes")}.`,
      en: `A strike called by the CGT union at Groundforce BCN 2023 UTE, at Josep Tarradellas Barcelona-El Prat airport, indefinite since 4 August 2026, 24 hours every day. The ${link(U.groundforceResolution, "minimum-services resolution")} in force runs from 1 October to 30 November 2026, according to ${link(U.ministryAir, "the Ministry of Transport's list")}.`,
    },
    sources: [
      { name: "Resolución de servicios mínimos de la huelga en Groundforce BCN 2023 UTE (efectos del 1 de octubre al 30 de noviembre de 2026)", url: U.groundforceResolution, publisher: MINISTRY },
      SRC.ministryAir,
    ],
  },
  {
    id: "huelga-outsmart-barajas",
    msValidUntil: "2026-11-30",
    title: {
      ca: "Outsmart: sistema d'equipatges de Madrid-Barajas",
      es: "Outsmart: sistema de equipajes de Madrid-Barajas",
      en: "Outsmart: baggage system at Madrid-Barajas",
    },
    text: {
      ca: `Vaga convocada pel sindicat ASC a Outsmart Assistance S.L.: aturades parcials de 5.00 a 7.00 h i de 13.00 a 15.00 h els dilluns, dijous, divendres, dissabtes i diumenges, que afecten el sistema automatitzat de tractament d'equipatges (SATE) de totes les terminals de l'aeroport Adolfo Suárez Madrid-Barajas. La ${link(U.outsmartResolution, "resolució de serveis mínims")} vigent té efectes de l'1 d'octubre al 30 de novembre de 2026, segons ${link(U.ministryAir, "la llista del Ministeri de Transports")}.`,
      es: `Huelga convocada por el sindicato ASC en Outsmart Assistance S.L.: paros parciales de 5.00 a 7.00 h y de 13.00 a 15.00 h los lunes, jueves, viernes, sábados y domingos, que afectan al sistema automatizado de tratamiento de equipajes (SATE) de todas las terminales del aeropuerto Adolfo Suárez Madrid-Barajas. La ${link(U.outsmartResolution, "resolución de servicios mínimos")} vigente tiene efectos del 1 de octubre al 30 de noviembre de 2026, según ${link(U.ministryAir, "la lista del Ministerio de Transportes")}.`,
      en: `A strike called by the ASC union at Outsmart Assistance S.L.: partial stoppages from 05:00 to 07:00 and from 13:00 to 15:00 on Mondays, Thursdays, Fridays, Saturdays and Sundays, affecting the automated baggage handling system (SATE) in every terminal of Adolfo Suárez Madrid-Barajas airport. The ${link(U.outsmartResolution, "minimum-services resolution")} in force runs from 1 October to 30 November 2026, according to ${link(U.ministryAir, "the Ministry of Transport's list")}.`,
    },
    sources: [
      { name: "Resolución de servicios mínimos de la huelga en Outsmart Assistance S.L., SATE de Madrid-Barajas (efectos del 1 de octubre al 30 de noviembre de 2026)", url: U.outsmartResolution, publisher: MINISTRY },
      SRC.ministryAir,
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Searched for, but not happening                                            */
/* -------------------------------------------------------------------------- */

export const SPAIN_NOT_HAPPENING: SpainNotHappening[] = [
  {
    id: "medicos-estatal-aplazada",
    title: {
      ca: "Vaga indefinida de metges a tot Espanya: ajornada",
      es: "Huelga indefinida de médicos en toda España: aplazada",
      en: "Indefinite doctors' strike across Spain: postponed",
    },
    text: {
      ca: `El comitè de vaga (CESM, SMA i SME) va ajornar les aturades indefinides previstes a partir del 28 d'octubre després de la convocatòria d'eleccions generals. Segons ${link(U.cesm, "el seu avís del 7 d'octubre")}, la convocatòria continua vigent i la mobilització es podrà reactivar.`,
      es: `El comité de huelga (CESM, SMA y SME) aplazó los paros indefinidos previstos a partir del 28 de octubre tras la convocatoria de elecciones generales. Según ${link(U.cesm, "su aviso del 7 de octubre")}, la convocatoria «continúa vigente» y la movilización podrá reactivarse.`,
      en: `The strike committee (the doctors' unions CESM, SMA and SME) postponed the indefinite stoppages due from 28 October after the general election was called. According to ${link(U.cesm, "its notice of 7 October")}, the call remains in force and the action may be resumed.`,
    },
    sources: [{ name: "El Comité de Huelga aplaza los paros indefinidos tras la convocatoria electoral (7 de octubre de 2026)", url: U.cesm, publisher: "CESM" }],
  },
  {
    id: "ouigo-desconvocada",
    title: {
      ca: "Maquinistes d'Ouigo, 6 i 9 de novembre i 4 i 8 de desembre: desconvocada",
      es: "Maquinistas de Ouigo, 6 y 9 de noviembre y 4 y 8 de diciembre: desconvocada",
      en: "Ouigo train drivers, 6 and 9 November and 4 and 8 December: called off",
    },
    text: {
      ca: `SEMAF va desconvocar aquestes aturades després de signar un acord amb l'empresa, segons ${link(U.semafOuigo, "el seu comunicat")}.`,
      es: `SEMAF desconvocó estos paros tras firmar un acuerdo con la empresa, según ${link(U.semafOuigo, "su comunicado")}.`,
      en: `SEMAF called these stoppages off after signing an agreement with the company, according to ${link(U.semafOuigo, "its notice")}.`,
    },
    sources: [{ name: "Ouigo firma todas las reivindicaciones: desconvocados los paros", url: U.semafOuigo, publisher: "SEMAF" }],
  },
  {
    id: "semaf-renfe-12-noviembre-trasladada",
    title: {
      ca: "Maquinistes de Renfe (SEMAF), 12 de novembre: desconvocada, nova vaga el 23",
      es: "Maquinistas de Renfe (SEMAF), 12 de noviembre: desconvocada, nueva huelga el 23",
      en: "Renfe train drivers (SEMAF), 12 November: called off, new strike on the 23rd",
    },
    text: {
      ca: `El 10 de novembre SEMAF va decidir «sustituir el paro previsto para el día 12 de noviembre por una nueva convocatoria de huelga el día 23 de noviembre», segons ${link(U.semaf23, "el seu comunicat")}, i Renfe avisa que el 12 «el servicio ferroviario se prestará conforme a la programación habitual».`,
      es: `El 10 de noviembre SEMAF decidió «sustituir el paro previsto para el día 12 de noviembre por una nueva convocatoria de huelga el día 23 de noviembre», según ${link(U.semaf23, "su comunicado")}, y Renfe avisa de que el 12 «el servicio ferroviario se prestará conforme a la programación habitual».`,
      en: `On 10 November SEMAF decided to "sustituir el paro previsto para el día 12 de noviembre por una nueva convocatoria de huelga el día 23 de noviembre" (replace the 12 November stoppage with a new strike call on 23 November), according to ${link(U.semaf23, "its notice")}, and Renfe says that on the 12th trains will run to the usual timetable.`,
    },
    sources: [{ name: "Primer Real Decreto-ley aprobado: SEMAF mueve el paro del 12 al 23 de noviembre (10/11/2026)", url: U.semaf23, publisher: "SEMAF" }],
  },
  {
    id: "alferro-trasladada",
    title: {
      ca: "ALFERRO, 10 i 12 de novembre: traslladada al dia 17",
      es: "ALFERRO, 10 y 12 de noviembre: trasladada al día 17",
      en: "ALFERRO, 10 and 12 November: moved to the 17th",
    },
    text: {
      ca: `El comitè de vaga del sindicat ferroviari ALFERRO va traslladar les seves jornades del 10 i el 12 al 17 de novembre, segons ${link(U.alferro80, "el seu comunicat 80/2026")}. La vaga de SEMAF a Renfe del 10 i el 12 és una altra convocatòria.`,
      es: `El comité de huelga del sindicato ferroviario ALFERRO trasladó sus jornadas del 10 y el 12 al 17 de noviembre, según ${link(U.alferro80, "su comunicado 80/2026")}. La huelga de SEMAF en Renfe del 10 y el 12 es otra convocatoria.`,
      en: `The strike committee of the rail union ALFERRO moved its strike days from the 10th and the 12th to 17 November, according to ${link(U.alferro80, "its notice 80/2026")}. SEMAF's strike at Renfe on the 10th and the 12th is a separate call.`,
    },
    sources: [{ name: "Comunicado 80/2026: modificación de las fechas de huelga de noviembre de 2026", url: U.alferro80, publisher: "ALFERRO" }],
  },
  {
    id: "mataderos-aves-sin-convocar",
    title: {
      ca: "Escorxadors d'aus i conills: sense vaga convocada",
      es: "Mataderos de aves y conejos: sin huelga convocada",
      en: "Poultry and rabbit slaughterhouses: no strike called",
    },
    text: {
      ca: `Després de la mediació al SIMA del 28 d'octubre, la possible convocatòria de vaga va quedar ajornada i les parts es tornen a reunir el 16 de novembre, segons ${link(U.poultry, "UGT FICA")}. És un conveni diferent del de les indústries càrnies.`,
      es: `Tras la mediación en el SIMA del 28 de octubre, la posible convocatoria de huelga quedó aplazada y las partes vuelven a reunirse el 16 de noviembre, según ${link(U.poultry, "UGT FICA")}. Es un convenio distinto del de las industrias cárnicas.`,
      en: `After mediation at SIMA on 28 October, the possible strike call was put off and the parties meet again on 16 November, according to ${link(U.poultry, "UGT FICA")}. It is a different collective agreement from the meat industry's.`,
    },
    sources: [{ name: "Avances en el SIMA para desbloquear el convenio de mataderos de aves y conejos (29 de octubre de 2026)", url: U.poultry, publisher: "UGT FICA" }],
  },
];

/* -------------------------------------------------------------------------- */
/* Law                                                                        */
/* -------------------------------------------------------------------------- */

export const SPAIN_FRAMEWORK_SOURCES: B2Source[] = [
  { name: "Constitución Española, artículo 28.2", url: U.constitution, publisher: "Boletín Oficial del Estado" },
  { name: "Real Decreto-ley 17/1977, de 4 de marzo, sobre relaciones de trabajo", url: U.rdl17, publisher: "Boletín Oficial del Estado" },
  SRC.ministryRail,
  SRC.ministryAir,
];
