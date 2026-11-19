import { IPREM_ANNUAL, IPREM_YEAR, SOURCES as IPREM_SOURCES } from "@/lib/programmatic/iprem/rules";
import { NORMS as PENSION_NORMS, PAYMENTS, PNC_2026_ANNUAL, PNC_RENT_SUPPLEMENT_2026 } from "@/lib/programmatic/pensions-2027/rules";

/**
 * Every rule of "Pensión no contributiva: requisitos y cuánto se cobra"
 * (lib/programmatic/non-contributory-pension/), each with its source.
 * Nothing numeric is typed anywhere else: the engine, the page and the tests
 * read from here. The 2026 amounts are NOT typed here either: the annual
 * PNC (8.803,20 €) and the rent supplement (525 €) come from the
 * pensions-2027 module (RDL 3/2026 art. 2.5, RD 241/2026 art. 21, read
 * there on 13 Nov 2026 and re-read here), the IPREM from the iprem module.
 * Client-safe: no data files, no server code.
 *
 * ## Read on 19 Nov 2026 (curl + grep of the quoted text)
 *
 *  - BOE, LGSS (RDLeg 8/2015, BOE-A-2015-11724), consolidated text "Última
 *    actualización publicada el 11/11/2026": arts. 363 to 368 (incapacidad
 *    no contributiva; "invalidez" renamed by Ley 2/2025) and 369 to 372
 *    (jubilación no contributiva). Art. 363.1 as worded by Ley 4/2026
 *    (BOE-A-2026-20528) DF 12.2, in force 23/10/2026: a new paragraph keeps
 *    civil-liability compensation for personal injury out of the income
 *    test (the 30/04/2025 wording, read in the BOE's version selector, has
 *    no such paragraph).
 *  - RDL 3/2026 (BOE-A-2026-2548) art. 2.5 and RD 241/2026
 *    (BOE-A-2026-6977) art. 21: 8.803,20 € a year; rent supplement 525,00 €.
 *  - RD 357/1991 (BOE-A-1991-7270, "Última actualización publicada el
 *    12/05/2007"): art. 10.2 (absences under 90 days), 11, 12, 13, 14.1 (14
 *    payments, June and November).
 *  - RD 1191/2012 (BOE-A-2012-10476): the rent supplement's requirements
 *    (art. 2), not counted as income (disposición adicional única).
 *  - IMSERSO: PNC de jubilación and de incapacidad pages, "Normativa y
 *    requisitos", "Actualización de las pensiones para 2026", "Dónde
 *    solicitar", the rent supplement page, and the "Guía resumen de las PNC
 *    2026" (PDF dated 27/12/2025) with the household tables, the 35 % figure
 *    (3.081,12 €), the beneficiaries table and the 16.003,20 € work limit.
 *    imserso.es answers 403 to a bare curl and 200 to a browser user agent.
 *  - Generalitat de Catalunya (Departament de Drets Socials i Inclusió,
 *    Direcció General de Prestacions Socials): tràmits 512 (jubilació), 511
 *    (incapacitat), 8170 (lloguer), 7282 (prestació complementària), all
 *    "Data d'actualització 18.05.2026", and the 2026 leaflet.
 *
 * ## Conflicts and readings (printed on the page)
 *
 *  - Own income: RD 357/1991 art. 14.2 (1991 wording) deducts all of it;
 *    LGSS art. 364.2 only the part above 35 % of the PNC. The law (and
 *    IMSERSO's 2026 guide) wins: 35 %.
 *  - Other beneficiaries in the household: their own income is taken as
 *    under the 35 % (the household cut then comes out at most as high as
 *    the real one) and their PNC is not counted as household income
 *    (art. 364.3 adds "la pensión o pensiones" to the income).
 *  - Third-person complement in a household: IMSERSO's limits with the PNC
 *    × 1.5 for the test and the cut; the complement is added after the
 *    cuts (IMSERSO guide). The LGSS does not spell this out.
 *  - Art. 363.4 names marriage, not parejas de hecho: a partner is not
 *    counted; the page says to ask.
 *
 * ## Do not print
 *
 * Any 2027 PNC amount; the Catalan complementary benefit's income threshold
 * as a rule (it is only quoted); office phones and e-mails.
 *
 * A test fails from RULES_UNTIL (1 Jan 2027, when the 2027 PNC, rent
 * supplement and IPREM replace the 2026 ones).
 */

