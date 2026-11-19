import { CATALONIA_GIFT_DATES, CATALONIA_GIFT_QUOTE, CATALONIA_GIFT_SOURCES } from "@/lib/programmatic/gift-tax/regions/catalonia";
import { ANDALUCIA_GIFT_DATES, ANDALUCIA_GIFT_QUOTE, ANDALUCIA_GIFT_SOURCES } from "@/lib/programmatic/gift-tax/regions/andalucia";
import { MADRID_GIFT_DATES, MADRID_GIFT_QUOTE, MADRID_GIFT_SOURCES } from "@/lib/programmatic/gift-tax/regions/madrid";
import { VALENCIA_GIFT_DATES, VALENCIA_GIFT_QUOTE, VALENCIA_GIFT_SOURCES } from "@/lib/programmatic/gift-tax/regions/valencia";
import { ANDALUCIA_DATES, ANDALUCIA_QUOTE, ANDALUCIA_SOURCES } from "@/lib/programmatic/inheritance-tax/regions/andalucia";
import { MADRID_DATES, MADRID_QUOTE, MADRID_SOURCES } from "@/lib/programmatic/inheritance-tax/regions/madrid";
import { VALENCIA_DATES, VALENCIA_QUOTE, VALENCIA_SOURCES } from "@/lib/programmatic/inheritance-tax/regions/valencia";
import { BONUS_FROM, QUOTE as CAT_QUOTE, SOURCES as CAT_SOURCES } from "@/lib/programmatic/inheritance-tax/rules";

import { STATE_FROM, STATE_QUOTE, STATE_SCALE, STATE_SOURCES } from "../state";
import type { Territory } from "../types";

/**
 * The four communities with their own inheritance and gift tax calculators on
 * the site. Every figure and quote is the one those calculators already use
 * (inheritance-tax/rules.ts, inheritance-tax/regions/*.ts,
 * gift-tax/regions/*.ts), read on 19 Nov 2026; the worked example goes
 * through their engines.
 */

/** Catalonia: the Code's text refós is in force from this day (DOGC 14.3.2024). */
const CAT_CODE_FROM = "2024-03-15";

