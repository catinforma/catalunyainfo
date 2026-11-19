/**
 * Every rule and figure of the Catalan inheritance tax calculator (impost
 * sobre successions, adquisicions per causa de mort), each with the article
 * and the words of the law. Nothing numeric is typed anywhere else: the
 * engine, the page and the tests read from here. Client-safe.
 *
 * ## Read on 19 Nov 2026 (curl + the Portal Jurídic / DOGC document API)
 *
 *  - The rules are no longer in Llei 19/2010: its disposicions were repealed
 *    by the disposició derogatòria 12 of Decret legislatiu 1/2024, de 12 de
 *    març, which approved the llibre sisè del Codi tributari de Catalunya
 *    (text refós of the ceded taxes; DOGC núm. 9122, 14.3.2024, in force
 *    15.3.2024). The Portal Jurídic's consolidated Llei 19/2010 (version
 *    "15/03/2024 -") marks every article "[No vigent]".
 *  - Codi tributari, llibre sisè, consolidated text "Vigència 14/07/2026 -"
 *    (Portal Jurídic document 980772, version 2161469), Títol III, arts.
 *    631-1 to 634-5, and Títol VIII, art. 682-1. The parts used here were not
 *    changed after the text refós except art. 633-4.1 bis, added by Decret
 *    llei 5/2025 (art. 4), in force "als tres mesos de l'endemà de la
 *    publicació" (DF 2a.2): 27 June 2025, as the ATC states. Llei 11/2026, de
 *    9 de juliol (2026 budget measures), touched only art. 631-20.2 (forest
 *    estates) and the donations chapter (632-1.4, 632-16.2). A DOGC search of
 *    10.7.2026-19.11.2026 finds laws 12 to 15/2026 and no decree-law after
 *    Decret llei 6/2026 (5 May); Llei 15/2026 (disability wording, 9.11.2026)
 *    does not touch the Codi tributari.
 *  - Agència Tributària de Catalunya (atc.gencat.cat/ca/tributs/isd/herencies/):
 *    reductions, bonificació, tarifa and coefficients (with the dates from
 *    which each applies), the six worked examples (deaths in 2023, the same
 *    rules), the habitual-home examples (500.000 € shared, 180.000 € floor),
 *    the "excés de quota" rule, insurance accumulation, deadline and
 *    extension, competence, models 650/660 and the help program (2026
 *    version for Windows published 29.10.2026). Its simulators page lists no
 *    simulator for this tax.
 *  - BOE: Llei 29/1987 (BOE-A-1987-28141, last update 28/12/2022) art. 22.2,
 *    last paragraphs (the excess rule the ATC applies); Reial decret
 *    1629/1991 (BOE-A-1991-27678, last update 05/04/2023) arts. 67.1.a and 68.
 *
 * ## Do not print
 *
 * Any 2027 change (none published on 19 Nov 2026); usufruct cases (base
 * imposable teòrica); the business, agricultural, forest, cultural and
 * decennial reductions; pre-1987 insurance policies; whether collaterals by
 * affinity get the home reduction (the law says "col·laterals": the
 * calculator does not apply it to in-laws and says so); an official online
 * simulator (there is none: link the help program and the ATC's examples).
 *
 * A test fails from RULES_UNTIL: re-read the Codi tributari (Títol III) and
 * the 2027 budget and fiscal-measures law, then move both dates.
 */

export const RULES_AS_OF = "2026-11-19";
/** From this day a test fails: Catalan budget laws often change this tax from 1 January. */
export const RULES_UNTIL = "2027-01-01";
/** The consolidated text read: in force from this day (Portal Jurídic version 2161469). */
export const CODE_CONSOLIDATED_FROM = "2026-07-14";
/** Decret llei 5/2025, art. 4 (633-4.1 bis): in force three months after the day after publication. */
export const GENDER_VIOLENCE_BONUS_FROM = "2025-06-27";
/** The ATC's 2026 help program for model 650 (Windows version), as its page dates it. */
export const HELP_PROGRAM_PUBLISHED = "2026-10-29";

export interface Source {
  name: string;
  publisher: string;
  ref: string;
  url: string;
  /** ATC pages: the Spanish edition, for the es and en pages. */
  urlEs?: string;
  read: string;
}