export const RULES_AS_OF = "2026-11-19";
/** From this day a test fails: the 2026 amounts stop applying (re-read the 2027 revaluation norm). */
export const RULES_UNTIL = "2027-01-01";
/** The year of the amounts below. */
export const AMOUNTS_YEAR = 2026;

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/* -------------------------------------------------------------------------- */
/* 2026 amounts, read from the pensions-2027 module (RDL 3/2026, RD 241/2026) */
/* -------------------------------------------------------------------------- */

/** RDL 3/2026 art. 2.5 and RD 241/2026 art. 21.1: «8.803,20 euros anuales». */
export const PNC_ANNUAL = PNC_2026_ANNUAL;
/** RD 357/1991 art. 14.1: fourteen payments, two of them in June and November. */
export const PNC_PAYMENTS = PAYMENTS;
/** RD 241/2026 art. 21.2: the rent supplement, «525,00 euros anuales», paid once. */
export const RENT_SUPPLEMENT = PNC_RENT_SUPPLEMENT_2026;
/** LGSS art. 366: the IPREM "excluidas las pagas extraordinarias" (12 payments), from the iprem module. */
export const IPREM_12 = IPREM_ANNUAL;
export { IPREM_YEAR };

/* -------------------------------------------------------------------------- */
/* The law's figures (LGSS arts. 363 to 372)                                  */
/* -------------------------------------------------------------------------- */

/** Art. 369.1: «habiendo cumplido sesenta y cinco años de edad». Art. 363.1.a: «menor de sesenta y cinco años». */
export const RETIREMENT_AGE = 65;
/** Art. 363.1.a: «Ser mayor de dieciocho». */
export const INVALIDITY_MIN_AGE = 18;
/** Art. 363.1.c: «en un grado igual o superior al 65 por ciento». */
export const DISABILITY_MIN = 65;
/** Art. 364.6: «en un grado igual o superior al 75 por ciento» and a third person's help. */
export const DISABILITY_THIRD_PERSON = 75;
/** Arts. 369.1 (10 years between 16 and the pension's age) and 363.1.b (5 years); 2 immediately before the application. */
export const RESIDENCE_YEARS = { retirement: 10, invalidity: 5 } as const;
export const RESIDENCE_FROM_AGE = 16;
export const RESIDENCE_RECENT_YEARS = 2;
/** RD 357/1991 art. 10.2: absences under 90 days a year do not break the residence. */
export const ABSENCE_DAYS = 90;
/** Art. 363.2: «el 70 por ciento de dicha cifra por el número de convivientes, menos uno» (also art. 364.1.a). */
export const EXTRA_MEMBER_SHARE = 70;
/** Art. 363.3: «dos veces y media» with ascendants or descendants in the first degree. */
export const FIRST_DEGREE_TIMES = 2.5;
/** Art. 364.2: own income compatible up to «el 35 por ciento del importe». */
export const FREE_INCOME_SHARE = 35;
/** Art. 364.4: «como mínimo, del 25 por ciento». */
export const MINIMUM_SHARE = 25;
/** Art. 364.6: «un complemento equivalente al 50 por ciento». */
export const THIRD_PERSON_SHARE = 50;
/** Art. 366: «durante los cuatro años siguientes al inicio de la actividad». */
export const WORK_YEARS = 4;
/** IMSERSO and the Generalitat's leaflet: changes are reported within 30 days. */
export const CHANGE_DAYS = 30;
/** RD 1191/2012 art. 2.1.e: a lease of at least a year, 180 days lived there; art. 2.1.d: no kin to the third degree. */
export const RENT_LEASE_YEARS = 1;
export const RENT_RESIDED_DAYS = 180;
export const RENT_KIN_DEGREE = 3;

/** 35 % of the PNC: 3.081,12 € a year in 2026 (IMSERSO guide). */
export const FREE_INCOME = round2((PNC_ANNUAL * FREE_INCOME_SHARE) / 100);
/** 25 % of the PNC: 2.200,80 € a year, 157,20 € a month. */
export const MINIMUM_ANNUAL = round2((PNC_ANNUAL * MINIMUM_SHARE) / 100);
/** 50 % of the PNC: 4.401,60 € a year, 314,40 € a month. */
export const THIRD_PERSON_ANNUAL = round2((PNC_ANNUAL * THIRD_PERSON_SHARE) / 100);
/** Art. 366: the IPREM (12 payments) + the PNC: 16.003,20 € a year in 2026. */
export const WORK_LIMIT = round2(IPREM_12 + PNC_ANNUAL);

/** A month in 14 payments. */
export const monthly = (annual: number) => round2(annual / PNC_PAYMENTS);

