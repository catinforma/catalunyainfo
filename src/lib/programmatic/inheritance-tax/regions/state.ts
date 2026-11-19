/**
 * The state rules the three communities' calculators lean on where a
 * community has none of its own (Ley 29/1987 del Impuesto sobre Sucesiones y
 * Donaciones, art. 20.2), the filing deadline (Real Decreto 1629/1991, arts.
 * 67-68) and which community taxes an inheritance (Ley 22/2009, arts. 28 and
 * 32), each in the words of the BOE's consolidated text.
 *
 * Read on 19 Nov 2026 with curl + grep: Ley 29/1987 (BOE-A-1987-28141, last
 * update published 28/12/2022: art. 20 in its 2002 wording, arts. 21 and 22
 * from 2002), RD 1629/1991 (BOE-A-1991-27678, last update 05/04/2023),
 * Ley 22/2009 (BOE-A-2009-20375, last update 29/07/2022).
 *
 * A test fails from RULES_UNTIL: re-read the three communities' texts and
 * these articles, then move both dates.
 */

export const RULES_AS_OF = "2026-11-19";
/** From this day a test fails: the communities' budget and fiscal-measures laws usually change this tax from 1 January. */
export const RULES_UNTIL = "2027-01-01";

export interface Source {
  name: string;
  publisher: string;
  ref: string;
  url: string;
  /** A Catalan- or Valencian-language edition, for the ca page, when the publisher has one. */
  urlCa?: string;
  read: string;
}

export const STATE_SOURCES = {
  lisd: {
    name: "Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones",
    publisher: "BOE",
    ref: "BOE-A-1987-28141, arts. 20, 21 y 22 (texto consolidado, última actualización 28/12/2022)",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-1987-28141",
    read: RULES_AS_OF,
  },
  risd: {
    name: "Real Decreto 1629/1991, de 8 de noviembre, Reglamento del Impuesto sobre Sucesiones y Donaciones",
    publisher: "BOE",
    ref: "BOE-A-1991-27678, arts. 39, 67 y 68",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-1991-27678",
    read: RULES_AS_OF,
  },
  lofca: {
    name: "Ley 22/2009, de 18 de diciembre, del sistema de financiación de las Comunidades Autónomas de régimen común",
    publisher: "BOE",
    ref: "BOE-A-2009-20375, arts. 28, 32 y 48",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2009-20375",
    read: RULES_AS_OF,
  },
} as const satisfies Record<string, Source>;

/** Art. 20.2.a: the state group III reduction, which applies where a community has none of its own (Valencia). */
export const STATE_GROUP_III = 7_993.46;
/** Art. 20.2.b: 100 % of life insurance up to this, for the spouse, ascendants and descendants of the policyholder. */
export const STATE_INSURANCE_MAX = 9_195.49;
/** Art. 20.2.c: the habitual-home reduction's limit per taxpayer (Andalucía raises the percentage to 99 %, not the limit). */
export const STATE_HOME_CAP = 122_606.47;

/** RD 1629/1991 arts. 67.1.a and 68: six months from the death; six more if asked within the first five. */
export const DEADLINE = { months: 6, extensionMonths: 6, askWithinMonths: 5 } as const;

/** The BOE's words. Tests check every figure the calculators use appears in its quote. */
export const STATE_QUOTE = {
  order: "Estas reducciones se practicarán por el siguiente orden: en primer lugar, las del Estado y, a continuación, las de las Comunidades Autónomas.",
  groupIII: "Grupo III: adquisiciones por colaterales de segundo y tercer grado, ascendientes y descendientes por afinidad, 7.993,46 euros.",
  groupIV: "Grupo IV: en las adquisiciones por colaterales de cuarto grado, grados más distantes y extraños, no habrá lugar a reducción.",
  insurance:
    "b) Con independencia de las reducciones anteriores, se aplicará una reducción del 100 por ciento, con un límite de 9.195,49 euros, a las cantidades percibidas por los beneficiarios de contratos de seguros sobre vida, cuando su parentesco con el contratante fallecido sea de cónyuge, ascendiente, descendiente, adoptante o adoptado.",
  insuranceOnce: "La reducción será única por sujeto pasivo cualquiera que fuese el número de contratos de seguros de vida de los que sea beneficiario",
  home: 'Del mismo porcentaje de reducción, con el límite de 122.606,47 euros para cada sujeto pasivo y con el requisito de permanencia señalado anteriormente, gozarán las adquisiciones "mortis causa" de la vivienda habitual de la persona fallecida, siempre que los causahabientes sean cónyuge, ascendientes o descendientes de aquél, o bien pariente colateral mayor de sesenta y cinco años que hubiese convivido con el causante durante los dos años anteriores al fallecimiento.',
  excess:
    "Cuando la diferencia entre la cuota tributaria obtenida por la aplicación del coeficiente multiplicador que corresponda y la que resultaría de aplicar a la misma cuota íntegra el coeficiente multiplicador inmediato inferior sea mayor que la que exista entre el importe del patrimonio preexistente tenido en cuenta para la liquidación y el importe máximo del tramo de patrimonio preexistente que motivaría la aplicación del citado coeficiente multiplicador inferior, aquélla se reducirá en el importe del exceso.",
  insuranceAccumulates:
    "Estas cantidades se acumularán al valor de los bienes y derechos que integren la porción hereditaria del beneficiario cuando el causante sea, a su vez, el contratante del seguro individual o el asegurado en el seguro colectivo.",
  deadline:
    "a) Cuando se trate de adquisiciones por causa de muerte, incluidas las de los beneficiarios de contratos de seguro de vida, en el de seis meses, contados desde el día del fallecimiento del causante o desde aquel en que adquiera firmeza la declaración de fallecimiento.",
  extension: "2. La solicitud de prórroga se presentará por los herederos, albaceas o administradores del caudal relicto dentro de los cinco primeros meses del plazo de presentación",
  residence:
    "1.º Cuando permanezcan en su territorio un mayor número de días: […] b) Del período de los cinco años inmediatos anteriores, contados de fecha a fecha, que finalice el día anterior al de devengo, en el Impuesto sobre Sucesiones y Donaciones.",
  connection:
    "a) En el caso del impuesto que grava las adquisiciones ``mortis causa´´ y las cantidades percibidas por los beneficiarios de seguros sobre la vida que se acumulen al resto de bienes y derechos que integran la porción hereditaria del beneficiario, en el territorio donde el causante tenga su residencia habitual a la fecha del devengo.",
  improved: "Si la actividad de la Comunidad Autónoma consistiese en mejorar una reducción estatal, la reducción mejorada sustituirá, en esa Comunidad Autónoma, a la reducción estatal.",
} as const;
