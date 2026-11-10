import type { CityService, StateService, Strike11nCity } from "./strike-11n-cities-model";
import { strike11nCityRef } from "./strike-11n-city-paths";
import { STRIKE_URLS } from "./strikes";

/**
 * The facts of the 11N city pages (`strike-11n-cities.ts`): the one file the
 * strike watch edits. Read on 5-6 Nov 2026 on the official sources (fact
 * pack: research_notes/x10/strike-11n-cities-factpack.md); the orders that
 * came out afterwards (flights, Galicia, Andalucía's health order, Comunitat
 * Valenciana, Illes Balears, Palma, Aragón, Zaragoza's tram, Canarias and
 * Guaguas) were read on 10 Nov 2026 in each bulletin.
 *
 * HOW TO UPDATE, when an order or notice comes out:
 *  - Regional or local service: in its city's `services`, set `status:
 *    "published"`, write `text` with the order's own figure and the link
 *    inline (e.g. `El 50% del servicio, según [la Orden 1234/2026 de la
 *    Consejería de …](https://…)`) and set `source` to the order. One order
 *    often covers several services and cities (Valencia and Alicante, Sevilla
 *    and Málaga, Vigo and A Coruña): fill each of them, and write the city's
 *    `msSummary` (the lead's one-line answer).
 *  - Trains (Renfe, Cercanías) or flights: fill `STATE_SERVICES.rail` or
 *    `.air` once; every page picks it up. (Cercanías Bilbao is the Basque
 *    Government's since 2025: it is a service of the Bilbao page.)
 *  - Demonstrations: only when the organisers publish the time AND the place;
 *    write it as theirs, with the link, in `demos` and `demoShort`.
 *  - Move STRIKE_11N_CITIES_AS_OF to the day you checked, run the tests,
 *    deploy and publish `?only=strike-11n-cities`.
 *  - 12 Nov: move the date past the strike (the lead switches to the past)
 *    and record what was set; a test fails from 13 Nov until you do.
 */

/** The day the city pages were last checked against the sources. What the lead says is decided against it, never the clock. */
export const STRIKE_11N_CITIES_AS_OF = "2026-11-10";

/** The facts were re-read on the as-of day: one constant to move. */
export const STRIKE_11N_CITIES_VERIFIED = STRIKE_11N_CITIES_AS_OF;

const U = STRIKE_URLS;
const link = (href: string, label: string) => `[${label}](${href})`;
const ref = strike11nCityRef;

/** The State-level sources these pages add to STRIKE_URLS. */
export const CITY_STATE_URLS = {
  // Ministry of Transport, air minimum-services resolutions.
  ministryAir: "https://www.transportes.gob.es/aviacion-civil/informacion-util-al-pasajero/huelga-servicios-minimos",
  // The 11N one: signed on 6 Nov 2026 by the Secretario de Estado de Transportes y Movilidad Sostenible (52 pp., read 10 Nov).
  airOrder: "https://www.transportes.gob.es/recursos_mfom/paginabasica/recursos/53_26-11-11-resolucion_huelga_general_vi.pdf",
  // Real Decreto 1479/1988 (State offices during a strike), in force, read on the BOE on 6 Nov 2026.
  rd1479: "https://www.boe.es/eli/es/rd/1988/12/09/1479",
  // BOE-A-2026-23157 (BOE núm. 274, 4 Nov 2026): private security on 11N, 90% in public transport.
  securityOrder: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-23157",
  // BOE-A-2026-23329 (6 Nov 2026), Orden INT/1170/2026: Correos on 11N (postal vote for 29N); it also
  // records the strike's hours as called: 0 to 24 h, from the first shift to the last.
  correosOrder: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-23329",
} as const;

/**
 * Trains and flights: the Ministry of Transport sets them by resolution for
 * the whole country (Rodalies de Catalunya and the Basque Cercanías aside).
 * Checked 5 Nov 23:54 and 6 Nov 09:10: the newest rail resolutions are
 * SEMAF's 29 Oct strike at Renfe (23 Oct, amended 28 Oct) and Ouigo (27 Oct);
 * the newest air one, Bilbao airport cleaning (28 Oct). None for 11N.
 */
export const STATE_SERVICES: Record<"rail" | "air", StateService> = {
  rail: {
    key: "rail",
    status: "published",
    text: `Renfe: Cercanías, el 75% del servicio habitual en hora punta (de 6.00 a 9.00, de 13.30 a 15.30 y de 18.30 a 20.30 h) y el 50% el resto del día; Media Distancia, una media del 65%; Alta Velocidad y Larga Distancia, el 73%, según los servicios mínimos fijados por el Ministerio de Transportes (${link("https://grupo.renfe.com/es/es/sala-de-prensa/noticias/2026/11/establecidos-los-servicios-minimos-para-la-huelga-general-convocada-el-11n", "comunicado de Renfe del 9 de noviembre")}).`,
    source: { name: "Establecidos los servicios mínimos para la huelga general convocada el 11N (09/11/2026)", url: "https://grupo.renfe.com/es/es/sala-de-prensa/noticias/2026/11/establecidos-los-servicios-minimos-para-la-huelga-general-convocada-el-11n", publisher: "Renfe" },
    setBy: "Ministerio de Transportes",
    pending: `Los fija el Ministerio de Transportes por resolución, que publica en su ${link(U.ministryRail, "lista de resoluciones de servicios mínimos ferroviarios")}; Renfe publica después los trenes que circulan.`,
  },
  air: {
    key: "air",
    status: "published",
    text: `Un porcentaje de los vuelos comerciales programados en cada aeropuerto, para cada ruta y compañía, según el tipo de ruta, y el 100% de los vuelos de emergencia y de Estado, según la ${link(CITY_STATE_URLS.airOrder, "resolución del Ministerio de Transportes firmada el 6 de noviembre")}.`,
    source: { name: "Resolución del secretario de Estado de Transportes y Movilidad Sostenible: servicios mínimos del transporte aéreo en la huelga general del 11 de noviembre de 2026 (firmada el 6 de noviembre de 2026)", url: CITY_STATE_URLS.airOrder, publisher: "Ministerio de Transportes y Movilidad Sostenible" },
    setBy: "Ministerio de Transportes",
    pending: `Los fija el Ministerio de Transportes por resolución, que publica en su ${link(CITY_STATE_URLS.ministryAir, "página de servicios mínimos del transporte aéreo")}.`,
  },
};

/**
 * One airport's protected flights in the Ministry's 11N resolution (RESUELVO
 * Primero): `islands` is its letter d (domestic routes to or from the
 * non-peninsular territories and every public-service-obligation route),
 * `long` its letter e (peninsular routes whose public-transport alternative
 * takes 5 hours or more, and every international route) and `short` its
 * letter f (peninsular routes with an alternative under 5 hours; the island
 * airports have none).
 */
function airNotes(airport: string, islands: number, long: number, short: number | null): string[] {
  const order = link(CITY_STATE_URLS.airOrder, "resolución del Ministerio de Transportes");
  return [
    short === null
      ? `En el aeropuerto de ${airport}, el ${islands}% de los vuelos nacionales y el ${long}% de los internacionales, para cada ruta y compañía, según la ${order}.`
      : `En el aeropuerto de ${airport}, el ${islands}% de los vuelos con Baleares, Canarias, Ceuta y Melilla y de las rutas con obligación de servicio público; el ${long}% de los internacionales y de los peninsulares cuya alternativa en transporte público tarda 5 horas o más, y el ${short}% de los peninsulares con alternativa de menos de 5 horas, para cada ruta y compañía, según la ${order}.`,
    "Si el vuelo une dos aeropuertos españoles con porcentajes distintos, se aplica el mayor, y el resultado se redondea al alza.",
  ];
}

/** A service whose minimum services are out: `text` has the order's own figure and the link. */
function out(
  id: string,
  group: CityService["group"],
  name: string,
  setBy: string,
  text: string,
  source: NonNullable<CityService["source"]>,
  pendingText: string,
  where: string,
  extra: { question?: string; notes?: string[] } = {},
): CityService {
  return { id, group, name, setBy, status: "published", text, source, pending: pendingText, where, ...extra };
}

/** A service whose minimum services are not out yet. */
function pending(
  id: string,
  group: CityService["group"],
  name: string,
  setBy: string,
  pendingText: string,
  where: string,
  extra: { question?: string; notes?: string[] } = {},
): CityService {
  return { id, group, name, setBy, status: "pending", text: null, source: null, pending: pendingText, where, ...extra };
}

/* -------------------------------------------------------------------------- */
/* Madrid: Acuerdo de 4 de noviembre de 2026, BOCM núm. 267, 6 Nov 2026      */
/* -------------------------------------------------------------------------- */

const BOCM = "https://www.bocm.es/";
const UGT_MAD_DEMOS = "https://www.ugtlimpiezamadrid.es/2026/11/iel-11-de-noviembre-movilizate.html";
const MLG_DEMOS = "https://inquilinatomalaga.org/2026/11/05/el-comite-de-huelga-llama-a-la-movilizacion-en-malaga-para-el-11n/";
const CCOO_PV_DEMOS = "https://www.pv.ccoo.es/noticia:770384";
const MAD_ACUERDO = "https://www.bocm.es/bocm-20261106-36";
const MAD_SOURCE = {
  name: "Acuerdo de 4 de noviembre de 2026, del Consejo de Gobierno, por el que se fijan los servicios mínimos con ocasión de la huelga convocada para el día 11 de noviembre de 2026 (BOCM núm. 267, 6 de noviembre)",
  url: MAD_ACUERDO,
  publisher: "Comunidad de Madrid",
};
const madAcuerdo = (label = "el acuerdo de la Comunidad de Madrid") => link(MAD_ACUERDO, label);
const MAD_PENDING = `La Comunidad de Madrid los fija en su ${madAcuerdo("acuerdo de servicios mínimos")}, publicado en el ${link(BOCM, "BOCM")}.`;

