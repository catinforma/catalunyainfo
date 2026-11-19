import { RULES_AS_OF, type Source } from "./state";
import type { RegionRules } from "./types";

/**
 * Comunidad de Madrid: Decreto Legislativo 1/2010, de 21 de octubre, texto
 * refundido de las disposiciones legales de la Comunidad de Madrid en materia
 * de tributos cedidos por el Estado (BOCM núm. 255, 25/10/2010).
 *
 * Read on 19 Nov 2026 in the BOE's consolidated text (BOCM-m-2010-90068, last
 * update published 10/07/2026):
 *  - art. 21.Uno (reductions, replacing the state's art. 20.2): wording in
 *    force since 01/07/2026 (Ley 3/2026, de 30 de junio, de Apoyo a la Empresa
 *    Familiar, art. único.2); the figures did not change (the 2024 wording has
 *    the same 16.000 / 48.000 / 8.000 / 55.000 / 153.000 / 9.200 / 123.000).
 *  - art. 23 (scale) and art. 24 (coefficients and excess rule): original
 *    text, in force since 26/10/2010.
 *  - art. 25.1 (rebate): 99 % groups I and II, 50 % group III, wording in
 *    force since 01/07/2025 (Ley 2/2025, de 25 de junio). From 28/10/2022 to
 *    30/06/2025 (Ley 7/2022): 25 % only for blood collaterals of the second
 *    and third degree.
 *  - art. 26: registered uniones de hecho count as spouses (wording since
 *    30/12/2023).
 *  - comunidad.madrid "Impuesto de Sucesiones" (updated 01/07/2026): same
 *    figures, the deadline, and the one worked figure it prints (a son's
 *    cuota íntegra of 1.250 € leaves 12,50 € to pay). Madrid publishes no
 *    simulator: the Oficina Virtual Tributaria works the tax out inside the
 *    self-assessment.
 */

export const MADRID_RULES: RegionRules = {
  id: "madrid",
  calculatorId: "inheritance-tax-madrid",
  deathsFrom: "2025-07-01",
  kinship: { groupI: { base: 16_000, perYear: 4_000, max: 48_000 }, groupII: 16_000, groupIII: 8_000, groupIIIOrigin: "region" },
  disability: { from33: 55_000, from65: 153_000, mentalFrom33As65: false },
  insurance: { max: 9_200, origin: "region" },
  home: { percent: 95, capPerHeir: 123_000, capOrigin: "region", keepYears: 5 },
  scale: [
    { from: 0, quota: 0, rate: 7.65 },
    { from: 8_313.2, quota: 635.96, rate: 8.5 },
    { from: 16_001.35, quota: 1_289.45, rate: 9.35 },
    { from: 24_002.01, quota: 2_037.51, rate: 10.2 },
    { from: 32_002.7, quota: 2_853.58, rate: 11.05 },
    { from: 40_003.36, quota: 3_737.66, rate: 11.9 },
    { from: 48_004.04, quota: 4_689.74, rate: 12.75 },
    { from: 56_004.71, quota: 5_709.82, rate: 13.6 },
    { from: 64_005.39, quota: 6_797.92, rate: 14.45 },
    { from: 72_006.05, quota: 7_954.01, rate: 15.3 },
    { from: 80_006.73, quota: 9_178.12, rate: 16.15 },
    { from: 119_947.58, quota: 15_628.56, rate: 18.7 },
    { from: 159_888.45, quota: 23_097.51, rate: 21.25 },
    { from: 239_770.16, quota: 40_072.37, rate: 25.5 },
    { from: 399_408.59, quota: 80_780.17, rate: 29.75 },
    { from: 798_817.2, quota: 199_604.23, rate: 34 },
  ],
  coefficients: [
    { upTo: 403_000, groupsIandII: 1, groupIII: 1.5882, groupIV: 2 },
    { upTo: 2_008_000, groupsIandII: 1.05, groupIII: 1.6676, groupIV: 2.1 },
    { upTo: 4_021_000, groupsIandII: 1.1, groupIII: 1.7471, groupIV: 2.2 },
    { upTo: null, groupsIandII: 1.2, groupIII: 1.9059, groupIV: 2.4 },
  ],
  excessRule: true,
  bonus: { groupsIandII: 99, groupIII: 50, groupIIIScope: "group", disability: 0 },
  cite: {
    kinship: { law: "madrid", art: "21.Uno.1" },
    groupIII: { law: "madrid", art: "21.Uno.1" },
    disability: { law: "madrid", art: "21.Uno.2" },
    insurance: { law: "madrid", art: "21.Uno.3" },
    home: { law: "madrid", art: "21.Uno.4" },
    scale: { law: "madrid", art: "23" },
    coefficient: { law: "madrid", art: "24.1" },
    excess: { law: "madrid", art: "24.2" },
    bonus: { law: "madrid", art: "25.1" },
    partners: { law: "madrid", art: "26" },
  },
};

