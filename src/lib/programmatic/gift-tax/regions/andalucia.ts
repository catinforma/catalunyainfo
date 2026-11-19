import { ANDALUCIA_QUOTE, ANDALUCIA_RULES } from "@/lib/programmatic/inheritance-tax/regions/andalucia";

import { RULES_AS_OF, STATE_FIRST_BRACKET, type GiftSource } from "./state";
import type { GiftRules } from "./types";

/**
 * Andalucía: Ley 5/2021, de 20 de octubre, de Tributos Cedidos (in force
 * 01/01/2022), read on 19 Nov 2026 in the BOE's consolidated text
 * (BOE-A-2021-17915, last update published 31/12/2025):
 *  - no general kinship reduction on gifts (base liquidable = base imponible,
 *    Ley 29/1987 art. 20.5);
 *  - art. 32: cash from ascendants to buy the habitual home, 99 % of the base
 *    up to 150.000 € (250.000 € for a disabled donee): donee under 35 (or
 *    disabled, or a victim of domestic violence or terrorism), prior wealth in
 *    the first bracket of Ley 29/1987 art. 22 (402.678,11 €), the whole amount
 *    on a home in Andalucía bought within the self-assessment period, with the
 *    purchase deed stating the gift, kept three years;
 *  - art. 33: the same 99 % when the ascendant gives the home itself (full
 *    ownership), with the deed stating it will be the donee's habitual home;
 *  - art. 34 (cash for a business, 99 % up to 1.000.000 €) and 35-36 (business,
 *    shares): named on the page, not computed;
 *  - arts. 37 and 38: the scale and the coefficients by group only, as for
 *    inheritances;
 *  - art. 40 (wording in force 01/01/2026, Ley 8/2025 DF 9.6): 99 % for groups
 *    I and II on the tax of what is declared spontaneously; a public document
 *    with the asset handed over at once when the gifts from one donor in three
 *    years exceed 5.000 €; cash above 5.000 €: the public document within one
 *    month of the handover and the origin of the funds justified and stated in
 *    it. Until 31/12/2025 the public document was always required;
 *  - art. 68.1: two months from the day after the gift (since 01/01/2022).
 *  - Agencia Tributaria de Andalucía, "Guía del Impuesto sobre Donaciones"
 *    (06/06/2023, before the 2026 change): two worked figures reproduced in
 *    tests/gift-tax.test.ts (100.000 € from father to son: cuota íntegra 12.620
 *    €, 126,20 € to pay; 15.000 € accumulated with 30.000 €: 9,82 %, 14,73 €).
 *    The guide's intermediate rebate line is misprinted (12.291,21 €; 12.493,80
 *    € is 99 % of 12.620 €): its final figure is right, the page quotes that.
 */

export const ANDALUCIA_GIFT_RULES: GiftRules = {
  id: "andalucia",
  calculatorId: "gift-tax-andalucia",
  giftsFrom: "2026-01-01",
  scale: ANDALUCIA_RULES.scale,
  reducedScale: null,
  coefficients: ANDALUCIA_RULES.coefficients,
  excessRule: false,
  kinship: null,
  disability: null,
  home: {
    kinds: ["money", "home"],
    relations: ["child", "grandchild"],
    percent: 99,
    capOn: "base",
    cap: 150_000,
    capDisability: 250_000,
    capDisabilityFrom: 33,
    maxAge: 34,
    ageWaivedFrom: 33,
    priorWealthMax: STATE_FIRST_BRACKET,
    deedAbove: 0,
    deedKinds: ["home"],
  },
  bonus: { smallGiftMax: null, groupsIandII: 99, directRelations: null, groupIII: 0, groupIIIScope: "group", disability: 0, deedAbove: 5_000, fundsOriginAbove: 5_000 },
  reductionsNeedDeed: false,
  deadline: { months: 2 },
  cite: {
    scale: { law: "andalucia", art: "37" },
    reducedScale: null,
    coefficient: { law: "andalucia", art: "38" },
    excess: { law: "lisd", art: "22.2" },
    kinship: null,
    disability: null,
    home: { law: "andalucia", art: "32" },
    bonus: { law: "andalucia", art: "40" },
    smallGift: null,
    deadline: { law: "andalucia", art: "68.1" },
    partners: { law: "andalucia", art: "26" },
  },
};

