import { AdSlot } from "@/components/AdSlot";
import { crumbPath } from "@/components/share/ShareBar";
import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { CalculatorNextStep, MoreCalculators } from "@/components/programmatic/calculators/MoreCalculators";
import { ShareBar } from "@/components/share/ShareBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SourcesPolicyLink } from "@/components/SourcesPolicyLink";
import { getMessages } from "@/lib/i18n";
import { calcPath } from "@/lib/programmatic/calculators/paths";
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import { dayMonthYear } from "@/lib/programmatic/holidays/format";
import { leavePath } from "@/lib/programmatic/leave-2027/copy";
import { DEFAULT_PLACE, DISCLAIMER, calendarOf, fullDate, paidLeaveEditions, paidLeavePath, type PlLocale, type PlPlace } from "@/lib/programmatic/paid-leave/copy";
import { DEFAULT_INPUT, birthPlan, shortLeave, type BirthPlan, type PaidLeaveInput, type ShortLeaveResult } from "@/lib/programmatic/paid-leave/engine";
import { paidLeavePlaces } from "@/lib/programmatic/paid-leave/places";
import { BEREAVEMENT_START_WEEKS, BIRTH, CIVIL_SERVANT_BEREAVEMENT, FORCE_MAJEURE_DAYS_PER_YEAR, KIN_DEGREES, NURSING, PARENTAL, QUOTE, RULES_AS_OF, SHORT_RULES, SOURCES, UNREACHABLE_WORK_DAYS } from "@/lib/programmatic/paid-leave/rules";
import { absoluteUrl } from "@/lib/site";
import { ORGANIZATION_ID, breadcrumbSchema, graph } from "@/lib/seo/jsonld";
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

/** The bereavement leave until 25 Nov 2026 (RDL 5/2023 wording, QUOTE.deathBefore): 2 days, 2 more with travel. */
const SHORT_RULES_BEFORE = { days: 2, travelExtra: 2 } as const;

export const PL_META: Record<PlLocale, { title: string; description: string; h1: string; breadcrumb: string; appName: string }> = {
  es: {
    title: "Permisos laborales 2026: días que te corresponden",
    description: "Permisos retribuidos del Estatuto: 15 días por boda, 5 por hospitalización, 10 o 3 laborables por fallecimiento, 20 semanas por nacimiento. Calcula el último día.",
    h1: "Permisos laborales 2026: los días que te corresponden por ley",
    breadcrumb: "Permisos laborales",
    appName: "Calculadora de permisos laborales (Estatuto de los Trabajadores)",
  },
  ca: {
    title: "Permisos laborals 2026: dies que et corresponen",
    description: "Permisos retribuïts segons l'Estatut: 15 dies per casament, 5 per hospitalització, 10 o 3 laborables per defunció, 20 setmanes per naixement. Calcula l'últim dia.",
    h1: "Permisos laborals 2026: els dies que et corresponen per llei",
    breadcrumb: "Permisos laborals",
    appName: "Calculadora de permisos laborals (Estatut dels treballadors)",
  },
  en: {
    title: "Spain paid leave 2026: the days you are entitled to",
    description: "Paid leave under Spain's Workers' Statute: 15 days to marry, 5 for a relative in hospital, 10 or 3 working days for a death, 20 weeks for a birth. Find the last day.",
    h1: "Spain paid leave 2026: the days the law gives you",
    breadcrumb: "Paid leave",
    appName: "Spain paid leave calculator (Workers' Statute)",
  },
};

/**
 * "¿Quién es familiar hasta segundo grado?" (19 Nov 2026; queries "tabla de permisos por fallecimiento",
 * "grados de consanguinidad días de permiso"): the blood relatives by degree (Código Civil art. 918, in
 * KIN_DEGREES) against the death and illness leave of ET art. 37.3.b and b bis (SHORT_RULES). Affinity is
 * named by the Statute but counted by no law, so the page says so instead of listing in-laws.
 */