export const CATALUNA: Territory = {
  id: "cataluna",
  name: { ca: "Catalunya", es: "Cataluña", en: "Catalonia" },
  regime: "common",
  agency: { name: { ca: "Agència Tributària de Catalunya", es: "Agència Tributària de Catalunya", en: "Catalan Tax Agency (ATC)" }, url: "https://atc.gencat.cat/ca/tributs/isd/" },
  sources: {
    code: { short: "Codi tributari de Catalunya", ...CAT_SOURCES.code },
    atcBonus: { short: "ATC", ...CAT_SOURCES.atcBonus },
    giftCode: { short: "Codi tributari de Catalunya", ...CATALONIA_GIFT_SOURCES.code },
  },
  mainSource: "code",
  inheritance: {
    groupII: {
      text: { ca: "Fills i cònjuge: 100.000 €.", es: "Hijos y cónyuge: 100.000 €.", en: "Children and spouse: €100,000." },
      cite: { src: "code", art: "631-2.b" },
      from: CAT_CODE_FROM,
      quotes: [CAT_QUOTE.groupII],
    },
    bonus: {
      text: {
        ca: "Cònjuge: 99 %. Fills de 21 anys o més: mitjana ponderada per trams de base imposable, del 60 % (primers 100.000 €) al 0 % (més de 3 milions); amb 300.000 €, el 55 %.",
        es: "Cónyuge: 99 %. Hijos de 21 años o más: media ponderada por tramos de base imponible, del 60 % (primeros 100.000 €) al 0 % (más de 3 millones); con 300.000 €, el 55 %.",
        en: "Spouse: 99%. Children aged 21+: a weighted average by slices of the taxable base, from 60% (first €100,000) down to 0% (over €3 million); 55% on €300,000.",
      },
      cite: { src: "code", art: "633-4" },
      from: BONUS_FROM,
      quotes: [CAT_QUOTE.spouseBonus, CAT_QUOTE.groupBonus],
    },
    home: {
      text: {
        ca: "95 %, amb un límit de 500.000 € per a tot l'habitatge, repartit entre els hereus, i mai menys de 180.000 € per hereu. Cal conservar-lo 5 anys.",
        es: "95 %, con un límite de 500.000 € para toda la vivienda, repartido entre los herederos, y nunca menos de 180.000 € por heredero. Hay que conservarla 5 años.",
        en: "95%, capped at €500,000 for the whole home, shared among the heirs, and never less than €180,000 per heir. It must be kept 5 years.",
      },
      cite: { src: "code", art: "631-17" },
      from: CAT_CODE_FROM,
      quotes: [CAT_QUOTE.home, CAT_QUOTE.homeKeep],
    },
    groupIII: {
      text: { ca: "Germans: 8.000 €, sense bonificació (coeficient 1,5882).", es: "Hermanos: 8.000 €, sin bonificación (coeficiente 1,5882).", en: "Siblings: €8,000, no rebate (coefficient 1.5882)." },
      cite: { src: "code", art: "631-2.c" },
      from: CAT_CODE_FROM,
      quotes: [CAT_QUOTE.groupIII],
    },
  },
  gift: {
    benefit: {
      text: {
        ca: "Sense bonificació. Tarifa reduïda del 5 %, 7 % i 9 % per als grups I i II en escriptura pública. Primer habitatge habitual del fill (36 anys o menys): reducció del 95 %, fins a 60.000 €.",
        es: "Sin bonificación. Tarifa reducida del 5 %, 7 % y 9 % para los grupos I y II en escritura pública. Primera vivienda habitual del hijo (36 años o menos): reducción del 95 %, hasta 60.000 €.",
        en: "No rebate. A reduced scale of 5%, 7% and 9% for groups I and II in a public deed. The child's first habitual home (aged 36 or under): a 95% reduction, up to €60,000.",
      },
      cite: { src: "giftCode", art: "633-2 i 632-20" },
      from: CATALONIA_GIFT_DATES.homeSixMonthsFrom,
      quotes: [CATALONIA_GIFT_QUOTE.reducedScale, CATALONIA_GIFT_QUOTE.home, CATALONIA_GIFT_QUOTE.homeAge],
    },
    formal: {
      text: {
        ca: "Escriptura pública (o sentència) per a la tarifa reduïda; si l'escriptura no és requisit de validesa, s'ha d'atorgar dins el mes següent al lliurament del bé.",
        es: "Escritura pública (o sentencia) para la tarifa reducida; si la escritura no es requisito de validez, hay que otorgarla en el mes siguiente a la entrega del bien.",
        en: "A public deed (or court ruling) for the reduced scale; where the deed is not needed for validity, it must be signed within a month of handing over the asset.",
      },
      cite: { src: "giftCode", art: "633-2.2" },
      from: CAT_CODE_FROM,
      quotes: [CATALONIA_GIFT_QUOTE.reducedScaleDeed, CATALONIA_GIFT_QUOTE.reducedScaleMonth],
    },
  },
  example: { kind: "engine", engine: "cataluna" },
  calculator: { inheritance: "inheritance-tax", gift: "gift-tax-catalonia" },
};

