import type { Block } from "@/lib/content/blocks";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { calcPath, type CalculatorId } from "@/lib/programmatic/calculators/paths";
import { DEADLINE as ISD_DEADLINE, SOURCES as ISD_SOURCES } from "@/lib/programmatic/inheritance-tax/rules";
import { DEADLINE as PV_DEADLINE } from "@/lib/programmatic/plusvalia/rules";

import { B2_PATHS, b2Related, b2link, callout, faq, h2, lead, list, paras, table, verifiedLine, type B2Article, type B2Source } from "./shared";

/**
 * "Qué hacer cuando fallece un familiar: trámites y plazos" (19 Nov 2026),
 * Spain-wide with the Catalan differences, in ca, es and en.
 *
 * Why this page: steady demand for "trámites fallecimiento", "certificado de
 * últimas voluntades", "certificado de seguros de cobertura de fallecimiento",
 * "plazo impuesto sucesiones" and "pensión de viudedad cómo solicitar"; the
 * site had the calculators (inheritance tax in four communities and the
 * 21-territory comparison, gift tax, plusvalía, widow's pension) but no page
 * that puts the steps in order. The calculators link back here.
 *
 * DEATH_STEPS_AS_OF 2026-11-19. Every fact was read that day (fact pack:
 * research_notes/death-steps-nov2026.md). Sources and quotes:
 *
 *  - BOE, Ley 20/2011 del Registro Civil (BOE-A-2011-12628, in force
 *    30/04/2021): art. 62 «La inscripción en el Registro Civil de la defunción
 *    es obligatoria», declaration «acompañado del certificado médico de la
 *    defunción», «practicará inmediatamente la inscripción y expedirá el
 *    certificado», licence «en el plazo que reglamentariamente se establezca»;
 *    art. 63 who must promote it; art. 64 (Ley 19/2015 wording) hospitals
 *    report electronically to the Registry and the INE; art. 65 elsewhere «a la
 *    mayor brevedad posible»; art. 66 «En ningún caso podrá efectuarse la
 *    inscripción de defunción sin que se haya presentado ante el Registro Civil
 *    el certificado médico de defunción»; art. 67.2 judicial cases: licence
 *    «cuando se autorice por el órgano judicial competente».
 *  - Ministerio de Justicia e-office: "Inscripción de defunción" («agentes
 *    funerarios que, en representación de la familia, suelen ser los encargados
 *    de comunicar la defunción ante el Registro Civil»); "Certificado de
 *    defunción" (at once if available online; by post without Cl@ve; the same
 *    certificate again only after 15 days); "Certificado de Actos de Última
 *    Voluntad" («La solicitud no podrá presentarse hasta transcurridos 15 días
 *    hábiles desde la fecha del fallecimiento», «tasa 006», online only for
 *    deaths after 2 April 2009 not registered at a juzgado de paz, otherwise
 *    in person at C/ Bolsa 8, Madrid, by appointment, or by post with the
 *    literal death certificate; 90 natural days to download); "Certificado de
 *    Contratos de Seguros de cobertura de fallecimiento" (same 15 working days
 *    and fee; «disponible como norma general a las 24 horas», «no superior a 3
 *    días hábiles», «El plazo que la Administración tiene para dicha expedición
 *    es de 7 días hábiles»). mjusticia.gob.es: the wills certificate «acredita
 *    si una persona ha otorgado testamento/s y ante qué Notario/s» and «se
 *    precisa para la realización de cualquier acto sucesorio».
 *  - BOE, Ley 20/2005 (BOE-A-2005-18668): art. 2 purpose, art. 3.3 the
 *    presumption covers «la existencia del contrato», not the cover; art. 4.1
 *    life insurance with death cover and accident insurance covering death;
 *    art. 6.2 «quince días desde la fecha de defunción» (the e-office applies
 *    15 working days: the later date is printed); art. 6.3 five years; art. 7
 *    certificate content and the insurer's answer to a non-beneficiary.
 *  - Portal Jurídic de Catalunya, Decret 297/1997 (policia sanitària
 *    mortuòria, version 2169866, current): art. 11.1 «No es podrà donar
 *    destinació final a un cadàver abans del transcurs de 24 hores des de la
 *    defunció» (except autopsy or organ removal); art. 35.1 transitory
 *    conservation compulsory after 48 hours (72 with judicial intervention).
 *  - BOE, Estatuto de los Trabajadores art. 37.3.b bis (version in force
 *    23/10/2026): «Dos días por el fallecimiento del cónyuge, pareja de hecho o
 *    parientes hasta el segundo grado de consanguinidad o afinidad», two more
 *    with travel (same quote as lib/programmatic/paid-leave/rules.ts).
 *  - BOE, Código civil: arts. 657, 658, 808, 834, 912, 1003, 1005 (notary, 30
 *    natural days, «se entenderá aceptada la herencia pura y simplemente»),
 *    1010, 1014 (30 days, notarial inventory), 1023, 9.8 and 16.1 (vecindad
 *    civil). Ley del Notariado arts. 55 and 56 (Ley 15/2015): declaration of
 *    heirs by notarial acta, «información del Registro Civil y del Registro
 *    General de Actos de Última Voluntad», two witnesses, «veinte días hábiles».
 *  - Portal Jurídic, Codi civil de Catalunya, llibre quart (Llei 10/2008;
 *    consolidated version 2165634 "con/20270204", which includes Llei 13/2026,
 *    DOGC 9722 of 4/8/2026, in force «al cap de sis mesos»): arts. 442-1,
 *    442-3, 442-5.2 (one year), 442-7, 451-3, 451-4, 451-5 («la quarta part»),
 *    452-1 (quarta vidual), 461-12.1-2, 461-15.1-2, 461-17.1, 461-18, 461-20.
 *    Llei 13/2026 rewrites 461-12 (paragraphs 1 and 2 unchanged) and 461-16,
 *    and none of the other articles quoted here.
 *  - BOE, RD 1629/1991 arts. 67.1.a and 68 (six months; extension asked in
 *    the first five, granted by silence after one month, with interest);
 *    Ley 29/1987 art. 8.1.a (banks subsidiarily liable; the cheque to the tax
 *    authority excluded); TRLRHL art. 110.2.b («seis meses prorrogables hasta
 *    un año a solicitud del sujeto pasivo») and 108.4 (up to 95 %); LIRPF art.
 *    13 and 97.1; LGT art. 39.1. ATC "termini i pròrroga" page (six months,
 *    five to ask, «interessos de demora», counted «de data a data»).
 *  - BOE, LGSS (BOE-A-2015-11724): arts. 216, 218, 224.1 and 224.3 (as worded
 *    by RDL 31/2026), 230, 53.1. Seguridad Social: auxilio «46,50 euros» and
 *    who caused it (alta or a contributory retirement or permanent incapacity
 *    pensioner); orphan's pension «el 20% de la base reguladora»; widow's
 *    pension effects (the day after the death if applied within 3 months; a
 *    pensioner's, the first day of the next month; at most 3 months back);
 *    how to apply (Portal de Prestaciones, form, CAISS by appointment on 901
 *    10 65 70 or 915 41 25 30, any official registry).
 *  - Banco de España, Portal del Cliente Bancario, "En una cuenta corriente":
 *    before the adjudication «las entidades de crédito no deben permitir
 *    disposiciones en las cuentas del cliente fallecido», with three
 *    exceptions; joint accounts (indistinta, mancomunada).
 *
 * Not printed: the tasa 006 amount (no official page read shows it), how
 * long the wills certificate takes, other communities' burial rules, the EU
 * Succession Regulation (EUR-Lex could not be read), bank or utility
 * deadlines (none in the rules read), the deceased's own pension after death.
 *
 * Re-read by DEATH_STEPS_REREAD_BY (tax rules and Social Security amounts can
 * change from 1 January; Llei 13/2026 takes effect on 4 Feb 2027). A test
 * fails after it.
 */
export const DEATH_STEPS_AS_OF = "2026-11-19";
export const DEATH_STEPS_REREAD_BY = "2027-01-15";

const SS = "https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/10964/10966";
const MJ = "https://sede.mjusticia.gob.es/es/tramites";
export const DEATH_STEPS_URLS = {
  lrc: "https://www.boe.es/buscar/act.php?id=BOE-A-2011-12628",
  cc: "https://www.boe.es/buscar/act.php?id=BOE-A-1889-4763",
  notariado: "https://www.boe.es/buscar/act.php?id=BOE-A-1862-4073",
  insuranceAct: "https://www.boe.es/buscar/act.php?id=BOE-A-2005-18668",
  lgss: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724",
  risd: "https://www.boe.es/buscar/act.php?id=BOE-A-1991-27678",
  lisd: "https://www.boe.es/buscar/act.php?id=BOE-A-1987-28141",
  trlrhl: "https://www.boe.es/buscar/act.php?id=BOE-A-2004-4214",
  lirpf: "https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764",
  lgt: "https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186",
  et: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430",
  cccat: "https://portaljuridic.gencat.cat/eli/es-ct/l/2008/07/10/10",
  llei13: "https://portaljuridic.gencat.cat/eli/es-ct/l/2026/08/03/13",
  mortuary: "https://portaljuridic.gencat.cat/eli/es-ct/d/1997/11/25/297",
  mjRegister: `${MJ}/inscripcion-defuncion`,
  mjDeath: `${MJ}/certificado-defuncion`,
  mjWills: `${MJ}/certificado-actos-ultima`,
  mjWillsInfo: "https://www.mjusticia.gob.es/es/ciudadania/tramites/certificado-actos-ultima",
  mjInsurance: `${MJ}/certificado-contratos-seguro`,
  ssDeath: SS,
  ssWidowEffects: `${SS}/28489/28493`,
  ssOrphan: `${SS}/28520/28523`,
  ssGrant: `${SS}/28558`,
  ssHowTo: "https://www.seg-social.es/wps/portal/wss/internet/Pensionistas/Servicios/34887/34924",
  atcDeadlineCa: ISD_SOURCES.atcDeadline.url,
  atcDeadlineEs: ISD_SOURCES.atcDeadline.urlEs,
  atcHelpCa: ISD_SOURCES.atcHelpProgram.url,
  atcHelpEs: ISD_SOURCES.atcHelpProgram.urlEs,
  bde: "https://clientebancario.bde.es/pcb/es/menu-horizontal/productosservici/herencias/guia-textual/incidencias_derivadas_fallecimiento/En_una_cuenta_corriente.html",
} as const;

const U = DEATH_STEPS_URLS;

const SOURCES: B2Source[] = [
  { name: "Ley 20/2011, del Registro Civil (arts. 62 a 67)", url: U.lrc, publisher: "BOE" },
  { name: "Inscripción de defunción", url: U.mjRegister, publisher: "Ministerio de Justicia" },
  { name: "Certificado de defunción", url: U.mjDeath, publisher: "Ministerio de Justicia" },
  { name: "Certificado de Actos de Última Voluntad (solicitud)", url: U.mjWills, publisher: "Ministerio de Justicia" },
  { name: "Certificado de Actos de Última Voluntad (información)", url: U.mjWillsInfo, publisher: "Ministerio de Justicia" },
  { name: "Certificado de Contratos de Seguros de cobertura de fallecimiento", url: U.mjInsurance, publisher: "Ministerio de Justicia" },
  { name: "Ley 20/2005, Registro de Contratos de Seguros de cobertura de fallecimiento", url: U.insuranceAct, publisher: "BOE" },
  { name: "Decret 297/1997, Reglament de policia sanitària mortuòria (arts. 11 i 35)", url: U.mortuary, publisher: "Portal Jurídic de Catalunya" },
  { name: "Estatuto de los Trabajadores (art. 37.3)", url: U.et, publisher: "BOE" },
  { name: "Código civil (arts. 9.8, 16, 657, 658, 808, 834, 912, 1003, 1005, 1010, 1014 y 1023)", url: U.cc, publisher: "BOE" },
  { name: "Ley del Notariado (arts. 55 y 56)", url: U.notariado, publisher: "BOE" },
  { name: "Llei 10/2008, llibre quart del Codi civil de Catalunya (successions)", url: U.cccat, publisher: "Portal Jurídic de Catalunya" },
  { name: "Llei 13/2026, de modificació del Codi civil de Catalunya (suports)", url: U.llei13, publisher: "Portal Jurídic de Catalunya" },
  { name: "Real Decreto 1629/1991, Reglamento del Impuesto sobre Sucesiones (arts. 67 y 68)", url: U.risd, publisher: "BOE" },
  { name: "Ley 29/1987, del Impuesto sobre Sucesiones y Donaciones (art. 8)", url: U.lisd, publisher: "BOE" },
  { name: "Meritació, termini de presentació i pagament, i pròrroga (herències)", url: U.atcDeadlineCa, publisher: "Agència Tributària de Catalunya" },
  { name: "Programa d'ajuda de successions i donacions (model 650)", url: U.atcHelpCa, publisher: "Agència Tributària de Catalunya" },
  { name: "Texto refundido de la Ley Reguladora de las Haciendas Locales (arts. 108 y 110)", url: U.trlrhl, publisher: "BOE" },
  { name: "Ley 35/2006, del IRPF (arts. 13 y 97)", url: U.lirpf, publisher: "BOE" },
  { name: "Ley 58/2003, General Tributaria (art. 39)", url: U.lgt, publisher: "BOE" },
  { name: "Ley General de la Seguridad Social (arts. 53, 216, 218, 224 y 230)", url: U.lgss, publisher: "BOE" },
  { name: "Muerte y supervivencia: prestaciones", url: U.ssDeath, publisher: "Seguridad Social" },
  { name: "Pensión de viudedad: hecho causante y efectos económicos", url: U.ssWidowEffects, publisher: "Seguridad Social" },
  { name: "Pensión de orfandad: cuantía", url: U.ssOrphan, publisher: "Seguridad Social" },
  { name: "Auxilio por defunción", url: U.ssGrant, publisher: "Seguridad Social" },
  { name: "Presentación de solicitudes de pensiones", url: U.ssHowTo, publisher: "Seguridad Social" },
  { name: "Incidencias derivadas del fallecimiento: en una cuenta corriente", url: U.bde, publisher: "Banco de España" },
];

