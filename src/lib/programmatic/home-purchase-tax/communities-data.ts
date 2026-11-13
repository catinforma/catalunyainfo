/* Generated from the fact packs read on 13 Nov 2026 (official consolidated texts; every quote
 * checked as an exact substring of the saved text). Edit by hand only with a fresh reading of the law,
 * and move COMMUNITIES_AS_OF (as-of.ts) when you do. */
import type { Community } from "./types";

export const COMMUNITY_DATA: readonly Community[] = [
  {
    "id": "alava",
    "name": {
      "es": "Álava (Araba)",
      "ca": "Àlaba (Araba)",
      "en": "Álava (Araba)"
    },
    "regime": "foral",
    "status": "sourced",
    "law": {
      "title": "Norma Foral 11/2003, de 31 de marzo, del Impuesto sobre Transmisiones Patrimoniales y Actos Jurídicos Documentados (Territorio Histórico de Álava)",
      "short": "NF 11/2003 (Álava)",
      "url": "https://web.araba.eus/documents/d/araba/indice_norma-foral-itp-ajd-cas-2-pdf",
      "consolidatedAsOf": "2026-04-20",
      "readOn": "2026-11-13"
    },
    "amendments": [
      {
        "title": "Norma Foral 3/2025, de 9 de abril (BOTHA nº 44 de 16-4-25)",
        "url": "https://web.araba.eus/documents/d/araba/indice_norma-foral-itp-ajd-cas-2-pdf"
      }
    ],
    "taxAgency": {
      "name": "Hacienda Foral de Álava (Diputación Foral de Álava)",
      "url": "https://web.araba.eus/es/hacienda"
    },
    "itp": {
      "general": {
        "kind": "flat",
        "rate": 4
      },
      "article": "art. 43.Uno.b)",
      "quote": "a) (30) (48) El 7 por ciento si se trata de la transmisión de inmuebles, así como la […] b) (36) (50) Por excepción a lo dispuesto en la letra anterior, la transmisión de viviendas […] en general, excepto las señaladas en la letra siguiente, tributarán al 4 por ciento incluidas"
    },
    "ajd": {
      "general": {
        "kind": "flat",
        "rate": 0.5
      },
      "article": "art. 56.2",
      "quote": "del artículo 1 de esta Norma Foral, tributarán, además, al tipo de gravamen del 0,5%,"
    },
    "benefits": [
      {
        "id": "alava-itp-small",
        "tax": "itp",
        "label": {
          "es": "Vivienda de hasta 120 m² construidos, vivienda habitual",
          "ca": "Habitatge de fins a 120 m² construïts, habitatge habitual",
          "en": "Home up to 120 m² built, main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 2.5
        },
        "conditions": {
          "habitual": true
        },
        "extra": {
          "es": "Vivienda habitual (acreditarla en 12 meses) y no tener más del 25 % de otra vivienda en el mismo municipio (salvo venderla en 2 años).",
          "ca": "Habitatge habitual (acreditar-lo en 12 mesos) i no tenir més del 25 % d'un altre habitatge al mateix municipi (llevat de vendre'l en 2 anys).",
          "en": "Main home (proved within 12 months) and owning no more than 25% of another home in the same municipality (unless sold within 2 years)."
        },
        "manual": true,
        "article": "art. 43.Uno.c).1º",
        "quote": "c) (30) (43) 1º. Tributarán al 2,5 por ciento, las siguientes transmisiones: […] - Viviendas cuya superficie construida no sea superior a 120 metros cuadrados, así como […] - Viviendas unifamiliares cuya superficie construida no sea superior a 120 metros […] Para la aplicación del tipo del 2,5 por ciento a que se refiere esta letra c) será preciso […] 1. Que la parte adquiriente no sea propietaria de otra vivienda en un porcentaje superior […] al 25 por ciento dentro del término municipal en que radica la vivienda objeto de […] 2. Que la vivienda se destine a residencia habitual de la persona adquiriente en los […] 3. Que en el documento de adquisición se exprese que se cumplen o se van a cumplir los"
      },
      {
        "id": "alava-itp-large-family",
        "tax": "itp",
        "label": {
          "es": "Familia numerosa, vivienda habitual",
          "ca": "Família nombrosa, habitatge habitual",
          "en": "Large family, main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 2.5
        },
        "conditions": {
          "habitual": true,
          "largeFamily": true
        },
        "extra": {
          "es": "Vivienda habitual (acreditarla en 12 meses) y no tener más del 25 % de otra vivienda en el mismo municipio (salvo venderla en 2 años).",
          "ca": "Habitatge habitual (acreditar-lo en 12 mesos) i no tenir més del 25 % d'un altre habitatge al mateix municipi (llevat de vendre'l en 2 anys).",
          "en": "Main home (proved within 12 months) and owning no more than 25% of another home in the same municipality (unless sold within 2 years)."
        },
        "article": "art. 43.Uno.c).2º",
        "quote": "2º. También tributarán al 2,5 por ciento las siguientes transmisiones cuando la persona […] adquiriente sea titular de familia numerosa:"
      },
      {
        "id": "alava-itp-rural",
        "tax": "itp",
        "label": {
          "es": "Vivienda habitual en zonas o núcleos rurales (DA 34.ª de la norma foral del IRPF)",
          "ca": "Habitatge habitual en zones o nuclis rurals (DA 34a de la norma foral de l'IRPF)",
          "en": "Main home in rural areas (34th additional provision of the IRPF foral norm)"
        },
        "rate": {
          "kind": "flat",
          "rate": 1.5
        },
        "conditions": {
          "habitual": true
        },
        "extra": {
          "es": "Vivienda habitual (acreditarla en 12 meses) y no tener más del 25 % de otra vivienda en el mismo municipio (salvo venderla en 2 años).",
          "ca": "Habitatge habitual (acreditar-lo en 12 mesos) i no tenir més del 25 % d'un altre habitatge al mateix municipi (llevat de vendre'l en 2 anys).",
          "en": "Main home (proved within 12 months) and owning no more than 25% of another home in the same municipality (unless sold within 2 years)."
        },
        "manual": true,
        "article": "art. 43.Uno.c).3º",
        "quote": "3º. Tributará al 1,5 por ciento las siguientes transmisiones de viviendas ubicadas en […] zonas o núcleos a que se refiere la disposición adicional trigésimo cuarta de la Norma […] Para la aplicación de este tipo del 1,5 por ciento será preciso reunir los siguientes"
      },
      {
        "id": "alava-itp-vpp",
        "tax": "itp",
        "label": {
          "es": "Vivienda de protección pública: primera transmisión en 6 años (exenta)",
          "ca": "Habitatge de protecció pública: primera transmissió en 6 anys (exempta)",
          "en": "Protected housing: first transfer within 6 years (exempt)"
        },
        "rate": {
          "kind": "flat",
          "rate": 0
        },
        "conditions": {
          "protected": true
        },
        "extra": null,
        "manual": true,
        "article": "art. 69.Uno.B).13",
        "quote": "transmisión “inter vivos” del dominio de las viviendas de protección pública, […] siempre que tengan lugar dentro de los seis años siguientes a la fecha de su"
      },
      {
        "id": "alava-ajd-first-delivery",
        "tax": "ajd",
        "label": {
          "es": "Primera transmisión de una vivienda (vivienda nueva): exenta",
          "ca": "Primera transmissió d'un habitatge (habitatge nou): exempta",
          "en": "First transfer of a home (new home): exempt"
        },
        "rate": {
          "kind": "flat",
          "rate": 0
        },
        "conditions": {},
        "extra": null,
        "article": "art. 69.Uno.B).42",
        "quote": "42. (19) Las primeras copias de escrituras notariales que documenten la primera […] transmisión de viviendas, en cuanto al gravamen sobre documentos notariales a"
      }
    ],
    "newHome": {
      "name": "IVA",
      "general": 10,
      "protected": 4,
      "protectedLabel": {
        "es": "VPO de régimen especial o de promoción pública vendida por el promotor",
        "ca": "HPO de règim especial o de promoció pública venuda pel promotor",
        "en": "special-regime or public-promotion VPO sold by the developer"
      },
      "article": "Concierto Económico, art. 26 (IVA estatal: Ley 37/1992, art. 91)",
      "quote": "El Impuesto sobre el Valor Añadido es un tributo concertado que se regirá por las mismas normas sustantivas y formales establecidas en cada momento por el Estado.",
      "law": {
        "title": "Ley 12/2002, de 23 de mayo, por la que se aprueba el Concierto Económico con la Comunidad Autónoma del País Vasco",
        "short": "Concierto Económico (Ley 12/2002)",
        "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-9969",
        "consolidatedAsOf": "2025-04-30",
        "readOn": "2026-11-13"
      }
    },
    "notes": [
      {
        "es": "Vivienda usada: 4 %, o 6 % si el comprador tiene más de 5 viviendas (el 7 % es para inmuebles que no son vivienda). La vivienda nueva paga IVA y su primera transmisión está exenta de AJD.",
        "ca": "Habitatge usat: 4 %, o 6 % si el comprador té més de 5 habitatges (el 7 % és per a immobles que no són habitatge). L'habitatge nou paga IVA i la primera transmissió està exempta d'AJD.",
        "en": "Resale home: 4%, or 6% if the buyer owns more than 5 homes (7% is for non-residential property). A new home pays IVA and its first transfer is exempt from AJD."
      }
    ]
  },
  {
    "id": "andalucia",
    "name": {
      "es": "Andalucía",
      "ca": "Andalusia",
      "en": "Andalusia"
    },
    "regime": "common",
    "status": "sourced",
    "law": {
      "title": "Ley 5/2021, de 20 de octubre, de Tributos Cedidos de la Comunidad Autónoma de Andalucía",
      "short": "Ley 5/2021",
      "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2021-17915",
      "consolidatedAsOf": "2025-12-31",
      "readOn": "2026-11-13"
    },
    "amendments": [
      {
        "title": "Ley 8/2025, de 22 de diciembre (Presupuesto de la Comunidad Autónoma de Andalucía para 2026), disposición final 9.ª",
        "url": "https://www.boe.es/buscar/doc.php?id=BOE-A-2026-945"
      },
      {
        "title": "Decreto-ley 1/2026, de 25 de febrero, medidas urgentes de apoyo fiscal por los daños producidos por el impacto de borrascas (BOJA núm. 38 C2, 25/02/2026)",
        "url": "https://www.juntadeandalucia.es/eboja/2026/38/c02/BOJA26-203802-00019-2764-01_00333986.pdf"
      }
    ],
    "taxAgency": {
      "name": "Agencia Tributaria de Andalucía",
      "url": "https://www.juntadeandalucia.es/agenciatributariadeandalucia/"
    },
    "itp": {
      "general": {
        "kind": "flat",
        "rate": 7
      },
      "article": "art. 41",
      "quote": "Artículo 41. Tipo general de gravamen aplicable a bienes inmuebles. […] en las transmisiones de bienes inmuebles, así como en la constitución y cesión de derechos reales que recaigan sobre los mismos, excepto en los derechos reales de garantía, la cuota tributaria se obtendrá aplicando sobre la base liquidable el tipo de gravamen del 7%."
    },
    "ajd": {
      "general": {
        "kind": "flat",
        "rate": 1.2
      },
      "article": "art. 49",
      "quote": "Artículo 49. Tipo de gravamen general para los documentos notariales. […] tributarán, además de por la cuota fija prevista en el artículo 31.1 de dicha norma, al tipo de gravamen del 1,2%, en cuanto a tales actos o contratos."
    },
    "benefits": [
      {
        "id": "andalucia-itp-habitual",
        "tax": "itp",
        "label": {
          "es": "Vivienda habitual de hasta 150.000 €",
          "ca": "Habitatge habitual de fins a 150.000 €",
          "en": "Main home up to €150,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 6
        },
        "conditions": {
          "habitual": true,
          "maxValue": 150000
        },
        "extra": {
          "es": "Vivir en ella en 12 meses y 3 años. Con varios compradores, solo la parte de quien cumple (en matrimonio o pareja inscrita basta uno). El tope incluye garajes y anexos.",
          "ca": "Viure-hi en 12 mesos i 3 anys. Amb diversos compradors, només la part de qui compleix (en matrimoni o parella inscrita n'hi ha prou amb un). El límit inclou garatges i annexos.",
          "en": "Move in within 12 months and stay 3 years. With several buyers, only the share of whoever qualifies (one spouse or registered partner is enough). The cap includes parking and annexes."
        },
        "article": "art. 43.1.a) y 43.2-3",
        "quote": "a) Se aplicará el tipo del 6% siempre que el inmueble se destine a vivienda habitual del adquirente y que el valor de la misma no sea superior a 150.000 euros. […] En caso de que el inmueble fuese adquirido por varias personas, el tipo de gravamen reducido se aplicará a la parte proporcional de la base liquidable correspondiente al porcentaje de participación en la adquisición del adquirente que cumpla alguna de las condiciones previstas en el apartado 1. […] el requisito que origine el derecho a aplicar el tipo reducido deberá cumplirlo, al menos, uno de los cónyuges o uno de los miembros de la pareja inscrita en el Registro de Parejas de Hecho de la Comunidad Autónoma de Andalucía o en registros análogos de otras administraciones públicas, no aplicándose lo establecido en el párrafo anterior."
      },
      {
        "id": "andalucia-itp-young",
        "tax": "itp",
        "label": {
          "es": "Menores de 35, vivienda habitual de hasta 150.000 €",
          "ca": "Menors de 35, habitatge habitual de fins a 150.000 €",
          "en": "Under 35, main home up to €150,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 3.5
        },
        "conditions": {
          "habitual": true,
          "maxAge": 34,
          "maxValue": 150000
        },
        "extra": {
          "es": "Vivir en ella en 12 meses y 3 años. Con varios compradores, solo la parte de quien cumple (en matrimonio o pareja inscrita basta uno). El tope incluye garajes y anexos.",
          "ca": "Viure-hi en 12 mesos i 3 anys. Amb diversos compradors, només la part de qui compleix (en matrimoni o parella inscrita n'hi ha prou amb un). El límit inclou garatges i annexos.",
          "en": "Move in within 12 months and stay 3 years. With several buyers, only the share of whoever qualifies (one spouse or registered partner is enough). The cap includes parking and annexes."
        },
        "article": "art. 43.1.b)",
        "quote": "b) Se aplicará el tipo del 3,5% siempre que el adquirente sea menor de 35 años, que el inmueble se destine a su vivienda habitual y que el valor de la misma no sea superior a 150.000 euros."
      },
      {
        "id": "andalucia-itp-disability",
        "tax": "itp",
        "label": {
          "es": "Discapacidad, vivienda habitual de hasta 250.000 €",
          "ca": "Discapacitat, habitatge habitual de fins a 250.000 €",
          "en": "Disability, main home up to €250,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 3.5
        },
        "conditions": {
          "habitual": true,
          "disabilityMin": 33,
          "maxValue": 250000
        },
        "extra": {
          "es": "Discapacidad del 33 % o más tuya o de tu núcleo familiar. Vivir en ella en 12 meses y 3 años. Con varios compradores, solo la parte de quien cumple (en matrimonio o pareja inscrita basta uno). El tope incluye garajes y anexos.",
          "ca": "Discapacitat del 33 % o més teva o del teu nucli familiar. Viure-hi en 12 mesos i 3 anys. Amb diversos compradors, només la part de qui compleix (en matrimoni o parella inscrita n'hi ha prou amb un). El límit inclou garatges i annexos.",
          "en": "Disability of 33% or more, yours or a close family member's. Move in within 12 months and stay 3 years. With several buyers, only the share of whoever qualifies (one spouse or registered partner is enough). The cap includes parking and annexes."
        },
        "article": "art. 43.1.c) y art. 3",
        "quote": "c) Se aplicará el tipo del 3,5% siempre que el adquirente o alguna otra persona integrante de su núcleo familiar tenga la consideración de persona con discapacidad, que el inmueble se destine a vivienda habitual del propio adquirente y, en su caso, de la persona integrante de su núcleo familiar con discapacidad, y que el valor de la misma no sea superior a 250.000 euros. […] Tendrán la consideración de personas con discapacidad los contribuyentes que tengan reconocido un grado igual o superior al 33 por ciento"
      },
      {
        "id": "andalucia-itp-large-family",
        "tax": "itp",
        "label": {
          "es": "Familia numerosa, vivienda habitual de hasta 250.000 €",
          "ca": "Família nombrosa, habitatge habitual de fins a 250.000 €",
          "en": "Large family, main home up to €250,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 3.5
        },
        "conditions": {
          "habitual": true,
          "largeFamily": true,
          "maxValue": 250000
        },
        "extra": {
          "es": "Vivir en ella en 12 meses y 3 años. Con varios compradores, solo la parte de quien cumple (en matrimonio o pareja inscrita basta uno). El tope incluye garajes y anexos.",
          "ca": "Viure-hi en 12 mesos i 3 anys. Amb diversos compradors, només la part de qui compleix (en matrimoni o parella inscrita n'hi ha prou amb un). El límit inclou garatges i annexos.",
          "en": "Move in within 12 months and stay 3 years. With several buyers, only the share of whoever qualifies (one spouse or registered partner is enough). The cap includes parking and annexes."
        },
        "article": "art. 43.1.d) y art. 5",
        "quote": "d) Se aplicará el tipo del 3,5 % siempre que el adquirente tenga la consideración de miembro de familia numerosa, que el inmueble se destine a vivienda habitual de dicha familia numerosa y el valor de la misma no sea superior a 250.000 euros."
      },
      {
        "id": "andalucia-itp-domestic-violence",
        "tax": "itp",
        "label": {
          "es": "Víctimas de violencia doméstica, vivienda habitual de hasta 150.000 €",
          "ca": "Víctimes de violència domèstica, habitatge habitual de fins a 150.000 €",
          "en": "Domestic-violence victims, main home up to €150,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 3.5
        },
        "conditions": {
          "habitual": true,
          "maxValue": 150000
        },
        "extra": {
          "es": "Vivir en ella en 12 meses y 3 años. Con varios compradores, solo la parte de quien cumple (en matrimonio o pareja inscrita basta uno). El tope incluye garajes y anexos.",
          "ca": "Viure-hi en 12 mesos i 3 anys. Amb diversos compradors, només la part de qui compleix (en matrimoni o parella inscrita n'hi ha prou amb un). El límit inclou garatges i annexos.",
          "en": "Move in within 12 months and stay 3 years. With several buyers, only the share of whoever qualifies (one spouse or registered partner is enough). The cap includes parking and annexes."
        },
        "manual": true,
        "article": "art. 43.1.e) y art. 6",
        "quote": "e) Se aplicará el tipo del 3,5% siempre que el adquirente tenga la consideración de víctima de violencia doméstica, que el inmueble se destine a su vivienda habitual y que el valor de la misma no sea superior a 150.000 euros. […] que cuenten con orden de protección en vigor e inscrita en el Registro Central para la Protección de las Víctimas de la Violencia Doméstica, o con sentencia judicial firme por tal motivo en los últimos diez años."
      },
      {
        "id": "andalucia-itp-terrorism",
        "tax": "itp",
        "label": {
          "es": "Víctimas del terrorismo, vivienda habitual de hasta 150.000 €",
          "ca": "Víctimes del terrorisme, habitatge habitual de fins a 150.000 €",
          "en": "Terrorism victims, main home up to €150,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 3.5
        },
        "conditions": {
          "habitual": true,
          "maxValue": 150000
        },
        "extra": {
          "es": "Vivir en ella en 12 meses y 3 años. Con varios compradores, solo la parte de quien cumple (en matrimonio o pareja inscrita basta uno). El tope incluye garajes y anexos.",
          "ca": "Viure-hi en 12 mesos i 3 anys. Amb diversos compradors, només la part de qui compleix (en matrimoni o parella inscrita n'hi ha prou amb un). El límit inclou garatges i annexos.",
          "en": "Move in within 12 months and stay 3 years. With several buyers, only the share of whoever qualifies (one spouse or registered partner is enough). The cap includes parking and annexes."
        },
        "manual": true,
        "article": "art. 43.1.f) y art. 7",
        "quote": "f) Se aplicará el tipo del 3,5% siempre que el adquirente tenga la consideración de víctima del terrorismo o persona afectada, que destine el inmueble a su vivienda habitual y que el valor de la misma no sea superior a 150.000 euros."
      },
      {
        "id": "andalucia-itp-small-town",
        "tax": "itp",
        "label": {
          "es": "Municipio de menos de 3.000 habitantes, vivienda habitual de hasta 150.000 €",
          "ca": "Municipi de menys de 3.000 habitants, habitatge habitual de fins a 150.000 €",
          "en": "Town under 3,000 people, main home up to €150,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 3.5
        },
        "conditions": {
          "habitual": true,
          "maxValue": 150000
        },
        "extra": {
          "es": "Vivir en ella en 12 meses y 3 años. Con varios compradores, solo la parte de quien cumple (en matrimonio o pareja inscrita basta uno). El tope incluye garajes y anexos.",
          "ca": "Viure-hi en 12 mesos i 3 anys. Amb diversos compradors, només la part de qui compleix (en matrimoni o parella inscrita n'hi ha prou amb un). El límit inclou garatges i annexos.",
          "en": "Move in within 12 months and stay 3 years. With several buyers, only the share of whoever qualifies (one spouse or registered partner is enough). The cap includes parking and annexes."
        },
        "manual": true,
        "article": "art. 43.1.g) y art. 8",
        "quote": "g) Se aplicará el tipo del 3,5% siempre que el inmueble que se adquiere radique en un municipio con problemas de despoblación, que destine el inmueble a su vivienda habitual y que el valor de la misma no sea superior a 150.000 euros. […] tendrán la consideración de municipios con problemas de despoblación aquellos cuya cifra de población sea de menos de 3.000 habitantes."
      },
      {
        "id": "andalucia-itp-storm-2026",
        "tax": "itp",
        "label": {
          "es": "Temporal 2026: vivienda que sustituye a otra destruida por las borrascas (hasta 250.000 €), tipo 0 %",
          "ca": "Temporal 2026: habitatge que en substitueix un de destruït per les borrasques (fins a 250.000 €), tipus 0 %",
          "en": "2026 only: home replacing one destroyed by the storms (up to €250,000), 0% rate"
        },
        "rate": {
          "kind": "flat",
          "rate": 0
        },
        "conditions": {
          "habitual": true,
          "maxValue": 250000
        },
        "extra": {
          "es": "Solo compras del 23 de enero al 31 de diciembre de 2026 que sustituyan una vivienda destruida por las borrascas en los municipios afectados.",
          "ca": "Només compres del 23 de gener al 31 de desembre de 2026 que substitueixin un habitatge destruït per les borrasques als municipis afectats.",
          "en": "Only purchases from 23 January to 31 December 2026 replacing a home destroyed by the storms in the affected municipalities."
        },
        "manual": true,
        "article": "Decreto-ley 1/2026, arts. 3 y 8",
        "quote": "se aplicará el tipo de gravamen del 0% a las transmisiones de inmuebles destinados a constituir la vivienda habitual del contribuyente, que sustituya a otra situada dentro del ámbito territorial del artículo 2 […] b) Que el valor del inmueble adquirido no supere los 250.000 euros. […] Las medidas establecidas en el Capítulo I de este Decreto-ley serán aplicables a los hechos imponibles cuyo devengo se produzca desde el día 23 de enero hasta el 31 de diciembre de 2026, ambos inclusive."
      },
      {
        "id": "andalucia-ajd-habitual",
        "tax": "ajd",
        "label": {
          "es": "Vivienda habitual de hasta 150.000 €",
          "ca": "Habitatge habitual de fins a 150.000 €",
          "en": "Main home up to €150,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 1
        },
        "conditions": {
          "habitual": true,
          "maxValue": 150000
        },
        "extra": {
          "es": "Vivir en ella en 12 meses y 3 años. Con varios compradores, solo la parte de quien cumple (en matrimonio o pareja inscrita basta uno). El tope incluye garajes y anexos.",
          "ca": "Viure-hi en 12 mesos i 3 anys. Amb diversos compradors, només la part de qui compleix (en matrimoni o parella inscrita n'hi ha prou amb un). El límit inclou garatges i annexos.",
          "en": "Move in within 12 months and stay 3 years. With several buyers, only the share of whoever qualifies (one spouse or registered partner is enough). The cap includes parking and annexes."
        },
        "article": "art. 50.1.a)",
        "quote": "a) Se aplicará el tipo del 1% siempre que el inmueble se destine a vivienda habitual del adquirente y que el valor de la misma no sea superior a 150.000 euros."
      },
      {
        "id": "andalucia-ajd-young",
        "tax": "ajd",
        "label": {
          "es": "Menores de 35, vivienda habitual de hasta 150.000 €",
          "ca": "Menors de 35, habitatge habitual de fins a 150.000 €",
          "en": "Under 35, main home up to €150,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.3
        },
        "conditions": {
          "habitual": true,
          "maxAge": 34,
          "maxValue": 150000
        },
        "extra": {
          "es": "Vivir en ella en 12 meses y 3 años. Con varios compradores, solo la parte de quien cumple (en matrimonio o pareja inscrita basta uno). El tope incluye garajes y anexos.",
          "ca": "Viure-hi en 12 mesos i 3 anys. Amb diversos compradors, només la part de qui compleix (en matrimoni o parella inscrita n'hi ha prou amb un). El límit inclou garatges i annexos.",
          "en": "Move in within 12 months and stay 3 years. With several buyers, only the share of whoever qualifies (one spouse or registered partner is enough). The cap includes parking and annexes."
        },
        "article": "art. 50.1.b)",
        "quote": "b) Se aplicará el tipo del 0,3% siempre que el adquirente sea menor de 35 años, que el inmueble se destine a su vivienda habitual y que el valor de la misma no sea superior a 150.000 euros."
      },
      {
        "id": "andalucia-ajd-disability",
        "tax": "ajd",
        "label": {
          "es": "Discapacidad, vivienda habitual de hasta 250.000 €",
          "ca": "Discapacitat, habitatge habitual de fins a 250.000 €",
          "en": "Disability, main home up to €250,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.1
        },
        "conditions": {
          "habitual": true,
          "disabilityMin": 33,
          "maxValue": 250000
        },
        "extra": {
          "es": "Discapacidad del 33 % o más tuya o de tu núcleo familiar. Vivir en ella en 12 meses y 3 años. Con varios compradores, solo la parte de quien cumple (en matrimonio o pareja inscrita basta uno). El tope incluye garajes y anexos.",
          "ca": "Discapacitat del 33 % o més teva o del teu nucli familiar. Viure-hi en 12 mesos i 3 anys. Amb diversos compradors, només la part de qui compleix (en matrimoni o parella inscrita n'hi ha prou amb un). El límit inclou garatges i annexos.",
          "en": "Disability of 33% or more, yours or a close family member's. Move in within 12 months and stay 3 years. With several buyers, only the share of whoever qualifies (one spouse or registered partner is enough). The cap includes parking and annexes."
        },
        "article": "art. 50.1.c)",
        "quote": "c) Se aplicará el tipo del 0,1% siempre que el adquirente o alguna otra persona integrante de su núcleo familiar tenga la consideración de persona con discapacidad, que el inmueble se destine a vivienda habitual del propio adquirente y, en su caso, de la persona integrante de su núcleo familiar con discapacidad, y que el valor de la misma no sea superior a 250.000 euros."
      },
      {
        "id": "andalucia-ajd-large-family",
        "tax": "ajd",
        "label": {
          "es": "Familia numerosa, vivienda habitual de hasta 250.000 €",
          "ca": "Família nombrosa, habitatge habitual de fins a 250.000 €",
          "en": "Large family, main home up to €250,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.1
        },
        "conditions": {
          "habitual": true,
          "largeFamily": true,
          "maxValue": 250000
        },
        "extra": {
          "es": "Vivir en ella en 12 meses y 3 años. Con varios compradores, solo la parte de quien cumple (en matrimonio o pareja inscrita basta uno). El tope incluye garajes y anexos.",
          "ca": "Viure-hi en 12 mesos i 3 anys. Amb diversos compradors, només la part de qui compleix (en matrimoni o parella inscrita n'hi ha prou amb un). El límit inclou garatges i annexos.",
          "en": "Move in within 12 months and stay 3 years. With several buyers, only the share of whoever qualifies (one spouse or registered partner is enough). The cap includes parking and annexes."
        },
        "article": "art. 50.1.d)",
        "quote": "d) Se aplicará el tipo del 0,1% siempre que el adquirente tenga la consideración de miembro de familia numerosa, que el inmueble se destine a vivienda habitual de dicha familia numerosa y que el valor de la misma no sea superior a 250.000 euros."
      },
      {
        "id": "andalucia-ajd-domestic-violence",
        "tax": "ajd",
        "label": {
          "es": "Víctimas de violencia doméstica, vivienda habitual de hasta 150.000 €",
          "ca": "Víctimes de violència domèstica, habitatge habitual de fins a 150.000 €",
          "en": "Domestic-violence victims, main home up to €150,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.3
        },
        "conditions": {
          "habitual": true,
          "maxValue": 150000
        },
        "extra": {
          "es": "Vivir en ella en 12 meses y 3 años. Con varios compradores, solo la parte de quien cumple (en matrimonio o pareja inscrita basta uno). El tope incluye garajes y anexos.",
          "ca": "Viure-hi en 12 mesos i 3 anys. Amb diversos compradors, només la part de qui compleix (en matrimoni o parella inscrita n'hi ha prou amb un). El límit inclou garatges i annexos.",
          "en": "Move in within 12 months and stay 3 years. With several buyers, only the share of whoever qualifies (one spouse or registered partner is enough). The cap includes parking and annexes."
        },
        "manual": true,
        "article": "art. 50.1.e)",
        "quote": "e) Se aplicará el tipo del 0,3% siempre que el adquirente tenga la consideración de víctima de violencia doméstica, que el inmueble se destine a su vivienda habitual y que el valor de la misma no sea superior a 150.000 euros."
      },
      {
        "id": "andalucia-ajd-terrorism",
        "tax": "ajd",
        "label": {
          "es": "Víctimas del terrorismo, vivienda habitual de hasta 150.000 €",
          "ca": "Víctimes del terrorisme, habitatge habitual de fins a 150.000 €",
          "en": "Terrorism victims, main home up to €150,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.3
        },
        "conditions": {
          "habitual": true,
          "maxValue": 150000
        },
        "extra": {
          "es": "Vivir en ella en 12 meses y 3 años. Con varios compradores, solo la parte de quien cumple (en matrimonio o pareja inscrita basta uno). El tope incluye garajes y anexos.",
          "ca": "Viure-hi en 12 mesos i 3 anys. Amb diversos compradors, només la part de qui compleix (en matrimoni o parella inscrita n'hi ha prou amb un). El límit inclou garatges i annexos.",
          "en": "Move in within 12 months and stay 3 years. With several buyers, only the share of whoever qualifies (one spouse or registered partner is enough). The cap includes parking and annexes."
        },
        "manual": true,
        "article": "art. 50.1.f)",
        "quote": "f) Se aplicará el tipo del 0,3% siempre que el adquirente tenga la consideración de víctima de terrorismo o persona afectada, que el inmueble se destine a su vivienda habitual y que el valor de la misma no sea superior a 150.000 euros."
      },
      {
        "id": "andalucia-ajd-small-town",
        "tax": "ajd",
        "label": {
          "es": "Municipio de menos de 3.000 habitantes, vivienda habitual de hasta 150.000 €",
          "ca": "Municipi de menys de 3.000 habitants, habitatge habitual de fins a 150.000 €",
          "en": "Town under 3,000 people, main home up to €150,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.3
        },
        "conditions": {
          "habitual": true,
          "maxValue": 150000
        },
        "extra": {
          "es": "Vivir en ella en 12 meses y 3 años. Con varios compradores, solo la parte de quien cumple (en matrimonio o pareja inscrita basta uno). El tope incluye garajes y anexos.",
          "ca": "Viure-hi en 12 mesos i 3 anys. Amb diversos compradors, només la part de qui compleix (en matrimoni o parella inscrita n'hi ha prou amb un). El límit inclou garatges i annexos.",
          "en": "Move in within 12 months and stay 3 years. With several buyers, only the share of whoever qualifies (one spouse or registered partner is enough). The cap includes parking and annexes."
        },
        "manual": true,
        "article": "art. 50.1.g)",
        "quote": "g) Se aplicará el tipo del 0,3% siempre que el inmueble que se adquiere radique en un municipio con problemas de despoblación, que destine el inmueble a su vivienda habitual y que el valor de la misma no sea superior a 150.000 euros."
      },
      {
        "id": "andalucia-ajd-storm-2026",
        "tax": "ajd",
        "label": {
          "es": "Temporal 2026: vivienda que sustituye a otra destruida por las borrascas (hasta 250.000 €), tipo 0 %",
          "ca": "Temporal 2026: habitatge que en substitueix un de destruït per les borrasques (fins a 250.000 €), tipus 0 %",
          "en": "2026 only: home replacing one destroyed by the storms (up to €250,000), 0% rate"
        },
        "rate": {
          "kind": "flat",
          "rate": 0
        },
        "conditions": {
          "habitual": true,
          "maxValue": 250000
        },
        "extra": {
          "es": "Solo compras del 23 de enero al 31 de diciembre de 2026 que sustituyan una vivienda destruida por las borrascas en los municipios afectados.",
          "ca": "Només compres del 23 de gener al 31 de desembre de 2026 que substitueixin un habitatge destruït per les borrasques als municipis afectats.",
          "en": "Only purchases from 23 January to 31 December 2026 replacing a home destroyed by the storms in the affected municipalities."
        },
        "manual": true,
        "article": "Decreto-ley 1/2026, art. 11",
        "quote": "se aplicará el tipo de gravamen del 0% a las primeras copias de escrituras públicas que formalicen la adquisición de inmuebles destinados a constituir la vivienda habitual del contribuyente, que sustituya a otra situada dentro del ámbito territorial de aplicación del artículo 2"
      }
    ],
    "newHome": {
      "name": "IVA",
      "general": 10,
      "protected": 4,
      "protectedLabel": {
        "es": "VPO de régimen especial o de promoción pública vendida por el promotor",
        "ca": "HPO de règim especial o de promoció pública venuda pel promotor",
        "en": "special-regime or public-promotion VPO sold by the developer"
      },
      "article": "Ley 37/1992, art. 91",
      "quote": "",
      "law": null
    },
    "notes": []
  },
  {
    "id": "aragon",
    "name": {
      "es": "Aragón",
      "ca": "Aragó",
      "en": "Aragon"
    },
    "regime": "common",
    "status": "sourced",
    "law": {
      "title": "Decreto Legislativo 1/2005, de 26 de septiembre, del Gobierno de Aragón, por el que se aprueba el texto refundido de las disposiciones dictadas por la Comunidad Autónoma de Aragón en materia de tributos cedidos.",
      "short": "Decreto Legislativo 1/2005 (Aragón)",
      "url": "https://www.boe.es/buscar/act.php?id=BOA-d-2005-90006",
      "consolidatedAsOf": "2025-07-07",
      "readOn": "2026-11-13"
    },
    "amendments": [
      {
        "title": "Ley 3/2025, de 27 de junio, de apoyo fiscal a la empresa familiar (BOE-A-2025-14790)",
        "url": "https://www.boe.es/buscar/doc.php?id=BOE-A-2025-14790"
      }
    ],
    "taxAgency": {
      "name": "Administración Tributaria de Aragón",
      "url": "https://www.aragon.es/administracion-tributaria-de-aragon"
    },
    "itp": {
      "general": {
        "kind": "scale",
        "how": "progressive",
        "brackets": [
          {
            "upTo": 400000,
            "rate": 8
          },
          {
            "upTo": 450000,
            "rate": 8.5
          },
          {
            "upTo": 500000,
            "rate": 9
          },
          {
            "upTo": 750000,
            "rate": 9.5
          },
          {
            "upTo": null,
            "rate": 10
          }
        ]
      },
      "article": "art. 121-1",
      "quote": "Los tipos impositivos aplicables sobre la base liquidable de la transmisión onerosa de bienes inmuebles, así como en la constitución y en la cesión de derechos reales que recaigan sobre los mismos, excepto los derechos reales de garantía, serán los que, en función del valor del bien objeto del negocio jurídico, se indican en la siguiente escala: […] Determinados así los tipos procedentes, se aplicarán sobre la base liquidable en la misma proporción que sobre el valor del bien."
    },
    "ajd": {
      "general": {
        "kind": "flat",
        "rate": 1.5
      },
      "article": "art. 122-1.1",
      "quote": "La cuota tributaria se obtendrá aplicando sobre la base liquidable el tipo general del 1,5 por 100 en las primeras copias de escrituras y actas notariales sujetas como “Documentos notariales”."
    },
    "benefits": [
      {
        "id": "aragon-itp-young",
        "tax": "itp",
        "label": {
          "es": "Bonificación del 12,5 %: menores de 35, vivienda habitual de hasta 100.000 €",
          "ca": "Bonificació del 12,5 %: menors de 35, habitatge habitual de fins a 100.000 €",
          "en": "12.5% rebate: under 35, main home up to €100,000"
        },
        "bonusPercent": 12.5,
        "conditions": {
          "habitual": true,
          "maxAge": 34,
          "maxValue": 100000
        },
        "extra": {
          "es": "Valor de hasta 100.000 €. Con varios compradores, en proporción a la parte de quien cumple. Las tres bonificaciones del 12,5 % son compatibles entre sí.",
          "ca": "Valor de fins a 100.000 €. Amb diversos compradors, en proporció a la part de qui compleix. Les tres bonificacions del 12,5 % són compatibles entre si.",
          "en": "Value up to €100,000. With several buyers, in proportion to the share of whoever qualifies. The three 12.5% rebates can be combined."
        },
        "article": "art. 121-4.1.a",
        "quote": "a) Para las personas físicas menores de 35 años, siempre que el valor real del bien inmueble no supere los 100.000 euros: una bonificación del 12,5 por 100 de la cuota íntegra. […] Las bonificaciones en cuota previstas en este artículo serán compatibles entre sí."
      },
      {
        "id": "aragon-itp-disability",
        "tax": "itp",
        "label": {
          "es": "Bonificación del 12,5 %: discapacidad del 65 % o más, vivienda habitual de hasta 100.000 €",
          "ca": "Bonificació del 12,5 %: discapacitat del 65 % o més, habitatge habitual de fins a 100.000 €",
          "en": "12.5% rebate: disability of 65% or more, main home up to €100,000"
        },
        "bonusPercent": 12.5,
        "conditions": {
          "habitual": true,
          "disabilityMin": 65,
          "maxValue": 100000
        },
        "extra": {
          "es": "Valor de hasta 100.000 €. Con varios compradores, en proporción a la parte de quien cumple. Las tres bonificaciones del 12,5 % son compatibles entre sí.",
          "ca": "Valor de fins a 100.000 €. Amb diversos compradors, en proporció a la part de qui compleix. Les tres bonificacions del 12,5 % són compatibles entre si.",
          "en": "Value up to €100,000. With several buyers, in proportion to the share of whoever qualifies. The three 12.5% rebates can be combined."
        },
        "article": "art. 121-4.1.b",
        "quote": "b) Para las personas con discapacidad igual o superior al 65 por 100, siempre que el valor real del bien inmueble no supere los 100.000 euros: una bonificación del 12,5 por 100 de la cuota íntegra."
      },
      {
        "id": "aragon-itp-gender-violence",
        "tax": "itp",
        "label": {
          "es": "Bonificación del 12,5 %: mujeres víctimas de violencia de género, vivienda habitual de hasta 100.000 €",
          "ca": "Bonificació del 12,5 %: dones víctimes de violència de gènere, habitatge habitual de fins a 100.000 €",
          "en": "12.5% rebate: women victims of gender violence, main home up to €100,000"
        },
        "bonusPercent": 12.5,
        "conditions": {
          "habitual": true,
          "maxValue": 100000
        },
        "extra": {
          "es": "Valor de hasta 100.000 €. Con varios compradores, en proporción a la parte de quien cumple. Las tres bonificaciones del 12,5 % son compatibles entre sí.",
          "ca": "Valor de fins a 100.000 €. Amb diversos compradors, en proporció a la part de qui compleix. Les tres bonificacions del 12,5 % són compatibles entre si.",
          "en": "Value up to €100,000. With several buyers, in proportion to the share of whoever qualifies. The three 12.5% rebates can be combined."
        },
        "manual": true,
        "article": "art. 121-4.1.c",
        "quote": "c) Para mujeres víctimas de violencia de género, considerando tales aquellas que cuenten con orden de protección en vigor o sentencia judicial firme por tal motivo en los últimos 10 años, siempre que el valor real del bien inmueble no supere los 100.000 euros: una bonificación del 12,5 por 100 de la cuota íntegra."
      },
      {
        "id": "aragon-itp-large-family",
        "tax": "itp",
        "label": {
          "es": "Bonificación del 50 %: familia numerosa, vivienda habitual",
          "ca": "Bonificació del 50 %: família nombrosa, habitatge habitual",
          "en": "50% rebate: large family, main home"
        },
        "bonusPercent": 50,
        "conditions": {
          "habitual": true,
          "largeFamily": true
        },
        "extra": {
          "es": "Renta de quienes vivirán en ella hasta 35.000 € (+6.000 € por hijo por encima del mínimo). Vender la anterior vivienda habitual y que la nueva sea más de un 10 % mayor, salvo si es tu primera vivienda habitual.",
          "ca": "Renda de qui hi viurà fins a 35.000 € (+6.000 € per fill per sobre del mínim). Vendre l'anterior habitatge habitual i que el nou sigui més d'un 10 % més gran, tret que sigui el teu primer habitatge habitual.",
          "en": "Income of those who will live there up to €35,000 (+€6,000 per child above the minimum). Sell your previous main home and buy one over 10% larger, unless it is your first main home."
        },
        "article": "art. 121-5",
        "quote": "En las transmisiones de aquellos inmuebles que vayan a constituir la vivienda habitual de una familia numerosa, el adquirente podrá aplicarse, en el concepto «Transmisiones patrimoniales onerosas», una bonificación del 50 por 100 sobre la cuota tributaria íntegra […] no exceda de 35.000 euros. Esta cantidad se incrementará en 6.000 euros por cada hijo que exceda del número de hijos que la legislación vigente exige como mínimo para alcanzar la condición legal de familia numerosa. […] Los requisitos establecidos en las letras b) y c) del apartado 1 de este artículo se reputarán cumplidos cuando la vivienda adquirida sea la primera vivienda habitual del sujeto pasivo. […] La bonificación en cuota prevista en este artículo será incompatible con cualquier otra prevista para este concepto en la normativa autonómica."
      },
      {
        "id": "aragon-itp-large-family-rural",
        "tax": "itp",
        "label": {
          "es": "Bonificación del 60 %: familia numerosa en el medio rural (fiscalidad diferenciada)",
          "ca": "Bonificació del 60 %: família nombrosa al medi rural (fiscalitat diferenciada)",
          "en": "60% rebate: large family in the rural regime"
        },
        "bonusPercent": 60,
        "conditions": {
          "habitual": true,
          "largeFamily": true
        },
        "extra": {
          "es": "Asentamientos rurales de alto o extremo riesgo de despoblación; residir allí 5 años.",
          "ca": "Assentaments rurals d'alt o extrem risc de despoblament; residir-hi 5 anys.",
          "en": "Rural settlements at high or extreme risk of depopulation; live there 5 years."
        },
        "manual": true,
        "article": "art. 160-3.1",
        "quote": "Cuando, concurriendo las circunstancias y requisitos señalados en el artículo 121-5 de este texto refundido, resulte aplicable el régimen especial de fiscalidad diferenciada, el importe de la bonificación en las transmisiones de aquellos inmuebles que vayan a constituir la vivienda habitual de una familia numerosa será del 60 por 100. […] – Asentamientos rurales con alto riesgo de despoblación, que incluyen a los asentamientos que pertenecen a los Rangos VIII y IX de la estructura del sistema de asentamientos de Aragón."
      },
      {
        "id": "aragon-ajd-young",
        "tax": "ajd",
        "label": {
          "es": "Bonificación del 30 %: menores de 35, vivienda habitual de hasta 100.000 €",
          "ca": "Bonificació del 30 %: menors de 35, habitatge habitual de fins a 100.000 €",
          "en": "30% rebate: under 35, main home up to €100,000"
        },
        "bonusPercent": 30,
        "conditions": {
          "habitual": true,
          "maxAge": 34,
          "maxValue": 100000
        },
        "extra": {
          "es": "Valor de hasta 100.000 €. Con varios compradores, en proporción a la parte de quien cumple. Las tres bonificaciones del 12,5 % son compatibles entre sí.",
          "ca": "Valor de fins a 100.000 €. Amb diversos compradors, en proporció a la part de qui compleix. Les tres bonificacions del 12,5 % són compatibles entre si.",
          "en": "Value up to €100,000. With several buyers, in proportion to the share of whoever qualifies. The three 12.5% rebates can be combined."
        },
        "article": "art. 122-10",
        "quote": "a) Para las personas físicas menores de 35 años, siempre que el valor real del bien inmueble no supere los 100.000 euros: una bonificación del 30 por 100 de la cuota íntegra. […] b) Para las personas con discapacidad igual o superior al 65 por 100, siempre que el valor real del bien inmueble no supere los 100.000 euros: una bonificación del 30 por 100 de la cuota íntegra. […] c) Para mujeres víctimas de violencia de género, considerando tales aquellas que cuenten con orden de protección en vigor o sentencia judicial firme por tal motivo en los últimos 10 años, siempre que el valor real del bien inmueble no supere los 100.000 euros: una bonificación del 30 por 100 de la cuota íntegra."
      },
      {
        "id": "aragon-ajd-disability",
        "tax": "ajd",
        "label": {
          "es": "Bonificación del 30 %: discapacidad del 65 % o más, vivienda habitual de hasta 100.000 €",
          "ca": "Bonificació del 30 %: discapacitat del 65 % o més, habitatge habitual de fins a 100.000 €",
          "en": "30% rebate: disability of 65% or more, main home up to €100,000"
        },
        "bonusPercent": 30,
        "conditions": {
          "habitual": true,
          "disabilityMin": 65,
          "maxValue": 100000
        },
        "extra": {
          "es": "Valor de hasta 100.000 €. Con varios compradores, en proporción a la parte de quien cumple. Las tres bonificaciones del 12,5 % son compatibles entre sí.",
          "ca": "Valor de fins a 100.000 €. Amb diversos compradors, en proporció a la part de qui compleix. Les tres bonificacions del 12,5 % són compatibles entre si.",
          "en": "Value up to €100,000. With several buyers, in proportion to the share of whoever qualifies. The three 12.5% rebates can be combined."
        },
        "article": "art. 122-10",
        "quote": "a) Para las personas físicas menores de 35 años, siempre que el valor real del bien inmueble no supere los 100.000 euros: una bonificación del 30 por 100 de la cuota íntegra. […] b) Para las personas con discapacidad igual o superior al 65 por 100, siempre que el valor real del bien inmueble no supere los 100.000 euros: una bonificación del 30 por 100 de la cuota íntegra. […] c) Para mujeres víctimas de violencia de género, considerando tales aquellas que cuenten con orden de protección en vigor o sentencia judicial firme por tal motivo en los últimos 10 años, siempre que el valor real del bien inmueble no supere los 100.000 euros: una bonificación del 30 por 100 de la cuota íntegra."
      },
      {
        "id": "aragon-ajd-large-family",
        "tax": "ajd",
        "label": {
          "es": "Bonificación del 60 %: familia numerosa, vivienda habitual",
          "ca": "Bonificació del 60 %: família nombrosa, habitatge habitual",
          "en": "60% rebate: large family, main home"
        },
        "bonusPercent": 60,
        "conditions": {
          "habitual": true,
          "largeFamily": true
        },
        "extra": {
          "es": "Renta de quienes vivirán en ella hasta 35.000 € (+6.000 € por hijo por encima del mínimo). Vender la anterior vivienda habitual y que la nueva sea más de un 10 % mayor, salvo si es tu primera vivienda habitual.",
          "ca": "Renda de qui hi viurà fins a 35.000 € (+6.000 € per fill per sobre del mínim). Vendre l'anterior habitatge habitual i que el nou sigui més d'un 10 % més gran, tret que sigui el teu primer habitatge habitual.",
          "en": "Income of those who will live there up to €35,000 (+€6,000 per child above the minimum). Sell your previous main home and buy one over 10% larger, unless it is your first main home."
        },
        "article": "art. 122-3",
        "quote": "La cuota tributaria del concepto “Actos jurídicos documentados” se obtendrá aplicando una bonificación del 60 por 100 de la cuota íntegra en las primeras copias de escrituras que documenten las transmisiones de bienes inmuebles que vayan a constituir la vivienda habitual de una familia numerosa […] la vivienda habitual de una familia numerosa, se obtendrá aplicando una bonificación del 70 por 100.»"
      }
    ],
    "newHome": {
      "name": "IVA",
      "general": 10,
      "protected": 4,
      "protectedLabel": {
        "es": "VPO de régimen especial o de promoción pública vendida por el promotor",
        "ca": "HPO de règim especial o de promoció pública venuda pel promotor",
        "en": "special-regime or public-promotion VPO sold by the developer"
      },
      "article": "Ley 37/1992, art. 91",
      "quote": "",
      "law": null
    },
    "notes": [
      {
        "es": "Escala por tramos: 8 % hasta 400.000 €, 8,5 % hasta 450.000 €, 9 % hasta 500.000 €, 9,5 % hasta 750.000 € y 10 % por encima. Aragón no tiene tipos reducidos de vivienda: da bonificaciones sobre la cuota.",
        "ca": "Escala per trams: 8 % fins a 400.000 €, 8,5 % fins a 450.000 €, 9 % fins a 500.000 €, 9,5 % fins a 750.000 € i 10 % per sobre. L'Aragó no té tipus reduïts d'habitatge: dona bonificacions sobre la quota.",
        "en": "Slices: 8% up to €400,000, 8.5% up to €450,000, 9% up to €500,000, 9.5% up to €750,000 and 10% above. Aragon has no reduced home rates: it grants rebates on the tax due."
      }
    ]
  },
  {
    "id": "asturias",
    "name": {
      "es": "Asturias",
      "ca": "Astúries",
      "en": "Asturias"
    },
    "regime": "common",
    "status": "sourced",
    "law": {
      "title": "Decreto Legislativo 2/2014, de 22 de octubre, por el que se aprueba el texto refundido de las disposiciones legales del Principado de Asturias en materia de tributos cedidos por el Estado.",
      "short": "Decreto Legislativo 2/2014",
      "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2015-945",
      "consolidatedAsOf": "2025-12-31",
      "readOn": "2026-11-13"
    },
    "amendments": [
      {
        "title": "Ley del Principado de Asturias 5/2025, de 31 de diciembre, de Presupuestos Generales para 2026",
        "url": "https://www.boe.es/buscar/doc.php?id=BOE-A-2026-2888"
      },
      {
        "title": "Ley del Principado de Asturias 3/2025, de 19 de noviembre, de modificación del texto refundido",
        "url": "https://www.boe.es/buscar/doc.php?id=BOE-A-2025-25707"
      }
    ],
    "taxAgency": {
      "name": "Ente Público de Servicios Tributarios del Principado de Asturias (ATRIAN)",
      "url": "https://www.tributasenasturias.es"
    },
    "itp": {
      "general": {
        "kind": "scale",
        "how": "whole",
        "brackets": [
          {
            "upTo": 300000,
            "rate": 8
          },
          {
            "upTo": 500000,
            "rate": 9
          },
          {
            "upTo": null,
            "rate": 10
          }
        ]
      },
      "article": "art. 26",
      "quote": "la cuota tributaria se obtendrá aplicando sobre la base liquidable el tipo de gravamen que resulte de la siguiente tarifa atendiendo al valor íntegro del bien o derecho, con independencia de que la transmisión, constitución o cesión objeto de gravamen no se realice sobre la totalidad del mismo: […] Entre 0 y 300.000 euros […] Entre 300.000,01 y 500.000 euros […] Más de 500.000 euros"
    },
    "ajd": {
      "general": {
        "kind": "flat",
        "rate": 1.2
      },
      "article": "art. 34",
      "quote": "Con carácter general se aplicará el tipo del 1,2 por ciento en las primeras copias de escrituras y actas notariales sujetas como documentos notariales."
    },
    "benefits": [
      {
        "id": "asturias-itp-young",
        "tax": "itp",
        "label": {
          "es": "Jóvenes de hasta 35 años, vivienda habitual",
          "ca": "Joves de fins a 35 anys, habitatge habitual",
          "en": "Buyers aged 35 or under, main home"
        },
        "rate": {
          "kind": "scale",
          "how": "whole",
          "brackets": [
            {
              "upTo": 150000,
              "rate": 4
            },
            {
              "upTo": null,
              "rate": 6
            }
          ]
        },
        "conditions": {
          "habitual": true,
          "maxAge": 35
        },
        "extra": {
          "es": "Vivienda usada; habitarla en 6 meses y vivir en ella al menos 3 años seguidos.",
          "ca": "Habitatge usat; habitar-lo en 6 mesos i viure-hi almenys 3 anys seguits.",
          "en": "Resale home; move in within 6 months and live there at least 3 years in a row."
        },
        "article": "art. 32 bis",
        "quote": "Siempre que la vivienda constituya o vaya a constituir la vivienda habitual del adquirente, los tipos de gravamen aplicables a las segundas o ulteriores transmisiones de viviendas situadas en zonas rurales de concejos en riesgo de despoblamiento o en crisis demográfica […] y a las adquisiciones de vivienda por jóvenes de hasta 35 años, familias numerosas, familias monoparentales y mujeres víctimas de violencia de género, serán los siguientes: […] Hasta 150.000,00. […] Más de 150.000,00. […] la vivienda debe ser habitada de manera efectiva y con carácter permanente por el adquirente, en un plazo de seis meses, contados a partir de la fecha de adquisición salvo que medie justa causa y ha de constituir su residencia permanente durante un plazo continuado de al menos tres años."
      },
      {
        "id": "asturias-itp-large-family",
        "tax": "itp",
        "label": {
          "es": "Familia numerosa, vivienda habitual",
          "ca": "Família nombrosa, habitatge habitual",
          "en": "Large family, main home"
        },
        "rate": {
          "kind": "scale",
          "how": "whole",
          "brackets": [
            {
              "upTo": 150000,
              "rate": 4
            },
            {
              "upTo": null,
              "rate": 6
            }
          ]
        },
        "conditions": {
          "habitual": true,
          "largeFamily": true
        },
        "extra": {
          "es": "Vivienda usada; habitarla en 6 meses y vivir en ella al menos 3 años seguidos.",
          "ca": "Habitatge usat; habitar-lo en 6 mesos i viure-hi almenys 3 anys seguits.",
          "en": "Resale home; move in within 6 months and live there at least 3 years in a row."
        },
        "article": "art. 32 bis",
        "quote": "y a las adquisiciones de vivienda por jóvenes de hasta 35 años, familias numerosas, familias monoparentales y mujeres víctimas de violencia de género, serán los siguientes: […] Hasta 150.000,00. […] Más de 150.000,00."
      },
      {
        "id": "asturias-itp-single-parent",
        "tax": "itp",
        "label": {
          "es": "Familia monoparental, vivienda habitual",
          "ca": "Família monoparental, habitatge habitual",
          "en": "Single-parent family, main home"
        },
        "rate": {
          "kind": "scale",
          "how": "whole",
          "brackets": [
            {
              "upTo": 150000,
              "rate": 4
            },
            {
              "upTo": null,
              "rate": 6
            }
          ]
        },
        "conditions": {
          "habitual": true
        },
        "extra": {
          "es": "Vivienda usada; habitarla en 6 meses y vivir en ella al menos 3 años seguidos.",
          "ca": "Habitatge usat; habitar-lo en 6 mesos i viure-hi almenys 3 anys seguits.",
          "en": "Resale home; move in within 6 months and live there at least 3 years in a row."
        },
        "manual": true,
        "article": "art. 32 bis",
        "quote": "y a las adquisiciones de vivienda por jóvenes de hasta 35 años, familias numerosas, familias monoparentales y mujeres víctimas de violencia de género, serán los siguientes: […] Hasta 150.000,00. […] Más de 150.000,00."
      },
      {
        "id": "asturias-itp-gender-violence",
        "tax": "itp",
        "label": {
          "es": "Mujeres víctimas de violencia de género, vivienda habitual",
          "ca": "Dones víctimes de violència de gènere, habitatge habitual",
          "en": "Women victims of gender violence, main home"
        },
        "rate": {
          "kind": "scale",
          "how": "whole",
          "brackets": [
            {
              "upTo": 150000,
              "rate": 4
            },
            {
              "upTo": null,
              "rate": 6
            }
          ]
        },
        "conditions": {
          "habitual": true
        },
        "extra": {
          "es": "Vivienda usada; habitarla en 6 meses y vivir en ella al menos 3 años seguidos.",
          "ca": "Habitatge usat; habitar-lo en 6 mesos i viure-hi almenys 3 anys seguits.",
          "en": "Resale home; move in within 6 months and live there at least 3 years in a row."
        },
        "manual": true,
        "article": "art. 32 bis",
        "quote": "y a las adquisiciones de vivienda por jóvenes de hasta 35 años, familias numerosas, familias monoparentales y mujeres víctimas de violencia de género, serán los siguientes: […] Hasta 150.000,00. […] Más de 150.000,00."
      },
      {
        "id": "asturias-itp-rural",
        "tax": "itp",
        "label": {
          "es": "Vivienda habitual en zona rural de concejo en riesgo de despoblamiento",
          "ca": "Habitatge habitual en zona rural de conceyu en risc de despoblament",
          "en": "Main home in a rural area of a depopulating municipality"
        },
        "rate": {
          "kind": "scale",
          "how": "whole",
          "brackets": [
            {
              "upTo": 150000,
              "rate": 4
            },
            {
              "upTo": null,
              "rate": 6
            }
          ]
        },
        "conditions": {
          "habitual": true
        },
        "extra": {
          "es": "Vivienda usada; habitarla en 6 meses y vivir en ella al menos 3 años seguidos.",
          "ca": "Habitatge usat; habitar-lo en 6 mesos i viure-hi almenys 3 anys seguits.",
          "en": "Resale home; move in within 6 months and live there at least 3 years in a row."
        },
        "manual": true,
        "article": "art. 32 bis",
        "quote": "Siempre que la vivienda constituya o vaya a constituir la vivienda habitual del adquirente, los tipos de gravamen aplicables a las segundas o ulteriores transmisiones de viviendas situadas en zonas rurales de concejos en riesgo de despoblamiento o en crisis demográfica, así clasificados según lo dispuesto en el Decreto 83/2025, de 23 de junio […] Hasta 150.000,00. […] Más de 150.000,00."
      },
      {
        "id": "asturias-itp-protected",
        "tax": "itp",
        "label": {
          "es": "Vivienda protegida del Principado (segunda transmisión), vivienda habitual",
          "ca": "Habitatge protegit del Principat (segona transmissió), habitatge habitual",
          "en": "Asturian protected housing (resale), main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 3
        },
        "conditions": {
          "habitual": true,
          "protected": true
        },
        "extra": {
          "es": "Que siga siendo protegida con precio máximo; tras la compra no puedes tener más de una vivienda; habitarla en 6 meses y 3 años.",
          "ca": "Que continuï sent protegit amb preu màxim; després de la compra no pots tenir més d'un habitatge; habitar-lo en 6 mesos i 3 anys.",
          "en": "It must still be protected with a maximum price; after buying you may own no more than one home; move in within 6 months, stay 3 years."
        },
        "article": "art. 27",
        "quote": "El tipo de gravamen aplicable a las segundas o ulteriores transmisiones de viviendas calificadas de protección pública por el Principado de Asturias, así como a la constitución y cesión de derechos reales sobre las mismas, con exclusión de los de garantía, será del 3 por ciento siempre que las mismas constituyan o vayan a constituir la vivienda habitual del adquirente […] No hayan perdido la condición de viviendas protegidas, y se encuentren sujetas a precio máximo de venta. […] El adquirente, como consecuencia de esta adquisición, no resulte propietario u ostente derechos reales sobre más de una vivienda."
      },
      {
        "id": "asturias-ajd-protected",
        "tax": "ajd",
        "label": {
          "es": "Vivienda protegida comprada con ayudas públicas, vivienda habitual",
          "ca": "Habitatge protegit comprat amb ajuts públics, habitatge habitual",
          "en": "Protected housing bought with public aid, main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.3
        },
        "conditions": {
          "habitual": true,
          "protected": true
        },
        "extra": {
          "es": "Debes ser beneficiario de ayudas del Estado o del Principado para comprarla.",
          "ca": "Has de ser beneficiari d'ajuts de l'Estat o del Principat per comprar-lo.",
          "en": "You must receive state or Asturian aid to buy it."
        },
        "article": "art. 35",
        "quote": "Se aplicará el tipo del 0,3 por ciento a la adquisición de viviendas por beneficiarios de ayudas económicas percibidas de la Administración del Estado y de la Administración del Principado de Asturias para la adquisición de vivienda habitual de protección pública que no goce de la exención prevista en la normativa del Impuesto sobre Transmisiones Patrimoniales y Actos Jurídicos Documentados."
      }
    ],
    "newHome": {
      "name": "IVA",
      "general": 10,
      "protected": 4,
      "protectedLabel": {
        "es": "VPO de régimen especial o de promoción pública vendida por el promotor",
        "ca": "HPO de règim especial o de promoció pública venuda pel promotor",
        "en": "special-regime or public-promotion VPO sold by the developer"
      },
      "article": "Ley 37/1992, art. 91",
      "quote": "",
      "law": null
    },
    "notes": [
      {
        "es": "El tipo general se aplica entero según el valor (8 % hasta 300.000 €, 9 % hasta 500.000 €, 10 % por encima), no por tramos. Los grandes tenedores pagan el 20 % (art. 31 bis).",
        "ca": "El tipus general s'aplica sencer segons el valor (8 % fins a 300.000 €, 9 % fins a 500.000 €, 10 % per sobre), no per trams. Els grans tenidors paguen el 20 % (art. 31 bis).",
        "en": "The general rate applies to the whole value by bracket (8% up to €300,000, 9% up to €500,000, 10% above), not by slices. Large holders pay 20% (art. 31 bis)."
      }
    ]
  },
  {
    "id": "baleares",
    "name": {
      "es": "Illes Balears",
      "ca": "Illes Balears",
      "en": "Balearic Islands"
    },
    "regime": "common",
    "status": "sourced",
    "law": {
      "title": "Decreto Legislativo 1/2014, de 6 de junio, por el que se aprueba el Texto Refundido de las disposiciones legales de la Comunidad Autónoma de las Illes Balears en materia de tributos cedidos por el Estado.",
      "short": "Decreto Legislativo 1/2014 (Illes Balears)",
      "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2014-6925",
      "consolidatedAsOf": "2026-06-13",
      "readOn": "2026-11-13"
    },
    "amendments": [
      {
        "title": "Ley 4/2026, de 11 de junio (BOE-A-2026-15579), disposición final 67",
        "url": "https://www.boe.es/buscar/doc.php?id=BOE-A-2026-15579"
      }
    ],
    "taxAgency": {
      "name": "Agència Tributària de les Illes Balears (ATIB)",
      "url": "https://www.atib.es"
    },
    "itp": {
      "general": {
        "kind": "scale",
        "how": "progressive",
        "brackets": [
          {
            "upTo": 400000,
            "rate": 8
          },
          {
            "upTo": 600000,
            "rate": 9
          },
          {
            "upTo": 1000000,
            "rate": 10
          },
          {
            "upTo": 2000000,
            "rate": 12
          },
          {
            "upTo": null,
            "rate": 13
          }
        ]
      },
      "article": "art. 10.a",
      "quote": "a) Como regla general, el tipo medio que resulte de aplicar la siguiente tarifa en función del valor real o declarado –si éste último es superior al real– del bien inmueble objeto de transmisión o de constitución o cesión del derecho real: […] El tipo medio es el derivado de multiplicar por cien el cociente resultante de dividir la cuota obtenida por la aplicación de las anteriores tarifas por el valor total del inmueble. El tipo medio ha de expresarse con dos decimales"
    },
    "ajd": {
      "general": {
        "kind": "flat",
        "rate": 1.5
      },
      "article": "art. 15",
      "quote": "tributarán, además de por la cuota fija prevista en el artículo 31.1 de dicha norma, al tipo de gravamen del 1,5%."
    },
    "benefits": [
      {
        "id": "baleares-itp-habitual",
        "tax": "itp",
        "label": {
          "es": "Vivienda habitual de hasta 270.151,20 € sin otra vivienda",
          "ca": "Habitatge habitual de fins a 270.151,20 € sense cap altre habitatge",
          "en": "Main home up to €270,151.20, owning no other home"
        },
        "rate": {
          "kind": "flat",
          "rate": 4
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "maxValue": 270151.2
        },
        "extra": {
          "es": "Valor hasta 270.151,20 €; compras al menos el 50 % y no tienes el 50 % o más de otra vivienda.",
          "ca": "Valor fins a 270.151,20 €; compres almenys el 50 % i no tens el 50 % o més d'un altre habitatge.",
          "en": "Value up to €270,151.20; you buy at least 50% and own no 50% or more of another home."
        },
        "article": "art. 10.c",
        "quote": "cuando el valor real o declarado –siempre que éste último sea superior al real– del inmueble sea igual o inferior a 270.151,20 euros, y siempre que el inmueble haya de constituir, en el momento de la adquisición, la vivienda habitual del adquirente […] no sea titular o cotitular en un porcentaje igual o superior al 50 % de ningún otro derecho de propiedad plena o de uso o disfrute respecto de ninguna otra vivienda, el tipo de gravamen aplicable es el 4 %."
      },
      {
        "id": "baleares-itp-young",
        "tax": "itp",
        "label": {
          "es": "Menores de 36, primera vivienda habitual de hasta 270.151,20 €",
          "ca": "Menors de 36, primer habitatge habitual de fins a 270.151,20 €",
          "en": "Under 36, first main home up to €270,151.20"
        },
        "rate": {
          "kind": "flat",
          "rate": 2
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "maxAge": 35,
          "maxValue": 270151.2
        },
        "extra": {
          "es": "Valor hasta 270.151,20 €; compras al menos el 50 % y no tienes el 50 % o más de otra vivienda.",
          "ca": "Valor fins a 270.151,20 €; compres almenys el 50 % i no tens el 50 % o més d'un altre habitatge.",
          "en": "Value up to €270,151.20; you buy at least 50% and own no 50% or more of another home."
        },
        "article": "art. 10.d.1.º",
        "quote": "El tipo de gravamen aplicable es del 2 %, siempre que se cumplan los requisitos de la letra c) anterior, incluido el valor máximo del inmueble de 270.151,20 euros, en los supuestos específicos siguientes: […] Cuando el adquirente sea menor de 36 años y además la vivienda constituya la primera vivienda respecto de la que adquiera, en un porcentaje igual o superior al 50 %, la plena propiedad o el derecho de uso o disfrute de la vivienda."
      },
      {
        "id": "baleares-itp-disabled-relative",
        "tax": "itp",
        "label": {
          "es": "Con derecho al mínimo por discapacidad de ascendientes o descendientes, hasta 270.151,20 €",
          "ca": "Amb dret al mínim per discapacitat d'ascendents o descendents, fins a 270.151,20 €",
          "en": "Entitled to the IRPF allowance for disabled parents or children, up to €270,151.20"
        },
        "rate": {
          "kind": "flat",
          "rate": 2
        },
        "conditions": {
          "habitual": true,
          "maxValue": 270151.2
        },
        "extra": {
          "es": "Valor hasta 270.151,20 €; compras al menos el 50 % y no tienes el 50 % o más de otra vivienda.",
          "ca": "Valor fins a 270.151,20 €; compres almenys el 50 % i no tens el 50 % o més d'un altre habitatge.",
          "en": "Value up to €270,151.20; you buy at least 50% and own no 50% or more of another home."
        },
        "manual": true,
        "article": "art. 10.d.2.º",
        "quote": "El tipo de gravamen aplicable es del 2 %, siempre que se cumplan los requisitos de la letra c) anterior, incluido el valor máximo del inmueble de 270.151,20 euros, en los supuestos específicos siguientes: […] Cuando el adquiriente tenga derecho al mínimo por discapacidad de ascendientes o de descendientes en el impuesto sobre la renta de las personas físicas correspondiente al último periodo impositivo cuyo plazo de declaración haya finalizado."
      },
      {
        "id": "baleares-itp-large-family",
        "tax": "itp",
        "label": {
          "es": "Familia numerosa o monoparental, vivienda habitual",
          "ca": "Família nombrosa o monoparental, habitatge habitual",
          "en": "Large or single-parent family, main home"
        },
        "rate": {
          "kind": "scale",
          "how": "progressive",
          "brackets": [
            {
              "upTo": 270151.2,
              "rate": 2
            },
            {
              "upTo": null,
              "rate": 8
            }
          ]
        },
        "conditions": {
          "habitual": true,
          "largeFamily": true
        },
        "extra": {
          "es": "Padres que conviven con los hijos. 2 % sobre los primeros 270.151,20 € y 8 % el resto, con el tope de valor de la orden de zonas.",
          "ca": "Pares que conviuen amb els fills. 2 % sobre els primers 270.151,20 € i 8 % la resta, amb el límit de valor de l'ordre de zones.",
          "en": "Parents living with the children. 2% on the first €270,151.20 and 8% on the rest, within the value cap of the zones order."
        },
        "article": "art. 10.d.3.º",
        "quote": "la vivienda habitual del padre, la madre o los padres que convivan con el hijo, la hija o los hijos sometidos a la patria potestad y que integren una familia numerosa o una familia monoparental […] En este caso, el tipo de gravamen será del 2 % para los primeros 270.151,20 euros y del 8 % para el exceso."
      },
      {
        "id": "baleares-itp-young-30",
        "tax": "itp",
        "label": {
          "es": "Bonificación del 100 %: menores de 30, primera vivienda habitual de hasta 270.151,20 €",
          "ca": "Bonificació del 100 %: menors de 30, primer habitatge habitual de fins a 270.151,20 €",
          "en": "100% rebate: under 30, first main home up to €270,151.20"
        },
        "bonusPercent": 100,
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "maxAge": 29,
          "maxValue": 270151.2
        },
        "extra": {
          "es": "Residir en Baleares los 3 años anteriores, primera vivienda, hipoteca de al menos el 60 % del valor de tasación y base imponible del IRPF hasta 52.800 € (84.480 € en conjunta).",
          "ca": "Residir a les Balears els 3 anys anteriors, primer habitatge, hipoteca d'almenys el 60 % del valor de taxació i base imposable de l'IRPF fins a 52.800 € (84.480 € en conjunta).",
          "en": "Resident in the Balearics for the previous 3 years, first home, mortgage of at least 60% of the appraisal value and IRPF taxable base up to €52,800 (€84,480 joint)."
        },
        "article": "art. 14 quater",
        "quote": "En las transmisiones onerosas de inmuebles que vayan a constituir la primera vivienda habitual de jóvenes menores de treinta años, o de personas con un grado de discapacidad igual o superior al 33 %, se aplicará una bonificación del 100 % de la cuota tributaria […] El adquiriente debe tener su residencia habitual en las Illes Balears durante al menos los tres años inmediatamente anteriores a la fecha de la adquisición. […] no podrá ser superior a 52.800 euros en el caso de tributación individual o a 84.480 euros en el caso de tributación conjunta. […] El adquiriente debe haber contratado con una entidad financiera un préstamo con garantía hipotecaria por un importe igual o superior al 60 % del valor de tasación de la vivienda."
      },
      {
        "id": "baleares-itp-disability",
        "tax": "itp",
        "label": {
          "es": "Bonificación del 100 %: discapacidad del 33 % o más, primera vivienda habitual de hasta 270.151,20 €",
          "ca": "Bonificació del 100 %: discapacitat del 33 % o més, primer habitatge habitual de fins a 270.151,20 €",
          "en": "100% rebate: disability of 33% or more, first main home up to €270,151.20"
        },
        "bonusPercent": 100,
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "disabilityMin": 33,
          "maxValue": 270151.2
        },
        "extra": {
          "es": "Residir en Baleares los 3 años anteriores, primera vivienda, hipoteca de al menos el 60 % del valor de tasación y base imponible del IRPF hasta 52.800 € (84.480 € en conjunta).",
          "ca": "Residir a les Balears els 3 anys anteriors, primer habitatge, hipoteca d'almenys el 60 % del valor de taxació i base imposable de l'IRPF fins a 52.800 € (84.480 € en conjunta).",
          "en": "Resident in the Balearics for the previous 3 years, first home, mortgage of at least 60% of the appraisal value and IRPF taxable base up to €52,800 (€84,480 joint)."
        },
        "article": "art. 14 quater",
        "quote": "En las transmisiones onerosas de inmuebles que vayan a constituir la primera vivienda habitual de jóvenes menores de treinta años, o de personas con un grado de discapacidad igual o superior al 33 %, se aplicará una bonificación del 100 % de la cuota tributaria […] El adquiriente debe tener su residencia habitual en las Illes Balears durante al menos los tres años inmediatamente anteriores a la fecha de la adquisición. […] no podrá ser superior a 52.800 euros en el caso de tributación individual o a 84.480 euros en el caso de tributación conjunta. […] El adquiriente debe haber contratado con una entidad financiera un préstamo con garantía hipotecaria por un importe igual o superior al 60 % del valor de tasación de la vivienda."
      },
      {
        "id": "baleares-itp-vpl",
        "tax": "itp",
        "label": {
          "es": "Bonificación del 50 %: vivienda de precio limitado (VPL)",
          "ca": "Bonificació del 50 %: habitatge de preu limitat (HPL)",
          "en": "50% rebate: price-limited housing (VPL)"
        },
        "bonusPercent": 50,
        "conditions": {
          "protected": true
        },
        "extra": {
          "es": "Vivienda calificada de precio limitado (Ley 3/2024).",
          "ca": "Habitatge qualificat de preu limitat (Llei 3/2024).",
          "en": "Home classed as price-limited (Ley 3/2024)."
        },
        "article": "art. 14 septies",
        "quote": "En las transmisiones onerosas de inmuebles que tengan la calificación de vivienda de precio limitado (VPL) a que se refiere el artículo 2 de la Ley 3/2024, de 3 de mayo, de medidas urgentes en materia de vivienda, se aplicará una bonificación del 50 % de la cuota tributaria."
      },
      {
        "id": "baleares-ajd-first-home",
        "tax": "ajd",
        "label": {
          "es": "Primera vivienda habitual de hasta 270.151,20 €",
          "ca": "Primer habitatge habitual de fins a 270.151,20 €",
          "en": "First main home up to €270,151.20"
        },
        "rate": {
          "kind": "flat",
          "rate": 1
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "maxValue": 270151.2
        },
        "extra": {
          "es": "Valor hasta 270.151,20 €; compras al menos el 50 % y no tienes el 50 % o más de otra vivienda.",
          "ca": "Valor fins a 270.151,20 €; compres almenys el 50 % i no tens el 50 % o més d'un altre habitatge.",
          "en": "Value up to €270,151.20; you buy at least 50% and own no 50% or more of another home."
        },
        "article": "art. 17.1",
        "quote": "sobre bienes inmuebles que deban constituir la primera vivienda del adquirente, con el carácter de vivienda habitual, cuando el valor real o declarado –siempre que este último sea superior al real– del inmueble sea igual o inferior a 270.151,20 euros […] tributan al tipo de gravamen del 1 %."
      },
      {
        "id": "baleares-ajd-young",
        "tax": "ajd",
        "label": {
          "es": "Menores de 36, primera vivienda habitual de hasta 270.151,20 €",
          "ca": "Menors de 36, primer habitatge habitual de fins a 270.151,20 €",
          "en": "Under 36, first main home up to €270,151.20"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.5
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "maxAge": 35,
          "maxValue": 270151.2
        },
        "extra": {
          "es": "Valor hasta 270.151,20 €; compras al menos el 50 % y no tienes el 50 % o más de otra vivienda.",
          "ca": "Valor fins a 270.151,20 €; compres almenys el 50 % i no tens el 50 % o més d'un altre habitatge.",
          "en": "Value up to €270,151.20; you buy at least 50% and own no 50% or more of another home."
        },
        "article": "art. 17.2",
        "quote": "El tipo de gravamen aplicable será del 0,5 %, siempre que se cumplan los requisitos del apartado anterior, en los siguientes supuestos específicos: […] a) Cuando el adquiriente sea menor de treinta y seis años. […] En este caso, el tipo de gravamen será del 0,5 % para los primeros 270.151,20 euros y del 1,5 % para el exceso."
      },
      {
        "id": "baleares-ajd-large-family",
        "tax": "ajd",
        "label": {
          "es": "Familia numerosa o monoparental, primera vivienda habitual",
          "ca": "Família nombrosa o monoparental, primer habitatge habitual",
          "en": "Large or single-parent family, first main home"
        },
        "rate": {
          "kind": "scale",
          "how": "progressive",
          "brackets": [
            {
              "upTo": 270151.2,
              "rate": 0.5
            },
            {
              "upTo": null,
              "rate": 1.5
            }
          ]
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "largeFamily": true
        },
        "extra": {
          "es": "Padres que conviven con los hijos. 2 % sobre los primeros 270.151,20 € y 8 % el resto, con el tope de valor de la orden de zonas.",
          "ca": "Pares que conviuen amb els fills. 2 % sobre els primers 270.151,20 € i 8 % la resta, amb el límit de valor de l'ordre de zones.",
          "en": "Parents living with the children. 2% on the first €270,151.20 and 8% on the rest, within the value cap of the zones order."
        },
        "article": "art. 17.2",
        "quote": "El tipo de gravamen aplicable será del 0,5 %, siempre que se cumplan los requisitos del apartado anterior, en los siguientes supuestos específicos: […] a) Cuando el adquiriente sea menor de treinta y seis años. […] En este caso, el tipo de gravamen será del 0,5 % para los primeros 270.151,20 euros y del 1,5 % para el exceso."
      },
      {
        "id": "baleares-ajd-young-30",
        "tax": "ajd",
        "label": {
          "es": "Bonificación del 100 %: menores de 30, primera vivienda habitual de hasta 270.151,20 €",
          "ca": "Bonificació del 100 %: menors de 30, primer habitatge habitual de fins a 270.151,20 €",
          "en": "100% rebate: under 30, first main home up to €270,151.20"
        },
        "bonusPercent": 100,
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "maxAge": 29,
          "maxValue": 270151.2
        },
        "extra": {
          "es": "Residir en Baleares los 3 años anteriores, primera vivienda, hipoteca de al menos el 60 % del valor de tasación y base imponible del IRPF hasta 52.800 € (84.480 € en conjunta).",
          "ca": "Residir a les Balears els 3 anys anteriors, primer habitatge, hipoteca d'almenys el 60 % del valor de taxació i base imposable de l'IRPF fins a 52.800 € (84.480 € en conjunta).",
          "en": "Resident in the Balearics for the previous 3 years, first home, mortgage of at least 60% of the appraisal value and IRPF taxable base up to €52,800 (€84,480 joint)."
        },
        "article": "art. 19 quater",
        "quote": "A las primeras copias de escrituras que documenten la transmisión de bienes inmuebles que deban constituir la primera vivienda habitual de jóvenes menores de treinta años, o de personas con un grado de discapacidad igual o superior al 33 %, se aplicará una bonificación del 100 % de la cuota tributaria"
      },
      {
        "id": "baleares-ajd-disability",
        "tax": "ajd",
        "label": {
          "es": "Bonificación del 100 %: discapacidad del 33 % o más, primera vivienda habitual de hasta 270.151,20 €",
          "ca": "Bonificació del 100 %: discapacitat del 33 % o més, primer habitatge habitual de fins a 270.151,20 €",
          "en": "100% rebate: disability of 33% or more, first main home up to €270,151.20"
        },
        "bonusPercent": 100,
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "disabilityMin": 33,
          "maxValue": 270151.2
        },
        "extra": {
          "es": "Residir en Baleares los 3 años anteriores, primera vivienda, hipoteca de al menos el 60 % del valor de tasación y base imponible del IRPF hasta 52.800 € (84.480 € en conjunta).",
          "ca": "Residir a les Balears els 3 anys anteriors, primer habitatge, hipoteca d'almenys el 60 % del valor de taxació i base imposable de l'IRPF fins a 52.800 € (84.480 € en conjunta).",
          "en": "Resident in the Balearics for the previous 3 years, first home, mortgage of at least 60% of the appraisal value and IRPF taxable base up to €52,800 (€84,480 joint)."
        },
        "article": "art. 19 quater",
        "quote": "A las primeras copias de escrituras que documenten la transmisión de bienes inmuebles que deban constituir la primera vivienda habitual de jóvenes menores de treinta años, o de personas con un grado de discapacidad igual o superior al 33 %, se aplicará una bonificación del 100 % de la cuota tributaria"
      },
      {
        "id": "baleares-ajd-vpl",
        "tax": "ajd",
        "label": {
          "es": "Bonificación del 50 %: vivienda de precio tasado o limitado",
          "ca": "Bonificació del 50 %: habitatge de preu taxat o limitat",
          "en": "50% rebate: price-capped or price-limited housing"
        },
        "bonusPercent": 50,
        "conditions": {
          "protected": true
        },
        "extra": null,
        "article": "art. 19 quinquies",
        "quote": "o de vivienda de precio limitado (VPL) a que refiere el artículo 2 de la Ley 3/2024, de 3 de mayo, de medidas urgentes en materia de vivienda, se aplicará una bonificación del 50 % de la cuota tributaria."
      }
    ],
    "newHome": {
      "name": "IVA",
      "general": 10,
      "protected": 4,
      "protectedLabel": {
        "es": "VPO de régimen especial o de promoción pública vendida por el promotor",
        "ca": "HPO de règim especial o de promoció pública venuda pel promotor",
        "en": "special-regime or public-promotion VPO sold by the developer"
      },
      "article": "Ley 37/1992, art. 91",
      "quote": "",
      "law": null
    },
    "notes": [
      {
        "es": "Escala por tramos: 8 % hasta 400.000 €, 9 % hasta 600.000 €, 10 % hasta 1.000.000 €, 12 % hasta 2.000.000 € y 13 % por encima. AJD del 2 % si la vivienda vale 1.000.000 € o más (art. 17 bis). El tope de 270.151,20 € puede subir en zonas caras por orden de la Conselleria (no la hemos leído).",
        "ca": "Escala per trams: 8 % fins a 400.000 €, 9 % fins a 600.000 €, 10 % fins a 1.000.000 €, 12 % fins a 2.000.000 € i 13 % per sobre. AJD del 2 % si l'habitatge val 1.000.000 € o més (art. 17 bis). El límit de 270.151,20 € pot pujar en zones cares per ordre de la Conselleria (no l'hem llegida).",
        "en": "Slices: 8% up to €400,000, 9% up to €600,000, 10% up to €1,000,000, 12% up to €2,000,000 and 13% above. AJD is 2% if the home is worth €1,000,000 or more (art. 17 bis). The €270,151.20 cap can be raised in expensive areas by a regional order (not read)."
      }
    ]
  },
  {
    "id": "bizkaia",
    "name": {
      "es": "Bizkaia",
      "ca": "Biscaia",
      "en": "Bizkaia"
    },
    "regime": "foral",
    "status": "sourced",
    "law": {
      "title": "Norma Foral 1/2011, de 24 de marzo, del Impuesto sobre Transmisiones Patrimoniales y Actos Jurídicos Documentados (Territorio Histórico de Bizkaia)",
      "short": "NF 1/2011 (Bizkaia)",
      "url": "https://www.bizkaia.eus/documents/880307/15187815/ca_1_2011.pdf/50b78491-3852-b68f-f9d5-2db574a48917?t=1777386142905",
      "consolidatedAsOf": "2026-04-20",
      "readOn": "2026-11-13"
    },
    "amendments": [],
    "taxAgency": {
      "name": "Hacienda Foral de Bizkaia (Departamento de Hacienda y Finanzas, Diputación Foral de Bizkaia)",
      "url": "https://www.bizkaia.eus/es/normativa-tributaria/normativa-vigente/transmisiones-patrimoniales-y-ajd"
    },
    "itp": {
      "general": {
        "kind": "flat",
        "rate": 4
      },
      "article": "art. 13.b)",
      "quote": "a) El 7 por 100 si se trata de la transmisión de bienes inmuebles, así como de la constitución y […] b) No obstante lo dispuesto en la letra anterior, la transmisión de viviendas en general, […] mismo edificio, que se transmitan conjuntamente, tributará al 4 por 100. A estos efectos no"
    },
    "ajd": {
      "general": {
        "kind": "flat",
        "rate": 0.5
      },
      "article": "art. 44.1",
      "quote": "1. Las primeras copias de escrituras y actas notariales, tributarán, además, al tipo de […] gravamen del 0,50 por 100, en cuanto a tales actos o contratos, siempre que cumplan las"
    },
    "benefits": [
      {
        "id": "bizkaia-itp-small",
        "tax": "itp",
        "label": {
          "es": "Vivienda de hasta 120 m² construidos, vivienda habitual",
          "ca": "Habitatge de fins a 120 m² construïts, habitatge habitual",
          "en": "Home up to 120 m² built, main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 2.5
        },
        "conditions": {
          "habitual": true
        },
        "extra": {
          "es": "Vivienda habitual (acreditarla en 12 meses) y no tener más del 25 % de otra vivienda en el mismo municipio (salvo venderla en 2 años).",
          "ca": "Habitatge habitual (acreditar-lo en 12 mesos) i no tenir més del 25 % d'un altre habitatge al mateix municipi (llevat de vendre'l en 2 anys).",
          "en": "Main home (proved within 12 months) and owning no more than 25% of another home in the same municipality (unless sold within 2 years)."
        },
        "manual": true,
        "article": "art. 13.c).1.º",
        "quote": "1.º Tributarán al 2,5 por 100 las siguientes transmisiones: […] Viviendas cuya superficie construida no sea superior a 120 metros cuadrados, así […] Viviendas unifamiliares cuya superficie construida no sea superior a 120 metros […] cuadrados y la superficie de la parcela, incluida la ocupada por la edificación, no […] Para la aplicación del tipo del 2,5 por 100 será preciso reunir los siguientes requisitos: […] 1. Que la parte adquiriente no sea propietaria de otra vivienda en un porcentaje […] superior al 25 por ciento dentro del término municipal en que radica la vivienda […] 2. Que la vivienda se destine a vivienda habitual del adquirente en los términos a que […] adquirida no hubiera sido destinada a vivienda habitual el tipo se incrementará al 4"
      },
      {
        "id": "bizkaia-itp-large-family",
        "tax": "itp",
        "label": {
          "es": "Familia numerosa, vivienda habitual",
          "ca": "Família nombrosa, habitatge habitual",
          "en": "Large family, main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 2.5
        },
        "conditions": {
          "habitual": true,
          "largeFamily": true
        },
        "extra": {
          "es": "Vivienda habitual (acreditarla en 12 meses) y no tener más del 25 % de otra vivienda en el mismo municipio (salvo venderla en 2 años).",
          "ca": "Habitatge habitual (acreditar-lo en 12 mesos) i no tenir més del 25 % d'un altre habitatge al mateix municipi (llevat de vendre'l en 2 anys).",
          "en": "Main home (proved within 12 months) and owning no more than 25% of another home in the same municipality (unless sold within 2 years)."
        },
        "article": "art. 13.c).2.º",
        "quote": "2.º Asimismo, tributarán al 2,5 por 100 las siguientes transmisiones cuando la persona […] adquirente sea titular de familia numerosa: […] Para la aplicación del tipo del 2,5 por 100 será preciso reunir los siguientes requisitos:"
      },
      {
        "id": "bizkaia-itp-vpp",
        "tax": "itp",
        "label": {
          "es": "Vivienda de protección pública: primera transmisión en 6 años (exenta)",
          "ca": "Habitatge de protecció pública: primera transmissió en 6 anys (exempta)",
          "en": "Protected housing: first transfer within 6 years (exempt)"
        },
        "rate": {
          "kind": "flat",
          "rate": 0
        },
        "conditions": {
          "protected": true
        },
        "extra": null,
        "manual": true,
        "article": "art. 58.12.d)",
        "quote": "d) La primera transmisión ínter vivos del dominio de las viviendas de protección pública, […] siempre que tengan lugar dentro de los seis años siguientes a la fecha de su"
      },
      {
        "id": "bizkaia-ajd-first-delivery",
        "tax": "ajd",
        "label": {
          "es": "Primera transmisión de una vivienda (vivienda nueva): exenta",
          "ca": "Primera transmissió d'un habitatge (habitatge nou): exempta",
          "en": "First transfer of a home (new home): exempt"
        },
        "rate": {
          "kind": "flat",
          "rate": 0
        },
        "conditions": {},
        "extra": null,
        "article": "art. 58.35",
        "quote": "35. Las primeras copias de escrituras notariales que documenten la primera transmisión de […] viviendas, en cuanto al gravamen sobre documentos notariales a que se refiere el artículo"
      }
    ],
    "newHome": {
      "name": "IVA",
      "general": 10,
      "protected": 4,
      "protectedLabel": {
        "es": "VPO de régimen especial o de promoción pública vendida por el promotor",
        "ca": "HPO de règim especial o de promoció pública venuda pel promotor",
        "en": "special-regime or public-promotion VPO sold by the developer"
      },
      "article": "Concierto Económico, art. 26 (IVA estatal: Ley 37/1992, art. 91)",
      "quote": "El Impuesto sobre el Valor Añadido es un tributo concertado que se regirá por las mismas normas sustantivas y formales establecidas en cada momento por el Estado.",
      "law": {
        "title": "Ley 12/2002, de 23 de mayo, por la que se aprueba el Concierto Económico con la Comunidad Autónoma del País Vasco",
        "short": "Concierto Económico (Ley 12/2002)",
        "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-9969",
        "consolidatedAsOf": "2025-04-30",
        "readOn": "2026-11-13"
      }
    },
    "notes": [
      {
        "es": "Vivienda usada: 4 %, o 6 % si el comprador tiene más de 5 viviendas (el 7 % es para inmuebles que no son vivienda). La vivienda nueva paga IVA y su primera transmisión está exenta de AJD.",
        "ca": "Habitatge usat: 4 %, o 6 % si el comprador té més de 5 habitatges (el 7 % és per a immobles que no són habitatge). L'habitatge nou paga IVA i la primera transmissió està exempta d'AJD.",
        "en": "Resale home: 4%, or 6% if the buyer owns more than 5 homes (7% is for non-residential property). A new home pays IVA and its first transfer is exempt from AJD."
      }
    ]
  },
  {
    "id": "canarias",
    "name": {
      "es": "Canarias",
      "ca": "Canàries",
      "en": "Canary Islands"
    },
    "regime": "canarias",
    "status": "sourced",
    "law": {
      "title": "Decreto Legislativo 1/2009, de 21 de abril, por el que se aprueba el Texto Refundido de las disposiciones legales vigentes dictadas por la Comunidad Autónoma de Canarias en materia de tributos cedidos",
      "short": "Decreto Legislativo 1/2009",
      "url": "https://www.boe.es/buscar/act.php?id=BOC-j-2009-90008",
      "consolidatedAsOf": "2025-12-29",
      "readOn": "2026-11-13"
    },
    "amendments": [
      {
        "title": "Ley 9/2025, de 23 de diciembre, de Presupuestos Generales de la Comunidad Autónoma de Canarias para 2026, disposición final 11.ª",
        "url": "https://www.boe.es/buscar/doc.php?id=BOE-A-2026-7560"
      },
      {
        "title": "Decreto-ley 5/2026, de 27 de julio, de medidas fiscales ... (BOC núm. 163, 14/08/2026)",
        "url": "https://www.boe.es/ccaa/boc/2026/163/j31708-31727.pdf"
      }
    ],
    "taxAgency": {
      "name": "Agencia Tributaria Canaria",
      "url": "https://www3.gobiernodecanarias.org/tributos/atc/"
    },
    "itp": {
      "general": {
        "kind": "flat",
        "rate": 6.5
      },
      "article": "art. 31.1.a)",
      "quote": "a) Si se trata de la transmisión de bienes inmuebles, así como la constitución y cesión de derechos reales que recaigan sobre los mismos, excepto los derechos reales de garantía, con carácter general el tipo del 6,5%."
    },
    "ajd": {
      "general": {
        "kind": "flat",
        "rate": 1
      },
      "article": "art. 36",
      "quote": "se fija en el 0,75 por 100. Sin perjuicio de ello, cuando se trate de documentos relativos a operaciones sujetas al Impuesto General Indirecto Canario o al Impuesto sobre el Valor Añadido, el tipo se fija en el 1 por 100."
    },
    "benefits": [
      {
        "id": "canarias-itp-habitual",
        "tax": "itp",
        "label": {
          "es": "Vivienda habitual de hasta 200.000 € sin otra vivienda",
          "ca": "Habitatge habitual de fins a 200.000 € sense cap altre habitatge",
          "en": "Main home up to €200,000, owning no other home"
        },
        "rate": {
          "kind": "flat",
          "rate": 5
        },
        "conditions": {
          "habitual": true,
          "maxValue": 200000
        },
        "extra": {
          "es": "No tener otra vivienda (o venderla en escritura pública en 2 años). Certificación de los requisitos.",
          "ca": "No tenir cap altre habitatge (o vendre'l en escriptura pública en 2 anys). Certificació dels requisits.",
          "en": "Own no other home (or sell it by public deed within 2 years). Certificate of the requirements."
        },
        "article": "art. 31.1.a), párrafos 2.º y siguientes",
        "quote": "No obstante, el tipo será del 5% siempre y cuando se cumplan los siguientes requisitos: […] – Que el bien inmueble vaya a constituir la vivienda habitual del contribuyente. En el supuesto de existencia de varios contribuyentes, todos deben ser personas físicas y que el bien inmueble vaya a constituir su vivienda habitual. […] – Que la base imponible de la transmisión de la vivienda, incluidos los garajes y anexos situados en el mismo edificio que se transmitan conjuntamente, sea inferior o igual a 200.000 euros. […] – En el momento del devengo de la entrega de la nueva vivienda, el contribuyente no podrá ser propietario ni nudo propietario ni usufructuario de otra vivienda. En caso de que lo fuera, deberá proceder a la transmisión en escritura pública de dichos bienes o dichos derechos en un plazo de dos años desde el citado devengo."
      },
      {
        "id": "canarias-itp-young",
        "tax": "itp",
        "label": {
          "es": "40 años o menos, primera vivienda habitual de hasta 200.000 €: 20 % menos sobre el 5 %",
          "ca": "40 anys o menys, primer habitatge habitual de fins a 200.000 €: 20 % menys sobre el 5 %",
          "en": "Aged 40 or under, first main home up to €200,000: 20% off the 5% rate"
        },
        "rate": {
          "kind": "flat",
          "rate": 5
        },
        "bonusPercent": 20,
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "maxAge": 40,
          "maxValue": 200000
        },
        "extra": {
          "es": "Primera vivienda habitual y nunca haber sido titular de otro inmueble; rentas del año anterior hasta 46.455 € (+6.825 € por persona con mínimo familiar). Es un 20 % menos sobre el 5 %: queda en el 4 %.",
          "ca": "Primer habitatge habitual i no haver estat mai titular d'un altre immoble; rendes de l'any anterior fins a 46.455 € (+6.825 € per persona amb mínim familiar). És un 20 % menys sobre el 5 %: queda en el 4 %.",
          "en": "First main home and never having owned other property; previous year's income up to €46,455 (+€6,825 per dependant). It is 20% off the 5% rate: 4%."
        },
        "article": "art. 35.1.a) y 35.2",
        "quote": "1. Se aplicará una bonificación del 20 […] a la cuota resultante de aplicar el tipo impositivo del 5 […] siempre que se trate de la primera vivienda habitual y que el contribuyente no haya sido titular propietario, nudo propietario o usufructuario de otro bien inmueble […] a) Que el contribuyente tenga 40 años o menos en la fecha del devengo del impuesto correspondiente a la transmisión de la vivienda […] de los adquirentes sea, en el período impositivo del año natural anterior al devengo de la entrega, como máximo de 46.455 euros, incrementado en 6.825 euros por cada persona por la que el contribuyente tenga derecho a aplicar el mínimo familiar, excluido el contribuyente."
      },
      {
        "id": "canarias-itp-gender-violence",
        "tax": "itp",
        "label": {
          "es": "Mujeres víctimas de violencia de género, primera vivienda habitual: 20 % menos sobre el 5 %",
          "ca": "Dones víctimes de violència de gènere, primer habitatge habitual: 20 % menys sobre el 5 %",
          "en": "Women victims of gender violence, first main home: 20% off the 5% rate"
        },
        "rate": {
          "kind": "flat",
          "rate": 5
        },
        "bonusPercent": 20,
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "maxValue": 200000
        },
        "extra": null,
        "manual": true,
        "article": "art. 35.1.b)",
        "quote": "1. Se aplicará una bonificación del 20 % a la cuota resultante de aplicar el tipo impositivo del 5 % a que se refieren las letras a) y f), del apartado 1, del artículo 31 del presente texto refundido, siempre que se trate de la primera vivienda habitual y que el contribuyente no haya sido titular propietario, nudo propietario o usufructuario de otro bien inmueble y que, […] b) Que el contribuyente sea una mujer víctima de violencia de género, considerando tales aquellas que cuenten con orden de protección en vigor o sentencia judicial firme."
      },
      {
        "id": "canarias-itp-large-family",
        "tax": "itp",
        "label": {
          "es": "Familia numerosa, vivienda habitual",
          "ca": "Família nombrosa, habitatge habitual",
          "en": "Large family, main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 1
        },
        "conditions": {
          "habitual": true,
          "largeFamily": true
        },
        "extra": {
          "es": "Bases imponibles de la familia hasta 46.455 € (+18.200 € por hijo por encima del mínimo). No tener otra vivienda (o venderla en escritura pública en 2 años). Certificación de los requisitos.",
          "ca": "Bases imposables de la família fins a 46.455 € (+18.200 € per fill per sobre del mínim). No tenir cap altre habitatge (o vendre'l en escriptura pública en 2 anys). Certificació dels requisits.",
          "en": "Family taxable bases up to €46,455 (+€18,200 per child above the minimum). Own no other home (or sell it by public deed within 2 years). Certificate of the requirements."
        },
        "article": "art. 32",
        "quote": "El tipo de gravamen aplicable a la transmisión de un inmueble que vaya a constituir la vivienda habitual de una familia numerosa es del 1%, siempre y cuando se cumplan simultáneamente todos y cada uno de los requisitos siguientes: […] b) Que la suma de las bases imponibles en el impuesto sobre la renta de las personas físicas correspondientes a los miembros de la familia numerosa no exceda de 46.455 euros, cantidad que deberá incrementarse en 18.200 euros por cada hijo que exceda del número que la legislación vigente establezca como mínimo para que una familia tenga la consideración legal de numerosa."
      },
      {
        "id": "canarias-itp-disability",
        "tax": "itp",
        "label": {
          "es": "Discapacidad del 65 % o más (tuya o de un familiar a cargo), vivienda habitual",
          "ca": "Discapacitat del 65 % o més (teva o d'un familiar a càrrec), habitatge habitual",
          "en": "Disability of 65% or more (yours or a dependant's), main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 1
        },
        "conditions": {
          "habitual": true,
          "disabilityMin": 65
        },
        "extra": {
          "es": "Bases imponibles de los compradores hasta 46.455 € (+6.825 € por persona con mínimo familiar). No tener otra vivienda (o venderla en escritura pública en 2 años). Certificación de los requisitos.",
          "ca": "Bases imposables dels compradors fins a 46.455 € (+6.825 € per persona amb mínim familiar). No tenir cap altre habitatge (o vendre'l en escriptura pública en 2 anys). Certificació dels requisits.",
          "en": "Buyers' taxable bases up to €46,455 (+€6,825 per dependant). Own no other home (or sell it by public deed within 2 years). Certificate of the requirements."
        },
        "article": "art. 33",
        "quote": "El tipo de gravamen aplicable en la transmisión de un inmueble que vaya a constituir la vivienda habitual del contribuyente que tenga la consideración legal de persona con discapacidad física, psíquica o sensorial es del 1%. Se aplicará el mismo tipo impositivo cuando la condición de una de estas minusvalías concurra en alguna de las personas por las que el contribuyente tenga […] Que el contribuyente o la persona por la que el contribuyente tenga derecho a aplicar el mínimo familiar tenga la consideración legal de persona con discapacidad y cuyo grado de minusvalía sea igual o superior al 65%, de acuerdo con su normativa específica. […] b) Que la suma de las bases imponibles en el impuesto sobre la renta de las personas físicas correspondientes a los adquirentes no exceda de 46.455 euros, cantidad que deberá incrementarse en 6.825 euros por cada persona por la que el contribuyente tenga derecho a aplicar el mínimo familiar, excluido el contribuyente."
      },
      {
        "id": "canarias-itp-single-parent",
        "tax": "itp",
        "label": {
          "es": "Familia monoparental, vivienda habitual",
          "ca": "Família monoparental, habitatge habitual",
          "en": "Single-parent family, main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 1
        },
        "conditions": {
          "habitual": true
        },
        "extra": {
          "es": "Bases imponibles de los compradores hasta 46.455 € (+6.825 € por persona con mínimo familiar). No tener otra vivienda (o venderla en escritura pública en 2 años). Certificación de los requisitos.",
          "ca": "Bases imposables dels compradors fins a 46.455 € (+6.825 € per persona amb mínim familiar). No tenir cap altre habitatge (o vendre'l en escriptura pública en 2 anys). Certificació dels requisits.",
          "en": "Buyers' taxable bases up to €46,455 (+€6,825 per dependant). Own no other home (or sell it by public deed within 2 years). Certificate of the requirements."
        },
        "manual": true,
        "article": "art. 33-bis",
        "quote": "El tipo de gravamen aplicable a la transmisión de un inmueble que vaya a constituir la vivienda habitual de una familia monoparental es del 1%, siempre y cuando se cumplan simultáneamente todos y cada uno de los requisitos siguientes:"
      },
      {
        "id": "canarias-itp-protected",
        "tax": "itp",
        "label": {
          "es": "Vivienda protegida, primera vivienda habitual: tipo 0 %",
          "ca": "Habitatge protegit, primer habitatge habitual: tipus 0 %",
          "en": "Protected housing, first main home: 0% rate"
        },
        "rate": {
          "kind": "flat",
          "rate": 0
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "protected": true
        },
        "extra": null,
        "article": "art. 34",
        "quote": "El tipo de gravamen aplicable en la transmisión de una vivienda protegida, ya sea de promoción pública o privada, que vaya a constituir la primera vivienda habitual del contribuyente será del 0%."
      },
      {
        "id": "canarias-ajd-large-family",
        "tax": "ajd",
        "label": {
          "es": "Familia numerosa, vivienda habitual (requisitos del ITP)",
          "ca": "Família nombrosa, habitatge habitual (requisits de l'ITP)",
          "en": "Large family, main home (ITP requirements)"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.4
        },
        "conditions": {
          "habitual": true,
          "largeFamily": true
        },
        "extra": {
          "es": "Bases imponibles de la familia hasta 46.455 € (+18.200 € por hijo por encima del mínimo). No tener otra vivienda (o venderla en escritura pública en 2 años). Certificación de los requisitos.",
          "ca": "Bases imposables de la família fins a 46.455 € (+18.200 € per fill per sobre del mínim). No tenir cap altre habitatge (o vendre'l en escriptura pública en 2 anys). Certificació dels requisits.",
          "en": "Family taxable bases up to €46,455 (+€18,200 per child above the minimum). Own no other home (or sell it by public deed within 2 years). Certificate of the requirements."
        },
        "article": "art. 37.1 y art. 38",
        "quote": "se aplicará el tipo de gravamen reducido del 0,40 por 100 cuando se trate de primeras copias de escrituras que documenten la adquisición de un inmueble, siempre que se trate de inmuebles que vayan a constituir la vivienda habitual […] en los que concurran los requisitos para la aplicación del tipo reducido y las bonificaciones a que refieren los artículos 32, 33, 33-bis, 34, 35 y 35-bis del presente texto refundido."
      },
      {
        "id": "canarias-ajd-disability",
        "tax": "ajd",
        "label": {
          "es": "Discapacidad del 65 % o más, vivienda habitual (requisitos del ITP)",
          "ca": "Discapacitat del 65 % o més, habitatge habitual (requisits de l'ITP)",
          "en": "Disability of 65% or more, main home (ITP requirements)"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.4
        },
        "conditions": {
          "habitual": true,
          "disabilityMin": 65
        },
        "extra": {
          "es": "Bases imponibles de los compradores hasta 46.455 € (+6.825 € por persona con mínimo familiar). No tener otra vivienda (o venderla en escritura pública en 2 años). Certificación de los requisitos.",
          "ca": "Bases imposables dels compradors fins a 46.455 € (+6.825 € per persona amb mínim familiar). No tenir cap altre habitatge (o vendre'l en escriptura pública en 2 anys). Certificació dels requisits.",
          "en": "Buyers' taxable bases up to €46,455 (+€6,825 per dependant). Own no other home (or sell it by public deed within 2 years). Certificate of the requirements."
        },
        "article": "art. 37.1 y art. 38",
        "quote": "se aplicará el tipo de gravamen reducido del 0,40 por 100 cuando se trate de primeras copias de escrituras que documenten la adquisición de un inmueble, siempre que se trate de inmuebles que vayan a constituir la vivienda habitual […] en los que concurran los requisitos para la aplicación del tipo reducido y las bonificaciones a que refieren los artículos 32, 33, 33-bis, 34, 35 y 35-bis del presente texto refundido."
      },
      {
        "id": "canarias-ajd-young",
        "tax": "ajd",
        "label": {
          "es": "40 años o menos, primera vivienda habitual de hasta 200.000 € (requisitos del ITP)",
          "ca": "40 anys o menys, primer habitatge habitual de fins a 200.000 € (requisits de l'ITP)",
          "en": "Aged 40 or under, first main home up to €200,000 (ITP requirements)"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.4
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "maxAge": 40,
          "maxValue": 200000
        },
        "extra": {
          "es": "Primera vivienda habitual y nunca haber sido titular de otro inmueble; rentas del año anterior hasta 46.455 € (+6.825 € por persona con mínimo familiar). Es un 20 % menos sobre el 5 %: queda en el 4 %.",
          "ca": "Primer habitatge habitual i no haver estat mai titular d'un altre immoble; rendes de l'any anterior fins a 46.455 € (+6.825 € per persona amb mínim familiar). És un 20 % menys sobre el 5 %: queda en el 4 %.",
          "en": "First main home and never having owned other property; previous year's income up to €46,455 (+€6,825 per dependant). It is 20% off the 5% rate: 4%."
        },
        "article": "art. 37.1 y art. 38",
        "quote": "se aplicará el tipo de gravamen reducido del 0,40 por 100 cuando se trate de primeras copias de escrituras que documenten la adquisición de un inmueble, siempre que se trate de inmuebles que vayan a constituir la vivienda habitual […] en los que concurran los requisitos para la aplicación del tipo reducido y las bonificaciones a que refieren los artículos 32, 33, 33-bis, 34, 35 y 35-bis del presente texto refundido."
      },
      {
        "id": "canarias-ajd-protected",
        "tax": "ajd",
        "label": {
          "es": "Vivienda protegida, primera vivienda habitual",
          "ca": "Habitatge protegit, primer habitatge habitual",
          "en": "Protected housing, first main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.4
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "protected": true
        },
        "extra": null,
        "article": "art. 37.1 y art. 38",
        "quote": "se aplicará el tipo de gravamen reducido del 0,40 por 100 cuando se trate de primeras copias de escrituras que documenten la adquisición de un inmueble, siempre que se trate de inmuebles que vayan a constituir la vivienda habitual […] en los que concurran los requisitos para la aplicación del tipo reducido y las bonificaciones a que refieren los artículos 32, 33, 33-bis, 34, 35 y 35-bis del presente texto refundido."
      },
      {
        "id": "canarias-vat-vpo",
        "tax": "vat",
        "label": {
          "es": "IGIC 0 %: VPO de régimen especial, general o promoción pública entregada por el promotor",
          "ca": "IGIC 0 %: HPO de règim especial, general o promoció pública lliurada pel promotor",
          "en": "IGIC 0%: special, general-regime or public-promotion VPO sold by the developer"
        },
        "rate": {
          "kind": "flat",
          "rate": 0
        },
        "conditions": {
          "protected": true
        },
        "extra": null,
        "article": "art. 38.Uno.1",
        "quote": "1. Las entregas de viviendas calificadas administrativamente como de protección oficial de régimen especial, de protección oficial de régimen general o de promoción pública, cuando se efectúen por sus promotores, incluidos los garajes y anexos situados en el mismo edificio que se transmitan conjuntamente. A estos efectos, el número de plazas de garaje no podrá exceder de una."
      },
      {
        "id": "canarias-vat-young",
        "tax": "vat",
        "label": {
          "es": "IGIC 3 %: 40 años o menos, vivienda habitual de hasta 200.000 €",
          "ca": "IGIC 3 %: 40 anys o menys, habitatge habitual de fins a 200.000 €",
          "en": "IGIC 3%: aged 40 or under, main home up to €200,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 3
        },
        "conditions": {
          "habitual": true,
          "maxAge": 40,
          "maxValue": 200000
        },
        "extra": {
          "es": "Base imponible hasta 200.000 € (300.000 € familia numerosa general, 400.000 € especial); no tener otra vivienda; declaración del comprador al promotor incorporada a la escritura.",
          "ca": "Base imposable fins a 200.000 € (300.000 € família nombrosa general, 400.000 € especial); no tenir cap altre habitatge; declaració del comprador al promotor incorporada a l'escriptura.",
          "en": "Taxable base up to €200,000 (€300,000 general large family, €400,000 special); own no other home; the buyer's statement to the developer included in the deed."
        },
        "article": "art. 38.Dos",
        "quote": "Dos. Tributarán al tipo superreducido del 3 por ciento las entregas de viviendas distintas de las previstas en el apartado Uno.1 del presente artículo […] a) Que el adquirente tenga 40 años o menos en la fecha del devengo del impuesto correspondiente a la entrega de la vivienda. […] f) Que la renta de la unidad familiar en la que se integra el adquirente sea, en el período impositivo del año natural anterior al devengo de la entrega, como máximo de 46.455 euros, incrementado en 15.315 euros si la tributación es conjunta. […] 3. La base imponible de la entrega de la vivienda, incluidos los garajes y anexos situados en el mismo edificio que se transmitan conjuntamente, debe ser inferior o igual a 200.000 euros. […] Tratándose de la entrega de una vivienda a miembros de una familia numerosa de categoría general, la base imponible debe ser inferior o igual a 300.000 euros, o inferior o igual a 400.000 euros tratándose de una familia numerosa de categoría especial."
      },
      {
        "id": "canarias-vat-large-family",
        "tax": "vat",
        "label": {
          "es": "IGIC 3 %: familia numerosa, vivienda habitual de hasta 300.000 €",
          "ca": "IGIC 3 %: família nombrosa, habitatge habitual de fins a 300.000 €",
          "en": "IGIC 3%: large family, main home up to €300,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 3
        },
        "conditions": {
          "habitual": true,
          "largeFamily": true,
          "maxValue": 300000
        },
        "extra": {
          "es": "Base imponible hasta 200.000 € (300.000 € familia numerosa general, 400.000 € especial); no tener otra vivienda; declaración del comprador al promotor incorporada a la escritura.",
          "ca": "Base imposable fins a 200.000 € (300.000 € família nombrosa general, 400.000 € especial); no tenir cap altre habitatge; declaració del comprador al promotor incorporada a l'escriptura.",
          "en": "Taxable base up to €200,000 (€300,000 general large family, €400,000 special); own no other home; the buyer's statement to the developer included in the deed."
        },
        "article": "art. 38.Dos",
        "quote": "Dos. Tributarán al tipo superreducido del 3 por ciento las entregas de viviendas distintas de las previstas en el apartado Uno.1 del presente artículo […] a) Que el adquirente tenga 40 años o menos en la fecha del devengo del impuesto correspondiente a la entrega de la vivienda. […] f) Que la renta de la unidad familiar en la que se integra el adquirente sea, en el período impositivo del año natural anterior al devengo de la entrega, como máximo de 46.455 euros, incrementado en 15.315 euros si la tributación es conjunta. […] 3. La base imponible de la entrega de la vivienda, incluidos los garajes y anexos situados en el mismo edificio que se transmitan conjuntamente, debe ser inferior o igual a 200.000 euros. […] Tratándose de la entrega de una vivienda a miembros de una familia numerosa de categoría general, la base imponible debe ser inferior o igual a 300.000 euros, o inferior o igual a 400.000 euros tratándose de una familia numerosa de categoría especial."
      },
      {
        "id": "canarias-vat-disability",
        "tax": "vat",
        "label": {
          "es": "IGIC 3 %: discapacidad del 65 % o más, vivienda habitual de hasta 200.000 €",
          "ca": "IGIC 3 %: discapacitat del 65 % o més, habitatge habitual de fins a 200.000 €",
          "en": "IGIC 3%: disability of 65% or more, main home up to €200,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 3
        },
        "conditions": {
          "habitual": true,
          "disabilityMin": 65,
          "maxValue": 200000
        },
        "extra": {
          "es": "Base imponible hasta 200.000 € (300.000 € familia numerosa general, 400.000 € especial); no tener otra vivienda; declaración del comprador al promotor incorporada a la escritura.",
          "ca": "Base imposable fins a 200.000 € (300.000 € família nombrosa general, 400.000 € especial); no tenir cap altre habitatge; declaració del comprador al promotor incorporada a l'escriptura.",
          "en": "Taxable base up to €200,000 (€300,000 general large family, €400,000 special); own no other home; the buyer's statement to the developer included in the deed."
        },
        "article": "art. 38.Dos",
        "quote": "Dos. Tributarán al tipo superreducido del 3 por ciento las entregas de viviendas distintas de las previstas en el apartado Uno.1 del presente artículo […] a) Que el adquirente tenga 40 años o menos en la fecha del devengo del impuesto correspondiente a la entrega de la vivienda. […] f) Que la renta de la unidad familiar en la que se integra el adquirente sea, en el período impositivo del año natural anterior al devengo de la entrega, como máximo de 46.455 euros, incrementado en 15.315 euros si la tributación es conjunta. […] 3. La base imponible de la entrega de la vivienda, incluidos los garajes y anexos situados en el mismo edificio que se transmitan conjuntamente, debe ser inferior o igual a 200.000 euros. […] Tratándose de la entrega de una vivienda a miembros de una familia numerosa de categoría general, la base imponible debe ser inferior o igual a 300.000 euros, o inferior o igual a 400.000 euros tratándose de una familia numerosa de categoría especial."
      },
      {
        "id": "canarias-vat-other",
        "tax": "vat",
        "label": {
          "es": "IGIC 3 %: víctimas de violencia de género, familias monoparentales o renta familiar hasta 46.455 € (vivienda habitual de hasta 200.000 €)",
          "ca": "IGIC 3 %: víctimes de violència de gènere, famílies monoparentals o renda familiar fins a 46.455 € (habitatge habitual de fins a 200.000 €)",
          "en": "IGIC 3%: gender-violence victims, single-parent families or family income up to €46,455 (main home up to €200,000)"
        },
        "rate": {
          "kind": "flat",
          "rate": 3
        },
        "conditions": {
          "habitual": true,
          "maxValue": 200000
        },
        "extra": {
          "es": "Base imponible hasta 200.000 € (300.000 € familia numerosa general, 400.000 € especial); no tener otra vivienda; declaración del comprador al promotor incorporada a la escritura.",
          "ca": "Base imposable fins a 200.000 € (300.000 € família nombrosa general, 400.000 € especial); no tenir cap altre habitatge; declaració del comprador al promotor incorporada a l'escriptura.",
          "en": "Taxable base up to €200,000 (€300,000 general large family, €400,000 special); own no other home; the buyer's statement to the developer included in the deed."
        },
        "manual": true,
        "article": "art. 38.Dos",
        "quote": "Dos. Tributarán al tipo superreducido del 3 por ciento las entregas de viviendas distintas de las previstas en el apartado Uno.1 del presente artículo […] a) Que el adquirente tenga 40 años o menos en la fecha del devengo del impuesto correspondiente a la entrega de la vivienda. […] f) Que la renta de la unidad familiar en la que se integra el adquirente sea, en el período impositivo del año natural anterior al devengo de la entrega, como máximo de 46.455 euros, incrementado en 15.315 euros si la tributación es conjunta. […] 3. La base imponible de la entrega de la vivienda, incluidos los garajes y anexos situados en el mismo edificio que se transmitan conjuntamente, debe ser inferior o igual a 200.000 euros. […] Tratándose de la entrega de una vivienda a miembros de una familia numerosa de categoría general, la base imponible debe ser inferior o igual a 300.000 euros, o inferior o igual a 400.000 euros tratándose de una familia numerosa de categoría especial."
      },
      {
        "id": "canarias-vat-habitual",
        "tax": "vat",
        "label": {
          "es": "IGIC 5 %: vivienda habitual de hasta 200.000 € sin otra vivienda",
          "ca": "IGIC 5 %: habitatge habitual de fins a 200.000 € sense cap altre habitatge",
          "en": "IGIC 5%: main home up to €200,000, owning no other home"
        },
        "rate": {
          "kind": "flat",
          "rate": 5
        },
        "conditions": {
          "habitual": true,
          "maxValue": 200000
        },
        "extra": {
          "es": "Sin otra vivienda en propiedad, nuda propiedad o usufructo (o venderla en 2 años); 300.000 € para familia numerosa general, 400.000 € especial.",
          "ca": "Sense cap altre habitatge en propietat, nua propietat o usdefruit (o vendre'l en 2 anys); 300.000 € per a família nombrosa general, 400.000 € especial.",
          "en": "No other home owned outright, as bare owner or in usufruct (or sell it within 2 years); €300,000 for a general large family, €400,000 special."
        },
        "article": "art. 38.Cuatro",
        "quote": "Cuatro. 1. Tributarán al tipo reducido del 5 por ciento las entregas de viviendas distintas de las previstas en los apartados Uno.1 y Dos del presente artículo, siempre y cuando se cumplan los requisitos siguientes: […] a) Que vaya a constituir la vivienda habitual del adquirente."
      }
    ],
    "newHome": {
      "name": "IGIC",
      "general": 7,
      "protected": null,
      "protectedLabel": null,
      "article": "art. 32.1 y art. 38.Cinco",
      "quote": "1. El tipo general en el impuesto general indirecto canario es el 7 […] Cinco. Las operaciones relacionadas con las viviendas no comprendidas en los apartados anteriores tributarán en el Impuesto General Indirecto Canario al tipo impositivo general.",
      "law": {
        "title": "Decreto Legislativo 1/2025, de 13 de octubre, por el que se aprueba el texto refundido de las normas legales aprobadas por la Comunidad Autónoma de Canarias en relación con el Impuesto General Indirecto Canario y el Arbitrio sobre Importaciones y Entregas de Mercancías en las Islas Canarias",
        "short": "Decreto Legislativo 1/2025 (IGIC)",
        "url": "https://www.boe.es/buscar/act.php?id=BOC-j-2025-90249",
        "consolidatedAsOf": "2026-04-07",
        "readOn": "2026-11-13"
      }
    },
    "notes": [
      {
        "es": "Vivienda nueva: IGIC (7 % general; 5 %, 3 % o 0 % según el art. 38 del texto refundido del IGIC) más un AJD del 1 % (0,4 % con los requisitos de los arts. 32 a 35 bis).",
        "ca": "Habitatge nou: IGIC (7 % general; 5 %, 3 % o 0 % segons l'art. 38 del text refós de l'IGIC) més un AJD de l'1 % (0,4 % amb els requisits dels arts. 32 a 35 bis).",
        "en": "New home: IGIC (7% general; 5%, 3% or 0% under art. 38 of the IGIC consolidated act) plus 1% AJD (0.4% meeting the requirements of arts. 32 to 35 bis)."
      }
    ]
  },
  {
    "id": "cantabria",
    "name": {
      "es": "Cantabria",
      "ca": "Cantàbria",
      "en": "Cantabria"
    },
    "regime": "common",
    "status": "sourced",
    "law": {
      "title": "Decreto Legislativo 62/2008, de 19 de junio, por el que se aprueba el texto refundido de la Ley de Medidas Fiscales en materia de Tributos cedidos por el Estado.",
      "short": "Decreto Legislativo 62/2008",
      "url": "https://www.boe.es/buscar/act.php?id=BOCT-c-2008-90028",
      "consolidatedAsOf": "2026-04-30",
      "readOn": "2026-11-13"
    },
    "amendments": [
      {
        "title": "Ley de Cantabria 5/2026, de 28 de abril, de Medidas Fiscales y Administrativas",
        "url": "https://www.boe.es/buscar/doc.php?id=BOE-A-2026-10431"
      }
    ],
    "taxAgency": {
      "name": "Agencia Cántabra de Administración Tributaria (ACAT)",
      "url": "https://www.agenciacantabratributaria.es"
    },
    "itp": {
      "general": {
        "kind": "flat",
        "rate": 9
      },
      "article": "art. 9.1.A)",
      "quote": "Con carácter general, en la transmisión de bienes inmuebles, así como en la constitución y en la cesión de derechos reales que recaigan sobre los mismos, excepto en los derechos reales de garantía, se aplicará el tipo del 9 por ciento."
    },
    "ajd": {
      "general": {
        "kind": "flat",
        "rate": 1.5
      },
      "article": "art. 13.3",
      "quote": "tributarán, además, al tipo de gravamen del 1,5 por ciento, en cuanto a tales actos o contratos."
    },
    "benefits": [
      {
        "id": "cantabria-itp-habitual",
        "tax": "itp",
        "label": {
          "es": "Vivienda habitual",
          "ca": "Habitatge habitual",
          "en": "Main home"
        },
        "rate": {
          "kind": "scale",
          "how": "progressive",
          "brackets": [
            {
              "upTo": 300000,
              "rate": 7
            },
            {
              "upTo": null,
              "rate": 9
            }
          ]
        },
        "conditions": {
          "habitual": true
        },
        "extra": {
          "es": "Hay que pedirlo expresamente en la escritura.",
          "ca": "Cal demanar-ho expressament a l'escriptura.",
          "en": "It must be requested in the deed."
        },
        "article": "art. 9.2",
        "quote": "En aquellas transmisiones de viviendas y promesas u opciones de compra sobre las mismas que vayan a constituir la vivienda habitual del sujeto pasivo se aplicarán los tipos impositivos siguientes: […] Valor total de la vivienda […] Hasta 300.000. […] Para el tramo que exceda de 300.000."
      },
      {
        "id": "cantabria-itp-large-family",
        "tax": "itp",
        "label": {
          "es": "Familia numerosa o monoparental, vivienda habitual",
          "ca": "Família nombrosa o monoparental, habitatge habitual",
          "en": "Large or single-parent family, main home"
        },
        "rate": {
          "kind": "scale",
          "how": "progressive",
          "brackets": [
            {
              "upTo": 300000,
              "rate": 4
            },
            {
              "upTo": null,
              "rate": 9
            }
          ]
        },
        "conditions": {
          "habitual": true,
          "largeFamily": true
        },
        "extra": {
          "es": "Solo sobre los primeros 300.000 € del valor; el exceso, al tipo general. Hay que pedirlo expresamente en la escritura.",
          "ca": "Només sobre els primers 300.000 € del valor; l'excés, al tipus general. Cal demanar-ho expressament a l'escriptura.",
          "en": "Only on the first €300,000 of the value; the rest at the general rate. It must be requested in the deed."
        },
        "article": "art. 9.3.a) y 9.7",
        "quote": "Se aplicará el tipo reducido del 4 por ciento en aquellas transmisiones de viviendas y promesas u opciones de compra sobre las mismas que vayan a constituir la vivienda habitual del sujeto pasivo, siempre que este reúna alguno de los siguientes requisitos o circunstancias: […] Tener la consideración de titular de familia numerosa o cónyuge del mismo o de familia monoparental en virtud del Decreto 26/2019, de 14 de marzo"
      },
      {
        "id": "cantabria-itp-disability",
        "tax": "itp",
        "label": {
          "es": "Discapacidad del 33 % al 65 %, vivienda habitual",
          "ca": "Discapacitat del 33 % al 65 %, habitatge habitual",
          "en": "Disability of 33% to 65%, main home"
        },
        "rate": {
          "kind": "scale",
          "how": "progressive",
          "brackets": [
            {
              "upTo": 300000,
              "rate": 4
            },
            {
              "upTo": null,
              "rate": 9
            }
          ]
        },
        "conditions": {
          "habitual": true,
          "disabilityMin": 33
        },
        "extra": {
          "es": "Solo sobre los primeros 300.000 € del valor; el exceso, al tipo general. Hay que pedirlo expresamente en la escritura.",
          "ca": "Només sobre els primers 300.000 € del valor; l'excés, al tipus general. Cal demanar-ho expressament a l'escriptura.",
          "en": "Only on the first €300,000 of the value; the rest at the general rate. It must be requested in the deed."
        },
        "article": "art. 9.3.b) y 9.7",
        "quote": "Se aplicará el tipo reducido del 4 por ciento en aquellas transmisiones de viviendas y promesas u opciones de compra sobre las mismas que vayan a constituir la vivienda habitual del sujeto pasivo, siempre que este reúna alguno de los siguientes requisitos o circunstancias: […] Persona con discapacidad física, psíquica o sensorial que tenga la consideración legal de persona con discapacidad con un grado de disminución igual o superior al 33 por ciento e inferior al 65 por ciento. […] siendo suficiente con que adquiera el 50 % para la aplicación del tipo reducido a todos los sujetos pasivos si el usufructo representase más de ese porcentaje."
      },
      {
        "id": "cantabria-itp-young",
        "tax": "itp",
        "label": {
          "es": "Menores de 40 años, vivienda habitual",
          "ca": "Menors de 40 anys, habitatge habitual",
          "en": "Under 40, main home"
        },
        "rate": {
          "kind": "scale",
          "how": "progressive",
          "brackets": [
            {
              "upTo": 300000,
              "rate": 4
            },
            {
              "upTo": null,
              "rate": 9
            }
          ]
        },
        "conditions": {
          "habitual": true,
          "maxAge": 39
        },
        "extra": {
          "es": "Con varios compradores, solo la parte de los menores de 40. Solo sobre los primeros 300.000 € del valor; el exceso, al tipo general. Hay que pedirlo expresamente en la escritura.",
          "ca": "Amb diversos compradors, només la part dels menors de 40. Només sobre els primers 300.000 € del valor; l'excés, al tipus general. Cal demanar-ho expressament a l'escriptura.",
          "en": "With several buyers, only the share of those under 40. Only on the first €300,000 of the value; the rest at the general rate. It must be requested in the deed."
        },
        "article": "art. 9.3.c) y 9.7",
        "quote": "Se aplicará el tipo reducido del 4 por ciento en aquellas transmisiones de viviendas y promesas u opciones de compra sobre las mismas que vayan a constituir la vivienda habitual del sujeto pasivo, siempre que este reúna alguno de los siguientes requisitos o circunstancias: […] Tener, en la fecha de adquisición del bien inmueble, menos de cuarenta años. […] se aplicará el tipo reducido solo a los sujetos pasivos que lo reúnan, y en proporción a su porcentaje de participación en la adquisición."
      },
      {
        "id": "cantabria-itp-protected",
        "tax": "itp",
        "label": {
          "es": "Vivienda de protección pública no exenta, vivienda habitual",
          "ca": "Habitatge de protecció pública no exempt, habitatge habitual",
          "en": "Non-exempt protected housing, main home"
        },
        "rate": {
          "kind": "scale",
          "how": "progressive",
          "brackets": [
            {
              "upTo": 300000,
              "rate": 4
            },
            {
              "upTo": null,
              "rate": 9
            }
          ]
        },
        "conditions": {
          "habitual": true,
          "protected": true
        },
        "extra": {
          "es": "Solo sobre los primeros 300.000 € del valor; el exceso, al tipo general. Hay que pedirlo expresamente en la escritura.",
          "ca": "Només sobre els primers 300.000 € del valor; l'excés, al tipus general. Cal demanar-ho expressament a l'escriptura.",
          "en": "Only on the first €300,000 of the value; the rest at the general rate. It must be requested in the deed."
        },
        "article": "art. 9.3.d) y 9.7",
        "quote": "Se aplicará el tipo reducido del 4 por ciento en aquellas transmisiones de viviendas y promesas u opciones de compra sobre las mismas que vayan a constituir la vivienda habitual del sujeto pasivo, siempre que este reúna alguno de los siguientes requisitos o circunstancias: […] En las transmisiones de viviendas de Protección Pública que no gocen de la exención prevista en el artículo 45 del Real Decreto Legislativo 1/1993"
      },
      {
        "id": "cantabria-itp-depopulation",
        "tax": "itp",
        "label": {
          "es": "Municipio en riesgo de despoblamiento, vivienda habitual",
          "ca": "Municipi en risc de despoblament, habitatge habitual",
          "en": "Municipality at risk of depopulation, main home"
        },
        "rate": {
          "kind": "scale",
          "how": "progressive",
          "brackets": [
            {
              "upTo": 300000,
              "rate": 4
            },
            {
              "upTo": null,
              "rate": 9
            }
          ]
        },
        "conditions": {
          "habitual": true
        },
        "extra": {
          "es": "Solo sobre los primeros 300.000 € del valor; el exceso, al tipo general. Hay que pedirlo expresamente en la escritura.",
          "ca": "Només sobre els primers 300.000 € del valor; l'excés, al tipus general. Cal demanar-ho expressament a l'escriptura.",
          "en": "Only on the first €300,000 of the value; the rest at the general rate. It must be requested in the deed."
        },
        "manual": true,
        "article": "art. 9.3.e) y 9.7",
        "quote": "Se aplicará el tipo reducido del 4 por ciento en aquellas transmisiones de viviendas y promesas u opciones de compra sobre las mismas que vayan a constituir la vivienda habitual del sujeto pasivo, siempre que este reúna alguno de los siguientes requisitos o circunstancias: […] Cuando la vivienda se encuentre en alguno de los municipios o ayuntamientos afectados por riesgo de despoblamiento incluidos en la Orden por la que se aprueba la Delimitación de Municipios afectados por riesgo de despoblamiento en Cantabria."
      },
      {
        "id": "cantabria-itp-disability-65",
        "tax": "itp",
        "label": {
          "es": "Discapacidad del 65 % o más, vivienda habitual",
          "ca": "Discapacitat del 65 % o més, habitatge habitual",
          "en": "Disability of 65% or more, main home"
        },
        "rate": {
          "kind": "scale",
          "how": "progressive",
          "brackets": [
            {
              "upTo": 300000,
              "rate": 3
            },
            {
              "upTo": null,
              "rate": 9
            }
          ]
        },
        "conditions": {
          "habitual": true,
          "disabilityMin": 65
        },
        "extra": {
          "es": "Solo sobre los primeros 300.000 € del valor; el exceso, al tipo general. Hay que pedirlo expresamente en la escritura.",
          "ca": "Només sobre els primers 300.000 € del valor; l'excés, al tipus general. Cal demanar-ho expressament a l'escriptura.",
          "en": "Only on the first €300,000 of the value; the rest at the general rate. It must be requested in the deed."
        },
        "article": "art. 9.6 y 9.7",
        "quote": "Se aplicará el tipo reducido del 3 por ciento en aquellas transmisiones de viviendas que vayan a constituir la vivienda habitual del sujeto pasivo, cuando este sea una persona con discapacidad física, psíquica o sensorial que tenga la condición legal de persona con discapacidad con un grado de disminución igual o superior al 65 por ciento"
      },
      {
        "id": "cantabria-ajd-habitual",
        "tax": "ajd",
        "label": {
          "es": "Vivienda habitual",
          "ca": "Habitatge habitual",
          "en": "Main home"
        },
        "rate": {
          "kind": "scale",
          "how": "progressive",
          "brackets": [
            {
              "upTo": 300000,
              "rate": 1
            },
            {
              "upTo": null,
              "rate": 1.5
            }
          ]
        },
        "conditions": {
          "habitual": true
        },
        "extra": {
          "es": "Solo sobre los primeros 300.000 € del valor; el exceso, al tipo general. Hay que pedirlo expresamente en la escritura.",
          "ca": "Només sobre els primers 300.000 € del valor; l'excés, al tipus general. Cal demanar-ho expressament a l'escriptura.",
          "en": "Only on the first €300,000 of the value; the rest at the general rate. It must be requested in the deed."
        },
        "article": "art. 13.3",
        "quote": "Cuando se trate de documentos notariales que protocolicen la adquisición de vivienda habitual, el tipo de gravamen será el 1 por ciento."
      },
      {
        "id": "cantabria-ajd-large-family",
        "tax": "ajd",
        "label": {
          "es": "Familia numerosa o monoparental, vivienda habitual",
          "ca": "Família nombrosa o monoparental, habitatge habitual",
          "en": "Large or single-parent family, main home"
        },
        "rate": {
          "kind": "scale",
          "how": "progressive",
          "brackets": [
            {
              "upTo": 300000,
              "rate": 0.1
            },
            {
              "upTo": null,
              "rate": 1.5
            }
          ]
        },
        "conditions": {
          "habitual": true,
          "largeFamily": true
        },
        "extra": {
          "es": "Solo sobre los primeros 300.000 € del valor; el exceso, al tipo general. Hay que pedirlo expresamente en la escritura.",
          "ca": "Només sobre els primers 300.000 € del valor; l'excés, al tipus general. Cal demanar-ho expressament a l'escriptura.",
          "en": "Only on the first €300,000 of the value; the rest at the general rate. It must be requested in the deed."
        },
        "article": "art. 13.4 y 13.9",
        "quote": "se aplicará el tipo reducido del 0,1 por ciento, siempre que el sujeto pasivo reúna alguno de los siguientes requisitos o circunstancias: […] Tener, en la fecha de adquisición del inmueble, menos de cuarenta años. […] Cuando la vivienda se encuentre en alguno de los municipios afectados por riesgo de despoblamiento incluidos en la Orden por la que se aprueba la Delimitación de Municipios afectados por riesgo de despoblamiento en Cantabria. […] Los tipos reducidos establecidos en el presente artículo solo serán aplicables hasta 300.000 euros del valor del inmueble. Para el tramo que exceda de dicho valor será de aplicación el tipo de gravamen general."
      },
      {
        "id": "cantabria-ajd-disability",
        "tax": "ajd",
        "label": {
          "es": "Discapacidad del 33 % al 65 %, vivienda habitual",
          "ca": "Discapacitat del 33 % al 65 %, habitatge habitual",
          "en": "Disability of 33% to 65%, main home"
        },
        "rate": {
          "kind": "scale",
          "how": "progressive",
          "brackets": [
            {
              "upTo": 300000,
              "rate": 0.1
            },
            {
              "upTo": null,
              "rate": 1.5
            }
          ]
        },
        "conditions": {
          "habitual": true,
          "disabilityMin": 33
        },
        "extra": {
          "es": "Solo sobre los primeros 300.000 € del valor; el exceso, al tipo general. Hay que pedirlo expresamente en la escritura.",
          "ca": "Només sobre els primers 300.000 € del valor; l'excés, al tipus general. Cal demanar-ho expressament a l'escriptura.",
          "en": "Only on the first €300,000 of the value; the rest at the general rate. It must be requested in the deed."
        },
        "article": "art. 13.4 y 13.9",
        "quote": "se aplicará el tipo reducido del 0,1 por ciento, siempre que el sujeto pasivo reúna alguno de los siguientes requisitos o circunstancias: […] Tener, en la fecha de adquisición del inmueble, menos de cuarenta años. […] Cuando la vivienda se encuentre en alguno de los municipios afectados por riesgo de despoblamiento incluidos en la Orden por la que se aprueba la Delimitación de Municipios afectados por riesgo de despoblamiento en Cantabria. […] Los tipos reducidos establecidos en el presente artículo solo serán aplicables hasta 300.000 euros del valor del inmueble. Para el tramo que exceda de dicho valor será de aplicación el tipo de gravamen general."
      },
      {
        "id": "cantabria-ajd-young",
        "tax": "ajd",
        "label": {
          "es": "Menores de 40 años, vivienda habitual",
          "ca": "Menors de 40 anys, habitatge habitual",
          "en": "Under 40, main home"
        },
        "rate": {
          "kind": "scale",
          "how": "progressive",
          "brackets": [
            {
              "upTo": 300000,
              "rate": 0.1
            },
            {
              "upTo": null,
              "rate": 1.5
            }
          ]
        },
        "conditions": {
          "habitual": true,
          "maxAge": 39
        },
        "extra": {
          "es": "Solo sobre los primeros 300.000 € del valor; el exceso, al tipo general. Hay que pedirlo expresamente en la escritura.",
          "ca": "Només sobre els primers 300.000 € del valor; l'excés, al tipus general. Cal demanar-ho expressament a l'escriptura.",
          "en": "Only on the first €300,000 of the value; the rest at the general rate. It must be requested in the deed."
        },
        "article": "art. 13.4 y 13.9",
        "quote": "se aplicará el tipo reducido del 0,1 por ciento, siempre que el sujeto pasivo reúna alguno de los siguientes requisitos o circunstancias: […] Tener, en la fecha de adquisición del inmueble, menos de cuarenta años. […] Cuando la vivienda se encuentre en alguno de los municipios afectados por riesgo de despoblamiento incluidos en la Orden por la que se aprueba la Delimitación de Municipios afectados por riesgo de despoblamiento en Cantabria. […] Los tipos reducidos establecidos en el presente artículo solo serán aplicables hasta 300.000 euros del valor del inmueble. Para el tramo que exceda de dicho valor será de aplicación el tipo de gravamen general."
      },
      {
        "id": "cantabria-ajd-depopulation",
        "tax": "ajd",
        "label": {
          "es": "Municipio en riesgo de despoblamiento, vivienda habitual",
          "ca": "Municipi en risc de despoblament, habitatge habitual",
          "en": "Municipality at risk of depopulation, main home"
        },
        "rate": {
          "kind": "scale",
          "how": "progressive",
          "brackets": [
            {
              "upTo": 300000,
              "rate": 0.1
            },
            {
              "upTo": null,
              "rate": 1.5
            }
          ]
        },
        "conditions": {
          "habitual": true
        },
        "extra": {
          "es": "Solo sobre los primeros 300.000 € del valor; el exceso, al tipo general. Hay que pedirlo expresamente en la escritura.",
          "ca": "Només sobre els primers 300.000 € del valor; l'excés, al tipus general. Cal demanar-ho expressament a l'escriptura.",
          "en": "Only on the first €300,000 of the value; the rest at the general rate. It must be requested in the deed."
        },
        "manual": true,
        "article": "art. 13.4 y 13.9",
        "quote": "se aplicará el tipo reducido del 0,1 por ciento, siempre que el sujeto pasivo reúna alguno de los siguientes requisitos o circunstancias: […] Tener, en la fecha de adquisición del inmueble, menos de cuarenta años. […] Cuando la vivienda se encuentre en alguno de los municipios afectados por riesgo de despoblamiento incluidos en la Orden por la que se aprueba la Delimitación de Municipios afectados por riesgo de despoblamiento en Cantabria. […] Los tipos reducidos establecidos en el presente artículo solo serán aplicables hasta 300.000 euros del valor del inmueble. Para el tramo que exceda de dicho valor será de aplicación el tipo de gravamen general."
      },
      {
        "id": "cantabria-ajd-protected",
        "tax": "ajd",
        "label": {
          "es": "Vivienda de protección pública no exenta",
          "ca": "Habitatge de protecció pública no exempt",
          "en": "Non-exempt protected housing"
        },
        "rate": {
          "kind": "scale",
          "how": "progressive",
          "brackets": [
            {
              "upTo": 300000,
              "rate": 0.1
            },
            {
              "upTo": null,
              "rate": 1.5
            }
          ]
        },
        "conditions": {
          "protected": true
        },
        "extra": {
          "es": "Solo sobre los primeros 300.000 € del valor; el exceso, al tipo general. Hay que pedirlo expresamente en la escritura.",
          "ca": "Només sobre els primers 300.000 € del valor; l'excés, al tipus general. Cal demanar-ho expressament a l'escriptura.",
          "en": "Only on the first €300,000 of the value; the rest at the general rate. It must be requested in the deed."
        },
        "article": "art. 13.5",
        "quote": "En los actos y contratos relacionados con las transmisiones de viviendas de Protección Pública que no gocen de la exención prevista en el artículo 45 del Real Decreto Legislativo 1/1993 […] se aplicará también el tipo reducido del 0,1 por ciento."
      },
      {
        "id": "cantabria-ajd-disability-65",
        "tax": "ajd",
        "label": {
          "es": "Discapacidad del 65 % o más, vivienda habitual",
          "ca": "Discapacitat del 65 % o més, habitatge habitual",
          "en": "Disability of 65% or more, main home"
        },
        "rate": {
          "kind": "scale",
          "how": "progressive",
          "brackets": [
            {
              "upTo": 300000,
              "rate": 0.05
            },
            {
              "upTo": null,
              "rate": 1.5
            }
          ]
        },
        "conditions": {
          "habitual": true,
          "disabilityMin": 65
        },
        "extra": {
          "es": "Solo sobre los primeros 300.000 € del valor; el exceso, al tipo general. Hay que pedirlo expresamente en la escritura.",
          "ca": "Només sobre els primers 300.000 € del valor; l'excés, al tipus general. Cal demanar-ho expressament a l'escriptura.",
          "en": "Only on the first €300,000 of the value; the rest at the general rate. It must be requested in the deed."
        },
        "article": "art. 13.6",
        "quote": "Se aplicará el tipo del 0,05 por ciento en aquellas transmisiones de viviendas que vayan a constituir la vivienda habitual del sujeto pasivo, cuando este sea una persona con discapacidad física, psíquica o sensorial que tenga la consideración legal de discapacitado/a con un grado de disminución igual o superior al 65 por ciento."
      }
    ],
    "newHome": {
      "name": "IVA",
      "general": 10,
      "protected": 4,
      "protectedLabel": {
        "es": "VPO de régimen especial o de promoción pública vendida por el promotor",
        "ca": "HPO de règim especial o de promoció pública venuda pel promotor",
        "en": "special-regime or public-promotion VPO sold by the developer"
      },
      "article": "Ley 37/1992, art. 91",
      "quote": "",
      "law": null
    },
    "notes": []
  },
  {
    "id": "castilla-y-leon",
    "name": {
      "es": "Castilla y León",
      "ca": "Castella i Lleó",
      "en": "Castilla y León"
    },
    "regime": "common",
    "status": "sourced",
    "law": {
      "title": "Decreto Legislativo 1/2013, de 12 de septiembre, por el que se aprueba el texto refundido de las disposiciones legales de la Comunidad de Castilla y León en materia de tributos propios y cedidos",
      "short": "Decreto Legislativo 1/2013",
      "url": "https://www.boe.es/buscar/act.php?id=BOCL-h-2013-90254",
      "consolidatedAsOf": "2024-05-14",
      "readOn": "2026-11-13"
    },
    "amendments": [
      {
        "title": "Ley 4/2024, de 9 de mayo, de medidas tributarias, financieras y administrativas (Castilla y León)",
        "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2024-14546"
      }
    ],
    "taxAgency": {
      "name": "Portal Tributario de la Junta de Castilla y León (Consejería de Economía y Hacienda)",
      "url": "https://tributos.jcyl.es/"
    },
    "itp": {
      "general": {
        "kind": "scale",
        "how": "progressive",
        "brackets": [
          {
            "upTo": 250000,
            "rate": 8
          },
          {
            "upTo": null,
            "rate": 10
          }
        ]
      },
      "article": "art. 24.1.a) y art. 25.1",
      "quote": "a) En la transmisión de inmuebles, así como en la constitución y en la cesión de derechos reales que recaigan sobre los mismos, excepto en los derechos reales de garantía: el 8 por 100. […] cuya base imponible supere los 250.000 euros, se aplicará el tipo general a esta cantidad y un tipo incrementado del 10 por 100 a la parte de la base que exceda esta cantidad."
    },
    "ajd": {
      "general": {
        "kind": "flat",
        "rate": 1.5
      },
      "article": "art. 24.2",
      "quote": "En las primeras copias de escrituras y actas notariales sujetas como documentos notariales a la modalidad de Actos Jurídicos Documentados se aplicará el tipo general del 1,5 por 100"
    },
    "benefits": [
      {
        "id": "castilla-y-leon-itp-large-family",
        "tax": "itp",
        "label": {
          "es": "Familia numerosa, vivienda habitual",
          "ca": "Família nombrosa, habitatge habitual",
          "en": "Large family, main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 4
        },
        "conditions": {
          "habitual": true,
          "largeFamily": true
        },
        "extra": {
          "es": "Bases imponibles del IRPF de la familia: hasta 37.800 € (+6.000 € por miembro por encima del mínimo). Si ya tienes otra vivienda, venderla en un año.",
          "ca": "Bases imposables de l'IRPF de la família: fins a 37.800 € (+6.000 € per membre per sobre del mínim). Si ja tens un altre habitatge, vendre'l en un any.",
          "en": "Family IRPF taxable bases: up to €37,800 (+€6,000 per member above the minimum). If you own another home, sell it within a year."
        },
        "article": "art. 25.3.a) y art. 28",
        "quote": "3. En las transmisiones de inmuebles que vayan a constituir la vivienda habitual se aplicará un tipo reducido del 4 por 100 en los siguientes supuestos: […] a) Cuando el adquirente sea titular de una familia numerosa. […] Cuando el adquirente sea el titular de una familia numerosa, la cantidad anterior se elevará a 37.800 euros, más 6.000 euros adicionales por cada miembro superior al mínimo para obtener la condición de familia numerosa. […] b) Cuando el adquirente sea titular de una familia numerosa o él o cualquiera de los miembros de su unidad familiar tengan la consideración legal de persona con discapacidad y sea titular de alguna vivienda, se proceda a su venta en el plazo máximo de un año desde la fecha de adquisición de la nueva."
      },
      {
        "id": "castilla-y-leon-itp-disability",
        "tax": "itp",
        "label": {
          "es": "Discapacidad del 65 % (comprador o familiar), vivienda habitual",
          "ca": "Discapacitat del 65 % (comprador o familiar), habitatge habitual",
          "en": "Disability of 65% (buyer or family member), main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 4
        },
        "conditions": {
          "habitual": true,
          "disabilityMin": 65
        },
        "extra": {
          "es": "Bases imponibles del IRPF (menos el mínimo personal y familiar) de quienes vivirán en ella: hasta 31.500 €. Si ya tienes otra vivienda, venderla en un año.",
          "ca": "Bases imposables de l'IRPF (menys el mínim personal i familiar) de qui hi viurà: fins a 31.500 €. Si ja tens un altre habitatge, vendre'l en un any.",
          "en": "IRPF taxable bases (minus personal and family allowance) of those who will live there: up to €31,500. If you own another home, sell it within a year."
        },
        "article": "art. 25.3.b) y art. 28",
        "quote": "3. En las transmisiones de inmuebles que vayan a constituir la vivienda habitual se aplicará un tipo reducido del 4 por 100 en los siguientes supuestos: […] b) Cuando el adquirente, o cualquiera de los miembros de su unidad familiar, tengan la consideración legal de persona con discapacidad en grado igual o superior al 65 por 100. […] 31.500 euros, con carácter general."
      },
      {
        "id": "castilla-y-leon-itp-young",
        "tax": "itp",
        "label": {
          "es": "Todos los compradores menores de 36, primera vivienda habitual",
          "ca": "Tots els compradors menors de 36, primer habitatge habitual",
          "en": "All buyers under 36, first main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 4
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "maxAge": 35
        },
        "extra": {
          "es": "Todos los compradores menores de 36 y primera vivienda de cada uno; bases imponibles del IRPF hasta 31.500 €.",
          "ca": "Tots els compradors menors de 36 i primer habitatge de cadascun; bases imposables de l'IRPF fins a 31.500 €.",
          "en": "All buyers under 36 and a first home for each; IRPF taxable bases up to €31,500."
        },
        "article": "art. 25.3.c), art. 28 y art. 10.2.g)",
        "quote": "3. En las transmisiones de inmuebles que vayan a constituir la vivienda habitual se aplicará un tipo reducido del 4 por 100 en los siguientes supuestos: […] c) Cuando todos los adquirentes tengan menos de 36 años a la fecha de devengo del impuesto. […] c) Cuando el adquirente tenga menos de 36 años o se trate de transmisiones de viviendas protegidas, la vivienda adquirida sea la primera vivienda de cada uno de los adquirentes. […] g) Se considera que el contribuyente adquiere primera vivienda cuando no dispusiera, ni hubiera dispuesto, de ningún derecho de plena propiedad igual o superior al cincuenta por ciento sobre otra vivienda."
      },
      {
        "id": "castilla-y-leon-itp-protected",
        "tax": "itp",
        "label": {
          "es": "Vivienda protegida, primera vivienda habitual",
          "ca": "Habitatge protegit, primer habitatge habitual",
          "en": "Protected housing, first main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 4
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "protected": true
        },
        "extra": {
          "es": "Primera vivienda de cada comprador; bases imponibles del IRPF hasta 31.500 €.",
          "ca": "Primer habitatge de cada comprador; bases imposables de l'IRPF fins a 31.500 €.",
          "en": "First home for each buyer; IRPF taxable bases up to €31,500."
        },
        "article": "art. 25.3.d) y art. 28",
        "quote": "3. En las transmisiones de inmuebles que vayan a constituir la vivienda habitual se aplicará un tipo reducido del 4 por 100 en los siguientes supuestos: […] d) En las transmisiones de viviendas protegidas según la normativa de la Comunidad o calificadas por cualquier otra normativa como vivienda de protección pública."
      },
      {
        "id": "castilla-y-leon-itp-young-rural",
        "tax": "itp",
        "label": {
          "es": "Menores de 36 en municipio rural, vivienda de menos de 150.000 €",
          "ca": "Menors de 36 en municipi rural, habitatge de menys de 150.000 €",
          "en": "Under 36 in a rural municipality, home under €150,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.01
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "maxAge": 35,
          "maxValue": 150000
        },
        "extra": {
          "es": "Municipio de hasta 10.000 habitantes (3.000 si está a menos de 30 km de la capital).",
          "ca": "Municipi de fins a 10.000 habitants (3.000 si és a menys de 30 km de la capital).",
          "en": "Municipality of up to 10,000 people (3,000 if within 30 km of the provincial capital)."
        },
        "manual": true,
        "article": "art. 25.4, art. 7.1.c) y art. 28",
        "quote": "4. En las transmisiones de inmuebles que vayan a constituir la vivienda habitual se aplicará un tipo reducido del 0,01 por 100, siempre que se cumplan, simultáneamente, los siguientes requisitos: […] a) Que todos los adquirentes tengan menos de 36 años a la fecha de devengo del impuesto. […] b) Que la vivienda que vaya a constituir la residencia habitual cumpla los requisitos establecidos en el apartado 1.c) del artículo 7 de este texto refundido. […] c) Que la vivienda esté situada en un municipio o en una entidad local menor de la Comunidad de Castilla y León que en el momento de la adquisición o rehabilitación no exceda de 10.000 habitantes, con carácter general, o de 3.000 habitantes, si dista menos de 30 kilómetros de la capital de la provincia, y tenga un valor, a efectos del impuesto que grave su adquisición, menor de 150.000,00 euros."
      },
      {
        "id": "castilla-y-leon-ajd-large-family",
        "tax": "ajd",
        "label": {
          "es": "Familia numerosa, vivienda habitual",
          "ca": "Família nombrosa, habitatge habitual",
          "en": "Large family, main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.5
        },
        "conditions": {
          "habitual": true,
          "largeFamily": true
        },
        "extra": {
          "es": "Bases imponibles del IRPF de la familia: hasta 37.800 € (+6.000 € por miembro por encima del mínimo). Si ya tienes otra vivienda, venderla en un año.",
          "ca": "Bases imposables de l'IRPF de la família: fins a 37.800 € (+6.000 € per membre per sobre del mínim). Si ja tens un altre habitatge, vendre'l en un any.",
          "en": "Family IRPF taxable bases: up to €37,800 (+€6,000 per member above the minimum). If you own another home, sell it within a year."
        },
        "article": "art. 26.2 y art. 28",
        "quote": "En las primeras copias de escrituras y actas notariales que documenten la adquisición de viviendas que vayan a constituir la vivienda habitual se aplicará un tipo reducido del 0,50 por 100 en los siguientes supuestos: […] En las transmisiones de viviendas protegidas según la normativa de la Comunidad de Castilla y León o calificadas por cualquier otra normativa como vivienda de protección pública, cuando no gocen de la exención prevista en el artículo 45 […] Cuando todos los adquirentes tengan menos de 36 años a la fecha de devengo del impuesto."
      },
      {
        "id": "castilla-y-leon-ajd-disability",
        "tax": "ajd",
        "label": {
          "es": "Discapacidad del 65 % (comprador o familiar), vivienda habitual",
          "ca": "Discapacitat del 65 % (comprador o familiar), habitatge habitual",
          "en": "Disability of 65% (buyer or family member), main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.5
        },
        "conditions": {
          "habitual": true,
          "disabilityMin": 65
        },
        "extra": {
          "es": "Bases imponibles del IRPF (menos el mínimo personal y familiar) de quienes vivirán en ella: hasta 31.500 €. Si ya tienes otra vivienda, venderla en un año.",
          "ca": "Bases imposables de l'IRPF (menys el mínim personal i familiar) de qui hi viurà: fins a 31.500 €. Si ja tens un altre habitatge, vendre'l en un any.",
          "en": "IRPF taxable bases (minus personal and family allowance) of those who will live there: up to €31,500. If you own another home, sell it within a year."
        },
        "article": "art. 26.2 y art. 28",
        "quote": "En las primeras copias de escrituras y actas notariales que documenten la adquisición de viviendas que vayan a constituir la vivienda habitual se aplicará un tipo reducido del 0,50 por 100 en los siguientes supuestos: […] En las transmisiones de viviendas protegidas según la normativa de la Comunidad de Castilla y León o calificadas por cualquier otra normativa como vivienda de protección pública, cuando no gocen de la exención prevista en el artículo 45 […] Cuando todos los adquirentes tengan menos de 36 años a la fecha de devengo del impuesto."
      },
      {
        "id": "castilla-y-leon-ajd-young",
        "tax": "ajd",
        "label": {
          "es": "Todos los compradores menores de 36, primera vivienda habitual",
          "ca": "Tots els compradors menors de 36, primer habitatge habitual",
          "en": "All buyers under 36, first main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.5
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "maxAge": 35
        },
        "extra": {
          "es": "Todos los compradores menores de 36 y primera vivienda de cada uno; bases imponibles del IRPF hasta 31.500 €.",
          "ca": "Tots els compradors menors de 36 i primer habitatge de cadascun; bases imposables de l'IRPF fins a 31.500 €.",
          "en": "All buyers under 36 and a first home for each; IRPF taxable bases up to €31,500."
        },
        "article": "art. 26.2 y art. 28",
        "quote": "En las primeras copias de escrituras y actas notariales que documenten la adquisición de viviendas que vayan a constituir la vivienda habitual se aplicará un tipo reducido del 0,50 por 100 en los siguientes supuestos: […] En las transmisiones de viviendas protegidas según la normativa de la Comunidad de Castilla y León o calificadas por cualquier otra normativa como vivienda de protección pública, cuando no gocen de la exención prevista en el artículo 45 […] Cuando todos los adquirentes tengan menos de 36 años a la fecha de devengo del impuesto."
      },
      {
        "id": "castilla-y-leon-ajd-protected",
        "tax": "ajd",
        "label": {
          "es": "Vivienda protegida no exenta, primera vivienda habitual",
          "ca": "Habitatge protegit no exempt, primer habitatge habitual",
          "en": "Non-exempt protected housing, first main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.5
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "protected": true
        },
        "extra": {
          "es": "Primera vivienda de cada comprador; bases imponibles del IRPF hasta 31.500 €.",
          "ca": "Primer habitatge de cada comprador; bases imposables de l'IRPF fins a 31.500 €.",
          "en": "First home for each buyer; IRPF taxable bases up to €31,500."
        },
        "article": "art. 26.2 y art. 28",
        "quote": "En las primeras copias de escrituras y actas notariales que documenten la adquisición de viviendas que vayan a constituir la vivienda habitual se aplicará un tipo reducido del 0,50 por 100 en los siguientes supuestos: […] En las transmisiones de viviendas protegidas según la normativa de la Comunidad de Castilla y León o calificadas por cualquier otra normativa como vivienda de protección pública, cuando no gocen de la exención prevista en el artículo 45 […] Cuando todos los adquirentes tengan menos de 36 años a la fecha de devengo del impuesto."
      },
      {
        "id": "castilla-y-leon-ajd-young-rural",
        "tax": "ajd",
        "label": {
          "es": "Menores de 36 en municipio rural, vivienda de menos de 150.000 €",
          "ca": "Menors de 36 en municipi rural, habitatge de menys de 150.000 €",
          "en": "Under 36 in a rural municipality, home under €150,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.01
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "maxAge": 35,
          "maxValue": 150000
        },
        "extra": {
          "es": "Municipio de hasta 10.000 habitantes (3.000 si está a menos de 30 km de la capital).",
          "ca": "Municipi de fins a 10.000 habitants (3.000 si és a menys de 30 km de la capital).",
          "en": "Municipality of up to 10,000 people (3,000 if within 30 km of the provincial capital)."
        },
        "manual": true,
        "article": "art. 26.3 y art. 28",
        "quote": "En las primeras copias de escrituras y actas notariales que documenten la adquisición de viviendas que vayan a constituir la vivienda habitual se aplicará un tipo reducido del 0,01 por 100, siempre que se cumplan, simultáneamente, los siguientes requisitos: […] Que la vivienda que vaya a constituir la residencia habitual cumpla los requisitos establecidos en el apartado 1. c) del artículo 7 de este texto refundido."
      }
    ],
    "newHome": {
      "name": "IVA",
      "general": 10,
      "protected": 4,
      "protectedLabel": {
        "es": "VPO de régimen especial o de promoción pública vendida por el promotor",
        "ca": "HPO de règim especial o de promoció pública venuda pel promotor",
        "en": "special-regime or public-promotion VPO sold by the developer"
      },
      "article": "Ley 37/1992, art. 91",
      "quote": "",
      "law": null
    },
    "notes": [
      {
        "es": "La ley no dice si el 4 % reducido sustituye a toda la escala cuando la vivienda vale más de 250.000 €; la calculadora lo aplica a todo el valor. Confírmalo con la Junta.",
        "ca": "La llei no diu si el 4 % reduït substitueix tota l'escala quan l'habitatge val més de 250.000 €; la calculadora l'aplica a tot el valor. Confirma-ho amb la Junta.",
        "en": "The law does not say whether the 4% reduced rate replaces the whole scale for homes over €250,000; the calculator applies it to the whole value. Check with the Junta."
      }
    ]
  },
  {
    "id": "castilla-la-mancha",
    "name": {
      "es": "Castilla-La Mancha",
      "ca": "Castella-la Manxa",
      "en": "Castilla-La Mancha"
    },
    "regime": "common",
    "status": "sourced",
    "law": {
      "title": "Ley 8/2013, de 21 de noviembre, de Medidas Tributarias de Castilla-La Mancha",
      "short": "Ley 8/2013",
      "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2014-1368",
      "consolidatedAsOf": "2026-03-30",
      "readOn": "2026-11-13"
    },
    "amendments": [
      {
        "title": "Ley 1/2026, de 26 de marzo, de Medidas Administrativas y Tributarias de Castilla-La Mancha",
        "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2026-23387"
      }
    ],
    "taxAgency": {
      "name": "Portal Tributario de Castilla-La Mancha (Consejería de Hacienda)",
      "url": "https://portaltributario.jccm.es/"
    },
    "itp": {
      "general": {
        "kind": "flat",
        "rate": 9
      },
      "article": "art. 19.1",
      "quote": "con excepción de los derechos reales de garantía, a que se refiere el artículo 11.1.a) del texto refundido de la Ley del Impuesto sobre Transmisiones Patrimoniales y Actos Jurídicos Documentados, aprobado por Real Decreto Legislativo 1/1993, de 24 de septiembre, se les aplicará, con carácter general, el tipo de gravamen del 9 por ciento."
    },
    "ajd": {
      "general": {
        "kind": "flat",
        "rate": 1.5
      },
      "article": "art. 21.1",
      "quote": "se les aplicará, con carácter general, el tipo de gravamen del 1,50 por ciento."
    },
    "benefits": [
      {
        "id": "castilla-la-mancha-itp-first-home",
        "tax": "itp",
        "label": {
          "es": "Primera vivienda habitual de hasta 240.000 €",
          "ca": "Primer habitatge habitual de fins a 240.000 €",
          "en": "First main home up to €240,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 6
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "maxValue": 240000
        },
        "extra": {
          "es": "La compra debe financiarse en más del 50 % con hipoteca de una entidad de crédito; si compran varios, todos deben cumplir.",
          "ca": "La compra s'ha de finançar en més del 50 % amb hipoteca d'una entitat de crèdit; si compren diversos, tots han de complir.",
          "en": "More than 50% of the price must be financed with a bank mortgage; with several buyers, all must qualify."
        },
        "article": "art. 19.2 y art. 22",
        "quote": "Se aplicará el tipo reducido del 6 por ciento a las transmisiones de inmuebles que tengan por objeto la adquisición de la primera vivienda habitual del sujeto pasivo, siempre que el valor de la vivienda no exceda de 240.000 euros y se cumplan las siguientes condiciones: […] a) Que la adquisición se financie en más del 50 por ciento mediante préstamo hipotecario sobre el inmueble adquirido […] c) Que el valor declarado por el contribuyente sea igual o superior al valor de referencia, en caso de existir este, previsto en el artículo 10.2 del texto legal mencionado en la letra anterior. […] para que pueda hacerse efectiva la aplicación de los tipos reducidos definidos en los artículos 19 y 21 de esta ley, los requisitos establecidos habrán de cumplirse para todas y cada una de ellas."
      },
      {
        "id": "castilla-la-mancha-itp-depop-risk",
        "tax": "itp",
        "label": {
          "es": "Primera vivienda habitual en zona en riesgo de despoblación",
          "ca": "Primer habitatge habitual en zona en risc de despoblament",
          "en": "First main home in an area at risk of depopulation"
        },
        "rate": {
          "kind": "flat",
          "rate": 5
        },
        "conditions": {
          "habitual": true,
          "firstHome": true
        },
        "extra": {
          "es": "Solo en municipios de zonas despobladas (Ley 2/2021); confirma con la Consejería si se exigen también el límite de valor y la hipoteca.",
          "ca": "Només en municipis de zones despoblades (Llei 2/2021); confirma amb la Conselleria si també s'exigeixen el límit de valor i la hipoteca.",
          "en": "Only in depopulated-area municipalities (Ley 2/2021); check with the regional ministry whether the value cap and mortgage also apply."
        },
        "manual": true,
        "article": "art. 19.2, párrafo segundo, 1.º",
        "quote": "No obstante, cuando las transmisiones de inmuebles tengan por objeto la adquisición de la primera vivienda habitual radicada en alguno de los municipios incluidos en las zonas a que se refieren los artículos 12 y 13 de la Ley 2/2021, de 7 de mayo, […] 1.º Inmuebles ubicados en municipios incluidos en zonas en riesgo de despoblación: 5 por ciento."
      },
      {
        "id": "castilla-la-mancha-itp-depop-intense",
        "tax": "itp",
        "label": {
          "es": "Primera vivienda habitual en zona de intensa despoblación",
          "ca": "Primer habitatge habitual en zona d'intens despoblament",
          "en": "First main home in an intensely depopulated area"
        },
        "rate": {
          "kind": "flat",
          "rate": 4
        },
        "conditions": {
          "habitual": true,
          "firstHome": true
        },
        "extra": {
          "es": "Solo en municipios de zonas despobladas (Ley 2/2021); confirma con la Consejería si se exigen también el límite de valor y la hipoteca.",
          "ca": "Només en municipis de zones despoblades (Llei 2/2021); confirma amb la Conselleria si també s'exigeixen el límit de valor i la hipoteca.",
          "en": "Only in depopulated-area municipalities (Ley 2/2021); check with the regional ministry whether the value cap and mortgage also apply."
        },
        "manual": true,
        "article": "art. 19.2, párrafo segundo, 2.º",
        "quote": "2.º Inmuebles ubicados en municipios incluidos en zonas de intensa despoblación: 4 por ciento."
      },
      {
        "id": "castilla-la-mancha-itp-depop-extreme",
        "tax": "itp",
        "label": {
          "es": "Primera vivienda habitual en zona de extrema despoblación",
          "ca": "Primer habitatge habitual en zona d'extrem despoblament",
          "en": "First main home in an extremely depopulated area"
        },
        "rate": {
          "kind": "flat",
          "rate": 3
        },
        "conditions": {
          "habitual": true,
          "firstHome": true
        },
        "extra": {
          "es": "Solo en municipios de zonas despobladas (Ley 2/2021); confirma con la Consejería si se exigen también el límite de valor y la hipoteca.",
          "ca": "Només en municipis de zones despoblades (Llei 2/2021); confirma amb la Conselleria si també s'exigeixen el límit de valor i la hipoteca.",
          "en": "Only in depopulated-area municipalities (Ley 2/2021); check with the regional ministry whether the value cap and mortgage also apply."
        },
        "manual": true,
        "article": "art. 19.2, párrafo segundo, 3.º",
        "quote": "3.º Inmuebles ubicados en municipios incluidos en zonas de extrema despoblación: 3 por ciento."
      },
      {
        "id": "castilla-la-mancha-itp-large-family",
        "tax": "itp",
        "label": {
          "es": "Familia numerosa o monoparental, primera vivienda habitual de hasta 240.000 €",
          "ca": "Família nombrosa o monoparental, primer habitatge habitual de fins a 240.000 €",
          "en": "Large or single-parent family, first main home up to €240,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 5
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "largeFamily": true,
          "maxValue": 240000
        },
        "extra": {
          "es": "La compra debe financiarse en más del 50 % con hipoteca de una entidad de crédito; si compran varios, todos deben cumplir.",
          "ca": "La compra s'ha de finançar en més del 50 % amb hipoteca d'una entitat de crèdit; si compren diversos, tots han de complir.",
          "en": "More than 50% of the price must be financed with a bank mortgage; with several buyers, all must qualify."
        },
        "article": "art. 19.6",
        "quote": "Se aplicará el tipo reducido del 5 por ciento a las transmisiones de inmuebles que tengan por objeto la adquisición de la primera vivienda habitual del sujeto pasivo con un grado de discapacidad acreditado igual o superior al 65 por ciento, o esté integrado en una familia numerosa o en una familia monoparental, siempre que el valor de la vivienda no exceda de 240.000 euros"
      },
      {
        "id": "castilla-la-mancha-itp-disability",
        "tax": "itp",
        "label": {
          "es": "Discapacidad del 65 % o más, primera vivienda habitual de hasta 240.000 €",
          "ca": "Discapacitat del 65 % o més, primer habitatge habitual de fins a 240.000 €",
          "en": "Disability of 65% or more, first main home up to €240,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 5
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "disabilityMin": 65,
          "maxValue": 240000
        },
        "extra": {
          "es": "La compra debe financiarse en más del 50 % con hipoteca de una entidad de crédito; si compran varios, todos deben cumplir.",
          "ca": "La compra s'ha de finançar en més del 50 % amb hipoteca d'una entitat de crèdit; si compren diversos, tots han de complir.",
          "en": "More than 50% of the price must be financed with a bank mortgage; with several buyers, all must qualify."
        },
        "article": "art. 19.6",
        "quote": "Se aplicará el tipo reducido del 5 por ciento a las transmisiones de inmuebles que tengan por objeto la adquisición de la primera vivienda habitual del sujeto pasivo con un grado de discapacidad acreditado igual o superior al 65 por ciento, o esté integrado en una familia numerosa o en una familia monoparental, siempre que el valor de la vivienda no exceda de 240.000 euros"
      },
      {
        "id": "castilla-la-mancha-itp-young",
        "tax": "itp",
        "label": {
          "es": "Menores de 36 años, primera vivienda habitual de hasta 240.000 €",
          "ca": "Menors de 36 anys, primer habitatge habitual de fins a 240.000 €",
          "en": "Under 36, first main home up to €240,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 3
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "maxAge": 35,
          "maxValue": 240000
        },
        "extra": {
          "es": "La compra debe financiarse en más del 50 % con hipoteca de una entidad de crédito; si compran varios, todos deben cumplir.",
          "ca": "La compra s'ha de finançar en més del 50 % amb hipoteca d'una entitat de crèdit; si compren diversos, tots han de complir.",
          "en": "More than 50% of the price must be financed with a bank mortgage; with several buyers, all must qualify."
        },
        "article": "art. 19.9",
        "quote": "Se aplicará el tipo reducido del 3 por ciento a las transmisiones de inmuebles que tengan por objeto la adquisición de la primera vivienda habitual del sujeto pasivo cuando sea menor de 36 años, siempre que el valor de la vivienda no exceda de 240.000 euros"
      },
      {
        "id": "castilla-la-mancha-ajd-first-home",
        "tax": "ajd",
        "label": {
          "es": "Primera vivienda habitual de hasta 240.000 €",
          "ca": "Primer habitatge habitual de fins a 240.000 €",
          "en": "First main home up to €240,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.75
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "maxValue": 240000
        },
        "extra": {
          "es": "La compra debe financiarse en más del 50 % con hipoteca de una entidad de crédito; si compran varios, todos deben cumplir.",
          "ca": "La compra s'ha de finançar en més del 50 % amb hipoteca d'una entitat de crèdit; si compren diversos, tots han de complir.",
          "en": "More than 50% of the price must be financed with a bank mortgage; with several buyers, all must qualify."
        },
        "article": "art. 21.2",
        "quote": "Se aplicará el tipo reducido del 0,75 por ciento a las primeras copias de escrituras y actas notariales que documenten las transmisiones de inmuebles que tengan por objeto la adquisición de la primera vivienda habitual del sujeto pasivo, siempre que el valor de la vivienda no exceda de 240.000 euros"
      },
      {
        "id": "castilla-la-mancha-ajd-large-family",
        "tax": "ajd",
        "label": {
          "es": "Familia numerosa o monoparental, primera vivienda habitual de hasta 240.000 €",
          "ca": "Família nombrosa o monoparental, primer habitatge habitual de fins a 240.000 €",
          "en": "Large or single-parent family, first main home up to €240,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.5
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "largeFamily": true,
          "maxValue": 240000
        },
        "extra": {
          "es": "La compra debe financiarse en más del 50 % con hipoteca de una entidad de crédito; si compran varios, todos deben cumplir.",
          "ca": "La compra s'ha de finançar en més del 50 % amb hipoteca d'una entitat de crèdit; si compren diversos, tots han de complir.",
          "en": "More than 50% of the price must be financed with a bank mortgage; with several buyers, all must qualify."
        },
        "article": "art. 21.2, párrafo segundo",
        "quote": "Cuando el sujeto pasivo del impuesto, cumpliendo las anteriores condiciones tenga un grado de discapacidad acreditado igual o superior al 65 por ciento, o esté integrado en una familia numerosa o en una familia monoparental, se aplicará el tipo reducido del 0,50 por ciento."
      },
      {
        "id": "castilla-la-mancha-ajd-disability",
        "tax": "ajd",
        "label": {
          "es": "Discapacidad del 65 % o más, primera vivienda habitual de hasta 240.000 €",
          "ca": "Discapacitat del 65 % o més, primer habitatge habitual de fins a 240.000 €",
          "en": "Disability of 65% or more, first main home up to €240,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.5
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "disabilityMin": 65,
          "maxValue": 240000
        },
        "extra": {
          "es": "La compra debe financiarse en más del 50 % con hipoteca de una entidad de crédito; si compran varios, todos deben cumplir.",
          "ca": "La compra s'ha de finançar en més del 50 % amb hipoteca d'una entitat de crèdit; si compren diversos, tots han de complir.",
          "en": "More than 50% of the price must be financed with a bank mortgage; with several buyers, all must qualify."
        },
        "article": "art. 21.2, párrafo segundo",
        "quote": "Cuando el sujeto pasivo del impuesto, cumpliendo las anteriores condiciones tenga un grado de discapacidad acreditado igual o superior al 65 por ciento, o esté integrado en una familia numerosa o en una familia monoparental, se aplicará el tipo reducido del 0,50 por ciento."
      },
      {
        "id": "castilla-la-mancha-ajd-young",
        "tax": "ajd",
        "label": {
          "es": "Menores de 36 años, primera vivienda habitual de hasta 240.000 €",
          "ca": "Menors de 36 anys, primer habitatge habitual de fins a 240.000 €",
          "en": "Under 36, first main home up to €240,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.25
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "maxAge": 35,
          "maxValue": 240000
        },
        "extra": {
          "es": "La compra debe financiarse en más del 50 % con hipoteca de una entidad de crédito; si compran varios, todos deben cumplir.",
          "ca": "La compra s'ha de finançar en més del 50 % amb hipoteca d'una entitat de crèdit; si compren diversos, tots han de complir.",
          "en": "More than 50% of the price must be financed with a bank mortgage; with several buyers, all must qualify."
        },
        "article": "art. 21.2, párrafo tercero",
        "quote": "En el caso de que el sujeto pasivo sea menor de 36 años, cumpliendo las anteriores condiciones, se aplicará el tipo reducido del 0,25 por ciento."
      },
      {
        "id": "castilla-la-mancha-ajd-depop-risk",
        "tax": "ajd",
        "label": {
          "es": "Primera vivienda habitual en zona en riesgo de despoblación",
          "ca": "Primer habitatge habitual en zona en risc de despoblament",
          "en": "First main home in an area at risk of depopulation"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.5
        },
        "conditions": {
          "habitual": true,
          "firstHome": true
        },
        "extra": {
          "es": "Solo en municipios de zonas despobladas (Ley 2/2021); confirma con la Consejería si se exigen también el límite de valor y la hipoteca.",
          "ca": "Només en municipis de zones despoblades (Llei 2/2021); confirma amb la Conselleria si també s'exigeixen el límit de valor i la hipoteca.",
          "en": "Only in depopulated-area municipalities (Ley 2/2021); check with the regional ministry whether the value cap and mortgage also apply."
        },
        "manual": true,
        "article": "art. 21.2, párrafo cuarto, 1.º",
        "quote": "No obstante, cuando la vivienda cuya adquisición se documenta radique en alguno de los municipios incluidos en las zonas a que se refieren los artículos 12 y 13 de la Ley 2/2021, de 7 de mayo, el tipo reducido a aplicar será el siguiente: […] 1.º Inmuebles ubicados en municipios incluidos en zonas en riesgo de despoblación: 0,50 por ciento."
      },
      {
        "id": "castilla-la-mancha-ajd-depop-intense",
        "tax": "ajd",
        "label": {
          "es": "Primera vivienda habitual en zona de intensa despoblación",
          "ca": "Primer habitatge habitual en zona d'intens despoblament",
          "en": "First main home in an intensely depopulated area"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.25
        },
        "conditions": {
          "habitual": true,
          "firstHome": true
        },
        "extra": {
          "es": "Solo en municipios de zonas despobladas (Ley 2/2021); confirma con la Consejería si se exigen también el límite de valor y la hipoteca.",
          "ca": "Només en municipis de zones despoblades (Llei 2/2021); confirma amb la Conselleria si també s'exigeixen el límit de valor i la hipoteca.",
          "en": "Only in depopulated-area municipalities (Ley 2/2021); check with the regional ministry whether the value cap and mortgage also apply."
        },
        "manual": true,
        "article": "art. 21.2, párrafo cuarto, 2.º",
        "quote": "2.º Inmuebles ubicados en municipios incluidos en zonas de intensa despoblación: 0,25 por ciento."
      },
      {
        "id": "castilla-la-mancha-ajd-depop-extreme",
        "tax": "ajd",
        "label": {
          "es": "Primera vivienda habitual en zona de extrema despoblación",
          "ca": "Primer habitatge habitual en zona d'extrem despoblament",
          "en": "First main home in an extremely depopulated area"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.15
        },
        "conditions": {
          "habitual": true,
          "firstHome": true
        },
        "extra": {
          "es": "Solo en municipios de zonas despobladas (Ley 2/2021); confirma con la Consejería si se exigen también el límite de valor y la hipoteca.",
          "ca": "Només en municipis de zones despoblades (Llei 2/2021); confirma amb la Conselleria si també s'exigeixen el límit de valor i la hipoteca.",
          "en": "Only in depopulated-area municipalities (Ley 2/2021); check with the regional ministry whether the value cap and mortgage also apply."
        },
        "manual": true,
        "article": "art. 21.2, párrafo cuarto, 3.º",
        "quote": "3.º Inmuebles ubicados en municipios incluidos en zonas de extrema despoblación: 0,15 por ciento."
      }
    ],
    "newHome": {
      "name": "IVA",
      "general": 10,
      "protected": 4,
      "protectedLabel": {
        "es": "VPO de régimen especial o de promoción pública vendida por el promotor",
        "ca": "HPO de règim especial o de promoció pública venuda pel promotor",
        "en": "special-regime or public-promotion VPO sold by the developer"
      },
      "article": "Ley 37/1992, art. 91",
      "quote": "",
      "law": null
    },
    "notes": [
      {
        "es": "Sin hipoteca de más del 50 % del precio no hay tipo reducido para la vivienda habitual.",
        "ca": "Sense hipoteca de més del 50 % del preu no hi ha tipus reduït per a l'habitatge habitual.",
        "en": "Without a mortgage covering more than 50% of the price there is no reduced rate for a main home."
      }
    ]
  },
  {
    "id": "cataluna",
    "name": {
      "es": "Cataluña",
      "ca": "Catalunya",
      "en": "Catalonia"
    },
    "regime": "common",
    "status": "sourced",
    "law": {
      "title": "Decreto Legislativo 1/2024, de 12 de marzo, por el que se aprueba el libro sexto del Código tributario de Catalunya, que integra el texto refundido de los preceptos legales vigentes en Catalunya en materia de tributos cedidos.",
      "short": "Decreto Legislativo 1/2024 (libro sexto del Código tributario de Catalunya)",
      "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2024-6951",
      "consolidatedAsOf": "2026-05-22",
      "readOn": "2026-11-13"
    },
    "amendments": [
      {
        "title": "Decreto-ley 5/2025, de 25 de marzo (BOE-A-2025-10270)",
        "url": "https://www.boe.es/buscar/doc.php?id=BOE-A-2025-10270"
      },
      {
        "title": "Ley 11/2026, de 9 de julio, de medidas fiscales, financieras, administrativas y del sector público (DOGC núm. 9706, 13/07/2026; BOE ref. DOGC-f-2026-90190)",
        "url": "https://www.boe.es/ccaa/dogc/2026/9706/f00001-00146.pdf"
      }
    ],
    "taxAgency": {
      "name": "Agència Tributària de Catalunya",
      "url": "https://atc.gencat.cat"
    },
    "itp": {
      "general": {
        "kind": "scale",
        "how": "progressive",
        "brackets": [
          {
            "upTo": 600000,
            "rate": 10
          },
          {
            "upTo": 900000,
            "rate": 11
          },
          {
            "upTo": 1500000,
            "rate": 12
          },
          {
            "upTo": null,
            "rate": 13
          }
        ]
      },
      "article": "art. 641-1.1",
      "quote": "La transmisión de inmuebles y la constitución y la cesión de derechos reales que recaigan sobre bienes inmuebles, salvo los derechos reales de garantía, tributa al tipo medio que resulta de aplicar la tarifa siguiente establecida en función del valor del inmueble: […] Se modifica por el art. 5.1 del Decreto-ley 5/2025, de 25 de marzo. Ref. BOE-A-2025-10270 […] Esta modificación entra en vigor el 27 de junio de 2025, según establece su disposición final 2.2."
    },
    "ajd": {
      "general": {
        "kind": "flat",
        "rate": 1.5
      },
      "article": "art. 642-1.d",
      "quote": "d) El 1,5 %, en el caso de otros documentos. […] a) El 3,5 %, en el caso de documentos en que se haya renunciado a la exención en el IVA, de acuerdo con lo que dispone el artículo 20.2 de la Ley 37/1992, de 28 de diciembre, del impuesto sobre el valor añadido."
    },
    "benefits": [
      {
        "id": "cataluna-itp-protected",
        "tax": "itp",
        "label": {
          "es": "Vivienda con protección oficial",
          "ca": "Habitatge amb protecció oficial",
          "en": "Officially protected housing"
        },
        "rate": {
          "kind": "flat",
          "rate": 7
        },
        "conditions": {
          "protected": true
        },
        "extra": null,
        "article": "art. 641-1.2",
        "quote": "La transmisión de viviendas con protección oficial, así como la constitución y la cesión de derechos reales que recaigan sobre ellas, salvo los derechos reales de garantía, tributa al tipo del 7 %."
      },
      {
        "id": "cataluna-itp-large-family",
        "tax": "itp",
        "label": {
          "es": "Familia numerosa, vivienda habitual",
          "ca": "Família nombrosa, habitatge habitual",
          "en": "Large family, main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 5
        },
        "conditions": {
          "habitual": true,
          "largeFamily": true
        },
        "extra": {
          "es": "Bases imponibles de la familia hasta 36.000 € (+14.000 € por hijo por encima del mínimo). Vivir en ella en 12 meses y al menos 3 años seguidos.",
          "ca": "Bases imposables de la família fins a 36.000 € (+14.000 € per fill per sobre del mínim). Viure-hi en 12 mesos i almenys 3 anys seguits.",
          "en": "Family taxable bases up to €36,000 (+€14,000 per child above the minimum). Move in within 12 months and live there at least 3 years in a row."
        },
        "article": "art. 641-2",
        "quote": "El tipo aplicable a la transmisión de un inmueble que deba constituir la vivienda habitual de una familia numerosa es del 5 % […] no debe exceder de 36.000 euros. Esta cantidad debe incrementarse en 14.000 euros por cada hijo e hija que exceda del número de hijos que la legislación vigente exige como mínimo para que una familia tenga la condición legal de numerosa."
      },
      {
        "id": "cataluna-itp-single-parent",
        "tax": "itp",
        "label": {
          "es": "Familia monoparental, vivienda habitual",
          "ca": "Família monoparental, habitatge habitual",
          "en": "Single-parent family, main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 5
        },
        "conditions": {
          "habitual": true
        },
        "extra": {
          "es": "Bases imponibles general y del ahorro (menos mínimos) de la familia hasta 36.000 €. Vivir en ella en 12 meses y al menos 3 años seguidos.",
          "ca": "Bases imposables general i de l'estalvi (menys mínims) de la família fins a 36.000 €. Viure-hi en 12 mesos i almenys 3 anys seguits.",
          "en": "General and savings taxable bases (minus allowances) of the family up to €36,000. Move in within 12 months and live there at least 3 years in a row."
        },
        "manual": true,
        "article": "art. 641-3",
        "quote": "El tipo aplicable a la transmisión de un inmueble que deba constituir la vivienda habitual de una familia monoparental es del 5 % […] no debe exceder de 36.000 euros. Esta cantidad se incrementa en 14.000 euros por cada hijo e hija que exceda del número de hijos que la legislación vigente exige como mínimo para que una familia tenga la condición legal de familia monoparental de categoría especial."
      },
      {
        "id": "cataluna-itp-disability",
        "tax": "itp",
        "label": {
          "es": "Discapacidad del 65 % (tuya o de tu unidad familiar), vivienda habitual",
          "ca": "Discapacitat del 65 % (teva o de la unitat familiar), habitatge habitual",
          "en": "Disability of 65% (yours or a household member's), main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 5
        },
        "conditions": {
          "habitual": true,
          "disabilityMin": 65
        },
        "extra": {
          "es": "Bases imponibles general y del ahorro (menos mínimos) de la unidad familiar hasta 36.000 €. Vivir en ella en 12 meses y al menos 3 años seguidos.",
          "ca": "Bases imposables general i de l'estalvi (menys mínims) de la unitat familiar fins a 36.000 €. Viure-hi en 12 mesos i almenys 3 anys seguits.",
          "en": "General and savings taxable bases (minus allowances) of the household up to €36,000. Move in within 12 months and live there at least 3 years in a row."
        },
        "article": "art. 641-4",
        "quote": "El tipo aplicable a la transmisión de un inmueble que deba constituir la vivienda habitual del contribuyente que tenga la consideración legal de persona con discapacidad física, psíquica o sensorial es del 5 %. También se aplica este tipo cuando dicha circunstancia de discapacidad concurra en alguno de los miembros de la unidad familiar del contribuyente. […] correspondientes a los miembros de la unidad familiar en la última declaración del impuesto sobre la renta de las personas físicas no exceda los 36.000 euros. […] Se consideran personas con discapacidad las que tengan la consideración legal de persona con discapacidad en grado igual o superior al 65 %"
      },
      {
        "id": "cataluna-itp-young",
        "tax": "itp",
        "label": {
          "es": "Jóvenes de 35 años o menos, vivienda habitual",
          "ca": "Joves de 35 anys o menys, habitatge habitual",
          "en": "Buyers aged 35 or under, main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 5
        },
        "conditions": {
          "habitual": true,
          "maxAge": 35
        },
        "extra": {
          "es": "Bases imponibles general y del ahorro (menos mínimos) del comprador hasta 36.000 €. Vivir en ella en 12 meses y al menos 3 años seguidos.",
          "ca": "Bases imposables general i de l'estalvi (menys mínims) del comprador fins a 36.000 €. Viure-hi en 12 mesos i almenys 3 anys seguits.",
          "en": "General and savings taxable bases (minus allowances) of the buyer up to €36,000. Move in within 12 months and live there at least 3 years in a row."
        },
        "article": "art. 641-5",
        "quote": "El tipo aplicable a la transmisión de un inmueble que deba constituir la vivienda habitual del sujeto pasivo es del 5 %, si en la fecha de devengo del impuesto este tiene treinta y cinco años o menos, siempre que la suma de las bases imponibles general y del ahorro, menos el mínimo personal y familiar, en su última declaración del impuesto sobre la renta de las personas físicas no exceda los 36.000 euros. […] Se modifica el apartado 1 por el art. 5.2 del Decreto-ley 5/2025, de 25 de marzo. Ref. BOE-A-2025-10270"
      },
      {
        "id": "cataluna-itp-gender-violence",
        "tax": "itp",
        "label": {
          "es": "Víctimas de violencia machista, vivienda habitual",
          "ca": "Víctimes de violència masclista, habitatge habitual",
          "en": "Victims of gender violence, main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 5
        },
        "conditions": {
          "habitual": true
        },
        "extra": {
          "es": "Bases imponibles general y del ahorro (menos mínimos) de la compradora hasta 36.000 €. Vivir en ella en 12 meses y al menos 3 años seguidos.",
          "ca": "Bases imposables general i de l'estalvi (menys mínims) de la compradora fins a 36.000 €. Viure-hi en 12 mesos i almenys 3 anys seguits.",
          "en": "General and savings taxable bases (minus allowances) of the buyer up to €36,000. Move in within 12 months and live there at least 3 years in a row."
        },
        "manual": true,
        "article": "art. 641-5 bis",
        "quote": "El tipo impositivo aplicable a la transmisión de un inmueble que deba constituir la vivienda habitual de una persona que tenga la condición de víctima de violencia machista de acuerdo con la Ley 5/2008, de 24 de abril, del derecho de las mujeres a erradicar la violencia machista, es del 5 % […] La adquisición de la vivienda debe obedecer a la necesidad de cambio de domicilio de la persona víctima de violencia machista y producirse como consecuencia de esta circunstancia."
      },
      {
        "id": "cataluna-ajd-young",
        "tax": "ajd",
        "label": {
          "es": "Bonificación del 100 %: jóvenes de 35 años o menos, vivienda habitual",
          "ca": "Bonificació del 100 %: joves de 35 anys o menys, habitatge habitual",
          "en": "100% rebate: buyers aged 35 or under, main home"
        },
        "bonusPercent": 100,
        "conditions": {
          "habitual": true,
          "maxAge": 35
        },
        "extra": {
          "es": "Bases imponibles general y del ahorro (menos mínimos) del comprador hasta 36.000 €. Vivir en ella en 12 meses y al menos 3 años seguidos.",
          "ca": "Bases imposables general i de l'estalvi (menys mínims) del comprador fins a 36.000 €. Viure-hi en 12 mesos i almenys 3 anys seguits.",
          "en": "General and savings taxable bases (minus allowances) of the buyer up to €36,000. Move in within 12 months and live there at least 3 years in a row."
        },
        "article": "art. 642-6",
        "quote": "Puede disfrutar de una bonificación del 100 % de la cuota gradual de la modalidad de actos jurídicos documentados la escritura pública que documente la transmisión de un inmueble que deba constituir la vivienda habitual del sujeto pasivo, si en la fecha de devengo del impuesto este tiene treinta y cinco años o menos […] Para la aplicación de esta bonificación se debe estar a lo que establecen los apartados 2 y 3 del artículo 641-5."
      }
    ],
    "newHome": {
      "name": "IVA",
      "general": 10,
      "protected": 4,
      "protectedLabel": {
        "es": "VPO de régimen especial o de promoción pública vendida por el promotor",
        "ca": "HPO de règim especial o de promoció pública venuda pel promotor",
        "en": "special-regime or public-promotion VPO sold by the developer"
      },
      "article": "Ley 37/1992, art. 91",
      "quote": "",
      "law": null
    },
    "notes": [
      {
        "es": "Escala por tramos: 10 % hasta 600.000 €, 11 % hasta 900.000 €, 12 % hasta 1.500.000 € y 13 % por encima. Los grandes tenedores y quien compra un edificio entero pagan el 20 % (art. 641-1.5 y 641-1.6, redacción de la Ley 11/2026).",
        "ca": "Escala per trams: 10 % fins a 600.000 €, 11 % fins a 900.000 €, 12 % fins a 1.500.000 € i 13 % per sobre. Els grans tenidors i qui compra un edifici sencer paguen el 20 % (art. 641-1.5 i 641-1.6, redacció de la Llei 11/2026).",
        "en": "Slices: 10% up to €600,000, 11% up to €900,000, 12% up to €1,500,000 and 13% above. Large holders and buyers of a whole building pay 20% (arts. 641-1.5 and 641-1.6, as worded by Ley 11/2026)."
      }
    ]
  },
  {
    "id": "ceuta",
    "name": {
      "es": "Ceuta",
      "ca": "Ceuta",
      "en": "Ceuta"
    },
    "regime": "ceuta-melilla",
    "status": "sourced",
    "law": {
      "title": "Real Decreto Legislativo 1/1993, de 24 de septiembre, por el que se aprueba el Texto refundido de la Ley del Impuesto sobre Transmisiones Patrimoniales y Actos Jurídicos Documentados",
      "short": "RDLeg 1/1993 (ITPAJD estatal)",
      "url": "https://www.boe.es/buscar/act.php?id=BOE-A-1993-25359",
      "consolidatedAsOf": "2026-03-21",
      "readOn": "2026-11-13"
    },
    "amendments": [
      {
        "title": "Ley 22/2009, de 18 de diciembre (sistema de financiación), art. 66.2",
        "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2009-20375"
      }
    ],
    "taxAgency": {
      "name": "Agencia Estatal de Administración Tributaria (ITP y AJD en Ceuta y Melilla)",
      "url": "https://sede.agenciatributaria.gob.es/"
    },
    "itp": {
      "general": {
        "kind": "flat",
        "rate": 6
      },
      "article": "RDLeg 1/1993, arts. 11.1.a y 57 bis.3.a",
      "quote": "Si la Comunidad Autónoma no hubiese aprobado el tipo a que se refiere el párrafo anterior, se aplicará el 6 por 100 a la transmisión de inmuebles […] 3. Las cuotas derivadas de la aplicación de la modalidad de transmisiones patrimoniales onerosas tendrán derecho a la aplicación de una bonificación del 50 por 100 en los siguientes casos: […] a) Transmisiones y arrendamiento de inmuebles situados en Ceuta o Melilla y constitución o cesión de derechos reales, incluso de garantía sobre los mismos."
    },
    "ajd": {
      "general": {
        "kind": "flat",
        "rate": 0.5
      },
      "article": "RDLeg 1/1993, arts. 31.2 y 57 bis.1",
      "quote": "Si la Comunidad Autónoma no hubiese aprobado el tipo a que se refiere el párrafo anterior, se aplicará el 0,50 por 100, en cuanto a tales actos o contratos. […] 1. La cuota gradual de documentos notariales del gravamen de actos jurídicos documentados se bonificará en un 50 por 100 cuando el Registro en el que se deba proceder a la inscripción o anotación de los bienes o actos radique en Ceuta o Melilla."
    },
    "benefits": [
      {
        "id": "ceuta-itp-bonus-50",
        "tax": "itp",
        "label": {
          "es": "Bonificación del 50 %: todo inmueble situado en la ciudad",
          "ca": "Bonificació del 50 %: tot immoble situat a la ciutat",
          "en": "50% rebate: any property in the city"
        },
        "bonusPercent": 50,
        "conditions": {},
        "extra": null,
        "article": "art. 57 bis.3.a) TRLITP",
        "quote": "3. Las cuotas derivadas de la aplicación de la modalidad de transmisiones patrimoniales onerosas tendrán derecho a la aplicación de una bonificación del 50 por 100 en los siguientes casos: […] a) Transmisiones y arrendamiento de inmuebles situados en Ceuta o Melilla y constitución o cesión de derechos reales, incluso de garantía sobre los mismos."
      },
      {
        "id": "ceuta-ajd-bonus-50",
        "tax": "ajd",
        "label": {
          "es": "Bonificación del 50 %: Registro de la Propiedad en la ciudad",
          "ca": "Bonificació del 50 %: Registre de la Propietat a la ciutat",
          "en": "50% rebate: Land Registry in the city"
        },
        "bonusPercent": 50,
        "conditions": {},
        "extra": null,
        "article": "art. 57 bis.1 TRLITP",
        "quote": "1. La cuota gradual de documentos notariales del gravamen de actos jurídicos documentados se bonificará en un 50 por 100 cuando el Registro en el que se deba proceder a la inscripción o anotación de los bienes o actos radique en Ceuta o Melilla."
      }
    ],
    "newHome": {
      "name": "IPSI",
      "general": 0.5,
      "protected": null,
      "protectedLabel": null,
      "article": "Ordenanza Fiscal reguladora del IPSI de Ceuta, art. 33.tres.a)",
      "quote": "ARTÍCULO 33.tres. […] La construcción y primera transmisión de bienes inmuebles, así como la ejecución de obra inmobiliaria, tributarán con carácter general al tipo del 4 %, con las siguientes excepciones: […] La construcción y primera transmisión de bienes inmuebles, así como la ejecución de obra inmobiliaria, directamente relacionadas con la construcción de nuevas viviendas en Ceuta, tributarán al tipo del 0.5 %.",
      "law": {
        "title": "BOCCE Extraordinario Nº16, jueves 8 de mayo de 2025, anuncio 24 (OASTCE): aprobación definitiva de la modificación de la Ordenanza Fiscal Reguladora del IPSI",
        "short": "Ordenanza fiscal del IPSI de Ceuta (BOCCE Extra 16, 2025)",
        "url": "https://www.ceuta.es/ceuta/component/jdownloads/finish/1955-mayo/22801-bocce-extra16-08-05-2025?Itemid=0",
        "consolidatedAsOf": null,
        "readOn": "2026-11-13"
      },
      "agency": {
        "name": "Organismo Autónomo Servicios Tributarios de Ceuta (IPSI)",
        "url": "https://www.ceuta.es/"
      }
    },
    "notes": [
      {
        "es": "Vivienda usada: ITP estatal del 6 % con una bonificación del 50 % (3 % efectivo), sin tipos reducidos personales. Vivienda nueva: IPSI del 0,5 % para la primera transmisión de viviendas nuevas (art. 33.tres de la ordenanza, aprobada el 29 de abril de 2025, BOCCE extraordinario 16 de 8 de mayo de 2025); otros inmuebles, 4 %.",
        "ca": "Habitatge usat: ITP estatal del 6 % amb una bonificació del 50 % (3 % efectiu), sense tipus reduïts personals. Habitatge nou: IPSI del 0,5 % per a la primera transmissió d'habitatges nous (art. 33.tres de l'ordenança, aprovada el 29 d'abril de 2025, BOCCE extraordinari 16 de 8 de maig de 2025); altres immobles, 4 %.",
        "en": "Resale home: state ITP of 6% with a 50% rebate (3% effective), no personal reduced rates. New home: 0.5% IPSI on the first sale of new homes (ordinance art. 33.tres, approved 29 April 2025, BOCCE extraordinary no. 16 of 8 May 2025); other property, 4%."
      }
    ]
  },
  {
    "id": "extremadura",
    "name": {
      "es": "Extremadura",
      "ca": "Extremadura",
      "en": "Extremadura"
    },
    "regime": "common",
    "status": "sourced",
    "law": {
      "title": "Decreto Legislativo 1/2018, de 10 de abril, por el que se aprueba el texto refundido de las disposiciones legales de la Comunidad Autónoma de Extremadura en materia de tributos cedidos por el Estado",
      "short": "Decreto Legislativo 1/2018",
      "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2018-8159",
      "consolidatedAsOf": "2026-08-04",
      "readOn": "2026-11-13"
    },
    "amendments": [
      {
        "title": "Ley 2/2026, de 3 de agosto, de Presupuestos Generales de la Comunidad Autónoma de Extremadura para el año 2026",
        "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2026-17839"
      }
    ],
    "taxAgency": {
      "name": "Portal Tributario de la Junta de Extremadura",
      "url": "https://portaltributario.juntaex.es/"
    },
    "itp": {
      "general": {
        "kind": "scale",
        "how": "progressive",
        "brackets": [
          {
            "upTo": 360000,
            "rate": 8
          },
          {
            "upTo": 600000,
            "rate": 10
          },
          {
            "upTo": null,
            "rate": 11
          }
        ]
      },
      "article": "art. 36",
      "quote": "la cuota tributaria se obtendrá aplicando sobre la base liquidable la siguiente tarifa: […] Entre 0 y 360.000 euros […] Entre 360.000,01 y 600.000 euros […] Más de 600.000 euros […] 2. La cuota íntegra será la suma de las cuotas correspondientes a las cantidades situadas dentro de cada escalón, a las que se aplica el tipo propio de cada uno de ellos."
    },
    "ajd": {
      "general": {
        "kind": "flat",
        "rate": 1.5
      },
      "article": "art. 46",
      "quote": "La cuota tributaria se obtendrá aplicando sobre la base liquidable el tipo general del 1,50 % en las primeras copias de escrituras y actas notariales sujetas como Documentos Notariales"
    },
    "benefits": [
      {
        "id": "extremadura-itp-habitual",
        "tax": "itp",
        "label": {
          "es": "Vivienda habitual de hasta 200.000 €",
          "ca": "Habitatge habitual de fins a 200.000 €",
          "en": "Main home up to €200,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 7
        },
        "conditions": {
          "habitual": true,
          "maxValue": 200000
        },
        "extra": {
          "es": "Bases imponibles general y del ahorro del IRPF hasta 30.000 € (55.000 € en conjunta). Pagar el precio por banco (efectivo solo hasta 3.000 € de arras).",
          "ca": "Bases imposables general i de l'estalvi de l'IRPF fins a 30.000 € (55.000 € en conjunta). Pagar el preu per banc (efectiu només fins a 3.000 € d'arres).",
          "en": "General and savings IRPF taxable bases up to €30,000 (€55,000 joint). Pay the price through a bank (cash only up to €3,000 deposit)."
        },
        "article": "art. 40 y art. 52",
        "quote": "1. Se aplicará el tipo reducido del 7 % a las transmisiones de inmuebles que vayan a constituir la vivienda habitual del sujeto pasivo, siempre que se cumplan simultáneamente los siguientes requisitos: […] a) Que el valor de la vivienda no supere los 200.000 euros. […] b) Que la suma de las bases imponibles general y del ahorro del impuesto sobre la Renta de las Personas Físicas del adquirente no sea superior a 30.000 euros en tributación individual o a 55.000 euros en caso de tributación conjunta."
      },
      {
        "id": "extremadura-itp-young",
        "tax": "itp",
        "label": {
          "es": "Menores de 36, vivienda habitual de hasta 200.000 €",
          "ca": "Menors de 36, habitatge habitual de fins a 200.000 €",
          "en": "Under 36, main home up to €200,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 4
        },
        "conditions": {
          "habitual": true,
          "maxAge": 35,
          "maxValue": 200000
        },
        "extra": {
          "es": "Bases imponibles general y del ahorro del IRPF hasta 30.000 € (55.000 € en conjunta). Pagar el precio por banco (efectivo solo hasta 3.000 € de arras).",
          "ca": "Bases imposables general i de l'estalvi de l'IRPF fins a 30.000 € (55.000 € en conjunta). Pagar el preu per banc (efectiu només fins a 3.000 € d'arres).",
          "en": "General and savings IRPF taxable bases up to €30,000 (€55,000 joint). Pay the price through a bank (cash only up to €3,000 deposit)."
        },
        "article": "art. 41",
        "quote": "1. Se aplicará un tipo reducido del 4 % a las transmisiones de inmuebles que vayan a constituir la vivienda habitual del sujeto pasivo siempre que se cumplan los mismos requisitos establecidos en el artículo anterior y, además, concurra alguna de las siguientes circunstancias: […] a) Que el contribuyente tenga en la fecha del devengo del impuesto menos de 36 años cumplidos. […] b) Que el contribuyente forme parte de una familia que en el momento del devengo tenga la consideración legal de numerosa o sea ascendiente separado legalmente o de hecho, o sin vínculo matrimonial, con dos hijos sin derecho a percibir anualidades por alimentos […] c) Que el contribuyente, en el momento del devengo, tenga reconocido un grado de discapacidad igual o superior al 65 %, o acredite necesitar ayuda de terceros para desplazarse, o tenga reconocida movilidad reducida o se haya establecido la curatela representativa del contribuyente. […] el requisito de la edad o el de discapacidad deberá cumplirlo, al menos, uno de los cónyuges, si no están separados legalmente o de hecho, o un miembro de la pareja de hecho."
      },
      {
        "id": "extremadura-itp-large-family",
        "tax": "itp",
        "label": {
          "es": "Familia numerosa (o monoparental con dos hijos), vivienda habitual de hasta 200.000 €",
          "ca": "Família nombrosa (o monoparental amb dos fills), habitatge habitual de fins a 200.000 €",
          "en": "Large family (or single parent with two children), main home up to €200,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 4
        },
        "conditions": {
          "habitual": true,
          "largeFamily": true,
          "maxValue": 200000
        },
        "extra": {
          "es": "Bases imponibles general y del ahorro del IRPF hasta 30.000 € (55.000 € en conjunta). Pagar el precio por banco (efectivo solo hasta 3.000 € de arras).",
          "ca": "Bases imposables general i de l'estalvi de l'IRPF fins a 30.000 € (55.000 € en conjunta). Pagar el preu per banc (efectiu només fins a 3.000 € d'arres).",
          "en": "General and savings IRPF taxable bases up to €30,000 (€55,000 joint). Pay the price through a bank (cash only up to €3,000 deposit)."
        },
        "article": "art. 41",
        "quote": "1. Se aplicará un tipo reducido del 4 % a las transmisiones de inmuebles que vayan a constituir la vivienda habitual del sujeto pasivo siempre que se cumplan los mismos requisitos establecidos en el artículo anterior y, además, concurra alguna de las siguientes circunstancias: […] a) Que el contribuyente tenga en la fecha del devengo del impuesto menos de 36 años cumplidos. […] b) Que el contribuyente forme parte de una familia que en el momento del devengo tenga la consideración legal de numerosa o sea ascendiente separado legalmente o de hecho, o sin vínculo matrimonial, con dos hijos sin derecho a percibir anualidades por alimentos […] c) Que el contribuyente, en el momento del devengo, tenga reconocido un grado de discapacidad igual o superior al 65 %, o acredite necesitar ayuda de terceros para desplazarse, o tenga reconocida movilidad reducida o se haya establecido la curatela representativa del contribuyente. […] el requisito de la edad o el de discapacidad deberá cumplirlo, al menos, uno de los cónyuges, si no están separados legalmente o de hecho, o un miembro de la pareja de hecho."
      },
      {
        "id": "extremadura-itp-disability",
        "tax": "itp",
        "label": {
          "es": "Discapacidad del 65 % o más, vivienda habitual de hasta 200.000 €",
          "ca": "Discapacitat del 65 % o més, habitatge habitual de fins a 200.000 €",
          "en": "Disability of 65% or more, main home up to €200,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 4
        },
        "conditions": {
          "habitual": true,
          "disabilityMin": 65,
          "maxValue": 200000
        },
        "extra": {
          "es": "Bases imponibles general y del ahorro del IRPF hasta 30.000 € (55.000 € en conjunta). Pagar el precio por banco (efectivo solo hasta 3.000 € de arras).",
          "ca": "Bases imposables general i de l'estalvi de l'IRPF fins a 30.000 € (55.000 € en conjunta). Pagar el preu per banc (efectiu només fins a 3.000 € d'arres).",
          "en": "General and savings IRPF taxable bases up to €30,000 (€55,000 joint). Pay the price through a bank (cash only up to €3,000 deposit)."
        },
        "article": "art. 41",
        "quote": "1. Se aplicará un tipo reducido del 4 % a las transmisiones de inmuebles que vayan a constituir la vivienda habitual del sujeto pasivo siempre que se cumplan los mismos requisitos establecidos en el artículo anterior y, además, concurra alguna de las siguientes circunstancias: […] a) Que el contribuyente tenga en la fecha del devengo del impuesto menos de 36 años cumplidos. […] b) Que el contribuyente forme parte de una familia que en el momento del devengo tenga la consideración legal de numerosa o sea ascendiente separado legalmente o de hecho, o sin vínculo matrimonial, con dos hijos sin derecho a percibir anualidades por alimentos […] c) Que el contribuyente, en el momento del devengo, tenga reconocido un grado de discapacidad igual o superior al 65 %, o acredite necesitar ayuda de terceros para desplazarse, o tenga reconocida movilidad reducida o se haya establecido la curatela representativa del contribuyente. […] el requisito de la edad o el de discapacidad deberá cumplirlo, al menos, uno de los cónyuges, si no están separados legalmente o de hecho, o un miembro de la pareja de hecho."
      },
      {
        "id": "extremadura-itp-protected",
        "tax": "itp",
        "label": {
          "es": "Vivienda protegida de precio máximo, vivienda habitual de hasta 200.000 €",
          "ca": "Habitatge protegit de preu màxim, habitatge habitual de fins a 200.000 €",
          "en": "Price-capped protected housing, main home up to €200,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 4
        },
        "conditions": {
          "habitual": true,
          "protected": true,
          "maxValue": 200000
        },
        "extra": {
          "es": "Bases imponibles general y del ahorro del IRPF hasta 30.000 € (55.000 € en conjunta). Pagar el precio por banco (efectivo solo hasta 3.000 € de arras).",
          "ca": "Bases imposables general i de l'estalvi de l'IRPF fins a 30.000 € (55.000 € en conjunta). Pagar el preu per banc (efectiu només fins a 3.000 € d'arres).",
          "en": "General and savings IRPF taxable bases up to €30,000 (€55,000 joint). Pay the price through a bank (cash only up to €3,000 deposit)."
        },
        "article": "art. 39",
        "quote": "1. Se aplicará el tipo reducido del 4 % para aquellas transmisiones de viviendas calificadas como viviendas protegidas con precio máximo legal que vayan a constituir la vivienda habitual del sujeto pasivo, siempre que, además, se cumplan los siguientes requisitos:"
      },
      {
        "id": "extremadura-itp-small-town",
        "tax": "itp",
        "label": {
          "es": "Municipio de menos de 3.000 habitantes, vivienda habitual de hasta 200.000 €",
          "ca": "Municipi de menys de 3.000 habitants, habitatge habitual de fins a 200.000 €",
          "en": "Town under 3,000 people, main home up to €200,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 4
        },
        "conditions": {
          "habitual": true,
          "maxValue": 200000
        },
        "extra": {
          "es": "Bases imponibles general y del ahorro del IRPF hasta 30.000 € (55.000 € en conjunta). Pagar el precio por banco (efectivo solo hasta 3.000 € de arras).",
          "ca": "Bases imposables general i de l'estalvi de l'IRPF fins a 30.000 € (55.000 € en conjunta). Pagar el preu per banc (efectiu només fins a 3.000 € d'arres).",
          "en": "General and savings IRPF taxable bases up to €30,000 (€55,000 joint). Pay the price through a bank (cash only up to €3,000 deposit)."
        },
        "manual": true,
        "article": "art. 44 bis",
        "quote": "a) Que la vivienda esté situada en alguno de los municipios y entidades locales menores de Extremadura en los que la población de derecho a 31 de diciembre sea inferior a 3.000 habitantes. […] Se aplicará el tipo reducido del 4 % a las transmisiones de inmuebles que vayan a constituir la vivienda habitual del sujeto pasivo, siempre que se cumplan simultáneamente los siguientes requisitos:"
      },
      {
        "id": "extremadura-ajd-habitual",
        "tax": "ajd",
        "label": {
          "es": "Vivienda habitual de hasta 200.000 €",
          "ca": "Habitatge habitual de fins a 200.000 €",
          "en": "Main home up to €200,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.5
        },
        "conditions": {
          "habitual": true,
          "maxValue": 200000
        },
        "extra": {
          "es": "Bases imponibles general y del ahorro del IRPF hasta 30.000 € (55.000 € en conjunta). Pagar el precio por banco (efectivo solo hasta 3.000 € de arras).",
          "ca": "Bases imposables general i de l'estalvi de l'IRPF fins a 30.000 € (55.000 € en conjunta). Pagar el preu per banc (efectiu només fins a 3.000 € d'arres).",
          "en": "General and savings IRPF taxable bases up to €30,000 (€55,000 joint). Pay the price through a bank (cash only up to €3,000 deposit)."
        },
        "article": "art. 47",
        "quote": "Se aplicará el tipo de gravamen del 0,50 % a las escrituras públicas que documenten la adquisición de inmuebles destinados a la vivienda habitual del sujeto pasivo, siempre que concurran los siguientes requisitos: […] b) Que la suma de las bases imponibles general y del ahorro del Impuesto sobre la Renta de las Personas Físicas del adquirente no sea superior a 30.000 euros en tributación individual o a 55.000 euros en caso de tributación conjunta."
      },
      {
        "id": "extremadura-ajd-protected",
        "tax": "ajd",
        "label": {
          "es": "Vivienda protegida de precio máximo, vivienda habitual de hasta 200.000 €",
          "ca": "Habitatge protegit de preu màxim, habitatge habitual de fins a 200.000 €",
          "en": "Price-capped protected housing, main home up to €200,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.1
        },
        "conditions": {
          "habitual": true,
          "protected": true,
          "maxValue": 200000
        },
        "extra": {
          "es": "Bases imponibles general y del ahorro del IRPF hasta 30.000 € (55.000 € en conjunta). Pagar el precio por banco (efectivo solo hasta 3.000 € de arras).",
          "ca": "Bases imposables general i de l'estalvi de l'IRPF fins a 30.000 € (55.000 € en conjunta). Pagar el preu per banc (efectiu només fins a 3.000 € d'arres).",
          "en": "General and savings IRPF taxable bases up to €30,000 (€55,000 joint). Pay the price through a bank (cash only up to €3,000 deposit)."
        },
        "article": "art. 47 bis",
        "quote": "1. Se aplicará el tipo de gravamen del 0,1 % a las escrituras públicas que documenten las adquisiciones de inmuebles destinados a ser la vivienda habitual del sujeto pasivo, siempre que concurran las siguientes circunstancias: […] b) Que se cumplan los requisitos establecidos en el artículo anterior."
      }
    ],
    "newHome": {
      "name": "IVA",
      "general": 10,
      "protected": 4,
      "protectedLabel": {
        "es": "VPO de régimen especial o de promoción pública vendida por el promotor",
        "ca": "HPO de règim especial o de promoció pública venuda pel promotor",
        "en": "special-regime or public-promotion VPO sold by the developer"
      },
      "article": "Ley 37/1992, art. 91",
      "quote": "",
      "law": null
    },
    "notes": []
  },
  {
    "id": "galicia",
    "name": {
      "es": "Galicia",
      "ca": "Galícia",
      "en": "Galicia"
    },
    "regime": "common",
    "status": "sourced",
    "law": {
      "title": "Decreto Legislativo 1/2011, de 28 de julio, por el que se aprueba el texto refundido de las disposiciones legales de la Comunidad Autónoma de Galicia en materia de tributos cedidos por el Estado.",
      "short": "Decreto Legislativo 1/2011",
      "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2011-18161",
      "consolidatedAsOf": "2026-03-27",
      "readOn": "2026-11-13"
    },
    "amendments": [
      {
        "title": "Ley 5/2025, de 23 de diciembre, de medidas fiscales y administrativas (Galicia)",
        "url": "https://www.boe.es/buscar/doc.php?id=BOE-A-2026-3385"
      }
    ],
    "taxAgency": {
      "name": "Axencia Tributaria de Galicia (ATRIGA)",
      "url": "https://www.atriga.gal"
    },
    "itp": {
      "general": {
        "kind": "flat",
        "rate": 8
      },
      "article": "art. 14.Uno.1",
      "quote": "el tipo de gravamen aplicable a la transmisión de bienes inmuebles, así como en la constitución y cesión de derechos reales que recaigan sobre ellos, excepto los derechos reales de garantía, será del 8 %."
    },
    "ajd": {
      "general": {
        "kind": "flat",
        "rate": 1.5
      },
      "article": "art. 15.Uno",
      "quote": "Con carácter general, en las primeras copias de escrituras o actas notariales sujetas a la modalidad de actos jurídicos documentados, cuota variable de los documentos notariales, del impuesto sobre transmisiones patrimoniales y actos jurídicos documentados, el tipo de gravamen aplicable será del 1,5%."
    },
    "benefits": [
      {
        "id": "galicia-itp-habitual",
        "tax": "itp",
        "label": {
          "es": "Vivienda habitual de hasta 240.000 €",
          "ca": "Habitatge habitual de fins a 240.000 €",
          "en": "Main home up to €240,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 7
        },
        "conditions": {
          "habitual": true,
          "maxValue": 240000
        },
        "extra": {
          "es": "Ni el precio ni el patrimonio de los compradores y su familia pueden superar 240.000 € (+30.000 € por cada miembro más). Con varios compradores, solo la parte de quien cumple.",
          "ca": "Ni el preu ni el patrimoni dels compradors i la seva família poden superar 240.000 € (+30.000 € per cada membre més). Amb diversos compradors, només la part de qui compleix.",
          "en": "Neither the price nor the buyers' and family's wealth may exceed €240,000 (+€30,000 per extra member). With several buyers, only the share of whoever qualifies."
        },
        "article": "art. 14.Dos",
        "quote": "el tipo de gravamen aplicable a las transmisiones de inmuebles que vayan a constituir la vivienda habitual del contribuyente será del 7 %, siempre que se cumplan los siguientes requisitos: […] Que ni el precio de adquisición de la vivienda ni la suma del patrimonio de los adquirentes para los cuales vaya a constituir su vivienda habitual y, en su caso, de los demás miembros de sus unidades familiares exceda la cifra de 240.000 euros, más 30.000 euros adicionales por cada miembro de la unidad familiar que exceda el primero. […] el tipo reducido se aplicará a la parte proporcional de la base liquidable correspondiente al porcentaje de participación en la adquisición de los contribuyentes que sí los cumplan."
      },
      {
        "id": "galicia-itp-disability",
        "tax": "itp",
        "label": {
          "es": "Discapacidad del 65 % o más, vivienda habitual",
          "ca": "Discapacitat del 65 % o més, habitatge habitual",
          "en": "Disability of 65% or more, main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 3
        },
        "conditions": {
          "habitual": true,
          "disabilityMin": 65
        },
        "extra": {
          "es": "La discapacidad debe ser del propio comprador.",
          "ca": "La discapacitat ha de ser del mateix comprador.",
          "en": "The disability must be the buyer's own."
        },
        "article": "art. 14.Tres",
        "quote": "En la modalidad de transmisiones patrimoniales onerosas del impuesto sobre transmisiones patrimoniales y actos jurídicos documentados, el tipo de gravamen aplicable a las transmisiones de inmuebles que vayan a constituir la vivienda habitual del contribuyente será del 3 %, siempre que este cumpla los requisitos siguientes: […] Tres. Tipo de gravamen para la adquisición de vivienda habitual por discapacitados. […] Que en la fecha de devengo del impuesto el adquirente sea una persona discapacitada física, psíquica o sensorial con grado de minusvalía igual o superior al 65 % y destine el inmueble adquirido a su vivienda habitual."
      },
      {
        "id": "galicia-itp-large-family",
        "tax": "itp",
        "label": {
          "es": "Familia numerosa, vivienda habitual de hasta 400.000 €",
          "ca": "Família nombrosa, habitatge habitual de fins a 400.000 €",
          "en": "Large family, main home up to €400,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 3
        },
        "conditions": {
          "habitual": true,
          "largeFamily": true,
          "maxValue": 400000
        },
        "extra": {
          "es": "Ni el precio ni el patrimonio de la familia pueden superar 400.000 € (+50.000 € por miembro por encima del mínimo de familia numerosa).",
          "ca": "Ni el preu ni el patrimoni de la família poden superar 400.000 € (+50.000 € per membre per sobre del mínim de família nombrosa).",
          "en": "Neither the price nor the family's wealth may exceed €400,000 (+€50,000 per member above the large-family minimum)."
        },
        "article": "art. 14.Cuatro",
        "quote": "En la modalidad de transmisiones patrimoniales onerosas del impuesto sobre transmisiones patrimoniales y actos jurídicos documentados, el tipo de gravamen aplicable a las transmisiones de inmuebles que vayan a constituir la vivienda habitual del contribuyente será del 3 %, siempre que este cumpla los requisitos siguientes: […] Que en la fecha de devengo del impuesto el adquirente sea miembro de una familia numerosa que tenga reconocida tal condición con título oficial en vigor y destine el inmueble adquirido a vivienda habitual de su familia. […] Que ni el precio de adquisición de la vivienda ni la suma del patrimonio de todos los miembros de la familia numerosa exceda la cifra de 400.000 euros, más 50.000 euros adicionales por cada miembro superior al mínimo para obtener la condición de familia numerosa."
      },
      {
        "id": "galicia-itp-young",
        "tax": "itp",
        "label": {
          "es": "Menores de 36 años, vivienda habitual de hasta 240.000 €",
          "ca": "Menors de 36 anys, habitatge habitual de fins a 240.000 €",
          "en": "Under 36, main home up to €240,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 3
        },
        "conditions": {
          "habitual": true,
          "maxAge": 35,
          "maxValue": 240000
        },
        "extra": {
          "es": "Ni el precio ni el patrimonio de los compradores y su familia pueden superar 240.000 € (+30.000 € por cada miembro más). Con varios compradores, solo la parte de quien cumple.",
          "ca": "Ni el preu ni el patrimoni dels compradors i la seva família poden superar 240.000 € (+30.000 € per cada membre més). Amb diversos compradors, només la part de qui compleix.",
          "en": "Neither the price nor the buyers' and family's wealth may exceed €240,000 (+€30,000 per extra member). With several buyers, only the share of whoever qualifies."
        },
        "article": "art. 14.Cinco",
        "quote": "Cinco. Tipo de gravamen para la adquisición de vivienda habitual por menores de 36 años. […] Que en la fecha de devengo del impuesto el adquirente tenga una edad inferior a 36 años. […] La adquisición de la vivienda deberá documentarse en escritura pública, en la cual se hará constar expresamente la fecha de nacimiento del adquirente y la finalidad de destinarla a constituir su vivienda habitual."
      },
      {
        "id": "galicia-itp-gender-violence",
        "tax": "itp",
        "label": {
          "es": "Víctimas de violencia de género, vivienda habitual de hasta 240.000 €",
          "ca": "Víctimes de violència de gènere, habitatge habitual de fins a 240.000 €",
          "en": "Gender-violence victims, main home up to €240,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 3
        },
        "conditions": {
          "habitual": true,
          "maxValue": 240000
        },
        "extra": null,
        "manual": true,
        "article": "art. 14.Ocho",
        "quote": "Que en la fecha de devengo del impuesto el adquirente se encuentre en alguna de las situaciones de violencia de género descritas en la Ley 11/2007, de 27 de julio, gallega para la prevención y el tratamiento integral de la violencia de género. […] Que el precio de la vivienda no exceda los 240.000 euros, más 30.000 euros adicionales por cada miembro de la unidad familiar que exceda el primero."
      },
      {
        "id": "galicia-itp-single-parent",
        "tax": "itp",
        "label": {
          "es": "Familias monoparentales (registro gallego), vivienda habitual de hasta 240.000 €",
          "ca": "Famílies monoparentals (registre gallec), habitatge habitual de fins a 240.000 €",
          "en": "Single-parent families (Galician register), main home up to €240,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 3
        },
        "conditions": {
          "habitual": true,
          "maxValue": 240000
        },
        "extra": null,
        "manual": true,
        "article": "art. 14.Diez",
        "quote": "Diez. Tipo de gravamen para la adquisición de vivienda habitual por parte de familias monoparentales. […] Que en la fecha de devengo del impuesto la persona adquirente tenga la consideración de miembro de una familia monoparental que esté inscrita en el Registro de Familias Monoparentales Gallegas […] Que ni el precio de adquisición de la vivienda ni la suma del patrimonio de todos los miembros de la familia monoparental para los cuales vaya a constituir su vivienda habitual exceda la cifra de 240.000 euros, más 30.000 euros adicionales por cada miembro de la unidad familiar que exceda el primero."
      },
      {
        "id": "galicia-itp-rural",
        "tax": "itp",
        "label": {
          "es": "Vivienda en parroquia rural o poco poblada",
          "ca": "Habitatge en parròquia rural o poc poblada",
          "en": "Home in a rural or sparsely populated parish"
        },
        "rate": {
          "kind": "flat",
          "rate": 6
        },
        "conditions": {},
        "extra": {
          "es": "Solo en parroquias rurales o poco pobladas (orden de la Consellería de Facenda).",
          "ca": "Només en parròquies rurals o poc poblades (ordre de la Conselleria de Facenda).",
          "en": "Only in rural or sparsely populated parishes (Galician finance department order)."
        },
        "manual": true,
        "article": "art. 14.Siete",
        "quote": "el tipo de gravamen aplicable a las transmisiones de inmuebles de uso vivienda que se encuentren en alguna de las parroquias que tengan la consideración de zonas poco pobladas o áreas rurales a las que se refiere el número siete del artículo 16 será del 6 %."
      },
      {
        "id": "galicia-itp-rural-habitual",
        "tax": "itp",
        "label": {
          "es": "Vivienda habitual en parroquia rural o poco poblada",
          "ca": "Habitatge habitual en parròquia rural o poc poblada",
          "en": "Main home in a rural or sparsely populated parish"
        },
        "rate": {
          "kind": "flat",
          "rate": 5
        },
        "conditions": {
          "habitual": true,
          "maxValue": 240000
        },
        "extra": {
          "es": "Solo en parroquias rurales o poco pobladas (orden de la Consellería de Facenda).",
          "ca": "Només en parròquies rurals o poc poblades (ordre de la Conselleria de Facenda).",
          "en": "Only in rural or sparsely populated parishes (Galician finance department order)."
        },
        "manual": true,
        "article": "art. 14.Siete",
        "quote": "Si además se trata de la vivienda habitual del contribuyente y se cumplen los requisitos establecidos en el número Dos del presente artículo, el tipo de gravamen será del 5 %."
      },
      {
        "id": "galicia-itp-rural-deduction",
        "tax": "itp",
        "label": {
          "es": "Deducción del 100 % para los colectivos del 3 % en parroquias rurales",
          "ca": "Deducció del 100 % per als col·lectius del 3 % en parròquies rurals",
          "en": "100% deduction for the 3% groups in rural parishes"
        },
        "bonusPercent": 100,
        "conditions": {
          "habitual": true
        },
        "extra": {
          "es": "Solo en parroquias rurales o poco pobladas (orden de la Consellería de Facenda).",
          "ca": "Només en parròquies rurals o poc poblades (ordre de la Conselleria de Facenda).",
          "en": "Only in rural or sparsely populated parishes (Galician finance department order)."
        },
        "manual": true,
        "article": "art. 16.Siete",
        "quote": "Los contribuyentes que tengan derecho a aplicar los tipos de gravamen reducidos regulados en los apartados tres, cuatro, cinco, ocho y diez del artículo 14 tendrán derecho a una deducción en la cuota del 100 % siempre que la vivienda se encuentre en alguna de las parroquias que tengan la consideración de zonas poco pobladas o áreas rurales."
      },
      {
        "id": "galicia-ajd-habitual",
        "tax": "ajd",
        "label": {
          "es": "Vivienda habitual de hasta 240.000 €",
          "ca": "Habitatge habitual de fins a 240.000 €",
          "en": "Main home up to €240,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 1
        },
        "conditions": {
          "habitual": true,
          "maxValue": 240000
        },
        "extra": {
          "es": "Ni el precio ni el patrimonio de los compradores y su familia pueden superar 240.000 € (+30.000 € por cada miembro más). Con varios compradores, solo la parte de quien cumple.",
          "ca": "Ni el preu ni el patrimoni dels compradors i la seva família poden superar 240.000 € (+30.000 € per cada membre més). Amb diversos compradors, només la part de qui compleix.",
          "en": "Neither the price nor the buyers' and family's wealth may exceed €240,000 (+€30,000 per extra member). With several buyers, only the share of whoever qualifies."
        },
        "article": "art. 15.Dos",
        "quote": "el tipo de gravamen aplicable en las primeras copias de escrituras que documenten la adquisición de la vivienda habitual del contribuyente o la constitución de préstamos o créditos hipotecarios destinados a su financiación será del 1%, siempre que se cumplan los requisitos siguientes: […] Que ni el precio de adquisición de la vivienda ni la suma del patrimonio de los adquirentes para los cuales vaya a constituir su vivienda habitual y, en su caso, de los demás miembros de sus unidades familiares exceda la cifra de 240.000 euros"
      },
      {
        "id": "galicia-ajd-disability",
        "tax": "ajd",
        "label": {
          "es": "Discapacidad del 65 % o más, vivienda habitual",
          "ca": "Discapacitat del 65 % o més, habitatge habitual",
          "en": "Disability of 65% or more, main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.5
        },
        "conditions": {
          "habitual": true,
          "disabilityMin": 65
        },
        "extra": {
          "es": "La discapacidad debe ser del propio comprador.",
          "ca": "La discapacitat ha de ser del mateix comprador.",
          "en": "The disability must be the buyer's own."
        },
        "article": "art. 15.Tres",
        "quote": "documentados, el tipo de gravamen aplicable en las primeras copias de escrituras que documenten la adquisición de la vivienda habitual del contribuyente o la constitución de préstamos o créditos hipotecarios destinados a su financiación será del 0,5%, siempre que se cumplan los requisitos siguientes: […] Tres. Tipo de gravamen aplicable en la adquisición de vivienda habitual por discapacitados y en la constitución de préstamos hipotecarios destinados a su financiación. […] Que en la fecha de devengo del impuesto el adquirente sea una persona discapacitada física, psíquica o sensorial con un grado de minusvalía igual o superior al 65% y destine el inmueble adquirido a su vivienda habitual."
      },
      {
        "id": "galicia-ajd-large-family",
        "tax": "ajd",
        "label": {
          "es": "Familia numerosa, vivienda habitual de hasta 400.000 €",
          "ca": "Família nombrosa, habitatge habitual de fins a 400.000 €",
          "en": "Large family, main home up to €400,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.5
        },
        "conditions": {
          "habitual": true,
          "largeFamily": true,
          "maxValue": 400000
        },
        "extra": {
          "es": "Precio y patrimonio de la familia hasta 400.000 € (+50.000 € por miembro por encima del mínimo).",
          "ca": "Preu i patrimoni de la família fins a 400.000 € (+50.000 € per membre per sobre del mínim).",
          "en": "Price and family wealth up to €400,000 (+€50,000 per member above the minimum)."
        },
        "article": "art. 15.Cuatro",
        "quote": "documentados, el tipo de gravamen aplicable en las primeras copias de escrituras que documenten la adquisición de vivienda habitual del contribuyente o la constitución de préstamos o créditos hipotecarios destinados a su financiación será del 0,5%, siempre que se cumplan los requisitos siguientes: […] Cuatro. Tipo de gravamen para la adquisición de vivienda habitual por familias numerosas y la constitución de préstamos hipotecarios destinados a su financiación. […] Que ni el precio de adquisición de la vivienda ni la suma del patrimonio de todos los miembros de la familia numerosa exceda la cifra de 400.000 euros, más 50.000 euros adicionales por cada miembro superior al mínimo para obtener la condición de familia numerosa."
      },
      {
        "id": "galicia-ajd-young",
        "tax": "ajd",
        "label": {
          "es": "Menores de 36 años, vivienda habitual de hasta 240.000 €",
          "ca": "Menors de 36 anys, habitatge habitual de fins a 240.000 €",
          "en": "Under 36, main home up to €240,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.5
        },
        "conditions": {
          "habitual": true,
          "maxAge": 35,
          "maxValue": 240000
        },
        "extra": {
          "es": "Ni el precio ni el patrimonio de los compradores y su familia pueden superar 240.000 € (+30.000 € por cada miembro más). Con varios compradores, solo la parte de quien cumple.",
          "ca": "Ni el preu ni el patrimoni dels compradors i la seva família poden superar 240.000 € (+30.000 € per cada membre més). Amb diversos compradors, només la part de qui compleix.",
          "en": "Neither the price nor the buyers' and family's wealth may exceed €240,000 (+€30,000 per extra member). With several buyers, only the share of whoever qualifies."
        },
        "article": "art. 15.Cinco",
        "quote": "documentados, el tipo de gravamen aplicable en las primeras copias de escrituras que documenten la adquisición de la vivienda habitual del contribuyente o la constitución de préstamos o créditos hipotecarios destinados a su financiación será del 0,5%, siempre que se cumplan los requisitos siguientes: […] Cinco. Tipo de gravamen aplicable en la adquisición de vivienda habitual por menores de treinta y seis años y la constitución de préstamos hipotecarios destinados a su financiación. […] Que en la fecha de devengo del impuesto el adquirente tenga una edad inferior a treinta y seis años."
      },
      {
        "id": "galicia-ajd-gender-violence",
        "tax": "ajd",
        "label": {
          "es": "Víctimas de violencia de género, vivienda habitual de hasta 240.000 €",
          "ca": "Víctimes de violència de gènere, habitatge habitual de fins a 240.000 €",
          "en": "Gender-violence victims, main home up to €240,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.5
        },
        "conditions": {
          "habitual": true,
          "maxValue": 240000
        },
        "extra": null,
        "manual": true,
        "article": "art. 15.Ocho",
        "quote": "el tipo aplicable en las primeras copias de escrituras que documenten la adquisición de la vivienda habitual del contribuyente o la constitución de préstamos o créditos hipotecarios destinados a su financiación será del 0,5 %, siempre que se cumplan los siguientes requisitos: […] Que en la fecha de devengo del impuesto el adquirente se encuentre en alguna de las situaciones de violencia de género descritas en la Ley 11/2007"
      },
      {
        "id": "galicia-ajd-single-parent",
        "tax": "ajd",
        "label": {
          "es": "Familias monoparentales, vivienda habitual",
          "ca": "Famílies monoparentals, habitatge habitual",
          "en": "Single-parent families, main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.5
        },
        "conditions": {
          "habitual": true,
          "maxValue": 240000
        },
        "extra": null,
        "manual": true,
        "article": "art. 15.Nueve",
        "quote": "Nueve. Tipo de gravamen para la adquisición de vivienda habitual por parte de familias monoparentales. […] el tipo de gravamen aplicable a las transmisiones de inmuebles que vayan a constituir la vivienda habitual del contribuyente será del 0,5 %, siempre que este cumpla los requisitos siguientes:"
      },
      {
        "id": "galicia-ajd-rural-deduction",
        "tax": "ajd",
        "label": {
          "es": "Deducción del 100 % para los colectivos del 0,5 % en parroquias rurales",
          "ca": "Deducció del 100 % per als col·lectius del 0,5 % en parròquies rurals",
          "en": "100% deduction for the 0.5% groups in rural parishes"
        },
        "bonusPercent": 100,
        "conditions": {
          "habitual": true
        },
        "extra": {
          "es": "Solo en parroquias rurales o poco pobladas (orden de la Consellería de Facenda).",
          "ca": "Només en parròquies rurals o poc poblades (ordre de la Conselleria de Facenda).",
          "en": "Only in rural or sparsely populated parishes (Galician finance department order)."
        },
        "manual": true,
        "article": "art. 17.Ocho",
        "quote": "Los contribuyentes que tengan derecho a aplicar los tipos de gravamen reducidos regulados en los apartados tres, cuatro, cinco, ocho y nueve del artículo 15 tendrán derecho a una deducción en la cuota del 100 % siempre que la vivienda se encuentre en alguna de las parroquias que tengan la consideración de zonas poco pobladas o áreas rurales."
      }
    ],
    "newHome": {
      "name": "IVA",
      "general": 10,
      "protected": 4,
      "protectedLabel": {
        "es": "VPO de régimen especial o de promoción pública vendida por el promotor",
        "ca": "HPO de règim especial o de promoció pública venuda pel promotor",
        "en": "special-regime or public-promotion VPO sold by the developer"
      },
      "article": "Ley 37/1992, art. 91",
      "quote": "",
      "law": null
    },
    "notes": []
  },
  {
    "id": "gipuzkoa",
    "name": {
      "es": "Gipuzkoa",
      "ca": "Guipúscoa",
      "en": "Gipuzkoa"
    },
    "regime": "foral",
    "status": "sourced",
    "law": {
      "title": "Norma Foral 18/1987, de 30 de diciembre, del Impuesto sobre Transmisiones Patrimoniales y Actos Jurídicos Documentados (Territorio Histórico de Gipuzkoa)",
      "short": "NF 18/1987 (Gipuzkoa)",
      "url": "https://www.gipuzkoa.eus/documents/2456431/2854433/NF+18-1987+(2025).pdf/fd85880e-c8c0-641d-eead-3869889f88ad?t=1747374492563",
      "consolidatedAsOf": "2026-04-20",
      "readOn": "2026-11-13"
    },
    "amendments": [
      {
        "title": "Norma Foral 1/2025, de 9 de mayo, de reforma del sistema tributario (BOG 15/05/2025)",
        "url": "https://www.gipuzkoa.eus/documents/2456431/2854433/NF+18-1987+(2025).pdf/fd85880e-c8c0-641d-eead-3869889f88ad?t=1747374492563"
      }
    ],
    "taxAgency": {
      "name": "Hacienda Foral de Gipuzkoa (Departamento de Hacienda y Finanzas, Diputación Foral de Gipuzkoa)",
      "url": "https://www.gipuzkoa.eus/es/web/ogasuna/impuestos/transmisiones-patrimoniales-ajd"
    },
    "itp": {
      "general": {
        "kind": "flat",
        "rate": 4
      },
      "article": "art. 11.1.b)",
      "quote": "a)26 El 7 por 100 si se trata de transmisión de bienes inmuebles, así como la […] b)27 No obstante lo dispuesto en la letra anterior, la transmisión de viviendas en […] general, excepto las señaladas en la letra siguiente, tributarán al 4 por 100"
    },
    "ajd": {
      "general": {
        "kind": "flat",
        "rate": 0.5
      },
      "article": "art. 29.2",
      "quote": "tipo de gravamen del 0,5 por 100, en cuanto a tales actos o contratos. Por el"
    },
    "benefits": [
      {
        "id": "gipuzkoa-itp-small",
        "tax": "itp",
        "label": {
          "es": "Vivienda de hasta 120 m² construidos, vivienda habitual",
          "ca": "Habitatge de fins a 120 m² construïts, habitatge habitual",
          "en": "Home up to 120 m² built, main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 2.5
        },
        "conditions": {
          "habitual": true
        },
        "extra": {
          "es": "Vivienda habitual (acreditarla en 12 meses) y no tener más del 25 % de otra vivienda en el mismo municipio (salvo venderla en 2 años).",
          "ca": "Habitatge habitual (acreditar-lo en 12 mesos) i no tenir més del 25 % d'un altre habitatge al mateix municipi (llevat de vendre'l en 2 anys).",
          "en": "Main home (proved within 12 months) and owning no more than 25% of another home in the same municipality (unless sold within 2 years)."
        },
        "manual": true,
        "article": "art. 11.1.c)",
        "quote": "c)28 No obstante lo dispuesto en las dos letras anteriores, la transmisión de […] — Transmisión de viviendas cuya superficie construida no sea superior a 120 […] metros cuadrados o 96 metros cuadrados útiles. […] Para la aplicación del tipo del 2,5 por 100 será preciso reunir los siguientes […] a') Que la parte adquirente no sea propietaria de otra vivienda en un porcentaje […] superior al 25 por 100 dentro del término municipal en que radique la vivienda […] b') Que la vivienda se destine a vivienda habitual de la parte adquirente en los"
      },
      {
        "id": "gipuzkoa-itp-large-family",
        "tax": "itp",
        "label": {
          "es": "Familia numerosa, vivienda habitual",
          "ca": "Família nombrosa, habitatge habitual",
          "en": "Large family, main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 2.5
        },
        "conditions": {
          "habitual": true,
          "largeFamily": true
        },
        "extra": {
          "es": "Vivienda habitual (acreditarla en 12 meses) y no tener más del 25 % de otra vivienda en el mismo municipio (salvo venderla en 2 años).",
          "ca": "Habitatge habitual (acreditar-lo en 12 mesos) i no tenir més del 25 % d'un altre habitatge al mateix municipi (llevat de vendre'l en 2 anys).",
          "en": "Main home (proved within 12 months) and owning no more than 25% of another home in the same municipality (unless sold within 2 years)."
        },
        "article": "art. 11.1.c)",
        "quote": "al 2,5 por 100 cuando la parte adquirente sea titular de familia numerosa o en los"
      },
      {
        "id": "gipuzkoa-itp-vpp",
        "tax": "itp",
        "label": {
          "es": "Vivienda de protección pública: primera transmisión en 6 años (exenta)",
          "ca": "Habitatge de protecció pública: primera transmissió en 6 anys (exempta)",
          "en": "Protected housing: first transfer within 6 years (exempt)"
        },
        "rate": {
          "kind": "flat",
          "rate": 0
        },
        "conditions": {
          "protected": true
        },
        "extra": null,
        "manual": true,
        "article": "art. 41.I.B).12",
        "quote": "transmisión «inter vivos» del dominio de las viviendas de protección pública, […] siempre que tengan lugar dentro de los seis años siguientes a la fecha de su"
      },
      {
        "id": "gipuzkoa-ajd-first-delivery",
        "tax": "ajd",
        "label": {
          "es": "Primera transmisión de una vivienda (vivienda nueva): exenta",
          "ca": "Primera transmissió d'un habitatge (habitatge nou): exempta",
          "en": "First transfer of a home (new home): exempt"
        },
        "rate": {
          "kind": "flat",
          "rate": 0
        },
        "conditions": {},
        "extra": null,
        "article": "art. 41.I.B).11",
        "quote": "Las primeras copias de escrituras notariales que documenten la primera […] transmisión de viviendas, en lo que se refiere al tipo de gravamen de la"
      }
    ],
    "newHome": {
      "name": "IVA",
      "general": 10,
      "protected": 4,
      "protectedLabel": {
        "es": "VPO de régimen especial o de promoción pública vendida por el promotor",
        "ca": "HPO de règim especial o de promoció pública venuda pel promotor",
        "en": "special-regime or public-promotion VPO sold by the developer"
      },
      "article": "Concierto Económico, art. 26 (IVA estatal: Ley 37/1992, art. 91)",
      "quote": "El Impuesto sobre el Valor Añadido es un tributo concertado que se regirá por las mismas normas sustantivas y formales establecidas en cada momento por el Estado.",
      "law": {
        "title": "Ley 12/2002, de 23 de mayo, por la que se aprueba el Concierto Económico con la Comunidad Autónoma del País Vasco",
        "short": "Concierto Económico (Ley 12/2002)",
        "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-9969",
        "consolidatedAsOf": "2025-04-30",
        "readOn": "2026-11-13"
      }
    },
    "notes": [
      {
        "es": "Vivienda usada: 4 %, o 6 % si el comprador tiene más de 5 viviendas (el 7 % es para inmuebles que no son vivienda). La vivienda nueva paga IVA y su primera transmisión está exenta de AJD.",
        "ca": "Habitatge usat: 4 %, o 6 % si el comprador té més de 5 habitatges (el 7 % és per a immobles que no són habitatge). L'habitatge nou paga IVA i la primera transmissió està exempta d'AJD.",
        "en": "Resale home: 4%, or 6% if the buyer owns more than 5 homes (7% is for non-residential property). A new home pays IVA and its first transfer is exempt from AJD."
      }
    ]
  },
  {
    "id": "la-rioja",
    "name": {
      "es": "La Rioja",
      "ca": "La Rioja",
      "en": "La Rioja"
    },
    "regime": "common",
    "status": "sourced",
    "law": {
      "title": "Ley 10/2017, de 27 de octubre, por la que se consolidan las disposiciones legales de la Comunidad Autónoma de La Rioja en materia de impuestos propios y tributos cedidos.",
      "short": "Ley 10/2017",
      "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2017-13750",
      "consolidatedAsOf": "2026-10-29",
      "readOn": "2026-11-13"
    },
    "amendments": [
      {
        "title": "Ley 1/2025, de 28 de febrero (La Rioja)",
        "url": "https://www.boe.es/buscar/doc.php?id=BOE-A-2025-5052"
      },
      {
        "title": "Ley 6/2024, de 27 de diciembre, de Medidas Fiscales y Administrativas para el año 2025",
        "url": "https://www.boe.es/buscar/doc.php?id=BOE-A-2025-1480"
      }
    ],
    "taxAgency": {
      "name": "Dirección General de Tributos del Gobierno de La Rioja",
      "url": "https://www.larioja.org/hacienda/es"
    },
    "itp": {
      "general": {
        "kind": "flat",
        "rate": 7
      },
      "article": "art. 44.1",
      "quote": "Se aplicará el tipo de gravamen del 7% en las transmisiones de bienes inmuebles, así como en la constitución y la cesión de derechos reales que recaigan sobre los mismos, excepto los derechos reales de garantía."
    },
    "ajd": {
      "general": {
        "kind": "flat",
        "rate": 1
      },
      "article": "art. 48",
      "quote": "tributarán, además de por la cuota fija prevista en el artículo 31.1 de dicha norma, al tipo de gravamen del 1% en cuanto a tales actos o contratos."
    },
    "benefits": [
      {
        "id": "la-rioja-itp-young",
        "tax": "itp",
        "label": {
          "es": "Menores de 40 años, primera vivienda habitual",
          "ca": "Menors de 40 anys, primer habitatge habitual",
          "en": "Under 40, first main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 4
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "maxAge": 39
        },
        "extra": {
          "es": "Habitarla en 12 meses y residir al menos 3 años. Con varios compradores, solo la parte de quien cumple.",
          "ca": "Habitar-lo en 12 mesos i residir-hi almenys 3 anys. Amb diversos compradors, només la part de qui compleix.",
          "en": "Move in within 12 months and live there at least 3 years. With several buyers, only the share of whoever qualifies."
        },
        "article": "art. 45.3",
        "quote": "El tipo de gravamen aplicable a las adquisiciones de viviendas que vayan a constituir la primera vivienda habitual de jóvenes menores de 40 años de edad en la fecha de dicha adquisición será del 4 %. […] En los casos de solidaridad tributaria, el tipo de gravamen reducido se aplicará, exclusivamente, a la parte proporcional de la base liquidable que se corresponda con la adquisición efectuada por el sujeto pasivo que cumpla los requisitos antes mencionados."
      },
      {
        "id": "la-rioja-itp-young-small",
        "tax": "itp",
        "label": {
          "es": "Menores de 40 años, primera vivienda habitual en pequeños municipios (anexo I)",
          "ca": "Menors de 40 anys, primer habitatge habitual en petits municipis (annex I)",
          "en": "Under 40, first main home in small municipalities (annex I)"
        },
        "rate": {
          "kind": "flat",
          "rate": 3
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "maxAge": 39
        },
        "extra": {
          "es": "Habitarla en 12 meses y residir al menos 3 años. Con varios compradores, solo la parte de quien cumple.",
          "ca": "Habitar-lo en 12 mesos i residir-hi almenys 3 anys. Amb diversos compradors, només la part de qui compleix.",
          "en": "Move in within 12 months and live there at least 3 years. With several buyers, only the share of whoever qualifies."
        },
        "manual": true,
        "article": "art. 45.3",
        "quote": "No obstante, cuando la adquisición de la primera vivienda habitual por los contribuyentes antes mencionados tenga lugar en alguno de los municipios relacionados en el anexo I de esta ley, el tipo de gravamen aplicable será del 3 %."
      },
      {
        "id": "la-rioja-itp-large-family",
        "tax": "itp",
        "label": {
          "es": "Familia numerosa, vivienda habitual",
          "ca": "Família nombrosa, habitatge habitual",
          "en": "Large family, main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 5
        },
        "conditions": {
          "habitual": true,
          "largeFamily": true
        },
        "extra": {
          "es": "Habitarla en 12 meses y residir al menos 3 años. Con varios compradores, solo la parte de quien cumple.",
          "ca": "Habitar-lo en 12 mesos i residir-hi almenys 3 anys. Amb diversos compradors, només la part de qui compleix.",
          "en": "Move in within 12 months and live there at least 3 years. With several buyers, only the share of whoever qualifies."
        },
        "article": "art. 45.1",
        "quote": "el tipo de gravamen aplicable a las adquisiciones de bienes inmuebles que vayan a constituir la vivienda habitual de familias que tengan la consideración legal de numerosas según la normativa aplicable será del 5% con carácter general."
      },
      {
        "id": "la-rioja-itp-large-family-low",
        "tax": "itp",
        "label": {
          "es": "Familia numerosa que crece, renta hasta 30.600 €",
          "ca": "Família nombrosa que creix, renda fins a 30.600 €",
          "en": "Growing large family, income up to €30,600"
        },
        "rate": {
          "kind": "flat",
          "rate": 3
        },
        "conditions": {
          "habitual": true,
          "largeFamily": true
        },
        "extra": null,
        "manual": true,
        "article": "art. 45.1",
        "quote": "No obstante, se aplicará el tipo del 3% siempre que se cumplan los siguientes requisitos: […] Que la adquisición tenga lugar dentro de los cinco años siguientes a la fecha en que la familia del sujeto pasivo haya alcanzado la consideración legal de numerosa o, si ya lo fuere con anterioridad, en el plazo de los cinco años siguientes al nacimiento o adopción de cada hijo. […] Que la superficie útil de la vivienda adquirida sea superior en más de un 10% a la superficie útil de la anterior vivienda habitual, si la hubiere. […] Que la suma de las bases imponibles en el impuesto sobre la renta de las personas físicas de todas las personas que vayan a habitar la vivienda, tras la aplicación del mínimo personal y familiar, no exceda de 30.600 euros."
      },
      {
        "id": "la-rioja-itp-disability",
        "tax": "itp",
        "label": {
          "es": "Discapacidad del 33 % o más, vivienda habitual",
          "ca": "Discapacitat del 33 % o més, habitatge habitual",
          "en": "Disability of 33% or more, main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 5
        },
        "conditions": {
          "habitual": true,
          "disabilityMin": 33
        },
        "extra": {
          "es": "Habitarla en 12 meses y residir al menos 3 años. Con varios compradores, solo la parte de quien cumple.",
          "ca": "Habitar-lo en 12 mesos i residir-hi almenys 3 anys. Amb diversos compradors, només la part de qui compleix.",
          "en": "Move in within 12 months and live there at least 3 years. With several buyers, only the share of whoever qualifies."
        },
        "article": "art. 45.4",
        "quote": "Se aplicará el tipo de gravamen del 5% a las adquisiciones de viviendas que vayan a constituir la vivienda habitual de quienes tengan la consideración legal de personas con discapacidad, con un grado igual o superior al 33 %"
      },
      {
        "id": "la-rioja-itp-protected",
        "tax": "itp",
        "label": {
          "es": "VPO, primera vivienda habitual",
          "ca": "HPO, primer habitatge habitual",
          "en": "VPO, first main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 5
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "protected": true
        },
        "extra": {
          "es": "Base liquidable general del IRPF hasta 18.030 € (30.050 € en conjunta) y del ahorro hasta 1.800 €.",
          "ca": "Base liquidable general de l'IRPF fins a 18.030 € (30.050 € en conjunta) i de l'estalvi fins a 1.800 €.",
          "en": "General IRPF taxable base up to €18,030 (€30,050 joint) and savings base up to €1,800."
        },
        "article": "art. 45.2",
        "quote": "El tipo de gravamen aplicable a las transmisiones de viviendas de protección oficial, siempre que constituyan o vayan a constituir la primera vivienda habitual del adquirente, será del 5 %. […] no exceda de 18.030 euros en tributación individual o de 30.050 euros en tributación conjunta, siempre que la base liquidable del ahorro sometida a tributación, definida en el artículo 50 antes mencionado, no supere los 1.800 euros."
      },
      {
        "id": "la-rioja-ajd-large-family",
        "tax": "ajd",
        "label": {
          "es": "Familia numerosa, vivienda habitual",
          "ca": "Família nombrosa, habitatge habitual",
          "en": "Large family, main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.1
        },
        "conditions": {
          "habitual": true,
          "largeFamily": true
        },
        "extra": null,
        "article": "art. 49.1",
        "quote": "se aplicará el tipo de gravamen reducido del 0,1 % en las adquisiciones de vivienda para destinarla a vivienda habitual por parte de los sujetos pasivos que, en el momento de producirse el hecho imponible, cumplan cualquiera de los siguientes requisitos: […] Familias que tengan la consideración legal de numerosas según la normativa aplicable."
      },
      {
        "id": "la-rioja-ajd-disability",
        "tax": "ajd",
        "label": {
          "es": "Discapacidad del 33 % o más, vivienda habitual",
          "ca": "Discapacitat del 33 % o més, habitatge habitual",
          "en": "Disability of 33% or more, main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.1
        },
        "conditions": {
          "habitual": true,
          "disabilityMin": 33
        },
        "extra": null,
        "article": "art. 49.1",
        "quote": "se aplicará el tipo de gravamen reducido del 0,1 % en las adquisiciones de vivienda para destinarla a vivienda habitual por parte de los sujetos pasivos que, en el momento de producirse el hecho imponible, cumplan cualquiera de los siguientes requisitos: […] Familias que tengan la consideración legal de numerosas según la normativa aplicable."
      }
    ],
    "newHome": {
      "name": "IVA",
      "general": 10,
      "protected": 4,
      "protectedLabel": {
        "es": "VPO de régimen especial o de promoción pública vendida por el promotor",
        "ca": "HPO de règim especial o de promoció pública venuda pel promotor",
        "en": "special-regime or public-promotion VPO sold by the developer"
      },
      "article": "Ley 37/1992, art. 91",
      "quote": "",
      "law": null
    },
    "notes": []
  },
  {
    "id": "madrid",
    "name": {
      "es": "Comunidad de Madrid",
      "ca": "Comunitat de Madrid",
      "en": "Madrid region"
    },
    "regime": "common",
    "status": "sourced",
    "law": {
      "title": "Decreto Legislativo 1/2010, de 21 de octubre, del Consejo de Gobierno, por el que se aprueba el Texto Refundido de las Disposiciones Legales de la Comunidad de Madrid en materia de Tributos Cedidos por el Estado",
      "short": "Decreto Legislativo 1/2010",
      "url": "https://www.boe.es/buscar/act.php?id=BOCM-m-2010-90068",
      "consolidatedAsOf": "2026-07-10",
      "readOn": "2026-11-13"
    },
    "amendments": [
      {
        "title": "Ley 5/2024, de 20 de noviembre (Comunidad de Madrid)",
        "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2025-3303"
      },
      {
        "title": "Ley 5/2026, de 7 de julio (Comunidad de Madrid)",
        "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2026-18283"
      }
    ],
    "taxAgency": {
      "name": "Dirección General de Tributos de la Comunidad de Madrid",
      "url": "https://www.comunidad.madrid/transparencia/direccion-general-tributos"
    },
    "itp": {
      "general": {
        "kind": "flat",
        "rate": 6
      },
      "article": "art. 28",
      "quote": "Con carácter general, en la transmisión de inmuebles, así como en la constitución y en la cesión de derechos reales que recaigan sobre los mismos, excepto en los derechos reales de garantía, se aplicará el tipo del 6 por 100."
    },
    "ajd": {
      "general": {
        "kind": "scale",
        "how": "whole",
        "brackets": [
          {
            "upTo": 120000,
            "rate": 0.4
          },
          {
            "upTo": 180000,
            "rate": 0.5
          },
          {
            "upTo": null,
            "rate": 0.75
          }
        ]
      },
      "article": "art. 32.1 b), c), d), art. 36 y art. 37",
      "quote": "Los tipos aplicables a las primeras copias de escrituras y actas notariales que documenten transmisiones de viviendas cuando el adquirente sea persona física serán los siguientes: […] b) Se aplicará el tipo del 0,4 por 100 cuando se transmitan viviendas cuyo valor real sea igual o inferior a 120.000 euros. […] c) Se aplicará el tipo del 0,5 por 100 cuando se transmitan viviendas cuyo valor real sea igual o inferior a 180.000 euros y superior a 120.000 euros. […] d) Se aplicará el tipo del 0,75 por 100 cuando se transmitan viviendas cuyo valor real sea superior a 180.000 euros. […] En la determinación del valor real de la vivienda transmitida se incluirán los anejos y plazas de garaje que se transmitan conjuntamente con aquella, aun cuando constituyan fincas registrales independientes. […] Se aplicará el tipo del 0,75 por 100 en las primeras copias de escrituras y actas notariales que documenten actos o contratos distintos de los recogidos en los artículos anteriores de esta Subsección. […] Cuando de la aplicación de los tipos de gravamen regulados en los artículos 32 y 33 anteriores resulte que a un incremento de la base imponible corresponde una porción de cuota superior a dicho incremento, se reducirá la cuota resultante en la cuantía del exceso."
    },
    "benefits": [
      {
        "id": "madrid-itp-large-family",
        "tax": "itp",
        "label": {
          "es": "Familia numerosa, vivienda habitual",
          "ca": "Família nombrosa, habitatge habitual",
          "en": "Large family, main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 4
        },
        "conditions": {
          "habitual": true,
          "largeFamily": true
        },
        "extra": {
          "es": "Vender la anterior vivienda habitual de la familia en los 2 años antes o después; vivir en ella en 12 meses y 3 años.",
          "ca": "Vendre l'anterior habitatge habitual de la família en els 2 anys abans o després; viure-hi en 12 mesos i 3 anys.",
          "en": "Sell the family's previous main home within 2 years before or after; move in within 12 months, stay 3 years."
        },
        "article": "art. 29 y disposición adicional tercera",
        "quote": "Se aplicará el tipo impositivo reducido del 4 por 100 a la transmisión de un inmueble que vaya a constituir la vivienda habitual de una familia numerosa […] a) Que el sujeto pasivo sea titular de una familia numerosa. […] c) Que, en el supuesto de que la anterior vivienda habitual fuera propiedad de alguno de los titulares de la familia numerosa, la misma se venda en el plazo de dos años anteriores o posteriores a la adquisición de la nueva vivienda habitual. […] Los beneficios fiscales para familias numerosas establecidos en los artículos 29, 32 y 38 ter serán también aplicables a las familias asimiladas a familia numerosa conforme a la normativa de la Comunidad de Madrid."
      },
      {
        "id": "madrid-itp-habitual-250k",
        "tax": "itp",
        "label": {
          "es": "Bonificación del 10 %: vivienda habitual de hasta 250.000 €",
          "ca": "Bonificació del 10 %: habitatge habitual de fins a 250.000 €",
          "en": "10% rebate: main home up to €250,000"
        },
        "bonusPercent": 10,
        "conditions": {
          "habitual": true,
          "maxValue": 250000
        },
        "extra": {
          "es": "Vivir en ella en 12 meses y al menos 3 años seguidos. Incompatible con el tipo de familia numerosa.",
          "ca": "Viure-hi en 12 mesos i almenys 3 anys seguits. Incompatible amb el tipus de família nombrosa.",
          "en": "Move in within 12 months and stay at least 3 years. Not combinable with the large-family rate."
        },
        "article": "art. 30 bis",
        "quote": "Las personas físicas que adquieran un inmueble que vaya a constituir su vivienda habitual podrán aplicar una bonificación del 10 por ciento de la cuota tributaria […] La bonificación será aplicable, exclusivamente, cuando el valor del inmueble adquirido sea igual o inferior a 250.000 euros. […] En la determinación del valor de la vivienda adquirida se incluirán los anejos y plazas de garaje que se transmitan conjuntamente con aquella, aun cuando constituyan fincas registrales independientes. […] La bonificación contenida en este artículo será incompatible con la aplicación del tipo impositivo a que se refiere el artículo 29."
      },
      {
        "id": "madrid-itp-young-small-town",
        "tax": "itp",
        "label": {
          "es": "Bonificación del 100 %: menores de 35 en municipios de menos de 2.500 habitantes, hasta 250.000 €",
          "ca": "Bonificació del 100 %: menors de 35 en municipis de menys de 2.500 habitants, fins a 250.000 €",
          "en": "100% rebate: under 35 in towns under 2,500 people, up to €250,000"
        },
        "bonusPercent": 100,
        "conditions": {
          "habitual": true,
          "maxAge": 34,
          "maxValue": 250000
        },
        "extra": {
          "es": "Vivir en ella en 12 meses y al menos 3 años seguidos. Incompatible con el tipo de familia numerosa.",
          "ca": "Viure-hi en 12 mesos i almenys 3 anys seguits. Incompatible amb el tipus de família nombrosa.",
          "en": "Move in within 12 months and stay at least 3 years. Not combinable with the large-family rate."
        },
        "manual": true,
        "article": "art. 30 bis.1",
        "quote": "La bonificación será del 100 por cien cuando la vivienda habitual sea adquirida por un contribuyente menor de 35 años y esté situada en un municipio con una población inferior a los 2.500 habitantes a 1 de enero del ejercicio anterior al del devengo de la bonificación, de acuerdo con los datos publicados por el INE."
      },
      {
        "id": "madrid-ajd-protected",
        "tax": "ajd",
        "label": {
          "es": "Vivienda de protección pública de hasta 90 m² útiles",
          "ca": "Habitatge de protecció pública de fins a 90 m² útils",
          "en": "Protected housing up to 90 m² usable"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.2
        },
        "conditions": {
          "protected": true
        },
        "extra": {
          "es": "Hasta 90 m² útiles (más para familia numerosa) y sin la exención del impuesto.",
          "ca": "Fins a 90 m² útils (més per a família nombrosa) i sense l'exempció de l'impost.",
          "en": "Up to 90 m² usable (more for large families) and not exempt from the tax."
        },
        "article": "art. 32.1 a)",
        "quote": "a) Se aplicará el tipo del 0,2 por 100 cuando se transmitan viviendas de protección pública reguladas en la Ley 6/1997, de 8 de enero, de Protección Pública a la Vivienda de la Comunidad de Madrid, con una superficie útil máxima de 90 metros cuadrados, que no cumplan los requisitos para gozar de la exención en esta modalidad del Impuesto."
      },
      {
        "id": "madrid-ajd-habitual-250k",
        "tax": "ajd",
        "label": {
          "es": "Bonificación del 10 %: vivienda habitual de hasta 250.000 €",
          "ca": "Bonificació del 10 %: habitatge habitual de fins a 250.000 €",
          "en": "10% rebate: main home up to €250,000"
        },
        "bonusPercent": 10,
        "conditions": {
          "habitual": true,
          "maxValue": 250000
        },
        "extra": {
          "es": "Vivir en ella en 12 meses y al menos 3 años. Incompatible con la bonificación de familia numerosa.",
          "ca": "Viure-hi en 12 mesos i almenys 3 anys. Incompatible amb la bonificació de família nombrosa.",
          "en": "Move in within 12 months and stay 3 years. Not combinable with the large-family rebate."
        },
        "article": "art. 38 bis",
        "quote": "podrán aplicar una bonificación del 10 por cien de la cuota tributaria gradual en la modalidad de «Actos Jurídicos Documentados» derivada de las primeras copias de escrituras que documenten tales adquisiciones. […] La bonificación contenida en este artículo será incompatible con la aplicación de la bonificación establecida en el artículo 38 ter."
      },
      {
        "id": "madrid-ajd-young-small-town",
        "tax": "ajd",
        "label": {
          "es": "Bonificación del 100 %: menores de 35 en municipios de menos de 2.500 habitantes, hasta 250.000 €",
          "ca": "Bonificació del 100 %: menors de 35 en municipis de menys de 2.500 habitants, fins a 250.000 €",
          "en": "100% rebate: under 35 in towns under 2,500 people, up to €250,000"
        },
        "bonusPercent": 100,
        "conditions": {
          "habitual": true,
          "maxAge": 34,
          "maxValue": 250000
        },
        "extra": null,
        "manual": true,
        "article": "art. 38 bis.1",
        "quote": "La bonificación será del 100 por cien cuando la vivienda habitual sea adquirida por un contribuyente menor de 35 años y esté situada en un municipio con una población inferior a los 2.500 habitantes a 1 de enero del ejercicio anterior al del devengo de la bonificación, de acuerdo con los datos publicados por el INE. […] Las personas físicas que adquieran un inmueble que vaya a constituir su vivienda habitual podrán aplicar una bonificación del 10 por cien de la cuota tributaria gradual"
      },
      {
        "id": "madrid-ajd-large-family",
        "tax": "ajd",
        "label": {
          "es": "Bonificación del 95 %: familia numerosa, vivienda habitual",
          "ca": "Bonificació del 95 %: família nombrosa, habitatge habitual",
          "en": "95% rebate: large family, main home"
        },
        "bonusPercent": 95,
        "conditions": {
          "habitual": true,
          "largeFamily": true
        },
        "extra": {
          "es": "Vender la anterior vivienda habitual en los 2 años antes o después; vivir en ella en 12 meses y 3 años.",
          "ca": "Vendre l'anterior habitatge habitual en els 2 anys abans o després; viure-hi en 12 mesos i 3 anys.",
          "en": "Sell the previous main home within 2 years before or after; move in within 12 months, stay 3 years."
        },
        "article": "art. 38 ter",
        "quote": "Los sujetos pasivos que sean titulares de una familia numerosa y que adquieran inmuebles que vayan a constituir su vivienda habitual aplicarán una bonificación del 95 por 100 de la cuota tributaria gradual en la modalidad de «Actos Jurídicos Documentados» derivada de la primera copia de escrituras que documenten tales adquisiciones. […] La bonificación contenida en este artículo será incompatible con la aplicación de la bonificación establecida en el artículo 38 bis de esta ley."
      }
    ],
    "newHome": {
      "name": "IVA",
      "general": 10,
      "protected": 4,
      "protectedLabel": {
        "es": "VPO de régimen especial o de promoción pública vendida por el promotor",
        "ca": "HPO de règim especial o de promoció pública venuda pel promotor",
        "en": "special-regime or public-promotion VPO sold by the developer"
      },
      "article": "Ley 37/1992, art. 91",
      "quote": "",
      "law": null
    },
    "notes": [
      {
        "es": "AJD de vivienda nueva comprada por una persona física: un solo tipo sobre todo el valor según el tramo (0,4 % hasta 120.000 €, 0,5 % hasta 180.000 €, 0,75 % por encima), con la regla del art. 37 en los saltos de tramo.",
        "ca": "AJD d'habitatge nou comprat per una persona física: un sol tipus sobre tot el valor segons el tram (0,4 % fins a 120.000 €, 0,5 % fins a 180.000 €, 0,75 % per sobre), amb la regla de l'art. 37 als salts de tram.",
        "en": "AJD on a new home bought by an individual: one rate on the whole value by bracket (0.4% up to €120,000, 0.5% up to €180,000, 0.75% above), with the art. 37 rule at bracket jumps."
      }
    ]
  },
  {
    "id": "melilla",
    "name": {
      "es": "Melilla",
      "ca": "Melilla",
      "en": "Melilla"
    },
    "regime": "ceuta-melilla",
    "status": "sourced",
    "law": {
      "title": "Real Decreto Legislativo 1/1993, de 24 de septiembre, por el que se aprueba el Texto refundido de la Ley del Impuesto sobre Transmisiones Patrimoniales y Actos Jurídicos Documentados",
      "short": "RDLeg 1/1993 (ITPAJD estatal)",
      "url": "https://www.boe.es/buscar/act.php?id=BOE-A-1993-25359",
      "consolidatedAsOf": "2026-03-21",
      "readOn": "2026-11-13"
    },
    "amendments": [
      {
        "title": "Ley 22/2009, de 18 de diciembre (sistema de financiación), art. 66.2",
        "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2009-20375"
      }
    ],
    "taxAgency": {
      "name": "Agencia Estatal de Administración Tributaria (ITP y AJD en Ceuta y Melilla)",
      "url": "https://sede.agenciatributaria.gob.es/"
    },
    "itp": {
      "general": {
        "kind": "flat",
        "rate": 6
      },
      "article": "RDLeg 1/1993, arts. 11.1.a y 57 bis.3.a",
      "quote": "Si la Comunidad Autónoma no hubiese aprobado el tipo a que se refiere el párrafo anterior, se aplicará el 6 por 100 a la transmisión de inmuebles […] 3. Las cuotas derivadas de la aplicación de la modalidad de transmisiones patrimoniales onerosas tendrán derecho a la aplicación de una bonificación del 50 por 100 en los siguientes casos: […] a) Transmisiones y arrendamiento de inmuebles situados en Ceuta o Melilla y constitución o cesión de derechos reales, incluso de garantía sobre los mismos."
    },
    "ajd": {
      "general": {
        "kind": "flat",
        "rate": 0.5
      },
      "article": "RDLeg 1/1993, arts. 31.2 y 57 bis.1",
      "quote": "Si la Comunidad Autónoma no hubiese aprobado el tipo a que se refiere el párrafo anterior, se aplicará el 0,50 por 100, en cuanto a tales actos o contratos. […] 1. La cuota gradual de documentos notariales del gravamen de actos jurídicos documentados se bonificará en un 50 por 100 cuando el Registro en el que se deba proceder a la inscripción o anotación de los bienes o actos radique en Ceuta o Melilla."
    },
    "benefits": [
      {
        "id": "melilla-itp-bonus-50",
        "tax": "itp",
        "label": {
          "es": "Bonificación del 50 %: todo inmueble situado en la ciudad",
          "ca": "Bonificació del 50 %: tot immoble situat a la ciutat",
          "en": "50% rebate: any property in the city"
        },
        "bonusPercent": 50,
        "conditions": {},
        "extra": null,
        "article": "art. 57 bis.3.a) TRLITP",
        "quote": "3. Las cuotas derivadas de la aplicación de la modalidad de transmisiones patrimoniales onerosas tendrán derecho a la aplicación de una bonificación del 50 por 100 en los siguientes casos: […] a) Transmisiones y arrendamiento de inmuebles situados en Ceuta o Melilla y constitución o cesión de derechos reales, incluso de garantía sobre los mismos."
      },
      {
        "id": "melilla-ajd-bonus-50",
        "tax": "ajd",
        "label": {
          "es": "Bonificación del 50 %: Registro de la Propiedad en la ciudad",
          "ca": "Bonificació del 50 %: Registre de la Propietat a la ciutat",
          "en": "50% rebate: Land Registry in the city"
        },
        "bonusPercent": 50,
        "conditions": {},
        "extra": null,
        "article": "art. 57 bis.1 TRLITP",
        "quote": "1. La cuota gradual de documentos notariales del gravamen de actos jurídicos documentados se bonificará en un 50 por 100 cuando el Registro en el que se deba proceder a la inscripción o anotación de los bienes o actos radique en Ceuta o Melilla."
      },
      {
        "id": "melilla-vat-vpo",
        "tax": "vat",
        "label": {
          "es": "IPSI 0,5 %: primera transmisión de VPO por el promotor",
          "ca": "IPSI 0,5 %: primera transmissió d'HPO pel promotor",
          "en": "IPSI 0.5%: first sale of VPO by the developer"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.5
        },
        "conditions": {
          "protected": true
        },
        "extra": null,
        "article": "Anexo 1, TERCERO, 1º",
        "quote": "1º.-Tributarán al tipo del 0,5% la primera transmisión de viviendas calificadas administrativamente como de protección oficial, cuando las entregas se efectúen por los promotores de las mismas, incluidos los garajes y anexos situados en el mismo edificio que se transmitan conjuntamente."
      }
    ],
    "newHome": {
      "name": "IPSI",
      "general": 4,
      "protected": null,
      "protectedLabel": null,
      "article": "Ordenanza fiscal reguladora del IPSI (operaciones interiores) de Melilla, Anexo 1, apartado TERCERO",
      "quote": "TERCERO.- Entrega de Bienes Inmuebles. […] La entrega de Bienes Inmuebles, tributarán al tipo del 4%, con las siguientes excepciones:",
      "law": {
        "title": "Decreto nº 584 de fecha 30 de abril de 2021, relativa a la aprobación definitiva de la modificación de la ordenanza fiscal reguladora del impuesto sobre la producción, los servicios y la importación (operaciones interiores) en la Ciudad de Melilla (BOME núm. 5857, 04/05/2021, pág. 1300)",
        "short": "Ordenanza fiscal del IPSI de Melilla (BOME 5857, 2021)",
        "url": "https://bomemelilla.es/bome/descargar/BOME-B-2021-5857.pdf",
        "consolidatedAsOf": null,
        "readOn": "2026-11-13"
      },
      "agency": {
        "name": "Ciudad Autónoma de Melilla, Consejería de Hacienda (IPSI)",
        "url": "https://www.melilla.es/"
      }
    },
    "notes": [
      {
        "es": "Vivienda usada: ITP estatal del 6 % con una bonificación del 50 % (3 % efectivo), sin tipos reducidos personales. Vivienda nueva: IPSI del 4 % (0,5 % VPO del promotor) según la ordenanza publicada en el BOME núm. 5857 de 4 de mayo de 2021; no hay texto consolidado oficial posterior, así que confírmalo con la Consejería de Hacienda.",
        "ca": "Habitatge usat: ITP estatal del 6 % amb una bonificació del 50 % (3 % efectiu), sense tipus reduïts personals. Habitatge nou: IPSI del 4 % (0,5 % HPO del promotor) segons l'ordenança publicada al BOME núm. 5857 de 4 de maig de 2021; no hi ha text consolidat oficial posterior, de manera que confirma-ho amb la Conselleria d'Hisenda.",
        "en": "Resale home: state ITP of 6% with a 50% rebate (3% effective), no personal reduced rates. New home: 4% IPSI (0.5% for VPO sold by the developer) per the ordinance published in BOME no. 5857 of 4 May 2021; there is no later official consolidated text, so confirm with the city's finance department."
      }
    ]
  },
  {
    "id": "murcia",
    "name": {
      "es": "Región de Murcia",
      "ca": "Regió de Múrcia",
      "en": "Murcia"
    },
    "regime": "common",
    "status": "sourced",
    "law": {
      "title": "Decreto Legislativo 1/2010, de 5 de noviembre, por el que se aprueba el Texto Refundido de las disposiciones legales vigentes en la Región de Murcia en materia de tributos cedidos",
      "short": "Decreto Legislativo 1/2010",
      "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2011-10542",
      "consolidatedAsOf": "2025-07-24",
      "readOn": "2026-11-13"
    },
    "amendments": [
      {
        "title": "Ley 3/2025, de 23 de julio, de Presupuestos Generales de la Comunidad Autónoma de la Región de Murcia para 2025, art. 55",
        "url": "https://www.boe.es/buscar/doc.php?id=BOE-A-2025-16147"
      }
    ],
    "taxAgency": {
      "name": "Agencia Tributaria de la Región de Murcia",
      "url": "https://agenciatributaria.carm.es/"
    },
    "itp": {
      "general": {
        "kind": "flat",
        "rate": 7.75
      },
      "article": "art. 6.1",
      "quote": "1. El tipo de gravamen aplicable a la transmisión de bienes inmuebles que radiquen en la Región de Murcia, con excepción de las viviendas de protección oficial a que se refiere el apartado siguiente, así como la constitución y cesión de derechos reales que recaigan sobre los mismos, salvo los de garantía, será del 7,75 %."
    },
    "ajd": {
      "general": {
        "kind": "flat",
        "rate": 1.5
      },
      "article": "art. 7.1 y 7.8",
      "quote": "tributarán, además de por la cuota fija prevista en el artículo 31.1 de dicha norma, al tipo de gravamen del 1,5 % en cuanto a tales actos o contratos […] 8. Tributarán al tipo de gravamen del 1,5 % los documentos notariales a que se refiere el artículo 31.2 […] en el caso de primeras copias de escrituras públicas otorgadas para formalizar la transmisión de bienes inmuebles sujetas y no exentas al Impuesto sobre el Valor Añadido."
    },
    "benefits": [
      {
        "id": "murcia-itp-vpo-special",
        "tax": "itp",
        "label": {
          "es": "VPO de régimen especial",
          "ca": "HPO de règim especial",
          "en": "Special-regime VPO"
        },
        "rate": {
          "kind": "flat",
          "rate": 4
        },
        "conditions": {
          "protected": true
        },
        "extra": {
          "es": "Solo viviendas de protección oficial de régimen especial.",
          "ca": "Només habitatges de protecció oficial de règim especial.",
          "en": "Special-regime protected housing only."
        },
        "article": "art. 6.2",
        "quote": "2. El tipo de gravamen aplicable a la transmisión, constitución y cesión de derechos reales, con exclusión de los de garantía, de las viviendas calificadas administrativamente de protección oficial de régimen especial, será del 4%."
      },
      {
        "id": "murcia-itp-large-family",
        "tax": "itp",
        "label": {
          "es": "Familia numerosa, primera vivienda habitual de la familia",
          "ca": "Família nombrosa, primer habitatge habitual de la família",
          "en": "Large family, the family's first main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 3
        },
        "conditions": {
          "habitual": true,
          "largeFamily": true
        },
        "extra": {
          "es": "Renta de quienes vivirán en ella por debajo de 44.000 € (+6.000 € por hijo por encima del mínimo). Primera vivienda habitual de la familia, o vender la anterior en ±2 años y que la nueva sea más de un 10 % mayor.",
          "ca": "Renda de qui hi viurà per sota de 44.000 € (+6.000 € per fill per sobre del mínim). Primer habitatge habitual de la família, o vendre l'anterior en ±2 anys i que el nou sigui més d'un 10 % més gran.",
          "en": "Income of those who will live there below €44,000 (+€6,000 per child above the minimum). The family's first main home, or sell the previous one within ±2 years and buy one over 10% larger."
        },
        "article": "art. 6.5 y art. 9",
        "quote": "5. Tributarán al tipo de gravamen del 3% las transmisiones de bienes inmuebles que radiquen en la Región de Murcia por parte de sujetos pasivos que tengan la consideración legal de familia numerosa, con las siguientes condiciones: […] a) Que el inmueble adquirido tenga o vaya a tener la condición de primera vivienda habitual de la familia. […] 2.ª Que la superficie útil de la vivienda adquirida sea superior en más de un 10 por 100 a la superficie útil de la anterior vivienda habitual de la familia. […] b) Que la suma de la base imponible general menos el mínimo personal y familiar de todas las personas que vayan a habitar la vivienda sea inferior a 44.000 euros, límite que se incrementará en 6.000 euros por cada hijo que exceda del mínimo para alcanzar la condición legal de familia numerosa."
      },
      {
        "id": "murcia-itp-young",
        "tax": "itp",
        "label": {
          "es": "40 años o menos, vivienda habitual",
          "ca": "40 anys o menys, habitatge habitual",
          "en": "Aged 40 or under, main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 3
        },
        "conditions": {
          "habitual": true,
          "maxAge": 40
        },
        "extra": {
          "es": "Base imponible general menos el mínimo personal y familiar por debajo de 40.000 € y base del ahorro hasta 1.800 € (último IRPF). Con varios compradores, solo la parte de quien cumple.",
          "ca": "Base imposable general menys el mínim personal i familiar per sota de 40.000 € i base de l'estalvi fins a 1.800 € (últim IRPF). Amb diversos compradors, només la part de qui compleix.",
          "en": "General taxable base minus personal and family allowance below €40,000 and savings base up to €1,800 (last IRPF return). With several buyers, only the share of whoever qualifies."
        },
        "article": "art. 6.6 y art. 9",
        "quote": "6. Tributarán al tipo de gravamen del 3 […] las transmisiones de bienes inmuebles que radiquen en la Región de Murcia por parte de sujetos pasivos de edad inferior o igual a 40 años, con las siguientes condiciones: […] b) Que su base imponible general menos el mínimo personal y familiar sea inferior a 40.000 euros, siempre que la base imponible del ahorro no supere los 1.800 euros."
      },
      {
        "id": "murcia-itp-disability",
        "tax": "itp",
        "label": {
          "es": "Discapacidad del 65 % o más, vivienda habitual",
          "ca": "Discapacitat del 65 % o més, habitatge habitual",
          "en": "Disability of 65% or more, main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 3
        },
        "conditions": {
          "habitual": true,
          "disabilityMin": 65
        },
        "extra": {
          "es": "Base imponible general menos el mínimo personal y familiar por debajo de 40.000 € y base del ahorro hasta 1.800 € (último IRPF). Con varios compradores, solo la parte de quien cumple.",
          "ca": "Base imposable general menys el mínim personal i familiar per sota de 40.000 € i base de l'estalvi fins a 1.800 € (últim IRPF). Amb diversos compradors, només la part de qui compleix.",
          "en": "General taxable base minus personal and family allowance below €40,000 and savings base up to €1,800 (last IRPF return). With several buyers, only the share of whoever qualifies."
        },
        "article": "art. 6.9 y art. 9",
        "quote": "9. Tributarán al tipo de gravamen del 3% las transmisiones de bienes inmuebles que radiquen en la Región de Murcia por parte de sujetos pasivos con un grado de discapacidad igual o superior al 65%, con las siguientes condiciones:"
      },
      {
        "id": "murcia-ajd-young",
        "tax": "ajd",
        "label": {
          "es": "40 años o menos, vivienda habitual",
          "ca": "40 anys o menys, habitatge habitual",
          "en": "Aged 40 or under, main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.1
        },
        "conditions": {
          "habitual": true,
          "maxAge": 40
        },
        "extra": {
          "es": "Base imponible general menos el mínimo personal y familiar por debajo de 40.000 € y base del ahorro hasta 1.800 € (último IRPF). Con varios compradores, solo la parte de quien cumple.",
          "ca": "Base imposable general menys el mínim personal i familiar per sota de 40.000 € i base de l'estalvi fins a 1.800 € (últim IRPF). Amb diversos compradors, només la part de qui compleix.",
          "en": "General taxable base minus personal and family allowance below €40,000 and savings base up to €1,800 (last IRPF return). With several buyers, only the share of whoever qualifies."
        },
        "article": "art. 7.4",
        "quote": "4. Tributarán al tipo del 0,1 […] los documentos notariales a que se refiere el artículo 31.2 del Texto Refundido de la Ley del Impuesto sobre Transmisiones Patrimoniales y Actos Jurídicos Documentados, aprobado por Real Decreto Legislativo 1/1993, de 24 de septiembre, en el caso de primeras copias de escrituras públicas que documenten la adquisición de viviendas por sujetos pasivos de 40 años o menores […] en el caso de primeras copias de escrituras públicas que documenten la adquisición de viviendas por sujetos pasivos de 40 años o menores, en cuanto al gravamen sobre actos jurídicos documentados, siempre que se cumplan las siguientes condiciones:"
      },
      {
        "id": "murcia-ajd-large-family",
        "tax": "ajd",
        "label": {
          "es": "Familia numerosa, primera vivienda habitual de la familia",
          "ca": "Família nombrosa, primer habitatge habitual de la família",
          "en": "Large family, the family's first main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.1
        },
        "conditions": {
          "habitual": true,
          "largeFamily": true
        },
        "extra": {
          "es": "Renta de quienes vivirán en ella por debajo de 44.000 € (+6.000 € por hijo por encima del mínimo). Primera vivienda habitual de la familia, o vender la anterior en ±2 años y que la nueva sea más de un 10 % mayor.",
          "ca": "Renda de qui hi viurà per sota de 44.000 € (+6.000 € per fill per sobre del mínim). Primer habitatge habitual de la família, o vendre l'anterior en ±2 anys i que el nou sigui més d'un 10 % més gran.",
          "en": "Income of those who will live there below €44,000 (+€6,000 per child above the minimum). The family's first main home, or sell the previous one within ±2 years and buy one over 10% larger."
        },
        "article": "art. 7.5",
        "quote": "5. Tributarán al tipo del 0,1% los documentos notariales a que se refiere el artículo 31.2 del Texto Refundido de la Ley del Impuesto sobre Transmisiones Patrimoniales y Actos Jurídicos Documentados, aprobado por Real Decreto Legislativo 1/1993, de 24 de septiembre, en el caso de primeras copias de escrituras públicas que documenten la adquisición de viviendas por parte de […] en el caso de primeras copias de escrituras públicas que documenten la adquisición de viviendas por parte de sujetos pasivos que tengan la consideración legal de familia numerosa, en cuanto al gravamen sobre actos jurídicos documentados, siempre que se cumplan las siguientes condiciones:"
      },
      {
        "id": "murcia-ajd-disability",
        "tax": "ajd",
        "label": {
          "es": "Discapacidad del 65 % o más, vivienda habitual",
          "ca": "Discapacitat del 65 % o més, habitatge habitual",
          "en": "Disability of 65% or more, main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.1
        },
        "conditions": {
          "habitual": true,
          "disabilityMin": 65
        },
        "extra": {
          "es": "Base imponible general menos el mínimo personal y familiar por debajo de 40.000 € y base del ahorro hasta 1.800 € (último IRPF). Con varios compradores, solo la parte de quien cumple.",
          "ca": "Base imposable general menys el mínim personal i familiar per sota de 40.000 € i base de l'estalvi fins a 1.800 € (últim IRPF). Amb diversos compradors, només la part de qui compleix.",
          "en": "General taxable base minus personal and family allowance below €40,000 and savings base up to €1,800 (last IRPF return). With several buyers, only the share of whoever qualifies."
        },
        "article": "art. 7.6",
        "quote": "6. Tributarán al tipo del 0,1% los documentos notariales a que se refiere el artículo 31.2 del Texto Refundido de la Ley del Impuesto sobre Transmisiones Patrimoniales y Actos Jurídicos Documentados, aprobado por Real Decreto Legislativo 1/1993, de 24 de septiembre, en el caso de primeras copias de escrituras públicas que documenten la adquisición de viviendas por sujetos […] en el caso de primeras copias de escrituras públicas que documenten la adquisición de viviendas por sujetos pasivos con un grado de discapacidad igual o superior al 65%, en cuanto al gravamen sobre actos jurídicos documentados, siempre que se cumplan las siguientes condiciones:"
      },
      {
        "id": "murcia-ajd-plan-joven",
        "tax": "ajd",
        "label": {
          "es": "Primera transmisión de vivienda del Plan de Vivienda Joven, hasta 40 años",
          "ca": "Primera transmissió d'habitatge del Pla d'Habitatge Jove, fins a 40 anys",
          "en": "First sale of a Youth Housing Plan home, buyers aged 40 or under"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.1
        },
        "conditions": {
          "protected": true,
          "maxAge": 40
        },
        "extra": null,
        "manual": true,
        "article": "art. 7.3",
        "quote": "3. Tributarán al tipo de gravamen del 0,1 % los documentos notariales a que se refiere el artículo 31.2 del Texto Refundido de la Ley del Impuesto sobre Transmisiones Patrimoniales y Actos Jurídicos Documentados, aprobado por Real Decreto Legislativo 1/1993, de 24 de septiembre, en el caso de primeras copias de escrituras públicas otorgadas para formalizar la primera […] en el caso de primeras copias de escrituras públicas otorgadas para formalizar la primera transmisión de viviendas acogidas al Plan de Vivienda Joven de la Región de Murcia para adquirentes de 40 años o menores, en cuanto al gravamen sobre actos jurídicos documentados."
      }
    ],
    "newHome": {
      "name": "IVA",
      "general": 10,
      "protected": 4,
      "protectedLabel": {
        "es": "VPO de régimen especial o de promoción pública vendida por el promotor",
        "ca": "HPO de règim especial o de promoció pública venuda pel promotor",
        "en": "special-regime or public-promotion VPO sold by the developer"
      },
      "article": "Ley 37/1992, art. 91",
      "quote": "",
      "law": null
    },
    "notes": [
      {
        "es": "El tipo general del 7,75 % rige desde el 25 de julio de 2025 (Ley 3/2025). Los tipos reducidos de Murcia no tienen límite de valor de la vivienda.",
        "ca": "El tipus general del 7,75 % regeix des del 25 de juliol de 2025 (Llei 3/2025). Els tipus reduïts de Múrcia no tenen límit de valor de l'habitatge.",
        "en": "The 7.75% general rate applies since 25 July 2025 (Ley 3/2025). Murcia's reduced rates have no cap on the home's value."
      }
    ]
  },
  {
    "id": "navarra",
    "name": {
      "es": "Navarra",
      "ca": "Navarra",
      "en": "Navarre"
    },
    "regime": "foral",
    "status": "sourced",
    "law": {
      "title": "Decreto Foral Legislativo 129/1999, de 26 de abril, por el que se aprueba el Texto Refundido de las disposiciones del Impuesto sobre Transmisiones Patrimoniales y Actos Jurídicos Documentados",
      "short": "DFLeg 129/1999 (Navarra)",
      "url": "https://www.boe.es/buscar/act.php?id=BON-n-1999-90001",
      "consolidatedAsOf": "2026-04-20",
      "readOn": "2026-11-13"
    },
    "amendments": [
      {
        "title": "Ley Foral 17/2025, de 22 de diciembre (BOE-A-2026-3910)",
        "url": "https://www.boe.es/buscar/doc.php?id=BOE-A-2026-3910"
      }
    ],
    "taxAgency": {
      "name": "Hacienda Foral de Navarra",
      "url": "https://hacienda.navarra.es"
    },
    "itp": {
      "general": {
        "kind": "flat",
        "rate": 6
      },
      "article": "art. 8.1.a)",
      "quote": "a) El 6 por ciento, si se trata de transmisiones de bienes inmuebles, así como la constitución y cesión de los derechos reales que recaigan sobre los mismos, excepto los derechos reales de garantía."
    },
    "ajd": {
      "general": {
        "kind": "flat",
        "rate": 0.5
      },
      "article": "art. 22.2",
      "quote": "tributarán, además, al tipo de gravamen del 0,5 por 100, en cuanto a tales actos o contratos."
    },
    "benefits": [
      {
        "id": "navarra-itp-two-children",
        "tax": "itp",
        "label": {
          "es": "Familias con dos o más hijos, vivienda habitual (5 % hasta 180.304 €)",
          "ca": "Famílies amb dos fills o més, habitatge habitual (5 % fins a 180.304 €)",
          "en": "Families with two or more children, main home (5% up to €180,304)"
        },
        "rate": {
          "kind": "scale",
          "how": "progressive",
          "brackets": [
            {
              "upTo": 180304,
              "rate": 5
            },
            {
              "upTo": null,
              "rate": 6
            }
          ]
        },
        "conditions": {
          "habitual": true
        },
        "extra": {
          "es": "Ningún miembro de la familia puede tener más del 25 % de otra vivienda en Navarra. El exceso sobre 180.304 € paga el 6 %.",
          "ca": "Cap membre de la família pot tenir més del 25 % d'un altre habitatge a Navarra. L'excés sobre 180.304 € paga el 6 %.",
          "en": "No family member may own more than 25% of another home in Navarre. The part above €180,304 pays 6%."
        },
        "manual": true,
        "article": "art. 8.1.b).1.º",
        "quote": "1.º Al 5 por 100, siempre que se cumplan las siguientes condiciones: […] Que el adquirente forme parte de una unidad familiar en la que estén integrados dos o más hijos. […] Que como resultado de la transmisión se adquiera el pleno dominio de la vivienda […] Que la vivienda se destine a residencia habitual de la unidad familiar. […] Que ningún miembro de la unidad familiar sea propietario en el momento de la adquisición de otra vivienda en la Comunidad Foral de Navarra en un porcentaje superior al 25 por 100. […] El tipo reducido se aplicará sobre una base imponible máxima de 180.304 euros, que será única por unidad familiar y por vivienda. […] Cuando la citada base imponible supere esa cantidad, el tipo del 5 por 100 se aplicará únicamente sobre 180.304 euros, gravándose el exceso al tipo general de las transmisiones de inmuebles."
      },
      {
        "id": "navarra-itp-depopulation",
        "tax": "itp",
        "label": {
          "es": "Vivienda habitual en municipio en riesgo de despoblación",
          "ca": "Habitatge habitual en municipi en risc de despoblament",
          "en": "Main home in a municipality at risk of depopulation"
        },
        "rate": {
          "kind": "flat",
          "rate": 4
        },
        "conditions": {
          "habitual": true
        },
        "extra": {
          "es": "Municipio declarado por orden foral.",
          "ca": "Municipi declarat per ordre foral.",
          "en": "Municipality listed by foral order."
        },
        "manual": true,
        "article": "art. 8.1.b).2.º",
        "quote": "2.º Al 4 por 100 cuando la vivienda se destine a vivienda habitual del sujeto pasivo y esté ubicada en un municipio que haya sido considerado en riesgo de despoblación mediante orden foral […] siempre que, como resultado de la transmisión, se adquiera el pleno dominio de la vivienda […] A efectos de esta letra b), se atenderá al concepto de vivienda habitual definido en la normativa del Impuesto sobre la Renta de las Personas Físicas."
      },
      {
        "id": "navarra-itp-vpo",
        "tax": "itp",
        "label": {
          "es": "VPO: primera transmisión en los 6 años siguientes a la calificación (exenta)",
          "ca": "HPO: primera transmissió en els 6 anys següents a la qualificació (exempta)",
          "en": "VPO: first transfer within 6 years of classification (exempt)"
        },
        "rate": {
          "kind": "flat",
          "rate": 0
        },
        "conditions": {
          "protected": true
        },
        "extra": null,
        "manual": true,
        "article": "art. 35.I.B).13.a).b`)",
        "quote": "13. Los siguientes actos y negocios jurídicos relativos a viviendas que, conforme a lo dispuesto en la Ley Foral 10/2010, de 10 de mayo, del derecho a la vivienda en Navarra sean calificadas como de protección oficial. […] La primera transmisión «inter vivos» del dominio de las viviendas de protección oficial, siempre que tenga lugar dentro de los seis años siguientes a la fecha de su calificación definitiva."
      },
      {
        "id": "navarra-ajd-vpo",
        "tax": "ajd",
        "label": {
          "es": "VPO: escritura de la primera transmisión (exenta)",
          "ca": "HPO: escriptura de la primera transmissió (exempta)",
          "en": "VPO: deed of the first transfer (exempt)"
        },
        "rate": {
          "kind": "flat",
          "rate": 0
        },
        "conditions": {
          "protected": true
        },
        "extra": {
          "es": "Solo la primera transmisión de la VPO; exención provisional, condicionada a la normativa de VPO.",
          "ca": "Només la primera transmissió de l'HPO; exempció provisional, condicionada a la normativa d'HPO.",
          "en": "Only the VPO's first transfer; provisional exemption subject to the VPO rules."
        },
        "article": "art. 35.I.B).13.b).c´)",
        "quote": "Las primeras copias de las demás escrituras públicas otorgadas para formalizar actos y negocios jurídicos relacionados con viviendas de protección oficial, con exclusión de los formalizados con posterioridad a la primera transmisión de dichas viviendas."
      }
    ],
    "newHome": {
      "name": "IVA",
      "general": 10,
      "protected": 4,
      "protectedLabel": {
        "es": "VPO de régimen especial o de promoción pública vendida por el promotor",
        "ca": "HPO de règim especial o de promoció pública venuda pel promotor",
        "en": "special-regime or public-promotion VPO sold by the developer"
      },
      "article": "Convenio Económico, art. 32 (tipos del IVA estatal: Ley 37/1992, art. 91)",
      "quote": "En la exacción del Impuesto sobre el Valor Añadido, incluido el recargo de equivalencia, Navarra aplicará los mismos principios básicos, normas sustantivas y formales vigentes en cada momento en territorio del Estado.",
      "law": {
        "title": "Ley 28/1990, de 26 de diciembre, por la que se aprueba el Convenio Económico entre el Estado y la Comunidad Foral de Navarra",
        "short": "Convenio Económico (Ley 28/1990)",
        "url": "https://www.boe.es/buscar/act.php?id=BOE-A-1990-31117",
        "consolidatedAsOf": "2025-07-25",
        "readOn": "2026-11-13"
      }
    },
    "notes": [
      {
        "es": "Navarra no tiene tipos reducidos por edad ni por discapacidad en el ITP.",
        "ca": "Navarra no té tipus reduïts per edat ni per discapacitat en l'ITP.",
        "en": "Navarre has no ITP reduced rates for age or disability."
      }
    ]
  },
  {
    "id": "valencia",
    "name": {
      "es": "Comunitat Valenciana",
      "ca": "Comunitat Valenciana",
      "en": "Valencian Community"
    },
    "regime": "common",
    "status": "sourced",
    "law": {
      "title": "Ley 13/1997, de 23 de diciembre, por la que se regula el tramo autonómico del Impuesto sobre la Renta de las Personas Físicas y restantes tributos cedidos.",
      "short": "Ley 13/1997 (Comunitat Valenciana)",
      "url": "https://www.boe.es/buscar/act.php?id=BOE-A-1998-8202",
      "consolidatedAsOf": "2026-08-10",
      "readOn": "2026-11-13"
    },
    "amendments": [
      {
        "title": "Ley 5/2025, de 30 de mayo, de medidas fiscales, de gestión administrativa y financiera, y de organización de la Generalitat (BOE-A-2025-11959)",
        "url": "https://www.boe.es/buscar/doc.php?id=BOE-A-2025-11959"
      },
      {
        "title": "Ley 5/2026, de 31 de julio, de medidas fiscales, de gestión administrativa y financiera, y de organización de la Generalitat (BOE-A-2026-19331, DOGV 10425 of 10/08/2026)",
        "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2026-19331"
      }
    ],
    "taxAgency": {
      "name": "Agència Tributària Valenciana (ATV)",
      "url": "https://atv.gva.es"
    },
    "itp": {
      "general": {
        "kind": "scale",
        "how": "whole",
        "brackets": [
          {
            "upTo": 1000000,
            "rate": 9
          },
          {
            "upTo": null,
            "rate": 11
          }
        ]
      },
      "article": "art. 13.Uno",
      "quote": "Uno. El 9 % en las adquisiciones de inmuebles, así como en la constitución o cesión de derechos reales que recaigan sobre los mismos, salvo los derechos reales de garantía, excepto que sea aplicable alguno de los tipos previstos en los apartados siguientes. […] No obstante, cuando el valor de los bienes inmuebles transmitidos o del derecho que se constituya o ceda sobre los mismos sea superior a un millón de euros, el tipo aplicable será el 11 %. […] se modifica, con efectos para los hechos imponibles devengados desde el 1 de junio de 2026 inclusive, el apartado uno"
    },
    "ajd": {
      "general": {
        "kind": "flat",
        "rate": 1.4
      },
      "article": "art. 14.Cuatro",
      "quote": "Cuatro. En los demás casos, el 1,4 por 100. […] Se modifica el apartado cuatro, para los hechos imponibles devengados desde el 1 de junio de 2026 inclusive, por el art. 34 de la Ley 5/2025, de 30 de mayo."
    },
    "benefits": [
      {
        "id": "valencia-itp-young",
        "tax": "itp",
        "label": {
          "es": "Menores de 35, primera vivienda habitual de hasta 180.000 €",
          "ca": "Menors de 35, primer habitatge habitual de fins a 180.000 €",
          "en": "Under 35, first main home up to €180,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 6
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "maxAge": 34,
          "maxValue": 180000
        },
        "extra": {
          "es": "Bases liquidables general y del ahorro del IRPF hasta 30.000 € (47.000 € en conjunta). Escritura pública; solo por la parte que compra quien cumple.",
          "ca": "Bases liquidables general i de l'estalvi de l'IRPF fins a 30.000 € (47.000 € en conjunta). Escriptura pública; només per la part que compra qui compleix.",
          "en": "General and savings IRPF taxable bases up to €30,000 (€47,000 joint). Public deed; only for the share bought by whoever qualifies."
        },
        "article": "art. 13.Tres.1",
        "quote": "Tres. El 6 %: […] En la adquisición de viviendas que vayan a constituir la primera vivienda habitual de jóvenes menores de treinta y cinco años cuyo valor no exceda de los 180.000 euros, por la parte que estos adquieran"
      },
      {
        "id": "valencia-itp-young-180k",
        "tax": "itp",
        "label": {
          "es": "Menores de 35, primera vivienda habitual de más de 180.000 €",
          "ca": "Menors de 35, primer habitatge habitual de més de 180.000 €",
          "en": "Under 35, first main home over €180,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 8
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "maxAge": 34
        },
        "extra": {
          "es": "Bases liquidables general y del ahorro del IRPF hasta 30.000 € (47.000 € en conjunta). Escritura pública; solo por la parte que compra quien cumple.",
          "ca": "Bases liquidables general i de l'estalvi de l'IRPF fins a 30.000 € (47.000 € en conjunta). Escriptura pública; només per la part que compra qui compleix.",
          "en": "General and savings IRPF taxable bases up to €30,000 (€47,000 joint). Public deed; only for the share bought by whoever qualifies."
        },
        "article": "art. 13.Dos.2",
        "quote": "En la adquisición de viviendas que vayan a constituir la primera vivienda habitual de jóvenes menores de treinta y cinco años cuyo valor exceda de los 180.000 euros, por la parte que estos adquieran"
      },
      {
        "id": "valencia-itp-large-family",
        "tax": "itp",
        "label": {
          "es": "Familia numerosa o monoparental, vivienda habitual de hasta 180.000 €",
          "ca": "Família nombrosa o monoparental, habitatge habitual de fins a 180.000 €",
          "en": "Large or single-parent family, main home up to €180,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 3
        },
        "conditions": {
          "habitual": true,
          "largeFamily": true,
          "maxValue": 180000
        },
        "extra": {
          "es": "Bases liquidables del IRPF hasta 30.000 € (47.000 € en conjunta); 35.000 € / 58.000 € en categoría especial. También familias monoparentales.",
          "ca": "Bases liquidables de l'IRPF fins a 30.000 € (47.000 € en conjunta); 35.000 € / 58.000 € en categoria especial. També famílies monoparentals.",
          "en": "IRPF taxable bases up to €30,000 (€47,000 joint); €35,000 / €58,000 for the special category. Single-parent families too."
        },
        "article": "art. 13.Cinco.2",
        "quote": "Cinco. El 3 % en los siguientes casos, siempre que el valor de los bienes inmuebles transmitidos no exceda de los 180.000 euros: […] En las adquisiciones de viviendas que tengan que constituir la vivienda habitual de una familia numerosa o monoparental, siempre que la suma de la base liquidable general y de la base liquidable del ahorro del Impuesto sobre la Renta de las Personas Físicas del sujeto pasivo no supere los límites establecidos en el apartado cuatro de artículo cuatro de esta ley en función de la calificación de familia numerosa y del régimen de declaración empleado."
      },
      {
        "id": "valencia-itp-large-family-180k",
        "tax": "itp",
        "label": {
          "es": "Familia numerosa o monoparental, vivienda habitual de más de 180.000 €",
          "ca": "Família nombrosa o monoparental, habitatge habitual de més de 180.000 €",
          "en": "Large or single-parent family, main home over €180,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 4
        },
        "conditions": {
          "habitual": true,
          "largeFamily": true
        },
        "extra": {
          "es": "Bases liquidables del IRPF hasta 30.000 € (47.000 € en conjunta); 35.000 € / 58.000 € en categoría especial. También familias monoparentales.",
          "ca": "Bases liquidables de l'IRPF fins a 30.000 € (47.000 € en conjunta); 35.000 € / 58.000 € en categoria especial. També famílies monoparentals.",
          "en": "IRPF taxable bases up to €30,000 (€47,000 joint); €35,000 / €58,000 for the special category. Single-parent families too."
        },
        "article": "art. 13.Cuatro.1.2",
        "quote": "Cuatro. El 4 %: […] Siempre que el valor de los inmuebles transmitidos exceda de los 180.000 euros: […] En las adquisiciones de viviendas que tengan que constituir la vivienda habitual de una familia numerosa o monoparental"
      },
      {
        "id": "valencia-itp-disability",
        "tax": "itp",
        "label": {
          "es": "Discapacidad, vivienda habitual de hasta 180.000 €",
          "ca": "Discapacitat, habitatge habitual de fins a 180.000 €",
          "en": "Disability, main home up to €180,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 3
        },
        "conditions": {
          "habitual": true,
          "disabilityMin": 65,
          "maxValue": 180000
        },
        "extra": {
          "es": "Discapacidad del 65 % o más, o intelectual o mental del 33 % o más. Solo por la parte que compra la persona con discapacidad.",
          "ca": "Discapacitat del 65 % o més, o intel·lectual o mental del 33 % o més. Només per la part que compra la persona amb discapacitat.",
          "en": "Disability of 65% or more, or intellectual or mental disability of 33% or more. Only for the share the disabled person buys."
        },
        "article": "art. 13.Cinco.3",
        "quote": "En las adquisiciones de viviendas que vayan a constituir la vivienda habitual de una persona con un grado de discapacidad igual o superior al 65 %, o un grado de discapacidad intelectual o mental reconocido de manera permanente igual o superior al 33 %, por la parte del bien que aquel adquiera."
      },
      {
        "id": "valencia-itp-disability-180k",
        "tax": "itp",
        "label": {
          "es": "Discapacidad, vivienda habitual de más de 180.000 €",
          "ca": "Discapacitat, habitatge habitual de més de 180.000 €",
          "en": "Disability, main home over €180,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 4
        },
        "conditions": {
          "habitual": true,
          "disabilityMin": 65
        },
        "extra": {
          "es": "Discapacidad del 65 % o más, o intelectual o mental del 33 % o más. Solo por la parte que compra la persona con discapacidad.",
          "ca": "Discapacitat del 65 % o més, o intel·lectual o mental del 33 % o més. Només per la part que compra la persona amb discapacitat.",
          "en": "Disability of 65% or more, or intellectual or mental disability of 33% or more. Only for the share the disabled person buys."
        },
        "article": "art. 13.Cuatro.1.3",
        "quote": "Cuatro. El 4 %: […] Siempre que el valor de los inmuebles transmitidos exceda de los 180.000 euros: […] En las adquisiciones de viviendas que vayan a constituir la vivienda habitual de una persona con un grado de discapacidad igual o superior al 65 %"
      },
      {
        "id": "valencia-itp-gender-violence",
        "tax": "itp",
        "label": {
          "es": "Mujeres víctimas de violencia de género, vivienda habitual de hasta 180.000 €",
          "ca": "Dones víctimes de violència de gènere, habitatge habitual de fins a 180.000 €",
          "en": "Women victims of gender violence, main home up to €180,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 3
        },
        "conditions": {
          "habitual": true,
          "maxValue": 180000
        },
        "extra": {
          "es": "Bases liquidables general y del ahorro del IRPF hasta 30.000 € (47.000 € en conjunta). Escritura pública; solo por la parte que compra quien cumple.",
          "ca": "Bases liquidables general i de l'estalvi de l'IRPF fins a 30.000 € (47.000 € en conjunta). Escriptura pública; només per la part que compra qui compleix.",
          "en": "General and savings IRPF taxable bases up to €30,000 (€47,000 joint). Public deed; only for the share bought by whoever qualifies."
        },
        "manual": true,
        "article": "art. 13.Cinco.4",
        "quote": "Cinco. El 3 % en los siguientes casos, siempre que el valor de los bienes inmuebles transmitidos no exceda de los 180.000 euros: […] En la adquisición de viviendas que vayan a constituir la vivienda habitual de mujeres víctimas de violencia de género, por la parte que estas adquieran"
      },
      {
        "id": "valencia-itp-gender-violence-180k",
        "tax": "itp",
        "label": {
          "es": "Mujeres víctimas de violencia de género, vivienda habitual de más de 180.000 €",
          "ca": "Dones víctimes de violència de gènere, habitatge habitual de més de 180.000 €",
          "en": "Women victims of gender violence, main home over €180,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 4
        },
        "conditions": {
          "habitual": true
        },
        "extra": {
          "es": "Bases liquidables general y del ahorro del IRPF hasta 30.000 € (47.000 € en conjunta). Escritura pública; solo por la parte que compra quien cumple.",
          "ca": "Bases liquidables general i de l'estalvi de l'IRPF fins a 30.000 € (47.000 € en conjunta). Escriptura pública; només per la part que compra qui compleix.",
          "en": "General and savings IRPF taxable bases up to €30,000 (€47,000 joint). Public deed; only for the share bought by whoever qualifies."
        },
        "manual": true,
        "article": "art. 13.Cuatro.1.4",
        "quote": "Cuatro. El 4 %: […] Siempre que el valor de los inmuebles transmitidos exceda de los 180.000 euros: […] En la adquisición de viviendas que vayan a constituir la vivienda habitual de mujeres víctimas de violencia de género"
      },
      {
        "id": "valencia-itp-vpo-general",
        "tax": "itp",
        "label": {
          "es": "VPO de régimen general, primera vivienda habitual de hasta 180.000 €",
          "ca": "HPO de règim general, primer habitatge habitual de fins a 180.000 €",
          "en": "General-regime VPO, first main home up to €180,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 6
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "protected": true,
          "maxValue": 180000
        },
        "extra": {
          "es": "VPO que sea tu primera vivienda habitual; escritura pública.",
          "ca": "HPO que sigui el teu primer habitatge habitual; escriptura pública.",
          "en": "VPO that is your first main home; public deed."
        },
        "article": "art. 13.Tres.2",
        "quote": "Tres. El 6 %: […] En las adquisiciones de viviendas de protección oficial de régimen general cuyo valor no exceda de los 180.000 euros"
      },
      {
        "id": "valencia-itp-vpo-general-180k",
        "tax": "itp",
        "label": {
          "es": "VPO de régimen general, primera vivienda habitual de más de 180.000 €",
          "ca": "HPO de règim general, primer habitatge habitual de més de 180.000 €",
          "en": "General-regime VPO, first main home over €180,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 8
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "protected": true
        },
        "extra": {
          "es": "VPO que sea tu primera vivienda habitual; escritura pública.",
          "ca": "HPO que sigui el teu primer habitatge habitual; escriptura pública.",
          "en": "VPO that is your first main home; public deed."
        },
        "article": "art. 13.Dos.1",
        "quote": "En la adquisición de viviendas de protección oficial de régimen general, así como en la constitución o cesión de derechos reales que recaigan sobre las referidas viviendas, salvo los derechos reales de garantía, cuyo valor exceda de los 180.000 euros, siempre que tales viviendas constituyan o vayan a constituir la primera vivienda habitual del adquirente o cesionario."
      },
      {
        "id": "valencia-itp-vpo-special",
        "tax": "itp",
        "label": {
          "es": "Vivienda protegida de régimen especial, primera vivienda habitual de hasta 180.000 €",
          "ca": "Habitatge protegit de règim especial, primer habitatge habitual de fins a 180.000 €",
          "en": "Special-regime protected housing, first main home up to €180,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 3
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "protected": true,
          "maxValue": 180000
        },
        "extra": {
          "es": "VPO que sea tu primera vivienda habitual; escritura pública.",
          "ca": "HPO que sigui el teu primer habitatge habitual; escriptura pública.",
          "en": "VPO that is your first main home; public deed."
        },
        "manual": true,
        "article": "art. 13.Cinco.1",
        "quote": "Cinco. El 3 % en los siguientes casos, siempre que el valor de los bienes inmuebles transmitidos no exceda de los 180.000 euros: […] En la adquisición de viviendas de protección pública de régimen especial"
      },
      {
        "id": "valencia-itp-vpo-special-180k",
        "tax": "itp",
        "label": {
          "es": "VPO de régimen especial, primera vivienda habitual de más de 180.000 €",
          "ca": "HPO de règim especial, primer habitatge habitual de més de 180.000 €",
          "en": "Special-regime VPO, first main home over €180,000"
        },
        "rate": {
          "kind": "flat",
          "rate": 4
        },
        "conditions": {
          "habitual": true,
          "firstHome": true,
          "protected": true
        },
        "extra": {
          "es": "VPO que sea tu primera vivienda habitual; escritura pública.",
          "ca": "HPO que sigui el teu primer habitatge habitual; escriptura pública.",
          "en": "VPO that is your first main home; public deed."
        },
        "manual": true,
        "article": "art. 13.Cuatro.1.1",
        "quote": "Cuatro. El 4 %: […] En las adquisiciones de viviendas de protección oficial de régimen especial, así como en la constitución o cesión de derechos reales que recaigan sobre las referidas viviendas, salvo los derechos reales de garantía, siempre que las mismas constituyan o vayan a constituir la primera vivienda habitual del adquirente o cesionario."
      },
      {
        "id": "valencia-ajd-habitual",
        "tax": "ajd",
        "label": {
          "es": "Compra de vivienda habitual",
          "ca": "Compra d'habitatge habitual",
          "en": "Purchase of a main home"
        },
        "rate": {
          "kind": "flat",
          "rate": 0.1
        },
        "conditions": {
          "habitual": true
        },
        "extra": null,
        "article": "art. 14.Uno.a",
        "quote": "Uno. El 0,1 por 100 en los siguientes casos: […] a) Las primeras copias de las escrituras públicas que documenten adquisiciones de vivienda habitual. […] Se modifica el apartado uno por el art. 23 de la Ley 5/2026, de 31 de julio. Ref. BOE-A-2026-19331"
      }
    ],
    "newHome": {
      "name": "IVA",
      "general": 10,
      "protected": 4,
      "protectedLabel": {
        "es": "VPO de régimen especial o de promoción pública vendida por el promotor",
        "ca": "HPO de règim especial o de promoció pública venuda pel promotor",
        "en": "special-regime or public-promotion VPO sold by the developer"
      },
      "article": "Ley 37/1992, art. 91",
      "quote": "",
      "law": null
    },
    "notes": [
      {
        "es": "El 9 % general (11 % si la vivienda vale más de 1.000.000 €) y el AJD del 1,4 % rigen desde el 1 de junio de 2026. Los tipos reducidos se aplican a todo el valor según valga hasta 180.000 € o más.",
        "ca": "El 9 % general (11 % si l'habitatge val més d'1.000.000 €) i l'AJD de l'1,4 % regeixen des de l'1 de juny de 2026. Els tipus reduïts s'apliquen a tot el valor segons valgui fins a 180.000 € o més.",
        "en": "The 9% general rate (11% if the home is worth over €1,000,000) and the 1.4% AJD apply from 1 June 2026. Reduced rates apply to the whole value depending on whether it is up to €180,000 or more."
      }
    ]
  }
];
