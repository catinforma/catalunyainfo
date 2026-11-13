import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { MoreCalculators } from "@/components/programmatic/calculators/MoreCalculators";
import { ShareBar } from "@/components/share/ShareBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getMessages } from "@/lib/i18n";
import { calcPath } from "@/lib/programmatic/calculators/paths";
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import { dayMonthYear } from "@/lib/programmatic/holidays/format";
import { leavePath } from "@/lib/programmatic/leave-2027/copy";
import { DEFAULT_PLACE, DISCLAIMER, calendarOf, fullDate, paidLeaveEditions, paidLeavePath, type PlLocale, type PlPlace } from "@/lib/programmatic/paid-leave/copy";
import { DEFAULT_INPUT, birthPlan, shortLeave, type BirthPlan, type PaidLeaveInput, type ShortLeaveResult } from "@/lib/programmatic/paid-leave/engine";
import { paidLeavePlaces } from "@/lib/programmatic/paid-leave/places";
import { BIRTH, FORCE_MAJEURE_DAYS_PER_YEAR, NURSING, PARENTAL, QUOTE, RULES_AS_OF, SHORT_RULES, SOURCES, UNREACHABLE_WORK_DAYS } from "@/lib/programmatic/paid-leave/rules";
import { absoluteUrl } from "@/lib/site";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { PaidLeaveCalculator } from "./PaidLeaveCalculator";

/**
 * "Permisos laborales 2026" / "Permisos laborals 2026" / "Spain paid leave
 * 2026": the legal minimums of the Estatuto de los Trabajadores (arts. 37.3,
 * 37.4, 37.9, 38, 48.4 and 48 bis) in one table with who pays each, the
 * calculator (server-rendered with the default example), then natural or
 * working days, birth leave, parental leave, holidays, force majeure,
 * collective agreements, questions, sources and limits. Every figure comes
 * from rules.ts through the engine.
 */

const L = <T,>(locale: PlLocale, v: Record<PlLocale, T>): T => v[locale];

export const PL_META: Record<PlLocale, { title: string; description: string; h1: string; breadcrumb: string; appName: string }> = {
  es: {
    title: "Permisos laborales 2026: días que te corresponden",
    description: "Permisos retribuidos según el Estatuto: 15 días por boda, 5 por hospitalización, 2 o 4 por fallecimiento, 19 semanas por nacimiento. Calcula qué día terminan.",
    h1: "Permisos laborales 2026: los días que te corresponden por ley",
    breadcrumb: "Permisos laborales",
    appName: "Calculadora de permisos laborales (Estatuto de los Trabajadores)",
  },
  ca: {
    title: "Permisos laborals 2026: dies que et corresponen",
    description: "Permisos retribuïts segons l'Estatut: 15 dies per casament, 5 per hospitalització, 2 o 4 per defunció, 19 setmanes per naixement. Calcula quin dia acaben.",
    h1: "Permisos laborals 2026: els dies que et corresponen per llei",
    breadcrumb: "Permisos laborals",
    appName: "Calculadora de permisos laborals (Estatut dels treballadors)",
  },
  en: {
    title: "Spain paid leave 2026: the days you are entitled to",
    description: "Paid leave under Spain's Workers' Statute: 15 days to marry, 5 for a relative in hospital, 2 or 4 for a death, 19 weeks for a birth. Find the last day.",
    h1: "Spain paid leave 2026: the days the law gives you",
    breadcrumb: "Paid leave",
    appName: "Spain paid leave calculator (Workers' Statute)",
  },
};

export function paidLeaveCrumbs(locale: PlLocale): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    hubCrumb(locale),
    { label: PL_META[locale].breadcrumb, href: paidLeavePath(locale) },
  ];
}

export function paidLeaveMetadata(locale: PlLocale): Metadata {
  const m = PL_META[locale];
  return buildMetadata({ locale, path: paidLeavePath(locale), title: m.title, description: m.description, translations: paidLeaveEditions() });
}

/** The default input of the calculator for an edition. */
export function defaultInput(locale: PlLocale): PaidLeaveInput {
  return { ...DEFAULT_INPUT, place: DEFAULT_PLACE[locale] };
}

/** For the page and the tests: the default example (5 days from 3 Dec 2026) and the birth example (born 3 Dec 2026). */
export function defaultExamples(locale: PlLocale, places: readonly PlPlace[] = paidLeavePlaces(locale)): { short: ShortLeaveResult; birth: BirthPlan } {
  const i = defaultInput(locale);
  return { short: shortLeave("illness", i.start, false, calendarOf(places, i.place)), birth: birthPlan(i.birth, false) };
}

interface Row {
  what: string;
  time: string;
  count: string;
  payer: string;
  article: string;
}

