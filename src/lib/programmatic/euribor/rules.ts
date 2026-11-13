/**
 * The rules and sources behind "Euríbor hoy" (lib/programmatic/euribor/),
 * each read on RULES_AS_OF, with the words the page quotes. Client-safe.
 *
 * Sources read 13 Nov 2026:
 *  - BOE: Orden EHA/2899/2011 (consolidated, BOE-A-2011-17015), art. 27
 *    "Tipos de interés oficiales" as amended by Orden ETD/699/2020 (in force
 *    27 Jan 2021): the list of official rates and "se publicarán
 *    mensualmente por el Banco de España en el BOE". Art. 21 (FIPRE) and
 *    art. 22 (FiAE).
 *  - BOE: the Banco de España resolutions of 2 Oct 2026 (BOE-A-2026-20519),
 *    20 Oct 2026 (BOE-A-2026-21866), 4 Nov 2026 (BOE-A-2026-23167 and
 *    BOE-A-2026-23168): their wording, footnotes (Circular 5/2012 anejo 8;
 *    Míbor only for loans signed before 1 Jan 2000, Ley 46/1998 art. 32).
 *    scripts/euribor-snapshot.ts checked every value since Jan 2024 against
 *    the resolution that published it (101 resolutions).
 *  - Banco de España: Boletín Estadístico table 19.1, be1901.csv (series
 *    codes, "Fecha BOE" columns); legal notice ("Aviso legal", reuse
 *    conditions quoted below).
 *  - EMMI (Euribor administrator): Terms of Use, quoted below. The daily
 *    Euribor is EMMI's data: no daily value is used (see EMMI_DECISION).
 */

export const RULES_AS_OF = "2026-11-13";
/** From this day a test fails until the sources are re-read (licences and table layouts change). */
export const RULES_REREAD_BY = "2027-05-13";

export const URLS = {
  orden: "https://www.boe.es/buscar/act.php?id=BOE-A-2011-17015",
  ordenArt27: "https://www.boe.es/buscar/act.php?id=BOE-A-2011-17015#a27",
  circular: "https://www.boe.es/buscar/act.php?id=BOE-A-2012-9058",
  ley46: "https://www.boe.es/buscar/act.php?id=BOE-A-1998-29216",
  bdeTable: "https://www.bde.es/webbe/es/estadisticas/temas/tipos-interes.html",
  bdeLegal: "https://www.bde.es/wbe/es/pie/aviso-legal/",
  boeSearch: "https://www.boe.es/buscar/boe.php",
  emmiTerms: "https://www.emmi-benchmarks.eu/terms-of-use",
} as const;

export const NORMS = {
  orden: { name: "Orden EHA/2899/2011, de 28 de octubre, de transparencia y protección del cliente de servicios bancarios", ref: "BOE-A-2011-17015", url: URLS.orden },
  circular: { name: "Circular 5/2012, de 27 de junio, del Banco de España, a entidades de crédito y proveedores de servicios de pago, sobre transparencia de los servicios bancarios y responsabilidad en la concesión de préstamos", ref: "BOE-A-2012-9058", url: URLS.circular },
} as const;

/** Official words the page quotes (Spanish originals). */
export const QUOTE = {
  /** Orden EHA/2899/2011, art. 27.1 (list) and 27.2. */
  art27list: [
    "a) Tipo medio de los préstamos hipotecarios a más de tres años, para adquisición de vivienda libre, concedidos por las entidades de crédito en España.",
    "b) Tipo medio de los préstamos a la vivienda entre uno y cinco años concedidos por las entidades de crédito en la zona euro.",
    "c) Tipo de rendimiento interno en el mercado secundario de la deuda pública de plazo entre dos y seis años.",
    "d) Euribor a una semana, un mes, tres meses, seis meses y un año.",
    "e) Permuta de intereses/Interest Rate Swap (IRS) al plazo de cinco años.",
    "f) Tipo de interés de referencia basado en el Euro short-term rate (€STR).",
  ],
  art27publish: "Los tipos de interés oficiales se publicarán mensualmente por el Banco de España en el “Boletín Oficial del Estado” y estarán también disponibles en su página electrónica.",
  /** Footnote 2 of the interbank resolution (BOE-A-2026-23168). */
  mibor:
    "Este tipo tiene la consideración de tipo de interés oficial exclusivamente para los préstamos hipotecarios referenciados al mismo que se hubiesen formalizado con anterioridad al 1 de enero de 2000, conforme a lo previsto en el artículo 32 de la Ley 46/1998, de 17 de diciembre, sobre introducción del euro.",
  /** Footnote 1 of the resolutions. */
  definition: "La definición y el proceso de determinación de estos tipos de interés oficiales de referencia se recogen en el anejo 8 de la Circular del Banco de España 5/2012, de 27 de junio.",
  /** Banco de España, Aviso legal (reuse condition). */
  bdeReuse: "La distribución o reproducción de la información que se difunde en el sitio web del Banco de España debe ser realizada fielmente, sin manipular ni alterar los contenidos y siempre debe ser citada como fuente el Banco de España.",
  bdeCalc:
    "La información obtenida del sitio web del Banco de España se podrá utilizar para realizar cálculos que se difundan por el usuario (por ejemplo mediante periódicos ajustes de los datos estadísticos, cálculos de tasas de evolución), siempre que se indique de forma inequívoca al difundir dichos cálculos, que se ha utilizado como fuente el Banco de España.",
  /** EMMI Terms of Use (read 13 Nov 2026). */
  emmi:
    "Subject to provisions as prescribed by applicable law or relevant regulatory requirements, access to and consultation of the proprietary data on this website is contingent upon your acknowledgement and agreement that you shall not copy, modify, reproduce, reformat, disclose, transmit, distribute or disseminate, either directly or indirectly through any third parties, the market data and information displayed on this webpage to any person or entity for any commercial reasons without prior signature of a License Agreement with The European Money Markets Institute.",
} as const;

/**
 * Why the pages print only the monthly official figure (13 Nov 2026): the
 * daily Euribor is EMMI's proprietary data and its terms forbid commercial
 * redistribution without a licence; the Banco de España's own daily table
 * (ti_1_7.csv) carries the same EMMI source and terms note. The monthly
 * average is different: Orden EHA/2899/2011 art. 27.2 has the Banco de
 * España publish it in the BOE as an official rate, and the Banco de España
 * allows faithful reproduction and calculations citing it as the source.
 * Revisit only with a written EMMI licence.
 */
export const EMMI_DECISION = "monthly-official-only" as const;
