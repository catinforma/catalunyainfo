import type { TerritoryId, Text } from "./types";

/**
 * What the reading of 19 Nov 2026 could not settle for each territory: a
 * text that could not be downloaded, a rule the law leaves ambiguous, an
 * announced change not yet published. The page prints each note with the
 * territory's texts, so the reader sees the limits of every row; none of
 * them changes a figure in the tables.
 */
export const VERIFICATION_NOTES: Partial<Record<TerritoryId, Text>> = {
  aragon: {
    ca: "La llei no diu expressament si la reducció de l'art. 132-2 i la bonificació de l'art. 132-6 se sumen en la mateixa donació; el text no ho impedeix.",
    es: "La ley no dice expresamente si la reducción del art. 132-2 y la bonificación del art. 132-6 se suman en la misma donación; el texto no lo impide.",
    en: "The law does not say outright whether the art. 132-2 reduction and the art. 132-6 rebate add up on the same gift; nothing in the text prevents it.",
  },
  baleares: {
    ca: "Que l'import elevat per l'Ordre 13/2026 s'apliqui també a la reducció per l'habitatge de les herències es dedueix de la disposició addicional cinquena (que cita l'art. 23); no s'ha confirmat amb l'ATIB.",
    es: "Que el importe elevado por la Orden 13/2026 se aplique también a la reducción por la vivienda en herencias se deduce de la disposición adicional quinta (que cita el art. 23); no se ha confirmado con la ATIB.",
    en: "That the amount raised by Order 13/2026 also applies to the inheritance home reduction follows from the fifth additional provision (which cites art. 23); it has not been confirmed with the ATIB.",
  },
  canarias: {
    ca: "La regla dels tres anys de l'art. 26 sexies (donacions) admet dues lectures: consulta l'Agència Tributària Canària abans d'encadenar donacions.",
    es: "La regla de los tres años del art. 26 sexies (donaciones) admite dos lecturas: consulta a la Agencia Tributaria Canaria antes de encadenar donaciones.",
    en: "The three-year rule of art. 26 sexies (gifts) can be read two ways: ask the Canary Islands Tax Agency before making successive gifts.",
  },
  "castilla-la-mancha": {
    ca: "El cercador del DOCM no responia: les lleis de 2025 i 2026 s'han comprovat al BOE i al Portal Tributari, i cap no toca aquest impost.",
    es: "El buscador del DOCM no respondía: las leyes de 2025 y 2026 se han comprobado en el BOE y en el Portal Tributario, y ninguna toca este impuesto.",
    en: "The DOCM search did not respond: the 2025 and 2026 laws were checked in the BOE and on the tax portal, and none touches this tax.",
  },
  "castilla-y-leon": {
    ca: "La Junta ha anunciat rebaixes per al 2027 (entre elles per a germans, oncles i nebots) que el 19 de novembre de 2026 no estaven publicades: no s'hi inclouen.",
    es: "La Junta ha anunciado rebajas para 2027 (entre ellas para hermanos, tíos y sobrinos) que el 19 de noviembre de 2026 no estaban publicadas: no se incluyen.",
    en: "The regional government has announced 2027 cuts (among them for siblings, uncles, aunts, nephews and nieces) that were not published on 19 November 2026: they are not included.",
  },
  extremadura: {
    ca: "Per sobre de 300.000 €, la bonificació de les donacions (el 50 %, amb un límit de 600.000 €) té una redacció que no permet calcular-la amb seguretat.",
    es: "Por encima de 300.000 €, la bonificación de las donaciones (el 50 %, con un límite de 600.000 €) tiene una redacción que no permite calcularla con seguridad.",
    en: "Above €300,000, the gift rebate (50%, with a €600,000 limit) is worded in a way that does not allow a safe calculation.",
  },
  galicia: {
    ca: "El text no diu si el límit de 600.000 € de l'habitatge és per hereu o per habitatge (a l'exemple no hi influeix).",
    es: "El texto no dice si el límite de 600.000 € de la vivienda es por heredero o por vivienda (en el ejemplo no influye).",
    en: "The text does not say whether the €600,000 home limit is per heir or per home (it makes no difference in the example).",
  },
  murcia: {
    ca: "El pressupost de 2026 no es va aprovar (prorrogat el de 2025) i l'ordre de pròrroga no s'ha llegit; els decrets llei 1/2026 i 2/2026 s'han revisat pel sumari.",
    es: "El presupuesto de 2026 no se aprobó (prorrogado el de 2025) y la orden de prórroga no se ha leído; los decretos-ley 1/2026 y 2/2026 se han revisado por su sumario.",
    en: "The 2026 budget was not passed (the 2025 one was extended) and the extension order was not read; decree-laws 1/2026 and 2/2026 were checked by their summary.",
  },
  alava: {
    ca: "Text de divulgació de la Diputació, actualitzat a la Norma Foral 3/2025; la Norma Foral 21/2025 (mesures per al 2026) no toca l'impost. Els decrets normatius d'urgència fiscal 2/2026 i 3/2026 no s'han pogut llegir.",
    es: "Texto de divulgación de la Diputación, actualizado a la Norma Foral 3/2025; la Norma Foral 21/2025 (medidas para 2026) no toca el impuesto. Los decretos normativos de urgencia fiscal 2/2026 y 3/2026 no se han podido leer.",
    en: "The Diputación's divulgation text, updated to Norma Foral 3/2025; Norma Foral 21/2025 (2026 measures) does not touch the tax. Urgent fiscal decrees 2/2026 and 3/2026 could not be read.",
  },
  bizkaia: {
    ca: "Text de divulgació de la Diputació (última modificació normativa: 23/04/2025). El Decret Foral Normatiu 1/2026 no s'ha llegit pel que fa a aquest impost i la data de l'exempció de donacions a menors de 36 anys no s'ha pogut fixar; el projecte de mesures per al 2026 estava en tramitació.",
    es: "Texto de divulgación de la Diputación (última modificación normativa: 23/04/2025). El Decreto Foral Normativo 1/2026 no se ha leído en lo que afecta a este impuesto y la fecha de la exención de donaciones a menores de 36 años no se ha podido fijar; el proyecto de medidas para 2026 estaba en tramitación.",
    en: "The Diputación's divulgation text (last change 23/04/2025). Foral Decree 1/2026 was not read for this tax and the start date of the gift exemption for under-36s could not be pinned down; the 2026 tax-measures bill was still going through the Juntas Generales.",
  },
  gipuzkoa: {
    ca: "La Norma Foral 3/1990 està derogada: regeix la Norma Foral 2/2022 des del 17/04/2022. El text llegit és el de divulgació de la Diputació (actualitzat a la Norma Foral 1/2025).",
    es: "La Norma Foral 3/1990 está derogada: rige la Norma Foral 2/2022 desde el 17/04/2022. El texto leído es el de divulgación de la Diputación (actualizado a la Norma Foral 1/2025).",
    en: "Norma Foral 3/1990 is repealed: Norma Foral 2/2022 applies since 17/04/2022. The text read is the Diputación's divulgation text (updated to Norma Foral 1/2025).",
  },
  navarra: {
    ca: "Per als germans, la llei no aclareix com es combina la taula no progressiva amb el primer tram de 7.813,16 €: no se'n calcula cap cas.",
    es: "Para los hermanos, la ley no aclara cómo se combina la tabla no progresiva con el primer tramo de 7.813,16 €: no se calcula ningún caso.",
    en: "For siblings, the law does not make clear how the non-progressive table combines with the first €7,813.16 slice: no sibling case is computed.",
  },
};