export const MADRID: Territory = {
  id: "madrid",
  name: { ca: "Comunitat de Madrid", es: "Comunidad de Madrid", en: "Madrid region" },
  regime: "common",
  agency: { name: { ca: "Comunitat de Madrid", es: "Comunidad de Madrid", en: "Comunidad de Madrid" }, url: MADRID_SOURCES.agency.url },
  sources: {
    law: { short: "DL 1/2010 de Madrid", ...MADRID_SOURCES.law },
    agency: { short: "Comunidad de Madrid", ...MADRID_SOURCES.agency },
    giftLaw: { short: "DL 1/2010 de Madrid", ...MADRID_GIFT_SOURCES.law },
  },
  mainSource: "law",
  inheritance: {
    groupII: {
      text: { ca: "Fills i cònjuge: 16.000 €.", es: "Hijos y cónyuge: 16.000 €.", en: "Children and spouse: €16,000." },
      cite: { src: "law", art: "21.Uno.1" },
      from: MADRID_DATES.consolidatedFrom,
      quotes: [MADRID_QUOTE.groupII],
    },
    bonus: {
      text: { ca: "99 % per als grups I i II.", es: "99 % para los grupos I y II.", en: "99% for groups I and II." },
      cite: { src: "law", art: "25.1" },
      from: MADRID_DATES.bonusFrom,
      quotes: [MADRID_QUOTE.bonusGroupsIandII],
    },
    home: {
      text: { ca: "95 %, fins a 123.000 € per hereu. Cal conservar-lo 5 anys.", es: "95 %, hasta 123.000 € por heredero. Hay que conservarla 5 años.", en: "95%, up to €123,000 per heir. It must be kept 5 years." },
      cite: { src: "law", art: "21.Uno.4" },
      from: MADRID_DATES.consolidatedFrom,
      quotes: [MADRID_QUOTE.home],
    },
    groupIII: {
      text: {
        ca: "Germans: 8.000 € i bonificació del 50 % (morts des de l'1 de juliol de 2025), només sobre el que es declara dins de termini o sense requeriment previ.",
        es: "Hermanos: 8.000 € y bonificación del 50 % (fallecimientos desde el 1 de julio de 2025), solo sobre lo declarado en plazo o sin requerimiento previo.",
        en: "Siblings: €8,000 and a 50% rebate (deaths since 1 July 2025), only on what is declared on time or before any request from the tax office.",
      },
      cite: { src: "law", art: "21.Uno.1 y 25.1" },
      from: MADRID_DATES.bonusFrom,
      quotes: [MADRID_QUOTE.groupIII, MADRID_QUOTE.bonusGroupIII, { text: MADRID_QUOTE.agencyGroupIII, src: "agency" }],
    },
  },
  gift: {
    benefit: {
      text: {
        ca: "Bonificació del 99 % (grups I i II). Diners per comprar l'habitatge habitual: reducció del 100 %, fins a 250.000 €.",
        es: "Bonificación del 99 % (grupos I y II). Dinero para comprar la vivienda habitual: reducción del 100 %, hasta 250.000 €.",
        en: "A 99% rebate (groups I and II). Cash to buy the habitual home: a 100% reduction, up to €250,000.",
      },
      cite: { src: "giftLaw", art: "25.2.b y 22 bis" },
      from: MADRID_GIFT_DATES.bonusFrom,
      quotes: [MADRID_GIFT_QUOTE.bonusGroupsIandII, MADRID_GIFT_QUOTE.cash],
    },
    formal: {
      text: {
        ca: "Document públic si la base supera 10.000 € (sumant tres anys del mateix donant); en diners, l'origen dels fons justificat i declarat en el mateix document.",
        es: "Documento público si la base supera 10.000 € (sumando tres años del mismo donante); en dinero, el origen de los fondos justificado y manifestado en el propio documento.",
        en: "A public document if the base exceeds €10,000 (adding up three years from the same donor); for cash, the origin of the funds justified and stated in the document itself.",
      },
      cite: { src: "giftLaw", art: "25.2" },
      from: MADRID_GIFT_DATES.bonusFrom,
      quotes: [MADRID_GIFT_QUOTE.publicDocument, MADRID_GIFT_QUOTE.fundsOrigin],
    },
  },
  example: { kind: "engine", engine: "madrid" },
  calculator: { inheritance: "inheritance-tax-madrid", gift: "gift-tax-madrid" },
};

