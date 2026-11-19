import { VALENCIA_QUOTE, VALENCIA_RULES } from "@/lib/programmatic/inheritance-tax/regions/valencia";

import { RULES_AS_OF, type GiftSource } from "./state";
import type { GiftRules } from "./types";

/**
 * Comunitat Valenciana: Ley 13/1997, de 23 de diciembre (tramo autonómico del
 * IRPF y restantes tributos cedidos), read on 19 Nov 2026 in the BOE's
 * consolidated text (BOE-A-1998-8202, last update published 10/08/2026):
 *  - art. 10 bis.2.a (wording in force 11/08/2026, Ley 5/2026 art. 21; the
 *    amounts since 28/05/2023, Ley 6/2023): children and grandchildren under
 *    21, 100.000 € plus 8.000 € a year under 21, at most 156.000 €; children
 *    and grandchildren from 21, the spouse, parents and grandparents, 100.000
 *    €; the limits count every gift from the same donor in the five years
 *    before. Until 27/05/2023 the donee's prior wealth had to be 600.000 € or
 *    less, the spouse had none, and grandchildren and grandparents only when
 *    the parent in between had died.
 *  - art. 10 bis.2.b: 240.000 € for a donee with a 65 % disability, or an
 *    intellectual or mental one of 33 % permanently recognised, whoever the
 *    donor; 120.000 € with 33 % for the spouse, parents, children,
 *    grandchildren and grandparents; added to the kinship one.
 *  - the reductions and the rebates need a public document (or the gift put in
 *    one within the filing period); up to 4.000 € in cash or a private vehicle
 *    in three years, documents signed digitally through a qualified trust
 *    service will do; cash also needs the origin of the funds justified and
 *    stated, with the means of handover (arts. 10 bis.2 and 12 bis.4).
 *  - arts. 11 and 12: the scale and coefficients (01/01/2024), as for
 *    inheritances; the excess-of-quota adjustment of Ley 29/1987 art. 22.2.
 *  - art. 12 bis (wording in force 11/08/2026, Ley 5/2026 art. 22): 99 % for
 *    gifts to the spouse, parents, children, grandchildren and grandparents
 *    (since 28/05/2023, Ley 6/2023; none before); 99 % for a donee with the
 *    disabilities above, excluding the other two; 25 % for blood siblings,
 *    nephews, nieces, uncles and aunts (since 01/06/2026, Ley 5/2025 DT 2ª),
 *    50 % from 01/06/2027 (Ley 5/2025 DF 4ª as reworded by Ley 5/2026 art. 25).
 *  - art. 12 ter.Uno.b: one month from the day of the gift (since 06/08/2013).
 *  - atv.gva.es "Quiero declarar una donación": the month, no extension for
 *    gifts, form 651 through the Oficina Virtual and its help program, the
 *    documents. No simulator of the tax itself.
 */

export const VALENCIA_GIFT_RULES: GiftRules = {
  id: "valencia",
  calculatorId: "gift-tax-valencia",
  giftsFrom: "2026-08-11",
  scale: VALENCIA_RULES.scale,
  reducedScale: null,
  coefficients: VALENCIA_RULES.coefficients,
  excessRule: true,
  kinship: { under21: { base: 100_000, perYear: 8_000, max: 156_000 }, adult: 100_000, relations: ["spouse", "child", "grandchild", "parent", "grandparent"] },
  disability: { from65: 240_000, from33: 120_000, from33Relations: ["spouse", "child", "grandchild", "parent", "grandparent"], mentalFrom33As65: true },
  home: null,
  bonus: {
    smallGiftMax: null,
    groupsIandII: 99,
    directRelations: ["spouse", "child", "grandchild", "parent", "grandparent"],
    groupIII: 25,
    groupIIIScope: "blood-collaterals",
    disability: 99,
    deedAbove: 0,
    fundsOriginAbove: 0,
  },
  reductionsNeedDeed: true,
  deadline: { months: 1 },
  cite: {
    scale: { law: "valencia", art: "11" },
    reducedScale: null,
    coefficient: { law: "valencia", art: "12" },
    excess: { law: "lisd", art: "22.2" },
    kinship: { law: "valencia", art: "10 bis.2.a" },
    disability: { law: "valencia", art: "10 bis.2.b" },
    home: null,
    bonus: { law: "valencia", art: "12 bis" },
    smallGift: null,
    deadline: { law: "valencia", art: "12 ter" },
    partners: { law: "valencia", art: "12 quáter" },
  },
};

