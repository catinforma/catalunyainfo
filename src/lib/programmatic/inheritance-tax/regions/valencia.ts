import { RULES_AS_OF, STATE_GROUP_III, STATE_INSURANCE_MAX, type Source } from "./state";
import type { RegionRules } from "./types";

/**
 * Comunitat Valenciana: Ley 13/1997, de 23 de diciembre, por la que se regula
 * el tramo autonómico del IRPF y restantes tributos cedidos (DOGV núm. 3153,
 * 31/12/1997; BOE núm. 83, 07/04/1998).
 *
 * Read on 19 Nov 2026 in the BOE's consolidated text (BOE-A-1998-8202, last
 * update published 10/08/2026):
 *  - art. 10.1 (kinship, disability and home reductions "análogas a las
 *    aprobadas por el Estado"): wording in force since 11/08/2026 (Ley 5/2026,
 *    de 31 de julio, art. 20), the same figures as before (100.000 + 8.000 per
 *    year up to 156.000; 100.000; 120.000 / 240.000; 95 % up to 150.000).
 *  - art. 10.1 regulates groups I and II only and no life-insurance
 *    reduction, so groups III and IV and life insurance keep the state's
 *    (Ley 29/1987 art. 20.2.a and b: 7.993,46 € and 9.195,49 €), as the
 *    Agència Tributària Valenciana's form 650 instructions say (casillas 111
 *    and 114: the state group I-II reduction is not applied when the deceased
 *    lived in the Comunitat Valenciana, the group III one is listed). Those
 *    instructions are written to the law of 1 January 2017; art. 10.1 has had
 *    the same structure since (only groups I and II).
 *  - art. 11 (scale) and art. 12 (coefficients): Ley 7/2023, in force since
 *    01/01/2024. The excess-of-quota adjustment of Ley 29/1987 art. 22.2 is
 *    applied by the ATV (instructions, apartado Q).
 *  - art. 12 bis (rebates): 99 % for groups I and II (deaths since 28/05/2023,
 *    Ley 6/2023); 99 % for heirs with a disability of 65 % or more, or an
 *    intellectual or mental one of 33 % or more (any group); 25 % for blood
 *    collaterals of the second and third degree of group III, for deaths
 *    since 01/06/2026 (Ley 5/2025, disposición transitoria segunda), and 50 %
 *    from 01/06/2027 (Ley 5/2025, disposición final cuarta, as reworded by Ley
 *    5/2026, art. 25). All on the part of the tax for assets declared on time.
 *  - art. 12 ter (six months) and 12 quáter (registered partners = spouses).
 *  - atv.gva.es "Quiero declarar una herencia": deadline, extension, scale and
 *    coefficients; the ATV publishes value simulators (property, vehicles), no
 *    simulator for the tax itself; form 650 has an online help program.
 */

