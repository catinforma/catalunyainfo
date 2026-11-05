import type { Region } from "@/lib/programmatic/holidays/boe-2027";
import { BOE_2027 } from "@/lib/programmatic/holidays/boe-2027";
import { NEXT_YEAR, SNAPSHOT, regionalDays } from "@/lib/programmatic/holidays/data";

/**
 * The official texts behind each community's 2027 page, read on the
 * bulletins themselves (`SOURCES_READ_ON`):
 *
 *  - `decree`: the community's own decree or order fixing its 2027 days,
 *    with the dates it lists, transcribed; a test holds them to the BOE
 *    column. "not-found" when it could not be read on an official page.
 *  - `local`: where the two local days of each municipality are published,
 *    and whether the 2027 list is out (the 2026 one as the precedent if not).
 *  - `boeNote`: the BOE's own footnote on that column, verbatim.
 *
 * Statuses move from November to January: `STATUS_RECHECK_BY` makes a test
 * fail until they are read again.
 */

export const SOURCES_READ_ON = "2026-11-06";
/** A test fails after this date until every `local` status is read again. */
export const STATUS_RECHECK_BY = "2026-11-27";

export interface OfficialText {
  title: string;
  /** "BOCM núm. 123, de 4.6.2026". */
  ref: string;
  /** Publication date, ISO. */
  date: string;
  url: string;
}

export type DecreeCheck =
  | {
      status: "published";
      text: OfficialText;
      /** The 2027 dates the decree fixes, as it lists them. */
      dates: string[];
      /**
       * "all": the decree lists the whole year (the test holds it to the BOE
       * column day by day); "own": it only fixes the community's own day(s)
       * and leaves the national ones to the State (every date must be in the
       * BOE column).
       */
      covers: "all" | "own";
      /** Days the decree says it moved from a Sunday (the BOE row does not always say so). */
      moves: { date: string; replaces: string }[];
      /** Short verbatim passages worth quoting (moved days, territorial days). */
      quotes: string[];
      /** Null when the decree and the BOE agree day by day; otherwise the difference, in words. */
      differences: string | null;
    }
  | {
      status: "not-found";
      /** What the page says instead. */
      note: string;
      where: { name: string; url: string };
    };

export interface LocalStatus {
  /** "Boletín Oficial de la Comunidad de Madrid (BOCM)": the link text. */
  bulletinName: string;
  /** "el BOCM": for "se publican en …". */
  bulletinShort: string;
  bulletinUrl: string;
  /** One sentence: who fixes them and in what text. */
  how: string;
  status: "published" | "pending" | "partial";
  y2027: OfficialText | null;
  /** The 2026 list: the precedent for when the 2027 one should appear. */
  y2026: OfficialText | null;
  dataset: { name: string; url: string } | null;
  note: string | null;
  /**
   * Local days that apply to the whole territory, from the published text:
   * both of them in Ceuta and Melilla (one municipality each, `daysScope`
   * "all"), the one Navarra shares (3 December, "common").
   */
  days?: { date: string; name: string }[];
  daysScope?: "all" | "common";
  /** Where the list is split by province: each bulletin's text. */
  parts?: { place: string; text: OfficialText }[];
}

export interface SubRegional {
  /** "fiesta insular": for sentences. */
  unit: string;
  /** "insular": for the title, where every character counts. */
  short: string;
  title: string;
  faq: string;
  items: { place: string; date: string; name: string }[];
}

export interface CommunitySources {
  decree: DecreeCheck;
  local: LocalStatus;
  /** The BOE's footnote on this column, verbatim. */
  boeNote: string | null;
  subRegional: SubRegional | null;
  /** One sentence on what the community's text does with a day that falls on a Sunday, when the BOE row does not say it. */
  decreeNote?: string;
  extraSources?: OfficialText[];
}

/** BOE-A-2026-21254: the one text every page is built from. */
export const BOE_REF = {
  id: "BOE-A-2026-21254",
  title: BOE_2027.name,
  ref: "BOE núm. 254, de 13.10.2026, págs. 136413 a 136417, BOE-A-2026-21254",
  date: "2026-10-13",
  url: BOE_2027.url,
  pdf: "https://www.boe.es/boe/dias/2026/10/13/pdfs/BOE-A-2026-21254.pdf",
} as const;

/* -------------------------------------------------------------------------- */
/* Catalonia: from the holiday engine's own sources                           */
/* -------------------------------------------------------------------------- */

const CT_LOCAL_2026 = SNAPSHOT.sources.localOrder;
const CT_REGIONAL_2027 = SNAPSHOT.sources.regional["2027"]!;

const CATALONIA: CommunitySources = {
  decree: {
    status: "published",
    text: {
      // The BOE's own Spanish citation of the order (note 2 of its table).
      title: "Orden EMT/52/2026, de 25 de marzo, por la que se establece el calendario oficial de fiestas laborales en Cataluña para el año 2027",
      ref: CT_REGIONAL_2027.ref,
      date: "2026-04-01",
      url: CT_REGIONAL_2027.url,
    },
    dates: regionalDays(2027).map((d) => d.date),
    covers: "all",
    moves: [],
    quotes: [],
    differences: null,
  },
  local: {
    bulletinName: "Diari Oficial de la Generalitat de Catalunya (DOGC)",
    bulletinShort: "el DOGC",
    bulletinUrl: "https://dogc.gencat.cat/es/",
    how: "En Cataluña los fija una sola orden del Departamento de Empresa y Trabajo para los 947 municipios, que se publica en el",
    status: NEXT_YEAR.order ? "published" : "pending",
    y2027: NEXT_YEAR.order ? { title: NEXT_YEAR.order.name, ref: NEXT_YEAR.order.ref, date: NEXT_YEAR.readOn ?? SOURCES_READ_ON, url: NEXT_YEAR.order.url } : null,
    y2026: { title: CT_LOCAL_2026.name, ref: CT_LOCAL_2026.ref, date: "2025-12-17", url: CT_LOCAL_2026.url },
    dataset: { name: "Calendari de festes locals a Catalunya (Transparència Catalunya)", url: SNAPSHOT.sources.localOpenData.url },
    note: "Mientras no sale la orden, los días que ya han aprobado los ayuntamientos están en la página de cada municipio.",
  },
  boeNote:
    "En la Comunidad Autónoma de Cataluña, la Orden EMT/52/2026, de 25 de marzo, por la que se establece el calendario oficial de fiestas laborales en Cataluña para el año 2027 (DOGC de 1 de abril de 2026) dispone que: «En el territorio de Arán, la fiesta del día 29 de marzo (Pasqua Florida) queda sustituida por la de 17 de junio (Fiesta de Arán), jueves».",
  subRegional: null,
};