/** The dates the page prints next to each table. */
export const MADRID_DATES = {
  /** The consolidated text read (art. 21, Ley 3/2026). */
  consolidatedFrom: "2026-07-01",
  /** Arts. 23 and 24: the texto refundido's own wording. */
  scaleFrom: "2010-10-26",
  /** Art. 25.1: 99 % groups I-II and 50 % group III (Ley 2/2025). */
  bonusFrom: "2025-07-01",
  /** Ley 7/2022: 25 % for blood collaterals, deaths 28/10/2022 to 30/06/2025. */
  previousGroupIIIFrom: "2022-10-28",
  previousGroupIIIUntil: "2025-06-30",
  /** The agency page's "Última actualización". */
  agencyPageUpdated: "2026-07-01",
} as const;

const BOE = "https://www.boe.es/buscar/act.php?id=BOCM-m-2010-90068";
const CM = "https://www.comunidad.madrid";

export const MADRID_SOURCES = {
  law: {
    name: "Decreto Legislativo 1/2010, de 21 de octubre, del Consejo de Gobierno, por el que se aprueba el Texto Refundido de las Disposiciones Legales de la Comunidad de Madrid en materia de tributos cedidos por el Estado",
    publisher: "BOE (texto consolidado)",
    ref: "BOCM núm. 255, 25/10/2010; arts. 21 a 26, última actualización publicada el 10/07/2026",
    url: BOE,
    read: RULES_AS_OF,
  },
  ley2_2025: {
    name: "Ley 2/2025, de 25 de junio, de la Comunidad de Madrid (bonificación del grupo III en el Impuesto sobre Sucesiones y Donaciones)",
    publisher: "BOE",
    ref: "BOE-A-2025-19345; art. 25.1 en vigor desde el 01/07/2025",
    url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2025-19345",
    read: RULES_AS_OF,
  },
  ley3_2026: {
    name: "Ley 3/2026, de 30 de junio, de Apoyo a la Empresa Familiar (Comunidad de Madrid)",
    publisher: "BOE",
    ref: "BOE-A-2026-16019; art. 21 en vigor desde el 01/07/2026",
    url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2026-16019",
    read: RULES_AS_OF,
  },
  agency: {
    name: "Impuesto de Sucesiones",
    publisher: "Comunidad de Madrid, atención al contribuyente",
    ref: "reducciones, bonificaciones, plazo y presentación; última actualización 01/07/2026",
    url: `${CM}/servicios/atencion-contribuyente/impuesto-sucesiones`,
    read: RULES_AS_OF,
  },
  office: {
    name: "Oficina Virtual Tributaria (autoliquidación del modelo 650)",
    publisher: "Comunidad de Madrid",
    ref: "modelo 650, presentación y pago",
    url: `${CM}/atencion-contribuyente/oficina-virtual-tributaria`,
    read: RULES_AS_OF,
  },
} as const satisfies Record<string, Source>;

