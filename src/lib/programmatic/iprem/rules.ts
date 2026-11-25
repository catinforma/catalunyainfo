/**
 * The IPREM (indicador público de renta de efectos múltiples): the ONE place
 * its figures live. Every calculator that uses it (paro, subsidio por
 * desempleo, bono social, the pensions page and the IPREM page itself)
 * imports them from here; tests/iprem.test.ts fails if another module types
 * an IPREM amount of its own. Client-safe: no data files, no server code.
 *
 * ## Read on IPREM_RULES_AS_OF (curl + grep of the quoted text)
 *
 *  - BOE, the XML of each text that fixed the amounts
 *    (https://www.boe.es/diario_boe/xml.php?id=<boeId>): Real Decreto-ley
 *    3/2004 art. 2.2 (July–December 2004) and the yearly budget acts for
 *    2005–2018 and 2021–2023. Their passages, verbatim, are in
 *    tests/fixtures/boe-iprem-provisions.json, and the test checks every
 *    figure below against them.
 *  - No budget act since 2023: the BOE's legislation search finds no "Ley de
 *    Presupuestos Generales del Estado para el año" 2024, 2025, 2026 or 2027
 *    (only the Hacienda orders with the rules to draw up the 2026 and 2027
 *    budgets, BOE-A-2025-17504 and BOE-A-2026-12037). The 2023 act is
 *    extended by the Constitution itself (art. 134.4) and the Ley General
 *    Presupuestaria (art. 38.1), so its IPREM still applies.
 *  - SEPE, "Cuantías anuales" (2026): «Del indicador público de renta de
 *    efectos múltiples (IPREM) fijado en: Ley 31/2022 …», 600,00 € a month,
 *    7.200,00 € a year. The 2026 figure is quoted from there.
 *  - 2027: the Cortes were dissolved by Real Decreto 806/2026 (BOE
 *    6 Oct 2026; elections 29 Nov 2026, new chambers meet 23 Dec 2026). No
 *    2027 budget bill is before them.
 *
 * ## Do not print
 *
 * Any IPREM figure for 2019, 2020, 2024 or 2025 (no BOE or SEPE text we
 * hold gives one for those years: the table leaves them blank and says the
 * budget was extended); any 2027 figure other than "the 2023 act's, while
 * no new budget act is published"; IPREM amounts for regional or local
 * thresholds (each has its own rule).
 *
 * A test fails from IPREM_RECHECK_FROM (1 Jan 2027): re-read the BOE for a
 * 2027 budget act or any rule fixing the 2027 IPREM, and SEPE's page, then
 * update IPREM_CURRENT / STATUS_2027 and move the date.
 */

/** The day every figure and quote below was read on the official text. */
export const IPREM_RULES_AS_OF = "2026-11-18";
/** From this day a test fails until the 2027 IPREM is re-read (budget act, extension, SEPE). */
export const IPREM_RECHECK_FROM = "2027-01-01";

export interface IpremLaw {
  /** The year the amounts are for. */
  year: number;
  /** "Ley 31/2022, de 23 de diciembre, de Presupuestos Generales del Estado para el año 2023". */
  norm: string;
  /** "Ley 31/2022". */
  short: string;
  /** Where in the text: "disposición adicional nonagésima". */
  provision: string;
  boeId: string;
  /** The day the BOE published it. */
  published: string;
  /** The day the text came into force (a budget act passed mid-year applies from then). */
  inForce: string;
  /** Euros a day (letter a). */
  daily: number;
  /** Euros a month (letter b). */
  monthly: number;
  /** Euros a year, 12 payments (letter c). */
  annual: number;
  /** Euros a year where the rule used to refer to the SMI in annual terms, 14 payments (letter d). */
  annual14: number;
}

const law = (l: IpremLaw) => l;

/**
 * Every text that fixed the IPREM, oldest first, as the BOE published it.
 * The yearly 14-payment figure is the law's own (2008: 7.131,80 €, not
 * 509,40 × 14): never computed.
 */
