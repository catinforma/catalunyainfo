import { MADRID_QUOTE, MADRID_RULES } from "@/lib/programmatic/inheritance-tax/regions/madrid";

import { RULES_AS_OF, type GiftSource } from "./state";
import type { GiftRules } from "./types";

/**
 * Comunidad de Madrid: Decreto Legislativo 1/2010, de 21 de octubre (texto
 * refundido de tributos cedidos), read on 19 Nov 2026 in the BOE's
 * consolidated text (BOCM-m-2010-90068, last update published 10/07/2026):
 *  - no kinship reduction on gifts: art. 21 is for inheritances, so the base
 *    liquidable is the base imponible (Ley 29/1987 art. 20.5);
 *  - art. 22 bis (wording in force 01/07/2025, Ley 2/2025; title reworded by
 *    Ley 3/2026): cash to groups I and II or a sibling, spent within a year on
 *    the habitual home (or on new shares or a business, not computed here),
 *    100 % up to 250.000 € counting three years of gifts from the same donor;
 *    the destination stated in the document; a public document above 10.000 €;
 *  - art. 22.Tres and Cuatro: 99 % for a business or shares given from
 *    01/07/2026 (Ley 3/2026) — named on the page, not computed;
 *  - arts. 23 and 24: the scale and coefficients the inheritance calculator
 *    uses (they apply to both);
 *  - art. 25.2 (wording in force 01/07/2025, Ley 2/2025, as corrected in BOCM
 *    08/07/2025): 100 % when the gifts from one donor in three years add up to
 *    1.000 € or less (no self-assessment, except registrable assets); 99 %
 *    groups I and II; 50 % group III; a public document above 10.000 € (three
 *    years); cash only with the origin of the funds justified and stated in
 *    the document. From 28/10/2022 to 30/06/2025 (Ley 7/2022): 99 % I-II only
 *    in a public document, 25 % for blood siblings, uncles and nephews.
 *  - no deadline of its own: the state's 30 working days (RD 1629/1991 art.
 *    67.1.b), as the Comunidad de Madrid's "Donaciones" page says.
 *  - comunidad.madrid "Donaciones" (updated 01/07/2026): the deadline, which
 *    community taxes a gift, the bonuses, the cash reduction, and two worked
 *    figures reproduced in tests/gift-tax.test.ts (a 200.000 € home from
 *    father to son: cuota 31.621,21 €, 316,21 € to pay; a 10.000 € garage
 *    accumulated with a 235.000 € flat: 16,9 %, 16,90 € to pay).
 */

export const MADRID_GIFT_RULES: GiftRules = {
  id: "madrid",
  calculatorId: "gift-tax-madrid",
  giftsFrom: "2025-07-01",
  scale: MADRID_RULES.scale,
  reducedScale: null,
  coefficients: MADRID_RULES.coefficients,
  excessRule: true,
  kinship: null,
  disability: null,
  home: {
    kinds: ["money"],
    relations: ["spouse", "child", "grandchild", "parent", "grandparent", "sibling"],
    percent: 100,
    capOn: "reduction",
    cap: 250_000,
    capDisability: 250_000,
    capDisabilityFrom: null,
    maxAge: null,
    ageWaivedFrom: null,
    priorWealthMax: null,
    deedAbove: 10_000,
    deedKinds: ["money"],
  },
  bonus: { smallGiftMax: 1_000, groupsIandII: 99, directRelations: null, groupIII: 50, groupIIIScope: "group", disability: 0, deedAbove: 10_000, fundsOriginAbove: 0 },
  reductionsNeedDeed: false,
  deadline: { workingDays: 30 },
  cite: {
    scale: { law: "madrid", art: "23" },
    reducedScale: null,
    coefficient: { law: "madrid", art: "24.1" },
    excess: { law: "madrid", art: "24.2" },
    kinship: null,
    disability: null,
    home: { law: "madrid", art: "22 bis" },
    bonus: { law: "madrid", art: "25.2.b" },
    smallGift: { law: "madrid", art: "25.2.a" },
    deadline: { law: "risd", art: "67.1.b" },
    partners: { law: "madrid", art: "26" },
  },
};