/** 70 % of an amount, in cents (8.803,20 → 6.162,24). */
const extraShare = (c: number) => round2((c * EXTRA_MEMBER_SHARE) / 100);

/**
 * The household limit (límite de acumulación de recursos, art. 363.2 and
 * 363.3): C + 70 % of C × (members − 1), × 2,5 with a parent or child. With
 * the third-person complement IMSERSO takes C as the PNC + 50 %.
 */
export function householdLimit(members: number, firstDegree: boolean, thirdPerson = false): number {
  const c = thirdPerson ? round2(PNC_ANNUAL + THIRD_PERSON_ANNUAL) : PNC_ANNUAL;
  const base = round2(c + extraShare(c) * (members - 1));
  return firstDegree ? round2(base * FIRST_DEGREE_TIMES) : base;
}

/** Art. 364.1: with n beneficiaries in one household, (C + 70 % of C × (n − 1)) ÷ n each. */
export function individualAmount(beneficiaries: number): number {
  return round2((PNC_ANNUAL + extraShare(PNC_ANNUAL) * (beneficiaries - 1)) / beneficiaries);
}

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

export interface Source {
  name: string;
  url: string;
  publisher: string;
  ref: string;
  read: string;
}

const LGSS = "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724";
const RD357 = "https://www.boe.es/buscar/act.php?id=BOE-A-1991-7270";
const IMSERSO = "https://imserso.es/pnc-prestaciones-subvenciones";
const TRAMITS = "https://tramits.gencat.cat/ca/tramits/tramits-temes";

export const LGSS_ANCHOR = {
  art363: `${LGSS}#a363`,
  art364: `${LGSS}#a364`,
  art365: `${LGSS}#a365`,
  art366: `${LGSS}#a366`,
  art367: `${LGSS}#a367`,
  art368: `${LGSS}#a368`,
  art369: `${LGSS}#a369`,
  art370: `${LGSS}#a370`,
  art371: `${LGSS}#a371`,
} as const;