function madrid(): Strike11nCity {
  const published = (id: string, group: CityService["group"], name: string, text: string, where: string, extra: { question?: string; notes?: string[] } = {}): CityService => ({
    id,
    group,
    name,
    setBy: "Comunidad de Madrid",
    status: "published",
    text,
    source: MAD_SOURCE,
    pending: MAD_PENDING,
    where,
    ...extra,
  });
  return {
    ...ref("madrid"),
    titleTransport: "metro y EMT",
    transportShort: "metro, EMT y autobuses interurbanos",
    authority: `la Comunidad de Madrid, en un acuerdo del Consejo de Gobierno publicado en el ${link(BOCM, "BOCM")}`,
    authorityShort: "la Comunidad de Madrid (BOCM)",
    bulletin: "el BOCM",
    cercanias: "Cercanías Madrid",
    airport: "Adolfo Suárez Madrid-Barajas",
    airNotes: airNotes("Adolfo Suárez Madrid-Barajas", 78, 57, 32),
    msSummary: `metro al 80% en hora punta y al 50% el resto del día; EMT, al 50% (40% en las líneas que coinciden con el metro); autobuses interurbanos, al 50% hasta las 9.30 h y al 45% después, según ${madAcuerdo("el acuerdo de la Comunidad publicado el 6 de noviembre")}`,
    services: [
      published(
        "metro",
        "transport",
        "Metro de Madrid",
        `El 80% de los trenes en hora punta (de 7.30 a 9.30, de 14.00 a 16.00 y de 18.00 a 20.00 h) y el 50% el resto del día, según ${madAcuerdo()}. Las tablas de trenes, por orden de la consejería competente.`,
        `Los avisos, en ${link("https://www.metromadrid.es/es", "metromadrid.es")} y en los ${link("https://www.crtm.es/comunicacion/actualidad-del-servicio/avisos/", "avisos del Consorcio Regional de Transportes")}`,
        { question: "¿Hay metro en Madrid el 11 de noviembre?" },
      ),
      published(
        "emt",
        "transport",
        "Autobuses de la EMT",
        `El 50% de los servicios durante todo el día en la red específica de la EMT y el 40% en la red que coincide con el metro, según ${madAcuerdo()}. Qué líneas van en cada red, por orden de la consejería competente.`,
        `Las ${link("https://www.emtmadrid.es/EMTBUS/Incidencias?lang=es-ES", "incidencias de la EMT")}`,
        { question: "¿Hay autobuses de la EMT en Madrid el 11 de noviembre?" },
      ),
      published(
        "interurbanos",
        "transport",
        "Autobuses interurbanos y metros ligeros",
        `Interurbanos: el 50% de los servicios desde el inicio hasta las 9.30 h y el 45% el resto del día. Metros ligeros y tranvía de Parla: el 50% en hora punta y el 45% el resto. Transporte escolar, el 60%. Según ${madAcuerdo()}.`,
        `Los ${link("https://www.crtm.es/comunicacion/actualidad-del-servicio/avisos/", "avisos del Consorcio Regional de Transportes")}`,
      ),
      published(
        "salud",
        "health",
        "Hospitales y centros de salud públicos",
        `En los hospitales, el personal de sábados, domingos y festivos y el de guardia, con mínimos adicionales en unidades como urgencias, diálisis, cuidados críticos u oncología; en los centros de salud, de 1 a 2 médicos de familia, 1 pediatra, 1 o 2 enfermeras y 1 auxiliar administrativo por turno, según el tamaño del centro, según ${madAcuerdo()}.`,
        `Para tu cita, tu hospital o centro de salud; el texto completo, en el ${link(BOCM, "BOCM")}`,
      ),
      published(
        "colegios",
        "schools",
        "Colegios e institutos",
        `En cada centro, el director y el jefe de estudios y, además, 1 maestro por cada 50 alumnos en infantil y primaria y 1 profesor por cada 90 alumnos en ESO y FP básica, según ${madAcuerdo()}.`,
        `El colegio informa a las familias; el texto completo, en el ${link(BOCM, "BOCM")}`,
      ),
      published(
        "administracion",
        "administration",
        "Administración de la Comunidad de Madrid",
        `En la Oficina Central de Atención al Ciudadano (Carrera de San Jerónimo, 13), 3 empleados por la mañana y 3 por la tarde, según ${madAcuerdo()}.`,
        `Los ${link("https://www.comunidad.madrid/acuerdos-consejo-gobierno", "acuerdos del Consejo de Gobierno")}`,
      ),
    ],
    msNotes: [
      `**Publicados el 6 de noviembre.** El ${madAcuerdo("Acuerdo de 4 de noviembre de 2026, del Consejo de Gobierno")} (BOCM núm. 267) fija en un solo texto los servicios mínimos de la Administración regional, los colegios, la sanidad, el metro, la EMT, los autobuses interurbanos y los metros ligeros, y «producirá efectos el mismo día de su publicación». Las tablas de trenes del metro y las líneas de la EMT de cada red las concretará una orden de la consejería competente.`,
    ],
    railNotes: [
      `**Línea C-9:** Renfe avisa de que, «con motivo de las huelgas convocadas para los días 10, 11 y 12 de noviembre, se suspende el servicio alternativo de transporte por autobús en la línea C-9» (${link("https://www.renfe.com/es/es/cercanias/cercanias-madrid", "Cercanías Madrid")}).`,
    ],
    school: `**Sí, es día lectivo.** En el calendario escolar 2026-2027 de la Comunidad de Madrid (${link("https://www.bocm.es/bocm-20260604-13", "Orden 2034/2026")}), las clases de infantil, primaria y educación especial van del 7 de septiembre de 2026 al 18 de junio de 2027, y en noviembre solo es festivo el día 2, además de las fiestas locales. Las de la ciudad de Madrid en 2026 son el 15 de mayo y el 9 de noviembre (${link("https://www.bocm.es/bocm-20251212-34", "BOCM del 12 de diciembre de 2025")}): el lunes 9 no hay clase; el miércoles 11, sí.`,
    schoolShort: "Es día lectivo. Los colegios abren con el director, el jefe de estudios y los mínimos que fija la Comunidad de Madrid",
    demos: [
      `**UGT:** concentración a las 12.00 h en Cibeles y manifestación a las 18.00 h de Atocha a la plaza de España, según ${link(UGT_MAD_DEMOS, "UGT (sector de limpieza de Madrid)")}.`,
      `Atentos a ${link("https://madrid.ccoo.es/huelgageneral11m", "CCOO de Madrid")} y ${link("https://madridugt.org/", "UGT Madrid")} por si convocan otras marchas.`,
    ],
    demoShort: "UGT: concentración a las 12.00 h en Cibeles; manifestación a las 18.00 h de Atocha a la plaza de España",
    demoWhere: `Atentos a las webs de ${link("https://madrid.ccoo.es/huelgageneral11m", "CCOO de Madrid")} y ${link("https://madridugt.org/", "UGT Madrid")}: en cuanto publiquen la hora y el lugar, los pondremos aquí.`,
    callNotes: [],
    sources: [
      { name: "UGT Limpieza Madrid: el 11 de noviembre, movilízate", url: UGT_MAD_DEMOS, publisher: "UGT" },
      MAD_SOURCE,
      { name: "BOCM: Boletín Oficial de la Comunidad de Madrid", url: BOCM, publisher: "Comunidad de Madrid" },
      { name: "Metro de Madrid", url: "https://www.metromadrid.es/es", publisher: "Metro de Madrid" },
      { name: "Avisos del servicio", url: "https://www.crtm.es/comunicacion/actualidad-del-servicio/avisos/", publisher: "Consorcio Regional de Transportes de Madrid" },
      { name: "Incidencias", url: "https://www.emtmadrid.es/EMTBUS/Incidencias?lang=es-ES", publisher: "EMT Madrid" },
      { name: "Acuerdos del Consejo de Gobierno", url: "https://www.comunidad.madrid/acuerdos-consejo-gobierno", publisher: "Comunidad de Madrid" },
      { name: "Cercanías Madrid: avisos (huelgas del 10, 11 y 12 de noviembre, línea C-9)", url: "https://www.renfe.com/es/es/cercanias/cercanias-madrid", publisher: "Renfe" },
      { name: "Orden 2034/2026, de 25 de mayo: calendario escolar 2026-2027 (BOCM núm. 131, 4 de junio de 2026)", url: "https://www.bocm.es/bocm-20260604-13", publisher: "Comunidad de Madrid" },
      { name: "Fiestas locales 2026 de la Comunidad de Madrid (BOCM núm. 296, 12 de diciembre de 2025)", url: "https://www.bocm.es/bocm-20251212-34", publisher: "Comunidad de Madrid" },
      { name: "Huelga general 11N", url: "https://madrid.ccoo.es/huelgageneral11m", publisher: "CCOO de Madrid" },
      { name: "UGT Madrid", url: "https://madridugt.org/", publisher: "UGT Madrid" },
    ],
  };
}

/* -------------------------------------------------------------------------- */
/* Valencia and Alicante: Generalitat Valenciana                              */
/* -------------------------------------------------------------------------- */

const GVA_LIST = "https://habitatge.gva.es/es/web/dg-trabajo/vagues-serveis-minims";
const GVA_ORDER = "https://habitatge.gva.es/documents/21189/165429228/RESOL_HUELGA+GRAL+11nov26+firmado.pdf/e8132fe4-1128-4d8d-8545-0a5baac22c6b?t=1793978491151";
const gvaOrder = (label = "la resolución de la Generalitat Valenciana") => link(GVA_ORDER, label);
const GVA_SOURCE = {
  name: "Resolución de la vicepresidenta primera y consellera de Vivienda, Empleo, Juventud e Igualdad por la que se establecen los servicios mínimos de la huelga general del 11 de noviembre de 2026",
  url: GVA_ORDER,
  publisher: "Generalitat Valenciana",
};
const GVA_PENDING = `Los fija la Generalitat Valenciana (Conselleria de Vivienda, Empleo, Juventud e Igualdad) por resolución, que publica en su ${link(GVA_LIST, "lista de huelgas y servicios mínimos")}.`;
const GVA_SCHOOL = "https://dogv.gva.es/datos/2026/06/18/pdf/2026_20810_es.pdf";
const GVA_HOLIDAYS = "https://dogv.gva.es/datos/2025/11/14/pdf/2025_46326_es.pdf";
const CCOO_PV = "https://www.pv.ccoo.es/noticia:771136";
const GVA_SOURCES = [
  GVA_SOURCE,
  { name: "Huelgas: servicios mínimos (resoluciones de la Conselleria de Vivienda, Empleo, Juventud e Igualdad)", url: GVA_LIST, publisher: "Generalitat Valenciana" },
  { name: "Resolución de 15 de junio de 2026: calendario escolar 2026-2027 en la Comunitat Valenciana (DOGV, 18 de junio de 2026)", url: GVA_SCHOOL, publisher: "Generalitat Valenciana" },
  { name: "Resolución de 12 de noviembre de 2025: fiestas locales de 2026 en la Comunitat Valenciana (DOGV, 14 de noviembre de 2025)", url: GVA_HOLIDAYS, publisher: "Generalitat Valenciana" },
  { name: "CCOO PV llama a parar el 11N (27/10/2026)", url: CCOO_PV, publisher: "CCOO del País Valencià" },
];
const GVA_INTERURBAN = out(
  "interurbanos",
  "transport",
  "Autobuses interurbanos",
  "Generalitat Valenciana",
  `El 55% de los servicios en hora punta (de 6.00 a 9.00 y de 17.00 a 19.00 h) y el 40% el resto del día; el 80% de los que van a aeropuertos, puertos y estaciones de tren en zonas turísticas, y el 50% del transporte escolar y del transporte a centros de trabajo, según ${gvaOrder()}.`,
  GVA_SOURCE,
  GVA_PENDING,
  `La resolución, en la ${link(GVA_LIST, "lista de la Generalitat")}; tu línea, en la web de su operador`,
);
const GVA_SERVICES: CityService[] = [
  out(
    "salud",
    "health",
    "Hospitales y centros de salud públicos",
    "Generalitat Valenciana",
    `En los hospitales, los servicios de un domingo en plantas, urgencias y quirófanos de urgencias, y los de un día laborable normal en diálisis, radioterapia, UCI, trasplantes, hospital de día y oncología, con el 25% de las consultas externas preferentes; en los centros de salud y consultorios, los servicios de un sábado, y los puntos de atención continuada, con su servicio normal, según ${gvaOrder()}.`,
    GVA_SOURCE,
    GVA_PENDING,
    `Para tu cita, tu hospital o centro de salud; la resolución, en la ${link(GVA_LIST, "lista de la Generalitat")}`,
  ),
  out(
    "colegios",
    "schools",
    "Colegios e institutos públicos",
    "Generalitat Valenciana",
    `Una persona del equipo directivo en cada centro; en infantil y primaria, además, un docente por etapa y como mínimo uno por cada cuatro unidades; en secundaria, bachillerato y FP, uno por etapa y como mínimo uno por cada diez unidades; en los comedores escolares, el 60% del personal, según ${gvaOrder()}.`,
    GVA_SOURCE,
    GVA_PENDING,
    `El colegio informa a las familias; la resolución, en la ${link(GVA_LIST, "lista de la Generalitat")}`,
  ),
  out(
    "administracion",
    "administration",
    "Administración de la Generalitat",
    "Generalitat Valenciana",
    `Una persona en cada servicio de registro general, según ${gvaOrder()}.`,
    GVA_SOURCE,
    GVA_PENDING,
    `La resolución, en la ${link(GVA_LIST, "lista de la Generalitat")}`,
  ),
];
const GVA_MS_NOTES = [
  `**Publicados el 6 de noviembre.** La ${gvaOrder("resolución de la consellera de Vivienda, Empleo, Juventud e Igualdad")}, que la Generalitat tiene en su ${link(GVA_LIST, "lista de huelgas y servicios mínimos")}, fija en un solo texto los de FGV (metro, tranvía y TRAM), los autobuses metropolitanos e interurbanos, la sanidad, los colegios públicos y la administración de la Generalitat.`,
  `**No cubre los autobuses urbanos municipales:** los de la EMT de València y los del autobús urbano de Alicante no estaban publicados el 10 de noviembre.`,
];
const gvaSchool = (city: string, holidays: string) =>
  `**En el calendario, sí es día lectivo.** La ${link(GVA_SCHOOL, "resolución del calendario escolar 2026-2027")} fija las clases del 9 de septiembre de 2026 al 18 de junio de 2027 y, en otoño, solo el 9 y el 12 de octubre y el 8 de diciembre como festivos no lectivos; las fiestas locales de ${city} en 2026 son ${holidays} (${link(GVA_HOLIDAYS, "DOGV del 14 de noviembre de 2025")}). Pero cada ayuntamiento podía proponer «hasta un máximo de tres días no lectivos de carácter local a efectos escolares»: confirma con el colegio.`;

function valencia(): Strike11nCity {
  return {
    ...ref("valencia"),
    titleTransport: "metro y EMT",
    transportShort: "metro, tranvía y EMT",
    authority: `la Generalitat Valenciana, en una resolución que tiene en su ${link(GVA_LIST, "lista de servicios mínimos")}`,
    authorityShort: "la Generalitat Valenciana",
    bulletin: "el DOGV",
    cercanias: "Cercanías Valencia",
    airport: "Valencia",
    airNotes: airNotes("Valencia", 75, 59, 32),
    msSummary: `Metrovalencia (metro y tranvía), al 80% del servicio programado; autobuses metropolitanos de la ATMV, al 70% y, en hora punta, al 80%; en los hospitales, los servicios de un domingo, y en los centros de salud, los de un sábado, según ${gvaOrder("la resolución de la Generalitat Valenciana del 6 de noviembre")}`,
    services: [
      out("metrovalencia", "transport", "Metrovalencia (metro y tranvía, FGV)", "Generalitat Valenciana", `El 80% del servicio programado de trenes y tranvías, según ${gvaOrder()}.`, GVA_SOURCE, GVA_PENDING, `Los avisos, en ${link("https://www.metrovalencia.es/", "metrovalencia.es")}`, { question: "¿Hay metro en Valencia el 11 de noviembre?" }),
      out("atmv", "transport", "Autobuses metropolitanos (ATMV)", "Generalitat Valenciana", `El 70% de los servicios y, en hora punta (de 6.30 a 9.00, de 13.30 a 15.30 y de 18.30 a 21.00 h), el 80%, según ${gvaOrder()}.`, GVA_SOURCE, GVA_PENDING, `La resolución, en la ${link(GVA_LIST, "lista de la Generalitat")}`),
      pending("emt", "transport", "Autobuses de la EMT de València", "Por confirmar", `Aún no los ha publicado nadie: ni la ${link(GVA_LIST, "lista de servicios mínimos de la Generalitat")} ni la ${link("https://www.emtvalencia.es/", "EMT de València")}.`, `Las alteraciones del servicio, en ${link("https://www.emtvalencia.es/", "emtvalencia.es")}`, { question: "¿Hay autobuses de la EMT en Valencia el 11 de noviembre?" }),
      GVA_INTERURBAN,
      ...GVA_SERVICES,
    ],
    msNotes: GVA_MS_NOTES,
    railNotes: [],
    school: gvaSchool("València", "el 22 de enero y el 13 de abril"),
    schoolShort: "Día lectivo en el calendario de la Comunitat; confirma con el colegio sus días no lectivos locales",
    demos: [
      `**CCOO PV:** manifestación a las 18.00 h con salida de la calle de Xàtiva («València. C/ Xàtiva»), según ${link(CCOO_PV_DEMOS, "CCOO del País Valencià")}, que ${link(CCOO_PV, "llama a parar el 11N")}.`,
    ],
    demoShort: "CCOO PV, a las 18.00 h, desde la calle de Xàtiva",
    demoWhere: `Atentos a ${link(CCOO_PV_DEMOS, "CCOO PV")} por si cambia la hora o el lugar.`,
    callNotes: [],
    sources: [
      { name: "CCOO PV: l'11 de novembre, a la vaga general (lugares de las manifestaciones)", url: CCOO_PV_DEMOS, publisher: "CCOO del País Valencià" },
      ...GVA_SOURCES,
      { name: "Metrovalencia", url: "https://www.metrovalencia.es/", publisher: "Ferrocarrils de la Generalitat Valenciana" },
      { name: "EMT València", url: "https://www.emtvalencia.es/", publisher: "EMT València" },
    ],
  };
}