export const VALENCIA_GIFT_DATES = {
  /** Arts. 10 bis and 12 bis as worded by Ley 5/2026 (published DOGV 10/08/2026). */
  consolidatedFrom: "2026-08-11",
  /** Arts. 11 and 12 (Ley 7/2023). */
  scaleFrom: "2024-01-01",
  /** Ley 6/2023: the 99 % on gifts and today's kinship reductions, for gifts from this day. */
  bonusFrom: "2023-05-28",
  /** Art. 12 bis.2.b: 25 % blood collaterals (Ley 5/2025 DT 2ª). */
  groupIIIBonusFrom: "2026-06-01",
  /** 50 % from this day (Ley 5/2025 DF 4ª, wording of Ley 5/2026 art. 25). */
  groupIIIBonusNextFrom: "2027-06-01",
  groupIIIBonusNext: 50,
  /** Art. 12 ter. */
  deadlineFrom: "2013-08-06",
} as const;

const ATV = "https://atv.gva.es";

export const VALENCIA_GIFT_SOURCES = {
  law: {
    name: "Ley 13/1997, de 23 de diciembre, por la que se regula el tramo autonómico del Impuesto sobre la Renta de las Personas Físicas y restantes tributos cedidos",
    publisher: "BOE (texto consolidado)",
    ref: "DOGV núm. 3153, 31/12/1997; arts. 10 bis, 11, 12, 12 bis a 12 quáter; última actualización publicada el 10/08/2026",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-1998-8202",
    read: RULES_AS_OF,
  },
  ley5_2026: {
    name: "Ley 5/2026, de 31 de julio, de medidas fiscales, de gestión administrativa y financiera, y de organización de la Generalitat",
    publisher: "BOE",
    ref: "BOE-A-2026-19331; arts. 21, 22 y 25 (DOGV núm. 10425, 10/08/2026)",
    url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2026-19331",
    read: RULES_AS_OF,
  },
  ley6_2023: {
    name: "Ley 6/2023, de 22 de noviembre, de modificación de la Ley 13/1997, de 23 de diciembre, por la que se regula el tramo autonómico del Impuesto sobre la Renta de las Personas Físicas y restantes tributos cedidos, por lo que se refiere al Impuesto de Sucesiones y Donaciones",
    publisher: "BOE",
    ref: "BOE-A-2023-26466; arts. 1 y 2, para los hechos imponibles devengados desde el 28/05/2023",
    url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2023-26466",
    read: RULES_AS_OF,
  },
  agency: {
    name: "Quiero declarar una donación",
    publisher: "Agència Tributària Valenciana",
    ref: "modelo 651, plazo, documentación, base, tarifa y coeficientes",
    url: `${ATV}/es/vull-declarar-una-donacio`,
    urlCa: `${ATV}/va/vull-declarar-una-donacio`,
    read: RULES_AS_OF,
  },
  model651: {
    name: "Modelo 651 (programa de ayuda y presentación)",
    publisher: "Agència Tributària Valenciana",
    ref: "programa de ayuda, pago y presentación",
    url: `${ATV}/es/model-651`,
    urlCa: `${ATV}/va/model-651`,
    read: RULES_AS_OF,
  },
} as const satisfies Record<string, GiftSource>;