const ATC = "https://atc.gencat.cat/ca/tributs/isd/herencies";
const ATC_ES = "https://atc.gencat.cat/es/tributs/isd/herencies";

export const SOURCES = {
  code: {
    name: "Decret legislatiu 1/2024, de 12 de març, pel qual s'aprova el llibre sisè del Codi tributari de Catalunya",
    publisher: "Portal Jurídic de Catalunya (DOGC)",
    ref: "DOGC núm. 9122, 14/03/2024; text consolidat vigent des del 14/07/2026",
    url: "https://portaljuridic.gencat.cat/eli/es-ct/dlg/2024/03/12/1",
    read: RULES_AS_OF,
  },
  llei19: {
    name: "Llei 19/2010, del 7 de juny, de regulació de l'impost sobre successions i donacions",
    publisher: "Portal Jurídic de Catalunya (DOGC)",
    ref: "DOGC núm. 5648, 11/06/2010; derogada pel Decret legislatiu 1/2024 (DD 12)",
    url: "https://portaljuridic.gencat.cat/eli/es-ct/l/2010/06/07/19",
    read: RULES_AS_OF,
  },
  dl5_2025: {
    name: "Decret llei 5/2025, de 25 de març, pel qual s'adopten mesures urgents en matèria fiscal, de despeses de personal i altres d'administratives",
    publisher: "Portal Jurídic de Catalunya (DOGC)",
    ref: "art. 4.5 (633-4.1 bis) i disposició final segona",
    url: "https://portaljuridic.gencat.cat/eli/es-ct/dl/2025/03/25/5",
    read: RULES_AS_OF,
  },
  llei11_2026: {
    name: "Llei 11/2026, de 9 de juliol, de mesures fiscals, financeres, administratives i del sector públic",
    publisher: "Portal Jurídic de Catalunya (DOGC)",
    ref: "art. 37 (no canvia la tarifa, les reduccions ni la bonificació de les herències)",
    url: "https://portaljuridic.gencat.cat/eli/es-ct/l/2026/07/09/11",
    read: RULES_AS_OF,
  },
  atcReductions: { name: "Reduccions (herències)", publisher: "Agència Tributària de Catalunya", ref: "herències", url: `${ATC}/reduccions/`, urlEs: `${ATC_ES}/reduccions/`, read: RULES_AS_OF },
  atcInsuranceBase: {
    name: "Assegurances de vida: base imposable",
    publisher: "Agència Tributària de Catalunya",
    ref: "assegurances de vida",
    url: "https://atc.gencat.cat/ca/tributs/isd/assegurances-vida/base-imposable/",
    urlEs: "https://atc.gencat.cat/es/tributs/isd/assegurances-vida/base-imposable/",
    read: RULES_AS_OF,
  },
  atcBonus: { name: "Bonificació (herències)", publisher: "Agència Tributària de Catalunya", ref: "herències", url: `${ATC}/bonificacio/`, urlEs: `${ATC_ES}/bonificacio/`, read: RULES_AS_OF },
  atcScale: { name: "Tarifa i coeficients multiplicadors (herències)", publisher: "Agència Tributària de Catalunya", ref: "herències", url: `${ATC}/tarifa-coeficients-multiplicadors/`, urlEs: `${ATC_ES}/tarifa-coeficients-multiplicadors/`, read: RULES_AS_OF },
  atcExamples: { name: "Exemples pràctics d'herències", publisher: "Agència Tributària de Catalunya", ref: "casos pràctics 1 a 6", url: `${ATC}/exemples/`, urlEs: `${ATC_ES}/exemples/`, read: RULES_AS_OF },
  atcDeadline: { name: "Meritació, termini de presentació i pagament, i pròrroga", publisher: "Agència Tributària de Catalunya", ref: "herències", url: `${ATC}/termini-prorroga/`, urlEs: `${ATC_ES}/termini-prorroga/`, read: RULES_AS_OF },
  atcFile: { name: "Declarar una herència (models 660 i 650)", publisher: "Agència Tributària de Catalunya", ref: "tràmit", url: `${ATC}/declarar-herencia/`, urlEs: `${ATC_ES}/declarar-herencia/`, read: RULES_AS_OF },
  atcCompetence: { name: "Administració competent (herències)", publisher: "Agència Tributària de Catalunya", ref: "herències", url: `${ATC}/competencies/`, urlEs: `${ATC_ES}/competencies/`, read: RULES_AS_OF },
  atcHelpProgram: {
    name: "Programa d'ajuda per a successions i donacions (model 650)",
    publisher: "Agència Tributària de Catalunya",
    ref: "versió 2026 per a Windows publicada el 29.10.2026",
    url: "https://atc.gencat.cat/ca/utilitats/programes-ajuda/pa-isd/",
    urlEs: "https://atc.gencat.cat/es/utilitats/programes-ajuda/pa-isd/",
    read: RULES_AS_OF,
  },
  lisd: { name: "Ley 29/1987, de 18 de diciembre, del Impuesto sobre Sucesiones y Donaciones", publisher: "BOE", ref: "BOE-A-1987-28141, art. 22.2", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1987-28141", read: RULES_AS_OF },
  risd: { name: "Real Decreto 1629/1991, de 8 de noviembre, Reglamento del Impuesto sobre Sucesiones y Donaciones", publisher: "BOE", ref: "BOE-A-1991-27678, arts. 67 y 68", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1991-27678", read: RULES_AS_OF },
} as const satisfies Record<string, Source>;

export type SourceId = keyof typeof SOURCES;

/** Article labels, as the page cites them ("Codi tributari de Catalunya, art. 631-2"). */
export const ARTICLE = {
  kinship: "631-2",
  disability: "631-3",
  elderly: "631-4",
  insurance: "631-5",
  home: "631-17",
  homeCollaterals: "631-18.2",
  homeKeep: "631-19",
  scale: "633-1",
  coefficient: "633-3",
  bonus: "633-4",
  partners: "634-1",
  stepchildren: "634-2",
  file: "682-1",
} as const;

/* ------------------------------------------------------------- Groups --- */

export type Group = "I" | "II" | "III" | "IV";

/** Art. 631-2: group I ends the day the descendant turns 21. */
export const GROUP_I_AGE_LIMIT = 21;

/** Art. 631-2 a): 100.000 € plus 12.000 € per year under 21, at most 196.000 €. */
export const KINSHIP_GROUP_I = { base: 100_000, perYear: 12_000, max: 196_000 } as const;

/** Art. 631-2 b) to d). */
export const KINSHIP = { spouse: 100_000, child: 100_000, descendant: 50_000, ascendant: 30_000, groupIII: 8_000, groupIV: 0 } as const;

/** Art. 631-3. */
export const DISABILITY = { from33: 275_000, from65: 650_000 } as const;

/** Art. 631-4: group II, 75 or older; not with the disability reduction. */
export const ELDERLY = { age: 75, amount: 275_000 } as const;

/** Art. 631-5: 100 % of the insurance, up to 25.000 € per taxpayer. */
export const INSURANCE = { percent: 100, max: 25_000 } as const;

/** Arts. 631-17 and 631-18.2: 95 % of the home, 500.000 € shared by the heirs, never below 180.000 € each; collaterals over 65 who lived with the deceased two years. */
export const HOME = { percent: 95, sharedCap: 500_000, individualFloor: 180_000, collateralAgeOver: 65, cohabitationYears: 2, keepYears: 5 } as const;

/* -------------------------------------------------------------- Scale --- */

/** Art. 633-1, as printed: from `from`, the quota of the lower slices plus `rate` % of the rest. Applies since 1 Jan 2010 (ATC). */
export const SCALE: readonly { from: number; quota: number; rate: number }[] = [
  { from: 0, quota: 0, rate: 7 },
  { from: 50_000, quota: 3_500, rate: 11 },
  { from: 150_000, quota: 14_500, rate: 17 },
  { from: 400_000, quota: 57_000, rate: 24 },
  { from: 800_000, quota: 153_000, rate: 32 },
];
export const SCALE_FROM = "2010-01-01";

/** Art. 633-3: prior wealth brackets (upper limit, inclusive) and the coefficient of groups I-II; III and IV do not change with wealth. Since 1 May 2020 (ATC). */
export const COEFFICIENTS: readonly { upTo: number | null; groupsIandII: number; groupIII: number; groupIV: number }[] = [
  { upTo: 500_000, groupsIandII: 1, groupIII: 1.5882, groupIV: 2 },
  { upTo: 2_000_000, groupsIandII: 1.1, groupIII: 1.5882, groupIV: 2 },
  { upTo: 4_000_000, groupsIandII: 1.15, groupIII: 1.5882, groupIV: 2 },
  { upTo: null, groupsIandII: 1.2, groupIII: 1.5882, groupIV: 2 },
];
export const COEFFICIENTS_FROM = "2020-05-01";

/* -------------------------------------------------------------- Bonus --- */

/** Art. 633-4.1: spouses (and stable partners, art. 634-1). */
export const SPOUSE_BONUS = 99;

/**
 * Art. 633-4.2, as printed: from `from` of the base imposable, the average
 * bonus of the lower slices (`avg`), then `marginal` % on the next `width`
 * euros (null: the rest). Since 1 May 2020 (ATC).
 */
export interface BonusSlice {
  from: number;
  avg: number;
  width: number | null;
  marginal: number;
}

/** a) Group I. */
export const BONUS_GROUP_I: readonly BonusSlice[] = [
  { from: 0, avg: 0, width: 100_000, marginal: 99 },
  { from: 100_000, avg: 99, width: 100_000, marginal: 97 },
  { from: 200_000, avg: 98, width: 100_000, marginal: 95 },
  { from: 300_000, avg: 97, width: 200_000, marginal: 90 },
  { from: 500_000, avg: 94.2, width: 250_000, marginal: 80 },
  { from: 750_000, avg: 89.47, width: 250_000, marginal: 70 },
  { from: 1_000_000, avg: 84.6, width: 500_000, marginal: 60 },
  { from: 1_500_000, avg: 76.4, width: 500_000, marginal: 50 },
  { from: 2_000_000, avg: 69.8, width: 500_000, marginal: 40 },
  { from: 2_500_000, avg: 63.84, width: 500_000, marginal: 25 },
  { from: 3_000_000, avg: 57.37, width: null, marginal: 20 },
];

/**
 * b) The rest of group II (children and other descendants of 21 or more, ascendants).
 * At 2.000.000 € the exact average is 35,875 %: the table prints 35,88, the
 * rounding rule of 633-4.5 gives 35,87. The engine computes every base by the
 * rule (the table's averages are only printed on the page).
 */
export const BONUS_GROUP_II: readonly BonusSlice[] = [
  { from: 0, avg: 0, width: 100_000, marginal: 60 },
  { from: 100_000, avg: 60, width: 100_000, marginal: 55 },
  { from: 200_000, avg: 57.5, width: 100_000, marginal: 50 },
  { from: 300_000, avg: 55, width: 200_000, marginal: 45 },
  { from: 500_000, avg: 51, width: 250_000, marginal: 40 },
  { from: 750_000, avg: 47.33, width: 250_000, marginal: 35 },
  { from: 1_000_000, avg: 44.25, width: 500_000, marginal: 30 },
  { from: 1_500_000, avg: 39.5, width: 500_000, marginal: 25 },
  { from: 2_000_000, avg: 35.88, width: 500_000, marginal: 20 },
  { from: 2_500_000, avg: 32.7, width: 500_000, marginal: 10 },
  { from: 3_000_000, avg: 28.92, width: null, marginal: 0 },
];
export const BONUS_FROM = "2020-05-01";

/* ------------------------------------------------------------ Filing --- */

/** RD 1629/1991 arts. 67.1.a and 68: six months from the death; six more if asked within the first five. */
export const DEADLINE = { months: 6, extensionMonths: 6, askWithinMonths: 5 } as const;

/* ------------------------------------------------------------ Quotes --- */

/** The law's and the ATC's words, as published (Catalan, except the BOE's Spanish). Tests check each figure appears in its quote. */
export const QUOTE = {
  kinshipLead: "En les adquisicions per causa de mort, s'aplica la reducció que correspongui, d'entre les següents, per raó del grau de parentiu entre l'adquirent i el causant:",
  groupI: "a) Grup I (adquisicions per descendents menors de vint-i-un anys): 100.000, més 12.000 euros per cada any de menys de vint-i-un que tingui el causahavent, fins a un límit de 196.000 euros.",
  groupII: "b) Grup II (adquisicions per descendents de vint-i-un anys o més, cònjuges i ascendents): - Cònjuge: 100.000 euros. - Fill o filla: 100.000 euros. - Resta de descendents: 50.000 euros. - Ascendents: 30.000 euros.",
  groupIII: "c) Grup III (adquisicions per col·laterals de segon i tercer grau i per ascendents i descendents per afinitat): 8.000 euros.",
  groupIV: "d) Grup IV (adquisicions per col·laterals de quart grau o de graus més distants i per estranys): no s'aplica cap reducció per raó de parentiu.",
  disability:
    "Juntament amb les reduccions que puguin correspondre en funció del grau de parentiu entre l'adquirent i el causant, en les adquisicions per causa de mort per persones amb discapacitat física, psíquica o sensorial amb un grau de discapacitat igual o superior al 33% s'aplica una reducció de 275.000 euros. Si el grau de discapacitat és igual o superior al 65%, la reducció és de 650.000 euros.",
  elderly: "1. En les adquisicions per causa de mort per persones del grup II de setanta-cinc anys o més s'aplica una reducció de 275.000 euros. 2. Aquesta reducció és incompatible amb la reducció per discapacitat que estableix l'article 631-3.",
  insurance:
    "1. En les adquisicions per causa de mort, s'aplica una reducció del 100%, amb un límit de 25.000 euros, de les quantitats percebudes per les persones beneficiàries de contractes d'assegurances de vida, si llur parentiu amb el contractant mort és el de cònjuge, de descendent o d'ascendent.",
  insuranceOnce: "2. La reducció per assegurances de vida és única per subjecte passiu, independentment del nombre de contractes d'assegurança de vida dels quals sigui beneficiari.",
  home: "En les adquisicions per causa de mort que corresponguin al cònjuge, als descendents, als ascendents o als col·laterals del causant, es pot aplicar en la base imposable una reducció del 95% del valor de l'habitatge habitual del causant, amb un límit de 500.000 euros pel valor conjunt de l'habitatge, que s'ha de prorratejar entre els subjectes passius en proporció a llur participació; en tot cas, el límit individual resultant del prorrateig entre els subjectes passius no pot ésser de menys de 180.000 euros.",
  homeCollaterals: "2. Els parents col·laterals del causant, per a poder gaudir de la reducció que estableix aquesta subsecció, han d'ésser més grans de seixanta-cinc anys i hi han d'haver conviscut com a mínim els dos anys anteriors a la seva mort.",
  homeKeep:
    "1. El gaudi definitiu de la reducció que estableix aquesta subsecció resta condicionat al manteniment de l'habitatge, o de l'habitatge subrogat de valor equivalent que esdevingui habitatge habitual del causahavent, en el patrimoni de l'adquirent durant els cinc anys següents a la mort del causant, llevat que l'adquirent mori dins aquest termini.",
  homeAtcExample3: "com que s'adquireix només el 50 % de l’habitatge, el valor màxim de la reducció a aplicar és de 250.000 euros (el 50 % sobre 500.000 €), amb el límit individual de 180.000 €.",
  scale: "La quota íntegra de l'impost sobre successions i donacions s'obté de resultes d'aplicar a la base liquidable l'escala següent:",
  coefficient:
    "La quota tributària per l'impost sobre successions i donacions s'obté aplicant a la quota íntegra el coeficient multiplicador que correspongui dels que s'indiquen a continuació, establerts en funció del patrimoni preexistent del contribuent i del grup, segons el grau de parentiu assenyalat en l'article 631-2:",
  excess:
    "quan la diferència entre la quota tributària obtinguda per l'aplicació del coeficient multiplicador que correspongui i la que resultaria d'aplicar a la mateixa quota íntegra el coeficient immediat inferior sigui més gran que la que hi hagi entre l'import del patrimoni preexistent tingut en compte per a la liquidació i l'import màxim del tram de patrimoni preexistent que motivaria l'aplicació de l'esmentat coeficient multiplicador inferior, la quota s’ha de reduir en l’import de l’excés.",
  spouseBonus:
    "1. Els cònjuges poden aplicar una bonificació del 99% de la quota tributària de l'impost sobre successions en les adquisicions per causa de mort, incloses les quantitats percebudes per les persones beneficiàries d'assegurances de vida que s'acumulen a la resta de béns i drets que integren llur porció hereditària.",
  genderViolenceBonus:
    "1.bis. Els descendents i els ascendents consanguinis poden aplicar una bonificació del 99 % de la quota tributària de l'impost sobre successions en les adquisicions per causa de mort, d'una causant víctima de violència masclista, que hagi mort com a conseqüència d'actes derivats d'aquesta violència, incloses les quantitats derivades d'assegurances de vida que s'acumulen a la porció hereditària.",
  groupBonus: "2. La resta de contribuents dels grups I i II poden aplicar la bonificació en el percentatge mitjà ponderat que resulti de l'aplicació per a cada tram de base imposable dels percentatges següents:",
  bonusExclusion:
    "4. Els contribuents dels grups I i II a què fa referència l'apartat 2 no tenen dret a la bonificació en el cas que optin per aplicar qualsevol de les reduccions i exempcions següents: a) Les reduccions que estableixen les subseccions tercera a desena, llevat de la reducció per habitatge habitual establerta per la subsecció sisena, que és aplicable en tots els casos.",
  bonusRounding:
    "5. El percentatge mitjà ponderat resultant ha de tenir només dos decimals, de manera que s'aproximen les mil·lèsimes a la centèsima més propera: si la mil·lèsima és igual o inferior a 5, es manté la centèsima; si és superior a 5, s'aproxima a la centèsima superior.",
  partners: "1. Els membres de les parelles estables queden assimilats als cònjuges, a l'efecte de l'impost sobre successions i donacions.",
  stepchildren:
    "Les relacions entre un cònjuge o un convivent en parella estable i els fills del seu cònjuge o de l'altre membre de la parella queden assimilades, a l'efecte de l'impost sobre successions i donacions, a les relacions entre ascendents i fills.",
  insuranceAccumulates:
    "Les quantitats percebudes s'han d'acumular a la resta de béns i drets que constitueixen la porció hereditària de la persona beneficiària, quan la persona causant sigui la persona contractant de l'assegurança, en cas d'assegurança individual, o la persona assegurada, en cas d'assegurança col·lectiva.",
  file: "1. Els contribuents estan obligats a presentar i subscriure la declaració de l'impost sobre successions i donacions, signada per ells mateixos o per llurs representants, dins els terminis i en els termes i les condicions que siguin determinats per reglament.",
  deadlineAtc: "El termini per presentar i ingressar l’autoliquidació per l'adquisició hereditària és de sis mesos des de la data de defunció de la persona causant.",
  extensionAtc: "Durant els cinc primers mesos des de la data de defunció es pot demanar una pròrroga del termini per sis mesos més, de manera que aquests sis mesos s’afegeixen als sis mesos inicials",
  extensionInterest: "La pròrroga comporta el pagament d'interessos de demora pels dies prorrogats.",
  deadlineBoe:
    "a) Cuando se trate de adquisiciones por causa de muerte, incluidas las de los beneficiarios de contratos de seguro de vida, en el de seis meses, contados desde el día del fallecimiento del causante o desde aquel en que adquiera firmeza la declaración de fallecimiento.",
  extensionBoe: "2. La solicitud de prórroga se presentará por los herederos, albaceas o administradores del caudal relicto dentro de los cinco primeros meses del plazo de presentación",
  model650: "El model 650 és l’autoliquidació individual de l’impost sobre successions, en la qual s’identifica un sol contribuent i es calcula la quota que li correspon d’acord amb els béns i drets que adquireixi.",
  competence:
    "Si la persona beneficiària de l’herència resideix a Espanya, l’Administració competent és la de la comunitat autònoma en la qual la persona difunta va residir el major nombre de dies durant els últims cinc anys; el còmput es fa de data a data i finalitza el dia anterior a la data de defunció.",
  dl5InForce: "2. Els articles 4 i 5 entren en vigor als tres mesos de l'endemà de la publicació al Diari Oficial de la Generalitat de Catalunya d'aquest Decret llei.",
} as const;