function alicante(): Strike11nCity {
  return {
    ...ref("alicante"),
    titleTransport: "TRAM y bus",
    transportShort: "TRAM y autobuses",
    authority: `la Generalitat Valenciana, en una resolución que tiene en su ${link(GVA_LIST, "lista de servicios mínimos")}`,
    authorityShort: "la Generalitat Valenciana",
    bulletin: "el DOGV",
    cercanias: "Cercanías Murcia/Alicante",
    airport: "Alicante-Elche Miguel Hernández",
    airNotes: airNotes("Alicante-Elche Miguel Hernández", 74, 54, 31),
    msSummary: `TRAM d'Alacant, al 80% del servicio programado; autobuses interurbanos, al 55% en hora punta y al 40% el resto del día; en los hospitales, los servicios de un domingo, y en los centros de salud, los de un sábado, según ${gvaOrder("la resolución de la Generalitat Valenciana del 6 de noviembre")}`,
    services: [
      out("tram", "transport", "TRAM d'Alacant (FGV)", "Generalitat Valenciana", `El 80% del servicio programado de trenes y tranvías, según ${gvaOrder()}.`, GVA_SOURCE, GVA_PENDING, `Los avisos, en ${link("https://www.tramalacant.es/", "tramalacant.es")}`, { question: "¿Hay TRAM en Alicante el 11 de noviembre?" }),
      pending("bus", "transport", "Autobús urbano de Alicante", "Por confirmar", `Aún no los ha publicado nadie en la ${link(GVA_LIST, "lista de servicios mínimos de la Generalitat")}.`, `La resolución, cuando salga, en la ${link(GVA_LIST, "lista de la Generalitat")}`),
      GVA_INTERURBAN,
      ...GVA_SERVICES,
    ],
    msNotes: GVA_MS_NOTES,
    railNotes: [],
    school: gvaSchool("Alicante", "el 16 de abril (Santa Faz) y el 23 de junio (Fogueres de Sant Joan)"),
    schoolShort: "Día lectivo en el calendario de la Comunitat; confirma con el colegio sus días no lectivos locales",
    demos: [
      `**CCOO PV:** concentración a las 18.00 h en las Escales Jorge Juan («Alacant. Escales Jorge Juan»), según ${link(CCOO_PV_DEMOS, "CCOO del País Valencià")}, que ${link(CCOO_PV, "llama a parar el 11N")}.`,
    ],
    demoShort: "CCOO PV, a las 18.00 h, en las Escales Jorge Juan",
    demoWhere: `Atentos a ${link(CCOO_PV_DEMOS, "CCOO PV")} por si cambia la hora o el lugar.`,
    callNotes: [],
    sources: [{ name: "CCOO PV: l'11 de novembre, a la vaga general (lugares de las manifestaciones)", url: CCOO_PV_DEMOS, publisher: "CCOO del País Valencià" }, ...GVA_SOURCES, { name: "TRAM d'Alacant", url: "https://www.tramalacant.es/", publisher: "Ferrocarrils de la Generalitat Valenciana" }],
  };
}

/* -------------------------------------------------------------------------- */
/* Andalucía: Sevilla and Málaga                                              */
/* -------------------------------------------------------------------------- */

const BOJA = "https://www.juntadeandalucia.es/eboja.html";
const AND_2025 = "https://www.juntadeandalucia.es/eboja/2025/197/BOJA25-197-00011-13546-01_00327143.pdf";
const AND_HOLIDAYS = "https://www.juntadeandalucia.es/boja/2025/197/BOJA25-197-00016-13517-01_00327114.pdf";
const CCOO_A = "https://andalucia.ccoo.es/noticia:770740--CCOO_de_Andalucia_hace_un_llamamiento_a_la_clase_trabajadora_y_a_la_ciudadania_a_que_se_sume_a_la_huelga_y_a_las_movilizaciones_convocadas_el_11N&opc_id=3b47924008abebb0a1b9cb703fffef0c";
const AND_HEALTH = "https://www.juntadeandalucia.es/boja/2026/216/31";
const AND_HEALTH_SOURCE = {
  name: "Orden de 3 de noviembre de 2026, por la que se garantiza el funcionamiento del servicio público que prestan los trabajadores del sector sanitario público y privado, mediante el establecimiento de servicios mínimos (BOJA núm. 216, 9 de noviembre de 2026)",
  url: AND_HEALTH,
  publisher: "Junta de Andalucía",
};
const AND_PENDING = `Los fija la Junta de Andalucía: en la última huelga general, con una ${link(AND_2025, "resolución de la Dirección General de Trabajo")} que cubría también el transporte urbano. Saldrán en el ${link(BOJA, "BOJA")}.`;
const AND_SOURCES = [
  AND_HEALTH_SOURCE,
  { name: "BOJA: Boletín Oficial de la Junta de Andalucía", url: BOJA, publisher: "Junta de Andalucía" },
  { name: "Resolución de 8 de octubre de 2025 de la Dirección General de Trabajo, Seguridad y Salud Laboral: servicios mínimos de la huelga del 15 de octubre de 2025 (BOJA núm. 197, 14 de octubre de 2025)", url: AND_2025, publisher: "Junta de Andalucía" },
  { name: "Resolución de 6 de octubre de 2025: fiestas locales de 2026 en Andalucía (BOJA núm. 197, 14 de octubre de 2025)", url: AND_HOLIDAYS, publisher: "Junta de Andalucía" },
  { name: "CCOO de Andalucía llama a sumarse a la huelga y a las movilizaciones del 11N (22/10/2026)", url: CCOO_A, publisher: "CCOO de Andalucía" },
  { name: "Huelga general 11N", url: "https://huelga.ccoo.es/", publisher: "CCOO" },
];
const AND_SERVICES: CityService[] = [
  out(
    "salud",
    "health",
    "Hospitales y centros de salud (SAS)",
    "Junta de Andalucía",
    `En los hospitales, el 100% de la actividad de un domingo o festivo, con las urgencias como un fin de semana, y garantizadas la radioterapia, la quimioterapia, la cirugía oncológica y la diálisis; en los centros de salud, solo la atención urgente: con un médico en los que no tienen servicio de urgencias (SUAP) y, en los que lo tienen, en el SUAP, como un fin de semana, según la ${link(AND_HEALTH, "Orden de 3 de noviembre de 2026 de la Junta de Andalucía")}.`,
    AND_HEALTH_SOURCE,
    `Los fija la Junta de Andalucía por orden de su consejería de Sanidad, que se publica en el ${link(BOJA, "BOJA")}.`,
    `Para tu cita, tu hospital o centro de salud; la orden, en el ${link(BOJA, "BOJA")}`,
  ),
  pending("colegios", "schools", "Colegios e institutos", "Junta de Andalucía", `Los fija la Junta de Andalucía por resolución y órdenes que se publican en el ${link(BOJA, "BOJA")}.`, `El colegio informa a las familias; la resolución, en el ${link(BOJA, "BOJA")}`),
  pending("administracion", "administration", "Administración de la Junta de Andalucía", "Junta de Andalucía", `Los fija cada consejería de la Junta por orden, que se publica en el ${link(BOJA, "BOJA")}.`, `Las órdenes, en el ${link(BOJA, "BOJA")}`),
];
const AND_SUMMARY = `en los hospitales, la actividad de un domingo o festivo, y en los centros de salud, solo la atención urgente, según la ${link(AND_HEALTH, "orden de la Junta de Andalucía publicada en el BOJA del 9 de noviembre")}`;
const AND_MS_NOTES = [
  `**La de la sanidad, publicada el 9 de noviembre.** El BOJA núm. 216 trae la ${link(AND_HEALTH, "Orden de 3 de noviembre de 2026")}, con los servicios mínimos de la sanidad pública y privada. Ni ese boletín ni el del 10 de noviembre traen los del transporte urbano ni los de los colegios.`,
  `En la huelga general del 15 de octubre de 2025, la Junta fijó los servicios mínimos con una ${link(AND_2025, "resolución de la Dirección General de Trabajo")} que cubría, entre otros, el transporte urbano de viajeros y los colegios e institutos, firmada el 8 de octubre y publicada en el BOJA del 14, la víspera; la orden de la sanidad pública y las de cada consejería salieron el mismo día de la huelga.`,
  `**Ojo: rigen desde la firma.** Aquella resolución decía que «entrará en vigor el día de su firma, sin perjuicio de su posterior publicación en el Boletín Oficial de la Junta de Andalucía»: los servicios mínimos pueden aplicarse antes de salir en el ${link(BOJA, "BOJA")}.`,
];
const AND_CALL = [
  `**En Andalucía**, CCOO de Andalucía registró la convocatoria el 22 de octubre «junto al Sindicato de Inquilinas; UGT de Andalucía; SAT; USTEA; CGT y CNT» (${link(CCOO_A, "CCOO de Andalucía")}).`,
];
const AND_DEMO_WHERE = `CCOO dice que «el 11 N CCOO convocará manifestaciones a lo largo de todo el Estado» (${link("https://huelga.ccoo.es/", "huelga.ccoo.es")}); atentos también a ${link(CCOO_A, "CCOO de Andalucía")}. En cuanto publiquen la hora y el lugar, los pondremos aquí.`;

function sevilla(): Strike11nCity {
  const school = "https://www.juntadeandalucia.es/educacion/portales/documents/1176698/3340178/RESOL%20CALEND%2026_27%28F%29.pdf/8c2fd440-3e04-a1c5-d497-2170af36e265?version=1.0";
  return {
    ...ref("sevilla"),
    titleTransport: "metro y Tussam",
    transportShort: "metro, Tussam y autobuses metropolitanos",
    authority: `la Junta de Andalucía, por resoluciones y órdenes que se publican en el ${link(BOJA, "BOJA")}`,
    authorityShort: "la Junta de Andalucía (BOJA)",
    bulletin: "el BOJA",
    cercanias: "Cercanías Sevilla",
    airport: "Sevilla",
    airNotes: airNotes("Sevilla", 76, 57, 35),
    msSummary: AND_SUMMARY,
    services: [
      pending("metro", "transport", "Metro de Sevilla", "Junta de Andalucía", AND_PENDING, `Los avisos, en ${link("https://www.metro-sevilla.es/", "metro-sevilla.es")}`, { question: "¿Hay metro en Sevilla el 11 de noviembre?" }),
      pending("tussam", "transport", "Tussam (autobuses y tranvía Metrocentro)", "Junta de Andalucía", AND_PENDING, `Los avisos, en ${link("https://www.tussam.es/", "tussam.es")}`, { question: "¿Hay autobuses de Tussam el 11 de noviembre?" }),
      pending("consorcio", "transport", "Autobuses metropolitanos", "Junta de Andalucía", AND_PENDING, `Las noticias del ${link("https://siu.ctas.ctan.es/es/noticias.php", "Consorcio de Transportes del Área de Sevilla")}`),
      ...AND_SERVICES,
    ],
    msNotes: AND_MS_NOTES,
    railNotes: [],
    school: `**En el calendario, sí es día lectivo.** La ${link(school, "resolución del calendario escolar 2026-2027 de la provincia de Sevilla")} no tiene el 11 de noviembre entre los días no lectivos, y las fiestas locales de Sevilla en 2026 son el 22 de abril y el 4 de junio (${link(AND_HOLIDAYS, "BOJA del 14 de octubre de 2025")}). Pero cada consejo escolar municipal podía acordar «hasta dos días de libre disposición» antes del 15 de octubre, y no hemos encontrado los de Sevilla: confirma con el colegio.`,
    schoolShort: "Día lectivo en el calendario provincial; confirma con el colegio sus días de libre disposición",
    demos: [],
    demoShort: null,
    demoWhere: AND_DEMO_WHERE,
    callNotes: AND_CALL,
    sources: [
      ...AND_SOURCES,
      { name: "Resolución de la Delegación Territorial de Educación en Sevilla: calendario y jornada escolar 2026-2027", url: school, publisher: "Junta de Andalucía" },
      { name: "Metro de Sevilla", url: "https://www.metro-sevilla.es/", publisher: "Metro de Sevilla" },
      { name: "Tussam", url: "https://www.tussam.es/", publisher: "Tussam" },
      { name: "Noticias", url: "https://siu.ctas.ctan.es/es/noticias.php", publisher: "Consorcio de Transportes del Área de Sevilla" },
    ],
  };
}

function malaga(): Strike11nCity {
  const school = "https://www.juntadeandalucia.es/educacion/portales/documents/2854624/4501041/RESOLUCION%20CALENDARIO%20ESCOLAR%202026_27%20MALAGA.pdf/6f0af8f4-b17b-3b67-2797-e53eb85376e9?version=1.0";
  return {
    ...ref("malaga"),
    titleTransport: "metro y EMT",
    transportShort: "metro, EMT y autobuses metropolitanos",
    authority: `la Junta de Andalucía, por resoluciones y órdenes que se publican en el ${link(BOJA, "BOJA")}`,
    authorityShort: "la Junta de Andalucía (BOJA)",
    bulletin: "el BOJA",
    cercanias: "Cercanías Málaga",
    airport: "Málaga-Costa del Sol",
    airNotes: airNotes("Málaga-Costa del Sol", 75, 57, 32),
    msSummary: AND_SUMMARY,
    services: [
      pending("metro", "transport", "Metro de Málaga", "Junta de Andalucía", AND_PENDING, `Las ${link("https://metromalaga.es/notas-de-prensa/", "notas de Metro de Málaga")}`, { question: "¿Hay metro en Málaga el 11 de noviembre?" }),
      pending("emt", "transport", "Autobuses de la EMT de Málaga", "Junta de Andalucía", AND_PENDING, `Las ${link("https://www.emtmalaga.es/noticias", "noticias de la EMT")}`, { question: "¿Hay autobuses de la EMT en Málaga el 11 de noviembre?" }),
      pending("consorcio", "transport", "Autobuses metropolitanos", "Junta de Andalucía", AND_PENDING, `Las noticias del ${link("https://siu.ctmam.ctan.es/es/noticias.php", "Consorcio de Transportes del Área de Málaga")}`),
      ...AND_SERVICES,
    ],
    msNotes: AND_MS_NOTES,
    railNotes: [],
    school: `**Sí, es día lectivo.** La ${link(school, "resolución del calendario escolar 2026-2027 de la provincia de Málaga")} no tiene el 11 de noviembre entre los días no lectivos, y las fiestas locales de Málaga en 2026 son el 19 de agosto y el 8 de septiembre (${link(AND_HOLIDAYS, "BOJA del 14 de octubre de 2025")}).`,
    schoolShort: "Sí, es día lectivo",
    demos: [
      `**Comité de Huelga de Málaga:** manifestación a las 18.00 h con salida desde la plaza del General Torrijos, junto a la Fuente de las Tres Gracias, según el ${link(MLG_DEMOS, "Sindicato de Inquilinas de Málaga")}.`,
      `Atentos a ${link(CCOO_A, "CCOO de Andalucía")} y a la ${link("https://huelga.ccoo.es/", "web de la huelga de CCOO")} por si se convocan otras marchas.`,
    ],
    demoShort: "A las 18.00 h, desde la plaza del General Torrijos (Fuente de las Tres Gracias)",
    demoWhere: AND_DEMO_WHERE,
    callNotes: AND_CALL,
    sources: [
      { name: "El Comité de Huelga llama a la movilización en Málaga para el 11N (5/11/2026)", url: MLG_DEMOS, publisher: "Sindicato de Inquilinas de Málaga" },
      ...AND_SOURCES,
      { name: "Resolución de 20 de mayo de 2026 de la Delegación Territorial de Educación en Málaga: calendario escolar 2026-2027", url: school, publisher: "Junta de Andalucía" },
      { name: "Notas de prensa", url: "https://metromalaga.es/notas-de-prensa/", publisher: "Metro de Málaga" },
      { name: "Noticias", url: "https://www.emtmalaga.es/noticias", publisher: "EMT Málaga" },
      { name: "Noticias", url: "https://siu.ctmam.ctan.es/es/noticias.php", publisher: "Consorcio de Transportes del Área de Málaga" },
    ],
  };
}