export const ANDALUCIA: Territory = {
  id: "andalucia",
  name: { ca: "Andalusia", es: "Andalucía", en: "Andalusia" },
  regime: "common",
  agency: { name: { ca: "Agencia Tributaria de Andalucía", es: "Agencia Tributaria de Andalucía", en: "Andalusian Tax Agency (ATRIAN)" }, url: ANDALUCIA_SOURCES.agency.url },
  sources: {
    law: { short: "Ley 5/2021 de Andalucía", ...ANDALUCIA_SOURCES.law },
    lisd: STATE_SOURCES.lisd,
    giftLaw: { short: "Ley 5/2021 de Andalucía", ...ANDALUCIA_GIFT_SOURCES.law },
  },
  mainSource: "law",
  inheritance: {
    groupII: {
      text: { ca: "Fills i cònjuge: 1.000.000 €.", es: "Hijos y cónyuge: 1.000.000 €.", en: "Children and spouse: €1,000,000." },
      cite: { src: "law", art: "28.1.b" },
      from: ANDALUCIA_DATES.consolidatedFrom,
      quotes: [ANDALUCIA_QUOTE.kinship],
    },
    bonus: {
      text: { ca: "99 % per als grups I i II.", es: "99 % para los grupos I y II.", en: "99% for groups I and II." },
      cite: { src: "law", art: "39" },
      from: ANDALUCIA_DATES.bonusFrom,
      quotes: [ANDALUCIA_QUOTE.bonus],
    },
    home: {
      text: {
        ca: "99 %, amb el límit estatal de 122.606,47 € per hereu. Cal conservar-lo 3 anys.",
        es: "99 %, con el límite estatal de 122.606,47 € por heredero. Hay que conservarla 3 años.",
        en: "99%, with the state cap of €122,606.47 per heir. It must be kept 3 years.",
      },
      cite: { src: "law", art: "27" },
      from: ANDALUCIA_DATES.consolidatedFrom,
      quotes: [ANDALUCIA_QUOTE.home, ANDALUCIA_QUOTE.homeConditions, { text: STATE_QUOTE.home, src: "lisd" }],
    },
    groupIII: {
      text: { ca: "Germans: 10.000 €, sense bonificació (coeficient 1,5).", es: "Hermanos: 10.000 €, sin bonificación (coeficiente 1,5).", en: "Siblings: €10,000, no rebate (coefficient 1.5)." },
      cite: { src: "law", art: "28.1.c" },
      from: ANDALUCIA_DATES.consolidatedFrom,
      quotes: [ANDALUCIA_QUOTE.kinship],
    },
  },
  gift: {
    benefit: {
      text: {
        ca: "Bonificació del 99 % (grups I i II). Diners dels pares per comprar l'habitatge habitual a Andalusia (menors de 35 anys, entre d'altres): reducció del 99 %.",
        es: "Bonificación del 99 % (grupos I y II). Dinero de los padres para comprar la vivienda habitual en Andalucía (menores de 35 años, entre otros): reducción del 99 %.",
        en: "A 99% rebate (groups I and II). Cash from parents to buy the habitual home in Andalusia (donees under 35, among others): a 99% reduction.",
      },
      cite: { src: "giftLaw", art: "40 y 32" },
      from: ANDALUCIA_GIFT_DATES.consolidatedFrom,
      quotes: [ANDALUCIA_GIFT_QUOTE.bonus, ANDALUCIA_GIFT_QUOTE.cashHome, ANDALUCIA_GIFT_QUOTE.cashHomeWho],
    },
    formal: {
      text: {
        ca: "Document públic amb lliurament simultani si la base supera 5.000 €; en diners, document públic dins el mes següent al lliurament i origen dels fons justificat i declarat en el document.",
        es: "Documento público con entrega simultánea si la base supera 5.000 €; en dinero, documento público en el mes siguiente a la entrega y origen de los fondos justificado y manifestado en él.",
        en: "A public document with simultaneous handover if the base exceeds €5,000; for cash, the public document within a month of the handover, with the origin of the funds justified and stated in it.",
      },
      cite: { src: "giftLaw", art: "40.2" },
      from: ANDALUCIA_GIFT_DATES.consolidatedFrom,
      quotes: [ANDALUCIA_GIFT_QUOTE.bonusDocument, ANDALUCIA_GIFT_QUOTE.bonusCash],
    },
  },
  example: { kind: "engine", engine: "andalucia" },
  calculator: { inheritance: "inheritance-tax-andalucia", gift: "gift-tax-andalucia" },
};

