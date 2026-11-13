/**
 * The rules behind "Letras del Tesoro" (lib/programmatic/treasury-bills/),
 * each from an official text read on RULES_AS_OF, with the words quoted
 * where the page quotes them. Client-safe (the calculator imports the tax
 * scale and the Banco de España fee).
 *
 * Sources read 13 Nov 2026:
 *  - Tesoro Público: "Letras del Tesoro" (instrument page), "Presentación de
 *    peticiones", "Tributación de las Letras del Tesoro" (its savings scale
 *    still ends at 28 %: superseded, see the BOE below), the 2026 auction
 *    calendar PDF (its tax table: 19 to 30 %, "conforme a la normativa
 *    vigente en 2025"), the FAQ ("¿Qué hay que hacer para comprar Deuda del
 *    Estado en la web?").
 *  - Banco de España: auction notice "Letras del Tesoro a 3 y 9 meses",
 *    issue 11 Dec 2026 (requests 16 Nov – 4 Dec 2026 until 14:00, 2 % or
 *    100 % deposit, the 1.5 per mille fee on repayment transfers).
 *  - BOE: Orden ECM/2/2026 (BOE-A-2026-678: art. 10 bid types and amounts,
 *    art. 12.4 allotment, art. 14 price formula); Ley 35/2006 del IRPF
 *    (consolidated: art. 25.2 the yield, art. 46 savings income, arts. 66
 *    and 76 the savings scales as amended by Ley 7/2024 from 1 Jan 2025,
 *    art. 96.2.c the 1,000 € filing threshold that names Letras); RD
 *    439/2007, Reglamento del IRPF, art. 75.3.b (no withholding).
 *  - AEAT: Manual práctico de Renta 2025, "Determinación del rendimiento
 *    íntegro" (no withholding on Letras; withholding on bank "cuentas"
 *    built on Letras).
 */

export const RULES_AS_OF = "2026-11-13";
/** From this day a test fails until the rules are re-read (a new year's budget law or BdE fee can change them). */
export const RULES_REREAD_BY = "2027-01-15";

export const NOMINAL = 1000;

export const URLS = {
  tesoroLetras: "https://www.tesoro.es/deuda-publica/los-valores-del-tesoro/letras-del-tesoro",
  tesoroPeticiones: "https://www.tesoro.es/deuda-publica/mercado/mercado-primario/procedimiento-de-emision-y-subasta-de-los-valores-del-tesoro/presentacion",
  tesoroTax: "https://www.tesoro.es/deuda-publica/los-valores-del-tesoro/fiscalidad/residentes/impuesto-sobre-la-renta-de-las-personas-fisicas/tributacion-de-las-letras-del-tesoro",
  tesoroFaq: "https://www.tesoro.es/deuda-publica/preguntas-frecuentes",
  tesoroBuyOnline: "https://www.tesoropublico.gob.es/es/servicios/compra-y-venta-de-valores",
  tesoroPastResults: "https://www.tesoro.es/deuda-publica/subastas/resultados-subastas-anteriores",
  bdeNotice: "https://www.bde.es/f/webbe/INF/MenuHorizontal/entidades-profesionales/operativa_gestiones/subastas/ficheros/LETRAS3y9meses202612.pdf",
  bdeDirectAccounts: "https://www.bde.es/wbe/es/para-ciudadano/gestiones/apertura-cuentas-directas/",
  bdeAppointment: "https://cita-previa-bde.clorian.com/",
  bdeBranches: "https://www.bde.es/wbe/es/sobre-banco/organizacion/sucursales/",
  orden: "https://www.boe.es/buscar/act.php?id=BOE-A-2026-678",
  lirpf: "https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764",
  rirpf: "https://www.boe.es/buscar/act.php?id=BOE-A-2007-6820",
  aeatManual:
    "https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c05-rendimientos-capital-mobiliario/rendimientos-integrar-base-imponible-ahorro/rendimientos-procedentes-cesion-terceros-capitales-propios/determinacion-rendimiento-integro.html",
} as const;

export const NORMS = {
  orden: { name: "Orden ECM/2/2026, de 9 de enero, por la que se dispone la creación de Deuda del Estado durante el año 2026 y enero de 2027", ref: "BOE-A-2026-678", url: URLS.orden },
  lirpf: { name: "Ley 35/2006, de 28 de noviembre, del Impuesto sobre la Renta de las Personas Físicas", ref: "BOE-A-2006-20764", url: URLS.lirpf },
  rirpf: { name: "Real Decreto 439/2007, de 30 de marzo, por el que se aprueba el Reglamento del Impuesto sobre la Renta de las Personas Físicas", ref: "BOE-A-2007-6820", url: URLS.rirpf },
} as const;