/* -------------------------------------------------------------------------- */
/* Zaragoza                                                                   */
/* -------------------------------------------------------------------------- */

function zaragoza(): Strike11nCity {
  const BOA = "https://www.boa.aragon.es/";
  const NEWS = "https://www.zaragoza.es/sede/servicio/noticia/";
  const DECREE_2021 = "https://www.zaragoza.es/sede/servicio/noticia/301261";
  const TRAM = "https://www.tranviasdezaragoza.es/informacion-de-servicio-paros-parciales-y-servicios-minimos/";
  // The 11N notice of Tranvías de Zaragoza and the orders of BOA núm. 217 (10 Nov 2026), read on 10 Nov.
  const TRAM_11N = "https://www.tranviasdezaragoza.es/servicios-minimos-del-tranvia-de-zaragoza-para-la-huelga-general-del-11-de-noviembre/";
  const boaOrder = (id: string) => `https://www.boa.aragon.es/cgi-bin/EBOA/BRSCGI?CMD=VEROBJ&MLKOB=${id}&type=pdf`;
  const HAP = { name: "Orden HAP/1621/2026, de 6 de noviembre: servicios mínimos del personal de la Administración General de Aragón en la huelga general del 11 de noviembre de 2026 (BOA núm. 217, 10 de noviembre de 2026)", url: boaOrder("1474131840505"), publisher: "Gobierno de Aragón" };
  const ECE = { name: "Orden ECE/1627/2026, de 9 de noviembre: servicios mínimos en actividades gestionadas por empresas privadas en la huelga general del 11 de noviembre de 2026 (BOA núm. 217, 10 de noviembre de 2026)", url: boaOrder("1474145980606"), publisher: "Gobierno de Aragón" };
  const SAN = { name: "Orden SAN/1629/2026, de 5 de noviembre: servicios mínimos de los centros del Servicio Aragonés de Salud en la huelga general del 11 de noviembre de 2026 (BOA núm. 217, 10 de noviembre de 2026)", url: boaOrder("1474149020606"), publisher: "Gobierno de Aragón" };
  const ECU = { name: "Orden ECU/1631/2026, de 5 de noviembre: servicios mínimos en los centros docentes públicos en la huelga general del 11 de noviembre de 2026 (BOA núm. 217, 10 de noviembre de 2026)", url: boaOrder("1474153060606"), publisher: "Gobierno de Aragón" };
  const TRAM_SOURCE = { name: "Servicios mínimos del Tranvía de Zaragoza para la huelga general del 11 de noviembre", url: TRAM_11N, publisher: "Tranvías de Zaragoza" };
  const city = `Los fija el Ayuntamiento de Zaragoza por decreto: así lo hizo en la ${link(DECREE_2021, "huelga general del 8 de marzo de 2021")}, y lo anunció en sus ${link(NEWS, "noticias")}.`;
  const aragon = (dept: string) => `Los fija el Gobierno de Aragón (${dept}) por orden, que se publica en el ${link(BOA, "BOA")}.`;
  return {
    ...ref("zaragoza"),
    titleTransport: "tranvía y bus",
    transportShort: "tranvía y autobuses urbanos y metropolitanos",
    authority: `el Gobierno de Aragón, en órdenes publicadas en el ${link(BOA, "BOA")} del 10 de noviembre, salvo los del autobús urbano y el tranvía, que fija el Ayuntamiento de Zaragoza por decreto`,
    authorityShort: "el Gobierno de Aragón (BOA) y, para el bus urbano y el tranvía, el Ayuntamiento",
    bulletin: "el BOA",
    cercanias: "Cercanías Zaragoza",
    airport: "Zaragoza",
    airNotes: airNotes("Zaragoza", 75, 58, 32),
    msSummary: `tranvía, entre el 50% y el 80% del servicio según la hora; en los colegios públicos, una persona del equipo directivo y el 25% del profesorado, y el transporte escolar, al 100%, según ${link(TRAM_11N, "Tranvías de Zaragoza")} y las órdenes del Gobierno de Aragón publicadas en el ${link(BOA, "BOA")} del 10 de noviembre`,
    services: [
      pending("bus", "transport", "Autobús urbano (Avanza Zaragoza)", "Ayuntamiento de Zaragoza", city, `Las ${link("https://zaragoza.avanzagrupo.com/alteraciones-del-servicio/", "alteraciones del servicio de Avanza")}`, { question: "¿Hay autobuses en Zaragoza el 11 de noviembre?" }),
      out("tranvia", "transport", "Tranvía de Zaragoza", "Ayuntamiento de Zaragoza", `En la línea 1, el 60% del servicio de 5.00 a 7.20 h; el 80% de 7.20 a 9.30 h; el 70% de 9.30 a 13.40 h; el 80% de 13.40 a 15.15 h; el 70% de 15.15 a 22.00 h, y el 50% de 22.00 a 0.00 h: son los que ha decretado el Ayuntamiento de Zaragoza, según ${link(TRAM_11N, "Tranvías de Zaragoza")}.`, TRAM_SOURCE, city, `Las ${link("https://www.tranviasdezaragoza.es/noticias/", "noticias de Tranvías de Zaragoza")}`, {
        question: "¿Hay tranvía en Zaragoza el 11 de noviembre?",
        notes: [
          `**Ojo: el tranvía tiene además paros parciales propios.** En su ${link(TRAM, "calendario de paros parciales de la línea 1")}, Tranvías de Zaragoza anuncia para el 11 de noviembre un paro de 13.00 a 15.00 h con servicios mínimos del 90%. Es un calendario de paros del propio tranvía que empezó el 19 de octubre, no los servicios mínimos de la huelga general.`,
        ],
      }),
      out(
        "ctaz",
        "transport",
        "Autobuses interurbanos y metropolitanos (líneas del Gobierno de Aragón)",
        "Gobierno de Aragón",
        `En las líneas regulares del Gobierno de Aragón, una expedición completa (ida y vuelta) en las rutas que tienen hasta 3; 2 en las que tienen de 4 a 6, y el 40% de las expediciones en las que tienen 7 o más, según la ${link(ECE.url, "Orden ECE/1627/2026")}.`,
        ECE,
        aragon("empleo"),
        `Las ${link("https://www.ctaz.es/noticias-ctaz/", "noticias del Consorcio de Transportes del Área de Zaragoza")}`,
      ),
      out(
        "salud",
        "health",
        "Hospitales y centros de salud (Salud)",
        "Gobierno de Aragón (Sanidad)",
        `El personal que fija, centro por centro, el anexo de la ${link(SAN.url, "Orden SAN/1629/2026")}, para garantizar «la atención urgente y no demorable»; la orden no da un porcentaje general.`,
        SAN,
        aragon("Departamento de Sanidad"),
        `Para tu cita, tu hospital o centro de salud; la orden, en el ${link(BOA, "BOA")}`,
      ),
      out(
        "colegios",
        "schools",
        "Colegios e institutos públicos",
        "Gobierno de Aragón (Educación)",
        `En cada centro, una persona del equipo directivo y el 25% del personal docente, y una persona de cocina donde hay comedor, según la ${link(ECU.url, "Orden ECU/1631/2026")}; el transporte escolar, al 100% en las rutas de entrada entre las 7.00 y las 10.00 h y en las de salida de 13.30 a 19.00 h, según la ${link(ECE.url, "Orden ECE/1627/2026")}.`,
        ECU,
        aragon("Departamento de Educación"),
        `El colegio informa a las familias; la orden, en el ${link(BOA, "BOA")}`,
      ),
      out(
        "administracion",
        "administration",
        "Administración del Gobierno de Aragón",
        "Gobierno de Aragón",
        `El personal que fija, departamento por departamento, la ${link(HAP.url, "Orden HAP/1621/2026")}, con una persona en los registros.`,
        HAP,
        aragon("cada departamento"),
        `Las órdenes, en el ${link(BOA, "BOA")}`,
      ),
    ],
    msNotes: [
      `**Publicados el 10 de noviembre.** El BOA núm. 217 trae las órdenes del Gobierno de Aragón para el 11N: la ${link(ECE.url, "ECE/1627/2026")} (empresas privadas, con los autobuses interurbanos y el transporte escolar), la ${link(ECU.url, "ECU/1631/2026")} (colegios públicos), la ${link(SAN.url, "SAN/1629/2026")} (centros del Servicio Aragonés de Salud) y la ${link(HAP.url, "HAP/1621/2026")} (administración).`,
      `**Tranvía y autobús urbano:** los del tranvía los ha decretado el Ayuntamiento de Zaragoza, según ${link(TRAM_11N, "Tranvías de Zaragoza")}; los del autobús urbano no los habíamos encontrado publicados el 10 de noviembre.`,
    ],
    railNotes: [],
    school: `**Sí, es día lectivo.** El calendario escolar de Aragón para 2026-2027 (${link("https://www.boa.aragon.es/cgi-bin/EBOA/BRSCGI?CMD=VEROBJ&MLKOB=1392479120808", "Resolución de 29 de abril de 2025")}) fija el inicio de las clases el martes 8 de septiembre de 2026 y el final el 18 de junio de 2027, y el 11 de noviembre no es día no lectivo. Las fiestas locales de Zaragoza en 2026 son el 29 de enero y el 5 de marzo (${link("https://www.boa.aragon.es/cgi-bin/EBOA/BRSCGI?CMD=VEROBJ&MLKOB=1421874360606", "BOA del 20 de noviembre de 2025")}).`,
    schoolShort: "Sí, es día lectivo",
    demos: [],
    demoShort: null,
    demoWhere: `Atentos a las webs de ${link("https://aragon.ccoo.es/", "CCOO Aragón")} y ${link("https://ugtaragon.es/", "UGT Aragón")}: en cuanto publiquen la hora y el lugar, los pondremos aquí.`,
    callNotes: [],
    sources: [
      { name: "BOA: Boletín Oficial de Aragón", url: BOA, publisher: "Gobierno de Aragón" },
      { name: "Servicios mínimos en el transporte público para la huelga del 8-M (05/03/2021)", url: DECREE_2021, publisher: "Ayuntamiento de Zaragoza" },
      { name: "Noticias", url: NEWS, publisher: "Ayuntamiento de Zaragoza" },
      { name: "Alteraciones del servicio", url: "https://zaragoza.avanzagrupo.com/alteraciones-del-servicio/", publisher: "Avanza Zaragoza" },
      { name: "Noticias", url: "https://www.tranviasdezaragoza.es/noticias/", publisher: "Tranvías de Zaragoza" },
      { name: "Información de servicio: paros parciales y servicios mínimos", url: TRAM, publisher: "Tranvías de Zaragoza" },
      TRAM_SOURCE,
      ECE,
      ECU,
      SAN,
      HAP,
      { name: "Noticias", url: "https://www.ctaz.es/noticias-ctaz/", publisher: "Consorcio de Transportes del Área de Zaragoza" },
      { name: "Resolución de 29 de abril de 2025: calendarios escolares 2025-2026 y 2026-2027 (BOA núm. 88, 12 de mayo de 2025)", url: "https://www.boa.aragon.es/cgi-bin/EBOA/BRSCGI?CMD=VEROBJ&MLKOB=1392479120808", publisher: "Gobierno de Aragón" },
      { name: "Fiestas locales de 2026 en Aragón (BOA núm. 225, 20 de noviembre de 2025)", url: "https://www.boa.aragon.es/cgi-bin/EBOA/BRSCGI?CMD=VEROBJ&MLKOB=1421874360606", publisher: "Gobierno de Aragón" },
      { name: "CCOO Aragón", url: "https://aragon.ccoo.es/", publisher: "CCOO Aragón" },
      { name: "UGT Aragón", url: "https://ugtaragon.es/", publisher: "UGT Aragón" },
    ],
  };
}

/* -------------------------------------------------------------------------- */
/* Bilbao: Orden de 6 de noviembre de 2026 del Gobierno Vasco                 */
/* -------------------------------------------------------------------------- */