export const IPREM_LAWS: readonly IpremLaw[] = [
  law({ year: 2004, norm: "Real Decreto-ley 3/2004, de 25 de junio, para la racionalización de la regulación del salario mínimo interprofesional y para el incremento de su cuantía", short: "Real Decreto-ley 3/2004", provision: "artículo 2.2", boeId: "BOE-A-2004-12010", published: "2004-06-26", inForce: "2004-07-01", daily: 15.35, monthly: 460.5, annual: 5526, annual14: 6447 }),
  law({ year: 2005, norm: "Ley 2/2004, de 27 de diciembre, de Presupuestos Generales del Estado para el año 2005", short: "Ley 2/2004", provision: "disposición adicional decimosexta", boeId: "BOE-A-2004-21688", published: "2004-12-28", inForce: "2005-01-01", daily: 15.66, monthly: 469.8, annual: 5637.6, annual14: 6577.2 }),
  law({ year: 2006, norm: "Ley 30/2005, de 29 de diciembre, de Presupuestos Generales del Estado para el año 2006", short: "Ley 30/2005", provision: "disposición adicional vigésima segunda", boeId: "BOE-A-2005-21525", published: "2005-12-30", inForce: "2006-01-01", daily: 15.97, monthly: 479.1, annual: 5749.2, annual14: 6707.4 }),
  law({ year: 2007, norm: "Ley 42/2006, de 28 de diciembre, de Presupuestos Generales del Estado para el año 2007", short: "Ley 42/2006", provision: "disposición adicional trigésima primera", boeId: "BOE-A-2006-22865", published: "2006-12-29", inForce: "2007-01-01", daily: 16.64, monthly: 499.2, annual: 5990.4, annual14: 6988.8 }),
  law({ year: 2008, norm: "Ley 51/2007, de 26 de diciembre, de Presupuestos Generales del Estado para el año 2008", short: "Ley 51/2007", provision: "disposición adicional trigésima quinta", boeId: "BOE-A-2007-22295", published: "2007-12-27", inForce: "2008-01-01", daily: 16.98, monthly: 509.4, annual: 6112.8, annual14: 7131.8 }),
  law({ year: 2009, norm: "Ley 2/2008, de 23 de diciembre, de Presupuestos Generales del Estado para el año 2009", short: "Ley 2/2008", provision: "disposición adicional vigésima octava", boeId: "BOE-A-2008-20744", published: "2008-12-24", inForce: "2009-01-01", daily: 17.57, monthly: 527.24, annual: 6326.86, annual14: 7381.33 }),
  law({ year: 2010, norm: "Ley 26/2009, de 23 de diciembre, de Presupuestos Generales del Estado para el año 2010", short: "Ley 26/2009", provision: "disposición adicional decimonovena", boeId: "BOE-A-2009-20765", published: "2009-12-24", inForce: "2010-01-01", daily: 17.75, monthly: 532.51, annual: 6390.13, annual14: 7455.14 }),
  law({ year: 2011, norm: "Ley 39/2010, de 22 de diciembre, de Presupuestos Generales del Estado para el año 2011", short: "Ley 39/2010", provision: "disposición adicional decimoctava", boeId: "BOE-A-2010-19703", published: "2010-12-23", inForce: "2011-01-01", daily: 17.75, monthly: 532.51, annual: 6390.13, annual14: 7455.14 }),
  law({ year: 2012, norm: "Ley 2/2012, de 29 de junio, de Presupuestos Generales del Estado para el año 2012", short: "Ley 2/2012", provision: "disposición adicional decimocuarta", boeId: "BOE-A-2012-8745", published: "2012-06-30", inForce: "2012-07-01", daily: 17.75, monthly: 532.51, annual: 6390.13, annual14: 7455.14 }),
  law({ year: 2013, norm: "Ley 17/2012, de 27 de diciembre, de Presupuestos Generales del Estado para el año 2013", short: "Ley 17/2012", provision: "disposición adicional octogésima segunda", boeId: "BOE-A-2012-15651", published: "2012-12-28", inForce: "2013-01-01", daily: 17.75, monthly: 532.51, annual: 6390.13, annual14: 7455.14 }),
  law({ year: 2014, norm: "Ley 22/2013, de 23 de diciembre, de Presupuestos Generales del Estado para el año 2014", short: "Ley 22/2013", provision: "disposición adicional octogésima", boeId: "BOE-A-2013-13616", published: "2013-12-26", inForce: "2014-01-01", daily: 17.75, monthly: 532.51, annual: 6390.13, annual14: 7455.14 }),
  law({ year: 2015, norm: "Ley 36/2014, de 26 de diciembre, de Presupuestos Generales del Estado para el año 2015", short: "Ley 36/2014", provision: "disposición adicional octogésima cuarta", boeId: "BOE-A-2014-13612", published: "2014-12-30", inForce: "2015-01-01", daily: 17.75, monthly: 532.51, annual: 6390.13, annual14: 7455.14 }),
  law({ year: 2016, norm: "Ley 48/2015, de 29 de octubre, de Presupuestos Generales del Estado para el año 2016", short: "Ley 48/2015", provision: "disposición adicional octogésima cuarta", boeId: "BOE-A-2015-11644", published: "2015-10-30", inForce: "2016-01-01", daily: 17.75, monthly: 532.51, annual: 6390.13, annual14: 7455.14 }),
  law({ year: 2017, norm: "Ley 3/2017, de 27 de junio, de Presupuestos Generales del Estado para el año 2017", short: "Ley 3/2017", provision: "disposición adicional centésima séptima", boeId: "BOE-A-2017-7387", published: "2017-06-28", inForce: "2017-06-29", daily: 17.93, monthly: 537.84, annual: 6454.03, annual14: 7519.59 }),
  law({ year: 2018, norm: "Ley 6/2018, de 3 de julio, de Presupuestos Generales del Estado para el año 2018", short: "Ley 6/2018", provision: "disposición adicional centésima decimonovena", boeId: "BOE-A-2018-9268", published: "2018-07-04", inForce: "2018-07-05", daily: 17.93, monthly: 537.84, annual: 6454.03, annual14: 7519.59 }),
  law({ year: 2021, norm: "Ley 11/2020, de 30 de diciembre, de Presupuestos Generales del Estado para el año 2021", short: "Ley 11/2020", provision: "disposición adicional centésima vigésima primera", boeId: "BOE-A-2020-17339", published: "2020-12-31", inForce: "2021-01-01", daily: 18.83, monthly: 564.9, annual: 6778.8, annual14: 7908.6 }),
  law({ year: 2022, norm: "Ley 22/2021, de 28 de diciembre, de Presupuestos Generales del Estado para el año 2022", short: "Ley 22/2021", provision: "disposición adicional centésima primera", boeId: "BOE-A-2021-21653", published: "2021-12-29", inForce: "2022-01-01", daily: 19.3, monthly: 579.02, annual: 6948.24, annual14: 8106.28 }),
  law({ year: 2023, norm: "Ley 31/2022, de 23 de diciembre, de Presupuestos Generales del Estado para el año 2023", short: "Ley 31/2022", provision: "disposición adicional nonagésima", boeId: "BOE-A-2022-22128", published: "2022-12-24", inForce: "2023-01-01", daily: 20, monthly: 600, annual: 7200, annual14: 8400 }),
];

