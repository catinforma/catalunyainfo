import { AdSlot } from "@/components/AdSlot";
import { crumbPath } from "@/components/share/ShareBar";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { CalculatorNextStep, MoreCalculators } from "@/components/programmatic/calculators/MoreCalculators";
import { mdLinks } from "@/components/programmatic/calculators/md-links";
import { ShareBar } from "@/components/share/ShareBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SourcesPolicyLink } from "@/components/SourcesPolicyLink";
import { getMessages } from "@/lib/i18n";
import { calcPath } from "@/lib/programmatic/calculators/paths";
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import { ipremPath } from "@/lib/programmatic/iprem/copy";
import { bonoSocialLimitLine, pensionRevaluationLine } from "@/lib/programmatic/calculators/context-links";
import { pensionPath } from "@/lib/programmatic/pensions-2027/copy";
import { subsidyPath } from "@/lib/programmatic/unemployment-subsidy/copy";
import { elDay, euros, ncEditions, ncPath, perMonth, perYear, whole, type NcLocale } from "@/lib/programmatic/non-contributory-pension/copy";
import type { PncResult } from "@/lib/programmatic/non-contributory-pension/engine";
import { DEFAULT_INPUT, examples, headline, ncFaq, ncMeta, workExamples, type ExampleId } from "@/lib/programmatic/non-contributory-pension/page";
import {
  ABSENCE_DAYS,
  AMOUNTS_YEAR,
  CHANGE_DAYS,
  FIRST_DEGREE_TIMES,
  GENCAT_ANSWER_DAYS,
  GENCAT_UPDATED,
  IPREM_12,
  IPREM_YEAR,
  LGSS_ANCHOR,
  OFFICIAL_PROCEDURE,
  PNC_ANNUAL,
  QUOTE,
  RENT_RESIDED_DAYS,
  RULES_AS_OF,
  SOURCES,
  householdLimit,
  individualAmount,
  monthly,
} from "@/lib/programmatic/non-contributory-pension/rules";
import { absoluteUrl } from "@/lib/site";
import { ORGANIZATION_ID, breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { NcPensionCalculator } from "./NcPensionCalculator";

/**
 * "Pensión no contributiva: requisitos y cuánto se cobra" / "Pensió no
 * contributiva" / "Spain non-contributory pension": the calculator
 * (server-rendered on a 67-year-old living alone with no income), then the
 * 2026 amounts, the requirements of each type, the household unit and its
 * limits, how the amount is worked out, work with the invalidity pension,
 * the rent supplement, Catalonia (the Generalitat manages it), how to apply,
 * worked examples, questions, sources and limits. Every figure comes from
 * rules.ts through the engine.
 */

const L = <T,>(locale: NcLocale, v: Record<NcLocale, T>): T => v[locale];

export function ncCrumbs(locale: NcLocale): Crumb[] {
  return [{ label: getMessages(locale).common.home, href: `/${locale}/` }, hubCrumb(locale), { label: ncMeta(locale).breadcrumb, href: ncPath(locale) }];
}

export function ncMetadata(locale: NcLocale): Metadata {
  const m = ncMeta(locale);
  return buildMetadata({ locale, path: ncPath(locale), title: m.title, description: m.description, translations: ncEditions() });
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} rel="noopener" target="_blank">
      {children}
    </a>
  );
}

function Quote({ text, href, label, lang = "es" }: { text: string; href: string; label: string; lang?: "es" | "ca" }) {
  return (
    <blockquote lang={lang}>
      <p>«{text}»</p>
      <footer className="text-sm">
        <A href={href}>{label}</A>
      </footer>
    </blockquote>
  );
}

const md = mdLinks;

function exampleLabel(id: ExampleId, locale: NcLocale): string {
  const labels: Record<ExampleId, Record<NcLocale, string>> = {
    alone: { es: "Jubilación, 70 años, vive sola de alquiler, sin ingresos", ca: "Jubilació, 70 anys, viu sola de lloguer, sense ingressos", en: "Retirement, 70, lives alone in a rented flat, no income" },
    "own-income": { es: "Jubilación, 68 años, vive solo, 5.000 € al año de ingresos propios", ca: "Jubilació, 68 anys, viu sol, 5.000 € l'any d'ingressos propis", en: "Retirement, 68, lives alone, €5,000 a year of own income" },
    couple: { es: "Matrimonio de 66 años, los dos la piden, sin ingresos", ca: "Matrimoni de 66 anys, tots dos la demanen, sense ingressos", en: "Married couple, both 66, both apply, no income" },
    "with-daughter": { es: "Incapacidad, 45 años, 70 % de discapacidad, vive con su hija, que gana 30.000 € al año", ca: "Incapacitat, 45 anys, 70 % de discapacitat, viu amb la filla, que guanya 30.000 € l'any", en: "Invalidity, 45, 70% disability, lives with a daughter earning €30,000 a year" },
    "with-brother": { es: "Jubilación, 67 años, vive con su hermano, que gana 16.000 € al año", ca: "Jubilació, 67 anys, viu amb el germà, que guanya 16.000 € l'any", en: "Retirement, 67, lives with a brother earning €16,000 a year" },
    "third-person": { es: "Incapacidad, 30 años, 80 % y necesita a otra persona, vive solo, sin ingresos", ca: "Incapacitat, 30 anys, 80 % i necessita una altra persona, viu sol, sense ingressos", en: "Invalidity, 30, 80% and needs another person, lives alone, no income" },
    minimum: { es: "Jubilación, 66 años, casada; la pensión del marido, 14.000 € al año", ca: "Jubilació, 66 anys, casada; la pensió del marit, 14.000 € l'any", en: "Retirement, 66, married; the husband's pension, €14,000 a year" },
    residence: { es: "Jubilación, 70 años, 8 años de residencia en España", ca: "Jubilació, 70 anys, 8 anys de residència a Espanya", en: "Retirement, 70, 8 years of residence in Spain" },
  };
  return labels[id][locale];
}

function accessCell(r: PncResult, locale: NcLocale): string {
  if (r.eligible) return L(locale, { es: "Sí", ca: "Sí", en: "Yes" });
  const c = r.checks.find((x) => !x.ok)!;
  return L(locale, { es: `No (art. ${c.article})`, ca: `No (art. ${c.article})`, en: `No (art. ${c.article})` });
}

function amountCell(r: PncResult, locale: NcLocale): string {
  if (!r.amount) return "—";
  const a = r.amount;
  const M = perMonth(a.monthly, locale);
  const why: string[] = [];
  if (a.full !== PNC_ANNUAL) why.push(L(locale, { es: "importe compartido", ca: "import compartit", en: "shared amount" }));
  if (a.ownCut > 0) why.push(L(locale, { es: `−${euros(a.ownCut, "es")} por ingresos propios`, ca: `−${euros(a.ownCut, "ca")} per ingressos propis`, en: `−${euros(a.ownCut, "en")} for own income` }));
  if (a.householdCut > 0) why.push(L(locale, { es: `−${euros(a.householdCut, "es")} por el límite del hogar`, ca: `−${euros(a.householdCut, "ca")} pel límit de la llar`, en: `−${euros(a.householdCut, "en")} for the household limit` }));
  if (a.floorApplied) why.push(L(locale, { es: "mínimo del 25 %", ca: "mínim del 25 %", en: "the 25% floor" }));
  if (a.complement > 0) why.push(L(locale, { es: "con complemento del 50 %", ca: "amb complement del 50 %", en: "with the 50% top-up" }));
  if (r.rent.status === "may") why.push(L(locale, { es: `+ ${euros(r.rent.annual, "es")} de alquiler al año`, ca: `+ ${euros(r.rent.annual, "ca")} de lloguer l'any`, en: `+ ${euros(r.rent.annual, "en")} rent supplement a year` }));
  return why.length ? `${M} (${why.join("; ")})` : M;
}