/** The words of the law and of the Comunidad de Madrid's page. Tests check every figure appears in its quote. */
export const MADRID_QUOTE = {
  kinshipLead:
    "En las adquisiciones mortis causa, incluidas las de los beneficiarios de pólizas de seguros sobre la vida, la base liquidable se obtendrá aplicando a la base imponible las reducciones siguientes, que sustituyen a las análogas del Estado reguladas en el artículo 20.2 de la Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones:",
  groupI: "Grupo I: Adquisiciones por descendientes y adoptados menores de veintiún años, 16.000 euros, más 4.000 euros por cada año menos de veintiuno que tenga el causahabiente, sin que la reducción pueda exceder de 48.000 euros.",
  groupII: "Grupo II: Adquisiciones por descendientes y adoptados de veintiuno o más años, cónyuges, ascendientes y adoptantes, 16.000 euros.",
  groupIII: "Grupo III: Adquisiciones por colaterales de segundo y tercer grado, ascendientes y descendientes por afinidad, 8.000 euros.",
  groupIV: "Grupo IV: En las adquisiciones por colaterales de cuarto grado, grados más distantes y extraños, no habrá lugar a reducción.",
  disability:
    "2. Se aplicará, además de las que pudieran corresponder en función del grado de parentesco con el causante, una reducción de 55.000 euros a las personas con un grado de discapacidad igual o superior al 33 por 100. La reducción será de 153.000 euros para aquellas personas que acrediten un grado de discapacidad igual o superior al 65 por 100.",
  insurance:
    "3. Con independencia de las reducciones anteriores, se aplicará una reducción del 100 por 100, con un límite de 9.200 euros, a las cantidades percibidas por los beneficiarios de contratos de seguros sobre la vida cuando su parentesco con el contratante fallecido sea el de cónyuge, ascendiente, descendiente, adoptante o adoptado.",
  home: "4. En los casos en los que en la base imponible de una adquisición mortis causa que corresponda a los cónyuges, ascendientes o adoptantes, descendientes o adoptados de la persona fallecida, o bien pariente colateral mayor de sesenta y cinco años que hubiese convivido con el causante durante los dos años anteriores al fallecimiento, estuviese incluida la vivienda habitual de la persona fallecida para obtener la base liquidable se aplicará en la base imponible, una reducción del 95 por 100 con el límite de 123.000 euros para cada sujeto, siempre que la adquisición se mantenga, durante los cinco años siguientes al fallecimiento del causante, salvo que falleciese el adquirente dentro de este plazo.",
  scale: "La tarifa prevista en el artículo 21.1 de la Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones, será la siguiente:",
  coefficient:
    "1. La cuota tributaria prevista en el artículo 22.1 de la Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones, se obtendrá aplicando a la cuota íntegra el coeficiente multiplicador en función de la cuantía del patrimonio preexistente y de los grupos de parentesco siguientes:",
  excess:
    "2. Cuando la diferencia entre la cuota tributaria obtenida por aplicación del coeficiente multiplicador que corresponda y la que resultaría de aplicar a la misma cuota íntegra el coeficiente multiplicador inmediato inferior sea mayor que la que exista entre el importe del patrimonio preexistente tenido en cuenta para la liquidación y el importe máximo del tramo del patrimonio preexistente que motivaría la aplicación del citado coeficiente multiplicador inferior, aquella se reducirá en el importe del exceso.",
  bonusGroupsIandII:
    "Los sujetos pasivos incluidos en los grupos I y II de los previstos en el artículo 20.2.a) de la Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones, aplicarán una bonificación del 99 por ciento en la cuota tributaria derivada de adquisiciones mortis causa y de cantidades percibidas por beneficiarios de seguros sobre la vida que se acumulen al resto de bienes y derechos que integren la porción hereditaria del beneficiario.",
  bonusGroupIII:
    "Los sujetos pasivos incluidos en el grupo III de los previstos en el artículo 20.2.a) indicado en el párrafo anterior, aplicarán una bonificación del 50 por ciento, de la cuota tributaria derivada de las mismas adquisiciones a que se refiere el párrafo anterior. La bonificación a que se refiere este párrafo será aplicable, exclusivamente, sobre la parte de la cuota que proporcionalmente corresponda a los bienes y derechos declarados por el sujeto pasivo, considerándose como tales a los que se encuentren incluidos de forma completa en una autoliquidación o declaración presentada dentro del plazo voluntario o fuera de este sin que se haya efectuado un requerimiento previo de la Administración tributaria.",
  partners:
    "1. A efectos de la aplicación de lo dispuesto en este capítulo, se asimilarán a cónyuges los miembros de uniones de hecho que cumplan los requisitos establecidos en la Ley 11/2001, de 19 de diciembre, de Uniones de Hecho de la Comunidad de Madrid y se encuentren inscritas en el Registro de Uniones de Hecho de la Comunidad de Madrid o en registros análogos existentes en otras Administraciones públicas, dentro o fuera del ámbito español.",
  minors: "2. Asimismo, se asimilan a descendientes y adoptados a los menores vinculados al transmitente por razón de tutela o acogimiento familiar en los términos previstos en la legislación civil aplicable.",
  agencyExample:
    "Ejemplo: Por el fallecimiento de su madre, Juan tiene que presentar la liquidación del Impuesto sobre Sucesiones en la Comunidad de Madrid. Hechos los cálculos oportunos le sale una cuota íntegra de 1.250 € y aplicandose la bonificación del 99 por 100, deberá ingresar 12,50 € (el 1 por 100 de 1.250 €).",
  agencyGroupIII:
    "En los fallecimientos que se produzcan a partir del 1 de julio de 2025, cuando los herederos sean colaterales de 2º y 3º grado, ascendientes y descendientes por afinidad (hermanos, tíos, sobrinos, yerno, nuera....) se aplicará una bonificación del 50% de la cuota tributaria.",
  agencyGroupIIIBefore:
    "En los fallecimientos que se hayan producido desde el 28 de octubre de 2022 hasta el 30 de junio de 2025, cuando los herederos sean colaterales de 2º ó 3º grado por consanguinidad del causante (hermanos, tíos y sobrinos) se aplicará una bonificación del 25% de la cuota tributaria.",
  agencyDeadline: "El plazo de presentación es de seis meses contados desde el día del fallecimiento del causante o desde aquél en que adquiera firmeza la declaración de fallecimiento.",
  agencyExtension:
    "Este plazo podrá ampliarse, por seis meses más, siempre que se solicite la prórroga para la presentación de la liquidación del Impuesto sobre Sucesiones. Será necesario que la solicitud de prórroga se presente antes de que transcurran los cinco primeros meses del plazo de presentación.",
} as const;