/* -------------------------------------------------------------------------- */
/* The other communities and the two cities (read 5-6 Nov 2026)               */
/* -------------------------------------------------------------------------- */

/** The nine dates every column shares, for the decrees that list the whole year. */
const COMMON = ["2027-01-01", "2027-01-06", "2027-03-26", "2027-05-01", "2027-10-12", "2027-11-01", "2027-12-06", "2027-12-08", "2027-12-25"];
const year = (...extra: string[]) => [...COMMON, ...extra].sort();

const ANDALUCIA: CommunitySources = {
  decree: {
    status: "published",
    text: {
      title: "Decreto 84/2026, de 29 de abril, por el que se determina el calendario de fiestas laborales de la Comunidad Autónoma de Andalucía para el año 2027",
      ref: "BOJA núm. 84, de 5.5.2026",
      date: "2026-05-05",
      url: "https://www.juntadeandalucia.es/boja/2026/84/1",
    },
    dates: year("2027-03-01", "2027-03-25", "2027-08-16"),
    covers: "all",
    moves: [{ date: "2027-03-01", replaces: "2027-02-28" }],
    quotes: [
      "para el año 2027, las fiestas correspondientes a los días 28 de febrero, día de Andalucía, y 15 de agosto, Asunción de la Virgen, por coincidir ambas con domingo, se trasladan al lunes inmediato posterior, es decir, a los días 1 de marzo y 16 de agosto, respectivamente.",
    ],
    differences: null,
  },
  local: {
    bulletinName: "Boletín Oficial de la Junta de Andalucía (BOJA)",
    bulletinShort: "el BOJA",
    bulletinUrl: "https://www.juntadeandalucia.es/boja",
    how: "En Andalucía los publica una resolución de la Dirección General de Trabajo, Seguridad y Salud Laboral para todos los municipios, en el",
    status: "published",
    y2027: {
      title:
        "Resolución de 23 de octubre de 2026, de la Dirección General de Trabajo, Seguridad y Salud Laboral, por la que se publica la relación de fiestas locales de los municipios de la Comunidad Autónoma de Andalucía para el año 2027",
      ref: "BOJA núm. 210, de 29.10.2026",
      date: "2026-10-29",
      url: "https://www.juntadeandalucia.es/boja/2026/210/25",
    },
    y2026: null,
    dataset: {
      name: "Calendario de días inhábiles en la Comunidad Autónoma de Andalucía (datos abiertos de la Junta)",
      url: "https://www.juntadeandalucia.es/datosabiertos/portal/dataset/calendario-de-dias-inhabiles-en-la-comunidad-autonoma-de-andalucia",
    },
    note: "La resolución recoge las fiestas que los ayuntamientos habían comunicado hasta esa fecha; en años anteriores la Junta publicó correcciones meses después.",
  },
  boeNote: null,
  subRegional: null,
};

const ARAGON: CommunitySources = {
  decree: {
    status: "published",
    text: {
      title:
        "Decreto 163/2026, de 9 de septiembre, del Gobierno de Aragón, por el que se fijan las fiestas laborales retribuidas, no recuperables e inhábiles para el año 2027 en la Comunidad Autónoma de Aragón",
      ref: "BOA núm. 180, de 16.9.2026",
      date: "2026-09-16",
      url: "https://www.boa.aragon.es/cgi-bin/EBOA/BRSCGI?CMD=VEROBJ&MLKOB=1466225130707",
    },
    dates: year("2027-03-25", "2027-04-23", "2027-08-16"),
    covers: "all",
    moves: [],
    quotes: ["16 de agosto, lunes, en sustitución del día 15, domingo, Asunción de la Virgen."],
    differences: null,
  },
  local: {
    bulletinName: "Boletín Oficial de Aragón (BOA)",
    bulletinShort: "el BOA",
    bulletinUrl: "https://www.boa.aragon.es/",
    how: "En Aragón los fija una resolución del Director General de Trabajo para los municipios de Huesca, Teruel y Zaragoza, en el",
    status: "pending",
    y2027: null,
    y2026: {
      title:
        "Resolución de 4 de noviembre de 2025, del Director General de Trabajo, por la que se determinan las fiestas laborales, de carácter retribuido, no recuperables e inhábiles, para el año 2026, en los municipios de las provincias de Huesca, Teruel y Zaragoza",
      ref: "BOA núm. 225, de 20.11.2025",
      date: "2025-11-20",
      url: "https://www.boa.aragon.es/cgi-bin/EBOA/BRSCGI?CMD=VEROBJ&MLKOB=1421874360606",
    },
    dataset: null,
    note: "Los ayuntamientos tenían hasta el 15 de octubre de 2026 para proponer sus días (Decreto 163/2026). En 2026 hubo además una resolución complementaria para los municipios que llegaron tarde (BOA núm. 56, de 23.3.2026).",
  },
  boeNote: null,
  subRegional: null,
};