function rows(locale: PlLocale): Row[] {
  const R = SHORT_RULES;
  const es: Row[] = [
    { what: "Matrimonio o registro de pareja de hecho", time: `${R.marriage.days} días naturales`, count: "Naturales (lo dice el Estatuto)", payer: "Empresa", article: "37.3.a" },
    { what: "Accidente o enfermedad grave, hospitalización o intervención sin hospitalización con reposo en casa del cónyuge, pareja de hecho, familiares hasta 2.º grado o quien conviva contigo y necesite tu cuidado", time: `${R.illness.days} días`, count: "«Días», sin precisar", payer: "Empresa", article: "37.3.b" },
    { what: "Fallecimiento del cónyuge, pareja de hecho o familiares hasta 2.º grado", time: `${R.death.days} días; ${R.death.days + R.death.travelExtra} si necesitas desplazarte`, count: "«Días», sin precisar", payer: "Empresa", article: "37.3.b bis" },
    { what: "Traslado del domicilio habitual (mudanza)", time: `${R.move.days} día`, count: "«Día», sin precisar", payer: "Empresa", article: "37.3.c" },
    { what: "Deber inexcusable de carácter público y personal, incluido votar", time: "El tiempo indispensable", count: "—", payer: "Empresa (descontando la indemnización que cobres por ese deber)", article: "37.3.d" },
    { what: "Exámenes prenatales y preparación al parto; sesiones e informes previos a una adopción o acogimiento", time: "El tiempo indispensable, si es en horario de trabajo", count: "—", payer: "Empresa", article: "37.3.f" },
    { what: "No poder llegar al trabajo por restricciones de las autoridades, riesgo grave e inminente, catástrofe o fenómeno meteorológico adverso", time: `Hasta ${UNREACHABLE_WORK_DAYS} días, y después mientras dure`, count: "—", payer: "Empresa", article: "37.3.g" },
    { what: "Actos preparatorios de la donación de órganos o tejidos", time: "El tiempo indispensable, si es en horario de trabajo", count: "—", payer: "Empresa", article: "37.3 (2.ª letra g)" },
    { what: "Fuerza mayor: motivo familiar urgente por enfermedad o accidente que exige tu presencia inmediata", time: `Horas equivalentes a ${FORCE_MAJEURE_DAYS_PER_YEAR} días al año, retribuidas`, count: "Por horas", payer: "Empresa", article: "37.9" },
    { what: "Lactancia", time: `${NURSING.hoursPerDay} hora al día hasta los ${NURSING.untilMonths} meses (o media hora menos de jornada, o acumulada en jornadas completas)`, count: "Por horas", payer: `Empresa (el Estatuto solo prevé reducir el sueldo de los ${NURSING.untilMonths} a los ${NURSING.sharedUntilMonths} meses, si los dos progenitores la ejercen igual; entonces paga la Seguridad Social)`, article: "37.4" },
    { what: "Vacaciones anuales", time: `Mínimo ${R.vacation.days} días naturales al año`, count: "Naturales (lo dice el Estatuto)", payer: "Empresa", article: "38.1" },
    { what: "Nacimiento y cuidado del menor (cada progenitor)", time: `${BIRTH.totalWeeks} semanas (${BIRTH.single.totalWeeks} en familia monoparental), ${BIRTH.mandatoryWeeks} obligatorias tras el parto`, count: "Semanas", payer: `Seguridad Social (INSS), ${BIRTH.benefitPct} % de la base reguladora`, article: "48.4" },
    { what: "Permiso parental, hasta que el menor cumpla 8 años", time: `Hasta ${PARENTAL.weeks} semanas`, count: "Semanas", payer: "Nadie: sin sueldo por ley (salvo convenio)", article: "48 bis" },
  ];
  const ca: Row[] = [
    { what: "Matrimoni o registre de parella de fet", time: `${R.marriage.days} dies naturals`, count: "Naturals (ho diu l'Estatut)", payer: "Empresa", article: "37.3.a" },
    { what: "Accident o malaltia greu, hospitalització o intervenció sense hospitalització amb repòs a casa del cònjuge, parella de fet, familiars fins al 2n grau o qui convisqui amb tu i necessiti la teva cura", time: `${R.illness.days} dies`, count: "«Días», sense precisar", payer: "Empresa", article: "37.3.b" },
    { what: "Defunció del cònjuge, parella de fet o familiars fins al 2n grau", time: `${R.death.days} dies; ${R.death.days + R.death.travelExtra} si t'has de desplaçar`, count: "«Días», sense precisar", payer: "Empresa", article: "37.3.b bis" },
    { what: "Trasllat del domicili habitual (mudança)", time: `${R.move.days} dia`, count: "«Día», sense precisar", payer: "Empresa", article: "37.3.c" },
    { what: "Deure inexcusable de caràcter públic i personal, inclòs votar", time: "El temps indispensable", count: "—", payer: "Empresa (descomptant la indemnització que cobris per aquest deure)", article: "37.3.d" },
    { what: "Exàmens prenatals i preparació al part; sessions i informes previs a una adopció o acolliment", time: "El temps indispensable, si és en horari de feina", count: "—", payer: "Empresa", article: "37.3.f" },
    { what: "No poder arribar a la feina per restriccions de les autoritats, risc greu i imminent, catàstrofe o fenomen meteorològic advers", time: `Fins a ${UNREACHABLE_WORK_DAYS} dies, i després mentre duri`, count: "—", payer: "Empresa", article: "37.3.g" },
    { what: "Actes preparatoris de la donació d'òrgans o teixits", time: "El temps indispensable, si és en horari de feina", count: "—", payer: "Empresa", article: "37.3 (2a lletra g)" },
    { what: "Força major: motiu familiar urgent per malaltia o accident que exigeix la teva presència immediata", time: `Hores equivalents a ${FORCE_MAJEURE_DAYS_PER_YEAR} dies l'any, retribuïdes`, count: "Per hores", payer: "Empresa", article: "37.9" },
    { what: "Lactància", time: `${NURSING.hoursPerDay} hora al dia fins als ${NURSING.untilMonths} mesos (o mitja hora menys de jornada, o acumulada en jornades completes)`, count: "Per hores", payer: `Empresa (l'Estatut només preveu reduir el sou dels ${NURSING.untilMonths} als ${NURSING.sharedUntilMonths} mesos, si els dos progenitors l'exerceixen igual; aleshores paga la Seguretat Social)`, article: "37.4" },
    { what: "Vacances anuals", time: `Mínim ${R.vacation.days} dies naturals l'any`, count: "Naturals (ho diu l'Estatut)", payer: "Empresa", article: "38.1" },
    { what: "Naixement i cura del menor (cada progenitor)", time: `${BIRTH.totalWeeks} setmanes (${BIRTH.single.totalWeeks} en família monoparental), ${BIRTH.mandatoryWeeks} obligatòries després del part`, count: "Setmanes", payer: `Seguretat Social (INSS), ${BIRTH.benefitPct} % de la base reguladora`, article: "48.4" },
    { what: "Permís parental, fins que el menor faci 8 anys", time: `Fins a ${PARENTAL.weeks} setmanes`, count: "Setmanes", payer: "Ningú: sense sou per llei (llevat de conveni)", article: "48 bis" },
  ];
  const en: Row[] = [
    { what: "Marriage or registering a civil partnership", time: `${R.marriage.days} calendar days`, count: "Calendar days (the Statute says so)", payer: "Employer", article: "37.3.a" },
    { what: "Serious accident or illness, hospitalisation, or outpatient surgery needing rest at home, of your spouse, partner, relatives up to the 2nd degree, or someone living with you who needs your care", time: `${R.illness.days} days`, count: "«Días», not specified", payer: "Employer", article: "37.3.b" },
    { what: "Death of your spouse, partner or a relative up to the 2nd degree", time: `${R.death.days} days; ${R.death.days + R.death.travelExtra} if you have to travel`, count: "«Días», not specified", payer: "Employer", article: "37.3.b bis" },
    { what: "Moving house", time: `${R.move.days} day`, count: "«Día», not specified", payer: "Employer", article: "37.3.c" },
    { what: "An unavoidable public and personal duty, voting included", time: "The time strictly needed", count: "—", payer: "Employer (less any allowance you get for that duty)", article: "37.3.d" },
    { what: "Antenatal check-ups and birth preparation classes; sessions and reports before an adoption or fostering", time: "The time strictly needed, if in working hours", count: "—", payer: "Employer", article: "37.3.f" },
    { what: "Being unable to reach work because of the authorities' restrictions, a serious and imminent risk, a catastrophe or adverse weather", time: `Up to ${UNREACHABLE_WORK_DAYS} days, then for as long as it lasts`, count: "—", payer: "Employer", article: "37.3.g" },
    { what: "Preparatory steps for an organ or tissue donation", time: "The time strictly needed, if in working hours", count: "—", payer: "Employer", article: "37.3 (2nd letter g)" },
    { what: "Force majeure: an urgent family matter, an illness or accident that needs you there at once", time: `Hours equal to ${FORCE_MAJEURE_DAYS_PER_YEAR} days a year, paid`, count: "In hours", payer: "Employer", article: "37.9" },
    { what: "Nursing (lactancia)", time: `${NURSING.hoursPerDay} hour a day until the baby is ${NURSING.untilMonths} months old (or a half-hour shorter day, or accumulated as full days)`, count: "In hours", payer: `Employer (the Statute only cuts pay from ${NURSING.untilMonths} to ${NURSING.sharedUntilMonths} months, when both parents take it the same way; Social Security then pays)`, article: "37.4" },
    { what: "Annual holidays", time: `At least ${R.vacation.days} calendar days a year`, count: "Calendar days (the Statute says so)", payer: "Employer", article: "38.1" },
    { what: "Birth and childcare leave (each parent)", time: `${BIRTH.totalWeeks} weeks (${BIRTH.single.totalWeeks} for a single parent), ${BIRTH.mandatoryWeeks} mandatory after the birth`, count: "Weeks", payer: `Social Security (INSS), ${BIRTH.benefitPct}% of the base reguladora`, article: "48.4" },
    { what: "Parental leave, until the child turns 8", time: `Up to ${PARENTAL.weeks} weeks`, count: "Weeks", payer: "Nobody: unpaid by law (unless your agreement pays it)", article: "48 bis" },
  ];
  return L(locale, { es, ca, en });
}