export const ANDALUCIA_GIFT_DATES = {
  /** Art. 40 as worded by Ley 8/2025 (in force 01/01/2026). */
  consolidatedFrom: "2026-01-01",
  scaleFrom: "2022-01-01",
  /** The 99 % rebate on gifts, as the ATRIAN guide dates it. */
  bonusFirstFrom: "2019-04-11",
  /** The guide read. */
  guideDate: "2023-06-06",
} as const;

const JDA = "https://www.juntadeandalucia.es";

export const ANDALUCIA_GIFT_SOURCES = {
  law: {
    name: "Ley 5/2021, de 20 de octubre, de Tributos Cedidos de la Comunidad Autónoma de Andalucía",
    publisher: "BOE (texto consolidado)",
    ref: "BOJA núm. 206, 26/10/2021; arts. 26, 32 a 40 y 68; última actualización publicada el 31/12/2025",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2021-17915",
    read: RULES_AS_OF,
  },
  ley8_2025: {
    name: "Ley 8/2025, de 22 de diciembre, del Presupuesto de la Comunidad Autónoma de Andalucía para el año 2026",
    publisher: "BOE",
    ref: "BOE-A-2026-945; disposición final novena (art. 40 de la Ley 5/2021 desde el 01/01/2026)",
    url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2026-945",
    read: RULES_AS_OF,
  },
  agency: {
    name: "Impuesto de sucesiones y donaciones: presentación (modelo 651)",
    publisher: "Agencia Tributaria de Andalucía",
    ref: "modelo 651, ayuda del modelo y pago",
    url: `${JDA}/organismos/atrian/areas/declaracion-pagos/presentacion-impuestos/sucesiones-donaciones.html`,
    read: RULES_AS_OF,
  },
  guide: {
    name: "Guía del Impuesto sobre Donaciones",
    publisher: "Agencia Tributaria de Andalucía",
    ref: "guía de 06/06/2023: plazo, reducciones, tarifa, bonificación y acumulación, con ejemplos",
    url: `${JDA}/sites/default/files/2024-08/ATRIAN_20230606_GU%C3%8DADONACIONES.pdf`,
    read: RULES_AS_OF,
  },
  faq: {
    name: "Preguntas frecuentes del impuesto sobre donaciones",
    publisher: "Agencia Tributaria de Andalucía",
    ref: "dónde y cómo presentar, beneficios fiscales, documentación",
    url: `${JDA}/organismos/atrian/areas/informacion-tributaria/impuestos/preguntas-frecuentes/impuestos-donaciones.html`,
    read: RULES_AS_OF,
  },
} as const satisfies Record<string, GiftSource>;

