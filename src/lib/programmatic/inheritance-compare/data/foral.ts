import { RULES_AS_OF } from "../state";
import type { Territory } from "../types";

/**
 * The foral territories, with their own inheritance and gift tax: Álava
 * (Norma Foral 11/2005), Bizkaia (Norma Foral 4/2015), Gipuzkoa (Norma Foral
 * 2/2022, which repealed NF 3/1990 from 17 April 2022) and Navarra (Decreto
 * Foral Legislativo 250/2002). Generated on 19 Nov 2026 from the fact packs
 * read that day in the diputaciones' consolidated texts (Álava, Bizkaia and
 * Gipuzkoa: their own divulgation PDFs, linked from their tax pages) and the
 * BOE's consolidated text (Navarra); every quote is checked as a substring of
 * the downloaded text before it is written here. Basics for groups I and II,
 * as the page says; their terms ("grupo 0", "grupo I") are the norms' own.
 */

export const ALAVA: Territory = {
  id: "alava",
  name: { ca: "Àlaba", es: "Álava", en: "Álava" },
  regime: "foral",
  agency: { name: { ca: "Hisenda Foral d'Àlaba", es: "Hacienda Foral de Álava", en: "Álava foral tax office" }, url: "https://web.araba.eus/es/hacienda/sucesiones-y-donaciones" },
  sources: {
    law: { short: "NF 11/2005 de Álava", name: "Norma Foral 11/2005, de 16 de mayo, del Impuesto sobre Sucesiones y Donaciones (Territorio Histórico de Álava)", publisher: "Diputación Foral de Álava", ref: "texto consolidado de la Diputación Foral (documento de divulgación), actualizado a la Norma Foral 3/2025 (BOTHA nº 44, 16/04/2025)", url: "https://web.araba.eus/documents/1247685/1248441/INDICE_NORMA+FORAL+SOBRE+SUCESIONES+Y+DONACIONES-CAS+%286%29.pdf/59d3f622-3026-21d1-8a6b-af2d1524d847?t=1746001794894", read: RULES_AS_OF },
  },
  mainSource: "law",
  inheritance: {
    groupII: {
      text: { ca: "Cònjuge o parella de fet, fills i pares («grup 0»): 400.000 €.", es: "Cónyuge o pareja de hecho, hijos y padres («grupo 0»): 400.000 €.", en: "Spouse or partner, children and parents (\"group 0\"): €400,000." },
      cite: { src: "law", art: "22.1" },
      from: "2024-12-31",
      quotes: [
        "1. (24) (25) En las adquisiciones \"mortis causa\" o por cualquier otro título sucesorio,",
        "Grupo 0: adquisiciones por el cónyuge o pareja de hecho, descendientes o ascendientes en línea recta por consanguinidad o adoptantes o adoptados o adoptadas, 400.000,00 euros.",
      ],
    },
    bonus: {
      text: { ca: "No hi ha bonificació: el que passa de la reducció tributa a un tipus fix de l'1,5 %.", es: "No hay bonificación: lo que pasa de la reducción tributa a un tipo fijo del 1,5 %.", en: "No rebate: whatever exceeds the reduction is taxed at a flat 1.5%." },
      cite: { src: "law", art: "24" },
      from: "2023-12-30",
      quotes: [
        "Tipo fijo.",
        "Campo de aplicación: Grupo 0 del apartado 1 del artículo 22 de esta Norma Foral.",
        "Será de aplicación el tipo impositivo del 1,5 por ciento.",
      ],
    },
    home: {
      text: { ca: "95 %, fins a 212.242 €, només si l'hereu va conviure amb el difunt en aquest habitatge els dos anys anteriors.", es: "95 %, hasta 212.242 €, solo si el heredero convivió con el fallecido en esa vivienda los dos años anteriores.", en: "95%, up to €212,242, only if the heir lived with the deceased in that home for the two years before." },
      cite: { src: "law", art: "22.6" },
      quotes: [
        "6. La adquisición lucrativa \"inter vivos\" o \"mortis causa\" del pleno dominio, del usufructo, la nula propiedad, del derecho de superficie o del derecho de uso y habitación de la vivienda en la que el adquirente hubiese convivido con el transmitente durante los dos años anteriores a la transmisión, gozará de una reducción del 95 por ciento en la base imponible correspondiente a la vivienda, con el límite máximo de 212.242,00 euros.",
        "El requisito de convivencia quedará acreditado por cualquier medio de prueba admitido en derecho.",
      ],
    },
    groupIII: {
      text: { ca: "Germans («grup I»): 38.156 € i tarifa del 5,70 % al 34,58 %.", es: "Hermanos («grupo I»): 38.156 € y tarifa del 5,70 % al 34,58 %.", en: "Siblings (\"group I\"): €38,156 and a 5.70% to 34.58% scale." },
      cite: { src: "law", art: "22.1 y 24" },
      from: "2024-12-31",
      quotes: [
        "Grupo I: adquisiciones por colaterales de segundo y tercer grado por consanguinidad, ascendientes y descendientes por afinidad, incluidos los resultantes de la constitución de la pareja de hecho, 38.156,00 euros.",
        "Campo de aplicación: Grupo I del apartado 1 del artículo 22 de esta Norma Foral.",
        "0,00 9.086,00 0,00 5,70",
        "9.086,01 27.261,00 517,90 7,98",
        "2.271.297,01 En adelante 570.193,44 34,58",
      ],
    },
  },
  gift: {
    benefit: {
      text: { ca: "Sense reducció per parentiu: tipus fix de l'1,5 % per al grup 0. Exemptes les donacions en metàl·lic de fins a 30.000 € a menors de 36 anys per comprar el seu habitatge habitual.", es: "Sin reducción por parentesco: tipo fijo del 1,5 % para el grupo 0. Exentas las donaciones en metálico de hasta 30.000 € a menores de 36 años para comprar su vivienda habitual.", en: "No kinship reduction: a flat 1.5% for group 0. Cash gifts of up to €30,000 to under-36s to buy their habitual home are exempt." },
      cite: { src: "law", art: "24 y 9.f" },
      from: "2025-04-17",
      quotes: [
        "Tipo fijo.",
        "Campo de aplicación: Grupo 0 del apartado 1 del artículo 22 de esta Norma Foral.",
        "Será de aplicación el tipo impositivo del 1,5 por ciento.",
        "f) (26) Las donaciones en metálico a favor de contribuyentes con una edad inferior a 36 años, realizadas por su cónyuge o pareja de hecho, ascendientes,",
        "con la finalidad de que la donataria o el donatario adquiera su vivienda habitual en propiedad.",
        "por cada donatario o donataria, será de 30.000,00 euros.",
      ],
    },
    formal: {
      text: { ca: "La norma no exigeix escriptura pública (autoliquidació en 30 dies hàbils); entre pares i fills, la donació es té per no feta si no s'acredita que l'augment del patrimoni del fill coincideix amb una disminució equivalent del dels pares. L'exempció per habitatge demana un document públic o privat que n'indiqui la destinació i el justificant de la transferència.", es: "La norma no exige escritura pública (autoliquidación en 30 días hábiles); entre padres e hijos, la donación se tiene por no hecha si no se acredita que el aumento del patrimonio del hijo coincide con una disminución equivalente del de los padres. La exención por vivienda pide un documento público o privado que indique ese destino y el justificante de la transferencia.", en: "The norm requires no public deed (the return within 30 working days); between parents and children the gift is treated as not made unless the child's gain is shown to match an equivalent loss in the parents' wealth. The home exemption needs a public or private document stating that purpose and the transfer receipt." },
      cite: { src: "law", art: "8.3 y 38.8" },
      quotes: [
        "3. A efectos tributarios, las donaciones entre cónyuges, miembros de la pareja de hecho, ascendientes y descendientes o adoptantes y adoptados, se tendrán por no realizadas si no puede acreditarse que el incremento de patrimonio del donatario es simultáneo a una disminución patrimonial equivalente del donante.",
        "1. (17) Los sujetos pasivos vendrán obligados a presentar un autoliquidación,",
        "8. (8) El plazo para la presentación de las autoliquidaciones de donaciones y demás transmisiones lucrativas será de treinta días hábiles a contar desde el día siguiente al momento en que se produzca el hecho imponible.",
        "documento público o privado en el que se haga constar de forma expresa que el destino del importe donado es la adquisición de la vivienda habitual del donatario o de la donataria, así como del documento acreditativo de la transferencia.",
      ],
    },
  },
  example: {
    kind: "rules",
    rules: {
      reductions: [
        { id: "kinship", label: { ca: "Grup 0", es: "Grupo 0", en: "Group 0" }, amount: 400000, cite: { src: "law", art: "22.1" } },
      ],
      home: null,
      scale: [
        { from: 0, quota: 0, rate: 1.5 },
      ],
      scaleCite: { src: "law", art: "24" },
      coefficient: 1,
      coefficientCite: null,
      bonus: { kind: "none" },
      bonusCite: null,
    },
  },
};

