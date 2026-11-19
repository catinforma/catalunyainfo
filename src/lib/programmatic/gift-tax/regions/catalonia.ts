import { COEFFICIENTS, QUOTE as ISD_QUOTE, SCALE } from "@/lib/programmatic/inheritance-tax/rules";

import { RULES_AS_OF, type GiftSource } from "./state";
import type { GiftRules } from "./types";

/**
 * Catalonia: llibre sisè del Codi tributari de Catalunya (Decret legislatiu
 * 1/2024, de 12 de març), Títol III, capítol II (gifts) and capítol III
 * (scales, coefficients), and the Reglament de l'impost (Decret 414/2011).
 *
 * Read on 19 Nov 2026 in the Portal Jurídic's consolidated text "Vigència
 * 14/07/2026" (document 980772, version 2161469), the same version the
 * inheritance calculator reads (inheritance-tax/rules.ts):
 *  - art. 632-20 and 632-21 (first habitual home of a descendant, cash or the
 *    home itself): 95 %, at most 60.000 € (120.000 € with a 65 % disability);
 *    public deed stating the purpose, within one month of handing over cash;
 *    donee 36 or younger (unless 65 % disability); last IRPF bases less the
 *    personal and family minimums no more than 36.000 €; with cash, the home
 *    bought within six months. Arts. 632-20.2 and 632-21.1.d and .4 in the
 *    wording of Decret llei 5/2025, art. 4 (in force 27/06/2025, as the ATC
 *    dates it: before, three months).
 *  - art. 633-1 (general scale, since 01/01/2010), 633-2 (reduced scale for
 *    groups I and II with a public deed or court ruling; the deed within one
 *    month of handing over the asset when it is not needed for validity),
 *    633-3 (coefficients, since 01/05/2020). No article of the Code rebates
 *    the tax on gifts: art. 633-4 is for inheritances only.
 *  - arts. 634-1 (stable partners = spouses) and 634-2 (stepchildren =
 *    children).
 *  - Decret 414/2011, art. 10.b: one month from the act (the ATC: "un mes,
 *    comptat des del dia en què tingui lloc l'acte").
 *  - ATC, "Donacions": the reduced scale, the reductions, the deadline, form
 *    651 (online, digital ID; the help program only for years before 2024)
 *    and eleven worked examples; cases 1 to 8 and 11 are reproduced to the
 *    cent in tests/gift-tax.test.ts (9 and 10 are bare ownership).
 *  - Llei 11/2026 repealed art. 632-1.4 and reworded 632-16.2 (forest land):
 *    nothing the calculator uses.
 */

const REDUCED_SCALE = [
  { from: 0, quota: 0, rate: 5 },
  { from: 200_000, quota: 10_000, rate: 7 },
  { from: 600_000, quota: 38_000, rate: 9 },
] as const;

export const CATALONIA_GIFT_RULES: GiftRules = {
  id: "catalonia",
  calculatorId: "gift-tax-catalonia",
  giftsFrom: "2025-06-27",
  scale: SCALE,
  reducedScale: REDUCED_SCALE,
  coefficients: COEFFICIENTS,
  excessRule: true,
  kinship: null,
  disability: null,
  home: {
    kinds: ["money", "home"],
    relations: ["child", "grandchild"],
    percent: 95,
    capOn: "reduction",
    cap: 60_000,
    capDisability: 120_000,
    capDisabilityFrom: 65,
    maxAge: 36,
    ageWaivedFrom: 65,
    priorWealthMax: null,
    deedAbove: 0,
    deedKinds: ["money", "home"],
  },
  bonus: null,
  reductionsNeedDeed: false,
  deadline: { months: 1 },
  cite: {
    scale: { law: "catalonia", art: "633-1" },
    reducedScale: { law: "catalonia", art: "633-2" },
    coefficient: { law: "catalonia", art: "633-3" },
    excess: { law: "lisd", art: "22.2" },
    kinship: null,
    disability: null,
    home: { law: "catalonia", art: "632-20" },
    bonus: null,
    smallGift: null,
    deadline: { law: "catReg", art: "10.b" },
    partners: { law: "catalonia", art: "634-1" },
  },
};