const ASTURIAS: CommunitySources = {
  decree: {
    status: "published",
    text: {
      title: "Decreto 7/2026, de 16 de febrero, por el que se sustituye para el año 2027 una de las fiestas de ámbito nacional por el día 8 de septiembre, Día de Asturias",
      ref: "BOPA núm. 39, de 26.2.2026",
      date: "2026-02-26",
      url: "https://miprincipado.asturias.es/bopa/2026/02/26/2026-01506.pdf",
    },
    dates: ["2027-09-08"],
    covers: "own",
    moves: [],
    quotes: [
      "Se sustituye para el año 2027 la fiesta de ámbito nacional que resultaría de ejercitar, en su caso, la opción entre el 19 de marzo, san josé, y el 25 de julio, santiago apóstol, por el 8 de septiembre, día de asturias, con el carácter de retribuida y no recuperable.",
    ],
    differences: null,
  },
  local: {
    bulletinName: "Boletín Oficial del Principado de Asturias (BOPA)",
    bulletinShort: "el BOPA",
    bulletinUrl: "https://miprincipado.asturias.es/bopa",
    how: "En Asturias los aprueba una resolución de la Consejería de Ciencia, Industria y Empleo para todos los concejos, en el",
    status: "published",
    y2027: {
      title:
        "Resolución de 22 de mayo de 2026, de la Consejería de Ciencia, Industria y Empleo, por la que se aprueba el calendario de fiestas locales para el año 2027 en la Comunidad Autónoma del Principado de Asturias",
      ref: "BOPA núm. 110, de 10.6.2026",
      date: "2026-06-10",
      url: "https://miprincipado.asturias.es/bopa/2026/06/10/2026-04656.pdf",
    },
    y2026: null,
    dataset: null,
    note: "Algunos concejos tienen días distintos por parroquias o zonas, como indica la propia resolución.",
  },
  boeNote: null,
  subRegional: null,
};

const BALEARES: CommunitySources = {
  decree: {
    status: "published",
    text: {
      title: "Acuerdo del Consejo de Gobierno de 13 de marzo de 2026 por el que se aprueba el calendario de fiestas para el año 2027 en el ámbito de las Illes Balears",
      ref: "BOIB núm. 33, de 14.3.2026",
      date: "2026-03-14",
      url: "https://www.caib.es/eboibfront/pdf/es/2026/33/1215084",
    },
    dates: year("2027-03-01", "2027-03-25", "2027-03-29"),
    covers: "all",
    moves: [],
    quotes: [
      "29 de marzo (Lunes de Pascua) Lunes En sustitución del lunes inmediato al 15 de agosto",
      "1 de marzo (Día de las Illes Balears) Lunes En sustitución de la opción entre San José y San Jaime",
    ],
    differences: null,
  },
  local: {
    bulletinName: "Butlletí Oficial de les Illes Balears (BOIB)",
    bulletinShort: "el BOIB",
    bulletinUrl: "https://www.caib.es/eboibfront/",
    how: "En las Illes Balears los hace públicos una resolución de la Conselleria de Trabajo, Función Pública y Diálogo Social, junto con el calendario general, en el",
    status: "published",
    y2027: {
      title:
        "Resolución de la consejera de Trabajo, Función Pública y Diálogo Social por la que se hace público el calendario laboral general y local para el año 2027 en el ámbito de las Illes Balears",
      ref: "BOIB núm. 122, de 29.9.2026",
      date: "2026-09-29",
      url: "https://www.caib.es/eboibfront/pdf/es/2026/122/1229310",
    },
    y2026: null,
    dataset: null,
    note: "La lista va por islas (Mallorca, Menorca, Eivissa y Formentera), con días distintos en algunos núcleos de un mismo municipio.",
  },
  boeNote: null,
  subRegional: null,
};

const CANARIAS: CommunitySources = {
  decree: {
    status: "published",
    text: {
      title: "Decreto 115/2026, de 29 de junio, por el que se determina el calendario de fiestas laborales de la Comunidad Autónoma de Canarias para el año 2027",
      ref: "BOC núm. 133, de 3.7.2026",
      date: "2026-07-03",
      url: "https://www.gobiernodecanarias.org/boc/2026/133/2334.html",
    },
    dates: year("2027-03-25", "2027-08-16"),
    covers: "all",
    moves: [],
    quotes: ["previendo descanso laboral para el día 16 de agosto, por coincidir en domingo la festividad de la Asunción de la Virgen"],
    differences: null,
  },
  local: {
    bulletinName: "Boletín Oficial de Canarias (BOC)",
    bulletinShort: "el BOC",
    bulletinUrl: "https://www.gobiernodecanarias.org/boc/",
    how: "En Canarias los fija una orden de la Consejería de Turismo y Empleo para los 88 municipios, en el",
    status: "published",
    y2027: {
      title: "Orden de 7 de agosto de 2026, por la que se determinan las fiestas locales propias de cada municipio de la Comunidad Autónoma de Canarias para el año 2027",
      ref: "BOC núm. 168, de 21.8.2026",
      date: "2026-08-21",
      url: "https://www.gobiernodecanarias.org/boc/2026/168/3035.html",
    },
    y2026: null,
    dataset: null,
    note: "Además de las 2 fiestas locales, cada isla tiene su fiesta insular. El Día de Canarias, 30 de mayo, cae en domingo en 2027 y el decreto no lo incluye.",
  },
  boeNote:
    "En la Comunidad Autónoma de Canarias, el Decreto 115/2026, de 29 de junio, por el que se determina el calendario de fiestas laborales de la Comunidad Autónoma de Canarias para el año 2027 (BOC de 3 de julio de 2026) dispone que: «En las islas de El Hierro, Fuerteventura, Gran Canaria, La Gomera, La Palma, Lanzarote y La Graciosa, y Tenerife, las fiestas laborales serán, además, las siguientes: …»",
  subRegional: {
    unit: "fiesta insular",
    short: "insular",
    title: "La fiesta de cada isla en 2027",
    faq: "Cada isla añade su fiesta insular, que fija el mismo decreto (por ejemplo, Tenerife el 2 de febrero y Gran Canaria el 8 de septiembre).",
    items: [
      { place: "El Hierro", date: "2027-09-24", name: "Nuestra Señora de los Reyes" },
      { place: "Fuerteventura", date: "2027-09-17", name: "Nuestra Señora de la Peña" },
      { place: "Gran Canaria", date: "2027-09-08", name: "Nuestra Señora del Pino" },
      { place: "La Gomera", date: "2027-10-04", name: "Nuestra Señora de Guadalupe" },
      { place: "La Palma", date: "2027-08-05", name: "Nuestra Señora de Las Nieves" },
      { place: "Lanzarote y La Graciosa", date: "2027-09-15", name: "Nuestra Señora de los Volcanes" },
      { place: "Tenerife", date: "2027-02-02", name: "Virgen de la Candelaria" },
    ],
  },
};