const byYear = (year: number): IpremLaw => {
  const l = IPREM_LAWS.find((x) => x.year === year);
  if (!l) throw new Error(`iprem: no law for ${year}`);
  return l;
};

/** The 2023 budget act, still applied (extended) in 2026. */
export const LAW_2023: IpremLaw = byYear(2023);

/**
 * One row per year from 2004 to 2026. `law`: a text of its own fixed the
 * amounts. `extended`: no budget act that year, so the previous one was
 * extended (CE art. 134.4); `quoted` says whether an official text we hold
 * gives the year's figure (only SEPE's 2026 page): the others stay blank.
 */
export type IpremYearRow =
  | { year: number; kind: "law"; law: IpremLaw }
  | { year: number; kind: "extended"; extends: IpremLaw; quoted: boolean };

export const IPREM_YEARS: readonly IpremYearRow[] = [
  ...IPREM_LAWS.filter((l) => l.year <= 2018).map((l) => ({ year: l.year, kind: "law" as const, law: l })),
  { year: 2019, kind: "extended", extends: byYear(2018), quoted: false },
  { year: 2020, kind: "extended", extends: byYear(2018), quoted: false },
  ...IPREM_LAWS.filter((l) => l.year >= 2021).map((l) => ({ year: l.year, kind: "law" as const, law: l })),
  { year: 2024, kind: "extended", extends: LAW_2023, quoted: false },
  { year: 2025, kind: "extended", extends: LAW_2023, quoted: false },
  { year: 2026, kind: "extended", extends: LAW_2023, quoted: true },
];

/* -------------------------------------------------------------------------- */
/* The figures in force (2026): what every calculator imports                 */
/* -------------------------------------------------------------------------- */

