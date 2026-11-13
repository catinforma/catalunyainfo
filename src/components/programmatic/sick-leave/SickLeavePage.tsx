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
import { CALC_COPY, bandDays, money, monthYear, ofMonthYear, payerText, percent, sickLeaveEditions, sickLeavePath, type SlLocale } from "@/lib/programmatic/sick-leave/copy";
import { DEFAULT_INPUT, calculateSickLeave, referenceMonth, type Band, type Contingency, type SickLeaveResult, type SpecialKind } from "@/lib/programmatic/sick-leave/engine";
import { DAYS, MAX_BASE_2026, OFFICIAL_LINKS, PCT, QUOTE, REFORM_FROM, RULES_AS_OF, SOURCES } from "@/lib/programmatic/sick-leave/rules";
import { absoluteUrl } from "@/lib/site";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { SickLeaveCalculator } from "./SickLeaveCalculator";

/**
 * "Calculadora de baja laboral" / "Calculadora de baixa laboral" / "Spain
 * sick pay calculator": the calculator (server-rendered with the default
 * example), then the percentages per day and who pays, what Royal
 * Decree-law 31/2026 changes on 1 December 2026, the base reguladora, the
 * special situations, duration, tax, questions, sources and limits. Every
 * figure comes from rules.ts through the engine.
 */

const L = <T,>(locale: SlLocale, v: Record<SlLocale, T>): T => v[locale];

/** A day before the reform, for the "until 30 November" schedules. */
const BEFORE_REFORM = "2026-11-02";

export const SL_META: Record<SlLocale, { title: string; description: string; h1: string; breadcrumb: string; appName: string }> = {
  es: {
    title: "Calculadora de baja laboral: cuánto cobras de baja",
    description: "Calcula cuánto cobras de baja por enfermedad o accidente: 60 % del día 4 al 20, 75 % desde el 21, quién paga cada día y los cambios del 1 de diciembre de 2026.",
    h1: "Calculadora de baja laboral: cuánto cobras de baja (incapacidad temporal)",
    breadcrumb: "Baja laboral",
    appName: "Calculadora de baja laboral (incapacidad temporal)",
  },
  ca: {
    title: "Calculadora de baixa laboral: quant cobres de baixa",
    description: "Calcula quant cobres de baixa per malaltia o accident: 60 % del dia 4 al 20, 75 % des del 21, qui paga cada dia i els canvis de l'1 de desembre de 2026.",
    h1: "Calculadora de baixa laboral: quant cobres de baixa (incapacitat temporal)",
    breadcrumb: "Baixa laboral",
    appName: "Calculadora de baixa laboral (incapacitat temporal)",
  },
  en: {
    title: "Spain sick pay calculator (baja laboral)",
    description: "Work out your sick pay in Spain: 60% of the daily base from day 4 to 20, 75% from day 21, who pays each day, and the changes from 1 December 2026.",
    h1: "Spain sick pay calculator: what you get on sick leave (baja laboral)",
    breadcrumb: "Sick pay",
    appName: "Spain sick pay calculator (incapacidad temporal)",
  },
};

export function sickLeaveCrumbs(locale: SlLocale): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    hubCrumb(locale),
    { label: SL_META[locale].breadcrumb, href: sickLeavePath(locale) },
  ];
}

export function sickLeaveMetadata(locale: SlLocale): Metadata {
  const m = SL_META[locale];
  return buildMetadata({ locale, path: sickLeavePath(locale), title: m.title, description: m.description, translations: sickLeaveEditions() });
}

/** The day-by-day schedule of one kind of leave (30 days is enough to show every band; the last one runs on). */
export function schedule(contingency: Contingency, special: SpecialKind, start: string): Band[] {
  return calculateSickLeave({ ...DEFAULT_INPUT, contingency, special, start, days: 30 }).bands;
}

function daysLabel(b: Band, last: boolean, locale: SlLocale): string {
  if (!last) return bandDays(b, locale);
  return L(locale, { es: `Desde el día ${b.from}`, ca: `Des del dia ${b.from}`, en: `From day ${b.from}` });
}