const VALENCIANA: CommunitySources = {
  decree: {
    status: "published",
    text: {
      title: "Decreto 42/2026, de 20 de marzo, del Consell, por el que se determina el calendario laboral de aplicación en el ámbito territorial de la Comunitat Valenciana para el año 2027",
      ref: "DOGV núm. 10329, de 25.3.2026",
      date: "2026-03-25",
      url: "https://dogv.gva.es/datos/2026/03/25/pdf/2026_8641_es.pdf",
    },
    dates: year("2027-03-19", "2027-03-29", "2027-10-09"),
    covers: "all",
    moves: [],
    quotes: ["Este calendario se completará por las corporaciones locales de la Comunitat Valenciana, a las que corresponde determinar dos fiestas de carácter local."],
    differences: null,
  },
  local: {
    bulletinName: "Diari Oficial de la Generalitat Valenciana (DOGV)",
    bulletinShort: "el DOGV",
    bulletinUrl: "https://dogv.gva.es/es/",
    how: "En la Comunitat Valenciana los aprueba una resolución de la Conselleria competente en trabajo, con los 2 días de cada uno de los 542 municipios, en el",
    status: "pending",
    y2027: null,
    y2026: {
      title: "Resolución de 12 de noviembre de 2025, por la que se aprueba el calendario de fiestas locales, retribuidas y no recuperables, en el ámbito de la Comunitat Valenciana para el año 2026",
      ref: "DOGV núm. 10238, de 14.11.2025",
      date: "2025-11-14",
      url: "https://dogv.gva.es/datos/2025/11/14/pdf/2025_46326_es.pdf",
    },
    dataset: null,
    note: "La lista de 2025 salió el 18 de noviembre de 2024 y la de 2026 el 14 de noviembre de 2025; después se corrigió dos veces (DOGV de 15.1.2026 y 3.3.2026). Algunos ayuntamientos publican antes su acuerdo en el DOGV, pero la lista que vale es la resolución.",
  },
  boeNote: null,
  subRegional: null,
};

const CEUTA: CommunitySources = {
  decree: {
    status: "not-found",
    note:
      "No hemos encontrado en el Boletín Oficial de la Ciudad de Ceuta el decreto de la Presidencia con el calendario de 2027 (el de 2026 solo aparece citado en el BOCCE núm. 6.551, de 26.9.2025). Los días de la ciudad son, por tanto, los que publica el BOE.",
    where: { name: "Boletín Oficial de la Ciudad de Ceuta (BOCCE)", url: "https://www.ceuta.es/ceuta/bocce" },
  },
  local: {
    bulletinName: "Boletín Oficial de la Ciudad de Ceuta (BOCCE)",
    bulletinShort: "el BOCCE",
    bulletinUrl: "https://www.ceuta.es/ceuta/bocce",
    how: "Ceuta es un solo municipio: el Pleno de la Asamblea propone sus 2 fiestas locales y la Delegación del Gobierno las publica en el",
    status: "published",
    y2027: {
      title: "Resolución de 28 de octubre de 2026, de la Delegación del Gobierno en Ceuta, por la que se publica la relación de fiestas locales de la Ciudad Autónoma de Ceuta para el año 2027",
      ref: "BOCCE núm. 6.666, de 3.11.2026",
      date: "2026-11-03",
      url: "https://www.ceuta.es/ceuta/component/jdownloads/finish/1983-noviembre/23314-bocce-6666-03-11-2026?Itemid=534",
    },
    y2026: null,
    dataset: null,
    note: null,
    days: [
      { date: "2027-03-10", name: "Fiesta de Culminación de Ramadán Eid al-Fitr" },
      { date: "2027-09-02", name: "Día de Ceuta" },
    ],
    daysScope: "all",
  },
  boeNote: null,
  subRegional: null,
};

const MELILLA_AGREEMENT: OfficialText = {
  title: "Acuerdo del Consejo de Gobierno, de fecha 24 de septiembre de 2026, relativo aprobación del Calendario Laboral para el año 2027",
  ref: "BOME Extraordinario núm. 43, de 30.9.2026",
  date: "2026-09-30",
  url: "https://bomemelilla.es/bome/BOME-BX-2026-43/articulo/108",
};

const MELILLA: CommunitySources = {
  decree: {
    status: "published",
    text: MELILLA_AGREEMENT,
    // The agreement lists 14 days: these 12 and the two local ones (`local.days`).
    dates: year("2027-03-10", "2027-03-25", "2027-05-17"),
    covers: "all",
    moves: [],
    quotes: ["el día 17 de mayo (Fiesta del Sacrificio Aid Al Adha) sustituye al 19 de marzo, día de San José."],
    differences: null,
  },
  local: {
    bulletinName: "Boletín Oficial de la Ciudad de Melilla (BOME)",
    bulletinShort: "el BOME",
    bulletinUrl: "https://bomemelilla.es/",
    how: "Melilla es un solo municipio: el Consejo de Gobierno fija sus 2 fiestas locales en el mismo acuerdo del calendario laboral, publicado en el",
    status: "published",
    y2027: MELILLA_AGREEMENT,
    y2026: null,
    dataset: null,
    note: null,
    days: [
      { date: "2027-09-08", name: "Día de Ntra. Sra. Virgen de la Victoria" },
      { date: "2027-09-17", name: "Día de Melilla" },
    ],
    daysScope: "all",
  },
  boeNote: null,
  subRegional: null,
  decreeNote: "El mismo acuerdo fija también las 2 fiestas locales de la ciudad (8 y 17 de septiembre), que el BOE no recoge.",
};

const CANTABRIA: CommunitySources = {
  decree: {
    status: "published",
    text: {
      title: "Orden IND/29/2026, de 6 de julio, por la que se establece el calendario de fiestas laborales para el año 2027 en el ámbito de la Comunidad Autónoma de Cantabria",
      ref: "BOC núm. 135, de 15.7.2026",
      date: "2026-07-15",
      url: "https://boc.cantabria.es/boces/verAnuncioAction.do?idAnuBlob=438006",
    },
    dates: year("2027-03-25", "2027-07-28", "2027-09-15"),
    covers: "all",
    moves: [],
    quotes: [
      "el día 15 de septiembre, La Bien Aparecida, se fija en sustitución del descanso en lunes de la fiesta nacional 15 de agosto, Asunción de la Virgen, coincidente en domingo.",
    ],
    differences: null,
  },
  local: {
    bulletinName: "Boletín Oficial de Cantabria (BOC)",
    bulletinShort: "el BOC de Cantabria",
    bulletinUrl: "https://boc.cantabria.es/boces/",
    how: "En Cantabria los publica una resolución de la Dirección General de Trabajo, Economía Social y Empleo Autónomo junto con las fiestas nacionales y autonómicas, en el",
    status: "pending",
    y2027: null,
    y2026: {
      title: "Resolución por la que se dispone la publicación del calendario de fiestas nacionales, autonómicas y locales en el ámbito de la Comunidad Autónoma de Cantabria para el año 2026",
      ref: "BOC núm. 238, de 11.12.2025",
      date: "2025-12-11",
      url: "https://boc.cantabria.es/boces/verAnuncioAction.do?idAnuBlob=428192",
    },
    dataset: null,
    note: null,
  },
  boeNote: null,
  subRegional: null,
};