export const SOURCES = {
  lgss: {
    name: "Real Decreto Legislativo 8/2015, texto refundido de la Ley General de la Seguridad Social (arts. 363 a 372: pensiones no contributivas de incapacidad y de jubilación)",
    url: LGSS,
    publisher: "BOE",
    ref: "BOE-A-2015-11724, texto consolidado, última actualización publicada el 11/11/2026",
    read: RULES_AS_OF,
  },
  ley4: {
    name: "Ley 4/2026, de 1 de octubre, derechos de las personas con discapacidad (disposición final duodécima.2: nuevo párrafo del art. 363.1.d LGSS)",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2026-20528#df-12",
    publisher: "BOE",
    ref: "BOE-A-2026-20528, en vigor desde el 23/10/2026",
    read: RULES_AS_OF,
  },
  rdl3: {
    name: `${PENSION_NORMS.rdl3.name} (art. 2.5: pensiones no contributivas)`,
    url: `${PENSION_NORMS.rdl3.url}#a2`,
    publisher: "BOE",
    ref: PENSION_NORMS.rdl3.ref,
    read: RULES_AS_OF,
  },
  rd241: {
    name: `${PENSION_NORMS.rd241.name} (art. 21: pensiones no contributivas y complemento de alquiler)`,
    url: PENSION_NORMS.rd241.url,
    publisher: "BOE",
    ref: PENSION_NORMS.rd241.ref,
    read: RULES_AS_OF,
  },
  rd357: {
    name: "Real Decreto 357/1991, de 15 de marzo, que desarrolla en materia de pensiones no contributivas la Ley 26/1990 (arts. 10 a 14)",
    url: RD357,
    publisher: "BOE",
    ref: "BOE-A-1991-7270, texto consolidado, última actualización publicada el 12/05/2007",
    read: RULES_AS_OF,
  },
  rd1191: {
    name: "Real Decreto 1191/2012, de 3 de agosto, complemento de pensión para el alquiler de vivienda de los pensionistas no contributivos",
    url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2012-10476",
    publisher: "BOE",
    ref: "BOE-A-2012-10476",
    read: RULES_AS_OF,
  },
  iprem: {
    name: `IPREM ${IPREM_YEAR}: ${IPREM_SOURCES.pge2023.name}`,
    url: IPREM_SOURCES.pge2023.url,
    publisher: "BOE",
    ref: `${IPREM_SOURCES.pge2023.ref}, prorrogada`,
    read: RULES_AS_OF,
  },
  imsersoJub: {
    name: "PNC de jubilación: normativa y requisitos",
    url: `${IMSERSO}/pnc-jubilacion/normativa-requisitos`,
    publisher: "Imserso",
    ref: "requisitos, unidad económica y límites de 2026",
    read: RULES_AS_OF,
  },
  imsersoInc: {
    name: "PNC de incapacidad",
    url: `${IMSERSO}/pnc-incapacidad`,
    publisher: "Imserso",
    ref: "normativa, cuantías 2026, solicitud",
    read: RULES_AS_OF,
  },
  imsersoUpdate: {
    name: "Actualización de las pensiones no contributivas para 2026",
    url: `${IMSERSO}/pnc-jubilacion/actualizacion-pensiones`,
    publisher: "Imserso",
    ref: "8.803,20 € en 12 mensualidades más dos pagas extraordinarias",
    read: RULES_AS_OF,
  },
  imsersoGuide: {
    name: "Guía resumen de las pensiones no contributivas de la Seguridad Social, año 2026 (PDF)",
    url: "https://imserso.es/documents/20123/1595507/pncresumen2026.pdf/c4b41c80-63fe-942d-7231-f3ee20e28694",
    publisher: "Imserso",
    ref: "PDF publicado el 27/12/2025: cuantías, límites de la unidad económica y cálculo",
    read: RULES_AS_OF,
  },
  imsersoLeaflet: {
    name: "Pensiones no contributivas de la Seguridad Social 2026 (folleto, PDF)",
    url: "https://imserso.es/documents/20123/1595507/fpnc_2026.pdf/d76f3d01-3c8b-9fc5-9ea8-4d7f6dfdcec4",
    publisher: "Imserso",
    ref: "PDF publicado el 26/12/2025: incompatibilidades, cuantías, gestión",
    read: RULES_AS_OF,
  },
  imsersoRent: {
    name: "Complemento para titulares de pensión no contributiva que residan en una vivienda alquilada",
    url: `${IMSERSO}/solicitud-complemento-titulares-pension-contributiva`,
    publisher: "Imserso",
    ref: "requisitos y cuantía 2026 (525 €)",
    read: RULES_AS_OF,
  },
  imsersoWhere: {
    name: "Dónde solicitar una pensión no contributiva (PNC)",
    url: `${IMSERSO}/donde-solicitar-pension-no-contributiva-pnc`,
    publisher: "Imserso",
    ref: "gestión por las comunidades autónomas",
    read: RULES_AS_OF,
  },
  gencatJub: {
    name: "Pensió no contributiva per jubilació (tràmit 512)",
    url: `${TRAMITS}/Pensio-no-contributiva-per-jubilacio-00001?moda=1`,
    publisher: "Generalitat de Catalunya, Departament de Drets Socials i Inclusió",
    ref: "data d'actualització 18.05.2026",
    read: RULES_AS_OF,
  },
  gencatInc: {
    name: "Pensió no contributiva per incapacitat (tràmit 511)",
    url: `${TRAMITS}/Pensio-no-contributiva-per-invalidesa-00001?moda=1`,
    publisher: "Generalitat de Catalunya, Departament de Drets Socials i Inclusió",
    ref: "data d'actualització 18.05.2026",
    read: RULES_AS_OF,
  },
  gencatRent: {
    name: "Complement de pensió no contributiva per a persones que viuen de lloguer (tràmit 8170)",
    url: `${TRAMITS}/Complement-de-pensio-no-contributiva-per-a-persones-que-viuen-de-lloguer`,
    publisher: "Generalitat de Catalunya, Departament de Drets Socials i Inclusió",
    ref: "data d'actualització 18.05.2026",
    read: RULES_AS_OF,
  },
  gencatComplement: {
    name: "Prestació complementària de la pensió no contributiva per incapacitat o jubilació (tràmit 7282)",
    url: `${TRAMITS}/Prestacio-complementaria-a-pensio-no-contributiva-per-invalidesa-o-jubilacio?moda=1`,
    publisher: "Generalitat de Catalunya, Departament de Drets Socials i Inclusió",
    ref: "data d'actualització 18.05.2026",
    read: RULES_AS_OF,
  },
  gencatLeaflet: {
    name: "Les pensions no contributives (PNC) 2026 (fulletó, PDF)",
    url: "https://dretssocials.gencat.cat/web/.content/03ambits_tematics/04gentgran/pnc/fulleto-pensio-no-contributiva.pdf",
    publisher: "Generalitat de Catalunya, Departament de Drets Socials i Inclusió",
    ref: "versió 2026-1: límits, quanties, obligacions",
    read: RULES_AS_OF,
  },
} as const satisfies Record<string, Source>;

