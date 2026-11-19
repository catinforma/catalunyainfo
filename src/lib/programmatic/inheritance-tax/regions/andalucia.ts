import { RULES_AS_OF, STATE_HOME_CAP, STATE_INSURANCE_MAX, type Source } from "./state";
import type { RegionRules } from "./types";

/**
 * Andalucía: Ley 5/2021, de 20 de octubre, de Tributos Cedidos de la
 * Comunidad Autónoma de Andalucía (BOJA núm. 206, 26/10/2021; BOE núm. 263,
 * 03/11/2021), in force since 1 January 2022 (disposición final segunda). It
 * replaced the Decreto Legislativo 1/2018, whose consolidated text the BOE
 * marks as no longer in force.
 *
 * Read on 19 Nov 2026 in the BOE's consolidated text (BOE-A-2021-17915, last
 * update published 31/12/2025): arts. 26 (equiparaciones), 27 (home: 99 %),
 * 28 (kinship: 1.000.000 € groups I and II, 10.000 € group III), 29
 * (disability: 250.000 / 500.000 €), 37 (scale), 38 (coefficients by group
 * only) and 39 (99 % rebate, groups I and II) carry no amendment since 2022.
 * Ley 8/2025 (2026 budget) touched only the donations and ITP deadlines (arts.
 * 68-69). The Andalusian laws 1/2026 to 4/2026 do not cite Ley 5/2021.
 *
 * Where Andalucía only raised the percentage, the state limits stay: the home
 * reduction keeps the 122.606,47 € per taxpayer of Ley 29/1987 art. 20.2.c,
 * and the life insurance one the state's 9.195,49 € (the Agencia Tributaria de
 * Andalucía's guide, 14/06/2023, sections 6º, 11º and 12º). Its old simulator
 * domain (simuladorimpuestosucesiones.es) is now a parked page: no official
 * simulator.
 */

export const ANDALUCIA_RULES: RegionRules = {
  id: "andalucia",
  calculatorId: "inheritance-tax-andalucia",
  deathsFrom: "2022-01-01",
  kinship: { groupI: { base: 1_000_000, perYear: 0, max: 1_000_000 }, groupII: 1_000_000, groupIII: 10_000, groupIIIOrigin: "region" },
  disability: { from33: 250_000, from65: 500_000, mentalFrom33As65: false },
  insurance: { max: STATE_INSURANCE_MAX, origin: "state" },
  home: { percent: 99, capPerHeir: STATE_HOME_CAP, capOrigin: "state", keepYears: 3 },
  scale: [
    { from: 0, quota: 0, rate: 7 },
    { from: 8_000, quota: 560, rate: 8 },
    { from: 15_000, quota: 1_120, rate: 10 },
    { from: 30_000, quota: 2_620, rate: 12 },
    { from: 50_000, quota: 5_020, rate: 14 },
    { from: 70_000, quota: 7_820, rate: 16 },
    { from: 100_000, quota: 12_620, rate: 18 },
    { from: 150_000, quota: 21_620, rate: 20 },
    { from: 200_000, quota: 31_620, rate: 22 },
    { from: 400_000, quota: 75_620, rate: 24 },
    { from: 800_000, quota: 171_620, rate: 26 },
  ],
  coefficients: [{ upTo: null, groupsIandII: 1, groupIII: 1.5, groupIV: 1.9 }],
  excessRule: false,
  bonus: { groupsIandII: 99, groupIII: 0, groupIIIScope: "group", disability: 0 },
  cite: {
    kinship: { law: "andalucia", art: "28" },
    groupIII: { law: "andalucia", art: "28.1.c" },
    disability: { law: "andalucia", art: "29" },
    insurance: { law: "lisd", art: "20.2.b" },
    home: { law: "andalucia", art: "27" },
    scale: { law: "andalucia", art: "37" },
    coefficient: { law: "andalucia", art: "38" },
    excess: { law: "lisd", art: "22.2" },
    bonus: { law: "andalucia", art: "39" },
    partners: { law: "andalucia", art: "26" },
  },
};

export const ANDALUCIA_DATES = {
  /** Ley 5/2021 in force (arts. 26-29 and 37-39 unchanged since). */
  consolidatedFrom: "2022-01-01",
  scaleFrom: "2022-01-01",
  bonusFrom: "2022-01-01",
  /** The Agencia Tributaria de Andalucía's guide to the tax. */
  guideDate: "2023-06-14",
} as const;

const JDA = "https://www.juntadeandalucia.es";