export interface IpremAmounts {
  year: number;
  daily: number;
  monthly: number;
  annual: number;
  annual14: number;
  /** The text that fixes them. */
  law: IpremLaw;
  /** True while that text is a budget act extended past its own year. */
  extended: boolean;
}

/** 2026: the 2023 act's amounts (budget extended; SEPE "Cuantías anuales" 2026: 600,00 € / 7.200,00 €). */
export const IPREM_CURRENT: IpremAmounts = { year: 2026, daily: LAW_2023.daily, monthly: LAW_2023.monthly, annual: LAW_2023.annual, annual14: LAW_2023.annual14, law: LAW_2023, extended: true };

/** The year the figures in force are for. */
export const IPREM_YEAR = IPREM_CURRENT.year;
/** Euros a day: «a) El IPREM diario, 20 euros». */
export const IPREM_DAILY = IPREM_CURRENT.daily;
/** Euros a month: «b) El IPREM mensual, 600 euros». */
export const IPREM_MONTHLY = IPREM_CURRENT.monthly;
/** Euros a year, 12 payments: «c) El IPREM anual, 7.200 euros». */
export const IPREM_ANNUAL = IPREM_CURRENT.annual;
/** Euros a year, 14 payments ("IPREM de 14 pagas"): letter d), 8.400 euros. */
export const IPREM_14 = IPREM_CURRENT.annual14;

/* -------------------------------------------------------------------------- */
/* 2027                                                                       */
/* -------------------------------------------------------------------------- */

/** Where the 2027 IPREM stands, from official texts only (read IPREM_RULES_AS_OF). */
export const STATUS_2027 = {
  /** A "Ley de Presupuestos Generales del Estado para el año 2027" in the BOE. */
  budgetActInBoe: false,
  checked: IPREM_RULES_AS_OF,
  dissolution: { norm: "Real Decreto 806/2026, de 5 de octubre, de disolución del Congreso de los Diputados y del Senado y de convocatoria de elecciones", boeId: "BOE-A-2026-20742", published: "2026-10-06", elections: "2026-11-29", constitutive: "2026-12-23" },
  budgetRules: { norm: "Orden HAC/557/2026, de 3 de junio, por la que se dictan las normas para la elaboración de los Presupuestos Generales del Estado para 2027", boeId: "BOE-A-2026-12037", published: "2026-06-05" },
} as const;

/* -------------------------------------------------------------------------- */
/* Catalonia's own indicator (IRSC), read 25 Nov 2026                         */
/* -------------------------------------------------------------------------- */

/**
 * The IPREM is the same in every region (a State budget act sets it); the
 * Generalitat uses its own indicator for its own benefits. Read on 25 Nov 2026
 * (curl + pdftotext of the DOGC PDF https://portaldogc.gencat.cat/utilsEADOP/PDF/9706/2161184.pdf,
 * DOGC 9706 of 13.7.2026, Llei 10/2026, de 9 de juliol, de pressupostos de la
 * Generalitat per al 2026, disposició addicional 17 apartat 1: «Per a l'exercici
 * del 2026, l'indicador de renda de suficiència de Catalunya, establert per
 * l'article 15.2 de la Llei 13/2006, de 27 de juliol, de prestacions socials de
 * caràcter econòmic, es fixa en dotze mensualitats de 801,85 euros i en 9.622,18
 * euros anuals.»; apartat 2: «La Generalitat ha d'utilitzar com a índex o
 * referència de renda l'indicador de renda de suficiència»); and the
 * Generalitat's indicators page (web.gencat.cat …/estadistiques-indicadors/economia):
 * «From 1 January 2026 the value of the IRSC is 801.85 euros per month, which is
 * equivalent to 9,622.18 euros per year». Verbatim passage in
 * tests/fixtures/dogc-irsc-2026.json. Re-read with the IPREM (IPREM_RECHECK_FROM).
 */
export const IRSC_2026 = { year: 2026, monthly: 801.85, annual: 9622.18, norm: "Llei 10/2026, de 9 de juliol, de pressupostos de la Generalitat de Catalunya per al 2026", provision: "disposició addicional 17", dogc: "DOGC 9706, 13.7.2026" } as const;
export const IRSC_QUOTE =
  "Per a l'exercici del 2026, l'indicador de renda de suficiència de Catalunya, establert per l'article 15.2 de la Llei 13/2006, de 27 de juliol, de prestacions socials de caràcter econòmic, es fixa en dotze mensualitats de 801,85 euros i en 9.622,18 euros anuals.";