export function PaidLeaveRoute({ locale }: { locale: PlLocale }) {
  const meta = PL_META[locale];
  const crumbs = paidLeaveCrumbs(locale);
  const places = paidLeavePlaces(locale);
  const initial = defaultInput(locale);
  const ex = defaultExamples(locale, places);
  const placeName = places.find((p) => p[0] === initial.place)?.[1] ?? "";
  const D = (iso: string) => fullDate(iso, locale);
  const dmy = (iso: string) => dayMonthYear(iso, locale);
  const asOf = dmy(RULES_AS_OF);
  const R = SHORT_RULES;
  const b = ex.birth;
  const w = ex.short.working!;

  const lead = L(locale, {
    es: `El Estatuto de los Trabajadores te da, como mínimo, ${R.marriage.days} días naturales por boda o registro de pareja de hecho; ${R.illness.days} días por accidente, enfermedad grave, hospitalización o intervención con reposo de un familiar hasta segundo grado o de quien conviva contigo; ${R.death.days} días por fallecimiento (${R.death.days + R.death.travelExtra} si tienes que desplazarte); ${R.move.days} día por mudanza; horas equivalentes a ${FORCE_MAJEURE_DAYS_PER_YEAR} días al año por fuerza mayor, y ${R.vacation.days} días naturales de vacaciones. Todos los paga la empresa. El permiso por nacimiento es de ${BIRTH.totalWeeks} semanas por progenitor (${BIRTH.mandatoryWeeks} obligatorias tras el parto) y lo paga la Seguridad Social al ${BIRTH.benefitPct} %; el permiso parental de ${PARENTAL.weeks} semanas no se paga. Tu convenio puede mejorarlos.`,
    ca: `L'Estatut dels treballadors et dona, com a mínim, ${R.marriage.days} dies naturals per casament o registre de parella de fet; ${R.illness.days} dies per accident, malaltia greu, hospitalització o intervenció amb repòs d'un familiar fins al segon grau o de qui convisqui amb tu; ${R.death.days} dies per defunció (${R.death.days + R.death.travelExtra} si t'has de desplaçar); ${R.move.days} dia per mudança; hores equivalents a ${FORCE_MAJEURE_DAYS_PER_YEAR} dies l'any per força major, i ${R.vacation.days} dies naturals de vacances. Tots els paga l'empresa. El permís per naixement és de ${BIRTH.totalWeeks} setmanes per progenitor (${BIRTH.mandatoryWeeks} obligatòries després del part) i el paga la Seguretat Social al ${BIRTH.benefitPct} %; el permís parental de ${PARENTAL.weeks} setmanes no es paga. El teu conveni els pot millorar.`,
    en: `Spain's Workers' Statute gives you at least ${R.marriage.days} calendar days to marry or register a partnership; ${R.illness.days} days when a relative up to the second degree, or someone living with you, has a serious accident or illness, is in hospital or has surgery needing rest at home; ${R.death.days} days for a death (${R.death.days + R.death.travelExtra} if you have to travel); ${R.move.days} day to move house; hours equal to ${FORCE_MAJEURE_DAYS_PER_YEAR} days a year for force majeure; and ${R.vacation.days} calendar days of holiday. Your employer pays all of them. Birth leave is ${BIRTH.totalWeeks} weeks per parent (${BIRTH.mandatoryWeeks} mandatory after the birth), paid by Social Security at ${BIRTH.benefitPct}%; the ${PARENTAL.weeks}-week parental leave is unpaid. Your collective agreement can improve them.`,
  });
  const fresh = L(locale, {
    es: `Normas revisadas el ${asOf} en el BOE (Estatuto de los Trabajadores, actualización del 21 de octubre de 2026; Ley General de la Seguridad Social) y en la Seguridad Social.`,
    ca: `Normes revisades el ${asOf} al BOE (Estatut dels treballadors, actualització del 21 d'octubre de 2026; Llei general de la Seguretat Social) i a la Seguretat Social.`,
    en: `Rules checked on ${asOf} in the BOE (Workers' Statute, consolidated 21 October 2026; General Social Security Act) and with Social Security.`,
  });

  const h = L(locale, {
    es: { table: "Tabla de permisos retribuidos y quién los paga", days: "¿Días naturales o laborables?", birth: `Permiso por nacimiento: ${BIRTH.totalWeeks} semanas`, parental: `Permiso parental: ${PARENTAL.weeks} semanas sin sueldo`, vacation: `Vacaciones: ${R.vacation.days} días naturales como mínimo`, force: `Fuerza mayor: ${FORCE_MAJEURE_DAYS_PER_YEAR} días al año`, convenio: "Tu convenio puede darte más", faq: "Preguntas frecuentes", sources: "Fuentes", limits: "Qué no incluye" },
    ca: { table: "Taula de permisos retribuïts i qui els paga", days: "Dies naturals o laborables?", birth: `Permís per naixement: ${BIRTH.totalWeeks} setmanes`, parental: `Permís parental: ${PARENTAL.weeks} setmanes sense sou`, vacation: `Vacances: ${R.vacation.days} dies naturals com a mínim`, force: `Força major: ${FORCE_MAJEURE_DAYS_PER_YEAR} dies l'any`, convenio: "El teu conveni et pot donar més", faq: "Preguntes freqüents", sources: "Fonts", limits: "Què no inclou" },
    en: { table: "Paid leave at a glance, and who pays it", days: "Calendar days or working days?", birth: `Birth leave: ${BIRTH.totalWeeks} weeks`, parental: `Parental leave: ${PARENTAL.weeks} unpaid weeks`, vacation: `Holidays: at least ${R.vacation.days} calendar days`, force: `Force majeure: ${FORCE_MAJEURE_DAYS_PER_YEAR} days a year`, convenio: "Your collective agreement can give you more", faq: "Questions", sources: "Sources", limits: "What it leaves out" },
  });
  const cols = L(locale, {
    es: ["Motivo", "Tiempo", "Cómo se cuenta", "Quién paga", "Artículo"],
    ca: ["Motiu", "Temps", "Com es compta", "Qui paga", "Article"],
    en: ["Reason", "Time off", "How it is counted", "Who pays", "Article"],
  });
  const caption = L(locale, {
    es: `Mínimos del Estatuto de los Trabajadores a ${asOf}. «Previo aviso y justificación» (art. 37.3).`,
    ca: `Mínims de l'Estatut dels treballadors a ${asOf}. «Previo aviso y justificación» (amb preavís i justificació, art. 37.3).`,
    en: `Workers' Statute minimums as of ${asOf}. «Previo aviso y justificación»: with notice and proof (art. 37.3).`,
  });

  const daysText = L(locale, {
    es: [
      `El Estatuto solo dice «naturales» en el permiso por matrimonio (art. 37.3.a) y en las vacaciones (art. 38.1). En los permisos por accidente, enfermedad u hospitalización de un familiar, por fallecimiento y por mudanza dice solo «días»: el texto consolidado del BOE (actualización del 21 de octubre de 2026) no contiene las palabras «hábiles» ni «laborables» en el artículo 37.3, tampoco tras la reforma del Real Decreto-ley 5/2023. Tampoco dice qué día empieza el permiso.`,
      `Por eso la calculadora te da los dos cómputos. En el ejemplo de arriba, ${R.illness.days} días desde el ${D(DEFAULT_INPUT.start)}: contados seguidos terminan el ${D(ex.short.lastCalendar)}; contando solo días laborables de lunes a viernes con los festivos de ${placeName}, el ${D(w.last)}. Muchos convenios colectivos lo concretan: mira el tuyo.`,
    ],
    ca: [
      `L'Estatut només diu «naturales» (naturals) en el permís per matrimoni (art. 37.3.a) i en les vacances (art. 38.1). En els permisos per accident, malaltia o hospitalització d'un familiar, per defunció i per mudança diu només «días» (dies): el text consolidat del BOE (actualització del 21 d'octubre de 2026) no conté les paraules «hábiles» ni «laborables» a l'article 37.3, tampoc després de la reforma del Reial decret llei 5/2023. Tampoc diu quin dia comença el permís.`,
      `Per això la calculadora et dona els dos còmputs. En l'exemple de dalt, ${R.illness.days} dies des del ${D(DEFAULT_INPUT.start)}: comptats seguits acaben el ${D(ex.short.lastCalendar)}; comptant només dies laborables de dilluns a divendres amb els festius de ${placeName}, el ${D(w.last)}. Molts convenis col·lectius ho concreten: mira el teu.`,
    ],
    en: [
      `The Statute says «naturales» (calendar days) only for marriage leave (art. 37.3.a) and holidays (art. 38.1). For a relative's accident, illness or hospitalisation, for a death and for moving house it says just «días» (days): the BOE consolidated text (updated 21 October 2026) does not contain the words «hábiles» or «laborables» (working days) anywhere in article 37.3, including after the Royal Decree-law 5/2023 reform. Nor does it say on which day the leave starts.`,
      `That is why the calculator gives you both counts. In the example above, ${R.illness.days} days from ${D(DEFAULT_INPUT.start)}: counted consecutively they end on ${D(ex.short.lastCalendar)}; counting Monday-to-Friday working days with the holidays of ${placeName}, on ${D(w.last)}. Many collective agreements settle it: check yours.`,
    ],
  });

  const birthText = L(locale, {
    es: {
      intro: `Desde el Real Decreto-ley 9/2025 (BOE del 30 de julio de 2025, convalidado por el Congreso el 9 de septiembre de 2025), el permiso por nacimiento y cuidado del menor es de ${BIRTH.totalWeeks} semanas para cada progenitor, y de ${BIRTH.single.totalWeeks} en las familias monoparentales. Se reparte así:`,
      items: [
        `${BIRTH.mandatoryWeeks} semanas obligatorias, seguidas y a jornada completa, justo después del parto.`,
        `${BIRTH.flexibleWeeks} semanas (${BIRTH.single.flexibleWeeks} en familia monoparental) que puedes repartir por semanas, seguidas o sueltas, desde el final de las obligatorias hasta que el bebé cumpla 12 meses. La madre biológica puede adelantarlas hasta ${BIRTH.beforeDueWeeks} semanas antes de la fecha prevista del parto.`,
        `${BIRTH.childcareWeeks} semanas (${BIRTH.single.childcareWeeks}) que puedes usar por semanas hasta que cumpla 8 años.`,
      ],
      example: `Ejemplo: con un nacimiento el ${D(b.birth)}, las semanas obligatorias van hasta el ${D(b.mandatoryEnd)}; las ${b.flexibleWeeks} siguientes se pueden usar hasta el ${dmy(b.flexibleUntil)} (si las coges seguidas, terminas el ${D(b.continuousEnd)}), y las ${b.childcareWeeks} últimas, hasta el ${dmy(b.childcareUntil)}. Las semanas a repartir se pueden disfrutar a jornada parcial si lo acuerdas con la empresa, avisando con ${BIRTH.noticeDays} días de antelación.`,
      pay: `Durante el permiso no cobras salario: la Seguridad Social (INSS) paga una prestación del ${BIRTH.benefitPct} % de tu base reguladora (la base de cotización por contingencias comunes, normalmente la del mes anterior al previo al parto, dividida entre sus días). La pide cada progenitor; hay que cumplir un periodo mínimo de cotización según la edad (ninguno si tienes menos de 21 años).`,
      transitional: `Las ${BIRTH.childcareWeeks} semanas hasta los 8 años también valen para los nacimientos desde el 2 de agosto de 2024, y se pueden pedir desde el 1 de enero de 2026:`,
      more: `Si el bebé está hospitalizado más de siete días tras el parto, el permiso se amplía tantos días como dure el ingreso, con un máximo de ${BIRTH.hospitalMaxExtraWeeks} semanas. Por discapacidad del hijo o por cada hijo a partir del segundo en un parto múltiple hay ${BIRTH.extraWeeksPerCase} semanas más, una para cada progenitor. Las vacaciones que coincidan con el permiso se disfrutan después, aunque haya terminado el año (art. 38.3).`,
    },
    ca: {
      intro: `Des del Reial decret llei 9/2025 (BOE del 30 de juliol de 2025, convalidat pel Congrés el 9 de setembre de 2025), el permís per naixement i cura del menor és de ${BIRTH.totalWeeks} setmanes per a cada progenitor, i de ${BIRTH.single.totalWeeks} en les famílies monoparentals. Es reparteix així:`,
      items: [
        `${BIRTH.mandatoryWeeks} setmanes obligatòries, seguides i a jornada completa, just després del part.`,
        `${BIRTH.flexibleWeeks} setmanes (${BIRTH.single.flexibleWeeks} en família monoparental) que pots repartir per setmanes, seguides o soltes, des del final de les obligatòries fins que el nadó faci 12 mesos. La mare biològica les pot avançar fins a ${BIRTH.beforeDueWeeks} setmanes abans de la data prevista del part.`,
        `${BIRTH.childcareWeeks} setmanes (${BIRTH.single.childcareWeeks}) que pots fer servir per setmanes fins que faci 8 anys.`,
      ],
      example: `Exemple: amb un naixement el ${D(b.birth)}, les setmanes obligatòries van fins al ${D(b.mandatoryEnd)}; les ${b.flexibleWeeks} següents es poden fer servir fins al ${dmy(b.flexibleUntil)} (si les agafes seguides, acabes el ${D(b.continuousEnd)}), i les ${b.childcareWeeks} últimes, fins al ${dmy(b.childcareUntil)}. Les setmanes a repartir es poden gaudir a jornada parcial si ho acordes amb l'empresa, avisant amb ${BIRTH.noticeDays} dies d'antelació.`,
      pay: `Durant el permís no cobres salari: la Seguretat Social (INSS) paga una prestació del ${BIRTH.benefitPct} % de la teva base reguladora (la base de cotització per contingències comunes, normalment la del mes anterior al previ al part, dividida entre els seus dies). La demana cada progenitor; cal complir un període mínim de cotització segons l'edat (cap si tens menys de 21 anys).`,
      transitional: `Les ${BIRTH.childcareWeeks} setmanes fins als 8 anys també valen per als naixements des del 2 d'agost de 2024, i es poden demanar des de l'1 de gener de 2026:`,
      more: `Si el nadó està hospitalitzat més de set dies després del part, el permís s'amplia tants dies com duri l'ingrés, amb un màxim de ${BIRTH.hospitalMaxExtraWeeks} setmanes. Per discapacitat del fill o per cada fill a partir del segon en un part múltiple hi ha ${BIRTH.extraWeeksPerCase} setmanes més, una per a cada progenitor. Les vacances que coincideixin amb el permís es gaudeixen després, encara que hagi acabat l'any (art. 38.3).`,
    },
    en: {
      intro: `Since Royal Decree-law 9/2025 (BOE, 30 July 2025, ratified by Congress on 9 September 2025), birth and childcare leave is ${BIRTH.totalWeeks} weeks for each parent, and ${BIRTH.single.totalWeeks} for a single parent. It is split like this:`,
      items: [
        `${BIRTH.mandatoryWeeks} mandatory weeks, in a row and full time, right after the birth.`,
        `${BIRTH.flexibleWeeks} weeks (${BIRTH.single.flexibleWeeks} for a single parent) you can spread out in whole weeks, together or apart, from the end of the mandatory ones until the baby is 12 months old. The biological mother can start them up to ${BIRTH.beforeDueWeeks} weeks before the due date.`,
        `${BIRTH.childcareWeeks} weeks (${BIRTH.single.childcareWeeks}) you can use in whole weeks until the child turns 8.`,
      ],
      example: `Example: for a birth on ${D(b.birth)}, the mandatory weeks run to ${D(b.mandatoryEnd)}; the next ${b.flexibleWeeks} can be used until ${dmy(b.flexibleUntil)} (taken in a row, you finish on ${D(b.continuousEnd)}), and the last ${b.childcareWeeks} until ${dmy(b.childcareUntil)}. The weeks you spread out can be taken part time if your employer agrees, with ${BIRTH.noticeDays} days' notice.`,
      pay: `You get no salary during the leave: Social Security (the INSS) pays a benefit of ${BIRTH.benefitPct}% of your daily base (the common-contingencies contribution base, normally that of the month before last before the birth, divided by its days). Each parent applies; there is a minimum contribution period by age (none under 21).`,
      transitional: `The ${BIRTH.childcareWeeks} weeks until age 8 also apply to births from 2 August 2024, and could be requested from 1 January 2026:`,
      more: `If the baby stays in hospital more than seven days after the birth, the leave grows by the days in hospital, up to ${BIRTH.hospitalMaxExtraWeeks} weeks. A child's disability, or each child after the first in a multiple birth, adds ${BIRTH.extraWeeksPerCase} weeks, one per parent. Holidays that overlap the leave are taken afterwards, even after the year ends (art. 38.3).`,
    },
  });

  const parentalText = L(locale, {
    es: `Además del permiso por nacimiento, cada progenitor tiene un permiso parental de hasta ${PARENTAL.weeks} semanas, seguidas o no, a jornada completa o parcial, hasta que el menor cumpla 8 años; hay que avisar con ${PARENTAL.noticeDays} días de antelación (o lo que diga el convenio). Es una suspensión del contrato (art. 45.1.o) y, según el art. 45.2, la empresa no paga el salario. A ${asOf}, la Ley General de la Seguridad Social no prevé ninguna prestación para este permiso: por ley no se cobra, salvo que tu convenio lo mejore.`,
    ca: `A més del permís per naixement, cada progenitor té un permís parental de fins a ${PARENTAL.weeks} setmanes, seguides o no, a jornada completa o parcial, fins que el menor faci 8 anys; cal avisar amb ${PARENTAL.noticeDays} dies d'antelació (o el que digui el conveni). És una suspensió del contracte (art. 45.1.o) i, segons l'art. 45.2, l'empresa no paga el salari. A ${asOf}, la Llei general de la Seguretat Social no preveu cap prestació per a aquest permís: per llei no es cobra, llevat que el teu conveni el millori.`,
    en: `On top of birth leave, each parent has parental leave of up to ${PARENTAL.weeks} weeks, in one go or not, full or part time, until the child turns 8, with ${PARENTAL.noticeDays} days' notice (or what the agreement says). It suspends the contract (art. 45.1.o) and, under art. 45.2, the employer does not pay salary. As of ${asOf}, the General Social Security Act provides no benefit for it: by law it is unpaid, unless your collective agreement improves on that.`,
  });

  const vacationText = L(locale, {
    es: `Las vacaciones mínimas son ${R.vacation.days} días naturales al año, pagadas y no se pueden cambiar por dinero. Las fechas se acuerdan con la empresa y debes conocerlas al menos dos meses antes. Si coinciden con una baja por embarazo, parto o lactancia o con el permiso por nacimiento, las disfrutas después aunque haya acabado el año; si otra baja te impide disfrutarlas en el año, puedes hacerlo al terminarla, siempre que no hayan pasado más de 18 meses desde el final de ese año.`,
    ca: `Les vacances mínimes són ${R.vacation.days} dies naturals l'any, pagades i no es poden canviar per diners. Les dates s'acorden amb l'empresa i les has de conèixer almenys dos mesos abans. Si coincideixen amb una baixa per embaràs, part o lactància o amb el permís per naixement, les gaudeixes després encara que hagi acabat l'any; si una altra baixa t'impedeix gaudir-les durant l'any, ho pots fer quan s'acabi, sempre que no hagin passat més de 18 mesos des del final d'aquell any.`,
    en: `The minimum holiday is ${R.vacation.days} calendar days a year, paid, and it cannot be swapped for money. Dates are agreed with the employer and you must know them at least two months ahead. If they overlap sick leave for pregnancy, birth or breastfeeding, or birth leave, you take them afterwards even after the year ends; if other sick leave keeps you from taking them that year, you can take them when it ends, as long as no more than 18 months have passed since the end of that year.`,
  });

  const forceText = L(locale, {
    es: `Puedes ausentarte por fuerza mayor cuando un familiar o conviviente sufre una enfermedad o un accidente que hace indispensable tu presencia inmediata. Las horas se pagan hasta el equivalente a ${FORCE_MAJEURE_DAYS_PER_YEAR} días al año, en las condiciones que fije el convenio o un acuerdo con la representación de los trabajadores, y la empresa puede pedirte que acredites el motivo.`,
    ca: `Pots absentar-te per força major quan un familiar o convivent pateix una malaltia o un accident que fa indispensable la teva presència immediata. Les hores es paguen fins a l'equivalent a ${FORCE_MAJEURE_DAYS_PER_YEAR} dies l'any, en les condicions que fixi el conveni o un acord amb la representació dels treballadors, i l'empresa et pot demanar que n'acreditis el motiu.`,
    en: `You can be off for force majeure when a relative or someone you live with has an illness or accident that makes your immediate presence essential. The hours are paid up to the equivalent of ${FORCE_MAJEURE_DAYS_PER_YEAR} days a year, on the terms set by the collective agreement or an agreement with the workers' representatives, and the employer may ask you to prove the reason.`,
  });

  const convenioText = L(locale, {
    es: "Todo lo de esta página son mínimos legales. Tu convenio colectivo o tu contrato pueden darte más días, ampliar los familiares que cuentan, decir si se cuentan naturales o laborables y desde qué día, o pagar el permiso parental. No pueden darte menos. El convenio de tu sector está publicado en el BOE o en el boletín de tu comunidad o provincia.",
    ca: "Tot el que hi ha en aquesta pàgina són mínims legals. El teu conveni col·lectiu o el teu contracte et poden donar més dies, ampliar els familiars que compten, dir si es compten naturals o laborables i des de quin dia, o pagar el permís parental. No te'n poden donar menys. El conveni del teu sector està publicat al BOE o al butlletí de la teva comunitat o província.",
    en: "Everything on this page is a legal minimum. Your collective agreement or contract can give you more days, widen the relatives who count, say whether days are calendar or working days and from when, or pay the parental leave. They cannot give you less. Your sector's agreement is published in the BOE or in your region's or province's bulletin.",
  });

  const faq = L(locale, {
    es: [
      { q: "¿Cuántos días de permiso hay por fallecimiento de un familiar?", a: `${R.death.days} días por el fallecimiento del cónyuge, la pareja de hecho o un familiar hasta segundo grado. Si tienes que desplazarte, ${R.death.days + R.death.travelExtra} días. Los paga la empresa.` },
      { q: "¿Cuántos días me dan por hospitalización de un familiar?", a: `${R.illness.days} días, por hospitalización, accidente o enfermedad grave, o una intervención sin ingreso que necesite reposo en casa, de un familiar hasta segundo grado, tu pareja o alguien que conviva contigo y necesite tu cuidado.` },
      { q: "¿Los días de permiso son naturales o laborables?", a: daysText[0] },
      { q: "¿Cuántas semanas es el permiso de paternidad en 2026?", a: `${BIRTH.totalWeeks} semanas para cada progenitor (${BIRTH.single.totalWeeks} en familia monoparental): ${BIRTH.mandatoryWeeks} obligatorias tras el parto, ${BIRTH.flexibleWeeks} hasta que el bebé cumpla un año y ${BIRTH.childcareWeeks} hasta los 8 años. Lo paga la Seguridad Social al ${BIRTH.benefitPct} % de la base reguladora.` },
      { q: "¿El permiso parental de 8 semanas es retribuido?", a: parentalText },
      { q: "¿Cuántos días de permiso hay por boda?", a: `${R.marriage.days} días naturales por matrimonio o por inscribirte como pareja de hecho, pagados por la empresa.` },
      { q: "¿Hay permiso por mudanza?", a: `Sí: ${R.move.days} día por traslado del domicilio habitual, pagado.` },
    ],
    ca: [
      { q: "Quants dies de permís hi ha per defunció d'un familiar?", a: `${R.death.days} dies per la defunció del cònjuge, la parella de fet o un familiar fins al segon grau. Si t'has de desplaçar, ${R.death.days + R.death.travelExtra} dies. Els paga l'empresa.` },
      { q: "Quants dies em donen per hospitalització d'un familiar?", a: `${R.illness.days} dies, per hospitalització, accident o malaltia greu, o una intervenció sense ingrés que necessiti repòs a casa, d'un familiar fins al segon grau, la teva parella o algú que convisqui amb tu i necessiti la teva cura.` },
      { q: "Els dies de permís són naturals o laborables?", a: daysText[0] },
      { q: "Quantes setmanes és el permís de paternitat el 2026?", a: `${BIRTH.totalWeeks} setmanes per a cada progenitor (${BIRTH.single.totalWeeks} en família monoparental): ${BIRTH.mandatoryWeeks} obligatòries després del part, ${BIRTH.flexibleWeeks} fins que el nadó faci un any i ${BIRTH.childcareWeeks} fins als 8 anys. El paga la Seguretat Social al ${BIRTH.benefitPct} % de la base reguladora.` },
      { q: "El permís parental de 8 setmanes és retribuït?", a: parentalText },
      { q: "Quants dies de permís hi ha per casament?", a: `${R.marriage.days} dies naturals per matrimoni o per inscriure't com a parella de fet, pagats per l'empresa.` },
      { q: "Hi ha permís per mudança?", a: `Sí: ${R.move.days} dia per trasllat del domicili habitual, pagat.` },
    ],
    en: [
      { q: "How many days of leave do you get when a relative dies in Spain?", a: `${R.death.days} days for the death of a spouse, partner or relative up to the second degree. If you have to travel, ${R.death.days + R.death.travelExtra} days. Your employer pays them.` },
      { q: "How many days for a relative in hospital?", a: `${R.illness.days} days, for hospitalisation, a serious accident or illness, or outpatient surgery needing rest at home, of a relative up to the second degree, your partner, or someone living with you who needs your care.` },
      { q: "Are leave days calendar days or working days?", a: daysText[0] },
      { q: "How long is paternity and maternity leave in Spain in 2026?", a: `${BIRTH.totalWeeks} weeks for each parent (${BIRTH.single.totalWeeks} for a single parent): ${BIRTH.mandatoryWeeks} mandatory after the birth, ${BIRTH.flexibleWeeks} until the baby turns one and ${BIRTH.childcareWeeks} until age 8. Social Security pays ${BIRTH.benefitPct}% of the daily base.` },
      { q: "Is the 8-week parental leave paid?", a: parentalText },
      { q: "How many days off to get married?", a: `${R.marriage.days} calendar days for marriage or registering a civil partnership, paid by your employer.` },
      { q: "Is there leave to move house?", a: `Yes: ${R.move.days} day to move your usual home, paid.` },
    ],
  });

  const sourceList = [SOURCES.et, SOURCES.rdl5, SOURCES.rdl9, SOURCES.rdl9convalidation, SOURCES.lgss, SOURCES.ssBirth];
  const sourcesLead = L(locale, {
    es: `Leído el ${asOf} en los textos consolidados del BOE y en la web de la Seguridad Social. Las citas son literales, en castellano.`,
    ca: `Llegit el ${asOf} als textos consolidats del BOE i al web de la Seguretat Social. Les cites són literals, en castellà.`,
    en: `Read on ${asOf} in the BOE consolidated texts and on the Social Security website. Quotes are verbatim, in Spanish.`,
  });
  const limits = L(locale, {
    es: [
      "Funcionarios y personal estatutario (tienen sus propios permisos en el Estatuto Básico del Empleado Público), empleadas de hogar, autónomos y relaciones laborales especiales.",
      "Las mejoras de tu convenio colectivo: la calculadora usa solo el mínimo legal.",
      "Las fiestas locales de tu municipio en el cómputo de días laborables (solo nacionales y de la comunidad). Para tu municipio, usa la calculadora de días hábiles.",
      "Adopción, guarda y acogimiento (mismas semanas, contadas desde la resolución), las ampliaciones por hospitalización, discapacidad o parto múltiple, y el cálculo del importe de la prestación por nacimiento.",
      "Cuándo empieza cada permiso si el hecho ocurre en un día que no trabajas: el Estatuto no lo dice.",
    ],
    ca: [
      "Funcionaris i personal estatutari (tenen els seus propis permisos a l'Estatut bàsic de l'empleat públic), treballadores de la llar, autònoms i relacions laborals especials.",
      "Les millores del teu conveni col·lectiu: la calculadora fa servir només el mínim legal.",
      "Les festes locals del teu municipi en el còmput de dies laborables (només estatals i de la comunitat). Per al teu municipi, fes servir la calculadora de dies hàbils.",
      "Adopció, guarda i acolliment (mateixes setmanes, comptades des de la resolució), les ampliacions per hospitalització, discapacitat o part múltiple, i el càlcul de l'import de la prestació per naixement.",
      "Quan comença cada permís si el fet passa un dia que no treballes: l'Estatut no ho diu.",
    ],
    en: [
      "Civil servants and statutory staff (their leave is in the Basic Statute of Public Employees), domestic workers, the self-employed and special employment relationships.",
      "Your collective agreement's improvements: the calculator uses the legal minimum only.",
      "Your town's local holidays in the working-day count (national and regional ones only). For your town, use the working-days calculator.",
      "Adoption, pre-adoptive care and fostering (same weeks, counted from the decision), the extensions for hospitalisation, disability or multiple births, and the amount of the birth benefit.",
      "When each leave starts if the event happens on a day you do not work: the Statute does not say.",
    ],
  });

  const appSchema = {
    "@type": "WebApplication",
    name: meta.appName,
    url: absoluteUrl(paidLeavePath(locale)),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    inLanguage: locale,
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description: meta.description,
  };
  const faqSchema = {
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const quote = (text: string, url: string, label: string) => (
    <blockquote lang="es">
      <p>«{text}»</p>
      <footer className="text-sm">
        <a href={url} rel="noopener" target="_blank">
          {label}
        </a>
      </footer>
    </blockquote>
  );
  const et = (art: string) => L(locale, { es: `Estatuto de los Trabajadores, art. ${art}`, ca: `Estatut dels treballadors, art. ${art}`, en: `Workers' Statute, art. ${art}` });
  const etRef = `(${SOURCES.et.ref})`;

  return (
    <>
      <SiteHeader locale={locale} translations={paidLeaveEditions()} />
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
              <PaidLeaveCalculator locale={locale} initial={initial} places={places} />

              <h2 id="tabla">{h.table}</h2>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{caption}</caption>
                  <thead>
                    <tr>
                      {cols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows(locale).map((r) => (
                      <tr key={r.article}>
                        <th scope="row" className="font-normal">
                          {r.what}
                        </th>
                        <td data-label={cols[1]}>{r.time}</td>
                        <td data-label={cols[2]}>{r.count}</td>
                        <td data-label={cols[3]}>{r.payer}</td>
                        <td data-label={cols[4]} className="whitespace-nowrap">
                          {r.article}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {quote(QUOTE.et373intro, SOURCES.et.url, `${et("37.3")} ${etRef}`)}

              <h2 id="naturales-o-laborables">{h.days}</h2>
              <p>{daysText[0]}</p>
              {quote(QUOTE.marriage, SOURCES.et.url, `${et("37.3.a")} ${etRef}`)}
              {quote(QUOTE.illness, SOURCES.et.url, `${et("37.3.b")} ${etRef}`)}
              {quote(QUOTE.death, SOURCES.et.url, `${et("37.3.b bis")} ${etRef}`)}
              {quote(QUOTE.move, SOURCES.et.url, `${et("37.3.c")} ${etRef}`)}
              <p>{daysText[1]}</p>
              <p>
                {L(locale, { es: "Para contar con los festivos de tu municipio:", ca: "Per comptar amb els festius del teu municipi:", en: "To count with your town's holidays:" })}{" "}
                <Link href={calcPath("working-days", locale)}>{L(locale, { es: "calculadora de días hábiles", ca: "calculadora de dies hàbils", en: "working-days calculator" })}</Link>.
              </p>

              <h2 id="nacimiento">{h.birth}</h2>
              <p>{birthText.intro}</p>
              <ul>
                {birthText.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
              {quote(QUOTE.birth, SOURCES.et.url, `${et("48.4")} ${etRef}`)}
              {quote(QUOTE.birthMandatory, SOURCES.et.url, `${et("48.4.a")} ${etRef}`)}
              {quote(QUOTE.birthFlexible, SOURCES.et.url, `${et("48.4.b")} ${etRef}`)}
              {quote(QUOTE.birthChildcare, SOURCES.et.url, `${et("48.4.c")} ${etRef}`)}
              <p>{birthText.example}</p>
              <p>{birthText.pay}</p>
              {quote(QUOTE.benefit, SOURCES.lgss.url, L(locale, { es: "Ley General de la Seguridad Social, art. 179.1", ca: "Llei general de la Seguretat Social, art. 179.1", en: "General Social Security Act, art. 179.1" }) + ` (${SOURCES.lgss.ref})`)}
              {quote(QUOTE.ssTax, SOURCES.ssBirth.url, `${SOURCES.ssBirth.name} (${dmy(SOURCES.ssBirth.date)})`)}
              <p>{birthText.transitional}</p>
              {quote(QUOTE.rdl9transitional, SOURCES.rdl9.url, `Real Decreto-ley 9/2025, disposición transitoria única (${SOURCES.rdl9.ref})`)}
              <p>{birthText.more}</p>

              <h2 id="permiso-parental">{h.parental}</h2>
              <p>{parentalText}</p>
              {quote(QUOTE.parental, SOURCES.et.url, `${et("48 bis.1")} ${etRef}`)}
              {quote(QUOTE.suspension, SOURCES.et.url, `${et("45.2")} ${etRef}`)}

              <h2 id="vacaciones">{h.vacation}</h2>
              <p>{vacationText}</p>
              {quote(QUOTE.vacation, SOURCES.et.url, `${et("38.1")} ${etRef}`)}
              <p>
                {L(locale, { es: "¿Quieres sacarles más partido en 2027?", ca: "Vols treure'n més profit el 2027?", en: "Want to stretch them further in 2027?" })}{" "}
                <Link href={leavePath(locale)}>{L(locale, { es: "Planificador de vacaciones 2027", ca: "Planificador de vacances 2027", en: "2027 leave planner" })}</Link>.
              </p>

              <h2 id="fuerza-mayor">{h.force}</h2>
              <p>{forceText}</p>
              {quote(QUOTE.forceMajeureCause, SOURCES.et.url, `${et("37.9")} ${etRef}`)}
              {quote(QUOTE.forceMajeure, SOURCES.et.url, `${et("37.9")} ${etRef}`)}

              <h2 id="convenio">{h.convenio}</h2>
              <p>{convenioText}</p>

              <h2 id="preguntas">{h.faq}</h2>
              {faq.map((f) => (
                <section key={f.q}>
                  <h3>{f.q}</h3>
                  <p>{f.a}</p>
                </section>
              ))}
              <p>
                {L(locale, { es: "¿Estás de baja?", ca: "Estàs de baixa?", en: "On sick leave?" })}{" "}
                <Link href={calcPath("sick-leave", locale)}>{L(locale, { es: "Calcula cuánto cobras de baja", ca: "Calcula quant cobres de baixa", en: "Work out your sick pay" })}</Link>.
              </p>

              <h2 id="fuentes">{h.sources}</h2>
              <p>{sourcesLead}</p>
              <ul>
                {sourceList.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} rel="noopener" target="_blank">
                      {s.name}
                    </a>{" "}
                    ({s.ref}, {dmy(s.date)})
                  </li>
                ))}
              </ul>

              <h2 id="limites">{h.limits}</h2>
              <ul>
                {limits.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              <p className="text-sm text-[var(--color-muted)]">{DISCLAIMER[locale]}</p>

              <MoreCalculators current="paid-leave" locale={locale} />
            </div>
            <ShareBar locale={locale} path={paidLeavePath(locale)} title={meta.h1} contentType="paid_leave_calculator" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), appSchema, faqSchema])} />
      <SiteFooter locale={locale} />
    </>
  );
}