export const CATALONIA_GIFT_DATES = {
  /** The consolidated text read (Portal Jurídic version 2161469). */
  consolidatedFrom: "2026-07-14",
  /** Art. 633-1 as the ATC dates it. */
  scaleFrom: "2010-01-01",
  /** Art. 633-3 coefficients. */
  coefficientsFrom: "2020-05-01",
  /** Decret llei 5/2025: six months to buy the home with the cash (three before). */
  homeSixMonthsFrom: "2025-06-27",
} as const;

const ATC = "https://atc.gencat.cat/ca/tributs/isd/donacions";
const ATC_ES = "https://atc.gencat.cat/es/tributs/isd/donacions";

export const CATALONIA_GIFT_SOURCES = {
  code: {
    name: "Decret legislatiu 1/2024, de 12 de març, pel qual s'aprova el llibre sisè del Codi tributari de Catalunya",
    publisher: "Portal Jurídic de Catalunya (DOGC)",
    ref: "arts. 632-1, 632-20, 632-21, 633-1 a 633-3, 634-1 i 634-2; text consolidat vigent des del 14/07/2026",
    url: "https://portaljuridic.gencat.cat/eli/es-ct/dlg/2024/03/12/1",
    read: RULES_AS_OF,
  },
  regulation: {
    name: "Decret 414/2011, de 13 de desembre, pel qual s'aprova el Reglament de l'impost sobre successions i donacions",
    publisher: "Portal Jurídic de Catalunya (DOGC)",
    ref: "art. 10.b (termini d'un mes)",
    url: "https://portaljuridic.gencat.cat/eli/es-ct/d/2011/12/13/414",
    read: RULES_AS_OF,
  },
  dl5_2025: {
    name: "Decret llei 5/2025, de 25 de març, pel qual s'adopten mesures urgents en matèria fiscal, de despeses de personal i altres d'administratives",
    publisher: "Portal Jurídic de Catalunya (DOGC)",
    ref: "art. 4 (arts. 632-20.2 i 632-21: sis mesos per comprar l'habitatge)",
    url: "https://portaljuridic.gencat.cat/eli/es-ct/dl/2025/03/25/5",
    read: RULES_AS_OF,
  },
  atcScale: { name: "Tarifa i coeficients multiplicadors (donacions)", publisher: "Agència Tributària de Catalunya", ref: "tarifa general i tarifa reduïda", url: `${ATC}/tarifa-coeficients-multiplicadors/`, urlEs: `${ATC_ES}/tarifa-coeficients-multiplicadors/`, read: RULES_AS_OF },
  atcReductions: { name: "Reduccions (donacions)", publisher: "Agència Tributària de Catalunya", ref: "primer habitatge habitual de descendents", url: `${ATC}/reduccions/`, urlEs: `${ATC_ES}/reduccions/`, read: RULES_AS_OF },
  atcExamples: { name: "Exemples de donacions", publisher: "Agència Tributària de Catalunya", ref: "casos pràctics 1 a 11", url: `${ATC}/exemples/`, urlEs: `${ATC_ES}/exemples/`, read: RULES_AS_OF },
  atcDeadline: { name: "Meritació i termini de presentació (donacions)", publisher: "Agència Tributària de Catalunya", ref: "un mes des de la donació", url: `${ATC}/termini/`, urlEs: `${ATC_ES}/termini/`, read: RULES_AS_OF },
  atcFile: { name: "Declarar una donació (model 651)", publisher: "Agència Tributària de Catalunya", ref: "formulari electrònic, identificació digital", url: `${ATC}/declarar-donacio/`, urlEs: `${ATC_ES}/declarar-donacio/`, read: RULES_AS_OF },
  atcCompetence: { name: "Administració competent (donacions)", publisher: "Agència Tributària de Catalunya", ref: "immobles i resta de béns", url: `${ATC}/competencies/`, urlEs: `${ATC_ES}/competencies/`, read: RULES_AS_OF },
} as const satisfies Record<string, GiftSource>;

