import { RULES_AS_OF, STATE_SCALE, STATE_SOURCES } from "../state";
import type { Territory } from "../types";

/**
 * The eleven common-regime communities without their own calculator on the
 * site: Aragón, Asturias, Illes Balears, Canarias, Cantabria, Castilla-La
 * Mancha, Castilla y León, Extremadura, Galicia, Región de Murcia and La
 * Rioja. Generated on 19 Nov 2026 from the fact packs read that day in the
 * BOE's consolidated texts (and, where noted, the amending laws, the BOIB and
 * the Cantabrian tax agency's page): every quote is the law's own text, checked
 * as a substring of the downloaded official text before it was written here.
 * The cell summaries are ours. Edit by hand only together with the source.
 */

export const ARAGON: Territory = {
  id: "aragon",
  name: { ca: "Aragó", es: "Aragón", en: "Aragon" },
  regime: "common",
  agency: { name: { ca: "Administració Tributària d'Aragó", es: "Administración Tributaria de Aragón", en: "Aragon Tax Administration" }, url: "https://www.aragon.es/administracion-tributaria-de-aragon/impuestos/sucesiones-y-donaciones" },
  sources: {
    law: { short: "DL 1/2005 de Aragón", name: "Decreto Legislativo 1/2005, de 26 de septiembre, del Gobierno de Aragón, por el que se aprueba el texto refundido de las disposiciones dictadas por la Comunidad Autónoma de Aragón en materia de tributos cedidos", publisher: "BOE (texto consolidado)", ref: "BOA-d-2005-90006, arts. 131-5 a 132-8; última actualización publicada el 07/07/2025", url: "https://www.boe.es/buscar/act.php?id=BOA-d-2005-90006", read: RULES_AS_OF },
    lisd: STATE_SOURCES.lisd,
  },
  mainSource: "law",
  inheritance: {
    groupII: {
      text: { ca: "Fills i cònjuge: 15.956,87 € (estatal) i, a més, una reducció pròpia del 100 % de la base mentre el total de reduccions no passi de 500.000 €.", es: "Hijos y cónyuge: 15.956,87 € (estatal) y, además, una reducción propia del 100 % de la base mientras el total de reducciones no pase de 500.000 €.", en: "Children and spouse: €15,956.87 (state) plus Aragon's own 100% reduction of the base while all reductions together stay within €500,000." },
      cite: { src: "law", art: "131-5" },
      from: "2018-11-01",
      quotes: [
        "el cónyuge, los ascendientes y descendientes del fallecido podrán aplicarse una reducción del 100 por 100 de la base imponible correspondiente a su adquisición mortis causa, incluida la relativa a pólizas de seguros de vida, conforme al siguiente régimen:",
        "a) La reducción solo será aplicable cuando el importe total del resto de reducciones de la base imponible sea inferior a 500.000 euros. A estos efectos, no se computarán las reducciones relativas a los beneficiarios de pólizas de seguros de vida.",
        "b) El importe de esta reducción, sumado al de las restantes reducciones aplicables por el contribuyente, excluida la relativa a los beneficiarios de pólizas de seguros de vida, no podrá exceder de 500.000 euros. En caso contrario, se aplicará esta reducción en la cuantía correspondiente hasta alcanzar dicho límite.",
        "los límites de las letras a) y b) del apartado anterior se incrementarán en 150.000 euros por cada hijo menor de edad que conviva con dicho cónyuge.",
        "el importe de la reducción prevista en este artículo se minorará en el 65 por 100 de la suma de las bases imponibles correspondientes a las donaciones acogidas a dicha bonificación.",
        { text: "Grupo II: adquisiciones por descendientes y adoptados de veintiuno o más años, cónyuges, ascendientes y adoptantes, 15.956,87 euros.", src: "lisd" },
      ],
    },
    bonus: {
      text: { ca: "Cap de general per a fills de 21 anys o més ni per al cònjuge (la del 99 % és només per a menors de 21). Bonificació del 65 % de la quota que correspon a l'habitatge habitual si val 300.000 € o menys.", es: "Ninguna general para hijos de 21 años o más ni para el cónyuge (la del 99 % es solo para menores de 21). Bonificación del 65 % de la cuota que corresponde a la vivienda habitual si vale 300.000 € o menos.", en: "No general rebate for children aged 21+ or the spouse (the 99% is only for under-21s). A 65% rebate on the part of the tax for the habitual home if it is worth €300,000 or less." },
      cite: { src: "law", art: "131-12 y 131-10" },
      from: "2018-11-01",
      quotes: [
        "les será de aplicación una bonificación del 99 % en la cuota tributaria derivada de las mismas.",
        "de los sujetos pasivos incluidos en el Grupo I de parentesco de los previstos en el artículo 20.2.a) de la Ley 29/1987",
        "1. El cónyuge, los ascendientes y los descendientes del fallecido podrán aplicar una bonificación del 65 por 100 en la cuota tributaria derivada de la adquisición de la vivienda habitual del causante.",
        "2. Para aplicar esta bonificación, el valor de la vivienda deberá ser igual o inferior a 300.000 euros.",
        "3. El porcentaje de bonificación se aplicará sobre la cuota que corresponde al valor neto de la vivienda integrado en la base liquidable de la adquisición hereditaria.",
      ],
    },
    home: {
      text: { ca: "100 %, fins a 200.000 € per hereu. Cal conservar-lo 5 anys.", es: "100 %, hasta 200.000 € por heredero. Hay que conservarla 5 años.", en: "100%, up to €200,000 per heir. It must be kept 5 years." },
      cite: { src: "law", art: "131-8" },
      from: "2018-11-01",
      quotes: [
        "se aplicará, con el carácter de mejora, en el ámbito de la Comunidad Autónoma de Aragón, con las siguientes condiciones:",
        "a) El porcentaje será del 100 por 100 sobre el valor de la vivienda.",
        "b) El límite establecido en el párrafo tercero del citado artículo 20.2.c) se eleva a 200.000 euros.",
        "c) La reducción está condicionada al mantenimiento de la vivienda habitual adquirida durante los cinco años siguientes al fallecimiento del causante, salvo que el adquirente falleciese dentro de ese plazo.",
      ],
    },
    groupIII: {
      text: { ca: "Germans: 15.000 €, sense bonificació (coeficient 1,5882).", es: "Hermanos: 15.000 €, sin bonificación (coeficiente 1,5882).", en: "Siblings: €15,000, no rebate (coefficient 1.5882)." },
      cite: { src: "law", art: "131-9" },
      from: "2018-11-01",
      quotes: [
        "La reducción prevista en el artículo 20.2.a) de la Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones, para los hermanos del causante se fija, con el carácter de mejora, en el ámbito de la Comunidad Autónoma de Aragón, en 15.000 euros.",
        { text: "Si la Comunidad Autónoma no hubiese aprobado el coeficiente o la cuantía de los tramos a que se refiere el apartado anterior", src: "lisd" },
        { text: "1,0000 1,5882 2,0000 De más de 402.678,11 a 2.007.380,43", src: "lisd" },
      ],
    },
  },
  gift: {
    benefit: {
      text: { ca: "Reducció del 100 % fins a 100.000 € en cinc anys (fins a 300.000 €, amb condicions, si és per al seu primer habitatge habitual a l'Aragó) i bonificació del 99 % si el que s'ha rebut en cinc anys no passa de 500.000 €.", es: "Reducción del 100 % hasta 100.000 € en cinco años (hasta 300.000 €, con condiciones, si es para su primera vivienda habitual en Aragón) y bonificación del 99 % si lo recibido en cinco años no pasa de 500.000 €.", en: "A 100% reduction up to €100,000 over five years (up to €300,000, with conditions, for a first habitual home in Aragon) and a 99% rebate if what was received in five years stays within €500,000." },
      cite: { src: "law", art: "132-2, 132-8 y 132-6" },
      from: "2024-01-01",
      quotes: [
        "las donaciones a favor del cónyuge y de los hijos otorgarán al donatario el derecho a la aplicación de una reducción del 100 por 100 de la base imponible del impuesto, conforme al siguiente régimen:",
        "a) El importe de esta reducción, haya una o varias donaciones, de uno o varios donantes, sumado al de las restantes reducciones aplicadas por el contribuyente por el concepto \"Donaciones\" en los últimos cinco años, no podrá exceder de 100.000 euros.",
        "b) La autoliquidación correspondiente a la donación, en la que se aplique este beneficio, deberá presentarse dentro del plazo para el pago del impuesto en período voluntario.",
        "las donaciones a favor de los hijos de dinero para la adquisición de primera vivienda habitual o de un bien inmueble para su destino como primera vivienda habitual, en alguno de los municipios de la Comunidad Autónoma de Aragón en ambos casos, otorgarán al donatario el derecho a la aplicación de una reducción del 100 por 100 de la base imponible del impuesto",
        "no podrá exceder de la cantidad de 300.000 euros.",
        "b) El patrimonio preexistente del contribuyente no podrá exceder de 100.000 euros.",
        "d) En caso de donación de dinero, la adquisición de la vivienda deberá haberse realizado o realizarse en el período comprendido entre los doce meses anteriores a la donación y los doce meses posteriores a la misma.",
        "f) La autoliquidación correspondiente a la donación en la que se aplique este beneficio deberá presentarse dentro del plazo establecido para ello.",
        "Los sujetos pasivos incluidos en el Grupo II de parentesco de los previstos en el artículo 20.2.a) de la Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones, podrán aplicar una bonificación del 99 por 100 en la cuota tributaria derivada de adquisiciones lucrativas “inter vivos” siempre y cuando la base imponible sea igual o inferior a 500.000 euros.",
        "A efectos de calcular este límite, se tomará el valor total de las donaciones recibidas por el donatario, incluida aquella en la que se aplique esta bonificación, en los cinco años anteriores.",
      ],
    },
    formal: {
      text: { ca: "La llei aragonesa no exigeix escriptura ni document públic ni justificar l'origen dels diners; la reducció demana presentar l'autoliquidació dins de termini (un mes).", es: "La ley aragonesa no exige escritura ni documento público ni justificar el origen del dinero; la reducción pide presentar la autoliquidación en plazo (un mes).", en: "Aragon's law requires no deed or public document and no proof of where the money came from; the reduction requires filing the self-assessment on time (one month)." },
      cite: { src: "law", art: "132-2.1.b y 133-1.3.b" },
      from: "2024-01-01",
      quotes: [
        "b) Cuando se trate de adquisiciones de bienes y derechos por donación o cualquier otro negocio jurídico a título gratuito e inter vivos, será de un mes contado desde el día siguiente a la fecha del devengo del impuesto.",
        "Las deducciones en la cuota íntegra autonómica del Impuesto sobre la Renta de las Personas Físicas por las cantidades satisfechas",
      ],
    },
  },
  example: {
    kind: "rules",
    rules: {
      reductions: [
        { id: "kinship", label: { ca: "Parentiu (estatal)", es: "Parentesco (estatal)", en: "Kinship (state)" }, amount: 15956.87, cite: { src: "lisd", art: "20.2.a" } },
        { id: "aragon-100", label: { ca: "Reducció pròpia del 100 %", es: "Reducción propia del 100 %", en: "Aragon's own 100% reduction" }, topUpTo: 500000, cite: { src: "law", art: "131-5" } },
      ],
      home: { percent: 100, cap: 200000, cite: { src: "law", art: "131-8" } },
      scale: STATE_SCALE,
      scaleCite: { src: "lisd", art: "21.2" },
      coefficient: 1,
      coefficientCite: { src: "lisd", art: "22.2" },
      bonus: { kind: "none" },
      bonusCite: null,
    },
  },
};

