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

/** The day every source below was last read. Tests fail 4 days after it, and on the Monday after its week. */
export const STRIKES_SPAIN_AS_OF = "2026-11-10";

/** Printed as the page's "last verified" date. */
export const STRIKES_SPAIN_VERIFIED = STRIKES_SPAIN_AS_OF;

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
  treballMs: STRIKE_URLS.treballMs,
  // Meat industry, 9 to 13 Nov.
  meatCall: `${FICA}/3806?catid=43`,
  meatMediation: `${FICA}/3815?catid=43`,
  meatFirstDay: `${FICA}/3847?catid=43`,
  poultry: `${FICA}/3831?catid=43`,
  // Students, 20 Nov.
  students: "https://www.sindicatodeestudiantes.net/index.php/noticias/internacional/20n-huelga-estudiantil-europea",
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
    dates: ["2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13"],
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
      ca: `Consta als avisos dels sindicats: la mediació prèvia al SIMA va acabar sense acord i van mantenir la convocatòria (${link(U.meatMediation, "UGT FICA, 22 d'octubre")}), i el 9 de novembre UGT FICA va informar de la primera jornada de vaga (${link(U.meatFirstDay, "la seva nota")}).`,
      es: `Consta en los avisos de los sindicatos: la mediación previa en el SIMA terminó sin acuerdo y mantuvieron la convocatoria (${link(U.meatMediation, "UGT FICA, 22 de octubre")}), y el 9 de noviembre UGT FICA informó de la primera jornada de huelga (${link(U.meatFirstDay, "su nota")}).`,
      en: `It rests on the unions' own notices: the mediation at SIMA beforehand ended without agreement and they kept the call (${link(U.meatMediation, "UGT FICA, 22 October")}), and on 9 November UGT FICA reported on the first strike day (${link(U.meatFirstDay, "its note")}).`,
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
    status: "called",
    catalanEntry: "vaga-ferroviaria-2026-11-17",
    guides: ["strikes"],
    title: {
      ca: "vaga ferroviària a Adif, Renfe i les operadores privades",
      es: "huelga ferroviaria en Adif, Renfe y las operadoras privadas",
      en: "rail strike at Adif, Renfe and the private operators",
    },
    label: { ca: "vaga ferroviària", es: "huelga ferroviaria", en: "rail strike" },
    scope: {
      ca: "El dia 17: Adif i el Grup Renfe, i els maquinistes de Renfe, Iryo, Ouigo, Transfesa, Continental Rail, Tracción Rail, Captrain i Medway. El dia 19: Adif.",
      es: "El día 17: Adif y el Grupo Renfe, y los maquinistas de Renfe, Iryo, Ouigo, Transfesa, Continental Rail, Tracción Rail, Captrain y Medway. El día 19: Adif.",
      en: "On the 17th: Adif (the track operator) and the Renfe group, plus train drivers at Renfe, Iryo, Ouigo, Transfesa, Continental Rail, Tracción Rail, Captrain and Medway. On the 19th: Adif.",
    },
    hours: {
      ca: "Vaga de 24 hores el dia 17, segons CCOO; a Adif, aturades de 24 hores el 17 i el 19, segons l'SCF.",
      es: "Huelga de 24 horas el día 17, según CCOO; en Adif, paros de 24 horas el 17 y el 19, según el SCF.",
      en: "A 24-hour strike on the 17th, according to CCOO; at Adif, 24-hour stoppages on the 17th and the 19th, according to SCF.",
    },
    calledBy: {
      ca: `El dia 17, els sindicats del Comitè General d'Empresa d'Adif (${link(U.ccooRail17, "CCOO, 3 de novembre")}), als quals es va sumar el Comitè General d'Empresa de Renfe (${link(U.alferro80, "ALFERRO, comunicat 80/2026")}), i SEMAF amb una convocatòria pròpia per als maquinistes de totes les operadores (${link(U.semafCuerpo, "SEMAF, 5 de novembre")}). El 17 i el 19, el sindicat SCF a Adif (${link(U.scfAdif, "SCF, 6 de novembre")}).`,
      es: `El día 17, los sindicatos del Comité General de Empresa de Adif (${link(U.ccooRail17, "CCOO, 3 de noviembre")}), a los que se sumó el Comité General de Empresa de Renfe (${link(U.alferro80, "ALFERRO, comunicado 80/2026")}), y SEMAF con una convocatoria propia para los maquinistas de todas las operadoras (${link(U.semafCuerpo, "SEMAF, 5 de noviembre")}). El 17 y el 19, el sindicato SCF en Adif (${link(U.scfAdif, "SCF, 6 de noviembre")}).`,
      en: `On the 17th, the unions on Adif's company-wide works council (${link(U.ccooRail17, "CCOO, 3 November")}), joined by Renfe's works council (${link(U.alferro80, "ALFERRO, notice 80/2026")}), and SEMAF with a call of its own for drivers at every operator (${link(U.semafCuerpo, "SEMAF, 5 November")}). On the 17th and the 19th, the SCF union at Adif (${link(U.scfAdif, "SCF, 6 November")}).`,
    },
    basis: {
      ca: `Consta als comunicats dels sindicats. El {checked} no hi havia cap resolució de serveis mínims per a aquests dies a ${link(U.ministryRail, "la llista del Ministeri de Transports")}.`,
      es: `Consta en los comunicados de los sindicatos. El {checked} no había ninguna resolución de servicios mínimos para estos días en ${link(U.ministryRail, "la lista del Ministerio de Transportes")}.`,
      en: `It rests on the unions' own notices. On {checked} there was no minimum-services resolution for these days on ${link(U.ministryRail, "the Ministry of Transport's list")}.`,
    },
    minimumServices: {
      status: "pending",
      short: { ca: "Per confirmar, encara no publicats", es: "Por confirmar, aún no publicados", en: "To be confirmed, not published yet" },
      text: {
        ca: `Per confirmar. El {checked} el Ministeri de Transports no havia publicat cap resolució per al 17 ni per al 19 a ${link(U.ministryRail, "la seva llista de resolucions ferroviàries")}, que és on sortiran. Els de Rodalies de Catalunya els fixa la Generalitat i sortiran a ${link(U.treballMs, "la llista del Departament d'Empresa i Treball")}.`,
        es: `Por confirmar. El {checked} el Ministerio de Transportes no había publicado ninguna resolución para el 17 ni para el 19 en ${link(U.ministryRail, "su lista de resoluciones ferroviarias")}, que es donde saldrán. Los de Rodalies de Catalunya los fija la Generalitat y saldrán en ${link(U.treballMs, "la lista del Departament d'Empresa i Treball")}.`,
        en: `To be confirmed. On {checked} the Ministry of Transport had published no resolution for the 17th or the 19th on ${link(U.ministryRail, "its list of rail resolutions")}, which is where they will appear. Those for Rodalies in Catalonia are set by the Generalitat and will appear on ${link(U.treballMs, "the Catalan labour department's list")}.`,
      },
    },
    sources: [
      { name: "CCOO anuncia movilizaciones los días 16 y 17 de noviembre (3 de noviembre de 2026)", url: U.ccooRail17, publisher: "CCOO, Sector Ferroviario" },
      { name: "Comunicado 80/2026: modificación de las fechas de huelga de noviembre de 2026", url: U.alferro80, publisher: "ALFERRO" },
      { name: "Encuentro con el ministro Carlos Cuerpo: alcance de las movilizaciones (5 de noviembre de 2026)", url: U.semafCuerpo, publisher: "SEMAF" },
      { name: "SCFCOM 33: SCF convoca huelga en Adif (6 de noviembre de 2026)", url: U.scfAdif, publisher: "Sindicato de Circulación Ferroviario (SCF)" },
      SRC.ministryRail,
      { name: "Serveis mínims en cas de vaga", url: U.treballMs, publisher: "Generalitat de Catalunya, Departament d'Empresa i Treball" },
    ],
  },
  {
    id: "huelga-renfe-2026-11-23",
    dates: ["2026-11-23"],
    sector: "rail",
    status: "called",
    catalanEntry: "vaga-renfe-2026-11-23",
    guides: ["strikeRenfe"],
    title: {
      ca: "vaga de maquinistes (SEMAF)",
      es: "huelga de maquinistas (SEMAF)",
      en: "train drivers' strike (SEMAF)",
    },
    label: { ca: "maquinistes (SEMAF)", es: "maquinistas (SEMAF)", en: "train drivers (SEMAF)" },
    scope: {
      ca: "SEMAF encara no n'ha publicat l'abast. Substitueix les aturades parcials del 12 de novembre, que eren al Grup Renfe.",
      es: "SEMAF aún no ha publicado su alcance. Sustituye a los paros parciales del 12 de noviembre, que eran en el Grupo Renfe.",
      en: "SEMAF has not yet published its scope. It replaces the partial stoppages of 12 November, which were at the Renfe group.",
    },
    calledBy: {
      ca: `El sindicat de maquinistes SEMAF, que el 10 de novembre va decidir «sustituir el paro previsto para el día 12 de noviembre por una nueva convocatoria de huelga el día 23 de noviembre», segons ${link(U.semaf23, "el seu comunicat")}.`,
      es: `El sindicato de maquinistas SEMAF, que el 10 de noviembre decidió «sustituir el paro previsto para el día 12 de noviembre por una nueva convocatoria de huelga el día 23 de noviembre», según ${link(U.semaf23, "su comunicado")}.`,
      en: `The train drivers' union SEMAF, which on 10 November decided to "sustituir el paro previsto para el día 12 de noviembre por una nueva convocatoria de huelga el día 23 de noviembre" (replace the 12 November stoppage with a new strike call on 23 November), according to ${link(U.semaf23, "its notice")}.`,
    },
    basis: {
      ca: `Consta al comunicat del sindicat. El {checked} no hi havia cap resolució de serveis mínims per a aquest dia a ${link(U.ministryRail, "la llista del Ministeri de Transports")}.`,
      es: `Consta en el comunicado del sindicato. El {checked} no había ninguna resolución de servicios mínimos para este día en ${link(U.ministryRail, "la lista del Ministerio de Transportes")}.`,
      en: `It rests on the union's own notice. On {checked} there was no minimum-services resolution for this day on ${link(U.ministryRail, "the Ministry of Transport's list")}.`,
    },
    minimumServices: {
      status: "pending",
      short: { ca: "Per confirmar, encara no publicats", es: "Por confirmar, aún no publicados", en: "To be confirmed, not published yet" },
      text: {
        ca: `Per confirmar. Els fixa el Ministeri de Transports i sortiran a ${link(U.ministryRail, "la seva llista de resolucions ferroviàries")}; els de Rodalies de Catalunya, a ${link(U.treballMs, "la llista del Departament d'Empresa i Treball")}.`,
        es: `Por confirmar. Los fija el Ministerio de Transportes y saldrán en ${link(U.ministryRail, "su lista de resoluciones ferroviarias")}; los de Rodalies de Catalunya, en ${link(U.treballMs, "la lista del Departament d'Empresa i Treball")}.`,
        en: `To be confirmed. The Ministry of Transport sets them and they will appear on ${link(U.ministryRail, "its list of rail resolutions")}; those for Rodalies in Catalonia on ${link(U.treballMs, "the Catalan labour department's list")}.`,
      },
    },
    sources: [
      { name: "Primer Real Decreto-ley aprobado: SEMAF mueve el paro del 12 al 23 de noviembre (10/11/2026)", url: U.semaf23, publisher: "SEMAF" },
      SRC.ministryRail,
      { name: "Serveis mínims de vagues", url: U.treballMs, publisher: "Departament d'Empresa i Treball" },
    ],
  },
  {
    id: "huelga-estudiantil-2026-11-20",
    dates: ["2026-11-20"],
    sector: "education",
    status: "called",
    title: {
      ca: "vaga estudiantil europea",
      es: "huelga estudiantil europea",
      en: "European student strike",
    },
    label: { ca: "vaga estudiantil", es: "huelga estudiantil", en: "student strike" },
    scope: {
      ca: "Estudiants. No és una vaga laboral.",
      es: "Estudiantes. No es una huelga laboral.",
      en: "Students. It is not a labour strike.",
    },
    hours: {
      ca: "Mobilitzacions a les 12 h, segons la convocatòria.",
      es: "Movilizaciones a las 12 h, según la convocatoria.",
      en: "Demonstrations at 12:00, according to the call.",
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
    sources: [{ name: "20N: huelga estudiantil europea (30 de octubre de 2026)", url: U.students, publisher: "Sindicato de Estudiantes" }],
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