export const BIZKAIA: Territory = {
  id: "bizkaia",
  name: { ca: "Biscaia", es: "Bizkaia", en: "Bizkaia" },
  regime: "foral",
  agency: { name: { ca: "Hisenda Foral de Biscaia", es: "Hacienda Foral de Bizkaia", en: "Bizkaia foral tax office" }, url: "https://www.bizkaia.eus/es/sucesiones-y-donaciones" },
  sources: {
    law: { short: "NF 4/2015 de Bizkaia", name: "Norma Foral 4/2015, de 25 de marzo, del Impuesto sobre Sucesiones y Donaciones (Territorio Histórico de Bizkaia)", publisher: "Diputación Foral de Bizkaia", ref: "texto consolidado de la Diputación Foral (documento de divulgación), última modificación normativa 23/04/2025", url: "https://www.bizkaia.eus/documents/880307/15187815/ca_4_2015.pdf/b6d32212-4007-7fff-588f-207247783372?t=1746431810761", read: RULES_AS_OF },
  },
  mainSource: "law",
  inheritance: {
    groupII: {
      text: { ca: "Cònjuge o parella de fet, fills i pares («grup I»): 400.000 €.", es: "Cónyuge o pareja de hecho, hijos y padres («grupo I»): 400.000 €.", en: "Spouse or partner, children and parents (\"group I\"): €400,000." },
      cite: { src: "law", art: "43.1.a" },
      from: "2015-04-01",
      quotes: [
        "1. En las adquisiciones «mortis causa» o por cualquier otro título sucesorio, sin perjuicio de lo dispuesto en los artículos siguientes, la base liquidable se obtendrá aplicando en la base imponible la reducción que corresponda según los grados de parentesco o relación siguientes:",
        "a) Grupo I: Adquisiciones por el cónyuge o pareja de hecho, descendientes o ascendientes en línea recta por consanguinidad o adoptantes o adoptados, 400.000 euros.",
        "2. La base liquidable obtenida por aplicación de lo previsto en el apartado anterior nunca podrá ser negativa.",
      ],
    },
    bonus: {
      text: { ca: "No hi ha bonificació: el que passa de la reducció tributa a un tipus fix de l'1,5 %.", es: "No hay bonificación: lo que pasa de la reducción tributa a un tipo fijo del 1,5 %.", en: "No rebate: whatever exceeds the reduction is taxed at a flat 1.5%." },
      cite: { src: "law", art: "47.a" },
      from: "2015-04-01",
      quotes: [
        "a) Grupo I: Será de aplicación el tipo impositivo del 1,5 por 100.",
      ],
    },
    home: {
      text: { ca: "95 %, fins a 215.000 €, només si l'hereu va conviure amb el difunt els dos anys anteriors i era l'habitatge habitual de tots dos.", es: "95 %, hasta 215.000 €, solo si el heredero convivió con el fallecido los dos años anteriores y era la vivienda habitual de los dos.", en: "95%, up to €215,000, only if the heir lived with the deceased for the two years before and it was both people's habitual home." },
      cite: { src: "law", art: "44" },
      from: "2015-04-01",
      quotes: [
        "La adquisición lucrativa «inter vivos» o «mortis causa» del pleno dominio, del usufructo, la nuda propiedad, del derecho de superficie, o del derecho de uso y habitación de la vivienda en la que el adquirente hubiese convivido con el transmitente durante los dos años anteriores a la",
        "transmisión, gozará de una reducción del 95 por 100 en la base imponible del Impuesto, con el límite máximo de reducción de 215.000 euros.",
        "será requisito para la aplicación de la reducción que la vivienda de que se trate haya tenido la consideración de vivienda habitual tanto para el transmitente como para el adquirente",
      ],
    },
    groupIII: {
      text: { ca: "Germans («grup II»): 40.000 € i tarifa del 5,70 % al 34,58 %.", es: "Hermanos («grupo II»): 40.000 € y tarifa del 5,70 % al 34,58 %.", en: "Siblings (\"group II\"): €40,000 and a 5.70% to 34.58% scale." },
      cite: { src: "law", art: "43.1.b y 47.b" },
      from: "2015-04-01",
      quotes: [
        "b) Grupo II: Adquisiciones por colaterales de segundo grado por consanguinidad, 40.000 euros.",
        "Tarifa I. Grupos II y III:",
        "0,00 0,00 9.230,00 5,70",
        "2.305.420,00 578.755,12 En adelante 34,58",
      ],
    },
  },
  gift: {
    benefit: {
      text: { ca: "Sense reducció per parentiu: tipus fix de l'1,5 % per al grup I. Exemptes les donacions en metàl·lic de fins a 30.000 € a menors de 36 anys per comprar el seu habitatge habitual.", es: "Sin reducción por parentesco: tipo fijo del 1,5 % para el grupo I. Exentas las donaciones en metálico de hasta 30.000 € a menores de 36 años para comprar su vivienda habitual.", en: "No kinship reduction: a flat 1.5% for group I. Cash gifts of up to €30,000 to under-36s to buy their habitual home are exempt." },
      cite: { src: "law", art: "47.a y 12.10" },
      quotes: [
        "a) Grupo I: Será de aplicación el tipo impositivo del 1,5 por 100.",
        "10. Las donaciones en metálico a favor de contribuyentes con una edad inferior a 36 años,",
        "o en acogimiento permanente, con la finalidad de que la persona donataria adquiera una vivienda habitual en propiedad.",
        "El importe máximo del conjunto de las donaciones percibidas con derecho a aplicar lo dispuesto en este apartado por cada persona donataria será de 30.000 euros.",
      ],
    },
    formal: {
      text: { ca: "La norma no exigeix escriptura pública (autoliquidació en 30 dies hàbils); entre pares i fills, la donació es té per no feta si no s'acredita que l'augment del patrimoni del fill coincideix amb una disminució equivalent del dels pares. L'exempció per habitatge demana un document públic o privat que n'indiqui la destinació.", es: "La norma no exige escritura pública (autoliquidación en 30 días hábiles); entre padres e hijos, la donación se tiene por no hecha si no se acredita que el aumento del patrimonio del hijo coincide con una disminución equivalente del de los padres. La exención por vivienda pide un documento público o privado que indique ese destino.", en: "The norm requires no public deed (the return within 30 working days); between parents and children the gift is treated as not made unless the child's gain is shown to match an equivalent loss in the parents' wealth. The home exemption needs a public or private document stating that purpose." },
      cite: { src: "law", art: "11.2 y 69.1" },
      quotes: [
        "2. A efectos tributarios, las donaciones entre cónyuges, miembros de la pareja de hecho, ascendientes y descendientes o adoptantes y adoptados, se tendrán por no hechas si no puede acreditarse que el incremento de patrimonio del donatario es simultáneo a una disminución patrimonial equivalente del donante.",
        "los contribuyentes deberán presentar, en todo caso, autoliquidación por este Impuesto cuando obtengan los incrementos de patrimonio a título lucrativo sometidos al mismo a que se refieren las letras b) y c) del artículo 4 de esta Norma Foral.",
        "En los restantes supuestos el plazo de presentación será de treinta días hábiles a contar desde el día siguiente a aquél en que se cause o celebre el acto o contrato.",
        "documento público o privado en el que se haga constar de forma expresa que el destino del importe donado es la adquisición de la vivienda habitual de la persona donataria",
      ],
    },
  },
  example: {
    kind: "rules",
    rules: {
      reductions: [
        { id: "kinship", label: { ca: "Grup I", es: "Grupo I", en: "Group I" }, amount: 400000, cite: { src: "law", art: "43.1.a" } },
      ],
      home: null,
      scale: [
        { from: 0, quota: 0, rate: 1.5 },
      ],
      scaleCite: { src: "law", art: "47.a" },
      coefficient: 1,
      coefficientCite: null,
      bonus: { kind: "none" },
      bonusCite: null,
    },
  },
};