/** A Markdown link. */
const a = (href: string, label: string) => `[${label}](${href})`;

/** The calculators this guide ties together; each links back here (InheritanceByRegion, GiftByRegion, the comparison, plusvalía and widow's pension pages). */
export const DEATH_STEPS_CALCULATORS: readonly CalculatorId[] = [
  "inheritance-tax-by-region",
  "inheritance-tax",
  "inheritance-tax-madrid",
  "inheritance-tax-andalucia",
  "inheritance-tax-valencia",
  "gift-tax-catalonia",
  "plusvalia",
  "widow-pension",
  "paid-leave",
  "home-purchase-costs",
];

export const DEATH_STEPS_META: Record<Locale, { title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    title: "Què cal fer quan mor un familiar: tràmits i terminis",
    seoTitle: "Què cal fer quan mor un familiar: tràmits i terminis",
    seoDescription: "Certificat de defunció, últimes voluntats i assegurances (15 dies hàbils, taxa 006), herència davant notari, successions i plusvàlua en 6 mesos, viduïtat.",
    excerpt: "Els tràmits per ordre: certificat mèdic, Registre Civil i llicència d'enterrament; certificats de defunció, últimes voluntats i assegurances; testament o declaració d'hereus; successions i plusvàlua en 6 mesos; viduïtat i auxili per defunció; què canvia a Catalunya.",
  },
  es: {
    title: "Qué hacer cuando fallece un familiar: trámites y plazos",
    seoTitle: "Qué hacer cuando fallece un familiar: trámites y plazos",
    seoDescription: "Certificado de defunción, últimas voluntades y seguros (15 días hábiles, tasa 006), herencia ante notario, sucesiones y plusvalía en 6 meses, viudedad.",
    excerpt: "Los trámites por orden: certificado médico, Registro Civil y licencia de entierro; certificados de defunción, últimas voluntades y seguros; testamento o declaración de herederos; sucesiones y plusvalía en 6 meses; viudedad y auxilio por defunción; qué cambia en Cataluña.",
  },
  en: {
    title: "What to do when someone dies in Spain: steps and deadlines",
    seoTitle: "What to do when someone dies in Spain: steps and deadlines",
    seoDescription: "Death certificate, last wills and life insurance certificates (after 15 working days, fee 006), the notary, inheritance tax and plusvalía in 6 months, pensions.",
    excerpt: "The steps in order: medical certificate, Civil Registry and burial licence; death, last-wills and life-insurance certificates; the will or a declaration of heirs; inheritance tax and plusvalía in 6 months; widow's pension and death grant; what is different in Catalonia.",
  },
};