/* -------------------------------------------------------------------------- */
/* Quotes (verbatim, Spanish, as published; tests check them)                 */
/* -------------------------------------------------------------------------- */

export const QUOTE = {
  /** RDL 3/2004 art. 2.1: why the IPREM exists. */
  created:
    "Para que pueda utilizarse como indicador o referencia del nivel de renta que sirva para determinar la cuantía de determinadas prestaciones o para acceder a determinadas prestaciones, beneficios o servicios públicos, y pueda sustituir en esta función al salario mínimo interprofesional, se crea el indicador público de renta de efectos múltiples (IPREM).",
  /** RDL 3/2004 art. 2.2, first sentence: who sets it. */
  yearly: "Anualmente, en la Ley de Presupuestos Generales del Estado, se determinará la cuantía del citado indicador teniendo en cuenta, al menos, la previsión u objetivo de inflación utilizados en ella.",
  /** RDL 3/2004 art. 2.3. */
  replacesSmi:
    "A partir de la entrada en vigor de este real decreto ley, las referencias al salario mínimo interprofesional contenidas en normas vigentes del Estado, cualquiera que sea su rango, se entenderán referidas al IPREM, salvo las señaladas en el artículo 1 de este real decreto ley y en sus normas de desarrollo.",
  /** Ley 31/2022, DA 90ª, letters a) to c). */
  da90: "a) El IPREM diario, 20 euros. b) El IPREM mensual, 600 euros. c) El IPREM anual, 7.200 euros.",
  /** Ley 31/2022, DA 90ª, letter d): the 14-payment figure. */
  da90d:
    "d) En los supuestos en que la referencia al salario mínimo interprofesional ha sido sustituida por la referencia al IPREM en aplicación de lo establecido en el Real Decreto-ley 3/2004, de 25 de junio, la cuantía anual del IPREM será de 8.400 euros cuando las correspondientes normas se refieran al salario mínimo interprofesional en cómputo anual, salvo que expresamente excluyeran las pagas extraordinarias; en este caso, la cuantía será de 7.200 euros.",
  /** Constitución, art. 134.4. */
  ce134: "Si la Ley de Presupuestos no se aprobara antes del primer día del ejercicio económico correspondiente, se considerarán automáticamente prorrogados los Presupuestos del ejercicio anterior hasta la aprobación de los nuevos.",
  /** Ley 47/2003 General Presupuestaria, art. 38.1 (the BOE prints the quotation marks as ‘‘ ’’). */
  lgp38:
    "Si la Ley de Presupuestos Generales del Estado no se aprobara antes del primer día del ejercicio económico correspondiente, se considerarán automáticamente prorrogados los presupuestos iniciales del ejercicio anterior hasta la aprobación y publicación de los nuevos en el «Boletín Oficial del Estado».",
  /** SEPE, "Cuantías anuales" (2026). */
  sepe: "Del indicador público de renta de efectos múltiples (IPREM) fijado en: Ley 31/2022, de 23 de diciembre, de Presupuestos Generales del Estado para el año 2023.",
  /** RD 806/2026, art. 1. */
  dissolved: "Quedan disueltos el Congreso de los Diputados y el Senado elegidos el día 23 de julio de 2023.",
  /** RD 806/2026, art. 5. */
  constitutive: "Celebradas las elecciones convocadas por este real decreto, las Cámaras resultantes se reunirán, en sesiones constitutivas, el día 23 de diciembre, a las diez horas.",
  /** Ley 1/1996 de asistencia jurídica gratuita, art. 3.1 (consolidated text). */
  legalAid:
    "Se reconocerá el derecho de asistencia jurídica gratuita a aquellas personas físicas que careciendo de patrimonio suficiente cuenten con unos recursos e ingresos económicos brutos, computados anualmente por todos los conceptos y por unidad familiar, que no superen los siguientes umbrales: a) Dos veces el indicador público de renta de efectos múltiples vigente en el momento de efectuar la solicitud cuando se trate de personas no integradas en ninguna unidad familiar. b) Dos veces y media el indicador público de renta de efectos múltiples vigente en el momento de efectuar la solicitud cuando se trate de personas integradas en alguna de las modalidades de unidad familiar con menos de cuatro miembros. c) El triple de dicho indicador cuando se trate de unidades familiares integradas por cuatro o más miembros o que tengan reconocida su condición de familia numerosa de acuerdo con la normativa vigente.",
  /** Ley 1/1996, art. 5.1 (the exceptional ceiling). */
  legalAidExceptional:
    "aun superando los límites previstos en el artículo 3, no excedan del quíntuplo del indicador público de renta de efectos múltiples, teniendo en cuenta además la carencia de patrimonio suficiente.",
  /** Generalitat de Catalunya, tràmit "Assistència jurídica gratuïta" (Spanish edition, updated 10.02.2026). */
  legalAidGencat: "Uno: 14.400 € (2 IPREM). Dos o tres: 18.000 € (2,5 IPREM). Cuatro o mas: 21.600 € (3 IPREM).",
  /** RD 326/2026 (Plan Estatal de Vivienda 2026-2030), art. 8.2.b, last sentence. */
  housingBase: "La cuantía resultante se convertirá en número de veces el Indicador Público de Renta de Efectos Múltiples (IPREM), referido a 14 pagas, en vigor durante el período al que se refieran los ingresos evaluados.",
  /** RD 326/2026, art. 116.1.c (rent aid). */
  housingRent:
    "c) En el supuesto de alquiler o cesión de vivienda que la suma total de los ingresos anuales de las personas que tengan su domicilio habitual y permanente en la misma, consten o no como titulares del contrato de arrendamiento o cesión sean iguales o inferiores a 5 veces el IPREM, en el momento de la suscripción del correspondiente contrato. Dicho umbral será de 5,5 veces el IPREM si se trata de una familia numerosa de categoría general, monoparental o monomarental, de personas con discapacidad con un grado reconocido igual o superior al 33 % o de víctimas de terrorismo y de 6 veces el IPREM cuando se trate de familias numerosas de categoría especial o de personas con discapacidad con un grado reconocido igual o superior al 65 %.",
  /** LGSS art. 278 (consolidated text). */
  subsidy:
    "La cuantía del subsidio será igual a los siguientes porcentajes del indicador público de rentas de efectos múltiples mensual vigente en cada momento: el 95 por ciento durante los ciento ochenta primeros días, el 90 por ciento desde el día ciento ochenta y uno al día trescientos sesenta, y el 80 por ciento a partir del día trescientos sesenta y uno.",
  /** LGSS art. 280.4. */
  subsidy52: "La cuantía del subsidio por desempleo para trabajadores mayores de cincuenta y dos años será igual al 80 por ciento del indicador público de rentas de efectos múltiples mensual vigente en cada momento.",
  /** LGSS art. 275.1: the subsidy's income test is the SMI's, not the IPREM's. */
  subsidyIncome:
    "cuando las rentas de cualquier naturaleza de la persona solicitante o beneficiaria durante el mes natural anterior a dichas fechas no superen el 75 por ciento del salario mínimo interprofesional, excluida la parte proporcional de dos pagas extraordinarias.",
  /** LGSS art. 270.3, first two sentences. */
  benefitLimits:
    "La cuantía máxima de la prestación por desempleo será del 175 por ciento del indicador público de rentas de efectos múltiples, salvo cuando el trabajador tenga uno o más hijos a su cargo, en cuyo caso la cuantía será, respectivamente, del 200 por ciento o del 225 por ciento de dicho indicador. La cuantía mínima de la prestación por desempleo será del 107 por ciento o del 80 por ciento del indicador público en rentas de efectos múltiples, según que el trabajador tenga o no, respectivamente, hijos a su cargo.",
  /** LGSS art. 270.3, last sentence. */
  benefitSixth: "se tendrá en cuenta el indicador público de rentas de efectos múltiples mensual vigente en el momento del nacimiento del derecho, incrementado en una sexta parte.",
} as const;