export const GIPUZKOA: Territory = {
  id: "gipuzkoa",
  name: { ca: "Guipúscoa", es: "Gipuzkoa", en: "Gipuzkoa" },
  regime: "foral",
  agency: { name: { ca: "Hisenda Foral de Guipúscoa", es: "Hacienda Foral de Gipuzkoa", en: "Gipuzkoa foral tax office" }, url: "https://www.gipuzkoa.eus/es/web/ogasuna/impuestos/sucesiones-y-donaciones" },
  sources: {
    law: { short: "NF 2/2022 de Gipuzkoa", name: "Norma Foral 2/2022, de 10 de marzo, del Impuesto sobre Sucesiones y Donaciones (Territorio Histórico de Gipuzkoa)", publisher: "Diputación Foral de Gipuzkoa", ref: "texto consolidado de la Diputación Foral (documento de divulgación), actualizado a la Norma Foral 1/2025 (BOG 15/05/2025); en vigor desde el 17/04/2022", url: "https://www.gipuzkoa.eus/documents/2456431/43869415/NF+2-2022+(2025).pdf/1cee10a6-b9b2-a684-a2af-5a5cd3ad5445", read: RULES_AS_OF },
  },
  mainSource: "law",
  inheritance: {
    groupII: {
      text: { ca: "Cònjuge o parella de fet, fills i pares («grup I»): 400.000 €.", es: "Cónyuge o pareja de hecho, hijos y padres («grupo I»): 400.000 €.", en: "Spouse or partner, children and parents (\"group I\"): €400,000." },
      cite: { src: "law", art: "44.1.a" },
      from: "2022-04-17",
      quotes: [
        "1. En las adquisiciones «mortis causa», sin perjuicio de lo dispuesto en el artículo siguiente, la base liquidable se obtendrá aplicando en la base imponible la reducción que corresponda según los siguientes grados de parentesco o relación:",
        "a) Grupo I: Adquisiciones por el cónyuge o pareja de hecho, descendientes o ascendientes en línea recta por consanguinidad o adoptantes o adoptados: 400.000 euros.",
        "2. La base liquidable obtenida por aplicación de lo previsto en el apartado anterior nunca podrá ser negativa.",
      ],
    },
    bonus: {
      text: { ca: "No hi ha bonificació: el que passa de la reducció tributa a un tipus fix de l'1,5 %.", es: "No hay bonificación: lo que pasa de la reducción tributa a un tipo fijo del 1,5 %.", en: "No rebate: whatever exceeds the reduction is taxed at a flat 1.5%." },
      cite: { src: "law", art: "47.a" },
      from: "2022-04-17",
      quotes: [
        "a) Grupo I: Será de aplicación el tipo impositivo del 1,5 por 100.",
      ],
    },
    home: {
      text: { ca: "95 %, fins a 220.000 €, només si l'hereu va conviure amb el difunt els dos anys immediatament anteriors i era l'habitatge habitual de tots dos.", es: "95 %, hasta 220.000 €, solo si el heredero convivió con el fallecido los dos años inmediatamente anteriores y era la vivienda habitual de los dos.", en: "95%, up to €220,000, only if the heir lived with the deceased for the two years just before and it was both people's habitual home." },
      cite: { src: "law", art: "45" },
      from: "2022-04-17",
      quotes: [
        "1. La adquisición lucrativa «inter vivos» o «mortis causa» del pleno dominio, del usufructo, la nuda propiedad, del derecho de superficie, o del derecho de uso y habitación de la vivienda en la que la persona adquirente hubiese convivido con la persona transmitente durante los dos años inmediatamente anteriores a la transmisión, gozará de una reducción del 95 por 100 en la base imponible del impuesto con el límite máximo de 220.000 euros.",
        "consideración de vivienda habitual tanto para la persona transmitente como para la adquirente",
      ],
    },
    groupIII: {
      text: { ca: "Germans («grup II»): 16.150 € i tarifa progressiva des del 5,70 %.", es: "Hermanos («grupo II»): 16.150 € y tarifa progresiva desde el 5,70 %.", en: "Siblings (\"group II\"): €16,150 and a progressive scale from 5.70%." },
      cite: { src: "law", art: "44.1.b y 47.b" },
      from: "2022-04-17",
      quotes: [
        "b) Grupo II: Adquisiciones por colaterales de segundo y tercer grado por consanguinidad, ascendientes y descendientes por afinidad: 16.150 euros.",
        "b) A los grupos II y III les serán de aplicación las siguientes tarifas:",
        "0 0,00 8.200 5,70",
      ],
    },
  },
  gift: {
    benefit: {
      text: { ca: "Sense reducció per parentiu: tipus fix de l'1,5 % per al grup I. Reducció del 100 % de les donacions en metàl·lic de fins a 30.000 € a menors de 36 anys per comprar el seu habitatge habitual.", es: "Sin reducción por parentesco: tipo fijo del 1,5 % para el grupo I. Reducción del 100 % de las donaciones en metálico de hasta 30.000 € a menores de 36 años para comprar su vivienda habitual.", en: "No kinship reduction: a flat 1.5% for group I. A 100% reduction of cash gifts of up to €30,000 to under-36s to buy their habitual home." },
      cite: { src: "law", art: "47.a y 45 bis" },
      from: "2025-05-16",
      quotes: [
        "a) Grupo I: Será de aplicación el tipo impositivo del 1,5 por 100.",
        "1. Las donaciones en metálico a favor de personas contribuyentes con una edad inferior a 36 años,",
        "con la finalidad de que la persona donataria adquiera una vivienda habitual en propiedad, gozarán de una reducción del 100 por 100 en la base imponible del impuesto.",
        "El importe máximo del conjunto de las donaciones percibidas con derecho a aplicar lo dispuesto en este artículo por cada persona donataria, será de 30.000 euros.",
        "Este artículo ha sido adicionado por el artículo 5 de la Norma Foral 1/2025, de 9 de mayo,",
      ],
    },
    formal: {
      text: { ca: "La norma no exigeix escriptura pública: autoliquidació en 30 dies hàbils. La reducció per habitatge demana un document públic o privat que n'indiqui la destinació.", es: "La norma no exige escritura pública: autoliquidación en 30 días hábiles. La reducción por vivienda pide un documento público o privado que indique ese destino.", en: "The norm requires no public deed: the return within 30 working days. The home reduction needs a public or private document stating that purpose." },
      cite: { src: "law", art: "68.1, 69.1 y 45 bis" },
      quotes: [
        "1. Los contribuyentes vendrán obligados a presentar una autoliquidación, comprensiva de los hechos imponibles a que se refiere la presente norma foral,",
        "En los restantes supuestos el plazo de presentación será de treinta días hábiles a contar desde el día siguiente a aquél en que se cause o celebre el acto o contrato.",
        "documento público o privado en el que se haga constar de forma expresa que el destino del importe donado es la adquisición de la vivienda habitual de la persona donataria",
      ],
    },
  },
  example: {
    kind: "rules",
    rules: {
      reductions: [
        { id: "kinship", label: { ca: "Grup I", es: "Grupo I", en: "Group I" }, amount: 400000, cite: { src: "law", art: "44.1.a" } },
      ],
      home: null,
      scale: [
        { from: 0, quota: 0, rate: 1.5 },
      ],
      scaleCite: { src: "law", art: "47.a" },
      coefficient: 1,
      coefficientCite: null,
      bonus: { kind: "none" },
      bonusCite: null,
    },
  },
};