/** The law's and the ATC's words, as published (Catalan). Tests check each figure appears in its quote. */
export const CATALONIA_GIFT_QUOTE = {
  reductionsLead: "1. En les adquisicions lucratives entre vius, la base liquidable s'obté de resultes d'aplicar en la base imposable les reduccions que estableix aquesta secció única.",
  home: "1. En les donacions a descendents d'un habitatge que ha de constituir llur primer habitatge habitual o de diners destinats a l'adquisició d'aquest primer habitatge habitual, es pot aplicar una reducció del 95% del valor de l'habitatge o l'import donats, amb una reducció màxima de 60.000 euros, límit que es fixa en 120.000 euros per als donataris que tinguin un grau de discapacitat igual o superior al 65%. També s'aplica la reducció en el cas que la donació sigui d'un terreny o de diners per adquirir-lo perquè, en ambdós casos, el descendent hi construeixi el seu primer habitatge habitual.",
  homeDeed: "a) La donació s'ha de formalitzar en escriptura pública, en la qual s'ha de fer constar de manera expressa la finalitat, en cada cas, de la donació:",
  homeCash: "- Que els diners rebuts es destinaran a l'adquisició del terreny o del primer habitatge habitual del donatari. En el cas de donació dinerària, l'escriptura pública s'ha d'atorgar en el termini d'un mes a comptar del lliurament dels diners.",
  homeAge: "b) El donatari no pot tenir més de trenta-sis anys, llevat que tingui un grau de discapacitat igual o superior al 65%.",
  homeIncome: "c) La suma de les bases imposables general i de l'estalvi de la darrera declaració de l'impost sobre la renda de les persones físiques presentada pel donatari no pot ésser superior, restant-ne els mínims personal i familiar, a 36.000 euros",
  homeSixMonths: "d) En el cas de donacions de diners, el donatari ha d'adquirir l'habitatge en el termini de sis mesos a comptar de la data de la donació o, si n'hi ha de successives, a comptar de la data de la primera donació.",
  scale: ISD_QUOTE.scale,
  reducedScale: "1. La quota íntegra de l'impost sobre successions i donacions en les transmissions lucratives entre vius a favor de contribuents dels grups I i II que defineix l'article 631-2 s'obté de resultes d'aplicar a la base liquidable l'escala següent:",
  reducedScaleDeed: "2. Per a poder aplicar la tarifa que estableix l'apartat 1, la donació entre vius, o el negoci jurídic equiparable, s'ha d'haver formalitzat en escriptura pública o sentència judicial. Si l'escriptura no és requisit de validesa, cal que l'atorgant o atorgants l'elevin a pública:",
  reducedScaleMonth: "a) En el termini d'un mes a comptar de la data de lliurament del bé.",
  coefficient: ISD_QUOTE.coefficient,
  excess: ISD_QUOTE.excess,
  partners: ISD_QUOTE.partners,
  stepchildren: ISD_QUOTE.stepchildren,
  deadline: "b) Quan es tracti d'adquisicions entre vius, en el termini d'un mes comptador des de la data d'atorgament de l'acte o del contracte.",
  atcDeadline: "Amb caràcter general, el termini de presentació de l'autoliquidació i d'ingrés del deute tributari és d’un mes, comptat des del dia en què tingui lloc l’acte o el contracte de donació.",
  atcSixMonths: "per a donacions anteriors al 27.06.2025 el límit era de tres mesos anteriors a l'adquisició",
  atcExample1:
    "En data 20 de gener de 2025, l'Anselm dona 275.000 euros al seu fill, de 35 anys. La donació es formalitza en escriptura pública i la transferència del diners es realitza el mateix dia en què s’atorga l’escriptura. En els últims tres anys el fill no ha rebut cap altra donació del pare. El patrimoni preexistent del fill és de 12.000 euros.",
  atcExample1Result: "Quota íntegra: 15.250,00 €",
  atcExample2: "En el cas anterior, si la quantitat donada no s'hagués documentat en escriptura pública, o bé l’escriptura s’hagués formalitzat transcorregut el termini d’un mes des del lliurament dels diners (data de la transferència) s'aplicaria la tarifa de l'escala general de l'impost",
  atcExample11: "Tipus mitjà efectiu de gravamen: 5,40 % (quota tributària ajustada teòrica/base liquidable teòrica) x100",
  atcForm: "L'accés al formulari electrònic del model 651 requereix identificació digital.",
} as const;