/* -------------------------------------------------------------------------- */
/* Thresholds in IPREM multiples, each from its own rule                      */
/* -------------------------------------------------------------------------- */

/** Ley 1/1996 art. 3.1 a–c and art. 5.1, on the yearly IPREM (12 payments: Generalitat's page prints 14.400 / 18.000 / 21.600 / 36.000 €). */
export const LEGAL_AID_MULTIPLES = { alone: 2, under4: 2.5, from4: 3, exceptional: 5 } as const;
/** RD 326/2026 art. 116.1.c, on the 14-payment IPREM (art. 8.2.b). */
export const HOUSING_RENT_MULTIPLES = { general: 5, raised: 5.5, highest: 6 } as const;

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

export interface IpremSource {
  name: string;
  url: string;
  publisher: string;
  ref: string;
}

const act = (id: string) => `https://www.boe.es/buscar/act.php?id=${id}`;
const doc = (id: string) => `https://www.boe.es/buscar/doc.php?id=${id}`;

/** The BOE page of a law of the table, as published (the text the amounts were read on). */
export function lawUrl(l: Pick<IpremLaw, "boeId">): string {
  return doc(l.boeId);
}

export const SOURCES = {
  pge2023: { name: "Ley 31/2022, de Presupuestos Generales del Estado para el año 2023, disposición adicional nonagésima (IPREM)", url: act("BOE-A-2022-22128"), publisher: "BOE", ref: "BOE-A-2022-22128" },
  rdl3_2004: { name: "Real Decreto-ley 3/2004, de 25 de junio, art. 2 (creación del IPREM)", url: act("BOE-A-2004-12010"), publisher: "BOE", ref: "BOE-A-2004-12010" },
  ce: { name: "Constitución Española, art. 134.4 (prórroga de los Presupuestos)", url: `${act("BOE-A-1978-31229")}#a134`, publisher: "BOE", ref: "BOE-A-1978-31229" },
  lgp: { name: "Ley 47/2003, General Presupuestaria, art. 38.1", url: `${act("BOE-A-2003-21614")}#a38`, publisher: "BOE", ref: "BOE-A-2003-21614" },
  sepe: { name: "Cuantías anuales: valores mensuales y anuales del SMI y del IPREM", url: "https://www.sepe.es/HomeSepe/prestaciones-desempleo/Cuantias-anuales.html", publisher: "SEPE", ref: "IPREM 2026: 600,00 € al mes, 7.200,00 € al año" },
  rd806: { name: "Real Decreto 806/2026, de 5 de octubre, de disolución del Congreso de los Diputados y del Senado y de convocatoria de elecciones", url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20742", publisher: "BOE", ref: "BOE-A-2026-20742" },
  hac557: { name: "Orden HAC/557/2026, normas para la elaboración de los Presupuestos Generales del Estado para 2027", url: doc("BOE-A-2026-12037"), publisher: "BOE", ref: "BOE-A-2026-12037" },
  ley1_1996: { name: "Ley 1/1996, de 10 de enero, de asistencia jurídica gratuita, arts. 3 y 5", url: `${act("BOE-A-1996-750")}#a3`, publisher: "BOE", ref: "BOE-A-1996-750, texto consolidado" },
  gencatAjg: { name: "Assistència jurídica gratuïta (tràmit)", url: "https://tramits.gencat.cat/es/tramits/tramits-temes/Assistencia-juridica-gratuita-00001", publisher: "Generalitat de Catalunya", ref: "actualizado el 10.02.2026" },
  rd326: { name: "Real Decreto 326/2026, de 22 de abril, Plan Estatal de Vivienda 2026-2030, arts. 8.2.b y 116.1.c", url: doc("BOE-A-2026-8872"), publisher: "BOE", ref: "BOE-A-2026-8872" },
  lgss: { name: "Ley General de la Seguridad Social (RDL 8/2015), arts. 270.3, 275.1, 278 y 280.4, texto consolidado", url: act("BOE-A-2015-11724"), publisher: "BOE", ref: "BOE-A-2015-11724, última actualización publicada el 11/11/2026" },
  dogcIrsc: { name: "Llei 10/2026, de 9 de juliol, de pressupostos de la Generalitat de Catalunya per al 2026, disposició addicional 17 (IRSC)", url: "https://portaldogc.gencat.cat/utilsEADOP/PDF/9706/2161184.pdf", publisher: "DOGC", ref: "DOGC 9706, 13.7.2026" },
  rd897: { name: "Real Decreto 897/2017 (bono social eléctrico), art. 3", url: `${act("BOE-A-2017-11505")}#a3`, publisher: "BOE", ref: "BOE-A-2017-11505, texto consolidado" },
} as const satisfies Record<string, IpremSource>;