export const ASTURIAS: Territory = {
  id: "asturias",
  name: { ca: "Principat d'Astúries", es: "Principado de Asturias", en: "Asturias" },
  regime: "common",
  agency: { name: { ca: "Ente Público de Servicios Tributarios del Principado de Asturias", es: "Ente Público de Servicios Tributarios del Principado de Asturias", en: "Asturias tax agency (Ente Público de Servicios Tributarios)" }, url: "https://www.tributasenasturias.es" },
  sources: {
    law: { short: "DL 2/2014 de Asturias", name: "Decreto Legislativo 2/2014, de 22 de octubre, por el que se aprueba el texto refundido de las disposiciones legales del Principado de Asturias en materia de tributos cedidos por el Estado", publisher: "BOE (texto consolidado)", ref: "BOE-A-2015-945, arts. 17 a 24; última actualización publicada el 31/12/2025", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-945", read: RULES_AS_OF },
    lisd: STATE_SOURCES.lisd,
  },
  mainSource: "law",
  inheritance: {
    groupII: {
      text: { ca: "Fills i cònjuge: 300.000 €.", es: "Hijos y cónyuge: 300.000 €.", en: "Children and spouse: €300,000." },
      cite: { src: "law", art: "17" },
      from: "2017-06-01",
      quotes: [
        "La reducción aplicable a los grupos I y II de parentesco prevista en el artículo 20.2.a) de la Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones, será de 300.000 euros.",
        "Esta modificación tiene efectos desde 1 de junio de 2017 según establece la disposición final única.2 de la citada ley.",
        "a) Las parejas estables definidas en los términos de la Ley del Principado de Asturias 4/2002, de 23 de mayo, de Parejas Estables, se equipararán a los cónyuges.",
      ],
    },
    bonus: {
      text: { ca: "Cap per a fills ni cònjuge. El que supera les reduccions tributa amb una tarifa pròpia dels grups I i II que comença al 21,25 %.", es: "Ninguna para hijos ni cónyuge. Lo que supera las reducciones tributa con una tarifa propia de los grupos I y II que empieza en el 21,25 %.", en: "None for children or the spouse. What exceeds the reductions is taxed on a group I-II scale of its own that starts at 21.25%." },
      cite: { src: "law", art: "21.2" },
      from: "2017-01-01",
      quotes: [
        "2. Tarifa aplicable a las sucesiones de contribuyentes de los Grupos I y II de parentesco:",
        "0,00 0,00 56.000,00 21,25 56.000,00 11.900,00 160.000,00 25,50 216.000,00 52.700,00 400.000,00 31,25 616.000,00 177.700,00 En adelante 36,50",
      ],
    },
    home: {
      text: { ca: "Del 95 % al 99 % segons el valor de l'habitatge, amb el límit estatal de 122.606,47 € per hereu. Cal conservar-lo 3 anys.", es: "Del 95 % al 99 % según el valor de la vivienda, con el límite estatal de 122.606,47 € por heredero. Hay que conservarla 3 años.", en: "95% to 99% depending on the home's value, with the state cap of €122,606.47 per heir. It must be kept 3 years." },
      cite: { src: "law", art: "17 bis" },
      from: "2017-06-01",
      quotes: [
        "1. El porcentaje de reducción previsto en el artículo 20.2.c) de la Ley del Impuesto sobre Sucesiones y Donaciones será el que resulte de aplicar la siguiente escala:",
        "Hasta 90.000 99 De 90.000,01 a 120.000 98 De 120.000,01 a 180.000 97 De 180.000,01 a 240.000 96 Más de 240.000 95",
        "2. Este porcentaje será de aplicación cuando la adquisición se mantenga durante los tres años siguientes al fallecimiento del causante, salvo que falleciera el adquirente dentro de este plazo. Los restantes límites y requisitos serán los establecidos en la legislación estatal.",
        { text: "Del mismo porcentaje de reducción, con el límite de 122.606,47 euros para cada sujeto pasivo y con el requisito de permanencia señalado anteriormente, gozarán las adquisiciones \"mortis causa\" de la vivienda habitual de la persona fallecida, siempre que los causahabientes sean cónyuge, ascendientes o descendientes de aquél, o bien pariente colateral mayor de sesenta y cinco años que hubiese convivido con el causante durante los dos años anteriores al fallecimiento.", src: "lisd" },
      ],
    },
    groupIII: {
      text: { ca: "Germans: 7.993,46 € (estatal), sense bonificació; tarifa general asturiana (fins al 36,5 %) i coeficient 1,5882.", es: "Hermanos: 7.993,46 € (estatal), sin bonificación; tarifa general asturiana (hasta el 36,5 %) y coeficiente 1,5882.", en: "Siblings: €7,993.46 (state), no rebate; Asturias' general scale (up to 36.5%) and coefficient 1.5882." },
      cite: { src: "lisd", art: "20.2.a" },
      from: "2012-12-28",
      quotes: [
        "Grupo III: adquisiciones por colaterales de segundo y tercer grado, ascendientes y descendientes por afinidad, 7.993,46 euros.",
        { text: "1. En el caso de adquisiciones «mortis causa», los coeficientes multiplicadores aplicables a la cuota íntegra en función de la cuantía del patrimonio preexistente serán los siguientes para el Grupo I:", src: "law" },
        { text: "De 0 a 402.678,11 0,0000", src: "law" },
        { text: "2. En lo demás resultará de aplicación lo establecido en el artículo 22 de la Ley del Impuesto sobre Sucesiones y Donaciones.", src: "law" },
        "1,0000 1,5882 2,0000 De más de 402.678,11 a 2.007.380,43",
        { text: "1. Tarifa aplicable con carácter general:", src: "law" },
        { text: "400.000,00 80.920,00 400.000,00 31,25 800.000,00 205.920,00 En adelante 36,50", src: "law" },
      ],
    },
  },
  gift: {
    benefit: {
      text: { ca: "Sense bonificació. Tarifa reduïda dels grups I i II: 2 % fins a 150.000 €, si el patrimoni del fill no passa de 402.678,11 € sense comptar-ne l'habitatge habitual.", es: "Sin bonificación. Tarifa reducida de los grupos I y II: 2 % hasta 150.000 €, si el patrimonio del hijo no pasa de 402.678,11 € sin contar su vivienda habitual.", en: "No rebate. A reduced scale for groups I and II: 2% up to €150,000, if the child's wealth is no more than €402,678.11, not counting their habitual home." },
      cite: { src: "law", art: "21.3" },
      from: "2024-01-01",
      quotes: [
        "3. Tarifa aplicable a las donaciones a favor de contribuyentes de los grupos I y II de parentesco que estén en todo caso formalizadas en documento público antes de que expire el plazo de autoliquidación del impuesto:",
        "150 000,00 2,00 150 000,00 3 000,00 150 000,00 15,00 300 000,00 25 500,00 150 000,00 25,00 450 000,00 63 000,00 150 000,00 30,00 600 000,00 108 000,00 En adelante 36,50",
        "La presente tarifa resultará de aplicación siempre que el patrimonio del donatario a la fecha de la donación no sea superior a 402 678,11 euros, con exclusión de la vivienda habitual.",
      ],
    },
    formal: {
      text: { ca: "Document públic abans que acabi el termini d'autoliquidació; en diners, justificar-ne l'origen i els mitjans de lliurament.", es: "Documento público antes de que acabe el plazo de autoliquidación; en dinero, justificar su origen y los medios de entrega.", en: "A public document before the filing deadline ends; for cash, proof of where it came from and how it was handed over." },
      cite: { src: "law", art: "21.3" },
      from: "2024-01-01",
      quotes: [
        "Cuando los bienes donados consistan en metálico o en cualquiera de los contemplados en el artículo 12 de la Ley del Impuesto sobre el Patrimonio, deberá justificarse la procedencia de los bienes que el donante transmite y los medios efectivos en virtud de los cuales se produce la entrega de lo donado.",
      ],
    },
  },
  example: {
    kind: "rules",
    rules: {
      reductions: [
        { id: "kinship", label: { ca: "Parentiu", es: "Parentesco", en: "Kinship" }, amount: 300000, cite: { src: "law", art: "17" } },
      ],
      home: { percent: 95, cap: 122606.47, cite: { src: "law", art: "17 bis" } },
      scale: [
        { from: 0, quota: 0, rate: 21.25 },
        { from: 56000, quota: 11900, rate: 25.5 },
        { from: 216000, quota: 52700, rate: 31.25 },
        { from: 616000, quota: 177700, rate: 36.5 },
      ],
      scaleCite: { src: "law", art: "21.2" },
      coefficient: 1,
      coefficientCite: { src: "lisd", art: "22.2" },
      bonus: { kind: "none" },
      bonusCite: null,
    },
  },
};

export const BALEARES: Territory = {
  id: "baleares",
  name: { ca: "Illes Balears", es: "Illes Balears", en: "Balearic Islands" },
  regime: "common",
  agency: { name: { ca: "Agència Tributària de les Illes Balears (ATIB)", es: "Agència Tributària de les Illes Balears (ATIB)", en: "Balearic Tax Agency (ATIB)" }, url: "https://www.atib.es" },
  sources: {
    law: { short: "DL 1/2014 de las Illes Balears", name: "Decreto Legislativo 1/2014, de 6 de junio, por el que se aprueba el Texto Refundido de las disposiciones legales de la Comunidad Autónoma de las Illes Balears en materia de tributos cedidos por el Estado", publisher: "BOE (texto consolidado)", ref: "BOE-A-2014-6925, arts. 21 a 54 y disposición adicional quinta; última actualización publicada el 13/06/2026", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2014-6925", read: RULES_AS_OF },
    order: { short: "Ordre 13/2026 (BOIB)", name: "Ordre 13/2026 del conseller d'Economia, Hisenda i Innovació, que modifica l'Ordre 5/2026", publisher: "BOIB", ref: "en vigor des del 14/06/2026", url: "https://www.caib.es/eboibfront/ca/2026/12293/717053/ordre-13-2026-del-conseller-d-economia-hisenda-i-i", read: RULES_AS_OF },
  },
  mainSource: "law",
  inheritance: {
    groupII: {
      text: { ca: "Fills i cònjuge: 25.000 €.", es: "Hijos y cónyuge: 25.000 €.", en: "Children and spouse: €25,000." },
      cite: { src: "law", art: "21.b" },
      from: "2014-06-08",
      quotes: [
        "b) Grupo II. Adquisiciones por descendientes de 21 o más años, cónyuges y ascendientes: 25.000 euros.",
        "1. El régimen jurídico aplicable a los cónyuges en virtud de este capítulo en relación a las reducciones estatales y autonómicas, las cuantías y los coeficientes de patrimonio preexistente correspondientes a cada grupo de clasificación y las bonificaciones y deducciones autonómicas en el impuesto sobre sucesiones y donaciones, se hará extensivo a los miembros de las parejas estables",
        "2. Las reducciones reguladas en esta subsección constituyen mejoras de las reducciones que establece el Estado en la Ley 29/1987, de 18 de diciembre, del impuesto sobre sucesiones y donaciones, salvo las previstas en los artículos 28, 28 bis, 28 ter y 32, que constituyen reducciones propias de la comunidad autónoma de las Illes Balears.",
      ],
    },
    bonus: {
      text: { ca: "100 % per als grups I i II, si els immobles es declaren a l'escriptura per no més del valor de referència més un 20 %. Abans, la seva tarifa pròpia: 1 % fins a 700.000 €.", es: "100 % para los grupos I y II, si los inmuebles se declaran en la escritura por no más del valor de referencia más un 20 %. Antes, su tarifa propia: 1 % hasta 700.000 €.", en: "100% for groups I and II, if any property is declared in the deed at no more than its reference value plus 20%. Before that, their own scale: 1% up to €700,000." },
      cite: { src: "law", art: "36 y 33.2" },
      from: "2025-07-25",
      quotes: [
        "1. En las adquisiciones por causa de muerte, incluidos los pactos sucesorios, en las que los sujetos pasivos formen parte de los grupos I o II del artículo 21 de este texto refundido, se podrá aplicar una bonificación del 100% sobre la cuota íntegra corregida.",
        "2. Para poder aplicar esta bonificación, en caso de que se adquieran bienes inmuebles, se consignará, en su caso, en la escritura pública correspondiente el valor de los bienes inmuebles adquiridos, que no podrá superar en cada caso el valor de referencia incrementado en un 20 % o, cuando no exista este valor de referencia o no se pueda certificar por la Dirección General del Catastro, el valor de mercado.",
        "3. Esta bonificación no eximirá de la obligación de presentar la correspondiente autoliquidación del impuesto.",
        "2. No obstante, para los sujetos pasivos incluidos en los grupos I y II del artículo 21 del presente texto refundido, la cuota íntegra se obtendrá aplicando a la base liquidable la siguiente escala:",
        "0 0 700.000 1 700.000 7.000 300.000 8 1.000.000 31.000 1.000.000 11 2.000.000 141.000 1.000.000 15 3.000.000 291.000 En adelante 20",
      ],
    },
    home: {
      text: { ca: "100 %, fins a 270.151,20 € per hereu segons l'art. 23; des del 14 de juny de 2026 una ordre fixa aquest import en 331.859,70 € (Mallorca i Menorca) o 378.211,68 € (Eivissa i Formentera) en els articles de la disposició addicional cinquena, entre els quals el 23. Cal conservar-lo 5 anys.", es: "100 %, hasta 270.151,20 € por heredero según el art. 23; desde el 14 de junio de 2026 una orden fija ese importe en 331.859,70 € (Mallorca y Menorca) o 378.211,68 € (Eivissa y Formentera) en los artículos de la disposición adicional quinta, entre ellos el 23. Hay que conservarla 5 años.", en: "100%, up to €270,151.20 per heir under art. 23; since 14 June 2026 an order sets that amount at €331,859.70 (Mallorca and Menorca) or €378,211.68 (Ibiza and Formentera) for the articles listed in the fifth additional provision, art. 23 among them. It must be kept 5 years." },
      cite: { src: "law", art: "23" },
      from: "2023-11-26",
      quotes: [
        "1. Las adquisiciones por causa de muerte tendrán una reducción del 100 % del valor de la vivienda habitual del causante, con el límite de 270.151,20 euros por cada sujeto pasivo, siempre que los derechohabientes sean el cónyuge, los ascendientes o los descendientes, o los parientes colaterales mayores de sesenta y cinco años que hayan convivido con el causante durante los dos años anteriores al devengo del impuesto.",
        "2. Para aplicar esta reducción será necesario que la adquisición se mantenga durante los cinco años siguientes a la adquisición, salvo que el adquiriente muera en este plazo.",
        "c) La reducción afectará a cada causahabiente en la parte proporcional al valor de la vivienda habitual que se integre en su base imponible.",
        "1. Mediante una orden del consejero competente en materia de hacienda se podrá incrementar la cuantía de 270.151,20 euros a que se refieren los artículos 10, 14 quater, 17, 19 quater, 23, 48 y 50 de este texto refundido, hasta un máximo del 40 % de esta cuantía",
        "a 1 de enero de 2026, que queda fijado en 331.859,70 euros.",
        { text: "4. Els imports màxims que resultin del que estableixen els apartats anteriors s'han d'aplicar en l'àmbit dels articles a què fa referència l'apartat 1 de la disposició addicional cinquena", src: "order" },
        { text: "Mallorca 3.412,10 € 307.089,00 € 14 % 14 % 331.859,70 € Menorca 2.586,40 € 232.776,00 € -14 % 0 % 331.859,70 € Eivissa 5.101,50 € 459.135,00 € 70 % 40 % 378.211,68 € Formentera 6.605,50 € 594.495,00 € 120 % 40 % 378.211,68 €", src: "order" },
        { text: "Aquesta Ordre comença a vigir, una vegada publicada en el Butlletí Oficial de les Illes Balears, el dia 14 de juny de 2026.", src: "order" },
      ],
    },
    groupIII: {
      text: { ca: "Germans: 8.000 € i bonificació del 60 % (35 % si hereten juntament amb descendents del difunt); coeficient 1,2706.", es: "Hermanos: 8.000 € y bonificación del 60 % (35 % si heredan junto a descendientes del fallecido); coeficiente 1,2706.", en: "Siblings: €8,000 and a 60% rebate (35% if they inherit together with the deceased's descendants); coefficient 1.2706." },
      cite: { src: "law", art: "21.c y 36 bis" },
      from: "2025-07-25",
      quotes: [
        "c) Grupo III. Adquisiciones por colaterales de segundo y tercer grado, ascendientes y descendientes por afinidad: 8.000 euros.",
        "Desde 0 y hasta 400.000. 1,0000 1,2706 1,6575 1,7000",
        "Grupo III. Colaterales de segundo y tercer grado por consanguinidad, ascendientes y descendientes por afinidad",
        "en las que los sujetos pasivos sean colaterales de segundo o tercer grado por consanguinidad del causante incluidos en el grupo III del artículo 21 de este texto refundido y no concurran con descendientes o adoptados del causante, o concurran con descendientes o adoptados del causante desheredados, se podrá aplicar una bonificación del 60% sobre la cuota íntegra corregida.",
        "Para el resto de sujetos pasivos del citado grupo III se podrá aplicar una bonificación del 35% sobre la cuota íntegra corregida.",
      ],
    },
  },
  gift: {
    benefit: {
      text: { ca: "Deducció del 100 % de la quota per als grups I i II. En immobles, només si l'escriptura declara un valor no superior al de referència més un 20 % (si no, es paga el 7 % de la base).", es: "Deducción del 100 % de la cuota para los grupos I y II. En inmuebles, solo si la escritura declara un valor no superior al de referencia más un 20 % (si no, se paga el 7 % de la base).", en: "A 100% deduction of the tax for groups I and II. For property, only if the deed declares a value no higher than the reference value plus 20% (otherwise 7% of the base is paid)." },
      cite: { src: "law", art: "54" },
      from: "2025-07-25",
      quotes: [
        "1. En las adquisiciones lucrativas inter vivos en que los sujetos pasivos forman parte de los grupos I o II del artículo 21 de este texto refundido, se podrá aplicar una deducción del 100% sobre la cuota líquida.",
        "se podrá aplicar una deducción cuyo importe sea el resultado de restar a la cuota líquida la cuantía derivada de multiplicar la base liquidable por un tipo porcentual T del 7%.",
        "5. El derecho a aplicar cualquier de las deducciones reguladas en este artículo no exime en ningún caso de la obligación de presentar la autoliquidación del impuesto correspondiente.",
        "3. Para poder aplicar cualquiera de las deducciones de los apartados anteriores de este artículo, en caso de que se adquieran bienes inmuebles, se consignará en la escritura pública correspondiente el valor de los bienes inmuebles adquiridos, que no podrá superar en cada caso el valor de referencia incrementado en un 20% o, cuando no exista este valor de referencia o no se pueda certificar por la Dirección General del Catastro, el valor de mercado.",
      ],
    },
    formal: {
      text: { ca: "En diners, escriptura pública que indiqui l'origen dels fons, degudament justificat; en immobles, el valor declarat a l'escriptura.", es: "En dinero, escritura pública que indique el origen de los fondos, debidamente justificado; en inmuebles, el valor declarado en la escritura.", en: "For cash, a public deed stating where the funds came from, duly justified; for property, the value declared in the deed." },
      cite: { src: "law", art: "54.3 y 54.4" },
      from: "2025-07-25",
      quotes: [
        "3. Para poder aplicar cualquiera de las deducciones de los apartados anteriores de este artículo, en caso de que se adquieran bienes inmuebles, se consignará en la escritura pública correspondiente el valor de los bienes inmuebles adquiridos, que no podrá superar en cada caso el valor de referencia incrementado en un 20% o, cuando no exista este valor de referencia o no se pueda certificar por la Dirección General del Catastro, el valor de mercado.",
        "4. Cuando la adquisición sea en metálico o en cualquiera de los fondos, cuentas o depósitos previstos en el artículo 12 de la Ley 19/1991, de 6 de junio, del impuesto sobre el patrimonio, las deducciones autonómicas reguladas en este artículo solo serán aplicables cuando el origen de los fondos esté debidamente justificado, siempre que, además, la adquisición se documente en escritura pública donde conste el origen de los fondos.",
      ],
    },
  },
  example: {
    kind: "rules",
    rules: {
      reductions: [
        { id: "kinship", label: { ca: "Parentiu", es: "Parentesco", en: "Kinship" }, amount: 25000, cite: { src: "law", art: "21.b" } },
      ],
      home: { percent: 100, cap: 270151.2, cite: { src: "law", art: "23" } },
      scale: [
        { from: 0, quota: 0, rate: 1 },
        { from: 700000, quota: 7000, rate: 8 },
        { from: 1000000, quota: 31000, rate: 11 },
        { from: 2000000, quota: 141000, rate: 15 },
        { from: 3000000, quota: 291000, rate: 20 },
      ],
      scaleCite: { src: "law", art: "33.2" },
      coefficient: 1,
      coefficientCite: { src: "law", art: "34.1" },
      bonus: { kind: "flat", percent: 100 },
      bonusCite: { src: "law", art: "36" },
    },
  },
};

export const CANARIAS: Territory = {
  id: "canarias",
  name: { ca: "Canàries", es: "Canarias", en: "Canary Islands" },
  regime: "common",
  agency: { name: { ca: "Agencia Tributaria Canaria", es: "Agencia Tributaria Canaria", en: "Canary Islands Tax Agency" }, url: "https://www3.gobiernodecanarias.org/tributos/atc/" },
  sources: {
    law: { short: "DL 1/2009 de Canarias", name: "Decreto Legislativo 1/2009, de 21 de abril, por el que se aprueba el Texto Refundido de las disposiciones legales vigentes dictadas por la Comunidad Autónoma de Canarias en materia de tributos cedidos", publisher: "BOE (texto consolidado)", ref: "BOC-j-2009-90008, arts. 20 a 26 sexies; última actualización publicada el 29/12/2025", url: "https://www.boe.es/buscar/act.php?id=BOC-j-2009-90008", read: RULES_AS_OF },
    lisd: STATE_SOURCES.lisd,
  },
  mainSource: "law",
  inheritance: {
    groupII: {
      text: { ca: "Fills de 21 anys o més: 23.125 €; cònjuge: 40.400 €.", es: "Hijos de 21 años o más: 23.125 €; cónyuge: 40.400 €.", en: "Children aged 21+: €23,125; spouse: €40,400." },
      cite: { src: "law", art: "20.b" },
      from: "2012-07-01",
      quotes: [
        "b) Grupo II, adquisiciones por descendientes y adoptados de veintiuno o más años, cónyuges, ascendientes y adoptantes:",
        "– Cónyuge: 40.400 euros",
        "– Hijos o adoptados: 23.125 euros",
        "– Resto de descendientes: 18.500 euros",
        "– Artículo 20: Reducción por parentesco (sustituye a la establecida en el artículo 20.2.a) de la Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones).",
        "5. No obstante lo anterior, siempre serán de aplicación las reducciones establecidas en la normativa estatal reguladora del Impuesto cuando las mismas determinen unas condiciones más favorables para el obligado tributario.",
        "1. Los miembros de las parejas de hecho tienen la asimilación a los cónyuges, con respecto al Impuesto sobre Sucesiones y Donaciones",
      ],
    },
    bonus: {
      text: { ca: "99,9 % per als grups I, II i III.", es: "99,9 % para los grupos I, II y III.", en: "99.9% for groups I, II and III." },
      cite: { src: "law", art: "24 ter" },
      from: "2023-09-06",
      quotes: [
        "Los sujetos pasivos incluidos en los grupos I, II y III de los previstos en el artículo 20.2.a) de la Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones, aplicarán una bonificación del 99,9 por 100 de la cuota tributaria derivada de las adquisiciones mortis causa y de cantidades percibidas por los beneficiarios de seguros sobre la vida que se acumulen al resto de bienes y derechos que integran la porción hereditaria del beneficiario.",
      ],
    },
    home: {
      text: { ca: "99 %, amb un límit de 200.000 € per a tot l'habitatge, repartit entre els hereus; l'habitatge ha de ser a Canàries i s'ha de conservar 5 anys.", es: "99 %, con un límite de 200.000 € para toda la vivienda, repartido entre los herederos; la vivienda debe estar en Canarias y conservarse 5 años.", en: "99%, capped at €200,000 for the whole home, shared among the heirs; the home must be in the Canary Islands and kept 5 years." },
      cite: { src: "law", art: "22 ter" },
      from: "2012-07-01",
      quotes: [
        "se podrá aplicar a la base imponible una reducción del 99 por ciento del valor de tal vivienda, con un límite de 200.000 euros por el valor conjunto de la vivienda, que debe prorratearse entre los sujetos pasivos en proporción a su participación.",
        "Podrán aplicar la citada reducción los parientes colaterales del causante que sean mayores de sesenta y cinco años de edad y hayan convivido con el mismo como mínimo los dos años anteriores a su fallecimiento.",
        "4. Para la aplicación de la reducción establecida en el presente artículo, la vivienda habitual ha de estar radicada en Canarias.",
        "La aplicación de esta reducción queda condicionada al mantenimiento de la vivienda en el patrimonio del adquirente durante los cinco años siguientes al fallecimiento del causante, salvo que el adquirente falleciera en este plazo.",
      ],
    },
    groupIII: {
      text: { ca: "Germans: 9.300 € i la mateixa bonificació del 99,9 % (coeficient 1,5882).", es: "Hermanos: 9.300 € y la misma bonificación del 99,9 % (coeficiente 1,5882).", en: "Siblings: €9,300 and the same 99.9% rebate (coefficient 1.5882)." },
      cite: { src: "law", art: "20.c y 24 ter" },
      from: "2023-09-06",
      quotes: [
        "c) Grupo III, adquisiciones por colaterales de segundo y tercergrado y por ascendientes y descendientes por afinidad: 9.300 euros.",
        { text: "Si la Comunidad Autónoma no hubiese aprobado el coeficiente o la cuantía de los tramos a que se refiere el apartado anterior", src: "lisd" },
        { text: "1,0000 1,5882 2,0000 De más de 402.678,11 a 2.007.380,43", src: "lisd" },
        "Los sujetos pasivos incluidos en los grupos I, II y III de los previstos en el artículo 20.2.a) de la Ley 29/1987",
        "Los sujetos pasivos incluidos en los grupos I, II y III de los previstos en el artículo 20.2.a) de la Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones, aplicarán una bonificación del 99,9 por 100 de la cuota tributaria derivada de las adquisiciones mortis causa y de cantidades percibidas por los beneficiarios de seguros sobre la vida que se acumulen al resto de bienes y derechos que integran la porción hereditaria del beneficiario.",
      ],
    },
  },
  gift: {
    benefit: {
      text: { ca: "Bonificació del 99,9 % per als grups I i II.", es: "Bonificación del 99,9 % para los grupos I y II.", en: "A 99.9% rebate for groups I and II." },
      cite: { src: "law", art: "26 sexies" },
      from: "2023-09-06",
      quotes: [
        "Los sujetos pasivos incluidos en los grupos I y II de los previstos en el artículo 20.2.a) de la Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones, aplicarán una bonificación del 99,9 por 100 de la cuota tributaria derivada de las adquisiciones “inter vivos”, siempre que la donación se formalice en documento público.",
        "Esta bonificación no será aplicable a aquellas adquisiciones “inter vivos” que en los tres años anteriores se hayan beneficiado de la bonificación prevista en este artículo, salvo que, en dicho plazo, se produzca su adquisición “mortis causa”.",
      ],
    },
    formal: {
      text: { ca: "Document públic. La llei no diu res sobre justificar l'origen dels diners.", es: "Documento público. La ley no dice nada sobre justificar el origen del dinero.", en: "A public document. The law says nothing about proving where the money came from." },
      cite: { src: "law", art: "26 sexies" },
      from: "2023-09-06",
      quotes: [
        "siempre que la donación se formalice en documento público. No será necesaria esta formalización cuando se trate de contratos de seguros que deban tributar como donación.",
      ],
    },
  },
  example: {
    kind: "rules",
    rules: {
      reductions: [
        { id: "kinship", label: { ca: "Parentiu (fill)", es: "Parentesco (hijo)", en: "Kinship (child)" }, amount: 23125, cite: { src: "law", art: "20.b" } },
      ],
      home: { percent: 99, cap: 200000, cite: { src: "law", art: "22 ter" } },
      scale: STATE_SCALE,
      scaleCite: { src: "lisd", art: "21.2" },
      coefficient: 1,
      coefficientCite: { src: "lisd", art: "22.2" },
      bonus: { kind: "flat", percent: 99.9 },
      bonusCite: { src: "law", art: "24 ter" },
    },
  },
};

export const CANTABRIA: Territory = {
  id: "cantabria",
  name: { ca: "Cantàbria", es: "Cantabria", en: "Cantabria" },
  regime: "common",
  agency: { name: { ca: "Agencia Cántabra de Administración Tributaria (ACAT)", es: "Agencia Cántabra de Administración Tributaria (ACAT)", en: "Cantabrian Tax Agency (ACAT)" }, url: "https://www.agenciacantabratributaria.es/tributos/sucesiones-y-donaciones" },
  sources: {
    law: { short: "DL 62/2008 de Cantabria", name: "Decreto Legislativo 62/2008, de 19 de junio, por el que se aprueba el texto refundido de la Ley de Medidas Fiscales en materia de Tributos cedidos por el Estado", publisher: "BOE (texto consolidado)", ref: "BOCT-c-2008-90028, arts. 5 a 8; última actualización publicada el 30/04/2026", url: "https://www.boe.es/buscar/act.php?id=BOCT-c-2008-90028", read: RULES_AS_OF },
    acat: { short: "ACAT, Donaciones", name: "Donaciones", publisher: "Agencia Cántabra de Administración Tributaria (ACAT)", ref: "página de la agencia", url: "https://www.agenciacantabratributaria.es/tributos/sucesiones-y-donaciones/donaciones", read: RULES_AS_OF },
  },
  mainSource: "law",
  inheritance: {
    groupII: {
      text: { ca: "Fills i cònjuge: 50.000 €.", es: "Hijos y cónyuge: 50.000 €.", en: "Children and spouse: €50,000." },
      cite: { src: "law", art: "5.A).1.b" },
      from: "2024-01-01",
      quotes: [
        "1. Mejora reducción por parentesco.",
        "b) Grupo II (adquisiciones por descendientes y adoptados de veintiún años o más, cónyuges y ascendientes y adoptantes): 50.000 euros.",
        "Se asimilan a la condición de cónyuges los miembros de parejas de hecho cuya unión cumpla los requisitos establecidos en la Ley 1/2005, de 16 de mayo, de parejas de hecho de la Comunidad Autónoma de Cantabria",
      ],
    },
    bonus: {
      text: { ca: "100 % per als grups I i II, sense límits, sobre la quota de la seva tarifa (del 7,65 % al 34 %).", es: "100 % para los grupos I y II, sin límites, sobre la cuota de su tarifa (del 7,65 % al 34 %).", en: "100% for groups I and II, with no limits, on the tax from its scale (7.65% to 34%)." },
      cite: { src: "law", art: "8.1" },
      from: "2024-01-01",
      quotes: [
        "Se establece una bonificación autonómica del 100 por ciento de la cuota tributaria en las adquisiciones",
        "de los contribuyentes incluidos en los Grupos I y II del artículo 5.A) 1 de la presente ley.",
        "la cuota íntegra del impuesto se obtendrá aplicando a la base liquidable, calculada según lo dispuesto en el apartado anterior, la escala siguiente:",
        "0,00 7.993,46 7,65 7.993,46 611,50 7.987,45 8,50",
        "119.757,67 15.606,22 39.877,16 18,70",
        "797.555,08 199.291,40 en adelante 34,00",
      ],
    },
    home: {
      text: { ca: "95 %, fins a 125.000 € per hereu. Cal conservar-lo 5 anys.", es: "95 %, hasta 125.000 € por heredero. Hay que conservarla 5 años.", en: "95%, up to €125,000 per heir. It must be kept 5 years." },
      cite: { src: "law", art: "5.A).5" },
      from: "2026-05-01",
      quotes: [
        "5. Mejora de la reducción por adquisición de vivienda habitual: En las adquisiciones mortis causa de los grupos I, II y III de la vivienda habitual del causante, puede aplicarse a la base imponible una reducción del 95 % del valor de la misma, con un límite de 125.000 euros por cada sujeto pasivo, siempre que la adquisición se mantenga durante los cinco años siguientes al fallecimiento del causante, salvo que falleciera el adquirente dentro de ese plazo.",
        "Los parientes colaterales del causante, para poder disfrutar de la reducción establecida en el apartado 1, han de ser mayores de sesenta y cinco años y han de haber convivido con el mismo como mínimo los dos años anteriores a su muerte, excluyéndose del cómputo el periodo de tiempo que el causante hubiera residido en un centro de atención a personas mayores inmediatamente antes de su fallecimiento.",
        "pueden considerarse como vivienda habitual, además de ésta, un trastero y hasta dos plazas de aparcamiento",
      ],
    },
    groupIII: {
      text: { ca: "Germans: 25.000 € i bonificació del 50 % (nebots, oncles i afins: 8.000 €, sense bonificació); coeficient 1,5882.", es: "Hermanos: 25.000 € y bonificación del 50 % (sobrinos, tíos y afines: 8.000 €, sin bonificación); coeficiente 1,5882.", en: "Siblings: €25,000 and a 50% rebate (nephews, nieces, uncles, aunts and in-laws: €8,000, no rebate); coefficient 1.5882." },
      cite: { src: "law", art: "5.A).1.c y 8.1" },
      from: "2024-01-01",
      quotes: [
        "Colaterales de segundo grado por consanguinidad: 25.000 euros.",
        "Resto de grupo III: 8.000 euros.",
        "De 0 a 403.000 1,0000 1,5882 2,0000",
        "De 403.000,01 a 2.007.000 1,0500 1,6676 2,1000",
        "Igualmente, se establece una bonificación autonómica del 50 por ciento en las adquisiciones",
        "para los colaterales de segundo grado por consanguinidad del Grupo III del artículo 5.A)1 de la presente ley.",
      ],
    },
  },
  gift: {
    benefit: {
      text: { ca: "Bonificació del 100 % per als grups I i II.", es: "Bonificación del 100 % para los grupos I y II.", en: "A 100% rebate for groups I and II." },
      cite: { src: "law", art: "8.3" },
      from: "2024-01-01",
      quotes: [
        "3. Se crea una bonificación autonómica del 100 por ciento en la cuota tributaria en las donaciones realizadas entre los Grupos I y II del artículo 5.A)1 de la presente norma.",
      ],
    },
    formal: {
      text: { ca: "La llei no exigeix document públic ni justificar l'origen dels diners; l'ACAT admet un document privat de donació i demana el justificant de la transferència.", es: "La ley no exige documento público ni justificar el origen del dinero; la ACAT admite un documento privado de donación y pide el justificante de la transferencia.", en: "The law requires no public document and no proof of where the money came from; the ACAT accepts a private gift document and asks for the transfer receipt." },
      cite: { src: "law", art: "8.3" },
      from: "2024-01-01",
      quotes: [
        { text: "La declaración tributaria, en escritura pública (copia autorizada y copia simple) o documento privado (original y copia), y deberá contener:", src: "acat" },
        { text: "Dispone de este modelo de documento privado de donación.", src: "acat" },
        { text: "En donaciones de dinero, deberá presentar justificante de la transferencia bancaria o del cargo en una cuenta y posterior ingreso en la del donatario.", src: "acat" },
        { text: "El plazo de presentación de la declaración y los documentos asociados será de 30 DÍAS HÁBILES", src: "acat" },
      ],
    },
  },
  example: {
    kind: "rules",
    rules: {
      reductions: [
        { id: "kinship", label: { ca: "Parentiu", es: "Parentesco", en: "Kinship" }, amount: 50000, cite: { src: "law", art: "5.A).1.b" } },
      ],
      home: { percent: 95, cap: 125000, cite: { src: "law", art: "5.A).5" } },
      scale: [
        { from: 0, quota: 0, rate: 7.65 },
        { from: 7993.46, quota: 611.5, rate: 8.5 },
        { from: 15980.91, quota: 1290.43, rate: 9.35 },
        { from: 23968.36, quota: 2037.26, rate: 10.2 },
        { from: 31955.81, quota: 2851.98, rate: 11.05 },
        { from: 39943.26, quota: 3734.59, rate: 11.9 },
        { from: 47930.72, quota: 4685.1, rate: 12.75 },
        { from: 55918.17, quota: 5703.5, rate: 13.6 },
        { from: 63905.62, quota: 6789.79, rate: 14.45 },
        { from: 71893.07, quota: 7943.98, rate: 15.3 },
        { from: 79880.52, quota: 9166.06, rate: 16.15 },
        { from: 119757.67, quota: 15606.22, rate: 18.7 },
        { from: 159634.83, quota: 23063.25, rate: 21.25 },
        { from: 239389.13, quota: 40011.04, rate: 25.5 },
        { from: 398777.54, quota: 80655.08, rate: 29.75 },
        { from: 797555.08, quota: 199291.4, rate: 34 },
      ],
      scaleCite: { src: "law", art: "6.1" },
      coefficient: 1,
      coefficientCite: { src: "law", art: "7.2" },
      bonus: { kind: "flat", percent: 100 },
      bonusCite: { src: "law", art: "8.1" },
    },
  },
};

export const CASTILLA_LA_MANCHA: Territory = {
  id: "castilla-la-mancha",
  name: { ca: "Castella-la Manxa", es: "Castilla-La Mancha", en: "Castilla-La Mancha" },
  regime: "common",
  agency: { name: { ca: "Portal Tributari de Castella-la Manxa", es: "Portal Tributario de Castilla-La Mancha", en: "Castilla-La Mancha tax portal" }, url: "https://portaltributario.jccm.es/informacion-tributaria/beneficios-fiscales-en-el-impuesto-sobre-sucesiones-y-donaciones" },
  sources: {
    law: { short: "Ley 8/2013 de Castilla-La Mancha", name: "Ley 8/2013, de 21 de noviembre, de Medidas Tributarias de Castilla-La Mancha", publisher: "BOE (texto consolidado)", ref: "BOE-A-2014-1368, arts. 17, 17 bis y 18; última actualización publicada el 30/03/2026", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2014-1368", read: RULES_AS_OF },
    lisd: STATE_SOURCES.lisd,
  },
  mainSource: "law",
  inheritance: {
    groupII: {
      text: { ca: "Fills i cònjuge: 15.956,87 € (reducció estatal; la comunitat no en té una de pròpia).", es: "Hijos y cónyuge: 15.956,87 € (reducción estatal; la comunidad no tiene una propia).", en: "Children and spouse: €15,956.87 (the state reduction; the region has none of its own)." },
      cite: { src: "lisd", art: "20.2.a" },
      from: "2012-12-28",
      quotes: [
        "Grupo II: adquisiciones por descendientes y adoptados de veintiuno o más años, cónyuges, ascendientes y adoptantes, 15.956,87 euros.",
      ],
    },
    bonus: {
      text: { ca: "Un sol percentatge sobre tota la quota segons la base liquidable: 100 % amb menys de 175.000 €; 95 % des de 175.000 €; 90 % des de 225.000 €; 85 % des de 275.000 €; 80 % des de 300.000 €.", es: "Un solo porcentaje sobre toda la cuota según la base liquidable: 100 % con menos de 175.000 €; 95 % desde 175.000 €; 90 % desde 225.000 €; 85 % desde 275.000 €; 80 % desde 300.000 €.", en: "One percentage on the whole tax, set by the net taxable base: 100% under €175,000; 95% from €175,000; 90% from €225,000; 85% from €275,000; 80% from €300,000." },
      cite: { src: "law", art: "17.1" },
      from: "2016-06-01",
      quotes: [
        "En las adquisiciones “mortis causa”, incluida la percepción de cantidades por beneficiarios de contratos de seguros sobre la vida, se establecen las siguientes bonificaciones en la cuota del Impuesto sobre Sucesiones y Donaciones:",
        "1) En función del importe de la base liquidable de sus respectivas declaraciones tributarias, los sujetos pasivos incluidos en los grupos I y II de parentesco previstos en el artículo 20.2.a) de la Ley 29/1987, de 18 de diciembre, podrán aplicarse en la cuota tributaria la que corresponda de las siguientes bonificaciones:",
        "a) Declaraciones tributarias cuya base liquidable sea inferior a 175.000 euros, una bonificación del 100 por ciento de la cuota tributaria.",
        "b) Declaraciones tributarias cuya base liquidable sea igual o superior a 175.000 euros e inferior a 225.000 euros, una bonificación del 95 por ciento de la cuota tributaria.",
        "c) Declaraciones tributarias cuya base liquidable sea igual o superior a 225.000 euros e inferior a 275.000 euros, una bonificación del 90 por ciento de la cuota tributaria.",
        "d) Declaraciones tributarias cuya base liquidable sea igual o superior a 275.000 euros e inferior a 300.000 euros, una bonificación del 85 por ciento de la cuota tributaria.",
        "e) Declaraciones tributarias cuya base liquidable sea igual o superior a 300.000 euros, una bonificación del 80 por ciento de la cuota tributaria.",
        "se asimilan a cónyuges los miembros de parejas de hecho que hayan tenido convivencia estable de pareja durante, al menos, los dos años anteriores a la fecha de devengo del impuesto",
      ],
    },
    home: {
      text: { ca: "Regla estatal: 95 %, fins a 122.606,47 € per hereu. Cal conservar-lo 10 anys.", es: "Regla estatal: 95 %, hasta 122.606,47 € por heredero. Hay que conservarla 10 años.", en: "State rule: 95%, up to €122,606.47 per heir. It must be kept 10 years." },
      cite: { src: "lisd", art: "20.2.c" },
      from: "2012-12-28",
      quotes: [
        "otra del 95 por 100 del mencionado valor, siempre que la adquisición se mantenga, durante los diez años siguientes al fallecimiento del causante, salvo que falleciera el adquirente dentro de ese plazo.",
        "Del mismo porcentaje de reducción, con el límite de 122.606,47 euros para cada sujeto pasivo y con el requisito de permanencia señalado anteriormente, gozarán las adquisiciones \"mortis causa\" de la vivienda habitual de la persona fallecida, siempre que los causahabientes sean cónyuge, ascendientes o descendientes de aquél, o bien pariente colateral mayor de sesenta y cinco años que hubiese convivido con el causante durante los dos años anteriores al fallecimiento.",
      ],
    },
    groupIII: {
      text: { ca: "Germans: 7.993,46 € (estatal), sense bonificació (coeficient 1,5882).", es: "Hermanos: 7.993,46 € (estatal), sin bonificación (coeficiente 1,5882).", en: "Siblings: €7,993.46 (state), no rebate (coefficient 1.5882)." },
      cite: { src: "lisd", art: "20.2.a" },
      from: "2012-12-28",
      quotes: [
        "Grupo III: adquisiciones por colaterales de segundo y tercer grado, ascendientes y descendientes por afinidad, 7.993,46 euros.",
        "se aplicará el que corresponda de los que se indican a continuación, establecidos en función del patrimonio preexistente del contribuyente",
        "De 0 a 402.678,11",
        "1,0000 1,5882 2,0000 De más de 402.678,11 a 2.007.380,43",
      ],
    },
  },
  gift: {
    benefit: {
      text: { ca: "Bonificació segons la base liquidable: 95 % amb menys de 120.000 €; 90 % des de 120.000 €; 85 % des de 240.000 €.", es: "Bonificación según la base liquidable: 95 % con menos de 120.000 €; 90 % desde 120.000 €; 85 % desde 240.000 €.", en: "A rebate set by the net taxable base: 95% under €120,000; 90% from €120,000; 85% from €240,000." },
      cite: { src: "law", art: "17 bis.1" },
      from: "2016-06-01",
      quotes: [
        "En las adquisiciones “inter vivos”, incluida la percepción de cantidades por beneficiarios de contratos de seguros sobre la vida, se establecen las siguientes bonificaciones en la cuota del Impuesto sobre Sucesiones y Donaciones:",
        "a) Declaraciones tributarias cuya base liquidable sea inferior a 120.000 euros, una bonificación del 95 por ciento de la cuota tributaria.",
        "b) Declaraciones tributarias cuya base liquidable sea igual o superior a 120.000 euros e inferior a 240.000 euros, una bonificación del 90 por ciento de la cuota tributaria.",
        "c) Declaraciones tributarias cuya base liquidable sea igual o superior a 240.000 euros, una bonificación del 85 por ciento de la cuota tributaria.",
        "el plazo de presentación de las declaraciones y de las autoliquidaciones será de un mes, contado a partir de la fecha de devengo del correspondiente impuesto.",
      ],
    },
    formal: {
      text: { ca: "Escriptura pública en què consti l'origen i la situació del que es dona (també dels diners); si no són diners, conservar-ho 5 anys.", es: "Escritura pública en la que conste el origen y la situación de lo donado (también del dinero); si no es dinero, conservarlo 5 años.", en: "A public deed stating the origin and situation of what is given (cash included); if it is not cash, it must be kept 5 years." },
      cite: { src: "law", art: "18.3" },
      from: "2016-06-01",
      quotes: [
        "3. En el caso de transmisiones lucrativas “inter vivos”, la aplicación de las bonificaciones establecidas en el artículo 17 bis queda sujeta al cumplimiento de los siguientes requisitos:",
        "a) La transmisión deberá formalizarse en escritura pública, en la que expresamente deberá constar el origen y situación de los bienes y derechos transmitidos, así como su correcta y completa identificación fiscal cuando se trate de bienes o derechos no consistentes en dinero o signo que lo represente.",
        "b) En transmisiones de bienes o derechos no consistentes en dinero o signo que lo represente, los bienes y derechos donados no podrán ser objeto de transmisión y deberán mantenerse en el patrimonio del adquirente durante los cinco años siguientes a la fecha de devengo del impuesto.",
      ],
    },
  },
  example: {
    kind: "rules",
    rules: {
      reductions: [
        { id: "kinship", label: { ca: "Parentiu (estatal)", es: "Parentesco (estatal)", en: "Kinship (state)" }, amount: 15956.87, cite: { src: "lisd", art: "20.2.a" } },
      ],
      home: { percent: 95, cap: 122606.47, cite: { src: "lisd", art: "20.2.c" } },
      scale: STATE_SCALE,
      scaleCite: { src: "lisd", art: "21.2" },
      coefficient: 1,
      coefficientCite: { src: "lisd", art: "22.2" },
      bonus: { kind: "by-base", rows: [{ from: 0, percent: 100 }, { from: 175000, percent: 95 }, { from: 225000, percent: 90 }, { from: 275000, percent: 85 }, { from: 300000, percent: 80 }] },
      bonusCite: { src: "law", art: "17.1" },
    },
  },
};

export const CASTILLA_Y_LEON: Territory = {
  id: "castilla-y-leon",
  name: { ca: "Castella i Lleó", es: "Castilla y León", en: "Castile and León" },
  regime: "common",
  agency: { name: { ca: "Tributs de Castella i Lleó (Junta de Castilla y León)", es: "Tributos de Castilla y León (Junta de Castilla y León)", en: "Castile and León tax office (Junta de Castilla y León)" }, url: "https://tributos.jcyl.es/web/es/beneficios-fiscales/impuesto-sobre-sucesiones-donaciones.html" },
  sources: {
    law: { short: "DL 1/2013 de Castilla y León", name: "Decreto Legislativo 1/2013, de 12 de septiembre, por el que se aprueba el texto refundido de las disposiciones legales de la Comunidad de Castilla y León en materia de tributos propios y cedidos", publisher: "BOE (texto consolidado)", ref: "BOCL-h-2013-90254, arts. 13 a 20 bis; última actualización publicada el 14/05/2024", url: "https://www.boe.es/buscar/act.php?id=BOCL-h-2013-90254", read: RULES_AS_OF },
    lisd: STATE_SOURCES.lisd,
  },
  mainSource: "law",
  inheritance: {
    groupII: {
      text: { ca: "Fills i cònjuge: 60.000 € i una reducció variable que completa fins a 400.000 € el total de les seves reduccions (inclosa la de l'habitatge).", es: "Hijos y cónyuge: 60.000 € y una reducción variable que completa hasta 400.000 € el total de sus reducciones (la de la vivienda incluida).", en: "Children and spouse: €60,000 plus a variable reduction that brings all their reductions (the home's included) up to €400,000." },
      cite: { src: "law", art: "13.1" },
      from: "2018-01-01",
      quotes: [
        "a) En el caso de descendientes y adoptados de veintiún o más años, cónyuges, ascendientes y adoptantes, 60.000 euros.",
        "Las reducciones de la base imponible del impuesto reguladas en los artículos 12 y 13.1, letras a) y b) constituyen mejoras de las reducciones estatales y serán aplicables en sustitución de las reducciones establecidas por la normativa estatal.",
        "Se asimilan a los cónyuges los miembros de uniones de hecho que hayan tenido convivencia estable de pareja durante, al menos, dos años anteriores a la fecha de devengo del impuesto",
        "c) Una reducción variable calculada como la diferencia entre 400.000 euros y la suma de las siguientes cantidades:",
        "Las reducciones que les pudieran corresponder por aplicación de la normativa estatal.",
        "La reducción que les corresponda por aplicación de las letras a) y b) de este apartado.",
        "Las reducciones que les pudieran corresponder por aplicación de los artículos 12, 14, 15, 16 y 17 de este texto refundido.",
        "2. En el caso en que la diferencia a la que se refiere la letra c) del apartado anterior sea de signo negativo, el importe de la reducción regulada en esta letra será de cero.",
      ],
    },
    bonus: {
      text: { ca: "99 % per al cònjuge, els descendents i els ascendents.", es: "99 % para el cónyuge, los descendientes y los ascendientes.", en: "99% for the spouse, descendants and ascendants." },
      cite: { src: "law", art: "17 bis" },
      from: "2021-05-09",
      quotes: [
        "y de cantidades percibidas por los beneficiarios de seguros sobre la vida que se acumulen al resto de los bienes y derechos que integran la porción hereditaria",
        "se aplicará una bonificación del 99 por 100 siempre que el adquirente sea cónyuge, descendiente o adoptado, o ascendiente o adoptante del causante.",
      ],
    },
    home: {
      text: { ca: "Regla estatal: 95 %, fins a 122.606,47 € per hereu, conservant-lo 10 anys; per a fills i cònjuge compta dins dels 400.000 €.", es: "Regla estatal: 95 %, hasta 122.606,47 € por heredero, conservándola 10 años; para hijos y cónyuge cuenta dentro de los 400.000 €.", en: "State rule: 95%, up to €122,606.47 per heir, kept 10 years; for children and the spouse it counts within the €400,000." },
      cite: { src: "lisd", art: "20.2.c" },
      from: "2012-12-28",
      quotes: [
        "otra del 95 por 100 del mencionado valor, siempre que la adquisición se mantenga, durante los diez años siguientes al fallecimiento del causante, salvo que falleciera el adquirente dentro de ese plazo.",
        "Del mismo porcentaje de reducción, con el límite de 122.606,47 euros para cada sujeto pasivo y con el requisito de permanencia señalado anteriormente, gozarán las adquisiciones \"mortis causa\" de la vivienda habitual de la persona fallecida, siempre que los causahabientes sean cónyuge, ascendientes o descendientes de aquél, o bien pariente colateral mayor de sesenta y cinco años que hubiese convivido con el causante durante los dos años anteriores al fallecimiento.",
      ],
    },
    groupIII: {
      text: { ca: "Germans: 7.993,46 € (estatal), sense bonificació (coeficient 1,5882).", es: "Hermanos: 7.993,46 € (estatal), sin bonificación (coeficiente 1,5882).", en: "Siblings: €7,993.46 (state), no rebate (coefficient 1.5882)." },
      cite: { src: "lisd", art: "20.2.a" },
      from: "2012-12-28",
      quotes: [
        "Grupo III: adquisiciones por colaterales de segundo y tercer grado, ascendientes y descendientes por afinidad, 7.993,46 euros.",
        "se aplicará el que corresponda de los que se indican a continuación, establecidos en función del patrimonio preexistente del contribuyente",
        "De 0 a 402.678,11",
        "1,0000 1,5882 2,0000 De más de 402.678,11 a 2.007.380,43",
      ],
    },
  },
  gift: {
    benefit: {
      text: { ca: "Bonificació del 99 % per al cònjuge, els descendents i els ascendents. Diners per al primer habitatge habitual a Castella i Lleó d'un fill menor de 36 anys: reducció del 99 %, fins a 180.000 €.", es: "Bonificación del 99 % para el cónyuge, los descendientes y los ascendientes. Dinero para la primera vivienda habitual en Castilla y León de un hijo menor de 36 años: reducción del 99 %, hasta 180.000 €.", en: "A 99% rebate for the spouse, descendants and ascendants. Cash for a first habitual home in Castile and León for a child under 36: a 99% reduction, up to €180,000." },
      cite: { src: "law", art: "20 bis y 19" },
      from: "2021-05-09",
      quotes: [
        "1. En la cuota del impuesto sobre sucesiones y donaciones derivada de adquisiciones lucrativas «inter vivos», se aplicará una bonificación del 99 por 100 siempre que el adquirente sea cónyuge, descendiente o adoptado, o ascendiente o adoptante del donante.",
        "1. En la donación de dinero destinado a la adquisición de la primera vivienda habitual efectuada por ascendientes, adoptantes o por aquellas personas que hubieran realizado un acogimiento familiar permanente o preadoptivo, se aplicará una reducción del 99 por 100 del importe de la donación, siempre que se cumplan los siguientes requisitos:",
        "a) Que el donatario tenga menos de 36 años o la consideración legal de persona con discapacidad en grado igual o superior al 65 por 100 en la fecha de la formalización de la donación.",
        "c) Que la vivienda esté situada en el territorio de la Comunidad de Castilla y León.",
        "d) Que la adquisición de la vivienda se efectúe dentro del período de autoliquidación del impuesto correspondiente a la donación, debiendo aportar el documento en el que se formalice la compraventa.",
        "180.000 euros, con carácter general.",
      ],
    },
    formal: {
      text: { ca: "Document públic; en diners o comptes, l'origen dels fons justificat i declarat en aquest mateix document.", es: "Documento público; en dinero o cuentas, el origen de los fondos justificado y manifestado en ese mismo documento.", en: "A public document; for cash or accounts, the origin of the funds justified and stated in that same document." },
      cite: { src: "law", art: "20 bis" },
      from: "2021-05-09",
      quotes: [
        "2. Será requisito necesario para la aplicación de esta bonificación que la donación se formalice en documento público.",
        "3. Cuando la donación sea en metálico o en cualquiera de los bienes o derechos contemplados en el artículo 12 de la Ley 19/1991, de 6 de junio, del Impuesto sobre el Patrimonio, la bonificación sólo será aplicable cuando el origen de los fondos donados esté debidamente justificado y se manifieste, en el propio documento público en que se formalice la transmisión, el origen de dichos fondos.",
      ],
    },
  },
  example: {
    kind: "rules",
    rules: {
      reductions: [
        { id: "kinship", label: { ca: "Parentiu", es: "Parentesco", en: "Kinship" }, amount: 60000, cite: { src: "law", art: "13.1.a" } },
        { id: "cyl-400k", label: { ca: "Reducció variable fins a 400.000 €", es: "Reducción variable hasta 400.000 €", en: "Variable reduction up to €400,000" }, topUpTo: 400000, cite: { src: "law", art: "13.1.c" } },
      ],
      home: { percent: 95, cap: 122606.47, cite: { src: "lisd", art: "20.2.c" } },
      scale: STATE_SCALE,
      scaleCite: { src: "lisd", art: "21.2" },
      coefficient: 1,
      coefficientCite: { src: "lisd", art: "22.2" },
      bonus: { kind: "flat", percent: 99 },
      bonusCite: { src: "law", art: "17 bis" },
    },
  },
};

export const EXTREMADURA: Territory = {
  id: "extremadura",
  name: { ca: "Extremadura", es: "Extremadura", en: "Extremadura" },
  regime: "common",
  agency: { name: { ca: "Portal Tributari de la Junta d'Extremadura", es: "Portal Tributario de la Junta de Extremadura", en: "Extremadura tax portal" }, url: "https://portaltributario.juntaex.es/" },
  sources: {
    law: { short: "DL 1/2018 de Extremadura", name: "Decreto Legislativo 1/2018, de 10 de abril, por el que se aprueba el texto refundido de las disposiciones legales de la Comunidad Autónoma de Extremadura en materia de tributos cedidos por el Estado", publisher: "BOE (texto consolidado)", ref: "BOE-A-2018-8159, arts. 16 a 31; última actualización publicada el 04/08/2026", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2018-8159", read: RULES_AS_OF },
    lisd: STATE_SOURCES.lisd,
    ley2_2026: { short: "Ley 2/2026 de Extremadura", name: "Ley 2/2026, de 3 de agosto, de Presupuestos Generales de la Comunidad Autónoma de Extremadura para el año 2026", publisher: "BOE", ref: "BOE-A-2026-17839, disposición final segunda", url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2026-17839", read: RULES_AS_OF },
  },
  mainSource: "law",
  inheritance: {
    groupII: {
      text: { ca: "Fills i cònjuge: 500.000 € (substitueix l'estatal).", es: "Hijos y cónyuge: 500.000 € (sustituye a la estatal).", en: "Children and spouse: €500,000 (replacing the state one)." },
      cite: { src: "law", art: "17" },
      from: "2024-01-01",
      quotes: [
        "Para el cálculo de la base liquidable resultarán aplicables las reducciones recogidas en el artículo 20.2 de la Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones, con las especialidades que se establecen en los artículos siguientes.",
        "Los causahabientes incluidos dentro de los grupos I y II del artículo 20.2.a) de la Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones, podrán aplicarse una reducción en la base imponible de 500.000 euros.",
      ],
    },
    bonus: {
      text: { ca: "99 % per als grups I i II, si l'autoliquidació es presenta dins de termini (6 mesos).", es: "99 % para los grupos I y II, si la autoliquidación se presenta en plazo (6 meses).", en: "99% for groups I and II, if the return is filed on time (6 months)." },
      cite: { src: "law", art: "20" },
      from: "2018-05-24",
      quotes: [
        "1. En las adquisiciones «mortis causa» por sujetos pasivos incluidos en los grupos I y II del artículo 20.2.a) de la Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones, incluidas las cantidades percibidas por las personas beneficiarias de seguros sobre la vida, se practicará una bonificación autonómica del 99 % del importe de la cuota.",
        "2. El disfrute de este beneficio fiscal requiere que los obligados tributarios realicen la presentación de la declaración o autoliquidación del impuesto en el plazo reglamentariamente establecido.",
        "1. El plazo de presentación de las declaraciones o autoliquidaciones derivadas de los hechos imponibles sujetos al Impuesto sobre Sucesiones y Donaciones en las adquisiciones «mortis causa», será de seis meses, y en las adquisiciones por donación o título equiparable, de un mes.",
      ],
    },
    home: {
      text: { ca: "Regla estatal: 95 %, fins a 122.606,47 € per hereu. Cal conservar-lo 10 anys.", es: "Regla estatal: 95 %, hasta 122.606,47 € por heredero. Hay que conservarla 10 años.", en: "State rule: 95%, up to €122,606.47 per heir. It must be kept 10 years." },
      cite: { src: "lisd", art: "20.2.c" },
      from: "2012-12-28",
      quotes: [
        "otra del 95 por 100 del mencionado valor, siempre que la adquisición se mantenga, durante los diez años siguientes al fallecimiento del causante, salvo que falleciera el adquirente dentro de ese plazo.",
        "Del mismo porcentaje de reducción, con el límite de 122.606,47 euros para cada sujeto pasivo y con el requisito de permanencia señalado anteriormente, gozarán las adquisiciones \"mortis causa\" de la vivienda habitual de la persona fallecida",
      ],
    },
    groupIII: {
      text: { ca: "Germans: 7.993,46 € (estatal), sense bonificació (coeficient 1,5882), llevat que estiguin inscrits com a «persones amb especial vinculació» (per exemple, per convivència efectiva els tres últims anys), que reben els beneficis dels grups I i II.", es: "Hermanos: 7.993,46 € (estatal), sin bonificación (coeficiente 1,5882), salvo que estén inscritos como «personas con especial vinculación» (por ejemplo, por convivencia efectiva los tres últimos años), que reciben los beneficios de los grupos I y II.", en: "Siblings: €7,993.46 (state), no rebate (coefficient 1.5882), unless registered as \"persons with a special bond\" (for example, after living with the deceased for the last three years), who get the group I-II benefits." },
      cite: { src: "lisd", art: "20.2.a" },
      from: "2026-08-05",
      quotes: [
        "Grupo III: adquisiciones por colaterales de segundo y tercer grado, ascendientes y descendientes por afinidad, 7.993,46 euros.",
        "De 0 a 402.678,11",
        "1,0000 1,5882 2,0000 De más de 402.678,11",
        "1,0000 1,5882 2,0000 De más de 402.678,11 a 2.007.380,43",
        { text: "d) Las personas que acrediten convivencia efectiva durante los tres últimos años de vida del causante", src: "law" },
        { text: "1. Se extienden los beneficios fiscales que se encuentren vigentes en la normativa autonómica para los grupos I y II de parentesco", src: "law" },
        { text: "2. El disfrute de estos beneficios fiscales requiere que los obligados tributarios figuren inscritos en el Registro Autonómico al que se refiere el artículo anterior.", src: "law" },
      ],
    },
  },
  gift: {
    benefit: {
      text: { ca: "Bonificació del 99 % per als grups I i II si la base liquidable no passa de 300.000 € (per sobre, una regla del 50 % de redacció poc clara). Diners o habitatge per al primer habitatge habitual d'un fill menor de 36 anys: reducció del 100 %, fins a 200.000 €.", es: "Bonificación del 99 % para los grupos I y II si la base liquidable no pasa de 300.000 € (por encima, una regla del 50 % de redacción poco clara). Dinero o vivienda para la primera vivienda habitual de un hijo menor de 36 años: reducción del 100 %, hasta 200.000 €.", en: "A 99% rebate for groups I and II if the net taxable base is no more than €300,000 (above it, a 50% rule whose wording is unclear). Cash or a home for the first habitual home of a child under 36: a 100% reduction, up to €200,000." },
      cite: { src: "law", art: "30, 21 y 22" },
      from: "2026-08-05",
      quotes: [
        "se aplicará una bonificación del 99 % de la cuota tributaria derivada de las mismas si la base liquidable es inferior o igual a 300.000 euros.",
        "La bonificación será del 50 % para la parte de base liquidable que supere los 300.000 euros con el límite de 600.000 euros.",
        "No obstante, cuando el donatario tenga la consideración legal de persona con discapacidad los límites establecidos anteriormente se incrementarán hasta 450.000 euros y 750.000 euros, respectivamente.",
        "6. El disfrute de este beneficio fiscal requiere que los obligados tributarios realicen la presentación de la declaración o autoliquidación del impuesto en el plazo legalmente establecido.",
        "1. En las donaciones a los hijos y descendientes de cantidades de dinero destinadas a la adquisición de su primera vivienda en propiedad, que vaya a constituir su vivienda habitual, se aplicará una reducción propia de la Comunidad del 100 % sobre las cantidades donadas, en los primeros 200.000 euros, siempre y cuando se cumplan los siguientes requisitos:",
        "a) Que el sujeto pasivo tenga, en la fecha en la que se formalice la donación, menos de 36 años cumplidos.",
        "c) Que la entrega se realice mediante transferencia bancaria, tarjeta de crédito o débito, cheque nominativo o ingreso en cuenta en entidad de crédito.",
        "d) Que la donación, siempre que la cantidad donada supere los 10.000 euros, se formalice en escritura pública.",
        "2. No tienen derecho a esta reducción los contribuyentes con un patrimonio preexistente superior al del primer tramo de la escala establecida en el artículo 22 de la Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones.",
        "1. En las donaciones a los hijos y descendientes de una vivienda que vaya a constituir su residencia habitual, se aplicará una reducción propia de la comunidad del 100 % sobre el valor neto de adquisición de la vivienda, en los primeros 200.000 euros, siempre y cuando se cumplan los siguientes requisitos:",
        "3. La aplicación de esta reducción se encuentra condicionada a que se haga constar en la escritura pública en la que se formalice la donación que el inmueble va a constituir la primera vivienda habitual para el donatario o donatarios y el compromiso de no transmitirla en los cinco años siguientes a su adquisición.",
      ],
    },
    formal: {
      text: { ca: "Document públic si la base supera 10.000 € (sumant tres anys del mateix donant); en diners, lliurament per mitjans bancaris, autoliquidació en un mes amb el justificant i l'origen dels fons justificat i expressat al document.", es: "Documento público si la base supera 10.000 € (sumando tres años del mismo donante); en dinero, entrega por medios bancarios, autoliquidación en un mes con el justificante y el origen de los fondos justificado y expreso en el documento.", en: "A public document if the base exceeds €10,000 (adding up three years from the same donor); for cash, a bank payment, the return within a month with the receipt, and the origin of the funds justified and stated in the document." },
      cite: { src: "law", art: "30.1 y 30.4" },
      from: "2026-08-05",
      quotes: [
        "Cuando la base imponible sea superior a 10.000 euros será requisito necesario para la aplicación de esta bonificación que la donación se formalice en documento público, salvo que las cantidades donadas deriven de un contrato de seguro.",
        "la bonificación solo resultará aplicable cuando la entrega se haya realizado mediante transferencia bancaria, tarjeta de crédito o débito, cheque nominativo o ingreso en cuenta en entidad de crédito y siempre que, en el plazo de un mes desde que se produjo dicha entrega, se presente la correspondiente declaración o autoliquidación, acompañada del justificante bancario de entrega y del documento, público o privado, en el que se formalice la transmisión.",
        "Será requisito necesario para la aplicación de la bonificación que el origen de los fondos donados esté debidamente justificado y que se haga constar, expresamente, en el documento en que se formalice la donación.",
        "3. La aplicación de los beneficios fiscales establecidos por la Comunidad Autónoma de Extremadura en el marco de su competencia normativa, relativos a tributos cedidos, queda condicionada a que el abono de las cantidades satisfechas por el negocio jurídico que origine el derecho a su aplicación se realice mediante tarjeta de crédito o débito, transferencia bancaria, cheque nominativo o ingreso en cuentas en entidades de crédito.",
      ],
    },
  },
  example: {
    kind: "rules",
    rules: {
      reductions: [
        { id: "kinship", label: { ca: "Parentiu (millorada)", es: "Parentesco (mejorada)", en: "Kinship (improved)" }, amount: 500000, cite: { src: "law", art: "17" } },
      ],
      home: { percent: 95, cap: 122606.47, cite: { src: "lisd", art: "20.2.c" } },
      scale: STATE_SCALE,
      scaleCite: { src: "lisd", art: "21.2" },
      coefficient: 1,
      coefficientCite: { src: "lisd", art: "22.2" },
      bonus: { kind: "flat", percent: 99 },
      bonusCite: { src: "law", art: "20" },
    },
  },
};

export const GALICIA: Territory = {
  id: "galicia",
  name: { ca: "Galícia", es: "Galicia", en: "Galicia" },
  regime: "common",
  agency: { name: { ca: "Axencia Tributaria de Galicia (ATRIGA)", es: "Axencia Tributaria de Galicia (ATRIGA)", en: "Galician Tax Agency (ATRIGA)" }, url: "https://www.atriga.gal" },
  sources: {
    law: { short: "DL 1/2011 de Galicia", name: "Decreto Legislativo 1/2011, de 28 de julio, por el que se aprueba el texto refundido de las disposiciones legales de la Comunidad Autónoma de Galicia en materia de tributos cedidos por el Estado", publisher: "BOE (texto consolidado)", ref: "BOE-A-2011-18161, arts. 6 a 11; última actualización publicada el 27/03/2026", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2011-18161", read: RULES_AS_OF },
  },
  mainSource: "law",
  inheritance: {
    groupII: {
      text: { ca: "Fills i cònjuge: 1.000.000 €.", es: "Hijos y cónyuge: 1.000.000 €.", en: "Children and spouse: €1,000,000." },
      cite: { src: "law", art: "6.Dos.b" },
      from: "2026-01-01",
      quotes: [
        "Las reducciones contempladas en los apartados dos y tres siguientes suponen una mejora con respecto a las mismas reducciones establecidas por la normativa estatal y sustituyen a éstas.",
        "b) Grupo II: adquisiciones por descendientes y adoptados de 21 años o más, cónyuges, ascendientes y adoptantes, 1.000.000 euros.",
        "Los importes de las reducciones por parentesco y discapacidad serán únicos para todos los hechos imponibles del artículo 3.1.a) de la Ley 29/1987, de 18 de diciembre, del impuesto sobre sucesiones y donaciones, que tengan lugar entre la misma persona causante y persona causahabiente, de tal forma que solo serán aplicables en las segundas y sucesivas adquisiciones en el importe que no se hubiese agotado en las anteriores de forma acumulativa.",
      ],
    },
    bonus: {
      text: { ca: "Cap per al grup II (la deducció del 99 % és només per a menors de 21). Tarifa pròpia dels grups I i II, del 5 % al 18 %.", es: "Ninguna para el grupo II (la deducción del 99 % es solo para menores de 21). Tarifa propia de los grupos I y II, del 5 % al 18 %.", en: "None for group II (the 99% deduction is only for under-21s). A group I-II scale of its own, 5% to 18%." },
      cite: { src: "law", art: "11 y 9.a" },
      from: "2025-01-01",
      quotes: [
        "En las adquisiciones mortis causa por sujetos pasivos incluidos en el Grupo I del artículo 6.Dos del presente texto refundido, incluidas las cantidades percibidas por las personas beneficiarias de seguros sobre la vida, se practicará una deducción del 99 % del importe de la cuota.",
        "a) En caso de los hechos imponibles contemplados en los apartados a y c del artículo 3.1 de la Ley 29/1987, de 18 de diciembre, del impuesto sobre sucesiones y donaciones, y siempre que los sujetos pasivos estuviesen incluidos en los grupos I y II del artículo 6.dos del presente texto refundido, se aplicará la siguiente tarifa:",
        "0 0 50.000 5 50.000 2.500 75.000 7 125.000 7.750 175.000 9 300.000 23.500 500.000 11 800.000 78.500 800.000 15 1.600.000 198.500 En adelante 18",
      ],
    },
    home: {
      text: { ca: "99 %, 97 % o 95 % segons el valor de l'habitatge (el cònjuge, 100 %), amb un límit de 600.000 €; conservar-lo 5 anys i demanar-la a l'autoliquidació presentada dins de termini.", es: "99 %, 97 % o 95 % según el valor de la vivienda (el cónyuge, 100 %), con un límite de 600.000 €; conservarla 5 años y pedirla en la autoliquidación presentada en plazo.", en: "99%, 97% or 95% depending on the home's value (the spouse 100%), capped at €600,000; keep it 5 years and claim it in a return filed on time." },
      cite: { src: "law", art: "7.Tres" },
      from: "2023-01-01",
      quotes: [
        "Las reducciones contempladas en este artículo, salvo la regulada en el apartado tres, son propias de la comunidad autónoma",
        "1. Las reducciones contempladas en este artículo no se aplicarán de oficio, habiendo de solicitarse por el sujeto pasivo/contribuyente conforme a lo establecido en el artículo 23 de la presente ley.",
        "se practicará una reducción con un límite de 600.000 euros y se aplicará el porcentaje de reducción que corresponda en función del valor real total del inmueble:",
        "Hasta 150.000,00 euros 99 De 150.000,01 a 300.000,00 euros 97 Más de 300.000,00 95",
        "Cuando la adquisición corresponda al cónyuge, la reducción será del 100 % del valor en la base imponible, con un límite de 600.000 euros.",
        "En caso del pariente colateral, este habrá de ser mayor de 65 años y será necesaria la convivencia con el causante durante los dos años anteriores al fallecimiento.",
        "2. Las personas adquirentes deberán mantener la vivienda adquirida durante los cinco años siguientes al devengo del impuesto",
        "En caso de que se produjese la venta de la vivienda durante el indicado plazo y la totalidad de su importe se reinvierta en la adquisición de una vivienda ubicada en Galicia que constituya o vaya a constituir la vivienda habitual de la persona adquirente, no se perderá la reducción solicitada.",
        "Uno. Los beneficios fiscales que dependan del cumplimiento por el contribuyente de cualquier requisito en un momento posterior al devengo no se aplicarán de oficio, habiendo de solicitarse expresamente por el contribuyente en el periodo reglamentario de presentación de la declaración del impuesto",
        "La ausencia de solicitud del beneficio fiscal dentro del plazo reglamentario de declaración o su no aplicación en la autoliquidación se entenderá como una renuncia a la aplicación del mismo.",
      ],
    },
    groupIII: {
      text: { ca: "Germans: 25.000 €, sense bonificació (coeficient 1,5882).", es: "Hermanos: 25.000 €, sin bonificación (coeficiente 1,5882).", en: "Siblings: €25,000, no rebate (coefficient 1.5882)." },
      cite: { src: "law", art: "6.Dos.c" },
      from: "2026-01-01",
      quotes: [
        "c) Grupo III: adquisiciones por colaterales de segundo y tercero grado y ascendientes y descendientes por afinidad: 25.000 euros.",
        "La cuota tributaria por el impuesto sobre sucesiones y donaciones se obtendrá aplicando a la cuota íntegra el coeficiente multiplicador que corresponda de los que se indican a continuación",
        "De 0 a 402.678,11 1 1,5882 2",
        "De más de 402.678,11 a 2.007.380,43 1 1,6676 2,1",
      ],
    },
  },
  gift: {
    benefit: {
      text: { ca: "Sense bonificació. En escriptura pública, tarifa reduïda dels grups I i II: 5 % fins a 200.000 €, 7 % fins a 600.000 € i 9 % per sobre. Diners per a l'habitatge habitual a Galícia (menors de 35 anys, entre d'altres): reducció del 95 %, fins a 60.000 €.", es: "Sin bonificación. En escritura pública, tarifa reducida de los grupos I y II: 5 % hasta 200.000 €, 7 % hasta 600.000 € y 9 % por encima. Dinero para la vivienda habitual en Galicia (menores de 35 años, entre otros): reducción del 95 %, hasta 60.000 €.", en: "No rebate. In a public deed, a reduced scale for groups I and II: 5% up to €200,000, 7% up to €600,000 and 9% above. Cash for a habitual home in Galicia (under-35s, among others): a 95% reduction, up to €60,000." },
      cite: { src: "law", art: "9.b y 8.Tres" },
      from: "2026-01-01",
      quotes: [
        "b) En el caso de los hechos imponibles recogidos en el párrafo b) del artículo 3.1 de la Ley 29/1987, de 18 de diciembre, del impuesto sobre sucesiones y donaciones, y siempre que los sujetos pasivos estén incluidos en los grupos I y II del artículo 6.dos de este texto refundido y la donación se formalice en escritura pública, se aplicará la siguiente tarifa:",
        "0 0 200.000 5 200.000 10.000 400.000 7 600.000 38.000 En diante 9",
        "En el caso de no se cumplieran los requisitos establecidos en esta letra, será de aplicación la tarifa señalada en la letra anterior.",
        "En las donaciones a hijos y descendientes de dinero destinado a la adquisición de su vivienda habitual se aplicará una reducción del 95% de la base imponible del impuesto, siempre que se cumplan los siguientes requisitos:",
        "a) La persona donataria deberá ser menor de 35 años o mujer víctima de violencia de género.",
        "b) El importe de la donación no podrá sobrepasar los 60.000 euros.",
        "En caso de que el importe de la donación o donaciones a que se refiere este artículo sobrepasase esta cantidad, no habrá derecho a reducción alguna.",
        "cuyo plazo reglamentario de declaración estuviese concluido a la fecha del devengo de la primera donación, no podrá ser superior a 30.000 euros.",
        "d) La donación ha de formalizarse en escritura pública en la que se exprese la voluntad de que el dinero donado se destine a la adquisición de la vivienda habitual de la persona donataria.",
        "e) La persona donataria deberá adquirir una vivienda ubicada en Galicia en los seis meses siguientes a la donación.",
      ],
    },
    formal: {
      text: { ca: "Escriptura pública per a la tarifa reduïda (i, en la reducció per habitatge, declarant-hi la destinació dels diners). La llei no demana justificar l'origen dels diners.", es: "Escritura pública para la tarifa reducida (y, en la reducción por vivienda, declarando el destino del dinero). La ley no pide justificar el origen del dinero.", en: "A public deed for the reduced scale (and, for the home reduction, stating what the money is for). The law does not ask for proof of where the money came from." },
      cite: { src: "law", art: "9.b" },
      from: "2025-01-01",
      quotes: [
        "b) En el caso de los hechos imponibles recogidos en el párrafo b) del artículo 3.1 de la Ley 29/1987, de 18 de diciembre, del impuesto sobre sucesiones y donaciones, y siempre que los sujetos pasivos estén incluidos en los grupos I y II del artículo 6.dos de este texto refundido y la donación se formalice en escritura pública, se aplicará la siguiente tarifa:",
        "0 0 200.000 5 200.000 10.000 400.000 7 600.000 38.000 En diante 9",
        "En el caso de no se cumplieran los requisitos establecidos en esta letra, será de aplicación la tarifa señalada en la letra anterior.",
      ],
    },
  },
  example: {
    kind: "rules",
    rules: {
      reductions: [
        { id: "kinship", label: { ca: "Parentiu", es: "Parentesco", en: "Kinship" }, amount: 1000000, cite: { src: "law", art: "6.Dos.b" } },
      ],
      home: { percent: 99, cap: 600000, cite: { src: "law", art: "7.Tres" } },
      scale: [
        { from: 0, quota: 0, rate: 5 },
        { from: 50000, quota: 2500, rate: 7 },
        { from: 125000, quota: 7750, rate: 9 },
        { from: 300000, quota: 23500, rate: 11 },
        { from: 800000, quota: 78500, rate: 15 },
        { from: 1600000, quota: 198500, rate: 18 },
      ],
      scaleCite: { src: "law", art: "9.a" },
      coefficient: 1,
      coefficientCite: { src: "law", art: "10" },
      bonus: { kind: "none" },
      bonusCite: null,
    },
  },
};

export const MURCIA: Territory = {
  id: "murcia",
  name: { ca: "Regió de Múrcia", es: "Región de Murcia", en: "Region of Murcia" },
  regime: "common",
  agency: { name: { ca: "Agencia Tributaria de la Región de Murcia", es: "Agencia Tributaria de la Región de Murcia", en: "Murcia Tax Agency" }, url: "https://agenciatributaria.carm.es/" },
  sources: {
    law: { short: "DL 1/2010 de Murcia", name: "Decreto Legislativo 1/2010, de 5 de noviembre, por el que se aprueba el Texto Refundido de las disposiciones legales vigentes en la Región de Murcia en materia de tributos cedidos", publisher: "BOE (texto consolidado)", ref: "BOE-A-2011-10542, arts. 3 a 5; última actualización publicada el 24/07/2025", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2011-10542", read: RULES_AS_OF },
    lisd: STATE_SOURCES.lisd,
  },
  mainSource: "law",
  inheritance: {
    groupII: {
      text: { ca: "Fills i cònjuge: 15.956,87 € (reducció estatal).", es: "Hijos y cónyuge: 15.956,87 € (reducción estatal).", en: "Children and spouse: €15,956.87 (the state reduction)." },
      cite: { src: "lisd", art: "20.2.a" },
      from: "2012-12-28",
      quotes: [
        "Grupo II: adquisiciones por descendientes y adoptados de veintiuno o más años, cónyuges, ascendientes y adoptantes, 15.956,87 euros.",
      ],
    },
    bonus: {
      text: { ca: "Deducció del 99 % de la quota per als grups I i II, sense límits.", es: "Deducción del 99 % de la cuota para los grupos I y II, sin límites.", en: "A 99% deduction from the tax for groups I and II, with no limits." },
      cite: { src: "law", art: "3.Cinco" },
      from: "2023-12-30",
      quotes: [
        "en las adquisiciones mortis causa por sujetos pasivos incluidos en los grupos I y II del artículo 20.2.a) de la Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones, se aplicará una deducción autonómica del 99 % de la cuota que resulte después de aplicar las deducciones estatales y autonómicas que, en su caso, procedan.",
        "Las parejas de hecho acreditadas de acuerdo con lo establecido en la normativa autonómica que las regula se equiparan a los cónyuges",
      ],
    },
    home: {
      text: { ca: "Regla estatal: 95 %, fins a 122.606,47 € per hereu. Cal conservar-lo 10 anys.", es: "Regla estatal: 95 %, hasta 122.606,47 € por heredero. Hay que conservarla 10 años.", en: "State rule: 95%, up to €122,606.47 per heir. It must be kept 10 years." },
      cite: { src: "lisd", art: "20.2.c" },
      from: "2012-12-28",
      quotes: [
        "otra del 95 por 100 del mencionado valor, siempre que la adquisición se mantenga, durante los diez años siguientes al fallecimiento del causante, salvo que falleciera el adquirente dentro de ese plazo.",
        "Del mismo porcentaje de reducción, con el límite de 122.606,47 euros para cada sujeto pasivo y con el requisito de permanencia señalado anteriormente, gozarán las adquisiciones \"mortis causa\" de la vivienda habitual de la persona fallecida, siempre que los causahabientes sean cónyuge, ascendientes o descendientes de aquél, o bien pariente colateral mayor de sesenta y cinco años que hubiese convivido con el causante durante los dos años anteriores al fallecimiento.",
      ],
    },
    groupIII: {
      text: { ca: "Germans: 7.993,46 € (estatal), sense bonificació en herències; tarifa murciana (fins al 36,5 %) i coeficient 1,5882.", es: "Hermanos: 7.993,46 € (estatal), sin bonificación en herencias; tarifa murciana (hasta el 36,5 %) y coeficiente 1,5882.", en: "Siblings: €7,993.46 (state), no rebate on inheritances; Murcia's scale (up to 36.5%) and coefficient 1.5882." },
      cite: { src: "lisd", art: "20.2.a" },
      from: "2012-12-28",
      quotes: [
        "Grupo III: adquisiciones por colaterales de segundo y tercer grado, ascendientes y descendientes por afinidad, 7.993,46 euros.",
        "De 0 a 402.678,11",
        "1,0000 1,5882 2,0000 De más de 402.678,11",
        "1,0000 1,5882 2,0000 De más de 402.678,11 a 2.007.380,43",
        { text: "398.777,54 80.655,08 398.777,54 31,75 797.555,08 207.266,95 En adelante 36,50", src: "law" },
      ],
    },
  },
  gift: {
    benefit: {
      text: { ca: "Deducció del 99 % per als grups I, II i III (també germans i nebots).", es: "Deducción del 99 % para los grupos I, II y III (también hermanos y sobrinos).", en: "A 99% deduction for groups I, II and III (siblings, nephews and nieces too)." },
      cite: { src: "law", art: "4.Seis" },
      from: "2023-12-30",
      quotes: [
        "en las adquisiciones inter vivos por sujetos pasivos incluidos en los grupos I, II y III del artículo 20.2.a) de la Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones, se aplicará una deducción autonómica del 99 % de la cuota que resulte después de aplicar las deducciones estatales y autonómicas que, en su caso, procedan.",
        "Será requisito necesario para la aplicación de esta deducción que la donación se formalice en documento público.",
      ],
    },
    formal: {
      text: { ca: "Document públic (o formalitzar-la així dins el termini de presentació); en diners o comptes, l'origen dels fons justificat i declarat en aquest document.", es: "Documento público (o formalizarla así dentro del plazo de presentación); en dinero o cuentas, el origen de los fondos justificado y manifestado en ese documento.", en: "A public document (or the gift put in one within the filing period); for cash or accounts, the origin of the funds justified and stated in that document." },
      cite: { src: "law", art: "4.Seis y 4.Siete" },
      from: "2023-12-30",
      quotes: [
        "Cuando la donación sea en metálico o en cualquiera de los bienes o derechos contemplados en el artículo 12 de la Ley 19/1991, de 6 de junio, del Impuesto sobre el Patrimonio, la deducción solo resultará aplicable cuando el origen de los fondos donados esté debidamente justificado, siempre que, además, en el propio documento público en que se formalice la transmisión se haya manifestado el origen de dichos fondos.",
        "En aquellos beneficios fiscales en que se exija que la adquisición se formalice en documento público, dicha formalización deberá realizarse durante el plazo de presentación del impuesto, de no haberse formalizado la operación originariamente en este tipo de documento.",
        "No serán aplicables los beneficios fiscales que requieran de alguna mención expresa necesaria para la aplicación de las mismas, si no consta dicha mención en el documento público.",
      ],
    },
  },
  example: {
    kind: "rules",
    rules: {
      reductions: [
        { id: "kinship", label: { ca: "Parentiu (estatal)", es: "Parentesco (estatal)", en: "Kinship (state)" }, amount: 15956.87, cite: { src: "lisd", art: "20.2.a" } },
      ],
      home: { percent: 95, cap: 122606.47, cite: { src: "lisd", art: "20.2.c" } },
      scale: [
        { from: 0, quota: 0, rate: 7.65 },
        { from: 7993.46, quota: 611.5, rate: 8.5 },
        { from: 15980.91, quota: 1290.43, rate: 9.35 },
        { from: 23968.36, quota: 2037.26, rate: 10.2 },
        { from: 31955.81, quota: 2851.98, rate: 11.05 },
        { from: 39943.26, quota: 3734.59, rate: 11.9 },
        { from: 47930.72, quota: 4685.1, rate: 12.75 },
        { from: 55918.17, quota: 5703.5, rate: 13.6 },
        { from: 63905.62, quota: 6789.79, rate: 14.45 },
        { from: 71893.07, quota: 7943.98, rate: 15.3 },
        { from: 79880.52, quota: 9166.06, rate: 16.15 },
        { from: 119757.67, quota: 15606.22, rate: 18.7 },
        { from: 159634.83, quota: 23063.25, rate: 21.25 },
        { from: 239389.13, quota: 40011.04, rate: 25.5 },
        { from: 398777.54, quota: 80655.08, rate: 31.75 },
        { from: 797555.08, quota: 207266.95, rate: 36.5 },
      ],
      scaleCite: { src: "law", art: "5" },
      coefficient: 1,
      coefficientCite: { src: "lisd", art: "22.2" },
      bonus: { kind: "flat", percent: 99 },
      bonusCite: { src: "law", art: "3.Cinco" },
    },
  },
};

export const LA_RIOJA: Territory = {
  id: "la-rioja",
  name: { ca: "La Rioja", es: "La Rioja", en: "La Rioja" },
  regime: "common",
  agency: { name: { ca: "Direcció General de Tributs del Govern de La Rioja", es: "Dirección General de Tributos del Gobierno de La Rioja", en: "La Rioja Directorate-General for Taxes" }, url: "https://www.larioja.org/tributos/es" },
  sources: {
    law: { short: "Ley 10/2017 de La Rioja", name: "Ley 10/2017, de 27 de octubre, por la que se consolidan las disposiciones legales de la Comunidad Autónoma de La Rioja en materia de impuestos propios y tributos cedidos", publisher: "BOE (texto consolidado)", ref: "BOE-A-2017-13750, arts. 34 a 42; última actualización publicada el 29/10/2026", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2017-13750", read: RULES_AS_OF },
    lisd: STATE_SOURCES.lisd,
    ley2_2024: { short: "Ley 2/2024 de La Rioja", name: "Ley 2/2024, de 7 de febrero, de bonificación del impuesto sobre sucesiones y donaciones (La Rioja)", publisher: "BOE", ref: "BOE-A-2024-3101", url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2024-3101", read: RULES_AS_OF },
  },
  mainSource: "law",
  inheritance: {
    groupII: {
      text: { ca: "Fills i cònjuge: 15.956,87 € (reducció estatal).", es: "Hijos y cónyuge: 15.956,87 € (reducción estatal).", en: "Children and spouse: €15,956.87 (the state reduction)." },
      cite: { src: "lisd", art: "20.2.a" },
      from: "2012-12-28",
      quotes: [
        "Grupo II: adquisiciones por descendientes y adoptados de veintiuno o más años, cónyuges, ascendientes y adoptantes, 15.956,87 euros.",
        { text: "Para el cálculo de la base liquidable resultarán aplicables las reducciones recogidas en el artículo 20.2 de la Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones, con las especialidades que se establecen en el artículo siguiente.", src: "law" },
      ],
    },
    bonus: {
      text: { ca: "Deducció del 99 % per als grups I i II, sense límit de base des de la Llei 2/2024.", es: "Deducción del 99 % para los grupos I y II, sin límite de base desde la Ley 2/2024.", en: "A 99% deduction for groups I and II, with no limit on the base since Law 2/2024." },
      cite: { src: "law", art: "37.2" },
      from: "2024-02-09",
      quotes: [
        "2. En las adquisiciones mortis causa por sujetos pasivos incluidos en los grupos I y II del artículo 20.2.a) de la Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones, se aplicará una deducción del 99 % de la cuota que resulte después de aplicar las deducciones estatales y autonómicas.",
        { text: "por la presente ley se suprime el límite cuantitativo de la base imponible para la aplicación de la bonificación máxima del 99 % de la cuota del impuesto sobre sucesiones y donaciones, que se hará por tanto extensiva a todas las adquisiciones mortis causa e inter vivos de los grupos de parentesco I y II del citado tributo.", src: "ley2_2024" },
        { text: "La presente ley entrará en vigor el día siguiente al de su publicación en el «Boletín Oficial de La Rioja».", src: "ley2_2024" },
      ],
    },
    home: {
      text: { ca: "95 %, fins a 122.606,47 € per hereu; conservar-lo 5 anys (la regla estatal en demana 10).", es: "95 %, hasta 122.606,47 € por heredero; conservarla 5 años (la regla estatal pide 10).", en: "95%, up to €122,606.47 per heir; keep it 5 years (the state rule asks for 10)." },
      cite: { src: "law", art: "35.4" },
      from: "2026-01-01",
      quotes: [
        "Si en la base imponible está incluido el valor de la vivienda habitual del causante, le será aplicable la reducción del 95% del citado valor, con el límite de 122.606,47 euros para cada sujeto pasivo, siempre que se cumplan los siguientes requisitos:",
        "a) Los causahabientes han de ser cónyuge, descendientes o adoptados, ascendientes o adoptantes, o bien pariente colateral mayor de 65 años que hubiese convivido con el causante durante los dos años anteriores al fallecimiento.",
        "b) El adquirente ha de conservar en su patrimonio la vivienda durante los cinco años siguientes al fallecimiento del causante, salvo que durante ese plazo fallezca a su vez el adquirente.",
        "Las reducciones previstas en el artículo anterior serán incompatibles, para una misma adquisición, con la aplicación de las reducciones previstas en el artículo 20.2.c) de la Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones",
        "El incumplimiento de los requisitos para el disfrute de las reducciones propias de la Comunidad Autónoma de La Rioja no impedirá la aplicación de las reducciones estatales siempre que se cumplan las condiciones establecidas en la legislación estatal para su disfrute.",
        "con carácter general se considera vivienda habitual del contribuyente la edificación que constituya su residencia durante un plazo continuado de, al menos, tres años.",
      ],
    },
    groupIII: {
      text: { ca: "Germans: 7.993,46 € (estatal), sense bonificació (coeficient 1,5882), llevat de convivència estable al mateix domicili durant els 15 anys anteriors.", es: "Hermanos: 7.993,46 € (estatal), sin bonificación (coeficiente 1,5882), salvo convivencia estable en el mismo domicilio durante los 15 años anteriores.", en: "Siblings: €7,993.46 (state), no rebate (coefficient 1.5882), unless they lived together in the same home for the 15 years before." },
      cite: { src: "lisd", art: "20.2.a" },
      from: "2025-01-01",
      quotes: [
        "Grupo III: adquisiciones por colaterales de segundo y tercer grado, ascendientes y descendientes por afinidad, 7.993,46 euros.",
        "De 0 a 402.678,11",
        "1,0000 1,5882 2,0000 De más de 402.678,11",
        "1,0000 1,5882 2,0000 De más de 402.678,11 a 2.007.380,43",
        { text: "Los efectos tributarios previstos en el artículo 37 de la presente ley serán de aplicación a las personas que, cualesquiera fuera su relación, hayan mantenido una convivencia estable en el mismo domicilio durante, al menos, los quince años inmediatamente anteriores a la fecha de devengo del impuesto", src: "law" },
      ],
    },
  },
  gift: {
    benefit: {
      text: { ca: "Deducció del 99 % per als grups I i II, sense límit de base.", es: "Deducción del 99 % para los grupos I y II, sin límite de base.", en: "A 99% deduction for groups I and II, with no limit on the base." },
      cite: { src: "law", art: "41" },
      from: "2025-01-01",
      quotes: [
        "1. En las adquisiciones inter vivos de los sujetos pasivos incluidos en los grupos I y II de parentesco de los previstos en el artículo 20.2.a) de la Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones, se aplicará una deducción del 99 % de la cuota tributaria derivada de las mismas.",
      ],
    },
    formal: {
      text: { ca: "Document notarial; en diners, val una transferència bancària amb autoliquidació en 30 dies hàbils i un document privat que declari l'origen dels fons, que ha d'estar justificat.", es: "Documento notarial; en dinero, vale una transferencia bancaria con autoliquidación en 30 días hábiles y un documento privado que declare el origen de los fondos, que debe estar justificado.", en: "A notarial document; for cash, a bank transfer will do, with the return within 30 working days and a private document stating where the funds came from, which must be justified." },
      cite: { src: "law", art: "41.1 y 41.2" },
      from: "2025-01-01",
      quotes: [
        "Será requisito necesario para la aplicación de esta deducción que la donación o cualquier otro negocio jurídico gratuito e inter vivos se formalice en documento notarial.",
        "Tampoco se exigirá cuando la donación sea en metálico, siempre que la entrega se haya realizado mediante transferencia bancaria y, en el plazo de treinta días hábiles desde que se produjo dicha entrega, se presente la correspondiente autoliquidación, acompañada de justificante de la transferencia bancaria y de documento privado en el que se formalice la transmisión y en el que conste la manifestación que se indica en el apartado siguiente del presente artículo.",
        "la deducción solo resultará aplicable cuando el origen de los fondos esté debidamente justificado, siempre que, además, se haya manifestado en el propio documento en que se formalice la transmisión el origen de dichos fondos.",
      ],
    },
  },
  example: {
    kind: "rules",
    rules: {
      reductions: [
        { id: "kinship", label: { ca: "Parentiu (estatal)", es: "Parentesco (estatal)", en: "Kinship (state)" }, amount: 15956.87, cite: { src: "lisd", art: "20.2.a" } },
      ],
      home: { percent: 95, cap: 122606.47, cite: { src: "law", art: "35.4" } },
      scale: STATE_SCALE,
      scaleCite: { src: "lisd", art: "21.2" },
      coefficient: 1,
      coefficientCite: { src: "lisd", art: "22.2" },
      bonus: { kind: "flat", percent: 99 },
      bonusCite: { src: "law", art: "37.2" },
    },
  },
};