function bilbao(): Strike11nCity {
  const LIST = "https://www.euskadi.eus/gobierno-vasco/-/ordenes-servicios-minimos/";
  const ORDER = "https://www.euskadi.eus/contenidos/informacion/ordenes_servicios_minimos/es_servmin/2026.11.06-Orden_de-SSMM-Huelga-General.pdf";
  const SOURCE = {
    name: "Orden de 6 de noviembre de 2026 por la que se garantiza el mantenimiento de los servicios esenciales a la comunidad durante la huelga general convocada para el día 11 de noviembre de 2026",
    url: ORDER,
    publisher: "Gobierno Vasco",
  };
  const order = (label = "la orden del Gobierno Vasco del 6 de noviembre") => link(ORDER, label);
  const PEND = `Los fija el Gobierno Vasco en su ${order()}, en su ${link(LIST, "lista de órdenes de servicios mínimos")}.`;
  const transport = (id: string, name: string, where: string, extra: { question?: string; notes?: string[] } = {}): CityService => ({
    id,
    group: "transport",
    name,
    setBy: "Gobierno Vasco",
    status: "published",
    text: `El 30% de los servicios ordinarios programados, priorizando las líneas sin transporte alternativo o que van a centros sanitarios y los horarios de entrada y salida del trabajo, según ${order()}.`,
    source: SOURCE,
    pending: PEND,
    where,
    ...extra,
  });
  const CCOO_E = "https://ccoo.eus/noticia:771513--CCOO_de_Euskadi_y_UGT_Euskadi_presentan_la_Huelga_General_del_11_de_noviembre";
  const UGT_E = "https://ugteuskadi.net/ugt-y-ccoo-llaman-a-parar-euskadi-el-11n-e-impulsan-manifestaciones-en-las-tres-capitales-en-defensa-de-la-vivienda-y-los-salarios/";
  const LAB_PM = "https://www.lab.eus/es/el-dia-de-la-huelga-general-nos-movilizaremos-en-mas-de-70-localidades-a-la-tarde/";
  const ELA = "https://www.ela.eus/es/noticias/registran-la-convocatoria-del-11-de-noviembre-en-euskal-herria";
  const LAB = "https://www.lab.eus/es/llamamos-a-las-y-los-trabajadores-de-euskal-herria-a-vaciar-los-centros-de-trabajo-y-llenar-las-calles-el-11-de-noviembre/";
  const ACTIVE = "https://www.euskadi.eus/contenidos/informacion/huelgas_activas/es_guias/Hu-2026-10-30-activas-.pdf";
  const SCHOOL = "https://www.euskadi.eus/contenidos/informacion/cee_organizacioncentros_calend/es_def/adjuntos/2026_2027/Resolucion-calendario-Primaria-2026_27-cast-.pdf";
  const HOLIDAYS = "https://www.euskadi.eus/contenidos/informacion/5907/es_2296/calendario-laboral-BIZKAIA-2026-modificacion-cas.pdf";
  return {
    ...ref("bilbao"),
    titleTransport: "metro y Bilbobus",
    transportShort: "metro, Bilbobus, Bizkaibus, Euskotren y Cercanías",
    authority: `el Gobierno Vasco, en una sola orden que publica en su ${link(LIST, "lista de órdenes de servicios mínimos")}`,
    authorityShort: "el Gobierno Vasco",
    bulletin: "el BOPV",
    // Cercanías Bilbao is the Basque Government's since 1 Jan 2025: it is one of this page's services.
    cercanias: null,
    airport: "Bilbao",
    airNotes: airNotes("Bilbao", 80, 56, 32),
    msSummary: `metro, Bilbobus, Bizkaibus, Euskotren y Cercanías, al 30% de los servicios programados; en los hospitales, el personal de un festivo, y en los centros de salud, el de un sábado, según ${order("la orden del Gobierno Vasco del 6 de noviembre")}`,
    services: [
      transport("metro", "Metro Bilbao", `Los ${link("https://www.metrobilbao.eus/es/avisos", "avisos de Metro Bilbao")}`, { question: "¿Hay metro en Bilbao el 11 de noviembre?" }),
      transport("bilbobus", "Bilbobus", `Los avisos del ${link("https://www.ctb.eus/es", "Consorcio de Transportes de Bizkaia")}`, { question: "¿Hay Bilbobus el 11 de noviembre?" }),
      transport("bizkaibus", "Bizkaibus", `Los ${link("https://www.bizkaia.eus/es/web/bizkaibus/avisos", "avisos de Bizkaibus")}`),
      transport("euskotren", "Euskotren (tren y tranvía)", `Las ${link("https://www.euskotren.eus/es/tren/noticias", "noticias de Euskotren")}`),
      transport("cercanias", "Cercanías Bilbao (Renfe)", `Los avisos de ${link("https://www.renfe.com/es/es/cercanias/cercanias-bilbao", "Cercanías Bilbao")}`, {
        question: "¿Hay Cercanías en Bilbao el 11 de noviembre?",
        notes: [
          `Desde el 1 de enero de 2025 los servicios mínimos de Cercanías Bilbao los fija el Gobierno Vasco, no el Ministerio: la ${order("orden del 6 de noviembre")} recuerda que «desde el 1 de enero de 2025, el Gobierno Vasco gestiona cinco líneas de Cercanías ferroviarias transferidas por el Estado», entre ellas las del núcleo de Bilbao.`,
        ],
      }),
      {
        id: "salud",
        group: "health",
        name: "Hospitales y centros de salud (Osakidetza)",
        setBy: "Gobierno Vasco",
        status: "published",
        text: `En los hospitales, urgencias y hospitalización con el personal habitual de un festivo, y el 100% de la diálisis, los tratamientos oncológicos, los cuidados intensivos, los partos y otros procesos que no pueden esperar; en atención primaria, los servicios de un sábado; emergencias y PAC, al 100%, según ${order()}.`,
        source: SOURCE,
        pending: PEND,
        where: `Para tu cita, tu centro de salud u hospital; la orden, en la ${link(LIST, "lista del Gobierno Vasco")}`,
      },
      {
        id: "colegios",
        group: "schools",
        name: "Colegios e institutos",
        setBy: "Gobierno Vasco",
        status: "published",
        text: `En cada centro público y edificio, 1 persona del equipo directivo y 1 subalterno por turno, y 1 profesor por etapa educativa, con uno más a partir de 100 alumnos por etapa en infantil y primaria, según ${order()}.`,
        source: SOURCE,
        pending: PEND,
        where: `El colegio informa a las familias; la orden, en la ${link(LIST, "lista del Gobierno Vasco")}`,
      },
      {
        id: "administracion",
        group: "administration",
        name: "Administración del Gobierno Vasco",
        setBy: "Gobierno Vasco",
        status: "published",
        text: `Registro de documentos de Zuzenean en la Delegación Territorial de Bizkaia (Gran Vía, 85, Bilbao), con 1 persona por turno, según ${order()}.`,
        source: SOURCE,
        pending: PEND,
        where: `La orden, en la ${link(LIST, "lista del Gobierno Vasco")}`,
      },
    ],
    msNotes: [
      `**Publicados el 6 de noviembre.** La ${order("Orden de 6 de noviembre de 2026")} del Gobierno Vasco fija en un solo texto los servicios mínimos de la sanidad, la educación, el transporte y el sector público de Euskadi, y «entrará en vigor a la fecha de su notificación».`,
    ],
    railNotes: [],
    school: `**No es festivo, y es día lectivo salvo que tu colegio diga otra cosa.** En Euskadi cada centro aprueba su calendario dentro de las normas del Departamento de Educación (en primaria, las clases «no podrán comenzar antes del día 7 de septiembre de 2026», según la ${link(SCHOOL, "resolución del curso 2026-2027")}), y el 11 de noviembre no es festivo en Bilbao, cuya fiesta local de 2026 fue el 28 de agosto (${link(HOLIDAYS, "calendario laboral de Bizkaia")}).`,
    schoolShort: "No es festivo; cada colegio fija su calendario. Mínimos: equipo directivo, subalternos y un profesor por etapa",
    demos: [
      `**Por la mañana, CCOO y UGT:** a las 11.30 h, de la Plaza Euskadi al Puente del Ayuntamiento, según ${link(UGT_E, "UGT Euskadi")} y ${link(CCOO_E, "CCOO de Euskadi")}.`,
      `**Por la tarde, LAB:** a las 18.00 h, desde la Plaza Elíptica, según ${link(LAB_PM, "LAB")}.`,
    ],
    demoShort: "CCOO y UGT, a las 11.30 h, de la Plaza Euskadi al Puente del Ayuntamiento; LAB, a las 18.00 h, desde la Plaza Elíptica",
    demoWhere: `Atentos a ${link(CCOO_E, "CCOO de Euskadi")}, ${link(UGT_E, "UGT Euskadi")} y ${link(LAB_PM, "LAB")}.`,
    callNotes: [
      `**En Euskadi hay dos convocatorias el mismo día.** La ${link(ACTIVE, "lista de huelgas del Gobierno Vasco")} recoge la «HUELGA GENERAL CAPV» del 11 de noviembre convocada por «ELA, LAB, ESK,CCOO, UGT y Otros sindicatos». ELA informó de que «el registro lo han realizado ELA, LAB, ESK, Steilas, Etxalde e Hiru» (${link(ELA, "ELA")}), y LAB, de que no hubo acuerdo con CCOO y UGT: «Aunque CCOO y UGT salgan a la huelga el mismo día, LAB no ha visto la posibilidad para otro tipo de consensos mínimos» (${link(LAB, "LAB")}).`,
    ],
    sources: [
      SOURCE,
      { name: "Órdenes de servicios mínimos", url: LIST, publisher: "Gobierno Vasco" },
      { name: "Huelgas activas (30/10/2026)", url: ACTIVE, publisher: "Gobierno Vasco" },
      { name: "Avisos", url: "https://www.metrobilbao.eus/es/avisos", publisher: "Metro Bilbao" },
      { name: "Consorcio de Transportes de Bizkaia", url: "https://www.ctb.eus/es", publisher: "Consorcio de Transportes de Bizkaia" },
      { name: "Avisos de Bizkaibus", url: "https://www.bizkaia.eus/es/web/bizkaibus/avisos", publisher: "Diputación Foral de Bizkaia" },
      { name: "Noticias", url: "https://www.euskotren.eus/es/tren/noticias", publisher: "Euskotren" },
      { name: "Cercanías Bilbao", url: "https://www.renfe.com/es/es/cercanias/cercanias-bilbao", publisher: "Renfe" },
      { name: "Resolución del calendario escolar de Educación Primaria 2026-2027", url: SCHOOL, publisher: "Gobierno Vasco" },
      { name: "Calendario laboral de Bizkaia 2026 (modificación)", url: HOLIDAYS, publisher: "Gobierno Vasco" },
      { name: "CCOO de Euskadi y UGT-Euskadi presentan la Huelga General del 11 de noviembre (02/11/2026)", url: CCOO_E, publisher: "CCOO de Euskadi" },
      { name: "UGT y CCOO llaman a parar Euskadi el 11N e impulsan manifestaciones en las tres capitales", url: UGT_E, publisher: "UGT Euskadi" },
      { name: "El día de la huelga general nos movilizaremos en más de 70 localidades a la tarde (05/11/2026)", url: LAB_PM, publisher: "LAB" },
      { name: "Registran la convocatoria del 11 de noviembre en Euskal Herria (13/10/2026)", url: ELA, publisher: "ELA" },
      { name: "Llamamos a vaciar los centros de trabajo y llenar las calles el 11 de noviembre (22/10/2026)", url: LAB, publisher: "LAB" },
    ],
  };
}

/* -------------------------------------------------------------------------- */
/* Palma (Illes Balears) and Las Palmas de Gran Canaria                       */
/* -------------------------------------------------------------------------- */