/** Official words the page quotes (Spanish originals). */
export const QUOTE = {
  /** Tesoro Público, "Letras del Tesoro". */
  tesoroWhat:
    "La diferencia entre el valor de reembolso de la Letra (1.000 euros) y su precio de adquisición será la rentabilidad generada por la Letra del Tesoro. Dichos rendimientos están exentos de retención a cuenta tanto en el ámbito del IRPF como en el del Impuesto sobre Sociedades, sin perjuicio de que haya que incluirlos en la declaración anual de dichos impuestos.",
  /** RIRPF art. 75.3.b. */
  rirpf75:
    "No existirá obligación de practicar retención o ingreso a cuenta sobre las rentas siguientes: […] b) Los rendimientos de los valores emitidos por el Banco de España que constituyan instrumento regulador de intervención en el mercado monetario y los rendimientos de las Letras del Tesoro.",
  /** RIRPF art. 75.3.b, second paragraph. */
  rirpf75accounts: "No obstante, las entidades de crédito y demás instituciones financieras que formalicen con sus clientes contratos de cuentas basadas en operaciones sobre Letras del Tesoro estarán obligadas a retener respecto de los rendimientos obtenidos por los titulares de las citadas cuentas.",
  /** LIRPF art. 25.2.b. */
  lirpf25:
    "En el caso de transmisión, reembolso, amortización, canje o conversión de valores, se computará como rendimiento la diferencia entre el valor de transmisión, reembolso, amortización, canje o conversión de los mismos y su valor de adquisición o suscripción. […] Los gastos accesorios de adquisición y enajenación serán computados para la cuantificación del rendimiento, en tanto se justifiquen adecuadamente.",
  /** LIRPF art. 96.2.c. */
  lirpf96:
    "Rentas inmobiliarias imputadas en virtud del artículo 85 de esta Ley, rendimientos íntegros del capital mobiliario no sujetos a retención derivados de letras del Tesoro y subvenciones para la adquisición de viviendas de protección oficial o de precio tasado y demás ganancias patrimoniales derivadas de ayudas públicas, con el límite conjunto de 1.000 euros anuales.",
  /** Orden ECM/2/2026 art. 10.2–10.3. */
  ordenBids:
    "Las ofertas competitivas son aquellas en que se indica el precio, expresado en tanto por ciento sobre el valor nominal, que se está dispuesto a pagar por la Deuda o el tipo de interés en tanto por ciento que se solicita. […] Las ofertas no competitivas son aquéllas en que no se indica precio o tipo de interés.",
  /** Orden ECM/2/2026 art. 12.4.b. */
  ordenAllotment:
    "Subastas de Letras del Tesoro formuladas en términos de tipo de interés. En este caso, todas las peticiones cuyo tipo de interés solicitado sea menor o igual al tipo de interés medio ponderado se adjudicarán al precio equivalente a dicho tipo de interés medio. Las peticiones en las que el tipo de interés solicitado sea mayor al tipo de interés medio ponderado e inferior o igual al máximo aceptado se adjudicarán al precio equivalente al tipo de interés solicitado.",
  /** Orden ECM/2/2026 art. 12.4.d. */
  ordenNonCompetitive: "En ambos tipos de subastas las peticiones no competitivas se aceptarán en su totalidad, siempre que haya sido aceptada alguna petición competitiva, y que el tipo de interés medio ponderado no resulte negativo.",
  /** Banco de España auction notice, "GASTOS". */
  bdeFee:
    "Actualmente, los titulares de Cuentas Directas, por las transferencias de efectivo que se originan cuando se amortizan las Letras del Tesoro, están sujetos a una comisión a favor del Banco de España del 1,5 por mil sobre el importe a transferir, con un mínimo de 0,9 euros y un máximo de 200 euros.",
  /** Tesoro Público, 2026 auction calendar PDF, "Características principales de las Letras del Tesoro", tax table (rules in force in 2025). */
  calendarNonResidents:
    "No están sometidos a tributación en España los rendimientos derivados de la Deuda Pública española, obtenidos por personas físicas o entidades no residentes, siempre que no operen a través de un establecimiento permanente en España.",
  /** Tesoro Público, "Presentación de peticiones". */
  tesoroOnline: "También se puede comprar Deuda Pública a través de internet en www.Tesoro.es para lo cual, es necesario estar en posesión de un certificado electrónico.",
} as const;

/**
 * The savings income scale of the IRPF for a resident, state (LIRPF art. 66.1)
 * plus regional (art. 76) halves added, as amended by Ley 7/2024 from 1 Jan
 * 2025 (BOE-A-2024-26694, disposición final 7.ª): 19 % up to 6,000 €, 21 % to
 * 50,000 €, 23 % to 200,000 €, 27 % to 300,000 €, 30 % above.
 */
export const SAVINGS_SCALE: readonly { upTo: number; rate: number }[] = [
  { upTo: 6_000, rate: 0.19 },
  { upTo: 50_000, rate: 0.21 },
  { upTo: 200_000, rate: 0.23 },
  { upTo: 300_000, rate: 0.27 },
  { upTo: Number.POSITIVE_INFINITY, rate: 0.3 },
];
export const SAVINGS_SCALE_NORM = "Ley 35/2006 arts. 66.1 y 76, en la redacción de la Ley 7/2024 (BOE-A-2024-26694), desde el 1 de enero de 2025";

/** The Banco de España's fee on the repayment transfer, Cuenta Directa holders: 1.5 per mille, min 0.90 €, max 200 € (auction notice, read 13 Nov 2026). */
export const BDE_FEE = { rate: 0.0015, min: 0.9, max: 200 } as const;

/** The Orden's caps: one non-competitive bid per bidder and security, at most 5,000,000 € (art. 10.3); bids from 1,000 € in multiples of 1,000 € (art. 10.4). */
export const NON_COMPETITIVE_MAX = 5_000_000;