/** One body for the three editions: the same sections, tables and links in each. */
export function buildDeathStepsBody(locale: Locale): Block[] {
  const L = locale;
  const m = ISD_DEADLINE.months;
  const e = ISD_DEADLINE.extensionMonths;
  const ask = ISD_DEADLINE.askWithinMonths;
  const pm = PV_DEADLINE.mortisCausaMonths;
  const calc = (id: CalculatorId, label: Record<Locale, string>) => a(calcPath(id, L), label[L]);

  const lrc = a(U.lrc, { ca: "Llei 20/2011 del Registre Civil", es: "Ley 20/2011 del Registro Civil", en: "Civil Registry Act (Ley 20/2011)" }[L]);
  const cc = a(U.cc, { ca: "Codi civil espanyol", es: "Código civil", en: "Spanish Civil Code" }[L]);
  const notariado = a(U.notariado, { ca: "Llei del notariat", es: "Ley del Notariado", en: "Notaries Act" }[L]);
  const insuranceAct = a(U.insuranceAct, { ca: "Llei 20/2005", es: "Ley 20/2005", en: "Act 20/2005" }[L]);
  const cccat = a(U.cccat, { ca: "llibre quart del Codi civil de Catalunya", es: "libro cuarto del Codi civil de Catalunya", en: "book four of the Catalan Civil Code" }[L]);
  const llei13 = a(U.llei13, { ca: "Llei 13/2026", es: "Llei 13/2026", en: "Catalan Act 13/2026 (Llei 13/2026)" }[L]);
  const mortuary = a(U.mortuary, { ca: "Reglament de policia sanitària mortuòria (Decret 297/1997)", es: "Reglament de policia sanitària mortuòria (Decret 297/1997)", en: "mortuary health regulation (Decree 297/1997)" }[L]);
  const et = a(U.et, { ca: "Estatut dels treballadors", es: "Estatuto de los Trabajadores", en: "Workers' Statute" }[L]);
  const lgss = a(U.lgss, { ca: "Llei general de la Seguretat Social", es: "Ley General de la Seguridad Social", en: "General Social Security Act" }[L]);
  const risd = a(U.risd, { ca: "Reial decret 1629/1991", es: "Real Decreto 1629/1991", en: "Royal Decree 1629/1991" }[L]);
  const lisd = a(U.lisd, { ca: "Llei de l'impost de successions", es: "Ley del Impuesto sobre Sucesiones", en: "Inheritance Tax Act" }[L]);
  const trlrhl = a(U.trlrhl, { ca: "Llei reguladora de les hisendes locals", es: "Ley Reguladora de las Haciendas Locales", en: "Local Finance Act" }[L]);
  const lirpf = a(U.lirpf, { ca: "Llei de l'IRPF", es: "Ley del IRPF", en: "Income Tax Act" }[L]);
  const lgt = a(U.lgt, { ca: "Llei general tributària", es: "Ley General Tributaria", en: "General Tax Act" }[L]);
  const mjRegister = a(U.mjRegister, { ca: "seu del Ministeri de Justícia", es: "sede del Ministerio de Justicia", en: "Ministry of Justice e-office" }[L]);
  const mjDeath = a(U.mjDeath, { ca: "certificat de defunció", es: "certificado de defunción", en: "death certificate" }[L]);
  const mjWills = a(U.mjWills, { ca: "certificat d'últimes voluntats", es: "certificado de últimas voluntades", en: "certificate of last wills" }[L]);
  const mjWillsInfo = a(U.mjWillsInfo, { ca: "Ministeri de Justícia", es: "Ministerio de Justicia", en: "Ministry of Justice" }[L]);
  const mjInsurance = a(U.mjInsurance, { ca: "certificat d'assegurances de cobertura de defunció", es: "certificado de seguros de cobertura de fallecimiento", en: "certificate of life insurance policies" }[L]);
  const atc = a(L === "ca" ? U.atcDeadlineCa : U.atcDeadlineEs, { ca: "Agència Tributària de Catalunya", es: "Agència Tributària de Catalunya", en: "Catalan Tax Agency (ATC)" }[L]);
  const atcHelp = a(L === "ca" ? U.atcHelpCa : U.atcHelpEs, { ca: "programa d'ajuda de l'ATC", es: "programa de ayuda de la ATC", en: "ATC's help program" }[L]);
  const ssEffects = a(U.ssWidowEffects, { ca: "Seguretat Social", es: "Seguridad Social", en: "Social Security" }[L]);
  const ssOrphan = a(U.ssOrphan, { ca: "Seguretat Social", es: "Seguridad Social", en: "Social Security" }[L]);
  const ssGrant = a(U.ssGrant, { ca: "fitxa de la Seguretat Social", es: "ficha de la Seguridad Social", en: "Social Security page" }[L]);
  const ssHowTo = a(U.ssHowTo, { ca: "Seguretat Social", es: "Seguridad Social", en: "Social Security" }[L]);
  const bde = a(U.bde, { ca: "Banc d'Espanya", es: "Banco de España", en: "Bank of Spain" }[L]);

  const isdCmp = calc("inheritance-tax-by-region", { ca: "la comparativa de l'impost de successions per comunitat", es: "la comparativa del impuesto de sucesiones por comunidad", en: "the inheritance tax comparison by region" });
  const isdCat = calc("inheritance-tax", { ca: "la calculadora de Catalunya", es: "la calculadora de Cataluña", en: "the Catalonia calculator" });
  const isdMad = calc("inheritance-tax-madrid", { ca: "la de Madrid", es: "la de Madrid", en: "Madrid's" });
  const isdAnd = calc("inheritance-tax-andalucia", { ca: "la d'Andalusia", es: "la de Andalucía", en: "Andalusia's" });
  const isdVal = calc("inheritance-tax-valencia", { ca: "la de la Comunitat Valenciana", es: "la de la Comunitat Valenciana", en: "the Valencia region's" });
  const giftCalc = calc("gift-tax-catalonia", { ca: "calculadora de l'impost de donacions", es: "calculadora del impuesto de donaciones", en: "gift tax calculator" });
  const pv = calc("plusvalia", { ca: "calculadora de la plusvàlua municipal", es: "calculadora de la plusvalía municipal", en: "plusvalía municipal calculator" });
  const widow = calc("widow-pension", { ca: "calculadora de la pensió de viduïtat", es: "calculadora de la pensión de viudedad", en: "widow's pension calculator" });
  const paidLeave = calc("paid-leave", { ca: "calculadora de permisos laborals", es: "calculadora de permisos laborales", en: "paid leave calculator" });
  const workingDays = calc("working-days", { ca: "calculadora de dies hàbils", es: "calculadora de días hábiles", en: "working days calculator" });
  const payDates = b2link("payDates", L, { ca: "quan es cobren les pensions", es: "cuándo se cobran las pensiones", en: "when pensions are paid" }[L]);

  const t = {
    es: {
      lead: `**Las primeras horas las resuelven el médico y, casi siempre, la funeraria:** el certificado médico de defunción, la inscripción en el Registro Civil y la licencia para el entierro o la incineración. **Pasados 15 días hábiles** se piden al Ministerio de Justicia el **certificado de últimas voluntades** (dice si había testamento y ante qué notario) y el **certificado de seguros de cobertura de fallecimiento**, los dos con la **tasa 006**. Con ellos, el notario da copia del testamento o tramita la **declaración de herederos**. Los impuestos tienen plazo: **sucesiones, ${m} meses** desde el fallecimiento (${e} más si pides prórroga en los ${ask} primeros) y **plusvalía municipal, ${pm} meses**, prorrogables hasta un año. La **pensión de viudedad** no prescribe, pero solo se paga con efectos de hasta 3 meses antes de pedirla: pídela en los 3 primeros meses.`,
      checkCaption: "Qué hacer y cuándo, contado desde el día del fallecimiento",
      checkHead: ["Cuándo", "Qué", "Quién o dónde", "Norma"],
      checkRows: [
        ["Primeras horas", "Certificado médico de defunción", "El médico que certifica la muerte. Sin él no se puede inscribir la defunción", "Ley 20/2011 del Registro Civil, arts. 62 y 66"],
        ["Primeras horas", "Inscripción de la defunción en el Registro Civil", "El hospital la comunica por vía electrónica; si la muerte es fuera, hay que avisar «a la mayor brevedad posible». Suele hacerlo la funeraria en nombre de la familia", "Ley 20/2011, arts. 63 a 65"],
        ["Tras la inscripción", "Licencia de entierro o incineración", "La expide el Registro Civil; si hay diligencias judiciales, cuando lo autoriza el juez", "Ley 20/2011, arts. 62.3 y 67.2"],
        ["Desde las 24 horas (Cataluña)", "Entierro o incineración", "No antes de 24 horas, salvo autopsia o donación de órganos; si es después de 48 horas, conservación transitoria obligatoria", "Decret 297/1997, arts. 11.1 y 35.1"],
        ["Los días siguientes", "Permiso en el trabajo", "2 días por el cónyuge, la pareja de hecho o un pariente hasta segundo grado; 2 más si tienes que desplazarte", "Estatuto de los Trabajadores, art. 37.3.b bis"],
        ["Cuando esté inscrita", "Certificado de defunción", "Sede del Ministerio de Justicia; al momento si los datos están disponibles", "Ministerio de Justicia"],
        ["Desde 15 días hábiles", "Certificado de últimas voluntades", "Ministerio de Justicia, con la tasa 006", "Ministerio de Justicia"],
        ["Desde 15 días hábiles", "Certificado de seguros de cobertura de fallecimiento", "Ministerio de Justicia, con la tasa 006; suele estar en 24 horas, como máximo 7 días hábiles", "Ley 20/2005, arts. 6 y 7"],
        ["Con los certificados", "Copia del testamento o declaración de herederos", "En la notaría. La declaración de herederos tarda como mínimo 20 días hábiles desde que se pide", "Ley del Notariado, arts. 55 y 56"],
        ["En los 3 primeros meses", "Pensión de viudedad y de orfandad", "Seguridad Social. No prescribe, pero los efectos solo se remontan 3 meses antes de la solicitud", "LGSS, art. 230"],
        [`Antes de ${ask} meses`, "Prórroga del impuesto de sucesiones, si te hace falta", "La oficina tributaria de la comunidad (en Cataluña, la ATC)", "RD 1629/1991, art. 68"],
        [`${m} meses`, `Impuesto de sucesiones (${m + e} meses con prórroga)`, "La comunidad donde la persona vivió más días de los últimos cinco años", "RD 1629/1991, art. 67"],
        [`${pm} meses`, "Plusvalía municipal, si hay una vivienda u otro inmueble urbano (hasta un año con prórroga)", "El ayuntamiento donde está el inmueble", "Ley de Haciendas Locales, art. 110.2"],
        ["6 meses desde que lo sabes (Cataluña)", "Inventario, para responder solo con los bienes de la herencia", "Ante notario, o el inventario privado que presentas a Hacienda con el impuesto", "Codi civil de Catalunya, art. 461-15"],
        ["1 año (Cataluña, sin testamento)", "Opción del viudo o la pareja estable: cambiar el usufructo universal por una cuarta parte de la herencia y el usufructo de la vivienda", "El cónyuge viudo o el conviviente superviviente", "Codi civil de Catalunya, art. 442-5"],
        ["Hasta 5 años", "Auxilio por defunción: 46,50 €", "Seguridad Social, para quien pagó el entierro", "LGSS, arts. 53, 218 y 230"],
        ["En el plazo de la renta de ese año", "Declaración de la renta del fallecido", "Los herederos: el ejercicio termina el día de la muerte", "Ley del IRPF, art. 13; Ley General Tributaria, art. 39"],
        ["Sin plazo legal", "Aceptar la herencia (en Cataluña) y avisar al banco", "Ver «Plazos que la ley no fija»", "Codi civil de Catalunya, art. 461-12"],
      ],
      checkNote: "Plazos contados desde el fallecimiento salvo que se diga otra cosa. Normas y páginas oficiales leídas el 19 de noviembre de 2026.",
      firstH: "Las primeras horas: certificado médico, Registro Civil y licencia de entierro",
      first: [
        `La ${lrc} dice que la inscripción de la defunción «es obligatoria» y que se hace con una declaración en el formulario oficial, «acompañado del certificado médico de la defunción» (art. 62). Sin ese certificado no hay inscripción: «En ningún caso podrá efectuarse la inscripción de defunción sin que se haya presentado ante el Registro Civil el certificado médico de defunción» (art. 66). Lo firma el médico que certifica la muerte.`,
        `Si la persona muere en un hospital, una clínica u otro centro sanitario, la dirección del centro comunica la defunción al Registro Civil y al INE por vía electrónica (art. 64). Si muere en casa o en otro lugar, los obligados (el médico que certifica, los parientes o quien ellos autoricen, quien vivía en la casa) informan a la autoridad «a la mayor brevedad posible» (arts. 63 y 65). Según la ${mjRegister}, son los «agentes funerarios que, en representación de la familia, suelen ser los encargados de comunicar la defunción ante el Registro Civil».`,
        `Con la documentación, el Registro Civil «practicará inmediatamente la inscripción y expedirá el certificado de la defunción», y después la **licencia para el entierro o incineración** «en el plazo que reglamentariamente se establezca» (art. 62.3): la ley no da un número de horas. Si hay indicios de muerte violenta o diligencias judiciales, la inscripción no da por sí sola la licencia, que se expide «cuando se autorice por el órgano judicial competente» (art. 67.2).`,
        `**En Cataluña**, el ${mortuary} fija el tiempo mínimo: «No es podrà donar destinació final a un cadàver abans del transcurs de 24 hores des de la defunció», salvo autopsia u obtención de órganos para trasplante (art. 11.1). Si el entierro va a ser más tarde de 48 horas, la conservación transitoria del cuerpo es obligatoria (art. 35.1; 72 horas si hay intervención judicial). Cada comunidad tiene su norma de policía sanitaria mortuoria: aquí solo citamos la catalana.`,
        `**En el trabajo**, el ${et} da «dos días por el fallecimiento del cónyuge, pareja de hecho o parientes hasta el segundo grado de consanguinidad o afinidad», y dos más si tienes que desplazarte (art. 37.3.b bis). Los demás permisos, en la ${paidLeave}.`,
      ],
      certsH: "Los certificados: defunción, últimas voluntades y seguros",
      certsIntro: `Son tres certificados distintos y los tres se piden en la sede electrónica del Ministerio de Justicia. El ${mjDeath} acredita la muerte. El ${mjWills} es, según el ${mjWillsInfo}, «el documento que acredita si una persona ha otorgado testamento/s y ante qué Notario/s», y «se precisa para la realización de cualquier acto sucesorio». El ${mjInsurance} dice en qué contratos vigentes figuraba la persona como asegurada y con qué aseguradora (${insuranceAct}, art. 7).`,
      certsCaption: "Los tres certificados del Ministerio de Justicia",
      certsHead: ["Certificado", "Desde cuándo", "Cómo se pide", "Cuánto tarda"],
      certsRows: [
        ["Defunción", "Desde que la defunción está inscrita", "En línea con Cl@ve o certificado digital, o sin identificarte (llega por correo postal). El mismo certificado no se puede volver a pedir hasta pasados 15 días", "Al momento, si los datos están disponibles en línea"],
        ["Últimas voluntades", "Pasados 15 días hábiles desde el fallecimiento", "En línea con Cl@ve y la tasa 006, si la muerte fue después del 2 de abril de 2009 y no está inscrita en un juzgado de paz; si no, en persona (calle Bolsa 8, Madrid, con cita previa) o por correo, con el certificado literal de defunción y el formulario 790", "La página no lo dice. Una vez listo, hay 90 días naturales para descargarlo"],
        ["Seguros de cobertura de fallecimiento", "Pasados 15 días hábiles desde el fallecimiento", "Igual: en línea con Cl@ve y la tasa 006, o en persona o por correo con el formulario 790", "Normalmente 24 horas, en algunos casos hasta 3 días hábiles; la Administración tiene 7 días hábiles"],
      ],
      certsNote: "Sede electrónica del Ministerio de Justicia, leída el 19 de noviembre de 2026. No publicamos el importe de la tasa 006: las páginas oficiales leídas no lo muestran.",
      certsAfter: [
        `La ley del registro de seguros habla de «quince días desde la fecha de defunción» (${insuranceAct}, art. 6.2); la sede del Ministerio dice 15 días **hábiles**, y es la cuenta que aplica. Los datos se guardan cinco años (art. 6.3). El certificado no garantiza que cobres: su presunción de veracidad se refiere «a la existencia del contrato», no a la cobertura (art. 3.3). Con él preguntas a cada aseguradora si eres beneficiario; si no lo eres, solo te dirá eso (art. 7.2). Entran los seguros de vida con cobertura de fallecimiento y los de accidentes que cubren la muerte (art. 4.1).`,
        `Para contar los 15 días hábiles, usa la ${workingDays}.`,
      ],
      inheritH: "La herencia: testamento o declaración de herederos",
      inherit: [
        `«Los derechos a la sucesión de una persona se transmiten desde el momento de su muerte» (${cc}, art. 657). La herencia se reparte por testamento y, a falta de él, por ley: el Código civil llama a la primera sucesión «testamentaria» y a la segunda, «legítima» (art. 658). También hay sucesión sin testamento cuando el testamento es nulo o no dispone de todos los bienes (art. 912).`,
        `**Si hay testamento**, el certificado de últimas voluntades dice ante qué notario se otorgó; el notario del último testamento da una copia autorizada. **Si no hay testamento**, los descendientes, ascendientes, el cónyuge o la pareja y los parientes colaterales piden la **declaración de herederos abintestato** ante notario (${notariado}, art. 55). Hay que acreditar la muerte y que no hay testamento «mediante información del Registro Civil y del Registro General de Actos de Última Voluntad», con dos testigos, y el notario no cierra el acta hasta pasados «veinte días hábiles» desde el requerimiento (art. 56). En Cataluña también es notarial: las declaraciones de heredero abintestato «es poden fer [...] per acta notarial de notorietat» (Codi civil de Catalunya, art. 442-7).`,
        `**Aceptar o no.** Puedes aceptar pura y simplemente, aceptar a beneficio de inventario o repudiar. Si aceptas pura y simplemente respondes de las cargas de la herencia «no sólo con los bienes de ésta, sino también con los suyos propios» (art. 1003). Con el beneficio de inventario, que puedes usar «aunque el testador se lo haya prohibido» (art. 1010), no pagas las deudas «sino hasta donde alcancen los bienes» de la herencia (art. 1023); si tienes bienes de la herencia en tu poder, tienes 30 días desde que sabes que eres heredero para pedir el inventario ante notario (art. 1014). Cualquier interesado puede pedir al notario que te dé **30 días naturales** para decidir; si no contestas, «se entenderá aceptada la herencia pura y simplemente» (art. 1005).`,
      ],
      catH: "En Cataluña: lo que cambia con el Codi civil",
      catIntro: `Entre las leyes civiles españolas decide la vecindad civil: la sucesión se rige por la ley personal del fallecido, y la ley personal es «la determinada por la vecindad civil» (${cc}, arts. 9.8 y 16.1). Si la persona tenía vecindad civil catalana, se aplica el ${cccat}. Si no era española, las reglas son otras y esta guía no las cubre: pregunta al notario.`,
      catCaption: "Código civil y Codi civil de Catalunya: las diferencias que más afectan",
      catHead: ["Tema", "Código civil", "Codi civil de Catalunya"],
      catRows: [
        ["Legítima de los hijos", "Dos terceras partes de la herencia; una de ellas se puede usar para mejorar a un hijo o descendiente (art. 808)", "Una cuarta parte, a partes iguales entre todos los hijos (arts. 451-3 y 451-5)"],
        ["Si no hay hijos ni descendientes", "Son herederos forzosos los padres y ascendientes (art. 807)", "Son legitimarios los progenitores, por mitad (art. 451-4)"],
        ["Cónyuge o pareja, con hijos", "El cónyuge tiene el usufructo del tercio de mejora (art. 834)", "No es legitimario. Si no tiene recursos suficientes, puede pedir la «quarta vidual», hasta una cuarta parte de la herencia (art. 452-1). Sin testamento, usufructo universal (art. 442-3)"],
        ["Plazo para aceptar", "Si un interesado lo pide, el notario te da 30 días naturales; si callas, aceptas pura y simplemente (art. 1005)", "No hay plazo (art. 461-12.1). Si un interesado lo pide, pasado un mes, el notario te da dos meses; si no aceptas, se entiende que repudias (art. 461-12.2)"],
        ["Inventario", "30 días desde que sabes que eres heredero, ante notario, si tienes bienes de la herencia en tu poder (art. 1014)", "Seis meses desde que conoces o puedes conocer la herencia, ante notario o con el inventario privado que presentas a Hacienda (art. 461-15). Sin inventario, aceptación pura y simple (art. 461-17)"],
      ],
      catNote: "Código civil (BOE) y libro cuarto del Codi civil de Catalunya (Portal Jurídic), leídos el 19 de noviembre de 2026.",
      catAfter: [
        `**Sin testamento**, en Cataluña heredan primero los hijos (art. 442-1). El cónyuge o la pareja estable que concurre con ellos tiene «dret a l'usdefruit universal de l'herència» (art. 442-3.1) y puede cambiarlo por una cuarta parte de la herencia más el usufructo de la vivienda familiar; esa opción «es pot exercir en el termini d'un any a comptar de la mort del causant» (art. 442-5.2). Si no hay hijos ni descendientes, hereda el cónyuge o la pareja, y los padres conservan su legítima (art. 442-3.2).`,
        `**El inventario catalán es más fácil.** Además del notario, «l'inventari formalitzat per l'hereu en document privat que es presenti a l'Administració pública competent per a la liquidació dels impostos relatius a la successió també produeix els efectes legals del benefici d'inventari» (art. 461-15.2). Con inventario, el heredero responde de las deudas «únicament amb els béns de l'herència» (art. 461-20); sin él, también con sus bienes propios (arts. 461-17 y 461-18).`,
        `La legítima catalana se calcula sobre el valor de los bienes a la muerte, menos las deudas y los gastos de la última enfermedad y del entierro, más lo que la persona dio en los diez años anteriores (art. 451-5). Las donaciones en vida tienen su propio impuesto, el de donaciones: ${giftCalc}.`,
        `El libro cuarto cambia el 4 de febrero de 2027 con la ${llei13} (apoyos a personas con discapacidad), que entra en vigor seis meses después de publicarse. No toca los artículos citados aquí, salvo el 461-12, cuyos apartados 1 y 2 quedan igual.`,
      ],
      taxH: "Impuestos: sucesiones, plusvalía y la renta del fallecido",
      tax: [
        `**Impuesto de sucesiones.** Se presenta en el plazo de **${m} meses** «contados desde el día del fallecimiento del causante» (${risd}, art. 67.1.a). Se puede pedir una prórroga de otros ${e} meses «dentro de los cinco primeros meses del plazo»; si en un mes no te contestan, «se entenderá concedida», y lleva intereses de demora (art. 68). Según la ${atc}, el plazo se cuenta de fecha a fecha. Lo gestiona la comunidad donde la persona fallecida vivió más días de los últimos cinco años, si el heredero también vive en España; si no, las reglas son otras.`,
        `**Cuánto se paga** depende de la comunidad, del parentesco y de lo que recibes. En Cataluña se presentan el modelo 660 (los bienes de toda la herencia) y un modelo 650 por heredero. Calcúlalo con ${isdCat}, ${isdMad}, ${isdAnd} o ${isdVal}, y compara las 21 normas en ${isdCmp}.`,
        `**Plusvalía municipal.** Si la herencia incluye una vivienda u otro inmueble urbano, el heredero presenta la declaración en el ayuntamiento: «Cuando se trate de actos por causa de muerte, el plazo será de seis meses prorrogables hasta un año a solicitud del sujeto pasivo» (${trlrhl}, art. 110.2.b). La ley permite a cada ayuntamiento bonificar hasta el 95 % en las herencias de descendientes, cónyuges y ascendientes (art. 108.4); la ${pv} lo tiene en cuenta.`,
        `**La renta del fallecido.** Su ejercicio fiscal termina el día de la muerte (${lirpf}, art. 13), y las obligaciones tributarias pendientes «se transmitirán a los herederos» (${lgt}, art. 39.1). La declaración de ese año se presenta en el plazo general que fija cada año Hacienda (Ley del IRPF, art. 97.1).`,
      ],
      ssH: "Seguridad Social: viudedad, orfandad y auxilio por defunción",
      ss: [
        `Tras una muerte, la ${lgss} prevé, según el caso, un auxilio por defunción, la pensión de viudedad, la prestación temporal de viudedad, la pensión de orfandad y la pensión o el subsidio en favor de familiares; si la muerte fue por accidente de trabajo o enfermedad profesional, además, una indemnización a tanto alzado (art. 216).`,
        `**Cuándo pedirlas.** El derecho a estas prestaciones, salvo el auxilio por defunción, es «imprescriptible», pero sus efectos se producen solo «a partir de los tres meses anteriores a la fecha en que se presente la correspondiente solicitud» (art. 230). La ${ssEffects} lo concreta para la viudedad: si el fallecido estaba de alta y la pides en los tres meses siguientes, cobras desde el día siguiente al fallecimiento; si era pensionista, desde el primer día del mes siguiente. Por eso conviene pedirla en los tres primeros meses.`,
        `**Pensión de viudedad.** Los requisitos (matrimonio, pareja de hecho, separación o divorcio) y la cuantía están en nuestra ${widow}.`,
        `**Pensión de orfandad.** Tienen derecho los hijos menores de 21 años o incapacitados para el trabajo (art. 224.1), y hasta los 25 si no trabajan o ganan menos del salario mínimo en cómputo anual (art. 224.3). Según la ${ssOrphan}, es «el 20% de la base reguladora».`,
        `**Auxilio por defunción.** Es un pago para «hacer frente a los gastos de sepelio a quien los haya soportado»; se presume, salvo prueba en contrario, que los pagó el cónyuge, la pareja de hecho, los hijos o los parientes que convivían con el fallecido (art. 218). La ${ssGrant} da la cuantía: «46,50 euros», si el fallecido estaba de alta o era pensionista de jubilación o incapacidad permanente. No es imprescriptible (art. 230): se aplica el plazo general de cinco años desde el día siguiente al fallecimiento (art. 53.1).`,
        `**Cómo se piden.** Según la ${ssHowTo}, «a través del Portal de Prestaciones de la Seguridad Social, o mediante el modelo oficial de formulario»; también en un CAISS con cita previa (901 10 65 70 o 915 41 25 30) o en cualquier registro oficial. Las fechas de pago, en ${payDates}.`,
      ],
      bankH: "El banco: qué es norma y qué no",
      bank: [
        `Ninguna de las normas que citamos ordena «bloquear» las cuentas de una persona fallecida. Lo que hay, por un lado, es el criterio del ${bde}: hasta que se adjudica la herencia, «las entidades de crédito no deben permitir disposiciones en las cuentas del cliente fallecido», salvo cuando todos los herederos lo autorizan, para pagar los gastos del funeral o del entierro, y los recibos que el titular ya había autorizado para mantener el patrimonio (impuestos, seguros, suministros).`,
        `En una cuenta con varios titulares depende del régimen: si es **indistinta o solidaria**, el banco atiende la orden de cualquier cotitular sin necesidad de los herederos; si es **mancomunada**, hacen falta todos los titulares, y la firma del fallecido la sustituyen todos sus herederos. Todo esto vale salvo que el titular hubiera previsto otra cosa antes de morir.`,
        `Por otro lado, la ${lisd} hace a los bancos **responsables subsidiarios** del impuesto si entregan los depósitos de un fallecido (art. 8.1.a). No cuenta como entrega el cheque a nombre de Hacienda para pagar el propio impuesto de sucesiones: si hace falta dinero de la cuenta para pagarlo, esa es la vía que la ley deja abierta.`,
        `Ninguna de estas normas fija un plazo para avisar al banco.`,
      ],
      noDeadlineH: "Plazos que la ley no fija",
      noDeadline: [
        "**Inscribir la defunción:** la ley no da días. El hospital la comunica «en el plazo que se establezca reglamentariamente» (Ley 20/2011, art. 64); fuera del hospital, «a la mayor brevedad posible» (art. 65).",
        "**La licencia de entierro:** «en el plazo que reglamentariamente se establezca» (art. 62.3). En Cataluña sí está fijado el mínimo de 24 horas para el entierro (Decret 297/1997, art. 11.1).",
        "**Aceptar la herencia en Cataluña:** «El dret del cridat a acceptar o repudiar l'herència no està sotmès a termini» (Codi civil de Catalunya, art. 461-12.1), salvo que un interesado pida al notario que te requiera.",
        "**La declaración de herederos:** la ley fija un mínimo (20 días hábiles desde el requerimiento), no un máximo.",
        "**Pedir la pensión de viudedad o de orfandad:** no prescribe, pero los efectos solo se remontan tres meses (LGSS, art. 230).",
        "**El certificado de últimas voluntades:** la sede del Ministerio no dice cuánto tarda; el de seguros, normalmente 24 horas y como máximo 7 días hábiles.",
        "**Avisar al banco:** las normas citadas no ponen plazo.",
      ],
      disclaimerTitle: "Esta guía no sustituye a un profesional",
      disclaimer: `Resume las normas generales leídas el 19 de noviembre de 2026; no es asesoramiento jurídico ni fiscal. Cada herencia depende del testamento, de la vecindad civil, del régimen económico del matrimonio y de los bienes. Antes de firmar o pagar, pregunta al notario, a la oficina tributaria de tu comunidad (en Cataluña, el cálculo oficial lo hace el ${atcHelp}) o a la Seguridad Social. Nuestras calculadoras dan una estimación, no la liquidación oficial.`,
      faqH: "Preguntas frecuentes",
      faq: [
        { question: "¿Cuándo se puede pedir el certificado de últimas voluntades?", answer: "Pasados 15 días hábiles desde el fallecimiento: antes, la sede del Ministerio de Justicia no admite la solicitud. Se pide en línea con Cl@ve (si la muerte fue después del 2 de abril de 2009 y no está inscrita en un juzgado de paz) o en persona o por correo con el certificado literal de defunción." },
        { question: "¿Cuánto cuesta el certificado de últimas voluntades?", answer: "Se paga la tasa 006 del Ministerio de Justicia (modelo 790), la misma que el certificado de seguros. No publicamos el importe porque las páginas oficiales que leímos no lo muestran." },
        { question: "¿Qué es el certificado de seguros de cobertura de fallecimiento?", answer: "El que dice en qué seguros de vida con cobertura de fallecimiento o de accidentes que cubren la muerte figuraba la persona como asegurada, y con qué aseguradora (Ley 20/2005). Con él preguntas a cada aseguradora si eres beneficiario. Se pide pasados 15 días hábiles y los datos se guardan cinco años." },
        { question: "¿Cuál es el plazo del impuesto de sucesiones?", answer: `${m} meses desde el fallecimiento. Si pides prórroga en los ${ask} primeros meses, ${e} meses más, con intereses de demora (Real Decreto 1629/1991, arts. 67 y 68).` },
        { question: "¿Qué plazo hay para la plusvalía de una herencia?", answer: `${pm} meses desde el fallecimiento, prorrogables hasta un año si lo pides (Ley Reguladora de las Haciendas Locales, art. 110.2.b).` },
        { question: "¿Cómo se solicita la pensión de viudedad?", answer: "En el Portal de Prestaciones de la Seguridad Social, con el formulario oficial, en un CAISS con cita previa o en cualquier registro oficial. Pídela en los tres primeros meses: los efectos solo se remontan tres meses antes de la solicitud." },
        { question: "¿Cuánto es el auxilio por defunción?", answer: "46,50 euros, para quien pagó el entierro, si el fallecido estaba de alta o era pensionista de jubilación o incapacidad permanente (Seguridad Social). Hay cinco años para pedirlo." },
        { question: "¿El banco bloquea la cuenta del fallecido?", answer: "No por una ley. El criterio del Banco de España es que, hasta que se adjudica la herencia, el banco no deje sacar dinero, salvo con la autorización de todos los herederos, para pagar el funeral o los recibos ya autorizados. En una cuenta indistinta, el otro titular puede seguir usándola." },
        { question: "¿Hay plazo para aceptar la herencia?", answer: "En Cataluña no (Codi civil, art. 461-12.1). Pero un interesado puede pedir al notario que te obligue a decidir: con el Código civil tienes 30 días naturales y, si callas, aceptas; en Cataluña, dos meses y, si no aceptas, repudias." },
        { question: "¿Cuál es la legítima en Cataluña?", answer: "Una cuarta parte de la herencia, a partes iguales entre los hijos; si no hay descendientes, de los padres. Con el Código civil, dos terceras partes." },
        { question: "¿Cuántos días de permiso hay por fallecimiento de un familiar?", answer: "Dos días por el cónyuge, la pareja de hecho o un pariente hasta segundo grado, y dos más si tienes que desplazarte (Estatuto de los Trabajadores, art. 37.3.b bis)." },
        { question: "¿Hace falta notario si no hay testamento?", answer: "Sí: la declaración de herederos de descendientes, ascendientes, cónyuge o pareja y colaterales se hace ante notario, con la información del Registro Civil y del de últimas voluntades y dos testigos (Ley del Notariado, arts. 55 y 56)." },
        { question: "¿Quién tiene que inscribir la defunción?", answer: "El hospital donde se produce; fuera de él, el médico que certifica, los parientes o quien ellos autoricen. Según el Ministerio de Justicia, suele hacerlo la funeraria en nombre de la familia." },
      ],
      official: `${lrc} (arts. 62 a 67), páginas del Ministerio de Justicia (inscripción, defunción, últimas voluntades, seguros), ${insuranceAct}, ${mortuary}, ${et}, ${cc}, ${notariado}, ${cccat} y ${llei13}, ${risd}, ${lisd}, ${trlrhl}, ${lirpf}, ${lgt}, ${lgss}, fichas de la Seguridad Social, la ${atc} y el ${bde}.`,
      related: {
        cmp: "Impuesto de sucesiones por comunidad: las 21 normas comparadas",
        cat: "Calculadora del impuesto de sucesiones en Cataluña",
        mad: "Impuesto de sucesiones en Madrid",
        and: "Impuesto de sucesiones en Andalucía",
        val: "Impuesto de sucesiones en la Comunidad Valenciana",
        gift: "Impuesto de donaciones en Cataluña",
        pv: "Plusvalía municipal: calculadora",
        widow: "Pensión de viudedad: requisitos y cuánto se cobra",
        leave: "Permisos laborales: días por ley",
        costs: "Gastos de compraventa de vivienda: notaría y Registro",
      },
    },
    ca: {
      lead: `**Les primeres hores les resolen el metge i, gairebé sempre, la funerària:** el certificat mèdic de defunció, la inscripció al Registre Civil i la llicència per a l'enterrament o la incineració. **Passats 15 dies hàbils** es demanen al Ministeri de Justícia el **certificat d'últimes voluntats** (diu si hi havia testament i davant de quin notari) i el **certificat d'assegurances de cobertura de defunció**, tots dos amb la **taxa 006**. Amb aquests certificats, el notari dona còpia del testament o tramita la **declaració d'hereus**. Els impostos tenen termini: **successions, ${m} mesos** des de la mort (${e} més si demanes pròrroga en els ${ask} primers) i **plusvàlua municipal, ${pm} mesos**, prorrogables fins a un any. La **pensió de viduïtat** no prescriu, però només es paga amb efectes de fins a 3 mesos abans de demanar-la: demana-la en els 3 primers mesos.`,
      checkCaption: "Què cal fer i quan, comptant des del dia de la mort",
      checkHead: ["Quan", "Què", "Qui o on", "Norma"],
      checkRows: [
        ["Primeres hores", "Certificat mèdic de defunció", "El metge que certifica la mort. Sense aquest certificat no es pot inscriure la defunció", "Llei 20/2011 del Registre Civil, arts. 62 i 66"],
        ["Primeres hores", "Inscripció de la defunció al Registre Civil", "L'hospital la comunica per via electrònica; si la mort és fora, cal avisar l'autoritat al més aviat possible. Sol fer-ho la funerària en nom de la família", "Llei 20/2011, arts. 63 a 65"],
        ["Després de la inscripció", "Llicència d'enterrament o incineració", "La dona el Registre Civil; si hi ha diligències judicials, quan ho autoritza el jutge", "Llei 20/2011, arts. 62.3 i 67.2"],
        ["Des de les 24 hores (Catalunya)", "Enterrament o incineració", "No abans de 24 hores, llevat d'autòpsia o donació d'òrgans; si és després de 48 hores, conservació transitòria obligatòria", "Decret 297/1997, arts. 11.1 i 35.1"],
        ["Els dies següents", "Permís a la feina", "2 dies pel cònjuge, la parella de fet o un parent fins a segon grau; 2 més si t'has de desplaçar", "Estatut dels treballadors, art. 37.3.b bis"],
        ["Quan estigui inscrita", "Certificat de defunció", "Seu del Ministeri de Justícia; al moment si les dades estan disponibles", "Ministeri de Justícia"],
        ["Des de 15 dies hàbils", "Certificat d'últimes voluntats", "Ministeri de Justícia, amb la taxa 006", "Ministeri de Justícia"],
        ["Des de 15 dies hàbils", "Certificat d'assegurances de cobertura de defunció", "Ministeri de Justícia, amb la taxa 006; sol estar en 24 hores, com a màxim 7 dies hàbils", "Llei 20/2005, arts. 6 i 7"],
        ["Amb els certificats", "Còpia del testament o declaració d'hereus", "A la notaria. La declaració d'hereus triga com a mínim 20 dies hàbils des que es demana", "Llei del notariat, arts. 55 i 56"],
        ["En els 3 primers mesos", "Pensió de viduïtat i d'orfandat", "Seguretat Social. No prescriu, però els efectes només es remunten 3 mesos abans de la sol·licitud", "LGSS, art. 230"],
        [`Abans de ${ask} mesos`, "Pròrroga de l'impost de successions, si et cal", "L'oficina tributària de la comunitat (a Catalunya, l'ATC)", "RD 1629/1991, art. 68"],
        [`${m} mesos`, `Impost de successions (${m + e} mesos amb pròrroga)`, "La comunitat on la persona va viure més dies dels últims cinc anys", "RD 1629/1991, art. 67"],
        [`${pm} mesos`, "Plusvàlua municipal, si hi ha un habitatge o un altre immoble urbà (fins a un any amb pròrroga)", "L'ajuntament on és l'immoble", "Llei d'hisendes locals, art. 110.2"],
        ["6 mesos des que ho saps (Catalunya)", "Inventari, per respondre només amb els béns de l'herència", "Davant notari, o l'inventari privat que presentes a Hisenda amb l'impost", "Codi civil de Catalunya, art. 461-15"],
        ["1 any (Catalunya, sense testament)", "Opció del vidu o la parella estable: canviar l'usdefruit universal per una quarta part de l'herència i l'usdefruit de l'habitatge", "El cònjuge vidu o el convivent supervivent", "Codi civil de Catalunya, art. 442-5"],
        ["Fins a 5 anys", "Auxili per defunció: 46,50 €", "Seguretat Social, per a qui va pagar l'enterrament", "LGSS, arts. 53, 218 i 230"],
        ["En el termini de la renda d'aquell any", "Declaració de la renda de la persona morta", "Els hereus: l'exercici acaba el dia de la mort", "Llei de l'IRPF, art. 13; Llei general tributària, art. 39"],
        ["Sense termini legal", "Acceptar l'herència (a Catalunya) i avisar el banc", "Vegeu «Terminis que la llei no fixa»", "Codi civil de Catalunya, art. 461-12"],
      ],
      checkNote: "Terminis comptats des de la mort llevat que es digui una altra cosa. Normes i pàgines oficials llegides el 19 de novembre de 2026.",
      firstH: "Les primeres hores: certificat mèdic, Registre Civil i llicència d'enterrament",
      first: [
        `La ${lrc} diu que la inscripció de la defunció és obligatòria i que es fa amb una declaració en el formulari oficial, acompanyada del certificat mèdic de defunció (art. 62). Sense aquest certificat no hi ha inscripció: la llei diu que en cap cas no es pot inscriure la defunció si no s'ha presentat el certificat mèdic al Registre Civil (art. 66). El signa el metge que certifica la mort.`,
        `Si la persona mor en un hospital, una clínica o un altre centre sanitari, la direcció del centre comunica la defunció al Registre Civil i a l'INE per via electrònica (art. 64). Si mor a casa o en un altre lloc, els obligats (el metge que certifica, els parents o qui ells autoritzin, qui vivia a la casa) n'informen l'autoritat al més aviat possible (arts. 63 i 65). Segons la ${mjRegister}, són els agents funeraris, en representació de la família, els que solen comunicar la defunció al Registre Civil.`,
        `Amb la documentació, el Registre Civil fa la inscripció immediatament i expedeix el certificat de defunció; després, la **llicència per a l'enterrament o la incineració**, en el termini que fixi el reglament (art. 62.3): la llei no dona un nombre d'hores. Si hi ha indicis de mort violenta o diligències judicials, la inscripció no comporta per si sola la llicència, que es dona quan ho autoritza el jutge (art. 67.2).`,
        `**A Catalunya**, el ${mortuary} fixa el temps mínim: «No es podrà donar destinació final a un cadàver abans del transcurs de 24 hores des de la defunció», llevat que s'hagi fet l'autòpsia o s'hagin obtingut òrgans per a trasplantament (art. 11.1). Si l'enterrament ha de ser més tard de 48 hores, la conservació transitòria del cos és obligatòria (art. 35.1; 72 hores si hi ha intervenció judicial). Cada comunitat té la seva norma de policia sanitària mortuòria: aquí només citem la catalana.`,
        `**A la feina**, l'${et} dona dos dies per la mort del cònjuge, la parella de fet o un parent fins al segon grau de consanguinitat o afinitat, i dos més si t'has de desplaçar (art. 37.3.b bis). La resta de permisos, a la ${paidLeave}.`,
      ],
      certsH: "Els certificats: defunció, últimes voluntats i assegurances",
      certsIntro: `Són tres certificats diferents i tots tres es demanen a la seu electrònica del Ministeri de Justícia. El ${mjDeath} acredita la mort. El ${mjWills}, segons el ${mjWillsInfo}, és el document que acredita si una persona ha fet testament i davant de quin notari, i cal per a qualsevol acte successori. El ${mjInsurance} diu en quins contractes vigents figurava la persona com a assegurada i amb quina asseguradora (${insuranceAct}, art. 7).`,
      certsCaption: "Els tres certificats del Ministeri de Justícia",
      certsHead: ["Certificat", "Des de quan", "Com es demana", "Quant triga"],
      certsRows: [
        ["Defunció", "Des que la defunció és inscrita", "En línia amb Cl@ve o certificat digital, o sense identificar-te (arriba per correu postal). El mateix certificat no es pot tornar a demanar fins passats 15 dies", "Al moment, si les dades estan disponibles en línia"],
        ["Últimes voluntats", "Passats 15 dies hàbils des de la mort", "En línia amb Cl@ve i la taxa 006, si la mort va ser després del 2 d'abril de 2009 i no és inscrita en un jutjat de pau; si no, en persona (carrer Bolsa 8, Madrid, amb cita prèvia) o per correu, amb el certificat literal de defunció i el formulari 790", "La pàgina no ho diu. Un cop llest, hi ha 90 dies naturals per descarregar-lo"],
        ["Assegurances de cobertura de defunció", "Passats 15 dies hàbils des de la mort", "Igual: en línia amb Cl@ve i la taxa 006, o en persona o per correu amb el formulari 790", "Normalment 24 hores, en alguns casos fins a 3 dies hàbils; l'Administració té 7 dies hàbils"],
      ],
      certsNote: "Seu electrònica del Ministeri de Justícia, llegida el 19 de novembre de 2026. No publiquem l'import de la taxa 006: les pàgines oficials llegides no el mostren.",
      certsAfter: [
        `La llei del registre d'assegurances parla de quinze dies des de la data de la defunció (${insuranceAct}, art. 6.2); la seu del Ministeri diu 15 dies **hàbils**, i és el compte que aplica. Les dades es guarden cinc anys (art. 6.3). El certificat no garanteix que cobris: la presumpció de veracitat es refereix a l'existència del contracte, no a la cobertura (art. 3.3). Amb el certificat preguntes a cada asseguradora si n'ets beneficiari; si no ho ets, només et dirà això (art. 7.2). Hi entren les assegurances de vida amb cobertura de defunció i les d'accidents que cobreixen la mort (art. 4.1).`,
        `Per comptar els 15 dies hàbils, fes servir la ${workingDays}.`,
      ],
      inheritH: "L'herència: testament o declaració d'hereus",
      inherit: [
        `Segons el ${cc}, els drets a la successió es transmeten des del moment de la mort (art. 657). L'herència es reparteix per testament i, si no n'hi ha, per llei: el Codi civil anomena la primera successió testamentària i la segona, legítima (art. 658). També hi ha successió sense testament quan el testament és nul o no disposa de tots els béns (art. 912).`,
        `**Si hi ha testament**, el certificat d'últimes voluntats diu davant de quin notari es va fer; el notari de l'últim testament en dona una còpia autoritzada. **Si no hi ha testament**, els descendents, els ascendents, el cònjuge o la parella i els parents col·laterals demanen la **declaració d'hereus abintestat** davant notari (${notariado}, art. 55). Cal acreditar la mort i que no hi ha testament amb la informació del Registre Civil i del Registre General d'Actes d'Última Voluntat, amb dos testimonis, i el notari no tanca l'acta fins passats vint dies hàbils des del requeriment (art. 56). A Catalunya també és notarial: les declaracions d'hereu abintestat «es poden fer [...] per acta notarial de notorietat» (Codi civil de Catalunya, art. 442-7).`,
        `**Acceptar o no.** Pots acceptar de manera pura i simple, acceptar a benefici d'inventari o repudiar. Amb el Codi civil espanyol, si acceptes pura i simplement respons de les càrregues de l'herència també amb els teus béns propis (art. 1003). Amb el benefici d'inventari, que pots fer servir encara que el testador ho hagi prohibit (art. 1010), no pagues els deutes més enllà del que valen els béns de l'herència (art. 1023); si tens béns de l'herència en el teu poder, tens 30 dies des que saps que ets hereu per demanar l'inventari davant notari (art. 1014). Qualsevol interessat pot demanar al notari que et doni **30 dies naturals** per decidir; si no contestes, s'entén que acceptes pura i simplement (art. 1005).`,
      ],
      catH: "A Catalunya: què canvia amb el Codi civil",
      catIntro: `Entre les lleis civils espanyoles decideix el veïnatge civil: la successió es regeix per la llei personal de la persona morta, i la llei personal és la que determina el veïnatge civil (${cc}, arts. 9.8 i 16.1). Si la persona tenia veïnatge civil català, s'aplica el ${cccat}. Si no era espanyola, les regles són unes altres i aquesta guia no les cobreix: pregunta-ho al notari.`,
      catCaption: "Codi civil espanyol i Codi civil de Catalunya: les diferències que més afecten",
      catHead: ["Tema", "Codi civil espanyol", "Codi civil de Catalunya"],
      catRows: [
        ["Llegítima dels fills", "Dues terceres parts de l'herència; una d'aquestes es pot fer servir per millorar un fill o descendent (art. 808)", "Una quarta part, a parts iguals entre tots els fills (arts. 451-3 i 451-5)"],
        ["Si no hi ha fills ni descendents", "Són hereus forçosos els pares i ascendents (art. 807)", "Són legitimaris els progenitors, per meitat (art. 451-4)"],
        ["Cònjuge o parella, amb fills", "El cònjuge té l'usdefruit del terç de millora (art. 834)", "No és legitimari. Si no té recursos suficients, pot demanar la quarta vidual, fins a una quarta part de l'herència (art. 452-1). Sense testament, usdefruit universal (art. 442-3)"],
        ["Termini per acceptar", "Si un interessat ho demana, el notari et dona 30 dies naturals; si calles, acceptes pura i simplement (art. 1005)", "No hi ha termini (art. 461-12.1). Si un interessat ho demana, passat un mes, el notari et dona dos mesos; si no acceptes, s'entén que repudies (art. 461-12.2)"],
        ["Inventari", "30 dies des que saps que ets hereu, davant notari, si tens béns de l'herència en el teu poder (art. 1014)", "Sis mesos des que coneixes o pots conèixer l'herència, davant notari o amb l'inventari privat que presentes a Hisenda (art. 461-15). Sense inventari, acceptació pura i simple (art. 461-17)"],
      ],
      catNote: "Codi civil (BOE) i llibre quart del Codi civil de Catalunya (Portal Jurídic), llegits el 19 de novembre de 2026.",
      catAfter: [
        `**Sense testament**, a Catalunya hereten primer els fills (art. 442-1). El cònjuge o la parella estable que hi concorre té «dret a l'usdefruit universal de l'herència» (art. 442-3.1) i el pot canviar per una quarta part de l'herència i l'usdefruit de l'habitatge familiar; aquesta opció «es pot exercir en el termini d'un any a comptar de la mort del causant» (art. 442-5.2). Si no hi ha fills ni descendents, hereta el cònjuge o la parella, i els pares conserven la llegítima (art. 442-3.2).`,
        `**L'inventari català és més fàcil.** A més del notari, «l'inventari formalitzat per l'hereu en document privat que es presenti a l'Administració pública competent per a la liquidació dels impostos relatius a la successió també produeix els efectes legals del benefici d'inventari» (art. 461-15.2). Amb inventari, l'hereu respon dels deutes «únicament amb els béns de l'herència» (art. 461-20); sense inventari, també amb els béns propis (arts. 461-17 i 461-18).`,
        `La llegítima catalana es calcula sobre el valor dels béns a la mort, menys els deutes i les despeses de la darrera malaltia i de l'enterrament, més el que la persona va donar en els deu anys anteriors (art. 451-5). Les donacions en vida tenen el seu impost, el de donacions: ${giftCalc}.`,
        `El llibre quart canvia el 4 de febrer de 2027 amb la ${llei13} (suports a les persones amb discapacitat), que entra en vigor sis mesos després de publicar-se. No toca els articles citats aquí, llevat del 461-12, que manté igual els apartats 1 i 2.`,
      ],
      taxH: "Impostos: successions, plusvàlua i la renda de la persona morta",
      tax: [
        `**Impost de successions.** Es presenta en el termini de **${m} mesos** comptats des del dia de la mort (${risd}, art. 67.1.a). Es pot demanar una pròrroga d'uns altres ${e} mesos dins dels cinc primers mesos; si en un mes no et contesten, s'entén concedida, i comporta interessos de demora (art. 68). Segons l'${atc}, el termini es compta de data a data. El gestiona la comunitat on la persona morta va viure més dies dels últims cinc anys, si l'hereu també viu a Espanya; si no, les regles són unes altres.`,
        `**Quant es paga** depèn de la comunitat, del parentiu i del que reps. A Catalunya es presenten el model 660 (els béns de tota l'herència) i un model 650 per hereu. Calcula-ho amb ${isdCat}, ${isdMad}, ${isdAnd} o ${isdVal}, i compara les 21 normes a ${isdCmp}.`,
        `**Plusvàlua municipal.** Si l'herència inclou un habitatge o un altre immoble urbà, l'hereu presenta la declaració a l'ajuntament: per causa de mort, el termini és de sis mesos prorrogables fins a un any si ho demana (${trlrhl}, art. 110.2.b). La llei permet a cada ajuntament bonificar fins al 95 % les herències de descendents, cònjuges i ascendents (art. 108.4); la ${pv} ho té en compte.`,
        `**La renda de la persona morta.** El seu exercici fiscal acaba el dia de la mort (${lirpf}, art. 13), i les obligacions tributàries pendents passen als hereus (${lgt}, art. 39.1). La declaració d'aquell any es presenta en el termini general que fixa cada any Hisenda (Llei de l'IRPF, art. 97.1).`,
      ],
      ssH: "Seguretat Social: viduïtat, orfandat i auxili per defunció",
      ss: [
        `Després d'una mort, la ${lgss} preveu, segons el cas, un auxili per defunció, la pensió de viduïtat, la prestació temporal de viduïtat, la pensió d'orfandat i la pensió o el subsidi a favor de familiars; si la mort va ser per accident de treball o malaltia professional, a més, una indemnització a tant alçat (art. 216).`,
        `**Quan demanar-les.** El dret a aquestes prestacions, llevat de l'auxili per defunció, és imprescriptible, però els efectes només arriben fins a tres mesos abans de la data de la sol·licitud (art. 230). La ${ssEffects} ho concreta per a la viduïtat: si la persona morta estava d'alta i la demanes en els tres mesos següents, cobres des de l'endemà de la mort; si era pensionista, des del primer dia del mes següent. Per això convé demanar-la en els tres primers mesos.`,
        `**Pensió de viduïtat.** Els requisits (matrimoni, parella de fet, separació o divorci) i l'import són a la nostra ${widow}.`,
        `**Pensió d'orfandat.** Hi tenen dret els fills menors de 21 anys o incapacitats per treballar (art. 224.1), i fins als 25 si no treballen o guanyen menys del salari mínim en còmput anual (art. 224.3). Segons la ${ssOrphan}, és el 20 % de la base reguladora.`,
        `**Auxili per defunció.** És un pagament per fer front a les despeses de l'enterrament per a qui les hagi pagades; es presumeix, llevat de prova en contra, que les va pagar el cònjuge, la parella de fet, els fills o els parents que convivien amb la persona morta (art. 218). La ${ssGrant} en dona l'import: 46,50 euros, si la persona estava d'alta o era pensionista de jubilació o d'incapacitat permanent. No és imprescriptible (art. 230): s'aplica el termini general de cinc anys des de l'endemà de la mort (art. 53.1).`,
        `**Com es demanen.** Segons la ${ssHowTo}, pel Portal de Prestaciones o amb el formulari oficial; també en un CAISS amb cita prèvia (901 10 65 70 o 915 41 25 30) o en qualsevol registre oficial. Les dates de cobrament, a ${payDates}.`,
      ],
      bankH: "El banc: què és norma i què no",
      bank: [
        `Cap de les normes que citem no ordena «bloquejar» els comptes d'una persona morta. El que hi ha, d'una banda, és el criteri del ${bde}: fins que s'adjudica l'herència, les entitats de crèdit no han de permetre disposicions en els comptes del client mort, llevat que ho autoritzin tots els hereus, per pagar les despeses del funeral o de l'enterrament, i els rebuts que el titular ja havia autoritzat per mantenir el patrimoni (impostos, assegurances, subministraments).`,
        `En un compte amb diversos titulars depèn del règim: si és **indistint o solidari**, el banc atén l'ordre de qualsevol cotitular sense necessitat dels hereus; si és **mancomunat**, calen tots els titulars, i la signatura de la persona morta la substitueixen tots els seus hereus. Tot això val llevat que el titular hagués previst una altra cosa abans de morir.`,
        `D'altra banda, la ${lisd} fa els bancs **responsables subsidiaris** de l'impost si lliuren els dipòsits d'una persona morta (art. 8.1.a). No compta com a lliurament el xec a nom d'Hisenda per pagar el mateix impost de successions: si cal diners del compte per pagar-lo, aquesta és la via que la llei deixa oberta.`,
        `Cap d'aquestes normes no fixa un termini per avisar el banc.`,
      ],
      noDeadlineH: "Terminis que la llei no fixa",
      noDeadline: [
        "**Inscriure la defunció:** la llei no dona dies. L'hospital la comunica en el termini que fixi el reglament (Llei 20/2011, art. 64); fora de l'hospital, al més aviat possible (art. 65).",
        "**La llicència d'enterrament:** en el termini que fixi el reglament (art. 62.3). A Catalunya sí que hi ha fixat el mínim de 24 hores per a l'enterrament (Decret 297/1997, art. 11.1).",
        "**Acceptar l'herència a Catalunya:** «El dret del cridat a acceptar o repudiar l'herència no està sotmès a termini» (Codi civil de Catalunya, art. 461-12.1), llevat que un interessat demani al notari que et requereixi.",
        "**La declaració d'hereus:** la llei fixa un mínim (20 dies hàbils des del requeriment), no un màxim.",
        "**Demanar la pensió de viduïtat o d'orfandat:** no prescriu, però els efectes només es remunten tres mesos (LGSS, art. 230).",
        "**El certificat d'últimes voluntats:** la seu del Ministeri no diu quant triga; el d'assegurances, normalment 24 hores i com a màxim 7 dies hàbils.",
        "**Avisar el banc:** les normes citades no hi posen termini.",
      ],
      disclaimerTitle: "Aquesta guia no substitueix un professional",
      disclaimer: `Resumeix les normes generals llegides el 19 de novembre de 2026; no és assessorament jurídic ni fiscal. Cada herència depèn del testament, del veïnatge civil, del règim econòmic del matrimoni i dels béns. Abans de signar o pagar, pregunta-ho al notari, a l'oficina tributària de la teva comunitat (a Catalunya, el càlcul oficial el fa el ${atcHelp}) o a la Seguretat Social. Les nostres calculadores donen una estimació, no la liquidació oficial.`,
      faqH: "Preguntes freqüents",
      faq: [
        { question: "Quan es pot demanar el certificat d'últimes voluntats?", answer: "Passats 15 dies hàbils des de la mort: abans, la seu del Ministeri de Justícia no admet la sol·licitud. Es demana en línia amb Cl@ve (si la mort va ser després del 2 d'abril de 2009 i no és inscrita en un jutjat de pau) o en persona o per correu amb el certificat literal de defunció." },
        { question: "Quant costa el certificat d'últimes voluntats?", answer: "Es paga la taxa 006 del Ministeri de Justícia (model 790), la mateixa que el certificat d'assegurances. No en publiquem l'import perquè les pàgines oficials que vam llegir no el mostren." },
        { question: "Què és el certificat d'assegurances de cobertura de defunció?", answer: "El que diu en quines assegurances de vida amb cobertura de defunció o d'accidents que cobreixen la mort figurava la persona com a assegurada, i amb quina asseguradora (Llei 20/2005). Amb aquest certificat preguntes a cada asseguradora si ets beneficiari. Es demana passats 15 dies hàbils i les dades es guarden cinc anys." },
        { question: "Quin és el termini de l'impost de successions?", answer: `${m} mesos des de la mort. Si demanes pròrroga en els ${ask} primers mesos, ${e} mesos més, amb interessos de demora (Reial decret 1629/1991, arts. 67 i 68).` },
        { question: "Quin termini hi ha per a la plusvàlua d'una herència?", answer: `${pm} mesos des de la mort, prorrogables fins a un any si ho demanes (Llei reguladora de les hisendes locals, art. 110.2.b).` },
        { question: "Com es demana la pensió de viduïtat?", answer: "Al Portal de Prestaciones de la Seguretat Social, amb el formulari oficial, en un CAISS amb cita prèvia o en qualsevol registre oficial. Demana-la en els tres primers mesos: els efectes només es remunten tres mesos abans de la sol·licitud." },
        { question: "Quant és l'auxili per defunció?", answer: "46,50 euros, per a qui va pagar l'enterrament, si la persona estava d'alta o era pensionista de jubilació o d'incapacitat permanent (Seguretat Social). Hi ha cinc anys per demanar-lo." },
        { question: "El banc bloqueja el compte de la persona morta?", answer: "No per una llei. El criteri del Banc d'Espanya és que, fins que s'adjudica l'herència, el banc no deixi treure diners, llevat que ho autoritzin tots els hereus, per pagar el funeral o els rebuts ja autoritzats. En un compte indistint, l'altre titular el pot continuar fent servir." },
        { question: "Hi ha termini per acceptar l'herència?", answer: "A Catalunya no (Codi civil, art. 461-12.1). Però un interessat pot demanar al notari que t'obligui a decidir: amb el Codi civil espanyol tens 30 dies naturals i, si calles, acceptes; a Catalunya, dos mesos i, si no acceptes, repudies." },
        { question: "Quina és la llegítima a Catalunya?", answer: "Una quarta part de l'herència, a parts iguals entre els fills; si no hi ha descendents, dels pares. Amb el Codi civil espanyol, dues terceres parts." },
        { question: "Quants dies de permís hi ha per la mort d'un familiar?", answer: "Dos dies pel cònjuge, la parella de fet o un parent fins a segon grau, i dos més si t'has de desplaçar (Estatut dels treballadors, art. 37.3.b bis)." },
        { question: "Cal notari si no hi ha testament?", answer: "Sí: la declaració d'hereus de descendents, ascendents, cònjuge o parella i col·laterals es fa davant notari, amb la informació del Registre Civil i del d'últimes voluntats i dos testimonis (Llei del notariat, arts. 55 i 56)." },
        { question: "Qui ha d'inscriure la defunció?", answer: "L'hospital on es produeix; fora de l'hospital, el metge que certifica, els parents o qui ells autoritzin. Segons el Ministeri de Justícia, sol fer-ho la funerària en nom de la família." },
      ],
      official: `${lrc} (arts. 62 a 67), pàgines del Ministeri de Justícia (inscripció, defunció, últimes voluntats, assegurances), ${insuranceAct}, ${mortuary}, ${et}, ${cc}, ${notariado}, ${cccat} i ${llei13}, ${risd}, ${lisd}, ${trlrhl}, ${lirpf}, ${lgt}, ${lgss}, fitxes de la Seguretat Social, l'${atc} i el ${bde}. Les normes estatals i les pàgines estatals són en castellà.`,
      related: {
        cmp: "Impost de successions per comunitat: les 21 normes comparades",
        cat: "Calculadora de l'impost de successions a Catalunya",
        mad: "Impost de successions a Madrid",
        and: "Impost de successions a Andalusia",
        val: "Impost de successions a la Comunitat Valenciana",
        gift: "Impost de donacions a Catalunya",
        pv: "Plusvàlua municipal: calculadora",
        widow: "Pensió de viduïtat: requisits i quant es cobra",
        leave: "Permisos laborals: dies per llei",
        costs: "Despeses de compravenda d'habitatge: notaria i Registre",
      },
    },
    en: {
      lead: `**The doctor and, almost always, the funeral company handle the first hours:** the medical death certificate, registering the death at the Civil Registry (Registro Civil) and the burial or cremation licence. **After 15 working days** you can ask the Ministry of Justice for the **certificate of last wills** (certificado de últimas voluntades: whether there was a will and before which notary) and the **certificate of life insurance policies** (certificado de seguros de cobertura de fallecimiento), both paid with **fee 006**. With them, the notary issues a copy of the will or handles the **declaration of heirs**. The taxes have deadlines: **inheritance tax, ${m} months** from the death (${e} more if you ask for an extension within the first ${ask}) and the **plusvalía municipal, ${pm} months**, extendable to one year. A **widow's or widower's pension** never lapses, but it is only paid from up to 3 months before you apply: apply within the first 3 months.`,
      checkCaption: "What to do and when, counted from the day of the death",
      checkHead: ["When", "What", "Who or where", "Rule"],
      checkRows: [
        ["First hours", "Medical death certificate", "The doctor who certifies the death. Without it the death cannot be registered", "Civil Registry Act 20/2011, arts. 62 and 66"],
        ["First hours", "Registering the death at the Civil Registry", "A hospital reports it electronically; for a death elsewhere, the authority must be told as soon as possible. The funeral company usually does it on the family's behalf", "Act 20/2011, arts. 63 to 65"],
        ["After registration", "Burial or cremation licence", "Issued by the Civil Registry; if there is a court investigation, when the judge authorises it", "Act 20/2011, arts. 62.3 and 67.2"],
        ["From 24 hours (Catalonia)", "Burial or cremation", "Not before 24 hours, except after an autopsy or organ donation; after 48 hours, temporary preservation is compulsory", "Catalan Decree 297/1997, arts. 11.1 and 35.1"],
        ["The following days", "Leave from work", "2 days for a spouse, registered partner or relative up to the second degree; 2 more if you have to travel", "Workers' Statute, art. 37.3.b bis"],
        ["Once registered", "Death certificate", "Ministry of Justice e-office; issued at once if the data is available online", "Ministry of Justice"],
        ["From 15 working days", "Certificate of last wills", "Ministry of Justice, with fee 006", "Ministry of Justice"],
        ["From 15 working days", "Certificate of life insurance policies", "Ministry of Justice, with fee 006; usually ready in 24 hours, at most 7 working days", "Act 20/2005, arts. 6 and 7"],
        ["With the certificates", "Copy of the will or declaration of heirs", "At a notary's office. A declaration of heirs takes at least 20 working days from the request", "Notaries Act, arts. 55 and 56"],
        ["Within the first 3 months", "Widow's or widower's pension and orphan's pension", "Social Security. The right never lapses, but payment only goes back 3 months before the application", "General Social Security Act (LGSS), art. 230"],
        [`Before ${ask} months`, "Inheritance tax extension, if you need it", "The region's tax office (in Catalonia, the ATC)", "Royal Decree 1629/1991, art. 68"],
        [`${m} months`, `Inheritance tax (${m + e} months with the extension)`, "The region where the deceased lived the most days of the last five years", "Royal Decree 1629/1991, art. 67"],
        [`${pm} months`, "Plusvalía municipal, if there is a home or other urban property (up to a year with the extension)", "The council where the property is", "Local Finance Act, art. 110.2"],
        ["6 months from when you know (Catalonia)", "Inventory, so you answer for debts only with the estate", "Before a notary, or the private inventory you file with the tax return", "Catalan Civil Code, art. 461-15"],
        ["1 year (Catalonia, no will)", "The surviving spouse's or partner's option to swap the life interest in the whole estate for a quarter of it plus the life interest in the home", "The surviving spouse or stable partner", "Catalan Civil Code, art. 442-5"],
        ["Up to 5 years", "Death grant (auxilio por defunción): €46.50", "Social Security, for whoever paid for the funeral", "LGSS, arts. 53, 218 and 230"],
        ["In that year's income tax filing period", "The deceased's income tax return", "The heirs: the tax year ends on the day of the death", "Income Tax Act, art. 13; General Tax Act, art. 39"],
        ["No legal deadline", "Accepting the estate (in Catalonia) and telling the bank", "See \"Deadlines the law does not set\"", "Catalan Civil Code, art. 461-12"],
      ],
      checkNote: "Deadlines counted from the death unless stated otherwise. Laws and official pages read on 19 November 2026.",
      firstH: "The first hours: medical certificate, Civil Registry and burial licence",
      first: [
        `The ${lrc} makes registering a death compulsory and says it is done with a declaration on the official form, together with the medical death certificate (art. 62). Without that certificate there is no registration: the Act says a death can never be registered unless the certificate has been presented (art. 66). It is signed by the doctor who certifies the death.`,
        `If the person dies in a hospital, clinic or other health centre, the centre's management reports the death to the Civil Registry and the national statistics office (INE) electronically (art. 64). For a death at home or elsewhere, the people obliged (the certifying doctor, the relatives or someone they authorise, anyone living in the house) tell the authority as soon as possible (arts. 63 and 65). According to the ${mjRegister} (in Spanish), it is usually the funeral company, on the family's behalf, that reports the death to the Civil Registry.`,
        `With the paperwork, the Civil Registry registers the death at once and issues the death certificate, then the **burial or cremation licence**, within the time a regulation sets (art. 62.3): the Act itself gives no number of hours. If there are signs of a violent death or a court investigation, registration does not by itself give the licence, which is issued when the court authorises it (art. 67.2).`,
        `**In Catalonia**, the ${mortuary} sets the minimum: a body cannot be buried or cremated before 24 hours have passed since the death, except after an autopsy or organ removal for transplant (art. 11.1). If the burial will be later than 48 hours, temporary preservation of the body is compulsory (art. 35.1; 72 hours if the courts are involved). Each Spanish region has its own mortuary health rules: we only quote Catalonia's.`,
        `**At work**, the ${et} gives two days' leave for the death of a spouse, registered partner or relative up to the second degree by blood or marriage, and two more if you have to travel (art. 37.3.b bis). Other leave, in the ${paidLeave}.`,
      ],
      certsH: "The certificates: death, last wills and life insurance",
      certsIntro: `There are three different certificates, all requested on the Ministry of Justice e-office (in Spanish). The ${mjDeath} proves the death. The ${mjWills}, according to the ${mjWillsInfo}, shows whether the person made a will and before which notary, and is needed for any inheritance step. The ${mjInsurance} lists the policies in force on which the person was the insured and with which insurer (${insuranceAct}, art. 7).`,
      certsCaption: "The Ministry of Justice's three certificates",
      certsHead: ["Certificate", "From when", "How to apply", "How long"],
      certsRows: [
        ["Death", "Once the death is registered", "Online with Cl@ve or a digital certificate, or without identifying yourself (it comes by post). The same certificate cannot be requested again for 15 days", "At once, if the data is available online"],
        ["Last wills", "15 working days after the death", "Online with Cl@ve and fee 006, if the death was after 2 April 2009 and is not registered at a juzgado de paz; otherwise in person (Calle Bolsa 8, Madrid, by appointment) or by post, with the literal death certificate and form 790", "The page does not say. Once ready, you have 90 calendar days to download it"],
        ["Life insurance policies", "15 working days after the death", "The same: online with Cl@ve and fee 006, or in person or by post with form 790", "Usually 24 hours, sometimes up to 3 working days; the authority has 7 working days"],
      ],
      certsNote: "Ministry of Justice e-office, read on 19 November 2026. We do not print the amount of fee 006: the official pages we read do not show it.",
      certsAfter: [
        `The insurance register Act speaks of fifteen days from the date of death (${insuranceAct}, art. 6.2); the Ministry's e-office says 15 **working** days, and that is the count it applies. The data is kept for five years (art. 6.3). The certificate does not guarantee a payout: it is presumed accurate only about the contract existing, not about the cover (art. 3.3). With it you ask each insurer whether you are a beneficiary; if you are not, that is all they will tell you (art. 7.2). It covers life insurance with death cover and accident insurance that covers death (art. 4.1).`,
        `To count the 15 working days, use the ${workingDays}.`,
      ],
      inheritH: "The estate: a will or a declaration of heirs",
      inherit: [
        `Under the ${cc}, the rights to an estate pass at the moment of death (art. 657). The estate goes by will or, failing one, by law (art. 658). The law also decides when a will is void or does not cover all the assets (art. 912).`,
        `**If there is a will**, the last-wills certificate shows before which notary it was made; the notary of the latest will issues an authorised copy. **If there is no will**, descendants, ascendants, the spouse or partner and collateral relatives ask a notary for a **declaration of heirs** (declaración de herederos abintestato; ${notariado}, art. 55). The death and the absence of a will must be proved with the Civil Registry's and the General Register of Last Wills' information, plus two witnesses, and the notary cannot close the record (acta) until twenty working days after the request (art. 56). In Catalonia it is also done before a notary (Catalan Civil Code, art. 442-7).`,
        `**Accept or not.** You can accept outright, accept with the benefit of inventory, or renounce. Under the Spanish Civil Code, accepting outright makes you answer for the estate's debts with your own assets too (art. 1003). With the benefit of inventory, which you can use even if the will forbids it (art. 1010), you pay debts only up to what the estate is worth (art. 1023); if you hold estate assets, you have 30 days from learning you are an heir to ask a notary for the inventory (art. 1014). Anyone with an interest can ask a notary to give you **30 calendar days** to decide; if you do not answer, you are taken to have accepted outright (art. 1005).`,
      ],
      catH: "In Catalonia: what the Catalan Civil Code changes",
      catIntro: `Between Spain's civil laws, the deceased's civil residence (vecindad civil) decides: the estate follows the deceased's personal law, and the personal law is the one set by vecindad civil (${cc}, arts. 9.8 and 16.1). If the person had Catalan vecindad civil, the ${cccat} applies. If the person was not a Spanish national, other rules apply and this guide does not cover them: ask the notary.`,
      catCaption: "Spanish and Catalan Civil Codes: the differences that matter most",
      catHead: ["Topic", "Spanish Civil Code", "Catalan Civil Code"],
      catRows: [
        ["Children's forced share (legítima)", "Two thirds of the estate; one of them can be used to favour one child or descendant (art. 808)", "One quarter, in equal parts among all the children (arts. 451-3 and 451-5)"],
        ["No children or descendants", "Parents and ascendants are forced heirs (art. 807)", "The parents are entitled, half each (art. 451-4)"],
        ["Spouse or partner, with children", "The spouse has a life interest in the third set aside for favouring a child (art. 834)", "No forced share. Without enough means, can claim the quarta vidual, up to a quarter of the estate (art. 452-1). With no will, a life interest in the whole estate (art. 442-3)"],
        ["Deadline to accept", "If someone with an interest asks, the notary gives you 30 calendar days; silence means outright acceptance (art. 1005)", "No deadline (art. 461-12.1). If someone with an interest asks, after one month the notary gives you two months; if you do not accept, you are taken to renounce (art. 461-12.2)"],
        ["Inventory", "30 days from learning you are an heir, before a notary, if you hold estate assets (art. 1014)", "Six months from when you know or could reasonably know of the estate, before a notary or with the private inventory filed with the tax return (art. 461-15). Without it, outright acceptance (art. 461-17)"],
      ],
      catNote: "Spanish Civil Code (BOE) and book four of the Catalan Civil Code (Portal Jurídic), read on 19 November 2026.",
      catAfter: [
        `**With no will**, in Catalonia the children inherit first (art. 442-1). A spouse or stable partner alongside them gets a life interest in the whole estate (art. 442-3.1) and can swap it for a quarter of the estate plus a life interest in the family home, an option to be used within one year of the death (art. 442-5.2). With no children or descendants, the spouse or partner inherits and the parents keep their forced share (art. 442-3.2).`,
        `**The Catalan inventory is easier.** Besides the notary, a private inventory drawn up by the heir and filed with the tax authority for the inheritance tax has the same legal effect (art. 461-15.2). With an inventory, the heir answers for the debts only with the estate's assets (art. 461-20); without one, also with their own (arts. 461-17 and 461-18).`,
        `The Catalan forced share is worked out on the assets' value at death, minus debts and the costs of the last illness and the funeral, plus whatever the person gave away in the previous ten years (art. 451-5). Gifts made during life have their own tax, the gift tax: ${giftCalc}.`,
        `Book four changes on 4 February 2027 with ${llei13} (support for people with disabilities), which takes effect six months after publication. It does not touch the articles cited here, except 461-12, whose paragraphs 1 and 2 stay the same.`,
      ],
      taxH: "Taxes: inheritance tax, plusvalía and the deceased's income tax",
      tax: [
        `**Inheritance tax.** It is filed within **${m} months** of the day of the death (${risd}, art. 67.1.a). You can ask for an extension of another ${e} months within the first five months; if there is no answer within a month, it is granted, and late-payment interest applies (art. 68). According to the ${atc} (in Catalan or Spanish), the period runs from date to date. It is handled by the region where the deceased lived the most days of the last five years, if the heir also lives in Spain; if not, other rules apply.`,
        `**How much you pay** depends on the region, the relationship and what you receive. In Catalonia you file form 660 (the whole estate's assets) and one form 650 per heir. Estimate it with ${isdCat}, ${isdMad}, ${isdAnd} or ${isdVal}, and compare all 21 territories in ${isdCmp}.`,
        `**Plusvalía municipal.** If the estate includes a home or other urban property, the heir files the return with the council: on a death, within six months, extendable to one year if the heir asks (${trlrhl}, art. 110.2.b). The law lets each council grant up to 95% off on inheritances by descendants, spouses and ascendants (art. 108.4); the ${pv} takes it into account.`,
        `**The deceased's income tax.** Their tax year ends on the day of the death (${lirpf}, art. 13), and any pending tax obligations pass to the heirs (${lgt}, art. 39.1). That year's return is filed in the general period the Tax Ministry sets each year (Income Tax Act, art. 97.1).`,
      ],
      ssH: "Social Security: widow's and orphan's pensions and the death grant",
      ss: [
        `After a death, the ${lgss} provides, depending on the case, a death grant, a widow's or widower's pension, a temporary widow's benefit, an orphan's pension and a pension or allowance for other relatives; if the death was caused by an accident at work or an occupational disease, also a lump sum (art. 216).`,
        `**When to apply.** The right to these benefits, except the death grant, never lapses, but payment only goes back to three months before the date of the application (art. 230). ${ssEffects} spells it out for the widow's pension: if the deceased was working (in alta) and you apply within three months, you are paid from the day after the death; if the deceased was a pensioner, from the first day of the following month. So apply within the first three months.`,
        `**Widow's or widower's pension.** The requirements (marriage, registered partnership, separation or divorce) and the amount are in our ${widow}.`,
        `**Orphan's pension.** Children under 21 or unable to work are entitled (art. 224.1), and up to 25 if they do not work or earn less than the minimum wage over the year (art. 224.3). According to ${ssOrphan}, it is 20% of the regulatory base.`,
        `**Death grant.** It is a payment towards funeral costs for whoever paid them; unless shown otherwise, they are presumed to have been paid by the spouse, the registered partner, the children or relatives who lived with the deceased (art. 218). The ${ssGrant} gives the amount: €46.50, if the deceased was working or receiving a retirement or permanent incapacity pension. It does lapse (art. 230): the general five years from the day after the death apply (art. 53.1).`,
        `**How to apply.** According to ${ssHowTo}, through the Portal de Prestaciones or on the official form; also at a CAISS office by appointment (901 10 65 70 or 915 41 25 30) or at any official registry. Payment dates are in ${payDates}.`,
      ],
      bankH: "The bank: what is a rule and what is not",
      bank: [
        `None of the rules we quote orders a dead person's accounts to be "frozen". What exists, first, is the ${bde}'s guidance (in Spanish): until the estate is divided, banks should not allow withdrawals from the deceased customer's accounts, except with the authorisation of all the heirs, to pay funeral or burial costs, and for bills the holder had already authorised to keep up the estate (taxes, insurance, utilities).`,
        `In an account with several holders it depends on the type: if it is **indistinta or solidaria** (either to sign), the bank follows any co-holder's order without the heirs; if it is **mancomunada** (all to sign), it needs every holder, with all the heirs signing in place of the deceased. All this applies unless the holder arranged otherwise before dying.`,
        `Second, the ${lisd} makes banks **secondarily liable** for the inheritance tax if they hand over a deceased person's deposits (art. 8.1.a). A cheque made out to the tax authority to pay the inheritance tax itself does not count: if money from the account is needed to pay it, that is the route the law leaves open.`,
        `None of these rules sets a deadline for telling the bank.`,
      ],
      noDeadlineH: "Deadlines the law does not set",
      noDeadline: [
        "**Registering the death:** the Act gives no number of days. A hospital reports it within the time a regulation sets (Act 20/2011, art. 64); elsewhere, as soon as possible (art. 65).",
        "**The burial licence:** within the time a regulation sets (art. 62.3). In Catalonia the 24-hour minimum before burial is set (Decree 297/1997, art. 11.1).",
        "**Accepting the estate in Catalonia:** the right to accept or renounce has no time limit (Catalan Civil Code, art. 461-12.1), unless someone with an interest asks a notary to require you to decide.",
        "**The declaration of heirs:** the law sets a minimum (20 working days from the request), not a maximum.",
        "**Applying for a widow's or orphan's pension:** the right never lapses, but payment only goes back three months (LGSS, art. 230).",
        "**The last-wills certificate:** the Ministry's page does not say how long it takes; the insurance one, usually 24 hours and at most 7 working days.",
        "**Telling the bank:** the rules quoted set no deadline.",
      ],
      disclaimerTitle: "This guide is not a substitute for professional advice",
      disclaimer: `It summarises the general rules as read on 19 November 2026; it is not legal or tax advice. Every estate depends on the will, the deceased's vecindad civil, the marital property regime and the assets. Before you sign or pay, ask the notary, your region's tax office (in Catalonia, the official calculation is the ${atcHelp}) or Social Security. Our calculators give an estimate, not the official assessment.`,
      faqH: "Frequently asked questions",
      faq: [
        { question: "When can I request the certificate of last wills?", answer: "15 working days after the death: before that, the Ministry of Justice e-office does not accept the request. You apply online with Cl@ve (if the death was after 2 April 2009 and is not registered at a juzgado de paz) or in person or by post with the literal death certificate." },
        { question: "How much does the last-wills certificate cost?", answer: "You pay the Ministry of Justice's fee 006 (form 790), the same as for the insurance certificate. We do not print the amount because the official pages we read do not show it." },
        { question: "What is the certificado de seguros de cobertura de fallecimiento?", answer: "The certificate listing the life insurance policies with death cover, or accident policies covering death, on which the person was insured, and with which insurer (Act 20/2005). With it you ask each insurer whether you are a beneficiary. It can be requested after 15 working days, and the data is kept for five years." },
        { question: "What is the deadline for inheritance tax in Spain?", answer: `${m} months from the death. If you ask for an extension within the first ${ask} months, another ${e} months, with late-payment interest (Royal Decree 1629/1991, arts. 67 and 68).` },
        { question: "What is the deadline for plusvalía on an inheritance?", answer: `${pm} months from the death, extendable to one year if you ask (Local Finance Act, art. 110.2.b).` },
        { question: "How do I apply for a widow's pension in Spain?", answer: "On Social Security's Portal de Prestaciones, with the official form, at a CAISS office by appointment or at any official registry. Apply within three months: payment only goes back three months before the application." },
        { question: "How much is the death grant (auxilio por defunción)?", answer: "€46.50, for whoever paid for the funeral, if the deceased was working or receiving a retirement or permanent incapacity pension (Social Security). You have five years to claim it." },
        { question: "Does the bank freeze the deceased's account?", answer: "Not by law. The Bank of Spain's guidance is that, until the estate is divided, the bank should not allow withdrawals, except with all the heirs' authorisation, to pay the funeral or bills already authorised. In an indistinta account, the other holder can keep using it." },
        { question: "Is there a deadline to accept an inheritance?", answer: "In Catalonia, no (Catalan Civil Code, art. 461-12.1). But someone with an interest can ask a notary to make you decide: under the Spanish Civil Code you get 30 calendar days and silence means acceptance; in Catalonia, two months and silence means renouncing." },
        { question: "What is the forced share (legítima) in Catalonia?", answer: "A quarter of the estate, in equal parts among the children; with no descendants, for the parents. Under the Spanish Civil Code, two thirds." },
        { question: "How many days' leave do I get when a relative dies?", answer: "Two days for a spouse, registered partner or relative up to the second degree, and two more if you have to travel (Workers' Statute, art. 37.3.b bis)." },
        { question: "Do I need a notary if there is no will?", answer: "Yes: a declaration of heirs for descendants, ascendants, the spouse or partner and collateral relatives is made before a notary, with the Civil Registry's and the last-wills register's information and two witnesses (Notaries Act, arts. 55 and 56)." },
        { question: "Who has to register the death?", answer: "The hospital where it happens; otherwise the certifying doctor, the relatives or someone they authorise. According to the Ministry of Justice, the funeral company usually does it on the family's behalf." },
      ],
      official: `${lrc} (arts. 62 to 67), Ministry of Justice pages (registration, death, last wills, insurance), ${insuranceAct}, ${mortuary}, ${et}, ${cc}, ${notariado}, ${cccat} and ${llei13}, ${risd}, ${lisd}, ${trlrhl}, ${lirpf}, ${lgt}, ${lgss}, Social Security pages, the ${atc} and the ${bde}. The official texts are in Spanish or Catalan; this page reports them in its own words.`,
      related: {
        cmp: "Spain inheritance tax by region: all 21 territories compared",
        cat: "Catalonia inheritance tax calculator",
        mad: "Madrid inheritance tax",
        and: "Andalusia inheritance tax",
        val: "Valencia region inheritance tax",
        gift: "Catalonia gift tax",
        pv: "Plusvalía municipal tax calculator",
        widow: "Spain widow's pension: requirements and amount",
        leave: "Paid leave in Spain: days by law",
        costs: "Spain home buying costs: notary and Land Registry",
      },
    },
  }[L];

  const r = t.related;
  const item = (id: CalculatorId, label: string) => a(calcPath(id, L), label);
  const relatedCalcs = [
    item("inheritance-tax-by-region", r.cmp),
    item("inheritance-tax", r.cat),
    item("inheritance-tax-madrid", r.mad),
    item("inheritance-tax-andalucia", r.and),
    item("inheritance-tax-valencia", r.val),
    item("gift-tax-catalonia", r.gift),
    item("plusvalia", r.pv),
    item("widow-pension", r.widow),
    item("paid-leave", r.leave),
    item("home-purchase-costs", r.costs),
  ];

  return [
    lead(t.lead),
    table(t.checkCaption, t.checkHead, t.checkRows, t.checkNote),
    ...h2(t.firstH, ...t.first),
    ...h2(t.certsH, t.certsIntro),
    table(t.certsCaption, t.certsHead, t.certsRows, t.certsNote),
    ...paras(...t.certsAfter),
    ...h2(t.inheritH, ...t.inherit),
    ...h2(t.catH, t.catIntro),
    table(t.catCaption, t.catHead, t.catRows, t.catNote),
    ...paras(...t.catAfter),
    ...h2(t.taxH, ...t.tax),
    ...h2(t.ssH, ...t.ss),
    ...h2(t.bankH, ...t.bank),
    ...h2(t.noDeadlineH),
    list(...t.noDeadline),
    callout("warning", t.disclaimerTitle, t.disclaimer),
    { type: "heading", level: 2, text: t.faqH } as Block,
    faq(t.faq),
    callout("official", verifiedLine(L, DEATH_STEPS_AS_OF), t.official),
    ...b2Related(["payDates"], L, relatedCalcs),
  ];
}