function palma(): Strike11nCity {
  const BOIB = "https://www.caib.es/eboibfront/es";
  // Read on 10 Nov 2026: the Govern's agreement (BOIB núm. 142, 7 Nov) and Palma's decision for the EMT (BOIB núm. 144 ext., 10 Nov).
  const GOVERN = {
    name: "Acuerdo del Consejo de Gobierno de 6 de noviembre de 2026 por el que se aprueban las medidas para garantizar los servicios mínimos en la huelga del 11 de noviembre de 2026 (BOIB núm. 142, 7 de noviembre de 2026)",
    url: "https://www.caib.es/eboibfront/es/2026/12356/721966/acuerdo-del-consejo-de-gobierno-de-6-de-noviembre-",
    publisher: "Govern de les Illes Balears",
  };
  const EMT = {
    name: "Determinación de los servicios mínimos para la convocatoria de huelga general del 11 de noviembre de 2026 (BOIB núm. 144 extraordinario, 10 de noviembre de 2026)",
    url: "https://www.caib.es/eboibfront/es/2026/12360/722067/determinacion-de-los-servicios-minimos-para-la-con",
    publisher: "Ayuntamiento de Palma",
  };
  const govern = (label = "el acuerdo del Govern balear") => link(GOVERN.url, label);
  const PEND = `Los fija el Govern de les Illes Balears por acuerdo del Consell de Govern, que se publica en el ${link(BOIB, "BOIB")}.`;
  return {
    ...ref("palma"),
    titleTransport: "EMT, metro y tren",
    transportShort: "EMT, metro, tren y autobuses TIB",
    authority: `el Govern de les Illes Balears, en un acuerdo del Consell de Govern publicado en el ${link(BOIB, "BOIB")}, salvo los de la EMT, que fija el Ayuntamiento de Palma`,
    authorityShort: "el Govern balear (BOIB) y, para la EMT, el Ayuntamiento de Palma",
    bulletin: "el BOIB",
    cercanias: null,
    airport: "Palma de Mallorca",
    airNotes: airNotes("Palma de Mallorca", 75, 53, null),
    msSummary: `EMT, al 30% en la mayoría de las líneas, al 40% en seis y al 100% en las del Hospital Son Llàtzer; metro y tren, al 80%, con menos servicio de 10.00 a 12.00 y de 17.00 a 19.00 h; autobuses TIB, como un domingo o festivo, según ${govern("el acuerdo del Govern balear del 6 de noviembre")} y la ${link(EMT.url, "resolución del Ayuntamiento de Palma")}`,
    services: [
      out("emt", "transport", "Autobuses de la EMT de Palma", "Ayuntamiento de Palma", `Líneas 27 y 28 (Hospital Son Llàtzer), el 100%; línea 33 (Son Espases), 8 de los 15 servicios programados; líneas 6, 20, 29, 34, 36 y 39, el 40%; el resto de las líneas, el 30%, según la ${link(EMT.url, "resolución del Ayuntamiento de Palma publicada en el BOIB del 10 de noviembre")}.`, EMT, `Los fija el Ayuntamiento de Palma, que los publica en el ${link(BOIB, "BOIB")}.`, `Los avisos, en ${link("https://www.emtpalma.cat/es", "emtpalma.cat")}`, { question: "¿Hay autobuses de la EMT en Palma el 11 de noviembre?" }),
      out("sfm", "transport", "Metro y tren de Mallorca (SFM)", "Govern de les Illes Balears", `Metro: el 50% de los servicios de un día laborable de 10.00 a 12.00 y de 17.00 a 19.00 h, y el 80% en las demás franjas. Tren (Palma-Inca-Manacor-Sa Pobla): los servicios de un fin de semana o festivo de 10.00 a 12.00 y de 17.00 a 19.00 h, y el 80% el resto del día, según ${govern()}.`, GOVERN, PEND, `Las ${link("https://www.trensfm.com/es/comunicacion/noticias", "noticias de SFM")}`, { question: "¿Hay metro y tren en Mallorca el 11 de noviembre?" }),
      out("tib", "transport", "Autobuses interurbanos TIB", "Govern de les Illes Balears", `Los servicios de un domingo o festivo; el transporte escolar, al 100%, según ${govern()}.`, GOVERN, PEND, `Los ${link("https://www.tib.org/es/avisos", "avisos del TIB")}`),
      out("salud", "health", "Hospitales y centros de salud (IB-Salut)", "Govern de les Illes Balears", `Urgencias, con normalidad; el 100% en oncología, diálisis, hospital de día, farmacia hospitalaria y trasplantes; los centros de salud, abiertos con dos médicos, un pediatra y dos enfermeras de 8.00 a 15.00 h, y con un médico y una enfermera de 15.00 a 20.00 h, según ${govern()}.`, GOVERN, PEND, `Para tu cita, tu hospital o centro de salud; el acuerdo, en el ${link(BOIB, "BOIB")}`),
      out("colegios", "schools", "Colegios e institutos", "Govern de les Illes Balears", `Los centros abren todo el horario escolar, con el director y el secretario, un docente por cada 3 unidades de segundo ciclo de infantil y uno por cada 4 unidades de primaria, según ${govern()}.`, GOVERN, PEND, `El colegio informa a las familias; el acuerdo, en el ${link(BOIB, "BOIB")}`),
      out("administracion", "administration", "Administración del Govern balear", "Govern de les Illes Balears", `Un funcionario en el registro general de cada consejería, según ${govern()}.`, GOVERN, PEND, `El acuerdo, en el ${link(BOIB, "BOIB")}`),
    ],
    msNotes: [
      `**Publicados el 7 y el 10 de noviembre.** El ${govern("Acuerdo del Consejo de Gobierno de 6 de noviembre de 2026")} (BOIB núm. 142, del 7 de noviembre) fija en un solo texto los del metro y los trenes de SFM, los autobuses interurbanos, la sanidad, los colegios y la administración del Govern. Los de la EMT los fijó el Ayuntamiento de Palma en una ${link(EMT.url, "resolución")} que salió en el BOIB extraordinario núm. 144, el 10 de noviembre.`,
    ],
    railNotes: [],
    school: null,
    schoolShort: "Por confirmar: no hemos podido comprobar en el calendario escolar balear si el 11 de noviembre es lectivo; pregunta en el colegio",
    demos: [],
    demoShort: null,
    demoWhere: `Atentos a la web de ${link("https://www.ugtbalears.com/", "UGT Illes Balears")}: en cuanto los convocantes publiquen la hora y el lugar, los pondremos aquí.`,
    callNotes: [
      `**En Baleares**, UGT Illes Balears informó el 29 de octubre de que registró la convocatoria en la Conselleria de Presidencia junto con CCOO, STEI, CGT, CNT, SATI, el Sindicat de Llogateres y la Plataforma de Afectados por la Hipoteca (${link("https://www.ugtbalears.com/", "UGT Illes Balears")}).`,
    ],
    sources: [
      GOVERN,
      EMT,
      { name: "BOIB: Butlletí Oficial de les Illes Balears", url: BOIB, publisher: "Govern de les Illes Balears" },
      { name: "EMT Palma", url: "https://www.emtpalma.cat/es", publisher: "EMT Palma" },
      { name: "Noticias", url: "https://www.trensfm.com/es/comunicacion/noticias", publisher: "Serveis Ferroviaris de Mallorca" },
      { name: "Avisos", url: "https://www.tib.org/es/avisos", publisher: "TIB" },
      { name: "UGT Illes Balears", url: "https://www.ugtbalears.com/", publisher: "UGT Illes Balears" },
    ],
  };
}

function lasPalmas(): Strike11nCity {
  const BOC = "https://www.gobiernodecanarias.org/boc/";
  const AUTGC_2024 = "https://www.laspalmasgc.es/es/ayuntamiento/prensa-y-comunicacion/notas-de-prensa/nota-de-prensa/Guaguas-Municipales-despliega-este-jueves-28-y-viernes-29-los-servicios-minimos-decretados-para-la-huelga-nacional-de-transportes/";
  const SCHOOL = "https://www.gobiernodecanarias.org/boc/2026/061/1025.html";
  const AUTGC = `Los fija la Autoridad Única del Transporte de Gran Canaria por resolución, como en la ${link(AUTGC_2024, "huelga del transporte de noviembre de 2024")}.`;
  // Read on 10 Nov 2026: Guaguas Municipales' own notice and the orders of BOC núm. 224 (10 Nov).
  const BOC_224 = "https://www.gobiernodecanarias.org/boc/2026/224/";
  const GG = { name: "Estado del servicio durante la huelga general del 11N: servicios mínimos", url: "https://www.guaguas.com/huelga", publisher: "Guaguas Municipales" };
  const HEALTH = { name: "Orden de 6 de noviembre de 2026: servicios mínimos del personal del Servicio Canario de la Salud en la huelga general del 11 de noviembre de 2026 (BOC núm. 224, 10 de noviembre de 2026)", url: `${BOC_224}3879.html`, publisher: "Gobierno de Canarias" };
  const EDU = { name: "Orden de 5 de noviembre de 2026: servicios mínimos del personal docente y no docente de la Consejería de Educación en la huelga del 11 de noviembre de 2026 (BOC núm. 224, 10 de noviembre de 2026)", url: `${BOC_224}3869.html`, publisher: "Gobierno de Canarias" };
  const BUS = { name: "Orden de 5 de noviembre de 2026: servicios mínimos en el transporte escolar en la huelga general del 11 de noviembre de 2026 (BOC núm. 224, 10 de noviembre de 2026)", url: `${BOC_224}3870.html`, publisher: "Gobierno de Canarias" };
  const BOC_SOURCE = { name: "BOC núm. 224, de 10 de noviembre de 2026: órdenes de servicios mínimos de cada consejería para la huelga general del 11 de noviembre", url: BOC_224, publisher: "Gobierno de Canarias" };
  const CANARIAS = `Los fija el Gobierno de Canarias por orden, que se publica en el ${link(BOC, "BOC")}.`;
  return {
    ...ref("lasPalmas"),
    titleTransport: "guaguas",
    transportShort: "guaguas urbanas e interurbanas",
    authority: `el Gobierno de Canarias, en órdenes publicadas en el ${link(BOC, "BOC")} del 10 de noviembre, salvo los de las guaguas, que fija la Autoridad Única del Transporte de Gran Canaria`,
    authorityShort: "el Gobierno de Canarias (BOC) y, para las guaguas, la Autoridad Única del Transporte de Gran Canaria",
    bulletin: "el BOC",
    cercanias: null,
    airport: "Gran Canaria",
    airNotes: airNotes("Gran Canaria", 72, 56, null),
    msSummary: `Guaguas Municipales, con el servicio de un día festivo y todas las líneas activas; en los hospitales, los servicios de un domingo o festivo, y el transporte escolar, al 100%, según ${link(GG.url, "Guaguas Municipales")} y las órdenes del Gobierno de Canarias publicadas en el ${link(BOC_224, "BOC del 10 de noviembre")}`,
    services: [
      out("guaguas", "transport", "Guaguas Municipales", "Autoridad Única del Transporte de Gran Canaria", `El servicio de un día festivo: siguen activas todas las líneas habituales, también las tres nocturnas, por resolución de la Autoridad Única del Transporte de Gran Canaria, según ${link(GG.url, "Guaguas Municipales")}, que publica el horario de cada línea.`, GG, AUTGC, `El horario de cada línea, en la ${link(GG.url, "página de servicios mínimos de Guaguas Municipales")}`, { question: "¿Hay guaguas en Las Palmas de Gran Canaria el 11 de noviembre?" }),
      pending("global", "transport", "Guaguas interurbanas (Global)", "Autoridad Única del Transporte de Gran Canaria", AUTGC, `La resolución, cuando salga, la anunciará el ${link("https://www.laspalmasgc.es/es/ayuntamiento/prensa-y-comunicacion/notas-de-prensa/", "Ayuntamiento")} con las de Guaguas Municipales`),
      out("salud", "health", "Hospitales y centros de salud (Servicio Canario de la Salud)", "Gobierno de Canarias", `El 100% de la asistencia urgente; en los hospitales, en general, los servicios de un domingo o festivo, y el 100% en oncología, radioterapia, diálisis, hospital de día y farmacia hospitalaria; en los centros de salud, un profesional de cada categoría, que atiende sobre todo las urgencias, y las urgencias extrahospitalarias, al 100%, según la ${link(HEALTH.url, "Orden de 6 de noviembre de 2026")}.`, HEALTH, CANARIAS, `Para tu cita, tu hospital o centro de salud; la orden, en el ${link(BOC, "BOC")}`),
      out("colegios", "schools", "Colegios e institutos", "Gobierno de Canarias", `En los colegios de infantil y primaria, un cargo directivo y un docente por cada 8 grupos (uno en los de hasta 8 grupos); en los institutos, un cargo directivo y un docente por cada 10 grupos, según la ${link(EDU.url, "orden de la Consejería de Educación")}; el transporte escolar, al 100%, según la ${link(BUS.url, "orden del transporte escolar")}.`, EDU, CANARIAS, `El colegio informa a las familias; la orden, en el ${link(BOC, "BOC")}`),
      out("administracion", "administration", "Administración del Gobierno de Canarias", "Gobierno de Canarias", `Los de cada consejería, en su propia orden: están en el ${link(BOC_224, "BOC núm. 224, del 10 de noviembre")}.`, BOC_SOURCE, CANARIAS, `Las órdenes, en el ${link(BOC, "BOC")}`),
    ],
    msNotes: [
      `**Publicados el 10 de noviembre.** El ${link(BOC_224, "BOC núm. 224")} trae las órdenes del Gobierno de Canarias para el 11N, una por consejería: entre ellas, las del Servicio Canario de la Salud, el personal de los centros educativos y el transporte escolar.`,
      `**Guaguas:** la Autoridad Única del Transporte de Gran Canaria ha decretado para las guaguas municipales el servicio de un día festivo, según ${link(GG.url, "Guaguas Municipales")}. De las guaguas interurbanas de Global no habíamos encontrado nada publicado el 10 de noviembre.`,
    ],
    railNotes: [],
    school: `**No es festivo, y es día lectivo salvo que tu colegio lo haya elegido como día de libre disposición.** El ${link(SCHOOL, "calendario escolar 2026-2027 de Canarias")} solo tiene en noviembre el festivo del día 2, pero los consejos escolares de cada centro podían fijar «hasta un máximo de cuatro días no lectivos»: confírmalo con el colegio.`,
    schoolShort: "No es festivo; confirma con el colegio sus días de libre disposición",
    demos: [],
    demoShort: null,
    demoWhere: `Atentos a la web de ${link("https://canarias.ccoo.es/", "CCOO Canarias")}: en cuanto los convocantes publiquen la hora y el lugar, los pondremos aquí.`,
    callNotes: [],
    sources: [
      GG,
      HEALTH,
      EDU,
      BUS,
      BOC_SOURCE,
      { name: "BOC: Boletín Oficial de Canarias", url: BOC, publisher: "Gobierno de Canarias" },
      { name: "Guaguas Municipales despliega los servicios mínimos decretados para la huelga nacional de transportes (27/11/2024)", url: AUTGC_2024, publisher: "Ayuntamiento de Las Palmas de Gran Canaria" },
      { name: "Notas de prensa", url: "https://www.laspalmasgc.es/es/ayuntamiento/prensa-y-comunicacion/notas-de-prensa/", publisher: "Ayuntamiento de Las Palmas de Gran Canaria" },
      { name: "Resolución de 17 de marzo de 2026: calendario escolar 2026-2027 de Canarias (BOC núm. 61, 30 de marzo de 2026)", url: SCHOOL, publisher: "Gobierno de Canarias" },
      { name: "CCOO Canarias", url: "https://canarias.ccoo.es/", publisher: "CCOO Canarias" },
    ],
  };
}

/* -------------------------------------------------------------------------- */
/* Murcia and Valladolid                                                      */
/* -------------------------------------------------------------------------- */