export const MADRID_GIFT_DATES = {
  /** The consolidated text read (arts. 22 and 22 bis title, Ley 3/2026). */
  consolidatedFrom: "2026-07-01",
  /** Arts. 23 and 24. */
  scaleFrom: "2010-10-26",
  /** Art. 25.2 and 22 bis, Ley 2/2025. */
  bonusFrom: "2025-07-01",
  /** Ley 7/2022: 25 % for blood siblings, uncles and nephews, gifts 28/10/2022 to 30/06/2025. */
  previousGroupIIIFrom: "2022-10-28",
  previousGroupIIIUntil: "2025-06-30",
  /** Art. 22 bis was added by Ley 6/2018 for gifts from this day. */
  cashReductionFrom: "2019-01-01",
  /** The agency page's "Última actualización". */
  agencyPageUpdated: "2026-07-01",
} as const;

const BOE = "https://www.boe.es/buscar/act.php?id=BOCM-m-2010-90068";
const CM = "https://www.comunidad.madrid";

export const MADRID_GIFT_SOURCES = {
  law: {
    name: "Decreto Legislativo 1/2010, de 21 de octubre, del Consejo de Gobierno, por el que se aprueba el Texto Refundido de las Disposiciones Legales de la Comunidad de Madrid en materia de tributos cedidos por el Estado",
    publisher: "BOE (texto consolidado)",
    ref: "BOCM núm. 255, 25/10/2010; arts. 22, 22 bis, 23 a 26, última actualización publicada el 10/07/2026",
    url: BOE,
    read: RULES_AS_OF,
  },
  ley2_2025: {
    name: "Ley 2/2025, de 25 de junio, por la que se modifica el texto refundido de las disposiciones legales de la Comunidad de Madrid en materia de tributos cedidos por el Estado, aprobado por Decreto Legislativo 1/2010, de 21 de octubre, del Consejo de Gobierno, para incrementar la bonificación aplicable a los parientes incluidos en el Grupo III de parentesco en el Impuesto sobre Sucesiones y Donaciones y simplificar los requisitos de acceso a los beneficios fiscales en el Impuesto sobre Donaciones",
    publisher: "BOE",
    ref: "BOE-A-2025-19345; arts. 22 bis y 25.2 en vigor desde el 01/07/2025",
    url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2025-19345",
    read: RULES_AS_OF,
  },
  agency: {
    name: "Donaciones",
    publisher: "Comunidad de Madrid, atención al contribuyente",
    ref: "plazo, competencia, bonificaciones, reducciones, acumulación y ejemplos; última actualización 01/07/2026",
    url: `${CM}/atencion-contribuyente/donaciones`,
    read: RULES_AS_OF,
  },
  office: {
    name: "Oficina Virtual Tributaria (autoliquidación del modelo 651)",
    publisher: "Comunidad de Madrid",
    ref: "modelo 651, presentación y pago",
    url: `${CM}/atencion-contribuyente/oficina-virtual`,
    read: RULES_AS_OF,
  },
} as const satisfies Record<string, GiftSource>;