export const DEATH_STEPS_GUIDE: B2Article = {
  key: "deathSteps",
  entryKey: "guide-death-steps-deadlines-spain",
  categoryKey: "public-services",
  sources: SOURCES,
  heroKey: "defuncio-cementiri-poblenou-entrada",
  heroAlt: {
    ca: "Portal d'entrada del Cementiri del Poblenou, a Barcelona, amb dos obeliscs de pedra i una reixa de ferro",
    es: "Portal de entrada del Cementerio del Poblenou, en Barcelona, con dos obeliscos de piedra y una reja de hierro",
    en: "Entrance gate of the Poblenou Cemetery in Barcelona, with two stone obelisks and an iron gate",
  },
  heroCaption: {
    ca: "Entrada del Cementiri del Poblenou, a Barcelona.",
    es: "Entrada del Cementerio del Poblenou, en Barcelona.",
    en: "Entrance to the Poblenou Cemetery in Barcelona.",
  },
  verifiedAt: DEATH_STEPS_AS_OF,
  publishedAt: "2026-11-19T21:00:00+01:00",
  editions: Object.fromEntries(
    LOCALES.map((locale) => [locale, { path: B2_PATHS.deathSteps[locale], ...DEATH_STEPS_META[locale], blocks: buildDeathStepsBody(locale) }]),
  ) as B2Article["editions"],
};