function murcia(): Strike11nCity {
  const BORM = "https://www.borm.es/";
  const RULE = "https://www.borm.es/services/anuncio/843842/pdf";
  const PREV = "https://www.borm.es/services/anuncio/ano/2025/numero/4821/pdf?id=838906";
  const BUS_2024 = "https://centromedios.murcia.es/PUBLICO/NotaPrensa/Default.aspx?pIdPagina=25&pIdNoticia=73375";
  const SCHOOL = "https://www.borm.es/services/anuncio/ano/2026/numero/2748/pdf?id=843430";
  const CARM = `La Región de Murcia los fija, en una huelga general, «mediante decreto del Consejo de Gobierno» (${link(RULE, "BORM del 30 de junio de 2026")}), que se publica en el ${link(BORM, "BORM")}.`;
  return {
    ...ref("murcia"),
    titleTransport: "tranvía y bus",
    transportShort: "tranvía y autobuses",
    authority: `la Región de Murcia, por decreto del Consejo de Gobierno que se publica en el ${link(BORM, "BORM")}, salvo los del autobús urbano, que fija el Ayuntamiento de Murcia`,
    authorityShort: "la Región de Murcia (BORM) y, para el autobús urbano, el Ayuntamiento",
    bulletin: "el BORM",
    cercanias: "Cercanías Murcia/Alicante",
    airport: "Región de Murcia",
    airNotes: airNotes("Región de Murcia", 72, 49, 32),
    msSummary: null,
    services: [
      pending("bus", "transport", "Autobús urbano de Murcia", "Ayuntamiento de Murcia", `Los fija el Ayuntamiento de Murcia, como en la ${link(BUS_2024, "huelga de autobuses de 2024")}, y los anuncia en su ${link("https://centromedios.murcia.es/", "centro de medios")}.`, `El estado de las líneas, en ${link("https://web.murcia.es/al-instante-autobuses", "Al Instante")}`, { question: "¿Hay autobuses en Murcia el 11 de noviembre?" }),
      pending("tranvia", "transport", "Tranvía de Murcia", "Por confirmar", `No hemos podido confirmar quién los fija: ni el ${link(BORM, "BORM")} ni el ${link("https://centromedios.murcia.es/", "Ayuntamiento")} los han publicado.`, `Los avisos, en ${link("https://www.tranviademurcia.es/", "tranviademurcia.es")}`, { question: "¿Hay tranvía en Murcia el 11 de noviembre?" }),
      pending("salud", "health", "Hospitales y centros de salud (SMS)", "Región de Murcia", CARM, `Para tu cita, tu hospital o centro de salud; el decreto, en el ${link(BORM, "BORM")}`),
      pending("colegios", "schools", "Colegios e institutos", "Región de Murcia", CARM, `El colegio informa a las familias; el texto, en el ${link(BORM, "BORM")}`),
      pending("administracion", "administration", "Administración regional", "Región de Murcia", CARM, `El texto, en el ${link(BORM, "BORM")}`),
    ],
    msNotes: [
      `En la huelga general del 15 de octubre de 2025, el ${link(PREV, "decreto del Consejo de Gobierno")} se firmó el 9 de octubre y el BORM lo publicó el 14, la víspera. El 6 de noviembre, el BORM aún no tenía ninguno para el 11N.`,
    ],
    railNotes: [],
    school: `**Sí, es día lectivo.** El calendario escolar 2026-2027 de la Región de Murcia (${link(SCHOOL, "Resolución de 8 de junio de 2026")}) da a la ciudad de Murcia como festivos locales el 15 de septiembre de 2026 y el 30 de marzo de 2027; el 11 de noviembre no es festivo.`,
    schoolShort: "Sí, es día lectivo",
    demos: [],
    demoShort: null,
    demoWhere: `Atentos a las webs de ${link("https://murcia.ccoo.es/", "CCOO Región de Murcia")} y ${link("https://ugtmurcia.es/", "UGT Región de Murcia")}: en cuanto publiquen la hora y el lugar, los pondremos aquí.`,
    callNotes: [],
    sources: [
      { name: "BORM: Boletín Oficial de la Región de Murcia", url: BORM, publisher: "Región de Murcia" },
      { name: "BORM núm. 148, 30 de junio de 2026: procedimiento de fijación de servicios mínimos", url: RULE, publisher: "Región de Murcia" },
      { name: "Decreto n.º 156/2025, de 9 de octubre: servicios mínimos de la huelga del 15 de octubre de 2025 (BORM núm. 238, 14 de octubre de 2025)", url: PREV, publisher: "Región de Murcia" },
      { name: "Servicios mínimos en el transporte público por autobús (2024)", url: BUS_2024, publisher: "Ayuntamiento de Murcia" },
      { name: "Centro de medios", url: "https://centromedios.murcia.es/", publisher: "Ayuntamiento de Murcia" },
      { name: "Al Instante: autobuses", url: "https://web.murcia.es/al-instante-autobuses", publisher: "Ayuntamiento de Murcia" },
      { name: "Tranvía de Murcia", url: "https://www.tranviademurcia.es/", publisher: "Tranvía de Murcia" },
      { name: "Resolución de 8 de junio de 2026: calendario escolar 2026-2027 (BORM núm. 132, 11 de junio de 2026)", url: SCHOOL, publisher: "Región de Murcia" },
      { name: "CCOO Región de Murcia", url: "https://murcia.ccoo.es/", publisher: "CCOO" },
      { name: "UGT Región de Murcia", url: "https://ugtmurcia.es/", publisher: "UGT" },
    ],
  };
}

function valladolid(): Strike11nCity {
  const BOCYL = "https://bocyl.jcyl.es/";
  const A154 = "https://bocyl.jcyl.es/boletines/2026/11/06/pdf/BOCYL-D-06112026-215-31.pdf";
  const A155 = "https://bocyl.jcyl.es/boletines/2026/11/06/pdf/BOCYL-D-06112026-215-32.pdf";
  const S154 = { name: "Acuerdo 154/2026, de 5 de noviembre, de la Junta de Castilla y León: servicios mínimos en la Administración General de la Comunidad y sus organismos autónomos (BOCYL núm. 215, 6 de noviembre)", url: A154, publisher: "Junta de Castilla y León" };
  const S155 = { name: "Acuerdo 155/2026, de 5 de noviembre, de la Junta de Castilla y León: servicios mínimos en los entes públicos, el transporte y la enseñanza privada (BOCYL núm. 215, 6 de noviembre)", url: A155, publisher: "Junta de Castilla y León" };
  const AUVASA_2024 = "https://www.auvasa.es/servicios-minimos-en-auvasa-con-motivo-de-la-huelga-del-sector-de-conduccion/";
  const JCYL = `Los fija la Junta de Castilla y León por acuerdo, publicado en el ${link(BOCYL, "BOCYL")}.`;
  const a154 = link(A154, "el Acuerdo 154/2026 de la Junta");
  return {
    ...ref("valladolid"),
    titleTransport: "AUVASA",
    transportShort: "autobuses urbanos y metropolitanos",
    authority: `la Junta de Castilla y León, en acuerdos publicados en el ${link(BOCYL, "BOCYL")} del 6 de noviembre, salvo los de AUVASA, que no ha publicado nadie`,
    authorityShort: "la Junta de Castilla y León (BOCYL)",
    bulletin: "el BOCYL",
    cercanias: null,
    airport: "Valladolid",
    airNotes: airNotes("Valladolid", 57, 64, 32),
    msSummary: `autobuses metropolitanos de la Junta, al 50% de las expediciones de 7 a 10, de 13.30 a 16.00 y de 18 a 21 h; en colegios y centros de salud, los mínimos de los acuerdos de la Junta publicados el 6 de noviembre (${link(A155, "transporte")} y ${link(A154, "Administración")}). Los de AUVASA, aún no`,
    services: [
      pending("auvasa", "transport", "Autobuses urbanos (AUVASA)", "Ayuntamiento de Valladolid", `El acuerdo de transporte de la Junta solo cubre los autobuses de titularidad autonómica. En la ${link(AUVASA_2024, "huelga del sector de 2024")} los fijó el Ayuntamiento de Valladolid; para el 11N, ni el Ayuntamiento ni AUVASA los habían publicado.`, `Los ${link("https://www.auvasa.es/avisos", "avisos de AUVASA")}`, { question: "¿Hay autobuses de AUVASA el 11 de noviembre?" }),
      {
        id: "metropolitanos",
        group: "transport",
        name: "Autobuses metropolitanos e interurbanos",
        setBy: "Junta de Castilla y León",
        status: "published",
        text: `En los servicios de cercanías (a menos de 10 km de la capital), el 50% de las expediciones de 7 a 10, de 13.30 a 16.00 y de 18 a 21 h; en el resto, de 1 a 3 viajes de ida y vuelta por franja según las expediciones de cada línea, y el 10% fuera de esas franjas; el transporte escolar, al 100%, según el ${link(A155, "Acuerdo 155/2026 de la Junta")}.`,
        source: S155,
        pending: JCYL,
        where: `La ${link("https://carreterasytransportes.jcyl.es/web/es/viajeros/transporte-metropolitano-valladolid.html", "página del transporte metropolitano de Valladolid")}`,
      },
      {
        id: "salud",
        group: "health",
        name: "Hospitales y centros de salud (Sacyl)",
        setBy: "Junta de Castilla y León",
        status: "published",
        text: `Con carácter general, la atención urgente con el personal de un día festivo; en los hospitales, el 100% de la asistencia en oncología, diálisis, hospital de día y farmacia hospitalaria; en atención primaria se mantiene la jornada de mañana y la urgencia la cubren los equipos de atención primaria y los servicios de urgencias, según ${a154}.`,
        source: S154,
        pending: JCYL,
        where: `Para tu cita, tu hospital o centro de salud; las tablas de cada centro, en ${a154}`,
      },
      {
        id: "colegios",
        group: "schools",
        name: "Colegios e institutos públicos",
        setBy: "Junta de Castilla y León",
        status: "published",
        text: `Cada centro abre con el director y el jefe de estudios (o el secretario) y al menos un ordenanza por turno, y el personal de comedor, residencia y apoyo al alumnado con necesidades especiales que fija el anexo, según ${a154}.`,
        source: S154,
        pending: JCYL,
        where: `El colegio informa a las familias; el anexo de Educación, en ${a154}`,
      },
      {
        id: "administracion",
        group: "administration",
        name: "Administración de la Junta de Castilla y León",
        setBy: "Junta de Castilla y León",
        status: "published",
        text: `Apertura, cierre y seguridad de los edificios y atención de incidencias urgentes y trámites inaplazables, con el personal que fijan sus anexos, según ${a154}.`,
        source: S154,
        pending: JCYL,
        where: `Los anexos de cada consejería, en ${a154}`,
      },
    ],
    msNotes: [
      `**Publicados el 6 de noviembre.** La Junta de Castilla y León aprobó el 5 de noviembre cuatro acuerdos de servicios mínimos, que el BOCYL núm. 215 publicó al día siguiente: el ${link(A154, "Acuerdo 154/2026")} (Administración de la Comunidad, incluidos los colegios y la sanidad públicos), el ${link(A155, "Acuerdo 155/2026")} (entes públicos, transporte y enseñanza privada) y otros dos para las universidades y las empresas privadas que trabajan para la Junta.`,
    ],
    railNotes: [],
    school: `**Sí, es día lectivo.** El calendario escolar 2026-2027 de Castilla y León (${link("https://bocyl.jcyl.es/boletines/2026/05/28/pdf/BOCYL-D-28052026-101-28.pdf", "Orden EDU/478/2026")}) no tiene más festivos en otoño que «el 2 de noviembre y el 7 y 8 de diciembre», además de las fiestas locales, que en Valladolid son el 13 de mayo y el 8 de septiembre (${link("https://trabajoyprevencion.jcyl.es/web/jcyl/binarios/635/169/08%20BOP%20FIESTAS%20LOCALES%20VALLADOLID%2026,0.pdf?blobheader=application%2Fpdf%3Bcharset%3DUTF-8&blobnocache=true", "fiestas locales de 2026 en la provincia")}).`,
    schoolShort: "Sí, es día lectivo. Los colegios abren con el director, el jefe de estudios y un ordenanza por turno",
    demos: [],
    demoShort: null,
    demoWhere: `CCOO de Castilla y León solo dice que «se convocarán grandes manifestaciones» (${link("https://castillayleon.ccoo.es/noticia:770501--Ana_Fernandez_de_los_Muros_augura_un_11N_historico_frente_a_la_precariedad_laboral_y_el_problema_de_la_vivienda&opc_id=61952cfe7ba2f6fbe0db539f6f403dbc", "CCOO CyL")}). En cuanto los convocantes publiquen la hora y el lugar, los pondremos aquí.`,
    callNotes: [],
    sources: [
      S154,
      S155,
      { name: "Servicios mínimos en AUVASA con motivo de la huelga del sector de conducción (2024)", url: AUVASA_2024, publisher: "AUVASA" },
      { name: "Avisos", url: "https://www.auvasa.es/avisos", publisher: "AUVASA" },
      { name: "Transporte metropolitano de Valladolid", url: "https://carreterasytransportes.jcyl.es/web/es/viajeros/transporte-metropolitano-valladolid.html", publisher: "Junta de Castilla y León" },
      { name: "Orden EDU/478/2026: calendario escolar 2026-2027 (BOCYL núm. 101, 28 de mayo de 2026)", url: "https://bocyl.jcyl.es/boletines/2026/05/28/pdf/BOCYL-D-28052026-101-28.pdf", publisher: "Junta de Castilla y León" },
      { name: "Fiestas locales de 2026 en la provincia de Valladolid", url: "https://trabajoyprevencion.jcyl.es/web/jcyl/binarios/635/169/08%20BOP%20FIESTAS%20LOCALES%20VALLADOLID%2026,0.pdf?blobheader=application%2Fpdf%3Bcharset%3DUTF-8&blobnocache=true", publisher: "Junta de Castilla y León" },
      { name: "Ana Fernández de los Muros augura un 11N histórico", url: "https://castillayleon.ccoo.es/noticia:770501--Ana_Fernandez_de_los_Muros_augura_un_11N_historico_frente_a_la_precariedad_laboral_y_el_problema_de_la_vivienda&opc_id=61952cfe7ba2f6fbe0db539f6f403dbc", publisher: "CCOO de Castilla y León" },
    ],
  };
}

/* -------------------------------------------------------------------------- */
/* Galicia: Vigo and A Coruña                                                 */
/* -------------------------------------------------------------------------- */