function ScheduleTable({ bands, locale, caption }: { bands: Band[]; locale: SlLocale; caption: string }) {
  const t = CALC_COPY[locale];
  return (
    <div className="ci-table-scroll mt-4">
      <table className="ci-local-table ci-stack-table">
        <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{t.cols.days}</th>
            <th scope="col">{t.cols.pct}</th>
            <th scope="col">{t.cols.payer}</th>
          </tr>
        </thead>
        <tbody>
          {bands.map((b, i) => (
            <tr key={b.from}>
              <th scope="row" className="font-normal">
                {daysLabel(b, i === bands.length - 1, locale)}
              </th>
              <td data-label={t.cols.pct} className="tabular-nums">
                {b.kind === "benefit" ? percent(b.pct, locale, 0) : b.kind === "salary" ? L(locale, { es: "Salario", ca: "Salari", en: "Salary" }) : percent(0, locale, 0)}
              </td>
              <td data-label={t.cols.payer}>{payerText(b, locale)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SickLeaveRoute({ locale }: { locale: SlLocale }) {
  const meta = SL_META[locale];
  const crumbs = sickLeaveCrumbs(locale);
  const ex = defaultExample();
  const m = (v: number, d: 0 | 2 = 2) => money(v, locale, d);
  const pc = (v: number) => percent(v, locale, 0);
  const asOf = dayMonthYear(RULES_AS_OF, locale);
  const reform = dayMonthYear(REFORM_FROM, locale);
  const exStart = dayMonthYear(DEFAULT_INPUT.start, locale);
  const exBand = (from: number) => ex.bands.find((b) => b.from === from)!;
  // A baja on 1 December 2026: the October base now; under the old rule (the month before) it would have been November's.
  const newRef = referenceMonth(REFORM_FROM);
  const oldRef = newRef.month === 12 ? { year: newRef.year + 1, month: 1 } : { year: newRef.year, month: newRef.month + 1 };

  const lead = L(locale, {
    es: `De baja por enfermedad común o accidente no laboral cobras el ${pc(PCT.early)} de tu base reguladora del día 4 al 20 y el ${pc(PCT.standard)} desde el día 21; los tres primeros días no hay prestación, salvo que tu convenio los pague. Del día 4 al 15 la paga la empresa y desde el 16, el INSS o la mutua (aunque la sigues cobrando en la nómina). Si es accidente de trabajo o enfermedad profesional, el ${pc(PCT.standard)} desde el día siguiente a la baja. Ejemplo: con una base de ${m(DEFAULT_INPUT.base, 0)} (${m(ex.dailyBase)} al día), ${DEFAULT_INPUT.days} días de baja desde el ${exStart} suman ${m(ex.totals.total)} brutos.`,
    ca: `De baixa per malaltia comuna o accident no laboral cobres el ${pc(PCT.early)} de la teva base reguladora del dia 4 al 20 i el ${pc(PCT.standard)} des del dia 21; els tres primers dies no hi ha prestació, llevat que el teu conveni els pagui. Del dia 4 al 15 la paga l'empresa i des del 16, l'INSS o la mútua (encara que la continues cobrant a la nòmina). Si és accident de treball o malaltia professional, el ${pc(PCT.standard)} des de l'endemà de la baixa. Exemple: amb una base de ${m(DEFAULT_INPUT.base, 0)} (${m(ex.dailyBase)} al dia), ${DEFAULT_INPUT.days} dies de baixa des de l'${exStart} sumen ${m(ex.totals.total)} bruts.`,
    en: `On sick leave for an ordinary illness or a non-work accident you get ${pc(PCT.early)} of your daily base (base reguladora) from day 4 to day 20 and ${pc(PCT.standard)} from day 21; there is no benefit for the first three days unless your collective agreement pays them. From day 4 to 15 your employer bears it, and from day 16 the INSS or the mutua (though it still comes with your salary). For a work accident or occupational disease, ${pc(PCT.standard)} from the day after the leave starts. Example: on a ${m(DEFAULT_INPUT.base, 0)} base (${m(ex.dailyBase)} a day), ${DEFAULT_INPUT.days} days of leave from ${exStart} come to ${m(ex.totals.total)} gross.`,
  });
  const fresh = L(locale, {
    es: `Normas revisadas el ${asOf} en el BOE (Ley General de la Seguridad Social, Real Decreto-ley 31/2026) y en la Seguridad Social.`,
    ca: `Normes revisades el ${asOf} al BOE (Llei general de la Seguretat Social, Reial decret llei 31/2026) i a la Seguretat Social.`,
    en: `Rules checked on ${asOf} in the BOE (General Social Security Act, Royal Decree-law 31/2026) and with Social Security.`,
  });

  const h = L(locale, {
    es: { pct: "Cuánto se cobra de baja, día a día", reform: `Qué cambia el ${reform}`, base: "Cómo se calcula la base reguladora", special: "Situaciones especiales: menstruación, embarazo, menopausia, violencia de género y donación", duration: "Cuánto puede durar la baja", pay: "Quién paga y cuándo cobras", tax: "IRPF y cotización durante la baja", convenio: "Complementos del convenio", faq: "Preguntas frecuentes", sources: "Fuentes", limits: "Qué no incluye" },
    ca: { pct: "Quant es cobra de baixa, dia a dia", reform: `Què canvia l'${reform}`, base: "Com es calcula la base reguladora", special: "Situacions especials: menstruació, embaràs, menopausa, violència de gènere i donació", duration: "Quant pot durar la baixa", pay: "Qui paga i quan cobres", tax: "IRPF i cotització durant la baixa", convenio: "Complements del conveni", faq: "Preguntes freqüents", sources: "Fonts", limits: "Què no inclou" },
    en: { pct: "What you get on sick leave, day by day", reform: `What changes on ${reform}`, base: "How the daily base (base reguladora) is worked out", special: "Special cases: menstruation, pregnancy, menopause, gender violence and donation", duration: "How long sick leave can last", pay: "Who pays, and when", tax: "Income tax and contributions during sick leave", convenio: "Collective agreement top-ups", faq: "Questions", sources: "Sources", limits: "What it leaves out" },
  });

  const captions = L(locale, {
    es: { common: "Enfermedad común o accidente no laboral (Ley General de la Seguridad Social, art. 173.1; Real Decreto 53/1980)", professional: "Accidente de trabajo o enfermedad profesional (Ley General de la Seguridad Social, art. 173.1; Decreto 3158/1966, art. 2)" },
    ca: { common: "Malaltia comuna o accident no laboral (Llei general de la Seguretat Social, art. 173.1; Reial decret 53/1980)", professional: "Accident de treball o malaltia professional (Llei general de la Seguretat Social, art. 173.1; Decret 3158/1966, art. 2)" },
    en: { common: "Ordinary illness or non-work accident (General Social Security Act, art. 173.1; Royal Decree 53/1980)", professional: "Work accident or occupational disease (General Social Security Act, art. 173.1; Decreto 3158/1966, art. 2)" },
  });
  const pctText = L(locale, {
    es: [
      `El día 1 es el de la baja. Los porcentajes se aplican a la base reguladora diaria y se cobran todos los días naturales, también sábados, domingos y festivos. En enfermedad común, los días 1 a 3 no hay prestación de la Seguridad Social: si los cobras, es porque lo dice tu convenio o tu contrato.`,
      `En el ejemplo de arriba (${m(ex.dailyBase)} al día): del día 4 al 15, ${exBand(4).days} días al ${pc(PCT.early)} = ${m(exBand(4).amount)} a cargo de la empresa; del 16 al 20, ${exBand(16).days} días = ${m(exBand(16).amount)}; del 21 al 30, ${exBand(21).days} días al ${pc(PCT.standard)} = ${m(exBand(21).amount)}, a cargo del INSS o la mutua. Total: ${m(ex.totals.total)}.`,
    ],
    ca: [
      `El dia 1 és el de la baixa. Els percentatges s'apliquen a la base reguladora diària i es cobren tots els dies naturals, també dissabtes, diumenges i festius. En malaltia comuna, els dies 1 a 3 no hi ha prestació de la Seguretat Social: si els cobres, és perquè ho diu el teu conveni o el teu contracte.`,
      `En l'exemple de dalt (${m(ex.dailyBase)} al dia): del dia 4 al 15, ${exBand(4).days} dies al ${pc(PCT.early)} = ${m(exBand(4).amount)} a càrrec de l'empresa; del 16 al 20, ${exBand(16).days} dies = ${m(exBand(16).amount)}; del 21 al 30, ${exBand(21).days} dies al ${pc(PCT.standard)} = ${m(exBand(21).amount)}, a càrrec de l'INSS o la mútua. Total: ${m(ex.totals.total)}.`,
    ],
    en: [
      `Day 1 is the day the leave starts. The percentages apply to the daily base and are paid for every calendar day, weekends and holidays included. For an ordinary illness, days 1 to 3 carry no Social Security benefit: if you are paid for them, it is because your collective agreement or contract says so.`,
      `In the example above (${m(ex.dailyBase)} a day): days 4 to 15, ${exBand(4).days} days at ${pc(PCT.early)} = ${m(exBand(4).amount)}, borne by the employer; days 16 to 20, ${exBand(16).days} days = ${m(exBand(16).amount)}; days 21 to 30, ${exBand(21).days} days at ${pc(PCT.standard)} = ${m(exBand(21).amount)}, borne by the INSS or the mutua. Total: ${m(ex.totals.total)}.`,
    ],
  });

  const reformText = L(locale, {
    es: {
      intro: `El Real Decreto-ley 31/2026, de 20 de octubre (BOE del 21 de octubre), cambia la incapacidad temporal desde el ${reform}. Los porcentajes, los días a cargo de la empresa y la duración máxima no cambian. Cambia esto:`,
      items: [
        `La base: para las bajas desde el ${reform} cuenta la del mes anterior al anterior. Una baja que empieza el ${reform} se calcula con la base ${ofMonthYear(newRef, "es")}; con la regla anterior (el mes anterior a la baja) habría sido la ${ofMonthYear(oldRef, "es")}.`,
        "Dos situaciones especiales nuevas: el trastorno menopáusico secundario codificado y las lesiones causadas por violencia de género, que se suman a la menstruación incapacitante, la interrupción del embarazo, la gestación desde la semana 39 y la donación de órganos.",
        "Todas las situaciones especiales se cobran desde el día siguiente a la baja, y el día de la baja la empresa paga el salario íntegro. Hasta ahora, la menstruación incapacitante y la donación se cobraban desde el mismo día de la baja.",
      ],
      transitional: "Para las situaciones especiales, la norma dice expresamente que se aplica a las bajas que empiezan después:",
      status: `Un real decreto-ley tiene que ser convalidado por el Congreso (Constitución, art. 86). A ${asOf}, el BOE no ha publicado su convalidación. Si el Congreso lo deroga, esta página volverá a las normas anteriores.`,
    },
    ca: {
      intro: `El Reial decret llei 31/2026, de 20 d'octubre (BOE del 21 d'octubre), canvia la incapacitat temporal des de l'${reform}. Els percentatges, els dies a càrrec de l'empresa i la durada màxima no canvien. Canvia això:`,
      items: [
        `La base: per a les baixes des de l'${reform} compta la del mes anterior a l'anterior. Una baixa que comença l'${reform} es calcula amb la base ${ofMonthYear(newRef, "ca")}; amb la regla anterior (el mes anterior a la baixa) hauria estat la ${ofMonthYear(oldRef, "ca")}.`,
        "Dues situacions especials noves: el trastorn menopàusic secundari codificat i les lesions causades per violència de gènere, que se sumen a la menstruació incapacitant, la interrupció de l'embaràs, la gestació des de la setmana 39 i la donació d'òrgans.",
        "Totes les situacions especials es cobren des de l'endemà de la baixa, i el dia de la baixa l'empresa paga el salari íntegre. Fins ara, la menstruació incapacitant i la donació es cobraven des del mateix dia de la baixa.",
      ],
      transitional: "Per a les situacions especials, la norma diu expressament que s'aplica a les baixes que comencen després:",
      status: `Un reial decret llei ha de ser convalidat pel Congrés (Constitució, art. 86). A ${asOf}, el BOE no n'ha publicat la convalidació. Si el Congrés el deroga, aquesta pàgina tornarà a les normes anteriors.`,
    },
    en: {
      intro: `Royal Decree-law 31/2026 of 20 October (BOE, 21 October) changes sick leave (incapacidad temporal) from ${reform}. The percentages, the employer's days and the maximum length do not change. This does:`,
      items: [
        `The base: for leave starting on or after ${reform}, the month before last counts. Leave starting on ${reform} uses the ${monthYear(newRef, "en")} base; under the old rule (the month before the leave) it would have been ${monthYear(oldRef, "en")}'s.`,
        "Two new special cases: a coded secondary menopausal disorder, and injuries caused by gender violence, alongside incapacitating menstruation, termination of pregnancy, pregnancy from week 39 and organ donation.",
        "Every special case is paid from the day after the leave starts, with the employer paying that first day's full salary. Until now, incapacitating menstruation and donation were paid from the first day.",
      ],
      transitional: "For the special cases, the decree says expressly that it applies to leave starting afterwards:",
      status: `A royal decree-law must be ratified by Congress (Constitution, art. 86). As of ${asOf}, the BOE has published no ratification. If Congress rejects it, this page will go back to the previous rules.`,
    },
  });

  const baseText = L(locale, {
    es: [
      `La base reguladora diaria es la base de cotización por contingencias comunes del mes que toca dividida entre los días a los que se refiere: entre 30 si cobras un sueldo mensual y estuviste de alta todo el mes. La base está en tu nómina («base de contingencias comunes») e incluye la parte proporcional de las pagas extra; nunca pasa de ${m(MAX_BASE_2026)} al mes en 2026 (Orden PJC/297/2026, art. 2.1).`,
      `En accidente de trabajo o enfermedad profesional se usa la base de contingencias profesionales sin horas extra, dividida igual, más las horas extra cotizadas el año anterior divididas entre 365. Si entraste en la empresa el mes anterior a la baja o el mismo mes, se usa la base de esos días.`,
      `Hasta el 30 de noviembre de 2026 lo dice el Decreto 1646/1972 (art. 13):`,
      `Desde el ${reform}, la Ley General de la Seguridad Social (art. 171.2, redacción del Real Decreto-ley 31/2026):`,
    ],
    ca: [
      `La base reguladora diària és la base de cotització per contingències comunes del mes que toca dividida entre els dies als quals es refereix: entre 30 si cobres un sou mensual i vas estar d'alta tot el mes. La base és a la teva nòmina («base de contingències comunes») i inclou la part proporcional de les pagues extra; mai passa de ${m(MAX_BASE_2026)} al mes el 2026 (Ordre PJC/297/2026, art. 2.1).`,
      `En accident de treball o malaltia professional es fa servir la base de contingències professionals sense hores extra, dividida igual, més les hores extra cotitzades l'any anterior dividides entre 365. Si vas entrar a l'empresa el mes anterior a la baixa o el mateix mes, es fa servir la base d'aquells dies.`,
      `Fins al 30 de novembre de 2026 ho diu el Decret 1646/1972 (art. 13):`,
      `Des de l'${reform}, la Llei general de la Seguretat Social (art. 171.2, redacció del Reial decret llei 31/2026):`,
    ],
    en: [
      `The daily base (base reguladora) is the month's common-contingencies contribution base divided by the days it covers: by 30 if you are paid monthly and were registered the whole month. The base is on your payslip ("base de contingencias comunes") and includes the share of extra payments; it never exceeds ${m(MAX_BASE_2026)} a month in 2026 (Orden PJC/297/2026, art. 2.1).`,
      `For a work accident or occupational disease, the professional-contingencies base without overtime is used, divided the same way, plus last year's contributed overtime divided by 365. If you joined the company in the month before the leave or the same month, the base of those days is used.`,
      `Until 30 November 2026, Decreto 1646/1972 (art. 13) sets it:`,
      `From ${reform}, the General Social Security Act (art. 171.2, as worded by Royal Decree-law 31/2026):`,
    ],
  });

  const specialRows: { kind: SpecialKind; label: string }[] = (["menstruation", "pregnancy", "menopause", "violence", "donation"] as SpecialKind[]).map((k) => ({ kind: k, label: CALC_COPY[locale].specialOptions[k] }));
  const describe = (bands: Band[]): string =>
    bands
      .map((b, i) => {
        const days = daysLabel(b, i === bands.length - 1, locale);
        const what = b.kind === "benefit" ? pc(b.pct) : b.kind === "salary" ? L(locale, { es: "salario (empresa)", ca: "salari (empresa)", en: "salary (employer)" }) : L(locale, { es: "nada", ca: "res", en: "nothing" });
        return `${days}: ${what}`;
      })
      .join("; ");
  const specialCols = L(locale, {
    es: ["Situación", "Bajas hasta el 30-11-2026", `Bajas desde el ${dayMonthYear(REFORM_FROM, "es")}`],
    ca: ["Situació", "Baixes fins al 30-11-2026", `Baixes des de l'${dayMonthYear(REFORM_FROM, "ca")}`],
    en: ["Case", "Leave up to 30 Nov 2026", `Leave from ${dayMonthYear(REFORM_FROM, "en")}`],
  });
  const notYet = L(locale, { es: "Como enfermedad común", ca: "Com a malaltia comuna", en: "As ordinary illness" });
  const specialText = L(locale, {
    es: [
      "En estas situaciones no se exige cotización previa (salvo en la gestación desde la semana 39, que pide la del permiso por nacimiento) y la prestación la paga la entidad que cubre tus contingencias comunes, INSS o mutua, desde el primer día de prestación. La cuantía es la de la enfermedad común (el 100 % en la donación), con estos tramos según la Seguridad Social:",
      "La baja desde la semana 39 de gestación dura hasta el parto. Cada baja por menstruación incapacitante cuenta como un proceso nuevo, sin sumar para la duración máxima.",
    ],
    ca: [
      "En aquestes situacions no s'exigeix cotització prèvia (llevat de la gestació des de la setmana 39, que demana la del permís per naixement) i la prestació la paga l'entitat que cobreix les teves contingències comunes, INSS o mútua, des del primer dia de prestació. La quantia és la de la malaltia comuna (el 100 % en la donació), amb aquests trams segons la Seguretat Social:",
      "La baixa des de la setmana 39 de gestació dura fins al part. Cada baixa per menstruació incapacitant compta com un procés nou, sense sumar per a la durada màxima.",
    ],
    en: [
      "These cases need no prior contributions (except pregnancy from week 39, which asks for the birth-leave ones), and the benefit is paid by whoever covers your common contingencies, the INSS or a mutua, from the first day of benefit. The amount is that of ordinary illness (100% for donation), in these bands according to Social Security:",
      "Leave from week 39 of pregnancy lasts until the birth. Each incapacitating-menstruation leave counts as a new process and does not add to the maximum length.",
    ],
  });

  const durationText = L(locale, {
    es: `La baja dura como máximo ${DAYS.ordinaryMax} días, prorrogables ${DAYS.extension} más (solo la inspección médica del INSS puede dar la prórroga y el alta a partir del día 365). El derecho a la prestación se acaba, como muy tarde, a los ${DAYS.absoluteMax} días naturales desde la baja; las recaídas por la misma o similar dolencia en los 180 días siguientes al alta suman para ese límite (Ley General de la Seguridad Social, arts. 169, 170 y 174).`,
    ca: `La baixa dura com a màxim ${DAYS.ordinaryMax} dies, prorrogables ${DAYS.extension} més (només la inspecció mèdica de l'INSS pot donar la pròrroga i l'alta a partir del dia 365). El dret a la prestació s'acaba, com a molt tard, als ${DAYS.absoluteMax} dies naturals des de la baixa; les recaigudes per la mateixa malaltia o una de similar en els 180 dies següents a l'alta sumen per a aquest límit (Llei general de la Seguretat Social, arts. 169, 170 i 174).`,
    en: `Sick leave lasts at most ${DAYS.ordinaryMax} days, extendable by ${DAYS.extension} (from day 365 only the INSS's medical inspectors can extend it or sign you off). The right to the benefit ends at the latest ${DAYS.absoluteMax} calendar days after the leave started; relapses for the same or a similar condition within 180 days of being signed off count towards that limit (General Social Security Act, arts. 169, 170 and 174).`,
  });

  const payText = L(locale, {
    es: "Aunque una parte la pague el INSS o la mutua, la cobras normalmente en tu nómina: la empresa la adelanta en «pago delegado» y luego la compensa en sus cotizaciones. Los días 4 a 15 de una enfermedad común son coste de la empresa; desde el día 16, del INSS o de la mutua. En accidente de trabajo o enfermedad profesional, de la mutua o del INSS que cubra esas contingencias.",
    ca: "Encara que una part la pagui l'INSS o la mútua, la cobres normalment a la nòmina: l'empresa l'avança en «pagament delegat» i després la compensa en les seves cotitzacions. Els dies 4 a 15 d'una malaltia comuna són cost de l'empresa; des del dia 16, de l'INSS o de la mútua. En accident de treball o malaltia professional, de la mútua o de l'INSS que cobreixi aquestes contingències.",
    en: "Even when the INSS or the mutua bears part of it, you normally get it on your payslip: your employer advances it ('pago delegado') and then offsets it against its contributions. Days 4 to 15 of an ordinary illness are the employer's cost; from day 16, the INSS's or the mutua's. For a work accident or occupational disease, the mutua's or the INSS's, whichever covers those contingencies.",
  });

  const taxText = L(locale, {
    es: "La prestación es rendimiento del trabajo en el IRPF, como el sueldo: tributa y se le aplica retención. Durante la baja sigues de alta y cotizando (Ley General de la Seguridad Social, art. 144.4), así que la nómina sigue descontando tu parte de cotización. Los importes de esta calculadora son brutos.",
    ca: "La prestació és rendiment del treball a l'IRPF, com el sou: tributa i se li aplica retenció. Durant la baixa continues d'alta i cotitzant (Llei general de la Seguretat Social, art. 144.4), així que la nòmina continua descomptant la teva part de cotització. Els imports d'aquesta calculadora són bruts.",
    en: "For income tax (IRPF) the benefit is employment income, like your salary: it is taxed and tax is withheld from it. During the leave you stay registered and keep contributing (General Social Security Act, art. 144.4), so your payslip still deducts your share of contributions. The calculator's amounts are gross.",
  });

  const convenioText = L(locale, {
    es: "Muchos convenios colectivos obligan a la empresa a completar la prestación, por ejemplo hasta el 100 % del salario desde el primer día o desde un día concreto. No hay una regla general: depende de tu convenio o tu contrato, y por eso la calculadora te deja escribir el porcentaje y el día en que empieza. Ese complemento lo paga siempre la empresa y también tributa en el IRPF.",
    ca: "Molts convenis col·lectius obliguen l'empresa a completar la prestació, per exemple fins al 100 % del salari des del primer dia o des d'un dia concret. No hi ha una regla general: depèn del teu conveni o del teu contracte, i per això la calculadora et deixa escriure el percentatge i el dia en què comença. Aquest complement el paga sempre l'empresa i també tributa a l'IRPF.",
    en: "Many collective agreements (convenios) require the employer to top up the benefit, for example to 100% of salary from the first day or from a given day. There is no general rule: it depends on your agreement or contract, which is why the calculator lets you enter the percentage and the day it starts. The top-up is always paid by the employer and is also taxed.",
  });

  const faq = L(locale, {
    es: [
      { q: "¿Cuánto se cobra de baja por enfermedad común?", a: `Nada los días 1 a 3 (salvo convenio), el ${pc(PCT.early)} de la base reguladora del día 4 al 20 y el ${pc(PCT.standard)} desde el día 21. Con una base de ${m(DEFAULT_INPUT.base, 0)}, ${m(ex.dailyBase)} al día: ${m(ex.dailyBase * 0.6)} al día del 4 al 20 y ${m(ex.dailyBase * 0.75)} desde el 21.` },
      { q: "¿Y por accidente de trabajo?", a: `El día del accidente la empresa te paga el salario íntegro; desde el día siguiente cobras el ${pc(PCT.standard)} de la base reguladora, a cargo de la mutua o del INSS, sin periodo previo de cotización.` },
      { q: "¿Quién paga la baja, la empresa o la Seguridad Social?", a: `En enfermedad común, la empresa los días 4 a 15 y el INSS o la mutua desde el día 16. Pero normalmente lo cobras todo en la nómina: la empresa lo adelanta (pago delegado).` },
      { q: "¿Se cobran los tres primeros días de baja?", a: "No de la Seguridad Social, en enfermedad común o accidente no laboral. Solo si tu convenio colectivo o tu contrato lo prevén." },
      { q: `¿Qué cambia en las bajas desde el ${reform}?`, a: `${reformText.items[0]} ${reformText.items[2]}` },
      { q: "¿La baja tributa en el IRPF?", a: "Sí. Es rendimiento del trabajo (Ley del IRPF, art. 17.2.a), se le aplica retención y va en la declaración de la Renta como el sueldo." },
      { q: "¿Cuánto puede durar una baja?", a: durationText },
    ],
    ca: [
      { q: "Quant es cobra de baixa per malaltia comuna?", a: `Res els dies 1 a 3 (llevat de conveni), el ${pc(PCT.early)} de la base reguladora del dia 4 al 20 i el ${pc(PCT.standard)} des del dia 21. Amb una base de ${m(DEFAULT_INPUT.base, 0)}, ${m(ex.dailyBase)} al dia: ${m(ex.dailyBase * 0.6)} al dia del 4 al 20 i ${m(ex.dailyBase * 0.75)} des del 21.` },
      { q: "I per accident de treball?", a: `El dia de l'accident l'empresa et paga el salari íntegre; des de l'endemà cobres el ${pc(PCT.standard)} de la base reguladora, a càrrec de la mútua o de l'INSS, sense període previ de cotització.` },
      { q: "Qui paga la baixa, l'empresa o la Seguretat Social?", a: `En malaltia comuna, l'empresa els dies 4 a 15 i l'INSS o la mútua des del dia 16. Però normalment ho cobres tot a la nòmina: l'empresa ho avança (pagament delegat).` },
      { q: "Es cobren els tres primers dies de baixa?", a: "No de la Seguretat Social, en malaltia comuna o accident no laboral. Només si el teu conveni col·lectiu o el teu contracte ho preveuen." },
      { q: `Què canvia en les baixes des de l'${reform}?`, a: `${reformText.items[0]} ${reformText.items[2]}` },
      { q: "La baixa tributa a l'IRPF?", a: "Sí. És rendiment del treball (Llei de l'IRPF, art. 17.2.a), se li aplica retenció i va a la declaració de la renda com el sou." },
      { q: "Quant pot durar una baixa?", a: durationText },
    ],
    en: [
      { q: "How much is sick pay for an ordinary illness in Spain?", a: `Nothing for days 1 to 3 (unless your agreement pays), ${pc(PCT.early)} of the daily base from day 4 to 20 and ${pc(PCT.standard)} from day 21. On a ${m(DEFAULT_INPUT.base, 0)} base, ${m(ex.dailyBase)} a day: ${m(ex.dailyBase * 0.6)} a day from day 4 to 20 and ${m(ex.dailyBase * 0.75)} from day 21.` },
      { q: "And for a work accident?", a: `Your employer pays your full salary for the day of the accident; from the next day you get ${pc(PCT.standard)} of the daily base, from the mutua or the INSS, with no minimum contribution period.` },
      { q: "Who pays sick leave, the employer or Social Security?", a: "For an ordinary illness, the employer from day 4 to 15 and the INSS or the mutua from day 16. But you normally get all of it on your payslip: the employer advances it (pago delegado)." },
      { q: "Are the first three days paid?", a: "Not by Social Security, for an ordinary illness or a non-work accident. Only if your collective agreement or contract says so." },
      { q: `What changes for leave starting from ${reform}?`, a: `${reformText.items[0]} ${reformText.items[2]}` },
      { q: "Is sick pay taxed?", a: "Yes. It is employment income (Income Tax Act, art. 17.2.a), tax is withheld from it, and it goes on your Renta return like your salary." },
      { q: "How long can sick leave last?", a: durationText },
    ],
  });

  const sourceList = [SOURCES.lgss, SOURCES.rdl31, SOURCES.d3158, SOURCES.rd53, SOURCES.d1646, SOURCES.orden1967, SOURCES.orden2026, SOURCES.irpf, SOURCES.ssInfo, SOURCES.ssAmount];
  const sourcesLead = L(locale, {
    es: `Solo fuentes oficiales, leídas el ${asOf}. Las citas son del BOE y de la Seguridad Social. Las páginas de la Seguridad Social aún no recogen los cambios del ${reform}.`,
    ca: `Només fonts oficials, llegides el ${asOf}. Les cites són del BOE i de la Seguretat Social. Les pàgines de la Seguretat Social encara no recullen els canvis de l'${reform}.`,
    en: `Official sources only, read on ${asOf}. Quotes are from the BOE and Social Security (in Spanish). Social Security's pages do not show the ${reform} changes yet.`,
  });
  const limits = L(locale, {
    es: [
      "Contratos a tiempo parcial y fijos discontinuos (la base es el promedio de varios meses) y quien entró en la empresa el mes de la baja o el anterior.",
      "Recaídas (se suman a la baja anterior) y bajas que empezaron antes del 1 de diciembre de 2026 y siguen después.",
      "Pluriempleo, empleadas de hogar, autónomos y regímenes especiales (mar, agrario, funcionarios de mutualidades).",
      "El requisito de 180 días cotizados en los últimos cinco años para la enfermedad común: la calculadora supone que lo cumples.",
      "La retención de IRPF y tu cotización: los importes son brutos.",
    ],
    ca: [
      "Contractes a temps parcial i fixos discontinus (la base és la mitjana de diversos mesos) i qui va entrar a l'empresa el mes de la baixa o l'anterior.",
      "Recaigudes (se sumen a la baixa anterior) i baixes que van començar abans de l'1 de desembre de 2026 i continuen després.",
      "Pluriocupació, treballadores de la llar, autònoms i règims especials (mar, agrari, funcionaris de mutualitats).",
      "El requisit de 180 dies cotitzats en els últims cinc anys per a la malaltia comuna: la calculadora suposa que el compleixes.",
      "La retenció d'IRPF i la teva cotització: els imports són bruts.",
    ],
    en: [
      "Part-time and fijo-discontinuo contracts (the base is an average of several months), and anyone who joined the company in the month of the leave or the month before.",
      "Relapses (they add to the earlier leave) and leave that started before 1 December 2026 and runs past it.",
      "Several jobs at once, domestic workers, the self-employed and special regimes (sea, agrarian, civil servants' mutual societies).",
      "The 180 days of contributions in the last five years required for ordinary illness: the calculator assumes you meet it.",
      "Income tax withholding and your contributions: amounts are gross.",
    ],
  });

  const appSchema = {
    "@type": "WebApplication",
    name: meta.appName,
    url: absoluteUrl(sickLeavePath(locale)),
    applicationCategory: "FinanceApplication",
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
  const lgss = (art: string) => L(locale, { es: `Ley General de la Seguridad Social, art. ${art}`, ca: `Llei general de la Seguretat Social, art. ${art}`, en: `General Social Security Act, art. ${art}` });

  return (
    <>
      <SiteHeader locale={locale} translations={sickLeaveEditions()} />
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
              <SickLeaveCalculator locale={locale} initial={DEFAULT_INPUT} />

              <h2 id="porcentajes">{h.pct}</h2>
              <p>{pctText[0]}</p>
              <ScheduleTable bands={schedule("common", "menstruation", REFORM_FROM)} locale={locale} caption={captions.common} />
              {quote(QUOTE.lgss173common, SOURCES.lgss.url, `${lgss("173.1")} (${SOURCES.lgss.ref})`)}
              {quote(QUOTE.rd53, SOURCES.rd53.url, `Real Decreto 53/1980, artículo único (${SOURCES.rd53.ref})`)}
              <ScheduleTable bands={schedule("professional", "menstruation", REFORM_FROM)} locale={locale} caption={captions.professional} />
              {quote(QUOTE.lgss173professional, SOURCES.lgss.url, `${lgss("173.1")} (${SOURCES.lgss.ref})`)}
              <p>{pctText[1]}</p>

              <h2 id="cambios-diciembre-2026">{h.reform}</h2>
              <p>{reformText.intro}</p>
              <ul>
                {reformText.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
              <p>{reformText.transitional}</p>
              {quote(QUOTE.rdl31transitional, SOURCES.rdl31.url, `Real Decreto-ley 31/2026, disposición transitoria primera (${SOURCES.rdl31.ref.split(",")[0]})`)}
              <p>{reformText.status}</p>

              <h2 id="base-reguladora">{h.base}</h2>
              <p>{baseText[0]}</p>
              <p>{baseText[1]}</p>
              <p>{baseText[2]}</p>
              {quote(QUOTE.d1646art13, SOURCES.d1646.url, `Decreto 1646/1972, art. 13.1 (${SOURCES.d1646.ref})`)}
              <p>{baseText[3]}</p>
              {quote(QUOTE.lgss171base2026, SOURCES.rdl31.url, `${lgss("171.2")} (Real Decreto-ley 31/2026, art. 1.4)`)}

              <h2 id="situaciones-especiales">{h.special}</h2>
              <p>{specialText[0]}</p>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <thead>
                    <tr>
                      {specialCols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {specialRows.map(({ kind, label }) => {
                      const before = calculateSickLeave({ ...DEFAULT_INPUT, contingency: "special", special: kind, start: BEFORE_REFORM, days: 30 });
                      return (
                        <tr key={kind}>
                          <th scope="row" className="font-normal">
                            {label}
                          </th>
                          <td data-label={specialCols[1]}>{before.specialNotYet ? notYet : describe(before.bands)}</td>
                          <td data-label={specialCols[2]}>{describe(schedule("special", kind, REFORM_FROM))}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {quote(QUOTE.lgss173special2026, SOURCES.rdl31.url, `${lgss("173.1")} (Real Decreto-ley 31/2026, art. 1.6)`)}
              <p>{specialText[1]}</p>

              <h2 id="duracion">{h.duration}</h2>
              <p>{durationText}</p>
              {quote(QUOTE.lgss169duration, SOURCES.lgss.url, `${lgss("169.1.a")} (${SOURCES.lgss.ref})`)}

              <h2 id="quien-paga">{h.pay}</h2>
              <p>{payText}</p>
              {quote(`${QUOTE.ssPayment} […] ${QUOTE.ssFrom16}`, SOURCES.ssInfo.url, `${SOURCES.ssInfo.name} (${dayMonthYear(SOURCES.ssInfo.date, locale)})`)}

              <h2 id="irpf">{h.tax}</h2>
              <p>{taxText}</p>
              {quote(QUOTE.irpf, SOURCES.irpf.url, L(locale, { es: "Ley 35/2006 del IRPF, art. 17.2.a).1.ª", ca: "Llei 35/2006 de l'IRPF, art. 17.2.a).1a", en: "Ley 35/2006 (IRPF), art. 17.2.a).1.ª" }))}

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
                {L(locale, { es: "¿Quieres saber tu sueldo neto?", ca: "Vols saber el teu sou net?", en: "Want your net salary?" })}{" "}
                <Link href={calcPath("net-salary", locale)}>{L(locale, { es: "Calcula tu sueldo neto", ca: "Calcula el teu sou net", en: "Work out your net salary" })}</Link>.
              </p>

              <h2 id="fuentes">{h.sources}</h2>
              <p>{sourcesLead}</p>
              <ul>
                {sourceList.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} rel="noopener" target="_blank">
                      {s.name}
                    </a>{" "}
                    ({s.ref}, {dayMonthYear(s.date, locale)})
                  </li>
                ))}
              </ul>
              <p className="text-sm">
                {L(locale, { es: "Información oficial de la Seguridad Social:", ca: "Informació oficial de la Seguretat Social:", en: "Social Security's own information:" })}{" "}
                <a href={OFFICIAL_LINKS.info} rel="noopener" target="_blank">
                  {SOURCES.ssInfo.name}
                </a>
                .
              </p>

              <h2 id="limites">{h.limits}</h2>
              <ul>
                {limits.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              <p className="text-sm text-[var(--color-muted)]">{CALC_COPY[locale].disclaimer}</p>

              <MoreCalculators current="sick-leave" locale={locale} />
            </div>
            <ShareBar locale={locale} path={sickLeavePath(locale)} title={meta.h1} contentType="sick_leave_calculator" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), appSchema, faqSchema])} />
      <SiteFooter locale={locale} />
    </>
  );
}

/** For the tests: the default example the page's lead is written from. */
export function defaultExample(): SickLeaveResult {
  return calculateSickLeave(DEFAULT_INPUT);
}