export const VALENCIA_RULES: RegionRules = {
  id: "valencia",
  calculatorId: "inheritance-tax-valencia",
  deathsFrom: "2026-06-01",
  kinship: { groupI: { base: 100_000, perYear: 8_000, max: 156_000 }, groupII: 100_000, groupIII: STATE_GROUP_III, groupIIIOrigin: "state" },
  disability: { from33: 120_000, from65: 240_000, mentalFrom33As65: true },
  insurance: { max: STATE_INSURANCE_MAX, origin: "state" },
  home: { percent: 95, capPerHeir: 150_000, capOrigin: "region", keepYears: 5 },
  scale: [
    { from: 0, quota: 0, rate: 7.65 },
    { from: 7_993.46, quota: 611.5, rate: 8.5 },
    { from: 15_662.38, quota: 1_263.36, rate: 9.35 },
    { from: 23_493.56, quota: 1_995.58, rate: 10.2 },
    { from: 31_324.75, quota: 2_794.36, rate: 11.05 },
    { from: 39_155.94, quota: 3_659.7, rate: 11.9 },
    { from: 46_987.13, quota: 4_591.61, rate: 12.75 },
    { from: 54_818.31, quota: 5_590.09, rate: 13.6 },
    { from: 62_649.5, quota: 6_655.13, rate: 14.45 },
    { from: 70_480.69, quota: 7_786.74, rate: 15.3 },
    { from: 78_311.88, quota: 8_984.91, rate: 16.15 },
    { from: 117_407.71, quota: 15_298.89, rate: 18.7 },
    { from: 156_503.55, quota: 22_609.81, rate: 21.25 },
    { from: 234_695.23, quota: 39_225.54, rate: 25.5 },
    { from: 390_958.37, quota: 79_072.64, rate: 29.75 },
    { from: 781_916.75, quota: 195_382.76, rate: 34 },
  ],
  coefficients: [
    { upTo: 390_657.87, groupsIandII: 1, groupIII: 1.5882, groupIV: 2 },
    { upTo: 1_965_309.58, groupsIandII: 1.05, groupIII: 1.6676, groupIV: 2.1 },
    { upTo: 3_936_629.28, groupsIandII: 1.1, groupIII: 1.7471, groupIV: 2.2 },
    { upTo: null, groupsIandII: 1.2, groupIII: 1.9059, groupIV: 2.4 },
  ],
  excessRule: true,
  bonus: { groupsIandII: 99, groupIII: 25, groupIIIScope: "blood-collaterals", disability: 99 },
  cite: {
    kinship: { law: "valencia", art: "10.1.a" },
    groupIII: { law: "lisd", art: "20.2.a" },
    disability: { law: "valencia", art: "10.1.b" },
    insurance: { law: "lisd", art: "20.2.b" },
    home: { law: "valencia", art: "10.1.c" },
    scale: { law: "valencia", art: "11" },
    coefficient: { law: "valencia", art: "12" },
    excess: { law: "lisd", art: "22.2" },
    bonus: { law: "valencia", art: "12 bis" },
    partners: { law: "valencia", art: "12 quáter" },
  },
};

export const VALENCIA_DATES = {
  /** Art. 10 as worded by Ley 5/2026 (published DOGV 10/08/2026). */
  consolidatedFrom: "2026-08-11",
  /** Arts. 11 and 12 (Ley 7/2023). */
  scaleFrom: "2024-01-01",
  /** Art. 12 bis.1.a: 99 % groups I and II (Ley 6/2023). */
  bonusFrom: "2023-05-28",
  /** Art. 12 bis.2: 25 % blood collaterals (Ley 5/2025 DT 2ª). */
  groupIIIBonusFrom: "2026-06-01",
  /** 50 % from this day (Ley 5/2025 DF 4ª, wording of Ley 5/2026 art. 25). */
  groupIIIBonusNextFrom: "2027-06-01",
  groupIIIBonusNext: 50,
  /** The ATV's form 650 instructions follow the law in force on this day. */
  atvInstructionsLaw: "2017-01-01",
} as const;

const ATV = "https://atv.gva.es";

export const VALENCIA_SOURCES = {
  law: {
    name: "Ley 13/1997, de 23 de diciembre, por la que se regula el tramo autonómico del Impuesto sobre la Renta de las Personas Físicas y restantes tributos cedidos",
    publisher: "BOE (texto consolidado)",
    ref: "DOGV núm. 3153, 31/12/1997; arts. 10, 11, 12, 12 bis a 12 quáter; última actualización publicada el 10/08/2026",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-1998-8202",
    read: RULES_AS_OF,
  },
  ley5_2025: {
    name: "Ley 5/2025, de 30 de mayo, de medidas fiscales, de gestión administrativa y financiera, y de organización de la Generalitat",
    publisher: "BOE",
    ref: "BOE-A-2025-11959; disposición transitoria segunda (25 % del grupo III desde el 01/06/2026) y disposición final cuarta (50 % desde el 01/06/2027)",
    url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2025-11959",
    read: RULES_AS_OF,
  },
  ley5_2026: {
    name: "Ley 5/2026, de 31 de julio, de medidas fiscales, de gestión administrativa y financiera, y de organización de la Generalitat",
    publisher: "BOE",
    ref: "BOE-A-2026-19331; arts. 20, 22 y 25 (DOGV núm. 10425, 10/08/2026)",
    url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2026-19331",
    read: RULES_AS_OF,
  },
  agency: {
    name: "Quiero declarar una herencia",
    publisher: "Agència Tributària Valenciana",
    ref: "plazo, prórroga, tarifa, coeficientes y documentación",
    url: `${ATV}/es/vull-declarar-una-herencia`,
    urlCa: `${ATV}/va/vull-declarar-una-herencia`,
    read: RULES_AS_OF,
  },
  model650: {
    name: "Modelo 650 (programa de ayuda y presentación)",
    publisher: "Agència Tributària Valenciana",
    ref: "programa de ayuda en línea y pasos para presentar",
    url: `${ATV}/es/model-650`,
    urlCa: `${ATV}/va/model-650`,
    read: RULES_AS_OF,
  },
  instructions: {
    name: "Instrucciones del modelo 650 (adquisiciones mortis causa)",
    publisher: "Generalitat Valenciana",
    ref: "elaboradas con arreglo a la legislación vigente a 1 de enero de 2017: casillas 111 (grupo III), 114 (seguros) y apartado Q (exceso de cuota)",
    url: "https://www.gva.es/downloads/publicados/PR/650instrucciones.pdf",
    urlCa: "https://www.gva.es/downloads/publicados/PR/650instruccions_v.pdf",
    read: RULES_AS_OF,
  },
} as const satisfies Record<string, Source>;