const CASTILLA_LA_MANCHA: CommunitySources = {
  decree: {
    status: "published",
    text: {
      title: "Decreto 34/2026, de 23 de junio, por el que se fija el calendario laboral para el año 2027 en la comunidad autónoma de Castilla-La Mancha",
      ref: "DOCM núm. 131, de 13.7.2026",
      date: "2026-07-13",
      url: "https://docm.jccm.es/docm/eli/es-cm/d/2026/06/23/34/dof/spa/html",
    },
    dates: year("2027-03-25", "2027-05-27", "2027-05-31"),
    covers: "all",
    moves: [],
    quotes: [
      "27 de mayo, celebración de la Fiesta del Corpus Christi, en sustitución de la fiesta correspondiente al día 19 de marzo, San José",
      "31 de mayo, Día de Castilla-La Mancha, en sustitución del descanso laboral correspondiente al día 15 de agosto, Asunción de la Virgen.",
    ],
    differences: null,
  },
  local: {
    bulletinName: "Diario Oficial de Castilla-La Mancha (DOCM)",
    bulletinShort: "el DOCM",
    bulletinUrl: "https://docm.jccm.es/",
    how: "En Castilla-La Mancha los da a conocer un anuncio de la Dirección General de Autónomos, Trabajo y Economía Social para todos los municipios, en el",
    status: "pending",
    y2027: null,
    y2026: {
      title:
        "Anuncio de 04/12/2025, de la Dirección General de Autónomos, Trabajo y Economía Social, por el que se da publicidad a la relación de las fiestas de carácter local, retribuidas y no recuperables para el año 2026, de los municipios de la comunidad autónoma de Castilla-La Mancha",
      ref: "DOCM núm. 240, de 12.12.2025",
      date: "2025-12-12",
      url: "https://docm.jccm.es/docm/verArchivoHtml.do?ruta=2025%2F12%2F12%2Fhtml%2F2025_9468.html&tipo=rutaDocm",
    },
    dataset: null,
    note: null,
  },
  boeNote: null,
  subRegional: null,
};

const JCYL_LIST = "https://trabajoyprevencion.jcyl.es/web/es/relaciones-laborales/calendario-laboral.html";

const CASTILLA_Y_LEON: CommunitySources = {
  decree: {
    status: "published",
    text: {
      title: "Decreto 7/2026, de 26 de marzo, por el que se establece el calendario de fiestas laborales en el ámbito de la Comunidad de Castilla y León para el año 2027",
      ref: "BOCYL núm. 61, de 30.3.2026",
      date: "2026-03-30",
      url: "https://bocyl.jcyl.es/html/2026/03/30/html/BOCYL-D-30032026-61-1.do",
    },
    dates: year("2027-03-25", "2027-04-23", "2027-08-16"),
    covers: "all",
    moves: [],
    quotes: ["15 de agosto, Asunción de la Virgen. Se traslada al lunes."],
    differences: null,
  },
  local: {
    bulletinName: "Calendario laboral de la Junta de Castilla y León (enlaza los 9 boletines provinciales)",
    bulletinShort: "los boletines oficiales de las 9 provincias",
    bulletinUrl: JCYL_LIST,
    how: "En Castilla y León los fija la Oficina Territorial de Trabajo de cada provincia y se publican en los 9 boletines provinciales; la Junta los reúne en su",
    status: "published",
    y2027: null,
    y2026: null,
    dataset: null,
    note: "Las listas de Palencia y Valladolid dejan como «no comunicado» los días de algunos municipios (43 y 35); pueden publicarse más tarde.",
    parts: [
      {
        place: "Ávila",
        text: {
          title: "Anuncio de la Oficina Territorial de Trabajo de Ávila: fiestas locales 2027",
          ref: "BOP de Ávila núm. 129, de 8.7.2026",
          date: "2026-07-08",
          url: "https://www.diputacionavila.es/bops/2026/08-07-2026/08-07-2026_144826.pdf",
        },
      },
      {
        place: "Burgos",
        text: {
          title: "Resolución de la Oficina Territorial de Trabajo de Burgos sobre calendario de fiestas locales, retribuidas y no recuperables, para el año 2027",
          ref: "BOP de Burgos núm. 145, de 4.8.2026",
          date: "2026-08-04",
          url: "https://trabajoyprevencion.jcyl.es/web/jcyl/binarios/532/765/Publicacion%20Fiestas%20Locales%20-%20bopbur-2026-145.pdf?blobheader=application%2Fpdf%3Bcharset%3DUTF-8&blobnocache=true",
        },
      },
      {
        place: "León",
        text: {
          title: "Resolución de 20 de julio de 2026, por la que se fijan las Fiestas Locales de los distintos Municipios de la Provincia de León, para el año 2027",
          ref: "BOP de León núm. 144, de 31.7.2026",
          date: "2026-07-31",
          url: "https://trabajoyprevencion.jcyl.es/web/jcyl/binarios/388/708/RESOLUCION%20Y%20LISTADO%20-%20BOP%20144-%20de%2031-07-2026.pdf?blobheader=application%2Fpdf%3Bcharset%3DUTF-8&blobnocache=true",
        },
      },
      {
        place: "Palencia",
        text: {
          title: "Acuerdo de determinación de las Fiestas Locales, a efectos laborales, en los municipios de la provincia de Palencia",
          ref: "BOP de Palencia núm. 83, de 13.7.2026",
          date: "2026-07-13",
          url: "https://trabajoyprevencion.jcyl.es/web/jcyl/binarios/124/555/PUBLICACION%20BOP%20FIESTAS%20LOCALES%202027%2013-7-2026.pdf?blobheader=application%2Fpdf%3Bcharset%3DUTF-8&blobnocache=true",
        },
      },
      {
        place: "Salamanca",
        text: {
          title: "Acuerdo de 1 de julio de 2026, de la Oficina Territorial de Trabajo de Salamanca para la determinación de las fiestas locales, a efectos laborales, en los municipios de esta provincia para el año 2027",
          ref: "BOP de Salamanca núm. 129, de 8.7.2026",
          date: "2026-07-08",
          url: "https://trabajoyprevencion.jcyl.es/web/jcyl/binarios/686/528/BOP-SA-20260708-001.pdf?blobheader=application%2Fpdf%3Bcharset%3DUTF-8&blobnocache=true",
        },
      },
      {
        place: "Segovia",
        text: {
          title: "Fiestas locales 2027 (Oficina Territorial de Trabajo de Segovia)",
          ref: "BOP de Segovia núm. 80, de 6.7.2026",
          date: "2026-07-06",
          url: "https://trabajoyprevencion.jcyl.es/web/jcyl/binarios/629/351/BOP%20Fiestas%20locales.pdf?blobheader=application%2Fpdf%3Bcharset%3DUTF-8&blobnocache=true",
        },
      },
      {
        place: "Soria",
        text: {
          title: "Fiestas laborales año 2027 (Oficina Territorial de Trabajo de Soria)",
          ref: "BOP de Soria núm. 81, de 15.7.2026",
          date: "2026-07-15",
          url: "https://trabajoyprevencion.jcyl.es/web/jcyl/binarios/704/771/BOP%20n.%C2%BA%2081.pdf?blobheader=application%2Fpdf%3Bcharset%3DUTF-8&blobnocache=true",
        },
      },
      {
        place: "Valladolid",
        text: {
          title: "Resolución de 6 de julio de 2026, de la Oficina Territorial de Trabajo de Valladolid, para la determinación de las fiestas locales, a efectos laborales, en los municipios de la provincia de Valladolid para el año 2027",
          ref: "BOP de Valladolid núm. 129, de 9.7.2026",
          date: "2026-07-09",
          url: "https://trabajoyprevencion.jcyl.es/web/jcyl/binarios/569/674/Fiestas%20BOPVA-A-2026-02051.pdf?blobheader=application%2Fpdf%3Bcharset%3DUTF-8&blobnocache=true",
        },
      },
      {
        place: "Zamora",
        text: {
          title: "Calendario de fiestas locales para el año 2027 (Oficina Territorial de Trabajo de Zamora), corrección de errores con publicación íntegra",
          ref: "BOP de Zamora núm. 88, de 31.7.2026",
          date: "2026-07-31",
          url: "https://trabajoyprevencion.jcyl.es/web/jcyl/binarios/329/517/PUBLICACI%C3%93N%20CALENDARIO%20LABORAL%20EN%20BOP%202027%20CORREGIDO%20(31-07-2026).pdf?blobheader=application%2Fpdf%3Bcharset%3DUTF-8&blobnocache=true",
        },
      },
    ],
  },
  boeNote: null,
  subRegional: null,
};