export const ANDALUCIA_SOURCES = {
  law: {
    name: "Ley 5/2021, de 20 de octubre, de Tributos Cedidos de la Comunidad Autónoma de Andalucía",
    publisher: "BOE (texto consolidado)",
    ref: "BOJA núm. 206, 26/10/2021; arts. 26 a 29 y 37 a 39, en vigor desde el 01/01/2022; última actualización publicada el 31/12/2025",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2021-17915",
    read: RULES_AS_OF,
  },
  boja: {
    name: "Ley 5/2021, de 20 de octubre, de Tributos Cedidos de la Comunidad Autónoma de Andalucía (texto publicado)",
    publisher: "Boletín Oficial de la Junta de Andalucía",
    ref: "BOJA núm. 206, de 26 de octubre de 2021",
    url: `${JDA}/boja/2021/206/1`,
    read: RULES_AS_OF,
  },
  agency: {
    name: "Impuesto de sucesiones y donaciones: presentación (modelos 650 y 660)",
    publisher: "Agencia Tributaria de Andalucía",
    ref: "modelos, programa de ayuda y presentación telemática",
    url: `${JDA}/organismos/atrian/areas/declaracion-pagos/presentacion-impuestos/sucesiones-donaciones.html`,
    read: RULES_AS_OF,
  },
  guide: {
    name: "Guía del Impuesto sobre Sucesiones",
    publisher: "Agencia Tributaria de Andalucía",
    ref: "guía de 14/06/2023: reducciones estatales y mejoras autonómicas, tarifa, coeficientes y bonificación",
    url: `${JDA}/sites/default/files/2024-07/ATRIAN_20230614_GU%C3%8DA%20SUCESIONES.pdf`,
    read: RULES_AS_OF,
  },
  faq: {
    name: "Preguntas frecuentes del impuesto sobre sucesiones",
    publisher: "Agencia Tributaria de Andalucía",
    ref: "cómo autoliquidar, beneficios fiscales, documentación",
    url: `${JDA}/organismos/atrian/areas/informacion-tributaria/impuestos/preguntas-frecuentes/impuestos-sucesiones.html`,
    read: RULES_AS_OF,
  },
} as const satisfies Record<string, Source>;

export const ANDALUCIA_QUOTE = {
  kinship:
    "1. El importe de reducción previsto en el artículo 20.2 a) de la Ley 29/1987, de 18 de diciembre, del impuesto sobre sucesiones y donaciones en el supuesto de adquisiciones mortis causa, incluidas las de los beneficiarios de pólizas de seguros de vida, será el siguiente: a) Grupo I: adquisiciones por descendientes y adoptados menores de 21 años, 1.000.000 de euros. b) Grupo II: adquisiciones por descendientes y adoptados de 21 o más años, cónyuges, ascendientes y adoptantes, 1.000.000 euros. c) Grupo III: adquisiciones por colaterales de segundo y tercer grado, ascendientes y descendientes por afinidad, 10.000 euros.",
  disability:
    "a) 250.000 euros, si el grado de discapacidad fuera igual o superior al 33% e inferior al 65%. b) 500.000 euros, si el grado de discapacidad fuera igual o superior al 65%. 2. Esta reducción será compatible con la mejora de la reducción estatal de la base imponible por la adquisición mortis causa por personas con parentesco prevista en el artículo 28.",
  home: "1. El porcentaje de reducción previsto en el artículo 20.2 c) de la Ley 29/1987, de 18 de diciembre, del impuesto sobre sucesiones y donaciones en el supuesto de adquisición mortis causa de la vivienda habitual del causante será del 99%.",
  homeConditions:
    "a) Que los causahabientes sean el cónyuge, ascendientes o descendientes del causante o las personas equiparadas a éstos de acuerdo con lo establecido en el artículo 26, o bien pariente colateral mayor de 65 años que hubiese convivido con el mismo durante los dos años anteriores al fallecimiento. b) Que la adquisición se mantenga durante los tres años siguientes a la fecha del fallecimiento del causante, salvo que el adquirente falleciera dentro de ese plazo.",
  homeCapGuide: "Desde 1 de enero de 2002, el límite máximo de reducción por dicho concepto y por cada sujeto pasivo es de 122.606,47 euros.",
  insuranceGuide:
    "Se aplicará una reducción del 100% en relación a las cantidades percibidas por los beneficiarios de contratos de seguro sobre la vida con un límite de 9.195,49 €, siempre que el beneficiario haya sido cónyuge, ascendiente o descendiente, adoptante o adoptado del contratante fallecido.",
  scale: "La cuota íntegra del impuesto regulada en el artículo 21.1 de la Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones, se obtendrá aplicando sobre la base liquidable los tipos de gravamen que se indican en la siguiente escala:",
  coefficient:
    "1. La cuota tributaria prevista en el artículo 22.1 de la Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones, se obtendrá aplicando a la cuota íntegra el coeficiente multiplicador que corresponda según los siguientes grupos de parentesco:",
  coefficientGuide:
    "Una vez determinada la cuota íntegra, hay que aplicar un coeficiente multiplicador que desde el 1 de enero de 2022 depende solamente del grado de parentesco del sujeto pasivo, mientras que hasta el 31 de diciembre de 2021 dependía del grado de parentesco y del patrimonio preexistente del sujeto pasivo.",
  bonus:
    "Los contribuyentes incluidos en los Grupos I y II de los previstos en el artículo 20.2.a) de la Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones, o en los supuestos de equiparaciones establecidos en el artículo 26, aplicarán una bonificación del 99% en la cuota tributaria derivada de adquisiciones mortis causa, incluidas las de los beneficiarios de pólizas de seguro de vida.",
  partners: "a) Las parejas o uniones de hecho inscritas en el Registro de Parejas de Hecho de la Comunidad Autónoma de Andalucía o en registros análogos de otras administraciones públicas se equipararán a los cónyuges.",
  foster: "b) Las personas objeto de un acogimiento familiar permanente y guarda con fines de adopción se equipararán a los adoptados.",
  inForce:
    "La presente Ley entrará en vigor el día 1 de enero de 2022, excepto los artículos 41, 43, 49 y 50 relativos al impuesto sobre transmisiones patrimoniales y actos jurídicos documentados, que entrarán en vigor el día siguiente al de su publicación en «Boletín Oficial de la Junta de Andalucía».",
} as const;