export const NAVARRA: Territory = {
  id: "navarra",
  name: { ca: "Navarra", es: "Navarra", en: "Navarre" },
  regime: "foral",
  agency: { name: { ca: "Hisenda Foral de Navarra", es: "Hacienda Foral de Navarra", en: "Navarre foral tax office" }, url: "https://hacienda.navarra.es" },
  sources: {
    law: { short: "DFLeg 250/2002 de Navarra", name: "Decreto Foral Legislativo 250/2002, de 16 de diciembre, por el que se aprueba el Texto Refundido de las disposiciones del Impuesto sobre Sucesiones y Donaciones", publisher: "BOE (texto consolidado)", ref: "BON-n-2002-90009, arts. 29 a 34 y 53; última actualización publicada el 31/12/2025", url: "https://www.boe.es/buscar/act.php?id=BON-n-2002-90009", read: RULES_AS_OF },
  },
  mainSource: "law",
  inheritance: {
    groupII: {
      text: { ca: "Sense reducció per parentiu: la tarifa grava al 0 % els primers 250.000 € de base liquidable (fills i cònjuge o parella estable).", es: "Sin reducción por parentesco: la tarifa grava al 0 % los primeros 250.000 € de base liquidable (hijos y cónyuge o pareja estable).", en: "No kinship reduction: the scale taxes the first €250,000 of the net base at 0% (children and the spouse or stable partner)." },
      cite: { src: "law", art: "34.1.a" },
      from: "2018-01-01",
      quotes: [
        "La base liquidable del Impuesto se obtiene aplicando a la imponible las reducciones que, en su caso, correspondan de las previstas en los artículos siguientes de este Capítulo y demás disposiciones legales.",
        "3.º Ascendientes o descendientes en línea recta por consanguinidad, adoptantes o adoptados, cuando se trate de adquisiciones «mortis causa» por herencia, legado o cualquier otro título sucesorio",
        "1.º Cónyuges o miembros de una pareja estable, según su legislación específica, cuando se trate de adquisiciones «mortis causa» por herencia, legado o cualquier otro título sucesorio",
        "-Base liquidable hasta 250.000 euros: 0 por 100.",
        "Se modifican los apartados 1.a) y 2, con efectos para los hechos imponibles producidos a partir del 1 de enero de 2018, por el art. 4 del la Ley Foral 16/2017, de 27 de diciembre.",
      ],
    },
    bonus: {
      text: { ca: "No hi ha bonificació. Per sobre de 250.000 €, els fills paguen del 2 % al 16 % per trams i el cònjuge o parella estable, el 0,80 %.", es: "No hay bonificación. Por encima de 250.000 €, los hijos pagan del 2 % al 16 % por tramos y el cónyuge o pareja estable, el 0,80 %.", en: "No rebate. Above €250,000, children pay 2% to 16% by slices and the spouse or stable partner 0.80%." },
      cite: { src: "law", art: "34.1.a y 34.2" },
      from: "2018-01-01",
      quotes: [
        "Tipos de gravamen que se indican en la siguiente tarifa:",
        "250.000 0 250.000 2% 500.000 5.000 500.000 4% 1.000.000 25.000 800.000 8% 1.800.000 89.000 1.200.000 12% 3.000.000 233.000 Resto de base 16%",
        "-Resto de base: 0,80 por 100.",
        "2. Las tarifas de los ordinales 1.º, 3.º y 4.º del apartado 1.a) tienen carácter progresivo y cada tipo de gravamen se aplicará sobre cada uno de los tramos de la base liquidable que se indican.",
      ],
    },
    home: {
      text: { ca: "No hi ha reducció per l'habitatge habitual per a fills ni cònjuge. Els germans que hi van conviure amb el difunt els cinc anys anteriors i el conserven com a residència cinc anys més hi tributen al 0,8 %.", es: "No hay reducción por la vivienda habitual para hijos ni cónyuge. Los hermanos que convivieron con el fallecido en ella los cinco años anteriores y la conservan como residencia otros cinco tributan por ella al 0,8 %.", en: "No habitual-home reduction for children or the spouse. Siblings who lived there with the deceased for the five years before and keep it as their residence for five more pay 0.8% on it." },
      cite: { src: "law", art: "34.1.d" },
      from: "2022-12-31",
      quotes: [
        "b’) La adquisición “mortis causa” del pleno dominio de la vivienda habitual del causante, por uno o varios de sus hermanos, tributará al tipo especial de gravamen del 0,8 por 100, siempre que se cumplan las siguientes condiciones:",
        "a’’) Que el adquirente hubiese convivido con el causante, en la vivienda habitual de éste, durante los cinco años anteriores al fallecimiento.",
        "b’’) Que el adquirente no enajene la vivienda heredada y esta constituya su residencia habitual durante los cinco años siguientes a su adquisición",
      ],
    },
    groupIII: {
      text: { ca: "Germans: sense reducció; els primers 7.813,16 € al 0,80 % i l'excés segons una taula del 8 % al 35 % que no és progressiva.", es: "Hermanos: sin reducción; los primeros 7.813,16 € al 0,80 % y el exceso según una tabla del 8 % al 35 % que no es progresiva.", en: "Siblings: no reduction; the first €7,813.16 at 0.80% and the excess under an 8% to 35% table that is not progressive." },
      cite: { src: "law", art: "34.1.b y d" },
      from: "2022-12-31",
      quotes: [
        "b) Ascendientes y descendientes por afinidad y colaterales de segundo y tercer grado, cuando se trate de adquisiciones «mortis causa»",
        "Hasta 7.813,16 0,80% Exceso sobre 7.813,16 El que corresponda conforme a las letras c), d) y e) siguientes",
        "d) Colaterales de segundo grado. a’) En los supuestos previstos en la letra b) se gravará el exceso sobre la cantidad a que se refiere dicha letra:",
        "Hasta 6.010,12 8,00 % De 6.010,13 a 12.020,24 9,00 %",
        "De 3.005.060,53 en adelante 35,00 %",
        "Por el contrario, las tarifas de las letras b) a g), ambas inclusive, del apartado 1 no tienen carácter progresivo y se aplicarán sobre la total base liquidable.",
      ],
    },
  },
  gift: {
    benefit: {
      text: { ca: "Sense reduccions ni bonificació. Tarifa pròpia per a les donacions de pares a fills: 0,80 % fins a 250.000 € i del 2 % al 8 % per sobre.", es: "Sin reducciones ni bonificación. Tarifa propia para las donaciones de padres a hijos: 0,80 % hasta 250.000 € y del 2 % al 8 % por encima.", en: "No reductions or rebate. A scale of its own for gifts from parents to children: 0.80% up to €250,000 and 2% to 8% above." },
      cite: { src: "law", art: "34.1.a) 4.º" },
      from: "2018-01-01",
      quotes: [
        "4.º Ascendientes o descendientes en línea recta por consanguinidad, adoptantes o adoptados, cuando se trate de adquisiciones por donación o cualquier otro negocio jurídico a título gratuito e «inter vivos»",
        "250.000 0,80% 250.000 2.000 250.000 2% 500.000 7.000 500.000 3% 1.000.000 22.000 800.000 4% 1.800.000 54.000 1.200.000 6% 3.000.000 126.000 Resto de base 8%»",
      ],
    },
    formal: {
      text: { ca: "La llei foral no posa requisits de forma (cap benefici no en depèn): n'hi ha prou amb la declaració en el termini i la forma del reglament.", es: "La ley foral no pone requisitos de forma (ningún beneficio depende de ellos): basta la declaración en el plazo y la forma del reglamento.", en: "The foral law sets no formal requirement (no benefit depends on one): the return, in the time and form the regulation sets, is enough." },
      cite: { src: "law", art: "53" },
      quotes: [
        "Los sujetos pasivos vendrán obligados a presentar una declaración tributaria, comprensiva de los hechos imponibles a que se refiere la presente Ley Foral, con el contenido, en los plazos y en la forma que reglamentariamente se fijen.",
      ],
    },
  },
  example: {
    kind: "rules",
    rules: {
      reductions: [
        // none,
      ],
      home: null,
      scale: [
        { from: 0, quota: 0, rate: 0 },
        { from: 250000, quota: 0, rate: 2 },
        { from: 500000, quota: 5000, rate: 4 },
        { from: 1000000, quota: 25000, rate: 8 },
        { from: 1800000, quota: 89000, rate: 12 },
        { from: 3000000, quota: 233000, rate: 16 },
      ],
      scaleCite: { src: "law", art: "34.1.a) 3.º" },
      coefficient: 1,
      coefficientCite: null,
      bonus: { kind: "none" },
      bonusCite: null,
    },
  },
};