const EXTREMADURA: CommunitySources = {
  decree: {
    status: "published",
    text: {
      title: "Decreto 119/2026, de 2 de junio, por el que se fija el calendario de días festivos de la Comunidad Autónoma de Extremadura para el año 2027",
      ref: "DOE núm. 108, de 8.6.2026",
      date: "2026-06-08",
      url: "https://doe.juntaex.es/otrosFormatos/html.php?xml=2026040142&anio=2026&doe=1080o",
    },
    // Art. 1 lists 15 August; art. 2 moves its day off to 11 October: the dates people get off.
    dates: year("2027-03-25", "2027-09-08", "2027-10-11"),
    covers: "all",
    moves: [],
    quotes: ["el descanso laboral correspondientes al día 15 de agosto de 2027, Asunción de la Virgen, se disfrutará el lunes 11 de octubre de 2027."],
    differences: null,
  },
  local: {
    bulletinName: "Diario Oficial de Extremadura (DOE)",
    bulletinShort: "el DOE",
    bulletinUrl: "https://doe.juntaex.es/",
    how: "En Extremadura los hace públicos una resolución de la Dirección General de Trabajo para todos los municipios, en el",
    status: "published",
    y2027: {
      title: "Resolución de 15 de octubre de 2026, de la Dirección General de Trabajo, por la que se hace público el calendario laboral oficial de fiestas locales para la Comunidad Autónoma de Extremadura durante el año 2027",
      ref: "DOE núm. 207, de 27.10.2026",
      date: "2026-10-27",
      url: "https://doe.juntaex.es/otrosFormatos/html.php?xml=2026062650&anio=2026&doe=2070o",
    },
    y2026: null,
    dataset: null,
    note: "La lista incluye también entidades locales menores y poblados con días propios.",
  },
  boeNote: null,
  subRegional: null,
};

const GALICIA: CommunitySources = {
  decree: {
    status: "published",
    text: {
      title: "Decreto 68/2026, de 15 de junio, por el que se determinan las fiestas de la Comunidad Autónoma de Galicia del calendario laboral para el año 2027",
      ref: "DOG núm. 122, de 2.7.2026",
      date: "2026-07-02",
      url: "https://www.xunta.gal/dog/Publicados/2026/20260702/AnuncioG0767-250626-0001_es.html",
    },
    dates: year("2027-03-19", "2027-03-25", "2027-05-17"),
    covers: "all",
    moves: [],
    quotes: [
      "se opta por el 19 de marzo, fiesta de San José, por coincidir en domingo el día 25 de julio, Día Nacional de Galicia. Por coincidir en domingo el día 15 de agosto, día de Asunción de la Virgen, se substituye por el día 17 de mayo, Día de las Letras Gallegas.",
    ],
    differences: null,
  },
  local: {
    bulletinName: "Diario Oficial de Galicia (DOG)",
    bulletinShort: "el DOG",
    bulletinUrl: "https://www.xunta.gal/diario-oficial-galicia",
    how: "En Galicia los reúne una resolución de la Secretaría General de Empleo y Relaciones Laborales con los 313 ayuntamientos de las cuatro provincias, en el",
    status: "published",
    y2027: {
      title:
        "Resolución de 15 de octubre de 2026, de la Secretaría General de Empleo y Relaciones Laborales, por la que se da publicidad a las fiestas laborales de carácter local para el año 2027, correspondientes a los ayuntamientos de las cuatro provincias de la Comunidad Autónoma de Galicia",
      ref: "DOG núm. 204, de 26.10.2026",
      date: "2026-10-26",
      url: "https://www.xunta.gal/dog/Publicados/2026/20261026/AnuncioG0767-161026-0001_es.html",
    },
    y2026: null,
    dataset: { name: "Calendario laboral 2027 (datos abiertos de la Xunta de Galicia)", url: "https://abertos.xunta.gal/catalogo/economia-empresa-emprego/-/dataset/0699/calendario-laboral-2027" },
    note: null,
  },
  boeNote: null,
  subRegional: null,
};