/** The official procedure: never done here, only linked. Catalonia's is the Generalitat's; elsewhere, the region's (IMSERSO list). */
export const OFFICIAL_PROCEDURE = {
  catRetirement: SOURCES.gencatJub.url,
  catInvalidity: SOURCES.gencatInc.url,
  catRent: SOURCES.gencatRent.url,
  /** Departament de Drets Socials i Inclusió, "Pensió no contributiva (PNC)". */
  catInfo: "https://dretssocials.gencat.cat/ca/ambits_tematics/gent_gran/pnc/",
  /** IMSERSO: every region's managing body. */
  where: SOURCES.imsersoWhere.url,
} as const;

/** Generalitat, tràmit 512: «El termini màxim per notificar la resolució és de 90 dies» (silence: refused). */
export const GENCAT_ANSWER_DAYS = 90;

/** The Generalitat's tràmits pages' date. */
export const GENCAT_UPDATED = "2026-05-18";

/** Verbatim quotes (as published: Spanish, the Generalitat's in Catalan), read on RULES_AS_OF. */
export const QUOTE = {
  /** LGSS art. 363.1.a to d. */
  art363a: "Ser mayor de dieciocho y menor de sesenta y cinco años de edad.",
  art363b: "Residir legalmente en territorio español y haberlo hecho durante cinco años, de los cuales dos deberán ser inmediatamente anteriores a la fecha de solicitud de la pensión.",
  art363c: "Estar afectadas por una discapacidad o por una enfermedad crónica, en un grado igual o superior al 65 por ciento.",
  art363d:
    "Carecer de rentas o ingresos suficientes. Se considerará que existen rentas o ingresos insuficientes cuando la suma, en cómputo anual, de los mismos sea inferior al importe, también en cómputo anual, de la prestación a que se refiere el apartado 1 del artículo siguiente.",
  /** LGSS art. 363.1.d, second paragraph. */
  art363household:
    "Aunque el solicitante carezca de rentas o ingresos propios, en los términos señalados en el párrafo anterior, si convive con otras personas en una misma unidad económica, únicamente se entenderá cumplido el requisito de carencia de rentas o ingresos suficientes cuando la suma de los de todos los integrantes de aquella sea inferior al límite de acumulación de recursos obtenido conforme a lo establecido en los apartados siguientes.",
  /** LGSS art. 363.1.d, third paragraph (Ley 4/2026, from 23/10/2026), first sentence. */
  art363compensation:
    "A los efectos de apreciar la carencia de rentas o ingresos suficientes no se considerarán rentas o ingresos computables las indemnizaciones por responsabilidad civil por daños personales en la cuantía legal o judicialmente reconocidas.",
  /** LGSS art. 363.1.d, fourth paragraph: back to the pension when the job ends. */
  art363recover:
    "Los beneficiarios de la pensión de incapacidad no contributiva que sean contratados por cuenta ajena, se establezcan por cuenta propia o se acojan a los programas de renta activa de inserción para trabajadores desempleados de larga duración mayores de cuarenta y cinco años recuperarán automáticamente, en su caso, el derecho a dicha pensión cuando, respectivamente, se les extinga su contrato, dejen de desarrollar su actividad laboral o cesen en el programa de renta activa de inserción",
  /** LGSS art. 363.2. */
  art363_2:
    "Los límites de acumulación de recursos, en el supuesto de unidad económica, serán equivalentes a la cuantía, en cómputo anual, de la pensión, más el resultado de multiplicar el 70 por ciento de dicha cifra por el número de convivientes, menos uno.",
  /** LGSS art. 363.3. */
  art363_3:
    "Cuando la convivencia, dentro de una misma unidad económica, se produzca entre el solicitante y sus descendientes o ascendientes en primer grado, los límites de acumulación de recursos serán equivalentes a dos veces y media la cuantía que resulte de aplicar lo dispuesto en el apartado 2.",
  /** LGSS art. 363.4. */
  art363_4:
    "Existirá unidad económica en todos los casos de convivencia de un beneficiario con otras personas, sean o no beneficiarias, unidas con aquel por matrimonio o por lazos de parentesco de consanguinidad hasta el segundo grado.",
  /** LGSS art. 363.5, first paragraph. */
  art363_5:
    "A efectos de lo establecido en los apartados anteriores, se considerarán como ingresos o rentas computables, cualesquiera bienes y derechos, derivados tanto del trabajo como del capital, así como los de naturaleza prestacional.",
  /** LGSS art. 363.5, third paragraph. */
  art363_5home:
    "Cuando el solicitante o los miembros de la unidad de convivencia en que esté inserto dispongan de bienes muebles o inmuebles, se tendrán en cuenta sus rendimientos efectivos. Si no existen rendimientos efectivos, se valorarán según las normas establecidas para el Impuesto sobre la Renta de las Personas Físicas, con la excepción, en todo caso, de la vivienda habitualmente ocupada por el beneficiario. Tampoco se computarán las asignaciones periódicas por hijos a cargo.",
  /** LGSS art. 364.1, first paragraph. */
  art364_1: "La cuantía de la pensión de incapacidad no contributiva se fijará, en su importe anual, en la correspondiente Ley de Presupuestos Generales del Estado.",
  /** LGSS art. 364.1.a and b. */
  art364_1a: "Al importe referido en el primer párrafo de este apartado se le sumará el 70 por ciento de esa misma cuantía, tantas veces como número de beneficiarios, menos uno, existan en la unidad económica.",
  art364_1b: "La cuantía de la pensión para cada uno de los beneficiarios será igual al cociente de dividir el resultado de la suma prevista en la letra anterior por el número de beneficiarios con derecho a pensión.",
  /** LGSS art. 364.2. */
  art364_2:
    "Las cuantías resultantes de lo establecido en el apartado anterior, calculadas en cómputo anual, son compatibles con las rentas o ingresos anuales de los que, en su caso, disponga cada beneficiario, siempre que los mismos no excedan del 35 por ciento del importe, en cómputo anual, de la pensión no contributiva. En otro caso, se deducirá del importe de dicha pensión la cuantía de las rentas o ingresos que excedan de tal porcentaje, salvo lo dispuesto en el artículo 366.",
  /** LGSS art. 364.3. */
  art364_3:
    "En los casos de convivencia del beneficiario o beneficiarios con personas no beneficiarias, si la suma de los ingresos o rentas anuales de la unidad económica más la pensión o pensiones no contributivas, calculadas conforme a lo dispuesto en los dos apartados anteriores, superara el límite de acumulación de recursos establecidos en los apartados 2 y 3 del artículo anterior, la pensión o pensiones se reducirán para no sobrepasar el mencionado límite, disminuyendo en igual cuantía cada una de las pensiones.",
  /** LGSS art. 364.4. */
  art364_4: "No obstante lo establecido en los apartados 2 y 3 de este artículo, la cuantía de la pensión reconocida será, como mínimo, del 25 por ciento del importe de la pensión a que se refiere el apartado 1.",
  /** LGSS art. 364.6. */
  art364_6:
    "Las personas que, cumpliendo los requisitos señalados en el apartado 1, a), b) y d) del artículo anterior, estén afectadas por una discapacidad o enfermedad crónica en un grado igual o superior al 75 por ciento y que, como consecuencia de pérdidas anatómicas o funcionales, necesiten el concurso de otra persona para realizar los actos más esenciales de la vida, tales como vestirse, desplazarse, comer o análogos, tendrán derecho a un complemento equivalente al 50 por ciento del importe de la pensión a que se refiere el primer párrafo del apartado 1.",
  /** LGSS art. 365. */
  art365: "Los efectos económicos del reconocimiento del derecho a las pensiones de incapacidad no contributiva se producirán a partir del día primero del mes siguiente a aquel en que se presente la solicitud.",
  /** LGSS art. 366, second paragraph. */
  art366:
    "En el caso de personas que con anterioridad al inicio de una actividad lucrativa vinieran percibiendo pensión de invalidez en su modalidad no contributiva, durante los cuatro años siguientes al inicio de la actividad, la suma de la cuantía de la pensión de invalidez y de los ingresos obtenidos por la actividad desarrollada no podrá ser superior, en cómputo anual, al importe, también en cómputo anual, de la suma del indicador público de renta de efectos múltiples, excluidas las pagas extraordinarias y la pensión de incapacidad no contributiva vigentes en cada momento. En caso de exceder de dicha cuantía, se minorará el importe de la pensión en la cuantía que resulte necesaria para no sobrepasar dicho límite. Esta reducción no afectará al complemento previsto en el artículo 364.6.",
  /** LGSS art. 367.3. */
  art367_3:
    "Las pensiones de invalidez pasarán a denominarse pensiones de jubilación cuando sus beneficiarios cumplan la edad de sesenta y cinco años. La nueva denominación no implicará modificación alguna respecto de las condiciones de la prestación que viniesen percibiendo.",
  /** LGSS art. 368. */
  art368:
    "Los perceptores de las pensiones de incapacidad no contributiva estarán obligados a comunicar a la entidad que les abone la prestación cualquier variación de su situación de convivencia, estado civil, residencia y cuantas puedan tener incidencia en la conservación o la cuantía de aquellas.",
  art368b: "En todo caso, el beneficiario deberá presentar, en el primer trimestre de cada año, una declaración de los ingresos de la respectiva unidad económica de la que forme parte, referida al año inmediato precedente.",
  /** LGSS art. 369.1. */
  art369:
    "Tendrán derecho a la pensión de jubilación en su modalidad no contributiva las personas que, habiendo cumplido sesenta y cinco años de edad, carezcan de rentas o ingresos en cuantía superior a los límites establecidos en el artículo 363, residan legalmente en territorio español y lo hayan hecho durante diez años entre la edad de dieciséis años y la edad de devengo de la pensión, de los cuales dos deberán ser consecutivos e inmediatamente anteriores a la solicitud de la prestación.",
  /** LGSS art. 370. */
  art370: "Para la determinación de la cuantía de la pensión de jubilación en su modalidad no contributiva, se estará a lo dispuesto para la pensión de invalidez en el artículo 364.",
  /** LGSS art. 371. */
  art371: "Los efectos económicos del reconocimiento del derecho a la pensión de jubilación en su modalidad no contributiva se producirán a partir del día primero del mes siguiente a aquel en que se presente la solicitud.",
  /** RDL 3/2026 art. 2.5. */
  rdl3: "Las pensiones no contributivas del sistema de la Seguridad Social de incapacidad y jubilación tendrán un importe anual de 8.803,20 euros.",
  /** RD 241/2026 art. 21.1. */
  rd241pnc: "Para el año 2026, la cuantía de las pensiones de jubilación e incapacidad, en su modalidad no contributiva, queda establecida en 8.803,20 euros anuales, conforme al artículo 2 del Real Decreto-ley 3/2026, de 3 de febrero.",
  /** RD 241/2026 art. 21.2, first paragraph. */
  rd241rent:
    "Para el año 2026, tendrá un importe de 525,00 euros anuales el complemento de pensión establecido en favor de la persona pensionista que acredite fehacientemente carecer de vivienda en propiedad y tener, como residencia habitual, una vivienda alquilada cuyo propietario o propietaria no tenga con ella relación de parentesco hasta tercer grado ni sea cónyuge o persona con la que constituya una unión estable y conviva con análoga relación de afectividad a la conyugal. En el caso de unidades familiares en las que convivan varias personas perceptoras de pensiones no contributivas, solo podrá percibir el complemento la persona titular del contrato de alquiler o, de ser varias, la primera de ellas que conste en el contrato de alquiler.",
  /** RD 357/1991 art. 10.2. */
  rd357abs:
    "La residencia continuada anterior a la solicitud de la pensión y la posterior al reconocimiento del derecho no se considerará interrumpida por las ausencias del territorio español inferiores a noventa días a lo largo de cada año natural, así como cuando la ausencia esté motivada por causas de enfermedad debidamente justificadas.",
  /** RD 357/1991 art. 14.1, first paragraph. */
  rd357pay:
    "La cuantía de las pensiones, en su importe anual, será la que se fije en la correspondiente Ley de Presupuestos Generales del Estado. Su pago se fraccionará en catorce pagas correspondientes a cada uno de los meses del año y dos pagas extraordinarias que se devengarán en los meses de junio y noviembre.",
  /** RD 357/1991 art. 14.2 (1991 wording, superseded by LGSS art. 364.2). */
  rd357old: "De las cuantías individuales resultantes de la aplicación de lo establecido en el número anterior, calculadas en cómputo anual, se deducirán, en su caso, las rentas o ingresos anuales computables de que disponga cada beneficiario.",
  /** RD 1191/2012 art. 2.1.b to e. */
  rd1191b: "Carecer de vivienda en propiedad.",
  rd1191c: "Ser titular del contrato de arrendamiento de la vivienda.",
  rd1191d:
    "No tener con el arrendador de la vivienda alquilada relación conyugal o de parentesco, por consanguinidad, afinidad o adopción hasta el tercer grado, ni constituir con aquél una unión estable y de convivencia con análoga relación de afectividad a la conyugal.",
  rd1191e:
    "Tener fijada su residencia, como domicilio habitual, en una vivienda alquilada. Se entenderá que es el domicilio habitual cuando la vigencia del contrato de arrendamiento no sea inferior a un año y el pensionista haya residido en la misma durante los 180 días inmediatamente anteriores.",
  /** RD 1191/2012, disposición adicional única. */
  rd1191income:
    "La cuantía del complemento de pensión reconocido a los perceptores de pensión de jubilación o de invalidez de la Seguridad Social, en su modalidad no contributiva, estará excluida del cómputo de rentas o ingresos a efectos de determinar el mantenimiento del derecho a dicha pensión.",
  /** IMSERSO, "Actualización de las pensiones para 2026". */
  imsersoPay: "quedando el importe anual para el año 2026 en 8.803,20 € anuales, que se abonan en 12 mensualidades más dos pagas extraordinarias al año.",
  /** IMSERSO, "Normativa y requisitos": people outside the unit. */
  imsersoOutside:
    "Las personas que convivan con el solicitante en el mismo domicilio y no estén unidas con el solicitante por matrimonio o por lazos de parentesco de consanguinidad o adopción hasta el segundo grado no se integran en la unidad económica de convivencia y las rentas o ingresos imputables a esas personas no se computan a efectos de acreditar el requisito de carecer de ingresos suficientes.",
  /** IMSERSO, "Dónde solicitar". */
  imsersoManaged:
    "La gestión y reconocimiento del derecho a percibir una Pensión no Contributiva se realiza por las Comunidades Autónomas que tienen transferidas las funciones y servicios del Instituto de Mayores y Servicios Sociales (Imserso). En las ciudades autónomas de Ceuta y de Melilla se hace directamente por el Imserso.",
  /** IMSERSO guide 2026, "Cálculo de las cuantías", 2º. */
  imsersoFree:
    "En el supuesto de que el beneficiario disponga de rentas o ingresos personales superiores al 35 por 100 del importe anual fijado para la pensión no contributiva (3.081,12 €), la cuantía de la pensión señalada en el párrafo anterior se reduce en un importe igual a la cantidad en que los ingresos personales, en cómputo anual, excedan del porcentaje indicado.",
  /** IMSERSO guide 2026, the third-person limits. */
  imsersoThirdLimits:
    "Cuando el solicitante o titular de una pensión de incapacidad no contributiva reúne los requisitos exigidos para causar derecho al complemento por necesidad de tercera persona, los importes del límite de acumulación de recursos aplicable en función del número de personas que integran la unidad económica son los siguientes",
  /** IMSERSO guide 2026, the complement added after the rules. */
  imsersoAfter: "La cuantía obtenida en aplicación de las reglas señaladas en los apartados anteriores se incrementará con el importe del complemento por necesidad de otra persona",
  /** IMSERSO guide 2026, the presumption for gran incapacidad. */
  imsersoPresumption:
    "Igualmente se presumirá que se encuentra afecto de un grado de discapacidad igual al 75% y que necesita el concurso de otra persona para los actos esenciales de la vida a quienes tuvieran reconocida una incapacidad permanente en grado de gran incapacidad.",
  /** IMSERSO leaflet 2026: incompatibilities. */
  imsersoIncompatible: "Las pensiones de jubilación y de incapacidad no contributivas son incompatibles entre sí",
  /** Generalitat, tràmit 512 (Catalan). */
  gencatAmount: "L'import mínim d’aquesta ajuda és de 157,20 € i el màxim de 628,80 €, i es paguen 14 mensualitats l'any.",
  /** Generalitat, tràmit 512: changes, the answer. */
  gencatChanges: "Tens 30 dies per fer-ho des que es produeixi el canvi.",
  gencatAnswer: "El termini màxim per notificar la resolució és de 90 dies. Si passat aquest temps no la reps, considera que la teva sol·licitud ha estat desestimada.",
  /** Generalitat, tràmit 8170. */
  gencatRent: "Es paga en un únic ingrés al mateix número de compte on reps la pensió no contributiva.",
  gencatRentWhen: "La sol·licitud es pot presentar cada any, de l’1 de gener al 31 de desembre.",
  /** Generalitat, tràmit 7282. */
  gencatComplement: "És un complement econòmic per a persones que cobren una pensió no contributiva (PNC) de jubilació o d’incapacitat i no poden treballar.",
  gencatComplementAmount: "L'import màxim és de 119,67 € euros al mes.",
} as const;

/** Where each quote was read, for the verification script (scratchpad) and the page's labels. */
export type QuoteId = keyof typeof QUOTE;