function KinTable({ locale }: { locale: PlLocale }) {
  const death = SHORT_RULES.death;
  const death2 = SHORT_RULES.death2;
  const illness = SHORT_RULES.illness;
  const t = L(locale, {
    es: {
      h: "¿Quién es familiar hasta segundo grado?",
      intro: `Desde el 26 de noviembre de 2026, el permiso por duelo es de ${death.days} días laborables por el cónyuge, la pareja de hecho o un familiar de primer grado de consanguinidad (padres e hijos), y de ${death2.days} días laborables (${death2.days + death2.travelExtra} si tienes que desplazarte) por un familiar de segundo grado o por afinidad. El de ${illness.days} días por accidente, enfermedad grave u hospitalización vale hasta el segundo grado. El grado se cuenta como dice el Código Civil: una generación es un grado, y entre hermanos, tíos o primos se sube hasta el antepasado común y se baja (arts. 918 y 919). Es la ley de toda España, también en Cataluña.`,
      caption: "Parentesco por consanguinidad (Código Civil, art. 918) y permisos mínimos del Estatuto de los Trabajadores (art. 37.3.b y b bis, este según el Real Decreto-ley 42/2026, en vigor desde el 26 de noviembre de 2026).",
      cols: ["Familiar", "Grado", "Fallecimiento (permiso por duelo)", "Enfermedad grave u hospitalización"],
      spouse: "Cónyuge o pareja de hecho",
      named: "Lo nombra el Estatuto",
      yesDeath: `${death.days} días laborables`,
      yesDeath2: `${death2.days} días laborables (${death2.days + death2.travelExtra} con desplazamiento)`,
      yesIll: `${illness.days} días`,
      no: "No por ley (mira tu convenio)",
      noIll: "No por ley, salvo que conviva contigo y necesite tu cuidado",
      affinity: `Por afinidad (la familia de tu cónyuge: suegros, cuñados…) el Estatuto da ${death2.days} días laborables por duelo (${death2.days + death2.travelExtra} con desplazamiento) tanto en el primer grado como en el segundo, y los ${illness.days} días por hospitalización hasta el segundo grado; ni el Estatuto ni el Código Civil dicen cómo se cuenta ese grado: si dudas, mira tu convenio colectivo, que a menudo trae su propia tabla. Para la hospitalización, el Estatuto incluye además «el familiar consanguíneo de la pareja de hecho».`,
    },
    ca: {
      h: "Qui és familiar fins al segon grau?",
      intro: `Des del 26 de novembre de 2026, el permís per dol és de ${death.days} dies laborables pel cònjuge, la parella de fet o un familiar de primer grau de consanguinitat (pares i fills), i de ${death2.days} dies laborables (${death2.days + death2.travelExtra} si t'has de desplaçar) per un familiar de segon grau o per afinitat. El de ${illness.days} dies per accident, malaltia greu o hospitalització val fins al segon grau. El grau es compta com diu el Codi civil espanyol: una generació és un grau, i entre germans, oncles o cosins es puja fins a l'avantpassat comú i es baixa (arts. 918 i 919, text oficial en castellà). És la llei de tot Espanya, també a Catalunya.`,
      caption: "Parentiu per consanguinitat (Codi civil, art. 918) i permisos mínims de l'Estatut dels treballadors (art. 37.3.b i b bis, aquest segons el Reial decret llei 42/2026, en vigor des del 26 de novembre de 2026).",
      cols: ["Familiar", "Grau", "Defunció (permís per dol)", "Malaltia greu o hospitalització"],
      spouse: "Cònjuge o parella de fet",
      named: "L'esmenta l'Estatut",
      yesDeath: `${death.days} dies laborables`,
      yesDeath2: `${death2.days} dies laborables (${death2.days + death2.travelExtra} amb desplaçament)`,
      yesIll: `${illness.days} dies`,
      no: "No per llei (mira el teu conveni)",
      noIll: "No per llei, tret que convisqui amb tu i necessiti la teva cura",
      affinity: `Per afinitat (la família del teu cònjuge: sogres, cunyats…) l'Estatut dona ${death2.days} dies laborables per dol (${death2.days + death2.travelExtra} amb desplaçament) tant en el primer grau com en el segon, i els ${illness.days} dies per hospitalització fins al segon grau; ni l'Estatut ni el Codi civil diuen com es compta aquest grau: si dubtes, mira el teu conveni col·lectiu, que sovint porta la seva pròpia taula. Per a l'hospitalització, l'Estatut inclou a més «el familiar consanguíneo de la pareja de hecho».`,
    },
    en: {
      h: "Who counts as a relative up to the second degree?",
      intro: `Since 26 November 2026, bereavement leave is ${death.days} working days for your spouse, registered partner or a first-degree blood relative (parents and children), and ${death2.days} working days (${death2.days + death2.travelExtra} if you have to travel) for a second-degree relative or an in-law. The ${illness.days}-day leave for an accident, serious illness or hospital stay covers relatives up to the second degree. The degree is counted as the Civil Code says: each generation is one degree, and between siblings, uncles or cousins you go up to the common ancestor and back down (arts. 918 and 919; official text in Spanish). It is the law all over Spain, Catalonia included.`,
      caption: "Kinship by blood (Civil Code, art. 918) and the Workers' Statute minimum leave (art. 37.3.b and b bis, the latter as worded by Royal Decree-law 42/2026, in force since 26 November 2026).",
      cols: ["Relative", "Degree", "Death (bereavement leave)", "Serious illness or hospital stay"],
      spouse: "Spouse or registered partner",
      named: "Named in the Statute",
      yesDeath: `${death.days} working days`,
      yesDeath2: `${death2.days} working days (${death2.days + death2.travelExtra} if you travel)`,
      yesIll: `${illness.days} days`,
      no: "Not by law (check your collective agreement)",
      noIll: "Not by law, unless they live with you and need your care",
      affinity: `By marriage (your spouse's family: parents-in-law, brothers- and sisters-in-law…) the Statute gives ${death2.days} working days of bereavement leave (${death2.days + death2.travelExtra} if you travel) for the first degree and the second alike, and the ${illness.days} days for a hospital stay up to the second degree; neither the Statute nor the Civil Code says how that degree is counted: if in doubt, check your collective agreement, which often has its own table. For a hospital stay, the Statute also covers “el familiar consanguíneo de la pareja de hecho” (your registered partner's blood relative).`,
    },
  });
  const degree = (n: number) => L(locale, { es: `${n}.º`, ca: ["1r", "2n", "3r", "4t"][n - 1]!, en: ["1st", "2nd", "3rd", "4th"][n - 1]! });
  const rows: [string, string, string, string][] = [
    [t.spouse, t.named, t.yesDeath, t.yesIll],
    ...KIN_DEGREES.map((k): [string, string, string, string] => [k[locale], degree(k.degree), k.degree === 1 ? t.yesDeath : k.degree === 2 ? t.yesDeath2 : t.no, k.degree <= 2 ? t.yesIll : t.noIll]),
  ];
  return (
    <>
      <h3 id="segundo-grado">{t.h}</h3>
      <p>{t.intro}</p>
      <div className="ci-table-scroll mt-4">
        <table className="ci-local-table ci-stack-table">
          <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{t.caption}</caption>
          <thead>
            <tr>
              {t.cols.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([who, deg, d, i]) => (
              <tr key={who}>
                <th scope="row" className="font-normal">
                  {who}
                </th>
                <td data-label={t.cols[1]}>{deg}</td>
                <td data-label={t.cols[2]}>{d}</td>
                <td data-label={t.cols[3]}>{i}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>{t.affinity}</p>
    </>
  );
}

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
    { what: "Fallecimiento (duelo) del cónyuge, pareja de hecho, padres o hijos (primer grado de consanguinidad)", time: `${R.death.days} días laborables, que puedes empezar en las ${BEREAVEMENT_START_WEEKS} semanas siguientes`, count: "Laborables (lo dice el Estatuto)", payer: "Empresa", article: "37.3.b bis" },
    { what: "Fallecimiento (duelo) de un familiar de primer grado por afinidad o de segundo grado (abuelos, nietos, hermanos, cuñados…)", time: `${R.death2.days} días laborables; ${R.death2.days + R.death2.travelExtra} si necesitas desplazarte`, count: "Laborables (lo dice el Estatuto)", payer: "Empresa", article: "37.3.b bis" },
    { what: "Traslado del domicilio habitual (mudanza)", time: `${R.move.days} día`, count: "«Día», sin precisar", payer: "Empresa", article: "37.3.c" },
    { what: "Deber inexcusable de carácter público y personal, incluido votar", time: "El tiempo indispensable", count: "—", payer: "Empresa (descontando la indemnización que cobres por ese deber)", article: "37.3.d" },
    { what: "Exámenes prenatales y preparación al parto; sesiones e informes previos a una adopción o acogimiento", time: "El tiempo indispensable, si es en horario de trabajo", count: "—", payer: "Empresa", article: "37.3.f" },
    { what: "No poder llegar al trabajo por restricciones de las autoridades, riesgo grave e inminente, catástrofe o fenómeno meteorológico adverso", time: `Hasta ${UNREACHABLE_WORK_DAYS} días, y después mientras dure`, count: "—", payer: "Empresa", article: "37.3.g" },
    { what: "Actos preparatorios de la donación de órganos o tejidos", time: "El tiempo indispensable, si es en horario de trabajo", count: "—", payer: "Empresa", article: "37.3.h" },
    { what: "Acompañar a la persona que recibe la prestación de ayuda para morir, si te ha designado (Ley Orgánica 3/2021)", time: "El día en que se realice", count: "—", payer: "Empresa", article: "37.3.i" },
    { what: "Fuerza mayor: motivo familiar urgente por enfermedad o accidente que exige tu presencia inmediata", time: `Horas equivalentes a ${FORCE_MAJEURE_DAYS_PER_YEAR} días al año, retribuidas`, count: "Por horas", payer: "Empresa", article: "37.9" },
    { what: "Lactancia", time: `${NURSING.hoursPerDay} hora al día hasta los ${NURSING.untilMonths} meses (o media hora menos de jornada, o acumulada en jornadas completas)`, count: "Por horas", payer: `Empresa (el Estatuto solo prevé reducir el sueldo de los ${NURSING.untilMonths} a los ${NURSING.sharedUntilMonths} meses, si los dos progenitores la ejercen igual; entonces paga la Seguridad Social)`, article: "37.4" },
    { what: "Vacaciones anuales", time: `Mínimo ${R.vacation.days} días naturales al año`, count: "Naturales (lo dice el Estatuto)", payer: "Empresa", article: "38.1" },
    { what: "Nacimiento y cuidado del menor (cada progenitor)", time: `${BIRTH.totalWeeks} semanas (${BIRTH.single.totalWeeks} en familia monoparental) por los nacimientos desde el 26 de noviembre de 2026, ${BIRTH.mandatoryWeeks} obligatorias tras el parto`, count: "Semanas", payer: `Seguridad Social (INSS), ${BIRTH.benefitPct} % de la base reguladora`, article: "48.4" },
    { what: "Permiso parental, hasta que el menor cumpla 8 años", time: `Hasta ${PARENTAL.weeks} semanas`, count: "Semanas", payer: "Nadie: sin sueldo por ley (salvo convenio)", article: "48 bis" },
  ];
  const ca: Row[] = [
    { what: "Matrimoni o registre de parella de fet", time: `${R.marriage.days} dies naturals`, count: "Naturals (ho diu l'Estatut)", payer: "Empresa", article: "37.3.a" },
    { what: "Accident o malaltia greu, hospitalització o intervenció sense hospitalització amb repòs a casa del cònjuge, parella de fet, familiars fins al 2n grau o qui convisqui amb tu i necessiti la teva cura", time: `${R.illness.days} dies`, count: "«Días», sense precisar", payer: "Empresa", article: "37.3.b" },
    { what: "Defunció (dol) del cònjuge, parella de fet, pares o fills (primer grau de consanguinitat)", time: `${R.death.days} dies laborables, que pots començar en les ${BEREAVEMENT_START_WEEKS} setmanes següents`, count: "Laborables (ho diu l'Estatut)", payer: "Empresa", article: "37.3.b bis" },
    { what: "Defunció (dol) d'un familiar de primer grau per afinitat o de segon grau (avis, néts, germans, cunyats…)", time: `${R.death2.days} dies laborables; ${R.death2.days + R.death2.travelExtra} si t'has de desplaçar`, count: "Laborables (ho diu l'Estatut)", payer: "Empresa", article: "37.3.b bis" },
    { what: "Trasllat del domicili habitual (mudança)", time: `${R.move.days} dia`, count: "«Día», sense precisar", payer: "Empresa", article: "37.3.c" },
    { what: "Deure inexcusable de caràcter públic i personal, inclòs votar", time: "El temps indispensable", count: "—", payer: "Empresa (descomptant la indemnització que cobris per aquest deure)", article: "37.3.d" },
    { what: "Exàmens prenatals i preparació al part; sessions i informes previs a una adopció o acolliment", time: "El temps indispensable, si és en horari de feina", count: "—", payer: "Empresa", article: "37.3.f" },
    { what: "No poder arribar a la feina per restriccions de les autoritats, risc greu i imminent, catàstrofe o fenomen meteorològic advers", time: `Fins a ${UNREACHABLE_WORK_DAYS} dies, i després mentre duri`, count: "—", payer: "Empresa", article: "37.3.g" },
    { what: "Actes preparatoris de la donació d'òrgans o teixits", time: "El temps indispensable, si és en horari de feina", count: "—", payer: "Empresa", article: "37.3.h" },
    { what: "Acompanyar la persona que rep la prestació d'ajuda per morir, si t'ha designat (Llei orgànica 3/2021)", time: "El dia en què es faci", count: "—", payer: "Empresa", article: "37.3.i" },
    { what: "Força major: motiu familiar urgent per malaltia o accident que exigeix la teva presència immediata", time: `Hores equivalents a ${FORCE_MAJEURE_DAYS_PER_YEAR} dies l'any, retribuïdes`, count: "Per hores", payer: "Empresa", article: "37.9" },
    { what: "Lactància", time: `${NURSING.hoursPerDay} hora al dia fins als ${NURSING.untilMonths} mesos (o mitja hora menys de jornada, o acumulada en jornades completes)`, count: "Per hores", payer: `Empresa (l'Estatut només preveu reduir el sou dels ${NURSING.untilMonths} als ${NURSING.sharedUntilMonths} mesos, si els dos progenitors l'exerceixen igual; aleshores paga la Seguretat Social)`, article: "37.4" },
    { what: "Vacances anuals", time: `Mínim ${R.vacation.days} dies naturals l'any`, count: "Naturals (ho diu l'Estatut)", payer: "Empresa", article: "38.1" },
    { what: "Naixement i cura del menor (cada progenitor)", time: `${BIRTH.totalWeeks} setmanes (${BIRTH.single.totalWeeks} en família monoparental) pels naixements des del 26 de novembre de 2026, ${BIRTH.mandatoryWeeks} obligatòries després del part`, count: "Setmanes", payer: `Seguretat Social (INSS), ${BIRTH.benefitPct} % de la base reguladora`, article: "48.4" },
    { what: "Permís parental, fins que el menor faci 8 anys", time: `Fins a ${PARENTAL.weeks} setmanes`, count: "Setmanes", payer: "Ningú: sense sou per llei (llevat de conveni)", article: "48 bis" },
  ];
  const en: Row[] = [
    { what: "Marriage or registering a civil partnership", time: `${R.marriage.days} calendar days`, count: "Calendar days (the Statute says so)", payer: "Employer", article: "37.3.a" },
    { what: "Serious accident or illness, hospitalisation, or outpatient surgery needing rest at home, of your spouse, partner, relatives up to the 2nd degree, or someone living with you who needs your care", time: `${R.illness.days} days`, count: "«Días», not specified", payer: "Employer", article: "37.3.b" },
    { what: "Bereavement: death of your spouse, partner, parents or children (first degree by blood)", time: `${R.death.days} working days, which you can start within the next ${BEREAVEMENT_START_WEEKS} weeks`, count: "Working days (the Statute says so)", payer: "Employer", article: "37.3.b bis" },
    { what: "Bereavement: death of a first-degree in-law or a second-degree relative (grandparents, grandchildren, siblings, brothers- and sisters-in-law…)", time: `${R.death2.days} working days; ${R.death2.days + R.death2.travelExtra} if you have to travel`, count: "Working days (the Statute says so)", payer: "Employer", article: "37.3.b bis" },
    { what: "Moving house", time: `${R.move.days} day`, count: "«Día», not specified", payer: "Employer", article: "37.3.c" },
    { what: "An unavoidable public and personal duty, voting included", time: "The time strictly needed", count: "—", payer: "Employer (less any allowance you get for that duty)", article: "37.3.d" },
    { what: "Antenatal check-ups and birth preparation classes; sessions and reports before an adoption or fostering", time: "The time strictly needed, if in working hours", count: "—", payer: "Employer", article: "37.3.f" },
    { what: "Being unable to reach work because of the authorities' restrictions, a serious and imminent risk, a catastrophe or adverse weather", time: `Up to ${UNREACHABLE_WORK_DAYS} days, then for as long as it lasts`, count: "—", payer: "Employer", article: "37.3.g" },
    { what: "Preparatory steps for an organ or tissue donation", time: "The time strictly needed, if in working hours", count: "—", payer: "Employer", article: "37.3.h" },
    { what: "Being with someone receiving assisted dying, if they chose you (Organic Law 3/2021)", time: "The day it takes place", count: "—", payer: "Employer", article: "37.3.i" },
    { what: "Force majeure: an urgent family matter, an illness or accident that needs you there at once", time: `Hours equal to ${FORCE_MAJEURE_DAYS_PER_YEAR} days a year, paid`, count: "In hours", payer: "Employer", article: "37.9" },
    { what: "Nursing (lactancia)", time: `${NURSING.hoursPerDay} hour a day until the baby is ${NURSING.untilMonths} months old (or a half-hour shorter day, or accumulated as full days)`, count: "In hours", payer: `Employer (the Statute only cuts pay from ${NURSING.untilMonths} to ${NURSING.sharedUntilMonths} months, when both parents take it the same way; Social Security then pays)`, article: "37.4" },
    { what: "Annual holidays", time: `At least ${R.vacation.days} calendar days a year`, count: "Calendar days (the Statute says so)", payer: "Employer", article: "38.1" },
    { what: "Birth and childcare leave (each parent)", time: `${BIRTH.totalWeeks} weeks (${BIRTH.single.totalWeeks} for a single parent) for births from 26 November 2026, ${BIRTH.mandatoryWeeks} mandatory after the birth`, count: "Weeks", payer: `Social Security (INSS), ${BIRTH.benefitPct}% of the base reguladora`, article: "48.4" },
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
    es: `El Estatuto de los Trabajadores te da, como mínimo, ${R.marriage.days} días naturales por boda o registro de pareja de hecho; ${R.illness.days} días por accidente, enfermedad grave, hospitalización o intervención con reposo de un familiar hasta segundo grado o de quien conviva contigo; ${R.death.days} días laborables por el fallecimiento del cónyuge, la pareja, los padres o los hijos, y ${R.death2.days} (${R.death2.days + R.death2.travelExtra} si tienes que desplazarte) por el de abuelos, nietos, hermanos o familia política hasta segundo grado; ${R.move.days} día por mudanza; horas equivalentes a ${FORCE_MAJEURE_DAYS_PER_YEAR} días al año por fuerza mayor, y ${R.vacation.days} días naturales de vacaciones. Todos los paga la empresa. El permiso por nacimiento es de ${BIRTH.totalWeeks} semanas por progenitor desde el 26 de noviembre de 2026 (${BIRTH.mandatoryWeeks} obligatorias tras el parto) y lo paga la Seguridad Social al ${BIRTH.benefitPct} %; el permiso parental de ${PARENTAL.weeks} semanas no se paga. Tu convenio puede mejorarlos.`,
    ca: `L'Estatut dels treballadors et dona, com a mínim, ${R.marriage.days} dies naturals per casament o registre de parella de fet; ${R.illness.days} dies per accident, malaltia greu, hospitalització o intervenció amb repòs d'un familiar fins al segon grau o de qui convisqui amb tu; ${R.death.days} dies laborables per la defunció del cònjuge, la parella, els pares o els fills, i ${R.death2.days} (${R.death2.days + R.death2.travelExtra} si t'has de desplaçar) per la d'avis, néts, germans o família política fins al segon grau; ${R.move.days} dia per mudança; hores equivalents a ${FORCE_MAJEURE_DAYS_PER_YEAR} dies l'any per força major, i ${R.vacation.days} dies naturals de vacances. Tots els paga l'empresa. El permís per naixement és de ${BIRTH.totalWeeks} setmanes per progenitor des del 26 de novembre de 2026 (${BIRTH.mandatoryWeeks} obligatòries després del part) i el paga la Seguretat Social al ${BIRTH.benefitPct} %; el permís parental de ${PARENTAL.weeks} setmanes no es paga. El teu conveni els pot millorar.`,
    en: `Spain's Workers' Statute gives you at least ${R.marriage.days} calendar days to marry or register a partnership; ${R.illness.days} days when a relative up to the second degree, or someone living with you, has a serious accident or illness, is in hospital or has surgery needing rest at home; ${R.death.days} working days for the death of your spouse, partner, parent or child, and ${R.death2.days} (${R.death2.days + R.death2.travelExtra} if you have to travel) for grandparents, grandchildren, siblings or in-laws up to the second degree; ${R.move.days} day to move house; hours equal to ${FORCE_MAJEURE_DAYS_PER_YEAR} days a year for force majeure; and ${R.vacation.days} calendar days of holiday. Your employer pays all of them. Birth leave is ${BIRTH.totalWeeks} weeks per parent since 26 November 2026 (${BIRTH.mandatoryWeeks} mandatory after the birth), paid by Social Security at ${BIRTH.benefitPct}%; the ${PARENTAL.weeks}-week parental leave is unpaid. Your collective agreement can improve them.`,
  });
  const fresh = L(locale, {
    es: `Normas revisadas el ${asOf} en el BOE (Estatuto de los Trabajadores, actualización del 25 de noviembre de 2026, con el Real Decreto-ley 42/2026 en vigor desde el 26 de noviembre; Ley General de la Seguridad Social) y en la Seguridad Social.`,
    ca: `Normes revisades el ${asOf} al BOE (Estatut dels treballadors, actualització del 25 de novembre de 2026, amb el Reial decret llei 42/2026 en vigor des del 26 de novembre; Llei general de la Seguretat Social) i a la Seguretat Social.`,
    en: `Rules checked on ${asOf} in the BOE (Workers' Statute, consolidated 25 November 2026, with Royal Decree-law 42/2026 in force since 26 November; General Social Security Act) and with Social Security.`,
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
      `El Estatuto dice «naturales» en el permiso por matrimonio (art. 37.3.a) y en las vacaciones (art. 38.1), y desde el 26 de noviembre de 2026 dice «laborables» en el permiso por duelo (art. 37.3.b bis, Real Decreto-ley 42/2026): ${R.death.days} o ${R.death2.days} días laborables, que puedes empezar cualquier día de las ${BEREAVEMENT_START_WEEKS} semanas siguientes al fallecimiento. En los permisos por accidente, enfermedad u hospitalización de un familiar y por mudanza dice solo «días», sin «hábiles» ni «laborables», y no dice qué día empiezan.`,
      `Por eso la calculadora te da los dos cómputos. En el ejemplo de arriba, ${R.illness.days} días desde el ${D(DEFAULT_INPUT.start)}: contados seguidos terminan el ${D(ex.short.lastCalendar)}; contando solo días laborables de lunes a viernes con los festivos de ${placeName}, el ${D(w.last)}. Muchos convenios colectivos lo concretan: mira el tuyo.`,
    ],
    ca: [
      `L'Estatut diu «naturales» (naturals) en el permís per matrimoni (art. 37.3.a) i en les vacances (art. 38.1), i des del 26 de novembre de 2026 diu «laborables» en el permís per dol (art. 37.3.b bis, Reial decret llei 42/2026): ${R.death.days} o ${R.death2.days} dies laborables, que pots començar qualsevol dia de les ${BEREAVEMENT_START_WEEKS} setmanes posteriors a la defunció. En els permisos per accident, malaltia o hospitalització d'un familiar i per mudança diu només «días» (dies), sense «hábiles» ni «laborables», i no diu quin dia comencen.`,
      `Per això la calculadora et dona els dos còmputs. En l'exemple de dalt, ${R.illness.days} dies des del ${D(DEFAULT_INPUT.start)}: comptats seguits acaben el ${D(ex.short.lastCalendar)}; comptant només dies laborables de dilluns a divendres amb els festius de ${placeName}, el ${D(w.last)}. Molts convenis col·lectius ho concreten: mira el teu.`,
    ],
    en: [
      `The Statute says «naturales» (calendar days) for marriage leave (art. 37.3.a) and holidays (art. 38.1), and since 26 November 2026 it says «laborables» (working days) for bereavement leave (art. 37.3.b bis, Royal Decree-law 42/2026): ${R.death.days} or ${R.death2.days} working days, which you can start on any day in the ${BEREAVEMENT_START_WEEKS} weeks after the death. For a relative's accident, illness or hospitalisation and for moving house it says just «días» (days), with no «hábiles» or «laborables», and it does not say on which day they start.`,
      `That is why the calculator gives you both counts. In the example above, ${R.illness.days} days from ${D(DEFAULT_INPUT.start)}: counted consecutively they end on ${D(ex.short.lastCalendar)}; counting Monday-to-Friday working days with the holidays of ${placeName}, on ${D(w.last)}. Many collective agreements settle it: check yours.`,
    ],
  });

  const birthText = L(locale, {
    es: {
      intro: `Desde el Real Decreto-ley 42/2026 (BOE del 25 de noviembre de 2026, en vigor el 26), el permiso por nacimiento y cuidado del menor es de ${BIRTH.totalWeeks} semanas para cada progenitor, y de ${BIRTH.single.totalWeeks} en las familias monoparentales, por los nacimientos desde el 26 de noviembre de 2026 (antes eran ${BIRTH.before.totalWeeks} y ${BIRTH.before.single.totalWeeks}, del Real Decreto-ley 9/2025). Se reparte así:`,
      items: [
        `${BIRTH.mandatoryWeeks} semanas obligatorias, seguidas y a jornada completa, justo después del parto.`,
        `${BIRTH.flexibleWeeks} semanas (${BIRTH.single.flexibleWeeks} en familia monoparental) que puedes repartir por semanas, seguidas o sueltas, desde el final de las obligatorias hasta que el bebé cumpla 12 meses. La madre biológica puede adelantarlas hasta ${BIRTH.beforeDueWeeks} semanas antes de la fecha prevista del parto.`,
        `${BIRTH.childcareWeeks} semanas (${BIRTH.single.childcareWeeks}) que puedes usar por semanas hasta que cumpla 8 años.`,
      ],
      example: `Ejemplo: con un nacimiento el ${D(b.birth)}, las semanas obligatorias van hasta el ${D(b.mandatoryEnd)}; las ${b.flexibleWeeks} siguientes se pueden usar hasta el ${dmy(b.flexibleUntil)} (si las coges seguidas, terminas el ${D(b.continuousEnd)}), y las ${b.childcareWeeks} últimas, hasta el ${dmy(b.childcareUntil)}. Las semanas a repartir se pueden disfrutar a jornada parcial si lo acuerdas con la empresa, avisando con ${BIRTH.noticeDays} días de antelación.`,
      pay: `Durante el permiso no cobras salario: la Seguridad Social (INSS) paga una prestación del ${BIRTH.benefitPct} % de tu base reguladora (la base de cotización por contingencias comunes, normalmente la del mes anterior al previo al parto, dividida entre sus días). La pide cada progenitor; hay que cumplir un periodo mínimo de cotización según la edad (ninguno si tienes menos de 21 años).`,
      transitional: `La semana nueva (la tercera de las que se usan hasta los 8 años; dos más en familia monoparental) vale para los nacimientos desde el 26 de noviembre de 2026 y se puede pedir a partir del 1 de marzo de 2027, sin un nuevo reconocimiento del derecho. Las dos semanas anteriores hasta los 8 años, del Real Decreto-ley 9/2025, valen para los nacimientos desde el 2 de agosto de 2024:`,
      more: `Si el bebé está hospitalizado más de siete días tras el parto, el permiso se amplía tantos días como dure el ingreso, con un máximo de ${BIRTH.hospitalMaxExtraWeeks} semanas. Por discapacidad del hijo o por cada hijo a partir del segundo en un parto múltiple hay ${BIRTH.extraWeeksPerCase} semanas más, una para cada progenitor. Las vacaciones que coincidan con el permiso se disfrutan después, aunque haya terminado el año (art. 38.3).`,
    },
    ca: {
      intro: `Des del Reial decret llei 42/2026 (BOE del 25 de novembre de 2026, en vigor el 26), el permís per naixement i cura del menor és de ${BIRTH.totalWeeks} setmanes per a cada progenitor, i de ${BIRTH.single.totalWeeks} en les famílies monoparentals, pels naixements des del 26 de novembre de 2026 (abans eren ${BIRTH.before.totalWeeks} i ${BIRTH.before.single.totalWeeks}, del Reial decret llei 9/2025). Es reparteix així:`,
      items: [
        `${BIRTH.mandatoryWeeks} setmanes obligatòries, seguides i a jornada completa, just després del part.`,
        `${BIRTH.flexibleWeeks} setmanes (${BIRTH.single.flexibleWeeks} en família monoparental) que pots repartir per setmanes, seguides o soltes, des del final de les obligatòries fins que el nadó faci 12 mesos. La mare biològica les pot avançar fins a ${BIRTH.beforeDueWeeks} setmanes abans de la data prevista del part.`,
        `${BIRTH.childcareWeeks} setmanes (${BIRTH.single.childcareWeeks}) que pots fer servir per setmanes fins que faci 8 anys.`,
      ],
      example: `Exemple: amb un naixement el ${D(b.birth)}, les setmanes obligatòries van fins al ${D(b.mandatoryEnd)}; les ${b.flexibleWeeks} següents es poden fer servir fins al ${dmy(b.flexibleUntil)} (si les agafes seguides, acabes el ${D(b.continuousEnd)}), i les ${b.childcareWeeks} últimes, fins al ${dmy(b.childcareUntil)}. Les setmanes a repartir es poden gaudir a jornada parcial si ho acordes amb l'empresa, avisant amb ${BIRTH.noticeDays} dies d'antelació.`,
      pay: `Durant el permís no cobres salari: la Seguretat Social (INSS) paga una prestació del ${BIRTH.benefitPct} % de la teva base reguladora (la base de cotització per contingències comunes, normalment la del mes anterior al previ al part, dividida entre els seus dies). La demana cada progenitor; cal complir un període mínim de cotització segons l'edat (cap si tens menys de 21 anys).`,
      transitional: `La setmana nova (la tercera de les que es fan servir fins als 8 anys; dues més en família monoparental) val per als naixements des del 26 de novembre de 2026 i es pot demanar a partir de l'1 de març de 2027, sense un nou reconeixement del dret. Les dues setmanes anteriors fins als 8 anys, del Reial decret llei 9/2025, valen per als naixements des del 2 d'agost de 2024:`,
      more: `Si el nadó està hospitalitzat més de set dies després del part, el permís s'amplia tants dies com duri l'ingrés, amb un màxim de ${BIRTH.hospitalMaxExtraWeeks} setmanes. Per discapacitat del fill o per cada fill a partir del segon en un part múltiple hi ha ${BIRTH.extraWeeksPerCase} setmanes més, una per a cada progenitor. Les vacances que coincideixin amb el permís es gaudeixen després, encara que hagi acabat l'any (art. 38.3).`,
    },
    en: {
      intro: `Since Royal Decree-law 42/2026 (BOE, 25 November 2026, in force on the 26th), birth and childcare leave is ${BIRTH.totalWeeks} weeks for each parent, and ${BIRTH.single.totalWeeks} for a single parent, for births from 26 November 2026 (before, ${BIRTH.before.totalWeeks} and ${BIRTH.before.single.totalWeeks}, under Royal Decree-law 9/2025). It is split like this:`,
      items: [
        `${BIRTH.mandatoryWeeks} mandatory weeks, in a row and full time, right after the birth.`,
        `${BIRTH.flexibleWeeks} weeks (${BIRTH.single.flexibleWeeks} for a single parent) you can spread out in whole weeks, together or apart, from the end of the mandatory ones until the baby is 12 months old. The biological mother can start them up to ${BIRTH.beforeDueWeeks} weeks before the due date.`,
        `${BIRTH.childcareWeeks} weeks (${BIRTH.single.childcareWeeks}) you can use in whole weeks until the child turns 8.`,
      ],
      example: `Example: for a birth on ${D(b.birth)}, the mandatory weeks run to ${D(b.mandatoryEnd)}; the next ${b.flexibleWeeks} can be used until ${dmy(b.flexibleUntil)} (taken in a row, you finish on ${D(b.continuousEnd)}), and the last ${b.childcareWeeks} until ${dmy(b.childcareUntil)}. The weeks you spread out can be taken part time if your employer agrees, with ${BIRTH.noticeDays} days' notice.`,
      pay: `You get no salary during the leave: Social Security (the INSS) pays a benefit of ${BIRTH.benefitPct}% of your daily base (the common-contingencies contribution base, normally that of the month before last before the birth, divided by its days). Each parent applies; there is a minimum contribution period by age (none under 21).`,
      transitional: `The new week (the third of those usable until age 8; two more for a single parent) applies to births from 26 November 2026 and can be requested from 1 March 2027, without a new award of the right. The two earlier weeks until age 8, from Royal Decree-law 9/2025, apply to births from 2 August 2024:`,
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
      { q: "¿Cuántos días de permiso hay por fallecimiento de un familiar?", a: `Desde el 26 de noviembre de 2026 (Real Decreto-ley 42/2026), ${R.death.days} días laborables por el fallecimiento del cónyuge, la pareja de hecho, el padre, la madre o un hijo, y ${R.death2.days} días laborables por un familiar de segundo grado o por afinidad hasta el segundo grado (${R.death2.days + R.death2.travelExtra} si tienes que desplazarte). Puedes empezarlo cualquier día de las ${BEREAVEMENT_START_WEEKS} semanas siguientes al fallecimiento. Lo paga la empresa. Antes eran ${SHORT_RULES_BEFORE.days} días (${SHORT_RULES_BEFORE.days + SHORT_RULES_BEFORE.travelExtra} con desplazamiento).` },
      { q: "¿Cuántos días de permiso por fallecimiento hay en Cataluña?", a: `Los mismos que en toda España: el Estatuto de los Trabajadores es ley laboral del Estado (el Real Decreto-ley 42/2026 se dicta como «${QUOTE.rdl42competence}»). En Cataluña, ${R.death.days} días laborables por el cónyuge, la pareja de hecho, los padres o los hijos, y ${R.death2.days} (${R.death2.days + R.death2.travelExtra} con desplazamiento) por abuelos, nietos, hermanos o familia política hasta segundo grado, con los festivos de Cataluña fuera del cómputo. Tu convenio puede dar más.` },
      { q: "¿Cuántos días me dan por fallecimiento de un abuelo, un nieto o un hermano?", a: `${R.death2.days} días laborables, o ${R.death2.days + R.death2.travelExtra} si tienes que desplazarte: son familiares de segundo grado de consanguinidad (Código Civil, art. 918). Lo mismo por un familiar de primer o segundo grado por afinidad. Los paga la empresa.` },
      { q: "¿Cuántos días me dan por hospitalización de un familiar?", a: `${R.illness.days} días, por hospitalización, accidente o enfermedad grave, o una intervención sin ingreso que necesite reposo en casa, de un familiar hasta segundo grado, tu pareja o alguien que conviva contigo y necesite tu cuidado.` },
      { q: "¿Los días de permiso son naturales o laborables?", a: daysText[0] },
      { q: "¿Cuántas semanas es el permiso de paternidad en 2026?", a: `Por los nacimientos desde el 26 de noviembre de 2026, ${BIRTH.totalWeeks} semanas para cada progenitor (${BIRTH.single.totalWeeks} en familia monoparental): ${BIRTH.mandatoryWeeks} obligatorias tras el parto, ${BIRTH.flexibleWeeks} hasta que el bebé cumpla un año y ${BIRTH.childcareWeeks} hasta los 8 años; la semana nueva se puede pedir desde el 1 de marzo de 2027 (Real Decreto-ley 42/2026). Por los nacimientos anteriores, ${BIRTH.before.totalWeeks} semanas (${BIRTH.before.single.totalWeeks}). Lo paga la Seguridad Social al ${BIRTH.benefitPct} % de la base reguladora.` },
      { q: "¿El permiso parental de 8 semanas es retribuido?", a: parentalText },
      { q: "¿Cuántos días de permiso hay por boda?", a: `${R.marriage.days} días naturales por matrimonio o por inscribirte como pareja de hecho, pagados por la empresa.` },
      { q: "¿Hay permiso por mudanza?", a: `Sí: ${R.move.days} día por traslado del domicilio habitual, pagado.` },
    ],
    ca: [
      { q: "Quants dies de permís hi ha per defunció d'un familiar?", a: `Des del 26 de novembre de 2026 (Reial decret llei 42/2026), ${R.death.days} dies laborables per la defunció del cònjuge, la parella de fet, el pare, la mare o un fill, i ${R.death2.days} dies laborables per un familiar de segon grau o per afinitat fins al segon grau (${R.death2.days + R.death2.travelExtra} si t'has de desplaçar). El pots començar qualsevol dia de les ${BEREAVEMENT_START_WEEKS} setmanes posteriors a la defunció. El paga l'empresa. Abans eren ${SHORT_RULES_BEFORE.days} dies (${SHORT_RULES_BEFORE.days + SHORT_RULES_BEFORE.travelExtra} amb desplaçament).` },
      { q: "Quants dies de permís per defunció hi ha a Catalunya?", a: `Els mateixos que a tot Espanya: l'Estatut dels treballadors és llei laboral de l'Estat (el Reial decret llei 42/2026 es dicta com a «${QUOTE.rdl42competence}», legislació laboral). A Catalunya, ${R.death.days} dies laborables pel cònjuge, la parella de fet, els pares o els fills, i ${R.death2.days} (${R.death2.days + R.death2.travelExtra} amb desplaçament) per avis, néts, germans o família política fins al segon grau, amb els festius de Catalunya fora del còmput. El teu conveni en pot donar més.` },
      { q: "Quants dies em donen per la mort d'un avi, un nét o un germà?", a: `${R.death2.days} dies laborables, o ${R.death2.days + R.death2.travelExtra} si t'has de desplaçar: són familiars de segon grau de consanguinitat (Codi civil, art. 918). El mateix per un familiar de primer o segon grau per afinitat. Els paga l'empresa.` },
      { q: "Quants dies em donen per hospitalització d'un familiar?", a: `${R.illness.days} dies, per hospitalització, accident o malaltia greu, o una intervenció sense ingrés que necessiti repòs a casa, d'un familiar fins al segon grau, la teva parella o algú que convisqui amb tu i necessiti la teva cura.` },
      { q: "Els dies de permís són naturals o laborables?", a: daysText[0] },
      { q: "Quantes setmanes és el permís de paternitat el 2026?", a: `Pels naixements des del 26 de novembre de 2026, ${BIRTH.totalWeeks} setmanes per a cada progenitor (${BIRTH.single.totalWeeks} en família monoparental): ${BIRTH.mandatoryWeeks} obligatòries després del part, ${BIRTH.flexibleWeeks} fins que el nadó faci un any i ${BIRTH.childcareWeeks} fins als 8 anys; la setmana nova es pot demanar des de l'1 de març de 2027 (Reial decret llei 42/2026). Pels naixements anteriors, ${BIRTH.before.totalWeeks} setmanes (${BIRTH.before.single.totalWeeks}). El paga la Seguretat Social al ${BIRTH.benefitPct} % de la base reguladora.` },
      { q: "El permís parental de 8 setmanes és retribuït?", a: parentalText },
      { q: "Quants dies de permís hi ha per casament?", a: `${R.marriage.days} dies naturals per matrimoni o per inscriure't com a parella de fet, pagats per l'empresa.` },
      { q: "Hi ha permís per mudança?", a: `Sí: ${R.move.days} dia per trasllat del domicili habitual, pagat.` },
    ],
    en: [
      { q: "How many days of leave do you get when a relative dies in Spain?", a: `Since 26 November 2026 (Royal Decree-law 42/2026), ${R.death.days} working days for the death of a spouse, registered partner, parent or child, and ${R.death2.days} working days for a second-degree relative or an in-law up to the second degree (${R.death2.days + R.death2.travelExtra} if you have to travel). You can start it on any day in the ${BEREAVEMENT_START_WEEKS} weeks after the death. Your employer pays it. Before, it was ${SHORT_RULES_BEFORE.days} days (${SHORT_RULES_BEFORE.days + SHORT_RULES_BEFORE.travelExtra} with travel).` },
      { q: "How many days of bereavement leave are there in Catalonia?", a: `The same as in the rest of Spain: the Workers' Statute is State labour law (Royal Decree-law 42/2026 is passed as «${QUOTE.rdl42competence}», labour legislation). In Catalonia, ${R.death.days} working days for a spouse, registered partner, parent or child, and ${R.death2.days} (${R.death2.days + R.death2.travelExtra} if you travel) for grandparents, grandchildren, siblings or in-laws up to the second degree, with Catalonia's holidays left out of the count. Your collective agreement can give more.` },
      { q: "How many days off when a grandparent, grandchild or sibling dies?", a: `${R.death2.days} working days, or ${R.death2.days + R.death2.travelExtra} if you have to travel: they are second-degree blood relatives (Civil Code, art. 918). The same for a first- or second-degree in-law. Your employer pays them.` },
      { q: "How many days for a relative in hospital?", a: `${R.illness.days} days, for hospitalisation, a serious accident or illness, or outpatient surgery needing rest at home, of a relative up to the second degree, your partner, or someone living with you who needs your care.` },
      { q: "Are leave days calendar days or working days?", a: daysText[0] },
      { q: "How long is paternity and maternity leave in Spain in 2026?", a: `For births from 26 November 2026, ${BIRTH.totalWeeks} weeks for each parent (${BIRTH.single.totalWeeks} for a single parent): ${BIRTH.mandatoryWeeks} mandatory after the birth, ${BIRTH.flexibleWeeks} until the baby turns one and ${BIRTH.childcareWeeks} until age 8; the new week can be requested from 1 March 2027 (Royal Decree-law 42/2026). For earlier births, ${BIRTH.before.totalWeeks} weeks (${BIRTH.before.single.totalWeeks}). Social Security pays ${BIRTH.benefitPct}% of the daily base.` },
      { q: "Is the 8-week parental leave paid?", a: parentalText },
      { q: "How many days off to get married?", a: `${R.marriage.days} calendar days for marriage or registering a civil partnership, paid by your employer.` },
      { q: "Is there leave to move house?", a: `Yes: ${R.move.days} day to move your usual home, paid.` },
    ],
  });

  const changes = L(locale, {
    es: {
      h: "Qué cambia desde el 26 de noviembre de 2026",
      items: [
        `Fallecimiento: el permiso pasa a llamarse permiso por duelo y sube de ${SHORT_RULES_BEFORE.days} días (${SHORT_RULES_BEFORE.days + SHORT_RULES_BEFORE.travelExtra} con desplazamiento) a ${R.death.days} días laborables por el cónyuge, la pareja de hecho, el padre, la madre o un hijo, y a ${R.death2.days} días laborables (${R.death2.days + R.death2.travelExtra} con desplazamiento) por los demás familiares hasta el segundo grado. Se puede empezar cualquier día de las ${BEREAVEMENT_START_WEEKS} semanas siguientes.`,
        `Nacimiento: de ${BIRTH.before.totalWeeks} a ${BIRTH.totalWeeks} semanas por progenitor (de ${BIRTH.before.single.totalWeeks} a ${BIRTH.single.totalWeeks} en familia monoparental) por los nacimientos desde el 26 de noviembre de 2026; la semana nueva es de las que se usan hasta los 8 años y se puede pedir desde el 1 de marzo de 2027.`,
        "Un permiso nuevo: el día de la prestación de ayuda para morir, para la persona que la recibe haya designado para acompañarla (art. 37.3.i).",
      ],
      status: `Lo dispone el Real Decreto-ley 42/2026, de 24 de noviembre (BOE del 25), en vigor desde el 26 de noviembre de 2026. Un real decreto-ley se aplica desde ese día, pero el Congreso tiene que votarlo en los 30 días siguientes a su promulgación: a ${asOf}, la ficha del BOE no recoge ninguna convalidación.`,
    },
    ca: {
      h: "Què canvia des del 26 de novembre de 2026",
      items: [
        `Defunció: el permís passa a dir-se permís per dol i puja de ${SHORT_RULES_BEFORE.days} dies (${SHORT_RULES_BEFORE.days + SHORT_RULES_BEFORE.travelExtra} amb desplaçament) a ${R.death.days} dies laborables pel cònjuge, la parella de fet, el pare, la mare o un fill, i a ${R.death2.days} dies laborables (${R.death2.days + R.death2.travelExtra} amb desplaçament) pels altres familiars fins al segon grau. Es pot començar qualsevol dia de les ${BEREAVEMENT_START_WEEKS} setmanes següents.`,
        `Naixement: de ${BIRTH.before.totalWeeks} a ${BIRTH.totalWeeks} setmanes per progenitor (de ${BIRTH.before.single.totalWeeks} a ${BIRTH.single.totalWeeks} en família monoparental) pels naixements des del 26 de novembre de 2026; la setmana nova és de les que es fan servir fins als 8 anys i es pot demanar des de l'1 de març de 2027.`,
        "Un permís nou: el dia de la prestació d'ajuda per morir, per a la persona que qui la rep hagi designat per acompanyar-la (art. 37.3.i).",
      ],
      status: `Ho disposa el Reial decret llei 42/2026, de 24 de novembre (BOE del 25), en vigor des del 26 de novembre de 2026. Un reial decret llei s'aplica des d'aquell dia, però el Congrés l'ha de votar en els 30 dies següents a la seva promulgació: a ${asOf}, la fitxa del BOE no recull cap convalidació.`,
    },
    en: {
      h: "What changes from 26 November 2026",
      items: [
        `Death of a relative: the leave is renamed bereavement leave and goes from ${SHORT_RULES_BEFORE.days} days (${SHORT_RULES_BEFORE.days + SHORT_RULES_BEFORE.travelExtra} with travel) to ${R.death.days} working days for a spouse, registered partner, parent or child, and to ${R.death2.days} working days (${R.death2.days + R.death2.travelExtra} with travel) for other relatives up to the second degree. It can start on any day in the next ${BEREAVEMENT_START_WEEKS} weeks.`,
        `Birth: from ${BIRTH.before.totalWeeks} to ${BIRTH.totalWeeks} weeks per parent (from ${BIRTH.before.single.totalWeeks} to ${BIRTH.single.totalWeeks} for a single parent) for births from 26 November 2026; the new week is one of those usable until age 8 and can be requested from 1 March 2027.`,
        "A new leave: the day of an assisted death, for the person chosen by the one receiving it to be with them (art. 37.3.i).",
      ],
      status: `This is Royal Decree-law 42/2026 of 24 November (BOE, 25 November), in force since 26 November 2026. A royal decree-law applies from that day, but Congress has to vote on it within 30 days of its enactment: as of ${asOf}, the BOE record shows no ratification.`,
    },
  });

  const sourceList = [SOURCES.et, SOURCES.rdl42, SOURCES.ce, SOURCES.rdl5, SOURCES.rdl9, SOURCES.rdl9convalidation, SOURCES.lgss, SOURCES.ssBirth, SOURCES.cc];
  const sourcesLead = L(locale, {
    es: `Leído el ${asOf} en los textos consolidados del BOE y en la web de la Seguridad Social. Las citas son literales, en castellano.`,
    ca: `Llegit el ${asOf} als textos consolidats del BOE i al web de la Seguretat Social. Les cites són literals, en castellà.`,
    en: `Read on ${asOf} in the BOE consolidated texts and on the Social Security website. Quotes are verbatim, in Spanish.`,
  });
  const limits = L(locale, {
    es: [
      `Funcionarios y personal estatutario: tienen sus propios permisos en el Estatuto Básico del Empleado Público (por fallecimiento, desde el Real Decreto-ley 42/2026, ${CIVIL_SERVANT_BEREAVEMENT.close} días hábiles por el cónyuge, la pareja o un familiar de primer grado de consanguinidad, y ${CIVIL_SERVANT_BEREAVEMENT.otherSameTown} o ${CIVIL_SERVANT_BEREAVEMENT.otherOtherTown} días hábiles, en la misma localidad o en otra, por los demás hasta el segundo grado; art. 48 a bis). Tampoco incluye empleadas de hogar, autónomos ni relaciones laborales especiales.`,
      "Las mejoras de tu convenio colectivo: la calculadora usa solo el mínimo legal.",
      "Las fiestas locales de tu municipio en el cómputo de días laborables (solo nacionales y de la comunidad). Para tu municipio, usa la calculadora de días hábiles.",
      "Adopción, guarda y acogimiento (mismas semanas, contadas desde la resolución), las ampliaciones por hospitalización, discapacidad o parto múltiple, y el cálculo del importe de la prestación por nacimiento.",
      "Cuándo empieza cada permiso si el hecho ocurre en un día que no trabajas: el Estatuto no lo dice.",
    ],
    ca: [
      `Funcionaris i personal estatutari: tenen els seus propis permisos a l'Estatut bàsic de l'empleat públic (per defunció, des del Reial decret llei 42/2026, ${CIVIL_SERVANT_BEREAVEMENT.close} dies hàbils pel cònjuge, la parella o un familiar de primer grau de consanguinitat, i ${CIVIL_SERVANT_BEREAVEMENT.otherSameTown} o ${CIVIL_SERVANT_BEREAVEMENT.otherOtherTown} dies hàbils, a la mateixa localitat o en una altra, pels altres fins al segon grau; art. 48 a bis). Tampoc inclou treballadores de la llar, autònoms ni relacions laborals especials.`,
      "Les millores del teu conveni col·lectiu: la calculadora fa servir només el mínim legal.",
      "Les festes locals del teu municipi en el còmput de dies laborables (només estatals i de la comunitat). Per al teu municipi, fes servir la calculadora de dies hàbils.",
      "Adopció, guarda i acolliment (mateixes setmanes, comptades des de la resolució), les ampliacions per hospitalització, discapacitat o part múltiple, i el càlcul de l'import de la prestació per naixement.",
      "Quan comença cada permís si el fet passa un dia que no treballes: l'Estatut no ho diu.",
    ],
    en: [
      `Civil servants and statutory staff: their leave is in the Basic Statute of Public Employees (for a death, since Royal Decree-law 42/2026, ${CIVIL_SERVANT_BEREAVEMENT.close} working days for a spouse, partner or first-degree blood relative, and ${CIVIL_SERVANT_BEREAVEMENT.otherSameTown} or ${CIVIL_SERVANT_BEREAVEMENT.otherOtherTown} working days, in the same town or another, for the others up to the second degree; art. 48 a bis). Nor does it cover domestic workers, the self-employed or special employment relationships.`,
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
    publisher: { "@id": ORGANIZATION_ID },
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
              <CalculatorNextStep current="paid-leave" locale={locale} />

              <h2 id="cambios-26-noviembre">{changes.h}</h2>
              <ul>
                {changes.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
              <p>{changes.status}</p>
              {quote(QUOTE.rdl42inForce, SOURCES.rdl42.url, `Real Decreto-ley 42/2026, disposición final quinta (${SOURCES.rdl42.ref})`)}
              {quote(QUOTE.ce86, SOURCES.ce.url, L(locale, { es: "Constitución Española, art. 86.2", ca: "Constitució espanyola, art. 86.2", en: "Spanish Constitution, art. 86.2" }))}

              <AdSlot kind="top" locale={locale} path={crumbPath(crumbs)} />
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
                      <tr key={r.what}>
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

              <KinTable locale={locale} />
              {quote(QUOTE.cc918, SOURCES.cc.url, L(locale, { es: "Código Civil, art. 918", ca: "Codi civil espanyol, art. 918", en: "Spanish Civil Code, art. 918" }) + ` (${SOURCES.cc.ref})`)}
              {quote(QUOTE.cc919, SOURCES.cc.url, L(locale, { es: "Código Civil, art. 919", ca: "Codi civil espanyol, art. 919", en: "Spanish Civil Code, art. 919" }) + ` (${SOURCES.cc.ref})`)}

              <h2 id="naturales-o-laborables">{h.days}</h2>
              <p>{daysText[0]}</p>
              {quote(QUOTE.marriage, SOURCES.et.url, `${et("37.3.a")} ${etRef}`)}
              {quote(QUOTE.illness, SOURCES.et.url, `${et("37.3.b")} ${etRef}`)}
              {quote(QUOTE.death, SOURCES.rdl42.url, `${et("37.3.b bis")} (Real Decreto-ley 42/2026, ${SOURCES.rdl42.ref})`)}
              {quote(QUOTE.deathStart, SOURCES.rdl42.url, `${et("37.3.b bis")} (Real Decreto-ley 42/2026, ${SOURCES.rdl42.ref})`)}
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
              {quote(QUOTE.birth, SOURCES.rdl42.url, `${et("48.4")} (Real Decreto-ley 42/2026, ${SOURCES.rdl42.ref})`)}
              {quote(QUOTE.birthSingle, SOURCES.rdl42.url, `${et("48.4")} (Real Decreto-ley 42/2026, ${SOURCES.rdl42.ref})`)}
              {quote(QUOTE.birthMandatory, SOURCES.et.url, `${et("48.4.a")} ${etRef}`)}
              {quote(QUOTE.birthFlexible, SOURCES.et.url, `${et("48.4.b")} ${etRef}`)}
              {quote(QUOTE.birthChildcare, SOURCES.rdl42.url, `${et("48.4.c")} (Real Decreto-ley 42/2026, ${SOURCES.rdl42.ref})`)}
              <p>{birthText.example}</p>
              <p>{birthText.pay}</p>
              {quote(QUOTE.benefit, SOURCES.lgss.url, L(locale, { es: "Ley General de la Seguridad Social, art. 179.1", ca: "Llei general de la Seguretat Social, art. 179.1", en: "General Social Security Act, art. 179.1" }) + ` (${SOURCES.lgss.ref})`)}
              {quote(QUOTE.ssTax, SOURCES.ssBirth.url, `${SOURCES.ssBirth.name} (${dmy(SOURCES.ssBirth.date)})`)}
              <p>{birthText.transitional}</p>
              {quote(QUOTE.rdl42transitional, SOURCES.rdl42.url, `Real Decreto-ley 42/2026, disposición transitoria única (${SOURCES.rdl42.ref})`)}
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
              <SourcesPolicyLink locale={locale} />

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