export const VALENCIA: Territory = {
  id: "valencia",
  name: { ca: "Comunitat Valenciana", es: "Comunidad Valenciana", en: "Valencia region" },
  regime: "common",
  agency: { name: { ca: "Agència Tributària Valenciana", es: "Agència Tributària Valenciana", en: "Valencian Tax Agency (ATV)" }, url: VALENCIA_SOURCES.agency.url },
  sources: {
    law: { short: "Ley 13/1997 valenciana", ...VALENCIA_SOURCES.law },
    lisd: STATE_SOURCES.lisd,
    ley5_2025: { short: "Ley 5/2025 valenciana", ...VALENCIA_SOURCES.ley5_2025 },
    giftLaw: { short: "Ley 13/1997 valenciana", ...VALENCIA_GIFT_SOURCES.law },
  },
  mainSource: "law",
  inheritance: {
    groupII: {
      text: { ca: "Fills i cònjuge: 100.000 €.", es: "Hijos y cónyuge: 100.000 €.", en: "Children and spouse: €100,000." },
      cite: { src: "law", art: "10.1.a" },
      from: VALENCIA_DATES.consolidatedFrom,
      quotes: [VALENCIA_QUOTE.groupII],
    },
    bonus: {
      text: {
        ca: "99 % per als grups I i II, sobre la part de la quota dels béns declarats.",
        es: "99 % para los grupos I y II, sobre la parte de la cuota de los bienes declarados.",
        en: "99% for groups I and II, on the part of the tax for the assets declared.",
      },
      cite: { src: "law", art: "12 bis.1.a" },
      from: VALENCIA_DATES.bonusFrom,
      quotes: [VALENCIA_QUOTE.bonusGroupsIandII],
    },
    home: {
      text: { ca: "95 %, fins a 150.000 € per hereu. Cal conservar-lo 5 anys.", es: "95 %, hasta 150.000 € por heredero. Hay que conservarla 5 años.", en: "95%, up to €150,000 per heir. It must be kept 5 years." },
      cite: { src: "law", art: "10.1.c" },
      from: VALENCIA_DATES.consolidatedFrom,
      quotes: [VALENCIA_QUOTE.home],
    },
    groupIII: {
      text: {
        ca: "Germans: 7.993,46 € (reducció estatal) i bonificació del 25 % per als col·laterals de sang (morts des de l'1 de juny de 2026; el 50 % des de l'1 de juny de 2027).",
        es: "Hermanos: 7.993,46 € (reducción estatal) y bonificación del 25 % para los colaterales de sangre (fallecimientos desde el 1 de junio de 2026; el 50 % desde el 1 de junio de 2027).",
        en: "Siblings: €7,993.46 (state reduction) and a 25% rebate for blood collaterals (deaths since 1 June 2026; 50% from 1 June 2027).",
      },
      cite: { src: "law", art: "12 bis.2" },
      from: VALENCIA_DATES.groupIIIBonusFrom,
      quotes: [{ text: STATE_QUOTE.groupIII, src: "lisd" }, VALENCIA_QUOTE.bonusGroupIIIFrom, VALENCIA_QUOTE.bonusGroupIII, VALENCIA_QUOTE.bonusGroupIIINextFrom, VALENCIA_QUOTE.bonusGroupIIINext],
    },
  },
  gift: {
    benefit: {
      text: {
        ca: "Reducció de 100.000 € (fills de 21 anys o més; sumant cinc anys del mateix donant) i bonificació del 99 %.",
        es: "Reducción de 100.000 € (hijos de 21 años o más; sumando cinco años del mismo donante) y bonificación del 99 %.",
        en: "A €100,000 reduction (children aged 21+; adding up five years from the same donor) and a 99% rebate.",
      },
      cite: { src: "giftLaw", art: "10 bis.2.a y 12 bis.1.b" },
      from: VALENCIA_GIFT_DATES.consolidatedFrom,
      quotes: [VALENCIA_GIFT_QUOTE.kinship, VALENCIA_GIFT_QUOTE.kinshipFiveYears, VALENCIA_GIFT_QUOTE.bonusLead, VALENCIA_GIFT_QUOTE.bonusDirect],
    },
    formal: {
      text: {
        ca: "Document públic (o formalitzar-la així dins el termini de declaració); en diners, l'origen dels fons justificat i declarat, i els mitjans de lliurament identificats. Fins a 4.000 € en tres anys, n'hi ha prou amb documents signats digitalment amb un servei de confiança qualificat.",
        es: "Documento público (o formalizarla así dentro del plazo de declaración); en dinero, el origen de los fondos justificado y manifestado, y los medios de entrega identificados. Hasta 4.000 € en tres años, basta con documentos firmados digitalmente con un servicio de confianza cualificado.",
        en: "A public document (or the gift put in one within the filing period); for cash, the origin of the funds justified and stated, and the means of handover identified. Up to €4,000 in three years, documents signed digitally through a qualified trust service will do.",
      },
      cite: { src: "giftLaw", art: "12 bis.4 y 10 bis.2" },
      from: VALENCIA_GIFT_DATES.consolidatedFrom,
      quotes: [VALENCIA_GIFT_QUOTE.bonusDocument, VALENCIA_GIFT_QUOTE.bonusFunds, VALENCIA_GIFT_QUOTE.smallDigital],
    },
  },
  example: { kind: "engine", engine: "valencia" },
  calculator: { inheritance: "inheritance-tax-valencia", gift: "gift-tax-valencia" },
};