export const ANDALUCIA_GIFT_QUOTE = {
  cashHome:
    "1. Los donatarios que perciban dinero de sus ascendientes, o de las personas equiparadas a éstas de acuerdo con lo establecido en el artículo 26, para la adquisición de su vivienda habitual, podrán aplicar una reducción propia del 99% del importe de la base imponible del impuesto, siempre que concurran los siguientes requisitos:",
  cashHomeWho: "a) Que el donatario cumpla alguna de las siguientes condiciones: 1.ª Ser menor de 35 años. 2.ª Tener la consideración de persona con discapacidad. 3.ª Tener la consideración de víctima de violencia doméstica. 4.ª Tener la consideración de víctima del terrorismo o persona afectada.",
  cashHomePrior: "b) Que el patrimonio preexistente del donatario esté comprendido en el primer tramo de la escala establecida por el artículo 22 de la Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones.",
  cashHomeRest:
    "c) Que el importe íntegro de la donación se destine a la compra de la vivienda habitual. d) La vivienda deberá estar situada en el territorio de la Comunidad Autónoma de Andalucía. e) El donatario ha de mantener la vivienda habitual durante los tres años siguientes a la fecha de su adquisición. f) La adquisición de la vivienda deberá efectuarse dentro del período de autoliquidación del impuesto correspondiente a la donación, debiendo aportar la escritura pública en que se formalice la compraventa. En este documento público deberá hacerse constar la donación recibida y su aplicación al pago del precio de la vivienda habitual.",
  homeCap: "2. La base máxima de la reducción será 150.000 euros, con carácter general. No obstante, cuando el donatario tenga la consideración de persona con discapacidad, la base de la reducción no podrá exceder de 250.000 euros.",
  homeGift:
    "1. Los donatarios que reciban el pleno dominio de un inmueble de sus ascendientes, o de las personas equiparadas a éstos de acuerdo con lo establecido en el artículo 26, podrán aplicar una reducción propia del 99% del importe de la base imponible del impuesto, siempre que concurran los siguientes requisitos:",
  homeGiftDeed: "e) Que se haga constar en la escritura pública en la que se formalice la donación que el inmueble se destine a constituir la vivienda habitual para el donatario y el compromiso de mantenimiento a que se refiere la letra anterior.",
  scale: ANDALUCIA_QUOTE.scale,
  coefficient: ANDALUCIA_QUOTE.coefficient,
  bonus:
    "1. Los contribuyentes incluidos en los Grupos I y II de los previstos en el artículo 20.2.a) de la Ley 29/1987, de 18 de diciembre, del impuesto sobre sucesiones y donaciones, o en los supuestos de equiparaciones establecidos en el artículo 26, aplicarán una bonificación del 99% en la cuota tributaria derivada de adquisiciones inter vivos.",
  bonusDeclared:
    "2. La bonificación a que se refiere el apartado anterior será aplicable, exclusivamente, sobre la parte de la cuota que proporcionalmente corresponda a los bienes y derechos declarados por el sujeto pasivo de forma espontánea, sin requerimiento previo de la Administración tributaria, y quedará sujeta a los siguientes requisitos:",
  bonusDocument:
    "a) En relación con aquellos elementos patrimoniales cuyas transmisiones no requieran para su eficacia el otorgamiento de documento público, el negocio jurídico a título gratuito e inter vivos deberá formalizarse en documento público, con la entrega simultánea del bien, cuando la base imponible del impuesto sea superior a 5.000 euros o su contravalor en moneda extranjera.",
  bonusCash:
    "b) Cuando el objeto de la donación o de cualquier otro negocio jurídico a título gratuito e inter vivos sea en metálico o cualquiera de los bienes o derechos contemplados en el artículo 12 de la Ley 19/1991, de 6 de junio, del impuesto sobre el patrimonio y la base imponible del impuesto sea superior a 5.000 euros o su contravalor en moneda extranjera, el documento público deberá formalizarse en el plazo máximo de un mes desde que se produjo la entrega y la bonificación solo resultará aplicable cuando el origen de los fondos esté debidamente justificado, y se manifieste el origen de dichos fondos en el propio documento público en que se formalice la transmisión.",
  bonusBefore2026:
    "Será requisito necesario para la aplicación de esta bonificación que la donación o cualquier otro negocio jurídico a título gratuito e inter vivos se formalice en documento público con la entrega simultánea del bien. Cuando el objeto de la transmisión sea metálico, el documento público deberá formalizarse en el plazo máximo de un mes desde que se produjo la entrega.",
  partners: ANDALUCIA_QUOTE.partners,
  deadline:
    "1. Con carácter general, para los hechos imponibles sujetos a la modalidad de donaciones del impuesto sobre sucesiones y donaciones, el plazo de presentación de la autoliquidación e ingreso, en su caso, de la deuda tributaria, junto con la documentación exigida en la normativa aplicable, será de dos meses a contar desde el día siguiente a la fecha del devengo.",
  guideDeadline: "el plazo de presentación de la autoliquidación y demás documentación requerida es de dos meses desde el día siguiente a aquel en que se cause el acto o contrato, sin que exista la posibilidad de prórroga",
  guideExample:
    "Ejemplo: El 4 de mayo de 2023, don José, residente en Madrid, hace una donación a su hijo Miguel de 30 años y residente en Sevilla, donde trabaja, de 100.000 euros, la cual formalizan en escritura pública, donde han justificado el origen de los fondos.",
  guideExampleResult: "Cuota íntegra: 12.620 euros",
  guideExamplePay: "= 126,2 euros",
  guideAccumulation: "CT= 15.000 euros x9,82% = 1473 euros",
  guideAccumulationPay: "Es de aplicación la bonificación del 99%, por lo que la cuota Líquida: 1473- 1473*0,99= 14,73 euros.",
  guideBonusFrom: "A partir del 11 de abril de 2019, se contempla una bonificación del 99 % de la cuota tributaria en adquisiciones “inter vivos”",
} as const;