export const VALENCIA_QUOTE = {
  lead: "1. Con el carácter de reducciones análogas a las aprobadas por el Estado con la misma finalidad:",
  groupI: "– Grupo I: adquisiciones por descendientes y adoptados menores de 21 años, 100.000 euros, más 8.000 euros por cada año menos de 21 que tenga el causahabiente, sin que la reducción pueda exceder de 156.000 euros.",
  groupII: "– Grupo II: adquisiciones por descendientes y adoptados de 21 o más años, cónyuges, ascendientes y adoptantes, 100.000 euros.",
  disability:
    "b) En las adquisiciones por personas con un grado de discapacidad igual o superior al 33 por 100, se aplicará una reducción de 120.000 euros, además de la que pudiera corresponder en función del grado de parentesco con el causante. En las adquisiciones por personas con un grado de discapacidad igual o superior al 65 por 100, o un grado de discapacidad intelectual o mental reconocido de manera permanente igual o superior al 33 por 100, la reducción antes citada será de 240.000 euros.",
  home: "c) En las adquisiciones de la vivienda habitual del causante, se aplicará, con el límite de 150.000 euros para cada sujeto pasivo, una reducción del 95 por 100 del valor de dicha vivienda, siempre que los causahabientes sean el cónyuge, ascendientes o descendientes de aquel, o bien pariente colateral mayor de sesenta y cinco años de edad que hubiese convivido con el causante durante los dos años anteriores al fallecimiento, y que la adquisición se mantenga durante los cinco años siguientes al fallecimiento del causante, salvo que falleciera el adquirente dentro de ese plazo.",
  scale: "La cuota íntegra se obtendrá aplicando a la base liquidable la siguiente escala:",
  coefficient:
    "La cuota tributaria se obtendrá aplicando a la cuota íntegra el coeficiente multiplicador que corresponda de entre los que se indican a continuación, establecidos en función del patrimonio preexistente del contribuyente y del grupo, según el grado de parentesco, señalado en el artículo 20, de la Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones:",
  bonusGroupsIandII:
    "1. Gozarán de una bonificación del 99 por 100 sobre la parte de la cuota tributaria del impuesto sobre sucesiones y donaciones que proporcionalmente corresponda a los bienes y derechos declarados por el sujeto pasivo: a) Las adquisiciones mortis causa efectuadas por parientes del causante pertenecientes a los grupos I y II del artículo 20.2.a de la Ley 29/1987, de 18 de diciembre, del impuesto sobre sucesiones y donaciones.",
  bonusDisability:
    "c) Las adquisiciones mortis causa e inter vivos realizadas por personas con un grado de discapacidad igual o superior al 65 por 100, o un grado de discapacidad intelectual o mental reconocido de manera permanente igual o superior al 33 por 100. La aplicación de esta bonificación excluirá las de las letras a y b.",
  bonusGroupIII:
    "2. Gozarán de una bonificación del 25 por 100 sobre la parte de la cuota tributaria del Impuesto sobre Sucesiones y Donaciones que proporcionalmente corresponda a los bienes y derechos declarados por el sujeto pasivo: a) Las adquisiciones mortis causa efectuadas por parientes colaterales de segundo o tercer grado por consanguinidad del causante pertenecientes al grupo III del artículo 20.2.a de la Ley 29/1987, de 18 de diciembre, del impuesto sobre sucesiones y donaciones.",
  bonusGroupIIIFrom:
    "Con efectos desde el 1 de junio de 2026, el artículo 12 bis de la Ley 13/1997, de 23 de diciembre, por la que se regula el tramo autonómico del impuesto sobre la renta de las personas físicas y restantes tributos cedidos, tendrá la siguiente redacción:",
  bonusGroupIIINext:
    "2. Gozarán de una bonificación del 50 por 100 sobre la parte de la cuota tributaria del Impuesto sobre Sucesiones y Donaciones que proporcionalmente corresponda a los bienes y derechos declarados por el sujeto pasivo:",
  bonusGroupIIINextFrom:
    "Con efectos desde el 1 de junio de 2027, el artículo 12 bis de la Ley 13/1997, de 23 de diciembre, por la que se regula el tramo autonómico del Impuesto sobre la Renta de las Personas Físicas y restantes tributos cedidos, tendrá la siguiente redacción:",
  declared:
    "Para determinar la proporción de la cuota tributaria que corresponde a los bienes declarados por el sujeto pasivo se tendrá en cuenta la relación entre aquella base liquidable que correspondería a los bienes y derechos declarados por el sujeto pasivo y la base liquidable que corresponda a la totalidad de los adquiridos.",
  deadline:
    "a) Cuando se trate de adquisiciones por causa de muerte, incluidas las de los beneficiarios de contratos de seguro de vida, en el de seis meses, contados desde el día del fallecimiento del causante o desde aquel en que adquiera firmeza la declaración de su fallecimiento.",
  partners:
    "Se asimilan a cónyuges los miembros de parejas de hecho cuya unión cumpla los requisitos establecidos en la Ley 5/2012, de 15 de octubre, de la Generalitat, de uniones de hecho formalizadas de la Comunitat Valenciana, y se encuentren inscritas en el Registro de Uniones de Hecho Formalizadas de la Comunitat Valenciana o registros análogos establecidos por otras administraciones públicas del Estado español, de países pertenecientes a la Unión Europea o el Espacio Económico Europeo, o de terceros países.",
  atvStateReduction:
    "NOTA IMPORTANTE: La reducción establecida para los Grupos I y II de parentesco no se aplicará cuando el causante tenga su residencia habitual en la Comunitat Valenciana a la fecha del devengo del Impuesto, al ser de aplicación en estos casos la reducción autonómica recogida en la casilla 178.",
  atvGroupIII: "• Grupo III. Adquisiciones por colaterales de segundo y tercer grado, ascendientes y descendientes por afinidad: 7.993,46 euros.",
  atvInsurance:
    "En estos casos resulta aplicable una reducción del 100 por 100, con un límite de 9.195,49 euros (importe aplicable a devengos producidos a partir del 1 de enero de 2004) a las cantidades percibidas por los beneficiarios de contratos de seguros sobre la vida, cuando su parentesco con el contratante fallecido sea de cónyuge o pareja de hecho, ascendiente, descendiente, adoptante o adoptado.",
  atvExcess: "El ajuste de la cuota sólo se practicará en la medida en que 158 menos 159 sea positivo.",
  atvInstructionsLaw: "Estas instrucciones están elaboradas con arreglo a la legislación vigente a 1 de enero de 2017",
  atvExtension:
    "Durante los 5 primeros meses desde el fallecimiento se puede solicitar una prórroga del plazo de presentación por otros 6 meses más, de forma tal que el plazo de presentación es de 12 meses desde el fallecimiento, pero con la obligación de abonar los intereses de demora por el plazo prorrogado.",
} as const;