/** Ceuta and Melilla: Ley 29/1987 in full, with its art. 23 bis (the same rules; the city's name is the only difference). */
function city(id: "ceuta" | "melilla", name: string): Territory {
  return {
    id,
    name: { ca: name, es: name, en: name },
    regime: "city",
    agency: { name: { ca: "Agència Tributària estatal (AEAT)", es: "Agencia Tributaria (AEAT)", en: "State Tax Agency (AEAT)" }, url: STATE_SOURCES.aeat.url },
    sources: { lisd: STATE_SOURCES.lisd, aeat: STATE_SOURCES.aeat },
    mainSource: "lisd",
    inheritance: {
      groupII: {
        text: { ca: "Fills i cònjuge: 15.956,87 € (reducció estatal).", es: "Hijos y cónyuge: 15.956,87 € (reducción estatal).", en: "Children and spouse: €15,956.87 (state reduction)." },
        cite: { src: "lisd", art: "20.2.a" },
        from: STATE_FROM.art20,
        quotes: [STATE_QUOTE.groupII],
      },
      bonus: {
        text: {
          ca: `99 % per als grups I i II (50 % per a la resta), si la persona morta residia a ${name} i hi va residir els cinc anys anteriors.`,
          es: `99 % para los grupos I y II (50 % para el resto), si la persona fallecida residía en ${name} y residió allí los cinco años anteriores.`,
          en: `99% for groups I and II (50% for the rest), if the deceased lived in ${name} and had lived there for the five years before.`,
        },
        cite: { src: "lisd", art: "23 bis.1" },
        from: STATE_FROM.art23bis,
        quotes: [STATE_QUOTE.cityInheritance, STATE_QUOTE.cityGroupsIandII],
      },
      home: {
        text: { ca: "95 %, fins a 122.606,47 € per hereu. Cal conservar-lo 10 anys.", es: "95 %, hasta 122.606,47 € por heredero. Hay que conservarla 10 años.", en: "95%, up to €122,606.47 per heir. It must be kept 10 years." },
        cite: { src: "lisd", art: "20.2.c" },
        from: STATE_FROM.art20,
        quotes: [STATE_QUOTE.home, STATE_QUOTE.homeKeep],
      },
      groupIII: {
        text: { ca: "Germans: 7.993,46 € i bonificació del 50 % (coeficient 1,5882).", es: "Hermanos: 7.993,46 € y bonificación del 50 % (coeficiente 1,5882).", en: "Siblings: €7,993.46 and a 50% rebate (coefficient 1.5882)." },
        cite: { src: "lisd", art: "20.2.a y 23 bis.1" },
        from: STATE_FROM.art23bis,
        quotes: [STATE_QUOTE.groupIII, STATE_QUOTE.cityInheritance, STATE_QUOTE.coefficient],
      },
    },
    gift: {
      benefit: {
        text: {
          ca: `Sense reduccions (base liquidable = base imposable). Bonificació del 50 % de la quota dels immobles situats a Ceuta o Melilla i, per a la resta de béns, si qui la rep viu a ${name}.`,
          es: `Sin reducciones (base liquidable = base imponible). Bonificación del 50 % de la cuota de los inmuebles situados en Ceuta o Melilla y, para el resto de bienes, si quien la recibe vive en ${name}.`,
          en: `No reductions (net taxable base = taxable base). A 50% rebate on the tax for property in Ceuta or Melilla and, for other assets, if the person receiving the gift lives in ${name}.`,
        },
        cite: { src: "lisd", art: "20.5 y 23 bis.2-3" },
        from: STATE_FROM.art23bis,
        quotes: [STATE_QUOTE.giftBase, STATE_QUOTE.cityGiftProperty, STATE_QUOTE.cityGiftOther],
      },
      formal: {
        text: {
          ca: "L'art. 23 bis no posa cap requisit de forma a aquesta bonificació.",
          es: "El art. 23 bis no pone ningún requisito de forma a esta bonificación.",
          en: "Art. 23 bis sets no formal requirement for this rebate.",
        },
        cite: { src: "lisd", art: "23 bis" },
        from: STATE_FROM.art23bis,
        quotes: [STATE_QUOTE.cityGiftOther],
      },
    },
    example: {
      kind: "rules",
      rules: {
        reductions: [{ id: "kinship", label: { ca: "Parentiu (grup II)", es: "Parentesco (grupo II)", en: "Kinship (group II)" }, amount: 15_956.87, cite: { src: "lisd", art: "20.2.a" } }],
        home: { percent: 95, cap: 122_606.47, cite: { src: "lisd", art: "20.2.c" } },
        scale: STATE_SCALE,
        scaleCite: { src: "lisd", art: "21.2" },
        coefficient: 1,
        coefficientCite: { src: "lisd", art: "22.2" },
        bonus: { kind: "flat", percent: 99 },
        bonusCite: { src: "lisd", art: "23 bis.1" },
      },
    },
  };
}


export const CEUTA = city("ceuta", "Ceuta");
export const MELILLA = city("melilla", "Melilla");