/** The words of the law and of the Comunidad de Madrid's page. Tests check every figure appears in its quote. */
export const MADRID_GIFT_QUOTE = {
  cash: "1. En las donaciones en metálico que cumplan los requisitos establecidos en el presente apartado y en los dos siguientes, en las que el donatario esté incluido en los grupos I o II de parentesco de los previstos en el artículo 20.2.a) de la Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones, o sea un colateral de segundo grado por consanguinidad del donante, se podrá aplicar una reducción del 100 por cien de la donación recibida, con el límite máximo de 250.000 euros.",
  cashPurpose: "2. La reducción prevista en el apartado anterior se aplicará sobre las donaciones en metálico en las que el importe donado se destine por el donatario, en el plazo de un año desde la donación, a uno de los siguientes fines: a) La adquisición de una vivienda que tenga la consideración de habitual.",
  cashDocument:
    "3. En el documento en que se formalice la donación deberá manifestarse el destino de las cantidades donadas. Será requisito necesario para la aplicación de esta reducción que la donación se formalice en documento público cuando su base imponible sea superior a 10.000 euros o su contravalor en moneda extranjera. A estos efectos, se computarán todas las donaciones efectuadas por el mismo donante al mismo donatario en los tres años anteriores al momento del devengo.",
  smallGift:
    "a) Los sujetos pasivos que realicen adquisiciones lucrativas inter vivos procedentes de personas físicas cuya base imponible no supere los 1.000 euros aplicarán una bonificación del 100 por cien de la cuota tributaria derivada de las mismas.",
  smallGiftNoFiling:
    "Los contribuyentes que apliquen esta bonificación no estarán obligados a presentar autoliquidación por el impuesto. No obstante, mantendrán la obligación de presentar la autoliquidación los adquirentes de bienes que deban ser objeto de inscripción en cualquier registro público.",
  bonusGroupsIandII:
    "b) En las adquisiciones inter vivos, los sujetos pasivos incluidos en los grupos I y II de parentesco de los previstos en el artículo 20.2.a) de la Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones, aplicarán una bonificación del 99 por ciento en la cuota tributaria derivada de las mismas.",
  bonusGroupIII:
    "Los sujetos pasivos incluidos en el grupo III de los previstos en el artículo 20.2.a) indicado en el párrafo anterior aplicarán una bonificación del 50 por ciento en la cuota tributaria derivada de las mismas adquisiciones a que se refiere el párrafo anterior.",
  fundsOrigin:
    "Cuando el negocio jurídico gratuito e inter vivos sea en metálico o en cualquiera de los bienes o derechos contemplados en el artículo 12 de la Ley 19/1991, de 6 de junio, del Impuesto sobre el Patrimonio, la bonificación solo resultará aplicable cuando el origen de los fondos donados esté debidamente justificado, siempre que, además, se haya manifestado en el propio documento en que se formalice la transmisión el origen de dichos fondos.",
  publicDocument:
    "Será requisito necesario para la aplicación de estas bonificaciones previstas en el apartado 2.b), en relación a los elementos patrimoniales cuyas transmisiones a título gratuito no requieren para su eficacia el otorgamiento de documento público, que el negocio jurídico gratuito e inter vivos se formalice en documento público cuando su base imponible sea superior a 10.000 euros o su contravalor en moneda extranjera. A estos efectos, se computarán todos los negocios jurídicos gratuitos e inter vivos efectuados por el mismo donante al mismo donatario en los tres años anteriores al momento del devengo.",
  lateDeed:
    "En los supuestos de elevación a público de documentos privados que documenten la adquisición, no serán aplicables las bonificaciones previstas en este apartado 2.b) cuando la formalización en documento público se realice con posterioridad a la finalización del correspondiente periodo voluntario de declaración",
  scale: MADRID_QUOTE.scale,
  coefficient: MADRID_QUOTE.coefficient,
  excess: MADRID_QUOTE.excess,
  partners: MADRID_QUOTE.partners,
  agencyDeadline: "El plazo de presentación es de 30 días hábiles a contar desde el día siguiente a aquel en que se cause el acto o contrato gravado. No se contarán sábados, domingos ni festivos.",
  agencyTwoDonors: "En el caso de que tus padres te donen una vivienda, tendrás que cumplimentar dos autoliquidaciones, una por cada uno, ya que se trata de dos donantes.",
  agencyCompetence:
    "Se presentarán en la Comunidad de Madrid las donaciones de bienes inmuebles que estén situados en esta Comunidad. Las donaciones del resto de bienes y derechos tributarán en la Comunidad de Madrid cuando el donatario (persona que recibe los bienes y derechos) tenga su domicilio fiscal, durante el mayor tiempo en los últimos cinco años anteriores a la donación, en esta Comunidad.",
  agencyExample:
    "Ejemplo: Un padre dona a su hijo un inmueble, ubicado en la Comunidad de Madrid, cuyo valor es de 200.000 €. El hijo, que es quién recibe la donación, tiene que liquidar el Impuesto sobre Donaciones. Realizados los cálculos oportunos, le saldría una cuota tributaria de 31.621,21 € y aplicándose la bonificación que tiene regulada la Comunidad de Madrid desde el 01/01/2006 solo pagaría 316,21 € (el 1 por 100 de 31.621,21 €)",
  agencyAccumulation:
    "Así si un padre donó a su hijo un piso de valor real 235.000 €, hace un año, y ahora le quiere donar una plaza de garaje de valor real 10.000 €, para determinar la cuota tributaria de esta última donación no podrán aplicar la tarifa del impuesto.",
  agencyAccumulationResult:
    "Al ser la donación de un inmueble ubicado en la Comunidad de Madrid y la donación, formalizada en escritura pública, es de un padre a su hijo, sobre la cuota íntegra se aplicaría la bonificación del 99 %, saliendo un importe a ingresar de 16,90 € (el 1% de 1.690 €).",
  agencyAccumulationRate: "Tipo medio = 41.405,98/ 245.000 = 16,9 %",
  agencyGroupIIIBefore:
    "Las donaciones que se hayan formalizado en documento público produzcan desde el 28 de octubre de 2022 hasta el 30 de junio de 2025 entre hermanos, tíos y sobrinos se aplicará una bonificación del 25 % de la cuota tributaria.",
} as const;