const MADRID: CommunitySources = {
  decree: {
    status: "published",
    text: {
      title: "Decreto 82/2026, de 30 de septiembre, del Consejo de Gobierno, por el que se establecen las fiestas laborales para el año 2027 en la Comunidad de Madrid",
      ref: "BOCM núm. 234, de 1.10.2026",
      date: "2026-10-01",
      url: "https://www.bocm.es/bocm-20261001-19",
    },
    dates: year("2027-03-19", "2027-03-25", "2027-08-16"),
    covers: "all",
    moves: [],
    quotes: ["16 de agosto (lunes), traslado de la Asunción de la Virgen."],
    differences: null,
  },
  local: {
    bulletinName: "Boletín Oficial de la Comunidad de Madrid (BOCM)",
    bulletinShort: "el BOCM",
    bulletinUrl: "https://www.bocm.es/",
    how: "En la Comunidad de Madrid los declara una resolución de la Dirección General de Trabajo para todos los municipios, en el",
    status: "pending",
    y2027: null,
    y2026: {
      title: "Resolución de 2 de diciembre de 2025, de la Dirección General de Trabajo, por la que se declaran las fiestas laborales de ámbito local en la Comunidad de Madrid para el año 2026",
      ref: "BOCM núm. 296, de 12.12.2025",
      date: "2025-12-12",
      url: "https://www.bocm.es/bocm-20251212-34",
    },
    dataset: null,
    note: "La lista de 2026 se corrigió después con otra resolución (BOCM núm. 6, de 8.1.2026).",
  },
  boeNote: null,
  subRegional: null,
  decreeNote: "El 2 de mayo, Día de la Comunidad de Madrid, cae en domingo en 2027: el decreto no lo incluye entre los festivos ni lo traslada al lunes.",
};

const MURCIA_CALENDAR: OfficialText = {
  title: "Resolución de la Dirección General de Trabajo por la que se publica el calendario de fiestas laborales para el año 2027",
  ref: "BORM núm. 171, de 27.7.2026",
  date: "2026-07-27",
  url: "https://www.borm.es/services/anuncio/ano/2026/numero/3718/pdf?id=844400",
};

const MURCIA: CommunitySources = {
  decree: {
    status: "published",
    text: MURCIA_CALENDAR,
    dates: year("2027-03-19", "2027-03-25", "2027-06-09"),
    covers: "all",
    moves: [],
    quotes: [
      "el miércoles día 9 de junio, Día de la Región de Murcia, en sustitución del día 15 de agosto, domingo que pasaría al lunes siguiente (Asunción de la Virgen)",
    ],
    differences: null,
  },
  local: {
    bulletinName: "Boletín Oficial de la Región de Murcia (BORM)",
    bulletinShort: "el BORM",
    bulletinUrl: "https://www.borm.es/",
    how: "En la Región de Murcia la misma resolución de la Dirección General de Trabajo que publica el calendario regional fija los 2 días de cada uno de los 45 municipios, en el",
    status: "published",
    y2027: MURCIA_CALENDAR,
    y2026: null,
    dataset: null,
    note: "La resolución publica el acuerdo del Consejo de Gobierno de 9 de abril de 2026 con los días regionales.",
  },
  boeNote: null,
  subRegional: null,
};

const NAVARRA: CommunitySources = {
  decree: {
    status: "published",
    text: {
      title:
        "Resolución 232/2026, de 13 de mayo, del director general de Economía Social y Trabajo por la que se establece el calendario oficial de fiestas laborales para el año 2027 con carácter retribuido y no recuperable en el ámbito de la Comunidad Foral de Navarra",
      ref: "BON núm. 103, de 28.5.2026",
      date: "2026-05-28",
      url: "https://bon.navarra.es/es/anuncio/-/texto/2026/103/23",
    },
    // The resolution also lists 3 December, which is a local day (see `local.days`): the BOE rightly leaves it out.
    dates: year("2027-03-19", "2027-03-25", "2027-03-29"),
    covers: "all",
    moves: [],
    quotes: [
      "En la relación anterior está incluida, en los términos del artículo 46 del mentado Real Decreto, la fiesta local para todo el ámbito de la Comunidad Foral de Navarra, el día 3 de diciembre, festividad de San Francisco Javier, día de Navarra.",
    ],
    differences: null,
  },
  local: {
    bulletinName: "Boletín Oficial de Navarra (BON)",
    bulletinShort: "el BON",
    bulletinUrl: "https://bon.navarra.es/",
    how: "En Navarra uno de los 2 días locales es común a toda la comunidad; el otro lo propone cada ayuntamiento y lo publica una resolución de la Dirección General de Economía Social y Trabajo, en el",
    status: "pending",
    y2027: null,
    y2026: {
      title:
        "Resolución 682/2025, de 17 de noviembre, del director general de Economía Social y Trabajo por la que se determinan las fiestas locales para el año 2026, con carácter retribuido y no recuperable, en el ámbito de la Comunidad Foral de Navarra",
      ref: "BON núm. 241, de 2.12.2025",
      date: "2025-12-02",
      url: "https://bon.navarra.es/es/anuncio/-/texto/2025/241/12",
    },
    dataset: null,
    note: "Los ayuntamientos tienen hasta el 15 de noviembre de 2026 para proponer su día (Resolución 232/2026).",
    days: [{ date: "2027-12-03", name: "San Francisco Javier, Día de Navarra" }],
    daysScope: "common",
  },
  boeNote: null,
  subRegional: null,
  decreeNote: "La resolución añade el 3 de diciembre, San Francisco Javier, como fiesta local en toda Navarra: por eso no está en la tabla del BOE, que solo recoge las fiestas nacionales y autonómicas.",
};