export const VALENCIA_GIFT_QUOTE = {
  kinshipLead:
    "2. Por circunstancias propias de la Comunitat Valenciana, y sin perjuicio de la aplicación de la reducción prevista en el apartado 7 del artículo 20 de la Ley 29/1987, de 18 de diciembre, del impuesto sobre sucesiones y donaciones, y de las demás reducciones reguladas en las leyes especiales: a) La que corresponda de las siguientes:",
  kinship:
    "– Adquisiciones por hijos o adoptados menores de 21 años: 100.000 euros, más 8.000 euros por cada año menos de 21 que tenga el donatario, sin que la reducción pueda exceder de 156.000 euros. – Adquisiciones por hijos o adoptados de 21 o más años, por el cónyuge, padres o adoptantes: 100.000 euros. – Adquisiciones por nietos menores de 21 años: 100.000 euros, más 8.000 euros por cada año menos de 21 que tenga el nieto, sin que, en este último caso, la reducción pueda exceder de 156.000 euros. – Adquisiciones por nietos de 21 o más años: 100.000 euros. – Adquisiciones por abuelos: 100.000 euros.",
  kinshipFiveYears: "A los efectos de los citados límites de reducción, se tendrá en cuenta la totalidad de las adquisiciones lucrativas inter vivos provenientes del mismo donante efectuadas en los cinco años inmediatamente anteriores al momento del devengo.",
  disability:
    "b) En las adquisiciones por personas con un grado de discapacidad igual o superior al 65 por 100; o un grado de discapacidad intelectual o mental reconocido de manera permanente igual o superior al 33 por 100, se aplicará una reducción a la base imponible de 240.000 euros. Cuando la adquisición se efectúe por personas con un grado de discapacidad igual o superior al 33 por 100, que sean el cónyuge, padres, adoptantes, hijos o adoptados, nietos y abuelos del donante, se aplicará una reducción de 120.000 euros.",
  reductionsDocument: "Para la aplicación de las reducciones contenidas en las letras a y b de este apartado se exigirá, además, que la adquisición se efectúe en documento público, o que se formalice de este modo dentro del plazo de declaración del impuesto.",
  smallDigital:
    "No obstante, en las donaciones dinerarias o de medios de transporte inscritos o matriculados en el Registro Nacional de Vehículos de la Dirección General de Tráfico, destinados exclusivamente a uso particular, cuando el valor de lo donado, en la misma o distintas entregas entre el mismo donante y donatario realizadas dentro de los tres años anteriores a la fecha de devengo, no exceda de 4.000 euros o su valor en divisas equivalente, y siempre que la validez o eficacia del negocio jurídico no exija lo contrario, podrá suplirse el instrumento público mediante la aportación de documentos firmados digitalmente a través de un servicio de confianza cualificado de los previstos en el Reglamento (UE) 910/2014, del Parlamento Europeo y del Consejo, de 23 de julio de 2014, relativo a la identificación electrónica y los servicios de confianza para las transacciones electrónicas en el mercado interior.",
  reductionsFunds:
    "En todo caso, cuando los bienes donados consistan en metálico o en cualquiera de los contemplados en el artículo 12 de la Ley 19/1991, de 6 de junio, del impuesto sobre el patrimonio, la reducción solo resultará aplicable cuando el origen de los fondos esté debidamente justificado, siempre que, además, en el documento en el que se formalice la operación se haya manifestado el origen de dichos fondos y se identifiquen los medios efectivos en virtud de los cuales se produzca la entrega de lo donado.",
  scale: VALENCIA_QUOTE.scale,
  coefficient: VALENCIA_QUOTE.coefficient,
  bonusLead: "1. Gozarán de una bonificación del 99 por 100 sobre la parte de la cuota tributaria del impuesto sobre sucesiones y donaciones que proporcionalmente corresponda a los bienes y derechos declarados por el sujeto pasivo:",
  bonusDirect: "b) Las adquisiciones inter vivos efectuadas por el cónyuge, padres, adoptantes, hijos o adoptados del donante. Igual bonificación resultará aplicable a los nietos y a los abuelos.",
  bonusDisability:
    "c) Las adquisiciones mortis causa e inter vivos realizadas por personas con un grado de discapacidad igual o superior al 65 por 100, o un grado de discapacidad intelectual o mental reconocido de manera permanente igual o superior al 33 por 100. La aplicación de esta bonificación excluirá las de las letras a y b.",
  bonusGroupIIILead: "2. Gozarán de una bonificación del 25 por 100 sobre la parte de la cuota tributaria del Impuesto sobre Sucesiones y Donaciones que proporcionalmente corresponda a los bienes y derechos declarados por el sujeto pasivo:",
  bonusGroupIII: "b) Las adquisiciones inter vivos efectuadas por los parientes colaterales consanguíneos de segundo y tercer grado del donante pertenecientes al grupo III del artículo 20.2.a de la Ley 29/1987, de 18 de diciembre, del impuesto sobre sucesiones y donaciones.",
  bonusDocument: "4. En las adquisiciones inter vivos, para la aplicación de las anteriores bonificaciones se exigirá, además, que la adquisición se efectúe en documento público, o que se formalice de este modo dentro del plazo de declaración del impuesto.",
  bonusFunds:
    "En todo caso, cuando los bienes donados consistan en metálico o en cualquiera de los contemplados en el artículo 12 de la Ley 19/1991, de 6 de junio, del Impuesto sobre el Patrimonio, la bonificación solo resultará aplicable cuando el origen de los fondos esté debidamente justificado, siempre que, además, en el documento en el que se formalice la operación se haya manifestado el origen de dichos fondos y se identifiquen los medios efectivos en virtud de los cuales se produzca la entrega de lo donado.",
  bonusGroupIIINextFrom: VALENCIA_QUOTE.bonusGroupIIINextFrom,
  bonusGroupIIINext: VALENCIA_QUOTE.bonusGroupIIINext,
  declared: VALENCIA_QUOTE.declared,
  partners: VALENCIA_QUOTE.partners,
  deadline: "b) En los demás supuestos, en el de un mes, contado desde el día en que se cause el acto o contrato.",
  atvDeadline: "Un mes contado desde el día en que tenga lugar el acto o contrato de donación.",
  atvNoExtension: "Recuerde que la opción de solicitar prórroga en el plazo de presentación únicamente es posible en el supuesto de herencias, no en el de donaciones.",
  atvForm: "Deberá presentar un modelo 651 siguiendo los pasos que se indican en la Oficina Virtual.",
} as const;