const DOG = "https://www.xunta.gal/diario-oficial-galicia";
const GAL_SCHOOL = "https://www.xunta.gal/dog/Publicados/2026/20260615/AnuncioG0761-050626-0001_gl.pdf";
const GAL_HOLIDAYS = "https://www.xunta.gal/dog/Publicados/2025/20251030/AnuncioG0767-221025-0001_gl.pdf";
const UGT_GAL = "https://www.ugtgalicia.org/sites/www.ugtgalicia.org/files/Dise%C3%B1o%20sin%20t%C3%ADtulo%20%281%29.pdf";
const CIG_DEMOS = "https://www.cig.gal/nova/a-cig-convoca-17-mobilizacions-para-a-folga-xeral-do-11-de-novembro.html";
const CIG_CALL = "https://www.cig.gal/nova/a-cig-rexistra-a-convocatoria-de-folga-xeral-en-galiza-para-o-11-de-novembro-para-frear-a-deterioracion-das-condicions-de-vida.html";
// Read on 10 Nov 2026: the general order (DOG núm. 214, 9 Nov) and the health one (DOG núm. 215, 10 Nov).
const GAL_ORDER = {
  name: "Orde do 6 de novembro de 2026 pola que se establecen os servizos mínimos na folga do 11 de novembro de 2026 (Consellería de Presidencia, Xustiza e Deportes; DOG núm. 214, 9 de novembro de 2026)",
  url: "https://www.xunta.gal/dog/Publicados/2026/20261109/AnuncioG0759-051126-0001_gl.html",
  publisher: "Xunta de Galicia",
};
const GAL_HEALTH = {
  name: "Orde do 6 de novembro de 2026 pola que se determinan os servizos mínimos no ámbito da asistencia sanitaria na folga do 11 de novembro de 2026 (Consellería de Sanidade; DOG núm. 215, 10 de novembro de 2026)",
  url: "https://www.xunta.gal/dog/Publicados/2026/20261110/AnuncioC3K1-061126-0002_gl.html",
  publisher: "Xunta de Galicia",
};
const BUS_GAL = "https://www.bus.gal/gl/descargas/servizos_minimos";
const galOrder = (label = "la orden de la Xunta del 6 de noviembre") => link(GAL_ORDER.url, label);
const XUNTA = (dept: string) => `Los fija la Xunta de Galicia (${dept}) por orden, que se publica en el ${link(DOG, "DOG")}.`;
const GAL_SOURCES = [
  GAL_ORDER,
  GAL_HEALTH,
  { name: "Servizos mínimos (descargas)", url: BUS_GAL, publisher: "Xunta de Galicia (bus.gal)" },
  { name: "DOG: Diario Oficial de Galicia", url: DOG, publisher: "Xunta de Galicia" },
  { name: "Orde do 4 de xuño de 2026: calendario escolar 2026/27 (DOG núm. 110, 15 de xuño de 2026)", url: GAL_SCHOOL, publisher: "Xunta de Galicia" },
  { name: "Resolución do 21 de outubro de 2025: festas locais de 2026 (DOG núm. 210, 30 de outubro de 2025)", url: GAL_HOLIDAYS, publisher: "Xunta de Galicia" },
  { name: "Mobilizacións do 11N en Galicia (UGT e CCOO)", url: UGT_GAL, publisher: "UGT Galicia" },
  { name: "A CIG convoca 17 mobilizacións para a folga xeral do 11 de novembro", url: CIG_DEMOS, publisher: "CIG" },
  { name: "A CIG rexistra a convocatoria de folga xeral en Galiza para o 11 de novembro (13/10/2026)", url: CIG_CALL, publisher: "CIG" },
  { name: "Avisos", url: "https://www.bus.gal/gl/avisos", publisher: "Xunta de Galicia (bus.gal)" },
];
const GAL_SERVICES = (office: string): CityService[] => [
  out(
    "interurbanos",
    "transport",
    "Autobuses interurbanos de la Xunta",
    "Xunta de Galicia",
    `Los que la Xunta publica, línea por línea, en ${link(BUS_GAL, "bus.gal")}; el transporte escolar, en la entrada de 7.30 a 10.30 h y en la salida de 13.30 a 19.00 h, en los itinerarios de enseñanza obligatoria de más de 4 km, según ${galOrder()}.`,
    GAL_ORDER,
    XUNTA("Consellería de Presidencia"),
    `Los ${link("https://www.bus.gal/gl/avisos", "avisos de bus.gal")}`,
  ),
  out(
    "salud",
    "health",
    "Hospitales y centros de salud (Sergas)",
    "Xunta de Galicia (Sanidade)",
    `El 100% de las urgencias, el 061 y los puntos de atención continuada (PAC), y de la UCI, la diálisis, los tratamientos oncológicos y los trasplantes; en las consultas, solo lo urgente y lo preferente; en los centros de salud, solo la atención urgente o que no se pueda aplazar, con entre uno y cuatro médicos según el tamaño del centro y un pediatra, según la ${link(GAL_HEALTH.url, "orden de la Consellería de Sanidade del 6 de noviembre")}.`,
    GAL_HEALTH,
    XUNTA("Consellería de Sanidade"),
    `Para tu cita, tu hospital o centro de salud; la orden, en el ${link(DOG, "DOG")}`,
  ),
  out(
    "colegios",
    "schools",
    "Colegios e institutos públicos",
    "Xunta de Galicia",
    `Los centros abren en su horario habitual, con el director o un miembro del equipo directivo y un subalterno, y una persona de cocina donde el comedor es de gestión directa; los mismos, en los centros privados y concertados, según ${galOrder()}.`,
    GAL_ORDER,
    XUNTA("Consellería de Presidencia"),
    `El colegio informa a las familias; la orden, en el ${link(DOG, "DOG")}`,
  ),
  out("administracion", "administration", "Administración de la Xunta", "Xunta de Galicia", `${office}, según ${galOrder()}.`, GAL_ORDER, XUNTA("Consellería de Presidencia"), `La orden, en el ${link(DOG, "DOG")}`),
];
const GAL_SUMMARY = `autobuses interurbanos, con los servicios mínimos que la Xunta publica en ${link(BUS_GAL, "bus.gal")}; en los hospitales, el 100% de las urgencias, y en los centros de salud, solo la atención urgente; los colegios abren, con un directivo y un subalterno, según las ${galOrder("órdenes de la Xunta")} publicadas en el DOG el 9 y el 10 de noviembre`;
const GAL_MS_NOTES = [
  `**Publicados el 9 y el 10 de noviembre.** La ${galOrder("Orde do 6 de novembro de 2026")} de la Consellería de Presidencia, Xustiza e Deportes (DOG núm. 214, del 9 de noviembre) fija los del personal de la Xunta, los colegios y los autobuses interurbanos, entre otros, y la ${link(GAL_HEALTH.url, "orden de la Consellería de Sanidade")} (DOG núm. 215, del 10 de noviembre), los de la sanidad. Ninguna de las dos cubre el autobús urbano.`,
];
const GAL_CALL = [
  `**En Galicia, la CIG convoca su propia huelga general** el mismo día: «A CIG rexistrou esta mañá a convocatoria de folga xeral en toda Galiza para o vindeiro 11 de novembro» (${link(CIG_CALL, "CIG")}).`,
];
const galSchool = (city: string, holidays: string) =>
  `**Sí, es día lectivo.** El calendario escolar 2026-2027 de Galicia (${link(GAL_SCHOOL, "Orde do 4 de xuño de 2026")}) fija las clases del 9 de septiembre de 2026 al 21 de junio de 2027 y no tiene el 11 de noviembre entre los días no lectivos; las fiestas locales de ${city} en 2026 son ${holidays} (${link(GAL_HOLIDAYS, "DOG del 30 de octubre de 2025")}).`;

function vigo(): Strike11nCity {
  const TSXG = "https://www.poderjudicial.es/cgpj/es/Poder-Judicial/Tribunales-Superiores-de-Justicia/TSJ-Galicia/Oficina-de-Comunicacion/Archivo-de-notas-de-prensa/Un-Juzgado-de-Vigo-considera-contrarios-al-ordenamiento-juridico-los-servicios-minimos-de-Vitrasa-decretados-por-el-Ayuntamiento-en-noviembre-de-2021";
  return {
    ...ref("vigo"),
    titleTransport: "Vitrasa",
    transportShort: "Vitrasa y autobuses interurbanos",
    authority: `la Xunta de Galicia, en dos órdenes publicadas en el ${link(DOG, "DOG")} el 9 y el 10 de noviembre, salvo los de Vitrasa, que fija el Concello de Vigo por decreto de Alcaldía`,
    authorityShort: "la Xunta de Galicia (DOG) y, para Vitrasa, el Concello de Vigo",
    bulletin: "el DOG",
    cercanias: null,
    airport: "Vigo",
    airNotes: airNotes("Vigo", 80, 57, 32),
    msSummary: GAL_SUMMARY,
    services: [
      pending("vitrasa", "transport", "Vitrasa (autobús urbano)", "Concello de Vigo", `Los fija el Concello de Vigo por decreto de Alcaldía, como en la huelga de Vitrasa de noviembre de 2021, según el ${link(TSXG, "Tribunal Superior de Xustiza de Galicia")}; el 10 de noviembre no habíamos encontrado ningún decreto para el 11N.`, `Los ${link("https://www.vitrasa.es/avisos", "avisos de Vitrasa")}`, { question: "¿Hay Vitrasa el 11 de noviembre?" }),
      ...GAL_SERVICES("En Vigo, un funcionario en la Oficina de Rexistro e Información por la mañana y otro por la tarde"),
    ],
    msNotes: GAL_MS_NOTES,
    railNotes: [],
    school: galSchool("Vigo", "el 28 de marzo y el 17 de agosto"),
    schoolShort: "Sí, es día lectivo",
    demos: [
      `**Por la mañana, CCOO y UGT:** manifestación conjunta a las 11.30 h, con salida de Vía Norte en el cruce con la rúa Urzaiz, hasta la Praza da Estrela, según el ${link(UGT_GAL, "cartel de movilizaciones de UGT Galicia")}.`,
      `**CIG:** a las 12.00 h en el «Cruzamento da Drobada», según la ${link(CIG_DEMOS, "CIG")}.`,
      `**Por la tarde:** «Manifestación Unitaria de Sindicatos e Colectivos Sociais» a las 18.00 h, de la Praza de España a la Praza de Compostela, según el ${link(UGT_GAL, "mismo cartel de UGT Galicia")}.`,
    ],
    demoShort: "CCOO y UGT, a las 11.30 h, de Vía Norte (cruce con Urzaiz) a la Praza da Estrela; CIG, a las 12.00 h, Cruzamento da Drobada; por la tarde, a las 18.00 h, de la Praza de España a la Praza de Compostela",
    demoWhere: `Atentos a ${link(UGT_GAL, "UGT Galicia")} y a la ${link(CIG_DEMOS, "CIG")}.`,
    callNotes: GAL_CALL,
    sources: [
      ...GAL_SOURCES,
      { name: "Un juzgado de Vigo considera contrarios al ordenamiento jurídico los servicios mínimos de Vitrasa decretados por el Ayuntamiento en noviembre de 2021", url: TSXG, publisher: "Tribunal Superior de Xustiza de Galicia" },
      { name: "Avisos", url: "https://www.vitrasa.es/avisos", publisher: "Vitrasa" },
    ],
  };
}

function coruna(): Strike11nCity {
  return {
    ...ref("coruna"),
    titleTransport: "autobuses",
    transportShort: "autobús urbano e interurbanos",
    authority: `la Xunta de Galicia, en dos órdenes publicadas en el ${link(DOG, "DOG")} el 9 y el 10 de noviembre; los del autobús urbano, por confirmar`,
    authorityShort: "la Xunta de Galicia (DOG)",
    bulletin: "el DOG",
    cercanias: null,
    airport: "A Coruña",
    airNotes: airNotes("A Coruña", 81, 57, 32),
    msSummary: GAL_SUMMARY,
    services: [
      pending("bus", "transport", "Autobús urbano (Compañía de Tranvías)", "Por confirmar", `No hemos encontrado quién los fija ni ningún decreto: ni el ${link("https://www.coruna.gal/web/es/actualidad", "Concello")} ni la ${link("https://tranviascoruna.com/noticias/", "Compañía de Tranvías")} los habían publicado el 10 de noviembre.`, `Las ${link("https://tranviascoruna.com/noticias/", "noticias de la Compañía de Tranvías")}`, { question: "¿Hay autobuses en A Coruña el 11 de noviembre?" }),
      ...GAL_SERVICES("En A Coruña, dos funcionarios por la mañana y uno por la tarde en la Oficina de Rexistro e Atención á Cidadanía del Edificio Administrativo"),
    ],
    msNotes: GAL_MS_NOTES,
    railNotes: [],
    school: galSchool("A Coruña", "el 17 de febrero (Martes de Entroido) y el 7 de octubre (festividad do Rosario)"),
    schoolShort: "Sí, es día lectivo",
    demos: [
      `**Por la mañana, CCOO y UGT:** manifestación conjunta a las 12.00 h, de la Praza de A Palloza a la Delegación do Goberno, según el ${link(UGT_GAL, "cartel de movilizaciones de UGT Galicia")}.`,
      `**CIG:** a las 12.00 h en la Praza de Vigo, según la ${link(CIG_DEMOS, "CIG")}.`,
      `**Por la tarde:** «Manifestación Unitaria de Sindicatos e Colectivos Sociais» a las 18.00 h, del cruce de la Ronda de Outeiro con la avenida de Fisterra a la Praza das Cigarreiras, según el ${link(UGT_GAL, "mismo cartel de UGT Galicia")}.`,
    ],
    demoShort: "CCOO y UGT, a las 12.00 h, de A Palloza a la Delegación do Goberno; CIG, a las 12.00 h, Praza de Vigo; por la tarde, a las 18.00 h, de Ronda de Outeiro a la Praza das Cigarreiras",
    demoWhere: `Atentos a ${link(UGT_GAL, "UGT Galicia")} y a la ${link(CIG_DEMOS, "CIG")}.`,
    callNotes: GAL_CALL,
    sources: [
      ...GAL_SOURCES,
      { name: "Actualidad", url: "https://www.coruna.gal/web/es/actualidad", publisher: "Concello da Coruña" },
      { name: "Noticias", url: "https://tranviascoruna.com/noticias/", publisher: "Compañía de Tranvías de La Coruña" },
    ],
  };
}

/* -------------------------------------------------------------------------- */
/* All                                                                        */
/* -------------------------------------------------------------------------- */

export const CITIES: Strike11nCity[] = [
  madrid(),
  valencia(),
  sevilla(),
  zaragoza(),
  malaga(),
  palma(),
  lasPalmas(),
  bilbao(),
  murcia(),
  alicante(),
  valladolid(),
  vigo(),
  coruna(),
];