const PAIS_VASCO: CommunitySources = {
  decree: {
    status: "published",
    text: {
      title: "Decreto 90/2026, de 9 de junio, por el que se aprueba el Calendario Oficial de Fiestas Laborales de la Comunidad Autónoma de Euskadi para el año 2027",
      ref: "BOPV núm. 134, de 16.7.2026",
      date: "2026-07-16",
      url: "https://www.euskadi.eus/bopv2/datos/2026/07/2603215a.shtml",
    },
    dates: year("2027-03-25", "2027-03-29", "2027-10-07"),
    covers: "all",
    moves: [],
    quotes: [],
    differences: null,
  },
  local: {
    bulletinName: "Calendario laboral del Gobierno Vasco (enlaza los boletines de Álava, Bizkaia y Gipuzkoa)",
    bulletinShort: "los boletines de cada territorio histórico (BOTHA, BOB y BOG)",
    bulletinUrl: "https://www.euskadi.eus/gobierno-vasco/-/calendario-laboral/",
    how: "En el País Vasco los fija la delegación territorial de Trabajo de cada territorio histórico, en su boletín provincial; el Gobierno Vasco los reúne en su",
    status: "published",
    y2027: null,
    y2026: null,
    dataset: null,
    note: "El fichero de datos abiertos del calendario laboral de Euskadi para 2027 no incluye el 1 de noviembre entre los festivos de toda la comunidad: la lista correcta es la del decreto y el BOE.",
    parts: [
      {
        place: "Álava",
        text: {
          title: "Resolución de 5 de octubre de 2026 del delegado territorial de Álava del Departamento de Economía, Trabajo y Empleo, que aprueba la determinación de las fiestas locales de Álava para el año 2027",
          ref: "BOTHA núm. 116, de 9.10.2026",
          date: "2026-10-09",
          url: "https://www.araba.eus/botha/Boletines/2026/116/2026_116_02851_C.pdf",
        },
      },
      {
        place: "Bizkaia",
        text: {
          title:
            "Resolución, de 12 de septiembre de 2026, de la delegada territorial de Trabajo y Seguridad Social de Bizkaia, por la que se establece el Calendario de Fiestas Locales del Territorio Histórico de Bizkaia para el año 2027",
          ref: "BOB núm. 181, de 22.9.2026",
          date: "2026-09-22",
          url: "https://www.bizkaia.eus/lehendakaritza/Bao_bob/2026/09/22/III-145_cas.pdf",
        },
      },
      {
        place: "Gipuzkoa",
        text: {
          title: "Resolución de 21 de septiembre de 2026 del delegado territorial de Trabajo y Seguridad Social de Gipuzkoa, por la que se aprueba el calendario de las fiestas locales de Gipuzkoa para el año 2027",
          ref: "BOG núm. 187, de 1.10.2026",
          date: "2026-10-01",
          url: "https://egoitza.gipuzkoa.eus/gao-bog/castell/bog/2026/10/01/c2606250.htm",
        },
      },
    ],
  },
  boeNote: null,
  subRegional: null,
  decreeNote: "El decreto no traslada el 15 de agosto, que cae en domingo; el Lunes de Pascua y el 7 de octubre son los días propios de Euskadi.",
};

const LA_RIOJA: CommunitySources = {
  decree: {
    status: "published",
    text: {
      title:
        "Resolución 186/2026, de 30 de abril, de la Secretaría General Técnica de la Consejería de Economía, Innovación, Empresa y Trabajo Autónomo, por la que se dispone la publicación del Acuerdo de Consejo de Gobierno por el que se aprueba el calendario de festivos laborales para el año 2027 en la Comunidad Autónoma de La Rioja",
      ref: "BOR núm. 86, de 8.5.2026",
      date: "2026-05-08",
      url: "https://ias1.larioja.org/boletin/Bor_Boletin_visor_Servlet?referencia=40284752-1-PDF-577043",
    },
    dates: year("2027-03-25", "2027-03-29", "2027-06-09"),
    covers: "all",
    moves: [],
    quotes: ["Las referidas fiestas locales se determinarán por resolución de la Dirección General de Trabajo y Salud Laboral y se publicarán en el Boletín Oficial de La Rioja."],
    differences: null,
  },
  local: {
    bulletinName: "Boletín Oficial de La Rioja (BOR)",
    bulletinShort: "el BOR",
    bulletinUrl: "https://web.larioja.org/bor-portada/",
    how: "En La Rioja los publica la Dirección General de Trabajo y Salud Laboral, en el",
    status: "published",
    y2027: {
      title: "Calendario laboral de fiestas locales 2027 (Dirección General de Trabajo y Salud Laboral)",
      ref: "BOR núm. 160, de 21.8.2026",
      date: "2026-08-21",
      url: "https://ias1.larioja.org/boletin/Bor_Boletin_visor_Servlet?referencia=41863576-1-PDF-579228",
    },
    y2026: null,
    dataset: null,
    note: "La lista no nombra todos los municipios: para los que no aparecen dice «Restantes municipios de La Rioja: Las dos fiestas tradicionales de cada uno de ellos».",
  },
  boeNote: null,
  subRegional: null,
};

export const SOURCES: Record<Region, CommunitySources> = {
  AN: ANDALUCIA,
  AR: ARAGON,
  AS: ASTURIAS,
  IB: BALEARES,
  CN: CANARIAS,
  CB: CANTABRIA,
  CM: CASTILLA_LA_MANCHA,
  CL: CASTILLA_Y_LEON,
  CT: CATALONIA,
  EX: EXTREMADURA,
  GA: GALICIA,
  MD: MADRID,
  MC: MURCIA,
  NC: NAVARRA,
  PV: PAIS_VASCO,
  RI: LA_RIOJA,
  VC: VALENCIANA,
  CE: CEUTA,
  ML: MELILLA,
};