export function NcPensionRoute({ locale }: { locale: NcLocale }) {
  const meta = ncMeta(locale);
  const crumbs = ncCrumbs(locale);
  const h = headline();
  const faq = ncFaq(locale);
  const P = (n: number) => whole(n, locale);
  const E = (n: number) => euros(n, locale);
  const M = (n: number) => perMonth(n, locale);
  const Y = (n: number) => perYear(n, locale);
  const on = (iso: string) => elDay(iso, locale);

  const lead = L(locale, {
    es: `La pensión no contributiva de jubilación (desde los ${h.age} años) o de incapacidad (de 18 a 64, con un ${P(h.disability)} de discapacidad) es de ${M(h.monthly)} en 14 pagas en 2026 para quien no tiene otros ingresos, y nunca baja de ${M(h.minMonthly)}. Se cobra sin haber cotizado, con ${h.resRetirement} o ${h.resInvalidity} años de residencia legal en España y si tus ingresos y los de la familia con la que vives no pasan de unos límites. Comprueba tu caso:`,
    ca: `La pensió no contributiva de jubilació (des dels ${h.age} anys) o d'incapacitat (de 18 a 64, amb un ${P(h.disability)} de discapacitat) és de ${M(h.monthly)} en 14 pagues el 2026 per a qui no té altres ingressos, i mai no baixa de ${M(h.minMonthly)}. Es cobra sense haver cotitzat, amb ${h.resRetirement} o ${h.resInvalidity} anys de residència legal a Espanya i si els teus ingressos i els de la família amb qui vius no passen d'uns límits. Comprova el teu cas:`,
    en: `Spain's non-contributory retirement pension (from ${h.age}) or invalidity pension (18 to 64, with a ${P(h.disability)} disability) is ${M(h.monthly)} in 14 payments in 2026 for someone with no other income, and never falls below ${M(h.minMonthly)}. No contributions are needed: ${h.resRetirement} or ${h.resInvalidity} years of legal residence in Spain and income, yours and that of the family you live with, under the limits. Check your case:`,
  });
  const fresh = L(locale, {
    es: `Normas revisadas ${on(RULES_AS_OF)} en el BOE (Ley General de la Seguridad Social, texto consolidado con última actualización del 11/11/2026; Real Decreto-ley 3/2026; Real Decreto 241/2026; Real Decreto 357/1991; Real Decreto 1191/2012), el Imserso y la Generalitat. Cuantías de ${AMOUNTS_YEAR}.`,
    ca: `Normes revisades ${on(RULES_AS_OF)} al BOE (Llei general de la Seguretat Social, text consolidat amb última actualització de l'11/11/2026; Reial decret llei 3/2026; Reial decret 241/2026; Reial decret 357/1991; Reial decret 1191/2012), a l'Imserso i a la Generalitat. Quanties del ${AMOUNTS_YEAR}.`,
    en: `Rules checked ${on(RULES_AS_OF)} in the BOE (General Social Security Act, consolidated text last updated 11/11/2026; Royal Decree-law 3/2026; Royal Decree 241/2026; Royal Decree 357/1991; Royal Decree 1191/2012), with IMSERSO and the Generalitat. ${AMOUNTS_YEAR} amounts.`,
  });
  const disclaimer = L(locale, {
    es: "Simulación orientativa, no vinculante. Decide el órgano de tu comunidad autónoma (en Cataluña, el Departament de Drets Socials i Inclusió) con tus documentos, los de tu unidad económica y los datos de Hacienda. La solicitud oficial en Cataluña:",
    ca: "Simulació orientativa, no vinculant. Decideix l'òrgan de la teva comunitat autònoma (a Catalunya, el Departament de Drets Socials i Inclusió) amb els teus documents, els de la teva unitat econòmica i les dades d'Hisenda. La sol·licitud oficial a Catalunya:",
    en: "An estimate for guidance only, not binding. Your region's body decides (in Catalonia, the Departament de Drets Socials i Inclusió) from your documents, those of your household unit and the tax office's data. The official application in Catalonia:",
  });
  const procedureLinks = L(locale, {
    es: { ret: "pensión no contributiva por jubilación (Generalitat, en catalán)", inv: "pensión no contributiva por incapacidad (Generalitat, en catalán)", rent: "complemento de alquiler (Generalitat, en catalán)", info: "Drets Socials: pensiones no contributivas", where: "dónde se pide en cada comunidad (Imserso)" },
    ca: { ret: "pensió no contributiva per jubilació (Generalitat)", inv: "pensió no contributiva per incapacitat (Generalitat)", rent: "complement de lloguer (Generalitat)", info: "Drets Socials: pensions no contributives", where: "on es demana a cada comunitat (Imserso, en castellà)" },
    en: { ret: "non-contributory retirement pension (Generalitat, in Catalan)", inv: "non-contributory invalidity pension (Generalitat, in Catalan)", rent: "rent supplement (Generalitat, in Catalan)", info: "Drets Socials: non-contributory pensions (in Catalan)", where: "where to apply in each region (IMSERSO, in Spanish)" },
  });

  const hd = L(locale, {
    es: { amounts: `Cuánto es la pensión no contributiva en ${AMOUNTS_YEAR}`, req: "Requisitos: jubilación e incapacidad", unit: "La unidad económica y sus límites de ingresos", calc: "Cómo se calcula lo que cobras", work: "Trabajar con la pensión de incapacidad", rent: `Complemento de alquiler: ${Y(h.rent)}`, cat: "En Cataluña: la gestiona la Generalitat", apply: "Cómo se pide, desde cuándo se cobra y qué hay que comunicar", examples: "Ejemplos", faq: "Preguntas frecuentes", sources: "Fuentes oficiales", limits: "Qué no calcula y cómo leemos la norma" },
    ca: { amounts: `Quant és la pensió no contributiva el ${AMOUNTS_YEAR}`, req: "Requisits: jubilació i incapacitat", unit: "La unitat econòmica i els seus límits d'ingressos", calc: "Com es calcula el que cobres", work: "Treballar amb la pensió d'incapacitat", rent: `Complement de lloguer: ${Y(h.rent)}`, cat: "A Catalunya: la gestiona la Generalitat", apply: "Com es demana, des de quan es cobra i què cal comunicar", examples: "Exemples", faq: "Preguntes freqüents", sources: "Fonts oficials", limits: "Què no calcula i com llegim la norma" },
    en: { amounts: `How much the non-contributory pension is in ${AMOUNTS_YEAR}`, req: "Requirements: retirement and invalidity", unit: "The household unit and its income limits", calc: "How your amount is worked out", work: "Working with the invalidity pension", rent: `Rent supplement: ${Y(h.rent)}`, cat: "In Catalonia: the Generalitat runs it", apply: "How to apply, when payment starts and what to report", examples: "Worked examples", faq: "Questions", sources: "Official sources", limits: "What it does not cover, and how we read the rules" },
  });
  const lgss = (art: string) => L(locale, { es: `Ley General de la Seguridad Social, ${art}`, ca: `Llei general de la Seguretat Social, ${art}`, en: `General Social Security Act, ${art}` });
  const rd = (n: string, art: string) => L(locale, { es: `Real Decreto ${n}, ${art}`, ca: `Reial decret ${n}, ${art}`, en: `Royal Decree ${n}, ${art}` });
  const imserso = (what: string) => `Imserso, ${what}`;
  const gencat = (what: string) => `Generalitat de Catalunya, ${what}`;

  /* Amounts ----------------------------------------------------------------- */
  const amountCols = L(locale, { es: ["Cuantía", "Al mes (14 pagas)", "Al año"], ca: ["Quantia", "Al mes (14 pagues)", "L'any"], en: ["Amount", "A month (14 payments)", "A year"] });
  const amountRows: [string, number][] = [
    [L(locale, { es: "Íntegra (sin otros ingresos)", ca: "Íntegra (sense altres ingressos)", en: "Full (no other income)" }), PNC_ANNUAL],
    [L(locale, { es: "Mínima (25 %)", ca: "Mínima (25 %)", en: "Minimum (25%)" }), h.minAnnual],
    [L(locale, { es: "Complemento por necesitar a otra persona (50 %)", ca: "Complement per necessitar una altra persona (50 %)", en: "Top-up for needing another person (50%)" }), h.thirdAnnual],
    [L(locale, { es: "Íntegra con ese complemento", ca: "Íntegra amb aquest complement", en: "Full with that top-up" }), PNC_ANNUAL + h.thirdAnnual],
    ...[2, 3, 4].map((n): [string, number] => [L(locale, { es: `Cada uno, con ${n} beneficiarios en la misma unidad`, ca: `Cadascú, amb ${n} beneficiaris a la mateixa unitat`, en: `Each, with ${n} beneficiaries in the same unit` }), individualAmount(n)]),
  ];
  const amountCaption = L(locale, {
    es: "Real Decreto-ley 3/2026, art. 2.5, y Real Decreto 241/2026, art. 21.1; porcentajes de la Ley General de la Seguridad Social, art. 364. Las mismas cifras que publica el Imserso.",
    ca: "Reial decret llei 3/2026, art. 2.5, i Reial decret 241/2026, art. 21.1; percentatges de la Llei general de la Seguretat Social, art. 364. Les mateixes xifres que publica l'Imserso.",
    en: "Royal Decree-law 3/2026, art. 2.5, and Royal Decree 241/2026, art. 21.1; percentages from the General Social Security Act, art. 364. The same figures IMSERSO publishes.",
  });
  const amountText = L(locale, {
    es: [
      "**Se cobra en 14 pagas**: doce mensualidades y dos extraordinarias, en junio y noviembre. La cuantía mensual es la anual dividida entre 14.",
      `**En enero de ${AMOUNTS_YEAR + 1} cambia**: la ley manda subirla al menos lo mismo que las contributivas; la cuantía de ${AMOUNTS_YEAR + 1} aún no está en el BOE.`,
      "Además, la pensión da derecho a la **asistencia médica y farmacéutica** de la Seguridad Social y a servicios sociales complementarios.",
    ],
    ca: [
      "**Es cobra en 14 pagues**: dotze mensualitats i dues extraordinàries, al juny i al novembre. La quantia mensual és l'anual dividida entre 14.",
      `**El gener del ${AMOUNTS_YEAR + 1} canvia**: la llei mana apujar-la almenys el mateix que les contributives; la quantia del ${AMOUNTS_YEAR + 1} encara no és al BOE.`,
      "A més, la pensió dona dret a l'**assistència mèdica i farmacèutica** de la Seguretat Social i a serveis socials complementaris.",
    ],
    en: [
      "**Paid in 14 payments**: twelve monthly ones and two extra ones, in June and November. The monthly figure is the annual one divided by 14.",
      `**It changes in January ${AMOUNTS_YEAR + 1}**: the law says it rises at least as much as contributory pensions; the ${AMOUNTS_YEAR + 1} amount is not in the BOE yet.`,
      "The pension also brings Social Security **medical and pharmacy care** and complementary social services.",
    ],
  });

  /* Requirements ------------------------------------------------------------- */
  const reqCols = L(locale, { es: ["", "Jubilación", "Incapacidad"], ca: ["", "Jubilació", "Incapacitat"], en: ["", "Retirement", "Invalidity"] });
  const reqRows: [string, string, string][] = L(locale, {
    es: [
      ["Edad", `${h.age} años o más`, "De 18 a 64 años"],
      ["Residencia legal en España", `${h.resRetirement} años entre los 16 y la solicitud; los 2 últimos, seguidos`, `${h.resInvalidity} años; los 2 últimos, seguidos`],
      ["Discapacidad o enfermedad crónica", "No se pide", `${P(h.disability)} o más (${P(h.disabilityThird)} y ayuda de otra persona: +50 %)`],
      ["Ingresos propios", `Menos de ${Y(PNC_ANNUAL)}`, `Menos de ${Y(PNC_ANNUAL)}`],
      ["Si vives con familia", "Los de toda la unidad, bajo su límite", "Los de toda la unidad, bajo su límite"],
      ["Artículo", "369 (cuantía: 370 y 364)", "363 y 364"],
    ],
    ca: [
      ["Edat", `${h.age} anys o més`, "De 18 a 64 anys"],
      ["Residència legal a Espanya", `${h.resRetirement} anys entre els 16 i la sol·licitud; els 2 últims, seguits`, `${h.resInvalidity} anys; els 2 últims, seguits`],
      ["Discapacitat o malaltia crònica", "No es demana", `${P(h.disability)} o més (${P(h.disabilityThird)} i ajuda d'una altra persona: +50 %)`],
      ["Ingressos propis", `Menys de ${Y(PNC_ANNUAL)}`, `Menys de ${Y(PNC_ANNUAL)}`],
      ["Si vius amb família", "Els de tota la unitat, sota el seu límit", "Els de tota la unitat, sota el seu límit"],
      ["Article", "369 (quantia: 370 i 364)", "363 i 364"],
    ],
    en: [
      ["Age", `${h.age} or over`, "18 to 64"],
      ["Legal residence in Spain", `${h.resRetirement} years between 16 and the application; the last 2 in a row`, `${h.resInvalidity} years; the last 2 in a row`],
      ["Disability or chronic illness", "Not required", `${P(h.disability)} or more (${P(h.disabilityThird)} and another person's help: +50%)`],
      ["Own income", `Under ${Y(PNC_ANNUAL)}`, `Under ${Y(PNC_ANNUAL)}`],
      ["If you live with family", "The whole unit's, under its limit", "The whole unit's, under its limit"],
      ["Article", "369 (amount: 370 and 364)", "363 and 364"],
    ],
  });
  const reqText = L(locale, {
    es: [
      `**No hace falta haber cotizado.** Pueden pedirla los españoles y los extranjeros con residencia legal. Las ausencias de España de menos de ${ABSENCE_DAYS} días al año, o por enfermedad justificada, no rompen la residencia.`,
      "**A los 65 la de incapacidad pasa a llamarse de jubilación** y se sigue cobrando igual, con el complemento si lo tenías.",
      `**El Imserso presume el ${P(h.disability)}** a quien tiene reconocida una incapacidad permanente absoluta, y el ${P(h.disabilityThird)} con necesidad de otra persona a quien tiene una gran incapacidad.`,
      "**Desde el 23 de octubre de 2026** las indemnizaciones por responsabilidad civil por daños personales no cuentan como ingresos (Ley 4/2026); sí cuentan los salarios o prestaciones atrasados que se cobren por sentencia y los intereses de la indemnización.",
    ],
    ca: [
      `**No cal haver cotitzat.** La poden demanar els espanyols i els estrangers amb residència legal. Les absències d'Espanya de menys de ${ABSENCE_DAYS} dies l'any, o per malaltia justificada, no trenquen la residència.`,
      "**Als 65 la d'incapacitat passa a dir-se de jubilació** i es continua cobrant igual, amb el complement si el tenies.",
      `**L'Imserso presumeix el ${P(h.disability)}** a qui té reconeguda una incapacitat permanent absoluta, i el ${P(h.disabilityThird)} amb necessitat d'una altra persona a qui té una gran incapacitat.`,
      "**Des del 23 d'octubre de 2026** les indemnitzacions per responsabilitat civil per danys personals no compten com a ingressos (Llei 4/2026); sí que compten els salaris o prestacions endarrerits que es cobrin per sentència i els interessos de la indemnització.",
    ],
    en: [
      `**No contributions are needed.** Spanish nationals and foreigners with legal residence can apply. Absences from Spain of under ${ABSENCE_DAYS} days a year, or for a justified illness, do not break residence.`,
      "**At 65 the invalidity pension is renamed a retirement pension** and carries on unchanged, top-up included.",
      `**IMSERSO presumes ${P(h.disability)}** for anyone with a recognised absolute permanent incapacity, and ${P(h.disabilityThird)} with the need for another person for a gran incapacidad.`,
      "**Since 23 October 2026** civil-liability compensation for personal injury no longer counts as income (Law 4/2026); back pay or benefits paid under a judgment, and the interest the compensation earns, still do.",
    ],
  });

  /* Household unit ----------------------------------------------------------- */
  const unitCols = L(locale, {
    es: ["Personas en la unidad", "Con cónyuge, abuelos, nietos o hermanos", "Si hay un padre, madre o hijo"],
    ca: ["Persones a la unitat", "Amb cònjuge, avis, néts o germans", "Si hi ha un pare, mare o fill"],
    en: ["People in the unit", "With a spouse, grandparents, grandchildren or siblings", "With a parent or child"],
  });
  const unitRows = [2, 3, 4, 5, 6, 7, 8].map((m) => [String(m), Y(householdLimit(m, false)), Y(householdLimit(m, true))]);
  const thirdRows = [2, 3, 4].map((m) => [String(m), Y(householdLimit(m, false, true)), Y(householdLimit(m, true, true))]);
  const unitText = L(locale, {
    es: [
      "**Quién forma la unidad económica**: tú y las personas con las que vives que son tu cónyuge o parientes de sangre o por adopción hasta segundo grado (padres, hijos, abuelos, nietos y hermanos). Los ingresos de los demás convivientes, como amigos, suegros o cuñados, no cuentan.",
      `**El límite** es la pensión (${E(PNC_ANNUAL)}) más el 70 % por cada miembro más; si entre ellos está tu padre, tu madre o un hijo, se multiplica por ${String(FIRST_DEGREE_TIMES).replace(".", ",")}. Tus ingresos más los suyos tienen que quedar por debajo.`,
      "**Qué cuenta como ingreso**: el bruto de sueldos, pensiones y prestaciones, y los rendimientos de ahorros y bienes; si un bien no rinde, se valora como en el IRPF. No cuenta la vivienda en la que vives ni las asignaciones por hijo a cargo.",
    ],
    ca: [
      "**Qui forma la unitat econòmica**: tu i les persones amb qui vius que són el teu cònjuge o parents de sang o per adopció fins a segon grau (pares, fills, avis, néts i germans). Els ingressos dels altres convivents, com amics, sogres o cunyats, no compten.",
      `**El límit** és la pensió (${E(PNC_ANNUAL)}) més el 70 % per cada membre més; si entre ells hi ha el teu pare, la teva mare o un fill, es multiplica per ${String(FIRST_DEGREE_TIMES).replace(".", ",")}. Els teus ingressos més els seus han de quedar per sota.`,
      "**Què compta com a ingrés**: el brut de sous, pensions i prestacions, i els rendiments d'estalvis i béns; si un bé no rendeix, es valora com a l'IRPF. No compta l'habitatge on vius ni les assignacions per fill a càrrec.",
    ],
    en: [
      "**Who makes up the household unit**: you and the people you live with who are your spouse or blood or adoptive relatives up to the second degree (parents, children, grandparents, grandchildren and siblings). Other housemates' income, such as friends or in-laws, does not count.",
      `**The limit** is the pension (${E(PNC_ANNUAL)}) plus 70% for each extra member; if your father, mother or a child is among them, it is multiplied by ${FIRST_DEGREE_TIMES}. Your income plus theirs must stay under it.`,
      "**What counts as income**: gross wages, pensions and benefits, and the yield of savings and property; property that yields nothing is valued as for income tax. The home you live in and child benefit do not count.",
    ],
  });
  const thirdCaption = L(locale, {
    es: "Con el complemento de tercera persona (incapacidad, 75 % y ayuda de otra persona), el Imserso calcula los límites sobre la pensión más el 50 %:",
    ca: "Amb el complement de tercera persona (incapacitat, 75 % i ajuda d'una altra persona), l'Imserso calcula els límits sobre la pensió més el 50 %:",
    en: "With the third-person top-up (invalidity, 75% and another person's help), IMSERSO works out the limits on the pension plus 50%:",
  });

  /* Calculation --------------------------------------------------------------- */
  const calcSteps = L(locale, {
    es: [
      `**1. El punto de partida**: ${E(PNC_ANNUAL)} al año. Si en la unidad hay más de un beneficiario, se suma el 70 % por cada uno más y se reparte: ${Y(individualAmount(2))} cada uno si sois dos.`,
      `**2. Tus ingresos**: se descuenta solo lo que pase de ${E(h.free)} al año (el 35 % de la pensión).`,
      "**3. Los de la unidad**: si vives con personas que no la cobran y los ingresos de todos más la pensión pasan del límite, la pensión baja lo que se pase.",
      `**4. El mínimo**: nunca menos de ${Y(h.minAnnual)} (${M(h.minMonthly)}).`,
      `**5. El complemento**: con la de incapacidad, un ${P(h.disabilityThird)} y necesidad de otra persona, se suman ${Y(h.thirdAnnual)}.`,
    ],
    ca: [
      `**1. El punt de partida**: ${E(PNC_ANNUAL)} l'any. Si a la unitat hi ha més d'un beneficiari, se suma el 70 % per cadascun més i es reparteix: ${Y(individualAmount(2))} cadascú si sou dos.`,
      `**2. Els teus ingressos**: es descompta només el que passi de ${E(h.free)} l'any (el 35 % de la pensió).`,
      "**3. Els de la unitat**: si vius amb persones que no la cobren i els ingressos de tots més la pensió passen del límit, la pensió baixa el que se'n passi.",
      `**4. El mínim**: mai menys de ${Y(h.minAnnual)} (${M(h.minMonthly)}).`,
      `**5. El complement**: amb la d'incapacitat, un ${P(h.disabilityThird)} i necessitat d'una altra persona, s'hi sumen ${Y(h.thirdAnnual)}.`,
    ],
    en: [
      `**1. The starting point**: ${E(PNC_ANNUAL)} a year. With more than one beneficiary in the unit, 70% is added for each extra one and the total is shared: ${Y(individualAmount(2))} each for two.`,
      `**2. Your income**: only what is above ${E(h.free)} a year (35% of the pension) is deducted.`,
      "**3. The unit's income**: if you live with people who do not get it and everyone's income plus the pension exceeds the limit, the pension drops by the excess.",
      `**4. The floor**: never under ${Y(h.minAnnual)} (${M(h.minMonthly)}).`,
      `**5. The top-up**: with the invalidity pension, a ${P(h.disabilityThird)} disability and the need for another person, ${Y(h.thirdAnnual)} is added.`,
    ],
  });

  /* Work ---------------------------------------------------------------------- */
  const workCols = L(locale, { es: ["Ingresos del trabajo al año", "Pensión al año", "Qué pasa"], ca: ["Ingressos de la feina l'any", "Pensió l'any", "Què passa"], en: ["Earnings a year", "Pension a year", "What happens"] });
  const workRows = workExamples().map((w) => [
    E(w.work),
    E(w.pension),
    w.suspended
      ? L(locale, { es: "Se suspende; vuelve al dejar el trabajo", ca: "Se suspèn; torna en deixar la feina", en: "Suspended; it returns when the job ends" })
      : w.cut > 0
        ? L(locale, { es: `Baja ${E(w.cut)}`, ca: `Baixa ${E(w.cut)}`, en: `Cut by ${E(w.cut)}` })
        : L(locale, { es: "Entera", ca: "Sencera", en: "In full" }),
  ]);
  const workText = L(locale, {
    es: `Si ya cobras la de incapacidad y empiezas a trabajar, durante ${h.workYears} años pensión más sueldo pueden llegar a ${Y(h.workLimit)}: el IPREM de ${IPREM_YEAR} sin pagas extra (${E(IPREM_12)}) más la pensión. Si pasas, la pensión baja lo necesario (el complemento de tercera persona no). Pasados los ${h.workYears} años, si sigues trabajando, se suspende (guía del Imserso). Cuando se acaba el contrato o la actividad, la pensión vuelve sin contar lo ganado ese año. La de jubilación no tiene esta regla.`,
    ca: `Si ja cobres la d'incapacitat i comences a treballar, durant ${h.workYears} anys pensió més sou poden arribar a ${Y(h.workLimit)}: l'IPREM del ${IPREM_YEAR} sense pagues extra (${E(IPREM_12)}) més la pensió. Si en passes, la pensió baixa el necessari (el complement de tercera persona no). Passats els ${h.workYears} anys, si continues treballant, se suspèn (guia de l'Imserso). Quan s'acaba el contracte o l'activitat, la pensió torna sense comptar el que s'ha guanyat aquell any. La de jubilació no té aquesta regla.`,
    en: `If you already get the invalidity pension and start work, for ${h.workYears} years pension plus earnings can reach ${Y(h.workLimit)}: the ${IPREM_YEAR} IPREM without extra payments (${E(IPREM_12)}) plus the pension. Above that, the pension is cut as needed (not the third-person top-up). After the ${h.workYears} years, if you keep working, it is suspended (IMSERSO's guide). When the contract or activity ends, the pension returns without counting that year's earnings. The retirement pension has no such rule.`,
  });

  /* Rent ------------------------------------------------------------------------ */
  const rentItems = L(locale, {
    es: [
      "Tener reconocida la pensión no contributiva (de jubilación o de incapacidad) al pedirlo y al resolverse.",
      "No tener ninguna vivienda en propiedad y ser el titular del contrato de alquiler.",
      "Que el casero no sea tu cónyuge o pareja ni pariente hasta tercer grado (por sangre, matrimonio o adopción).",
      `Que sea tu domicilio habitual: contrato de un año o más y ${RENT_RESIDED_DAYS} días viviendo allí antes de pedirlo.`,
      "Si en el piso viven varios pensionistas no contributivos, solo lo cobra el titular del contrato, o el primero que figure.",
    ],
    ca: [
      "Tenir reconeguda la pensió no contributiva (de jubilació o d'incapacitat) en demanar-lo i en resoldre's.",
      "No tenir cap habitatge en propietat i ser el titular del contracte de lloguer.",
      "Que el propietari no sigui el teu cònjuge o parella ni parent fins a tercer grau (per sang, matrimoni o adopció).",
      `Que sigui el teu domicili habitual: contracte d'un any o més i ${RENT_RESIDED_DAYS} dies vivint-hi abans de demanar-lo.`,
      "Si al pis hi viuen diversos pensionistes no contributius, només el cobra el titular del contracte, o el primer que hi consti.",
    ],
    en: [
      "Holding the non-contributory pension (retirement or invalidity) when applying and when it is decided.",
      "Owning no home and holding the lease.",
      "A landlord who is not your spouse or partner nor a relative up to the third degree (by blood, marriage or adoption).",
      `It must be your usual home: a lease of a year or more and ${RENT_RESIDED_DAYS} days living there before applying.`,
      "If several non-contributory pensioners share the flat, only the leaseholder gets it, or the first one named.",
    ],
  });
  const rentText = L(locale, {
    es: `Son ${E(h.rent)} al año, en un solo pago, y no cuentan como ingreso para mantener la pensión. Se pide aparte, a la misma administración que paga la pensión; en Cataluña, cada año, del 1 de enero al 31 de diciembre.`,
    ca: `Són ${E(h.rent)} l'any, en un sol pagament, i no compten com a ingrés per mantenir la pensió. Es demana a part, a la mateixa administració que paga la pensió; a Catalunya, cada any, de l'1 de gener al 31 de desembre.`,
    en: `It is ${E(h.rent)} a year, in a single payment, and does not count as income for keeping the pension. It is applied for separately, to the same administration that pays the pension; in Catalonia, every year, from 1 January to 31 December.`,
  });

  /* Catalonia --------------------------------------------------------------------- */
  const catText = L(locale, {
    es: [
      "Las pensiones no contributivas son de la Seguridad Social, pero las reconocen y pagan las comunidades autónomas. **En Cataluña, el Departament de Drets Socials i Inclusió (Direcció General de Prestacions Socials)**: se piden por internet con certificado digital o idCAT Mòbil, en una oficina de atención ciudadana con cita previa (también en el 012) o por videollamada.",
      `La Generalitat responde en un máximo de ${GENCAT_ANSWER_DAYS} días; si no contesta, la solicitud se entiende denegada y se puede presentar una reclamación previa. Sus fichas se actualizaron ${on(GENCAT_UPDATED)}.`,
      "**Solo en Cataluña** existe además una prestación complementaria para quien cobra la no contributiva y no puede trabajar, con su propio límite de ingresos. No la calculamos: mira la ficha de la Generalitat.",
    ],
    ca: [
      "Les pensions no contributives són de la Seguretat Social, però les reconeixen i paguen les comunitats autònomes. **A Catalunya, el Departament de Drets Socials i Inclusió (Direcció General de Prestacions Socials)**: es demanen per internet amb certificat digital o idCAT Mòbil, en una oficina d'atenció ciutadana amb cita prèvia (també al 012) o per videotrucada.",
      `La Generalitat respon en un màxim de ${GENCAT_ANSWER_DAYS} dies; si no contesta, la sol·licitud s'entén denegada i es pot presentar una reclamació prèvia. Les seves fitxes es van actualitzar ${on(GENCAT_UPDATED)}.`,
      "**Només a Catalunya** hi ha a més una prestació complementària per a qui cobra la no contributiva i no pot treballar, amb el seu propi límit d'ingressos. No la calculem: mira la fitxa de la Generalitat.",
    ],
    en: [
      "Non-contributory pensions belong to Social Security, but the regions grant and pay them. **In Catalonia, the Departament de Drets Socials i Inclusió (Direcció General de Prestacions Socials)**: apply online with a digital certificate or idCAT Mòbil, at a citizen service office by appointment (also on 012) or by video call.",
      `The Generalitat answers within ${GENCAT_ANSWER_DAYS} days at most; with no answer, the application counts as refused and a prior claim (reclamació prèvia) can be filed. Its pages were updated ${on(GENCAT_UPDATED)}.`,
      "**Only in Catalonia** there is also a complementary benefit for non-contributory pensioners who cannot work, with its own income limit. We do not compute it: see the Generalitat's page.",
    ],
  });

  /* Apply -------------------------------------------------------------------------- */
  const applyItems = L(locale, {
    es: [
      "**Desde cuándo**: desde el día 1 del mes siguiente a la solicitud, así que conviene no retrasarla.",
      `**Qué hay que comunicar**: cualquier cambio de convivencia, estado civil, residencia o ingresos, en ${CHANGE_DAYS} días; y cada año, en el primer trimestre, la declaración de ingresos de la unidad del año anterior.`,
      "**Incompatibilidades**: la de jubilación y la de incapacidad no se cobran a la vez, ni con las antiguas pensiones asistenciales (FAS), los subsidios de la LISMI ni la asignación por hijo a cargo mayor de 18 años con discapacidad de la que seas causante.",
    ],
    ca: [
      "**Des de quan**: des del dia 1 del mes següent a la sol·licitud, així que convé no endarrerir-la.",
      `**Què cal comunicar**: qualsevol canvi de convivència, estat civil, residència o ingressos, en ${CHANGE_DAYS} dies; i cada any, el primer trimestre, la declaració d'ingressos de la unitat de l'any anterior.`,
      "**Incompatibilitats**: la de jubilació i la d'incapacitat no es cobren alhora, ni amb les antigues pensions assistencials (FAS), els subsidis de la LISMI ni l'assignació per fill a càrrec major de 18 anys amb discapacitat de la qual siguis causant.",
    ],
    en: [
      "**From when**: from the 1st of the month after the application, so it pays not to delay it.",
      `**What to report**: any change in who you live with, marital status, residence or income, within ${CHANGE_DAYS} days; and every year, in the first quarter, the unit's income declaration for the year before.`,
      "**Incompatibilities**: the retirement and invalidity pensions cannot be drawn together, nor with the old welfare pensions (FAS), the LISMI allowances or the child benefit for a disabled child over 18 paid on your account.",
    ],
  });

  /* Examples, links, sources, limits ------------------------------------------------ */
  const exCols = L(locale, { es: ["Caso", "¿Derecho?", "Cuánto"], ca: ["Cas", "Dret?", "Quant"], en: ["Case", "Entitled?", "How much"] });
  const exNote = L(locale, {
    es: "Calculado con las reglas de esta página y las cuantías de 2026; los otros beneficiarios, sin ingresos propios por encima del 35 %.",
    ca: "Calculat amb les regles d'aquesta pàgina i les quanties del 2026; els altres beneficiaris, sense ingressos propis per sobre del 35 %.",
    en: "Worked out with this page's rules and the 2026 amounts; other beneficiaries with no own income above 35%.",
  });
  const links = L(locale, {
    es: { pension: "Subida de las pensiones 2027 (y las no contributivas)", widow: "Pensión de viudedad: requisitos y cuánto se cobra", iprem: `IPREM ${IPREM_YEAR}: cifras oficiales y para qué sirve`, imv: "Ingreso mínimo vital: la renta garantizada, igual a la no contributiva", retire: "¿A qué edad me puedo jubilar?" },
    ca: { pension: "Pujada de les pensions 2027 (i les no contributives)", widow: "Pensió de viduïtat: requisits i quant es cobra", iprem: `IPREM ${IPREM_YEAR}: xifres oficials i per a què serveix`, imv: "Ingrés mínim vital: la renda garantida, igual a la no contributiva", retire: "A quina edat em puc jubilar?" },
    en: { pension: "Pension increase 2027 (non-contributory pensions too)", widow: "Spain widow's pension: requirements and amount", iprem: `IPREM ${IPREM_YEAR}: the official figures and what it is for`, imv: "Minimum living income (IMV): its guaranteed income matches the non-contributory pension", retire: "When can I retire in Spain?" },
  });
  const sourcesLead = L(locale, {
    es: "Cada cifra y cada regla sale de estos textos oficiales, leídos y citados el día indicado:",
    ca: "Cada xifra i cada regla surt d'aquests textos oficials, llegits i citats el dia indicat:",
    en: "Every figure and rule comes from these official texts, read and quoted on the day shown:",
  });
  const limits = L(locale, {
    es: [
      "No valora la discapacidad ni la necesidad de otra persona (lo hace el equipo de valoración con el baremo oficial): pon el grado reconocido.",
      "No calcula cómo se imputan los ingresos de cada bien (lo regula la Orden PRE/3113/2009): pon el total bruto anual.",
      "Lectura: los otros beneficiarios de la unidad se toman con la cuantía entera (sin ingresos propios por encima del 35 %); si tienen más, su pensión baja y la tuya puede salir algo más alta. Sus pensiones no contributivas no se suman como ingresos de la unidad, porque la ley las suma aparte (art. 364.3).",
      "Lectura: si en la unidad todos cobran la pensión, no hay recorte por convivencia (el art. 364.3 habla de convivencia con personas no beneficiarias).",
      "Lectura: con el complemento de tercera persona usamos los límites del Imserso (pensión + 50 %) para el requisito y el recorte, y sumamos el complemento al final, como dice su guía; la ley no detalla el recorte.",
      "Conflicto: el Real Decreto 357/1991 (art. 14.2, redacción de 1991) descuenta todos los ingresos propios; la Ley General de la Seguridad Social (art. 364.2), solo lo que pasa del 35 %. Manda la ley, y es lo que aplica el Imserso.",
      "La ley habla de matrimonio: no sabemos cómo cuenta cada comunidad a una pareja de hecho. Pregúntalo al pedirla.",
      "No calcula la prestación complementaria catalana, el ingreso mínimo vital ni las pensiones de otros países.",
    ],
    ca: [
      "No valora la discapacitat ni la necessitat d'una altra persona (ho fa l'equip de valoració amb el barem oficial): posa el grau reconegut.",
      "No calcula com s'imputen els ingressos de cada bé (ho regula l'Ordre PRE/3113/2009): posa el total brut anual.",
      "Lectura: els altres beneficiaris de la unitat es prenen amb la quantia sencera (sense ingressos propis per sobre del 35 %); si en tenen més, la seva pensió baixa i la teva pot sortir una mica més alta. Les seves pensions no contributives no se sumen com a ingressos de la unitat, perquè la llei les suma a part (art. 364.3).",
      "Lectura: si a la unitat tothom cobra la pensió, no hi ha retallada per convivència (l'art. 364.3 parla de convivència amb persones no beneficiàries).",
      "Lectura: amb el complement de tercera persona fem servir els límits de l'Imserso (pensió + 50 %) per al requisit i la retallada, i sumem el complement al final, com diu la seva guia; la llei no detalla la retallada.",
      "Conflicte: el Reial decret 357/1991 (art. 14.2, redacció del 1991) descompta tots els ingressos propis; la Llei general de la Seguretat Social (art. 364.2), només el que passa del 35 %. Mana la llei, i és el que aplica l'Imserso.",
      "La llei parla de matrimoni: no sabem com compta cada comunitat una parella de fet. Pregunta-ho en demanar-la.",
      "No calcula la prestació complementària catalana, l'ingrés mínim vital ni les pensions d'altres països.",
    ],
    en: [
      "It does not assess disability or the need for another person (an assessment team does, with the official scale): enter the recognised degree.",
      "It does not work out how each asset's income is imputed (Orden PRE/3113/2009 does): enter the gross yearly total.",
      "Reading: other beneficiaries in the unit are taken at the full share (no own income above 35%); if they have more, their pension drops and yours may come out slightly higher. Their non-contributory pensions are not added as unit income, because the law adds them separately (art. 364.3).",
      "Reading: if everyone in the unit draws the pension, there is no household cut (art. 364.3 speaks of living with people who are not beneficiaries).",
      "Reading: with the third-person top-up we use IMSERSO's limits (pension + 50%) for the test and the cut, adding the top-up last, as its guide says; the law does not spell out the cut.",
      "Conflict: Royal Decree 357/1991 (art. 14.2, 1991 wording) deducts all own income; the General Social Security Act (art. 364.2) only what is above 35%. The law prevails, and IMSERSO applies it.",
      "The law speaks of marriage: we do not know how each region counts an unmarried partner. Ask when you apply.",
      "It does not compute the Catalan complementary benefit, the minimum living income (IMV) or foreign pensions.",
    ],
  });

  const appSchema = {
    "@type": "WebApplication",
    name: meta.appName,
    url: absoluteUrl(ncPath(locale)),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    inLanguage: locale,
    isAccessibleForFree: true,
    publisher: { "@id": ORGANIZATION_ID },
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description: meta.description,
  };
  const faqSchema = {
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  const table = (cols: readonly string[], rows: readonly (readonly ReactNode[])[], caption?: string) => (
    <div className="ci-table-scroll mt-4">
      <table className="ci-local-table ci-stack-table">
        {caption ? <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{caption}</caption> : null}
        <thead>
          <tr>
            {cols.map((c, i) => (
              <th key={i} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              <th scope="row" className="font-normal">
                {row[0]}
              </th>
              {row.slice(1).map((c, i) => (
                <td key={i} data-label={cols[i + 1]}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  const bullets = (items: readonly string[]) => (
    <ul>
      {items.map((i) => (
        <li key={i}>{md(i)}</li>
      ))}
    </ul>
  );

  return (
    <>
      <SiteHeader locale={locale} translations={ncEditions()} />
      <main id="main">
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={crumbs} locale={locale} />
              <h1 className="ci-measure">{meta.h1}</h1>
              <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{lead}</p>
              <p className="ci-measure mt-2 text-sm text-[var(--color-muted)]">{fresh}</p>
            </div>
          </header>

          <div className="ci-shell py-10">
            <div className="ci-prose">
              <NcPensionCalculator locale={locale} initial={DEFAULT_INPUT} asOf={RULES_AS_OF} />
              <p className="text-sm text-[var(--color-muted)]">
                {disclaimer} <A href={OFFICIAL_PROCEDURE.catRetirement}>{procedureLinks.ret}</A> · <A href={OFFICIAL_PROCEDURE.catInvalidity}>{procedureLinks.inv}</A>.
              </p>
              <CalculatorNextStep current="non-contributory-pension" locale={locale} />

              <AdSlot kind="top" locale={locale} path={crumbPath(crumbs)} />
              <h2 id="cuantia">{hd.amounts}</h2>
              {table(
                amountCols,
                amountRows.map(([label, annual]) => [label, <strong key="m">{M(monthly(annual))}</strong>, Y(annual)]),
                amountCaption,
              )}
              {[...amountText, pensionRevaluationLine(locale, "non-contributory")].map((p) => (
                <p key={p}>{md(p)}</p>
              ))}
              <Quote text={QUOTE.rdl3} href={SOURCES.rdl3.url} label={L(locale, { es: "Real Decreto-ley 3/2026, art. 2.5", ca: "Reial decret llei 3/2026, art. 2.5", en: "Royal Decree-law 3/2026, art. 2.5" })} />
              <Quote text={QUOTE.rd241pnc} href={SOURCES.rd241.url} label={rd("241/2026", "art. 21.1")} />
              <Quote text={QUOTE.rd357pay} href={SOURCES.rd357.url} label={rd("357/1991", "art. 14.1")} />
              <Quote text={QUOTE.imsersoPay} href={SOURCES.imsersoUpdate.url} label={imserso(L(locale, { es: "actualización de las pensiones para 2026", ca: "actualització de les pensions per al 2026", en: "2026 pension update" }))} />
              <Quote text={QUOTE.gencatAmount} href={SOURCES.gencatJub.url} label={gencat(L(locale, { es: "pensión no contributiva por jubilación", ca: "pensió no contributiva per jubilació", en: "non-contributory retirement pension" }))} lang="ca" />
              <Quote text={`${QUOTE.art364_1} ${QUOTE.art364_4}`} href={LGSS_ANCHOR.art364} label={lgss(L(locale, { es: "art. 364.1 y 364.4", ca: "art. 364.1 i 364.4", en: "art. 364.1 and 364.4" }))} />
              <Quote text={QUOTE.art364_6} href={LGSS_ANCHOR.art364} label={lgss("art. 364.6")} />
              <p>
                <Link href={pensionPath(locale)}>{links.pension}</Link>
              </p>

              <h2 id="requisitos">{hd.req}</h2>
              {table(reqCols, reqRows)}
              {bullets(reqText)}
              <Quote text={QUOTE.art369} href={LGSS_ANCHOR.art369} label={lgss("art. 369.1")} />
              <Quote text={`${QUOTE.art363a} ${QUOTE.art363b} ${QUOTE.art363c} ${QUOTE.art363d}`} href={LGSS_ANCHOR.art363} label={lgss("art. 363.1")} />
              <Quote text={QUOTE.rd357abs} href={SOURCES.rd357.url} label={rd("357/1991", "art. 10.2")} />
              <Quote text={QUOTE.art367_3} href={LGSS_ANCHOR.art367} label={lgss("art. 367.3")} />
              <Quote text={QUOTE.imsersoPresumption} href={SOURCES.imsersoGuide.url} label={imserso(L(locale, { es: "guía resumen de las PNC 2026", ca: "guia resum de les PNC 2026", en: "2026 PNC summary guide" }))} />
              <Quote text={QUOTE.art363compensation} href={LGSS_ANCHOR.art363} label={lgss(L(locale, { es: "art. 363.1.d (Ley 4/2026, desde el 23/10/2026)", ca: "art. 363.1.d (Llei 4/2026, des del 23/10/2026)", en: "art. 363.1.d (Law 4/2026, from 23/10/2026)" }))} />

              <h2 id="unidad-economica">{hd.unit}</h2>
              {bullets(unitText)}
              {table(
                unitCols,
                unitRows,
                L(locale, { es: `Límites de ingresos de la unidad económica, ${AMOUNTS_YEAR} (al año)`, ca: `Límits d'ingressos de la unitat econòmica, ${AMOUNTS_YEAR} (l'any)`, en: `Household unit income limits, ${AMOUNTS_YEAR} (a year)` }),
              )}
              {table(unitCols, thirdRows, thirdCaption)}
              <Quote text={QUOTE.art363household} href={LGSS_ANCHOR.art363} label={lgss("art. 363.1.d")} />
              <Quote text={`${QUOTE.art363_2} ${QUOTE.art363_3} ${QUOTE.art363_4}`} href={LGSS_ANCHOR.art363} label={lgss("art. 363.2 a 363.4")} />
              <Quote text={QUOTE.imsersoOutside} href={SOURCES.imsersoJub.url} label={imserso(L(locale, { es: "normativa y requisitos", ca: "normativa i requisits", en: "rules and requirements" }))} />
              <Quote text={`${QUOTE.art363_5} ${QUOTE.art363_5home}`} href={LGSS_ANCHOR.art363} label={lgss("art. 363.5")} />
              <Quote text={QUOTE.imsersoThirdLimits} href={SOURCES.imsersoGuide.url} label={imserso(L(locale, { es: "guía resumen de las PNC 2026", ca: "guia resum de les PNC 2026", en: "2026 PNC summary guide" }))} />

              <h2 id="calculo">{hd.calc}</h2>
              {calcSteps.map((p) => (
                <p key={p}>{md(p)}</p>
              ))}
              <Quote text={`${QUOTE.art364_1a} ${QUOTE.art364_1b}`} href={LGSS_ANCHOR.art364} label={lgss("art. 364.1")} />
              <Quote text={QUOTE.art364_2} href={LGSS_ANCHOR.art364} label={lgss("art. 364.2")} />
              <Quote text={QUOTE.imsersoFree} href={SOURCES.imsersoGuide.url} label={imserso(L(locale, { es: "guía resumen de las PNC 2026", ca: "guia resum de les PNC 2026", en: "2026 PNC summary guide" }))} />
              <Quote text={QUOTE.art364_3} href={LGSS_ANCHOR.art364} label={lgss("art. 364.3")} />
              <Quote text={QUOTE.imsersoAfter} href={SOURCES.imsersoGuide.url} label={imserso(L(locale, { es: "guía resumen de las PNC 2026", ca: "guia resum de les PNC 2026", en: "2026 PNC summary guide" }))} />
              <Quote text={QUOTE.art370} href={LGSS_ANCHOR.art370} label={lgss("art. 370")} />

              <h2 id="trabajo">{hd.work}</h2>
              <p>{workText}</p>
              {table(workCols, workRows, L(locale, { es: `Con la pensión entera (${E(PNC_ANNUAL)}) y el límite de ${E(h.workLimit)}`, ca: `Amb la pensió sencera (${E(PNC_ANNUAL)}) i el límit de ${E(h.workLimit)}`, en: `With the full pension (${E(PNC_ANNUAL)}) and the ${E(h.workLimit)} limit` }))}
              <Quote text={QUOTE.art366} href={LGSS_ANCHOR.art366} label={lgss("art. 366")} />
              <Quote text={`${QUOTE.art363recover}…`} href={LGSS_ANCHOR.art363} label={lgss("art. 363.1.d")} />
              <p>
                <Link href={ipremPath(locale)}>{links.iprem}</Link>
              </p>
              <p>{mdLinks(bonoSocialLimitLine(locale, "non-contributory"))}</p>

              <h2 id="alquiler">{hd.rent}</h2>
              <p>{rentText}</p>
              <ul>
                {rentItems.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
              <Quote text={QUOTE.rd241rent} href={SOURCES.rd241.url} label={rd("241/2026", "art. 21.2")} />
              <Quote text={`${QUOTE.rd1191b} ${QUOTE.rd1191c} ${QUOTE.rd1191d} ${QUOTE.rd1191e}`} href={SOURCES.rd1191.url} label={rd("1191/2012", "art. 2.1")} />
              <Quote text={QUOTE.rd1191income} href={SOURCES.rd1191.url} label={rd("1191/2012", L(locale, { es: "disposición adicional única", ca: "disposició addicional única", en: "sole additional provision" }))} />
              <Quote text={`${QUOTE.gencatRent} ${QUOTE.gencatRentWhen}`} href={SOURCES.gencatRent.url} label={gencat(L(locale, { es: "complemento de alquiler", ca: "complement de lloguer", en: "rent supplement" }))} lang="ca" />
              <p>
                <A href={OFFICIAL_PROCEDURE.catRent}>{procedureLinks.rent}</A> · <A href={SOURCES.imsersoRent.url}>{imserso(L(locale, { es: "complemento de alquiler", ca: "complement de lloguer (en castellà)", en: "rent supplement (in Spanish)" }))}</A>
              </p>

              <h2 id="cataluna">{hd.cat}</h2>
              {catText.map((p) => (
                <p key={p}>{md(p)}</p>
              ))}
              <Quote text={QUOTE.imsersoManaged} href={SOURCES.imsersoWhere.url} label={imserso(L(locale, { es: "dónde solicitar una PNC", ca: "on sol·licitar una PNC", en: "where to apply for a PNC" }))} />
              <Quote text={QUOTE.gencatAnswer} href={SOURCES.gencatJub.url} label={gencat(L(locale, { es: "pensión no contributiva por jubilación", ca: "pensió no contributiva per jubilació", en: "non-contributory retirement pension" }))} lang="ca" />
              <Quote text={`${QUOTE.gencatComplement} ${QUOTE.gencatComplementAmount}`} href={SOURCES.gencatComplement.url} label={gencat(L(locale, { es: "prestación complementaria de la PNC", ca: "prestació complementària de la PNC", en: "PNC complementary benefit" }))} lang="ca" />
              <ul>
                <li>
                  <A href={OFFICIAL_PROCEDURE.catRetirement}>{procedureLinks.ret}</A>
                </li>
                <li>
                  <A href={OFFICIAL_PROCEDURE.catInvalidity}>{procedureLinks.inv}</A>
                </li>
                <li>
                  <A href={OFFICIAL_PROCEDURE.catRent}>{procedureLinks.rent}</A>
                </li>
                <li>
                  <A href={OFFICIAL_PROCEDURE.catInfo}>{procedureLinks.info}</A>
                </li>
                <li>
                  <A href={OFFICIAL_PROCEDURE.where}>{procedureLinks.where}</A>
                </li>
              </ul>

              <h2 id="solicitud">{hd.apply}</h2>
              {bullets(applyItems)}
              <Quote text={`${QUOTE.art371} ${QUOTE.art365}`} href={LGSS_ANCHOR.art371} label={lgss(L(locale, { es: "arts. 371 y 365", ca: "arts. 371 i 365", en: "arts. 371 and 365" }))} />
              <Quote text={`${QUOTE.art368} ${QUOTE.art368b}`} href={LGSS_ANCHOR.art368} label={lgss(L(locale, { es: "art. 368 (y 372 para la de jubilación)", ca: "art. 368 (i 372 per a la de jubilació)", en: "art. 368 (and 372 for retirement)" }))} />
              <Quote text={QUOTE.gencatChanges} href={SOURCES.gencatJub.url} label={gencat(L(locale, { es: "obligaciones", ca: "obligacions", en: "obligations" }))} lang="ca" />
              <Quote text={`${QUOTE.imsersoIncompatible}…`} href={SOURCES.imsersoLeaflet.url} label={imserso(L(locale, { es: "folleto de las PNC 2026", ca: "fullet de les PNC 2026", en: "2026 PNC leaflet" }))} />
              <p>
                <Link href={`${subsidyPath(locale)}#ingreso-minimo-vital`}>{links.imv}</Link>
              </p>

              <h2 id="ejemplos">{hd.examples}</h2>
              {table(
                exCols,
                examples().map(({ id, result }) => [exampleLabel(id, locale), accessCell(result, locale), amountCell(result, locale)]),
              )}
              <p className="text-sm">{exNote}</p>

              <h2 id="preguntas">{hd.faq}</h2>
              {faq.map((f) => (
                <section key={f.q}>
                  <h3>{f.q}</h3>
                  <p>{f.a}</p>
                </section>
              ))}

              <h2 id="fuentes">{hd.sources}</h2>
              <p>{sourcesLead}</p>
              <ul>
                {Object.values(SOURCES).map((src) => (
                  <li key={src.url}>
                    <A href={src.url}>{src.name}</A> ({src.publisher}, {src.ref}; {L(locale, { es: "leído", ca: "llegit", en: "read" })} {on(src.read)})
                  </li>
                ))}
              </ul>
              <SourcesPolicyLink locale={locale} />

              <h2 id="limites">{hd.limits}</h2>
              <ul>
                {limits.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              <Quote text={QUOTE.rd357old} href={SOURCES.rd357.url} label={rd("357/1991", L(locale, { es: "art. 14.2 (redacción de 1991)", ca: "art. 14.2 (redacció del 1991)", en: "art. 14.2 (1991 wording)" }))} />
              <ul>
                <li>
                  <Link href={calcPath("widow-pension", locale)}>{links.widow}</Link>
                </li>
                <li>
                  <Link href={pensionPath(locale)}>{links.pension}</Link>
                </li>
                <li>
                  <Link href={ipremPath(locale)}>{links.iprem}</Link>
                </li>
                <li>
                  <Link href={`${subsidyPath(locale)}#ingreso-minimo-vital`}>{links.imv}</Link>
                </li>
                <li>
                  <Link href={calcPath("retirement-age", locale)}>{links.retire}</Link>
                </li>
              </ul>
              <p className="text-sm text-[var(--color-muted)]">
                {disclaimer} <A href={OFFICIAL_PROCEDURE.catRetirement}>{procedureLinks.ret}</A> · <A href={OFFICIAL_PROCEDURE.catInvalidity}>{procedureLinks.inv}</A> · <A href={OFFICIAL_PROCEDURE.where}>{procedureLinks.where}</A>.
              </p>

              <MoreCalculators current="non-contributory-pension" locale={locale} />
            </div>
            <ShareBar locale={locale} path={ncPath(locale)} title={meta.h1} contentType="non_contributory_pension_calculator" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), appSchema, faqSchema])} />
      <SiteFooter locale={locale} />
    </>
  );
}
